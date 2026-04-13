/**
 * SoulWriter - 拖拽系统
 * 实现角色/物品/地点卡片的拖拽功能
 */

// ============ 拖拽管理器 ============
const DragDropManager = {
  // 当前拖拽的数据
  currentDrag: null,
  
  // ============ 初始化 ============
  init() {
    // 监听实体卡片的鼠标按下事件，启用拖拽
    this.bindEntityCards();
    
    // 监听女娲的drop zone
    this.bindNvwaDropZone();
    
    console.log('🎯 DragDropManager initialized');
  },
  
  // ============ 绑定实体卡片 ============
  bindEntityCards() {
    document.addEventListener('mousedown', (e) => {
      const card = e.target.closest('.detail-list-item, .entity-card, .role-item, .item-item, .location-item');
      if (card && card.dataset.entityId) {
        card.draggable = true;
        
        card.addEventListener('dragstart', (e) => {
          this.handleDragStart(e, card);
        });
        
        card.addEventListener('dragend', (e) => {
          this.handleDragEnd(e, card);
        });
      }
    });
  },
  
  // ============ 绑定女娲drop zone ============
  bindNvwaDropZone() {
    // 在女娲面板添加drop zone
    this.addNvwaDropZone();
    
    // 监听女娲面板的drop事件
    document.addEventListener('dragover', (e) => {
      if (this.currentDrag) {
        e.preventDefault();
        const dropZone = e.target.closest('.nvwa-drop-zone, .current-character-slot');
        if (dropZone) {
          dropZone.classList.add('drag-over');
        }
      }
    });
    
    document.addEventListener('dragleave', (e) => {
      const dropZone = e.target.closest('.nvwa-drop-zone, .current-character-slot');
      if (dropZone) {
        dropZone.classList.remove('drag-over');
      }
    });
    
    document.addEventListener('drop', (e) => {
      e.preventDefault();
      const dropZone = e.target.closest('.nvwa-drop-zone, .current-character-slot');
      if (dropZone && this.currentDrag) {
        this.handleDrop(e, dropZone);
      }
    });
  },
  
  // ============ 添加女娲drop zone ============
  addNvwaDropZone() {
    // 在女娲侧边栏的全局控制后面添加一个"当前角色"drop zone
    const observer = new MutationObserver(() => {
      const sidebar = document.querySelector('.nvwa-sidebar');
      if (sidebar && !sidebar.querySelector('.nvwa-drop-zone')) {
        // 在创意点数前面添加
        const creativePanel = sidebar.querySelector('.nvwa-creative-panel');
        if (creativePanel) {
          const dropZone = document.createElement('div');
          dropZone.className = 'nvwa-drop-zone';
          dropZone.innerHTML = `
            <div class="drop-zone-header">
              <span class="drop-zone-icon">👤</span>
              <span>拖拽角色到此处</span>
            </div>
            <div class="drop-zone-content" id="nvwa-current-character">
              <div class="drop-zone-hint">将角色拖放到这里设为当前角色</div>
            </div>
          `;
          sidebar.insertBefore(dropZone, creativePanel);
        }
      }
    });
    
    const sidebar = document.querySelector('.nvwa-sidebar');
    if (sidebar) {
      observer.observe(sidebar, { childList: true });
    }
  },
  
  // ============ 拖拽开始 ============
  handleDragStart(e, card) {
    const entityType = card.closest('[data-entity-type]')?.dataset.entityType || 
                       card.closest('.detail-list-item') ? 'role' : 'unknown';
    
    this.currentDrag = {
      id: card.dataset.entityId,
      type: card.dataset.entityType || 'role',
      name: card.querySelector('.detail-list-item-title, .entity-name')?.textContent || '未知',
      source: 'drawer'
    };
    
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(this.currentDrag));
    
    console.log('🚀 Drag started:', this.currentDrag);
  },
  
  // ============ 拖拽结束 ============
  handleDragEnd(e, card) {
    card.classList.remove('dragging');
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    this.currentDrag = null;
  },
  
  // ============ 放置处理 ============
  handleDrop(e, dropZone) {
    dropZone.classList.remove('drag-over');
    
    if (!this.currentDrag) return;
    
    const data = this.currentDrag;
    console.log('📥 Drop received:', data);
    
    // 根据放置区域处理
    if (dropZone.id === 'nvwa-current-character' || dropZone.classList.contains('current-character-slot')) {
      this.setNvwaCharacter(data);
    } else if (dropZone.classList.contains('event-drop-zone')) {
      this.addToEventLine(data);
    } else if (dropZone.classList.contains('genesis-drop-zone')) {
      this.addToGenesisTree(data);
    } else {
      this.setNvwaCharacter(data);
    }
  },
  
  // ============ 设置女娲当前角色 ============
  setNvwaCharacter(data) {
    // 更新显示
    const container = document.getElementById('nvwa-current-character');
    if (container) {
      container.innerHTML = `
        <div class="current-character-card">
          <div class="character-avatar">👤</div>
          <div class="character-info">
            <div class="character-name">${data.name}</div>
            <div class="character-type">${data.type}</div>
          </div>
          <button class="character-clear" onclick="DragDropManager.clearNvwaCharacter()">×</button>
        </div>
      `;
    }
    
    // 更新女娲状态
    if (typeof NvwaCore !== 'undefined') {
      NvwaCore.state.selectedCharId = data.id;
      NvwaCore.state.selectedCharName = data.name;
    }
    
    // 通知用户
    this.showNotification(`已将「${data.name}」设为女娲当前角色`);
    
    // 保存到state
    state.nvwaCurrentCharacter = data;
  },
  
  // ============ 清除女娲角色 ============
  clearNvwaCharacter() {
    const container = document.getElementById('nvwa-current-character');
    if (container) {
      container.innerHTML = '<div class="drop-zone-hint">将角色拖放到这里设为当前角色</div>';
    }
    state.nvwaCurrentCharacter = null;
    this.showNotification('已清除女娲当前角色');
  },
  
  // ============ 添加到事件线 ============
  addToEventLine(data) {
    this.showNotification(`已将「${data.name}」添加到事件线`);
    // TODO: 实现事件线逻辑
  },
  
  // ============ 添加到创世树 ============
  addToGenesisTree(data) {
    this.showNotification(`已将「${data.name}」添加到创世树`);
    // TODO: 实现创世树逻辑
  },
  
  // ============ 显示通知 ============
  showNotification(message) {
    // 创建通知
    const notification = document.createElement('div');
    notification.className = 'drag-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // 动画显示
    setTimeout(() => notification.classList.add('show'), 10);
    
    // 3秒后移除
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
};

