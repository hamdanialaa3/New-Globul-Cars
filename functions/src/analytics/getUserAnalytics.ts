// functions/src/analytics/getUserAnalytics.ts
// Cloud Function: Get user analytics data

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { GetAnalyticsRequest, GetAnalyticsResponse, UserAnalytics } from './types';

const db = getFirestore();

/**
 * Get User Analytics
 * 
 * Retrieves analytics data for a user
 * 
 * @param userId - User ID to get analytics for
 * @param period - Time period filter (today, week, month, all)
 * 
 * @returns UserAnalytics object
 */
export const getUserAnalytics = onCall<GetAnalyticsRequest>(async (request) => {
  const { userId, period = 'all' } = request.data;

  // 1. Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  // 2. Verify user is requesting their own analytics (or is admin)
  if (request.auth.uid !== userId) {
    // Check if user is admin
    const adminDoc = await db.collection('admins').doc(request.auth.uid).get();
    if (!adminDoc.exists) {
      logger.warn('Non-admin attempted to access other user analytics', {
        requesterId: request.auth.uid,
        targetUserId: userId,
      });
      throw new HttpsError(
        'permission-denied',
        'Cannot access analytics for another user'
      );
    }
  }

  logger.info('Getting user analytics', { userId, period });

  try {
    // 3. Get analytics document
    const analyticsDoc = await db.collection('userAnalytics').doc(userId).get();

    if (!analyticsDoc.exists) {
      // Return empty analytics
      const emptyAnalytics: UserAnalytics = {
        userId,
        profileType: 'private',
        profileViews: 0,
        profileViewsToday: 0,
        profileViewsThisWeek: 0,
        profileViewsThisMonth: 0,
        totalListings: 0,
        activeListings: 0,
        listingViews: 0,
        listingViewsToday: 0,
        listingViewsThisWeek: 0,
        listingViewsThisMonth: 0,
        inquiries: 0,
        inquiriesToday: 0,
        inquiriesThisWeek: 0,
        inquiriesThisMonth: 0,
        favorites: 0,
        favoritesToday: 0,
        favoritesThisWeek: 0,
        favoritesThisMonth: 0,
        avgResponseTime: 0,
        responseRate: 0,
        conversionRate: 0,
        leads: 0,
        lastUpdated: null as any,
      };

      const response: GetAnalyticsResponse = {
        success: true,
        analytics: emptyAnalytics,
      };

      return response;
    }

    const analytics = analyticsDoc.data() as UserAnalytics;

    // 4. Filter by period if needed
    let filteredAnalytics = { ...analytics };

    switch (period) {
      case 'today':
        filteredAnalytics = {
          ...analytics,
          profileViews: analytics.profileViewsToday || 0,
          listingViews: analytics.listingViewsToday || 0,
          inquiries: analytics.inquiriesToday || 0,
          favorites: analytics.favoritesToday || 0,
        };
        break;

      case 'week':
        filteredAnalytics = {
          ...analytics,
          profileViews: analytics.profileViewsThisWeek || 0,
          listingViews: analytics.listingViewsThisWeek || 0,
          inquiries: analytics.inquiriesThisWeek || 0,
          favorites: analytics.favoritesThisWeek || 0,
        };
        break;

      case 'month':
        filteredAnalytics = {
          ...analytics,
          profileViews: analytics.profileViewsThisMonth || 0,
          listingViews: analytics.listingViewsThisMonth || 0,
          inquiries: analytics.inquiriesThisMonth || 0,
          favorites: analytics.favoritesThisMonth || 0,
        };
        break;

      case 'all':
      default:
        // Return full analytics
        break;
    }

    logger.info('Analytics retrieved successfully', { userId, period });

    const response: GetAnalyticsResponse = {
      success: true,
      analytics: filteredAnalytics,
    };

    return response;

  } catch (error: any) {
    logger.error('Failed to get user analytics', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError(
      'internal',
      `Failed to get analytics: ${error.message}`
    );
  }
});
