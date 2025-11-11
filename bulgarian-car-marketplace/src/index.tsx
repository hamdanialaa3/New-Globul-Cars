// src/index.tsx
// Entry point for Bulgarian Car Marketplace

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initPerformanceMonitoring } from './utils/performance-monitoring';
import { logger } from './services/logger-service';

// Import Firebase configuration
import './firebase/firebase-config';

// Bulgarian Car Marketplace
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('✅ PWA: Service Worker registered');
      })
      .catch(error => {
        console.log('❌ PWA: Service Worker registration failed:', error);
      });
  });
}

// Install prompt
let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('💡 PWA: Install prompt ready');
});

reportWebVitals();
