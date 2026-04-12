# SoulWriter 代码索引

> 最后更新：2026-04-12

## 前端 (dashboard/)

### 文件
| 文件 | 功能 |
|------|------|
| `index.html` | 单页入口 |
| `css/drawer_layout.css` | 抽屉式布局样式 |
| `js/app.js` | 主应用（抽屉架构） |
| `js/logger.js` | 工具栏（主题/语言/日志） |

## 后端 (src/)

### 文件
| 文件 | 功能 |
|------|------|
| `app.js` | Fastify 主服务 |
| `books_routes.js` | Books/状态 API |
| `services/books_service.js` | 数据库操作 |

## API 端点

### 状态 API
| 端点 | 说明 |
|------|------|
| `GET /api/state/themes` | 主题列表 |
| `GET /api/state/langs` | 语言列表 |
| `GET /api/state/tabs` | Tab 列表 |
| `GET /api/state/entities` | 实体类型列表 |
| `GET /api/state/info` | 系统信息 |

### 实体 API
| 端点 | 说明 |
|------|------|
| `POST /api/books` | 书本 CRUD |
| `POST /api/roles` | 角色 CRUD |
| `POST /api/items` | 物品 CRUD |
| `POST /api/locations` | 地点 CRUD |

## 抽屉架构

```
Tool: Theme | Lang | Log | Docs
Tab: [Home] [Genesis] [Event] [Nvwa] [Novel] [Back]
Nav (left) | Canvas (center) | Entity List (right1) | Detail (right2)
```

## 快速修改

1. 修改抽屉样式 → `css/drawer_layout.css`
2. 修改主应用 → `js/app.js`
3. 添加 API → `src/books_routes.js`
4. 修改数据库 → `src/services/books_service.js`

## 版本

| 版本 | 日期 | 说明 |
|------|------|------|
| v6 | 2026-04-12 | 抽屉架构 + 万物 API |
