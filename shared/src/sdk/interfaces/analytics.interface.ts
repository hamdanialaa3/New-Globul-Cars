/**
 * Analytics Service Interface
 * Shared contract for event tracking across web and mobile.
 */

export interface AnalyticsEvent {
  name: string;
  params?: Record<string, string | number | boolean>;
  userId?: string;
  timestamp?: Date;
}

export interface IAnalyticsService {
  /** Track a custom event */
  trackEvent(event: AnalyticsEvent): void;

  /** Track a page/screen view */
  trackPageView(screenName: string, params?: Record<string, string>): void;

  /** Track listing view (common across both platforms) */
  trackListingView(listingId: string, collection: string): void;

  /** Track search query */
  trackSearch(query: string, resultCount: number): void;

  /** Set user properties for segmentation */
  setUserProperties(props: Record<string, string | number | boolean>): void;

  /** Set the current user ID for analytics */
  setUserId(userId: string | null): void;
}
