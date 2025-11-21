// src/services/rate-limiting-service.ts
// Rate Limiting Service for Bulgarian Car Marketplace

import { serviceLogger } from './logger-wrapper';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
  message?: string; // Custom error message
}

export interface RateLimitEntry {
  count: number;
  resetTime: Date;
  blocked: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  message?: string;
}

export class RateLimitingService {
  private static instance: RateLimitingService;
  private rateLimits = new Map<string, RateLimitEntry>();
  private readonly CLEANUP_INTERVAL = 60000; // 1 minute
  private cleanupTimer: NodeJS.Timeout | null = null;

  // Default rate limit configurations
  private static readonly DEFAULT_CONFIGS = {
    // Authentication
    login: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
      message: 'Too many login attempts. Please try again later.'
    },
    register: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3,
      message: 'Too many registration attempts. Please try again later.'
    },
    passwordReset: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3,
      message: 'Too many password reset attempts. Please try again later.'
    },
    emailVerification: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 3,
      message: 'Too many email verification requests. Please try again later.'
    },

    // API endpoints
    search: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 60,
      message: 'Too many search requests. Please slow down.'
    },
    carListings: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 30,
      message: 'Too many listing requests. Please slow down.'
    },
    messages: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 20,
      message: 'Too many message requests. Please slow down.'
    },
    uploads: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10,
      message: 'Too many upload requests. Please slow down.'
    },

    // General API
    api: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100,
      message: 'Too many API requests. Please slow down.'
    }
  };

  private constructor() {
    this.startCleanupTimer();
  }

  public static getInstance(): RateLimitingService {
    if (!RateLimitingService.instance) {
      RateLimitingService.instance = new RateLimitingService();
    }
    return RateLimitingService.instance;
  }

  /**
   * Check if request is allowed based on rate limit
   */
  public checkRateLimit(
    key: string,
    config: RateLimitConfig,
    language: 'bg' | 'en' = 'bg'
  ): RateLimitResult {
    const now = new Date();
    const entry = this.rateLimits.get(key);

    // If no entry exists, create one
    if (!entry) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: new Date(now.getTime() + config.windowMs),
        blocked: false
      };
      this.rateLimits.set(key, newEntry);

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: newEntry.resetTime
      };
    }

    // Check if window has expired
    if (now >= entry.resetTime) {
      // Reset the entry
      entry.count = 1;
      entry.resetTime = new Date(now.getTime() + config.windowMs);
      entry.blocked = false;

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: entry.resetTime
      };
    }

    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
      entry.blocked = true;
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        message: this.getLocalizedMessage(config.message || 'Rate limit exceeded', language)
      };
    }

    // Increment count
    entry.count++;

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime
      };
  }

  /**
   * Get rate limit info for a key
   */
  public getRateLimitInfo(key: string): {
    count: number;
    remaining: number;
    resetTime: Date;
    blocked: boolean;
  } | null {
    const entry = this.rateLimits.get(key);
    if (!entry) {
      return null;
    }

    const now = new Date();
    if (now >= entry.resetTime) {
      return null; // Window expired
    }

    return {
      count: entry.count,
      remaining: Math.max(0, this.getMaxRequestsForKey(key) - entry.count),
      resetTime: entry.resetTime,
      blocked: entry.blocked
    };
  }

  /**
   * Reset rate limit for a key
   */
  public resetRateLimit(key: string): void {
    this.rateLimits.delete(key);
  }

  /**
   * Check rate limit with default configuration
   */
  public checkDefaultRateLimit(
    type: keyof typeof RateLimitingService.DEFAULT_CONFIGS,
    identifier: string,
    language: 'bg' | 'en' = 'bg'
  ): RateLimitResult {
    const config = RateLimitingService.DEFAULT_CONFIGS[type];
    const key = `${type}:${identifier}`;
    
    return this.checkRateLimit(key, config, language);
  }

  /**
   * Check authentication rate limits
   */
  public checkAuthRateLimit(
    action: 'login' | 'register' | 'passwordReset' | 'emailVerification',
    identifier: string, // email, IP, etc.
    language: 'bg' | 'en' = 'bg'
  ): RateLimitResult {
    return this.checkDefaultRateLimit(action, identifier, language);
  }

  /**
   * Check API rate limits
   */
  public checkApiRateLimit(
    endpoint: string,
    identifier: string, // user ID, IP, etc.
    language: 'bg' | 'en' = 'bg'
  ): RateLimitResult {
    // Use specific config if available, otherwise use general API config
    const config = RateLimitingService.DEFAULT_CONFIGS[endpoint as keyof typeof RateLimitingService.DEFAULT_CONFIGS] || 
                   RateLimitingService.DEFAULT_CONFIGS.api;
    
    const key = `api:${endpoint}:${identifier}`;
    return this.checkRateLimit(key, config, language);
  }

  /**
   * Create IP-based rate limit key
   */
  public createIPKey(ip: string, action: string): string {
    return `ip:${ip}:${action}`;
  }

  /**
   * Create user-based rate limit key
   */
  public createUserKey(userId: string, action: string): string {
    return `user:${userId}:${action}`;
  }

  /**
   * Get all active rate limits (for monitoring)
   */
  public getActiveRateLimits(): Array<{
    key: string;
    count: number;
    resetTime: Date;
    blocked: boolean;
  }> {
    const now = new Date();
    const active: Array<{
      key: string;
      count: number;
      resetTime: Date;
      blocked: boolean;
    }> = [];

    for (const [key, entry] of this.rateLimits.entries()) {
      if (now < entry.resetTime) {
        active.push({
          key,
          count: entry.count,
          resetTime: entry.resetTime,
          blocked: entry.blocked
        });
      }
    }

    return active;
  }

  /**
   * Get rate limit statistics
   */
  public getStatistics(): {
    totalActiveLimits: number;
    blockedRequests: number;
    mostActiveKeys: Array<{ key: string; count: number }>;
  } {
    const active = this.getActiveRateLimits();
    const blocked = active.filter(limit => limit.blocked).length;
    const mostActive = active
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(limit => ({ key: limit.key, count: limit.count }));

    return {
      totalActiveLimits: active.length,
      blockedRequests: blocked,
      mostActiveKeys: mostActive
    };
  }

  private getMaxRequestsForKey(key: string): number {
    // Extract type from key and get max requests
    const parts = key.split(':');
    const type = parts[0];
    
    if (type in RateLimitingService.DEFAULT_CONFIGS) {
      return RateLimitingService.DEFAULT_CONFIGS[type as keyof typeof RateLimitingService.DEFAULT_CONFIGS].maxRequests;
    }
    
    return RateLimitingService.DEFAULT_CONFIGS.api.maxRequests;
  }

  private getLocalizedMessage(message: string, language: 'bg' | 'en'): string {
    const localizedMessages: Record<string, Record<string, string>> = {
      bg: {
        'Too many login attempts. Please try again later.': 'Твърде много опити за влизане. Моля, опитайте по-късно.',
        'Too many registration attempts. Please try again later.': 'Твърде много опити за регистрация. Моля, опитайте по-късно.',
        'Too many password reset attempts. Please try again later.': 'Твърде много опити за нулиране на парола. Моля, опитайте по-късно.',
        'Too many email verification requests. Please try again later.': 'Твърде много заявки за потвърждение на имейл. Моля, опитайте по-късно.',
        'Too many search requests. Please slow down.': 'Твърде много заявки за търсене. Моля, забавете.',
        'Too many listing requests. Please slow down.': 'Твърде много заявки за обяви. Моля, забавете.',
        'Too many message requests. Please slow down.': 'Твърде много заявки за съобщения. Моля, забавете.',
        'Too many upload requests. Please slow down.': 'Твърде много заявки за качване. Моля, забавете.',
        'Too many API requests. Please slow down.': 'Твърде много API заявки. Моля, забавете.',
        'Rate limit exceeded': 'Превишен лимит на заявки'
      },
      en: {
        // English messages are already in the default config (return as-is)
      }
    };

    const langMessages = localizedMessages[language];
    return langMessages?.[message] || message;
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredEntries();
    }, this.CLEANUP_INTERVAL);
  }

  private cleanupExpiredEntries(): void {
    const now = new Date();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.rateLimits.entries()) {
      if (now >= entry.resetTime) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      this.rateLimits.delete(key);
    });

    if (expiredKeys.length > 0) {
      serviceLogger.info('Cleaned up expired rate limit entries', { count: expiredKeys.length });
    }
  }

  /**
   * Cleanup when service is destroyed
   */
  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}

// Export singleton instance
export const rateLimiter = RateLimitingService.getInstance();

// Helper functions for common use cases
export const checkAuthRateLimit = (
  action: 'login' | 'register' | 'passwordReset' | 'emailVerification',
  identifier: string,
  language: 'bg' | 'en' = 'bg'
): RateLimitResult => {
  return rateLimiter.checkAuthRateLimit(action, identifier, language);
};

export const checkApiRateLimit = (
  endpoint: string,
  identifier: string,
  language: 'bg' | 'en' = 'bg'
): RateLimitResult => {
  return rateLimiter.checkApiRateLimit(endpoint, identifier, language);
};

export const createIPRateLimit = (ip: string, action: string): string => {
  return rateLimiter.createIPKey(ip, action);
};

export const createUserRateLimit = (userId: string, action: string): string => {
  return rateLimiter.createUserKey(userId, action);
};
