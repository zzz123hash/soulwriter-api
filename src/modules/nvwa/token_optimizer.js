/**
 * Token 优化器 - Token Optimizer
 * 
 * 压缩 prompt 和上下文，控制 token 消耗
 * 参考 v1.2 文档 3.4.2 节
 */

class TokenOptimizer {
  constructor(options = {}) {
    this.maxPromptTokens = options.maxPromptTokens || 4000;
    this.maxContextTokens = options.maxContextTokens || 8000;
    this.estimateCharsPerToken = 4; // 中文约 2 字符/token，英文约 4
  }

  /**
   * 估算 token 数量
   */
  estimateTokens(text) {
    if (!text) return 0;
    // 简单估算：中文按字符，英文按单词
    const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const english = (text.match(/[a-zA-Z]+/g) || []).length;
    return chinese * 2 + english / this.estimateCharsPerToken;
  }

  /**
   * 压缩角色数据（用于 prompt）
   */
  compressCharacterData(char) {
    const attrs = char.attributes || {};
    
    // 只传递有变化的属性
    const changedAttrs = {};
    for (const [key, param] of Object.entries(attrs)) {
      if (param.delta !== 0 || param.value !== param.baseValue) {
        changedAttrs[key] = param.value;
      }
    }
    
    // 状态摘要
    const statusSummary = char.status
      ? `${char.status.location || '?'} | ${char.status.mood || '?'}`
      : '未知';
    
    // 关系摘要（只列关键关系）
    const rels = char.relationships || [];
    const keyRels = rels
      .filter(r => Math.abs(r.value || 0) > 30)
      .map(r => `${r.targetId || r.name}: ${r.value > 0 ? '+' : ''}${r.value}`)
      .join(', ');
    
    return {
      id: char.id,
      name: char.name,
      role: char.role || '未知',
      status: statusSummary,
      attrs: changedAttrs,
      relations: keyRels || '无',
      summary: char.summary || ''
    };
  }

  /**
   * 压缩上下文
   */
  compressContext(context, maxTokens = null) {
    const limit = maxTokens || this.maxPromptTokens;
    const text = typeof context === 'string' ? context : JSON.stringify(context);
    
    if (this.estimateTokens(text) <= limit) {
      return text;
    }
    
    // 按比例压缩
    const ratio = limit / this.estimateTokens(text);
    const targetLen = Math.floor(text.length * ratio);
    
    // 先尝试精简 JSON
    if (typeof context === 'object') {
      const精简 = this精简Object(context, ratio);
      if (this.estimateTokens(JSON.stringify(精简)) <= limit) {
        return JSON.stringify(精简);
      }
    }
    
    // 最后手段：截断
    return text.substring(0, targetLen * 3);
  }

  /**
   * 精简对象
   */
  精简Object(obj, ratio) {
    if (Array.isArray(obj)) {
      return obj.slice(0, Math.ceil(obj.length * ratio));
    }
    
    if (typeof obj === 'object') {
      const result = {};
      const keys = Object.keys(obj);
      const keepCount = Math.ceil(keys.length * ratio);
      
      for (const key of keys.slice(0, keepCount)) {
        result[key] = this.精简Object(obj[key], ratio);
      }
      
      return result;
    }
    
    return obj;
  }

  /**
   * 构建精简 prompt
   */
  buildCompactPrompt(soulData, memory, worldVars) {
    // 1. 核心设定（固定位置）
    let prompt = `[角色] ${soulData.name}\n`;
    prompt += `[状态] ${soulData.status?.location || '?'} | ${soulData.status?.mood || '?'}\n`;
    
    // 2. 属性摘要
    const attrs = soulData.attributes || {};
    const attrStr = Object.entries(attrs)
      .map(([k, v]) => `${k}:${typeof v === 'object' ? v.value : v}`)
      .join(' | ');
    prompt += `[属性] ${attrStr}\n`;
    
    // 3. 关系摘要
    const rels = soulData.relationships || [];
    const relStr = rels
      .filter(r => Math.abs(r.value || 0) > 20)
      .slice(0, 5)
      .map(r => `${r.name || r.targetId}:${r.value}`)
      .join(' | ');
    prompt += `[关系] ${relStr}\n`;
    
    // 4. 最近记忆
    const recentMemories = (memory.buffer || []).slice(-5);
    if (recentMemories.length > 0) {
      prompt += `[近期] `;
      prompt += recentMemories.map(m => m.content.substring(0, 30)).join(' | ');
      prompt += '\n';
    }
    
    // 5. 世界变量
    prompt += `[张力] ${worldVars.tension || 50} | [混乱] ${worldVars.chaos || 50}\n`;
    
    return prompt;
  }

  /**
   * 懒加载：检查是否需要从 archival 检索
   */
  shouldRetrieveFromArchival(memory, query) {
    // 如果 recall 已有相关内容，可以跳过 archival
    const recallMatches = memory.recall?.filter(m => 
      m.content.includes(query)
    ).length || 0;
    
    return recallMatches === 0 && (memory.archival?.length || 0) > 50;
  }
}

module.exports = new TokenOptimizer();
