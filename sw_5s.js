/* ══════════════════════════════════════
   Service Worker – Avaliação 5S v1
   Network-first para HTML, cache para assets
   ══════════════════════════════════════ */
const CACHE = 'avaliacao-5s-v1';

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      return c.addAll(['./manifest_5s.json','./icon-192.png','./icon-512.png']);
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if(e.request.method!=='GET') return;
  var isHTML = e.request.mode==='navigate'||e.request.url.endsWith('.html');
  if(isHTML){
    /* Network-first: always get latest version */
    e.respondWith(
      fetch(e.request).then(function(r){
        var clone=r.clone();
        caches.open(CACHE).then(function(c){c.put(e.request,clone);});
        return r;
      }).catch(function(){ return caches.match(e.request); })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(function(cached){
        if(cached) return cached;
        return fetch(e.request).then(function(r){
          var clone=r.clone();
          caches.open(CACHE).then(function(c){c.put(e.request,clone);});
          return r;
        });
      })
    );
  }
});
