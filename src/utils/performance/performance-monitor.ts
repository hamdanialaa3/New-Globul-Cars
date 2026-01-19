/**
 * Performance Monitor - قياس الأداء
 * Phase 1.3.1 & 1.3.2: Performance Measurements
 * 
 * Measures:
 * - Bundle Size
 * - Firestore Reads
 * - Component Render Times
 * - API Call Times
 */

import { logger } from '../../services/logger-service';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private firestoreReads: number = 0;
  private firestoreWrites: number = 0;
  private readonly MAX_METRICS = 1000;

  private constructor() {
    if (typeof window !== 'undefined' && window.performance) {
      this.setupFirestoreMonitoring();
    }
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Measure bundle size (approximate)
   */
  measureBundleSize(): void {
    if (typeof window === 'undefined' || !window.performance) return;

    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const transferSize = navigation.transferSize || 0;
        const decodedBodySize = navigation.decodedBodySize || 0;
        const encodedBodySize = navigation.encodedBodySize || 0;

        this.recordMetric({
          name: 'bundle_size',
          value: transferSize,
          unit: 'bytes',
          timestamp: Date.now(),
          metadata: {
            decoded: decodedBodySize,
            encoded: encodedBodySize,
            gzipped: transferSize < encodedBodySize
          }
        });
      }
    } catch (error) {
      logger.warn('Failed to measure bundle size', { error: error as Error });
    }
  }

  /**
   * Increment Firestore read counter
   */
  incrementFirestoreRead(): void {
    this.firestoreReads++;
    this.recordMetric({
      name: 'firestore_read',
      value: this.firestoreReads,
      unit: 'count',
      timestamp: Date.now()
    });
  }

  /**
   * Increment Firestore write counter
   */
  incrementFirestoreWrite(): void {
    this.firestoreWrites++;
    this.recordMetric({
      name: 'firestore_write',
      value: this.firestoreWrites,
      unit: 'count',
      timestamp: Date.now()
    });
  }

  /**
   * Measure component render time
   */
  measureComponentRender(componentName: string, renderTime: number): void {
    this.recordMetric({
      name: 'component_render',
      value: renderTime,
      unit: 'ms',
      timestamp: Date.now(),
      metadata: { component: componentName }
    });
  }

  /**
   * Measure API call time
   */
  measureAPICall(apiName: string, duration: number, success: boolean): void {
    this.recordMetric({
      name: 'api_call',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      metadata: {
        api: apiName,
        success
      }
    });
  }

  /**
   * Get current Firestore reads count
   */
  getFirestoreReads(): number {
    return this.firestoreReads;
  }

  /**
   * Get current Firestore writes count
   */
  getFirestoreWrites(): number {
    return this.firestoreWrites;
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name);
  }

  /**
   * Get summary report
   */
  getSummary(): {
    totalMetrics: number;
    firestoreReads: number;
    firestoreWrites: number;
    bundleSize?: number;
    averageRenderTime?: number;
  } {
    const bundleSizeMetric = this.metrics.find(m => m.name === 'bundle_size');
    const renderMetrics = this.metrics.filter(m => m.name === 'component_render');
    const avgRenderTime = renderMetrics.length > 0
      ? renderMetrics.reduce((sum, m) => sum + m.value, 0) / renderMetrics.length
      : undefined;

    return {
      totalMetrics: this.metrics.length,
      firestoreReads: this.firestoreReads,
      firestoreWrites: this.firestoreWrites,
      bundleSize: bundleSizeMetric?.value,
      averageRenderTime: avgRenderTime
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = [];
    this.firestoreReads = 0;
    this.firestoreWrites = 0;
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): string {
    return JSON.stringify({
      summary: this.getSummary(),
      metrics: this.metrics,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only last MAX_METRICS
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  private setupFirestoreMonitoring(): void {
    // Monitor Firestore operations via Performance API
    if (typeof window !== 'undefined' && window.performance && window.performance.mark) {
      // This is a basic implementation
      // In production, you'd want to hook into Firebase SDK directly
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const startTime = performance.now();
        const result = await originalFetch(...args);
        const duration = performance.now() - startTime;
        
        // Check if it's a Firestore request
        if (args[0]?.toString().includes('firestore.googleapis.com')) {
          this.incrementFirestoreRead();
          this.measureAPICall('firestore', duration, result.ok);
        }
        
        return result;
      };
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Auto-measure bundle size on load
if (typeof window !== 'undefined') {
  if (document.readyState === 'complete') {
    performanceMonitor.measureBundleSize();
  } else {
    window.addEventListener('load', () => {
      performanceMonitor.measureBundleSize();
    });
  }
}

export default performanceMonitor;

