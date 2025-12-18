// functions/src/messaging/sharedInbox.ts
// Shared Inbox and Message Assignment for Teams

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { AssignConversationRequest, AddInternalNoteRequest } from './types';

const db = getFirestore();

/**
 * Assign conversation to a team member
 */
export const assignConversation = onCall<AssignConversationRequest>(async (request) => {
  const { auth, data } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { conversationId, assignedTo, notes } = data;

  if (!conversationId || !assignedTo) {
    throw new HttpsError('invalid-argument', 'Conversation ID and assignee are required');
  }

  try {
    // Get conversation
    const conversationDoc = await db.collection('conversations').doc(conversationId).get();
    if (!conversationDoc.exists) {
      throw new HttpsError('not-found', 'Conversation not found');
    }

    const conversationData = conversationDoc.data();

    // Check if requester is owner or has permission
    let hasPermission = false;
    if (conversationData?.sellerId === auth.uid) {
      hasPermission = true;
    } else {
      // Check if requester is team member with permission
      const teamMemberDoc = await db
        .collection('users')
        .doc(conversationData?.sellerId)
        .collection('team')
        .doc(auth.uid)
        .get();

      if (teamMemberDoc.exists) {
        const teamMember = teamMemberDoc.data();
        hasPermission = teamMember?.permissions?.canManageMessages === true;
      }
    }

    if (!hasPermission) {
      throw new HttpsError('permission-denied', 'You do not have permission to assign conversations');
    }

    // Verify assignee is team member
    const assigneeDoc = await db
      .collection('users')
      .doc(conversationData?.sellerId)
      .collection('team')
      .doc(assignedTo)
      .get();

    if (!assigneeDoc.exists && assignedTo !== conversationData?.sellerId) {
      throw new HttpsError('invalid-argument', 'Assignee is not a team member');
    }

    // Create assignment
    await db.collection('conversations').doc(conversationId).update({
      assignedTo,
      assignedBy: auth.uid,
      assignedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Add internal note if provided
    if (notes) {
      await db.collection('internalNotes').add({
        conversationId,
        authorId: auth.uid,
        content: `Assigned to team member. Note: ${notes}`,
        isPrivate: true,
        createdAt: Timestamp.now(),
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
      createdAt: Timestamp.now(),
    });

    // Log activity
    await db.collection('activities').add({
      userId: auth.uid,
      type: 'conversation_assigned',
      description: `Assigned conversation to team member`,
      metadata: { conversationId, assignedTo },
      timestamp: Timestamp.now(),
    });

    return {
      success: true,
      message: 'Conversation assigned successfully',
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Error assigning conversation:', err.message);
    throw new HttpsError('internal', err.message);
  }
});

/**
 * Get shared inbox conversations (for team members)
 */
export const getSharedInbox = onCall(async (request) => {
  const { auth } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    // Check if user is dealer/company or team member
    const userDoc = await db.collection('users').doc(auth.uid).get();
    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    let businessOwnerId = auth.uid;

    if (userData?.profileType === 'buyer') {
      throw new HttpsError('permission-denied', 'Only dealers/companies and their teams can access shared inbox');
    }

    // If team member, get business owner ID
    if (userData?.isTeamMember && userData?.businessOwnerId) {
      businessOwnerId = userData.businessOwnerId;

      // Check if has permission
      const teamMemberDoc = await db
        .collection('users')
        .doc(businessOwnerId)
        .collection('team')
        .doc(auth.uid)
        .get();

      if (!teamMemberDoc.exists || !teamMemberDoc.data()?.permissions?.canViewMessages) {
        throw new HttpsError('permission-denied', 'You do not have permission to view messages');
      }
    }

    // Get all conversations for this business
    const conversationsSnapshot = await db
      .collection('conversations')
      .where('sellerId', '==', businessOwnerId)
      .orderBy('lastMessageAt', 'desc')
      .limit(50)
      .get();

    const conversations: Record<string, unknown>[] = [];
    for (const doc of conversationsSnapshot.docs) {
      const conv: Record<string, unknown> = { id: doc.id, ...doc.data() };

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
            displayName: assignedDoc.data()?.displayName,
            photoURL: assignedDoc.data()?.photoURL,
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
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Error getting shared inbox:', err.message);
    throw new HttpsError('internal', err.message);
  }
});

/**
 * Add internal note to conversation
 */
export const addInternalNote = onCall<AddInternalNoteRequest>(async (request) => {
  const { auth, data } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { conversationId, content, isPrivate = true } = data;

  if (!conversationId || !content) {
    throw new HttpsError('invalid-argument', 'Conversation ID and content are required');
  }

  if (content.length > 500) {
    throw new HttpsError('invalid-argument', 'Note must be 500 characters or less');
  }

  try {
    // Get conversation
    const conversationDoc = await db.collection('conversations').doc(conversationId).get();
    if (!conversationDoc.exists) {
      throw new HttpsError('not-found', 'Conversation not found');
    }

    const conversationData = conversationDoc.data();

    // Check permission
    let hasPermission = false;
    if (conversationData?.sellerId === auth.uid) {
      hasPermission = true;
    } else {
      const teamMemberDoc = await db
        .collection('users')
        .doc(conversationData?.sellerId)
        .collection('team')
        .doc(auth.uid)
        .get();

      if (teamMemberDoc.exists) {
        hasPermission = teamMemberDoc.data()?.permissions?.canViewMessages === true;
      }
    }

    if (!hasPermission) {
      throw new HttpsError('permission-denied', 'You do not have permission to add notes');
    }

    // Get author name
    const authorDoc = await db.collection('users').doc(auth.uid).get();
    const authorName = authorDoc.data()?.displayName || 'Unknown';

    // Add note
    const noteRef = db.collection('internalNotes').doc();
    await noteRef.set({
      id: noteRef.id,
      conversationId,
      authorId: auth.uid,
      authorName,
      content,
      isPrivate,
      createdAt: Timestamp.now(),
    });

    return {
      success: true,
      noteId: noteRef.id,
      message: 'Internal note added successfully',
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Error adding internal note:', err.message);
    throw new HttpsError('internal', err.message);
  }
});

/**
 * Get internal notes for a conversation
 */
export const getInternalNotes = onCall<{ conversationId: string }>(async (request) => {
  const { auth, data } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { conversationId } = data;

  if (!conversationId) {
    throw new HttpsError('invalid-argument', 'Conversation ID is required');
  }

  try {
    // Get conversation
    const conversationDoc = await db.collection('conversations').doc(conversationId).get();
    if (!conversationDoc.exists) {
      throw new HttpsError('not-found', 'Conversation not found');
    }

    const conversationData = conversationDoc.data();

    // Check permission
    let hasPermission = false;
    if (conversationData?.sellerId === auth.uid) {
      hasPermission = true;
    } else {
      const teamMemberDoc = await db
        .collection('users')
        .doc(conversationData?.sellerId)
        .collection('team')
        .doc(auth.uid)
        .get();

      if (teamMemberDoc.exists) {
        hasPermission = teamMemberDoc.data()?.permissions?.canViewMessages === true;
      }
    }

    if (!hasPermission) {
      throw new HttpsError('permission-denied', 'You do not have permission to view notes');
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
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Error getting internal notes:', err.message);
    throw new HttpsError('internal', err.message);
  }
});
