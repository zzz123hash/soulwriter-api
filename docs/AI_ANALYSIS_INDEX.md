# AI分析系统索引 (ai_analysis.js)

## 文件信息
- **路径**: dashboard/js/modules/ai/ai_analysis.js
- **总行数**: 603行
- **最后更新**: 2026-04-13

---

## 4个核心组件

### 1. ScoreRing (行15-82)
**功能**: 圆环打分组件

\`\`\`javascript
ScoreRing.render(value, label, options)
\`\`\`

| 方法 | 行号 | 说明 |
|------|------|------|
| render() | 17 | 渲染单个圆环 |
| renderMultiple() | ~60 | 渲染多个圆环 |

**样式类**: `.score-ring`, `.score-ring--excellent`, `.score-ring--good`, `.score-ring--poor`

---

### 2. NodeAICard (行83-327)
**功能**: 节点AI分析卡片

\`\`\`javascript
NodeAICard.render(nodeData)
NodeAICard.showDetail(nodeId)
\`\`\`

| 方法 | 行号 | 说明 |
|------|------|------|
| render() | 85 | 渲染卡片 |
| showDetail() | ~200 | 显示详情 |

---

### 3. CharacterAICard (行328-467)
**功能**: 人物饱满度分析

\`\`\`javascript
CharacterAICard.analyze(characterId)
CharacterAICard.render(data)
\`\`\`

| 方法 | 行号 | 说明 |
|------|------|------|
| analyze() | 330 | 分析人物 |
| render() | 350 | 渲染分析结果 |

**分析维度**: 角色背景、性格、动机、关系网、剧情参与度

---

### 4. BatchAnalyze (行468-603)
**功能**: 批量分析

\`\`\`javascript
BatchAnalyze.start(options)
BatchAnalyze.progress(callback)
BatchAnalyze.complete(results)
\`\`\`

| 方法 | 行号 | 说明 |
|------|------|------|
| start() | 470 | 开始批量分析 |
| progress() | ~500 | 进度回调 |
| complete() | ~550 | 完成处理 |

---

## 依赖关系
```
ai_analysis.js
├── ScoreRing (基础组件)
├── NodeAICard (依赖ScoreRing)
├── CharacterAICard (依赖ScoreRing)
└── BatchAnalyze (调用NodeAICard/CharacterAICard)
```

---

## 使用示例
\`\`\`javascript
// 渲染圆环打分
ScoreRing.render(85, "角色饱满度");

// 分析节点
NodeAICard.analyze({ nodeId: "xxx", type: "role" });

// 批量分析
BatchAnalyze.start({ nodes: [...], characters: [...] });
\`\`\`

---

## 修改记录
| 日期 | 修改内容 |
|------|----------|
| 2026-04-13 | 创建索引文档 |