// ============ 添加拖拽样式 ============
const dragDropCSS = `
/* ============ 拖拽状态 ============ */
.detail-list-item, .entity-card, .role-item {
  cursor: grab;
  transition: all 0.2s;
}

.detail-list-item:active, .entity-card:active {
  cursor: grabbing;
}

.detail-list-item.dragging {
  opacity: 0.5;
  transform: scale(0.95);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

/* ============ Drop Zone ============ */
.nvwa-drop-zone {
  background: var(--bg2);
  border-radius: 12px;
  border: 2px dashed var(--border);
  padding: 0;
  margin-bottom: 16px;
  transition: all 0.3s;
  overflow: hidden;
}

.nvwa-drop-zone.drag-over {
  border-color: var(--accent);
  background: rgba(102, 126, 234, 0.1);
  transform: scale(1.02);
}

.drop-zone-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  font-weight: 600;
}

.drop-zone-icon {
  font-size: 20px;
}

.drop-zone-content {
  padding: 16px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drop-zone-hint {
  font-size: 13px;
  color: var(--text2);
  text-align: center;
}

/* ============ 当前角色卡片 ============ */
.current-character-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  background: var(--bg);
  border-radius: 10px;
  border: 1px solid var(--border);
}

.character-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.character-info {
  flex: 1;
}

.character-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.character-type {
  font-size: 12px;
  color: var(--text2);
  text-transform: uppercase;
}

.character-clear {
  width: 28px;
  height: 28px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 50%;
  color: var(--text2);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.character-clear:hover {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
}

/* ============ 拖拽通知 ============ */
.drag-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 14px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  transform: translateY(100px);
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 10000;
}

.drag-notification.show {
  transform: translateY(0);
  opacity: 1;
}

/* ============ 事件线/创世树的drop zone ============ */
.event-drop-zone, .genesis-drop-zone {
  min-height: 80px;
  border: 2px dashed var(--border);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.event-drop-zone.drag-over, .genesis-drop-zone.drag-over {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}
`;

// ============ 初始化 ============
document.addEventListener('DOMContentLoaded', () => {
  // 添加样式
  const style = document.createElement('style');
  style.textContent = dragDropCSS;
  document.head.appendChild(style);
  
  // 初始化拖拽管理器
  setTimeout(() => {
    DragDropManager.init();
  }, 500);
});

// ============ 暴露全局 ============
window.DragDropManager = DragDropManager;
