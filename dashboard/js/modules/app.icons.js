// ============ 第2部分: 图标和工具函数 ============
function icon(name) { return Icons[name] || ''; }

var Icons = {
  compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
  event: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  world: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>',
  create: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>',
  lightbulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>',
  tools: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
  roles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  items: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',
  locations: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
  units: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  api: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  parse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  style: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>',
  thoughts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  inspiration: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  notes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  relationships: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  summary: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>',
  presets: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
  novel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  chevronDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>',
  chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>'
};



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

        '<button class="book-tab ' + (state.currentTab === 'home' ? 'active' : '') + '" data-tab="home">导航页</button>' +

        '<button class="book-tab ' + (state.currentTab === 'genesis' ? 'active' : '') + '" data-tab="genesis">创世树</button>' +

        '<button class="book-tab ' + (state.currentTab === 'event' ? 'active' : '') + '" data-tab="event">事件线</button>' +

        '<button class="book-tab ' + (state.currentTab === 'nvwa' ? 'active' : '') + '" data-tab="nvwa">女娲推演</button>' +

        '<button class="book-tab ' + (state.currentTab === 'translate' ? 'active' : '') + '" data-tab="translate">语种转义</button>' +

        '<button class="book-tab ' + (state.currentTab === 'novel' ? 'active' : '') + '" data-tab="novel">小说/剧本</button>' +
        '<button class="book-tab ' + (state.currentTab === 'analysis' ? 'active' : '') + '" data-tab="analysis">合册分析</button>' +

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
    case 'analysis-settings': return renderSettingsTab();

    case 'event': return renderEventTab();

    case 'nvwa': return renderNvwaTab();

    case 'translate': return renderTranslateTab();

    case 'novel': return renderNovelTab();

    case 'analysis': return renderAnalysisTab();

    default: return renderHomeTab();

  }

}



function renderGenesisTab() {
  // GenesisTree v2 - 科技树/星盘结构
  return '<div class="genesis-tree-container">' +
    '<div id="genesis-canvas" class="genesis-canvas"></div>' +
    '<div id="genesis-detail-panel" class="genesis-detail-panel">' +
      '<div style="padding:20px;text-align:center;color:var(--text2);">' +
        '<div style="font-size:2em;margin-bottom:8px;">🌟</div>' +
        '<p style="margin:0;">点击节点查看详情</p>' +
        '<p style="font-size:12px;margin-top:8px;">双击空白处添加节点</p>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function renderNovelTab() {

  return '<div style="padding:40px;text-align:center;color:var(--text2);"><div style="font-size:2em;margin-bottom:12px;">' + icon('novel') + '</div><div style="margin-bottom:8px;">小说视图</div><div style="font-size:12px;">功能开发中...</div></div>';

}


function renderAnalysisTab() {
  return '<div class="analysis-tab-root">' +
    '<div class="analysis-header">' +
      '<h2>📊 合册分析</h2>' +
    '</div>' +
    '<div class="analysis-grid">' +
      '<div class="analysis-card" onclick="AnalysisSystem.analyze(\'character\')">' +
        '<div class="card-icon">📚</div>' +
        '<div class="card-title">角色分析</div>' +
        '<div class="card-desc">角色性格、关系、成长曲线</div>' +
      '</div>' +
      '<div class="analysis-card" onclick="AnalysisSystem.analyze(\'plot\')">' +
        '<div class="card-icon">📖</div>' +
        '<div class="card-title">剧情分析</div>' +
        '<div class="card-desc">情节结构、张力曲线、节奏</div>' +
      '</div>' +
      '<div class="analysis-card" onclick="AnalysisSystem.analyze(\'world\')">' +
        '<div class="card-icon">🌍</div>' +
        '<div class="card-title">世界观</div>' +
        '<div class="card-desc">设定一致性、逻辑自洽</div>' +
      '</div>' +
      '<div class="analysis-card" onclick="AnalysisSystem.analyze(\'style\')">' +
        '<div class="card-icon">🎭</div>' +
        '<div class="card-title">风格分析</div>' +
        '<div class="card-desc">写作风格、语言特点</div>' +
      '</div>' +
    '</div>' +
  '</div>';
}



// ============ 分层导航树 ============

