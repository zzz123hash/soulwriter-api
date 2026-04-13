/**
 * SoulWriter - 女娲推演系统 v5
 * 持久化循环 + Team Mode验证
 * 
 * 灵感来源：Claude Code Ralph Mode
 */

const NvwaSystem = {
  // ============ 状态机 ============
  state: {
    status: 'idle', // idle/queued/processing/reviewing/completed/failed
    currentTask: null,
    queue: [],
    results: [],
    progress: 0
  },
  
  // ============ 女娲能力列表 ============
  capabilities: {
    memory: {
      name: '记忆操控',
      icon: '🧠',
      desc: '增删改查角色记忆',
      routes: ['nvwa.memory']
    },
    fate: {
      name: '命运操控',
      icon: '🎭',
      desc: '推演剧情发展方向',
      routes: ['nvwa.fate']
    },
    psychology: {
      name: '心理分析',
      icon: '💭',
      desc: '深度角色心理洞察',
      routes: ['nvwa.psychology']
    },
    kline: {
      name: 'K线分析',
      icon: '📊',
      desc: '剧情张力可视化',
      routes: ['nvwa.kline']
    },
    analysis: {
      name: '深度分析',
      icon: '🔮',
      desc: '全方位分析',
      routes: ['nvwa.analysis']
    },
    relation: {
      name: '关系图谱',
      icon: '🔗',
      desc: '角色关系网络',
      routes: ['nvwa.relation']
    }
  },
  
  // ============ 初始化 ============
  init() {
    console.log('🔮 NvwaSystem v5 initialized');
    this.loadQueue();
  },
  
  // ============ 加载队列 ============
  loadQueue() {
    const saved = localStorage.getItem('sw_nvwa_queue');
    if (saved) {
      this.state.queue = JSON.parse(saved);
    }
  },
  
  // ============ 保存队列 ============
  saveQueue() {
    localStorage.setItem('sw_nvwa_queue', JSON.stringify(this.state.queue));
  },
  
  // ============ 添加任务 ============
  addTask(capability, input, options = {}) {
    const task = {
      id: 'nvwa_' + Date.now(),
      capability,
      input,
      options,
      status: 'queued',
      createdAt: Date.now(),
      attempts: 0
    };
    
    this.state.queue.push(task);
    this.saveQueue();
    
    // 如果空闲，开始处理
    if (this.state.status === 'idle') {
      this.processNext();
    }
    
    return task.id;
  },
  
  // ============ 处理下一个任务 ============
  async processNext() {
    if (this.state.queue.length === 0) {
      this.state.status = 'idle';
      return;
    }
    
    const task = this.state.queue.shift();
    this.saveQueue();
    
    this.state.currentTask = task;
    this.state.status = 'processing';
    this.state.progress = 0;
    
    this.updateUI();
    
    try {
      // Worker处理
      this.state.progress = 20;
      this.updateUI();
      
      const workerResult = await this.workerProcess(task);
      this.state.progress = 50;
      this.updateUI();
      
      // Reviewer验证
      this.state.status = 'reviewing';
      this.updateUI();
      
      const reviewResult = await this.reviewerVerify(workerResult, task);
      this.state.progress = 80;
      this.updateUI();
      
      // Architect检查
      const architectResult = await this.architectCheck(reviewResult, task);
      
      // 完成
      this.state.results.push({
        task,
        result: architectResult,
        completedAt: Date.now()
      });
      
      this.state.status = 'completed';
      this.state.progress = 100;
      this.updateUI();
      
      // 通知用户
      this.notifyCompletion(architectResult);
      
    } catch (error) {
      console.error('Nvwa processing error:', error);
      task.attempts++;
      
      if (task.attempts < 3) {
        // 重试
        this.state.queue.unshift(task);
        this.saveQueue();
      } else {
        this.state.results.push({
          task,
          error: error.message,
          failedAt: Date.now()
        });
      }
      
      this.state.status = 'failed';
      this.updateUI();
    }
    
    // 处理下一个
    setTimeout(() => this.processNext(), 1000);
  },
  
  // ============ Worker处理 ============
  async workerProcess(task) {
    const { capability, input } = task;
    
    // 根据能力生成提示词
    const prompt = this.generatePrompt(capability, input);
    
    // 调用AI（使用路由系统）
    const result = await RouteSystem.callWithRoute(
      `nvwa.${capability}`,
      prompt,
      { temperature: 0.8 }
    );
    
    return {
      raw: result,
      capability,
      timestamp: Date.now()
    };
  },
  
  // ============ Reviewer验证 ============
  async reviewerVerify(result, task) {
    const reviewPrompt = `请验证以下AI输出的质量：

输出：
${result.raw}

验证要点：
1. 事实准确性
2. 逻辑一致性
3. 角色设定符合度

给出验证结果和改进建议。`;
    
    const review = await RouteSystem.callWithRoute(
      'nvwa.analysis',
      reviewPrompt,
      { temperature: 0.5 }
    );
    
    return {
      ...result,
      review,
      verified: true
    };
  },
  
  // ============ Architect检查 ============
  async architectCheck(result, task) {
    const architectPrompt = `请从世界观和角色设定角度检查：

输出：
${result.raw}

请确认是否符合：
1. 世界观设定
2. 角色性格
3. 故事逻辑

给出最终结论。`;
    
    const check = await RouteSystem.callWithRoute(
      'nvwa.fate',
      architectPrompt,
      { temperature: 0.3 }
    );
    
    return {
      ...result,
      architect: check,
      approved: true
    };
  },
  
  // ============ 生成提示词 ============
  generatePrompt(capability, input) {
    const templates = {
      memory: `角色记忆操作：
类型：${input.action || '添加'}
角色：${input.characterName || '未指定'}
内容：${input.content || ''}

请生成符合角色设定的记忆内容。`,
      
      fate: `命运推演：
主角：${input.protagonist || '未指定'}
当前状态：${input.state || '未指定'}

请从三个方向给出建议：
1. 🌟 奖励方向
2. ⚡ 惩罚方向  
3. 💫 转折方向`,
      
      psychology: `心理分析：
角色：${input.characterName || '未指定'}
情境：${input.situation || '未指定'}

请深度分析：
1. 表面行为
2. 内心动机
3. 潜在恐惧
4. 成长需求`,
      
      kline: `K线分析：
请分析以下剧情的张力变化：
${input.events || '无事件'}

生成类似K线的张力图表数据。`,
      
      analysis: `深度分析：
分析对象：${input.target || '未指定'}
分析角度：${input.aspect || '全方位'}

请给出全面分析报告。`
    };
    
    return templates[capability] || '请处理以下请求：' + JSON.stringify(input);
  },
  
  // ============ 通知完成 ============
  notifyCompletion(result) {
    // 可以在女娲面板显示通知
    if (typeof onNvwaComplete === 'function') {
      onNvwaComplete(result);
    }
  },
  
  // ============ 更新UI ============
  updateUI() {
    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('nvwaStatusChange', {
      detail: this.state
    }));
  },
  
  // ============ 渲染女娲面板 ============
  renderPanel() {
    const html = `
      <div class="nvwa-panel">
        <div class="nvwa-header">
          <span class="nvwa-icon">🔮</span>
          <span class="nvwa-title">女娲推演</span>
          <span class="nvwa-status" id="nvwa-status">${this.getStatusLabel()}</span>
        </div>
        
        <div class="nvwa-capabilities">
          ${Object.entries(this.capabilities).map(([key, cap]) => `
            <button class="nvwa-cap-btn" data-cap="${key}" onclick="NvwaSystem.startTask('${key}')">
              <span class="cap-icon">${cap.icon}</span>
              <span class="cap-name">${cap.name}</span>
            </button>
          `).join('')}
        </div>
        
        <div class="nvwa-queue" id="nvwa-queue">
          ${this.renderQueue()}
        </div>
        
        <div class="nvwa-progress" id="nvwa-progress" style="display: ${this.state.status !== 'idle' ? 'block' : 'none'}">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${this.state.progress}%"></div>
          </div>
          <div class="progress-text">${this.state.progress}%</div>
        </div>
      </div>
    `;
    
    return html;
  },
  
  // ============ 渲染队列 ============
  renderQueue() {
    if (this.state.queue.length === 0 && this.state.status === 'idle') {
      return '<div class="queue-empty">暂无任务，点击上方能力开始</div>';
    }
    
    return this.state.queue.map(task => `
      <div class="queue-item">
        <span class="queue-icon">${this.capabilities[task.capability]?.icon || '📝'}</span>
        <span class="queue-name">${this.capabilities[task.capability]?.name || task.capability}</span>
        <span class="queue-status">排队中</span>
      </div>
    `).join('');
  },
  
  // ============ 获取状态标签 ============
  getStatusLabel() {
    const labels = {
      idle: '🟢 待机',
      queued: '🟡 排队',
      processing: '🔵 处理中',
      reviewing: '🟣 验证中',
      completed: '🟢 完成',
      failed: '🔴 失败'
    };
    return labels[this.state.status] || '⚪ 未知';
  },
  
  // ============ 开始任务 ============
  startTask(capability) {
    const input = this.getInputForCapability(capability);
    this.addTask(capability, input);
  },
  
  // ============ 获取能力输入 ============
  getInputForCapability(capability) {
    // 这里可以弹窗让用户输入
    return {
      capability,
      characterName: window.state?.selectedCharacter?.name || '林墨',
      state: '正在探索世界',
      situation: '面临一个选择'
    };
  }
};

