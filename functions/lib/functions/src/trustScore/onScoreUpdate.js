"use strict";
// functions/src/trustScore/onScoreUpdate.ts
// Firestore Triggers: Auto-update trust scores when data changes
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
exports.onAnalyticsUpdated = exports.onListingChanged = exports.onVerificationUpdated = exports.onReviewStatsUpdated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const firestore_2 = require("firebase-admin/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const calculateScore_1 = require("./calculateScore");
const db = (0, firestore_2.getFirestore)();
/**
 * Update Trust Score on Review Stats Change
 *
 * Triggers when reviewStats/{userId} is updated
 */
exports.onReviewStatsUpdated = (0, firestore_1.onDocumentWritten)('reviewStats/{userId}', async (event) => {
    const userId = event.params.userId;
    logger.info('Review stats updated, recalculating trust score', { userId });
    try {
        await recalculateAndSave(userId);
    }
    catch (error) {
        logger.error('Failed to update trust score on review stats change', { userId, error });
    }
});
/**
 * Update Trust Score on Verification Status Change
 *
 * Triggers when user verification status changes
 */
exports.onVerificationUpdated = (0, firestore_1.onDocumentWritten)('users/{userId}', async (event) => {
    var _a, _b, _c, _d;
    const beforeData = (_b = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before) === null || _b === void 0 ? void 0 : _b.data();
    const afterData = (_d = (_c = event.data) === null || _c === void 0 ? void 0 : _c.after) === null || _d === void 0 ? void 0 : _d.data();
    // Only trigger if verification status changed
    const verificationChanged = (beforeData === null || beforeData === void 0 ? void 0 : beforeData.isVerified) !== (afterData === null || afterData === void 0 ? void 0 : afterData.isVerified);
    if (!verificationChanged) {
        return;
    }
    const userId = event.params.userId;
    logger.info('Verification status changed, recalculating trust score', {
        userId,
        isVerified: afterData === null || afterData === void 0 ? void 0 : afterData.isVerified,
    });
    try {
        await recalculateAndSave(userId);
    }
    catch (error) {
        logger.error('Failed to update trust score on verification change', { userId, error });
    }
});
/**
 * Update Trust Score on Listing Change
 *
 * Triggers when listings are created/updated/deleted
 */
exports.onListingChanged = (0, firestore_1.onDocumentWritten)('cars/{listingId}', async (event) => {
    var _a, _b, _c, _d;
    const beforeData = (_b = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before) === null || _b === void 0 ? void 0 : _b.data();
    const afterData = (_d = (_c = event.data) === null || _c === void 0 ? void 0 : _c.after) === null || _d === void 0 ? void 0 : _d.data();
    // Get seller ID (from before or after)
    const sellerId = (afterData === null || afterData === void 0 ? void 0 : afterData.sellerId) || (beforeData === null || beforeData === void 0 ? void 0 : beforeData.sellerId);
    if (!sellerId) {
        return;
    }
    // Only trigger if listing status, premium status, or significant fields changed
    const statusChanged = (beforeData === null || beforeData === void 0 ? void 0 : beforeData.status) !== (afterData === null || afterData === void 0 ? void 0 : afterData.status);
    const premiumChanged = (beforeData === null || beforeData === void 0 ? void 0 : beforeData.isPremium) !== (afterData === null || afterData === void 0 ? void 0 : afterData.isPremium);
    const significantChange = statusChanged || premiumChanged || !beforeData || !afterData;
    if (!significantChange) {
        return;
    }
    logger.info('Listing changed, recalculating trust score', { sellerId });
    try {
        await recalculateAndSave(sellerId);
    }
    catch (error) {
        logger.error('Failed to update trust score on listing change', { sellerId, error });
    }
});
/**
 * Update Trust Score on Analytics Change
 *
 * Triggers when user analytics are updated (response rate)
 */
exports.onAnalyticsUpdated = (0, firestore_1.onDocumentWritten)('userAnalytics/{userId}', async (event) => {
    var _a, _b, _c, _d;
    const beforeData = (_b = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before) === null || _b === void 0 ? void 0 : _b.data();
    const afterData = (_d = (_c = event.data) === null || _c === void 0 ? void 0 : _c.after) === null || _d === void 0 ? void 0 : _d.data();
    // Only trigger if response rate changed significantly (> 5%)
    const beforeRate = (beforeData === null || beforeData === void 0 ? void 0 : beforeData.inquiryResponseRate) || 0;
    const afterRate = (afterData === null || afterData === void 0 ? void 0 : afterData.inquiryResponseRate) || 0;
    const rateChangedSignificantly = Math.abs(afterRate - beforeRate) > 0.05;
    if (!rateChangedSignificantly) {
        return;
    }
    const userId = event.params.userId;
    logger.info('Response rate changed, recalculating trust score', {
        userId,
        beforeRate,
        afterRate,
    });
    try {
        await recalculateAndSave(userId);
    }
    catch (error) {
        logger.error('Failed to update trust score on analytics change', { userId, error });
    }
});
/**
 * Helper: Recalculate and save trust score
 */
async function recalculateAndSave(userId) {
    try {
        // Calculate new score
        const scoreResult = await (0, calculateScore_1.calculateTrustScore)(userId);
        // Save to trustScores collection
        await db.collection('trustScores').doc(userId).set(Object.assign(Object.assign({}, scoreResult), { lastCalculated: firestore_2.FieldValue.serverTimestamp() }));
        // Update user document
        await db.collection('users').doc(userId).update({
            trustScore: scoreResult.score,
            trustLevel: scoreResult.level,
            updatedAt: firestore_2.FieldValue.serverTimestamp(),
        });
        logger.info('Trust score recalculated and saved', {
            userId,
            score: scoreResult.score,
            level: scoreResult.level,
        });
    }
    catch (error) {
        logger.error('Failed to recalculate trust score', { userId, error });
        throw error;
    }
}
//# sourceMappingURL=onScoreUpdate.js.map