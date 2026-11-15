/**
 * registerSW
 * Path: src/pwa/registerSW.js
 *
 * Registers dist/sw.js in production builds (never in `npm run dev`, where caching would fight
 * hot reload) and notices when a newer version is installed and waiting. main.jsx imports this
 * for its side effect; Settings reads the update state through useAppUpdate().
 */

let state = { updateReady: false };
const listeners = new Set();
let registration = null;
let lastCheck = Date.now();
const CHECK_EVERY = 60 * 60 * 1000; // look for a new version at most once an hour

function emit(patch) {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn());
}

export function subscribeUpdate(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Stable object between changes, as useSyncExternalStore needs.
export const getUpdateState = () => state;

function watch(reg) {
  registration = reg;
  // A waiting worker only counts as an update when an older one controls this page.
  const check = () => {
    if (reg.waiting && navigator.serviceWorker.controller) emit({ updateReady: true });
  };
  check();
  reg.addEventListener('updatefound', () => {
    const next = reg.installing;
    next?.addEventListener('statechange', () => {
      if (next.state === 'installed') check();
    });
  });
}

// Activates the waiting version, then reloads once it controls the page.
export function applyUpdate() {
  const waiting = registration?.waiting;
  if (!waiting) {
    window.location.reload();
    return;
  }
  navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true });
  waiting.postMessage({ type: 'SKIP_WAITING' });
}

function register() {
  const base = import.meta.env.BASE_URL;
  navigator.serviceWorker
    .register(`${base}sw.js`, { scope: base })
    .then(watch)
    .catch(() => {
      // Offline support is a bonus: the app works the same without it.
    });
}

if (import.meta.env.PROD && typeof window !== 'undefined' && 'serviceWorker' in navigator && window.isSecureContext) {
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || !registration) return;
    if (Date.now() - lastCheck < CHECK_EVERY) return;
    lastCheck = Date.now();
    registration.update().catch(() => {});
  });
}
