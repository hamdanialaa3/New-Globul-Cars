// src/services/verification/id-verification-service.ts
// ID Verification Service - خدمة التحقق من الهوية
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  getDoc,
  query,
  where,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../../firebase/firebase-config';
import { trustScoreService } from '../profile/trust-score-service';

// ==================== INTERFACES ====================

export interface IDVerificationRequest {
  userId: string;
  type: 'identity' | 'business' | 'address';
  status: 'pending' | 'approved' | 'rejected';
  documents: {
    front?: string;
    back?: string;
    selfie?: string;
    additional?: string[];
  };
  submittedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  notes?: string;
}

export interface SubmitIDResult {
  success: boolean;
  message: string;
  requestId?: string;
}

// ==================== SERVICE CLASS ====================

export class IDVerificationService {
  private static instance: IDVerificationService;

  private constructor() {}

  public static getInstance(): IDVerificationService {
    if (!IDVerificationService.instance) {
      IDVerificationService.instance = new IDVerificationService();
    }
    return IDVerificationService.instance;
  }

  // ==================== PUBLIC METHODS ====================

  /**
   * Submit ID for verification
   * تقديم الهوية للتحقق
   */
  async submitIDVerification(
    userId: string,
    frontImage: File,
    backImage: File,
    selfieImage?: File
  ): Promise<SubmitIDResult> {
    try {
      // 1. Validate files
      this.validateIDFiles(frontImage, backImage, selfieImage);

      // 2. Upload documents to encrypted storage
      console.log('📤 Uploading ID documents...');
      
      const frontUrl = await this.uploadDocument(userId, frontImage, 'id_front.jpg');
      const backUrl = await this.uploadDocument(userId, backImage, 'id_back.jpg');
      const selfieUrl = selfieImage 
        ? await this.uploadDocument(userId, selfieImage, 'id_selfie.jpg')
        : undefined;

      // 3. Create verification request
      const requestRef = await addDoc(collection(db, 'verificationRequests'), {
        userId,
        type: 'identity',
        status: 'pending',
        documents: {
          front: frontUrl,
          back: backUrl,
          selfie: selfieUrl
        },
        submittedAt: serverTimestamp()
      });

      // 4. Update user status
      await updateDoc(doc(db, 'users', userId), {
        'verification.identity.status': 'pending',
        updatedAt: serverTimestamp()
      });

      console.log('✅ ID verification request submitted');

      return {
        success: true,
        message: 'Документите са изпратени за проверка / Documents submitted for review',
        requestId: requestRef.id
      };

    } catch (error: any) {
      console.error('❌ ID submission failed:', error);
      return {
        success: false,
        message: error.message || 'Грешка при изпращане / Submission failed'
      };
    }
  }

  /**
   * Get user verification requests
   * الحصول على طلبات التحقق للمستخدم
   */
  async getUserRequests(userId: string): Promise<IDVerificationRequest[]> {
    try {
      const q = query(
        collection(db, 'verificationRequests'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate() || new Date(),
        reviewedAt: doc.data().reviewedAt?.toDate()
      } as any));

    } catch (error) {
      console.error('❌ Error fetching requests:', error);
      return [];
    }
  }

  /**
   * Check verification status
   * التحقق من حالة التحقق
   */
  async checkVerificationStatus(userId: string): Promise<string> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const status = userDoc.data()?.verification?.identity?.status;
      
      return status || 'none';
    } catch (error) {
      console.error('❌ Error checking status:', error);
      return 'error';
    }
  }

  // ==================== ADMIN METHODS ====================

  /**
   * Approve ID verification (Admin only)
   * الموافقة على التحقق (للمسؤول فقط)
   */
  async approveVerification(requestId: string, adminId: string): Promise<boolean> {
    try {
      const requestDoc = await getDoc(doc(db, 'verificationRequests', requestId));
      
      if (!requestDoc.exists()) {
        throw new Error('Request not found');
      }

      const data = requestDoc.data();
      const userId = data.userId;

      // Update request
      await updateDoc(doc(db, 'verificationRequests', requestId), {
        status: 'approved',
        reviewedBy: adminId,
        reviewedAt: serverTimestamp()
      });

      // Update user
      await updateDoc(doc(db, 'users', userId), {
        'verification.identity.verified': true,
        'verification.identity.verifiedAt': serverTimestamp(),
        'verification.identity.status': 'approved',
        updatedAt: serverTimestamp()
      });

      // Award badge
      await trustScoreService.awardBadge(userId, 'ID_VERIFIED');

      // Recalculate trust score
      await trustScoreService.calculateTrustScore(userId);

      console.log('✅ ID verification approved');
      return true;

    } catch (error) {
      console.error('❌ Approval failed:', error);
      return false;
    }
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Upload document to encrypted storage
   * رفع المستند إلى التخزين المشفر
   */
  private async uploadDocument(
    userId: string,
    file: File,
    filename: string
  ): Promise<string> {
    const storageRef = ref(storage, `users/${userId}/documents/${filename}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

  /**
   * Validate ID files
   * التحقق من ملفات الهوية
   */
  private validateIDFiles(
    front: File,
    back: File,
    selfie?: File
  ): void {
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!front || !back) {
      throw new Error('Front and back images required');
    }

    if (front.size > maxSize || back.size > maxSize) {
      throw new Error('Images must be under 5MB');
    }

    if (selfie && selfie.size > maxSize) {
      throw new Error('Selfie must be under 5MB');
    }

    if (!front.type.startsWith('image/') || !back.type.startsWith('image/')) {
      throw new Error('Files must be images');
    }
  }
}

// Export singleton instance
export const idVerificationService = IDVerificationService.getInstance();
