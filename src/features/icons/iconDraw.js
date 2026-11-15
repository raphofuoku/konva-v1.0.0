/**
 * iconDraw
 * Path: src/features/icons/iconDraw.js
 *
 * Pure helpers for the Icon pack: logo loading (SVG size fix, mip chain for sharp small
 * icons), drawing one icon, the sample mark, the manifest and head snippet, and the ZIP.
 */
import { canvas, ico, zip } from '../../lib/konvaEngine';
import { COPY, DEFAULT_META, EXT_RE, MASKABLE_PAD, ROUND, SPECS, TYPE_RE } from './iconConstants';

export class LoadError extends Error {}

const SVG_SIDE = 1024; // intrinsic size given to SVGs, longest side
const MIP_MIN = 32; // stop halving below this

export const isSvg = (file) => /svg/i.test(file.type || '') || /\.svg$/i.test(file.name || '');
export const bgColour = (opts) => (opts.bg === 'custom' ? opts.customBg : opts.bg);

// null when the file is a supported logo, otherwise the error to show.
export function checkLogo(file) {
  if (TYPE_RE.test(file.type || '') || EXT_RE.test(file.name || '')) return null;
  const looksImage = (file.type || '').startsWith('image/') || /\.(tiff?|gif|bmp|heic|heif|avif|ico)$/i.test(file.name || '');
  return looksImage ? COPY.cantRead(file.name) : COPY.notImage;
}

// Give an SVG an intrinsic size. Without width and height some browsers (Firefox) can't
// draw it to a canvas, and a tiny intrinsic size can rasterise soft in others.
async function svgUrl(file) {
  const doc = new DOMParser().parseFromString(await file.text(), 'image/svg+xml');
  const root = doc.documentElement;
  if (!root || root.nodeName.toLowerCase() !== 'svg' || doc.getElementsByTagName('parsererror').length) {
    throw new Error('not an svg');
  }
  const len = (attr) => {
    const v = root.getAttribute(attr);
    return v && !/%$/.test(v.trim()) ? parseFloat(v) : NaN;
  };
  let vb = (root.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number);
  let w = len('width');
  let h = len('height');
  if (!(vb.length === 4 && vb[2] > 0 && vb[3] > 0)) {
    if (!(w > 0 && h > 0)) {
      w = 512;
      h = 512;
    }
    vb = [0, 0, w, h];
    root.setAttribute('viewBox', vb.join(' '));
  }
  const k = SVG_SIDE / Math.max(vb[2], vb[3]);
  root.setAttribute('width', String(Math.round(vb[2] * k)));
  root.setAttribute('height', String(Math.round(vb[3] * k)));
  const text = new XMLSerializer().serializeToString(root);
  return URL.createObjectURL(new Blob([text], { type: 'image/svg+xml' }));
}

const decodeImg = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('decode failed'));
    img.src = url;
  });

// Halved copies of a raster logo, largest first, so small icons are drawn from a source
// at most 2x their size (one big drawImage step aliases badly).
function buildMips(img, w, h) {
  const mips = [{ src: img, w, h }];
  let cur = mips[0];
  while (Math.max(cur.w, cur.h) / 2 >= MIP_MIN) {
    const nw = Math.max(1, Math.round(cur.w / 2));
    const nh = Math.max(1, Math.round(cur.h / 2));
    const c = canvas(nw, nh);
    const x = c.getContext('2d');
    x.imageSmoothingQuality = 'high';
    x.drawImage(cur.src, 0, 0, nw, nh);
    cur = { src: c, w: nw, h: nh };
    mips.push(cur);
  }
  return mips;
}

// Smallest copy that is still at least as wide as the drawn logo.
function pickSource(src, drawW) {
  if (!src.mips) return src.img;
  let best = src.mips[0];
  for (const m of src.mips) if (m.w >= drawW) best = m;
  return best.src;
}

// Reads a logo file into { url, img, mips, name, w, h, svg, size, own }.
// `own` means the URL is an object URL the caller must revoke. Throws LoadError with user copy.
export async function loadLogo(file) {
  const problem = checkLogo(file);
  if (problem) throw new LoadError(problem);
  const svg = isSvg(file);
  let url;
  try {
    url = svg ? await svgUrl(file) : URL.createObjectURL(file);
    const img = await decodeImg(url);
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) throw new Error('no size');
    return { url, img, mips: svg ? null : buildMips(img, w, h), name: file.name, w, h, svg, size: file.size, own: true };
  } catch {
    if (url) URL.revokeObjectURL(url);
    throw new LoadError(COPY.cantRead(file.name));
  }
}

