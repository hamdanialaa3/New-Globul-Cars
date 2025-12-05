import { logger } from '../services/logger-service';
// Service Worker Registration and Update Handler
// Registers the service worker and handles updates

interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

export function registerServiceWorker(config?: ServiceWorkerConfig): void {
  if (process.env.NODE_ENV !== 'production') {
    logger.info('⚠️ Service Worker: Skipping registration in development mode');
    return;
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          logger.info('✅ Service Worker registered successfully:', registration.scope);

          // Check for updates every hour
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // 1 hour

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) {
              return;
            }

            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New update available
                  logger.info('🔄 New content available; please refresh.');
                  
                  if (config?.onUpdate) {
                    config.onUpdate(registration);
                  } else {
                    // Default: prompt user to refresh
                    if (window.confirm('نسخة جديدة متاحة! هل تريد تحديث الصفحة؟')) {
                      window.location.reload();
                    }
                  }
                } else {
                  // Content cached for offline use
                  logger.info('✅ Content is cached for offline use.');
                  
                  if (config?.onSuccess) {
                    config.onSuccess(registration);
                  }
                }
              }
            };
          };
        })
        .catch((error) => {
          logger.error('❌ Service Worker registration failed:', error);
          
          if (config?.onError) {
            config.onError(error);
          }
        });
    });
  } else {
    logger.warn('⚠️ Service Worker not supported in this browser');
  }
}

export function unregisterServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
        logger.info('✅ Service Worker unregistered');
      })
      .catch((error) => {
        logger.error('❌ Service Worker unregistration failed:', error);
      });
  }
}

// Skip waiting and activate new service worker immediately
export function skipWaitingAndActivate(): void {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
}

// Check if there's an update available
export async function checkForUpdates(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        return registration.waiting !== null;
      }
    } catch (error) {
      logger.error('Error checking for updates:', error);
    }
  }
  return false;
}

// Get cache statistics
export async function getCacheStats(): Promise<{
  caches: number;
  totalSize: number;
  cacheNames: string[];
}> {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }

      return {
        caches: cacheNames.length,
        totalSize: totalSize,
        cacheNames: cacheNames,
      };
    } catch (error) {
      logger.error('Error getting cache stats:', error);
    }
  }

  return {
    caches: 0,
    totalSize: 0,
    cacheNames: [],
  };
}

// Clear all caches
export async function clearAllCaches(): Promise<void> {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
    logger.info('✅ All caches cleared');
  }
}

export default {
  register: registerServiceWorker,
  unregister: unregisterServiceWorker,
  skipWaiting: skipWaitingAndActivate,
  checkForUpdates,
  getCacheStats,
  clearAllCaches,
};
