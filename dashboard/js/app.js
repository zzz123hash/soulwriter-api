// ============ i18n 内联实现 ============

;(function() {

  window._i18n = {

    currentLocale: 'zh',

    data: {},

    ready: false,

    async loadLocale(locale) {

      try {

        var r = await fetch('/config/i18n/' + locale + '.json');

        if (!r.ok) throw new Error(r.status);

        this.data = await r.json();

        this.currentLocale = locale;

        localStorage.setItem('sw_locale', locale);

        this.ready = true;

        window.dispatchEvent(new CustomEvent('i18nReady', { detail: { locale } }));

      } catch(e) {

        console.error('[i18n] load error:', e);

        if (locale !== 'en') this.loadLocale('en');

      }

    },

    t(key, params) {

      if (!this.ready) return key;

      var keys = key.split('.'), val = this.data;

      for (var i = 0; i < keys.length; i++) { val = val && val[keys[i]]; if (!val) return key; }

      if (params && typeof val === 'string') {

        return val.replace(/\{(\w+)\}/g, function(_, k) { return params[k] !== undefined ? params[k] : '{'+k+'}'; });

      }

      return val || key;

    },

    async setLocale(locale) { await this.loadLocale(locale); if (typeof renderApp === 'function') renderApp(); }

  };

  // 初始化

  var saved = localStorage.getItem('sw_locale') || 'zh';

  window._i18n.loadLocale(saved);

})();



const t = function(key, params) {

  if (window._i18n && window._i18n.ready) return window._i18n.t(key, params);

  return key;

};



/**

 * SoulWriter v2 - 分层导航 + 自定义布局

 * 2026-04-12

 */



const state = {

  currentView: 'welcome',

  currentTab: 'home',

  currentEntity: 'roles',

  currentBook: null,

  books: [],

  leftDrawerOpen: true,

  selectedEntity: null,

  roles: [], items: [], locations: [], nodes: [], units: [],

  events: [],

  entityCounts: {},

  drawerConfig: null,

  nvwaSelectedChar: null,

  nvwaActiveLayer: 'buffer',

  nvwaMemoryData: {},

  currentEventArc: 'all',

};



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

  translate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9"/><path d="M3 12h18"/><path d="M12 3v18"/><path d="M12 16l4-4-4-4-4 4z"/></svg>',

  novel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',

  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',

  chevronLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',

  chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',

  chevronDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',

  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',

  save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',

  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',

  compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',

  building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20"/><path d="M9 22V18h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01"/></svg>',

  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',

  tension: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',

};



function icon(name) { return Icons[name] || ''; }



function escapeHtml(str) {

  if (!str) return '';

  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

}



// ============ 主渲染 ============

