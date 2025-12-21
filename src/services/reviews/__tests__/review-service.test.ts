// review-service.test.ts
// Unit Tests for Review Service (with Rate Limiting)
// Coverage Target: 85%+

import { ReviewService } from '../../reviews/review-service';
import { rateLimiter } from '../../rate-limiting/rateLimiter.service';
import { trustScoreService } from '../../profile/trust-score-service';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// Mock dependencies
jest.mock('firebase/firestore');
jest.mock('../../firebase/firebase-config', () => ({
  db: {},
}));
jest.mock('../../rate-limiting/rateLimiter.service', () => ({
  rateLimiter: {
    checkRateLimit: jest.fn(),
  },
  RATE_LIMIT_CONFIGS: {
    review: { windowMs: 60000, maxRequests: 5 },
  },
}));
jest.mock('../../profile/trust-score-service', () => ({
  trustScoreService: {
    calculateTrustScore: jest.fn(),
  },
}));
jest.mock('../../logger-service', () => ({
  serviceLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ReviewService', () => {
  let service: ReviewService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = ReviewService.getInstance();
  });

  describe('submitReview - Rate Limiting', () => {
    it('should block review if rate limit exceeded', async () => {
      // Mock rate limit exceeded
      (rateLimiter.checkRateLimit as jest.Mock).mockReturnValue({
        allowed: false,
        resetTime: Date.now() + 30000,
        remaining: 0,
      });

      const reviewData = {
        sellerId: 'seller-123',
        buyerId: 'buyer-456',
        rating: 5 as 1 | 2 | 3 | 4 | 5,
        title: 'Great seller!',
        comment: 'Very responsive and professional. Car was exactly as described.',
        wouldRecommend: true,
        transactionType: 'purchase' as const,
        verifiedPurchase: true,
      };

      const result = await service.submitReview(reviewData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Rate limit exceeded');
      expect(rateLimiter.checkRateLimit).toHaveBeenCalledWith(
        'buyer-456',
        'review',
        expect.any(Object)
      );
    });

    it('should allow review if rate limit not exceeded', async () => {
      // Mock rate limit allowed
      (rateLimiter.checkRateLimit as jest.Mock).mockReturnValue({
        allowed: true,
        resetTime: Date.now() + 60000,
        remaining: 4,
      });

      // Mock no existing review
      (getDocs as jest.Mock).mockResolvedValue({ empty: true, docs: [] });

      // Mock addDoc success
      (addDoc as jest.Mock).mockResolvedValue({ id: 'review-789' });

      const reviewData = {
        sellerId: 'seller-123',
        buyerId: 'buyer-456',
        rating: 5 as 1 | 2 | 3 | 4 | 5,
        title: 'Excellent service',
        comment: 'Very professional seller. Car in perfect condition. Highly recommend!',
        wouldRecommend: true,
        transactionType: 'purchase' as const,
        verifiedPurchase: true,
      };

      const result = await service.submitReview(reviewData);

      expect(result.success).toBe(true);
      expect(result.reviewId).toBe('review-789');
      expect(rateLimiter.checkRateLimit).toHaveBeenCalled();
      expect(addDoc).toHaveBeenCalled();
      expect(trustScoreService.calculateTrustScore).toHaveBeenCalledWith('seller-123');
    });
  });

  describe('validateReview', () => {
    it('should reject review with invalid rating', () => {
      const reviewData = {
        sellerId: 'seller-123',
        buyerId: 'buyer-456',
        rating: 6 as any, // Invalid rating
        title: 'Test',
        comment: 'This is a test review with sufficient length to pass validation.',
        wouldRecommend: true,
        transactionType: 'purchase' as const,
        verifiedPurchase: false,
      };

      const result = (service as any).validateReview(reviewData);

      expect(result.valid).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('should reject review with comment too short', () => {
      const reviewData = {
        sellerId: 'seller-123',
        buyerId: 'buyer-456',
        rating: 5 as 1 | 2 | 3 | 4 | 5,
        title: 'Test',
        comment: 'Too short', // Less than MIN_REVIEW_LENGTH
        wouldRecommend: true,
        transactionType: 'purchase' as const,
        verifiedPurchase: false,
      };

      const result = (service as any).validateReview(reviewData);

      expect(result.valid).toBe(false);
    });

    it('should accept valid review', () => {
      const reviewData = {
        sellerId: 'seller-123',
        buyerId: 'buyer-456',
        rating: 5 as 1 | 2 | 3 | 4 | 5,
        title: 'Great seller',
        comment: 'This is a valid review comment with more than fifty characters to pass validation rules.',
        wouldRecommend: true,
        transactionType: 'purchase' as const,
        verifiedPurchase: true,
      };

      const result = (service as any).validateReview(reviewData);

      expect(result.valid).toBe(true);
    });
  });

  describe('hasUserReviewedSeller', () => {
    it('should return true if user already reviewed seller', async () => {
      (getDocs as jest.Mock).mockResolvedValue({
        empty: false,
        docs: [{ id: 'existing-review' }],
      });

      const result = await (service as any).hasUserReviewedSeller('buyer-123', 'seller-456');

      expect(result).toBe(true);
    });

    it('should return false if no existing review', async () => {
      (getDocs as jest.Mock).mockResolvedValue({
        empty: true,
        docs: [],
      });

      const result = await (service as any).hasUserReviewedSeller('buyer-123', 'seller-456');

      expect(result).toBe(false);
    });
  });

  describe('createReview (legacy wrapper)', () => {
    it('should call submitReview with mapped data', async () => {
      (rateLimiter.checkRateLimit as jest.Mock).mockReturnValue({
        allowed: true,
        resetTime: Date.now() + 60000,
        remaining: 4,
      });

      (getDocs as jest.Mock).mockResolvedValue({ empty: true, docs: [] });
      (addDoc as jest.Mock).mockResolvedValue({ id: 'review-999' });

      const reviewId = await service.createReview(
        'car-123',
        'seller-456',
        'buyer-789',
        5,
        'Great seller! Very professional and responsive. Car was perfect.'
      );

      expect(reviewId).toBe('review-999');
      expect(addDoc).toHaveBeenCalled();
    });
  });
});
