// Minimal Service Worker for PWA functionality
// This is a basic service worker that handles installation and activation

const CACHE_NAME = 'mobilebg-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache opened');
        return cache.addAll(urlsToCache).catch((error) => {
          console.warn('Service Worker: Some files failed to cache', error);
          // Don't fail the entire installation if some files can't be cached
          return Promise.resolve();
        });
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Clearing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        // Claim all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline, otherwise fetch from network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // IMPORTANT: Skip all external/cross-origin requests completely
  // Let them pass through directly without Service Worker intervention
  if (!url.origin.startsWith(self.location.origin)) {
    return;
  }

  // Skip Firebase/Firestore API requests - these need direct network access
  const skipDomains = [
    'firestore.googleapis.com',
    'firebase.googleapis.com',
    'firebasestorage.googleapis.com',
    'identitytoolkit.googleapis.com',
    'securetoken.googleapis.com',
    'www.googleapis.com',
    'fcm.googleapis.com',
    'maps.googleapis.com',
    'algolia.net',
    'algolianet.com',
  ];

  if (skipDomains.some(domain => url.hostname.includes(domain))) {
    // Let these requests pass through without Service Worker intervention
    return;
  }

  // Skip API calls and dynamic content
  if (url.pathname.includes('/api/') || 
      url.pathname.includes('/graphql') ||
      url.search.includes('gsessionid=') || // Firestore session
      url.search.includes('RID=rpc')) {     // Firebase RPC
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Only cache static assets (images, CSS, JS, fonts) from same origin
            const cacheableTypes = [
              'image/', 
              'text/css', 
              'text/javascript', 
              'application/javascript', 
              'font/'
            ];
            
            const contentType = response.headers.get('content-type') || '';
            const shouldCache = cacheableTypes.some(type => contentType.includes(type));

            if (shouldCache) {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                })
                .catch(() => {
                  // Ignore cache errors
                });
            }

            return response;
          })
          .catch(() => {
            // If both cache and network fail, show offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            // For other requests, just fail silently (no response)
            return undefined;
          });
      })
  );
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
