# SoulWriter API 文档

## 基础信息

- **Base URL**: `http://localhost:3000`
- **健康检查**: `GET /health`

---

## 项目管理

### 项目列表
```
GET /api/v1/projects
```

### 创建项目
```
POST /api/v1/projects
Body: { title, author? }
```

### 获取项目
```
GET /api/v1/projects/:id
```

### 更新项目
```
PUT /api/v1/projects/:id
Body: { title?, author? }
```

### 删除项目
```
DELETE /api/v1/projects/:id
```

---

## 角色管理

### 获取角色列表
```
GET /api/v1/projects/:projectId/roles
```

### 创建角色
```
POST /api/v1/roles
Body: { bookId, title, description? }
```

### 获取角色
```
GET /api/v1/roles/:id
```

### 更新角色
```
PUT /api/v1/roles/:id
Body: { title?, description? }
```

### 删除角色
```
DELETE /api/v1/roles/:id
```

---

## 物品管理

```
GET    /api/v1/items/:id
POST   /api/v1/items
        Body: { bookId, title, description? }
PUT    /api/v1/items/:id
DELETE /api/v1/items/:id
```

---

## 地点管理

```
GET    /api/v1/locations/:id
POST   /api/v1/locations
        Body: { bookId, title, description? }
PUT    /api/v1/locations/:id
DELETE /api/v1/locations/:id
```

---

## 女娲系统

### 状态
```
GET /api/v1/nvwa/status
```

### 分析
```
POST /api/v1/nvwa/analyze
Body: { text, bookId }
```

### 获取角色记忆
```
GET /api/v1/nvwa/memory/:characterId
```

---

## 翻译系统

### 获取支持的文化分类
```
GET /api/translate/categories
```

### 翻译
```
POST /api/translate
Body: {
  text: string,
  sourceLang: "zh",
  targetLang: "en",
  strength: 50
}
```

---

## 创世树

```
GET  /api/genesis/seeds
POST /api/genesis/seeds
GET  /api/genesis/seeds/:id
GET  /api/genesis/nodes/:id
GET  /api/genesis/nodes/:id/children
PUT  /api/genesis/nodes/:id
POST /api/genesis/nodes
      Body: { seedId, parentId?, title, type, content? }
```

---

## 上传解析

```
POST /api/split
Body: {
  text: string,
  depth: "normal" | "deep",
  bookId: string?
}
```
