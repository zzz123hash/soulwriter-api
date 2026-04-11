/**
 * Locations Module - 地点/地图管理模块
 * 地点、区域、连接关系管理
 * 参考旧代码MapSystem设计
 */

class LocationManager {
  constructor() {
    this.locations = [];
    this.connections = [];  // 连接关系
    this.listeners = [];
  }
  
  // 创建地点
  create(locationData) {
    const location = {
      id: this.generateId(),
      name: locationData.name || '未命名地点',
      type: locationData.type || 'generic', // city, dungeon, room, wilderness, etc.
      description: locationData.description || '',
      position: locationData.position || { x: 0, y: 0, z: 0 },
      metadata: locationData.metadata || {},
      connections: [], // 直接连接的地点ID
      items: [], // 物品ID列表
      characters: [], // 角色ID列表
      parentId: locationData.parentId || null, // 父级地点（如房间属于建筑）
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.locations.push(location);
    this.emit('create', location);
    return location;
  }
  
  // 获取地点
  get(id) {
    return this.locations.find(loc => loc.id === id);
  }
  
  // 获取所有地点
  getAll() {
    return [...this.locations];
  }
  
  // 按类型获取
  getByType(type) {
    return this.locations.filter(loc => loc.type === type);
  }
  
  // 按父级获取
  getByParent(parentId) {
    return this.locations.filter(loc => loc.parentId === parentId);
  }
  
  // 获取子地点
  getChildren(parentId) {
    return this.getByParent(parentId);
  }
  
  // 获取根地点（无父级）
  getRootLocations() {
    return this.locations.filter(loc => !loc.parentId);
  }
  
  // 添加连接
  addConnection(sourceId, targetId, connectionType = 'path') {
    const source = this.get(sourceId);
    const target = this.get(targetId);
    if (!source || !target) return null;
    
    // 避免重复
    if (source.connections.includes(targetId)) {
      return this.getConnection(sourceId, targetId);
    }
    
    const connection = {
      id: this.generateId(),
      source: sourceId,
      target: targetId,
      type: connectionType, // path, road, teleport, river, etc.
      distance: 0,
      bidirectional: true,
      createdAt: new Date().toISOString()
    };
    
    source.connections.push(targetId);
    target.connections.push(sourceId);
    this.connections.push(connection);
    
    this.emit('connection', connection);
    return connection;
  }
  
  // 获取连接
  getConnection(sourceId, targetId) {
    return this.connections.find(c => 
      (c.source === sourceId && c.target === targetId) ||
      (c.source === targetId && c.target === sourceId)
    );
  }
  
  // 获取地点的所有连接
  getConnections(locationId) {
    const location = this.get(locationId);
    if (!location) return [];
    
    return location.connections
      .map(targetId => this.getConnection(locationId, targetId))
      .filter(Boolean);
  }
  
  // 更新地点
  update(id, updates) {
    const location = this.get(id);
    if (!location) return null;
    
    Object.assign(location, updates, {
      updatedAt: new Date().toISOString()
    });
    
    this.emit('update', location);
    return location;
  }
  
  // 删除地点
  delete(id) {
    const index = this.locations.findIndex(loc => loc.id === id);
    if (index === -1) return false;
    
    const location = this.locations.splice(index, 1)[0];
    
    // 清理连接
    this.connections = this.connections.filter(c => 
      c.source !== id && c.target !== id
    );
    
    // 从其他地点的连接中移除
    this.locations.forEach(loc => {
      loc.connections = loc.connections.filter(cid => cid !== id);
    });
    
    this.emit('delete', location);
    return true;
  }
  
  // 生成ID
  generateId() {
    return `loc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
  
  // 事件监听
  on(event, callback) {
    this.listeners.push({ event, callback });
    return () => {
      this.listeners = this.listeners.filter(l => l.callback !== callback);
    };
  }
  
  emit(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => l.callback(data));
  }
  
  // 导入数据
  import(data) {
    this.locations = data.locations || [];
    this.connections = data.connections || [];
    this.emit('import', { locations: this.locations, connections: this.connections });
  }
  
  // 导出数据
  export() {
    return JSON.stringify({
      locations: this.locations,
      connections: this.connections
    }, null, 2);
  }
  
  // 构建图谱数据（用于可视化）
  toGraphData() {
    const nodes = this.locations.map(loc => ({
      id: loc.id,
      name: loc.name,
      group: 'location',
      val: loc.type === 'city' ? 15 : loc.type === 'dungeon' ? 12 : 8,
      level: loc.parentId ? 2 : 1,
      type: loc.type,
      position: loc.position
    }));
    
    const links = this.connections.map(conn => ({
      source: conn.source,
      target: conn.target,
      label: conn.type,
      color: '#22c55e'
    }));
    
    return { nodes, links };
  }
}

// 地点类型常量
const LOCATION_TYPES = {
  CITY: 'city',           // 城市
  TOWN: 'town',          // 城镇
  VILLAGE: 'village',    // 村庄
  DUNGEON: 'dungeon',   // 地下城
  BUILDING: 'building',  // 建筑
  ROOM: 'room',          // 房间
  WILDERNESS: 'wilderness', // 荒野
  MOUNTAIN: 'mountain',  // 山脉
  FOREST: 'forest',     // 森林
  WATER: 'water',        // 水域
  CAVERN: 'cavern',      // 洞穴
  TEMPLE: 'temple',      // 神殿
  MARKET: 'market',      // 市场
  PORTAL: 'portal',      // 传送门
  GENERIC: 'generic'     // 通用
};

// 连接类型常量
const CONNECTION_TYPES = {
  PATH: 'path',           // 小路
  ROAD: 'road',          // 道路
  HIGHWAY: 'highway',    // 高速公路
  RIVER: 'river',        // 河流
  SEA: 'sea',             // 海上路线
  AIR: 'air',            // 空中
  TELEPORT: 'teleport',   // 传送门
  WALL: 'wall',          // 墙壁/阻断
  DOOR: 'door'           // 门
};

// 地点类型图标
const LOCATION_TYPE_ICONS = {
  city: '🏛️',
  town: '🏘️',
  village: '🏠',
  dungeon: '⚔️',
  building: '🏗️',
  room: '🚪',
  wilderness: '🌲',
  mountain: '⛰️',
  forest: '🌳',
  water: '🌊',
  cavern: '🕳️',
  temple: '⛩️',
  market: '🏪',
  portal: '🌀',
  generic: '📍'
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    LocationManager, 
    LOCATION_TYPES, 
    CONNECTION_TYPES,
    LOCATION_TYPE_ICONS 
  };
}
if (typeof window !== 'undefined') {
  window.LocationManager = LocationManager;
  window.LOCATION_TYPES = LOCATION_TYPES;
  window.CONNECTION_TYPES = CONNECTION_TYPES;
  window.LOCATION_TYPE_ICONS = LOCATION_TYPE_ICONS;
}
