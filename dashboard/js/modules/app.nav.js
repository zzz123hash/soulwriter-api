// ============ 第4部分: 导航树 ============
var NAV_TREE = [
  { label: '导航', id: 'nav', icon: 'compass', children: [
    { label: '角色', id: 'roles', icon: 'roles' },
    { label: '物品', id: 'items', icon: 'items' },
    { label: '地点', id: 'locations', icon: 'locations' },
    { label: '自定义', id: 'custom', icon: 'star' },
  ]},
  { label: '剧情', id: 'plot', icon: 'event', children: [
    { label: '事件', id: 'events', icon: 'event' },
    { label: '章节', id: 'chapters', icon: 'units' },
  ]},
  { label: '背景', id: 'background', icon: 'world', children: [
    { label: '设定', id: 'settings', icon: 'settings' },
    { label: '世界观', id: 'worldview', icon: 'world' },
  ]},
  { label: '创作', id: 'creation', icon: 'create', children: [
    { label: '剧本', id: 'script', icon: 'script' },
    { label: '小说', id: 'novel', icon: 'novel' },
    { label: '顺理成章', id: 'storyflow', icon: 'flow', panel: 'storyflow' },
    { label: '因果链', id: 'causal', icon: 'chain', panel: 'causal' },
  ]},
  { label: '创意', id: 'idea', icon: 'lightbulb', children: [
    { label: '想法', id: 'thoughts', icon: 'thoughts' },
    { label: '灵感', id: 'inspiration', icon: 'inspiration' },
    { label: '记录', id: 'notes', icon: 'notes' },
  ]},
  { label: '地图', id: 'map', icon: 'map', children: [
    { label: '列表', id: 'maplist', icon: 'map' },
  ]},
  { label: '分析', id: 'analysis', icon: 'chart', children: [
    { label: '人物关系', id: 'relationships', icon: 'relationships' },
    { label: '综合', id: 'summary', icon: 'summary' },
    { label: '设置', id: 'analysis-settings', icon: 'settings' },
    { label: 'API路由', id: 'apiroutes', icon: 'api' },
    { label: '预设', id: 'presets', icon: 'presets' },
    { label: '写作风格', id: 'writingstyle', icon: 'style' },
  ]},
  { label: '工具', id: 'tools', icon: 'tools', children: [
    { label: '小说解析', id: 'novelparse', icon: 'parse' },
  ]},
];



var SPECIAL_TABS = { genesis: true, event: true, nvwa: true, analysis: true, tension: true, map: true, chapters: true, world: true, worldview: true, novel: true, "analysis-settings": true, apiroutes: true, presets: true, writingstyle: true };



