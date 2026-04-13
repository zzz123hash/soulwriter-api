/**
 * AI评分服务
 * 
 * 核心：评分由AI判断，不是硬套规则
 * 内置提示词让AI评估角色丰富度
 */

const path = require('path');
const fs = require('fs');

// 内置提示词
const SCORING_PROMPTS = {
  // 角色丰富度评分
  characterRichness: `你是一个专业的小说角色评估专家。请评估以下角色的丰富程度。

评估维度：
1. 人物描写（外貌、性格、语言风格）
2. 行为动机（是否有清晰的行动逻辑）
3. 情感深度（内心世界是否丰富）
4. 关系网络（与其他角色的互动）
5. 故事参与度（在主线/支线中的戏份）

请返回JSON格式：
{
  "richnessScore": 0-100,
  "materialScore": 0-100,  // 素材量（出现次数、内容长度）
  "dialogueScore": 0-100,  // 对话量
  "memoryScore": 0-100,    // 记忆/背景
  "relationshipScore": 0-100, // 关系网络
  "totalScore": 0-100,
  "analysis": "简要分析",
  "canRewrite": {
    "firstPerson": true/false,  // >80分才能第一人称
    "thirdPerson": true/false,
    "sideStory": true/false     // <50分只能同人文
  }
}`,

  // 单元视角评分
  unitPerspective: `你是一个专业的小说视角分析专家。请分析以下单元中各角色的视角转写潜力。

单元信息：
- 章节标题：{title}
- 片段数量：{fragmentCount}
- 涉及角色：{characters}

每个角色的评分维度：
1. 素材量（该角色在多少片段中出现、占多少篇幅）
2. 对话量（该角色的对话比例）
3. 冲突参与（是否参与核心冲突）
4. 视角潜力（是否适合作为主/辅视角）

返回JSON：
{
  "characters": [
    {
      "name": "角色名",
      "materialScore": 0-100,
      "dialogueScore": 0-100,
      "conflictScore": 0-100,
      "totalScore": 0-100,
      "perspectiveType": "firstPerson/thirdPerson/sideStory",
      "canRewrite": true/false,
      "reason": "评分理由"
    }
  ],
  "recommendedMainPerspective": "角色名",
  "analysis": "整体分析"
}`,

  // 视角转写评估
  rewritePotential: `你是一个专业的小说视角转写评估专家。请评估将以下单元从角色A视角转写到角色B视角的可行性。

原视角角色A：{sourceRole}
目标视角角色B：{targetRole}

单元内容摘要：
{summary}

评估要点：
1. 角色B的素材是否足够支撑第一人称
2. 转写后故事是否连贯
3. 是否会变成同人小说

返回JSON：
{
  "feasibility": true/false,
  "recommendedType": "firstPerson/thirdPerson/sideStory",
  "score": 0-100,
  "issues": ["问题1", "问题2"],
  "suggestions": ["建议1", "建议2"]
}`
};

