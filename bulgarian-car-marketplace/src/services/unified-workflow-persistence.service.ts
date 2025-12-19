// Unified Workflow Persistence Service
// خدمة موحدة لحفظ بيانات workflow بيع السيارات
// يستبدل: WorkflowPersistenceService + StrictWorkflowAutoSaveService

import { serviceLogger } from './logger-service';

// 20 دقيقة (كافية لإكمال كل الخطوات بدون ضغط)
const TIMER_DURATION = 20 * 60 * 1000; // 1200000ms = 20 minutes

const STORAGE_KEY = 'unified-workflow-data';

export interface UnifiedWorkflowData {
  // Step 1: Vehicle Type
  vehicleType?: string; // 'car' | 'suv' | 'van' | 'motorcycle' | 'truck' | 'bus'

  // Step 2: Vehicle Details (All fields from VehicleDataPageUnified)
  make?: string;
  makeRaw?: string; // ✅ ADDED: Raw make input
  model?: string;
  year?: string;
  firstRegistration?: string;
  mileage?: string;
  fuelType?: string;
  transmission?: string;
  power?: string;
  powerKW?: string;
  engineSize?: string;
  color?: string;
  doors?: string;
  seats?: string;
  exteriorColor?: string; // ✅ ADDED: Exterior color
  previousOwners?: string; // ✅ ADDED: Previous owners
  hasAccidentHistory?: boolean; // ✅ ADDED: Accident history
  hasServiceHistory?: boolean; // ✅ ADDED: Service history
  variant?: string; // ✅ ADDED: Variant
  condition?: string;
  roadworthy?: boolean;
  saleType?: string;
  saleTimeline?: string;
  bodyType?: string; // ✅ ADDED: Body type
  
  // "Other" fields for free text entry
  bodyTypeOther?: string;
  makeOther?: string;
  modelOther?: string;
  fuelTypeOther?: string;
  colorOther?: string;
  exteriorColorOther?: string;

  // Location
  region?: string;
  city?: string;
  postalCode?: string;
  saleProvince?: string; // ✅ ADDED: Specific sale location fields
  saleCity?: string;
  salePostalCode?: string;
  saleCountry?: string;
  saleLocation?: string;

  // Step 3: Equipment (Arrays only - NO duplicate strings!)
  safetyEquipment?: string[];
  comfortEquipment?: string[];
  infotainmentEquipment?: string[];
  extrasEquipment?: string[];

  // Step 4: Images (count only - files stored in IndexedDB)
  imagesCount?: number;

  // Step 5: Pricing
  price?: string;
  currency?: string;
  priceType?: string;
  negotiable?: boolean;
  financing?: boolean;
  tradeIn?: boolean;
  warranty?: boolean;
  warrantyMonths?: string;
  vatDeductible?: boolean;

  // Contact
  sellerType?: string;
  sellerName?: string;
  sellerEmail?: string;
  sellerPhone?: string;

  // Additional Info
  description?: string;
  hasVideo?: boolean;
  videoUrl?: string;

  // Metadata
  currentStep: number | string; // 1-5 or step id
  startedAt: number; // Timestamp
  lastSavedAt: number; // Timestamp
  isPublished: boolean; // Prevents auto-deletion
  completedSteps: number[]; // Array of completed step numbers
}

export class UnifiedWorkflowPersistenceService {
  private static timerInterval: NodeJS.Timeout | null = null;
  private static listeners: Set<(state: TimerState) => void> = new Set();
  private static clearListeners: Set<() => void> = new Set(); // ✅ ADDED: Listeners for data clearing
  private static saveInProgress = false; // Prevent concurrent saves
  private static lastSaveTimestamp = 0; // Debounce tracking
  private static debounceLocked = false;
  private static saveDebounceMs = 100; // Minimum time between saves

