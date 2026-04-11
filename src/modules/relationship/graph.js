/**
 * RelationshipGraph - 3D关系图谱组件
 * 基于3d-force-graph实现
 * 参考：silverfish + 旧代码思路
 */

class RelationshipGraph {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      width: options.width || 800,
      height: options.height || 600,
      backgroundColor: options.backgroundColor || '#0a0a0f',
      nodeRadius: options.nodeRadius || 8,
      linkDistance: options.linkDistance || 100,
      chargeStrength: options.chargeStrength || -800,
      ...options
    };
    
    this.graph = null;
    this.data = { nodes: [], links: [] };
    this.selectedNode = null;
    this.callbacks = {};
    
    this.init();
  }
  
  async init() {
    // 动态导入3d-force-graph
    const ForceGraph3D = await import('3d-force-graph').catch(() => null);
    if (!ForceGraph3D) {
      console.error('3d-force-graph加载失败');
      return;
    }
    
    const container = typeof this.container === 'string' 
      ? document.querySelector(this.container) 
      : this.container;
    
    if (!container) {
      console.error('容器不存在');
      return;
    }
    
    this.graph = ForceGraph3D()(container)
      .width(this.options.width)
      .height(this.options.height)
      .backgroundColor(this.options.backgroundColor)
      .nodeLabel('name')
      .nodeVal(node => node.val || this.options.nodeRadius)
      .nodeThreeObject(node => this.createNodeMesh(node))
      .linkWidth(link => link.width || 1)
      .linkColor(link => link.color || '#4a5568')
      .linkDirectionalParticles(2)
      .linkDirectionalParticleSpeed(0.005)
      .onNodeClick(node => this.onNodeClick(node))
      .onLinkClick(link => this.onLinkClick(link));
    
    // 物理参数
    this.graph.d3Force('charge').strength(this.options.chargeStrength);
    this.graph.d3Force('link').distance(this.options.linkDistance);
    
    // 响应式
    this.setupResizeObserver(container);
  }
  
  createNodeMesh(node) {
    // 使用Three.js创建节点
    const THREE = window.THREE || {};
    
    const colors = {
      char: 0x3b82f6,  // 蓝色 - 角色
      item: 0xa855f7,   // 紫色 - 物品
      location: 0x22c55e, // 绿色 - 地点
      default: 0x6b7280  // 灰色 - 默认
    };
    
    const color = colors[node.group] || colors.default;
    const isMain = node.level === 1;
    
    // 根据类型选择几何体
    let geometry;
    const size = (node.val || this.options.nodeRadius) / 2;
    
    if (node.group === 'location') {
      // 地点 - 八面体
      geometry = new THREE.OctahedronGeometry(size);
    } else if (node.group === 'item') {
      // 物品 - 立方体
      geometry = new THREE.BoxGeometry(size, size, size);
    } else {
      // 角色 - 球体
      geometry = new THREE.SphereGeometry(size, 32, 32);
    }
    
    const material = new THREE.MeshLambertMaterial({
      color: color,
      transparent: true,
      opacity: 0.9,
      emissive: color,
      emissiveIntensity: isMain ? 0.8 : 0.4
    });
    
    return new THREE.Mesh(geometry, material);
  }
  
  setupResizeObserver(container) {
    if (typeof ResizeObserver === 'undefined') return;
    
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.graph.width(width).height(height);
      }
    });
    
    observer.observe(container);
  }
  
  setData(nodes, links) {
    this.data = { nodes, links };
    if (this.graph) {
      this.graph.graphData(this.data);
    }
  }
  
  updateData(nodes, links) {
    this.data.nodes = nodes || this.data.nodes;
    this.data.links = links || this.data.links;
    if (this.graph) {
      this.graph.graphData(this.data);
    }
  }
  
  addNode(node) {
    if (!this.data.nodes.find(n => n.id === node.id)) {
      this.data.nodes.push(node);
      this.updateData();
    }
  }
  
  addLink(link) {
    if (!this.data.links.find(l => l.source === link.source && l.target === link.target)) {
      this.data.links.push(link);
      this.updateData();
    }
  }
  
  removeNode(nodeId) {
    this.data.nodes = this.data.nodes.filter(n => n.id !== nodeId);
    this.data.links = this.data.links.filter(l => 
      l.source !== nodeId && l.target !== nodeId
    );
    this.updateData();
  }
  
  removeLink(source, target) {
    this.data.links = this.data.links.filter(l => 
      !(l.source === source && l.target === target)
    );
    this.updateData();
  }
  
  focusNode(nodeId) {
    const node = this.data.nodes.find(n => n.id === nodeId);
    if (node && this.graph) {
      const distance = 100;
      const distRatio = 1 + distance / Math.hypot(node.x || 0, node.y || 0, node.z || 0);
      this.graph.cameraPosition(
        { x: (node.x || 0) * distRatio, y: (node.y || 0) * distRatio, z: (node.z || 0) * distRatio },
        node,
        2000
      );
      this.selectedNode = nodeId;
      if (this.callbacks.onNodeSelect) {
        this.callbacks.onNodeSelect(node);
      }
    }
  }
  
  onNodeClick(node) {
    this.focusNode(node.id);
    if (this.callbacks.onNodeClick) {
      this.callbacks.onNodeClick(node);
    }
  }
  
  onLinkClick(link) {
    if (this.callbacks.onLinkClick) {
      this.callbacks.onLinkClick(link);
    }
  }
  
  on(event, callback) {
    this.callbacks[event] = callback;
    return this;
  }
  
  destroy() {
    if (this.graph) {
      this.graph._destructor && this.graph._destructor();
      this.graph = null;
    }
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RelationshipGraph;
}
if (typeof window !== 'undefined') {
  window.RelationshipGraph = RelationshipGraph;
}
