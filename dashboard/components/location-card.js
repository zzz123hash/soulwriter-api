/**
 * LocationCard - 地点卡片组件
 */

const TYPE_ICONS = {
  city: '🏛️',
  town: '🏘️',
  village: '🏠',
  dungeon: '⚔️',
  building: '🏗️',
  room: '🚪',
  wilderness: '🌲',
  mountain: '⛰️',
  forest: '🌳',
  water: '🌊',
  cavern: '🕳️',
  temple: '⛩️',
  market: '🏪',
  portal: '🌀',
  generic: '📍'
};

export function createLocationCard(location) {
  const card = document.createElement('div');
  card.className = 'card location-card';
  card.dataset.id = location.id;
  
  const icon = TYPE_ICONS[location.type] || TYPE_ICONS.generic;
  
  card.innerHTML = `
    <div class="card-header">
      <span class="card-icon">${icon}</span>
      <span class="card-title">${location.name}</span>
    </div>
    <div class="card-body">
      <p class="card-type">类型: ${location.type || 'generic'}</p>
      <p class="card-desc">${location.description || '暂无描述'}</p>
    </div>
    <div class="card-footer">
      <button class="btn-edit" data-action="edit">编辑</button>
      <button class="btn-delete" data-action="delete">删除</button>
    </div>
  `;
  
  return card;
}

export function createLocationEditor(location = null) {
  const isEdit = !!location;
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${isEdit ? '编辑地点' : '新建地点'}</h3>
        <button class="modal-close" data-action="close">×</button>
      </div>
      <form class="modal-body">
        <div class="form-group">
          <label>名称</label>
          <input type="text" name="name" class="input" value="${location?.name || ''}" required>
        </div>
        <div class="form-group">
          <label>类型</label>
          <select name="type" class="input">
            <option value="city" ${location?.type === 'city' ? 'selected' : ''}>🏛️ 城市</option>
            <option value="town" ${location?.type === 'town' ? 'selected' : ''}>🏘️ 城镇</option>
            <option value="village" ${location?.type === 'village' ? 'selected' : ''}>🏠 村庄</option>
            <option value="dungeon" ${location?.type === 'dungeon' ? 'selected' : ''}>⚔️ 地下城</option>
            <option value="building" ${location?.type === 'building' ? 'selected' : ''}>🏗️ 建筑</option>
            <option value="room" ${location?.type === 'room' ? 'selected' : ''}>🚪 房间</option>
            <option value="wilderness" ${location?.type === 'wilderness' ? 'selected' : ''}>🌲 荒野</option>
            <option value="mountain" ${location?.type === 'mountain' ? 'selected' : ''}>⛰️ 山脉</option>
            <option value="forest" ${location?.type === 'forest' ? 'selected' : ''}>🌳 森林</option>
            <option value="water" ${location?.type === 'water' ? 'selected' : ''}>🌊 水域</option>
            <option value="generic" ${location?.type === 'generic' || !location ? 'selected' : ''}>📍 其他</option>
          </select>
        </div>
        <div class="form-group">
          <label>描述</label>
          <textarea name="description" class="input" rows="3">${location?.description || ''}</textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" data-action="cancel">取消</button>
          <button type="submit" class="btn btn-primary">保存</button>
        </div>
      </form>
    </div>
  `;
  
  return modal;
}

window.LocationCard = { createLocationCard, createLocationEditor, TYPE_ICONS };
