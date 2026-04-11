/**
 * SoulWriter - 灵魂创作者
 * 首页书架效果
 */

const API_BASE = 'http://localhost:3000/api/v1';

// 语言配置
const i18n = {
  'zh-CN': {
    app: { name: 'SoulWriter', subtitle: '灵魂创作者 · 内容塑魂师' },
    nav: { roles: '角色', items: '物品', locations: '地点', chapters: '章节', writing: '写作', genesis: '创世树', nvwa: '女娲推演', relationships: '关系图谱', settings: '设置' },
    book: { create: '创建新书', noBooks: '书架空空如也，创建第一本书吧', title: '书名', description: '简介', deleteConfirm: '确定删除这本书？' },
    role: { create: '创建角色', noRoles: '暂无角色', name: '姓名', type: '类型', description: '描述', types: { human: '人类', cyborg: '机械人', creature: '异兽', ai: 'AI' } },
    item: { create: '创建物品', noItems: '暂无物品', name: '名称', type: '类型', rarity: '稀有度', description: '描述', types: { weapon: '武器', armor: '防具', potion: '药水', accessory: '饰品', material: '材料', keyItem: '关键物品', misc: '杂物' }, rarities: { common: '普通', uncommon: '优秀', rare: '稀有', epic: '史诗', legendary: '传说' } },
    location: { create: '创建地点', noLocations: '暂无地点', name: '名称', type: '类型', description: '描述', types: { city: '城市', town: '城镇', village: '村庄', indoor: '室内', wilderness: '荒野', forest: '森林', mountain: '山脉', water: '水域' } },
    chapter: { create: '创建章节', noChapters: '暂无章节', title: '标题', statuses: { draft: '草稿', writing: '写作中', review: '审核中', published: '已发布' } },
    scene: { create: '创建场景', title: '场景标题', tension: '张力', emotion: '情感', wordCount: '字数', types: { scene: '场景', chapterStart: '章节开头', chapterEnd: '章节结尾', transition: '过渡' }, emotions: { neutral: '平静', happy: '开心', sad: '悲伤', tense: '紧张', angry: '愤怒', romantic: '浪漫' } },
    writing: { placeholder: '开始写作...', save: '保存', saved: '已保存' },
    common: { back: '返回', loading: '加载中...', create: '创建', cancel: '取消', delete: '删除', save: '保存', edit: '打开', bookshelf: '我的书架' }
  },
  'en-US': {
    app: { name: 'SoulWriter', subtitle: 'Soul Creator · Content Shaper' },
    nav: { roles: 'Roles', items: 'Items', locations: 'Locations', chapters: 'Chapters', writing: 'Writing', genesis: 'Genesis Tree', nvwa: 'Nvwa Engine', relationships: 'Relationships', settings: 'Settings' },
    book: { create: 'Create Book', noBooks: 'Your bookshelf is empty. Create your first book!', title: 'Title', description: 'Description', deleteConfirm: 'Delete this book?' },
    role: { create: 'Create Role', noRoles: 'No roles yet', name: 'Name', type: 'Type', description: 'Description', types: { human: 'Human', cyborg: 'Cyborg', creature: 'Creature', ai: 'AI' } },
    item: { create: 'Create Item', noItems: 'No items yet', name: 'Name', type: 'Type', rarity: 'Rarity', description: 'Description', types: { weapon: 'Weapon', armor: 'Armor', potion: 'Potion', accessory: 'Accessory', material: 'Material', keyItem: 'Key Item', misc: 'Misc' }, rarities: { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' } },
    location: { create: 'Create Location', noLocations: 'No locations yet', name: 'Name', type: 'Type', description: 'Description', types: { city: 'City', town: 'Town', village: 'Village', indoor: 'Indoor', wilderness: 'Wilderness', forest: 'Forest', mountain: 'Mountain', water: 'Water' } },
    chapter: { create: 'Create Chapter', noChapters: 'No chapters yet', title: 'Title', statuses: { draft: 'Draft', writing: 'Writing', review: 'Review', published: 'Published' } },
    scene: { create: 'Create Scene', title: 'Scene Title', tension: 'Tension', emotion: 'Emotion', wordCount: 'Words', types: { scene: 'Scene', chapterStart: 'Chapter Start', chapterEnd: 'Chapter End', transition: 'Transition' }, emotions: { neutral: 'Neutral', happy: 'Happy', sad: 'Sad', tense: 'Tense', angry: 'Angry', romantic: 'Romantic' } },
    writing: { placeholder: 'Start writing...', save: 'Save', saved: 'Saved' },
    common: { back: 'Back', loading: 'Loading...', create: 'Create', cancel: 'Cancel', delete: 'Delete', save: 'Save', edit: 'Open', bookshelf: 'My Bookshelf' }
  }
};

function getLang() { return localStorage.getItem('soulwriter-lang') || 'zh-CN'; }
function t(key) {
  const lang = getLang();
  const keys = key.split('.');
  let value = i18n[lang];
  for (const k of keys) { value = value?.[k]; if (!value) return key; }
  return value;
}

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

async function api(endpoint, options = {}) {
  try {
    const res = await fetch(API_BASE + endpoint, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    return await res.json();
  } catch (e) { return { error: e.message }; }
}

function renderApp() {
  const app = document.getElementById('app');
  if (!state.currentBook) {
    app.innerHTML = renderWelcome();
    bindWelcomeEvents();
  } else {
    app.innerHTML = renderMainLayout();
    bindMainEvents();
  }
  const langSelect = document.getElementById('lang-select');
  if (langSelect) langSelect.value = getLang();
}

// ============ 书架首页 ============

function renderWelcome() {
  return `
    <div class="welcome-page">
      <header class="welcome-header">
        <div class="logo-area">
          <h1 class="app-logo">SoulWriter</h1>
          <p class="app-slogan">${t('app.subtitle')}</p>
        </div>
        <div class="header-actions">
          <select id="lang-select" class="lang-select">
            <option value="zh-CN" selected>🇨🇳 中文</option>
            <option value="en-US">🇺🇸 English</option>
          </select>
        </div>
      </header>
      
      <section class="bookshelf-section">
        <h2 class="section-title">📚 ${t('common.bookshelf')}</h2>
        <div class="bookshelf" id="books-list">
          <div class="books-loading">${t('common.loading')}</div>
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
          <div class="nav-section">
            <div class="nav-item ${state.currentView === 'roles' ? 'active' : ''}" data-view="roles">📁 ${t('nav.roles')}</div>
            <div class="nav-item ${state.currentView === 'items' ? 'active' : ''}" data-view="items">🎁 ${t('nav.items')}</div>
            <div class="nav-item ${state.currentView === 'locations' ? 'active' : ''}" data-view="locations">📍 ${t('nav.locations')}</div>
          </div>
          <div class="nav-section">
            <div class="nav-item ${state.currentView === 'chapters' ? 'active' : ''}" data-view="chapters">📖 ${t('nav.chapters')}</div>
            <div class="nav-item ${state.currentView === 'writing' ? 'active' : ''}" data-view="writing">✍️ ${t('nav.writing')}</div>
          </div>
          <div class="nav-section">
            <div class="nav-item ${state.currentView === 'genesis' ? 'active' : ''}" data-view="genesis">🌳 ${t('nav.genesis')}</div>
            <div class="nav-item ${state.currentView === 'nvwa' ? 'active' : ''}" data-view="nvwa">🔮 ${t('nav.nvwa')}</div>
            <div class="nav-item ${state.currentView === 'relationships' ? 'active' : ''}" data-view="relationships">🔗 ${t('nav.relationships')}</div>
          </div>
          <div class="nav-section">
            <div class="nav-item ${state.currentView === 'settings' ? 'active' : ''}" data-view="settings">⚙️ ${t('nav.settings')}</div>
          </div>
        </nav>
      </aside>
      <main class="main-content" id="main-content">${renderContent()}</main>
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

// ============ 角色/物品/地点 ============

function renderRoles() {
  return `
    <div class="content-header">
      <h2 class="view-title">${t('nav.roles')}</h2>
      <button class="btn btn-primary" id="add-role-btn">+ ${t('role.create')}</button>
    </div>
    <div class="cards-grid">
      ${state.roles.length === 0 ? `<div class="empty-state">${t('role.noRoles')}</div>` : ''}
      ${state.roles.map(role => `
        <div class="entity-card" data-id="${role.id}">
          <div class="card-type-badge">${t('role.types.' + role.type)}</div>
          <h3 class="card-name">${role.name}</h3>
          <p class="card-desc">${role.description || ''}</p>
        </div>
      `).join('')}
    </div>
  `;
}

function renderItems() {
  return `
    <div class="content-header">
      <h2 class="view-title">${t('nav.items')}</h2>
      <button class="btn btn-primary" id="add-item-btn">+ ${t('item.create')}</button>
    </div>
    <div class="cards-grid">
      ${state.items.length === 0 ? `<div class="empty-state">${t('item.noItems')}</div>` : ''}
      ${state.items.map(item => `
        <div class="entity-card item-card" data-id="${item.id}">
          <div class="card-rarity" style="background:${getRarityColor(item.rarity)}">${t('item.rarities.' + item.rarity)}</div>
          <h3 class="card-name">${item.name}</h3>
          <p class="card-type">${t('item.types.' + item.type)}</p>
          <p class="card-desc">${item.description || ''}</p>
        </div>
      `).join('')}
    </div>
  `;
}

function renderLocations() {
  return `
    <div class="content-header">
      <h2 class="view-title">${t('nav.locations')}</h2>
      <button class="btn btn-primary" id="add-location-btn">+ ${t('location.create')}</button>
    </div>
    <div class="cards-grid">
      ${state.locations.length === 0 ? `<div class="empty-state">${t('location.noLocations')}</div>` : ''}
      ${state.locations.map(loc => `
        <div class="entity-card" data-id="${loc.id}">
          <div class="card-icon-lg">${getLocationIcon(loc.type)}</div>
          <h3 class="card-name">${loc.name}</h3>
          <p class="card-type">${t('location.types.' + loc.type)}</p>
          <p class="card-desc">${loc.description || ''}</p>
        </div>
      `).join('')}
    </div>
  `;
}

// ============ 章节 ============

function renderChapters() {
  return `
    <div class="content-header">
      <h2 class="view-title">${t('nav.chapters')}</h2>
      <button class="btn btn-primary" id="add-chapter-btn">+ ${t('chapter.create')}</button>
    </div>
    <div class="chapters-list">
      ${state.chapters.length === 0 ? `<div class="empty-state">${t('chapter.noChapters')}</div>` : ''}
      ${state.chapters.map(ch => `
        <div class="chapter-item" data-id="${ch.id}">
          <div class="chapter-info">
            <span class="chapter-title">${ch.title}</span>
            <span class="chapter-meta">${ch.wordCount || 0}字 · ${t('chapter.statuses.' + ch.status)}</span>
          </div>
          <div class="chapter-actions">
            <button class="btn btn-sm" data-action="write">✍️ ${t('nav.writing')}</button>
            <button class="btn btn-sm btn-danger" data-action="delete">🗑️</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ============ 写作 ============

function renderWriting() {
  return `
    <div class="writing-container">
      <div class="writing-sidebar">
        <select id="chapter-select" class="input">
          ${state.chapters.map(ch => `<option value="${ch.id}">${ch.title}</option>`).join('')}
        </select>
        <button class="btn btn-sm" id="add-scene-btn">+ ${t('scene.create')}</button>
        <div class="scenes-list" id="scenes-list">
          ${state.scenes.length === 0 ? `<div class="empty-state">${t('scene.create')}</div>` : ''}
          ${state.scenes.map(s => `
            <div class="scene-item" data-id="${s.id}">
              <div class="scene-title">${s.title}</div>
              <div class="scene-meta">${s.wordCount || 0}字</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="writing-main">
        <div class="writing-header">
          <input type="text" id="scene-title" class="scene-title-input" placeholder="${t('scene.title')}">
          <div class="writing-stats">
            <span>${t('scene.wordCount')}: <strong id="word-count">0</strong></span>
          </div>
        </div>
        <textarea id="writing-editor" class="writing-editor" placeholder="${t('writing.placeholder')}"></textarea>
        <div class="writing-footer">
          <div class="writing-tools">
            <label>${t('scene.tension')}: <span id="tension-value">50</span></label>
            <input type="range" id="tension-slider" min="0" max="100" value="50">
            <select id="emotion-select" class="input">
              <option value="neutral">${t('scene.emotions.neutral')}</option>
              <option value="happy">${t('scene.emotions.happy')}</option>
              <option value="sad">${t('scene.emotions.sad')}</option>
              <option value="tense">${t('scene.emotions.tense')}</option>
              <option value="angry">${t('scene.emotions.angry')}</option>
              <option value="romantic">${t('scene.emotions.romantic')}</option>
            </select>
          </div>
          <button class="btn btn-primary" id="save-scene-btn">${t('common.save')}</button>
        </div>
      </div>
    </div>
  `;
}

// ============ 其他视图 ============

function renderGenesis() { initGenesisTree(); return `<div class="genesis-container"><div class="genesis-header"><h2 class="view-title">🌳 创世树</h2><div class="genesis-actions"><button class="btn btn-primary" id="genesis-add-root">+ 核心</button><button class="btn" id="genesis-auto">🤖 AI生成</button></div></div><div class="genesis-layout"><div class="genesis-tree" id="genesis-tree"><div class="tree-loading">🌱 加载中...</div></div><div class="genesis-panel" id="genesis-panel"><div class="panel-empty"><div class="panel-icon">🌿</div><h3>创世树</h3><p>点击节点查看详情</p></div></div></div></div>`; bindGenesisEvents(); }
function renderNvwa() { return `<div class="placeholder-view"><h2>🔮 ${t('nav.nvwa')}</h2><p>开发中...</p></div>`; }
function renderRelationships() { return `<div class="placeholder-view"><h2>🔗 ${t('nav.relationships')}</h2><p>开发中...</p></div>`; }
function renderSettings() { return `<div class="placeholder-view"><h2>⚙️ ${t('nav.settings')}</h2><p>SoulWriter v1.0</p></div>`; }

// ============ 事件 ============

function bindWelcomeEvents() {
  document.getElementById('create-book-btn')?.addEventListener('click', showCreateBookModal);
  document.getElementById('lang-select')?.addEventListener('change', (e) => {
    localStorage.setItem('soulwriter-lang', e.target.value);
    window.location.reload();
  });
  loadBooks();
}

function bindMainEvents() {
  document.getElementById('back-to-books')?.addEventListener('click', () => {
    state.currentBook = null; state.currentView = 'welcome'; renderApp();
  });
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => {
      state.currentView = el.dataset.view;
      document.getElementById('main-content').innerHTML = renderContent();
      bindMainEvents();
    });
  });
  document.getElementById('add-role-btn')?.addEventListener('click', showCreateRoleModal);
  document.getElementById('add-item-btn')?.addEventListener('click', showCreateItemModal);
  document.getElementById('add-location-btn')?.addEventListener('click', showCreateLocationModal);
  document.getElementById('add-chapter-btn')?.addEventListener('click', showCreateChapterModal);
  document.getElementById('add-scene-btn')?.addEventListener('click', showCreateSceneModal);
  document.getElementById('save-scene-btn')?.addEventListener('click', () => alert(t('writing.saved')));
  document.getElementById('writing-editor')?.addEventListener('input', (e) => {
    document.getElementById('word-count').textContent = e.target.value.length;
  });
  document.getElementById('tension-slider')?.addEventListener('input', (e) => {
    document.getElementById('tension-value').textContent = e.target.value;
  });
}

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
    container.innerHTML = `<div class="empty-bookshelf">${t('book.noBooks')}</div>`;
    return;
  }
  container.innerHTML = state.books.map(book => `
    <div class="book-item" data-id="${book.id}">
      <div class="book-cover">
        <div class="book-spine"></div>
        <div class="book-front">
          <span class="book-name">${book.name}</span>
        </div>
      </div>
      <div class="book-info">
        <h3 class="book-title">${book.name}</h3>
        <p class="book-desc">${book.description || '...'}</p>
        <div class="book-actions">
          <button class="btn btn-sm" data-action="open">${t('common.edit')}</button>
          <button class="btn btn-sm btn-danger" data-action="delete">${t('common.delete')}</button>
        </div>
      </div>
    </div>
  `).join('');
  
  container.querySelectorAll('.book-item').forEach(card => {
    const bookId = card.dataset.id;
    card.querySelector('[data-action="open"]')?.addEventListener('click', async () => {
      state.currentBook = state.books.find(b => b.id === bookId);
      await loadBookData();
      state.currentView = 'roles';
      renderApp();
    });
    card.querySelector('[data-action="delete"]')?.addEventListener('click', async () => {
      if (confirm(t('book.deleteConfirm'))) {
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
      <div class="modal-header"><h3>${t('book.create')}</h3><button class="modal-close">×</button></div>
      <form class="modal-body">
        <div class="form-group"><label>${t('book.title')}</label><input type="text" name="name" class="input" required></div>
        <div class="form-group"><label>${t('book.description')}</label><textarea name="description" class="input" rows="3"></textarea></div>
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
    const result = await api('/projects', { method: 'POST', body: JSON.stringify({ name: e.target.name.value, description: e.target.description.value }) });
    modal.remove();
    if (result.id) { state.currentBook = result; state.currentView = 'roles'; renderApp(); }
  });
}

function showCreateRoleModal() {
  showModal(t('role.create'), `
    <div class="form-group"><label>${t('role.name')}</label><input type="text" name="name" class="input" required></div>
    <div class="form-group"><label>${t('role.type')}</label><select name="type" class="input"><option value="human">${t('role.types.human')}</option><option value="cyborg">${t('role.types.cyborg')}</option><option value="creature">${t('role.types.creature')}</option><option value="ai">${t('role.types.ai')}</option></select></div>
    <div class="form-group"><label>${t('role.description')}</label><textarea name="description" class="input" rows="3"></textarea></div>
  `, async (data) => {
    await api('/roles', { method: 'POST', body: JSON.stringify({ projectId: state.currentBook.id, ...data }) });
    await loadBookData();
    document.getElementById('main-content').innerHTML = renderContent();
    bindMainEvents();
  });
}

function showCreateItemModal() {
  showModal(t('item.create'), `
    <div class="form-group"><label>${t('item.name')}</label><input type="text" name="name" class="input" required></div>
    <div class="form-group"><label>${t('item.type')}</label><select name="type" class="input"><option value="weapon">${t('item.types.weapon')}</option><option value="armor">${t('item.types.armor')}</option><option value="potion">${t('item.types.potion')}</option><option value="accessory">${t('item.types.accessory')}</option><option value="material">${t('item.types.material')}</option><option value="keyItem">${t('item.types.keyItem')}</option><option value="misc">${t('item.types.misc')}</option></select></div>
    <div class="form-group"><label>${t('item.rarity')}</label><select name="rarity" class="input"><option value="common">${t('item.rarities.common')}</option><option value="uncommon">${t('item.rarities.uncommon')}</option><option value="rare">${t('item.rarities.rare')}</option><option value="epic">${t('item.rarities.epic')}</option><option value="legendary">${t('item.rarities.legendary')}</option></select></div>
    <div class="form-group"><label>${t('item.description')}</label><textarea name="description" class="input" rows="3"></textarea></div>
  `, async (data) => {
    await api('/items', { method: 'POST', body: JSON.stringify({ projectId: state.currentBook.id, ...data }) });
    await loadBookData();
    document.getElementById('main-content').innerHTML = renderContent();
    bindMainEvents();
  });
}

function showCreateLocationModal() {
  showModal(t('location.create'), `
    <div class="form-group"><label>${t('location.name')}</label><input type="text" name="name" class="input" required></div>
    <div class="form-group"><label>${t('location.type')}</label><select name="type" class="input"><option value="city">${t('location.types.city')}</option><option value="town">${t('location.types.town')}</option><option value="village">${t('location.types.village')}</option><option value="indoor">${t('location.types.indoor')}</option><option value="wilderness">${t('location.types.wilderness')}</option><option value="forest">${t('location.types.forest')}</option><option value="mountain">${t('location.types.mountain')}</option><option value="water">${t('location.types.water')}</option></select></div>
    <div class="form-group"><label>${t('location.description')}</label><textarea name="description" class="input" rows="3"></textarea></div>
  `, async (data) => {
    await api('/locations', { method: 'POST', body: JSON.stringify({ projectId: state.currentBook.id, ...data }) });
    await loadBookData();
    document.getElementById('main-content').innerHTML = renderContent();
    bindMainEvents();
  });
}

function showCreateChapterModal() {
  showModal(t('chapter.create'), `<div class="form-group"><label>${t('chapter.title')}</label><input type="text" name="title" class="input" required></div>`, async (data) => {
    await api('/chapters', { method: 'POST', body: JSON.stringify({ projectId: state.currentBook.id, ...data }) });
    await loadBookData();
    document.getElementById('main-content').innerHTML = renderContent();
    bindMainEvents();
  });
}

function showCreateSceneModal() {
  showModal(t('scene.create'), `
    <div class="form-group"><label>${t('scene.title')}</label><input type="text" name="title" class="input" required></div>
    <div class="form-group"><label>${t('scene.type')}</label><select name="sceneType" class="input"><option value="scene">${t('scene.types.scene')}</option><option value="chapterStart">${t('scene.types.chapterStart')}</option><option value="chapterEnd">${t('scene.types.chapterEnd')}</option><option value="transition">${t('scene.types.transition')}</option></select></div>
    <div class="form-group"><label>${t('scene.tension')}: <span id="modal-tension-value">50</span></label><input type="range" name="tension" min="0" max="100" value="50" id="modal-tension-slider"></div>
    <div class="form-group"><label>${t('scene.emotion')}</label><select name="emotion" class="input"><option value="neutral">${t('scene.emotions.neutral')}</option><option value="happy">${t('scene.emotions.happy')}</option><option value="sad">${t('scene.emotions.sad')}</option><option value="tense">${t('scene.emotions.tense')}</option><option value="angry">${t('scene.emotions.angry')}</option><option value="romantic">${t('scene.emotions.romantic')}</option></select></div>
  `, async (data) => {
    await api('/scenes', { method: 'POST', body: JSON.stringify({ projectId: state.currentBook.id, ...data }) });
    await loadBookData();
    document.getElementById('main-content').innerHTML = renderContent();
    bindMainEvents();
  });
}

function showModal(title, fieldsHtml, onSubmit) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `<div class="modal"><div class="modal-header"><h3>${title}</h3><button class="modal-close">×</button></div><form class="modal-body">${fieldsHtml}<div class="form-actions"><button type="button" class="btn" data-action="cancel">${t('common.cancel')}</button><button type="submit" class="btn btn-primary">${t('common.create')}</button></div></form></div>`;
  document.body.appendChild(modal);
  
  const slider = modal.querySelector('#modal-tension-slider');
  const tensionValue = modal.querySelector('#modal-tension-value');
  slider?.addEventListener('input', () => { tensionValue.textContent = slider.value; });
  
  modal.querySelector('[data-action="cancel"]').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    if (data.tension) data.tension = parseInt(data.tension);
    await onSubmit(data);
    modal.remove();
  });
}

// ============ 辅助 ============

function getRarityColor(rarity) {
  const colors = { common: '#6b7280', uncommon: '#22c55e', rare: '#3b82f6', epic: '#a855f7', legendary: '#f59e0b' };
  return colors[rarity] || colors.common;
}

function getLocationIcon(type) {
  const icons = { city: '🏙️', town: '🏘️', village: '🏠', indoor: '🏰', wilderness: '🌲', forest: '🌳', mountain: '⛰️', water: '🌊' };
  return icons[type] || '📍';
}

function init() { console.log('🚀 SoulWriter 启动'); renderApp(); }
document.addEventListener('DOMContentLoaded', init);
