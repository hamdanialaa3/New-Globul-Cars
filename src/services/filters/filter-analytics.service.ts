/**
 * Filter Analytics Service
 * خدمة تحليلات الفلاتر
 * 
 * Tracks filter usage, search patterns, and user behavior
 * 
 * @author Koli.one Team
 * @version 1.0.0
 * @date January 30, 2026
 */

import { FilterState } from './filter-url-state.service';
import { FilterCategory } from './homepage-filter.service';
import { logger } from '../logger-service';

// ============================================================================
// TYPES
// ============================================================================

export interface FilterAnalyticsEvent {
  eventName: string;
  payload: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export interface FilterUsageStats {
  filterName: string;
  usageCount: number;
  lastUsed: Date;
  avgResultCount: number;
}

// ============================================================================
// EVENT NAMES
// ============================================================================

export const FILTER_EVENTS = {
  FILTER_CHANGED: 'filter_changed',
  FILTER_APPLIED: 'filter_applied',
  FILTER_RESET: 'filter_reset',
  PRESET_SELECTED: 'preset_selected',
  SEARCH_PERFORMED: 'search_performed',
  LISTING_VIEWED: 'listing_viewed',
  DEEP_LINK_OPENED: 'deep_link_opened',
  SHARE_LINK_CREATED: 'share_link_created'
} as const;

// ============================================================================
// FILTER ANALYTICS SERVICE
// ============================================================================

class FilterAnalyticsService {
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track filter change event
   */
  trackFilterChange(filterName: string, oldValue: unknown, newValue: unknown): void {
    this.track(FILTER_EVENTS.FILTER_CHANGED, {
      filter_name: filterName,
      old_value: oldValue,
      new_value: newValue
    });
  }

  /**
   * Track filters applied event
   */
  trackFiltersApplied(filters: FilterState, resultCount: number): void {
    this.track(FILTER_EVENTS.FILTER_APPLIED, {
      filters: this.sanitizeFilters(filters),
      result_count: resultCount,
      filter_count: Object.keys(filters).length
    });
  }

  /**
   * Track filter reset event
   */
  trackFilterReset(previousFilters: FilterState): void {
    this.track(FILTER_EVENTS.FILTER_RESET, {
      previous_filters: this.sanitizeFilters(previousFilters),
      previous_filter_count: Object.keys(previousFilters).length
    });
  }

  /**
   * Track preset selection event
   */
  trackPresetSelected(presetName: string, category: FilterCategory): void {
    this.track(FILTER_EVENTS.PRESET_SELECTED, {
      preset_name: presetName,
      category: category
    });
  }

  /**
   * Track search performed event
   */
  trackSearchPerformed(query: string, filters: FilterState, resultCount: number): void {
    this.track(FILTER_EVENTS.SEARCH_PERFORMED, {
      query: query,
      filters: this.sanitizeFilters(filters),
      result_count: resultCount
    });
  }

  /**
   * Track listing viewed event
   */
  trackListingViewed(listingId: string, source: string, category?: FilterCategory): void {
    this.track(FILTER_EVENTS.LISTING_VIEWED, {
      listing_id: listingId,
      source: source,
      category: category
    });
  }

  /**
   * Track deep link opened event
   */
  trackDeepLinkOpened(url: string, filters: FilterState): void {
    this.track(FILTER_EVENTS.DEEP_LINK_OPENED, {
      url: url,
      filters: this.sanitizeFilters(filters),
      filter_count: Object.keys(filters).length
    });
  }

  /**
   * Track share link created event
   */
  trackShareLinkCreated(url: string, filters: FilterState): void {
    this.track(FILTER_EVENTS.SHARE_LINK_CREATED, {
      url: url,
      filters: this.sanitizeFilters(filters)
    });
  }

  /**
   * Core tracking method
   */
  private track(eventName: string, payload: Record<string, unknown>): void {
    const event: FilterAnalyticsEvent = {
      eventName,
      payload: {
        ...payload,
        page: window.location.pathname,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      sessionId: this.sessionId
    };

    // Log to service logger
    logger.info(`Analytics: ${eventName}`, event.payload);

    // Send to analytics providers
    this.sendToGoogleAnalytics(event);
    this.sendToFirebaseAnalytics(event);
  }

  /**
   * Send event to Google Analytics
   */
  private sendToGoogleAnalytics(event: FilterAnalyticsEvent): void {
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      const gtag = (window as unknown as { gtag: (...args: unknown[]) => void }).gtag;
      gtag('event', event.eventName, event.payload);
    }
  }

  /**
   * Send event to Firebase Analytics
   */
  private sendToFirebaseAnalytics(event: FilterAnalyticsEvent): void {
    // Firebase Analytics integration
    // Will be implemented when Firebase Analytics is configured
  }

  /**
   * Sanitize filters for analytics (remove sensitive data)
   */
  private sanitizeFilters(filters: FilterState): Record<string, unknown> {
    return {
      brand: filters.brand || null,
      model: filters.model || null,
      has_price_filter: !!(filters.priceMin || filters.priceMax),
      has_year_filter: !!(filters.yearMin || filters.yearMax),
      fuel: filters.fuel || null,
      transmission: filters.transmission || null,
      body_type: filters.bodyType || null,
      has_seats_filter: !!(filters.seatsMin || filters.seatsMax),
      has_mileage_filter: !!filters.mileageMax,
      has_hp_filter: !!filters.engineHpMin,
      city: filters.city || null,
      seller_type: filters.sellerType || null,
      dealer_verified: filters.dealerVerified || false,
      condition: filters.condition || null,
      posted_within: filters.postedWithin || null,
      sort: filters.sort || null
    };
  }

  /**
   * Get UTM parameters for campaign tracking
   */
  getUtmParams(): Record<string, string | null> {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_content: params.get('utm_content'),
      utm_term: params.get('utm_term')
    };
  }

  /**
   * Build UTM link
   */
  buildUtmLink(
    baseUrl: string,
    source: string,
    medium: string,
    campaign: string,
    content?: string
  ): string {
    const params = new URLSearchParams();
    params.set('utm_source', source);
    params.set('utm_medium', medium);
    params.set('utm_campaign', campaign);
    if (content) params.set('utm_content', content);

    return `${baseUrl}?${params.toString()}`;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const filterAnalyticsService = new FilterAnalyticsService();
export default filterAnalyticsService;