  /**
   * Save workflow data
   * Saves to localStorage with automatic timer management
   */
  static saveData(
    updates: Partial<UnifiedWorkflowData>,
    currentStep: number | string
  ): void {
    try {
      const now = Date.now();

      // Fresh runs after test resets should not inherit stale flags
      if (!localStorage.getItem(STORAGE_KEY)) {
        this.lastSaveTimestamp = 0;
        this.debounceLocked = false;
      }

      // Debounce rapid calls
      if (this.debounceLocked) {
        return;
      }

      this.debounceLocked = true;
      setTimeout(() => {
        this.debounceLocked = false;
      }, this.saveDebounceMs);

      const existing = this.loadData();

      const updated: UnifiedWorkflowData = {
        ...(existing || {}),
        ...updates,
        currentStep,
        lastSavedAt: now,
        startedAt: existing?.startedAt || now,
        isPublished: existing?.isPublished || false,
        completedSteps: existing?.completedSteps || []
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      this.lastSaveTimestamp = now;

      // Start timer if not started
      this.startTimer();

      serviceLogger.info('Unified workflow data saved', {
        currentStep,
        fieldsUpdated: Object.keys(updates).length
      });
    } catch (error) {
      serviceLogger.error('Error saving unified workflow data', error as Error, {
        currentStep
      });
      throw new Error('Failed to save workflow data');
    }
  }

  /**
   * Load workflow data
   * Returns null if expired or not found
   */
  static loadData(): UnifiedWorkflowData | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;

      const data: UnifiedWorkflowData = JSON.parse(saved);

      // Check if expired (20 minutes from last save)
      const elapsed = Date.now() - data.lastSavedAt;

      if (elapsed > TIMER_DURATION && !data.isPublished) {
        serviceLogger.info('Workflow data expired, auto-deleting', {
          elapsedMinutes: Math.round(elapsed / 60000),
          isPublished: data.isPublished
        });
        // ✅ CRITICAL: clearData now clears images from IndexedDB automatically
        this.clearData().catch((error: unknown) => {
          serviceLogger.warn('Error clearing expired data (non-critical)', { 
            error: error instanceof Error ? error : new Error(String(error))
          });
        });
        return null;
      }

      // Start timer to monitor expiry
      this.startTimer();

      return data;
    } catch (error) {
      serviceLogger.error('Error loading unified workflow data', error as Error);
      return null;
    }
  }

  static getData(): Partial<UnifiedWorkflowData> {
    return this.loadData() || {};
  }

  static getCurrentStep(): string | number | null {
    const data = this.loadData();
    return data?.currentStep ?? null;
  }

  static updateCurrentStep(step: string | number): void {
    const existing = this.loadData() || { startedAt: Date.now(), lastSavedAt: Date.now(), currentStep: step } as any;
    this.saveData({ ...existing, currentStep: step }, step);
  }

  /**
   * Mark step as completed
   */
  static markStepCompleted(stepNumber: number): void {
    const data = this.loadData();
    if (!data) return;

    const completedSteps = data.completedSteps || [];
    if (!completedSteps.includes(stepNumber)) {
      completedSteps.push(stepNumber);
      this.saveData({ completedSteps }, data.currentStep);
    }
  }

  /**
   * Check if step is completed
   */
  static isStepCompleted(stepNumber: number): boolean {
    const data = this.loadData();
    return data?.completedSteps?.includes(stepNumber) || false;
  }

  /**
   * Mark as published (prevents auto-deletion)
   */
  static markAsPublished(): void {
    const data = this.loadData();
    if (!data) return;

    data.isPublished = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    // Stop timer
    this.stopTimer();

    serviceLogger.info('Workflow marked as published', {
      startedAt: new Date(data.startedAt).toISOString(),
      publishedAt: new Date().toISOString()
    });
  }

  /**
   * Clear all workflow data (including images from IndexedDB)
   */
  static async clearData(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
    this.stopTimer();
    this.saveInProgress = false;
    this.lastSaveTimestamp = 0;

    try {
      const { ImageStorageService } = await import('./ImageStorageService');
      await ImageStorageService.clearImages();
      serviceLogger.info('Images cleared from IndexedDB');
    } catch (error) {
      serviceLogger.warn('Failed to clear images from IndexedDB (non-critical)', { error });
    }

    serviceLogger.info('Unified workflow data cleared');
    this.clearListeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        serviceLogger.warn('Error in clear listener', { error });
      }
    });
  }

  /**
   * Subscribe to data clear events
   */
  static subscribeToClear(callback: () => void): () => void {
    this.clearListeners.add(callback);
    return () => {
      this.clearListeners.delete(callback);
    };
  }

  /**
   * Get timer state
   */
  static getTimerState(): TimerState {
    const data = this.loadData();

    if (!data || data.isPublished) {
      return {
        isActive: false,
        remainingSeconds: 0,
        totalSeconds: TIMER_DURATION / 1000
      };
    }

    const elapsed = Date.now() - data.lastSavedAt;
    const remaining = Math.max(0, TIMER_DURATION - elapsed);

    return {
      isActive: true,
      remainingSeconds: Math.floor(remaining / 1000),
      totalSeconds: TIMER_DURATION / 1000
    };
  }

  /**
   * Subscribe to timer updates
   */
  static subscribeToTimer(callback: (state: TimerState) => void): () => void {
    this.listeners.add(callback);

    // Send initial state
    callback(this.getTimerState());

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Get workflow progress (0-100%)
   */
  static getProgress(): number {
    const data = this.loadData();
    if (!data) return 0;

    const completedSteps = data.completedSteps || [];
    const totalSteps = 5; // vehicle, details, equipment, images, preview

    return Math.round((completedSteps.length / totalSteps) * 100);
  }

  /**
   * Validate workflow data
   */
  static validateData(strict: boolean = false): ValidationResult {
    const data = this.loadData();

    if (!data) {
      return {
        isValid: false,
        critical: ['No workflow data found'],
        recommended: []
      };
    }

    const critical: string[] = [];
    const recommended: string[] = [];

    // Critical fields
    if (!data.make) critical.push('Make (Марка)');
    if (!data.model) critical.push('Model (Модел)');
    if (!data.year) critical.push('Year (Година)');
    if (!data.imagesCount || data.imagesCount === 0) {
      critical.push('Images (Снимки) - At least 1 required');
    }

    // Recommended fields
    if (!data.mileage) recommended.push('Mileage (Пробег)');
    if (!data.price) recommended.push('Price (Цена)');
    if (!data.fuelType) recommended.push('Fuel Type (Гориво)');
    if (!data.transmission) recommended.push('Transmission (Скоростна кутия)');

    if (strict) {
      if (!data.sellerPhone) recommended.push('Phone (Телефон)');
      if (!data.sellerEmail) recommended.push('Email (Имейл)');
      if (!data.locationData?.regionName) recommended.push('Region (Област)');
    }

    return {
      isValid: critical.length === 0,
      critical,
      recommended
    };
  }

  /**
   * Private: Start timer monitoring
   */
  private static startTimer(): void {
    if (this.timerInterval) return; // Already running

    this.timerInterval = setInterval(() => {
      const state = this.getTimerState();

      // Notify all listeners
      this.listeners.forEach(callback => callback(state));

      // Auto-delete if expired
      if (!state.isActive && state.remainingSeconds === 0) {
        const data = this.loadData();
        if (data && !data.isPublished) {
          // ✅ Delete from Firestore drafts if draftId exists
          const draftId = localStorage.getItem('current_draft_id');
          if (draftId) {
            try {
              const { default: DraftsService } = require('./drafts-service');
              DraftsService.deleteDraft(draftId).catch((error: unknown) => {
                // Non-critical - continue with local cleanup
                serviceLogger.warn('Failed to delete Firestore draft on timer expiry (non-critical)', { 
                  error: error instanceof Error ? error : new Error(String(error)), 
                  draftId 
                });
              });
              localStorage.removeItem('current_draft_id');
            } catch (error) {
              // Non-critical - continue with local cleanup
              serviceLogger.warn('Error importing DraftsService for auto-delete (non-critical)', { error });
            }
          }
          
          // ✅ CRITICAL: clearData now clears images from IndexedDB
          this.clearData().catch((error: unknown) => {
            serviceLogger.warn('Error clearing data on timer expiry (non-critical)', { 
              error: error instanceof Error ? error : new Error(String(error))
            });
          });
          serviceLogger.info('Workflow auto-deleted after timer expiry', { draftId: draftId || 'none' });
        }
      }
    }, 1000); // Update every second

    serviceLogger.info('Workflow timer started');
  }

  /**
   * Private: Stop timer monitoring
   */
  private static stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;

      // Notify listeners that timer stopped
      const state: TimerState = {
        isActive: false,
        remainingSeconds: 0,
        totalSeconds: TIMER_DURATION / 1000
      };
      this.listeners.forEach(callback => callback(state));

      serviceLogger.info('Workflow timer stopped');
    }
  }

  /**
   * Get storage usage
   */
  static getStorageUsage(): {
    used: number;
    percentage: number;
  } {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const size = saved ? new Blob([saved]).size : 0;
      const maxSize = 5 * 1024 * 1024; // 5MB conservative estimate

      return {
        used: size,
        percentage: (size / maxSize) * 100
      };
    } catch (error) {
      return { used: 0, percentage: 0 };
    }
  }
}

