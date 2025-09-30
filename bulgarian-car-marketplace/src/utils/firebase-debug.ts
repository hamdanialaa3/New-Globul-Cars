// src/utils/firebase-debug.ts
// Firebase Configuration Debug Utility

import { auth } from '../firebase/firebase-config';
import { getAuth } from 'firebase/auth';

export class FirebaseDebug {
  /**
   * Debug Firebase configuration and Google OAuth setup
   */
  static debugConfiguration(): void {
    console.group('🔧 Firebase Configuration Debug');
    
    try {
      const authInstance = getAuth();
      console.log('✅ Firebase Auth initialized');
      console.log('Auth domain:', authInstance.config.authDomain);
      console.log('App name:', authInstance.app.name);
      console.log('Current user:', authInstance.currentUser?.email || 'Not signed in');
    } catch (error) {
      console.error('❌ Firebase Auth initialization error:', error);
    }
    
    // Check environment variables
    console.group('🌍 Environment Variables');
    console.log('API Key:', process.env.REACT_APP_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing');
    console.log('Auth Domain:', process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing');
    console.log('Project ID:', process.env.REACT_APP_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing');
    console.groupEnd();
    
    // Check required APIs
    console.group('🌐 Browser Environment');
    console.log('Protocol:', window.location.protocol);
    console.log('Host:', window.location.host);
    console.log('Origin:', window.location.origin);
    console.log('Popup support:', 'window.open' in window ? '✅ Supported' : '❌ Not supported');
    console.groupEnd();
    
    console.groupEnd();
  }
  
  /**
   * Test Google sign-in setup without actually signing in
   */
  static async testGoogleSetup(): Promise<void> {
    console.group('🔍 Google OAuth Setup Test');
    
    try {
      // This will test if the provider is configured correctly
      const { GoogleAuthProvider } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      console.log('✅ Google provider created successfully');
      console.log('Provider ID:', provider.providerId);
      
      // Check if auth domain allows Google OAuth
      const authDomain = auth.config.authDomain;
      if (authDomain?.includes('firebaseapp.com')) {
        console.log('✅ Using Firebase auth domain:', authDomain);
      } else {
        console.warn('⚠️ Custom auth domain detected:', authDomain);
        console.warn('Make sure this domain is configured in Google OAuth settings');
      }
      
    } catch (error) {
      console.error('❌ Google setup test failed:', error);
    }
    
    console.groupEnd();
  }
  
  /**
   * Check for common configuration issues
   */
  static checkCommonIssues(): string[] {
    const issues: string[] = [];
    
    // Check environment variables
    if (!process.env.REACT_APP_FIREBASE_API_KEY) {
      issues.push('Missing REACT_APP_FIREBASE_API_KEY in environment variables');
    }
    
    if (!process.env.REACT_APP_FIREBASE_AUTH_DOMAIN) {
      issues.push('Missing REACT_APP_FIREBASE_AUTH_DOMAIN in environment variables');
    }
    
    if (!process.env.REACT_APP_FIREBASE_PROJECT_ID) {
      issues.push('Missing REACT_APP_FIREBASE_PROJECT_ID in environment variables');
    }
    
    // Check if running on HTTPS in production
    if (process.env.NODE_ENV === 'production' && window.location.protocol !== 'https:') {
      issues.push('Production app should run on HTTPS for OAuth to work properly');
    }
    
    // Check for localhost variations
    if (window.location.hostname === '127.0.0.1') {
      issues.push('Consider using "localhost" instead of "127.0.0.1" for better compatibility');
    }
    
    return issues;
  }
  
  /**
   * Run complete diagnostic
   */
  static runDiagnostic(): void {
    console.clear();
    console.log('🚀 Firebase Google Auth Diagnostic Report');
    console.log('=========================================');
    
    this.debugConfiguration();
    this.testGoogleSetup();
    
    const issues = this.checkCommonIssues();
    if (issues.length > 0) {
      console.group('⚠️ Potential Issues Found');
      issues.forEach((issue, index) => {
        console.warn(`${index + 1}. ${issue}`);
      });
      console.groupEnd();
    } else {
      console.log('✅ No obvious configuration issues detected');
    }
    
    console.log('\n📝 Next Steps:');
    console.log('1. Check Firebase Console > Authentication > Sign-in method > Google');
    console.log('2. Verify authorized domains include your current domain');
    console.log('3. Check Google Cloud Console > OAuth consent screen');
    console.log('4. Try signing in and check console for specific error messages');
  }
}

// Make it available globally for debugging
(window as any).FirebaseDebug = FirebaseDebug;