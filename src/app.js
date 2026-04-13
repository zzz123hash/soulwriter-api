const fastify = require('fastify')({ logger: true });
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const booksRoutes = require('./books_routes');
const nvwa = require('./nvwa_engine');
const worksStorage = require('./services/works_storage');
const worksRoutes = require('./routes/works_routes');
const uploadRoutes = require('./routes/upload_routes');
const eventsRoutes = require('./routes/events_routes');
const memoryRoutes = require('./routes/memory_routes');
const settingsRoutes = require('./routes/settings_routes');
const translateRoutes = require('./routes/translate_routes');
const aiRoutes = require('../routes/ai_routes');
const db = new Database(path.join(__dirname, '..', 'data.db'));

// ============ Init DB ============
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY, name TEXT NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY, projectId TEXT NOT NULL, name TEXT NOT NULL,
    soulData TEXT DEFAULT '{}', attrs TEXT DEFAULT '[]',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY, projectId TEXT NOT NULL, name TEXT NOT NULL, description TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY, projectId TEXT NOT NULL, name TEXT NOT NULL, description TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY, projectId TEXT NOT NULL, key TEXT NOT NULL, value TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS ai_config (
    id TEXT PRIMARY KEY, type TEXT DEFAULT 'cloud', baseUrl TEXT DEFAULT 'https://api.openai.com/v1',
    model TEXT DEFAULT 'gpt-4o', apiKey TEXT DEFAULT '',
    localPort INTEGER DEFAULT 42897, localModel TEXT DEFAULT 'qwen-1.5b',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY, bookId TEXT, title TEXT, cause TEXT, process TEXT, result TEXT,
    arc TEXT DEFAULT '主线', characters TEXT, locations TEXT, items TEXT,
    chapter TEXT, timestamp INTEGER DEFAULT 0, isKeyEvent INTEGER DEFAULT 0,
    tension INTEGER DEFAULT 50, status TEXT DEFAULT 'open',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Ensure default AI config
const aiConfigCount = db.prepare('SELECT COUNT(*) as c FROM ai_config').get();
if (!aiConfigCount.c) {
  db.prepare('INSERT INTO ai_config (id, type, baseUrl, model, apiKey, localPort, localModel) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(crypto.randomUUID(), 'cloud', 'https://api.openai.com/v1', 'gpt-4o', '', 42897, 'qwen-1.5b');
}
nvwa.initNvwaDB(db);
const NvwaEngine = require('./modules/nvwa/engine_v2');
const nvwaEngine = new NvwaEngine({ db });

// Plugin system
const pluginManager = require('./services/plugin_manager');
pluginManager.init();

// ============ AI Functions ============
const DEFAULT_CLOUD_URL = 'https://api.openai.com/v1/chat/completions';

async function askCloudEngine(prompt, config = {}) {
  const baseUrl = String(config.baseUrl || DEFAULT_CLOUD_URL).trim();
  const url = baseUrl.endsWith('/chat/completions') ? baseUrl : baseUrl.replace(/\/$/, '') + '/chat/completions';
  const model = String(config.model || 'gpt-4o');
  const apiKey = String(config.apiKey || '');
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  
  const res = await fetch(url, {
    method: 'POST', headers,
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.7 })
  });
  if (!res.ok) throw new Error(`Cloud error: ${res.status}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}

async function askLocalEngine(prompt, config = {}) {
  const port = Number(config.localPort || 42897);
  const modelId = String(config.localModel || 'qwen-1.5b');
  const res = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: modelId, messages: [{ role: 'user', content: prompt }], temperature: 0.7 })
  });
  if (!res.ok) throw new Error('Local engine error');
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}

async function dispatchAITask(prompt, taskType = 'creative', options = {}) {
  const config = db.prepare('SELECT * FROM ai_config LIMIT 1').get();
  if (!config) throw new Error('AI not configured');
  if (taskType === 'utility' || config.type === 'local') return askLocalEngine(prompt, config);
  return askCloudEngine(prompt, config);
}

// ============ Routes ============
fastify.get('/health', () => ({ status: 'ok', time: new Date().toISOString() }));

// Projects
fastify.get('/api/v1/projects', () => db.prepare('SELECT * FROM projects ORDER BY createdAt DESC').all());
fastify.post('/api/v1/projects', async (req) => {
  const { name } = req.body;
  if (!name) return { error: 'name required' };
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO projects (id, name) VALUES (?, ?)').run(id, name);
  return { id, name };
});
fastify.get('/api/v1/projects/:id', (req) => db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id));
fastify.put('/api/v1/projects/:id', (req) => {
  const { name } = req.body;
  db.prepare('UPDATE projects SET name = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(name, req.params.id);
  return { success: true };
});
fastify.delete('/api/v1/projects/:id', (req) => {
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  return { success: true };
});

// Roles
fastify.get('/api/v1/projects/:projectId/roles', (req) => 
  db.prepare('SELECT * FROM roles WHERE projectId = ?').all(req.params.projectId));
fastify.post('/api/v1/roles', async (req) => {
  const { projectId, name } = req.body;
  if (!projectId || !name) return { error: 'projectId and name required' };
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO roles (id, projectId, name) VALUES (?, ?, ?)').run(id, projectId, name);
  return { id, projectId, name };
});
fastify.get('/api/v1/roles/:id', (req) => db.prepare('SELECT * FROM roles WHERE id = ?').get(req.params.id));
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

// Soul
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

// Items
fastify.get('/api/v1/projects/:projectId/items', (req) =>
  db.prepare('SELECT * FROM items WHERE projectId = ?').all(req.params.projectId));
fastify.post('/api/v1/items', async (req) => {
  const { projectId, name, description } = req.body;
  if (!projectId || !name) return { error: 'projectId and name required' };
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO items (id, projectId, name, description) VALUES (?, ?, ?, ?)')
    .run(id, projectId, name, description || '');
  return { id, projectId, name, description };
});
fastify.get('/api/v1/items/:id', (req) => db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id));
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

// Locations
fastify.get('/api/v1/projects/:projectId/locations', (req) =>
  db.prepare('SELECT * FROM locations WHERE projectId = ?').all(req.params.projectId));
fastify.post('/api/v1/locations', async (req) => {
  const { projectId, name, description } = req.body;
  if (!projectId || !name) return { error: 'projectId and name required' };
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO locations (id, projectId, name, description) VALUES (?, ?, ?, ?)')
    .run(id, projectId, name, description || '');
  return { id, projectId, name, description };
});
fastify.get('/api/v1/locations/:id', (req) => db.prepare('SELECT * FROM locations WHERE id = ?').get(req.params.id));
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

// Settings
fastify.get('/api/v1/projects/:projectId/settings', (req) =>
  db.prepare('SELECT * FROM settings WHERE projectId = ?').all(req.params.projectId));
fastify.post('/api/v1/settings', async (req) => {
  const { projectId, key, value } = req.body;
  if (!projectId || !key) return { error: 'projectId and key required' };
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO settings (id, projectId, key, value) VALUES (?, ?, ?, ?)')
    .run(id, projectId, key, value || '');
  return { id, projectId, key, value };
});
fastify.get('/api/v1/settings/:id', (req) => db.prepare('SELECT * FROM settings WHERE id = ?').get(req.params.id));
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

// AI Config
fastify.get('/api/v1/ai/config', () => {
  const c = db.prepare('SELECT * FROM ai_config LIMIT 1').get();
  if (!c) return { error: 'AI not configured' };
  return { type: c.type, baseUrl: c.baseUrl, model: c.model, hasApiKey: !!c.apiKey, localPort: c.localPort, localModel: c.localModel };
});
fastify.put('/api/v1/ai/config', (req) => {
  const { type, baseUrl, model, apiKey, localPort, localModel } = req.body;
  db.prepare(`UPDATE ai_config SET type=COALESCE(?,type),baseUrl=COALESCE(?,baseUrl),model=COALESCE(?,model),apiKey=COALESCE(?,apiKey),localPort=COALESCE(?,localPort),localModel=COALESCE(?,localModel),updatedAt=CURRENT_TIMESTAMP WHERE id=(SELECT id FROM ai_config LIMIT 1)`)
    .run(type, baseUrl, model, apiKey, localPort, localModel);
  return { success: true };
});
fastify.post('/api/v1/ai/run', async (req) => {
  const { prompt, taskType, options } = req.body;
  if (!prompt) return { error: 'prompt required' };
  try { return { success: true, result: await dispatchAITask(prompt, taskType || 'creative', options || {}) }; }
  catch (e) { return { success: false, error: e.message }; }
});

// ============ GenesisTree ============
const { initGenesisDB, createSeed, getSeed, createNode, getNode, getChildNodes, updateNode, createEdge, buildTree, deleteNode } = require('./genesis_tree');
const genesisNvwaRoutes = require('./routes/genesis_nvwa_routes');
initGenesisDB(db);

fastify.post('/api/genesis/seeds', (req) => {
  const id = createSeed(db, req.body);
  return { success: true, id };
});
fastify.get('/api/genesis/seeds', () => db.prepare('SELECT * FROM genesis_seeds ORDER BY createdAt DESC').all());
fastify.get('/api/genesis/seeds/:id', (req) => {
  const seed = getSeed(db, req.params.id);
  if (!seed) return { error: 'Seed not found' };
  return seed;
});
fastify.post('/api/genesis/nodes', (req) => {
  const { seedId, parentId, type, label, description, positionX, positionY, metadata } = req.body;
  if (!seedId || !label) return { error: 'seedId and label required' };
  const id = createNode(db, { seedId, parentId, type, label, description, positionX, positionY, metadata });
  return { success: true, id };
});
fastify.get('/api/genesis/nodes/:id', (req) => {
  const node = getNode(db, req.params.id);
  if (!node) return { error: 'Node not found' };
  return node;
});
fastify.get('/api/genesis/nodes/:id/children', (req) => getChildNodes(db, req.params.id));
fastify.put('/api/genesis/nodes/:id', (req) => {
  updateNode(db, req.params.id, req.body);
  return { success: true };
});
fastify.delete('/api/genesis/nodes/:id', (req) => {
  deleteNode(db, req.params.id);
  return { success: true };
});
fastify.post('/api/genesis/edges', (req) => {
  const { sourceId, targetId, type, label, metadata } = req.body;
  if (!sourceId || !targetId) return { error: 'sourceId and targetId required' };
  const id = createEdge(db, sourceId, targetId, { type, label, metadata });
  return { success: true, id };
});
fastify.get('/api/genesis/seeds/:id/tree', (req) => buildTree(db, req.params.id));


// API根路由
fastify.get('/api/v1', () => ({ name: 'SoulWriter API', version: '1.0.0' }));

// ============ 章节/场景管理 ============
db.exec("CREATE TABLE IF NOT EXISTS chapters (id TEXT PRIMARY KEY, projectId TEXT NOT NULL, title TEXT NOT NULL, orderIndex INTEGER DEFAULT 0, status TEXT DEFAULT 'draft', createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE)");

db.exec("CREATE TABLE IF NOT EXISTS scenes (id TEXT PRIMARY KEY, projectId TEXT NOT NULL, chapterId TEXT, title TEXT NOT NULL, content TEXT DEFAULT '', sceneType TEXT DEFAULT 'scene', tension INTEGER DEFAULT 50, emotion TEXT DEFAULT 'neutral', summary TEXT DEFAULT '', wordCount INTEGER DEFAULT 0, status TEXT DEFAULT 'draft', createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE)");

// 章节路由
fastify.get('/api/v1/projects/:projectId/chapters', (req) => {
  return db.prepare('SELECT * FROM chapters WHERE projectId = ? ORDER BY orderIndex').all(req.params.projectId);
});
    fastify.register(uploadRoutes, { db });
    fastify.register(eventsRoutes, { db });
    fastify.register(memoryRoutes, { db });
    fastify.register(settingsRoutes, { db });
    fastify.register(genesisNvwaRoutes, { db });
    fastify.register(translateRoutes, { db });
    fastify.register(aiRoutes, { prefix: '/api/v1/ai' });

fastify.post('/api/v1/chapters', async (req) => {
  const { projectId, title, orderIndex } = req.body;
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO chapters (id, projectId, title, orderIndex) VALUES (?, ?, ?, ?)').run(id, projectId, title, orderIndex || 0);
  return { id, projectId, title, orderIndex: orderIndex || 0 };
});

fastify.put('/api/v1/chapters/:id', (req) => {
  const { title, orderIndex, status } = req.body;
  const existing = db.prepare('SELECT * FROM chapters WHERE id = ?').get(req.params.id);
  if (!existing) return { error: 'Not found' };
  db.prepare('UPDATE chapters SET title = ?, orderIndex = ?, status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(title || existing.title, orderIndex ?? existing.orderIndex, status || existing.status, req.params.id);
  return db.prepare('SELECT * FROM chapters WHERE id = ?').get(req.params.id);
});

fastify.delete('/api/v1/chapters/:id', (req) => {
  db.prepare('DELETE FROM chapters WHERE id = ?').run(req.params.id);
  return { success: true };
});

// 场景路由
fastify.get('/api/v1/projects/:projectId/scenes', (req) => {
  return db.prepare('SELECT * FROM scenes WHERE projectId = ? ORDER BY chapterId, createdAt').all(req.params.projectId);
});

fastify.get('/api/v1/chapters/:chapterId/scenes', (req) => {
  return db.prepare('SELECT * FROM scenes WHERE chapterId = ? ORDER BY createdAt').all(req.params.chapterId);
});

fastify.post('/api/v1/scenes', async (req) => {
  const { projectId, chapterId, title, content, sceneType, tension, emotion } = req.body;
  const id = crypto.randomUUID();
  const wordCount = (content || '').length;
  db.prepare('INSERT INTO scenes (id, projectId, chapterId, title, content, sceneType, tension, emotion, wordCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(id, projectId, chapterId, title, content || '', sceneType || 'scene', tension || 50, emotion || 'neutral', wordCount);
  return { id, projectId, chapterId, title, wordCount };
});

fastify.put('/api/v1/scenes/:id', (req) => {
  const { title, content, sceneType, tension, emotion, status } = req.body;
  const existing = db.prepare('SELECT * FROM scenes WHERE id = ?').get(req.params.id);
  if (!existing) return { error: 'Not found' };
  const wordCount = content !== undefined ? content.length : existing.wordCount;
  db.prepare('UPDATE scenes SET title = ?, content = ?, sceneType = ?, tension = ?, emotion = ?, status = ?, wordCount = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(title || existing.title, content !== undefined ? content : existing.content, sceneType || existing.sceneType, tension ?? existing.tension, emotion || existing.emotion, status || existing.status, wordCount, req.params.id);
  return db.prepare('SELECT * FROM scenes WHERE id = ?').get(req.params.id);
});

fastify.delete('/api/v1/scenes/:id', (req) => {
  db.prepare('DELETE FROM scenes WHERE id = ?').run(req.params.id);
  return { success: true };
});



// Dashboard静态文件
const _mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

// config 目录静态文件（i18n语言包、快捷键配置等）
fastify.get('/config/i18n/:lang.json', (req, reply) => {
  const lang = req.params.lang;
  const filePath = path.join(__dirname, '..', 'config', 'i18n', `${lang}.json`);
  if (fs.existsSync(filePath)) {
    reply.header('Content-Type', 'application/json');
    reply.send(fs.createReadStream(filePath));
  } else {
    reply.code(404).send({ error: 'Locale not found' });
  }
});

fastify.get('/config/:filename', (req, reply) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '..', 'config', filename);
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filename);
    const ct = ext === '.json' ? 'application/json' : 'text/plain';
    reply.header('Content-Type', ct + '; charset=utf-8');
    reply.send(fs.createReadStream(filePath));
  } else {
    reply.code(404).send({ error: 'Config not found' });
  }
});

fastify.get('/dashboard/', (req, reply) => {
  reply.header('Content-Type', 'text/html; charset=utf-8');
  reply.send(fs.createReadStream(path.join(__dirname, '..', 'dashboard', 'index.html')));
});

fastify.get('/dashboard/*', (req, reply) => {
  const filepath = req.params['*'];
  const filePath = path.join(__dirname, '..', 'dashboard', filepath);
  
  if (!filePath.startsWith(path.join(__dirname, '..', 'dashboard'))) {
    return reply.code(403).send('Forbidden');
  }
  
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filepath);
    const contentType = _mimeTypes[ext] || 'application/octet-stream';
    reply.header('Content-Type', contentType);
    reply.send(fs.createReadStream(filePath));
  } else {
    reply.code(404).send('Not Found: ' + filepath);
  }
});
// ============ Start ============
const start = async () => {
  try {
    fastify.register(booksRoutes);
    fastify.register(worksRoutes);
// ============ Nvwa Routes ============
fastify.get('/api/v1/nvwa/status', () => {
  const souls = db.prepare("SELECT id, name, status, createdAt FROM nvwa_souls WHERE status = 'active'").all();
  const worldVars = db.prepare("SELECT key, value, reason FROM nvwa_world_vars").all().reduce((acc, v) => { acc[v.key] = v.value; return acc; }, {});
  return { activeCharacters: souls.length, characters: souls, worldVars };
});

fastify.get('/api/v1/nvwa/souls', () => db.prepare("SELECT * FROM nvwa_souls ORDER BY createdAt DESC").all());

fastify.post('/api/v1/nvwa/souls', async (req) => {
  const { name, gender, personality, background, goals, fears, strengths, weaknesses, soul } = req.body;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(`INSERT INTO nvwa_souls (id, name, attributes, klines, relationships, metadata, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, name, JSON.stringify({}), JSON.stringify([]), JSON.stringify([]), JSON.stringify({ gender, personality, background, goals, fears, strengths, weaknesses, soul }), 'active', now, now);
  return { success: true, id, soul: db.prepare("SELECT * FROM nvwa_souls WHERE id = ?").get(id) };
});

