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
`);

// Routes
fastify.get("/health", () => ({ status: "ok" }));

// Projects
fastify.get("/api/v1/projects", () => {
  return db.prepare("SELECT * FROM projects ORDER BY createdAt DESC").all();
});

fastify.post("/api/v1/projects", async (req) => {
  const { name } = req.body;
  const id = crypto.randomUUID();
  db.prepare("INSERT INTO projects (id, name) VALUES (?, ?)").run(id, name);
  return { id, name };
});

// Roles
fastify.get("/api/v1/projects/:projectId/roles", (req) => {
  return db.prepare("SELECT * FROM roles WHERE projectId = ?").all(req.params.projectId);
});

fastify.post("/api/v1/roles", async (req) => {
  const { projectId, name } = req.body;
  const id = crypto.randomUUID();
  db.prepare("INSERT INTO roles (id, projectId, name) VALUES (?, ?, ?)").run(id, projectId, name);
  return { id, projectId, name };
});

fastify.get("/api/v1/roles/:id/soul", (req) => {
  const role = db.prepare("SELECT * FROM roles WHERE id = ?").get(req.params.id);
  return { soul: role?.soulData || "{}" };
});

fastify.put("/api/v1/roles/:id/soul", (req) => {
  const { soul } = req.body;
  db.prepare("UPDATE roles SET soulData = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?").run(soul, req.params.id);
  return { success: true };
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
