/**
 * SoulWriter - 女娲推演引擎 v4 完整版
 * 
 * 多维度命运操控系统
 */

// ============ 创意点数系统 ============
const NvwaCreativePoints = {
  POINTS_PER_STORY: 100,
  COSTS: { oracle: 10, communicate: 5, punish: 15, reward: 15, skill: 20 },
  state: { totalPoints: 100, usedPoints: 0, history: [] },
  getRemaining() { return this.state.totalPoints - this.state.usedPoints; },
  canAfford(action) { return this.getRemaining() >= this.COSTS[action]; },
  use(action, reason) {
    if (!this.canAfford(action)) return { success: false, message: '创意点数不足' };
    const cost = this.COSTS[action];
    this.state.usedPoints += cost;
    this.state.history.push({ action, cost, reason, timestamp: Date.now() });
    return { success: true, cost, remaining: this.getRemaining() };
  },
  renderPanel() {
    const remaining = this.getRemaining();
    const percent = (remaining / this.state.totalPoints) * 100;
    return `<div class="nvwa-creative-panel"><div class="nvwa-points-header"><span class="nvwa-points-icon">✨</span><span class="nvwa-points-title">创意点数</span><span class="nvwa-points-value">${remaining}/${this.state.totalPoints}</span></div><div class="nvwa-points-bar"><div class="nvwa-points-fill" style="width: ${percent}%"></div></div></div>`;
  }
};

