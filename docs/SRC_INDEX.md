# SoulWriter Src 源码索引

## 文件信息
- **路径**: src/
- **总行数**: ~8000行
- **最后更新**: 2026-04-13

---

## 目录结构

\`\`\`
src/
├── app.js                    # Fastify主入口 (695行)
├── books_routes.js           # 书本路由 (222行)
├── dashboard_route.js         # Dashboard路由 (99行)
├── export_module.js          # 导出模块 (242行)
├── genesis_tree.js           # 创世树 (275行)
├── nvwa_engine.js           # 女娲引擎 (453行)
├── books/
│   └── books_service.js      # 书籍服务 (382行)
├── services/
│   ├── books_service.js     # 书籍服务 (388行)
│   ├── works_storage.js     # 作品存储 (369行)
│   └── plugin_manager.js     # 插件管理 (181行)
├── modules/
│   ├── nvwa/
│   │   ├── engine.js       # 女娲引擎核心 (381行)
│   │   ├── engine_v2.js    # 女娲引擎v2 (322行)
│   │   ├── memory_layers.js # 记忆层 (317行)
│   │   ├── active_params.js # 激活参数 (285行)
│   │   └── quantum_entanglement.js # 量子纠缠 (229行)
│   ├── locations/
│   │   └── manager.js      # 地点管理 (269行)
│   ├── genesis_nvwa_link.js # 创世-女娲链接 (234行)
│   └── relationship/
│       └── graph.js         # 关系图 (213行)
└── routes/
    ├── translate_routes.js  # 翻译路由 (211行)
    └── events_routes.js     # 事件路由 (177行)
\`\`\`

---

## 核心模块说明

### 女娲系统 (modules/nvwa/)
| 文件 | 行数 | 功能 |
|------|------|------|
| engine.js | 381 | 女娲引擎核心 |
| engine_v2.js | 322 | 女娲引擎v2 |
| memory_layers.js | 317 | 记忆分层 |
| active_params.js | 285 | 激活参数 |
| quantum_entanglement.js | 229 | 量子纠缠 |

### 书籍系统
| 文件 | 行数 | 功能 |
|------|------|------|
| books_service.js (services/) | 388 | 书籍服务 |
| books_service.js (books/) | 382 | 书籍服务 |
| books_routes.js | 222 | 路由 |

### 创世系统
| 文件 | 行数 | 功能 |
|------|------|------|
| genesis_tree.js | 275 | 创世树 |
| genesis_nvwa_link.js | 234 | 女娲链接 |

---

## 修改记录
| 日期 | 修改内容 |
|------|----------|
| 2026-04-13 | 创建索引文档 |
