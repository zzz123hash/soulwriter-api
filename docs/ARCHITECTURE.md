# SoulWriter 架构文档

> 版本：v2.0 | 更新：2026-04-11

## 整体定位

**核心功能：** AI辅助的故事创作工具
**目标用户：** 有好故事但写作能力有限的作者

## 页面结构

```
┌─────────────────────────────────────────────────────────────────┐
│  上方页面切换                                                    │
│  [首页] [创世树] [事件线] [女娲推演] [小说详写]                   │
├─────────────────────────────────────────────────────────────────┤
│  左侧功能栏（拖入主体区域）                                       │
│  ┌────────────┐ ┌────────────────────────────────────────┐   │
│  │ 角色        │ │                                         │   │
│  │ 物品        │ │                                         │   │
│  │ 地点        │ │         主体区域                        │   │
│  │ 节点(拖动)  │ │     （显示当前页面内容）                  │   │
│  │ 单元        │ │                                         │   │
│  │ 世界观       │ │                                         │   │
│  │ 背景设定     │ │                                         │   │
│  │ 提示词       │ │                                         │   │
│  │ 地图        │ │                                         │   │
│  └────────────┘ └────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 5个核心页面

### 1. 首页
- 书本书架管理
- 地图入口
- 世界观入口

### 2. 创世树
- 剧情分支可视化
- 节点拖拽
- 关系连线

### 3. 事件线
- 按时间顺序的事件链
- 事件温度分析（每个节点）
- 顺理成章检测

### 4. 女娲推演
- 角色管理（含K线）
- 物品系统
- 地点系统

### 5. 小说详写
- 章节内容创作
- 富文本编辑

## 左侧功能栏（可拖入页面）

| 功能 | 说明 |
|------|------|
| 角色 | 人物/动物等，含K线 |
| 物品 | 装备/道具/物品 |
| 地点 | 故事发生场所 |
| 节点 | 可拖动的事件节点 |
| 单元 | 章节/卷的事件合集 |
| 世界观 | 设定/规则 |
| 背景设定 | 故事背景 |
| 提示词 | AI提示词管理 |
| 地图 | 世界地图入口 |

## 数据表结构（旧代码复用）

### nvwa_souls（角色/角色K线）
```sql
CREATE TABLE nvwa_souls (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT DEFAULT 'unknown',
  role TEXT DEFAULT '',
  description TEXT DEFAULT '',
  attributes TEXT DEFAULT '{}',
  klines TEXT DEFAULT '[]',
  relationships TEXT DEFAULT '[]',
  metadata TEXT DEFAULT '{}',
  status TEXT DEFAULT 'active'
);
```

### genesis_nodes（节点/事件）
```sql
CREATE TABLE genesis_nodes (
  id TEXT PRIMARY KEY,
  seedId TEXT,
  parentId TEXT,
  type TEXT DEFAULT 'plot_twist',
  label TEXT DEFAULT '',
  description TEXT DEFAULT '',
  positionX REAL DEFAULT 0,
  positionY REAL DEFAULT 0,
  depth INTEGER DEFAULT 0,
  childrenCount INTEGER DEFAULT 0,
  temperature REAL DEFAULT 0.5,  -- 事件温度
  metadata TEXT DEFAULT '{}',
  status TEXT DEFAULT 'active'
);
```

### genesis_seeds（故事种子）
```sql
CREATE TABLE genesis_seeds (
  id TEXT PRIMARY KEY,
  coreConflict TEXT DEFAULT '',
  backgroundTone TEXT DEFAULT '',
  keyForeshadowing TEXT DEFAULT '',
  centralQuestion TEXT DEFAULT '',
  protagonist TEXT DEFAULT '',
  setting TEXT DEFAULT '',
  stakes TEXT DEFAULT '',
  tone TEXT DEFAULT '',
  type TEXT DEFAULT 'world_building'
);
```

### nvwa_world_vars（世界变量）
- tension（紧张度）
- chaos（混乱度）
- progress（进度）

### 其他表
- chapters: bookId, title, content, orderIndex
- items: bookId, name, type, rarity, description
- locations: bookId, name, type, description

## API优先原则

每个功能模块必须开放完整的CRUD API：
- POST /api/xxx/create - 创建
- POST /api/xxx/list - 查询列表
- POST /api/xxx/get - 获取单个
- POST /api/xxx/update - 更新
- POST /api/xxx/delete - 删除

## 开发优先级

1. Books模块（基础框架）- 已完成
2. 创世树（可视化+事件线）- 进行中
3. 女娲推演（角色K线）- 待完善
4. 小说详写 - 待开发
5. AI辅助功能 - 待开发

---

最后更新：2026-04-11