// ============ 女娲心理面板 ============
const NvwaPsychology = {
  DIMENSIONS: ['心情', '想法', '感受', '欲望', '恐惧'],
  getCharacterPsychology(charId) {
    return { mood: Math.floor(Math.random() * 100), thoughts: '正在思考如何逃离困境...', energy: 75, stress: 45 };
  },
  renderPsychologyPanel(charId) {
    const psych = this.getCharacterPsychology(charId);
    return `<div class="nvwa-psych-panel"><div class="nvwa-psych-header"><span class="nvwa-psych-icon">🧠</span><span>心理状态</span></div><div class="nvwa-psych-mood"><div class="nvwa-mood-label">心情</div><div class="nvwa-mood-bar"><div class="nvwa-mood-fill" style="width: ${psych.mood}%"></div></div></div><div class="nvwa-psych-dimensions">${this.DIMENSIONS.map(dim => `<div class="nvwa-dimension"><span class="nvwa-dim-name">${dim}</span><div class="nvwa-dim-bar"><div class="nvwa-dim-fill" style="width: ${Math.random()*100}%"></div></div></div>`).join('')}</div><div class="nvwa-psych-thoughts"><div class="nvwa-thoughts-label">💭 想法</div><div class="nvwa-thoughts-content">${psych.thoughts}</div></div></div>`;
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
    return `<div class="nvwa-global-panel"><div class="nvwa-global-header"><span class="nvwa-global-icon">🌍</span><span>全局控制</span></div><div class="nvwa-global-section"><div class="nvwa-global-label">天气</div><div class="nvwa-weather-grid">${this.WEATHER_TYPES.map(w => `<button class="nvwa-weather-btn ${this.worldSettings.weather === w ? 'active' : ''}" data-weather="${w}" onclick="NvwaGlobal.setWeather('${w}')">${this.getWeatherIcon(w)}</button>`).join('')}</div></div><div class="nvwa-global-section"><div class="nvwa-global-label">时间</div><div class="nvwa-time-grid">${this.TIME_SYSTEMS.map(t => `<button class="nvwa-time-btn ${this.worldSettings.time === t ? 'active' : ''}" data-time="${t}" onclick="NvwaGlobal.setTime('${t}')">${t}</button>`).join('')}</div></div><div class="nvwa-global-section"><div class="nvwa-global-label">季节</div><select class="nvwa-global-select" onchange="NvwaGlobal.setSeason(this.value)"><option value="春" ${this.worldSettings.season === '春' ? 'selected' : ''}>春</option><option value="夏" ${this.worldSettings.season === '夏' ? 'selected' : ''}>夏</option><option value="秋" ${this.worldSettings.season === '秋' ? 'selected' : ''}>秋</option><option value="冬" ${this.worldSettings.season === '冬' ? 'selected' : ''}>冬</option></select></div></div>`;
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
      reward: { '意外财富': `【神奖降临】${charName}今日心情大好，出门散步时在路边捡到一个钱包，里面竟然有大量现金。`, '珍贵物品': `【神恩浩荡】${charName}收到一个匿名包裹，里面是一把精致的钥匙和一张地图。`, '技能提升': `【顿悟】${charName}在一次意外中激发了潜能，技能突飞猛进。`, '贵人相助': `【命运的安排】${charName}在危难时刻遇到一位神秘老者，出手相助。`, '好运连连': `【福星高照】${charName}今日诸事顺遂，办事如有神助。` },
      punish: { '意外损失': `【天道轮回】${charName}今日诸事不顺，先是钱包不慎丢失。`, '健康问题': `【身体警告】${charName}突然感到身体不适，需要休养。`, '人际冲突': `【口舌之争】${charName}因为一件小事与好友发生争执。`, '事业挫折': `【低谷期】${charName}提交的重要方案被否决。`, '天灾人祸': `【意外】${charName}途经一处施工现场时突发事故。` }
    };
    return (templates[type]?.[option]) || `【${type === 'reward' ? '神奖' : '神罚'}】${charName}体验了${option}。`;
  },
  renderJudgmentPanel(charId) {
    return `<div class="nvwa-judgment-panel"><div class="nvwa-judgment-header"><span class="nvwa-judgment-icon">⚖️</span><span>赏罚系统</span></div>${Object.entries(this.TYPES).map(([key, t]) => `<div class="nvwa-judgment-section"><div class="nvwa-judgment-section-header"><span>${t.icon} ${t.name}</span><span class="nvwa-judgment-cost">${t.cost}点</span></div><div class="nvwa-judgment-options">${t.options.map(opt => `<button class="nvwa-judgment-btn" data-type="${key}" data-option="${opt}" onclick="NvwaJudgment.executeJudgment('${key}', '${charId}', '${opt}')">${opt}</button>`).join('')}</div></div>`).join('')}<div class="nvwa-judgment-result" id="judgment-result"></div></div>`;
  },
  executeJudgment(type, charId, option) {
    if (!NvwaCreativePoints.canAfford(type)) { document.getElementById('judgment-result').innerHTML = '<div class="nvwa-error">创意点数不足！</div>'; return; }
    const result = this.execute(type, charId, option);
    if (result.success) document.getElementById('judgment-result').innerHTML = `<div class="nvwa-judgment-success"><div class="nvwa-result-text">${result.analysis}</div><div class="nvwa-result-meta">剩余点数: ${result.remaining}</div></div>`;
  }
};

// ============ 干预系统 ============
const NvwaIntervention = {
  TYPES: { oracle: { name: '神谕', icon: '⚡', cost: 10 }, communicate: { name: '沟通', icon: '💬', cost: 5 }, skill: { name: '神技', icon: '✨', cost: 20 } },
  execute(type, charId, params) {
    const result = NvwaCreativePoints.use(type, params.reason || '');
    if (!result.success) return result;
    return { success: true, result: this.generateResult(type, charId, params), remaining: result.remaining };
  },
  generateResult(type, charId, params) {
    const char = state.roles?.find(r => r.id === charId);
    const charName = char?.title || char?.name || '角色';
    const results = { oracle: `【神谕】${charName}脑海中突然响起一个声音："${params.command || '执行指定行动'}"。`, communicate: `【心灵对话】${charName}进入冥想状态，与神明展开对话。`, skill: `【神技觉醒】${charName}在一次危急时刻爆发潜能，习得了特殊技能。` };
    return results[type] || '干预完成';
  },
  renderInterventionPanel(charId) {
    return `<div class="nvwa-intervention-panel"><div class="nvwa-intervention-header"><span class="nvwa-intervention-icon">⚔️</span><span>角色干预</span></div><div class="nvwa-intervention-types">${Object.entries(this.TYPES).map(([key, t]) => `<button class="nvwa-intervention-btn" data-type="${key}" onclick="NvwaIntervention.showInput('${key}', '${charId}')"><span class="nvwa-btn-icon">${t.icon}</span><span class="nvwa-btn-name">${t.name}</span><span class="nvwa-btn-cost">${t.cost}点</span></button>`).join('')}</div><div class="nvwa-intervention-result" id="intervention-result"></div></div>`;
  },
  showInput(type, charId) {
    if (!NvwaCreativePoints.canAfford(type)) { document.getElementById('intervention-result').innerHTML = '<div class="nvwa-error">创意点数不足！</div>'; return; }
    const userInput = prompt(`【${this.TYPES[type].name}】输入指令:`);
    if (userInput) {
      const result = this.execute(type, charId, { reason: userInput, command: userInput });
      if (result.success) document.getElementById('intervention-result').innerHTML = `<div class="nvwa-result-success">${result.result}</div><div class="nvwa-result-remaining">剩余点数: ${result.remaining}</div>`;
    }
  }
};

