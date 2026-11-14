/**
 * useStudioShortcuts
 * Path: src/features/studio/useStudioShortcuts.js
 *
 * Global Studio keys: 1 to 7 tools, [ ] previous / next file, \ before/after,
 * D download, Shift+D download all, Cmd/Ctrl+K command palette, Esc closes the top overlay.
 * Single keys are ignored while typing in a field or while an overlay is open.
 * (Arrow keys for redact areas live in RedactPanel, which only listens while it is open.)
 */
import { useEffect, useRef } from 'react';
import { TOOLS } from './studioConstants';

const TEXT_TYPES = new Set(['text', 'search', 'url', 'email', 'number', 'password', 'tel']);

// True when keys should go to a field rather than to Studio. Sliders and buttons don't count.
function isTyping(el) {
  if (!(el instanceof Element)) return false;
  if (el.closest('textarea, select, [contenteditable="true"]')) return true;
  return el.tagName === 'INPUT' && TEXT_TYPES.has(el.type);
}

// handlers: { st, onTool, onToggleCompare, overlays: { tour, palette, sheet },
//             onTogglePalette, onClosePalette, onCloseSheet, onFinishTour }
export function useStudioShortcuts(handlers) {
  // Read the latest handlers from a ref, so the window listener is added once.
  const ref = useRef(handlers);
  useEffect(() => {
    ref.current = handlers;
  });

  useEffect(() => {
    const onKey = (e) => {
      const h = ref.current;
      const { st, overlays } = h;
      const mod = e.metaKey || e.ctrlKey;

      // The tour owns the keyboard while it is open: only Esc does anything.
      if (overlays.tour) {
        if (e.key === 'Escape') {
          e.preventDefault();
          h.onFinishTour();
        }
        return;
      }

      if (mod && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault(); // some browsers use Ctrl+K for the address bar search
        h.onTogglePalette();
        return;
      }

      if (e.key === 'Escape') {
        if (overlays.palette) h.onClosePalette();
        else if (st.dev) st.closeDev();
        else if (overlays.sheet) h.onCloseSheet();
        return;
      }

      if (mod || e.altKey || overlays.palette || st.dev || isTyping(e.target)) return;

      if (e.key >= '1' && e.key <= String(TOOLS.length)) {
        h.onTool(TOOLS[Number(e.key) - 1].id);
      } else if (e.key === '[') {
        st.prev();
      } else if (e.key === ']') {
        st.next();
      } else if (e.key === '\\') {
        h.onToggleCompare();
      } else if (e.key.toLowerCase() === 'd') {
        if (e.repeat) return; // holding D shouldn't queue up downloads
        e.preventDefault();
        if (e.shiftKey) st.downloadAll();
        else st.downloadCurrent();
      } else {
        return;
      }
      e.preventDefault();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}