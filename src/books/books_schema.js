/**
 * SoulWriter Books - 本地文档管理系统
 * 每个书本 = 1个.soul文件（SQLite格式）
 * 向量增量生成 + 本地缓存
 */

const SCHEMA = `
-- 书架表
CREATE TABLE IF NOT EXISTS bookshelves (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  coverUrl TEXT DEFAULT '',
  parentId TEXT DEFAULT NULL,
  position INTEGER DEFAULT 0,
  color TEXT DEFAULT '#6366f1',
  metadata TEXT DEFAULT '{}',
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- 书本表
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT DEFAULT '',
  description TEXT DEFAULT '',
  coverUrl TEXT DEFAULT '',
  parentId TEXT DEFAULT NULL,
  path TEXT DEFAULT '/',
  depth INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  wordCount INTEGER DEFAULT 0,
  tags TEXT DEFAULT '[]',
  metadata TEXT DEFAULT '{}',
  titleVectorPath TEXT DEFAULT NULL,
  descVectorPath TEXT DEFAULT NULL,
  contentVectorPath TEXT DEFAULT NULL,
  vectorStatus TEXT DEFAULT 'pending',
  bookshelfId TEXT DEFAULT NULL,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- 章节表
CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY,
  bookId TEXT NOT NULL,
  parentId TEXT DEFAULT NULL,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  orderIndex INTEGER DEFAULT 0,
  wordCount INTEGER DEFAULT 0,
  metadata TEXT DEFAULT '{}',
  vectorStatus TEXT DEFAULT 'pending',
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- 记忆宫殿节点表
CREATE TABLE IF NOT EXISTS palace_nodes (
  id TEXT PRIMARY KEY,
  bookId TEXT NOT NULL,
  chapterId TEXT DEFAULT NULL,
  parentId TEXT DEFAULT NULL,
  type TEXT DEFAULT 'plot',
  label TEXT DEFAULT '',
  description TEXT DEFAULT '',
  positionX REAL DEFAULT 0,
  positionY REAL DEFAULT 0,
  depth INTEGER DEFAULT 0,
  childrenCount INTEGER DEFAULT 0,
  metadata TEXT DEFAULT '{}',
  status TEXT DEFAULT 'active',
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- 记忆宫殿边表
CREATE TABLE IF NOT EXISTS palace_edges (
  id TEXT PRIMARY KEY,
  sourceId TEXT NOT NULL,
  targetId TEXT NOT NULL,
  type TEXT DEFAULT 'sequential',
  weight REAL DEFAULT 1.0,
  metadata TEXT DEFAULT '{}',
  createdAt TEXT DEFAULT (datetime('now'))
);

-- 向量缓存表
CREATE TABLE IF NOT EXISTS vector_cache (
  id TEXT PRIMARY KEY,
  entityType TEXT NOT NULL,
  entityId TEXT NOT NULL,
  field TEXT NOT NULL,
  vector BLOB,
  dimension INTEGER DEFAULT 384,
  model TEXT DEFAULT 'bge-m3',
  createdAt TEXT DEFAULT (datetime('now'))
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_books_bookshelf ON books(bookshelfId);
CREATE INDEX IF NOT EXISTS idx_chapters_book ON chapters(bookId);
CREATE INDEX IF NOT EXISTS idx_palace_book ON palace_nodes(bookId);
CREATE INDEX IF NOT EXISTS idx_vector_entity ON vector_cache(entityType, entityId);
`;

module.exports = { SCHEMA };
