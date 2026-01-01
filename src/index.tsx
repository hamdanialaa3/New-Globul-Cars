// src/index.tsx
// Entry point for Bulgarian Car Marketplace

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/global-glassmorphism-buttons.css'; // 🌟 تطبيق الأنماط الزجاجية على جميع الأزرار
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

// Clear browser cache in development mode
if (process.env.NODE_ENV === 'development') {
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
  
  // Add cache busting query parameter to all script/style tags in development
  if (typeof window !== 'undefined') {
    const timestamp = Date.now();
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    const scripts = document.querySelectorAll('script[src]');
    
    links.forEach((link: any) => {
      if (link.href && !link.href.includes('?v=')) {
        link.href += `?v=${timestamp}`;
      }
    });
    
    scripts.forEach((script: any) => {
      if (script.src && !script.src.includes('?v=')) {
        script.src += `?v=${timestamp}`;
      }
    });
  }
}

// Install prompt
let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  logger.info('💡 PWA: Install prompt ready');
});

reportWebVitals();
