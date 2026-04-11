# 绘梦SoulWriter - 推演引擎增强方案

> **创建时间**：2026-04-11
> **基于**：InkOS + StoryWriter + MM-StoryAgent + MiroFish研究

---

## 一、核心定位

### 绘梦的"预测" vs MiroFish

| 项目 | MiroFish | 绘梦 |
|------|----------|------|
| **预测基础** | 真实数据 + 公众舆论 | 故事背景 + 设定 + 人物 + 作者想法 |
| **演变逻辑** | 社会动力学模拟 | 角色行为 + 剧情发展 |
| **核心目标** | 预测现实世界 | 推演故事未来 |

**绘梦的推演核心**：
```
故事背景 → 设定 → 人物 → 作者想法 → 剧情演变 → 新的故事
```

---

## 二、参考项目核心功能

### 1. InkOS - 33维度审计

| 维度 | 说明 |
|------|------|
| Character Memory | 角色记忆一致性 |
| Resource Continuity | 资源连续性 |
| Hook Payoff | 伏笔回收 |
| Narrative Pacing | 叙事节奏 |
| Outline Adherence | 大纲遵循 |
| ... | 共33个维度 |

### 2. StoryWriter - 三阶段流程

```
Outline Agent → Planning Agent → Writing Agent
   生成大纲      分解章节      动态压缩历史生成
```

### 3. MM-StoryAgent - 多模态

```
故事写作 → 图像生成 → 语音合成 → 音乐 → 视频
```

### 4. MiroFish - 群体模拟

```
输入场景 → 生成千个AI角色 → 模拟互动 → 输出预测报告
```

---

## 三、绘梦推演引擎架构

### 女娲推演引擎 v2.0

```
┌─────────────────────────────────────────────────┐
│                 女娲推演引擎 v2.0                    │
├─────────────────────────────────────────────────┤
│  输入层                                           │
│  ├── 故事背景 (Background)                       │
│  ├── 世界设定 (Settings)                         │
│  ├── 角色灵魂 (Soul Matrix)                     │
│  ├── 作者意图 (Author Intent)                   │
│  └── 当前剧情 (Current Plot)                    │
├─────────────────────────────────────────────────┤
│  推演层                                           │
│  ├── 角色行为预测 (Character Behavior)            │
│  ├── 关系演变 (Relationship Evolution)            │
│  ├── 世界状态更新 (World State)                  │
│  └── 剧情分支生成 (Plot Branching)               │
├─────────────────────────────────────────────────┤
│  审计层 (参考InkOS)                             │
│  ├── 33维度审计 (Continuity Auditor)             │
│  ├── Human Review Gate                           │
│  └── 质量评分 (Quality Score)                   │
├─────────────────────────────────────────────────┤
│  输出层                                           │
│  ├── 创世树更新 (Genesis Tree)                   │
│  ├── 新章节草稿 (Chapter Draft)                 │
│  └── 伏笔提示 (Hook Hints)                     │
└─────────────────────────────────────────────────┘
```

---

## 四、33维度审计清单

### 角色维度 (8个)
| 维度 | 说明 |
|------|------|
| Character_Memory | 角色记忆一致性 |
| Character_Goal | 目标连贯性 |
| Character_Motivation | 动机合理性 |
| Character_Emotion | 情感变化 |
| Character_Skill | 技能使用 |
| Character_Relationship | 关系变化 |
| Character_Appearance | 外貌描述 |
| Character_Voice | 角色语气 |

### 剧情维度 (8个)
| 维度 | 说明 |
|------|------|
| Plot_Causality | 因果逻辑 |
| Plot_Pacing | 节奏把控 |
| Plot_Hook | 钩子设置 |
| Plot_Payoff | 伏笔回收 |
| Plot_Tension | 张力曲线 |
| Plot_Climax | 高潮设计 |
| Plot_Resolution | 结局收束 |
| Plot_Subplot | 支线呼应 |

### 世界维度 (8个)
| 维度 | 说明 |
|------|------|
| World_Rules | 世界规则一致性 |
| World_Geography | 地理连贯 |
| World_Timeline | 时间线 |
| World_Economy | 经济逻辑 |
| World_Politics | 政治格局 |
| World_Culture | 文化背景 |
| World_Technology | 科技水平 |
| World_Magic | 魔法/超能力规则 |

### 资源维度 (5个)
| 维度 | 说明 |
|------|------|
| Resource_Inventory | 物品清单 |
| Resource_Currency | 货币体系 |
| Resource_Power | 力量体系 |
| Resource_Information | 信息传递 |
| Resource_Status | 地位变化 |

