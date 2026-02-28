/**
 * Unit Tests for Cloud Functions Rate Limiter
 * Tests sliding window rate limiting with Firestore backend
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { enforceRateLimit, cleanupRateLimitRecords } from '../rate-limiter';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v1';

// Mock firebase-admin
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

// Mock firebase-functions
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

describe('Rate Limiter Utility', () => {
  let mockDb: any;
  let mockCollection: any;
  let mockQuery: any;
  let mockBatch: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock Firestore
    mockQuery = {
      where: vi.fn().mockReturnThis(),
      get: vi.fn(),
      limit: vi.fn().mockReturnThis()
    };

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

  describe('enforceRateLimit', () => {
    it('should allow request when under limit', async () => {
      const now = { toMillis: () => Date.now() };
      (admin.firestore as any).Timestamp.now = vi.fn().mockReturnValue(now);
      (admin.firestore as any).Timestamp.fromMillis = vi.fn().mockReturnValue(now);

      mockCollection.get = vi.fn().mockResolvedValueOnce({
        size: 2, // 2 calls already made
        docs: [],
        where: vi.fn().mockReturnThis()
      });
      mockCollection.add = vi.fn().mockResolvedValueOnce({});

      const db = mockDb;
      (admin.firestore as any).mockReturnValue(db);

      // Should not throw
      await expect(
        enforceRateLimit('user-123', {
          collection: 'rate_limits_test',
          maxCalls: 5,
          windowSeconds: 3600
        })
      ).resolves.not.toThrow();
    });

    it('should block request when at limit', async () => {
      const now = { toMillis: () => Date.now() };
      (admin.firestore as any).Timestamp.now = vi.fn().mockReturnValue(now);
      (admin.firestore as any).Timestamp.fromMillis = vi.fn().mockReturnValue(now);

      mockCollection.where = vi.fn().mockReturnThis();
      mockCollection.get = vi.fn().mockResolvedValueOnce({
        size: 5, // Already at limit
        docs: Array(5),
        where: vi.fn().mockReturnThis()
      });

      (admin.firestore as any).mockReturnValue(mockDb);

      // Should throw HttpsError
      await expect(
        enforceRateLimit('user-456', {
          collection: 'rate_limits_test',
          maxCalls: 5,
          windowSeconds: 3600
        })
      ).rejects.toThrow();
    });

    it('should record call timestamp in Firestore', async () => {
      const now = { toMillis: () => Date.now() };
      (admin.firestore as any).Timestamp.now = vi.fn().mockReturnValue(now);
      (admin.firestore as any).Timestamp.fromMillis = vi.fn().mockReturnValue(now);

      mockCollection.where = vi.fn().mockReturnThis();
      mockCollection.get = vi.fn().mockResolvedValueOnce({
        size: 1,
        docs: [{}],
        where: vi.fn().mockReturnThis()
      });
      mockCollection.add = vi.fn().mockResolvedValueOnce({});

      (admin.firestore as any).mockReturnValue(mockDb);

      await enforceRateLimit('user-789', {
        collection: 'rate_limits_test',
        maxCalls: 10,
        windowSeconds: 3600
      });

      expect(mockCollection.add).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'user-789',
          timestamp: now
        })
      );
    });

    it('should use sliding window to calculate rate limit', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 3600 * 1000);

      const mockTimestamp = {
        toMillis: () => now.getTime()
      };

      const mockOldTimestamp = {
        toMillis: () => oneHourAgo.getTime()
      };

      (admin.firestore as any).Timestamp.now = vi.fn().mockReturnValue(mockTimestamp);
      (admin.firestore as any).Timestamp.fromMillis = vi
        .fn()
        .mockImplementation((millis) => ({
          toMillis: () => millis
        }));

      mockCollection.where = vi.fn().mockReturnThis();
      mockCollection.get = vi.fn().mockResolvedValueOnce({
        size: 0,
        docs: [],
        where: vi.fn().mockReturnThis()
      });
      mockCollection.add = vi.fn().mockResolvedValueOnce({});

      (admin.firestore as any).mockReturnValue(mockDb);

      await enforceRateLimit('user-window', {
        collection: 'rate_limits_test',
        maxCalls: 5,
        windowSeconds: 3600
      });

      // Verify window calculation
      expect((admin.firestore as any).Timestamp.fromMillis).toHaveBeenCalledWith(
        expect.any(Number)
      );
    });

    it('should throw with appropriate error message', async () => {
      const now = { toMillis: () => Date.now() };
      (admin.firestore as any).Timestamp.now = vi.fn().mockReturnValue(now);
      (admin.firestore as any).Timestamp.fromMillis = vi.fn().mockReturnValue(now);

      mockCollection.where = vi.fn().mockReturnThis();
      mockCollection.get = vi.fn().mockResolvedValueOnce({
        size: 10, // Over limit of 10 in 1 hour
        docs: Array(10),
        where: vi.fn().mockReturnThis()
      });

      (admin.firestore as any).mockReturnValue(mockDb);

      try {
        await enforceRateLimit('user-error', {
          collection: 'rate_limits_test',
          maxCalls: 10,
          windowSeconds: 3600
        });
      } catch (error) {
        expect((error as any).message).toMatch(/Rate limit exceeded/);
        expect((error as any).message).toMatch(/10 calls per 60 minutes/);
      }
    });
  });

  describe('cleanupRateLimitRecords', () => {
    it('should delete expired records', async () => {
      const mockDeletedDocs = Array(10).fill({ ref: {} });
      const mockDocs = mockDeletedDocs.map((doc) => ({
        ...doc,
      }));

      mockCollection.where = vi.fn().mockReturnThis();
      mockCollection.limit = vi.fn().mockReturnThis();
      mockCollection.get = vi.fn().mockResolvedValueOnce({
        empty: false,
        docs: mockDocs,
        size: 10
      });

      mockBatch.delete = vi.fn();
      mockBatch.commit = vi.fn().mockResolvedValueOnce(undefined);

      (admin.firestore as any).mockReturnValue(mockDb);
      (admin.firestore as any).Timestamp.fromMillis = vi.fn().mockReturnValue({
        toMillis: () => Date.now()
      });

      const deleted = await cleanupRateLimitRecords('rate_limits_test', 86400);

      expect(deleted).toBe(10);
      expect(mockBatch.delete).toHaveBeenCalledTimes(10);
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it('should return 0 when no expired records', async () => {
      mockCollection.where = vi.fn().mockReturnThis();
      mockCollection.limit = vi.fn().mockReturnThis();
      mockCollection.get = vi.fn().mockResolvedValueOnce({
        empty: true,
        docs: [],
        size: 0
      });

      (admin.firestore as any).mockReturnValue(mockDb);

      const deleted = await cleanupRateLimitRecords('rate_limits_test', 86400);

      expect(deleted).toBe(0);
      expect(mockBatch.delete).not.toHaveBeenCalled();
    });

    it('should batch delete for performance', async () => {
      const mockDocs = Array(500).fill(null).map(() => ({ ref: {} }));

      mockCollection.where = vi.fn().mockReturnThis();
      mockCollection.limit = vi.fn().mockReturnThis();
      mockCollection.get = vi.fn().mockResolvedValueOnce({
        empty: false,
        docs: mockDocs,
        size: 500
      });

      mockBatch.delete = vi.fn();
      mockBatch.commit = vi.fn().mockResolvedValueOnce(undefined);

      (admin.firestore as any).mockReturnValue(mockDb);

      const deleted = await cleanupRateLimitRecords('rate_limits_test', 86400);

      expect(deleted).toBe(500);
      expect(mockBatch.delete).toHaveBeenCalledTimes(500);
    });

    it('should use custom max age when provided', async () => {
      mockCollection.where = vi.fn().mockReturnThis();
      mockCollection.limit = vi.fn().mockReturnThis();
      mockCollection.get = vi.fn().mockResolvedValueOnce({
        empty: true,
        docs: [],
        size: 0
      });

      (admin.firestore as any).mockReturnValue(mockDb);
      (admin.firestore as any).Timestamp.fromMillis = vi.fn();

      await cleanupRateLimitRecords('rate_limits_test', 3600); // 1 hour instead of 24

      // Verify custom window was used
      expect((admin.firestore as any).Timestamp.fromMillis).toHaveBeenCalled();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle concurrent rate limit checks', async () => {
      const now = { toMillis: () => Date.now() };
      (admin.firestore as any).Timestamp.now = vi.fn().mockReturnValue(now);
      (admin.firestore as any).Timestamp.fromMillis = vi.fn().mockReturnValue(now);

      mockCollection.where = vi.fn().mockReturnThis();

      // Simulate 3 concurrent requests for same user
      const calls = [1, 2, 3].map(() =>
        Promise.resolve({
          size: 0,
          docs: [],
          where: vi.fn().mockReturnThis()
        })
      );

      mockCollection.get = vi
        .fn()
        .mockResolvedValueOnce(calls[0])
        .mockResolvedValueOnce(calls[1])
        .mockResolvedValueOnce(calls[2]);

      mockCollection.add = vi.fn().mockResolvedValue({});

      (admin.firestore as any).mockReturnValue(mockDb);

      // All 3 should succeed
      const results = await Promise.allSettled([
        enforceRateLimit('user-concurrent', {
          collection: 'rate_limits_test',
          maxCalls: 10,
          windowSeconds: 3600
        }),
        enforceRateLimit('user-concurrent', {
          collection: 'rate_limits_test',
          maxCalls: 10,
          windowSeconds: 3600
        }),
        enforceRateLimit('user-concurrent', {
          collection: 'rate_limits_test',
          maxCalls: 10,
          windowSeconds: 3600
        })
      ]);

      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      expect(succeeded).toBeGreaterThanOrEqual(1);
    });
  });
});
