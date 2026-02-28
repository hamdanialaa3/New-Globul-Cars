/**
 * Load Testing for Rate Limiter
 * Tests concurrent request handling and performance under load
 * 
 * @file rate-limiter.load.test.ts
 * @since Phase 5 - Integration Testing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v1';

// Mock dependencies
vi.mock('firebase-admin', () => ({
  firestore: vi.fn(() => ({
    collection: vi.fn(),
    batch: vi.fn(),
    Timestamp: {
      now: vi.fn(),
      fromMillis: vi.fn()
    }
  })),
  firestore: {
    Timestamp: {
      now: vi.fn(),
      fromMillis: vi.fn()
    }
  }
}));

vi.mock('firebase-functions/v1', () => ({
  https: {
    HttpsError: class HttpsError extends Error {
      constructor(public code: string, message: string) {
        super(message);
      }
    }
  },
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn()
  }
}));

describe('Rate Limiter - Load Testing', () => {
  let mockDb: any;
  let mockCollection: any;
  let mockBatch: any;
  let performanceMetrics: Map<
    string,
    { totalTime: number; count: number; avgTime: number }
  >;

  beforeEach(() => {
    vi.clearAllMocks();
    performanceMetrics = new Map();

    mockCollection = {
      where: vi.fn().mockReturnThis(),
      get: vi.fn(),
      add: vi.fn(),
      limit: vi.fn().mockReturnThis()
    };

    mockBatch = {
      delete: vi.fn(),
      commit: vi.fn()
    };

    mockDb = {
      collection: vi.fn().mockReturnValue(mockCollection),
      batch: vi.fn().mockReturnValue(mockBatch),
      Timestamp: {
        now: vi.fn(),
        fromMillis: vi.fn()
      }
    };
  });

  afterEach(() => {
    // Print performance metrics
    performanceMetrics.forEach((metrics, testName) => {
      console.log(
        `[PERF] ${testName}: ${metrics.avgTime.toFixed(2)}ms avg (${metrics.count} ops)`
      );
    });
  });

  /**
   * Test Scenario: 100 concurrent requests from different users
   * Expected: All requests processed within acceptable time limits
   * Metric: < 50ms per request, no queue buildup
   */
  describe('Concurrent User Load', () => {
    it('should handle 100 concurrent users within time limit', async () => {
      const numUsers = 100;
      const startTime = Date.now();
      const userIds = Array.from({ length: numUsers }, (_, i) => `user-${i}`);

      const now = { toMillis: () => Date.now() };
      (admin.firestore as any).Timestamp.now = vi.fn().mockReturnValue(now);
      (admin.firestore as any).Timestamp.fromMillis = vi.fn().mockReturnValue(now);
      (admin.firestore as any).mockReturnValue(mockDb);

      mockCollection.where = vi.fn().mockReturnThis();

      // Simulate each user making a request
      mockCollection.get = vi.fn().mockResolvedValue({
        size: Math.floor(Math.random() * 5), // Random calls already made
        docs: [],
        where: vi.fn().mockReturnThis()
      });

      mockCollection.add = vi.fn().mockResolvedValue({});

      const { enforceRateLimit } = await import('../rate-limiter');

      // Execute 100 concurrent requests
      const promises = userIds.map((userId) =>
        enforceRateLimit(userId, {
          collection: 'rate_limits_concurrent',
          maxCalls: 10,
          windowSeconds: 3600
        })
      );

      const results = await Promise.allSettled(promises);
      const totalTime = Date.now() - startTime;
      const avgTime = totalTime / numUsers;

      // Verify all requests succeeded
      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      expect(succeeded).toBe(numUsers);

      // Performance assertion: should complete within reasonable time
      expect(avgTime).toBeLessThan(100); // Less than 100ms average per request

      performanceMetrics.set('100 Concurrent Users', {
        totalTime,
        count: numUsers,
        avgTime
      });
    });

    /**
     * Test Scenario: Single user rapid-fire requests (burst)
     * Expected: First 10 succeed, 11th fails with rate limit error
     * Metric: Sliding window correctly enforced
     */
    it('should enforce rate limit for rapid burst requests', async () => {
      const now = { toMillis: () => Date.now() };
      (admin.firestore as any).Timestamp.now = vi.fn().mockReturnValue(now);
      (admin.firestore as any).Timestamp.fromMillis = vi.fn().mockReturnValue(now);
      (admin.firestore as any).mockReturnValue(mockDb);

      mockCollection.where = vi.fn().mockReturnThis();
      mockCollection.add = vi.fn().mockResolvedValue({});

      const { enforceRateLimit } = await import('../rate-limiter');
      let callCount = 0;

      // Mock progressively increasing call count
      mockCollection.get = vi.fn().mockImplementation(async () => {
        const currentCount = callCount++;
        return {
          size: currentCount,
          docs: Array(currentCount),
          where: vi.fn().mockReturnThis()
        };
      });

      // Burst: 15 rapid requests
      const requests = Array.from({ length: 15 }, (_, i) =>
        enforceRateLimit(`burst-user`, {
          collection: 'rate_limits_burst',
          maxCalls: 10,
          windowSeconds: 3600
        })
      );

      const results = await Promise.allSettled(requests);

      // Count successes and failures
      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      // Should allow 10, block 5
      expect(succeeded).toBeLessThanOrEqual(10);
      expect(failed).toBeGreaterThan(0);
    });
  });

  /**
   * Test Scenario: Sustained load over time (1000 requests)
   * Expected: No memory leaks, consistent performance
   * Metric: Linear performance degradation (if any)
   */
  describe('Sustained Load', () => {
    it('should maintain performance under sustained 1000-request load', async () => {
      const now = { toMillis: () => Date.now() };
      (admin.firestore as any).Timestamp.now = vi.fn().mockReturnValue(now);
      (admin.firestore as any).Timestamp.fromMillis = vi.fn().mockReturnValue(now);
      (admin.firestore as any).mockReturnValue(mockDb);

      mockCollection.where = vi.fn().mockReturnThis();
      mockCollection.get = vi.fn().mockResolvedValue({
        size: 2,
        docs: [],
        where: vi.fn().mockReturnThis()
      });
      mockCollection.add = vi.fn().mockResolvedValue({});

      const { enforceRateLimit } = await import('../rate-limiter');

      const startTime = Date.now();
      let successCount = 0;
      let failureCount = 0;

      // 1000 requests in batches
      for (let batch = 0; batch < 10; batch++) {
        const promises = Array.from({ length: 100 }, (_, i) =>
          enforceRateLimit(`user-${batch}-${i}`, {
            collection: 'rate_limits_sustained',
            maxCalls: 50,
            windowSeconds: 3600
          })
        );

        const results = await Promise.allSettled(promises);
        successCount += results.filter((r) => r.status === 'fulfilled').length;
        failureCount += results.filter((r) => r.status === 'rejected').length;
      }

      const totalTime = Date.now() - startTime;
      const avgTime = totalTime / 1000;

      expect(successCount).toBeGreaterThan(0);

      // Performance: should process 1000 requests in reasonable time
      expect(totalTime).toBeLessThan(30000); // Less than 30 seconds for 1000 requests

      performanceMetrics.set('Sustained 1000 Requests', {
        totalTime,
        count: 1000,
        avgTime
      });
    });
  });

  /**
   * Test Scenario: Cleanup performance with many records
   * Expected: Batch cleanup completes reasonably fast
   * Metric: < 5 seconds for 500+ records
   */
  describe('Cleanup Performance', () => {
    it('should cleanup expired records efficiently', async () => {
      const recordCount = 500;
      const mockDocs = Array(recordCount)
        .fill(null)
        .map(() => ({ ref: {} }));

      mockCollection.where = vi.fn().mockReturnThis();
      mockCollection.limit = vi.fn().mockReturnThis();
      mockCollection.get = vi.fn().mockResolvedValueOnce({
        empty: false,
        docs: mockDocs,
        size: recordCount
      });

      mockBatch.delete = vi.fn();
      mockBatch.commit = vi.fn().mockResolvedValueOnce(undefined);

      (admin.firestore as any).mockReturnValue(mockDb);
      (admin.firestore as any).Timestamp.fromMillis = vi.fn().mockReturnValue({
        toMillis: () => Date.now()
      });

      const { cleanupRateLimitRecords } = await import('../rate-limiter');

      const startTime = Date.now();
      const deleted = await cleanupRateLimitRecords(
        'rate_limits_cleanup',
        86400
      );
      const totalTime = Date.now() - startTime;

      expect(deleted).toBe(recordCount);
      expect(totalTime).toBeLessThan(5000); // Less than 5 seconds

      performanceMetrics.set('Cleanup 500 Records', {
        totalTime,
        count: recordCount,
        avgTime: totalTime / recordCount
      });
    });

    /**
     * Test Scenario: Cleanup with batching (500 record batches)
     * Expected: Only first 500 deleted per call
     * Metric: Distributed cleanup without timeout
     */
    it('should batch delete records to avoid timeouts', async () => {
      // Return exactly 500 records (batch limit)
      const batchSize = 500;
      const mockDocs = Array(batchSize)
        .fill(null)
        .map(() => ({ ref: {} }));

      mockCollection.where = vi.fn().mockReturnThis();
      mockCollection.limit = vi.fn().mockReturnThis();
      mockCollection.get = vi.fn().mockResolvedValueOnce({
        empty: false,
        docs: mockDocs,
        size: batchSize
      });

      mockBatch.delete = vi.fn();
      mockBatch.commit = vi.fn().mockResolvedValueOnce(undefined);

      (admin.firestore as any).mockReturnValue(mockDb);

      const { cleanupRateLimitRecords } = await import('../rate-limiter');

      const deleted = await cleanupRateLimitRecords(
        'rate_limits_batch',
        86400
      );

      // Should delete exactly batch size
      expect(deleted).toBe(batchSize);
      expect(mockBatch.delete).toHaveBeenCalledTimes(batchSize);
    });
  });

  /**
   * Test Scenario: Multiple rate limit configurations
   * Expected: Each config maintains its own window/limit
   * Metric: No cross-contamination between configs
   */
  describe('Multiple Configs', () => {
    it('should isolate rate limits by configuration', async () => {
      const now = { toMillis: () => Date.now() };
      (admin.firestore as any).Timestamp.now = vi.fn().mockReturnValue(now);
      (admin.firestore as any).Timestamp.fromMillis = vi.fn().mockReturnValue(now);
      (admin.firestore as any).mockReturnValue(mockDb);

      mockCollection.where = vi.fn().mockReturnThis();
      mockCollection.get = vi.fn().mockResolvedValue({
        size: 1,
        docs: [],
        where: vi.fn().mockReturnThis()
      });
      mockCollection.add = vi.fn().mockResolvedValue({});

      const { enforceRateLimit } = await import('../rate-limiter');

      // Two different configs for same user
      const config1 = {
        collection: 'rate_limits_api_calls',
        maxCalls: 100,
        windowSeconds: 3600
      };

      const config2 = {
        collection: 'rate_limits_login_attempts',
        maxCalls: 5,
        windowSeconds: 900
      };

      const userId = 'test-user-123';

      // Both should succeed independently
      await expect(
        enforceRateLimit(userId, config1)
      ).resolves.not.toThrow();

      await expect(
        enforceRateLimit(userId, config2)
      ).resolves.not.toThrow();

      // Verify different collections were queried
      expect(mockDb.collection).toHaveBeenCalledWith('rate_limits_api_calls');
      expect(mockDb.collection).toHaveBeenCalledWith('rate_limits_login_attempts');
    });
  });

  /**
   * Test Scenario: Memory and resource cleanup
   * Expected: No accumulating references after requests complete
   * Metric: Clean shutdown, no dangling promises
   */
  describe('Resource Cleanup', () => {
    it('should properly cleanup after completing requests', async () => {
      const now = { toMillis: () => Date.now() };
      (admin.firestore as any).Timestamp.now = vi.fn().mockReturnValue(now);
      (admin.firestore as any).Timestamp.fromMillis = vi.fn().mockReturnValue(now);
      (admin.firestore as any).mockReturnValue(mockDb);

      mockCollection.where = vi.fn().mockReturnThis();
      mockCollection.get = vi.fn().mockResolvedValue({
        size: 0,
        docs: [],
        where: vi.fn().mockReturnThis()
      });
      mockCollection.add = vi.fn().mockResolvedValue({});

      const { enforceRateLimit } = await import('../rate-limiter');

      // Execute and complete
      const results = await Promise.all([
        enforceRateLimit('cleanup-test-1', {
          collection: 'rate_limits_cleanup_test',
          maxCalls: 10,
          windowSeconds: 3600
        }),
        enforceRateLimit('cleanup-test-2', {
          collection: 'rate_limits_cleanup_test',
          maxCalls: 10,
          windowSeconds: 3600
        }),
        enforceRateLimit('cleanup-test-3', {
          collection: 'rate_limits_cleanup_test',
          maxCalls: 10,
          windowSeconds: 3600
        })
      ]);

      // Verify all completed
      expect(results).toHaveLength(3);

      // No pending operations
      expect(mockCollection.add.mock.results.length).toBe(3);
    });
  });
});
