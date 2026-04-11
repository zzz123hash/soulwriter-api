/**
 * RoleCard - 角色卡片组件
 */

export function createRoleCard(role) {
  const card = document.createElement('div');
  card.className = 'card role-card';
  card.dataset.id = role.id;
  
  // 灵魂矩阵简略显示
  const soulPreview = role.soulMatrix 
    ? Object.entries(role.soulMatrix).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(', ')
    : '暂无灵魂设定';
  
  card.innerHTML = `
    <div class="card-header">
      <span class="card-title">${role.name}</span>
      <span class="card-badge">${role.type || '角色'}</span>
    </div>
    <div class="card-body">
      <p class="card-desc">${role.description || '暂无描述'}</p>
      <div class="card-soul">
        <span class="soul-label">灵魂:</span>
        <span class="soul-value">${soulPreview}</span>
      </div>
    </div>
    <div class="card-footer">
      <button class="btn-edit" data-action="edit">编辑</button>
      <button class="btn-delete" data-action="delete">删除</button>
    </div>
  `;
  
  return card;
}

export function createRoleEditor(role = null) {
  const isEdit = !!role;
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${isEdit ? '编辑角色' : '新建角色'}</h3>
        <button class="modal-close" data-action="close">×</button>
      </div>
      <form class="modal-body">
        <div class="form-group">
          <label>名称</label>
          <input type="text" name="name" class="input" value="${role?.name || ''}" required>
        </div>
        <div class="form-group">
          <label>类型</label>
          <select name="type" class="input">
            <option value="protagonist" ${role?.type === 'protagonist' ? 'selected' : ''}>主角</option>
            <option value="supporting" ${role?.type === 'supporting' ? 'selected' : ''}>配角</option>
            <option value="antagonist" ${role?.type === 'antagonist' ? 'selected' : ''}>反派</option>
            <option value="minor" ${role?.type === 'minor' ? 'selected' : ''}>配角</option>
          </select>
        </div>
        <div class="form-group">
          <label>描述</label>
          <textarea name="description" class="input" rows="3">${role?.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label>灵魂矩阵 (JSON)</label>
          <textarea name="soulMatrix" class="input" rows="4" placeholder={core: 勇敢, fear: 死亡}>${role?.soulMatrix ? JSON.stringify(role.soulMatrix, null, 2) : ''}</textarea>
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

// 导出
window.RoleCard = { createRoleCard, createRoleEditor };
