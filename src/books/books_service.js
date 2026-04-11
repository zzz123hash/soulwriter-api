/**
 * SoulWriter Books 核心服务
 * - 本地文件存储（每个书本1个.soul文件）
 * - 向量增量生成
 * - 记忆宫殿节点管理
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { SCHEMA } = require('./books_schema');

// 书本存储目录
const BOOKS_DIR = path.join(__dirname, '../../books_data');

/**
 * 确保目录存在
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 创建新书本文件
 */
function createBookFile(bookId, title = '未命名') {
  ensureDir(BOOKS_DIR);
  const dbPath = path.join(BOOKS_DIR, `${bookId}.soul`);
  const db = new Database(dbPath);
  
  // 执行schema
  db.exec(SCHEMA);
  
  // 插入初始数据
  const now = new Date().toISOString();
  db.prepare(`INSERT INTO books (id, title, createdAt, updatedAt) VALUES (?, ?, ?, ?)`)
    .run(bookId, title, now, now);
  
  db.close();
  return dbPath;
}

/**
 * 打开书本
 */
function openBook(bookId) {
  const dbPath = path.join(BOOKS_DIR, `${bookId}.soul`);
  if (!fs.existsSync(dbPath)) {
    return null;
  }
  return new Database(dbPath);
}

/**
 * 关闭书本
 */
function closeBook(db) {
  if (db) db.close();
}

/**
 * 生成UUID
 */
function uuid() {
  return 'book_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ========== 书架操作 ==========

/**
 * 创建书架
 */
function createBookshelf(data) {
  const id = data.id || uuid();
  const dbPath = path.join(BOOKS_DIR, 'index.soul');
  const db = openOrCreateIndex(dbPath);
  
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO bookshelves (id, name, description, coverUrl, parentId, position, color, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, data.name, data.description || '', data.coverUrl || '',
    data.parentId || null, data.position || 0, data.color || '#6366f1',
    now, now
  );
  
  return { id, ...data };
}

/**
 * 获取所有书架
 */
function getAllBookshelves() {
  const dbPath = path.join(BOOKS_DIR, 'index.soul');
  const db = openOrCreateIndex(dbPath);
  const shelves = db.prepare('SELECT * FROM bookshelves ORDER BY position').all();
  db.close();
  return shelves;
}

/**
 * 打开或创建索引数据库
 */
function openOrCreateIndex(dbPath) {
  ensureDir(BOOKS_DIR);
  const db = new Database(dbPath);
  db.exec(SCHEMA.replace(/CREATE TABLE IF NOT EXISTS books/gi, 'CREATE TABLE IF NOT EXISTS books (id TEXT PRIMARY KEY)'));
  return db;
}

// ========== 书本操作 ==========

/**
 * 创建新书本
 */
function createBook(data) {
  const id = data.id || uuid();
  const title = data.title || '未命名书本';
  
  // 创建书本文件
  createBookFile(id, title);
  
  // 更新索引
  const dbPath = path.join(BOOKS_DIR, 'index.soul');
  const db = openOrCreateIndex(dbPath);
  
  const now = new Date().toISOString();
  db.prepare(`
    INSERT OR REPLACE INTO books (id, title, author, description, coverUrl, bookshelfId, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, ?)
  `).run(id, title, data.author || '', data.description || '', 
         data.coverUrl || '', data.bookshelfId || null, now, now);
  
  db.close();
  
  return { id, title, ...data };
}

/**
 * 获取所有书本（索引）
 */
function getAllBooks() {
  const dbPath = path.join(BOOKS_DIR, 'index.soul');
  const db = openOrCreateIndex(dbPath);
  const books = db.prepare('SELECT * FROM books ORDER BY updatedAt DESC').all();
  db.close();
  return books;
}

/**
 * 获取单个书本
 */
function getBook(bookId) {
  const db = openBook(bookId);
  if (!db) return null;
  
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId);
  const chapters = db.prepare('SELECT * FROM chapters WHERE bookId = ? ORDER BY orderIndex').all(bookId);
  const nodes = db.prepare('SELECT * FROM palace_nodes WHERE bookId = ?').all(bookId);
  
  db.close();
  
  return { ...book, chapters, palaceNodes: nodes };
}

/**
 * 更新书本
 */
