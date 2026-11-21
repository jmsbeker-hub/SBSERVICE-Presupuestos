const C = 'sbservice-v4';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k =>
          k.startsWith('sbservice-') && k !== C
        ).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;

  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(req, {cache: 'no-cache'})
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(C).then(cache => cache.put(req, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(req).then(saved =>
          saved || Response.error()
        )
      )
  );
});
