/**
 * 推演前钩子 - before_tick.js
 * 
 * 在女娲推演前执行的前置处理
 */

/**
 * 推演前钩子列表
 */
const hooks = [
  /**
   * 1. 刷新世界变量
   */
  async function refreshWorldVars(context) {
    const { db } = context;
    try {
      const vars = db.prepare("SELECT * FROM nvwa_world_vars").all();
      context.worldVars = vars.reduce((acc, v) => {
        acc[v.key] = v.value;
        return acc;
      }, {});
    } catch (e) {
      context.worldVars = { tension: 50, chaos: 50, progress: 50 };
    }
  },

  /**
   * 2. 刷新角色状态
   */
  async function refreshCharacterStatuses(context) {
    const { db } = context;
    try {
      const chars = db.prepare(
        "SELECT * FROM nvwa_souls WHERE status = 'active'"
      ).all().map(c => ({
        ...c,
        attributes: JSON.parse(c.attributes || '{}'),
        relationships: JSON.parse(c.relationships || '[]'),
        memories: JSON.parse(c.memories || '[]')
      }));
      context.characters = chars;
    } catch (e) {
      context.characters = [];
    }
  },

  /**
   * 3. 刷新张力
   */
  async function refreshTension(context) {
    const { tensionController, worldVars, characters } = context;
    if (tensionController) {
      const result = tensionController.calculate(worldVars, characters);
      context.currentTension = result.tension;
      context.tensionReason = result.reason;
    }
  },

  /**
   * 4. 检查彩蛋触发
   */
  async function checkBonusTriggers(context) {
    const { activeParamsSystem, characters } = context;
    if (!activeParamsSystem) return;
    
    const bonuses = [];
    for (const char of characters) {
      const bonus = activeParamsSystem.checkAndTriggerBonus(char.attributes);
      bonuses.push(...bonus.map(b => ({
        charId: char.id,
        charName: char.name,
        ...b
      })));
    }
    
    context.bonusTriggers = bonuses;
  },

  /**
   * 5. 记录推演开始
   */
  async function logTickStart(context) {
    const { db, characters } = context;
    const charNames = characters.map(c => c.name).join(', ');
    try {
      db.prepare(`
        INSERT INTO nvwa_logs (id, type, content, createdAt)
        VALUES (?, ?, ?, ?)
      `).run(
        'log_' + Date.now(),
        'system',
        `[开始推演] 角色: ${charNames}`,
        new Date().toISOString()
      );
    } catch (e) {}
  }
];

/**
 * 执行所有 before_tick 钩子
 */
async function runBeforeTickHooks(context) {
  for (const hook of hooks) {
    try {
      await hook(context);
    } catch (e) {
      console.error('before_tick hook error:', e);
    }
  }
  return context;
}

module.exports = { hooks, runBeforeTickHooks };
