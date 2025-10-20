"use strict";
// functions/src/reviews/reportReview.ts
// Cloud Function: Report inappropriate review
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
exports.reportReview = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const db = (0, firestore_1.getFirestore)();
// Report threshold before auto-flagging
const AUTO_FLAG_THRESHOLD = 3;
/**
 * Report Review
 *
 * Allows users to report inappropriate reviews
 * Auto-flags review if report threshold exceeded
 *
 * @param reviewId - Review to report
 * @param reason - Reason for reporting
 *
 * @returns Success status
 */
exports.reportReview = (0, https_1.onCall)(async (request) => {
    var _a;
    const { reviewId, reason } = request.data;
    // 1. Check authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = request.auth.uid;
    // 2. Validate inputs
    if (!reviewId || !reason) {
        throw new https_1.HttpsError('invalid-argument', 'reviewId and reason are required');
    }
    if (reason.length < 10) {
        throw new https_1.HttpsError('invalid-argument', 'Report reason must be at least 10 characters');
    }
    logger.info('Reporting review', { reviewId, userId, reason });
    try {
        // 3. Get review document
        const reviewRef = db.collection('reviews').doc(reviewId);
        const reviewDoc = await reviewRef.get();
        if (!reviewDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Review not found');
        }
        const reviewData = reviewDoc.data();
        // 4. Check if user already reported this review
        const reportsSnapshot = await db
            .collection('reviews')
            .doc(reviewId)
            .collection('reports')
            .doc(userId)
            .get();
        if (reportsSnapshot.exists) {
            throw new https_1.HttpsError('already-exists', 'You have already reported this review');
        }
        // 5. Add report
        await db
            .collection('reviews')
            .doc(reviewId)
            .collection('reports')
            .doc(userId)
            .set({
            userId,
            reason,
            reportedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        // 6. Increment report count
        await reviewRef.update({
            reportCount: firestore_1.FieldValue.increment(1),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        const updatedDoc = await reviewRef.get();
        const newReportCount = ((_a = updatedDoc.data()) === null || _a === void 0 ? void 0 : _a.reportCount) || 0;
        logger.info('Review reported', { reviewId, newReportCount });
        // 7. Auto-flag if threshold exceeded
        if (newReportCount >= AUTO_FLAG_THRESHOLD) {
            await reviewRef.update({
                status: 'flagged',
                flaggedAt: firestore_1.FieldValue.serverTimestamp(),
                flaggedReason: 'Exceeded report threshold',
            });
            logger.warn('Review auto-flagged', { reviewId, reportCount: newReportCount });
            // 8. Notify admins
            await notifyAdminsReviewFlagged(reviewId, reviewData, newReportCount);
        }
        return {
            success: true,
            message: 'Review reported successfully',
        };
    }
    catch (error) {
        logger.error('Failed to report review', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', `Failed to report review: ${error.message}`);
    }
});
/**
 * Notify admins that a review has been auto-flagged
 */
async function notifyAdminsReviewFlagged(reviewId, reviewData, reportCount) {
    try {
        // Get all admin users
        const adminsSnapshot = await db.collection('admins').get();
        if (adminsSnapshot.empty) {
            logger.warn('No admins found to notify');
            return;
        }
        // Create notifications for all admins
        const notificationPromises = adminsSnapshot.docs.map((adminDoc) => {
            return db.collection('notifications').add({
                userId: adminDoc.id,
                type: 'review_flagged',
                title: '⚠️ Review Auto-Flagged',
                message: `A review by ${reviewData === null || reviewData === void 0 ? void 0 : reviewData.reviewerName} has been flagged after ${reportCount} reports`,
                data: {
                    reviewId,
                    reviewerId: reviewData === null || reviewData === void 0 ? void 0 : reviewData.reviewerId,
                    targetUserId: reviewData === null || reviewData === void 0 ? void 0 : reviewData.targetUserId,
                    reportCount,
                },
                read: false,
                createdAt: firestore_1.FieldValue.serverTimestamp(),
            });
        });
        await Promise.all(notificationPromises);
        // Send email to admins (optional)
        await sendAdminFlagEmail(reviewId, reviewData, reportCount);
        logger.info('Admins notified of flagged review', { reviewId, adminCount: adminsSnapshot.size });
    }
    catch (error) {
        logger.error('Failed to notify admins', error);
    }
}
/**
 * Send email to admins about flagged review
 */
async function sendAdminFlagEmail(reviewId, reviewData, reportCount) {
    try {
        await db.collection('mail').add({
            to: ['admin@globul.net'], // Replace with actual admin email
            template: {
                name: 'review-flagged',
                data: {
                    reviewId,
                    reviewerName: reviewData === null || reviewData === void 0 ? void 0 : reviewData.reviewerName,
                    targetUserName: reviewData === null || reviewData === void 0 ? void 0 : reviewData.targetUserName,
                    rating: reviewData === null || reviewData === void 0 ? void 0 : reviewData.overallRating,
                    comment: reviewData === null || reviewData === void 0 ? void 0 : reviewData.comment,
                    reportCount,
                    adminUrl: `https://globul.net/admin/reviews/${reviewId}`,
                },
            },
        });
        logger.info('Admin flag email queued', { reviewId });
    }
    catch (error) {
        logger.error('Failed to send admin email', error);
    }
}
//# sourceMappingURL=reportReview.js.map