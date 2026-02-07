import { logger } from '../services/logger-service';
// Google Analytics 4 Integration (FREE - Unlimited events)
// Track user behavior, conversions, and business metrics
// UPDATED: Integrated with Consent Mode v2 for GDPR compliance
// 
// Property Information:
// Account ID: 368904922
// Property ID: 507597643
// Measurement ID: G-R8JY5KM421
// Data Deletion: https://analytics.google.com/analytics/web/?authuser=1#/a368904922p507597643/admin/piidatadeletion/table

import ReactGA from 'react-ga4';
import { initConsentMode, applySavedConsent } from './consent-mode';

/**
 * Initialize Google Analytics 4 with Consent Mode v2
 * FREE - Unlimited events and users
 * GDPR-compliant with consent management
 * 
 * Add to App.tsx:
 * import { initGA } from './utils/google-analytics';
 * useEffect(() => { initGA(); }, []);
 */
export const initGA = (measurementId: string = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || import.meta.env.VITE_GA4_MEASUREMENT_ID || 'G-R8JY5KM421') => {
  if (!measurementId) {
    logger.warn('GA4 Measurement ID not configured - add REACT_APP_FIREBASE_MEASUREMENT_ID to .env');
    return;
  }
  
  // CRITICAL: Initialize Consent Mode BEFORE GA4
  initConsentMode();
  applySavedConsent();
  
  ReactGA.initialize(measurementId, {
    gaOptions: {
      send_page_view: false, // We'll send manually
      anonymize_ip: true, // GDPR compliance (FREE)
    }
  });
  
  logger.info('✅ Google Analytics 4 initialized with Consent Mode v2');
};

/**
 * Track page views (FREE)
 * Call on route change
 */
export const trackPageView = (path: string, title?: string) => {
  ReactGA.send({
    hitType: 'pageview',
    page: path,
    title: title || document.title
  });
};

/**
 * Track custom events (FREE - Unlimited)
 * Categories: User actions, business metrics, conversions
 */
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  ReactGA.event({
    category,
    action,
    label,
    value
  });
};

// ========== Car Listing Events (FREE) ==========

/**
 * Track car view event with numeric IDs for Google Ads/Merchant Center
 * UPDATED: Now includes sellerNumericId and carNumericId
 */
export const trackCarView = (
  carId: string,
  make: string,
  model: string,
  price: number,
  sellerNumericId?: number,
  carNumericId?: number
) => {
  trackEvent('Car Listing', 'View Car', `${make} ${model}`, price);
  
  // Enhanced ecommerce event (FREE - helps with Google Ads)
  ReactGA.event('view_item', {
    currency: 'EUR',
    value: price,
    items: [{
      item_id: carId,
      item_name: `${make} ${model}`,
      item_category: 'Car',
      price: price,
      // CRITICAL: Add numeric IDs for Google Merchant Center tracking
      ...(sellerNumericId && { seller_numeric_id: sellerNumericId }),
      ...(carNumericId && { car_numeric_id: carNumericId })
    }]
  });
  
  // Additional custom dimensions for better tracking
  if (sellerNumericId && carNumericId) {
    (window as any).gtag?.('event', 'car_view_numeric', {
      seller_numeric_id: sellerNumericId,
      car_numeric_id: carNumericId,
      make: make,
      model: model,
      price: price
    });
  }
};

export const trackCarSearch = (query: string, filters: any) => {
  trackEvent('Search', 'Car Search', query);
  
  ReactGA.event('search', {
    search_term: query,
    filters: JSON.stringify(filters)
  });
};

/**
 * Track contact seller event with numeric IDs
 * UPDATED: Includes numeric IDs for conversion tracking
 */
export const trackCarContact = (
  carId: string,
  method: 'phone' | 'whatsapp' | 'message',
  sellerNumericId?: number,
  carNumericId?: number
) => {
  trackEvent('Conversion', 'Contact Seller', method);
  
  ReactGA.event('generate_lead', {
    currency: 'EUR',
    value: 1, // Lead value
    method: method,
    car_id: carId,
    // Add numeric IDs for better conversion tracking
    ...(sellerNumericId && { seller_numeric_id: sellerNumericId }),
    ...(carNumericId && { car_numeric_id: carNumericId })
  });
  
  // Additional event for Google Ads conversion tracking
  if (sellerNumericId && carNumericId) {
    (window as any).gtag?.('event', 'contact_seller', {
      event_category: 'engagement',
      event_label: `${sellerNumericId}/${carNumericId}`,
      value: 1
    });
    
    // Track as Google Ads lead (async import)
    import('../services/analytics/google-ads-integration.service').then(({ default: googleAdsService }) => {
      googleAdsService.trackLead(carId, method, 10); // Default value: 10 EUR per lead
    }).catch(() => {
      // Silent fail if service not available
    });
  }
};

