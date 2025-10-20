"use strict";
// functions/src/reviews/updateReviewStats.ts
// Firestore Trigger: Update review statistics when review status changes
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
exports.updateReviewStatsOnWrite = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const firestore_2 = require("firebase-admin/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const db = (0, firestore_2.getFirestore)();
/**
 * Update Review Stats Trigger
 *
 * Automatically recalculates review statistics when:
 * - New review is created
 * - Review status changes (pending → published)
 * - Review is updated (rating changed)
 * - Review is deleted/removed
 *
 * Updates the reviewStats/{userId} document
 */
exports.updateReviewStatsOnWrite = (0, firestore_1.onDocumentWritten)('reviews/{reviewId}', async (event) => {
    var _a, _b, _c, _d;
    const beforeData = (_b = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before) === null || _b === void 0 ? void 0 : _b.data();
    const afterData = (_d = (_c = event.data) === null || _c === void 0 ? void 0 : _c.after) === null || _d === void 0 ? void 0 : _d.data();
    // If document was deleted
    if (!afterData) {
        if (beforeData === null || beforeData === void 0 ? void 0 : beforeData.targetUserId) {
            logger.info('Review deleted, updating stats', {
                targetUserId: beforeData.targetUserId
            });
            await recalculateStats(beforeData.targetUserId);
        }
        return;
    }
    const targetUserId = afterData.targetUserId;
    if (!targetUserId) {
        logger.warn('Review missing targetUserId', { reviewId: event.params.reviewId });
        return;
    }
    // Check if status changed to/from published
    const beforeStatus = beforeData === null || beforeData === void 0 ? void 0 : beforeData.status;
    const afterStatus = afterData.status;
    const statusChanged = beforeStatus !== afterStatus;
    const isNowPublished = afterStatus === 'published';
    const wasPublished = beforeStatus === 'published';
    // Check if rating changed
    const ratingChanged = (beforeData === null || beforeData === void 0 ? void 0 : beforeData.overallRating) !== afterData.overallRating;
    // Recalculate if:
    // 1. Status changed to or from published
    // 2. Rating changed on a published review
    if ((statusChanged && (isNowPublished || wasPublished)) ||
        (ratingChanged && isNowPublished)) {
        logger.info('Review updated, recalculating stats', {
            targetUserId,
            statusChanged,
            ratingChanged
        });
        await recalculateStats(targetUserId);
    }
});
/**
 * Recalculate Review Statistics
 *
 * Aggregates all published reviews for a user
 * Updates reviewStats document with current data
 */
async function recalculateStats(userId) {
    try {
        // Get all published reviews for this user
        const reviewsSnapshot = await db
            .collection('reviews')
            .where('targetUserId', '==', userId)
            .where('status', '==', 'published')
            .get();
        if (reviewsSnapshot.empty) {
            // No published reviews - set stats to zero
            await db.collection('reviewStats').doc(userId).set({
                userId,
                totalReviews: 0,
                averageRating: 0,
                fiveStars: 0,
                fourStars: 0,
                threeStars: 0,
                twoStars: 0,
                oneStar: 0,
                avgCommunication: 0,
                avgAccuracy: 0,
                avgProfessionalism: 0,
                avgValueForMoney: 0,
                avgResponseTime: 0,
                publishedReviews: 0,
                lastUpdated: firestore_2.FieldValue.serverTimestamp(),
            });
            logger.info('No published reviews, stats reset to zero', { userId });
            return;
        }
        // Initialize counters
        let totalRating = 0;
        let fiveStars = 0;
        let fourStars = 0;
        let threeStars = 0;
        let twoStars = 0;
        let oneStar = 0;
        let totalCommunication = 0;
        let totalAccuracy = 0;
        let totalProfessionalism = 0;
        let totalValueForMoney = 0;
        let totalResponseTime = 0;
        let responseTimeCount = 0;
        // Aggregate all reviews
        reviewsSnapshot.forEach((doc) => {
            const review = doc.data();
            const rating = review.overallRating || 0;
            totalRating += rating;
            // Count star distribution
            if (rating === 5)
                fiveStars++;
            else if (rating >= 4)
                fourStars++;
            else if (rating >= 3)
                threeStars++;
            else if (rating >= 2)
                twoStars++;
            else if (rating >= 1)
                oneStar++;
            // Sum category ratings
            const categoryRatings = review.categoryRatings || {};
            totalCommunication += categoryRatings.communication || 0;
            totalAccuracy += categoryRatings.accuracy || 0;
            totalProfessionalism += categoryRatings.professionalism || 0;
            totalValueForMoney += categoryRatings.valueForMoney || 0;
            if (categoryRatings.responseTime) {
                totalResponseTime += categoryRatings.responseTime;
                responseTimeCount++;
            }
        });
        const totalReviews = reviewsSnapshot.size;
        const averageRating = totalRating / totalReviews;
        // Calculate category averages
        const avgCommunication = totalCommunication / totalReviews;
        const avgAccuracy = totalAccuracy / totalReviews;
        const avgProfessionalism = totalProfessionalism / totalReviews;
        const avgValueForMoney = totalValueForMoney / totalReviews;
        const avgResponseTime = responseTimeCount > 0
            ? totalResponseTime / responseTimeCount
            : 0;
        // Update stats document
        await db.collection('reviewStats').doc(userId).set({
            userId,
            totalReviews,
            averageRating: Math.round(averageRating * 10) / 10,
            fiveStars,
            fourStars,
            threeStars,
            twoStars,
            oneStar,
            avgCommunication: Math.round(avgCommunication * 10) / 10,
            avgAccuracy: Math.round(avgAccuracy * 10) / 10,
            avgProfessionalism: Math.round(avgProfessionalism * 10) / 10,
            avgValueForMoney: Math.round(avgValueForMoney * 10) / 10,
            avgResponseTime: Math.round(avgResponseTime * 10) / 10,
            publishedReviews: totalReviews,
            lastUpdated: firestore_2.FieldValue.serverTimestamp(),
        });
        // Update user document with average rating (for quick access)
        await db.collection('users').doc(userId).update({
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews,
            updatedAt: firestore_2.FieldValue.serverTimestamp(),
        });
        logger.info('Review stats recalculated', {
            userId,
            totalReviews,
            averageRating: Math.round(averageRating * 10) / 10
        });
    }
    catch (error) {
        logger.error('Failed to recalculate review stats', { userId, error });
        throw error;
    }
}
/**
 * Calculate Star Distribution Percentage
 *
 * Helper function to calculate percentage distribution
 */
function calculateStarDistribution(fiveStars, fourStars, threeStars, twoStars, oneStar) {
    const total = fiveStars + fourStars + threeStars + twoStars + oneStar;
    if (total === 0) {
        return {
            fiveStar: 0,
            fourStar: 0,
            threeStar: 0,
            twoStar: 0,
            oneStar: 0,
        };
    }
    return {
        fiveStar: Math.round((fiveStars / total) * 100),
        fourStar: Math.round((fourStars / total) * 100),
        threeStar: Math.round((threeStars / total) * 100),
        twoStar: Math.round((twoStars / total) * 100),
        oneStar: Math.round((oneStar / total) * 100),
    };
}
//# sourceMappingURL=updateReviewStats.js.map