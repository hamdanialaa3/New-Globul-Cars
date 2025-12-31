// Firebase Cloud Messaging Service Worker
// This is a template file - actual config is injected during build
// Run 'npm run generate-sw' to generate the service worker with Firebase config

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration - PLACEHOLDER (will be replaced during build)
// DO NOT hardcode real API keys here
firebase.initializeApp({
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('📬 Background Message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/Logo1.png',
    badge: '/Logo1.png',
    vibrate: [200, 100, 200],
    tag: payload.data?.type || 'default',
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'فتح', icon: '/Logo1.png' },
      { action: 'close', title: 'إغلاق' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
