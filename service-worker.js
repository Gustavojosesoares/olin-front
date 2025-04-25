const CACHE_NAME = 'olin-front-cache-v1';

// Arquivos essenciais que você quer ter no cache
const ESSENTIAL_FILES = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png',
  '/images/icon-1024x1024.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Cache apenas os arquivos essenciais para garantir que a aplicação funcione offline
        return cache.addAll(ESSENTIAL_FILES);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Se a resposta estiver no cache, retorna a resposta cacheada
        if (cachedResponse) {
          return cachedResponse;
        }

        // Se não estiver no cache, faz a requisição
        return fetch(event.request).then((response) => {
          // Só armazene no cache as requisições que precisam ser cacheadas
          if (event.request.url.includes('api') && response.ok) {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
              return response;
            });
          }
          return response;
        });
      })
  );
});
