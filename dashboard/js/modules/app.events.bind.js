// ============ 第12部分: 事件绑定 ============
function bindWelcomeEvents() {

  // Toolbar lang/theme/docs/log bindings

  var btnLang = document.getElementById('btn-lang');

  if (btnLang) btnLang.addEventListener('change', function() {

    var locale = this.value === 'en-US' ? 'en' : 'zh';

    if (window._i18n) window._i18n.setLocale(locale);

  });

  var btnTheme = document.getElementById('btn-theme');

  if (btnTheme) btnTheme.addEventListener('change', function() {

    document.documentElement.setAttribute('data-theme', this.value);

    localStorage.setItem('sw-theme', this.value);

  });

  var btnDocs = document.getElementById('btn-docs');

  if (btnDocs) btnDocs.addEventListener('click', function() {

    window.open('https://github.com/zzz123hash/soulwriter-api', '_blank');

  });

  var btnLog = document.getElementById('btn-log');

  if (btnLog) btnLog.addEventListener('click', function() {

    var panel = document.getElementById('log-panel');

    if (panel) panel.classList.toggle('open');

  });



  var btn = document.getElementById('create-book-btn');

  if (btn) btn.addEventListener('click', showCreateBookModal);

  loadBooks();

}



function bindBookEvents() {

  // Toolbar lang/theme/docs/log bindings

  var btnLang = document.getElementById('btn-lang');

  if (btnLang) btnLang.addEventListener('change', function() {

    var locale = this.value === 'en-US' ? 'en' : 'zh';

    if (window._i18n) window._i18n.setLocale(locale);

  });

  var btnTheme = document.getElementById('btn-theme');

  if (btnTheme) btnTheme.addEventListener('change', function() {

    document.documentElement.setAttribute('data-theme', this.value);

    localStorage.setItem('sw-theme', this.value);

  });

  var btnDocs = document.getElementById('btn-docs');

  if (btnDocs) btnDocs.addEventListener('click', function() {

    window.open('https://github.com/zzz123hash/soulwriter-api', '_blank');

  });

  var btnLog = document.getElementById('btn-log');

  if (btnLog) btnLog.addEventListener('click', function() {

    var panel = document.getElementById('log-panel');

    if (panel) panel.classList.toggle('open');

  });



  var btnBack = document.getElementById('back-to-books'); if (btnBack) btnBack.addEventListener('click', function() {

    state.currentBook = null;

    state.currentView = 'welcome';

    state.events = [];

    renderApp();

  });



  document.querySelectorAll('.book-tab').forEach(function(tab) {

    tab.addEventListener('click', function() {

      document.querySelectorAll('.book-tab').forEach(function(t) { t.classList.remove('active'); });

      tab.classList.add('active');

      state.currentTab = tab.dataset.tab;

      state.selectedEntity = null;

      var tabCanvas = document.getElementById('tab-canvas');

      if (tabCanvas) tabCanvas.innerHTML = renderTabContent();
      bindTabContentEvents();

      if (tab.dataset.tab === 'event') {// EventLine initialization
        setTimeout(function() {
          var tl = document.getElementById('event-timeline');
          if (tl && typeof EventLine !== 'undefined') {
            EventLine.init('event-timeline');
            EventLine.loadData(state.currentBook?.id || 'demo');
          }
        }, 500);}

      if (tab.dataset.tab === 'nvwa') { state.nvwaSelectedChar = null; loadNvwaData(); }

      if (tab.dataset.tab === 'translate') setTimeout(bindTranslateTabEvents, 50);

    });

  });



  document.getElementById('toggle-left').addEventListener('click', function() {

    state.leftDrawerOpen = !state.leftDrawerOpen;

    var drawer = document.getElementById('left-drawer');

    drawer.classList.toggle('open', state.leftDrawerOpen);

    drawer.classList.toggle('collapsed', !state.leftDrawerOpen);

    this.innerHTML = state.leftDrawerOpen ? icon('chevronLeft') : icon('chevronRight');

  });



  document.getElementById('close-detail').addEventListener('click', function() {

    state.selectedEntity = null;

    document.getElementById('detail-panel').classList.remove('open');

    document.getElementById('detail-content').innerHTML = '<div class="empty-hint">← 点击实体查看详情</div>';

  });



  bindDrawerNavEvents();

  bindTabContentEvents();

  bindDetailEvents();

}



