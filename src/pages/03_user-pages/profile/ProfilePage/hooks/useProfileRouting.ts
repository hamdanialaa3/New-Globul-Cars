import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import { logger } from '@/services/logger-service';
import { ensureUserNumericId } from '@/services/numeric-id-assignment.service';
import type { UserProfile } from '@/types/common-types';

const RESERVED_ROUTES = [
  'settings',
  'my-ads',
  'campaigns',
  'analytics',
  'consultations',
  'favorites',
  'following',
  'view',
];

/**
 * Extracts numeric target user ID from URL path.
 * Validates: only numeric IDs allowed, rejects Firebase UIDs, skips reserved routes.
 */
export function useTargetUserId() {
  const location = useLocation();
  const navigate = useNavigate();

  return React.useMemo(() => {
    // Check if path is /profile/view/{userId}
    const viewMatch = location.pathname.match(/^\/profile\/view\/(\d+)/);
    if (viewMatch) {
      const numericId = viewMatch[1];
      if (/^\d+$/.test(numericId)) {
        return numericId;
      }
      logger.error('🔒 REJECTED: Non-numeric ID in /profile/view/ path', {
        path: location.pathname,
        invalidId: numericId,
      });
      return undefined;
    }

    // Check /profile/{userId} format
    const profileMatch = location.pathname.match(/^\/profile\/([^/]+)/);
    if (profileMatch) {
      const userId = profileMatch[1];
      if (RESERVED_ROUTES.includes(userId)) {
        return undefined;
      }
      if (/^\d+$/.test(userId)) {
        return userId;
      }
      logger.error(
        '🔒 REJECTED: Non-numeric ID (Firebase UID?) in profile URL',
        {
          path: location.pathname,
          invalidId: userId,
          reason: 'Only numeric IDs are allowed in profile URLs',
        }
      );
      navigate('/profile', { replace: true });
      return undefined;
    }

    return undefined;
  }, [location.pathname, navigate]);
}

/**
 * Constitution enforcement — validates owner vs visitor route format.
 * Sets isValidationReady once all data is available.
 * Redirects: Owner → /profile/{id}, Visitor → /profile/view/{id}
 */
export function useConstitutionEnforcement(
  targetUserId: string | undefined,
  viewer: UserProfile | null | undefined,
  activeProfile: UserProfile | null | undefined,
  profileLoading?: boolean
) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isValidationReady, setIsValidationReady] = React.useState(false);

  React.useEffect(() => {
    if (!targetUserId) {
      logger.debug('Routing check skipped - missing targetUserId', {
        hasCurrentUser: !!currentUser,
        hasTargetUserId: false,
      });
      setIsValidationReady(false);
      return;
    }

    // Unauthenticated user viewing another's profile — allow public access
    if (!currentUser) {
      logger.info('✅ Unauthenticated user - allowing public profile view', {
        targetUserId,
      });
      setIsValidationReady(true);
      return;
    }

    // Guest user bypass — no numericId, allow access
    if (currentUser.isAnonymous) {
      logger.info(
        '✅ Guest user detected - allowing profile access without numericId validation',
        {
          uid: currentUser.uid,
          targetUserId,
        }
      );
      setIsValidationReady(true);
      return;
    }

    // For regular users: Redirect enforcement requires numeric IDs.
    // If loading is still in progress, wait. If loading is done but IDs are
    // absent (older accounts without numericId), allow access and skip redirects.
    if (!viewer?.numericId || !activeProfile?.numericId) {
      if (profileLoading !== false) {
        logger.debug('Routing check pending - profile data still loading', {
          hasViewerNumericId: !!viewer?.numericId,
          hasActiveProfileNumericId: !!activeProfile?.numericId,
        });
        setIsValidationReady(false);
        return;
      }
      logger.warn(
        '⚠️ Numeric IDs unavailable after load — allowing access without redirect enforcement',
        {
          hasViewerNumericId: !!viewer?.numericId,
          hasActiveProfileNumericId: !!activeProfile?.numericId,
        }
      );
      setIsValidationReady(true);
      return;
    }

    setIsValidationReady(true);

    const viewerNumericId = Number(viewer.numericId);
    const targetNumericId = Number(activeProfile.numericId);

    if (isNaN(viewerNumericId) || isNaN(targetNumericId)) {
      logger.error('🔒 INVALID NUMERIC IDs - Cannot proceed with routing', {
        viewerNumericId,
        targetNumericId,
        targetUserId,
      });
      return;
    }

    const isOtherUserProfile = viewerNumericId !== targetNumericId;

    logger.debug('🔒 Profile routing check', {
      path: location.pathname,
      viewerNumericId,
      targetNumericId,
      isOtherUserProfile,
      targetUserId,
    });

    // RULE 1: Same user (Owner) -> /profile/{id} ONLY
    // RULE 2: Different user (Visitor) -> /profile/view/{id} ONLY
    if (viewerNumericId === targetNumericId) {
      if (location.pathname.startsWith(`/profile/view/${targetUserId}`)) {
        const redirectPath = location.pathname.replace(
          `/profile/view/${targetUserId}`,
          `/profile/${targetUserId}`
        );
        logger.warn('🏛️ CONSTITUTION ENFORCED: Owner must use private format', {
          from: location.pathname,
          to: redirectPath,
          numericId: viewerNumericId,
          rule: 'Owner can ONLY access /profile/{own_id}',
        });
        navigate(redirectPath, { replace: true });
        return;
      }
    } else {
      if (
        location.pathname.startsWith(`/profile/${targetUserId}`) &&
        !location.pathname.startsWith(`/profile/view/${targetUserId}`)
      ) {
        const redirectPath = location.pathname.replace(
          `/profile/${targetUserId}`,
          `/profile/view/${targetUserId}`
        );
        logger.error(
          '🏛️ CONSTITUTION VIOLATION: Unauthorized private access blocked',
          {
            from: location.pathname,
            to: redirectPath,
            viewerNumericId,
            targetNumericId,
            rule: 'Non-owner CANNOT access /profile/{other_id}',
            violation: "Attempted to access another user's private profile",
          }
        );
        navigate(redirectPath, { replace: true });
        return;
      }
    }
  }, [
    currentUser,
    targetUserId,
    viewer,
    activeProfile,
    profileLoading,
    location.pathname,
    navigate,
  ]);

  return isValidationReady;
}

