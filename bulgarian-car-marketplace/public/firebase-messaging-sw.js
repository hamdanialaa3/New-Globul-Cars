// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAUYM_qygK5pUrlXtdDLmEi-_Kh9SyvRmk",
  authDomain: "fire-new-globul.firebaseapp.com",
  projectId: "fire-new-globul",
  storageBucket: "fire-new-globul.firebasestorage.app",
  messagingSenderId: "973379297533",
  appId: "1:973379297533:web:59c6534d61a29cae5d9e94"
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
