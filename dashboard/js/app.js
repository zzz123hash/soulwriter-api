// SoulWriter - 抽屉式内页架构 v2
// 布局: 左侧导航(200px) + 主画布(flex) + 详情面板(320px)

const Icons = {
  roles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  items: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',
  locations: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  nodes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  units: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  world: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  prompts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  genesis: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><circle cx="12" cy="5" r="3"/></svg>',
  event: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  nvwa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a7 7 0 0 1 7 7"/><circle cx="12" cy="12" r="3"/></svg>',
  novel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  chevronLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
  chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
};

const state = {
  currentView: 'welcome', currentTab: 'genesis', currentEntity: 'roles',
  currentBook: null, books: [], leftDrawerOpen: true, selectedEntity: null,
  roles: [], items: [], locations: [], nodes: [], units: []
};


function renderToolbar() {
  const lang = getLang();
  const langOptions = ['zh-CN', 'en-US'].map(function(l) {
    return '<option value="' + l + '"' + (lang === l ? ' selected' : '') + '>' + (l === 'zh-CN' ? '中文' : 'English') + '</option>';
  }).join('');
  return '<div id="sw-toolbar">' +
    '<div class="toolbar-left">' +
      '<span class="toolbar-logo">SoulWriter</span>' +
    '</div>' +
    '<div class="toolbar-right">' +
      '<select class="toolbar-select" id="lang-select">' + langOptions + '</select>' +
      '<button class="toolbar-btn" id="theme-toggle" title="切换主题">' + icon('settings') + '</button>' +
    '</div>' +
  '</div>';
}

const i18n = {
  'zh-CN': {
    app: { name: 'SoulWriter', subtitle: '灵魂创作者' },
    tabs: { home: '首页', genesis: '创世树', event: '事件线', nvwa: '女娲', novel: '小说' },
    nav: { roles: '角色', items: '物品', locations: '地点', nodes: '节点', units: '单元', world: '世界观', settings: '设定', prompts: '提示词', map: '地图' },
    book: { create: '创建新书', noBooks: '书架空空' },
    common: { back: '返回', loading: '加载中...', save: '保存', cancel: '取消', delete: '删除', close: '关闭' }
  },
  'en-US': {
    app: { name: 'SoulWriter', subtitle: 'Soul Creator' },
    tabs: { home: 'Home', genesis: 'Genesis', event: 'Event', nvwa: 'Nvwa', novel: 'Novel' },
    nav: { roles: 'Roles', items: 'Items', locations: 'Locations', nodes: 'Nodes', units: 'Units', world: 'World', settings: 'Settings', prompts: 'Prompts', map: 'Map' },
    book: { create: 'Create Book', noBooks: 'Empty shelf' },
    common: { back: 'Back', loading: 'Loading...', save: 'Save', cancel: 'Cancel', delete: 'Delete', close: 'Close' }
  }
};

function getLang() { return localStorage.getItem('soulwriter-lang') || 'zh-CN'; }
function t(key) {
  const lang = getLang();
  const keys = key.split('.');
  let v = i18n[lang];
  for (const k of keys) { v = v && v[k]; if (!v) return key; }
  return v;
}
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function icon(name) { return Icons[name] || ''; }

function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;
  const toolbar = renderToolbar();
  if (!state.currentBook) {
    app.innerHTML = toolbar + renderWelcome();
    bindToolbarEvents();
    bindWelcomeEvents();
  } else {
    app.innerHTML = toolbar + renderBookView();
    bindToolbarEvents();
    bindBookEvents();
    loadBookData();
  }
}

function renderWelcome() {
  return `<div class="welcome-page">
    <div class="welcome-logo">
      <h1 class="app-logo">SoulWriter</h1>
      <p class="app-slogan">${t('app.subtitle')}</p>
    </div>
    <section class="bookshelf-section">
      <h2 class="section-title">书架</h2>
      <div class="bookshelf" id="books-list"><div class="loading-text">${t('common.loading')}</div></div>
    </section>
    <div class="create-book-area">
      <button class="btn-create-book" id="create-book-btn">
        <span class="btn-icon">${icon('plus')}</span>
        <span class="btn-text">${t('book.create')}</span>
      </button>
    </div>
  </div>`;
}

