# 女娲引擎索引 (nvwa_engine.js)

## 文件信息
- **路径**: src/nvwa_engine.js
- **总行数**: 453行
- **最后更新**: 2026-04-13

---

## 依赖
- better-sqlite3
- path
- crypto

---

## 数据库表
- nvwa_souls - 女娲角色
- nvwa_world_vars - 世界变量
- nvwa_logs - 日志
- nvwa_events - 事件

---

## 核心函数

| 函数 | 行号 | 功能 |
|------|------|------|
| initNvwaDB() | 26 | 初始化数据库 |
| extractJsonObject() | 76 | 提取JSON |
| sanitizeAttrKey() | 92 | 清理属性键 |
| normalizeName() | 101 | 规范化名字 |
| resolveCharacterId() | 105 | 解析角色ID |
| buildNvwaSimPrompt() | 130 | 构建Prompt |
| buildStagePrompt() | 150 | 构建舞台Prompt |
| calculateTensionFocus() | 389 | 计算张力 |
| getRelationshipAbs() | 427 | 获取关系绝对值 |
| hasExtremeStats() | 438 | 检查极端属性 |

---

## 常量
- DEFAULT_ATTRS: health, sanity, wealth, combat, luck, fortune, charm, intelligence, vitality

---

## 修改记录
| 日期 | 修改内容 |
|------|----------|
| 2026-04-13 | 创建索引文档 |
