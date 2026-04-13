/**
 * SoulWriter - AI Chat API Routes (Fastify)
 */

const MOSS_API_URL = 'http://192.168.0.107:13000';
const MOSS_API_KEY = 'sk-151Mv1xUiFwD5kTwopLPVMRJ5P8Eh947w9F80OaR8940Bysc';

async function aiRoutes(fastify, options) {
  
  // POST /api/v1/ai/chat
  fastify.post('/chat', async (request, reply) => {
    try {
      const { model, messages, temperature = 0.7, max_tokens = 2000 } = request.body || {};
      
      if (!messages || !Array.isArray(messages)) {
        return reply.status(400).send({ error: 'messages数组必填' });
      }
      
      const response = await fetch(`${MOSS_API_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOSS_API_KEY}`
        },
        body: JSON.stringify({
          model: model || 'MOSS',
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          temperature,
          max_tokens
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        return reply.status(response.status).send({ error });
      }
      
      const data = await response.json();
      return reply.send(data);
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: error.message });
    }
  });
  
  // POST /api/v1/ai/analyze/role
  fastify.post('/analyze/role', async (request, reply) => {
    try {
      const { role, context } = request.body || {};
      
      const prompt = `你是小说创作助手。请分析以下角色：

角色信息：${JSON.stringify(role, null, 2)}
上下文：${context || '无'}

请从以下角度给出详细建议：
1. 性格特点
2. 外貌描写
3. 心理活动
4. 说话风格
5. 与其他角色的关系建议`;

      const response = await fetch(`${MOSS_API_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOSS_API_KEY}`
        },
        body: JSON.stringify({
          model: 'MOSS',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
          max_tokens: 1500
        })
      });
      
      const data = await response.json();
      return reply.send(data);
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: error.message });
    }
  });
  
  // POST /api/v1/ai/suggest/plot
  fastify.post('/suggest/plot', async (request, reply) => {
    try {
      const { currentPlot, characters, world } = request.body || {};
      
      const prompt = `你是小说创作助手。基于以下信息，给出3个有趣的剧情发展方向：

当前剧情：${currentPlot || '无'}
主要角色：${characters || '无'}
世界观：${world || '无'}

每个建议请包含：
- 剧情发展方向
- 可能的人物互动
- 潜在的冲突点`;

      const response = await fetch(`${MOSS_API_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOSS_API_KEY}`
        },
        body: JSON.stringify({
          model: 'MOSS',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
          max_tokens: 1500
        })
      });
      
      const data = await response.json();
      return reply.send(data);
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: error.message });
    }
  });
}

module.exports = aiRoutes;
