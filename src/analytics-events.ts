// src/analytics-events.ts
// Centralized analytics events configuration

import React from 'react';
import { analyticsService } from './services/analytics/UnifiedAnalyticsService';

/**
 * Home Page Analytics Events
 */
export const homePageEvents = {
  // DealerSpotlight
  dealerSpotlightView: (dealerCount: number) => 
    analyticsService.trackEvent('home_dealerspotlight_view', { dealerCount }),
  
  dealerSpotlightClickDealer: (dealerId: string) => 
    analyticsService.trackEvent('home_dealerspotlight_click_dealer', { dealerId }),
  
  dealerSpotlightViewAll: () => 
    analyticsService.trackEvent('home_dealerspotlight_view_all', {}),

  // LifeMomentsBrowse
  lifeMomentsView: (momentCount: number) => 
    analyticsService.trackEvent('home_lifemoments_view', { momentCount }),
  
  lifeMomentsClick: (momentKey: string) => 
    analyticsService.trackEvent('home_lifemoments_click', { momentKey }),

  // LoyaltyBanner
  loyaltyBannerView: () => 
    analyticsService.trackEvent('home_loyaltybanner_view', {}),
  
  loyaltyBannerSignupClick: () => 
    analyticsService.trackEvent('home_loyaltybanner_signup_click', {}),
  
  loyaltyBannerSigninClick: () => 
    analyticsService.trackEvent('home_loyaltybanner_signin_click', {}),

  // TrustStrip
  trustStripView: () => 
    analyticsService.trackEvent('home_truststrip_view', {}),
  
  trustStripBrowseClick: () => 
    analyticsService.trackEvent('home_truststrip_cta_browse', {}),
  
  trustStripSellClick: () => 
    analyticsService.trackEvent('home_truststrip_cta_sell', {}),
};

/**
 * Map Page Analytics Events
 */
export const mapPageEvents = {
  mapPageView: () => 
    analyticsService.trackEvent('mapPage_view', {}),
  
  mapPageToggleLayer: (layerName: string, enabled: boolean) => 
    analyticsService.trackEvent('mapPage_toggle_layer', { layerName, enabled }),
};

/**
 * Utility: Hook for page view tracking
 */
export const usePageAnalytics = (eventName: string) => {
  React.useEffect(() => {
    analyticsService.trackEvent(eventName, {
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });
  }, [eventName]);
};

export default homePageEvents;
