# Fastify主服务索引 (app.js)

## 文件信息
- **路径**: src/app.js
- **总行数**: 695行
- **最后更新**: 2026-04-13

---

## 依赖模块
\`\`\`javascript
const fastify = require(fastify)
const Database = require(better-sqlite3)
const booksRoutes = require(./books_routes)
const nvwa = require(./nvwa_engine)
const worksStorage = require(./services/works_storage)
const worksRoutes = require(./routes/works_routes)
const uploadRoutes = require(./routes/upload_routes)
const eventsRoutes = require(./routes/events_routes)
const memoryRoutes = require(./routes/memory_routes)
const settingsRoutes = require(./routes/settings_routes)
const translateRoutes = require(./routes/translate_routes)
const aiRoutes = require(../routes/ai_routes)
const NvwaEngine = require(./modules/nvwa/engine_v2)
const pluginManager = require(./services/plugin_manager)
\`\`\`

---

## 路由概览

### 健康检查
- GET /health

### 项目API (v1)
- GET /api/v1/projects
- POST /api/v1/projects
- GET /api/v1/projects/:id
- PUT /api/v1/projects/:id
- DELETE /api/v1/projects/:id

### 角色API
- GET /api/v1/projects/:projectId/roles
- POST /api/v1/roles
- GET /api/v1/roles/:id
- PUT /api/v1/roles/:id
- DELETE /api/v1/roles/:id
- GET /api/v1/roles/:id/soul
- PUT /api/v1/roles/:id/soul

### 物品/地点/设置
- /api/v1/items/:id
- /api/v1/locations/:id
- /api/v1/settings/:id

### 女娲系统
- GET /api/v1/nvwa/status
- POST /api/v1/nvwa/analyze
- GET /api/v1/nvwa/memory/:characterId
- GET /api/v1/nvwa/souls
- GET /api/v1/nvwa/world-vars

### 创世树
- GET /api/genesis/seeds
- POST /api/genesis/seeds
- GET /api/genesis/nodes/:id
- GET /api/genesis/nodes/:id/children
- PUT /api/genesis/nodes/:id

### 翻译
- GET /api/translate/categories
- POST /api/translate
- POST /api/translate/validate

### Dashboard
- GET /dashboard/
- GET /dashboard/*

---

## 修改记录
| 日期 | 修改内容 |
|------|----------|
| 2026-04-13 | 创建索引文档 |