// The Konva crop-mark "k", drawn at 512 px, so the page can be tried without a logo.
export async function sampleLogo() {
  try {
    await document.fonts.load('800 360px Poppins');
  } catch {
    // falls back to the system sans
  }
  const S = 512;
  const c = canvas(S, S);
  const x = c.getContext('2d');
  const t = 44;
  const bw = 150;
  const bh = 108;
  const m = 56;
  x.fillStyle = '#33366F';
  x.fillRect(S - m - bw, m, bw, t);
  x.fillRect(S - m - t, m, t, bh);
  x.fillRect(m, S - m - t, bw, t);
  x.fillRect(m, S - m - bh, t, bh);
  x.font = '800 360px Poppins, sans-serif';
  x.textAlign = 'center';
  x.textBaseline = 'alphabetic';
  x.fillText('k', S / 2, 380);
  return { url: c.toDataURL('image/png'), img: c, mips: buildMips(c, S, S), name: COPY.sampleName, w: S, h: S, svg: false, size: 0, sample: true, own: false };
}

function shapePath(x, S, shape) {
  x.beginPath();
  if (shape === 'circle') {
    x.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2);
  } else if (shape === 'rounded') {
    const r = S * ROUND;
    x.moveTo(r, 0);
    x.arcTo(S, 0, S, S, r);
    x.arcTo(S, S, 0, S, r);
    x.arcTo(0, S, 0, 0, r);
    x.arcTo(0, 0, S, 0, r);
    x.closePath();
  } else {
    x.rect(0, 0, S, S);
  }
}

// Draws one icon. Solid specs (touch, maskable) are square and never transparent:
// a transparent background falls back to the theme colour.
export function drawIcon(src, spec, opts) {
  const S = spec.size;
  const c = canvas(S, S);
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = true;
  x.imageSmoothingQuality = 'high';

  let bg = bgColour(opts);
  if (spec.solid && bg === 'transparent') bg = opts.theme;
  shapePath(x, S, spec.solid ? 'square' : opts.shape);
  if (bg !== 'transparent') {
    x.fillStyle = bg;
    x.fill();
  }
  x.clip();

  const pad = spec.maskable ? Math.max(opts.pad, MASKABLE_PAD) : opts.pad;
  const box = S * (1 - (2 * pad) / 100);
  const k = Math.min(box / src.w, box / src.h);
  const w = src.w * k;
  const h = src.h * k;
  x.drawImage(pickSource(src, w), (S - w) / 2, (S - h) / 2, w, h);
  return c;
}

const clean = (v, fallback) => (v || '').trim() || fallback;

export function manifestText(opts, meta) {
  const bg = bgColour(opts);
  const name = clean(meta.name, DEFAULT_META.name);
  return JSON.stringify(
    {
      name,
      short_name: clean(meta.short, name),
      start_url: '/',
      display: 'standalone',
      theme_color: opts.theme,
      background_color: bg === 'transparent' ? '#FFFFFF' : bg,
      icons: [
        { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: '/maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    null,
    2
  );
}

export function headText(opts) {
  return [
    '<link rel="icon" href="/favicon.ico" sizes="48x48">',
    '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
    '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
    '<link rel="manifest" href="/site.webmanifest">',
    `<meta name="theme-color" content="${opts.theme}">`,
  ].join('\n');
}

const nextFrame = () => new Promise((r) => setTimeout(r, 16));

// PNG bytes via toDataURL: synchronous and quick at these sizes, where toBlob waits for
// idle time in Chrome and can stall each step by a second while the progress bar animates.
function pngBytes(c) {
  const bin = atob(c.toDataURL('image/png').split(',')[1] || '');
  if (!bin) throw new Error('encode failed');
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// Draws every PNG, then the ICO, manifest and head snippet, and returns the ZIP blob.
// onStep(i) runs before step i: 0..SPECS.length-1 are PNGs, SPECS.length is the text files.
// isCancelled() is checked between steps; a cancelled build returns null.
export async function buildPack(src, opts, meta, onStep, isCancelled = () => false) {
  const entries = [];
  const icoParts = [];
  for (let i = 0; i < SPECS.length; i++) {
    onStep(i);
    await nextFrame(); // let the progress bar paint
    if (isCancelled()) return null;
    const spec = SPECS[i];
    const data = pngBytes(drawIcon(src, spec, opts));
    entries.push({ name: spec.file, data });
    if (spec.ico) icoParts.push({ size: spec.size, data });
  }
  onStep(SPECS.length);
  await nextFrame();
  if (isCancelled()) return null;
  const enc = new TextEncoder();
  entries.push({ name: 'favicon.ico', data: new Uint8Array(await ico(icoParts).arrayBuffer()) });
  entries.push({ name: 'site.webmanifest', data: enc.encode(manifestText(opts, meta) + '\n') });
  entries.push({ name: 'head-snippet.html', data: enc.encode(headText(opts) + '\n') });
  return { blob: zip(entries), count: entries.length };
}
