#!/usr/bin/env node

/**
 * Generate Firebase Messaging Service Worker
 * This script creates the service worker file with Firebase config from environment variables
 */

const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '../public/firebase-messaging-sw.js');

// Get Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || ''
};

// Check if required config is available
const hasConfig = firebaseConfig.apiKey && firebaseConfig.projectId;

if (!hasConfig) {
  console.warn('⚠️  Firebase config not found in environment variables');
  console.warn('⚠️  Service worker will be generated without Firebase config');
  console.warn('⚠️  Make sure to set environment variables before deploying');
}

// Generate the service worker content
const serviceWorkerContent = `// Firebase Cloud Messaging Service Worker
// Generated automatically - DO NOT EDIT
// Last generated: ${new Date().toISOString()}

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration loaded from environment variables during build
firebase.initializeApp(${JSON.stringify(firebaseConfig, null, 2)});

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
`;

// Write the file
try {
  fs.writeFileSync(outputPath, serviceWorkerContent);
  console.log('✅ Firebase messaging service worker generated successfully');
  console.log(`   Output: ${outputPath}`);
  if (hasConfig) {
    console.log('   Status: Firebase config included');
  } else {
    console.log('   Status: Firebase config missing (will need to be regenerated)');
  }
} catch (error) {
  console.error('❌ Failed to generate service worker:', error.message);
  process.exit(1);
}
