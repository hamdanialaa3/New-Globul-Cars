"use strict";
/**
 * Firebase Cloud Functions - Reviews Aggregation
 * Calculates and updates seller ratings automatically
 * Location: Bulgaria | Languages: BG, EN | Currency: EUR
 */
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
exports.validateReview = exports.aggregateSellerRating = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
/**
 * Triggers when a review is created or updated
 * Recalculates seller's average rating and updates seller document
 */
exports.aggregateSellerRating = functions.firestore
    .document('reviews/{reviewId}')
    .onWrite(async (change, context) => {
    const reviewId = context.params.reviewId;
    // Get seller ID from the review
    const reviewData = change.after.exists
        ? change.after.data()
        : change.before.data();
    if (!reviewData || !reviewData.sellerId) {
        console.log('No seller ID found in review');
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
            console.log(`Reset ratings for seller ${sellerId} (no reviews)`);
            return null;
        }
        // Calculate aggregated metrics
        let sumRatings = 0;
        const distribution = {
            5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        };
        reviewsSnapshot.forEach(doc => {
            const review = doc.data();
            const rating = Math.round(review.rating);
            sumRatings += review.rating;
            // Count distribution
            if (rating >= 1 && rating <= 5) {
                distribution[rating]++;
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
        console.log(`Updated seller ${sellerId}: ${averageRating.toFixed(2)} avg (${totalReviews} reviews)`);
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
    }
    catch (error) {
        console.error(`Error aggregating ratings for seller ${sellerId}:`, error);
        return null;
    }
});
/**
 * Validates review before creation
 * Prevents duplicate reviews and spam
 */
exports.validateReview = functions.firestore
    .document('reviews/{reviewId}')
    .onCreate(async (snap, context) => {
    const reviewData = snap.data();
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
            console.warn(`Duplicate review detected for seller ${reviewData.sellerId}`);
            // Delete the duplicate
            await snap.ref.delete();
            console.log(`Deleted duplicate review ${reviewId}`);
            return null;
        }
        // 2. Validate rating range
        if (reviewData.rating < 1 || reviewData.rating > 5) {
            console.warn(`Invalid rating ${reviewData.rating} in review ${reviewId}`);
            await snap.ref.delete();
            return null;
        }
        // 3. Check if reviewer actually interacted with this seller
        // Optional: Add logic to verify if reviewer contacted this seller
        console.log(`Review ${reviewId} validated successfully`);
        return null;
    }
    catch (error) {
        console.error(`Error validating review ${reviewId}:`, error);
        return null;
    }
});
//# sourceMappingURL=aggregate-seller-ratings.js.map