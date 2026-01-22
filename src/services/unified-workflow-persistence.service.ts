/**
 * Unified Workflow Persistence Service
 * خدمة موحدة لحفظ بيانات سير العمل
 * 
 * Provides unified workflow data persistence with:
 * - LocalStorage for metadata
 * - IndexedDB for images (via ImageStorageService)
 * - 20-minute auto-deletion timer
 * - Debounced save operations
 * - Cloud sync capability (Firestore)
 * - Backward compatibility with legacy WorkflowPersistenceService
 * 
 * @module unified-workflow-persistence.service
 * @author Koli One Team
 * @date January 2026
 */

import { serviceLogger as logger } from './logger-service';
import { normalizeError } from '@/utils/error-helpers';

// ============================================================================
// CONSTANTS - الثوابت
// ============================================================================

/**
 * Timer duration: 20 minutes in milliseconds
 * مدة المؤقت: 20 دقيقة بالميلي ثانية
 */
export const TIMER_DURATION = 20 * 60 * 1000;

/**
 * Timer update interval: 1 second
 * فترة تحديث المؤقت: ثانية واحدة
 */
export const TIMER_UPDATE_INTERVAL = 1000;

/**
 * LocalStorage key for workflow data
 * مفتاح التخزين المحلي لبيانات سير العمل
 */
export const STORAGE_KEY = 'unified-workflow-data';

/**
 * Debounce delay for save operations (milliseconds)
 * تأخير الحفظ للعمليات المتكررة
 */
export const SAVE_DEBOUNCE_MS = 100;

/**
 * Maximum storage size: 5MB
 * الحد الأقصى لحجم التخزين: 5 ميجابايت
 */
export const MAX_STORAGE_SIZE = 5 * 1024 * 1024;

/**
 * Workflow steps mapping
 * خريطة خطوات سير العمل
 */
export const WORKFLOW_STEPS: Record<string, number> = {
  'vehicle-type': 1,
  'basic': 2,
  'features': 3,
  'description': 4,
  'pricing': 5,
  'images': 6,
  'review': 7,
};

/**
 * Validation messages
 * رسائل التحقق من الصحة
 */
export const VALIDATION_MESSAGES = {
  MISSING_VEHICLE_TYPE: 'Vehicle type is required',
  MISSING_TITLE: 'Title is required',
  MISSING_YEAR: 'Year is required',
  INVALID_YEAR: 'Year must be between 1900 and current year + 1',
  MISSING_PRICE: 'Price is required',
  INVALID_PRICE: 'Price must be greater than 0',
  MISSING_MILEAGE: 'Mileage is required',
  INVALID_MILEAGE: 'Mileage cannot be negative',
  MISSING_DESCRIPTION: 'Description is required',
  MISSING_IMAGES: 'At least one image is required',
  STORAGE_OVERFLOW: 'Storage size exceeds maximum limit',
};

// ============================================================================
// TYPE DEFINITIONS - تعريفات الأنواع
// ============================================================================

/**
 * Unified workflow data structure
 * بنية بيانات سير العمل الموحدة
 */
export interface UnifiedWorkflowData {
  vehicleType?: string;
  title?: string;
  year?: number;
  make?: string;
  model?: string;
  mileage?: number;
  price?: number;
  currency?: string;
  description?: string;
  features?: Record<string, any>;
  condition?: string;
  images?: string[];
  currentStep?: string | number;
  completedSteps?: number[];
  lastSaved?: number;
  isPublished?: boolean;
  userId?: string;
  [key: string]: any;
}

/**
 * Timer state
 * حالة المؤقت
 */
export interface TimerState {
  isActive: boolean;
  remainingTime: number;
  startTime: number | null;
  isPaused: boolean;
}

/**
 * Validation result
 * نتيجة التحقق من الصحة
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Storage usage information
 * معلومات استخدام التخزين
 */
export interface StorageUsage {
  totalSize: number;
  localStorageSize: number;
  indexedDBSize: number;
  percentUsed: number;
  isNearLimit: boolean;
}

/**
 * Legacy workflow state (for backward compatibility)
 * حالة سير العمل القديمة (للتوافق مع الإصدارات السابقة)
 */
export interface LegacyWorkflowState {
  currentStep?: string;
  vehicleType?: string;
  basicInfo?: any;
  features?: any;
  description?: string;
  pricing?: any;
  images?: string[];
  lastSaved?: number;
}

