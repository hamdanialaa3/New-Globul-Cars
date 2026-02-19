/**
 * User Profile Routing with Slug Support
 * 
 * Routes:
 * - /profile/:userNumericId (legacy, redirects to canonical)
 * - /u/:userNumericId/:userSlug (canonical public profile)
 * - /profile/:userNumericId/settings (user's own settings)
 */

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserById, getUserByNumericId, canAccessUserSettings } from '../services/users.service';
import { serviceLogger } from '../services/logger-service';

/**
 * Hook for handling user slug redirects
 * /profile/:userNumericId → /u/:userNumericId/:userSlug
 */
export function useUserSlugRedirect() {
  const navigate = useNavigate();
  const params = useParams<{ userNumericId?: string; userSlug?: string; userId?: string }>();
  const { currentUser } = useAuth();

  useEffect(() => {
    const redirectIfNeeded = async () => {
      try {
        // Case 1: Legacy /profile/:userNumericId → /u/:userNumericId/:slug
        if (params.userNumericId && !params.userSlug) {
          const numericId = parseInt(params.userNumericId, 10);
          const user = await getUserByNumericId(numericId);
          
          if (!user) {
            serviceLogger.warn('User not found', { userNumericId: numericId });
            navigate('/not-found');
            return;
          }

          // Only redirect if user has a slug (otherwise keep minimal profile view)
          if (user.slug) {
            const canonicalUrl = `/u/${user.userNumericId}/${user.slug}`;
            serviceLogger.info('Redirecting from legacy /profile to canonical /u', {
              from: `/profile/${numericId}`,
              to: canonicalUrl,
            });
            navigate(canonicalUrl, { replace: true });
          }
          return;
        }

        // Case 2: /u/:userNumericId/:userSlug with outdated slug
        if (params.userNumericId && params.userSlug) {
          const numericId = parseInt(params.userNumericId, 10);
          const user = await getUserByNumericId(numericId);
          
          if (!user) {
            navigate('/not-found');
            return;
          }

          // If slug mismatch, redirect to current canonical
          if (user.slug && user.slug !== params.userSlug) {
            const canonicalUrl = `/u/${user.userNumericId}/${user.slug}`;
            serviceLogger.info('Redirecting from old slug to current user slug', {
              from: `/u/${numericId}/${params.userSlug}`,
              to: canonicalUrl,
              oldSlug: params.userSlug,
              newSlug: user.slug,
            });
            navigate(canonicalUrl, { replace: true });
          }
        }
      } catch (err) {
        serviceLogger.error('Error processing user slug redirect', {
          error: err instanceof Error ? err.message : String(err),
          params,
        });
        // Continue rendering
      }
    };

    redirectIfNeeded();
  }, [params.userNumericId, params.userSlug, navigate]);
}

/**
 * Check if viewer has permission to edit user settings
 * Only the user themselves or admin can access settings
 */
export function useUserSettingsGuard() {
  const navigate = useNavigate();
  const params = useParams<{ userNumericId?: string }>();
  const { currentUser } = useAuth();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        if (!currentUser) {
          navigate('/login', { state: { returnTo: window.location.pathname } });
          return;
        }

        if (params.userNumericId) {
          const numericId = parseInt(params.userNumericId, 10);
          const user = await getUserByNumericId(numericId);
          
          if (!user) {
            navigate('/not-found');
            return;
          }

          // Check access using centralized service
          const hasAccess = await canAccessUserSettings(currentUser.uid, user.userId);
          
          if (!hasAccess) {
            serviceLogger.warn('Unauthorized access to user settings', {
              accessingUser: currentUser.uid,
              targetUser: user.userId,
            });
            navigate('/unauthorized');
            return;
          }
        }
      } catch (err) {
        serviceLogger.error('Error checking user settings access', {
          error: err instanceof Error ? err.message : String(err),
        });
        navigate('/error');
      }
    };

    checkAccess();
  }, [params.userNumericId, currentUser, navigate]);
}

/**
 * Redirect wrapper for user profile component
 */
export function withUserSlugRedirect<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return (props: P) => {
    useUserSlugRedirect();
    return <Component {...props} />;
  };
}

/**
 * Access control wrapper for user settings page
 */
export function withUserSettingsGuard<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return (props: P) => {
    useUserSettingsGuard();
    return <Component {...props} />;
  };
}
