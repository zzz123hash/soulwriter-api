/**
 * 分层记忆系统 - Memory Layers System
 * 
 * 参考 Letta/MemGPT 的三层记忆架构
 * 文档：v1.2 第 3.4 节
 * 
 * 层级：
 * 1. Buffer - 消息缓冲区（最近 N 条）
 * 2. Core - 核心记忆（人格、背景、目标、禁忌）
 * 3. Recall - 召回记忆（近期重要记忆索引）
 * 4. Archival - 归档记忆（完整历史，向量检索）
 */

class MemoryLayersSystem {
  constructor(options = {}) {
    this.maxBufferSize = options.maxBufferSize || 100;        // Buffer 最大条数
    this.maxCoreSize = options.maxCoreSize || 20;             // Core 最大条数
    this.maxRecallSize = options.maxRecallSize || 50;         // Recall 最大条数
    this.evictRatio = options.evictRatio || 0.7;             // 淘汰比例 70%
    this.importanceThreshold = options.importanceThreshold || 5; // 重要性阈值
  }

  /**
   * 初始化角色记忆
   */
  initMemory(soulData = {}) {
    return {
      buffer: [],       // 消息缓冲区
      core: [],         // 核心记忆
      recall: [],       // 召回索引
      archival: [],     // 归档（完整历史）
      summary: ''       // 当前摘要
    };
  }

  /**
   * 添加记忆
   */
  addMemory(memory, entry) {
    const { content, importance = 5, emotions = [], relatedChars = [] } = entry;
    
    const memoryEntry = {
      id: this.genId(),
      content,
      timestamp: Date.now(),
      importance,
      emotions,
      relatedChars,
      status: 'buffer'  // 默认在 buffer
    };
    
    memory.buffer.push(memoryEntry);
    
    // 触发淘汰检查
    if (memory.buffer.length > this.maxBufferSize) {
      this.evictAndSummarize(memory);
    }
    
    return memoryEntry;
  }

  /**
   * 智能淘汰 + 摘要
   * 当 buffer 满时，淘汰部分消息但保证连续性
   */
  evictAndSummarize(memory) {
    if (memory.buffer.length === 0) return;
    
    // 识别重要消息（高权重）
    const important = memory.buffer.filter(m => 
      m.importance > this.importanceThreshold ||
      Math.abs(m.delta) > 5 ||           // 属性变化大
      m.relatedChars?.length > 0         // 涉及其他角色
    );
    
    // 保留最近 70% 消息
    const keepCount = Math.floor(memory.buffer.length * this.evictRatio);
    const recent = memory.buffer.slice(-keepCount);
    
    // 被淘汰的消息
    const evicted = memory.buffer.slice(0, -keepCount);
    
    if (evicted.length > 0 && recent.length > 0) {
      // 生成摘要
      const summary = this.summarize(evicted);
      
      // 加入 recall
      memory.recall.unshift({
        id: this.genId(),
        type: 'summary',
        content: summary,
        timestamp: Date.now(),
        sourceCount: evicted.length,
        relatedChars: this.mergeRelatedChars(evicted)
      });
      
      // 裁剪 recall 防止无限增长
      if (memory.recall.length > this.maxRecallSize) {
        memory.recall = memory.recall.slice(0, this.maxRecallSize);
      }
      
      // 加入 archival（完整历史）
      for (const e of evicted) {
        e.status = 'archival';
        memory.archival.push(e);
      }
    }
    
    memory.buffer = recent;
  }

  /**
   * 压缩旧记忆为摘要
   */
  summarize(memories) {
    if (!memories || memories.length === 0) return '';
    
    const timeSpan = this.formatTimeSpan(
      memories[0].timestamp,
      memories[memories.length - 1].timestamp
    );
    
    const keyEvents = memories
      .filter(m => m.importance >= 5)
      .map(m => m.content.substring(0, 50))
      .join('；');
    
    return `[${timeSpan}] 发生${memories.length}件事。重要事件：${keyEvents || '无'}`;
  }