/**
 * Legacy storage usage (for backward compatibility)
 * استخدام التخزين القديم (للتوافق مع الإصدارات السابقة)
 */
export interface LegacyStorageUsage {
  localStorage: number;
  indexedDB: number;
  total: number;
}

// ============================================================================
// MAIN SERVICE CLASS - فئة الخدمة الرئيسية
// ============================================================================

/**
 * Unified Workflow Persistence Service
 * خدمة حفظ سير العمل الموحدة
 * 
 * Singleton service for managing workflow data persistence across:
 * - LocalStorage (metadata)
 * - IndexedDB (images via ImageStorageService)
 * - Firestore (cloud sync)
 */
export class UnifiedWorkflowPersistenceService {
  private static instance: UnifiedWorkflowPersistenceService;
  
  private data: Partial<UnifiedWorkflowData> = {};
  private timerState: TimerState = {
    isActive: false,
    remainingTime: TIMER_DURATION,
    startTime: null,
    isPaused: false,
  };
  
  private timerInterval: NodeJS.Timeout | null = null;
  private saveDebounceTimer: NodeJS.Timeout | null = null;
  private timerSubscribers: Set<(state: TimerState) => void> = new Set();
  private clearSubscribers: Set<() => void> = new Set();
  private isSaving = false;

  /**
   * Private constructor for singleton pattern
   * منشئ خاص لنمط السينجلتون
   */
  private constructor() {
    this.loadDataFromStorage();
    this.initializeTimer();
  }

  /**
   * Get singleton instance
   * الحصول على نسخة السينجلتون
   */
  public static getInstance(): UnifiedWorkflowPersistenceService {
    if (!UnifiedWorkflowPersistenceService.instance) {
      UnifiedWorkflowPersistenceService.instance = new UnifiedWorkflowPersistenceService();
    }
    return UnifiedWorkflowPersistenceService.instance;
  }

  // ==========================================================================
  // INITIALIZATION - التهيئة
  // ==========================================================================

