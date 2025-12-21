import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../firebase/firebase-config';
import { SocialAuthService } from '../firebase/social-auth-service';
import { logger } from '../services/logger-service';
import { FirebaseHealthCheck } from '../utils/firebase-health-check';

interface RegisterOptions {
  displayName?: string;
}

interface AuthContextType {
  currentUser: User | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, options?: RegisterOptions) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // ✅ CRITICAL: Check if Firebase is properly initialized
  if (!auth) {
    logger.error('Firebase auth is not initialized');
    return (
      <AuthContext.Provider value={{
        currentUser: null,
        user: null,
        loading: false,
        login: async () => { throw new Error('Firebase not initialized'); },
        register: async () => { throw new Error('Firebase not initialized'); },
        logout: async () => { throw new Error('Firebase not initialized'); }
      }}>
        {children}
      </AuthContext.Provider>
    );
  }

  useEffect(() => {
    // Run Firebase health check on mount
    FirebaseHealthCheck.logEnvironmentInfo();
    FirebaseHealthCheck.runFullCheck();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setCurrentUser(user);
        
        // AUTO-SYNC: Save/Update user in Firestore whenever auth state changes
        if (user) {
          try {
            if (process.env.NODE_ENV === 'development') {
              logger.debug('Auto-syncing user to Firestore', { email: user.email });
            }
            await SocialAuthService.createOrUpdateBulgarianProfile(user);
            if (process.env.NODE_ENV === 'development') {
              logger.debug('User synced to Firestore successfully', { userId: user.uid });
            }
          } catch (error) {
            logger.warn('Could not sync user to Firestore', { error: (error as Error).message, userId: user.uid });
            // Don't block login if Firestore sync fails
          }
        }
        
        setLoading(false);
      } catch (authError) {
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
          
          // User will be set by onAuthStateChanged above
          // Show success message and navigate
          if (typeof window !== 'undefined') {
            const successMessage = `Login successful! Welcome ${result.user.displayName || result.user.email}`;
            if (process.env.NODE_ENV === 'development') {
              logger.info('OAuth login success', { message: successMessage });
            }
            
            // CRITICAL FIX: Navigate after successful OAuth redirect
            // Enhanced for Cursor browser - use longer delay if needed
            const delay = redirectIntent ? 1200 : 800; // Longer delay for Cursor
            setTimeout(() => {
              const currentPath = window.location.pathname;
              if (process.env.NODE_ENV === 'development') {
                logger.debug('Current path after OAuth', { currentPath, delay });
              }
              
              // If still on login/register page, redirect to profile
              if (currentPath === '/login' || currentPath === '/register' || currentPath === '/') {
                if (process.env.NODE_ENV === 'development') {
                  logger.debug('Navigating to /profile after OAuth redirect');
                }
                // Use window.location.href for more reliable redirect in Cursor
                window.location.href = '/profile';
              }
            }, delay);
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
            code: error.code,
            message: error.message
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
      try {
        if (unsubscribe) {
          unsubscribe();
        }
      } catch (error) {
        logger.warn('Error during auth cleanup', { error: (error as Error).message });
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      logger.info('User logged in successfully', { email });
    } catch (error) {
      logger.error('Login failed', error as Error, { email });
      throw error;
    }
  };

  const register = async (email: string, password: string, options?: RegisterOptions) => {
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
  };

  const logout = async () => {
    try {
      await signOut(auth);
      logger.info('User logged out successfully');
    } catch (error) {
      logger.error('Logout failed', error as Error);
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    user: currentUser,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
