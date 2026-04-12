# SoulWriter 绘梦系统 - 产品设计文档

> 版本：v1.2 | 日期：2026-04-11 | 状态：待开发

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
| AI写到后面乱套 | **角色独立人格+记忆系统** |

### 1.3 女娲系统的独特价值
> **每个角色 = 独立人格 + 独立记忆 + 动态属性的Agent**
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
│  │          │  │              主体区域                      │   │
│  │ 角色     │  │         （显示当前页面内容）                 │   │
│  │ 物品     │  │                                            │   │
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
| **女娲推演** | 微观血肉 | 角色Agent、**激活参数**、记忆系统、AI主动辅助 |
| **小说详写** | 输出 | 章节内容创作、富文本编辑 |
| **辅助系统** | 支持 | 提示词管理、世界观设定 |

---

## 三、女娲推演系统（核心）

### 3.1 设计理念

**核心理念**：角色是"活"的，有发展变化曲线，随故事发展而演进。

> 酒馆 = 角色对话
> 女娲 = 角色Agent化（独立人格+独立记忆+动态属性）

### 3.2 女娲角色 vs 普通角色

| 维度 | 普通角色 | 女娲角色 |
|------|---------|---------|
| 属性 | 固定字段 | **动态激活，按需生成** |
| 状态 | 创建时定义 | **运行时动态生成** |
| 记忆 | 无 | **独立记忆系统** |
| 关系 | 简单关系 | **量子纠缠式关系** |
| 发展 | 静态 | **动态K线追踪** |

### 3.3 激活参数系统（核心创新）

#### 3.3.1 什么是激活参数？

```
【传统方式】预设100个固定属性
health, sanity, wealth, combat, luck, fortune, charm, intelligence...

【女娲方式】激活参数（按需激活）
1. 场景中涉及什么，AI分析并激活对应参数
2. 不需要的参数处于休眠状态
3. 参数可以动态新增（之前没想过的新属性）
```

#### 3.3.2 参数激活示例

```
场景1：角色中彩票
  ↓ AI分析
  激活：财富指数 (+50)
  激活：与兑奖员的关系
  激活：兴奋程度

场景2：角色长期运气差
  ↓ 检测到运气指数持续低于20
  彩蛋触发：运气指数微调 +5（补偿机制）
  
场景3：角色失眠
  激活：睡眠时间
  激活：焦虑程度
  激活：精神状态
```

#### 3.3.3 参数分类

| 类型 | 说明 | 示例 |
|------|------|------|
| **基础参数** | 默认存在 | health, sanity |
| **剧情参数** | 故事相关 | wealth, reputation, strength |
| **关系参数** | 与他角色关系 | rel_zhangsan (+10/-10) |
| **状态参数** | 临时状态 | mood, energy, hunger |
| **隐藏参数** | 彩蛋机制 | luck_bonus (长期倒霉触发) |

#### 3.3.4 数据结构

```javascript
// 女娲角色
{
  id: string,
  name: string,
  
  // 基础信息
  avatar: string,
  gender: string,
  role: string,
  description: string,
  
  // 核心设定（固定）
  personality: string,
  background: string,
  goals: string[],
  fears: string[],
  strengths: string[],
  weaknesses: string[],
  soul: {
    core: string,
    values: string[],
    taboos: string[],
    speechStyle: string,
  },
  
  // 激活参数系统（核心）
  activeParams: {
    // 键值对，动态增删
    [paramName: string]: {
      value: number,           // 当前值
      baseValue: number,       // 基础值
      delta: number,           // 本次变化
      reason: string,          // 变化原因
      lastUpdate: timestamp,   // 上次更新
    }
  },
  
  // 关系网络（特殊：target作为键）
  relationships: {
    [targetCharId: string]: {
      type: string,            // 关系类型
      value: number,           // 关系值 -100~100
      history: [               // 变化历史
        { value, reason, timestamp }
      ]
    }
  },
  
  // 独立记忆
  memories: [
    {
      id: string,
      content: string,
      timestamp: Date,
      importance: number,       // 0-10
      emotions: string[],       // 相关情绪
      relatedChars: string[],
    }
  ],
  
  // 当前状态
  status: {
    location: string,
    mood: string,
    condition: string,
  }
}
```

### 3.4 记忆系统设计（参考Letta + MemGPT）

#### 3.4.1 分层记忆架构（Token优化）

参考了Letta和MemGPT的Agent记忆架构，设计如下：

