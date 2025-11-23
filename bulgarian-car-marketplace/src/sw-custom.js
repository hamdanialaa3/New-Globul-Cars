// Custom Service Worker with Workbox
/* eslint-disable no-restricted-globals */

// Import Workbox from CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

// Enable debug logging in development
workbox.setConfig({ debug: false });

const { clientsClaim } = workbox.core;
const { ExpirationPlugin } = workbox.expiration;
const { precacheAndRoute, createHandlerBoundToURL } = workbox.precaching;
const { registerRoute, NavigationRoute } = workbox.routing;
const { NetworkFirst, StaleWhileRevalidate, CacheFirst } = workbox.strategies;
const { CacheableResponsePlugin } = workbox.cacheableResponse;

// Take control immediately
clientsClaim();
self.skipWaiting();

// Precache all assets (injected by Workbox at build time)
precacheAndRoute(self.__WB_MANIFEST || []);

// App Shell - NetworkFirst with fast timeout
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'app-shell',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxAgeSeconds: 24 * 60 * 60 }), // 24 hours
    ],
  })
);

// Firebase API - StaleWhileRevalidate for fresh data with fallback
registerRoute(
  ({ url }) => url.origin === 'https://firestore.googleapis.com' 
    || url.origin === 'https://firebase.googleapis.com'
    || url.hostname.includes('firebaseio.com'),
  new StaleWhileRevalidate({
    cacheName: 'firebase-api',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
    ],
  })
);

// Images - CacheFirst with long expiration
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Static assets (JS, CSS) - StaleWhileRevalidate for updates
registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  })
);

// Fonts - CacheFirst with very long expiration
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'fonts',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      }),
    ],
  })
);

// Google Maps - StaleWhileRevalidate
registerRoute(
  ({ url }) => url.origin === 'https://maps.googleapis.com' 
    || url.origin === 'https://maps.gstatic.com',
  new StaleWhileRevalidate({
    cacheName: 'google-maps',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
    ],
  })
);

// External APIs - NetworkFirst with timeout
registerRoute(
  ({ url }) => url.origin !== self.location.origin && !url.pathname.startsWith('/static/'),
  new NetworkFirst({
    cacheName: 'external-api',
    networkTimeoutSeconds: 5,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 10 * 60, // 10 minutes
      }),
    ],
  })
);

// Offline fallback
const FALLBACK_HTML_URL = '/offline.html';
const FALLBACK_IMAGE_URL = '/offline-image.png';

// Cache fallback pages during install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('offline-fallbacks').then((cache) => {
      return cache.addAll([FALLBACK_HTML_URL, FALLBACK_IMAGE_URL]);
    })
  );
});

// Serve fallback pages when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(FALLBACK_HTML_URL);
      })
    );
  } else if (request.destination === 'image') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(FALLBACK_IMAGE_URL);
      })
    );
  }
});

// Clean up old caches on activation
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [
    'app-shell',
    'firebase-api',
    'images',
    'static-resources',
    'fonts',
    'google-maps',
    'external-api',
    'offline-fallbacks',
  ];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName) && !cacheName.startsWith('workbox-precache')) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker loaded successfully ✅');
