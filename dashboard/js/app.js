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
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
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
  const themes = [
    { value: 'dark', label: '🌙 暗色' },
    { value: 'soft', label: '🌤️ 柔和' },
    { value: 'blue', label: '💙 蓝色' },
    { value: 'green', label: '🌿 绿色' }
  ];
  const currentTheme = document.body.getAttribute('data-theme') || 'dark';
  const themeOptions = themes.map(function(t) {
    return '<option value="' + t.value + '"' + (currentTheme === t.value ? ' selected' : '') + '>' + t.label + '</option>';
  }).join('');
  return '<div id="sw-toolbar">' +
    '<div class="toolbar-left">' +
      '<span class="toolbar-logo">SoulWriter</span>' +
    '</div>' +
    '<div class="toolbar-right">' +
      '<select class="toolbar-select" id="btn-theme">' + themeOptions + '</select>' +
      '<select class="toolbar-select" id="btn-lang">' + langOptions + '</select>' +
      '<button class="toolbar-btn" id="btn-log">📋</button>' +
      '<button class="toolbar-btn" id="btn-settings">⚙️</button>' +
      '<button class="toolbar-btn" id="upload-btn" title="上传分析">' + icon('upload') + '</button>' +
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



}

function renderNovelTab() {
  return '<div style="padding:40px;text-align:center;color:var(--text2);"><div style="margin-bottom:12px;font-size:2em;">' + icon('novel') + '</div><div style="margin-bottom:8px;">小说视图</div><div style="font-size:12px;">功能开发中...</div></div>';
}

