// src/services/rate-limiter-service.ts
// Professional Rate Limiter Service for Bulgarian Car Marketplace
// (Comment removed - was in Arabic)

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  service: string;
  burstLimit?: number;
  burstWindowMs?: number;
  backoffMultiplier?: number;
  maxBackoffMs?: number;
}

export interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastRequest: number;
  backoffUntil?: number;
}

export class RateLimitExceededError extends Error {
  constructor(
    public service: string,
    public resetTime: number,
    public retryAfter: number
  ) {
    super(`Rate limit exceeded for ${service}. Retry after ${retryAfter}ms`);
    this.name = 'RateLimitExceededError';
  }
}

/**
 * Professional Rate Limiter with Circuit Breaker Pattern
 * (Comment removed - was in Arabic)
 */
export class RateLimiter {
  private config: RateLimitConfig;
  private requests: Map<string, RateLimitEntry> = new Map();
  private circuitBreakerState: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private circuitBreakerFailures = 0;
  private circuitBreakerLastFailure = 0;
  private circuitBreakerTimeout = 60000; // 1 minute
  private circuitBreakerThreshold = 5; // failures before opening

  constructor(config: RateLimitConfig) {
    this.config = {
      burstLimit: config.maxRequests * 2,
      burstWindowMs: config.windowMs / 2,
      backoffMultiplier: 2,
      maxBackoffMs: 300000, // 5 minutes
      ...config
    };

    // Clean up expired entries periodically
    setInterval(() => this.cleanup(), 30000); // Every 30 seconds
  }

  /**
   * Check if request is allowed
   * (Comment removed - was in Arabic)
   */
  async checkLimit(identifier: string = 'default'): Promise<void> {
    // Check circuit breaker
    if (this.circuitBreakerState === 'OPEN') {
      if (Date.now() - this.circuitBreakerLastFailure < this.circuitBreakerTimeout) {
        throw new RateLimitExceededError(
          this.config.service,
          this.circuitBreakerLastFailure + this.circuitBreakerTimeout,
          this.circuitBreakerTimeout
        );
      } else {
        // Try half-open state
        this.circuitBreakerState = 'HALF_OPEN';
      }
    }

    const now = Date.now();
    const entry = this.requests.get(identifier) || {
      count: 0,
      resetTime: now + this.config.windowMs,
      lastRequest: 0
    };

    // Check if window has expired
    if (now > entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + this.config.windowMs;
      entry.backoffUntil = undefined;
    }

    // Check backoff
    if (entry.backoffUntil && now < entry.backoffUntil) {
      const retryAfter = entry.backoffUntil - now;
      throw new RateLimitExceededError(
        this.config.service,
        entry.resetTime,
        retryAfter
      );
    }

    // Check rate limit
    if (entry.count >= this.config.maxRequests) {
      // Apply backoff
      const backoffMs = Math.min(
        (entry.count - this.config.maxRequests + 1) * 1000 * this.config.backoffMultiplier!,
        this.config.maxBackoffMs!
      );
      entry.backoffUntil = now + backoffMs;

      throw new RateLimitExceededError(
        this.config.service,
        entry.resetTime,
        backoffMs
      );
    }

    // Check burst limit
    const burstWindowStart = now - (this.config.burstWindowMs || this.config.windowMs / 2);
    const recentRequests = entry.lastRequest > burstWindowStart ? 1 : 0;

    if (recentRequests >= (this.config.burstLimit || this.config.maxRequests * 2)) {
      throw new RateLimitExceededError(
        this.config.service,
        entry.resetTime,
        1000
      );
    }

    // Update entry
    entry.count++;
    entry.lastRequest = now;
    this.requests.set(identifier, entry);
  }

