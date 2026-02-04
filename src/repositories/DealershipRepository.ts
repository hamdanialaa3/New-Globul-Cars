/**
 * Dealership Repository - Canonical data access layer
 * Phase 1: Repository Pattern Implementation
 * 
 * This repository is the ONLY way to access dealerships collection.
 * All dealership CRUD operations go through this layer.
 * 
 * File: src/repositories/DealershipRepository.ts
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
  limit,
  startAfter,
  DocumentSnapshot,
  serverTimestamp,
  runTransaction,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { logger } from '../services/logger-service';
import type {
  DealershipInfo,
  DealershipInfoCreate,
  DealershipInfoUpdate
} from '../types/dealership/dealership.types';

export class DealershipRepository {
  private static readonly COLLECTION = 'dealerships';

  /**
   * Get dealership by UID
   */
  static async getById(uid: string): Promise<DealershipInfo | null> {
    try {
      const dealershipRef = doc(db, this.COLLECTION, uid);
      const snapshot = await getDoc(dealershipRef);

      if (!snapshot.exists()) {
        logger.debug('Dealership not found', { uid });
        return null;
      }

      return this.snapshotToData(snapshot);
    } catch (error) {
      logger.error('Error fetching dealership', error as Error, { uid });
      throw new Error(`Failed to fetch dealership: ${(error as Error).message}`);
    }
  }

  /**
   * Create new dealership
   */
  static async create(uid: string, data: DealershipInfoCreate): Promise<DealershipInfo> {
    try {
      const dealershipRef = doc(db, this.COLLECTION, uid);

      // Check if already exists
      const existing = await getDoc(dealershipRef);
      if (existing.exists()) {
        throw new Error('Dealership already exists for this user');
      }

      const dealershipData: DealershipInfo = {
        ...data,
        uid,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
        verification: {
          status: 'pending',
          ...data.verification
        }
      };

      await setDoc(dealershipRef, dealershipData);

      logger.info('Dealership created', { uid });
      return dealershipData;
    } catch (error) {
      logger.error('Error creating dealership', error as Error, { uid });
      throw new Error(`Failed to create dealership: ${(error as Error).message}`);
    }
  }

  /**
   * Update dealership (partial update)
   */
  static async update(uid: string, data: DealershipInfoUpdate): Promise<void> {
    try {
      const dealershipRef = doc(db, this.COLLECTION, uid);

      // Verify exists
      const snapshot = await getDoc(dealershipRef);
      if (!snapshot.exists()) {
        throw new Error('Dealership not found');
      }

      await updateDoc(dealershipRef, {
        ...data,
        updatedAt: serverTimestamp()
      });

      logger.info('Dealership updated', { uid, fields: Object.keys(data) });
    } catch (error) {
      logger.error('Error updating dealership', error as Error, { uid });
      throw new Error(`Failed to update dealership: ${(error as Error).message}`);
    }
  }

  /**
   * Delete dealership
   */
  static async delete(uid: string): Promise<void> {
    try {
      const dealershipRef = doc(db, this.COLLECTION, uid);
      await deleteDoc(dealershipRef);

      logger.info('Dealership deleted', { uid });
    } catch (error) {
      logger.error('Error deleting dealership', error as Error, { uid });
      throw new Error(`Failed to delete dealership: ${(error as Error).message}`);
    }
  }

  /**
   * Create or update dealership (upsert)
   */
  static async createOrUpdate(uid: string, data: DealershipInfoCreate): Promise<DealershipInfo> {
    try {
      const existing = await this.getById(uid);

      if (existing) {
        const normalizedVerification = data.verification
          ? {
              status: data.verification.status ?? existing.verification.status,
              submittedAt: data.verification.submittedAt ?? existing.verification.submittedAt,
              reviewedAt: data.verification.reviewedAt ?? existing.verification.reviewedAt,
              reviewedBy: data.verification.reviewedBy ?? existing.verification.reviewedBy,
              notes: data.verification.notes ?? existing.verification.notes
            }
          : undefined;
        const updateData: DealershipInfoUpdate = {
          ...data,
          verification: normalizedVerification
        };

        await this.update(uid, updateData);
        return { ...existing, ...updateData, updatedAt: serverTimestamp() as any };
      } else {
        return await this.create(uid, data);
      }
    } catch (error) {
      logger.error('Error upserting dealership', error as Error, { uid });
      throw error;
    }
  }

  /**
   * Update verification status
   */
  static async updateVerificationStatus(
    uid: string,
    status: 'pending' | 'in_review' | 'verified' | 'rejected',
    reviewedBy?: string,
    notes?: string
  ): Promise<void> {
    try {
      const dealershipRef = doc(db, this.COLLECTION, uid);

      await updateDoc(dealershipRef, {
        'verification.status': status,
        'verification.reviewedAt': serverTimestamp(),
        'verification.reviewedBy': reviewedBy || null,
        'verification.notes': notes || null,
        updatedAt: serverTimestamp()
      });

      logger.info('Dealership verification updated', { uid, status, reviewedBy });
    } catch (error) {
      logger.error('Error updating verification', error as Error, { uid });
      throw new Error(`Failed to update verification: ${(error as Error).message}`);
    }
  }

  /**
   * Get all verified dealerships
   * ✅ WITH GRACEFUL DEGRADATION: Falls back to simple query if composite index is building
   */
  static async getVerified(limitCount: number = 50): Promise<DealershipInfo[]> {
    try {
      // TRY: Complex query with composite index (verification.status + createdAt)
      const q = query(
        collection(db, this.COLLECTION),
        where('verification.status', '==', 'verified'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => this.snapshotToData(doc));
    } catch (error) {
      const errorMessage = (error as Error).message;

      // FALLBACK: If index is building or missing, use simple query without orderBy
      if (errorMessage.includes('index') || errorMessage.includes('building')) {
        logger.warn('Composite index not ready, using fallback query for dealerships');

        try {
          // Simple query - only where clause (no composite index needed)
          const fallbackQuery = query(
            collection(db, this.COLLECTION),
            where('verification.status', '==', 'verified'),
            limit(limitCount)
          );

          const snapshot = await getDocs(fallbackQuery);
          const results = snapshot.docs.map((doc: any) => this.snapshotToData(doc));

          // Manual sort by createdAt (client-side)
          results.sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
            const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
            return dateB - dateA;
          });

          return results;
        } catch (fallbackError) {
          logger.error('Fallback query also failed', fallbackError as Error);
          return []; // Return empty array instead of throwing
        }
      }

      // Other errors - log and return empty
      logger.error('Error fetching verified dealerships', error as Error);
      return [];
    }
  }

  /**
   * Get dealerships by city
   */
  static async getByCity(city: string, limitCount: number = 20): Promise<DealershipInfo[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('address.locationData?.cityName', '==', city),
        where('verification.status', '==', 'verified'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => this.snapshotToData(doc));
    } catch (error) {
      logger.error('Error fetching dealerships by city', error as Error, { city });
      throw new Error(`Failed to fetch dealerships by city: ${(error as Error).message}`);
    }
  }

  /**
   * Get dealerships by brand specialization
   */
  static async getByBrand(brand: string, limitCount: number = 20): Promise<DealershipInfo[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('services.brands', 'array-contains', brand),
        where('verification.status', '==', 'verified'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => this.snapshotToData(doc));
    } catch (error) {
      logger.error('Error fetching dealerships by brand', error as Error, { brand });
      throw new Error(`Failed to fetch dealerships by brand: ${(error as Error).message}`);
    }
  }

  /**
   * Update dealership with user snapshot sync
   * This ensures the user's dealerSnapshot stays in sync
   */
  static async updateWithUserSync(uid: string, data: DealershipInfoUpdate): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const dealershipRef = doc(db, this.COLLECTION, uid);
        const userRef = doc(db, 'users', uid);

        // Update dealership
        transaction.update(dealershipRef, {
          ...data,
          updatedAt: serverTimestamp()
        });

        // Update user snapshot if name/logo/status changed
        const snapshotUpdate: Record<string, unknown> = {};
        if (data.dealershipNameBG) snapshotUpdate['dealerSnapshot.nameBG'] = data.dealershipNameBG;
        if (data.dealershipNameEN) snapshotUpdate['dealerSnapshot.nameEN'] = data.dealershipNameEN;
        if (data.media?.logo) snapshotUpdate['dealerSnapshot.logo'] = data.media.logo;
        if (data.verification?.status) snapshotUpdate['dealerSnapshot.status'] = data.verification.status;

        if (Object.keys(snapshotUpdate).length > 0) {
          transaction.update(userRef, {
            ...snapshotUpdate,
            updatedAt: serverTimestamp()
          });
        }
      });

      logger.info('Dealership updated with user sync', { uid });
    } catch (error) {
      logger.error('Error updating dealership with sync', error as Error, { uid });
      throw new Error(`Failed to update dealership with sync: ${(error as Error).message}`);
    }
  }

  /**
   * Batch update multiple dealerships
   */
  static async batchUpdate(updates: Array<{ uid: string; data: DealershipInfoUpdate }>): Promise<void> {
    try {
      const batch = writeBatch(db);

      for (const { uid, data } of updates) {
        const dealershipRef = doc(db, this.COLLECTION, uid);
        batch.update(dealershipRef, {
          ...data,
          updatedAt: serverTimestamp()
        });
      }

      await batch.commit();
      logger.info('Batch dealership update complete', { count: updates.length });
    } catch (error) {
      logger.error('Error in batch update', error as Error, { count: updates.length });
      throw new Error(`Failed to batch update dealerships: ${(error as Error).message}`);
    }
  }

  /**
   * Convert Firestore snapshot to DealershipInfo
   */
  private static snapshotToData(snapshot: DocumentSnapshot): DealershipInfo {
    const data = snapshot.data();
    if (!data) {
      throw new Error('Snapshot data is undefined');
    }

    return {
      ...data,
      uid: snapshot.id,
      createdAt: data.createdAt || serverTimestamp(),
      updatedAt: data.updatedAt || serverTimestamp()
    } as DealershipInfo;
  }

  /**
   * Check if dealership exists
   */
  static async exists(uid: string): Promise<boolean> {
    try {
      const dealershipRef = doc(db, this.COLLECTION, uid);
      const snapshot = await getDoc(dealershipRef);
      return snapshot.exists();
    } catch (error) {
      logger.error('Error checking dealership existence', error as Error, { uid });
      return false;
    }
  }

  /**
   * Get dealerships pending verification
   */
  static async getPendingVerification(limitCount: number = 20): Promise<DealershipInfo[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('verification.status', 'in', ['pending', 'in_review']),
        orderBy('verification.submittedAt', 'asc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => this.snapshotToData(doc));
    } catch (error) {
      logger.error('Error fetching pending dealerships', error as Error);
      throw new Error(`Failed to fetch pending dealerships: ${(error as Error).message}`);
    }
  }

  /**
   * Get total count of verified dealerships
   */
  static async getVerifiedCount(): Promise<number> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('verification.status', '==', 'verified')
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      logger.error('Error fetching verified dealer count', error as Error);
      return 0;
    }
  }
}

export default DealershipRepository;

