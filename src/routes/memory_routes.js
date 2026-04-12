/**
 * Memory API routes - 女娲记忆系统 CRUD
 * 接入 memory_layers.js 的分层记忆架构
 */

const nvwaMemory = require('../modules/nvwa/memory_layers');

const memorySystems = new Map();

function getMemorySystem(characterId) {
  if (!memorySystems.has(characterId)) {
    memorySystems.set(characterId, nvwaMemory.initMemory({
      maxBufferSize: 100,
      maxCoreSize: 20,
      maxRecallSize: 50
    }));
  }
  return memorySystems.get(characterId);
}

module.exports = async function memoryRoutes(fastify, options) {
  const db = options?.db;

  // Ensure tables exist
  try {
    db.exec('CREATE TABLE IF NOT EXISTS memory_entries (id TEXT PRIMARY KEY, characterId TEXT, content TEXT, timestamp INTEGER, importance INTEGER DEFAULT 5, emotions TEXT, relatedChars TEXT, status TEXT DEFAULT "buffer");');
    db.exec('CREATE TABLE IF NOT EXISTS memory_summary (characterId TEXT PRIMARY KEY, summary TEXT, updatedAt TEXT);');
  } catch (e) {}

  // Get character's memory (all layers)
  fastify.get('/api/memory/:bookId/:characterId', async (req) => {
    const { characterId } = req.params;
    const sys = getMemorySystem(characterId);
    const rows = db.prepare('SELECT * FROM memory_entries WHERE characterId = ? ORDER BY timestamp DESC LIMIT 500').all(characterId);
    const memory = { buffer: [], core: [], recall: [], archival: [], summary: '' };
    rows.forEach(function(row) {
      var entry = { id: row.id, content: row.content, timestamp: row.timestamp, importance: row.importance, emotions: JSON.parse(row.emotions || '[]'), relatedChars: JSON.parse(row.relatedChars || '[]'), status: row.status };
      if (memory[entry.status]) memory[entry.status].push(entry);
    });
    const summary = db.prepare('SELECT summary FROM memory_summary WHERE characterId = ?').get(characterId);
    if (summary) memory.summary = summary.summary;
    return { success: true, data: memory };
  });

  // Add memory entry
  fastify.post('/api/memory/:bookId/:characterId', async (req) => {
    const { characterId } = req.params;
    const { content, importance = 5, emotions = [], relatedChars = [], status = 'buffer' } = req.body;
    const sys = getMemorySystem(characterId);
    const entry = { id: 'mem_' + Date.now(), content, timestamp: Date.now(), importance, emotions, relatedChars, status };
    db.prepare('INSERT INTO memory_entries (id, characterId, content, timestamp, importance, emotions, relatedChars, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(entry.id, characterId, content, entry.timestamp, importance, JSON.stringify(emotions), JSON.stringify(relatedChars), status);
    return { success: true, data: entry };
  });

  // Update memory entry
  fastify.put('/api/memory/:bookId/:characterId/:entryId', async (req) => {
    const { entryId } = req.params;
    const { content, importance, status } = req.body;
    if (content !== undefined) db.prepare('UPDATE memory_entries SET content = ? WHERE id = ?').run(content, entryId);
    if (importance !== undefined) db.prepare('UPDATE memory_entries SET importance = ? WHERE id = ?').run(importance, entryId);
    if (status !== undefined) db.prepare('UPDATE memory_entries SET status = ? WHERE id = ?').run(status, entryId);
    return { success: true };
  });

  // Delete memory entry
  fastify.delete('/api/memory/:bookId/:characterId/:entryId', async (req) => {
    db.prepare('DELETE FROM memory_entries WHERE id = ?').run(req.params.entryId);
    return { success: true };
  });

  // Trigger eviction
  fastify.post('/api/memory/:bookId/:characterId/evict', async (req) => {
    const { characterId } = req.params;
    const rows = db.prepare('SELECT * FROM memory_entries WHERE characterId = ? AND status = ? ORDER BY timestamp DESC').all(characterId, 'buffer');
    if (rows.length > 70) {
      var toEvict = rows.slice(50);
      toEvict.forEach(function(row) {
        db.prepare('UPDATE memory_entries SET status = ? WHERE id = ?').run('recall', row.id);
      });
      return { success: true, evicted: toEvict.length };
    }
    return { success: true, evicted: 0 };
  });

  // Update summary
  fastify.post('/api/memory/:bookId/:characterId/summary', async (req) => {
    const { characterId } = req.params;
    const { summary } = req.body;
    const existing = db.prepare('SELECT characterId FROM memory_summary WHERE characterId = ?').get(characterId);
    if (existing) {
      db.prepare('UPDATE memory_summary SET summary = ?, updatedAt = CURRENT_TIMESTAMP WHERE characterId = ?').run(summary, characterId);
    } else {
      db.prepare('INSERT INTO memory_summary (characterId, summary) VALUES (?, ?)').run(characterId, summary);
    }
    return { success: true };
  });
};
