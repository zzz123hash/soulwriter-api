/**
 * AnalysisSystem - 深度分析系统
 */
const AnalysisSystem = {
  apiBase: '/api/v1/analysis',
  types: ['character', 'plot', 'world', 'style'],
  init() {
    console.log('AnalysisSystem initialized');
    this.bindEvents();
  },
  bindEvents() {
    document.querySelectorAll('.analysis-card').forEach(card => {
      card.addEventListener('click', () => {
        const type = card.dataset.type;
        if (type) this.analyze(type);
      });
    });
  },
  async analyze(type) {
    if (!this.types.includes(type)) return;
    const typeNames = {character: '角色分析', plot: '情节分析', world: '世界观分析', style: '风格分析'};
    console.log('开始' + typeNames[type] + '...');
    this.showLoading(type);
    try {
      const response = await fetch(this.apiBase + '/' + type, {method: 'GET', headers: {'Content-Type': 'application/json'}});
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();
      this.showResult(type, data);
    } catch (error) {
      console.error('Analysis error:', error);
      this.showError(type, error.message);
    }
  },
  showLoading(type) {
    const card = document.querySelector('.analysis-card[data-type= + type + ]');
    if (!card) return;
    const resultDiv = card.querySelector('.analysis-result');
    if (resultDiv) { resultDiv.innerHTML = '<div class=loading>分析中...</div>'; resultDiv.style.display = 'block'; }
  },
  showResult(type, data) {
    const card = document.querySelector('.analysis-card[data-type= + type + ]');
    if (!card) return;
    const resultDiv = card.querySelector('.analysis-result');
    if (resultDiv) { resultDiv.innerHTML = '<div class=result-content>' + (data.content || data.result || JSON.stringify(data, null, 2)) + '</div>'; resultDiv.style.display = 'block'; }
  },
  showError(type, message) {
    const card = document.querySelector('.analysis-card[data-type= + type + ]');
    if (!card) return;
    const resultDiv = card.querySelector('.analysis-result');
    if (resultDiv) { resultDiv.innerHTML = '<div class=error>分析失败: ' + message + '</div>'; resultDiv.style.display = 'block'; }
  }
};
window.AnalysisSystem = AnalysisSystem;
document.addEventListener('DOMContentLoaded', () => { setTimeout(() => AnalysisSystem.init(), 800); });
