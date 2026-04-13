# SoulWriter app.js 索引文档

## 文件信息
- **路径**: dashboard/js/app.js
- **总行数**: 3215行
- **最后更新**: 2026-04-13
- **仓库**: https://github.com/zzz123hash/soulwriter-api

---

## 17个部分概览

| 部分 | 行号范围 | 功能 |
|------|----------|------|
| 1. i18n国际化 | 1-133 | 多语言支持 |
| 2. 图标和工具函数 | 133-398 | 图标库、转义、状态 |
| 3. 导航树 | 398-447 | 导航结构配置 |
| 4. 渲染函数 | 447-964 | 抽屉、面板渲染 |
| 5. 设置功能 | 964-1084 | 全局/书本设置 |
| 6. Tab渲染 | 1084-1337 | 首页、事件Tab |
| 7. 事件时间线 | 1337-1356 | 事件Tab入口 |
| 8. 女娲系统 | 1356-1368 | 女娲Tab入口 |
| 9. 实体详情 | 1368-1449 | 实体弹窗、API |
| 10. 书籍管理 | 1449-1621 | 书架CRUD |
| 11. 事件绑定 | 1621-1808 | 欢迎页、书本事件 |
| 12. 导航事件 | 1808-1914 | 抽屉导航事件 |
| 13. Tab事件 | 1914-2288 | Tab切换事件 |
| 14. 时间线渲染 | 2288-2531 | 事件线渲染 |
| 15. 女娲记忆 | 2531-2809 | 女娲数据加载 |
| 16. 翻译系统 | 2868-3207 | 翻译Tab |
| 17. 初始化 | 2811-2868 | 初始化入口 |

---

## 关键函数索引

### 初始化流程
1. `init()` 行2812 - 初始化入口
2. `renderApp()` 行179 - 主渲染
3. `loadBooks()` 行1437 - 加载书架

### 状态管理
- `state` 行94 - 全局状态
- `window.state` - 状态引用

### 渲染入口
- `renderApp()` → 判断 welcome/book 视图
- `renderWelcome()` → 书架页
- `renderBookView()` → 书本内视图
- `renderToolbar()` → 顶部工具栏
- `renderLeftDrawerNav()` → 左侧抽屉

### Tab渲染
- `renderHomeTab()` → 首页Tab
- `renderEventTab()` → 事件线Tab
- `renderNvwaTab()` → 女娲Tab
- `renderTranslateTab()` → 翻译Tab
- `renderGenesisTab()` → 创世树Tab

### 事件绑定
- `bindWelcomeEvents()` → 书架页事件
- `bindBookEvents()` → 书本页事件
- `bindDrawerNavEvents()` → 抽屉导航
- `bindTabContentEvents()` → Tab内容
- `bindDetailEvents()` → 详情面板

### 数据API
- `booksApi()` → 书本CRUD
- `loadBookData()` → 加载书本数据
- `loadEventTimeline()` → 加载事件线
- `loadNvwaData()` → 加载女娲数据

### 实体操作
- `createRole()` → 创建角色 (已实现API)
- `parseNovel()` → 解析小说 (已实现API)
- `refreshRoleList()` → 刷新角色列表
- `showRoleDetail()` → 显示角色详情

---

## 状态对象结构 (state)

\`\`\`javascript
state = {
  currentView: 'welcome' | 'book',  // 当前视图
  currentTab: 'home',                    // 当前Tab
  currentEntity: 'roles',                // 当前实体类型
  leftDrawerOpen: false,                         // 抽屉是否展开
  selectedEntity: null,                           // 选中的实体
  currentBook: null,                              // 当前书本对象
  books: [],                                     // 书架列表
  events: [],                                    // 事件列表
  entityCounts: {}                               // 实体数量统计
}
\`\`\`

---

## 模块依赖关系

\`\`\`
init() [2812]
  └→ loadBooks() [1437]
       └→ booksApi() [1403]
  └→ renderApp() [179]
       ├→ renderWelcome() [217] ← bindWelcomeEvents() [1622]
       └→ renderBookView() [235]
            ├→ renderToolbar() [213]
            ├→ renderLeftDrawerNav() [448] ← bindDrawerNavEvents() [1809]
            └→ renderTabContent() [316]
                 ├→ renderHomeTab() [1085] ← bindTabContentEvents() [1915]
                 ├→ renderEventTab() [1338]
                 ├→ renderNvwaTab() [1357]
                 └→ ...其他Tab
\`\`\`

---

## 重构计划

将3215行单文件拆分为：

| 文件 | 内容 | 预估行数 |
|------|------|----------|
| app.js | 主入口、初始化 | 200 |
| app.state.js | 状态管理 | 100 |
| app.i18n.js | 国际化 | 150 |
| app.icons.js | 图标库 | 100 |
| app.ui.drawer.js | 抽屉渲染 | 400 |
| app.ui.toolbar.js | 工具栏 | 200 |
| app.ui.home.js | 首页Tab | 300 |
| app.ui.book.js | 书本视图 | 300 |
| app.ui.genesis.js | 创世树 | 200 |
| app.ui.event.js | 事件线 | 300 |
| app.ui.nvwa.js | 女娲 | 200 |
| app.ui.translate.js | 翻译 | 200 |
| app.api.js | API封装 | 200 |
| app.events.bind.js | 事件绑定 | 500 |
| app.events.handlers.js | 事件处理函数 | 300 |

---

## 修改记录

| 日期 | 修改内容 |
|------|----------|
| 2026-04-13 | 创建索引文档 |
