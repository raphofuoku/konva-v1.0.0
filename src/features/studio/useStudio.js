/**
 * useStudio
 * Path: src/features/studio/useStudio.js
 *
 * All Studio state and actions. No UI.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  analyse,
  avifSupported,
  canvas,
  download,
  fmt,
  geom,
  isImage,
  loadSegmenter,
  outName,
  removeBg,
  toBlob,
  zip,
} from '../../lib/konvaEngine';
import { takeHandoff } from '../../lib/handoff';
import { useToast } from '../../components/ui/Toasts';
import { useRefState } from '../../hooks/useRefState';
import {
  COPY,
  DEFAULT_AREA,
  DEFAULT_KEYS,
  DEFAULT_RENAME,
  DEFAULT_TOOL,
  ESTIMATE_DELAY,
  HISTORY_MAX,
  TOOL_IDS,
  ZIP_NAME,
} from './studioConstants';
import { readDefaults, readHistory, readModelCached, writeDefaults, writeHistory, writeModelCached } from './studioStorage';
import {
  LoadError,
  blobToDataUrl,
  createRecord,
  listFolderImages,
  nameFromUrl,
  openImage,
  readImage,
  recordUrls,
  revokeAll,
  snapshotSource,
  uniqueName,
} from './studioFiles';
import {
  previewUrls,
  quickEstimate,
  renderExport,
  renderPng,
  renderPreview,
  resultKey,
  settingsOf,
  srcsetEntries,
  srcsetPlan,
} from './studioRender';

/*
  useStudio(): all Studio state and actions. No UI.

  Tool         tool, setTool(id)                     (synced with location.hash)
  Files        files, selected, selIndex, counts, totalSize
               addFiles(list), removeFile(id), retryFile(id), clearFiles()
               select(indexOrId), next(), prev()
  Settings     settings (selected file), globalSettings, scope ('all' | 'this')
               set(patchOrFn), setScope(scope), resetFile()
  Output       geometry, estimate { size, q, miss, unsupported, failed, wasm, approx }, estimating, flash
  Export       rename, setRename, outputName, downloadCurrent(), downloadAll(dir?), busy, cancelBusy()
               history, clearHistory()
  Background   model, modelProgress, modelCached, loadModel(), removeBackground(), restoreOriginal(), bgBusy
  Redact       areas, addArea(area?), updateArea(i, patch), removeArea(i), clearAreas(), nudgeArea(dx, dy)
  Intake       openFolder(), saveFolder(), fetchUrl(url), fetching   (paste is handled here too)
  Dev          dev, closeDev(), copyDev(), copyImage(), copyBase64(), showSrcset(), srcsetZip(), share()
  Capabilities caps { avif, folder, clipboardImage, share }
*/

const nextFrame = () => new Promise((r) => setTimeout(r, 30)); // lets the progress paint between files
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function clampArea(a) {
  let { x, y, w, h } = a;
  if (w < 0) {
    x += w;
    w = -w;
  }
  if (h < 0) {
    y += h;
    h = -h;
  }
  w = clamp(w, 0.005, 1);
  h = clamp(h, 0.005, 1);
  return { x: clamp(x, 0, 1 - w), y: clamp(y, 0, 1 - h), w, h };
}

function detectCaps() {
  let share = false;
  try {
    share =
      typeof navigator.share === 'function' &&
      !!navigator.canShare?.({ files: [new File([''], 'konva.png', { type: 'image/png' })] });
  } catch {
    share = false;
  }
  return {
    avif: avifSupported(),
    folder: typeof window.showDirectoryPicker === 'function',
    clipboardImage: typeof window.ClipboardItem === 'function' && typeof navigator.clipboard?.write === 'function',
    share,
  };
}

