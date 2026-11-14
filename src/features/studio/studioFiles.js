/**
 * studioFiles
 * Path: src/features/studio/studioFiles.js
 *
 * File records, decoding (with HEIC fallback), object URL ownership and naming helpers.
 */
import { analyse, decodeHeic, isHeic, isImage } from '../../lib/konvaEngine';
import { COPY } from './studioConstants';

let seq = 0;
const newId = () => `f${Date.now().toString(36)}${(seq++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// One file in Studio.
// url, res.url, before, rotUrl and orig.url are object URLs owned by the record:
// recordUrls() lists them so they can be revoked on remove and unmount.
export function createRecord(file) {
  return {
    id: newId(),
    file,
    name: file.name || 'pasted-image.png',
    size: file.size,
    type: file.type || '',
    lastModified: file.lastModified || Date.now(),
    url: null,
    img: null,
    w: 0,
    h: 0,
    alpha: false,
    palette: [],
    exif: null,
    areas: [], // redact rectangles, normalised 0 to 1
    ovr: null, // per-file settings patch; null means the file follows the global settings
    res: null, // last real encode: { key, blob, url, size, q, miss, wasm, unsupported, failed, w, h }
    before: null, // compare image (original look, same crop)
    rotUrl: null, // rotated, uncropped image for the crop overlay
    orig: null, // the untouched source after background removal, for compare and restore
    v: 0, // bumps when the working image changes, so cached results go stale
    status: 'loading', // loading | ready | error
    error: null,
  };
}

export const recordUrls = (r) => [r.url, r.res?.url, r.before, r.rotUrl, r.orig?.url].filter(Boolean);
export const revokeAll = (urls) => urls.forEach((u) => URL.revokeObjectURL(u));

export function openImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => (img.naturalWidth && img.naturalHeight ? resolve(img) : reject(new Error('empty image')));
    img.onerror = () => reject(new Error('decode failed'));
    img.src = url;
  });
}

export class LoadError extends Error {}

// Decode with the browser first; only HEIC falls back to the local decoder (heic-to, lazy chunk).
async function decodeFile(file) {
  const direct = URL.createObjectURL(file);
  try {
    return { url: direct, img: await openImage(direct) };
  } catch {
    URL.revokeObjectURL(direct);
  }
  if (!isHeic(file)) throw new LoadError(COPY.badFile);

  let url = null;
  try {
    const png = await decodeHeic(file);
    url = URL.createObjectURL(png);
    return { url, img: await openImage(url) };
  } catch {
    if (url) URL.revokeObjectURL(url);
    throw new LoadError(COPY.heicFail);
  }
}

// Decode and analyse. Resolves with the fields to merge into the record.
// The caller owns the returned url. Throws LoadError with user-facing copy.
export async function readImage(file) {
  const { url, img } = await decodeFile(file);
  try {
    const info = await analyse(file, img);
    return { url, img, w: info.w, h: info.h, alpha: info.alpha, palette: info.palette, exif: info.exif };
  } catch {
    URL.revokeObjectURL(url);
    throw new LoadError(COPY.badFile);
  }
}

// The fields a background removal swaps out, kept so the original can be compared and restored.
export const snapshotSource = (r) => ({
  file: r.file,
  name: r.name,
  size: r.size,
  type: r.type,
  lastModified: r.lastModified,
  url: r.url,
  img: r.img,
  w: r.w,
  h: r.h,
  alpha: r.alpha,
  palette: r.palette,
  exif: r.exif,
});

export async function listFolderImages(dir) {
  const out = [];
  for await (const handle of dir.values()) {
    if (handle.kind !== 'file') continue;
    const file = await handle.getFile();
    if (isImage(file)) out.push(file);
  }
  return out.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}

const TYPE_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/bmp': 'bmp',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/svg+xml': 'svg',
};

export function nameFromUrl(target, type) {
  let name = '';
  try {
    name = decodeURIComponent(new URL(target).pathname.split('/').pop() || '');
  } catch {
    name = '';
  }
  name = name.replace(/[\\/:*?"<>|]/g, '-') || 'image';
  if (!/\.[a-z0-9]{2,5}$/i.test(name) && TYPE_EXT[type]) name += `.${TYPE_EXT[type]}`;
  return name;
}

// photo.webp, photo-2.webp, photo-3.webp ... so a ZIP or folder never overwrites its own files.
export function uniqueName(name, used) {
  let out = name;
  const dot = name.lastIndexOf('.');
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : '';
  for (let i = 2; used.has(out.toLowerCase()); i++) out = `${stem}-${i}${ext}`;
  used.add(out.toLowerCase());
  return out;
}

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(blob);
  });
}