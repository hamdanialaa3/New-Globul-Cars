// src/services/firebase-config.ts
// Enhanced Firebase Configuration for Bulgarian Car Marketplace

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, Functions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Google Cloud Services - Server-only (guarded imports)
// These packages are Node.js-only and will fail in browser environments
let BigQuery: any = null;
let SessionsClient: any = null;
let ImageAnnotatorClient: any = null;
let SpeechClient: any = null;
let TextToSpeechClient: any = null;
let Translate: any = null;
let RecaptchaEnterpriseServiceClient: any = null;
let KeyManagementServiceClient: any = null;
let PubSub: any = null;
let CloudTasksClient: any = null;

if (typeof window === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // @ts-ignore
  BigQuery = require('@google-cloud/bigquery').BigQuery;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // @ts-ignore
  SessionsClient = require('@google-cloud/dialogflow').SessionsClient;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // @ts-ignore
  ImageAnnotatorClient = require('@google-cloud/vision').ImageAnnotatorClient;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // @ts-ignore
  SpeechClient = require('@google-cloud/speech').SpeechClient;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // @ts-ignore
  TextToSpeechClient = require('@google-cloud/text-to-speech').TextToSpeechClient;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // @ts-ignore
  Translate = require('@google-cloud/translate').v2;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // @ts-ignore
  RecaptchaEnterpriseServiceClient = require('@google-cloud/recaptcha-enterprise').RecaptchaEnterpriseServiceClient;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // @ts-ignore
  KeyManagementServiceClient = require('@google-cloud/kms').KeyManagementServiceClient;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // @ts-ignore
  PubSub = require('@google-cloud/pubsub').PubSub;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // @ts-ignore
  CloudTasksClient = require('@google-cloud/tasks').CloudTasksClient;
}

// Firebase configuration for Bulgarian Car Marketplace
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "globul-cars.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "globul-cars",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "globul-cars.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-ABCDEFGHIJ"
};

// Bulgarian localization settings
export const BULGARIAN_CONFIG = {
  locale: 'bg-BG',
  currency: 'EUR',
  timezone: 'Europe/Sofia',
  region: 'Bulgaria',
  phonePrefix: '+359',
  defaultLanguage: 'bg' as const,
  supportedLanguages: ['bg', 'en'] as const
};

// Initialize Firebase
export const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions = getFunctions(app);

