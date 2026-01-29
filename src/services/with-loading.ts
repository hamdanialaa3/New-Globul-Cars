// src/services/with-loading.ts
/**
 * Utility to wrap async functions with automatic loading overlay
 * 
 * @example
 * import { withLoading } from '@/services/with-loading';
 * 
 * const handleFetch = withLoading(
 *   async () => {
 *     return await fetchCars();
 *   },
 *   'جاري جلب السيارات...'
 * );
 */

import { useLoading } from '@/contexts/LoadingContext';
import { normalizeError } from '@/utils/error-helpers';

type AsyncFunction = (...args: unknown[]) => Promise<unknown>;

/**
 * Wraps an async function with loading overlay
 */
export const createLoadingWrapper = (useLoadingHook: typeof useLoading) => {
  return <T extends AsyncFunction>(
    fn: T,
    loadingMessage?: string
  ): T => {
    return (async (...args: unknown[]) => {
      const { showLoading, hideLoading } = useLoadingHook();
      
      showLoading(loadingMessage || 'جاري المعالجة...');
      
      try {
        const result = await fn(...args);
        hideLoading();
        return result;
      } catch (error) {
        hideLoading();
        throw error;
      }
    }) as T;
  };
};

/**
 * React hook to wrap async operations with loading state
 * 
 * @example
 * const { withLoading } = useLoadingWrapper();
 * 
 * const handleFetch = withLoading(
 *   async () => await fetchCars(),
 *   'جاري جلب البيانات...'
 * );
 */
export const useLoadingWrapper = () => {
  const { showLoading, hideLoading } = useLoading();

  const withLoading = <T extends AsyncFunction>(
    fn: T,
    loadingMessage?: string
  ): ((...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>) => {
    return async (...args: Parameters<T>) => {
      showLoading(loadingMessage || 'جاري المعالجة...');
      
      try {
        const result = await fn(...args);
        hideLoading();
        return result;
      } catch (error) {
        hideLoading();
        throw error;
      }
    };
  };

  return { withLoading, showLoading, hideLoading };
};
