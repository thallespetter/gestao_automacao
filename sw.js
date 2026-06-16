/* Service Worker – GDE v7 */
const CACHE_NAME = 'gde-v7';

self.addEventListener('install', function(e){
  e.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys()
      .then(function(keys){ return Promise.all(keys.map(function(k){ return caches.delete(k); })); })
      .then(function(){ return self.clients.claim(); })
  );
});
self.addEventListener('fetch', function(e){
  if(e.request.method!=='GET') return;
  /* HTML: sempre da rede, nunca do cache */
  var isHTML=e.request.mode==='navigate'||e.request.url.endsWith('.html')||e.request.url.endsWith('/');
  if(isHTML){
    e.respondWith(fetch(e.request,{cache:'no-store'}));
  }
  /* demais assets: cache normal */
});
