/**
 * 文化适配服务
 * 
 * 核心思想：
 * 1. 文化适配 ≠ 文化清洗
 * 2. 异域元素（美食/节日/人物）应保留，只在语义冲突时调整
 * 3. 通过AI理解文化语境，智能适配
 */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// 文化配置文件
const CONFIG_DIR = path.join(__dirname, '../../config');

// 预设文化映射
const CULTURE_PRESETS = {
  'chinese': {
    name: '中华文化',
    timezone: 'Asia/Shanghai',
    currency: '两/贯/文',
    units: '尺/寸/里/亩',
    festivals: ['春节', '中秋', '端午', '元宵', '重阳'],
    foods: ['饺子', '面条', '米饭', '月饼', '粽子'],
    socialUnits: ['家族', '宗族', '村庄', '朝廷']
  },
  'western': {
    name: '西方文化',
    timezone: 'Europe/London',
    currency: '英镑/美元/法郎',
    units: '英尺/英寸/英里/英亩',
    festivals: ['Christmas', 'Easter', 'Thanksgiving', 'Halloween'],
    foods: ['pizza', 'pasta', 'steak', 'bread', 'cheese'],
    socialUnits: ['family', 'clan', 'village', 'kingdom']
  },
  'japanese': {
    name: '日本文化',
    timezone: 'Asia/Tokyo',
    currency: '円/両/文',
    units: '尺/寸/間/坪',
    festivals: ['正月', '盆', '雛祭', '七夕', '中秋'],
    foods: ['寿司', '刺身', '天婦羅', '蕎麦', '味噌汁'],
    socialUnits: ['家', '一族', '村', '藩']
  },
  'french': {
    name: '法国文化',
    timezone: 'Europe/Paris',
    currency: 'franc/euro',
    units: 'mètre/centimètre/kilomètre',
    festivals: ['Noël', 'Bastille Day', 'Easter'],
    foods: ['croissant', 'baguette', 'fromage', 'vin', 'soupe à l\'oignon'],
    socialUnits: ['famille', 'clan', 'village', 'royaume']
  }
};

// 语义冲突规则（需要适配的情况）
const SEMANTIC_CONFLICTS = {
  // 中文 → 西方：需要替换的
  'chinese->western': {
    '春节': 'Chinese New Year / Spring Festival',
    '中秋': 'Mid-Autumn Festival',
    '米饭': 'rice',
    '筷子': 'chopsticks',
    '科举': 'imperial examination system',
    '太监': 'eunuch',
    '朝廷': 'royal court',
    '县太爷': 'magistrate',
    '衙门': 'government office / yamen'
  },
  // 西方 → 中文：需要替换的
  'western->chinese': {
    'Christmas': '圣诞节',
    'Easter': '复活节',
    'pizza': '披萨',
    'pasta': '意大利面',
    'steak': '牛排',
    'magistrate': '县太爷',
    'court': '衙门',
    'kingdom': '王国'
  }
};

/**
 * 分析文本中的文化元素
 */
async function analyzeElements(text, sourceCulture, targetCulture) {
  const presets = CULTURE_PRESETS[sourceCulture] || CULTURE_PRESETS['western'];
  
  const elements = {
    food: [],
    festival: [],
    social: [],
    custom: [],
    foreign: [] // 需要保留的异域元素
  };
  
  // 检测预设文化元素
  const allPresets = [
    ...(presets.foods || []),
    ...(presets.festivals || []),
    ...(presets.socialUnits || [])
  ];
  
  for (const preset of allPresets) {
    if (text.includes(preset)) {
      const type = presets.foods.includes(preset) ? 'food' :
                   presets.festivals.includes(preset) ? 'festival' : 'social';
      elements[type].push({
        element: preset,
        type: type,
        preserve: true, // 默认保留
        position: text.indexOf(preset)
      });
    }
  }
  
  // 使用AI分析更复杂的文化元素
  const aiAnalysis = await callAICultureAnalysis(text, sourceCulture, targetCulture);
  
  // 合并AI分析结果
  if (aiAnalysis && aiAnalysis.elements) {
    for (const el of aiAnalysis.elements) {
      if (el.type === 'foreign') {
        elements.foreign.push(el);
      } else {
        if (!elements[el.type]) elements[el.type] = [];
        elements[el.type].push(el);
      }
    }
  }
  
  return {
    success: true,
    data: {
      sourceCulture,
      targetCulture,
      elements,
      analysis: aiAnalysis
    }
  };
}

/**
 * 分析整本小说
 */
