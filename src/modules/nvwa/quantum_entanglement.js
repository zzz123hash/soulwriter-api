/**
 * 量子纠缠推演 - Quantum Entanglement Simulator
 * 
 * 选择最可能互动的角色对
 * 参考 v1.2 文档 3.5 节
 */

class QuantumEntanglement {
  constructor() {
    this.minScore = 10;
  }

  /**
   * 选择最可能互动的角色对
   * 返回最佳 pair 和分数
   */
  selectPair(characters, worldVars = {}, options = {}) {
    if (characters.length < 2) return null;
    
    let bestPair = null;
    let maxScore = -Infinity;
    let bestReason = '';
    
    for (let i = 0; i < characters.length; i++) {
      for (let j = i + 1; j < characters.length; j++) {
        const a = characters[i];
        const b = characters[j];
        
        const score = this.calculatePairScore(a, b, worldVars);
        
        if (score > maxScore) {
          maxScore = score;
          bestPair = { charA: a, charB: b };
          bestReason = this.explainScore(a, b, score);
        }
      }
    }
    
    return {
      ...bestPair,
      score: maxScore,
      reason: bestReason
    };
  }

  /**
   * 计算角色对的互动分数
   */
  calculatePairScore(a, b, worldVars = {}) {
    let score = this.minScore + Math.random() * 5;
    
    // 1. 关系评分（关系越强/越对立，分数越高）
    const relScore = this.getRelationshipScore(a, b);
    score += Math.abs(relScore) * 1.5;
    if (relScore > 50) score += 20;  // 亲密关系
    if (relScore < -50) score += 20; // 敌对关系
    
    // 2. 属性极端评分（极端值更容易产生戏剧冲突）
    const extremeA = this.countExtremeStats(a);
    const extremeB = this.countExtremeStats(b);
    score += extremeA * 10 + extremeB * 10;
    
    // 3. 位置评分（同地点更容易互动）
    if (a.status?.location && a.status.location === b.status?.location) {
      score += 15;
    }
    
    // 4. 世界变量加成
    if (worldVars.tension) {
      score += worldVars.tension * 0.1;
    }
    if (worldVars.chaos) {
      score += worldVars.chaos * 0.1;
    }
    
    // 5. 记忆触发（最近有交集的角色更容易互动）
    const recentInteraction = this.hasRecentInteraction(a, b);
    if (recentInteraction) score += 25;
    
    // 6. 时间接近（同一时间段活跃）
    if (a.status?.lastActive && b.status?.lastActive) {
      const timeDiff = Math.abs(a.status.lastActive - b.status.lastActive);
      if (timeDiff < 3600000) score += 10; // 1小时内
    }
    
    return score;
  }

  /**
   * 获取关系分数
   */
  getRelationshipScore(a, b) {
    try {
      const relsA = typeof a.relationships === 'string' 
        ? JSON.parse(a.relationships) 
        : (a.relationships || []);
      
      const rel = relsA.find(r => 
        String(r.targetId || r.id || '') === String(b.id || '')
      );
      
      return Number(rel?.value || 0);
    } catch (e) {
      return 0;
    }
  }

  /**
   * 统计极端属性数量
   */
  countExtremeStats(character) {
    const attrs = character.attributes || {};
    let count = 0;
    
    for (const value of Object.values(attrs)) {
      const n = Number(value);
      if (Number.isFinite(n) && (n < 20 || n > 80)) {
        count++;
      }
    }
    
    return count;
  }

  /**
   * 检查最近是否有交集
   */
  hasRecentInteraction(a, b) {
    try {
      const memoriesA = a.memories || [];
      const recentWindow = 7 * 24 * 60 * 60 * 1000; // 7天
      
      for (const m of memoriesA) {
        if (m.relatedChars?.includes(b.id)) {
          if (Date.now() - m.timestamp < recentWindow) {
            return true;
          }
        }
      }
    } catch (e) {}
    
    return false;
  }

  /**
   * 解释分数构成
   */
  explainScore(a, b, score) {
    const reasons = [];
    
    const relScore = this.getRelationshipScore(a, b);
    if (Math.abs(relScore) > 30) {
      reasons.push(relScore > 0 ? '羁绊深厚' : '仇恨深重');
    }
    
    const extremeA = this.countExtremeStats(a);
    const extremeB = this.countExtremeStats(b);
    if (extremeA + extremeB > 2) {
      reasons.push('属性极端');
    }
    
    if (a.status?.location === b.status?.location) {
      reasons.push('同一地点');
    }
    
    if (this.hasRecentInteraction(a, b)) {
      reasons.push('近期互动');
    }
    
    return reasons.length > 0 ? reasons.join(' / ') : '综合最高';
  }

  /**
   * 计算角色影响力（用于其他系统）
   */
  calculateInfluence(character, allCharacters) {
    let influence = 0;
    
    // 关系影响
    try {
      const rels = typeof character.relationships === 'string'
        ? JSON.parse(character.relationships)
        : (character.relationships || []);
      
      influence += rels.reduce((sum, r) => sum + Math.abs(r.value || 0), 0);
    } catch (e) {}
    
    // 属性影响
    const extreme = this.countExtremeStats(character);
    influence += extreme * 10;
    
    return influence;
  }

  /**
   * 预测角色发展方向（基于历史）
   */
  predictDirection(character) {
    const attrs = character.attributes || {};
    const klines = character.klines || [];
    
    if (klines.length < 3) return { direction: 'stable', confidence: 0 };
    
    // 取最近几次的变化趋势
    const recent = klines.slice(-3);
    let trend = 0;
    
    for (const k of recent) {
      try {
        const attrsObj = typeof k.attributes === 'string' 
          ? JSON.parse(k.attributes) 
          : k.attributes;
        
        for (const [key, val] of Object.entries(attrsObj)) {
          if (attrs[key] !== undefined) {
            trend += (val - attrs[key]) > 0 ? 1 : -1;
          }
        }
      } catch (e) {}
    }
    
    return {
      direction: trend > 2 ? 'rising' : trend < -2 ? 'declining' : 'stable',
      confidence: Math.min(1, Math.abs(trend) / 10)
    };
  }
}

module.exports = new QuantumEntanglement();
