/**
 * SoulWriter - 操作日志系统
 * 类似OpenCode的详细日志格式
 */

class SoulWriterLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 500;
    this.levels = {
      DEBUG: { color: '#6b7280', label: 'DEBUG', symbol: '⋯' },
      INFO: { color: '#3b82f6', label: 'INFO', symbol: 'ℹ' },
      SUCCESS: { color: '#22c55e', label: 'SUCCESS', symbol: '✓' },
      WARN: { color: '#f59e0b', label: 'WARN', symbol: '⚠' },
      ERROR: { color: '#ef4444', label: 'ERROR', symbol: '✗' }
    };
    
    // 初始化日志UI
    this.initUI();
    
    this.info('SoulWriter 日志系统已初始化');
  }
  
  initUI() {
    // 创建日志面板
    const panel = document.createElement('div');
    panel.id = 'log-panel';
    panel.innerHTML = `
      <div class="log-header">
        <div class="log-title">
          <span class="log-icon">📋</span>
          <span>操作日志</span>
        </div>
        <div class="log-controls">
          <button class="log-btn" id="log-clear" title="清空日志">🗑️</button>
          <button class="log-btn" id="log-toggle" title="折叠/展开">➖</button>
        </div>
      </div>
      <div class="log-content" id="log-content"></div>
    `;
    document.body.appendChild(panel);
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
      #log-panel {
        position: fixed;
        bottom: 0;
        right: 0;
        width: 480px;
        max-height: 50vh;
        background: rgba(26, 26, 46, 0.95);
        border: 1px solid #2a2a4a;
        border-radius: 12px 0 0 0;
        font-family: 'SF Mono', 'Fira Code', monospace;
        font-size: 12px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
      }
      
      #log-panel.collapsed { max-height: 40px; overflow: hidden; }
      
      .log-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: #16213e;
        border-bottom: 1px solid #2a2a4a;
        border-radius: 12px 0 0 0;
        cursor: move;
      }
      
      .log-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        color: #e8e8e8;
      }
      
      .log-controls { display: flex; gap: 4px; }
      
      .log-btn {
        padding: 4px 8px;
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 14px;
        border-radius: 4px;
        transition: background 0.15s;
      }
      
      .log-btn:hover { background: rgba(255,255,255,0.1); }
      
      .log-content {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
        max-height: 300px;
      }
      
      .log-entry {
        display: flex;
        gap: 8px;
        padding: 4px 8px;
        border-radius: 4px;
        margin-bottom: 2px;
        animation: logFadeIn 0.2s ease-out;
      }
      
      @keyframes logFadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .log-entry:hover { background: rgba(255,255,255,0.05); }
      
      .log-time { color: #6b7280; flex-shrink: 0; }
      .log-symbol { width: 16px; text-align: center; flex-shrink: 0; }
      .log-level { width: 60px; flex-shrink: 0; font-weight: 600; }
      .log-message { flex: 1; word-break: break-word; }
      .log-meta { color: #a855f7; font-size: 11px; }
    `;
    document.head.appendChild(style);
    
    // 绑定事件
    document.getElementById('log-clear')?.addEventListener('click', () => this.clear());
    document.getElementById('log-toggle')?.addEventListener('click', () => {
      panel.classList.toggle('collapsed');
      document.getElementById('log-toggle').textContent = panel.classList.contains('collapsed') ? '➕' : '➖';
    });
    
    // 使面板可拖动
    this.makeDraggable(panel, panel.querySelector('.log-header'));
  }
  
  makeDraggable(panel, handle) {
    let isDragging = false;
    let startX, startY, startLeft, startBottom;
    
    handle.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('log-btn')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = panel.offsetLeft;
      startBottom = window.innerHeight - panel.offsetTop;
      panel.style.transition = 'none';
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = startY - e.clientY;
      panel.style.left = (startLeft + dx) + 'px';
      panel.style.bottom = (startBottom + dy) + 'px';
      panel.style.right = 'auto';
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
      panel.style.transition = '';
    });
  }
  
  log(level, message, meta = null) {
    const now = new Date();
    const time = now.toLocaleTimeString('zh-CN', { hour12: false }) + '.' + String(now.getMilliseconds()).padStart(3, '0');
    const levelInfo = this.levels[level] || this.levels.INFO;
    
    const entry = {
      time,
      level,
      symbol: levelInfo.symbol,
      label: levelInfo.label,
      color: levelInfo.color,
      message,
      meta
    };
    
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    this.renderEntry(entry);
  }
  
  renderEntry(entry) {
    const container = document.getElementById('log-content');
    if (!container) return;
    
    const el = document.createElement('div');
    el.className = 'log-entry';
    el.innerHTML = `
      <span class="log-time">${entry.time}</span>
      <span class="log-symbol" style="color:${entry.color}">${entry.symbol}</span>
      <span class="log-level" style="color:${entry.color}">[${entry.label}]</span>
      <span class="log-message">${this.escapeHtml(entry.message)}</span>
      ${entry.meta ? `<span class="log-meta">${this.escapeHtml(JSON.stringify(entry.meta))}</span>` : ''}
    `;
    
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  debug(message, meta) { this.log('DEBUG', message, meta); }
  info(message, meta) { this.log('INFO', message, meta); }
  success(message, meta) { this.log('SUCCESS', message, meta); }
  warn(message, meta) { this.log('WARN', message, meta); }
  error(message, meta) { this.log('ERROR', message, meta); }
  
  clear() {
    this.logs = [];
    const container = document.getElementById('log-content');
    if (container) container.innerHTML = '';
    this.info('日志已清空');
  }
}

// 创建全局日志实例
const logger = new SoulWriterLogger();

// 修改api函数添加日志
const originalApi = api;
api = async function(endpoint, options = {}) {
  const method = options.method || 'GET';
  const url = API_BASE + endpoint;
  
  logger.info(`${method} ${url}`, { options });
  
  try {
    const start = Date.now();
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    const elapsed = Date.now() - start;
    
    const data = await res.json();
    
    if (data.error) {
      logger.error(`API Error: ${data.error}`, { endpoint, elapsed });
    } else {
      logger.success(`${method} ${endpoint} [${elapsed}ms]`, { 
        hasData: !!data, 
        dataType: Array.isArray(data) ? 'array' : typeof data 
      });
    }
    
    return data;
  } catch (e) {
    logger.error(`Network Error: ${e.message}`, { endpoint });
    return { error: e.message };
  }
};

// 添加便捷的函数调用日志
function logFn(name, fn) {
  return async function(...args) {
    logger.debug(`→ ${name}(${args.map(a => JSON.stringify(a).slice(0, 30)).join(', ')})`);
    try {
      const result = await fn.apply(this, args);
      logger.debug(`← ${name} => ${JSON.stringify(result)?.slice(0, 50)}`);
      return result;
    } catch (e) {
      logger.error(`✗ ${name} error: ${e.message}`);
      throw e;
    }
  };
}

// 导出
window.logger = logger;
window.logFn = logFn;
