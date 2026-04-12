/**
 * SoulWriter - 灵魂创作者
 * 重新设计的内页 UI
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

// Books API
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
    book: { create: '创建新书', noBooks: '书架空空如也，创建第一本书吧' },
    common: { bookshelf: '书架', back: '返回', loading: '加载中...' },
    actions: { create: '创建', edit: '编辑', delete: '删除', save: '保存' },
    empty: { roles: '暂无角色', items: '暂无物品', locations: '暂无地点', chapters: '暂无章节' },
    placeholder: { roleName: '输入角色名称', roleDesc: '描述角色的外貌、性格...', itemName: '输入物品名称', itemDesc: '描述物品的外观、用途...', locationName: '输入地点名称', locationDesc: '描述这个地点...', chapterName: '输入章节标题' }
  },
  'en-US': {
    app: { name: 'SoulWriter', subtitle: 'Soul Creator · Content Shaper' },
    nav: { roles: 'Roles', items: 'Items', locations: 'Locations', chapters: 'Chapters', writing: 'Writing', genesis: 'Genesis' },
    book: { create: 'Create Book', noBooks: 'Your bookshelf is empty. Create your first book!' },
    common: { bookshelf: 'Bookshelf', back: 'Back', loading: 'Loading...' },
    actions: { create: 'Create', edit: 'Edit', delete: 'Delete', save: 'Save' },
    empty: { roles: 'No roles yet', items: 'No items yet', locations: 'No locations yet', chapters: 'No chapters yet' },
    placeholder: { roleName: 'Enter role name', roleDesc: "Describe the role's appearance, personality...", itemName: 'Enter item name', itemDesc: 'Describe the item...', locationName: 'Enter location name', locationDesc: 'Describe this location...', chapterName: 'Enter chapter title' }
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

// 渲染
function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;
  applyTheme(getTheme());
  if (!state.currentBook) {
    app.innerHTML = renderWelcome();
    bindWelcomeEvents();
  } else {
    app.innerHTML = renderMainLayout();
    bindMainEvents();
    loadCurrentBookData();
  }
}

// ============ 欢迎页 ============
function renderWelcome() {
  return '<div class="welcome-page"><header class="welcome-header"><div class="logo-area"><h1 class="app-logo">SoulWriter</h1><p class="app-slogan">' + t('app.subtitle') + '</p></div><div class="header-actions"><button class="theme-toggle" id="theme-btn">&#x1F319;</button><select class="lang-select" id="lang-select"><option value="zh-CN">中文</option><option value="en-US">English</option></select></div></header><section class="bookshelf-section"><h2 class="section-title">&#x1F4DA; ' + t('common.bookshelf') + '</h2><div class="bookshelf" id="books-list"><div class="loading-text">' + t('common.loading') + '</div></div></section><div class="create-book-area"><button class="btn-create-book" id="create-book-btn"><span class="btn-icon">+</span><span class="btn-text">' + t('book.create') + '</span></button><button class="btn-create-book" id="import-book-btn"><span class="btn-icon">&#x1F4E5;</span><span class="btn-text">&#x5BFC;&#x5165;</span></button></div></div>';
}

// ============ 主布局 ============
function renderMainLayout() {
  return '<div class="main-layout"><aside class="sidebar"><div class="sidebar-header"><h2 class="book-title">' + escapeHtml(state.currentBook?.title || '') + '</h2><button class="btn btn-sm" id="back-to-books">&#x2190; ' + t('common.back') + '</button></div><nav class="sidebar-nav"><div class="nav-item" data-view="roles">&#x1F46D; ' + t('nav.roles') + '</div><div class="nav-item" data-view="items">&#x1F381; ' + t('nav.items') + '</div><div class="nav-item" data-view="locations">&#x1F4CD; ' + t('nav.locations') + '</div><div class="nav-item" data-view="chapters">&#x1F4D6; ' + t('nav.chapters') + '</div><div class="nav-item" data-view="writing">&#x270F; ' + t('nav.writing') + '</div><div class="nav-item" data-view="genesis">&#x1F333; ' + t('nav.genesis') + '</div></nav></aside><main class="main-content" id="main-content"><div class="content-page" id="content-page"></div></main></div>';
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ============ 内容区渲染 ============
function renderContentPage(view) {
  const page = document.getElementById('content-page');
  if (!page) return;
  
  const titles = {
    roles: { icon: '&#x1F46D;', title: t('nav.roles') },
    items: { icon: '&#x1F381;', title: t('nav.items') },
    locations: { icon: '&#x1F4CD;', title: t('nav.locations') },
    chapters: { icon: '&#x1F4D6;', title: t('nav.chapters') },
    writing: { icon: '&#x270F;', title: t('nav.writing') },
    genesis: { icon: '&#x1F333;', title: t('nav.genesis') }
  };
  
  const config = titles[view] || titles.roles;
  const data = state[view] || [];
  
  let content = '<div class="page-header"><h1 class="page-title"><span class="emoji">' + config.icon + '</span>' + config.title + '</h1><div class="page-actions"><button class="btn btn-primary" id="add-entity-btn">+ ' + t('actions.create') + '</button></div></div>';
  
  if (data.length === 0) {
    content += '<div class="empty-state"><div class="empty-icon">' + config.icon + '</div><p class="empty-text">' + t('empty.' + view) + '</p><button class="btn btn-primary" id="add-first-btn">+ ' + t('actions.create') + '</button></div>';
  } else {
    content += '<div class="entity-grid">';
    for (const item of data) {
      content += renderEntityCard(view, item);
    }
    content += '</div>';
  }
  
  page.innerHTML = content;
  
  // 绑定事件
  page.querySelector('#add-entity-btn')?.addEventListener('click', () => showCreateModal(view));
  page.querySelector('#add-first-btn')?.addEventListener('click', () => showCreateModal(view));
}

function renderEntityCard(view, item) {
  const icons = { roles: '&#x1F9D4;', items: '&#x1F3F7;', locations: '&#x1F3D7;', chapters: '&#x1F4D8;' };
  const icon = icons[view] || '&#x2753;';
  const title = item.title || item.name || '未命名';
  const desc = item.description || item.desc || item.bio || '';
  const meta = item.wordCount ? item.wordCount + ' 字' : (item.created ? formatDate(item.created) : '');
  
  return '<div class="entity-card" data-id="' + item.id + '"><div class="card-icon">' + icon + '</div><div class="card-title">' + escapeHtml(title) + '</div><div class="card-desc">' + escapeHtml(desc.substring(0, 80)) + (desc.length > 80 ? '...' : '') + '</div>' + (meta ? '<div class="card-meta">' + meta + '</div>' : '') + '</div>';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('zh-CN');
}

// ============ 加载书本数据 ============
async function loadCurrentBookData() {
  if (!state.currentBook?.id) return;
  
  // 加载各个实体的数据
  const result = await booksApi('get', { id: state.currentBook.id });
  if (result.success && result.data) {
    state.roles = result.data.roles || [];
    state.items = result.data.items || [];
    state.locations = result.data.locations || [];
    state.chapters = result.data.chapters || [];
  }
  
  // 默认显示角色页
  renderContentPage(state.currentView || 'roles');
}

// ============ 模态框 ============
function showCreateModal(view) {
  const titles = { roles: '创建角色', items: '创建物品', locations: '创建地点', chapters: '创建章节' };
  const placeholders = {
    roles: { name: t('placeholder.roleName'), desc: t('placeholder.roleDesc') },
    items: { name: t('placeholder.itemName'), desc: t('placeholder.itemDesc') },
    locations: { name: t('placeholder.locationName'), desc: t('placeholder.locationDesc') },
    chapters: { name: t('placeholder.chapterName'), desc: '' }
  };
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = '<div class="modal"><div class="modal-header"><h3>' + titles[view] + '</h3><button class="modal-close">&#xD7;</button></div><form class="modal-body" id="entity-form"><div class="form-group"><label>名称</label><input type="text" name="title" class="input" required placeholder="' + placeholders[view].name + '"></div>' + (placeholders[view].desc ? '<div class="form-group"><label>描述</label><textarea name="description" class="input" rows="3" placeholder="' + placeholders[view].desc + '"></textarea></div>' : '') + '<div class="modal-actions"><button type="button" class="btn btn-secondary" id="modal-cancel">' + t('common.back') + '</button><button type="submit" class="btn btn-primary">' + t('actions.create') + '</button></div></form></div>';
  
  document.body.appendChild(modal);
  
  modal.querySelector('#modal-cancel').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.querySelector('#entity-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = e.target.title.value.trim();
    const description = e.target.description?.value.trim() || '';
    
    if (!title) { alert('请输入名称'); return; }
    
    // 保存到后端
    const result = await booksApi('save_' + view.replace(/s$/, ''), {
      bookId: state.currentBook.id,
      title,
      description
    });
    
    modal.remove();
    
    if (result.success) {
      // 更新本地状态
      const newItem = { id: result.data?.id || Date.now(), title, description };
      if (view === 'roles') state.roles.push(newItem);
      else if (view === 'items') state.items.push(newItem);
      else if (view === 'locations') state.locations.push(newItem);
      else if (view === 'chapters') state.chapters.push(newItem);
      
      renderContentPage(view);
    } else {
      alert('创建失败');
    }
  });
  
  setTimeout(() => modal.querySelector('input[name="title"]')?.focus(), 100);
}

// ============ 事件绑定 ============
function bindWelcomeEvents() {
  document.getElementById('create-book-btn')?.addEventListener('click', showCreateBookModal);
  document.getElementById('import-book-btn')?.addEventListener('click', importBook);
  document.getElementById('lang-select')?.addEventListener('change', (e) => {
    localStorage.setItem('soulwriter-lang', e.target.value);
    renderApp();
  });
  document.getElementById('lang-select').value = getLang();
  document.getElementById('theme-btn')?.addEventListener('click', () => {
    const current = getTheme();
    setTheme(current === 'dark' ? 'soft' : 'dark');
  });
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
      document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
      el.classList.add('active');
      state.currentView = el.dataset.view;
      renderContentPage(state.currentView);
    });
  });
  
  // 默认选中当前视图
  const activeEl = document.querySelector('.nav-item[data-view="' + state.currentView + '"]');
  activeEl?.classList.add('active');
}

// ============ Books 数据 ============
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
    c.innerHTML = '<div class="empty-bookshelf"><p>' + t('book.noBooks') + '</p></div>';
    return;
  }
  c.innerHTML = state.books.map(book => '<div class="book-item" data-id="' + book.id + '"><div class="book-cover"><div class="book-spine"></div><div class="book-front"><span class="book-name">' + (book.title?.charAt(0) || '?') + '</span></div></div><div class="book-info"><h3 class="book-title">' + escapeHtml(book.title) + '</h3><p class="book-desc">' + escapeHtml(book.author || '未知作者') + ' · ' + (book.wordCount || 0) + '字</p><div class="book-actions"><button class="btn btn-sm btn-open" data-id="' + book.id + '">打开</button><button class="btn btn-sm btn-danger" data-id="' + book.id + '">删除</button></div></div></div>').join('');
  
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

// ============ 导入 ============
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
        alert('文件格式错误');
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

// ============ 创建书本 ============
function showCreateBookModal() {
  logger?.info('MODAL_OPEN', 'CreateBook');
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = '<div class="modal"><div class="modal-header"><h3>' + t('book.create') + '</h3><button class="modal-close">&#xD7;</button></div><form class="modal-body" id="book-form"><div class="form-group"><label>书名</label><input type="text" name="title" class="input" required placeholder="输入书名"></div><div class="form-group"><label>作者</label><input type="text" name="author" class="input" placeholder="作者名称"></div><div class="form-group"><label>简介</label><textarea name="description" class="input" rows="3" placeholder="简要描述..."></textarea></div><div class="modal-actions"><button type="button" class="btn btn-secondary" id="modal-cancel">取消</button><button type="submit" class="btn btn-primary">创建</button></div></form></div>';
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

// ============ 初始化 ============
function init() {
  logger?.info('APP_INIT', 'SoulWriter ready');
  renderApp();
}

document.addEventListener('DOMContentLoaded', init);
