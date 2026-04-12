/**
 * 激活参数系统 - Active Params System
 * 
 * 核心理念：不是预设100个固定属性，而是AI根据场景按需激活
 * 参考 v1.2 文档 3.3 节
 */

const DEFAULT_PARAMS = {
  health: { baseValue: 100, min: 0, max: 100, type: 'vital' },
  sanity: { baseValue: 100, min: 0, max: 100, type: 'mental' },
  wealth: { baseValue: 50, min: 0, max: 100, type: 'social' },
  combat: { baseValue: 50, min: 0, max: 100, type: 'physical' },
  luck: { baseValue: 50, min: 0, max: 100, type: 'meta' },
  fortune: { baseValue: 50, min: 0, max: 100, type: 'meta' },
  charm: { baseValue: 50, min: 0, max: 100, type: 'social' },
  intelligence: { baseValue: 50, min: 0, max: 100, type: 'mental' },
  vitality: { baseValue: 100, min: 0, max: 100, type: 'vital' }
};

const PARAM_TYPES = {
  vital: '基础生命属性',
  mental: '精神状态',
  social: '社会属性',
  physical: '物理能力',
  meta: '元属性（运气、福运）',
  relation: '关系属性',
  state: '临时状态',
  hidden: '隐藏属性'
};

class ActiveParamsSystem {
  constructor() {
    this.unsafeKeys = ['__proto__', 'prototype', 'constructor', 'eval', 'constructor'];
  }

  /**
   * 安全化参数键名
   */
  sanitizeKey(key) {
    const raw = String(key || '').trim();
    if (!raw) return null;
    const compact = raw.replace(/\s+/g, '_').slice(0, 40);
    if (this.unsafeKeys.includes(compact.toLowerCase())) return null;
    return compact;
  }

  /**
   * 初始化角色参数
   */
  initParams(soulData = {}) {
    const activeParams = {};
    
    // 复制默认参数
    for (const [key, config] of Object.entries(DEFAULT_PARAMS)) {
      activeParams[key] = {
        value: config.baseValue,
        baseValue: config.baseValue,
        delta: 0,
        reason: '初始化',
        lastUpdate: Date.now(),
        type: config.type
      };
    }
    
    // 覆盖自定义参数
    if (soulData.attributes) {
      for (const [key, value] of Object.entries(soulData.attributes)) {
        const safeKey = this.sanitizeKey(key);
        if (!safeKey) continue;
        
        if (activeParams[safeKey]) {
          activeParams[safeKey].value = value;
          activeParams[safeKey].baseValue = value;
        } else {
          activeParams[safeKey] = {
            value,
            baseValue: value,
            delta: 0,
            reason: '自定义初始化',
            lastUpdate: Date.now(),
            type: 'state'
          };
        }
      }
    }
    
    return activeParams;
  }

  /**
   * 激活新参数（按场景需求）
   * @param {Object} activeParams - 当前参数
   * @param {string} paramName - 参数名
   * @param {number} initialValue - 初始值
   * @param {string} reason - 激活原因
   * @param {string} type - 参数类型
   */
  activateParam(activeParams, paramName, initialValue = 50, reason = '', type = 'state') {
    const safeName = this.sanitizeKey(paramName);
    if (!safeName) return null;
    
    if (activeParams[safeName]) {
      return activeParams[safeName];
    }
    
    activeParams[safeName] = {
      value: initialValue,
      baseValue: initialValue,
      delta: 0,
      reason: reason || '场景激活',
      lastUpdate: Date.now(),
      type
    };
    
    return activeParams[safeName];
  }

  /**
   * 更新参数值
   */
  updateParam(activeParams, paramName, delta, reason = '') {
    const safeName = this.sanitizeKey(paramName);
    if (!safeName || !activeParams[safeName]) return null;
    
    const param = activeParams[safeName];
    const config = DEFAULT_PARAMS[safeName] || { min: 0, max: 100 };
    const min = config.min ?? 0;
    const max = config.max ?? 100;
    
    param.delta = delta;
    param.value = Math.max(min, Math.min(max, param.value + delta));
    param.reason = reason;
    param.lastUpdate = Date.now();
    
    return param;
  }

