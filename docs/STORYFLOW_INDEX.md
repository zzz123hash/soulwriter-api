# 故事流引擎索引 (storyflow_engine.js)

## 文件信息
- **路径**: dashboard/js/modules/story/storyflow_engine.js
- **总行数**: 407行
- **最后更新**: 2026-04-13

---

## 5个核心组件

### 1. VectorMemory (行12-94)
**功能**: 向量记忆存储
\`\`\`javascript
VectorMemory.add(text, metadata)
VectorMemory.search(query)
\`\`\`

### 2. TurnTracker (行95-143)
**功能**: 轮次追踪
\`\`\`javascript
TurnTracker.start()
TurnTracker.next()
\`\`\`

### 3. ContextAnalyzer (行144-223)
**功能**: 上下文分析
\`\`\`javascript
ContextAnalyzer.analyze()
\`\`\`

### 4. NaturalWriter (行224-277)
**功能**: 自然写作生成
\`\`\`javascript
NaturalWriter.write(prompt)
\`\`\`

### 5. StoryFlowEngine (行278-401)
**功能**: 故事流引擎主控制器
\`\`\`javascript
StoryFlowEngine.init()
StoryFlowEngine.process()
\`\`\`

### 6. bindStoryFlowEvents (行402-407)
**功能**: 事件绑定

---

## 修改记录
| 日期 | 修改内容 |
|------|----------|
| 2026-04-13 | 创建索引文档 |
