/**
 * Workflow Operations
 * عمليات الـ workflow
 *
 * This module contains all core business logic operations for the workflow persistence system.
 * يحتوي هذا الوحدة على جميع عمليات منطق الأعمال الأساسية لنظام حفظ البيانات.
 */

import { serviceLogger } from './logger-service';
import { normalizeError } from '@/utils/error-helpers';
import {
  UnifiedWorkflowData,
  TimerState,
  ValidationResult,
  StorageUsage,
  WorkflowProgress,
  WorkflowTimer,
  WorkflowState,
  LegacyWorkflowState,
  LegacyStorageUsage
} from './workflow-types';
import {
  TIMER_DURATION,
  TIMER_UPDATE_INTERVAL,
  STORAGE_KEY,
  MAX_STORAGE_SIZE,
  WORKFLOW_STEPS,
  WORKFLOW_STEP_NAMES,
  LEGACY_STEP_MAPPING,
  REVERSE_STEP_MAPPING,
  SAVE_DEBOUNCE_MS,
  VALIDATION_MESSAGES
} from './workflow-data';

/**
 * Workflow Operations Class
 * فئة عمليات الـ workflow
 */
export class WorkflowOperations {
  private static timer: WorkflowTimer = {
    interval: null,
    listeners: new Set(),
    clearListeners: new Set()
  };

  private static state: WorkflowState = {
    saveInProgress: false,
    lastSaveTimestamp: 0,
    debounceLocked: false,
    saveDebounceMs: SAVE_DEBOUNCE_MS
  };