  /**
   * AI 分析场景，激活相关参数
   * 根据场景描述推断需要激活哪些参数
   */
  async analyzeAndActivate(activeParams, sceneContext, aiConfig = {}) {
    const activated = [];
    
    // 简单的场景分析规则（后期可接入 AI）
    const contextLower = sceneContext.toLowerCase();
    
    // 战斗场景
    if (/战斗|打架|攻击|受伤|死亡/.test(contextLower)) {
      this.activateParam(activeParams, 'combat', 50, '战斗场景', 'physical');
      if (/流血|受伤|痛苦/.test(contextLower)) {
        this.activateParam(activeParams, 'health', 80, '受伤', 'vital');
      }
      activated.push('combat', 'health');
    }
    
    // 社交场景
    if (/聊天|对话|说服|欺骗|结交|社交/.test(contextLower)) {
      this.activateParam(activeParams, 'charm', 50, '社交场景', 'social');
      activated.push('charm');
    }
    
    // 财富场景
    if (/金钱|财富|购物|赌博|中奖|贫穷/.test(contextLower)) {
      this.activateParam(activeParams, 'wealth', 50, '财富场景', 'social');
      if (/中奖|赌博|继承/.test(contextLower)) {
        this.activateParam(activeParams, 'luck', 50, '好运触发', 'meta');
      }
      activated.push('wealth', 'luck');
    }
    
    // 精神场景
    if (/恐惧|疯狂|悲伤|压力|失眠|噩梦/.test(contextLower)) {
      this.activateParam(activeParams, 'sanity', 100, '精神场景', 'mental');
      if (/崩溃|发疯|失控/.test(contextLower)) {
        this.updateParam(activeParams, 'sanity', -20, '精神受创');
      }
      activated.push('sanity');
    }
    
    // 智慧场景
    if (/思考|推理|调查|学习|研究|智慧/.test(contextLower)) {
      this.activateParam(activeParams, 'intelligence', 50, '智慧场景', 'mental');
      activated.push('intelligence');
    }
    
    // 检查彩蛋：长期低值触发补偿
    this.checkAndTriggerBonus(activeParams);
    
    return { activated, activeParams };
  }

  /**
   * 彩蛋机制：长期极端状态触发补偿
   * 比如运气持续低于 20，自动 +5 补偿
   */
  checkAndTriggerBonus(activeParams) {
    const bonuses = [];
    
    // 运气彩蛋
    if (activeParams.luck && activeParams.luck.value < 20) {
      const bonus = Math.floor((20 - activeParams.luck.value) / 4);
      if (bonus > 0) {
        this.updateParam(activeParams, 'luck', bonus, '彩蛋补偿：长期倒霉触发');
        bonuses.push({ param: 'luck', bonus });
      }
    }
    
    // 健康彩蛋
    if (activeParams.health && activeParams.health.value < 15) {
      this.updateParam(activeParams, 'health', 5, '彩蛋补偿：濒死触发');
      bonuses.push({ param: 'health', bonus: 5 });
    }
    
    return bonuses;
  }

  /**
   * 压缩参数（用于 Prompt）
   * 只传递有变化的参数
   */
  compressForPrompt(activeParams) {
    const compressed = {};
    
    for (const [key, param] of Object.entries(activeParams)) {
      if (param.delta !== 0 || param.value !== param.baseValue) {
        compressed[key] = {
          v: param.value,
          d: param.delta,
          r: param.reason
        };
      }
    }
    
    return compressed;
  }

  /**
   * 构建状态摘要（用于 UI 显示）
   */
  buildStatusSummary(activeParams) {
    const summary = {};
    const importantTypes = ['vital', 'mental', 'social', 'physical', 'meta'];
    
    for (const [key, param] of Object.entries(activeParams)) {
      if (importantTypes.includes(param.type) || param.delta !== 0) {
        summary[key] = param.value;
      }
    }
    
    return summary;
  }

  /**
   * 关系参数：创建两个角色间的关系参数
   */
  createRelationParam(sourceId, targetId, type = 'neutral') {
    const baseValue = type === 'friend' ? 50 : type === 'enemy' ? -50 : 0;
    return {
      sourceId,
      targetId,
      type,
      value: baseValue,
      history: [],
      lastUpdate: Date.now()
    };
  }

  /**
   * 更新关系参数
   */
  updateRelationParam(relParam, delta, reason = '') {
    relParam.value = Math.max(-100, Math.min(100, relParam.value + delta));
    relParam.lastUpdate = Date.now();
    relParam.history.push({
      value: relParam.value,
      delta,
      reason,
      timestamp: Date.now()
    });
    return relParam;
  }
}

module.exports = new ActiveParamsSystem();