### 风格维度 (4个)
| 维度 | 说明 |
|------|------|
| Style_Tone | 整体基调 |
| Style_Language | 语言风格 |
| Style_Narration | 叙事视角 |
| Style_Dialogue | 对话风格 |

---

## 五、Human Review Gate

### 流程

```
推演完成 → 审计评分 → 等待审核 → 通过/修改/拒绝
                                    ↓
                              进入下一节点
```

### 审核点

| 节点 | 审核内容 |
|------|----------|
| 角色创建 | 性格/动机/背景 |
| 关系建立 | 连接合理性 |
| 剧情转折 | 因果逻辑 |
| 章节完成 | 整体质量 |

---

## 六、故事演变推演算法

### 核心输入

```javascript
{
  "background": "赛博朋克世界，AI觉醒",
  "settings": {
    "techLevel": "high",
    "socialStructure": "corporate_dystopia"
  },
  "characters": [
    {
      "id": "char_001",
      "name": "主角",
      "soul": { "core": "反抗", "fear": "失去记忆" },
      "relationships": [{ "target": "char_002", "type": "ally" }]
    }
  ],
  "authorIntent": "探讨AI意识觉醒",
  "currentPlot": {
    "node": "节点ID",
    "summary": "主角发现AI异常"
  }
}
```

### 推演输出

```javascript
{
  "predictions": [
    {
      "type": "character_behavior",
      "character": "char_001",
      "behavior": "主动调查AI异常源头",
      "confidence": 0.85,
      "reasoning": "基于角色核心'反抗'和当前处境"
    },
    {
      "type": "relationship_change",
      "from": { "char_001": "char_002": "ally" },
      "to": { "char_001": "char_002": "rival" },
      "trigger": "利益冲突"
    }
  ],
  "newPlotNodes": [
    {
      "label": "主角深入调查",
      "type": "plot_development"
    }
  ],
  "hooks": [
    { "id": "hook_001", "setup": "AI低语", "payoffAt": "第三章" }
  ],
  "worldChanges": [
    { "aspect": "AI_awareness", "value": 15, "delta": "+5" }
  ]
}
```

---

## 七、开发优先级

### Phase 1: 核心推演 (高优先级)
- [ ] 增强女娲推演引擎输入层
- [ ] 实现角色行为预测
- [ ] 实现关系演变
- [ ] 实现世界状态更新

### Phase 2: 审计系统 (高优先级)
- [ ] 33维度审计清单
- [ ] 审计评分算法
- [ ] Human Review Gate

### Phase 3: 创世树集成 (中优先级)
- [ ] 推演结果→创世树节点
- [ ] 分支生成
- [ ] 伏笔追踪

### Phase 4: 多模态 (低优先级)
- [ ] 图像生成
- [ ] 语音合成
- [ ] 视频制作

---

## 八、技术实现

### 数据库扩展

```sql
-- 审计记录
CREATE TABLE nvwa_audits (
  id TEXT PRIMARY KEY,
  nodeId TEXT,
  dimensions TEXT,  -- JSON 33维度评分
  totalScore REAL,
  status TEXT,  -- pending/approved/rejected
  reviewer TEXT,
  createdAt TEXT
);

-- 伏笔追踪
CREATE TABLE nvwa_hooks (
  id TEXT PRIMARY KEY,
  seedId TEXT,
  setupNodeId TEXT,
  payoffNodeId TEXT,
  status TEXT,  -- active/paid_off/cancelled
  content TEXT
);

-- 推演历史
CREATE TABLE nvwa_simulations (
  id TEXT PRIMARY KEY,
  input TEXT,  -- JSON 输入
  output TEXT,  -- JSON 输出
  createdAt TEXT
);
```

### API端点

```
POST /api/v1/nvwa/simulate/v2    -- 增强推演
GET  /api/v1/nvwa/audit/:nodeId  -- 获取审计
POST /api/v1/nvwa/audit/:nodeId  -- 提交审核
GET  /api/v1/nvwa/hooks          -- 伏笔列表
POST /api/v1/nvwa/hooks          -- 创建伏笔
```

---

## 九、参考资源

- [InkOS GitHub](https://github.com/Narcooo/inkos) - 33维度审计
- [StoryWriter](https://github.com/THU-KEG/StoryWriter) - 三阶段流程
- [MM-StoryAgent](https://github.com/X-PLUG/MM_StoryAgent) - 多模态
- [MiroFish](https://github.com/amadad/mirofish) - 群体模拟

---

*文档创建：2026-04-11*
