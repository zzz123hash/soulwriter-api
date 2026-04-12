/**
 * SoulWriter - 完整内页框架 v2
 * 顶部Tab + 左侧导航 + 右侧内容区
 */

const API_BASE = '/api/v1';

// 状态
const state = {
  currentView: 'welcome',      // welcome | book
  currentTab: 'genesis',       // genesis | event | nvwa | novel
  currentEntity: 'roles',      // roles | items | locations | nodes | units | world | settings | prompts | map
  currentBook: null,
  books: [],
  roles: [],
  items: [],
  locations: [],
  nodes: [],
  units: [],
  world: '',
  settings: '',
  prompts: ''
};

// i18n
const i18n = {
  'zh-CN': {
    app: { name: 'SoulWriter', subtitle: '灵魂创作者' },
    tabs: { home: '首页', genesis: '创世树', event: '事件线', nvwa: '女娲推演', novel: '小说详写' },
    nav: { roles: '角色', items: '物品', locations: '地点', nodes: '节点', units: '单元', world: '世界观', settings: '背景设定', prompts: '提示词', map: '地图' },
    book: { create: '创建新书', noBooks: '书架空空如也' },
    common: { back: '返回', loading: '加载中...' }
  },
  'en-US': {
    app: { name: 'SoulWriter', subtitle: 'Soul Creator' },
    tabs: { home: 'Home', genesis: 'Genesis', event: 'Event Line', nvwa: 'Nvwa', novel: 'Novel' },
    nav: { roles: 'Roles', items: 'Items', locations: 'Locations', nodes: 'Nodes', units: 'Units', world: 'World', settings: 'Settings', prompts: 'Prompts', map: 'Map' },
    book: { create: 'Create Book', noBooks: 'Your bookshelf is empty' },
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

// 主题
function getTheme() { return localStorage.getItem('soulwriter-theme') || 'dark'; }
function setTheme(theme) {
  localStorage.setItem('soulwriter-theme', theme);
  applyTheme(theme);
}
function applyTheme(theme) {
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

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ============ 主渲染 ============
function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;
  applyTheme(getTheme());
  
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
      <header class="welcome-header">
        <div class="logo-area">
          <h1 class="app-logo">SoulWriter</h1>
          <p class="app-slogan">${t('app.subtitle')}</p>
        </div>
      </header>
      <section class="bookshelf-section">
        <h2 class="section-title">&#x1F4DA; ${t('common.bookshelf')}</h2>
        <div class="bookshelf" id="books-list">
          <div class="loading-text">${t('common.loading')}</div>
        </div>
      </section>
      <div class="create-book-area">
        <button class="btn-create-book" id="create-book-btn">
          <span class="btn-icon">+</span>
          <span class="btn-text">${t('book.create')}</span>
        </button>
        <button class="btn-create-book" id="import-book-btn">
          <span class="btn-icon">&#x1F4E5;</span>
          <span class="btn-text">&#x5BFC;&#x5165;</span>
        </button>
      </div>
    </div>
  `;
}

// ============ 书本内页 ============
function renderBookView() {
  return `
    <div class="book-layout">
      <!-- 顶部 Tab 栏 -->
      <header class="book-header">
        <div class="book-tabs">
          <button class="book-tab ${state.currentTab === 'home' ? 'active' : ''}" data-tab="home">
            &#x1F3E0; ${t('tabs.home')}
          </button>
          <button class="book-tab ${state.currentTab === 'genesis' ? 'active' : ''}" data-tab="genesis">
            &#x1F333; ${t('tabs.genesis')}
          </button>
          <button class="book-tab ${state.currentTab === 'event' ? 'active' : ''}" data-tab="event">
            &#x1F4C5; ${t('tabs.event')}
          </button>
          <button class="book-tab ${state.currentTab === 'nvwa' ? 'active' : ''}" data-tab="nvwa">
            &#x1F9EC; ${t('tabs.nvwa')}
          </button>
          <button class="book-tab ${state.currentTab === 'novel' ? 'active' : ''}" data-tab="novel">
            &#x1F4D6; ${t('tabs.novel')}
          </button>
        </div>
        <div class="book-header-actions">
          <span class="book-title-small">${escapeHtml(state.currentBook?.title || '')}</span>
          <button class="btn btn-sm" id="back-to-books">&#x2190; ${t('common.back')}</button>
        </div>
      </header>
      
      <!-- 主体区域 -->
      <div class="book-body">
        <!-- 左侧导航 -->
        <aside class="entity-nav">
          <div class="entity-nav-item ${state.currentEntity === 'roles' ? 'active' : ''}" data-entity="roles">
            &#x1F9D4; ${t('nav.roles')}
          </div>
          <div class="entity-nav-item ${state.currentEntity === 'items' ? 'active' : ''}" data-entity="items">
            &#x1F381; ${t('nav.items')}
          </div>
          <div class="entity-nav-item ${state.currentEntity === 'locations' ? 'active' : ''}" data-entity="locations">
            &#x1F4CD; ${t('nav.locations')}
          </div>
          <div class="entity-nav-item ${state.currentEntity === 'nodes' ? 'active' : ''}" data-entity="nodes">
            &#x1F4CC; ${t('nav.nodes')}
          </div>
          <div class="entity-nav-item ${state.currentEntity === 'units' ? 'active' : ''}" data-entity="units">
            &#x1F4DA; ${t('nav.units')}
          </div>
          <div class="entity-nav-item ${state.currentEntity === 'world' ? 'active' : ''}" data-entity="world">
            &#x1F30D; ${t('nav.world')}
          </div>
          <div class="entity-nav-item ${state.currentEntity === 'settings' ? 'active' : ''}" data-entity="settings">
            &#x2699; ${t('nav.settings')}
          </div>
          <div class="entity-nav-item ${state.currentEntity === 'prompts' ? 'active' : ''}" data-entity="prompts">
            &#x1F4DD; ${t('nav.prompts')}
          </div>
          <div class="entity-nav-item ${state.currentEntity === 'map' ? 'active' : ''}" data-entity="map">
            &#x1F5FA; ${t('nav.map')}
          </div>
        </aside>
        
        <!-- 主内容区 -->
        <main class="entity-content" id="entity-content">
          <!-- 动态内容 -->
        </main>
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
    state.world = result.data.world || '';
    state.settings = result.data.settings || '';
    state.prompts = result.data.prompts || '';
  }
  
  renderEntityContent();
}

// ============ 渲染实体内容 ============
function renderEntityContent() {
  const content = document.getElementById('entity-content');
  if (!content) return;
  
  const entityTitles = {
    roles: { icon: '&#x1F9D4;', title: t('nav.roles') },
    items: { icon: '&#x1F381;', title: t('nav.items') },
    locations: { icon: '&#x1F4CD;', title: t('nav.locations') },
    nodes: { icon: '&#x1F4CC;', title: t('nav.nodes') },
    units: { icon: '&#x1F4DA;', title: t('nav.units') },
    world: { icon: '&#x1F30D;', title: t('nav.world') },
    settings: { icon: '&#x2699;', title: t('nav.settings') },
    prompts: { icon: '&#x1F4DD;', title: t('nav.prompts') },
    map: { icon: '&#x1F5FA;', title: t('nav.map') }
  };
  
  const config = entityTitles[state.currentEntity] || entityTitles.roles;
  
  let html = `
    <div class="entity-page">
      <div class="entity-page-header">
        <h2 class="entity-page-title">
          <span class="entity-icon">${config.icon}</span>
          ${config.title}
        </h2>
        <div class="entity-page-actions">
          <button class="btn btn-primary" id="add-entity-btn">+ ${t('common.create') || '创建'}</button>
        </div>
      </div>
      <div class="entity-list" id="entity-list">
  `;
  
  // 根据实体类型渲染不同内容
  if (state.currentEntity === 'roles' || state.currentEntity === 'items' || state.currentEntity === 'locations') {
    const data = state[state.currentEntity] || [];
    if (data.length === 0) {
      html += `<div class="entity-empty">暂无数据</div>`;
    } else {
      html += `<div class="entity-grid">`;
      for (const item of data) {
        html += renderEntityCard(state.currentEntity, item);
      }
      html += `</div>`;
    }
  } else if (state.currentEntity === 'world') {
    html += `
      <div class="entity-textarea-wrap">
        <textarea class="entity-textarea" id="world-textarea" placeholder="描述你的世界观...">${escapeHtml(state.world)}</textarea>
        <button class="btn btn-primary" id="save-world-btn">&#x1F4BE; 保存</button>
      </div>
    `;
  } else if (state.currentEntity === 'settings') {
    html += `
      <div class="entity-textarea-wrap">
        <textarea class="entity-textarea" id="settings-textarea" placeholder="背景设定...">${escapeHtml(state.settings)}</textarea>
        <button class="btn btn-primary" id="save-settings-btn">&#x1F4BE; 保存</button>
      </div>
    `;
  } else if (state.currentEntity === 'prompts') {
    html += `
      <div class="entity-textarea-wrap">
        <textarea class="entity-textarea" id="prompts-textarea" placeholder="提示词模板...">${escapeHtml(state.prompts)}</textarea>
        <button class="btn btn-primary" id="save-prompts-btn">&#x1F4BE; 保存</button>
      </div>
    `;
  } else if (state.currentEntity === 'map') {
    html += `
      <div class="entity-placeholder">
        <div class="placeholder-icon">&#x1F5FA;</div>
        <p>地图功能开发中...</p>
      </div>
    `;
  } else {
    html += `
      <div class="entity-placeholder">
        <div class="placeholder-icon">${config.icon}</div>
        <p>${config.title} 功能开发中...</p>
      </div>
    `;
  }
  
  html += `</div></div>`;
  content.innerHTML = html;
  
  // 绑定事件
  bindEntityEvents();
}

function renderEntityCard(type, item) {
  const icons = { roles: '&#x1F9D4;', items: '&#x1F381;', locations: '&#x1F4CD;' };
  const icon = icons[type] || '&#x2753;';
  const title = escapeHtml(item.title || item.name || '未命名');
  const desc = escapeHtml((item.description || item.desc || item.bio || '').substring(0, 100));
  
  return `
    <div class="entity-card" data-id="${item.id}">
      <div class="entity-card-icon">${icon}</div>
      <div class="entity-card-body">
        <h3 class="entity-card-title">${title}</h3>
        <p class="entity-card-desc">${desc}</p>
      </div>
      <div class="entity-card-actions">
        <button class="btn btn-sm btn-edit" data-id="${item.id}">&#x270F;</button>
        <button class="btn btn-sm btn-danger" data-id="${item.id}">&#x1F5D1;</button>
      </div>
    </div>
  `;
}

// ============ 事件绑定 ============
function bindWelcomeEvents() {
  document.getElementById('create-book-btn')?.addEventListener('click', showCreateBookModal);
  document.getElementById('import-book-btn')?.addEventListener('click', importBook);
  
  // 监听工具栏的主题/语言切换事件
  window.addEventListener('theme-change', (e) => {
    setTheme(e.detail.theme);
    renderApp();
  });
  window.addEventListener('lang-change', (e) => {
    renderApp();
  });
  
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
      // 每个 tab 可以有独立的内容渲染逻辑
      renderTabContent();
    });
  });
  
  // 实体类型切换
  document.querySelectorAll('.entity-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.entity-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      state.currentEntity = item.dataset.entity;
      renderEntityContent();
    });
  });
}

