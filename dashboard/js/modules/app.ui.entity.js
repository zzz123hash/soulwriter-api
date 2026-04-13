// ============ 第10部分: 实体详情 ============
function renderEntityDetail() {

  if (!state.selectedEntity) return '<div class="empty-hint">← 点击实体查看详情</div>';

  var e = state.selectedEntity;

  return '<div class="entity-detail">' +

    '<div class="detail-header"><div class="detail-icon">' + icon(state.currentEntity) + '</div><div class="detail-title">' + escapeHtml(e.title || e.name || '未命名') + '</div></div>' +

    '<div class="detail-body">' +

      '<div class="detail-field"><label>名称</label><input type="text" class="detail-input" id="detail-title" value="' + escapeHtml(e.title || e.name || '') + '"></div>' +

      '<div class="detail-field"><label>描述</label><textarea class="detail-textarea" id="detail-desc" rows="5">' + escapeHtml(e.description || '') + '</textarea></div>' +

    '</div>' +

    '<div class="detail-actions">' +

      '<button class="btn-save-detail" id="save-entity-btn">' + icon('save') + ' 保存</button>' +

      '<button class="btn-delete-detail" id="delete-entity-btn">' + icon('trash') + ' 删除</button>' +

    '</div>' +

  '</div>';

}



// ============ Books API ============

async function booksApi(action, data) {

  data = data || {};

  var method = 'GET';

  var url = '/api/v1/works/books';

  if (action === 'list') { url = '/api/v1/works/books'; method = 'GET'; }

  else if (action === 'get') { url = '/api/v1/works/books/' + data.id; method = 'GET'; }

  else if (action === 'create') { data.bookId = data.bookId || ('b_' + Date.now() + '_' + Math.random().toString(36).substr(2,6)); url = '/api/v1/works/books'; method = 'POST'; }

  else if (action === 'delete') { url = '/api/v1/works/books/' + data.id; method = 'DELETE'; }

  else { url = '/api/v1/works/books'; method = 'POST'; }

  try {

    var opts = { method: method, headers: { 'Content-Type': 'application/json' } };

    if (method === 'POST') opts.body = JSON.stringify(data);

    var res = await fetch(url, opts);

    return await res.json();

  } catch(e) { return { error: e.message }; }

}



async function loadBooks() {

  var result = await booksApi('list');

  state.books = (result.data || result.books || []);

  renderBooksList();

}



