/**
 * 🔴 CRITICAL: Block User Service
 * خدمة حظر المستخدمين
 * 
 * @description Allows users to block other users to prevent harassment and spam
 * يسمح للمستخدمين بحظر مستخدمين آخرين لمنع المضايقة والرسائل المزعجة
 * 
 * @architecture
 * - Uses Firestore `blocked_users` collection
 * - Stores bidirectional block relationships
 * - Integrates with messaging system to filter blocked users
 * 
 * @constitution
 * - Follows PROJECT_CONSTITUTION.md rules
 * - Uses numeric ID system (CONSTITUTION Section 4.1)
 * - Proper error handling and logging (CONSTITUTION Section 4.4)
 * 
 * @author CTO & Lead Architect
 * @date January 2026
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { logger } from '@/services/logger-service';
import { getAuth } from 'firebase/auth';
import { getNumericIdByFirebaseUid } from '@/services/numeric-id-lookup.service';

// ==================== INTERFACES ====================

/**
 * Block Relationship Interface
 * واجهة علاقة الحظر
 */
export interface BlockRelationship {
  id: string; // Document ID: {blockerNumericId}_{blockedNumericId}
  blockerNumericId: number; // Numeric ID of user who blocked
  blockerFirebaseId: string; // Firebase UID of user who blocked
  blockedNumericId: number; // Numeric ID of blocked user
  blockedFirebaseId: string; // Firebase UID of blocked user
  reason?: string; // Optional reason for blocking
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
}

/**
 * Block Result Interface
 * واجهة نتيجة الحظر
 */
export interface BlockResult {
  success: boolean;
  alreadyBlocked: boolean;
  error?: string;
}

/**
 * Unblock Result Interface
 * واجهة نتيجة إلغاء الحظر
 */
export interface UnblockResult {
  success: boolean;
  notBlocked: boolean;
  error?: string;
}

// ==================== SERVICE ====================

class BlockUserService {
  private readonly COLLECTION = 'blocked_users';

  /**
   * Get block document ID
   * الحصول على معرف وثيقة الحظر
   */
  private getBlockDocId(blockerNumericId: number, blockedNumericId: number): string {
    // Sort IDs to ensure consistency (CONSTITUTION Section 4.1 - Numeric ID pattern)
    const sorted = [blockerNumericId, blockedNumericId].sort((a, b) => a - b);
    return `${sorted[0]}_${sorted[1]}`;
  }

  /**
   * Check if user is blocked
   * التحقق من حظر المستخدم
   * 
   * @param currentUserNumericId Numeric ID of current user
   * @param otherUserNumericId Numeric ID of other user
   * @returns true if blocked, false otherwise
   */
  async isBlocked(
    currentUserNumericId: number,
    otherUserNumericId: number
  ): Promise<boolean> {
    try {
      const blockDocId = this.getBlockDocId(currentUserNumericId, otherUserNumericId);
      const blockRef = doc(db, this.COLLECTION, blockDocId);
      const blockSnap = await getDoc(blockRef);

      if (!blockSnap.exists()) {
        return false;
      }

      const blockData = blockSnap.data() as BlockRelationship;
      
      // Check if current user is the blocker (user blocked the other)
      return (
        blockData.blockerNumericId === currentUserNumericId &&
        blockData.blockedNumericId === otherUserNumericId
      );
    } catch (error) {
      logger.error('Failed to check if user is blocked', error as Error, {
        currentUserNumericId,
        otherUserNumericId,
      });
      return false; // Fail open - don't block messages if check fails
    }
  }

  /**
   * Check if user has blocked me
   * التحقق من أن المستخدم حظرني
   * 
   * @param currentUserNumericId Numeric ID of current user
   * @param otherUserNumericId Numeric ID of other user
   * @returns true if other user blocked current user, false otherwise
   */
  async hasBlockedMe(
    currentUserNumericId: number,
    otherUserNumericId: number
  ): Promise<boolean> {
    try {
      const blockDocId = this.getBlockDocId(currentUserNumericId, otherUserNumericId);
      const blockRef = doc(db, this.COLLECTION, blockDocId);
      const blockSnap = await getDoc(blockRef);

      if (!blockSnap.exists()) {
        return false;
      }

      const blockData = blockSnap.data() as BlockRelationship;
      
      // Check if other user is the blocker (other user blocked current user)
      return (
        blockData.blockerNumericId === otherUserNumericId &&
        blockData.blockedNumericId === currentUserNumericId
      );
    } catch (error) {
      logger.error('Failed to check if user has blocked me', error as Error, {
        currentUserNumericId,
        otherUserNumericId,
      });
      return false; // Fail open
    }
  }

  /**
   * Check if blocking relationship exists (bidirectional check)
   * التحقق من وجود علاقة حظر (في أي اتجاه)
   */
  async isBlockingRelationship(
    user1NumericId: number,
    user2NumericId: number
  ): Promise<boolean> {
    try {
      const blockDocId = this.getBlockDocId(user1NumericId, user2NumericId);
      const blockRef = doc(db, this.COLLECTION, blockDocId);
      const blockSnap = await getDoc(blockRef);
      return blockSnap.exists();
    } catch (error) {
      logger.error('Failed to check blocking relationship', error as Error, {
        user1NumericId,
        user2NumericId,
      });
      return false;
    }
  }

