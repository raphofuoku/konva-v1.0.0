/**
 * modelCache
 * Path: src/features/settings/modelCache.js
 *
 * Finds and deletes the background-removal files in Cache Storage: the ormbg model and the
 * ONNX Runtime WASM files that run it (both cached by Transformers.js in "transformers-cache",
 * whether they come from the Hugging Face hub and jsDelivr or from VITE_MODEL_BASE/VITE_ORT_BASE).
 * Every cache is searched by URL rather than relying on one cache name. The service worker
 * deliberately leaves these URLs alone, so they are only ever stored once.
 */

// Model URLs contain "ormbg"; runtime URLs contain "onnxruntime-web" (CDN) or "ort-wasm" (file name).
const MODEL_RE = /ormbg|onnxruntime-web|ort-wasm/i;

const hasCaches = () => typeof caches !== 'undefined';

async function modelEntries() {
  if (!hasCaches()) return [];
  const found = [];
  for (const name of await caches.keys()) {
    const cache = await caches.open(name);
    for (const req of await cache.keys()) {
      if (MODEL_RE.test(req.url)) found.push({ cache, req });
    }
  }
  return found;
}

async function entrySize({ cache, req }) {
  const res = await cache.match(req);
  if (!res) return 0;
  const len = Number(res.headers.get('content-length'));
  if (Number.isFinite(len) && len > 0) return len;
  // Cached blobs are backed by disk, so reading .size doesn't load the file into memory.
  return (await res.blob()).size;
}

// { supported, files, bytes }. supported is false where Cache Storage isn't available
// (insecure origins, some private modes); callers then fall back to the localStorage flag.
export async function modelCacheInfo() {
  if (!hasCaches()) return { supported: false, files: 0, bytes: 0 };
  try {
    const entries = await modelEntries();
    const sizes = await Promise.all(entries.map(entrySize));
    return { supported: true, files: entries.length, bytes: sizes.reduce((a, b) => a + b, 0) };
  } catch {
    return { supported: false, files: 0, bytes: 0 };
  }
}

// Deletes every cached model file. Throws if the browser refuses.
export async function removeModelCache() {
  const entries = await modelEntries();
  await Promise.all(entries.map(({ cache, req }) => cache.delete(req)));
  return entries.length;
}

export const mb = (bytes) => `${(bytes / 1048576).toFixed(bytes >= 10485760 ? 0 : 1)} MB`;
