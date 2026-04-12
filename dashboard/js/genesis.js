/**
 * SoulWriter - 创世树 Genesis Tree
 * 可视化故事宇宙的演化
 */

const API_BASE = 'http://localhost:3000/api';

// 创世树状态
const genesisState = {
  nodes: [],
  connections: [],
  selectedNode: null,
  expandedNodes: new Set()
};

// 渲染创世树页面
function renderGenesis() {
  return `
    <div class="genesis-container">
      <div class="genesis-header">
        <h2 class="view-title">🌳 创世树</h2>
        <div class="genesis-actions">
          <button class="btn btn-primary" id="genesis-add-root">+ 核心</button>
          <button class="btn" id="genesis-auto">🤖 AI生成</button>
          <button class="btn" id="genesis-save">💾 保存</button>
        </div>
      </div>
      
      <div class="genesis-layout">
        <div class="genesis-tree" id="genesis-tree">
          <div class="tree-loading">🌱 加载创世树...</div>
        </div>
        
        <div class="genesis-panel" id="genesis-panel">
          <div class="panel-empty">
            <div class="panel-icon">🌿</div>
            <h3>创世树</h3>
            <p>点击节点查看详情<br>或创建新的故事元素</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// 初始化创世树
async function initGenesisTree() {
  if (!state.currentBook) return;
  
  // 加载已有数据
  const seeds = await api(`/genesis/seeds?projectId=${state.currentBook.id}`);
  const nodes = await api(`/genesis/nodes?projectId=${state.currentBook.id}`);
  
  genesisState.nodes = Array.isArray(nodes) ? nodes : [];
  genesisState.connections = Array.isArray(seeds) ? seeds : [];
  
  renderGenesisTree();
}

// 渲染树
function renderGenesisTree() {
  const container = document.getElementById('genesis-tree');
  if (!container) return;
  
  if (genesisState.nodes.length === 0) {
    container.innerHTML = `
      <div class="tree-empty">
        <div class="empty-tree-icon">🌳</div>
        <h3>创世树空空如也</h3>
        <p>点击「+核心」创建故事核心<br>或使用AI自动生成</p>
        <button class="btn btn-primary" onclick="showAddNodeModal('root')">🌱 创建核心</button>
      </div>
    `;
    return;
  }
  
  // 构建树结构
  const rootNodes = genesisState.nodes.filter(n => n.parentId === null);
  
  container.innerHTML = `
    <div class="tree-container">
      ${rootNodes.map(root => renderTreeNode(root)).join('')}
    </div>
  `;
  
  // 绑定节点事件
  bindTreeEvents();
}

// 渲染单个树节点
function renderTreeNode(node, level = 0) {
  const hasChildren = genesisState.nodes.some(n => n.parentId === node.id);
  const isExpanded = genesisState.expandedNodes.has(node.id);
  const children = genesisState.nodes.filter(n => n.parentId === node.id);
  const nodeType = getNodeTypeInfo(node.type);
  
  return `
    <div class="tree-node" data-id="${node.id}" data-level="${level}">
      <div class="node-card ${node.type}" style="margin-left: ${level * 40}px">
        <div class="node-expand ${hasChildren ? '' : 'hidden'}" data-id="${node.id}">
          ${isExpanded ? '▼' : '▶'}
        </div>
        <div class="node-icon">${nodeType.icon}</div>
        <div class="node-info">
          <div class="node-name">${node.name}</div>
          <div class="node-type">${nodeType.label}</div>
        </div>
        <div class="node-actions">
          <button class="node-btn" data-action="add" title="添加子节点">+</button>
          <button class="node-btn" data-action="edit" title="编辑">✏️</button>
          <button class="node-btn" data-action="delete" title="删除">🗑️</button>
        </div>
      </div>
      ${hasChildren && isExpanded ? `
        <div class="node-children">
          ${children.map(child => renderTreeNode(child, level + 1)).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

// 节点类型信息
function getNodeTypeInfo(type) {
  const types = {
    core: { icon: '🌟', label: '核心', color: '#f5c518' },
    character: { icon: '👤', label: '角色', color: '#3b82f6' },
    plot: { icon: '📖', label: '情节', color: '#e94560' },
    world: { icon: '🌍', label: '世界', color: '#22c55e' },
    theme: { icon: '💡', label: '主题', color: '#a855f7' },
    event: { icon: '⚡', label: '事件', color: '#f59e0b' },
    item: { icon: '🎁', label: '物品', color: '#06b6d4' },
    location: { icon: '📍', label: '地点', color: '#84cc16' }
  };
  return types[type] || types.core;
}

// 绑定树事件
function bindTreeEvents() {
  // 展开/折叠
  document.querySelectorAll('.node-expand').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (genesisState.expandedNodes.has(id)) {
        genesisState.expandedNodes.delete(id);
      } else {
        genesisState.expandedNodes.add(id);
      }
      renderGenesisTree();
    });
  });
  
  // 节点操作
  document.querySelectorAll('.node-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      const nodeCard = btn.closest('.tree-node');
      const nodeId = nodeCard.dataset.id;
      
      switch (action) {
        case 'add':
          showAddNodeModal('child', nodeId);
          break;
        case 'edit':
          showEditNodeModal(nodeId);
          break;
        case 'delete':
          deleteNode(nodeId);
          break;
      }
    });
  });
  
  // 节点选中
  document.querySelectorAll('.node-card').forEach(card => {
    card.addEventListener('click', () => {
      const nodeId = card.closest('.tree-node').dataset.id;
      showNodeDetail(nodeId);
    });
  });
}

// 显示节点详情
function showNodeDetail(nodeId) {
  const node = genesisState.nodes.find(n => n.id === nodeId);
  if (!node) return;
  
  const panel = document.getElementById('genesis-panel');
  const typeInfo = getNodeTypeInfo(node.type);
  
  panel.innerHTML = `
    <div class="node-detail">
      <div class="detail-header">
        <div class="detail-icon" style="background: ${typeInfo.color}">${typeInfo.icon}</div>
        <div class="detail-title">
          <h3>${node.name}</h3>
          <span class="detail-type">${typeInfo.label}</span>
        </div>
      </div>
      
      <div class="detail-body">
        ${node.description ? `<div class="detail-section">
          <label>描述</label>
          <p>${node.description}</p>
        </div>` : ''}
        
        ${node.content ? `<div class="detail-section">
          <label>详细内容</label>
          <div class="detail-content">${node.content}</div>
        </div>` : ''}
        
        <div class="detail-section">
          <label>属性</label>
          <div class="detail-attrs">
            ${node.tension !== undefined ? `<span class="attr">张力: ${node.tension}</span>` : ''}
            ${node.emotion ? `<span class="attr">情感: ${node.emotion}</span>` : ''}
          </div>
        </div>
        
        ${node.children && node.children.length > 0 ? `<div class="detail-section">
          <label>子节点 (${node.children.length})</label>
          <div class="detail-children">
            ${node.children.map(c => `<span class="child-tag">${getNodeTypeInfo(c.type).icon} ${c.name}</span>`).join('')}
          </div>
        </div>` : ''}
      </div>
      
      <div class="detail-actions">
        <button class="btn" onclick="showEditNodeModal('${node.id}')">✏️ 编辑</button>
        <button class="btn btn-danger" onclick="deleteNode('${node.id}')">🗑️ 删除</button>
      </div>
    </div>
  `;
}

// 添加节点弹窗
function showAddNodeModal(parentType, parentId = null) {
  const nodeTypes = ['character', 'plot', 'world', 'theme', 'event', 'item', 'location'];
  const isRoot = parentType === 'root';
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${isRoot ? '🌟 创建核心' : '➕ 添加子节点'}</h3>
        <button class="modal-close">×</button>
      </div>
      <form class="modal-body">
        <div class="form-group">
          <label>名称</label>
          <input type="text" name="name" class="input" required placeholder="节点名称">
        </div>
        <div class="form-group">
          <label>类型</label>
          <select name="type" class="input">
            ${nodeTypes.map(t => `<option value="${t}">${getNodeTypeInfo(t).icon} ${getNodeTypeInfo(t).label}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>描述</label>
          <textarea name="description" class="input" rows="3" placeholder="简要描述..."></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" data-action="cancel">取消</button>
          <button type="submit" class="btn btn-primary">创建</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelector('[data-action="cancel"]').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      projectId: state.currentBook.id,
      name: e.target.name.value,
      type: e.target.type.value,
      description: e.target.description.value,
      parentId: parentId
    };
    
    await api('/genesis/nodes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    modal.remove();
    await initGenesisTree();
  });
}

