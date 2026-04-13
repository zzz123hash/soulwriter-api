// ============ 第5部分: 渲染函数 ============
function renderLeftDrawerNav() {
  var html = '';

  NAV_TREE.forEach(function(group) {
    var hasChildren = group.children && group.children.length > 0;

    html += '<div class="drawer-group" data-group="' + group.id + '">';

    html += '<div class="drawer-level1-item' + (hasChildren ? ' has-children' : '') + '" data-group="' + group.id + '" onclick="DrawerApp.openPanel(\'' + group.id + '\')">' +
      '<span class="drawer-l1-prefix">' + (hasChildren ? '+' : '') + '</span>' +
      '<span class="drawer-l1-icon">' + (group.icon ? icon(group.icon) : '') + '</span>' +
      '<span class="drawer-l1-label">' + escapeHtml(group.label) + '</span>' +
      (hasChildren ? '<span class="drawer-l1-arrow">></span>' : '') + '</div>';

    html += '</div>';
  });

  return html;
}

// DrawerApp namespace
window.DrawerApp = {
  currentPanel: null,
  
  openPanel: function(groupId) {
    var group = NAV_TREE.find(function(g) { return g.id === groupId; });
    if (!group) return;
    
    this.currentPanel = groupId;
    
    // Create or show side panel
    var container = document.getElementById('drawer-panel-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'drawer-panel-container';
      container.className = 'drawer-panel-container';
      document.querySelector('#main-canvas').appendChild(container);
    }
    
    var html = '<div class="drawer-panel">' +
      '<div class="drawer-panel-header">' +
      '<span class="drawer-panel-back" onclick="DrawerApp.closePanel()">←</span>' +
      '<span class="drawer-panel-title">+ ' + escapeHtml(group.label) + '</span>' +
      '</div>' +
      '<div class="drawer-panel-content">';
    
    if (group.children) {
      group.children.forEach(function(child) {
        html += '<div class="drawer-panel-item" onclick="DrawerApp.showDetail(\'' + groupId + '\', \'' + child.id + '\')">' +
          '<span class="drawer-panel-item-prefix">++</span>' +
          '<span class="drawer-panel-item-label">' + escapeHtml(child.label) + '</span>' +
          '<span class="drawer-panel-item-arrow">></span></div>';
      });
    }
    
    html += '</div></div>';
    container.innerHTML = html;
    container.classList.add('open');
  },
  
  closePanel: function() {
    var container = document.getElementById('drawer-panel-container');
    if (container) container.classList.remove('open');
    this.currentPanel = null;
  },
  
  // 显示三级菜单
  showLevel3: function(children, parentLabel) {
    var container = document.getElementById('drawer-panel-container');
    if (!container) return;
    
    var html = '<div class="drawer-panel drawer-panel-level3">' +
      '<div class="drawer-panel-header">' +
      '<span class="drawer-panel-back" onclick="DrawerApp.showLevel2()">←</span>' +
      '<span class="drawer-panel-title">+ ' + escapeHtml(parentLabel) + '</span>' +
      '</div>' +
      '<div class="drawer-panel-content">';
    
    children.forEach(function(gc) {
      html += '<div class="drawer-panel-item drawer-panel-item-level3" onclick="DrawerApp.selectFinal(\'' + gc.id + '\')">' +
        '<span class="drawer-panel-item-prefix">+++</span>' +
        '<span class="drawer-panel-item-label">' + escapeHtml(gc.label) + '</span>' +
      '</div>';
    });
    
    html += '</div></div>';
    container.innerHTML = html;
    container.classList.add('open');
  },
  
  // 返回二级菜单
  showLevel2: function() {
    if (!this.currentPanel) return;
    var group = NAV_TREE.find(function(g) { return g.id === this.currentPanel; }, this);
    if (!group) return;
    
    var container = document.getElementById('drawer-panel-container');
    if (!container) return;
    
    var html = '<div class="drawer-panel">' +
      '<div class="drawer-panel-header">' +
      '<span class="drawer-panel-back" onclick="DrawerApp.closePanel()">←</span>' +
      '<span class="drawer-panel-title">+ ' + escapeHtml(group.label) + '</span>' +
      '</div>' +
      '<div class="drawer-panel-content">';
    
    if (group.children) {
      group.children.forEach(function(child) {
        var hasChildren = child.children && child.children.length > 0;
        html += '<div class="drawer-panel-item" onclick="DrawerApp.showDetail(\'' + group.id + '\', \'' + child.id + '\')">' +
          '<span class="drawer-panel-item-prefix">' + (hasChildren ? '++' : '++') + '</span>' +
          '<span class="drawer-panel-item-label">' + escapeHtml(child.label) + '</span>' +
          '<span class="drawer-panel-item-arrow">' + (hasChildren ? '>' : '') + '</span></div>';
      });
    }
    
    html += '</div></div>';
    container.innerHTML = html;
    container.classList.add('open');
  },
  
  // 选择最终项目
  selectFinal: function(finalId) {
    this.closePanel();
    // 执行最终选择
    this.doAction(finalId, finalId);
  },
  
  // 执行动作
  // 跳转到指定tab
  goToTab: function(tabId) {
    var targetTab = (tabId === 'nvwa-main' || tabId === 'storyflow' || tabId === 'causal') ? 'nvwa' : tabId;
    
    if (SPECIAL_TABS[targetTab]) {
      state.currentTab = targetTab;
      document.querySelectorAll('.book-tab').forEach(function(t) {
        t.classList.toggle('active', t.dataset.tab === targetTab);
      });
      var tabCanvas = document.getElementById('tab-canvas');
      if (tabCanvas) {
        tabCanvas.innerHTML = renderTabContent();
        bindTabContentEvents();
      }
    }
  },
  
  doAction: function(tabId, entityId) {
    var entityTypes = ['roles', 'items', 'locations', 'buildings', 'events', 'chapters'];
    if (entityTypes.indexOf(tabId) !== -1) {
      state.currentTab = 'home';
      state.currentEntity = tabId;
      document.querySelectorAll('.book-tab').forEach(function(t) {
        t.classList.toggle('active', t.dataset.tab === 'home');
      });
      var tabCanvas = document.getElementById('tab-canvas');
      if (tabCanvas) {
        tabCanvas.innerHTML = renderTabContent();        bindTabContentEvents();
      }
      return;
    }
    if (SPECIAL_TABS[tabId]) {
      state.currentTab = tabId;
      document.querySelectorAll('.book-tab').forEach(function(t) {
        t.classList.toggle('active', t.dataset.tab === tabId);
      });
      var tabCanvas = document.getElementById('tab-canvas');
      if (tabCanvas) {
        tabCanvas.innerHTML = renderTabContent();        bindTabContentEvents();
      }
    }
  },
  
  showDetail: function(parentId, childId) {
    // 查找当前group和child
    var group = NAV_TREE.find(function(g) { return g.id === parentId; });
    var child = group && group.children ? group.children.find(function(c) { return c.id === childId; }) : null;
    
    // 如果有panel属性，直接跳转
    if (child && child.panel) {
      this.goToTab(child.panel);
      this.closePanel();
      return;
    }
    
    // 如果有三级子菜单，显示三级面板
    if (child && child.children && child.children.length > 0) {
      this.showLevel3(child.children, child.label);
      return;
    }
    
    // Close drawer panel
    this.closePanel();

    // For entity types, show list in right detail panel
    var entityTypes = ['roles', 'items', 'locations', 'buildings', 'events', 'chapters'];
    if (entityTypes.indexOf(childId) !== -1) {
      state.currentEntity = childId;
      state.selectedEntity = null;
      
      var dp = document.getElementById('detail-panel');
      if (dp) {
        dp.classList.add('open');
        var dc = document.getElementById('detail-content');
        if (dc) {
          dc.innerHTML = '<div class="entity-loading">加载中...</div>';
          var book = state.currentBook;
          var entities = book ? (book[childId] || []) : [];
          var icons = {roles:'👤',items:'📦',locations:'📍',buildings:'🏛️',events:'📋',chapters:'📑'};
          var labels = {roles:'角色',items:'物品',locations:'地点',buildings:'建筑',events:'事件',chapters:'章节'};
          var icon = icons[childId] || '📂';
          var label = labels[childId] || childId;
          
          var html = '<div class="entity-list-header">' + icon + ' ' + label + ' (' + entities.length + ')</div>';
          html += '<div class="entity-list">';
          entities.forEach(function(ent) {
            html += '<div class="entity-item" data-id="' + ent.id + '" data-type="' + childId + '">' +
              '<span class="entity-item-icon">' + icon + '</span>' +
              '<span class="entity-item-name">' + escapeHtml(ent.name || ent.title || '未命名') + '</span></div>';
          });
          html += '</div>';
          dc.innerHTML = html;
          
          setTimeout(function() {
            document.querySelectorAll('.entity-item').forEach(function(item) {
              item.addEventListener('click', function() {
                var id = this.dataset.id;
                var type = this.dataset.type;
                var ent = (state.currentBook && state.currentBook[type]) ? 
                  state.currentBook[type].find(function(e) { return e.id === id; }) : null;
                if (ent) {
                  state.selectedEntity = ent;
                  dc.innerHTML = renderEntityDetail();
                }
              });
            });
          }, 50);
        }
      }
      return;
    }
    
    // For novelparse tool, show novel parsing UI
    if (childId === 'novelparse') {
      var dp = document.getElementById('detail-panel');
      if (dp) {
        dp.classList.add('open');
        var dc = document.getElementById('detail-content');
        if (dc) {
          dc.innerHTML = '<div class="novel-parse-ui">' +
            '<div class="novel-parse-header">📖 小说解析</div>' +
            '<textarea id="novel-parse-text" class="novel-parse-textarea" placeholder="粘贴要解析的小说内容..."></textarea>' +
            '<button class="btn btn-primary" onclick="DrawerApp.parseNovel()">🔍 开始解析</button>' +
            '<div id="novel-parse-result" class="novel-parse-result"></div>' +
          '</div>';
        }
      }
      return;
    }

    // For special tabs, switch to that tab
    var isNvwaChild = (childId === 'nvwa-main' || childId === 'storyflow' || childId === 'causal');
    var targetTab = isNvwaChild ? 'nvwa' : childId;
    
    if (SPECIAL_TABS[childId] || isNvwaChild) {
      state.currentTab = targetTab;
      state.currentEntity = childId;

      document.querySelectorAll('.book-tab').forEach(function(t) {
        t.classList.toggle('active', t.dataset.tab === targetTab);
      });

      var tabCanvas = document.getElementById('tab-canvas');
      if (tabCanvas) {
        tabCanvas.innerHTML = renderTabContent();        bindTabContentEvents();
      }
    }
  },

  // Show entity detail as modal
  showEntityModal: function(entityType, entityId) {
    var entity = state[entityType] ? state[entityType].find(function(e) { return e.id === entityId; }) : null;
    if (!entity) return;

    var modal = document.getElementById('entity-modal');
    if (!modal) {
      // Create modal if not exists
      var modalHtml = '<div class="entity-modal-backdrop" id="entity-modal-backdrop">' +
        '<div class="entity-modal" id="entity-modal">' +
          '<div class="entity-modal-header">' +
            '<div class="entity-modal-icon" id="entity-modal-icon"></div>' +
            '<div class="entity-modal-title" id="entity-modal-title">详情</div>' +
            '<button class="entity-modal-close" onclick="DrawerApp.closeEntityModal()">×</button>' +
          '</div>' +
          '<div class="entity-modal-body" id="entity-modal-body"></div>' +
          '<div class="entity-modal-footer">' +
            '<button class="btn btn-cancel" onclick="DrawerApp.closeEntityModal()">取消</button>' +
            '<button class="btn btn-save" id="entity-modal-save">保存</button>' +
          '</div>' +
        '</div>' +
      '</div>';
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      modal = document.getElementById('entity-modal-backdrop');

      // Close on backdrop click
      modal.addEventListener('click', function(e) {
        if (e.target === modal) DrawerApp.closeEntityModal();
      });
    }

    // Fill modal content
    document.getElementById('entity-modal-icon').innerHTML = icon(entityType);
    document.getElementById('entity-modal-title').textContent = entity.title || entity.name || '未命名';
    document.getElementById('entity-modal-body').innerHTML =
      '<div class="entity-modal-field">' +
        '<label>名称</label>' +
        '<input type="text" id="entity-modal-name" value="' + escapeHtml(entity.title || entity.name || '') + '">' +
      '</div>' +
      '<div class="entity-modal-field">' +
        '<label>描述</label>' +
        '<textarea id="entity-modal-desc" rows="5">' + escapeHtml(entity.description || '') + '</textarea>' +
      '</div>';

    // Save handler
    document.getElementById('entity-modal-save').onclick = function() {
      var newName = document.getElementById('entity-modal-name').value;
      var newDesc = document.getElementById('entity-modal-desc').value;
      entity.title = newName;
      entity.name = newName;
      entity.description = newDesc;
      DrawerApp.closeEntityModal();
      // Re-render current content
      var tabCanvas = document.getElementById('tab-canvas');
      if (tabCanvas) {
        tabCanvas.innerHTML = renderTabContent();        bindTabContentEvents();
      }
    };

    modal.classList.add('open');
  },

  closeEntityModal: function() {
    var modal = document.getElementById('entity-modal-backdrop');
    if (modal) modal.classList.remove('open');
  },
  
  closeDetail: function() {
    var modal = document.getElementById('detail-modal');
    if (modal) {
      modal.classList.remove('open');
      // Also remove open class from drawer-panel-container if present
      var panel = document.getElementById('drawer-panel-container');
      if (panel) panel.classList.remove('open');
    }
  },
  
  renderDetailContent: function(itemId) {
    var html = '';
    switch(itemId) {
      case 'roles':
        var roles = window.state && window.state.currentBook && window.state.currentBook.roles || [];
        if (roles.length === 0) {
          html += '<div class="detail-empty"><div class="detail-empty-icon">👤</div><div>暂无角色</div></div>';
        } else {
          roles.forEach(function(r) {
            html += '<div class="detail-list-item" data-entity-id="' + (r.id || '') + '" data-entity-type="role" draggable="true"><div class="detail-list-item-icon">👤</div>' +
              '<div class="detail-list-item-content"><div class="detail-list-item-title">' + (r.title || r.name || '未命名') + '</div>' +
              '<div class="detail-list-item-desc">' + (r.description || '暂无描述') + '</div></div>' +
              '<div class="detail-list-item-arrow">></div></div>';
          });
        }
        html += '<button class="btn-primary-full" onclick="DrawerApp.createRole()">+ 新建角色</button>';
        break;
      case 'novelparse':
        html += '<div class="form-group"><label>粘贴小说文本</label>' +
          '<textarea id="novel-parse-text" class="form-textarea" placeholder="粘贴要解析的小说内容..."></textarea></div>' +
          '<button class="btn-primary-full" onclick="DrawerApp.parseNovel()">🔍 开始解析</button>';
        break;
      default:
        html += '<div class="detail-empty"><div class="detail-empty-icon">📄</div><div>内容开发中</div></div>';
    }
    return html;
  },
  
  createRole: function() {
    var name = prompt("角色名称：");
    if (!name) return;
    var bookId = window.state?.currentBook?.id;
    if (!bookId) { alert("请先打开一本书"); return; }
    var desc = prompt("角色描述（可选）：") || '';
    fetch('/api/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', bookId: bookId, title: name, description: desc })
    })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      if (res.success) {
        alert("角色「" + name + "」创建成功！");
        DrawerApp.refreshRoleList && DrawerApp.refreshRoleList();
      } else {
        alert("创建失败：" + (res.message || '未知错误'));
      }
    })
    .catch(function(e) { alert("请求失败：" + e.message); });
  },
  
  refreshRoleList: function() {
    var bookId = window.state?.currentBook?.id;
    if (!bookId) return;
    var listEl = document.getElementById('role-list');
    if (!listEl) return;
    fetch('/api/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list', bookId: bookId })
    })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      if (res.success && res.data) {
        var roles = res.data;
        if (roles.length === 0) {
          listEl.innerHTML = '<div style="color:var(--text2);padding:16px;text-align:center;">暂无角色</div>';
        } else {
          listEl.innerHTML = roles.map(function(r) {
            return '<div class="drawer-panel-item" onclick="DrawerApp.showRoleDetail(\'' + r.id + '\')">' +
              '<span>👤</span><span>' + (r.title || r.name) + '</span></div>';
          }).join('');
        }
      }
    })
    .catch(function(e) { console.error(e); });
  },
  
  showRoleDetail: function(roleId) {
    var bookId = window.state?.currentBook?.id;
    if (!bookId) return;
    fetch('/api/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get', bookId: bookId, id: roleId })
    })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      if (res.success && res.data) {
        var role = res.data;
        var modal = document.getElementById('entity-modal');
        if (!modal) {
          modal = document.createElement('div');
          modal.id = 'entity-modal';
          modal.className = 'detail-modal';
          modal.innerHTML = '<div class="detail-modal-backdrop"></div>' +
            '<div class="detail-modal-box"><div class="detail-modal-header">' +
            '<span class="detail-modal-title" id="entity-modal-title">角色详情</span>' +
            '<button class="detail-modal-close">×</button></div>' +
            '<div class="detail-modal-body" id="entity-modal-body"></div></div>';
          document.body.appendChild(modal);
          modal.querySelector('.detail-modal-backdrop').onclick = function() { modal.classList.remove('open'); };
          modal.querySelector('.detail-modal-close').onclick = function() { modal.classList.remove('open'); };
        }
        document.getElementById('entity-modal-title').textContent = '👤 ' + role.name;
        document.getElementById('entity-modal-body').innerHTML = '<div style="padding:16px;">' +
          '<p><b>ID：</b>' + role.id + '</p>' +
          '<p><b>描述：</b>' + (role.description || '无') + '</p>' +
          '<p><b>创建时间：</b>' + (role.createdAt || '未知') + '</p></div>';
        modal.classList.add('open');
      }
    })
    .catch(function(e) { console.error(e); });
  },
  
  parseNovel: function() {
    var textEl = document.getElementById("novel-parse-text");
    if (!textEl) { alert("请输入小说内容"); return; }
    var text = textEl.value;
    if (!text) { alert("请输入小说内容"); return; }
    
    var btn = document.querySelector("button[onclick*='DrawerApp.parseNovel']");
    if (btn) { btn.disabled = true; btn.textContent = '解析中...'; }
    
    var resultEl = document.getElementById("novel-parse-result");
    if (resultEl) { resultEl.style.display = 'block'; resultEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text2);">分析中...</div>'; }
    
    fetch('/api/split', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text, depth: 'normal', bookId: window.state?.currentBook?.id || '' })
    })
    .then(function(res) { return res.json(); })
    .then(function(result) {
      if (result.success) {
        var data = result.data || {};
        var html = '<div style="padding:16px;">';
        if (data.characters && data.characters.length) html += '<div style="margin-bottom:8px;"><b style="color:var(--accent);">角色：</b>' + data.characters.join('、') + '</div>';
        if (data.locations && data.locations.length) html += '<div style="margin-bottom:8px;"><b style="color:var(--accent);">地点：</b>' + data.locations.join('、') + '</div>';
        if (data.items && data.items.length) html += '<div style="margin-bottom:8px;"><b style="color:var(--accent);">物品：</b>' + data.items.join('、') + '</div>';
        if (data.events && data.events.length) html += '<div style="margin-bottom:8px;"><b style="color:var(--accent);">事件：</b>' + data.events.length + '个</div>';
        if (html === '<div style="padding:16px;">') html = '<div style="color:var(--text2);padding:16px;">未提取到信息</div>';
        else html += '</div>';
        if (resultEl) resultEl.innerHTML = html;
      } else {
        if (resultEl) resultEl.innerHTML = '<div style="color:#ef4444;padding:16px;">解析失败：' + (result.message || '未知错误') + '</div>';
      }
    })
    .catch(function(e) {
      if (resultEl) resultEl.innerHTML = '<div style="color:#ef4444;padding:16px;">请求失败：' + e.message + '</div>';
    })
    .finally(function() {
      if (btn) { btn.disabled = false; btn.textContent = '🔍 开始解析'; }
    });
  }
};




// ============ 全局设置 ============
