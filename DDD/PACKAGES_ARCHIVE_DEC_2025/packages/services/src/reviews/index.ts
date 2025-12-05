// src/services/reviews/index.ts
// Reviews Module Index - ملف ربط خدمات المراجعات
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

/**
 * Reviews & Ratings Module
 * 
 * نظام المراجعات والتقييمات للبائعين البلغاريين
 * Reviews and ratings system for Bulgarian sellers
 * 
 * Available Services:
 * 1. reviewService - خدمة المراجعات
 * 2. ratingService - خدمة التقييمات
 */

// ==================== IMPORTS ====================

import { reviewService } from './review-service';
import { ratingService } from './rating-service';

// ==================== EXPORTS ====================

// Review Service
export {
  reviewService,
  ReviewService
} from './review-service';

export type {
  Review,
  ReviewStats,
  SubmitReviewData
} from './review-service';

// Rating Service
export {
  ratingService,
  RatingService
} from './rating-service';

export type {
  RatingData,
  RatingLevel
} from './rating-service';

// ==================== CONSOLIDATED SERVICE ====================

/**
 * Main Reviews Service
 * خدمة المراجعات الموحدة
 */
export const ReviewsService = {
  review: reviewService,
  rating: ratingService
};

// Default export
export default ReviewsService;
