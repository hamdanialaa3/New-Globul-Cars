// functions/src/team/inviteMember.ts
// Cloud Function: Invite Team Member

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { InviteMemberRequest, TeamInvitation } from './types';
import { getDefaultPermissions, mergePermissions } from './permissions';

const db = getFirestore();

/**
 * Invite Team Member
 * 
 * Sends invitation to join team
 * Creates pending invitation with 7-day expiry
 * 
 * @param email - Email of person to invite
 * @param role - Team role to assign
 * @param customPermissions - Optional custom permissions
 * 
 * @returns Invitation ID and success status
 */
export const inviteMember = onCall<InviteMemberRequest>(async (request) => {
  const { email, role, customPermissions } = request.data;

  // 1. Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const inviterId = request.auth.uid;

  // 2. Validate inputs
  if (!email || !role) {
    throw new HttpsError('invalid-argument', 'email and role are required');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new HttpsError('invalid-argument', 'Invalid email format');
  }

  // Validate role
  const validRoles = ['admin', 'manager', 'sales', 'support'];
  if (!validRoles.includes(role)) {
    throw new HttpsError('invalid-argument', 'Invalid role. Must be: admin, manager, sales, or support');
  }

  logger.info('Inviting team member', { inviterId, email, role });

  try {
    // 3. Get inviter's data and check permissions
    const inviterDoc = await db.collection('users').doc(inviterId).get();

    if (!inviterDoc.exists) {
      throw new HttpsError('not-found', 'Inviter not found');
    }

    const inviterData = inviterDoc.data()!;

    // Check if inviter is dealer or company
    if (!['dealer', 'company'].includes(inviterData.profileType)) {
      throw new HttpsError(
        'permission-denied',
        'Only dealers and companies can invite team members'
      );
    }

    // Check if inviter has permission to invite members
    const inviterTeamDoc = await db
      .collection('users')
      .doc(inviterData.businessOwnerId || inviterId)
      .collection('team')
      .doc(inviterId)
      .get();

    if (inviterTeamDoc.exists) {
      const inviterTeamData = inviterTeamDoc.data()!;
      if (!inviterTeamData.permissions?.canInviteMembers && inviterTeamData.role !== 'owner') {
        throw new HttpsError('permission-denied', 'You do not have permission to invite team members');
      }
    }

    // Determine business owner (might be inviter or their owner)
    const businessOwnerId = inviterData.businessOwnerId || inviterId;
    const businessOwnerDoc = await db.collection('users').doc(businessOwnerId).get();
    const businessOwnerData = businessOwnerDoc.data()!;

    // 4. Check if email is already invited or is a team member
    const existingInvitationsSnapshot = await db
      .collection('teamInvitations')
      .where('businessId', '==', businessOwnerId)
      .where('email', '==', email.toLowerCase())
      .where('status', '==', 'pending')
      .get();

    if (!existingInvitationsSnapshot.empty) {
      throw new HttpsError('already-exists', 'This email already has a pending invitation');
    }

    // Check if user is already a team member
    const existingMembersSnapshot = await db
      .collection('users')
      .doc(businessOwnerId)
      .collection('team')
      .where('email', '==', email.toLowerCase())
      .get();

    if (!existingMembersSnapshot.empty) {
      throw new HttpsError('already-exists', 'This user is already a team member');
    }

    // 5. Get permissions for role
    const rolePermissions = getDefaultPermissions(role);
    const finalPermissions = mergePermissions(rolePermissions, customPermissions);

    // 6. Create invitation
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation: Omit<TeamInvitation, 'id'> = {
      email: email.toLowerCase(),
      role,
      permissions: finalPermissions,

      invitedBy: inviterId,
      invitedByName: inviterData.displayName || 'Team Admin',
      businessName: businessOwnerData.businessName || businessOwnerData.displayName || 'Business',
      businessId: businessOwnerId,

      status: 'pending',
      invitedAt: FieldValue.serverTimestamp() as any,
      expiresAt: expiresAt as any,
    };

    const invitationRef = await db.collection('teamInvitations').add(invitation);

    logger.info('Team invitation created', {
      invitationId: invitationRef.id,
      email,
      role,
      businessId: businessOwnerId,
    });

    // 7. Send invitation email
    await sendInvitationEmail(invitationRef.id, invitation);

    // 8. Log activity
    await db.collection('activityLog').add({
      type: 'team_invitation_sent',
      inviterId,
      email,
      role,
      businessId: businessOwnerId,
      invitationId: invitationRef.id,
      timestamp: FieldValue.serverTimestamp(),
    });

    // 9. Notify inviter
    await db.collection('notifications').add({
      userId: inviterId,
      type: 'team_invitation_sent',
      title: 'Team Invitation Sent',
      message: `Invitation sent to ${email} as ${role}`,
      data: {
        invitationId: invitationRef.id,
        email,
        role,
      },
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      invitationId: invitationRef.id,
      message: `Invitation sent to ${email}`,
      expiresAt: expiresAt.toISOString(),
    };
  } catch (error: any) {
    logger.error('Failed to invite team member', error);

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', `Failed to invite team member: ${error.message}`);
  }
});

/**
 * Send invitation email
 */
async function sendInvitationEmail(invitationId: string, invitation: any) {
  try {
  const invitationLink = `https://mobilebg.eu/team/accept-invite/${invitationId}`;

    await db.collection('mail').add({
      to: [invitation.email],
      template: {
        name: 'team-invitation',
        data: {
          businessName: invitation.businessName,
          invitedByName: invitation.invitedByName,
          role: invitation.role,
          invitationLink,
          expiresAt: invitation.expiresAt,
        },
      },
    });

    logger.info('Invitation email queued', { invitationId, email: invitation.email });
  } catch (error) {
    logger.error('Failed to send invitation email', { invitationId, error });
  }
}

/**
 * Resend Team Invitation
 * 
 * Resends invitation email if still pending
 */
export const resendInvitation = onCall<{ invitationId: string }>(async (request) => {
  // 1. Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { invitationId } = request.data;

  if (!invitationId) {
    throw new HttpsError('invalid-argument', 'invitationId is required');
  }

  logger.info('Resending team invitation', { invitationId, userId: request.auth.uid });

  try {
    // 2. Get invitation
    const invitationDoc = await db.collection('teamInvitations').doc(invitationId).get();

    if (!invitationDoc.exists) {
      throw new HttpsError('not-found', 'Invitation not found');
    }

    const invitation = invitationDoc.data()!;

    // 3. Check if user has permission (must be inviter or business owner)
    if (
      invitation.invitedBy !== request.auth.uid &&
      invitation.businessId !== request.auth.uid
    ) {
      throw new HttpsError('permission-denied', 'Not authorized to resend this invitation');
    }

    // 4. Check invitation status
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

    // 6. Resend email
    await sendInvitationEmail(invitationId, invitation);

    logger.info('Invitation resent', { invitationId });

    return {
      success: true,
      message: 'Invitation resent',
    };
  } catch (error: any) {
    logger.error('Failed to resend invitation', { invitationId, error });

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', `Failed to resend invitation: ${error.message}`);
  }
});

/**
 * Cancel Team Invitation
 * 
 * Cancels pending invitation
 */
export const cancelInvitation = onCall<{ invitationId: string }>(async (request) => {
  // 1. Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { invitationId } = request.data;

  if (!invitationId) {
    throw new HttpsError('invalid-argument', 'invitationId is required');
  }

  logger.info('Canceling team invitation', { invitationId, userId: request.auth.uid });

  try {
    // 2. Get invitation
    const invitationDoc = await db.collection('teamInvitations').doc(invitationId).get();

    if (!invitationDoc.exists) {
      throw new HttpsError('not-found', 'Invitation not found');
    }

    const invitation = invitationDoc.data()!;

    // 3. Check permission
    if (
      invitation.invitedBy !== request.auth.uid &&
      invitation.businessId !== request.auth.uid
    ) {
      throw new HttpsError('permission-denied', 'Not authorized to cancel this invitation');
    }

    // 4. Check status
    if (invitation.status !== 'pending') {
      throw new HttpsError('failed-precondition', `Invitation is already ${invitation.status}`);
    }

    // 5. Update status
    await invitationDoc.ref.update({
      status: 'expired',
      canceledAt: FieldValue.serverTimestamp(),
      canceledBy: request.auth.uid,
    });

    logger.info('Invitation canceled', { invitationId });

    return {
      success: true,
      message: 'Invitation canceled',
    };
  } catch (error: any) {
    logger.error('Failed to cancel invitation', { invitationId, error });

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', `Failed to cancel invitation: ${error.message}`);
  }
});
