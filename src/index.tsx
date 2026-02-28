// src/index.tsx
// Entry point for Koli One

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/mobile-responsive.css';  // 📱 Mobile/tablet responsive rules
// NOTE: global-glassmorphism-buttons.css DISABLED — was applying !important overrides
// to ALL <button> elements site-wide, destroying component-level styles (border-radius,
// background, box-shadow). Component-specific glass effects use glassmorphism-buttons.ts mixins.
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initPerformanceMonitoring } from './utils/performance-monitoring';
import { logger } from './services/logger-service';
import { registerServiceWorker, unregisterServiceWorker } from './utils/serviceWorkerRegistration';
import webVitalsTracker from './utils/webVitals';

// Import Firebase configuration
import './firebase/firebase-config';

// Validate environment variables (only in production to avoid breaking development)
if (import.meta.env.PROD) {
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

// Clear browser cache in development mode
if (import.meta.env.DEV) {
  // Force clear localStorage cache keys that might cause stale data
  const cacheKeys = ['workflow_draft', 'current_draft_id', 'favorites_cache', 'user_preferences'];
  cacheKeys.forEach(key => {
    try {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        logger.debug(`Cleared localStorage key: ${key}`);
      }
    } catch (e) {
      // Ignore errors
    }
  });

  // Clear sessionStorage
  try {
    sessionStorage.clear();
    logger.debug('Cleared sessionStorage');
  } catch (e) {
    // Ignore errors
  }
}

// Koli One
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
if (import.meta.env.PROD) {
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
  // Force unregister and clear all caches in development
  unregisterServiceWorker();

  // Clear all caches in development mode to prevent stale content
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      if (cacheNames.length > 0) {
        logger.debug(`Clearing ${cacheNames.length} caches in development mode...`);
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
          logger.debug(`Cleared cache: ${cacheName}`);
        });
      }
    }).catch(err => {
      logger.debug('Cache clearing error (non-critical):', err);
    });
  }

  // Cache busting removed – Vite handles this via hashed filenames in production
  // and HMR in development. The old code was running in production due to
  // vite-plugin-node-polyfills overriding process.env.NODE_ENV, causing CSS
  // to be re-fetched with ?v= params (doubling network requests).
}

// Install prompt handled by usePWA hook and InstallPrompt component
// window.addEventListener('beforeinstallprompt', (e) => { ... });

reportWebVitals();
