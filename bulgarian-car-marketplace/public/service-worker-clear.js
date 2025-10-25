// 🔥 Emergency Service Worker Killer - clears ALL caches
self.addEventListener('install', (event) => {
  console.log('🔥 EMERGENCY SW: Installing and clearing all caches...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('🗑️ Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('✅ All caches cleared!');
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('🔥 EMERGENCY SW: Activating...');
  event.waitUntil(
    clients.claim().then(() => {
      console.log('✅ All clients claimed. Reloading...');
      return clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => client.navigate(client.url));
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Don't cache anything - fetch from network always
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('Offline', { status: 503 });
    })
  );
});

