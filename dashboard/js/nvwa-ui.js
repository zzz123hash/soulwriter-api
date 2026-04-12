/**
 * SoulWriter - 女娲推演引擎 沉浸式 UI
 * Nvwa Engine - Immersive Memory Visualization
 * 
 * 记忆分层：Buffer → Cache → Core → Recall → Archival
 */

const NvwaUI = {
  // 层级定义
  LAYERS: {
    buffer: { name: 'Buffer', icon: '⚡', desc: '瞬时处理区', color: '#3b82f6' },
    cache: { name: 'Cache', icon: '💫', desc: '短期缓存', color: '#06b6d4' },
    core: { name: 'Core', icon: '🧠', desc: '核心记忆', color: '#f59e0b' },
    recall: { name: 'Recall', icon: '🔮', desc: '可召回区', color: '#8b5cf6' },
    archival: { name: 'Archival', icon: '📚', desc: '档案库', color: '#6b7280' }
  },

  // 当前状态
  state: {
    selectedCharId: null,
    activeLayer: 'buffer',
    memories: [],
    isProcessing: false
  },

  // 记忆数据
  sampleMemories: [
    {
      id: 'm1',
      layer: 'core',
      time: '10:23',
      content: '主角「林墨」在废弃实验室发现父亲留下的加密日记。日记扉页写着：「觉醒不是开始，而是回归。」',
      emotion: '震惊',
      location: '废弃实验室',
      importance: 5
    },
    {
      id: 'm2',
      layer: 'core',
      time: '10:45',
      content: '林墨激活了残破的AI助手「零」，得知父亲是「创世计划」的核心研究员。零透露：人类正在被逐渐「替换」。',
      emotion: '恐惧',
      location: '实验室深处',
      importance: 5
    },
    {
      id: 'm3',
      layer: 'recall',
      time: '昨天',
      content: '与同伴「苏晴」在安全区相遇，她似乎知道一些内幕但不愿多说。',
      emotion: '疑惑',
      location: '安全区',
      importance: 3
    },
    {
      id: 'm4',
      layer: 'buffer',
      time: '刚刚',
      content: '收到神秘信号，来源不明。信号内容：「第二阶段启动，倒计时7天。」',
      emotion: '紧张',
      location: '未知',
      importance: 4
    },
    {
      id: 'm5',
      layer: 'cache',
      time: '今天早上',
      content: '林墨回想起父亲曾经说过的话：「不要相信你看到的，除非它通过了女娲的验证。」',
      emotion: '困惑',
      location: '住所',
      importance: 2
    }
  ],

  // 渲染女娲标签页
  render() {
    return '<div class="nvwa-tab-root">' + this.renderContainer() + '</div>';
  },

  renderContainer() {
    return `
      <div class="nvwa-container">
        ${this.renderHeader()}
        ${this.renderMainContent()}
        ${this.renderInputSection()}
      </div>
    `;
  },

  // 头部
  renderHeader() {
    return `
      <div class="nvwa-header">
        <div class="nvwa-title">
          <div class="nvwa-title-icon">🔮</div>
          <div>
            <div class="nvwa-title-text">女娲推演引擎</div>
            <div class="nvwa-title-sub">Nvwa Simulation Engine v2</div>
          </div>
        </div>
        ${this.renderFlow()}
      </div>
    `;
  },

  // 流程可视化
  renderFlow() {
    const steps = [
      { id: 'input', icon: '⚡', label: '输入' },
      { id: 'process', icon: '🧠', label: '推理' },
      { id: 'evolve', icon: '🌱', label: '演化' }
    ];
    
    return `
      <div class="nvwa-flow">
        ${steps.map((step, idx) => {
          let cls = '';
          if (this.state.isProcessing) {
            if (idx === 0) cls = 'active';
            else if (idx === 1) cls = 'done';
          } else {
            if (idx === 0) cls = 'done';
            if (idx === 2) cls = 'active';
          }
          return `
            <div class="nvwa-flow-step ${cls}">
              <span>${step.icon}</span>
              <span>${step.label}</span>
            </div>
            ${idx < steps.length - 1 ? '<span class="nvwa-flow-arrow">→</span>' : ''}
          `;
        }).join('')}
      </div>
    `;
  },

  // 主内容区
  renderMainContent() {
    return `
      <div class="nvwa-main">
        ${this.renderSidebar()}
        ${this.renderMemoryPanel()}
      </div>
    `;
  },

  // 左侧角色选择
  renderSidebar() {
    const chars = window.state?.roles || [];
    const selectedId = this.state.selectedCharId;
    
    // 默认选中第一个
    if (!selectedId && chars.length > 0) {
      this.state.selectedCharId = chars[0].id;
    }
    
    const charItems = chars.length > 0 
      ? chars.map(c => `
          <div class="nvwa-char-item ${c.id === selectedId ? 'active' : ''}" data-id="${c.id}">
            <div class="nvwa-char-avatar">${(c.name || '?').charAt(0)}</div>
            <div class="nvwa-char-info">
              <div class="nvwa-char-name">${c.name || '未命名'}</div>
              <div class="nvwa-char-role">${c.type || '角色'}</div>
            </div>
          </div>
        `).join('')
      : '<div class="nvwa-empty-text">暂无角色数据</div>';

    return `
      <div class="nvwa-sidebar">
        <div class="nvwa-section-title">👤 角色列表</div>
        <div class="nvwa-char-list">
          ${charItems}
        </div>
      </div>
    `;
  },

  // 右侧记忆面板
  renderMemoryPanel() {
    const layer = this.state.activeLayer;
    const memories = this.getMemoriesByLayer(layer);
    
    return `
      <div class="nvwa-memory-panel">
        ${this.renderStats()}
        ${this.renderTabs()}
        <div class="nvwa-content">
          ${memories.length > 0 
            ? memories.map(m => this.renderMemoryCard(m)).join('')
            : this.renderEmpty(layer)
          }
          ${this.renderAddButton()}
        </div>
      </div>
    `;
  },

  // 统计卡片
  renderStats() {
    const counts = this.getLayerCounts();
    return `
      <div class="nvwa-stats">
        ${Object.entries(this.LAYERS).map(([key, layer]) => `
          <div class="nvwa-stat-card ${key}" onclick="NvwaUI.setLayer('${key}')" title="${layer.desc}">
            <div class="nvwa-stat-num">${counts[key] || 0}</div>
            <div class="nvwa-stat-label">${layer.icon} ${layer.name}</div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // 层级标签页
  renderTabs() {
    const active = this.state.activeLayer;
    return `
      <div class="nvwa-tabs">
        ${Object.entries(this.LAYERS).map(([key, layer]) => `
          <button class="nvwa-tab ${key === active ? 'active' : ''}" data-layer="${key}" onclick="NvwaUI.setLayer('${key}')">
            <span class="nvwa-tab-icon">${layer.icon}</span>
            ${layer.name}
          </button>
        `).join('')}
      </div>
    `;
  },

  // 记忆卡片
  renderMemoryCard(mem) {
    const importanceColor = mem.importance >= 4 ? 'high' : mem.importance >= 3 ? 'medium' : 'low';
    
    return `
      <div class="nvwa-memory-card ${mem.layer}">
        <div class="nvwa-card-header">
          <div class="nvwa-card-time">🕐 ${mem.time}</div>
          <div class="nvwa-card-tags">
            ${mem.emotion ? `<span class="nvwa-tag emotion">${mem.emotion}</span>` : ''}
            ${mem.location ? `<span class="nvwa-tag location">📍 ${mem.location}</span>` : ''}
          </div>
          <div class="nvwa-card-actions">
            <button class="nvwa-card-btn" title="编辑记忆">✏️</button>
            <button class="nvwa-card-btn delete" title="删除" onclick="NvwaUI.deleteMemory('${mem.id}')">🗑️</button>
          </div>
        </div>
        <div class="nvwa-card-content">${this.escapeHtml(mem.content)}</div>
        <div class="nvwa-card-footer">
          <div class="nvwa-card-importance">
            <span>重要度</span>
            <div class="nvwa-importance-dots">
              ${[1,2,3,4,5].map(i => `
                <div class="nvwa-importance-dot ${i <= mem.importance ? `filled ${importanceColor}` : ''}"></div>
              `).join('')}
            </div>
          </div>
          <button class="nvwa-card-btn" onclick="NvwaUI.promoteMemory('${mem.id}')" title="升华到更深层" style="font-size:11px;width:auto;padding:0 8px;">
            ⬆️ 升华
          </button>
        </div>
      </div>
    `;
  },

  // 空状态
  renderEmpty(layer) {
    const l = this.LAYERS[layer];
    const hints = {
      buffer: '在下方输入内容，创建第一条记忆',
      cache: '从 Buffer 层升华获取',
      core: '从缓存层提炼核心记忆',
      recall: '核心记忆经时间沉淀后转移至此',
      archival: '久远的记忆存档'
    };
    
    return `
      <div class="nvwa-empty">
        <div class="nvwa-empty-icon">${l.icon}</div>
        <div class="nvwa-empty-text">${l.name} 层暂无记忆</div>
        <div class="nvwa-empty-hint">${hints[layer] || l.desc}</div>
      </div>
    `;
  },

  // 添加按钮
  renderAddButton() {
    return `
      <button class="nvwa-add-memory" onclick="NvwaUI.showAddModal()">
        <span>➕</span> 添加记忆
      </button>
    `;
  },

  // 输入区域
  renderInputSection() {
    const chars = window.state?.roles || [];
    const selectedChar = chars.find(c => c.id === this.state.selectedCharId);
    
    return `
      <div class="nvwa-input-section">
        <div class="nvwa-input-header">
          <div class="nvwa-input-title">
            <span>📝</span> 输入推演指令
          </div>
          <div class="nvwa-char-selector">
            ${chars.map(c => `
              <span class="nvwa-char-chip ${c.id === this.state.selectedCharId ? 'selected' : ''}" data-id="${c.id}" onclick="NvwaUI.selectChar('${c.id}')">
                ${c.name || '?'}
              </span>
            `).join('')}
          </div>
        </div>
        <textarea class="nvwa-textarea" id="nvwa-input" placeholder="输入剧情片段、AI指令或对话，女娲将自动分析并生成记忆..."></textarea>
        <div class="nvwa-input-footer">
          <div class="nvwa-input-hint">💡 提示：选择角色后输入，可绑定记忆归属</div>
          <button class="nvwa-submit-btn" id="nvwa-submit-btn" onclick="NvwaUI.submitInput()">
            <span>🚀</span> 开始推演
          </button>
        </div>
      </div>
    `;
  },

  // ============ 交互方法 ============

  setLayer(layer) {
    this.state.activeLayer = layer;
    this.refresh();
  },

  selectChar(id) {
    this.state.selectedCharId = id;
    this.refresh();
  },

  getMemoriesByLayer(layer) {
    return this.sampleMemories.filter(m => m.layer === layer);
  },

  getLayerCounts() {
    const counts = {};
    Object.keys(this.LAYERS).forEach(k => counts[k] = 0);
    this.sampleMemories.forEach(m => {
      if (counts[m.layer] !== undefined) counts[m.layer]++;
    });
    return counts;
  },

  promoteMemory(id) {
    const mem = this.sampleMemories.find(m => m.id === id);
    if (!mem) return;
    
    const order = ['buffer', 'cache', 'core', 'recall', 'archival'];
    const idx = order.indexOf(mem.layer);
    if (idx < order.length - 1) {
      mem.layer = order[idx + 1];
      this.refresh();
    }
  },

  deleteMemory(id) {
    if (!confirm('确定删除这条记忆？')) return;
    this.sampleMemories = this.sampleMemories.filter(m => m.id !== id);
    this.refresh();
  },

  showAddModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay open';
    modal.innerHTML = `
      <div class="modal-box" style="width: 520px;">
        <div class="modal-title">➕ 添加记忆</div>
        <div class="modal-body">
          <div class="field">
            <label>记忆内容</label>
            <textarea id="new-memory-content" rows="4" placeholder="输入记忆内容..."></textarea>
          </div>
          <div class="field-row">
            <div class="field">
              <label>情感标签</label>
              <input type="text" id="new-memory-emotion" placeholder="如：震惊、恐惧">
            </div>
            <div class="field">
              <label>地点</label>
              <input type="text" id="new-memory-location" placeholder="发生地点">
            </div>
          </div>
          <div class="field">
            <label>重要度 (1-5)</label>
            <input type="range" id="new-memory-importance" min="1" max="5" value="3" style="width: 100%;">
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">取消</button>
          <button class="btn btn-primary" onclick="NvwaUI.addMemory()">添加</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // 绑定关闭事件
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  },

  addMemory() {
    const content = document.getElementById('new-memory-content')?.value;
    if (!content?.trim()) return;

    const newMem = {
      id: 'm_' + Date.now(),
      layer: 'buffer',
      time: '刚刚',
      content: content.trim(),
      emotion: document.getElementById('new-memory-emotion')?.value || '',
      location: document.getElementById('new-memory-location')?.value || '',
      importance: parseInt(document.getElementById('new-memory-importance')?.value || '3')
    };

    this.sampleMemories.unshift(newMem);
    document.querySelector('.modal-overlay')?.remove();
    this.refresh();
  },

  submitInput() {
    const input = document.getElementById('nvwa-input');
    if (!input?.value.trim()) return;

    const btn = document.getElementById('nvwa-submit-btn');
    if (btn) btn.disabled = true;

    this.state.isProcessing = true;
    this.refresh();

    // 模拟 AI 处理
    setTimeout(() => {
      this.sampleMemories.unshift({
        id: 'm_' + Date.now(),
        layer: 'buffer',
        time: '刚刚',
        content: input.value.trim(),
        emotion: '',
        location: '',
        importance: 3
      });
      
      input.value = '';
      this.state.isProcessing = false;
      
      if (btn) btn.disabled = false;
      this.refresh();
    }, 2000);
  },

  refresh() {
    const root = document.getElementById('nvwa-tab-root');
    if (root) {
      root.innerHTML = this.renderContainer();
      this.bindEvents();
    }
  },

  bindEvents() {
    // 角色选择
    document.querySelectorAll('.nvwa-char-item').forEach(el => {
      el.addEventListener('click', () => {
        this.selectChar(el.dataset.id);
      });
    });
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  init() {
    // 默认选中第一个角色
    const chars = window.state?.roles || [];
    if (chars.length > 0 && !this.state.selectedCharId) {
      this.state.selectedCharId = chars[0].id;
    }
    return this.renderContainer();
  }
};

// 导出
window.NvwaUI = NvwaUI;