function renderBookView() {
  return `<div class="book-layout">
    <header class="book-header">
      <div class="book-tabs">
        <button class="book-tab ${state.currentTab === 'home' ? 'active' : ''}" data-tab="home">${icon('home')} ${t('tabs.home')}</button>
        <button class="book-tab ${state.currentTab === 'genesis' ? 'active' : ''}" data-tab="genesis">${icon('genesis')} ${t('tabs.genesis')}</button>
        <button class="book-tab ${state.currentTab === 'event' ? 'active' : ''}" data-tab="event">${icon('event')} ${t('tabs.event')}</button>
        <button class="book-tab ${state.currentTab === 'nvwa' ? 'active' : ''}" data-tab="nvwa">${icon('nvwa')} ${t('tabs.nvwa')}</button>
        <button class="book-tab ${state.currentTab === 'novel' ? 'active' : ''}" data-tab="novel">${icon('novel')} ${t('tabs.novel')}</button>
      </div>
      <div class="book-info">
        <span class="book-name">${escapeHtml(state.currentBook && state.currentBook.title || '')}</span>
        <button class="btn-back" id="back-to-books">${icon('chevronLeft')} ${t('common.back')}</button>
      </div>
    </header>
    <div class="book-body">
      ${renderLeftDrawer()}
      ${renderMainCanvas()}
      ${renderDetailPanel()}
    </div>
  </div>`;
}

function renderEntityListInDrawer() {
  const data = state[state.currentEntity] || [];
  if (data.length === 0) {
    return '<div class="empty-hint" style="padding:16px 12px;font-size:12px;text-align:center;color:var(--text2);">暂无数据</div>';
  }
  return data.map(function(item) {
    return '<div class="entity-list-item-sm" data-id="' + item.id + '">' +
      '<span style="width:16px;height:16px;display:inline-flex;align-items:center;">' + icon(state.currentEntity) + '</span>' +
      '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + escapeHtml(item.title || item.name || '未命名') + '</span></div>';
  }).join('');
}

function renderLeftDrawer() {
  const collapsed = !state.leftDrawerOpen ? 'collapsed' : '';
  const navItems = [
    { key: 'roles', icon: 'roles' }, { key: 'items', icon: 'items' },
    { key: 'locations', icon: 'locations' }, { key: 'nodes', icon: 'nodes' },
    { key: 'units', icon: 'units' }, { key: 'world', icon: 'world' },
    { key: 'settings', icon: 'settings' }, { key: 'prompts', icon: 'prompts' },
    { key: 'map', icon: 'map' }
  ];
  const listHtml = renderEntityListInDrawer();
  const entityCount = (state[state.currentEntity] || []).length;
  return `<aside class="left-drawer ${collapsed}" id="left-drawer">
    <div class="drawer-header">
      <span class="drawer-title">导航</span>
      <button class="drawer-toggle" id="toggle-left" title="切换导航">${icon('chevronLeft')}</button>
    </div>
    <nav class="entity-nav">
      ${navItems.map(item => `<div class="entity-nav-item ${state.currentEntity === item.key ? 'active' : ''}" data-entity="${item.key}" title="${t('nav.' + item.key)}">${icon(item.icon)}<span class="nav-label">${t('nav.' + item.key)}</span></div>`).join('')}
    </nav>
    <div class="entity-list-section" id="entity-list-section">
      <div class="entity-list-header" id="toggle-entity-list">${t('nav.' + state.currentEntity)} <span class="entity-count-badge" id="entity-count">${entityCount}</span></div>
      <div class="entity-list-wrap" id="entity-list-wrap">${listHtml}</div>
    </div>
  </aside>`;
}
function renderMainCanvas() {
  return `<main class="main-canvas" id="main-canvas">
    <div class="tab-canvas">${renderTabContent()}</div>
  </main>`;
}

function renderDetailPanel() {
  const hidden = !state.selectedEntity ? 'hidden' : '';
  return `<aside class="detail-panel ${hidden}" id="detail-panel">
    <div class="drawer-header">
      <span class="drawer-title">详情</span>
      <button class="drawer-toggle" id="close-detail" title="${t('common.close')}">${icon('close')}</button>
    </div>
    <div class="drawer-content" id="entity-detail-drawer">
      ${state.selectedEntity ? renderEntityDetail() : ''}
    </div>
  </aside>`;
}

function renderTabContent() {
  const tab = state.currentTab;
  if (tab === 'home') return renderHomeTab();
  if (tab === 'genesis') return renderGenesisTab();
  if (tab === 'event') return renderEventTab();
  if (tab === 'nvwa') return renderNvwaTab();
  if (tab === 'novel') return renderNovelTab();
  return renderHomeTab();
}

