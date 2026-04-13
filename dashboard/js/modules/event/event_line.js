/**
 * SoulWriter EventLine - 事件线系统
 * 鱼骨图/思维导图风格 - 表达剧情推进效果
 */

const EventLine = {
  svg: null,
  events: [],
  selectedEvent: null,
  zoom: 1,
  pan: { x: 0, y: 0 },
  
  // 事件类型
  eventTypes: {
    start:    { icon: '🚀', label: '开场', color: '#10b981' },
    plot:     { icon: '📖', label: '情节', color: '#3b82f6' },
    conflict: { icon: '⚔️', label: '冲突', color: '#ef4444' },
    climax:   { icon: '💥', label: '高潮', color: '#f59e0b' },
    turning:  { icon: '🔄', label: '转折', color: '#8b5cf6' },
    end:      { icon: '🏁', label: '结局', color: '#06b6d4' }
  },
  
  // 初始化
  init(canvasId) {
    const container = document.getElementById(canvasId);
    if (!container) return;
    
    container.innerHTML = `
      <div class="eventline-container">
        <svg class="eventline-svg" id="eventline-svg">
          <defs>
            <marker id="ev-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--text2)" opacity="0.5"/>
            </marker>
            <marker id="ev-arrow-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--accent)"/>
            </marker>
          </defs>
          <g id="ev-lines"></g>
          <g id="ev-events"></g>
        </svg>
        <div class="ev-tooltip" id="ev-tooltip"></div>
        <div class="ev-controls">
          <button class="ev-btn" onclick="EventLine.addEvent()" title="添加事件">➕</button>
          <button class="ev-btn" onclick="EventLine.zoomIn()" title="放大">🔍+</button>
          <button class="ev-btn" onclick="EventLine.zoomOut()" title="缩小">🔍-</button>
          <button class="ev-btn" onclick="EventLine.resetView()" title="重置">🏠</button>
        </div>
      </div>
    `;
    
    this.svg = document.getElementById('eventline-svg');
    this.bindEvents();
    console.log('EventLine initialized');
  },
  
  // 加载数据
  loadData(bookId) {
    this.events = this.getDemoEvents();
    this.render();
  },
  
  // 演示数据 - 鱼骨图风格
  getDemoEvents() {
    return [
      // 主线
      { id: 'e1', type: 'start', name: '主角出场', x: 100, y: 300, main: true },
      { id: 'e2', type: 'plot', name: '遇到伙伴', x: 250, y: 300, main: true, prevId: 'e1' },
      { id: 'e3', type: 'conflict', name: '危机降临', x: 400, y: 300, main: true, prevId: 'e2' },
      { id: 'e4', type: 'turning', name: '意外转折', x: 550, y: 300, main: true, prevId: 'e3' },
      { id: 'e5', type: 'climax', name: '最终决战', x: 700, y: 300, main: true, prevId: 'e4' },
      { id: 'e6', type: 'end', name: '圆满结局', x: 850, y: 300, main: true, prevId: 'e5' },
      
      // 支线 - 上骨
      { id: 's1', type: 'plot', name: '回忆闪回', x: 200, y: 150, main: false, parentId: 'e2' },
      { id: 's2', type: 'plot', name: '支线任务', x: 350, y: 120, main: false, parentId: 'e3' },
      { id: 's3', type: 'turning', name: '内心独白', x: 500, y: 100, main: false, parentId: 'e4' },
      { id: 's4', type: 'climax', name: '牺牲', x: 650, y: 120, main: false, parentId: 'e5' },
      
      // 支线 - 下骨
      { id: 'b1', type: 'plot', name: '背景铺垫', x: 180, y: 450, main: false, parentId: 'e2' },
      { id: 'b2', type: 'conflict', name: '反派阴谋', x: 330, y: 480, main: false, parentId: 'e3' },
      { id: 'b3', type: 'turning', name: '盟友背叛', x: 480, y: 500, main: false, parentId: 'e4' },
      { id: 'b4', type: 'end', name: '彩蛋', x: 800, y: 400, main: false, parentId: 'e6' },
    ];
  },
  
  // 渲染
  render() {
    const linesGroup = document.getElementById('ev-lines');
    const eventsGroup = document.getElementById('ev-events');
    
    if (!linesGroup || !eventsGroup) return;
    
    linesGroup.innerHTML = '';
    eventsGroup.innerHTML = '';
    
    // 渲染连线
    this.events.forEach(ev => {
      if (ev.prevId) {
        const prev = this.events.find(e => e.id === ev.prevId);
        if (prev) {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', prev.x);
          line.setAttribute('y1', prev.y);
          line.setAttribute('x2', ev.x);
          line.setAttribute('y2', ev.y);
          line.setAttribute('stroke', ev.main ? 'var(--accent)' : 'var(--border)');
          line.setAttribute('stroke-width', ev.main ? 3 : 1.5);
          line.setAttribute('marker-end', 'url(#ev-arrow)');
          linesGroup.appendChild(line);
        }
      }
      if (ev.parentId) {
        const parent = this.events.find(e => e.id === ev.parentId);
        if (parent) {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', parent.x);
          line.setAttribute('y1', parent.y);
          line.setAttribute('x2', ev.x);
          line.setAttribute('y2', ev.y);
          line.setAttribute('stroke', 'var(--text2)');
          line.setAttribute('stroke-width', 1);
          line.setAttribute('stroke-dasharray', '4,4');
          line.setAttribute('opacity', '0.5');
          linesGroup.appendChild(line);
        }
      }
    });
    
    // 渲染事件节点
    this.events.forEach(ev => {
      const typeInfo = this.eventTypes[ev.type];
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${ev.x},${ev.y})`);
      g.setAttribute('class', 'ev-node');
      g.setAttribute('data-id', ev.id);
      
      const radius = ev.main ? 28 : 20;
      
      // 节点形状 - 主线圆角矩形，支线圆形
      if (ev.main) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', -35);
        rect.setAttribute('y', -20);
        rect.setAttribute('width', 70);
        rect.setAttribute('height', 40);
        rect.setAttribute('rx', 8);
        rect.setAttribute('fill', typeInfo.color);
        rect.setAttribute('stroke', 'var(--bg)');
        rect.setAttribute('stroke-width', 3);
        g.appendChild(rect);
      } else {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', radius);
        circle.setAttribute('fill', typeInfo.color);
        circle.setAttribute('stroke', 'var(--bg)');
        circle.setAttribute('stroke-width', 2);
        g.appendChild(circle);
      }
      
      // 图标
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dy', '0.35em');
      text.setAttribute('font-size', ev.main ? '16px' : '12px');
      text.textContent = typeInfo.icon;
      g.appendChild(text);
      
      // 标签
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('class', 'ev-label');
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('y', ev.main ? 38 : 35);
      label.setAttribute('font-size', '11px');
      label.setAttribute('fill', 'var(--text)');
      label.textContent = ev.name;
      g.appendChild(label);
      
      // 事件
      g.addEventListener('click', () => this.selectEvent(ev));
      g.addEventListener('mouseenter', (e) => this.showTooltip(e, ev));
      g.addEventListener('mouseleave', () => this.hideTooltip());
      
      eventsGroup.appendChild(g);
    });
    
    this.updateView();
  },
  
  // 选择事件
  selectEvent(ev) {
    this.selectedEvent = ev;
    
    document.querySelectorAll('.ev-node').forEach(node => {
      const id = node.getAttribute('data-id');
      const circle = node.querySelector('circle') || node.querySelector('rect');
      if (circle) {
        circle.setAttribute('stroke', id === ev.id ? 'var(--accent)' : 'var(--bg)');
        circle.setAttribute('stroke-width', id === ev.id ? 4 : (id === ev.id ? 3 : 2));
      }
    });
    
    this.showEventDetail(ev);
  },
  
  // 显示详情
  showEventDetail(ev) {
    const panel = document.getElementById('eventline-detail-panel');
    if (!panel) return;
    
    const typeInfo = this.eventTypes[ev.type];
    panel.innerHTML = `
      <div class="detail-header">
        <span class="detail-icon" style="background:${typeInfo.color}">${typeInfo.icon}</span>
        <div class="detail-title">
          <h3>${ev.name}</h3>
          <span class="detail-type">${typeInfo.label}</span>
        </div>
      </div>
      <div class="detail-body">
        <div class="detail-field">
          <label>类型</label>
          <span class="type-badge" style="background:${typeInfo.color}">${typeInfo.icon} ${typeInfo.label}</span>
        </div>
        <div class="detail-field">
          <label>描述</label>
          <p>${ev.description || '暂无描述'}</p>
        </div>
      </div>
      <div class="detail-actions">
        <button class="btn btn-sm" onclick="EventLine.addBranch('${ev.id}')">+ 添加支线</button>
        <button class="btn btn-sm btn-primary" onclick="EventLine.editEvent('${ev.id}')">编辑</button>
      </div>
    `;
  },
  
  // 添加主线事件
  addEvent() {
    const type = prompt('选择类型 (start/plot/conflict/turning/climax/end):', 'plot');
    if (!type || !this.eventTypes[type]) return;
    
    const name = prompt('输入事件名称:', '新事件');
    if (!name) return;
    
    // 找最后一个主线事件
    const mainEvents = this.events.filter(e => e.main);
    const lastMain = mainEvents[mainEvents.length - 1];
    const x = lastMain ? lastMain.x + 150 : 100;
    const y = 300;
    
    const newEvent = {
      id: 'e' + Date.now(),
      type,
      name,
      x,
      y,
      main: true,
      prevId: lastMain?.id
    };
    
    this.events.push(newEvent);
    this.render();
    this.selectEvent(newEvent);
  },
  
  // 添加支线
  addBranch(parentId) {
    const type = prompt('选择类型:', 'plot');
    if (!type || !this.eventTypes[type]) return;
    
    const name = prompt('输入支线名称:', '支线事件');
    if (!name) return;
    
    const parent = this.events.find(e => e.id === parentId);
    if (!parent) return;
    
    const offset = (Math.random() > 0.5 ? 1 : -1) * (80 + Math.random() * 40);
    
    const newEvent = {
      id: 's' + Date.now(),
      type,
      name,
      x: parent.x + 50 + Math.random() * 50,
      y: parent.y + offset,
      main: false,
      parentId
    };
    
    this.events.push(newEvent);
    this.render();
    this.selectEvent(newEvent);
  },
  
  // 编辑事件
  editEvent(eventId) {
    const ev = this.events.find(e => e.id === eventId);
    if (!ev) return;
    
    const name = prompt('新名称:', ev.name);
    if (name) ev.name = name;
    
    this.render();
    this.selectEvent(ev);
  },
  
  // 显示提示
  showTooltip(event, ev) {
    const tooltip = document.getElementById('ev-tooltip');
    if (!tooltip) return;
    
    const typeInfo = this.eventTypes[ev.type];
    tooltip.innerHTML = `<span>${typeInfo.icon}</span><span>${ev.name}</span><span class="ev-type">${typeInfo.label}</span>`;
    tooltip.style.display = 'flex';
    tooltip.style.left = event.pageX + 15 + 'px';
    tooltip.style.top = event.pageY - 30 + 'px';
  },
  
  hideTooltip() {
    const tooltip = document.getElementById('ev-tooltip');
    if (tooltip) tooltip.style.display = 'none';
  },
  
  // 缩放
  zoomIn() {
    this.zoom = Math.min(this.zoom * 1.2, 3);
    this.updateView();
  },
  
  zoomOut() {
    this.zoom = Math.max(this.zoom / 1.2, 0.3);
    this.updateView();
  },
  
  resetView() {
    this.zoom = 1;
    this.pan = { x: 0, y: 0 };
    this.updateView();
  },
  
  updateView() {
    const g = document.getElementById('ev-events');
    const lines = document.getElementById('ev-lines');
    if (g) {
      g.setAttribute('transform', `translate(${this.pan.x},${this.pan.y}) scale(${this.zoom})`);
    }
    if (lines) {
      lines.setAttribute('transform', `translate(${this.pan.x},${this.pan.y}) scale(${this.zoom})`);
    }
  },
  
  // 绑定事件
  bindEvents() {
    // 滚轮缩放
    this.svg?.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }
    });
    
    // 拖拽平移
    let isDragging = false;
    let startX, startY;
    
    this.svg?.addEventListener('mousedown', (e) => {
      if (e.target === this.svg || e.target.tagName === 'svg') {
        isDragging = true;
        startX = e.clientX - this.pan.x;
        startY = e.clientY - this.pan.y;
      }
    });
    
    this.svg?.addEventListener('mousemove', (e) => {
      if (isDragging) {
        this.pan.x = e.clientX - startX;
        this.pan.y = e.clientY - startY;
        this.updateView();
      }
    });
    
    this.svg?.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }
};

window.EventLine = EventLine;
