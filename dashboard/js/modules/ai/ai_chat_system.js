/**
 * SoulWriter - AI对话系统 v1
 * 
 * 类似OpenCode CLI/TUI的AI交互界面
 * 支持原生API调用
 */

const AISystem = {
  // 配置
  config: {
    apiEndpoint: '/api/v1/ai/chat',
    model: 'gpt-4',
    maxTokens: 2000,
    temperature: 0.7,
    historyLimit: 50
  },
  
  // 状态
  state: {
    messages: [],        // 对话历史
    isThinking: false,   // AI思考中
    isStreaming: false,   // 流式输出
    currentSession: null
  },
  
  // ============ 初始化 ============
  init() {
    this.renderPanel();
    this.bindEvents();
    console.log('🤖 AISystem initialized');
  },
  
  // ============ 渲染对话面板 ============
  renderPanel() {
    const html = `
      <div class="ai-chat-panel" id="ai-chat-panel">
        <div class="ai-chat-header">
          <div class="ai-header-left">
            <span class="ai-status" id="ai-status">
              <span class="ai-status-dot"></span>
              <span class="ai-status-text">待机</span>
            </span>
          </div>
          <div class="ai-header-right">
            <button class="ai-btn-icon" id="ai-settings-btn" title="设置">⚙️</button>
            <button class="ai-btn-icon" id="ai-clear-btn" title="清空">🗑️</button>
          </div>
        </div>
        
        <div class="ai-chat-messages" id="ai-messages">
          <div class="ai-welcome">
            <div class="ai-welcome-icon">🤖</div>
            <div class="ai-welcome-title">AI 助手</div>
            <div class="ai-welcome-desc">我是你的创作助手，可以帮你：</div>
            <div class="ai-welcome-features">
              <div class="ai-feature">✍️ 续写小说情节</div>
              <div class="ai-feature">👤 塑造角色性格</div>
              <div class="ai-feature">🎭 设计对白</div>
              <div class="ai-feature">🌍 构建世界观</div>
            </div>
          </div>
        </div>
        
        <div class="ai-chat-input-area">
          <div class="ai-input-container">
            <textarea 
              class="ai-input" 
              id="ai-input" 
              placeholder="输入问题或指令..."
              rows="1"
            ></textarea>
            <button class="ai-send-btn" id="ai-send-btn" title="发送">
              <span>➤</span>
            </button>
          </div>
          <div class="ai-input-tools">
            <button class="ai-tool-btn" data-tool="role" title="角色分析">👤</button>
            <button class="ai-tool-btn" data-tool="plot" title="剧情建议">📖</button>
            <button class="ai-tool-btn" data-tool="world" title="世界观">🌍</button>
          </div>
        </div>
      </div>
      
      <style>
        /* AI Chat Panel Styles */
        .ai-chat-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--bg2);
          border-radius: var(--radius);
          overflow: hidden;
        }
        
        .ai-chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .ai-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }
        
        .ai-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
        }
        
        .ai-status.thinking .ai-status-dot {
          background: #f59e0b;
          animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .ai-header-right {
          display: flex;
          gap: 8px;
        }
        
        .ai-btn-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.2);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s;
        }
        
        .ai-btn-icon:hover {
          background: rgba(255,255,255,0.3);
        }
        
        .ai-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        
        .ai-welcome {
          text-align: center;
          padding: 40px 20px;
        }
        
        .ai-welcome-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }
        
        .ai-welcome-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 8px;
        }
        
        .ai-welcome-desc {
          color: var(--text2);
          margin-bottom: 20px;
        }
        
        .ai-welcome-features {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          text-align: left;
        }
        
        .ai-feature {
          padding: 12px 16px;
          background: var(--bg);
          border-radius: 8px;
          font-size: 13px;
          color: var(--text);
        }
        
        .ai-message {
          margin-bottom: 16px;
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .ai-message-user {
          display: flex;
          gap: 12px;
        }
        
        .ai-message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }
        
        .ai-message-user .ai-message-avatar {
          background: linear-gradient(135deg, #667eea, #764ba2);
        }
        
        .ai-message-ai .ai-message-avatar {
          background: linear-gradient(135deg, #10b981, #059669);
        }
        
        .ai-message-content {
          flex: 1;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .ai-message-user .ai-message-content {
          background: var(--bg3);
          border-bottom-right-radius: 4px;
        }
        
        .ai-message-ai .ai-message-content {
          background: var(--bg);
          border-bottom-left-radius: 4px;
        }
        
        .ai-message-time {
          font-size: 11px;
          color: var(--text2);
          margin-top: 4px;
        }
        
        .ai-chat-input-area {
          padding: 16px;
          background: var(--bg);
          border-top: 1px solid var(--border);
        }
        
        .ai-input-container {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }
        
        .ai-input {
          flex: 1;
          padding: 12px 16px;
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--text);
          font-size: 14px;
          resize: none;
          max-height: 120px;
          overflow-y: auto;
        }
        
        .ai-input:focus {
          outline: none;
          border-color: var(--primary);
        }
        
        .ai-send-btn {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .ai-send-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        
        .ai-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        .ai-input-tools {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
        
        .ai-tool-btn {
          padding: 8px 16px;
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 20px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s;
        }
        
        .ai-tool-btn:hover {
          background: var(--bg3);
          border-color: var(--primary);
        }
        
        .ai-tool-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }
        
        /* Streaming indicator */
        .ai-streaming {
          display: inline-flex;
          gap: 4px;
          padding: 4px 12px;
          background: var(--bg3);
          border-radius: 12px;
          margin-top: 8px;
        }
        
        .ai-streaming span {
          width: 6px;
          height: 6px;
          background: var(--primary);
          border-radius: 50%;
          animation: bounce 1s infinite;
        }
        
        .ai-streaming span:nth-child(2) { animation-delay: 0.1s; }
        .ai-streaming span:nth-child(3) { animation-delay: 0.2s; }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      </style>
    `;
    
    // 插入到页面
    const container = document.getElementById('ai-chat-container') || this.createContainer();
    container.innerHTML = html;
    return html;
  },
  
  createContainer() {
    const container = document.createElement('div');
    container.id = 'ai-chat-container';
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 400px;
      height: 600px;
      z-index: 1000;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      border-radius: var(--radius);
      overflow: hidden;
    `;
    document.body.appendChild(container);
    return container;
  },
  
  // ============ 绑定事件 ============
  bindEvents() {
    const input = document.getElementById('ai-input');
    const sendBtn = document.getElementById('ai-send-btn');
    const clearBtn = document.getElementById('ai-clear-btn');
    const toolBtns = document.querySelectorAll('.ai-tool-btn');
    
    // 发送消息
    sendBtn?.addEventListener('click', () => this.sendMessage());
    
    // Enter发送
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    // 自动调整高度
    input?.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
    
    // 清空对话
    clearBtn?.addEventListener('click', () => this.clearHistory());
    
    // 工具按钮
    toolBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tool = btn.dataset.tool;
        this.useTool(tool);
      });
    });
  },
  
  // ============ 发送消息 ============
  async sendMessage() {
    const input = document.getElementById('ai-input');
    const message = input?.value.trim();
    
    if (!message || this.state.isThinking) return;
    
    // 清空输入
    if (input) input.value = '';
    input.style.height = 'auto';
    
    // 添加用户消息
    this.addMessage('user', message);
    
    // 显示思考状态
    this.setThinking(true);
    
    try {
      // 调用AI
      const response = await this.callAI(message);
      this.addMessage('ai', response);
    } catch (error) {
      this.addMessage('ai', `❌ 错误: ${error.message}`);
    } finally {
      this.setThinking(false);
    }
  },
  
  // ============ 调用AI ============
  async callAI(message) {
    // 构建消息历史
    const messages = this.state.messages.map(m => ({
      role: m.role,
      content: m.content
    }));
    
    // 添加当前消息
    messages.push({ role: 'user', content: message });
    
    const response = await fetch(this.config.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        stream: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`API错误: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '没有收到回复';
  },
  
  // ============ 添加消息 ============
  addMessage(role, content) {
    this.state.messages.push({ role, content, time: Date.now() });
    
    // 限制历史长度
    if (this.state.messages.length > this.config.historyLimit) {
      this.state.messages = this.state.messages.slice(-this.config.historyLimit);
    }
    
    this.renderMessages();
  },
  
  // ============ 渲染消息 ============
  renderMessages() {
    const container = document.getElementById('ai-messages');
    if (!container) return;
    
    // 移除欢迎消息
    const welcome = container.querySelector('.ai-welcome');
    if (welcome) welcome.remove();
    
    // 生成消息HTML
    const html = this.state.messages.map(m => `
      <div class="ai-message ai-message-${m.role}">
        <div class="ai-message-avatar">
          ${m.role === 'user' ? '👤' : '🤖'}
        </div>
        <div class="ai-message-content">
          <div class="ai-message-text">${this.escapeHtml(m.content)}</div>
          <div class="ai-message-time">${this.formatTime(m.time)}</div>
        </div>
      </div>
    `).join('');
    
    container.innerHTML = html;
    
    // 滚动到底部
    container.scrollTop = container.scrollHeight;
  },
  
  // ============ 设置思考状态 ============
  setThinking(isThinking) {
    this.state.isThinking = isThinking;
    const status = document.getElementById('ai-status');
    const sendBtn = document.getElementById('ai-send-btn');
    const input = document.getElementById('ai-input');
    
    if (status) {
      status.classList.toggle('thinking', isThinking);
      status.querySelector('.ai-status-text').textContent = isThinking ? '思考中...' : '待机';
    }
    
    if (sendBtn) sendBtn.disabled = isThinking;
    if (input) input.disabled = isThinking;
  },
  
  // ============ 使用工具 ============
  useTool(tool) {
    const prompts = {
      role: '分析当前角色，给出性格特点、外貌描写、心理活动的建议',
      plot: '基于当前剧情走向，给出3个有趣的发展方向',
      world: '描述当前世界观设定下的一个有趣场景或背景故事'
    };
    
    const prompt = prompts[tool];
    if (prompt) {
      const input = document.getElementById('ai-input');
      if (input) {
        input.value = `📝 ${prompt}`;
        input.focus();
      }
    }
  },
  
  // ============ 清空历史 ============
  clearHistory() {
    this.state.messages = [];
    this.renderPanel();
    this.bindEvents();
  },
  
  // ============ 工具函数 ============
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
  },
  
  formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
};

// ============ 全局访问 ============
window.AISystem = AISystem;

// ============ 浮动AI按钮 ============
const AIFloatingButton = {
  init() {
    const btn = document.createElement('div');
    btn.id = 'ai-floating-btn';
    btn.innerHTML = '🤖';
    btn.title = '打开AI助手';
    btn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
      z-index: 999;
      transition: all 0.3s;
    `;
    
    btn.addEventListener('click', () => this.toggle());
    document.body.appendChild(btn);
  },
  
  toggle() {
    let panel = document.getElementById('ai-chat-container');
    
    if (!panel) {
      AISystem.init();
      panel = document.getElementById('ai-chat-container');
    }
    
    const isVisible = panel.style.display !== 'none';
    panel.style.display = isVisible ? 'none' : 'flex';
  }
};

// 页面加载后初始化
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => AIFloatingButton.init(), 1000);
});
