/**
 * SoulWriter - 操作日志系统 v5
 * 永久工具栏：主题 + 语言 + 日志 + 文档
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
    this.labels = {
      'zh-CN': { title: '日志', clear: '清空', copy: '复制' },
      'en-US': { title: 'Log', clear: 'Clear', copy: 'Copy' }
    };
    this.logKeys = {
      'APP_INIT': { 'zh-CN': '应用初始化', 'en-US': 'App init' }
    };
    this.initUI();
    this.info('APP_INIT', 'SoulWriter ready');
  }
  
  getLang() { return localStorage.getItem('soulwriter-lang') || 'zh-CN'; }
  setLang(lang) { localStorage.setItem('soulwriter-lang', lang); }
  
  getTheme() { return localStorage.getItem('soulwriter-theme') || 'dark'; }
  setTheme(theme) { 
    localStorage.setItem('soulwriter-theme', theme);
    this.applyTheme(theme);
  }
  
  applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'soft') {
      root.style.setProperty('--bg', '#f0f0f5');
      root.style.setProperty('--bg2', '#ffffff');
      root.style.setProperty('--bg3', '#e8e8f0');
      root.style.setProperty('--text', '#2a2a3a');
      root.style.setProperty('--text2', '#6b6b80');
      root.style.setProperty('--accent', '#8b5cf6');
      root.style.setProperty('--accent2', '#a78bfa');
      root.style.setProperty('--border', '#d0d0e0');
    } else {
      root.style.setProperty('--bg', '#1a1a2e');
      root.style.setProperty('--bg2', '#16213e');
      root.style.setProperty('--bg3', '#0f3460');
      root.style.setProperty('--text', '#e8e8e8');
      root.style.setProperty('--text2', '#a0a0a0');
      root.style.setProperty('--accent', '#e94560');
      root.style.setProperty('--accent2', '#533483');
      root.style.setProperty('--border', '#2a2a4a');
    }
  }
  
  initUI() {
    if (document.getElementById('sw-toolbar')) {
      this.applyTheme(this.getTheme());
      return;
    }
    
    // 永久工具栏
    const toolbar = document.createElement('div');
    toolbar.id = 'sw-toolbar';
    toolbar.innerHTML = `
      <div class="toolbar-left">
        <span class="toolbar-logo">SoulWriter</span>
      </div>
      <div class="toolbar-right">
        <button class="toolbar-btn" id="btn-theme" title="切换主题">${this.getTheme() === 'dark' ? '☀️' : '🌙'}</button>
        <select class="toolbar-lang" id="btn-lang">
          <option value="zh-CN" ${this.getLang() === 'zh-CN' ? 'selected' : ''}>🇨🇳 中文</option>
          <option value="en-US" ${this.getLang() === 'en-US' ? 'selected' : ''}>🇺🇸 EN</option>
        </select>
        <button class="toolbar-btn" id="btn-log">📋 ${this.getLabel('title')}</button>
        <button class="toolbar-btn" id="btn-docs">📖 Docs</button>
      </div>
    `;
    document.body.insertBefore(toolbar, document.body.firstChild);
    
    // 样式
    const style = document.createElement('style');
    style.textContent = `
      #sw-toolbar{position:fixed;top:0;left:0;right:0;height:48px;background:rgba(22,33,62,0.98);border-bottom:1px solid #2a2a4a;display:flex;justify-content:space-between;align-items:center;padding:0 16px;z-index:1001}
      .toolbar-left{display:flex;align-items:center}
      .toolbar-logo{font-size:1.1em;font-weight:700;background:linear-gradient(135deg,#f5c518,#e94560);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
      .toolbar-right{display:flex;align-items:center;gap:8px}
      .toolbar-btn{display:flex;align-items:center;gap:6px;padding:6px 12px;background:rgba(255,255,255,0.05);border:1px solid transparent;border-radius:8px;color:#e8e8e8;cursor:pointer;font-size:13px;transition:all 0.15s}
      .toolbar-btn:hover{background:rgba(255,255,255,0.1);border-color:#3b82f6}
      .toolbar-lang{padding:6px 10px;background:rgba(255,255,255,0.05);border:1px solid #2a2a4a;border-radius:8px;color:#e8e8e8;font-size:13px;cursor:pointer}
      #log-panel{position:fixed;top:56px;right:16px;width:420px;max-height:60vh;background:rgba(26,26,46,0.98);border:1px solid #2a2a4a;border-radius:12px;font-family:monospace;font-size:12px;z-index:1000;display:none;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.4)}
      #log-panel.open{display:flex}
      .log-header{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#16213e;border-bottom:1px solid #2a2a4a;border-radius:12px 12px 0 0}
      .log-header-title{font-weight:600;color:#e8e8e8}
      .log-header-actions{display:flex;gap:4px}
      .log-action-btn{padding:4px 8px;background:transparent;border:none;color:#9ca3af;cursor:pointer;border-radius:4px;font-size:12px}
      .log-action-btn:hover{background:rgba(255,255,255,0.1);color:#e8e8e8}
      .log-content{flex:1;overflow-y:auto;padding:8px;max-height:400px}
      .log-entry{display:flex;gap:8px;padding:5px 8px;border-radius:4px;margin-bottom:2px}
      .log-entry:hover{background:rgba(255,255,255,0.03)}
      .log-time{color:#6b7280;flex-shrink:0;font-size:11px}
      .log-symbol{width:16px;text-align:center;flex-shrink:0}
      .log-level{width:50px;flex-shrink:0;font-weight:600;font-size:10px}
      .log-message{flex:1;word-break:break-word;color:#d1d5db}
      .log-empty{text-align:center;padding:40px;color:#6b7280}
      #app{margin-top:48px}
    `;
    document.head.appendChild(style);
    
    // 日志面板
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
    
    // 事件绑定
    document.getElementById('btn-theme').addEventListener('click', () => {
      const newTheme = this.getTheme() === 'dark' ? 'soft' : 'dark';
      this.setTheme(newTheme);
      document.getElementById('btn-theme').textContent = newTheme === 'dark' ? '☀️' : '🌙';
      // 触发自定义事件通知 app.js
      window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: newTheme } }));
    });
    
    document.getElementById('btn-lang').addEventListener('change', (e) => {
      this.setLang(e.target.value);
      window.dispatchEvent(new CustomEvent('lang-change', { detail: { lang: e.target.value } }));
    });
    
    document.getElementById('btn-log').addEventListener('click', () => this.toggle());
    document.getElementById('btn-docs').addEventListener('click', () => window.open('https://github.com/zzz123hash/soulwriter-api', '_blank'));
    document.getElementById('log-close-btn').addEventListener('click', () => this.close());
    document.getElementById('log-clear-btn').addEventListener('click', () => this.clear());
    document.getElementById('log-copy-btn').addEventListener('click', () => this.copyLogs());
    
    this.applyTheme(this.getTheme());
  }
  
  toggle() {
    this.isOpen = !this.isOpen;
    document.getElementById('log-panel').classList.toggle('open', this.isOpen);
  }
  
  close() {
    this.isOpen = false;
    document.getElementById('log-panel').classList.remove('open');
  }
  
  clear() {
    this.logs = [];
    document.getElementById('log-content').innerHTML = '<div class="log-empty">' + this.getLabel('empty') + '</div>';
  }
  
  copyLogs() {
    const text = this.logs.map(l => `[${l.time}] ${l.level}: ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
  }
  
  log(level, key, message, meta) {
    const now = new Date();
    const time = now.toLocaleTimeString('zh-CN', { hour12: false });
    const levelInfo = this.levels[level] || this.levels.INFO;
    const logLabel = this.logKeys[key]?.[this.getLang()] || key;
    
    const entry = { time, level, key, message, meta, levelInfo, logLabel };
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) this.logs.shift();
    
    this.renderLog(entry);
  }
  
  renderLog(entry) {
    const content = document.getElementById('log-content');
    if (!content) return;
    const empty = content.querySelector('.log-empty');
    if (empty) empty.remove();
    
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.innerHTML = `
      <span class="log-time">${entry.time}</span>
      <span class="log-symbol" style="color:${entry.levelInfo.color}">${entry.levelInfo.symbol}</span>
      <span class="log-level" style="color:${entry.levelInfo.color}">${entry.logLabel}</span>
      <span class="log-message">${this.escapeHtml(entry.message)}</span>
    `;
    content.appendChild(div);
    content.scrollTop = content.scrollHeight;
  }
  
  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  
  getLabel(key) { return this.labels[this.getLang()]?.[key] || key; }
  
  debug(key, message, meta) { this.log('DEBUG', key, message, meta); }
  info(key, message, meta) { this.log('INFO', key, message, meta); }
  success(key, message, meta) { this.log('SUCCESS', key, message, meta); }
  warn(key, message, meta) { this.log('WARN', key, message, meta); }
  error(key, message, meta) { this.log('ERROR', key, message, meta); }
}

const logger = new SoulWriterLogger();
