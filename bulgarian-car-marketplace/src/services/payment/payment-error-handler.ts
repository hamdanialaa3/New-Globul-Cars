/**
 * Payment Error Handler Service
 * Comprehensive error handling for Stripe payment operations
 */

import { logger } from '../logger-service';

export interface PaymentError {
  code: string;
  message: string;
  type: 'card_error' | 'validation_error' | 'api_error' | 'network_error' | 'unknown_error';
  details?: Record<string, unknown>;
  userMessage: {
    bg: string;
    en: string;
  };
  retryable: boolean;
  action?: 'retry' | 'contact_support' | 'update_card' | 'none';
}

/**
 * Stripe error codes and their handling
 */
const STRIPE_ERROR_CODES: Record<string, Partial<PaymentError>> = {
  // Card errors
  'card_declined': {
    type: 'card_error',
    userMessage: {
      bg: 'Вашата карта беше отхвърлена. Моля, опитайте с друга карта.',
      en: 'Your card was declined. Please try another card.'
    },
    retryable: true,
    action: 'update_card'
  },
  'insufficient_funds': {
    type: 'card_error',
    userMessage: {
      bg: 'Недостатъчни средства по картата. Моля, използвайте друга карта.',
      en: 'Insufficient funds on the card. Please use another card.'
    },
    retryable: true,
    action: 'update_card'
  },
  'expired_card': {
    type: 'card_error',
    userMessage: {
      bg: 'Картата ви е изтекла. Моля, актуализирайте данните си.',
      en: 'Your card has expired. Please update your card details.'
    },
    retryable: true,
    action: 'update_card'
  },
  'incorrect_cvc': {
    type: 'card_error',
    userMessage: {
      bg: 'Невалиден CVC код. Моля, проверете отново.',
      en: 'Invalid CVC code. Please check again.'
    },
    retryable: true,
    action: 'retry'
  },
  'processing_error': {
    type: 'api_error',
    userMessage: {
      bg: 'Грешка при обработка на плащането. Моля, опитайте отново.',
      en: 'Error processing payment. Please try again.'
    },
    retryable: true,
    action: 'retry'
  },
  'rate_limit': {
    type: 'api_error',
    userMessage: {
      bg: 'Твърде много опити. Моля, изчакайте няколко минути.',
      en: 'Too many attempts. Please wait a few minutes.'
    },
    retryable: true,
    action: 'retry'
  },

  // Validation errors
  'invalid_number': {
    type: 'validation_error',
    userMessage: {
      bg: 'Невалиден номер на карта. Моля, проверете отново.',
      en: 'Invalid card number. Please check again.'
    },
    retryable: true,
    action: 'retry'
  },
  'invalid_expiry_month': {
    type: 'validation_error',
    userMessage: {
      bg: 'Невалиден месец на валидност.',
      en: 'Invalid expiry month.'
    },
    retryable: true,
    action: 'retry'
  },
  'invalid_expiry_year': {
    type: 'validation_error',
    userMessage: {
      bg: 'Невалидна година на валидност.',
      en: 'Invalid expiry year.'
    },
    retryable: true,
    action: 'retry'
  },

  // Network errors
  'network_error': {
    type: 'network_error',
    userMessage: {
      bg: 'Грешка в мрежата. Моля, проверете интернет връзката си.',
      en: 'Network error. Please check your internet connection.'
    },
    retryable: true,
    action: 'retry'
  }
};

/**
 * Parse and handle Stripe errors
 */
export class PaymentErrorHandler {
  /**
   * Handle Stripe error and return user-friendly message
   */
  static handleStripeError(error: Error & { code?: string; type?: string; message?: string; decline_code?: string }): PaymentError {
    logger.error('💳 Payment Error:', {
      type: error.type,
      code: error.code,
      message: error.message,
      decline_code: error.decline_code
    });

    const errorCode = error.code || error.decline_code || 'unknown_error';
    const knownError = STRIPE_ERROR_CODES[errorCode];

    if (knownError) {
      return {
        code: errorCode,
        message: error.message || 'Unknown error',
        type: knownError.type!,
        userMessage: knownError.userMessage!,
        retryable: knownError.retryable!,
        action: knownError.action,
        details: { code: error.code, type: error.type, message: error.message }
      };
    }

    // Unknown error
    return {
      code: errorCode,
      message: error.message || 'Unknown payment error',
      type: 'unknown_error',
      userMessage: {
        bg: 'Възникна грешка при плащането. Моля, свържете се с поддръжката.',
        en: 'A payment error occurred. Please contact support.'
      },
      retryable: false,
      action: 'contact_support',
      details: { code: error.code, type: error.type, message: error.message }
    };
  }