function renderApp() {

  var app = document.getElementById('app');

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



// ============ 欢迎页 ============

// ============ 顶部工具栏 ============

// Toolbar is managed by logger.js (permanent, in body)

// app.js 只管理内容区域，不创建 toolbar

function renderToolbar() { return ''; }



function renderWelcome() {

  return renderToolbar() + '<div class="welcome-page">' +

    '<div class="welcome-logo"><h1 class="app-logo">SoulWriter</h1><p class="app-slogan">灵魂创作者</p></div>' +

    '<section class="bookshelf-section"><h2 class="section-title">书架</h2><div class="bookshelf" id="books-list"><div class="loading-text">'+t('errors.loading')+'</div></div></section>' +

    '<div class="create-book-area"><button class="btn-create-book" id="create-book-btn"><span class="btn-icon">+</span><span class="btn-text">创建新书</span></button></div>' +

  '</div>';

}



// ============ 书本视图 ============

function renderBookView() {

  return renderToolbar() +

    '<div class="book-layout">' +

    '<header class="book-header">' +

      '<div class="book-tabs">' +

        '<button class="book-tab ' + (state.currentTab === 'home' ? 'active' : '') + '" data-tab="home">' + icon('home') + ' ' + t('nav.home') + '</button>' +

        '<button class="book-tab ' + (state.currentTab === 'genesis' ? 'active' : '') + '" data-tab="genesis">' + icon('genesis') + ' ' + t('genesis.title') + '</button>' +

        '<button class="book-tab ' + (state.currentTab === 'event' ? 'active' : '') + '" data-tab="event">' + icon('event') + ' ' + t('event.title') + '</button>' +

        '<button class="book-tab ' + (state.currentTab === 'nvwa' ? 'active' : '') + '" data-tab="nvwa">' + icon('nvwa') + ' ' + t('nvwa.title') + '</button>' +

        '<button class="book-tab" data-tab="translate">' + icon('translate') + ' ' + t('translate.title') + '</button>' +

        '<button class="book-tab ' + (state.currentTab === 'novel' ? 'active' : '') + '" data-tab="novel">' + icon('novel') + ' ' + t('entity.novels') + '</button>' +

      '</div>' +

      '<div class="book-info">' +

        '<span class="book-name">' + escapeHtml(state.currentBook && state.currentBook.title || '') + '</span>' +

        '<button class="btn-back" id="back-to-books">← 返回</button>' +

      '</div>' +

    '</header>' +

    '<div class="book-body">' +

      '<aside class="left-drawer ' + (state.leftDrawerOpen ? 'open' : 'collapsed') + '" id="left-drawer">' +

        '<div class="drawer-header">' +

          '<span class="drawer-title">'+t('nav.home')+'</span>' +

          '<button class="drawer-toggle" id="toggle-left">' + icon('chevronLeft') + '</button>' +

        '</div>' +

        '<nav class="drawer-nav-tree" id="drawer-nav-tree">' + renderLeftDrawerNav() + '</nav>' +

      '</aside>' +

      '<main class="main-canvas" id="main-canvas">' +

        '<div class="tab-canvas" id="tab-canvas">' + renderTabContent() + '</div>' +

      '</main>' +

      '<aside class="right-drawer ' + (state.selectedEntity ? 'open' : '') + '" id="detail-panel">' +

        '<div class="drawer-header">' +

          '<span class="drawer-title">'+t('detail.title')+'</span>' +

          '<button class="drawer-toggle" id="close-detail">' + icon('close') + '</button>' +

        '</div>' +

        '<div class="drawer-content" id="detail-content">' + (state.selectedEntity ? renderEntityDetail() : '<div class="empty-hint">← 点击实体查看详情</div>') + '</div>' +

      '</aside>' +

    '</div>' +

  '</div>';

}



// ============ Tab 内容 ============

function renderTabContent() {

  switch (state.currentTab) {

    case 'home': return renderHomeTab();

    case 'genesis': return renderGenesisTab();

    case 'event': return renderEventTab();

    case 'nvwa': return renderNvwaTab();

    case 'translate': return renderTranslateTab();

    case 'novel': return renderNovelTab();

    default: return renderHomeTab();

  }

}



function renderGenesisTab() {

  var nodes = state.nodes || [];

  if (!nodes.length) {

    return '<div style="padding:40px;text-align:center;color:var(--text2);"><div style="font-size:2em;margin-bottom:12px;">' + icon('genesis') + '</div><div style="margin-bottom:8px;">暂无节点</div><div style="font-size:12px;">从左侧添加角色或节点</div></div>';

  }

  var html = '<div style="padding:24px;max-width:800px;margin:0 auto;">' +

    '<h2 style="font-size:1.4em;font-weight:700;margin-bottom:20px;display:flex;align-items:center;gap:10px;">' + icon('genesis') + ' ' + t('genesis.title') + '</h2>';

  nodes.forEach(function(n) {

    var desc = (n.description || '').substring(0, 30);

    html += '<div style="display:flex;align-items:center;gap:10px;padding:12px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;margin-bottom:8px;cursor:pointer;" data-id="' + n.id + '">' +

      '<span style="color:var(--accent);">' + icon('nodes') + '</span>' +

      '<span style="flex:1;font-weight:500;">' + escapeHtml(n.title || n.name || '未命名') + '</span>' +

      '<span style="font-size:11px;color:var(--text2);">' + escapeHtml(desc) + '</span></div>';

  });

  html += '</div>';

  return html;

}



function renderNovelTab() {

  return '<div style="padding:40px;text-align:center;color:var(--text2);"><div style="font-size:2em;margin-bottom:12px;">' + icon('novel') + '</div><div style="margin-bottom:8px;">小说视图</div><div style="font-size:12px;">功能开发中...</div></div>';

}



// ============ 分层导航树 ============

var NAV_TREE = [

  { label: '导航', id: 'nav-root', icon: 'compass', children: [

    { label: '角色', id: 'roles', icon: 'roles' },

    { label: '物品', id: 'items', icon: 'items' },

    { label: '地点', id: 'locations', icon: 'locations' },

    { label: '建筑', id: 'buildings', icon: 'building' },

  ]},

  { label: '背景', id: 'background-root', icon: 'world', children: [

    { label: '设定', id: 'world', icon: 'world' },

    { label: '世界观', id: 'worldview', icon: 'world' },

  ]},

  { label: '剧情', id: 'plot-root', icon: 'event', children: [

    { label: '事件线', id: 'event', icon: 'event' },

    { label: '章节目录', id: 'chapters', icon: 'units' },

  ]},

  { label: '推演', id: 'genesis-root', icon: 'genesis', children: [

    { label: '创世树', id: 'genesis', icon: 'genesis' },

    { label: '女娲推演', id: 'nvwa', icon: 'nvwa' },

  ]},

  { label: '分析', id: 'analysis-root', icon: 'chart', children: [

    { label: '合册分析', id: 'analysis', icon: 'chart' },

    { label: '张力曲线', id: 'tension', icon: 'tension' },

  ]},

  { label: '地图', id: 'map-root', icon: 'map', children: [

    { label: '地图视图', id: 'map', icon: 'map' },

  ]},

];



var SPECIAL_TABS = { genesis: true, event: true, nvwa: true, analysis: true, tension: true, map: true, chapters: true, world: true, worldview: true, novel: true };



function renderLeftDrawerNav() {

  var cfg = state.drawerConfig = loadDrawerConfig();

  var html = '';

  NAV_TREE.forEach(function(group) {

    var isOpen = cfg.collapsed[group.id] !== true;

    html += '<div class="drawer-group' + (isOpen ? ' open' : '') + '" data-group="' + group.id + '">';

    html += '<div class="drawer-group-header" data-group="' + group.id + '">' +

      '<span class="drawer-chevron">' + (isOpen ? icon('chevronDown') : icon('chevronRight')) + '</span>' +

      '<span class="drawer-icon">' + icon(group.icon) + '</span>' +

      '<span class="drawer-group-label">' + escapeHtml(group.label) + '</span></div>';

    if (isOpen) {

      html += '<div class="drawer-group-children">';

      group.children.forEach(function(child) {

        var isActive = state.currentEntity === child.id;

        html += '<div class="drawer-item' + (isActive ? ' active' : '') + '" data-id="' + child.id + '" data-group="' + group.id + '">' +

          '<span class="drawer-chevron small"></span>' +

          '<span class="drawer-icon small">' + icon(child.icon) + '</span>' +

          '<span class="drawer-item-label">' + escapeHtml(child.label) + '</span></div>';

      });

      html += '</div>';

    }

    html += '</div>';

  });

  return html;

}



function loadDrawerConfig() {

  try {

    var saved = localStorage.getItem('sw_drawer_config_v2');

    if (saved) { var cfg = JSON.parse(saved); cfg.collapsed = cfg.collapsed || {}; return cfg; }

  } catch(e) {}

  return { collapsed: {} };

}



function saveDrawerConfig(cfg) {

  try { localStorage.setItem('sw_drawer_config_v2', JSON.stringify(cfg)); } catch(e) {}

}



// ============ 导航页 ============

function renderHomeTab() {

  // 当前选中的实体类型（默认角色）

  var activeType = state.currentEntity || 'roles';

  var counts = state.entityCounts || {};



  // 获取对应类型的列表数据

  var entityMap = {

    roles: state.roles || [],

    items: state.items || [],

    locations: state.locations || [],

    buildings: [],

  };

  var list = entityMap[activeType] || [];



  // AI分析区（右侧面板 or 顶部入口）

  var aiPanel = '<div class="home-ai-panel">' +

    '<div class="home-ai-title-bar"><span class="home-ai-title-text">⚡ AI 助手</span></div>' +

    '<div class="home-ai-actions">' +

      '<div class="home-ai-btn" id="home-upload-zone">' +

        '<div class="home-ai-btn-icon">' + icon('upload') + '</div>' +

        '<div class="home-ai-btn-label">上传分析</div>' +

        '<div class="home-ai-btn-desc">上传文本/文档，AI提取角色物品</div>' +

      '</div>' +

      '<div class="home-ai-btn" id="home-longtext-zone">' +

        '<div class="home-ai-btn-icon">' + icon('prompts') + '</div>' +

        '<div class="home-ai-btn-label">长文本分析</div>' +

        '<div class="home-ai-btn-desc">粘贴文字，提取人物关系和故事线</div>' +

      '</div>' +

    '</div>' +

  '</div>';



  // 实体类型切换tab

  var typeTabs = ['roles', 'items', 'locations', 'buildings'].map(function(t) {

    var label = { roles: '角色', items: '物品', locations: '地点', buildings: '建筑' }[t];

    var cnt = counts[t] || 0;

    return '<button class="entity-type-tab' + (activeType === t ? ' active' : '') + '" data-type="' + t + '">' +

      '<span class="entity-type-icon">' + icon(t) + '</span>' +

      '<span class="entity-type-label">' + label + '</span>' +

      '<span class="entity-type-count">' + cnt + '</span>' +

    '</button>';

  }).join('');



  // 实体列表

  var listHtml = '';

  if (!list.length) {

    listHtml = '<div class="entity-list-empty">' +

      '<div style="font-size:2em;margin-bottom:8px;">' + icon(activeType) + '</div>' +

      '<div style="color:var(--text2);margin-bottom:12px;">暂无' + ({ roles: '角色', items: '物品', locations: '地点', buildings: '建筑' }[activeType] || '') + '</div>' +

      '<button class="btn-create-entity" data-type="' + activeType + '">' + icon('plus') + ' 新建</button>' +

    '</div>';

  } else {

    list.forEach(function(e) {

      listHtml += '<div class="entity-list-item" data-id="' + e.id + '">' +

        '<div class="entity-list-icon">' + icon(activeType) + '</div>' +

        '<div class="entity-list-body">' +

          '<div class="entity-list-name">' + escapeHtml(e.title || e.name || '未命名') + '</div>' +

          '<div class="entity-list-desc">' + escapeHtml((e.description || '').substring(0, 40)) + '</div>' +

        '</div>' +

        '<div class="entity-list-arrow">' + icon('chevronRight') + '</div>' +

      '</div>';

    });

    listHtml += '<div class="entity-list-footer">' +

      '<button class="btn-create-entity" data-type="' + activeType + '">' + icon('plus') + ' 添加</button>' +

    '</div>';

  }



  // 概览统计条

  var statsBar = '<div class="home-stats-bar">' +

    '<div class="stat-item" data-type="roles"><span class="stat-icon">' + icon('roles') + '</span><span class="stat-num" id="stat-roles">' + (counts.roles||0) + '</span><span class="stat-label">角色</span></div>' +

    '<div class="stat-item" data-type="items"><span class="stat-icon">' + icon('items') + '</span><span class="stat-num" id="stat-items">' + (counts.items||0) + '</span><span class="stat-label">物品</span></div>' +

    '<div class="stat-item" data-type="locations"><span class="stat-icon">' + icon('locations') + '</span><span class="stat-num" id="stat-locations">' + (counts.locations||0) + '</span><span class="stat-label">地点</span></div>' +

    '<div class="stat-item" data-type="buildings"><span class="stat-icon">' + icon('building') + '</span><span class="stat-num" id="stat-buildings">' + (counts.buildings||0) + '</span><span class="stat-label">建筑</span></div>' +

    '<div class="stat-item" data-type="event"><span class="stat-icon">' + icon('event') + '</span><span class="stat-num" id="stat-events">' + (state.events ? state.events.length : 0) + '</span><span class="stat-label">事件</span></div>' +

  '</div>';



  return '<div class="home-tab-root" id="home-tab-root">' +

    // 顶部统计条

    statsBar +

    // 双栏主体

    '<div class="home-two-col">' +

      // 左栏：类型tab + 列表

      '<div class="home-left-col">' +

        '<div class="entity-type-tabs">' + typeTabs + '</div>' +

        '<div class="entity-list-container" id="entity-list-container">' + listHtml + '</div>' +

      '</div>' +

      // 右栏：AI分析

      '<div class="home-right-col">' + aiPanel + '</div>' +

    '</div>' +

  '</div>';

}







// 导航页实体列表（供切换tab时刷新）

function renderHomeTab_entityList(type) {

  type = type || state.currentEntity || 'roles';

  var counts = state.entityCounts || {};

  var entityMap = { roles: state.roles || [], items: state.items || [], locations: state.locations || [], buildings: [] };

  var list = entityMap[type] || [];

  var labels = { roles: '角色', items: '物品', locations: '地点', buildings: '建筑' };

  var html = '';

  if (!list.length) {

    html = '<div class="entity-list-empty">' +

      '<div style="font-size:2em;margin-bottom:8px;">' + icon(type) + '</div>' +

      '<div style="color:var(--text2);margin-bottom:12px;">暂无' + (labels[type] || '') + '</div>' +

      '<button class="btn-create-entity" data-type="' + type + '">' + icon('plus') + ' 新建</button>' +

    '</div>';

  } else {

    list.forEach(function(e) {

      html += '<div class="entity-list-item" data-id="' + e.id + '">' +

        '<div class="entity-list-icon">' + icon(type) + '</div>' +

        '<div class="entity-list-body">' +

          '<div class="entity-list-name">' + escapeHtml(e.title || e.name || '未命名') + '</div>' +

          '<div class="entity-list-desc">' + escapeHtml((e.description || '').substring(0, 40)) + '</div>' +

        '</div>' +

        '<div class="entity-list-arrow">' + icon('chevronRight') + '</div>' +

      '</div>';

    });

    html += '<div class="entity-list-footer">' +

      '<button class="btn-create-entity" data-type="' + type + '">' + icon('plus') + ' 添加</button>' +

    '</div>';

  }

  return html;

}



// ============ 事件线 Tab ============

function renderEventTab() {

  return '<div class="event-tab-root" id="event-tab-root">' +

    '<div class="event-toolbar"><div class="event-arcs-filter" id="event-arcs-filter"></div>' +

    '<button class="event-add-btn" id="event-add-btn">' + icon('plus') + ' 新增事件</button></div>' +

    '<div class="event-timeline" id="event-timeline"><div class="event-loading">'+t('errors.loading')+'</div></div>' +

  '</div>';

}



// ============ 女娲 Tab ============

function renderNvwaTab() {

  return '<div class="nvwa-tab-root" id="nvwa-tab-root"><div class="nvwa-loading" style="padding:40px;text-align:center;color:var(--text2);">'+t('errors.loading')+'</div></div>';

}



// ============ 实体详情 ============

function renderEntityDetail() {

  if (!state.selectedEntity) return '<div class="empty-hint">← 点击实体查看详情</div>';

  var e = state.selectedEntity;

  return '<div class="entity-detail">' +

    '<div class="detail-header"><div class="detail-icon">' + icon(state.currentEntity) + '</div><div class="detail-title">' + escapeHtml(e.title || e.name || '未命名') + '</div></div>' +

    '<div class="detail-body">' +

      '<div class="detail-field"><label>名称</label><input type="text" class="detail-input" id="detail-title" value="' + escapeHtml(e.title || e.name || '') + '"></div>' +

      '<div class="detail-field"><label>描述</label><textarea class="detail-textarea" id="detail-desc" rows="5">' + escapeHtml(e.description || '') + '</textarea></div>' +

    '</div>' +

    '<div class="detail-actions">' +

      '<button class="btn-save-detail" id="save-entity-btn">' + icon('save') + ' 保存</button>' +

      '<button class="btn-delete-detail" id="delete-entity-btn">' + icon('trash') + ' 删除</button>' +

    '</div>' +

  '</div>';

}



// ============ Books API ============

async function booksApi(action, data) {

  data = data || {};

  var method = 'GET';

  var url = '/api/v1/works/books';

  if (action === 'list') { url = '/api/v1/works/books'; method = 'GET'; }

  else if (action === 'get') { url = '/api/v1/works/books/' + data.id; method = 'GET'; }

  else if (action === 'create') { data.bookId = data.bookId || ('b_' + Date.now() + '_' + Math.random().toString(36).substr(2,6)); url = '/api/v1/works/books'; method = 'POST'; }

  else if (action === 'delete') { url = '/api/v1/works/books/' + data.id; method = 'DELETE'; }

  else { url = '/api/v1/works/books'; method = 'POST'; }

  try {

    var opts = { method: method, headers: { 'Content-Type': 'application/json' } };

    if (method === 'POST') opts.body = JSON.stringify(data);

    var res = await fetch(url, opts);

    return await res.json();

  } catch(e) { return { error: e.message }; }

}



async function loadBooks() {

  var result = await booksApi('list');

  state.books = (result.data || result.books || []);

  renderBooksList();

}



function renderBooksList() {

  var c = document.getElementById('books-list');

  if (!c) return;

  if (!state.books.length) { c.innerHTML = '<div class="empty-bookshelf"><p>书架空空，点击下方创建新书</p></div>'; return; }

  c.innerHTML = state.books.map(function(book) {

    return '<div class="book-item" data-id="' + book.id + '">' +

      '<div class="book-cover"><div class="book-spine"></div><div class="book-front"><span class="book-name">' + (book.title ? book.title.charAt(0) : '?') + '</span></div></div>' +

      '<div class="book-info"><h3 class="book-title">' + escapeHtml(book.title) + '</h3><p class="book-desc">' + escapeHtml(book.author || '未知作者') + ' · ' + (book.wordCount || 0) + '字</p>' +

      '<div class="book-actions"><button class="btn btn-sm btn-open" data-id="' + book.id + '">打开</button><button class="btn btn-sm btn-danger" data-id="' + book.id + '">删除</button></div></div></div>';

  }).join('');

  c.querySelectorAll('.btn-open').forEach(function(btn) { btn.addEventListener('click', function(e) { e.stopPropagation(); openBook(btn.dataset.id); }); });

  c.querySelectorAll('.btn-danger').forEach(function(btn) { btn.addEventListener('click', function(e) { e.stopPropagation(); deleteBook(btn.dataset.id); }); });

}



async function openBook(id) {

  var result = await booksApi('get', { id: id });

  if (result.success && (result.data || result.meta || result.books)) {

    state.currentBook = result.data || result.meta || result.books[0];

    state.currentView = 'book';

    state.currentTab = 'home';

    state.leftDrawerOpen = true;

    state.selectedEntity = null;

    state.events = [];

    state.entityCounts = {};

    renderApp();

  }

}



async function deleteBook(id) {

  if (!confirm('确定删除？')) return;

  var result = await booksApi('delete', { id: id });

  if (result.success) loadBooks();

}



function showCreateBookModal() {

  var modal = document.createElement('div');

  modal.className = 'modal-overlay open';

  modal.innerHTML = '<div class="modal-box"><div class="modal-title">创建新书</div><div class="modal-body">' +

    '<div class="field"><label>书名</label><input id="new-book-title" type="text" placeholder="'+t('welcome.bookTitle')+'"></div>' +

    '<div class="field"><label>作者</label><input id="new-book-author" type="text" placeholder="'+t('welcome.bookAuthor')+'"></div></div>' +

    '<div class="modal-actions"><button class="btn btn-primary" id="do-create-book">创建</button><button class="btn btn-secondary" id="cancel-create-book">取消</button></div></div>';

  document.body.appendChild(modal);

  document.getElementById('do-create-book').addEventListener('click', async function() {

    var title = document.getElementById('new-book-title').value.trim();

    var author = document.getElementById('new-book-author').value.trim();

    if (!title) { alert('请输入书名'); return; }

    var result = await booksApi('create', { title: title, author: author });

    modal.remove();

    if (result.success && (result.data || result.meta)) openBook(result.data.id);

  });

  document.getElementById('cancel-create-book').addEventListener('click', function() { modal.remove(); });

  modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });

}



