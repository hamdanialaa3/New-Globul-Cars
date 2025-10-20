"use strict";
// functions/src/team/inviteMember.ts
// Cloud Function: Invite Team Member
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
exports.cancelInvitation = exports.resendInvitation = exports.inviteMember = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const permissions_1 = require("./permissions");
const db = (0, firestore_1.getFirestore)();
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
exports.inviteMember = (0, https_1.onCall)(async (request) => {
    var _a;
    const { email, role, customPermissions } = request.data;
    // 1. Check authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const inviterId = request.auth.uid;
    // 2. Validate inputs
    if (!email || !role) {
        throw new https_1.HttpsError('invalid-argument', 'email and role are required');
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new https_1.HttpsError('invalid-argument', 'Invalid email format');
    }
    // Validate role
    const validRoles = ['admin', 'manager', 'sales', 'support'];
    if (!validRoles.includes(role)) {
        throw new https_1.HttpsError('invalid-argument', 'Invalid role. Must be: admin, manager, sales, or support');
    }
    logger.info('Inviting team member', { inviterId, email, role });
    try {
        // 3. Get inviter's data and check permissions
        const inviterDoc = await db.collection('users').doc(inviterId).get();
        if (!inviterDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Inviter not found');
        }
        const inviterData = inviterDoc.data();
        // Check if inviter is dealer or company
        if (!['dealer', 'company'].includes(inviterData.profileType)) {
            throw new https_1.HttpsError('permission-denied', 'Only dealers and companies can invite team members');
        }
        // Check if inviter has permission to invite members
        const inviterTeamDoc = await db
            .collection('users')
            .doc(inviterData.businessOwnerId || inviterId)
            .collection('team')
            .doc(inviterId)
            .get();
        if (inviterTeamDoc.exists) {
            const inviterTeamData = inviterTeamDoc.data();
            if (!((_a = inviterTeamData.permissions) === null || _a === void 0 ? void 0 : _a.canInviteMembers) && inviterTeamData.role !== 'owner') {
                throw new https_1.HttpsError('permission-denied', 'You do not have permission to invite team members');
            }
        }
        // Determine business owner (might be inviter or their owner)
        const businessOwnerId = inviterData.businessOwnerId || inviterId;
        const businessOwnerDoc = await db.collection('users').doc(businessOwnerId).get();
        const businessOwnerData = businessOwnerDoc.data();
        // 4. Check if email is already invited or is a team member
        const existingInvitationsSnapshot = await db
            .collection('teamInvitations')
            .where('businessId', '==', businessOwnerId)
            .where('email', '==', email.toLowerCase())
            .where('status', '==', 'pending')
            .get();
        if (!existingInvitationsSnapshot.empty) {
            throw new https_1.HttpsError('already-exists', 'This email already has a pending invitation');
        }
        // Check if user is already a team member
        const existingMembersSnapshot = await db
            .collection('users')
            .doc(businessOwnerId)
            .collection('team')
            .where('email', '==', email.toLowerCase())
            .get();
        if (!existingMembersSnapshot.empty) {
            throw new https_1.HttpsError('already-exists', 'This user is already a team member');
        }
        // 5. Get permissions for role
        const rolePermissions = (0, permissions_1.getDefaultPermissions)(role);
        const finalPermissions = (0, permissions_1.mergePermissions)(rolePermissions, customPermissions);
        // 6. Create invitation
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
        const invitation = {
            email: email.toLowerCase(),
            role,
            permissions: finalPermissions,
            invitedBy: inviterId,
            invitedByName: inviterData.displayName || 'Team Admin',
            businessName: businessOwnerData.businessName || businessOwnerData.displayName || 'Business',
            businessId: businessOwnerId,
            status: 'pending',
            invitedAt: firestore_1.FieldValue.serverTimestamp(),
            expiresAt: expiresAt,
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
            timestamp: firestore_1.FieldValue.serverTimestamp(),
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
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
        return {
            success: true,
            invitationId: invitationRef.id,
            message: `Invitation sent to ${email}`,
            expiresAt: expiresAt.toISOString(),
        };
    }
    catch (error) {
        logger.error('Failed to invite team member', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', `Failed to invite team member: ${error.message}`);
    }
});
/**
 * Send invitation email
 */
async function sendInvitationEmail(invitationId, invitation) {
    try {
        const invitationLink = `https://globul.net/team/accept-invite/${invitationId}`;
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
    }
    catch (error) {
        logger.error('Failed to send invitation email', { invitationId, error });
    }
}
/**
 * Resend Team Invitation
 *
 * Resends invitation email if still pending
 */
exports.resendInvitation = (0, https_1.onCall)(async (request) => {
    // 1. Check authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { invitationId } = request.data;
    if (!invitationId) {
        throw new https_1.HttpsError('invalid-argument', 'invitationId is required');
    }
    logger.info('Resending team invitation', { invitationId, userId: request.auth.uid });
    try {
        // 2. Get invitation
        const invitationDoc = await db.collection('teamInvitations').doc(invitationId).get();
        if (!invitationDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Invitation not found');
        }
        const invitation = invitationDoc.data();
        // 3. Check if user has permission (must be inviter or business owner)
        if (invitation.invitedBy !== request.auth.uid &&
            invitation.businessId !== request.auth.uid) {
            throw new https_1.HttpsError('permission-denied', 'Not authorized to resend this invitation');
        }
        // 4. Check invitation status
        if (invitation.status !== 'pending') {
            throw new https_1.HttpsError('failed-precondition', `Invitation is ${invitation.status}`);
        }
        // 5. Check if expired
        const now = new Date();
        const expiresAt = invitation.expiresAt.toDate();
        if (now > expiresAt) {
            await invitationDoc.ref.update({
                status: 'expired',
            });
            throw new https_1.HttpsError('failed-precondition', 'Invitation has expired');
        }
        // 6. Resend email
        await sendInvitationEmail(invitationId, invitation);
        logger.info('Invitation resent', { invitationId });
        return {
            success: true,
            message: 'Invitation resent',
        };
    }
    catch (error) {
        logger.error('Failed to resend invitation', { invitationId, error });
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', `Failed to resend invitation: ${error.message}`);
    }
});
/**
 * Cancel Team Invitation
 *
 * Cancels pending invitation
 */
exports.cancelInvitation = (0, https_1.onCall)(async (request) => {
    // 1. Check authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { invitationId } = request.data;
    if (!invitationId) {
        throw new https_1.HttpsError('invalid-argument', 'invitationId is required');
    }
    logger.info('Canceling team invitation', { invitationId, userId: request.auth.uid });
    try {
        // 2. Get invitation
        const invitationDoc = await db.collection('teamInvitations').doc(invitationId).get();
        if (!invitationDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Invitation not found');
        }
        const invitation = invitationDoc.data();
        // 3. Check permission
        if (invitation.invitedBy !== request.auth.uid &&
            invitation.businessId !== request.auth.uid) {
            throw new https_1.HttpsError('permission-denied', 'Not authorized to cancel this invitation');
        }
        // 4. Check status
        if (invitation.status !== 'pending') {
            throw new https_1.HttpsError('failed-precondition', `Invitation is already ${invitation.status}`);
        }
        // 5. Update status
        await invitationDoc.ref.update({
            status: 'expired',
            canceledAt: firestore_1.FieldValue.serverTimestamp(),
            canceledBy: request.auth.uid,
        });
        logger.info('Invitation canceled', { invitationId });
        return {
            success: true,
            message: 'Invitation canceled',
        };
    }
    catch (error) {
        logger.error('Failed to cancel invitation', { invitationId, error });
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', `Failed to cancel invitation: ${error.message}`);
    }
});
//# sourceMappingURL=inviteMember.js.map