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

function renderContent() {
  switch (state.currentView) {
    case 'roles': return '<h2>📁 '+t('nav.roles')+'</h2><p>暂无角色</p><button class="btn btn-primary" id="add-role-btn">+ 创建角色</button>';
    case 'items': return '<h2>🎁 '+t('nav.items')+'</h2><p>暂无物品</p><button class="btn btn-primary" id="add-item-btn">+ 创建物品</button>';
    case 'locations': return '<h2>📍 '+t('nav.locations')+'</h2><p>暂无地点</p><button class="btn btn-primary" id="add-location-btn">+ 创建地点</button>';
    case 'chapters': return '<h2>📖 '+t('nav.chapters')+'</h2><p>暂无章节</p><button class="btn btn-primary" id="add-chapter-btn">+ 创建章节</button>';
    case 'writing': return '<h2>✍️ '+t('nav.writing')+'</h2><p>写作界面开发中...</p>';
    case 'genesis': return '<h2>🌳 '+t('nav.genesis')+'</h2><p>创世树开发中...</p>';
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
      state.currentView = el.dataset.view;
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