```
┌─────────────────────────────────────────────────────┐
│           消息缓冲区（Message Buffer）               │
│  ─────────────────────────────────────────────────  │
│  最近N条对话/事件（自动淘汰旧内容）                 │
│  约 2000-4000 tokens                              │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│           核心记忆块（Core Memory Blocks）          │
│  ─────────────────────────────────────────────────  │
│  角色核心设定（人格、背景、目标、禁忌）              │
│  当前状态摘要（关系值、位置、情绪）                 │
│  约 1000-2000 tokens                              │
└─────────────────────────────────────────────────────┘
                         ↓ 按需检索
┌─────────────────────────────────────────────────────┐
│           召回记忆（Recall Memory）                  │
│  ─────────────────────────────────────────────────  │
│  近期重要记忆索引（摘要）                           │
│  约 500-1000 tokens                               │
└─────────────────────────────────────────────────────┘
                         ↓ 懒加载
┌─────────────────────────────────────────────────────┐
│           归档记忆（Archival Memory）                │
│  ─────────────────────────────────────────────────  │
│  完整记忆历史，向量检索                             │
│  存储在向量数据库（Qdrant/Milvus）                  │
└─────────────────────────────────────────────────────┘
```

#### 3.4.2 Token优化策略

| 策略 | 说明 | 节省 |
|------|------|------|
| **智能淘汰** | 只淘汰部分消息(70%)，保证连续性 | ~40% |
| **递归摘要** | 旧记忆逐步压缩为摘要 | ~50% |
| **记忆分块** | 核心记忆固定位置，可编辑 | 可控 |
| **懒加载** | 历史记忆按需检索 | ~80% |
| **滑动窗口** | 只保留近期N条详细记忆 | 可控 |

#### 3.4.3 记忆淘汰算法

```javascript
// 当消息缓冲区满时，执行智能淘汰
async function evictAndSummarize(messages, maxTokens = 4000) {
  // 1. 识别重要消息（高权重）
  const importantMessages = messages.filter(m => 
    m.importance > 5 || 
    m.containsDecision ||
    m.relationshipChange
  );
  
  // 2. 保留最近70%消息
  const keepCount = Math.floor(messages.length * 0.7);
  const recentMessages = messages.slice(-keepCount);
  
  // 3. 摘要已淘汰的消息
  const evictedMessages = messages.slice(0, -keepCount);
  if (evictedMessages.length > 0) {
    const summary = await summarize(evictedMessages);
    await storeAsArchival(summary);
  }
  
  return recentMessages;
}
```

#### 3.4.4 Prompt压缩示例

```javascript
// 压缩前（完整数据）
const charData = {
  name: "张三",
  attributes: { health: 80, sanity: 60, wealth: 30, combat: 50, ... 100个属性 },
  memories: [100条完整记忆],
  relationships: [20个角色的详细关系],
  ...全部数据
}

// 压缩后（实际发送）
const charPrompt = `
角色：张三
状态摘要：健康(80), 理智偏低(60), 较贫困(30), 战斗力中等(50)
关系：[李四:+10, 王五:-5, 赵六:+20]
近期记忆：(1)与李四喝酒聊天 (2)获得神秘地图碎片 (3)发现王五的可疑行为
当前：在酒楼用餐，心情愉悦
`;
```

### 3.5 量子纠缠推演

#### 3.5.1 角色选择算法

```javascript
// 选择最可能互动的角色对
function selectInteractionPair(characters) {
  let bestPair = null;
  let maxScore = -Infinity;
  
  for (const charA of characters) {
    for (const charB of characters) {
      if (charA.id === charB.id) continue;
      
      let score = 0;
      
      // 1. 关系评分（关系越强/越对立，分数越高）
      const relValue = charA.relationships[charB.id]?.value || 0;
      score += Math.abs(relValue) * 1.5;
      if (relValue > 50) score += 20;  // 亲密关系加分
      if (relValue < -50) score += 20; // 敌对关系加分
      
      // 2. 属性极端评分（极端值更容易产生戏剧冲突）
      for (const [key, param] of Object.entries(charA.activeParams)) {
        if (param.value > 80 || param.value < 20) {
          score += 10; // 属性极端加分
        }
      }
      
      // 3. 位置评分（同地点更容易互动）
      if (charA.status.location === charB.status.location) {
        score += 15;
      }
      
      // 4. 世界变量加成
      score += worldVars.tension * 0.1; // 高紧张度增加互动概率
      score += worldVars.chaos * 0.1;  // 高混乱度增加随机性
      
      // 5. 记忆触发（最近有交集的角色更容易互动）
      const hasRecentInteraction = charA.memories.some(m => 
        m.relatedChars.includes(charB.id) && 
        (Date.now() - m.timestamp) < 7 * 24 * 60 * 60 * 1000 // 7天内
      );
      if (hasRecentInteraction) score += 25;
      
      if (score > maxScore) {
        maxScore = score;
        bestPair = { charA, charB, score };
      }
    }
  }
  
  return bestPair;
}
```

