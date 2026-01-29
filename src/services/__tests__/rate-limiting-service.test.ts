// src/services/__tests__/rate-limiting-service.test.ts
// Unit Tests for Rate Limiting Service

import { RateLimitingService, rateLimiter } from '../rate-limiting-service';

describe('RateLimitingService', () => {
  beforeEach(() => {
    // Reset rate limits before each test
    rateLimiter.resetRateLimit('test-key');
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const config = {
        windowMs: 60000,
        maxRequests: 5
      };

      for (let i = 0; i < 5; i++) {
        const result = rateLimiter.checkRateLimit('test-key', config, 'bg');
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4 - i);
      }
    });

    it('should block requests exceeding limit', () => {
      const config = {
        windowMs: 60000,
        maxRequests: 3
      };

      // Make 3 allowed requests
      for (let i = 0; i < 3; i++) {
        rateLimiter.checkRateLimit('test-key', config, 'bg');
      }

      // 4th request should be blocked
      const result = rateLimiter.checkRateLimit('test-key', config, 'bg');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.message).toBeDefined();
    });

    it('should reset after window expires', async () => {
      const config = {
        windowMs: 100, // 100ms window
        maxRequests: 2
      };

      // Make 2 requests
      rateLimiter.checkRateLimit('test-key', config, 'bg');
      rateLimiter.checkRateLimit('test-key', config, 'bg');

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should allow new requests
      const result = rateLimiter.checkRateLimit('test-key', config, 'bg');
      expect(result.allowed).toBe(true);
    });
  });

  describe('checkAuthRateLimit', () => {
    it('should apply login rate limits', () => {
      const result = rateLimiter.checkAuthRateLimit('login', 'user@example.com', 'bg');
      expect(result.allowed).toBe(true);
    });

    it('should apply register rate limits', () => {
      const result = rateLimiter.checkAuthRateLimit('register', 'user@example.com', 'bg');
      expect(result.allowed).toBe(true);
    });
  });

  describe('getStatistics', () => {
    it('should return rate limit statistics', () => {
      const config = { windowMs: 60000, maxRequests: 5 };
      
      rateLimiter.checkRateLimit('key1', config, 'bg');
      rateLimiter.checkRateLimit('key2', config, 'bg');
      
      const stats = rateLimiter.getStatistics();
      expect(stats.totalActiveLimits).toBeGreaterThan(0);
    });
  });
});
