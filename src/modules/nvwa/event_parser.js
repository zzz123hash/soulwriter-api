/**
 * 事件解析器 - Event Parser
 * 
 * 解析 AI 返回的事件数据
 */

class EventParser {
  constructor() {
    this.jsonRegex = /\{[\s\S]*\}/;
  }

  /**
   * 解析 AI 输出
   */
  parse(rawText) {
    // 尝试提取 JSON
    const jsonPart = this.extractJson(rawText);
    
    if (jsonPart) {
      try {
        const parsed = JSON.parse(jsonPart);
        return this.normalize(parsed, rawText);
      } catch (e) {
        // JSON 解析失败，尝试从文本提取
        return this.parseFromText(rawText);
      }
    }
    
    return this.parseFromText(rawText);
  }

  /**
   * 提取 JSON 部分
   */
  extractJson(text) {
    // 优先提取被 ```json ``` 包裹的部分
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }
    
    // 提取 { } 包裹的部分
    const match = text.match(this.jsonRegex);
    return match ? match[0] : null;
  }

  /**
   * 从文本解析（备用方案）
   */
  parseFromText(text) {
    return {
      content: text.trim(),
      speaker: '旁白',
      changes: [],
      is_scene_completed: false,
      suggested_actions: []
    };
  }

  /**
   * 标准化解析结果
   */
  normalize(parsed, rawText) {
    // 尝试多种字段名
    const content = parsed.content 
      || parsed.text 
      || parsed.description 
      || parsed.event 
      || rawText.split('\n')[0];
    
    const speaker = parsed.speaker 
      || parsed.char 
      || parsed.role 
      || '旁白';
    
    // 解析 changes
    let changes = [];
    if (Array.isArray(parsed.changes)) {
      changes = parsed.changes.map(c => this.normalizeChange(c));
    } else if (Array.isArray(parsed.attributes)) {
      // 旧格式
      for (const [key, val] of Object.entries(parsed.attributes)) {
        changes.push({
          target: parsed.target || 'world',
          attr: key,
          delta: typeof val === 'number' ? val : (val.delta || 0),
          reason: val.reason || ''
        });
      }
    }
    
    // 解析 suggested_actions
    let suggested_actions = [];
    if (Array.isArray(parsed.suggested_actions)) {
      suggested_actions = parsed.suggested_actions;
    } else if (Array.isArray(parsed.suggestions)) {
      suggested_actions = parsed.suggestions;
    } else if (Array.isArray(parsed.actions)) {
      suggested_actions = parsed.actions;
    }
    
    return {
      content: String(content).substring(0, 500),
      speaker: String(speaker).substring(0, 50),
      changes: changes.filter(c => c.attr && c.target),
      is_scene_completed: Boolean(parsed.is_scene_completed || parsed.scene_completed),
      suggested_actions: suggested_actions.slice(0, 5).map(a => String(a).substring(0, 100)),
      temperature: this.estimateTemperature(content)
    };
  }

  /**
   * 标准化变更对象
   */
  normalizeChange(change) {
    return {
      target: String(change.target || change.character || change.id || 'world'),
      attr: String(change.attr || change.attribute || change.key || ''),
      delta: Number(change.delta || change.value || 0),
      reason: String(change.reason || change.cause || '')
    };
  }

  /**
   * 估算事件温度
   */
  estimateTemperature(text) {
    if (!text) return 0.5;
    
    const high = ['战斗', '争吵', '爆炸', '死亡', '杀', '打', '冲击', '危机', '冲突'];
    const low = ['平静', '休息', '散步', '聊天', '回忆', '思考', '睡觉'];
    
    let score = 0.5;
    
    for (const keyword of high) {
      if (text.includes(keyword)) score += 0.1;
    }
    
    for (const keyword of low) {
      if (text.includes(keyword)) score -= 0.1;
    }
    
    return Math.max(0, Math.min(1, score));
  }

  /**
   * 验证解析结果
   */
  validate(result) {
    const errors = [];
    
    if (!result.content) {
      errors.push('缺少 content 字段');
    }
    
    if (result.changes) {
      for (const change of result.changes) {
        if (!change.attr) errors.push('changes 中存在缺少 attr 的项');
        if (change.delta === undefined) errors.push('changes 中存在缺少 delta 的项');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = new EventParser();
