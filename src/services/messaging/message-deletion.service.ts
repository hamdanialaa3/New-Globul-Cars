/**
 * Message Deletion Service
 * ========================
 * Soft-delete messages while preserving metadata
 * 
 * @gpt-suggestion Phase 5.1 - Message deletion feature
 * @author Implementation - January 14, 2026
 */

import { ref, update, get } from 'firebase/database';
import { getDatabase } from 'firebase/database';
import { logger } from '@/services/logger-service';

/**
 * Deletion scope - who can see the deletion
 */
export type DeletionScope = 'me' | 'everyone';

/**
 * Deleted message metadata (preserved for audit)
 */
export interface DeletedMessageMetadata {
  deletedAt: number;
  deletedBy: number; // Numeric user ID
  deletionScope: DeletionScope;
  originalContent: string; // Encrypted/hashed in production
  originalType: string;
  originalTimestamp: number;
}

/**
 * Delete message (soft-delete)
 * 
 * @param channelId The channel containing the message
 * @param messageId The message to delete
 * @param deletedByNumericId The numeric ID of user deleting
 * @param scope 'me' = only I can't see it, 'everyone' = nobody can see it
 * 
 * @description
 * Soft-delete approach:
 * - 'me': Adds user to deletedFor array (message hidden for this user only)
 * - 'everyone': Marks message as deleted globally (content replaced with placeholder)
 */
export async function deleteMessage(
  channelId: string,
  messageId: string,
  deletedByNumericId: number,
  scope: DeletionScope = 'me'
): Promise<void> {
  if (!channelId || !messageId || !deletedByNumericId) {
    throw new Error('Invalid parameters for deleteMessage');
  }
  
  try {
    const db = getDatabase();
    const messageRef = ref(db, `messages/${channelId}/${messageId}`);
    
    // Get current message
    const snapshot = await get(messageRef);
    
    if (!snapshot.exists()) {
      throw new Error('Message not found');
    }
    
    const message = snapshot.val();
    
    // Check permissions: only sender can delete for everyone
    if (scope === 'everyone' && message.senderNumericId !== deletedByNumericId) {
      throw new Error('PERMISSION_DENIED: Only message sender can delete for everyone');
    }
    
    const now = Date.now();
    
    if (scope === 'me') {
      // Soft-delete for current user only
      const deletedFor = message.deletedFor || [];
      
      if (deletedFor.includes(deletedByNumericId)) {
        logger.warn('Message already deleted for this user', { channelId, messageId, userId: deletedByNumericId });
        return;
      }
      
      await update(messageRef, {
        deletedFor: [...deletedFor, deletedByNumericId],
        [`deletionMetadata/${deletedByNumericId}`]: {
          deletedAt: now,
          scope: 'me'
        }
      });
      
      logger.info('[MessageDeletion] Message deleted for user', {
        channelId,
        messageId,
        userId: deletedByNumericId,
        scope
      });
      
    } else {
      // Delete for everyone (replace content)
      const metadata: DeletedMessageMetadata = {
        deletedAt: now,
        deletedBy: deletedByNumericId,
        deletionScope: 'everyone',
        originalContent: message.content || '',
        originalType: message.type || 'text',
        originalTimestamp: message.timestamp || now
      };
      
      await update(messageRef, {
        content: '[Message deleted]',
        deleted: true,
        deletedAt: now,
        deletedBy: deletedByNumericId,
        deletionMetadata: metadata,
        // Preserve other fields for audit
        type: message.type,
        senderNumericId: message.senderNumericId,
        timestamp: message.timestamp
      });
      
      logger.info('[MessageDeletion] Message deleted for everyone', {
        channelId,
        messageId,
        deletedBy: deletedByNumericId
      });
    }
    
  } catch (error) {
    logger.error('[MessageDeletion] Failed to delete message', error as Error, {
      channelId,
      messageId,
      userId: deletedByNumericId,
      scope
    });
    throw error;
  }
}

/**
 * Check if message is deleted for a specific user
 * 
 * @param message The message object
 * @param userNumericId The user's numeric ID
 * @returns True if message is deleted for this user
 */
export function isMessageDeletedForUser(
  message: any,
  userNumericId: number
): boolean {
  // Global deletion
  if (message.deleted === true) {
    return true;
  }
  
  // User-specific deletion
  if (message.deletedFor && Array.isArray(message.deletedFor)) {
    return message.deletedFor.includes(userNumericId);
  }
  
  return false;
}

/**
 * Filter deleted messages from an array
 * 
 * @param messages Array of messages
 * @param userNumericId The user's numeric ID
 * @returns Filtered messages (non-deleted for this user)
 */
