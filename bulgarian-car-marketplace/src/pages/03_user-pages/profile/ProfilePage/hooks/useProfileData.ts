// ProfilePage/hooks/useProfileData.ts
// Hook for loading and managing profile data
// Phase 0 Day 2: Extracted from useProfile.ts

import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db, auth } from '../../../../../firebase/firebase-config';
import { logger } from '../../../../../services/logger-service';
import type { BulgarianUser } from '../../../types/user/bulgarian-user.types';

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
      setIsOwnProfile(userId === currentUser.uid);

      // Set up real-time listener
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
          setLoading(false);
        },
        (error) => {
          logger.error('Error loading user data', error as Error, { userId });
          setLoading(false);
        }
      );

      return () => unsubscribe();
      
    } catch (error) {
      logger.error('Error in loadUserData', error as Error, { targetUserId });
      setLoading(false);
    }
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

