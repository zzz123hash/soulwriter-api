// ============ 第15部分: 时间线渲染 ============
function renderEventTimeline(events, arcs) {

  var html = '<div class="event-list">';

  events.forEach(function(ev) {

    var chars = [];

    try { chars = JSON.parse(ev.characters || '[]'); } catch(e) {}

    var locs = [];

    try { locs = JSON.parse(ev.locations || '[]'); } catch(e) {}

    var tc = ev.tension >= 70 ? 'high' : (ev.tension >= 40 ? 'mid' : 'low');

    html += '<div class="event-card' + (ev.isKeyEvent ? ' key' : '') + '" data-id="' + ev.id + '">' +

      '<div class="event-card-left"><div class="event-tension-bar ' + tc + '" style="height:' + ev.tension + '%;"></div></div>' +

      '<div class="event-card-body">' +

        '<div class="event-card-header">' +

          '<span class="event-chapter">' + escapeHtml(ev.chapter || '') + '</span>' +

          '<b class="event-title">' + escapeHtml(ev.title) + '</b>' +

          '<span class="event-status ' + (ev.status === 'open' ? 'open' : 'closed') + '">' + (ev.status === 'open' ? '进行中' : '已解决') + '</span>' +

          (ev.isKeyEvent ? '<span class="event-key">关键</span>' : '') +

        '</div>' +

        '<div class="event-card-meta">' +

          (chars.length ? '<span class="event-meta-item">' + icon('roles') + ' ' + chars.join(', ') + '</span>' : '') +

          (locs.length ? '<span class="event-meta-item">' + icon('locations') + ' ' + locs.join(', ') + '</span>' : '') +

          '<span class="event-meta-item tension-badge ' + tc + '">张力 ' + ev.tension + '%</span>' +

        '</div>' +

        '<div class="event-result">' + escapeHtml(ev.result || '') + '</div>' +

      '</div></div>';

  });

  html += '</div>';

  return html;

}



function bindEventCardEvents() {

  document.querySelectorAll('.event-card').forEach(function(card) {

    card.addEventListener('click', function() {

      var id = this.dataset.id;

      var ev = state.events.find(function(e) { return e.id === id; });

      if (ev) {

        state.selectedEntity = ev;

        var dp = document.getElementById('detail-panel');

        if (dp) { dp.classList.add('open'); document.getElementById('detail-content').innerHTML = renderEventDetail(); bindEventDetailEvents(); }

      }

    });

  });

}



function renderEventDetail() {

  var ev = state.selectedEntity;

  if (!ev) return '';

  var isNew = ev.__isNew;

  var chars = [];

  try { chars = JSON.parse(ev.characters || '[]'); } catch(e) { chars = []; }

  var locs = [];

  try { locs = JSON.parse(ev.locations || '[]'); } catch(e) { locs = []; }

  return '<div class="entity-detail">' +

    '<div class="detail-header"><div class="detail-icon">' + icon('event') + '</div><div class="detail-title">' + (isNew ? '新增事件' : escapeHtml(ev.title)) + '</div></div>' +

    '<div class="detail-body">' +

      '<div class="detail-field"><label>标题</label><input class="detail-input" id="ev-title" value="' + escapeHtml(ev.title || '') + '" placeholder="'+t('event.eventTitle')+'"></div>' +

      '<div class="detail-field"><label>章节/位置</label><input class="detail-input" id="ev-chapter" value="' + escapeHtml(ev.chapter || '') + '" placeholder="'+t('event.chapterPlaceholder')+'"></div>' +

      '<div class="detail-row"><div class="detail-field"><label>剧情线</label>' +

        '<select class="detail-input" id="ev-arc"><option value="主线"' + (ev.arc === '主线' ? ' selected' : '') + '>主线</option><option value="支线"' + (ev.arc === '支线' ? ' selected' : '') + '>支线</option><option value="暗线"' + (ev.arc === '暗线' ? ' selected' : '') + '>暗线</option><option value="感情线"' + (ev.arc === '感情线' ? ' selected' : '') + '>感情线</option></select>' +

      '</div><div class="detail-field"><label>序号</label><input class="detail-input" id="ev-timestamp" type="number" value="' + (ev.timestamp || 0) + '"></div></div>' +

      '<div class="detail-field"><label>起因</label><textarea class="detail-textarea" id="ev-cause" rows="2">' + escapeHtml(ev.cause || '') + '</textarea></div>' +

      '<div class="detail-field"><label>经过</label><textarea class="detail-textarea" id="ev-process" rows="3">' + escapeHtml(ev.process || '') + '</textarea></div>' +

      '<div class="detail-field"><label>结果</label><textarea class="detail-textarea" id="ev-result" rows="2">' + escapeHtml(ev.result || '') + '</textarea></div>' +

      '<div class="detail-row"><div class="detail-field"><label>张力</label><input class="detail-input" id="ev-tension" type="range" min="0" max="100" value="' + (ev.tension || 50) + '"><span id="ev-tension-val">' + (ev.tension || 50) + '</span></div>' +

      '<div class="detail-field"><label>状态</label><select class="detail-input" id="ev-status"><option value="open"' + (ev.status === 'open' ? ' selected' : '') + '>进行中</option><option value="closed"' + (ev.status === 'closed' ? ' selected' : '') + '>已解决</option></select></div></div>' +

      '<div class="detail-field"><label>'+t('event.charactersHint')+'</label><input class="detail-input" id="ev-characters" value="' + escapeHtml(chars.join(', ')) + '"></div>' +

      '<div class="detail-field"><label>'+t('event.locationsHint')+'</label><input class="detail-input" id="ev-locations" value="' + escapeHtml(locs.join(', ')) + '"></div>' +

    '</div>' +

    '<div class="detail-actions">' +

      '<button class="btn-save-detail" id="ev-save-btn">' + icon('save') + ' 保存</button>' +

      (!isNew ? '<button class="btn-delete-detail" id="ev-delete-btn">' + icon('trash') + ' 删除</button>' : '') +

    '</div></div>';

}



