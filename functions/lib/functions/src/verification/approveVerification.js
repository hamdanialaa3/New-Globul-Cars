"use strict";
// functions/src/verification/approveVerification.ts
// Cloud Function: Approve verification request and upgrade user profile
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
exports.approveVerification = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const emailService_1 = require("./emailService");
const db = (0, firestore_1.getFirestore)();
/**
 * Approve a verification request and upgrade user to Dealer or Company
 *
 * @param userId - The user ID to approve
 * @param requestId - The verification request ID
 * @param adminId - The admin approving the request
 *
 * @returns ApprovalResult with success status
 */
exports.approveVerification = (0, https_1.onCall)(async (request) => {
    var _a;
    const { userId, requestId, adminId } = request.data;
    // 1. Check authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    // 2. Verify admin permissions
    const callerUid = request.auth.uid;
    const adminDoc = await db.collection('admins').doc(callerUid).get();
    if (!adminDoc.exists) {
        logger.warn('Non-admin attempted to approve verification', {
            callerUid,
            userId
        });
        throw new https_1.HttpsError('permission-denied', 'Only administrators can approve verification requests');
    }
    logger.info('Verification approval started', {
        userId,
        requestId,
        adminId: callerUid
    });
    try {
        // 3. Get verification request
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
        // 4. Get user document
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            throw new https_1.HttpsError('not-found', 'User not found');
        }
        const targetProfileType = verificationRequest.targetProfileType;
        // 5. Update user profile type and verification status
        await db.collection('users').doc(userId).update({
            profileType: targetProfileType,
            'verification.status': 'approved',
            'verification.approvedAt': firestore_1.FieldValue.serverTimestamp(),
            'verification.approvedBy': callerUid,
            'verification.business.verified': true,
            'verification.level': targetProfileType === 'company' ? 'company' : 'business',
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        logger.info('User profile upgraded', {
            userId,
            newProfileType: targetProfileType
        });
        // 6. Update verification request status
        await db.collection('verificationRequests').doc(requestId).update({
            status: 'approved',
            reviewedAt: firestore_1.FieldValue.serverTimestamp(),
            reviewedBy: callerUid,
        });
        // 7. Update user's trust score (bonus for verification)
        const currentUser = userDoc.data();
        const currentTrustScore = ((_a = currentUser === null || currentUser === void 0 ? void 0 : currentUser.verification) === null || _a === void 0 ? void 0 : _a.trustScore) || 50;
        const newTrustScore = Math.min(100, currentTrustScore + 20); // +20 for business verification
        await db.collection('users').doc(userId).update({
            'verification.trustScore': newTrustScore,
        });
        // 8. Log approval activity
        await db.collection('activityLog').add({
            type: 'verification_approved',
            userId,
            adminId: callerUid,
            requestId,
            targetProfileType,
            timestamp: firestore_1.FieldValue.serverTimestamp(),
            details: {
                businessName: verificationRequest.businessInfo.legalName,
                eik: verificationRequest.businessInfo.eik,
            },
        });
        // 9. Send approval email
        try {
            await (0, emailService_1.sendApprovalEmail)({
                userEmail: verificationRequest.userEmail,
                displayName: verificationRequest.displayName,
                profileType: targetProfileType,
                businessName: verificationRequest.businessInfo.legalName,
            });
            logger.info('Approval email sent', { userId });
        }
        catch (emailError) {
            logger.error('Failed to send approval email', emailError);
            // Don't fail the whole process if email fails
        }
        // 10. Delete the request (cleanup)
        await db.collection('verificationRequests').doc(requestId).delete();
        logger.info('Verification approval completed successfully', {
            userId,
            targetProfileType
        });
        const result = {
            success: true,
            message: `User successfully upgraded to ${targetProfileType}`,
            userId,
            newProfileType: targetProfileType,
        };
        return result;
    }
    catch (error) {
        logger.error('Verification approval failed', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', `Failed to approve verification: ${error.message}`);
    }
});
//# sourceMappingURL=approveVerification.js.map