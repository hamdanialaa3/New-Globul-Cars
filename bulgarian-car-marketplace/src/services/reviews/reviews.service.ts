/**
 * Reviews Service
 * Handles seller reviews and ratings
 * Location: Bulgaria | Languages: BG, EN | Currency: EUR
 */

import {
  collection,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-wrapper';

export interface Review {
  id: string;
  carId: string;
  sellerId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerPhoto?: string;
  rating: number;
  comment: string;
  verified: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface SellerRating {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

class ReviewsService {
  /**
   * Create a new review for a seller
   */
  async createReview(
    carId: string,
    sellerId: string,
    reviewerId: string,
    rating: number,
    comment: string
  ): Promise<string> {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    if (!comment.trim()) {
      throw new Error('Comment is required');
    }

    if (reviewerId === sellerId) {
      throw new Error('Cannot review your own listing');
    }

    try {
      // Check for existing review
      const existingReviews = await this.getUserReviewForSeller(
        reviewerId,
        sellerId,
        carId
      );

      if (existingReviews.length > 0) {
        throw new Error('You have already reviewed this seller');
      }

      // Get reviewer info
      const reviewerDoc = await getDoc(doc(db, 'users', reviewerId));
      const reviewerData = reviewerDoc.data();

      // Create review
      const reviewsRef = collection(db, 'reviews');
      const reviewDoc = await addDoc(reviewsRef, {
        carId,
        sellerId,
        reviewerId,
        reviewerName: reviewerData?.displayName || reviewerData?.businessName || 'User',
        reviewerPhoto: reviewerData?.photoURL || reviewerData?.profileImage?.url,
        rating,
        comment: comment.trim(),
        verified: false, // Can be set to true if purchase verified
        createdAt: serverTimestamp()
      });

      serviceLogger.info('Review created', { reviewId: reviewDoc.id, sellerId, carId });
      return reviewDoc.id;

    } catch (error) {
      serviceLogger.error('Error creating review', error as Error, { sellerId, carId, reviewerId });
      throw error;
    }
  }

  /**
   * Get all reviews for a seller
   */
  async getSellerReviews(
    sellerId: string,
    limitCount: number = 20
  ): Promise<Review[]> {
    try {
      const reviewsRef = collection(db, 'reviews');
      const reviewsQuery = query(
        reviewsRef,
        where('sellerId', '==', sellerId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(reviewsQuery);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Review));

    } catch (error) {
      serviceLogger.error('Error getting seller reviews', error as Error, { sellerId });
      throw error;
    }
  }

  /**
   * Get seller's aggregated rating
   */
  async getSellerRating(sellerId: string): Promise<SellerRating> {
    try {
      const sellerDoc = await getDoc(doc(db, 'sellers', sellerId));

      if (sellerDoc.exists()) {
        const data = sellerDoc.data();
        return {
          averageRating: data.averageRating || 0,
          totalReviews: data.totalReviews || 0,
          ratingDistribution: data.ratingDistribution || {
            5: 0, 4: 0, 3: 0, 2: 0, 1: 0
          }
        };
      }

      // No rating yet
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };

    } catch (error) {
      serviceLogger.error('Error getting seller rating', error as Error, { sellerId });
      throw error;
    }
  }

  /**
   * Check if user has reviewed a seller for a specific car
   */
  async getUserReviewForSeller(
    reviewerId: string,
    sellerId: string,
    carId: string
  ): Promise<Review[]> {
    try {
      const reviewsRef = collection(db, 'reviews');
      const reviewsQuery = query(
        reviewsRef,
        where('sellerId', '==', sellerId),
        where('reviewerId', '==', reviewerId),
        where('carId', '==', carId)
      );

      const querySnapshot = await getDocs(reviewsQuery);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Review));

    } catch (error) {
      serviceLogger.error('Error checking existing review', error as Error, { sellerId, reviewerId, carId });
      throw error;
    }
  }

  /**
   * Update an existing review
   */
  async updateReview(
    reviewId: string,
    rating: number,
    comment: string
  ): Promise<void> {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    try {
      const reviewRef = doc(db, 'reviews', reviewId);

      await updateDoc(reviewRef, {
        rating,
        comment: comment.trim(),
        updatedAt: serverTimestamp()
      });

      serviceLogger.info('Review updated', { reviewId });

    } catch (error) {
      serviceLogger.error('Error updating review', error as Error, { reviewId });
      throw error;
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string): Promise<void> {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await deleteDoc(reviewRef);

      serviceLogger.info('Review deleted', { reviewId });

    } catch (error) {
      serviceLogger.error('Error deleting review', error as Error, { reviewId });
      throw error;
    }
  }

  /**
   * Get reviews by a specific user (reviews they wrote)
   */
  async getReviewsByUser(reviewerId: string): Promise<Review[]> {
    try {
      const reviewsRef = collection(db, 'reviews');
      const reviewsQuery = query(
        reviewsRef,
        where('reviewerId', '==', reviewerId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(reviewsQuery);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Review));

    } catch (error) {
      serviceLogger.error('Error getting user reviews', error as Error, { reviewerId });
      throw error;
    }
  }
}

export const reviewsService = new ReviewsService();
export default reviewsService;

