# SoulWriter v2.0 开发文档

> 版本：v2.0
> 更新：2026-04-12
> 状态：待开发

---

## 一、产品定位

**SoulWriter — 世界架构设计师**

不同于普通的AI写小说工具，SoulWriter 是一个设计完整世界的工具。用户导入一本书或素材，系统将其分解为角色、物品、地点、事件、文化背景等要素，然后可以：
- 用不同语言讲述同一个故事
- 智能改编文化要素（筷子→刀叉）
- 让AI持续学习作者的写作风格
- 构建角色的长期记忆与人格演化

**核心差异化**：
- 软件有持续学习能力，喂书越多，写的内容越懂作者
- 独特的文化要素自动改编系统（市场上无类似产品）
- 不是工具，是伙伴

---

## 二、技术架构

### 2.1 技术栈
- **后端**：Node.js + Fastify
- **数据库**：SQLite（结构化数据）+ 文件系统（内容存储）
- **前端**：原生 JS（无框架）+ CSS 变量系统
- **AI**：MOSS-Core / OpenAI / Claude（可配置）

### 2.2 项目结构
```
soulwriter-api/
├── src/
│   ├── app.js                    # Fastify 入口
│   ├── config.js                 # ⚠️ 端口/路径配置（不再写死）
│   ├── routes/                    # API 路由
│   │   ├── books_routes.js       # 书本 CRUD
│   │   ├── events_routes.js       # 事件线 CRUD
│   │   ├── memory_routes.js       # 女娲记忆
│   │   ├── settings_routes.js     # 全局设置
│   │   ├── translate_routes.js    # ⭐ 语种翻译（新）
│   │   └── works_routes.js        # 实体 CRUD
│   └── modules/
│       ├── nvwa/                 # 女娲记忆系统
│       │   ├── memory_layers.js   # 记忆层次
│       │   └── quantum_entanglement.js
│       └── genesis/               # 创世树
│
├── dashboard/
│   ├── index.html                 # 主入口
│   ├── settings.html              # 设置页（独立）
│   ├── css/
│   │   ├── main.css               # 主题/全局变量
│   │   ├── drawer_layout.css      # 抽屉布局
│   │   └── components.css         # 组件样式
│   └── js/
│       ├── app.js                 # 主应用逻辑（⚠️ 不用硬编码中文）
│       ├── i18n.js                # ⭐ i18n 系统
│       ├── router.js              # ⭐ 前端路由
│       └── utils.js               # 工具函数
│
├── config/                        # ⭐ 所有配置外部化
│   ├── default.json               # 默认配置
│   ├── i18n/
│   │   ├── zh.json                # 中文语言包
│   │   └── en.json                # 英文语言包
│   └── shortcuts.json             # 快捷键配置
│
├── data.db                        # SQLite 数据库
└── docs/
    ├── SoulWriter_v2.0_设计文档.md  # ⭐ 本文档
    └── CHANGELOG.md               # 版本变更记录
```

---

## 三、导航结构（9宫格）

### 3.1 顶层结构
```
┌──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐
│ 导航  │ 情节  │ 背景  │ 创作  │ 创意  │ 地图  │ 分析  │ 综合  │ 工具  │
└──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘
```

### 3.2 完整层级
```
导航
  ├── 角色（roles）
  ├── 物品（items）
  ├── 地点（locations）
  └── 自定义（custom_categories）  ← 用户可增删分类

情节
  ├── 事件线（events_timeline）
  └── 章节目录（chapters）

背景
  ├── 设定（settings）
  └── 世界观（worldview）

创作
  ├── 剧本（scripts）
  └── 小说（novels）

创意
  ├── 想法（ideas）
  ├── 灵感（inspiration）
  └── 记录（notes）

地图
  └── 列表（map_list）

分析
  └── 人物关系（character_relations）

综合
  ├── 设置（settings）
  ├── API路由（api_routes）
  ├── 预设（presets）
  └── 写作风格（writing_styles）

工具
  └── 小说解析（novel_parser）
```