function bindEntityEvents() {
  // 创建按钮
  document.getElementById('add-entity-btn')?.addEventListener('click', () => showCreateEntityModal(state.currentEntity));
  
  // 保存世界观
  document.getElementById('save-world-btn')?.addEventListener('click', async () => {
    const text = document.getElementById('world-textarea')?.value || '';
    await saveEntity('world', { content: text });
  });
  
  // 保存背景设定
  document.getElementById('save-settings-btn')?.addEventListener('click', async () => {
    const text = document.getElementById('settings-textarea')?.value || '';
    await saveEntity('settings', { content: text });
  });
  
  // 保存提示词
  document.getElementById('save-prompts-btn')?.addEventListener('click', async () => {
    const text = document.getElementById('prompts-textarea')?.value || '';
    await saveEntity('prompts', { content: text });
  });
  
  // 编辑/删除按钮
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      editEntity(state.currentEntity, id);
    });
  });
  
  document.querySelectorAll('.btn-danger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      deleteEntity(state.currentEntity, id);
    });
  });
}

function renderTabContent() {
  // 根据当前 Tab 渲染不同内容
  // 目前先用 entity-content 渲染实体列表
  renderEntityContent();
}

// ============ Books API ============
// 根据 action 调用不同 API
async function booksApi(action, data = {}) {
  try {
    let endpoint = '/api/books';
    let body = { action, ...data };
    
    // 根据 action 确定 endpoint
    if (action.startsWith('save_role')) {
      endpoint = '/api/roles';
      body = { action: 'create', bookId: data.bookId, title: data.title, description: data.description };
    } else if (action.startsWith('save_item')) {
      endpoint = '/api/items';
      body = { action: 'create', bookId: data.bookId, title: data.title, description: data.description };
    } else if (action.startsWith('save_location')) {
      endpoint = '/api/locations';
      body = { action: 'create', bookId: data.bookId, title: data.title, description: data.description };
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

async function saveEntity(type, data) {
  const result = await booksApi('save_' + type, {
    bookId: state.currentBook.id,
    ...data
  });
  if (result.success) {
    state[type] = data.content;
    alert('保存成功');
  } else {
    alert('保存失败');
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
    renderApp();
  }
}

async function deleteBook(id) {
  if (!confirm('确定删除？')) return;
  const result = await booksApi('delete', { id });
  if (result.success) loadBooks();
}

function importBook() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.soul,.json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const book = JSON.parse(text);
      if (!book.title) { alert('文件格式错误'); return; }
      const result = await booksApi('create', { title: book.title, author: book.author || '', description: book.description || '' });
      if (result.success) { alert('导入成功'); loadBooks(); }
    } catch (err) { alert('读取失败: ' + err.message); }
  };
  input.click();
}

function showCreateBookModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${t('book.create')}</h3>
        <button class="modal-close">&#xD7;</button>
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
        <div class="form-group">
          <label>简介</label>
          <textarea name="description" class="input" rows="3" placeholder="简要描述..."></textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="modal-cancel">取消</button>
          <button type="submit" class="btn btn-primary">创建</button>
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
    const description = e.target.description.value.trim();
    if (!title) { alert('请输入书名'); return; }
    const result = await booksApi('create', { title, author, description });
    modal.remove();
    if (result.success && result.data) {
      state.currentBook = result.data;
      state.currentView = 'book';
      renderApp();
    }
  });
  setTimeout(() => modal.querySelector('input[name="title"]')?.focus(), 100);
}

function showCreateEntityModal(type) {
  const titles = { roles: '创建角色', items: '创建物品', locations: '创建地点', nodes: '创建节点', units: '创建单元' };
  const placeholders = {
    roles: { name: '角色名称', desc: '描述角色...' },
    items: { name: '物品名称', desc: '描述物品...' },
    locations: { name: '地点名称', desc: '描述地点...' },
    nodes: { name: '节点标题', desc: '节点内容...' },
    units: { name: '单元标题', desc: '单元内容...' }
  };
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${titles[type] || '创建'}</h3>
        <button class="modal-close">&#xD7;</button>
      </div>
      <form class="modal-body" id="entity-form">
        <div class="form-group">
          <label>名称</label>
          <input type="text" name="title" class="input" required placeholder="${placeholders[type]?.name || '名称'}">
        </div>
        <div class="form-group">
          <label>描述</label>
          <textarea name="description" class="input" rows="3" placeholder="${placeholders[type]?.desc || '描述...'}"></textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="modal-cancel">取消</button>
          <button type="submit" class="btn btn-primary">创建</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('#modal-cancel').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.querySelector('#entity-form').addEventListener('submit', async (e) => {
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

function editEntity(type, id) {
  alert('编辑功能开发中...');
}

function deleteEntity(type, id) {
  if (!confirm('确定删除？')) return;
  alert('删除功能开发中...');
}

// ============ 初始化 ============
function init() {
  logger?.info('APP_INIT', 'SoulWriter ready');
  renderApp();
}

document.addEventListener('DOMContentLoaded', init);
