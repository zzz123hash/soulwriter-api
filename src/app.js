const fastify = require("fastify")({ logger: true });
const Database = require("better-sqlite3");
const path = require("path");
const crypto = require("crypto");

const db = new Database(path.join(__dirname, "..", "data.db"));

// Init DB
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    projectId TEXT NOT NULL,
    name TEXT NOT NULL,
    soulData TEXT DEFAULT '{}',
    attrs TEXT DEFAULT '[]',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    projectId TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    projectId TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    projectId TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
  );
`);

// Routes
fastify.get("/health", () => ({ status: "ok", time: new Date().toISOString() }));

// Projects CRUD
fastify.get("/api/v1/projects", () => {
  return db.prepare("SELECT * FROM projects ORDER BY createdAt DESC").all();
});

fastify.post("/api/v1/projects", async (req) => {
  const { name } = req.body;
  if (!name) return { error: "name required" };
  const id = crypto.randomUUID();
  db.prepare("INSERT INTO projects (id, name) VALUES (?, ?)").run(id, name);
  return { id, name };
});

fastify.get("/api/v1/projects/:id", (req) => {
  return db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id);
});

fastify.put("/api/v1/projects/:id", (req) => {
  const { name } = req.body;
  db.prepare("UPDATE projects SET name = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?").run(name, req.params.id);
  return { success: true };
});

fastify.delete("/api/v1/projects/:id", (req) => {
  db.prepare("DELETE FROM projects WHERE id = ?").run(req.params.id);
  return { success: true };
});

// Roles CRUD
fastify.get("/api/v1/projects/:projectId/roles", (req) => {
  return db.prepare("SELECT * FROM roles WHERE projectId = ?").all(req.params.projectId);
});

fastify.post("/api/v1/roles", async (req) => {
  const { projectId, name } = req.body;
  if (!projectId || !name) return { error: "projectId and name required" };
  const id = crypto.randomUUID();
  db.prepare("INSERT INTO roles (id, projectId, name) VALUES (?, ?, ?)").run(id, projectId, name);
  return { id, projectId, name };
});

fastify.get("/api/v1/roles/:id", (req) => {
  return db.prepare("SELECT * FROM roles WHERE id = ?").get(req.params.id);
});

fastify.put("/api/v1/roles/:id", (req) => {
  const { name, soulData, attrs } = req.body;
  db.prepare("UPDATE roles SET name = ?, soulData = ?, attrs = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?")
    .run(name, soulData || "{}", attrs || "[]", req.params.id);
  return { success: true };
});

fastify.delete("/api/v1/roles/:id", (req) => {
  db.prepare("DELETE FROM roles WHERE id = ?").run(req.params.id);
  return { success: true };
});

// Soul API
fastify.get("/api/v1/roles/:id/soul", (req) => {
  const role = db.prepare("SELECT * FROM roles WHERE id = ?").get(req.params.id);
  return { soul: role?.soulData || "{}", attrs: role?.attrs || "[]" };
});

fastify.put("/api/v1/roles/:id/soul", (req) => {
  const { soul, attrs } = req.body;
  db.prepare("UPDATE roles SET soulData = ?, attrs = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?")
    .run(soul || "{}", attrs || "[]", req.params.id);
  return { success: true };
});

// Items CRUD
fastify.get("/api/v1/projects/:projectId/items", (req) => {
  return db.prepare("SELECT * FROM items WHERE projectId = ?").all(req.params.projectId);
});

fastify.post("/api/v1/items", async (req) => {
  const { projectId, name, description } = req.body;
  if (!projectId || !name) return { error: "projectId and name required" };
  const id = crypto.randomUUID();
  db.prepare("INSERT INTO items (id, projectId, name, description) VALUES (?, ?, ?, ?)")
    .run(id, projectId, name, description || "");
  return { id, projectId, name, description };
});

fastify.get("/api/v1/items/:id", (req) => {
  return db.prepare("SELECT * FROM items WHERE id = ?").get(req.params.id);
});

fastify.put("/api/v1/items/:id", (req) => {
  const { name, description } = req.body;
  db.prepare("UPDATE items SET name = ?, description = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?")
    .run(name, description || "", req.params.id);
  return { success: true };
});

fastify.delete("/api/v1/items/:id", (req) => {
  db.prepare("DELETE FROM items WHERE id = ?").run(req.params.id);
  return { success: true };
});

// Locations CRUD
fastify.get("/api/v1/projects/:projectId/locations", (req) => {
  return db.prepare("SELECT * FROM locations WHERE projectId = ?").all(req.params.projectId);
});

fastify.post("/api/v1/locations", async (req) => {
  const { projectId, name, description } = req.body;
  if (!projectId || !name) return { error: "projectId and name required" };
  const id = crypto.randomUUID();
  db.prepare("INSERT INTO locations (id, projectId, name, description) VALUES (?, ?, ?, ?)")
    .run(id, projectId, name, description || "");
  return { id, projectId, name, description };
});

fastify.get("/api/v1/locations/:id", (req) => {
  return db.prepare("SELECT * FROM locations WHERE id = ?").get(req.params.id);
});

fastify.put("/api/v1/locations/:id", (req) => {
  const { name, description } = req.body;
  db.prepare("UPDATE locations SET name = ?, description = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?")
    .run(name, description || "", req.params.id);
  return { success: true };
});

fastify.delete("/api/v1/locations/:id", (req) => {
  db.prepare("DELETE FROM locations WHERE id = ?").run(req.params.id);
  return { success: true };
});

// Settings CRUD
fastify.get("/api/v1/projects/:projectId/settings", (req) => {
  return db.prepare("SELECT * FROM settings WHERE projectId = ?").all(req.params.projectId);
});

fastify.post("/api/v1/settings", async (req) => {
  const { projectId, key, value } = req.body;
  if (!projectId || !key) return { error: "projectId and key required" };
  const id = crypto.randomUUID();
  db.prepare("INSERT INTO settings (id, projectId, key, value) VALUES (?, ?, ?, ?)")
    .run(id, projectId, key, value || "");
  return { id, projectId, key, value };
});

fastify.get("/api/v1/settings/:id", (req) => {
  return db.prepare("SELECT * FROM settings WHERE id = ?").get(req.params.id);
});

fastify.put("/api/v1/settings/:id", (req) => {
  const { key, value } = req.body;
  db.prepare("UPDATE settings SET key = ?, value = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?")
    .run(key, value || "", req.params.id);
  return { success: true };
});

fastify.delete("/api/v1/settings/:id", (req) => {
  db.prepare("DELETE FROM settings WHERE id = ?").run(req.params.id);
  return { success: true };
});

// AI Task stub
fastify.post("/api/v1/ai/run", async (req) => {
  const { task, data } = req.body;
  return { 
    task, 
    result: "AI task processed (stub - need LLM integration)",
    data 
  };
});

// Start
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log("Server running at http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
