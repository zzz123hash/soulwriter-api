/**
 * NvwaEngine - 女娲推演引擎核心 (v2)
 * 
 * 整合所有模块：
 * - active_params: 激活参数系统
 * - memory_layers: 分层记忆
 * - quantum_entanglement: 量子纠缠推演
 * - tension_controller: 张力控制
 * - kline_recorder: K线记录
 * - event_parser: 事件解析
 * - token_optimizer: Token优化
 * - hooks: 推演钩子
 */

const crypto = require('crypto');

// 引入所有子模块
const activeParams = require('./active_params');
const memoryLayers = require('./memory_layers');
const quantum = require('./quantum_entanglement');
const tensionCtrl = require('./tension_controller');
const klineRecorder = require('./kline_recorder');
const eventParser = require('./event_parser');
const tokenOptimizer = require('./token_optimizer');
const promptBuilder = require('./prompt_builder');

// 钩子模块
const { runBeforeTickHooks } = require('./before_tick');
const { runAfterTickHooks } = require('./after_tick');

class NvwaEngine {
  constructor(options = {}) {
    this.db = options.db || null;
    this.config = {
      maxTokens: options.maxTokens || 2048,
      temperature: options.temperature || 0.7,
      maxMemoryBuffer: options.maxMemoryBuffer || 100,
      ...options
    };
    
    // 每个角色独立的记忆系统
    this.memorySystems = new Map();
  }

  /**
   * 初始化角色记忆
   */
  initCharacterMemory(soulId, soulData = {}) {
    const memory = memoryLayers.initMemory(soulData);
    this.memorySystems.set(soulId, memory);
    return memory;
  }

  /**
   * 获取角色记忆
   */
  getCharacterMemory(soulId) {
    if (!this.memorySystems.has(soulId)) {
      return this.initCharacterMemory(soulId);
    }
    return this.memorySystems.get(soulId);
  }

  /**
   * 运行推演 Tick
   */
  async runTick(options = {}) {
    const { enableIntentEngine = true, sceneContext = '' } = options;
    
    if (!this.db) {
      return { success: false, error: '数据库未连接' };
    }
    
    // ========== 阶段 1: 获取数据 ==========
    let characters = this.db.prepare(
      "SELECT * FROM nvwa_souls WHERE status = 'active'"
    ).all().map(c => ({
      ...c,
      attributes: typeof c.attributes === 'string' ? JSON.parse(c.attributes || '{}') : (c.attributes || {}),
      relationships: typeof c.relationships === 'string' ? JSON.parse(c.relationships || '[]') : (c.relationships || []),
      memories: this.getCharacterMemory(c.id)
    }));
    
    if (characters.length < 2) {
      return { success: false, error: '需要至少2个角色才能推演' };
    }
    
    // 世界变量
    let worldVars = this.getWorldVars();
    
    // ========== 阶段 2: 钩子 before_tick ==========
    const hookContext = {
      db: this.db,
      characters,
      worldVars,
      tensionController: tensionCtrl,
      activeParamsSystem: activeParams,
      klineRecorder,
      sceneContext
    };
    await runBeforeTickHooks(hookContext);
    characters = hookContext.characters;
    worldVars = hookContext.worldVars;
    
    // ========== 阶段 3: 选择角色对 ==========
    let focusA = null, focusB = null, tensionCue = '';
    
    if (enableIntentEngine) {
      const pair = quantum.selectPair(characters, worldVars);
      if (pair) {
        focusA = pair.charA;
        focusB = pair.charB;
        tensionCue = tensionCtrl.buildTensionCue(worldVars, [focusA, focusB]);
      }
    }
    
    // 随机 fallback
    if (!focusA || !focusB) {
      const idx = Math.floor(Math.random() * characters.length);
      focusA = characters[idx];
      focusB = characters.filter(c => c.id !== focusA.id)[0] || characters[(idx + 1) % characters.length];
    }
    
    // ========== 阶段 4: 激活相关参数 ==========
    if (sceneContext) {
      for (const char of [focusA, focusB]) {
        const result = await activeParams.analyzeAndActivate(char.attributes, sceneContext);
        char.attributes = result.activeParams;
      }
    }
    
    // ========== 阶段 5: 构建 Prompt ==========
    const prompt = promptBuilder.buildNvwaSimPrompt(focusA, focusB, tensionCue);
    
    // ========== 阶段 6: 调用 AI ==========
    let aiResult = '';
    try {
      const aiConfig = this.getAIConfig();
      if (aiConfig.type === 'local') {
        aiResult = await this.askLocal(prompt, aiConfig);
      } else {
        aiResult = await this.askCloud(prompt, aiConfig);
      }
    } catch (e) {
      return { success: false, error: `AI调用失败: ${e.message}` };
    }
    
    // ========== 阶段 7: 解析事件 ==========
    const parsed = eventParser.parse(aiResult);
    parsed.temperature = eventParser.estimateTemperature(parsed.content);
    
    // ========== 阶段 8: 应用变更 ==========
    await this.applyChanges(characters, parsed.changes || []);
    
    // ========== 阶段 9: 记录 K 线 ==========
    for (const char of characters) {
      klineRecorder.record(this.db, char.id, char.attributes, '推演快照');
    }
    
    // ========== 阶段 10: 添加记忆 ==========
    for (const char of [focusA, focusB]) {
      const memory = this.getCharacterMemory(char.id);
      memoryLayers.addMemory(memory, {
        content: `${char.name}: ${parsed.content}`,
        importance: parsed.temperature > 0.7 ? 7 : 4,
        emotions: [],
        relatedChars: [focusA.id, focusB.id].filter(id => id !== char.id)
      });
    }
    
    // ========== 阶段 11: 更新张力 ==========
    if (parsed.temperature > 0.7) {
      tensionCtrl.updateWorldVars(this.db, 5);
    } else if (parsed.temperature < 0.3) {
      tensionCtrl.updateWorldVars(this.db, -3);
    }
    
    // ========== 阶段 12: 钩子 after_tick ==========
    await runAfterTickHooks({
      ...hookContext,
      event: parsed,
      characters,
      activeParamsSystem: activeParams,
      tensionController: tensionCtrl,
      klineRecorder
    });
    
    // ========== 阶段 13: 保存回数据库 ==========
    this.saveCharacters(characters);
    
    return {
      success: true,
      event: parsed,
      characters: [focusA.id, focusB.id],
      tension: tensionCtrl.getTension(),
      worldVars: this.getWorldVars()
    };
  }

