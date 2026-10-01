// sw.js corrigido
const CACHE_NAME = 'app-agricola-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './planting192.png',
  './planting512.png',
  './browser@4.js'
  
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Usamos addAll apenas para os arquivos locais essenciais do app
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
  // Ignora requisições que não sejam GET (como POST de formulários)
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cachedRes => {
      if (cachedRes) {
        // Retorna do cache se encontrar, mas busca em segundo plano para atualizar (Stale-While-Revalidate opcional)
        return cachedRes;
      }
      return fetch(e.request).then(networkRes => {
        // Opcional: você pode salvar arquivos externos (como CDNs) dinamicamente aqui se quiser
        return networkRes;
      }).catch(() => {
        // Fallback genérico caso a rede falhe e o arquivo não esteja no cache
        if (e.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
