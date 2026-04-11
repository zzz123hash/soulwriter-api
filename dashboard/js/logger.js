/**
 * SoulWriter - 操作日志系统 v2
 * 支持双语、可折叠、可复制
 */

class SoulWriterLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 300;
    this.isOpen = false;
    this.levels = {
      DEBUG: { color: '#9ca3af', symbol: '⋯' },
      INFO: { color: '#60a5fa', symbol: 'ℹ' },
      SUCCESS: { color: '#4ade80', symbol: '✓' },
      WARN: { color: '#fbbf24', symbol: '⚠' },
      ERROR: { color: '#f87171', symbol: '✗' }
    };
    
    // 双语日志文本
    this.labels = {
      'zh-CN': {
        title: '日志',
        clear: '清空',
        copy: '复制',
        empty: '暂无日志',
        copied: '已复制到剪贴板',
        log: {
          'APP_INIT': '应用初始化',
          'API_REQ': '请求',
          'API_SUCCESS': '成功',
          'API_ERROR': '错误',
          'BTN_CLICK': '点击按钮',
          'MODAL_OPEN': '打开弹窗',
          'MODAL_CLOSE': '关闭弹窗',
          'DATA_LOAD': '加载数据',
          'DATA_SAVE': '保存数据',
          'NAV_CLICK': '切换视图'
        }
      },
      'en-US': {
        title: 'Log',
        clear: 'Clear',
        copy: 'Copy',
        empty: 'No logs',
        copied: 'Copied to clipboard',
        log: {
          'APP_INIT': 'App initialized',
          'API_REQ': 'Request',
          'API_SUCCESS': 'Success',
          'API_ERROR': 'Error',
          'BTN_CLICK': 'Button click',
          'MODAL_OPEN': 'Open modal',
          'MODAL_CLOSE': 'Close modal',
          'DATA_LOAD': 'Load data',
          'DATA_SAVE': 'Save data',
          'NAV_CLICK': 'Switch view'
        }
      }
    };
    
    this.initUI();
    this.info('APP_INIT', 'SoulWriter 日志系统已就绪 | Log system ready');
  }
  
  getLang() { return localStorage.getItem('soulwriter-lang') || 'zh-CN'; }
  getLabel(key) {
    const lang = this.getLang();
    return this.labels[lang]?.[key] || this.labels['zh-CN'][key] || key;
  }
  getLogLabel(key) {
    const lang = this.getLang();
    return this.labels[lang]?.log[key] || key;
  }
  
  initUI() {
    // 创建顶部工具栏
    const toolbar = document.createElement('div');
    toolbar.id = 'sw-toolbar';
    toolbar.innerHTML = `
      <div class="toolbar-left">
        <span class="toolbar-logo">SoulWriter</span>
      </div>
      <div class="toolbar-right">
        <button class="toolbar-btn" id="btn-log" title="${this.getLabel('title')}">
          <span class="btn-icon">📋</span>
          <span class="btn-text">${this.getLabel('title')}</span>
        </button>
        <button class="toolbar-btn" id="btn-settings" title="${this.getLabel('settings') || 'Settings'}">
          <span class="btn-icon">⚙️</span>
          <span class="btn-text">${this.getLabel('settings') || 'Settings'}</span>
        </button>
        <select id="lang-select" class="toolbar-lang">
          <option value="zh-CN">🇨🇳 中文</option>
          <option value="en-US">🇺🇸 EN</option>
        </select>
      </div>
    `;
    document.body.insertBefore(toolbar, document.body.firstChild);
    
    // 添加工具栏样式
    const style = document.createElement('style');
    style.id = 'toolbar-style';
    style.textContent = `
      #sw-toolbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 48px;
        background: rgba(22, 33, 62, 0.95);
        border-bottom: 1px solid #2a2a4a;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 16px;
        z-index: 1000;
        backdrop-filter: blur(10px);
      }
      
      .toolbar-left { display: flex; align-items: center; }
      
      .toolbar-logo {
        font-size: 1.1em;
        font-weight: 700;
        background: linear-gradient(135deg, #f5c518, #e94560);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      
      .toolbar-right { display: flex; align-items: center; gap: 8px; }
      
      .toolbar-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: rgba(255,255,255,0.05);
        border: 1px solid transparent;
        border-radius: 8px;
        color: #e8e8e8;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.15s;
      }
      
      .toolbar-btn:hover {
        background: rgba(255,255,255,0.1);
        border-color: #3b82f6;
      }
      
      .toolbar-btn .btn-icon { font-size: 14px; }
      
      .toolbar-lang {
        padding: 6px 10px;
        background: rgba(255,255,255,0.05);
        border: 1px solid #2a2a4a;
        border-radius: 8px;
        color: #e8e8e8;
        font-size: 13px;
        cursor: pointer;
      }
      
      /* 日志面板 */
      #log-panel {
        position: fixed;
        top: 56px;
        right: 16px;
        width: 420px;
        max-height: 60vh;
        background: rgba(26, 26, 46, 0.98);
        border: 1px solid #2a2a4a;
        border-radius: 12px;
        font-family: 'SF Mono', 'Fira Code', monospace;
        font-size: 12px;
        z-index: 999;
        display: none;
        flex-direction: column;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      }
      
      #log-panel.open { display: flex; }
      
      .log-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 14px;
        background: #16213e;
        border-bottom: 1px solid #2a2a4a;
        border-radius: 12px 12px 0 0;
      }
      
      .log-header-title {
        font-weight: 600;
        color: #e8e8e8;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .log-header-actions { display: flex; gap: 4px; }
      
      .log-action-btn {
        padding: 4px 8px;
        background: transparent;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        border-radius: 4px;
        font-size: 12px;
      }
      
      .log-action-btn:hover { background: rgba(255,255,255,0.1); color: #e8e8e8; }
      
      .log-content {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
        max-height: 400px;
      }
      
      .log-entry {
        display: flex;
        gap: 8px;
        padding: 5px 8px;
        border-radius: 4px;
        margin-bottom: 2px;
        animation: logFadeIn 0.15s ease-out;
      }
      
      @keyframes logFadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .log-entry:hover { background: rgba(255,255,255,0.03); }
      
      .log-time { color: #6b7280; flex-shrink: 0; font-size: 11px; }
      .log-symbol { width: 16px; text-align: center; flex-shrink: 0; }
      .log-level { width: 50px; flex-shrink: 0; font-weight: 600; font-size: 10px; }
      .log-message { flex: 1; word-break: break-word; color: #d1d5db; }
      .log-meta { color: #a855f7; font-size: 10px; }
      
      .log-empty {
        text-align: center;
        padding: 40px;
        color: #6b7280;
      }
      
      /* 设置面板 */
      #settings-panel {
        position: fixed;
        top: 56px;
        right: 16px;
        width: 360px;
        background: rgba(26, 26, 46, 0.98);
        border: 1px solid #2a2a4a;
        border-radius: 12px;
        z-index: 999;
        display: none;
        flex-direction: column;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      }
      
      #settings-panel.open { display: flex; }
      
      .settings-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: #16213e;
        border-bottom: 1px solid #2a2a4a;
        border-radius: 12px 12px 0 0;
      }
      
      .settings-header h3 { font-size: 14px; color: #e8e8e8; }
      
      .settings-content { padding: 16px; }
      
      .settings-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #2a2a4a;
      }
      
      .settings-item:last-child { border-bottom: none; }
      
      .settings-label { color: #d1d5db; font-size: 13px; }
      
      .settings-input {
        width: 120px;
        padding: 6px 10px;
        background: #1a1a2e;
        border: 1px solid #2a2a4a;
        border-radius: 6px;
        color: #e8e8e8;
        font-size: 12px;
      }
      
      .settings-select {
        padding: 6px 10px;
        background: #1a1a2e;
        border: 1px solid #2a2a4a;
        border-radius: 6px;
        color: #e8e8e8;
        font-size: 12px;
      }
    `;
    document.head.appendChild(style);
    
    // 创建日志面板
    const logPanel = document.createElement('div');
    logPanel.id = 'log-panel';
    logPanel.innerHTML = `
      <div class="log-header">
        <span class="log-header-title">📋 ${this.getLabel('title')}</span>
        <div class="log-header-actions">
          <button class="log-action-btn" id="log-copy-btn" title="${this.getLabel('copy')}">📋</button>
          <button class="log-action-btn" id="log-clear-btn" title="${this.getLabel('clear')}">🗑️</button>
          <button class="log-action-btn" id="log-close-btn">✕</button>
        </div>
      </div>
      <div class="log-content" id="log-content">
        <div class="log-empty">${this.getLabel('empty')}</div>
      </div>
    `;
    document.body.appendChild(logPanel);
    
    // 创建设置面板
    const settingsPanel = document.createElement('div');
    settingsPanel.id = 'settings-panel';
    settingsPanel.innerHTML = `
      <div class="settings-header">
        <h3>⚙️ ${this.getLabel('settings') || 'Settings'}</h3>
        <button class="log-action-btn" id="settings-close-btn">✕</button>
      </div>
      <div class="settings-content">
        <div class="settings-item">
          <span class="settings-label">API 地址</span>
          <input type="text" class="settings-input" id="setting-api-url" value="http://localhost:3000" readonly>
        </div>
        <div class="settings-item">
          <span class="settings-label">语言</span>
          <select class="settings-select" id="setting-lang">
            <option value="zh-CN">中文</option>
            <option value="en-US">English</option>
          </select>
        </div>
        <div class="settings-item">
          <span class="settings-label">日志级别</span>
          <select class="settings-select" id="setting-log-level">
            <option value="all">全部</option>
            <option value="info">INFO+</option>
            <option value="warn">WARN+</option>
            <option value="error">ERROR</option>
          </select>
        </div>
        <div class="settings-item">
          <span class="settings-label">自动保存</span>
          <input type="checkbox" id="setting-auto-save" checked>
        </div>
      </div>
    `;
    document.body.appendChild(settingsPanel);
    
    // 绑定事件
    document.getElementById('btn-log')?.addEventListener('click', () => this.toggle());
    document.getElementById('btn-settings')?.addEventListener('click', () => this.toggleSettings());
    document.getElementById('log-close-btn')?.addEventListener('click', () => this.close());
    document.getElementById('log-clear-btn')?.addEventListener('click', () => this.clear());
    document.getElementById('log-copy-btn')?.addEventListener('click', () => this.copyToClipboard());
    document.getElementById('settings-close-btn')?.addEventListener('click', () => this.closeSettings());
    document.getElementById('lang-select')?.addEventListener('change', (e) => {
      localStorage.setItem('soulwriter-lang', e.target.value);
      window.location.reload();
    });
    
    // 初始化语言选择器
    const langSel = document.getElementById('lang-select');
    if (langSel) langSel.value = this.getLang();
  }
  
  toggle() {
    this.isOpen = !this.isOpen;
    const panel = document.getElementById('log-panel');
    const settingsPanel = document.getElementById('settings-panel');
    if (panel) {
      panel.classList.toggle('open', this.isOpen);
      if (this.isOpen) settingsPanel?.classList.remove('open');
    }
  }
  
  close() {
    this.isOpen = false;
    document.getElementById('log-panel')?.classList.remove('open');
  }
  
  toggleSettings() {
    const panel = document.getElementById('settings-panel');
    const logPanel = document.getElementById('log-panel');
    const isOpen = panel?.classList.contains('open');
    panel?.classList.toggle('open', !isOpen);
    logPanel?.classList.remove('open');
  }
  
  closeSettings() {
    document.getElementById('settings-panel')?.classList.remove('open');
  }
  
  log(level, key, message, meta = null) {
    const now = new Date();
    const time = now.toLocaleTimeString('zh-CN', { hour12: false }) + '.' + String(now.getMilliseconds()).padStart(3, '0');
    const levelInfo = this.levels[level] || this.levels.INFO;
    
    const entry = {
      time,
      level,
      symbol: levelInfo.symbol,
      color: levelInfo.color,
      key,
      message,
      meta
    };
    
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) this.logs.shift();
    
    this.renderEntry(entry);
  }
  
  renderEntry(entry) {
    const container = document.getElementById('log-content');
    if (!container) return;
    
    // 清除空状态提示
    const empty = container.querySelector('.log-empty');
    if (empty) empty.remove();
    
    const el = document.createElement('div');
    el.className = 'log-entry';
    el.innerHTML = `
      <span class="log-time">${entry.time}</span>
      <span class="log-symbol" style="color:${entry.color}">${entry.symbol}</span>
      <span class="log-level" style="color:${entry.color}">[${entry.level}]</span>
      <span class="log-message">${this.getLogLabel(entry.key)} ${this.escapeHtml(entry.message)}</span>
      ${entry.meta ? `<span class="log-meta">${typeof entry.meta === 'object' ? JSON.stringify(entry.meta) : entry.meta}</span>` : ''}
    `;
    
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // 便捷方法 - 支持双语的key
  info(key, message, meta) { this.log('INFO', key, message, meta); }
  success(key, message, meta) { this.log('SUCCESS', key, message, meta); }
  warn(key, message, meta) { this.log('WARN', key, message, meta); }
  error(key, message, meta) { this.log('ERROR', key, message, meta); }
  debug(key, message, meta) { this.log('DEBUG', key, message, meta); }
  
  clear() {
    this.logs = [];
    const container = document.getElementById('log-content');
    if (container) {
      container.innerHTML = `<div class="log-empty">${this.getLabel('empty')}</div>`;
    }
    this.info('APP_INIT', '日志已清空 | Logs cleared');
  }
  
  copyToClipboard() {
    const text = this.logs.map(l => `[${l.time}] [${l.level}] ${this.getLogLabel(l.key)} ${l.message} ${l.meta ? JSON.stringify(l.meta) : ''}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('log-copy-btn');
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = '✓';
        setTimeout(() => { btn.textContent = orig; }, 1000);
      }
    });
  }
}

// 全局实例
let logger;
document.addEventListener('DOMContentLoaded', () => {
  logger = new SoulWriterLogger();
  window.logger = logger;
});
