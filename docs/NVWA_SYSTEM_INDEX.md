# 女娲系统v5索引 (nvwa_system_v5.js)

## 文件信息
- **路径**: dashboard/js/modules/nvwa/nvwa_system_v5.js
- **总行数**: 558行
- **最后更新**: 2026-04-13

---

## 核心功能: 队列式AI任务处理

### 功能区块

| 区块 | 行号 | 功能 |
|------|------|------|
| 状态机 | 9 | NvwaTaskStatus |
| 女娲能力列表 | 18 | abilities数组 |
| 初始化 | 58 | init() |
| 加载队列 | 64 | loadQueue() |
| 保存队列 | 72 | saveQueue() |
| 添加任务 | 77 | addTask() |
| 处理任务 | 100 | processNextTask() |
| Worker处理 | 174 | workerProcess() |
| Reviewer验证 | 195 | reviewerValidate() |
| Architect检查 | 222 | architectCheck() |
| 生成提示词 | 249 | generatePrompt() |
| 通知完成 | 294 | notifyComplete() |
| 更新UI | 302 | updateUI() |
| 渲染面板 | 310 | renderNvwaPanel() |
| 渲染队列 | 345 | renderQueue() |

### 状态
\`\`\`javascript
const NvwaTaskStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  REVIEWING: 'reviewing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};
\`\`\`

---

## 修改记录
| 日期 | 修改内容 |
|------|----------|
| 2026-04-13 | 创建索引文档 |
