// Workflow Step Hook - Track analytics and manage step lifecycle
// Hook خطوة سير العمل - تتبع التحليلات وإدارة دورة حياة الخطوة

import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthProvider';
import WorkflowAnalyticsService from '../services/workflow-analytics-service';

export const useWorkflowStep = (
  step: number,
  stepName: string,
  enabled: boolean = true
) => {
  const { currentUser } = useAuth();
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    // Log step entered
    const logEntry = async () => {
      startTimeRef.current = await WorkflowAnalyticsService.logStepEntered(
        step,
        stepName,
        currentUser?.uid
      );
    };

    logEntry();

    // Log step exited on unmount
    return () => {
      if (startTimeRef.current > 0) {
        WorkflowAnalyticsService.logStepExited(
          step,
          stepName,
          startTimeRef.current,
          currentUser?.uid
        );
      }
    };
  }, [step, stepName, enabled, currentUser]);

  /**
   * Mark step as completed
   */
  const markComplete = async (data?: Record<string, any>) => {
    await WorkflowAnalyticsService.logStepCompleted(
      step,
      stepName,
      data,
      currentUser?.uid
    );
  };

  /**
   * Mark step as abandoned
   */
  const markAbandoned = async () => {
    await WorkflowAnalyticsService.logStepAbandoned(
      step,
      stepName,
      currentUser?.uid
    );
  };

  /**
   * Log error in this step
   */
  const logError = async (errorMessage: string) => {
    await WorkflowAnalyticsService.logError(
      step,
      stepName,
      errorMessage,
      currentUser?.uid
    );
  };

  return {
    markComplete,
    markAbandoned,
    logError
  };
};

export default useWorkflowStep;

