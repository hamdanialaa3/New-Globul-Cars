// functions/src/team/acceptInvite.ts
// Cloud Function: Accept Team Invitation

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { AcceptInviteRequest, TeamMember } from './types';

const db = getFirestore();

/**
 * Accept Team Invitation
 * 
 * Accepts pending invitation and adds user to team
 * 
 * @param invitationId - Invitation ID to accept
 * 
 * @returns Success status and team member ID
 */
export const acceptInvite = onCall<AcceptInviteRequest>(async (request) => {
  const { invitationId } = request.data;

  // 1. Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = request.auth.uid;

  // 2. Validate inputs
  if (!invitationId) {
    throw new HttpsError('invalid-argument', 'invitationId is required');
  }

  logger.info('Accepting team invitation', { invitationId, userId });

  try {
    // 3. Get invitation
    const invitationDoc = await db.collection('teamInvitations').doc(invitationId).get();

    if (!invitationDoc.exists) {
      throw new HttpsError('not-found', 'Invitation not found');
    }

    const invitation = invitationDoc.data()!;

    // 4. Validate invitation status
    if (invitation.status !== 'pending') {
      throw new HttpsError('failed-precondition', `Invitation is ${invitation.status}`);
    }

    // 5. Check if expired
    const now = new Date();
    const expiresAt = invitation.expiresAt.toDate();

    if (now > expiresAt) {
      await invitationDoc.ref.update({
        status: 'expired',
      });
      throw new HttpsError('failed-precondition', 'Invitation has expired');
    }

    // 6. Get user data
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data()!;

    // 7. Verify email matches
    if (userData.email?.toLowerCase() !== invitation.email) {
      throw new HttpsError(
        'permission-denied',
        'This invitation was sent to a different email address'
      );
    }

    // 8. Check if user is already a team member
    const existingMemberDoc = await db
      .collection('users')
      .doc(invitation.businessId)
      .collection('team')
      .doc(userId)
      .get();

    if (existingMemberDoc.exists) {
      throw new HttpsError('already-exists', 'You are already a team member');
    }

    // 9. Create team member document
    const teamMember: Omit<TeamMember, 'id'> = {
      userId,
      email: userData.email,
      displayName: userData.displayName || 'Team Member',
      role: invitation.role,
      permissions: invitation.permissions,

      invitedBy: invitation.invitedBy,
      invitedAt: invitation.invitedAt,
      joinedAt: FieldValue.serverTimestamp() as any,

      status: 'active',
      lastActive: FieldValue.serverTimestamp() as any,
    };

    await db
      .collection('users')
      .doc(invitation.businessId)
      .collection('team')
      .doc(userId)
      .set(teamMember);

    logger.info('Team member added', {
      userId,
      businessId: invitation.businessId,
      role: invitation.role,
    });

    // 10. Update user document
    await db.collection('users').doc(userId).update({
      businessOwnerId: invitation.businessId,
      teamRole: invitation.role,
      isTeamMember: true,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 11. Update invitation status
    await invitationDoc.ref.update({
      status: 'accepted',
      acceptedAt: FieldValue.serverTimestamp(),
      acceptedBy: userId,
    });

    // 12. Log activity
    await db.collection('activityLog').add({
      type: 'team_member_joined',
      userId,
      businessId: invitation.businessId,
      role: invitation.role,
      invitationId,
      timestamp: FieldValue.serverTimestamp(),
    });

    // 13. Notify business owner
    await db.collection('notifications').add({
      userId: invitation.businessId,
      type: 'team_member_joined',
      title: 'New Team Member',
      message: `${userData.displayName} has joined your team as ${invitation.role}`,
      data: {
        memberId: userId,
        memberName: userData.displayName,
        role: invitation.role,
      },
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    // 14. Notify inviter (if different from owner)
    if (invitation.invitedBy !== invitation.businessId) {
      await db.collection('notifications').add({
        userId: invitation.invitedBy,
        type: 'team_invitation_accepted',
        title: 'Invitation Accepted',
        message: `${userData.displayName} accepted your team invitation`,
        data: {
          memberId: userId,
          memberName: userData.displayName,
          role: invitation.role,
        },
        read: false,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    // 15. Send welcome email
    await sendWelcomeEmail(userId, invitation.businessId);

    return {
      success: true,
      message: 'Successfully joined the team',
      teamMemberId: userId,
      businessId: invitation.businessId,
      role: invitation.role,
    };
  } catch (error: any) {
    logger.error('Failed to accept invitation', { invitationId, error });

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', `Failed to accept invitation: ${error.message}`);
  }
});

/**
 * Decline Team Invitation
 * 
 * Declines invitation without joining team
 */
export const declineInvite = onCall<AcceptInviteRequest>(async (request) => {
  const { invitationId } = request.data;

  // 1. Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = request.auth.uid;

  // 2. Validate inputs
  if (!invitationId) {
    throw new HttpsError('invalid-argument', 'invitationId is required');
  }

  logger.info('Declining team invitation', { invitationId, userId });

  try {
    // 3. Get invitation
    const invitationDoc = await db.collection('teamInvitations').doc(invitationId).get();

    if (!invitationDoc.exists) {
      throw new HttpsError('not-found', 'Invitation not found');
    }

    const invitation = invitationDoc.data()!;

    // 4. Validate status
    if (invitation.status !== 'pending') {
      throw new HttpsError('failed-precondition', `Invitation is ${invitation.status}`);
    }

    // 5. Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    // 6. Verify email matches
    if (userData?.email?.toLowerCase() !== invitation.email) {
      throw new HttpsError(
        'permission-denied',
        'This invitation was sent to a different email address'
      );
    }

    // 7. Update invitation status
    await invitationDoc.ref.update({
      status: 'declined',
      declinedAt: FieldValue.serverTimestamp(),
      declinedBy: userId,
    });

    logger.info('Invitation declined', { invitationId, userId });

    // 8. Notify inviter
    await db.collection('notifications').add({
      userId: invitation.invitedBy,
      type: 'team_invitation_declined',
      title: 'Invitation Declined',
      message: `${userData?.displayName || invitation.email} declined your team invitation`,
      data: {
        invitationId,
        email: invitation.email,
        role: invitation.role,
      },
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: 'Invitation declined',
    };
  } catch (error: any) {
    logger.error('Failed to decline invitation', { invitationId, error });

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', `Failed to decline invitation: ${error.message}`);
  }
});

/**
 * Send welcome email to new team member
 */
async function sendWelcomeEmail(userId: string, businessId: string) {
  try {
    const [userDoc, businessDoc] = await Promise.all([
      db.collection('users').doc(userId).get(),
      db.collection('users').doc(businessId).get(),
    ]);

    const userData = userDoc.data();
    const businessData = businessDoc.data();

    if (!userData || !businessData) {
      return;
    }

    await db.collection('mail').add({
      to: [userData.email],
      template: {
        name: 'team-welcome',
        data: {
          memberName: userData.displayName,
          businessName: businessData.businessName || businessData.displayName,
          dashboardUrl: 'https://mobilebg.eu/dashboard',
        },
      },
    });

    logger.info('Welcome email queued', { userId, businessId });
  } catch (error) {
    logger.error('Failed to send welcome email', { userId, businessId, error });
  }
}
