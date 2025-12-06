// Unified Workflow Persistence Service
// خدمة موحدة لحفظ بيانات workflow بيع السيارات
// يستبدل: WorkflowPersistenceService + StrictWorkflowAutoSaveService

import { serviceLogger } from './logger-wrapper';

// 20 دقيقة (كافية لإكمال كل الخطوات بدون ضغط)
const TIMER_DURATION = 20 * 60 * 1000; // 1200000ms = 20 minutes

const STORAGE_KEY = 'globul_unified_workflow';

export interface UnifiedWorkflowData {
  // Step 1: Vehicle Type
  vehicleType?: string; // 'car' | 'suv' | 'van' | 'motorcycle' | 'truck' | 'bus'

  // Step 2: Vehicle Details (18 fields from VehicleDataPageUnified)
  make?: string;
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
  condition?: string;
  roadworthy?: boolean;
  saleType?: string;
  saleTimeline?: string;

  // Location
  region?: string;
  city?: string;
  postalCode?: string;

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
  currentStep: number; // 1-5
  startedAt: number; // Timestamp
  lastSavedAt: number; // Timestamp
  isPublished: boolean; // Prevents auto-deletion
  completedSteps: number[]; // Array of completed step numbers
}

export class UnifiedWorkflowPersistenceService {
  private static timerInterval: NodeJS.Timeout | null = null;
  private static listeners: Set<(state: TimerState) => void> = new Set();

  /**
   * Save workflow data
   * Saves to localStorage with automatic timer management
   */
  static saveData(
    updates: Partial<UnifiedWorkflowData>,
    currentStep: number
  ): void {
    try {
      const existing = this.loadData();
      const now = Date.now();

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
        this.clearData();
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
   * Clear all workflow data
   */
  static clearData(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.stopTimer();

    serviceLogger.info('Unified workflow data cleared');
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
      if (!data.region) recommended.push('Region (Област)');
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
          this.clearData();
          serviceLogger.info('Workflow auto-deleted after timer expiry');
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

export default UnifiedWorkflowPersistenceService;
