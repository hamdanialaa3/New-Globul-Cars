// src/hooks/usePWA.ts
// Custom hook for PWA functionality
// Custom hook for PWA functionality

import { useState, useEffect } from 'react';
import { logger } from '@/services/logger-service';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  registration: ServiceWorkerRegistration | null;
}

export const usePWA = () => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    deferredPrompt: null,
    registration: null,
  });

  // Register service worker
  useEffect(() => {
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          });

          if (process.env.NODE_ENV === 'development') {
            logger.debug('Service Worker registered successfully');
          }

          setPwaState(prev => ({
            ...prev,
            registration,
          }));

          // Handle updates
          const handleUpdateFound = () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', handleWorkerStateChange);
            }
          };

          const handleWorkerStateChange = () => {
            if (registration.installing?.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, notify user (dev only)
              if (process.env.NODE_ENV === 'development') {
                logger.debug('New content is available and will be used when all tabs are closed.');
              }
            }
          };

          registration.addEventListener('updatefound', handleUpdateFound);

        } catch (error) {
          logger.error('Service Worker registration failed', error as Error);
        }
      }
    };

    registerServiceWorker();
  }, []);

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Install prompt event fired');
      }

      setPwaState(prev => ({
        ...prev,
        isInstallable: true,
        deferredPrompt: e as BeforeInstallPromptEvent,
      }));
    };

    const handleAppInstalled = () => {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('App was installed');
      }
      setPwaState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        deferredPrompt: null,
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setPwaState(prev => ({
        ...prev,
        isOnline: true,
      }));
    };

    const handleOffline = () => {
      setPwaState(prev => ({
        ...prev,
        isOnline: false,
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Install the app
  const installApp = async () => {
    if (!pwaState.deferredPrompt) {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('No install prompt available');
      }
      return false;
    }

    try {
      await pwaState.deferredPrompt.prompt();
      const { outcome } = await pwaState.deferredPrompt.userChoice;

      if (process.env.NODE_ENV === 'development') {
        logger.debug('Install outcome', { outcome });
      }

      setPwaState(prev => ({
        ...prev,
        isInstallable: false,
        deferredPrompt: null,
      }));

      return outcome === 'accepted';
    } catch (error) {
      logger.error('Install failed', error as Error);
      return false;
    }
  };

  // Update service worker
  const updateServiceWorker = async () => {
    if (!pwaState.registration) {
      return false;
    }

    try {
      await pwaState.registration.update();
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Service Worker updated');
      }
      return true;
    } catch (error) {
      logger.error('Service Worker update failed', error as Error);
      return false;
    }
  };

  // Skip waiting for service worker update
  const skipWaiting = async () => {
    if (!pwaState.registration) {
      return false;
    }

    const newWorker = pwaState.registration.waiting;
    if (newWorker) {
      newWorker.postMessage({ type: 'SKIP_WAITING' });
      return true;
    }

    return false;
  };

  // Check if app is running in standalone mode
  const isStandalone = () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  };

  return {
    ...pwaState,
    isStandalone: isStandalone(),
    installApp,
    updateServiceWorker,
    skipWaiting,
  };
};

export default usePWA;