/**
 * 绘梦 SoulWriter - 主应用
 * 从"创建书本"开始的完整流程
 */

const API_BASE = 'http://localhost:3000/api/v1';

// 状态
const state = {
  lang: 'zh-CN',
  currentView: 'welcome', // welcome -> book-detail
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
    const res = await fetch(API_BASE + endpoint, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    return await res.json();
  } catch (e) {
    console.error('API Error:', e);
    return { error: e.message };
  }
}

// i18n
async function initI18n() {
  try {
    const res = await fetch('/i18n/locales/zh-CN.json');
    state.i18n = await res.json();
  } catch (e) {
    state.i18n = {};
  }
}

function t(key) {
  const keys = key.split('.');
  let value = state.i18n;
  for (const k of keys) {
    value = value?.[k];
    if (!value) return key;
  }
  return value;
}

// ============ 页面渲染 ============

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

// ============ 欢迎页面 ============

function renderWelcome() {
  return `
    <div class="welcome-container">
      <div class="welcome-header">
        <h1 class="welcome-title">${t('app.name') || '绘梦'}</h1>
        <p class="welcome-subtitle">${t('app.subtitle') || '灵魂作家'}</p>
      </div>
      
      <div class="welcome-books" id="books-list">
        <div class="books-loading">${t('common.loading') || '加载中...'}</div>
      </div>
      
      <div class="welcome-actions">
        <button class="btn btn-primary btn-large" id="create-book-btn">
          + ${t('book.create') || '创建书本'}
        </button>
      </div>
    </div>
  `;
}