// ============ 女娲核心 ============
const NvwaCore = {
  LAYERS: { buffer: { name: 'Buffer', icon: '⚡', desc: '瞬时处理' }, cache: { name: 'Cache', icon: '💫', desc: '短期记忆' }, core: { name: 'Core', icon: '🧠', desc: '核心记忆' }, recall: { name: 'Recall', icon: '🔮', desc: '可召回区' }, archival: { name: 'Archival', icon: '📚', desc: '档案库' } },
  state: { selectedCharId: null, activeLayer: 'buffer', memories: [] },
  addMemory(layer, content, emotion) {
    const memory = { id: Date.now().toString(), layer, content, emotion, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }), timestamp: Date.now() };
    this.state.memories.unshift(memory);
    return memory;
  },
  getLayerMemories(layer) { return this.state.memories.filter(m => m.layer === layer); },
  renderLayerPanel() {
    return `<div class="nvwa-layers">${Object.entries(this.LAYERS).map(([key, layer]) => `<div class="nvwa-layer ${this.state.activeLayer === key ? 'active' : ''}" data-layer="${key}"><span class="nvwa-layer-icon">${layer.icon}</span><span class="nvwa-layer-name">${layer.name}</span><span class="nvwa-layer-count">${this.getLayerMemories(key).length}</span></div>`).join('')}</div>`;
  },
  renderMemoryList() {
    const memories = this.getLayerMemories(this.state.activeLayer);
    if (memories.length === 0) return '<div class="nvwa-empty">该层级暂无记忆</div>';
    return memories.map(m => `<div class="nvwa-memory-card" data-id="${m.id}"><div class="nvwa-memory-header"><span class="nvwa-memory-time">${m.time}</span><span class="nvwa-memory-emotion">${m.emotion || ''}</span></div><div class="nvwa-memory-content">${m.content}</div></div>`).join('');
  }
};

