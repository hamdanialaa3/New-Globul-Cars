// Firebase Configuration for Bulgarian Car Marketplace
// Moved to @globul-cars/services package

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getDatabase } from 'firebase/database'; // Real-time Database
// import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'; // Disabled to prevent auth errors
import { BULGARIAN_CONFIG } from '@globul-cars/core/config/bulgarian-config';
import { logger } from '../logger/logger-service';

// Type declaration for reCAPTCHA
declare global {
  interface Window {
    grecaptcha?: any;
  }
}

// Firebase configuration - NEW PROJECT: Fire New Globul
// Project ID: fire-new-globul
// Project Number: 973379297533
const firebaseConfig = {
  apiKey: process.env.REACT_APP_GOOGLE_FIREBASE_WEB_KEY || "AIzaSyAUYM_qygK5pUrlXtdDLmEi-_Kh9SyvRmk",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "fire-new-globul.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "fire-new-globul",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "fire-new-globul.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "973379297533",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:973379297533:web:59c6534d61a29cae5d9e94",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-TDRZ4Z3D7Z"
};

// Initialize Firebase
let app: any;
try {
  app = initializeApp(firebaseConfig);
  logger.info('Firebase app initialized successfully', { projectId: firebaseConfig.projectId });
} catch (error) {
  logger.error('Failed to initialize Firebase app', error as Error);
  throw error;
}

// Initialize App Check - COMPLETELY DISABLED to prevent auth errors
let appCheck: any = null;
if (process.env.NODE_ENV === 'development') {
  logger.debug('Firebase App Check is disabled to prevent authentication errors');
}
// DO NOT initialize App Check as it causes auth/firebase-app-check-token-is-invalid errors

// Initialize Firebase services
let auth: any;
try {
  auth = getAuth(app);
  logger.info('Firebase Auth initialized successfully');
} catch (error) {
  logger.error('Failed to initialize Firebase Auth', error as Error);
  throw error;
}
export { auth };

// Initialize Firestore with custom settings to prevent state errors
// OPTIMIZED: Cache enabled for better performance
let db: any;
try {
  db = initializeFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    ignoreUndefinedProperties: true,
    experimentalAutoDetectLongPolling: true,  // Better connection handling
    experimentalForceLongPolling: false        // Auto-detect for best performance
  });
  logger.info('Firestore initialized successfully');
} catch (error) {
  logger.error('Failed to initialize Firestore', error as Error);
  throw error;
}
export { db };

export const storage = getStorage(app);
// Use same region as deployed Cloud Functions to avoid us-central1 mismatches
export const functions = getFunctions(app, 'europe-west1');
// Initialize Firebase Realtime Database for live updates
export const realtimeDb = getDatabase(app);
export { appCheck };

// Initialize Analytics (only in production and if measurement ID is provided)
const analytics: Analytics | null = (typeof window !== 'undefined' && process.env.VITE_FIREBASE_MEASUREMENT_ID)
  ? (() => {
      try {
        return getAnalytics(app);
      } catch (error) {
        logger.warn('Analytics initialization failed', { error: (error as Error)?.message });
        return null;
      }
    })()
  : null;
export { analytics };

// Bulgarian Firebase Utilities
export class BulgarianFirebaseUtils {
  // Format currency in Bulgarian format
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat(BULGARIAN_CONFIG.locale, {
      style: 'currency',
      currency: BULGARIAN_CONFIG.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Validate Bulgarian phone number
  static validateBulgarianPhone(phone: string): boolean {
    const bulgarianPhoneRegex = /^(\+359|0)[8-9]\d{7,8}$/;
    return bulgarianPhoneRegex.test(phone.replace(/\s+/g, ''));
  }

  // Format Bulgarian phone number
  static formatBulgarianPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('359')) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 12)}`;
    } else if (cleaned.startsWith('0')) {
      return `${cleaned.slice(0, 1)} ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)}`;
    }
    return phone;
  }

  // Generate unique car ID
  static generateCarId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 7);
    return `CAR-${timestamp}-${random}`.toUpperCase();
  }

  // Sanitize Bulgarian text
  static sanitizeBulgarianText(text: string): string {
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .trim();
  }

  // Format Bulgarian date
  static formatBulgarianDate(date: Date): string {
    return new Intl.DateTimeFormat(BULGARIAN_CONFIG.locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  }

  // Format Bulgarian datetime
  static formatBulgarianDateTime(date: Date): string {
    return new Intl.DateTimeFormat(BULGARIAN_CONFIG.locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  // Validate Bulgarian postal code
  static validateBulgarianPostalCode(code: string): boolean {
    const postalRegex = /^\d{4}$/;
    return postalRegex.test(code);
  }

  // Get Bulgarian currency symbol
  static getCurrencySymbol(): string {
    return BULGARIAN_CONFIG.currencySymbol;
  }

  // Format number in Bulgarian format
  static formatBulgarianNumber(num: number): string {
    return new Intl.NumberFormat(BULGARIAN_CONFIG.locale).format(num);
  }
}

export default app;

