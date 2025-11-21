// Drafts Service - Auto-save and manage car listing drafts
// خدمة المسودات - حفظ تلقائي وإدارة مسودات إعلانات السيارات

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@globul-cars/services';
import { SellWorkflowData } from '@globul-cars/core/useSellWorkflow';
import { serviceLogger } from './logger-wrapper';

export interface Draft {
  id: string;
  userId: string;
  workflowData: SellWorkflowData;
  currentStep: number;
  totalSteps: number;
  completionPercentage: number;
  previewImage?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt: Timestamp;
}

export class DraftsService {
  private static collectionName = 'drafts';

  /**
   * Create a new draft
   */
  static async createDraft(
    userId: string,
    workflowData: SellWorkflowData,
    currentStep: number = 0
  ): Promise<string> {
    try {
      const totalSteps = 8;
      const completionPercentage = Math.round((currentStep / totalSteps) * 100);

      const draftData = {
        userId,
        workflowData,
        currentStep,
        totalSteps,
        completionPercentage,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        )
      };

      const docRef = await addDoc(
        collection(db, this.collectionName),
        draftData
      );

      serviceLogger.info('Draft created', { draftId: docRef.id, userId });
      return docRef.id;
    } catch (error) {
      serviceLogger.error('Error creating draft', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Update existing draft
   */
  static async updateDraft(
    draftId: string,
    workflowData: SellWorkflowData,
    currentStep: number
  ): Promise<void> {
    try {
      const totalSteps = 8;
      const completionPercentage = Math.round((currentStep / totalSteps) * 100);

      await updateDoc(doc(db, this.collectionName, draftId), {
        workflowData,
        currentStep,
        completionPercentage,
        updatedAt: serverTimestamp()
      });

      serviceLogger.info('Draft updated', { draftId, currentStep });
    } catch (error) {
      serviceLogger.error('Error updating draft', error as Error, { draftId });
      throw error;
    }
  }

  /**
   * Get user's drafts
   */
  static async getUserDrafts(userId: string): Promise<Draft[]> {
    // ✅ CRITICAL FIX: Guard against null/undefined userId
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      serviceLogger.warn('getUserDrafts called with invalid userId', { userId });
      return [];
    }

    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(10)
      );

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Draft));
    } catch (error) {
      serviceLogger.error('Error getting user drafts', error as Error, { userId });
      return [];
    }
  }

  /**
   * Get single draft
   */
  static async getDraft(draftId: string): Promise<Draft | null> {
    try {
      const docSnap = await getDoc(doc(db, this.collectionName, draftId));
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Draft;
      }
      
      return null;
    } catch (error) {
      serviceLogger.error('Error getting draft', error as Error, { draftId });
      return null;
    }
  }

  /**
   * Delete draft
   */
  static async deleteDraft(draftId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, draftId));
      serviceLogger.info('Draft deleted', { draftId });
    } catch (error) {
      serviceLogger.error('Error deleting draft', error as Error, { draftId });
      throw error;
    }
  }

  /**
   * Auto-save draft (debounced)
   */
  static async autoSaveDraft(
    userId: string,
    draftId: string | null,
    workflowData: SellWorkflowData,
    currentStep: number
  ): Promise<string> {
    try {
      // Only auto-save if there's meaningful data
      if (!workflowData.make && !workflowData.model) {
        return draftId || '';
      }

      if (draftId) {
        await this.updateDraft(draftId, workflowData, currentStep);
        return draftId;
      } else {
        const newDraftId = await this.createDraft(userId, workflowData, currentStep);
        return newDraftId;
      }
    } catch (error) {
      serviceLogger.error('Auto-save draft failed', error as Error, { userId, draftId });
      return draftId || '';
    }
  }

  /**
   * Clean up expired drafts (for admin/scheduled task)
   */
  static async cleanupExpiredDrafts(): Promise<number> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('expiresAt', '<', Timestamp.now())
      );

      const snapshot = await getDocs(q);
      
      const deletePromises = snapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deletePromises);
      
      serviceLogger.info('Cleaned up expired drafts', { count: snapshot.size });
      return snapshot.size;
    } catch (error) {
      serviceLogger.error('Error cleaning up expired drafts', error as Error);
      return 0;
    }
  }

  /**
   * Get draft summary for display
   */
  static getDraftSummary(draft: Draft): string {
    const { workflowData } = draft;
    
    if (workflowData.make && workflowData.model) {
      return `${workflowData.make} ${workflowData.model}${workflowData.year ? ` (${workflowData.year})` : ''}`;
    }
    
    if (workflowData.make) {
      return workflowData.make;
    }
    
    return 'Unnamed Draft';
  }
}

export default DraftsService;