  /**
   * 格式化时间跨度
   */
  formatTimeSpan(start, end) {
    const diff = end - start;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}天`;
    if (hours > 0) return `${hours}小时`;
    if (minutes > 0) return `${minutes}分钟`;
    return '刚';
  }

  /**
   * 合并相关角色列表
   */
  mergeRelatedChars(memories) {
    const charMap = new Map();
    for (const m of memories) {
      for (const c of (m.relatedChars || [])) {
        charMap.set(c, (charMap.get(c) || 0) + 1);
      }
    }
    return Array.from(charMap.keys());
  }

  /**
   * 构建核心记忆
   * 用于角色 prompt 的固定部分
   */
  buildCoreMemory(soulData = {}) {
    const sections = [];
    
    // 人格
    if (soulData.personality) {
      sections.push(`【人格】${soulData.personality}`);
    }
    
    // 背景
    if (soulData.background) {
      sections.push(`【背景】${soulData.background}`);
    }
    
    // 目标
    if (soulData.goals?.length > 0) {
      sections.push(`【目标】${soulData.goals.join('；')}`);
    }
    
    // 禁忌
    if (soulData.fears?.length > 0) {
      sections.push(`【禁忌】${soulData.fears.join('；')}`);
    }
    
    // 核心价值观
    if (soulData.soul?.core) {
      sections.push(`【灵魂核心】${soulData.soul.core}`);
    }
    
    return sections.join('\n');
  }

  /**
   * 获取召回记忆（懒加载，按需检索）
   */
  retrieve(memory, query, limit = 5) {
    const results = [];
    
    // 搜索 recall
    for (const entry of memory.recall) {
      if (entry.content.includes(query) || entry.type === 'summary') {
        results.push(entry);
      }
      if (results.length >= limit) break;
    }
    
    // 搜索 archival（更耗性能）
    if (results.length < limit) {
      for (const entry of memory.archival.slice(-100)) {
        if (entry.content.includes(query)) {
          results.push(entry);
        }
        if (results.length >= limit) break;
      }
    }
    
    return results;
  }

  /**
   * 构建完整上下文（用于 AI Prompt）
   * 按 token 预算压缩
   */
  buildContext(memory, soulData = {}, options = {}) {
    const { maxTokens = 4000 } = options;
    
    // 1. 核心记忆（固定位置，可控大小）
    let context = this.buildCoreMemory(soulData);
    
    // 2. 当前状态摘要
    if (soulData.status) {
      context += `\n【当前状态】${JSON.stringify(soulData.status)}`;
    }
    
    // 3. 近期记忆（buffer，保留全部）
    if (memory.buffer.length > 0) {
      context += `\n【近期记忆】`;
      for (const m of memory.buffer.slice(-20)) {
        context += `\n- ${m.content}`;
      }
    }
    
    // 4. 召回记忆（懒加载，只取相关）
    if (memory.recall.length > 0) {
      context += `\n【历史摘要】`;
      for (const m of memory.recall.slice(0, 5)) {
        context += `\n- ${m.content}`;
      }
    }
    
    return context;
  }

  /**
   * 生成 ID
   */
  genId() {
    return 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  }

  /**
   * 更新核心记忆（可编辑）
   */
  updateCoreMemory(memory, section, content) {
    const index = memory.core.findIndex(m => m.section === section);
    
    if (index >= 0) {
      memory.core[index].content = content;
      memory.core[index].updatedAt = Date.now();
    } else {
      memory.core.push({
        id: this.genId(),
        section,
        content,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
  }

  /**
   * 滑动窗口：只保留近期 N 条详细记忆
   */
  pruneOldMemories(memory, keepRecent = 50) {
    // 保留 buffer 中的最新 N 条
    if (memory.buffer.length > keepRecent) {
      const toArchive = memory.buffer.slice(0, -keepRecent);
      for (const m of toArchive) {
        m.status = 'archival';
        memory.archival.push(m);
      }
      memory.buffer = memory.buffer.slice(-keepRecent);
    }
    
    // 裁剪 recall
    if (memory.recall.length > this.maxRecallSize) {
      memory.recall = memory.recall.slice(0, this.maxRecallSize);
    }
  }

  /**
   * 获取记忆统计
   */
  getStats(memory) {
    return {
      bufferCount: memory.buffer.length,
      coreCount: memory.core.length,
      recallCount: memory.recall.length,
      archivalCount: memory.archival.length,
      totalMemories: memory.buffer.length + memory.core.length + 
                     memory.recall.length + memory.archival.length
    };
  }
}

module.exports = new MemoryLayersSystem();
