/**
 * SoulWriter - AI节点分析系统 JS
 * 
 * 功能：
 * 1. 圆环打分组件渲染
 * 2. 节点AI分析卡片
 * 3. 人物饱满度分析
 * 4. 批量分析
 */

// ============================================
// 1. 圆环打分组件
// ============================================

const ScoreRing = {
  // 渲染单个圆环
  render(value, label, options = {}) {
    const { size = 44, strokeWidth = 4, showLabel = true } = options;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    
    // 颜色判定
    let colorClass = 'score-ring--excellent';
    let statusIcon = '';
    if (value < 60) {
      colorClass = 'score-ring--poor';
    } else if (value < 80) {
      colorClass = 'score-ring--good';
    } else {
      statusIcon = '✓';
    }
    
    const html = `
      <div class="score-ring ${colorClass}" data-score="${value}" data-label="${label}">
        <div class="score-ring__chart" style="width:${size}px;height:${size}px;">
          <svg class="score-ring__svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <circle class="score-ring__bg"
              cx="${size/2}" cy="${size/2}" r="${radius}"/>
            <circle class="score-ring__fill"
              cx="${size/2}" cy="${size/2}" r="${radius}"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${offset}"/>
          </svg>
          <div class="score-ring__value">
            ${value}
            ${statusIcon ? `<span class="score-ring__excellent-badge">${statusIcon}</span>` : ''}
          </div>
        </div>
        ${showLabel ? `<span class="score-ring__label">${label}</span>` : ''}
      </div>
    `;
    return html;
  },
  
  // 渲染一组圆环
  renderGroup(scores, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const labels = {
      logic: '逻辑',
      motivation: '动机',
      conflict: '冲突',
      twist: '转折',
      rhythm: '节奏'
    };
    
    let html = '';
    for (const [key, value] of Object.entries(scores)) {
      if (labels[key] && typeof value === 'number') {
        html += this.render(value, labels[key]);
      }
    }
    container.innerHTML = html;
  }
};

// ============================================
// 2. 节点AI分析卡片
// ============================================

