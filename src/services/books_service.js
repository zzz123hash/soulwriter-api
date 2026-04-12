const path = require('path');
const sqlite3 = require('better-sqlite3');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '../../data');
const BOOKS_DIR = path.join(DATA_DIR, 'books');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function uuid() {
  return 'b_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
}

function getIndexDb() {
  ensureDir(DATA_DIR);
  const dbPath = path.join(DATA_DIR, 'index.db');
  const db = sqlite3(dbPath);
  db.pragma('journal_mode = WAL');
  
  // Create tables if not exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookshelves (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      color TEXT DEFAULT '#6366f1',
      createdAt TEXT,
      updatedAt TEXT
    );
    
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT DEFAULT '',
      description TEXT DEFAULT '',
      coverUrl TEXT DEFAULT '',
      bookshelfId TEXT,
      status TEXT DEFAULT 'draft',
      wordCount INTEGER DEFAULT 0,
      tags TEXT DEFAULT '[]',
      metadata TEXT DEFAULT '{}',
      createdAt TEXT,
      updatedAt TEXT
    );
  `);
  
  return db;
}

function getBookDb(bookId) {
  ensureDir(BOOKS_DIR);
  const dbPath = path.join(BOOKS_DIR, `${bookId}.db`);
  const db = sqlite3(dbPath);
  db.pragma('journal_mode = WAL');
  
  // Create entity tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      bookId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      type TEXT DEFAULT 'main',
      metadata TEXT DEFAULT '{}',
      createdAt TEXT,
      updatedAt TEXT
    );
    
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      bookId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      type TEXT DEFAULT 'item',
      metadata TEXT DEFAULT '{}',
      createdAt TEXT,
      updatedAt TEXT
    );
    
    CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      bookId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      type TEXT DEFAULT 'location',
      metadata TEXT DEFAULT '{}',
      createdAt TEXT,
      updatedAt TEXT
    );
    
    CREATE TABLE IF NOT EXISTS chapters (
      id TEXT PRIMARY KEY,
      bookId TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      orderIndex INTEGER DEFAULT 0,
      metadata TEXT DEFAULT '{}',
      createdAt TEXT,
      updatedAt TEXT
    );
    
    CREATE TABLE IF NOT EXISTS palace_nodes (
      id TEXT PRIMARY KEY,
      bookId TEXT NOT NULL,
      chapterId TEXT,
      parentId TEXT,
      type TEXT DEFAULT 'plot',
      label TEXT DEFAULT '',
      description TEXT DEFAULT '',
      positionX REAL DEFAULT 0,
      positionY REAL DEFAULT 0,
      metadata TEXT DEFAULT '{}',
      createdAt TEXT,
      updatedAt TEXT
    );
  `);
  
  return db;
}

// Bookshelf operations
function createBookshelf(data) {
  const db = getIndexDb();
  const id = data.id || uuid();
  const now = new Date().toISOString();
  db.prepare(`INSERT INTO bookshelves (id, name, description, color, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)`).run(id, data.name || '默认书架', data.description || '', data.color || '#6366f1', now, now);
  db.close();
  return { id, name: data.name, color: data.color };
}

function getAllBookshelves() {
  const db = getIndexDb();
  const shelves = db.prepare('SELECT * FROM bookshelves ORDER BY createdAt DESC').all();
  db.close();
  return shelves;
}

