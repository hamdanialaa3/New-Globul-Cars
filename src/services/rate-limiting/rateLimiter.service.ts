/**
 * Rate Limiter Service
 * خدمة تحديد معدل الطلبات
 * 
 * Prevents spam and abuse by limiting the frequency of sensitive operations
 * يمنع الإساءة والسبام عن طريق تحديد معدل العمليات الحساسة
 * 
 * @since December 2025
 */

import { logger } from '../logger-service';

interface RateLimitConfig {
  maxRequests: number;      // Maximum requests allowed
  windowMs: number;         // Time window in milliseconds
  action: string;          // Action name for logging
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class RateLimiterService {
  private static instance: RateLimiterService;
  private rateLimitMap: Map<string, RateLimitRecord> = new Map();
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // Clean up every 5 minutes

  private constructor() {
    // Cleanup old entries periodically
    setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
  }

  static getInstance(): RateLimiterService {
    if (!RateLimiterService.instance) {
      RateLimiterService.instance = new RateLimiterService();
    }
    return RateLimiterService.instance;
  }

  /**
   * Check if action is allowed based on rate limit
   * التحقق من السماح بالعملية بناءً على معدل الطلبات
   * 
   * @param userId - User ID
   * @param action - Action name (e.g., 'follow', 'message', 'createCar')
   * @param config - Rate limit configuration
   * @returns { allowed: boolean, remaining: number, resetTime: number }
   */
  checkRateLimit(
    userId: string,
    action: string,
    config: RateLimitConfig
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const key = `${userId}:${action}`;
    const now = Date.now();
    const record = this.rateLimitMap.get(key);

    // If no record or window expired, create new record
    if (!record || now > record.resetTime) {
      const resetTime = now + config.windowMs;
      this.rateLimitMap.set(key, {
        count: 1,
        resetTime
      });

      logger.debug('Rate limit check - new window', {
        userId,
        action,
        remaining: config.maxRequests - 1,
        resetTime
      });

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime
      };
    }

    // Check if limit exceeded
    if (record.count >= config.maxRequests) {
      logger.warn('Rate limit exceeded', {
        userId,
        action,
        count: record.count,
        maxRequests: config.maxRequests,
        resetTime: record.resetTime
      });

      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime
      };
    }

    // Increment count
    record.count++;
    this.rateLimitMap.set(key, record);

    logger.debug('Rate limit check - allowed', {
      userId,
      action,
      count: record.count,
      remaining: config.maxRequests - record.count,
      resetTime: record.resetTime
    });

    return {
      allowed: true,
      remaining: config.maxRequests - record.count,
      resetTime: record.resetTime
    };
  }

  /**
   * Get remaining requests for an action
   * الحصول على عدد الطلبات المتبقية
   */
  getRemaining(userId: string, action: string): number {
    const key = `${userId}:${action}`;
    const record = this.rateLimitMap.get(key);

    if (!record || Date.now() > record.resetTime) {
      // Window expired or doesn't exist, return max
      return 10; // Default max
    }

    // This is a simplified version - actual remaining depends on config
    return Math.max(0, 10 - record.count);
  }

  /**
   * Reset rate limit for a user and action
   * إعادة تعيين معدل الطلبات لمستخدم وعملية معينة
   */
  reset(userId: string, action: string): void {
    const key = `${userId}:${action}`;
    this.rateLimitMap.delete(key);
    logger.debug('Rate limit reset', { userId, action });
  }

  /**
   * Cleanup expired entries
   * تنظيف الإدخالات المنتهية الصلاحية
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, record] of this.rateLimitMap.entries()) {
      if (now > record.resetTime) {
        this.rateLimitMap.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug('Rate limit cleanup', { cleaned, remaining: this.rateLimitMap.size });
    }
  }
}

// Rate limit configurations for different actions
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  follow: {
    maxRequests: 10,        // 10 follows per minute
    windowMs: 60 * 1000,    // 1 minute
    action: 'follow'
  },
  unfollow: {
    maxRequests: 10,        // 10 unfollows per minute
    windowMs: 60 * 1000,    // 1 minute
    action: 'unfollow'
  },
  message: {
    maxRequests: 20,       // 20 messages per minute
    windowMs: 60 * 1000,    // 1 minute
    action: 'message'
  },
  createCar: {
    maxRequests: 3,        // 3 cars per hour
    windowMs: 60 * 60 * 1000, // 1 hour
    action: 'createCar'
  },
  search: {
    maxRequests: 60,       // 60 searches per minute
    windowMs: 60 * 1000,    // 1 minute
    action: 'search'
  },
  IMAGE_UPLOAD: {
    maxRequests: 100,      // 100 images per hour
    windowMs: 60 * 60 * 1000, // 1 hour
    action: 'imageUpload'
  }
};

// Export singleton instance
export const rateLimiter = RateLimiterService.getInstance();

// Export class for testing
export { RateLimiterService };
