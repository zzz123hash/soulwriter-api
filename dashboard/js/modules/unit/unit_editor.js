/**
 * SoulWriter - 单元编辑系统 (完整版)
 * 
 * 功能：
 * 1. 单元列表管理 - CRUD
 * 2. 片段管理 - 时间线编辑
 * 3. 角色评分系统 - 素材/对话/冲突
 * 4. 视角转写 - 第一/第三人称/同人文
 * 5. 小说生成 - AI生成完整章节
 * 6. 文化适配 - 保留异域元素
 */

(function() {
  'use strict';

  // ============ 状态 ============
  const state = {
    currentUnit: null,
    units: [],
    bookId: null,
    roles: [],
    loading: false
  };

  // ============ API 封装 ============
  const API = {
    base: '/api/v1',
    
    async listUnits(bookId) {
      const res = await fetch(`${this.base}/unit/list/${bookId}`);
      return res.json();
    },
    
    async createUnit(bookId, data) {
      const res = await fetch(`${this.base}/unit/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, ...data })
      });
      return res.json();
    },
    
    async getUnit(unitId) {
      const res = await fetch(`${this.base}/unit/${unitId}`);
      return res.json();
    },
    
    async updateUnit(unitId, data) {
      const res = await fetch(`${this.base}/unit/${unitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    
    async deleteUnit(unitId) {
      const res = await fetch(`${this.base}/unit/${unitId}`, {
        method: 'DELETE'
      });
      return res.json();
    },
    
    async addFragment(unitId, fragment) {
      const res = await fetch(`${this.base}/unit/${unitId}/fragment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fragment)
      });
      return res.json();
    },
    
    async updateFragment(fragmentId, data) {
      const res = await fetch(`${this.base}/fragment/${fragmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    
    async deleteFragment(fragmentId) {
      const res = await fetch(`${this.base}/fragment/${fragmentId}`, {
        method: 'DELETE'
      });
      return res.json();
    },
    
    async getScores(unitId) {
      const res = await fetch(`${this.base}/unit/${unitId}/scores`);
      return res.json();
    },
    
    async rewrite(unitId, targetRoleId, perspectiveType) {
      const res = await fetch(`${this.base}/unit/${unitId}/rewrite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRoleId, perspectiveType })
      });
      return res.json();
    },
    
    async generate(unitId, settings) {
      const res = await fetch(`${this.base}/unit/${unitId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      return res.json();
    },
    
    async clone(unitId) {
      const res = await fetch(`${this.base}/unit/${unitId}/clone`, {
        method: 'POST'
      });
      return res.json();
    }
  };

  // ============ 主模块 ============
  const UnitEditor = {
    name: 'UnitEditor',
    version: '1.0.0',
    
    // 初始化
    init(bookId) {
      console.log('[UnitEditor] init', bookId);
      state.bookId = bookId;
      this.loadRoles();
      this.loadUnits();
    },
    
    // 加载角色列表
    async loadRoles() {
      // 从全局state获取角色
      if (window.AppState && window.AppState.currentBook && window.AppState.currentBook.roles) {
        state.roles = window.AppState.currentBook.roles;
      } else {
        state.roles = [];
      }
    },
    
    // 加载单元列表
    async loadUnits() {
      if (!state.bookId) return;
      
      state.loading = true;
      this.render();
      
      try {
        const res = await API.listUnits(state.bookId);
        if (res.success) {
          state.units = res.data || [];
        }
      } catch (e) {
        console.error('[UnitEditor] loadUnits error', e);
        state.units = [];
      }
      
      state.loading = false;
      this.render();
    },
    
    // ============ 渲染 ============
    render() {
      const container = document.getElementById('unit-editor-container');
      if (!container) return;
      
      if (state.loading) {
        container.innerHTML = '<div class="unit-loading">加载中...</div>';
        return;
      }
      
      if (state.currentUnit) {
        this.renderDetail();
      } else {
        this.renderList();
      }
    },
    
    renderList() {
      const container = document.getElementById('unit-editor-container');
      if (!container) return;
      
      let html = '<div class="unit-editor-body">';
      
      // 左侧列表
      html += '<div class="unit-list-sidebar">' +
        '<div class="unit-list-header">' +
          '<h3>章节列表</h3>' +
          '<button class="btn btn-sm btn-primary" onclick="UnitEditor.createUnit()">+ 新建</button>' +
        '</div>' +
        '<div class="unit-list" id="unit-list">' +
          this.renderUnitList() +
        '</div>' +
      '</div>';
      
      // 右侧空状态
      html += '<div class="unit-detail-main">' +
        '<div class="unit-empty">' +
          '<div class="unit-empty-icon">📚</div>' +
          '<div class="unit-empty-text">请选择一个章节<br>或创建新章节</div>' +
        '</div>' +
      '</div>';
      
      html += '</div>';
      
      container.innerHTML = html;
    },
    
    renderUnitList() {
      if (!state.units.length) {
        return '<div class="unit-empty"><div class="unit-empty-text">暂无章节</div></div>';
      }
      
      let html = '';
      for (const unit of state.units) {
        const scoreClass = this.getScoreClass(unit.perspectiveScore);
        html += '<div class="unit-item" onclick="UnitEditor.openUnit(\'' + unit.id + '\')">' +
          '<div class="unit-item-title">' + this.escapeHtml(unit.title) + '</div>' +
          '<div class="unit-item-meta">' +
            '<span>片段: ' + (unit.fragments ? unit.fragments.length : 0) + '</span>' +
            '<span class="perspective-score ' + scoreClass + '">' +
              (unit.perspective || '未选') + '(' + (unit.perspectiveScore || 0) + '分)' +
            '</span>' +
          '</div>' +
        '</div>';
      }
      return html;
    },
    
    renderDetail() {
      const container = document.getElementById('unit-editor-container');
      if (!container || !state.currentUnit) return;
      
      const unit = state.currentUnit;
      
      let html = '<div class="unit-editor-body">';
      
      // 左侧列表（可折叠）
      html += '<div class="unit-list-sidebar">' +
        '<div class="unit-list-header">' +
          '<h3>章节列表</h3>' +
          '<button class="btn btn-sm btn-primary" onclick="UnitEditor.createUnit()">+ 新建</button>' +
        '</div>' +
        '<div class="unit-list" id="unit-list">' +
          this.renderUnitList() +
        '</div>' +
      '</div>';
      
      // 右侧详情
      html += '<div class="unit-detail-main">';
      
      // 头部
      html += '<div class="unit-detail-header">' +
        '<input type="text" class="unit-title-input" value="' + this.escapeHtml(unit.title) + '" ' +
               'onchange="UnitEditor.updateTitle(this.value)">' +
        '<button class="btn btn-sm btn-secondary" onclick="UnitEditor.closeUnit()">返回</button>' +
      '</div>';
      
      // 设置面板
      html += '<div class="unit-settings-panel">';
      
      // 视角角色选择
      html += '<div class="setting-section">' +
        '<h4>视角设置</h4>' +
        '<div class="setting-row">' +
          '<label>视角角色</label>' +
          '<select id="unit-perspective-select" onchange="UnitEditor.setPerspective(this.value)">' +
            '<option value="">-- 请选择 --</option>' +
            this.renderRoleOptions() +
          '</select>' +
          '<span class="score-badge ' + this.getScoreClass(unit.perspectiveScore) + '">' +
            (unit.perspectiveScore || 0) + '分' +
          '</span>' +
        '</div>' +
      '</div>';
      
      // 比例设置
      html += '<div class="setting-section">' +
        '<h4>内容比例</h4>' +
        '<div class="setting-row">' +
          '<label>对话比例</label>' +
          '<input type="range" min="0" max="100" value="' + (unit.settings ? unit.settings.dialogueRatio : 30) + '" ' +
                 'onchange="UnitEditor.updateSetting(\'dialogueRatio\', this.value)">' +
          '<span>' + (unit.settings ? unit.settings.dialogueRatio : 30) + '%</span>' +
        '</div>' +
        '<div class="setting-row">' +
          '<label>风景比例</label>' +
          '<input type="range" min="0" max="100" value="' + (unit.settings ? unit.settings.sceneryRatio : 20) + '" ' +
                 'onchange="UnitEditor.updateSetting(\'sceneryRatio\', this.value)">' +
          '<span>' + (unit.settings ? unit.settings.sceneryRatio : 20) + '%</span>' +
        '</div>' +
        '<div class="setting-row">' +
          '<label>情感比例</label>' +
          '<input type="range" min="0" max="100" value="' + (unit.settings ? unit.settings.emotionRatio : 50) + '" ' +
                 'onchange="UnitEditor.updateSetting(\'emotionRatio\', this.value)">' +
          '<span>' + (unit.settings ? unit.settings.emotionRatio : 50) + '%</span>' +
        '</div>' +
      '</div>';
      
      html += '</div>';
      
      // 时间线
      html += '<div class="fragment-timeline">' +
        '<h4>片段时间线</h4>' +
        '<div class="timeline-list" id="timeline-list">' +
          this.renderTimeline() +
        '</div>' +
        '<button class="btn btn-outline" style="margin-top:16px;width:100%" onclick="UnitEditor.addFragment()">' +
          '+ 添加片段' +
        '</button>' +
      '</div>';
      
      // 操作按钮
      html += '<div class="unit-actions">' +
        '<button class="btn btn-primary" onclick="UnitEditor.showGenerate()">📝 生成小说</button>' +
        '<button class="btn btn-secondary" onclick="UnitEditor.showRewrite()">🔄 视角转写</button>' +
        '<button class="btn btn-secondary" onclick="UnitEditor.cloneUnit()">📋 复制章节</button>' +
        '<button class="btn btn-secondary" onclick="UnitEditor.deleteUnit()">🗑️ 删除</button>' +
      '</div>';
      
      html += '</div></div>'; // end detail-main, end body
      
      container.innerHTML = html;
      
      // 设置当前选中
      if (unit.perspective) {
        const select = document.getElementById('unit-perspective-select');
        if (select) select.value = unit.perspective;
      }
    },
    
    renderRoleOptions() {
      if (!state.roles.length) {
        return '<option disabled>暂无角色</option>';
      }
      let html = '';
      for (const role of state.roles) {
        const name = role.title || role.name || role;
        html += '<option value="' + this.escapeHtml(name) + '">' + this.escapeHtml(name) + '</option>';
      }
      return html;
    },
    
    renderTimeline() {
      const fragments = state.currentUnit.fragments || [];
      
      if (!fragments.length) {
        return '<div class="timeline-empty">暂无片段<br>点击上方按钮添加</div>';
      }
      
      let html = '';
      for (let i = 0; i < fragments.length; i++) {
        const f = fragments[i];
        html += '<div class="timeline-item" data-id="' + f.id + '">' +
          '<div class="timeline-marker">' + (i + 1) + '</div>' +
          '<div class="timeline-content">' +
            '<div class="fragment-time">' + this.escapeHtml(f.time || '时间待定') + '</div>' +
            '<div class="fragment-place">' + this.escapeHtml(f.place || '地点待定') + '</div>' +
            '<div class="fragment-chars">角色: ' + this.escapeHtml((f.characters || []).join(', ') || '无') + '</div>' +
            '<div class="fragment-preview">' + this.escapeHtml((f.content || '').substring(0, 80)) + '</div>' +
          '</div>' +
          '<div class="timeline-actions">' +
            '<button onclick="UnitEditor.editFragment(\'' + f.id + '\')">编辑</button>' +
            '<button onclick="UnitEditor.deleteFragment(\'' + f.id + '\')">删除</button>' +
          '</div>' +
        '</div>';
      }
      return html;
    },
    
    getScoreClass(score) {
      if (!score) return 'score-low';
      if (score > 80) return 'score-high';
      if (score > 50) return 'score-mid';
      return 'score-low';
    },
    
    escapeHtml(str) {
      if (!str) return '';
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    },
    
    // ============ 单元操作 ============
    async createUnit() {
      const title = prompt('请输入章节标题：', '第' + (state.units.length + 1) + '章');
      if (!title) return;
      
      try {
        const res = await API.createUnit(state.bookId, { title });
        if (res.success) {
          state.units.push(res.data);
          this.openUnit(res.data.id);
        }
      } catch (e) {
        console.error('[UnitEditor] createUnit error', e);
        alert('创建失败');
      }
    },
    
    async openUnit(unitId) {
      try {
        const res = await API.getUnit(unitId);
        if (res.success) {
          state.currentUnit = res.data;
          this.render();
        }
      } catch (e) {
        console.error('[UnitEditor] openUnit error', e);
      }
    },
    
    closeUnit() {
      state.currentUnit = null;
      this.loadUnits();
    },
    
    async updateTitle(title) {
      if (!state.currentUnit) return;
      state.currentUnit.title = title;
      await API.updateUnit(state.currentUnit.id, { title });
    },
    
    async setPerspective(roleId) {
      if (!state.currentUnit) return;
      
      try {
        const res = await API.updateUnit(state.currentUnit.id, { perspective: roleId });
        if (res.success) {
          state.currentUnit.perspective = roleId;
          // 重新计算评分
          const scoreRes = await API.getScores(state.currentUnit.id);
          if (scoreRes.success) {
            const roleScore = scoreRes.data.find(s => s.roleId === roleId);
            if (roleScore) {
              state.currentUnit.perspectiveScore = roleScore.total;
            }
          }
          this.render();
        }
      } catch (e) {
        console.error('[UnitEditor] setPerspective error', e);
      }
    },
    
    async updateSetting(key, value) {
      if (!state.currentUnit) return;
      
      state.currentUnit.settings = state.currentUnit.settings || {};
      state.currentUnit.settings[key] = parseInt(value);
      
      await API.updateUnit(state.currentUnit.id, { settings: state.currentUnit.settings });
    },
    
    async deleteUnit() {
      if (!state.currentUnit) return;
      if (!confirm('确定删除章节 "' + state.currentUnit.title + '"？此操作不可恢复！')) return;
      
      try {
        await API.deleteUnit(state.currentUnit.id);
        state.units = state.units.filter(u => u.id !== state.currentUnit.id);
        state.currentUnit = null;
        this.render();
      } catch (e) {
        console.error('[UnitEditor] deleteUnit error', e);
        alert('删除失败');
      }
    },
    
    async cloneUnit() {
      if (!state.currentUnit) return;
      
      try {
        const res = await API.clone(state.currentUnit.id);
        if (res.success) {
          state.units.push(res.data);
          alert('复制成功！');
          this.render();
        }
      } catch (e) {
        console.error('[UnitEditor] cloneUnit error', e);
        alert('复制失败');
      }
    },
    
    // ============ 片段操作 ============
    async addFragment() {
      if (!state.currentUnit) return;
      
      const fragment = {
        time: '',
        place: '',
        characters: [],
        content: '',
        emotion: ''
      };
      
      try {
        const res = await API.addFragment(state.currentUnit.id, fragment);
        if (res.success) {
          state.currentUnit.fragments = state.currentUnit.fragments || [];
          state.currentUnit.fragments.push(res.data);
          this.render();
          this.editFragment(res.data.id);
        }
      } catch (e) {
        console.error('[UnitEditor] addFragment error', e);
      }
    },
    
    editFragment(fragmentId) {
      const fragment = (state.currentUnit.fragments || []).find(f => f.id === fragmentId);
      if (!fragment) return;
      
      const modal = document.createElement('div');
      modal.className = 'fragment-modal';
      modal.id = 'fragment-edit-modal';
      modal.innerHTML = this.getFragmentModalHtml(fragment);
      document.body.appendChild(modal);
    },
    
    getFragmentModalHtml(fragment) {
      const charsStr = (fragment.characters || []).join(', ');
      
      return '<div class="fragment-modal-backdrop" onclick="UnitEditor.closeFragmentModal()"></div>' +
        '<div class="fragment-modal-box">' +
          '<div class="fragment-modal-header">' +
            '<h3>编辑片段</h3>' +
            '<button onclick="UnitEditor.closeFragmentModal()">×</button>' +
          '</div>' +
          '<div class="fragment-modal-body">' +
            '<div class="form-group">' +
              '<label>时间</label>' +
              '<input type="text" id="frag-time" value="' + this.escapeHtml(fragment.time || '') + '" ' +
                     'placeholder="如：子时三刻、夜幕降临">' +
            '</div>' +
            '<div class="form-group">' +
              '<label>地点</label>' +
              '<input type="text" id="frag-place" value="' + this.escapeHtml(fragment.place || '') + '" ' +
                     'placeholder="如：野猪林、客栈大厅">' +
            '</div>' +
            '<div class="form-group">' +
              '<label>出场角色</label>' +
              '<input type="text" id="frag-chars" value="' + this.escapeHtml(charsStr) + '" ' +
                     'placeholder="逗号分隔，如：林冲,薛霸">' +
            '</div>' +
            '<div class="form-group">' +
              '<label>内容</label>' +
              '<textarea id="frag-content" rows="6" placeholder="输入场景内容...">' +
                this.escapeHtml(fragment.content || '') + '</textarea>' +
            '</div>' +
            '<div class="form-group">' +
              '<label>情绪/氛围</label>' +
              '<input type="text" id="frag-emotion" value="' + this.escapeHtml(fragment.emotion || '') + '" ' +
                     'placeholder="如：紧张、危机、温馨">' +
            '</div>' +
          '</div>' +
          '<div class="fragment-modal-footer">' +
            '<button class="btn btn-secondary" onclick="UnitEditor.closeFragmentModal()">取消</button>' +
            '<button class="btn btn-primary" onclick="UnitEditor.saveFragment(\'' + fragment.id + '\')">保存</button>' +
          '</div>' +
        '</div>';
    },
    
    closeFragmentModal() {
      const modal = document.getElementById('fragment-edit-modal');
      if (modal) modal.remove();
    },
    
    async saveFragment(fragmentId) {
      const fragment = (state.currentUnit.fragments || []).find(f => f.id === fragmentId);
      if (!fragment) return;
      
      const time = document.getElementById('frag-time').value;
      const place = document.getElementById('frag-place').value;
      const charsStr = document.getElementById('frag-chars').value;
      const content = document.getElementById('frag-content').value;
      const emotion = document.getElementById('frag-emotion').value;
      
      const characters = charsStr.split(',').map(s => s.trim()).filter(s => s);
      
      try {
        const res = await API.updateFragment(fragmentId, {
          time, place, characters, content, emotion
        });
        
        if (res.success) {
          fragment.time = time;
          fragment.place = place;
          fragment.characters = characters;
          fragment.content = content;
          fragment.emotion = emotion;
          this.closeFragmentModal();
          this.render();
        }
      } catch (e) {
        console.error('[UnitEditor] saveFragment error', e);
        alert('保存失败');
      }
    },
    
    async deleteFragment(fragmentId) {
      if (!confirm('确定删除该片段？')) return;
      
      try {
        await API.deleteFragment(fragmentId);
        state.currentUnit.fragments = (state.currentUnit.fragments || [])
          .filter(f => f.id !== fragmentId);
        this.render();
      } catch (e) {
        console.error('[UnitEditor] deleteFragment error', e);
        alert('删除失败');
      }
    },
    
    // ============ 视角转写 ============
    async showRewrite() {
      if (!state.currentUnit) return;
      
      try {
        const res = await API.getScores(state.currentUnit.id);
        if (!res.success || !res.data.length) {
          alert('暂无评分数据，请先添加片段');
          return;
        }
        
        let html = '<div class="rewrite-panel">' +
          '<h3>视角转写 - 选择目标视角</h3>' +
          '<div class="role-score-list">';
        
        for (const score of res.data) {
          const typeLabel = score.total > 80 ? '第一人称' :
                           score.total > 50 ? '第三人称' : '同人文';
          const typeClass = score.total > 80 ? 'first-person' :
                           score.total > 50 ? 'third-person' : 'side-story';
          
          html += '<div class="role-score-item ' + typeClass + '">' +
            '<span class="role-name">' + this.escapeHtml(score.roleId) + '</span>' +
            '<span class="role-score">' + score.total + '分</span>' +
            '<span class="rewrite-type">' + typeLabel + '</span>' +
            '<button class="btn btn-sm" onclick="UnitEditor.doRewrite(\'' + score.roleId + '\', \'' + typeClass + '\')">转写</button>' +
          '</div>';
        }
        
        html += '</div></div>';
        
        // 显示在面板
        const timeline = document.getElementById('timeline-list');
        if (timeline) {
          timeline.innerHTML = html + timeline.innerHTML;
        }
        
      } catch (e) {
        console.error('[UnitEditor] showRewrite error', e);
      }
    },
    
    async doRewrite(roleId, perspectiveType) {
      if (!confirm('确定以 [' + roleId + '] 的视角进行转写？')) return;
      
      try {
        const res = await API.rewrite(state.currentUnit.id, roleId, perspectiveType);
        if (res.success) {
          alert('转写成功！已创建新章节。');
          this.loadUnits();
        } else {
          alert(res.message || '转写失败');
        }
      } catch (e) {
        console.error('[UnitEditor] doRewrite error', e);
        alert('转写失败');
      }
    },
    
    // ============ 小说生成 ============
    async showGenerate() {
      if (!state.currentUnit) return;
      
      const wordCount = (state.currentUnit.fragments || []).reduce((acc, f) => {
        return acc + (f.content ? f.content.length : 0);
      }, 0);
      
      alert('生成小说功能\n\n' +
        '章节: ' + state.currentUnit.title + '\n' +
        '片段数: ' + (state.currentUnit.fragments || []).length + '\n' +
        '预估字数: ' + wordCount + '\n\n' +
        'AI生成功能即将上线...');
    }
  };

  // ============ 暴露到全局 ============
  window.UnitEditor = UnitEditor;
  
  // 初始化时自动加载
  document.addEventListener('DOMContentLoaded', function() {
    console.log('[UnitEditor] loaded');
  });

})();
