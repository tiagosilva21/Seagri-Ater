// sw.js corrigido
const CACHE_NAME = 'app-agricola-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './planting192.png',
  './planting512.png'
  // A CDN foi removida daqui para evitar falhas de instalação offline
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // Limpa caches antigos
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cachedRes => {
      if (cachedRes) {
        return cachedRes;
      }
      return fetch(e.request).then(networkRes => {
        // Opcional: Se quiser salvar a CDN ou outros arquivos externos dinamicamente no cache quando baixar:
        if (e.request.url.includes('cdn.jsdelivr.net')) {
          const responseClone = networkRes.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, responseClone);
          });
        }
        return networkRes;
      }).catch(() => {
        if (e.request.headers.get('accept') && e.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
