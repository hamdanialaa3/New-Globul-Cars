"use strict";
// functions/src/messaging/sharedInbox.ts
// Shared Inbox and Message Assignment for Teams
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInternalNotes = exports.addInternalNote = exports.getSharedInbox = exports.assignConversation = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)();
/**
 * Assign conversation to a team member
 */
exports.assignConversation = (0, https_1.onCall)(async (request) => {
    var _a;
    const { auth, data } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { conversationId, assignedTo, notes } = data;
    if (!conversationId || !assignedTo) {
        throw new https_1.HttpsError('invalid-argument', 'Conversation ID and assignee are required');
    }
    try {
        // Get conversation
        const conversationDoc = await db.collection('conversations').doc(conversationId).get();
        if (!conversationDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Conversation not found');
        }
        const conversationData = conversationDoc.data();
        // Check if requester is owner or has permission
        let hasPermission = false;
        if ((conversationData === null || conversationData === void 0 ? void 0 : conversationData.sellerId) === auth.uid) {
            hasPermission = true;
        }
        else {
            // Check if requester is team member with permission
            const teamMemberDoc = await db
                .collection('users')
                .doc(conversationData === null || conversationData === void 0 ? void 0 : conversationData.sellerId)
                .collection('team')
                .doc(auth.uid)
                .get();
            if (teamMemberDoc.exists) {
                const teamMember = teamMemberDoc.data();
                hasPermission = ((_a = teamMember === null || teamMember === void 0 ? void 0 : teamMember.permissions) === null || _a === void 0 ? void 0 : _a.canManageMessages) === true;
            }
        }
        if (!hasPermission) {
            throw new https_1.HttpsError('permission-denied', 'You do not have permission to assign conversations');
        }
        // Verify assignee is team member
        const assigneeDoc = await db
            .collection('users')
            .doc(conversationData === null || conversationData === void 0 ? void 0 : conversationData.sellerId)
            .collection('team')
            .doc(assignedTo)
            .get();
        if (!assigneeDoc.exists && assignedTo !== (conversationData === null || conversationData === void 0 ? void 0 : conversationData.sellerId)) {
            throw new https_1.HttpsError('invalid-argument', 'Assignee is not a team member');
        }
        // Create assignment
        await db.collection('conversations').doc(conversationId).update({
            assignedTo,
            assignedBy: auth.uid,
            assignedAt: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
        });
        // Add internal note if provided
        if (notes) {
            await db.collection('internalNotes').add({
                conversationId,
                authorId: auth.uid,
                content: `Assigned to team member. Note: ${notes}`,
                isPrivate: true,
                createdAt: firestore_1.Timestamp.now(),
            });
        }
        // Notify assignee
        await db.collection('notifications').add({
            userId: assignedTo,
            type: 'conversation_assigned',
            title: 'New Conversation Assigned',
            message: `You have been assigned a new conversation`,
            data: { conversationId },
            read: false,
            createdAt: firestore_1.Timestamp.now(),
        });
        // Log activity
        await db.collection('activities').add({
            userId: auth.uid,
            type: 'conversation_assigned',
            description: `Assigned conversation to team member`,
            metadata: { conversationId, assignedTo },
            timestamp: firestore_1.Timestamp.now(),
        });
        return {
            success: true,
            message: 'Conversation assigned successfully',
        };
    }
    catch (error) {
        console.error('Error assigning conversation:', error);
        throw new https_1.HttpsError('internal', error.message);
    }
});
/**
 * Get shared inbox conversations (for team members)
 */
exports.getSharedInbox = (0, https_1.onCall)(async (request) => {
    var _a, _b, _c, _d;
    const { auth } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    try {
        // Check if user is dealer/company or team member
        const userDoc = await db.collection('users').doc(auth.uid).get();
        if (!userDoc.exists) {
            throw new https_1.HttpsError('not-found', 'User not found');
        }
        const userData = userDoc.data();
        let businessOwnerId = auth.uid;
        if ((userData === null || userData === void 0 ? void 0 : userData.profileType) === 'buyer') {
            throw new https_1.HttpsError('permission-denied', 'Only dealers/companies and their teams can access shared inbox');
        }
        // If team member, get business owner ID
        if ((userData === null || userData === void 0 ? void 0 : userData.isTeamMember) && (userData === null || userData === void 0 ? void 0 : userData.businessOwnerId)) {
            businessOwnerId = userData.businessOwnerId;
            // Check if has permission
            const teamMemberDoc = await db
                .collection('users')
                .doc(businessOwnerId)
                .collection('team')
                .doc(auth.uid)
                .get();
            if (!teamMemberDoc.exists || !((_b = (_a = teamMemberDoc.data()) === null || _a === void 0 ? void 0 : _a.permissions) === null || _b === void 0 ? void 0 : _b.canViewMessages)) {
                throw new https_1.HttpsError('permission-denied', 'You do not have permission to view messages');
            }
        }
        // Get all conversations for this business
        const conversationsSnapshot = await db
            .collection('conversations')
            .where('sellerId', '==', businessOwnerId)
            .orderBy('lastMessageAt', 'desc')
            .limit(50)
            .get();
        const conversations = [];
        for (const doc of conversationsSnapshot.docs) {
            const conv = Object.assign({ id: doc.id }, doc.data());
            // Get unread count
            const unreadSnapshot = await db
                .collection('messages')
                .where('conversationId', '==', doc.id)
                .where('read', '==', false)
                .where('recipientId', '==', businessOwnerId)
                .get();
            conv.unreadCount = unreadSnapshot.size;
            // Get assigned user details if assigned
            if (conv.assignedTo) {
                const assignedDoc = await db.collection('users').doc(conv.assignedTo).get();
                if (assignedDoc.exists) {
                    conv.assignedUser = {
                        id: assignedDoc.id,
                        displayName: (_c = assignedDoc.data()) === null || _c === void 0 ? void 0 : _c.displayName,
                        photoURL: (_d = assignedDoc.data()) === null || _d === void 0 ? void 0 : _d.photoURL,
                    };
                }
            }
            conversations.push(conv);
        }
        // Group conversations
        const grouped = {
            unassigned: conversations.filter((c) => !c.assignedTo),
            assignedToMe: conversations.filter((c) => c.assignedTo === auth.uid),
            assignedToOthers: conversations.filter((c) => c.assignedTo && c.assignedTo !== auth.uid),
            all: conversations,
        };
        return {
            success: true,
            conversations: grouped,
            stats: {
                total: conversations.length,
                unassigned: grouped.unassigned.length,
                assignedToMe: grouped.assignedToMe.length,
                assignedToOthers: grouped.assignedToOthers.length,
                totalUnread: conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
            },
        };
    }
    catch (error) {
        console.error('Error getting shared inbox:', error);
        throw new https_1.HttpsError('internal', error.message);
    }
});
/**
 * Add internal note to conversation
 */
