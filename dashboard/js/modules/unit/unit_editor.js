/**
 * SoulWriter - 单元编辑系统 (Unit Editor)
 * 
 * 功能：
 * 1. 单元列表管理
 * 2. 片段(Fragment)管理
 * 3. 时间线可视化
 * 4. 角色评分系统
 * 5. 视角转写
 */

const UnitEditor = {
  currentUnit: null,
  units: [],
  
  init() {
    console.log('[UnitEditor] initialized');
    this.load();
    this.bindEvents();
  },
  
  // ============ 渲染 ============
  renderUnitList() {
    return '<div class="unit-editor">' +
      '<div class="unit-list-header">' +
        '<h3>章节单元</h3>' +
        '<button class="btn btn-primary" onclick="UnitEditor.createUnit()">+ 新建单元</button>' +
      '</div>' +
      '<div class="unit-list" id="unit-list">' +
        this.units.map(u => this.renderUnitItem(u)).join('') +
      '</div>' +
    '</div>';
  },
  
  renderUnitItem(unit) {
    var scoreClass = unit.perspectiveScore > 80 ? 'score-high' : 
                   unit.perspectiveScore > 50 ? 'score-mid' : 'score-low';
    return '<div class="unit-item" onclick="UnitEditor.openUnit(\'' + unit.id + '\')">' +
      '<div class="unit-title">' + unit.title + '</div>' +
      '<div class="unit-meta">' +
        '<span>片段: ' + (unit.fragments ? unit.fragments.length : 0) + '</span>' +
        '<span class="perspective-score ' + scoreClass + '">' +
          '视角: ' + (unit.perspective || '未设置') + '(' + (unit.perspectiveScore || 0) + '分)' +
        '</span>' +
      '</div>' +
    '</div>';
  },
  
  renderUnitDetail(unit) {
    if (!unit) return '<div class="unit-empty">请选择一个单元</div>';
    
    return '<div class="unit-detail">' +
      '<div class="unit-detail-header">' +
        '<input type="text" class="unit-title-input" ' +
               'value="' + unit.title + '" ' +
               'onchange="UnitEditor.updateUnitTitle(\'' + unit.id + '\', this.value)">' +
        '<button class="btn btn-sm" onclick="UnitEditor.closeUnit()">关闭</button>' +
      '</div>' +
      
      '<div class="unit-settings">' +
        '<div class="setting-row">' +
          '<label>视角角色：</label>' +
          '<select onchange="UnitEditor.setPerspective(\'' + unit.id + '\', this.value)">' +
            this.renderPerspectiveOptions(unit) +
          '</select>' +
          '<span class="score-badge ' + this.getScoreClass(unit.perspectiveScore) + '">' +
            (unit.perspectiveScore || 0) + '分' +
          '</span>' +
        '</div>' +
        
        '<div class="setting-row">' +
          '<label>对话比例：</label>' +
          '<input type="range" min="0" max="100" ' +
                 'value="' + (unit.settings ? unit.settings.dialogueRatio : 30) + '" ' +
                 'onchange="UnitEditor.updateSetting(\'' + unit.id + '\', \'dialogueRatio\', this.value)">' +
          '<span>' + (unit.settings ? unit.settings.dialogueRatio : 30) + '%</span>' +
        '</div>' +
        
        '<div class="setting-row">' +
          '<label>风景比例：</label>' +
          '<input type="range" min="0" max="100" ' +
                 'value="' + (unit.settings ? unit.settings.sceneryRatio : 20) + '" ' +
                 'onchange="UnitEditor.updateSetting(\'' + unit.id + '\', \'sceneryRatio\', this.value)">' +
          '<span>' + (unit.settings ? unit.settings.sceneryRatio : 20) + '%</span>' +
        '</div>' +
        
        '<div class="setting-row">' +
          '<label>情感比例：</label>' +
          '<input type="range" min="0" max="100" ' +
                 'value="' + (unit.settings ? unit.settings.emotionRatio : 50) + '" ' +
                 'onchange="UnitEditor.updateSetting(\'' + unit.id + '\', \'emotionRatio\', this.value)">' +
          '<span>' + (unit.settings ? unit.settings.emotionRatio : 50) + '%</span>' +
        '</div>' +
      '</div>' +
      
      '<div class="fragment-timeline">' +
        '<h4>时间线</h4>' +
        '<div class="timeline-list" id="fragment-timeline">' +
          this.renderTimeline(unit.fragments || []) +
        '</div>' +
        '<button class="btn btn-outline" onclick="UnitEditor.addFragment(\'' + unit.id + '\')">' +
          '+ 添加片段' +
        '</button>' +
      '</div>' +
      
      '<div class="unit-actions">' +
        '<button class="btn btn-primary" onclick="UnitEditor.generateNovel(\'' + unit.id + '\')">' +
          '生成小说' +
        '</button>' +
        '<button class="btn btn-secondary" onclick="UnitEditor.rewritePerspective(\'' + unit.id + '\')">' +
          '视角转写' +
        '</button>' +
      '</div>' +
    '</div>';
  },
  
  renderTimeline(fragments) {
    if (!fragments.length) {
      return '<div class="timeline-empty">暂无片段，请添加</div>';
    }
    var html = '';
    for (var i = 0; i < fragments.length; i++) {
      var f = fragments[i];
      html += '<div class="timeline-item" data-fragment-id="' + f.id + '">' +
        '<div class="timeline-marker">' + (i + 1) + '</div>' +
        '<div class="timeline-content">' +
          '<div class="fragment-time">' + (f.time || '时间未设置') + '</div>' +
          '<div class="fragment-place">' + (f.place || '地点未设置') + '</div>' +
          '<div class="fragment-chars">角色: ' + ((f.characters || []).join(', ')) + '</div>' +
          '<div class="fragment-preview">' + ((f.content || '').substring(0, 50)) + '...</div>' +
        '</div>' +
        '<div class="timeline-actions">' +
          '<button onclick="UnitEditor.editFragment(\'' + f.id + '\')">编辑</button>' +
          '<button onclick="UnitEditor.deleteFragment(\'' + f.id + '\')">删除</button>' +
        '</div>' +
      '</div>';
    }
    return html;
  },
  
  renderPerspectiveOptions(unit) {
    var roles = window.state && window.state.currentBook && window.state.currentBook.roles || [];
    var html = '';
    for (var i = 0; i < roles.length; i++) {
      var r = roles[i];
      var score = this.calculatePerspectiveScore(r.id || r.title, unit);
      var selected = unit.perspective === (r.id || r.title) ? 'selected' : '';
      html += '<option value="' + (r.id || r.title) + '" ' + selected + '>' + 
              (r.title || r.name) + '(' + score + '分)</option>';
    }
    return html;
  },
  
  getScoreClass(score) {
    if (score > 80) return 'score-high';
    if (score > 50) return 'score-mid';
    return 'score-low';
  },
  
  // ============ 角色评分 ============
  calculatePerspectiveScore(roleId, unit) {
    var fragments = (unit.fragments || [])
      .filter(function(f) { return (f.characters || []).indexOf(roleId) !== -1; });
    
    if (!fragments.length) return 0;
    
    var totalFragments = (unit.fragments || []).length;
    
    // 素材量评分 (50%)
    var materialScore = (fragments.length / totalFragments) * 50;
    
    // 对话量评分 (30%)
    var dialogueScore = Math.min(30, fragments.length * 5);
    
    // 冲突参与评分 (20%)
    var conflictCount = 0;
    for (var i = 0; i < fragments.length; i++) {
      var c = fragments[i].content || '';
      if (c.indexOf('冲突') !== -1 || c.indexOf('打') !== -1 || c.indexOf('杀') !== -1) {
        conflictCount++;
      }
    }
    var conflictScore = Math.min(20, conflictCount * 10);
    
    return Math.round(materialScore + dialogueScore + conflictScore);
  },
  
  // ============ CRUD ============
  createUnit() {
    var title = prompt('请输入单元标题：', '新章节');
    if (!title) return;
    
    var newUnit = {
      id: 'u_' + Date.now(),
      title: title,
      fragments: [],
      perspective: null,
      perspectiveScore: 0,
      settings: {
        dialogueRatio: 30,
        sceneryRatio: 20,
        emotionRatio: 50
      }
    };
    
    this.units.push(newUnit);
    this.save();
    this.refresh();
  },
  
  openUnit(unitId) {
    var unit = null;
    for (var i = 0; i < this.units.length; i++) {
      if (this.units[i].id === unitId) {
        unit = this.units[i];
        break;
      }
    }
    if (!unit) return;
    
    if (unit.perspective) {
      unit.perspectiveScore = this.calculatePerspectiveScore(unit.perspective, unit);
    }
    
    this.currentUnit = unit;
    this.render();
  },
  
  closeUnit() {
    this.currentUnit = null;
    this.render();
  },
  
  updateUnitTitle(unitId, title) {
    for (var i = 0; i < this.units.length; i++) {
      if (this.units[i].id === unitId) {
        this.units[i].title = title;
        this.save();
        break;
      }
    }
  },
  
  setPerspective(unitId, roleId) {
    for (var i = 0; i < this.units.length; i++) {
      if (this.units[i].id === unitId) {
        this.units[i].perspective = roleId;
        this.units[i].perspectiveScore = this.calculatePerspectiveScore(roleId, this.units[i]);
        this.save();
        this.render();
        break;
      }
    }
  },
  
  updateSetting(unitId, key, value) {
    for (var i = 0; i < this.units.length; i++) {
      if (this.units[i].id === unitId) {
        this.units[i].settings[key] = parseInt(value);
        this.save();
        break;
      }
    }
  },
  
  // ============ 片段管理 ============
  addFragment(unitId) {
    var unit = null;
    for (var i = 0; i < this.units.length; i++) {
      if (this.units[i].id === unitId) {
        unit = this.units[i];
        break;
      }
    }
    if (!unit) return;
    
    var fragment = {
      id: 'f_' + Date.now(),
      nodeId: null,
      time: '',
      place: '',
      characters: [],
      content: '',
      emotion: '',
      perspective: unit.perspective
    };
    
    unit.fragments.push(fragment);
    this.save();
    this.render();
    this.showFragmentModal(fragment.id);
  },
  
  editFragment(fragmentId) {
    this.showFragmentModal(fragmentId);
  },
  
  deleteFragment(fragmentId) {
    if (!confirm('确定删除该片段？')) return;
    
    if (this.currentUnit) {
      var newFragments = [];
      for (var i = 0; i < this.currentUnit.fragments.length; i++) {
        if (this.currentUnit.fragments[i].id !== fragmentId) {
          newFragments.push(this.currentUnit.fragments[i]);
        }
      }
      this.currentUnit.fragments = newFragments;
      this.save();
      this.render();
    }
  },
  
  showFragmentModal(fragmentId) {
    var fragment = null;
    if (this.currentUnit) {
      for (var i = 0; i < this.currentUnit.fragments.length; i++) {
        if (this.currentUnit.fragments[i].id === fragmentId) {
          fragment = this.currentUnit.fragments[i];
          break;
        }
      }
    }
    if (!fragment) return;
    
    var modal = document.createElement('div');
    modal.className = 'fragment-modal';
    modal.innerHTML = '<div class="fragment-modal-backdrop" onclick="UnitEditor.closeFragmentModal()"></div>' +
      '<div class="fragment-modal-box">' +
        '<div class="fragment-modal-header">' +
          '<h3>编辑片段</h3>' +
          '<button onclick="UnitEditor.closeFragmentModal()">x</button>' +
        '</div>' +
        '<div class="fragment-modal-body">' +
          '<div class="form-group">' +
            '<label>时间</label>' +
            '<input type="text" id="fragment-time" value="' + (fragment.time || '') + '" placeholder="如：子时三刻">' +
          '</div>' +
          '<div class="form-group">' +
            '<label>地点</label>' +
            '<input type="text" id="fragment-place" value="' + (fragment.place || '') + '" placeholder="如：野猪林">' +
          '</div>' +
          '<div class="form-group">' +
            '<label>角色</label>' +
            '<input type="text" id="fragment-chars" value="' + ((fragment.characters || []).join(', ')) + '" placeholder="逗号分隔，如：林冲,薛霸">' +
          '</div>' +
          '<div class="form-group">' +
            '<label>内容</label>' +
            '<textarea id="fragment-content" rows="5" placeholder="片段内容...">' + (fragment.content || '') + '</textarea>' +
          '</div>' +
          '<div class="form-group">' +
            '<label>情绪</label>' +
            '<input type="text" id="fragment-emotion" value="' + (fragment.emotion || '') + '" placeholder="如：紧张、危机">' +
          '</div>' +
        '</div>' +
        '<div class="fragment-modal-footer">' +
          '<button class="btn btn-primary" onclick="UnitEditor.saveFragment(\'' + fragmentId + '\')">保存</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);
  },
  
  closeFragmentModal() {
    var modal = document.querySelector('.fragment-modal');
    if (modal) modal.remove();
  },
  
  saveFragment(fragmentId) {
    var fragment = null;
    if (this.currentUnit) {
      for (var i = 0; i < this.currentUnit.fragments.length; i++) {
        if (this.currentUnit.fragments[i].id === fragmentId) {
          fragment = this.currentUnit.fragments[i];
          break;
        }
      }
    }
    if (!fragment) return;
    
    fragment.time = document.getElementById('fragment-time').value;
    fragment.place = document.getElementById('fragment-place').value;
    fragment.characters = document.getElementById('fragment-chars').value
      .split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s; });
    fragment.content = document.getElementById('fragment-content').value;
    fragment.emotion = document.getElementById('fragment-emotion').value;
    
    this.save();
    this.closeFragmentModal();
    this.render();
  },
  
  // ============ 视角转写 ============
  rewritePerspective(unitId) {
    var unit = null;
    for (var i = 0; i < this.units.length; i++) {
      if (this.units[i].id === unitId) {
        unit = this.units[i];
        break;
      }
    }
    if (!unit) return;
    
    var roles = window.state && window.state.currentBook && window.state.currentBook.roles || [];
    var roleScores = [];
    for (var i = 0; i < roles.length; i++) {
      var r = roles[i];
      var score = this.calculatePerspectiveScore(r.id || r.title, unit);
      roleScores.push({
        id: r.id || r.title,
        name: r.title || r.name,
        score: score
      });
    }
    roleScores.sort(function(a, b) { return b.score - a.score; });
    
    var html = '<div class="rewrite-panel"><h3>视角转写</h3><div class="role-score-list">';
    for (var i = 0; i < roleScores.length; i++) {
      var r = roleScores[i];
      var canRewrite = r.score > 80 ? 'first-person' : (r.score > 50 ? 'third-person' : 'side-story');
      var typeLabel = canRewrite === 'first-person' ? '可第一人称' : 
                      (canRewrite === 'third-person' ? '可第三人称' : '同人文');
      html += '<div class="role-score-item ' + canRewrite + '">' +
        '<span class="role-name">' + r.name + '</span>' +
        '<span class="role-score">' + r.score + '分</span>' +
        '<span class="rewrite-type">' + typeLabel + '</span>' +
      '</div>';
    }
    html += '</div></div>';
    
    var panel = document.getElementById('unit-rewrite-panel');
    if (panel) panel.innerHTML = html;
  },
  
  // ============ 生成小说 ============
  generateNovel(unitId) {
    alert('生成小说功能开发中...\n\n请先添加片段，再进行生成。');
  },
  
  // ============ 工具 ============
  save() {
    localStorage.setItem('sw_units', JSON.stringify(this.units));
  },
  
  load() {
    try {
      var data = localStorage.getItem('sw_units');
      this.units = data ? JSON.parse(data) : [];
    } catch (e) {
      this.units = [];
    }
  },
  
  refresh() {
    this.load();
    this.render();
  },
  
  render() {
    var container = document.getElementById('unit-editor-container');
    if (container) {
      if (this.currentUnit) {
        container.innerHTML = this.renderUnitDetail(this.currentUnit);
      } else {
        container.innerHTML = this.renderUnitList();
      }
    }
  },
  
  bindEvents() {
    this.load();
  }
};

UnitEditor.init();
window.UnitEditor = UnitEditor;