### 3.3 右侧面板（主内容区）
每个模块点击后，右侧面板显示详情/编辑界面。

---

## 四、功能模块详细设计

### 4.1 语种翻译（核心特色功能）⭐

#### 4.1.1 数据库设计
```sql
CREATE TABLE translations (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  source_lang TEXT NOT NULL,      -- 'zh', 'en', 'ja' ...
  target_lang TEXT NOT NULL,       -- 目标语言
  strength INTEGER DEFAULT 50,    -- 改编强度 0-100
  version INTEGER DEFAULT 1,       -- 版本号
  title TEXT,                     -- 翻译后书名
  content TEXT,                   -- 翻译后内容
  changes_log TEXT,               -- 变更日志JSON（筷子→刀叉等）
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id)
);

CREATE TABLE translation_changes (
  id TEXT PRIMARY KEY,
  translation_id TEXT,
  original TEXT,                  -- 原文
  transformed TEXT,               -- 改编后
  change_type TEXT,               -- 'food', 'utensil', 'culture', 'custom'
  reason TEXT,                    -- 改变原因
  auto INTEGER DEFAULT 1,         -- 1=自动 0=人工确认
  confirmed INTEGER DEFAULT 0,    -- 是否已确认
  FOREIGN KEY (translation_id) REFERENCES translations(id)
);
```

#### 4.1.2 改编强度定义
| 区间 | 名称 | 行为 |
|------|------|------|
| 0-20 | 基础翻译 | 只翻译文字，不改变任何文化要素 |
| 20-40 | 受限改造 | 语义优化，保留文化背景 |
| 40-60 | 智能适配 | **筷子→刀叉、米饭→面包、等价替换文化要素** |
| 60-80 | 深度本土化 | 连情节逻辑、人物习惯都调整 |
| 80-100 | 完全重写 | AI基于原故事重新创作，需人工审核 |

#### 4.1.3 文化要素替换库
```json
{
  "food": {
    "zh→en": {
      "米饭": "bread",
      "面条": "pasta",
      "包子": "sandwich",
      "粥": "porridge",
      "筷子": "knife and fork",
      "碗": "plate"
    }
  },
  "custom": {
    "zh→en": {
      "拱手": "handshake",
      "鞠躬": "bow",
      "过年": "Christmas",
      "中秋": "Thanksgiving"
    }
  }
}
```

#### 4.1.4 API 设计
```
POST /api/translate
  Body: { bookId, sourceLang, targetLang, strength, chapterId? }
  Response: { success, translationId, preview: { title, summary, changes[] } }

GET  /api/translate/:translationId
  获取翻译结果

GET  /api/translate/:translationId/changes
  获取所有变更记录（供人工确认）

PUT  /api/translate/:translationId/changes/:changeId
  确认/拒绝某条变更

GET  /api/translate/book/:bookId/versions
  获取某书的所有翻译版本

DELETE /api/translate/:translationId
  删除翻译版本
```

#### 4.1.5 UI 布局
```
┌─────────────────────────────────────────────────────────────┐
│  语种翻译                              [源: 中文 ▼] [目标: 英文 ▼]  │
├──────────────────────┬────────────┬────────────────────────┤
│   原文（事件线视图）   │ 改编强度    │    翻译结果              │
│   ┌──────────────┐  │  0━━●━━100 │    ┌──────────────┐    │
│   │ 第1回        │  │            │    │ Chapter 1    │    │
│   │ 李白在长安   │  │  40-60区间  │    │ Li Bai in    │    │
│   │ 吃饭用筷子   │  │  ⭐推荐区间  │    │ London uses  │    │
│   │ ...          │  │            │    │ knife&fork...│    │
│   └──────────────┘  │            │    └──────────────┘    │
│                      │  变更预览   │                       │
│  [上一章] [下一章]    │  🍚→🍞     │   [保存版本] [导出]     │
│                      │  🥢→🍴     │                       │
└──────────────────────┴────────────┴────────────────────────┘
```

