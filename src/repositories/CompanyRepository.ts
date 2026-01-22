/**
 * Company Repository - Canonical data access layer
 * Phase 1: Repository Pattern Implementation
 * 
 * This repository is the ONLY way to access companies collection.
 * All company CRUD operations go through this layer.
 * 
 * File: src/repositories/CompanyRepository.ts
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
  DocumentSnapshot,
  serverTimestamp,
  runTransaction,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { logger } from '../services/logger-service';
import type {
  CompanyInfo,
  CompanyInfoCreate,
  CompanyInfoUpdate
} from '../types/company/company.types';

export class CompanyRepository {
  private static readonly COLLECTION = 'companies';

  /**
   * Get company by UID
   */
  static async getById(uid: string): Promise<CompanyInfo | null> {
    try {
      const companyRef = doc(db, this.COLLECTION, uid);
      const snapshot = await getDoc(companyRef);

      if (!snapshot.exists()) {
        logger.debug('Company not found', { uid });
        return null;
      }

      return this.snapshotToData(snapshot);
    } catch (error) {
      logger.error('Error fetching company', error as Error, { uid });
      throw new Error(`Failed to fetch company: ${(error as Error).message}`);
    }
  }

  /**
   * Create new company
   */
  static async create(uid: string, data: CompanyInfoCreate): Promise<CompanyInfo> {
    try {
      const companyRef = doc(db, this.COLLECTION, uid);

      // Check if already exists
      const existing = await getDoc(companyRef);
      if (existing.exists()) {
        throw new Error('Company already exists for this user');
      }

      const companyData: CompanyInfo = {
        ...data,
        uid,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
        verification: {
          status: 'pending',
          ...data.verification
        }
      };

      await setDoc(companyRef, companyData);

      logger.info('Company created', { uid });
      return companyData;
    } catch (error) {
      logger.error('Error creating company', error as Error, { uid });
      throw new Error(`Failed to create company: ${(error as Error).message}`);
    }
  }

  /**
   * Update company (partial update)
   */
  static async update(uid: string, data: CompanyInfoUpdate): Promise<void> {
    try {
      const companyRef = doc(db, this.COLLECTION, uid);

      // Verify exists
      const snapshot = await getDoc(companyRef);
      if (!snapshot.exists()) {
        throw new Error('Company not found');
      }

      await updateDoc(companyRef, {
        ...data,
        updatedAt: serverTimestamp()
      });

      logger.info('Company updated', { uid, fields: Object.keys(data) });
    } catch (error) {
      logger.error('Error updating company', error as Error, { uid });
      throw new Error(`Failed to update company: ${(error as Error).message}`);
    }
  }

  /**
   * Delete company
   */
  static async delete(uid: string): Promise<void> {
    try {
      const companyRef = doc(db, this.COLLECTION, uid);
      await deleteDoc(companyRef);

      logger.info('Company deleted', { uid });
    } catch (error) {
      logger.error('Error deleting company', error as Error, { uid });
      throw new Error(`Failed to delete company: ${(error as Error).message}`);
    }
  }

  /**
   * Create or update company (upsert)
   */
  static async createOrUpdate(uid: string, data: CompanyInfoCreate): Promise<CompanyInfo> {
    try {
      const existing = await this.getById(uid);

      if (existing) {
        await this.update(uid, data);
        return { ...existing, ...data, updatedAt: serverTimestamp() as any };
      } else {
        return await this.create(uid, data);
      }
    } catch (error) {
      logger.error('Error upserting company', error as Error, { uid });
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
      const companyRef = doc(db, this.COLLECTION, uid);

      await updateDoc(companyRef, {
        'verification.status': status,
        'verification.reviewedAt': serverTimestamp(),
        'verification.reviewedBy': reviewedBy || null,
        'verification.notes': notes || null,
        updatedAt: serverTimestamp()
      });

      logger.info('Company verification updated', { uid, status, reviewedBy });
    } catch (error) {
      logger.error('Error updating verification', error as Error, { uid });
      throw new Error(`Failed to update verification: ${(error as Error).message}`);
    }
  }

  /**
   * Get all verified companies
   */
  static async getVerified(limitCount: number = 50): Promise<CompanyInfo[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('verification.status', '==', 'verified'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => this.snapshotToData(doc));
    } catch (error) {
      logger.error('Error fetching verified companies', error as Error);
      throw new Error(`Failed to fetch verified companies: ${(error as Error).message}`);
    }
  }

  /**
   * Get companies by city
   */
  static async getByCity(city: string, limitCount: number = 20): Promise<CompanyInfo[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('headquarters.locationData?.cityName', '==', city),
        where('verification.status', '==', 'verified'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => this.snapshotToData(doc));
    } catch (error) {
      logger.error('Error fetching companies by city', error as Error, { city });
      throw new Error(`Failed to fetch companies by city: ${(error as Error).message}`);
    }
  }

  /**
   * Get companies by legal form
   */
  static async getByLegalForm(legalForm: string, limitCount: number = 20): Promise<CompanyInfo[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('legalForm', '==', legalForm),
        where('verification.status', '==', 'verified'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => this.snapshotToData(doc));
    } catch (error) {
      logger.error('Error fetching companies by legal form', error as Error, { legalForm });
      throw new Error(`Failed to fetch companies by legal form: ${(error as Error).message}`);
    }
  }

  /**
   * Get companies by fleet size
   */
  static async getByFleetSize(minSize: number, limitCount: number = 20): Promise<CompanyInfo[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('fleet.totalVehicles', '>=', minSize),
        where('verification.status', '==', 'verified'),
        orderBy('fleet.totalVehicles', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => this.snapshotToData(doc));
    } catch (error) {
      logger.error('Error fetching companies by fleet size', error as Error, { minSize });
      throw new Error(`Failed to fetch companies by fleet size: ${(error as Error).message}`);
    }
  }

  /**
   * Update company with user snapshot sync
   * This ensures the user's companySnapshot stays in sync
   */
  static async updateWithUserSync(uid: string, data: CompanyInfoUpdate): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const companyRef = doc(db, this.COLLECTION, uid);
        const userRef = doc(db, 'users', uid);

        // Update company
        transaction.update(companyRef, {
          ...data,
          updatedAt: serverTimestamp()
        });

        // Update user snapshot if name/logo/status changed
        const snapshotUpdate: Record<string, unknown> = {};
        if (data.companyNameBG) snapshotUpdate['companySnapshot.nameBG'] = data.companyNameBG;
        if (data.companyNameEN) snapshotUpdate['companySnapshot.nameEN'] = data.companyNameEN;
        if (data.media?.logo) snapshotUpdate['companySnapshot.logo'] = data.media.logo;
        if (data.verification?.status) snapshotUpdate['companySnapshot.status'] = data.verification.status;

        if (Object.keys(snapshotUpdate).length > 0) {
          transaction.update(userRef, {
            ...snapshotUpdate,
            updatedAt: serverTimestamp()
          });
        }
      });

      logger.info('Company updated with user sync', { uid });
    } catch (error) {
      logger.error('Error updating company with sync', error as Error, { uid });
      throw new Error(`Failed to update company with sync: ${(error as Error).message}`);
    }
  }

  /**
   * Batch update multiple companies
   */
  static async batchUpdate(updates: Array<{ uid: string; data: CompanyInfoUpdate }>): Promise<void> {
    try {
      const batch = writeBatch(db);

      for (const { uid, data } of updates) {
        const companyRef = doc(db, this.COLLECTION, uid);
        batch.update(companyRef, {
          ...data,
          updatedAt: serverTimestamp()
        });
      }

      await batch.commit();
      logger.info('Batch company update complete', { count: updates.length });
    } catch (error) {
      logger.error('Error in batch update', error as Error, { count: updates.length });
      throw new Error(`Failed to batch update companies: ${(error as Error).message}`);
    }
  }

  /**
   * Convert Firestore snapshot to CompanyInfo
   */
  private static snapshotToData(snapshot: DocumentSnapshot): CompanyInfo {
    const data = snapshot.data();
    if (!data) {
      throw new Error('Snapshot data is undefined');
    }

    return {
      ...data,
      uid: snapshot.id,
      createdAt: data.createdAt || serverTimestamp(),
      updatedAt: data.updatedAt || serverTimestamp()
    } as CompanyInfo;
  }

  /**
   * Check if company exists
   */
  static async exists(uid: string): Promise<boolean> {
    try {
      const companyRef = doc(db, this.COLLECTION, uid);
      const snapshot = await getDoc(companyRef);
      return snapshot.exists();
    } catch (error) {
      logger.error('Error checking company existence', error as Error, { uid });
      return false;
    }
  }

  /**
   * Get companies pending verification
   */
  static async getPendingVerification(limitCount: number = 20): Promise<CompanyInfo[]> {
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
      logger.error('Error fetching pending companies', error as Error);
      throw new Error(`Failed to fetch pending companies: ${(error as Error).message}`);
    }
  }
}

export default CompanyRepository;