// ============ 加载书本数据 ============

async function loadBookData() {

  if (!state.currentBook || !state.currentBook.id) return;

  try {

    var res, result;

    res = await fetch('/api/v1/works/' + state.currentBook.id + '/roles');

    result = await res.json();

    if (result.success) { state.roles = result.entities || []; state.entityCounts.roles = state.roles.length; }

    res = await fetch('/api/v1/works/' + state.currentBook.id + '/items');

    result = await res.json();

    if (result.success) { state.items = result.entities || []; state.entityCounts.items = state.items.length; }

    res = await fetch('/api/v1/works/' + state.currentBook.id + '/locations');

    result = await res.json();

    if (result.success) { state.locations = result.entities || []; state.entityCounts.locations = state.locations.length; }

    try {

      var evRes = await fetch('/api/events/timeline/' + state.currentBook.id);

      var evResult = await evRes.json();

      if (evResult.success) { state.events = evResult.data.events || []; }

    } catch(e) {}

    var drawerNav = document.getElementById('drawer-nav-tree');

    if (drawerNav) drawerNav.innerHTML = renderLeftDrawerNav();

  } catch(e) { console.error('loadBookData error:', e); }

}



// ============ 事件绑定 ============

function bindWelcomeEvents() {

  // Toolbar lang/theme/docs/log bindings

  var btnLang = document.getElementById('btn-lang');

  if (btnLang) btnLang.addEventListener('change', function() {

    var locale = this.value === 'en-US' ? 'en' : 'zh';

    if (window._i18n) window._i18n.setLocale(locale);

  });

  var btnTheme = document.getElementById('btn-theme');

  if (btnTheme) btnTheme.addEventListener('change', function() {

    document.documentElement.setAttribute('data-theme', this.value);

    localStorage.setItem('sw-theme', this.value);

  });

  var btnDocs = document.getElementById('btn-docs');

  if (btnDocs) btnDocs.addEventListener('click', function() {

    window.open('https://github.com/zzz123hash/soulwriter-api', '_blank');

  });

  var btnLog = document.getElementById('btn-log');

  if (btnLog) btnLog.addEventListener('click', function() {

    var panel = document.getElementById('log-panel');

    if (panel) panel.classList.toggle('open');

  });



  var btn = document.getElementById('create-book-btn');

  if (btn) btn.addEventListener('click', showCreateBookModal);

  loadBooks();

}



