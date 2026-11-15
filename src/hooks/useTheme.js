import { useCallback, useEffect, useState } from 'react';
import {
  THEME_EVENT, THEME_KEY, applyTheme, getThemePref,
  resolveTheme, setThemePref, watchSystemTheme,
} from '../lib/theme';

const read = () => {
  const pref = getThemePref();
  return { pref, resolved: resolveTheme(pref) };
};

// Every component using this hook stays in sync: theme buttons, Settings,
// another tab changing the preference, and the OS switching light/dark.
export function useTheme() {
  const [state, setState] = useState(read);

  useEffect(() => {
    const sync = () => {
      applyTheme();
      setState(read());
    };
    const onStorage = (e) => {
      if (e.key === THEME_KEY) sync();
    };
    window.addEventListener(THEME_EVENT, sync);
    window.addEventListener('storage', onStorage);
    const stopWatching = watchSystemTheme(sync);
    return () => {
      window.removeEventListener(THEME_EVENT, sync);
      window.removeEventListener('storage', onStorage);
      stopWatching();
    };
  }, []);

  const setPref = useCallback((pref) => setThemePref(pref), []);
  const toggle = useCallback(() => {
    setThemePref(resolveTheme(getThemePref()) === 'dark' ? 'light' : 'dark');
  }, []);

  return { ...state, setPref, toggle };
}