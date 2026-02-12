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

    // Add other critical loading states here (e.g., translations, feature flags)

    useEffect(() => {
        // If auth is done loading, we consider the app "hydrated" enough to show UI
        // We can add more conditions here (e.g. && !translationLoading)
        if (!authLoading) {
            // Small buffer to ensure React defines the DOM
            const buffer = requestAnimationFrame(() => {
                setIsReady(true);
                logger.info('[useInitialLoad] Application is ready');
            });

            return () => cancelAnimationFrame(buffer);
        }
    }, [authLoading]);

    return isReady;
};