class AIScoringService {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, '../../config/default.json');
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (e) {
      return {
        ai: {
          defaultProvider: 'omnihex',
          providers: {
            omnihex: {
              baseUrl: 'https://apimark.omnihex.xyz',
              model: 'MiniMax-M2.7-highspeed',
              apiKey: ''
            }
          }
        }
      };
    }
  }

  /**
   * 获取AI配置（支持切换不同API）
   */
  getAIConfig() {
    const config = this.loadConfig();
    const provider = config.ai?.defaultProvider || 'omnihex';
    return {
      provider,
      config: config.ai?.providers?.[provider] || config.ai?.providers?.omnihex
    };
  }

  /**
   * 调用AI
   */
  async callAI(systemPrompt, userPrompt) {
    const { config } = this.getAIConfig();
    
    if (!config || !config.baseUrl) {
      throw new Error('AI config not found');
    }

    const url = `${config.baseUrl}/v1/chat/completions`;
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (config.apiKey) {
      headers.Authorization = `Bearer ${config.apiKey}`;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.model || 'MiniMax-M2.7-highspeed',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3, // 低温度保证评分稳定
        max_tokens: 4000
      })
    });

    if (!res.ok) {
      throw new Error(`AI API error: ${res.status}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || 
                   data?.choices?.[0]?.message?.reasoning_content || '';
    
    return content;
  }

  /**
   * 解析AI返回的JSON
   */
  parseAIResponse(content) {
    try {
      return JSON.parse(content);
    } catch (e) {
      // 尝试提取JSON
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch (e2) {
          return null;
        }
      }
      return null;
    }
  }

  /**
   * 评估角色丰富度
   * @param {Object} role - 角色对象
   * @param {Array} fragments - 包含该角色的片段列表
   */
  async evaluateCharacterRichness(role, fragments) {
    const systemPrompt = SCORING_PROMPTS.characterRichness;
    
    const userPrompt = `角色信息：
- 名称：${role.title || role.name}
- 类型：${role.type || '人类'}
- 性别：${role.gender || '未知'}
- 年龄：${role.age || '未知'}
- 特点：${role.feature || '无'}
- 性格：${role.personality || '无'}
- 介绍：${role.description || '无'}

涉及片段数：${fragments.length}

请进行评分。`;

    try {
      const content = await this.callAI(systemPrompt, userPrompt);
      const result = this.parseAIResponse(content);
      
      if (result) {
        return {
          success: true,
          data: {
            roleId: role.id || role.title,
            ...result
          }
        };
      }
      
      return { success: false, message: 'Failed to parse AI response' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  /**
   * 评估单元视角潜力
   * @param {Object} unit - 单元对象
   */
  async evaluateUnitPerspective(unit) {
    const fragments = unit.fragments || [];
    const characters = this.extractCharacters(fragments);
    
    const userPrompt = `章节标题：${unit.title}
片段数量：${fragments.length}
涉及角色：${characters.join(', ') || '无'}

请分析各角色的视角转写潜力。`;

    try {
      const content = await this.callAI(SCORING_PROMPTS.unitPerspective, userPrompt);
      const result = this.parseAIResponse(content);
      
      if (result) {
        return {
          success: true,
          data: {
            unitId: unit.id,
            ...result
          }
        };
      }
      
      return { success: false, message: 'Failed to parse AI response' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  /**
   * 评估视角转写可行性
   * @param {Object} unit - 单元对象
   * @param {string} sourceRole - 原视角角色
   * @param {string} targetRole - 目标视角角色
   */
  async evaluateRewritePotential(unit, sourceRole, targetRole) {
    const fragments = unit.fragments || [];
    const summary = this.generateSummary(fragments);
    
    const userPrompt = `原视角角色A：${sourceRole}
目标视角角色B：${targetRole}

单元内容摘要：
${summary}

请评估转写可行性。`;

    try {
      const content = await this.callAI(SCORING_PROMPTS.rewritePotential, userPrompt);
      const result = this.parseAIResponse(content);
      
      if (result) {
        return {
          success: true,
          data: {
            sourceRole,
            targetRole,
            ...result
          }
        };
      }
      
      return { success: false, message: 'Failed to parse AI response' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  /**
   * 从片段中提取角色列表
   */
  extractCharacters(fragments) {
    const charSet = new Set();
    for (const f of fragments) {
      for (const c of (f.characters || [])) {
        charSet.add(c);
      }
    }
    return Array.from(charSet);
  }

  /**
   * 生成片段摘要
   */
  generateSummary(fragments) {
    return fragments.map((f, i) => 
      `【片段${i + 1}】${f.time || ''} ${f.place || ''} - ${(f.characters || []).join(', ')}: ${(f.content || '').substring(0, 200)}`
    ).join('\n\n');
  }

  /**
   * 批量评估角色
   */
  async batchEvaluateCharacters(roles, fragmentsMap) {
    const results = [];
    
    for (const role of roles) {
      const roleFragments = fragmentsMap[role.id || role.title] || [];
      const result = await this.evaluateCharacterRichness(role, roleFragments);
      results.push(result);
    }
    
    return {
      success: true,
      data: results
    };
  }
}

// 导出单例
const scoringService = new AIScoringService();
module.exports = scoringService;
