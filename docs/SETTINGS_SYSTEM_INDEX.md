# 设置系统索引 (settings_system.js)

## 文件信息
- **路径**: dashboard/js/modules/settings/settings_system.js
- **总行数**: 594行
- **最后更新**: 2026-04-13

---

## 主对象: SettingsSystem

### 功能区块

| 区块 | 行号 | 功能 |
|------|------|------|
| API配置列表 | 12 | apiConfigs数组 |
| 用途路由配置 | 15 | routeConfigs对象 |
| 初始化 | 26 | init() |
| 加载配置 | 32 | loadConfigs() |
| 渲染内页设置 | 45 | renderInPageSettings() |
| 外观设置 | 288 | renderAppearanceSettings() |
| API设置 | 333 | renderAPISettings() |
| 用途路由设置 | 391 | renderRouteSettings() |
| 关于 | 430 | renderAboutSection() |
| 添加新配置 | 450 | addNewConfig() |
| 保存配置 | 467 | saveConfig() |
| 删除配置 | 484 | deleteConfig() |
| 刷新API面板 | 500 | refreshAPIPanel() |
| 保存所有设置 | 508 | saveAllSettings() |
| 获取路由模型 | 542 | getRouteModel() |

### 用途路由 (routeConfigs)
\`\`\`javascript
routeConfigs: {
  writing: null,    // 写作
  plot: null,       // 事件线
  translate: null,  // 翻译
  nvwa: null,      // 女娲
  analysis: null,   // 综合分析
  default: null     // 默认
}
\`\`\`

---

## 依赖
- window._i18n (国际化)
- /api/settings/ai-configs (API)

---

## 修改记录
| 日期 | 修改内容 |
|------|----------|
| 2026-04-13 | 创建索引文档 |
