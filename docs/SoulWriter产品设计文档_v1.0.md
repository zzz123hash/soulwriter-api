# SoulWriter 绘梦系统 - 产品设计文档

> 版本：v1.0 | 日期：2026-04-11 | 状态：待开发

---

## 一、项目定位

### 1.1 核心定位
**AI辅助的故事创作工具**，面向两类用户：
- **主要用户**：Agent（Claude Code、OpenClaw等AI系统）
- **次要用户**：不会写作但有好故事的作者

### 1.2 核心价值
| 痛点 | 解决方案 |
|------|----------|
| 情节太多记不住 | 故事线可视化 |
| 承上启下困难 | AI分析上下文 |
| 转折设置麻烦 | AI生成过渡方案 |
| bug坑越来越多 | AI检测逻辑漏洞 |
| AI写到后面乱套 | 角色独立记忆/人格 |

### 1.3 女娲系统的独特价值
> **每个角色 = 独立人格 + 独立记忆 + 独立设置 + 独立能力 的Agent**
>
> 这是和普通写作软件最大的区别！
> 不会写着写着AI乱套了。

---

## 二、系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        SoulWriter                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  上方页面切换                                             │   │
│  │  [首页书架] [创世树] [事件线] [女娲推演] [小说详写]       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────┐  ┌────────────────────────────────────────────┐   │
│  │ 左侧功能 │  │                                            │   │
│  │          │  │                                            │   │
│  │ 角色     │  │              主体区域                      │   │
│  │ 物品     │  │         （显示当前页面内容）                 │   │
│  │ 地点     │  │                                            │   │
│  │ 节点     │  │                                            │   │
│  │ 单元     │  │                                            │   │
│  │ 世界观   │  │                                            │   │
│  │ 背景设定 │  │                                            │   │
│  │ 提示词   │  │                                            │   │
│  │ 地图     │  │                                            │   │
│  └─────────┘  └────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 六大核心系统

| 系统 | 定位 | 核心功能 |
|------|------|----------|
| **首页** | 入口 | 书架管理、地图入口、世界观入口 |
| **创世树** | 宏观骨架 | 剧情分支可视化、故事大纲、AI辅助建议 |
| **事件线** | 时间轴 | 按时间顺序的事件链、事件温度分析 |
| **女娲推演** | 微观血肉 | 角色Agent、动态属性、记忆系统、AI主动辅助 |
| **小说详写** | 输出 | 章节内容创作、富文本编辑 |
| **辅助系统** | 支持 | 提示词管理、世界观设定 |

---

## 三、女娲推演系统（核心）

### 3.1 女娲系统设计理念

**核心**：角色是"活"的，有发展变化曲线，随故事发展而演进。

```
【酒馆】角色对话 → 【女娲】角色Agent化
                    ↓
         每个角色有独立人格、记忆、能力
                    ↓
         不会写着写着AI乱套了
```

### 3.2 女娲角色 vs 普通角色

| 维度 | 普通角色 | 女娲角色 |
|------|---------|---------|
| 属性 | 固定字段 | **非固定，随故事演进** |
| 状态 | 创建时定义 | **运行时动态生成** |
| 记忆 | 无 | **独立记忆系统** |
| 关系 | 简单关系 | **量子纠缠式关系** |
| 发展 | 静态 | **动态K线追踪** |

### 3.3 女娲角色字段（非固定式）

```javascript
// 角色基础信息（创建时）
{
  id: string,
  name: string,                    // 名称
  avatar: string,                  // 头像/图标
  gender: 'male' | 'female' | 'unknown',
  role: string,                    // 职业/身份
  description: string,             // 简要描述
  
  // 核心设定（创建时定义）
  personality: string,             // 性格特征
  background: string,              // 背景故事
  goals: string[],                 // 目标列表
  fears: string[],                 // 恐惧列表
  strengths: string[],             // 优势
  weaknesses: string[],            // 弱点
  
  // 灵魂设定（核心）
  soul: {
    core: string,                  // 核心驱动力
    values: string[],              // 价值观
    taboos: string[],              // 禁忌
    speechStyle: string,           // 说话风格
  }
}

// 动态属性（随故事演进，非固定字段）
// 每次推演后自动记录
{
  attributes: {
    // 默认属性（系统预定义）
    health: number,                // 生命值 0-100
    sanity: number,               // 理智值 0-100
    wealth: number,               // 财富值 0-100
    combat: number,               // 战斗力 0-100
    
    // 故事特定属性（动态生成）
    // 例如：炒股失败后新增
    funds: number,                // 资金 0-100
    reputation: number,            // 声望 0-100
    // ... 可无限扩展
  },
  
  // K线数据（属性历史）
  klines: [
    { timestamp: Date, attributes: {...} },
    { timestamp: Date, attributes: {...} },
  ],
  
  // 独立记忆
  memories: [
    {
      id: string,
      content: string,            // 记忆内容
      timestamp: Date,            // 发生时间
      importance: number,          // 重要程度 0-10
      relatedChars: string[],     // 关联角色
      relatedEvents: string[],     // 关联事件
    }
  ],
  
  // 关系网络（量子纠缠）
  relationships: [
    {
      targetId: string,           // 关联角色ID
      type: string,                // 关系类型：朋友/敌人/家人/恋人等
      value: number,              // 关系值 -100到100
      history: [                  // 关系变化历史
        { value: number, reason: string, timestamp: Date }
      ]
    }
  ],
  
  // 当前状态
  status: {
    location: string,             // 当前所在位置
    mood: string,                 // 当前情绪
    condition: string,             // 当前状态（受伤/健康/生病等）
  }
}
```

