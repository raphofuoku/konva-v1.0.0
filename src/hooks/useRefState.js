/**
 * useRefState
 * Path: src/hooks/useRefState.js
 *
 * useState plus a ref that always holds the latest value.
 */
import { useCallback, useRef, useState } from 'react';

// useState plus a ref that always holds the latest value.
// Async work (encodes, exports, model downloads) reads the ref after an await,
// so the callbacks that start that work can stay stable (no deps on state).
export function useRefState(initial) {
  const [state, setState] = useState(initial);
  const ref = useRef(state);

  const set = useCallback((value) => {
    setState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      ref.current = next;
      return next;
    });
  }, []);

  return [state, set, ref];
}