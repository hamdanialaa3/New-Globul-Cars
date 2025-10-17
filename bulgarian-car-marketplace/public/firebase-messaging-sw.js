// Firebase Cloud Messaging Service Worker
// Handles background push notifications
// الموقع: بلغاريا | المشروع: Fire New Globul

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration - Fire New Globul
const firebaseConfig = {
  apiKey: "AIzaSyAchmKCk8ipzv0dDwbQ2xU1Pa6o4CQsEu8",
  authDomain: "mobilebg.eu",
  projectId: "fire-new-globul",
  storageBucket: "fire-new-globul.firebasestorage.app",
  messagingSenderId: "973379297533",
  appId: "1:973379297533:web:59c6534d61a29cae5d9e94",
  measurementId: "G-TDRZ4Z3D7Z"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages (when app is in background/closed)
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  // Extract notification data
  const notificationTitle = payload.notification?.title || 'Globul Cars';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || '/logo192.png',
    badge: '/logo192.png',
    tag: payload.data?.type || 'default',
    data: payload.data || {},
    requireInteraction: payload.data?.requireInteraction === 'true',
    vibrate: [200, 100, 200],
    // Set URL for click action
    ...(payload.data?.url && { data: { ...payload.data, url: payload.data.url } })
  };

  // Show notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notification clicked:', event.notification.tag);
  
  event.notification.close();

  // Handle action clicks
  if (event.action) {
    console.log('Action clicked:', event.action);
  }

  // Open app or specific URL
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log('✅ Firebase Messaging Service Worker registered successfully');

