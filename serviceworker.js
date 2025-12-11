CACHE_NAME = 'v2'; // actualizar nro cada vez que actualizo otros archivos para que los recargue

const ASSETS = [
        './index.html',
        './estilos.css',
        './scripts.js',
        './logo.webp',
	'./cross-scratches.png'
];


// INSTALACIÓN
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});


// ACTIVACIÓN (limpia cachés viejos)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// FETCH pre-cache
const PRECACHE_URLS = new Set(ASSETS); // ← Set es mucho más rápido para búsquedas
// FETCH
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('./index.html')));
    return;
  }

  if (PRECACHE_URLS.has(new URL(event.request.url).pathname)) {
    event.respondWith(caches.match(event.request).then(r => r || fetch(event.request)));
  }
});
