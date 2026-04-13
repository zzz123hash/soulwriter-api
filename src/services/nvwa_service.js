/**
 * 女娲服务
 * 
 * 两个分支：
 * 1. 详细写作 - 通过角色交流、推演丰富剧情
 * 2. 预测 - 延展故事，完善结局
 */

const path = require('path');
const fs = require('fs');

// 提示词模板
const PROMPTS = {
  // 详细写作 - 角色对话
  detailedChat: `你是一个专业的小说对话生成专家。请根据以下场景生成角色之间的对话。

场景信息：
- 话题：{topic}
- 背景：{context}
- 角色：{characters}

要求：
1. 对话要符合每个角色的性格、语言风格
2. 体现角色之间的关系
3. 推动剧情发展
4. 细节丰富，动作、神态、心理描写穿插

返回格式：
{
  "dialogues": [
    {
      "character": "角色名",
      "lines": ["对白1", "对白2"],
      "actions": "动作描写",
      "emotion": "情绪"
    }
  ],
  "narrative": "叙述性文字连接对话"
}`,

  // 详细写作 - 丰富剧情
  enrichPlot: `你是一个专业的小说创作专家。请丰富以下剧情片段。

原始片段：
{originalContent}

要求：
1. 添加细节描写（环境、动作、心理）
2. 添加角色互动
3. 丰富情感表达
4. 保持原有剧情走向
5. 提高内容丰富度和可读性

返回格式：
{
  "enrichedContent": "丰富后的完整内容",
  "addedScenes": ["新增场景描述1", "新增场景描述2"],
  "characterDevelopment": ["角色发展描述"]
}`,

  // 详细写作 - 角色互动
  interaction: `你是一个专业的小说角色互动专家。请生成{character1}和{character2}之间的互动。

场景类型：{type}
上下文：{context}

要求：
1. 体现两个角色的性格特点
2. 符合他们之间的关系
3. 互动要有意义，推动剧情或揭示信息
4. 对话自然，符合各自的身份背景

返回格式：
{
  "interaction": {
    "type": "互动类型",
    "content": "互动内容（对话+动作+心理）",
    "keyPoints": ["关键点1", "关键点2"]
  }
}`,

  // 预测 - 延展故事
  extendStory: `你是一个专业的小说续写专家。请根据以下故事内容延展后续剧情。

故事摘要：
{summary}

目标长度：{targetLength}字

要求：
1. 保持故事连贯性
2. 符合已有的人物设定
3. 合理发展剧情
4. 设置悬念或伏笔
5. 自然过渡，不生硬

返回格式：
{
  "extendedContent": "延展后的完整内容",
  "newPlotPoints": ["新剧情点1", "新剧情点2"],
  "suspense": "设置的悬念"
}`,

  // 预测 - 填补空白
  fillGaps: `你是一个专业的小说修补专家。请填补以下剧情空白。

剧情空白：
{gaps}

完整故事上下文：
{context}

要求：
1. 填补空白，使故事完整
2. 与已有内容逻辑一致
3. 符合故事风格和基调
4. 自然衔接前后内容

返回格式：
{
  "filledContent": "填补后的完整内容",
  "connections": ["衔接说明1", "衔接说明2"]
}`,

  // 预测 - 完善结局
  concludeStory: `你是一个专业的小说结局设计专家。请为以下故事设计一个完整的结局。

故事类型：{endingType}
故事摘要：
{summary}

可能的结局类型：
- 完美结局
- 悲剧结局
- 开放结局
- 转折结局

要求：
1. 与故事整体风格一致
2. 回应之前埋下的伏笔
3. 人物命运交代清楚
4. 有回味空间

返回格式：
{
  "ending": {
    "type": "结局类型",
    "content": "结局内容",
    "fateSummary": "人物命运总结",
    "themes": "主题升华"
  }
}`
};

class NvwaService {
  constructor() {
    this.state = {
      lastOperation: null,
      history: []
    };
  }

  getStatus() {
    return {
      success: true,
      data: {
        status: 'ready',
        branches: {
          detailed: {
            name: '详细写作',
            description: '通过角色交流推演丰富剧情',
            methods: ['chat', 'enrich', 'interaction']
          },
          predict: {
            name: '预测',
            description: '延展故事完善结局',
            methods: ['extend', 'fill', 'conclude']
          }
        },
        lastOperation: this.state.lastOperation
      }
    };
  }