fastify.get('/api/v1/nvwa/souls/:id', (req) => db.prepare("SELECT * FROM nvwa_souls WHERE id = ?").get(req.params.id));

fastify.put('/api/v1/nvwa/souls/:id', (req) => {
  const { attributes, relationships, status } = req.body;
  const updates = []; const vals = [];
  if (attributes !== undefined) { updates.push('attributes = ?'); vals.push(JSON.stringify(attributes)); }
  if (relationships !== undefined) { updates.push('relationships = ?'); vals.push(JSON.stringify(relationships)); }
  if (status !== undefined) { updates.push('status = ?'); vals.push(status); }
  updates.push('updatedAt = ?'); vals.push(new Date().toISOString());
  vals.push(req.params.id);
  db.prepare(`UPDATE nvwa_souls SET ${updates.join(',')} WHERE id = ?`).run(...vals);
  return { success: true, soul: db.prepare("SELECT * FROM nvwa_souls WHERE id = ?").get(req.params.id) };
});

fastify.delete('/api/v1/nvwa/souls/:id', (req) => { db.prepare("DELETE FROM nvwa_souls WHERE id = ?").run(req.params.id); return { success: true }; });

fastify.post('/api/v1/nvwa/tick', async (req) => {
  const result = await nvwaEngine.runTick(req.body || {});
  return result;
});

