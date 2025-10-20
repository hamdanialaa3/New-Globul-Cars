"use strict";
// functions/src/reviews/markHelpful.ts
// Cloud Function: Mark review as helpful
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
exports.unmarkHelpful = exports.markHelpful = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const db = (0, firestore_1.getFirestore)();
/**
 * Mark Review as Helpful
 *
 * Allows users to mark reviews as helpful
 * Prevents duplicate marks from same user
 *
 * @param reviewId - Review to mark as helpful
 *
 * @returns Success status and updated helpful count
 */
exports.markHelpful = (0, https_1.onCall)(async (request) => {
    var _a;
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
    logger.info('Marking review as helpful', { reviewId, userId });
    try {
        // 3. Get review document
        const reviewRef = db.collection('reviews').doc(reviewId);
        const reviewDoc = await reviewRef.get();
        if (!reviewDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Review not found');
        }
        const reviewData = reviewDoc.data();
        // 4. Check if user already marked this review as helpful
        const helpfulMarksSnapshot = await db
            .collection('reviews')
            .doc(reviewId)
            .collection('helpfulMarks')
            .doc(userId)
            .get();
        if (helpfulMarksSnapshot.exists) {
            throw new https_1.HttpsError('already-exists', 'You already marked this review as helpful');
        }
        // 5. Prevent marking own reviews as helpful
        if ((reviewData === null || reviewData === void 0 ? void 0 : reviewData.reviewerId) === userId) {
            throw new https_1.HttpsError('permission-denied', 'Cannot mark your own review as helpful');
        }
        // 6. Add helpful mark
        await db
            .collection('reviews')
            .doc(reviewId)
            .collection('helpfulMarks')
            .doc(userId)
            .set({
            userId,
            markedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        // 7. Increment helpful count
        await reviewRef.update({
            helpfulCount: firestore_1.FieldValue.increment(1),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        const updatedDoc = await reviewRef.get();
        const newHelpfulCount = ((_a = updatedDoc.data()) === null || _a === void 0 ? void 0 : _a.helpfulCount) || 0;
        logger.info('Review marked as helpful', { reviewId, newHelpfulCount });
        return {
            success: true,
            helpfulCount: newHelpfulCount,
            message: 'Review marked as helpful',
        };
    }
    catch (error) {
        logger.error('Failed to mark review as helpful', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', `Failed to mark review as helpful: ${error.message}`);
    }
});
/**
 * Unmark Review as Helpful
 *
 * Allows users to remove their helpful mark
 */
exports.unmarkHelpful = (0, https_1.onCall)(async (request) => {
    var _a;
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
    logger.info('Unmarking review as helpful', { reviewId, userId });
    try {
        // 3. Get review document
        const reviewRef = db.collection('reviews').doc(reviewId);
        const reviewDoc = await reviewRef.get();
        if (!reviewDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Review not found');
        }
        // 4. Check if user marked this review as helpful
        const helpfulMarkRef = db
            .collection('reviews')
            .doc(reviewId)
            .collection('helpfulMarks')
            .doc(userId);
        const helpfulMarkDoc = await helpfulMarkRef.get();
        if (!helpfulMarkDoc.exists) {
            throw new https_1.HttpsError('not-found', 'You have not marked this review as helpful');
        }
        // 5. Remove helpful mark
        await helpfulMarkRef.delete();
        // 6. Decrement helpful count
        await reviewRef.update({
            helpfulCount: firestore_1.FieldValue.increment(-1),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        const updatedDoc = await reviewRef.get();
        const newHelpfulCount = ((_a = updatedDoc.data()) === null || _a === void 0 ? void 0 : _a.helpfulCount) || 0;
        logger.info('Review unmarked as helpful', { reviewId, newHelpfulCount });
        return {
            success: true,
            helpfulCount: newHelpfulCount,
            message: 'Helpful mark removed',
        };
    }
    catch (error) {
        logger.error('Failed to unmark review as helpful', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', `Failed to unmark review: ${error.message}`);
    }
});
//# sourceMappingURL=markHelpful.js.map