export function useStudio() {
  const toast = useToast();
  const navigate = useNavigate();
  const { hash } = useLocation();

  // ---------- state ----------
  const [files, setFiles, filesRef] = useRefState([]);
  const [selId, setSelId, selIdRef] = useRefState(null);
  const [globalSettings, setGlobal, globalRef] = useRefState(readDefaults);
  const [rename, setRename, renameRef] = useRefState(DEFAULT_RENAME);
  const [busy, setBusy, busyRef] = useRefState(null); // { done, total, name, cancellable? } while exporting
  const [model, setModel, modelRef] = useRefState(() => (readModelCached() ? 'ready' : 'none'));
  const [modelCached, setModelCached] = useState(readModelCached);
  const [modelProgress, setModelProgress] = useState({ loaded: 0, total: 0, pct: 0 });
  const [bgBusy, setBgBusy, bgBusyRef] = useRefState(false);
  const [dev, setDev, devRef] = useRefState(null); // { kind, title, code, plan? }
  const [history, setHistory] = useState(readHistory);
  const [fetching, setFetching] = useState(false);
  const [flash, setFlash] = useState(0); // bump to replay the halo flash
  const [caps] = useState(detectCaps);

  const aliveRef = useRef(true);
  const removedRef = useRef(new Set()); // ids removed while async work was still running
  const tokenRef = useRef(0); // latest estimate wins
  const cancelRef = useRef(false);
  const segReadyRef = useRef(false);
  const defaultsDirtyRef = useRef(false);
  const handoffDoneRef = useRef(false);

  // ---------- derived ----------
  const selected = files.find((r) => r.id === selId) || files[0] || null;
  const selIndex = selected ? files.indexOf(selected) : -1;
  const settings = settingsOf(selected, globalSettings);
  const scope = selected?.ovr ? 'this' : 'all';
  const isReady = selected?.status === 'ready' && !!selected.img;
  const geometry = isReady ? geom(selected.w, selected.h, settings) : null;
  const selKey = isReady ? resultKey(selected, settings) : null;
  const isFresh = !!(selKey && selected.res && selected.res.key === selKey);

  let estimate = null;
  if (isReady && geometry) {
    if (isFresh) {
      const r = selected.res;
      estimate = { size: r.size, q: r.q, miss: r.miss, unsupported: r.unsupported, failed: r.failed, wasm: r.wasm, approx: false };
    } else {
      estimate = { ...quickEstimate(selected, settings, geometry), miss: false, unsupported: false, failed: false, wasm: false, approx: true };
    }
  }

  const hashTool = hash.replace(/^#/, '');
  const tool = TOOL_IDS.includes(hashTool) ? hashTool : DEFAULT_TOOL;

  const counts = files.reduce(
    (c, r) => {
      c[r.status] += 1;
      return c;
    },
    { loading: 0, ready: 0, error: 0 }
  );
  const totalSize = files.reduce((sum, r) => sum + (r.size || 0), 0);
  const outputName = isReady && geometry ? outName(rename, selected, selIndex, settings, geometry) : '';

  // ---------- small helpers ----------
  const getSelected = useCallback(() => {
    const list = filesRef.current;
    return list.find((r) => r.id === selIdRef.current) || list[0] || null;
  }, [filesRef, selIdRef]);

  const patchFile = useCallback(
    (id, patch) =>
      setFiles((list) => list.map((r) => (r.id === id ? { ...r, ...(typeof patch === 'function' ? patch(r) : patch) } : r))),
    [setFiles]
  );

  const isGone = useCallback((id) => !aliveRef.current || removedRef.current.has(id), []);

  const pushHistory = useCallback((name, detail) => {
    setHistory((prev) => {
      const next = [{ name, detail, at: Date.now() }, ...prev].slice(0, HISTORY_MAX);
      writeHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    writeHistory([]);
  }, []);

  // Fresh result for f with settings s: the cached encode when it matches, otherwise encode now.
  const ensureResult = useCallback(
    async (f, s) => {
      const r = f.res;
      if (r && r.key === resultKey(f, s) && (r.blob || r.unsupported)) {
        return { blob: r.blob, miss: r.miss, unsupported: r.unsupported, fellBack: false, settings: s, g: geom(f.w, f.h, s) };
      }
      return renderExport(f, s, caps.avif);
    },
    [caps.avif]
  );

  // ---------- tool ----------
  const setTool = useCallback(
    (id) => {
      if (TOOL_IDS.includes(id)) navigate({ hash: `#${id}` }, { replace: true });
    },
    [navigate]
  );

  // ---------- files ----------
  const loadOne = useCallback(
    async (rec) => {
      try {
        const data = await readImage(rec.file);
        if (isGone(rec.id)) {
          URL.revokeObjectURL(data.url);
          return;
        }
        patchFile(rec.id, { ...data, status: 'ready', error: null });
      } catch (e) {
        if (isGone(rec.id)) return;
        patchFile(rec.id, { status: 'error', error: e instanceof LoadError ? e.message : COPY.badFile });
      }
    },
    [isGone, patchFile]
  );

  const addFiles = useCallback(
    async (list) => {
      const all = [...(list || [])];
      const imgs = all.filter(isImage);
      if (!imgs.length) {
        if (all.length) toast('bad', COPY.noImages);
        return 0;
      }
      const skipped = all.length - imgs.length;
      if (skipped) toast('info', `Skipped ${plural(skipped, 'file')} that ${skipped === 1 ? 'isn’t an image' : 'aren’t images'}.`);

      const added = imgs.map(createRecord);
      setFiles((prev) => [...prev, ...added]);
      setSelId(added[0].id); // jump to the first new file
      for (const rec of added) {
        if (!aliveRef.current) break;
        await loadOne(rec); // one at a time keeps memory flat on big batches
      }
      return added.length;
    },
    [loadOne, setFiles, setSelId, toast]
  );

  const retryFile = useCallback(
    (id) => {
      const rec = filesRef.current.find((r) => r.id === id);
      if (!rec || rec.status === 'loading') return;
      patchFile(id, { status: 'loading', error: null });
      loadOne(rec);
    },
    [filesRef, loadOne, patchFile]
  );

  const removeFile = useCallback(
    (id) => {
      const list = filesRef.current;
      const idx = list.findIndex((r) => r.id === id);
      if (idx < 0) return;
      removedRef.current.add(id);
      if (selIdRef.current === id || (!selIdRef.current && idx === 0)) {
        const neighbour = list[idx + 1] || list[idx - 1];
        setSelId(neighbour ? neighbour.id : null);
      }
      setFiles((prev) => prev.filter((r) => r.id !== id));
      revokeAll(recordUrls(list[idx]));
    },
    [filesRef, selIdRef, setFiles, setSelId]
  );

  const clearFiles = useCallback(() => {
    const list = filesRef.current;
    list.forEach((r) => removedRef.current.add(r.id));
    setFiles([]);
    setSelId(null);
    revokeAll(list.flatMap(recordUrls));
  }, [filesRef, setFiles, setSelId]);

  const select = useCallback(
    (target) => {
      const list = filesRef.current;
      const rec = typeof target === 'number' ? list[target] : list.find((r) => r.id === target);
      if (rec) setSelId(rec.id);
    },
    [filesRef, setSelId]
  );

  const step = useCallback(
    (d) => {
      const list = filesRef.current;
      if (list.length < 2) return;
      const i = Math.max(0, list.findIndex((r) => r.id === selIdRef.current));
      setSelId(list[(i + d + list.length) % list.length].id);
    },
    [filesRef, selIdRef, setSelId]
  );
  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  // ---------- settings ----------
  // In 'this' scope the patch goes into the file's override; otherwise into the global settings.
  const set = useCallback(
    (patch) => {
      const f = getSelected();
      if (f?.ovr) {
        setFiles((list) =>
          list.map((r) => {
            if (r.id !== f.id) return r;
            const p = typeof patch === 'function' ? patch(settingsOf(r, globalRef.current)) : patch;
            return { ...r, ovr: { ...r.ovr, ...p } };
          })
        );
        return;
      }
      setGlobal((prevS) => {
        const p = typeof patch === 'function' ? patch(prevS) : patch;
        if (DEFAULT_KEYS.some((k) => k in p && p[k] !== prevS[k])) defaultsDirtyRef.current = true;
        return { ...prevS, ...p };
      });
    },
    [getSelected, globalRef, setFiles, setGlobal]
  );

  const setScope = useCallback(
    (next) => {
      const f = getSelected();
      if (!f) return;
      if (next === 'this' && !f.ovr) patchFile(f.id, { ovr: {} });
      if (next === 'all' && f.ovr) patchFile(f.id, { ovr: null });
    },
    [getSelected, patchFile]
  );

  const resetFile = useCallback(() => setScope('all'), [setScope]);

  // Save format, quality, mode, target and strip whenever the global values change.
  useEffect(() => {
    if (!defaultsDirtyRef.current) return;
    defaultsDirtyRef.current = false;
    writeDefaults(globalSettings);
  }, [globalSettings]);

  // ---------- estimate ----------
  const runEstimate = useCallback(
    async (id, key) => {
      const f = filesRef.current.find((r) => r.id === id);
      if (!f || f.status !== 'ready' || !f.img) return;
      if (f.res && f.res.key === key) return; // already fresh
      const s = settingsOf(f, globalRef.current);
      if (resultKey(f, s) !== key) return; // settings moved on; a newer run is scheduled
      const token = ++tokenRef.current;

      let made;
      try {
        made = await renderPreview(f, s, caps.avif, key);
      } catch {
        made = { res: { key, blob: null, url: null, size: null, q: null, miss: false, wasm: false, unsupported: false, failed: true }, before: null, rotUrl: null };
      }

      const cur = filesRef.current.find((r) => r.id === id);
      if (token !== tokenRef.current || isGone(id) || !cur || cur.v !== f.v) {
        revokeAll(previewUrls(made));
        return;
      }
      const old = [cur.res?.url, cur.before, cur.rotUrl].filter(Boolean);
      const wasSmaller = cur.res?.size != null && cur.res.size < cur.size;
      const smaller = made.res.size != null && made.res.size < cur.size;
      patchFile(id, { res: made.res, before: made.before, rotUrl: made.rotUrl });
      revokeAll(old);
      if (smaller && !wasSmaller) setFlash((n) => n + 1);
    },
    [caps.avif, filesRef, globalRef, isGone, patchFile]
  );

  const selectedId = selected?.id ?? null;
  useEffect(() => {
    if (!selKey || !selectedId) return undefined;
    const cur = filesRef.current.find((r) => r.id === selectedId);
    if (cur?.res?.key === selKey) return undefined;
    const t = setTimeout(() => runEstimate(selectedId, selKey), ESTIMATE_DELAY);
    return () => clearTimeout(t);
  }, [filesRef, runEstimate, selKey, selectedId]);

  // ---------- export ----------
  const downloadCurrent = useCallback(async () => {
    if (busyRef.current) return;
    const f = getSelected();
    if (!f) return toast('info', COPY.addFirst);
    if (f.status === 'loading') return toast('info', COPY.stillReading);
    if (f.status === 'error') return toast('bad', f.error || COPY.badFile);

    const s = settingsOf(f, globalRef.current);
    setBusy({ done: 0, total: 1, name: f.name });
    try {
      const r = await ensureResult(f, s);
      if (r.unsupported) return toast('bad', COPY.avifMissing);
      if (!r.blob) return toast('bad', COPY.tooLarge);
      const index = Math.max(0, filesRef.current.findIndex((x) => x.id === f.id));
      const name = outName(renameRef.current, f, index, r.settings, r.g);
      download(r.blob, name);
      toast('ok', `${name} saved · ${fmt(f.size)} → ${fmt(r.blob.size)}`);
      if (r.miss) toast('info', `Couldn’t reach ${s.targetKB} KB, so it was saved at the lowest quality.`);
      if (r.blob.size < f.size) setFlash((n) => n + 1);
      pushHistory(name, `${r.settings.format.toUpperCase()} · ${fmt(r.blob.size)}`);
    } catch {
      toast('bad', COPY.exportFailed);
    } finally {
      setBusy(null);
    }
  }, [busyRef, ensureResult, filesRef, getSelected, globalRef, pushHistory, renameRef, setBusy, toast]);

  // Every ready file as one ZIP, or straight into a folder when a directory handle is passed.
  const downloadAll = useCallback(
    async (dir) => {
      if (busyRef.current) return;
      const all = filesRef.current;
      if (!all.length) return toast('info', COPY.addFirst);
      const list = all.map((f, i) => ({ f, i })).filter(({ f }) => f.status === 'ready' && f.img);
      if (!list.length) return toast('bad', COPY.noneReadable);

      const toFolder = typeof dir?.getFileHandle === 'function';
      const total = list.length;
      const entries = [];
      const used = new Set();
      let tin = 0;
      let tout = 0;
      let done = 0;
      let misses = 0;
      let fellBack = 0;
      let current = '';
      cancelRef.current = false;

      try {
        for (const { f, i } of list) {
          if (cancelRef.current || !aliveRef.current) break;
          current = f.name;
          setBusy({ done, total, name: f.name, cancellable: true });
          await nextFrame();
          const s = settingsOf(f, globalRef.current);
          const r = await renderExport(f, s, caps.avif, { fallback: true });
          if (!r.blob) throw new Error('encode failed');
          const name = uniqueName(outName(renameRef.current, f, i, r.settings, r.g), used);
          if (toFolder) {
            const handle = await dir.getFileHandle(name, { create: true });
            const w = await handle.createWritable();
            await w.write(r.blob);
            await w.close();
          } else {
            entries.push({ name, data: new Uint8Array(await r.blob.arrayBuffer()) });
          }
          tin += f.size;
          tout += r.blob.size;
          done += 1;
          if (r.miss) misses += 1;
          if (r.fellBack) fellBack += 1;
          setBusy({ done, total, name: f.name, cancellable: true });
        }
      } catch {
        setBusy(null);
        toast('bad', `Export stopped after ${done} of ${total}: ${current} couldn’t be saved.${toFolder ? '' : ' Nothing was downloaded.'}`);
        return;
      }

      setBusy(null);
      if (!aliveRef.current) return;
      if (cancelRef.current) {
        toast('info', `Stopped after ${done} of ${total}. ${toFolder ? `${plural(done, 'file')} saved to the folder.` : 'Nothing was saved.'}`);
        return;
      }
      if (!toFolder) download(zip(entries), ZIP_NAME);
      toast('ok', `${plural(done, 'file')} · ${fmt(tin)} → ${fmt(tout)} · ${toFolder ? 'saved to the folder' : ZIP_NAME}`);
      if (misses) toast('info', `${plural(misses, 'file')} couldn’t reach the target size and ${misses === 1 ? 'was' : 'were'} saved at the lowest quality.`);
      if (fellBack) toast('info', `The AVIF encoder didn’t load, so ${plural(fellBack, 'file')} ${fellBack === 1 ? 'was' : 'were'} saved as WEBP.`);
      if (tout < tin) setFlash((n) => n + 1);
      pushHistory(toFolder ? `${plural(done, 'file')} to a folder` : ZIP_NAME, `${plural(done, 'file')} · ${fmt(tout)}`);
    },
    [busyRef, caps.avif, filesRef, globalRef, pushHistory, renameRef, setBusy, toast]
  );

  const cancelBusy = useCallback(() => {
    cancelRef.current = true;
  }, []);

  // ---------- background removal ----------
  const loadModel = useCallback(
    async ({ quiet = false } = {}) => {
      if (segReadyRef.current) return true;
      if (modelRef.current === 'loading') return false;
      const wasCached = readModelCached();
      setModel('loading');
      setModelProgress({ loaded: 0, total: 0, pct: 0 });
      try {
        await loadSegmenter((loaded, total) => {
          if (aliveRef.current) setModelProgress({ loaded, total, pct: total ? Math.min(99, Math.round((loaded / total) * 100)) : 0 });
        });
        segReadyRef.current = true;
        writeModelCached();
        if (aliveRef.current) {
          setModelCached(true);
          setModel('ready');
          setModelProgress((p) => ({ ...p, pct: 100 }));
        }
        if (!quiet && !wasCached) toast('ok', COPY.modelCached);
        return true;
      } catch {
        if (aliveRef.current) setModel('error');
        toast('bad', COPY.modelFailed);
        return false;
      }
    },
    [modelRef, setModel, toast]
  );

  // Cuts out the selected file. The cut-out becomes the working image; the original is kept for compare and restore.
  const removeBackground = useCallback(async () => {
    const f = getSelected();
    if (!f || f.status !== 'ready' || !f.img) return toast('info', COPY.addFirst);
    if (bgBusyRef.current || busyRef.current) return;
    setBgBusy(true);
    let url = null;
    try {
      if (!(await loadModel({ quiet: readModelCached() }))) return;
      toast('info', COPY.bgRunning);
      const src = canvas(f.w, f.h);
      src.getContext('2d').drawImage(f.img, 0, 0, f.w, f.h); // works for HEIC too, unlike passing the raw file
      const cut = await removeBg(src);
      const blob = await toBlob(cut, 'image/png');
      if (!blob) throw new Error('PNG encode failed');

      const base = (f.orig ? f.orig.name : f.name).replace(/\.[^.]+$/, '');
      const name = `${base}-cutout.png`;
      const file = new File([blob], name, { type: 'image/png', lastModified: Date.now() });
      url = URL.createObjectURL(file);
      const img = await openImage(url);
      const info = await analyse(file, img);

      const cur = filesRef.current.find((r) => r.id === f.id);
      if (isGone(f.id) || !cur) {
        URL.revokeObjectURL(url);
        return;
      }
      const toPng = settingsOf(cur, globalRef.current).format === 'jpeg'; // JPEG would flatten the transparency
      const previousCutout = cur.orig ? cur.url : null;
      patchFile(f.id, (r) => ({
        file,
        name,
        type: 'image/png',
        size: blob.size,
        lastModified: file.lastModified,
        url,
        img,
        w: info.w,
        h: info.h,
        alpha: info.alpha,
        palette: info.palette,
        exif: info.exif,
        orig: r.orig || snapshotSource(r),
        v: r.v + 1,
        ovr: toPng ? { ...(r.ovr || {}), format: 'png' } : r.ovr,
      }));
      url = null; // adopted by the record
      if (previousCutout) URL.revokeObjectURL(previousCutout);
      toast('ok', toPng ? `Background removed. ${name} will save as PNG to keep the transparency.` : `Background removed. ${name} is now the source.`);
    } catch {
      if (url) URL.revokeObjectURL(url);
      toast('bad', COPY.bgFailed);
    } finally {
      setBgBusy(false);
    }
  }, [bgBusyRef, busyRef, filesRef, getSelected, globalRef, isGone, loadModel, patchFile, setBgBusy, toast]);

  const restoreOriginal = useCallback(() => {
    const f = getSelected();
    if (!f?.orig) return;
    const cutoutUrl = f.url;
    patchFile(f.id, (r) => ({ ...r.orig, orig: null, v: r.v + 1 }));
    URL.revokeObjectURL(cutoutUrl);
    toast('ok', COPY.restored);
  }, [getSelected, patchFile, toast]);

  // ---------- redact ----------
  const editAreas = useCallback(
    (fn) => {
      const f = getSelected();
      if (f?.status === 'ready') patchFile(f.id, (r) => ({ areas: fn(r.areas) }));
    },
    [getSelected, patchFile]
  );
  const addArea = useCallback((area = DEFAULT_AREA) => editAreas((a) => [...a, clampArea(area)]), [editAreas]);
  const updateArea = useCallback(
    (i, patch) => editAreas((a) => a.map((x, j) => (j === i ? clampArea({ ...x, ...patch }) : x))),
    [editAreas]
  );
  const removeArea = useCallback((i) => editAreas((a) => a.filter((_, j) => j !== i)), [editAreas]);
  const clearAreas = useCallback(() => editAreas(() => []), [editAreas]);
  // dx, dy are fractions of the output size: NUDGE.step for an arrow key, NUDGE.big with Shift.
  const nudgeArea = useCallback(
    (dx, dy) =>
      editAreas((a) => {
        if (!a.length) return a;
        const last = a[a.length - 1];
        return [...a.slice(0, -1), clampArea({ ...last, x: last.x + dx, y: last.y + dy })];
      }),
    [editAreas]
  );

  // ---------- intake ----------
  const openFolder = useCallback(async () => {
    if (!caps.folder) return;
    try {
      const dir = await window.showDirectoryPicker();
      const found = await listFolderImages(dir);
      if (!found.length) return toast('info', COPY.folderEmpty);
      await addFiles(found);
    } catch (e) {
      if (e?.name !== 'AbortError') toast('bad', COPY.folderFailed);
    }
  }, [addFiles, caps.folder, toast]);

  const saveFolder = useCallback(async () => {
    if (!caps.folder) return;
    if (!filesRef.current.length) return toast('info', COPY.addFirst);
    let dir;
    try {
      dir = await window.showDirectoryPicker({ mode: 'readwrite' });
    } catch (e) {
      if (e?.name !== 'AbortError') toast('bad', COPY.folderFailed);
      return;
    }
    await downloadAll(dir);
  }, [caps.folder, downloadAll, filesRef, toast]);

  // Only a GET to the address the person typed; no image data leaves the device.
  const fetchUrl = useCallback(
    async (raw) => {
      const target = (raw || '').trim();
      if (!target) return false;
      setFetching(true);
      try {
        const res = await fetch(target);
        if (!res.ok) throw new Error('fetch failed');
        const blob = await res.blob();
        if (!blob.type.startsWith('image/')) {
          toast('bad', COPY.notImage);
          return false;
        }
        await addFiles([new File([blob], nameFromUrl(target, blob.type), { type: blob.type })]);
        return true;
      } catch {
        toast('bad', COPY.urlBlocked);
        return false;
      } finally {
        setFetching(false);
      }
    },
    [addFiles, toast]
  );

  // Paste images anywhere in Studio. Text pastes carry no files and pass through untouched.
  useEffect(() => {
    const onPaste = (e) => {
      const pasted = [...(e.clipboardData?.files || [])];
      if (!pasted.length) return;
      e.preventDefault();
      addFiles(pasted);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [addFiles]);

  // Files dropped on Home. Guarded so StrictMode's double effect run doesn't drop them.
  useEffect(() => {
    if (handoffDoneRef.current) return;
    handoffDoneRef.current = true;
    const list = takeHandoff();
    if (list.length) addFiles(list);
  }, [addFiles]);

  // ---------- dev actions ----------
  const closeDev = useCallback(() => setDev(null), [setDev]);

  const copyDev = useCallback(async () => {
    const d = devRef.current;
    if (!d) return;
    try {
      await navigator.clipboard.writeText(d.code);
      toast('ok', `${d.title} copied.`);
    } catch {
      toast('bad', COPY.devCopyBlocked);
    }
  }, [devRef, toast]);

  const copyImage = useCallback(async () => {
    const f = getSelected();
    if (f?.status !== 'ready') return toast('info', COPY.addFirst);
    if (!caps.clipboardImage) return toast('bad', COPY.clipboardBlocked);
    try {
      // Passing the promise keeps the click's user activation in Safari while the PNG renders.
      const png = renderPng(f, settingsOf(f, globalRef.current));
      await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': png })]);
      toast('ok', 'Result copied to the clipboard as PNG.');
    } catch {
      toast('bad', COPY.clipboardBlocked);
    }
  }, [caps.clipboardImage, getSelected, globalRef, toast]);

  const copyBase64 = useCallback(async () => {
    const f = getSelected();
    if (f?.status !== 'ready') return toast('info', COPY.addFirst);
    try {
      const r = await ensureResult(f, settingsOf(f, globalRef.current));
      if (!r.blob) return toast('bad', r.unsupported ? COPY.avifMissing : COPY.tooLarge);
      const code = await blobToDataUrl(r.blob);
      setDev({ kind: 'base64', title: 'Base64 data URI', code, bytes: r.blob.size });
    } catch {
      toast('bad', COPY.exportFailed);
    }
  }, [ensureResult, getSelected, globalRef, setDev, toast]);

  const showSrcset = useCallback(() => {
    const f = getSelected();
    if (f?.status !== 'ready') return toast('info', COPY.addFirst);
    const plan = srcsetPlan(f, settingsOf(f, globalRef.current));
    setDev({ kind: 'srcset', title: 'Responsive srcset', code: plan.code, plan });
  }, [getSelected, globalRef, setDev, toast]);

  const srcsetZip = useCallback(async () => {
    const f = getSelected();
    const d = devRef.current;
    if (f?.status !== 'ready' || d?.kind !== 'srcset' || busyRef.current) return;
    const s = settingsOf(f, globalRef.current);
    try {
      const { entries, fellBack } = await srcsetEntries(f, s, d.plan, caps.avif, (done, total) =>
        setBusy({ done, total, name: `${d.plan.base} at ${d.plan.widths[done]}px` })
      );
      download(zip(entries), `${d.plan.base}-srcset.zip`);
      toast('ok', `${plural(entries.length, 'size')} zipped.`);
      if (fellBack) toast('info', 'The AVIF encoder didn’t load, so the sizes were saved as WEBP.');
    } catch {
      toast('bad', COPY.exportFailed);
    } finally {
      setBusy(null);
    }
  }, [busyRef, caps.avif, devRef, getSelected, globalRef, setBusy, toast]);

  const share = useCallback(async () => {
    if (!caps.share) return;
    const f = getSelected();
    if (f?.status !== 'ready') return toast('info', COPY.addFirst);
    const s = settingsOf(f, globalRef.current);
    try {
      const r = await ensureResult(f, s);
      if (!r.blob) return toast('bad', r.unsupported ? COPY.avifMissing : COPY.tooLarge);
      const index = Math.max(0, filesRef.current.findIndex((x) => x.id === f.id));
      const name = outName(renameRef.current, f, index, r.settings, r.g);
      await navigator.share({ files: [new File([r.blob], name, { type: r.blob.type })], title: name });
    } catch (e) {
      if (e?.name !== 'AbortError') toast('bad', COPY.shareFailed);
    }
  }, [caps.share, ensureResult, filesRef, getSelected, globalRef, renameRef, toast]);

  // ---------- lifetime ----------
  // Revoke every object URL on unmount. The check runs a tick later so StrictMode's
  // test remount and Vite hot reloads (which re-run effects) don't break live previews.
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      setTimeout(() => {
        if (aliveRef.current) return;
        cancelRef.current = true;
        revokeAll(filesRef.current.flatMap(recordUrls));
      }, 0);
    };
  }, [filesRef]);

  return {
    caps,

    tool,
    setTool,

    files,
    selected,
    selIndex,
    counts,
    totalSize,
    addFiles,
    removeFile,
    retryFile,
    clearFiles,
    select,
    next,
    prev,

    settings,
    globalSettings,
    scope,
    set,
    setScope,
    resetFile,

    geometry,
    estimate,
    estimating: !!estimate?.approx,
    flash,

    rename,
    setRename,
    outputName,
    downloadCurrent,
    downloadAll,
    busy,
    cancelBusy,
    history,
    clearHistory,

    model,
    modelProgress,
    modelCached,
    loadModel,
    removeBackground,
    restoreOriginal,
    bgBusy,

    areas: selected?.areas || [],
    addArea,
    updateArea,
    removeArea,
    clearAreas,
    nudgeArea,

    openFolder,
    saveFolder,
    fetchUrl,
    fetching,

    dev,
    closeDev,
    copyDev,
    copyImage,
    copyBase64,
    showSrcset,
    srcsetZip,
    share,
  };
}

export default useStudio;