function bindBookEvents() {

  // Toolbar lang/theme/docs/log bindings

  var btnLang = document.getElementById('btn-lang');

  if (btnLang) btnLang.addEventListener('change', function() {

    var locale = this.value === 'en-US' ? 'en' : 'zh';

    if (window._i18n) window._i18n.setLocale(locale);

  });

  var btnTheme = document.getElementById('btn-theme');

  if (btnTheme) btnTheme.addEventListener('change', function() {

    document.documentElement.setAttribute('data-theme', this.value);

    localStorage.setItem('sw-theme', this.value);

  });

  var btnDocs = document.getElementById('btn-docs');

  if (btnDocs) btnDocs.addEventListener('click', function() {

    window.open('https://github.com/zzz123hash/soulwriter-api', '_blank');

  });

  var btnLog = document.getElementById('btn-log');

  if (btnLog) btnLog.addEventListener('click', function() {

    var panel = document.getElementById('log-panel');

    if (panel) panel.classList.toggle('open');

  });



  var btnBack = document.getElementById('back-to-books'); if (btnBack) btnBack.addEventListener('click', function() {

    state.currentBook = null;

    state.currentView = 'welcome';

    state.events = [];

    renderApp();

  });



  document.querySelectorAll('.book-tab').forEach(function(tab) {

    tab.addEventListener('click', function() {

      document.querySelectorAll('.book-tab').forEach(function(t) { t.classList.remove('active'); });

      tab.classList.add('active');

      state.currentTab = tab.dataset.tab;

      state.selectedEntity = null;

      var tabCanvas = document.getElementById('tab-canvas');

      if (tabCanvas) tabCanvas.innerHTML = renderTabContent();

      bindTabContentEvents();

      if (tab.dataset.tab === 'event') loadEventTimeline();

      if (tab.dataset.tab === 'nvwa') { state.nvwaSelectedChar = null; loadNvwaData(); }

      if (tab.dataset.tab === 'translate') setTimeout(bindTranslateTabEvents, 50);

    });

  });



  document.getElementById('toggle-left').addEventListener('click', function() {

    state.leftDrawerOpen = !state.leftDrawerOpen;

    var drawer = document.getElementById('left-drawer');

    drawer.classList.toggle('open', state.leftDrawerOpen);

    drawer.classList.toggle('collapsed', !state.leftDrawerOpen);

    this.innerHTML = state.leftDrawerOpen ? icon('chevronLeft') : icon('chevronRight');

  });



  document.getElementById('close-detail').addEventListener('click', function() {

    state.selectedEntity = null;

    document.getElementById('detail-panel').classList.remove('open');

    document.getElementById('detail-content').innerHTML = '<div class="empty-hint">← 点击实体查看详情</div>';

  });



  bindDrawerNavEvents();

  bindTabContentEvents();

  bindDetailEvents();

}



function bindDrawerNavEvents() {

  document.querySelectorAll('.drawer-group-header').forEach(function(header) {

    header.addEventListener('click', function() {

      var groupId = this.dataset.group;

      var group = this.closest('.drawer-group');

      var isOpen = group.classList.contains('open');

      if (isOpen) {

        group.classList.remove('open');

        state.drawerConfig.collapsed[groupId] = true;

        this.querySelector('.drawer-chevron').innerHTML = icon('chevronRight');

      } else {

        group.classList.add('open');

        state.drawerConfig.collapsed[groupId] = false;

        this.querySelector('.drawer-chevron').innerHTML = icon('chevronDown');

      }

      saveDrawerConfig(state.drawerConfig);

    });

  });



  document.querySelectorAll('.drawer-item[data-id]').forEach(function(item) {

    item.addEventListener('click', function() {

      var id = this.dataset.id;

      document.querySelectorAll('.drawer-item').forEach(function(i) { i.classList.remove('active'); });

      this.classList.add('active');



      if (SPECIAL_TABS[id]) {

        state.currentTab = id;

        state.currentEntity = id;

        document.querySelectorAll('.book-tab').forEach(function(t) {

          t.classList.toggle('active', t.dataset.tab === id);

        });

        var tabCanvas = document.getElementById('tab-canvas');

        if (tabCanvas) tabCanvas.innerHTML = renderTabContent();

        bindTabContentEvents();

        if (id === 'event') loadEventTimeline();

        if (id === 'nvwa') { state.nvwaSelectedChar = null; loadNvwaData(); }

      } else {

        state.currentEntity = id;

        state.currentTab = 'genesis';

        document.querySelectorAll('.book-tab').forEach(function(t) {

          t.classList.toggle('active', t.dataset.tab === 'genesis');

        });

        var tabCanvas = document.getElementById('tab-canvas');

        if (tabCanvas) tabCanvas.innerHTML = renderTabContent();

        bindTabContentEvents();

      }

    });

  });

}



function bindTabContentEvents() {

  var uploadZone = document.getElementById('home-upload-zone');

  if (uploadZone) uploadZone.addEventListener('click', function() { var btn = document.getElementById('upload-btn'); if (btn) btn.click(); });



  var ltZone = document.getElementById('home-longtext-zone');

  if (ltZone) ltZone.addEventListener('click', function() { showLongTextAnalyzeModal(); });



  document.querySelectorAll('.home-stat-card[data-id]').forEach(function(card) {

    card.addEventListener('click', function() {

      var id = this.dataset.id;

      if (SPECIAL_TABS[id]) {

        state.currentTab = id;

        state.currentEntity = id;

      } else {

        state.currentTab = 'genesis';

        state.currentEntity = id;

      }

      document.querySelectorAll('.book-tab').forEach(function(t) {

        t.classList.toggle('active', t.dataset.tab === state.currentTab);

      });

      var tabCanvas = document.getElementById('tab-canvas');

      if (tabCanvas) tabCanvas.innerHTML = renderTabContent();

      bindTabContentEvents();

    });

  });



  document.querySelectorAll('.home-action-btn[data-action]').forEach(function(btn) {

    btn.addEventListener('click', function() {

      var action = this.dataset.action;

      if (action === 'newEvent') {

        state.selectedEntity = { __isNew: true };

        state.currentTab = 'event';

        state.currentEntity = 'event';

        document.querySelectorAll('.book-tab').forEach(function(t) {

          t.classList.toggle('active', t.dataset.tab === 'event');

        });

        var tabCanvas = document.getElementById('tab-canvas');

        if (tabCanvas) tabCanvas.innerHTML = renderTabContent();

        bindTabContentEvents();

        loadEventTimeline();

      }

    });

  });



  var addEventBtn = document.getElementById('event-add-btn');

  if (addEventBtn && !addEventBtn.dataset.bound) {

    addEventBtn.dataset.bound = '1';

    addEventBtn.addEventListener('click', function() {

      state.selectedEntity = { __isNew: true, id: null, title: '', cause: '', process: '', result: '', arc: '主线', chapter: '', timestamp: 0, isKeyEvent: false, tension: 50, status: 'open', characters: [], locations: [], items: [] };

      state.currentEntity = 'event';

      var dp = document.getElementById('detail-panel');

      if (dp) { dp.classList.add('open'); document.getElementById('detail-content').innerHTML = renderEventDetail(); bindEventDetailEvents(); }

    });

  }

}





  // 实体类型tab切换（导航页）

  document.querySelectorAll('.entity-type-tab').forEach(function(tab) {

    tab.addEventListener('click', function() {

      var type = this.dataset.type;

      state.currentEntity = type;

      document.querySelectorAll('.entity-type-tab').forEach(function(t) { t.classList.remove('active'); });

      this.classList.add('active');

      var container = document.getElementById('entity-list-container');

      if (container) container.innerHTML = renderHomeTab_entityList(type);

    });

  });



  // 实体列表项点击 → 打开详情

  document.querySelectorAll('.entity-list-item').forEach(function(item) {

    item.addEventListener('click', function() {

      var id = this.dataset.id;

      var type = state.currentEntity;

      var entityMap = { roles: state.roles, items: state.items, locations: state.locations };

      var list = entityMap[type] || [];

      var entity = list.find(function(e) { return e.id === id; });

      if (entity) {

        state.selectedEntity = entity;

        var dp = document.getElementById('detail-panel');

        if (dp) { dp.classList.add('open'); document.getElementById('detail-content').innerHTML = renderEntityDetail(); bindDetailEvents(); }

      }

    });

  });



  // 新建实体按钮

  document.querySelectorAll('.btn-create-entity').forEach(function(btn) {

    btn.addEventListener('click', function() {

      var type = this.dataset.type;

      var newEntity = { __isNew: true, id: null, title: '', description: '' };

      state.selectedEntity = newEntity;

      state.currentEntity = type;

      var dp = document.getElementById('detail-panel');

      if (dp) { dp.classList.add('open'); document.getElementById('detail-content').innerHTML = renderEntityDetail(); bindDetailEvents(); }

    });

  });



  // 统计条点击 → 切换tab

  document.querySelectorAll('.stat-item').forEach(function(item) {

    item.addEventListener('click', function() {

      var type = this.dataset.type;

      if (type === 'event') {

        state.currentTab = 'event';

        state.currentEntity = 'event';

      } else {

        state.currentTab = 'home';

        state.currentEntity = type;

      }

      document.querySelectorAll('.book-tab').forEach(function(t) {

        t.classList.toggle('active', t.dataset.tab === state.currentTab);

      });

      var tabCanvas = document.getElementById('tab-canvas');

      if (tabCanvas) tabCanvas.innerHTML = renderTabContent();

      bindTabContentEvents();

      if (state.currentTab === 'event') loadEventTimeline();

    });

  });



