/**
 * SoulWriter - 可视化编辑器
 * 用于事件线的节点可视化
 */

const VisualEditor = {
  nodeTypes: {
    character: { icon: '👤', label: '角色', color: '#6366f1' },
    item: { icon: '🎁', label: '物品', color: '#f59e0b' },
    location: { icon: '📍', label: '地点', color: '#10b981' },
    plot: { icon: '📖', label: '情节', color: '#ef4444' },
    world: { icon: '🌍', label: '世界观', color: '#8b5cf6' },
    chapter: { icon: '📚', label: '章节', color: '#ec4899' },
    event: { icon: '⚡', label: '事件', color: '#14b8a6' }
  },
  
  state: {
    nodes: [],
    connections: [],
    selectedNode: null,
    dragging: null
  },
  
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.render();
  },
  
  createNode(type, x, y, data = {}) {
    const node = {
      id: 've_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      type,
      x, y,
      width: 160,
      height: 90,
      data: {
        title: data.title || this.nodeTypes[type].label + '_' + (this.state.nodes.filter(n => n.type === type).length + 1),
        description: data.description || '',
        level: data.level || 1,
        status: data.status || 'active',
        ...data
      }
    };
    this.state.nodes.push(node);
    return node;
  },
  
  createConnection(sourceId, targetId, label = '') {
    if (sourceId === targetId) return;
    const exists = this.state.connections.find(c => c.source === sourceId && c.target === targetId);
    if (exists) return;
    this.state.connections.push({
      id: 'conn_' + Date.now(),
      source: sourceId,
      target: targetId,
      label: label || ''
    });
  },
  
  deleteNode(id) {
    this.state.nodes = this.state.nodes.filter(n => n.id !== id);
    this.state.connections = this.state.connections.filter(c => c.source !== id && c.target !== id);
    if (this.state.selectedNode === id) this.state.selectedNode = null;
    this.render();
    this.renderPanel();
  },
  
  render() {
    if (!this.container) return;
    
    // Generate SVG for connections
    let svgHtml = `<svg class="ve-svg"><defs><marker id="ve-arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#6366f1"/></marker></defs>`;
    
    this.state.connections.forEach(conn => {
      const source = this.state.nodes.find(n => n.id === conn.source);
      const target = this.state.nodes.find(n => n.id === conn.target);
      if (!source || !target) return;
      
      const sx = source.x + source.width / 2;
      const sy = source.y + source.height / 2;
      const tx = target.x + target.width / 2;
      const ty = target.y + target.height / 2;
      const midX = (sx + tx) / 2;
      const path = `M ${sx} ${sy} Q ${midX} ${sy} ${midX} ${(sy + ty) / 2} T ${tx} ${ty}`;
      
      svgHtml += `<path d="${path}" fill="none" stroke="#6366f1" stroke-width="2" marker-end="url(#ve-arrowhead)"/>`;
      if (conn.label) {
        svgHtml += `<text x="${midX}" y="${((sy + ty) / 2 - 10)}" fill="#e2e8f0" font-size="12" text-anchor="middle">${conn.label}</text>`;
      }
    });
    svgHtml += '</svg>';
    
    // Generate nodes
    let nodesHtml = '';
    this.state.nodes.forEach(node => {
      const typeStyle = this.nodeTypes[node.type];
      const isSelected = this.state.selectedNode === node.id;
      nodesHtml += `<div class="ve-node${isSelected ? ' selected' : ''}" data-id="${node.id}" style="left:${node.x}px;top:${node.y}px;width:${node.width}px;border-color:${typeStyle.color}">
        <div class="ve-node-header" style="background:${typeStyle.color}">
          <span class="ve-node-icon">${typeStyle.icon}</span>
          <span class="ve-node-type">${typeStyle.label}</span>
          <span class="ve-node-delete" data-delete="${node.id}">✕</span>
        </div>
        <div class="ve-node-body">
          <div class="ve-node-title">${node.data.title}</div>
          <div class="ve-node-desc">${node.data.description || ''}</div>
        </div>
      </div>`;
    });
    
    this.container.innerHTML = `<div class="ve-canvas">${svgHtml}${nodesHtml}</div>`;
    this.bindEvents();
  },
  
  renderPanel() {
    const panel = document.getElementById('ve-panel');
    if (!panel) return;
    
    if (!this.state.selectedNode) {
      panel.innerHTML = '<div class="ve-panel-empty">👈 点击节点查看详情<br>或从工具栏创建新节点</div>';
      return;
    }
    
    const node = this.state.nodes.find(n => n.id === this.state.selectedNode);
    if (!node) return;
    
    const typeStyle = this.nodeTypes[node.type];
    const nodeConnections = this.state.connections.filter(c => c.source === node.id || c.target === node.id);
    
    panel.innerHTML = `
      <div class="ve-panel-title"><span>${typeStyle.icon}</span> ${typeStyle.label} 详情</div>
      
      <div class="ve-form-group">
        <label class="ve-form-label">名称</label>
        <input class="ve-form-input" id="ve-panel-title" value="${node.data.title || ''}">
      </div>
      
      <div class="ve-form-group">
        <label class="ve-form-label">类型</label>
        <select class="ve-form-select" id="ve-panel-type">
          ${Object.entries(this.nodeTypes).map(([k, v]) => 
            `<option value="${k}"${node.type === k ? ' selected' : ''}>${v.icon} ${v.label}</option>`
          ).join('')}
        </select>
      </div>
      
      <div class="ve-form-group">
        <label class="ve-form-label">描述</label>
        <textarea class="ve-form-input" id="ve-panel-desc">${node.data.description || ''}</textarea>
      </div>
      
      <div class="ve-form-group">
        <label class="ve-form-label">关联 (${nodeConnections.length})</label>
        <div class="ve-conn-list">
          ${nodeConnections.map(c => {
            const other = this.state.nodes.find(n => n.id === (c.source === node.id ? c.target : c.source));
            const isOutgoing = c.source === node.id;
            return `<div class="ve-conn-item">
              <span>${isOutgoing ? '→' : '←'}</span> 
              ${other ? other.data.title : '?'} 
              <span>${c.label || '关联'}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
      
      <button class="ve-btn-delete" data-delete="${node.id}">🗑️ 删除节点</button>
    `;
  },
  
  bindEvents() {
    // Node drag
    this.container.querySelectorAll('.ve-node').forEach(el => {
      el.addEventListener('mousedown', e => this.startDrag(e, el));
      el.addEventListener('click', e => this.selectNode(e, el));
    });
    
    // Delete buttons
    this.container.querySelectorAll('.ve-node-delete, .ve-btn-delete').forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation();
        const id = el.dataset.delete;
        if (confirm('确定删除这个节点？')) {
          this.deleteNode(id);
        }
      });
    });
  },
  
  startDrag(e, el) {
    if (e.target.classList.contains('ve-node-delete')) return;
    const nodeId = el.dataset.id;
    const node = this.state.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    this.state.selectedNode = nodeId;
    this.dragState = {
      node,
      startX: e.clientX - node.x,
      startY: e.clientY - node.y
    };
    
    document.addEventListener('mousemove', e => this.onDrag(e));
    document.addEventListener('mouseup', () => this.endDrag());
    
    this.render();
    this.renderPanel();
  },
  
  onDrag(e) {
    if (!this.dragState) return;
    this.dragState.node.x = e.clientX - this.dragState.startX;
    this.dragState.node.y = e.clientY - this.dragState.startY;
    this.render();
  },
  
  endDrag() {
    this.dragState = null;
    document.removeEventListener('mousemove', e => this.onDrag(e));
    document.removeEventListener('mouseup', () => this.endDrag());
  },
  
  selectNode(e, el) {
    if (e.target.classList.contains('ve-node-delete')) return;
    this.state.selectedNode = el.dataset.id;
    this.render();
    this.renderPanel();
  },
  
  createFromToolbar(type) {
    const x = 100 + Math.random() * 500;
    const y = 50 + Math.random() * 300;
    const node = this.createNode(type, x, y);
    this.state.selectedNode = node.id;
    this.render();
    this.renderPanel();
  },
  
  connectSelected(label = '') {
    // Simple connection mode - connect selected to first other node
    if (this.state.selectedNode && this.state.nodes.length > 1) {
      const other = this.state.nodes.find(n => n.id !== this.state.selectedNode);
      if (other) {
        this.createConnection(this.state.selectedNode, other.id, label);
        this.render();
      }
    }
  },
  
  clearAll() {
    if (confirm('确定清空所有节点？')) {
      this.state.nodes = [];
      this.state.connections = [];
      this.state.selectedNode = null;
      this.render();
      this.renderPanel();
    }
  },
  
  // Load from events data
  loadFromEvents(events) {
    this.state.nodes = [];
    this.state.connections = [];
    
    events.forEach((event, index) => {
      const x = 100 + (index % 3) * 250;
      const y = 100 + Math.floor(index / 3) * 180;
      this.createNode('event', x, y, {
        title: event.title || event.name || '事件 ' + (index + 1),
        description: event.summary || ''
      });
    });
    
    // Create connections based on event relationships
    events.forEach((event, index) => {
      if (event.nextId) {
        const sourceNode = this.state.nodes[index];
        const targetIndex = events.findIndex(e => e.id === event.nextId);
        if (targetIndex >= 0 && sourceNode) {
          this.createConnection(sourceNode.id, this.state.nodes[targetIndex].id, '后续');
        }
      }
    });
    
    this.render();
  }
};

// Global functions for toolbar buttons
function createVeNode(type) {
  if (window.VisualEditor) {
    VisualEditor.createFromToolbar(type);
  }
}

function clearVeAll() {
  if (window.VisualEditor) {
    VisualEditor.clearAll();
  }
}
