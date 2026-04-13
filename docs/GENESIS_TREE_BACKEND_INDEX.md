# 创世树后端索引 (genesis_tree.js)

## 文件信息
- **路径**: src/genesis_tree.js
- **总行数**: 275行
- **最后更新**: 2026-04-13

---

## 依赖
- better-sqlite3
- path
- crypto

---

## 数据库初始化
- initGenesisDB(): 创建genesis_seeds, genesis_nodes, genesis_edges表

---

## 核心函数

### 种子操作
| 函数 | 行号 | 功能 |
|------|------|------|
| initGenesisDB() | 13 | 初始化数据库 |
| createSeed() | 64 | 创建种子 |
| getSeed() | 86 | 获取种子 |

### 节点操作
| 函数 | 行号 | 功能 |
|------|------|------|
| createNode() | 91 | 创建节点 |
| getNode() | 128 | 获取节点 |
| getChildNodes() | 137 | 获取子节点 |
| getNodesBySeed() | 142 | 获取种子所有节点 |
| updateNode() | 147 | 更新节点 |
| deleteNode() | 249 | 删除节点 |

### 边操作
| 函数 | 行号 | 功能 |
|------|------|------|
| createEdge() | 166 | 创建边 |
| getEdgesBySeed() | 176 | 获取种子所有边 |

### 树构建
| 函数 | 行号 | 功能 |
|------|------|------|
| buildTree() | 199 | 构建完整树 |
| getPathToNode() | 185 | 获取到节点路径 |

---

## 修改记录
| 日期 | 修改内容 |
|------|----------|
| 2026-04-13 | 创建索引文档 |
