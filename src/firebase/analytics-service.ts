// src/firebase/analytics-service.ts
// Analytics Service for Koli One

import { analytics } from './firebase-config';
import { logEvent, setUserProperties, setUserId } from 'firebase/analytics';
import { logger } from '../services/logger-service';

/**
 * Bulgarian Analytics Service - Singleton Pattern
 * Firebase Analytics wrapper for tracking user behavior
 * 
 * Usage:
 * ```typescript
 * import { analyticsService } from '../firebase/analytics-service';
 * 
 * analyticsService.trackPageView('home', 'Home Page');
 * analyticsService.trackCarEvent('view_car', carData);
 * ```
 */
export class BulgarianAnalyticsService {
  private static instance: BulgarianAnalyticsService | null = null;

  private constructor() {
    logger.debug('BulgarianAnalyticsService initialized');
  }

  public static getInstance(): BulgarianAnalyticsService {
    if (!BulgarianAnalyticsService.instance) {
      BulgarianAnalyticsService.instance = new BulgarianAnalyticsService();
    }
    return BulgarianAnalyticsService.instance;
  }

  // Track page views
  trackPageView(pageName: string, pageTitle?: string) {
    if (!analytics) return;

    try {
      logEvent(analytics, 'page_view', {
        page_title: pageTitle || pageName,
        page_location: window.location.href,
        page_path: window.location.pathname,
        custom_page: pageName
      });
    } catch (error) {
      logger.warn('Analytics page view tracking failed', { error: (error as Error)?.message });
    }
  }

  // Track user authentication events
  trackAuthEvent(event: 'login' | 'register' | 'logout', method?: string) {
    if (!analytics) return;

    try {
      if (event === 'login') {
        logEvent(analytics, 'login', {
          method: method || 'email'
        });
      } else {
        logEvent(analytics, event, {
          method: method || 'email'
        });
      }
    } catch (error) {
      logger.warn('Analytics auth event tracking failed', { error: (error as Error)?.message });
    }
  }

  // Track car-related events
  trackCarEvent(event: 'view_car' | 'search_cars' | 'add_car' | 'edit_car' | 'delete_car', carData?: any) {
    if (!analytics) return;

    try {
      const eventData: Record<string, unknown> = {
        custom_event: `car_${event}`
      };

      if (carData) {
        eventData.car_id = carData.id;
        eventData.car_price = carData.price;
        eventData.car_location = carData.location;
        eventData.car_brand = carData.brand;
        eventData.car_year = carData.year;
      }

      logEvent(analytics, 'car_interaction', eventData);
    } catch (error) {
      logger.warn('Analytics car event tracking failed', { error: (error as Error)?.message });
    }
  }

  // Track messaging events
  trackMessageEvent(event: 'send_message' | 'view_messages' | 'start_conversation') {
    if (!analytics) return;

    try {
      logEvent(analytics, 'message_interaction', {
        custom_event: `message_${event}`
      });
    } catch (error) {
      logger.warn('Analytics message event tracking failed', { error: (error as Error)?.message });
    }
  }

  // Track search events
  trackSearchEvent(searchTerm: string, filters?: any) {
    if (!analytics) return;

    try {
      logEvent(analytics, 'search', {
        search_term: searchTerm,
        custom_filters: filters ? JSON.stringify(filters) : undefined
      });
    } catch (error) {
      logger.warn('Analytics search event tracking failed', { error: (error as Error)?.message });
    }
  }

  // Track user engagement
  trackEngagement(event: 'scroll' | 'time_spent' | 'click' | 'share', details?: any) {
    if (!analytics) return;

    try {
      logEvent(analytics, 'user_engagement', {
        engagement_type: event,
        ...details
      });
    } catch (error) {
      logger.warn('Analytics engagement tracking failed', { error: (error as Error)?.message });
    }
  }

  // Track errors
  trackError(errorType: string, errorMessage: string, context?: any) {
    if (!analytics) return;

    try {
      logEvent(analytics, 'exception', {
        description: `${errorType}: ${errorMessage}`,
        fatal: false,
        custom_context: context ? JSON.stringify(context) : undefined
      });
    } catch (error) {
      logger.warn('Analytics error tracking failed', { error: (error as Error)?.message });
    }
  }

  // Set user properties
  setUserProperties(userId: string, properties: Record<string, any>) {
    if (!analytics) return;

    try {
      setUserId(analytics, userId);
      setUserProperties(analytics, {
        user_type: properties.userType || 'regular',
        preferred_language: properties.language || 'bg',
        registration_date: properties.registrationDate,
        location: properties.location,
        ...properties
      });
    } catch (error) {
      logger.warn('Analytics user properties setting failed', { error: (error as Error)?.message });
    }
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number, context?: any) {
    if (!analytics) return;

    try {
      logEvent(analytics, 'performance_metric', {
        metric_name: metric,
        metric_value: value,
        custom_context: context ? JSON.stringify(context) : undefined
      });
    } catch (error) {
      logger.warn('Analytics performance tracking failed', { error: (error as Error)?.message });
    }
  }

  // Track business metrics
  trackBusinessMetric(metric: 'car_listed' | 'car_sold' | 'user_registered' | 'message_sent', value?: number) {
    if (!analytics) return;

    try {
      logEvent(analytics, 'business_metric', {
        metric_type: metric,
        metric_value: value || 1
      });
    } catch (error) {
      logger.warn('Analytics business metric tracking failed', { error: (error as Error)?.message });
    }
  }

  // Track conversion events
  trackConversion(event: 'signup_complete' | 'car_purchase' | 'contact_seller', value?: number) {
    if (!analytics) return;

    try {
      logEvent(analytics, 'conversion', {
        conversion_type: event,
        value: value
      });
    } catch (error) {
      logger.warn('Analytics conversion tracking failed', { error: (error as Error)?.message });
    }
  }
}

// Export singleton instance for easy access
export const analyticsService = BulgarianAnalyticsService.getInstance();

// Analytics hooks for React components
export const useAnalytics = () => {
  const service = BulgarianAnalyticsService.getInstance();
  return {
    trackPageView: service.trackPageView.bind(service),
    trackAuthEvent: service.trackAuthEvent.bind(service),
    trackCarEvent: service.trackCarEvent.bind(service),
    trackMessageEvent: service.trackMessageEvent.bind(service),
    trackSearchEvent: service.trackSearchEvent.bind(service),
    trackEngagement: service.trackEngagement.bind(service),
    trackError: service.trackError.bind(service),
    setUserProperties: service.setUserProperties.bind(service),
    trackPerformance: service.trackPerformance.bind(service),
    trackBusinessMetric: service.trackBusinessMetric.bind(service),
    trackConversion: service.trackConversion.bind(service),
  };
};
