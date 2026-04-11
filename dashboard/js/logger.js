/**
 * SoulWriter - 操作日志系统 v3
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
      'zh-CN': { title: '日志', clear: '清空', copy: '复制', empty: '暂无日志', settings: '设置' },
      'en-US': { title: 'Log', clear: 'Clear', copy: 'Copy', empty: 'No logs', settings: 'Settings' }
    };
    this.logKeys = {
      'APP_INIT': { 'zh-CN': '应用初始化', 'en-US': 'App init' },
      'API_REQ': { 'zh-CN': '请求', 'en-US': 'Request' },
      'API_SUCCESS': { 'zh-CN': '成功', 'en-US': 'Success' },
      'API_ERROR': { 'zh-CN': '错误', 'en-US': 'Error' },
      'BTN_CLICK': { 'zh-CN': '点击', 'en-US': 'Click' },
      'MODAL_OPEN': { 'zh-CN': '打开弹窗', 'en-US': 'Open modal' },
      'MODAL_CLOSE': { 'zh-CN': '关闭弹窗', 'en-US': 'Close modal' },
      'DATA_LOAD': { 'zh-CN': '加载数据', 'en-US': 'Load data' },
      'DATA_SAVE': { 'zh-CN': '保存数据', 'en-US': 'Save data' }
    };
    this.initUI();
    this.info('APP_INIT', 'SoulWriter ready');
  }
  
  getLang() { return localStorage.getItem('soulwriter-lang') || 'zh-CN'; }
  getLabel(key) { return this.labels[this.getLang()]?.[key] || key; }
  getLogLabel(key) { return this.logKeys[key]?.[this.getLang()] || key; }
  
  initUI() {
    if (document.getElementById('sw-toolbar')) return;
    
    // 工具栏
    const toolbar = document.createElement('div');
    toolbar.id = 'sw-toolbar';
    toolbar.innerHTML = '<div class="toolbar-left"><span class="toolbar-logo">SoulWriter</span></div><div class="toolbar-right"><button class="toolbar-btn" id="btn-log"><span>📋</span><span class="btn-text">日志</span></button><button class="toolbar-btn" id="btn-settings"><span>⚙️</span><span class="btn-text">设置</span></button><select id="lang-select" class="toolbar-lang"><option value="zh-CN">🇨🇳 中文</option><option value="en-US">🇺🇸 EN</option></select></div>';
    document.body.insertBefore(toolbar, document.body.firstChild);
    
    // 样式
    const style = document.createElement('style');
    style.textContent = '#sw-toolbar{position:fixed;top:0;left:0;right:0;height:48px;background:rgba(22,33,62,0.98);border-bottom:1px solid #2a2a4a;display:flex;justify-content:space-between;align-items:center;padding:0 16px;z-index:1000}.toolbar-left{display:flex;align-items:center}.toolbar-logo{font-size:1.1em;font-weight:700;background:linear-gradient(135deg,#f5c518,#e94560);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.toolbar-right{display:flex;align-items:center;gap:8px}.toolbar-btn{display:flex;align-items:center;gap:6px;padding:6px 12px;background:rgba(255,255,255,0.05);border:1px solid transparent;border-radius:8px;color:#e8e8e8;cursor:pointer;font-size:13px;transition:all 0.15s}.toolbar-btn:hover{background:rgba(255,255,255,0.1);border-color:#3b82f6}.toolbar-lang{padding:6px 10px;background:rgba(255,255,255,0.05);border:1px solid #2a2a4a;border-radius:8px;color:#e8e8e8;font-size:13px;cursor:pointer}#log-panel{position:fixed;top:56px;right:16px;width:420px;max-height:60vh;background:rgba(26,26,46,0.98);border:1px solid #2a2a4a;border-radius:12px;font-family:monospace;font-size:12px;z-index:999;display:none;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.4)}#log-panel.open{display:flex}.log-header{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#16213e;border-bottom:1px solid #2a2a4a;border-radius:12px 12px 0 0}.log-header-title{font-weight:600;color:#e8e8e8}.log-header-actions{display:flex;gap:4px}.log-action-btn{padding:4px 8px;background:transparent;border:none;color:#9ca3af;cursor:pointer;border-radius:4px;font-size:12px}.log-action-btn:hover{background:rgba(255,255,255,0.1);color:#e8e8e8}.log-content{flex:1;overflow-y:auto;padding:8px;max-height:400px}.log-entry{display:flex;gap:8px;padding:5px 8px;border-radius:4px;margin-bottom:2px}.log-entry:hover{background:rgba(255,255,255,0.03)}.log-time{color:#6b7280;flex-shrink:0;font-size:11px}.log-symbol{width:16px;text-align:center;flex-shrink:0}.log-level{width:50px;flex-shrink:0;font-weight:600;font-size:10px}.log-message{flex:1;word-break:break-word;color:#d1d5db}.log-meta{color:#a855f7;font-size:10px;margin-left:8px}.log-empty{text-align:center;padding:40px;color:#6b7280}#settings-panel{position:fixed;top:56px;right:16px;width:300px;background:rgba(26,26,46,0.98);border:1px solid #2a2a4a;border-radius:12px;z-index:999;display:none;padding:16px;box-shadow:0 8px 32px rgba(0,0,0,0.4)}#settings-panel.open{display:block}.settings-title{font-size:14px;font-weight:600;color:#e8e8e8;margin-bottom:12px}.settings-item{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #2a2a4a}.settings-item:last-child{border-bottom:none}.settings-label{color:#d1d5db;font-size:13px}.settings-value{color:#9ca3af;font-size:12px}';
    document.head.appendChild(style);
    
    // 日志面板
    const logPanel = document.createElement('div');
    logPanel.id = 'log-panel';
    logPanel.innerHTML = '<div class="log-header"><span class="log-header-title">📋 '+this.getLabel('title')+'</span><div class="log-header-actions"><button class="log-action-btn" id="log-copy-btn" title="复制">📋</button><button class="log-action-btn" id="log-clear-btn" title="清空">🗑️</button><button class="log-action-btn" id="log-close-btn">✕</button></div></div><div class="log-content" id="log-content"><div class="log-empty">'+this.getLabel('empty')+'</div></div>';
    document.body.appendChild(logPanel);
    
    // 设置面板
    const settingsPanel = document.createElement('div');
    settingsPanel.id = 'settings-panel';
    settingsPanel.innerHTML = '<div class="settings-title">⚙️ '+this.getLabel('settings')+'</div><div class="settings-item"><span class="settings-label">版本</span><span class="settings-value">v1.0</span></div><div class="settings-item"><span class="settings-label">API</span><span class="settings-value">localhost:3000</span></div><div class="settings-item"><span class="settings-label">日志级别</span><span class="settings-value">全部</span></div>';
    document.body.appendChild(settingsPanel);
    
    // 事件
    document.getElementById('btn-log').addEventListener('click', () => this.toggle());
    document.getElementById('btn-settings').addEventListener('click', () => this.toggleSettings());
    document.getElementById('log-close-btn').addEventListener('click', () => this.close());
    document.getElementById('log-clear-btn').addEventListener('click', () => this.clear());
    document.getElementById('log-copy-btn').addEventListener('click', () => this.copyLogs());
    document.getElementById('lang-select').addEventListener('change', (e) => {
      localStorage.setItem('soulwriter-lang', e.target.value);
      window.location.reload();
    });
    document.getElementById('lang-select').value = this.getLang();
  }
  
  toggle() {
    this.isOpen = !this.isOpen;
    document.getElementById('log-panel').classList.toggle('open', this.isOpen);
    document.getElementById('settings-panel').classList.remove('open');
  }
  
  close() {
    this.isOpen = false;
    document.getElementById('log-panel').classList.remove('open');
  }
  
  toggleSettings() {
    document.getElementById('settings-panel').classList.toggle('open');
    document.getElementById('log-panel').classList.remove('open');
  }
  
  log(level, key, message, meta) {
    const now = new Date();
    const time = now.toLocaleTimeString('zh-CN',{hour12:false})+'.'+String(now.getMilliseconds()).padStart(3,'0');
    const li = this.levels[level] || this.levels.INFO;
    const entry = { time, level, symbol: li.symbol, color: li.color, key, message, meta };
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) this.logs.shift();
    this.renderEntry(entry);
  }
  
  renderEntry(e) {
    const c = document.getElementById('log-content');
    if (!c) return;
    c.querySelector('.log-empty')?.remove();
    const el = document.createElement('div');
    el.className = 'log-entry';
    const metaStr = e.meta ? '<span class="log-meta">'+JSON.stringify(e.meta)+'</span>' : '';
    el.innerHTML = '<span class="log-time">'+e.time+'</span><span class="log-symbol" style="color:'+e.color+'">'+e.symbol+'</span><span class="log-level" style="color:'+e.color+'">['+e.level+']</span><span class="log-message">'+this.getLogLabel(e.key)+' '+this.escape(e.message)+'</span>'+metaStr;
    c.appendChild(el);
    c.scrollTop = c.scrollHeight;
  }
  
  escape(t) { const d=document.createElement('div'); d.textContent=t; return d.innerHTML; }
  
  info(k,m,meta) { this.log('INFO',k,m,meta); }
  success(k,m,meta) { this.log('SUCCESS',k,m,meta); }
  warn(k,m,meta) { this.log('WARN',k,m,meta); }
  error(k,m,meta) { this.log('ERROR',k,m,meta); }
  debug(k,m,meta) { this.log('DEBUG',k,m,meta); }
  
  clear() {
    this.logs = [];
    const c = document.getElementById('log-content');
    if (c) c.innerHTML = '<div class="log-empty">'+this.getLabel('empty')+'</div>';
    this.info('APP_INIT', '日志已清空');
  }
  
  copyLogs() {
    const text = this.logs.map(l=>'['+l.time+'] ['+l.level+'] '+this.getLogLabel(l.key)+' '+l.message+' '+(l.meta?JSON.stringify(l.meta):'')).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('log-copy-btn');
      if (btn) { btn.textContent='✓'; setTimeout(()=>{btn.textContent='📋';},1500); }
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      const btn = document.getElementById('log-copy-btn');
      if (btn) { btn.textContent='✓'; setTimeout(()=>{btn.textContent='📋';},1500); }
    });
  }
}

window.logger = new SoulWriterLogger();
