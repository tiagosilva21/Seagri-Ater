// sw.js
const CACHE_NAME = 'app-agricola-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './planting192.png',
  './planting512.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method === 'GET') {
    e.respondWith(
      caches.match(e.request).then(res => res || fetch(e.request))
    );
  }
});
