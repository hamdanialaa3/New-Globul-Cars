// src/hooks/useAuthRedirectHandler.ts
// Hook to handle OAuth redirect results

import { useEffect, useState } from 'react';
import { getRedirectResult, User } from 'firebase/auth';
import { auth } from '@globul-cars/services';
import { logger } from '@globul-cars/services';
import { SocialAuthService } from '@globul-cars/services';

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
        
      } catch (error: any) {
        logger.error('OAuth redirect error', error as Error);
        
        let errorMessage = 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.';
        
        if (error.code === 'auth/popup-blocked') {
          errorMessage = 'النوافذ المنبثقة محظورة. يرجى السماح بالنوافذ المنبثقة في إعدادات المتصفح.';
        } else if (error.code === 'auth/operation-not-allowed') {
          errorMessage = 'تسجيل الدخول غير مفعل حالياً. يرجى الاتصال بالدعم الفني.';
        } else if (error.code === 'auth/unauthorized-domain') {
          errorMessage = 'هذا الموقع غير مصرح له بتسجيل الدخول. يرجى الاتصال بالدعم الفني.';
        } else if (error.code === 'auth/network-request-failed') {
          errorMessage = 'خطأ في الشبكة. يرجى التحقق من الاتصال بالإنترنت.';
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