/**
 * SoulWriter - 多级抽屉导航系统 v2
 * 
 * 4级导航结构
 */

const DrawerNavV2 = {
  // ============ 配置 ============
  config: {
    animationDuration: 300,
    levels: 4,
    activeColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    defaultColor: '#2d3748'
  },
  
  // ============ 状态 ============
  state: {
    currentPath: [], // ['home', 'nvwa', 'story']
    drawers: {} // level -> drawer data
  },
  
  // ============ 导航结构 ============
  navStructure: {
    label: '导航',
    icon: '🏠',
    children: [
      { 
        id: 'home', 
        label: '首页', 
        icon: '🏠',
        panel: 'homePanel'
      },
      { 
        id: 'creation', 
        label: '创作中心', 
        icon: '✍️',
        children: [
          { id: 'nvwa', label: '女娲系统', icon: '🔮', panel: 'nvwaPanel' },
          { id: 'storyflow', label: '顺理成章', icon: '🌊', panel: 'storyflowPanel' },
          { id: 'characters', label: '角色管理', icon: '👤', panel: 'charactersPanel' },
          { id: 'plot', label: '剧情编辑', icon: '📖', panel: 'plotPanel' }
        ]
      },
      { 
        id: 'tools', 
        label: '工具箱', 
        icon: '🛠️',
        children: [
          { id: 'translate', label: '翻译', icon: '🌐', panel: 'translatePanel' },
          { id: 'settings', label: '设置', icon: '⚙️', panel: 'settingsPanel' }
        ]
      },
      { 
        id: 'analytics', 
        label: '数据分析', 
        icon: '📊',
        children: [
          { id: 'kline', label: 'K线分析', icon: '📈', panel: 'klinePanel' },
          { id: 'causal', label: '因果分析', icon: '🔗', panel: 'causalPanel' }
        ]
      }
    ]
  },
  
  // ============ 初始化 ============
  init() {
    this.buildDrawerHTML();
    this.bindEvents();
    console.log('🎯 DrawerNavV2 initialized');
  },
  
  // ============ 构建抽屉HTML ============
  buildDrawerHTML() {
    const container = document.createElement('div');
    container.id = 'drawer-nav-v2';
    container.innerHTML = this.renderDrawer(0, this.navStructure.children);
    document.body.appendChild(container);
  },
  
  // ============ 渲染单个抽屉 ============
  renderDrawer(level, items) {
    const isRoot = level === 0;
    const width = isRoot ? 220 : 200;
    const left = isRoot ? 48 : 48 + 220 + (level - 1) * 200;
    
    let html = `
      <div class="drawer-level drawer-level-${level}" 
           data-level="${level}"
           style="left: ${left}px; width: ${width}px;">
        <div class="drawer-header">
          ${isRoot ? '<span class="drawer-title">菜单</span>' : ''}
          ${level > 0 ? `<button class="drawer-back" data-level="${level}">← 返回</button>` : ''}
        </div>
        <div class="drawer-items">
          ${items.map(item => this.renderItem(item, level)).join('')}
        </div>
      </div>
    `;
    
    // 递归渲染子级
    items.forEach(item => {
      if (item.children) {
        html += this.renderDrawer(level + 1, item.children);
      }
    });
    
    return html;
  },
  
  // ============ 渲染单个项目 ============
  renderItem(item, level) {
    const hasChildren = item.children && item.children.length > 0;
    const arrow = hasChildren ? '<span class="item-arrow">›</span>' : '';
    const action = item.panel ? `onclick="DrawerNavV2.openPanel('${item.panel}')"` : '';
    
    return `
      <div class="drawer-item ${hasChildren ? 'has-children' : ''}" 
           data-id="${item.id}"
           data-level="${level}"
           ${hasChildren ? `data-has-children="true"` : ''}
           ${action}>
        <span class="item-icon">${item.icon}</span>
        <span class="item-label">${item.label}</span>
        ${arrow}
      </div>
    `;
  },
  
  // ============ 绑定事件 ============
  bindEvents() {
    // 主按钮
    const mainBtn = document.querySelector('.btn-open') || document.querySelector('[data-drawer="main"]');
    if (mainBtn) {
      mainBtn.addEventListener('click', () => this.toggle());
    }
    
    // 抽屉项点击
    document.addEventListener('click', (e) => {
      const item = e.target.closest('.drawer-item');
      if (!item) return;
      
      const id = item.dataset.id;
      const level = parseInt(item.dataset.level);
      const hasChildren = item.dataset.hasChildren === 'true';
      
      if (hasChildren) {
        this.openDrawer(level + 1, id);
      } else {
        this.selectItem(id, item);
      }
    });
    
    // 返回按钮
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('drawer-back')) {
        const level = parseInt(e.target.dataset.level);
        this.closeDrawer(level);
      }
    });
    
    // 点击外部关闭
    document.addEventListener('click', (e) => {
      const drawer = document.getElementById('drawer-nav-v2');
      const btn = document.querySelector('.btn-open');
      if (drawer && !drawer.contains(e.target) && (!btn || !btn.contains(e.target))) {
        this.closeAll();
      }
    });
  },
  
  // ============ 切换主抽屉 ============
  toggle() {
    const container = document.getElementById('drawer-nav-v2');
    const level0 = container.querySelector('.drawer-level-0');
    
    if (level0.classList.contains('open')) {
      this.closeAll();
    } else {
      level0.classList.add('open');
    }
  },
  
  // ============ 打开子抽屉 ============
  openDrawer(level, parentId) {
    // 关闭同级及以下
    document.querySelectorAll(`.drawer-level-${level}, .drawer-level-${level + 1}`).forEach(el => {
      el.classList.remove('open');
    });
    
    // 找到对应的子级数据
    const parent = this.findItem(parentId, this.navStructure.children);
    if (parent && parent.children) {
      const drawer = document.querySelector(`.drawer-level-${level}`);
      const parentEl = drawer.querySelector(`[data-id="${parentId}"]`);
      
      // 更新下一个抽屉的内容
      const nextDrawer = document.querySelector(`.drawer-level-${level}`);
      if (nextDrawer) {
        nextDrawer.classList.add('open');
      }
    }
  },
  
  // ============ 关闭抽屉 ============
  closeDrawer(level) {
    document.querySelectorAll(`.drawer-level-${level}, .drawer-level-${level + 1}`).forEach(el => {
      el.classList.remove('open');
    });
  },
  
  // ============ 关闭所有 ============
  closeAll() {
    document.querySelectorAll('.drawer-level').forEach(el => {
      el.classList.remove('open');
    });
    this.state.currentPath = [];
  },
  
  // ============ 选择项目 ============
  selectItem(id, element) {
    // 更新路径
    const item = this.findItem(id, this.navStructure.children);
    if (item) {
      this.state.currentPath.push(id);
    }
    
    // 高亮
    document.querySelectorAll('.drawer-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    
    // 关闭所有抽屉
    this.closeAll();
    
    // 触发面板切换
    if (element.dataset.panel) {
      this.openPanel(element.dataset.panel);
    }
    
    // 触发回调
    if (typeof this.onSelect === 'function') {
      this.onSelect(id, item);
    }
  },
  
  // ============ 打开面板 ============
  openPanel(panelId) {
    // 触发事件让主程序处理
    window.dispatchEvent(new CustomEvent('drawerPanelChange', { 
      detail: { panel: panelId } 
    }));
  },
  
  // ============ 查找项目 ============
  findItem(id, items) {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = this.findItem(id, item.children);
        if (found) return found;
      }
    }
    return null;
  },
  
  // ============ 获取当前路径 ============
  getCurrentPath() {
    return this.state.currentPath;
  },
  
  // ============ 渲染完整导航 ============
  render() {
    const container = document.getElementById('drawer-nav-v2');
    if (container) {
      container.innerHTML = this.renderDrawer(0, this.navStructure.children);
      this.bindEvents();
    }
  }
};

