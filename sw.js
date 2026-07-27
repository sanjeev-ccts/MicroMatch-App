const CACHE = 'thali-v2.42';
const ASSETS = ['./health.html', './manifest.json', './my-icon.png', './login-bg.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first: always try to fetch the latest version when online (so
// updates reach the user immediately), and only fall back to the cached
// copy when offline. The old cache-first strategy meant health.html would
// be served from cache forever after the first visit, silently hiding every
// future update until the CACHE name was manually bumped.
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).then(res => {
      const resClone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, resClone));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