fastify.get('/api/v1/nvwa/world-vars', () => db.prepare("SELECT * FROM nvwa_world_vars").all());
fastify.put('/api/v1/nvwa/world-vars/:key', (req) => {
  const { value, reason } = req.body;
  db.prepare("UPDATE nvwa_world_vars SET value = ?, reason = ?, updatedAt = CURRENT_TIMESTAMP WHERE `key` = ?").run(value, reason || '', req.params.key);
  return { success: true };
});
fastify.get('/api/v1/nvwa/events', (req) => {
  const limit = parseInt(req.query.limit) || 50;
  return db.prepare("SELECT * FROM nvwa_events ORDER BY createdAt DESC LIMIT ?").all(limit);
});
fastify.get('/api/v1/nvwa/logs', (req) => {
  const limit = parseInt(req.query.limit) || 50;
  return db.prepare("SELECT * FROM nvwa_logs ORDER BY createdAt DESC LIMIT ?").all(limit);
});
fastify.get('/api/v1/nvwa/klines/:soulId', (req) => db.prepare("SELECT * FROM nvwa_souls_klines WHERE soulId = ? ORDER BY createdAt DESC LIMIT 100").all(req.params.soulId));


await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server running at http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();

// ============ Export ============
const { exportProjectToTxt, exportProjectToJson, exportProjectToMarkdown, exportNvwaToTxt, exportGenesisToTxt } = require('./export_module');