const NodeAICard = {
  // 渲染节点分析卡片
  render(nodeId, nodeTitle, scores = null, analysis = null, advice = null, summary = null) {
    const hasData = scores !== null;
    const isAnalyzing = scores === 'loading';
    
    // 计算综合分
    let overallScore = null;
    let scoreClass = '';
    if (hasData && scores !== 'loading') {
      const values = Object.values(scores).filter(v => typeof v === 'number');
      overallScore = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
      if (overallScore >= 80) scoreClass = 'excellent';
      else if (overallScore >= 60) scoreClass = 'good';
      else scoreClass = 'poor';
    }
    
    // 优秀提示
    let adviceHtml = '';
    if (hasData && scores !== 'loading' && overallScore >= 80) {
      adviceHtml = `
        <div class="ai-node-card__advice" style="background: rgba(34, 197, 94, 0.1); border-color: var(--score-excellent);">
          <span class="ai-node-card__advice-text">✓ 优秀，继续加油！</span>
        </div>
      `;
    } else if (hasData && scores !== 'loading') {
      // 找出需要建议的维度
      const adviceItems = [];
      for (const [key, value] of Object.entries(scores)) {
        if (value < 80 && advice && advice[key]) {
          const labels = { logic: '逻辑', motivation: '动机', conflict: '冲突', twist: '转折', rhythm: '节奏' };
          adviceItems.push(`<strong>${labels[key]}</strong>：${advice[key]}`);
        }
      }
      if (adviceItems.length > 0) {
        adviceHtml = `
          <div class="ai-node-card__advice">
            <span class="ai-node-card__advice-icon">💡</span>
            <span class="ai-node-card__advice-text">${adviceItems.join('；')}</span>
          </div>
        `;
      }
    }
    
    // 加载状态
    let loadingHtml = '';
    if (isAnalyzing) {
      loadingHtml = `
        <div class="ai-loading">
          <div class="ai-loading__spinner"></div>
          <span>AI分析中...</span>
        </div>
      `;
    }
    
    // 分数区域
    let scoresHtml = '';
    if (hasData && scores !== 'loading') {
      scoresHtml = `
        <div class="ai-node-card__scores">
          <div class="ai-node-card__score-grid" id="node-scores-${nodeId}">
            ${this.renderScoreRings(scores)}
          </div>
          ${overallScore !== null ? `
            <div class="node-overall-score node-overall-score--${scoreClass}">
              <span class="node-overall-score__value">${overallScore}</span>
              <span class="node-overall-score__label">综合</span>
            </div>
          ` : ''}
        </div>
        ${adviceHtml}
      `;
    }
    
    // 详情区域
    let detailHtml = '';
    if (hasData && scores !== 'loading' && analysis) {
      detailHtml = this.renderDetail(analysis, advice, summary);
    }
    
    // 免责
    const disclaimerHtml = `
      <div class="ai-node-card__disclaimer">
        ⚠️ 仅供参考，每个作者有自己的逻辑和风格，不必多管
      </div>
    `;
    
    const html = `
      <div class="ai-node-card" id="ai-card-${nodeId}">
        <div class="ai-node-card__header" onclick="NodeAICard.toggleDetail('${nodeId}')">
          <div class="ai-node-card__title">
            <span>⚡</span>
            <span>AI分析</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            ${hasData && scores !== 'loading' ? `
              <button class="ai-node-card__analyze-btn" onclick="event.stopPropagation(); NodeAICard.reAnalyze('${nodeId}')">
                🔄 重新分析
              </button>
            ` : `
              <button class="ai-node-card__analyze-btn" onclick="event.stopPropagation(); NodeAICard.analyze('${nodeId}')" ${isAnalyzing ? 'disabled' : ''}>
                ${isAnalyzing ? '⏳ 分析中...' : '🔍 开始分析'}
              </button>
            `}
          </div>
        </div>
        ${scoresHtml}
        ${detailHtml}
        ${disclaimerHtml}
      </div>
    `;
    
    return html;
  },
  
  // 渲染分数圆环组
  renderScoreRings(scores) {
    const labels = {
      logic: { name: '逻辑', icon: '📐' },
      motivation: { name: '动机', icon: '🎭' },
      conflict: { name: '冲突', icon: '⚔️' },
      twist: { name: '转折', icon: '🔄' },
      rhythm: { name: '节奏', icon: '📊' }
    };
    
    let html = '';
    for (const [key, value] of Object.entries(scores)) {
      if (labels[key] && typeof value === 'number') {
        html += ScoreRing.render(value, labels[key].name);
      }
    }
    return html;
  },
  
  // 渲染详情区域
  renderDetail(analysis, advice, summary) {
    const labels = {
      logic: { name: '逻辑通顺', icon: '📐' },
      motivation: { name: '人物动机', icon: '🎭' },
      conflict: { name: '冲突强度', icon: '⚔️' },
      twist: { name: '转折程度', icon: '🔄' },
      rhythm: { name: '节奏起伏', icon: '📊' }
    };
    
    let sectionsHtml = '';
    for (const [key, label] of Object.entries(labels)) {
      if (analysis[key]) {
        const score = analysis[key + '_score'] || 80;
        let scoreClass = 'excellent';
        if (score < 60) scoreClass = 'poor';
        else if (score < 80) scoreClass = 'good';
        
        sectionsHtml += `
          <div class="ai-node-card__detail-section">
            <div class="ai-node-card__detail-title">
              ${label.icon} ${label.name}
              <span class="ai-node-card__detail-score ai-node-card__detail-score--${scoreClass}">${score}分</span>
            </div>
            <div class="ai-node-card__detail-text">${analysis[key]}</div>
            ${advice && advice[key] ? `
              <div class="ai-node-card__detail-advice">💡 ${advice[key]}</div>
            ` : ''}
          </div>
        `;
      }
    }
    
    let summaryHtml = '';
    if (summary) {
      summaryHtml = `
        <div class="ai-node-card__summary">
          <div class="ai-node-card__summary-title">💬 综合评语</div>
          <div class="ai-node-card__summary-text">${summary}</div>
        </div>
      `;
    }
    
    return `
      <div class="ai-node-card__detail" id="node-detail-${key}">
        ${sectionsHtml}
        ${summaryHtml}
      </div>
    `;
  },
  
  // 切换详情显示
  toggleDetail(nodeId) {
    const detail = document.getElementById(`node-detail-${nodeId}`);
    if (detail) {
      detail.classList.toggle('ai-node-card__detail--open');
    }
  },
  
  // 分析单个节点
  async analyze(nodeId) {
    const card = document.getElementById(`ai-card-${nodeId}`);
    if (!card) return;
    
    // 显示加载状态
    card.innerHTML = this.render(nodeId, '', 'loading');
    
    try {
      const response = await fetch('/api/ai/analyze-node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 保存到节点数据
        if (window.state && window.state.currentBook) {
          const node = window.state.currentBook.events.find(e => e.id === nodeId);
          if (node) {
            node.aiScores = data.scores;
            node.aiAnalysis = data.analysis;
            node.aiAdvice = data.advice;
            node.aiSummary = data.summary;
          }
        }
        
        // 重新渲染
        card.innerHTML = this.render(nodeId, '', data.scores, data.analysis, data.advice, data.summary);
      } else {
        card.innerHTML = this.render(nodeId, '', null, null, null, null);
        alert('分析失败：' + (data.error || '未知错误'));
      }
    } catch (err) {
      console.error('AI分析失败:', err);
      card.innerHTML = this.render(nodeId, '', null, null, null, null);
      alert('分析失败，请稍后重试');
    }
  },
  
  // 重新分析
  reAnalyze(nodeId) {
    this.analyze(nodeId);
  }
};

