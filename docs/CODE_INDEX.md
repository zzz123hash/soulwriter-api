# SoulWriter 代码索引

> 最后更新：2026-04-12

## 前端 (dashboard/)

### dashboard/js/
| 文件 | 功能 | 备注 |
|------|------|------|
| `app.js` | 主应用，渲染、状态、事件绑定 | 核心入口 |
| `logger.js` | 工具栏：主题/语言/日志/文档 | v5 最新 |
| `components/` | UI 组件目录 | 待规划 |

### dashboard/css/
| 文件 | 功能 | 备注 |
|------|------|------|
| `main.css` | 主样式，包含所有组件样式 | 持续更新 |

### dashboard/index.html
| 文件 | 功能 | 备注 |
|------|------|------|
| `index.html` | 单页入口，加载 app.js | 基础不变 |

## 后端 (src/)

### src/
| 文件 | 功能 | 备注 |
|------|------|------|
| `app.js` | Fastify 主服务，注册路由 | 核心入口 |
| `books_routes.js` | Books API 路由 | 实体 CRUD |
| `services/books_service.js` | Books 数据库操作 | 完整 CRUD |

### src/services/
| 文件 | 功能 | 备注 |
|------|------|------|
| `books_service.js` | 书本/角色/物品/地点/章节 CRUD | v4 最新 |

### src/modules/
| 文件 | 功能 | 备注 |
|------|------|------|
| `nvwa/` | 女娲引擎（9子模块） | 待集成 |
| `genesis/` | 创世树 | 待集成 |
| `relationship/` | 关系图谱 | 待集成 |

## 数据

### data/
| 路径 | 说明 |
|------|------|
| `data/index.db` | 书架和书本索引 |
| `data/books/{id}.db` | 每本书的数据库 |

## 文档 (docs/)

| 文件 | 说明 |
|------|------|
| `ARCHITECTURE_V2.md` | 完整版本规划 v1.0-v2.2 |
| `User-Guide-v1.1.md` | 用户手册 |
| `API-v1.1.md` | API 文档 |

---

## 快速修改指南

### 1. 修改欢迎页布局
- 文件：`dashboard/js/app.js`
- 函数：`renderWelcome()`

### 2. 修改内页布局
- 文件：`dashboard/js/app.js`
- 函数：`renderBookView()`

### 3. 修改实体卡片样式
- 文件：`dashboard/css/main.css`
- 搜索：`.entity-card`

### 4. 添加新的实体类型
- 前端：`dashboard/js/app.js` → `entityTitles` 对象
- 后端：`src/services/books_service.js` → 添加表和函数
- 后端：`src/books_routes.js` → 添加路由

### 5. 修改主题
- 文件：`dashboard/js/logger.js` → `applyTheme()` 函数
- CSS：`dashboard/css/main.css` → CSS 变量

### 6. 修改语言
- 文件：`dashboard/js/app.js` → `i18n` 对象

---

## 版本历史

| 版本 | 日期 | 主要内容 |
|------|------|----------|
| v5 | 2026-04-12 | 工具栏永久化，主题/语言/日志/文档 |
| v4 | 2026-04-12 | 简化 logger，移除冲突 |
| v3 | 2026-04-11 | 日志系统初始版本 |
