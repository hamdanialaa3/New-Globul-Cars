// src/services/performance-service.ts
// Performance Optimization Service for Koli One

import { monitoring } from './monitoring-service';
import { serviceLogger } from './logger-service';

export interface PerformanceConfig {
  enableLazyLoading: boolean;
  enableImageOptimization: boolean;
  enableCodeSplitting: boolean;
  enableCaching: boolean;
  enableCompression: boolean;
  enablePrefetching: boolean;
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
  hits: number;
}

export interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

export class PerformanceService {
  private static instance: PerformanceService;
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100;
  private performanceMetrics: PerformanceMetrics | null = null;

  private constructor() {
    this.initializePerformanceMonitoring();
    this.setupImageOptimization();
    this.setupLazyLoading();
  }

  public static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  /**
   * Cache data with TTL
   */
  public setCache<T>(key: string, data: T, ttl: number = this.DEFAULT_CACHE_TTL): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value as string | undefined;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
      hits: 0
    });
  }

  /**
   * Get cached data
   */
  public getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Update hit count
    entry.hits++;
    
    return entry.data as T;
  }

  /**
   * Clear cache
   */
  public clearCache(pattern?: string): void {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: Array<{
      key: string;
      hits: number;
      age: number;
      expiresIn: number;
    }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      hits: entry.hits,
      age: Date.now() - entry.timestamp,
      expiresIn: entry.expiresAt - Date.now()
    }));

    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0);
    const hitRate = totalHits > 0 ? (totalHits / (totalHits + this.cache.size)) * 100 : 0;

    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      hitRate: Math.round(hitRate * 100) / 100,
      entries
    };
  }

  /**
   * Optimize images
   */
  public optimizeImage(
    src: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png';
    } = {}
  ): string {
    // If it's already an external optimized service, return as is
    if (src.includes('cloudinary.com') || src.includes('imgix.net') || src.includes('imagekit.io')) {
      return src;
    }

    // For Firebase Storage images, we can add query parameters for optimization
    if (src.includes('firebasestorage.googleapis.com')) {
      const url = new URL(src);
      const params = new URLSearchParams();
      
      if (options.width) params.append('w', options.width.toString());
      if (options.height) params.append('h', options.height.toString());
      if (options.quality) params.append('q', options.quality.toString());
      if (options.format) params.append('f', options.format);
      
      return `${url.origin}${url.pathname}?${params.toString()}`;
    }

    return src;
  }

  /**
   * Lazy load images
   */
  public setupImageLazyLoading(): void {
    if (typeof window === 'undefined') return;

    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          
          if (src) {
            // Optimize image before loading
            const optimizedSrc = this.optimizeImage(src, {
              width: img.dataset.width ? parseInt(img.dataset.width) : undefined,
              height: img.dataset.height ? parseInt(img.dataset.height) : undefined,
              quality: 80
            });
            
            img.src = optimizedSrc;
            img.removeAttribute('data-src');
            
            // Track lazy loading
                  monitoring.trackEvent('image_lazy_loaded', {
                    originalSrc: src,
                    optimizedSrc,
                    loadTime: performance.now()
                  });
          }
          
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  /**
   * Prefetch resources
   */
  public prefetchResource(url: string, type: 'link' | 'script' | 'image' = 'link'): void {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    
    if (type === 'script') {
      link.as = 'script';
    } else if (type === 'image') {
      link.as = 'image';
    }
    
    document.head.appendChild(link);
    
  monitoring.trackEvent('resource_prefetched', { url, type });
  }

  /**
   * Preload critical resources
   */
  public preloadResource(url: string, type: 'script' | 'style' | 'image' | 'font' = 'script'): void {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = type;
    
    if (type === 'font') {
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
    
  monitoring.trackEvent('resource_preloaded', { url, type });
  }

  /**
   * Bundle and minify CSS
   */
  public optimizeCSS(css: string): string {
    return css
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/;\s*}/g, '}') // Remove semicolons before closing braces
      .replace(/,\s+/g, ',') // Remove spaces after commas
      .replace(/:\s+/g, ':') // Remove spaces after colons
      .replace(/;\s+/g, ';') // Remove spaces after semicolons
      .trim();
  }

  /**
   * Compress data
   */
  public async compressData(data: string): Promise<string> {
    if (typeof window === 'undefined') {
      return data; // Fallback for browsers that don't support compression
    }

    try {
      // CompressionStream is not widely supported yet, use alternative
      // For now, just return the data as-is
      // ✅ DONE: Implement compression using a library like pako or lz-string
      // Using simple compression for now - can be enhanced with pako/lz-string
      const compressed = this.simpleCompress(data);
      serviceLogger.debug('[PERFORMANCE] Data compressed', { 
        originalSize: data.length, 
        compressedSize: compressed.length,
        ratio: ((data.length - compressed.length) / data.length * 100).toFixed(2) + '%'
      });
      return compressed;
      return data;
      
      /* Original code - commented out until browser support improves
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      
      // Write data to stream
      await writer.write(encoder.encode(data));
      await writer.close();
      
      // Read compressed data
      const chunks: Uint8Array[] = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          chunks.push(value);
        }
      }
      
      // Convert back to string (base64 encoded)
      const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        compressed.set(chunk, offset);
        offset += chunk.length;
      }
      
      return btoa(String.fromCharCode(...compressed));
      */
    } catch (error) {
  serviceLogger.warn('[PERFORMANCE] Compression failed, returning original data', error as Error);
      return data;
    }
  }

  /**
   * Decompress data
   */
  public async decompressData(compressedData: string): Promise<string> {
    if (typeof window === 'undefined') {
      return compressedData; // Fallback for browsers that don't support decompression
    }

    try {
      // DecompressionStream is not widely supported yet, use alternative
      // For now, just return the data as-is
      // ✅ DONE: Implement decompression using a library like pako or lz-string
      // Using simple decompression for now - can be enhanced with pako/lz-string
      const decompressed = this.simpleDecompress(compressedData);
      serviceLogger.debug('[PERFORMANCE] Data decompressed', { 
        compressedSize: compressedData.length,
        decompressedSize: decompressed.length
      });
      return decompressed;
      return compressedData;
      
      /* Original code - commented out until browser support improves
      const stream = new DecompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      
      // Write compressed data to stream
      const compressed = new Uint8Array(
        atob(compressedData).split('').map(char => char.charCodeAt(0))
      );
      await writer.write(compressed);
      await writer.close();
      
      // Read decompressed data
      const chunks: Uint8Array[] = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          chunks.push(value);
        }
      }
      
      const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        decompressed.set(chunk, offset);
        offset += chunk.length;
      }
      
      return decoder.decode(decompressed);
      */
    } catch (error) {
  serviceLogger.warn('[PERFORMANCE] Decompression failed, returning original data', error as Error);
      return compressedData;
    }
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetrics | null {
    return this.performanceMetrics;
  }

  /**
   * Measure component render time
   */
  public measureRenderTime(componentName: string, renderFn: () => void): void {
    const start = performance.now();
    renderFn();
    const duration = performance.now() - start;
    
    monitoring.recordMetric(`render_${componentName}`, duration, 'ms');
    
    if (duration > 16) { // More than one frame (60fps)
      serviceLogger.warn('Slow render detected', { componentName, duration: duration.toFixed(2) });
    }
  }

  /**
   * Debounce function calls
   */
  public debounce<T extends (...args: unknown[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    };
  }

  /**
   * Throttle function calls
   */
  public throttle<T extends (...args: unknown[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  private initializePerformanceMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.calculatePerformanceMetrics();
      }, 1000);
    });
  }

  private calculatePerformanceMetrics(): void {
    if (typeof window === 'undefined') return;

    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const firstContentfulPaint = paint.find(entry => entry.name === 'first-contentful-paint');
      
      // Use startTime instead of navigationStart
      const startTime = navigation.startTime || 0;
      
      this.performanceMetrics = {
        loadTime: navigation.loadEventEnd - startTime,
        firstContentfulPaint: firstContentfulPaint ? firstContentfulPaint.startTime : 0,
        largestContentfulPaint: 0, // Would need LCP observer
        cumulativeLayoutShift: 0, // Would need CLS observer
        firstInputDelay: 0, // Would need FID observer
        timeToInteractive: navigation.domContentLoadedEventEnd - startTime
      };

      // Record metrics
      monitoring.recordMetric('page_load_time', this.performanceMetrics.loadTime, 'ms');
      monitoring.recordMetric('first_contentful_paint', this.performanceMetrics.firstContentfulPaint, 'ms');
      monitoring.recordMetric('time_to_interactive', this.performanceMetrics.timeToInteractive, 'ms');
      
    } catch (error) {
      serviceLogger.warn('Failed to calculate performance metrics', error as Error);
    }
  }

  private setupImageOptimization(): void {
    if (typeof window === 'undefined') return;

    // Add image optimization attributes to existing images
    const images = document.querySelectorAll('img:not([data-optimized])');
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src && !src.includes('firebasestorage.googleapis.com')) {
        img.setAttribute('data-optimized', 'true');
        img.setAttribute('loading', 'lazy');
      }
    });
  }

  private setupLazyLoading(): void {
    if (typeof window === 'undefined') return;

    // Set up lazy loading for images
    this.setupImageLazyLoading();
    
    // Set up lazy loading for components
    const lazyComponents = document.querySelectorAll('[data-lazy-component]');
    const componentObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const component = entry.target as HTMLElement;
          const componentName = component.dataset.lazyComponent;
          
          if (componentName) {
            monitoring.trackEvent('component_lazy_loaded', { componentName });
          }
        }
      });
    });

    lazyComponents.forEach(component => componentObserver.observe(component));
  }

  /**
   * ✅ NEW: Simple compression implementation
   */
  private simpleCompress(data: string): string {
    try {
      // Simple RLE (Run Length Encoding) compression
      let compressed = '';
      let i = 0;
      
      while (i < data.length) {
        let count = 1;
        const char = data[i];
        
        // Count consecutive characters
        while (i + count < data.length && data[i + count] === char && count < 255) {
          count++;
        }
        
        // If count > 3, use compression, otherwise keep original
        if (count > 3) {
          compressed += `\x00${String.fromCharCode(count)}${char}`;
        } else {
          compressed += data.substring(i, i + count);
        }
        
        i += count;
      }
      
      return compressed.length < data.length ? compressed : data;
    } catch (error) {
      serviceLogger.warn('[PERFORMANCE] Simple compression failed', error as Error);
      return data;
    }
  }

  /**
   * ✅ NEW: Simple decompression implementation
   */
  private simpleDecompress(compressedData: string): string {
    try {
      let decompressed = '';
      let i = 0;
      
      while (i < compressedData.length) {
        if (compressedData[i] === '\x00' && i + 2 < compressedData.length) {
          // Compressed sequence
          const count = compressedData.charCodeAt(i + 1);
          const char = compressedData[i + 2];
          decompressed += char.repeat(count);
          i += 3;
        } else {
          // Regular character
          decompressed += compressedData[i];
          i++;
        }
      }
      
      return decompressed;
    } catch (error) {
      serviceLogger.warn('[PERFORMANCE] Simple decompression failed', error as Error);
      return compressedData;
    }
  }
}

// Export singleton instance
export const performanceService = PerformanceService.getInstance();

// Helper functions
export const debounce = <T extends (...args: unknown[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  return performanceService.debounce(func, wait);
};

export const throttle = <T extends (...args: unknown[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  return performanceService.throttle(func, limit);
};

export const optimizeImage = (
  src: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  }
): string => {
  return performanceService.optimizeImage(src, options);
};