function bindEventDetailEvents() {

  var tensionInput = document.getElementById('ev-tension');

  if (tensionInput) {

    tensionInput.addEventListener('input', function() {

      var val = document.getElementById('ev-tension-val');

      if (val) val.textContent = this.value;

    });

  }

  var saveBtn = document.getElementById('ev-save-btn');

  if (saveBtn) {

    saveBtn.addEventListener('click', function() {

      var ev = state.selectedEntity;

      var data = {

        title: document.getElementById('ev-title').value,

        chapter: document.getElementById('ev-chapter').value,

        arc: document.getElementById('ev-arc').value,

        timestamp: parseInt(document.getElementById('ev-timestamp').value) || 0,

        cause: document.getElementById('ev-cause').value,

        process: document.getElementById('ev-process').value,

        result: document.getElementById('ev-result').value,

        tension: parseInt(document.getElementById('ev-tension').value) || 50,

        status: document.getElementById('ev-status').value,

        characters: document.getElementById('ev-characters').value.split(',').map(function(s) { return s.trim(); }).filter(Boolean),

        locations: document.getElementById('ev-locations').value.split(',').map(function(s) { return s.trim(); }).filter(Boolean),

      };

      if (ev.__isNew) {

        data.bookId = state.currentBook.id;

        fetch('/api/v1/nvwa/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })

          .then(function(r) { return r.json(); })

          .then(function(result) { if (result.success) { state.selectedEntity = null; document.getElementById('detail-panel').classList.remove('open'); loadEventTimeline(); } });

      } else {

        fetch('/api/v1/nvwa/events/' + ev.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })

          .then(function(r) { return r.json(); })

          .then(function(result) { if (result.success) { state.selectedEntity = null; document.getElementById('detail-panel').classList.remove('open'); loadEventTimeline(); } });

      }

    });

  }

  var deleteBtn = document.getElementById('ev-delete-btn');

  if (deleteBtn) {

    deleteBtn.addEventListener('click', function() {

      if (!confirm('确认删除？')) return;

      fetch('/api/v1/nvwa/events/' + state.selectedEntity.id, { method: 'DELETE' })

        .then(function(r) { return r.json(); })

        .then(function(result) { if (result.success) { state.selectedEntity = null; document.getElementById('detail-panel').classList.remove('open'); loadEventTimeline(); } });

    });

  }

}



// ============ 女娲记忆功能 ============

