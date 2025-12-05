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
    const handleRedirectResult = async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Checking for OAuth redirect result');
        }
        const result = await SocialAuthService.handleRedirectResult();
        if (result && result.user) {
          if (process.env.NODE_ENV === 'development') {
            logger.debug('Redirect sign-in successful', { email: result.user.email });
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
            
            // CRITICAL FIX: Navigate after successful OAuth redirect (Mobile fix!)
            setTimeout(() => {
              const currentPath = window.location.pathname;
              if (process.env.NODE_ENV === 'development') {
                logger.debug('Current path after OAuth', { currentPath });
              }
              
              // If still on login/register page, redirect to profile
              if (currentPath === '/login' || currentPath === '/register') {
                if (process.env.NODE_ENV === 'development') {
                  logger.debug('Navigating to /profile after OAuth redirect');
                }
                window.location.href = '/profile';  // Changed from /dashboard to /profile
              }
            }, 800);  // 800ms delay to ensure auth state is fully set
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            logger.debug('No redirect result found (normal on direct page loads)');
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