fastify.get('/api/v1/export/project/:id/txt', (req) => {
  const content = exportProjectToTxt(db, req.params.id);
  if (!content) return { error: 'Project not found' };
  return { content, filename: 'project.txt' };
});

fastify.get('/api/v1/export/project/:id/json', (req) => {
  const data = exportProjectToJson(db, req.params.id);
  if (!data) return { error: 'Project not found' };
  return data;
});

fastify.get('/api/v1/export/project/:id/md', (req) => {
  const content = exportProjectToMarkdown(db, req.params.id);
  if (!content) return { error: 'Project not found' };
  return { content, filename: 'project.md' };
});

fastify.get('/api/v1/export/nvwa/txt', (req) => {
  const content = exportNvwaToTxt(db);
  return { content, filename: 'nvwa.txt' };
});

fastify.get('/api/v1/export/genesis/:id/txt', (req) => {
  const content = exportGenesisToTxt(db, req.params.id);
  if (!content) return { error: 'Seed not found' };
  return { content, filename: 'genesis.txt' };
});
// ============ Dashboard ============
const DASHBOARD = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>绘梦 SoulWriter</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#0f0f23;color:#e0e0e0;min-height:100vh}
.c{max-width:1000px;margin:0 auto;padding:20px}
h1{background:linear-gradient(135deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:2.5em;text-align:center;padding:30px 0}
.bar{display:flex;justify-content:center;gap:20px;margin:20px 0}
.b{background:#1a1a3e;padding:15px 25px;border-radius:12px;text-align:center}
.b .v{font-size:1.8em;font-weight:bold;color:#667eea}
.b .l{color:#888;font-size:0.85em;margin-top:5px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin:20px 0}
.m{background:#1a1a3e;padding:20px;border-radius:12px;text-align:center}
.m h3{color:#667eea;margin:10px 0}
.m p{color:#888;font-size:0.85em}
.test{background:#1a1a3e;padding:20px;border-radius:12px;margin:20px 0}
.test h3{color:#667eea;margin-bottom:15px}
select,input{background:#252552;border:1px solid #333;color:#fff;padding:10px;border-radius:8px;width:100%;margin:5px 0}
.btn{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;margin:5px}
.result{background:#0d0d1a;padding:15px;border-radius:8px;margin-top:10px;font-family:monospace;font-size:0.85em;max-height:200px;overflow:auto}
.log{background:#0d0d1a;padding:15px;border-radius:8px;max-height:200px;overflow:auto;font-family:monospace;font-size:0.85em}
.log-entry{padding:5px 10px;margin:3px 0;border-radius:5px}
.log-entry.ok{background:#10b98120;border-left:3px solid #10b981}
.log-entry.err{background:#ef444420;border-left:3px solid #ef4444}
.endpoints{display:flex;flex-wrap:wrap;gap:8px}
.endpoints span{background:#252552;padding:5px 10px;border-radius:5px;font-family:monospace;font-size:0.85em}
</style></head><body>
<div class="c">
<h1>🎭 绘梦 SoulWriter</h1>
<div class="bar">
<div class="b"><div class="v" id="status">-</div><div class="l">API状态</div></div>
<div class="b"><div class="v" id="projects">-</div><div class="l">项目</div></div>
<div class="b"><div class="v" id="nvwa">-</div><div class="l">女娲角色</div></div>
<div class="b"><div class="v">v1.0</div><div class="l">版本</div></div>
</div>
<div class="grid">
<div class="m" onclick="showBooks()"><h3>📚 Books</h3><p>书本管理</p></div>
<div class="m"><h3>🎭 女娲推演</h3><p>角色量子纠缠引擎</p></div>
<div class="m"><h3>🌳 创世树</h3><p>剧情分支管理</p></div>
<div class="m"><h3>📤 导出</h3><p>TXT/JSON/MD</p></div>
</div>
<div id="books-section" style="display:none;">
<div class="test">
<h3>📚 Books 管理</h3>
<div style="display:flex;gap:10px;margin:10px 0">
<input id="book-title" placeholder="书名" style="flex:1">
<input id="book-author" placeholder="作者" style="flex:1">
<button class="btn" onclick="createBook()">新建书本</button>
</div>
<div id="books-list" style="margin-top:15px"></div>
</div>
</div>
<div class="test">
<h3>🔧 API测试</h3>
<select id="ep">
<option value="/health">/health</option>
<option value="/api/v1/projects">/api/v1/projects</option>
<option value="/api/v1/nvwa/status">/api/v1/nvwa/status</option>
<option value="/api/v1/ai/config">/api/v1/ai/config</option>
<option value="/api/genesis/seeds">/api/genesis/seeds</option>
</select>
<button class="btn" onclick="test()">发送</button>
<button class="btn" onclick="refresh()">刷新</button>
<div id="result" class="result" style="display:none;"></div>
</div>
<div class="test">
<h3>📊 操作日志</h3>
<div id="log" class="log"></div>
</div>
<div class="test">
<h3>🚀 端点</h3>
<div class="endpoints" id="eps"></div>
</div>
</div>
<script>
const API = location.origin;
const logs = [];
function log(msg, type) {
    logs.unshift({t: new Date().toLocaleTimeString(), msg, type});
    if(logs.length > 15) logs.pop();
    document.getElementById("log").innerHTML = logs.map(l=>'<div class="log-entry '+l.type+'">['+l.t+'] '+l.msg+'</div>').join("");
}
async function api(p) {
    try { const r = await fetch(API + p); return await r.json(); }
    catch(e) { return {error: e.message}; }
}
async function test() {
    const ep = document.getElementById("ep").value;
    document.getElementById("result").style.display = "block";
    document.getElementById("result").textContent = "加载中...";
    const d = await api(ep);
    document.getElementById("result").textContent = JSON.stringify(d, null, 2);
    log(ep + " -> " + (d.error ? d.error : "OK"), d.error ? "err" : "ok");
}
async function refresh() {
    log("刷新...", "ok");
    const h = await api("/health");
    document.getElementById("status").textContent = h.status === "ok" ? "✅" : "❌";
    const p = await api("/api/v1/projects");
    document.getElementById("projects").textContent = Array.isArray(p) ? p.length : "?";
    const n = await api("/api/v1/nvwa/status");
    if(n && n.activeCharacters !== undefined) document.getElementById("nvwa").textContent = n.activeCharacters;
}
const eps = ["/health","/api/v1/projects","/api/v1/nvwa/status","/api/v1/ai/config","/api/genesis/seeds"];
document.getElementById("eps").innerHTML = eps.map(e=>'<span>'+e+'</span>').join("");
// Books functions
let books = [];
let shelves = [];

async function loadBooks() {
  const r = await api("/api/bookshelves");
  shelves = r.data || [];
  const r2 = await api("/api/books", "POST", {action:"list"});
  books = r2.data || [];
  renderBooks();
}

async function api(p, m, b) {
  try {
    const opts = {method: m || "GET", headers: {"Content-Type":"application/json"}};
    if (b) opts.body = JSON.stringify(b);
    const r = await fetch(API + p, opts);
    return await r.json();
  } catch(e) { return {error: e.message}; }
}

function renderBooks() {
  const el = document.getElementById("books-list");
  if (!books.length) { el.innerHTML = '<p style="color:#888">暂无书本</p>'; return; }
  el.innerHTML = books.map(b => '<div style="background:#252552;padding:12px;margin:8px 0;border-radius:8px"><b>' + b.title + '</b> <span style="color:#888">by ' + (b.author||'未知') + '</span></div>').join('');
}

async function createBook() {
  const title = document.getElementById("book-title").value.trim();
  const author = document.getElementById("book-author").value.trim();
  if (!title) { alert("请输入书名"); return; }
  const r = await api("/api/books", "POST", {action:"create", title, author});
  if (r.success) {
    document.getElementById("book-title").value = "";
    document.getElementById("book-author").value = "";
    loadBooks();
    log("书本创建成功: " + title, "ok");
  }
}

function showBooks() {
  const el = document.getElementById("books-section");
  if (el.style.display === "none") {
    el.style.display = "block";
    loadBooks();
  } else {
    el.style.display = "none";
  }
}

refresh();
setInterval(refresh, 15000);
</script>
</body></html>`;

fastify.get("/", (req, reply) => { reply.header("Content-Type", "text/html; charset=utf-8"); reply.send(DASHBOARD); });
fastify.get("/dashboard", (req, reply) => { reply.header("Content-Type", "text/html; charset=utf-8"); reply.send(DASHBOARD); });
