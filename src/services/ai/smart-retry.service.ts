/**
 * Smart Retry Policy Service
 * سياسة إعادة المحاولة الذكية - تمييز الأخطاء المؤقتة عن الدائمة
 * 
 * يمنع التدوير في حلقة محاولات غير مجدية
 */

import { logger } from '../logger-service';

export type ErrorCategory = 'transient' | 'permanent' | 'throttle' | 'unknown';

export interface ErrorClassification {
  category: ErrorCategory;
  shouldRetry: boolean;
  maxRetries: number;
  backoffMs: number;
  escalate: boolean;
  message: string;
}

export interface RetryState {
  attemptCount: number;
  lastError?: Error;
  lastAttemptTime?: Date;
  totalDelayMs: number;
  wasSuccessful: boolean;
}

/**
 * Error patterns and their classifications
 */
const ERROR_PATTERNS: Array<{
  pattern: RegExp | string;
  classification: Omit<ErrorClassification, 'message'>;
}> = [
  // === TRANSIENT ERRORS (retry with backoff) ===
  {
    pattern: /timeout|ETIMEDOUT|ESOCKETTIMEDOUT/i,
    classification: { category: 'transient', shouldRetry: true, maxRetries: 3, backoffMs: 1000, escalate: false }
  },
  {
    pattern: /ECONNRESET|ECONNREFUSED|ENOTFOUND/i,
    classification: { category: 'transient', shouldRetry: true, maxRetries: 3, backoffMs: 2000, escalate: false }
  },
  {
    pattern: /network|fetch failed|failed to fetch/i,
    classification: { category: 'transient', shouldRetry: true, maxRetries: 3, backoffMs: 1500, escalate: false }
  },
  {
    pattern: /502|503|504/,
    classification: { category: 'transient', shouldRetry: true, maxRetries: 3, backoffMs: 2000, escalate: false }
  },
  
  // === THROTTLE ERRORS (retry with longer backoff) ===
  {
    pattern: /429|rate.?limit|too.?many.?requests|quota.?exceeded/i,
    classification: { category: 'throttle', shouldRetry: true, maxRetries: 2, backoffMs: 30000, escalate: false }
  },
  {
    pattern: /resource.?exhausted/i,
    classification: { category: 'throttle', shouldRetry: true, maxRetries: 2, backoffMs: 60000, escalate: true }
  },
  
  // === PERMANENT ERRORS (don't retry, escalate) ===
  {
    pattern: /401|403|unauthorized|forbidden/i,
    classification: { category: 'permanent', shouldRetry: false, maxRetries: 0, backoffMs: 0, escalate: true }
  },
  {
    pattern: /400|bad.?request|invalid.?argument/i,
    classification: { category: 'permanent', shouldRetry: false, maxRetries: 0, backoffMs: 0, escalate: false }
  },
  {
    pattern: /404|not.?found/i,
    classification: { category: 'permanent', shouldRetry: false, maxRetries: 0, backoffMs: 0, escalate: false }
  },
  {
    pattern: /invalid.?api.?key|api.?key.?expired/i,
    classification: { category: 'permanent', shouldRetry: false, maxRetries: 0, backoffMs: 0, escalate: true }
  },
  {
    pattern: /content.?blocked|safety|harmful/i,
    classification: { category: 'permanent', shouldRetry: false, maxRetries: 0, backoffMs: 0, escalate: true }
  },
  {
    pattern: /schema.?validation|invalid.?json|parse.?error/i,
    classification: { category: 'permanent', shouldRetry: false, maxRetries: 0, backoffMs: 0, escalate: false }
  }
];

/**
 * Classify an error to determine retry behavior
 */
export function classifyError(error: Error | string): ErrorClassification {
  const errorString = typeof error === 'string' ? error : error.message;
  
  for (const { pattern, classification } of ERROR_PATTERNS) {
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern, 'i');
    if (regex.test(errorString)) {
      return { ...classification, message: errorString };
    }
  }
  
  // Unknown errors - conservative retry
  return {
    category: 'unknown',
    shouldRetry: true,
    maxRetries: 1,
    backoffMs: 5000,
    escalate: true,
    message: errorString
  };
}

/**
 * Calculate exponential backoff delay
 */
export function calculateBackoff(
  baseDelayMs: number, 
  attemptNumber: number, 
  maxDelayMs: number = 60000
): number {
  // Exponential backoff with jitter
  const exponentialDelay = baseDelayMs * Math.pow(2, attemptNumber - 1);
  const jitter = Math.random() * 0.3 * exponentialDelay; // 30% jitter
  return Math.min(exponentialDelay + jitter, maxDelayMs);
}