#### 3.5.2 推演流程

```
1. 选择角色对（量子纠缠算法）
      ↓
2. 构建Prompt（压缩后的状态+记忆）
      ↓
3. AI生成事件（角色互动+参数变化）
      ↓
4. 解析结果（更新参数+记忆）
      ↓
5. 检查彩蛋（长期低值触发补偿）
      ↓
6. 返回结果
```

### 3.6 AI主动辅助

| 功能 | 说明 |
|------|------|
| **弥补故事线不足** | AI发现漏洞，主动建议添加/修改人物/剧情/背景 |
| **识别bug** | 逻辑异常AI检测并建议修改 |
| **彩蛋触发** | 长期极端状态触发补偿机制 |
| **主动建议** | 不等用户问，AI主动发现问题 |

### 3.7 世界变量

| 变量 | 说明 | 影响 |
|------|------|------|
| tension | 紧张度 | 高→短句快节奏，影响角色选择 |
| chaos | 混乱度 | 高→随机事件增加，影响推演 |
| progress | 进度 | 故事整体进度，影响结局触发 |

---

## 四、创世树系统

### 4.1 定位
**宏观骨架**：定义故事大的发展方向，不涉及具体细节。

### 4.2 数据结构

```javascript
// 故事种子
{
  id: string,
  bookId: string,
  coreConflict: string,           // 核心冲突
  backgroundTone: string,        // 背景基调
  keyForeshadowing: string,      // 关键伏笔
  centralQuestion: string,        // 核心问题
  protagonist: string,           // 主角
  setting: string,              // 世界观设定
  stakes: string,                // 悬念/赌注
  tone: string,                 // 基调
  type: 'world_building' | 'plot' | 'character',
}

// 节点
{
  id: string,
  seedId: string,
  parentId: string | null,
  
  type: 'root' | 'plot_twist' | 'cliffhanger' | 'ending' | 'foreshadow',
  label: string,
  description: string,
  
  position: { x, y },
  
  // 事件分析
  temperature: number,           // 0-1
  logicScore: number,            // 0-10
  
  depth: number,
  childrenCount: number,
  
  metadata: {
    relatedCharacters: string[],
    importance: number,         // 1-10
    status: 'draft' | 'active' | 'completed',
  }
}

// 边
{
  id: string,
  sourceId: string,
  targetId: string,
  type: 'default' | 'cause' | 'effect' | 'contrast',
  label: string,
}
```

---

## 五、地图系统

### 5.1 定位
**世界可视化**：从大到小缩放，可定位、可传送。

### 5.2 层级结构

```
宇宙 (Universe)
  └── 星域 (Star Domain)
        └── 星球 (Planet)
              └── 地域 (Region)
                    └── 城市 (City)
                          └── 室内 (Indoor)
                                └── 房间 (Room)
```

### 5.3 功能需求

| 功能 | 说明 |
|------|------|
| **缩放** | 从宇宙到房间，多级缩放 |
| **定位** | 精确定位角色/事件位置 |
| **传送** | 快速跳转到任意位置 |
| **标注** | 在地图上标注重要事件 |
| **路径** | 显示角色移动轨迹 |

### 5.4 数据结构

```javascript
{
  id: string,
  name: string,
  type: 'universe' | 'domain' | 'planet' | 'region' | 'city' | 'indoor' | 'room',
  parentId: string | null,
  bookId: string,
  
  // 地图数据
  bounds: { minX, minY, maxX, maxY },
  center: { x, y },
  zoom: number,
  
  // 内容
  description: string,
  characters: string[],          // 在此地点的角色
  events: string[],              // 发生的事件
  items: string[],               // 物品
  
  // 样式
  style: {
    color: string,
    icon: string,
  },
  
  children: string[],            // 子地点ID
}
```

---

## 六、事件线系统

### 6.1 定位
**时间轴**：按时间顺序展示所有事件。

### 6.2 事件字段

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

## 七、数据表设计

### 7.1 核心表

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

-- 女娲角色（核心）
CREATE TABLE nvwa_souls (
  id TEXT PRIMARY KEY,
  bookId TEXT,
  name TEXT NOT NULL,
  gender TEXT DEFAULT 'unknown',
  role TEXT,
  description TEXT,
  
  -- 核心设定
  personality TEXT,
  background TEXT,
  goals TEXT DEFAULT '[]',
  fears TEXT DEFAULT '[]',
  strengths TEXT DEFAULT '[]',
  weaknesses TEXT DEFAULT '[]',
  soul TEXT DEFAULT '{}',
  
  -- 动态数据
  activeParams TEXT DEFAULT '{}',     -- 激活参数
  relationships TEXT DEFAULT '{}',    -- 关系网络
  memories TEXT DEFAULT '[]',         -- 记忆列表
  status TEXT DEFAULT 'active',
  
  FOREIGN KEY (bookId) REFERENCES books(id)
);

