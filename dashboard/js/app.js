/**
 * SoulWriter - 抽屉式内页架构
 */

const API_BASE = '/api/v1';

// 状态
const state = {
  currentView: 'welcome',      // welcome | book
  currentTab: 'genesis',         // home | genesis | event | nvwa | novel
  currentEntity: 'roles',       // roles | items | locations | nodes | units | world | settings | prompts | map
  currentBook: null,
  books: [],
  // 抽屉状态
  leftDrawerOpen: true,
  rightDrawer1Open: false,      // 实体列表
  rightDrawer2Open: false,      // 实体详情
  rightDrawer2Width: 400,
  selectedEntity: null,
  // 数据
  roles: [],
  items: [],
  locations: [],
  nodes: [],
  units: []
};

// i18n
const i18n = {
  'zh-CN': {
    app: { name: 'SoulWriter', subtitle: '灵魂创作者' },
    tabs: { home: '首页', genesis: '创世树', event: '事件线', nvwa: '女娲', novel: '小说' },
    nav: { roles: '角色', items: '物品', locations: '地点', nodes: '节点', units: '单元', world: '世界观', settings: '设定', prompts: '提示词', map: '地图' },
    book: { create: '创建新书', noBooks: '书架空空' },
    common: { back: '返回', loading: '加载中...', save: '保存', cancel: '取消', delete: '删除', edit: '编辑' }
  },
  'en-US': {
    app: { name: 'SoulWriter', subtitle: 'Soul Creator' },
    tabs: { home: 'Home', genesis: 'Genesis', event: 'Event', nvwa: 'Nvwa', novel: 'Novel' },
    nav: { roles: 'Roles', items: 'Items', locations: 'Locations', nodes: 'Nodes', units: 'Units', world: 'World', settings: 'Settings', prompts: 'Prompts', map: 'Map' },
    book: { create: 'Create Book', noBooks: 'Empty shelf' },
    common: { back: 'Back', loading: 'Loading...', save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit' }
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

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ============ 主渲染 ============
function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;
  
  if (!state.currentBook) {
    app.innerHTML = renderWelcome();
    bindWelcomeEvents();
  } else {
    app.innerHTML = renderBookView();
    bindBookEvents();
    loadBookData();
  }
}

// ============ 欢迎页（书架） ============
function renderWelcome() {
  return `
    <div class="welcome-page">
      <div class="welcome-logo">
        <h1 class="app-logo">SoulWriter</h1>
        <p class="app-slogan">${t('app.subtitle')}</p>
      </div>
      <section class="bookshelf-section">
        <h2 class="section-title">${t('common.bookshelf')}</h2>
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

// ============ 书本内页 ============
function renderBookView() {
  return `
    <div class="book-layout">
      
      <header class="book-header">
        <div class="book-tabs">
          <button class="book-tab ${state.currentTab === 'home' ? 'active' : ''}" data-tab="home">
            🏠 ${t('tabs.home')}
          </button>
          <button class="book-tab ${state.currentTab === 'genesis' ? 'active' : ''}" data-tab="genesis">
            🌳 ${t('tabs.genesis')}
          </button>
          <button class="book-tab ${state.currentTab === 'event' ? 'active' : ''}" data-tab="event">
            📋 ${t('tabs.event')}
          </button>
          <button class="book-tab ${state.currentTab === 'nvwa' ? 'active' : ''}" data-tab="nvwa">
            🧬 ${t('tabs.nvwa')}
          </button>
          <button class="book-tab ${state.currentTab === 'novel' ? 'active' : ''}" data-tab="novel">
            📖 ${t('tabs.novel')}
          </button>
        </div>
        <div class="book-info">
          <span class="book-name">${escapeHtml(state.currentBook?.title || '')}</span>
          <button class="btn-back" id="back-to-books">← ${t('common.back')}</button>
        </div>
      </header>
      
      
      <div class="book-body">
        
        <aside class="left-drawer ${state.leftDrawerOpen ? 'open' : ''}" id="left-drawer">
          <div class="drawer-header">
            <span class="drawer-title">导航</span>
            <button class="drawer-toggle" id="toggle-left">◀</button>
          </div>
          <nav class="entity-nav">
            ${renderEntityNavItems()}
          </nav>
        </aside>
        
        
        <main class="main-canvas" id="main-canvas">
          ${renderTabCanvas()}
        </main>
        
        
        <aside class="right-drawer drawer-1 ${state.rightDrawer1Open ? 'open' : ''}" id="right-drawer-1">
          <div class="drawer-header">
            <span class="drawer-title">${t('nav.' + state.currentEntity)}</span>
            <button class="drawer-toggle" id="toggle-right-1">▶</button>
          </div>
          <div class="drawer-content" id="entity-list-drawer">
            ${renderEntityList()}
          </div>
        </aside>
        
        
        <aside class="right-drawer drawer-2 ${state.rightDrawer2Open ? 'open' : ''}" id="right-drawer-2" style="width: ${state.rightDrawer2Width}px">
          <div class="drawer-header">
            <span class="drawer-title">详情</span>
            <div class="drawer-actions">
              <button class="drawer-expand" id="expand-detail">⛶</button>
              <button class="drawer-toggle" id="toggle-right-2">▶</button>
            </div>
          </div>
          <div class="drawer-content" id="entity-detail-drawer">
            ${state.selectedEntity ? renderEntityDetail() : '<div class="empty-hint">← 点击实体查看详情</div>'}
          </div>
        </aside>
      </div>
    </div>
  `;
}

function renderEntityNavItems() {
  const items = [
    { key: 'roles', icon: '👤' },
    { key: 'items', icon: '🎁' },
    { key: 'locations', icon: '📍' },
    { key: 'nodes', icon: '📌' },
    { key: 'units', icon: '📑' },
    { key: 'world', icon: '🌍' },
    { key: 'settings', icon: '⚙️' },
    { key: 'prompts', icon: '💬' },
    { key: 'map', icon: '🗺️' }
  ];
  
  return items.map(item => `
    <div class="entity-nav-item ${state.currentEntity === item.key ? 'active' : ''}" data-entity="${item.key}">
      <span class="nav-icon">${item.icon}</span>
      <span class="nav-label">${t('nav.' + item.key)}</span>
    </div>
  `).join('');
}

function renderTabCanvas() {
  // 根据 Tab 渲染不同的画布内容
  switch (state.currentTab) {
    case 'home':
      return '<div class="tab-canvas"><div class="canvas-placeholder">🏠 首页 - 书本概览</div></div>';
    case 'genesis':
      return '<div class="tab-canvas"><div class="canvas-placeholder" id="genesis-canvas">🌳 创世树 - 拖拽创建节点和关系</div></div>';
    case 'event':
      return '<div class="tab-canvas"><div class="canvas-placeholder">📋 事件线 - 时间轴视图</div></div>';
    case 'nvwa':
      return '<div class="tab-canvas"><div class="canvas-placeholder">🧬 女娲推演 - AI 角色推演引擎</div></div>';
    case 'novel':
      return '<div class="tab-canvas"><div class="canvas-placeholder">📖 小说详写 - 章节编辑器</div></div>';
    default:
      return '<div class="tab-canvas"></div>';
  }
}

function renderEntityList() {
  const data = state[state.currentEntity] || [];
  
  if (data.length === 0) {
    return `<div class="empty-hint">暂无${t('nav.' + state.currentEntity)}，点击下方按钮创建</div>
      <button class="btn-add-entity" id="add-entity-btn">+ 添加${t('nav.' + state.currentEntity)}</button>`;
  }
  
  return `
    <div class="entity-list">
      ${data.map(item => `
        <div class="entity-list-item" data-id="${item.id}">
          <div class="item-icon">${getEntityIcon(state.currentEntity)}</div>
          <div class="item-info">
            <div class="item-title">${escapeHtml(item.title || item.name || '未命名')}</div>
            <div class="item-desc">${escapeHtml((item.description || '').substring(0, 30))}</div>
          </div>
        </div>
      `).join('')}
    </div>
    <button class="btn-add-entity" id="add-entity-btn">+ 添加${t('nav.' + state.currentEntity)}</button>
  `;
}

function getEntityIcon(entityType) {
  const icons = {
    roles: '👤', items: '🎁', locations: '📍', nodes: '📌', units: '📑',
    world: '🌍', settings: '⚙️', prompts: '💬', map: '🗺️'
  };
  return icons[entityType] || '📄';
}

function renderEntityDetail() {
  if (!state.selectedEntity) return '<div class="empty-hint">← 点击实体查看详情</div>';
  
  const entity = state.selectedEntity;
  return `
    <div class="entity-detail">
      <div class="detail-header">
        <div class="detail-icon">${getEntityIcon(state.currentEntity)}</div>
        <div class="detail-title">${escapeHtml(entity.title || entity.name || '未命名')}</div>
      </div>
      <div class="detail-body">
        <div class="detail-field">
          <label>名称</label>
          <input type="text" class="detail-input" id="detail-title" value="${escapeHtml(entity.title || entity.name || '')}">
        </div>
        <div class="detail-field">
          <label>描述</label>
          <textarea class="detail-textarea" id="detail-desc" rows="5">${escapeHtml(entity.description || '')}</textarea>
        </div>
        <div class="detail-field">
          <label>类型</label>
          <select class="detail-select" id="detail-type">
            <option value="main" ${entity.type === 'main' ? 'selected' : ''}>主角</option>
            <option value="supporting" ${entity.type === 'supporting' ? 'selected' : ''}>配角</option>
            <option value="minor" ${entity.type === 'minor' ? 'selected' : ''}>龙套</option>
          </select>
        </div>
      </div>
      <div class="detail-actions">
        <button class="btn-save-detail" id="save-entity-btn">💾 ${t('common.save')}</button>
        <button class="btn-delete-detail" id="delete-entity-btn">🗑️ ${t('common.delete')}</button>
      </div>
    </div>
  `;
}

// ============ 加载书本数据 ============
async function loadBookData() {
  if (!state.currentBook?.id) return;
  
  const result = await booksApi('get', { id: state.currentBook.id });
  if (result.success && result.data) {
    state.roles = result.data.roles || [];
    state.items = result.data.items || [];
    state.locations = result.data.locations || [];
    state.nodes = result.data.nodes || [];
    state.units = result.data.units || [];
  }
  
  updateEntityDrawer();
}

function updateEntityDrawer() {
  const listEl = document.getElementById('entity-list-drawer');
  if (listEl) {
    listEl.innerHTML = renderEntityList();
    bindEntityListEvents();
  }
}

// ============ 事件绑定 ============
function bindWelcomeEvents() {
  document.getElementById('create-book-btn')?.addEventListener('click', showCreateBookModal);
  loadBooks();
}

function bindBookEvents() {
  // 返回书架
  document.getElementById('back-to-books')?.addEventListener('click', () => {
    state.currentBook = null;
    state.currentView = 'welcome';
    renderApp();
  });
  
  // Tab 切换
  document.querySelectorAll('.book-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.book-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.currentTab = tab.dataset.tab;
      renderApp();
    });
  });
  
  // 左侧抽屉切换
  document.getElementById('toggle-left')?.addEventListener('click', () => {
    state.leftDrawerOpen = !state.leftDrawerOpen;
    document.getElementById('left-drawer')?.classList.toggle('open', state.leftDrawerOpen);
  });
  
  // 右侧抽屉1切换
  document.getElementById('toggle-right-1')?.addEventListener('click', () => {
    state.rightDrawer1Open = !state.rightDrawer1Open;
    document.getElementById('right-drawer-1')?.classList.toggle('open', state.rightDrawer1Open);
  });
  
  // 右侧抽屉2切换
  document.getElementById('toggle-right-2')?.addEventListener('click', () => {
    state.rightDrawer2Open = false;
    document.getElementById('right-drawer-2')?.classList.remove('open');
  });
  
  // 详情展开
  document.getElementById('expand-detail')?.addEventListener('click', () => {
    state.rightDrawer2Width = state.rightDrawer2Width === 400 ? 600 : 400;
    document.getElementById('right-drawer-2').style.width = state.rightDrawer2Width + 'px';
  });
  
  // 实体类型导航
  document.querySelectorAll('.entity-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.entity-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      state.currentEntity = item.dataset.entity;
      state.rightDrawer1Open = true;
      state.rightDrawer2Open = false;
      state.selectedEntity = null;
      renderApp();
    });
  });
  
  bindEntityListEvents();
}

function bindEntityListEvents() {
  // 点击实体项
  document.querySelectorAll('.entity-list-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      const data = state[state.currentEntity] || [];
      state.selectedEntity = data.find(e => e.id === id);
      state.rightDrawer2Open = true;
      renderApp();
    });
  });
  
  // 添加实体
  document.getElementById('add-entity-btn')?.addEventListener('click', () => {
    showCreateEntityModal(state.currentEntity);
  });
  
  // 保存实体
  document.getElementById('save-entity-btn')?.addEventListener('click', () => {
    saveEntityDetail();
  });
  
  // 删除实体
  document.getElementById('delete-entity-btn')?.addEventListener('click', () => {
    if (confirm('确定删除？')) {
      deleteCurrentEntity();
    }
  });
}

function showCreateEntityModal(type) {
  const titles = { roles: '创建角色', items: '创建物品', locations: '创建地点', nodes: '创建节点', units: '创建单元' };
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${titles[type] || '创建'}</h3>
        <button class="modal-close" id="modal-close">×</button>
      </div>
      <form class="modal-body" id="entity-form">
        <div class="form-group">
          <label>名称</label>
          <input type="text" name="title" class="input" required placeholder="输入名称">
        </div>
        <div class="form-group">
          <label>描述</label>
          <textarea name="description" class="input" rows="3" placeholder="描述..."></textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="modal-cancel">${t('common.cancel')}</button>
          <button type="submit" class="btn btn-primary">${t('common.save')}</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  
  document.getElementById('modal-close').addEventListener('click', () => modal.remove());
  document.getElementById('modal-cancel').addEventListener('click', () => modal.remove());
  document.getElementById('entity-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = e.target.title.value.trim();
    const description = e.target.description.value.trim();
    if (!title) { alert('请输入名称'); return; }
    
    const result = await booksApi('save_' + type.replace(/s$/, ''), {
      bookId: state.currentBook.id,
      title,
      description
    });
    
    modal.remove();
    if (result.success) {
      loadBookData();
    } else {
      alert('创建失败');
    }
  });
}

async function saveEntityDetail() {
  if (!state.selectedEntity) return;
  
  const title = document.getElementById('detail-title')?.value || '';
  const description = document.getElementById('detail-desc')?.value || '';
  
  const result = await booksApi('update_' + state.currentEntity.replace(/s$/, ''), {
    bookId: state.currentBook.id,
    id: state.selectedEntity.id,
    title,
    description
  });
  
  if (result.success) {
    state.selectedEntity.title = title;
    state.selectedEntity.description = description;
    renderApp();
  } else {
    alert('保存失败');
  }
}

async function deleteCurrentEntity() {
  if (!state.selectedEntity) return;
  
  const result = await booksApi('delete_' + state.currentEntity.replace(/s$/, ''), {
    bookId: state.currentBook.id,
    id: state.selectedEntity.id
  });
  
  if (result.success) {
    state.selectedEntity = null;
    state.rightDrawer2Open = false;
    loadBookData();
  } else {
    alert('删除失败');
  }
}

// ============ Books API ============
async function booksApi(action, data = {}) {
  try {
    let endpoint = '/api/books';
    let body = { action, ...data };
    
    if (action.startsWith('save_role') || action.startsWith('update_role') || action.startsWith('delete_role')) {
      endpoint = '/api/roles';
    } else if (action.startsWith('save_item') || action.startsWith('update_item') || action.startsWith('delete_item')) {
      endpoint = '/api/items';
    } else if (action.startsWith('save_location') || action.startsWith('update_location') || action.startsWith('delete_location')) {
      endpoint = '/api/locations';
    }
    
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return await res.json();
  } catch (e) {
    console.error('API error:', e);
    return { error: e.message };
  }
}

async function loadBooks() {
  const result = await booksApi('list');
  state.books = result.data || [];
  renderBooksList();
}

function renderBooksList() {
  const c = document.getElementById('books-list');
  if (!c) return;
  if (state.books.length === 0) {
    c.innerHTML = `<div class="empty-bookshelf"><p>${t('book.noBooks')}</p></div>`;
    return;
  }
  c.innerHTML = state.books.map(book => `
    <div class="book-item" data-id="${book.id}">
      <div class="book-cover">
        <div class="book-spine"></div>
        <div class="book-front">
          <span class="book-name">${book.title?.charAt(0) || '?'}</span>
        </div>
      </div>
      <div class="book-info">
        <h3 class="book-title">${escapeHtml(book.title)}</h3>
        <p class="book-desc">${escapeHtml(book.author || '未知作者')} · ${book.wordCount || 0}字</p>
        <div class="book-actions">
          <button class="btn btn-sm btn-open" data-id="${book.id}">打开</button>
          <button class="btn btn-sm btn-danger" data-id="${book.id}">删除</button>
        </div>
      </div>
    </div>
  `).join('');
  
  c.querySelectorAll('.btn-open').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); openBook(btn.dataset.id); }));
  c.querySelectorAll('.btn-danger').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); deleteBook(btn.dataset.id); }));
}

async function openBook(id) {
  const result = await booksApi('get', { id });
  if (result.success && result.data) {
    state.currentBook = result.data;
    state.currentView = 'book';
    state.currentTab = 'home';
    state.leftDrawerOpen = true;
    state.rightDrawer1Open = false;
    state.rightDrawer2Open = false;
    state.selectedEntity = null;
    renderApp();
  }
}

async function deleteBook(id) {
  if (!confirm('确定删除？')) return;
  const result = await booksApi('delete', { id });
  if (result.success) loadBooks();
}

function showCreateBookModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${t('book.create')}</h3>
        <button class="modal-close">×</button>
      </div>
      <form class="modal-body" id="book-form">
        <div class="form-group">
          <label>书名</label>
          <input type="text" name="title" class="input" required placeholder="输入书名">
        </div>
        <div class="form-group">
          <label>作者</label>
          <input type="text" name="author" class="input" placeholder="作者名称">
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="modal-cancel">${t('common.cancel')}</button>
          <button type="submit" class="btn btn-primary">${t('common.save')}</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('#modal-cancel').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.querySelector('#book-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = e.target.title.value.trim();
    const author = e.target.author.value.trim();
    if (!title) { alert('请输入书名'); return; }
    const result = await booksApi('create', { title, author });
    modal.remove();
    if (result.success && result.data) {
      openBook(result.data.id);
    }
  });
}

// ============ 初始化 ============
function init() {
  renderApp();
}

document.addEventListener('DOMContentLoaded', init);
