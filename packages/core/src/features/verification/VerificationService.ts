// src/features/verification/VerificationService.ts
// Verification Service - Handles document upload and verification workflow

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/firebase-config';
import { logger } from '@globul-cars/services';
import { 
  VerificationDocument, 
  VerificationRequest, 
  DocumentType, 
  VerificationLevel, 
  VerificationStatus,
  DocumentRequirement 
} from './types';

// Document Requirements by Target Type
const DEALER_REQUIREMENTS: DocumentRequirement[] = [
  {
    type: 'eik',
    required: true,
    label: {
      bg: 'ЕИК/БУЛСТАТ Сертификат',
      en: 'EIK/BULSTAT Certificate'
    },
    description: {
      bg: 'Официален документ за регистрация на фирмата',
      en: 'Official business registration document'
    },
    maxSize: 5,
    acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png']
  },
  {
    type: 'license',
    required: true,
    label: {
      bg: 'Лиценз за търговия',
      en: 'Business License'
    },
    description: {
      bg: 'Лиценз за търговия с автомобили',
      en: 'Car dealership trading license'
    },
    maxSize: 5,
    acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png']
  },
  {
    type: 'id',
    required: true,
    label: {
      bg: 'Лична карта на собственика',
      en: 'Owner ID Card'
    },
    description: {
      bg: 'Лична карта на собственика/управителя',
      en: 'ID card of owner/manager'
    },
    maxSize: 5,
    acceptedFormats: ['image/jpeg', 'image/png']
  },
  {
    type: 'insurance',
    required: false,
    label: {
      bg: 'Застраховка (опционално)',
      en: 'Insurance Policy (optional)'
    },
    description: {
      bg: 'Застрахователна полица на фирмата',
      en: 'Business insurance policy'
    },
    maxSize: 5,
    acceptedFormats: ['application/pdf']
  }
];

const COMPANY_REQUIREMENTS: DocumentRequirement[] = [
  ...DEALER_REQUIREMENTS,
  {
    type: 'vat',
    required: true,
    label: {
      bg: 'ДДС Сертификат',
      en: 'VAT Certificate'
    },
    description: {
      bg: 'Сертификат за регистрация по ДДС',
      en: 'VAT registration certificate'
    },
    maxSize: 5,
    acceptedFormats: ['application/pdf']
  },
  {
    type: 'tax_registration',
    required: true,
    label: {
      bg: 'Данъчна регистрация',
      en: 'Tax Registration'
    },
    description: {
      bg: 'Документ за данъчна регистрация',
      en: 'Tax registration document'
    },
    maxSize: 5,
    acceptedFormats: ['application/pdf']
  }
];

class VerificationService {
  /**
   * Get document requirements for target profile type
   */
  getRequirements(targetType: 'dealer' | 'company'): DocumentRequirement[] {
    return targetType === 'dealer' ? DEALER_REQUIREMENTS : COMPANY_REQUIREMENTS;
  }

  /**
   * Upload verification document to Firebase Storage
   */
  async uploadDocument(
    userId: string,
    file: File,
    documentType: DocumentType
  ): Promise<VerificationDocument> {
    try {
      // Validate file
      if (file.size > 5 * 1024 * 1024) {  // 5MB limit
        throw new Error('File size exceeds 5MB limit');
      }

      // Create storage reference
      const timestamp = Date.now();
      const fileName = `${documentType}_${timestamp}_${file.name}`;
      const storageRef = ref(storage, `verification/${userId}/${fileName}`);

      // Upload file
      await uploadBytes(storageRef, file);

      // Get download URL
      const url = await getDownloadURL(storageRef);

      const document: VerificationDocument = {
        type: documentType,
        url,
        uploadedAt: new Date(),
        status: 'pending',
        fileName: file.name,
        fileSize: file.size
      };

      return document;
    } catch (error) {
      logger.error('Error uploading verification document', error as Error, { 
        userId, 
        documentType, 
        fileName: file.name 
      });
      throw error;
    }
  }

