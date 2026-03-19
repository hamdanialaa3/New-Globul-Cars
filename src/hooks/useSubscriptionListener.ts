import { useEffect, useState } from 'react';
import { db } from '../firebase/firebase-config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from './useAuth';
import { useProfileType } from '../contexts/ProfileTypeContext';
import { logger } from '../services/logger-service';
import { SUBSCRIPTION_PLANS } from '../config/subscription-plans';
import { toast } from 'react-toastify';

export const useSubscriptionListener = () => {
    const { user } = useAuth();
    const { profileType, refreshProfileType } = useProfileType();
    const [activePlan, setActivePlan] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        let isMounted = true; // Track component mount state

        // Listen to customers/{uid}/subscriptions
        const subsRef = collection(db, 'customers', user.uid, 'subscriptions');
        const q = query(subsRef, where('status', 'in', ['active', 'trialing']));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            if (!isMounted) return; // Prevent state updates after unmount
            
            if (snapshot.empty) {
                setActivePlan(null);
                setLoading(false);
                return;
            }

            // Assume one active subscription at a time for simplicity
            const subDoc = snapshot.docs[0].data();
            const priceId = subDoc.items?.[0]?.price?.id; // Stripe structure matches typical extension output
            // Alternatively, check subDoc.role or subDoc.price directly depending on extension config

            // Identify the internal tier from the price ID
            let detectedTier: 'dealer' | 'company' | null = null;

            if (priceId === SUBSCRIPTION_PLANS.dealer.id) {
                detectedTier = 'dealer';
            } else if (priceId === SUBSCRIPTION_PLANS.company.id) {
                detectedTier = 'company';
            }

            // Also check role if available
            if (!detectedTier && subDoc.role) {
                if (subDoc.role === 'dealer') detectedTier = 'dealer';
                if (subDoc.role === 'company') detectedTier = 'company';
            }

            if (!isMounted) return; // Check again before state update
            
            setActivePlan(detectedTier);
            setLoading(false);

            if (detectedTier) {
                logger.info(`Detected active subscription tier: ${detectedTier}`);

                // Sync local profile if needed
                try {
                    // Optimistic check - normally we trust ProfileService/Context to be up to date
                    // But here we want to force an update if there's a mismatch
                    const currentTier = profileType === 'private' ? 'free' : profileType;

                    // Trigger upgrade logic
                    if (detectedTier === 'dealer' && currentTier !== 'dealer') {
                        // Refresh profile to reflect new status
                        refreshProfileType();
                    } else if (detectedTier === 'company' && currentTier !== 'company') {
                        refreshProfileType();
                    }

                    // For now, let's just log and toast on distinct change
                } catch (err) {
                    logger.error('Error syncing subscription to profile', err as Error);
                }
            }
        }, (error) => {
            if (!isMounted) return; // Don't process error if unmounted
            logger.error('Error listening to subscriptions', error);
            setLoading(false);
        });

        // Cleanup function
        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [user, profileType, refreshProfileType]);

    return { activePlan, loading };
};
