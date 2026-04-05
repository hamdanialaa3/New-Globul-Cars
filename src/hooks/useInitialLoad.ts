import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useProfileType } from '../contexts/ProfileTypeContext';
import { logger } from '../services/logger-service';

/**
 * Hook to manage initial application loading state.
 * Waits for both Auth AND ProfileType to be ready before showing the app.
 * Returns { isReady, progress } for a professional loading indicator.
 */
export const useInitialLoad = () => {
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const { loading: authLoading } = useAuth();
  const { loading: profileLoading } = useProfileType();

  // Animated progress counter — smooth visual feedback during load
  useEffect(() => {
    if (isReady) {
      setProgress(100);
      return;
    }

    // Phase-based progress: auth → profile → ready
    let target = 15; // Base: React mounted
    if (!authLoading) target = 65; // Auth done
    if (!authLoading && !profileLoading) target = 92; // Profile done

    // Smooth increment towards target
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= target) {
          clearInterval(interval);
          return prev;
        }
        // Ease-out: slow down as we approach target
        const step = Math.max(0.3, (target - prev) * 0.08);
        return Math.min(target, prev + step);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [authLoading, profileLoading, isReady]);

  // Mark ready when both auth and profile are loaded
  useEffect(() => {
    if (!authLoading && !profileLoading) {
      // Small buffer to ensure React settles the DOM
      const buffer = requestAnimationFrame(() => {
        setIsReady(true);
        logger.info('[useInitialLoad] Application is ready');
      });
      return () => cancelAnimationFrame(buffer);
    }
  }, [authLoading, profileLoading]);

  return { isReady, progress: Math.round(progress) };
};
