// sell-workflow-operations.ts - Core workflow operations
// Split from sellWorkflowService.ts to comply with 300-line limit

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
  Timestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { logger } from './logger-service';
import { rateLimiter, RATE_LIMIT_CONFIGS } from './rate-limiting/rateLimiter.service';
import { SellWorkflowCollections } from './sell-workflow-collections';
import { SellWorkflowTransformers } from './sell-workflow-transformers';
import { WorkflowData, WorkflowProgress, WorkflowDraft } from './sell-workflow-types';

export class SellWorkflowOperations {
  /**
   * Save workflow data to Firestore with rate limiting
   */
  static async saveWorkflowData(
    userId: string,
    workflowData: WorkflowData,
    stepId?: string
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Rate limiting check
      const rateLimitResult = await rateLimiter.checkRateLimit(
        userId,
        'workflowSave',
        RATE_LIMIT_CONFIGS.WORKFLOW_SAVE
      );

      if (!rateLimitResult.allowed) {
        const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
        logger.warn('Workflow save rate limited', { userId, retryAfter });
        return {
          success: false,
          error: `Too many requests. Try again in ${retryAfter} seconds.`
        };
      }

      const collectionName = SellWorkflowCollections.getCollectionNameForVehicleType(
        workflowData.vehicleType || 'car'
      );

      const docData = {
        ...SellWorkflowTransformers.transformWorkflowData(workflowData, userId),
        userId,
        stepId: stepId || 'draft',
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      // Use transaction for atomicity
      const result = await runTransaction(db, async (transaction) => {
        const docRef = doc(collection(db, collectionName));
        transaction.set(docRef, docData);
        return docRef;
      });

      logger.info('Workflow data saved successfully', {
        userId,
        collection: collectionName,
        docId: result.id
      });

      return { success: true, id: result.id };
    } catch (error) {
      logger.error('Failed to save workflow data', error, { userId });
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Update existing workflow data
   */
  static async updateWorkflowData(
    docId: string,
    userId: string,
    updates: Partial<WorkflowData>,
    collectionName: string = 'cars'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Rate limiting check
      const rateLimitResult = await rateLimiter.checkRateLimit(
        userId,
        'workflowUpdate',
        RATE_LIMIT_CONFIGS.WORKFLOW_UPDATE
      );

      if (!rateLimitResult.allowed) {
        const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
        return {
          success: false,
          error: `Too many updates. Try again in ${retryAfter} seconds.`
        };
      }

      const transformedUpdates = SellWorkflowTransformers.transformWorkflowData(updates, userId);
      const docRef = doc(db, collectionName, docId);

      await updateDoc(docRef, {
        ...transformedUpdates,
        updatedAt: serverTimestamp()
      });

      logger.info('Workflow data updated', { docId, userId, collection: collectionName });
      return { success: true };
    } catch (error) {
      logger.error('Failed to update workflow data', error, { docId, userId });
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get workflow data by ID
   */
  static async getWorkflowData(
    docId: string,
    collectionName: string = 'cars'
  ): Promise<{ success: boolean; data?: WorkflowData; error?: string }> {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { success: false, error: 'Workflow data not found' };
      }

      const data = docSnap.data();
      const workflowData = SellWorkflowTransformers.transformCarListingToWorkflow(data as any);

      return { success: true, data: workflowData };
    } catch (error) {
      logger.error('Failed to get workflow data', error, { docId });
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Delete workflow data
   */
  static async deleteWorkflowData(
    docId: string,
    userId: string,
    collectionName: string = 'cars'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify ownership before deletion
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { success: false, error: 'Workflow data not found' };
      }

      const data = docSnap.data();
      if (data.userId !== userId) {
        return { success: false, error: 'Unauthorized to delete this workflow' };
      }

      await runTransaction(db, async (transaction) => {
        transaction.delete(docRef);
      });

      logger.info('Workflow data deleted', { docId, userId });
      return { success: true };
    } catch (error) {
      logger.error('Failed to delete workflow data', error, { docId, userId });
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Save workflow draft
   */
  static async saveDraft(
    userId: string,
    workflowData: WorkflowData,
    progress: WorkflowProgress
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const draftData: Omit<WorkflowDraft, 'id'> = {
        userId,
        data: SellWorkflowTransformers.sanitizeWorkflowData(workflowData),
        progress,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      };

      const docRef = await addDoc(
        collection(db, SellWorkflowCollections.getDraftsCollectionName()),
        {
          ...draftData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          expiresAt: Timestamp.fromDate(draftData.expiresAt)
        }
      );

      logger.info('Workflow draft saved', { userId, draftId: docRef.id });
      return { success: true, id: docRef.id };
    } catch (error) {
      logger.error('Failed to save workflow draft', error, { userId });
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Delete workflow draft
   */
  static async deleteDraft(
    userId: string,
    draftId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const collectionName = SellWorkflowCollections.getDraftsCollectionName();
      const docRef = doc(db, collectionName, draftId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { success: true }; // Already gone
      }

      if (docSnap.data().userId !== userId) {
        throw new Error('Unauthorized to delete this draft');
      }

      await runTransaction(db, async (transaction) => {
        transaction.delete(docRef);
      });

      logger.info('Workflow draft deleted successfully', { userId, draftId });
      return { success: true };
    } catch (error) {
      logger.error('Failed to delete workflow draft', error, { userId, draftId });
      return { success: false, error: (error as Error).message };
    }
  }
}