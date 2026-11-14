/**
 * useSettings
 * Path: src/features/settings/useSettings.js
 *
 * State and actions for the Settings page: remembered defaults, theme, the model cache,
 * install, and the stored-data list. Stays in sync with other tabs through storage events.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '../../components/ui/Toasts';
import { useTheme } from '../../hooks/useTheme';
import { useOfflineReady } from '../../hooks/useOfflineReady';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { THEME_EVENT } from '../../lib/theme';
import { DEFAULT_KEYS } from '../studio/studioConstants';
import { readDefaults, readModelCached, writeDefaults } from '../studio/studioStorage';
import { STORED_KEYS, readStored, removeKey, storageAvailable } from './settingsStorage';
import { modelCacheInfo, removeModelCache } from './modelCache';
import { COPY } from './settingsConstants';

const OURS = new Set(Object.values(STORED_KEYS));

// Theme listeners (useTheme, the theme button) re-read the preference on this event.
const announceTheme = () => window.dispatchEvent(new CustomEvent(THEME_EVENT));

/*
  Returns:
    canStore                       false when the browser blocks localStorage
    defaults, setDefault(patch), resetDefaults()
    theme { pref, resolved, setPref }
    offline                        true once a service worker controls the page
    install { canInstall, installed, run() }
    model { status 'checking' | 'cached' | 'none' | 'removing', bytes }, removeModel()
    stored                         snapshot from readStored()
    clearRow(id), clearAll()
*/
export function useSettings() {
  const toast = useToast();
  const { pref, resolved, setPref } = useTheme();
  const offline = useOfflineReady();
  const installer = useInstallPrompt();

  const [canStore] = useState(storageAvailable);
  const [stored, setStored] = useState(readStored);
  const [defaults, setDefaults] = useState(() => stored.defaults);
  const [model, setModel] = useState({ status: 'checking', bytes: 0 });
  const alive = useRef(true);

  const refresh = useCallback(() => setStored(readStored()), []);

  // The flag is what Studio trusts, so either signal counts as cached.
  const checkModel = useCallback(async () => {
    const info = await modelCacheInfo();
    if (!alive.current) return;
    const cached = readModelCached() || info.files > 0;
    setModel({ status: cached ? 'cached' : 'none', bytes: cached ? info.bytes : 0 });
  }, []);

  useEffect(() => {
    alive.current = true;
    checkModel();

    const onStorage = (e) => {
      if (e.key !== null && !OURS.has(e.key)) return; // null means another tab cleared everything
      refresh();
      if (e.key === null || e.key === STORED_KEYS.defaults) setDefaults(readDefaults());
      if (e.key === null || e.key === STORED_KEYS.model) checkModel();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(THEME_EVENT, refresh);
    return () => {
      alive.current = false;
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(THEME_EVENT, refresh);
    };
  }, [checkModel, refresh]);

  // ---------- defaults ----------
  const setDefault = useCallback(
    (patch) => {
      const next = { ...defaults, ...patch };
      if (DEFAULT_KEYS.every((k) => next[k] === defaults[k])) return;
      writeDefaults(next);
      setDefaults(next);
      refresh();
    },
    [defaults, refresh]
  );

  const resetDefaults = useCallback(() => {
    removeKey(STORED_KEYS.defaults);
    setDefaults(readDefaults());
    refresh();
    toast('ok', COPY.defaultsReset);
  }, [refresh, toast]);

  // ---------- model ----------
  const removeModel = useCallback(
    async ({ quiet = false } = {}) => {
      setModel((m) => ({ ...m, status: 'removing' }));
      let ok = true;
      try {
        await removeModelCache();
        removeKey(STORED_KEYS.model);
      } catch {
        ok = false;
      }
      refresh();
      await checkModel();
      if (!quiet) toast(ok ? 'ok' : 'bad', ok ? COPY.modelRemoved : COPY.modelFailed);
      return ok;
    },
    [checkModel, refresh, toast]
  );

  // ---------- install ----------
  const runInstall = useCallback(async () => {
    const outcome = await installer.install();
    if (outcome === 'unavailable') toast('info', COPY.installUnavailable);
    else if (outcome === 'accepted') toast('ok', COPY.installDone);
  }, [installer, toast]);

  // ---------- stored data ----------
  const clearRow = useCallback(
    (id) => {
      if (id === 'defaults') return resetDefaults();
      if (id === 'model') return removeModel();
      removeKey(STORED_KEYS[id]);
      if (id === 'theme') announceTheme(); // back to "Match system"; refresh runs from the event
      else refresh();
      const msg = { history: COPY.historyCleared, theme: COPY.themeCleared, onboarded: COPY.onboardedCleared }[id];
      toast('ok', msg);
    },
    [refresh, removeModel, resetDefaults, toast]
  );

  const clearAll = useCallback(async () => {
    for (const [id, key] of Object.entries(STORED_KEYS)) if (id !== 'model') removeKey(key);
    setDefaults(readDefaults());
    announceTheme();
    const ok = await removeModel({ quiet: true });
    refresh();
    toast(ok ? 'ok' : 'bad', ok ? COPY.allCleared : COPY.modelFailed);
  }, [refresh, removeModel, toast]);

  return {
    canStore,
    defaults,
    setDefault,
    resetDefaults,
    theme: { pref, resolved, setPref },
    offline,
    install: { canInstall: installer.canInstall, installed: installer.installed, run: runInstall },
    model,
    removeModel,
    stored,
    clearRow,
    clearAll,
  };
}
