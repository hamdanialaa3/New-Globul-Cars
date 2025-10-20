"use strict";
// functions/src/analytics/getUserAnalytics.ts
// Cloud Function: Get user analytics data
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAnalytics = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const db = (0, firestore_1.getFirestore)();
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
exports.getUserAnalytics = (0, https_1.onCall)(async (request) => {
    const { userId, period = 'all' } = request.data;
    // 1. Check authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
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
            throw new https_1.HttpsError('permission-denied', 'Cannot access analytics for another user');
        }
    }
    logger.info('Getting user analytics', { userId, period });
    try {
        // 3. Get analytics document
        const analyticsDoc = await db.collection('userAnalytics').doc(userId).get();
        if (!analyticsDoc.exists) {
            // Return empty analytics
            const emptyAnalytics = {
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
                lastUpdated: null,
            };
            const response = {
                success: true,
                analytics: emptyAnalytics,
            };
            return response;
        }
        const analytics = analyticsDoc.data();
        // 4. Filter by period if needed
        let filteredAnalytics = Object.assign({}, analytics);
        switch (period) {
            case 'today':
                filteredAnalytics = Object.assign(Object.assign({}, analytics), { profileViews: analytics.profileViewsToday || 0, listingViews: analytics.listingViewsToday || 0, inquiries: analytics.inquiriesToday || 0, favorites: analytics.favoritesToday || 0 });
                break;
            case 'week':
                filteredAnalytics = Object.assign(Object.assign({}, analytics), { profileViews: analytics.profileViewsThisWeek || 0, listingViews: analytics.listingViewsThisWeek || 0, inquiries: analytics.inquiriesThisWeek || 0, favorites: analytics.favoritesThisWeek || 0 });
                break;
            case 'month':
                filteredAnalytics = Object.assign(Object.assign({}, analytics), { profileViews: analytics.profileViewsThisMonth || 0, listingViews: analytics.listingViewsThisMonth || 0, inquiries: analytics.inquiriesThisMonth || 0, favorites: analytics.favoritesThisMonth || 0 });
                break;
            case 'all':
            default:
                // Return full analytics
                break;
        }
        logger.info('Analytics retrieved successfully', { userId, period });
        const response = {
            success: true,
            analytics: filteredAnalytics,
        };
        return response;
    }
    catch (error) {
        logger.error('Failed to get user analytics', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', `Failed to get analytics: ${error.message}`);
    }
});
//# sourceMappingURL=getUserAnalytics.js.map