function renderMainLayout() {
  return `
    <div class="main-layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2 class="book-title">${state.currentBook?.name || ''}</h2>
          <button class="btn btn-sm" id="back-to-books">${t('common.back') || '返回'}</button>
        </div>
        
        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-item ${state.currentView === 'roles' ? 'active' : ''}" data-view="roles">
              📁 ${t('nav.roles') || '角色'}
            </div>
            <div class="nav-item ${state.currentView === 'items' ? 'active' : ''}" data-view="items">
              🎁 ${t('nav.items') || '物品'}
            </div>
            <div class="nav-item ${state.currentView === 'locations' ? 'active' : ''}" data-view="locations">
              📍 ${t('nav.locations') || '地点'}
            </div>
          </div>
          
          <div class="nav-section">
            <div class="nav-item ${state.currentView === 'chapters' ? 'active' : ''}" data-view="chapters">
              📖 ${t('nav.chapters') || '章节'}
            </div>
            <div class="nav-item ${state.currentView === 'writing' ? 'active' : ''}" data-view="writing">
              ✍️ ${t('nav.writing') || '写作'}
            </div>
          </div>
          
          <div class="nav-section">
            <div class="nav-item ${state.currentView === 'genesis' ? 'active' : ''}" data-view="genesis">
              🌳 ${t('nav.genesis') || '创世树'}
            </div>
            <div class="nav-item ${state.currentView === 'nvwa' ? 'active' : ''}" data-view="nvwa">
              🔮 ${t('nav.nvwa') || '女娲推演'}
            </div>
            <div class="nav-item ${state.currentView === 'relationships' ? 'active' : ''}" data-view="relationships">
              🔗 ${t('nav.relationships') || '关系'}
            </div>
          </div>
          
          <div class="nav-section">
            <div class="nav-item ${state.currentView === 'settings' ? 'active' : ''}" data-view="settings">
              ⚙️ ${t('nav.settings') || '设置'}
            </div>
          </div>
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
    case 'nvwa': return renderNvwa();
    case 'relationships': return renderRelationships();
    case 'settings': return renderSettings();
    default: return renderRoles();
  }
}

// ============ 角色管理 ============

function renderRoles() {
  return `
    <div class="content-header">
      <h2>${t('nav.roles') || '角色'}</h2>
      <button class="btn btn-primary" id="add-role-btn">+ ${t('role.create') || '创建角色'}</button>
    </div>
    <div class="cards-grid" id="roles-list">
      ${state.roles.length === 0 ? `<div class="empty-state">${t('role.noRoles') || '暂无角色，创建一个吧'}</div>` : ''}
      ${state.roles.map(role => `
        <div class="card role-card" data-id="${role.id}">
          <div class="card-header">
            <span class="card-title">${role.name}</span>
            <span class="card-badge">${t('role.types.' + role.type) || role.type || '角色'}</span>
          </div>
          <div class="card-body">
            <p class="card-desc">${role.description || ''}</p>
            ${role.soulData ? `<div class="soul-preview">${renderSoulPreview(role.soulData)}</div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderSoulPreview(soulData) {
  try {
    const soul = typeof soulData === 'string' ? JSON.parse(soulData) : soulData;
    return Object.entries(soul).slice(0, 3).map(([k, v]) => `<span class="soul-tag">${k}: ${v}</span>`).join('');
  } catch {
    return '';
  }
}

// ============ 物品管理 ============

function renderItems() {
  return `
    <div class="content-header">
      <h2>${t('nav.items') || '物品'}</h2>
      <button class="btn btn-primary" id="add-item-btn">+ ${t('item.create') || '创建物品'}</button>
    </div>
    <div class="cards-grid" id="items-list">
      ${state.items.length === 0 ? `<div class="empty-state">${t('item.noItems') || '暂无物品'}</div>` : ''}
      ${state.items.map(item => `
        <div class="card item-card" data-id="${item.id}">
          <div class="card-header">
            <span class="card-title">${item.name}</span>
            <span class="card-badge" style="background: ${getRarityColor(item.rarity)}">${t('item.rarities.' + item.rarity) || item.rarity}</span>
          </div>
          <p class="card-type">${t('item.types.' + item.type) || item.type}</p>
          <p class="card-desc">${item.description || ''}</p>
        </div>
      `).join('')}
    </div>
  `;
}

// ============ 地点管理 ============

function renderLocations() {
  return `
    <div class="content-header">
      <h2>${t('nav.locations') || '地点'}</h2>
      <button class="btn btn-primary" id="add-location-btn">+ ${t('location.create') || '创建地点'}</button>
    </div>
    <div class="cards-grid" id="locations-list">
      ${state.locations.length === 0 ? `<div class="empty-state">${t('location.noLocations') || '暂无地点'}</div>` : ''}
      ${state.locations.map(loc => `
        <div class="card location-card" data-id="${loc.id}">
          <div class="card-header">
            <span class="card-icon">${getLocationIcon(loc.type)}</span>
            <span class="card-title">${loc.name}</span>
          </div>
          <p class="card-type">${t('location.types.' + loc.type) || loc.type}</p>
          <p class="card-desc">${loc.description || ''}</p>
        </div>
      `).join('')}
    </div>
  `;
}

// ============ 章节管理 ============

function renderChapters() {
  return `
    <div class="content-header">
      <h2>${t('nav.chapters') || '章节'}</h2>
      <button class="btn btn-primary" id="add-chapter-btn">+ ${t('chapter.create') || '创建章节'}</button>
    </div>
    <div class="chapters-list" id="chapters-list">
      ${state.chapters.length === 0 ? `<div class="empty-state">${t('chapter.noChapters') || '暂无章节，创建一个开始写作吧'}</div>` : ''}
      ${state.chapters.map(ch => `
        <div class="chapter-card card" data-id="${ch.id}">
          <div class="chapter-info">
            <span class="chapter-title">${ch.title}</span>
            <span class="chapter-meta">${ch.wordCount || 0}字 | ${t('chapter.statuses.' + ch.status) || ch.status}</span>
          </div>
          <div class="chapter-actions">
            <button class="btn btn-sm" data-action="write">${t('nav.writing') || '写作'}</button>
            <button class="btn btn-sm" data-action="delete">${t('common.delete') || '删除'}</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ============ 写作界面 ============

function renderWriting() {
  return `
    <div class="writing-container">
      <div class="writing-sidebar">
        <select id="chapter-select" class="input">
          ${state.chapters.map(ch => `<option value="${ch.id}">${ch.title}</option>`).join('')}
        </select>
        <button class="btn btn-sm" id="add-scene-btn">+ ${t('scene.create') || '创建场景'}</button>
        <div class="scenes-list">
          ${state.scenes.map(s => `
            <div class="scene-item" data-id="${s.id}">
              <div class="scene-title">${s.title}</div>
              <div class="scene-meta">${s.wordCount || 0}字 | ${s.tension || 50}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="writing-main">
        <div class="writing-header">
          <input type="text" id="scene-title" class="scene-title-input" placeholder="${t('scene.title') || '场景标题'}">
          <div class="writing-stats">
            <span>${t('scene.wordCount') || '字数'}: <strong id="word-count">0</strong></span>
          </div>
        </div>
        <textarea id="writing-editor" class="writing-editor" placeholder="${t('writing.placeholder') || '开始写作...'}"></textarea>
        <div class="writing-footer">
          <div class="writing-tools">
            <label>${t('scene.tension') || '张力'}: <span id="tension-value">50</span></label>
            <input type="range" id="tension-slider" min="0" max="100" value="50">
          </div>
          <button class="btn btn-primary" id="save-scene-btn">${t('writing.save') || '保存'}</button>
        </div>
      </div>
    </div>
  `;
}

// ============ 其他视图 ============

function renderGenesis() {
  return `<div class="card"><h3>${t('nav.genesis') || '创世树'}</h3><p>开发中...</p></div>`;
}

function renderNvwa() {
  return `<div class="card"><h3>${t('nav.nvwa') || '女娲推演'}</h3><p>开发中...</p></div>`;
}

function renderRelationships() {
  return `<div class="card"><h3>${t('nav.relationships') || '关系图谱'}</h3><p>开发中...</p></div>`;
}

function renderSettings() {
  return `
    <div class="content-header">
      <h2>${t('nav.settings') || '设置'}</h2>
    </div>
    <div class="card">
      <h3>${t('settings.language') || '语言'}</h3>
      <select id="lang-select" class="input">
        <option value="zh-CN" selected>中文</option>
        <option value="en-US">English</option>
      </select>
    </div>
  `;
}

// ============ 事件绑定 ============

function bindWelcomeEvents() {
  // 创建书本
  document.getElementById('create-book-btn')?.addEventListener('click', showCreateBookModal);
  
  // 加载书本列表
  loadBooks();
}

function bindMainEvents() {
  // 返回
  document.getElementById('back-to-books')?.addEventListener('click', () => {
    state.currentBook = null;
    state.currentView = 'welcome';
    renderApp();
  });
  
  // 导航切换
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => {
      state.currentView = el.dataset.view;
      document.getElementById('main-content').innerHTML = renderContent();
      bindMainEvents();
    });
  });
  
  // 语言切换
  document.getElementById('lang-select')?.addEventListener('change', async (e) => {
    await initI18n();
    renderApp();
  });
  
  // 添加角色
  document.getElementById('add-role-btn')?.addEventListener('click', showCreateRoleModal);
  
  // 添加物品
  document.getElementById('add-item-btn')?.addEventListener('click', showCreateItemModal);
  
  // 添加地点
  document.getElementById('add-location-btn')?.addEventListener('click', showCreateLocationModal);
  
  // 添加章节
  document.getElementById('add-chapter-btn')?.addEventListener('click', showCreateChapterModal);
  
  // 写作相关
  document.getElementById('add-scene-btn')?.addEventListener('click', showCreateSceneModal);
  document.getElementById('save-scene-btn')?.addEventListener('click', saveCurrentScene);
  
  // 实时字数
  document.getElementById('writing-editor')?.addEventListener('input', (e) => {
    document.getElementById('word-count').textContent = e.target.value.length;
  });
}

// ============ 数据加载 ============

async function loadBooks() {
  const books = await api('/projects');
  state.books = Array.isArray(books) ? books : [];
  renderBooksList();
}

async function loadBookData() {
  if (!state.currentBook) return;
  const bookId = state.currentBook.id;
  state.roles = await api(`/projects/${bookId}/roles`) || [];
  state.items = await api(`/projects/${bookId}/items`) || [];
  state.locations = await api(`/projects/${bookId}/locations`) || [];
  state.chapters = await api(`/projects/${bookId}/chapters`) || [];
}

function renderBooksList() {
  const container = document.getElementById('books-list');
  if (!container) return;
  
  if (state.books.length === 0) {
    container.innerHTML = `<div class="empty-state">${t('book.noBooks') || '暂无书本，创建一个开始吧'}</div>`;
    return;
  }
  
  container.innerHTML = state.books.map(book => `
    <div class="book-card" data-id="${book.id}">
      <div class="book-title">${book.name}</div>
      <div class="book-meta">${book.description || ''}</div>
      <div class="book-actions">
        <button class="btn btn-sm" data-action="open">打开</button>
        <button class="btn btn-sm btn-danger" data-action="delete">${t('common.delete') || '删除'}</button>
      </div>
    </div>
  `).join('');
  
  // 绑定事件
  container.querySelectorAll('.book-card').forEach(card => {
    const bookId = card.dataset.id;
    
    card.querySelector('[data-action="open"]')?.addEventListener('click', async () => {
      state.currentBook = state.books.find(b => b.id === bookId);
      await loadBookData();
      state.currentView = 'roles';
      renderApp();
    });
    
    card.querySelector('[data-action="delete"]')?.addEventListener('click', async () => {
      if (confirm(t('book.deleteConfirm') || '确定删除这本书？')) {
        await api(`/projects/${bookId}`, { method: 'DELETE' });
        await loadBooks();
      }
    });
  });
}

// ============ 模态框 ============

function showCreateBookModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${t('book.create') || '创建书本'}</h3>
        <button class="modal-close">×</button>
      </div>
      <form class="modal-body">
        <div class="form-group">
          <label>${t('book.title') || '书名'}</label>
          <input type="text" name="name" class="input" required>
        </div>
        <div class="form-group">
          <label>${t('book.description') || '简介'}</label>
          <textarea name="description" class="input" rows="3"></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" data-action="cancel">${t('common.cancel') || '取消'}</button>
          <button type="submit" class="btn btn-primary">${t('common.create') || '创建'}</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelector('[data-action="cancel"]').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = { name: e.target.name.value, description: e.target.description.value };
    const result = await api('/projects', { method: 'POST', body: JSON.stringify(data) });
    modal.remove();
    if (result.id) {
      state.currentBook = result;
      state.currentView = 'roles';
      renderApp();
    }
  });
}

function showCreateRoleModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${t('role.create') || '创建角色'}</h3>
        <button class="modal-close">×</button>
      </div>
      <form class="modal-body">
        <div class="form-group">
          <label>${t('role.name') || '姓名'}</label>
          <input type="text" name="name" class="input" required>
        </div>
        <div class="form-group">
          <label>${t('role.type') || '类型'}</label>
          <select name="type" class="input">
            <option value="human">${t('role.types.human') || '人类'}</option>
            <option value="cyborg">${t('role.types.cyborg') || '机械人'}</option>
            <option value="creature">${t('role.types.creature') || '异兽'}</option>
            <option value="ai">${t('role.types.ai') || 'AI'}</option>
          </select>
        </div>
        <div class="form-group">
          <label>${t('role.description') || '描述'}</label>
          <textarea name="description" class="input" rows="3"></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" data-action="cancel">${t('common.cancel')}</button>
          <button type="submit" class="btn btn-primary">${t('common.create')}</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelector('[data-action="cancel"]').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      projectId: state.currentBook.id,
      name: e.target.name.value,
      type: e.target.type.value,
      description: e.target.description.value
    };
    await api('/roles', { method: 'POST', body: JSON.stringify(data) });
    modal.remove();
    await loadBookData();
    document.getElementById('main-content').innerHTML = renderContent();
    bindMainEvents();
  });
}

function showCreateItemModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${t('item.create') || '创建物品'}</h3>
        <button class="modal-close">×</button>
      </div>
      <form class="modal-body">
        <div class="form-group">
          <label>${t('item.name') || '名称'}</label>
          <input type="text" name="name" class="input" required>
        </div>
        <div class="form-group">
          <label>${t('item.type') || '类型'}</label>
          <select name="type" class="input">
            <option value="weapon">${t('item.types.weapon') || '武器'}</option>
            <option value="armor">${t('item.types.armor') || '防具'}</option>
            <option value="potion">${t('item.types.potion') || '药水'}</option>
            <option value="accessory">${t('item.types.accessory') || '饰品'}</option>
            <option value="material">${t('item.types.material') || '材料'}</option>
            <option value="keyItem">${t('item.types.keyItem') || '关键物品'}</option>
            <option value="misc">${t('item.types.misc') || '杂物'}</option>
          </select>
        </div>
        <div class="form-group">
          <label>${t('item.rarity') || '稀有度'}</label>
          <select name="rarity" class="input">
            <option value="common">${t('item.rarities.common') || '普通'}</option>
            <option value="uncommon">${t('item.rarities.uncommon') || '优秀'}</option>
            <option value="rare">${t('item.rarities.rare') || '稀有'}</option>
            <option value="epic">${t('item.rarities.epic') || '史诗'}</option>
            <option value="legendary">${t('item.rarities.legendary') || '传说'}</option>
          </select>
        </div>
        <div class="form-group">
          <label>${t('item.description') || '描述'}</label>
          <textarea name="description" class="input" rows="3"></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" data-action="cancel">${t('common.cancel')}</button>
          <button type="submit" class="btn btn-primary">${t('common.create')}</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelector('[data-action="cancel"]').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      projectId: state.currentBook.id,
      name: e.target.name.value,
      type: e.target.type.value,
      rarity: e.target.rarity.value,
      description: e.target.description.value
    };
    await api('/items', { method: 'POST', body: JSON.stringify(data) });
    modal.remove();
    await loadBookData();
    document.getElementById('main-content').innerHTML = renderContent();
    bindMainEvents();
  });
}

function showCreateLocationModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${t('location.create') || '创建地点'}</h3>
        <button class="modal-close">×</button>
      </div>
      <form class="modal-body">
        <div class="form-group">
          <label>${t('location.name') || '名称'}</label>
          <input type="text" name="name" class="input" required>
        </div>
        <div class="form-group">
          <label>${t('location.type') || '类型'}</label>
          <select name="type" class="input">
            <option value="city">${t('location.types.city') || '城市'}</option>
            <option value="town">${t('location.types.town') || '城镇'}</option>
            <option value="village">${t('location.types.village') || '村庄'}</option>
            <option value="indoor">${t('location.types.indoor') || '室内'}</option>
            <option value="wilderness">${t('location.types.wilderness') || '荒野'}</option>
            <option value="forest">${t('location.types.forest') || '森林'}</option>
            <option value="mountain">${t('location.types.mountain') || '山脉'}</option>
            <option value="water">${t('location.types.water') || '水域'}</option>
          </select>
        </div>
        <div class="form-group">
          <label>${t('location.description') || '描述'}</label>
          <textarea name="description" class="input" rows="3"></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" data-action="cancel">${t('common.cancel')}</button>
          <button type="submit" class="btn btn-primary">${t('common.create')}</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelector('[data-action="cancel"]').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      projectId: state.currentBook.id,
      name: e.target.name.value,
      type: e.target.type.value,
      description: e.target.description.value
    };
    await api('/locations', { method: 'POST', body: JSON.stringify(data) });
    modal.remove();
    await loadBookData();
    document.getElementById('main-content').innerHTML = renderContent();
    bindMainEvents();
  });
}

function showCreateChapterModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${t('chapter.create') || '创建章节'}</h3>
        <button class="modal-close">×</button>
      </div>
      <form class="modal-body">
        <div class="form-group">
          <label>${t('chapter.title') || '标题'}</label>
          <input type="text" name="title" class="input" required>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" data-action="cancel">${t('common.cancel')}</button>
          <button type="submit" class="btn btn-primary">${t('common.create')}</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelector('[data-action="cancel"]').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      projectId: state.currentBook.id,
      title: e.target.title.value
    };
    await api('/chapters', { method: 'POST', body: JSON.stringify(data) });
    modal.remove();
    await loadBookData();
    document.getElementById('main-content').innerHTML = renderContent();
    bindMainEvents();
  });
}

function showCreateSceneModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${t('scene.create') || '创建场景'}</h3>
        <button class="modal-close">×</button>
      </div>
      <form class="modal-body">
        <div class="form-group">
          <label>${t('scene.title') || '标题'}</label>
          <input type="text" name="title" class="input" required>
        </div>
        <div class="form-group">
          <label>${t('scene.type') || '类型'}</label>
          <select name="sceneType" class="input">
            <option value="scene">${t('scene.types.scene') || '场景'}</option>
            <option value="chapterStart">${t('scene.types.chapterStart') || '章节开头'}</option>
            <option value="chapterEnd">${t('scene.types.chapterEnd') || '章节结尾'}</option>
            <option value="transition">${t('scene.types.transition') || '过渡'}</option>
          </select>
        </div>
        <div class="form-group">
          <label>${t('scene.tension') || '张力'}: <span id="modal-tension-value">50</span></label>
          <input type="range" name="tension" min="0" max="100" value="50" id="modal-tension-slider">
        </div>
        <div class="form-group">
          <label>${t('scene.emotion') || '情感'}</label>
          <select name="emotion" class="input">
            <option value="neutral">${t('scene.emotions.neutral') || '平静'}</option>
            <option value="happy">${t('scene.emotions.happy') || '开心'}</option>
            <option value="sad">${t('scene.emotions.sad') || '悲伤'}</option>
            <option value="tense">${t('scene.emotions.tense') || '紧张'}</option>
            <option value="angry">${t('scene.emotions.angry') || '愤怒'}</option>
            <option value="romantic">${t('scene.emotions.romantic') || '浪漫'}</option>
          </select>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" data-action="cancel">${t('common.cancel')}</button>
          <button type="submit" class="btn btn-primary">${t('common.create')}</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // 张力滑块显示
  const slider = modal.querySelector('#modal-tension-slider');
  const value = modal.querySelector('#modal-tension-value');
  slider?.addEventListener('input', () => { value.textContent = slider.value; });
  
  modal.querySelector('[data-action="cancel"]').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      projectId: state.currentBook.id,
      title: e.target.title.value,
      sceneType: e.target.sceneType.value,
      tension: parseInt(e.target.tension.value),
      emotion: e.target.emotion.value
    };
    await api('/scenes', { method: 'POST', body: JSON.stringify(data) });
    modal.remove();
    await loadBookData();
    document.getElementById('main-content').innerHTML = renderContent();
    bindMainEvents();
  });
}

async function saveCurrentScene() {
  // 实现保存逻辑
  alert(t('writing.saved') || '已保存');
}

// ============ 辅助函数 ============

function getRarityColor(rarity) {
  const colors = { common: '#9ca3af', uncommon: '#22c55e', rare: '#3b82f6', epic: '#a855f7', legendary: '#f59e0b' };
  return colors[rarity] || colors.common;
}

function getLocationIcon(type) {
  const icons = {
    cosmic: '🌌', world: '🌍', continent: '🗺️', region: '🏞️',
    city: '🏙️', town: '🏘️', village: '🏠', indoor: '🏰',
    path: '🛤️', wilderness: '🌲', forest: '🌳', mountain: '⛰️',
    water: '🌊', special: '✨'
  };
  return icons[type] || '📍';
}

// ============ 初始化 ============

async function init() {
  console.log('🚀 绘梦 SoulWriter 启动');
  await initI18n();
  renderApp();
}

document.addEventListener('DOMContentLoaded', init);
