/**
 * SoulWriter - 完整路由系统 v2
 * 
 * 核心思想：
 * 1. 每个功能模块都可以配置不同的AI
 * 2. 提示词可配置、可复用
 * 3. 路由规则支持优先级和条件
 */

const RouteSystem = {
  // ============ 路由配置 ============
  routes: {
    // 写作类
    'novel.write': { model: 'cheap', name: '小说写作' },
    'novel.continue': { model: 'smart', name: '续写' },
    'script.write': { model: 'smart', name: '剧本写作' },
    
    // 角色类
    'character.create': { model: 'creative', name: '角色创建' },
    'character.analyze': { model: 'smart', name: '角色分析' },
    'character.dialogue': { model: 'creative', name: '对白生成' },
    'character.growth': { model: 'smart', name: '成长弧线' },
    
    // 剧情类
    'plot.event': { model: 'smart', name: '事件设计' },
    'plot.timeline': { model: 'smart', name: '时间线' },
    'plot.conflict': { model: 'creative', name: '冲突设计' },
    'plot.ending': { model: 'smart', name: '结局设计' },
    
    // 世界观类
    'world.location': { model: 'creative', name: '地点创建' },
    'world.item': { model: 'creative', name: '物品创建' },
    'world.history': { model: 'smart', name: '历史设定' },
    'world.culture': { model: 'creative', name: '文化设计' },
    
    // 女娲类
    'nvwa.fate': { model: 'creative', name: '命运操控' },
    'nvwa.psychology': { model: 'analysis', name: '心理分析' },
    'nvwa.memory': { model: 'smart', name: '记忆处理' },
    'nvwa.analysis': { model: 'deep', name: '深度分析' },
    'nvwa.kline': { model: 'data', name: 'K线分析' },
    
    // 翻译类
    'translate.content': { model: 'translate', name: '内容翻译' },
    'translate.cultural': { model: 'cultural', name: '文化适配' },
    'translate.adapt': { model: 'cultural', name: '深度本土化' },
    
    // 分析类
    'analysis.relation': { model: 'smart', name: '关系分析' },
    'analysis.emotion': { model: 'analysis', name: '情感分析' },
    'analysis.tension': { model: 'data', name: '张力分析' },
    'analysis.theme': { model: 'smart', name: '主题分析' },
    
    // 提示词类
    'prompt.general': { model: 'smart', name: '通用提示词' },
    'prompt.role': { model: 'creative', name: '角色提示词' },
    'prompt.plot': { model: 'smart', name: '剧情提示词' },
  },
  
  // ============ 模型配置 ============
  models: {
    // 便宜管饱
    cheap: {
      name: '💰 便宜管饱',
      models: ['gpt-3.5-turbo', 'qwen-plus'],
      desc: '速度快，成本低，适合日常写作'
    },
    // 智能创作
    smart: {
      name: '🧠 智能创作',
      models: ['gpt-4o', 'claude-3-sonnet'],
      desc: '平衡型，适合大多数创作任务'
    },
    // 创意型
    creative: {
      name: '✨ 创意型',
      models: ['gpt-4o', 'claude-3-opus', 'gpt-4-turbo'],
      desc: '创意丰富，适合角色和世界构建'
    },
    // 深度分析
    deep: {
      name: '🔮 深度分析',
      models: ['claude-3-opus', 'gpt-4-turbo'],
      desc: '深度推理，适合复杂分析'
    },
    // 数据分析
    data: {
      name: '📊 数据分析',
      models: ['gpt-4o', 'claude-3-sonnet'],
      desc: '适合图表、曲线、数据处理'
    },
    // 翻译专用
    translate: {
      name: '🌐 翻译专用',
      models: ['gpt-4o', 'gpt-3.5-turbo'],
      desc: '翻译质量优先'
    },
    // 文化适配
    cultural: {
      name: '🎭 文化适配',
      models: ['gpt-4o', 'claude-3-sonnet'],
      desc: '文化要素替换，深度本地化'
    },
    // 分析型
    analysis: {
      name: '📈 分析型',
      models: ['claude-3-sonnet', 'gpt-4o'],
      desc: '适合心理、情感、关系分析'
    }
  },
  
  // ============ 提示词模板 ============
  prompts: {
    // 角色创建
    'character.create': {
      name: '角色创建',
      template: `你是一个小说创作助手。请根据以下信息创建一个角色：

类型：{{charType}}
背景：{{background}}

请生成：
1. 性格特点（3-5个关键词）
2. 外貌描写（100字以内）
3. 说话风格
4. 心理弱点
5. 成长潜力`,
      vars: ['charType', 'background']
    },
    
    // 对白生成
    'character.dialogue': {
      name: '对白生成',
      template: `情境：{{situation}}
角色：{{characterName}}（性格：{{personality}}）
情绪：{{emotion}}

生成3句对白：`,
      vars: ['situation', 'characterName', 'personality', 'emotion']
    },
    
    // 事件设计
    'plot.event': {
      name: '事件设计',
      template: `当前剧情：{{currentPlot}}
主要角色：{{characters}}

设计一个事件，要求：
1. 推动剧情发展
2. 符合角色性格
3. 增加戏剧张力`,
      vars: ['currentPlot', 'characters']
    },
    
    // 命运操控
    'nvwa.fate': {
      name: '命运操控',
      template: `主角：{{protagonist}}
当前状态：{{state}}

从以下三个方向给出建议：
1. 🌟 奖励：给主角一个意外的收获
2. ⚡ 惩罚：给主角一个困难
3. 💫 转折：引入一个新的变数`,
      vars: ['protagonist', 'state']
    },
    
    // 文化适配
    'translate.cultural': {
      name: '文化适配',
      template: `原文：{{text}}
源文化：{{sourceCulture}}
目标文化：{{targetCulture}}
改编强度：{{strength}}%

进行文化要素替换，保持故事核心不变。`,
      vars: ['text', 'sourceCulture', 'targetCulture', 'strength']
    }
  },
  
  // ============ 获取路由模型 ============
  getModel(routeKey) {
    const route = this.routes[routeKey];
    if (!route) {
      // 返回默认
      return this.models.smart.models[0];
    }
    
    const modelConfig = this.models[route.model];
    if (!modelConfig) {
      return 'gpt-4o';
    }
    
    // 返回第一个可用的模型
    return modelConfig.models[0] || 'gpt-4o';
  },
  
  // ============ 获取模型配置 ============
  getModelConfig(routeKey) {
    const route = this.routes[routeKey];
    if (!route) {
      return this.models.smart;
    }
    return this.models[route.model] || this.models.smart;
  },
  
  // ============ 执行带路由的AI调用 ============
  async callWithRoute(routeKey, prompt, options = {}) {
    const model = this.getModel(routeKey);
    const modelConfig = this.getModelConfig(routeKey);
    
    console.log(`[RouteSystem] ${routeKey} → ${modelConfig.name} (${model})`);
    
    // 调用AI
    return await this.callAI(model, prompt, options);
  },
  
  // ============ 实际AI调用 ============
  async callAI(model, prompt, options = {}) {
    // 从SettingsSystem获取配置
    const config = SettingsSystem?.getRoutedModel('default') || {
      baseUrl: 'http://192.168.0.107:13000',
      apiKey: ''
    };
    
    try {
      const response = await fetch(`${config.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: options.max_tokens || 2000,
          temperature: options.temperature || 0.7
        })
      });
      
      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error('AI call failed:', error);
      return '';
    }
  },
  
  // ============ 渲染路由设置面板 ============
  renderRouteSettings() {
    const categories = {
      'novel': { name: '📚 小说/剧本', routes: [] },
      'character': { name: '👤 角色', routes: [] },
      'plot': { name: '📖 剧情', routes: [] },
      'world': { name: '🌍 世界观', routes: [] },
      'nvwa': { name: '🔮 女娲', routes: [] },
      'translate': { name: '🌐 翻译', routes: [] },
      'analysis': { name: '📊 分析', routes: [] },
      'prompt': { name: '💬 提示词', routes: [] }
    };
    
    // 分类路由
    Object.entries(this.routes).forEach(([key, route]) => {
      const cat = key.split('.')[0];
      if (categories[cat]) {
        categories[cat].routes.push({ key, ...route });
      }
    });
    
    // 添加提示词模板到prompt分类
    Object.entries(this.prompts).forEach(([key, prompt]) => {
      categories.prompt.routes.push({
        key,
        name: prompt.name,
        model: this.routes[key]?.model || 'smart'
      });
    });
    
    // 生成HTML
    let html = '';
    
    Object.entries(categories).forEach(([catKey, cat]) => {
      if (cat.routes.length === 0) return;
      
      html += `
        <div class="route-category">
          <div class="route-category-title">${cat.name}</div>
          <div class="route-list">
            ${cat.routes.map(route => `
              <div class="route-item">
                <div class="route-name">${route.name}</div>
                <select class="route-select" data-route="${route.key}">
                  ${Object.entries(this.models).map(([mKey, m]) => `
                    <option value="${mKey}" ${route.model === mKey ? 'selected' : ''}>
                      ${m.name}
                    </option>
                  `).join('')}
                </select>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });
    
    return html;
  },
  
  // ============ 渲染提示词编辑器 ============
  renderPromptEditor() {
    let html = '';
    
    Object.entries(this.prompts).forEach(([key, prompt]) => {
      html += `
        <div class="prompt-card">
          <div class="prompt-header">
            <span class="prompt-name">${prompt.name}</span>
            <div class="prompt-actions">
              <button class="prompt-btn" onclick="RouteSystem.copyPrompt('${key}')">📋 复制</button>
              <button class="prompt-btn" onclick="RouteSystem.editPrompt('${key}')">✏️ 编辑</button>
            </div>
          </div>
          <div class="prompt-template">${this.escapeHtml(prompt.template)}</div>
          <div class="prompt-vars">
            变量：${prompt.vars.map(v => `<code>{{${v}}}</code>`).join(', ')}
          </div>
        </div>
      `;
    });
    
    return html;
  },
  
  // ============ 复制提示词 ============
  copyPrompt(key) {
    const prompt = this.prompts[key];
    if (prompt) {
      navigator.clipboard.writeText(prompt.template).then(() => {
        alert('提示词已复制到剪贴板！');
      });
    }
  },
  
  // ============ 编辑提示词 ============
  editPrompt(key) {
    const prompt = this.prompts[key];
    if (!prompt) return;
    
    const newTemplate = prompt.template; // TODO: 打开编辑弹窗
    console.log('Edit prompt:', key);
  },
  
  // ============ 保存路由设置 ============
  saveRouteSettings() {
    document.querySelectorAll('.route-select').forEach(sel => {
      const route = sel.dataset.route;
      const model = sel.value;
      
      if (route && model) {
        localStorage.setItem(`sw_route_${route}`, model);
        // 更新内存中的路由配置
        if (this.routes[route]) {
          this.routes[route].model = model;
        }
      }
    });
    
    alert('路由设置已保存！');
  },
  
  // ============ 工具函数 ============
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// 全局访问
window.RouteSystem = RouteSystem;

// 扩展SettingsSystem的路由面板
const originalRenderRouteSettings = SettingsSystem.renderRouteSettings;
SettingsSystem.renderRouteSettings = function() {
  return `
    <div class="settings-section">
      <div class="settings-section-title">🛤️ 功能路由配置</div>
      <p style="font-size:12px;color:var(--text2);margin-bottom:16px;">
        为每个功能选择最适合的AI模型。创意任务用创意型，复杂分析用深度型。
      </p>
      ${RouteSystem.renderRouteSettings()}
      <div class="btn-row">
        <button class="btn-save" onclick="RouteSystem.saveRouteSettings()">保存路由设置</button>
      </div>
    </div>
    
    <div class="settings-section">
      <div class="settings-section-title">💬 提示词模板</div>
      <p style="font-size:12px;color:var(--text2);margin-bottom:16px;">
        查看和复制提示词，用于其他AI工具或自定义修改。
      </p>
      ${RouteSystem.renderPromptEditor()}
    </div>
  `;
};