---

### 4.2 i18n 系统

#### 4.2.1 语言包结构
```json
// config/i18n/zh.json
{
  "app": {
    "name": "SoulWriter",
    "slogan": "灵魂创作者"
  },
  "nav": {
    "home": "导航",
    "plot": "情节",
    "background": "背景",
    "create": "创作",
    "idea": "创意",
    "map": "地图",
    "analysis": "分析",
    "synthesis": "综合",
    "tools": "工具"
  },
  "entity": {
    "roles": "角色",
    "items": "物品",
    "locations": "地点",
    "buildings": "建筑",
    "events": "事件",
    "chapters": "章节"
  },
  "actions": {
    "create": "新建",
    "save": "保存",
    "delete": "删除",
    "edit": "编辑",
    "cancel": "取消",
    "confirm": "确认",
    "upload": "上传",
    "download": "下载",
    "export": "导出",
    "import": "导入"
  },
  "home": {
    "stats": "内容概览",
    "quickActions": "快速操作",
    "aiAnalysis": "AI分析",
    "uploadAnalyze": "上传分析",
    "longTextAnalyze": "长文本分析",
    "noItems": "暂无内容",
    "createFirst": "创建第一个"
  },
  "translate": {
    "title": "语种翻译",
    "source": "源语言",
    "target": "目标语言",
    "strength": "改编强度",
    "basic": "基础翻译",
    "smart": "智能适配",
    "deep": "深度本土化",
    "original": "原文",
    "result": "翻译结果",
    "changes": "变更预览",
    "saveVersion": "保存版本",
    "export": "导出"
  },
  "settings": {
    "title": "设置",
    "aiConfig": "AI配置",
    "globalApi": "全局API",
    "perCharacterApi": "角色独立API",
    "testConnection": "测试连接",
    "language": "界面语言"
  },
  "errors": {
    "loadFailed": "加载失败",
    "saveFailed": "保存失败",
    "networkError": "网络错误",
    "notFound": "未找到"
  }
}
```

#### 4.2.2 i18n.js 实现
```javascript
// dashboard/js/i18n.js
const i18n = {
  currentLocale: 'zh',
  data: {},

  async init() {
    // 从 localStorage 读取用户偏好
    const saved = localStorage.getItem('sw_locale');
    this.currentLocale = saved || 'zh';
    await this.loadLocale(this.currentLocale);
  },

  async loadLocale(locale) {
    try {
      const res = await fetch(`/config/i18n/${locale}.json`);
      this.data = await res.json();
      this.currentLocale = locale;
      localStorage.setItem('sw_locale', locale);
    } catch(e) {
      console.error('Failed to load locale:', e);
    }
  },

  t(key, params = {}) {
    // key格式: "section.subsection.key"
    const keys = key.split('.');
    let value = this.data;
    for (const k of keys) {
      value = value?.[k];
    }
    if (value === undefined) return key; // fallback to key
    // 简单参数替换
    return value.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`);
  },

  async setLocale(locale) {
    await this.loadLocale(locale);
    // 触发UI更新事件
    window.dispatchEvent(new CustomEvent('localeChanged', { detail: locale }));
  }
};
```

#### 4.2.3 语种切换按钮行为
1. 用户点击切换语言
2. `i18n.setLocale('en')` 加载英文语言包
3. 触发 `localeChanged` 事件
4. 所有使用 `t('key')` 的地方自动更新
5. **不需要刷新页面**

---

### 4.3 配置外部化

#### 4.3.1 config/default.json
```json
{
  "server": {
    "port": 3000,
    "host": "0.0.0.0",
    "prefix": "/api"
  },
  "database": {
    "path": "./data.db"
  },
  "upload": {
    "maxSize": "50mb",
    "allowedTypes": [".txt", ".docx", ".epub", ".md"]
  },
  "ai": {
    "defaultProvider": "moss",
    "providers": {
      "moss": {
        "baseUrl": "http://localhost:13000",
        "model": "MOSS-Core"
      },
      "openai": {
        "baseUrl": "https://api.openai.com",
        "model": "gpt-4",
        "apiKey": ""
      }
    }
  },
  "translation": {
    "culturalMapping": "./config/translation_cultural.json"
  }
}
```

#### 4.3.2 shortcuts.json
```json
{
  "global": {
    "Ctrl+S": "save",
    "Ctrl+N": "newItem",
    "Ctrl+F": "search",
    "Ctrl+/": "toggleShortcuts"
  },
  "editor": {
    "Ctrl+B": "bold",
    "Ctrl+I": "italic",
    "Esc": "closePanel"
  },
  "nav": {
    "1-9": "switchTab",
    "←→": "prevNextChapter"
  }
}
```

---

### 4.4 数据库设计（完整）

```sql
-- 书本
CREATE TABLE books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  source_lang TEXT DEFAULT 'zh',
  word_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 实体（角色/物品/地点/建筑）
