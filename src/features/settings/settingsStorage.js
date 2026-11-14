/**
 * settingsStorage
 * Path: src/features/settings/settingsStorage.js
 *
 * Reads and clears the five konva-* localStorage keys for the Settings page. Studio's own
 * helpers (studioStorage.js) and the theme module (lib/theme.js) stay the source of truth
 * for what each value means; this file only lists, measures and removes them.
 */
import { THEME_KEY } from '../../lib/theme';
import { KEYS, readDefaults, readHistory, readModelCached, readOnboarded } from '../studio/studioStorage';

// Exactly the keys Konva writes. Settings never touches anything else on the origin.
export const STORED_KEYS = {
  defaults: KEYS.defaults,
  history: KEYS.history,
  theme: THEME_KEY,
  model: KEYS.model,
  onboarded: KEYS.onboarded,
};

export function storageAvailable() {
  try {
    const probe = 'konva-probe';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function readRaw(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage blocked: nothing was stored, so there is nothing to clear.
  }
}

// Bytes the browser keeps for one entry (key plus value, UTF-8).
const enc = new TextEncoder();
export function entryBytes(key, raw) {
  return raw == null ? 0 : enc.encode(key).length + enc.encode(raw).length;
}

export const kb = (bytes) => (bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`);

// One snapshot of everything stored. Values come from the same validated readers Studio uses.
export function readStored() {
  const raw = Object.fromEntries(Object.entries(STORED_KEYS).map(([id, key]) => [id, readRaw(key)]));
  return {
    raw,
    bytes: Object.fromEntries(Object.entries(STORED_KEYS).map(([id, key]) => [id, entryBytes(key, raw[id])])),
    defaults: readDefaults(),
    history: readHistory(),
    modelFlag: readModelCached(),
    onboarded: readOnboarded(),
  };
}
