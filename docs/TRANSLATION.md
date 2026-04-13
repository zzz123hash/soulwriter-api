# 翻译系统说明

## 当前版本 (v2.0-v2.2)

### 实现方式
**规则 + AI混合模式**

1. **规则匹配**: 使用 config/translation_cultural.json 进行文化映射
2. **AI增强**: MiniMax推理模型生成内容

### 文化分类 (10类)
- food (食物)
- festival (节日)
- greetings (问候)
- deity (神祇)
- social_class (社会阶层)
- architecture (建筑)
- clothing (服饰)
- customs (习俗)
- currency (货币)
- era_setting (时代背景)

### 改编强度
| 强度 | 行为 |
|------|------|
| 0-20 | 基础翻译，只翻译文字 |
| 20-40 | 语义优化，保留文化背景 |
| 40-60 | 智能适配（默认）|
| 60-80 | 深度本土化 |
| 80-100 | AI完全重写 |

---

## 局限性

### 当前问题
1. **关键词替换**: 筷子 knife and fork，而非理解场景
2. **无情绪感知**: 悲伤场景可能用Christmas
3. **无人物背景**: 文人武将风格相同
4. **无场景适配**: 宫廷/江湖/现代混用

### 具体例子
原文：林冲风雪山神庙，悲愤交加

当前翻译：Lin Chong in the snowy mountain god temple, sad and angry
问题：山神庙变成欧美教堂风格，悲愤用sad过于平淡

理想翻译：Lin Chong, wind howling through the abandoned mountain shrine,
          grief and rage burning within

---

## 正在开发 (AI原生翻译)

### 设计目标
1. **语义理解**: 理解风雪山神庙的意境
2. **场景感知**: 识别宫廷/江湖/现代背景
3. **情绪适配**: 悲伤场景用低沉词汇
4. **人物背景**: 武将风格硬朗，文人用典含蓄

### 技术方案
输入: 原文 + 背景设定 + 人物设定 + 情绪状态
AI理解: 提取核心语义、情绪、文化要素
文化适配: 根据目标文化重新构建意象
输出: 符合目标文化的译文
