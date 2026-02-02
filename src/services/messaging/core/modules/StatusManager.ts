import { logger } from '@/services/logger-service';
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs, writeBatch, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';

/**
 * Status Manager Module
 * وحدة إدارة الحالات
 * 
 * Handles message status updates and conversation management
 */
export class StatusManager {
  /**
   * MARK AS READ
   * يعلم الرسائل كمقروءة في جميع الأنظمة
   */
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      logger.info('[StatusManager] Marking as read', {
        conversationId,
        userId
      });

      // ✅ FIXED: Implement markMessagesAsRead using Firestore batch update
      const messagesRef = collection(db, 'messages');
      const unreadQuery = query(
        messagesRef,
        where('conversationId', '==', conversationId),
        where('recipientId', '==', userId),
        where('read', '==', false)
      );

      const unreadMessages = await getDocs(unreadQuery);
      
      if (unreadMessages.empty) {
        logger.info('[StatusManager] No unread messages to mark', { conversationId, userId });
        return;
      }

      // Batch update all unread messages
      const batch = writeBatch(db);
      const now = Timestamp.now();
      
      unreadMessages.docs.forEach((messageDoc) => {
        batch.update(messageDoc.ref, {
          read: true,
          readAt: now,
          status: 'read'
        });
      });

      await batch.commit();

      // Update conversation's last read timestamp for this user
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        [`lastReadAt.${userId}`]: serverTimestamp(),
        [`unreadCount.${userId}`]: 0
      });

      logger.info('[StatusManager] Marked as read successfully', {
        conversationId,
        userId,
        messagesMarked: unreadMessages.size
      });
    } catch (error) {
      logger.error('[StatusManager] Failed to mark as read', error as Error, {
        conversationId,
        userId
      });
      // Don't throw - marking as read is not critical
    }
  }

  /**
   * DELETE MESSAGE
   * حذف رسالة (soft delete)
   */
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    try {
      logger.info('[StatusManager] Deleting message (soft delete)', {
        messageId,
        userId
      });

      // ✅ Phase 2 Fix: Implement soft delete
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        deletedAt: serverTimestamp(),
        deletedBy: userId,
        isDeleted: true
      });
      
      logger.info('[StatusManager] Message deleted successfully', {
        messageId,
        userId
      });
    } catch (error) {
      logger.error('[StatusManager] Failed to delete message', error as Error, {
        messageId,
        userId
      });
      throw error;
    }
  }

  /**
   * ARCHIVE CONVERSATION
   * أرشفة محادثة
   */
  async archiveConversation(conversationId: string, userId: string): Promise<void> {
    try {
      logger.info('[StatusManager] Archiving conversation', {
        conversationId,
        userId
      });

      // ✅ Phase 2 Fix: Implement archiving
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        [`archivedBy.${userId}`]: serverTimestamp(),
        [`isArchivedFor.${userId}`]: true
      });
      
      logger.info('[StatusManager] Conversation archived successfully', {
        conversationId,
        userId
      });
    } catch (error) {
      logger.error('[StatusManager] Failed to archive conversation', error as Error, {
        conversationId,
        userId
      });
      throw error;
    }
  }
}

