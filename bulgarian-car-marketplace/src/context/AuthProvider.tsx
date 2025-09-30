import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase-config';
import { SocialAuthService } from '../firebase/social-auth-service';

interface AuthContextType {
  currentUser: User | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Handle redirect result on app load
    const handleRedirectResult = async () => {
      try {
        console.log('🔍 Checking for redirect result...');
        const result = await SocialAuthService.handleRedirectResult();
        if (result && result.user) {
          console.log('✅ Redirect sign-in successful:', result.user.email);
          // User will be set by onAuthStateChanged above
          // Show success message to user
          if (typeof window !== 'undefined') {
            const successMessage = `تم تسجيل الدخول بنجاح! مرحباً ${result.user.displayName || result.user.email}`;
            // You can show a toast notification here if you have a toast system
            console.log('🎉', successMessage);
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

  const register = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
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