### 3.4 女娲系统核心功能

#### 3.4.1 AI主动辅助
| 功能 | 说明 |
|------|------|
| **弥补故事线不足** | AI发现漏洞，主动建议添加/修改人物/剧情/背景 |
| **识别bug** | 逻辑异常AI检测并建议修改 |
| **主动建议** | 不等用户问，AI主动发现问题 |
| **续写建议** | 根据上下文给出续写方向 |

#### 3.4.2 量子纠缠系统
AI自动选择最有可能互动的角色对进行推演：
- 关系越密切的角色越可能互动
- 属性极端的角色（极高/极低）更容易产生冲突
- 根据世界变量（紧张度、混乱度）调整推演方向

#### 3.4.3 世界变量
| 变量 | 说明 | 影响 |
|------|------|------|
| tension | 紧张度 | 高紧张度→短句快节奏 |
| chaos | 混乱度 | 高混乱度→事件随机性增加 |
| progress | 进度 | 故事整体进度百分比 |

### 3.5 女娲系统Prompt设计

```javascript
// 推演Prompt构建
const prompt = `
你是小说世界后台模拟器。

【在场角色】
${charA.name}: ${charA.description}
  性格: ${charA.personality}
  目标: ${charA.goals.join(', ')}
  ${charA.name}的底线: ${charA.soul.taboos.join(', ')}

${charB.name}: ${charB.description}
  性格: ${charB.personality}
  目标: ${charB.goals.join(', ')}
  ${charB.name}的底线: ${charB.soul.taboos.join(', ')}

【世界状态】
紧张度: ${tension} (0-100)
混乱度: ${chaos} (0-100)
进度: ${progress}%

【叙事节奏】
${tension > 70 ? '高紧张度：使用极短急促的句子' : tension < 30 ? '低紧张度：使用长句描写环境细节' : '正常节奏：动作与对白平衡'}

【任务】
推演他们之间发生的随机微小事件。
你可以定义任何符合语境的数值属性（如：信心、士气、股价等）。

【输出格式】
严格JSON：
{
  "speaker": "说话的角色",
  "content": "事件描述（50-150字）",
  "changes": [
    {"target": "角色名或'world'", "attr": "属性名", "delta": 数值, "reason": "原因"}
  ],
  "suggested_actions": ["建议1", "建议2", "建议3"]
}
`;
```

---

## 四、创世树系统

### 4.1 定位
**宏观骨架**：定义故事大的发展方向，不涉及具体细节。

### 4.2 核心数据结构

```javascript
// 故事种子
{
  id: string,
  coreConflict: string,           // 核心冲突
  backgroundTone: string,        // 背景基调
  keyForeshadowing: string,      // 关键伏笔
  centralQuestion: string,        // 核心问题
  protagonist: string,            // 主角
  setting: string,               // 世界观设定
  stakes: string,                // 悬念/赌注
  tone: string,                  // 基调
  type: 'world_building' | 'plot' | 'character',
  status: 'active' | 'archived',
}

// 节点
{
  id: string,
  seedId: string,                // 所属种子
  parentId: string | null,       // 父节点
  
  type: 'root' | 'plot_twist' | 'cliffhanger' | 'ending' | 'foreshadow',
  label: string,                 // 节点标题
  description: string,            // 详细描述
  
  position: { x: number, y: number },  // 画布位置
  
  // 事件分析
  temperature: number,           // 事件温度 0-1
  logicScore: number,            // 顺理成章评分 0-10
  
  // 统计
  depth: number,                 // 深度（层级）
  childrenCount: number,         // 子节点数
  
  // 元数据
  metadata: {
    relatedCharacters: string[],  // 关联角色
    relatedLocations: string[],   // 关联地点
    importance: number,           // 重要性 1-10
    status: 'draft' | 'active' | 'completed',
  }
}

// 边（节点连接）
{
  id: string,
  sourceId: string,              // 源节点
  targetId: string,              // 目标节点
  type: 'default' | 'cause' | 'effect' | 'contrast',
  label: string,                 // 关系标签
}
```

