/**
 * SoulWriter - 女娲推演引擎 v3 完整版
 */

// ============ 创意点数系统 ============
const NvwaCreativePoints = {
  POINTS_PER_STORY: 100,
  COSTS: {
    oracle: 10,
    communicate: 5,
    punish: 15,
    reward: 15,
    skill: 20
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
    this.state.history.push({ action, cost, reason, timestamp: Date.now() });
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
      </div>
    `;
  }
};

// ============ 女娲心理面板 ============
const NvwaPsychology = {
  DIMENSIONS: ['心情', '想法', '感受', '欲望', '恐惧'],
  getCharacterPsychology(charId) {
    return {
      mood: Math.floor(Math.random() * 100),
      thoughts: '正在思考如何逃离困境...',
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

// ============ 全局控制系统 ============
const NvwaGlobal = {
  WEATHER_TYPES: ['晴朗', '多云', '阴天', '雨天', '雪天', '雷电', '雾霾', '沙尘', '暴风雨', '彩虹'],
  TIME_SYSTEMS: ['黎明', '清晨', '上午', '中午', '下午', '傍晚', '黄昏', '夜晚', '深夜', '午夜'],
  worldSettings: { weather: '晴朗', time: '上午', season: '春', year: 1, era: '现代' },
  getWeatherIcon(w) {
    const icons = {'晴朗': '☀️', '多云': '⛅', '阴天': '☁️', '雨天': '🌧️', '雪天': '❄️', '雷电': '⛈️', '雾霾': '🌫️', '沙尘': '💨', '暴风雨': '🌪️', '彩虹': '🌈'};
    return icons[w] || '🌤️';
  },
  setWeather(w) { this.worldSettings.weather = w; },
  setTime(t) { this.worldSettings.time = t; },
  setSeason(s) { this.worldSettings.season = s; },
  renderGlobalPanel() {
    return `
      <div class="nvwa-global-panel">
        <div class="nvwa-global-header">
          <span class="nvwa-global-icon">🌍</span>
          <span>全局控制</span>
        </div>
        <div class="nvwa-global-section">
          <div class="nvwa-global-label">天气</div>
          <div class="nvwa-weather-grid">
            ${this.WEATHER_TYPES.map(w => `
              <button class="nvwa-weather-btn ${this.worldSettings.weather === w ? 'active' : ''}" 
                      data-weather="${w}" onclick="NvwaGlobal.setWeather('${w}')">
                ${this.getWeatherIcon(w)}
              </button>
            `).join('')}
          </div>
        </div>
        <div class="nvwa-global-section">
          <div class="nvwa-global-label">时间</div>
          <div class="nvwa-time-grid">
            ${this.TIME_SYSTEMS.map(t => `
              <button class="nvwa-time-btn ${this.worldSettings.time === t ? 'active' : ''}"
                      data-time="${t}" onclick="NvwaGlobal.setTime('${t}')">
                ${t}
              </button>
            `).join('')}
          </div>
        </div>
        <div class="nvwa-global-section">
          <div class="nvwa-global-label">季节</div>
          <select class="nvwa-global-select" onchange="NvwaGlobal.setSeason(this.value)">
            <option value="春" ${this.worldSettings.season === '春' ? 'selected' : ''}>春</option>
            <option value="夏" ${this.worldSettings.season === '夏' ? 'selected' : ''}>夏</option>
            <option value="秋" ${this.worldSettings.season === '秋' ? 'selected' : ''}>秋</option>
            <option value="冬" ${this.worldSettings.season === '冬' ? 'selected' : ''}>冬</option>
          </select>
        </div>
      </div>
    `;
  }
};

// ============ 赏罚系统 ============
const NvwaJudgment = {
  TYPES: {
    reward: { name: '神奖', icon: '🌟', cost: 15, options: ['意外财富', '珍贵物品', '技能提升', '贵人相助', '好运连连'] },
    punish: { name: '神罚', icon: '⚡', cost: 15, options: ['意外损失', '健康问题', '人际冲突', '事业挫折', '天灾人祸'] }
  },
  history: [],
  execute(type, charId, option) {
    const result = NvwaCreativePoints.use(type, `赏罚: ${option}`);
    if (!result.success) return result;
    const analysis = this.analyzeAndIntegrate(type, charId, option);
    this.history.push({ type, target: charId, option, result: analysis, timestamp: Date.now() });
    return { success: true, analysis, remaining: result.remaining };
  },
  analyzeAndIntegrate(type, charId, option) {
    const char = state.roles?.find(r => r.id === charId);
    const charName = char?.title || char?.name || '角色';
    const templates = {
      reward: {
        '意外财富': `【神奖降临】${charName}今日心情大好，出门散步时在路边捡到一个钱包，里面竟然有大量现金。`,
        '珍贵物品': `【神恩浩荡】${charName}收到一个匿名包裹，里面是一把精致的钥匙和一张地图。`,
        '技能提升': `【顿悟】${charName}在一次意外中激发了潜能，技能突飞猛进。`,
        '贵人相助': `【命运的安排】${charName}在危难时刻遇到一位神秘老者，出手相助。`,
        '好运连连': `【福星高照】${charName}今日诸事顺遂，办事如有神助。`
      },
      punish: {
        '意外损失': `【天道轮回】${charName}今日诸事不顺，先是钱包不慎丢失。`,
        '健康问题': `【身体警告】${charName}突然感到身体不适，需要休养。`,
        '人际冲突': `【口舌之争】${charName}因为一件小事与好友发生争执。`,
        '事业挫折': `【低谷期】${charName}提交的重要方案被否决。`,
        '天灾人祸': `【意外】${charName}途经一处施工现场时突发事故。`
      }
    };
    return (templates[type]?.[option]) || `【${type === 'reward' ? '神奖' : '神罚'}】${charName}体验了${option}。`;
  },
  renderJudgmentPanel(charId) {
    return `
      <div class="nvwa-judgment-panel">
        <div class="nvwa-judgment-header">
          <span class="nvwa-judgment-icon">⚖️</span>
          <span>赏罚系统</span>
        </div>
        ${Object.entries(this.TYPES).map(([key, t]) => `
          <div class="nvwa-judgment-section">
            <div class="nvwa-judgment-section-header">
              <span>${t.icon} ${t.name}</span>
              <span class="nvwa-judgment-cost">${t.cost}点</span>
            </div>
            <div class="nvwa-judgment-options">
              ${t.options.map(opt => `
                <button class="nvwa-judgment-btn" data-type="${key}" data-option="${opt}"
                        onclick="NvwaJudgment.executeJudgment('${key}', '${charId}', '${opt}')">
                  ${opt}
                </button>
              `).join('')}
            </div>
          </div>
        `).join('')}
        <div class="nvwa-judgment-result" id="judgment-result"></div>
      </div>
    `;
  },
  executeJudgment(type, charId, option) {
    if (!NvwaCreativePoints.canAfford(type)) {
      document.getElementById('judgment-result').innerHTML = '<div class="nvwa-error">创意点数不足！</div>';
      return;
    }
    const result = this.execute(type, charId, option);
    if (result.success) {
      document.getElementById('judgment-result').innerHTML = `
        <div class="nvwa-judgment-success">
          <div class="nvwa-result-text">${result.analysis}</div>
          <div class="nvwa-result-meta">剩余点数: ${result.remaining}</div>
        </div>
      `;
    }
  }
};

// ============ 干预系统 ============
const NvwaIntervention = {
  TYPES: {
    oracle: { name: '神谕', icon: '⚡', cost: 10 },
    communicate: { name: '沟通', icon: '💬', cost: 5 },
    skill: { name: '神技', icon: '✨', cost: 20 }
  },
  execute(type, charId, params) {
    const result = NvwaCreativePoints.use(type, params.reason || '');
    if (!result.success) return result;
    return { success: true, result: this.generateResult(type, charId, params), remaining: result.remaining };
  },
  generateResult(type, charId, params) {
    const char = state.roles?.find(r => r.id === charId);
    const charName = char?.title || char?.name || '角色';
    const results = {
      oracle: `【神谕】${charName}脑海中突然响起一个声音："${params.command || '执行指定行动'}"。`,
      communicate: `【心灵对话】${charName}进入冥想状态，与神明展开对话。`,
      skill: `【神技觉醒】${charName}在一次危急时刻爆发潜能，习得了特殊技能。`
    };
    return results[type] || '干预完成';
  },
  renderInterventionPanel(charId) {
    return `
      <div class="nvwa-intervention-panel">
        <div class="nvwa-intervention-header">
          <span class="nvwa-intervention-icon">⚔️</span>
          <span>角色干预</span>
        </div>
        <div class="nvwa-intervention-types">
          ${Object.entries(this.TYPES).map(([key, t]) => `
            <button class="nvwa-intervention-btn" data-type="${key}" onclick="NvwaIntervention.showInput('${key}', '${charId}')">
              <span class="nvwa-btn-icon">${t.icon}</span>
              <span class="nvwa-btn-name">${t.name}</span>
              <span class="nvwa-btn-cost">${t.cost}点</span>
            </button>
          `).join('')}
        </div>
        <div class="nvwa-intervention-result" id="intervention-result"></div>
      </div>
    `;
  },
  showInput(type, charId) {
    if (!NvwaCreativePoints.canAfford(type)) {
      document.getElementById('intervention-result').innerHTML = '<div class="nvwa-error">创意点数不足！</div>';
      return;
    }
    const userInput = prompt(`【${this.TYPES[type].name}】输入指令:`);
    if (userInput) {
      const result = this.execute(type, charId, { reason: userInput, command: userInput });
      if (result.success) {
        document.getElementById('intervention-result').innerHTML = `
          <div class="nvwa-result-success">${result.result}</div>
          <div class="nvwa-result-remaining">剩余点数: ${result.remaining}</div>
        `;
      }
    }
  }
};

// ============ 女娲核心 ============
const NvwaCore = {
  LAYERS: {
    buffer: { name: 'Buffer', icon: '⚡', desc: '瞬时处理' },
    cache: { name: 'Cache', icon: '💫', desc: '短期记忆' },
    core: { name: 'Core', icon: '🧠', desc: '核心记忆' },
    recall: { name: 'Recall', icon: '🔮', desc: '可召回区' },
    archival: { name: 'Archival', icon: '📚', desc: '档案库' }
  },
  state: { selectedCharId: null, activeLayer: 'buffer', memories: [] },
  addMemory(layer, content, emotion) {
    const memory = { id: Date.now().toString(), layer, content, emotion, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }), timestamp: Date.now() };
    this.state.memories.unshift(memory);
    return memory;
  },
  getLayerMemories(layer) {
    return this.state.memories.filter(m => m.layer === layer);
  },
  renderLayerPanel() {
    return `
      <div class="nvwa-layers">
        ${Object.entries(this.LAYERS).map(([key, layer]) => `
          <div class="nvwa-layer ${this.state.activeLayer === key ? 'active' : ''}" data-layer="${key}">
            <span class="nvwa-layer-icon">${layer.icon}</span>
            <span class="nvwa-layer-name">${layer.name}</span>
            <span class="nvwa-layer-count">${this.getLayerMemories(key).length}</span>
          </div>
        `).join('')}
      </div>
    `;
  },
  renderMemoryList() {
    const memories = this.getLayerMemories(this.state.activeLayer);
    if (memories.length === 0) return '<div class="nvwa-empty">该层级暂无记忆</div>';
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
  sampleMemories: [
    { id: 'm1', layer: 'core', time: '10:23', content: '主角「林墨」在废弃实验室发现父亲留下的加密日记。', emotion: '震惊' },
    { id: 'm2', layer: 'core', time: '10:45', content: '林墨激活了残破的AI助手「零」，得知父亲是「创世计划」的核心研究员。', emotion: '恐惧' },
    { id: 'm3', layer: 'recall', time: '昨天', content: '与同伴「苏晴」在安全区相遇，她似乎知道一些内幕但不愿多说。', emotion: '疑惑' },
    { id: 'm4', layer: 'buffer', time: '刚刚', content: '收到神秘信号，来源不明。信号内容：「第二阶段启动，倒计时7天。」', emotion: '紧张' }
  ],
  init(charId) {
    this.state.selectedCharId = charId;
    this.state.memories = this.sampleMemories;
  },
  renderNvwa() {
    const charId = this.state.selectedCharId || 'default';
    return `
      <div class="nvwa-root">
        <div class="nvwa-main">
          ${this.renderLayerPanel()}
          <div class="nvwa-memory-list">${this.renderMemoryList()}</div>
        </div>
        <div class="nvwa-sidebar">
          ${NvwaGlobal.renderGlobalPanel()}
          ${NvwaPsychology.renderPsychologyPanel(charId)}
          ${NvwaCreativePoints.renderPanel()}
          ${NvwaIntervention.renderInterventionPanel(charId)}
          ${NvwaJudgment.renderJudgmentPanel(charId)}
        </div>
      </div>
    `;
  },
  selectLayer(layer) {
    this.state.activeLayer = layer;
    document.querySelector('.nvwa-memory-list').innerHTML = this.renderMemoryList();
  }
};

// 绑定女娲事件
function bindNvwaEvents() {
  document.querySelectorAll('.nvwa-layer').forEach(el => {
    el.addEventListener('click', function() {
      const layer = this.dataset.layer;
      document.querySelectorAll('.nvwa-layer').forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      NvwaUI.selectLayer(layer);
    });
  });
}
