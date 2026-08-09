// Stock Analyzer Pro — Service Worker
// Cache name is version-tagged: bump CACHE_NAME whenever index.html changes
// so returning users get the new version instead of being stuck on a stale
// cached copy forever (a common PWA bug).
const CACHE_NAME = 'stock-analyzer-pro-v38';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => { /* offline shell caching failed — app still works online */ })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Network-first for the HTML shell itself (so a live edit / version bump is
// picked up immediately on next load instead of serving a stale cached
// index.html), cache-first for static assets (icons, manifest).
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin GET requests — never intercept API calls to
  // Finnhub/FMP/Twelve Data/Yahoo/CORS proxies etc. Those must always hit
  // the network directly; caching or proxying them here would break live
  // price data and quota tracking.
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  const isAppShellDoc = event.request.mode === 'navigate' || url.pathname.endsWith('index.html') || url.pathname === '/' || url.pathname.endsWith('/');

  if (isAppShellDoc) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return res;
      });
    })
  );
});
