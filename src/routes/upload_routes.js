const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../works/_uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

async function uploadRoutes(fastify, options) {
  const db = options?.db;

  // Register multipart plugin
  fastify.register(require('@fastify/multipart'), {
    limits: { fileSize: 50 * 1024 * 1024 },
    tmpDir: uploadDir
  });

  // ========== Upload file ==========
  fastify.post('/api/upload', async (req, reply) => {
    let file;
    try {
      file = await req.file();
    } catch (e) {
      return { success: false, message: 'No file uploaded' };
    }
    if (!file) return { success: false, message: 'No file uploaded' };

    const ext = path.extname(file.filename || 'file.txt').toLowerCase();
    const allowed = ['.txt', '.md', '.docx', '.epub'];
    if (!allowed.includes(ext)) {
      await file.context.dispose();
      return { success: false, message: 'Unsupported file type: ' + ext };
    }

    const filename = Date.now() + '_' + Math.random().toString(36).substr(2, 8) + ext;
    const dest = path.join(uploadDir, filename);
    const buffer = await file.toBuffer();
    fs.writeFileSync(dest, buffer);

    return {
      success: true,
      data: { filename, ext, content: buffer.toString('utf-8').substring(0, 5000), totalLength: buffer.length }
    };
  });

  // ========== AI Split ==========
  fastify.post('/api/split', async (req, reply) => {
    const { text, bookId } = req.body || {};
    if (!text || !bookId) return { success: false, message: 'Missing text or bookId' };

    const aiConfig = db
      ? db.prepare('SELECT * FROM ai_config LIMIT 1').get()
      : { type: 'cloud', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o', apiKey: '' };

    const prompt = buildSplitPrompt(text);
    let content = '';

    try {
      if (aiConfig.type === 'local' || !aiConfig.apiKey) {
        const port = Number(aiConfig.localPort || 42897);
        const modelId = String(aiConfig.localModel || 'qwen-1.5b');
        const res = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: modelId, messages: [{ role: 'user', content: prompt }], temperature: 0.7 })
        });
        if (!res.ok) throw new Error('Local AI error: ' + res.status);
        const data = await res.json();
        content = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.message?.reasoning_content || '';
      } else {
        const baseUrl = String(aiConfig.baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '');
        const url = `${baseUrl}/chat/completions`;
        const headers = { 'Content-Type': 'application/json' };
        if (aiConfig.apiKey) headers.Authorization = `Bearer ${aiConfig.apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: aiConfig.model || 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 4000
          })
        });
        if (!res.ok) throw new Error('Cloud AI error: ' + res.status);
        const data = await res.json();
        content = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.message?.reasoning_content || '';
      }
    } catch (e) {
      return { success: false, message: e.message };
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else return { success: false, message: 'Failed to parse AI response: ' + content.substring(0, 200) };
    }

    // Save entities to DB
    let savedEntities = { roles: 0, items: 0, locations: 0 };
    if (db && parsed) {
      try {
        const BooksService = require('../services/books_service');
        if (parsed.characters?.length) {
          for (const c of parsed.characters) {
            BooksService.createRole(bookId, {
              name: c.name || '未知',
              role: c.role || '',
              description: `${c.personality || ''} ${c.relationships || ''} ${c.scenes || ''}`.trim()
            });
            savedEntities.roles++;
          }
        }
        if (parsed.items?.length) {
          for (const it of parsed.items) {
            BooksService.createItem(bookId, {
              name: it.name || '未知',
              description: `${it.description || ''} ${it.usage || ''}`.trim()
            });
            savedEntities.items++;
          }
        }
        if (parsed.locations?.length) {
          for (const loc of parsed.locations) {
            BooksService.createLocation(bookId, {
              name: loc.name || '未知',
              description: loc.description || ''
            });
            savedEntities.locations++;
          }
        }
      } catch (e2) {
        console.error('Save split entities error:', e2);
      }
    }

    return { success: true, data: { ...parsed, _saved: savedEntities } };
  });

  // ========== Read uploaded file ==========
  fastify.get('/api/upload/:filename', async (req, reply) => {
    const filepath = path.join(uploadDir, req.params.filename);
    if (!filepath.startsWith(uploadDir)) return reply.status(403).send('Forbidden');
    if (!fs.existsSync(filepath)) return reply.status(404).send('Not found');
    const content = fs.readFileSync(filepath, 'utf-8');
    return { success: true, data: { content } };
  });
}

function buildSplitPrompt(text) {
  const truncated = text.length > 30000 ? text.substring(0, 30000) + '...(truncated)' : text;
  return `You are a novel analysis expert. Analyze the following text and extract all characters, items, locations, and plot events in JSON format.

Output ONLY valid JSON, no other text:
{
  "characters": [{"name":"name","role":"role/occupation","personality":"personality traits","relationships":"relationships with others","scenes":"key scenes"}],
  "items": [{"name":"item name","description":"description","owner":"who owns it","usage":"purpose"}],
  "locations": [{"name":"location name","description":"description","appearsIn":"when it appears"}],
  "events": [{"title":"event title","cause":"cause","process":"process","result":"result","characters":"related characters"}]
}

Novel text:
${truncated}`;
}

module.exports = uploadRoutes;