function bindDetailEvents() {

  var saveBtn = document.getElementById('save-entity-btn');

  if (saveBtn) {

    saveBtn.addEventListener('click', function() {

      var title = (document.getElementById('detail-title') || {}).value || '';

      var description = (document.getElementById('detail-desc') || {}).value || '';

      if (state.selectedEntity && state.selectedEntity.__isNew) {

        fetch('/api/v1/works/' + state.currentBook.id + '/' + state.currentEntity, {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ title: title, description: description })

        }).then(function(r) { return r.json(); }).then(function(result) {

          if (result.success) { state.selectedEntity = null; document.getElementById('detail-panel').classList.remove('open'); loadBookData(); }

        });

      } else if (state.selectedEntity && state.selectedEntity.id) {

        fetch('/api/v1/works/' + state.currentBook.id + '/' + state.currentEntity + '/' + state.selectedEntity.id, {

          method: 'PUT',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ title: title, description: description })

        }).then(function(r) { return r.json(); }).then(function(result) {

          if (result.success) { state.selectedEntity.title = title; state.selectedEntity.description = description; }

        });

      }

    });

  }

  var deleteBtn = document.getElementById('delete-entity-btn');

  if (deleteBtn) {

    deleteBtn.addEventListener('click', function() {

      if (!state.selectedEntity || !state.selectedEntity.id || !confirm('确定删除？')) return;

      fetch('/api/v1/works/' + state.currentBook.id + '/' + state.currentEntity + '/' + state.selectedEntity.id, { method: 'DELETE' })

        .then(function(r) { return r.json(); })

        .then(function(result) {

          if (result.success) { state.selectedEntity = null; document.getElementById('detail-panel').classList.remove('open'); loadBookData(); }

        });

    });

  }

}



// ============ 事件线功能 ============

async function loadEventTimeline() {

  if (!state.currentBook) return;

  try {

    var res = await fetch('/api/events/timeline/' + state.currentBook.id);

    var result = await res.json();

    if (result.success) {

      state.events = result.data.events || [];

      var timeline = document.getElementById('event-timeline');

      if (timeline) {

        if (!state.events.length) {

          timeline.innerHTML = '<div class="event-empty" style="padding:40px;text-align:center;color:var(--text2);"><div style="font-size:2em;margin-bottom:12px;">' + icon('event') + '</div><div style="margin-bottom:8px;">暂无事件</div><div style="font-size:12px;">点击右上角"新增事件"开始构建故事线</div></div>';

        } else {

          timeline.innerHTML = renderEventTimeline(state.events, result.data.arcs || {});

          bindEventCardEvents();

        }

      }

    }

  } catch(e) { console.error('loadEventTimeline error:', e); }

}



function renderEventTimeline(events, arcs) {

  var html = '<div class="event-list">';

  events.forEach(function(ev) {

    var chars = [];

    try { chars = JSON.parse(ev.characters || '[]'); } catch(e) {}

    var locs = [];

    try { locs = JSON.parse(ev.locations || '[]'); } catch(e) {}

    var tc = ev.tension >= 70 ? 'high' : (ev.tension >= 40 ? 'mid' : 'low');

    html += '<div class="event-card' + (ev.isKeyEvent ? ' key' : '') + '" data-id="' + ev.id + '">' +

      '<div class="event-card-left"><div class="event-tension-bar ' + tc + '" style="height:' + ev.tension + '%;"></div></div>' +

      '<div class="event-card-body">' +

        '<div class="event-card-header">' +

          '<span class="event-chapter">' + escapeHtml(ev.chapter || '') + '</span>' +

          '<b class="event-title">' + escapeHtml(ev.title) + '</b>' +

          '<span class="event-status ' + (ev.status === 'open' ? 'open' : 'closed') + '">' + (ev.status === 'open' ? '进行中' : '已解决') + '</span>' +

          (ev.isKeyEvent ? '<span class="event-key">关键</span>' : '') +

        '</div>' +

        '<div class="event-card-meta">' +

          (chars.length ? '<span class="event-meta-item">' + icon('roles') + ' ' + chars.join(', ') + '</span>' : '') +

          (locs.length ? '<span class="event-meta-item">' + icon('locations') + ' ' + locs.join(', ') + '</span>' : '') +

          '<span class="event-meta-item tension-badge ' + tc + '">张力 ' + ev.tension + '%</span>' +

        '</div>' +

        '<div class="event-result">' + escapeHtml(ev.result || '') + '</div>' +

      '</div></div>';

  });

  html += '</div>';

  return html;

}



function bindEventCardEvents() {

  document.querySelectorAll('.event-card').forEach(function(card) {

    card.addEventListener('click', function() {

      var id = this.dataset.id;

      var ev = state.events.find(function(e) { return e.id === id; });

      if (ev) {

        state.selectedEntity = ev;

        var dp = document.getElementById('detail-panel');

        if (dp) { dp.classList.add('open'); document.getElementById('detail-content').innerHTML = renderEventDetail(); bindEventDetailEvents(); }

      }

    });

  });

}



function renderEventDetail() {

  var ev = state.selectedEntity;

  if (!ev) return '';

  var isNew = ev.__isNew;

  var chars = [];

  try { chars = JSON.parse(ev.characters || '[]'); } catch(e) { chars = []; }

  var locs = [];

  try { locs = JSON.parse(ev.locations || '[]'); } catch(e) { locs = []; }

  return '<div class="entity-detail">' +

    '<div class="detail-header"><div class="detail-icon">' + icon('event') + '</div><div class="detail-title">' + (isNew ? '新增事件' : escapeHtml(ev.title)) + '</div></div>' +

    '<div class="detail-body">' +

      '<div class="detail-field"><label>标题</label><input class="detail-input" id="ev-title" value="' + escapeHtml(ev.title || '') + '" placeholder="'+t('event.eventTitle')+'"></div>' +

      '<div class="detail-field"><label>章节/位置</label><input class="detail-input" id="ev-chapter" value="' + escapeHtml(ev.chapter || '') + '" placeholder="'+t('event.chapterPlaceholder')+'"></div>' +

      '<div class="detail-row"><div class="detail-field"><label>剧情线</label>' +

        '<select class="detail-input" id="ev-arc"><option value="主线"' + (ev.arc === '主线' ? ' selected' : '') + '>主线</option><option value="支线"' + (ev.arc === '支线' ? ' selected' : '') + '>支线</option><option value="暗线"' + (ev.arc === '暗线' ? ' selected' : '') + '>暗线</option><option value="感情线"' + (ev.arc === '感情线' ? ' selected' : '') + '>感情线</option></select>' +

      '</div><div class="detail-field"><label>序号</label><input class="detail-input" id="ev-timestamp" type="number" value="' + (ev.timestamp || 0) + '"></div></div>' +

      '<div class="detail-field"><label>起因</label><textarea class="detail-textarea" id="ev-cause" rows="2">' + escapeHtml(ev.cause || '') + '</textarea></div>' +

      '<div class="detail-field"><label>经过</label><textarea class="detail-textarea" id="ev-process" rows="3">' + escapeHtml(ev.process || '') + '</textarea></div>' +

      '<div class="detail-field"><label>结果</label><textarea class="detail-textarea" id="ev-result" rows="2">' + escapeHtml(ev.result || '') + '</textarea></div>' +

      '<div class="detail-row"><div class="detail-field"><label>张力</label><input class="detail-input" id="ev-tension" type="range" min="0" max="100" value="' + (ev.tension || 50) + '"><span id="ev-tension-val">' + (ev.tension || 50) + '</span></div>' +

      '<div class="detail-field"><label>状态</label><select class="detail-input" id="ev-status"><option value="open"' + (ev.status === 'open' ? ' selected' : '') + '>进行中</option><option value="closed"' + (ev.status === 'closed' ? ' selected' : '') + '>已解决</option></select></div></div>' +

      '<div class="detail-field"><label>'+t('event.charactersHint')+'</label><input class="detail-input" id="ev-characters" value="' + escapeHtml(chars.join(', ')) + '"></div>' +

      '<div class="detail-field"><label>'+t('event.locationsHint')+'</label><input class="detail-input" id="ev-locations" value="' + escapeHtml(locs.join(', ')) + '"></div>' +

    '</div>' +

    '<div class="detail-actions">' +

      '<button class="btn-save-detail" id="ev-save-btn">' + icon('save') + ' 保存</button>' +

      (!isNew ? '<button class="btn-delete-detail" id="ev-delete-btn">' + icon('trash') + ' 删除</button>' : '') +

    '</div></div>';

}



