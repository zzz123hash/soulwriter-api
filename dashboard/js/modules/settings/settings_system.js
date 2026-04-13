/**
 * SoulWriter - 完整设置系统
 * 
 * 功能：
 * 1. 内页设置 - 应用内弹窗设置
 * 2. 外页设置 - 独立页面 settings.html
 * 3. 多API配置管理
 * 4. 用途路由 - 不同功能用不同模型
 */

const SettingsSystem = {
  // ============ API配置列表 ============
  apiConfigs: [],
  
  // ============ 用途路由配置 ============
  routeConfigs: {
    // 用途: 对应配置ID
    writing: null,      // 写作（便宜管饱）
    plot: null,         // 事件线（需要智能）
    translate: null,     // 翻译
    nvwa: null,        // 女娲分析
    analysis: null,    // 综合分析
    default: null       // 默认
  },
  
  // ============ 初始化 ============
  init() {
    this.loadConfigs();
    console.log('⚙️ SettingsSystem initialized');
  },
  
  // ============ 加载配置 ============
  async loadConfigs() {
    try {
      const res = await fetch('/api/settings/ai-configs');
      const data = await res.json();
      if (data.success) {
        this.apiConfigs = data.data || [];
      }
    } catch (e) {
      console.error('Failed to load configs:', e);
    }
  },
  
  // ============ 渲染内页设置（Modal） ============
  renderInPageSettings() {
    const html = `
      <div class="settings-container">
        <!-- Tab导航 -->
        <div class="settings-tabs">
          <button class="settings-tab active" data-tab="appearance">外观</button>
          <button class="settings-tab" data-tab="api">API配置</button>
          <button class="settings-tab" data-tab="routes">用途路由</button>
          <button class="settings-tab" data-tab="about">关于</button>
        </div>
        
        <!-- 外观设置 -->
        <div class="settings-panel active" id="settings-appearance">
          ${this.renderAppearanceSettings()}
        </div>
        
        <!-- API配置 -->
        <div class="settings-panel" id="settings-api">
          ${this.renderAPISettings()}
        </div>
        
        <!-- 用途路由 -->
        <div class="settings-panel" id="settings-routes">
          ${this.renderRouteSettings()}
        </div>
        
        <!-- 关于 -->
        <div class="settings-panel" id="settings-about">
          ${this.renderAboutSettings()}
        </div>
      </div>
      
      <style>
        .settings-container {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .settings-tabs {
          display: flex;
          gap: 4px;
          padding: 8px;
          background: var(--bg2);
          border-radius: 8px;
          margin-bottom: 16px;
        }
        
        .settings-tab {
          flex: 1;
          padding: 10px 16px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: var(--text2);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .settings-tab:hover {
          background: var(--bg3);
          color: var(--text);
        }
        
        .settings-tab.active {
          background: var(--primary);
          color: white;
        }
        
        .settings-panel {
          display: none;
        }
        
        .settings-panel.active {
          display: block;
        }
        
        .settings-section {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
        }
        
        .settings-section-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 12px;
        }
        
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .form-field.full {
          grid-column: span 2;
        }
        
        .form-label {
          font-size: 12px;
          color: var(--text2);
          font-weight: 500;
        }
        
        .form-input, .form-select {
          padding: 10px 12px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text);
          font-size: 13px;
        }
        
        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: var(--primary);
        }
        
        .api-config-card {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
        }
        
        .api-config-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .api-config-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
        }
        
        .api-config-badge {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 10px;
          background: var(--primary);
          color: white;
        }
        
        .route-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--bg);
          border-radius: 8px;
          margin-bottom: 8px;
        }
        
        .route-label {
          width: 100px;
          font-size: 13px;
          color: var(--text);
        }
        
        .route-select {
          flex: 1;
          padding: 8px 12px;
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text);
          font-size: 13px;
        }
        
        .btn-row {
          display: flex;
          gap: 8px;
          margin-top: 20px;
        }
        
        .btn-save {
          flex: 1;
          padding: 12px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        
        .btn-save:hover {
          opacity: 0.9;
        }
        
        .btn-secondary {
          padding: 12px 24px;
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text);
          font-size: 14px;
          cursor: pointer;
        }
        
        .btn-add {
          width: 100%;
          padding: 12px;
          background: transparent;
          border: 2px dashed var(--border);
          border-radius: 8px;
          color: var(--text2);
          font-size: 14px;
          cursor: pointer;
          margin-top: 12px;
        }
        
        .btn-add:hover {
          border-color: var(--primary);
          color: var(--primary);
        }
      </style>
    `;
    
    return html;
  },
  
  // ============ 外观设置 ============
  renderAppearanceSettings() {
    const currentTheme = localStorage.getItem('sw-theme') || 'dark';
    const fontSize = localStorage.getItem('sw-font-size') || '14';
    const locale = localStorage.getItem('sw_locale') || 'zh';
    
    return `
      <div class="settings-section">
        <div class="settings-section-title">🎨 外观</div>
        
        <div class="form-row">
          <div class="form-field">
            <label class="form-label">主题</label>
            <select class="form-select" id="setting-theme">
              <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>🌙 暗色</option>
              <option value="soft" ${currentTheme === 'soft' ? 'selected' : ''}>🌤️ 柔和</option>
              <option value="blue" ${currentTheme === 'blue' ? 'selected' : ''}>💙 蓝色</option>
              <option value="green" ${currentTheme === 'green' ? 'selected' : ''}>🌿 绿色</option>
            </select>
          </div>
          
          <div class="form-field">
            <label class="form-label">字体大小</label>
            <select class="form-select" id="setting-fontsize">
              <option value="12" ${fontSize === '12' ? 'selected' : ''}>小 (12px)</option>
              <option value="14" ${fontSize === '14' ? 'selected' : ''}>中 (14px)</option>
              <option value="16" ${fontSize === '16' ? 'selected' : ''}>大 (16px)</option>
              <option value="18" ${fontSize === '18' ? 'selected' : ''}>特大 (18px)</option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-field full">
            <label class="form-label">界面语言</label>
            <select class="form-select" id="setting-locale">
              <option value="zh" ${locale === 'zh' ? 'selected' : ''}>🇨🇳 中文</option>
              <option value="en" ${locale === 'en' ? 'selected' : ''}>🇺🇸 English</option>
            </select>
          </div>
        </div>
      </div>
    `;
  },
  
  // ============ API设置 ============
  renderAPISettings() {
    const configsHtml = this.apiConfigs.map((cfg, i) => `
      <div class="api-config-card" data-id="${cfg.id}">
        <div class="api-config-header">
          <span class="api-config-name">${cfg.name || '配置 ' + (i + 1)}</span>
          <span class="api-config-badge">${cfg.type === 'cloud' ? '☁️ 云端' : '💻 本地'}</span>
        </div>
        <div class="form-row">
          <div class="form-field">
            <label class="form-label">名称</label>
            <input type="text" class="form-input" value="${cfg.name || ''}" placeholder="我的GPT-4">
          </div>
          <div class="form-field">
            <label class="form-label">类型</label>
            <select class="form-select">
              <option value="cloud" ${cfg.type === 'cloud' ? 'selected' : ''}>☁️ 云端API</option>
              <option value="local" ${cfg.type === 'local' ? 'selected' : ''}>💻 本地模型</option>
            </select>
          </div>
        </div>
        <div class="form-field full">
          <label class="form-label">API URL</label>
          <input type="text" class="form-input" value="${cfg.baseUrl || ''}" placeholder="https://api.openai.com/v1">
        </div>
        <div class="form-row">
          <div class="form-field full">
            <label class="form-label">API Key</label>
            <input type="password" class="form-input" value="${cfg.apiKey || ''}" placeholder="sk-...">
          </div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <label class="form-label">模型</label>
            <input type="text" class="form-input" value="${cfg.model || ''}" placeholder="gpt-4o">
          </div>
          <div class="form-field">
            <label class="form-label">优先级</label>
            <select class="form-select">
              <option value="1" ${cfg.priority === 1 ? 'selected' : ''}>1 - 最高</option>
              <option value="2" ${!cfg.priority || cfg.priority === 2 ? 'selected' : ''}>2 - 中等</option>
              <option value="3" ${cfg.priority === 3 ? 'selected' : ''}>3 - 最低</option>
            </select>
          </div>
        </div>
        <button class="btn-secondary" onclick="SettingsSystem.deleteConfig('${cfg.id}')" style="margin-top:8px;">🗑️ 删除</button>
      </div>
    `).join('');
    
    return `
      <div class="settings-section">
        <div class="settings-section-title">🔑 API配置</div>
        ${configsHtml || '<p style="color:var(--text2);font-size:13px;">暂无API配置</p>'}
        <button class="btn-add" onclick="SettingsSystem.addNewConfig()">+ 添加新配置</button>
      </div>
    `;
  },
  
  // ============ 用途路由设置 ============
  renderRouteSettings() {
    const routeOptions = this.apiConfigs.map(cfg => 
      `<option value="${cfg.id}">${cfg.name || cfg.model || cfg.id}</option>`
    ).join('');
    
    const routes = [
      { key: 'writing', label: '✍️ 写作', desc: '小说/剧本写作，便宜管饱' },
      { key: 'plot', label: '📖 事件线', desc: '剧情规划和事件设计' },
      { key: 'translate', label: '🌐 翻译', desc: '语种翻译和文化适配' },
      { key: 'nvwa', label: '🔮 女娲推演', desc: '深度分析和推理' },
      { key: 'analysis', label: '📊 综合分析', desc: '角色关系和世界观分析' },
      { key: 'default', label: '⚙️ 默认', desc: '其他功能的默认模型' }
    ];
    
    const routesHtml = routes.map(r => `
      <div class="route-item">
        <div class="route-label">
          <div>${r.label}</div>
          <div style="font-size:11px;color:var(--text2);">${r.desc}</div>
        </div>
        <select class="route-select" data-route="${r.key}">
          <option value="">-- 不指定 --</option>
          ${routeOptions}
        </select>
      </div>
    `).join('');
    
    return `
      <div class="settings-section">
        <div class="settings-section-title">🛤️ 用途路由</div>
        <p style="font-size:12px;color:var(--text2);margin-bottom:16px;">
          设置不同功能使用的AI模型。写作用便宜的，复杂分析用高级的。
        </p>
        ${routesHtml}
      </div>
    `;
  },
  
  // ============ 关于 ============
  renderAboutSettings() {
    return `
      <div class="settings-section">
        <div class="settings-section-title">ℹ️ 关于</div>
        <div style="text-align:center;padding:20px;">
          <div style="font-size:48px;margin-bottom:12px;">📚</div>
          <h2 style="margin:0 0 8px 0;font-size:20px;color:var(--text);">SoulWriter</h2>
          <p style="margin:0 0 4px 0;color:var(--text2);font-size:14px;">世界架构设计师</p>
          <p style="margin:0;color:var(--text2);font-size:12px;">版本 2.0.0</p>
        </div>
        <div style="border-top:1px solid var(--border);padding-top:16px;margin-top:16px;">
          <p style="font-size:13px;color:var(--text2);line-height:1.6;">
            SoulWriter 是一款专为小说创作者设计的工具，帮助你构建完整的世界观、角色关系和故事线。
          </p>
        </div>
      </div>
    `;
  },
  
  // ============ 添加新配置 ============
  addNewConfig() {
    const newConfig = {
      id: 'config_' + Date.now(),
      name: '新配置',
      type: 'cloud',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4o',
      apiKey: '',
      priority: 2
    };
    
    this.apiConfigs.push(newConfig);
    this.saveConfig(newConfig);
    this.refreshAPIPanel();
  },
  
  // ============ 保存配置 ============
  async saveConfig(config) {
    try {
      const res = await fetch('/api/settings/character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        console.log('Config saved:', config.name);
      }
    } catch (e) {
      console.error('Failed to save config:', e);
    }
  },
  
  // ============ 删除配置 ============
  async deleteConfig(id) {
    if (!confirm('确定删除此配置？')) return;
    
    try {
      const res = await fetch(`/api/settings/character/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        this.apiConfigs = this.apiConfigs.filter(c => c.id !== id);
        this.refreshAPIPanel();
      }
    } catch (e) {
      console.error('Failed to delete config:', e);
    }
  },
  
  // ============ 刷新API面板 ============
  refreshAPIPanel() {
    const panel = document.getElementById('settings-api');
    if (panel) {
      panel.innerHTML = this.renderAPISettings();
    }
  },
  
  // ============ 保存所有设置 ============
  async saveAllSettings() {
    // 保存外观设置
    const theme = document.getElementById('setting-theme')?.value;
    const fontSize = document.getElementById('setting-fontsize')?.value;
    const locale = document.getElementById('setting-locale')?.value;
    
    if (theme) localStorage.setItem('sw-theme', theme);
    if (fontSize) localStorage.setItem('sw-font-size', fontSize);
    if (locale) localStorage.setItem('sw_locale', locale);
    
    // 保存路由设置
    document.querySelectorAll('.route-select').forEach(sel => {
      const route = sel.dataset.route;
      const value = sel.value;
      if (route) {
        localStorage.setItem(`sw_route_${route}`, value);
      }
    });
    
    // 应用主题
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme);
    }
    
    // 刷新i18n
    if (locale && window._i18n) {
      await window._i18n.setLocale(locale);
    }
    
    alert('设置已保存！');
    closeGlobalSettings();
  },
  
  // ============ 获取路由配置的模型 ============
  getRoutedModel(purpose) {
    const configId = localStorage.getItem(`sw_route_${purpose}`);
    if (configId) {
      const config = this.apiConfigs.find(c => c.id === configId);
      if (config) {
        return {
          baseUrl: config.baseUrl,
          model: config.model,
          apiKey: config.apiKey
        };
      }
    }
    
    // 返回默认配置
    const defaultId = localStorage.getItem('sw_route_default');
    if (defaultId) {
      const config = this.apiConfigs.find(c => c.id === defaultId);
      if (config) {
        return {
          baseUrl: config.baseUrl,
          model: config.model,
          apiKey: config.apiKey
        };
      }
    }
    
    // 返回内置默认
    return {
      baseUrl: localStorage.getItem('sw-api-url') || 'http://192.168.0.107:13000',
      model: localStorage.getItem('sw-model') || 'MOSS',
      apiKey: localStorage.getItem('sw-api-key') || ''
    };
  }
};

// 全局访问
window.SettingsSystem = SettingsSystem;

// Tab切换
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('settings-tab')) {
    const tab = e.target.dataset.tab;
    
    // 切换tab样式
    document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
    
    // 切换面板
    document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`settings-${tab}`)?.classList.add('active');
  }
});
