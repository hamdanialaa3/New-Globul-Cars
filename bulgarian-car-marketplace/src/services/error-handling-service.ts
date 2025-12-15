// src/services/error-handling-service.ts
// Unified Error Handling Service for Bulgarian Car Marketplace

import { serviceLogger } from './logger-wrapper';

export interface ErrorDetails {
  code: string;
  message: string;
  timestamp: Date;
  userId?: string;
  action?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, string | number | boolean>;
}

export interface LocalizedError {
  bg: string;
  en: string;
}

export class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private errorLog: ErrorDetails[] = [];
  private readonly MAX_LOG_SIZE = 1000;

  // Common error codes and their localized messages
  private static readonly ERROR_MESSAGES: Record<string, LocalizedError> = {
    // Authentication errors
    'auth/user-not-found': {
      bg: 'Потребителят не е намерен',
      en: 'User not found'
    },
    'auth/wrong-password': {
      bg: 'Грешна парола',
      en: 'Wrong password'
    },
    'auth/email-already-in-use': {
      bg: 'Имейл адресът вече се използва',
      en: 'Email address is already in use'
    },
    'auth/weak-password': {
      bg: 'Паролата е твърде слаба',
      en: 'Password is too weak'
    },
    'auth/invalid-email': {
      bg: 'Невалиден имейл адрес',
      en: 'Invalid email address'
    },
    'auth/user-disabled': {
      bg: 'Акаунтът е деактивиран',
      en: 'Account has been disabled'
    },
    'auth/too-many-requests': {
      bg: 'Твърде много заявки. Моля, опитайте по-късно',
      en: 'Too many requests. Please try again later'
    },
    'auth/network-request-failed': {
      bg: 'Грешка в мрежата. Проверете връзката си',
      en: 'Network error. Please check your connection'
    },
    'auth/requires-recent-login': {
      bg: 'Необходимо е ново влизане за тази операция',
      en: 'Recent login required for this operation'
    },

    // Email verification errors
    'auth/expired-action-code': {
      bg: 'Линкът за потвърждение е изтекъл',
      en: 'Verification link has expired'
    },
    'auth/invalid-action-code': {
      bg: 'Невалиден линк за потвърждение',
      en: 'Invalid verification link'
    },

    // Firestore errors
    'firestore/permission-denied': {
      bg: 'Нямате разрешение за тази операция',
      en: 'Permission denied for this operation'
    },
    'firestore/unavailable': {
      bg: 'Сервисът е временно недостъпен',
      en: 'Service is temporarily unavailable'
    },
    'firestore/deadline-exceeded': {
      bg: 'Операцията отне твърде много време',
      en: 'Operation took too long'
    },

    // Storage errors
    'storage/unauthorized': {
      bg: 'Нямате разрешение за качване на файлове',
      en: 'Unauthorized to upload files'
    },
    'storage/canceled': {
      bg: 'Качването е отменено',
      en: 'Upload was canceled'
    },
    'storage/unknown': {
      bg: 'Неизвестна грешка при качване',
      en: 'Unknown upload error'
    },

    // Generic errors
    'generic/validation-error': {
      bg: 'Грешка в валидацията на данните',
      en: 'Data validation error'
    },
    'generic/server-error': {
      bg: 'Грешка в сървъра. Моля, опитайте по-късно',
      en: 'Server error. Please try again later'
    },
    'generic/network-error': {
      bg: 'Грешка в мрежата',
      en: 'Network error'
    },
    'generic/unknown-error': {
      bg: 'Неизвестна грешка',
      en: 'Unknown error'
    }
  };

  private constructor() {}

  public static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  /**
   * Log an error with context
   */
  public logError(error: Error | any, context?: {
    userId?: string;
    action?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    additionalData?: Record<string, any>;
  }): void {
    const errorDetails: ErrorDetails = {
      code: error.code || error.name || 'unknown',
      message: error.message || 'Unknown error',
      timestamp: new Date(),
      userId: context?.userId,
      action: context?.action,
      severity: context?.severity || 'medium',
      context: context?.additionalData
    };

    // Add to log
    this.errorLog.unshift(errorDetails);

    // Maintain log size
    if (this.errorLog.length > this.MAX_LOG_SIZE) {
      this.errorLog = this.errorLog.slice(0, this.MAX_LOG_SIZE);
    }

    // Console logging based on severity
    const logLevel = this.getLogLevel(errorDetails.severity);
    console[logLevel](`[${errorDetails.severity.toUpperCase()}] ${errorDetails.code}:`, errorDetails.message, errorDetails.context);

    // TODO: Send to external monitoring service (Sentry, etc.) for production
    if (errorDetails.severity === 'critical' || errorDetails.severity === 'high') {
      this.sendToMonitoringService(errorDetails);
    }
  }

  /**
   * Get localized error message
   */
  public getLocalizedError(errorCode: string, language: 'bg' | 'en' = 'bg'): string {
    const errorMessage = ErrorHandlingService.ERROR_MESSAGES[errorCode];
    if (errorMessage) {
      return errorMessage[language];
    }

    // Fallback to generic error
    const fallbackError = ErrorHandlingService.ERROR_MESSAGES['generic/unknown-error'];
    return fallbackError[language];
  }

  /**
   * Handle Firebase Auth errors
   */
  public handleAuthError(error: Error & { code?: string }, language: 'bg' | 'en' = 'bg'): string {
    this.logError(error, {
      action: 'authentication',
      severity: 'medium',
      additionalData: { errorCode: error.code }
    });

    return this.getLocalizedError(error.code, language);
  }

  /**
   * Handle Firestore errors
   */
  public handleFirestoreError(error: Error & { code?: string }, language: 'bg' | 'en' = 'bg'): string {
    this.logError(error, {
      action: 'firestore',
      severity: 'medium',
      additionalData: { errorCode: error.code }
    });

    return this.getLocalizedError(error.code, language);
  }

  /**
   * Handle Storage errors
   */
  public handleStorageError(error: Error & { code?: string }, language: 'bg' | 'en' = 'bg'): string {
    this.logError(error, {
      action: 'storage',
      severity: 'medium',
      additionalData: { errorCode: error.code }
    });

    return this.getLocalizedError(error.code, language);
  }

  /**
   * Handle validation errors
   */
  public handleValidationError(errors: Record<string, string>, language: 'bg' | 'en' = 'bg'): string {
    const firstError = Object.values(errors)[0];
    
    this.logError(new Error(`Validation failed: ${firstError}`), {
      action: 'validation',
      severity: 'low',
      additionalData: { validationErrors: errors }
    });

    return firstError || this.getLocalizedError('generic/validation-error', language);
  }

  /**
   * Get error log for debugging
   */
  public getErrorLog(): ErrorDetails[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  public clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Get errors by severity
   */
  public getErrorsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): ErrorDetails[] {
    return this.errorLog.filter(error => error.severity === severity);
  }

  /**
   * Get recent errors (last 24 hours)
   */
  public getRecentErrors(hours: number = 24): ErrorDetails[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.errorLog.filter(error => error.timestamp > cutoff);
  }

  /**
   * Check if service is healthy based on error patterns
   */
  public isServiceHealthy(): {
    healthy: boolean;
    issues: string[];
    criticalErrors: number;
    recentErrors: number;
  } {
    const recentErrors = this.getRecentErrors(1); // Last hour
    const criticalErrors = recentErrors.filter(e => e.severity === 'critical').length;
    const highErrors = recentErrors.filter(e => e.severity === 'high').length;
    
    const issues: string[] = [];
    let healthy = true;

    if (criticalErrors > 0) {
      healthy = false;
      issues.push(`${criticalErrors} critical error(s) in the last hour`);
    }

    if (highErrors > 5) {
      healthy = false;
      issues.push(`${highErrors} high severity errors in the last hour`);
    }

    if (recentErrors.length > 20) {
      healthy = false;
      issues.push(`${recentErrors.length} total errors in the last hour`);
    }

    return {
      healthy,
      issues,
      criticalErrors,
      recentErrors: recentErrors.length
    };
  }

  private getLogLevel(severity: string): 'log' | 'warn' | 'error' {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      default:
        return 'log';
    }
  }

  private sendToMonitoringService(errorDetails: ErrorDetails): void {
    // TODO: Integrate with Sentry or other monitoring service
    serviceLogger.info('Sending critical error to monitoring service', errorDetails);
    
    // For now, just log
    // In production, this would send to Sentry, DataDog, etc.
  }
}

// Export singleton instance
export const errorHandler = ErrorHandlingService.getInstance();

// Helper functions for common error scenarios
export const handleError = (error: Error, context?: {
  userId?: string;
  action?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  additionalData?: Record<string, string | number | boolean>;
}): void => {
  errorHandler.logError(error, context);
};

export const getErrorMessage = (errorCode: string, language: 'bg' | 'en' = 'bg'): string => {
  return errorHandler.getLocalizedError(errorCode, language);
};

export const isServiceHealthy = () => {
  return errorHandler.isServiceHealthy();
};
