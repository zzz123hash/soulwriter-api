/**
 * SoulWriter 主题管理器
 */

const ThemeManager = {
  STORAGE_KEY: 'soulwriter-theme',
  THEMES: {
    soft: { name: '柔和', icon: '🌸', preview: '#F8F8FA' },
    dark: { name: '暗色', icon: '🌙', preview: '#1D1D1F' },
    system: { name: '随系统', icon: '⚙️', preview: 'linear-gradient(135deg, #F8F8FA 50%, #1D1D1F 50%)' }
  },

  getTheme() {
    return localStorage.getItem(this.STORAGE_KEY) || 'soft';
  },

  setTheme(theme) {
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.applyTheme(theme);
  },

  applyTheme(theme) {
    // Remove existing theme
    document.documentElement.removeAttribute('data-theme');
    
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    }
    // 'soft' is default, no attribute needed
  },

  init() {
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (this.getTheme() === 'system') {
        this.applyTheme('system');
      }
    });

    // Apply saved theme
    this.applyTheme(this.getTheme());
  },

  renderSelector(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const current = this.getTheme();
    
    container.innerHTML = `
      <div class="theme-selector">
        <h3 class="theme-title">选择主题</h3>
        <div class="theme-options">
          ${Object.entries(this.THEMES).map(([key, theme]) => `
            <button 
              class="theme-option ${current === key ? 'active' : ''}" 
              data-theme="${key}"
              title="${theme.name}"
            >
              <span class="theme-preview" style="background: ${theme.preview}"></span>
              <span class="theme-name">${theme.icon} ${theme.name}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // Bind click events
    container.querySelectorAll('.theme-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        this.setTheme(theme);
        this.renderSelector(containerId); // Re-render to update active state
      });
    });
  }
};

// Export
window.ThemeManager = ThemeManager;
