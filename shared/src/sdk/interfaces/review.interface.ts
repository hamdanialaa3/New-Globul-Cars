/**
 * Review Service Interface
 * Shared contract for seller/dealer reviews across web and mobile.
 */

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  targetId: string;
  targetType: 'seller' | 'dealer';
  rating: number; // 1-5
  comment: string;
  listingId?: string;
  response?: string;
  createdAt: Date;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>; // { 1: 2, 2: 0, 3: 5, 4: 10, 5: 20 }
}

export interface IReviewService {
  /** Submit a review for a seller or dealer */
  submitReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review>;

  /** Get reviews for a target (seller/dealer) */
  getReviews(targetId: string, limitCount?: number): Promise<Review[]>;

  /** Get aggregated review stats */
  getStats(targetId: string): Promise<ReviewStats>;

  /** Check if current user has already reviewed this target */
  hasReviewed(reviewerId: string, targetId: string): Promise<boolean>;
}
