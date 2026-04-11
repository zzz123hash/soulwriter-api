const fastify = require('fastify')({ logger: true });
const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const db = new Database(path.join(__dirname, '..', 'data.db'));

// Init DB
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    projectId TEXT NOT NULL,
    name TEXT NOT NULL,
    soulData TEXT DEFAULT '{}',
    attrs TEXT DEFAULT '[]',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    projectId TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    projectId TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    projectId TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS ai_config (
    id TEXT PRIMARY KEY,
    type TEXT DEFAULT 'cloud',
    baseUrl TEXT DEFAULT 'https://api.openai.com/v1',
    model TEXT DEFAULT 'gpt-4o',
    apiKey TEXT DEFAULT '',
    localPort INTEGER DEFAULT 42897,
    localModel TEXT DEFAULT 'qwen-1.5b',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Ensure default AI config exists
const aiConfigExists = db.prepare('SELECT COUNT(*) as count FROM ai_config').get();
if (!aiConfigExists.count) {
  db.prepare('INSERT INTO ai_config (id, type, baseUrl, model, apiKey, localPort, localModel) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(crypto.randomUUID(), 'cloud', 'https://api.openai.com/v1', 'gpt-4o', '', 42897, 'qwen-1.5b');
}

// ============ AI Functions ============
const DEFAULT_CLOUD_URL = 'https://api.openai.com/v1/chat/completions';

async function askCloudEngine(prompt, config = {}) {
  const baseUrl = String(config.baseUrl || DEFAULT_CLOUD_URL).trim();
  const url = baseUrl.endsWith('/chat/completions') 
    ? baseUrl 
    : `${baseUrl.replace(/\/$/, '')}/chat/completions`;
  const model = String(config.model || 'gpt-4o');
  const apiKey = String(config.apiKey || '');
  const temperature = Number.isFinite(config.temperature) ? config.temperature : 0.7;
  
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature })
    });
    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new Error(`Cloud request failed: ${res.status}${errorText ? ' ' + errorText : ''}`);
    }
    const data = await res.json();
    return typeof data?.choices?.[0]?.message?.content === 'string' 
      ? data.choices[0].message.content 
      : '';
  } catch (error) {
    throw new Error(`Cloud AI error: ${error.message}`);
  }
}

async function askLocalEngine(prompt, config = {}) {
  const port = Number(config.localPort ?? 42897);
  const safePort = Number.isFinite(port) ? port : 42897;
  const modelId = String(config.localModel || 'qwen-1.5b').trim();
  const url = `http://127.0.0.1:${safePort}/v1/chat/completions`;
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: modelId, messages: [{ role: 'user', content: prompt }], temperature: 0.7 })
    });
    if (!res.ok) throw new Error('Local engine not responding');
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || '';
  } catch (error) {
    throw new Error(`Local AI error: ${error.message}`);
  }
}

async function dispatchAITask(prompt, taskType = 'creative', options = {}) {
  const config = db.prepare('SELECT * FROM ai_config LIMIT 1').get();
  if (!config) throw new Error('AI not configured');
  
  if (taskType === 'utility' || config.type === 'local') {
    return askLocalEngine(prompt, config);
  }
  return askCloudEngine(prompt, config);
}

// ============ Routes ============
fastify.get('/health', () => ({ status: 'ok', time: new Date().toISOString() }));

// Projects CRUD
fastify.get('/api/v1/projects', () => {
  return db.prepare('SELECT * FROM projects ORDER BY createdAt DESC').all();
});

fastify.post('/api/v1/projects', async (req) => {
  const { name } = req.body;
  if (!name) return { error: 'name required' };
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO projects (id, name) VALUES (?, ?)').run(id, name);
  return { id, name };
});

fastify.get('/api/v1/projects/:id', (req) => {
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
});

