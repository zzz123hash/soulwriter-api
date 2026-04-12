/**
 * 张力监控器插件 - Nvwa Tension Monitor
 * 
 * 监控女娲推演中的张力变化
 */

const hooks = {
  /**
   * 推演前：记录初始张力
   */
  async 'nvwa:before_tick'(context) {
    const { worldVars, tension } = context;
    context._initialTension = worldVars?.tension || 50;
    console.log(`[TensionMonitor] 初始张力: ${context._initialTension}`);
  },

  /**
   * 推演后：分析张力变化
   */
  async 'nvwa:after_tick'(context) {
    const { worldVars, event } = context;
    const finalTension = worldVars?.tension || 50;
    const delta = finalTension - (context._initialTension || 50);
    
    console.log(`[TensionMonitor] 最终张力: ${finalTension} (变化: ${delta > 0 ? '+' : ''}${delta})`);
    
    // 如果张力过高，输出警告
    if (finalTension > 80) {
      console.warn('[TensionMonitor] ⚠️ 张力过高，可能导致叙事失衡');
    }
    
    // 如果张力过低，输出提示
    if (finalTension < 20) {
      console.log('[TensionMonitor] 💤 张力过低，叙事节奏缓慢');
    }
    
    // 记录到事件
    if (event) {
      event.tensionDelta = delta;
      event.tensionLevel = this.categorizeTension(finalTension);
    }
  },

  /**
   * 分类张力等级
   */
  categorizeTension(tension) {
    if (tension >= 80) return 'CRITICAL';
    if (tension >= 65) return 'HIGH';
    if (tension >= 35) return 'NORMAL';
    if (tension >= 20) return 'LOW';
    return 'VERY_LOW';
  }
};

module.exports = { hooks };
