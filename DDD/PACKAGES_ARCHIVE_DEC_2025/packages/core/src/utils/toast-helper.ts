/**
 * Toast Helper Utilities
 * Phase 4 (A3): Centralized toast management
 * 
 * Provides consistent toast notifications with logging
 */

import { logger } from '@globul-cars/services';

export interface ToastManager {
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

/**
 * Show success toast with logging
 */
export const showSuccessToast = (
  toast: ToastManager,
  messageKey: string,
  context?: Record<string, any>
) => {
  toast.success(messageKey);
  logger.info(`Toast: ${messageKey}`, context);
};

/**
 * Show error toast with logging
 */
export const showErrorToast = (
  toast: ToastManager,
  error: Error,
  messageKey: string,
  context?: Record<string, any>
) => {
  toast.error(messageKey);
  logger.error(`Toast Error: ${messageKey}`, error, context);
};

/**
 * Show info toast
 */
export const showInfoToast = (
  toast: ToastManager,
  messageKey: string,
  context?: Record<string, any>
) => {
  toast.info(messageKey);
  logger.info(`Toast Info: ${messageKey}`, context);
};

/**
 * Show warning toast
 */
export const showWarningToast = (
  toast: ToastManager,
  messageKey: string,
  context?: Record<string, any>
) => {
  toast.warning(messageKey);
  logger.warn(`Toast Warning: ${messageKey}`, context);
};

/**
 * Handle operation with toast feedback
 */
export async function withToast<T>(
  toast: ToastManager,
  operation: () => Promise<T>,
  messages: {
    loading?: string;
    success: string;
    error: string;
  },
  context?: Record<string, any>
): Promise<T | null> {
  try {
    if (messages.loading) {
      toast.info(messages.loading);
    }

    const result = await operation();

    showSuccessToast(toast, messages.success, context);
    return result;
  } catch (error) {
    showErrorToast(toast, error as Error, messages.error, context);
    return null;
  }
}

