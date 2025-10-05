// src/utils/performance-monitor.ts
// Performance Monitoring Utilities - أدوات مراقبة الأداء
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

// ==================== INTERFACES ====================

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: number;
}

export interface PerformanceReport {
  metrics: PerformanceMetric[];
  summary: {
    averageLoadTime: number;
    totalRequests: number;
    memoryUsed: number;
    timestamp: Date;
  };
}

// ==================== SERVICE CLASS ====================

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 100;

  private constructor() {
    this.initializeMonitoring();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // ==================== PUBLIC METHODS ====================

  /**
   * Track a performance metric
   * تتبع مقياس أداء
   */
  trackMetric(name: string, value: number, unit: 'ms' | 'bytes' | 'count' = 'ms'): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now()
    };

    this.metrics.push(metric);

    // Keep only last 100 metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    console.log(`📊 Performance: ${name} = ${value}${unit}`);
  }

  /**
   * Measure execution time
   * قياس وقت التنفيذ
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      this.trackMetric(name, Math.round(duration), 'ms');
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.trackMetric(`${name}_error`, Math.round(duration), 'ms');
      throw error;
    }
  }

  /**
   * Get performance report
   * الحصول على تقرير الأداء
   */
  getReport(): PerformanceReport {
    const summary = {
      averageLoadTime: this.calculateAverage('loadTime'),
      totalRequests: this.countMetric('request'),
      memoryUsed: this.getMemoryUsage(),
      timestamp: new Date()
    };

    return {
      metrics: [...this.metrics],
      summary
    };
  }

  /**
   * Log performance report
   * طباعة تقرير الأداء
   */
  logReport(): void {
    const report = this.getReport();
    
    console.group('📊 Performance Report');
    console.log('Average Load Time:', report.summary.averageLoadTime, 'ms');
    console.log('Total Requests:', report.summary.totalRequests);
    console.log('Memory Used:', report.summary.memoryUsed, 'MB');
    console.log('Timestamp:', report.summary.timestamp);
    console.groupEnd();
  }

  // ==================== PRIVATE METHODS ====================

  private initializeMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor page load
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.trackMetric('pageLoad', Math.round(loadTime), 'ms');
    });
  }

  private calculateAverage(metricName: string): number {
    const filtered = this.metrics.filter(m => m.name.includes(metricName));
    if (filtered.length === 0) return 0;
    
    const sum = filtered.reduce((acc, m) => acc + m.value, 0);
    return Math.round(sum / filtered.length);
  }

  private countMetric(metricName: string): number {
    return this.metrics.filter(m => m.name.includes(metricName)).length;
  }

  private getMemoryUsage(): number {
    if (typeof performance === 'undefined' || !(performance as any).memory) {
      return 0;
    }
    
    const memory = (performance as any).memory;
    return Math.round(memory.usedJSHeapSize / (1024 * 1024)); // MB
  }
}

// Export singleton
export const performanceMonitor = PerformanceMonitor.getInstance();

// Export helper functions
export const trackPerformance = (name: string, value: number, unit?: 'ms' | 'bytes' | 'count') => {
  performanceMonitor.trackMetric(name, value, unit);
};

export const measureAsync = async <T,>(name: string, fn: () => Promise<T>): Promise<T> => {
  return performanceMonitor.measureAsync(name, fn);
};
