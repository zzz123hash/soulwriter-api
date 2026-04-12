const path = require('path');
const fs = require('fs');

async function eventsRoutes(fastify, options) {
  const db = options?.db;

  // ========== Events CRUD ==========

  // List events for a book
  fastify.get('/api/events', async (req, reply) => {
    const { bookId, arc, isKeyEvent } = req.query;
    if (!bookId) return { success: false, message: 'bookId required' };
    let sql = 'SELECT * FROM events WHERE bookId = ?';
    const params = [bookId];
    if (arc) { sql += ' AND arc = ?'; params.push(arc); }
    if (isKeyEvent !== undefined) { sql += ' AND isKeyEvent = ?'; params.push(isKeyEvent ? 1 : 0); }
    sql += ' ORDER BY timestamp ASC';
    const events = db ? db.prepare(sql).all(...params) : [];
    return { success: true, data: events };
  });

  // Create event
  fastify.post('/api/events', async (req, reply) => {
    if (!db) return reply.status(500).send({ success: false, message: 'DB not available' });
    const { bookId, title, cause, process, result, arc, characters, locations, items, chapter, timestamp, isKeyEvent, tension, status } = req.body;
    if (!bookId || !title) return { success: false, message: 'bookId and title required' };

    const id = 'ev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const stmt = db.prepare(`
      INSERT INTO events (id, bookId, title, cause, process, result, arc, characters, locations, items, chapter, timestamp, isKeyEvent, tension, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    stmt.run(id, bookId, title, cause || '', process || '', result || '', arc || '主线', 
             JSON.stringify(characters || []), JSON.stringify(locations || []), JSON.stringify(items || []),
             chapter || '', timestamp || 0, isKeyEvent ? 1 : 0, tension || 50, status || 'open');
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    return { success: true, data: event };
  });

  // Update event
  fastify.put('/api/events/:id', async (req, reply) => {
    if (!db) return reply.status(500).send({ success: false, message: 'DB not available' });
    const { title, cause, process, result, arc, characters, locations, items, chapter, timestamp, isKeyEvent, tension, status } = req.body;
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!event) return reply.status(404).send({ success: false, message: 'Event not found' });

    db.prepare(`
      UPDATE events SET title=COALESCE(?,title), cause=COALESCE(?,cause), process=COALESCE(?,process),
      result=COALESCE(?,result), arc=COALESCE(?,arc), characters=COALESCE(?,characters),
      locations=COALESCE(?,locations), items=COALESCE(?,items), chapter=COALESCE(?,chapter),
      timestamp=COALESCE(?,timestamp), isKeyEvent=COALESCE(?,isKeyEvent), tension=COALESCE(?,tension),
      status=COALESCE(?,status), updatedAt=datetime('now') WHERE id=?
    `).run(title, cause, process, result, arc,
           characters ? JSON.stringify(characters) : null,
           locations ? JSON.stringify(locations) : null,
           items ? JSON.stringify(items) : null,
           chapter, timestamp, isKeyEvent !== undefined ? (isKeyEvent ? 1 : 0) : null,
           tension, status, req.params.id);
    const updated = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    return { success: true, data: updated };
  });

  // Delete event
  fastify.delete('/api/events/:id', async (req, reply) => {
    if (!db) return reply.status(500).send({ success: false, message: 'DB not available' });
    db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
    return { success: true };
  });

  // ========== AI Extract Events from Text ==========
  fastify.post('/api/events/ai-extract', async (req, reply) => {
    if (!db) return reply.status(500).send({ success: false, message: 'DB not available' });
    const { text, bookId } = req.body;
    if (!text || !bookId) return { success: false, message: 'text and bookId required' };

    const aiConfig = db.prepare('SELECT * FROM ai_config LIMIT 1').get() || {};
    const prompt = buildEventExtractPrompt(text);
    let content = '';

    try {
      if (aiConfig.type === 'local' || !aiConfig.apiKey) {
        const port = Number(aiConfig.localPort || 42897);
        const modelId = String(aiConfig.localModel || 'qwen-1.5b');
        const res = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: modelId, messages: [{ role: 'user', content: prompt }], temperature: 0.5 })
        });
        if (!res.ok) throw new Error('Local AI error: ' + res.status);
        const data = await res.json();
        content = data?.choices?.[0]?.message?.content || '';
      } else {
        const baseUrl = String(aiConfig.baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '');
        const headers = { 'Content-Type': 'application/json' };
        if (aiConfig.apiKey) headers.Authorization = `Bearer ${aiConfig.apiKey}`;
        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST', headers,
          body: JSON.stringify({
            model: aiConfig.model || 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.5, max_tokens: 4000
          })
        });
        if (!res.ok) throw new Error('Cloud AI error: ' + res.status);
        const data = await res.json();
        content = data?.choices?.[0]?.message?.content || '';
      }
    } catch (e) {
      return { success: false, message: e.message };
    }

    let events;
    try {
      events = JSON.parse(content);
    } catch (e) {
      const match = content.match(/\[.*\]/s) || content.match(/\{[\s\S]*\}/);
      if (match) events = JSON.parse(match[0]);
      else return { success: false, message: 'Failed to parse AI response' };
    }
    if (!Array.isArray(events)) events = [events];

    // Save events
    const saved = [];
    for (const ev of events) {
      const id = 'ev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      db.prepare(`
        INSERT INTO events (id, bookId, title, cause, process, result, arc, characters, locations, items, chapter, timestamp, isKeyEvent, tension, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(id, bookId, ev.title || '未命名事件', ev.cause || '', ev.process || '', ev.result || '',
             ev.arc || '主线', JSON.stringify(ev.characters || []), JSON.stringify(ev.locations || []),
             JSON.stringify(ev.items || []), ev.chapter || '', ev.timestamp || 0,
             ev.isKeyEvent ? 1 : 0, ev.tension || 50, ev.status || 'open');
      saved.push(db.prepare('SELECT * FROM events WHERE id = ?').get(id));
    }

    return { success: true, data: saved };
  });

  // ========== Timeline View ==========
  fastify.get('/api/events/timeline/:bookId', async (req, reply) => {
    if (!db) return reply.status(500).send({ success: false, message: 'DB not available' });
    const events = db.prepare('SELECT * FROM events WHERE bookId = ? ORDER BY timestamp ASC').all(req.params.bookId);
    // Group by arc
    const arcs = {};
    events.forEach(ev => {
      const arc = ev.arc || '主线';
      if (!arcs[arc]) arcs[arc] = [];
      arcs[arc].push(ev);
    });
    return { success: true, data: { events, arcs } };
  });
}

function buildEventExtractPrompt(text) {
  const truncated = text.length > 30000 ? text.substring(0, 30000) + '...(truncated)' : text;
  return `You are a plot event extraction expert. Analyze the following novel text and extract ALL significant plot events.

For each event, extract:
- title: Short descriptive title (within 20 characters)
- cause: What triggered this event
- process: What happened during the event
- result: Outcome of the event
- arc: Which story arc it belongs to (主线/支线/暗线/感情线/成长线) - infer from context
- characters: Array of character names involved
- locations: Array of location names where it happens
- chapter: Chapter number or position (if mentioned)
- timestamp: Numeric position in story (1, 2, 3...)
- isKeyEvent: true if this is a major turning point, false otherwise
- tension: Tension level 0-100 (major conflict = high)
- status: "open" if unresolved, "closed" if resolved

Return a JSON ARRAY of events. Output ONLY the JSON array, no other text.

Events:
${truncated}`;
}

module.exports = eventsRoutes;
