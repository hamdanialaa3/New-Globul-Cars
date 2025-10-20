"use strict";
// functions/src/team/removeMember.ts
// Cloud Function: Remove Team Member
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
exports.leaveTeam = exports.updateMember = exports.removeMember = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const db = (0, firestore_1.getFirestore)();
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
exports.removeMember = (0, https_1.onCall)(async (request) => {
    var _a;
    const { memberId, reason } = request.data;
    // 1. Check authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const requesterId = request.auth.uid;
    // 2. Validate inputs
    if (!memberId) {
        throw new https_1.HttpsError('invalid-argument', 'memberId is required');
    }
    // Cannot remove yourself
    if (memberId === requesterId) {
        throw new https_1.HttpsError('invalid-argument', 'Cannot remove yourself. Use leave team instead.');
    }
    logger.info('Removing team member', { requesterId, memberId, reason });
    try {
        // 3. Get requester data
        const requesterDoc = await db.collection('users').doc(requesterId).get();
        if (!requesterDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Requester not found');
        }
        const requesterData = requesterDoc.data();
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
                throw new https_1.HttpsError('permission-denied', 'Not authorized');
            }
            const requesterTeamData = requesterTeamDoc.data();
            if (!((_a = requesterTeamData.permissions) === null || _a === void 0 ? void 0 : _a.canRemoveMembers) && requesterTeamData.role !== 'owner') {
                throw new https_1.HttpsError('permission-denied', 'You do not have permission to remove team members');
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
            throw new https_1.HttpsError('not-found', 'Team member not found');
        }
        const memberData = memberTeamDoc.data();
        // Cannot remove owner
        if (memberData.role === 'owner') {
            throw new https_1.HttpsError('permission-denied', 'Cannot remove business owner');
        }
        // 6. Update member status to inactive
        await memberTeamDoc.ref.update({
            status: 'inactive',
            removedAt: firestore_1.FieldValue.serverTimestamp(),
            removedBy: requesterId,
            removalReason: reason || 'No reason provided',
        });
        // 7. Update member's user document
        await db.collection('users').doc(memberId).update({
            businessOwnerId: firestore_1.FieldValue.delete(),
            teamRole: firestore_1.FieldValue.delete(),
            isTeamMember: false,
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        logger.info('Team member removed', { memberId, businessId: businessOwnerId });
        // 8. Log activity
        await db.collection('activityLog').add({
            type: 'team_member_removed',
            removerId: requesterId,
            memberId,
            businessId: businessOwnerId,
            reason,
            timestamp: firestore_1.FieldValue.serverTimestamp(),
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
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
        // 10. Send removal email
        await sendRemovalEmail(memberId, businessOwnerId, reason);
        return {
            success: true,
            message: 'Team member removed successfully',
        };
    }
    catch (error) {
        logger.error('Failed to remove team member', { memberId, error });
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', `Failed to remove team member: ${error.message}`);
    }
});
/**
 * Update Team Member Role/Permissions
 *
 * Updates member's role or permissions
 */
exports.updateMember = (0, https_1.onCall)(async (request) => {
    var _a;
    const { memberId, role, permissions } = request.data;
    // 1. Check authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const requesterId = request.auth.uid;
    // 2. Validate inputs
    if (!memberId) {
        throw new https_1.HttpsError('invalid-argument', 'memberId is required');
    }
    if (!role && !permissions) {
        throw new https_1.HttpsError('invalid-argument', 'Either role or permissions must be provided');
    }
    logger.info('Updating team member', { requesterId, memberId, role, permissions });
    try {
        // 3. Get requester data
        const requesterDoc = await db.collection('users').doc(requesterId).get();
        const requesterData = requesterDoc.data();
        const businessOwnerId = requesterData.businessOwnerId || requesterId;
        // 4. Check permissions
        if (businessOwnerId !== requesterId) {
            const requesterTeamDoc = await db
                .collection('users')
                .doc(businessOwnerId)
                .collection('team')
                .doc(requesterId)
                .get();
            const requesterTeamData = requesterTeamDoc.data();
            if (!((_a = requesterTeamData.permissions) === null || _a === void 0 ? void 0 : _a.canEditMemberRoles) && requesterTeamData.role !== 'owner') {
                throw new https_1.HttpsError('permission-denied', 'Not authorized to update team members');
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
            throw new https_1.HttpsError('not-found', 'Team member not found');
        }
        const memberData = memberTeamDoc.data();
        // Cannot update owner
        if (memberData.role === 'owner') {
            throw new https_1.HttpsError('permission-denied', 'Cannot update business owner');
        }
        // 6. Prepare update data
        const updateData = {
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
            updatedBy: requesterId,
        };
        if (role) {
            updateData.role = role;
        }
        if (permissions) {
            updateData.permissions = Object.assign(Object.assign({}, memberData.permissions), permissions);
        }
        // 7. Update member
        await memberTeamDoc.ref.update(updateData);
        // 8. Update user document if role changed
        if (role) {
            await db.collection('users').doc(memberId).update({
                teamRole: role,
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
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
            timestamp: firestore_1.FieldValue.serverTimestamp(),
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
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
        return {
            success: true,
            message: 'Team member updated successfully',
        };
    }
    catch (error) {
        logger.error('Failed to update team member', { memberId, error });
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', `Failed to update team member: ${error.message}`);
    }
});
/**
 * Leave Team
 *
 * Allows member to leave team voluntarily
 */
exports.leaveTeam = (0, https_1.onCall)(async (request) => {
    // 1. Check authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = request.auth.uid;
    logger.info('User leaving team', { userId });
    try {
        // 2. Get user data
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        if (!userData.businessOwnerId) {
            throw new https_1.HttpsError('failed-precondition', 'You are not a team member');
        }
        const businessOwnerId = userData.businessOwnerId;
        // 3. Check if user is owner (cannot leave own team)
        if (businessOwnerId === userId) {
            throw new https_1.HttpsError('permission-denied', 'Business owner cannot leave team');
        }
        // 4. Get team member doc
        const teamMemberDoc = await db
            .collection('users')
            .doc(businessOwnerId)
            .collection('team')
            .doc(userId)
            .get();
        if (!teamMemberDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Team member record not found');
        }
        // 5. Update status
        await teamMemberDoc.ref.update({
            status: 'inactive',
            leftAt: firestore_1.FieldValue.serverTimestamp(),
            leftVoluntarily: true,
        });
        // 6. Update user document
        await userDoc.ref.update({
            businessOwnerId: firestore_1.FieldValue.delete(),
            teamRole: firestore_1.FieldValue.delete(),
            isTeamMember: false,
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
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
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
        return {
            success: true,
            message: 'Successfully left the team',
        };
    }
    catch (error) {
        logger.error('Failed to leave team', { userId, error });
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', `Failed to leave team: ${error.message}`);
    }
});
/**
 * Send removal email
 */
async function sendRemovalEmail(memberId, businessId, reason) {
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
    }
    catch (error) {
        logger.error('Failed to send removal email', { memberId, businessId, error });
    }
}
//# sourceMappingURL=removeMember.js.map