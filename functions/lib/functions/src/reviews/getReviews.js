"use strict";
// functions/src/reviews/getReviews.ts
// Cloud Function: Get reviews for a user or listing
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
exports.getMyReviews = exports.getReviews = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const db = (0, firestore_1.getFirestore)();
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
exports.getReviews = (0, https_1.onCall)(async (request) => {
    const { targetUserId, listingId, sortBy = 'recent', page = 1, limit = 10, } = request.data;
    // 1. Validate inputs
    if (!targetUserId) {
        throw new https_1.HttpsError('invalid-argument', 'targetUserId is required');
    }
    if (page < 1 || limit < 1 || limit > 50) {
        throw new https_1.HttpsError('invalid-argument', 'Invalid pagination parameters');
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
        const reviews = snapshot.docs.map((doc) => {
            var _a, _b, _c, _d;
            const data = doc.data();
            return Object.assign(Object.assign({ id: doc.id }, data), { createdAt: (_a = data.createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = data.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate(), transactionDate: (_c = data.transactionDate) === null || _c === void 0 ? void 0 : _c.toDate(), response: data.response
                    ? Object.assign(Object.assign({}, data.response), { respondedAt: (_d = data.response.respondedAt) === null || _d === void 0 ? void 0 : _d.toDate() }) : undefined });
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
    }
    catch (error) {
        logger.error('Failed to fetch reviews', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', `Failed to fetch reviews: ${error.message}`);
    }
});
/**
 * Get My Reviews
 *
 * Retrieves reviews written by the authenticated user
 */
exports.getMyReviews = (0, https_1.onCall)(async (request) => {
    // 1. Check authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
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
            var _a, _b, _c;
            const data = doc.data();
            return Object.assign(Object.assign({ id: doc.id }, data), { createdAt: (_a = data.createdAt) === null || _a === void 0 ? void 0 : _a.toDate(), updatedAt: (_b = data.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate(), transactionDate: (_c = data.transactionDate) === null || _c === void 0 ? void 0 : _c.toDate() });
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
    }
    catch (error) {
        logger.error('Failed to fetch user reviews', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', `Failed to fetch reviews: ${error.message}`);
    }
});
//# sourceMappingURL=getReviews.js.map