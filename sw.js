/* =========================================================
   SERVICE WORKER - Gestão da Automação v.01
   Cache: gda-v01
   ========================================================= */
const CACHE_NAME = 'gda-v01';
const CACHE_FILES = ['./index.html','./manifest.json','./icon-192.png','./icon-512.png','./sw.js'];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(c){ return c.addAll(CACHE_FILES); })
    .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k!==CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if(e.request.method!=='GET') return;
  var isHTML = e.request.mode==='navigate'||e.request.url.endsWith('.html');
  if(isHTML){
    e.respondWith(fetch(e.request).then(function(r){
      var clone=r.clone();
      caches.open(CACHE_NAME).then(function(c){c.put(e.request,clone);});
      return r;
    }).catch(function(){ return caches.match(e.request); }));
  } else {
    e.respondWith(caches.match(e.request).then(function(c){ return c||fetch(e.request); }));
  }
});
