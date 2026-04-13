# 书籍服务索引 (services/books_service.js)

## 文件信息
- **路径**: src/services/books_service.js
- **总行数**: 388行
- **最后更新**: 2026-04-13

---

## 依赖
- better-sqlite3
- fs
- path

---

## 核心函数

### 数据库
| 函数 | 行号 | 功能 |
|------|------|------|
| ensureDir() | 8 | 确保目录存在 |
| uuid() | 14 | 生成UUID |
| getIndexDb() | 18 | 获取索引数据库 |
| getBookDb() | 54 | 获取书本数据库 |

### 书架
| 函数 | 行号 | 功能 |
|------|------|------|
| createBookshelf() | 126 | 创建书架 |
| getAllBookshelves() | 136 | 获取所有书架 |

### 书本CRUD
| 函数 | 行号 | 功能 |
|------|------|------|
| createBook() | 144 | 创建书本 |
| getAllBooks() | 165 | 获取所有书本 |
| getBook() | 172 | 获取书本 |
| updateBook() | 196 | 更新书本 |
| deleteBook() | 217 | 删除书本 |

### 角色CRUD
| 函数 | 行号 | 功能 |
|------|------|------|
| createRole() | 231 | 创建角色 |
| getRoles() | 241 | 获取角色列表 |
| updateRole() | 248 | 更新角色 |
| deleteRole() | 257 | 删除角色 |

### 物品CRUD
| 函数 | 行号 | 功能 |
|------|------|------|
| createItem() | 265 | 创建物品 |
| getItems() | 275 | 获取物品列表 |
| updateItem() | 282 | 更新物品 |
| deleteItem() | 291 | 删除物品 |

### 地点CRUD
| 函数 | 行号 | 功能 |
|------|------|------|
| createLocation() | 299 | 创建地点 |
| getLocations() | ~310 | 获取地点列表 |
| updateLocation() | ~320 | 更新地点 |
| deleteLocation() | ~330 | 删除地点 |

---

## 数据库结构
- 索引数据库: data/index.db
- 书本数据库: data/books/{bookId}.db

---

## 修改记录
| 日期 | 修改内容 |
|------|----------|
| 2026-04-13 | 创建索引文档 |
