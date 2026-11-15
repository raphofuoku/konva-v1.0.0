/**
 * studioRender
 * Path: src/features/studio/studioRender.js
 *
 * Settings merge, result keys, size heuristic, preview and export encodes, srcset.
 */
import { DEF, EXT, drawOutput, encode, geom, scaled, toBlob } from '../../lib/konvaEngine';
import { PREVIEW_MAX, SRCSET_WIDTHS } from './studioConstants';

const DEF_KEYS = Object.keys(DEF);

// A file with an override uses its patch over the global settings.
export const settingsOf = (f, global) => (f && f.ovr ? { ...global, ...f.ovr } : global);

// Identifies one exact output. If any setting, redact area or the working image changes, the key changes.
export const resultKey = (f, s) => JSON.stringify([DEF_KEYS.map((k) => s[k]), f.areas, f.v]);

// Instant guess shown (marked ≈) while the real encode runs. From the prototype.
const FACTOR = { jpeg: 0.24, webp: 0.17, avif: 0.12, png: 0.95 };
export function quickEstimate(f, s, g) {
  const q = s.format === 'png' ? 1 : s.mode === 'target' ? 0.62 : s.quality / 100;
  let size =
    ((f.size * (g.ow * g.oh)) / (f.w * f.h) / (f.type === 'image/jpeg' ? 0.32 : 0.25)) *
    FACTOR[s.format] *
    (0.25 + 0.75 * q * q);
  if (s.mode === 'target' && s.format !== 'png') size = Math.min(size, s.targetKB * 1024 - 3100);
  return { size: Math.max(1, Math.round(size)), q };
}

// Same geometry, no look changes: what "before" shows in the compare slider.
const NEUTRAL = { bright: 0, contrast: 0, sat: 0, gray: false, blur: 0, wmOn: false };

// Real encode of the selected file plus the two small preview images Studio shows.
// Creates object URLs; the caller adopts them or revokes them with previewUrls().
export async function renderPreview(f, s, avifOk, key) {
  const g = geom(f.w, f.h, s);
  const { out, rot } = drawOutput(f, s, g);
  const enc = await encode(out, s, avifOk);

  let beforeCanvas;
  if (f.orig) {
    // After background removal, "before" is the untouched original.
    const o = f.orig;
    const { out: plain } = drawOutput({ img: o.img, w: o.w, h: o.h, areas: [] }, { ...s, ...NEUTRAL }, geom(o.w, o.h, s));
    beforeCanvas = scaled(plain, 0, 0, plain.width, plain.height, PREVIEW_MAX);
  } else {
    beforeCanvas = scaled(rot, g.cx, g.cy, g.cw, g.ch, PREVIEW_MAX);
  }
  const type = f.alpha ? 'image/webp' : 'image/jpeg'; // keep transparency in previews
  const [beforeBlob, rotBlob] = await Promise.all([
    toBlob(beforeCanvas, type, 0.9),
    toBlob(scaled(rot, 0, 0, g.rw, g.rh, PREVIEW_MAX), type, 0.88),
  ]);

  const res = enc.blob
    ? {
        key,
        blob: enc.blob,
        url: URL.createObjectURL(enc.blob),
        size: enc.blob.size,
        q: enc.q,
        miss: !!enc.miss,
        wasm: !!enc.wasm,
        unsupported: false,
        failed: false,
        w: g.ow,
        h: g.oh,
      }
    : { key, blob: null, url: null, size: null, q: null, miss: false, wasm: false, unsupported: !!enc.unsupported, failed: !enc.unsupported, w: g.ow, h: g.oh };

  return {
    res,
    before: beforeBlob ? URL.createObjectURL(beforeBlob) : null,
    rotUrl: rotBlob ? URL.createObjectURL(rotBlob) : null,
  };
}

export const previewUrls = (p) => [p.res?.url, p.before, p.rotUrl].filter(Boolean);

// Encode for saving. With fallback, a failed AVIF (WASM didn't load) is saved as WEBP instead.
export async function renderExport(f, s, avifOk, { fallback = false } = {}) {
  const g = geom(f.w, f.h, s);
  const { out } = drawOutput(f, s, g);
  let used = s;
  let enc = await encode(out, s, avifOk);
  if (!enc.blob && enc.unsupported && fallback) {
    used = { ...s, format: 'webp' };
    enc = await encode(out, used, avifOk);
  }
  return {
    blob: enc.blob || null,
    q: enc.q ?? null,
    miss: !!enc.miss,
    unsupported: !enc.blob && !!enc.unsupported,
    fellBack: used !== s,
    settings: used,
    g,
  };
}

// Lossless PNG of the current edit, for the clipboard.
export async function renderPng(f, s) {
  const g = geom(f.w, f.h, s);
  const blob = await toBlob(drawOutput(f, s, g).out, 'image/png');
  if (!blob) throw new Error('PNG encode failed');
  return blob;
}

const stem = (name) =>
  (name || 'image')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/^-+|-+$/g, '') || 'image';

// Widths below the current output width, plus the output width itself.
export function srcsetPlan(f, s) {
  const g = geom(f.w, f.h, s);
  const widths = [...new Set([...SRCSET_WIDTHS.filter((w) => w < g.ow), g.ow])];
  const base = stem(f.name);
  const ext = EXT[s.format];
  const mid = widths[Math.min(widths.length - 1, 2)];
  const code = [
    '<img',
    `  src="${base}-${mid}.${ext}"`,
    `  srcset="${widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(',\n          ')}"`,
    `  sizes="(max-width: ${mid}px) 100vw, ${mid}px"`,
    `  width="${g.ow}" height="${g.oh}"`,
    '  alt=""',
    '  loading="lazy">',
  ].join('\n');
  return { widths, base, ext, code };
}

// One encoded file per srcset width, ready for zip().
export async function srcsetEntries(f, s, plan, avifOk, onProgress) {
  const entries = [];
  let fellBack = false;
  for (const [i, w] of plan.widths.entries()) {
    onProgress?.(i, plan.widths.length);
    const sized = { ...s, resizeMode: 'px', width: w, height: null, lock: true };
    const r = await renderExport(f, sized, avifOk, { fallback: true });
    if (!r.blob) throw new Error(`encode failed at ${w}px`);
    if (r.fellBack) fellBack = true;
    entries.push({ name: `${plan.base}-${w}.${EXT[r.settings.format]}`, data: new Uint8Array(await r.blob.arrayBuffer()) });
  }
  return { entries, fellBack };
}