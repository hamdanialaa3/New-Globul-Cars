"use strict";
// functions/src/reviews/submitReview.ts
// Cloud Function: Submit a review
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
exports.submitReview = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const db = (0, firestore_1.getFirestore)();
/**
 * Submit Review
 *
 * Allows users to leave reviews for dealers/companies
 *
 * @param targetUserId - User being reviewed (dealer/company)
 * @param ratings - Overall and category ratings
 * @param title - Review title
 * @param comment - Review text
 *
 * @returns Success status and review ID
 */
exports.submitReview = (0, https_1.onCall)(async (request) => {
    const { targetUserId, listingId, overallRating, categoryRatings, title, comment, pros = [], cons = [], transactionType, transactionDate, } = request.data;
    // 1. Check authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const reviewerId = request.auth.uid;
    // 2. Validate inputs
    if (!targetUserId || !overallRating || !title || !comment) {
        throw new https_1.HttpsError('invalid-argument', 'targetUserId, overallRating, title, and comment are required');
    }
    // Validate rating range
    if (overallRating < 1 || overallRating > 5) {
        throw new https_1.HttpsError('invalid-argument', 'Rating must be between 1 and 5');
    }
    // Validate category ratings
    const categories = ['communication', 'accuracy', 'professionalism', 'valueForMoney'];
    for (const category of categories) {
        const rating = categoryRatings[category];
        if (!rating || rating < 1 || rating > 5) {
            throw new https_1.HttpsError('invalid-argument', `Invalid ${category} rating. Must be between 1 and 5`);
        }
    }
    // 3. Prevent self-reviews
    if (reviewerId === targetUserId) {
        throw new https_1.HttpsError('permission-denied', 'Cannot review yourself');
    }
    // 4. Check if user already reviewed this target
    const existingReviewsSnapshot = await db
        .collection('reviews')
        .where('reviewerId', '==', reviewerId)
        .where('targetUserId', '==', targetUserId)
        .where('listingId', '==', listingId || null)
        .get();
    if (!existingReviewsSnapshot.empty) {
        throw new https_1.HttpsError('already-exists', 'You have already reviewed this user/listing');
    }
    logger.info('Submitting review', { reviewerId, targetUserId, rating: overallRating });
    try {
        // 5. Get reviewer and target user data
        const [reviewerDoc, targetUserDoc] = await Promise.all([
            db.collection('users').doc(reviewerId).get(),
            db.collection('users').doc(targetUserId).get(),
        ]);
        if (!reviewerDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Reviewer not found');
        }
        if (!targetUserDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Target user not found');
        }
        const reviewerData = reviewerDoc.data();
        const targetUserData = targetUserDoc.data();
        // Only dealers and companies can be reviewed
        if (!['dealer', 'company'].includes(targetUserData === null || targetUserData === void 0 ? void 0 : targetUserData.profileType)) {
            throw new https_1.HttpsError('permission-denied', 'Only dealers and companies can be reviewed');
        }
        // 6. Check if transaction is verified (optional but increases trust)
        const verified = await verifyTransaction(reviewerId, targetUserId, listingId);
        // 7. Create review document
        const reviewData = {
            reviewerId,
            reviewerName: (reviewerData === null || reviewerData === void 0 ? void 0 : reviewerData.displayName) || 'Anonymous',
            reviewerProfileType: (reviewerData === null || reviewerData === void 0 ? void 0 : reviewerData.profileType) || 'private',
            targetUserId,
            targetUserName: (targetUserData === null || targetUserData === void 0 ? void 0 : targetUserData.displayName) || 'User',
            targetUserType: targetUserData === null || targetUserData === void 0 ? void 0 : targetUserData.profileType,
            listingId: listingId || null,
            overallRating,
            categoryRatings,
            title,
            comment,
            pros,
            cons,
            transactionType,
            transactionDate: transactionDate ? new Date(transactionDate) : null,
            status: 'pending', // Admin moderation
            verified,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
            helpfulCount: 0,
            reportCount: 0,
        };
        const reviewRef = await db.collection('reviews').add(reviewData);
        logger.info('Review created', { reviewId: reviewRef.id });
        // 8. Update review statistics
        await updateReviewStats(targetUserId);
        // 9. Notify target user
        await db.collection('notifications').add({
            userId: targetUserId,
            type: 'new_review',
            title: 'New Review Received',
            message: `${reviewerData === null || reviewerData === void 0 ? void 0 : reviewerData.displayName} left you a ${overallRating}-star review`,
            data: {
                reviewId: reviewRef.id,
                reviewerId,
                rating: overallRating,
            },
            read: false,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
        // 10. Log review activity
        await db.collection('activityLog').add({
            type: 'review_submitted',
            reviewerId,
            targetUserId,
            reviewId: reviewRef.id,
            rating: overallRating,
            timestamp: firestore_1.FieldValue.serverTimestamp(),
        });
        return {
            success: true,
            reviewId: reviewRef.id,
            message: 'Review submitted successfully. It will be published after moderation.',
        };
    }
    catch (error) {
        logger.error('Review submission failed', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', `Failed to submit review: ${error.message}`);
    }
});
/**
 * Verify if transaction occurred between reviewer and target
 * Checks messages, inquiries, or purchase history
 */
async function verifyTransaction(reviewerId, targetUserId, listingId) {
    try {
        // Check for conversations between users
        const conversationsSnapshot = await db
            .collection('conversations')
            .where('participants', 'array-contains', reviewerId)
            .get();
        const hasConversation = conversationsSnapshot.docs.some((doc) => {
            const participants = doc.data().participants || [];
            return participants.includes(targetUserId);
        });
        if (hasConversation) {
            return true;
        }
        // Check for inquiries
        if (listingId) {
            const inquiriesSnapshot = await db
                .collection('inquiries')
                .where('listingId', '==', listingId)
                .where('senderId', '==', reviewerId)
                .where('sellerId', '==', targetUserId)
                .get();
            if (!inquiriesSnapshot.empty) {
                return true;
            }
        }
        // If no interaction found, mark as unverified
        return false;
    }
    catch (error) {
        logger.error('Transaction verification failed', error);
        return false;
    }
}
/**
 * Update review statistics for user
 */
async function updateReviewStats(userId) {
    try {
        // Get all published reviews for this user
        const reviewsSnapshot = await db
            .collection('reviews')
            .where('targetUserId', '==', userId)
            .where('status', '==', 'published')
            .get();
        if (reviewsSnapshot.empty) {
            return;
        }
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
        reviewsSnapshot.forEach((doc) => {
            const review = doc.data();
            const rating = review.overallRating;
            totalRating += rating;
            if (rating === 5)
                fiveStars++;
            else if (rating === 4)
                fourStars++;
            else if (rating === 3)
                threeStars++;
            else if (rating === 2)
                twoStars++;
            else if (rating === 1)
                oneStar++;
            totalCommunication += review.categoryRatings.communication || 0;
            totalAccuracy += review.categoryRatings.accuracy || 0;
            totalProfessionalism += review.categoryRatings.professionalism || 0;
            totalValueForMoney += review.categoryRatings.valueForMoney || 0;
            if (review.categoryRatings.responseTime) {
                totalResponseTime += review.categoryRatings.responseTime;
                responseTimeCount++;
            }
        });
        const totalReviews = reviewsSnapshot.size;
        const averageRating = totalRating / totalReviews;
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
            avgCommunication: Math.round((totalCommunication / totalReviews) * 10) / 10,
            avgAccuracy: Math.round((totalAccuracy / totalReviews) * 10) / 10,
            avgProfessionalism: Math.round((totalProfessionalism / totalReviews) * 10) / 10,
            avgValueForMoney: Math.round((totalValueForMoney / totalReviews) * 10) / 10,
            avgResponseTime: responseTimeCount > 0
                ? Math.round((totalResponseTime / responseTimeCount) * 10) / 10
                : 0,
            publishedReviews: totalReviews,
            lastUpdated: firestore_1.FieldValue.serverTimestamp(),
        });
        logger.info('Review stats updated', { userId, totalReviews, averageRating });
    }
    catch (error) {
        logger.error('Failed to update review stats', error);
    }
}
//# sourceMappingURL=submitReview.js.map