function renderHomeTab() {
  const stats = [
    { label: '角色', count: 0, icon: 'roles', color: '#e94560' },
    { label: '物品', count: 0, icon: 'items', color: '#0ea5e9' },
    { label: '地点', count: 0, icon: 'locations', color: '#22c55e' },
    { label: '节点', count: 0, icon: 'nodes', color: '#f59e0b' },
    { label: '单元', count: 0, icon: 'units', color: '#8b5cf6' },
  ];
  const dataMap = { roles: state.roles, items: state.items, locations: state.locations, nodes: state.nodes, units: state.units };
  stats.forEach(function(s) { s.count = (dataMap[s.label === '角色' ? 'roles' : s.label === '物品' ? 'items' : s.label === '地点' ? 'locations' : s.label === '节点' ? 'nodes' : 'units'] || []).length; });
  const statCards = stats.map(function(s) {
    return '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:20px;text-align:center;">' +
      '<div style="font-size:2em;font-weight:700;color:' + s.color + ';margin-bottom:8px;">' + s.count + '</div>' +
      '<div style="display:flex;align-items:center;justify-content:center;gap:6px;color:var(--text2);font-size:13px;">' + icon(s.icon) + ' ' + s.label + '</div></div>';
  }).join('');
  return '<div style="padding:24px;max-width:900px;margin:0 auto;">' +
    '<h2 style="font-size:1.4em;font-weight:700;margin-bottom:20px;display:flex;align-items:center;gap:10px;">' + icon('home') + ' 书架总览</h2>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:16px;margin-bottom:32px;">' + statCards + '</div>' +
    '<h3 style="font-size:1.1em;color:var(--text2);margin-bottom:12px;">最近编辑</h3>' +
    '<div style="color:var(--text2);font-size:13px;">在左侧选择实体类型开始编辑</div></div>';
}

function renderGenesisTab() {
  const nodes = state.nodes || [];
  if (nodes.length === 0) {
    return '<div style="padding:40px;text-align:center;color:var(--text2);"><div style="margin-bottom:12px;font-size:2em;">' + icon('genesis') + '</div><div>暂无节点，点击左侧「节点」添加</div></div>';
  }
  const treeItems = nodes.map(function(n) {
    var desc = n.description ? escapeHtml(n.description).substring(0, 30) + '...' : '';
    return '<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;margin-bottom:8px;cursor:pointer;" data-id="' + n.id + '">' +
      '<span style="color:var(--accent);">' + icon('nodes') + '</span>' +
      '<span style="flex:1;font-weight:500;">' + escapeHtml(n.title || n.name || '未命名') + '</span>' +
      '<span style="font-size:11px;color:var(--text2);">' + desc + '</span></div>';
  }).join('');
  return '<div style="padding:24px;max-width:800px;margin:0 auto;">' +
    '<h2 style="font-size:1.4em;font-weight:700;margin-bottom:20px;display:flex;align-items:center;gap:10px;">' + icon('genesis') + ' 创世树</h2>' +
    '<div>' + treeItems + '</div></div>';
}

function renderEventTab() {
  return '<div style="padding:40px;text-align:center;color:var(--text2);"><div style="margin-bottom:12px;font-size:2em;">' + icon('event') + '</div><div style="margin-bottom:8px;">事件线</div><div style="font-size:12px;">功能开发中...</div></div>';
}

function renderNvwaTab() {
  return '<div style="padding:40px;text-align:center;color:var(--text2);"><div style="margin-bottom:12px;font-size:2em;">' + icon('nvwa') + '</div><div style="margin-bottom:8px;">女娲编辑器</div><div style="font-size:12px;">功能开发中...</div></div>';
}

function renderNovelTab() {
  return '<div style="padding:40px;text-align:center;color:var(--text2);"><div style="margin-bottom:12px;font-size:2em;">' + icon('novel') + '</div><div style="margin-bottom:8px;">小说视图</div><div style="font-size:12px;">功能开发中...</div></div>';
}