// Analytics (only in production and browser)
const analytics: Analytics | undefined = (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') ? getAnalytics(app) : undefined;

export { analytics };

// Initialize Google Cloud Services
const projectId = process.env.GCLOUD_PROJECT_ID || 'your-gcp-project-id';

// BigQuery
if (!BigQuery) {
  console.warn('BigQuery is server-only and must be called from a backend/Cloud Function');
}
export const bigquery = BigQuery ? new BigQuery({ projectId }) : null;

// Dialogflow
if (!SessionsClient) {
  console.warn('Dialogflow SessionsClient is server-only and must be called from a backend/Cloud Function');
}
export const dialogflowClient = SessionsClient ? new SessionsClient() : null;

// Google Maps
// const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY || 'your-google-maps-api-key';
export const mapsLoader = null; // Temporarily disabled

// Vision AI
if (!ImageAnnotatorClient) {
  console.warn('Vision AI is server-only and must be called from a backend/Cloud Function');
}
export const visionClient = ImageAnnotatorClient ? new ImageAnnotatorClient() : null;

// Speech Services
if (!SpeechClient) {
  console.warn('Speech Client is server-only and must be called from a backend/Cloud Function');
}
export const speechClient = SpeechClient ? new SpeechClient() : null;

if (!TextToSpeechClient) {
  console.warn('Text-to-Speech Client is server-only and must be called from a backend/Cloud Function');
}
export const ttsClient = TextToSpeechClient ? new TextToSpeechClient() : null;

// Translation
if (!Translate) {
  console.warn('Translation Client is server-only and must be called from a backend/Cloud Function');
}
export const translateClient = Translate ? new Translate.Translate({ projectId }) : null;

// Recaptcha
if (!RecaptchaEnterpriseServiceClient) {
  console.warn('Recaptcha Enterprise Client is server-only and must be called from a backend/Cloud Function');
}
export const recaptchaClient = RecaptchaEnterpriseServiceClient ? new RecaptchaEnterpriseServiceClient() : null;

// KMS
if (!KeyManagementServiceClient) {
  console.warn('KMS Client is server-only and must be called from a backend/Cloud Function');
}
export const kmsClient = KeyManagementServiceClient ? new KeyManagementServiceClient() : null;

// Pub/Sub
if (!PubSub) {
  console.warn('Pub/Sub Client is server-only and must be called from a backend/Cloud Function');
}
export const pubsubClient = PubSub ? new PubSub({ projectId }) : null;

// Cloud Tasks
if (!CloudTasksClient) {
  console.warn('Cloud Tasks Client is server-only and must be called from a backend/Cloud Function');
}
export const cloudTasksClient: CloudTasksClient | null = CloudTasksClient ? new CloudTasksClient() : null;

// Bulgarian Firebase Utilities Class
export class BulgarianFirebaseUtils {
  /**
   * Format currency in Bulgarian format (EUR)
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat(BULGARIAN_CONFIG.locale, {
      style: 'currency',
      currency: BULGARIAN_CONFIG.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Validate Bulgarian phone number
   */
  static validateBulgarianPhone(phone: string): boolean {
    const bulgarianPhoneRegex = /^\+359\d{9}$/;
    return bulgarianPhoneRegex.test(phone.replace(/\s+/g, ''));
  }

  /**
   * Format Bulgarian phone number
   */
  static formatBulgarianPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('359')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('0')) {
      return `+359${cleaned.substring(1)}`;
    } else {
      return `+359${cleaned}`;
    }
  }

  /**
   * Generate Bulgarian-style car ID
   */
  static generateCarId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `BG-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Generate Bulgarian-style user ID
   */
  static generateUserId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `BG-USER-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Format date in Bulgarian format
   */
  static formatBulgarianDate(date: Date): string {
    return new Intl.DateTimeFormat(BULGARIAN_CONFIG.locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  /**
   * Get current Bulgarian time
   */
  static getBulgarianTime(): Date {
    return new Date(new Date().toLocaleString('en-US', { timeZone: BULGARIAN_CONFIG.timezone }));
  }

  /**
   * Validate Bulgarian postal code
   */
  static validateBulgarianPostalCode(postalCode: string): boolean {
    const bulgarianPostalRegex = /^\d{4}$/;
    return bulgarianPostalRegex.test(postalCode);
  }

  /**
   * Get Firebase error message in Bulgarian
   */
  static getBulgarianErrorMessage(error: any): string {
    const errorMessages: { [key: string]: string } = {
      'auth/user-not-found': 'Потребителят не е намерен',
      'auth/wrong-password': 'Грешна парола',
      'auth/email-already-in-use': 'Имейлът вече се използва',
      'auth/weak-password': 'Паролата е твърде слаба',
      'auth/invalid-email': 'Невалиден имейл адрес',
      'auth/network-request-failed': 'Проблем с интернет връзката',
      'auth/too-many-requests': 'Твърде много опити, опитайте по-късно'
    };

    return errorMessages[error.code] || 'Възникна грешка, моля опитайте отново';
  }

  /**
   * Initialize Firebase emulators for development
   */
  static async initializeEmulators(): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      try {
        // Connect to emulators
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectStorageEmulator(storage, 'localhost', 9199);
        connectFunctionsEmulator(functions, 'localhost', 5001);

        console.log('🔥 Firebase emulators initialized for Bulgarian Car Marketplace');
      } catch (error: any) {
        console.warn('Firebase emulators already initialized or not available:', error.message);
      }
    }
  }

  /**
   * Check if running in emulator mode
   */
  static isEmulatorMode(): boolean {
    return process.env.NODE_ENV === 'development' &&
           process.env.FIREBASE_AUTH_EMULATOR_HOST !== undefined;
  }

  /**
   * Sanitize Bulgarian text input
   */
  static sanitizeBulgarianText(text: string): string {
    return text
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .substring(0, 1000); // Limit message length
  }
}

// Development environment setup
if (process.env.NODE_ENV === "development") {
  // Connect to emulators if running
  if (process.env.VITE_USE_EMULATORS === "true") {
    try {
      connectAuthEmulator(auth, "http://localhost:9099");
      connectFirestoreEmulator(db, "localhost", 8080);
      connectStorageEmulator(storage, "localhost", 9199);
      connectFunctionsEmulator(functions, "localhost", 5001);
      console.log("🔥 Connected to Firebase emulators");
    } catch (error) {
      console.log("Firebase emulators not running:", error);
    }
  }
}

// Export default app for compatibility
export default app;
