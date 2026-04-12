# SoulWriter - 灵魂创作者

> 创世树 × 女娲引擎 AI 创作平台，支持多角色推演、世界观构建、主题定制

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0-green.svg)
![Version](https://img.shields.io/badge/version-1.2-blue.svg)

## 功能特点

### 🌳 创世树（Genesis）
- 可视化世界观构建
- 种子 → 节点 → 关系树的完整结构
- 剧情节点类型支持（起承转合、角色、设定等）
- 与女娲引擎联动，自动从创世节点创建角色

### 🧬 女娲引擎（Nvwa）
- AI 驱动的角色推演引擎
- 量子纠缠算法智能选择角色对
- 张力控制系统（剧情节奏）
- 激活参数动态属性调整
- 分层记忆系统（Buffer/Core/Recall/Archival）
- K 线记录追踪角色成长

### 📚 书本管理
- `.soul` 格式存储（最终打包）
- `works/` 临时存储（编辑/预览）
- 章节、角色、物品、地点全支持

### 🎨 主题系统
- **柔和**（默认）- 新拟态 + 毛玻璃，薰衣草紫 + 薄荷绿
- **暗色** - 深色毛玻璃护眼模式
- **随系统** - 自动适配系统主题

## 技术架构

```
soulwriter-api/
├── src/
│   ├── app.js                    # Fastify 主服务
│   ├── modules/
│   │   ├── nvwa/                # 女娲引擎（9 子模块）
│   │   │   ├── active_params.js
│   │   │   ├── memory_layers.js
│   │   │   ├── quantum_entanglement.js
│   │   │   ├── tension_controller.js
│   │   │   ├── kline_recorder.js
│   │   │   ├── event_parser.js
│   │   │   ├── prompt_builder.js
│   │   │   └── token_optimizer.js
│   │   ├── genesis_nvwa_link.js # 创世×女娲联动
│   │   └── genesis_tree.js      # 创世树核心
│   ├── services/
│   │   ├── plugin_manager.js    # 插件系统
│   │   └── works_storage.js     # works/ 存储
│   └── routes/
│       ├── works_routes.js      # works/ API
│       └── genesis_nvwa_routes.js
├── dashboard/                   # Web UI
│   ├── index.html
│   ├── css/theme.css            # 柔和主题
│   └── js/app.js
└── works/                       # 临时工作目录
```

## 快速开始

```bash
# 克隆
git clone https://github.com/zzz123hash/soulwriter-api.git
cd soulwriter-api

# 安装依赖
npm install

# 启动
npm start
# 或
node src/app.js

# 访问
open http://localhost:3000/dashboard/
```

## API 文档

### 女娲引擎 `/api/v1/nvwa/`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/status` | 引擎状态 |
| GET | `/souls` | 所有角色 |
| POST | `/souls` | 创建角色 |
| GET | `/souls/:id` | 获取角色 |
| PUT | `/souls/:id` | 更新角色 |
| POST | `/tick` | 执行推演 Tick |
| GET | `/world-vars` | 世界变量 |
| GET | `/klines/:soulId` | 角色 K 线 |

### 创世树 `/api/genesis/`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/seeds` | 创建种子 |
| GET | `/seeds` | 列出种子 |
| GET | `/seeds/:id/tree` | 获取树结构 |
| POST | `/nodes` | 创建节点 |
| PUT | `/nodes/:id` | 更新节点 |
| POST | `/:seedId/init-nvwa` | 初始化女娲角色 |

### works 存储 `/api/v1/works/`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/books` | 创建书本 |
| GET | `/books` | 列出书本 |
| POST | `/:bookId/:entityType` | 保存实体 |
| GET | `/:bookId/:entityType` | 列出实体 |

## 配置

### AI 配置

通过 Dashboard → 设置 或 API:

```bash
curl -X POST http://localhost:3000/api/v1/ai/config \
  -H 'Content-Type: application/json' \
  -d '{"type":"cloud","model":"gpt-4o","baseUrl":"https://api.openai.com/v1","apiKey":"sk-..."}'
```

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | 3000 | 服务端口 |
| `DB_PATH` | `./data.db` | SQLite 数据库路径 |

## 插件系统

插件位于 `src/plugins/`，结构:

```
src/plugins/
└── {plugin-id}/
    ├── manifest.json
    └── index.js
```

示例：`src/plugins/nvwa-tension-monitor/`（张力监控插件）

## 文档

- [用户手册](./docs/User-Guide-v1.1.md)
- [API 文档](./docs/API-v1.1.md)
- [架构设计](./docs/soulwriter_architecture.md)

## 更新日志

### v1.2 (2026-04-12)
- ✨ 主题系统上线（柔和/暗色/随系统）
- ✨ works/ 临时存储系统
- ✨ 插件系统
- ✨ 女娲引擎模块化重构（9 子模块）
- ✨ 创世树 × 女娲引擎联动
- 🐛 修复多项 bug

### v1.1
- 基础功能上线

## License

MIT
