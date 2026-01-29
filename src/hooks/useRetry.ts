/**
 * useRetry Hook
 * Automatic retry logic with exponential backoff
 * 
 * Features:
 * - Configurable max retries
 * - Exponential backoff delay
 * - Error handling
 * - Loading state management
 * 
 * ✅ RELIABILITY ENHANCEMENT: Handles transient network failures
 * 
 * @architecture Utility Hooks / Error Handling
 */

import { useState, useCallback } from 'react';
import { logger } from '../services/logger-service';

interface UseRetryOptions {
  maxRetries?: number;
  baseDelay?: number; // in milliseconds
  exponential?: boolean;
  onError?: (error: Error, attempt: number) => void;
}

interface UseRetryReturn<T> {
  execute: (fn: () => Promise<T>) => Promise<T>;
  isRetrying: boolean;
  retryCount: number;
  lastError: Error | null;
  reset: () => void;
}

const DEFAULT_OPTIONS: UseRetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  exponential: true
};

/**
 * Custom hook for retry logic with exponential backoff
 * 
 * @example
 * ```typescript
 * const { execute, isRetrying } = useRetry({ maxRetries: 3 });
 * 
 * const fetchData = async () => {
 *   return execute(async () => {
 *     const response = await api.search(query);
 *     return response.data;
 *   });
 * };
 * ```
 */
export const useRetry = <T = any>(
  options: UseRetryOptions = {}
): UseRetryReturn<T> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);

  /**
   * Calculate delay with exponential backoff
   */
  const getDelay = useCallback((attempt: number): number => {
    if (!opts.exponential) {
      return opts.baseDelay!;
    }
    return opts.baseDelay! * Math.pow(2, attempt);
  }, [opts.baseDelay, opts.exponential]);

  /**
   * Sleep utility
   */
  const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  /**
   * Execute function with retry logic
   */
  const execute = useCallback(async (fn: () => Promise<T>): Promise<T> => {
    setIsRetrying(false);
    setRetryCount(0);
    setLastError(null);

    let attempt = 0;

    while (attempt <= opts.maxRetries!) {
      try {
        const result = await fn();
        
        if (attempt > 0) {
          logger.info('Retry succeeded', { attempt, totalRetries: opts.maxRetries });
        }
        
        return result;
      } catch (error) {
        const err = error as Error;
        setLastError(err);
        setRetryCount(attempt + 1);

        logger.warn('Operation failed', {
          attempt: attempt + 1,
          maxRetries: opts.maxRetries,
          error: err.message
        });

        // Call error callback if provided
        if (opts.onError) {
          opts.onError(err, attempt + 1);
        }

        // If max retries reached, throw error
        if (attempt >= opts.maxRetries!) {
          logger.error('Max retries reached', err, {
            attempts: attempt + 1,
            maxRetries: opts.maxRetries
          });
          throw err;
        }

        // Calculate delay and wait before retry
        const delay = getDelay(attempt);
        logger.debug('Retrying operation', {
          attempt: attempt + 1,
          delay,
          nextRetryIn: `${delay}ms`
        });

        setIsRetrying(true);
        await sleep(delay);
        setIsRetrying(false);

        attempt++;
      }
    }

    // This should never be reached, but TypeScript requires it
    throw lastError || new Error('Retry failed');
  }, [opts, getDelay, lastError]);

  /**
   * Reset retry state
   */
  const reset = useCallback(() => {
    setIsRetrying(false);
    setRetryCount(0);
    setLastError(null);
  }, []);

  return {
    execute,
    isRetrying,
    retryCount,
    lastError,
    reset
  };
};

/**
 * Simplified retry utility function (without hook)
 * Use when you don't need state tracking
 * 
 * @example
 * ```typescript
 * const result = await retry(
 *   async () => api.search(query),
 *   { maxRetries: 3 }
 * );
 * ```
 */
export const retry = async <T = any>(
  fn: () => Promise<T>,
  options: UseRetryOptions = {}
): Promise<T> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let attempt = 0;

  while (attempt <= opts.maxRetries!) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= opts.maxRetries!) {
        throw error;
      }

      const delay = opts.exponential
        ? opts.baseDelay! * Math.pow(2, attempt)
        : opts.baseDelay!;

      logger.debug('Retrying operation', {
        attempt: attempt + 1,
        delay,
        error: (error as Error).message
      });

      await new Promise(resolve => setTimeout(resolve, delay));
      attempt++;
    }
  }

  throw new Error('Retry failed');
};

export default useRetry;
