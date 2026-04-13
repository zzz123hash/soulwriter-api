/**
 * SoulWriter - 顺理成章 StoryFlow 引擎
 * 
 * 核心设计理念：
 * 1. 上下文连贯性 - 基于向量相似度匹配
 * 2. 动态选项生成 - 2-5个选项，根据上下文智能生成
 * 3. 回合控制系统 - 财富/倒霉的时间轴可控
 * 4. 自然文本输出 - 去除AI味
 */

// ============ 向量记忆存储 ============
const VectorMemory = {
  // 向量维度
  DIMENSION: 384,
  
  // 存储
  memories: [],
  
  // 添加记忆（带向量）
  addMemory(content, type = 'event') {
    const vector = this.encode(content);
    const memory = {
      id: Date.now().toString(),
      content,
      type,
      vector,
      timestamp: Date.now(),
      tags: this.extractTags(content)
    };
    this.memories.push(memory);
    return memory;
  },
  
  // 简单文本编码（实际应该用API）
  encode(text) {
    // 这里简化处理，实际应用中应该调用嵌入API
    const words = text.split('');
    const vec = new Array(this.DIMENSION).fill(0);
    words.forEach((w, i) => {
      vec[i % this.DIMENSION] += w.charCodeAt(0) / 255;
    });
    // 归一化
    const mag = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
    return vec.map(v => v / (mag || 1));
  },
  
  // 计算余弦相似度
  cosineSimilarity(vec1, vec2) {
    let dot = 0, mag1 = 0, mag2 = 0;
    for (let i = 0; i < vec1.length; i++) {
      dot += vec1[i] * vec2[i];
      mag1 += vec1[i] * vec1[i];
      mag2 += vec2[i] * vec2[i];
    }
    return dot / (Math.sqrt(mag1) * Math.sqrt(mag2) || 1);
  },
  
  // 检索相似记忆
  search(query, limit = 5, threshold = 0.5) {
    const queryVec = this.encode(typeof query === "string" ? query : JSON.stringify(query));
    const results = this.memories
      .map(m => ({
        ...m,
        similarity: this.cosineSimilarity(queryVec, m.vector)
      }))
      .filter(m => m.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
    return results;
  },
  
  // 提取标签
  extractTags(content) {
    const tags = [];
    // 情绪标签
    if (typeof content === 'string' && (content.includes('开心') || content.includes('高兴'))) tags.push('positive');
    if (typeof content === 'string' && (content.includes('悲伤') || content.includes('难过'))) tags.push('negative');
    if (typeof content === 'string' && (content.includes('紧张') || content.includes('害怕'))) tags.push('tense');
    if (typeof content === 'string' && (content.includes('平静') || content.includes('安心'))) tags.push('calm');
    // 事件标签
    if (typeof content === 'string' && (content.includes('获得') || content.includes('得到'))) tags.push('gain');
    if (typeof content === 'string' && (content.includes('失去') || content.includes('丢失'))) tags.push('loss');
    if (typeof content === 'string' && (content.includes('相遇') || content.includes('认识'))) tags.push('encounter');
    if (typeof content === 'string' && (content.includes('冲突') || content.includes('争吵'))) tags.push('conflict');
    return tags;
  },
  
  // 清除记忆
  clear() {
    this.memories = [];
  }
};

// ============ 回合追踪器 ============
const TurnTracker = {
  turns: [],
  currentTurn: 0,
  
  // 添加回合
  addTurn(type, result, details = {}) {
    const turn = {
      id: Date.now().toString(),
      turn: ++this.currentTurn,
      type, // 'reward' | 'punishment' | 'neutral'
      result,
      details,
      timestamp: Date.now()
    };
    this.turns.push(turn);
    return turn;
  },
  
  // 获取最近N回合的指定类型
  getRecent(type, n = 5) {
    return this.turns
      .filter(t => t.type === type)
      .slice(-n);
  },
  
  // 检查是否应该触发某种事件
  shouldTrigger(type, probability = 0.5, minTurnsSince = 3) {
    const recent = this.getRecent(type, 1);
    if (recent.length > 0) {
      const turnsSince = this.currentTurn - recent[0].turn;
      if (turnsSince < minTurnsSince) return false;
    }
    return Math.random() < probability;
  },
  
  // 获取统计
  getStats() {
    const rewards = this.turns.filter(t => t.type === 'reward').length;
    const punishments = this.turns.filter(t => t.type === 'punishment').length;
    return {
      totalTurns: this.currentTurn,
      rewards,
      punishments,
      balance: rewards - punishments
    };
  }
};

// ============ 上下文分析器 ============
const ContextAnalyzer = {
  // 分析当前上下文
  analyze(context) {
    const recentMemories = VectorMemory.search(context, 3);
    const stats = TurnTracker.getStats();
    
    return {
      context,
      similarMemories: recentMemories,
      storyStats: stats,
      tension: this.calculateTension(stats),
      sentiment: this.analyzeSentiment(context)
    };
  },
  
  // 计算故事张力
  calculateTension(stats) {
    // 张力 = (奖励 - 惩罚) 的绝对值越小，越平衡
    const balance = Math.abs(stats.balance);
    return Math.min(100, Math.max(0, 50 - balance * 10));
  },
  
  // 分析情感倾向
  analyzeSentiment(text) {
    const positive = ['开心', '高兴', '快乐', '幸福', '顺利', '成功', '获得', '好运'];
    const negative = ['悲伤', '难过', '痛苦', '失败', '失去', '倒霉', '困难', '挫折'];
    
    let score = 0;
    positive.forEach(w => { if (typeof text === 'string' && text.includes(w)) score++; });
    negative.forEach(w => { if (typeof text === 'string' && text.includes(w)) score--; });
    
    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  },
  
  // 生成动态选项
  generateOptions(context, count = 3) {
    const analysis = this.analyze(context);
    const options = [];
    
    // 基于上下文的自然生成
    const baseTemplates = {
      positive: [
        { type: 'reward', template: '【顺理成章】{char}在散步时意外发现了一个遗落的包裹，里面竟是...', followUp: '这为后续剧情埋下了伏笔。' },
        { type: 'reward', template: '【水到渠成】{char}的努力终于得到回报，一封意外的来信带来了好消息。', followUp: '这似乎预示着更大的机遇。' },
        { type: 'neutral', template: '【日常插曲】{char}在街角遇到了一个有趣的摊位，摊主热情地打招呼。', followUp: '这次偶遇似乎没那么简单。' }
      ],
      negative: [
        { type: 'punishment', template: '【节外生枝】{char}正准备离开，却发现自己最重要的东西不见了。', followUp: '这让事情变得更加复杂。' },
        { type: 'punishment', template: '【意外波折】一阵突如其来的暴雨打乱了{char}的所有计划。', followUp: '但塞翁失马，焉知非福。' },
        { type: 'neutral', template: '【命运转折】{char}遇到一个神秘人递来的纸条，上面只写了一句话...', followUp: '这暗示着即将发生的变化。' }
      ],
      neutral: [
        { type: 'neutral', template: '【平静时刻】{char}坐在咖啡馆里，观察着窗外的行人。', followUp: '直到一个熟悉的身影出现。' },
        { type: 'reward', template: '【意外之喜】{char}的手机突然响起，是一个久未联系的老友。', followUp: '老友带来的消息令人振奋。' },
        { type: 'punishment', template: '【暗流涌动】{char}总觉得有人在跟踪自己，但回头却什么都没发现。', followUp: '这种感觉越来越强烈。' }
      ]
    };
    
    const templates = baseTemplates[analysis.sentiment] || baseTemplates.neutral;
    
    // 随机选择N个不重复的选项
    const shuffled = [...templates].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      const t = shuffled[i];
      options.push({
        id: i + 1,
        type: t.type,
        lead: t.template.replace('{char}', context.mainChar || '主角'),
        followUp: t.followUp,
        aiSuggestion: t.type === 'reward' ? '继续推进正向剧情' : t.type === 'punishment' ? '增加戏剧张力' : '保持悬念'
      });
    }
    
    return options;
  }
};

