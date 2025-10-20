// functions/src/team/removeMember.ts
// Cloud Function: Remove Team Member

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { RemoveMemberRequest, UpdateMemberRequest } from './types';

const db = getFirestore();

/**
 * Remove Team Member
 * 
 * Removes member from team and revokes permissions
 * 
 * @param memberId - User ID of member to remove
 * @param reason - Optional reason for removal
 * 
 * @returns Success status
 */
export const removeMember = onCall<RemoveMemberRequest>(async (request) => {
  const { memberId, reason } = request.data;

  // 1. Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const requesterId = request.auth.uid;

  // 2. Validate inputs
  if (!memberId) {
    throw new HttpsError('invalid-argument', 'memberId is required');
  }

  // Cannot remove yourself
  if (memberId === requesterId) {
    throw new HttpsError('invalid-argument', 'Cannot remove yourself. Use leave team instead.');
  }

  logger.info('Removing team member', { requesterId, memberId, reason });

  try {
    // 3. Get requester data
    const requesterDoc = await db.collection('users').doc(requesterId).get();

    if (!requesterDoc.exists) {
      throw new HttpsError('not-found', 'Requester not found');
    }

    const requesterData = requesterDoc.data()!;

    // Determine business owner ID
    const businessOwnerId = requesterData.businessOwnerId || requesterId;

    // 4. Check requester's permissions
    if (businessOwnerId !== requesterId) {
      // Requester is a team member, check permissions
      const requesterTeamDoc = await db
        .collection('users')
        .doc(businessOwnerId)
        .collection('team')
        .doc(requesterId)
        .get();

      if (!requesterTeamDoc.exists) {
        throw new HttpsError('permission-denied', 'Not authorized');
      }

      const requesterTeamData = requesterTeamDoc.data()!;

      if (!requesterTeamData.permissions?.canRemoveMembers && requesterTeamData.role !== 'owner') {
        throw new HttpsError('permission-denied', 'You do not have permission to remove team members');
      }
    }

    // 5. Get member to remove
    const memberTeamDoc = await db
      .collection('users')
      .doc(businessOwnerId)
      .collection('team')
      .doc(memberId)
      .get();

    if (!memberTeamDoc.exists) {
      throw new HttpsError('not-found', 'Team member not found');
    }

    const memberData = memberTeamDoc.data()!;

    // Cannot remove owner
    if (memberData.role === 'owner') {
      throw new HttpsError('permission-denied', 'Cannot remove business owner');
    }

    // 6. Update member status to inactive
    await memberTeamDoc.ref.update({
      status: 'inactive',
      removedAt: FieldValue.serverTimestamp(),
      removedBy: requesterId,
      removalReason: reason || 'No reason provided',
    });

    // 7. Update member's user document
    await db.collection('users').doc(memberId).update({
      businessOwnerId: FieldValue.delete(),
      teamRole: FieldValue.delete(),
      isTeamMember: false,
      updatedAt: FieldValue.serverTimestamp(),
    });

    logger.info('Team member removed', { memberId, businessId: businessOwnerId });

    // 8. Log activity
    await db.collection('activityLog').add({
      type: 'team_member_removed',
      removerId: requesterId,
      memberId,
      businessId: businessOwnerId,
      reason,
      timestamp: FieldValue.serverTimestamp(),
    });

    // 9. Notify removed member
    await db.collection('notifications').add({
      userId: memberId,
      type: 'team_removed',
      title: 'Removed from Team',
      message: reason
        ? `You have been removed from the team. Reason: ${reason}`
        : 'You have been removed from the team',
      data: {
        businessId: businessOwnerId,
        removedBy: requesterId,
        reason,
      },
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    // 10. Send removal email
    await sendRemovalEmail(memberId, businessOwnerId, reason);

    return {
      success: true,
      message: 'Team member removed successfully',
    };
  } catch (error: any) {
    logger.error('Failed to remove team member', { memberId, error });

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', `Failed to remove team member: ${error.message}`);
  }
});

/**
 * Update Team Member Role/Permissions
 * 
 * Updates member's role or permissions
 */
export const updateMember = onCall<UpdateMemberRequest>(async (request) => {
  const { memberId, role, permissions } = request.data;

  // 1. Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const requesterId = request.auth.uid;

  // 2. Validate inputs
  if (!memberId) {
    throw new HttpsError('invalid-argument', 'memberId is required');
  }

  if (!role && !permissions) {
    throw new HttpsError('invalid-argument', 'Either role or permissions must be provided');
  }

  logger.info('Updating team member', { requesterId, memberId, role, permissions });

  try {
    // 3. Get requester data
    const requesterDoc = await db.collection('users').doc(requesterId).get();
    const requesterData = requesterDoc.data()!;
    const businessOwnerId = requesterData.businessOwnerId || requesterId;

    // 4. Check permissions
    if (businessOwnerId !== requesterId) {
      const requesterTeamDoc = await db
        .collection('users')
        .doc(businessOwnerId)
        .collection('team')
        .doc(requesterId)
        .get();

      const requesterTeamData = requesterTeamDoc.data()!;

      if (!requesterTeamData.permissions?.canEditMemberRoles && requesterTeamData.role !== 'owner') {
        throw new HttpsError('permission-denied', 'Not authorized to update team members');
      }
    }

    // 5. Get member to update
    const memberTeamDoc = await db
      .collection('users')
      .doc(businessOwnerId)
      .collection('team')
      .doc(memberId)
      .get();

    if (!memberTeamDoc.exists) {
      throw new HttpsError('not-found', 'Team member not found');
    }

    const memberData = memberTeamDoc.data()!;

    // Cannot update owner
    if (memberData.role === 'owner') {
      throw new HttpsError('permission-denied', 'Cannot update business owner');
    }

    // 6. Prepare update data
    const updateData: any = {
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: requesterId,
    };

    if (role) {
      updateData.role = role;
    }

    if (permissions) {
      updateData.permissions = {
        ...memberData.permissions,
        ...permissions,
      };
    }

    // 7. Update member
    await memberTeamDoc.ref.update(updateData);

    // 8. Update user document if role changed
    if (role) {
      await db.collection('users').doc(memberId).update({
        teamRole: role,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    logger.info('Team member updated', { memberId, updates: updateData });

    // 9. Log activity
    await db.collection('activityLog').add({
      type: 'team_member_updated',
      updaterId: requesterId,
      memberId,
      businessId: businessOwnerId,
      changes: updateData,
      timestamp: FieldValue.serverTimestamp(),
    });

    // 10. Notify member
    await db.collection('notifications').add({
      userId: memberId,
      type: 'team_role_updated',
      title: 'Role Updated',
      message: role
        ? `Your role has been updated to ${role}`
        : 'Your permissions have been updated',
      data: {
        newRole: role,
        updatedBy: requesterId,
      },
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: 'Team member updated successfully',
    };
  } catch (error: any) {
    logger.error('Failed to update team member', { memberId, error });

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', `Failed to update team member: ${error.message}`);
  }
});

/**
 * Leave Team
 * 
 * Allows member to leave team voluntarily
 */
export const leaveTeam = onCall(async (request) => {
  // 1. Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = request.auth.uid;

  logger.info('User leaving team', { userId });

  try {
    // 2. Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data()!;

    if (!userData.businessOwnerId) {
      throw new HttpsError('failed-precondition', 'You are not a team member');
    }

    const businessOwnerId = userData.businessOwnerId;

    // 3. Check if user is owner (cannot leave own team)
    if (businessOwnerId === userId) {
      throw new HttpsError('permission-denied', 'Business owner cannot leave team');
    }

    // 4. Get team member doc
    const teamMemberDoc = await db
      .collection('users')
      .doc(businessOwnerId)
      .collection('team')
      .doc(userId)
      .get();

    if (!teamMemberDoc.exists) {
      throw new HttpsError('not-found', 'Team member record not found');
    }

    // 5. Update status
    await teamMemberDoc.ref.update({
      status: 'inactive',
      leftAt: FieldValue.serverTimestamp(),
      leftVoluntarily: true,
    });

    // 6. Update user document
    await userDoc.ref.update({
      businessOwnerId: FieldValue.delete(),
      teamRole: FieldValue.delete(),
      isTeamMember: false,
      updatedAt: FieldValue.serverTimestamp(),
    });

    logger.info('User left team', { userId, businessId: businessOwnerId });

    // 7. Notify business owner
    await db.collection('notifications').add({
      userId: businessOwnerId,
      type: 'team_member_left',
      title: 'Team Member Left',
      message: `${userData.displayName} has left your team`,
      data: {
        memberId: userId,
        memberName: userData.displayName,
      },
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: 'Successfully left the team',
    };
  } catch (error: any) {
    logger.error('Failed to leave team', { userId, error });

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', `Failed to leave team: ${error.message}`);
  }
});

/**
 * Send removal email
 */
async function sendRemovalEmail(memberId: string, businessId: string, reason?: string) {
  try {
    const [memberDoc, businessDoc] = await Promise.all([
      db.collection('users').doc(memberId).get(),
      db.collection('users').doc(businessId).get(),
    ]);

    const memberData = memberDoc.data();
    const businessData = businessDoc.data();

    if (!memberData || !businessData) {
      return;
    }

    await db.collection('mail').add({
      to: [memberData.email],
      template: {
        name: 'team-removal',
        data: {
          memberName: memberData.displayName,
          businessName: businessData.businessName || businessData.displayName,
          reason: reason || 'No specific reason provided',
        },
      },
    });

    logger.info('Removal email queued', { memberId, businessId });
  } catch (error) {
    logger.error('Failed to send removal email', { memberId, businessId, error });
  }
}