  /**
   * Load data from localStorage
   * تحميل البيانات من التخزين المحلي
   */
  private loadDataFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.data = JSON.parse(stored);
        logger.info('Loaded workflow data from localStorage', {
          hasData: Object.keys(this.data).length > 0,
          currentStep: this.data.currentStep,
        });
      }
    } catch (error) {
      logger.error('Failed to load workflow data', normalizeError(error));
      this.data = {};
    }
  }

  /**
   * Initialize auto-deletion timer
   * تهيئة مؤقت الحذف التلقائي
   */
  private initializeTimer(): void {
    // Check if there's saved data and it's not published
    if (Object.keys(this.data).length > 0 && !this.data.isPublished) {
      const lastSaved = this.data.lastSaved || Date.now();
      const elapsed = Date.now() - lastSaved;
      const remaining = TIMER_DURATION - elapsed;

      if (remaining > 0) {
        this.timerState = {
          isActive: true,
          remainingTime: remaining,
          startTime: lastSaved,
          isPaused: false,
        };
        this.startTimerInterval();
      } else {
        // Timer expired, clear data
        this.executeFullReset().catch(error => {
          logger.error('Failed to clear expired data', normalizeError(error));
        });
      }
    }
  }

  /**
   * Start timer interval
   * بدء فترة المؤقت
   */
  private startTimerInterval(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      if (!this.timerState.isPaused && this.timerState.isActive) {
        this.timerState.remainingTime -= TIMER_UPDATE_INTERVAL;

        if (this.timerState.remainingTime <= 0) {
          this.timerState.remainingTime = 0;
          this.timerState.isActive = false;
          this.stopTimerInterval();
          
          // Auto-delete if not published
          if (!this.data.isPublished) {
            this.executeFullReset().catch(error => {
              logger.error('Failed to auto-delete expired data', normalizeError(error));
            });
          }
        }

        this.notifyTimerSubscribers();
      }
    }, TIMER_UPDATE_INTERVAL);
  }

  /**
   * Stop timer interval
   * إيقاف فترة المؤقت
   */
  private stopTimerInterval(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Reset timer
   * إعادة تعيين المؤقت
   */
  private resetTimer(): void {
    this.timerState = {
      isActive: true,
      remainingTime: TIMER_DURATION,
      startTime: Date.now(),
      isPaused: false,
    };
    this.startTimerInterval();
    this.notifyTimerSubscribers();
  }

  // ==========================================================================
  // SAVE & LOAD OPERATIONS - عمليات الحفظ والتحميل
  // ==========================================================================

  /**
   * Save workflow data with debouncing
   * حفظ بيانات سير العمل مع التأخير
   * 
   * @param updates - Partial data to merge
   * @param currentStep - Optional current step
   * @returns Promise that resolves when save is complete
   */
  public async saveData(
    updates: Partial<UnifiedWorkflowData>,
    currentStep?: string | number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Clear existing debounce timer
      if (this.saveDebounceTimer) {
        clearTimeout(this.saveDebounceTimer);
      }

      // Debounce the save operation
      this.saveDebounceTimer = setTimeout(async () => {
        // Prevent concurrent saves
        if (this.isSaving) {
          logger.warn('Save already in progress, skipping');
          resolve();
          return;
        }

        this.isSaving = true;

        try {
          // Merge updates
          this.data = { ...this.data, ...updates };
          
          if (currentStep !== undefined) {
            this.data.currentStep = currentStep;
          }

          this.data.lastSaved = Date.now();

          // Save to localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));

          // Reset timer if not published
          if (!this.data.isPublished) {
            this.resetTimer();
          }

          logger.info('Workflow data saved', {
            currentStep: this.data.currentStep,
            hasImages: Boolean(this.data.images?.length),
            dataSize: JSON.stringify(this.data).length,
          });

          resolve();
        } catch (error) {
          logger.error('Failed to save workflow data', normalizeError(error));
          reject(error);
        } finally {
          this.isSaving = false;
        }
      }, SAVE_DEBOUNCE_MS);
    });
  }

  /**
   * Load workflow data
   * تحميل بيانات سير العمل
   * 
   * @returns Workflow data or null if not found
   */
  public loadData(): UnifiedWorkflowData | null {
    if (Object.keys(this.data).length === 0) {
      return null;
    }
    return { ...this.data } as UnifiedWorkflowData;
  }

  /**
   * Get current workflow data (non-null)
   * الحصول على بيانات سير العمل الحالية
   * 
   * @returns Partial workflow data (always returns object)
   */
  public getData(): Partial<UnifiedWorkflowData> {
    return { ...this.data };
  }

  /**
   * Clear all workflow data
   * مسح جميع بيانات سير العمل
   * 
   * @returns Promise that resolves when clear is complete
   */
  public async clearData(): Promise<void> {
    try {
      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY);

      // Clear IndexedDB images (dynamic import)
      try {
        const { ImageStorageService } = await import('./ImageStorageService');
        await ImageStorageService.clearImages();
      } catch (error) {
        logger.warn('Failed to clear IndexedDB images', { error: error instanceof Error ? error : new Error(String(error)) });
      }

      // Reset in-memory data
      this.data = {};

      // Stop and reset timer
      this.stopTimerInterval();
      this.timerState = {
        isActive: false,
        remainingTime: TIMER_DURATION,
        startTime: null,
        isPaused: false,
      };

      // Notify clear subscribers
      this.notifyClearSubscribers();

      logger.info('Workflow data cleared successfully');
    } catch (error) {
      logger.error('Failed to clear workflow data', normalizeError(error));
      throw error;
    }
  }

  // ==========================================================================
  // STEP MANAGEMENT - إدارة الخطوات
  // ==========================================================================

  /**
   * Get current step
   * الحصول على الخطوة الحالية
   * 
   * @returns Current step name or number, or null
   */
  public getCurrentStep(): string | number | null {
    return this.data.currentStep ?? null;
  }

  /**
   * Update current step
   * تحديث الخطوة الحالية
   * 
   * @param step - Step name or number
   */
  public updateCurrentStep(step: string | number): void {
    this.data.currentStep = step;
    this.data.lastSaved = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    
    // Reset timer
    if (!this.data.isPublished) {
      this.resetTimer();
    }
  }

  /**
   * Mark step as completed
   * تحديد الخطوة كمكتملة
   * 
   * @param stepNumber - Step number (1-7)
   */
  public markStepCompleted(stepNumber: number): void {
    if (!this.data.completedSteps) {
      this.data.completedSteps = [];
    }
    
    if (!this.data.completedSteps.includes(stepNumber)) {
      this.data.completedSteps.push(stepNumber);
      this.data.lastSaved = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    }
  }

  /**
   * Check if step is completed
   * التحقق من اكتمال الخطوة
   * 
   * @param stepNumber - Step number (1-7)
   * @returns True if step is completed
   */
  public isStepCompleted(stepNumber: number): boolean {
    return this.data.completedSteps?.includes(stepNumber) ?? false;
  }

  /**
   * Mark workflow as published (prevents auto-deletion)
   * تحديد سير العمل كمنشور (يمنع الحذف التلقائي)
   */
  public markAsPublished(): void {
    this.data.isPublished = true;
    this.data.lastSaved = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    
    // Stop timer
    this.timerState.isActive = false;
    this.stopTimerInterval();
    this.notifyTimerSubscribers();
  }

  // ==========================================================================
  // TIMER MANAGEMENT - إدارة المؤقت
  // ==========================================================================

  /**
   * Get timer state
   * الحصول على حالة المؤقت
   * 
   * @returns Current timer state
   */
  public getTimerState(): TimerState {
    return { ...this.timerState };
  }

  /**
   * Subscribe to timer updates
   * الاشتراك في تحديثات المؤقت
   * 
   * @param callback - Callback function
   * @returns Unsubscribe function
   */
  public subscribeToTimer(callback: (state: TimerState) => void): () => void {
    this.timerSubscribers.add(callback);
    
    // Immediately notify with current state
    callback(this.getTimerState());
    
    return () => {
      this.timerSubscribers.delete(callback);
    };
  }

  /**
   * Subscribe to clear events
   * الاشتراك في أحداث المسح
   * 
   * @param callback - Callback function
   * @returns Unsubscribe function
   */
  public subscribeToClear(callback: () => void): () => void {
    this.clearSubscribers.add(callback);
    
    return () => {
      this.clearSubscribers.delete(callback);
    };
  }

  /**
   * Notify timer subscribers
   * إخطار المشتركين في المؤقت
   */
  private notifyTimerSubscribers(): void {
    const state = this.getTimerState();
    this.timerSubscribers.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        logger.error('Timer subscriber error', normalizeError(error));
      }
    });
  }

  /**
   * Notify clear subscribers
   * إخطار المشتركين في المسح
   */
  private notifyClearSubscribers(): void {
    this.clearSubscribers.forEach(callback => {
      try {
        callback();
      } catch (error) {
        logger.error('Clear subscriber error', normalizeError(error));
      }
    });
  }

  // ==========================================================================
  // PROGRESS & VALIDATION - التقدم والتحقق
  // ==========================================================================

  /**
   * Get workflow progress (0-100)
   * الحصول على تقدم سير العمل
   * 
   * @returns Progress percentage
   */
  public getProgress(): number {
    const totalSteps = Object.keys(WORKFLOW_STEPS).length;
    const completedCount = this.data.completedSteps?.length ?? 0;
    return Math.round((completedCount / totalSteps) * 100);
  }

  /**
   * Validate workflow data
   * التحقق من صحة بيانات سير العمل
   * 
   * @param strict - If true, requires all fields for publish
   * @returns Validation result
   */
  public validateData(strict = false): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validations
    if (!this.data.vehicleType) {
      errors.push(VALIDATION_MESSAGES.MISSING_VEHICLE_TYPE);
    }

    if (!this.data.title) {
      errors.push(VALIDATION_MESSAGES.MISSING_TITLE);
    }

    if (!this.data.year) {
      errors.push(VALIDATION_MESSAGES.MISSING_YEAR);
    } else {
      const currentYear = new Date().getFullYear();
      if (this.data.year < 1900 || this.data.year > currentYear + 1) {
        errors.push(VALIDATION_MESSAGES.INVALID_YEAR);
      }
    }

    if (strict) {
      if (!this.data.price) {
        errors.push(VALIDATION_MESSAGES.MISSING_PRICE);
      } else if (this.data.price <= 0) {
        errors.push(VALIDATION_MESSAGES.INVALID_PRICE);
      }

      if (this.data.mileage === undefined) {
        errors.push(VALIDATION_MESSAGES.MISSING_MILEAGE);
      } else if (this.data.mileage < 0) {
        errors.push(VALIDATION_MESSAGES.INVALID_MILEAGE);
      }

      if (!this.data.description) {
        errors.push(VALIDATION_MESSAGES.MISSING_DESCRIPTION);
      }

      if (!this.data.images || this.data.images.length === 0) {
        errors.push(VALIDATION_MESSAGES.MISSING_IMAGES);
      }
    } else {
      // Soft validations (warnings only)
      if (!this.data.price || this.data.price <= 0) {
        warnings.push('Price is recommended');
      }
      if (!this.data.description) {
        warnings.push('Description is recommended');
      }
      if (!this.data.images || this.data.images.length === 0) {
        warnings.push('At least one image is recommended');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get storage usage information
   * الحصول على معلومات استخدام التخزين
   * 
   * @returns Storage usage details
   */
  public async getStorageUsage(): Promise<StorageUsage> {
    try {
      // LocalStorage size
      const localStorageSize = new Blob([JSON.stringify(this.data)]).size;

      // IndexedDB size (estimate from image count)
      let indexedDBSize = 0;
      try {
        const { ImageStorageService } = await import('./ImageStorageService');
        const imageCount = await ImageStorageService.getImagesCount?.() ?? 0;
        // Estimate: average 500KB per image
        indexedDBSize = imageCount * 500 * 1024;
      } catch (error) {
        logger.warn('Failed to get IndexedDB size', { error: error instanceof Error ? error : new Error(String(error)) });
      }

      const totalSize = localStorageSize + indexedDBSize;
      const percentUsed = (totalSize / MAX_STORAGE_SIZE) * 100;
      const isNearLimit = percentUsed > 80;

      return {
        totalSize,
        localStorageSize,
        indexedDBSize,
        percentUsed,
        isNearLimit,
      };
    } catch (error) {
      logger.error('Failed to get storage usage', normalizeError(error));
      return {
        totalSize: 0,
        localStorageSize: 0,
        indexedDBSize: 0,
        percentUsed: 0,
        isNearLimit: false,
      };
    }
  }

  // ==========================================================================
  // CLOUD SYNC - المزامنة السحابية
  // ==========================================================================

  /**
   * Save workflow data to Firestore
   * حفظ بيانات سير العمل إلى Firestore
   * 
   * @param userId - User ID
   * @returns Promise that resolves when save is complete
   */
  public async saveToCloud(userId: string): Promise<void> {
    try {
      const { db } = await import('@/firebase/firebase-config');
      const { doc, setDoc } = await import('firebase/firestore');

      const docRef = doc(db, 'workflow_drafts', userId);
      await setDoc(docRef, {
        ...this.data,
        userId,
        lastSaved: Date.now(),
        syncedAt: Date.now(),
      });

      logger.info('Workflow data saved to cloud', { userId });
    } catch (error) {
      logger.error('Failed to save workflow data to cloud', normalizeError(error));
      throw error;
    }
  }

  /**
   * Load workflow data from Firestore
   * تحميل بيانات سير العمل من Firestore
   * 
   * @param userId - User ID
   * @returns Promise that resolves when load is complete
   */
  public async loadFromCloud(userId: string): Promise<void> {
    try {
      const { db } = await import('@/firebase/firebase-config');
      const { doc, getDoc } = await import('firebase/firestore');

      const docRef = doc(db, 'workflow_drafts', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const cloudData = docSnap.data() as UnifiedWorkflowData;
        
        // Merge with local data (prefer cloud data)
        this.data = { ...this.data, ...cloudData };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));

        // Reset timer if not published
        if (!this.data.isPublished) {
          this.resetTimer();
        }

        logger.info('Workflow data loaded from cloud', { userId });
      } else {
        logger.info('No cloud data found for user', { userId });
      }
    } catch (error) {
      logger.error('Failed to load workflow data from cloud', normalizeError(error));
      throw error;
    }
  }

  /**
   * Delete workflow data from Firestore
   * حذف بيانات سير العمل من Firestore
   * 
   * @param userId - User ID
   * @returns Promise that resolves when delete is complete
   */
  public async deleteFromCloud(userId: string): Promise<void> {
    try {
      const { db } = await import('@/firebase/firebase-config');
      const { doc, deleteDoc } = await import('firebase/firestore');

      const docRef = doc(db, 'workflow_drafts', userId);
      await deleteDoc(docRef);

      logger.info('Workflow data deleted from cloud', { userId });
    } catch (error) {
      logger.error('Failed to delete workflow data from cloud', normalizeError(error));
      throw error;
    }
  }

  // ==========================================================================
  // FULL RESET - إعادة تعيين كاملة
  // ==========================================================================

  /**
   * Execute full reset (clear all data and timer)
   * تنفيذ إعادة تعيين كاملة
   * 
   * @returns Promise that resolves when reset is complete
   */
  public async executeFullReset(): Promise<void> {
    await this.clearData();
    logger.info('Full workflow reset executed');
  }
}

