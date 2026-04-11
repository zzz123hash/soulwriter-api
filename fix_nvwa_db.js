const Database = require("better-sqlite3");
const db = new Database("data.db");

try { db.exec("ALTER TABLE nvwa_souls ADD COLUMN gender TEXT DEFAULT 'unknown';"); console.log("✅ Added gender"); } catch(e) { console.log("gender:", e.message); }
try { db.exec("ALTER TABLE nvwa_souls ADD COLUMN role TEXT DEFAULT '';"); console.log("✅ Added role"); } catch(e) { console.log("role:", e.message); }
try { db.exec("ALTER TABLE nvwa_souls ADD COLUMN description TEXT DEFAULT '';"); console.log("✅ Added description"); } catch(e) { console.log("description:", e.message); }

try { 
  db.exec("CREATE TABLE IF NOT EXISTS nvwa_souls_klines (id TEXT PRIMARY KEY, soulId TEXT, attributes TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP);"); 
  console.log("✅ Created nvwa_souls_klines"); 
} catch(e) { console.log("klines:", e.message); }

console.log("✅ Schema updated");
db.close();
