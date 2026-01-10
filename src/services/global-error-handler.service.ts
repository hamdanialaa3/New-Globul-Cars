/**
 * Global Error Handler & Retry Service
 * Provides centralized error handling with automatic retry logic
 * Handles API failures, network errors, Firestore errors, etc.
 * 
 * @author CTO
 * @version 1.0
 * @since January 9, 2026
 */

import { logger } from '@/services/logger-service';

// ============================================================================
// TYPES
// ============================================================================

export type RetryStrategy = 'exponential' | 'linear' | 'fixed';

export interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number; // ms
  maxDelay?: number; // ms
  strategy?: RetryStrategy;
  backoffMultiplier?: number;
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

export interface ErrorContext {
  operationName: string;
  userId?: string;
  timestamp: Date;
  attempt: number;
  willRetry: boolean;
  originalError: Error;
}

export type ErrorHandler = (context: ErrorContext) => void | Promise<void>;

// ============================================================================
// ERROR CLASSIFICATION
// ============================================================================

class ErrorClassifier {
  static isRetryable(error: any): boolean {
    const code = error?.code || '';
    const message = error?.message || '';
    const status = error?.status;

    // Definitely retryable
    const retryableCodes = [
      'DEADLINE_EXCEEDED',
      'INTERNAL',
      'UNAVAILABLE',
      'UNAUTHENTICATED',
      'RESOURCE_EXHAUSTED',
      'ABORTED',
      'UNKNOWN'
    ];

    if (retryableCodes.includes(code)) return true;

    // Network errors (retryable)
    if (message.includes('Network') || message.includes('timeout')) return true;

    // HTTP status codes (retryable)
    if (status >= 500 || status === 429 || status === 408) return true;

    // Firebase errors
    if (code.includes('network-error')) return true;

    return false;
  }

  static isFatal(error: any): boolean {
    const code = error?.code || '';
    const status = error?.status;

    // Authentication/Authorization errors
    if (code === 'PERMISSION_DENIED' || code === 'UNAUTHENTICATED') return true;
    if (status === 401 || status === 403) return true;

    // Validation errors
    if (status === 400 || code === 'INVALID_ARGUMENT') return true;

    // Not found
    if (status === 404) return true;

    return false;
  }

  static getReason(error: any): string {
    const code = error?.code;
    const message = error?.message;
    const status = error?.status;

    if (code === 'PERMISSION_DENIED') return 'You do not have permission to perform this action';
    if (code === 'UNAUTHENTICATED') return 'Please log in to continue';
    if (code === 'INVALID_ARGUMENT') return 'Invalid input data provided';
    if (code === 'NOT_FOUND') return 'Resource not found';
    if (code === 'ALREADY_EXISTS') return 'This item already exists';
    if (code === 'DEADLINE_EXCEEDED') return 'Operation took too long. Please try again';
    if (code === 'RESOURCE_EXHAUSTED') return 'Server is overloaded. Please try again later';
    if (code === 'UNAVAILABLE') return 'Service temporarily unavailable. Please try again later';

    if (status === 429) return 'Too many requests. Please wait a moment and try again';
    if (status === 503) return 'Service is temporarily down. Please try again later';
    if (status >= 500) return 'Server error. Please try again later';

    if (message?.includes('Network')) return 'Network connection error. Please check your internet and try again';

    return message || 'Something went wrong. Please try again';
  }
}

// ============================================================================
// RETRY ENGINE
// ============================================================================

class RetryEngine {
  private static calculateDelay(
    attempt: number,
    config: Required<RetryConfig>
  ): number {
    let delay = config.initialDelay;

    switch (config.strategy) {
      case 'exponential':
        delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);
        break;
      case 'linear':
        delay = config.initialDelay * attempt;
        break;
      case 'fixed':
        delay = config.initialDelay;
        break;
    }

