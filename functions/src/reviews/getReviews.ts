// functions/src/reviews/getReviews.ts
// Cloud Function: Get reviews for a user or listing

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { GetReviewsRequest, Review } from './types';

const db = getFirestore();

/**
 * Get Reviews
 * 
 * Retrieves reviews for a specific user or listing
 * 
 * @param targetUserId - User whose reviews to retrieve
 * @param listingId - Optional listing filter
 * @param sortBy - Sort order (recent, rating, helpful)
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * 
 * @returns Array of reviews with pagination info
 */
export const getReviews = onCall<GetReviewsRequest>(async (request) => {
  const {
    targetUserId,
    listingId,
    sortBy = 'recent',
    page = 1,
    limit = 10,
  } = request.data;

  // 1. Validate inputs
  if (!targetUserId) {
    throw new HttpsError('invalid-argument', 'targetUserId is required');
  }

  if (page < 1 || limit < 1 || limit > 50) {
    throw new HttpsError('invalid-argument', 'Invalid pagination parameters');
  }

  logger.info('Fetching reviews', { targetUserId, listingId, sortBy, page, limit });

  try {
    // 2. Build query
    let query = db
      .collection('reviews')
      .where('targetUserId', '==', targetUserId)
      .where('status', '==', 'published'); // Only show published reviews

    // Filter by listing if provided
    if (listingId) {
      query = query.where('listingId', '==', listingId);
    }

    // 3. Apply sorting
    switch (sortBy) {
      case 'recent':
        query = query.orderBy('createdAt', 'desc');
        break;
      case 'rating':
        query = query.orderBy('overallRating', 'desc');
        break;
      case 'helpful':
        query = query.orderBy('helpfulCount', 'desc');
        break;
      default:
        query = query.orderBy('createdAt', 'desc');
    }

    // 4. Get total count (for pagination)
    const countSnapshot = await query.count().get();
    const totalReviews = countSnapshot.data().count;
    const totalPages = Math.ceil(totalReviews / limit);

    // 5. Apply pagination
    const offset = (page - 1) * limit;
    query = query.offset(offset).limit(limit);

    // 6. Execute query
    const snapshot = await query.get();

    // 7. Format reviews
    const reviews: Review[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        transactionDate: data.transactionDate?.toDate(),
        response: data.response
          ? {
              ...data.response,
              respondedAt: data.response.respondedAt?.toDate(),
            }
          : undefined,
      } as Review;
    });

    // 8. Get review stats
    const statsDoc = await db.collection('reviewStats').doc(targetUserId).get();
    const stats = statsDoc.exists ? statsDoc.data() : null;

    logger.info('Reviews fetched', { 
      count: reviews.length, 
      totalReviews, 
      page, 
      totalPages 
    });

    return {
      success: true,
      reviews,
      pagination: {
        currentPage: page,
        totalPages,
        totalReviews,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      stats: stats
        ? {
            totalReviews: stats.totalReviews || 0,
            averageRating: stats.averageRating || 0,
            fiveStars: stats.fiveStars || 0,
            fourStars: stats.fourStars || 0,
            threeStars: stats.threeStars || 0,
            twoStars: stats.twoStars || 0,
            oneStar: stats.oneStar || 0,
            avgCommunication: stats.avgCommunication || 0,
            avgAccuracy: stats.avgAccuracy || 0,
            avgProfessionalism: stats.avgProfessionalism || 0,
            avgValueForMoney: stats.avgValueForMoney || 0,
            avgResponseTime: stats.avgResponseTime || 0,
            publishedReviews: stats.publishedReviews || 0,
          }
        : null,
    };

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to fetch reviews', { error: err.message });

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', `Failed to fetch reviews: ${err.message}`);
  }
});

/**
 * Get My Reviews
 * 
 * Retrieves reviews written by the authenticated user
 */
export const getMyReviews = onCall(async (request) => {
  // 1. Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = request.auth.uid;
  const { page = 1, limit = 10 } = request.data;

  logger.info('Fetching user reviews', { userId, page, limit });

  try {
    // 2. Build query
    let query = db
      .collection('reviews')
      .where('reviewerId', '==', userId)
      .orderBy('createdAt', 'desc');

    // 3. Get total count
    const countSnapshot = await query.count().get();
    const totalReviews = countSnapshot.data().count;
    const totalPages = Math.ceil(totalReviews / limit);

    // 4. Apply pagination
    const offset = (page - 1) * limit;
    query = query.offset(offset).limit(limit);

    // 5. Execute query
    const snapshot = await query.get();

    // 6. Format reviews
    const reviews = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        transactionDate: data.transactionDate?.toDate(),
      };
    });

    logger.info('User reviews fetched', { count: reviews.length, totalReviews });

    return {
      success: true,
      reviews,
      pagination: {
        currentPage: page,
        totalPages,
        totalReviews,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to fetch user reviews', { error: err.message });

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', `Failed to fetch reviews: ${err.message}`);
  }
});