function renderEntityDetail() {
  if (!state.selectedEntity) return '';
  const e = state.selectedEntity;
  return `<div class="entity-detail">
    <div class="detail-header">
      <div class="detail-icon">${icon(sta);
  }
  // Theme switch
  const themeSelect = document.getElementById('btn-theme');
  if (themeSelect) {
    themeSelect.addEventListener('change', function() {
      var theme = this.value;
      document.body.setAttribute('data-theme', theme);
      localStorage.setItem('soulwriter-theme', theme);
      if (typeof logger !== 'undefined' && logger.applyTheme) logger.applyTheme(theme);
    });
  }
  // Log button
  var logBtn = document.getElementById('btn-log');
  if (logBtn && !logBtn.dataset.bound) {
    logBtn.dataset.bound = '1';
    logBtn.addEventListener('click', function() { window.open('/dashboard/logs.html', '_blank'); });
  }
  // Docs button
  var settingsBtn = document.getElementById('btn-settings');
  if (docsBtn && !docsBtn.dataset.bound) {
    docsBtn.dataset.bound = '1';
    docsBtn.addEventListener('click', function() { location.href = '/dashboard/settings.html'; });
  }
}

function bindWelcomeEvents() {
  bindUploadModal();
  document.getElementById('create-book-btn') && document.getElementById('create-book-btn').addEventListener('click', showCreateBookModal);
  loadBooks();
}

function bindBookEvents() {
  bindUploadModal();
  // Bind entity nav clicks (角色/物品/地点 etc)
  document.querySelectorAll('.entity-nav-item').forEach(function(item) {
    item.addEventListener('click', function() {
      var entity = this.dataset.entity;
      state.currentEntity = entity;
      state.selectedEntity = null;
      document.querySelectorAll('.entity-nav-item').forEach(function(i) { i.classList.remove('active'); });
      this.classList.add('active');
      // Re-render left drawer and main canvas
      var leftDrawer = document.getElementById('left-drawer');
      var mainCanvas = document.getElementById('main-canvas');
      if (leftDrawer && mainCanvas) {
        leftDrawer.outerHTML = renderLeftDrawer();
        mainCanvas.querySelector('.tab-canvas').innerHTML = renderTabContent();
        bindEntityListInDrawer();
      } else {
        renderApp();
      }
    });
  });
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
      if (tab.dataset.tab === 'event') { renderApp(); loadEventTimeline(); }
      else if (tab.dataset.tab === 'nvwa') { state.nvwaSelectedChar = null; state.nvwaMemoryData = null; state.nvwaActiveLayer = 'buffer'; renderApp(); loadNvwaData(); }
      else renderApp();
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
// ============ Upload Modal ============
function renderUploadModal() {
  return '<div id="upload-modal" class="modal-overlay hidden">' +
    '<div class="modal-content">' +
      '<div class="modal-header">' +
        '<h3>上传分解</h3>' +
        '<button class="modal-close" id="upload-modal-close">' + icon('close') + '</button>' +
      '</div>' +
      '<div class="modal-body" id="upload-modal-body">' +
        '<div class="upload-drop-zone" id="upload-drop-zone">' +
          '<div class="upload-icon">' + icon('upload') + '</div>' +
          '<p>点击选择文件 或 拖拽文件到此处</p>' +
          '<p class="upload-hint">支持 TXT / MD / DOCX / EPUB</p>' +
          '<input type="file" id="upload-file-input" accept=".txt,.md,.docx,.epub" style="display:none">' +
        '</div>' +
        '<div id="upload-result" class="hidden"></div>' +
        '<div id="upload-loading" class="hidden">' +
          '<div class="spinner"></div>' +
          '<p>AI 分析中，请稍候...</p>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>';
}

async function handleFileUpload(file) {
  if (!state.currentBook) {
    alert('请先打开一本书');
    return;
  }
  var formData = new FormData();
  formData.append('file', file);
  document.getElementById('upload-loading').classList.remove('hidden');
  document.getElementById('upload-drop-zone').classList.add('hidden');
  try {
    var res = await fetch('/api/upload', { method: 'POST', body: formData });
    var result = await res.json();
    if (!result.success) throw new Error(result.message);
    var splitRes = await fetch('/api/split', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: result.data.content || String(result.data.totalLength), bookId: state.currentBook.id })
    });
    var split = await splitRes.json();
    document.getElementById('upload-loading').classList.add('hidden');
    if (!split.success) throw new Error(split.message);
    showUploadResult(split.data);
  } catch (e) {
    document.getElementById('upload-loading').classList.add('hidden');
    document.getElementById('upload-drop-zone').classList.remove('hidden');
    alert('Error: ' + e.message);
  }
}

function showUploadResult(data) {
  var saved = data._saved || {};
  var chars = data.characters || [];
  var items = data.items || [];
  var locs = data.locations || [];
  document.getElementById('upload-drop-zone').classList.add('hidden');
  document.getElementById('upload-result').classList.remove('hidden');
  var html = '<div class="split-summary"><h4>分析完成！</h4>';
  html += '<div class="split-stats">';
  html += '<div class="split-stat"><span>' + icon('roles') + '</span><b>' + saved.roles + '</b> 角色</div>';
  html += '<div class="split-stat"><span>' + icon('items') + '</span><b>' + saved.items + '</b> 物品</div>';
  html += '<div class="split-stat"><span>' + icon('locations') + '</span><b>' + saved.locations + '</b> 地点</div>';
  html += '</div>';
  if (chars.length) {
    html += '<details class="split-list"><summary>角色 (' + chars.length + ')</summary><ul>';
    chars.forEach(function(c) { html += '<li><b>' + c.name + '</b> - ' + (c.role || '') + '</li>'; });
    html += '</ul></details>';
  }
  if (items.length) {
    html += '<details class="split-list"><summary>物品 (' + items.length + ')</summary><ul>';
    items.forEach(function(i) { html += '<li><b>' + i.name + '</b> - ' + (i.description || '') + '</li>'; });
    html += '</ul></details>';
  }
  if (locs.length) {
    html += '<details class="split-list"><summary>地点 (' + locs.length + ')</summary><ul>';
    locs.forEach(function(l) { html += '<li><b>' + l.name + '</b> - ' + (l.description || '') + '</li>'; });
    html += '</ul></details>';
  }
  html += '<p class="split-note">以上实体已自动导入到当前书本</p></div>';
  document.getElementById('upload-result').innerHTML = html;
  if (state.currentBook) loadEntities(state.currentBook.id);
}

function bindUploadModal() {
  var uploadBtn = document.getElementById('upload-btn');

  if (uploadBtn && !uploadBtn.dataset.bound) {
    uploadBtn.dataset.bound = '1';
    uploadBtn.addEventListener('click', function() {
      var modal = document.getElementById('upload-modal');
      if (!modal) {
        document.body.insertAdjacentHTML('beforeend', renderUploadModal());
        bindUploadModal();
        modal = document.getElementById('upload-modal');
      }
      modal.classList.remove('hidden');
      resetUploadModal();
    });
  }

  var modal = document.getElementById('upload-modal');
  if (!modal) return;
  var dropZone = document.getElementById('upload-drop-zone');
  var fileInput = document.getElementById('upload-file-input');
  var closeBtn = document.getElementById('upload-modal-close');

  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      modal.classList.add('hidden');
    });
  }

  modal.addEventListener('click', function(e) {
    if (e.target === modal) modal.classList.add('hidden');
  });

  if (dropZone) {
    dropZone.addEventListener('click', function() { fileInput.click(); });
    dropZone.addEventListener('dragover', function(e) { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', function() { dropZone.classList.remove('drag-over'); });
    dropZone.addEventListener('drop', function(e) {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      var f = e.dataTransfer.files[0];
      if (f) handleFileUpload(f);
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', function(e) {
      var f = e.target.files[0];
      if (f) handleFileUpload(f);
    });
  }
}

function resetUploadModal() {
  var dz = document.getElementById('upload-drop-zone');
  var loading = document.getElementById('upload-loading');
  var result = document.getElementById('upload-result');
  if (dz) dz.classList.remove('hidden');
  if (loading) loading.classList.add('hidden');
  if (result) { result.classList.add('hidden'); result.innerHTML = ''; }
}
function renderEventTab() {
  return '<div class="event-tab-root" id="event-tab-root">' +
    '<div class="event-toolbar">' +
      '<div class="event-arcs" id="event-arcs-filter"></div>' +
      '<button class="event-add-btn" id="event-add-btn">' + icon('plus') + ' 新增事件</button>' +
    '</div>' +
    '<div class="event-timeline" id="event-timeline">' +
      '<div class="event-loading">加载中...</div>' +
    '</div>' +
  '</div>';
}

function renderEventTimeline(events, arcs) {
  if (!events || events.length === 0) {
    return '<div class="event-empty">' +
      '<div style="font-size:2em;margin-bottom:12px;">' + icon('event') + '</div>' +
      '<div style="margin-bottom:8px;">暂无事件</div>' +
      '<div style="font-size:12px;color:var(--text2);">点击右上角"新增事件"开始构建故事线</div>' +
    '</div>';
  }

  var arcNames = Object.keys(arcs);
  var currentArc = state.currentEventArc || 'all';

  // Arc filter tabs
  var arcTabsHtml = '<div class="event-arc-tabs">';
  arcTabsHtml += '<button class="event-arc-tab ' + (currentArc === 'all' ? 'active' : '') + '" data-arc="all">全部</button>';
  arcNames.forEach(function(arc) {
    arcTabsHtml += '<button class="event-arc-tab ' + (currentArc === arc ? 'active' : '') + '" data-arc="' + escapeHtml(arc) + '">' + escapeHtml(arc) + ' (' + arcs[arc].length + ')</button>';
  });
  arcTabsHtml += '</div>';

  // Timeline
  var filteredEvents = currentArc === 'all' ? events : (arcs[currentArc] || []);
  var timelineHtml = '<div class="event-list">';

  filteredEvents.forEach(function(ev) {
    var chars = [];
    try { chars = JSON.parse(ev.characters || '[]'); } catch(e) {}
    var locs = [];
    try { locs = JSON.parse(ev.locations || '[]'); } catch(e) {}

    var tensionClass = ev.tension >= 70 ? 'high' : (ev.tension >= 40 ? 'mid' : 'low');
    var statusBadge = ev.status === 'open' ? '<span class="event-status open">进行中</span>' : '<span class="event-status closed">已解决</span>';
    var keyBadge = ev.isKeyEvent ? '<span class="event-key">关键</span>' : '';

    timelineHtml += '<div class="event-card ' + (ev.isKeyEvent ? 'key' : '') + '" data-id="' + ev.id + '">' +
      '<div class="event-card-left">' +
        '<div class="event-tension-bar ' + tensionClass + '" style="height:' + ev.tension + '%;"></div>' +
      '</div>' +
      '<div class="event-card-body">' +
        '<div class="event-card-header">' +
          '<span class="event-chapter">' + escapeHtml(ev.chapter || '') + '</span>' +
          '<b class="event-title">' + escapeHtml(ev.title) + '</b>' +
          statusBadge + keyBadge +
        '</div>' +
        '<div class="event-card-meta">' +
          (chars.length ? '<span class="event-meta-item">' + icon('roles') + ' ' + chars.join(', ') + '</span>' : '') +
          (locs.length ? '<span class="event-meta-item">' + icon('locations') + ' ' + locs.join(', ') + '</span>' : '') +
          '<span class="event-meta-item tension-badge ' + tensionClass + '">张力 ' + ev.tension + '%</span>' +
        '</div>' +
        '<div class="event-result">' + escapeHtml(ev.result || '') + '</div>' +
      '</div>' +
    '</div>';
  });

  timelineHtml += '</div>';

  return arcTabsHtml + timelineHtml;
}

function bindEventTabEvents() {
  // Arc filter clicks
  document.querySelectorAll('.event-arc-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      state.currentEventArc = this.dataset.arc;
      loadEventTimeline();
    });
  });

  // Add event button
  var addBtn = document.getElementById('event-add-btn');
  if (addBtn && !addBtn.dataset.bound) {
    addBtn.dataset.bound = '1';
    addBtn.addEventListener('click', function() {
      state.selectedEntity = { __isNew: true, id: null, title: '', cause: '', process: '', result: '', arc: '主线', chapter: '', timestamp: 0, isKeyEvent: false, tension: 50, status: 'open', characters: [], locations: [], items: [] };
      state.currentEntity = 'events';
      renderApp();
    });
  }

  // Event card clicks
  document.querySelectorAll('.event-card').forEach(function(card) {
    card.addEventListener('click', function() {
      var id = this.dataset.id;
      var eventData = (state.events || []).find(function(e) { return e.id === id; });
      if (eventData) {
        state.selectedEntity = eventData;
        state.currentEntity = 'events';
        document.querySelectorAll('.event-card').forEach(function(c) { c.classList.remove('active'); });
        this.classList.add('active');
        // Show detail panel
        var dp = document.getElementById('detail-panel');
        if (dp) {
          dp.classList.remove('hidden');
          dp.innerHTML = renderEventDetail(eventData);
          bindEventDetailEvents();
        }
      }
    });
  });
}

function renderEventDetail(ev) {
  var chars = [];
  try { chars = JSON.parse(ev.characters || '[]'); } catch(e) { chars = []; }
  var locs = [];
  try { locs = JSON.parse(ev.locations || '[]'); } catch(e) { locs = []; }
  var isNew = ev.__isNew;

  return '<div class="drawer-header">' +
    '<span class="drawer-title">' + (isNew ? '新增事件' : '事件详情') + '</span>' +
    '<button class="drawer-toggle" id="close-detail">' + icon('close') + '</button>' +
  '</div>' +
  '<div class="drawer-content">' +
    '<div class="detail-field"><label>标题</label><input class="detail-input" id="ev-title" value="' + escapeHtml(ev.title || '') + '" placeholder="事件标题"></div>' +
    '<div class="detail-field"><label>章节/位置</label><input class="detail-input" id="ev-chapter" value="' + escapeHtml(ev.chapter || '') + '" placeholder="第X回"></div>' +
    '<div class="detail-row">' +
      '<div class="detail-field"><label>剧情线</label>' +
        '<select class="detail-input" id="ev-arc"><option value="主线"' + (ev.arc === '主线' ? ' selected' : '') + '>主线</option><option value="支线"' + (ev.arc === '支线' ? ' selected' : '') + '>支线</option><option value="暗线"' + (ev.arc === '暗线' ? ' selected' : '') + '>暗线</option><option value="感情线"' + (ev.arc === '感情线' ? ' selected' : '') + '>感情线</option><option value="成长线"' + (ev.arc === '成长线' ? ' selected' : '') + '>成长线</option></select>' +
      '</div>' +
      '<div class="detail-field"><label>序号</label><input class="detail-input" id="ev-timestamp" type="number" value="' + (ev.timestamp || 0) + '"></div>' +
    '</div>' +
    '<div class="detail-field"><label>起因</label><textarea class="detail-textarea" id="ev-cause" rows="2" placeholder="事件起因...">' + escapeHtml(ev.cause || '') + '</textarea></div>' +
    '<div class="detail-field"><label>经过</label><textarea class="detail-textarea" id="ev-process" rows="3" placeholder="事件经过...">' + escapeHtml(ev.process || '') + '</textarea></div>' +
    '<div class="detail-field"><label>结果</label><textarea class="detail-textarea" id="ev-result" rows="2" placeholder="事件结果...">' + escapeHtml(ev.result || '') + '</textarea></div>' +
    '<div class="detail-row">' +
      '<div class="detail-field"><label>张力</label><input class="detail-input" id="ev-tension" type="range" min="0" max="100" value="' + (ev.tension || 50) + '"><span id="ev-tension-val">' + (ev.tension || 50) + '</span></div>' +
      '<div class="detail-field"><label>状态</label>' +
        '<select class="detail-input" id="ev-status"><option value="open"' + (ev.status === 'open' ? ' selected' : '') + '>进行中</option><option value="closed"' + (ev.status === 'closed' ? ' selected' : '') + '>已解决</option></select>' +
      '</div>' +
    '</div>' +
    '<div class="detail-field"><label>关键事件</label><input type="checkbox" id="ev-isKeyEvent"' + (ev.isKeyEvent ? ' checked' : '') + '></div>' +
    '<div class="detail-field"><label>涉及角色（逗号分隔）</label><input class="detail-input" id="ev-characters" value="' + escapeHtml(chars.join(', ')) + '" placeholder="贾宝玉, 林黛玉"></div>' +
    '<div class="detail-field"><label>涉及地点（逗号分隔）</label><input class="detail-input" id="ev-locations" value="' + escapeHtml(locs.join(', ')) + '" placeholder="荣国府, 大观园"></div>' +
    '<div class="detail-actions">' +
      '<button class="btn-save" id="ev-save-btn">' + icon('save') + ' 保存</button>' +
      (!isNew ? '<button class="btn-delete" id="ev-delete-btn">' + icon('trash') + ' 删除</button>' : '') +
    '</div>' +
  '</div>';
}

function bindEventDetailEvents() {
  var closeBtn = document.getElementById('close-detail');
  if (closeBtn) closeBtn.addEventListener('click', function() {
    var dp = document.getElementById('detail-panel');
    if (dp) dp.classList.add('hidden');
  });

  var tensionInput = document.getElementById('ev-tension');
  if (tensionInput) {
    tensionInput.addEventListener('input', function() {
      var val = document.getElementById('ev-tension-val');
      if (val) val.textContent = this.value;
    });
  }

  var saveBtn = document.getElementById('ev-save-btn');
  if (saveBtn && !saveBtn.dataset.bound) {
    saveBtn.dataset.bound = '1';
    saveBtn.addEventListener('click', saveEvent);
  }

  var deleteBtn = document.getElementById('ev-delete-btn');
  if (deleteBtn && !deleteBtn.dataset.bound) {
    deleteBtn.dataset.bound = '1';
    deleteBtn.addEventListener('click', function() {
      if (!state.selectedEntity || !state.selectedEntity.id) return;
      if (!confirm('确认删除此事件？')) return;
      booksApi('delete_event', { id: state.selectedEntity.id }).then(function(res) {
        if (res.success) {
          state.selectedEntity = null;
          loadEventTimeline();
          var dp = document.getElementById('detail-panel');
          if (dp) dp.classList.add('hidden');
        }
      });
    });
  }
}

async function saveEvent() {
  var ev = state.selectedEntity;
  if (!ev) return;
  var data = {
    title: document.getElementById('ev-title').value,
    chapter: document.getElementById('ev-chapter').value,
    arc: document.getElementById('ev-arc').value,
    timestamp: parseInt(document.getElementById('ev-timestamp').value) || 0,
    cause: document.getElementById('ev-cause').value,
    process: document.getElementById('ev-process').value,
    result: document.getElementById('ev-result').value,
    tension: parseInt(document.getElementById('ev-tension').value) || 50,
    status: document.getElementById('ev-status').value,
    isKeyEvent: document.getElementById('ev-isKeyEvent').checked,
    characters: document.getElementById('ev-characters').value.split(',').map(function(s) { return s.trim(); }).filter(Boolean),
    locations: document.getElementById('ev-locations').value.split(',').map(function(s) { return s.trim(); }).filter(Boolean)
  };

  var res;
  if (ev.__isNew) {
    data.bookId = state.currentBook.id;
    res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function(r) { return r.json(); });
  } else {
    res = await fetch('/api/events/' + ev.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function(r) { return r.json(); });
  }

  if (res.success) {
    state.selectedEntity = null;
    loadEventTimeline();
    var dp = document.getElementById('detail-panel');
    if (dp) dp.classList.add('hidden');
  } else {
    alert('保存失败: ' + res.message);
  }
}

async function loadEventTimeline() {
  if (!state.currentBook) return;
  try {
    var res = await fetch('/api/events/timeline/' + state.currentBook.id);
    var result = await res.json();
    if (result.success) {
      state.events = result.data.events;
      state.arcs = result.data.arcs;
      var timeline = document.getElementById('event-timeline');
      if (timeline) {
        if (!state.events || state.events.length === 0) {
          timeline.innerHTML = '<div class="event-empty" style="padding:40px;text-align:center;color:var(--text2);"><div style="font-size:2em;margin-bottom:12px;">' + icon('event') + '</div><div style="margin-bottom:8px;">暂无事件</div><div style="font-size:12px;color:var(--text2);">点击右上角"新增事件"开始构建故事线</div></div>';
        } else {
          timeline.innerHTML = renderEventTimeline(state.events, state.arcs);
          bindEventTabEvents();
        }
      }
    }
  } catch (e) {
    console.error('loadEventTimeline error:', e);
  }
}
function renderNvwaTab() {
  return '<div class="nvwa-tab-root" id="nvwa-tab-root">' +
    '<div class="nvwa-loading" style="padding:40px;text-align:center;color:var(--text2);">加载中...</div>' +
  '</div>';
}

function renderNvwaContent(roles, memoryData) {
  if (!roles || roles.length === 0) {
    return '<div class="nvwa-empty" style="padding:40px;text-align:center;color:var(--text2);">' +
      '<div style="font-size:2em;margin-bottom:12px;">' + icon('nvwa') + '</div>' +
      '<div>请先创建角色</div>' +
    '</div>';
  }

  var html = '<div class="nvwa-layout">';

  // Left: character list
  html += '<div class="nvwa-char-list">' +
    '<div class="nvwa-section-title">选择角色</div>';
  roles.forEach(function(r) {
    var isActive = state.nvwaSelectedChar === r.id ? 'active' : '';
    html += '<div class="nvwa-char-item ' + isActive + '" data-id="' + r.id + '">' +
      '<div class="nvwa-char-avatar">' + icon('roles') + '</div>' +
      '<div class="nvwa-char-name">' + escapeHtml(r.title || r.name || '未命名') + '</div>' +
    '</div>';
  });
  html += '</div>';

  // Right: memory view
  html += '<div class="nvwa-memory-view" id="nvwa-memory-view">';
  if (state.nvwaSelectedChar) {
    var mem = memoryData[state.nvwaSelectedChar] || { buffer: [], core: [], recall: [], archival: [], summary: '' };
    html += renderNvwaMemoryPanel(state.nvwaSelectedChar, mem);
  } else {
    html += '<div class="nvwa-hint">请从左侧选择一个角色</div>';
  }
  html += '</div></div>';

  return html;
}

function renderNvwaMemoryPanel(characterId, mem) {
  var bufferCount = (mem.buffer || []).length;
  var coreCount = (mem.core || []).length;
  var recallCount = (mem.recall || []).length;
  var archivalCount = (mem.archival || []).length;

  var html = '<div class="nvwa-panel-header">' +
    '<div class="nvwa-layer-stats">' +
      '<span class="nvwa-stat buffer"><span class="nvwa-stat-num">' + bufferCount + '</span><span class="nvwa-stat-label">缓冲区</span></span>' +
      '<span class="nvwa-stat core"><span class="nvwa-stat-num">' + coreCount + '</span><span class="nvwa-stat-label">核心</span></span>' +
      '<span class="nvwa-stat recall"><span class="nvwa-stat-num">' + recallCount + '</span><span class="nvwa-stat-label">召回</span></span>' +
      '<span class="nvwa-stat archival"><span class="nvwa-stat-num">' + archivalCount + '</span><span class="nvwa-stat-label">归档</span></span>' +
    '</div>' +
    '<button class="nvwa-add-btn" id="nvwa-add-btn">+ 添加记忆</button>' +
  '</div>';

  if (mem.summary) {
    html += '<div class="nvwa-summary">' +
      '<div class="nvwa-summary-label">角色摘要</div>' +
      '<div class="nvwa-summary-text">' + escapeHtml(mem.summary) + '</div>' +
    '</div>';
  }

  // Tabs for each layer
  html += '<div class="nvwa-layer-tabs">' +
    '<button class="nvwa-layer-tab active" data-layer="buffer">缓冲区 (' + bufferCount + ')</button>' +
    '<button class="nvwa-layer-tab" data-layer="core">核心记忆 (' + coreCount + ')</button>' +
    '<button class="nvwa-layer-tab" data-layer="recall">召回索引 (' + recallCount + ')</button>' +
    '<button class="nvwa-layer-tab" data-layer="archival">归档 (' + archivalCount + ')</button>' +
  '</div>';

  // Layer content
  var activeLayer = state.nvwaActiveLayer || 'buffer';
  var layerEntries = mem[activeLayer] || [];
  html += '<div class="nvwa-layer-content" id="nvwa-layer-content">';
  if (layerEntries.length === 0) {
    html += '<div class="nvwa-empty-layer">此层暂无记忆</div>';
  } else {
    layerEntries.forEach(function(entry) {
      var emotionTags = (entry.emotions || []).map(function(e) { return '<span class="nvwa-emotion-tag">' + escapeHtml(e) + '</span>'; }).join('');
      html += '<div class="nvwa-entry" data-id="' + entry.id + '">' +
        '<div class="nvwa-entry-header">' +
          '<span class="nvwa-entry-time">' + formatTime(entry.timestamp) + '</span>' +
          '<span class="nvwa-entry-importance" style="color: hsl(' + (entry.importance * 9.6) + ', 70%, 60%);">★' + entry.importance + '</span>' +
          emotionTags +
          '<div class="nvwa-entry-actions">' +
            '<button class="nvwa-entry-edit" data-id="' + entry.id + '">编辑</button>' +
            '<button class="nvwa-entry-delete" data-id="' + entry.id + '">删除</button>' +
          '</div>' +
        '</div>' +
        '<div class="nvwa-entry-content">' + escapeHtml(entry.content) + '</div>' +
      '</div>';
    });
  }
  html += '</div>';

  return html;
}

function formatTime(ts) {
  if (!ts) return '';
  var d = new Date(ts);
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function bindNvwaTabEvents() {
  // Character selection
  document.querySelectorAll('.nvwa-char-item').forEach(function(item) {
    item.addEventListener('click', function() {
      state.nvwaSelectedChar = this.dataset.id;
      state.nvwaActiveLayer = 'buffer';
      loadNvwaData();
    });
  });

  // Layer tabs
  document.querySelectorAll('.nvwa-layer-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      state.nvwaActiveLayer = this.dataset.layer;
      document.querySelectorAll('.nvwa-layer-tab').forEach(function(t) { t.classList.remove('active'); });
      this.classList.add('active');
      // Re-render layer content
      var charId = state.nvwaSelectedChar;
      if (charId && state.nvwaMemoryData && state.nvwaMemoryData[charId]) {
        var mem = state.nvwaMemoryData[charId];
        var content = document.getElementById('nvwa-layer-content');
        if (content) {
          var entries = mem[state.nvwaActiveLayer] || [];
          var html = '';
          if (entries.length === 0) {
            html = '<div class="nvwa-empty-layer">此层暂无记忆</div>';
          } else {
            entries.forEach(function(entry) {
              var emotionTags = (entry.emotions || []).map(function(e) { return '<span class="nvwa-emotion-tag">' + escapeHtml(e) + '</span>'; }).join('');
              html += '<div class="nvwa-entry" data-id="' + entry.id + '">' +
                '<div class="nvwa-entry-header">' +
                  '<span class="nvwa-entry-time">' + formatTime(entry.timestamp) + '</span>' +
                  '<span class="nvwa-entry-importance" style="color: hsl(' + (entry.importance * 9.6) + ', 70%, 60%);">★' + entry.importance + '</span>' +
                  emotionTags +
                  '<div class="nvwa-entry-actions">' +
                    '<button class="nvwa-entry-edit" data-id="' + entry.id + '">编辑</button>' +
                    '<button class="nvwa-entry-delete" data-id="' + entry.id + '">删除</button>' +
                  '</div>' +
                '</div>' +
                '<div class="nvwa-entry-content">' + escapeHtml(entry.content) + '</div>' +
              '</div>';
            });
          }
          content.innerHTML = html;
          bindNvwaEntryEvents();
        }
      }
    });
  });

  // Add memory button
  var addBtn = document.getElementById('nvwa-add-btn');
  if (addBtn && !addBtn.dataset.bound) {
    addBtn.dataset.bound = '1';
    addBtn.addEventListener('click', showNvwaAddMemoryModal);
  }

  bindNvwaEntryEvents();
}

function bindNvwaEntryEvents() {
  document.querySelectorAll('.nvwa-entry-edit').forEach(function(btn) {
    if (!btn.dataset.bound) {
      btn.dataset.bound = '1';
      btn.addEventListener('click', function() {
        var entryId = this.dataset.id;
        var layer = state.nvwaActiveLayer;
        var mem = state.nvwaMemoryData[state.nvwaSelectedChar];
        var entry = (mem[layer] || []).find(function(e) { return e.id === entryId; });
        if (entry) showNvwaEditMemoryModal(entry, layer);
      });
    }
  });

  document.querySelectorAll('.nvwa-entry-delete').forEach(function(btn) {
    if (!btn.dataset.bound) {
      btn.dataset.bound = '1';
      btn.addEventListener('click', function() {
        var entryId = this.dataset.id;
        if (!confirm('确认删除此记忆？')) return;
        deleteNvwaEntry(entryId);
      });
    }
  });
}

function showNvwaAddMemoryModal() {
  var charId = state.nvwaSelectedChar;
  if (!charId) return;
  var modal = document.getElementById('nvwa-add-modal');
  if (!modal) {
    var m = document.createElement('div');
    m.id = 'nvwa-add-modal';
    m.className = 'modal-overlay';
    m.innerHTML = '<div class="modal-box">' +
      '<div class="modal-title">添加记忆</div>' +
      '<div class="modal-body">' +
        '<div class="field"><label>内容</label><textarea id="nvwa-new-content" rows="5" placeholder="记忆内容..."></textarea></div>' +
        '<div class="field-row">' +
          '<div class="field"><label>重要性 (1-10)</label><input id="nvwa-new-importance" type="range" min="1" max="10" value="5"><span id="nvwa-imp-val">5</span></div>' +
          '<div class="field"><label>情感标签</label><input id="nvwa-new-emotions" placeholder="如: 开心, 悲伤 (逗号分隔)"></div>' +
        '</div>' +
        '<div class="field"><label>目标层级</label>' +
          '<select id="nvwa-new-status">' +
            '<option value="buffer">缓冲区</option>' +
            '<option value="core">核心记忆</option>' +
            '<option value="recall">召回索引</option>' +
            '<option value="archival">归档</option>' +
          '</select>' +
        '</div>' +
      '</div>' +
      '<div class="modal-actions">' +
        '<button class="btn btn-primary" id="nvwa-save-btn">保存</button>' +
        '<button class="btn btn-secondary" id="nvwa-cancel-btn">取消</button>' +
      '</div>' +
    '</div>';
    document.body.appendChild(m);
    modal = m;

    document.getElementById('nvwa-new-importance').addEventListener('input', function() {
      document.getElementById('nvwa-imp-val').textContent = this.value;
    });
    document.getElementById('nvwa-cancel-btn').addEventListener('click', function() {
      modal.classList.remove('open');
    });
    document.getElementById('nvwa-save-btn').addEventListener('click', function() {
      var content = document.getElementById('nvwa-new-content').value.trim();
      if (!content) { alert('请输入记忆内容'); return; }
      var bookId = state.currentBook ? state.currentBook.id : '';
      fetch('/api/memory/' + bookId + '/' + charId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content,
          importance: parseInt(document.getElementById('nvwa-new-importance').value),
          emotions: document.getElementById('nvwa-new-emotions').value.split(',').map(function(s) { return s.trim(); }).filter(Boolean),
          status: document.getElementById('nvwa-new-status').value
        })
      }).then(function(r) { return r.json(); }).then(function(res) {
        if (res.success) {
          modal.classList.remove('open');
          loadNvwaData();
        }
      });
    });
  }
  modal.classList.add('open');
}

function showNvwaEditMemoryModal(entry, layer) {
  var modal = document.getElementById('nvwa-edit-modal');
  if (!modal) {
    var m = document.createElement('div');
    m.id = 'nvwa-edit-modal';
    m.className = 'modal-overlay';
    m.innerHTML = '<div class="modal-box">' +
      '<div class="modal-title">编辑记忆</div>' +
      '<div class="modal-body">' +
        '<div class="field"><label>内容</label><textarea id="nvwa-edit-content" rows="5"></textarea></div>' +
        '<div class="field-row">' +
          '<div class="field"><label>重要性</label><input id="nvwa-edit-importance" type="range" min="1" max="10"><span id="nvwa-edit-imp-val"></span></div>' +
          '<div class="field"><label>状态</label>' +
            '<select id="nvwa-edit-status">' +
              '<option value="buffer">缓冲区</option>' +
              '<option value="core">核心记忆</option>' +
              '<option value="recall">召回索引</option>' +
              '<option value="archival">归档</option>' +
            '</select>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="modal-actions">' +
        '<button class="btn btn-primary" id="nvwa-edit-save-btn">保存</button>' +
        '<button class="btn btn-secondary" id="nvwa-edit-cancel-btn">取消</button>' +
      '</div>' +
    '</div>';
    document.body.appendChild(m);
    modal = m;
    document.getElementById('nvwa-edit-importance').addEventListener('input', function() {
      document.getElementById('nvwa-edit-imp-val').textContent = this.value;
    });
    document.getElementById('nvwa-edit-cancel-btn').addEventListener('click', function() {
      modal.classList.remove('open');
    });
  }

  document.getElementById('nvwa-edit-content').value = entry.content || '';
  document.getElementById('nvwa-edit-importance').value = entry.importance || 5;
  document.getElementById('nvwa-edit-imp-val').textContent = entry.importance || 5;
  document.getElementById('nvwa-edit-status').value = layer;
  var saveBtn = document.getElementById('nvwa-edit-save-btn');
  saveBtn.onclick = function() {
    var bookId = state.currentBook ? state.currentBook.id : '';
    fetch('/api/memory/' + bookId + '/' + state.nvwaSelectedChar + '/' + entry.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: document.getElementById('nvwa-edit-content').value,
        importance: parseInt(document.getElementById('nvwa-edit-importance').value),
        status: document.getElementById('nvwa-edit-status').value
      })
    }).then(function(r) { return r.json(); }).then(function(res) {
      if (res.success) {
        modal.classList.remove('open');
        loadNvwaData();
      }
    });
  };
  modal.classList.add('open');
}

async function deleteNvwaEntry(entryId) {
  var bookId = state.currentBook ? state.currentBook.id : '';
  await fetch('/api/memory/' + bookId + '/' + state.nvwaSelectedChar + '/' + entryId, { method: 'DELETE' });
  loadNvwaData();
}

async function loadNvwaData() {
  if (!state.currentBook) {
    var root = document.getElementById('nvwa-tab-root');
    if (root) root.innerHTML = '<div class="nvwa-empty" style="padding:40px;text-align:center;color:var(--text2);">请先打开一本书</div>';
    return;
  }
  try {
    // Load characters
    var res = await fetch('/api/entities/' + state.currentBook.id + '/roles');
    var result = await res.json();
    var roles = result.success ? (result.data || []) : [];

    // Load memory for each character
    var memoryData = {};
    for (var i = 0; i < roles.length; i++) {
      var r = roles[i];
      var mRes = await fetch('/api/memory/' + state.currentBook.id + '/' + r.id);
      var mResult = await mRes.json();
      if (mResult.success) memoryData[r.id] = mResult.data;
    }

    // Select first if none
    if (!state.nvwaSelectedChar && roles.length > 0) {
      state.nvwaSelectedChar = roles[0].id;
    }
    state.nvwaMemoryData = memoryData;

    var root = document.getElementById('nvwa-tab-root');
    if (root) {
      root.innerHTML = renderNvwaContent(roles, memoryData);
      bindNvwaTabEvents();
    }
  } catch (e) {
    console.error('loadNvwaData error:', e);
  }
}
