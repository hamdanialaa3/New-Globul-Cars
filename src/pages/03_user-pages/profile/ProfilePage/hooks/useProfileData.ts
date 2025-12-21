// ProfilePage/hooks/useProfileData.ts
// Hook for loading and managing profile data
// Phase 0 Day 2: Extracted from useProfile.ts

import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db, auth } from '../../../../../firebase/firebase-config';
import { logger } from '../../../../../services/logger-service';
import type { BulgarianUser } from '../../../../../types/user/bulgarian-user.types';

export interface UseProfileDataReturn {
  user: BulgarianUser | null;
  loading: boolean;
  isOwnProfile: boolean;
  loadUserData: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<BulgarianUser | null>>;
}

export const useProfileData = (targetUserId?: string): UseProfileDataReturn => {
  const [user, setUser] = useState<BulgarianUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(true);

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setUser(null);
        setIsOwnProfile(false);
        return;
      }

      // Determine which user to load
      const userId = targetUserId || currentUser.uid;
      
      if (!userId) {
        logger.warn('[useProfileData] userId is null/undefined - skipping');
        setUser(null);
        setIsOwnProfile(false);
        return;
      }
      
      setIsOwnProfile(userId === currentUser.uid);

      // Get initial data
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as BulgarianUser;
        setUser({ ...userData, uid: userDoc.id });
      } else {
        logger.warn('User document not found', { userId });
        setUser(null);
      }
      
      setLoading(false);
    } catch (error) {
      logger.error('Error in loadUserData', error as Error, { targetUserId });
      setLoading(false);
    }
  }, [targetUserId]);

  // Real-time listener
  useEffect(() => {
    const currentUser = auth.currentUser;
    
    // ✅ CRITICAL FIX: Guard against null/undefined BEFORE any Firestore operations
    if (!currentUser?.uid) {
      logger.warn('[useProfileData] No authenticated user - skipping real-time listener');
      return;
    }

    const userId = targetUserId || currentUser.uid;
    
    // ✅ CRITICAL FIX: Double-check userId is valid before creating query
    if (!userId) {
      logger.warn('[useProfileData] userId is null/undefined - skipping real-time listener');
      return;
    }

    const userRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(
      userRef, 
      (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data() as BulgarianUser;
          setUser({ ...userData, uid: snapshot.id });
        } else {
          logger.warn('User document not found', { userId });
          setUser(null);
        }
      },
      (error) => {
        logger.error('Error loading user data', error as Error, { userId });
      }
    );

    return () => unsubscribe();
  }, [targetUserId]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  return {
    user,
    loading,
    isOwnProfile,
    loadUserData,
    setUser
  };
};

export default useProfileData;

