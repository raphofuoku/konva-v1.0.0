/**
 * modelCache
 * Path: src/features/settings/modelCache.js
 *
 * Finds and deletes the background-removal model files in Cache Storage. Transformers.js
 * keeps them in its own cache today; the service worker (Part 11) may add another, so every
 * cache is searched for entries from the ormbg model rather than relying on one cache name.
 */

const MODEL_RE = /ormbg/i;

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
