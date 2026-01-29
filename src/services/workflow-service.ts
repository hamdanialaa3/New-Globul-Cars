/**
 * Workflow Service
 * خدمة الـ workflow
 *
 * This module provides the main orchestrator for the workflow persistence system using the singleton pattern.
 * يوفر هذا الوحدة المنسق الرئيسي لنظام حفظ البيانات باستخدام نمط الـ singleton.
 */

import { WorkflowOperations } from './workflow-operations';
import { WORKFLOW_STEP_NAMES, LEGACY_STEP_MAPPING, REVERSE_STEP_MAPPING } from './workflow-data';
import {
  UnifiedWorkflowData,
  TimerState,
  ValidationResult,
  StorageUsage,
  LegacyWorkflowState,
  LegacyStorageUsage
} from './workflow-types';
import { logger } from './logger-service';

/**
 * Unified Workflow Persistence Service Class
 * فئة خدمة حفظ البيانات الموحدة
 */
class UnifiedWorkflowPersistenceService {
  private static instance: UnifiedWorkflowPersistenceService;

  private constructor() {}

  /**
   * Get singleton instance
   * الحصول على مثيل singleton
   */
  static getInstance(): UnifiedWorkflowPersistenceService {
    if (!UnifiedWorkflowPersistenceService.instance) {
      UnifiedWorkflowPersistenceService.instance = new UnifiedWorkflowPersistenceService();
    }
    return UnifiedWorkflowPersistenceService.instance;
  }

  // ==================== DATA OPERATIONS ====================

  /**
   * Save workflow data
   * حفظ بيانات الـ workflow
   */
  saveData(updates: Partial<UnifiedWorkflowData>, currentStep: number | string): void {
    return WorkflowOperations.saveData(updates, currentStep);
  }

  /**
   * Load workflow data
   * تحميل بيانات الـ workflow
   */
  loadData(): UnifiedWorkflowData | null {
    return WorkflowOperations.loadData();
  }

  /**
   * Get workflow data (partial)
   * الحصول على بيانات الـ workflow (جزئية)
   */
  getData(): Partial<UnifiedWorkflowData> {
    return WorkflowOperations.getData();
  }

  /**
   * Clear all workflow data
   * مسح جميع بيانات الـ workflow
   */
  async clearData(): Promise<void> {
    return WorkflowOperations.clearData();
  }

  // ==================== STEP MANAGEMENT ====================

  /**
   * Get current step
   * الحصول على الخطوة الحالية
   */
  getCurrentStep(): string | number | null {
    return WorkflowOperations.getCurrentStep();
  }

  /**
   * Update current step
   * تحديث الخطوة الحالية
   */
  updateCurrentStep(step: string | number): void {
    return WorkflowOperations.updateCurrentStep(step);
  }

  /**
   * Mark step as completed
   * وضع علامة على الخطوة كمكتملة
   */
  markStepCompleted(stepNumber: number): void {
    return WorkflowOperations.markStepCompleted(stepNumber);
  }

  /**
   * Check if step is completed
   * التحقق من اكتمال الخطوة
   */
  isStepCompleted(stepNumber: number): boolean {
    return WorkflowOperations.isStepCompleted(stepNumber);
  }

  /**
   * Mark as published
   * وضع علامة كنشر
   */
  markAsPublished(): void {
    return WorkflowOperations.markAsPublished();
  }

  // ==================== TIMER MANAGEMENT ====================

  /**
   * Get timer state
   * الحصول على حالة المؤقت
   */
  getTimerState(): TimerState {
    return WorkflowOperations.getTimerState();
  }

  /**
   * Subscribe to timer updates
   * الاشتراك في تحديثات المؤقت
   */
  subscribeToTimer(callback: (state: TimerState) => void): () => void {
    return WorkflowOperations.subscribeToTimer(callback);
  }

  /**
   * Subscribe to data clear events
   * الاشتراك في أحداث مسح البيانات
   */
  subscribeToClear(callback: () => void): () => void {
    return WorkflowOperations.subscribeToClear(callback);
  }

  // ==================== VALIDATION & UTILITIES ====================

  /**
   * Get workflow progress (0-100%)
   * الحصول على تقدم الـ workflow (0-100%)
   */
  getProgress(): number {
    return WorkflowOperations.getProgress();
  }

