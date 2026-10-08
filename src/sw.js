// The build replaces the version and asset list with content-derived values.
const CACHE = 'fangcun-static-__BUILD_VERSION__';
const ASSETS = []; // BUILD_ASSETS
const base = new URL('./', self.location.href);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS.map(asset => new URL(asset, base).href))));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith('fangcun-static-') && name !== CACHE) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'ACTIVATE_UPDATE') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) return;
  let asset = decodeURIComponent(url.pathname.slice(base.pathname.length));
  if (!asset) asset = 'index.html';
  if (asset === 'library' || asset === 'tutorials') asset += '.html';
  if (!ASSETS.includes(asset)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(new URL(asset, base).href);
    return cached || fetch(event.request);
  })());
});
