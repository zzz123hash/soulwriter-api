# SoulWriter - 灵魂创作者

> 专为小说作者设计的本地创作工具，支持记忆宫殿、角色关系、剧情推演

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0-green.svg)

## 功能特点

### 📚 书本管理
- 创建/导入/删除书本
- 每个书本独立存储（.soul文件）
- 书架式首页展示

### 🎭 女娲推演
- 角色管理（人物设定、属性）
- 物品系统（装备、道具）
- 地点场景（故事发生的场所）

### 🌳 创世树
- 剧情结构可视化
- 节点关系管理
- 记忆宫殿节点

### 🔍 语义搜索（规划中）
- 向量索引
- 内容智能检索

## 快速开始

### 安装

```bash
git clone https://github.com/zzz123hash/soulwriter-api.git
cd soulwriter-api
npm install
```

### 启动

```bash
npm start
# 访问 http://localhost:3000
```

### API文档

- [用户手册](./docs/User-Guide-v1.1.md)
- [API文档](./docs/API-v1.1.md)

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Node.js + Fastify |
| 数据库 | SQLite (better-sqlite3) |
| 前端 | 原生HTML/CSS/JS |
| 向量 | transformers.js (规划中) |

## 项目结构

```
soulwriter-api/
├── src/
│   ├── app.js              # 主入口
│   ├── books_routes.js     # Books API
│   ├── books_service.js    # Books服务
│   └── ...
├── dashboard/              # 前端页面
│   ├── js/app.js          # 主逻辑
│   └── css/main.css      # 样式
├── docs/                   # 文档
│   ├── User-Guide-v1.1.md
│   └── API-v1.1.md
└── books_data/            # 数据存储
```

## 版本历史

### v1.1 (2026-04-11)
- ✅ Books模块完成
- ✅ 导入/导出功能
- ✅ 文档完善

### v1.0 (2026-04-10)
- ✅ 基础框架
- ✅ 女娲推演引擎
- ✅ 创世树

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT
