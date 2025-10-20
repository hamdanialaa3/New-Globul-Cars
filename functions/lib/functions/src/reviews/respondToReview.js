"use strict";
// functions/src/reviews/respondToReview.ts
// Cloud Function: Business response to review
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
exports.deleteReviewResponse = exports.updateReviewResponse = exports.respondToReview = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const db = (0, firestore_1.getFirestore)();
/**
 * Respond to Review
 *
 * Allows business owners to respond to reviews
 * Only the target user or team members can respond
 *
 * @param reviewId - Review to respond to
 * @param responseText - Response text
 *
 * @returns Success status
 */
exports.respondToReview = (0, https_1.onCall)(async (request) => {
    var _a;
    const { reviewId, responseText } = request.data;
    // 1. Check authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = request.auth.uid;
    // 2. Validate inputs
    if (!reviewId || !responseText) {
        throw new https_1.HttpsError('invalid-argument', 'reviewId and responseText are required');
    }
    if (responseText.length < 10) {
        throw new https_1.HttpsError('invalid-argument', 'Response must be at least 10 characters long');
    }
    if (responseText.length > 1000) {
        throw new https_1.HttpsError('invalid-argument', 'Response cannot exceed 1000 characters');
    }
    logger.info('Responding to review', { reviewId, userId });
    try {
        // 3. Get review document
        const reviewRef = db.collection('reviews').doc(reviewId);
        const reviewDoc = await reviewRef.get();
        if (!reviewDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Review not found');
        }
        const reviewData = reviewDoc.data();
        // 4. Check if review is published
        if ((reviewData === null || reviewData === void 0 ? void 0 : reviewData.status) !== 'published') {
            throw new https_1.HttpsError('permission-denied', 'Can only respond to published reviews');
        }
        // 5. Check if user is authorized to respond
        const isTargetUser = (reviewData === null || reviewData === void 0 ? void 0 : reviewData.targetUserId) === userId;
        const isTeamMember = await checkTeamMembership(userId, reviewData === null || reviewData === void 0 ? void 0 : reviewData.targetUserId);
        if (!isTargetUser && !isTeamMember) {
            throw new https_1.HttpsError('permission-denied', 'Only the business owner or team members can respond to reviews');
        }
        // 6. Check if review already has a response
        if (reviewData === null || reviewData === void 0 ? void 0 : reviewData.response) {
            throw new https_1.HttpsError('already-exists', 'This review already has a response');
        }
        // 7. Get responder's name
        const userDoc = await db.collection('users').doc(userId).get();
        const userName = ((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.displayName) || 'Business Owner';
        // 8. Add response to review
        await reviewRef.update({
            response: {
                text: responseText,
                respondedBy: userId,
                respondedByName: userName,
                respondedAt: firestore_1.FieldValue.serverTimestamp(),
            },
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        logger.info('Response added to review', { reviewId, respondedBy: userId });
        // 9. Notify reviewer
        await db.collection('notifications').add({
            userId: reviewData === null || reviewData === void 0 ? void 0 : reviewData.reviewerId,
            type: 'review_response',
            title: 'Response to Your Review',
            message: `${reviewData === null || reviewData === void 0 ? void 0 : reviewData.targetUserName} responded to your review`,
            data: {
                reviewId,
                targetUserId: reviewData === null || reviewData === void 0 ? void 0 : reviewData.targetUserId,
                responseText: responseText.substring(0, 100),
            },
            read: false,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
        // 10. Log activity
        await db.collection('activityLog').add({
            type: 'review_response',
            userId,
            reviewId,
            targetUserId: reviewData === null || reviewData === void 0 ? void 0 : reviewData.targetUserId,
            reviewerId: reviewData === null || reviewData === void 0 ? void 0 : reviewData.reviewerId,
            timestamp: firestore_1.FieldValue.serverTimestamp(),
        });
        return {
            success: true,
            message: 'Response added successfully',
        };
    }
    catch (error) {
        logger.error('Failed to respond to review', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', `Failed to respond to review: ${error.message}`);
    }
});
/**
 * Update Review Response
 *
 * Allows editing existing response
 */
exports.updateReviewResponse = (0, https_1.onCall)(async (request) => {
    const { reviewId, responseText } = request.data;
    // 1. Check authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = request.auth.uid;
    // 2. Validate inputs
    if (!reviewId || !responseText) {
        throw new https_1.HttpsError('invalid-argument', 'reviewId and responseText are required');
    }
    if (responseText.length < 10 || responseText.length > 1000) {
        throw new https_1.HttpsError('invalid-argument', 'Response must be 10-1000 characters');
    }
    logger.info('Updating review response', { reviewId, userId });
    try {
        // 3. Get review document
        const reviewRef = db.collection('reviews').doc(reviewId);
        const reviewDoc = await reviewRef.get();
        if (!reviewDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Review not found');
        }
        const reviewData = reviewDoc.data();
        // 4. Check if review has a response
        if (!(reviewData === null || reviewData === void 0 ? void 0 : reviewData.response)) {
            throw new https_1.HttpsError('not-found', 'This review does not have a response yet');
        }
        // 5. Check if user is the original responder or business owner
        const isOriginalResponder = reviewData.response.respondedBy === userId;
        const isTargetUser = reviewData.targetUserId === userId;
        const isTeamMember = await checkTeamMembership(userId, reviewData.targetUserId);
        if (!isOriginalResponder && !isTargetUser && !isTeamMember) {
            throw new https_1.HttpsError('permission-denied', 'Not authorized to edit this response');
        }
        // 6. Update response
        await reviewRef.update({
            'response.text': responseText,
            'response.editedAt': firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        logger.info('Review response updated', { reviewId, userId });
        return {
            success: true,
            message: 'Response updated successfully',
        };
    }
    catch (error) {
        logger.error('Failed to update review response', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', `Failed to update response: ${error.message}`);
    }
});
/**
 * Delete Review Response
 *
 * Removes response from review
 */
exports.deleteReviewResponse = (0, https_1.onCall)(async (request) => {
    const { reviewId } = request.data;
    // 1. Check authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = request.auth.uid;
    // 2. Validate inputs
    if (!reviewId) {
        throw new https_1.HttpsError('invalid-argument', 'reviewId is required');
    }
    logger.info('Deleting review response', { reviewId, userId });
    try {
        // 3. Get review document
        const reviewRef = db.collection('reviews').doc(reviewId);
        const reviewDoc = await reviewRef.get();
        if (!reviewDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Review not found');
        }
        const reviewData = reviewDoc.data();
        // 4. Check if review has a response
        if (!(reviewData === null || reviewData === void 0 ? void 0 : reviewData.response)) {
            throw new https_1.HttpsError('not-found', 'This review does not have a response');
        }
        // 5. Check if user is authorized
        const isOriginalResponder = reviewData.response.respondedBy === userId;
        const isTargetUser = reviewData.targetUserId === userId;
        const isTeamMember = await checkTeamMembership(userId, reviewData.targetUserId);
        if (!isOriginalResponder && !isTargetUser && !isTeamMember) {
            throw new https_1.HttpsError('permission-denied', 'Not authorized to delete this response');
        }
        // 6. Delete response
        await reviewRef.update({
            response: firestore_1.FieldValue.delete(),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        logger.info('Review response deleted', { reviewId, userId });
        return {
            success: true,
            message: 'Response deleted successfully',
        };
    }
    catch (error) {
        logger.error('Failed to delete review response', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', `Failed to delete response: ${error.message}`);
    }
});
/**
 * Check if user is a team member of the business
 */
async function checkTeamMembership(userId, businessUserId) {
    var _a;
    try {
        const teamMemberDoc = await db
            .collection('users')
            .doc(businessUserId)
            .collection('team')
            .doc(userId)
            .get();
        if (!teamMemberDoc.exists) {
            return false;
        }
        const memberData = teamMemberDoc.data();
        // Check if member has permission to respond to reviews
        return ((_a = memberData === null || memberData === void 0 ? void 0 : memberData.permissions) === null || _a === void 0 ? void 0 : _a.canRespondToReviews) === true ||
            (memberData === null || memberData === void 0 ? void 0 : memberData.role) === 'admin' ||
            (memberData === null || memberData === void 0 ? void 0 : memberData.role) === 'manager';
    }
    catch (error) {
        logger.error('Failed to check team membership', error);
        return false;
    }
}
//# sourceMappingURL=respondToReview.js.map