// ============ 顺理成章引擎 ============
const TurnTracker = { turns: [], currentTurn: 0, addTurn(type, result, details = {}) { const turn = { id: Date.now().toString(), turn: ++this.currentTurn, type, result, details, timestamp: Date.now() }; this.turns.push(turn); return turn; }, getStats() { const rewards = this.turns.filter(t => t.type === 'reward').length; const punishments = this.turns.filter(t => t.type === 'punishment').length; return { totalTurns: this.currentTurn, rewards, punishments, balance: rewards - punishments }; } };
const NaturalWriter = { makeNatural(text) { if (typeof text !== 'string') return String(text); return text; } };
const StoryFlowEngine = { state: { context: '', mainChar: '林墨', options: [], history: [] }, init() { this.state.context = ''; this.state.options = []; this.state.history = []; }, setMainChar(name) { this.state.mainChar = name; }, updateContext(newContext) { this.state.context = newContext; }, generateOptions() { let count = 3; const options = [{ id: 1, type: 'reward', lead: `【顺理成章】${this.state.mainChar}在散步时意外发现了一个遗落的包裹...`, followUp: '这为后续剧情埋下了伏笔。', aiSuggestion: '继续推进正向剧情' }, { id: 2, type: 'punishment', lead: `【节外生枝】${this.state.mainChar}正准备离开，却发现自己最重要的东西不见了...`, followUp: '这让事情变得更加复杂。', aiSuggestion: '增加戏剧张力' }, { id: 3, type: 'neutral', lead: `【命运转折】${this.state.mainChar}遇到一个神秘人递来的纸条...`, followUp: '这暗示着即将发生的变化。', aiSuggestion: '保持悬念' }]; this.state.options = options; return options; }, execute(optionId) { const selected = this.state.options.find(o => o.id === optionId); if (!selected) return ''; const result = selected.lead; TurnTracker.addTurn(selected.type, optionId, { option: selected }); this.state.history.push({ optionId, result, timestamp: Date.now() }); return NaturalWriter.makeNatural(result); }, renderPanel() { const options = this.generateOptions(); return `<div class="storyflow-panel"><div class="storyflow-header"><span class="storyflow-icon">🌊</span><span>顺理成章</span><span class="storyflow-turns">回合 #${TurnTracker.currentTurn}</span></div><div class="storyflow-stats"><div class="storyflow-stat"><span class="stat-label">奖励</span><span>${TurnTracker.getStats().rewards}</span><span class="stat-label">惩罚</span><span>${TurnTracker.getStats().punishments}</span></div></div><div class="storyflow-options">${options.map(opt => `<button class="storyflow-option" data-id="${opt.id}"><div class="option-type">${opt.type === 'reward' ? '🌟' : opt.type === 'punishment' ? '⚡' : '💫'}</div><div class="option-content"><div class="option-lead">${opt.lead}</div><div class="option-hint">${opt.aiSuggestion}</div></div></button>`).join('')}</div><div class="storyflow-result" id="storyflow-result"></div></div>`; } };

// ============ 多实体选择器 ============
const MultiEntitySelector = {
  TYPES: ['role', 'item', 'location', 'global'],
  state: { type: 'role', selected: [], available: [] },
  loadAvailable(type) {
    this.state.type = type;
    this.state.selected = [];
    switch(type) { case 'role': this.state.available = state.roles || []; break; case 'item': this.state.available = state.items || []; break; case 'location': this.state.available = state.locations || []; break; default: this.state.available = []; }
    return this.state.available;
  },
  toggle(id) { const idx = this.state.selected.findIndex(s => s.id === id); if (idx >= 0) this.state.selected.splice(idx, 1); else { const entity = this.state.available.find(e => e.id === id); if (entity) this.state.selected.push(entity); } return this.state.selected; },
  toggleAll() { if (this.state.selected.length === this.state.available.length) this.state.selected = []; else this.state.selected = [...this.state.available]; return this.state.selected; },
  render() {
    const type = this.state.type;
    const typeLabels = { role: '角色', item: '物品', location: '地点', global: '全局' };
    const typeIcons = { role: '👤', item: '📦', location: '📍', global: '🌍' };
    return `<div class="multi-selector"><div class="selector-header"><span class="selector-icon">${typeIcons[type]}</span><span>选择${typeLabels[type]}</span><span class="selector-count">已选: ${this.state.selected.length}</span></div><div class="selector-tabs">${this.TYPES.map(t => `<button class="selector-tab ${type === t ? 'active' : ''}" data-type="${t}">${typeIcons[t]} ${typeLabels[t]}</button>`).join('')}</div><div class="selector-list">${this.state.available.length === 0 ? '<div class="selector-empty">暂无可选实体</div>' : ''}${this.state.available.map(e => { const isSelected = this.state.selected.some(s => s.id === e.id); return `<div class="selector-item ${isSelected ? 'selected' : ''}" data-id="${e.id}"><input type="checkbox" ${isSelected ? 'checked' : ''}><span class="selector-item-name">${e.title || e.name || '未命名'}</span></div>`; }).join('')}</div><div class="selector-actions"><button class="btn-toggle-all" onclick="MultiEntitySelector.toggleAll()">${this.state.selected.length === this.state.available.length ? '取消全选' : '全选'}</button></div></div>`;
  },
  bindEvents() {
    document.querySelectorAll('.selector-tab').forEach(tab => { tab.addEventListener('click', () => { const type = tab.dataset.type; this.loadAvailable(type); document.querySelector('.multi-selector').innerHTML = this.render(); this.bindEvents(); }); });
    document.querySelectorAll('.selector-item').forEach(item => { item.addEventListener('click', () => { const id = item.dataset.id; this.toggle(id); item.classList.toggle('selected'); item.querySelector('input').checked = !item.querySelector('input').checked; document.querySelector('.selector-count').textContent = `已选: ${this.state.selected.length}`; }); });
  }
};

