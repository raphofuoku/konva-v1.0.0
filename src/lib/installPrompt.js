/**
 * installPrompt
 * Path: src/lib/installPrompt.js
 *
 * Catches the browser's beforeinstallprompt event as soon as the app loads (it can fire
 * before Settings is ever opened) and keeps it until Settings asks to install. App.jsx
 * imports this module so the listener is added at startup.
 */

let deferred = null;
const listeners = new Set();

const standalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true);

let state = { canInstall: false, installed: standalone() };

function emit(patch) {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn());
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // keep it for the Install button instead of the mini info bar
    deferred = e;
    emit({ canInstall: true });
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    emit({ canInstall: false, installed: true });
  });
}

export function subscribeInstall(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Stable object between changes, as useSyncExternalStore needs.
export const getInstallState = () => state;

// 'accepted' | 'dismissed' | 'unavailable'
export async function promptInstall() {
  if (!deferred) return 'unavailable';
  const e = deferred;
  deferred = null; // a prompt event can only be used once
  emit({ canInstall: false });
  try {
    await e.prompt();
    const { outcome } = await e.userChoice;
    return outcome;
  } catch {
    return 'dismissed';
  }
}
