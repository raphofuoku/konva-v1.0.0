const THEME_KEY = 'konva-theme';

/**
 * Reads the persisted theme choice. Falls back to the user's OS-level
 * preference on first visit, then to 'light' if that's unavailable.
 * Used both by the inline bootstrap script in index.html (to avoid a
 * flash of the wrong theme) and by the ThemeToggle component.
 */
export function getInitialTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

export function persistTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

export { THEME_KEY };