// ============ 多级抽屉CSS ============
const DrawerNavV2CSS = `
/* ============ 多级抽屉容器 ============ */
#drawer-nav-v2 {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  pointer-events: none;
}

#drawer-nav-v2.open {
  pointer-events: auto;
}

/* ============ 单个抽屉 ============ */
.drawer-level {
  position: absolute;
  top: 0;
  bottom: 0;
  background: #1a1a2e;
  border-right: 1px solid rgba(255,255,255,0.1);
  display: flex;
  flex-direction: column;
  opacity: 0;
  transform: translateX(-20px);
  transition: all 0.3s ease;
  pointer-events: none;
  overflow: hidden;
}

.drawer-level.open {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

/* ============ 抽屉头部 ============ */
.drawer-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
}

.drawer-title {
  font-size: 16px;
  font-weight: 700;
  color: white;
}

.drawer-back {
  background: rgba(255,255,255,0.2);
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.drawer-back:hover {
  background: rgba(255,255,255,0.3);
}

/* ============ 抽屉项目列表 ============ */
.drawer-items {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

/* ============ 单个抽屉项 ============ */
.drawer-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.drawer-item:hover {
  background: rgba(255,255,255,0.05);
  border-left-color: #667eea;
}

.drawer-item.active {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.3) 0%, transparent 100%);
  border-left-color: #667eea;
}

.drawer-item.has-children {
  border-left-color: #764ba2;
}

.item-icon {
  font-size: 20px;
  width: 28px;
  text-align: center;
}

.item-label {
  flex: 1;
  font-size: 14px;
  color: #e2e8f0;
}

.item-arrow {
  font-size: 18px;
  color: #667eea;
  font-weight: bold;
}

/* ============ 滚动条 ============ */
.drawer-items::-webkit-scrollbar {
  width: 4px;
}

.drawer-items::-webkit-scrollbar-track {
  background: transparent;
}

.drawer-items::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
}

/* ============ 主按钮覆盖 ============ */
.btn-open {
  position: fixed;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10000;
}
`;

// ============ 初始化样式 ============
function initDrawerNavV2CSS() {
  if (!document.getElementById('drawer-nav-v2-css')) {
    const style = document.createElement('style');
    style.id = 'drawer-nav-v2-css';
    style.textContent = DrawerNavV2CSS;
    document.head.appendChild(style);
  }
}

// ============ 自动初始化 ============
document.addEventListener('DOMContentLoaded', () => {
  initDrawerNavV2CSS();
  DrawerNavV2.init();
  
  // 监听面板切换
  window.addEventListener('drawerPanelChange', (e) => {
    console.log('Panel change:', e.detail.panel);
    // 触发女娲面板
    if (e.detail.panel === 'nvwaPanel') {
      switchTab('nvwa');
    }
  });
});

// ============ 暴露全局 ============
window.DrawerNavV2 = DrawerNavV2;
