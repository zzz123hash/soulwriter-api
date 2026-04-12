# SoulWriter - 灵魂创作者

> 创世树 × 女娲引擎 AI 创作平台 | 世界架构设计师

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/zzz123hash/soulwriter-api/blob/main/LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0-green.svg)](https://nodejs.org/)
[![Version](https://img.shields.io/badge/version-2.0-blue.svg)](https://github.com/zzz123hash/soulwriter-api/releases)

**SoulWriter** 不同于普通的 AI 写小说工具，是一个**设计完整世界**的工具。用户导入素材后，系统将其分解为角色、物品、地点、事件、文化背景等要素，然后可以：
- 🌏 用不同语言讲述同一个故事（文化自动适配）
- 🔮 让 AI 持续学习作者的写作风格和角色记忆
- 🌳 构建角色的关系网和世界观演化
- ⚡ 智能改编文化要素（筷子→刀叉、过年→圣诞节、红楼梦→美国庄园故事）

---

## ✨ 核心功能

### 🌍 语种翻译（v2.0 新增 ⭐）

**智能文化适配翻译**，不是简单的文字翻译，而是将整个文化背景进行改编：

```
原文：刘姥姥进大观园，贾府地主请玉皇大帝保佑，过年了放鞭炮送红包。

译文（强度60）：Liu Laolao enters the Grand Manor, the Jia family estate landlord asks God to bless them. 
It's Christmas now — setting off fireworks and giving Christmas gifts.

变更（6处）：
  过年 → Christmas / New Year celebration
  红包 → Christmas gift / red envelope  
  玉皇大帝 → God / the Almighty
  地主 → landlord / plantation owner
  大观园 → Grand Manor / English country manor
  贾府 → the Jia household / the Wayne family estate
```

**改编强度（0-100）**：
| 强度 | 名称 | 行为 |
|------|------|------|
| 0-20 | 基础翻译 | 只翻译文字，不改变文化要素 |
| 20-40 | 受限改造 | 语义优化，保留基本文化背景 |
| **40-60** | **智能适配** | 筷子→knife and fork、过年→Christmas（默认） |
| 60-80 | 深度本土化 | 情节逻辑、人物关系本地化 |
| 80-100 | 完全重写 | AI 基于原著重新创作 |

**支持的文化分类**：食物、节日、问候、神祇、社会阶层、建筑、服饰、习俗、货币、时代背景

### 🔮 女娲引擎（Nvwa）

- **分层记忆系统**：Buffer → Core → Recall → Archival → K线记录
- **量子纠缠选角**：AI 自动选择角色对进行互动推演
- **张力控制器**：调节剧情节奏（松弛/紧张）
- **创世联动**：从创世树节点自动创建角色

### 🌳 创世树（Genesis）

- **种子 → 节点 → 关系树**的完整世界观结构
- 剧情节点类型（起承转合、角色、设定）
- 与女娲引擎联动

### 📚 书本管理

- 章节、角色、物品、地点、建筑全支持
- 上传解析（txt/markdown）
- 数据库 SQLite 持久化

### 🎨 主题系统

- **暗色** 🌙 / **柔和** 🌤️ / **蓝色** 💙 / **绿色** 🌿
- 主题随系统 / 手动切换
- CSS 变量驱动，实时切换

---

## 🚀 快速开始

```bash
# 克隆
git clone https://github.com/zzz123hash/soulwriter-api.git
cd soulwriter-api

# 安装依赖
npm install

# 启动（默认 3000 端口）
npm start
# 或
node src/app.js
```

访问 http://localhost:3000/dashboard/

---

## 📡 API 文档

### 基础信息

- **Base URL**: `http://localhost:3000`
- **健康检查**: `GET /health`

### 书本管理

```
GET    /api/v1/projects                    # 列出所有项目
POST   /api/v1/projects                   # 创建项目
GET    /api/v1/projects/:id               # 获取项目
PUT    /api/v1/projects/:id               # 更新项目
DELETE /api/v1/projects/:id               # 删除项目

GET    /api/v1/projects/:projectId/roles   # 项目角色列表
POST   /api/v1/roles                      # 创建角色
GET    /api/v1/roles/:id                  # 获取角色
PUT    /api/v1/roles/:id                  # 更新角色
DELETE /api/v1/roles/:id                 # 删除角色

GET    /api/v1/projects/:projectId/items   # 物品列表
POST   /api/v1/items                      # 创建物品
GET    /api/v1/items/:id                 # 获取物品
PUT    /api/v1/items/:id                 # 更新物品
DELETE /api/v1/items/:id                 # 删除物品

GET    /api/v1/projects/:projectId/locations  # 地点列表
POST   /api/v1/locations                  # 创建地点
GET    /api/v1/locations/:id             # 获取地点
PUT    /api/v1/locations/:id             # 更新地点
DELETE /api/v1/locations/:id             # 删除地点
```

### 语种翻译（⭐ v2.0）

```
POST   /api/translate                     # 翻译 + 文化适配
  Body: {
    text: string,           # 原文
    sourceLang: "zh",       # 源语言
    targetLang: "en",       # 目标语言
    strength: 50,           # 改编强度 0-100
    background?: "auto"     # 背景预设（可选）
  }
  Response: {
    success: true,
    data: {
      translationId: "tr_xxx",
      sourceLang: "zh",
      targetLang: "en",
      strength: 50,
      strengthLabel: "smart",
      text: "...",           # 翻译结果
      originalText: "...",   # 原文
      changesCount: 6,       # 变更数量
      changes: [
        {
          original: "过年",
          transformed: "Christmas / New Year celebration",
          changeType: "festival",
          context: "家庭团聚、礼物交换、烟花",
          adaptation: "红包→Christmas gifts, 放鞭炮→fireworks",
          auto: 1,
          confirmed: 1
        }
      ],
      culturalVersion: "2.0"
    }
  }

GET    /api/translate/categories          # 获取支持的文化分类
  Response: {
    success: true,
    data: {
      version: "2.0",
      categories: ["food","festival","greetings","deity","social_class","architecture","clothing","customs","currency","era_setting"],
      supportedPairs: ["zh→en", "en→zh"]
    }
  }

POST   /api/translate/validate            # 验证AI输出格式
  Body: {
    text: string,             # AI返回的文本
    expectedFormat: "memory_entry" | "event" | "character"
  }
  Response: { success: true, data: { valid: boolean, errors: string[], parsed: object } }
```

### 女娲记忆

```
GET    /api/v1/nvwa/status                 # 女娲系统状态
POST   /api/v1/nvwa/analyze               # 分析输入内容
GET    /api/v1/nvwa/memory/:characterId   # 获取角色记忆
```

### 创世树

```
GET    /api/genesis/seeds                  # 所有种子
POST   /api/genesis/seeds                  # 创建种子
GET    /api/genesis/seeds/:id             # 获取种子
POST   /api/genesis/nodes                  # 创建节点
GET    /api/genesis/nodes/:id             # 获取节点
GET    /api/genesis/nodes/:id/children    # 子节点
PUT    /api/genesis/nodes/:id             # 更新节点
DELETE /api/genesis/nodes/:id             # 删除节点
POST   /api/genesis/edges                 # 创建关系边
```

### AI 配置

```
GET    /api/v1/ai/config                   # 获取AI配置
PUT    /api/v1/ai/config                  # 更新AI配置
POST   /api/v1/ai/run                     # 直接运行AI任务
```

### 上传

```
POST   /api/upload/text                     # 上传文本文件
POST   /api/upload/analyze                 # 上传并分析
```

---

## 🎯 配置

### 文化映射库

编辑 `config/translation_cultural.json` 自定义文化要素映射：

```json
{
  "_version": "2.0",
  "zh→en": {
    "festival": {
      "过年": {
        "en": "Christmas / New Year celebration",
        "context": "家庭团聚、礼物交换、烟花",
        "adaptation": "红包→Christmas gifts"
      }
    },
    "food": {
      "筷子": { "en": "knife and fork" },
      "米饭": { "en": "rice" }
    }
  }
}
```

### AI 配置

`config/default.json` 或通过 `/api/v1/ai/config` 接口配置 AI provider。

---

## 🗂️ 项目结构

```
soulwriter-api/
├── src/
│   ├── app.js                    # Fastify 主服务
│   ├── config.js                 # 配置
│   └── routes/
│       ├── works_routes.js       # 项目 CRUD
│       ├── events_routes.js      # 事件线
│       ├── genesis_nvwa_routes.js # 创世×女娲
│       ├── translate_routes.js    # ⭐ 语种翻译 v2.0
│       ├── memory_routes.js       # 女娲记忆
│       ├── settings_routes.js      # 全局设置
│       └── upload_routes.js       # 文件上传
├── dashboard/
│   ├── index.html                # 单页应用入口
│   ├── css/
│   │   └── drawer_layout.css     # 统一布局 + 翻译UI
│   └── js/
│       ├── app.js                # 主应用（i18n化）
│       └── logger.js             # 日志系统
├── config/
│   ├── default.json              # 服务器配置
│   ├── i18n/
│   │   ├── zh.json              # 中文语言包
│   │   └── en.json              # 英文语言包
│   └── translation_cultural.json  # ⭐ 文化映射库
└── data.db                      # SQLite 数据库
```

---

## 📋 版本历史

### v2.0 (2026-04-12) ⭐ 重大更新

**新增功能：**
- 🌍 **语种翻译系统**：智能文化适配翻译，支持 0-100 改编强度
  - 深度文化映射：红包→Christmas gifts、过年→Christmas、地主→plantation owner
  - 10大文化分类覆盖：食物/节日/神祇/社会阶层/建筑/服饰/习俗/货币/时代背景
  - 变更预览 + 一键接受/拒绝
- 🎨 **工具栏重构**：文档+日志按钮、i18n双语支持
- 🔧 **翻译 API**：validate 格式验证、categories 查询

**修复：**
- 工具栏重复渲染（body静态 + app.js动态）
- i18n 语言切换同步问题
- 翻译 Tab 事件绑定时序问题

**文档：**
- README 完整更新
- API 文档同步

### v1.x (早期版本)

- 女娲引擎基础架构
- 创世树核心
- 书本管理 CRUD
- 主题系统

---

## 🛠️ 技术栈

| 组件 | 技术 |
|------|------|
| 后端 | Node.js + Fastify |
| 数据库 | SQLite |
| 前端 | 原生 JS（无框架）+ CSS 变量 |
| AI | OpenAI / Claude / MOSS-Core（可配置） |
| i18n | 内联翻译系统（中/EN） |

---

## 📄 License

MIT

---

*SoulWriter - 不是工具，是伙伴。*
