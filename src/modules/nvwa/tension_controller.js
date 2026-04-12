/**
 * 张力控制器 - Tension Controller
 * 
 * 控制叙事节奏，影响 AI 生成风格
 * 参考 v1.2 文档 3.3.3 PACING_RULES
 */

const TENSION = {
  VERY_LOW: 20,
  LOW: 35,
  MEDIUM: 50,
  HIGH: 65,
  VERY_HIGH: 80
};

const PACING_RULES = {
  [TENSION.VERY_LOW]: '【叙事节奏：极缓】当前处于非冲突或试探阶段。请使用长句，着重描写环境的光影、角色的细微动作和复杂的心理活动，留出充分的呼吸感。',
  [TENSION.LOW]: '【叙事节奏：缓】保持细腻的环境描写和角色内心描写。',
  [TENSION.MEDIUM]: '【叙事节奏：正常】保持动作与对白的平衡推演。',
  [TENSION.HIGH]: '【叙事节奏：快】加快节奏，动作与对白紧凑，减少冗余描写。',
  [TENSION.VERY_HIGH]: '【叙事节奏：极快】当前处于极度高压或爆发阶段！禁止冗长的景物描写！使用极短、急促的句子。只专注致命的动作交锋、本能反应和情绪爆发，营造窒息感！'
};

class TensionController {
  constructor() {
    this.tension = TENSION.MEDIUM;
    this.tensionReason = '';
    this.history = [];
    this.maxHistory = 20;
  }

  /**
   * 获取当前张力
   */
  getTension() {
    return this.tension;
  }

  /**
   * 获取叙事节奏规则
   */
  getPacingRule() {
    return this.getPacingForTension(this.tension);
  }

  /**
   * 根据张力值获取节奏规则
   */
  getPacingForTension(tension) {
    if (tension <= TENSION.VERY_LOW) return PACING_RULES[TENSION.VERY_LOW];
    if (tension <= TENSION.LOW) return PACING_RULES[TENSION.LOW];
    if (tension <= TENSION.MEDIUM) return PACING_RULES[TENSION.MEDIUM];
    if (tension <= TENSION.HIGH) return PACING_RULES[TENSION.HIGH];
    return PACING_RULES[TENSION.VERY_HIGH];
  }

  /**
   * 计算张力
   * 基于角色关系和事件
   */
  calculate(worldVars = {}, characters = [], lastEvent = null) {
    let tension = worldVars.tension || TENSION.MEDIUM;
    let reason = '世界基础张力';
    
    // 根据角色关系调整
    if (characters.length >= 2) {
      let maxHostility = 0;
      let closeRelations = 0;
      
      for (const char of characters) {
        const rels = char.relationships || [];
        for (const rel of rels) {
          if (rel.value < -30) {
            maxHostility = Math.max(maxHostility, Math.abs(rel.value));
          }
          if (rel.value > 50) {
            closeRelations++;
          }
        }
      }
      
      // 敌对关系增加张力
      tension += maxHostility * 0.1;
      
      // 亲密关系降低张力
      tension -= closeRelations * 5;
    }
    
    // 根据世界变量
    tension += (worldVars.chaos || 0) * 0.2;
    tension += (worldVars.tension || 0) * 0.3;
    
    // 根据上次事件
    if (lastEvent) {
      if (lastEvent.temperature > 0.7) {
        tension += 10;
        reason = '高热度事件';
      } else if (lastEvent.temperature < 0.3) {
        tension -= 5;
        reason = '低热度事件';
      }
    }
    
    // 限制范围
    tension = Math.max(0, Math.min(100, tension));
    
    this.tension = tension;
    this.tensionReason = reason;
    
    return { tension, reason };
  }

  /**
   * 更新世界张力变量
   */
  updateWorldVars(db, delta = 0) {
    try {
      const current = db.prepare("SELECT value FROM nvwa_world_vars WHERE `key` = 'tension'").get();
      if (current) {
        const newValue = Math.max(0, Math.min(100, (current.value || 50) + delta));
        db.prepare("UPDATE nvwa_world_vars SET value = ?, updatedAt = CURRENT_TIMESTAMP WHERE `key` = 'tension'")
          .run(newValue);
        return newValue;
      }
    } catch (e) {
      console.error('Update tension error:', e);
    }
    return TENSION.MEDIUM;
  }

  /**
   * 记录张力历史
   */
  record(tension, reason = '') {
    this.history.push({
      tension,
      reason,
      timestamp: Date.now()
    });
    
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  /**
   * 获取张力历史
   */
  getHistory(limit = 10) {
    return this.history.slice(-limit);
  }

  /**
   * 构建张力提示词
   */
  buildTensionCue(worldVars = {}, characters = []) {
    const { tension, reason } = this.calculate(worldVars, characters);
    const pacing = this.getPacingForTension(tension);
    
    let cue = pacing;
    
    if (characters.length >= 2) {
      cue += `\n【当前焦点】${characters[0].name} 与 ${characters[1].name}`;
    }
    
    cue += `\n【张力值】${tension.toFixed(0)}/100 (${reason})`;
    
    return cue;
  }
}

module.exports = new TensionController();
module.exports.TENSION = TENSION;
module.exports.PACING_RULES = PACING_RULES;
