/**
 * usePdfPages
 * Path: src/features/pdf/usePdfPages.js
 *
 * State for Images to PDF: the pages (read in order, one at a time), reorder and remove,
 * page options, the file name, and the export with progress, success and error states.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { download, fmt, isImage } from '../../lib/konvaEngine';
import { useToast } from '../../components/ui/Toasts';
import { useRefState } from '../../hooks/useRefState';
import { COPY, DEFAULT_NAME, DEFAULT_OPTS } from './pdfConstants';
import { PageError, buildPdf, createPage, fileName, readPage } from './pdfLayout';

const dropUrl = (page) => {
  if (page?.url) URL.revokeObjectURL(page.url);
};

export function usePdfPages() {
  const toast = useToast();
  const [pages, setPages, pagesRef] = useRefState([]);
  const [opts, setOptsState, optsRef] = useRefState(DEFAULT_OPTS);
  const [fname, setFnameState, fnameRef] = useRefState(DEFAULT_NAME);
  const [busy, setBusy] = useState(null); // { done, total } while writing
  const [saved, setSaved] = useState(null); // { name, count, size } after a download, cleared by any change
  const [error, setError] = useState(null); // export error text
  const [live, setLive] = useState(''); // screen reader announcement for reorder and remove

  const aliveRef = useRef(true);
  const busyRef = useRef(false);
  const queueRef = useRef(Promise.resolve()); // reads run one after another, across drops

  // Every change goes through the ref first, so reads that finish between renders and the
  // grid's focus handling never see a stale list (useRefState only syncs the ref on render).
  const commit = useCallback(
    (fn) => {
      const next = fn(pagesRef.current);
      pagesRef.current = next;
      setPages(next);
      return next;
    },
    [pagesRef, setPages]
  );

  const touched = useCallback(() => {
    setSaved(null);
    setError(null);
  }, []);

  const announce = useCallback((text) => {
    // The same sentence twice in a row would not be read again, so nudge it.
    setLive((prev) => (prev === text ? `${text} ` : text));
  }, []);

  // ---------- adding ----------
  const add = useCallback(
    (list) => {
      if (busyRef.current) return;
      const files = [...(list || [])].filter((f) => isImage(f));
      if (!files.length) {
        toast('bad', COPY.noImages);
        return;
      }
      const recs = files.map(createPage);
      commit((prev) => [...prev, ...recs]);
      touched();

      queueRef.current = queueRef.current.then(async () => {
        const failed = [];
        for (const rec of recs) {
          if (!aliveRef.current) return;
          if (!pagesRef.current.some((p) => p.id === rec.id)) continue; // removed while waiting
          try {
            const data = await readPage(rec.file);
            if (!aliveRef.current || !pagesRef.current.some((p) => p.id === rec.id)) {
              dropUrl(data);
              continue;
            }
            commit((prev) => prev.map((p) => (p.id === rec.id ? { ...p, ...data } : p)));
          } catch {
            if (!aliveRef.current) return;
            failed.push(rec.name);
            commit((prev) => prev.filter((p) => p.id !== rec.id));
          }
        }
        if (failed.length && aliveRef.current) {
          toast('bad', failed.length === 1 ? COPY.skippedOne(failed[0]) : COPY.skipped(failed.length));
        }
      });
    },
    [commit, pagesRef, toast, touched]
  );

  // ---------- order ----------
  const move = useCallback(
    (from, to) => {
      if (busyRef.current) return;
      const list = pagesRef.current;
      if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return;
      const page = list[from];
      const next = commit((prev) => {
        const l = [...prev];
        l.splice(from, 1);
        l.splice(to, 0, page);
        return l;
      });
      touched();
      announce(COPY.moved(page.name, to + 1, next.length));
    },
    [announce, commit, pagesRef, touched]
  );

  const remove = useCallback(
    (id) => {
      if (busyRef.current) return;
      const page = pagesRef.current.find((p) => p.id === id);
      if (!page) return;
      dropUrl(page);
      const next = commit((prev) => prev.filter((p) => p.id !== id));
      touched();
      announce(COPY.removed(page.name, next.length));
    },
    [announce, commit, pagesRef, touched]
  );

  const clear = useCallback(() => {
    if (busyRef.current) return;
    pagesRef.current.forEach(dropUrl);
    commit(() => []);
    touched();
    announce(COPY.cleared);
  }, [announce, commit, pagesRef, touched]);

  // ---------- options ----------
  const setOpt = useCallback(
    (patch) => {
      const next = { ...optsRef.current, ...patch };
      optsRef.current = next;
      setOptsState(next);
      touched();
    },
    [optsRef, setOptsState, touched]
  );

  const setFname = useCallback(
    (value) => {
      fnameRef.current = value;
      setFnameState(value);
      touched();
    },
    [fnameRef, setFnameState, touched]
  );

  // ---------- export ----------
  const savePdf = useCallback(async () => {
    const list = pagesRef.current;
    if (busyRef.current || !list.length || list.some((p) => p.status !== 'ready')) return;
    busyRef.current = true;
    setSaved(null);
    setError(null);
    setBusy({ done: 0, total: list.length });
    try {
      const blob = await buildPdf(
        list,
        optsRef.current,
        (done) => aliveRef.current && setBusy({ done, total: list.length }),
        () => !aliveRef.current
      );
      if (!blob || !aliveRef.current) return;
      const name = fileName(fnameRef.current);
      download(blob, name);
      setSaved({ name, count: list.length, size: blob.size });
      toast('ok', COPY.saved(name, list.length, fmt(blob.size)));
    } catch (e) {
      if (!aliveRef.current) return;
      const text = e instanceof PageError ? COPY.pageFailed(e.page) : COPY.pdfFailed;
      setError(text);
      toast('bad', text);
    } finally {
      busyRef.current = false;
      if (aliveRef.current) setBusy(null);
    }
  }, [fnameRef, optsRef, pagesRef, toast]);

  // ---------- lifetime ----------
  // Paste images anywhere on the page. Text pastes carry no files and pass through.
  useEffect(() => {
    const onPaste = (e) => {
      const files = [...(e.clipboardData?.files || [])];
      if (!files.length) return;
      e.preventDefault();
      add(files);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [add]);

  // Revoke every page's object URL on unmount. Checked a tick later so StrictMode's test
  // remount and Vite hot reloads don't break the previews.
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      setTimeout(() => {
        if (aliveRef.current) return;
        pagesRef.current.forEach(dropUrl);
      }, 0);
    };
  }, [pagesRef]);

  // ---------- derived ----------
  const loadingCount = pages.reduce((n, p) => n + (p.status === 'loading' ? 1 : 0), 0);
  const totalSize = pages.reduce((n, p) => n + p.size, 0);
  const canSave = pages.length > 0 && loadingCount === 0 && !busy;

  return {
    pages,
    pagesRef,
    loadingCount,
    totalSize,
    add,
    move,
    remove,
    clear,
    opts,
    setOpt,
    fname,
    setFname,
    busy,
    saved,
    error,
    canSave,
    savePdf,
    live,
  };
}
