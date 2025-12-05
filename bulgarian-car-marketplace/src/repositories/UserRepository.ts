/**
 * User Repository
 * Centralized data access for users collection
 * Phase 1 (P1.9): Repository Pattern
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
  runTransaction,
  DocumentSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import type { BulgarianUser } from '../types/user/bulgarian-user.types';
import { logger } from '../services/logger-service';

export class UserRepository {
  private static readonly COLLECTION = 'users';

  /**
   * Get user by ID
   */
  static async getById(uid: string): Promise<BulgarianUser | null> {
    try {
      const userDoc = await getDoc(doc(db, this.COLLECTION, uid));
      if (!userDoc.exists()) {
        return null;
      }
      return this.toUser(userDoc);
    } catch (error) {
      logger.error('Error getting user by ID', error as Error, { uid });
      throw error;
    }
  }

  /**
   * Update user
   */
  static async update(
    uid: string,
    data: Partial<BulgarianUser>
  ): Promise<void> {
    try {
      await updateDoc(doc(db, this.COLLECTION, uid), {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      logger.error('Error updating user', error as Error, { uid });
      throw error;
    }
  }

  /**
   * Update user with transaction (atomic operation)
   */
  static async updateWithTransaction(
    uid: string,
    updateFn: (user: BulgarianUser) => Partial<BulgarianUser>
  ): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, this.COLLECTION, uid);
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists()) {
          throw new Error('User not found');
        }

        const currentUser = this.toUser(userDoc);
        const updates = updateFn(currentUser);

        transaction.update(userRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });
      });
    } catch (error) {
      logger.error('Error updating user with transaction', error as Error, { uid });
      throw error;
    }
  }

  /**
   * Create user
   */
  static async create(uid: string, data: Partial<BulgarianUser>): Promise<void> {
    try {
      await setDoc(doc(db, this.COLLECTION, uid), {
        uid,
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      logger.error('Error creating user', error as Error, { uid });
      throw error;
    }
  }

  /**
   * Delete user
   */
  static async delete(uid: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION, uid));
    } catch (error) {
      logger.error('Error deleting user', error as Error, { uid });
      throw error;
    }
  }

  /**
   * Get users by profile type
   */
  static async getByProfileType(
    profileType: 'private' | 'dealer' | 'company',
    limitCount: number = 50
  ): Promise<BulgarianUser[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('profileType', '==', profileType),
        orderBy('createdAt', 'desc'),
        firestoreLimit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.toUser(doc));
    } catch (error) {
      logger.error('Error getting users by profile type', error as Error, { profileType });
      return [];
    }
  }

  /**
   * Check if user exists
   */
  static async exists(uid: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, this.COLLECTION, uid));
      return userDoc.exists();
    } catch (error) {
      logger.error('Error checking user existence', error as Error, { uid });
      return false;
    }
  }

  /**
   * Convert Firestore document to BulgarianUser
   */
  private static toUser(doc: DocumentSnapshot): BulgarianUser {
    const data = doc.data();
    if (!data) {
      throw new Error('Document has no data');
    }

    return {
      ...data,
      uid: doc.id,
      createdAt: this.convertTimestamp(data.createdAt),
      updatedAt: this.convertTimestamp(data.updatedAt),
      lastLoginAt: data.lastLoginAt ? this.convertTimestamp(data.lastLoginAt) : undefined
    } as BulgarianUser;
  }

  /**
   * Convert Firestore Timestamp to Date
   */
  private static convertTimestamp(ts: any): Timestamp {
    if (!ts) return Timestamp.now();
    if (ts instanceof Timestamp) return ts;
    if (ts.toDate) return ts;
    if (ts instanceof Date) return Timestamp.fromDate(ts);
    if (typeof ts === 'number') return Timestamp.fromMillis(ts);
    return Timestamp.now();
  }
}

export default UserRepository;

