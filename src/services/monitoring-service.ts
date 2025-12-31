// src/services/monitoring-service.ts
// Monitoring and Analytics Service for Bulgarian Car Marketplace

import { errorHandler } from './error-handling-service';
import { rateLimiter } from './rate-limiting-service';
import { serviceLogger } from './logger-service';

export interface AnalyticsEvent {
  eventName: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  properties?: Record<string, any>;
  language?: 'bg' | 'en';
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  context?: Record<string, any>;
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  lastChecked: Date;
  issues?: string[];
}

export class MonitoringService {
  private static instance: MonitoringService;
  private analyticsEvents: AnalyticsEvent[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private healthChecks: Map<string, HealthCheck> = new Map();
  private readonly MAX_EVENTS = 10000;
  private readonly MAX_METRICS = 5000;

  // Performance monitoring
  private performanceObserver: PerformanceObserver | null = null;
  private navigationTiming: PerformanceNavigationTiming | null = null;

  private constructor() {
    this.initializePerformanceMonitoring();
    this.startHealthChecks();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  /**
   * Track analytics event
   */
  public trackEvent(
    eventName: string,
    properties?: Record<string, any>,
    userId?: string
  ): void {
    const event: AnalyticsEvent = {
      eventName,
      userId,
      sessionId: this.getSessionId(),
      timestamp: new Date(),
      properties,
      language: this.getCurrentLanguage()
    };

    this.analyticsEvents.push(event);

    // Maintain array size
    if (this.analyticsEvents.length > this.MAX_EVENTS) {
      this.analyticsEvents = this.analyticsEvents.slice(-this.MAX_EVENTS);
    }

  // Log for debugging
  serviceLogger.debug('Analytics event tracked', { eventName: event.eventName, userId: event.userId });

    // ✅ DONE: Send to analytics service (Google Analytics, Mixpanel, etc.)
    this.sendToAnalyticsService(event);
  }

  /**
   * Track page view
   */
  public trackPageView(page: string, title?: string): void {
    this.trackEvent('page_view', {
      page,
      title: title || document.title,
      url: window.location.href,
      referrer: document.referrer
    });
  }

  /**
   * Track user action
   */
  public trackUserAction(
    action: string,
    category: string,
    properties?: Record<string, any>
  ): void {
    this.trackEvent('user_action', {
      action,
      category,
      ...properties
    });
  }

  /**
   * Track search query
   */
  public trackSearch(
    query: string,
    filters?: Record<string, any>,
    resultsCount?: number
  ): void {
    this.trackEvent('search', {
      query: query.substring(0, 100), // Limit query length
      filters,
      resultsCount,
      queryLength: query.length
    });
  }

  /**
   * Track car listing interaction
   */
  public trackCarListingInteraction(
    action: 'view' | 'contact' | 'favorite' | 'share',
    listingId: string,
    properties?: Record<string, any>
  ): void {
    this.trackEvent('car_listing_interaction', {
      action,
      listingId,
      ...properties
    });
  }

  /**
   * Track authentication event
   */
  public trackAuthEvent(
    action: 'login' | 'register' | 'logout' | 'password_reset',
    method?: string,
    success?: boolean
  ): void {
    this.trackEvent('authentication', {
      action,
      method,
      success,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Record performance metric
   */
  public recordMetric(
    name: string,
    value: number,
    unit: string = 'ms',
    context?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date(),
      context
    };

    this.performanceMetrics.push(metric);

    // Maintain array size
    if (this.performanceMetrics.length > this.MAX_METRICS) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.MAX_METRICS);
    }

  serviceLogger.debug('Performance metric recorded', { name: metric.name, value: metric.value, unit: metric.unit });
  }

  /**
   * Measure function execution time
   */
  public async measureExecution<T>(
    name: string,
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    const start = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      this.recordMetric(`${name}_duration`, duration, 'ms', {
        ...context,
        success: true
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      this.recordMetric(`${name}_duration`, duration, 'ms', {
        ...context,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  /**
   * Start health check for a service
   */
  public startHealthCheck(
    serviceName: string,
    checkFunction: () => Promise<HealthCheck>
  ): void {
    const performCheck = async () => {
      try {
        const healthCheck = await checkFunction();
        this.healthChecks.set(serviceName, healthCheck);
      } catch (error) {
        this.healthChecks.set(serviceName, {
          service: serviceName,
          status: 'unhealthy',
          lastChecked: new Date(),
          issues: [error instanceof Error ? error.message : 'Unknown error']
        });
      }
    };

    // Perform initial check
    performCheck();

    // Set up periodic checks (every 30 seconds)
    setInterval(performCheck, 30000);
  }

  /**
   * Get overall system health
   */
  public getSystemHealth(): {
    overall: 'healthy' | 'degraded' | 'unhealthy';
    services: HealthCheck[];
    issues: string[];
    metrics: {
      totalEvents: number;
      totalMetrics: number;
      errorRate: number;
      avgResponseTime: number;
    };
  } {
    const services = Array.from(this.healthChecks.values());
    const unhealthyServices = services.filter(s => s.status === 'unhealthy');
    const degradedServices = services.filter(s => s.status === 'degraded');
    
    let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    const issues: string[] = [];

    if (unhealthyServices.length > 0) {
      overall = 'unhealthy';
      issues.push(`${unhealthyServices.length} unhealthy service(s)`);
      unhealthyServices.forEach(service => {
        if (service.issues) {
          issues.push(`${service.service}: ${service.issues.join(', ')}`);
        }
      });
    } else if (degradedServices.length > 0) {
      overall = 'degraded';
      issues.push(`${degradedServices.length} degraded service(s)`);
    }

    // Calculate metrics
    const totalEvents = this.analyticsEvents.length;
    const totalMetrics = this.performanceMetrics.length;
    
    // Calculate error rate from recent events
    const recentEvents = this.analyticsEvents.filter(
      e => Date.now() - e.timestamp.getTime() < 300000 // Last 5 minutes
    );
    const errorEvents = recentEvents.filter(
      e => e.eventName.includes('error') || e.properties?.success === false
    );
    const errorRate = recentEvents.length > 0 ? (errorEvents.length / recentEvents.length) * 100 : 0;

    // Calculate average response time
    const responseTimeMetrics = this.performanceMetrics.filter(
      m => m.name.includes('duration') && m.unit === 'ms'
    );
    const avgResponseTime = responseTimeMetrics.length > 0
      ? responseTimeMetrics.reduce((sum, m) => sum + m.value, 0) / responseTimeMetrics.length
      : 0;

    return {
      overall,
      services,
      issues,
      metrics: {
        totalEvents,
        totalMetrics,
        errorRate: Math.round(errorRate * 100) / 100,
        avgResponseTime: Math.round(avgResponseTime * 100) / 100
      }
    };
  }

  /**
   * Get analytics dashboard data
   */
  public getAnalyticsDashboard(): {
    events: Array<{
      name: string;
      count: number;
      lastOccurrence: Date;
    }>;
    topPages: Array<{
      page: string;
      views: number;
    }>;
    userActions: Array<{
      action: string;
      count: number;
    }>;
    performance: Array<{
      metric: string;
      avgValue: number;
      unit: string;
    }>;
  } {
    // Process events
    const eventCounts = new Map<string, { count: number; lastOccurrence: Date }>();
    const pageViews = new Map<string, number>();
    const userActions = new Map<string, number>();

    this.analyticsEvents.forEach(event => {
      // Count events
      const existing = eventCounts.get(event.eventName);
      if (existing) {
        existing.count++;
        if (event.timestamp > existing.lastOccurrence) {
          existing.lastOccurrence = event.timestamp;
        }
      } else {
        eventCounts.set(event.eventName, {
          count: 1,
          lastOccurrence: event.timestamp
        });
      }

      // Count page views
      if (event.eventName === 'page_view' && event.properties?.page) {
        const count = pageViews.get(event.properties.page) || 0;
        pageViews.set(event.properties.page, count + 1);
      }

      // Count user actions
      if (event.eventName === 'user_action' && event.properties?.action) {
        const count = userActions.get(event.properties.action) || 0;
        userActions.set(event.properties.action, count + 1);
      }
    });

    // Process performance metrics
    const performanceMetrics = new Map<string, { sum: number; count: number; unit: string }>();
    
    this.performanceMetrics.forEach(metric => {
      const existing = performanceMetrics.get(metric.name);
      if (existing) {
        existing.sum += metric.value;
        existing.count++;
      } else {
        performanceMetrics.set(metric.name, {
          sum: metric.value,
          count: 1,
          unit: metric.unit
        });
      }
    });

    return {
      events: Array.from(eventCounts.entries()).map(([name, data]) => ({
        name,
        count: data.count,
        lastOccurrence: data.lastOccurrence
      })),
      topPages: Array.from(pageViews.entries())
        .map(([page, views]) => ({ page, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10),
      userActions: Array.from(userActions.entries())
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      performance: Array.from(performanceMetrics.entries()).map(([metric, data]) => ({
        metric,
        avgValue: Math.round((data.sum / data.count) * 100) / 100,
        unit: data.unit
      }))
    };
  }

  /**
   * Export data for external analysis
   */
  public exportData(): {
    events: AnalyticsEvent[];
    metrics: PerformanceMetric[];
    healthChecks: HealthCheck[];
    systemHealth: any;
  } {
    return {
      events: [...this.analyticsEvents],
      metrics: [...this.performanceMetrics],
      healthChecks: Array.from(this.healthChecks.values()),
      systemHealth: this.getSystemHealth()
    };
  }

  private initializePerformanceMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.navigationTiming = entry as PerformanceNavigationTiming;
            this.recordNavigationMetrics();
          } else if (entry.entryType === 'measure') {
            this.recordMetric(
              `measure_${entry.name}`,
              entry.duration,
              'ms'
            );
          }
        }
      });

      this.performanceObserver.observe({
        entryTypes: ['navigation', 'measure', 'paint']
      });
    } catch (error) {
      serviceLogger.warn('Performance Observer not supported', error as Error);
    }

    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.recordNavigationMetrics();
      }, 0);
    });
  }

  private recordNavigationMetrics(): void {
    if (!this.navigationTiming) return;

    const timing = this.navigationTiming;
    
    // Record key metrics
    this.recordMetric('dom_content_loaded', timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart);
    this.recordMetric('load_complete', timing.loadEventEnd - timing.loadEventStart);
    
    // Use startTime instead of navigationStart (PerformanceNavigationTiming extends PerformanceEntry)
    const startTime = timing.startTime || 0;
    this.recordMetric('first_byte', timing.responseStart - startTime);
    
    // domLoading is not available in PerformanceNavigationTiming, use domInteractive instead
    if (timing.domInteractive > 0 && timing.domComplete > 0) {
      this.recordMetric('dom_processing', timing.domComplete - timing.domInteractive);
    }
    
    // Record resource timing
    if (timing.domContentLoadedEventEnd > 0) {
      this.recordMetric('time_to_interactive', timing.domContentLoadedEventEnd - startTime);
    }
  }

  private startHealthChecks(): void {
    // Check error handling service
    this.startHealthCheck('error_handling', async () => {
      const health = errorHandler.isServiceHealthy();
      return {
        service: 'error_handling',
        status: health.healthy ? 'healthy' : 'degraded',
        lastChecked: new Date(),
        issues: health.issues
      };
    });

    // Check rate limiting service
    this.startHealthCheck('rate_limiting', async () => {
      const stats = rateLimiter.getStatistics();
      return {
        service: 'rate_limiting',
        status: stats.blockedRequests > 100 ? 'degraded' : 'healthy',
        lastChecked: new Date(),
        issues: stats.blockedRequests > 100 ? [`${stats.blockedRequests} blocked requests`] : undefined
      };
    });
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('monitoring_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('monitoring_session_id', sessionId);
    }
    return sessionId;
  }

  private getCurrentLanguage(): 'bg' | 'en' {
    const lang = localStorage.getItem('language') || 'bg';
    return lang === 'en' ? 'en' : 'bg';
  }

  private sendToAnalyticsService(event: AnalyticsEvent): void {
    // ✅ DONE: Send to Google Analytics, Mixpanel, or other analytics service
    try {
      // Google Analytics 4
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', event.eventName, {
          event_category: event.properties?.category || 'general',
          event_label: event.properties?.label,
          value: event.properties?.value,
          user_id: event.userId,
          custom_parameters: event.properties
        });
      }
      
      // Mixpanel (if available)
      if (typeof window !== 'undefined' && (window as any).mixpanel) {
        (window as any).mixpanel.track(event.eventName, {
          ...event.properties,
          userId: event.userId,
          sessionId: event.sessionId,
          language: event.language,
          timestamp: event.timestamp.toISOString()
        });
      }
      
      // Facebook Pixel (if available and enabled)
      const pixelId = process.env.REACT_APP_FACEBOOK_PIXEL_ID;
      const pixelEnabled = Boolean(
        pixelId && ((process.env.NODE_ENV === 'production') || process.env.REACT_APP_ENABLE_PIXEL === 'true')
      );
      if (pixelEnabled && typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('trackCustom', event.eventName, event.properties);
      }
      
      serviceLogger.debug('Analytics service event sent', { 
        eventName: event.eventName, 
        userId: event.userId,
        services: ['gtag', 'mixpanel', 'fbq'].filter(service => 
          typeof window !== 'undefined' && (window as any)[service]
        )
      });
    } catch (error) {
      serviceLogger.error('Failed to send analytics event', error as Error);
    }
  }
}

// Export singleton instance
export const monitoring = MonitoringService.getInstance();

// Helper functions
export const trackEvent = (
  eventName: string,
  properties?: Record<string, any>,
  userId?: string
): void => {
  monitoring.trackEvent(eventName, properties, userId);
};

export const trackPageView = (page: string, title?: string): void => {
  monitoring.trackPageView(page, title);
};

export const trackUserAction = (
  action: string,
  category: string,
  properties?: Record<string, any>
): void => {
  monitoring.trackUserAction(action, category, properties);
};

export const measureExecution = <T>(
  name: string,
  fn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> => {
  return monitoring.measureExecution(name, fn, context);
};
