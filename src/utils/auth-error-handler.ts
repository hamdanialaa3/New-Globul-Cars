// Firebase Authentication Error Handler - Enhanced Debug Version
// src/utils/auth-error-handler.ts
import { logger } from '../services/logger-service';

export class AuthErrorHandler {
  static diagnoseError(error: any): {
    errorType: string;
    userMessage: string;
    technicalDetails: string;
    suggestedFix: string;
  } {
  logger.error('Authentication error details', error as Error);
    
    const errorCode = error?.code || 'unknown';
    const errorMessage = error?.message || 'Unknown error';
    
    switch (errorCode) {
      case 'auth/popup-blocked':
        return {
          errorType: 'POPUP_BLOCKED',
          userMessage: 'Popup windows are blocked. Please allow popups and try again. / Прозорците са блокирани. Моля, позволете показване на прозорци.',
          technicalDetails: 'Browser blocked the OAuth popup window',
          suggestedFix: 'Enable popups for this site or switch to redirect mode'
        };
        
      case 'auth/popup-closed-by-user':
        return {
          errorType: 'USER_CANCELLED',
          userMessage: 'Login was cancelled. Please try again. / Вход беше отменен. Моля опитайте отново.',
          technicalDetails: 'User closed the popup before completing authentication',
          suggestedFix: 'User needs to complete the authentication process'
        };
        
      case 'auth/unauthorized-domain':
        return {
          errorType: 'DOMAIN_NOT_AUTHORIZED',
          userMessage: 'This domain is not authorized for login. Please contact support. / Този домейн не е оторизиран за вход. Моля, свържете се с поддръжката.',
          technicalDetails: `Domain ${window.location.hostname} not in Firebase authorized domains`,
          suggestedFix: 'Add current domain to Firebase Console > Authentication > Settings > Authorized domains'
        };
        
      case 'auth/operation-not-allowed':
        return {
          errorType: 'PROVIDER_DISABLED',
          userMessage: 'This login method is disabled. Please contact support. / Този метод на вход е инвалидиран. Моля, свържете се с поддръжката.',
          technicalDetails: 'Authentication provider is disabled in Firebase Console',
          suggestedFix: 'Enable the provider in Firebase Console > Authentication > Sign-in method'
        };
        
      case 'auth/invalid-api-key':
        return {
          errorType: 'INVALID_API_KEY',
          userMessage: 'Configuration error. Please contact support. / Грешка в конфигурацията. Моля, свържете се с поддръжката.',
          technicalDetails: 'Firebase API key is invalid or missing',
          suggestedFix: 'Check REACT_APP_FIREBASE_API_KEY in .env file'
        };
        
      case 'auth/network-request-failed':
        return {
          errorType: 'NETWORK_ERROR',
          userMessage: 'Network error. Please check your internet connection. / Грешка в мрежата. Проверете интернет връзката си.',
          technicalDetails: 'Network request to Firebase Auth failed',
          suggestedFix: 'Check internet connection and Firebase service status'
        };
        
      case 'auth/too-many-requests':
        return {
          errorType: 'RATE_LIMITED',
          userMessage: 'Too many attempts. Please wait and try again. / Твърде много опити. Моля изчакайте и опитайте отново.',
          technicalDetails: 'Too many failed attempts from this IP/device',
          suggestedFix: 'Wait before retrying or use different authentication method'
        };
        
      default:
        return {
          errorType: 'UNKNOWN_ERROR',
          userMessage: 'An unexpected error occurred. Please try again or contact support. / Възникна неочаквана грешка. Моля опитайте отново или свържете се с поддръжката.',
          technicalDetails: `Error code: ${errorCode}, Message: ${errorMessage}`,
          suggestedFix: 'Check Firebase Console logs and verify all configurations'
        };
    }
  }
  
  static logDetailedError(error: any, context: string): void {
    logger.error(`Authentication error in ${context}`, error as Error);
    logger.debug('Auth error context', {
      code: error?.code,
      message: error?.message,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      firebaseConfig: {
        hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
        hasAuthDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID
      }
    });
  }
}