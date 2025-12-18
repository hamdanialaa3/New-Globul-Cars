// functions/src/verification/rejectVerification.ts
// Cloud Function: Reject verification request with reason

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { RejectionResult, VerificationRequest } from './types';
import { sendRejectionEmail } from './emailService';

const db = getFirestore();

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
export const rejectVerification = onCall<{
  userId: string;
  requestId: string;
  reason: string;
  adminId?: string;
}>(async (request) => {
  const { userId, requestId, reason, adminId } = request.data;

  // 1. Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  // 2. Verify admin permissions
  const callerUid = request.auth.uid;
  const adminDoc = await db.collection('admins').doc(callerUid).get();
  
  if (!adminDoc.exists) {
    logger.warn('Non-admin attempted to reject verification', { 
      callerUid, 
      userId 
    });
    throw new HttpsError(
      'permission-denied',
      'Only administrators can reject verification requests'
    );
  }

  // 3. Validate rejection reason
  if (!reason || reason.trim().length < 10) {
    throw new HttpsError(
      'invalid-argument',
      'Rejection reason must be at least 10 characters'
    );
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
      throw new HttpsError('not-found', 'Verification request not found');
    }

    const verificationRequest = requestDoc.data() as VerificationRequest;

    if (verificationRequest.status !== 'pending') {
      throw new HttpsError(
        'failed-precondition',
        `Request already ${verificationRequest.status}`
      );
    }

    // 5. Update verification request status
    await db.collection('verificationRequests').doc(requestId).update({
      status: 'rejected',
      reviewedAt: FieldValue.serverTimestamp(),
      reviewedBy: callerUid,
      rejectionReason: reason,
    });

    // 6. Update user verification status
    await db.collection('users').doc(userId).update({
      'verification.status': 'rejected',
      'verification.rejectedAt': FieldValue.serverTimestamp(),
      'verification.rejectionReason': reason,
      updatedAt: FieldValue.serverTimestamp(),
    });

    logger.info('User verification rejected', { userId, reason: reason.substring(0, 50) });

    // 7. Log rejection activity
    await db.collection('activityLog').add({
      type: 'verification_rejected',
      userId,
      adminId: callerUid,
      requestId,
      reason,
      timestamp: FieldValue.serverTimestamp(),
      details: {
        businessName: verificationRequest.businessInfo.legalName,
        targetProfileType: verificationRequest.targetProfileType,
      },
    });

    // 8. Send rejection email
    try {
      await sendRejectionEmail({
        userEmail: verificationRequest.userEmail,
        displayName: verificationRequest.displayName,
        profileType: verificationRequest.targetProfileType,
        reason,
        businessName: verificationRequest.businessInfo.legalName,
      });
      logger.info('Rejection email sent', { userId });
    } catch (emailError) {
      logger.error('Failed to send rejection email', emailError);
      // Don't fail the whole process if email fails
    }

    // 9. Keep request for 30 days (audit trail), then delete
    // Note: This would be handled by a scheduled cleanup function

    logger.info('Verification rejection completed successfully', { 
      userId, 
      requestId 
    });

    const result: RejectionResult = {
      success: true,
      message: 'Verification request rejected',
      userId,
      reason,
    };

    return result;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Verification rejection failed', { error: err.message });
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError(
      'internal',
      `Failed to reject verification: ${err.message}`
    );
  }
});