  /**
   * Submit verification request
   */
  async submitVerification(
    userId: string,
    targetProfileType: 'dealer' | 'company',
    documents: VerificationDocument[]
  ): Promise<void> {
    try {
      // Validate required documents
      const requirements = this.getRequirements(targetProfileType);
      const requiredTypes = requirements.filter(r => r.required).map(r => r.type);
      const uploadedTypes = documents.map(d => d.type);
      
      const missingDocs = requiredTypes.filter(type => !uploadedTypes.includes(type));
      
      if (missingDocs.length > 0) {
        throw new Error(`Missing required documents: ${missingDocs.join(', ')}`);
      }

      // Determine target verification level
      const targetLevel: VerificationLevel = targetProfileType === 'dealer' ? 'business' : 'company';

      // Update user verification in Firestore
      const userRef = doc(db, 'users', userId);
      
      await updateDoc(userRef, {
        'verification.status': 'pending' as VerificationStatus,
        'verification.level': targetLevel,
        'verification.submittedAt': Timestamp.now(),
        'verification.documents': documents
      });

      // Create verification request document
      const verificationRequest: VerificationRequest = {
        userId,
        targetProfileType,
        documents,
        submittedAt: new Date(),
        status: 'pending',
        level: targetLevel
      };

      await addDoc(collection(db, 'verificationRequests'), verificationRequest);

      // TODO: Send email notification to admin
      // TODO: Send confirmation email to user

      if (process.env.NODE_ENV === 'development') {
        logger.info('Verification request submitted', { 
          userId, 
          targetProfileType, 
          documentsCount: documents.length 
        });
      }
    } catch (error) {
      logger.error('Error submitting verification request', error as Error, { 
        userId, 
        targetProfileType 
      });
      throw error;
    }
  }

  /**
   * Get verification status for user
   */
  async getVerificationStatus(userId: string): Promise<{
    status: VerificationStatus;
    level: VerificationLevel;
    documents: VerificationDocument[];
    notes?: string;
  }> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const verification = userData.verification || {};

      return {
        status: verification.status || 'pending',
        level: verification.level || 'none',
        documents: verification.documents || [],
        notes: verification.notes
      };
    } catch (error) {
      logger.error('Error getting verification status', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Admin: Approve verification
   */
  async approveVerification(
    userId: string,
    adminId: string,
    targetProfileType: 'dealer' | 'company'
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      
      await updateDoc(userRef, {
        'profileType': targetProfileType,
        'verification.status': 'approved' as VerificationStatus,
        'verification.level': targetProfileType === 'dealer' ? 'business' : 'company',
        'verification.reviewedAt': Timestamp.now(),
        'verification.reviewerId': adminId
      });

      // TODO: Send approval email to user
      // TODO: Log action in adminLogs

      if (process.env.NODE_ENV === 'development') {
        logger.info('Verification approved', { userId, targetProfileType, adminId });
      }
    } catch (error) {
      logger.error('Error approving verification', error as Error, { 
        userId, 
        targetProfileType, 
        adminId 
      });
      throw error;
    }
  }

  /**
   * Admin: Reject verification
   */
  async rejectVerification(
    userId: string,
    adminId: string,
    reason: string
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      
      await updateDoc(userRef, {
        'verification.status': 'rejected' as VerificationStatus,
        'verification.reviewedAt': Timestamp.now(),
        'verification.reviewerId': adminId,
        'verification.notes': reason
      });

      // TODO: Send rejection email to user with reason
      // TODO: Log action in adminLogs

      if (process.env.NODE_ENV === 'development') {
        logger.info('Verification rejected', { userId, adminId, reason });
      }
    } catch (error) {
      logger.error('Error rejecting verification', error as Error, { 
        userId, 
        adminId 
      });
      throw error;
    }
  }

  /**
   * Get pending verification requests (admin only)
   */
  async getPendingVerifications(): Promise<VerificationRequest[]> {
    try {
      const q = query(
        collection(db, 'verificationRequests'),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate() || new Date()
      })) as VerificationRequest[];
    } catch (error) {
      logger.error('Error getting pending verifications', error as Error);
      throw error;
    }
  }
}

// Export singleton instance
export const verificationService = new VerificationService();
export default verificationService;

