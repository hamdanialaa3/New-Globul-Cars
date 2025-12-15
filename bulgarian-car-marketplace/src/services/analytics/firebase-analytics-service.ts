/**
 * Firebase Analytics Integration Service
 * Zero-Cost AI Implementation - Phase 3.1
 * 
 * Features:
 * - AI usage tracking (chatbot, image analysis, price suggestions)
 * - Search analytics (queries, filters, results)
 * - Conversion tracking (listings viewed → contacted → purchased)
 * - Error monitoring and diagnostics
 * - User behavior analysis
 * 
 * Replaces: Google Analytics 4 (€0 - Firebase Analytics is completely free)
 * Cost: €0 (unlimited events)
 * 
 * Note: Firebase Analytics automatically integrates with Google Analytics 4
 * and BigQuery for advanced analysis (free tier available).
 */

import { analytics } from '../firebase';
import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { logger } from './logger-service';

/**
 * Analytics Service
 * Centralized analytics tracking for all AI and user interactions
 */
class AnalyticsService {
  private static instance: AnalyticsService;
  private isEnabled: boolean = true;

  private constructor() {
    // Check if analytics is available
    if (!analytics) {
      logger.warn('Firebase Analytics not initialized');
      this.isEnabled = false;
    }
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Set user ID for cross-session tracking
   */
  setUser(userId: string) {
    if (!this.isEnabled || !analytics) return;

    try {
      setUserId(analytics, userId);
      logger.info('Analytics: User ID set', { userId });
    } catch (error) {
      logger.error('Failed to set analytics user ID', { error, userId });
    }
  }

  /**
   * Set user properties (profile type, plan tier, etc.)
   */
  setUserProperties(properties: {
    profileType?: string;
    planTier?: string;
    language?: string;
    location?: string;
  }) {
    if (!this.isEnabled || !analytics) return;

    try {
      setUserProperties(analytics, properties);
      logger.info('Analytics: User properties set', { properties });
    } catch (error) {
      logger.error('Failed to set user properties', { error, properties });
    }
  }

  // ==================== AI EVENTS ====================

  /**
   * Track AI Chatbot usage
   */
  trackAIChatbot(params: {
    sessionId: string;
    messageCount: number;
    category?: string; // 'selection', 'pricing', 'general'
    language: string;
    responseTime?: number;
    quotaUsed: number;
  }) {
    if (!this.isEnabled || !analytics) return;

    try {
      logEvent(analytics, 'ai_chatbot_session', {
        session_id: params.sessionId,
        message_count: params.messageCount,
        category: params.category || 'general',
        language: params.language,
        response_time_ms: params.responseTime,
        quota_used: params.quotaUsed
      });

      logger.info('Analytics: AI Chatbot tracked', params);
    } catch (error) {
      logger.error('Failed to track AI chatbot', { error, params });
    }
  }

  /**
   * Track AI Image Analysis usage
   */
  trackAIImageAnalysis(params: {
    analysisType: 'quality' | 'detection' | 'comparison';
    imageCount: number;
    processingTime: number;
    success: boolean;
    quotaUsed: number;
  }) {
    if (!this.isEnabled || !analytics) return;

    try {
      logEvent(analytics, 'ai_image_analysis', {
        analysis_type: params.analysisType,
        image_count: params.imageCount,
        processing_time_ms: params.processingTime,
        success: params.success,
        quota_used: params.quotaUsed
      });

      logger.info('Analytics: AI Image Analysis tracked', params);
    } catch (error) {
      logger.error('Failed to track AI image analysis', { error, params });
    }
  }

  /**
   * Track AI Price Suggestion usage
   */
  trackAIPriceSuggestion(params: {
    make: string;
    model: string;
    year: number;
    suggestedPrice: number;
    confidence: number;
    marketDataPoints: number;
    quotaUsed: number;
  }) {
    if (!this.isEnabled || !analytics) return;

    try {
      logEvent(analytics, 'ai_price_suggestion', {
        make: params.make,
        model: params.model,
        year: params.year,
        suggested_price: params.suggestedPrice,
        confidence_score: params.confidence,
        market_data_points: params.marketDataPoints,
        quota_used: params.quotaUsed
      });

      logger.info('Analytics: AI Price Suggestion tracked', params);
    } catch (error) {
      logger.error('Failed to track AI price suggestion', { error, params });
    }
  }

  /**
   * Track AI Quota limits reached
   */
  trackAIQuotaLimit(params: {
    userId: string;
    planTier: string;
    feature: 'chatbot' | 'image_analysis' | 'price_suggestion';
    dailyLimit: number;
  }) {
    if (!this.isEnabled || !analytics) return;

    try {
      logEvent(analytics, 'ai_quota_limit_reached', {
        user_id: params.userId,
        plan_tier: params.planTier,
        feature: params.feature,
        daily_limit: params.dailyLimit
      });

      logger.warn('Analytics: AI Quota limit reached', params);
    } catch (error) {
      logger.error('Failed to track AI quota limit', { error, params });
    }
  }

  // ==================== SEARCH EVENTS ====================

  /**
   * Track search queries
   */
  trackSearch(params: {
    query: string;
    filters?: Record<string, string | number | boolean>;
    resultsCount: number;
    responseTime: number;
    language: string;
  }) {
    if (!this.isEnabled || !analytics) return;

    try {
      logEvent(analytics, 'search', {
        search_term: params.query.substring(0, 100), // Limit length
        filters_applied: params.filters ? Object.keys(params.filters).join(',') : 'none',
        results_count: params.resultsCount,
        response_time_ms: params.responseTime,
        language: params.language
      });

      logger.info('Analytics: Search tracked', params);
    } catch (error) {
      logger.error('Failed to track search', { error, params });
    }
  }

  /**
   * Track advanced filter usage
   */
  trackFilterUsage(params: {
    filterType: string;
    filterValue: string;
    resultsCount: number;
  }) {
    if (!this.isEnabled || !analytics) return;

    try {
      logEvent(analytics, 'filter_used', {
        filter_type: params.filterType,
        filter_value: params.filterValue,
        results_count: params.resultsCount
      });

      logger.info('Analytics: Filter usage tracked', params);
    } catch (error) {
      logger.error('Failed to track filter usage', { error, params });
    }
  }

  // ==================== CONVERSION EVENTS ====================

  /**
   * Track listing view (top of funnel)
   */
  trackListingView(params: {
    carId: string;
    make: string;
    model: string;
    year: number;
    price: number;
    seller: string;
  }) {
    if (!this.isEnabled || !analytics) return;

    try {
      logEvent(analytics, 'view_item', {
        item_id: params.carId,
        item_name: `${params.make} ${params.model} ${params.year}`,
        item_category: params.make,
        price: params.price,
        currency: 'EUR'
      });

      logger.info('Analytics: Listing view tracked', params);
    } catch (error) {
      logger.error('Failed to track listing view', { error, params });
    }
  }

  /**
   * Track contact seller action (mid funnel)
   */
  trackContactSeller(params: {
    carId: string;
    contactMethod: 'phone' | 'message' | 'whatsapp';
    sellerType: 'private' | 'dealer' | 'company';
  }) {
    if (!this.isEnabled || !analytics) return;

    try {
      logEvent(analytics, 'contact_seller', {
        car_id: params.carId,
        contact_method: params.contactMethod,
        seller_type: params.sellerType
      });

      logger.info('Analytics: Contact seller tracked', params);
    } catch (error) {
      logger.error('Failed to track contact seller', { error, params });
    }
  }

  /**
   * Track listing saved to favorites
   */
  trackAddToFavorites(params: {
    carId: string;
    make: string;
    model: string;
  }) {
    if (!this.isEnabled || !analytics) return;

    try {
      logEvent(analytics, 'add_to_wishlist', {
        item_id: params.carId,
        item_name: `${params.make} ${params.model}`
      });

      logger.info('Analytics: Add to favorites tracked', params);
    } catch (error) {
      logger.error('Failed to track add to favorites', { error, params });
    }
  }

  /**
   * Track listing share
   */
  trackShare(params: {
    carId: string;
    method: 'facebook' | 'twitter' | 'whatsapp' | 'copy_link';
  }) {
    if (!this.isEnabled || !analytics) return;

    try {
      logEvent(analytics, 'share', {
        content_type: 'car_listing',
        item_id: params.carId,
        method: params.method
      });

      logger.info('Analytics: Share tracked', params);
    } catch (error) {
      logger.error('Failed to track share', { error, params });
    }
  }

  // ==================== SELLER EVENTS ====================

  /**
   * Track new listing creation (seller action)
   */
  trackListingCreated(params: {
    carId: string;
    sellerType: 'private' | 'dealer' | 'company';
    planTier: string;
    hasImages: boolean;
    imageCount: number;
    qualityScore?: number;
  }) {
    if (!this.isEnabled || !analytics) return;

    try {
      logEvent(analytics, 'listing_created', {
        car_id: params.carId,
        seller_type: params.sellerType,
        plan_tier: params.planTier,
        has_images: params.hasImages,
        image_count: params.imageCount,
        quality_score: params.qualityScore || 0
      });

      logger.info('Analytics: Listing created tracked', params);
    } catch (error) {
      logger.error('Failed to track listing created', { error, params });
    }
  }

  /**
   * Track listing sold/deleted (conversion)
   */
  trackListingSold(params: {
    carId: string;
    daysActive: number;
    viewCount: number;
    contactCount: number;
  }) {
    if (!this.isEnabled || !analytics) return;

    try {
      logEvent(analytics, 'listing_sold', {
        car_id: params.carId,
        days_active: params.daysActive,
        view_count: params.viewCount,
        contact_count: params.contactCount
      });

      logger.info('Analytics: Listing sold tracked', params);
    } catch (error) {
      logger.error('Failed to track listing sold', { error, params });
    }
  }

  // ==================== ERROR EVENTS ====================

  /**
   * Track errors for monitoring
   */
  trackError(params: {
    errorType: string;
    errorMessage: string;
    errorContext?: Record<string, string | number | boolean>;
    fatal: boolean;
  }) {
    if (!this.isEnabled || !analytics) return;

    try {
      logEvent(analytics, 'exception', {
        description: `${params.errorType}: ${params.errorMessage.substring(0, 100)}`,
        fatal: params.fatal,
        error_type: params.errorType,
        context: params.errorContext ? JSON.stringify(params.errorContext).substring(0, 200) : ''
      });

      logger.error('Analytics: Error tracked', params);
    } catch (error) {
      logger.error('Failed to track error event', { error, params });
    }
  }

  /**
   * Track performance metrics
   */
  trackPerformance(params: {
    metricName: string;
    value: number;
    unit?: 'ms' | 'bytes' | 'count';
  }) {
    if (!this.isEnabled || !analytics) return;

    try {
      logEvent(analytics, 'performance_metric', {
        metric_name: params.metricName,
        value: params.value,
        unit: params.unit || 'ms'
      });

      logger.info('Analytics: Performance tracked', params);
    } catch (error) {
      logger.error('Failed to track performance', { error, params });
    }
  }

  // ==================== USER ENGAGEMENT ====================

  /**
   * Track page view
   */
  trackPageView(params: {
    pagePath: string;
    pageTitle: string;
  }) {
    if (!this.isEnabled || !analytics) return;

    try {
      logEvent(analytics, 'page_view', {
        page_path: params.pagePath,
        page_title: params.pageTitle
      });

      logger.info('Analytics: Page view tracked', params);
    } catch (error) {
      logger.error('Failed to track page view', { error, params });
    }
  }

  /**
   * Track user engagement (time on page)
   */
  trackEngagement(params: {
    pagePath: string;
    timeOnPage: number; // seconds
    scrollDepth: number; // percentage
  }) {
    if (!this.isEnabled || !analytics) return;

    try {
      logEvent(analytics, 'user_engagement', {
        page_path: params.pagePath,
        engagement_time_msec: params.timeOnPage * 1000,
        scroll_depth: params.scrollDepth
      });

      logger.info('Analytics: Engagement tracked', params);
    } catch (error) {
      logger.error('Failed to track engagement', { error, params });
    }
  }

  /**
   * Track custom events
   */
  trackCustomEvent(eventName: string, params: Record<string, string | number | boolean>) {
    if (!this.isEnabled || !analytics) return;

    try {
      logEvent(analytics, eventName, params);
      logger.info(`Analytics: Custom event tracked - ${eventName}`, params);
    } catch (error) {
      logger.error('Failed to track custom event', { error, eventName, params });
    }
  }
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance();

/**
 * React Hook for easy analytics tracking in components
 */
export function useAnalytics() {
  return {
    setUser: analyticsService.setUser.bind(analyticsService),
    setUserProperties: analyticsService.setUserProperties.bind(analyticsService),
    trackAIChatbot: analyticsService.trackAIChatbot.bind(analyticsService),
    trackAIImageAnalysis: analyticsService.trackAIImageAnalysis.bind(analyticsService),
    trackAIPriceSuggestion: analyticsService.trackAIPriceSuggestion.bind(analyticsService),
    trackAIQuotaLimit: analyticsService.trackAIQuotaLimit.bind(analyticsService),
    trackSearch: analyticsService.trackSearch.bind(analyticsService),
    trackFilterUsage: analyticsService.trackFilterUsage.bind(analyticsService),
    trackListingView: analyticsService.trackListingView.bind(analyticsService),
    trackContactSeller: analyticsService.trackContactSeller.bind(analyticsService),
    trackAddToFavorites: analyticsService.trackAddToFavorites.bind(analyticsService),
    trackShare: analyticsService.trackShare.bind(analyticsService),
    trackListingCreated: analyticsService.trackListingCreated.bind(analyticsService),
    trackListingSold: analyticsService.trackListingSold.bind(analyticsService),
    trackError: analyticsService.trackError.bind(analyticsService),
    trackPerformance: analyticsService.trackPerformance.bind(analyticsService),
    trackPageView: analyticsService.trackPageView.bind(analyticsService),
    trackEngagement: analyticsService.trackEngagement.bind(analyticsService),
    trackCustomEvent: analyticsService.trackCustomEvent.bind(analyticsService)
  };
}

/**
 * Higher-Order Component for automatic page view tracking
 */
export function withAnalytics<P extends object>(
  Component: React.ComponentType<P>,
  pageTitle: string
) {
  return function AnalyticsWrappedComponent(props: P) {
    React.useEffect(() => {
      analyticsService.trackPageView({
        pagePath: window.location.pathname,
        pageTitle
      });
    }, []);

    return React.createElement(Component, props);
  };
}