/**
 * Execute an async function with smart retry policy
 */
export async function withSmartRetry<T>(
  fn: () => Promise<T>,
  options: {
    operationName: string;
    maxRetries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    onRetry?: (attempt: number, error: Error, delay: number) => void;
    onPermanentError?: (error: Error, classification: ErrorClassification) => void;
  }
): Promise<{ result?: T; state: RetryState; classification?: ErrorClassification }> {
  const maxRetries = options.maxRetries ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 1000;
  const maxDelayMs = options.maxDelayMs ?? 60000;
  
  const state: RetryState = {
    attemptCount: 0,
    totalDelayMs: 0,
    wasSuccessful: false
  };
  
  while (state.attemptCount <= maxRetries) {
    state.attemptCount++;
    state.lastAttemptTime = new Date();
    
    try {
      logger.debug(`Attempt ${state.attemptCount} for ${options.operationName}`);
      const result = await fn();
      state.wasSuccessful = true;
      
      if (state.attemptCount > 1) {
        logger.info(`${options.operationName} succeeded after ${state.attemptCount} attempts`);
      }
      
      return { result, state };
    } catch (error) {
      state.lastError = error instanceof Error ? error : new Error(String(error));
      const classification = classifyError(state.lastError);
      
      logger.warn(`${options.operationName} failed`, {
        attempt: state.attemptCount,
        category: classification.category,
        shouldRetry: classification.shouldRetry,
        error: state.lastError.message
      });
      
      // Don't retry permanent errors
      if (!classification.shouldRetry || state.attemptCount > classification.maxRetries) {
        if (options.onPermanentError) {
          options.onPermanentError(state.lastError, classification);
        }
        return { state, classification };
      }
      
      // Calculate delay
      const delay = calculateBackoff(
        classification.backoffMs || baseDelayMs, 
        state.attemptCount, 
        maxDelayMs
      );
      state.totalDelayMs += delay;
      
      if (options.onRetry) {
        options.onRetry(state.attemptCount, state.lastError, delay);
      }
      
      logger.debug(`Retrying ${options.operationName} in ${delay}ms`);
      await sleep(delay);
    }
  }
  
  // Max retries exceeded
  const finalClassification = state.lastError 
    ? classifyError(state.lastError) 
    : { category: 'unknown' as const, shouldRetry: false, maxRetries: 0, backoffMs: 0, escalate: true, message: 'Max retries exceeded' };
  
  logger.error(`${options.operationName} failed after ${state.attemptCount} attempts`, state.lastError);
  
  return { state, classification: finalClassification };
}

/**
 * Simple retry wrapper - returns result or throws
 */
export async function retry<T>(
  fn: () => Promise<T>,
  operationName: string,
  maxRetries: number = 3
): Promise<T> {
  const { result, state, classification } = await withSmartRetry(fn, { operationName, maxRetries });
  
  if (result !== undefined) {
    return result;
  }
  
  const error = state.lastError || new Error(`${operationName} failed`);
  (error as any).retryState = state;
  (error as any).classification = classification;
  throw error;
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: Error | string): boolean {
  return classifyError(error).shouldRetry;
}

/**
 * Check if an error should be escalated to admin
 */
export function shouldEscalate(error: Error | string): boolean {
  return classifyError(error).escalate;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a circuit breaker for repeated failures
 */
export function createCircuitBreaker(options: {
  failureThreshold: number;
  resetTimeMs: number;
  operationName: string;
}) {
  let failures = 0;
  let lastFailureTime: number | null = null;
  let isOpen = false;
  
  return {
    async execute<T>(fn: () => Promise<T>): Promise<T> {
      // Check if circuit should reset
      if (isOpen && lastFailureTime && Date.now() - lastFailureTime > options.resetTimeMs) {
        isOpen = false;
        failures = 0;
        logger.info(`Circuit breaker reset for ${options.operationName}`);
      }
      
      if (isOpen) {
        throw new Error(`Circuit breaker open for ${options.operationName}. Too many failures.`);
      }
      
      try {
        const result = await fn();
        failures = 0; // Reset on success
        return result;
      } catch (error) {
        failures++;
        lastFailureTime = Date.now();
        
        if (failures >= options.failureThreshold) {
          isOpen = true;
          logger.error(`Circuit breaker opened for ${options.operationName} after ${failures} failures`);
        }
        
        throw error;
      }
    },
    
    get state() {
      return { isOpen, failures, lastFailureTime };
    },
    
    reset() {
      isOpen = false;
      failures = 0;
      lastFailureTime = null;
    }
  };
}
