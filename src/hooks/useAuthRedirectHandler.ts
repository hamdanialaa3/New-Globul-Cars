// src/hooks/useAuthRedirectHandler.ts
// Hook to handle OAuth redirect results

import { useEffect, useState } from 'react';
import { getRedirectResult, User } from 'firebase/auth';
import { auth } from '../firebase/firebase-config';
import { logger } from '../services/logger-service';
import { SocialAuthService } from '../firebase/social-auth-service';

interface AuthRedirectState {
  loading: boolean;
  user: User | null;
  error: string | null;
}

export const useAuthRedirectHandler = () => {
  const [state, setState] = useState<AuthRedirectState>({
    loading: true,
    user: null,
    error: null
  });

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Checking for OAuth redirect result...');
        }
        
        const result = await getRedirectResult(auth);
        
        if (result && result.user) {
          if (process.env.NODE_ENV === 'development') {
            logger.debug('OAuth redirect successful', {
              provider: result.providerId,
              email: result.user.email,
              displayName: result.user.displayName,
              uid: result.user.uid
            });
          }
          
          // Sync user to Firestore
          await SocialAuthService.createOrUpdateBulgarianProfile(result.user);
          
          setState({
            loading: false,
            user: result.user,
            error: null
          });
          
          // Optionally show success message
          if (process.env.NODE_ENV === 'development') {
            logger.debug('Sign-in completed successfully');
          }
          
        } else {
          // No redirect result
          setState({
            loading: false,
            user: null,
            error: null
          });
        }
        
      } catch (error: unknown) {
        logger.error('OAuth redirect error', error as Error);
        
        let errorMessage = 'An error occurred during login. Please try again. / Възникна грешка при вход. Моля, опитайте отново.';
        
        if (error.code === 'auth/popup-blocked') {
          errorMessage = 'Popup windows are blocked. Please allow popups in your browser settings. / Прозорците са блокирани. Позволете показване на прозорци в настройките.';
        } else if (error.code === 'auth/operation-not-allowed') {
          errorMessage = 'Login is currently disabled. Please contact support. / Влизането е деактивирано. Свържете се с поддръжката.';
        } else if (error.code === 'auth/unauthorized-domain') {
          errorMessage = 'This domain is not authorized for login. Please contact support. / Този домейн не е оторизиран. Свържете се с поддръжката.';
        } else if (error.code === 'auth/network-request-failed') {
          errorMessage = 'Network error. Please check your internet connection. / Грешка в мрежата. Проверете интернет връзката.';
        }
        
        setState({
          loading: false,
          user: null,
          error: errorMessage
        });
      }
    };

    handleRedirectResult();
  }, []);

  return state;
};

export default useAuthRedirectHandler;