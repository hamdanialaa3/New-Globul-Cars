"use strict";
// functions/src/verification/rejectVerification.ts
// Cloud Function: Reject verification request with reason
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
exports.rejectVerification = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const emailService_1 = require("./emailService");
const db = (0, firestore_1.getFirestore)();
/**
 * Reject a verification request
 *
 * @param userId - The user ID to reject
 * @param requestId - The verification request ID
 * @param reason - The reason for rejection
 * @param adminId - The admin rejecting the request
 *
 * @returns RejectionResult with success status
 */
exports.rejectVerification = (0, https_1.onCall)(async (request) => {
    const { userId, requestId, reason, adminId } = request.data;
    // 1. Check authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    // 2. Verify admin permissions
    const callerUid = request.auth.uid;
    const adminDoc = await db.collection('admins').doc(callerUid).get();
    if (!adminDoc.exists) {
        logger.warn('Non-admin attempted to reject verification', {
            callerUid,
            userId
        });
        throw new https_1.HttpsError('permission-denied', 'Only administrators can reject verification requests');
    }
    // 3. Validate rejection reason
    if (!reason || reason.trim().length < 10) {
        throw new https_1.HttpsError('invalid-argument', 'Rejection reason must be at least 10 characters');
    }
    logger.info('Verification rejection started', {
        userId,
        requestId,
        adminId: callerUid
    });
    try {
        // 4. Get verification request
        const requestDoc = await db
            .collection('verificationRequests')
            .doc(requestId)
            .get();
        if (!requestDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Verification request not found');
        }
        const verificationRequest = requestDoc.data();
        if (verificationRequest.status !== 'pending') {
            throw new https_1.HttpsError('failed-precondition', `Request already ${verificationRequest.status}`);
        }
        // 5. Update verification request status
        await db.collection('verificationRequests').doc(requestId).update({
            status: 'rejected',
            reviewedAt: firestore_1.FieldValue.serverTimestamp(),
            reviewedBy: callerUid,
            rejectionReason: reason,
        });
        // 6. Update user verification status
        await db.collection('users').doc(userId).update({
            'verification.status': 'rejected',
            'verification.rejectedAt': firestore_1.FieldValue.serverTimestamp(),
            'verification.rejectionReason': reason,
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        logger.info('User verification rejected', { userId, reason: reason.substring(0, 50) });
        // 7. Log rejection activity
        await db.collection('activityLog').add({
            type: 'verification_rejected',
            userId,
            adminId: callerUid,
            requestId,
            reason,
            timestamp: firestore_1.FieldValue.serverTimestamp(),
            details: {
                businessName: verificationRequest.businessInfo.legalName,
                targetProfileType: verificationRequest.targetProfileType,
            },
        });
        // 8. Send rejection email
        try {
            await (0, emailService_1.sendRejectionEmail)({
                userEmail: verificationRequest.userEmail,
                displayName: verificationRequest.displayName,
                profileType: verificationRequest.targetProfileType,
                reason,
                businessName: verificationRequest.businessInfo.legalName,
            });
            logger.info('Rejection email sent', { userId });
        }
        catch (emailError) {
            logger.error('Failed to send rejection email', emailError);
            // Don't fail the whole process if email fails
        }
        // 9. Keep request for 30 days (audit trail), then delete
        // Note: This would be handled by a scheduled cleanup function
        logger.info('Verification rejection completed successfully', {
            userId,
            requestId
        });
        const result = {
            success: true,
            message: 'Verification request rejected',
            userId,
            reason,
        };
        return result;
    }
    catch (error) {
        logger.error('Verification rejection failed', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', `Failed to reject verification: ${error.message}`);
    }
});
//# sourceMappingURL=rejectVerification.js.map