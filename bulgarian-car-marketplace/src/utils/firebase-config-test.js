// src/utils/firebase-config-test.js
// Test Firebase configuration and Google Auth setup

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Test Firebase configuration
export const testFirebaseConfig = () => {
  const config = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
  };

  console.group('🔧 Firebase Configuration Test');
  console.log('Config:', config);
  
  try {
    const app = initializeApp(config);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    
    console.log('✅ Firebase app initialized successfully');
    console.log('✅ Auth instance created');
    console.log('✅ Google provider created');
    console.log('Auth domain:', auth.config.authDomain);
    console.log('App name:', auth.app.name);
    
    return { success: true, app, auth, provider };
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    return { success: false, error };
  } finally {
    console.groupEnd();
  }
};

// Run the test when imported
if (typeof window !== 'undefined') {
  window.testFirebaseConfig = testFirebaseConfig;
}