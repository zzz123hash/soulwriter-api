# SoulWriter API 文档

> 版本：v1.1 | 更新：2026-04-11

## 概述

SoulWriter API 采用 **Action风格**（统一端点 + action参数）。

**基础URL：** http://localhost:3000

---

## 核心API - Books 模块

### 统一端点
```
POST /api/books
```

**请求体：**
```json
{
  "action": "create|list|get|update|delete",
  ...其他参数
}
```

---

### 1. 创建书本 ✅

**请求：**
```json
POST /api/books
{
  "action": "create",
  "title": "凡人修仙传",
  "author": "忘语",
  "description": "一个凡人修仙的故事"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "b_1775905420613_qat4g1rew",
    "title": "凡人修仙传",
    "author": "忘语",
    "description": "一个凡人修仙的故事",
    "status": "draft",
    "wordCount": 0,
    "createdAt": "2026-04-11T11:03:40.613Z"
  }
}
```

---

### 2. 获取所有书本 ✅

**请求：**
```json
POST /api/books
{
  "action": "list"
}
```

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": "b_xxx",
      "title": "凡人修仙传",
      "author": "忘语",
      "wordCount": 0
    }
  ]
}
```

---

### 3. 获取单个书本详情 ✅

**请求：**
```json
POST /api/books
{
  "action": "get",
  "id": "b_xxx"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "b_xxx",
    "title": "凡人修仙传",
    "chapters": [
      { "id": "ch_xxx", "title": "第一章", "content": "" }
    ]
  }
}
```

---

### 4. 更新书本 ✅

**请求：**
```json
POST /api/books
{
  "action": "update",
  "id": "b_xxx",
  "title": "新书名",
  "author": "新作者"
}
```

---

### 5. 删除书本 ✅

**请求：**
```json
POST /api/books
{
  "action": "delete",
  "id": "b_xxx"
}
```

---

## 书架 API

### 创建书架 ✅
```
POST /api/bookshelves
```
```json
{
  "name": "玄幻小说",
  "description": "玄幻类作品"
}
```

### 获取所有书架 ✅
```
GET /api/bookshelves
```

---

## 章节 API

### 创建章节 ✅
```
POST /api/chapters
```
```json
{
  "action": "create",
  "bookId": "b_xxx",
  "title": "第一章 穿越",
  "content": "..."
}
```

### 更新章节 ✅
```
POST /api/chapters
```
```json
{
  "action": "update",
  "bookId": "b_xxx",
  "id": "ch_xxx",
  "title": "新标题",
  "content": "新内容"
}
```

### 删除章节 ✅
```
POST /api/chapters
```
```json
{
  "action": "delete",
  "bookId": "b_xxx",
  "id": "ch_xxx"
}
```

---

## 记忆宫殿 API

### 获取节点 ✅
```
GET /api/palace/:bookId
```

### 创建节点 ✅
```
POST /api/palace
```
```json
{
  "bookId": "b_xxx",
  "type": "plot",
  "label": "主角穿越",
  "description": "描述...",
  "positionX": 100,
  "positionY": 200
}
```

---

## 向量 API（待实现）

### 生成向量
```
POST /api/vector/generate
```
```json
{
  "text": "要向量化的文本",
  "field": "content|title|description"
}
```

---

## 旧API（兼容）

### 书本
| 方法 | 端点 | 状态 |
|------|------|------|
| POST | /api/v1/projects | ✅ 兼容 |
| GET | /api/v1/projects | ✅ 兼容 |
| DELETE | /api/v1/projects/:id | ✅ 兼容 |

### 角色 ✅
```
POST   /api/v1/roles
GET    /api/v1/projects/:projectId/roles
PUT    /api/v1/roles/:id
DELETE /api/v1/roles/:id
```

### 物品 ✅
```
POST   /api/v1/items
GET    /api/v1/projects/:projectId/items
```

### 地点 ✅
```
POST   /api/v1/locations
GET    /api/v1/projects/:projectId/locations
```

### 章节 ✅
```
POST /api/v1/chapters
GET  /api/v1/projects/:projectId/chapters
```

### 创世树 ✅
```
POST /api/v1/genesis/nodes
GET  /api/v1/genesis/nodes?projectId=:id
```

---

## 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 示例

### 使用fetch创建书本
```javascript
const res = await fetch('/api/books', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'create',
    title: '我的小说',
    author: '作者名'
  })
});
const data = await res.json();
console.log(data);
```

---

*最后更新：2026-04-11*
