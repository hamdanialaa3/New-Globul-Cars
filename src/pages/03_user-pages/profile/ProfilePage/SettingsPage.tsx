/**
 * SettingsPage.tsx
 *
 * Self-contained settings page rendered as a standalone route
 * /profile/:userNumericId/settings via UserSettingsGuardedPage.
 *
 * Fetches the current user's BulgarianUser profile from Firestore
 * independently — does NOT rely on useOutletContext (which only works
 * when rendered as a child of a React Router <Outlet>).
 */
import React, { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { useAuth } from '@/contexts/AuthProvider';
import { useProfileType } from '@/contexts/ProfileTypeContext';
import { SettingsTab } from './tabs/SettingsTab';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { BulgarianUser } from '@/types/user/bulgarian-user.types';

const DEFAULT_STATS = {
  totalListings: 0,
  activeListings: 0,
  totalViews: 0,
  totalMessages: 0,
  trustScore: 0,
  followersCount: 0,
  followingCount: 0,
};

const DEFAULT_VERIFICATION = {
  email: false,
  phone: false,
  id: false,
  business: false,
};

const normalise = (raw: any, uid: string): BulgarianUser =>
  ({
    ...raw,
    uid,
    profileType: raw.profileType ?? 'private',
    planTier: raw.planTier ?? 'free',
    stats: { ...DEFAULT_STATS, ...(raw.stats ?? {}) },
    verification: { ...DEFAULT_VERIFICATION, ...(raw.verification ?? {}) },
  } as BulgarianUser);

const SettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { theme } = useProfileType();

  const [user, setUser] = useState<BulgarianUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Real-time Firestore listener — mirrors what ProfilePageWrapper / useProfile does
  useEffect(() => {
    if (!currentUser?.uid || !db) {
      setLoading(false);
      return;
    }

    const ref = doc(db, 'users', currentUser.uid);
    let isActive = true;
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!isActive) return;
        if (snap.exists()) {
          setUser(normalise(snap.data(), currentUser.uid));
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      () => {
        if (!isActive) return;
        // On error, still hide the spinner so the tab can render with null
        setLoading(false);
      }
    );

    return () => { isActive = false; unsub(); };
  }, [currentUser?.uid]);

  // refresh callback passed down to SettingsTab (re-fetch is handled automatically
  // by the live Firestore listener, but some sections call refresh() explicitly)
  const refresh = useCallback(async () => {
    // The onSnapshot listener already keeps `user` up-to-date automatically;
    // no manual re-fetch needed.
  }, []);

  if (loading) {
    return <LoadingSpinner size="medium" text="Зареждане на настройки..." />;
  }

  return (
    <SettingsTab
      user={user}
      theme={theme}
      refresh={refresh}
      setUser={setUser}
    />
  );
};

export default SettingsPage;

