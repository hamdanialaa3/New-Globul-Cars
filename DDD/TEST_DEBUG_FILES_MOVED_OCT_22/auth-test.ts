// Firebase Authentication Test Utilities
// Bulgarian Car Marketplace - Development Tools

import { getAuth, signInAnonymously, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase/firebase-config';

/**
 * Test anonymous authentication
 * Returns promise with test result
 */
export const testAnonymousAuth = async (): Promise<{
  success: boolean;
  result?: any;
  error?: any;
}> => {
  console.log('Testing Anonymous Authentication...');
  try {
    const result = await signInAnonymously(auth);
    console.log('Anonymous auth SUCCESS:', {
      uid: result.user.uid,
      isAnonymous: result.user.isAnonymous
    });
    return { success: true, result };
  } catch (error: any) {
    console.error('Anonymous auth FAILED:', {
      code: error.code,
      message: error.message
    });
    return { success: false, error };
  }
};

/**
 * Test Google authentication
 * Returns promise with test result
 */
export const testGoogleAuth = async (): Promise<{
  success: boolean;
  result?: any;
  error?: any;
}> => {
  console.log('Testing Google Authentication...');
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    console.log('Opening Google popup...');
    const result = await signInWithPopup(auth, provider);
    
    console.log('Google auth SUCCESS:', {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName
    });
    return { success: true, result };
  } catch (error: any) {
    console.error('Google auth FAILED:', {
      code: error.code,
      message: error.message
    });
    
    // Detailed error analysis
    if (error.code === 'auth/popup-blocked') {
      console.log('Browser blocked the popup. Enable popups for this site.');
    } else if (error.code === 'auth/operation-not-allowed') {
      console.log('Google sign-in is disabled in Firebase Console.');
    } else if (error.code === 'auth/unauthorized-domain') {
      console.log('Domain not authorized in Firebase Console.');
    }
    
    return { success: false, error };
  }
};

/**
 * Run comprehensive authentication tests
 * Tests all available authentication methods
 */
export const runAuthenticationTests = async (): Promise<{
  anonymous: { success: boolean; result?: any; error?: any };
  google: { success: boolean; result?: any; error?: any };
}> => {
  console.log('Starting Firebase Authentication Tests...');
  console.log('Current domain:', window.location.hostname);
  console.log('Current protocol:', window.location.protocol);
  
  const results: {
    anonymous: { success: boolean; result?: any; error?: any };
    google: { success: boolean; result?: any; error?: any };
  } = {
    anonymous: { success: false },
    google: { success: false }
  };
  
  // Test 1: Anonymous Auth
  const anonymousResult = await testAnonymousAuth();
  results.anonymous = anonymousResult;
  
  // Test 2: Google Auth (only if anonymous succeeded)
  if (anonymousResult.success) {
    console.log('Anonymous auth worked, testing Google auth...');
    const googleResult = await testGoogleAuth();
    results.google = googleResult;
  } else {
    console.log('Skipping Google auth test due to anonymous auth failure');
    results.google = { success: false, error: 'Anonymous auth failed first' };
  }
  
  // Summary
  console.log('Test Results Summary:', {
    anonymous: results.anonymous.success ? 'PASS' : 'FAIL',
    google: results.google.success ? 'PASS' : 'FAIL'
  });
  
  return results;
};

// Development mode auto-run
if (process.env.NODE_ENV === 'development') {
  // Auto-run tests after DOM loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(runAuthenticationTests, 2000);
    });
  } else {
    setTimeout(runAuthenticationTests, 2000);
  }
}

// Expose to window for manual testing
declare global {
  interface Window {
    firebaseAuthTest: {
      testAnonymousAuth: typeof testAnonymousAuth;
      testGoogleAuth: typeof testGoogleAuth;
      runAuthenticationTests: typeof runAuthenticationTests;
    };
  }
}

window.firebaseAuthTest = {
  testAnonymousAuth,
  testGoogleAuth,
  runAuthenticationTests
};