/**
 * Genesis × Nvwa 联动 API 路由
 * 
 * 使用方式：fastify.register(genesisNvwaRoutes, { db })
 */

const genesisNvwa = require('../modules/genesis_nvwa_link');

async function genesisNvwaRoutes(fastify, options) {
  const db = options?.db;
  
  // ========== 创世 -> 女娲 初始化 ==========
  
  // 从创世种子初始化女娲角色
  fastify.post('/api/genesis/:seedId/init-nvwa', async (req, reply) => {
    if (!db) return reply.status(500).send({ error: 'DB not available' });
    const result = genesisNvwa.initNvwaFromGenesis(db, req.params.seedId);
    if (!result.success) {
      return reply.status(404).send(result);
    }
    return result;
  });
  
  // ========== 女娲 -> 创世 背景获取 ==========
  
  // 获取某角色的创世背景
  fastify.get('/api/genesis/:seedId/nvwa-context/:soulId', async (req, reply) => {
    if (!db) return reply.status(500).send({ error: 'DB not available' });
    const context = genesisNvwa.getGenesisContextForTick(db, req.params.soulId);
    if (!context) {
      return reply.status(404).send({ error: 'Context not found' });
    }
    return { success: true, context };
  });
  
  // ========== 同步操作 ==========
  
  // 同步创世节点变更到女娲角色
  fastify.post('/api/genesis/nodes/:nodeId/sync-to-nvwa', async (req, reply) => {
    if (!db) return reply.status(500).send({ error: 'DB not available' });
    genesisNvwa.syncNodeToSoul(db, req.params.nodeId);
    return { success: true };
  });
  
  // 创建角色节点时自动创建女娲角色
  fastify.post('/api/genesis/nodes/:nodeId/create-nvwa-soul', async (req, reply) => {
    if (!db) return reply.status(500).send({ error: 'DB not available' });
    const node = db.prepare('SELECT * FROM genesis_nodes WHERE id = ?').get(req.params.nodeId);
    if (!node) {
      return reply.status(404).send({ error: 'Node not found' });
    }
    const result = genesisNvwa.onGenesisNodeCreated(db, node);
    return { success: true, result };
  });
  
  // ========== 批量操作 ==========
  
  // 为种子下的所有角色创建女娲角色
  fastify.post('/api/genesis/:seedId/init-all-nvwa', async (req, reply) => {
    if (!db) return reply.status(500).send({ error: 'DB not available' });
    const result = genesisNvwa.initNvwaFromGenesis(db, req.params.seedId);
    return result;
  });
  
  // 获取种子的女娲角色列表
  fastify.get('/api/genesis/:seedId/nvwa-souls', async (req, reply) => {
    if (!db) return reply.status(500).send({ error: 'DB not available' });
    const souls = db.prepare(
      "SELECT * FROM nvwa_souls WHERE seedId = ? AND status = 'active'"
    ).all(req.params.seedId);
    return { success: true, souls };
  });
}

module.exports = genesisNvwaRoutes;
