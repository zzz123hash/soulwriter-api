/**
 * SoulWriter - 实体卡片系统 v2
 * 支持简单/全面两种展开模式
 */

const EntityCards = {
  // 当前状态
  state: {
    expandedCards: {}, // cardId: 'simple' | 'full'
    selectedEntity: null
  },
  
  // ============ 渲染实体卡片列表 ============
  renderEntityList(entities, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!entities || entities.length === 0) {
      container.innerHTML = this.renderEmptyState();
      return;
    }
    
    container.innerHTML = entities.map(e => this.renderEntityCard(e)).join('');
  },
  
  // ============ 渲染单个实体卡片 ============
  renderEntityCard(entity) {
    const isExpanded = this.state.expandedCards[entity.id];
    const isSimple = isExpanded === 'simple' || !isExpanded;
    const isFull = isExpanded === 'full';
    
    return `
      <div class="entity-card-v2 ${isFull ? 'expanded' : ''}" data-entity-id="${entity.id}">
        <div class="entity-card-header" onclick="EntityCards.toggleCard('${entity.id}')">
          <div class="entity-card-icon">
            ${this.getEntityIcon(entity.type)}
          </div>
          <div class="entity-card-info">
            <div class="entity-card-name">${this.escapeHtml(entity.name)}</div>
            <div class="entity-card-type">${this.getEntityTypeLabel(entity.type)}</div>
          </div>
          <div class="entity-card-expand">
            <span class="expand-icon">${isExpanded ? '−' : '+'}</span>
          </div>
        </div>
        
        <div class="entity-card-body" style="display: ${isExpanded ? 'block' : 'none'}">
          ${isSimple ? this.renderSimpleContent(entity) : this.renderFullContent(entity)}
          
          <div class="entity-card-toggle-row">
            <button class="toggle-btn ${isSimple ? 'active' : ''}" onclick="EntityCards.setExpandMode('${entity.id}', 'simple')">
              简
            </button>
            <button class="toggle-btn ${isFull ? 'active' : ''}" onclick="EntityCards.setExpandMode('${entity.id}', 'full')">
              全
            </button>
          </div>
        </div>
      </div>
    `;
  },
  
  // ============ 简单模式内容 ============
  renderSimpleContent(entity) {
    const soulData = entity.soulData ? JSON.parse(entity.soulData) : {};
    const attrs = entity.attrs ? JSON.parse(entity.attrs) : [];
    
    return `
      <div class="entity-simple-content">
        <div class="entity-desc-preview">
          ${soulData.description || entity.description || '暂无描述'}
        </div>
        ${attrs.length > 0 ? `
          <div class="entity-attrs-preview">
            ${attrs.slice(0, 3).map(a => `
              <span class="attr-tag">${this.escapeHtml(a.name)}: ${this.escapeHtml(a.value)}</span>
            `).join('')}
            ${attrs.length > 3 ? `<span class="attr-more">+${attrs.length - 3}</span>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  },
  
  // ============ 全面模式内容 ============
  renderFullContent(entity) {
    const soulData = entity.soulData ? JSON.parse(entity.soulData) : {};
    const attrs = entity.attrs ? JSON.parse(entity.attrs) : [];
    
    return `
      <div class="entity-full-content">
        <div class="entity-section">
          <div class="entity-section-title">📝 基本信息</div>
          <div class="entity-field">
            <label>名称</label>
            <span>${this.escapeHtml(entity.name)}</span>
          </div>
          <div class="entity-field">
            <label>类型</label>
            <span>${this.getEntityTypeLabel(entity.type)}</span>
          </div>
          ${entity.description ? `
            <div class="entity-field">
              <label>描述</label>
              <span>${this.escapeHtml(entity.description)}</span>
            </div>
          ` : ''}
        </div>
        
        <div class="entity-section">
          <div class="entity-section-title">💫 灵魂数据</div>
          ${soulData.personality ? `
            <div class="entity-field">
              <label>性格</label>
              <span>${this.escapeHtml(soulData.personality)}</span>
            </div>
          ` : ''}
          ${soulData.motivation ? `
            <div class="entity-field">
              <label>动机</label>
              <span>${this.escapeHtml(soulData.motivation)}</span>
            </div>
          ` : ''}
          ${soulData.conflict ? `
            <div class="entity-field">
              <label>冲突</label>
              <span>${this.escapeHtml(soulData.conflict)}</span>
            </div>
          ` : ''}
          ${soulData.growth ? `
            <div class="entity-field">
              <label>成长</label>
              <span>${this.escapeHtml(soulData.growth)}</span>
            </div>
          ` : ''}
          ${!soulData.personality && !soulData.motivation && !soulData.conflict && !soulData.growth ? `
            <div class="entity-empty">暂无灵魂数据</div>
          ` : ''}
        </div>
        
        ${attrs.length > 0 ? `
          <div class="entity-section">
            <div class="entity-section-title">📊 属性列表</div>
            <div class="entity-attrs-grid">
              ${attrs.map(a => `
                <div class="entity-attr-item">
                  <span class="attr-name">${this.escapeHtml(a.name)}</span>
                  <span class="attr-value">${this.escapeHtml(a.value)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${soulData.description ? `
          <div class="entity-section">
            <div class="entity-section-title">📖 详细描述</div>
            <div class="entity-description-full">
              ${this.escapeHtml(soulData.description).replace(/\n/g, '<br>')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  },
  
  // ============ 切换卡片展开 ============
  toggleCard(entityId) {
    const current = this.state.expandedCards[entityId];
    if (current) {
      delete this.state.expandedCards[entityId];
    } else {
      this.state.expandedCards[entityId] = 'simple';
    }
    this.updateCard(entityId);
  },
  
  // ============ 设置展开模式 ============
  setExpandMode(entityId, mode) {
    this.state.expandedCards[entityId] = mode;
    this.updateCard(entityId);
  },
  
  // ============ 更新单个卡片 ============
  updateCard(entityId) {
    const card = document.querySelector(`[data-entity-id="${entityId}"]`);
    if (!card) return;
    
    const entity = this.getEntityById(entityId);
    if (!entity) return;
    
    const newHtml = this.renderEntityCard(entity);
    card.outerHTML = newHtml;
  },
  
  // ============ 获取实体（需要从全局state获取） ============
  getEntityById(entityId) {
    if (window.AppState && window.AppState.entities) {
      return window.AppState.entities.find(e => e.id === entityId);
    }
    return null;
  },
  
  // ============ 工具函数 ============
  getEntityIcon(type) {
    const icons = {
      character: '👤',
      item: '📦',
      location: '📍',
      custom: '📎',
      event: '📅',
      faction: '🏴'
    };
    return icons[type] || '📎';
  },
  
  getEntityTypeLabel(type) {
    const labels = {
      character: '角色',
      item: '物品',
      location: '地点',
      custom: '自定义',
      event: '事件',
      faction: '势力'
    };
    return labels[type] || type;
  },
  
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },
  
  renderEmptyState() {
    return `
      <div class="entity-empty-state">
        <div class="empty-icon">📂</div>
        <div class="empty-title">暂无实体</div>
        <div class="empty-desc">点击上方按钮添加</div>
      </div>
    `;
  }
};

// ============ 添加CSS样式 ============
const entityCardCSS = `
/* Entity Cards v2 */
.entity-card-v2 {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 12px;
  overflow: hidden;
  transition: all 0.3s;
}

.entity-card-v2:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow);
}

.entity-card-v2.expanded {
  border-color: var(--primary);
}

.entity-card-header {
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  gap: 12px;
}

.entity-card-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: var(--radius-sm);
  font-size: 22px;
  flex-shrink: 0;
}

.entity-card-info {
  flex: 1;
  min-width: 0;
}

.entity-card-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.entity-card-type {
  font-size: 12px;
  color: var(--text2);
}

.entity-card-expand {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg3);
  border-radius: 50%;
  flex-shrink: 0;
}

.expand-icon {
  font-size: 18px;
  color: var(--text2);
  font-weight: bold;
}

.entity-card-body {
  padding: 0 16px 16px;
}

/* Simple Content */
.entity-simple-content {
  padding: 12px;
  background: var(--bg);
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
}

.entity-desc-preview {
  font-size: 13px;
  color: var(--text);
  line-height: 1.5;
  margin-bottom: 8px;
}

.entity-attrs-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.attr-tag {
  padding: 4px 10px;
  background: var(--bg3);
  border-radius: 12px;
  font-size: 11px;
  color: var(--text2);
}

.attr-more {
  padding: 4px 8px;
  background: var(--primary);
  border-radius: 12px;
  font-size: 11px;
  color: white;
}

/* Full Content */
.entity-full-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.entity-section {
  background: var(--bg);
  border-radius: var(--radius-sm);
  padding: 12px;
}

.entity-section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.entity-field {
  display: flex;
  margin-bottom: 8px;
  font-size: 13px;
}

.entity-field:last-child {
  margin-bottom: 0;
}

.entity-field label {
  width: 60px;
  color: var(--text2);
  flex-shrink: 0;
}

.entity-field span {
  color: var(--text);
  flex: 1;
}

.entity-empty {
  color: var(--text2);
  font-size: 13px;
  font-style: italic;
}

.entity-attrs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.entity-attr-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 10px;
  background: var(--bg2);
  border-radius: 6px;
  font-size: 12px;
}

.attr-name {
  color: var(--text2);
}

.attr-value {
  color: var(--text);
  font-weight: 500;
}

.entity-description-full {
  font-size: 13px;
  color: var(--text);
  line-height: 1.6;
}

/* Toggle Buttons */
.entity-card-toggle-row {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.toggle-btn {
  flex: 1;
  padding: 8px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text2);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: var(--bg3);
  color: var(--text);
}

.toggle-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

/* Empty State */
.entity-empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text2);
}

.entity-empty-state .empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.entity-empty-state .empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
}

.entity-empty-state .empty-desc {
  font-size: 14px;
}
`;

// 注入CSS
if (!document.getElementById('entity-cards-css')) {
  const style = document.createElement('style');
  style.id = 'entity-cards-css';
  style.textContent = entityCardCSS;
  document.head.appendChild(style);
}

// 全局访问
window.EntityCards = EntityCards;
