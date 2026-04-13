/**
 * 单元服务
 * 
 * 数据结构：
 * Unit = {
 *   id, bookId, title,
 *   fragments: [Fragment],
 *   perspective, perspectiveScore,
 *   settings: { dialogueRatio, sceneryRatio, emotionRatio },
 *   createdAt, updatedAt
 * }
 * 
 * Fragment = {
 *   id, unitId, nodeId,
 *   time, place, characters: [],
 *   content, emotion,
 *   perspective,
 *   position,
 *   createdAt, updatedAt
 * }
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

// ============ 小说生成 ============

async function generateNovel(unitId, settings) {
  const unit = getUnit(unitId);
  if (!unit) return { success: false, message: 'Unit not found' };
  
  settings = settings || {};
  const { dialogueRatio = 30, sceneryRatio = 20, emotionRatio = 50 } = settings;
  
  // 按时间线顺序组合片段生成小说
  const sortedFragments = [...(unit.fragments || [])].sort((a, b) => a.position - b.position);
  
  // 生成小说内容
  let content = '# ' + unit.title + '\n\n';
  
  for (let i = 0; i < sortedFragments.length; i++) {
    const f = sortedFragments[i];
    content += '## 第' + (i + 1) + '幕';
    if (f.time) content += ' ' + f.time;
    if (f.place) content += ' · ' + f.place;
    content += '\n\n';
    
    if (f.characters && f.characters.length) {
      content += '出场人物：' + f.characters.join('、') + '\n\n';
    }
    
    if (f.content) {
      content += f.content + '\n\n';
    }
    
    if (f.emotion) {
      content += '【情绪：' + f.emotion + '】\n\n';
    }
  }
  
  // TODO: 调用AI进行润色和扩展
  // const aiContent = await callAIForNovel(content, settings);
  
  const novel = {
    unitId,
    title: unit.title,
    perspective: unit.perspective,
    perspectiveScore: unit.perspectiveScore,
    settings,
    content: content,
    wordCount: content.length,
    createdAt: new Date().toISOString()
  };
  
  return {
    success: true,
    data: novel
  };
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
  
  // 按position排序
  mergedUnit.fragments.sort((a, b) => a.position - b.position);
  
  const units = getUnitDb(targetBookId);
  units.push(mergedUnit);
  saveUnitDb(targetBookId, units);
  
  return {
    success: true,
    data: mergedUnit
  };
}

// ============ 导出 ============

function exportUnit(unitId) {
  const unit = getUnit(unitId);
  if (!unit) return null;
  
  return {
    format: 'soulwriter-unit-v1',
    version: '1.0.0',
    data: unit,
    exportedAt: new Date().toISOString()
  };
}

function importUnit(bookId, exportData) {
  if (!exportData || exportData.format !== 'soulwriter-unit-v1') {
    return { success: false, message: 'Invalid format' };
  }
  
  const unit = exportData.data;
  unit.id = uuid();
  unit.bookId = bookId;
  unit.fragments = (unit.fragments || []).map(f => ({
    ...f,
    id: uuid()
  }));
  unit.createdAt = new Date().toISOString();
  unit.updatedAt = new Date().toISOString();
  
  const units = getUnitDb(bookId);
  units.push(unit);
  saveUnitDb(bookId, units);
  
  return {
    success: true,
    data: unit
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
  mergeUnits,
  exportUnit,
  importUnit
};
