const Database = require("better-sqlite3");
const db = new Database("data.db");

// 初始化女娲数据库表
db.exec(`
  CREATE TABLE IF NOT EXISTS nvwa_souls (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    gender TEXT DEFAULT 'unknown',
    role TEXT DEFAULT '',
    description TEXT DEFAULT '',
    attributes TEXT DEFAULT '{}',
    klines TEXT DEFAULT '[]',
    relationships TEXT DEFAULT '[]',
    metadata TEXT DEFAULT '{}',
    status TEXT DEFAULT 'active',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS nvwa_souls_klines (
    id TEXT PRIMARY KEY,
    soulId TEXT,
    attributes TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log("✅ Tables created");
db.close();
