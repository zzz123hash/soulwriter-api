# 单元编辑系统 原型设计

## 最小可运行版本

### 数据结构

```javascript
// 节点 (Node) - 固定模板
const NodeTemplate = {
  id: "n001",
  type: "role",
  name: "林冲",
  template: "林冲，豹子头，八十万禁军教头，性格刚烈"
}

// 片段 (Fragment) - 节点的实例
const Fragment = {
  id: "f001",
  nodeId: "n001",
  time: "子时三刻",
  place: "野猪林",
  characters: ["林冲", "薛霸", "董超"],
  content: "薛霸将水火棍照着林冲脑袋劈将下来...",
  emotion: "紧张、危机",
  perspective: "林冲"
}

// 单元 (Unit) - 章节
const Unit = {
  id: "u001",
  title: "第一章 野猪林",
  fragments: [f001, f002, f003...],
  perspective: "林冲",
  perspectiveScore: 85,
  settings: {
    dialogueRatio: 30,
    sceneryRatio: 20,
    emotionRatio: 50
  }
}
```

### 界面原型

```
+------------------------------------------+
| 单元：第一章野猪林                        |
| 视角：林冲(85分) OK                      |
+------------------------------------------+
| [时间线]                                  |
| +--------------------------------------+ |
| | o 片段1: 子时三刻 野猪林             | |
| |   角色: 林冲、薛霸、董超            | |
| |   事件: 薛霸欲害林冲                | |
| |   [编辑] [删除]                     | |
| +--------------------------------------+ |
| +--------------------------------------+ |
| | o 片段2: ...                        | |
| +--------------------------------------+ |
+------------------------------------------+
| [+ 添加片段]                              |
+------------------------------------------+
```

### 角色评分系统

```javascript
function calculatePerspectiveScore(roleId, unit) {
  const fragments = unit.fragments.filter(f => f.perspective === roleId);
  const totalFragments = unit.fragments.length;
  
  // 素材量：角色出现的片段占比
  const materialScore = (fragments.length / totalFragments) * 100;
  
  // 对话量：角色对话占所有对话的比例
  const dialogueScore = calculateDialogueScore(roleId, fragments);
  
  // 冲突参与：涉及冲突的片段数
  const conflictScore = calculateConflictScore(roleId, fragments);
  
  return {
    materialScore,
    dialogueScore,
    conflictScore,
    total: (materialScore * 0.5 + dialogueScore * 0.3 + conflictScore * 0.2)
  };
}
```

### 转写条件

- totalScore > 80 -> 第一人称
- totalScore 50-80 -> 第三人称
- totalScore < 50 -> 同人文

