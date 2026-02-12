import { normalizeError } from '@/utils/error-helpers';import { logger } from '../services/logger-service';
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private events: AnalyticsEvent[] = [];

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  trackEvent(event: AnalyticsEvent) {
    this.events.push({
      ...event,
      timestamp: new Date().toISOString()
    } as AnalyticsEvent & { timestamp: string });

    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(event);
    } else {
      logger.info('Analytics Event:', event);
    }
  }

  trackPageView(page: string) {
    this.trackEvent({
      action: 'page_view',
      category: 'navigation',
      label: page
    });
  }

  trackSearch(query: string, resultsCount: number) {
    this.trackEvent({
      action: 'search',
      category: 'search',
      label: query,
      value: resultsCount
    });
  }

  trackCarView(carId: string, carTitle: string) {
    this.trackEvent({
      action: 'car_view',
      category: 'engagement',
      label: carTitle
    });
  }

  trackFilterUsage(filterType: string, filterValue: string) {
    this.trackEvent({
      action: 'filter_used',
      category: 'search',
      label: `${filterType}: ${filterValue}`
    });
  }

  trackUserAction(action: string, details?: string) {
    this.trackEvent({
      action,
      category: 'user_interaction',
      label: details
    });
  }

  private async sendToAnalytics(event: AnalyticsEvent) {
    // Skip network writes in development; log locally
    if (process.env.NODE_ENV === 'development') {
      logger.info('Analytics event (dev mode):', event);
      return;
    }

    try {
      await addDoc(collection(db, 'analytics_events'), {
        ...event,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      logger.error('Analytics persistence error:', error);
    }
  }

  getEvents(): (AnalyticsEvent & { timestamp: string })[] {
    return this.events as (AnalyticsEvent & { timestamp: string })[];
  }

  clearEvents() {
    this.events = [];
  }
}

export const analyticsService = AnalyticsService.getInstance();

// Analytics Tracker Component
export const AnalyticsTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page views
    analyticsService.trackPageView(location.pathname);
  }, [location]);

  return null;
};

// Hook for tracking events
export const useAnalytics = () => {
  const trackEvent = (event: AnalyticsEvent) => {
    analyticsService.trackEvent(event);
  };

  const trackSearch = (query: string, resultsCount: number) => {
    analyticsService.trackSearch(query, resultsCount);
  };

  const trackCarView = (carId: string, carTitle: string) => {
    analyticsService.trackCarView(carId, carTitle);
  };

  const trackFilterUsage = (filterType: string, filterValue: string) => {
    analyticsService.trackFilterUsage(filterType, filterValue);
  };

  const trackUserAction = (action: string, details?: string) => {
    analyticsService.trackUserAction(action, details);
  };

  return {
    trackEvent,
    trackSearch,
    trackCarView,
    trackFilterUsage,
    trackUserAction
  };
};

export default AnalyticsTracker;