/**
 * translate_routes.js v4 - 兼容旧格式 + 深度文化映射
 * 旧格式: mappings.zh→en.food["米饭"].target
 * 新格式: zh→en.food["米饭"] = "rice"
 */
const fs = require('fs');
const path = require('path');

const CULTURAL_FILE = path.join(__dirname, '../../config/translation_cultural.json');
let culturalMap = {};
let mapVersion = '1.0';

function loadMap() {
  try {
    const raw = fs.readFileSync(CULTURAL_FILE, 'utf-8');
    culturalMap = JSON.parse(raw);
    mapVersion = culturalMap.version || '2.0';
    console.log('[translate] Loaded cultural map v' + mapVersion);
  } catch(e) {
    console.error('[translate] Load error:', e.message);
  }
}
loadMap();

// 兼容旧格式
function getMappings() {
  // 旧格式: { mappings: { "zh→en": { food: { "米饭": { target: "rice" }}}}}
  // 新格式: { "zh→en": { food: { "米饭": "rice" }}}
  if (culturalMap.mappings) return culturalMap.mappings;
  return culturalMap;
}

function getLangDir(src, tgt) { return src + '→' + tgt; }
function getMapping(src, tgt) { return getMappings()[getLangDir(src, tgt)] || null; }

// 提取target值（兼容新旧格式）
function getTarget(entry) {
  if (!entry) return null;
  if (typeof entry === 'string') return entry;
  if (typeof entry === 'object') {
    if (entry.target) return entry.target;
    // 新格式直接是字符串
    for (const v of Object.values(entry)) {
      if (typeof v === 'string') return v;
    }
  }
  return null;
}

// 获取某个分类的映射字典 {原文: 译文}
function getCategoryDict(mapping, category) {
  if (!mapping || !mapping[category]) return {};
  const cat = mapping[category];
  const result = {};
  for (const [k, v] of Object.entries(cat)) {
    const t = getTarget(v);
    if (t) result[k] = t;
  }
  return result;
}

// 查找并替换文化要素
function findCulturalChanges(text, mapping) {
  const changes = [];
  if (!mapping || !text) return { text, changes };

  let result = text;
  const categories = ['food', 'utensils', 'customs', 'festival', 'greetings', 'deity', 'social_class', 'architecture', 'clothing', 'currency', 'era_setting'];

  for (const cat of categories) {
    const catMap = getCategoryDict(mapping, cat);
    if (!catMap || Object.keys(catMap).length === 0) continue;

    for (const [original, replacement] of Object.entries(catMap)) {
      if (!original || !replacement || original.length < 1) continue;
      if (result.includes(original)) {
        result = result.split(original).join('___' + changes.length + '___PLACEHOLDER___');
        changes.push({
          id: 'ch_' + changes.length,
          original,
          replacement,  // 单个推荐值
          options: buildOptions(replacement),  // 可选值数组
          changeType: cat,
          context: '',
          adaptation: '',
          confirmed: false
        });
      }
    }
  }

  // 替换占位符
  for (let i = 0; i < changes.length; i++) {
    result = result.replace('___' + i + '___PLACEHOLDER___', '【' + i + '】');
  }

  return { text: result, changes };
}

function buildOptions(replacement) {
  if (!replacement) return [];
  if (typeof replacement === 'string' && replacement.includes('/')) {
    return replacement.split('/').map(s => s.trim()).filter(s => s);
  }
  return [replacement];
}

function getStrengthLabel(s) {
  if (s < 20) return 'basic';
  if (s < 40) return 'light';
  if (s < 60) return 'smart';
  if (s < 80) return 'deep';
  return 'full';
}

function translate(text, srcLang, tgtLang, strength) {
  const mapping = getMapping(srcLang, tgtLang);
  const { text: resultText, changes } = findCulturalChanges(text, mapping);

  let finalText = resultText;
  if (strength >= 40 && srcLang === 'zh' && tgtLang === 'en') {
    finalText = finalText
      .replace(/，/g, ', ')
      .replace(/。/g, '. ')
      .replace(/"/g, '"').replace(/"/g, '"')
      .replace(/'/g, "'");
  }

  const strengthLabel = getStrengthLabel(strength);

  return {
    translationId: 'tr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8),
    sourceLang: srcLang,
    targetLang: tgtLang,
    strength,
    strengthLabel,
    text: finalText.trim(),
    originalText: text,
    changesCount: changes.length,
    changes,
    culturalVersion: mapVersion
  };
}

// API路由
module.exports = async function(fastify) {

  fastify.post('/api/translate', async (req, reply) => {
    const { text, sourceLang = 'zh', targetLang = 'en', strength = 50 } = req.body || {};

    if (!text || !text.trim()) {
      return reply.code(400).send({ success: false, error: 'text is required' });
    }
    if (strength < 0 || strength > 100) {
      return reply.code(400).send({ success: false, error: 'strength must be 0-100' });
    }

    try {
      const result = translate(text, sourceLang, targetLang, strength);
      return { success: true, data: result };
    } catch(e) {
      console.error('[translate] Error:', e);
      return reply.code(500).send({ success: false, error: e.message });
    }
  });

  fastify.get('/api/translate/categories', async (req, reply) => {
    return {
      success: true,
      data: {
        version: mapVersion,
        categories: ['food', 'utensils', 'customs', 'festival', 'greetings', 'deity', 'social_class', 'architecture', 'clothing', 'currency', 'era_setting'],
        supportedPairs: Object.keys(getMappings()).filter(k => !k.startsWith('_'))
      }
    };
  });

  fastify.post('/api/translate/validate', async (req, reply) => {
    const { text, expectedFormat = 'memory_entry' } = req.body || {};
    if (!text) return reply.code(400).send({ success: false, error: 'text is required' });

    let valid = true;
    let errors = [];
    let parsed = null;

    try {
      parsed = JSON.parse(text);
    } catch(e) {
      valid = false;
      errors.push('JSON parse failed: ' + e.message);
    }

    if (valid && expectedFormat === 'memory_entry') {
      const required = ['summary', 'emotions', 'importance', 'layer_assignment', 'related_characters'];
      for (const field of required) {
        if (!(field in parsed)) {
          errors.push('Missing required field: ' + field);
          valid = false;
        }
      }
      if (parsed.layer_assignment && !['buffer', 'core', 'recall', 'archival'].includes(parsed.layer_assignment)) {
        errors.push('Invalid layer_assignment: ' + parsed.layer_assignment);
        valid = false;
      }
    }

    return { success: true, data: { valid, errors, parsed: parsed || text } };
  });

  console.log('[translate] v4 routes registered (map v' + mapVersion + ')');
};
