/**
 * SoulWriter - 层级抽屉系统 JS
 * 
 * 实现：
 * - 左侧一级菜单（+前缀）
 * - 右侧二级菜单（++前缀，点击一级后滑出）
 * - 详情弹窗
 */

// ============================================
// 导航数据结构
// ============================================

const NAV_STRUCTURE = {
  items: [
    {
      id: 'nav',
      label: '导航',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>',
      children: [
        { id: 'roles', label: '角色', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
        { id: 'items', label: '物品', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>' },
        { id: 'locations', label: '地点', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' },
        { id: 'custom', label: '自定义', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' }
      ]
    },
    {
      id: 'plot',
      label: '剧情',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
      children: [
        { id: 'events', label: '事件', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
        { id: 'chapters', label: '章节', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' }
      ]
    },
    {
      id: 'background',
      label: '背景',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
      children: [
        { id: 'settings', label: '设定', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>' },
        { id: 'worldview', label: '世界观', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' }
      ]
    },
    {
      id: 'creation',
      label: '创作',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>',
      children: [
        { id: 'script', label: '剧本', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' },
        { id: 'novel', label: '小说', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>' }
      ]
    },
    {
      id: 'idea',
      label: '创意',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>',
      children: [
        { id: 'thoughts', label: '想法', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' },
        { id: 'inspiration', label: '灵感', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' },
        { id: 'notes', label: '记录', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' }
      ]
    },
    {
      id: 'map',
      label: '地图',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>',
      children: [
        { id: 'maplist', label: '列表', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>' }
      ]
    },
    {
      id: 'analysis',
      label: '分析',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
      children: [
        { id: 'relationships', label: '人物关系', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
        { id: 'summary', label: '综合', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>' },
        { id: 'settings', label: '设置', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>' },
        { id: 'apiroutes', label: 'API路由', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>' },
        { id: 'presets', label: '预设', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>' },
        { id: 'writingstyle', label: '写作风格', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/></svg>' }
      ]
    },
    {
      id: 'tools',
      label: '工具',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
      children: [
        { id: 'novelparse', label: '小说解析', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' }
      ]
    }
  ]
};

// ============================================
// 状态管理
// ============================================

const DrawerSystem = {
  currentLevel1: null,      // 当前展开的一级菜单
  currentLevel2: null,      // 当前展开的二级菜单
  currentItem: null,       // 当前选中的项目
  
  // 渲染第一层菜单
  renderLevel1() {
    const container = document.getElementById('drawer-level-1');
    if (!container) return;
    
    let html = '';
    for (const item of NAV_STRUCTURE.items) {
      html += `
        <div class="drawer-item-level-1 ${item.children && item.children.length > 0 ? 'has-children' : ''} ${this.currentLevel1 === item.id ? 'active' : ''}" 
             data-id="${item.id}" 
             onclick="DrawerSystem.toggleLevel1('${item.id}')">
          <span class="prefix">+</span>
          <span class="icon">${item.icon || ''}</span>
          <span class="label">${item.label}</span>
          ${item.children && item.children.length > 0 ? '<span class="arrow">›</span>' : ''}
        </div>
      `;
    }
    container.innerHTML = html;
  },
  
  // 切换一级菜单
  toggleLevel1(id) {
    if (this.currentLevel1 === id) {
      // 关闭
      this.currentLevel1 = null;
      this.currentLevel2 = null;
      this.closeLevel2();
    } else {
      this.currentLevel1 = id;
      this.renderLevel1();
      this.openLevel2(id);
    }
  },
  
  // 打开二级菜单
  openLevel2(level1Id) {
    const container = document.getElementById('drawer-level-2');
    const overlay = document.getElementById('drawer-overlay');
    if (!container) return;
    
    const level1Item = NAV_STRUCTURE.items.find(item => item.id === level1Id);
    if (!level1Item || !level1Item.children) return;
    
    // 渲染二级菜单
    let html = `
      <div class="drawer-header">
        <div class="drawer-header-title">
          <span>+${level1Item.label}</span>
        </div>
        <button class="drawer-header-back" onclick="DrawerSystem.closeLevel2()">
          ‹
        </button>
      </div>
      <div class="drawer-content">
    `;
    
    for (const child of level1Item.children) {
      html += `
        <div class="drawer-item-level-2 ${this.currentItem === child.id ? 'active' : ''}"
             data-id="${child.id}"
             onclick="DrawerSystem.selectItem('${level1Id}', '${child.id}')">
          <span class="prefix">++</span>
          <span class="icon">${child.icon || ''}</span>
          <span class="label">${child.label}</span>
        </div>
      `;
    }
    
    html += '</div>';
    container.innerHTML = html;
    
    // 显示
    container.classList.add('open');
    if (overlay) overlay.classList.add('visible');
  },
  
  // 关闭二级菜单
  closeLevel2() {
    const container = document.getElementById('drawer-level-2');
    const overlay = document.getElementById('drawer-overlay');
    
    if (container) container.classList.remove('open');
    if (overlay) overlay.classList.remove('visible');
    
    this.currentLevel1 = null;
    this.currentLevel2 = null;
    this.renderLevel1();
  },
  
  // 选中项目，显示详情弹窗
  selectItem(level1Id, itemId) {
    this.currentItem = itemId;
    
    // 更新二级菜单选中状态
    const level2Items = document.querySelectorAll('.drawer-item-level-2');
    level2Items.forEach(el => {
      el.classList.toggle('active', el.dataset.id === itemId);
    });
    
    // 获取项目信息
    const level1Item = NAV_STRUCTURE.items.find(item => item.id === level1Id);
    const childItem = level1Item?.children?.find(c => c.id === itemId);
    
    if (childItem) {
      this.showDetailModal(level1Item.label, childItem.label, itemId);
    }
  },
  
  // 显示详情弹窗
  showDetailModal(category, itemName, itemId) {
    const modal = document.getElementById('detail-modal');
    const modalTitle = document.getElementById('detail-modal-title');
    const modalBody = document.getElementById('detail-modal-body');
    
    if (!modal) return;
    
    // 根据不同类型渲染不同内容
    let bodyHtml = '';
    
    switch (itemId) {
      case 'roles':
        bodyHtml = this.renderRolesDetail();
        break;
      case 'items':
        bodyHtml = this.renderItemsDetail();
        break;
      case 'locations':
        bodyHtml = this.renderLocationsDetail();
        break;
      case 'events':
        bodyHtml = this.renderEventsDetail();
        break;
      case 'event_new':
        bodyHtml = this.renderNewEventForm();
        break;
      case 'chapters':
        bodyHtml = this.renderChaptersDetail();
        break;
      case 'novelparse':
        bodyHtml = this.renderNovelParseDetail();
        break;
      default:
        bodyHtml = this.renderDefaultDetail(category, itemName);
    }
    
    modalTitle.textContent = `${category} - ${itemName}`;
    modalBody.innerHTML = bodyHtml;
    
    modal.classList.add('open');
  },
  
  // 关闭弹窗
  closeModal() {
    const modal = document.getElementById('detail-modal');
    if (modal) modal.classList.remove('open');
    this.currentItem = null;
  },
  
  // 渲染角色详情
  renderRolesDetail() {
    const roles = window.state?.currentBook?.roles || [];
    
    if (roles.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state__icon">👤</div>
          <div class="empty-state__text">暂无角色</div>
          <button class="btn-primary" onclick="DrawerSystem.createNewRole()">
            + 新建角色
          </button>
        </div>
      `;
    }
    
    let html = '';
    for (const role of roles) {
      html += `
        <div class="detail-list-item" onclick="DrawerSystem.viewRoleDetail('${role.id}')">
          <div class="detail-list-item__icon">👤</div>
          <div class="detail-list-item__content">
            <div class="detail-list-item__title">${role.name || '未命名'}</div>
            <div class="detail-list-item__desc">${role.description || '暂无描述'}</div>
          </div>
          <div class="detail-list-item__arrow">›</div>
        </div>
      `;
    }
    
    return `
      <div class="detail-list">
        ${html}
      </div>
      <button class="btn-primary mt-md" onclick="DrawerSystem.createNewRole()" style="width:100%">
        + 新建角色
      </button>
    `;
  },
  
  // 渲染其他详情（简化版）
  renderDefaultDetail(category, itemName) {
    return `
      <div class="empty-state">
        <div class="empty-state__icon">📄</div>
        <div class="empty-state__text">${category} - ${itemName}</div>
        <div style="margin-top:16px;color:var(--text2);font-size:13px;">
          点击下方按钮创建新内容
        </div>
        <button class="btn-primary mt-md" onclick="DrawerSystem.createNewItem('${itemName}')" style="width:100%">
          + 新建
        </button>
      </div>
    `;
  },
  
  // 创建新角色
  createNewRole() {
    const name = prompt('角色名称：');
    if (!name) return;
    
    // 调用API创建
    fetch('/api/v1/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookId: window.state?.currentBook?.id,
        name: name,
        description: '',
        avatar: ''
      })
    })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        // 刷新列表
        this.showDetailModal('导航', '角色', 'roles');
        // 刷新主界面
        if (typeof renderHomeTab === 'function') renderHomeTab();
      }
    })
    .catch(err => {
      console.error('创建角色失败:', err);
      alert('创建失败');
    });
  },
  
  // 创建新项目
  createNewItem(itemName) {
    alert(`创建 ${itemName} 功能开发中`);
  },
  
  // 查看角色详情
  viewRoleDetail(roleId) {
    // TODO: 实现角色详情弹窗
    alert(`查看角色详情: ${roleId}`);
  },
  
  // 渲染物品详情
  renderItemsDetail() {
    const items = window.state?.currentBook?.items || [];
    if (items.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state__icon">📦</div>
          <div class="empty-state__text">暂无物品</div>
        </div>
      `;
    }
    // 类似角色渲染
    return this.renderDefaultDetail('导航', '物品');
  },
  
  // 渲染地点详情
  renderLocationsDetail() {
    return this.renderDefaultDetail('导航', '地点');
  },
  
  // 渲染事件详情
  renderEventsDetail() {
    return this.renderDefaultDetail('剧情', '事件');
  },
  
  // 渲染章节详情
  renderChaptersDetail() {
    return this.renderDefaultDetail('剧情', '章节');
  },
  
  // 渲染小说解析
  renderNovelParseDetail() {
    return `
      <div class="form-field">
        <label class="form-field__label">粘贴小说文本</label>
        <textarea class="form-field__textarea" id="novel-parse-text" 
                  placeholder="粘贴要解析的小说内容..."></textarea>
      </div>
      <button class="btn-primary" onclick="DrawerSystem.parseNovel()" style="width:100%">
        🔍 开始解析
      </button>
    `;
  },
  
  // 解析小说
  parseNovel() {
    const text = document.getElementById('novel-parse-text')?.value;
    if (!text) {
      alert('请输入小说内容');
      return;
    }
    alert('小说解析功能开发中');
  }
};

// ============================================
// 详情列表项样式（追加到CSS）
// ============================================

const DETAIL_LIST_CSS = `
.detail-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.detail-list-item:hover {
  border-color: var(--accent);
  background: var(--bg3);
}

.detail-list-item__icon {
  font-size: 20px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg3);
  border-radius: 8px;
}

.detail-list-item__content {
  flex: 1;
  min-width: 0;
}

.detail-list-item__title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 4px;
}

.detail-list-item__desc {
  font-size: 12px;
  color: var(--text2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-list-item__arrow {
  font-size: 18px;
  color: var(--text2);
}
`;

// 注入样式
const styleEl = document.createElement('style');
styleEl.textContent = DETAIL_LIST_CSS;
document.head.appendChild(styleEl);

// ============================================
// 导出到全局
// ============================================

window.DrawerSystem = DrawerSystem;
window.NAV_STRUCTURE = NAV_STRUCTURE;
