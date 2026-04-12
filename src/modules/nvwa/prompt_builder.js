/**
 * Prompt 构建器 - Prompt Builder
 * 
 * 构建 AI 交互的 prompt
 * 参考旧代码 Prompts.js 的核心逻辑
 */

const TENSION = {
  VERY_LOW: 20,
  LOW: 35,
  MEDIUM: 50,
  HIGH: 65,
  VERY_HIGH: 80
};

class PromptBuilder {
  /**
   * 构建女娲推演 Prompt
   */
  buildNvwaSimPrompt(a, b, tensionCue = '') {
    const aDesc = a?.metadata?.biography || a?.summary || a?.personality || '';
    const bDesc = b?.metadata?.biography || b?.summary || b?.personality || '';
    
    return `你是一个小说世界后台模拟器与命运织机（K线系统）。
当前角色A：${a?.name || '未知'} ${aDesc}
当前角色B：${b?.name || '未知'} ${bDesc}
${tensionCue ? `\n${tensionCue}\n` : ''}

任务：推演他们之间发生的一个随机微小事件（可以是交谈、擦肩而过、暗中观察等）。
你可以定义任何符合语境的"数值属性"，并在本回合输出增减变化（例如：Sanity, Spirit Qi, Stock Price, Public Support 等）。

输出要求：必须严格输出 JSON，不要包含任何 markdown 标记。
必须包含字段：speaker, content。
可选字段：changes（数组）。changes 结构：
{"target":"char_id_or_name","attr":"AttributeName","delta":-10,"reason":"..."}
约束：所有数值属性均按 0-100 的归一化刻度处理（避免出现极大数）。
`;
  }

  /**
   * 构建沙盘推演 Prompt
   */
  buildStagePrompt(config = {}) {
    const {
      scenarioRule = '',
      activeLocation = null,
      worldVariables = {},
      stageCharacters = [],
      tension = TENSION.MEDIUM,
      relevantMemories = '',
      ideaPool = []
    } = config;
    
    const charContext = stageCharacters.map(c =>
      `- ${c.name} (${c.role || '未知职业'}): ${c.desc || '无详细设定'}`
    ).join('\n');
    
    const pacingRule = this.getPacingRule(tension);
    
    const basePrompt = `${pacingRule}
【在场角色】：
${charContext}

【任务】：推演"下一秒"发生的剧情，每次只能推进【一个核心节拍】。
文本必须极度精简（50-150字），采用剧本式的干练文风。

【输出格式】
Part 1：[剧情正文] 开头写故事正文
Part 2：[系统变更] 接着输出严格 JSON：
{"changes":[...],"is_scene_completed":false,"suggested_actions":[...]}

- changes: 属性变更 [{"target":"角色ID","attr":"属性名","delta":数字,"reason":"原因"}]
- suggested_actions: 3条短句动作建议
`;
    
    return basePrompt;
  }

  /**
   * 获取叙事节奏规则
   */
  getPacingRule(tension) {
    if (tension <= TENSION.VERY_LOW) {
      return '【叙事节奏：极缓（低张力）】请使用长句，着重描写环境的光影、角色的细微动作。';
    }
    if (tension <= TENSION.LOW) {
      return '【叙事节奏：缓】保持细腻的环境描写和角色内心描写。';
    }
    if (tension <= TENSION.MEDIUM) {
      return '【叙事节奏：正常（中张力）】保持动作与对白的平衡推演。';
    }
    if (tension <= TENSION.HIGH) {
      return '【叙事节奏：快】加快节奏，动作与对白紧凑，减少冗余描写。';
    }
    return '【叙事节奏：极快（高张力）】禁止冗长的景物描写！使用极短、急促的句子。';
  }

  /**
   * 构建角色状态摘要
   */
  buildCharacterSummary(char) {
    const attrs = char.attributes || {};
    
    // 关键属性
    const keyAttrs = ['health', 'sanity', 'charm', 'combat', 'intelligence']
      .filter(k => attrs[k] !== undefined)
      .map(k => `${k}:${attrs[k].value || attrs[k]}`)
      .join(' | ');
    
    // 状态
    const status = char.status
      ? `${char.status.location || '?'} | ${char.status.mood || '?'}`
      : '未知';
    
    // 关系
    const rels = char.relationships || [];
    const keyRels = rels
      .filter(r => Math.abs(r.value || 0) > 20)
      .slice(0, 3)
      .map(r => `${r.name || r.targetId}:${r.value}`)
      .join(' | ');
    
    return `[${char.name}]\n  状态: ${status}\n  属性: ${keyAttrs || '无'}\n  关系: ${keyRels || '无'}`;
  }

  /**
   * 构建世界设定
   */
  buildWorldContext(worldVars, worldLaws = {}) {
    let ctx = '【世界设定】\n';
    ctx += `张力: ${worldVars.tension || 50} | 混乱: ${worldVars.chaos || 50} | 进度: ${worldVars.progress || 50}\n`;
    
    if (worldLaws.theme) {
      ctx += `核心立意: ${worldLaws.theme}\n`;
    }
    if (worldLaws.taboos) {
      ctx += `绝对禁忌: ${worldLaws.taboos}\n`;
    }
    
    return ctx;
  }

  /**
   * 构建灵感池
   */
  buildIdeaPool(ideas = []) {
    if (ideas.length === 0) return '';
    
    return '【灵感池】\n' + ideas
      .slice(0, 5)
      .map((idea, i) => `${i + 1}. ${idea}`)
      .join('\n') + '\n';
  }
}

module.exports = new PromptBuilder();