  /**
   * Handle generic payment errors
   */
  static handleGenericError(error: Error | unknown): PaymentError {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error('💳 Generic Payment Error:', errorObj);

    // Network error
    if (errorObj.message?.includes('network') || errorObj.message?.includes('fetch')) {
      return {
        code: 'network_error',
        message: errorObj.message,
        type: 'network_error',
        userMessage: {
          bg: 'Грешка в мрежата. Моля, проверете интернет връзката си и опитайте отново.',
          en: 'Network error. Please check your internet connection and try again.'
        },
        retryable: true,
        action: 'retry'
      };
    }

    // Timeout error
    if (errorObj.message?.includes('timeout')) {
      return {
        code: 'timeout_error',
        message: errorObj.message,
        type: 'network_error',
        userMessage: {
          bg: 'Времето за изчакване изтече. Моля, опитайте отново.',
          en: 'Request timed out. Please try again.'
        },
        retryable: true,
        action: 'retry'
      };
    }

    // Default unknown error
    return {
      code: 'unknown_error',
      message: errorObj.message || 'Unknown error',
      type: 'unknown_error',
      userMessage: {
        bg: 'Възникна неочаквана грешка. Моля, свържете се с поддръжката.',
        en: 'An unexpected error occurred. Please contact support.'
      },
      retryable: false,
      action: 'contact_support',
      details: { error: errorObj.message }
    };
  }

  /**
   * Get retry delay based on error type
   */
  static getRetryDelay(error: PaymentError): number {
    switch (error.type) {
      case 'network_error':
        return 3000; // 3 seconds
      case 'api_error':
        return 5000; // 5 seconds
      case 'card_error':
        return 0; // Immediate (user needs to update card)
      default:
        return 0;
    }
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(error: PaymentError): boolean {
    return error.retryable;
  }

  /**
   * Get user action message
   */
  static getActionMessage(error: PaymentError, language: 'bg' | 'en'): string {
    const messages = {
      retry: {
        bg: 'Моля, опитайте отново.',
        en: 'Please try again.'
      },
      contact_support: {
        bg: 'Моля, свържете се с поддръжката на support@globulcars.bg',
        en: 'Please contact support at support@globulcars.bg'
      },
      update_card: {
        bg: 'Моля, актуализирайте данните на картата си.',
        en: 'Please update your card details.'
      },
      none: {
        bg: '',
        en: ''
      }
    };

    return messages[error.action || 'none'][language];
  }

  /**
   * Log payment error for analytics
   */
  static logError(error: PaymentError, context?: Record<string, unknown>): void {
    logger.error('💳 Payment Error Logged', {
      code: error.code,
      type: error.type,
      retryable: error.retryable,
      action: error.action,
      context
    });

    // Use central error handler for critical errors
    if (error.type === 'api_error' || error.type === 'unknown_error') {
      import('../error-handling-service').then(({ errorHandler }) => {
        errorHandler.logError(new Error(error.message), {
          action: 'payment_error',
          severity: error.type === 'unknown_error' ? 'critical' : 'high',
          additionalData: {
            code: error.code,
            retryable: error.retryable,
            context
          }
        });
      });
    }
  }
}

/**
 * Retry mechanism for payment operations
 */
export class PaymentRetryManager {
  private maxRetries = 3;
  private retryCount = 0;
  private lastError: PaymentError | null = null;

  constructor(maxRetries: number = 3) {
    this.maxRetries = maxRetries;
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    onError?: (error: PaymentError) => void
  ): Promise<T> {
    while (this.retryCount < this.maxRetries) {
      try {
        const result = await operation();
        this.reset();
        return result;
      } catch (error: unknown) {
        const stripeError = error as { type?: string; code?: string; message?: string };
        const paymentError = (stripeError && stripeError.type)
          ? PaymentErrorHandler.handleStripeError(stripeError)
          : PaymentErrorHandler.handleGenericError(error instanceof Error ? error : new Error(String(error)));

        this.lastError = paymentError;
        this.retryCount++;

        if (onError) {
          onError(paymentError);
        }

        if (!PaymentErrorHandler.isRetryable(paymentError)) {
          throw paymentError;
        }

        if (this.retryCount >= this.maxRetries) {
          logger.error('💳 Max retries reached', {
            retryCount: this.retryCount,
            lastError: paymentError
          });
          throw paymentError;
        }

        // Wait before retry
        const delay = PaymentErrorHandler.getRetryDelay(paymentError);
        if (delay > 0) {
          logger.info(`💳 Retrying payment after ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw this.lastError || new Error('Max retries reached');
  }

  reset(): void {
    this.retryCount = 0;
    this.lastError = null;
  }

  getRetryCount(): number {
    return this.retryCount;
  }

  getLastError(): PaymentError | null {
    return this.lastError;
  }
}

export default PaymentErrorHandler;
