/**
 * 绘梦 - 创世树 (GenesisTree)
 * 
 * 剧情分支树生成管理
 * 基于旧版 SoulWriter 的 GenesisTree 移植
 */

const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

// 初始化数据库
function initGenesisDB(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS genesis_seeds (
      id TEXT PRIMARY KEY,
      coreConflict TEXT DEFAULT '',
      backgroundTone TEXT DEFAULT '',
      keyForeshadowing TEXT DEFAULT '',
      centralQuestion TEXT DEFAULT '',
      protagonist TEXT DEFAULT '',
      setting TEXT DEFAULT '',
      stakes TEXT DEFAULT '',
      tone TEXT DEFAULT '',
      type TEXT DEFAULT 'world_building',
      status TEXT DEFAULT 'active',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS genesis_nodes (
      id TEXT PRIMARY KEY,
      seedId TEXT,
      parentId TEXT,
      type TEXT DEFAULT 'plot_twist',
      label TEXT DEFAULT '',
      description TEXT DEFAULT '',
      positionX REAL DEFAULT 0,
      positionY REAL DEFAULT 0,
      depth INTEGER DEFAULT 0,
      childrenCount INTEGER DEFAULT 0,
      metadata TEXT DEFAULT '{}',
      status TEXT DEFAULT 'active',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (seedId) REFERENCES genesis_seeds(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS genesis_edges (
      id TEXT PRIMARY KEY,
      sourceId TEXT NOT NULL,
      targetId TEXT NOT NULL,
      type TEXT DEFAULT 'default',
      label TEXT DEFAULT '',
      metadata TEXT DEFAULT '{}',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sourceId) REFERENCES genesis_nodes(id) ON DELETE CASCADE,
      FOREIGN KEY (targetId) REFERENCES genesis_nodes(id) ON DELETE CASCADE
    );
  `);
}

// 创建种子
function createSeed(db, data = {}) {
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO genesis_seeds (id, coreConflict, backgroundTone, keyForeshadowing, 
      centralQuestion, protagonist, setting, stakes, tone, type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.coreConflict || '',
    data.backgroundTone || '',
    data.keyForeshadowing || '',
    data.centralQuestion || '',
    data.protagonist || '',
    data.setting || '',
    data.stakes || '',
    data.tone || '',
    data.type || 'world_building'
  );
  return id;
}

// 获取种子
function getSeed(db, seedId) {
  return db.prepare('SELECT * FROM genesis_seeds WHERE id = ?').get(seedId);
}

// 创建节点
function createNode(db, data = {}) {
  const id = data.id || `node_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const parentId = data.parentId || null;
  
  // 计算深度
  let depth = 0;
  if (parentId) {
    const parent = db.prepare('SELECT depth FROM genesis_nodes WHERE id = ?').get(parentId);
    if (parent) depth = parent.depth + 1;
  }
  
  db.prepare(`
    INSERT INTO genesis_nodes (id, seedId, parentId, type, label, description, 
      positionX, positionY, depth, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.seedId,
    parentId,
    data.type || 'plot_twist',
    data.label || '未命名节点',
    data.description || '',
    data.positionX || 0,
    data.positionY || 0,
    depth,
    JSON.stringify(data.metadata || {})
  );
  
  // 更新父节点childrenCount
  if (parentId) {
    db.prepare('UPDATE genesis_nodes SET childrenCount = childrenCount + 1 WHERE id = ?').run(parentId);
  }
  
  return id;
}

// 获取节点
function getNode(db, nodeId) {
  const node = db.prepare('SELECT * FROM genesis_nodes WHERE id = ?').get(nodeId);
  if (node && node.metadata) {
    node.metadata = JSON.parse(node.metadata);
  }
  return node;
}

// 获取子节点
function getChildNodes(db, parentId) {
  return db.prepare('SELECT * FROM genesis_nodes WHERE parentId = ? ORDER BY createdAt').all(parentId);
}

// 获取所有节点（按种子）
function getNodesBySeed(db, seedId) {
  return db.prepare('SELECT * FROM genesis_nodes WHERE seedId = ? ORDER BY depth, positionY').all(seedId);
}

// 更新节点
function updateNode(db, nodeId, data = {}) {
  const updates = [];
  const values = [];
  
  if (data.label !== undefined) { updates.push('label = ?'); values.push(data.label); }
  if (data.description !== undefined) { updates.push('description = ?'); values.push(data.description); }
  if (data.positionX !== undefined) { updates.push('positionX = ?'); values.push(data.positionX); }
  if (data.positionY !== undefined) { updates.push('positionY = ?'); values.push(data.positionY); }
  if (data.type !== undefined) { updates.push('type = ?'); values.push(data.type); }
  if (data.metadata !== undefined) { updates.push('metadata = ?'); values.push(JSON.stringify(data.metadata)); }
  
  updates.push('updatedAt = CURRENT_TIMESTAMP');
  values.push(nodeId);
  
  db.prepare(`UPDATE genesis_nodes SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  return true;
}

// 创建边
function createEdge(db, sourceId, targetId, data = {}) {
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO genesis_edges (id, sourceId, targetId, type, label, metadata)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, sourceId, targetId, data.type || 'default', data.label || '', JSON.stringify(data.metadata || {}));
  return id;
}

// 获取边
function getEdgesBySeed(db, seedId) {
  return db.prepare(`
    SELECT e.* FROM genesis_edges e
    JOIN genesis_nodes n ON e.sourceId = n.id
    WHERE n.seedId = ?
  `).all(seedId);
}

// 获取路径（从根到节点）
function getPathToNode(db, nodeId) {
  const path = [];
  let current = getNode(db, nodeId);
  
  while (current && current.parentId) {
    path.unshift(current);
    current = getNode(db, current.parentId);
  }
  
  if (current) path.unshift(current);
  return path;
}

// 生成树结构（用于前端）
function buildTree(db, seedId) {
  const nodes = getNodesBySeed(db, seedId);
  const edges = getEdgesBySeed(db, seedId);
  
  // 构建节点映射
  const nodeMap = {};
  nodes.forEach(n => {
    n.children = [];
    n.childrenCount = 0;
    nodeMap[n.id] = n;
  });
  
  // 构建树
  const roots = [];
  nodes.forEach(n => {
    if (n.parentId && nodeMap[n.parentId]) {
      nodeMap[n.parentId].children.push(n);
      nodeMap[n.parentId].childrenCount++;
    } else {
      roots.push(n);
    }
  });
  
  // 构建边列表
  const edgeList = edges.map(e => ({
    id: e.id,
    source: e.sourceId,
    target: e.targetId,
    type: e.type,
    label: e.label
  }));
  
  return {
    nodes: nodes.map(n => ({
      id: n.id,
      type: n.type,
      label: n.label,
      description: n.description,
      depth: n.depth,
      position: { x: n.positionX, y: n.positionY },
      childrenCount: n.childrenCount,
      parentId: n.parentId,
      metadata: n.metadata
    })),
    edges: edgeList,
    roots: roots.map(r => r.id)
  };
}

// 删除节点（及其子节点）
function deleteNode(db, nodeId) {
  // 先删除所有后代
  const deleteDescendants = (id) => {
    const children = db.prepare('SELECT id FROM genesis_nodes WHERE parentId = ?').all(id);
    children.forEach(c => deleteDescendants(c.id));
    db.prepare('DELETE FROM genesis_nodes WHERE id = ?').run(id);
  };
  
  deleteDescendants(nodeId);
  return true;
}

module.exports = {
  initGenesisDB,
  createSeed,
  getSeed,
  createNode,
  getNode,
  getChildNodes,
  getNodesBySeed,
  updateNode,
  createEdge,
  getEdgesBySeed,
  getPathToNode,
  buildTree,
  deleteNode
};
