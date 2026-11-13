import { useEffect, useState } from 'react';

// True once a service worker controls the page (added in Part 11).
// Until then the "Offline ready" chip stays hidden rather than claiming something untrue.
export function useOfflineReady() {
  const [ready, setReady] = useState(
    () => typeof navigator !== 'undefined' && !!navigator.serviceWorker?.controller
  );

  useEffect(() => {
    const sw = navigator.serviceWorker;
    if (!sw) return undefined;
    const update = () => setReady(!!sw.controller);
    sw.addEventListener('controllerchange', update);
    return () => sw.removeEventListener('controllerchange', update);
  }, []);

  return ready;
}