  /**
   * 获取世界变量
   */
  getWorldVars() {
    if (!this.db) return { tension: 50, chaos: 50, progress: 50 };
    
    try {
      const rows = this.db.prepare("SELECT key, value FROM nvwa_world_vars").all();
      return rows.reduce((acc, r) => { acc[r.key] = r.value; return acc; }, {});
    } catch (e) {
      return { tension: 50, chaos: 50, progress: 50 };
    }
  }

  /**
   * 获取 AI 配置
   */
  getAIConfig() {
    if (!this.db) return { type: 'cloud', baseUrl: '', model: '', apiKey: '' };
    
    try {
      return this.db.prepare("SELECT * FROM ai_config LIMIT 1").get() || {};
    } catch (e) {
      return {};
    }
  }

  /**
   * 应用属性变更
   */
  async applyChanges(characters, changes) {
    for (const change of changes) {
      if (!change.attr || !change.target) continue;
      
      if (change.target === 'world' || change.target === 'world_vars') {
        this.db.prepare("UPDATE nvwa_world_vars SET value = value + ? WHERE `key` = ?")
          .run(change.delta, change.attr);
        continue;
      }
      
      const char = characters.find(c => 
        c.id === change.target || 
        c.name === change.target
      );
      if (!char) continue;
      
      activeParams.updateParam(char.attributes, change.attr, change.delta, change.reason || '');
    }
  }

  /**
   * 保存角色数据回数据库
   */
  saveCharacters(characters) {
    for (const char of characters) {
      try {
        this.db.prepare(`
          UPDATE nvwa_souls 
          SET attributes = ?, relationships = ?, updatedAt = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(
          JSON.stringify(char.attributes),
          JSON.stringify(char.relationships || []),
          char.id
        );
      } catch (e) {
        console.error('Save character error:', e);
      }
    }
  }

  /**
   * 云端 AI 调用
   */
  async askCloud(prompt, config) {
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
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      })
    });
    
    if (!res.ok) throw new Error(`Cloud error: ${res.status}`);
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || '';
  }

  /**
   * 本地 AI 调用
   */
  async askLocal(prompt, config) {
    const port = Number(config.localPort || 42897);
    const modelId = String(config.localModel || 'qwen-1.5b');
    
    const res = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.config.temperature
      })
    });
    
    if (!res.ok) throw new Error('Local engine error');
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || '';
  }
}

module.exports = NvwaEngine;
