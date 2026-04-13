/**
 * 女娲系统 API 路由
 * 
 * 两个分支：
 * 1. 详细写作 - 通过角色交流、推演丰富剧情
 * 2. 预测 - 延展故事，完善结局
 */

const NvwaService = require('../services/nvwa_service');

module.exports = async function nvwaRoutes(fastify) {
  
  // ============ 状态 ============
  
  // 获取女娲状态
  fastify.get('/api/v1/nvwa2/status', async (req, reply) => {
    const result = await NvwaService.getStatus();
    return result;
  });
  
  // ============ 详细写作分支 ============
  
  // 详细写作 - 角色对话推演
  fastify.post('/api/v1/nvwa2/detailed/chat', async (req, reply) => {
    const { unitId, characters, topic, context } = req.body;
    const result = await NvwaService.detailedChat(unitId, characters, topic, context);
    return result;
  });
  
  // 详细写作 - 丰富剧情
  fastify.post('/api/v1/nvwa2/detailed/enrich', async (req, reply) => {
    const { unitId, options } = req.body;
    const result = await NvwaService.enrichPlot(unitId, options);
    return result;
  });
  
  // 详细写作 - 角色互动生成
  fastify.post('/api/v1/nvwa2/detailed/interaction', async (req, reply) => {
    const { character1Id, character2Id, context, type } = req.body;
    const result = await NvwaService.generateInteraction(character1Id, character2Id, context, type);
    return result;
  });
  
  // ============ 预测分支 ============
  
  // 预测 - 延展故事
  fastify.post('/api/v1/nvwa2/predict/extend', async (req, reply) => {
    const { unitId, targetLength } = req.body;
    const result = await NvwaService.predictExtend(unitId, targetLength);
    return result;
  });
  
  // 预测 - 填补剧情空白
  fastify.post('/api/v1/nvwa2/predict/fill', async (req, reply) => {
    const { unitId, gaps } = req.body;
    const result = await NvwaService.fillGaps(unitId, gaps);
    return result;
  });
  
  // 预测 - 完善结局
  fastify.post('/api/v1/nvwa2/predict/conclude', async (req, reply) => {
    const { storyId, endingType } = req.body;
    const result = await NvwaService.concludeStory(storyId, endingType);
    return result;
  });
  
  // ============ 批量操作 ============
  
  // 批量丰富多个单元
  fastify.post('/api/v1/nvwa2/detailed/batch', async (req, reply) => {
    const { unitIds, options } = req.body;
    const result = await NvwaService.batchEnrich(unitIds, options);
    return result;
  });
  
  // ============ 评分相关 ============
  
  // 评估丰富度提升
  fastify.post('/api/v1/nvwa2/evaluate/enrichment', async (req, reply) => {
    const { unitId, beforeContent, afterContent } = req.body;
    const result = await NvwaService.evaluateEnrichment(unitId, beforeContent, afterContent);
    return result;
  });
  
};
