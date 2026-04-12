/**
 * Works 存储管理器
 * 
 * 临时工作目录读写
 * 每个书本一个目录，JSON 分文件存储
 * 
 * 目录结构：
 * works/{bookId}/
 *   ├── meta.json          # 书本元信息
 *   ├── chapters/          # 章节
 *   │   └── {chapterId}.json
 *   ├── characters/        # 角色
 *   │   └── {charId}.json
 *   ├── items/            # 物品
 *   ├── locations/         # 地点
 *   ├── genesis/          # 创世树
 *   │   ├── seeds.json
 *   │   └── nodes/
 *   └── nvwa/             # 女娲系统
 *       ├── souls/
 *       ├── memories/
 *       ├── events/
 *       └── klines/
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Works 根目录
const WORKS_DIR = path.join(__dirname, '../../works');

class WorksStorage {
  constructor() {
    this.ensureDir(WORKS_DIR);
  }

  /**
   * 确保目录存在
   */
  ensureDir(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * 生成 ID
   */
  genId(prefix = '') {
    return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  /**
   * 获取书本目录
   */
  getBookDir(bookId) {
    return path.join(WORKS_DIR, bookId);
  }

  // ========== 书本操作 ==========

  /**
   * 创建新书本目录
   */
  createBook(bookId, meta = {}) {
    const bookDir = this.getBookDir(bookId);
    this.ensureDir(bookDir);
    
    // meta.json
    fs.writeFileSync(
      path.join(bookDir, 'meta.json'),
      JSON.stringify({
        id: bookId,
        title: meta.title || '未命名',
        author: meta.author || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...meta
      }, null, 2)
    );
    
    // 创建子目录
    const subDirs = [
      'chapters', 'characters', 'items', 'locations',
      'genesis/nodes', 'nvwa/souls', 'nvwa/memories/buffer',
      'nvwa/memories/core', 'nvwa/memories/recall', 'nvwa/memories/archival',
      'nvwa/events', 'nvwa/klines'
    ];
    
    for (const subDir of subDirs) {
      this.ensureDir(path.join(bookDir, subDir));
    }
    
    return bookDir;
  }

  /**
   * 读取书本 meta
   */
  getBookMeta(bookId) {
    const metaPath = path.join(this.getBookDir(bookId), 'meta.json');
    if (!fs.existsSync(metaPath)) return null;
    return JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  }

  /**
   * 更新书本 meta
   */
  updateBookMeta(bookId, meta) {
    const current = this.getBookMeta(bookId) || {};
    const updated = { ...current, ...meta, updatedAt: new Date().toISOString() };
    const metaPath = path.join(this.getBookDir(bookId), 'meta.json');
    fs.writeFileSync(metaPath, JSON.stringify(updated, null, 2));
    return updated;
  }

  /**
   * 检查书本是否存在
   */
  bookExists(bookId) {
    return fs.existsSync(this.getBookDir(bookId));
  }

  /**
   * 删除书本目录
   */
  deleteBook(bookId) {
    const bookDir = this.getBookDir(bookId);
    if (fs.existsSync(bookDir)) {
      fs.rmSync(bookDir, { recursive: true });
    }
  }

  /**
   * 列出所有书本
   */
  listBooks() {
    if (!fs.existsSync(WORKS_DIR)) return [];
    
    const entries = fs.readdirSync(WORKS_DIR, { withFileTypes: true });
    const books = [];
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const meta = this.getBookMeta(entry.name);
        if (meta) books.push(meta);
      }
    }
    
    return books.sort((a, b) => 
      new Date(b.updatedAt) - new Date(a.updatedAt)
    );
  }

  // ========== 通用 CRUD ==========

  /**
   * 保存实体（角色/物品/地点/章节等）
   */
  save(bookId, entityType, entity) {
    const entityDir = path.join(this.getBookDir(bookId), entityType);
    this.ensureDir(entityDir);
    
    const id = entity.id || this.genId();
    const filePath = path.join(entityDir, `${id}.json`);
    
    const data = { ...entity, id, updatedAt: new Date().toISOString() };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    return data;
  }

  /**
   * 读取实体
   */
  load(bookId, entityType, entityId) {
    const filePath = path.join(this.getBookDir(bookId), entityType, `${entityId}.json`);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  /**
   * 删除实体
   */
  delete(bookId, entityType, entityId) {
    const filePath = path.join(this.getBookDir(bookId), entityType, `${entityId}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  /**
   * 列出某类型所有实体
   */
  list(bookId, entityType) {
    const entityDir = path.join(this.getBookDir(bookId), entityType);
    if (!fs.existsSync(entityDir)) return [];
    
    const files = fs.readdirSync(entityDir).filter(f => f.endsWith('.json'));
    const entities = [];
    
    for (const file of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(entityDir, file), 'utf-8'));
        entities.push(data);
      } catch (e) {}
    }
    
    return entities;
  }

  // ========== 女娲专属 ==========

  /**
   * 保存角色灵魂数据
   */
  saveSoul(bookId, soul) {
    return this.save(bookId, 'nvwa/souls', soul);
  }

  /**
   * 读取角色灵魂数据
   */
  loadSoul(bookId, soulId) {
    return this.load(bookId, 'nvwa/souls', soulId);
  }

  /**
   * 列出所有女娲角色
   */
  listSouls(bookId) {
    return this.list(bookId, 'nvwa/souls');
  }

  /**
   * 保存记忆
   */
  saveMemory(bookId, soulId, memoryType, memory) {
    const memoryDir = path.join(this.getBookDir(bookId), 'nvwa/memories', memoryType);
    this.ensureDir(memoryDir);
    
    const id = memory.id || this.genId('mem_');
    const filePath = path.join(memoryDir, `${soulId}_${id}.json`);
    
    fs.writeFileSync(filePath, JSON.stringify({ ...memory, id }, null, 2));
    return id;
  }

  /**
   * 读取记忆列表
   */
  listMemories(bookId, soulId, memoryType = 'buffer') {
    const memoryDir = path.join(this.getBookDir(bookId), 'nvwa/memories', memoryType);
    if (!fs.existsSync(memoryDir)) return [];
    
    const prefix = `${soulId}_`;
    const files = fs.readdirSync(memoryDir)
      .filter(f => f.startsWith(prefix) && f.endsWith('.json'));
    
    return files.map(f => {
      try {
        return JSON.parse(fs.readFileSync(path.join(memoryDir, f), 'utf-8'));
      } catch (e) { return null; }
    }).filter(Boolean);
  }

  /**
   * 保存 K 线
   */
  saveKline(bookId, soulId, kline) {
    const klineDir = path.join(this.getBookDir(bookId), 'nvwa/klines');
    this.ensureDir(klineDir);
    
    const id = kline.id || this.genId('kline_');
    const filePath = path.join(klineDir, `${soulId}_${id}.json`);
    
    fs.writeFileSync(filePath, JSON.stringify({ ...kline, id }, null, 2));
    return id;
  }

  /**
   * 读取 K 线
   */
  listKlines(bookId, soulId, limit = 100) {
    const klineDir = path.join(this.getBookDir(bookId), 'nvwa/klines');
    if (!fs.existsSync(klineDir)) return [];
    
    const prefix = `${soulId}_`;
    const files = fs.readdirSync(klineDir)
      .filter(f => f.startsWith(prefix) && f.endsWith('.json'))
      .sort()
      .slice(-limit);
    
    return files.map(f => {
      try {
        return JSON.parse(fs.readFileSync(path.join(klineDir, f), 'utf-8'));
      } catch (e) { return null; }
    }).filter(Boolean);
  }

  /**
   * 保存事件
   */
  saveEvent(bookId, event) {
    const eventDir = path.join(this.getBookDir(bookId), 'nvwa/events');
    this.ensureDir(eventDir);
    
    const id = event.id || this.genId('evt_');
    const filePath = path.join(eventDir, `${id}.json`);
    
    fs.writeFileSync(filePath, JSON.stringify({ ...event, id }, null, 2));
    return id;
  }

  // ========== 创世树 ==========

  /**
   * 保存种子
   */
  saveSeeds(bookId, seeds) {
    const seedsPath = path.join(this.getBookDir(bookId), 'genesis/seeds.json');
    fs.writeFileSync(seedsPath, JSON.stringify(seeds, null, 2));
  }

  /**
   * 读取种子
   */
  loadSeeds(bookId) {
    const seedsPath = path.join(this.getBookDir(bookId), 'genesis/seeds.json');
    if (!fs.existsSync(seedsPath)) return [];
    return JSON.parse(fs.readFileSync(seedsPath, 'utf-8'));
  }

  /**
   * 保存节点
   */
  saveNode(bookId, node) {
    const nodeDir = path.join(this.getBookDir(bookId), 'genesis/nodes');
    this.ensureDir(nodeDir);
    
    const id = node.id || this.genId('node_');
    const filePath = path.join(nodeDir, `${id}.json`);
    
    fs.writeFileSync(filePath, JSON.stringify({ ...node, id }, null, 2));
    return { ...node, id };
  }

  /**
   * 列出所有节点
   */
  listNodes(bookId) {
    const nodeDir = path.join(this.getBookDir(bookId), 'genesis/nodes');
    if (!fs.existsSync(nodeDir)) return [];
    
    return fs.readdirSync(nodeDir)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        try {
          return JSON.parse(fs.readFileSync(path.join(nodeDir, f), 'utf-8'));
        } catch (e) { return null; }
      })
      .filter(Boolean);
  }
}

module.exports = new WorksStorage();