// 编辑节点弹窗
function showEditNodeModal(nodeId) {
  const node = genesisState.nodes.find(n => n.id === nodeId);
  if (!node) return;
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>✏️ 编辑节点</h3>
        <button class="modal-close">×</button>
      </div>
      <form class="modal-body">
        <div class="form-group">
          <label>名称</label>
          <input type="text" name="name" class="input" required value="${node.name}">
        </div>
        <div class="form-group">
          <label>描述</label>
          <textarea name="description" class="input" rows="3">${node.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label>详细内容</label>
          <textarea name="content" class="input" rows="5" placeholder="详细内容...">${node.content || ''}</textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" data-action="cancel">取消</button>
          <button type="submit" class="btn btn-primary">保存</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelector('[data-action="cancel"]').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: e.target.name.value,
      description: e.target.description.value,
      content: e.target.content.value
    };
    
    await api(`/genesis/nodes/${nodeId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    
    modal.remove();
    await initGenesisTree();
  });
}

// 删除节点
async function deleteNode(nodeId) {
  if (!confirm('确定删除这个节点及其所有子节点？')) return;
  
  await api(`/genesis/nodes/${nodeId}`, { method: 'DELETE' });
  await initGenesisTree();
  
  // 清空详情面板
  const panel = document.getElementById('genesis-panel');
  if (panel) {
    panel.innerHTML = `
      <div class="panel-empty">
        <div class="panel-icon">🌿</div>
        <h3>创世树</h3>
        <p>点击节点查看详情</p>
      </div>
    `;
  }
}

// AI生成
async function generateWithAI() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>🤖 AI生成</h3>
        <button class="modal-close">×</button>
      </div>
      <div class="modal-body">
        <p>正在调用AI生成故事结构...</p>
        <div class="ai-loading">✨ 思考中...</div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  try {
    const result = await api('/ai/genesis/generate', {
      method: 'POST',
      body: JSON.stringify({
        projectId: state.currentBook.id,
        prompt: '为这个故事生成一个完整的创世树结构'
      })
    });
    
    modal.remove();
    if (result.success) {
      await initGenesisTree();
    } else {
      alert('生成失败: ' + (result.error || '未知错误'));
    }
  } catch (e) {
    modal.remove();
    alert('生成失败');
  }
}

// 绑定创世树事件
function bindGenesisEvents() {
  document.getElementById('genesis-add-root')?.addEventListener('click', () => showAddNodeModal('root'));
  document.getElementById('genesis-auto')?.addEventListener('click', generateWithAI);
  document.getElementById('genesis-save')?.addEventListener('click', async () => {
    alert('💾 保存成功');
  });
}
