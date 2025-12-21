// src/hooks/useLoadingOverlay.ts
import { useLoading } from '@/contexts/LoadingContext';

/**
 * Hook for easy management of global loading overlay
 * 
 * @example
 * const { showLoading, hideLoading } = useLoadingOverlay();
 * 
 * const handleFetch = async () => {
 *   showLoading('جاري جلب البيانات...');
 *   try {
 *     const data = await fetchSomeData();
 *     hideLoading();
 *   } catch (error) {
 *     hideLoading();
 *   }
 * }
 */
export const useLoadingOverlay = () => {
  const { showLoading, hideLoading, setLoading } = useLoading();

  return {
    showLoading,
    hideLoading,
    setLoading,
  };
};
