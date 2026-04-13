/**
 * SoulWriter Genesis Tree v2 - 科技树/星盘结构
 * 不用D3，纯SVG实现
 */

const GenesisTree = {
  selectedNode: null,
  nodes: [],
  links: [],
  
  nodeTypes: {
    core:    { icon: '🌟', label: '核心', color: '#f5c518' },
    character: { icon: '👤', label: '角色', color: '#e94560' },
    plot:    { icon: '📖', label: '剧情', color: '#0f3460' },
    world:   { icon: '🌍', label: '世界观', color: '#10b981' },
    event:   { icon: '⚡', label: '事件', color: '#f59e0b' },
    item:    { icon: '💎', label: '物品', color: '#8b5cf6' },
    location:{ icon: '📍', label: '地点', color: '#06b6d4' },
    theme:   { icon: '🎭', label: '主题', color: '#ec4899' }
  },
  
  init(canvasId) {
    const container = document.getElementById(canvasId);
    if (!container) return;
    
    container.innerHTML = `
      <div class="gt-container">
        <svg class="gt-svg" id="gt-svg">
          <defs>
            <marker id="gt-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--text2)" opacity="0.5"/>
            </marker>
          </defs>
          <g id="gt-links"></g>
          <g id="gt-nodes"></g>
        </svg>
        <div class="gt-tooltip" id="gt-tooltip"></div>
      </div>
    `;
    
    this.bindEvents();
    console.log('GenesisTree v2 initialized');
  },
  
  loadData(bookId) {
    this.nodes = this.getDemoNodes();
    this.links = [];
    this.render();
  },
  
  getDemoNodes() {
    return [
      { id: 'c1', type: 'core', name: '故事核心', x: 400, y: 300, locked: true },
      { id: 'ch1', type: 'character', name: '主角A', x: 250, y: 180, parentId: 'c1' },
      { id: 'ch2', type: 'character', name: '主角B', x: 550, y: 180, parentId: 'c1' },
      { id: 'p1', type: 'plot', name: '开场事件', x: 150, y: 80, parentId: 'ch1' },
      { id: 'p2', type: 'plot', name: '冲突爆发', x: 300, y: 80, parentId: 'ch1' },
      { id: 'p3', type: 'plot', name: '意外转折', x: 500, y: 80, parentId: 'ch2' },
      { id: 'w1', type: 'world', name: '世界设定', x: 650, y: 300, parentId: 'c1' },
      { id: 'e1', type: 'event', name: '大决战', x: 350, y: 30, parentId: 'p2' },
      { id: 'l1', type: 'location', name: '王城', x: 750, y: 200, parentId: 'w1' },
      { id: 'i1', type: 'item', name: '神剑', x: 200, y: 280, parentId: 'ch1' },
    ];
  },
  
  render() {
    const svg = document.getElementById('gt-svg');
    const linksGroup = document.getElementById('gt-links');
    const nodesGroup = document.getElementById('gt-nodes');
    
    // 清空
    linksGroup.innerHTML = '';
    nodesGroup.innerHTML = '';
    
    // 渲染连线
    this.nodes.forEach(node => {
      if (node.parentId) {
        const parent = this.nodes.find(n => n.id === node.parentId);
        if (parent) {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', parent.x);
          line.setAttribute('y1', parent.y);
          line.setAttribute('x2', node.x);
          line.setAttribute('y2', node.y);
          line.setAttribute('stroke', 'var(--border)');
          line.setAttribute('stroke-width', '2');
          line.setAttribute('marker-end', 'url(#gt-arrow)');
          linksGroup.appendChild(line);
        }
      }
    });
    
    // 渲染节点
    this.nodes.forEach(node => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${node.x},${node.y})`);
      g.setAttribute('class', 'gt-node');
      g.setAttribute('data-id', node.id);
      
      const typeInfo = this.nodeTypes[node.type];
      const radius = node.type === 'core' ? 35 : 24;
      
      // 圆圈
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', radius);
      circle.setAttribute('fill', typeInfo.color);
      circle.setAttribute('stroke', node.locked ? 'var(--accent)' : 'var(--bg)');
      circle.setAttribute('stroke-width', node.locked ? 4 : 3);
      g.appendChild(circle);
      
      // 图标
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dy', '0.35em');
      text.setAttribute('font-size', node.type === 'core' ? '20px' : '14px');
      text.textContent = typeInfo.icon;
      g.appendChild(text);
      
      // 标签
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('class', 'gt-label');
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('y', radius + 18);
      label.setAttribute('font-size', '11px');
      label.setAttribute('fill', 'var(--text)');
      label.textContent = node.name;
      g.appendChild(label);
      
      // 事件
      g.addEventListener('click', () => this.selectNode(node));
      g.addEventListener('mouseenter', (e) => this.showTooltip(e, node));
      g.addEventListener('mouseleave', () => this.hideTooltip());
      
      nodesGroup.appendChild(g);
    });
  },
  
  selectNode(node) {
    this.selectedNode = node;
    
    // 高亮
    document.querySelectorAll('.gt-node circle').forEach(c => {
      const id = c.parentElement.getAttribute('data-id');
      c.setAttribute('stroke', id === node.id ? 'var(--accent)' : 'var(--bg)');
      c.setAttribute('stroke-width', id === node.id ? 4 : 3);
    });
    
    this.showNodeDetail(node);
  },
  
  showNodeDetail(node) {
    const panel = document.getElementById('genesis-detail-panel');
    if (!panel) return;
    
    const typeInfo = this.nodeTypes[node.type];
    const children = this.nodes.filter(n => n.parentId === node.id);
    const parent = this.nodes.find(n => n.id === node.parentId);
    
    panel.innerHTML = `
      <div class="detail-header">
        <span class="detail-icon" style="background:${typeInfo.color}">${typeInfo.icon}</span>
        <div class="detail-title">
          <h3>${node.name}</h3>
          <span class="detail-type">${typeInfo.label}</span>
        </div>
      </div>
      <div class="detail-body">
        <div class="detail-field">
          <label>描述</label>
          <p>${node.description || '暂无描述'}</p>
        </div>
        <div class="detail-field">
          <label>关联</label>
          <div class="detail-links">
            ${parent ? `<span class="link-tag parent">↑ ${this.nodeTypes[parent.type].icon} ${parent.name}</span>` : ''}
            ${children.map(n => `<span class="link-tag child">↓ ${this.nodeTypes[n.type].icon} ${n.name}</span>`).join('')}
          </div>
        </div>
      </div>
      <div class="detail-actions">
        ${!node.locked ? `<button class="btn btn-sm" onclick="GenesisTree.addChildNode('${node.id}')">+ 添加分支</button>` : ''}
        <button class="btn btn-sm btn-primary" onclick="GenesisTree.editNode('${node.id}')">编辑</button>
      </div>
    `;
  },
  
  addChildNode(parentId) {
    const name = prompt('输入节点名称:');
    if (!name) return;
    
    const types = Object.keys(this.nodeTypes).filter(t => t !== 'core').join(', ');
    const type = prompt('选择类型 (' + types + '):', 'plot');
    if (!type || !this.nodeTypes[type]) return;
    
    const parent = this.nodes.find(n => n.id === parentId);
    const angle = Math.random() * Math.PI * 2;
    const dist = 100 + Math.random() * 50;
    
    const newNode = {
      id: 'n' + Date.now(),
      type,
      name,
      parentId,
      x: parent ? parent.x + Math.cos(angle) * dist : 400,
      y: parent ? parent.y + Math.sin(angle) * dist : 300,
      locked: false
    };
    
    this.nodes.push(newNode);
    this.render();
    this.selectNode(newNode);
  },
  
  editNode(nodeId) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const name = prompt('新名称:', node.name);
    if (name) node.name = name;
    
    this.render();
    this.selectNode(node);
  },
  
  showTooltip(event, node) {
    const tooltip = document.getElementById('gt-tooltip');
    if (!tooltip) return;
    
    tooltip.innerHTML = `<span>${this.nodeTypes[node.type].icon}</span><span>${node.name}</span>`;
    tooltip.style.display = 'flex';
    tooltip.style.left = event.pageX + 15 + 'px';
    tooltip.style.top = event.pageY - 30 + 'px';
  },
  
  hideTooltip() {
    const tooltip = document.getElementById('gt-tooltip');
    if (tooltip) tooltip.style.display = 'none';
  },
  
  bindEvents() {
    // 双击添加
    document.getElementById('gt-svg')?.addEventListener('dblclick', (e) => {
      if (e.target.closest('.gt-node')) return;
      const svg = document.getElementById('gt-svg');
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.addNodeAt(x, y);
    });
  },
  
  addNodeAt(x, y) {
    const types = Object.keys(this.nodeTypes).filter(t => t !== 'core').join(', ');
    const type = prompt('选择类型 (' + types + '):', 'character');
    if (!type || !this.nodeTypes[type]) return;
    
    const name = prompt('名称:', '新节点');
    if (!name) return;
    
    const newNode = { id: 'n' + Date.now(), type, name, x, y, locked: false };
    this.nodes.push(newNode);
    this.render();
    this.selectNode(newNode);
  }
};

window.GenesisTree = GenesisTree;
