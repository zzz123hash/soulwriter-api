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
    case 'roles': await renderRoles(content); break;
    case 'items': await renderItems(content); break;
    case 'locations': await renderLocations(content); break;
    case 'relationships': await renderRelationships(content); break;
    case 'genesis': await renderGenesis(content); break;
    case 'nvwa': await renderNvwa(content); break;
    case 'export': await renderExport(content); break;
    default: content.innerHTML = '<div class="card"><p>功能开发中...</p></div>';
  }
}

// === 角色管理 ===
async function renderRoles(container) {
  container.innerHTML = `
    <div class="content-header">
      <h2>角色管理</h2>
      <button class="btn btn-primary" id="add-role-btn">+ 新建角色</button>
    </div>
    <div id="roles-list" class="cards-grid"></div>
  `;
  document.getElementById('add-role-btn').addEventListener('click', () => showRoleEditor());
  await loadRoles();
}

async function loadRoles() {
  const res = await api('/roles');
  state.roles = res.data || [];
  renderRolesList();
}

function renderRolesList() {
  const list = document.getElementById('roles-list');
  if (!list) return;
  if (state.roles.length === 0) {
    list.innerHTML = '<div class="card"><p>暂无角色，创建第一个吧</p></div>';
    return;
  }
  list.innerHTML = state.roles.map(role => {
    const soulPreview = role.soulMatrix 
      ? Object.entries(role.soulMatrix).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(', ')
      : '暂无灵魂设定';
    return `
      <div class="card role-card" data-id="${role.id}">
        <div class="card-header">
          <span class="card-title">${role.name}</span>
          <span class="card-badge">${role.type || '角色'}</span>
        </div>
        <p class="card-desc">${role.description || '暂无描述'}</p>
        <div class="card-soul"><span class="soul-label">灵魂:</span> ${soulPreview}</div>
      </div>
    `;
  }).join('');
}

// === 物品管理 ===
async function renderItems(container) {
  container.innerHTML = `
    <div class="content-header">
      <h2>物品管理</h2>
      <button class="btn btn-primary" id="add-item-btn">+ 新建物品</button>
    </div>
    <div id="items-list" class="cards-grid"></div>
  `;
  document.getElementById('add-item-btn').addEventListener('click', () => showItemEditor());
  await loadItems();
}

async function loadItems() {
  const res = await api('/items');
  state.items = res.data || [];
  renderItemsList();
}

const RARITY_COLORS = { common: '#9ca3af', uncommon: '#22c55e', rare: '#3b82f6', epic: '#a855f7', legendary: '#f59e0b' };

function renderItemsList() {
  const list = document.getElementById('items-list');
  if (!list) return;
  if (state.items.length === 0) {
    list.innerHTML = '<div class="card"><p>暂无物品</p></div>';
    return;
  }
  list.innerHTML = state.items.map(item => {
    const color = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;
    return `
      <div class="card item-card" data-id="${item.id}">
        <div class="card-header">
          <span class="card-title">${item.name}</span>
          <span class="card-badge" style="background: ${color}">${item.rarity || 'common'}</span>
        </div>
        <p class="card-type">类型: ${item.type || 'misc'}</p>
        <p class="card-desc">${item.description || '暂无描述'}</p>
      </div>
    `;
  }).join('');
}

// === 地点管理 ===
async function renderLocations(container) {
  container.innerHTML = `
    <div class="content-header">
      <h2>地点管理</h2>
      <button class="btn btn-primary" id="add-location-btn">+ 新建地点</button>
    </div>
    <div id="locations-list" class="cards-grid"></div>
  `;
  document.getElementById('add-location-btn').addEventListener('click', () => showLocationEditor());
  await loadLocations();
}

async function loadLocations() {
  const res = await api('/locations');
  state.locations = res.data || [];
  renderLocationsList();
}

const TYPE_ICONS = {
  city: '🏛️', town: '🏘️', village: '🏠', dungeon: '⚔️',
  building: '🏗️', room: '🚪', wilderness: '🌲', mountain: '⛰️',
  forest: '🌳', water: '🌊', generic: '📍'
};

function renderLocationsList() {
  const list = document.getElementById('locations-list');
  if (!list) return;
  if (state.locations.length === 0) {
    list.innerHTML = '<div class="card"><p>暂无地点</p></div>';
    return;
  }
  list.innerHTML = state.locations.map(loc => {
    const icon = TYPE_ICONS[loc.type] || TYPE_ICONS.generic;
    return `
      <div class="card location-card" data-id="${loc.id}">
        <div class="card-header">
          <span class="card-icon">${icon}</span>
          <span class="card-title">${loc.name}</span>
        </div>
        <p class="card-type">类型: ${loc.type || 'generic'}</p>
        <p class="card-desc">${loc.description || '暂无描述'}</p>
      </div>
    `;
  }).join('');
}

