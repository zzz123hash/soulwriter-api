/**
 * translate_routes.js - 语种翻译API
 * 核心功能：文化要素替换 + 改编强度控制
 */
const fs = require('fs');
const path = require('path');

const culturalMapPath = path.join(__dirname, '../../config/translation_cultural.json');
let culturalMap = {};
try {
  const raw = fs.readFileSync(culturalMapPath, 'utf-8');
  culturalMap = JSON.parse(raw);
} catch(e) {
  console.error('[translate] Failed to load cultural map:', e.message);
}

function generateId() {
  return 'tr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
}

/**
 * 根据改编强度执行翻译
 * @param {string} text - 原文
 * @param {string} sourceLang - 源语言
 * @param {string} targetLang - 目标语言
 * @param {number} strength - 改编强度 0-100
 * @returns {{text, changes[]}}
 */
function translateWithStrength(text, sourceLang, targetLang, strength) {
  const changes = [];
  const mappingKey = sourceLang + '→' + targetLang;
  const mapping = culturalMap.mappings && culturalMap.mappings[mappingKey];

  if (!mapping || strength < 20) {
    // 强度<20: 只做基础翻译，返回原文
    return { text, changes: [] };
  }

  let result = text;
  const typesToApply = [];

  // 根据强度确定应用哪些类型的替换
  if (strength >= 20) typesToApply.push('utensils');
  if (strength >= 30) typesToApply.push('customs');
  if (strength >= 40) typesToApply.push('food');
  if (strength >= 50) typesToApply.push('titles');
  if (strength >= 60) typesToApply.push('clothing');
  if (strength >= 70) typesToApply.push('transport');
  if (strength >= 80) typesToApply.push('measures');

  if (!mapping) {
    return { text: result, changes: [] };
  }

  // 应用各类别替换
  for (const type of typesToApply) {
    const typeMap = mapping[type];
    if (!typeMap) continue;

    for (const [original, info] of Object.entries(typeMap)) {
      if (typeof info === 'string') {
        // 简单字符串映射
        if (result.includes(original)) {
          const transformed = info;
          result = result.split(original).join(transformed);
          changes.push({
            id: generateId(),
            original,
            transformed,
            changeType: type,
            context: info.context || '',
            auto: 1,
            confirmed: strength < 80 ? 1 : 0, // 高强度需要人工确认
          });
        }
      } else if (info && info.target) {
        // 对象映射 {target, type, context}
        if (result.includes(original)) {
          result = result.split(original).join(info.target);
          changes.push({
            id: generateId(),
            original,
            transformed: info.target,
            changeType: info.type || type,
            context: info.context || '',
            auto: 1,
            confirmed: strength < 80 ? 1 : 0,
          });
        }
      }
    }
  }

  // 强度>=60: 也尝试替换文化场景描述
  if (strength >= 60 && mapping.cultures && mapping.cultures[sourceLang]) {
    const culture = mapping.cultures[sourceLang];
    for (const phrase of (culture.greeting || [])) {
      if (result.includes(phrase) && mapping.cultures[targetLang]) {
        const greetings = mapping.cultures[targetLang].greeting || [];
        if (greetings.length > 0) {
          result = result.split(phrase).join(greetings[0]);
          changes.push({
            id: generateId(),
            original: phrase,
            transformed: greetings[0],
            changeType: 'greeting',
            auto: 1,
            confirmed: strength >= 80 ? 0 : 1,
          });
        }
      }
    }
  }

  // 强度>=90: 完全重写模式
  if (strength >= 90) {
    // 标记为需人工审核
    changes.forEach(c => c.confirmed = 0);
  }

  return { text: result, changes };
}

/**
 * 构建Fastify翻译路由
 */
