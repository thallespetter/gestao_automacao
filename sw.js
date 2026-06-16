/* Service Worker – Gestão da Automação v2 */
const CACHE_NAME = 'gda-v2';
const CACHE_FILES = [
  './index.html',
  './manifest.json',
  './ícone-192.png',
  './ícone-512.png'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(c){ return c.addAll(CACHE_FILES); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k!==CACHE_NAME; })
            .map(function(k){ return caches.delete(k); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if(e.request.method!=='GET') return;
  var isHTML = e.request.mode==='navigate'
    || e.request.url.endsWith('.html')
    || e.request.url.endsWith('/');
  if(isHTML){
    e.respondWith(
      fetch(e.request, {cache:'no-store'}).catch(function(){
        return caches.match('./index.html');
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(function(c){ return c||fetch(e.request); })
    );
  }
});
