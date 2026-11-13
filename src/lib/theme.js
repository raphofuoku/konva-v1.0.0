// Theme preference: 'light' | 'dark' | 'system', stored under konva-theme.
// The resolved value is written to <html data-theme>, which tokens.css reads.
export const THEME_KEY = 'konva-theme';
export const THEME_EVENT = 'konva-theme-change';
const PREFS = ['light', 'dark', 'system'];

const media = () =>
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

export function getThemePref() {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return PREFS.includes(v) ? v : 'system';
  } catch {
    return 'system';
  }
}

export function resolveTheme(pref) {
  if (pref === 'light' || pref === 'dark') return pref;
  return media()?.matches ? 'dark' : 'light';
}

export function applyTheme(pref = getThemePref()) {
  const resolved = resolveTheme(pref);
  document.documentElement.dataset.theme = resolved;
  return resolved;
}

export function setThemePref(pref) {
  if (!PREFS.includes(pref)) return;
  try {
    localStorage.setItem(THEME_KEY, pref);
  } catch {
    // Storage blocked: the theme still applies for this session.
  }
  applyTheme(pref);
  window.dispatchEvent(new CustomEvent(THEME_EVENT));
}

export function watchSystemTheme(callback) {
  const m = media();
  if (!m) return () => {};
  m.addEventListener('change', callback);
  return () => m.removeEventListener('change', callback);
}