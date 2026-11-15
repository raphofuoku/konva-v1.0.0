/**
 * useElementSize
 * Path: src/hooks/useElementSize.js
 *
 * Live content-box size of an element. Returns [ref, { width, height }]; pass ref to the element.
 */
import { useEffect, useState } from 'react';

export function useElementSize() {
  const [node, setNode] = useState(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!node) return undefined;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((s) => (s.width === width && s.height === height ? s : { width, height }));
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, [node]);

  return [setNode, size];
}