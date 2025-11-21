// Workflow Persistence Service
// خدمة حفظ حالة workflow في localStorage

import ImageOptimizationService from './imageOptimizationService';
import { serviceLogger } from './logger-wrapper';
import SellWorkflowStepStateService from './sellWorkflowStepState';
import { SELL_WORKFLOW_STEP_ORDER } from '@globul-cars/core/constantssellWorkflowSteps';

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
      serviceLogger.info('Workflow state saved', { currentStep });
    } catch (error) {
      serviceLogger.error('Error saving workflow state', error as Error, { currentStep });
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
        serviceLogger.info('Workflow state expired, clearing');
        this.clearState();
        return null;
      }

      serviceLogger.info('Workflow state loaded', { currentStep: state.currentStep });
      return state;
    } catch (error) {
      serviceLogger.error('Error loading workflow state', error as Error);
      return null;
    }
  }

  /**
   * Clear workflow state
   */
  static clearState(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(IMAGES_KEY);
    SellWorkflowStepStateService.reset();
    serviceLogger.info('Workflow state cleared');
  }

  /**
   * Save images as base64
   */
  static async saveImages(files: File[]): Promise<void> {
    try {
      serviceLogger.info('Saving images to localStorage', { count: files.length });

      // Check total file size before conversion
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      const maxStorageSize = 4 * 1024 * 1024; // 4MB limit for localStorage safety

      if (totalSize > maxStorageSize) {
        serviceLogger.warn('Large image files detected', { totalSize, maxStorageSize });
        // Continue anyway but log the warning
      }

      const base64Images = await Promise.all(
        files.map(file => ImageOptimizationService.imageToBase64(file))
      );

      // Check the size of the base64 data
      const base64Data = JSON.stringify(base64Images);
      const base64Size = new Blob([base64Data]).size;

      if (base64Size > maxStorageSize) {
        serviceLogger.warn('Base64 data too large for localStorage', { base64Size, maxStorageSize });
        throw new Error('Image data too large to store temporarily. Please use fewer or smaller images.');
      }

      localStorage.setItem(IMAGES_KEY, base64Data);
      serviceLogger.info('Images saved successfully', { count: files.length, base64Size });
    } catch (error) {
      serviceLogger.error('Error saving images', error as Error, { count: files.length });
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
      serviceLogger.error('Error loading images', error as Error);
      return [];
    }
  }

  /**
   * Get storage usage information
   */
  static getStorageUsage(): { used: number; max: number; percentage: number } {
    try {
      const state = localStorage.getItem(STORAGE_KEY);
      const images = localStorage.getItem(IMAGES_KEY);
      
      let totalSize = 0;
      if (state) totalSize += new Blob([state]).size;
      if (images) totalSize += new Blob([images]).size;
      
      // Estimate max localStorage size (typically 5-10MB)
      const maxSize = 5 * 1024 * 1024; // 5MB conservative estimate
      
      return {
        used: totalSize,
        max: maxSize,
        percentage: (totalSize / maxSize) * 100
      };
    } catch (error) {
      serviceLogger.error('Error calculating storage usage', error as Error);
      return { used: 0, max: 5 * 1024 * 1024, percentage: 0 };
    }
  }

  /**
   * Clear persisted images
   */
  static clearImages(): void {
    localStorage.removeItem(IMAGES_KEY);
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
      serviceLogger.error('Error converting images to files', error as Error);
      return [];
    }
  }

  /**
   * حساب النسبة المئوية للتقدم (0-100%)
   * 50% من البيانات الفعلية + 50% من الخطوات المكتملة
   * منطق البيانات يعتمد على النقاط (135 نقطة = 100%)
   */
  static getProgress(): number {
    const state = this.loadState();
    const data = state?.data || {};
    const images = this.getImages();

    let totalPoints = 0;
    let earnedPoints = 0;

    const isFilled = (value: unknown): boolean => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object') return Object.keys(value as Record<string, unknown>).length > 0;
      return true;
    };

    const addGroup = (fields: string[], weight: number) => {
      totalPoints += fields.length * weight;
      fields.forEach(field => {
        if (isFilled((data as Record<string, any>)[field])) {
          earnedPoints += weight;
        }
      });
    };

    // معلومات أساسية عن السيارة (8 حقول × 4 نقاط)
    addGroup(
      [
        'vehicleType',
        'sellerType',
        'make',
        'model',
        'generation',
        'trim',
        'year',
        'mileage'
      ],
      4
    );

    // التفاصيل التقنية (6 حقول × 4 نقاط)
    addGroup(
      [
        'fuelType',
        'transmission',
        'engineSize',
        'power',
        'driveType',
        'emissionClass'
      ],
      4
    );

    // معلومات إضافية (5 حقول × 3 نقاط)
    addGroup(
      ['vin', 'registration', 'condition', 'previousOwners', 'serviceHistory'],
      3
    );

    // المعدات / التجهيزات (4 فئات × 6 نقاط لكل فئة)
    ['safety', 'comfort', 'infotainment', 'extras'].forEach(field => {
      totalPoints += 6;
      if (isFilled((data as Record<string, any>)[field])) {
        earnedPoints += 6;
      }
    });

    // الصور حتى 5 صور = 25 نقطة كاملة
    const maxImagePoints = 25;
    totalPoints += maxImagePoints;
    if (images.length > 0) {
      const cappedCount = Math.min(images.length, 5);
      earnedPoints += Math.round((cappedCount / 5) * maxImagePoints);
    }

    // التسعير (5 حقول × 4 نقاط)
    addGroup(
      ['price', 'currency', 'priceType', 'negotiable', 'financing'],
      4
    );

    // طرق الاتصال والموقع (8 حقول × 4 نقاط)
    addGroup(
      [
        'sellerName',
        'sellerEmail',
        'sellerPhone',
        'preferredContact',
        'region',
        'city',
        'location',
        'availableHours'
      ],
      4
    );

    // ============================================
    // نسبة البيانات الفعلية (135 نقطة = 100%)
    // ============================================
    let dataPercentage = 0;
    if (totalPoints > 0) {
      dataPercentage = Math.round((earnedPoints / totalPoints) * 100);
      dataPercentage = Math.min(dataPercentage, 100);
    }

    // ============================================
    // نسبة الخطوات المكتملة (7 خطوات رئيسية)
    // ============================================
    let stepsPercentage = 0;
    try {
      const statuses = SellWorkflowStepStateService.getStatuses();
      const totalSteps = SELL_WORKFLOW_STEP_ORDER.length;
      if (totalSteps === 0) {
        serviceLogger.warn('SELL_WORKFLOW_STEP_ORDER is empty');
      } else {
        const completedSteps = SELL_WORKFLOW_STEP_ORDER.reduce((count, stepId) => {
          return statuses[stepId] === 'completed' ? count + 1 : count;
        }, 0);

        stepsPercentage = Math.round((completedSteps / totalSteps) * 100);
        stepsPercentage = Math.min(stepsPercentage, 100);

        if (process.env.NODE_ENV === 'development') {
          serviceLogger.info('Progress calculation', {
            completedSteps,
            totalSteps,
            stepsPercentage,
            dataPercentage
          });
        }
      }
    } catch (error) {
      serviceLogger.warn('Failed to calculate steps percentage', { error });
      stepsPercentage = 0;
    }

    // ============================================
    // النتيجة النهائية: 50% بيانات + 50% خطوات
    // إذا لا توجد بيانات نرجع نسبة الخطوات فقط
    // ============================================
    if (totalPoints === 0) {
      return Math.min(stepsPercentage, 100);
    }

    const finalPercentage = Math.round((dataPercentage * 0.5) + (stepsPercentage * 0.5));
    return Math.min(finalPercentage, 100);
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


