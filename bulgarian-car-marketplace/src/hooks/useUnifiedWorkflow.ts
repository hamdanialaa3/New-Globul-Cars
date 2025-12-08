// Unified Workflow Hook
// Hook موحد لإدارة بيانات workflow في كل الصفحات
// يستبدل: useSellWorkflow + useStrictAutoSave + useEquipmentSelection + useImagesWorkflow

import { useCallback, useEffect, useState } from 'react';
import UnifiedWorkflowPersistenceService, {
  UnifiedWorkflowData,
  TimerState,
  ValidationResult
} from '../services/unified-workflow-persistence.service';
import ImageStorageService from '../services/image-storage.service';
import { serviceLogger } from '../services/logger-wrapper';

export const useUnifiedWorkflow = (currentStep: number) => {
  const [workflowData, setWorkflowData] = useState<UnifiedWorkflowData | null>(null);
  const [timerState, setTimerState] = useState<TimerState>({
    isActive: false,
    remainingSeconds: 0,
    totalSeconds: 1200
  });
  const [imagesCount, setImagesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load workflow data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = UnifiedWorkflowPersistenceService.loadData();
        setWorkflowData(data);

        // Load images count
        const count = await ImageStorageService.getImagesCount();
        setImagesCount(count);

        // Update workflow data with images count
        if (data && count !== data.imagesCount) {
          UnifiedWorkflowPersistenceService.saveData(
            { imagesCount: count },
            currentStep
          );
        }
      } catch (error) {
        serviceLogger.error('Error loading workflow data', error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentStep]);

  // Subscribe to timer updates
  useEffect(() => {
    const unsubscribeTimer = UnifiedWorkflowPersistenceService.subscribeToTimer(
      (state) => {
        setTimerState(state);
      }
    );

    // ✅ Subscribe to clear events (Timer Expiry)
    const unsubscribeClear = UnifiedWorkflowPersistenceService.subscribeToClear(() => {
      setWorkflowData(null);
      setImagesCount(0);
      serviceLogger.info('Workflow data cleared in hook (Timer Expiry)');
    });

    return () => {
      unsubscribeTimer();
      unsubscribeClear();
    };
  }, []);

  /**
   * Update workflow data
   */
  const updateData = useCallback(
    (updates: Partial<UnifiedWorkflowData>) => {
      try {
        UnifiedWorkflowPersistenceService.saveData(updates, currentStep);

        // Update local state
        setWorkflowData((prev) => ({
          ...(prev || {}),
          ...updates,
          currentStep,
          lastSavedAt: Date.now()
        } as UnifiedWorkflowData));

        serviceLogger.info('Workflow data updated', {
          step: currentStep,
          fields: Object.keys(updates)
        });
      } catch (error) {
        serviceLogger.error('Error updating workflow data', error as Error, {
          step: currentStep
        });
        throw error;
      }
    },
    [currentStep]
  );

  /**
   * Update single field
   */
  const updateField = useCallback(
    (field: keyof UnifiedWorkflowData, value: any) => {
      updateData({ [field]: value });
    },
    [updateData]
  );

  /**
   * Mark current step as completed
   */
  const markStepCompleted = useCallback(() => {
    UnifiedWorkflowPersistenceService.markStepCompleted(currentStep);
    setWorkflowData((prev) => {
      if (!prev) return prev;
      const completedSteps = prev.completedSteps || [];
      if (!completedSteps.includes(currentStep)) {
        return {
          ...prev,
          completedSteps: [...completedSteps, currentStep]
        };
      }
      return prev;
    });
  }, [currentStep]);

  /**
   * Check if current step is completed
   */
  const isStepCompleted = useCallback(() => {
    return UnifiedWorkflowPersistenceService.isStepCompleted(currentStep);
  }, [currentStep]);

  /**
   * Get workflow progress (0-100%)
   */
  const getProgress = useCallback(() => {
    return UnifiedWorkflowPersistenceService.getProgress();
  }, []);

  /**
   * Validate workflow data
   */
  const validate = useCallback((strict: boolean = false): ValidationResult => {
    return UnifiedWorkflowPersistenceService.validateData(strict);
  }, []);

  /**
   * Mark as published (called after successful submission)
   */
  const markAsPublished = useCallback(() => {
    UnifiedWorkflowPersistenceService.markAsPublished();
    setTimerState({
      isActive: false,
      remainingSeconds: 0,
      totalSeconds: 1200
    });
  }, []);

  /**
   * Clear all workflow data (including images from IndexedDB)
   */
  const clearWorkflow = useCallback(async () => {
    // ✅ CRITICAL: clearData now clears images from IndexedDB automatically
    await UnifiedWorkflowPersistenceService.clearData();
    setWorkflowData(null);
    setImagesCount(0);
    setTimerState({
      isActive: false,
      remainingSeconds: 0,
      totalSeconds: 1200
    });
  }, []);

  /**
   * Format timer display (MM:SS)
   */
  const formatTimer = useCallback((): string => {
    const minutes = Math.floor(timerState.remainingSeconds / 60);
    const seconds = timerState.remainingSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timerState.remainingSeconds]);

  /**
   * Check if timer is urgent (< 5 minutes)
   */
  const isTimerUrgent = useCallback((): boolean => {
    return timerState.isActive && timerState.remainingSeconds < 300; // 5 minutes
  }, [timerState]);

  return {
    // Data
    workflowData,
    isLoading,

    // Timer
    timerState,
    formatTimer,
    isTimerUrgent,

    // Images
    imagesCount,

    // Actions
    updateData,
    updateField,
    markStepCompleted,
    isStepCompleted,
    getProgress,
    validate,
    markAsPublished,
    clearWorkflow
  };
};

export default useUnifiedWorkflow;
