/**
 * konvaEngine
 * Path: src/lib/konvaEngine.js
 *
 * Pure image functions (no React): geometry, drawing, encoding, ZIP/ICO/PDF writers, lazy codecs
 * and background removal.
 */
// Konva image engine (ES module). Everything runs in the browser: canvas, File APIs, WASM.

const MIME = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif' };
const EXT = { jpeg: 'jpg', png: 'png', webp: 'webp', avif: 'avif' };
const CROPS = [
  { id: 'free', label: 'Free' }, { id: '1:1', label: '1:1', r: 1 },
  { id: '4:5', label: '4:5', r: 4 / 5 }, { id: '16:9', label: '16:9', r: 16 / 9 }
];
const SOCIAL = [
  { id: 'ig-post', label: 'Instagram post', r: 4 / 5, w: 1080, h: 1350 },
  { id: 'ig-story', label: 'Instagram story', r: 9 / 16, w: 1080, h: 1920 },
  { id: 'li-banner', label: 'LinkedIn banner', r: 4, w: 1584, h: 396 },
  { id: 'x-header', label: 'X header', r: 3, w: 1500, h: 500 },
  { id: 'yt-thumb', label: 'YouTube thumbnail', r: 16 / 9, w: 1280, h: 720 }
];
const DEF = {
  format: 'webp', quality: 80, mode: 'quality', targetKB: 200, strip: true,
  resizeMode: 'px', width: null, height: null, pct: 100, lock: true,
  crop: 'free', rotate: 0, flipH: false, flipV: false,
  bright: 0, contrast: 0, sat: 0, gray: false, blur: 0,
  wmOn: false, wmText: '© Your Name', wmPos: 'br', wmOpacity: 70, wmSize: 5, wmTile: false,
  rMode: 'pixelate', rStrength: 14
};

const UNITS = ['B', 'KB', 'MB', 'GB'];
function fmt(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes === 0) return '0 B';
  const e = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1);
  const v = bytes / 1024 ** e;
  return `${e === 0 ? v : v.toFixed(1)} ${UNITS[e]}`;
}
const pct = (a, b) => (a ? Math.round(((a - b) / a) * 100) : null);

const isImage = f => (f.type || '').startsWith('image/') || /\.(heic|heif|avif|jpe?g|png|webp|gif|bmp)$/i.test(f.name || '');
const isHeic = f => /heic|heif/i.test(f.type || '') || /\.(heic|heif)$/i.test(f.name || '');

function canvas(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }
const toBlob = (c, m, q) => new Promise(r => c.toBlob(r, m, q));

function cropRatio(id) { const c = CROPS.find(x => x.id === id) || SOCIAL.find(x => x.id === id); return c && c.r; }

function geom(w, h, s) {
  const rot = (((s.rotate || 0) % 360) + 360) % 360;
  const swap = rot === 90 || rot === 270;
  const rw = swap ? h : w, rh = swap ? w : h;
  let cx = 0, cy = 0, cw = rw, ch = rh;
  const r = cropRatio(s.crop);
  if (r) {
    if (rw / rh > r) { ch = rh; cw = Math.round(rh * r); } else { cw = rw; ch = Math.round(rw / r); }
    cx = Math.round((rw - cw) / 2); cy = Math.round((rh - ch) / 2);
  }
  let ow, oh;
  if (s.resizeMode === 'pct') { ow = cw * s.pct / 100; oh = ch * s.pct / 100; }
  else {
    ow = s.width || cw;
    oh = s.lock || !s.height ? ow * ch / cw : s.height;
  }
  ow = Math.min(16384, Math.max(1, Math.round(ow))); oh = Math.min(16384, Math.max(1, Math.round(oh)));
  return { rot, rw, rh, cx, cy, cw, ch, ow, oh };
}

function rotated(img, w, h, s, g) {
  const c = canvas(g.rw, g.rh); const x = c.getContext('2d');
  x.translate(g.rw / 2, g.rh / 2); x.rotate(g.rot * Math.PI / 180); x.scale(s.flipH ? -1 : 1, s.flipV ? -1 : 1);
  x.drawImage(img, -w / 2, -h / 2, w, h);
  return c;
}

