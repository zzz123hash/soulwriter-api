/**
 * Items Module - 物品管理模块
 * 物品清单、属性、持有者管理
 */

class ItemManager {
  constructor() {
    this.items = [];
    this.listeners = [];
  }
  
  // 创建物品
  create(itemData) {
    const item = {
      id: this.generateId(),
      name: itemData.name || '未命名物品',
      type: itemData.type || 'misc',  // weapon, armor, potion, misc
      description: itemData.description || '',
      attributes: itemData.attributes || {},
      ownerId: itemData.ownerId || null,
      locationId: itemData.locationId || null,
      rarity: itemData.rarity || 'common', // common, rare, epic, legendary
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.items.push(item);
    this.emit('create', item);
    return item;
  }
  
  // 获取物品
  get(id) {
    return this.items.find(item => item.id === id);
  }
  
  // 获取所有物品
  getAll() {
    return [...this.items];
  }
  
  // 按类型获取
  getByType(type) {
    return this.items.filter(item => item.type === type);
  }
  
  // 按持有者获取
  getByOwner(ownerId) {
    return this.items.filter(item => item.ownerId === ownerId);
  }
  
  // 按位置获取
  getByLocation(locationId) {
    return this.items.filter(item => item.locationId === locationId);
  }
  
  // 更新物品
  update(id, updates) {
    const item = this.get(id);
    if (!item) return null;
    
    Object.assign(item, updates, {
      updatedAt: new Date().toISOString()
    });
    
    this.emit('update', item);
    return item;
  }
  
  // 删除物品
  delete(id) {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return false;
    
    const item = this.items.splice(index, 1)[0];
    this.emit('delete', item);
    return true;
  }
  
  // 转移持有者
  transfer(id, newOwnerId) {
    return this.update(id, { ownerId: newOwnerId });
  }
  
  // 移动位置
  moveTo(id, newLocationId) {
    return this.update(id, { locationId: newLocationId });
  }
  
  // 生成ID
  generateId() {
    return `item_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
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
    this.items = data.map(item => ({
      ...item,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString()
    }));
    this.emit('import', this.items);
  }
  
  // 导出数据
  export() {
    return JSON.stringify(this.items, null, 2);
  }
}

// 物品类型常量
const ITEM_TYPES = {
  WEAPON: 'weapon',
  ARMOR: 'armor',
  POTION: 'potion',
  ACCESSORY: 'accessory',
  MATERIAL: 'material',
  KEY_ITEM: 'key_item',
  MISC: 'misc'
};

// 稀有度常量
const ITEM_RARITIES = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
};

// 稀有度颜色
const RARITY_COLORS = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b'
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ItemManager, ITEM_TYPES, ITEM_RARITIES, RARITY_COLORS };
}
if (typeof window !== 'undefined') {
  window.ItemManager = ItemManager;
  window.ITEM_TYPES = ITEM_TYPES;
  window.ITEM_RARITIES = ITEM_RARITIES;
  window.RARITY_COLORS = RARITY_COLORS;
}