export interface TimerState {
  isActive: boolean;
  remainingSeconds: number;
  totalSeconds: number;
}

export interface ValidationResult {
  isValid: boolean;
  critical: string[];
  recommended: string[];
}

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
    const stepMap: Record<string, number> = {
      'vehicle-data': 1,
      'vehicle-details': 2,
      'equipment': 3,
      'images': 4,
      'pricing': 5,
      'contact': 6,
      'preview': 7
    };
    const stepNumber = stepMap[currentStep] || 1;
    
    UnifiedWorkflowPersistenceService.saveData(data as Partial<UnifiedWorkflowData>, stepNumber);
  },

  /**
   * @deprecated Use UnifiedWorkflowPersistenceService.loadData() instead
   */
  loadState: (): { data: Record<string, any>; images: string[]; lastUpdated: number; currentStep: string } | null => {
    const data = UnifiedWorkflowPersistenceService.loadData();
    if (!data) return null;

    // Convert step number to string
    const stepMap: Record<number, string> = {
      1: 'vehicle-data',
      2: 'vehicle-details',
      3: 'equipment',
      4: 'images',
      5: 'pricing',
      6: 'contact',
      7: 'preview'
    };
    const currentStep = stepMap[data.currentStep] || 'vehicle-data';

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
    UnifiedWorkflowPersistenceService.clearData().catch((error) => {
      serviceLogger.warn('Error clearing state in wrapper', { error });
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
      serviceLogger.error('Error getting images as files', error as Error);
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
    const data = UnifiedWorkflowPersistenceService.loadData();
    if (data) {
      UnifiedWorkflowPersistenceService.saveData(
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
    const step = UnifiedWorkflowPersistenceService.getCurrentStep();
    const stepMap: Record<number, string> = {
      1: 'vehicle-data',
      2: 'vehicle-details',
      3: 'equipment',
      4: 'images',
      5: 'pricing',
      6: 'contact',
      7: 'preview'
    };
    return stepMap[step] || 'vehicle-data';
  },

  /**
   * @deprecated Use UnifiedWorkflowPersistenceService.getProgress() instead
   */
  getProgress: (): number => {
    return UnifiedWorkflowPersistenceService.getProgress();
  },

  /**
   * @deprecated Use UnifiedWorkflowPersistenceService.getStorageUsage() instead
   */
  getStorageUsage: (): { used: number; max: number; percentage: number } => {
    const usage = UnifiedWorkflowPersistenceService.getStorageUsage();
    return {
      used: usage.used,
      max: 5 * 1024 * 1024, // 5MB estimate
      percentage: usage.percentage
    };
  }
};

export default UnifiedWorkflowPersistenceService;
