const CACHE_NAME = 'agri-expert-cache-v1';
const urlsToCache = [
  '/chat/',
  '/chat/index.html'
];

// Install a service worker
self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
  // Let browser handle non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // For HTML pages, use a network-first strategy to get the latest version
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }
  
  // For other assets, use a cache-first strategy for performance
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchResponse => {
        // Optional: Cache new assets as they are fetched
        return caches.open(CACHE_NAME).then(cache => {
           // We don't want to cache API calls to generative language model
          if (!event.request.url.includes('generativelanguage')) {
            cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    })
  );
});

// Update a service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
