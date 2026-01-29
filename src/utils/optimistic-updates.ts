/**
 * Optimistic Update Utilities
 * Phase 4 (A2): Helper functions for optimistic UI patterns
 */

import { logger } from '../services/logger-service';

export interface OptimisticOperation<T, R = void> {
  mutate: (data: T) => void;
  operation: () => Promise<R>;
  rollback: (data: T) => void;
  onSuccess?: (result: R) => void;
  onError?: (error: Error) => void;
}

/**
 * Execute an optimistic update with automatic rollback on error
 */
export async function withOptimisticUpdate<T, R = void>({
  mutate,
  operation,
  rollback,
  onSuccess,
  onError
}: OptimisticOperation<T, R>): Promise<R | null> {
  try {
    // Execute the operation
    const result = await operation();
    
    // Success callback
    onSuccess?.(result);
    
    return result;
  } catch (error) {
    // Rollback on error
    logger.error('Optimistic update failed, rolling back', error as Error);
    
    // Execute rollback
    try {
      rollback(null as any); // rollback to previous state
    } catch (rollbackError) {
      logger.error('Rollback failed', rollbackError as Error);
    }
    
    // Error callback
    onError?.(error as Error);
    
    return null;
  }
}

/**
 * Create a simple optimistic updater
 * 
 * @example
 * const updateProfile = createOptimisticUpdater(
 *   setProfile,
 *   () => ProfileService.update(data),
 *   originalProfile
 * );
 */
export function createOptimisticUpdater<T, R = void>(
  setState: (data: T) => void,
  operation: () => Promise<R>,
  originalState: T
) {
  return async (optimisticState: T): Promise<R | null> => {
    // Apply optimistic update
    setState(optimisticState);
    
    try {
      // Execute operation
      const result = await operation();
      return result;
    } catch (error) {
      // Rollback on error
      setState(originalState);
      throw error;
    }
  };
}

