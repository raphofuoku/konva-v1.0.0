import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Drag-and-drop + Ctrl/Cmd+V clipboard-paste image upload.
 *
 * onFiles is called through a ref rather than a dependency, so callers
 * don't need to memoize it and the paste listener isn't torn down and
 * re-attached on every render (see rerender-dependencies / advanced
 * -event-handler-refs patterns).
 */
export function useDropAndPaste({ onFiles, enabled = true, accept = 'image/' }) {
  const [isDragging, setIsDragging] = useState(false);
  const onFilesRef = useRef(onFiles);
  onFilesRef.current = onFiles;

  useEffect(() => {
    if (!enabled) return undefined;

    function handlePaste(event) {
      const items = event.clipboardData?.items;
      if (!items) return;

      const files = [];
      for (const item of items) {
        if (item.kind === 'file' && item.type.startsWith(accept)) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) onFilesRef.current(files);
    }

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [enabled, accept]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((event) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragging(false);
      const files = Array.from(event.dataTransfer?.files || []).filter((file) =>
        file.type.startsWith(accept)
      );
      if (files.length > 0) onFilesRef.current(files);
    },
    [accept]
  );

  return {
    isDragging,
    dropHandlers: { onDragOver, onDragLeave, onDrop },
  };
}