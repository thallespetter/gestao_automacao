/* =========================================================
   SERVICE WORKER – Avaliação 5S v1
   Cache: avaliacao-5s-v1
   ========================================================= */
const CACHE_NAME = 'avaliacao-5s-v1';
const CACHE_FILES = [
  './senso_form.html',
  './manifest_5s.json',
  './ícone_5s_192.png',
  './ícone_5s_512.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(c) {
      return c.addAll(CACHE_FILES);
    }).then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  var isHTML = e.request.mode === 'navigate' || e.request.url.endsWith('.html');
  if (isHTML) {
    // Network-first para HTML: sempre busca versão mais recente
    e.respondWith(
      fetch(e.request).then(function(r) {
        var clone = r.clone();
        caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); });
        return r;
      }).catch(function() { return caches.match(e.request); })
    );
  } else {
    // Cache-first para assets estáticos
    e.respondWith(
      caches.match(e.request).then(function(cached) {
        if (cached) return cached;
        return fetch(e.request).then(function(r) {
          var clone = r.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); });
          return r;
        });
      })
    );
  }
});
