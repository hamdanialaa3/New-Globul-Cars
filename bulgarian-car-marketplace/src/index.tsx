// src/index.tsx
// Entry point for Bulgarian Car Marketplace

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initPerformanceMonitoring } from './utils/performance-monitoring';
import { logger } from './services/logger-service';
import { registerServiceWorker } from './utils/serviceWorkerRegistration';
import webVitalsTracker from './utils/webVitals';

// Import Firebase configuration
import './firebase/firebase-config';

// Validate environment variables (only in production to avoid breaking development)
if (process.env.NODE_ENV === 'production') {
  try {
    const { validateEnvironmentVariables } = require('./config/env-validation');
    validateEnvironmentVariables();
  } catch (error) {
    // Log error but don't block app startup in development
    if (error instanceof Error && error.name === 'EnvValidationError') {
      logger.error('Environment validation failed', error);
      logger.error('❌ Environment Variables Error', new Error(error.message));
    }
  }
}

// Bulgarian Car Marketplace
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register Service Worker with Workbox (production only)
// Re-enabled with proper cache strategy
if (process.env.NODE_ENV === 'production') {
  registerServiceWorker({
    onSuccess: () => {
      logger.info('✅ Content cached for offline use');
    },
    onUpdate: (registration) => {
      logger.info('🔄 New version available');
      // Show update notification to user
      const updateButton = document.createElement('div');
      updateButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #667eea;
        color: white;
        padding: 15px 25px;
        border-radius: 50px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        cursor: pointer;
        z-index: 9999;
        font-family: 'Martica', Arial, sans-serif;
      `;
      updateButton.textContent = '🔄 تحديث جديد متاح - انقر للتحديث';
      updateButton.onclick = () => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        window.location.reload();
      };
      document.body.appendChild(updateButton);
    },
  });
} else {
  logger.debug('Service Worker disabled in development mode');
}

// Install prompt
let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  logger.info('💡 PWA: Install prompt ready');
});

reportWebVitals();
