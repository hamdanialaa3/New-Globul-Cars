"use strict";
// functions/src/team/acceptInvite.ts
// Cloud Function: Accept Team Invitation
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
exports.declineInvite = exports.acceptInvite = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const db = (0, firestore_1.getFirestore)();
/**
 * Accept Team Invitation
 *
 * Accepts pending invitation and adds user to team
 *
 * @param invitationId - Invitation ID to accept
 *
 * @returns Success status and team member ID
 */
exports.acceptInvite = (0, https_1.onCall)(async (request) => {
    var _a;
    const { invitationId } = request.data;
    // 1. Check authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = request.auth.uid;
    // 2. Validate inputs
    if (!invitationId) {
        throw new https_1.HttpsError('invalid-argument', 'invitationId is required');
    }
    logger.info('Accepting team invitation', { invitationId, userId });
    try {
        // 3. Get invitation
        const invitationDoc = await db.collection('teamInvitations').doc(invitationId).get();
        if (!invitationDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Invitation not found');
        }
        const invitation = invitationDoc.data();
        // 4. Validate invitation status
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
        // 6. Get user data
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            throw new https_1.HttpsError('not-found', 'User not found');
        }
        const userData = userDoc.data();
        // 7. Verify email matches
        if (((_a = userData.email) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== invitation.email) {
            throw new https_1.HttpsError('permission-denied', 'This invitation was sent to a different email address');
        }
        // 8. Check if user is already a team member
        const existingMemberDoc = await db
            .collection('users')
            .doc(invitation.businessId)
            .collection('team')
            .doc(userId)
            .get();
        if (existingMemberDoc.exists) {
            throw new https_1.HttpsError('already-exists', 'You are already a team member');
        }
        // 9. Create team member document
        const teamMember = {
            userId,
            email: userData.email,
            displayName: userData.displayName || 'Team Member',
            role: invitation.role,
            permissions: invitation.permissions,
            invitedBy: invitation.invitedBy,
            invitedAt: invitation.invitedAt,
            joinedAt: firestore_1.FieldValue.serverTimestamp(),
            status: 'active',
            lastActive: firestore_1.FieldValue.serverTimestamp(),
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
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        // 11. Update invitation status
        await invitationDoc.ref.update({
            status: 'accepted',
            acceptedAt: firestore_1.FieldValue.serverTimestamp(),
            acceptedBy: userId,
        });
        // 12. Log activity
        await db.collection('activityLog').add({
            type: 'team_member_joined',
            userId,
            businessId: invitation.businessId,
            role: invitation.role,
            invitationId,
            timestamp: firestore_1.FieldValue.serverTimestamp(),
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
            createdAt: firestore_1.FieldValue.serverTimestamp(),
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
                createdAt: firestore_1.FieldValue.serverTimestamp(),
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
    }
    catch (error) {
        logger.error('Failed to accept invitation', { invitationId, error });
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', `Failed to accept invitation: ${error.message}`);
    }
});
/**
 * Decline Team Invitation
 *
 * Declines invitation without joining team
 */
exports.declineInvite = (0, https_1.onCall)(async (request) => {
    var _a;
    const { invitationId } = request.data;
    // 1. Check authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = request.auth.uid;
    // 2. Validate inputs
    if (!invitationId) {
        throw new https_1.HttpsError('invalid-argument', 'invitationId is required');
    }
    logger.info('Declining team invitation', { invitationId, userId });
    try {
        // 3. Get invitation
        const invitationDoc = await db.collection('teamInvitations').doc(invitationId).get();
        if (!invitationDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Invitation not found');
        }
        const invitation = invitationDoc.data();
        // 4. Validate status
        if (invitation.status !== 'pending') {
            throw new https_1.HttpsError('failed-precondition', `Invitation is ${invitation.status}`);
        }
        // 5. Get user data
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        // 6. Verify email matches
        if (((_a = userData === null || userData === void 0 ? void 0 : userData.email) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== invitation.email) {
            throw new https_1.HttpsError('permission-denied', 'This invitation was sent to a different email address');
        }
        // 7. Update invitation status
        await invitationDoc.ref.update({
            status: 'declined',
            declinedAt: firestore_1.FieldValue.serverTimestamp(),
            declinedBy: userId,
        });
        logger.info('Invitation declined', { invitationId, userId });
        // 8. Notify inviter
        await db.collection('notifications').add({
            userId: invitation.invitedBy,
            type: 'team_invitation_declined',
            title: 'Invitation Declined',
            message: `${(userData === null || userData === void 0 ? void 0 : userData.displayName) || invitation.email} declined your team invitation`,
            data: {
                invitationId,
                email: invitation.email,
                role: invitation.role,
            },
            read: false,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
        return {
            success: true,
            message: 'Invitation declined',
        };
    }
    catch (error) {
        logger.error('Failed to decline invitation', { invitationId, error });
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', `Failed to decline invitation: ${error.message}`);
    }
});
/**
 * Send welcome email to new team member
 */
async function sendWelcomeEmail(userId, businessId) {
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
                    dashboardUrl: 'https://globul.net/dashboard',
                },
            },
        });
        logger.info('Welcome email queued', { userId, businessId });
    }
    catch (error) {
        logger.error('Failed to send welcome email', { userId, businessId, error });
    }
}
//# sourceMappingURL=acceptInvite.js.map