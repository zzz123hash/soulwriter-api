/**
 * 文化适配系统 API 路由
 * 
 * 功能：
 * 1. 文化元素分析
 * 2. 跨文化迁移
 * 3. 异域元素保留
 */

const CultureAdapter = require('../services/culture_adapter');

module.exports = async function cultureRoutes(fastify) {
  
  // ============ 分析 ============
  
  // 分析文本中的文化元素
  fastify.post('/api/v1/culture/analyze', async (req, reply) => {
    const { text, sourceCulture, targetCulture } = req.body;
    const result = await CultureAdapter.analyzeElements(text, sourceCulture, targetCulture);
    return result;
  });
  
  // 批量分析小说
  fastify.post('/api/v1/culture/analyzeNovel', async (req, reply) => {
    const { content, sourceCulture, targetCulture } = req.body;
    const result = await CultureAdapter.analyzeNovel(content, sourceCulture, targetCulture);
    return result;
  });
  
  // ============ 转写 ============
  
  // 文化适配转写
  fastify.post('/api/v1/culture/adapt', async (req, reply) => {
    const { text, sourceCulture, targetCulture, options } = req.body;
    const result = await CultureAdapter.adaptCulture(text, sourceCulture, targetCulture, options);
    return result;
  });
  
  // 批量转写
  fastify.post('/api/v1/culture/adaptBatch', async (req, reply) => {
    const { texts, sourceCulture, targetCulture, options } = req.body;
    const result = await CultureAdapter.adaptBatch(texts, sourceCulture, targetCulture, options);
    return result;
  });
  
  // ============ 特殊元素 ============
  
  // 获取异域元素列表
  fastify.get('/api/v1/culture/foreignElements/:sourceCulture/:targetCulture', async (req, reply) => {
    const { sourceCulture, targetCulture } = req.params;
    const elements = CultureAdapter.getForeignElements(sourceCulture, targetCulture);
    return { success: true, data: elements };
  });
  
  // 标记异域元素（哪些需要保留）
  fastify.post('/api/v1/culture/preserveElements', async (req, reply) => {
    const { text, sourceCulture, elements } = req.body;
    const result = await CultureAdapter.preserveElements(text, sourceCulture, elements);
    return result;
  });
  
  // ============ 配置 ============
  
  // 获取文化配置
  fastify.get('/api/v1/culture/config/:sourceCulture/:targetCulture', async (req, reply) => {
    const { sourceCulture, targetCulture } = req.params;
    const config = CultureAdapter.getConfig(sourceCulture, targetCulture);
    return { success: true, data: config };
  });
  
  // 更新文化配置
  fastify.put('/api/v1/culture/config', async (req, reply) => {
    const { sourceCulture, targetCulture, config } = req.body;
    const result = await CultureAdapter.updateConfig(sourceCulture, targetCulture, config);
    return result;
  });
  
};
