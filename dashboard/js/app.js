/**
 * SoulWriter Dashboard - 主应用
 */

// === 状态管理 ===
const state = {
  currentView: 'roles',
  currentProject: null,
  roles: [],
  items: [],
  locations: []
};

// === API基础 ===
const API_BASE = 'http://localhost:3000/api/v1';

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

// === 侧边栏渲染 ===
function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.innerHTML = `
    <div class="sidebar-section">
      <div class="sidebar-title">导航</div>
      <div class="sidebar-item ${state.currentView === 'roles' ? 'active' : ''}" data-view="roles">📁 角色</div>
      <div class="sidebar-item ${state.currentView === 'items' ? 'active' : ''}" data-view="items">🎁 物品</div>
      <div class="sidebar-item ${state.currentView === 'locations' ? 'active' : ''}" data-view="locations">📍 地点</div>
      <div class="sidebar-item ${state.currentView === 'relationships' ? 'active' : ''}" data-view="relationships">🔗 关系</div>
    </div>
    <div class="sidebar-section">
      <div class="sidebar-title">创作</div>
      <div class="sidebar-item ${state.currentView === 'genesis' ? 'active' : ''}" data-view="genesis">🌳 创世树</div>
      <div class="sidebar-item ${state.currentView === 'nvwa' ? 'active' : ''}" data-view="nvwa">🔮 女娲推演</div>
    </div>
    <div class="sidebar-section">
      <div class="sidebar-title">工具</div>
      <div class="sidebar-item ${state.currentView === 'export' ? 'active' : ''}" data-view="export">📤 导出</div>
    </div>
  `;
  
  // 绑定事件
  sidebar.querySelectorAll('[data-view]').forEach(el => {
    el.addEventListener('click', () => {
      state.currentView = el.dataset.view;
      renderSidebar();
      renderContent();
    });
  });
}

// === 内容区渲染 ===
async function renderContent() {
  const content = document.getElementById('content');
  
  switch (state.currentView) {
    case 'roles':
      await renderRoles(content);
      break;
    case 'items':
      await renderItems(content);
      break;
    case 'locations':
      await renderLocations(content);
      break;
    case 'relationships':
      await renderRelationships(content);
      break;
    case 'genesis':
      await renderGenesis(content);
      break;
    case 'nvwa':
      await renderNvwa(content);
      break;
    case 'export':
      await renderExport(content);
      break;
    default:
      content.innerHTML = '<div class="card"><p>功能开发中...</p></div>';
  }
}

// === 角色列表 ===
async function renderRoles(container) {
  container.innerHTML = `
    <div class="content-header">
      <h2>角色管理</h2>
      <button class="btn btn-primary" id="add-role-btn">+ 新建角色</button>
    </div>
    <div id="roles-list" class="cards-grid"></div>
  `;
  
  document.getElementById('add-role-btn').addEventListener('click', () => {
    showRoleEditor();
  });
  
  await loadRoles();
}

// === 加载角色 ===
async function loadRoles() {
  const res = await api('/roles');
  state.roles = res.data || [];
  renderRolesList();
}

function renderRolesList() {
  const list = document.getElementById('roles-list');
  if (!list) return;
  
  if (state.roles.length === 0) {
    list.innerHTML = '<div class="card"><p>暂无角色，创建一个吧</p></div>';
    return;
  }
  
  list.innerHTML = state.roles.map(role => `
    <div class="card role-card" data-id="${role.id}">
      <div class="card-title">${role.name}</div>
      <div class="card-meta">${role.description || '暂无描述'}</div>
    </div>
  `).join('');
}

// === 物品列表 ===
async function renderItems(container) {
  container.innerHTML = `
    <div class="content-header">
      <h2>物品管理</h2>
      <button class="btn btn-primary" id="add-item-btn">+ 新建物品</button>
    </div>
    <div id="items-list" class="cards-grid"></div>
  `;
  
  document.getElementById('add-item-btn').addEventListener('click', () => {
    showItemEditor();
  });
  
  await loadItems();
}

async function loadItems() {
  const res = await api('/items');
  state.items = res.data || [];
  renderItemsList();
}

function renderItemsList() {
  const list = document.getElementById('items-list');
  if (!list) return;
  
  if (state.items.length === 0) {
    list.innerHTML = '<div class="card"><p>暂无物品</p></div>';
    return;
  }
  
  list.innerHTML = state.items.map(item => `
    <div class="card item-card" data-id="${item.id}">
      <div class="card-title">${item.name}</div>
      <div class="card-meta">类型: ${item.type}</div>
    </div>
  `).join('');
}

// === 地点列表 ===
async function renderLocations(container) {
  container.innerHTML = `
    <div class="content-header">
      <h2>地点管理</h2>
      <button class="btn btn-primary" id="add-location-btn">+ 新建地点</button>
    </div>
    <div id="locations-list" class="cards-grid"></div>
  `;
  
  document.getElementById('add-location-btn').addEventListener('click', () => {
    showLocationEditor();
  });
  
  await loadLocations();
}

async function loadLocations() {
  const res = await api('/locations');
  state.locations = res.data || [];
  renderLocationsList();
}

function renderLocationsList() {
  const list = document.getElementById('locations-list');
  if (!list) return;
  
  if (state.locations.length === 0) {
    list.innerHTML = '<div class="card"><p>暂无地点</p></div>';
    return;
  }
  
  list.innerHTML = state.locations.map(loc => `
    <div class="card location-card" data-id="${loc.id}">
      <div class="card-title">${loc.name}</div>
      <div class="card-meta">类型: ${loc.type}</div>
    </div>
  `).join('');
}

// === 关系图谱 ===
async function renderRelationships(container) {
  container.innerHTML = `
    <div class="content-header">
      <h2>关系图谱</h2>
    </div>
    <div class="card">
      <p>3D关系图谱开发中...</p>
      <p>将显示角色、物品、地点之间的关系</p>
    </div>
  `;
}

// === 创世树 ===
async function renderGenesis(container) {
  container.innerHTML = `
    <div class="content-header">
      <h2>创世树</h2>
      <button class="btn btn-primary">+ 新建节点</button>
    </div>
    <div class="card">
      <p>创世树开发中...</p>
    </div>
  `;
}

// === 女娲推演 ===
async function renderNvwa(container) {
  container.innerHTML = `
    <div class="content-header">
      <h2>女娲推演</h2>
    </div>
    <div class="card">
      <p>女娲推演引擎开发中...</p>
      <p>支持角色行为预测、剧情演变</p>
    </div>
  `;
}

// === 导出 ===
async function renderExport(container) {
  container.innerHTML = `
    <div class="content-header">
      <h2>导出</h2>
    </div>
    <div class="card">
      <p>导出功能开发中...</p>
      <p>支持TXT、JSON、Markdown、脚本格式</p>
    </div>
  `;
}

// === 占位函数 ===
function showRoleEditor() { alert('角色编辑器开发中...'); }
function showItemEditor() { alert('物品编辑器开发中...'); }
function showLocationEditor() { alert('地点编辑器开发中...'); }

// === 初始化 ===
async function init() {
  console.log('🚀 绘梦 SoulWriter Dashboard 启动');
  renderSidebar();
  await renderContent();
}

document.addEventListener('DOMContentLoaded', init);
export { state, api };