// 全局访问
window.NvwaSystem = NvwaSystem;

// ============ 女娲面板样式 ============
const nvwaPanelCSS = `
.nvwa-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg2);
  border-radius: var(--radius);
  overflow: hidden;
}

.nvwa-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.nvwa-icon {
  font-size: 24px;
}

.nvwa-title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
}

.nvwa-status {
  font-size: 12px;
  padding: 4px 10px;
  background: rgba(255,255,255,0.2);
  border-radius: 12px;
}

.nvwa-capabilities {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 12px;
}

.nvwa-cap-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.nvwa-cap-btn:hover {
  background: var(--bg3);
  border-color: var(--primary);
  transform: translateY(-2px);
}

.cap-icon {
  font-size: 24px;
}

.cap-name {
  font-size: 11px;
  color: var(--text);
  text-align: center;
}

.nvwa-queue {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}

.queue-empty {
  text-align: center;
  padding: 30px;
  color: var(--text2);
  font-size: 13px;
}

.queue-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: var(--bg);
  border-radius: 8px;
  margin-bottom: 8px;
}

.queue-icon {
  font-size: 18px;
}

.queue-name {
  flex: 1;
  font-size: 13px;
  color: var(--text);
}

.queue-status {
  font-size: 11px;
  color: var(--text2);
}

.nvwa-progress {
  padding: 12px;
  border-top: 1px solid var(--border);
}

.progress-bar {
  height: 6px;
  background: var(--bg);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--accent));
  transition: width 0.3s;
}

.progress-text {
  text-align: center;
  font-size: 12px;
  color: var(--text2);
}
`;

// 注入样式
if (!document.getElementById('nvwa-panel-css')) {
  const style = document.createElement('style');
  style.id = 'nvwa-panel-css';
  style.textContent = nvwaPanelCSS;
  document.head.appendChild(style);
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => NvwaSystem.init(), 500);
});


// ============ 兼容性导出 ============
window.NvwaUIV4 = {
  renderNvwaV4: function() {
    return NvwaSystem.renderPanel();
  }
};


// ============ NvwaUI 兼容性 ============
window.NvwaUI = {
  init: function() {
    console.log('NvwaUI init');
  }
};
