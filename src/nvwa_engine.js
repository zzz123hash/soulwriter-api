/**
 * 绘梦 - 女娲推演引擎 (Nvwa Simulator)
 * 
 * 基于旧版 SoulWriter 的 Nvwa/Core/Engine.js 移植
 * 支持角色量子纠缠、属性K线、世界变量
 */

const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

// 默认属性配置
const DEFAULT_ATTRS = {
  health: 100,
  sanity: 100,
  wealth: 50,
  combat: 50,
  luck: 50,
  fortune: 50,
  charm: 50,
  intelligence: 50,
  vitality: 100
};

// 初始化数据库
function initNvwaDB(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS nvwa_souls (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      attributes TEXT DEFAULT '{}',
      klines TEXT DEFAULT '[]',
      relationships TEXT DEFAULT '[]',
      metadata TEXT DEFAULT '{}',
      status TEXT DEFAULT 'active',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS nvwa_world_vars (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value REAL DEFAULT 0,
      reason TEXT DEFAULT '',
      source TEXT DEFAULT 'ai',
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS nvwa_logs (
      id TEXT PRIMARY KEY,
      type TEXT DEFAULT 'system',
      content TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS nvwa_events (
      id TEXT PRIMARY KEY,
      content TEXT,
      speaker TEXT DEFAULT '旁白',
      changes TEXT DEFAULT '[]',
      newEntities TEXT DEFAULT '[]',
      sceneCompleted INTEGER DEFAULT 0,
      suggestedActions TEXT DEFAULT '[]',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // 确保默认世界变量存在
  const defaultVars = ['tension', 'chaos', 'progress'];
  const stmt = db.prepare('INSERT OR IGNORE INTO nvwa_world_vars (id, key, value) VALUES (?, ?, ?)');
  defaultVars.forEach((v, i) => stmt.run(crypto.randomUUID(), v, 50));
}

// ============ 工具函数 ============

function extractJsonObject(text) {
  if (typeof text !== 'string') return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch (e) {}
  try {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch (e) {
    return null;
  }
}

function sanitizeAttrKey(key) {
  const raw = String(key || '').trim();
  if (!raw) return null;
  const compact = raw.replace(/\s+/g, '_').slice(0, 40);
  const unsafe = ['__proto__', 'prototype', 'constructor'];
  if (unsafe.includes(compact.toLowerCase())) return null;
  return compact;
}

function normalizeName(name) {
  return String(name || '').trim().toLowerCase().replace(/\s+/g, '');
}

function resolveCharacterId(target, characters = []) {
  const raw = String(target || '').trim();
  if (!raw) return null;
  
  // 精确匹配
  const exact = characters.find(c => c.id === raw);
  if (exact?.id) return exact.id;
  
  const nTarget = normalizeName(raw);
  if (!nTarget) return null;
  
  // 按名称精确匹配
  const byExactName = characters.find(c => normalizeName(c.name) === nTarget);
  if (byExactName?.id) return byExactName.id;
  
  // 按包含关系匹配
  const byIncludes = characters.find(c => {
    const cName = normalizeName(c.name);
    return cName.includes(nTarget) || nTarget.includes(cName);
  });
  return byIncludes?.id || null;
}

// ============ Prompt构建 ============

function buildNvwaSimPrompt(a, b, tensionCue = '') {
  const aDesc = a?.metadata?.biography || a?.summary || '';
  const bDesc = b?.metadata?.biography || b?.summary || '';
  
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

function buildStagePrompt(config = {}) {
  const {
    scenarioRule = '',
    activeLocation = null,
    worldVariables = {},
    stageCharacters = [],
    directorCommand = '',
    systemPrompt = '',
    worldLaws = {},
    tension = 50,
    relevantMemories = '',
    ideaPool = []
  } = config;
  
  const charContext = stageCharacters.map(c =>
    `- ${c.name} (${c.role || '未知职业'}): ${c.desc || '无详细设定'}`
  ).join('\n');
  
  let pacingRule = '';
  if (tension <= 30) {
    pacingRule = '【叙事节奏：极缓（低张力）】请使用长句，着重描写环境的光影、角色的细微动作。';
  } else if (tension >= 70) {
    pacingRule = '【叙事节奏：极快（高张力）】禁止冗长的景物描写！使用极短、急促的句子。';
  } else {
    pacingRule = '【叙事节奏：正常（中张力）】保持动作与对白的平衡推演。';
  }
  
  const lawsSection = worldLaws?.theme || worldLaws?.taboos
    ? `【最高世界法则】\n核心立意：${worldLaws.theme || '无'}\n绝对禁忌：${worldLaws.taboos || '无'}\n`
    : '';
  
  const basePrompt = `${lawsSection}
你是沙盘推演引擎（Plot/Logic Sandbox）。你负责推进剧情与状态。
【在场角色】：
${charContext}

${pacingRule}

【任务】：推演"下一秒"发生的剧情，每次只能推进【一个核心节拍】。
文本必须极度精简（50-150字），采用剧本式的干练文风。

【输出格式】
Part 1：[剧情正文] 开头写故事正文
Part 2：[系统变更] 接着输出严格 JSON：
{"changes":[...],"new_entities":[...],"is_scene_completed":false,"suggested_actions":[...]}

- changes: 属性变更 [{"target":"角色ID","attr":"属性名","delta":数字,"reason":"原因"}]
- suggested_actions: 3条短句动作建议
`;
  
  return basePrompt;
}

// ============ 核心推演函数 ============

async function runNvwaTick(db, aiConfig, options = {}) {
  const { enableIntentEngine = true } = options;
  
  // 获取所有活跃角色
  const characters = db.prepare(
    "SELECT * FROM nvwa_souls WHERE status = 'active'"
  ).all().map(c => ({
    ...c,
    attributes: JSON.parse(c.attributes || '{}')
  }));
  
  if (characters.length < 2) {
    return { success: false, error: '需要至少2个角色才能推演' };
  }
  
  // 选择角色对
  let a, b, tensionCue = '', rawScore = 0;
  
  if (enableIntentEngine) {
    // 智能选择：计算张力焦点
    const focus = calculateTensionFocus(characters);
    if (focus) {
      a = focus.focusA;
      b = focus.focusB;
      rawScore = focus.maxScore;
      tensionCue = focus.tensionReason;
    }
  }
  
  if (!a || !b) {
    // 随机选择
    const idx = Math.floor(Math.random() * characters.length);
    a = characters[idx];
    b = characters.filter(c => c.id !== a.id)[0] || characters[(idx + 1) % characters.length];
  }
  
  // 添加推演日志
  const logId = crypto.randomUUID();
  db.prepare('INSERT INTO nvwa_logs (id, type, content) VALUES (?, ?, ?)')
    .run(logId, 'system', `[SYS] 正在推演 ${a.name} 与 ${b.name} 的量子纠缠...`);
  
  // 构建Prompt并调用AI
  const prompt = buildNvwaSimPrompt(a, b, tensionCue);
  
  try {
    let result;
    if (aiConfig.type === 'local') {
      result = await askLocalEngine(prompt, aiConfig);
    } else {
      result = await askCloudEngine(prompt, aiConfig);
    }
    
    if (!result) {
      throw new Error('AI返回为空');
    }
    
    // 解析结果
    const parsed = extractJsonObject(result);
    
    // 记录事件
    const eventId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO nvwa_events (id, content, speaker, changes, sceneCompleted, suggestedActions)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      eventId,
      parsed?.content || result,
      parsed?.speaker || '旁白',
      JSON.stringify(parsed?.changes || []),
      parsed?.is_scene_completed ? 1 : 0,
      JSON.stringify(parsed?.suggested_actions || [])
    );
    
    // 应用属性变更
    const changes = parsed?.changes || [];
    for (const chg of changes) {
      const attr = sanitizeAttrKey(chg?.attr);
      if (!attr) continue;
      
      const delta = Number(chg?.delta);
      if (!Number.isFinite(delta)) continue;
      
      const targetRaw = String(chg?.target || '').trim().toLowerCase();
      
      if (targetRaw === 'world') {
        // 世界变量变更
        const worldVar = db.prepare('SELECT * FROM nvwa_world_vars WHERE key = ?').get(attr);
        if (worldVar) {
          const newValue = Math.max(0, Math.min(100, worldVar.value + delta));
          db.prepare('UPDATE nvwa_world_vars SET value = ?, reason = ?, updatedAt = CURRENT_TIMESTAMP WHERE key = ?')
            .run(newValue, chg?.reason || '', attr);
        }
      } else {
        // 角色属性变更
        const targetId = resolveCharacterId(chg?.target, characters);
        if (!targetId) continue;
        
        const char = characters.find(c => c.id === targetId);
        if (!char) continue;
        
        const attrs = typeof char.attributes === 'string' ? JSON.parse(char.attributes) : char.attributes;
        const baseValue = Number.isFinite(attrs[attr]) ? attrs[attr] : (DEFAULT_ATTRS[attr] || 50);
        const newValue = Math.max(0, Math.min(100, baseValue + delta));
        
        attrs[attr] = newValue;
        db.prepare('UPDATE nvwa_souls SET attributes = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
          .run(JSON.stringify(attrs), targetId);
        
        // 记录K线
        db.prepare('INSERT INTO nvwa_souls_klines (id, soulId, attributes, createdAt) VALUES (?, ?, ?, ?)')
          .run(crypto.randomUUID(), targetId, JSON.stringify(attrs), new Date().toISOString());
      }
    }
    
    return {
      success: true,
      event: {
        content: parsed?.content || result,
        speaker: parsed?.speaker || '旁白',
        changes: changes.length,
        sceneCompleted: parsed?.is_scene_completed || false
      },
      tension: rawScore
    };
    
  } catch (error) {
    db.prepare('INSERT INTO nvwa_logs (id, type, content) VALUES (?, ?, ?)')
      .run(crypto.randomUUID(), 'warning', `[ERR] 推演失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// ============ AI调用 ============

async function askCloudEngine(prompt, config = {}) {
  const baseUrl = String(config.baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '');
  const url = `${baseUrl}/chat/completions`;
  const model = String(config.model || 'gpt-4o');
  const apiKey = String(config.apiKey || '');
  
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey && apiKey.trim()) headers.Authorization = `Bearer ${apiKey}`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  });
  
  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Cloud AI error: ${res.status} ${errorText}`);
  }
  
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}

async function askLocalEngine(prompt, config = {}) {
  const port = Number(config.localPort || 42897);
  const modelId = String(config.localModel || 'qwen-1.5b');
  const url = `http://127.0.0.1:${port}/v1/chat/completions`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  });
  
  if (!res.ok) throw new Error('Local engine error');
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}

// ============ 张力计算 ============

function calculateTensionFocus(characters) {
  if (characters.length < 2) return null;
  
  let bestPair = null;
  let maxScore = -1;
  let bestReason = '';
  
  for (let i = 0; i < characters.length; i++) {
    for (let j = i + 1; j < characters.length; j++) {
      const a = characters[i];
      const b = characters[j];
      
      let score = 10 + Math.random() * 5;
      
      // 关系评分
      const relScore = getRelationshipAbs(a, b);
      score += relScore;
      
      // 属性极端评分
      const extremeA = hasExtremeStats(a);
      const extremeB = hasExtremeStats(b);
      score += (extremeA ? 30 : 0) + (extremeB ? 30 : 0);
      
      if (score > maxScore) {
        const reasons = [];
        if (relScore > 0) reasons.push('羁绊极值');
        if (extremeA || extremeB) reasons.push('属性临界');
        
        maxScore = score;
        bestPair = { focusA: a, focusB: b };
        bestReason = reasons.join(' / ') || '综合张力最高';
      }
    }
  }
  
  return bestPair ? { ...bestPair, maxScore, tensionReason: bestReason } : null;
}

function getRelationshipAbs(a, b) {
  try {
    const rels = typeof a.relationships === 'string' ? JSON.parse(a.relationships) : (a.relationships || []);
    const rel = rels.find(r => String(r?.targetId || '') === String(b?.id || ''));
    const value = Number(rel?.value || 0);
    return Number.isFinite(value) ? Math.abs(value) : 0;
  } catch (e) {
    return 0;
  }
}

function hasExtremeStats(c) {
  const attrs = c?.attributes || {};
  return Object.values(attrs).some(v => {
    const n = Number(v);
    return Number.isFinite(n) && (n < 20 || n > 80);
  });
}

module.exports = {
  initNvwaDB,
  runNvwaTick,
  buildNvwaSimPrompt,
  buildStagePrompt,
  calculateTensionFocus,
  DEFAULT_ATTRS
};
