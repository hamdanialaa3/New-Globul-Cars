// Firebase Authentication Error Handler - Enhanced Debug Version
// src/utils/auth-error-handler.ts

export class AuthErrorHandler {
  static diagnoseError(error: any): {
    errorType: string;
    userMessage: string;
    technicalDetails: string;
    suggestedFix: string;
  } {
    console.error('🚨 Authentication Error Details:', error);
    
    const errorCode = error?.code || 'unknown';
    const errorMessage = error?.message || 'Unknown error';
    
    switch (errorCode) {
      case 'auth/popup-blocked':
        return {
          errorType: 'POPUP_BLOCKED',
          userMessage: 'النوافذ المنبثقة محظورة. يرجى السماح بالنوافذ المنبثقة وإعادة المحاولة.',
          technicalDetails: 'Browser blocked the OAuth popup window',
          suggestedFix: 'Enable popups for this site or switch to redirect mode'
        };
        
      case 'auth/popup-closed-by-user':
        return {
          errorType: 'USER_CANCELLED',
          userMessage: 'تم إلغاء عملية تسجيل الدخول. يرجى المحاولة مرة أخرى.',
          technicalDetails: 'User closed the popup before completing authentication',
          suggestedFix: 'User needs to complete the authentication process'
        };
        
      case 'auth/unauthorized-domain':
        return {
          errorType: 'DOMAIN_NOT_AUTHORIZED',
          userMessage: 'هذا الموقع غير مصرح له بتسجيل الدخول. يرجى الاتصال بالدعم الفني.',
          technicalDetails: `Domain ${window.location.hostname} not in Firebase authorized domains`,
          suggestedFix: 'Add current domain to Firebase Console > Authentication > Settings > Authorized domains'
        };
        
      case 'auth/operation-not-allowed':
        return {
          errorType: 'PROVIDER_DISABLED',
          userMessage: 'طريقة تسجيل الدخول هذه غير مفعلة. يرجى الاتصال بالدعم الفني.',
          technicalDetails: 'Authentication provider is disabled in Firebase Console',
          suggestedFix: 'Enable the provider in Firebase Console > Authentication > Sign-in method'
        };
        
      case 'auth/invalid-api-key':
        return {
          errorType: 'INVALID_API_KEY',
          userMessage: 'خطأ في التكوين. يرجى الاتصال بالدعم الفني.',
          technicalDetails: 'Firebase API key is invalid or missing',
          suggestedFix: 'Check REACT_APP_FIREBASE_API_KEY in .env file'
        };
        
      case 'auth/network-request-failed':
        return {
          errorType: 'NETWORK_ERROR',
          userMessage: 'خطأ في الاتصال بالإنترنت. يرجى التحقق من الاتصال وإعادة المحاولة.',
          technicalDetails: 'Network request to Firebase Auth failed',
          suggestedFix: 'Check internet connection and Firebase service status'
        };
        
      case 'auth/too-many-requests':
        return {
          errorType: 'RATE_LIMITED',
          userMessage: 'تم تجاوز عدد المحاولات المسموح. يرجى الانتظار قليلاً ثم إعادة المحاولة.',
          technicalDetails: 'Too many failed attempts from this IP/device',
          suggestedFix: 'Wait before retrying or use different authentication method'
        };
        
      default:
        return {
          errorType: 'UNKNOWN_ERROR',
          userMessage: 'حدث خطأ غير متوقع. يرجى إعادة المحاولة أو الاتصال بالدعم الفني.',
          technicalDetails: `Error code: ${errorCode}, Message: ${errorMessage}`,
          suggestedFix: 'Check Firebase Console logs and verify all configurations'
        };
    }
  }
  
  static logDetailedError(error: any, context: string): void {
    console.group(`🚨 Authentication Error in ${context}`);
    console.error('Full error object:', error);
    console.log('Error code:', error?.code);
    console.log('Error message:', error?.message);
    console.log('Current URL:', window.location.href);
    console.log('User agent:', navigator.userAgent);
    console.log('Firebase config:', {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY?.slice(0, 10) + '...',
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
    });
    console.groupEnd();
  }
}