function renderEntityDetail() {
  if (!state.selectedEntity) return '';
  const e = state.selectedEntity;
  return `<div class="entity-detail">
    <div class="detail-header">
      <div class="detail-icon">${icon(state.currentEntity)}</div>
      <div class="detail-title">${escapeHtml(e.title || e.name || '未命名')}</div>
    </div>
    <div class="detail-body">
      <div class="detail-field"><label>名称</label>
        <input type="text" class="detail-input" id="detail-title" value="${escapeHtml(e.title || e.name || '')}">
      </div>
      <div class="detail-field"><label>描述</label>
        <textarea class="detail-textarea" id="detail-desc" rows="5">${escapeHtml(e.description || '')}</textarea>
      </div>
    </div>
    <div class="detail-actions">
      <button class="btn-save-detail" id="save-entity-btn">${icon('save')} ${t('common.save')}</button>
      <button class="btn-delete-detail" id="delete-entity-btn">${icon('trash')} ${t('common.delete')}</button>
    </div>
  </div>`;
}

async function loadBookData() {
  if (!state.currentBook || !state.currentBook.id) return;
  const result = await booksApi('get', { id: state.currentBook.id });
  if (result.success && result.data) {
    state.roles = result.data.roles || [];
    state.items = result.data.items || [];
    state.locations = result.data.locations || [];
    state.nodes = result.data.nodes || [];
    state.units = result.data.units || [];
  }
}

function bindToolbarEvents() {
  const langSelect = document.getElementById('lang-select');
  if (langSelect) {
    langSelect.addEventListener('change', function() {
      localStorage.setItem('soulwriter-lang', this.value);
      renderApp();
    });
  }
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const isDark = document.body.getAttribute('data-theme') !== 'light';
      document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
      logger.applyTheme(isDark ? 'light' : 'dark');
    });
  }
}

function bindWelcomeEvents() {
  document.getElementById('create-book-btn') && document.getElementById('create-book-btn').addEventListener('click', showCreateBookModal);
  loadBooks();
}

function bindBookEvents() {
  // Bind entity list clicks
  bindEntityListInDrawer();

  document.getElementById('back-to-books') && document.getElementById('back-to-books').addEventListener('click', () => {
    state.currentBook = null; state.currentView = 'welcome'; state.selectedEntity = null; renderApp();
  });
  document.querySelectorAll('.book-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.book-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.currentTab = tab.dataset.tab;
      state.selectedEntity = null;
      renderApp();
    });
  });
  const toggleBtn = document.getElementById('toggle-left');
  if (toggleBtn) toggleBtn.addEventListener('click', () => {
    state.leftDrawerOpen = !state.leftDrawerOpen;
    const drawer = document.getElementById('left-drawer');
    if (drawer) drawer.classList.toggle('collapsed', !state.leftDrawerOpen);
    const btn = document.getElementById('toggle-left');
    if (btn) btn.innerHTML = state.leftDrawerOpen ? icon('chevronLeft') : icon('chevronRight');
  });
  document.querySelectorAll('.entity-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.entity-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      state.currentEntity = item.dataset.entity;
      state.selectedEntity = null;
      renderApp();
    });
  });
  const closeBtn = document.getElementById('close-detail');
  if (closeBtn) closeBtn.addEventListener('click', () => {
    state.selectedEntity = null;
    const panel = document.getElementById('detail-panel');
    if (panel) panel.classList.add('hidden');
  });
  const saveBtn = document.getElementById('save-entity-btn');
  if (saveBtn) saveBtn.addEventListener('click', saveEntityDetail);
  const delBtn = document.getElementById('delete-entity-btn');
  if (delBtn) delBtn.addEventListener('click', () => { if (confirm('确定删除？')) deleteCurrentEntity(); });
}

async function saveEntityDetail() {
  if (!state.selectedEntity) return;
  const title = (document.getElementById('detail-title') && document.getElementById('detail-title').value) || '';
  const description = (document.getElementById('detail-desc') && document.getElementById('detail-desc').value) || '';
  const result = await booksApi('update_' + state.currentEntity.replace(/s$/, ''), {
    bookId: state.currentBook.id, id: state.selectedEntity.id, title, description
  });
  if (result.success) { state.selectedEntity.title = title; state.selectedEntity.description = description; renderApp(); }
  else alert('保存失败');
}

async function deleteCurrentEntity() {
  if (!state.selectedEntity) return;
  const result = await booksApi('delete_' + state.currentEntity.replace(/s$/, ''), {
    bookId: state.currentBook.id, id: state.selectedEntity.id
  });
  if (result.success) { state.selectedEntity = null; loadBookData(); renderApp(); }
  else alert('删除失败');
}

async function booksApi(action, data) {
  data = data || {};
  try {
    const res = await fetch('/api/books', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: action, ...data })
    });
    return await res.json();
  } catch (e) { return { error: e.message }; }
}

