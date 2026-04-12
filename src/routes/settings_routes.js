// Settings API routes - Global + per-character AI config
async function settingsRoutes(fastify, options) {
  const db = options?.db;
  // Get all AI configs (global + character-specific)
  fastify.get('/api/settings/ai-configs', async (req) => {
    const configs = db.prepare('SELECT * FROM ai_config ORDER BY createdAt').all();
    return { success: true, data: configs };
  });

  // Get global AI config
  fastify.get('/api/settings/global', async (req) => {
    const config = db.prepare("SELECT * FROM ai_config WHERE type = 'cloud' LIMIT 1").get();
    return { success: true, data: config || null };
  });

  // Update global AI config
  fastify.put('/api/settings/global', async (req) => {
    const { baseUrl, model, apiKey, localPort, localModel } = req.body;
    const existing = db.prepare("SELECT id FROM ai_config WHERE type = 'cloud'").get();
    if (existing) {
      db.prepare(`UPDATE ai_config SET baseUrl = ?, model = ?, apiKey = ?, localPort = ?, localModel = ?, updatedAt = CURRENT_TIMESTAMP WHERE type = 'cloud'`)
        .run(baseUrl, model, apiKey, localPort || 42897, localModel || 'qwen-1.5b');
    } else {
      db.prepare(`INSERT INTO ai_config (id, type, baseUrl, model, apiKey, localPort, localModel) VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .run(crypto.randomUUID(), 'cloud', baseUrl, model, apiKey, localPort || 42897, localModel || 'qwen-1.5b');
    }
    return { success: true };
  });

  // Get character-specific AI config
  fastify.get('/api/settings/character/:characterId', async (req) => {
    const config = db.prepare('SELECT * FROM ai_config WHERE id = ?').get(req.params.characterId);
    return { success: true, data: config || null };
  });

  // Save character AI config
  fastify.post('/api/settings/character', async (req) => {
    const { id, characterId, type, baseUrl, model, apiKey, localPort, localModel } = req.body;
    const existing = db.prepare('SELECT id FROM ai_config WHERE id = ?').get(id);
    if (existing) {
      db.prepare(`UPDATE ai_config SET type = ?, baseUrl = ?, model = ?, apiKey = ?, localPort = ?, localModel = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`)
        .run(type || 'cloud', baseUrl, model, apiKey, localPort || 42897, localModel || 'qwen-1.5b', id);
    } else {
      db.prepare(`INSERT INTO ai_config (id, type, baseUrl, model, apiKey, localPort, localModel) VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .run(characterId, type || 'cloud', baseUrl, model, apiKey, localPort || 42897, localModel || 'qwen-1.5b');
    }
    return { success: true };
  });

  // Delete character AI config
  fastify.delete('/api/settings/character/:characterId', async (req) => {
    db.prepare('DELETE FROM ai_config WHERE id = ?').run(req.params.characterId);
    return { success: true };
  });
};
module.exports = settingsRoutes;
