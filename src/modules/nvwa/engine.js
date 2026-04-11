/**
 * NvwaEngine - 女娲推演引擎核心
 * 参考旧代码Prompts.js和Engine.js设计
 * 结合InkOS的33维度审计概念
 */

// === 张力常量 ===
const TENSION = {
  VERY_LOW: 20,
  LOW: 35,
  MEDIUM: 50,
  HIGH: 65,
  VERY_HIGH: 80
};

// === 叙事节奏规则 ===
const PACING_RULES = {
  [TENSION.VERY_LOW]: '【叙事节奏：极缓】当前处于非冲突或试探阶段。请使用长句，着重描写环境的光影、角色的细微动作和复杂的心理活动，留出充分的呼吸感。',
  [TENSION.LOW]: '【叙事节奏：缓】保持细腻的环境描写和角色内心描写。',
  [TENSION.MEDIUM]: '【叙事节奏：正常】保持动作与对白的平衡推演。',
  [TENSION.HIGH]: '【叙事节奏：快】加快节奏，动作与对白紧凑，减少冗余描写。',
  [TENSION.VERY_HIGH]: '【叙事节奏：极快】当前处于极度高压或爆发阶段！禁止冗长的景物描写！使用极短、急促的句子。只专注致命的动作交锋、本能反应和情绪爆发，营造窒息感！'
};

// === 角色行为推演 ===
class NvwaEngine {
  constructor(options = {}) {
    this.config = {
      apiUrl: options.apiUrl || 'http://localhost:11434/api/generate',
      model: options.model || 'llama3',
      maxTokens: options.maxTokens || 2048,
      temperature: options.temperature || 0.7,
      ...options
    };
    
    this.memory = []; // 记忆栈
    this.worldVariables = {}; // 世界变量
    this.ideaPool = []; // 灵感池
    this.hooks = []; // 伏笔
  }
  
  // === 核心推演方法 ===
  async simulate(context) {
    const {
      characters = [],
      activeLocation = null,
      worldVariables = {},
      tension = TENSION.MEDIUM,
      tensionReason = '',
      focusCharacters = [],
      relevantMemories = []
    } = context;
    
    // 构建提示词
    const prompt = this.buildSimPrompt({
      characters,
      activeLocation,
      worldVariables,
      tension,
      tensionReason,
      focusCharacters,
      relevantMemories
    });
    
    // 调用LLM
    const response = await this.callLLM(prompt);
    
    // 解析响应
    const result = this.parseResponse(response);
    
    // 更新记忆
    this.updateMemory(result);
    
    // 检查伏笔
    this.checkHooks(result);
    
    return result;
  }
  
  // === 构建推演提示词 ===
  buildSimPrompt(context) {
    const {
      characters,
      activeLocation,
      worldVariables,
      tension,
      tensionReason,
      focusCharacters,
      relevantMemories
    } = context;
    
    // 角色上下文
    const charContext = characters.map(c => {
      const status = typeof c.status === 'object' 
        ? JSON.stringify(c.status) 
        : (c.status || '{}');
      return `- ${c.name} (${c.role || '未知'}): ${c.description || '无'}. 当前状态：${status}`;
    }).join('\n');
    
    // 世界变量
    const varsLines = Object.entries(worldVariables)
      .filter(([k]) => !['__proto__', 'prototype', 'constructor'].includes(k))
      .map(([k, v]) => `- ${k}: ${v}`)
      .join('\n');
    
    // 记忆回溯
    const memorySection = relevantMemories.length > 0
      ? `\n【潜意识回溯 / 往期相关记忆】\n${relevantMemories.join('\n')}\n（注：以上是曾发生过的相关事件，请根据这些前情提要来维持角色关系的连贯性。）`
      : '';
    
    // 灵感池
    const ideaSection = this.ideaPool.length > 0
      ? `\n【💡 创作者灵感库 (Idea Pool)】\n${this.ideaPool.slice(-5).map(i => `- ${i}`).join('\n')}\n（注：这些是创作者尚未成形的剧情碎片。如果情境合适，请尝试自然融入。）`
      : '';
    
    // 叙事节奏
    const pacingRule = this.getPacingRule(tension);
    
    // 宿命牵引
    const fateLine = tensionReason && focusCharacters.length >= 2
      ? `【导演指令/宿命牵引】：本回合焦点锁定为 [${focusCharacters[0]}] 与 [${focusCharacters[1]}]。原因：${tensionReason}。请在剧情中着重引爆或深化这一层张力。`
      : '';
    
    // 地点描述
    const locationDesc = activeLocation
      ? `【当前位置】：${activeLocation.name} - ${activeLocation.description || '无描述'}`
      : '';
    
    return `你是一个小说世界后台模拟器与命运织机（K线系统）。

【角色状态】
${charContext}

${locationDesc}

【世界状态】
${varsLines || '- （无）'}

【当前张力】：${tension}/100
${pacingRule}

${fateLine}
${memorySection}
${ideaSection}

任务：推演一个有趣的、符合当前张力水平的剧情片段。
输出要求：必须严格输出JSON，格式如下：
{
  "speaker": "角色名",
  "content": "对话或描述",
  "changes": [
    {"target": "角色名", "attr": "属性名", "delta": 数值, "reason": "原因"}
  ],
  "tensionChange": 数值,
  "newIdea": "可选的灵感笔记"
}

只输出JSON，不要包含任何markdown标记。`;
  }
  
