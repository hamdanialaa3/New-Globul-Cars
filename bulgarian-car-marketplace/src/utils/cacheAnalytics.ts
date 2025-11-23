// Cache Performance Analytics
// Tracks cache hit/miss rates and performance metrics

interface CacheMetrics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  averageResponseTime: number;
  cachedSize: number;
}

class CacheAnalytics {
  private metrics: Map<string, CacheMetrics> = new Map();
  private requestTimes: Map<string, number> = new Map();

  // Record a cache hit
  recordHit(cacheName: string, responseTime: number): void {
    const metrics = this.getOrCreateMetrics(cacheName);
    metrics.totalRequests++;
    metrics.cacheHits++;
    metrics.hitRate = (metrics.cacheHits / metrics.totalRequests) * 100;
    this.updateAverageResponseTime(metrics, responseTime);
  }

  // Record a cache miss
  recordMiss(cacheName: string, responseTime: number): void {
    const metrics = this.getOrCreateMetrics(cacheName);
    metrics.totalRequests++;
    metrics.cacheMisses++;
    metrics.hitRate = (metrics.cacheHits / metrics.totalRequests) * 100;
    this.updateAverageResponseTime(metrics, responseTime);
  }

  // Get metrics for a specific cache
  getMetrics(cacheName: string): CacheMetrics | undefined {
    return this.metrics.get(cacheName);
  }

  // Get all metrics
  getAllMetrics(): Record<string, CacheMetrics> {
    const result: Record<string, CacheMetrics> = {};
    this.metrics.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  // Calculate overall cache performance
  getOverallMetrics(): CacheMetrics {
    let totalRequests = 0;
    let totalHits = 0;
    let totalMisses = 0;
    let totalResponseTime = 0;
    let totalSize = 0;

    this.metrics.forEach((metrics) => {
      totalRequests += metrics.totalRequests;
      totalHits += metrics.cacheHits;
      totalMisses += metrics.cacheMisses;
      totalResponseTime += metrics.averageResponseTime * metrics.totalRequests;
      totalSize += metrics.cachedSize;
    });

    return {
      totalRequests,
      cacheHits: totalHits,
      cacheMisses: totalMisses,
      hitRate: totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0,
      averageResponseTime: totalRequests > 0 ? totalResponseTime / totalRequests : 0,
      cachedSize: totalSize,
    };
  }

  // Generate performance report
  generateReport(): string {
    const overall = this.getOverallMetrics();
    const cacheBreakdown = this.getAllMetrics();

    let report = '📊 Cache Performance Report\n\n';
    report += '=== Overall Statistics ===\n';
    report += `Total Requests: ${overall.totalRequests}\n`;
    report += `Cache Hits: ${overall.cacheHits} (${overall.hitRate.toFixed(2)}%)\n`;
    report += `Cache Misses: ${overall.cacheMisses}\n`;
    report += `Average Response Time: ${overall.averageResponseTime.toFixed(2)}ms\n`;
    report += `Total Cached Size: ${this.formatBytes(overall.cachedSize)}\n\n`;

    report += '=== Cache Breakdown ===\n';
    Object.entries(cacheBreakdown).forEach(([cacheName, metrics]) => {
      report += `\n${cacheName}:\n`;
      report += `  Requests: ${metrics.totalRequests}\n`;
      report += `  Hit Rate: ${metrics.hitRate.toFixed(2)}%\n`;
      report += `  Avg Response: ${metrics.averageResponseTime.toFixed(2)}ms\n`;
      report += `  Size: ${this.formatBytes(metrics.cachedSize)}\n`;
    });

    return report;
  }

  // Clear all metrics
  clear(): void {
    this.metrics.clear();
    this.requestTimes.clear();
  }

  // Private helpers
  private getOrCreateMetrics(cacheName: string): CacheMetrics {
    if (!this.metrics.has(cacheName)) {
      this.metrics.set(cacheName, {
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        hitRate: 0,
        averageResponseTime: 0,
        cachedSize: 0,
      });
    }
    return this.metrics.get(cacheName)!;
  }

  private updateAverageResponseTime(metrics: CacheMetrics, responseTime: number): void {
    const totalTime = metrics.averageResponseTime * (metrics.totalRequests - 1);
    metrics.averageResponseTime = (totalTime + responseTime) / metrics.totalRequests;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }
}

// Singleton instance
export const cacheAnalytics = new CacheAnalytics();

// Intercept fetch to track cache performance
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;

  window.fetch = async function (input, init?) {
    const url = typeof input === 'string' ? input : input.url;
    const startTime = performance.now();

    try {
      const response = await originalFetch(input, init);
      const responseTime = performance.now() - startTime;

      // Determine cache name based on URL
      let cacheName = 'unknown';
      if (url.includes('firestore.googleapis.com') || url.includes('firebase')) {
        cacheName = 'firebase-api';
      } else if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        cacheName = 'images';
      } else if (url.match(/\.(css|js)$/)) {
        cacheName = 'static-resources';
      } else if (url.includes('/api/')) {
        cacheName = 'api-calls';
      }

      // Check if response came from cache
      const isFromCache = response.headers.get('x-cache') === 'HIT' || 
                          response.type === 'opaque' ||
                          response.headers.get('cf-cache-status') === 'HIT';

      if (isFromCache) {
        cacheAnalytics.recordHit(cacheName, responseTime);
      } else {
        cacheAnalytics.recordMiss(cacheName, responseTime);
      }

      return response;
    } catch (error) {
      const responseTime = performance.now() - startTime;
      cacheAnalytics.recordMiss('unknown', responseTime);
      throw error;
    }
  };
}

// Log cache stats periodically (every 5 minutes)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  setInterval(() => {
    const overall = cacheAnalytics.getOverallMetrics();
    console.log('📊 Cache Stats:', {
      hitRate: `${overall.hitRate.toFixed(2)}%`,
      totalRequests: overall.totalRequests,
      cacheHits: overall.cacheHits,
      avgResponseTime: `${overall.averageResponseTime.toFixed(2)}ms`,
    });
  }, 5 * 60 * 1000); // 5 minutes
}

export default cacheAnalytics;