  /**
   * Save workflow data
   * حفظ بيانات الـ workflow
   */
  static saveData(
    updates: Partial<UnifiedWorkflowData>,
    currentStep: number | string
  ): void {
    try {
      const now = Date.now();

      // Fresh runs after test resets should not inherit stale flags
      if (!localStorage.getItem(STORAGE_KEY)) {
        this.state.lastSaveTimestamp = 0;
        this.state.debounceLocked = false;
      }

      // Debounce rapid calls
      if (this.state.debounceLocked) {
        return;
      }

      this.state.debounceLocked = true;
      setTimeout(() => {
        this.state.debounceLocked = false;
      }, this.state.saveDebounceMs);

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
      this.state.lastSaveTimestamp = now;

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
   * تحميل بيانات الـ workflow
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

  /**
   * Get workflow data (partial)
   * الحصول على بيانات الـ workflow (جزئية)
   */
  static getData(): Partial<UnifiedWorkflowData> {
    return this.loadData() || {};
  }

  /**
   * Get current step
   * الحصول على الخطوة الحالية
   */
  static getCurrentStep(): string | number | null {
    const data = this.loadData();
    return data?.currentStep ?? null;
  }

  /**
   * Update current step
   * تحديث الخطوة الحالية
   */
  static updateCurrentStep(step: string | number): void {
    const existing = this.loadData() || { startedAt: Date.now(), lastSavedAt: Date.now(), currentStep: step } as any;
    this.saveData({ ...existing, currentStep: step }, step);
  }

  /**
   * Mark step as completed
   * وضع علامة على الخطوة كمكتملة
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
   * التحقق من اكتمال الخطوة
   */
  static isStepCompleted(stepNumber: number): boolean {
    const data = this.loadData();
    return data?.completedSteps?.includes(stepNumber) || false;
  }

  /**
   * Mark as published (prevents auto-deletion)
   * وضع علامة كنشر (يمنع الحذف التلقائي)
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
   * مسح جميع بيانات الـ workflow (بما في ذلك الصور من IndexedDB)
   */
  static async clearData(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
    this.stopTimer();
    this.state.saveInProgress = false;
    this.state.lastSaveTimestamp = 0;

    try {
      const { ImageStorageService } = await import('./ImageStorageService');
      await ImageStorageService.clearImages();
      serviceLogger.info('Images cleared from IndexedDB');
    } catch (error) {
      serviceLogger.warn('Failed to clear images from IndexedDB (non-critical)', { error });
    }

    serviceLogger.info('Unified workflow data cleared');
    this.timer.clearListeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        serviceLogger.warn('Error in clear listener', { error });
      }
    });
  }

  /**
   * Subscribe to data clear events
   * الاشتراك في أحداث مسح البيانات
   */
  static subscribeToClear(callback: () => void): () => void {
    this.timer.clearListeners.add(callback);
    return () => {
      this.timer.clearListeners.delete(callback);
    };
  }

  /**
   * Get timer state
   * الحصول على حالة المؤقت
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
   * الاشتراك في تحديثات المؤقت
   */
  static subscribeToTimer(callback: (state: TimerState) => void): () => void {
    this.timer.listeners.add(callback);

    // Send initial state
    callback(this.getTimerState());

    // Return unsubscribe function
    return () => {
      this.timer.listeners.delete(callback);
    };
  }

  /**
   * Get workflow progress (0-100%)
   * الحصول على تقدم الـ workflow (0-100%)
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
   * التحقق من صحة بيانات الـ workflow
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
    if (!data.make) critical.push(VALIDATION_MESSAGES.CRITICAL.MAKE);
    if (!data.model) critical.push(VALIDATION_MESSAGES.CRITICAL.MODEL);
    if (!data.year) critical.push(VALIDATION_MESSAGES.CRITICAL.YEAR);
    if (!data.imagesCount || data.imagesCount === 0) {
      critical.push(VALIDATION_MESSAGES.CRITICAL.IMAGES);
    }

    // Recommended fields
    if (!data.mileage) recommended.push(VALIDATION_MESSAGES.RECOMMENDED.MILEAGE);
    if (!data.price) recommended.push(VALIDATION_MESSAGES.RECOMMENDED.PRICE);
    if (!data.fuelType) recommended.push(VALIDATION_MESSAGES.RECOMMENDED.FUEL_TYPE);
    if (!data.transmission) recommended.push(VALIDATION_MESSAGES.RECOMMENDED.TRANSMISSION);

    if (strict) {
      if (!data.sellerPhone) recommended.push(VALIDATION_MESSAGES.RECOMMENDED.PHONE);
      if (!data.sellerEmail) recommended.push(VALIDATION_MESSAGES.RECOMMENDED.EMAIL);
      if (!data.region) recommended.push(VALIDATION_MESSAGES.RECOMMENDED.REGION);
    }

    return {
      isValid: critical.length === 0,
      critical,
      recommended
    };
  }

  /**
   * Get storage usage
   * الحصول على استخدام التخزين
   */
  static getStorageUsage(): StorageUsage {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const size = saved ? new Blob([saved]).size : 0;

      return {
        used: size,
        percentage: (size / MAX_STORAGE_SIZE) * 100
      };
    } catch (error) {
      return { used: 0, percentage: 0 };
    }
  }

  /**
   * Start timer monitoring
   * بدء مراقبة المؤقت
   */
  private static startTimer(): void {
    if (this.timer.interval) return; // Already running

    this.timer.interval = setInterval(() => {
      const state = this.getTimerState();

      // Notify all listeners
      this.timer.listeners.forEach(callback => callback(state));

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
    }, TIMER_UPDATE_INTERVAL); // Update every second

    serviceLogger.info('Workflow timer started');
  }

  /**
   * Stop timer monitoring
   * إيقاف مراقبة المؤقت
   */
  private static stopTimer(): void {
    if (this.timer.interval) {
      clearInterval(this.timer.interval);
      this.timer.interval = null;

      // Notify listeners that timer stopped
      const state: TimerState = {
        isActive: false,
        remainingSeconds: 0,
        totalSeconds: TIMER_DURATION / 1000
      };
      this.timer.listeners.forEach(callback => callback(state));

      serviceLogger.info('Workflow timer stopped');
    }
  }
}
