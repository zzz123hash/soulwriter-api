// ============ 第13部分: 导航事件 ============
function bindDrawerNavEvents() {

  document.querySelectorAll('.drawer-group-header').forEach(function(header) {

    header.addEventListener('click', function() {

      var groupId = this.dataset.group;

      var group = this.closest('.drawer-group');

      var isOpen = group.classList.contains('open');

      if (isOpen) {

        group.classList.remove('open');

        state.drawerConfig.collapsed[groupId] = true;

        this.querySelector('.drawer-chevron').innerHTML = icon('chevronRight');

      } else {

        group.classList.add('open');

        state.drawerConfig.collapsed[groupId] = false;

        this.querySelector('.drawer-chevron').innerHTML = icon('chevronDown');

      }

      saveDrawerConfig(state.drawerConfig);

    });

  });



  document.querySelectorAll('.drawer-item[data-id]').forEach(function(item) {

    item.addEventListener('click', function() {

      var id = this.dataset.id;

      document.querySelectorAll('.drawer-item').forEach(function(i) { i.classList.remove('active'); });

      this.classList.add('active');



      if (SPECIAL_TABS[id]) {

        state.currentTab = id;

        state.currentEntity = id;

        document.querySelectorAll('.book-tab').forEach(function(t) {

          t.classList.toggle('active', t.dataset.tab === id);

        });

        var tabCanvas = document.getElementById('tab-canvas');

        if (tabCanvas) tabCanvas.innerHTML = renderTabContent();
        bindTabContentEvents();

        if (id === 'event') {// EventLine initialization
        setTimeout(function() {
          var tl = document.getElementById('event-timeline');
          if (tl && typeof EventLine !== 'undefined') {
            EventLine.init('event-timeline');
            EventLine.loadData(state.currentBook?.id || 'demo');
          }
        }, 500);}

        if (id === 'nvwa') { state.nvwaSelectedChar = null; loadNvwaData(); }

      } else {

        state.currentEntity = id;

        state.currentTab = 'genesis';

        document.querySelectorAll('.book-tab').forEach(function(t) {

          t.classList.toggle('active', t.dataset.tab === 'genesis');

        });

        var tabCanvas = document.getElementById('tab-canvas');

        if (tabCanvas) tabCanvas.innerHTML = renderTabContent();
        bindTabContentEvents();

      }

    });

  });

}