function filterStr(s, ow) {
  const parts = [];
  if (s.bright) parts.push(`brightness(${1 + s.bright / 100})`);
  if (s.contrast) parts.push(`contrast(${1 + s.contrast / 100})`);
  if (s.sat) parts.push(`saturate(${1 + s.sat / 100})`);
  if (s.gray) parts.push('grayscale(1)');
  if (s.blur) parts.push(`blur(${(s.blur * ow / 1000).toFixed(2)}px)`);
  return parts.join(' ') || 'none';
}

function drawOutput(f, s, g) {
  const rot = rotated(f.img, f.w, f.h, s, g);
  const out = canvas(g.ow, g.oh); const x = out.getContext('2d');
  x.imageSmoothingQuality = 'high';
  x.filter = filterStr(s, g.ow);
  x.drawImage(rot, g.cx, g.cy, g.cw, g.ch, 0, 0, g.ow, g.oh);
  x.filter = 'none';
  for (const a of f.areas || []) {
    const ax = a.x * g.ow, ay = a.y * g.oh, aw = Math.max(1, a.w * g.ow), ah = Math.max(1, a.h * g.oh);
    if (s.rMode === 'pixelate') {
      const b = Math.max(4, Math.round(s.rStrength * g.ow / 600));
      const t = canvas(Math.ceil(aw / b), Math.ceil(ah / b));
      t.getContext('2d').drawImage(out, ax, ay, aw, ah, 0, 0, t.width, t.height);
      x.imageSmoothingEnabled = false; x.drawImage(t, 0, 0, t.width, t.height, ax, ay, aw, ah); x.imageSmoothingEnabled = true;
    } else {
      const copy = canvas(g.ow, g.oh); copy.getContext('2d').drawImage(out, 0, 0);
      x.save(); x.beginPath(); x.rect(ax, ay, aw, ah); x.clip();
      x.filter = `blur(${Math.max(2, s.rStrength * g.ow / 500)}px)`; x.drawImage(copy, 0, 0); x.restore();
    }
  }
  if (s.wmOn && s.wmText) {
    const fs = Math.max(10, g.ow * s.wmSize / 100);
    x.save(); x.globalAlpha = s.wmOpacity / 100; x.fillStyle = '#FFFFFF';
    x.font = `700 ${fs}px Poppins, sans-serif`; x.shadowColor = 'rgba(27,29,69,.55)'; x.shadowBlur = fs * 0.2;
    if (s.wmTile) {
      x.translate(g.ow / 2, g.oh / 2); x.rotate(-Math.PI / 6);
      const tw = x.measureText(s.wmText).width + fs * 2.5, d = Math.hypot(g.ow, g.oh);
      x.textAlign = 'center'; x.textBaseline = 'middle';
      for (let yy = -d / 2; yy < d / 2; yy += fs * 3) for (let xx = -d / 2; xx < d / 2; xx += tw) x.fillText(s.wmText, xx, yy);
    } else {
      const m = fs * 0.9, p = s.wmPos || 'br';
      const v = p[0], hz = p[1];
      x.textAlign = hz === 'l' ? 'left' : hz === 'r' ? 'right' : 'center';
      x.textBaseline = v === 't' ? 'top' : v === 'b' ? 'bottom' : 'middle';
      x.fillText(s.wmText, hz === 'l' ? m : hz === 'r' ? g.ow - m : g.ow / 2, v === 't' ? m : v === 'b' ? g.oh - m : g.oh / 2);
    }
    x.restore();
  }
  return { out, rot };
}

function scaled(src, sx, sy, sw, sh, max) {
  const k = Math.min(1, max / Math.max(sw, sh)); const c = canvas(sw * k, sh * k);
  c.getContext('2d').drawImage(src, sx, sy, sw, sh, 0, 0, c.width, c.height); return c;
}