    return Math.min(delay, config.maxDelay);
  }

  static async execute<T>(
    operation: () => Promise<T>,
    config: RetryConfig = {},
    operationName: string = 'Unknown Operation'
  ): Promise<T> {
    const mergedConfig: Required<RetryConfig> = {
      maxRetries: config.maxRetries ?? 3,
      initialDelay: config.initialDelay ?? 1000,
      maxDelay: config.maxDelay ?? 30000,
      strategy: config.strategy ?? 'exponential',
      backoffMultiplier: config.backoffMultiplier ?? 2,
      shouldRetry: config.shouldRetry ?? (() => true)
    };

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= mergedConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        const isRetryable = ErrorClassifier.isRetryable(error);
        const shouldRetry = isRetryable && mergedConfig.shouldRetry(lastError, attempt);

        if (!shouldRetry || attempt === mergedConfig.maxRetries) {
          logger.error(
            `${operationName} failed after ${attempt} attempt(s)`,
            lastError,
            {
              operationName,
              attempt,
              maxRetries: mergedConfig.maxRetries,
              isRetryable,
              willRetry: false
            }
          );
          throw lastError;
        }

        const delay = this.calculateDelay(attempt, mergedConfig);
        logger.warn(
          `${operationName} failed (attempt ${attempt}). Retrying in ${delay}ms...`,
          {
            operationName,
            attempt,
            delay,
            error: lastError.message
          }
        );

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error(`${operationName} failed`);
  }
}

// ============================================================================
// GLOBAL ERROR HANDLER SERVICE
// ============================================================================

class GlobalErrorHandlerService {
  private errorHandlers: ErrorHandler[] = [];
  private operationHistory: ErrorContext[] = [];
  private maxHistorySize = 100;

  /**
   * Register a custom error handler
   */
  registerHandler(handler: ErrorHandler): void {
    this.errorHandlers.push(handler);
  }

  /**
   * Handle an error with context
   */
  async handleError(
    error: Error,
    operationName: string = 'Unknown Operation',
    context: { userId?: string; attempt?: number } = {}
  ): Promise<void> {
    const errorContext: ErrorContext = {
      operationName,
      userId: context.userId,
      timestamp: new Date(),
      attempt: context.attempt ?? 1,
      willRetry: false,
      originalError: error
    };

    // Add to history
    this.operationHistory.push(errorContext);
    if (this.operationHistory.length > this.maxHistorySize) {
      this.operationHistory.shift();
    }

    // Call all registered handlers
    for (const handler of this.errorHandlers) {
      try {
        await handler(errorContext);
      } catch (err) {
        logger.error('Error in error handler', err instanceof Error ? err : new Error(String(err)));
      }
    }

    // Log critical errors
    if (ErrorClassifier.isFatal(error)) {
      logger.error(`FATAL: ${operationName}`, error, {
        operationName,
        context,
        reason: ErrorClassifier.getReason(error)
      });
    }
  }

  /**
   * Get user-friendly error message
   */
  getErrorMessage(error: Error): string {
    return ErrorClassifier.getReason(error);
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error: Error): boolean {
    return ErrorClassifier.isRetryable(error);
  }

  /**
   * Check if error is fatal
   */
  isFatal(error: Error): boolean {
    return ErrorClassifier.isFatal(error);
  }

  /**
   * Get operation history for debugging
   */
  getHistory(limit: number = 10): ErrorContext[] {
    return this.operationHistory.slice(-limit);
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.operationHistory = [];
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const globalErrorHandler = new GlobalErrorHandlerService();

// ============================================================================
// EXPORT
// ============================================================================

export { RetryEngine, ErrorClassifier };

/**
 * USAGE EXAMPLES:
 * 
 * 1. WITH AUTOMATIC RETRY:
 *    const result = await RetryEngine.execute(
 *      () => fetchUserData(userId),
 *      {
 *        maxRetries: 3,
 *        strategy: 'exponential'
 *      },
 *      'Fetch User Data'
 *    );
 * 
 * 2. WITH ERROR HANDLER:
 *    globalErrorHandler.registerHandler(async (context) => {
 *      if (context.originalError.message.includes('quota')) {
 *        sendAlert('Quota exceeded!');
 *      }
 *    });
 * 
 * 3. IN SERVICE:
 *    try {
 *      await RetryEngine.execute(
 *        () => db.collection('cars').add(data),
 *        { maxRetries: 2 },
 *        'Create Car Listing'
 *      );
 *    } catch (error) {
 *      await globalErrorHandler.handleError(
 *        error,
 *        'Create Car Listing',
 *        { userId: currentUser.uid }
 *      );
 *    }
 * 
 * 4. GET USER MESSAGE:
 *    catch (error) {
 *      const userMessage = globalErrorHandler.getErrorMessage(error);
 *      Toast.error(userMessage);
 *    }
 */