  /**
   * Execute function with rate limiting
   * (Comment removed - was in Arabic)
   */
  async execute<T>(
    fn: () => Promise<T>,
    identifier: string = 'default',
    options: {
      maxRetries?: number;
      retryDelay?: number;
      exponentialBackoff?: boolean;
    } = {}
  ): Promise<T> {
    const { maxRetries = 3, retryDelay = 1000, exponentialBackoff = true } = options;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Check rate limit
        await this.checkLimit(identifier);

        // Execute function
        const result = await fn();

        // Success - reset circuit breaker
        if (this.circuitBreakerState === 'HALF_OPEN') {
          this.circuitBreakerState = 'CLOSED';
          this.circuitBreakerFailures = 0;
        }

        return result;

      } catch (error) {
        // Handle rate limit errors
        if (error instanceof RateLimitExceededError) {
          if (attempt === maxRetries) {
            // Circuit breaker failure
            this.recordFailure();
            throw error;
          }

          // Wait and retry
          const delay = exponentialBackoff
            ? retryDelay * Math.pow(2, attempt)
            : retryDelay;

          await this.delay(delay);
          continue;
        }

        // Other errors - record failure and rethrow
        this.recordFailure();
        throw error;
      }
    }

    throw new Error('Max retries exceeded');
  }

  /**
   * Get current status
   * (Comment removed - was in Arabic)
   */
  getStatus(identifier: string = 'default'): {
    requests: number;
    limit: number;
    resetTime: number;
    remaining: number;
    isLimited: boolean;
    circuitBreakerState: string;
  } {
    const entry = this.requests.get(identifier);
    const now = Date.now();

    if (!entry || now > entry.resetTime) {
      return {
        requests: 0,
        limit: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
        remaining: this.config.maxRequests,
        isLimited: false,
        circuitBreakerState: this.circuitBreakerState
      };
    }

    const remaining = Math.max(0, this.config.maxRequests - entry.count);
    const isLimited = entry.backoffUntil ? now < entry.backoffUntil : false;

    return {
      requests: entry.count,
      limit: this.config.maxRequests,
      resetTime: entry.resetTime,
      remaining,
      isLimited,
      circuitBreakerState: this.circuitBreakerState
    };
  }

  /**
   * Reset rate limit for identifier
   * (Comment removed - was in Arabic)
   */
  reset(identifier: string = 'default'): void {
    this.requests.delete(identifier);
  }

  /**
   * Reset circuit breaker
   * (Comment removed - was in Arabic)
   */
  resetCircuitBreaker(): void {
    this.circuitBreakerState = 'CLOSED';
    this.circuitBreakerFailures = 0;
    this.circuitBreakerLastFailure = 0;
  }

  /**
   * Record circuit breaker failure
   * (Comment removed - was in Arabic)
   */
  private recordFailure(): void {
    this.circuitBreakerFailures++;
    this.circuitBreakerLastFailure = Date.now();

    if (this.circuitBreakerFailures >= this.circuitBreakerThreshold) {
      this.circuitBreakerState = 'OPEN';
    }
  }

  /**
   * Clean up expired entries
   * (Comment removed - was in Arabic)
   */
  private cleanup(): void {
    const now = Date.now();

    for (const [identifier, entry] of this.requests.entries()) {
      if (now > entry.resetTime && (!entry.backoffUntil || now > entry.backoffUntil)) {
        this.requests.delete(identifier);
      }
    }
  }

  /**
   * Utility delay function
   * (Comment removed - was in Arabic)
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get statistics
   * (Comment removed - was in Arabic)
   */
  getStats(): {
    totalRequests: number;
    activeIdentifiers: number;
    circuitBreakerState: string;
    failures: number;
  } {
    const totalRequests = Array.from(this.requests.values())
      .reduce((sum, entry) => sum + entry.count, 0);

    return {
      totalRequests,
      activeIdentifiers: this.requests.size,
      circuitBreakerState: this.circuitBreakerState,
      failures: this.circuitBreakerFailures
    };
  }
}

// Pre-configured rate limiters for different services
export const socialMediaRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000, // 1 minute
  service: 'social-media'
});

export const apiRateLimiter = new RateLimiter({
  maxRequests: 1000,
  windowMs: 3600000, // 1 hour
  service: 'api'
});

export const databaseRateLimiter = new RateLimiter({
  maxRequests: 5000,
  windowMs: 60000, // 1 minute
  service: 'database'
});