// Lazy-loaded codecs. Each loads once, on first use, then the browser caches it.
// AVIF: @jsquash/avif (libavif/AOM, Apache-2.0). HEIC: heic-to (libheif, LGPL-3.0, loaded as an unmodified separate module).
// Background removal: Transformers.js + onnx-community/ormbg-ONNX (Apache-2.0, IS-Net CNN, runs on WASM).
// Codecs are code-split: Vite emits each as its own chunk, fetched on first use and cached by the service worker.
let avifMod = null, heicMod = null, tfMod = null, seg = null;
async function avifWasm(c, q) {
  avifMod = avifMod || await import('@jsquash/avif/encode.js');
  const id = c.getContext('2d').getImageData(0, 0, c.width, c.height);
  // AVIF quality runs lower than JPEG/WEBP for the same look; map the shared slider onto it. Speed 8 keeps big photos usable.
  const buf = await avifMod.default(id, { quality: Math.max(1, Math.round(q * 100 * 0.65)), speed: 8 });
  return new Blob([buf], { type: 'image/avif' });
}
async function decodeHeic(file) {
  heicMod = heicMod || await import('heic-to');
  return heicMod.heicTo({ blob: file, type: 'image/png' });
}
// Where the model and its ONNX Runtime WASM come from. Default: the Hugging Face hub and jsDelivr.
// To serve both from Konva's own domain, run `npm run model:fetch` and set VITE_MODEL_BASE=/models/
// and VITE_ORT_BASE=/ort/ (see .env.example). Either way Transformers.js keeps the files in its
// "transformers-cache", and the URLs keep "ormbg" / "ort-wasm" so Settings can find and remove them.
const BUILD_ENV = import.meta.env || {};
function configureModelSource(tf) {
  const env = tf.env;
  env.allowLocalModels = false;
  // Offline, a cached model loads without asking the network anything. Without this, a probe for an
  // optional file would fail on the network error instead of being treated as missing.
  env.allowRemoteModels = typeof navigator === 'undefined' || navigator.onLine !== false;
  if (BUILD_ENV.VITE_MODEL_BASE) {
    env.remoteHost = new URL(BUILD_ENV.VITE_MODEL_BASE, location.href).href;
    env.remotePathTemplate = '{model}/';
  }
  const wasm = env.backends?.onnx?.wasm;
  const paths = wasm?.wasmPaths;
  if (BUILD_ENV.VITE_ORT_BASE && paths && typeof paths === 'object' && !String(paths.mjs).startsWith('blob:')) {
    // Keep the file variant Transformers.js picked for this browser; only the folder changes.
    const base = new URL(BUILD_ENV.VITE_ORT_BASE, location.href).href;
    const file = (u) => u.slice(u.lastIndexOf('/') + 1);
    wasm.wasmPaths = { mjs: base + file(paths.mjs), wasm: base + file(paths.wasm) };
  }
}
async function loadSegmenter(onProgress) {
  if (seg) return seg;
  tfMod = tfMod || await import('@huggingface/transformers');
  configureModelSource(tfMod);
  const files = {};
  seg = await tfMod.pipeline('background-removal', 'onnx-community/ormbg-ONNX', {
    device: 'wasm', dtype: 'q8', // 8-bit weights: about a quarter of the fp32 download, little visible loss on mattes

    progress_callback: e => {
      if (e.status === 'progress' && e.total) { files[e.file] = [e.loaded, e.total]; const v = Object.values(files); onProgress && onProgress(v.reduce((a, x) => a + x[0], 0), v.reduce((a, x) => a + x[1], 0)); }
    }
  });
  return seg;
}
// Soft matte cleanup: near-zero alpha -> clear, near-full -> solid, smoothstep in between.
function cleanAlpha(c, lo = 0.06, hi = 0.8) {
  const x = c.getContext('2d'); const d = x.getImageData(0, 0, c.width, c.height); const p = d.data;
  for (let i = 3; i < p.length; i += 4) { const a = p[i] / 255; if (a <= lo) p[i] = 0; else if (a >= hi) p[i] = 255; else { const t = (a - lo) / (hi - lo); p[i] = Math.round(t * t * (3 - 2 * t) * 255); } }
  x.putImageData(d, 0, 0); return c;
}
async function removeBg(src) {
  if (!seg) throw new Error('model not loaded');
  const blob = src instanceof Blob ? src : await toBlob(src, 'image/png');
  const img = await tfMod.RawImage.fromBlob(blob);
  const out = await seg(img);
  const r = Array.isArray(out) ? out[0] : out;
  const c = r.toCanvas ? r.toCanvas() : null;
  const cc = canvas(r.width, r.height); cc.getContext('2d').drawImage(c, 0, 0);
  return cleanAlpha(cc);
}