// Book operations
function createBook(data) {
  const db = getIndexDb();
  const id = data.id || uuid();
  const now = new Date().toISOString();
  
  // Create book file
  ensureDir(BOOKS_DIR);
  
  db.prepare(`INSERT INTO books (id, title, author, description, coverUrl, bookshelfId, status, wordCount, tags, metadata, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    id, data.title || '未命名', data.author || '', data.description || '',
    data.coverUrl || '', data.bookshelfId || null, 'draft', 0, '[]', '{}', now, now
  );
  db.close();
  
  // Initialize book database with tables
  getBookDb(id);
  
  return { id, title: data.title, author: data.author, description: data.description };
}

function getAllBooks() {
  const db = getIndexDb();
  const books = db.prepare('SELECT * FROM books ORDER BY updatedAt DESC').all();
  db.close();
  return books;
}

function getBook(bookId) {
  const db = getIndexDb();
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId);
  db.close();
  
  if (!book) return null;
  
  // Get entities from book database
  const bookDb = getBookDb(bookId);
  const roles = bookDb.prepare('SELECT * FROM roles WHERE bookId = ?').all(bookId);
  const items = bookDb.prepare('SELECT * FROM items WHERE bookId = ?').all(bookId);
  const locations = bookDb.prepare('SELECT * FROM locations WHERE bookId = ?').all(bookId);
  const chapters = bookDb.prepare('SELECT * FROM chapters WHERE bookId = ? ORDER BY orderIndex').all(bookId);
  bookDb.close();
  
  return {
    ...book,
    roles,
    items,
    locations,
    chapters
  };
}

function updateBook(bookId, data) {
  const db = getIndexDb();
  const now = new Date().toISOString();
  const fields = [];
  const values = [];
  
  if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
  if (data.author !== undefined) { fields.push('author = ?'); values.push(data.author); }
  if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
  if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
  if (data.wordCount !== undefined) { fields.push('wordCount = ?'); values.push(data.wordCount); }
  
  fields.push('updatedAt = ?');
  values.push(now);
  values.push(bookId);
  
  db.prepare(`UPDATE books SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  db.close();
  return { success: true };
}

function deleteBook(bookId) {
  const db = getIndexDb();
  db.prepare('DELETE FROM books WHERE id = ?').run(bookId);
  db.close();
  
  // Delete book database file
  const dbPath = path.join(BOOKS_DIR, `${bookId}.db`);
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
  return { success: true };
}

// Role operations
function createRole(bookId, data) {
  const db = getBookDb(bookId);
  const id = data.id || uuid();
  const now = new Date().toISOString();
  db.prepare('INSERT INTO roles (id, bookId, title, description, type, metadata, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, bookId, data.title || '未命名', data.description || '', data.type || 'main', JSON.stringify(data.metadata || {}), now, now);
  db.close();
  return { id, ...data };
}

function getRoles(bookId) {
  const db = getBookDb(bookId);
  const roles = db.prepare('SELECT * FROM roles WHERE bookId = ?').all(bookId);
  db.close();
  return roles;
}

function updateRole(bookId, roleId, data) {
  const db = getBookDb(bookId);
  const now = new Date().toISOString();
  db.prepare('UPDATE roles SET title = ?, description = ?, type = ?, metadata = ?, updatedAt = ? WHERE id = ? AND bookId = ?')
    .run(data.title, data.description || '', data.type || 'main', JSON.stringify(data.metadata || {}), now, roleId, bookId);
  db.close();
  return { success: true };
}

function deleteRole(bookId, roleId) {
  const db = getBookDb(bookId);
  db.prepare('DELETE FROM roles WHERE id = ? AND bookId = ?').run(roleId, bookId);
  db.close();
  return { success: true };
}

// Item operations
function createItem(bookId, data) {
  const db = getBookDb(bookId);
  const id = data.id || uuid();
  const now = new Date().toISOString();
  db.prepare('INSERT INTO items (id, bookId, title, description, type, metadata, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, bookId, data.title || '未命名', data.description || '', data.type || 'item', JSON.stringify(data.metadata || {}), now, now);
  db.close();
  return { id, ...data };
}

function getItems(bookId) {
  const db = getBookDb(bookId);
  const items = db.prepare('SELECT * FROM items WHERE bookId = ?').all(bookId);
  db.close();
  return items;
}

function updateItem(bookId, itemId, data) {
  const db = getBookDb(bookId);
  const now = new Date().toISOString();
  db.prepare('UPDATE items SET title = ?, description = ?, type = ?, metadata = ?, updatedAt = ? WHERE id = ? AND bookId = ?')
    .run(data.title, data.description || '', data.type || 'item', JSON.stringify(data.metadata || {}), now, itemId, bookId);
  db.close();
  return { success: true };
}

function deleteItem(bookId, itemId) {
  const db = getBookDb(bookId);
  db.prepare('DELETE FROM items WHERE id = ? AND bookId = ?').run(itemId, bookId);
  db.close();
  return { success: true };
}

// Location operations
function createLocation(bookId, data) {
  const db = getBookDb(bookId);
  const id = data.id || uuid();
  const now = new Date().toISOString();
  db.prepare('INSERT INTO locations (id, bookId, title, description, type, metadata, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, bookId, data.title || '未命名', data.description || '', data.type || 'location', JSON.stringify(data.metadata || {}), now, now);
  db.close();
  return { id, ...data };
}

function getLocations(bookId) {
  const db = getBookDb(bookId);
  const locations = db.prepare('SELECT * FROM locations WHERE bookId = ?').all(bookId);
  db.close();
  return locations;
}

function updateLocation(bookId, locationId, data) {
  const db = getBookDb(bookId);
  const now = new Date().toISOString();
  db.prepare('UPDATE locations SET title = ?, description = ?, type = ?, metadata = ?, updatedAt = ? WHERE id = ? AND bookId = ?')
    .run(data.title, data.description || '', data.type || 'location', JSON.stringify(data.metadata || {}), now, locationId, bookId);
  db.close();
  return { success: true };
}

function deleteLocation(bookId, locationId) {
  const db = getBookDb(bookId);
  db.prepare('DELETE FROM locations WHERE id = ? AND bookId = ?').run(locationId, bookId);
  db.close();
  return { success: true };
}

// Chapter operations
function createChapter(bookId, data) {
  const db = getBookDb(bookId);
  const id = data.id || uuid();
  const now = new Date().toISOString();
  const maxOrder = db.prepare('SELECT MAX(orderIndex) as m FROM chapters WHERE bookId = ?').get(bookId);
  const orderIndex = (maxOrder?.m ?? -1) + 1;
  db.prepare('INSERT INTO chapters (id, bookId, title, content, orderIndex, metadata, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, bookId, data.title || '未命名', data.content || '', orderIndex, JSON.stringify(data.metadata || {}), now, now);
  db.close();
  return { id, title: data.title, orderIndex };
}

function updateChapter(bookId, chapterId, data) {
  const db = getBookDb(bookId);
  const now = new Date().toISOString();
  db.prepare('UPDATE chapters SET title = ?, content = ?, metadata = ?, updatedAt = ? WHERE id = ? AND bookId = ?')
    .run(data.title, data.content || '', JSON.stringify(data.metadata || {}), now, chapterId, bookId);
  db.close();
  return { success: true };
}

function deleteChapter(bookId, chapterId) {
  const db = getBookDb(bookId);
  db.prepare('DELETE FROM chapters WHERE id = ? AND bookId = ?').run(chapterId, bookId);
  db.close();
  return { success: true };
}

// Palace nodes
function createPalaceNode(bookId, data) {
  const db = getBookDb(bookId);
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

module.exports = {
  createBookshelf, getAllBookshelves,
  createBook, getAllBooks, getBook, updateBook, deleteBook,
  createRole, getRoles, updateRole, deleteRole,
  createItem, getItems, updateItem, deleteItem,
  createLocation, getLocations, updateLocation, deleteLocation,
  createChapter, updateChapter, deleteChapter,
  createPalaceNode, getPalaceNodes
};