// ============================================
// 3. 人物饱满度分析
// ============================================

const CharacterAICard = {
  // 渲染人物分析卡片
  render(characterId, characterName, scores = null, analysis = null) {
    const hasData = scores !== null && scores !== 'loading';
    const isLoading = scores === 'loading';
    
    // 维度配置
    const dimensions = [
      { key: 'depth', name: '人物深度', icon: '📖' },
      { key: 'motivation', name: '动机清晰', icon: '🎯' },
      { key: 'consistency', name: '行为一致', icon: '🔄' },
      { key: 'development', name: '成长弧线', icon: '📈' },
      { key: 'dialogue', name: '对话自然', icon: '💬' },
      { key: 'uniqueness', name: '独特性', icon: '✨' }
    ];
    
    // 分数显示
    let scoresHtml = '';
    if (hasData) {
      scoresHtml = `
        <div class="ai-character-card__dimensions">
          ${dimensions.map(d => {
            const value = scores[d.key] || 0;
            let fillColor = 'var(--score-excellent)';
            if (value < 60) fillColor = 'var(--score-poor)';
            else if (value < 80) fillColor = 'var(--score-good)';
            
            return `
              <div class="ai-character-card__dimension">
                <div class="ai-character-card__dimension-label">
                  ${d.icon} ${d.name}: ${value}分
                </div>
                <div class="ai-character-card__dimension-bar">
                  <div class="ai-character-card__dimension-fill" style="width:${value}%;background:${fillColor};"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
    
    // 详情
    let detailHtml = '';
    if (hasData && analysis) {
      detailHtml = this.renderDetail(analysis);
    }
    
    // 加载
    let loadingHtml = '';
    if (isLoading) {
      loadingHtml = '<div class="ai-loading"><div class="ai-loading__spinner"></div><span>分析中...</span></div>';
    }
    
    return `
      <div class="ai-character-card" id="char-card-${characterId}">
        <div class="ai-character-card__header">
          <span class="ai-character-card__name">${characterName}</span>
          ${hasData ? `
            <button class="ai-node-card__analyze-btn" onclick="CharacterAICard.analyze('${characterId}')">
              🔄 重新分析
            </button>
          ` : `
            <button class="ai-node-card__analyze-btn" onclick="CharacterAICard.analyze('${characterId}')" ${isLoading ? 'disabled' : ''}>
              ${isLoading ? '⏳ 分析中...' : '🔍 分析人物'}
            </button>
          `}
        </div>
        ${loadingHtml}
        ${scoresHtml}
        ${detailHtml}
      </div>
    `;
  },
  
  // 渲染详情
  renderDetail(analysis) {
    const sections = [
      { key: 'overall', name: '综合评价', icon: '📝' },
      { key: 'strengths', name: '人物亮点', icon: '✨' },
      { key: 'weaknesses', name: '改进建议', icon: '🔧' },
      { key: 'suggestions', name: '发展建议', icon: '📈' }
    ];
    
    let html = `<div class="ai-character-card__detail ai-character-card__detail--open">`;
    for (const s of sections) {
      if (analysis[s.key]) {
        html += `
          <div class="ai-character-card__analysis-item">
            <div class="ai-character-card__analysis-label">${s.icon} ${s.name}</div>
            <div class="ai-character-card__analysis-text">${analysis[s.key]}</div>
          </div>
        `;
      }
    }
    html += '</div>';
    return html;
  },
  
  // 分析人物
  async analyze(characterId) {
    const card = document.getElementById(`char-card-${characterId}`);
    if (!card) return;
    
    card.innerHTML = this.render(characterId, '', 'loading');
    
    try {
      const response = await fetch('/api/ai/analyze-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 保存到角色数据
        if (window.state && window.state.currentBook) {
          const char = window.state.currentBook.roles.find(r => r.id === characterId);
          if (char) {
            char.aiScores = data.scores;
            char.aiAnalysis = data.analysis;
          }
        }
        
        card.innerHTML = this.render(characterId, '', data.scores, data.analysis);
      } else {
        alert('分析失败：' + (data.error || '未知错误'));
      }
    } catch (err) {
      console.error('人物分析失败:', err);
      alert('分析失败，请稍后重试');
    }
  }
};

// ============================================
// 4. 批量分析
// ============================================

const BatchAnalyze = {
  // 批量分析所有节点
  async analyzeAllNodes() {
    if (!window.state || !window.state.currentBook) {
      alert('请先打开一本书');
      return;
    }
    
    const events = window.state.currentBook.events || [];
    if (events.length === 0) {
      alert('没有可分析的节点');
      return;
    }
    
    // 确认
    if (!confirm(`即将分析 ${events.length} 个节点，继续？`)) {
      return;
    }
    
    // 显示进度
    const progressBar = document.createElement('div');
    progressBar.className = 'batch-analyze-bar';
    progressBar.innerHTML = `
      <span class="batch-analyze-bar__info">正在分析... 0/${events.length}</span>
      <div class="batch-analyze-bar__actions">
        <button onclick="BatchAnalyze.cancel()">取消</button>
      </div>
    `;
    
    const eventList = document.getElementById('event-list');
    if (eventList) {
      eventList.parentNode.insertBefore(progressBar, eventList);
    }
    
    BatchAnalyze.cancelled = false;
    let completed = 0;
    
    for (const event of events) {
      if (BatchAnalyze.cancelled) break;
      
      // 如果已有AI分数，跳过
      if (event.aiScores) {
        completed++;
        continue;
      }
      
      try {
        const response = await fetch('/api/ai/analyze-node', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nodeId: event.id })
        });
        
        const data = await response.json();
        if (data.success) {
          event.aiScores = data.scores;
          event.aiAnalysis = data.analysis;
          event.aiAdvice = data.advice;
          event.aiSummary = data.summary;
        }
      } catch (err) {
        console.error(`节点 ${event.id} 分析失败:`, err);
      }
      
      completed++;
      progressBar.querySelector('.batch-analyze-bar__info').textContent = 
        `正在分析... ${completed}/${events.length}`;
    }
    
    // 移除进度条
    progressBar.remove();
    
    // 重新渲染事件列表
    if (typeof renderEventTab === 'function') {
      renderEventTab();
    }
    
    alert(`批量分析完成！已分析 ${completed} 个节点`);
  },
  
  // 批量分析所有人物
  async analyzeAllCharacters() {
    if (!window.state || !window.state.currentBook) {
      alert('请先打开一本书');
      return;
    }
    
    const roles = window.state.currentBook.roles || [];
    if (roles.length === 0) {
      alert('没有可分析的人物');
      return;
    }
    
    if (!confirm(`即将分析 ${roles.length} 个人物，继续？`)) {
      return;
    }
    
    let completed = 0;
    for (const role of roles) {
      if (role.aiScores) continue;
      
      try {
        const response = await fetch('/api/ai/analyze-character', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ characterId: role.id })
        });
        
        const data = await response.json();
        if (data.success) {
          role.aiScores = data.scores;
          role.aiAnalysis = data.analysis;
        }
      } catch (err) {
        console.error(`人物 ${role.id} 分析失败:`, err);
      }
      
      completed++;
    }
    
    alert(`批量分析完成！已分析 ${completed} 个人物`);
  },
  
  cancel() {
    BatchAnalyze.cancelled = true;
  }
};

// ============================================
// 导出到全局
// ============================================

window.ScoreRing = ScoreRing;
window.NodeAICard = NodeAICard;
window.CharacterAICard = CharacterAICard;
window.BatchAnalyze = BatchAnalyze;