async function analyzeNovel(content, sourceCulture, targetCulture) {
  // 分割成章节/段落
  const chunks = splitIntoChunks(content, 5000); // 每段5000字符
  
  const allElements = {
    food: [],
    festival: [],
    social: [],
    custom: [],
    foreign: []
  };
  
  const summary = {
    totalChunks: chunks.length,
    analyzed: 0,
    elementsFound: 0
  };
  
  for (const chunk of chunks) {
    const result = await analyzeElements(chunk, sourceCulture, targetCulture);
    if (result.success) {
      summary.analyzed++;
      
      for (const type of Object.keys(allElements)) {
        if (result.data.elements[type]) {
          allElements[type].push(...result.data.elements[type]);
          summary.elementsFound += result.data.elements[type].length;
        }
      }
    }
  }
  
  // 去重
  for (const type of Object.keys(allElements)) {
    const seen = new Set();
    allElements[type] = allElements[type].filter(el => {
      const key = el.element + '_' + type;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  
  return {
    success: true,
    data: {
      sourceCulture,
      targetCulture,
      elements: allElements,
      summary
    }
  };
}

/**
 * 文化适配转写
 */
async function adaptCulture(text, sourceCulture, targetCulture, options) {
  options = options || {};
  const {
    preserveForeign = true,  // 是否保留异域元素
    adaptFood = true,
    adaptFestival = true,
    adaptSocial = true,
    preserveNames = true,    // 保留人名
    preserveLocations = true  // 保留地名
  } = options;
  
  // 1. 先分析文化元素
  const analysis = await analyzeElements(text, sourceCulture, targetCulture);
  if (!analysis.success) {
    return { success: false, message: 'Analysis failed' };
  }
  
  // 2. 构建保留清单
  const preserveList = [];
  const adaptList = [];
  
  for (const [type, elements] of Object.entries(analysis.data.elements)) {
    for (const el of elements) {
      if (preserveForeign && el.preserve) {
        preserveList.push(el.element);
      } else {
        adaptList.push({ ...el, type });
      }
    }
  }
  
  // 3. 使用AI进行语义适配
  const adaptedText = await callAIAdaptation(
    text,
    sourceCulture,
    targetCulture,
    {
      preserveList,
      adaptList,
      preserveNames,
      preserveLocations,
      adaptFood,
      adaptFestival,
      adaptSocial
    }
  );
  
  return {
    success: true,
    data: {
      original: text,
      adapted: adaptedText,
      preserveList,
      adaptList,
      sourceCulture,
      targetCulture
    }
  };
}

/**
 * 批量转写
 */
async function adaptBatch(texts, sourceCulture, targetCulture, options) {
  const results = [];
  
  for (const text of texts) {
    const result = await adaptCulture(text, sourceCulture, targetCulture, options);
    results.push(result);
  }
  
  return {
    success: true,
    data: {
      total: texts.length,
      successful: results.filter(r => r.success).length,
      results
    }
  };
}

/**
 * 标记需要保留的异域元素
 */
async function preserveElements(text, sourceCulture, elements) {
  const preserveList = elements.map(e => e.element || e);
  
  // 使用AI理解这些元素的语义重要性
  const prompt = `以下元素来自原文，需要判断它们是否应该保留：

原文片段：${text.substring(0, 2000)}

需要判断的元素：${preserveList.join(', ')}

判断规则：
1. 如果元素有明确的文化/语义目的，保留
2. 如果元素是情节关键，保留
3. 如果只是背景描写但有异域特色，保留
4. 如果语义模糊或重复，可以调整

请给出每个元素的保留建议。`;
  
  const aiResponse = await callSimpleAI(prompt);
  
  return {
    success: true,
    data: {
      elements: preserveList,
      suggestions: aiResponse,
      preserved: preserveList // 默认全部保留
    }
  };
}

/**
 * 获取预设的文化配置
 */
function getConfig(sourceCulture, targetCulture) {
  const source = CULTURE_PRESETS[sourceCulture] || CULTURE_PRESETS['western'];
  const target = CULTURE_PRESETS[targetCulture] || CULTURE_PRESETS['chinese'];
  
  return {
    source,
    target,
    conflicts: SEMANTIC_CONFLICTS[`${sourceCulture}->${targetCulture}`] || {}
  };
}

/**
 * 更新文化配置
 */
async function updateConfig(sourceCulture, targetCulture, config) {
  // 配置更新逻辑（可以保存到文件）
  return {
    success: true,
    data: { sourceCulture, targetCulture, config }
  };
}

/**
 * 获取异域元素列表
 */
function getForeignElements(sourceCulture, targetCulture) {
  const source = CULTURE_PRESETS[sourceCulture];
  if (!source) return [];
  
  return {
    foods: source.foods || [],
    festivals: source.festivals || [],
    socialUnits: source.socialUnits || []
  };
}

// ============ 内部工具函数 ============

function splitIntoChunks(text, chunkSize) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.substring(i, i + chunkSize));
  }
  return chunks;
}

