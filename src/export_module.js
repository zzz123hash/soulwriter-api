/**
 * 绘梦 - 导出模块
 * 支持 TXT / JSON / Markdown 格式导出
 */

const Database = require('better-sqlite3');
const path = require('path');

// 导出项目为TXT
function exportProjectToTxt(db, projectId) {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
  if (!project) return null;
  
  const roles = db.prepare('SELECT * FROM roles WHERE projectId = ?').all(projectId);
  const items = db.prepare('SELECT * FROM items WHERE projectId = ?').all(projectId);
  const locations = db.prepare('SELECT * FROM locations WHERE projectId = ?').all(projectId);
  const settings = db.prepare('SELECT * FROM settings WHERE projectId = ?').all(projectId);
  
  let content = `# ${project.name}\n\n`;
  content += `创建时间: ${project.createdAt}\n\n`;
  
  // 角色
  if (roles.length > 0) {
    content += `## 角色 (${roles.length})\n\n`;
    roles.forEach(role => {
      const soulData = typeof role.soulData === 'string' ? JSON.parse(role.soulData) : (role.soulData || {});
      content += `### ${role.name}\n`;
      content += `属性: ${JSON.stringify(soulData.attributes || {})}\n\n`;
    });
  }
  
  // 物品
  if (items.length > 0) {
    content += `## 物品 (${items.length})\n\n`;
    items.forEach(item => {
      content += `- ${item.name}: ${item.description || ''}\n`;
    });
    content += '\n';
  }
  
  // 地点
  if (locations.length > 0) {
    content += `## 地点 (${locations.length})\n\n`;
    locations.forEach(loc => {
      content += `- ${loc.name}: ${loc.description || ''}\n`;
    });
    content += '\n';
  }
  
  // 设置
  if (settings.length > 0) {
    content += `## 世界设定\n\n`;
    settings.forEach(s => {
      content += `- ${s.key}: ${s.value}\n`;
    });
  }
  
  return content;
}

// 导出项目为JSON
function exportProjectToJson(db, projectId) {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
  if (!project) return null;
  
  const roles = db.prepare('SELECT * FROM roles WHERE projectId = ?').all(projectId);
  const items = db.prepare('SELECT * FROM items WHERE projectId = ?').all(projectId);
  const locations = db.prepare('SELECT * FROM locations WHERE projectId = ?').all(projectId);
  const settings = db.prepare('SELECT * FROM settings WHERE projectId = ?').all(projectId);
  
  // 解析soulData
  const parsedRoles = roles.map(role => {
    try {
      role.soulData = typeof role.soulData === 'string' ? JSON.parse(role.soulData) : (role.soulData || {});
      role.attrs = typeof role.attrs === 'string' ? JSON.parse(role.attrs) : (role.attrs || []);
    } catch (e) {}
    return role;
  });
  
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    project: {
      id: project.id,
      name: project.name,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    },
    roles: parsedRoles,
    items: items,
    locations: locations,
    settings: settings.map(s => ({ key: s.key, value: s.value }))
  };
}