CREATE TABLE entities (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  type TEXT NOT NULL,          -- role/item/location/building
  name TEXT NOT NULL,
  description TEXT,
  properties TEXT,             -- JSON扩展字段
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id)
);

-- 事件线
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  title TEXT NOT NULL,
  arc TEXT DEFAULT '主线',       -- 主线/支线/暗线/感情线
  chapter TEXT,
  cause TEXT,                   -- 起因
  process TEXT,                 -- 经过
  result TEXT,                  -- 结果
  timestamp INTEGER DEFAULT 0,  -- 排序序号
  tension INTEGER DEFAULT 50,   -- 张力值 0-100
  status TEXT DEFAULT 'open',   -- open/closed
  is_key_event INTEGER DEFAULT 0,
  characters TEXT,              -- JSON数组
  locations TEXT,               -- JSON数组
  items TEXT,                   -- JSON数组
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id)
);

-- 翻译
CREATE TABLE translations (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  source_lang TEXT NOT NULL,
  target_lang TEXT NOT NULL,
  strength INTEGER DEFAULT 50,
  version INTEGER DEFAULT 1,
  title TEXT,
  content TEXT,
  changes_log TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id)
);

-- 翻译变更记录
CREATE TABLE translation_changes (
  id TEXT PRIMARY KEY,
  translation_id TEXT NOT NULL,
  original TEXT NOT NULL,
  transformed TEXT NOT NULL,
  change_type TEXT,            -- food/utensil/culture/custom
  reason TEXT,
  auto INTEGER DEFAULT 1,
  confirmed INTEGER DEFAULT 0,
  FOREIGN KEY (translation_id) REFERENCES translations(id)
);

-- 女娲记忆
CREATE TABLE memory_entries (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  book_id TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  importance INTEGER DEFAULT 5,  -- 1-10
  emotions TEXT,                  -- JSON数组
  related_chars TEXT,             -- JSON数组
  status TEXT DEFAULT 'buffer',  -- buffer/core/recall/archival
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (character_id) REFERENCES entities(id),
  FOREIGN KEY (book_id) REFERENCES books(id)
);

CREATE TABLE memory_summary (
  character_id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  summary TEXT,
  last_updated DATETIME,
  FOREIGN KEY (character_id) REFERENCES entities(id)
);

