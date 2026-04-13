/**
 * AI评分路由
 * 
 * 评分由AI判断，不是硬套规则
 */

const AIScoringService = require('../services/ai_scoring_service');

module.exports = async function scoringRoutes(fastify) {
  
  // ============ 角色评分 ============
  
  // 评估单个角色丰富度
  fastify.post('/api/v1/scoring/character', async (req, reply) => {
    const { role, fragments } = req.body;
    const result = await AIScoringService.evaluateCharacterRichness(role, fragments || []);
    return result;
  });
  
  // 批量评估角色
  fastify.post('/api/v1/scoring/characters/batch', async (req, reply) => {
    const { roles, fragmentsMap } = req.body;
    const result = await AIScoringService.batchEvaluateCharacters(roles || [], fragmentsMap || {});
    return result;
  });
  
  // ============ 单元视角评分 ============
  
  // 评估单元视角潜力
  fastify.post('/api/v1/scoring/unit/perspective', async (req, reply) => {
    const { unit } = req.body;
    const result = await AIScoringService.evaluateUnitPerspective(unit);
    return result;
  });
  
  // ============ 转写可行性 ============
  
  // 评估视角转写可行性
  fastify.post('/api/v1/scoring/rewrite/potential', async (req, reply) => {
    const { unit, sourceRole, targetRole } = req.body;
    const result = await AIScoringService.evaluateRewritePotential(unit, sourceRole, targetRole);
    return result;
  });
  
  // ============ 获取评分提示词 ============
  
  // 获取评分维度说明
  fastify.get('/api/v1/scoring/dimensions', async (req, reply) => {
    return {
      success: true,
      data: {
        dimensions: [
          { name: '素材量', description: '角色在多少片段中出现、占多少篇幅', weight: '30%' },
          { name: '对话量', description: '角色的对话数量和比例', weight: '20%' },
          { name: '记忆/背景', description: '角色的背景故事、记忆丰富度', weight: '20%' },
          { name: '关系网络', description: '与其他角色的互动关系', weight: '15%' },
          { name: '冲突参与', description: '是否参与核心冲突', weight: '15%' }
        ],
        thresholds: {
          firstPerson: 80,
          thirdPerson: 50,
          sideStory: 0
        }
      }
    };
  });
  
};