  /**
   * Validate workflow data
   * التحقق من صحة بيانات الـ workflow
   */
  validateData(strict: boolean = false): ValidationResult {
    return WorkflowOperations.validateData(strict);
  }

  /**
   * Get storage usage
   * الحصول على استخدام التخزين
   */
  getStorageUsage(): StorageUsage {
    return WorkflowOperations.getStorageUsage();
  }
}

// ==================== STATIC METHODS FOR BACKWARD COMPATIBILITY ====================

/**
 * Save workflow data (static method)
 * حفظ بيانات الـ workflow (طريقة ثابتة)
 */
export const saveData = (updates: Partial<UnifiedWorkflowData>, currentStep: number | string): void => {
  UnifiedWorkflowPersistenceService.getInstance().saveData(updates, currentStep);
};

/**
 * Load workflow data (static method)
 * تحميل بيانات الـ workflow (طريقة ثابتة)
 */
export const loadData = (): UnifiedWorkflowData | null => {
  return UnifiedWorkflowPersistenceService.getInstance().loadData();
};

/**
 * Get workflow data (static method)
 * الحصول على بيانات الـ workflow (طريقة ثابتة)
 */
export const getData = (): Partial<UnifiedWorkflowData> => {
  return UnifiedWorkflowPersistenceService.getInstance().getData();
};

/**
 * Clear workflow data (static method)
 * مسح بيانات الـ workflow (طريقة ثابتة)
 */
export const clearData = async (): Promise<void> => {
  return UnifiedWorkflowPersistenceService.getInstance().clearData();
};

/**
 * Get current step (static method)
 * الحصول على الخطوة الحالية (طريقة ثابتة)
 */
export const getCurrentStep = (): string | number | null => {
  return UnifiedWorkflowPersistenceService.getInstance().getCurrentStep();
};

/**
 * Update current step (static method)
 * تحديث الخطوة الحالية (طريقة ثابتة)
 */
export const updateCurrentStep = (step: string | number): void => {
  UnifiedWorkflowPersistenceService.getInstance().updateCurrentStep(step);
};

/**
 * Mark step as completed (static method)
 * وضع علامة على الخطوة كمكتملة (طريقة ثابتة)
 */
export const markStepCompleted = (stepNumber: number): void => {
  UnifiedWorkflowPersistenceService.getInstance().markStepCompleted(stepNumber);
};

/**
 * Check if step is completed (static method)
 * التحقق من اكتمال الخطوة (طريقة ثابتة)
 */
export const isStepCompleted = (stepNumber: number): boolean => {
  return UnifiedWorkflowPersistenceService.getInstance().isStepCompleted(stepNumber);
};

/**
 * Mark as published (static method)
 * وضع علامة كنشر (طريقة ثابتة)
 */
export const markAsPublished = (): void => {
  UnifiedWorkflowPersistenceService.getInstance().markAsPublished();
};

/**
 * Get timer state (static method)
 * الحصول على حالة المؤقت (طريقة ثابتة)
 */
export const getTimerState = (): TimerState => {
  return UnifiedWorkflowPersistenceService.getInstance().getTimerState();
};

/**
 * Subscribe to timer updates (static method)
 * الاشتراك في تحديثات المؤقت (طريقة ثابتة)
 */
export const subscribeToTimer = (callback: (state: TimerState) => void): () => void => {
  return UnifiedWorkflowPersistenceService.getInstance().subscribeToTimer(callback);
};

/**
 * Subscribe to data clear events (static method)
 * الاشتراك في أحداث مسح البيانات (طريقة ثابتة)
 */
export const subscribeToClear = (callback: () => void): () => void => {
  return UnifiedWorkflowPersistenceService.getInstance().subscribeToClear(callback);
};

/**
 * Get workflow progress (static method)
 * الحصول على تقدم الـ workflow (طريقة ثابتة)
 */
export const getProgress = (): number => {
  return UnifiedWorkflowPersistenceService.getInstance().getProgress();
};

/**
 * Validate workflow data (static method)
 * التحقق من صحة بيانات الـ workflow (طريقة ثابتة)
 */
export const validateData = (strict: boolean = false): ValidationResult => {
  return UnifiedWorkflowPersistenceService.getInstance().validateData(strict);
};

/**
 * Get storage usage (static method)
 * الحصول على استخدام التخزين (طريقة ثابتة)
 */
export const getStorageUsage = (): StorageUsage => {
  return UnifiedWorkflowPersistenceService.getInstance().getStorageUsage();
};

