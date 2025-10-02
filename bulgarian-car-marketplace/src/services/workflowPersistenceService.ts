// Workflow Persistence Service
// خدمة حفظ حالة workflow في localStorage

import ImageOptimizationService from './imageOptimizationService';

const STORAGE_KEY = 'globul_sell_workflow_state';
const IMAGES_KEY = 'globul_sell_workflow_images';
const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours

export interface WorkflowState {
  data: Record<string, any>;
  images: string[]; // base64 encoded images
  lastUpdated: number;
  currentStep: string;
}

export class WorkflowPersistenceService {
  /**
   * Save workflow state to localStorage
   */
  static saveState(data: Record<string, any>, currentStep: string): void {
    try {
      const state: WorkflowState = {
        data,
        images: this.getImages(),
        lastUpdated: Date.now(),
        currentStep
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      console.log('💾 Workflow state saved');
    } catch (error) {
      console.error('❌ Error saving workflow state:', error);
    }
  }

  /**
   * Load workflow state from localStorage
   */
  static loadState(): WorkflowState | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;

      const state: WorkflowState = JSON.parse(saved);

      // Check if expired
      if (Date.now() - state.lastUpdated > EXPIRY_TIME) {
        console.log('⏰ Workflow state expired, clearing...');
        this.clearState();
        return null;
      }

      console.log('✅ Workflow state loaded');
      return state;
    } catch (error) {
      console.error('❌ Error loading workflow state:', error);
      return null;
    }
  }

  /**
   * Clear workflow state
   */
  static clearState(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(IMAGES_KEY);
    console.log('🗑️ Workflow state cleared');
  }

  /**
   * Save images as base64
   */
  static async saveImages(files: File[]): Promise<void> {
    try {
      console.log(`💾 Saving ${files.length} images to localStorage...`);
      
      const base64Images = await Promise.all(
        files.map(file => ImageOptimizationService.imageToBase64(file))
      );

      localStorage.setItem(IMAGES_KEY, JSON.stringify(base64Images));
      console.log('✅ Images saved');
    } catch (error) {
      console.error('❌ Error saving images:', error);
      throw error;
    }
  }

  /**
   * Load images from base64
   */
  static getImages(): string[] {
    try {
      const saved = localStorage.getItem(IMAGES_KEY);
      if (!saved) return [];

      return JSON.parse(saved);
    } catch (error) {
      console.error('❌ Error loading images:', error);
      return [];
    }
  }

  /**
   * Convert saved base64 images back to Files
   */
  static getImagesAsFiles(): File[] {
    try {
      const base64Images = this.getImages();
      
      return base64Images.map((base64, index) => 
        ImageOptimizationService.base64ToFile(base64, `car-image-${index}.jpg`)
      );
    } catch (error) {
      console.error('❌ Error converting images to files:', error);
      return [];
    }
  }

  /**
   * Get workflow progress percentage
   */
  static getProgress(): number {
    const state = this.loadState();
    if (!state) return 0;

    const data = state.data;
    const requiredFields = [
      'vehicleType',
      'sellerType',
      'make',
      'model',
      'year',
      'price',
      'sellerName',
      'sellerEmail',
      'sellerPhone',
      'region'
    ];

    const completedFields = requiredFields.filter(field => data[field]).length;
    return Math.round((completedFields / requiredFields.length) * 100);
  }

  /**
   * Check if workflow has unsaved changes
   */
  static hasUnsavedChanges(): boolean {
    const state = this.loadState();
    return !!state && Object.keys(state.data).length > 0;
  }

  /**
   * Get time since last save
   */
  static getTimeSinceLastSave(): number | null {
    const state = this.loadState();
    if (!state) return null;

    return Date.now() - state.lastUpdated;
  }

  /**
   * Auto-save workflow data
   */
  static autoSave(data: Record<string, any>, currentStep: string): void {
    // Debounce auto-save
    const timeout = setTimeout(() => {
      this.saveState(data, currentStep);
    }, 500);

    // Store timeout to clear if needed
    (window as any).__workflowAutoSaveTimeout = timeout;
  }

  /**
   * Clear auto-save timeout
   */
  static clearAutoSaveTimeout(): void {
    if ((window as any).__workflowAutoSaveTimeout) {
      clearTimeout((window as any).__workflowAutoSaveTimeout);
    }
  }
}

export default WorkflowPersistenceService;


