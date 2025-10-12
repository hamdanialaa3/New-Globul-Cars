// Firebase Authentication Configuration Checker
// src/utils/auth-config-checker.ts

import { auth } from '../firebase/firebase-config';

export class AuthConfigChecker {
  static async checkConfiguration(): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    console.group('🔍 Firebase Authentication Configuration Check');

    // 1. Check environment variables
    const requiredEnvVars = [
      'REACT_APP_FIREBASE_API_KEY',
      'REACT_APP_FIREBASE_AUTH_DOMAIN',
      'REACT_APP_FIREBASE_PROJECT_ID'
    ];

    requiredEnvVars.forEach(envVar => {
      if (!process.env[envVar]) {
        issues.push(`Missing environment variable: ${envVar}`);
        recommendations.push(`Add ${envVar} to your .env file`);
      } else {
        console.log(`✅ ${envVar}: Set`);
      }
    });

    // 2. Check Firebase Auth initialization
    try {
      if (auth.app) {
        console.log('✅ Firebase Auth initialized');
        console.log('Auth Domain:', auth.config.authDomain);
        console.log('Project ID:', auth.app.options.projectId);
      }
    } catch (error) {
      issues.push('Firebase Auth initialization failed');
      recommendations.push('Check Firebase configuration in firebase-config.ts');
    }

    // 3. Check current domain authorization
    const currentDomain = window.location.hostname;
    const isLocalhost = currentDomain === 'localhost' || currentDomain === '127.0.0.1';
    const isHttps = window.location.protocol === 'https:';

    if (!isLocalhost && !isHttps) {
      issues.push('Non-localhost domain must use HTTPS for OAuth');
      recommendations.push('Enable HTTPS or test on localhost');
    }

    // 4. Check browser compatibility
    if (!window.fetch) {
      issues.push('Browser does not support fetch API');
      recommendations.push('Use a modern browser or add fetch polyfill');
    }

    if (!window.crypto || !window.crypto.getRandomValues) {
      issues.push('Browser does not support Web Crypto API');
      recommendations.push('Use a modern browser that supports Web Crypto API');
    }

    // 5. Check popup support
    try {
      const testPopup = window.open('', '', 'width=1,height=1');
      if (testPopup) {
        testPopup.close();
        console.log('✅ Popup support: Available');
      } else {
        issues.push('Popup blocked or not supported');
        recommendations.push('Enable popups for this site or use redirect method');
      }
    } catch (error) {
      issues.push('Cannot test popup support');
    }

    console.groupEnd();

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  }

  static async diagnoseProviderIssue(providerName: string, error: any): Promise<void> {
    console.group(`🔍 ${providerName} Provider Diagnosis`);
    
    console.log('Error details:', error);
    
    const commonIssues = {
      'auth/operation-not-allowed': {
        issue: `${providerName} sign-in is disabled`,
        fix: `Enable ${providerName} in Firebase Console > Authentication > Sign-in method`
      },
      'auth/unauthorized-domain': {
        issue: 'Current domain not authorized',
        fix: `Add ${window.location.hostname} to Firebase Console > Authentication > Settings > Authorized domains`
      },
      'auth/popup-blocked': {
        issue: 'Browser blocked the popup',
        fix: 'Enable popups for this site in browser settings'
      },
      'auth/network-request-failed': {
        issue: 'Network connectivity problem',
        fix: 'Check internet connection and Firebase service status'
      }
    };

    const knownIssue = commonIssues[error.code as keyof typeof commonIssues];
    if (knownIssue) {
      console.log('🚨 Known Issue:', knownIssue.issue);
      console.log('🔧 Suggested Fix:', knownIssue.fix);
    } else {
      console.log('❓ Unknown issue. Check Firebase Console logs.');
    }

    // Provider-specific checks
    if (providerName === 'Google') {
      console.log('Google OAuth specific checks:');
      console.log('- Verify Google OAuth Client ID in Firebase Console');
      console.log('- Check if web client is configured correctly');
      console.log('- Ensure authorized JavaScript origins include current domain');
    }

    if (providerName === 'Facebook') {
      console.log('Facebook OAuth specific checks:');
      console.log('- Verify Facebook App ID and App Secret in Firebase Console');
      console.log('- Check Facebook app is in live mode (not development)');
      console.log('- Ensure valid OAuth redirect URIs in Facebook app settings');
    }

    console.groupEnd();
  }

  static getQuickFixes(): string[] {
    return [
      '1. Check Firebase Console > Authentication > Sign-in method',
      '2. Verify all authentication providers are enabled',
      '3. Check Firebase Console > Authentication > Settings > Authorized domains',
      '4. Ensure current domain is added to authorized domains',
      '5. Verify OAuth provider configurations (Client IDs, App Secrets)',
      '6. Test with Firebase Auth Emulator: firebase emulators:start --only auth',
      '7. Check browser console for detailed error messages',
      '8. Clear browser cache and cookies',
      '9. Try in incognito/private browsing mode',
      '10. Verify .env file has correct Firebase configuration'
    ];
  }
}