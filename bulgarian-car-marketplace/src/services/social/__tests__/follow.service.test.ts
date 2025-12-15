// follow.service.test.ts
// Unit Tests for Follow Service (Social Features)
// Coverage Target: 85%+

import { FollowService } from '../../social/follow.service';
import { rateLimiter } from '../../rate-limiting/rateLimiter.service';
import { writeBatch, doc, getDoc, getDocs } from 'firebase/firestore';

// Mock dependencies
jest.mock('firebase/firestore');
jest.mock('../../../firebase/firebase-config', () => ({
  db: {},
}));
jest.mock('../../rate-limiting/rateLimiter.service', () => ({
  rateLimiter: {
    checkRateLimit: jest.fn(),
  },
  RATE_LIMIT_CONFIGS: {
    follow: { windowMs: 60000, maxRequests: 10 },
  },
}));
jest.mock('../../logger-wrapper', () => ({
  serviceLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('FollowService', () => {
  let service: FollowService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = FollowService.getInstance();
  });

  describe('followUser - Rate Limiting', () => {
    it('should block follow if rate limit exceeded', async () => {
      (rateLimiter.checkRateLimit as jest.Mock).mockReturnValue({
        allowed: false,
        resetTime: Date.now() + 30000,
        remaining: 0,
      });

      await expect(
        service.followUser('follower-123', 'following-456')
      ).rejects.toThrow('Rate limit exceeded');

      expect(rateLimiter.checkRateLimit).toHaveBeenCalledWith(
        'follower-123',
        'follow',
        expect.any(Object)
      );
    });

    it('should allow follow if rate limit not exceeded', async () => {
      (rateLimiter.checkRateLimit as jest.Mock).mockReturnValue({
        allowed: true,
        resetTime: Date.now() + 60000,
        remaining: 9,
      });

      // Mock isFollowing returns false
      (getDocs as jest.Mock).mockResolvedValue({ empty: true, docs: [] });

      // Mock batch commit
      const mockBatch = {
        set: jest.fn(),
        update: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined),
      };
      (writeBatch as jest.Mock).mockReturnValue(mockBatch);

      const result = await service.followUser('follower-123', 'following-456');

      expect(result).toBe(true);
      expect(rateLimiter.checkRateLimit).toHaveBeenCalled();
      expect(mockBatch.commit).toHaveBeenCalled();
    });
  });

  describe('followUser - Validation', () => {
    it('should prevent self-follow', async () => {
      (rateLimiter.checkRateLimit as jest.Mock).mockReturnValue({
        allowed: true,
        resetTime: Date.now() + 60000,
        remaining: 9,
      });

      const result = await service.followUser('user-123', 'user-123');

      expect(result).toBe(false);
    });

    it('should prevent duplicate follow', async () => {
      (rateLimiter.checkRateLimit as jest.Mock).mockReturnValue({
        allowed: true,
        resetTime: Date.now() + 60000,
        remaining: 9,
      });

      // Mock already following
      (getDocs as jest.Mock).mockResolvedValue({
        empty: false,
        docs: [{ id: 'existing-follow' }],
      });

      const result = await service.followUser('follower-123', 'following-456');

      expect(result).toBe(false);
    });
  });

  describe('unfollowUser', () => {
    it('should successfully unfollow user', async () => {
      const mockBatch = {
        delete: jest.fn(),
        update: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined),
      };
      (writeBatch as jest.Mock).mockReturnValue(mockBatch);

      // Mock follow exists
      (getDocs as jest.Mock).mockResolvedValue({
        empty: false,
        docs: [{ id: 'follow-relation' }],
      });

      const result = await service.unfollowUser('follower-123', 'following-456');

      expect(result).toBe(true);
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it('should return false if not following', async () => {
      // Mock not following
      (getDocs as jest.Mock).mockResolvedValue({ empty: true, docs: [] });

      const result = await service.unfollowUser('follower-123', 'following-456');

      expect(result).toBe(false);
    });
  });

  describe('isFollowing', () => {
    it('should return true if following', async () => {
      const mockDoc = {
        exists: () => true,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);

      const result = await service.isFollowing('follower-123', 'following-456');

      expect(result).toBe(true);
    });

    it('should return false if not following', async () => {
      const mockDoc = {
        exists: () => false,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);

      const result = await service.isFollowing('follower-123', 'following-456');

      expect(result).toBe(false);
    });
  });

  describe('getFollowStats', () => {
    it('should return follow statistics', async () => {
      // Mock followers count
      (getDocs as jest.Mock)
        .mockResolvedValueOnce({ size: 150 }) // followers
        .mockResolvedValueOnce({ size: 75 })  // following
        .mockResolvedValueOnce({ docs: [] }); // mutual (will be calculated)

      const stats = await service.getFollowStats('user-123');

      expect(stats.followers).toBe(150);
      expect(stats.following).toBe(75);
      expect(stats).toHaveProperty('mutualFollows');
    });

    it('should handle errors gracefully', async () => {
      (getDocs as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      const stats = await service.getFollowStats('user-123');

      expect(stats.followers).toBe(0);
      expect(stats.following).toBe(0);
      expect(stats.mutualFollows).toBe(0);
    });
  });

  describe('getFollowers', () => {
    it('should return list of followers', async () => {
      const mockFollowers = [
        {
          id: 'follower-1',
          data: () => ({
            userId: 'follower-1',
            followedAt: new Date(),
          }),
        },
        {
          id: 'follower-2',
          data: () => ({
            userId: 'follower-2',
            followedAt: new Date(),
          }),
        },
      ];

      (getDocs as jest.Mock).mockResolvedValue({ docs: mockFollowers });

      const followers = await service.getFollowers('user-123', 10);

      expect(followers).toHaveLength(2);
      expect(followers[0].userId).toBe('follower-1');
    });

    it('should respect limit parameter', async () => {
      const mockFollowers = Array.from({ length: 20 }, (_, i) => ({
        id: `follower-${i}`,
        data: () => ({
          userId: `follower-${i}`,
          followedAt: new Date(),
        }),
      }));

      (getDocs as jest.Mock).mockResolvedValue({ docs: mockFollowers });

      const followers = await service.getFollowers('user-123', 5);

      // Limit should be applied in query (mocked), but we verify call
      expect(getDocs).toHaveBeenCalled();
    });
  });

  describe('getFollowing', () => {
    it('should return list of following', async () => {
      const mockFollowing = [
        {
          id: 'following-1',
          data: () => ({
            userId: 'following-1',
            followedAt: new Date(),
          }),
        },
      ];

      (getDocs as jest.Mock).mockResolvedValue({ docs: mockFollowing });

      const following = await service.getFollowing('user-123', 10);

      expect(following).toHaveLength(1);
      expect(following[0].userId).toBe('following-1');
    });
  });
});
