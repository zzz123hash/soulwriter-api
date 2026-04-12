/**
 * SoulWriter - 灵魂创作者
 * Updated: 使用新的Books API
 */

const API_BASE = '/api/v1';

// 状态
const state = {
  currentView: 'welcome',
  currentBook: null,
  books: [],
  shelves: [],
  roles: [],
  items: [],
  locations: [],
  chapters: [],
  scenes: []
};

// API - 同时支持旧API和新Books API
async function api(endpoint, options = {}) {
  try {
    const url = API_BASE + endpoint;
    logger?.info('API_REQ', endpoint, { method: options.method || 'GET' });
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    const data = await res.json();
    if (data.error) {
      logger?.error('API_ERROR', data.error, { endpoint });
    } else {
      logger?.success('API_SUCCESS', endpoint, { status: res.status });
    }
    return data;
  } catch (e) {
    logger?.error('API_ERROR', e.message, { endpoint });
    return { error: e.message };
  }
}

// Books API (新版)
async function booksApi(action, data = {}) {
  try {
    logger?.info('BOOKS_API', action, data);
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...data })
    });
    const result = await res.json();
    if (result.error) {
      logger?.error('BOOKS_ERROR', result.error);
    } else {
      logger?.success('BOOKS_OK', action);
    }
    return result;
  } catch (e) {
    logger?.error('BOOKS_ERROR', e.message);
    return { error: e.message };
  }
}

// i18n
const i18n = {
  'zh-CN': {
    app: { name: 'SoulWriter', subtitle: '灵魂创作者 · 内容塑魂师' },
    nav: { roles: '角色', items: '物品', locations: '地点', chapters: '章节', writing: '写作', genesis: '创世树' },
    book: { create: '创建新书', import: '导入', noBooks: '书架空空如也，创建第一本书吧' },
    common: { bookshelf: '书架', back: '返回', loading: '加载中...' }
  },
  'en-US': {
    app: { name: 'SoulWriter', subtitle: 'Soul Creator · Content Shaper' },
    nav: { roles: 'Roles', items: 'Items', locations: 'Locations', chapters: 'Chapters', writing: 'Writing', genesis: 'Genesis' },
    book: { create: 'Create Book', import: 'Import', noBooks: 'Your bookshelf is empty. Create your first book!' },
    common: { bookshelf: 'Bookshelf', back: 'Back', loading: 'Loading...' }
  }
};

function getLang() { return localStorage.getItem('soulwriter-lang') || 'zh-CN'; }
function t(key) {
  const lang = getLang();
  const keys = key.split('.');
  let v = i18n[lang];
  for (const k of keys) { v = v?.[k]; if (!v) return key; }
  return v;
}

// 渲染
function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;
  if (!state.currentBook) {
    app.innerHTML = renderWelcome();
    bindWelcomeEvents();
  } else {
    app.innerHTML = renderMainLayout();
    bindMainEvents();
  }
}

// ============ 欢迎页 ============
function renderWelcome() {
  return `<div class="welcome-page">
    <header class="welcome-header">
      <h1 class="app-logo">SoulWriter</h1>
      <p class="app-slogan">${t('app.subtitle')}</p>
    </header>
    <section class="bookshelf-section">
      <h2 class="section-title">📚 ${t('common.bookshelf')}</h2>
      <div class="bookshelf" id="books-list"><div class="loading-text">${t('common.loading')}</div></div>
    </section>
    <div class="create-book-area">
      <button class="btn-create-book" id="create-book-btn">
        <span class="btn-icon">+</span>
        <span class="btn-text">${t('book.create')}</span>
      </button>
      <button class="btn-create-book" id="import-book-btn" style="background:#4f46e5">
        <span class="btn-icon">📥</span>
        <span class="btn-text">${t('book.import')}</span>
      </button>
    </div>
  </div>`;
}

// ============ 主界面布局 ============
function renderMainLayout() {
  return `
    <div class="app-layout">
      <header class="app-header">
        <button class="btn-back" id="back-to-books">← 📚</button>
        <h1 class="book-title">${state.currentBook?.title || '无标题'}</h1>
      </header>
      <nav class="nav-sidebar">
        <button class="nav-item ${state.currentView === 'chapters' ? 'active' : ''}" data-view="chapters">📖 章节</button>
        <button class="nav-item ${state.currentView === 'roles' ? 'active' : ''}" data-view="roles">👤 角色</button>
        <button class="nav-item ${state.currentView === 'items' ? 'active' : ''}" data-view="items">🎁 物品</button>
        <button class="nav-item ${state.currentView === 'locations' ? 'active' : ''}" data-view="locations">🗺️ 地点</button>
        <button class="nav-item ${state.currentView === 'relationships' ? 'active' : ''}" data-view="relationships">🔗 关系</button>
        <button class="nav-item ${state.currentView === 'genesis' ? 'active' : ''}" data-view="genesis">🌱 创世</button>
        <button class="nav-item ${state.currentView === 'settings' ? 'active' : ''}" data-view="settings">⚙️ 设置</button>
      </nav>
      <main class="main-content" id="main-content">
        ${renderContent()}
      </main>
      <footer class="app-footer">
        <button class="btn btn-primary" id="add-role-btn">+ 角色</button>
        <button class="btn btn-primary" id="add-item-btn">+ 物品</button>
        <button class="btn btn-primary" id="add-location-btn">+ 地点</button>
        <button class="btn btn-primary" id="add-chapter-btn">+ 章节</button>
      </footer>
    </div>
  `;
}