function bindEventDetailEvents() {

  var tensionInput = document.getElementById('ev-tension');

  if (tensionInput) {

    tensionInput.addEventListener('input', function() {

      var val = document.getElementById('ev-tension-val');

      if (val) val.textContent = this.value;

    });

  }

  var saveBtn = document.getElementById('ev-save-btn');

  if (saveBtn) {

    saveBtn.addEventListener('click', function() {

      var ev = state.selectedEntity;

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

        characters: document.getElementById('ev-characters').value.split(',').map(function(s) { return s.trim(); }).filter(Boolean),

        locations: document.getElementById('ev-locations').value.split(',').map(function(s) { return s.trim(); }).filter(Boolean),

      };

      if (ev.__isNew) {

        data.bookId = state.currentBook.id;

        fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })

          .then(function(r) { return r.json(); })

          .then(function(result) { if (result.success) { state.selectedEntity = null; document.getElementById('detail-panel').classList.remove('open'); loadEventTimeline(); } });

      } else {

        fetch('/api/events/' + ev.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })

          .then(function(r) { return r.json(); })

          .then(function(result) { if (result.success) { state.selectedEntity = null; document.getElementById('detail-panel').classList.remove('open'); loadEventTimeline(); } });

      }

    });

  }

  var deleteBtn = document.getElementById('ev-delete-btn');

  if (deleteBtn) {

    deleteBtn.addEventListener('click', function() {

      if (!confirm('确认删除？')) return;

      fetch('/api/events/' + state.selectedEntity.id, { method: 'DELETE' })

        .then(function(r) { return r.json(); })

        .then(function(result) { if (result.success) { state.selectedEntity = null; document.getElementById('detail-panel').classList.remove('open'); loadEventTimeline(); } });

    });

  }

}



// ============ 女娲记忆功能 ============

async function loadNvwaData() {

  if (!state.currentBook) return;

  var root = document.getElementById('nvwa-tab-root');

  if (!root) return;

  try {

    var res = await fetch('/api/v1/works/' + state.currentBook.id + '/roles');

    var result = await res.json();

    var roles = result.success ? (result.entities || []) : [];

    if (!state.nvwaSelectedChar && roles.length > 0) state.nvwaSelectedChar = roles[0].id;



    var memoryData = {};

    for (var i = 0; i < roles.length; i++) {

      var r = roles[i];

      try {

        var mRes = await fetch('/api/memory/' + state.currentBook.id + '/' + r.id);

        var mResult = await mRes.json();

        memoryData[r.id] = mResult.success ? mResult.data : { buffer: [], core: [], recall: [], archival: [], summary: '' };

      } catch(e) { memoryData[r.id] = { buffer: [], core: [], recall: [], archival: [], summary: '' }; }

    }

    state.nvwaMemoryData = memoryData;



    var html = '<div class="nvwa-layout">';

    html += '<div class="nvwa-char-list"><div class="nvwa-section-title">选择角色</div>';

    roles.forEach(function(r) {

      html += '<div class="nvwa-char-item' + (state.nvwaSelectedChar === r.id ? ' active' : '') + '" data-id="' + r.id + '">' +

        '<div class="nvwa-char-avatar">' + icon('roles') + '</div>' +

        '<div class="nvwa-char-name">' + escapeHtml(r.title || r.name || '未命名') + '</div></div>';

    });

    html += '</div><div class="nvwa-memory-view">';

    if (state.nvwaSelectedChar) {

      var mem = memoryData[state.nvwaSelectedChar] || { buffer: [], core: [], recall: [], archival: [], summary: '' };

      var bc = (mem.buffer || []).length, cc = (mem.core || []).length, rc = (mem.recall || []).length, ac = (mem.archival || []).length;

      html += '<div class="nvwa-panel-header"><div class="nvwa-layer-stats">' +

        '<span class="nvwa-stat"><span class="nvwa-stat-num" style="color:#3b82f6;">' + bc + '</span><span class="nvwa-stat-label">缓冲</span></span>' +

        '<span class="nvwa-stat"><span class="nvwa-stat-num" style="color:#f59e0b;">' + cc + '</span><span class="nvwa-stat-label">核心</span></span>' +

        '<span class="nvwa-stat"><span class="nvwa-stat-num" style="color:#8b5cf6;">' + rc + '</span><span class="nvwa-stat-label">召回</span></span>' +

        '<span class="nvwa-stat"><span class="nvwa-stat-num" style="color:#6b7280;">' + ac + '</span><span class="nvwa-stat-label">归档</span></span>' +

        '</div><button class="nvwa-add-btn" id="nvwa-add-btn">' + icon('plus') + ' 添加记忆</button></div>';

      if (mem.summary) html += '<div class="nvwa-summary"><div class="nvwa-summary-label">角色摘要</div><div class="nvwa-summary-text">' + escapeHtml(mem.summary) + '</div></div>';

      html += '<div class="nvwa-layer-tabs">' +

        '<button class="nvwa-layer-tab active" data-layer="buffer">缓冲 (' + bc + ')</button>' +

        '<button class="nvwa-layer-tab" data-layer="core">核心 (' + cc + ')</button>' +

        '<button class="nvwa-layer-tab" data-layer="recall">召回 (' + rc + ')</button>' +

        '<button class="nvwa-layer-tab" data-layer="archival">归档 (' + ac + ')</button></div>';

      html += '<div class="nvwa-layer-content">';

      var layer = state.nvwaActiveLayer || 'buffer';

      var entries = mem[layer] || [];

      if (!entries.length) { html += '<div class="nvwa-empty-layer">此层暂无记忆</div>'; }

      else { entries.forEach(function(entry) { html += '<div class="nvwa-entry"><div class="nvwa-entry-header"><span style="color:hsl(' + (entry.importance * 9.6) + ',70%,60%);font-size:12px;">★' + entry.importance + '</span><span class="nvwa-entry-time">' + new Date(entry.timestamp || 0).toLocaleDateString() + '</span></div><div class="nvwa-entry-content">' + escapeHtml(entry.content) + '</div></div>'; }); }

      html += '</div>';

    } else { html += '<div class="nvwa-hint">请从左侧选择角色</div>'; }

    html += '</div></div>';

    root.innerHTML = html;

    bindNvwaTabEvents();

  } catch(e) { console.error('loadNvwaData error:', e); }

}



function bindNvwaTabEvents() {

  document.querySelectorAll('.nvwa-char-item').forEach(function(item) {

    item.addEventListener('click', function() { state.nvwaSelectedChar = this.dataset.id; loadNvwaData(); });

  });

  document.querySelectorAll('.nvwa-layer-tab').forEach(function(tab) {

    tab.addEventListener('click', function() {

      state.nvwaActiveLayer = this.dataset.layer;

      document.querySelectorAll('.nvwa-layer-tab').forEach(function(t) { t.classList.remove('active'); });

      this.classList.add('active');

      loadNvwaData();

    });

  });

  var addBtn = document.getElementById('nvwa-add-btn');

  if (addBtn && !addBtn.dataset.bound) {

    addBtn.dataset.bound = '1';

    addBtn.addEventListener('click', function() { showNvwaAddModal(); });

  }

}



function showNvwaAddModal() {

  var charId = state.nvwaSelectedChar;

  if (!charId) return;

  var modal = document.createElement('div');

  modal.className = 'modal-overlay open';

  modal.innerHTML = '<div class="modal-box"><div class="modal-title">添加记忆</div><div class="modal-body">' +

    '<div class="field"><label>内容</label><textarea id="nvwa-new-content" rows="5" placeholder="'+t('nvwa.memoryContent')+'"></textarea></div>' +

    '<div class="detail-row"><div class="detail-field"><label>重要性</label><input id="nvwa-new-imp" type="range" min="1" max="10" value="5"><span id="nvwa-imp-val">5</span></div>' +

    '<div class="detail-field"><label>层级</label><select id="nvwa-new-status"><option value="buffer">'+t('nvwa.buffer')+'</option><option value="core">核心记忆</option><option value="recall">召回</option><option value="archival">归档</option></select></div></div>' +

    '</div><div class="modal-actions"><button class="btn btn-primary" id="nvwa-do-add">保存</button><button class="btn btn-secondary" id="nvwa-cancel-add">取消</button></div></div>';

  document.body.appendChild(modal);

  var el=document.getElementById('nvwa-new-imp');if(el)el.addEventListener('input', function() { document.getElementById('nvwa-imp-val').textContent = this.value; });

  var el=document.getElementById('nvwa-cancel-add');if(el)el.addEventListener('click', function() { modal.remove(); });

  var el=document.getElementById('nvwa-do-add');if(el)el.addEventListener('click', function() {

    var content = document.getElementById('nvwa-new-content').value.trim();

    if (!content) { alert('请输入内容'); return; }

    fetch('/api/memory/' + state.currentBook.id + '/' + charId, {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ content: content, importance: parseInt(document.getElementById('nvwa-new-imp').value), status: document.getElementById('nvwa-new-status').value })

    }).then(function(r) { return r.json(); }).then(function(res) { if (res.success) { modal.remove(); loadNvwaData(); } });

  });

}



// ============ 长文本分析弹窗 ============

