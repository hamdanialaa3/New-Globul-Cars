/**
 * Firebase Cloud Functions - Reviews Aggregation
 * Calculates and updates seller ratings automatically
 * Location: Bulgaria | Languages: BG, EN | Currency: EUR
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { logger } from '../logger-service';

interface Review {
  carId: string;
  sellerId: string;
  reviewerId: string;
  rating: number;
  comment: string;
  verified: boolean;
  createdAt: FirebaseFirestore.Timestamp;
}

interface RatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

/**
 * Triggers when a review is created or updated
 * Recalculates seller's average rating and updates seller document
 */
export const aggregateSellerRating = functions.firestore
  .document('reviews/{reviewId}')
  .onWrite(async (change, context) => {
    const reviewId = context.params.reviewId;
    
    // Get seller ID from the review
    const reviewData = change.after.exists 
      ? change.after.data() as Review
      : change.before.data() as Review;
    
    if (!reviewData || !reviewData.sellerId) {
      logger.warn('No seller ID found in review');
      return null;
    }
    
    const sellerId = reviewData.sellerId;
    
    try {
      // Get all reviews for this seller
      const reviewsSnapshot = await admin.firestore()
        .collection('reviews')
        .where('sellerId', '==', sellerId)
        .get();
      
      const totalReviews = reviewsSnapshot.size;
      
      if (totalReviews === 0) {
        // No reviews - reset seller stats
        await admin.firestore()
          .collection('sellers')
          .doc(sellerId)
          .set({
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        
        logger.info(`Reset ratings for seller ${sellerId} (no reviews)`);
        return null;
      }
      
      // Calculate aggregated metrics
      let sumRatings = 0;
      const distribution: RatingDistribution = {
        5: 0, 4: 0, 3: 0, 2: 0, 1: 0
      };
      
      reviewsSnapshot.forEach(doc => {
        const review = doc.data() as Review;
        const rating = Math.round(review.rating);
        
        sumRatings += review.rating;
        
        // Count distribution
        if (rating >= 1 && rating <= 5) {
          distribution[rating as keyof RatingDistribution]++;
        }
      });
      
      const averageRating = sumRatings / totalReviews;
      
      // Update seller document with aggregated data
      await admin.firestore()
        .collection('sellers')
        .doc(sellerId)
        .set({
          averageRating: parseFloat(averageRating.toFixed(2)),
          totalReviews,
          ratingDistribution: distribution,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      
      logger.info(`Updated seller ${sellerId}: ${averageRating.toFixed(2)} avg (${totalReviews} reviews)`);
      
      // Also update user document for quick access
      await admin.firestore()
        .collection('users')
        .doc(sellerId)
        .update({
          'rating.average': parseFloat(averageRating.toFixed(2)),
          'rating.total': totalReviews
        });
      
      return {
        sellerId,
        averageRating,
        totalReviews
      };
      
    } catch (error) {
      logger.error(`Error aggregating ratings for seller ${sellerId}`, error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  });

/**
 * Validates review before creation
 * Prevents duplicate reviews and spam
 */
export const validateReview = functions.firestore
  .document('reviews/{reviewId}')
  .onCreate(async (snap, context) => {
    const reviewData = snap.data() as Review;
    const reviewId = context.params.reviewId;
    
    try {
      // 1. Check for duplicate reviews
      const existingReviewsSnapshot = await admin.firestore()
        .collection('reviews')
        .where('sellerId', '==', reviewData.sellerId)
        .where('reviewerId', '==', reviewData.reviewerId)
        .where('carId', '==', reviewData.carId)
        .get();
      
      // If more than one review found (including current), it's a duplicate
      if (existingReviewsSnapshot.size > 1) {
        logger.warn(`Duplicate review detected for seller ${reviewData.sellerId}`);
        
        // Delete the duplicate
        await snap.ref.delete();
        logger.info(`Deleted duplicate review ${reviewId}`);
        return null;
      }
      
      // 2. Validate rating range
      if (reviewData.rating < 1 || reviewData.rating > 5) {
        logger.warn(`Invalid rating ${reviewData.rating} in review ${reviewId}`);
        await snap.ref.delete();
        return null;
      }
      
      // 3. Check if reviewer actually interacted with this seller
      // Optional: Add logic to verify if reviewer contacted this seller
      
      logger.info(`Review ${reviewId} validated successfully`);
      return null;
      
    } catch (error) {
      logger.error(`Error validating review ${reviewId}`, error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  });

