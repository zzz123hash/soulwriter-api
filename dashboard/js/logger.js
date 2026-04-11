/**
 * SoulWriter - 操作日志系统 v2
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
      'zh-CN': {
        title: '日志', clear: '清空', copy: '复制', empty: '暂无日志',
        log: {
          'APP_INIT': '应用初始化', 'API_REQ': '请求', 'API_SUCCESS': '成功',
          'API_ERROR': '错误', 'BTN_CLICK': '点击', 'MODAL_OPEN': '打开弹窗',
          'MODAL_CLOSE': '关闭弹窗', 'DATA_LOAD': '加载数据', 'DATA_SAVE': '保存数据'
        }
      },
      'en-US': {
        title: 'Log', clear: 'Clear', copy: 'Copy', empty: 'No logs',
        log: {
          'APP_INIT': 'App init', 'API_REQ': 'Request', 'API_SUCCESS': 'Success',
          'API_ERROR': 'Error', 'BTN_CLICK': 'Click', 'MODAL_OPEN': 'Open modal',
          'MODAL_CLOSE': 'Close modal', 'DATA_LOAD': 'Load data', 'DATA_SAVE': 'Save data'
        }
      }
    };
    this.initUI();
    this.info('APP_INIT', 'SoulWriter ready');
  }
  
  getLang() { return localStorage.getItem('soulwriter-lang') || 'zh-CN'; }
  getLabel(key) { return this.labels[this.getLang()]?.[key] || this.labels['zh-CN'][key] || key; }
  getLogLabel(key) { return this.labels[this.getLang()]?.log[key] || key; }
  
  initUI() {
    if (document.getElementById('sw-toolbar')) return;
    
    const toolbar = document.createElement('div');
    toolbar.id = 'sw-toolbar';
    toolbar.innerHTML = '<div class="toolbar-left"><span class="toolbar-logo">SoulWriter</span></div><div class="toolbar-right"><button class="toolbar-btn" id="btn-log"><span>📋</span>日志</button><button class="toolbar-btn" id="btn-settings"><span>⚙️</span>设置</button><select id="lang-select" class="toolbar-lang"><option value="zh-CN">🇨🇳 中文</option><option value="en-US">🇺🇸 EN</option></select></div>';
    document.body.insertBefore(toolbar, document.body.firstChild);
    
    if (!document.getElementById('logger-styles')) {
      const style = document.createElement('style');
      style.id = 'logger-styles';
      style.textContent = '#sw-toolbar{position:fixed;top:0;left:0;right:0;height:48px;background:rgba(22,33,62,0.98);border-bottom:1px solid #2a2a4a;display:flex;justify-content:space-between;align-items:center;padding:0 16px;z-index:1000}.toolbar-left{display:flex;align-items:center}.toolbar-logo{font-size:1.1em;font-weight:700;background:linear-gradient(135deg,#f5c518,#e94560);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.toolbar-right{display:flex;align-items:center;gap:8px}.toolbar-btn{display:flex;align-items:center;gap:6px;padding:6px 12px;background:rgba(255,255,255,0.05);border:1px solid transparent;border-radius:8px;color:#e8e8e8;cursor:pointer;font-size:13px;transition:all 0.15s}.toolbar-btn:hover{background:rgba(255,255,255,0.1);border-color:#3b82f6}.toolbar-lang{padding:6px 10px;background:rgba(255,255,255,0.05);border:1px solid #2a2a4a;border-radius:8px;color:#e8e8e8;font-size:13px;cursor:pointer}#log-panel{position:fixed;top:56px;right:16px;width:420px;max-height:60vh;background:rgba(26,26,46,0.98);border:1px solid #2a2a4a;border-radius:12px;font-family:monospace;font-size:12px;z-index:999;display:none;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.4)}#log-panel.open{display:flex}.log-header{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#16213e;border-bottom:1px solid #2a2a4a;border-radius:12px 12px 0 0}.log-header-title{font-weight:600;color:#e8e8e8}.log-header-actions{display:flex;gap:4px}.log-action-btn{padding:4px 8px;background:transparent;border:none;color:#9ca3af;cursor:pointer;border-radius:4px;font-size:12px}.log-action-btn:hover{background:rgba(255,255,255,0.1);color:#e8e8e8}.log-content{flex:1;overflow-y:auto;padding:8px;max-height:400px}.log-entry{display:flex;gap:8px;padding:5px 8px;border-radius:4px;margin-bottom:2px}.log-entry:hover{background:rgba(255,255,255,0.03)}.log-time{color:#6b7280;flex-shrink:0;font-size:11px}.log-symbol{width:16px;text-align:center;flex-shrink:0}.log-level{width:50px;flex-shrink:0;font-weight:600;font-size:10px}.log-message{flex:1;word-break:break-word;color:#d1d5db}.log-meta{color:#a855f7;font-size:10px}.log-empty{text-align:center;padding:40px;color:#6b7280}';
      document.head.appendChild(style);
    }
    
    const logPanel = document.createElement('div');
    logPanel.id = 'log-panel';
    logPanel.innerHTML = '<div class="log-header"><span class="log-header-title">📋 日志</span><div class="log-header-actions"><button class="log-action-btn" id="log-copy-btn">📋</button><button class="log-action-btn" id="log-clear-btn">🗑️</button><button class="log-action-btn" id="log-close-btn">✕</button></div></div><div class="log-content" id="log-content"><div class="log-empty">暂无日志</div></div>';
    document.body.appendChild(logPanel);
    
    document.getElementById('btn-log')?.addEventListener('click', () => this.toggle());
    document.getElementById('btn-settings')?.addEventListener('click', () => {});
    document.getElementById('log-close-btn')?.addEventListener('click', () => this.close());
    document.getElementById('log-clear-btn')?.addEventListener('click', () => this.clear());
    document.getElementById('log-copy-btn')?.addEventListener('click', () => this.copyToClipboard());
    document.getElementById('lang-select')?.addEventListener('change', (e) => {
      localStorage.setItem('soulwriter-lang', e.target.value);
      window.location.reload();
    });
    
    const langSel = document.getElementById('lang-select');
    if (langSel) langSel.value = this.getLang();
  }
  
  toggle() {
    this.isOpen = !this.isOpen;
    document.getElementById('log-panel')?.classList.toggle('open', this.isOpen);
  }
  close() { this.isOpen = false; document.getElementById('log-panel')?.classList.remove('open'); }
  
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
    const metaStr = e.meta ? '<span class="log-meta">'+(typeof e.meta === 'object' ? JSON.stringify(e.meta) : e.meta)+'</span>' : '';
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
    if (c) c.innerHTML = '<div class="log-empty">暂无日志</div>';
    this.info('APP_INIT', '日志已清空');
  }
  
  copyToClipboard() {
    const t = this.logs.map(l=>'['+l.time+'] ['+l.level+'] '+this.getLogLabel(l.key)+' '+l.message+' '+(l.meta||'')).join('\n');
    navigator.clipboard.writeText(t).then(() => {
      const b = document.getElementById('log-copy-btn');
      if (b) { b.textContent='✓'; setTimeout(()=>{b.textContent='📋';},1000); }
    });
  }
}

window.logger = new SoulWriterLogger();