function showLongTextAnalyzeModal() {

  var modal = document.createElement('div');

  modal.className = 'modal-overlay open';

  modal.innerHTML = '<div class="modal-box" style="width:560px;"><div class="modal-title">长文本分析</div><div class="modal-body">' +

    '<div class="field"><label>粘贴文本</label><textarea id="lt-content" rows="8" placeholder="'+t('home.longTextPlaceholder')+'" style="width:100%;background:var(--bg);border:1px solid var(--border);color:var(--text);padding:10px;border-radius:6px;font-size:13px;resize:vertical;font-family:inherit;"></textarea></div>' +

    '<div class="field"><label>'+t('home.analyzeDepth')+'</label><select id="lt-depth" style="width:100%;background:var(--bg);border:1px solid var(--border);color:var(--text);padding:8px;border-radius:6px;"><option value="quick">'+t('home.quickAnalyze')+'</option><option value="normal" selected>'+t('home.normalAnalyze')+'</option><option value="deep">'+t('home.deepAnalyze')+'</option></select></div>' +

    '<div id="lt-result" style="display:none;margin-top:12px;padding:12px;background:var(--bg);border-radius:8px;max-height:300px;overflow-y:auto;font-size:13px;line-height:1.8;"></div>' +

    '</div><div class="modal-actions"><button class="btn btn-primary" id="lt-analyze-btn">分析</button><button class="btn btn-secondary" id="lt-close-btn">关闭</button></div></div>';

  document.body.appendChild(modal);

  var el=document.getElementById('lt-close-btn');if(el)el.addEventListener('click', function() { modal.remove(); });

  var el=document.getElementById('lt-analyze-btn');if(el)el.addEventListener('click', async function() {

    var content = document.getElementById('lt-content').value.trim();

    var depth = document.getElementById('lt-depth').value;

    if (!content) { alert('请输入文本'); return; }

    var btn = this;

    btn.disabled = true; btn.textContent = '分析中...';

    var resultEl = document.getElementById('lt-result');

    resultEl.style.display = 'block';

    resultEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text2);">'+t('errors.analyzing')+'...</div>';

    try {

      var res = await fetch('/api/split', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: content, depth: depth, bookId: state.currentBook ? state.currentBook.id : '' }) });

      var result = await res.json();

      if (result.success) {

        var data = result.data || {};

        var html = '<div>';

        if (data.characters && data.characters.length) html += '<div style="margin-bottom:8px;"><b style="color:var(--accent);">角色：</b>' + data.characters.join('、') + '</div>';

        if (data.locations && data.locations.length) html += '<div style="margin-bottom:8px;"><b style="color:var(--accent);">地点：</b>' + data.locations.join('、') + '</div>';

        if (data.items && data.items.length) html += '<div style="margin-bottom:8px;"><b style="color:var(--accent);">物品：</b>' + data.items.join('、') + '</div>';

        if (html === '<div>') html = '<div style="color:var(--text2);">未提取到信息</div>';

        html += '</div>';

        resultEl.innerHTML = html;

      } else { resultEl.innerHTML = '<div style="color:#ef4444;">'+t('errors.saveFailed')+'</div>'; }

    } catch(e) { resultEl.innerHTML = '<div style="color:#ef4444;">请求失败：' + e.message + '</div>'; }

    btn.disabled = false; btn.textContent = '分析';

  });

}



// ============ 初始化 ============

function init() {

  function doRender() { renderApp(); }

  if (window._i18n && window._i18n.ready) {

    doRender();

  } else {

    var _timer = setTimeout(doRender, 2000);

    window.addEventListener('i18nReady', function _h() {

      clearTimeout(_timer);

      window.removeEventListener('i18nReady', _h);

      doRender();

    });

  }



  // Listen to logger.js toolbar events for lang/theme sync

  window.addEventListener('lang-change', function(e) {

    var locale = e.detail.lang === 'en-US' ? 'en' : 'zh';

    if (window._i18n) window._i18n.setLocale(locale);

  });



  window.addEventListener('theme-change', function(e) {

    document.documentElement.setAttribute('data-theme', e.detail.theme);

  });

}

document.addEventListener('DOMContentLoaded', init);

/**

 * translate_routes.js - 前端翻译UI

 */