function translateRoutes(fastify, options) {

  // POST /api/translate - 执行翻译
  fastify.post('/api/translate', async (req, reply) => {
    const { bookId, sourceLang, targetLang, strength, text, chapterId } = req.body || {};

    if (!text && !bookId) {
      return reply.status(400).send({ success: false, error: 'text or bookId required' });
    }

    const lang = sourceLang || 'zh';
    const target = targetLang || 'en';
    const s = Math.max(0, Math.min(100, parseInt(strength) || 50));

    const translationId = generateId();
    const changes = [];

    let translatedText = text || '';

    if (text) {
      // 直接翻译文本
      const result = translateWithStrength(text, lang, target, s);
      translatedText = result.text;
      changes.push(...result.changes);
    } else if (bookId) {
      // 从书本读取内容翻译
      const chapters = [];
      try {
        const evRes = await fastify.inject({
          method: 'GET',
          url: `/api/events/timeline/${bookId}`
        });
        const evData = JSON.parse(evRes.body);
        if (evData.success && evData.data && evData.data.events) {
          for (const ev of evData.data.events) {
            const r = translateWithStrength(ev.result || ev.title || '', lang, target, s);
            if (r.changes.length > 0 || r.text !== (ev.result || ev.title)) {
              changes.push(...r.changes);
            }
          }
        }
      } catch(e) {
        console.error('[translate] Failed to load book events:', e);
      }
    }

    // 保存翻译记录
    if (bookId) {
      try {
        const db = req.server.db || global.db;
        if (db) {
          db.prepare(`
            INSERT INTO translations (id, book_id, source_lang, target_lang, strength, version)
            VALUES (?, ?, ?, ?, ?, 1)
          `).run(translationId, bookId, lang, target, s);

          // 保存变更记录
          const insertChange = db.prepare(`
            INSERT INTO translation_changes (id, translation_id, original, transformed, change_type, context, auto, confirmed)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const change of changes) {
            insertChange.run(
              change.id, translationId, change.original, change.transformed,
              change.changeType, change.context || '', change.auto || 1, change.confirmed || 0
            );
          }
        }
      } catch(e) {
        console.error('[translate] DB save error:', e);
      }
    }

    return {
      success: true,
      data: {
        translationId,
        sourceLang: lang,
        targetLang: target,
        strength: s,
        text: translatedText,
        changesCount: changes.length,
        changes: changes.slice(0, 50), // 最多返回50条
        strengthLabel: s < 20 ? 'basic' : s < 40 ? 'light' : s < 60 ? 'smart' : s < 80 ? 'deep' : 'full'
      }
    };
  });

  // GET /api/translate/:id - 获取翻译结果
  fastify.get('/api/translate/:id', async (req, reply) => {
    const { id } = req.params;
    const db = req.server.db || global.db;
    if (!db) return reply.status(500).send({ success: false, error: 'DB not available' });

    const tr = db.prepare('SELECT * FROM translations WHERE id = ?').get(id);
    if (!tr) return reply.status(404).send({ success: false, error: 'Translation not found' });

    const changes = db.prepare('SELECT * FROM translation_changes WHERE translation_id = ? ORDER BY created_at DESC').all(id);

    return { success: true, data: { ...tr, changes } };
  });

  // GET /api/translate/:id/changes - 获取变更记录
  fastify.get('/api/translate/:id/changes', async (req, reply) => {
    const { id } = req.params;
    const db = req.server.db || global.db;
    if (!db) return reply.status(500).send({ success: false, error: 'DB not available' });

    const changes = db.prepare('SELECT * FROM translation_changes WHERE translation_id = ? ORDER BY created_at DESC').all(id);
    return { success: true, data: changes };
  });

  // PUT /api/translate/:id/changes/:changeId - 确认/拒绝变更
  fastify.put('/api/translate/:id/changes/:changeId', async (req, reply) => {
    const { id, changeId } = req.params;
    const { confirmed } = req.body || {};
    const db = req.server.db || global.db;
    if (!db) return reply.status(500).send({ success: false, error: 'DB not available' });

    db.prepare('UPDATE translation_changes SET confirmed = ? WHERE id = ? AND translation_id = ?')
      .run(confirmed ? 1 : 0, changeId, id);

    return { success: true };
  });

  // GET /api/translate/book/:bookId/versions - 获取某书所有翻译版本
  fastify.get('/api/translate/book/:bookId/versions', async (req, reply) => {
    const { bookId } = req.params;
    const db = req.server.db || global.db;
    if (!db) return reply.status(500).send({ success: false, error: 'DB not available' });

    const versions = db.prepare('SELECT * FROM translations WHERE book_id = ? ORDER BY created_at DESC').all(bookId);
    return { success: true, data: versions };
  });

  // DELETE /api/translate/:id - 删除翻译版本
  fastify.delete('/api/translate/:id', async (req, reply) => {
    const { id } = req.params;
    const db = req.server.db || global.db;
    if (!db) return reply.status(500).send({ success: false, error: 'DB not available' });

    db.prepare('DELETE FROM translation_changes WHERE translation_id = ?').run(id);
    db.prepare('DELETE FROM translations WHERE id = ?').run(id);
    return { success: true };
  });

  // GET /api/translate/strengths - 获取改编强度说明
  fastify.get('/api/translate/strengths', async (req, reply) => {
    return {
      success: true,
      data: [
        { min: 0, max: 20, label: 'basic', name: '基础翻译', desc: '只翻译文字，不改变任何文化要素' },
        { min: 20, max: 40, label: 'light', name: '受限改造', desc: '语义优化，保留文化背景' },
        { min: 40, max: 60, label: 'smart', name: '智能适配', desc: '自动替换文化要素（筷子→刀叉）' },
        { min: 60, max: 80, label: 'deep', name: '深度本土化', desc: '情节逻辑、人物习惯全面调整' },
        { min: 80, max: 100, label: 'full', name: '完全重写', desc: 'AI基于原故事重新创作，需人工审核' },
      ]
    };
  });
}

module.exports = translateRoutes;
