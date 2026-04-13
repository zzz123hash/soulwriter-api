/**
 * SoulWriter - 女娲推演引擎 完整架构
 * 
 * 神明视角的创作体验系统
 * 
 * 核心模块：
 * 1. NvwaCore - 引擎核心，记忆管理
 * 2. NvwaPsychology - 角色心理面板
 * 3. NvwaIntervention - 神级干预系统（神谕/沟通/神罚/神技）
 * 4. NvwaCreativePoints - 创意点数系统
 * 5. NvwaUI - 主渲染器
 */

// ============ 女娲创意点数系统 ============
const NvwaCreativePoints = {
  POINTS_PER_STORY: 100,
  COSTS: {
    oracle: 10,        // 神谕
    communicate: 5,    // 沟通
    punish: 15,        // 神罚
    reward: 15,        // 神奖
    skill: 20,         // 神技
    divineEvent: 25    // 神迹
  },

  state: {
    totalPoints: 100,
    usedPoints: 0,
    history: []
  },

  getRemaining() {
    return this.state.totalPoints - this.state.usedPoints;
  },

  canAfford(action) {
    return this.getRemaining() >= this.COSTS[action];
  },

  use(action, reason) {
    if (!this.canAfford(action)) {
      return { success: false, message: '创意点数不足' };
    }
    const cost = this.COSTS[action];
    this.state.usedPoints += cost;
    this.state.history.push({
      action,
      cost,
      reason,
      timestamp: Date.now()
    });
    return { success: true, cost, remaining: this.getRemaining() };
  },

  renderPanel() {
    const remaining = this.getRemaining();
    const percent = (remaining / this.state.totalPoints) * 100;
    
    return `
      <div class="nvwa-creative-panel">
        <div class="nvwa-points-header">
          <span class="nvwa-points-icon">✨</span>
          <span class="nvwa-points-title">创意点数</span>
          <span class="nvwa-points-value">${remaining}/${this.state.totalPoints}</span>
        </div>
        <div class="nvwa-points-bar">
          <div class="nvwa-points-fill" style="width: ${percent}%"></div>
        </div>
        <div class="nvwa-points-history">
          ${this.state.history.slice(-3).map(h => `
            <div class="nvwa-points-item">
              <span>${this.getActionName(h.action)}</span>
              <span class="cost">-${h.cost}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  getActionName(action) {
    const names = {
      oracle: '神谕',
      communicate: '沟通',
      punish: '神罚',
      reward: '神奖',
      skill: '神技',
      divineEvent: '神迹'
    };
    return names[action] || action;
  }
};

// ============ 女娲心理面板 ============
const NvwaPsychology = {
  // 心理维度
  DIMENSIONS: ['心情', '想法', '感受', '欲望', '恐惧'],

  // 获取角色心理数据
  getCharacterPsychology(charId) {
    // 从state获取或生成模拟数据
    return {
      mood: Math.floor(Math.random() * 100),
      thoughts: '正在思考如何逃离困境...',
      feelings: '焦虑但抱有希望',
      desire: '寻找真相',
      fear: '失去同伴',
      energy: 75,
      stress: 45
    };
  },

  renderPsychologyPanel(charId) {
    const psych = this.getCharacterPsychology(charId);
    
    return `
      <div class="nvwa-psych-panel">
        <div class="nvwa-psych-header">
          <span class="nvwa-psych-icon">🧠</span>
          <span>心理状态</span>
        </div>
        <div class="nvwa-psych-mood">
          <div class="nvwa-mood-label">心情</div>
          <div class="nvwa-mood-bar">
            <div class="nvwa-mood-fill" style="width: ${psych.mood}%"></div>
          </div>
          <div class="nvwa-mood-value">${psych.mood}%</div>
        </div>
        <div class="nvwa-psych-dimensions">
          ${this.DIMENSIONS.map(dim => `
            <div class="nvwa-dimension">
              <span class="nvwa-dim-name">${dim}</span>
              <div class="nvwa-dim-bar">
                <div class="nvwa-dim-fill" style="width: ${Math.random()*100}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="nvwa-psych-thoughts">
          <div class="nvwa-thoughts-label">💭 想法</div>
          <div class="nvwa-thoughts-content">${psych.thoughts}</div>
        </div>
      </div>
    `;
  }
};

// ============ 女娲干预系统 ============
const NvwaIntervention = {
  // 干预类型
  TYPES: {
    oracle: {
      name: '神谕',
      icon: '⚡',
      desc: '直接下达神命，让角色执行特定行动',
      cost: 10
    },
    communicate: {
      name: '沟通',
      icon: '💬',
      desc: '与角色进行心灵对话，引导思考',
      cost: 5
    },
    punish: {
      name: '神罚',
      icon: '🔥',
      desc: '降下天罚，AI会分析合理性后导入',
      cost: 15
    },
    reward: {
      name: '神奖',
      icon: '🌟',
      desc: '赐予恩赐，AI会分析合理性后导入',
      cost: 15
    },
    skill: {
      name: '神技',
      icon: '✨',
      desc: '赐予奇遇或特殊能力',
      cost: 20
    }
  },

  // 执行干预
  execute(type, charId, params) {
    const result = NvwaCreativePoints.use(type, `${this.TYPES[type].name}: ${params.reason || ''}`);
    if (!result.success) return result;

    // 这里调用AI分析并生成结果
    return {
      success: true,
      result: this.generateResult(type, charId, params),
      remaining: result.remaining
    };
  },

  // 生成干预结果
  generateResult(type, charId, params) {
    // 实际应该调用AI，这里返回模拟结果
    const results = {
      oracle: `神谕已传达：${params.command || '执行指定行动'}`,
      communicate: `沟通成功：角色理解了您的意图`,
      punish: `神罚降临：${params.description || '遭遇意外惩罚'}`,
      reward: `神恩浩荡：${params.blessing || '获得神秘恩赐'}`,
      skill: `神技触发：${params.skill || '触发奇遇事件'}`
    };
    return results[type] || '干预完成';
  },

  renderInterventionPanel(charId) {
    return `
      <div class="nvwa-intervention-panel">
        <div class="nvwa-intervention-header">
          <span class="nvwa-intervention-icon">⚔️</span>
          <span>神明干预</span>
        </div>
        <div class="nvwa-intervention-types">
          ${Object.entries(this.TYPES).map(([key, t]) => `
            <button class="nvwa-intervention-btn" data-type="${key}" data-char="${charId}">
              <span class="nvwa-btn-icon">${t.icon}</span>
              <span class="nvwa-btn-name">${t.name}</span>
              <span class="nvwa-btn-cost">${t.cost}点</span>
            </button>
          `).join('')}
        </div>
        <div class="nvwa-intervention-result" id="intervention-result"></div>
      </div>
    `;
  }
};

// ============ 女娲核心引擎 ============
const NvwaCore = {
  // 记忆层级
  LAYERS: {
    buffer: { name: 'Buffer', icon: '⚡', desc: '瞬时处理', color: '#3b82f6' },
    cache: { name: 'Cache', icon: '💫', desc: '短期记忆', color: '#06b6d4' },
    core: { name: 'Core', icon: '🧠', desc: '核心记忆', color: '#f59e0b' },
    recall: { name: 'Recall', icon: '🔮', desc: '可召回区', color: '#8b5cf6' },
    archival: { name: 'Archival', icon: '📚', desc: '档案库', color: '#6b7280' }
  },

  // 状态
  state: {
    selectedCharId: null,
    activeLayer: 'buffer',
    memories: [],
    characters: []
  },

  // 添加记忆
  addMemory(layer, content, emotion) {
    const memory = {
      id: Date.now().toString(),
      layer,
      content,
      emotion,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    };
    this.state.memories.unshift(memory);
    return memory;
  },

  // 获取层级记忆
  getLayerMemories(layer) {
    return this.state.memories.filter(m => m.layer === layer);
  },

  // 渲染层级面板
  renderLayerPanel() {
    return `
      <div class="nvwa-layers">
        ${Object.entries(this.LAYERS).map(([key, layer]) => `
          <div class="nvwa-layer ${this.state.activeLayer === key ? 'active' : ''}" 
               data-layer="${key}">
            <span class="nvwa-layer-icon">${layer.icon}</span>
            <span class="nvwa-layer-name">${layer.name}</span>
            <span class="nvwa-layer-count">${this.getLayerMemories(key).length}</span>
          </div>
        `).join('')}
      </div>
    `;
  },

  // 渲染记忆列表
  renderMemoryList() {
    const memories = this.getLayerMemories(this.state.activeLayer);
    if (memories.length === 0) {
      return '<div class="nvwa-empty">该层级暂无记忆</div>';
    }
    return memories.map(m => `
      <div class="nvwa-memory-card" data-id="${m.id}">
        <div class="nvwa-memory-header">
          <span class="nvwa-memory-time">${m.time}</span>
          <span class="nvwa-memory-emotion">${m.emotion || ''}</span>
        </div>
        <div class="nvwa-memory-content">${m.content}</div>
      </div>
    `).join('');
  }
};

// ============ 女娲主UI ============
const NvwaUI = {
  ...NvwaCore,

  // 初始化
  init(charId) {
    this.state.selectedCharId = charId;
    this.state.memories = this.sampleMemories;
  },

  // 渲染完整女娲面板
  render() {
    const charId = this.state.selectedCharId || 'default';
    return `
      <div class="nvwa-root">
        <div class="nvwa-main">
          ${this.renderLayerPanel()}
          <div class="nvwa-memory-list">
            ${this.renderMemoryList()}
          </div>
        </div>
        <div class="nvwa-sidebar">
          ${NvwaPsychology.renderPsychologyPanel(charId)}
          ${NvwaCreativePoints.renderPanel()}
          ${NvwaIntervention.renderInterventionPanel(charId)}
        </div>
      </div>
    `;
  },

  // 示例记忆数据
  sampleMemories: [
    { id: 'm1', layer: 'core', time: '10:23', content: '主角「林墨」在废弃实验室发现父亲留下的加密日记。', emotion: '震惊' },
    { id: 'm2', layer: 'core', time: '10:45', content: '林墨激活了残破的AI助手「零」，得知父亲是「创世计划」的核心研究员。', emotion: '恐惧' },
    { id: 'm3', layer: 'recall', time: '昨天', content: '与同伴「苏晴」在安全区相遇，她似乎知道一些内幕但不愿多说。', emotion: '疑惑' },
    { id: 'm4', layer: 'buffer', time: '刚刚', content: '收到神秘信号，来源不明。信号内容：「第二阶段启动，倒计时7天。」', emotion: '紧张' },
    { id: 'm5', layer: 'cache', time: '今天早上', content: '林墨回想起父亲曾经说过的话。', emotion: '困惑' }
  ]
};

// 绑定女娲事件
function bindNvwaEvents() {
  // 层级切换
  document.querySelectorAll('.nvwa-layer').forEach(el => {
    el.addEventListener('click', function() {
      const layer = this.dataset.layer;
      NvwaUI.state.activeLayer = layer;
      document.querySelectorAll('.nvwa-layer').forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      document.querySelector('.nvwa-memory-list').innerHTML = NvwaUI.renderMemoryList();
    });
  });

  // 干预按钮
  document.querySelectorAll('.nvwa-intervention-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const type = this.dataset.type;
      const charId = this.dataset.char;
      
      if (!NvwaCreativePoints.canAfford(type)) {
        alert('创意点数不足！');
        return;
      }

      // 弹出干预输入框
      const prompt = NvwaIntervention.TYPES[type].desc;
      const userInput = prompt(`输入${prompt.replace('AI会分析合理性后导入', '').replace('直接下达神命', '')}:`);
      if (userInput) {
        const result = NvwaIntervention.execute(type, charId, { reason: userInput });
        if (result.success) {
          document.getElementById('intervention-result').innerHTML = `
            <div class="nvwa-result-success">${result.result}</div>
            <div class="nvwa-result-remaining">剩余点数: ${result.remaining}</div>
          `;
        }
      }
    });
  });
}
