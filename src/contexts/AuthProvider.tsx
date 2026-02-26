import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, getAuth } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase-config';
import { SocialAuthService } from '../firebase/social-auth-service';
import { logger } from '../services/logger-service';
import { FirebaseHealthCheck } from '../utils/firebase-health-check';
import type { BulgarianUser } from '../types/user/bulgarian-user.types';
// ⚠️ CRITICAL: Import context + hook from the STABLE isolated module.
// This prevents Vite HMR from re-creating the context object when any
// file in AuthProvider's import chain (e.g. social-auth-service,
// UnifiedProfileService) is hot-reloaded.
import { AuthContext, useAuth } from './auth-context';
import type { AuthContextType, RegisterOptions } from './auth-context';

// Re-export for backward compatibility so all existing consumers
// (ProfileTypeContext, useLogin, etc.) don't need to change their imports.
export { AuthContext, useAuth };
export type { AuthContextType, RegisterOptions };


interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<BulgarianUser | null>(null);
  // If Firebase auth is missing, skip the loading state entirely
  const [loading, setLoading] = useState(!!auth);
  // Ref to store the Firestore profile unsubscribe function
  const profileUnsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // ✅ Guard: skip auth subscription when Firebase is not initialised
    if (!auth) {
      logger.error('Firebase auth is not initialized — AuthProvider is passive');
      return;
    }

    // ✅ isActive guard: prevents stale callbacks after React Strict Mode cleanup
    let isActive = true;

    // Run Firebase health check on mount
    FirebaseHealthCheck.logEnvironmentInfo();
    FirebaseHealthCheck.runFullCheck();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Guard against unmounted/remounted component (React Strict Mode)
      if (!isActive) return;

      try {
        setCurrentUser(user);

        // Tear down previous profile listener when user changes / logs out
        if (profileUnsubscribeRef.current) {
          profileUnsubscribeRef.current();
          profileUnsubscribeRef.current = null;
        }

        if (user) {
          // ─── REAL-TIME PROFILE LISTENER ──────────────────────────────────
          // Listens to Firestore users/{uid} so any device's profile edit
          // (displayName, photoURL, etc.) is reflected here immediately.
          const profileRef = doc(db, 'users', user.uid);
          profileUnsubscribeRef.current = onSnapshot(profileRef, async (snap) => {
            if (!isActive) return;
            if (snap.exists()) {
              const data = snap.data() as BulgarianUser;
              setUserProfile(data);

              // ── SYNC FIRESTORE → FIREBASE AUTH ────────────────────────────
              // If mobile/another device changed displayName in Firestore but
              // this Auth object still has the stale value, sync it now.
              if (
                data.displayName &&
                data.displayName !== user.displayName
              ) {
                try {
                  await updateProfile(user, {
                    displayName: data.displayName,
                    ...(data.photoURL ? { photoURL: data.photoURL } : {}),
                  });
                  // Force React re-render: reload Auth user so fresh displayName
                  // propagates to all components using currentUser.
                  await user.reload();
                  const freshUser = getAuth().currentUser;
                  if (freshUser && isActive) setCurrentUser(freshUser);
                  logger.debug('Synced Firebase Auth displayName from Firestore', {
                    uid: user.uid,
                    newDisplayName: data.displayName,
                  });
                } catch (syncErr) {
                  logger.warn('Could not sync displayName to Firebase Auth', {
                    error: (syncErr as Error).message,
                  });
                }
              }
            } else {
              setUserProfile(null);
            }
          }, (err) => {
            if (isActive) {
              logger.warn('Firestore profile listener error', { error: err.message });
            }
          });

          // AUTO-SYNC: Save/Update user in Firestore whenever auth state changes
          try {
            if (process.env.NODE_ENV === 'development') {
              logger.debug('Auto-syncing user to Firestore', { email: user.email });
            }
            await SocialAuthService.createOrUpdateBulgarianProfile(user);
            if (!isActive) return; // Check again after async operation
            if (process.env.NODE_ENV === 'development') {
              logger.debug('User synced to Firestore successfully', { userId: user.uid });
            }
          } catch (error) {
            if (!isActive) return;
            logger.warn('Could not sync user to Firestore', { error: (error as Error).message, userId: user.uid });
            // Don't block login if Firestore sync fails
          }
        } else {
          // Logged out — clear profile
          setUserProfile(null);
        }

        if (!isActive) return;
        setLoading(false);
      } catch (authError) {
        if (!isActive) return;
        logger.error('Error in auth state change handler', authError as Error);
        setLoading(false);
      }
    });

    // Handle redirect result on app load
    // Enhanced for Cursor browser compatibility
    const handleRedirectResult = async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Checking for OAuth redirect result');
        }

        // Check for pending redirect intent (especially useful for Cursor)
        const redirectIntent = sessionStorage.getItem('oauth-redirect-intent');
        if (redirectIntent && process.env.NODE_ENV === 'development') {
          logger.debug('Pending OAuth redirect detected', { provider: redirectIntent });
        }

        const result = await SocialAuthService.handleRedirectResult();
        if (result && result.user) {
          if (process.env.NODE_ENV === 'development') {
            logger.debug('Redirect sign-in successful', {
              email: result.user.email,
              provider: result.providerId
            });
          }

          // AUTO-SYNC: Save user to Firestore after redirect
          try {
            await SocialAuthService.createOrUpdateBulgarianProfile(result.user);
            if (process.env.NODE_ENV === 'development') {
              logger.debug('Redirect user synced to Firestore', { userId: result.user.uid });
            }
          } catch (error) {
            logger.warn('Could not sync redirect user to Firestore', { error: (error as Error).message });
          }

          // CRITICAL FIX: Robust Redirect after successful OAuth
          logger.info('OAuth login success, initiating robust redirect');

          const currentPath = window.location.pathname;
          const savedRedirect = sessionStorage.getItem('auth_redirect_url');
          const targetPath = savedRedirect || '/profile';

          // Use a slightly more robust check for Cursor/Slow networks
          // and clear intent immediately to prevent reload loops
          sessionStorage.removeItem('oauth-redirect-intent');
          sessionStorage.removeItem('oauth-redirect-timestamp');
          if (savedRedirect) sessionStorage.removeItem('auth_redirect_url');

          if (savedRedirect || currentPath === '/login' || currentPath === '/register' || currentPath === '/') {
            // Force hard reload to target to ensure context clears correctly on social login
            window.location.assign(targetPath);
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            logger.debug('No redirect result found (normal on direct page loads)');
          }

          // Clear any stale redirect intents if no result
          const redirectIntent = sessionStorage.getItem('oauth-redirect-intent');
          if (redirectIntent) {
            const redirectTimestamp = sessionStorage.getItem('oauth-redirect-timestamp');
            if (redirectTimestamp) {
              const timeDiff = Date.now() - parseInt(redirectTimestamp, 10);
              // Clear if older than 2 minutes (redirect likely failed or timed out)
              if (timeDiff > 2 * 60 * 1000) {
                sessionStorage.removeItem('oauth-redirect-intent');
                sessionStorage.removeItem('oauth-redirect-timestamp');
                if (process.env.NODE_ENV === 'development') {
                  logger.debug('Cleared stale OAuth redirect intent');
                }
              }
            }
          }
        }
      } catch (error: any) {
        logger.error('Redirect result error', error as Error);
        if (error.code !== 'auth/no-auth-event') {
          // Only log actual errors, not the normal "no redirect pending" case
          logger.error('OAuth redirect error details', error as Error, {
            code: (error as any).code,
            message: (error as Error).message
          });
        }

        // Clear redirect intent on error
        sessionStorage.removeItem('oauth-redirect-intent');
        sessionStorage.removeItem('oauth-redirect-timestamp');
      }
    };

    handleRedirectResult();

    // Cleanup function
    return () => {
      isActive = false; // ✅ Prevent stale callbacks
      // Stop Firestore profile listener
      if (profileUnsubscribeRef.current) {
        profileUnsubscribeRef.current();
        profileUnsubscribeRef.current = null;
      }
      try {
        if (unsubscribe) {
          unsubscribe();
        }
      } catch (error) {
        logger.warn('Error during auth cleanup', { error: (error as Error).message });
      }
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not initialized');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      logger.info('User logged in successfully', { email });
    } catch (error) {
      logger.error('Login failed', error as Error, { email });
      throw error;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, options?: RegisterOptions) => {
    if (!auth) throw new Error('Firebase not initialized');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update user profile if displayName is provided
      if (options?.displayName && userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: options.displayName
        });
      }

      logger.info('User registered successfully', { email, hasDisplayName: !!options?.displayName });
    } catch (error) {
      logger.error('Registration failed', error as Error, { email });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    if (!auth) throw new Error('Firebase not initialized');
    try {
      await signOut(auth);
      logger.info('User logged out successfully');
    } catch (error) {
      logger.error('Logout failed', error as Error);
      throw error;
    }
  }, []);

  const value: AuthContextType = useMemo(() => ({
    currentUser,
    user: currentUser,
    userProfile,
    // ✅ Authoritative displayName — always reads Firestore (real-time) first.
    // This is what all UI components should use instead of currentUser.displayName.
    displayName: userProfile?.displayName || currentUser?.displayName || null,
    loading,
    login,
    register,
    logout,
  }), [currentUser, userProfile, loading, login, register, logout]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
