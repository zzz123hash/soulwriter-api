// ============ 第6部分: 设置功能 ============
function showGlobalSettings() {
  var modal = document.getElementById('settings-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.className = 'detail-modal';
    modal.innerHTML = '<div class="detail-modal-backdrop" onclick="closeGlobalSettings()"></div>' +
      '<div class="detail-modal-box">' +
      '<div class="detail-modal-header">' +
      '<span class="detail-modal-title">⚙️ 全局设置</span>' +
      '<button class="detail-modal-close" onclick="closeGlobalSettings()">×</button>' +
      '</div>' +
      '<div class="detail-modal-body" id="settings-body"></div>' +
      '</div>';
    document.body.appendChild(modal);
  }
  renderGlobalSettings();
  modal.classList.add('open');
}

function closeGlobalSettings() {
  var modal = document.getElementById('settings-modal');
  if (modal) modal.classList.remove('open');
}

function renderGlobalSettings() {
  var body = document.getElementById('settings-body');
  if (!body) return;
  
  // 使用新的SettingsSystem
  if (typeof SettingsSystem !== 'undefined') {
    SettingsSystem.loadConfigs();
    body.innerHTML = SettingsSystem.renderInPageSettings();
  } else {
    // 备用简单设置
    body.innerHTML = renderSimpleSettings();
  }
}

function renderSimpleSettings() {
  var currentTheme = localStorage.getItem('sw-theme') || 'dark';
  return '<div style="padding:16px;">' +
    '<h4 style="margin:0 0 16px 0;color:var(--text);">外观</h4>' +
    '<div class="form-field"><label style="display:block;margin-bottom:8px;font-size:13px;color:var(--text2);">主题</label>' +
    '<select id="setting-theme" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);">' +
    '<option value="dark" ' + (currentTheme === 'dark' ? 'selected' : '') + '>🌙 暗色</option>' +
    '<option value="soft" ' + (currentTheme === 'soft' ? 'selected' : '') + '>🌤️ 柔和</option>' +
    '<option value="blue" ' + (currentTheme === 'blue' ? 'selected' : '') + '>💙 蓝色</option>' +
    '<option value="green" ' + (currentTheme === 'green' ? 'selected' : '') + '>🌿 绿色</option>' +
    '</select></div>' +
    '<button onclick="saveGlobalSettings()" style="width:100%;padding:10px;background:var(--primary);color:white;border:none;border-radius:6px;font-size:14px;cursor:pointer;margin-top:20px;">保存设置</button>' +
    '</div>';
}

function saveGlobalSettings() {
  // 使用SettingsSystem保存
  if (typeof SettingsSystem !== 'undefined' && SettingsSystem.saveAllSettings) {
    SettingsSystem.saveAllSettings();
  } else {
    // 备用简单保存
    var theme = document.getElementById('setting-theme')?.value;
    var fontSize = document.getElementById('setting-fontsize')?.value;
    
    if (theme) localStorage.setItem('sw-theme', theme);
    if (fontSize) localStorage.setItem('sw-font-size', fontSize);
    
    document.documentElement.setAttribute('data-theme', theme);
    closeGlobalSettings();
    alert('设置已保存！');
  }
}



// Save book settings
function saveBookSettings() {
  var apiProvider = document.getElementById('book-api-provider')?.value || 'MOSS';
  var apiKey = document.getElementById('book-api-key')?.value || '';
  var apiUrl = document.getElementById('book-api-url')?.value || '';
  var writingStyle = document.getElementById('book-writing-style')?.value || 'classical';
  var narrativePov = document.getElementById('book-narrative-pov')?.value || 'third';
  
  if (state.currentBook) {
    state.currentBook.settings = {
      apiProvider, apiKey, apiUrl, writingStyle, narrativePov
    };
    // Save to localStorage for now
    localStorage.setItem('sw_book_settings_' + state.currentBook.id, JSON.stringify(state.currentBook.settings));
    alert('小说设置已保存！');
  }
}


function loadDrawerConfig() {

  try {

    var saved = localStorage.getItem('sw_drawer_config_v2');

    if (saved) { var cfg = JSON.parse(saved); cfg.collapsed = cfg.collapsed || {}; return cfg; }

  } catch(e) {}

  return { collapsed: {} };

}



function saveDrawerConfig(cfg) {

  try { localStorage.setItem('sw_drawer_config_v2', JSON.stringify(cfg)); } catch(e) {}

}



// ============ 导航页 ============

