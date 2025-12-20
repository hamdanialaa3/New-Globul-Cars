// sell-workflow-service.ts - Unified sell workflow service
// Main service file that imports and orchestrates all workflow functionality
// Complies with 300-line limit by delegating to specialized modules

import { logger } from './logger-service';
import { SellWorkflowCollections } from './sell-workflow-collections';
import { SellWorkflowTransformers } from './sell-workflow-transformers';
import { SellWorkflowOperations } from './sell-workflow-operations';
import { SellWorkflowImages } from './sell-workflow-images';
import { SellWorkflowValidation } from './sell-workflow-validation';
import { WorkflowData, WorkflowProgress, WorkflowValidationResult } from './sell-workflow-types';
import { unifiedCarService } from './car/unified-car-service';

export class SellWorkflowService {
  // ==================== COLLECTION MANAGEMENT ====================

  /**
   * Get collection name for vehicle type
   */
  static getCollectionNameForVehicleType(vehicleType: string): string {
    return SellWorkflowCollections.getCollectionNameForVehicleType(vehicleType);
  }

  /**
   * Get all available collections
   */
  static getAllCollections(): string[] {
    return SellWorkflowCollections.getAllCollections();
  }

  // ==================== DATA TRANSFORMATION ====================

  /**
   * Create a new car listing with images
   * Orchestrates image upload and car creation
   */
  static async createCarListing(
    payload: any,
    userId: string,
    imageFiles: File[]
  ): Promise<{ carId: string; redirectUrl?: string }> {
    try {
      // 1. Upload images if any
      let imageUrls: string[] = [];
      if (imageFiles && imageFiles.length > 0) {
        logger.info('Starting image upload in createCarListing', { count: imageFiles.length, userId });
        const workflowId = this.generateWorkflowId(userId);
        const uploadResults = await SellWorkflowImages.uploadMultipleImages(imageFiles, userId, workflowId);

        // Filter successful uploads
        imageUrls = uploadResults
          .filter(r => r.uploaded && r.url)
          .map(r => r.url as string);

        if (imageUrls.length !== imageFiles.length) {
          const failedCount = imageFiles.length - imageUrls.length;
          logger.error('Image upload incomplete - aborting listing creation', new Error(`${failedCount} images failed to upload`), {
            attempted: imageFiles.length,
            successful: imageUrls.length
          });
          throw new Error(`Image upload failed: ${failedCount} images could not be uploaded. Please check your connection and try again.`);
        }
      }

      // 2. Prepare car data
      // Ensure payload doesn't contain Files or other non-serializable data
      const carData = {
        ...payload,
        sellerId: userId,
        // Merge existing images with newly uploaded ones
        // Handle payload.images as string (comma-separated) or array
        images: [
          ...(Array.isArray(payload.images)
            ? payload.images
            : (typeof payload.images === 'string' && payload.images.length > 0)
              ? payload.images.split(',').map((u: string) => u.trim())
              : []
          ),
          ...imageUrls
        ].filter((url) => {
          const isValid = typeof url === 'string' && url.length > 0 && !url.startsWith('blob:');
          if (typeof url === 'string' && url.startsWith('blob:')) {
            logger.warn('Skipping blob URL in car payload', { url });
          }
          return isValid;
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 3. Create car document via UnifiedCarService
      // This service handles the database write and cache invalidation
      logger.info('Calling unifyCarService.createCar', {
        imagesCount: imageUrls.length,
        carDataImagesCount: carData.images.length
      });
      const carResult = await unifiedCarService.createCar(carData);

      logger.info('Car listing created successfully via SellWorkflowService', {
        carId: carResult.id,
        userId,
        sellerNumericId: carResult.sellerNumericId,
        carNumericId: carResult.carNumericId
      });

      // 4. Return result
      return {
        carId: carResult.id,
        redirectUrl: `/car/${carResult.sellerNumericId}/${carResult.carNumericId}`
      };

    } catch (error) {
      logger.error('SellWorkflowService.createCarListing failed', error as Error);
      throw error;
    }
  }

  /**
   * Transform workflow data to car listing
   */
  static transformWorkflowData(workflowData: WorkflowData, userId: string) {
    return SellWorkflowTransformers.transformWorkflowData(workflowData, userId);
  }

  /**
   * Transform car listing to workflow data
   */
  static transformCarListingToWorkflow(carListing: any): WorkflowData {
    return SellWorkflowTransformers.transformCarListingToWorkflow(carListing);
  }

  /**
   * Sanitize workflow data
   */
  static sanitizeWorkflowData(data: WorkflowData): WorkflowData {
    return SellWorkflowTransformers.sanitizeWorkflowData(data);
  }

  // ==================== CORE OPERATIONS ====================

  /**
   * Save workflow data
   */
  static async saveWorkflowData(
    userId: string,
    workflowData: WorkflowData,
    stepId?: string
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    return SellWorkflowOperations.saveWorkflowData(userId, workflowData, stepId);
  }

  /**
   * Update workflow data
   */
  static async updateWorkflowData(
    docId: string,
    userId: string,
    updates: Partial<WorkflowData>,
    collectionName: string = 'cars'
  ): Promise<{ success: boolean; error?: string }> {
    return SellWorkflowOperations.updateWorkflowData(docId, userId, updates, collectionName);
  }

  /**
   * Get workflow data
   */
  static async getWorkflowData(
    docId: string,
    collectionName: string = 'cars'
  ): Promise<{ success: boolean; data?: WorkflowData; error?: string }> {
    return SellWorkflowOperations.getWorkflowData(docId, collectionName);
  }

  /**
   * Delete workflow data
   */
  static async deleteWorkflowData(
    docId: string,
    userId: string,
    collectionName: string = 'cars'
  ): Promise<{ success: boolean; error?: string }> {
    return SellWorkflowOperations.deleteWorkflowData(docId, userId, collectionName);
  }

  /**
   * Save workflow draft
   */
  static async saveDraft(
    userId: string,
    workflowData: WorkflowData,
    progress: WorkflowProgress
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    return SellWorkflowOperations.saveDraft(userId, workflowData, progress);
  }

  // ==================== IMAGE MANAGEMENT ====================

  /**
   * Upload single image
   */
  static async uploadImage(
    file: File,
    userId: string,
    workflowId: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    return SellWorkflowImages.uploadImage(file, userId, workflowId);
  }

  /**
   * Upload multiple images
   */
  static async uploadMultipleImages(
    files: File[],
    userId: string,
    workflowId: string
  ) {
    return SellWorkflowImages.uploadMultipleImages(files, userId, workflowId);
  }

  /**
   * Delete image
   */
  static async deleteImage(
    imageUrl: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    return SellWorkflowImages.deleteImage(imageUrl, userId);
  }

  /**
   * Compress image
   */
  static async compressImage(
    file: File,
    maxWidth: number = 1920,
    maxHeight: number = 1080,
    quality: number = 0.8
  ): Promise<File> {
    return SellWorkflowImages.compressImage(file, maxWidth, maxHeight, quality);
  }

  // ==================== VALIDATION ====================

  /**
   * Validate workflow data
   */
  static validateWorkflowData(workflowData: WorkflowData): WorkflowValidationResult {
    return SellWorkflowValidation.validateWorkflowData(workflowData);
  }

  /**
   * Validate workflow progress
   */
  static validateWorkflowProgress(progress: WorkflowProgress): { isValid: boolean; errors: string[] } {
    return SellWorkflowValidation.validateWorkflowProgress(progress);
  }

  /**
   * Validate images
   */
  static validateImages(images: string[], vehicleType: string): { isValid: boolean; errors: string[] } {
    return SellWorkflowValidation.validateImages(images, vehicleType);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Generate workflow ID
   */
  static generateWorkflowId(userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `wf_${userId}_${timestamp}_${random}`;
  }

  /**
   * Calculate workflow completion percentage
   */
  static calculateCompletionPercentage(progress: WorkflowProgress): number {
    if (progress.totalSteps === 0) return 0;
    return Math.round((progress.completedSteps / progress.totalSteps) * 100);
  }

  /**
   * Check if workflow is complete
   */
  static isWorkflowComplete(progress: WorkflowProgress): boolean {
    return progress.completedSteps === progress.totalSteps;
  }

  /**
   * Get next step in workflow
   */
  static getNextStep(progress: WorkflowProgress): number | null {
    if (this.isWorkflowComplete(progress)) return null;
    return progress.currentStep + 1;
  }

  /**
   * Get previous step in workflow
   */
  static getPreviousStep(progress: WorkflowProgress): number | null {
    if (progress.currentStep <= 1) return null;
    return progress.currentStep - 1;
  }
}

// ==================== LEGACY EXPORTS FOR BACKWARD COMPATIBILITY ====================

export { SellWorkflowCollections } from './sell-workflow-collections';
export { SellWorkflowTransformers } from './sell-workflow-transformers';
export { SellWorkflowOperations } from './sell-workflow-operations';
export { SellWorkflowImages } from './sell-workflow-images';
export { SellWorkflowValidation } from './sell-workflow-validation';
export * from './sell-workflow-types';

export default SellWorkflowService;