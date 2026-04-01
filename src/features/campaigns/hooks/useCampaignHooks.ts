import { useState, useEffect } from 'react';
import { adService } from '../services/campaignService';
import { AdCampaign, AdContext, DeviceType } from '../types';
import { logger } from '@/services/logger-service';

export const useAdInventory = (placementId: string, context: AdContext = {}) => {
    const [ad, setAd] = useState<AdCampaign | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchAd = async () => {
            // Auto-detect device type if not provided
            const width = window.innerWidth;
            const device: DeviceType = width < 768 ? 'mobile' : 'desktop';

            const fullContext: AdContext = {
                device,
                country: 'BG', // Default, could come from UserContext
                ...context
            };

            try {
                const campaign = await adService.getAdForPlacement(placementId, fullContext);
                if (isMounted) setAd(campaign);
            } catch (err) {
                logger.error('[useAdInventory] Fetch failed', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchAd();

        return () => { isMounted = false; };
    }, [placementId, JSON.stringify(context)]); // React to context changes

    return { ad, loading };
};

export const useAdTracker = (campaignId?: string, placementId?: string) => {
    const trackImpression = () => {
        if (!campaignId || !placementId) return;
        adService.trackImpression(campaignId, placementId);
    };

    const trackClick = () => {
        if (!campaignId || !placementId) return;
        adService.trackClick(campaignId, placementId);
    };

    return { trackImpression, trackClick };
};
