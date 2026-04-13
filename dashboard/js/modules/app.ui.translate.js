// ============ 第16部分: 翻译系统 ============
function renderTranslateTab() {
  return '<div class="translate-tab-root" id="translate-tab-root">' +
    '<div class="translate-header">' +
      '<div class="translate-lang-selects">' +
        '<div class="translate-select-group">' +
          '<label>' + t('translate.source') + '</label>' +
          '<select id="tl-source-lang">' +
            '<option value="zh" selected>中文</option>' +
            '<option value="en">English</option>' +
            '<option value="ja">日本語</option>' +
          '</select>' +
        '</div>' +
        '<div class="translate-arrow">→</div>' +
        '<div class="translate-select-group">' +
          '<label>' + t('translate.target') + '</label>' +
          '<select id="tl-target-lang">' +
            '<option value="en" selected>English</option>' +
            '<option value="zh">中文</option>' +
            '<option value="ja">日本語</option>' +
            '<option value="ko">한국어</option>' +
          '</select>' +
        '</div>' +
      '</div>' +
      '<div class="translate-strength-section">' +
        '<div class="translate-strength-header">' +
          '<label>' + t('translate.strength') + ': <span id="tl-strength-val">50</span></label>' +
          '<span class="translate-strength-label" id="tl-strength-label">智能适配</span>' +
        '</div>' +
        '<input type="range" id="tl-strength" min="0" max="100" value="50" class="translate-slider">' +
        '<div class="translate-strength-marks">' +
          '<span>0</span><span>20</span><span>40</span><span>60</span><span>80</span><span>100</span>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="translate-body">' +
      '<div class="translate-original-pane">' +
        '<div class="translate-pane-header">' +
          '<span>' + t('translate.original') + '</span>' +
          '<button class="btn-tl-load-book" id="tl-load-book">' + t('actions.import') + '</button>' +
        '</div>' +
        '<textarea id="tl-original-text" class="translate-textarea" placeholder="' + t('translate.originalPlaceholder') + '"></textarea>' +
        '<div class="translate-actions">' +
          '<button class="btn btn-primary" id="tl-translate-btn">' + t('translate.translateBtn') + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="translate-changes-pane">' +
        '<div class="translate-pane-header">' +
          '<span>' + t('translate.changes') + ' <span id="tl-changes-count">(0)</span></span>' +
          '<div class="tl-changes-actions">' +
            '<button class="btn btn-sm" id="tl-accept-all">' + t('translate.acceptAll') + '</button>' +
            '<button class="btn btn-sm btn-secondary" id="tl-preview-btn">' + t('translate.preview') + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="translate-changes-list" id="tl-changes-list">' +
          '<div class="translate-changes-empty">' + t('translate.noChanges') + '</div>' +
        '</div>' +
        '<div class="tl-preview-box" id="tl-preview-box" style="display:none;">' +
          '<div class="tl-preview-label">' + t('translate.previewResult') + '</div>' +
          '<div class="tl-preview-text" id="tl-preview-text"></div>' +
        '</div>' +
      '</div>' +
      '<div class="translate-result-pane">' +
        '<div class="translate-pane-header">' +
          '<span>' + t('translate.result') + '</span>' +
          '<div class="translate-result-actions">' +
            '<button class="btn btn-sm" id="tl-copy-result">' + t('actions.copy') + '</button>' +
            '<button class="btn btn-sm btn-primary" id="tl-save-version">' + t('translate.saveVersion') + '</button>' +
          '</div>' +
        '</div>' +
        '<div id="tl-result-text" class="translate-result-text"></div>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function bindTranslateTabEvents() {
  // Strength slider
  var slider = document.getElementById('tl-strength');
  var valEl = document.getElementById('tl-strength-val');
  var labelEl = document.getElementById('tl-strength-label');

  function updateStrengthLabel(v) {
    valEl.textContent = v;
    var labels = {
      basic: t('translate.basic'),
      light: t('translate.light'),
      smart: t('translate.smart'),
      deep: t('translate.deep'),
      full: t('translate.full')
    };
    var label = v < 20 ? labels.basic : v < 40 ? labels.light : v < 60 ? labels.smart : v < 80 ? labels.deep : labels.full;
    labelEl.textContent = label;
    labelEl.className = 'translate-strength-label strength-' + (v < 20 ? 'basic' : v < 40 ? 'light' : v < 60 ? 'smart' : v < 80 ? 'deep' : 'full');
  }

  if (slider) {
    slider.addEventListener('input', function() { updateStrengthLabel(this.value); });
    updateStrengthLabel(slider.value);
  }

  // Translate button
  var btn = document.getElementById('tl-translate-btn');
  if (btn && !btn.dataset.bound) {
    btn.dataset.bound = '1';
    btn.addEventListener('click', async function() {
      var text = (document.getElementById('tl-original-text') || {}).value || '';
      if (!text.trim()) { alert(t('errors.required')); return; }

      btn.disabled = true;
      btn.textContent = t('translate.translating') + '...';

      var sourceLang = (document.getElementById('tl-source-lang') || {}).value || 'zh';
      var targetLang = (document.getElementById('tl-target-lang') || {}).value || 'en';
      var strength = parseInt((document.getElementById('tl-strength') || {}).value) || 50;

      try {
        var res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, sourceLang, targetLang, strength })
        });
        var result = await res.json();

        if (result.success && result.data) {
          var data = result.data;

          // Show translated text with placeholders
          var resultEl = document.getElementById('tl-result-text');
          if (resultEl) { resultEl.textContent = data.text || ''; }

          // Show changes
          var changes = data.changes || [];
          var countEl = document.getElementById('tl-changes-count');
          if (countEl) countEl.textContent = '(' + changes.length + ')';

          var listEl = document.getElementById('tl-changes-list');
          if (listEl) {
            if (!changes.length) {
              listEl.innerHTML = '<div class="translate-changes-empty">' + t('translate.noChanges') + '</div>';
            } else {
              var typeIcons = {
                food: '🍚', festival: '🎊', greetings: '🤝', deity: '🙏',
                social_class: '👑', architecture: '🏛️', clothing: '👘', customs: '🎎', currency: '💰', era_setting: '📜', other: '✏️'
              };
              var typeNames = {
                food: t('translate.changeFood') || '食物',
                festival: t('translate.changeFestival') || '节日',
                greetings: t('translate.changeGreeting') || '问候',
                deity: t('translate.changeDeity') || '神祇',
                social_class: t('translate.changeSocial') || '社会阶层',
                architecture: t('translate.changeArchitecture') || '建筑',
                clothing: t('translate.changeClothing') || '服饰',
                customs: t('translate.changeCustom') || '习俗',
                currency: t('translate.changeCurrency') || '货币',
                era_setting: t('translate.changeEra') || '时代背景',
                other: t('translate.changeOther') || '其他'
              };
              
              listEl.innerHTML = changes.map(function(c, i) {
                var options = Array.isArray(c.options) ? c.options : (c.replacement ? [c.replacement] : []);
                var checked = c.confirmed ? 'checked' : '';
                var optionsHtml = options.map(function(opt, oi) {
                  var sel = oi === 0 ? 'selected' : '';
                  return '<option value="' + escapeHtml(opt) + '" ' + sel + '>' + escapeHtml(opt) + '</option>';
                }).join('');
                
                return '<div class="translate-change-item pending" data-index="' + i + '" id="tl-change-' + i + '">' +
                  '<div class="translate-change-header">' +
                    '<input type="checkbox" class="tl-change-check" id="tl-check-' + i + '" ' + checked + '>' +
                    '<span class="translate-change-type">' + (typeIcons[c.changeType] || '✏️') + ' ' + (typeNames[c.changeType] || c.changeType) + '</span>' +
                    '<div class="translate-change-actions">' +
                      '<button class="btn-tl-apply-change" data-i="' + i + '">' + t('translate.accept') + '</button>' +
                      '<button class="btn-tl-reject-change" data-i="' + i + '">' + t('translate.reject') + '</button>' +
                    '</div>' +
                  '</div>' +
                  '<div class="translate-change-body">' +
                    '<div class="translate-change-row">' +
                      '<span class="change-label">' + t('translate.original') + ':</span>' +
                      '<span class="original-text">' + escapeHtml(c.original) + '</span>' +
                    '</div>' +
                    '<div class="translate-change-row">' +
                      '<span class="change-label">' + t('translate.transformed') + ':</span>' +
                      '<select class="tl-change-select" id="tl-opt-' + i + '">' + optionsHtml + '</select>' +
                    '</div>' +
                    (c.context ? '<div class="translate-change-context">💡 ' + escapeHtml(c.context) + '</div>' : '') +
                  '</div>' +
                '</div>';
              }).join('');
              
              // Bind change item events
              listEl.querySelectorAll('.btn-tl-apply-change').forEach(function(b) {
                b.addEventListener('click', function() {
                  var idx = parseInt(this.dataset.i);
                  var item = document.getElementById('tl-change-' + idx);
                  var check = document.getElementById('tl-check-' + idx);
                  var select = document.getElementById('tl-opt-' + idx);
                  if (item && check && select) {
                    item.classList.remove('pending');
                    item.classList.add('confirmed');
                    check.checked = true;
                    state._pendingChanges = state._pendingChanges || [];
                    state._pendingChanges[idx] = { index: idx, original: changes[idx].original, applied: select.value, confirmed: true };
                  }
                });
              });
              
              listEl.querySelectorAll('.btn-tl-reject-change').forEach(function(b) {
                b.addEventListener('click', function() {
                  var idx = parseInt(this.dataset.i);
                  var item = document.getElementById('tl-change-' + idx);
                  var check = document.getElementById('tl-check-' + idx);
                  if (item && check) {
                    item.classList.remove('pending', 'confirmed');
                    item.classList.add('rejected');
                    check.checked = false;
                    state._pendingChanges = state._pendingChanges || [];
                    state._pendingChanges[idx] = { index: idx, original: changes[idx].original, applied: changes[idx].original, confirmed: false };
                  }
                });
              });
            }
          }

          state.currentTranslationId = data.translationId;
          state.currentTranslationText = data.text;
          state.currentTranslationChanges = changes;
          
          // Hide preview box
          var previewBox = document.getElementById('tl-preview-box');
          if (previewBox) previewBox.style.display = 'none';
        }
      } catch(e) {
        alert(t('errors.networkError') + ': ' + e.message);
      }

      btn.disabled = false;
      btn.textContent = t('translate.translateBtn');
    });
  }

  // Accept All button
  var acceptAllBtn = document.getElementById('tl-accept-all');
  if (acceptAllBtn && !acceptAllBtn.dataset.bound) {
    acceptAllBtn.dataset.bound = '1';
    acceptAllBtn.addEventListener('click', function() {
      var listEl = document.getElementById('tl-changes-list');
      if (!listEl) return;
      listEl.querySelectorAll('.translate-change-item.pending').forEach(function(item) {
        var idx = parseInt(item.dataset.index);
        var check = item.querySelector('.tl-change-check');
        var select = item.querySelector('.tl-change-select');
        if (check && select) {
          item.classList.remove('pending');
          item.classList.add('confirmed');
          check.checked = true;
          var changes = state.currentTranslationChanges || [];
          state._pendingChanges = state._pendingChanges || [];
          state._pendingChanges[idx] = { index: idx, original: changes[idx] ? changes[idx].original : '', applied: select.value, confirmed: true };
        }
      });
    });
  }

  // Preview button
  var previewBtn = document.getElementById('tl-preview-btn');
  if (previewBtn && !previewBtn.dataset.bound) {
    previewBtn.dataset.bound = '1';
    previewBtn.addEventListener('click', function() {
      var originalText = (document.getElementById('tl-result-text') || {}).textContent || '';
      var pending = state._pendingChanges || [];
      var changes = state.currentTranslationChanges || [];
      
      // Build replacement map
      var replacements = {};
      for (var i = 0; i < pending.length; i++) {
        if (pending[i] && pending[i].confirmed) {
          replacements['【' + i + '】'] = pending[i].applied;
        }
      }
      
      // Apply replacements
      var previewText = originalText;
      for (var ph in replacements) {
        previewText = previewText.split(ph).join(replacements[ph]);
      }
      // Remove unconfirmed placeholders
      previewText = previewText.replace(/【(\d+)】/g, function(m, idx) {
        return pending[idx] ? pending[idx].original : m;
      });
      
      var previewBox = document.getElementById('tl-preview-box');
      var previewTextEl = document.getElementById('tl-preview-text');
      if (previewBox && previewTextEl) {
        previewTextEl.textContent = previewText;
        previewBox.style.display = 'block';
      }
    });
  }

  // Load book content
  var loadBtn = document.getElementById('tl-load-book');
  if (loadBtn && !loadBtn.dataset.bound) {
    loadBtn.dataset.bound = '1';
    loadBtn.addEventListener('click', async function() {
      if (!state.currentBook) { alert('请先打开一本书'); return; }
      try {
        var res = await fetch('/api/v1/nvwa/events?limit=100');
        var result = await res.json();
        if (result.success && result.data && result.data.events) {
          var text = result.data.events.map(function(ev) {
            return (ev.chapter ? ev.chapter + ' ' : '') + ev.title + '\n' + (ev.result || ev.process || '');
          }).join('\n\n');
          var ta = document.getElementById('tl-original-text');
          if (ta) ta.value = text;
        }
      } catch(e) {
        alert(t('errors.loadFailed'));
      }
    });
  }

  // Copy result
  var copyBtn = document.getElementById('tl-copy-result');
  if (copyBtn && !copyBtn.dataset.bound) {
    copyBtn.dataset.bound = '1';
    copyBtn.addEventListener('click', function() {
      var text = (document.getElementById('tl-result-text') || {}).textContent || '';
      if (!text) return;
      navigator.clipboard.writeText(text).then(function() {
        var originalText = copyBtn.textContent;
        copyBtn.textContent = t('actions.copied') || '✓';
        setTimeout(function() { copyBtn.textContent = originalText; }, 1500);
      });
    });
  }
}


// ============ 设置Tab ============
function renderSettingsTab() {
  return '<div class="settings-tab-root">' +
    '<div class="settings-header"><h2>⚙️ 设置</h2></div>' +
    '<div class="settings-section">' +
      '<p style="color:var(--text2);text-align:center;padding:40px;">设置功能开发中...</p>' +
    '</div>' +
  '</div>';
}
