/**
 * Genesis × Nvwa 联动模块
 * 
 * 实现创世树和女娲引擎的数据打通
 */

const crypto = require('crypto');

/**
 * 从创世种子初始化女娲角色
 */
function initNvwaFromGenesis(db, seedId) {
  // 获取种子信息
  const seed = db.prepare('SELECT * FROM genesis_seeds WHERE id = ?').get(seedId);
  if (!seed) return { success: false, error: 'Seed not found' };
  
  // 获取所有节点（作为角色候选）
  const nodes = db.prepare('SELECT * FROM genesis_nodes WHERE seedId = ?').all(seedId);
  
  // 筛选类型为 character 的节点创建为女娲角色
  const characterNodes = nodes.filter(n => 
    n.type === 'character' || 
    n.type === 'protagonist' || 
    n.type === 'antagonist' ||
    n.type === 'supporting'
  );
  
  const created = [];
  for (const node of characterNodes) {
    const attributes = parseNodeAttributes(node);
    const relationships = parseNodeRelationships(node, nodes);
    
    const id = crypto.randomUUID();
    db.prepare(`
      INSERT INTO nvwa_souls (id, seedId, name, type, role, attributes, relationships, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      id,
      seedId,
      node.label,
      node.type,
      node.role || '',
      JSON.stringify(attributes),
      JSON.stringify(relationships)
    );
    
    created.push({ id, name: node.label, type: node.type });
  }
  
  // 如果没有角色，创建一个默认主角
  if (created.length === 0 && nodes.length > 0) {
    const mainNode = nodes[0];
    const id = crypto.randomUUID();
    db.prepare(`
      INSERT INTO nvwa_souls (id, seedId, name, type, role, attributes, relationships, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      id, seedId, mainNode.label, mainNode.type || 'unknown',
      'protagonist', '{}', '[]'
    );
    created.push({ id, name: mainNode.label, type: mainNode.type });
  }
  
  return { success: true, created };
}

/**
 * 解析节点属性
 */
function parseNodeAttributes(node) {
  const attrs = {};
  
  // 从 metadata 或 content 中提取属性
  const meta = typeof node.metadata === 'string' 
    ? JSON.parse(node.metadata || '{}') 
    : (node.metadata || {});
  
  // 基础属性
  if (node.name) attrs.name = node.name;
  if (node.role) attrs.role = node.role;
  
  // 从 content 提取描述
  if (node.content) {
    attrs.description = node.content.substring(0, 200);
  }
  
  // 从 metadata 提取详细属性
  if (meta.personality) attrs.personality = meta.personality;
  if (meta.background) attrs.background = meta.background;
  if (meta.goal) attrs.goal = meta.goal;
  if (meta.conflict) attrs.conflict = meta.conflict;
  
  // 关系数量作为社交属性
  if (meta.relationshipCount) attrs.socialConnections = meta.relationshipCount;
  
  return attrs;
}

/**
 * 解析节点关系
 */
function parseNodeRelationships(node, allNodes) {
  const relationships = [];
  
  // 查找与此节点相连的边
  const edges = [];
  try {
    const edgesData = db ? db.prepare('SELECT * FROM genesis_edges WHERE sourceId = ? OR targetId = ?').all(node.id, node.id) : [];
    for (const edge of edgesData) {
      const otherId = edge.sourceId === node.id ? edge.targetId : edge.sourceId;
      const otherNode = allNodes.find(n => n.id === otherId);
      if (otherNode) {
        relationships.push({
          targetId: otherId,
          targetName: otherNode.label,
          type: edge.relation || 'related',
          weight: edge.weight || 1
        });
      }
    }
  } catch (e) {}
  
  return relationships;
}

/**
 * 获取女娲推演需要的创世背景
 */
function getGenesisContextForTick(db, soulId) {
  const soul = db.prepare('SELECT * FROM nvwa_souls WHERE id = ?').get(soulId);
  if (!soul || !soul.seedId) return null;
  
  const seed = db.prepare('SELECT * FROM genesis_seeds WHERE id = ?').get(soul.seedId);
  if (!seed) return null;
  
  // 获取相关的剧情节点
  const relatedNodes = db.prepare(`
    SELECT * FROM genesis_nodes 
    WHERE seedId = ? 
    ORDER BY createdAt DESC 
    LIMIT 10
  `).all(soul.seedId);
  
  // 构建背景描述
  let context = `【世界观】${seed.title || '未知世界观'}\n`;
  if (seed.content) {
    context += seed.content.substring(0, 300) + '\n';
  }
  
  context += '\n【相关设定节点】\n';
  for (const n of relatedNodes.slice(0, 5)) {
    context += `- ${n.type}: ${n.label}`;
    if (n.content) context += ` (${n.content.substring(0, 50)})`;
    context += '\n';
  }
  
  // 获取关系角色
  const soulRelationships = typeof soul.relationships === 'string' 
    ? JSON.parse(soul.relationships || '[]') 
    : (soul.relationships || []);
  
  if (soulRelationships.length > 0) {
    context += '\n【当前角色关系】\n';
    for (const rel of soulRelationships) {
      context += `- ${rel.targetName}: ${rel.type}\n`;
    }
  }
  
  return {
    worldTitle: seed.title,
    worldDescription: context,
    genre: seed.metadata?.genre || 'unknown',
    relatedNodes: relatedNodes.map(n => ({ type: n.type, label: n.label, content: n.content })),
    relationships: soulRelationships
  };
}

/**
 * 同步创世节点变更到女娲角色
 */
function syncNodeToSoul(db, nodeId) {
  const node = db.prepare('SELECT * FROM genesis_nodes WHERE id = ?').get(nodeId);
  if (!node) return;
  
  // 查找对应的女娲角色
  const soul = db.prepare('SELECT * FROM nvwa_souls WHERE seedId = ? AND name = ?')
    .get(node.seedId, node.label);
  
  if (!soul) return;
  
  // 更新属性
  const attrs = parseNodeAttributes(node);
  const currentAttrs = typeof soul.attributes === 'string' 
    ? JSON.parse(soul.attributes || '{}') 
    : (soul.attributes || {});
  
  const updated = { ...currentAttrs, ...attrs };
  
  db.prepare('UPDATE nvwa_souls SET attributes = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
    .run(JSON.stringify(updated), soul.id);
}

/**
 * 创建创世节点时自动创建女娲角色
 */
function onGenesisNodeCreated(db, node) {
  if (['character', 'protagonist', 'antagonist', 'supporting'].includes(node.type)) {
    const id = crypto.randomUUID();
    const attributes = parseNodeAttributes(node);
    
    db.prepare(`
      INSERT INTO nvwa_souls (id, seedId, name, type, role, attributes, relationships, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      id,
      node.seedId,
      node.label,
      node.type,
      node.role || '',
      JSON.stringify(attributes),
      '[]'
    );
    
    return { id, name: node.label };
  }
  return null;
}

module.exports = {
  initNvwaFromGenesis,
  getGenesisContextForTick,
  syncNodeToSoul,
  onGenesisNodeCreated
};