// ============================================================================
// SINGLETON EXPORT - تصدير السينجلتون
// ============================================================================

/**
 * Singleton instance of UnifiedWorkflowPersistenceService
 * نسخة السينجلتون من خدمة حفظ سير العمل الموحدة
 */
export const unifiedWorkflowPersistence = UnifiedWorkflowPersistenceService.getInstance();

// ============================================================================
// BACKWARD COMPATIBILITY - التوافق مع الإصدارات السابقة
// ============================================================================

/**
 * Legacy WorkflowPersistenceService (deprecated)
 * خدمة حفظ سير العمل القديمة (مهملة)
 * 
 * @deprecated Use unifiedWorkflowPersistence instead
 */
export const WorkflowPersistenceService = {
  /**
   * Save workflow state (legacy)
   * @deprecated Use unifiedWorkflowPersistence.saveData()
   */
  saveWorkflowState: async (state: LegacyWorkflowState): Promise<void> => {
    logger.warn('Using deprecated WorkflowPersistenceService.saveWorkflowState');
    
    const updates: Partial<UnifiedWorkflowData> = {
      currentStep: state.currentStep,
      vehicleType: state.vehicleType,
      title: state.basicInfo?.title,
      year: state.basicInfo?.year,
      make: state.basicInfo?.make,
      model: state.basicInfo?.model,
      mileage: state.basicInfo?.mileage,
      features: state.features,
      description: state.description,
      price: state.pricing?.price,
      currency: state.pricing?.currency,
      images: state.images,
    };

    await unifiedWorkflowPersistence.saveData(updates, state.currentStep);
  },

  /**
   * Load workflow state (legacy)
   * @deprecated Use unifiedWorkflowPersistence.loadData()
   */
  loadWorkflowState: (): LegacyWorkflowState | null => {
    logger.warn('Using deprecated WorkflowPersistenceService.loadWorkflowState');
    
    const data = unifiedWorkflowPersistence.loadData();
    if (!data) return null;

    return {
      currentStep: typeof data.currentStep === 'string' ? data.currentStep : undefined,
      vehicleType: data.vehicleType,
      basicInfo: {
        title: data.title,
        year: data.year,
        make: data.make,
        model: data.model,
        mileage: data.mileage,
      },
      features: data.features,
      description: data.description,
      pricing: {
        price: data.price,
        currency: data.currency,
      },
      images: data.images,
      lastSaved: data.lastSaved,
    };
  },

  /**
   * Clear workflow state (legacy)
   * @deprecated Use unifiedWorkflowPersistence.clearData()
   */
  clearWorkflowState: async (): Promise<void> => {
    logger.warn('Using deprecated WorkflowPersistenceService.clearWorkflowState');
    await unifiedWorkflowPersistence.clearData();
  },

  /**
   * Get current step (legacy)
   * @deprecated Use unifiedWorkflowPersistence.getCurrentStep()
   */
  getCurrentStep: (): string | null => {
    logger.warn('Using deprecated WorkflowPersistenceService.getCurrentStep');
    const step = unifiedWorkflowPersistence.getCurrentStep();
    return typeof step === 'string' ? step : null;
  },

  /**
   * Get storage usage (legacy)
   * @deprecated Use unifiedWorkflowPersistence.getStorageUsage()
   */
  getStorageUsage: async (): Promise<LegacyStorageUsage> => {
    logger.warn('Using deprecated WorkflowPersistenceService.getStorageUsage');
    const usage = await unifiedWorkflowPersistence.getStorageUsage();
    return {
      localStorage: usage.localStorageSize,
      indexedDB: usage.indexedDBSize,
      total: usage.totalSize,
    };
  },
};

// ============================================================================
// DEFAULT EXPORT - التصدير الافتراضي
// ============================================================================

export default unifiedWorkflowPersistence;