-- 女娲记忆
CREATE TABLE nvwa_memories (
  id TEXT PRIMARY KEY,
  soulId TEXT,
  content TEXT,
  timestamp TEXT,
  importance INTEGER DEFAULT 5,
  emotions TEXT DEFAULT '[]',
  relatedChars TEXT DEFAULT '[]',
  summary TEXT,                      -- 压缩摘要
  FOREIGN KEY (soulId) REFERENCES nvwa_souls(id)
);

-- 世界变量
CREATE TABLE nvwa_world_vars (
  id TEXT PRIMARY KEY,
  bookId TEXT,
  key TEXT UNIQUE NOT NULL,
  value REAL DEFAULT 50,
  reason TEXT,
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
  activatedParams TEXT DEFAULT '{}',
  temperature REAL DEFAULT 0.5,
  impact REAL DEFAULT 5,
  timestamp TEXT,
  FOREIGN KEY (bookId) REFERENCES books(id)
);

-- 地图
CREATE TABLE maps (
  id TEXT PRIMARY KEY,
  bookId TEXT,
  parentId TEXT,
  name TEXT,
  type TEXT,
  bounds TEXT,
  center TEXT,
  description TEXT,
  metadata TEXT DEFAULT '{}',
  FOREIGN KEY (bookId) REFERENCES books(id)
);

-- 创世树
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
  FOREIGN KEY (bookId) REFERENCES books(id)
);

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
  depth INTEGER DEFAULT 0,
  childrenCount INTEGER DEFAULT 0,
  metadata TEXT DEFAULT '{}',
  FOREIGN KEY (seedId) REFERENCES genesis_seeds(id)
);

CREATE TABLE genesis_edges (
  id TEXT PRIMARY KEY,
  seedId TEXT,
  sourceId TEXT,
  targetId TEXT,
  type TEXT DEFAULT 'default',
  label TEXT,
  FOREIGN KEY (seedId) REFERENCES genesis_seeds(id)
);
```

---

## 八、API设计

### 8.1 核心API

| 模块 | API | 说明 |
|------|-----|------|
| Books | /api/books/* | 书本CRUD |
| Nvwa | /api/nvwa/* | 女娲核心API |
| Genesis | /api/genesis/* | 创世树API |
| Maps | /api/maps/* | 地图API |

### 8.2 女娲核心API

```javascript
// 创建角色
POST /api/nvwa/create
{
  name: string,
  gender: string,
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
  enableIntentEngine: boolean
}

// 批量更新角色
POST /api/nvwa/batchUpdate
{
  updates: [
    { id, activeParams: {}, memories: [], relationships: {} }
  ]
}

// 获取角色状态（压缩版）
POST /api/nvwa/getState
{
  id: string,
  includeMemories: 'summary' | 'recent' | 'all'
}

// 检索记忆
POST /api/nvwa/retrieveMemories
{
  soulId: string,
  query: string,
  limit: number
}

// AI建议
POST /api/nvwa/suggest
{
  bookId: string,
  type: 'plot_hole' | 'character_issue' | '彩蛋触发'
}
```

---

## 九、开发优先级

### Phase 1: 基础框架
- [ ] Books CRUD + 书架UI
- [ ] 基础页面结构 + 路由
- [ ] 女娲角色基础CRUD

### Phase 2: 女娲核心
- [ ] 激活参数系统
- [ ] 记忆分层系统
- [ ] 量子纠缠推演
- [ ] Token优化实现

### Phase 3: 创世树
- [ ] 种子管理
- [ ] 节点CRUD + 可视化
- [ ] 与女娲联动

### Phase 4: 地图系统
- [ ] 层级结构
- [ ] 缩放/定位/传送
- [ ] 角色位置管理

### Phase 5: AI辅助
- [ ] AI生成角色/物品/地点
- [ ] 漏洞检测
- [ ] 主动建议

---

## 十、参考系统（已研究）

| 系统 | 参考点 |
|------|--------|
| **Letta** | Agent记忆分三层：Message Buffer / Core Memory / Recall Memory |
| **MemGPT** | 内存淘汰策略：只淘汰70%保证连续性，递归摘要 |
| **Jenova AI** | 角色一致性、无限记忆、多模型支持 |
| **SillyTavern** | Token优化、角色记忆管理 |
| **Scarlet Hollow** | 动态关系系统（多维度关系值） |
| **JRPG情感系统** | 亲和度机制、关系随时间变化 |

---

*最后更新：2026-04-11 22:10*
