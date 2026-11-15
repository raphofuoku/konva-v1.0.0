/**
 * Konva service worker (template)
 * Path: src/pwa/sw.js
 *
 * Not bundled by Vite. At build time swBuild.js swaps the __KONVA_SW__ placeholder below for this build's file
 * lists and writes the result to dist/sw.js.
 *
 * - App shell (index.html, the entry code and CSS, Latin fonts, the icon font, favicons, manifest):
 *   precached on install, served cache-first. Every route opens offline.
 * - Other files under /assets/ (the AVIF and HEIC codecs, Transformers.js, WASM, other font subsets):
 *   cached the first time they load, so each tool works offline after first use.
 * - Cross-origin requests and the self-hosted model under /models/ and /ort/ are left alone:
 *   Transformers.js already keeps the model and its runtime in its own cache ("transformers-cache"),
 *   and caching them twice would double a download of about 50 MB.
 *
 * A new version installs in the background and waits. It takes over when every Konva tab has been
 * closed, or straight away when the page sends SKIP_WAITING (Settings > Offline > Reload).
 * Nothing here ever reads, stores or sends image data: only GET requests for Konva's own files.
 */

const BUILD = self.__KONVA_SW__;

const SHELL = `konva-shell-${BUILD.version}`;
const RUNTIME = 'konva-runtime';
const LEGACY = ['v1']; // the unused v2 public/service-worker.js used this name

const scope = new URL(self.registration.scope);
const abs = (path) => new URL(path, scope).href;

const PRECACHE = BUILD.precache.map(abs);
const PRECACHED = new Set(PRECACHE);
const ASSETS = new Set(BUILD.assets.map(abs));
const INDEX = abs('index.html');
const ASSET_DIR = abs('assets/');
const PASS_THROUGH = [abs('models/'), abs('ort/')];
const HAS_EXT = /\.[a-z0-9]+$/i;

// A redirected response can't answer a navigation (Chrome rejects it), so store a clean copy.
async function cleanCopy(res) {
  if (!res.redirected) return res;
  const body = await res.blob();
  return new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers });
}

async function precache() {
  const cache = await caches.open(SHELL);
  await Promise.all(
    PRECACHE.map(async (url) => {
      const res = await fetch(new Request(url, { cache: 'reload' }));
      if (!res.ok) throw new Error(`Precache failed: ${url} (${res.status})`);
      await cache.put(url, await cleanCopy(res));
    })
  );
}

async function tidy() {
  for (const name of await caches.keys()) {
    if ((name.startsWith('konva-shell-') && name !== SHELL) || LEGACY.includes(name)) {
      await caches.delete(name);
    }
  }
  // Hashed files from older builds are never requested again.
  const runtime = await caches.open(RUNTIME);
  for (const req of await runtime.keys()) {
    if (!ASSETS.has(req.url)) await runtime.delete(req);
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache());
});

self.addEventListener('activate', (event) => {
  // claim() makes the first visit "offline ready" without a reload (useOfflineReady listens
  // for controllerchange).
  event.waitUntil(tidy().then(() => self.clients.claim()));
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

async function fromShell(key, request) {
  const hit = await caches.match(key, { cacheName: SHELL });
  return hit || fetch(request);
}

async function fromRuntime(event) {
  const { request } = event;
  const cache = await caches.open(RUNTIME);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok && res.type === 'basic' && !res.redirected) {
    event.waitUntil(cache.put(request, res.clone()));
  }
  return res;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || request.headers.has('range')) return;
  if (!request.url.startsWith(scope.href)) return; // other sites, including the model hub and CDN
  if (PASS_THROUGH.some((prefix) => request.url.startsWith(prefix))) return;

  const url = new URL(request.url);
  const key = url.origin + url.pathname; // ignore ?query and #hash when matching

  // Page loads of app routes (/, /studio, /settings#storage...) all get the app shell.
  // Paths with an extension (/third-party-notices.txt) are real files, handled below.
  if (request.mode === 'navigate' && !HAS_EXT.test(url.pathname)) {
    event.respondWith(fromShell(INDEX, request));
    return;
  }
  if (PRECACHED.has(key)) {
    event.respondWith(fromShell(key, request));
    return;
  }
  if (request.url.startsWith(ASSET_DIR)) {
    event.respondWith(fromRuntime(event));
  }
  // Anything else goes to the network as usual.
});