function renderSettingsView() {
  const themes = {
    soft: { name: '柔和 🌸', preview: '#F8F8FA' },
    dark: { name: '暗色 🌙', preview: '#1D1D1F' },
    system: { name: '随系统 ⚙️', preview: 'linear-gradient(135deg, #F8F8FA 50%, #1D1D1F 50%)' }
  };
  const current = localStorage.getItem('soulwriter-theme') || 'soft';
  
  return `
    <div class="settings-view">
      <h2>⚙️ 设置</h2>
      
      <div class="settings-section">
        <h3>🎨 主题</h3>
        <div class="theme-grid">
          ${Object.entries(themes).map(([key, t]) => `
            <button class="theme-card ${current === key ? 'active' : ''}" data-theme="${key}">
              <span class="theme-preview" style="background: ${t.preview}"></span>
              <span class="theme-name">${t.name}</span>
            </button>
          `).join('')}
        </div>
      </div>
      
      <div class="settings-section">
        <h3>🤖 AI 配置</h3>
        <div class="ai-config-form">
          <div class="form-row">
            <div class="form-group">
              <label>类型</label>
              <select class="input" id="ai-type">
                <option value="cloud">云端 API</option>
                <option value="local">本地模型</option>
              </select>
            </div>
            <div class="form-group">
              <label>模型</label>
              <input type="text" class="input" id="ai-model" placeholder="gpt-4o">
            </div>
          </div>
          <div class="form-group">
            <label>API 地址</label>
            <input type="text" class="input" id="ai-url" placeholder="https://api.openai.com/v1">
          </div>
          <div class="form-group">
            <label>API Key</label>
            <input type="password" class="input" id="ai-key" placeholder="sk-...">
          </div>
          <button class="btn btn-primary" id="save-ai-config">保存配置</button>
        </div>
      </div>
      
      <div class="settings-section">
        <h3>ℹ️ 关于</h3>
        <p style="color: var(--color-text-secondary); font-size: 14px;">
          SoulWriter v1.2<br>
          创世 × 女娲 AI 创作引擎
        </p>
      </div>
    </div>
  `;
}

function renderSettingsView() {
  const themes = {
    soft: { name: '柔和 🌸', preview: '#F8F8FA' },
    dark: { name: '暗色 🌙', preview: '#1D1D1F' },
    system: { name: '随系统 ⚙️', preview: 'linear-gradient(135deg, #F8F8FA 50%, #1D1D1F 50%)' }
  };
  const current = localStorage.getItem('soulwriter-theme') || 'soft';
  return `<div class="settings-view">
    <div class="settings-section">
      <h3>🎨 主题</h3>
      <div class="theme-grid">
        ${Object.entries(themes).map(([k, t]) => `<button class="theme-card ${current === k ? 'active' : ''}" data-theme="${k}"><span class="theme-preview" style="background:${t.preview}"></span><span>${t.name}</span></button>`).join('')}
      </div>
    </div>
    <div class="settings-section">
      <h3>🤖 AI 配置</h3>
      <div class="ai-form">
        <div class="form-row">
          <div class="form-group"><label>类型</label><select class="input" id="ai-type"><option value="cloud">云端</option><option value="local">本地</option></select></div>
          <div class="form-group"><label>模型</label><input class="input" id="ai-model" placeholder="gpt-4o"></div>
        </div>
        <div class="form-group"><label>API 地址</label><input class="input" id="ai-url" placeholder="https://api.openai.com/v1"></div>
        <div class="form-group"><label>API Key</label><input type="password" class="input" id="ai-key" placeholder="sk-..."></div>
        <button class="btn btn-primary" id="save-ai">保存</button>
      </div>
    </div>
    <div class="settings-section"><p style="color:var(--color-text-secondary);font-size:13px">SoulWriter v1.2 - 创世 × 女娲</p></div>
  </div>`;
}

