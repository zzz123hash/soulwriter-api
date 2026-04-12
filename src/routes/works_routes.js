/**
 * Works API 路由
 */

const worksStorage = require('../services/works_storage');

async function worksRoutes(fastify) {
  
  // ========== 书本操作 ==========
  
  // 创建新书本
  fastify.post('/api/v1/works/books', async (req, reply) => {
    const { bookId, title, author } = req.body;
    if (!bookId) return reply.status(400).send({ error: 'bookId required' });
    
    const dir = worksStorage.createBook(bookId, { title, author });
    return { success: true, bookId, dir };
  });
  
  // 列出所有书本
  fastify.get('/api/v1/works/books', async (req, reply) => {
    const books = worksStorage.listBooks();
    return { success: true, books };
  });
  
  // 获取书本信息
  fastify.get('/api/v1/works/books/:bookId', async (req, reply) => {
    const meta = worksStorage.getBookMeta(req.params.bookId);
    if (!meta) return reply.status(404).send({ error: 'Book not found' });
    return { success: true, meta };
  });
  
  // 更新书本信息
  fastify.put('/api/v1/works/books/:bookId', async (req, reply) => {
    const updated = worksStorage.updateBookMeta(req.params.bookId, req.body);
    return { success: true, meta: updated };
  });
  
  // 删除书本
  fastify.delete('/api/v1/works/books/:bookId', async (req, reply) => {
    worksStorage.deleteBook(req.params.bookId);
    return { success: true };
  });
  
  // ========== 通用实体 CRUD ==========
  
  // 保存实体
  fastify.post('/api/v1/works/:bookId/:entityType', async (req, reply) => {
    const { bookId, entityType } = req.params;
    const entity = req.body;
    
    if (!worksStorage.bookExists(bookId)) {
      return reply.status(404).send({ error: 'Book not found' });
    }
    
    const saved = worksStorage.save(bookId, entityType, entity);
    return { success: true, entity: saved };
  });
  
  // 读取实体
  fastify.get('/api/v1/works/:bookId/:entityType/:entityId', async (req, reply) => {
    const { bookId, entityType, entityId } = req.params;
    const entity = worksStorage.load(bookId, entityType, entityId);
    
    if (!entity) return reply.status(404).send({ error: 'Entity not found' });
    return { success: true, entity };
  });
  
  // 删除实体
  fastify.delete('/api/v1/works/:bookId/:entityType/:entityId', async (req, reply) => {
    const { bookId, entityType, entityId } = req.params;
    worksStorage.delete(bookId, entityType, entityId);
    return { success: true };
  });
  
  // 列出某类型所有实体
  fastify.get('/api/v1/works/:bookId/:entityType', async (req, reply) => {
    const { bookId, entityType } = req.params;
    const entities = worksStorage.list(bookId, entityType);
    return { success: true, entities };
  });
  
  // ========== 女娲专属 ==========
  
  // 保存角色灵魂
  fastify.post('/api/v1/works/:bookId/nvwa/souls', async (req, reply) => {
    const { bookId } = req.params;
    const soul = req.body;
    
    if (!worksStorage.bookExists(bookId)) {
      return reply.status(404).send({ error: 'Book not found' });
    }
    
    const saved = worksStorage.saveSoul(bookId, soul);
    return { success: true, soul: saved };
  });
  
  // 列出女娲角色
  fastify.get('/api/v1/works/:bookId/nvwa/souls', async (req, reply) => {
    const { bookId } = req.params;
    const souls = worksStorage.listSouls(bookId);
    return { success: true, souls };
  });
  
  // ========== 创世树 ==========
  
  // 保存种子
  fastify.post('/api/v1/works/:bookId/genesis/seeds', async (req, reply) => {
    const { bookId } = req.params;
    worksStorage.saveSeeds(bookId, req.body);
    return { success: true };
  });
  
  // 读取种子
  fastify.get('/api/v1/works/:bookId/genesis/seeds', async (req, reply) => {
    const { bookId } = req.params;
    const seeds = worksStorage.loadSeeds(bookId);
    return { success: true, seeds };
  });
  
  // 保存节点
  fastify.post('/api/v1/works/:bookId/genesis/nodes', async (req, reply) => {
    const { bookId } = req.params;
    const node = worksStorage.saveNode(bookId, req.body);
    return { success: true, node };
  });
  
  // 列出所有节点
  fastify.get('/api/v1/works/:bookId/genesis/nodes', async (req, reply) => {
    const { bookId } = req.params;
    const nodes = worksStorage.listNodes(bookId);
    return { success: true, nodes };
  });
}

module.exports = worksRoutes;
