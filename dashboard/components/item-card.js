/**
 * ItemCard - 物品卡片组件
 */

const RARITY_COLORS = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b'
};

export function createItemCard(item) {
  const card = document.createElement('div');
  card.className = 'card item-card';
  card.dataset.id = item.id;
  
  const rarityColor = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;
  
  card.innerHTML = `
    <div class="card-header">
      <span class="card-title">${item.name}</span>
      <span class="card-badge" style="background: ${rarityColor}">${item.rarity || 'common'}</span>
    </div>
    <div class="card-body">
      <p class="card-type">类型: ${item.type || 'misc'}</p>
      <p class="card-desc">${item.description || '暂无描述'}</p>
    </div>
    <div class="card-footer">
      <button class="btn-edit" data-action="edit">编辑</button>
      <button class="btn-delete" data-action="delete">删除</button>
    </div>
  `;
  
  return card;
}

export function createItemEditor(item = null) {
  const isEdit = !!item;
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${isEdit ? '编辑物品' : '新建物品'}</h3>
        <button class="modal-close" data-action="close">×</button>
      </div>
      <form class="modal-body">
        <div class="form-group">
          <label>名称</label>
          <input type="text" name="name" class="input" value="${item?.name || ''}" required>
        </div>
        <div class="form-group">
          <label>类型</label>
          <select name="type" class="input">
            <option value="weapon" ${item?.type === 'weapon' ? 'selected' : ''}>武器</option>
            <option value="armor" ${item?.type === 'armor' ? 'selected' : ''}>防具</option>
            <option value="potion" ${item?.type === 'potion' ? 'selected' : ''}>药水</option>
            <option value="accessory" ${item?.type === 'accessory' ? 'selected' : ''}>饰品</option>
            <option value="material" ${item?.type === 'material' ? 'selected' : ''}>材料</option>
            <option value="key_item" ${item?.type === 'key_item' ? 'selected' : ''}>关键物品</option>
            <option value="misc" ${item?.type === 'misc' || !item ? 'selected' : ''}>杂物</option>
          </select>
        </div>
        <div class="form-group">
          <label>稀有度</label>
          <select name="rarity" class="input">
            <option value="common" ${item?.rarity === 'common' || !item ? 'selected' : ''}>普通</option>
            <option value="uncommon" ${item?.rarity === 'uncommon' ? 'selected' : ''}>优秀</option>
            <option value="rare" ${item?.rarity === 'rare' ? 'selected' : ''}>稀有</option>
            <option value="epic" ${item?.rarity === 'epic' ? 'selected' : ''}>史诗</option>
            <option value="legendary" ${item?.rarity === 'legendary' ? 'selected' : ''}>传说</option>
          </select>
        </div>
        <div class="form-group">
          <label>描述</label>
          <textarea name="description" class="input" rows="3">${item?.description || ''}</textarea>
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

window.ItemCard = { createItemCard, createItemEditor, RARITY_COLORS };
