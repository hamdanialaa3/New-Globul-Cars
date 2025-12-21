// Facebook SDK Loader Utility
// Loads and initializes Facebook JavaScript SDK

import { logger } from '../services/logger-service';

interface FacebookSDKConfig {
  appId: string;
  version?: string;
  cookie?: boolean;
  xfbml?: boolean;
  autoLogAppEvents?: boolean;
}

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

let sdkLoaded = false;
let sdkLoading = false;

/**
 * Load Facebook SDK
 */
export const loadFacebookSDK = (config: FacebookSDKConfig): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (sdkLoaded) {
      resolve();
      return;
    }

    if (sdkLoading) {
      const checkInterval = setInterval(() => {
        if (sdkLoaded) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      return;
    }

    sdkLoading = true;

    // Initialize FB SDK when ready
    window.fbAsyncInit = function() {
      if (window.FB) {
        window.FB.init({
          appId: config.appId,
          cookie: config.cookie !== false,
          xfbml: config.xfbml !== false,
          version: config.version || 'v18.0',
          autoLogAppEvents: config.autoLogAppEvents !== false
        });

        sdkLoaded = true;
        sdkLoading = false;
        resolve();
      }
    };

    // Load SDK script
    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    
    script.onerror = () => {
      sdkLoading = false;
      reject(new Error('Failed to load Facebook SDK'));
    };

    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    }
  });
};

/**
 * Check if Facebook SDK is loaded
 */
export const isFacebookSDKLoaded = (): boolean => {
  return sdkLoaded && typeof window.FB !== 'undefined';
};

/**
 * Get Facebook login status
 */
export const getFacebookLoginStatus = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!isFacebookSDKLoaded()) {
      reject(new Error('Facebook SDK not loaded'));
      return;
    }

    window.FB.getLoginStatus((response: any) => {
      resolve(response);
    });
  });
};

/**
 * Initialize Facebook for Bulgarian Car Marketplace
 */
export const initializeFacebookSDK = async (): Promise<void> => {
  const appId = process.env.REACT_APP_FACEBOOK_APP_ID;
  
  if (!appId) {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('Facebook App ID not configured');
    }
    return;
  }

  try {
    await loadFacebookSDK({
      appId,
      version: 'v18.0',
      cookie: true,
      xfbml: true,
      autoLogAppEvents: true
    });
    
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Facebook SDK initialized successfully');
    }
  } catch (error) {
    logger.error('Failed to initialize Facebook SDK', error as Error);
  }
};

