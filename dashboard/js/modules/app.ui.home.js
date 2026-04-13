// ============ 第7部分: Tab渲染 ============
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