// ============ 自然文本生成器 ============
const NaturalWriter = {
  // 去除AI味的文本
  makeNatural(text) {
    if (typeof text !== 'string') return String(text);
    // 移除固定模式的开头
    const aiPatterns = [
      /首先，/g, /其次，/g, /最后，/g,
      /总的来说，/g, /因此，/g, /所以，/g,
      /值得注意的是，/g, /毫无疑问，/g,
      /与此同时，/g, /毫不意外，/g
    ];
    
    let result = text;
    aiPatterns.forEach(p => { result = result.replace(p, ''); });
    
    // 添加自然的口语化
    result = this.addVariety(result);
    
    return result;
  },
  
  // 增加句式多样性
  addVariety(text) {
    if (typeof text !== 'string') text = String(text);
    // 随机使用不同的句式结构
    const structures = [
      (t) => t, // 保持原样
      (t) => t.replace('。', '，却没想到——'), // 转折
      (t) => t.replace('。', '...'), // 省略
      (t) => '「' + t.slice(0, -1) + '。」' // 对话式
    ];
    
    return structures[Math.floor(Math.random() * structures.length)](text);
  },
  
  // 生成顺理成章的文本
  generate(options, selectedId) {
    const selected = options.find(o => o.id === selectedId);
    if (!selected) return '';
    
    // 组合文本
    let text = selected.lead;
    
    // 追踪回合
    TurnTracker.addTurn(selected.type, selectedId, { option: selected });
    
    // 添加到向量记忆
    VectorMemory.addMemory(text, selected.type);
    
    return this.makeNatural(text);
  }
};

