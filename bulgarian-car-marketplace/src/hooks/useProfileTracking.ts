// src/hooks/useProfileTracking.ts
// Auto-Track Profile Views Hook
// 🎯 Automatically track profile visits in real-time
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthProvider';
import { profileAnalyticsService } from '../services/analytics/profile-analytics.service';

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
          console.log('⏭️ Skipping tracking (own profile)');
          return;
        }
        
        // Track the view
        await profileAnalyticsService.trackProfileView(profileUserId, visitorId);
        hasTracked.current = true;
        
        console.log('✅ Profile view tracked automatically');
      } catch (error) {
        console.error('❌ Error auto-tracking profile view:', error);
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
        
        console.log('✅ Car view tracked automatically');
      } catch (error) {
        console.error('❌ Error auto-tracking car view:', error);
      }
    };

    const timer = setTimeout(trackView, 3000);

    return () => clearTimeout(timer);
  }, [carId, ownerId, currentUser]);
};

export default useProfileTracking;

