// ============ 第11部分: 书籍管理 ============
function renderBooksList() {

  var c = document.getElementById('books-list');

  if (!c) return;

  if (!state.books.length) { c.innerHTML = '<div class="empty-bookshelf"><p>书架空空，点击下方创建新书</p></div>'; return; }

  c.innerHTML = state.books.map(function(book) {

    return '<div class="book-item" data-id="' + book.id + '">' +

      '<div class="book-cover"><div class="book-spine"></div><div class="book-front"><span class="book-name">' + (book.title ? book.title.charAt(0) : '?') + '</span></div></div>' +

      '<div class="book-info"><h3 class="book-title">' + escapeHtml(book.title) + '</h3><p class="book-desc">' + escapeHtml(book.author || '未知作者') + ' · ' + (book.wordCount || 0) + '字</p>' +

      '<div class="book-actions"><button class="btn btn-sm btn-open" data-id="' + book.id + '">打开</button><button class="btn btn-sm btn-danger" data-id="' + book.id + '">删除</button></div></div></div>';

  }).join('');

  c.querySelectorAll('.btn-open').forEach(function(btn) { btn.addEventListener('click', function(e) { e.stopPropagation(); openBook(btn.dataset.id); }); });

  c.querySelectorAll('.btn-danger').forEach(function(btn) { btn.addEventListener('click', function(e) { e.stopPropagation(); deleteBook(btn.dataset.id); }); });

}



async function openBook(id) {

  var result = await booksApi('get', { id: id });

  if (result.success && (result.data || result.meta || result.books)) {

    state.currentBook = result.data || result.meta || result.books[0];

    // Load roles from server
    try {
      var rolesRes = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list', bookId: id })
      });
      var rolesData = await rolesRes.json();
      if (rolesData.success && rolesData.data) {
        state.currentBook.roles = rolesData.data;
      }
    } catch(e) { console.error('Failed to load roles:', e); }

    state.currentView = 'book';

    state.currentTab = 'home';

    state.leftDrawerOpen = true;

    state.selectedEntity = null;

    state.events = [];

    state.entityCounts = {};

    renderApp();

  }

}



async function deleteBook(id) {

  if (!confirm('确定删除？')) return;

  var result = await booksApi('delete', { id: id });

  if (result.success) loadBooks();

}



function showCreateBookModal() {

  var modal = document.createElement('div');

  modal.className = 'modal-overlay open';

  modal.innerHTML = '<div class="modal-box"><div class="modal-title">创建新书</div><div class="modal-body">' +

    '<div class="field"><label>书名</label><input id="new-book-title" type="text" placeholder="'+t('welcome.bookTitle')+'"></div>' +

    '<div class="field"><label>作者</label><input id="new-book-author" type="text" placeholder="'+t('welcome.bookAuthor')+'"></div></div>' +

    '<div class="modal-actions"><button class="btn btn-primary" id="do-create-book">创建</button><button class="btn btn-secondary" id="cancel-create-book">取消</button></div></div>';

  document.body.appendChild(modal);

  document.getElementById('do-create-book').addEventListener('click', async function() {

    var title = document.getElementById('new-book-title').value.trim();

    var author = document.getElementById('new-book-author').value.trim();

    if (!title) { alert('请输入书名'); return; }

    var result = await booksApi('create', { title: title, author: author });

    modal.remove();

    if (result.success && (result.data || result.meta)) openBook(result.data.id);

  });

  document.getElementById('cancel-create-book').addEventListener('click', function() { modal.remove(); });

  modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });

}



// ============ 加载书本数据 ============

async function loadBookData() {

  if (!state.currentBook || !state.currentBook.id) return;

  try {

    var res, result;

    res = await fetch('/api/v1/works/' + state.currentBook.id + '/roles');

    result = await res.json();

    if (result.success) { state.roles = result.entities || []; state.entityCounts.roles = state.roles.length; }

    res = await fetch('/api/v1/works/' + state.currentBook.id + '/items');

    result = await res.json();

    if (result.success) { state.items = result.entities || []; state.entityCounts.items = state.items.length; }

    res = await fetch('/api/v1/works/' + state.currentBook.id + '/locations');

    result = await res.json();

    if (result.success) { state.locations = result.entities || []; state.entityCounts.locations = state.locations.length; }

    try {

      var evRes = await fetch('/api/v1/nvwa/events');

      var evResult = await evRes.json();

      if (evResult.success) { state.events = evResult.data.events || []; }

    } catch(e) {}

    var drawerNav = document.getElementById('drawer-nav-tree');

    if (drawerNav) drawerNav.innerHTML = renderLeftDrawerNav();

  } catch(e) { console.error('loadBookData error:', e); }

}



// ============ 事件绑定 ============

