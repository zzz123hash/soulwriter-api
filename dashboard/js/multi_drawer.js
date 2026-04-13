/**
 * SoulWriter - 多级悬浮抽屉导航系统
 * 
 * 设计：
 * - 一级抽屉：左侧固定导航
 * - 二级抽屉：一级右侧悬浮，点击一级时展开在一级右侧
 * - 三级抽屉：二级右侧悬浮，点击二级时展开
 * - 四级详情：右侧弹出面板，可放大/缩小/移动
 */

const MultiDrawer = {
  // 状态
  state: {
    level1Collapsed: false,
    level2Open: false,
    level3Open: false,
    level4Entity: null,
    activePath: [] // [一级id, 二级id, 三级id]
  },

  // 渲染一级导航
  renderLevel1() {
    const collapsed = this.state.level1Collapsed;
    const width = collapsed ? 48 : 200;
    
    return `
      <div class="drawer-level1 ${collapsed ? 'collapsed' : ''}" id="drawer-level1" style="width: ${width}px">
        <div class="drawer-l1-header">
          ${collapsed ? '<button class="drawer-expand-btn" onclick="MultiDrawer.expandLevel1()">▶</button>' : ''}
          <span class="drawer-l1-title">${collapsed ? '' : '导航'}</span>
          ${!collapsed ? '<button class="drawer-collapse-btn" onclick="MultiDrawer.collapseLevel1()">◀</button>' : ''}
        </div>
        <nav class="drawer-l1-nav">
          ${NAV_TREE.map(group => `
            <div class="drawer-l1-item ${group.children ? 'has-children' : ''}" 
                 data-group="${group.id}"
                 onclick="MultiDrawer.clickLevel1('${group.id}')">
              <span class="drawer-l1-icon">${icon(group.icon) || '📁'}</span>
              ${!collapsed ? `<span class="drawer-l1-label">${group.label}</span>` : ''}
              ${!collapsed && group.children ? '<span class="drawer-l1-arrow">▶</span>' : ''}
            </div>
          `).join('')}
        </nav>
      </div>
    `;
  },

  // 渲染二级抽屉
  renderLevel2(parentId) {
    const group = NAV_TREE.find(g => g.id === parentId);
    if (!group || !group.children) return '';

    return `
      <div class="drawer-level2" id="drawer-level2">
        <div class="drawer-l2-header">
          <span class="drawer-l2-title">${group.label}</span>
          <button class="drawer-l2-close" onclick="MultiDrawer.closeLevel2()">×</button>
        </div>
        <div class="drawer-l2-items">
          ${group.children.map(child => `
            <div class="drawer-l2-item ${child.children ? 'has-children' : ''}"
                 data-id="${child.id}"
                 onclick="MultiDrawer.clickLevel2('${child.id}', '${parentId}')">
              <span class="drawer-l2-icon">${icon(child.icon) || '📄'}</span>
              <span class="drawer-l2-label">${child.label}</span>
              ${child.children ? '<span class="drawer-l2-arrow">▶</span>' : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // 渲染三级抽屉
  renderLevel3(parentId, childId) {
    const group = NAV_TREE.find(g => g.id === parentId);
    if (!group || !group.children) return '';
    
    const child = group.children.find(c => c.id === childId);
    if (!child || !child.children) return '';

    return `
      <div class="drawer-level3" id="drawer-level3">
        <div class="drawer-l3-header">
          <span class="drawer-l3-title">${child.label}</span>
          <button class="drawer-l3-close" onclick="MultiDrawer.closeLevel3()">×</button>
        </div>
        <div class="drawer-l3-items">
          ${child.children.map(sub => `
            <div class="drawer-l3-item"
                 data-id="${sub.id}"
                 onclick="MultiDrawer.clickLevel3('${sub.id}', '${childId}')">
              <span class="drawer-l3-icon">${icon(sub.icon) || '📋'}</span>
              <span class="drawer-l3-label">${sub.label}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // 点击一级项目
  clickLevel1(groupId) {
    const group = NAV_TREE.find(g => g.id === groupId);
    if (!group || !group.children) {
      // 没有子项目，切换到对应Tab
      state.currentTab = groupId;
      this.closeAllLevels();
      return;
    }

    // 展开二级抽屉
    this.state.level2Open = true;
    this.state.activePath = [groupId];
    
    const level1 = document.getElementById('drawer-level1');
    if (level1) level1.classList.add('with-level2');

    this.renderDrawer();
  },

  // 点击二级项目
  clickLevel2(childId, parentId) {
    const group = NAV_TREE.find(g => g.id === parentId);
    if (!group) return;
    
    const child = group.children.find(c => c.id === childId);
    if (!child) return;

    if (child.children) {
      // 有子项目，展开三级
      this.state.level3Open = true;
      this.state.activePath = [parentId, childId];
      this.renderDrawer();
    } else {
      // 没有子项目，加载内容
      state.currentEntity = childId;
      state.currentTab = 'home';
      this.closeLevel3();
      this.closeLevel2();
      this.renderMainContent();
    }
  },

  // 点击三级项目
  clickLevel3(subId, parentId) {
    // 加载对应实体的列表
    state.currentEntity = subId;
    state.currentTab = 'home';
    this.renderMainContent();
  },

  // 折叠一级
  collapseLevel1() {
    this.state.level1Collapsed = true;
    this.renderDrawer();
  },

  // 展开一级
  expandLevel1() {
    this.state.level1Collapsed = false;
    this.renderDrawer();
  },

  // 关闭二级
  closeLevel2() {
    this.state.level2Open = false;
    this.state.level3Open = false;
    this.state.activePath = [];
    this.renderDrawer();
  },

  // 关闭三级
  closeLevel3() {
    this.state.level3Open = false;
    this.state.activePath = this.state.activePath.slice(0, 1);
    this.renderDrawer();
  },

  // 关闭所有
  closeAllLevels() {
    this.state.level2Open = false;
    this.state.level3Open = false;
    this.renderDrawer();
  },

  // 渲染整个抽屉系统
  renderDrawer() {
    const container = document.getElementById('multi-drawer-container');
    if (!container) return;

    let html = this.renderLevel1();
    
    if (this.state.level2Open) {
      const parentId = this.state.activePath[0];
      html += this.renderLevel2(parentId);
    }
    
    if (this.state.level3Open && this.state.activePath.length >= 2) {
      const parentId = this.state.activePath[0];
      const childId = this.state.activePath[1];
      html += this.renderLevel3(parentId, childId);
    }

    container.innerHTML = html;
  },

  // 渲染主内容区
  renderMainContent() {
    const canvas = document.getElementById('tab-canvas');
    if (canvas) {
      canvas.innerHTML = renderTabContent();
      bindTabContentEvents();
    }
  },

  // 打开四级详情
  openLevel4(entityType, entityId) {
    this.state.level4Entity = { type: entityType, id: entityId };
    this.renderLevel4();
  },

  // 关闭四级详情
  closeLevel4() {
    this.state.level4Entity = null;
    const panel = document.getElementById('drawer-level4');
    if (panel) panel.classList.remove('open');
  },

  // 渲染四级详情面板
  renderLevel4() {
    let container = document.getElementById('drawer-level4');
    if (!container) {
      container = document.createElement('div');
      container.id = 'drawer-level4';
      container.className = 'drawer-level4';
      document.querySelector('.main-canvas').appendChild(container);
    }

    const { type, id } = this.state.level4Entity;
    const entity = state[type]?.find(e => e.id === id);
    if (!entity) return;

    container.innerHTML = `
      <div class="drawer-l4-header">
        <span class="drawer-l4-title">${entity.title || entity.name}</span>
        <div class="drawer-l4-controls">
          <button class="drawer-l4-btn" onclick="MultiDrawer.resizeLevel4('smaller')">−</button>
          <button class="drawer-l4-btn" onclick="MultiDrawer.resizeLevel4('larger')">+</button>
          <button class="drawer-l4-btn close" onclick="MultiDrawer.closeLevel4()">×</button>
        </div>
      </div>
      <div class="drawer-l4-body">
        <div class="drawer-l4-field">
          <label>名称</label>
          <input type="text" value="${entity.title || entity.name}">
        </div>
        <div class="drawer-l4-field">
          <label>描述</label>
          <textarea rows="4">${entity.description || ''}</textarea>
        </div>
      </div>
    `;
    container.classList.add('open');
  },

  // 调整四级面板大小
  resizeLevel4(action) {
    const panel = document.getElementById('drawer-level4');
    if (!panel) return;
    
    const current = parseInt(panel.style.width) || 360;
    if (action === 'larger') {
      panel.style.width = Math.min(current + 50, 600) + 'px';
    } else {
      panel.style.width = Math.max(current - 50, 200) + 'px';
    }
  },

  // 初始化
  init() {
    this.renderDrawer();
  }
};
