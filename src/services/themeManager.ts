export type AppTheme = 'dark';

const THEME_KEY = 'career_os_theme';

export const themeManager = {
  getTheme: (): AppTheme => {
    return 'dark';
  },

  setTheme: (_theme: AppTheme): void => {
    try {
      localStorage.setItem(THEME_KEY, 'dark');
      applyThemeToDom('dark');
      window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: 'dark' } }));
    } catch {}
  },

  init: (): void => {
    applyThemeToDom('dark');
  }
};

const applyThemeToDom = (theme: AppTheme) => {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.remove('theme-wheat', 'theme-white');
  document.body.classList.remove('theme-wheat', 'theme-white');
  
  document.documentElement.classList.add('theme-dark');
  document.body.classList.add('theme-dark');
  document.documentElement.setAttribute('data-theme', theme);
};

// Initialize immediately on load
if (typeof window !== 'undefined') {
  themeManager.init();
}
