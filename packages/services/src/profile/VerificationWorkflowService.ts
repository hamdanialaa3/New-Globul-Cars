/**
 * Verification Workflow Service
 * Phase 2B: Integration Services
 * 
 * Handles verification workflows for dealers and companies.
 * Manages document uploads, verification status, and notifications.
 * 
 * File: src/services/profile/VerificationWorkflowService.ts
 */

import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@globul-cars/services/firebase/firebase-config';
import { logger } from '../logger-service';
import { DealershipRepository } from '../../repositories/DealershipRepository';
import { CompanyRepository } from '../../repositories/CompanyRepository';
import type { ProfileType } from '@globul-cars/core/typesuser/bulgarian-user.types';

export interface VerificationDocument {
  type: 'business_license' | 'vat_certificate' | 'trade_registry' | 'id_card' | 'other';
  url: string;
  fileName: string;
  uploadedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface VerificationSubmission {
  uid: string;
  profileType: ProfileType;
  documents: VerificationDocument[];
  submittedAt: Date;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  notes?: string;
}

export class VerificationWorkflowService {
  /**
   * Upload verification document
   */
  static async uploadDocument(
    uid: string,
    file: File,
    documentType: VerificationDocument['type']
  ): Promise<string> {
    try {
      const timestamp = Date.now();
      const fileName = `${uid}_${documentType}_${timestamp}_${file.name}`;
      const storageRef = ref(storage, `verification-documents/${uid}/${fileName}`);

      // Upload file
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      logger.info('Verification document uploaded', { uid, documentType, fileName });
      return downloadURL;
    } catch (error) {
      logger.error('Error uploading verification document', error as Error, { uid, documentType });
      throw new Error(`Failed to upload document: ${(error as Error).message}`);
    }
  }

  /**
   * Submit verification request
   */
  static async submitVerification(
    uid: string,
    profileType: ProfileType,
    documents: Array<{ type: VerificationDocument['type']; url: string; fileName: string }>
  ): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        // Update profile verification status
        if (profileType === 'dealer') {
          const dealershipRef = doc(db, 'dealerships', uid);
          transaction.update(dealershipRef, {
            'verification.status': 'in_review',
            'verification.submittedAt': serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } else if (profileType === 'company') {
          const companyRef = doc(db, 'companies', uid);
          transaction.update(companyRef, {
            'verification.status': 'in_review',
            'verification.submittedAt': serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }

        // Update user verification
        const userRef = doc(db, 'users', uid);
        transaction.update(userRef, {
          'verification.business': false, // Set to false until reviewed
          updatedAt: serverTimestamp()
        });

        // Create verification request document
        const verificationRef = doc(collection(db, 'verification_requests'));
        transaction.set(verificationRef, {
          uid,
          profileType,
          documents: documents.map(d => ({
            ...d,
            uploadedAt: new Date(),
            status: 'pending'
          })),
          submittedAt: serverTimestamp(),
          status: 'in_review'
        });
      });

      logger.info('Verification submitted', { uid, profileType, documentCount: documents.length });
    } catch (error) {
      logger.error('Error submitting verification', error as Error, { uid });
      throw new Error(`Failed to submit verification: ${(error as Error).message}`);
    }
  }

  /**
   * Approve verification (admin only)
   */
  static async approveVerification(
    uid: string,
    profileType: ProfileType,
    reviewedBy: string,
    notes?: string
  ): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        if (profileType === 'dealer') {
          const dealershipRef = doc(db, 'dealerships', uid);
          transaction.update(dealershipRef, {
            'verification.status': 'verified',
            'verification.reviewedAt': serverTimestamp(),
            'verification.reviewedBy': reviewedBy,
            'verification.notes': notes || null,
            updatedAt: serverTimestamp()
          });

          // Update user snapshot
          const userRef = doc(db, 'users', uid);
          transaction.update(userRef, {
            'verification.business': true,
            'dealerSnapshot.status': 'verified',
            updatedAt: serverTimestamp()
          });
        } else if (profileType === 'company') {
          const companyRef = doc(db, 'companies', uid);
          transaction.update(companyRef, {
            'verification.status': 'verified',
            'verification.reviewedAt': serverTimestamp(),
            'verification.reviewedBy': reviewedBy,
            'verification.notes': notes || null,
            updatedAt: serverTimestamp()
          });

          // Update user snapshot
          const userRef = doc(db, 'users', uid);
          transaction.update(userRef, {
            'verification.business': true,
            'companySnapshot.status': 'verified',
            updatedAt: serverTimestamp()
          });
        }
      });

      logger.info('Verification approved', { uid, profileType, reviewedBy });
    } catch (error) {
      logger.error('Error approving verification', error as Error, { uid });
      throw new Error(`Failed to approve verification: ${(error as Error).message}`);
    }
  }

  /**
   * Reject verification (admin only)
   */
  static async rejectVerification(
    uid: string,
    profileType: ProfileType,
    reviewedBy: string,
    reason: string
  ): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        if (profileType === 'dealer') {
          const dealershipRef = doc(db, 'dealerships', uid);
          transaction.update(dealershipRef, {
            'verification.status': 'rejected',
            'verification.reviewedAt': serverTimestamp(),
            'verification.reviewedBy': reviewedBy,
            'verification.notes': reason,
            updatedAt: serverTimestamp()
          });

          // Update user snapshot
          const userRef = doc(db, 'users', uid);
          transaction.update(userRef, {
            'verification.business': false,
            'dealerSnapshot.status': 'rejected',
            updatedAt: serverTimestamp()
          });
        } else if (profileType === 'company') {
          const companyRef = doc(db, 'companies', uid);
          transaction.update(companyRef, {
            'verification.status': 'rejected',
            'verification.reviewedAt': serverTimestamp(),
            'verification.reviewedBy': reviewedBy,
            'verification.notes': reason,
            updatedAt: serverTimestamp()
          });

          // Update user snapshot
          const userRef = doc(db, 'users', uid);
          transaction.update(userRef, {
            'verification.business': false,
            'companySnapshot.status': 'rejected',
            updatedAt: serverTimestamp()
          });
        }
      });

      logger.info('Verification rejected', { uid, profileType, reviewedBy, reason });
    } catch (error) {
      logger.error('Error rejecting verification', error as Error, { uid });
      throw new Error(`Failed to reject verification: ${(error as Error).message}`);
    }
  }

  /**
   * Get verification status
   */
  static async getVerificationStatus(uid: string, profileType: ProfileType): Promise<string> {
    try {
      if (profileType === 'dealer') {
        const dealership = await DealershipRepository.getById(uid);
        return dealership?.verification.status || 'pending';
      } else if (profileType === 'company') {
        const company = await CompanyRepository.getById(uid);
        return company?.verification.status || 'pending';
      }
      
      return 'not_applicable';
    } catch (error) {
      logger.error('Error getting verification status', error as Error, { uid });
      return 'unknown';
    }
  }
}

export default VerificationWorkflowService;