/**
 * 调用AI分析文化元素
 */
async function callAICultureAnalysis(text, sourceCulture, targetCulture) {
  const configPath = path.join(CONFIG_DIR, 'default.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const aiConfig = config.ai;
  
  const prompt = `分析以下文本中的文化元素（${sourceCulture} → ${targetCulture}）：

${text.substring(0, 3000)}

请识别以下类型的文化元素：
1. food - 食物/饮食习惯
2. festival - 节日/庆典
3. social - 社会结构/制度/单位
4. foreign - 异域元素（应该保留而非替换的）

对于每个元素，说明：
- 元素名称
- 类型
- 是否应该保留（preserve: true/false）
- 保留或替换的原因

请以JSON格式返回。`;

  try {
    if (aiConfig.defaultProvider === 'omnihex') {
      const provider = aiConfig.providers.omnihex;
      const res = await fetch(`${provider.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.apiKey}`
        },
        body: JSON.stringify({
          model: provider.model,
          messages: [
            { role: 'system', content: '你是一个专业的文化分析专家，擅长识别文本中的文化元素。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3
        })
      });
      
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.message?.reasoning_content || '';
      
      // 尝试解析JSON
      try {
        return JSON.parse(content);
      } catch {
        // 尝试提取JSON
        const match = content.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
        return { elements: [] };
      }
    }
  } catch (e) {
    console.error('[CultureAdapter] callAICultureAnalysis error:', e);
  }
  
  return { elements: [] };
}

/**
 * 调用AI进行文化适配
 */
async function callAIAdaptation(text, sourceCulture, targetCulture, options) {
  const configPath = path.join(CONFIG_DIR, 'default.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const aiConfig = config.ai;
  
  const preserveStr = options.preserveList?.join(', ') || '无';
  const adaptStr = options.adaptList?.map(a => `${a.element}(${a.type})`).join(', ') || '无';
  
  const prompt = `将以下${sourceCulture}文化背景的文本适配到${targetCulture}文化背景：

【原文】
${text}

【需要保留的元素】（异域特色，应该保留）
${preserveStr}

【需要适配的元素】
${adaptStr}

【适配规则】
1. ${options.preserveNames ? '人名保留不翻译' : '人名可以翻译'}
2. ${options.preserveLocations ? '地名保留不翻译' : '地名可以翻译'}
3. ${options.adaptFood ? '食物/饮食习惯适配到目标文化' : '保持原样'}
4. ${options.adaptFestival ? '节日/庆典适配到目标文化或保留原文' : '保持原样'}
5. ${options.adaptSocial ? '社会制度/单位适配到目标文化' : '保持原样'}
6. 保持原文的风格和情感
7. 语义不通顺时可以意译，不要硬翻

请直接输出适配后的文本，不要解释。`;

  try {
    if (aiConfig.defaultProvider === 'omnihex') {
      const provider = aiConfig.providers.omnihex;
      const res = await fetch(`${provider.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.apiKey}`
        },
        body: JSON.stringify({
          model: provider.model,
          messages: [
            { role: 'system', content: '你是一个专业的小说翻译/文化适配专家，擅长保持原文风格的同时进行跨文化适配。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      });
      
      const data = await res.json();
      return data?.choices?.[0]?.message?.content || data?.choices?.[0]?.message?.reasoning_content || text;
    }
  } catch (e) {
    console.error('[CultureAdapter] callAIAdaptation error:', e);
  }
  
  return text;
}

/**
 * 简单AI调用
 */
async function callSimpleAI(prompt) {
  const configPath = path.join(CONFIG_DIR, 'default.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const aiConfig = config.ai;
  
  try {
    if (aiConfig.defaultProvider === 'omnihex') {
      const provider = aiConfig.providers.omnihex;
      const res = await fetch(`${provider.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.apiKey}`
        },
        body: JSON.stringify({
          model: provider.model,
          messages: [
            { role: 'system', content: '你是一个专业的文化分析专家。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.5
        })
      });
      
      const data = await res.json();
      return data?.choices?.[0]?.message?.content || data?.choices?.[0]?.message?.reasoning_content || '';
    }
  } catch (e) {
    console.error('[CultureAdapter] callSimpleAI error:', e);
  }
  
  return '';
}

module.exports = {
  analyzeElements,
  analyzeNovel,
  adaptCulture,
  adaptBatch,
  preserveElements,
  getConfig,
  updateConfig,
  getForeignElements,
  CULTURE_PRESETS
};
