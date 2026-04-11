# SoulWriter API 文档

## 概述
SoulWriter API 是一个 RESTful 接口。

**基础URL：** http://localhost:3000/api/v1

---

## 书本 (Projects)

### 创建书本
POST /projects


### 获取所有书本
GET /projects

### 删除书本
DELETE /projects/:id

---

## 角色 (Roles)

### 创建角色
POST /roles


### 获取项目的角色
GET /projects/:projectId/roles

---

## 物品 (Items)

### 创建物品
POST /items


---

## 地点 (Locations)

### 创建地点
POST /locations


---

## 章节 (Chapters)

### 创建章节
POST /chapters


### 获取章节
GET /projects/:projectId/chapters

---

## 场景 (Scenes)

### 创建场景
POST /scenes


---

## 创世树 (Genesis)

### 创建节点
POST /genesis/nodes


### 获取节点
GET /genesis/nodes?projectId=:projectId

---

## 示例



---

*最后更新：2026-04-11*
