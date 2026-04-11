# 梦编任务 - Dashboard组件开发

## 已完成模块
✅ relationship/graph.js - 3D关系图谱类
✅ items/manager.js - 物品管理类  
✅ locations/manager.js - 地点管理类
✅ nvwa/engine.js - 女娲推演引擎

## 接下来任务

### 1. Dashboard HTML/CSS/JS 重构
参考：/root/.openclaw/workspace/docs/绘梦架构设计方案.md

目录结构：
- dashboard/index.html - 主页面
- dashboard/css/ - 样式文件
- dashboard/js/ - JavaScript文件
- dashboard/components/ - 组件

### 2. 组件开发
需要创建：
- components/sidebar.js - 侧边栏
- components/role-card.js - 角色卡片
- components/item-card.js - 物品卡片
- components/location-card.js - 地点卡片
- components/relationship-graph.js - 关系图谱界面
- components/nvwa-panel.js - 女娲推演面板

### 3. API路由
创建：
- routes/items.js - 物品CRUD
- routes/locations.js - 地点CRUD
- routes/nvwa.js - 女娲推演

### 4. 集成测试
- npm install 安装依赖
- 启动服务测试

## 参考文档
- 架构设计：/root/.openclaw/workspace/docs/绘梦架构设计方案.md
- 组件模块：~/workspace/soulwriter-api/src/modules/

## 优先级
1. Dashboard基础结构
2. 侧边栏组件
3. 角色/物品/地点卡片
4. 关系图谱集成
5. 女娲推演面板