function bindSettingsEvents() {
  document.querySelectorAll('.theme-card').forEach(c => c.addEventListener('click', () => {
    const t = c.dataset.theme;
    localStorage.setItem('soulwriter-theme', t);
    document.documentElement.removeAttribute('data-theme');
    if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else if (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.setAttribute('data-theme', 'dark');
    document.querySelectorAll('.theme-card').forEach(x => x.classList.remove('active'));
    c.classList.add('active');
  }));
  api('/ai/config').then(d => { if (d.config) { document.getElementById('ai-type').value=d.config.type||'cloud'; document.getElementById('ai-model').value=d.config.model||''; document.getElementById('ai-url').value=d.config.baseUrl||''; document.getElementById('ai-key').value=d.config.apiKey||''; }});
  document.getElementById('save-ai')?.addEventListener('click', async () => { await api('/ai/config', {method:'POST',body:JSON.stringify({type:document.getElementById('ai-type').value,model:document.getElementById('ai-model').value,baseUrl:document.getElementById('ai-url').value,apiKey:document.getElementById('ai-key').value})}); alert('已保存'); });
}

function renderContent() {
  switch (state.currentView) {
    case 'roles': return '<h2>📁 '+t('nav.roles')+'</h2><p>暂无角色</p><button class="btn btn-primary" id="add-role-btn">+ 创建角色</button>';
    case 'items': return '<h2>🎁 '+t('nav.items')+'</h2><p>暂无物品</p><button class="btn btn-primary" id="add-item-btn">+ 创建物品</button>';
    case 'locations': return '<h2>📍 '+t('nav.locations')+'</h2><p>暂无地点</p><button class="btn btn-primary" id="add-location-btn">+ 创建地点</button>';
    case 'chapters': return '<h2>📖 '+t('nav.chapters')+'</h2><p>暂无章节</p><button class="btn btn-primary" id="add-chapter-btn">+ 创建章节</button>';
    case 'writing': return '<h2>✍️ '+t('nav.writing')+'</h2><p>写作界面开发中...</p>';
    case 'genesis': return '<h2>🌳 '+t('nav.genesis')+'</h2><p>创世树开发中...</p>';
    case 'settings': return renderSettingsView();
    default: return '<h2>📁 '+t('nav.roles')+'</h2>';
  }
}

// ============ 事件 ============
function bindWelcomeEvents() {
  document.getElementById('create-book-btn')?.addEventListener('click', showCreateBookModal);
  document.getElementById('import-book-btn')?.addEventListener('click', importBook);
  loadBooks();
}

function bindMainEvents() {
  document.getElementById('back-to-books')?.addEventListener('click', () => {
    state.currentBook = null;
    state.currentView = 'welcome';
    renderApp();
  });
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => {
      if (el.dataset.view === 'settings') { state.currentView = el.dataset.view; document.getElementById('main-content').innerHTML = renderContent(); bindSettingsEvents(); } else { state.currentView = el.dataset.view; document.getElementById('main-content').innerHTML = renderContent(); }
      document.getElementById('main-content').innerHTML = renderContent();
    });
  });
  // 绑定新增按钮
  document.getElementById('add-role-btn')?.addEventListener('click', () => alert('创建角色功能开发中...'));
  document.getElementById('add-item-btn')?.addEventListener('click', () => alert('创建物品功能开发中...'));
  document.getElementById('add-location-btn')?.addEventListener('click', () => alert('创建地点功能开发中...'));
  document.getElementById('add-chapter-btn')?.addEventListener('click', () => showCreateChapterModal());
}

// ============ Books数据 (使用新API) ============
async function loadBooks() {
  logger?.info('BOOKS_LOAD', 'Loading books...');
  const result = await booksApi('list');
  state.books = result.data || [];
  logger?.info('BOOKS_LOADED', state.books.length + ' books');
  renderBooksList();
}

function renderBooksList() {
  const c = document.getElementById('books-list');
  if (!c) return;
  if (state.books.length === 0) {
    c.innerHTML = '<div class="empty-bookshelf">'+t('book.noBooks')+'</div>';
    return;
  }
  c.innerHTML = state.books.map(book => '<div class="book-item" data-id="'+book.id+'"><div class="book-cover"><div class="book-spine"></div><div class="book-front"><span class="book-name">'+(book.title?.charAt(0) || '?')+'</span></div></div><div class="book-info"><h3 class="book-title">'+book.title+'</h3><p class="book-desc">'+(book.author || '未知作者')+' · '+(book.wordCount || 0)+'字</p><div class="book-actions"><button class="btn btn-sm btn-open" data-id="'+book.id+'">打开</button><button class="btn btn-sm btn-danger" data-id="'+book.id+'">删除</button></div></div></div>').join('');
  // 绑定按钮事件
  c.querySelectorAll('.btn-open').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); openBook(btn.dataset.id); }));
  c.querySelectorAll('.btn-danger').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); deleteBook(btn.dataset.id); }));
}

async function openBook(id) {
  const result = await booksApi('get', { id });
  if (result.success && result.data) {
    state.currentBook = result.data;
    state.currentView = 'roles';
    renderApp();
  } else {
    alert('打开失败');
  }
}