exports.addInternalNote = (0, https_1.onCall)(async (request) => {
    var _a, _b, _c;
    const { auth, data } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { conversationId, content, isPrivate = true } = data;
    if (!conversationId || !content) {
        throw new https_1.HttpsError('invalid-argument', 'Conversation ID and content are required');
    }
    if (content.length > 500) {
        throw new https_1.HttpsError('invalid-argument', 'Note must be 500 characters or less');
    }
    try {
        // Get conversation
        const conversationDoc = await db.collection('conversations').doc(conversationId).get();
        if (!conversationDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Conversation not found');
        }
        const conversationData = conversationDoc.data();
        // Check permission
        let hasPermission = false;
        if ((conversationData === null || conversationData === void 0 ? void 0 : conversationData.sellerId) === auth.uid) {
            hasPermission = true;
        }
        else {
            const teamMemberDoc = await db
                .collection('users')
                .doc(conversationData === null || conversationData === void 0 ? void 0 : conversationData.sellerId)
                .collection('team')
                .doc(auth.uid)
                .get();
            if (teamMemberDoc.exists) {
                hasPermission = ((_b = (_a = teamMemberDoc.data()) === null || _a === void 0 ? void 0 : _a.permissions) === null || _b === void 0 ? void 0 : _b.canViewMessages) === true;
            }
        }
        if (!hasPermission) {
            throw new https_1.HttpsError('permission-denied', 'You do not have permission to add notes');
        }
        // Get author name
        const authorDoc = await db.collection('users').doc(auth.uid).get();
        const authorName = ((_c = authorDoc.data()) === null || _c === void 0 ? void 0 : _c.displayName) || 'Unknown';
        // Add note
        const noteRef = db.collection('internalNotes').doc();
        await noteRef.set({
            id: noteRef.id,
            conversationId,
            authorId: auth.uid,
            authorName,
            content,
            isPrivate,
            createdAt: firestore_1.Timestamp.now(),
        });
        return {
            success: true,
            noteId: noteRef.id,
            message: 'Internal note added successfully',
        };
    }
    catch (error) {
        console.error('Error adding internal note:', error);
        throw new https_1.HttpsError('internal', error.message);
    }
});
/**
 * Get internal notes for a conversation
 */
exports.getInternalNotes = (0, https_1.onCall)(async (request) => {
    var _a, _b;
    const { auth, data } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { conversationId } = data;
    if (!conversationId) {
        throw new https_1.HttpsError('invalid-argument', 'Conversation ID is required');
    }
    try {
        // Get conversation
        const conversationDoc = await db.collection('conversations').doc(conversationId).get();
        if (!conversationDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Conversation not found');
        }
        const conversationData = conversationDoc.data();
        // Check permission
        let hasPermission = false;
        if ((conversationData === null || conversationData === void 0 ? void 0 : conversationData.sellerId) === auth.uid) {
            hasPermission = true;
        }
        else {
            const teamMemberDoc = await db
                .collection('users')
                .doc(conversationData === null || conversationData === void 0 ? void 0 : conversationData.sellerId)
                .collection('team')
                .doc(auth.uid)
                .get();
            if (teamMemberDoc.exists) {
                hasPermission = ((_b = (_a = teamMemberDoc.data()) === null || _a === void 0 ? void 0 : _a.permissions) === null || _b === void 0 ? void 0 : _b.canViewMessages) === true;
            }
        }
        if (!hasPermission) {
            throw new https_1.HttpsError('permission-denied', 'You do not have permission to view notes');
        }
        // Get notes
        const notesSnapshot = await db
            .collection('internalNotes')
            .where('conversationId', '==', conversationId)
            .orderBy('createdAt', 'desc')
            .get();
        const notes = notesSnapshot.docs.map((doc) => doc.data());
        return {
            success: true,
            notes,
            count: notes.length,
        };
    }
    catch (error) {
        console.error('Error getting internal notes:', error);
        throw new https_1.HttpsError('internal', error.message);
    }
});
//# sourceMappingURL=sharedInbox.js.map