  // === 调用LLM ===
  async callLLM(prompt) {
    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: this.config.temperature,
            num_predict: this.config.maxTokens
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`LLM调用失败: ${response.status}`);
      }
      
      const data = await response.json();
      return data.response || '';
    } catch (error) {
      console.error('[NvwaEngine] LLM调用失败:', error);
      return this.getFallbackResponse();
    }
  }
  
  // === 解析响应 ===
  parseResponse(text) {
    if (!text) {
      return this.getFallbackResponse();
    }
    
    // 尝试提取JSON
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('[NvwaEngine] JSON解析失败:', e);
    }
    
    return this.getFallbackResponse();
  }
  
  // === 备用响应 ===
  getFallbackResponse() {
    return {
      speaker: '叙述者',
      content: '一阵沉默...',
      changes: [],
      tensionChange: 0
    };
  }
  
  // === 获取叙事节奏规则 ===
  getPacingRule(tension) {
    if (tension <= TENSION.VERY_LOW) return PACING_RULES[TENSION.VERY_LOW];
    if (tension <= TENSION.LOW) return PACING_RULES[TENSION.LOW];
    if (tension <= TENSION.MEDIUM) return PACING_RULES[TENSION.MEDIUM];
    if (tension <= TENSION.HIGH) return PACING_RULES[TENSION.HIGH];
    return PACING_RULES[TENSION.VERY_HIGH];
  }
  
  // === 更新记忆 ===
  updateMemory(result) {
    this.memory.push({
      ...result,
      timestamp: Date.now()
    });
    
    // 保持记忆在合理范围
    if (this.memory.length > 100) {
      this.memory = this.memory.slice(-50);
    }
    
    // 添加灵感
    if (result.newIdea) {
      this.addIdea(result.newIdea);
    }
  }
  
  // === 添加灵感 ===
  addIdea(idea) {
    if (!this.ideaPool.includes(idea)) {
      this.ideaPool.push(idea);
    }
    if (this.ideaPool.length > 20) {
      this.ideaPool = this.ideaPool.slice(-20);
    }
  }
  
  // === 检查伏笔 ===
  checkHooks(result) {
    const content = result.content || '';
    this.hooks.forEach(hook => {
      if (hook.status === 'active' && content.includes(hook.keyword)) {
        hook.status = 'triggered';
        hook.triggeredAt = Date.now();
      }
    });
  }
  
  // === 添加伏笔 ===
  addHook(hook) {
    this.hooks.push({
      id: `hook_${Date.now()}`,
      keyword: hook.keyword,
      content: hook.content,
      status: 'active',
      createdAt: Date.now()
    });
  }
  
  // === 获取记忆 ===
  getRelevantMemories(count = 5) {
    return this.memory.slice(-count).map(m => m.content);
  }
  
  // === 重置 ===
  reset() {
    this.memory = [];
    this.worldVariables = {};
    this.ideaPool = [];
    this.hooks = [];
  }
}

// === 33维度审计器 ===
class NvwaAuditor {
  constructor() {
    this.dimensions = this.initDimensions();
  }
  
  initDimensions() {
    return {
      // 角色维度
      character_memory: { weight: 1.0, score: 0 },
      character_goal: { weight: 1.0, score: 0 },
      character_motivation: { weight: 1.0, score: 0 },
      character_emotion: { weight: 1.0, score: 0 },
      character_skill: { weight: 0.8, score: 0 },
      character_relationship: { weight: 1.0, score: 0 },
      
      // 剧情维度
      plot_causality: { weight: 1.0, score: 0 },
      plot_pacing: { weight: 1.0, score: 0 },
      plot_hook: { weight: 1.0, score: 0 },
      plot_payoff: { weight: 1.0, score: 0 },
      plot_tension: { weight: 1.0, score: 0 },
      plot_climax: { weight: 0.8, score: 0 },
      
      // 世界维度
      world_rules: { weight: 1.0, score: 0 },
      world_timeline: { weight: 0.8, score: 0 },
      world_consistency: { weight: 1.0, score: 0 },
      
      // 资源维度
      resource_inventory: { weight: 0.8, score: 0 },
      resource_currency: { weight: 0.6, score: 0 },
      
      // 风格维度
      style_tone: { weight: 0.8, score: 0 },
      style_language: { weight: 0.8, score: 0 }
    };
  }
  
  // 审计
  audit(content, context = {}) {
    // 简单的基于规则的审计
    const results = {};
    let totalScore = 0;
    let totalWeight = 0;
    
    Object.entries(this.dimensions).forEach(([key, dim]) => {
      const score = this.evaluateDimension(key, content, context);
      results[key] = score;
      totalScore += score * dim.weight;
      totalWeight += dim.weight;
    });
    
    const overall = totalWeight > 0 ? totalScore / totalWeight : 0;
    
    return {
      dimensions: results,
      overall,
      status: overall >= 0.7 ? 'approved' : overall >= 0.5 ? 'review' : 'rejected'
    };
  }
  
  evaluateDimension(key, content, context) {
    // 简化评估，实际应该调用LLM
    // 这里返回基于规则的分数
    const wordCount = content.length;
    
    switch (key) {
      case 'character_memory':
        return wordCount > 100 ? 0.8 : 0.6;
      case 'plot_pacing':
        return wordCount > 200 ? 0.7 : 0.5;
      case 'plot_tension':
        return context.tension > 50 ? 0.8 : 0.6;
      default:
        return 0.7;
    }
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NvwaEngine, NvwaAuditor, TENSION, PACING_RULES };
}
if (typeof window !== 'undefined') {
  window.NvwaEngine = NvwaEngine;
  window.NvwaAuditor = NvwaAuditor;
  window.TENSION = TENSION;
  window.PACING_RULES = PACING_RULES;
}