  /**
   * 调用AI
   */
  async callAI(systemPrompt, userPrompt) {
    const config = this.loadConfig();
    const provider = config.ai?.defaultProvider || 'omnihex';
    const aiConfig = config.ai?.providers?.[provider] || config.ai?.providers?.omnihex;

    if (!aiConfig || !aiConfig.baseUrl) {
      throw new Error('AI config not found');
    }

    const url = `${aiConfig.baseUrl}/v1/chat/completions`;
    const headers = {
      'Content-Type': 'application/json'
    };

    if (aiConfig.apiKey) {
      headers.Authorization = `Bearer ${aiConfig.apiKey}`;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: aiConfig.model || 'MiniMax-M2.7-highspeed',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 8000
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

  loadConfig() {
    try {
      const configPath = path.join(__dirname, '../../config/default.json');
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (e) {
      return {};
    }
  }

  parseAIResponse(content) {
    try {
      return JSON.parse(content);
    } catch (e) {
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

  // ============ 详细写作分支 ============

  /**
   * 详细写作 - 角色对话
   */
  async detailedChat(unitId, characters, topic, context) {
    const charactersStr = (characters || []).join(', ');
    const userPrompt = PROMPTS.detailedChat
      .replace('{topic}', topic || '一般对话')
      .replace('{context}', context || '')
      .replace('{characters}', charactersStr);

    try {
      const content = await this.callAI(
        '你是一个专业的小说对话生成专家。',
        userPrompt
      );

      const result = this.parseAIResponse(content);

      if (result) {
        this.state.lastOperation = { type: 'chat', unitId, timestamp: new Date().toISOString() };
        return {
          success: true,
          data: {
            type: 'detailed_chat',
            branch: 'detailed',
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
   * 详细写作 - 丰富剧情
   */
  async enrichPlot(unitId, options) {
    const originalContent = options?.originalContent || '';
    
    if (!originalContent) {
      return { success: false, message: 'Original content is required' };
    }

    const userPrompt = PROMPTS.enrichPlot.replace('{originalContent}', originalContent);

    try {
      const content = await this.callAI(
        '你是一个专业的小说创作专家，擅长丰富剧情细节。',
        userPrompt
      );

      const result = this.parseAIResponse(content);

      if (result) {
        this.state.lastOperation = { type: 'enrich', unitId, timestamp: new Date().toISOString() };
        return {
          success: true,
          data: {
            type: 'enriched_plot',
            branch: 'detailed',
            before: originalContent,
            after: result.enrichedContent,
            addedScenes: result.addedScenes,
            characterDevelopment: result.characterDevelopment
          }
        };
      }

      return { success: false, message: 'Failed to parse AI response' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  /**
   * 详细写作 - 角色互动
   */
  async generateInteraction(character1Id, character2Id, context, type) {
    const userPrompt = PROMPTS.interaction
      .replace('{character1}', character1Id)
      .replace('{character2}', character2Id)
      .replace('{type}', type || '对话')
      .replace('{context}', context || '');

    try {
      const content = await this.callAI(
        '你是一个专业的小说角色互动专家。',
        userPrompt
      );

      const result = this.parseAIResponse(content);

      if (result) {
        this.state.lastOperation = { 
          type: 'interaction', 
          characters: [character1Id, character2Id], 
          timestamp: new Date().toISOString() 
        };
        return {
          success: true,
          data: {
            type: 'interaction',
            branch: 'detailed',
            character1: character1Id,
            character2: character2Id,
            ...result.interaction
          }
        };
      }

      return { success: false, message: 'Failed to parse AI response' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  // ============ 预测分支 ============

  /**
   * 预测 - 延展故事
   */
  async predictExtend(unitId, targetLength) {
    // 需要先获取单元内容
    const UnitService = require('./unit_service');
    const unit = UnitService.getUnit(unitId);
    
    if (!unit) {
      return { success: false, message: 'Unit not found' };
    }

    const summary = this.generateSummary(unit.fragments || []);
    const userPrompt = PROMPTS.extendStory
      .replace('{summary}', summary)
      .replace('{targetLength}', targetLength || 2000);

    try {
      const content = await this.callAI(
        '你是一个专业的小说续写专家，擅长合理延展故事。',
        userPrompt
      );

      const result = this.parseAIResponse(content);

      if (result) {
        this.state.lastOperation = { type: 'extend', unitId, timestamp: new Date().toISOString() };
        return {
          success: true,
          data: {
            type: 'extended_story',
            branch: 'predict',
            originalSummary: summary,
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
   * 预测 - 填补空白
   */
  async fillGaps(unitId, gaps) {
    const gapsStr = (gaps || []).map((g, i) => `空白${i + 1}: ${g}`).join('\n');
    
    // 获取完整故事
    const UnitService = require('./unit_service');
    const unit = UnitService.getUnit(unitId);
    const context = unit ? this.generateSummary(unit.fragments || []) : '无上下文';

    const userPrompt = PROMPTS.fillGaps
      .replace('{gaps}', gapsStr)
      .replace('{context}', context);

    try {
      const content = await this.callAI(
        '你是一个专业的小说修补专家，擅长填补剧情空白。',
        userPrompt
      );

      const result = this.parseAIResponse(content);

      if (result) {
        this.state.lastOperation = { type: 'fill', unitId, timestamp: new Date().toISOString() };
        return {
          success: true,
          data: {
            type: 'filled_content',
            branch: 'predict',
            gaps: gaps,
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
   * 预测 - 完善结局
   */
  async concludeStory(storyId, endingType) {
    // 需要获取故事内容
    const UnitService = require('./unit_service');
    const unit = UnitService.getUnit(storyId);
    const summary = unit ? this.generateSummary(unit.fragments || []) : '故事内容不可用';

    const userPrompt = PROMPTS.concludeStory
      .replace('{endingType}', endingType || '根据故事自然发展')
      .replace('{summary}', summary);

    try {
      const content = await this.callAI(
        '你是一个专业的小说结局设计专家，擅长设计合理动人的结局。',
        userPrompt
      );

      const result = this.parseAIResponse(content);

      if (result) {
        this.state.lastOperation = { type: 'conclude', storyId, timestamp: new Date().toISOString() };
        return {
          success: true,
          data: {
            type: 'story_ending',
            branch: 'predict',
            ...result
          }
        };
      }

      return { success: false, message: 'Failed to parse AI response' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  // ============ 批量操作 ============

  /**
   * 批量丰富
   */
  async batchEnrich(unitIds, options) {
    const results = [];

    for (const unitId of (unitIds || [])) {
      const result = await this.enrichPlot(unitId, options);
      results.push({
        unitId,
        success: result.success,
        data: result.data || null,
        message: result.message || null
      });
    }

    return {
      success: true,
      data: {
        total: unitIds?.length || 0,
        successful: results.filter(r => r.success).length,
        results
      }
    };
  }

  // ============ 评分相关 ============

  /**
   * 评估丰富度提升
   */
  async evaluateEnrichment(unitId, beforeContent, afterContent) {
    const prompt = `你是一个专业的文本质量评估专家。请评估丰富前后的文本质量提升。

丰富前：
${beforeContent}

丰富后：
${afterContent}

请从以下维度评分（0-100）：
1. 细节丰富度
2. 情感表达
3. 角色塑造
4. 故事深度
5. 可读性

返回JSON：
{
  "scores": {
    "detail": 0-100,
    "emotion": 0-100,
    "character": 0-100,
    "depth": 0-100,
    "readability": 0-100
  },
  "overallImprovement": "总体提升百分比",
  "analysis": "简要分析"
}`;

    try {
      const content = await this.callAI(
        '你是一个专业的文本质量评估专家。',
        prompt
      );

      const result = this.parseAIResponse(content);

      if (result) {
        return {
          success: true,
          data: {
            unitId,
            beforeLength: (beforeContent || '').length,
            afterLength: (afterContent || '').length,
            ...result
          }
        };
      }

      return { success: false, message: 'Failed to parse AI response' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  // ============ 工具函数 ============

  generateSummary(fragments) {
    if (!fragments || !fragments.length) return '无内容';

    return fragments.map((f, i) =>
      `【片段${i + 1}】${f.time || ''} ${f.place || ''} - ${(f.characters || []).join(', ')}: ${(f.content || '').substring(0, 200)}`
    ).join('\n\n');
  }
}

// 导出单例
const nvwaService = new NvwaService();
module.exports = nvwaService;