// ============ 顺理成章主引擎 ============
const StoryFlowEngine = {
  // 状态
  state: {
    context: '',
    mainChar: '林墨',
    options: [],
    history: []
  },
  
  // 初始化
  init(context = '') {
    this.state.context = context;
    this.state.options = [];
    this.state.history = [];
  },
  
  // 设置主要角色
  setMainChar(name) {
    this.state.mainChar = name;
  },
  
  // 更新上下文
  updateContext(newContext) {
    this.state.context = newContext;
  },
  
  // 生成选项（2-5个，根据上下文动态）
  generateOptions() {
    // 根据当前状态动态决定选项数量
    const tension = ContextAnalyzer.analyze(this.state.context).tension;
    let count = 3; // 默认3个
    if (tension > 70) count = 2; // 张力高，减少选项
    if (tension < 30) count = 4; // 张力低，增加选项
    
    this.state.options = ContextAnalyzer.generateOptions(
      { ...this.state, mainChar: this.state.mainChar },
      count
    );
    
    return this.state.options;
  },
  
  // 执行选项
  execute(optionId) {
    const result = NaturalWriter.generate(this.state.options, optionId);
    this.state.history.push({
      optionId,
      result,
      timestamp: Date.now()
    });
    return result;
  },
  
  // 获取当前状态
  getStatus() {
    return {
      context: this.state.context,
      mainChar: this.state.mainChar,
      optionsCount: this.state.options.length,
      turnStats: TurnTracker.getStats(),
      tension: ContextAnalyzer.calculateTension(TurnTracker.getStats())
    };
  },
  
  // 渲染面板
  renderPanel() {
    const status = this.getStatus();
    const options = this.generateOptions();
    
    return `
      <div class="storyflow-panel">
        <div class="storyflow-header">
          <span class="storyflow-icon">🌊</span>
          <span>顺理成章</span>
          <span class="storyflow-turns">回合 #${TurnTracker.currentTurn}</span>
        </div>
        
        <div class="storyflow-stats">
          <div class="storyflow-stat">
            <span class="stat-label">张力</span>
            <div class="stat-bar">
              <div class="stat-fill" style="width: ${status.tension}%"></div>
            </div>
          </div>
          <div class="storyflow-stat">
            <span>奖励: ${status.turnStats.rewards}</span>
            <span>惩罚: ${status.turnStats.punishments}</span>
          </div>
        </div>
        
        <div class="storyflow-options">
          ${options.map(opt => `
            <button class="storyflow-option" data-id="${opt.id}">
              <div class="option-type">${opt.type === 'reward' ? '🌟' : opt.type === 'punishment' ? '⚡' : '💫'}</div>
              <div class="option-content">
                <div class="option-lead">${opt.lead}</div>
                <div class="option-hint">${opt.aiSuggestion}</div>
              </div>
            </button>
          `).join('')}
        </div>
        
        <div class="storyflow-result" id="storyflow-result"></div>
      </div>
    `;
  },
  
  // 绑定事件
  bindEvents() {
    document.querySelectorAll('.storyflow-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const result = this.execute(id);
        document.getElementById('storyflow-result').innerHTML = `
          <div class="storyflow-result-text">${result}</div>
        `;
        // 更新上下文
        this.updateContext(result);
      });
    });
  }
};

// 绑定顺理成章事件
function bindStoryFlowEvents() {
  const panel = document.querySelector('.storyflow-panel');
  if (panel) {
    StoryFlowEngine.bindEvents();
  }
}