fastify.put('/api/v1/projects/:id', (req) => {
  const { name } = req.body;
  db.prepare('UPDATE projects SET name = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(name, req.params.id);
  return { success: true };
});

fastify.delete('/api/v1/projects/:id', (req) => {
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  return { success: true };
});

// Roles CRUD
fastify.get('/api/v1/projects/:projectId/roles', (req) => {
  return db.prepare('SELECT * FROM roles WHERE projectId = ?').all(req.params.projectId);
});

fastify.post('/api/v1/roles', async (req) => {
  const { projectId, name } = req.body;
  if (!projectId || !name) return { error: 'projectId and name required' };
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO roles (id, projectId, name) VALUES (?, ?, ?)').run(id, projectId, name);
  return { id, projectId, name };
});

fastify.get('/api/v1/roles/:id', (req) => {
  return db.prepare('SELECT * FROM roles WHERE id = ?').get(req.params.id);
});

fastify.put('/api/v1/roles/:id', (req) => {
  const { name, soulData, attrs } = req.body;
  db.prepare('UPDATE roles SET name = ?, soulData = ?, attrs = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
    .run(name, soulData || '{}', attrs || '[]', req.params.id);
  return { success: true };
});

fastify.delete('/api/v1/roles/:id', (req) => {
  db.prepare('DELETE FROM roles WHERE id = ?').run(req.params.id);
  return { success: true };
});

// Soul API
fastify.get('/api/v1/roles/:id/soul', (req) => {
  const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(req.params.id);
  return { soul: role?.soulData || '{}', attrs: role?.attrs || '[]' };
});

fastify.put('/api/v1/roles/:id/soul', (req) => {
  const { soul, attrs } = req.body;
  db.prepare('UPDATE roles SET soulData = ?, attrs = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
    .run(soul || '{}', attrs || '[]', req.params.id);
  return { success: true };
});

// Items CRUD
fastify.get('/api/v1/projects/:projectId/items', (req) => {
  return db.prepare('SELECT * FROM items WHERE projectId = ?').all(req.params.projectId);
});

fastify.post('/api/v1/items', async (req) => {
  const { projectId, name, description } = req.body;
  if (!projectId || !name) return { error: 'projectId and name required' };
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO items (id, projectId, name, description) VALUES (?, ?, ?, ?)')
    .run(id, projectId, name, description || '');
  return { id, projectId, name, description };
});

fastify.get('/api/v1/items/:id', (req) => {
  return db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
});

fastify.put('/api/v1/items/:id', (req) => {
  const { name, description } = req.body;
  db.prepare('UPDATE items SET name = ?, description = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
    .run(name, description || '', req.params.id);
  return { success: true };
});

fastify.delete('/api/v1/items/:id', (req) => {
  db.prepare('DELETE FROM items WHERE id = ?').run(req.params.id);
  return { success: true };
});

// Locations CRUD
fastify.get('/api/v1/projects/:projectId/locations', (req) => {
  return db.prepare('SELECT * FROM locations WHERE projectId = ?').all(req.params.projectId);
});

fastify.post('/api/v1/locations', async (req) => {
  const { projectId, name, description } = req.body;
  if (!projectId || !name) return { error: 'projectId and name required' };
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO locations (id, projectId, name, description) VALUES (?, ?, ?, ?)')
    .run(id, projectId, name, description || '');
  return { id, projectId, name, description };
});

fastify.get('/api/v1/locations/:id', (req) => {
  return db.prepare('SELECT * FROM locations WHERE id = ?').get(req.params.id);
});

fastify.put('/api/v1/locations/:id', (req) => {
  const { name, description } = req.body;
  db.prepare('UPDATE locations SET name = ?, description = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
    .run(name, description || '', req.params.id);
  return { success: true };
});

fastify.delete('/api/v1/locations/:id', (req) => {
  db.prepare('DELETE FROM locations WHERE id = ?').run(req.params.id);
  return { success: true };
});

// Settings CRUD
fastify.get('/api/v1/projects/:projectId/settings', (req) => {
  return db.prepare('SELECT * FROM settings WHERE projectId = ?').all(req.params.projectId);
});

fastify.post('/api/v1/settings', async (req) => {
  const { projectId, key, value } = req.body;
  if (!projectId || !key) return { error: 'projectId and key required' };
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO settings (id, projectId, key, value) VALUES (?, ?, ?, ?)')
    .run(id, projectId, key, value || '');
  return { id, projectId, key, value };
});

fastify.get('/api/v1/settings/:id', (req) => {
  return db.prepare('SELECT * FROM settings WHERE id = ?').get(req.params.id);
});

fastify.put('/api/v1/settings/:id', (req) => {
  const { key, value } = req.body;
  db.prepare('UPDATE settings SET key = ?, value = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
    .run(key, value || '', req.params.id);
  return { success: true };
});

fastify.delete('/api/v1/settings/:id', (req) => {
  db.prepare('DELETE FROM settings WHERE id = ?').run(req.params.id);
  return { success: true };
});

// ============ AI Config & Tasks ============

// Get AI config
fastify.get('/api/v1/ai/config', (req) => {
  const config = db.prepare('SELECT * FROM ai_config LIMIT 1').get();
  if (!config) return { error: 'AI not configured' };
  return {
    type: config.type,
    baseUrl: config.baseUrl,
    model: config.model,
    hasApiKey: !!config.apiKey,
    localPort: config.localPort,
    localModel: config.localModel
  };
});

// Update AI config
fastify.put('/api/v1/ai/config', async (req) => {
  const { type, baseUrl, model, apiKey, localPort, localModel } = req.body;
  db.prepare(`
    UPDATE ai_config SET 
      type = COALESCE(?, type),
      baseUrl = COALESCE(?, baseUrl),
      model = COALESCE(?, model),
      apiKey = COALESCE(?, apiKey),
      localPort = COALESCE(?, localPort),
      localModel = COALESCE(?, localModel),
      updatedAt = CURRENT_TIMESTAMP
    WHERE id = (SELECT id FROM ai_config LIMIT 1)
  `).run(type, baseUrl, model, apiKey, localPort, localModel);
  return { success: true };
});

// AI task endpoint
fastify.post('/api/v1/ai/run', async (req) => {
  const { prompt, taskType, options } = req.body;
  if (!prompt) return { error: 'prompt required' };
  
  try {
    const result = await dispatchAITask(prompt, taskType || 'creative', options || {});
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ============ Start ============
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log('Server running at http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
