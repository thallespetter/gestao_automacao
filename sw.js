/* ============================================================
   Service Worker – Gestão da Automação v48
   Network-first para HTML (garante atualizações imediatas)
   Cache-first para assets estáticos
   ============================================================ */

const CACHE_NAME = 'gda-v48';

/* Instalação */
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(['./manifest.json', './icon-192.png', './icon-512.png']);
      })
      .then(function() { return self.skipWaiting(); })
  );
});

/* Ativação: apaga TODOS os caches antigos */
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) {
              console.log('[SW] Deletando cache antigo:', k);
              return caches.delete(k);
            })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

/* Fetch: network-first para HTML, cache-first para o resto */
self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension://')) return;

  var isHTML = event.request.mode === 'navigate' ||
               event.request.url.endsWith('.html') ||
               event.request.url.endsWith('/');

  if (isHTML) {
    /* Network-first: garante que sempre pega a versão mais recente */
    event.respondWith(
      fetch(event.request)
        .then(function(response) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
          return response;
        })
        .catch(function() {
          return caches.match(event.request);
        })
    );
  } else {
    /* Cache-first para assets (fontes, ícones, etc.) */
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        if (cached) return cached;
        return fetch(event.request).then(function(response) {
          if (!response || response.status !== 200 || response.type === 'opaque') return response;
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
          return response;
        });
      })
    );
  }
});