### 4.3 创世树 + 女娲的协作

```
用户描述想法
     ↓
创世树：创建新节点（宏观故事走向）
     ↓
女娲推演：细化该节点（角色如何反应）
     ↓
用户确认/修改
     ↓
循环...
```

---

## 五、事件线系统

### 5.1 定位
**时间轴**：按时间顺序展示所有事件。

### 5.2 事件字段

```javascript
{
  id: string,
  content: string,               // 事件内容
  speaker: string,               // 叙述者
  
  // 变更记录
  changes: [
    {
      target: string,            // 角色ID或'world'
      attr: string,              // 属性名
      delta: number,             // 变化值
      reason: string,            // 变化原因
    }
  ],
  
  // 关联
  relatedNodes: string[],        // 关联的创世树节点
  relatedCharacters: string[],   // 关联的角色
  
  // 分析
  temperature: number,           // 事件温度 0-1
  impact: number,               // 影响程度 0-10
  
  timestamp: Date,               // 事件发生时间
  createdAt: Date,              // 记录创建时间
}
```

---

## 六、地图系统

### 6.1 定位
**世界可视化**：从大到小缩放，可定位、可传送。

### 6.2 功能需求

| 功能 | 说明 |
|------|------|
| **缩放** | 世界→国家→城市→建筑→房间 |
| **定位** | 精确定位角色/事件位置 |
| **传送** | 快速跳转到任意位置 |
| **标注** | 在地图上标注重要事件 |
| **路径** | 显示角色移动轨迹 |

### 6.3 参考系统
- 易制地图
- 上帝模拟器
- 游戏地图（可伸缩）

---

## 七、AI辅助功能

### 7.1 自动生成

| 类型 | 触发方式 | 功能 |
|------|----------|------|
| **AI辅助生成** | 用户输入描述 | AI生成角色/物品/地点 |
| **AI随机生成** | 点击随机 | AI随机生成角色/物品/地点 |
| **AI批量生成** | 批量输入 | 一键生成多个变体 |

### 7.2 AI主动辅助

| 功能 | 说明 |
|------|------|
| **漏洞检测** | 检测故事逻辑漏洞 |
| **建议完善** | 建议添加人物/剧情/背景 |
| **异常提醒** | 发现角色行为异常 |
| **续写建议** | 给出后续发展建议 |

---

## 八、数据表设计

### 8.1 核心表

