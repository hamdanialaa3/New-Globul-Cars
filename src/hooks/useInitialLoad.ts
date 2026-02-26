import { useState, useEffect } from 'react';
import { useAuth } from './useAuth'; // Assuming this provides auth state
import { logger } from '../services/logger-service';

/**
 * Hook to manage initial application loading state.
 * Replaces legacy setTimeout hacks.
 */
export const useInitialLoad = () => {
    const [isReady, setIsReady] = useState(false);
    const { loading: authLoading } = useAuth();

    const maxWaitMs = 1200;

    // Add other critical loading states here (e.g., translations, feature flags)

    useEffect(() => {
        let rafId: number | null = null;
        let timeoutId: number | null = null;

        // If auth is done loading, we consider the app "hydrated" enough to show UI
        // We can add more conditions here (e.g. && !translationLoading)
        if (!authLoading) {
            // Small buffer to ensure React defines the DOM
            rafId = requestAnimationFrame(() => {
                setIsReady(true);
                logger.info('[useInitialLoad] Application is ready');
            });
        } else {
            // Fallback: stop blocking LCP if auth is slow
            timeoutId = window.setTimeout(() => {
                setIsReady(true);
                logger.info('[useInitialLoad] Fallback ready (auth still loading)');
            }, maxWaitMs);
        }

        return () => {
            if (rafId !== null) cancelAnimationFrame(rafId);
            if (timeoutId !== null) window.clearTimeout(timeoutId);
        };
    }, [authLoading]);

    return isReady;
};
