// ============ 第17部分: 初始化 ============
function init() {

  function doRender() { renderApp(); }

  if (window._i18n && window._i18n.ready) {

    doRender();

  } else {

    var _timer = setTimeout(doRender, 2000);

    window.addEventListener('i18nReady', function _h() {

      clearTimeout(_timer);

      window.removeEventListener('i18nReady', _h);

      doRender();

    });

  }



  // Listen to logger.js toolbar events for lang/theme sync

  window.addEventListener('lang-change', function(e) {

    var locale = e.detail.lang === 'en-US' ? 'en' : 'zh';

    if (window._i18n) window._i18n.setLocale(locale);

  });



  window.addEventListener('theme-change', function(e) {

    document.documentElement.setAttribute('data-theme', e.detail.theme);

  });

}

document.addEventListener('DOMContentLoaded', init);

/**

 * translate_routes.js - 前端翻译UI

 */



