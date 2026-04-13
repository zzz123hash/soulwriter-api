// ============ 第14部分: Tab事件 ============
function bindTabContentEvents() {

  var uploadZone = document.getElementById('home-upload-zone');

  if (uploadZone) uploadZone.addEventListener('click', function() { var btn = document.getElementById('upload-btn'); if (btn) btn.click(); });



  var ltZone = document.getElementById('home-longtext-zone');

  // Initialize VisualEditor for Genesis tab
  // GenesisTree v2 - init when tab is shown
  if (typeof GenesisTree !== 'undefined' && state.currentTab === 'genesis') {
    setTimeout(function() {
      var gCanvas = document.getElementById('genesis-canvas');
      if (gCanvas) {
        GenesisTree.init('genesis-canvas');
        GenesisTree.loadData(state.currentBook?.id || 'demo');
      }
    }, 100);
  }

  if (ltZone) ltZone.addEventListener('click', function() { showLongTextAnalyzeModal(); });

  // Bind Nvwa events if on nvwa tab
  if (typeof bindNvwaEvents === 'function') {
    setTimeout(function() { bindNvwaEvents(); }, 100);
  }

  document.querySelectorAll('.home-stat-card[data-id]').forEach(function(card) {

    card.addEventListener('click', function() {

      var id = this.dataset.id;

      if (SPECIAL_TABS[id]) {

        state.currentTab = id;

        state.currentEntity = id;

      } else {

        state.currentTab = 'genesis';

        state.currentEntity = id;

      }

      document.querySelectorAll('.book-tab').forEach(function(t) {

        t.classList.toggle('active', t.dataset.tab === state.currentTab);

      });

      var tabCanvas = document.getElementById('tab-canvas');

      if (tabCanvas) tabCanvas.innerHTML = renderTabContent();
      bindTabContentEvents();

    });

  });



  document.querySelectorAll('.home-action-btn[data-action]').forEach(function(btn) {

    btn.addEventListener('click', function() {

      var action = this.dataset.action;

      if (action === 'newEvent') {

        state.selectedEntity = { __isNew: true };

        state.currentTab = 'event';

        state.currentEntity = 'event';

        document.querySelectorAll('.book-tab').forEach(function(t) {

          t.classList.toggle('active', t.dataset.tab === 'event');

        });

        var tabCanvas = document.getElementById('tab-canvas');

        if (tabCanvas) tabCanvas.innerHTML = renderTabContent();
        bindTabContentEvents();

      }

    });

  });



  var addEventBtn = document.getElementById('event-add-btn');

  if (addEventBtn && !addEventBtn.dataset.bound) {

    addEventBtn.dataset.bound = '1';

    addEventBtn.addEventListener('click', function() {

      state.selectedEntity = { __isNew: true, id: null, title: '', cause: '', process: '', result: '', arc: '主线', chapter: '', timestamp: 0, isKeyEvent: false, tension: 50, status: 'open', characters: [], locations: [], items: [] };

      state.currentEntity = 'event';

      var dp = document.getElementById('detail-panel');

      if (dp) { dp.classList.add('open'); document.getElementById('detail-content').innerHTML = renderEventDetail(); bindEventDetailEvents(); }

    });

  }

}





  // 实体类型tab切换（导航页）

  document.querySelectorAll('.entity-type-tab').forEach(function(tab) {

    tab.addEventListener('click', function() {

      var type = this.dataset.type;

      state.currentEntity = type;

      document.querySelectorAll('.entity-type-tab').forEach(function(t) { t.classList.remove('active'); });

      this.classList.add('active');

      var container = document.getElementById('entity-list-container');

      if (container) container.innerHTML = renderHomeTab_entityList(type);

    });

  });



  // 实体列表项点击 → 打开详情

  // 抽屉面板点击外部关闭
  document.addEventListener('click', function(e) {
    var panel = document.getElementById('drawer-panel-container');
    var drawer = document.querySelector('.left-drawer');
    var btn = e.target.closest('.drawer-level1-item, .drawer-toggle, .drawer-panel-item, .drawer-panel-back');
    
    // 如果点击在抽屉面板、左侧抽屉或按钮上，不关闭
    if (panel && panel.classList.contains('open') && 
        !panel.contains(e.target) && 
        !drawer?.contains(e.target) &&
        !btn) {
      DrawerApp.closePanel();
    }
  });

  // 实体列表项点击 → 打开详情 (使用事件委托)
  document.addEventListener("click", function(e) {
    var item = e.target.closest(".entity-list-item");
    if (!item) return;
    var id = item.dataset.id;
    var type = state.currentEntity;
    var entityMap = { roles: state.roles, items: state.items, locations: state.locations };
    var list = entityMap[type] || [];
    var entity = list.find(function(e) { return e.id === id; });
    if (entity) {
      DrawerApp.showEntityModal(type, id);
    }
  });



  // 新建实体按钮

  document.querySelectorAll('.btn-create-entity').forEach(function(btn) {

    btn.addEventListener('click', function() {

      var type = this.dataset.type;

      var newEntity = { __isNew: true, id: null, title: '', description: '' };

      state.selectedEntity = newEntity;

      state.currentEntity = type;

      var dp = document.getElementById('detail-panel');

      if (dp) { dp.classList.add('open'); document.getElementById('detail-content').innerHTML = renderEntityDetail(); bindDetailEvents(); }

    });

  });



  // 统计条点击 → 切换tab

  document.querySelectorAll('.stat-item').forEach(function(item) {

    item.addEventListener('click', function() {

      var type = this.dataset.type;

      if (type === 'event') {

        state.currentTab = 'event';

        state.currentEntity = 'event';

      } else {

        state.currentTab = 'home';

        state.currentEntity = type;

      }

      document.querySelectorAll('.book-tab').forEach(function(t) {

        t.classList.toggle('active', t.dataset.tab === state.currentTab);

      });

      var tabCanvas = document.getElementById('tab-canvas');

      if (tabCanvas) tabCanvas.innerHTML = renderTabContent();
      bindTabContentEvents();

      if (state.currentTab === 'event' && typeof EventLine !== 'undefined') {
        setTimeout(function() {
          var tl = document.getElementById('event-timeline');
          if (tl && typeof EventLine !== 'undefined') {
            EventLine.init('event-timeline');
            EventLine.loadData(state.currentBook?.id || 'demo');
          }
        }, 500);
      }

    });

  });