// ============ K线图表 ============
const KLineChart = {
  data: [],
  config: { width: 280, height: 120, candleWidth: 8, gap: 4 },
  addCandle(open, close, high, low) { this.data.push({ open, close, high, low, time: Date.now() }); if (this.data.length > 30) this.data.shift(); },
  render() {
    const data = this.data.length > 0 ? this.data : this.generateMockData();
    const { width, height, candleWidth, gap } = this.config;
    let html = `<div class="kline-container"><svg class="kline-svg" viewBox="0 0 ${width} ${height}">`;
    for (let i = 0; i < 5; i++) { const y = (height / 5) * i; html += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" class="kline-grid"/>`; }
    data.forEach((candle, i) => { const x = i * (candleWidth + gap) + gap; const isUp = candle.close >= candle.open; const color = isUp ? '#10b981' : '#ef4444'; const bodyTop = Math.min(candle.open, candle.close); const bodyHeight = Math.max(1, Math.abs(candle.close - candle.open)); html += `<rect x="${x}" y="${bodyTop}" width="${candleWidth}" height="${bodyHeight}" fill="${color}"/>`; html += `<line x1="${x + candleWidth/2}" y1="${candle.high}" x2="${x + candleWidth/2}" y2="${candle.low}" stroke="${color}" stroke-width="1"/>`; });
    html += `</svg><div class="kline-ai-prediction"><span class="kline-label">AI预测:</span><span class="kline-trend ${data.trend || 'up'}">📈 上涨</span></div><div class="kline-controls"><button class="kline-btn buy" onclick="KLineChart.addCandle(100, 105, 108, 98)">买入</button><button class="kline-btn sell" onclick="KLineChart.addCandle(100, 95, 103, 92)">卖出</button></div></div>`;
    return html;
  },
  generateMockData() { const data = []; let price = 100; for (let i = 0; i < 20; i++) { const change = (Math.random() - 0.5) * 10; const open = price; const close = price + change; data.push({ open, close, high: Math.max(open, close) + Math.random() * 3, low: Math.min(open, close) - Math.random() * 3 }); price = close; } return data; }
};

// ============ 因果链 ============
const CausalChain = {
  nodes: [], edges: [],
  addEvent(event) { const node = { id: Date.now().toString(), type: event.type, name: event.name, description: event.description, timestamp: Date.now() }; this.nodes.push(node); return node; },
  propagate(event, action) { affectedNodes = this.nodes.filter(n => n.type === 'character'); affectedNodes.forEach(node => { this.addEvent({ type: 'effect', name: `连锁: ${node.name}`, description: `受${action}影响...` }); }); },
  renderChainPanel() { return `<div class="causal-chain-panel"><div class="chain-header"><span class="chain-icon">🔗</span><span>因果链</span></div><div class="chain-visual">${this.nodes.slice(-3).map(n => `<div class="chain-node ${n.type}"><span class="chain-node-name">${n.name}</span></div>`).join('') || '<div class="chain-empty">暂无因果记录</div>'}</div><div class="chain-controls"><button class="chain-btn" onclick="CausalChain.nodes=[]">清除</button></div></div>`; }
};

// ============ 变数系统 ============
const VariationSystem = {
  TYPES: { sudden: { name: '突发', icon: '⚡', desc: '即时' }, gradual: { name: '渐进', icon: '🌊', desc: '延迟' }, chain: { name: '连锁', icon: '🔗', desc: '触发' } },
  createVariation(type, targets, content) { const config = this.TYPES[type] || this.TYPES.sudden; const variation = { id: Date.now().toString(), type, targets, content, timestamp: Date.now() }; this.executeVariation(variation); return variation; },
  executeVariation(v) { CausalChain.addEvent({ type: 'cause', name: v.type, description: v.content }); },
  renderVariationPanel() { return `<div class="variation-panel"><div class="variation-header"><span class="variation-icon">🎲</span><span>变数设计</span></div><div class="variation-types">${Object.entries(this.TYPES).map(([key, t]) => `<button class="variation-type-btn ${key === 'sudden' ? 'active' : ''}" data-type="${key}"><span class="vtype-icon">${t.icon}</span><span class="vtype-name">${t.name}</span><span class="vtype-desc">${t.desc}</span></button>`).join('')}</div><textarea class="variation-content" placeholder="描述变数..."></textarea><button class="btn-create-variation" onclick="VariationSystem.createFromForm()">创建</button></div>`; },
  createFromForm() { const content = document.querySelector('.variation-content')?.value; const type = document.querySelector('.variation-type-btn.active')?.dataset.type || 'sudden'; const selected = MultiEntitySelector.state.selected; if (!content) { alert('请输入变数内容'); return; } this.createVariation(type, selected.length > 0 ? selected : [{id: 'global', name: '全局'}], content); alert('变数已创建'); }
};

// ============ 女娲主UI ============
const NvwaUI = { ...NvwaCore, sampleMemories: [{ id: 'm1', layer: 'core', time: '10:23', content: '主角「林墨」在废弃实验室发现父亲留下的加密日记。', emotion: '震惊' }, { id: 'm2', layer: 'core', time: '10:45', content: '林墨激活了残破的AI助手「零」，得知父亲是「创世计划」的核心研究员。', emotion: '恐惧' }, { id: 'm3', layer: 'recall', time: '昨天', content: '与同伴「苏晴」在安全区相遇，她似乎知道一些内幕但不愿多说。', emotion: '疑惑' }, { id: 'm4', layer: 'buffer', time: '刚刚', content: '收到神秘信号，来源不明。', emotion: '紧张' }], init(charId) { this.state.selectedCharId = charId; this.state.memories = this.sampleMemories; MultiEntitySelector.loadAvailable('role'); }, selectLayer(layer) { this.state.activeLayer = layer; document.querySelector('.nvwa-memory-list').innerHTML = this.renderMemoryList(); } };
const NvwaUIV4 = { ...NvwaCore, renderNvwaV4() { const charId = MultiEntitySelector.state.selected[0]?.id || 'default'; return `<div class="nvwa-root nvwa-v4"><div class="nvwa-main">${this.renderLayerPanel()}<div class="nvwa-memory-list">${this.renderMemoryList()}</div></div><div class="nvwa-sidebar">${NvwaGlobal.renderGlobalPanel()}${MultiEntitySelector.render()}${KLineChart.render()}${NvwaPsychology.renderPsychologyPanel(charId)}${NvwaCreativePoints.renderPanel()}${NvwaIntervention.renderInterventionPanel(charId)}${NvwaJudgment.renderJudgmentPanel(charId)}${StoryFlowEngine.renderPanel()}${CausalChain.renderChainPanel()}${VariationSystem.renderVariationPanel()}</div></div>`; } };

// ============ 事件绑定 ============
function bindNvwaEvents() {
  document.querySelectorAll('.nvwa-layer').forEach(el => { el.addEventListener('click', function() { const layer = this.dataset.layer; document.querySelectorAll('.nvwa-layer').forEach(l => l.classList.remove('active')); this.classList.add('active'); NvwaUI.selectLayer(layer); }); });
  MultiEntitySelector.bindEvents();
  document.querySelectorAll('.storyflow-option').forEach(btn => { btn.addEventListener('click', function() { const id = parseInt(this.dataset.id); const result = StoryFlowEngine.execute(id); document.getElementById('storyflow-result').innerHTML = '<div class="storyflow-result-text">' + result + '</div>'; }); });
  document.querySelectorAll('.variation-type-btn').forEach(btn => { btn.addEventListener('click', function() { document.querySelectorAll('.variation-type-btn').forEach(b => b.classList.remove('active')); this.classList.add('active'); }); });
}
