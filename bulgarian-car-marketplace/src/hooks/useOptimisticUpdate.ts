/**
 * Optimistic UI Hook
 * Phase 4 (A2): Optimistic UI updates with rollback
 * 
 * Usage:
 * const { execute, isUpdating } = useOptimisticUpdate();
 * 
 * await execute({
 *   optimisticData: { name: 'New Name' },
 *   operation: () => updateProfile({ name: 'New Name' }),
 *   onSuccess: () => toast.success('Updated'),
 *   onError: () => toast.error('Failed')
 * });
 */

import { useState, useCallback } from 'react';
import { logger } from '@/services/logger-service';

export interface OptimisticUpdateOptions<T, R = void> {
  /**
   * Data to apply immediately (optimistic update)
   */
  optimisticData: Partial<T>;
  
  /**
   * The actual async operation
   */
  operation: () => Promise<R>;
  
  /**
   * Callback when operation succeeds
   */
  onSuccess?: (result: R) => void;
  
  /**
   * Callback when operation fails (after rollback)
   */
  onError?: (error: Error) => void;
  
  /**
   * Optional rollback function (if not provided, will restore previous state)
   */
  rollback?: () => Promise<void>;
  
  /**
   * Context for logging
   */
  context?: Record<string, any>;
}

export function useOptimisticUpdate<T = any>() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async <R = void>({
    optimisticData,
    operation,
    onSuccess,
    onError,
    rollback,
    context = {}
  }: OptimisticUpdateOptions<T, R>): Promise<R | null> => {
    setIsUpdating(true);
    setError(null);

    // Store original state for rollback
    const originalState = { ...optimisticData };

    try {
      // 1. Apply optimistic update immediately
      // (Caller should update their state before calling this)
      
      // 2. Execute the actual operation
      const result = await operation();
      
      // 3. Success - optimistic update was correct
      onSuccess?.(result);
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      // 4. Error - rollback the optimistic update
      logger.error('Optimistic update failed', error, {
        ...context,
        optimisticData,
        rollback: !!rollback
      });
      
      // Execute custom rollback or restore original state
      if (rollback) {
        try {
          await rollback();
        } catch (rollbackErr) {
          logger.error('Rollback failed', rollbackErr as Error, context);
        }
      }
      
      setError(error);
      onError?.(error);
      
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    execute,
    isUpdating,
    error
  };
}

export default useOptimisticUpdate;

