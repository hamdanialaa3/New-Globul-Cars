import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { useAuth } from '@/contexts/AuthProvider';
import { siteSettingsService } from '@/services/site-settings.service';
import PricingPageEnhanced from './PricingPageEnhanced';
import { toast } from 'react-toastify';
import { logger } from '@/services/logger-service';

/**
 * PricingSlotWrapper handles the business logic for the Enhanced Pricing Page.
 * It manages routing to checkout for paid plans OR instant free upgrade via the GOD MODE free toggle 
 * managed in the Super Admin dashboard.
 */
const PricingSlotWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [subscriptionMode, setSubscriptionMode] = useState<'free' | 'paid'>('paid');

  useEffect(() => {
    let isActive = true;
    const unsub = siteSettingsService.subscribeSiteSettings((settings) => {
      if (isActive && settings?.pricing?.subscriptionMode) {
        setSubscriptionMode(settings.pricing.subscriptionMode);
      }
    });

    return () => {
      isActive = false;
      unsub();
    };
  }, []);

  const handleSelectPlan = async (planId: string, interval: 'monthly' | 'annual') => {
    if (!currentUser) {
      toast.error('Моля, влезте в профила си, за да се абонирате / Please login to subscribe');
      navigate('/login?redirect=/');
      return;
    }

    try {
      // 1. FREE MODE (GOD MODE TOGGLE FROM SUPER ADMIN)
      if (subscriptionMode === 'free') {
        const confirmed = window.confirm(
          `🎉 AMAZING NEWS! Subscriptions are currently FREE!\n\nAre you sure you want to instantly upgrade to the '${planId.toUpperCase()}' plan for free?`
        );
        
        if (!confirmed) return;

        // Upgrade instantly in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          await updateDoc(userRef, {
            accountType: planId, // 'free' | 'dealer' | 'company'
            'subscription.status': 'active',
            'subscription.planId': planId,
            'subscription.interval': interval,
            'subscription.isFreeGift': true,
            'subscription.updatedAt': new Date().toISOString()
          });
          
          toast.success(`Welcome to the ${planId.toUpperCase()} tier! Your profile has been upgraded! 🚀`);
          logger.info('Instant free upgrade applied to user', { uid: currentUser.uid, planId });
          
          // Optionally redirect to profile dashboard
          setTimeout(() => navigate('/profile'), 2000);
        } else {
          toast.error('User profile not found. Please contact support.');
        }
        
      } else {
        // 2. PAID MODE (NORMAL OPERATION)
        // Redirect to the Checkout Page properly
        logger.info('Redirecting to checkout', { planId, interval });
        navigate(`/manual-checkout?plan=${planId}&interval=${interval}`);
      }

    } catch (error) {
      logger.error('Error processing plan selection', error as Error);
      toast.error('An error occurred while processing your subscription. Please try again.');
    }
  };

  return (
    <PricingPageEnhanced onSelectPlan={handleSelectPlan} />
  );
};

export default PricingSlotWrapper;
