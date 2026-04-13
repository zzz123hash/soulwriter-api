/**
 * 单元服务
 */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '../../data');
const UNITS_DIR = path.join(DATA_DIR, 'units');

// 确保目录存在
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UNITS_DIR)) fs.mkdirSync(UNITS_DIR, { recursive: true });

function uuid() {
  return crypto.randomUUID();
}

function getUnitFile(bookId) {
  return path.join(UNITS_DIR, bookId + '_units.json');
}

function getUnitDb(bookId) {
  const file = getUnitFile(bookId);
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function saveUnitDb(bookId, data) {
  const file = getUnitFile(bookId);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ============ 单元 CRUD ============

function createUnit(bookId, options) {
  options = options || {};
  const units = getUnitDb(bookId);
  const unit = {
    id: uuid(),
    bookId: bookId,
    title: options.title || '新章节',
    fragments: [],
    perspective: options.perspective || null,
    perspectiveScore: 0,
    settings: options.settings || {
      dialogueRatio: 30,
      sceneryRatio: 20,
      emotionRatio: 50
    },
    history: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  units.push(unit);
  saveUnitDb(bookId, units);
  return unit;
}

function getUnitsByBook(bookId) {
  return getUnitDb(bookId);
}

function getUnit(unitId) {
  const files = fs.readdirSync(UNITS_DIR);
  for (const file of files) {
    const units = JSON.parse(fs.readFileSync(path.join(UNITS_DIR, file), 'utf-8'));
    const unit = units.find(u => u.id === unitId);
    if (unit) return unit;
  }
  return null;
}

function updateUnit(unitId, updates) {
  const unit = getUnit(unitId);
  if (!unit) return null;
  
  Object.assign(unit, updates, { updatedAt: new Date().toISOString() });
  
  const units = getUnitDb(unit.bookId);
  const index = units.findIndex(u => u.id === unitId);
  if (index !== -1) {
    units[index] = unit;
    saveUnitDb(unit.bookId, units);
  }
  return unit;
}

function deleteUnit(unitId) {
  const unit = getUnit(unitId);
  if (!unit) return false;
  
  const units = getUnitDb(unit.bookId);
  const filtered = units.filter(u => u.id !== unitId);
  saveUnitDb(unit.bookId, filtered);
  return true;
}

// ============ 片段 CRUD ============

function addFragment(unitId, fragmentData) {
  fragmentData = fragmentData || {};
  const unit = getUnit(unitId);
  if (!unit) return null;
  
  const fragment = {
    id: uuid(),
    unitId: unitId,
    nodeId: fragmentData.nodeId || null,
    time: fragmentData.time || '',
    place: fragmentData.place || '',
    characters: fragmentData.characters || [],
    content: fragmentData.content || '',
    emotion: fragmentData.emotion || '',
    perspective: fragmentData.perspective || unit.perspective,
    position: unit.fragments.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  unit.fragments.push(fragment);
  updateUnit(unitId, { fragments: unit.fragments });
  
  return fragment;
}

function updateFragment(fragmentId, updates) {
  const unit = getUnitWithFragment(fragmentId);
  if (!unit) return null;
  
  const fragment = unit.fragments.find(f => f.id === fragmentId);
  if (!fragment) return null;
  
  Object.assign(fragment, updates, { updatedAt: new Date().toISOString() });
  updateUnit(unit.id, { fragments: unit.fragments });
  
  return fragment;
}

function deleteFragment(fragmentId) {
  const unit = getUnitWithFragment(fragmentId);
  if (!unit) return false;
  
  unit.fragments = unit.fragments.filter(f => f.id !== fragmentId);
  unit.fragments.forEach((f, i) => f.position = i);
  updateUnit(unit.id, { fragments: unit.fragments });
  
  return true;
}

function reorderFragments(unitId, fragmentIds) {
  const unit = getUnit(unitId);
  if (!unit) return false;
  
  const newFragments = [];
  for (const id of fragmentIds) {
    const f = unit.fragments.find(frag => frag.id === id);
    if (f) {
      f.position = newFragments.length;
      newFragments.push(f);
    }
  }
  unit.fragments = newFragments;
  updateUnit(unitId, { fragments: unit.fragments });
  return true;
}

function getUnitWithFragment(fragmentId) {
  const files = fs.readdirSync(UNITS_DIR);
  for (const file of files) {
    const units = JSON.parse(fs.readFileSync(path.join(UNITS_DIR, file), 'utf-8'));
    for (const unit of units) {
      if (unit.fragments && unit.fragments.find(f => f.id === fragmentId)) {
        return unit;
      }
    }
  }
  return null;
}

// ============ 角色评分 ============

function calculateRoleScores(unitId, roleId) {
  const unit = getUnit(unitId);
  if (!unit) return null;
  
  const fragments = (unit.fragments || [])
    .filter(f => (f.characters || []).indexOf(roleId) !== -1);
  
  if (!fragments.length) {
    return {
      materialScore: 0,
      dialogueScore: 0,
      conflictScore: 0,
      total: 0
    };
  }
  
  const totalFragments = (unit.fragments || []).length;
  
  // 素材量评分 (50%)
  const materialScore = Math.round((fragments.length / totalFragments) * 50);
  
  // 对话量评分 (30%)
  const dialogueScore = Math.min(30, fragments.length * 5);
  
  // 冲突参与评分 (20%)
  let conflictCount = 0;
  for (const f of fragments) {
    const c = f.content || '';
    if (c.includes('冲突') || c.includes('打') || c.includes('杀') || c.includes('战斗')) {
      conflictCount++;
    }
  }
  const conflictScore = Math.min(20, conflictCount * 10);
  
  const total = materialScore + dialogueScore + conflictScore;
  
  return {
    materialScore,
    dialogueScore,
    conflictScore,
    total,
    perspectiveType: total > 80 ? 'first-person' : (total > 50 ? 'third-person' : 'side-story')
  };
}

function calculateAllRoleScores(unitId) {
  const unit = getUnit(unitId);
  if (!unit) return [];
  
  const roleIds = new Set();
  for (const f of (unit.fragments || [])) {
    for (const c of (f.characters || [])) {
      roleIds.add(c);
    }
  }
  
  const scores = [];
  for (const roleId of roleIds) {
    const score = calculateRoleScores(unitId, roleId);
    scores.push({ roleId, ...score });
  }
  
  scores.sort((a, b) => b.total - a.total);
  return scores;
}

// ============ 视角转写 ============

async function rewritePerspective(unitId, targetRoleId, perspectiveType) {
  const unit = getUnit(unitId);
  if (!unit) return { success: false, message: 'Unit not found' };
  
  const score = calculateRoleScores(unitId, targetRoleId);
  
  if (perspectiveType === 'first-person' && score.total < 80) {
    return { 
      success: false, 
      message: '素材量不足，无法转写为第一人称，建议使用第三人称或同人文' 
    };
  }
  
  const rewrittenUnit = {
    ...unit,
    id: uuid(),
    title: unit.title + ' [' + perspectiveType + '视角]',
    perspective: targetRoleId,
    perspectiveScore: score.total,
    perspectiveType,
    originalUnitId: unitId,
    fragments: unit.fragments.map(f => ({
      ...f,
      id: uuid(),
      perspective: targetRoleId
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const units = getUnitDb(unit.bookId);
  units.push(rewrittenUnit);
  saveUnitDb(unit.bookId, units);
  
  return {
    success: true,
    data: {
      originalUnit: unit,
      rewrittenUnit,
      score
    }
  };
}

// ============ AI生成小说 ============

/**
 * 调用AI生成小说内容
 */
async function callAIForNovel(prompt, settings) {
  const configPath = path.join(__dirname, '../../config/default.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const aiConfig = config.ai;
  
  let content = '';
  
  try {
    if (aiConfig.defaultProvider === 'omnihex') {
      const provider = aiConfig.providers.omnihex;
      const url = `${provider.baseUrl}/v1/chat/completions`;
      
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.apiKey}`
        },
        body: JSON.stringify({
          model: provider.model || 'MiniMax-M2.7-highspeed',
          messages: [
            { role: 'system', content: '你是一个专业的小说作者，擅长根据故事大纲生成精彩的小说内容。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 8000
        })
      });
      
      if (!res.ok) {
        throw new Error('AI API error: ' + res.status);
      }
      
      const data = await res.json();
      // MiniMax uses reasoning_content, fall back to content
      content = data?.choices?.[0]?.message?.content || 
                data?.choices?.[0]?.message?.reasoning_content || '';
    } else {
      // Default OpenAI compatible
      const provider = aiConfig.providers.openai;
      const url = `${provider.baseUrl}/chat/completions`;
      
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.apiKey}`
        },
        body: JSON.stringify({
          model: provider.model || 'gpt-4',
          messages: [
            { role: 'system', content: '你是一个专业的小说作者。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 8000
        })
      });
      
      if (!res.ok) {
        throw new Error('AI API error: ' + res.status);
      }
      
      const data = await res.json();
      content = data?.choices?.[0]?.message?.content || '';
    }
  } catch (e) {
    console.error('[UnitService] callAIForNovel error:', e);
    throw e;
  }
  
  return content;
}

/**
 * 生成小说
 */
async function generateNovel(unitId, settings) {
  const unit = getUnit(unitId);
  if (!unit) return { success: false, message: 'Unit not found' };
  
  settings = settings || {};
  const { dialogueRatio = 30, sceneryRatio = 20, emotionRatio = 50 } = settings;
  
  // 按时间线顺序组合片段
  const sortedFragments = [...(unit.fragments || [])].sort((a, b) => a.position - b.position);
  
  if (!sortedFragments.length) {
    return { success: false, message: 'No fragments to generate from' };
  }
  
  // 构建故事大纲
  let outline = '【故事大纲】\n';
  outline += '标题：' + unit.title + '\n';
  outline += '视角：' + (unit.perspective || '第三人称') + '\n\n';
  
  outline += '【场景列表】\n';
  for (let i = 0; i < sortedFragments.length; i++) {
    const f = sortedFragments[i];
    outline += `\n--- 第${i + 1}幕 ---\n`;
    if (f.time) outline += '时间：' + f.time + '\n';
    if (f.place) outline += '地点：' + f.place + '\n';
    if (f.characters && f.characters.length) {
      outline += '人物：' + f.characters.join('、') + '\n';
    }
    if (f.content) outline += '内容：' + f.content + '\n';
    if (f.emotion) outline += '情绪：' + f.emotion + '\n';
  }
  
  outline += '\n\n【写作要求】\n';
  outline += '1. 对话比例：' + dialogueRatio + '%\n';
  outline += '2. 风景描写比例：' + sceneryRatio + '%\n';
  outline += '3. 情感表达比例：' + emotionRatio + '%\n';
  outline += '4. 请生成完整、流畅的小说章节内容\n';
  outline += '5. 如果是第一人称视角，以视角角色的口吻叙述\n';
  outline += '6. 保留原作的人物性格和语言风格\n';
  
  // 判断视角类型
  const perspectiveType = unit.perspective ? 
    (calculateRoleScores(unitId, unit.perspective)?.perspectiveType || 'third-person') : 
    'third-person';
  
  if (perspectiveType === 'first-person') {
    outline += '7. 采用第一人称叙述，突出视角角色的内心独白和感受\n';
  } else if (perspectiveType === 'side-story') {
    outline += '7. 可以加入番外、小剧场风格的补充内容\n';
  }
  
  try {
    console.log('[UnitService] Generating novel for unit:', unitId);
    const novelContent = await callAIForNovel(outline, settings);
    
    if (!novelContent) {
      return { success: false, message: 'AI生成失败，内容为空' };
    }
    
    const novel = {
      unitId,
      title: unit.title,
      perspective: unit.perspective,
      perspectiveScore: unit.perspectiveScore,
      perspectiveType,
      settings,
      content: novelContent,
      outline: outline,
      wordCount: novelContent.length,
      createdAt: new Date().toISOString()
    };
    
    return {
      success: true,
      data: novel
    };
  } catch (e) {
    console.error('[UnitService] generateNovel error:', e);
    return { success: false, message: 'AI生成失败: ' + e.message };
  }
}

// ============ 克隆与合并 ============

async function cloneUnit(unitId) {
  const unit = getUnit(unitId);
  if (!unit) return { success: false, message: 'Unit not found' };
  
  const clonedUnit = {
    ...unit,
    id: uuid(),
    title: unit.title + ' (副本)',
    fragments: unit.fragments.map(f => ({
      ...f,
      id: uuid()
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const units = getUnitDb(unit.bookId);
  units.push(clonedUnit);
  saveUnitDb(unit.bookId, units);
  
  return {
    success: true,
    data: clonedUnit
  };
}

async function mergeUnits(sourceUnitIds, targetBookId) {
  if (!sourceUnitIds || !sourceUnitIds.length) {
    return { success: false, message: 'No source units provided' };
  }
  
  const mergedUnit = {
    id: uuid(),
    bookId: targetBookId,
    title: '合并章节',
    fragments: [],
    perspective: null,
    perspectiveScore: 0,
    settings: {
      dialogueRatio: 30,
      sceneryRatio: 20,
      emotionRatio: 50
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  let position = 0;
  for (const unitId of sourceUnitIds) {
    const unit = getUnit(unitId);
    if (!unit) continue;
    
    for (const f of unit.fragments) {
      mergedUnit.fragments.push({
        ...f,
        id: uuid(),
        unitId: mergedUnit.id,
        position: position++
      });
    }
  }
  
  mergedUnit.fragments.sort((a, b) => a.position - b.position);
  
  const units = getUnitDb(targetBookId);
  units.push(mergedUnit);
  saveUnitDb(targetBookId, units);
  
  return {
    success: true,
    data: mergedUnit
  };
}

module.exports = {
  createUnit,
  getUnitsByBook,
  getUnit,
  updateUnit,
  deleteUnit,
  addFragment,
  updateFragment,
  deleteFragment,
  reorderFragments,
  calculateRoleScores,
  calculateAllRoleScores,
  rewritePerspective,
  generateNovel,
  cloneUnit,
  mergeUnits
};