function bindDetailEvents() {

  var saveBtn = document.getElementById('save-entity-btn');

  if (saveBtn) {

    saveBtn.addEventListener('click', function() {

      var title = (document.getElementById('detail-title') || {}).value || '';

      var description = (document.getElementById('detail-desc') || {}).value || '';

      if (state.selectedEntity && state.selectedEntity.__isNew) {

        fetch('/api/v1/works/' + state.currentBook.id + '/' + state.currentEntity, {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ title: title, description: description })

        }).then(function(r) { return r.json(); }).then(function(result) {

          if (result.success) { state.selectedEntity = null; document.getElementById('detail-panel').classList.remove('open'); loadBookData(); }

        });

      } else if (state.selectedEntity && state.selectedEntity.id) {

        fetch('/api/v1/works/' + state.currentBook.id + '/' + state.currentEntity + '/' + state.selectedEntity.id, {

          method: 'PUT',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ title: title, description: description })

        }).then(function(r) { return r.json(); }).then(function(result) {

          if (result.success) { state.selectedEntity.title = title; state.selectedEntity.description = description; }

        });

      }

    });

  }

  var deleteBtn = document.getElementById('delete-entity-btn');

  if (deleteBtn) {

    deleteBtn.addEventListener('click', function() {

      if (!state.selectedEntity || !state.selectedEntity.id || !confirm('确定删除？')) return;

      fetch('/api/v1/works/' + state.currentBook.id + '/' + state.currentEntity + '/' + state.selectedEntity.id, { method: 'DELETE' })

        .then(function(r) { return r.json(); })

        .then(function(result) {

          if (result.success) { state.selectedEntity = null; document.getElementById('detail-panel').classList.remove('open'); loadBookData(); }

        });

    });

  }

}



// ============ 事件线功能 ============

async function loadEventTimeline() {

  if (!state.currentBook) return;

  try {

    var res = await fetch('/api/v1/nvwa/events?limit=100');

    var result = await res.json();

    if (result.success) {

      state.events = result.data.events || [];

      var timeline = document.getElementById('event-timeline');

      if (timeline) {

        if (!state.events.length) {

          timeline.innerHTML = '<div class="event-empty" style="padding:40px;text-align:center;color:var(--text2);"><div style="font-size:2em;margin-bottom:12px;">' + icon('event') + '</div><div style="margin-bottom:8px;">暂无事件</div><div style="font-size:12px;">点击右上角"新增事件"开始构建故事线</div></div>';

        } else {

          timeline.innerHTML = renderEventTimeline(state.events, result.data.arcs || {});

          bindEventCardEvents();

        }

      }

    }

  } catch(e) { console.error('loadEventTimeline error:', e); }

}



