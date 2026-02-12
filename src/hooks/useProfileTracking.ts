// src/hooks/useProfileTracking.ts
// Auto-Track Profile Views Hook
// 🎯 Automatically track profile visits in real-time
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { profileAnalyticsService } from '../services/analytics/profile-analytics.service';
import { logger } from '../services/logger-service';

/**
 * Hook to automatically track profile views
 * Usage: useProfileTracking(profileUserId)
 */
export const useProfileTracking = (profileUserId: string | undefined) => {
  const { currentUser } = useAuth();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!profileUserId || hasTracked.current) return;
    
    const trackView = async () => {
      try {
        // Get visitor ID (unique per browser)
        const visitorId = profileAnalyticsService.getVisitorId();
        
        // Don't track if viewing own profile
        if (currentUser?.uid === profileUserId) {
          if (process.env.NODE_ENV === 'development') {
            logger.debug('Skipping tracking (own profile)');
          }
          return;
        }
        
        // Track the view
        await profileAnalyticsService.trackProfileView(profileUserId, visitorId);
        hasTracked.current = true;
        
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Profile view tracked automatically');
        }
      } catch (error) {
        logger.error('Error auto-tracking profile view', error as Error, { profileUserId });
      }
    };

    // Track after 2 seconds (to avoid spam)
    const timer = setTimeout(trackView, 2000);

    return () => clearTimeout(timer);
  }, [profileUserId, currentUser]);
};

/**
 * Hook to track car view
 */
export const useCarViewTracking = (carId: string | undefined, ownerId: string | undefined) => {
  const { currentUser } = useAuth();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!carId || !ownerId || hasTracked.current) return;
    
    const trackView = async () => {
      try {
        const visitorId = profileAnalyticsService.getVisitorId();
        
        // Don't track if viewing own car
        if (currentUser?.uid === ownerId) {
          return;
        }
        
        await profileAnalyticsService.trackCarView(carId, ownerId, visitorId);
        hasTracked.current = true;
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Car view tracked automatically', { carId, ownerId });
        }
      } catch (error) {
        logger.error('Error auto-tracking car view', error as Error, { carId, ownerId });
      }
    };

    const timer = setTimeout(trackView, 3000);

    return () => clearTimeout(timer);
  }, [carId, ownerId, currentUser]);
};

export default useProfileTracking;

