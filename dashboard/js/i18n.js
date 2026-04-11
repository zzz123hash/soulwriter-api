/**
 * 绘梦 i18n 多语言支持
 */

const translations = {
  'zh-CN': null, // 动态加载
  'en-US': null
};

// 当前语言
let currentLang = 'zh-CN';

// 加载语言文件
async function loadLang(lang) {
  if (translations[lang]) return translations[lang];
  
  try {
    const res = await fetch(`/i18n/${lang}.json`);
    translations[lang] = await res.json();
    return translations[lang];
  } catch (e) {
    console.error('Failed to load language:', lang, e);
    return {};
  }
}

// 获取翻译
function t(key, params = {}) {
  const keys = key.split('.');
  let value = translations[currentLang];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      value = undefined;
      break;
    }
  }
  
  if (value === undefined) {
    // 回退到中文
    value = translations['zh-CN'];
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        value = key; // 返回key作为默认值
        break;
      }
    }
  }
  
  // 替换参数
  if (typeof value === 'string' && Object.keys(params).length > 0) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(new RegExp(`{${k}}`, 'g'), v);
    }
  }
  
  return value || key;
}

// 切换语言
async function setLang(lang) {
  if (!translations[lang]) {
    await loadLang(lang);
  }
  currentLang = lang;
  localStorage.setItem('soulwriter-lang', lang);
  
  // 触发语言更新事件
  window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
}

// 初始化
async function initI18n() {
  // 从localStorage恢复语言设置
  const savedLang = localStorage.getItem('soulwriter-lang');
  const lang = savedLang || navigator.language || 'zh-CN';
  
  // 如果是中文环境，使用中文
  if (lang.startsWith('zh')) {
    await loadLang('zh-CN');
    currentLang = 'zh-CN';
  } else {
    await loadLang('en-US');
    currentLang = 'en-US';
  }
  
  return currentLang;
}

// 导出
window.i18n = {
  t,
  setLang,
  getLang: () => currentLang,
  loadLang,
  initI18n
};
