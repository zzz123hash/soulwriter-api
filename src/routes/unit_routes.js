/**
 * 单元编辑系统 API 路由
 * 前缀: /api/v1/unit
 */

const UnitService = require('../services/unit_service');

module.exports = async function unitRoutes(fastify) {
  
  // ============ 单元 CRUD ============
  
  // 获取项目的所有单元
  fastify.get('/api/v1/unit/list/:bookId', async (req, reply) => {
    const { bookId } = req.params;
    const units = UnitService.getUnitsByBook(bookId);
    return { success: true, data: units };
  });
  
  // 创建单元
  fastify.post('/api/v1/unit/create', async (req, reply) => {
    const { bookId, title, perspective, settings } = req.body;
    const unit = UnitService.createUnit(bookId, { title, perspective, settings });
    return { success: true, data: unit };
  });
  
  // 获取单元详情
  fastify.get('/api/v1/unit/:unitId', async (req, reply) => {
    const { unitId } = req.params;
    const unit = UnitService.getUnit(unitId);
    if (!unit) return reply.status(404).send({ success: false, message: 'Unit not found' });
    return { success: true, data: unit };
  });
  
  // 更新单元
  fastify.put('/api/v1/unit/:unitId', async (req, reply) => {
    const { unitId } = req.params;
    const unit = UnitService.updateUnit(unitId, req.body);
    return { success: true, data: unit };
  });
  
  // 删除单元
  fastify.delete('/api/v1/unit/:unitId', async (req, reply) => {
    const { unitId } = req.params;
    UnitService.deleteUnit(unitId);
    return { success: true };
  });
  
  // ============ 片段 CRUD ============
  
  // 添加片段到单元
  fastify.post('/api/v1/unit/:unitId/fragment', async (req, reply) => {
    const { unitId } = req.params;
    const fragment = UnitService.addFragment(unitId, req.body);
    return { success: true, data: fragment };
  });
  
  // 更新片段
  fastify.put('/api/v1/fragment/:fragmentId', async (req, reply) => {
    const { fragmentId } = req.params;
    const fragment = UnitService.updateFragment(fragmentId, req.body);
    return { success: true, data: fragment };
  });
  
  // 删除片段
  fastify.delete('/api/v1/fragment/:fragmentId', async (req, reply) => {
    const { fragmentId } = req.params;
    UnitService.deleteFragment(fragmentId);
    return { success: true };
  });
  
  // 重新排序片段
  fastify.put('/api/v1/unit/:unitId/reorder', async (req, reply) => {
    const { unitId } = req.params;
    const { fragmentIds } = req.body;
    UnitService.reorderFragments(unitId, fragmentIds);
    return { success: true };
  });
  
  // ============ 角色评分 ============
  
  // 计算角色的视角评分
  fastify.get('/api/v1/unit/:unitId/score/:roleId', async (req, reply) => {
    const { unitId, roleId } = req.params;
    const scores = UnitService.calculateRoleScores(unitId, roleId);
    return { success: true, data: scores };
  });
  
  // 获取单元所有角色的评分
  fastify.get('/api/v1/unit/:unitId/scores', async (req, reply) => {
    const { unitId } = req.params;
    const scores = UnitService.calculateAllRoleScores(unitId);
    return { success: true, data: scores };
  });
  
  // ============ 视角转写 ============
  
  // 执行视角转写
  fastify.post('/api/v1/unit/:unitId/rewrite', async (req, reply) => {
    const { unitId } = req.params;
    const { targetRoleId, perspectiveType } = req.body;
    const result = await UnitService.rewritePerspective(unitId, targetRoleId, perspectiveType);
    return result;
  });
  
  // ============ 小说生成 ============
  
  // 生成小说
  fastify.post('/api/v1/unit/:unitId/generate', async (req, reply) => {
    const { unitId } = req.params;
    const { settings } = req.body;
    const result = await UnitService.generateNovel(unitId, settings);
    return result;
  });
  
  // ============ 批量操作 ============
  
  // 批量添加片段（从节点批量导入）
  fastify.post('/api/v1/unit/:unitId/fragments/batch', async (req, reply) => {
    const { unitId } = req.params;
    const { fragments } = req.body;
    const results = [];
    for (const frag of fragments) {
      const f = UnitService.addFragment(unitId, frag);
      if (f) results.push(f);
    }
    return { success: true, data: results };
  });
  
  // 复制单元
  fastify.post('/api/v1/unit/:unitId/clone', async (req, reply) => {
    const { unitId } = req.params;
    const result = await UnitService.cloneUnit(unitId);
    return result;
  });
  
  // 合并单元
  fastify.post('/api/v1/unit/merge', async (req, reply) => {
    const { sourceUnitIds, targetBookId } = req.body;
    const result = await UnitService.mergeUnits(sourceUnitIds, targetBookId);
    return result;
  });
  
};
