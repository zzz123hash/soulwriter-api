/**
 * SoulWriter - 灵魂创作者
 * 简化版 - 专注核心功能
 */

const API_BASE = 'http://localhost:3000/api/v1';

// 状态
const state = {
  currentView: 'welcome',
  currentBook: null,
  books: [],
  roles: [],
  items: [],
  locations: [],
  chapters: [],
  scenes: []
};

// API
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

// i18n
const i18n = {
  'zh-CN': {
    app: { name: 'SoulWriter', subtitle: '灵魂创作者 · 内容塑魂师' },
    nav: { roles: '角色', items: '物品', locations: '地点', chapters: '章节', writing: '写作', genesis: '创世树' },
    book: { create: '创建新书', noBooks: '书架空空如也，创建第一本书吧' },
    common: { back: '返回', loading: '加载中...' }
  },
  'en-US': {
    app: { name: 'SoulWriter', subtitle: 'Soul Creator · Content Shaper' },
    nav: { roles: 'Roles', items: 'Items', locations: 'Locations', chapters: 'Chapters', writing: 'Writing', genesis: 'Genesis' },
    book: { create: 'Create Book', noBooks: 'Your bookshelf is empty. Create your first book!' },
    common: { back: 'Back', loading: 'Loading...' }
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
  return `
    <div class="welcome-page">
      <header class="welcome-header">
        <h1 class="app-logo">SoulWriter</h1>
        <p class="app-slogan">${t('app.subtitle')}</p>
      </header>
      
      <section class="bookshelf-section">
        <h2 class="section-title">📚 ${t('common.bookshelf')}</h2>
        <div class="bookshelf" id="books-list">
          <div class="loading-text">${t('common.loading')}</div>
        </div>
      </section>
      
      <div class="create-book-area">
        <button class="btn-create-book" id="create-book-btn">
          <span class="btn-icon">+</span>
          <span class="btn-text">${t('book.create')}</span>
        </button>
      </div>
    </div>
  `;
}

// ============ 主布局 ============
function renderMainLayout() {
  return `
    <div class="main-layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2 class="book-title">${state.currentBook?.name || ''}</h2>
          <button class="btn btn-sm" id="back-to-books">← ${t('common.back')}</button>
        </div>
        <nav class="sidebar-nav">
          <div class="nav-item" data-view="roles">📁 ${t('nav.roles')}</div>
          <div class="nav-item" data-view="items">🎁 ${t('nav.items')}</div>
          <div class="nav-item" data-view="locations">📍 ${t('nav.locations')}</div>
          <div class="nav-item" data-view="chapters">📖 ${t('nav.chapters')}</div>
          <div class="nav-item" data-view="writing">✍️ ${t('nav.writing')}</div>
          <div class="nav-item" data-view="genesis">🌳 ${t('nav.genesis')}</div>
        </nav>
      </aside>
      <main class="main-content" id="main-content">
        ${renderContent()}
      </main>
    </div>
  `;
}

function renderContent() {
  switch (state.currentView) {
    case 'roles': return renderRoles();
    case 'items': return renderItems();
    case 'locations': return renderLocations();
    case 'chapters': return renderChapters();
    case 'writing': return renderWriting();
    case 'genesis': return renderGenesis();
    default: return renderRoles();
  }
}

function renderRoles() {
  return '<h2>📁 角色</h2><p>暂无角色</p><button class="btn btn-primary" onclick="showCreateRoleModal()">+ 创建角色</button>';
}

function renderItems() {
  return '<h2>🎁 物品</h2><p>暂无物品</p><button class="btn btn-primary" onclick="showCreateItemModal()">+ 创建物品</button>';
}

function renderLocations() {
  return '<h2>📍 地点</h2><p>暂无地点</p><button class="btn btn-primary" onclick="showCreateLocationModal()">+ 创建地点</button>';
}

function renderChapters() {
  return '<h2>📖 章节</h2><p>暂无章节</p><button class="btn btn-primary" onclick="showCreateChapterModal()">+ 创建章节</button>';
}

function renderWriting() {
  return '<h2>✍️ 写作</h2><p>写作界面开发中...</p>';
}

function renderGenesis() {
  return '<h2>🌳 创世树</h2><p>创世树开发中...</p>';
}

// ============ 事件 ============
function bindWelcomeEvents() {
  document.getElementById('create-book-btn')?.addEventListener('click', showCreateBookModal);
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
}

// ============ 数据 ============
async function loadBooks() {
  logger?.info('DATA_LOAD', '/projects');
  const books = await api('/projects');
  state.books = Array.isArray(books) ? books : [];
  renderBooksList();
}

async function loadBookData() {
  if (!state.currentBook) return;
  const id = state.currentBook.id;
  state.roles = await api(`/projects/${id}/roles`) || [];
  state.items = await api(`/projects/${id}/items`) || [];
  state.locations = await api(`/projects/${id}/locations`) || [];
  state.chapters = await api(`/projects/${id}/chapters`) || [];
}

function renderBooksList() {
  const c = document.getElementById('books-list');
  if (!c) return;
  
  if (state.books.length === 0) {
    c.innerHTML = '<div class="empty-bookshelf">'+t('book.noBooks')+'</div>';
    return;
  }
  
  c.innerHTML = state.books.map(book => `
    <div class="book-item" data-id="${book.id}">
      <div class="book-cover">
        <div class="book-spine"></div>
        <div class="book-front"><span class="book-name">${book.name}</span></div>
      </div>
      <div class="book-info">
        <h3 class="book-title">${book.name}</h3>
        <p class="book-desc">${book.description || '...'}</p>
        <div class="book-actions">
          <button class="btn btn-sm" onclick="openBook('${book.id}')">打开</button>
          <button class="btn btn-sm btn-danger" onclick="deleteBook('${book.id}')">删除</button>
        </div>
      </div>
    </div>
  `).join('');
}

function openBook(id) {
  state.currentBook = state.books.find(b => b.id === id);
  loadBookData();
  state.currentView = 'roles';
  renderApp();
}

async function deleteBook(id) {
  if (!confirm('确定删除？')) return;
  await api(`/projects/${id}`, { method: 'DELETE' });
  loadBooks();
}

// ============ 模态框 ============
function showCreateBookModal() {
  logger?.info('MODAL_OPEN', 'CreateBook');
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header"><h3>${t('book.create')}</h3><button class="modal-close">×</button></div>
      <form class="modal-body" id="book-form">
        <div class="form-group">
          <label>书名</label>
          <input type="text" name="name" class="input" required placeholder="输入书名">
        </div>
        <div class="form-group">
          <label>简介</label>
          <textarea name="description" class="input" rows="3" placeholder="简要描述..."></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" id="modal-cancel">取消</button>
          <button type="submit" class="btn btn-primary">创建</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelector('#modal-cancel').addEventListener('click', () => {
    logger?.info('MODAL_CLOSE', 'CreateBook');
    modal.remove();
  });
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  
  modal.querySelector('#book-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const description = e.target.description.value;
    
    logger?.info('DATA_SAVE', '/projects', { name });
    
    const result = await api('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description })
    });
    
    modal.remove();
    
    if (result && result.id) {
      logger?.success('API_SUCCESS', 'Book created', { id: result.id });
      state.currentBook = result;
      state.currentView = 'roles';
      renderApp();
    } else {
      logger?.error('API_ERROR', '创建失败', { result });
      alert('创建失败');
    }
  });
  
  setTimeout(() => modal.querySelector('input[name="name"]')?.focus(), 100);
}

// 全局函数
window.showCreateRoleModal = function() {
  alert('创建角色功能开发中...');
};
window.showCreateItemModal = function() {
  alert('创建物品功能开发中...');
};
window.showCreateLocationModal = function() {
  alert('创建地点功能开发中...');
};
window.showCreateChapterModal = function() {
  alert('创建章节功能开发中...');
};
window.openBook = openBook;
window.deleteBook = deleteBook;

// 初始化
function init() {
  logger?.info('APP_INIT', 'SoulWriter starting');
  renderApp();
}

document.addEventListener('DOMContentLoaded', init);
