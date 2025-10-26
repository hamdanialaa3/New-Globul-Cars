import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../firebase/firebase-config';
import { SocialAuthService } from '../firebase/social-auth-service';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      // AUTO-SYNC: Save/Update user in Firestore whenever auth state changes
      if (user) {
        try {
          console.log('🔄 Auto-syncing user to Firestore:', user.email);
          await SocialAuthService.createOrUpdateBulgarianProfile(user);
          console.log('✅ User synced to Firestore successfully');
        } catch (error) {
          console.warn('⚠️ Could not sync user to Firestore:', error);
          // Don't block login if Firestore sync fails
        }
      }
      
      setLoading(false);
    });

    // Handle redirect result on app load
    const handleRedirectResult = async () => {
      try {
        console.log('🔍 Checking for redirect result...');
        const result = await SocialAuthService.handleRedirectResult();
        if (result && result.user) {
          console.log('✅ Redirect sign-in successful:', result.user.email);
          
          // AUTO-SYNC: Save user to Firestore after redirect
          try {
            await SocialAuthService.createOrUpdateBulgarianProfile(result.user);
            console.log('✅ Redirect user synced to Firestore');
          } catch (error) {
            console.warn('⚠️ Could not sync redirect user to Firestore');
          }
          
          // User will be set by onAuthStateChanged above
          // Show success message and navigate
          if (typeof window !== 'undefined') {
            const successMessage = `تم تسجيل الدخول بنجاح! مرحباً ${result.user.displayName || result.user.email}`;
            console.log('🎉', successMessage);
            
            // CRITICAL FIX: Navigate after successful OAuth redirect (Mobile fix!)
            setTimeout(() => {
              const currentPath = window.location.pathname;
              console.log('🔄 Current path after OAuth:', currentPath);
              
              // If still on login/register page, redirect to dashboard
              if (currentPath === '/login' || currentPath === '/register') {
                console.log('🚀 Navigating to /dashboard after OAuth redirect');
                window.location.href = '/dashboard';  // Full page navigation to ensure state updates
              }
            }, 800);  // 800ms delay to ensure auth state is fully set
          }
        } else {
          console.log('ℹ️ No redirect result found (normal on direct page loads)');
        }
      } catch (error: any) {
        console.error('❌ Redirect result error:', error);
        if (error.code !== 'auth/no-auth-event') {
          // Only log actual errors, not the normal "no redirect pending" case
          console.error('Redirect error details:', {
            code: error.code,
            message: error.message
          });
        }
      }
    };

    handleRedirectResult();

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, options?: RegisterOptions) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile if displayName is provided
    if (options?.displayName && userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: options.displayName
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
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
