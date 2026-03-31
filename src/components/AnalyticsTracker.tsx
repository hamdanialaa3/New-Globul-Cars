// src/components/AnalyticsTracker.tsx
// Centralized Google Analytics GA4 Route Tracker

import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsService, useAnalytics } from '../firebase/analytics-service';

/**
 * Global Route Tracker Component
 * 
 * Must be placed inside the React Router hierarchy (e.g., AppProviders.tsx)
 * Automatically tracks page views on location change and strictly sends them to native GA4.
 */
export const AnalyticsTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Determine friendly page name from route
    const path = location.pathname;
    let pageName = path;
    
    // Track the page view strictly to Native Firebase Analytics (no custom Firestore saving)
    analyticsService.trackPageView(pageName, `Page: ${pageName}`);
  }, [location]);

  return null;
};

// Re-export services so existing imports don't break
export { analyticsService, useAnalytics };
export default AnalyticsTracker;
