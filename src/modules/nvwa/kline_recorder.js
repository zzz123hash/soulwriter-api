/**
 * K线记录器 - K-Line Recorder
 * 
 * 记录角色属性随时间的变化，用于可视化成长曲线
 * 参考 v1.2 文档：人物K线 - 角色成长曲线
 */

const crypto = require('crypto');

class KLineRecorder {
  constructor() {
    this.batchBuffer = [];
    this.maxBatchSize = 10;
  }

  /**
   * 记录快照
   */
  record(db, soulId, attributes, reason = '') {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    try {
      db.prepare(`
        INSERT INTO nvwa_souls_klines 
        (id, soulId, attributes, reason, createdAt)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, soulId, JSON.stringify(attributes), reason, now);
      
      return id;
    } catch (e) {
      console.error('KLine record error:', e);
      return null;
    }
  }

  /**
   * 批量记录（缓冲）
   */
  recordBatch(db, soulId, attributes, reason = '') {
    this.batchBuffer.push({ soulId, attributes, reason });
    
    if (this.batchBuffer.length >= this.maxBatchSize) {
      this.flush(db);
    }
  }

  /**
   * 刷新缓冲区
   */
  flush(db) {
    if (this.batchBuffer.length === 0) return;
    
    const stmt = db.prepare(`
      INSERT INTO nvwa_souls_klines 
      (id, soulId, attributes, reason, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const now = new Date().toISOString();
    
    for (const item of this.batchBuffer) {
      try {
        stmt.run(
          crypto.randomUUID(),
          item.soulId,
          JSON.stringify(item.attributes),
          item.reason,
          now
        );
      } catch (e) {
        console.error('KLine flush error:', e);
      }
    }
    
    this.batchBuffer = [];
  }

  /**
   * 获取K线数据
   */
  getKlines(db, soulId, options = {}) {
    const { limit = 100, startTime = 0 } = options;
    
    try {
      const rows = db.prepare(`
        SELECT * FROM nvwa_souls_klines
        WHERE soulId = ? AND createdAt >= ?
        ORDER BY createdAt DESC
        LIMIT ?
      `).all(soulId, startTime, limit);
      
      return rows.map(row => ({
        ...row,
        attributes: JSON.parse(row.attributes || '{}')
      }));
    } catch (e) {
      console.error('Get klines error:', e);
      return [];
    }
  }

  /**
   * 计算属性趋势
   */
  calculateTrend(klines, attrKey) {
    if (klines.length < 2) {
      return { direction: 'stable', change: 0 };
    }
    
    const values = klines
      .map(k => k.attributes?.[attrKey])
      .filter(v => v !== undefined);
    
    if (values.length < 2) {
      return { direction: 'stable', change: 0 };
    }
    
    const first = values[values.length - 1];
    const last = values[0];
    const change = last - first;
    
    return {
      direction: change > 5 ? 'rising' : change < -5 ? 'declining' : 'stable',
      change,
      firstValue: first,
      lastValue: last
    };
  }

  /**
   * 构建K线摘要
   */
  buildSummary(db, soulId, limit = 20) {
    const klines = this.getKlines(db, soulId, { limit });
    
    if (klines.length === 0) {
      return { message: '暂无K线数据', trends: {} };
    }
    
    const trends = {};
    const sample = klines[0].attributes || {};
    
    for (const key of Object.keys(sample)) {
      trends[key] = this.calculateTrend(klines, key);
    }
    
    return {
      klineCount: klines.length,
      timeRange: {
        start: klines[klines.length - 1]?.createdAt,
        end: klines[0]?.createdAt
      },
      trends
    };
  }
}

module.exports = new KLineRecorder();
