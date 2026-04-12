/**
 * 推演后钩子 - after_tick.js
 * 
 * 在女娲推演后执行的后置处理
 */

const crypto = require('crypto');

/**
 * 推演后钩子列表
 */
const hooks = [
  /**
   * 1. 记录K线
   */
  async function recordKlines(context) {
    const { db, klineRecorder, characters } = context;
    if (!klineRecorder) return;
    
    for (const char of characters) {
      klineRecorder.record(db, char.id, char.attributes, '推演后快照');
    }
  },

  /**
   * 2. 添加记忆
   */
  async function addMemory(context) {
    const { db, memorySystem, event, characters } = context;
    if (!memorySystem || !event?.content) return;
    
    for (const char of characters) {
      const memoryEntry = {
        content: `${char.name}: ${event.content}`,
        importance: event.temperature > 0.7 ? 7 : 4,
        emotions: [],
        relatedChars: characters.filter(c => c.id !== char.id).map(c => c.id)
      };
      
      memorySystem.addMemory(char.memories || { buffer: [], core: [], recall: [], archival: [] }, memoryEntry);
    }
  },

  /**
   * 3. 应用属性变更
   */
  async function applyChanges(context) {
    const { db, event, characters, activeParamsSystem } = context;
    if (!event?.changes) return;
    
    for (const change of event.changes) {
      if (!activeParamsSystem) continue;
      
      if (change.target === 'world' || change.target === 'world_vars') {
        // 世界变量变更
        db.prepare("UPDATE nvwa_world_vars SET value = value + ? WHERE `key` = ?")
          .run(change.delta, change.attr);
      } else {
        // 角色属性变更
        const char = characters.find(c => 
          c.id === change.target || 
          c.name === change.target
        );
        if (char) {
          activeParamsSystem.updateParam(
            char.attributes,
            change.attr,
            change.delta,
            change.reason || '推演变更'
          );
          
          // 写回数据库
          db.prepare("UPDATE nvwa_souls SET attributes = ? WHERE id = ?")
            .run(JSON.stringify(char.attributes), char.id);
        }
      }
    }
  },

  /**
   * 4. 更新张力
   */
  async function updateTension(context) {
    const { db, event, tensionController } = context;
    if (!tensionController) return;
    
    // 根据事件热度调整张力
    if (event.temperature > 0.7) {
      tensionController.updateWorldVars(db, 5); // 增加张力
    } else if (event.temperature < 0.3) {
      tensionController.updateWorldVars(db, -3); // 降低张力
    }
  },

  /**
   * 5. 记录推演完成
   */
  async function logTickComplete(context) {
    const { db, event, characters } = context;
    const charNames = characters.map(c => c.name).join(', ');
    try {
      db.prepare(`
        INSERT INTO nvwa_logs (id, type, content, createdAt)
        VALUES (?, ?, ?, ?)
      `).run(
        crypto.randomUUID(),
        'system',
        `[完成推演] ${charNames}: ${(event.content || '').substring(0, 50)}...`,
        new Date().toISOString()
      );
    } catch (e) {}
  }
];

/**
 * 执行所有 after_tick 钩子
 */
async function runAfterTickHooks(context) {
  for (const hook of hooks) {
    try {
      await hook(context);
    } catch (e) {
      console.error('after_tick hook error:', e);
    }
  }
  return context;
}

module.exports = { hooks, runAfterTickHooks };