export const trackCarFavorite = (carId: string, action: 'add' | 'remove') => {
  trackEvent('Engagement', action === 'add' ? 'Add to Favorites' : 'Remove from Favorites', carId);
  
  if (action === 'add') {
    ReactGA.event('add_to_wishlist', {
      items: [{ item_id: carId }]
    });
  }
};

// ========== Listing Creation Events (FREE) ==========

export const trackListingStart = (sellerType: 'private' | 'dealer' | 'company') => {
  trackEvent('Sell Workflow', 'Start Listing', sellerType);
  
  ReactGA.event('begin_checkout', { // Reuse ecommerce event
    seller_type: sellerType
  });
};

export const trackListingStep = (step: string, stepNumber: number) => {
  trackEvent('Sell Workflow', 'Complete Step', step, stepNumber);
  
  ReactGA.event('checkout_progress', {
    checkout_step: stepNumber,
    checkout_option: step
  });
};

export const trackListingComplete = (carId: string, price: number, plan: string) => {
  trackEvent('Conversion', 'Listing Published', plan, price);
  
  // Ultimate conversion event (FREE - Google loves this!)
  ReactGA.event('purchase', {
    transaction_id: carId,
    value: 0, // Free listing
    currency: 'EUR',
    items: [{
      item_id: 'listing_' + plan,
      item_name: `Car Listing - ${plan}`,
      price: 0
    }]
  });
};

export const trackListingAbandonment = (step: string, reason?: string) => {
  trackEvent('Sell Workflow', 'Abandon Listing', step);
  
  ReactGA.event('abandon_cart', {
    step: step,
    reason: reason
  });
};

// ========== User Events (FREE) ==========

export const trackSignUp = (method: 'email' | 'google' | 'facebook') => {
  trackEvent('User', 'Sign Up', method);
  
  ReactGA.event('sign_up', {
    method: method
  });
};

export const trackLogin = (method: 'email' | 'google' | 'facebook') => {
  trackEvent('User', 'Login', method);
  
  ReactGA.event('login', {
    method: method
  });
};

export const trackProfileComplete = (profileType: 'private' | 'dealer' | 'company') => {
  trackEvent('User', 'Complete Profile', profileType);
  
  ReactGA.event('tutorial_complete', {
    profile_type: profileType
  });
};

export const trackSubscription = (plan: string, price: number, interval: 'monthly' | 'yearly') => {
  trackEvent('Revenue', 'Subscribe', plan, price);
  
  // Revenue tracking (FREE - critical for ROI)
  ReactGA.event('purchase', {
    transaction_id: `sub_${Date.now()}`,
    value: price,
    currency: 'EUR',
    items: [{
      item_id: 'subscription_' + plan,
      item_name: `${plan} Plan`,
      price: price,
      quantity: 1
    }]
  });
};

// ========== Engagement Events (FREE) ==========

export const trackShare = (platform: 'facebook' | 'twitter' | 'whatsapp' | 'copy', carId?: string) => {
  trackEvent('Engagement', 'Share', platform);
  
  ReactGA.event('share', {
    method: platform,
    content_type: carId ? 'car_listing' : 'page',
    item_id: carId
  });
};

export const trackFilter = (filterType: string, filterValue: string) => {
  trackEvent('Search', 'Apply Filter', `${filterType}: ${filterValue}`);
};

export const trackError = (errorType: string, errorMessage: string) => {
  trackEvent('Error', errorType, errorMessage);
  
  ReactGA.event('exception', {
    description: `${errorType}: ${errorMessage}`,
    fatal: false
  });
};

// ========== Business Metrics (FREE - Custom dimensions) ==========

export const setUserProperties = (userId: string, properties: {
  profileType?: 'private' | 'dealer' | 'company';
  verified?: boolean;
  plan?: string;
  listingsCount?: number;
}) => {
  ReactGA.set({ userId });
  ReactGA.set(properties);
};

/**
 * Track custom conversion goal (FREE)
 * Examples: Newsletter signup, app download, social follow
 */
export const trackConversion = (goalName: string, value?: number) => {
  trackEvent('Conversion', goalName, undefined, value);
  
  ReactGA.event('conversion', {
    send_to: goalName,
    value: value
  });
};

/**
 * Setup page view tracking with React Router (FREE)
 * Add to App.tsx:
 * 
 * import { useLocation } from 'react-router-dom';
 * import { trackPageView } from './utils/google-analytics';
 * 
 * const location = useLocation();
 * useEffect(() => {
 *   trackPageView(location.pathname);
 * }, [location]);
 */

export default {
  initGA,
  trackPageView,
  trackEvent,
  trackCarView,
  trackCarSearch,
  trackCarContact,
  trackCarFavorite,
  trackListingStart,
  trackListingStep,
  trackListingComplete,
  trackListingAbandonment,
  trackSignUp,
  trackLogin,
  trackProfileComplete,
  trackSubscription,
  trackShare,
  trackFilter,
  trackError,
  setUserProperties,
  trackConversion
};
