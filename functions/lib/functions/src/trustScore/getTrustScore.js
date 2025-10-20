"use strict";
// functions/src/trustScore/getTrustScore.ts
// Cloud Function: Get Trust Score for User
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
exports.recalculateTrustScore = exports.getTrustScore = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const calculateScore_1 = require("./calculateScore");
const db = (0, firestore_1.getFirestore)();
/**
 * Get Trust Score
 *
 * Returns cached trust score or recalculates if outdated
 *
 * @param userId - User ID to get score for (optional, defaults to caller)
 * @returns Trust score with breakdown and badge info
 */
exports.getTrustScore = (0, https_1.onCall)(async (request) => {
    // 1. Check authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const requesterId = request.auth.uid;
    const targetUserId = request.data.userId || requesterId;
    logger.info('Getting trust score', { requesterId, targetUserId });
    try {
        // 2. Check if cached score exists and is recent (< 24 hours old)
        const trustScoreDoc = await db.collection('trustScores').doc(targetUserId).get();
        if (trustScoreDoc.exists) {
            const cachedScore = trustScoreDoc.data();
            const lastCalculated = cachedScore.lastCalculated.toDate();
            const now = new Date();
            const hoursSinceUpdate = (now.getTime() - lastCalculated.getTime()) / (1000 * 60 * 60);
            // Use cached if less than 24 hours old
            if (hoursSinceUpdate < 24) {
                logger.info('Using cached trust score', {
                    targetUserId,
                    score: cachedScore.score,
                    hoursSinceUpdate: Math.round(hoursSinceUpdate),
                });
                return Object.assign(Object.assign({ success: true }, cachedScore), { badge: (0, calculateScore_1.getTrustBadge)(cachedScore.level), cached: true });
            }
        }
        // 3. Calculate new score
        const scoreResult = await (0, calculateScore_1.calculateTrustScore)(targetUserId);
        // 4. Save to Firestore
        await db.collection('trustScores').doc(targetUserId).set(Object.assign(Object.assign({}, scoreResult), { lastCalculated: firestore_1.FieldValue.serverTimestamp() }));
        // 5. Update user document
        await db.collection('users').doc(targetUserId).update({
            trustScore: scoreResult.score,
            trustLevel: scoreResult.level,
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        logger.info('Trust score calculated and saved', {
            targetUserId,
            score: scoreResult.score,
            level: scoreResult.level,
        });
        return Object.assign(Object.assign({ success: true }, scoreResult), { badge: (0, calculateScore_1.getTrustBadge)(scoreResult.level), cached: false });
    }
    catch (error) {
        logger.error('Failed to get trust score', { targetUserId, error });
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', `Failed to get trust score: ${error.message}`);
    }
});
/**
 * Recalculate Trust Score (Force)
 *
 * Admin function to force recalculation
 */
exports.recalculateTrustScore = (0, https_1.onCall)(async (request) => {
    // 1. Check authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { userId } = request.data;
    if (!userId) {
        throw new https_1.HttpsError('invalid-argument', 'userId is required');
    }
    // 2. Check admin permissions
    const adminDoc = await db.collection('admins').doc(request.auth.uid).get();
    if (!adminDoc.exists) {
        throw new https_1.HttpsError('permission-denied', 'Admin access required');
    }
    logger.info('Force recalculating trust score', { userId, adminId: request.auth.uid });
    try {
        // Calculate score
        const scoreResult = await (0, calculateScore_1.calculateTrustScore)(userId);
        // Save to Firestore
        await db.collection('trustScores').doc(userId).set(Object.assign(Object.assign({}, scoreResult), { lastCalculated: firestore_1.FieldValue.serverTimestamp() }));
        // Update user document
        await db.collection('users').doc(userId).update({
            trustScore: scoreResult.score,
            trustLevel: scoreResult.level,
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        logger.info('Trust score force recalculated', {
            userId,
            score: scoreResult.score,
            level: scoreResult.level,
        });
        return Object.assign(Object.assign({ success: true }, scoreResult), { badge: (0, calculateScore_1.getTrustBadge)(scoreResult.level) });
    }
    catch (error) {
        logger.error('Failed to recalculate trust score', { userId, error });
        throw new https_1.HttpsError('internal', `Failed to recalculate trust score: ${error.message}`);
    }
});
//# sourceMappingURL=getTrustScore.js.map