/**
 * pdfLayout
 * Path: src/features/pdf/pdfLayout.js
 *
 * Pure page maths and drawing: page size per image, where the image sits on the page,
 * reading a file into a page, the preview thumbnail, the page JPEG and the whole PDF.
 * No React.
 */
import { canvas, decodeHeic, isHeic, pdf } from '../../lib/konvaEngine';
import { LoadError, openImage } from '../studio/studioFiles';
import {
  COPY,
  DEFAULT_NAME,
  JPEG_QUALITY,
  MARGINS,
  MAX_PAGE_PT,
  MAX_SIDE,
  PAGE_SIZES,
  PX_TO_PT,
  THUMB_QUALITY,
  THUMB_SIDE,
} from './pdfConstants';

export class PageError extends Error {
  constructor(page) {
    super(`Couldn’t draw ${page}`);
    this.page = page;
  }
}

// ---------- reading ----------

let seq = 0;
export const createPage = (file) => ({
  id: `p${Date.now().toString(36)}${(seq++).toString(36)}`,
  file,
  name: file.name || 'pasted-image.png',
  size: file.size || 0,
  status: 'loading', // loading | ready
  url: null,
  img: null,
  w: 0,
  h: 0,
  thumb: null,
});

// The preview is drawn on white, exactly as the page will be, so transparent areas match.
export function makeThumb(img, w, h) {
  const k = Math.min(1, THUMB_SIDE / Math.max(w, h));
  const c = canvas(w * k, h * k);
  const x = c.getContext('2d');
  x.fillStyle = '#FFFFFF';
  x.fillRect(0, 0, c.width, c.height);
  x.imageSmoothingQuality = 'high';
  x.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', THUMB_QUALITY);
}

// Decode with the browser first; only HEIC falls back to the local decoder (lazy chunk).
// Resolves with the fields to merge into the page. The caller owns the returned url.
export async function readPage(file) {
  let url = URL.createObjectURL(file);
  let img;
  try {
    img = await openImage(url);
  } catch {
    URL.revokeObjectURL(url);
    url = null;
    if (!isHeic(file)) throw new LoadError(COPY.badFile);
    try {
      url = URL.createObjectURL(await decodeHeic(file));
      img = await openImage(url);
    } catch {
      if (url) URL.revokeObjectURL(url);
      throw new LoadError(COPY.heicFail);
    }
  }
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  try {
    return { url, img, w, h, thumb: makeThumb(img, w, h), status: 'ready' };
  } catch {
    URL.revokeObjectURL(url);
    throw new LoadError(COPY.badFile);
  }
}

// ---------- layout ----------

// Page size in points. "Fit image" pages wrap the image at 96 dpi plus the margins.
export function pageSize(page, opts) {
  const m = MARGINS[opts.margin] ?? 0;
  const w = page.w || 3;
  const h = page.h || 4;
  if (opts.size === 'fit') {
    const k = Math.min(PX_TO_PT, (MAX_PAGE_PT - 2 * m) / Math.max(w, h));
    return { pw: w * k + 2 * m, ph: h * k + 2 * m, m };
  }
  const [a, b] = PAGE_SIZES[opts.size] || PAGE_SIZES.a4;
  const land = opts.orient === 'landscape' || (opts.orient === 'auto' && w > h);
  return land ? { pw: b, ph: a, m } : { pw: a, ph: b, m };
}

// Where the image goes. src is the part of the image that shows (in image pixels);
// dst is where it lands on the page (in points, centred, so PDF's bottom-left origin is fine).
export function placement(page, opts) {
  const { pw, ph, m } = pageSize(page, opts);
  const bw = Math.max(1, pw - 2 * m);
  const bh = Math.max(1, ph - 2 * m);
  const { w, h } = page;
  if (opts.fit === 'cover' && opts.size !== 'fit') {
    const s = Math.max(bw / w, bh / h);
    const sw = Math.min(w, bw / s);
    const sh = Math.min(h, bh / s);
    return {
      pw,
      ph,
      src: { sx: (w - sw) / 2, sy: (h - sh) / 2, sw, sh },
      dst: { x: m, y: m, w: bw, h: bh },
    };
  }
  const s = Math.min(bw / w, bh / h);
  const dw = w * s;
  const dh = h * s;
  return {
    pw,
    ph,
    src: { sx: 0, sy: 0, sw: w, sh: h },
    dst: { x: m + (bw - dw) / 2, y: m + (bh - dh) / 2, w: dw, h: dh },
  };
}

// ---------- drawing ----------

// Only the part of the image that shows is drawn, on white, at most MAX_SIDE across.
export function drawPage(page, place) {
  const { sx, sy, sw, sh } = place.src;
  const k = Math.min(1, MAX_SIDE / Math.max(sw, sh));
  const c = canvas(sw * k, sh * k);
  const x = c.getContext('2d');
  if (!x) throw new Error('no 2d context');
  x.fillStyle = '#FFFFFF';
  x.fillRect(0, 0, c.width, c.height);
  x.imageSmoothingQuality = 'high';
  x.drawImage(page.img, sx, sy, sw, sh, 0, 0, c.width, c.height);
  return c;
}

// toDataURL is synchronous. Chrome runs toBlob in idle time, which stalls while the
// progress bar animates, so a multi-page export would crawl.
export function jpegBytes(c) {
  const url = c.toDataURL('image/jpeg', JPEG_QUALITY);
  if (!url.startsWith('data:image/jpeg')) throw new Error('encode failed');
  const bin = atob(url.slice(url.indexOf(',') + 1));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// Let the progress bar paint between pages. The timeout keeps it moving in a background tab.
const nextPaint = () =>
  new Promise((resolve) => {
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      resolve();
    };
    requestAnimationFrame(() => setTimeout(go, 0));
    setTimeout(go, 50);
  });

// onStep(i) before page i, then onStep(pages.length) while the file is assembled.
// Resolves with a PDF Blob, or null if cancelled. Throws PageError naming the page that failed.
export async function buildPdf(pages, opts, onStep, isCancelled) {
  const out = [];
  for (let i = 0; i < pages.length; i++) {
    onStep(i);
    await nextPaint();
    if (isCancelled()) return null;
    const page = pages[i];
    try {
      const place = placement(page, opts);
      const c = drawPage(page, place);
      const jpeg = jpegBytes(c);
      out.push({ pw: place.pw, ph: place.ph, ...place.dst, iw: c.width, ih: c.height, jpeg });
      c.width = 0; // release the bitmap before the next page
      c.height = 0;
    } catch {
      throw new PageError(page.name);
    }
  }
  onStep(pages.length);
  await nextPaint();
  if (isCancelled()) return null;
  return pdf(out);
}

// ---------- labels ----------

export function fileName(raw) {
  const base = String(raw || '')
    .trim()
    .replace(/\.pdf$/i, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '-')
    .slice(0, 120);
  return `${base || DEFAULT_NAME}.pdf`;
}

export function dimsLabel(opts) {
  if (opts.size === 'fit') return 'per image';
  const land = opts.orient === 'landscape';
  if (opts.size === 'letter') return land ? '11 × 8.5 in' : '8.5 × 11 in';
  return land ? '297 × 210 mm' : '210 × 297 mm';
}

export const marginLabel = (opts) => `${Math.round(((MARGINS[opts.margin] ?? 0) / 72) * 25.4)} mm`;
