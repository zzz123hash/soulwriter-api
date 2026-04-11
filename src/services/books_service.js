const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const BOOKS_DIR = path.join(__dirname, '../../books_data');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function uuid() {
  return 'b_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function getIndexDb() {
  ensureDir(BOOKS_DIR);
  const dbPath = path.join(BOOKS_DIR, 'index.soul');
  const db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookshelves (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT DEFAULT '',
      coverUrl TEXT DEFAULT '', parentId TEXT DEFAULT NULL, position INTEGER DEFAULT 0,
      color TEXT DEFAULT '#6366f1', metadata TEXT DEFAULT '{}',
      createdAt TEXT DEFAULT (datetime('now')), updatedAt TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, author TEXT DEFAULT '',
      description TEXT DEFAULT '', coverUrl TEXT DEFAULT '', bookshelfId TEXT DEFAULT NULL,
      status TEXT DEFAULT 'draft', wordCount INTEGER DEFAULT 0, tags TEXT DEFAULT '[]',
      metadata TEXT DEFAULT '{}', createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );
  `);
  return db;
}

function getBookDb(bookId) {
  const dbPath = path.join(BOOKS_DIR, bookId + '.soul');
  if (!fs.existsSync(dbPath)) return null;
  return new Database(dbPath);
}

function createBookshelf(data) {
  const db = getIndexDb();
  const id = data.id || uuid();
  const now = new Date().toISOString();
  db.prepare(`INSERT INTO bookshelves (id, name, description, color, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)`).run(id, data.name, data.description || '', data.color || '#6366f1', now, now);
  db.close();
  return { id, name: data.name };
}

function getAllBookshelves() {
  const db = getIndexDb();
  const shelves = db.prepare('SELECT * FROM bookshelves ORDER BY position').all();
  db.close();
  return shelves;
}

function createBook(data) {
  const id = data.id || uuid();
  const now = new Date().toISOString();
  
  // 创建书本文件
  ensureDir(BOOKS_DIR);
  const bookDb = new Database(path.join(BOOKS_DIR, id + '.soul'));
  bookDb.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, author TEXT DEFAULT '',
      description TEXT DEFAULT '', coverUrl TEXT DEFAULT '', status TEXT DEFAULT 'draft',
      wordCount INTEGER DEFAULT 0, tags TEXT DEFAULT '[]', metadata TEXT DEFAULT '{}',
      createdAt TEXT DEFAULT (datetime('now')), updatedAt TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS chapters (
      id TEXT PRIMARY KEY, bookId TEXT NOT NULL, parentId TEXT DEFAULT NULL,
      title TEXT NOT NULL, content TEXT DEFAULT '', orderIndex INTEGER DEFAULT 0,
      wordCount INTEGER DEFAULT 0, metadata TEXT DEFAULT '{}',
      createdAt TEXT DEFAULT (datetime('now')), updatedAt TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS palace_nodes (
      id TEXT PRIMARY KEY, bookId TEXT NOT NULL, chapterId TEXT DEFAULT NULL,
      parentId TEXT DEFAULT NULL, type TEXT DEFAULT 'plot', label TEXT DEFAULT '',
      description TEXT DEFAULT '', positionX REAL DEFAULT 0, positionY REAL DEFAULT 0,
      depth INTEGER DEFAULT 0, childrenCount INTEGER DEFAULT 0, metadata TEXT DEFAULT '{}',
      status TEXT DEFAULT 'active', createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );
  `);
  bookDb.prepare('INSERT INTO books (id, title, createdAt, updatedAt) VALUES (?, ?, ?, ?)').run(id, data.title || '未命名', now, now);
  bookDb.close();
  
  // 写入索引
  const idxDb = getIndexDb();
  idxDb.prepare(`INSERT INTO books (id, title, author, description, bookshelfId, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)`).run(id, data.title || '未命名', data.author || '', data.description || '', data.bookshelfId || null, now, now);
  idxDb.close();
  
  return { id, title: data.title || '未命名', author: data.author || '' };
}

function getAllBooks() {
  const db = getIndexDb();
  const books = db.prepare('SELECT * FROM books ORDER BY updatedAt DESC').all();
  db.close();
  return books;
}