async function loadNvwaData() {

  if (!state.currentBook) return;

  var root = document.getElementById('nvwa-tab-root');

  if (!root) return;

  try {

    var res = await fetch('/api/v1/works/' + state.currentBook.id + '/roles');

    var result = await res.json();

    var roles = result.success ? (result.entities || []) : [];

    if (!state.nvwaSelectedChar && roles.length > 0) state.nvwaSelectedChar = roles[0].id;



    var memoryData = {};

    for (var i = 0; i < roles.length; i++) {

      var r = roles[i];

      try {

        var mRes = await fetch('/api/memory/' + state.currentBook.id + '/' + r.id);

        var mResult = await mRes.json();

        memoryData[r.id] = mResult.success ? mResult.data : { buffer: [], core: [], recall: [], archival: [], summary: '' };

      } catch(e) { memoryData[r.id] = { buffer: [], core: [], recall: [], archival: [], summary: '' }; }

    }

    state.nvwaMemoryData = memoryData;



    var html = '<div class="nvwa-layout">';

    html += '<div class="nvwa-char-list"><div class="nvwa-section-title">选择角色</div>';

    roles.forEach(function(r) {

      html += '<div class="nvwa-char-item' + (state.nvwaSelectedChar === r.id ? ' active' : '') + '" data-id="' + r.id + '">' +

        '<div class="nvwa-char-avatar">' + icon('roles') + '</div>' +

        '<div class="nvwa-char-name">' + escapeHtml(r.title || r.name || '未命名') + '</div></div>';

    });

    html += '</div><div class="nvwa-memory-view">';

    if (state.nvwaSelectedChar) {

      var mem = memoryData[state.nvwaSelectedChar] || { buffer: [], core: [], recall: [], archival: [], summary: '' };

      var bc = (mem.buffer || []).length, cc = (mem.core || []).length, rc = (mem.recall || []).length, ac = (mem.archival || []).length;

      html += '<div class="nvwa-panel-header"><div class="nvwa-layer-stats">' +

        '<span class="nvwa-stat"><span class="nvwa-stat-num" style="color:#3b82f6;">' + bc + '</span><span class="nvwa-stat-label">缓冲</span></span>' +

        '<span class="nvwa-stat"><span class="nvwa-stat-num" style="color:#f59e0b;">' + cc + '</span><span class="nvwa-stat-label">核心</span></span>' +

        '<span class="nvwa-stat"><span class="nvwa-stat-num" style="color:#8b5cf6;">' + rc + '</span><span class="nvwa-stat-label">召回</span></span>' +

        '<span class="nvwa-stat"><span class="nvwa-stat-num" style="color:#6b7280;">' + ac + '</span><span class="nvwa-stat-label">归档</span></span>' +

        '</div><button class="nvwa-add-btn" id="nvwa-add-btn">' + icon('plus') + ' 添加记忆</button></div>';

      if (mem.summary) html += '<div class="nvwa-summary"><div class="nvwa-summary-label">角色摘要</div><div class="nvwa-summary-text">' + escapeHtml(mem.summary) + '</div></div>';

      html += '<div class="nvwa-layer-tabs">' +

        '<button class="nvwa-layer-tab active" data-layer="buffer">缓冲 (' + bc + ')</button>' +

        '<button class="nvwa-layer-tab" data-layer="core">核心 (' + cc + ')</button>' +

        '<button class="nvwa-layer-tab" data-layer="recall">召回 (' + rc + ')</button>' +

        '<button class="nvwa-layer-tab" data-layer="archival">归档 (' + ac + ')</button></div>';

      html += '<div class="nvwa-layer-content">';

      var layer = state.nvwaActiveLayer || 'buffer';

      var entries = mem[layer] || [];

      if (!entries.length) { html += '<div class="nvwa-empty-layer">此层暂无记忆</div>'; }

      else { entries.forEach(function(entry) { html += '<div class="nvwa-entry"><div class="nvwa-entry-header"><span style="color:hsl(' + (entry.importance * 9.6) + ',70%,60%);font-size:12px;">★' + entry.importance + '</span><span class="nvwa-entry-time">' + new Date(entry.timestamp || 0).toLocaleDateString() + '</span></div><div class="nvwa-entry-content">' + escapeHtml(entry.content) + '</div></div>'; }); }

      html += '</div>';

    } else { html += '<div class="nvwa-hint">请从左侧选择角色</div>'; }

    html += '</div></div>';

    root.innerHTML = html;

    bindNvwaTabEvents();

  } catch(e) { console.error('loadNvwaData error:', e); }

}



function bindNvwaTabEvents() {

  document.querySelectorAll('.nvwa-char-item').forEach(function(item) {

    item.addEventListener('click', function() { state.nvwaSelectedChar = this.dataset.id; loadNvwaData(); });

  });

  document.querySelectorAll('.nvwa-layer-tab').forEach(function(tab) {

    tab.addEventListener('click', function() {

      state.nvwaActiveLayer = this.dataset.layer;

      document.querySelectorAll('.nvwa-layer-tab').forEach(function(t) { t.classList.remove('active'); });

      this.classList.add('active');

      loadNvwaData();

    });

  });

  var addBtn = document.getElementById('nvwa-add-btn');

  if (addBtn && !addBtn.dataset.bound) {

    addBtn.dataset.bound = '1';

    addBtn.addEventListener('click', function() { showNvwaAddModal(); });

  }

}