function renderTranslateTab() {
  return '<div class="translate-tab-root" id="translate-tab-root">' +
    '<div class="translate-header">' +
      '<div class="translate-lang-selects">' +
        '<div class="translate-select-group">' +
          '<label>' + t('translate.source') + '</label>' +
          '<select id="tl-source-lang">' +
            '<option value="zh" selected>中文</option>' +
            '<option value="en">English</option>' +
            '<option value="ja">日本語</option>' +
          '</select>' +
        '</div>' +
        '<div class="translate-arrow">→</div>' +
        '<div class="translate-select-group">' +
          '<label>' + t('translate.target') + '</label>' +
          '<select id="tl-target-lang">' +
            '<option value="en" selected>English</option>' +
            '<option value="zh">中文</option>' +
            '<option value="ja">日本語</option>' +
            '<option value="ko">한국어</option>' +
          '</select>' +
        '</div>' +
      '</div>' +
      '<div class="translate-strength-section">' +
        '<div class="translate-strength-header">' +
          '<label>' + t('translate.strength') + ': <span id="tl-strength-val">50</span></label>' +
          '<span class="translate-strength-label" id="tl-strength-label">智能适配</span>' +
        '</div>' +
        '<input type="range" id="tl-strength" min="0" max="100" value="50" class="translate-slider">' +
        '<div class="translate-strength-marks">' +
          '<span>0</span><span>20</span><span>40</span><span>60</span><span>80</span><span>100</span>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="translate-body">' +
      '<div class="translate-original-pane">' +
        '<div class="translate-pane-header">' +
          '<span>' + t('translate.original') + '</span>' +
          '<button class="btn-tl-load-book" id="tl-load-book">' + t('actions.import') + '</button>' +
        '</div>' +
        '<textarea id="tl-original-text" class="translate-textarea" placeholder="' + t('translate.originalPlaceholder') + '"></textarea>' +
        '<div class="translate-actions">' +
          '<button class="btn btn-primary" id="tl-translate-btn">' + t('translate.translateBtn') + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="translate-changes-pane">' +
        '<div class="translate-pane-header">' +
          '<span>' + t('translate.changes') + ' <span id="tl-changes-count">(0)</span></span>' +
          '<div class="tl-changes-actions">' +
            '<button class="btn btn-sm" id="tl-accept-all">' + t('translate.acceptAll') + '</button>' +
            '<button class="btn btn-sm btn-secondary" id="tl-preview-btn">' + t('translate.preview') + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="translate-changes-list" id="tl-changes-list">' +
          '<div class="translate-changes-empty">' + t('translate.noChanges') + '</div>' +
        '</div>' +
        '<div class="tl-preview-box" id="tl-preview-box" style="display:none;">' +
          '<div class="tl-preview-label">' + t('translate.previewResult') + '</div>' +
          '<div class="tl-preview-text" id="tl-preview-text"></div>' +
        '</div>' +
      '</div>' +
      '<div class="translate-result-pane">' +
        '<div class="translate-pane-header">' +
          '<span>' + t('translate.result') + '</span>' +
          '<div class="translate-result-actions">' +
            '<button class="btn btn-sm" id="tl-copy-result">' + t('actions.copy') + '</button>' +
            '<button class="btn btn-sm btn-primary" id="tl-save-version">' + t('translate.saveVersion') + '</button>' +
          '</div>' +
        '</div>' +
        '<div id="tl-result-text" class="translate-result-text"></div>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function bindTranslateTabEvents() {
  // Strength slider
  var slider = document.getElementById('tl-strength');
  var valEl = document.getElementById('tl-strength-val');
  var labelEl = document.getElementById('tl-strength-label');

  function updateStrengthLabel(v) {
    valEl.textContent = v;
    var labels = {
      basic: t('translate.basic'),
      light: t('translate.light'),
      smart: t('translate.smart'),
      deep: t('translate.deep'),
      full: t('translate.full')
    };
    var label = v < 20 ? labels.basic : v < 40 ? labels.light : v < 60 ? labels.smart : v < 80 ? labels.deep : labels.full;
    labelEl.textContent = label;
    labelEl.className = 'translate-strength-label strength-' + (v < 20 ? 'basic' : v < 40 ? 'light' : v < 60 ? 'smart' : v < 80 ? 'deep' : 'full');
  }

  if (slider) {
    slider.addEventListener('input', function() { updateStrengthLabel(this.value); });
    updateStrengthLabel(slider.value);
  }

  // Translate button
  var btn = document.getElementById('tl-translate-btn');
  if (btn && !btn.dataset.bound) {
    btn.dataset.bound = '1';
    btn.addEventListener('click', async function() {
      var text = (document.getElementById('tl-original-text') || {}).value || '';
      if (!text.trim()) { alert(t('errors.required')); return; }

      btn.disabled = true;
      btn.textContent = t('translate.translating') + '...';

      var sourceLang = (document.getElementById('tl-source-lang') || {}).value || 'zh';
      var targetLang = (document.getElementById('tl-target-lang') || {}).value || 'en';
      var strength = parseInt((document.getElementById('tl-strength') || {}).value) || 50;

      try {
        var res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, sourceLang, targetLang, strength })
        });
        var result = await res.json();

        if (result.success && result.data) {
          var data = result.data;

          // Show translated text with placeholders
          var resultEl = document.getElementById('tl-result-text');
          if (resultEl) { resultEl.textContent = data.text || ''; }

          // Show changes
          var changes = data.changes || [];
          var countEl = document.getElementById('tl-changes-count');
          if (countEl) countEl.textContent = '(' + changes.length + ')';

          var listEl = document.getElementById('tl-changes-list');
          if (listEl) {
            if (!changes.length) {
              listEl.innerHTML = '<div class="translate-changes-empty">' + t('translate.noChanges') + '</div>';
            } else {
              var typeIcons = {
                food: '🍚', festival: '🎊', greetings: '🤝', deity: '🙏',
                social_class: '👑', architecture: '🏛️', clothing: '👘', customs: '🎎', currency: '💰', era_setting: '📜', other: '✏️'
              };
              var typeNames = {
                food: t('translate.changeFood') || '食物',
                festival: t('translate.changeFestival') || '节日',
                greetings: t('translate.changeGreeting') || '问候',
                deity: t('translate.changeDeity') || '神祇',
                social_class: t('translate.changeSocial') || '社会阶层',
                architecture: t('translate.changeArchitecture') || '建筑',
                clothing: t('translate.changeClothing') || '服饰',
                customs: t('translate.changeCustom') || '习俗',
                currency: t('translate.changeCurrency') || '货币',
                era_setting: t('translate.changeEra') || '时代背景',
                other: t('translate.changeOther') || '其他'
              };
              
              listEl.innerHTML = changes.map(function(c, i) {
                var options = Array.isArray(c.options) ? c.options : (c.replacement ? [c.replacement] : []);
                var checked = c.confirmed ? 'checked' : '';
                var optionsHtml = options.map(function(opt, oi) {
                  var sel = oi === 0 ? 'selected' : '';
                  return '<option value="' + escapeHtml(opt) + '" ' + sel + '>' + escapeHtml(opt) + '</option>';
                }).join('');
                
                return '<div class="translate-change-item pending" data-index="' + i + '" id="tl-change-' + i + '">' +
                  '<div class="translate-change-header">' +
                    '<input type="checkbox" class="tl-change-check" id="tl-check-' + i + '" ' + checked + '>' +
                    '<span class="translate-change-type">' + (typeIcons[c.changeType] || '✏️') + ' ' + (typeNames[c.changeType] || c.changeType) + '</span>' +
                    '<div class="translate-change-actions">' +
                      '<button class="btn-tl-apply-change" data-i="' + i + '">' + t('translate.accept') + '</button>' +
                      '<button class="btn-tl-reject-change" data-i="' + i + '">' + t('translate.reject') + '</button>' +
                    '</div>' +
                  '</div>' +
                  '<div class="translate-change-body">' +
                    '<div class="translate-change-row">' +
                      '<span class="change-label">' + t('translate.original') + ':</span>' +
                      '<span class="original-text">' + escapeHtml(c.original) + '</span>' +
                    '</div>' +
                    '<div class="translate-change-row">' +
                      '<span class="change-label">' + t('translate.transformed') + ':</span>' +
                      '<select class="tl-change-select" id="tl-opt-' + i + '">' + optionsHtml + '</select>' +
                    '</div>' +
                    (c.context ? '<div class="translate-change-context">💡 ' + escapeHtml(c.context) + '</div>' : '') +
                  '</div>' +
                '</div>';
              }).join('');
              
              // Bind change item events
              listEl.querySelectorAll('.btn-tl-apply-change').forEach(function(b) {
                b.addEventListener('click', function() {
                  var idx = parseInt(this.dataset.i);
                  var item = document.getElementById('tl-change-' + idx);
                  var check = document.getElementById('tl-check-' + idx);
                  var select = document.getElementById('tl-opt-' + idx);
                  if (item && check && select) {
                    item.classList.remove('pending');
                    item.classList.add('confirmed');
                    check.checked = true;
                    state._pendingChanges = state._pendingChanges || [];
                    state._pendingChanges[idx] = { index: idx, original: changes[idx].original, applied: select.value, confirmed: true };
                  }
                });
              });
              
              listEl.querySelectorAll('.btn-tl-reject-change').forEach(function(b) {
                b.addEventListener('click', function() {
                  var idx = parseInt(this.dataset.i);
                  var item = document.getElementById('tl-change-' + idx);
                  var check = document.getElementById('tl-check-' + idx);
                  if (item && check) {
                    item.classList.remove('pending', 'confirmed');
                    item.classList.add('rejected');
                    check.checked = false;
                    state._pendingChanges = state._pendingChanges || [];
                    state._pendingChanges[idx] = { index: idx, original: changes[idx].original, applied: changes[idx].original, confirmed: false };
                  }
                });
              });
            }
          }

          state.currentTranslationId = data.translationId;
          state.currentTranslationText = data.text;
          state.currentTranslationChanges = changes;
          
          // Hide preview box
          var previewBox = document.getElementById('tl-preview-box');
          if (previewBox) previewBox.style.display = 'none';
        }
      } catch(e) {
        alert(t('errors.networkError') + ': ' + e.message);
      }

      btn.disabled = false;
      btn.textContent = t('translate.translateBtn');
    });
  }

  // Accept All button
  var acceptAllBtn = document.getElementById('tl-accept-all');
  if (acceptAllBtn && !acceptAllBtn.dataset.bound) {
    acceptAllBtn.dataset.bound = '1';
    acceptAllBtn.addEventListener('click', function() {
      var listEl = document.getElementById('tl-changes-list');
      if (!listEl) return;
      listEl.querySelectorAll('.translate-change-item.pending').forEach(function(item) {
        var idx = parseInt(item.dataset.index);
        var check = item.querySelector('.tl-change-check');
        var select = item.querySelector('.tl-change-select');
        if (check && select) {
          item.classList.remove('pending');
          item.classList.add('confirmed');
          check.checked = true;
          var changes = state.currentTranslationChanges || [];
          state._pendingChanges = state._pendingChanges || [];
          state._pendingChanges[idx] = { index: idx, original: changes[idx] ? changes[idx].original : '', applied: select.value, confirmed: true };
        }
      });
    });
  }

  // Preview button
  var previewBtn = document.getElementById('tl-preview-btn');
  if (previewBtn && !previewBtn.dataset.bound) {
    previewBtn.dataset.bound = '1';
    previewBtn.addEventListener('click', function() {
      var originalText = (document.getElementById('tl-result-text') || {}).textContent || '';
      var pending = state._pendingChanges || [];
      var changes = state.currentTranslationChanges || [];
      
      // Build replacement map
      var replacements = {};
      for (var i = 0; i < pending.length; i++) {
        if (pending[i] && pending[i].confirmed) {
          replacements['【' + i + '】'] = pending[i].applied;
        }
      }
      
      // Apply replacements
      var previewText = originalText;
      for (var ph in replacements) {
        previewText = previewText.split(ph).join(replacements[ph]);
      }
      // Remove unconfirmed placeholders
      previewText = previewText.replace(/【(\d+)】/g, function(m, idx) {
        return pending[idx] ? pending[idx].original : m;
      });
      
      var previewBox = document.getElementById('tl-preview-box');
      var previewTextEl = document.getElementById('tl-preview-text');
      if (previewBox && previewTextEl) {
        previewTextEl.textContent = previewText;
        previewBox.style.display = 'block';
      }
    });
  }

  // Load book content
  var loadBtn = document.getElementById('tl-load-book');
  if (loadBtn && !loadBtn.dataset.bound) {
    loadBtn.dataset.bound = '1';
    loadBtn.addEventListener('click', async function() {
      if (!state.currentBook) { alert('请先打开一本书'); return; }
      try {
        var res = await fetch('/api/events/timeline/' + state.currentBook.id);
        var result = await res.json();
        if (result.success && result.data && result.data.events) {
          var text = result.data.events.map(function(ev) {
            return (ev.chapter ? ev.chapter + ' ' : '') + ev.title + '\n' + (ev.result || ev.process || '');
          }).join('\n\n');
          var ta = document.getElementById('tl-original-text');
          if (ta) ta.value = text;
        }
      } catch(e) {
        alert(t('errors.loadFailed'));
      }
    });
  }

  // Copy result
  var copyBtn = document.getElementById('tl-copy-result');
  if (copyBtn && !copyBtn.dataset.bound) {
    copyBtn.dataset.bound = '1';
    copyBtn.addEventListener('click', function() {
      var text = (document.getElementById('tl-result-text') || {}).textContent || '';
      if (!text) return;
      navigator.clipboard.writeText(text).then(function() {
        var originalText = copyBtn.textContent;
        copyBtn.textContent = t('actions.copied') || '✓';
        setTimeout(function() { copyBtn.textContent = originalText; }, 1500);
      });
    });
  }
}
