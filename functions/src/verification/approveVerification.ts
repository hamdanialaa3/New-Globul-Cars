// functions/src/verification/approveVerification.ts
// Cloud Function: Approve verification request and upgrade user profile

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as logger from 'firebase-functions/logger';
import { ApprovalResult, VerificationRequest } from './types';
import { sendApprovalEmail } from './emailService';

const db = getFirestore();

/**
 * Approve a verification request and upgrade user to Dealer or Company
 * 
 * @param userId - The user ID to approve
 * @param requestId - The verification request ID
 * @param adminId - The admin approving the request
 * 
 * @returns ApprovalResult with success status
 */
export const approveVerification = onCall<{
  userId: string;
  requestId: string;
  adminId?: string;
}>(async (request) => {
  const { userId, requestId, adminId } = request.data;

  // 1. Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  // 2. Verify admin permissions
  const callerUid = request.auth.uid;
  const adminDoc = await db.collection('admins').doc(callerUid).get();
  
  if (!adminDoc.exists) {
    logger.warn('Non-admin attempted to approve verification', { 
      callerUid, 
      userId 
    });
    throw new HttpsError(
      'permission-denied',
      'Only administrators can approve verification requests'
    );
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
      throw new HttpsError('not-found', 'Verification request not found');
    }

    const verificationRequest = requestDoc.data() as VerificationRequest;

    if (verificationRequest.status !== 'pending') {
      throw new HttpsError(
        'failed-precondition',
        `Request already ${verificationRequest.status}`
      );
    }

    // 4. Get user document
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'User not found');
    }

    const targetProfileType = verificationRequest.targetProfileType;

    // 5. Update user profile type and verification status
    await db.collection('users').doc(userId).update({
      profileType: targetProfileType,
      'verification.status': 'approved',
      'verification.approvedAt': FieldValue.serverTimestamp(),
      'verification.approvedBy': callerUid,
      'verification.business.verified': true,
      'verification.level': targetProfileType === 'company' ? 'company' : 'business',
      updatedAt: FieldValue.serverTimestamp(),
    });

    logger.info('User profile upgraded', { 
      userId, 
      newProfileType: targetProfileType 
    });

    // 6. Update verification request status
    await db.collection('verificationRequests').doc(requestId).update({
      status: 'approved',
      reviewedAt: FieldValue.serverTimestamp(),
      reviewedBy: callerUid,
    });

    // 7. Update user's trust score (bonus for verification)
    const currentUser = userDoc.data();
    const currentTrustScore = currentUser?.verification?.trustScore || 50;
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
      timestamp: FieldValue.serverTimestamp(),
      details: {
        businessName: verificationRequest.businessInfo.legalName,
        eik: verificationRequest.businessInfo.eik,
      },
    });

    // 9. Send approval email
    try {
      await sendApprovalEmail({
        userEmail: verificationRequest.userEmail,
        displayName: verificationRequest.displayName,
        profileType: targetProfileType,
        businessName: verificationRequest.businessInfo.legalName,
      });
      logger.info('Approval email sent', { userId });
    } catch (emailError) {
      logger.error('Failed to send approval email', emailError);
      // Don't fail the whole process if email fails
    }

    // 10. Delete the request (cleanup)
    await db.collection('verificationRequests').doc(requestId).delete();

    logger.info('Verification approval completed successfully', { 
      userId, 
      targetProfileType 
    });

    const result: ApprovalResult = {
      success: true,
      message: `User successfully upgraded to ${targetProfileType}`,
      userId,
      newProfileType: targetProfileType,
    };

    return result;
  } catch (error: any) {
    logger.error('Verification approval failed', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError(
      'internal',
      `Failed to approve verification: ${error.message}`
    );
  }
});