function updateBook(bookId, data) {
  const db = openBook(bookId);
  if (!db) return null;
  
  const fields = [];
  const values = [];
  
  ['title', 'author', 'description', 'coverUrl', 'status', 'tags', 'bookshelfId'].forEach(field => {
    if (data[field] !== undefined) {
      fields.push(`${field} = ?`);
      values.push(field === 'tags' ? JSON.stringify(data[field]) : data[field]);
    }
  });
  
  fields.push('updatedAt = ?');
  values.push(new Date().toISOString());
  values.push(bookId);
  
  db.prepare(`UPDATE books SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  
  // 如果更新了标题，同步更新索引
  if (data.title) {
    const idxPath = path.join(BOOKS_DIR, 'index.soul');
    const idxDb = openOrCreateIndex(idxPath);
    idxDb.prepare('UPDATE books SET title = ?, updatedAt = ? WHERE id = ?')
      .run(data.title, new Date().toISOString(), bookId);
    idxDb.close();
  }
  
  db.close();
  return getBook(bookId);
}

/**
 * 删除书本
 */
function deleteBook(bookId) {
  const dbPath = path.join(BOOKS_DIR, `${bookId}.soul`);
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
  
  // 从索引中移除
  const idxPath = path.join(BOOKS_DIR, 'index.soul');
  if (fs.existsSync(idxPath)) {
    const idxDb = new Database(idxPath);
    idxDb.prepare('DELETE FROM books WHERE id = ?').run(bookId);
    idxDb.close();
  }
  
  return { success: true };
}

// ========== 章节操作 ==========

/**
 * 创建章节
 */
function createChapter(bookId, data) {
  const db = openBook(bookId);
  if (!db) return null;
  
  const id = data.id || uuid();
  const now = new Date().toISOString();
  
  // 获取最大orderIndex
  const maxOrder = db.prepare('SELECT MAX(orderIndex) as m FROM chapters WHERE bookId = ?').get(bookId);
  const orderIndex = (maxOrder.m || 0) + 1;
  
  db.prepare(`
    INSERT INTO chapters (id, bookId, parentId, title, content, orderIndex, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, bookId, data.parentId || null, data.title || '新章节', 
         data.content || '', orderIndex, now, now);
  
  // 更新书本字数
  updateBookWordCount(db, bookId);
  
  db.close();
  return { id, ...data, orderIndex };
}

/**
 * 更新章节
 */
function updateChapter(bookId, chapterId, data) {
  const db = openBook(bookId);
  if (!db) return null;
  
  const fields = ['title', 'content', 'orderIndex', 'parentId'];
  const updates = [];
  const values = [];
  
  fields.forEach(f => {
    if (data[f] !== undefined) {
      updates.push(`${f} = ?`);
      values.push(data[f]);
    }
  });
  
  updates.push('updatedAt = ?');
  values.push(new Date().toISOString());
  values.push(chapterId);
  
  db.prepare(`UPDATE chapters SET ${updates.join(', ')} WHERE id = ? AND bookId = ?`)
    .run(...values, chapterId, bookId);
  
  // 更新书本字数
  updateBookWordCount(db, bookId);
  
  db.close();
  return db.prepare('SELECT * FROM chapters WHERE id = ?').get(chapterId);
}

/**
 * 删除章节
 */
function deleteChapter(bookId, chapterId) {
  const db = openBook(bookId);
  if (!db) return null;
  
  db.prepare('DELETE FROM chapters WHERE id = ? AND bookId = ?').run(chapterId, bookId);
  updateBookWordCount(db, bookId);
  
  db.close();
  return { success: true };
}

/**
 * 更新书本总字数
 */
function updateBookWordCount(db, bookId) {
  const result = db.prepare('SELECT SUM(wordCount) as total FROM chapters WHERE bookId = ?').get(bookId);
  const contentLen = db.prepare('SELECT SUM(LENGTH(content)) as total FROM chapters WHERE bookId = ?').get(bookId);
  const wordCount = Math.floor((contentLen.total || 0) / 2); // 粗略估算中文字数
  db.prepare('UPDATE books SET wordCount = ?, updatedAt = ? WHERE id = ?')
    .run(wordCount, new Date().toISOString(), bookId);
}

// ========== 记忆宫殿操作 ==========

/**
 * 创建记忆宫殿节点
 */
function createPalaceNode(bookId, data) {
  const db = openBook(bookId);
  if (!db) return null;
  
  const id = data.id || uuid();
  const now = new Date().toISOString();
  
  db.prepare(`
    INSERT INTO palace_nodes (id, bookId, chapterId, parentId, type, label, description, positionX, positionY, metadata, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, bookId, data.chapterId || null, data.parentId || null,
    data.type || 'plot', data.label || '', data.description || '',
    data.positionX || 0, data.positionY || 0, 
    JSON.stringify(data.metadata || {}), now, now
  );
  
  db.close();
  return { id, ...data };
}

/**
 * 获取记忆宫殿数据
 */
function getPalaceNodes(bookId) {
  const db = openBook(bookId);
  if (!db) return [];
  
  const nodes = db.prepare('SELECT * FROM palace_nodes WHERE bookId = ?').all(bookId);
  const edges = db.prepare('SELECT * FROM palace_edges WHERE sourceId IN (SELECT id FROM palace_nodes WHERE bookId = ?)').all(bookId);
  
  db.close();
  return { nodes, edges };
}

// ========== 向量操作（待实现） ==========

/**
 * 生成向量（增量）
 */
function generateVector(text, field = 'content') {
  // TODO: 集成 transformers.js BGE-M3
  // 目前返回占位符
  return {
    field,
    vector: null,
    status: 'pending',
    message: 'Vector generation pending - transformers.js integration required'
  };
}

module.exports = {
  createBookshelf,
  getAllBookshelves,
  createBook,
  getAllBooks,
  getBook,
  updateBook,
  deleteBook,
  createChapter,
  updateChapter,
  deleteChapter,
  createPalaceNode,
  getPalaceNodes,
  generateVector,
  BOOKS_DIR
};
