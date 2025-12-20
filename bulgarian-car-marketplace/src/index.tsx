// src/index.tsx
// Entry point for Bulgarian Car Marketplace

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initPerformanceMonitoring } from './utils/performance-monitoring';
import { logger } from './services/logger-service';
import { registerServiceWorker, unregisterServiceWorker } from './utils/serviceWorkerRegistration';
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
      logger.info('🔄 New version available - Auto-updating...');
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    },
  });
} else {
  logger.debug('Service Worker disabled in development mode');
  unregisterServiceWorker();
}

// Install prompt
let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  logger.info('💡 PWA: Install prompt ready');
});

reportWebVitals();