  /**
   * Block a user
   * حظر مستخدم
   * 
   * @param currentUserFirebaseId Firebase UID of current user
   * @param blockedUserFirebaseId Firebase UID of user to block
   * @param reason Optional reason for blocking
   */
  async blockUser(
    currentUserFirebaseId: string,
    blockedUserFirebaseId: string,
    reason?: string
  ): Promise<BlockResult> {
    try {
      // Get numeric IDs
      const [blockerNumericId, blockedNumericId] = await Promise.all([
        getNumericIdByFirebaseUid(currentUserFirebaseId),
        getNumericIdByFirebaseUid(blockedUserFirebaseId),
      ]);

      if (!blockerNumericId || !blockedNumericId) {
        throw new Error('Could not resolve numeric IDs for users');
      }

      // Prevent self-blocking
      if (blockerNumericId === blockedNumericId) {
        return {
          success: false,
          alreadyBlocked: false,
          error: 'Cannot block yourself',
        };
      }

      // Check if already blocked
      const alreadyBlocked = await this.isBlocked(blockerNumericId, blockedNumericId);
      if (alreadyBlocked) {
        return {
          success: false,
          alreadyBlocked: true,
          error: 'User is already blocked',
        };
      }

      // Create block relationship
      const blockDocId = this.getBlockDocId(blockerNumericId, blockedNumericId);
      const blockRef = doc(db, this.COLLECTION, blockDocId);

      const blockData: Omit<BlockRelationship, 'id'> = {
        blockerNumericId: blockerNumericId,
        blockerFirebaseId: currentUserFirebaseId,
        blockedNumericId: blockedNumericId,
        blockedFirebaseId: blockedUserFirebaseId,
        reason: reason || undefined,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(blockRef, blockData);

      logger.info('User blocked successfully', {
        blockerNumericId,
        blockedNumericId,
        reason: reason || 'No reason provided',
      });

      // Archive existing channel if exists (optional - could also keep but mark as blocked)
      // This is handled in the messaging service

      return {
        success: true,
        alreadyBlocked: false,
      };
    } catch (error) {
      logger.error('Failed to block user', error as Error, {
        currentUserFirebaseId,
        blockedUserFirebaseId,
      });
      return {
        success: false,
        alreadyBlocked: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Unblock a user
   * إلغاء حظر مستخدم
   * 
   * @param currentUserFirebaseId Firebase UID of current user
   * @param unblockedUserFirebaseId Firebase UID of user to unblock
   */
  async unblockUser(
    currentUserFirebaseId: string,
    unblockedUserFirebaseId: string
  ): Promise<UnblockResult> {
    try {
      // Get numeric IDs
      const [blockerNumericId, blockedNumericId] = await Promise.all([
        getNumericIdByFirebaseUid(currentUserFirebaseId),
        getNumericIdByFirebaseUid(unblockedUserFirebaseId),
      ]);

      if (!blockerNumericId || !blockedNumericId) {
        throw new Error('Could not resolve numeric IDs for users');
      }

      // Check if actually blocked
      const isBlocked = await this.isBlocked(blockerNumericId, blockedNumericId);
      if (!isBlocked) {
        return {
          success: false,
          notBlocked: true,
          error: 'User is not blocked',
        };
      }

      // Delete block relationship
      const blockDocId = this.getBlockDocId(blockerNumericId, blockedNumericId);
      const blockRef = doc(db, this.COLLECTION, blockDocId);
      await deleteDoc(blockRef);

      logger.info('User unblocked successfully', {
        blockerNumericId,
        blockedNumericId,
      });

      return {
        success: true,
        notBlocked: false,
      };
    } catch (error) {
      logger.error('Failed to unblock user', error as Error, {
        currentUserFirebaseId,
        unblockedUserFirebaseId,
      });
      return {
        success: false,
        notBlocked: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get list of blocked users
   * الحصول على قائمة المستخدمين المحظورين
   * 
   * @param currentUserFirebaseId Firebase UID of current user
   * @returns Array of blocked user numeric IDs
   */
  async getBlockedUsers(currentUserFirebaseId: string): Promise<number[]> {
    try {
      const blockerNumericId = await getNumericIdByFirebaseUid(currentUserFirebaseId);
      if (!blockerNumericId) {
        return [];
      }

      // Query for all blocks where current user is the blocker
      const q = query(
        collection(db, this.COLLECTION),
        where('blockerNumericId', '==', blockerNumericId)
      );

      const snapshot = await getDocs(q);
      const blockedIds: number[] = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data() as BlockRelationship;
        blockedIds.push(data.blockedNumericId);
      });

      logger.debug('Retrieved blocked users', {
        blockerNumericId,
        count: blockedIds.length,
      });

      return blockedIds;
    } catch (error) {
      logger.error('Failed to get blocked users', error as Error, {
        currentUserFirebaseId,
      });
      return [];
    }
  }

  /**
   * Get list of users who blocked me
   * الحصول على قائمة المستخدمين الذين حظروني
   * 
   * @param currentUserFirebaseId Firebase UID of current user
   * @returns Array of blocker user numeric IDs
   */
  async getUsersWhoBlockedMe(currentUserFirebaseId: string): Promise<number[]> {
    try {
      const blockedNumericId = await getNumericIdByFirebaseUid(currentUserFirebaseId);
      if (!blockedNumericId) {
        return [];
      }

      // Query for all blocks where current user is blocked
      const q = query(
        collection(db, this.COLLECTION),
        where('blockedNumericId', '==', blockedNumericId)
      );

      const snapshot = await getDocs(q);
      const blockerIds: number[] = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data() as BlockRelationship;
        blockerIds.push(data.blockerNumericId);
      });

      logger.debug('Retrieved users who blocked me', {
        blockedNumericId,
        count: blockerIds.length,
      });

      return blockerIds;
    } catch (error) {
      logger.error('Failed to get users who blocked me', error as Error, {
        currentUserFirebaseId,
      });
      return [];
    }
  }
}

// Export singleton instance
export const blockUserService = new BlockUserService();