```sql
-- 书本
CREATE TABLE books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover TEXT,
  status TEXT DEFAULT 'active',
  createdAt TEXT,
  updatedAt TEXT
);

-- 角色（普通）
CREATE TABLE roles (
  id TEXT PRIMARY KEY,
  bookId TEXT,
  name TEXT NOT NULL,
  gender TEXT DEFAULT 'unknown',
  role TEXT,
  description TEXT,
  attributes TEXT DEFAULT '{}',
  relationships TEXT DEFAULT '[]',
  metadata TEXT DEFAULT '{}',
  status TEXT DEFAULT 'active',
  FOREIGN KEY (bookId) REFERENCES books(id)
);

-- 物品
CREATE TABLE items (
  id TEXT PRIMARY KEY,
  bookId TEXT,
  name TEXT NOT NULL,
  type TEXT,
  rarity TEXT,
  description TEXT,
  ownerId TEXT,
  metadata TEXT DEFAULT '{}',
  FOREIGN KEY (bookId) REFERENCES books(id)
);

-- 地点
CREATE TABLE locations (
  id TEXT PRIMARY KEY,
  bookId TEXT,
  name TEXT NOT NULL,
  type TEXT,
  parentId TEXT,
  description TEXT,
  metadata TEXT DEFAULT '{}',
  FOREIGN KEY (bookId) REFERENCES books(id)
);

-- 章节
CREATE TABLE chapters (
  id TEXT PRIMARY KEY,
  bookId TEXT,
  title TEXT,
  content TEXT,
  orderIndex INTEGER,
  status TEXT DEFAULT 'draft',
  FOREIGN KEY (bookId) REFERENCES books(id)
);

-- 创世树种子
CREATE TABLE genesis_seeds (
  id TEXT PRIMARY KEY,
  bookId TEXT,
  coreConflict TEXT,
  backgroundTone TEXT,
  keyForeshadowing TEXT,
  centralQuestion TEXT,
  protagonist TEXT,
  setting TEXT,
  stakes TEXT,
  tone TEXT,
  type TEXT DEFAULT 'world_building',
  status TEXT DEFAULT 'active',
  FOREIGN KEY (bookId) REFERENCES books(id)
);

-- 创世树节点
CREATE TABLE genesis_nodes (
  id TEXT PRIMARY KEY,
  seedId TEXT,
  parentId TEXT,
  type TEXT DEFAULT 'plot_twist',
  label TEXT,
  description TEXT,
  positionX REAL DEFAULT 0,
  positionY REAL DEFAULT 0,
  temperature REAL DEFAULT 0.5,
  logicScore REAL DEFAULT 5,
  depth INTEGER DEFAULT 0,
  childrenCount INTEGER DEFAULT 0,
  metadata TEXT DEFAULT '{}',
  status TEXT DEFAULT 'active',
  FOREIGN KEY (seedId) REFERENCES genesis_seeds(id)
);

-- 创世树边
CREATE TABLE genesis_edges (
  id TEXT PRIMARY KEY,
  seedId TEXT,
  sourceId TEXT,
  targetId TEXT,
  type TEXT DEFAULT 'default',
  label TEXT,
  metadata TEXT DEFAULT '{}',
  FOREIGN KEY (seedId) REFERENCES genesis_seeds(id)
);

-- 女娲角色（活的状态）
CREATE TABLE nvwa_souls (
  id TEXT PRIMARY KEY,
  bookId TEXT,
  name TEXT NOT NULL,
  gender TEXT DEFAULT 'unknown',
  role TEXT,
  description TEXT,
  
  -- 核心设定（创建时）
  personality TEXT,
  background TEXT,
  goals TEXT DEFAULT '[]',
  fears TEXT DEFAULT '[]',
  strengths TEXT DEFAULT '[]',
  weaknesses TEXT DEFAULT '[]',
  
  -- 灵魂设定
  soul TEXT DEFAULT '{}',
  
  -- 动态数据（随故事演进）
  attributes TEXT DEFAULT '{}',     -- 非固定字段
  klines TEXT DEFAULT '[]',       -- K线历史
  memories TEXT DEFAULT '[]',      -- 独立记忆
  relationships TEXT DEFAULT '[]', -- 关系网络
  status TEXT DEFAULT 'active',
  
  FOREIGN KEY (bookId) REFERENCES books(id)
);

-- 女娲K线历史
CREATE TABLE nvwa_souls_klines (
  id TEXT PRIMARY KEY,
  soulId TEXT,
  attributes TEXT,
  timestamp TEXT,
  FOREIGN KEY (soulId) REFERENCES nvwa_souls(id)
);

-- 女娲记忆
CREATE TABLE nvwa_memories (
  id TEXT PRIMARY KEY,
  soulId TEXT,
  content TEXT,
  timestamp TEXT,
  importance INTEGER DEFAULT 5,
  relatedChars TEXT DEFAULT '[]',
  relatedEvents TEXT DEFAULT '[]',
  FOREIGN KEY (soulId) REFERENCES nvwa_souls(id)
);

-- 世界变量
CREATE TABLE nvwa_world_vars (
  id TEXT PRIMARY KEY,
  bookId TEXT,
  key TEXT UNIQUE NOT NULL,
  value REAL DEFAULT 50,
  reason TEXT,
  source TEXT DEFAULT 'ai',
  updatedAt TEXT,
  FOREIGN KEY (bookId) REFERENCES books(id)
);

-- 事件记录
CREATE TABLE nvwa_events (
  id TEXT PRIMARY KEY,
  bookId TEXT,
  content TEXT,
  speaker TEXT DEFAULT '旁白',
  changes TEXT DEFAULT '[]',
  relatedNodes TEXT DEFAULT '[]',
  relatedCharacters TEXT DEFAULT '[]',
  temperature REAL DEFAULT 0.5,
  impact REAL DEFAULT 5,
  timestamp TEXT,
  createdAt TEXT,
  FOREIGN KEY (bookId) REFERENCES books(id)
);

-- 地图
CREATE TABLE maps (
  id TEXT PRIMARY KEY,
  bookId TEXT,
  name TEXT,
  type TEXT,                      -- world/country/city/building/room
  parentId TEXT,
  bounds TEXT,                    -- 边界坐标
  metadata TEXT DEFAULT '{}',
  FOREIGN KEY (bookId) REFERENCES books(id)
);
```