// === 占位视图 ===
async function renderRelationships(c) { c.innerHTML = '<div class="card"><h3>关系图谱</h3><p>3D关系图谱开发中...</p></div>'; }
async function renderGenesis(c) { c.innerHTML = '<div class="card"><h3>创世树</h3><p>创世树开发中...</p></div>'; }
async function renderNvwa(c) { c.innerHTML = '<div class="card"><h3>女娲推演</h3><p>女娲推演引擎开发中...</p></div>'; }
async function renderExport(c) { c.innerHTML = '<div class="card"><h3>导出</h3><p>导出功能开发中...</p></div>'; }

// === 编辑器模态框 ===
function showRoleEditor(role = null) {
  const isEdit = !!role;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header"><h3>${isEdit ? '编辑角色' : '新建角色'}</h3><button class="modal-close">×</button></div>
      <form class="modal-body">
        <div class="form-group"><label>名称</label><input type="text" name="name" class="input" value="${role?.name || ''}" required></div>
        <div class="form-group"><label>类型</label>
          <select name="type" class="input">
            <option value="protagonist">主角</option><option value="supporting">配角</option>
            <option value="antagonist">反派</option><option value="minor">龙套</option>
          </select>
        </div>
        <div class="form-group"><label>描述</label><textarea name="description" class="input" rows="2">${role?.description || ''}</textarea></div>
        <div class="form-actions">
          <button type="button" class="btn" data-action="cancel">取消</button>
          <button type="submit" class="btn btn-primary">保存</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('[data-action="cancel"]').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = { name: e.target.name.value, type: e.target.type.value, description: e.target.description.value };
    if (isEdit) { await api('/roles/' + role.id, { method: 'PUT', body: JSON.stringify(data) }); }
    else { await api('/roles', { method: 'POST', body: JSON.stringify(data) }); }
    modal.remove();
    await loadRoles();
  });
}

function showItemEditor(item = null) {
  const isEdit = !!item;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header"><h3>${isEdit ? '编辑物品' : '新建物品'}</h3><button class="modal-close">×</button></div>
      <form class="modal-body">
        <div class="form-group"><label>名称</label><input type="text" name="name" class="input" value="${item?.name || ''}" required></div>
        <div class="form-group"><label>类型</label>
          <select name="type" class="input">
            <option value="weapon">武器</option><option value="armor">防具</option>
            <option value="potion">药水</option><option value="accessory">饰品</option>
            <option value="material">材料</option><option value="key_item">关键物品</option>
            <option value="misc">杂物</option>
          </select>
        </div>
        <div class="form-group"><label>稀有度</label>
          <select name="rarity" class="input">
            <option value="common">普通</option><option value="uncommon">优秀</option>
            <option value="rare">稀有</option><option value="epic">史诗</option>
            <option value="legendary">传说</option>
          </select>
        </div>
        <div class="form-group"><label>描述</label><textarea name="description" class="input" rows="2">${item?.description || ''}</textarea></div>
        <div class="form-actions">
          <button type="button" class="btn" data-action="cancel">取消</button>
          <button type="submit" class="btn btn-primary">保存</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('[data-action="cancel"]').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = { name: e.target.name.value, type: e.target.type.value, rarity: e.target.rarity.value, description: e.target.description.value };
    if (isEdit) { await api('/items/' + item.id, { method: 'PUT', body: JSON.stringify(data) }); }
    else { await api('/items', { method: 'POST', body: JSON.stringify(data) }); }
    modal.remove();
    await loadItems();
  });
}

function showLocationEditor(location = null) {
  const isEdit = !!location;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header"><h3>${isEdit ? '编辑地点' : '新建地点'}</h3><button class="modal-close">×</button></div>
      <form class="modal-body">
        <div class="form-group"><label>名称</label><input type="text" name="name" class="input" value="${location?.name || ''}" required></div>
        <div class="form-group"><label>类型</label>
          <select name="type" class="input">
            <option value="city">🏛️ 城市</option><option value="town">🏘️ 城镇</option>
            <option value="village">🏠 村庄</option><option value="dungeon">⚔️ 地下城</option>
            <option value="building">🏗️ 建筑</option><option value="room">🚪 房间</option>
            <option value="wilderness">🌲 荒野</option><option value="mountain">⛰️ 山脉</option>
            <option value="forest">🌳 森林</option><option value="water">🌊 水域</option>
            <option value="generic">📍 其他</option>
          </select>
        </div>
        <div class="form-group"><label>描述</label><textarea name="description" class="input" rows="2">${location?.description || ''}</textarea></div>
        <div class="form-actions">
          <button type="button" class="btn" data-action="cancel">取消</button>
          <button type="submit" class="btn btn-primary">保存</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('[data-action="cancel"]').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = { name: e.target.name.value, type: e.target.type.value, description: e.target.description.value };
    if (isEdit) { await api('/locations/' + location.id, { method: 'PUT', body: JSON.stringify(data) }); }
    else { await api('/locations', { method: 'POST', body: JSON.stringify(data) }); }
    modal.remove();
    await loadLocations();
  });
}

// === 初始化 ===
async function init() {
  console.log('🚀 绘梦 SoulWriter Dashboard 启动');
  renderSidebar();
  await renderContent();
}

document.addEventListener('DOMContentLoaded', init);