async function deleteBook(id) {
  if (!confirm('确定删除这本书？')) return;
  const result = await booksApi('delete', { id });
  if (result.success) {
    loadBooks();
  } else {
    alert('删除失败');
  }
}


// ============ 导入书本 ============
function importBook() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.soul,.json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      let book;
      try {
        book = JSON.parse(text);
      } catch {
        alert('文件格式错误，请选择 .soul 或 .json 文件');
        return;
      }
      if (!book.title) {
        alert('文件缺少 title 字段');
        return;
      }
      const result = await booksApi('create', {
        title: book.title,
        author: book.author || '',
        description: book.description || ''
      });
      if (result.success) {
        alert('导入成功！');
        loadBooks();
      } else {
        alert('导入失败');
      }
    } catch (err) {
      alert('读取文件失败: ' + err.message);
    }
  };
  input.click();
}

// ============ 模态框 ============
function showCreateBookModal() {
  logger?.info('MODAL_OPEN', 'CreateBook');
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = '<div class="modal"><div class="modal-header"><h3>'+t('book.create')+'</h3><button class="modal-close">×</button></div><form class="modal-body" id="book-form"><div class="form-group"><label>书名</label><input type="text" name="title" class="input" required placeholder="输入书名"></div><div class="form-group"><label>作者</label><input type="text" name="author" class="input" placeholder="作者名称"></div><div class="form-group"><label>简介</label><textarea name="description" class="input" rows="3" placeholder="简要描述..."></textarea></div><div class="form-actions"><button type="button" class="btn" id="modal-cancel">取消</button><button type="submit" class="btn btn-primary">创建</button></div></form></div>';
  document.body.appendChild(modal);
  modal.querySelector('#modal-cancel').addEventListener('click', () => { logger?.info('MODAL_CLOSE', 'CreateBook'); modal.remove(); });
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.querySelector('#book-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = e.target.title.value.trim();
    const author = e.target.author.value.trim();
    const description = e.target.description.value.trim();
    if (!title) { alert('请输入书名'); return; }
    logger?.info('BOOKS_CREATE', title);
    const result = await booksApi('create', { title, author, description });
    modal.remove();
    if (result.success && result.data) {
      logger?.success('BOOKS_CREATED', title);
      state.currentBook = result.data;
      state.currentView = 'roles';
      renderApp();
    } else {
      logger?.error('BOOKS_ERROR', '创建失败');
      alert('创建失败');
    }
  });
  setTimeout(() => modal.querySelector('input[name="title"]')?.focus(), 100);
}

function showCreateChapterModal() {
  if (!state.currentBook) return;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = '<div class="modal"><div class="modal-header"><h3>创建章节</h3><button class="modal-close">×</button></div><form class="modal-body" id="chapter-form"><div class="form-group"><label>章节标题</label><input type="text" name="title" class="input" required placeholder="输入章节标题"></div><div class="form-actions"><button type="button" class="btn" id="modal-cancel">取消</button><button type="submit" class="btn btn-primary">创建</button></div></form></div>';
  document.body.appendChild(modal);
  modal.querySelector('#modal-cancel').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.querySelector('#chapter-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = e.target.title.value.trim();
    if (!title) { alert('请输入章节标题'); return; }
    const result = await fetch('/api/chapters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', bookId: state.currentBook.id, title })
    }).then(r => r.json());
    modal.remove();
    if (result.success) {
      alert('创建成功');
      renderApp();
    } else {
      alert('创建失败');
    }
  });
}

// 初始化
function init() {
  logger?.info('APP_INIT', 'SoulWriter ready');
  renderApp();
}

document.addEventListener('DOMContentLoaded', init);
/* Settings */
.settings-view { max-width: 600px; margin: 0 auto; }
.settings-section { background: var(--color-card); border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: var(--shadow-sm); }
.settings-section h3 { font-size: 15px; margin-bottom: 14px; }
.theme-grid { display: flex; gap: 10px; }
.theme-card { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px 18px; background: var(--color-bg); border: 2px solid transparent; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
.theme-card:hover { box-shadow: var(--shadow-md); }
.theme-card.active { border-color: var(--color-primary); background: rgba(124,140,248,0.1); }
.theme-preview { width: 44px; height: 28px; border-radius: 6px; }
.ai-form { display: flex; flex-direction: column; gap: 10px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-group label { font-size: 12px; color: var(--color-text-secondary); }
.input { width: 100%; padding: 8px 10px; border: 1px solid var(--color-border); border-radius: 8px; font-size: 13px; background: var(--color-bg); color: var(--color-text); }
.input:focus { outline: none; border-color: var(--color-primary); }
.btn { padding: 8px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; border: none; }
.btn-primary { background: var(--color-primary); color: white; }