// 导出项目为Markdown
function exportProjectToMarkdown(db, projectId) {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
  if (!project) return null;
  
  const roles = db.prepare('SELECT * FROM roles WHERE projectId = ?').all(projectId);
  const items = db.prepare('SELECT * FROM items WHERE projectId = ?').all(projectId);
  const locations = db.prepare('SELECT * FROM locations WHERE projectId = ?').all(projectId);
  const settings = db.prepare('SELECT * FROM settings WHERE projectId = ?').all(projectId);
  
  let md = `# ${project.name}\n\n`;
  md += `> 导出时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
  
  // 角色
  md += `## 角色\n\n`;
  if (roles.length === 0) {
    md += '*暂无角色*\n\n';
  } else {
    roles.forEach(role => {
      try {
        const soulData = typeof role.soulData === 'string' ? JSON.parse(role.soulData) : (role.soulData || {});
        const attrs = soulData.attributes || {};
        
        md += `### ${role.name}\n\n`;
        md += `| 属性 | 值 |\n|-----|-----|\n`;
        Object.entries(attrs).forEach(([k, v]) => {
          md += `| ${k} | ${v} |\n`;
        });
        md += '\n';
      } catch (e) {
        md += `### ${role.name}\n\n`;
        md += `*数据解析错误*\n\n`;
      }
    });
  }
  
  // 物品
  md += `## 物品\n\n`;
  if (items.length === 0) {
    md += '*暂无物品*\n\n';
  } else {
    items.forEach(item => {
      md += `- **${item.name}**: ${item.description || ''}\n`;
    });
    md += '\n';
  }
  
  // 地点
  md += `## 地点\n\n`;
  if (locations.length === 0) {
    md += '*暂无地点*\n\n';
  } else {
    locations.forEach(loc => {
      md += `- **${loc.name}**: ${loc.description || ''}\n`;
    });
    md += '\n';
  }
  
  // 设置
  md += `## 世界设定\n\n`;
  if (settings.length === 0) {
    md += '*暂无设定*\n\n';
  } else {
    md += '| 键 | 值 |\n|-----|-----|\n';
    settings.forEach(s => {
      md += `| ${s.key} | ${s.value} |\n`;
    });
    md += '\n';
  }
  
  md += `---\n*由绘梦 SoulWriter 导出*\n`;
  
  return md;
}

// 导出女娲数据
function exportNvwaToTxt(db, projectId) {
  const souls = db.prepare("SELECT * FROM nvwa_souls WHERE status = 'active'").all();
  const worldVars = db.prepare('SELECT * FROM nvwa_world_vars').all();
  
  let content = `# 女娲推演数据\n\n`;
  content += `导出时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
  
  content += `## 世界变量\n\n`;
  worldVars.forEach(v => {
    content += `- ${v.key}: ${v.value}\n`;
  });
  
  content += `\n## 角色\n\n`;
  souls.forEach(soul => {
    try {
      const attrs = typeof soul.attributes === 'string' ? JSON.parse(soul.attributes) : (soul.attributes || {});
      content += `### ${soul.name}\n\n`;
      content += `属性:\n`;
      Object.entries(attrs).forEach(([k, v]) => {
        content += `- ${k}: ${v}\n`;
      });
      content += '\n';
    } catch (e) {
      content += `### ${soul.name}\n\n`;
      content += `*数据解析错误*\n\n`;
    }
  });
  
  return content;
}

// 导出创世树
function exportGenesisToTxt(db, seedId) {
  const seed = db.prepare('SELECT * FROM genesis_seeds WHERE id = ?').get(seedId);
  if (!seed) return null;
  
  const nodes = db.prepare('SELECT * FROM genesis_nodes WHERE seedId = ? ORDER BY depth, positionY').all(seedId);
  const edges = db.prepare(`
    SELECT e.* FROM genesis_edges e
    JOIN genesis_nodes n ON e.sourceId = n.id
    WHERE n.seedId = ?
  `).all(seedId);
  
  let content = `# ${seed.coreConflict || '创世树'}\n\n`;
  content += `## 核心冲突: ${seed.coreConflict}\n`;
  content += `## 背景基调: ${seed.backgroundTone}\n`;
  content += `## 关键伏笔: ${seed.keyForeshadowing}\n\n`;
  
  content += `## 剧情节点 (${nodes.length})\n\n`;
  
  // 按深度缩进显示
  nodes.forEach(node => {
    const indent = '  '.repeat(node.depth);
    const prefix = node.depth === 0 ? '●' : '○';
    content += `${indent}${prefix} ${node.label}`;
    if (node.description) {
      content += `\n${indent}  ${node.description}`;
    }
    content += '\n';
  });
  
  return content;
}

module.exports = {
  exportProjectToTxt,
  exportProjectToJson,
  exportProjectToMarkdown,
  exportNvwaToTxt,
  exportGenesisToTxt
};
