// Facebook Pixel Integration Component
// Tracks user behavior for advertising optimization
// Bulgarian Car Marketplace specific events

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

interface FacebookPixelProps {
  pixelId?: string;
}

let pendingEvents: Array<{ eventName: string; parameters?: Record<string, any> }> = [];
let pixelReady = false;

const getPixelConfig = () => {
  const id = process.env.REACT_APP_FACEBOOK_PIXEL_ID;
  const isExplicitlyEnabled = process.env.REACT_APP_ENABLE_PIXEL === 'true';
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    id,
    enabled: Boolean(id && (isProduction || isExplicitlyEnabled))
  };
};

const queueEvent = (eventName: string, parameters?: Record<string, any>) => {
  const { enabled } = getPixelConfig();
  if (!enabled) return;

  pendingEvents.push({ eventName, parameters });
};

const flushPendingEvents = () => {
  if (!window.fbq || !pixelReady) return;

  pendingEvents.forEach(({ eventName, parameters }) => {
    window.fbq('track', eventName, parameters);
  });
  pendingEvents = [];
};

const FacebookPixel: React.FC<FacebookPixelProps> = ({ pixelId }) => {
  const location = useLocation();
  
  const defaultPixelId = pixelId || process.env.REACT_APP_FACEBOOK_PIXEL_ID;
  const isExplicitlyEnabled = process.env.REACT_APP_ENABLE_PIXEL === 'true';
  const isProduction = process.env.NODE_ENV === 'production';
  const isPixelEnabled = Boolean(defaultPixelId && (isProduction || isExplicitlyEnabled));

  useEffect(() => {
    if (!isPixelEnabled) {
      // Silently return if not configured (no warning in production)
      return;
    }

    // Initialize Facebook Pixel
    const initPixel = () => {
      if (window.fbq) return;

      const script = document.createElement('script');
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${defaultPixelId}');
        fbq('track', 'PageView');
      `;
      
      document.head.appendChild(script);
      pixelReady = true;
      flushPendingEvents();

      // Noscript fallback
      const noscript = document.createElement('noscript');
      noscript.innerHTML = `
        <img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=${defaultPixelId}&ev=PageView&noscript=1" />
      `;
      document.body.appendChild(noscript);
    };

    initPixel();
  }, [defaultPixelId, isPixelEnabled]);

  // Track page views on route change
  useEffect(() => {
    if (window.fbq && isPixelEnabled) {
      window.fbq('track', 'PageView');
    } else if (isPixelEnabled) {
      queueEvent('PageView');
    }
  }, [location.pathname, isPixelEnabled]);

  return null;
};

export default FacebookPixel;

/**
 * Track custom events
 */
export const trackFacebookEvent = (
  eventName: string,
  parameters?: Record<string, any>
) => {
  const { enabled } = getPixelConfig();
  if (!enabled) return;

  if (window.fbq && pixelReady) {
    window.fbq('track', eventName, parameters);
    return;
  }

  queueEvent(eventName, parameters);
};

/**
 * Track car view event
 */
export const trackCarView = (carData: {
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
}) => {
  trackFacebookEvent('ViewContent', {
    content_name: `${carData.make} ${carData.model} ${carData.year}`,
    content_category: 'vehicle',
    content_type: 'product',
    value: carData.price,
    currency: carData.currency || 'EUR'
  });
};

/**
 * Track car search event
 */
export const trackCarSearch = (searchQuery: string) => {
  trackFacebookEvent('Search', {
    search_string: searchQuery,
    content_category: 'vehicle'
  });
};

/**
 * Track contact/lead event
 */
export const trackCarContact = (carData: {
  make: string;
  model: string;
  price: number;
}) => {
  trackFacebookEvent('Contact', {
    content_name: `${carData.make} ${carData.model}`,
    value: carData.price,
    currency: 'EUR'
  });
};