/**
 * Ensures current user has a numeric ID, and handles auto-redirect logic:
 * - /profile → /profile/{numericId} for logged-in users
 * - /profile → /login for anonymous
 * - Prevents rendering without numeric ID
 */
export function useNumericIdRedirect(
  isAccessingOwnProfile: boolean,
  currentUserNumericId: number | string | undefined,
  isOwnProfile: boolean,
  loading: boolean,
  refresh: () => void
) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Ensure current user has numeric ID
  React.useEffect(() => {
    const ensureId = async () => {
      if (!currentUser?.uid || !isAccessingOwnProfile) return;
      if (currentUser.isAnonymous) {
        logger.warn(
          '⚠️ Guest user detected - skipping numeric ID assignment (no write permissions)',
          { uid: currentUser.uid }
        );
        return;
      }
      if (currentUserNumericId) return;

      try {
        logger.info('🔢 Ensuring numeric ID for current user', {
          uid: currentUser.uid,
        });
        const numericId = await ensureUserNumericId(currentUser.uid);
        if (numericId) {
          logger.info('✅ Numeric ID assigned/retrieved', {
            uid: currentUser.uid,
            numericId,
          });
          refresh();
        }
      } catch (error) {
        logger.error('❌ Failed to ensure numeric ID', error as Error, {
          uid: currentUser.uid,
        });
      }
    };
    ensureId();
  }, [
    currentUser?.uid,
    currentUser?.isAnonymous,
    currentUserNumericId,
    isAccessingOwnProfile,
    refresh,
  ]);

  // Auto-redirect /profile → /profile/{numericId}
  React.useEffect(() => {
    const currentPath = location.pathname;
    const isBasePath =
      currentPath === '/profile' || currentPath === '/profile/';

    if (isBasePath) {
      if (!currentUser) {
        logger.warn('🔒 Unauthorized: Redirecting to login', {
          from: currentPath,
        });
        navigate('/login', { replace: true, state: { from: currentPath } });
        return;
      }

      if (currentUserNumericId) {
        const expectedPath = `/profile/${currentUserNumericId}`;
        logger.info('⚡ Auto-redirecting to numeric ID profile', {
          from: currentPath,
          to: expectedPath,
          numericId: currentUserNumericId,
        });
        navigate(expectedPath, { replace: true });
      } else if (!loading) {
        logger.warn(
          '⚠️ User logged in but no numeric ID available after loading',
          {
            uid: currentUser.uid,
            loading,
          }
        );
      }
    }
  }, [location.pathname, currentUser, currentUserNumericId, loading, navigate]);

  // Prevent rendering without numeric ID
  React.useEffect(() => {
    const currentPath = location.pathname;
    const isBasePath =
      currentPath === '/profile' || currentPath === '/profile/';
    if (isBasePath) return;

    if (isOwnProfile && currentUser && !currentUserNumericId && !loading) {
      logger.warn(
        '🔒 Own profile accessed without numeric ID - redirecting to base',
        {
          uid: currentUser.uid,
          currentPath,
        }
      );
      navigate('/profile', { replace: true });
    }
  }, [
    location.pathname,
    isOwnProfile,
    currentUser,
    currentUserNumericId,
    loading,
    navigate,
  ]);
}

/**
 * Computes the basePath for tab navigation links.
 * Own profile: /profile/{numericId}, Other user: /profile/view/{numericId}
 */
export function useProfileBasePath(
  isOwnProfile: boolean,
  currentUserNumericId: number | string | undefined,
  activeProfile: UserProfile | null | undefined,
  loading: boolean
) {
  return React.useMemo(() => {
    if (isOwnProfile) {
      const numericId = currentUserNumericId || activeProfile?.numericId;
      if (numericId) {
        return `/profile/${numericId}`;
      }
      return '/profile';
    }

    if (activeProfile?.numericId) {
      return `/profile/view/${activeProfile.numericId}`;
    }

    if (loading) {
      return '/profile';
    }

    if (activeProfile?.uid && !activeProfile?.numericId) {
      logger.warn('⚠️ basePath: Profile loaded but no numeric ID', {
        uid: activeProfile?.uid,
        isOwnProfile,
      });
    }

    return '/profile';
  }, [
    activeProfile?.uid,
    activeProfile?.numericId,
    currentUserNumericId,
    isOwnProfile,
    loading,
  ]);
}
