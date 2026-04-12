# SoulWriter - 灵魂创作者

> 下一代 AI 驱动的小说创作平台

## 愿景

不是写小说工具，而是**灵魂塑造器**。

> "彩云小梦帮你写，我们帮你塑造灵魂"

---

## 版本规划

### v1.0 - 基础创作工作台
**目标**：能跑通核心创作流程

| 模块 | 功能 | 文件 |
|------|------|------|
| 书架 | 创建/打开/删除书本 | books_crud.js |
| 左侧导航 | 角色/物品/地点/单元/设定/世界观/背景/提示词 | nav_system.js |
| 顶部 Tab | 首页/创世树/事件线/女娲推演/小说详写 | tab_system.js |
| 实体列表 | 卡片网格展示 | entity_list.js |
| 实体详情 | 简单/详细模式 | entity_detail.js |
| 模态框 | 创建/编辑表单 | modal_system.js |

### v1.1 - 关系系统
**目标**：实体之间能建立关系

| 模块 | 功能 | 文件 |
|------|------|------|
| 拖拽系统 | 拖动实体卡片建立关系 | drag_drop.js |
| 关系存储 | 关系数据结构（role-item, role-location等）| relation_store.js |
| 关系面板 | 查看某实体关联的所有关系 | relation_panel.js |
| AI 串联 | 通过描述让 AI 建立关系 | ai_relation.js |

### v1.2 - 可视化关系图
**目标**：看到实体之间的关系网络

| 模块 | 功能 | 文件 |
|------|------|------|
| 关系图谱 | D3/Force-graph 可视化 | relation_graph.js |
| 节点编辑 | 点击节点编辑实体 | node_edit.js |
| 关系线 | 显示关系类型（拥有/位于/参与等）| edge_rendering.js |
| 筛选器 | 按类型筛选显示 | graph_filter.js |

### v1.3 - 创世树
**目标**：可视化剧情分支

| 模块 | 功能 | 文件 |
|------|------|------|
| 树形结构 | 父子节点树形布局 | genesis_tree.js |
| 节点类型 | 核心/角色/情节/世界/主题/事件/物品/地点 | node_types.js |
| 事件温度 | 可视化事件热度 | temperature_viz.js |
| 女娲联动 | 从创世节点创建角色 | genesis_nvwa_link.js |

### v1.4 - 女娲推演引擎
**目标**：AI 驱动角色推演

| 模块 | 功能 | 文件 |
|------|------|------|
| 量子纠缠 | 智能选择角色对进行推演 | quantum_entanglement.js |
| 张力控制 | 剧情节奏控制 | tension_controller.js |
| K线记录 | 角色成长曲线 | kline_recorder.js |
| 分层记忆 | Buffer/Core/Recall/Archival | memory_layers.js |
| 激活参数 | 动态属性调整 | active_params.js |

### v1.5 - 事件线
**目标**：时间轴可视化

| 模块 | 功能 | 文件 |
|------|------|------|
| 时间轴 | 水平/垂直时间轴 | timeline_view.js |
| 事件卡片 | 事件节点 | event_card.js |
| 时间线编辑 | 添加/拖动/删除事件 | timeline_edit.js |
| 事件详情 | 点击查看事件详情 | event_detail.js |

### v1.6 - 小说详写
**目标**：章节创作

| 模块 | 功能 | 文件 |
|------|------|------|
| 章节列表 | 左侧章节导航 | chapter_nav.js |
| 富文本编辑 | Markdown/富文本编辑器 | rich_editor.js |
| 角色标注 | @角色名自动高亮 | character_mention.js |
| AI 续写 | 选中文本 AI 续写 | ai_continue.js |

### v1.7 - 大文档分解
**目标**：处理几十万字长篇

| 模块 | 功能 | 文件 |
|------|------|------|
| 文档上传 | 支持 .txt/.docx/.epub | doc_uploader.js |
| AI 拆分 | 自动识别角色/地点/物品/事件 | ai_splitter.js |
| 子卡片生成 | 拆分的实体生成子卡片 | subcard_generator.js |
| 上下文管理 | 超长文本分块加载 | context_manager.js |
| 地图点位 | 从文本提取地理位置 | location_extractor.js |

### v2.0 - 记忆宫殿
**目标**：角色记忆结构化

| 模块 | 功能 | 文件 |
|------|------|------|
| 宫殿系统 | 房间/位置记忆法 | memory_palace.js |
| 角色记忆 | 角色背景/经历结构化 | character_memory.js |
| 记忆提取 | 从小说文本提取记忆点 | memory_extractor.js |
| 记忆检索 | 基于位置检索记忆 | memory_retrieval.js |

### v2.1 - 星图设计
**目标**：宏观世界观可视化

| 模块 | 功能 | 文件 |
|------|------|------|
| 星图视图 | 多星球/位面可视化 | star_map.js |
| 势力分布 | 派系/势力关系 | faction_view.js |
| 星球详情 | 点击查看星球信息 | planet_detail.js |
| 航线系统 | 星球间航线 | route_system.js |

### v2.2 - 可视化女娲系统
**目标**：2D 场景对话

| 模块 | 功能 | 文件 |
|------|------|------|
| 场景构建 | 场景背景/位置设计 | scene_builder.js |
| 角色对话 | 2D 角色对话界面 | character_dialogue.js |
| 场景推演 | AI 驱动场景发展 | scene_simulation.js |
| 表情动作 | 角色表情/动作 | character_animation.js |

---

## 技术架构