async function encode(out, s, avifOk) {
  const mime = MIME[s.format];
  if (s.format === 'avif' && !avifOk) {
    try {
      if (s.mode === 'target') {
        const target = s.targetKB * 1024; let lo = 0.1, hi = 0.95, best = null;
        for (let i = 0; i < 4; i++) { const mid = (lo + hi) / 2; const b = await avifWasm(out, mid); if (b.size <= target) { best = { blob: b, q: mid, wasm: true }; lo = mid; } else hi = mid; }
        if (best) return best;
        return { blob: await avifWasm(out, 0.1), q: 0.1, miss: true, wasm: true };
      }
      return { blob: await avifWasm(out, s.quality / 100), q: s.quality / 100, wasm: true };
    } catch (e) { return { blob: null, q: null, unsupported: true }; }
  }
  if (s.mode === 'target' && s.format !== 'png') {
    const target = s.targetKB * 1024; let lo = 0.05, hi = 0.95, best = null;
    for (let i = 0; i < 7; i++) {
      const mid = (lo + hi) / 2; const b = await toBlob(out, mime, mid);
      if (b && b.size <= target) { best = { blob: b, q: mid }; lo = mid; } else hi = mid;
    }
    if (best) return best;
    const b = await toBlob(out, mime, 0.05); return { blob: b, q: 0.05, miss: true };
  }
  return { blob: await toBlob(out, mime, s.quality / 100), q: s.quality / 100 };
}

async function analyse(f, img) {
  const w = img.naturalWidth, h = img.naturalHeight;
  const k = Math.min(1, 72 / Math.max(w, h)); const c = canvas(w * k, h * k);
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, c.width, c.height);
  const d = x.getImageData(0, 0, c.width, c.height).data;
  let alpha = false; const buckets = new Map();
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 250) alpha = true;
    if (d[i + 3] < 128) continue;
    const key = ((d[i] >> 4) << 8) | ((d[i + 1] >> 4) << 4) | (d[i + 2] >> 4);
    const b = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0 };
    b.r += d[i]; b.g += d[i + 1]; b.b += d[i + 2]; b.n++; buckets.set(key, b);
  }
  const sorted = [...buckets.values()].sort((a, b) => b.n - a.n).map(b => [b.r / b.n, b.g / b.n, b.b / b.n]);
  const pal = [];
  for (const c2 of sorted) {
    if (pal.every(p => Math.hypot(p[0] - c2[0], p[1] - c2[1], p[2] - c2[2]) > 56)) pal.push(c2);
    if (pal.length === 6) break;
  }
  const hex = pal.map(p => '#' + p.map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase());
  let exif = { found: false, bytes: 0, gps: false };
  if (/jpe?g/i.test(f.type || '') || /\.jpe?g$/i.test(f.name || '')) {
    const buf = new Uint8Array(await f.slice(0, 131072).arrayBuffer());
    for (let i = 2; i < buf.length - 8; i++) {
      if (buf[i] === 0x45 && buf[i + 1] === 0x78 && buf[i + 2] === 0x69 && buf[i + 3] === 0x66 && buf[i + 4] === 0 && buf[i + 5] === 0) {
        const len = (buf[i - 2] << 8) | buf[i - 1]; const le = buf[i + 6] === 0x49; let gps = false;
        const end = Math.min(buf.length - 1, i + len);
        for (let j = i + 6; j < end; j++) if (le ? (buf[j] === 0x25 && buf[j + 1] === 0x88) : (buf[j] === 0x88 && buf[j + 1] === 0x25)) { gps = true; break; }
        exif = { found: true, bytes: len, gps }; break;
      }
    }
  }
  return { w, h, alpha, palette: hex, exif };
}

const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(b) { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
// Minimal "stored" ZIP writer: images are already compressed, so no deflate needed.
function zip(entries) {
  const enc = new TextEncoder(); const parts = []; const central = []; let off = 0;
  for (const e of entries) {
    const name = enc.encode(e.name); const crc = crc32(e.data); const sz = e.data.length;
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true);
    lh.setUint16(10, 0, true); lh.setUint16(12, 0x21, true); lh.setUint32(14, crc, true); lh.setUint32(18, sz, true); lh.setUint32(22, sz, true);
    lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
    parts.push(lh.buffer, name, e.data);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true);
    ch.setUint16(12, 0, true); ch.setUint16(14, 0x21, true); ch.setUint32(16, crc, true); ch.setUint32(20, sz, true); ch.setUint32(24, sz, true);
    ch.setUint16(28, name.length, true); ch.setUint32(42, off, true);
    central.push(ch.buffer, name);
    off += 30 + name.length + sz;
  }
  const cdSize = central.reduce((a, p) => a + (p.byteLength ?? p.length), 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, entries.length, true); end.setUint16(10, entries.length, true);
  end.setUint32(12, cdSize, true); end.setUint32(16, off, true);
  return new Blob([...parts, ...central, end.buffer], { type: 'application/zip' });
}