-- AI配置
CREATE TABLE ai_config (
  id TEXT PRIMARY KEY,
  book_id TEXT,                  -- NULL表示全局配置
  provider TEXT DEFAULT 'moss',
  base_url TEXT,
  api_key TEXT,
  model TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 五、开发任务清单

### P0 - 核心基础设施
- [ ] **5.1** 创建 `config/` 目录，移入所有配置
- [ ] **5.2** 创建 `config/i18n/zh.json` + `en.json` 语言包
- [ ] **5.3** 实现 `dashboard/js/i18n.js` i18n系统
- [ ] **5.4** 重构 `app.js` — 所有中文硬编码替换为 `t('key')`
- [ ] **5.5** 快捷键系统 `config/shortcuts.json` + 前端绑定

### P1 - 核心特色功能
- [ ] **5.6** 数据库：`translations` + `translation_changes` 表
- [ ] **5.7** 文化要素映射库 `config/translation_cultural.json`
- [ ] **5.8** 后端：`translate_routes.js`（翻译+改编强度）
- [ ] **5.9** 前端：语种翻译UI（双栏+滑块+变更预览）

### P2 - 导航重构
- [ ] **5.10** 前端路由系统 `router.js`（按9宫格结构）
- [ ] **5.11** 顶部9宫格导航栏
- [ ] **5.12** 各模块内容页接入（情节/背景/创作/创意/地图/分析/综合/工具）

### P3 - 完善功能
- [ ] **5.13** 续写功能（v1.8核心）：`/api/continue/:bookId/:chapterId`
- [ ] **5.14** 人物关系图可视化
- [ ] **5.15** 章节管理（增删改排序）
- [ ] **5.16** 上传功能增强（支持更多格式）

### P4 - 文档与发布
- [ ] **5.17** 更新 `docs/SoulWriter_v2.0_设计文档.md`
- [ ] **5.18** 写 OpenClaw Skill 文档（clawhub.ai）
- [ ] **5.19** 清理测试数据，检查代码
- [ ] **5.20** GitHub push + Tag v2.0

---

## 六、技术约束

1. **不写死任何配置** — 端口/路径/API Key/语言包全部外部化
2. **不写死任何文字** — UI文字全部走 `t('key')`，不直接写中文/英文
3. **先文档再开发** — 每个功能先写设计文档，再实现
4. **验证后才能push** — 代码改完必须测试通过再提交GitHub
5. **不信任OpenCode** — 必须用 Playwright 截图验证真实效果

---

## 七、待确认问题

1. 翻译功能里，文化要素映射库需要覆盖哪些语言？（目前只设计 zh↔en）
2. 9宫格导航的「自定义」分类，数据结构如何设计？用户可自定义哪些字段？
3. 快捷键是否需要区分 OS（Mac vs Windows）？
4. 语种翻译的"导出"支持哪些格式？（PDF/EPUB/TXT/Markdown）

---

## 八、博士新增需求记录（2026-04-12）

> 以下为博士口述需求，按优先级排列，尚未实现

---

### 8.1 工具栏修复（紧急）

**现状问题**：右上角文档、日志按钮丢失

**修复方案**：
- `renderToolbar()` 里已加 Docs(📖) 和 Log(📋) 按钮
- `bindWelcomeEvents()` 和 `bindBookEvents()` 里绑定点击事件
- 事件：`btn-docs` → `window.open(github链接)`, `btn-log` → `log-panel.classList.toggle('open')`

**i18n key**：
- `toolbar.docs`: 文档 / Docs
- `toolbar.log`: 日志 / Log

---

### 8.2 插件系统设计（⭐重要）

#### 8.2.1 核心理念
像 Windows 设置默认软件一样，每个功能板块可以接入不同的 skill 实现。
用户可以从 clawhub.ai 或其他平台下载符合接口规范的 skill，只要类型匹配就能用。

#### 8.2.2 板块类型定义
| 板块类型 | 功能说明 | 示例skill |
|----------|----------|-----------|
| **搜索** | 搜索功能，可切换不同搜索源 | tavily, brave, searxng, duckduckgo |
| **分析** | 内容分析、AI理解 | deer-flow, deep-research |
| **创作** | 内容生成、写作 | soulwriter-core, clifford |
| **翻译** | 语种翻译 | translate-routes (内置) |
| **知识库** | RAG、知识检索 | qdrant, meilisearch |
| **TTS** | 文字转语音 | minimax-tts, elevenlabs |
| **图片** | 配图生成 | minimax-image, dalle |
| **视频** | 视频生成 | minimax-video, remotion |

#### 8.2.3 Skill 接口规范
```javascript
// 每个skill必须实现的接口
const skill = {
  id: 'tavily-search',          // 唯一标识
  name: 'Tavily Search',         // 显示名
  type: 'search',                // 板块类型
  version: '1.0.0',
  author: 'community',
  
  // 核心方法
  async search(query, options) {},   // 搜索
  async init(config) {},             // 初始化
  async destroy() {},                // 清理
  
  // 元信息
  configSchema: {},                 // 配置项定义
  capabilities: ['web', 'news'],    // 支持的能力
  limits: { qps: 10, daily: 1000 } // 限制
};
```

#### 8.2.4 Skill 管理 UI（设置页面）
- 列表显示所有已安装 skill
- 每个 skill 显示：名称/版本/类型/状态
- 操作：安装/卸载/启用/禁用/配置
- 从 clawhub.ai 发现新 skill
- 设置默认 skill（每个类型可设置一个默认）

---

### 8.3 免费AI模型接入（⭐重要）

#### 8.3.1 背景
GitHub 上有项目提供免费试用的 AI 模型 API，可以作为基础能力外接，不需要消耗付费额度。

#### 8.3.2 设计思路
- **作为插件存在**，不作为单独板块
- 系统内置默认模型（OpenAI/Claude等付费）
- 用户可额外接入免费模型作为补充
- 免费模型优先级低，用于基础功能；付费模型用于核心生成

#### 8.3.3 待调研项目（需联网搜）
- [ ] GitHub 上提供免费 LLM API 的项目（如 free-llm-api 汇总项目）
- [ ] 国内免费模型：讯飞/百度/腾讯等是否有免费额度
- [ ] OpenRouter.ai（聚合多个免费模型）
- [ ] Groq（免费高速推理）

#### 8.3.4 接入方式
```javascript
// config/default.json
{
  "ai": {
    "providers": {
      "openai": { "model": "gpt-4o", "apiKey": "...", "free": false },
      "groq": { "model": "llama-3.3-70b", "apiKey": "...", "free": true },
      "openrouter": { "model": "anthropic/claude-3-haiku", "apiKey": "...", "free": true }
    }
  }
}
```

---

### 8.4 女娲系统架构升级（⭐核心）

#### 8.4.1 灵感来源：Claude Code 的 Ralph Mode

Claude Code 的持久化循环机制：
```
Agent Loop:
  while true:
    1. 接收任务
    2. 执行（调用工具/LLM）
    3. 验证结果
    4. 检查终止条件
    
Ralph Mode:
  - 持久化记忆（每次循环累积）
  - 自我反思（review agent 并行验证）
  - 架构级验证（每个决策有检查点）
```

#### 8.4.2 女娲系统升级设计

**当前问题**：女娲功能需要算力，像一键写小说那样直接调用会有延迟/失败问题

**升级方案**：
```
女娲处理流程（持久化循环）：
┌─────────────────────────────────────────────┐
│ 1. 接收指令（新增记忆/分析/推理）              │
│ 2. 加入队列（TaskFlow 持久化）                │
│ 3. 后台循环处理（Ralph Loop）                 │
│    ├─ Worker: 处理当前任务                    │
│    ├─ Reviewer: 并行验证结果（Team Mode）     │
│    └─ Architect: 检查是否符合架构约束         │
│ 4. 结果写入内存层（Buffer → Core → Recall）    │
│ 5. 通知用户（可实时看到进度）                  │
└─────────────────────────────────────────────┘
```

**女娲状态机**：
- `idle`: 等待指令
- `queued`: 任务排队中
- `processing`: 处理中（可显示进度）
- `reviewing`: 并行验证中
- `completed`: 完成，写入记忆
- `failed`: 失败，可重试

**Team Mode 验证**：
- 主线程生成内容
- Reviewer 线程并行检查：事实准确性/逻辑一致性/风格一致性
- Architect 线程检查：是否符合世界观/角色设定

#### 8.4.3 女娲 TaskFlow 集成
```javascript
// 女娲任务作为 TaskFlow 子任务
const nvwaTask = {
  type: 'nvwa_memory',
  input: { characterId, action, content },
  pipeline: [
    { role: 'worker', model: 'gpt-4o', task: 'generate' },
    { role: 'reviewer', model: 'gpt-4o', task: 'verify' },
    { role: 'architect', model: 'gpt-4o', task: 'constrain_check' }
  ],
  output: { memoryEntry, confidence, warnings }
};
```

---

### 8.5 合册功能（推广中心）

#### 8.5.1 功能描述
根据文章内容和作者想法，自动生成多种推广素材。

#### 8.5.2 生成内容类型
| 类型 | 说明 | 输出格式 |
|------|------|----------|
| **歌曲歌词** | 根据故事主题/情感生成歌词 | LRC/TXT |
| **用户点评** | 模拟读者视角的点评 | TXT |
| **书籍简介** | 吸引人的书籍简介 | TXT/Markdown |
| **配图描述** | 适合书籍的配图Prompt | TXT |
| **小红书文案** | 小红书风格的推广图文 | TXT（带emoji和标签） |
| **角色语录** | 角色对话/内心独白 | TXT |
| **社交媒体帖文** | Twitter/X风格短文 | TXT |

#### 8.5.3 UI 设计
```
┌─────────────────────────────────────────────────────────┐
│  📦 合册生成                        [生成中... ████░░ 60%] │
├─────────────────────────────────────────────────────────┤
│  选择内容：                                             │
│  ☑ 歌曲歌词  ☑ 简介  ☑ 配图Prompt  ☑ 小红书  ☑ 角色语录 │
│                                                         │
│  书籍简介：                                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 书名：《xxx》                                     │   │
│  │ 在繁华的都市中，四个女孩相遇了...                  │   │
│  │ 这是一个关于成长、梦想与选择的故事。              │   │
│  └─────────────────────────────────────────────────┘   │
│  [🎵 歌曲] [📝 小红书] [🖼️ 配图] [💬 角色语录]          │
│                                                         │
│  一键复制全部 │ 导出 TXT │ 导出 Markdown                │
└─────────────────────────────────────────────────────────┘
```

---

### 8.6 事件线视角切换（⭐强大功能）

#### 8.6.1 功能描述
AI 可以把故事从主角A的视角，改编成主角B的视角，重新生成事件线。

#### 8.6.2 实现原理
```
事件线数据结构：
{
  id: "evt_001",
  title: "大战",
  protagonist: "李白",        // 当前主角
  events: [
    { scene: "李白拿起剑", emotion: "愤怒" },
    { scene: "杜甫在旁边观看", emotion: "担忧" }
  ],
  characterViews: {
    "李白": { perspective: "我愤怒地拿起剑冲向敌人" },
    "杜甫": { perspective: "我担忧地看着李白冲向危险" }
  }
}

视角切换流程：
1. 用户选择"杜甫视角"
2. AI 读取所有事件 + 杜甫角色设定
3. 重新生成：每个场景从杜甫角度描写
4. 生成新的"杜甫事件线"
5. 保存为角色事件线（Character Event Line）
```

#### 8.6.3 角色事件线（Character Event Line）
- 每本书可创建多条角色事件线
- 左侧二级导航 → 章节下看到
- 可拖入"小说编辑"/"剧本编辑"/"女娲系统"
- 以该角色视角为主角写整部小说

#### 8.6.4 数据库扩展
```sql
-- 角色事件线
CREATE TABLE character_event_lines (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  character_id TEXT NOT NULL,       -- 该事件线的主角
  title TEXT,
  events TEXT,                      -- JSON 事件数组
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id),
  FOREIGN KEY (character_id) REFERENCES entities(id)
);

-- 事件视角记录
CREATE TABLE event_perspectives (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  character_id TEXT NOT NULL,
  perspective_text TEXT NOT NULL,   -- AI生成的视角描述
  FOREIGN KEY (event_id) REFERENCES events(id)
);
```

---

### 8.7 快捷键系统

#### 8.7.1 设计思路
- 全部快捷键定义在 `config/shortcuts.json`
- 前端统一解析和绑定
- 支持全局快捷键（整个应用）
- 支持局部快捷键（特定模块内）

#### 8.7.2 shortcuts.json 结构
```json
{
  "global": {
    "Ctrl+Shift+L": "toggleLog",
    "Ctrl+Shift+D": "toggleDocs",
    "Ctrl+,": "openSettings"
  },
  "translate": {
    "Ctrl+Enter": "doTranslate",
    "Ctrl+Shift+S": "saveVersion"
  },
  "event": {
    "N": "newEvent",
    "E": "editEvent",
    "Delete": "deleteEvent"
  },
  "editor": {
    "Ctrl+S": "save",
    "Ctrl+Z": "undo",
    "Ctrl+Shift+Z": "redo"
  }
}
```

---

### 8.8 右侧面板详情功能

#### 8.8.1 角色详情
- 基本信息（名字/描述/关系网）
- 记忆概览（女娲核心记忆摘要）
- 关系图谱（Neo4j可视化）
- 相关事件列表
- 操作：编辑/删除/查看记忆/导出

#### 8.8.2 事件详情
- 事件内容（起因/经过/结果）
- 关联角色/地点/物品
- 张力曲线图
- AI分析
- 视角切换入口

---

## 九、已知问题与修复记录

| 日期 | 问题 | 修复 |
|------|------|------|
| 2026-04-12 | renderWelcome return语句被分号截断 | 删除多余分号 |
| 2026-04-12 | novel icon SVG引号错误（24 24"'） | 修复为 24 24" |
| 2026-04-12 | 工具栏 Docs/Log 按钮缺失 | renderToolbar + bindWelcomeEvents + bindBookEvents |
| 2026-04-12 | 语言切换后 tabs 不更新 | bindWelcomeEvents + bindBookEvents 添加 btn-lang 事件 |
| 2026-04-12 | 翻译 tab 事件绑定在 DOM 未就绪时执行 | setTimeout(bindTranslateTabEvents, 50) |
| 2026-04-12 | 翻译 API 正常但 DOM 不更新 | clone/replace 按钮确保重新绑定 |
| 2026-04-12 | 工具栏双重渲染（静态+动态） | index.html 已干净，确认无此问题 |

---

## 十、GitHub 提交记录

| Commit | 功能 |
|--------|------|
| 3307ed8 | feat: i18n硬编码替换 - Tab/按钮/标签支持中英切换 |
| b0c3541 | feat: i18n硬编码全部替换 - placeholder/select/label |
| 759c6b7 | feat: translate tab with i18n support, cultural adaptation engine |

**待push**：b0c3541, 759c6b7（网络不稳，需重试）

---

## 十一、参考资料

### Claude Code 架构
- 路径：`/volume1/openclaw/openclaw-logs/claude-code泄露源码分析/markdown/`
- 核心章节：ch03(原则), ch05(Agent Loop), ch20(权限), ch24(Swarm/Team)

### agency-agents
- 路径：`/root/.openclaw/workspace/agency-agents/`
- 193个角色参考

### Ralph Mode 关键设计
- 持久化循环，不是一次调用
- Team Mode：多个 agent 并行（worker + reviewer + architect）
- 架构验证：每个决策有检查点
- 自我反思：错误自动修正