function showNvwaAddModal() {

  var charId = state.nvwaSelectedChar;

  if (!charId) return;

  var modal = document.createElement('div');

  modal.className = 'modal-overlay open';

  modal.innerHTML = '<div class="modal-box"><div class="modal-title">添加记忆</div><div class="modal-body">' +

    '<div class="field"><label>内容</label><textarea id="nvwa-new-content" rows="5" placeholder="'+t('nvwa.memoryContent')+'"></textarea></div>' +

    '<div class="detail-row"><div class="detail-field"><label>重要性</label><input id="nvwa-new-imp" type="range" min="1" max="10" value="5"><span id="nvwa-imp-val">5</span></div>' +

    '<div class="detail-field"><label>层级</label><select id="nvwa-new-status"><option value="buffer">'+t('nvwa.buffer')+'</option><option value="core">核心记忆</option><option value="recall">召回</option><option value="archival">归档</option></select></div></div>' +

    '</div><div class="modal-actions"><button class="btn btn-primary" id="nvwa-do-add">保存</button><button class="btn btn-secondary" id="nvwa-cancel-add">取消</button></div></div>';

  document.body.appendChild(modal);

  var el=document.getElementById('nvwa-new-imp');if(el)el.addEventListener('input', function() { document.getElementById('nvwa-imp-val').textContent = this.value; });

  var el=document.getElementById('nvwa-cancel-add');if(el)el.addEventListener('click', function() { modal.remove(); });

  var el=document.getElementById('nvwa-do-add');if(el)el.addEventListener('click', function() {

    var content = document.getElementById('nvwa-new-content').value.trim();

    if (!content) { alert('请输入内容'); return; }

    fetch('/api/memory/' + state.currentBook.id + '/' + charId, {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ content: content, importance: parseInt(document.getElementById('nvwa-new-imp').value), status: document.getElementById('nvwa-new-status').value })

    }).then(function(r) { return r.json(); }).then(function(res) { if (res.success) { modal.remove(); loadNvwaData(); } });

  });

}



// ============ 长文本分析弹窗 ============

function showLongTextAnalyzeModal() {

  var modal = document.createElement('div');

  modal.className = 'modal-overlay open';

  modal.innerHTML = '<div class="modal-box" style="width:560px;"><div class="modal-title">长文本分析</div><div class="modal-body">' +

    '<div class="field"><label>粘贴文本</label><textarea id="lt-content" rows="8" placeholder="'+t('home.longTextPlaceholder')+'" style="width:100%;background:var(--bg);border:1px solid var(--border);color:var(--text);padding:10px;border-radius:6px;font-size:13px;resize:vertical;font-family:inherit;"></textarea></div>' +

    '<div class="field"><label>'+t('home.analyzeDepth')+'</label><select id="lt-depth" style="width:100%;background:var(--bg);border:1px solid var(--border);color:var(--text);padding:8px;border-radius:6px;"><option value="quick">'+t('home.quickAnalyze')+'</option><option value="normal" selected>'+t('home.normalAnalyze')+'</option><option value="deep">'+t('home.deepAnalyze')+'</option></select></div>' +

    '<div id="lt-result" style="display:none;margin-top:12px;padding:12px;background:var(--bg);border-radius:8px;max-height:300px;overflow-y:auto;font-size:13px;line-height:1.8;"></div>' +

    '</div><div class="modal-actions"><button class="btn btn-primary" id="lt-analyze-btn">分析</button><button class="btn btn-secondary" id="lt-close-btn">关闭</button></div></div>';

  document.body.appendChild(modal);

  var el=document.getElementById('lt-close-btn');if(el)el.addEventListener('click', function() { modal.remove(); });

  var el=document.getElementById('lt-analyze-btn');if(el)el.addEventListener('click', async function() {

    var content = document.getElementById('lt-content').value.trim();

    var depth = document.getElementById('lt-depth').value;

    if (!content) { alert('请输入文本'); return; }

    var btn = this;

    btn.disabled = true; btn.textContent = '分析中...';

    var resultEl = document.getElementById('lt-result');

    resultEl.style.display = 'block';

    resultEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text2);">'+t('errors.analyzing')+'...</div>';

    try {

      var res = await fetch('/api/split', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: content, depth: depth, bookId: state.currentBook ? state.currentBook.id : '' }) });

      var result = await res.json();

      if (result.success) {

        var data = result.data || {};

        var html = '<div>';

        if (data.characters && data.characters.length) html += '<div style="margin-bottom:8px;"><b style="color:var(--accent);">角色：</b>' + data.characters.join('、') + '</div>';

        if (data.locations && data.locations.length) html += '<div style="margin-bottom:8px;"><b style="color:var(--accent);">地点：</b>' + data.locations.join('、') + '</div>';

        if (data.items && data.items.length) html += '<div style="margin-bottom:8px;"><b style="color:var(--accent);">物品：</b>' + data.items.join('、') + '</div>';

        if (html === '<div>') html = '<div style="color:var(--text2);">未提取到信息</div>';

        html += '</div>';

        resultEl.innerHTML = html;

      } else { resultEl.innerHTML = '<div style="color:#ef4444;">'+t('errors.saveFailed')+'</div>'; }

    } catch(e) { resultEl.innerHTML = '<div style="color:#ef4444;">请求失败：' + e.message + '</div>'; }

    btn.disabled = false; btn.textContent = '分析';

  });

}



// ============ 初始化 ============

