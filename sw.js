/* ══════════════════════════════════════════
   Service Worker – Gestão da Automação v44
   Cache-first para uso offline
   ══════════════════════════════════════════ */

const CACHE_NAME = 'gda-v47';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Share+Tech+Mono&family=Barlow+Condensed:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
];

/* Instalação: pré-cache dos assets principais */
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      /* Cache obrigatório (falha se não conseguir) */
      return cache.addAll(['./index.html', './manifest.json']).then(function() {
        /* Cache opcional (não falha se não conseguir) */
        return Promise.allSettled(
          ASSETS.filter(a => a !== './index.html' && a !== './manifest.json')
            .map(a => cache.add(a).catch(function(e) {
              console.warn('[SW] Não cacheado:', a, e.message);
            }))
        );
      });
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

/* Ativação: limpa caches antigos */
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

/* Fetch: cache-first com fallback para rede */
self.addEventListener('fetch', function(event) {
  /* Ignora requisições não-GET e extensões de browser */
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension://')) return;

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(response) {
        /* Cacheia apenas respostas válidas */
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        var toCache = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, toCache);
        });
        return response;
      }).catch(function() {
        /* Fallback offline: retorna index.html para navegação */
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
