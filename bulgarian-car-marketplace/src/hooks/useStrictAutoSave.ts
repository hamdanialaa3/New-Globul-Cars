/**
 * useStrictAutoSave Hook
 * هوك الحفظ التلقائي الصارم
 * 
 * Usage in any workflow page:
 * const { saveField, loadSavedData, timerState } = useStrictAutoSave('page-name');
 */

import { useEffect, useCallback, useState } from 'react';
import { StrictWorkflowAutoSaveService, StrictTimerState } from '../services/strictWorkflowAutoSave.service';
import { serviceLogger } from '../services/logger-wrapper';

export function useStrictAutoSave(pageName: string) {
  const [timerState, setTimerState] = useState<StrictTimerState>({
    startTime: 0,
    expiryTime: 0,
    remainingSeconds: 0,
    isActive: false
  });

  // Subscribe to timer updates
  useEffect(() => {
    const unsubscribe = StrictWorkflowAutoSaveService.subscribeToTimer(setTimerState);
    
    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Save a single field value
   */
  const saveField = useCallback((fieldName: string, value: any) => {
    try {
      StrictWorkflowAutoSaveService.saveData(
        { [fieldName]: value },
        pageName
      );
    } catch (error) {
      serviceLogger.error('[useStrictAutoSave] Error saving field', error as Error, {
        pageName,
        fieldName
      });
    }
  }, [pageName]);

  /**
   * Save multiple fields at once
   */
  const saveFields = useCallback((fields: Record<string, any>) => {
    try {
      StrictWorkflowAutoSaveService.saveData(fields, pageName);
    } catch (error) {
      serviceLogger.error('[useStrictAutoSave] Error saving fields', error as Error, {
        pageName,
        fieldsCount: Object.keys(fields).length
      });
    }
  }, [pageName]);

  /**
   * Load all saved data
   */
  const loadSavedData = useCallback(() => {
    try {
      return StrictWorkflowAutoSaveService.loadData();
    } catch (error) {
      serviceLogger.error('[useStrictAutoSave] Error loading data', error as Error, {
        pageName
      });
      return null;
    }
  }, [pageName]);

  /**
   * Mark as published (call this after successful listing publication)
   */
  const markAsPublished = useCallback(() => {
    try {
      StrictWorkflowAutoSaveService.markAsPublished();
      serviceLogger.info('[useStrictAutoSave] Marked as published', { pageName });
    } catch (error) {
      serviceLogger.error('[useStrictAutoSave] Error marking as published', error as Error, {
        pageName
      });
    }
  }, [pageName]);

  /**
   * Clear all saved data manually
   */
  const clearAllData = useCallback(() => {
    try {
      StrictWorkflowAutoSaveService.clearAllData();
      serviceLogger.info('[useStrictAutoSave] Data cleared manually', { pageName });
    } catch (error) {
      serviceLogger.error('[useStrictAutoSave] Error clearing data', error as Error, {
        pageName
      });
    }
  }, [pageName]);

  /**
   * Reset timer (restart from 500 seconds)
   */
  const resetTimer = useCallback(() => {
    try {
      StrictWorkflowAutoSaveService.resetTimer();
      serviceLogger.info('[useStrictAutoSave] Timer reset', { pageName });
    } catch (error) {
      serviceLogger.error('[useStrictAutoSave] Error resetting timer', error as Error, {
        pageName
      });
    }
  }, [pageName]);

  return {
    // Data operations
    saveField,
    saveFields,
    loadSavedData,
    
    // Publishing
    markAsPublished,
    
    // Cleanup
    clearAllData,
    
    // Timer
    timerState,
    resetTimer,
    
    // Utilities
    formatTimeRemaining: (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };
}

export default useStrictAutoSave;