async function loadBooks() {
  const result = await booksApi('list');
  state.books = (result.data && Array.isArray(result.data)) ? result.data : [];
  renderBooksList();
}

function renderBooksList() {
  const c = document.getElementById('books-list');
  if (!c) return;
  if (state.books.length === 0) { c.innerHTML = '<div class="empty-bookshelf"><p>' + t('book.noBooks') + '</p></div>'; return; }
  c.innerHTML = state.books.map(function(book) {
    return '<div class="book-item" data-id="' + book.id + '">' +
      '<div class="book-cover"><div class="book-spine"></div><div class="book-front"><span class="book-name">' + (book.title && book.title.charAt(0) || '?') + '</span></div></div>' +
      '<div class="book-info"><h3 class="book-title">' + escapeHtml(book.title) + '</h3>' +
      '<p class="book-desc">' + escapeHtml(book.author || '未知作者') + ' · ' + (book.wordCount || 0) + '字</p>' +
      '<div class="book-actions">' +
      '<button class="btn btn-sm btn-open" data-id="' + book.id + '">打开</button>' +
      '<button class="btn btn-sm btn-danger" data-id="' + book.id + '">' + t('common.delete') + '</button>' +
      '</div></div></div>';
  }).join('');
  c.querySelectorAll('.btn-open').forEach(function(btn) { btn.addEventListener('click', function(e) { e.stopPropagation(); openBook(btn.dataset.id); }); });
  c.querySelectorAll('.btn-danger').forEach(function(btn) { btn.addEventListener('click', function(e) { e.stopPropagation(); deleteBook(btn.dataset.id); }); });
}

async function openBook(id) {
  const result = await booksApi('get', { id: id });
  if (result.success && result.data) {
    state.currentBook = result.data; state.currentView = 'book'; state.currentTab = 'home';
    state.leftDrawerOpen = true; state.selectedEntity = null; renderApp();
  }
}

async function deleteBook(id) {
  if (!confirm('确定删除？')) return;
  const result = await booksApi('delete', { id: id });
  if (result.success) loadBooks();
}

function showCreateBookModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = '<div class="modal">' +
    '<div class="modal-header"><h3>' + t('book.create') + '</h3><button class="modal-close">' + icon('close') + '</button></div>' +
    '<form class="modal-body" id="book-form">' +
    '<div class="form-group"><label>书名</label><input type="text" name="title" class="input" required placeholder="输入书名"></div>' +
    '<div class="form-group"><label>作者</label><input type="text" name="author" class="input" placeholder="作者名称"></div>' +
    '<div class="modal-actions">' +
    '<button type="button" class="btn btn-secondary" id="modal-cancel">' + t('common.cancel') + '</button>' +
    '<button type="submit" class="btn btn-primary">' + t('common.save') + '</button>' +
    '</div></form></div>';
  document.body.appendChild(modal);
  modal.querySelector('#modal-cancel') && modal.querySelector('#modal-cancel').addEventListener('click', function() { modal.remove(); });
  modal.querySelector('.modal-close') && modal.querySelector('.modal-close').addEventListener('click', function() { modal.remove(); });
  modal.querySelector('#book-form') && modal.querySelector('#book-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var title = e.target.title && e.target.title.value && e.target.title.value.trim();
    var author = e.target.author && e.target.author.value && e.target.author.value.trim();
    if (!title) { alert('请输入书名'); return; }
    booksApi('create', { title: title, author: author }).then(function(result) {
      modal.remove();
      if (result.success && result.data) openBook(result.data.id);
    });
  });
}

function init() { renderApp(); }
document.addEventListener('DOMContentLoaded', init);

function bindEntityListInDrawer() {
  document.querySelectorAll('.entity-list-item-sm').forEach(function(item) {
    item.addEventListener('click', function() {
      var id = item.dataset.id;
      var data = state[state.currentEntity] || [];
      state.selectedEntity = data.find(function(e) { return e.id == id; });
      document.querySelectorAll('.entity-list-item-sm').forEach(function(i) { i.classList.remove('active'); });
      item.classList.add('active');
      renderApp();
    });
  });
  // Toggle entity list
  var toggleBtn = document.getElementById('toggle-entity-list');
  if (toggleBtn && !toggleBtn.dataset.bound) {
    toggleBtn.dataset.bound = '1';
    toggleBtn.addEventListener('click', function() {
      var wrap = document.getElementById('entity-list-wrap');
      if (wrap) wrap.style.display = wrap.style.display === 'none' ? 'block' : 'none';
    });
  }
}
