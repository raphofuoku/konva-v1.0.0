/**
 * useIconPack
 * Path: src/features/icons/useIconPack.js
 *
 * State for the Icon pack page: the logo, drawing options, manifest names, preview icons
 * (redrawn shortly after each change), ZIP export with progress, and the code snippets.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { download, fmt } from '../../lib/konvaEngine';
import { useToast } from '../../components/ui/Toasts';
import { useRefState } from '../../hooks/useRefState';
import { COPY, DEFAULT_META, DEFAULT_OPTS, REDRAW_DELAY, SHARP_MIN, SPECS, ZIP_NAME } from './iconConstants';
import { LoadError, bgColour, buildPack, drawIcon, headText, loadLogo, manifestText, sampleLogo } from './iconDraw';

const dropUrl = (src) => {
  if (src?.own) URL.revokeObjectURL(src.url);
};

export function useIconPack() {
  const toast = useToast();
  const [src, setSrc, srcRef] = useRefState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [opts, setOptsState, optsRef] = useRefState(DEFAULT_OPTS);
  const [meta, setMetaState, metaRef] = useRefState(DEFAULT_META);
  const [icons, setIcons] = useState([]); // [{ ...spec, url }]
  const [busy, setBusy] = useState(null); // { step } while zipping
  const [saved, setSaved] = useState(null); // { size, count } after a download, cleared by any change
  const [exportError, setExportError] = useState(false);
  const [codeTab, setCodeTab] = useState('html');

  const aliveRef = useRef(true);
  const loadIdRef = useRef(0); // newest load wins
  const timerRef = useRef(0);
  const busyRef = useRef(false);

  // ---------- previews ----------
  // Data URLs, drawn synchronously (about 10 ms for all seven). Chrome encodes toBlob in
  // idle time, which can hold a preview back by a second while the page is busy.
  const redraw = useCallback(
    (now = false) => {
      clearTimeout(timerRef.current);
      const run = () => {
        if (!aliveRef.current) return;
        const s = srcRef.current;
        const o = optsRef.current;
        setIcons(s ? SPECS.map((spec) => ({ ...spec, url: drawIcon(s, spec, o).toDataURL('image/png') })) : []);
      };
      if (now) run();
      else timerRef.current = setTimeout(run, REDRAW_DELAY);
    },
    [optsRef, setIcons, srcRef]
  );

  const touched = useCallback(() => {
    setSaved(null);
    setExportError(false);
  }, []);

  // ---------- logo ----------
  const applySource = useCallback(
    (next) => {
      dropUrl(srcRef.current);
      srcRef.current = next; // the immediate redraw below reads it before React renders
      setSrc(next);
      setError(null);
      touched();
      redraw(true);
    },
    [redraw, setSrc, srcRef, touched]
  );

  const load = useCallback(
    async (file) => {
      if (!file || busyRef.current) return;
      const id = ++loadIdRef.current;
      setError(null);
      setLoading(true);
      try {
        const next = await loadLogo(file);
        if (id !== loadIdRef.current || !aliveRef.current) {
          dropUrl(next);
          return;
        }
        applySource(next);
      } catch (e) {
        if (id !== loadIdRef.current || !aliveRef.current) return;
        setError(e instanceof LoadError ? e.message : COPY.cantRead(file.name));
      } finally {
        if (id === loadIdRef.current && aliveRef.current) setLoading(false);
      }
    },
    [applySource]
  );

  const loadSample = useCallback(async () => {
    if (busyRef.current) return;
    const id = ++loadIdRef.current;
    setLoading(true);
    const next = await sampleLogo();
    if (id !== loadIdRef.current || !aliveRef.current) return;
    setLoading(false);
    applySource(next);
  }, [applySource]);

  // ---------- options ----------
  const setOpt = useCallback(
    (patch) => {
      const next = { ...optsRef.current, ...patch };
      optsRef.current = next;
      setOptsState(next);
      touched();
      redraw();
    },
    [optsRef, redraw, setOptsState, touched]
  );

  // Names only change the manifest, so no redraw.
  const setMeta = useCallback(
    (patch) => {
      const next = { ...metaRef.current, ...patch };
      metaRef.current = next;
      setMetaState(next);
      touched();
    },
    [metaRef, setMetaState, touched]
  );

  // ---------- export ----------
  const exportZip = useCallback(async () => {
    const s = srcRef.current;
    if (!s || busyRef.current) return;
    busyRef.current = true;
    setExportError(false);
    setSaved(null);
    setBusy({ step: 0 });
    try {
      const res = await buildPack(
        s,
        optsRef.current,
        metaRef.current,
        (step) => aliveRef.current && setBusy({ step }),
        () => !aliveRef.current
      );
      if (!res || !aliveRef.current) return;
      download(res.blob, ZIP_NAME);
      setSaved({ size: res.blob.size, count: res.count });
      toast('ok', COPY.saved(res.count, fmt(res.blob.size)));
    } catch {
      if (!aliveRef.current) return;
      setExportError(true);
      toast('bad', COPY.zipFailed);
    } finally {
      busyRef.current = false;
      if (aliveRef.current) setBusy(null);
    }
  }, [metaRef, optsRef, srcRef, toast]);

  // ---------- code ----------
  const code = useMemo(() => (codeTab === 'html' ? headText(opts) : manifestText(opts, meta)), [codeTab, meta, opts]);

  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast('ok', COPY.copied);
    } catch {
      toast('bad', COPY.copyFailed);
    }
  }, [code, toast]);

  // ---------- derived ----------
  const bg = bgColour(opts);
  let warn = null;
  if (src && !src.svg) {
    const across = Math.min(src.w, src.h);
    if (across < SHARP_MIN) warn = COPY.soft(across);
    else if (src.w !== src.h) warn = COPY.notSquare;
  }

  // ---------- lifetime ----------
  // Paste a logo anywhere on the page. Text pastes carry no files and pass through.
  useEffect(() => {
    const onPaste = (e) => {
      const file = [...(e.clipboardData?.files || [])][0];
      if (!file) return;
      e.preventDefault();
      load(file);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [load]);

  // Revoke the logo's object URL on unmount. Checked a tick later so StrictMode's test remount and
  // Vite hot reloads don't break live previews.
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      setTimeout(() => {
        if (aliveRef.current) return;
        clearTimeout(timerRef.current);
        dropUrl(srcRef.current);
      }, 0);
    };
  }, [srcRef]);

  return {
    src,
    loading,
    error,
    warn,
    load,
    loadSample,
    opts,
    bg,
    setOpt,
    meta,
    setMeta,
    icons,
    busy,
    saved,
    exportError,
    exportZip,
    codeTab,
    setCodeTab,
    code,
    copyCode,
  };
}
