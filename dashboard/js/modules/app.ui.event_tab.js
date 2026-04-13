// ============ 第8部分: 事件时间线 ============
function renderEventTab() {
  // EventLine 事件线 - 鱼骨图风格
  return '<div class="event-tab-root" id="event-tab-root">' +
    '<div id="event-timeline" class="event-timeline"></div>' +
    '<div id="eventline-detail-panel" class="event-detail-panel">' +
      '<div style="padding:20px;text-align:center;color:var(--text2);">' +
        '<div style="font-size:2em;margin-bottom:8px;">📖</div>' +
        '<p style="margin:0;">点击事件查看详情</p>' +
        '<p style="font-size:12px;margin-top:8px;">拖拽平移，滚轮缩放</p>' +
      '</div>' +
    '</div>' +
  '</div>';
}



// ============ 女娲 Tab ============