export function filterDeletedMessages(
  messages: any[],
  userNumericId: number
): any[] {
  return messages.filter(msg => !isMessageDeletedForUser(msg, userNumericId));
}

/**
 * Undo message deletion (restore)
 * Only works for 'me' scope within 5 minutes
 * 
 * @param channelId The channel ID
 * @param messageId The message ID
 * @param userNumericId The user's numeric ID
 */
export async function undoMessageDeletion(
  channelId: string,
  messageId: string,
  userNumericId: number
): Promise<void> {
  try {
    const db = getDatabase();
    const messageRef = ref(db, `messages/${channelId}/${messageId}`);
    
    const snapshot = await get(messageRef);
    
    if (!snapshot.exists()) {
      throw new Error('Message not found');
    }
    
    const message = snapshot.val();
    
    // Check if deleted globally (cannot undo)
    if (message.deleted === true) {
      throw new Error('CANNOT_UNDO: Message was deleted for everyone');
    }
    
    // Check if deleted for this user
    if (!message.deletedFor || !message.deletedFor.includes(userNumericId)) {
      throw new Error('Message was not deleted by this user');
    }
    
    // Check 5-minute window
    const deletionTime = message.deletionMetadata?.[userNumericId]?.deletedAt;
    if (deletionTime && Date.now() - deletionTime > 5 * 60 * 1000) {
      throw new Error('UNDO_EXPIRED: Can only undo deletion within 5 minutes');
    }
    
    // Remove user from deletedFor array
    const updatedDeletedFor = message.deletedFor.filter(
      (id: number) => id !== userNumericId
    );
    
    await update(messageRef, {
      deletedFor: updatedDeletedFor.length > 0 ? updatedDeletedFor : null,
      [`deletionMetadata/${userNumericId}`]: null
    });
    
    logger.info('[MessageDeletion] Deletion undone', {
      channelId,
      messageId,
      userId: userNumericId
    });
    
  } catch (error) {
    logger.error('[MessageDeletion] Failed to undo deletion', error as Error, {
      channelId,
      messageId,
      userId: userNumericId
    });
    throw error;
  }
}

/**
 * Bulk delete messages in a channel (admin only)
 * 
 * @param channelId The channel ID
 * @param messageIds Array of message IDs to delete
 * @param adminNumericId The admin's numeric ID
 */
export async function bulkDeleteMessages(
  channelId: string,
  messageIds: string[],
  adminNumericId: number
): Promise<{ deleted: number; failed: number }> {
  let deleted = 0;
  let failed = 0;
  
  for (const messageId of messageIds) {
    try {
      await deleteMessage(channelId, messageId, adminNumericId, 'everyone');
      deleted++;
    } catch (error) {
      logger.error('[MessageDeletion] Bulk delete failed for message', error as Error, {
        channelId,
        messageId
      });
      failed++;
    }
  }
  
  logger.info('[MessageDeletion] Bulk delete completed', {
    channelId,
    total: messageIds.length,
    deleted,
    failed
  });
  
  return { deleted, failed };
}

/**
 * Get deletion statistics for a channel (admin)
 * 
 * @param channelId The channel ID
 * @returns Deletion stats
 */
export async function getChannelDeletionStats(channelId: string): Promise<{
  totalMessages: number;
  deletedGlobally: number;
  deletedByUser: Record<number, number>;
}> {
  try {
    const db = getDatabase();
    const messagesRef = ref(db, `messages/${channelId}`);
    
    const snapshot = await get(messagesRef);
    
    if (!snapshot.exists()) {
      return { totalMessages: 0, deletedGlobally: 0, deletedByUser: {} };
    }
    
    const messages = snapshot.val();
    const stats = {
      totalMessages: 0,
      deletedGlobally: 0,
      deletedByUser: {} as Record<number, number>
    };
    
    for (const [_, message] of Object.entries(messages)) {
      const msg = message as any;
      stats.totalMessages++;
      
      if (msg.deleted === true) {
        stats.deletedGlobally++;
      }
      
      if (msg.deletedFor && Array.isArray(msg.deletedFor)) {
        for (const userId of msg.deletedFor) {
          stats.deletedByUser[userId] = (stats.deletedByUser[userId] || 0) + 1;
        }
      }
    }
    
    return stats;
    
  } catch (error) {
    logger.error('[MessageDeletion] Failed to get deletion stats', error as Error, {
      channelId
    });
    throw error;
  }
}

export default {
  deleteMessage,
  isMessageDeletedForUser,
  filterDeletedMessages,
  undoMessageDeletion,
  bulkDeleteMessages,
  getChannelDeletionStats
};