function getBook(bookId) {
  const db = getBookDb(bookId);
  if (!db) return null;
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId);
  const chapters = db.prepare('SELECT * FROM chapters WHERE bookId = ? ORDER BY orderIndex').all(bookId);
  db.close();
  return book ? { ...book, chapters } : null;
}

function updateBook(bookId, data) {
  const db = getBookDb(bookId);
  if (!db) return null;
  const fields = [], values = [];
  ['title', 'author', 'description', 'coverUrl', 'status', 'tags', 'bookshelfId'].forEach(f => {
    if (data[f] !== undefined) { fields.push(f + ' = ?'); values.push(f === 'tags' ? JSON.stringify(data[f]) : data[f]); }
  });
  if (fields.length > 0) {
    fields.push('updatedAt = ?'); values.push(new Date().toISOString()); values.push(bookId);
    db.prepare('UPDATE books SET ' + fields.join(', ') + ' WHERE id = ?').run(...values);
  }
  db.close();
  return getBook(bookId);
}

function deleteBook(bookId) {
  const bookPath = path.join(BOOKS_DIR, bookId + '.soul');
  if (fs.existsSync(bookPath)) fs.unlinkSync(bookPath);
  const idxDb = getIndexDb();
  idxDb.prepare('DELETE FROM books WHERE id = ?').run(bookId);
  idxDb.close();
  return { success: true };
}

// Chapters
function createChapter(bookId, data) {
  const db = getBookDb(bookId);
  if (!db) return null;
  const id = uuid();
  const now = new Date().toISOString();
  const maxOrder = db.prepare('SELECT MAX(orderIndex) as m FROM chapters WHERE bookId = ?').get(bookId);
  const orderIndex = (maxOrder.m || 0) + 1;
  db.prepare('INSERT INTO chapters (id, bookId, title, content, orderIndex, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, bookId, data.title || '新章节', data.content || '', orderIndex, now, now);
  db.close();
  return { id, title: data.title || '新章节', orderIndex };
}

function updateChapter(bookId, chapterId, data) {
  const db = getBookDb(bookId);
  if (!db) return null;
  const fields = [], values = [];
  ['title', 'content', 'orderIndex', 'parentId'].forEach(f => {
    if (data[f] !== undefined) { fields.push(f + ' = ?'); values.push(data[f]); }
  });
  if (fields.length > 0) {
    fields.push('updatedAt = ?'); values.push(new Date().toISOString()); values.push(chapterId);
    db.prepare('UPDATE chapters SET ' + fields.join(', ') + ' WHERE id = ? AND bookId = ?').run(...values, chapterId, bookId);
  }
  db.close();
  return db.prepare('SELECT * FROM chapters WHERE id = ?').get(chapterId);
}

function deleteChapter(bookId, chapterId) {
  const db = getBookDb(bookId);
  if (!db) return null;
  db.prepare('DELETE FROM chapters WHERE id = ? AND bookId = ?').run(chapterId, bookId);
  db.close();
  return { success: true };
}

// Palace nodes
function createPalaceNode(bookId, data) {
  const db = getBookDb(bookId);
  if (!db) return null;
  const id = data.id || uuid();
  const now = new Date().toISOString();
  db.prepare('INSERT INTO palace_nodes (id, bookId, chapterId, parentId, type, label, description, positionX, positionY, metadata, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, bookId, data.chapterId || null, data.parentId || null, data.type || 'plot', data.label || '', data.description || '', data.positionX || 0, data.positionY || 0, JSON.stringify(data.metadata || {}), now, now);
  db.close();
  return { id, ...data };
}

function getPalaceNodes(bookId) {
  const db = getBookDb(bookId);
  if (!db) return { nodes: [], edges: [] };
  const nodes = db.prepare('SELECT * FROM palace_nodes WHERE bookId = ?').all(bookId);
  db.close();
  return { nodes };
}

module.exports = { createBookshelf, getAllBookshelves, createBook, getAllBooks, getBook, updateBook, deleteBook, createChapter, updateChapter, deleteChapter, createPalaceNode, getPalaceNodes };