function download(blob, name) {
  const a = document.createElement('a'); const u = URL.createObjectURL(blob);
  a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 4000);
}

function outName(pattern, f, i, s, g) {
  const base = (f.name || 'image').replace(/\.[^.]+$/, '');
  const n = (pattern || '{name}').replace(/\{name\}/g, base).replace(/\{n\}/g, String(i + 1).padStart(2, '0'))
    .replace(/\{w\}/g, g.ow).replace(/\{h\}/g, g.oh).replace(/[\\/:*?"<>|]/g, '-');
  return `${n || base}.${EXT[s.format]}`;
}

function avifSupported() { try { return canvas(1, 1).toDataURL('image/avif').startsWith('data:image/avif'); } catch (e) { return false; } }

// Multi-size .ico with PNG payloads (supported by every current browser and Windows Vista+).
function ico(pngs) {
  const head = new DataView(new ArrayBuffer(6 + pngs.length * 16));
  head.setUint16(2, 1, true); head.setUint16(4, pngs.length, true);
  let off = 6 + pngs.length * 16;
  pngs.forEach((p, i) => {
    const o = 6 + i * 16;
    head.setUint8(o, p.size >= 256 ? 0 : p.size); head.setUint8(o + 1, p.size >= 256 ? 0 : p.size);
    head.setUint16(o + 4, 1, true); head.setUint16(o + 6, 32, true);
    head.setUint32(o + 8, p.data.length, true); head.setUint32(o + 12, off, true);
    off += p.data.length;
  });
  return new Blob([head.buffer, ...pngs.map(p => p.data)], { type: 'image/x-icon' });
}

// Minimal PDF writer: one JPEG per page (DCTDecode), placed in points.
function pdf(pages) {
  const enc = new TextEncoder(); const chunks = []; const offsets = []; let len = 0;
  const push = c => { const b = typeof c === 'string' ? enc.encode(c) : c; chunks.push(b); len += b.length; };
  const obj = (id, body) => { offsets[id] = len; push(`${id} 0 obj\n`); body(); push('\nendobj\n'); };
  push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  const n = pages.length; const kids = pages.map((_, i) => `${3 + i * 3} 0 R`).join(' ');
  obj(1, () => push('<< /Type /Catalog /Pages 2 0 R >>'));
  obj(2, () => push(`<< /Type /Pages /Kids [${kids}] /Count ${n} >>`));
  pages.forEach((p, i) => {
    const id = 3 + i * 3; const f = v => (Math.round(v * 100) / 100).toString();
    obj(id, () => push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${f(p.pw)} ${f(p.ph)}] /Resources << /XObject << /Im0 ${id + 2} 0 R >> >> /Contents ${id + 1} 0 R >>`));
    const clip = p.clip ? `${f(p.clip.x)} ${f(p.clip.y)} ${f(p.clip.w)} ${f(p.clip.h)} re W n ` : '';
    const content = `q ${clip}${f(p.w)} 0 0 ${f(p.h)} ${f(p.x)} ${f(p.y)} cm /Im0 Do Q`;
    obj(id + 1, () => { push(`<< /Length ${content.length} >>\nstream\n`); push(content); push('\nendstream'); });
    obj(id + 2, () => {
      push(`<< /Type /XObject /Subtype /Image /Width ${p.iw} /Height ${p.ih} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.jpeg.length} >>\nstream\n`);
      push(p.jpeg); push('\nendstream');
    });
  });
  const xref = len; const count = 3 + n * 3;
  let x = `xref\n0 ${count}\n0000000000 65535 f \n`;
  for (let i = 1; i < count; i++) x += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  push(x); push(`trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(chunks, { type: 'application/pdf' });
}

export { ico, pdf, MIME, EXT, CROPS, SOCIAL, DEF, fmt, pct, isImage, isHeic, canvas, toBlob, geom, drawOutput, scaled, encode, analyse, zip, download, outName, avifSupported, decodeHeic, loadSegmenter, removeBg, cleanAlpha };
export default { ico, pdf, MIME, EXT, CROPS, SOCIAL, DEF, fmt, pct, isImage, isHeic, canvas, toBlob, geom, drawOutput, scaled, encode, analyse, zip, download, outName, avifSupported, decodeHeic, loadSegmenter, removeBg, cleanAlpha };