// ==================== BACKWARD COMPATIBILITY WRAPPERS ====================
// These wrappers allow old code using WorkflowPersistenceService to work with UnifiedWorkflowPersistenceService

/**
 * @deprecated Use UnifiedWorkflowPersistenceService.saveData() instead
 * Wrapper for backward compatibility with WorkflowPersistenceService.saveState()
 */
export const WorkflowPersistenceService = {
  /**
   * @deprecated Use UnifiedWorkflowPersistenceService.saveData() instead
   */
  saveState: (data: Record<string, any>, currentStep: string): void => {
    // Convert step string to number
    const stepNumber = LEGACY_STEP_MAPPING[currentStep] || 1;

    UnifiedWorkflowPersistenceService.getInstance().saveData(data as Partial<UnifiedWorkflowData>, stepNumber);
  },

  /**
   * @deprecated Use UnifiedWorkflowPersistenceService.loadData() instead
   */
  loadState: (): LegacyWorkflowState | null => {
    const data = UnifiedWorkflowPersistenceService.getInstance().loadData();
    if (!data) return null;

    // Convert step number to string
    const currentStep = REVERSE_STEP_MAPPING[data.currentStep as number] || 'vehicle-data';

    return {
      data: data as Record<string, any>,
      images: [], // Images are now in IndexedDB, not in state
      lastUpdated: data.lastSavedAt,
      currentStep
    };
  },

  /**
   * @deprecated Use UnifiedWorkflowPersistenceService.clearData() instead
   */
  clearState: (): void => {
    UnifiedWorkflowPersistenceService.getInstance().clearData().catch((error) => {
      logger.warn('Error clearing state in wrapper', { error });
    });
  },

  /**
   * @deprecated Use ImageStorageService.getImages() instead
   * Returns empty array for backward compatibility (images are now in IndexedDB)
   */
  getImages: (): string[] => {
    // Images are now stored in IndexedDB via ImageStorageService
    // Return empty array for backward compatibility
    // Callers should use ImageStorageService.getImages() to get File objects
    return [];
  },

  /**
   * @deprecated Use ImageStorageService.getImages() instead
   * Converts IndexedDB images to File objects
   */
  getImagesAsFiles: async (): Promise<File[]> => {
    try {
      const { ImageStorageService } = await import('./ImageStorageService');
      return await ImageStorageService.getImages();
    } catch (error) {
      logger.error('Error getting images as files', error as Error);
      return [];
    }
  },

  /**
   * @deprecated Use ImageStorageService.saveImages() instead
   */
  saveImages: async (files: File[]): Promise<void> => {
    const { ImageStorageService } = await import('./ImageStorageService');
    await ImageStorageService.saveImages(files);

    // Update imagesCount in workflow data
    const data = UnifiedWorkflowPersistenceService.getInstance().loadData();
    if (data) {
      UnifiedWorkflowPersistenceService.getInstance().saveData(
        { imagesCount: files.length },
        data.currentStep
      );
    }
  },

  /**
   * @deprecated Use ImageStorageService.clearImages() instead
   */
  clearImages: async (): Promise<void> => {
    const { ImageStorageService } = await import('./ImageStorageService');
    await ImageStorageService.clearImages();
  },

  /**
   * @deprecated Use UnifiedWorkflowPersistenceService.getCurrentStep() instead
   */
  getCurrentStep: (): string => {
    const step = UnifiedWorkflowPersistenceService.getInstance().getCurrentStep();
    return REVERSE_STEP_MAPPING[step as number] || 'vehicle-data';
  },

  /**
   * @deprecated Use UnifiedWorkflowPersistenceService.getProgress() instead
   */
  getProgress: (): number => {
    return UnifiedWorkflowPersistenceService.getInstance().getProgress();
  },

  /**
   * @deprecated Use UnifiedWorkflowPersistenceService.getStorageUsage() instead
   */
  getStorageUsage: (): LegacyStorageUsage => {
    const usage = UnifiedWorkflowPersistenceService.getInstance().getStorageUsage();
    return {
      used: usage.used,
      max: 5 * 1024 * 1024, // 5MB estimate
      percentage: usage.percentage
    };
  }
};

// ==================== EXPORTS ====================

export const unifiedWorkflowPersistenceService = UnifiedWorkflowPersistenceService.getInstance();

export default UnifiedWorkflowPersistenceService;