### 目录结构
```
soulwriter-api/
├── src/
│   ├── app.js                    # Fastify 主服务
│   ├── modules/                  # 核心模块
│   │   ├── nvwa/               # 女娲引擎（9子模块）
│   │   │   ├── engine.js        # 引擎入口
│   │   │   ├── quantum_entanglement.js
│   │   │   ├── tension_controller.js
│   │   │   ├── kline_recorder.js
│   │   │   ├── memory_layers.js
│   │   │   ├── active_params.js
│   │   │   ├── event_parser.js
│   │   │   ├── prompt_builder.js
│   │   │   └── token_optimizer.js
│   │   ├── genesis/             # 创世树
│   │   │   ├── tree.js
│   │   │   └── genesis_nvwa_link.js
│   │   ├── relationship/        # 关系图谱
│   │   │   └── graph.js
│   │   ├── timeline/           # 事件线
│   │   │   └── timeline.js
│   │   ├── memory_palace/      # 记忆宫殿
│   │   │   └── palace.js
│   │   └── star_map/           # 星图设计
│   │       └── star_map.js
│   ├── services/
│   │   ├── plugin_manager.js   # 插件系统
│   │   └── works_storage.js    # works/ 存储
│   └── routes/
│       ├── api_v1.js           # v1 API 路由
│       └── web_routes.js       # Web 路由
├── dashboard/                  # 前端
│   ├── index.html              # 单页入口
│   ├── css/
│   │   ├── main.css           # 主样式
│   │   ├── theme-dark.css     # 暗色主题
│   │   └── theme-soft.css     # 柔和主题
│   └── js/
│       ├── app.js             # 主应用
│       ├── components/        # UI 组件
│       │   ├── nav.js         # 导航系统
│       │   ├── tabs.js        # Tab 系统
│       │   ├── entity_list.js # 实体列表
│       │   ├── entity_card.js # 实体卡片
│       │   ├── detail_panel.js# 详情面板
│       │   ├── modal.js       # 模态框
│       │   ├── drag_drop.js  # 拖拽系统
│       │   └── graph_view.js # 关系图谱
│       ├── modules/           # 功能模块
│       │   ├── genesis_tree.js
│       │   ├── nvwa_panel.js
│       │   ├── timeline.js
│       │   ├── novel_editor.js
│       │   ├── doc_splitter.js
│       │   ├── memory_palace.js
│       │   ├── star_map.js
│       │   └── dialogue_view.js
│       └── i18n/
│           ├── zh_CN.js
│           └── en_US.js
└── plugins/                   # 插件
    └── {plugin-id}/
        ├── manifest.json
        └── index.js
```

### 数据模型

#### Book (书本)
```json
{
  "id": "uuid",
  "title": "书名",
  "author": "作者",
  "description": "简介",
  "created": "timestamp",
  "updated": "timestamp"
}
```

#### Entity (实体基类)
```json
{
  "id": "uuid",
  "bookId": "book-uuid",
  "type": "role|item|location|unit|setting|node",
  "title": "名称",
  "description": "描述",
  "relations": [
    { "targetId": "entity-uuid", "type": "owns|located_at|participates_in|...}
  ],
  "created": "timestamp",
  "updated": "timestamp"
}
```

#### Relation (关系类型)
```
owns        # 拥有（角色-物品）
located_at  # 位于（物品-地点）
participates_in # 参与（角色-事件）
belongs_to  # 属于（物品-设定）
contains    # 包含（地点-物品）
connected_to # 关联（任意两实体）
```

---

## API 设计

### RESTful 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/books | 创建书本 |
| GET | /api/books | 列出书本 |
| GET | /api/books/:id | 获取书本 |
| PUT | /api/books/:id | 更新书本 |
| DELETE | /api/books/:id | 删除书本 |

### 实体 CRUD

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/books/:bookId/roles | 创建角色 |
| GET | /api/books/:bookId/roles | 列出角色 |
| GET | /api/books/:bookId/roles/:id | 获取角色 |
| PUT | /api/books/:bookId/roles/:id | 更新角色 |
| DELETE | /api/books/:bookId/roles/:id | 删除角色 |

### 关系操作

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/relations | 创建关系 |
| GET | /api/entities/:id/relations | 获取实体的所有关系 |
| DELETE | /api/relations/:id | 删除关系 |

### 女娲引擎

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/nvwa/tick | 执行推演 |
| GET | /api/nvwa/souls | 所有角色状态 |
| GET | /api/nvwa/klines/:soulId | 角色 K 线 |

### 创世树

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/genesis/seeds | 创建种子 |
| GET | /api/genesis/seeds/:id/tree | 获取树结构 |
| POST | /api/genesis/nodes | 创建节点 |
| PUT | /api/genesis/nodes/:id | 更新节点 |

---

## 设计原则

### 1. 模块化
每个功能独立成模块，可单独测试和替换。

### 2. 数据优先
先设计数据结构，再设计 UI。数据结构清晰，UI 只是展示。

### 3. 插件化
新功能可通过插件扩展，不修改核心代码。

### 4. 版本迭代
每个版本聚焦一个核心功能，不贪多。

### 5. Git 规范
- 每个版本完成必须提交 GitHub
- 提交信息格式：`feat: 功能名称`、`fix: 问题修复`、`docs: 文档更新`
- 功能开发在分支，合并前测试

---

## 当前版本

### v0.9 - 框架搭建中
- [x] 项目结构
- [x] 主题系统
- [x] i18n 中英双语
- [ ] 基础 CRUD（进行中）
- [ ] 顶部 Tab + 左侧导航

### v1.0 - 基础工作台
- [ ] 实体卡片系统
- [ ] 详情面板
- [ ] 拖拽基础

---

*最后更新：2026-04-12*
