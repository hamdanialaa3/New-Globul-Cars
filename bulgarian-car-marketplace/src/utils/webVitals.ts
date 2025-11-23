/**
 * Core Web Vitals Tracking
 * Measures and reports critical performance metrics
 * https://web.dev/vitals/
 */

import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';

interface WebVitalsReport {
  timestamp: number;
  url: string;
  // Core Web Vitals
  LCP?: number;  // Largest Contentful Paint (target: < 2.5s)
  FID?: number;  // First Input Delay (target: < 100ms)
  CLS?: number;  // Cumulative Layout Shift (target: < 0.1)
  // Additional metrics
  FCP?: number;  // First Contentful Paint (target: < 1.8s)
  TTFB?: number; // Time to First Byte (target: < 600ms)
}

class WebVitalsTracker {
  private metrics: WebVitalsReport = {
    timestamp: Date.now(),
    url: window.location.href,
  };

  private analyticsEndpoint = '/api/analytics/web-vitals'; // Firebase Function endpoint

  constructor() {
    this.initializeTracking();
  }

  /**
   * Initialize Core Web Vitals tracking
   */
  private initializeTracking(): void {
    // Largest Contentful Paint - measures loading performance
    getLCP(this.onMetric.bind(this, 'LCP'));
    
    // First Input Delay - measures interactivity
    getFID(this.onMetric.bind(this, 'FID'));
    
    // Cumulative Layout Shift - measures visual stability
    getCLS(this.onMetric.bind(this, 'CLS'));
    
    // First Contentful Paint - measures perceived load speed
    getFCP(this.onMetric.bind(this, 'FCP'));
    
    // Time to First Byte - measures server response time
    getTTFB(this.onMetric.bind(this, 'TTFB'));

    // Send report when user leaves page
    this.setupBeforeUnload();
  }

  /**
   * Handle metric callback
   */
  private onMetric(name: keyof WebVitalsReport, metric: Metric): void {
    const value = metric.value;
    this.metrics[name] = value;

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const rating = this.getRating(name, value);
      console.log(`[Web Vitals] ${name}: ${value.toFixed(2)}ms (${rating})`);
    }

    // Send individual metric in production
    if (process.env.NODE_ENV === 'production') {
      this.sendMetric(name, metric);
    }
  }

  /**
   * Get rating for metric value
   */
  private getRating(name: keyof WebVitalsReport, value: number): string {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 600, poor: 1500 },
    };

    const threshold = thresholds[name as keyof typeof thresholds];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return '✅ Good';
    if (value <= threshold.poor) return '⚠️ Needs Improvement';
    return '❌ Poor';
  }

  /**
   * Send individual metric to analytics
   */
  private sendMetric(name: string, metric: Metric): void {
    const body = {
      name,
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
      rating: this.getRating(name as keyof WebVitalsReport, metric.value),
      url: window.location.href,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    };

    // Use sendBeacon for reliability (works even if page is closing)
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        this.analyticsEndpoint,
        JSON.stringify(body)
      );
    } else {
      // Fallback to fetch
      fetch(this.analyticsEndpoint, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(err => console.error('[Web Vitals] Send failed:', err));
    }
  }

  /**
   * Send complete report before page unload
   */
  private setupBeforeUnload(): void {
    window.addEventListener('beforeunload', () => {
      this.sendReport();
    });
  }

  /**
   * Send complete metrics report
   */
  private sendReport(): void {
    const report = {
      ...this.metrics,
      timestamp: Date.now(),
      url: window.location.href,
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals] Final Report:', report);
    }

    if (process.env.NODE_ENV === 'production' && navigator.sendBeacon) {
      navigator.sendBeacon(
        `${this.analyticsEndpoint}/report`,
        JSON.stringify(report)
      );
    }
  }

  /**
   * Get current metrics snapshot
   */
  public getMetrics(): WebVitalsReport {
    return { ...this.metrics };
  }

  /**
   * Generate console-friendly report
   */
  public generateReport(): string {
    const { LCP, FID, CLS, FCP, TTFB } = this.metrics;
    
    let report = '\n📊 Core Web Vitals Report\n';
    report += '========================\n\n';
    
    if (LCP !== undefined) {
      report += `LCP (Largest Contentful Paint): ${LCP.toFixed(2)}ms ${this.getRating('LCP', LCP)}\n`;
      report += `  Target: < 2500ms (Good), < 4000ms (Needs Improvement)\n\n`;
    }
    
    if (FID !== undefined) {
      report += `FID (First Input Delay): ${FID.toFixed(2)}ms ${this.getRating('FID', FID)}\n`;
      report += `  Target: < 100ms (Good), < 300ms (Needs Improvement)\n\n`;
    }
    
    if (CLS !== undefined) {
      report += `CLS (Cumulative Layout Shift): ${CLS.toFixed(3)} ${this.getRating('CLS', CLS)}\n`;
      report += `  Target: < 0.1 (Good), < 0.25 (Needs Improvement)\n\n`;
    }
    
    if (FCP !== undefined) {
      report += `FCP (First Contentful Paint): ${FCP.toFixed(2)}ms ${this.getRating('FCP', FCP)}\n`;
      report += `  Target: < 1800ms (Good), < 3000ms (Needs Improvement)\n\n`;
    }
    
    if (TTFB !== undefined) {
      report += `TTFB (Time to First Byte): ${TTFB.toFixed(2)}ms ${this.getRating('TTFB', TTFB)}\n`;
      report += `  Target: < 600ms (Good), < 1500ms (Needs Improvement)\n\n`;
    }
    
    report += `URL: ${this.metrics.url}\n`;
    report += `Timestamp: ${new Date(this.metrics.timestamp).toLocaleString()}\n`;
    
    return report;
  }
}

// Create singleton instance
const webVitalsTracker = new WebVitalsTracker();

// Export for console access
if (typeof window !== 'undefined') {
  (window as any).webVitalsTracker = webVitalsTracker;
}

export default webVitalsTracker;
export { WebVitalsTracker };
