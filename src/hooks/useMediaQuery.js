/**
 * useMediaQuery
 * Path: src/hooks/useMediaQuery.js
 *
 * True while the media query matches. Re-renders only when the match flips.
 */
import { useCallback, useSyncExternalStore } from 'react';

export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query]
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}