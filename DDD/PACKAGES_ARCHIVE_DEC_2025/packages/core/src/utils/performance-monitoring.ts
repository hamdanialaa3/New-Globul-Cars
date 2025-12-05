// Performance Monitoring Utilities
// أدوات مراقبة الأداء

import { logger } from '@globul-cars/services';

/**
 * Measure and log Web Vitals
 * قياس وتسجيل Web Vitals
 */
export const initWebVitals = async () => {
  try {
    const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
    
    const sendToAnalytics = (metric: any) => {
      // Log to logger
      logger.info(`Web Vital: ${metric.name}`, {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id
      });
      
      // Send to Google Analytics (if available)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', metric.name, {
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          event_category: 'Web Vitals',
          event_label: metric.id,
          non_interaction: true
        });
      }
      
      // Send to Firebase Analytics (if available)
      if (typeof window !== 'undefined') {
        import('../firebase/firebase-config').then(({ analytics }) => {
          import('firebase/analytics').then(({ logEvent }) => {
            if (analytics) {
              logEvent(analytics, 'web_vitals', {
                metric_name: metric.name,
                metric_value: metric.value,
                metric_rating: metric.rating
              });
            }
          });
        });
      }
    };
    
    getCLS(sendToAnalytics);
    getFID(sendToAnalytics);
    getFCP(sendToAnalytics);
    getLCP(sendToAnalytics);
    getTTFB(sendToAnalytics);
  } catch (error) {
    logger.error('Failed to initialize Web Vitals', error as Error);
  }
};

/**
 * Performance observer for long tasks
 * مراقب الأداء للمهام الطويلة
 */
export const observeLongTasks = () => {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          logger.warn('Long task detected', {
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name
          });
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      // Long task API not supported
    }
  }
};

/**
 * Measure component render time
 * قياس وقت عرض المكون
 */
export const measureComponentRender = (componentName: string) => {
  const startMark = `${componentName}-render-start`;
  const endMark = `${componentName}-render-end`;
  const measureName = `${componentName}-render`;
  
  return {
    start: () => {
      performance.mark(startMark);
    },
    end: () => {
      performance.mark(endMark);
      try {
        performance.measure(measureName, startMark, endMark);
        const measure = performance.getEntriesByName(measureName)[0];
        
        if (measure.duration > 16) { // Slower than 60fps
          logger.warn(`Slow component render: ${componentName}`, {
            duration: measure.duration
          });
        }
        
        // Cleanup
        performance.clearMarks(startMark);
        performance.clearMarks(endMark);
        performance.clearMeasures(measureName);
      } catch (error) {
        // Measurement failed
      }
    }
  };
};

/**
 * Monitor resource loading times
 * مراقبة أوقات تحميل الموارد
 */
export const monitorResourceLoading = () => {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          // Log slow resources (> 1s)
          if (resourceEntry.duration > 1000) {
            logger.warn('Slow resource loading', {
              name: resourceEntry.name,
              duration: resourceEntry.duration,
              size: resourceEntry.transferSize,
              type: resourceEntry.initiatorType
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['resource'] });
    } catch (error) {
      logger.error('Failed to observe resource loading', error as Error);
    }
  }
};

/**
 * Monitor memory usage (Chrome only)
 * مراقبة استخدام الذاكرة
 */
export const monitorMemoryUsage = () => {
  if ('memory' in performance) {
    setInterval(() => {
      const memory = (performance as any).memory;
      const usedMemoryMB = memory.usedJSHeapSize / 1048576;
      const totalMemoryMB = memory.totalJSHeapSize / 1048576;
      const limitMemoryMB = memory.jsHeapSizeLimit / 1048576;
      
      // Warn if using > 80% of available memory
      if (usedMemoryMB / limitMemoryMB > 0.8) {
        logger.warn('High memory usage detected', {
          used: Math.round(usedMemoryMB),
          total: Math.round(totalMemoryMB),
          limit: Math.round(limitMemoryMB),
          percentage: Math.round((usedMemoryMB / limitMemoryMB) * 100)
        });
      }
    }, 30000); // Check every 30 seconds
  }
};

/**
 * Bundle size analyzer helper
 * مساعد تحليل حجم الحزمة
 */
export const logBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const totalSize = scripts.reduce((sum, script) => {
      const src = script.getAttribute('src');
      return sum + (src ? src.length : 0);
    }, 0);
    
    logger.info('Estimated bundle size', {
      scripts: scripts.length,
      estimatedSize: `${(totalSize / 1024).toFixed(2)} KB`
    });
  }
};

/**
 * Network information monitoring
 * مراقبة معلومات الشبكة
 */
export const monitorNetworkInfo = () => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    
    logger.info('Network information', {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    });
    
    connection.addEventListener('change', () => {
      logger.info('Network changed', {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink
      });
    });
  }
};

/**
 * Initialize all performance monitoring
 * تهيئة جميع مراقبة الأداء
 */
export const initPerformanceMonitoring = () => {
  // Web Vitals
  initWebVitals();
  
  // Long tasks
  observeLongTasks();
  
  // Resource loading
  monitorResourceLoading();
  
  // Memory usage
  if (process.env.NODE_ENV === 'production') {
    monitorMemoryUsage();
  }
  
  // Network info
  monitorNetworkInfo();
  
  // Bundle size (dev only)
  if (process.env.NODE_ENV === 'development') {
    logBundleSize();
  }
  
  logger.info('Performance monitoring initialized');
};

export default {
  initWebVitals,
  observeLongTasks,
  measureComponentRender,
  monitorResourceLoading,
  monitorMemoryUsage,
  logBundleSize,
  monitorNetworkInfo,
  initPerformanceMonitoring
};

