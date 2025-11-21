/**
 * useAsyncData Hook
 * Phase 2 (P2.4): Unified async data fetching pattern
 * 
 * Handles loading, error, and data states automatically
 * with proper cleanup on unmount
 */

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@globul-cars/services';

export interface UseAsyncDataOptions<T> {
  initialData?: T | null;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  logContext?: Record<string, any>;
}

export interface UseAsyncDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}

/**
 * Hook for fetching async data with automatic state management
 * 
 * @param fetchFn - Function that returns a Promise<T>
 * @param deps - Dependencies array for useEffect
 * @param options - Optional configuration
 * 
 * @example
 * const { data, loading, error, reload } = useAsyncData(
 *   () => ProfileService.getCompleteProfile(userId),
 *   [userId],
 *   { logContext: { userId } }
 * );
 */
export function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  deps: any[] = [],
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataReturn<T> {
  const [data, setData] = useState<T | null>(options.initialData ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    let cancelled = false;

    try {
      setLoading(true);
      setError(null);

      const result = await fetchFn();

      if (!cancelled) {
        setData(result);
        options.onSuccess?.(result);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      if (!cancelled) {
        setError(error);
        options.onError?.(error);

        if (process.env.NODE_ENV === 'development') {
          logger.error('useAsyncData: fetch failed', error, options.logContext);
        }
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [fetchFn, options]);

  useEffect(() => {
    const cleanup = load();
    return () => {
      cleanup.then(fn => fn?.());
    };
  }, deps);

  const reload = useCallback(async () => {
    await load();
  }, [load]);

  return { data, loading, error, reload };
}

export default useAsyncData;

