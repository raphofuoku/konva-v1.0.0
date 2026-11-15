/**
 * studioStorage
 * Path: src/features/studio/studioStorage.js
 *
 * localStorage helpers for konva-defaults, konva-history, konva-model and konva-onboarded.
 */
import { DEF, MIME } from '../../lib/konvaEngine';
import { DEFAULT_KEYS, HISTORY_MAX } from './studioConstants';

// Studio touches four of the five konva-* keys (theme is handled by src/lib/theme.js).
// Settings (Part 10) lists and clears all five.
export const KEYS = { defaults: 'konva-defaults', history: 'konva-history', model: 'konva-model', onboarded: 'konva-onboarded' };

function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null; // storage disabled (private mode, blocked cookies)
  }
}

function write(key, value) {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Quota or private mode: Studio still works, it just won't remember.
  }
}

function readJSON(key, fallback) {
  const raw = read(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

// A stored value only wins if it is valid, so a hand-edited or stale key can't break Studio.
const VALID = {
  format: (v) => Object.hasOwn(MIME, v),
  quality: (v) => Number.isFinite(v) && v >= 1 && v <= 100,
  mode: (v) => v === 'quality' || v === 'target',
  targetKB: (v) => Number.isFinite(v) && v >= 5,
  strip: (v) => typeof v === 'boolean',
};

export const pickDefaults = (s) => Object.fromEntries(DEFAULT_KEYS.map((k) => [k, s[k]]));

// DEF with the saved defaults merged over it. Width and height always start empty.
export function readDefaults() {
  const saved = readJSON(KEYS.defaults, null);
  const out = { ...DEF };
  if (saved && typeof saved === 'object') {
    for (const k of DEFAULT_KEYS) if (VALID[k](saved[k])) out[k] = saved[k];
  }
  out.width = null;
  out.height = null;
  return out;
}

export function writeDefaults(s) {
  write(KEYS.defaults, JSON.stringify(pickDefaults(s)));
}

// History holds export names and a short detail line only. Never image data.
export function readHistory() {
  const list = readJSON(KEYS.history, []);
  if (!Array.isArray(list)) return [];
  return list
    .filter((h) => h && typeof h.name === 'string')
    .map((h) => ({ name: h.name, detail: typeof h.detail === 'string' ? h.detail : '', at: Number(h.at) || 0 }))
    .slice(0, HISTORY_MAX);
}

export function writeHistory(list) {
  write(KEYS.history, list.length ? JSON.stringify(list.slice(0, HISTORY_MAX)) : null);
}

export const readModelCached = () => read(KEYS.model) === 'cached';
export const writeModelCached = () => write(KEYS.model, 'cached');

// First-run tour: shown until it has been finished or skipped once.
export const readOnboarded = () => read(KEYS.onboarded) === '1';
export const writeOnboarded = () => write(KEYS.onboarded, '1');