---

## 九、API设计

### 9.1 原则
每个功能模块必须开放完整的CRUD API：
- POST /api/xxx/create - 创建
- POST /api/xxx/list - 查询列表
- POST /api/xxx/get - 获取单个
- POST /api/xxx/update - 更新
- POST /api/xxx/delete - 删除

### 9.2 核心API

| 模块 | API | 说明 |
|------|-----|------|
| Books | /api/books/* | 书本CRUD |
| Roles | /api/roles/* | 普通角色CRUD |
| Items | /api/items/* | 物品CRUD |
| Locations | /api/locations/* | 地点CRUD |
| Chapters | /api/chapters/* | 章节CRUD |
| Genesis | /api/genesis/* | 创世树CRUD + tree |
| Nvwa | /api/nvwa/* | 女娲角色CRUD + tick |
| Maps | /api/maps/* | 地图CRUD |
| AI | /api/ai/* | AI辅助生成、检测 |

### 9.3 女娲核心API

```javascript
// 创建角色
POST /api/nvwa/create
{
  name: string,
  gender: string,
  role: string,
  description: string,
  personality: string,
  background: string,
  goals: string[],
  fears: string[],
  soul: { core, values, taboos, speechStyle }
}

// 运行推演
POST /api/nvwa/tick
{
  bookId: string,
  enableIntentEngine: boolean  // 是否启用意图引擎
}
// 返回: { success, event, worldVars, tension }

// 更新角色属性（故事演进后）
POST /api/nvwa/update
{
  id: string,
  attributes: { [key: string]: number },  // 动态属性
  memories: [{ content, importance }],
  relationships: [{ targetId, type, value }]
}

// AI辅助建议
POST /api/nvwa/suggest
{
  bookId: string,
  context: 'plot_hole' | 'character_issue' | 'background_missing'
}
// 返回: { suggestions: [...] }
```

---

## 十、页面设计

### 10.1 首页（书架）
- 书本列表（卡片形式）
- 创建/导入书本
- 地图入口
- 世界观入口

### 10.2 创世树页面
- 左侧：种子配置（核心冲突、背景等）
- 中间：树状图画布（可拖拽节点）
- 右侧：节点详情（标题、描述、温度、类型）
- 顶部：工具栏（创建节点、自动布局、保存）

### 10.3 女娲推演页面
- 左侧：角色列表（卡片形式）
- 中间：
  - 上部：K线图（角色属性变化曲线）
  - 下部：事件流（推演历史）
- 右侧：
  - 角色详情（基础信息 + 动态属性 + 记忆）
  - 世界变量（紧张度、混乱度、进度）
- 顶部：工具栏（添加角色、运行推演、重置）

### 10.4 事件线页面
- 时间轴形式展示所有事件
- 每个事件显示：时间、内容、温度、影响
- 可按角色/地点筛选

### 10.5 小说详写页面
- 左侧：章节列表
- 中间：富文本编辑器
- 右侧：角色参考、物品参考、地点参考

### 10.6 地图页面
- 可缩放地图
- 左上角：缩放控制
- 点击位置显示详情
- 可标注角色位置

---

## 十一、开发优先级

### Phase 1: 基础框架
- [ ] Books CRUD
- [ ] 基础页面结构
- [ ] 路由系统

### Phase 2: 创世树
- [ ] 种子CRUD
- [ ] 节点CRUD
- [ ] 可视化画布
- [ ] 连线和布局

### Phase 3: 女娲核心
- [ ] 角色CRUD
- [ ] 动态属性系统
- [ ] K线追踪
- [ ] 记忆系统
- [ ] 量子纠缠推演

### Phase 4: AI辅助
- [ ] AI生成角色/物品/地点
- [ ] 漏洞检测
- [ ] 主动建议

### Phase 5: 高级功能
- [ ] 事件线
- [ ] 地图系统
- [ ] 小说详写编辑器

---

## 十二、待确认问题

1. [ ] 女娲角色的attributes字段是否有上限？
2. [ ] 地图缩放层级数是否固定？
3. [ ] AI推演是否需要人工确认后再更新属性？
4. [ ] 多Agent并发操作同一本书如何处理？

---

*最后更新：2026-04-11 21:40*
