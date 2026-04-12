/**
 * SoulWriter i18n Module
 */
;(function() {
  window._i18n = {
    currentLocale: 'zh',
    data: {},
    ready: false,
    async loadLocale(locale) {
      try {
        var r = await fetch('/config/i18n/' + locale + '.json');
        if (!r.ok) throw new Error(r.status);
        this.data = await r.json();
        this.currentLocale = locale;
        localStorage.setItem('sw_locale', locale);
        this.ready = true;
        window.dispatchEvent(new CustomEvent('i18nReady', { detail: { locale } }));
      } catch(e) {
        console.error('[i18n] load error:', e);
        if (locale !== 'en') this.loadLocale('en');
      }
    },
    t(key, params) {
      if (!this.ready) return key;
      var keys = key.split('.'), val = this.data;
      for (var i = 0; i < keys.length; i++) { val = val && val[keys[i]]; if (!val) return key; }
      if (params && typeof val === 'string') {
        return val.replace(/\{(\w+)\}/g, function(_, k) { return params[k] !== undefined ? params[k] : '{'+k+'}'; });
      }
      return val || key;
    },
    async setLocale(locale) { await this.loadLocale(locale); if (typeof renderApp === 'function') renderApp(); }
  };
  var saved = localStorage.getItem('sw_locale') || 'zh';
  window._i18n.loadLocale(saved);
})();

const t = function(key, params) {
  if (window._i18n && window._i18n.ready) return window._i18n.t(key, params);
  return key;
};
