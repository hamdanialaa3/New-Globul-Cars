"use strict";
// src/firebase/firebase-config.ts
// Firebase Configuration for Koli One
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulgarianFirebaseUtils = exports.analytics = exports.appCheck = exports.realtimeDb = exports.functions = exports.storage = exports.db = exports.auth = void 0;
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
const firestore_1 = require("firebase/firestore");
const storage_1 = require("firebase/storage");
const functions_1 = require("firebase/functions");
const analytics_1 = require("firebase/analytics");
const database_1 = require("firebase/database"); // Real-time Database
// import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'; // Disabled to prevent auth errors
const bulgarian_config_1 = require("../config/bulgarian-config");
const logger_service_1 = require("../services/logger-service");
// Firebase configuration - NEW PROJECT: Fire New Globul
// Project ID: fire-new-globul
// Project Number: 973379297533
const firebaseConfig = {
    // ✅ UPDATED: Using Environment Variables with Fallbacks
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAUYM_qygK5pUrlXtdDLmEi-_Kh9SyvRmk",
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "fire-new-globul.firebaseapp.com",
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "fire-new-globul",
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "fire-new-globul.firebasestorage.app",
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "973379297533",
    appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:973379297533:web:59c6534d61a29cae5d9e94",
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-R8JY5KM421"
};
// Initialize Firebase
let app;
try {
    app = (0, app_1.initializeApp)(firebaseConfig);
    logger_service_1.logger.info('Firebase app initialized successfully', { projectId: firebaseConfig.projectId });
}
catch (error) {
    logger_service_1.logger.error('Failed to initialize Firebase app', error);
    throw error;
}
// Initialize App Check - ENABLED ONLY IN PRODUCTION for security
let appCheck = null;
exports.appCheck = appCheck;
if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_RECAPTCHA_SITE_KEY) {
    try {
        const { initializeAppCheck, ReCaptchaV3Provider } = require('firebase/app-check');
        exports.appCheck = appCheck = initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider(process.env.REACT_APP_RECAPTCHA_SITE_KEY),
            isTokenAutoRefreshEnabled: true
        });
        logger_service_1.logger.info('Firebase App Check initialized successfully (production only)');
    }
    catch (error) {
        logger_service_1.logger.warn('App Check initialization failed (non-critical)', { error: error === null || error === void 0 ? void 0 : error.message });
    }
}
else {
    // ✅ FIX: Activate Debug Token for Localhost to bypass "invalid-app-credential"
    // This prints a token in the console that MUST be added to Firebase Console if errors persist.
    if (typeof window !== 'undefined') {
        window.FIREBASE_APP_CHECK_DEBUG_TOKEN = true;
    }
    logger_service_1.logger.debug('Firebase App Check debug mode enabled for localhost');
}
// Initialize Firebase services
let auth;
exports.auth = auth;
try {
    exports.auth = auth = (0, auth_1.getAuth)(app);
    logger_service_1.logger.info('Firebase Auth initialized successfully');
}
catch (error) {
    logger_service_1.logger.error('Failed to initialize Firebase Auth', error);
    throw error;
}
// FIX: Use memory cache to avoid "INTERNAL ASSERTION FAILED" errors
// This prevents IndexedDB corruption issues by using in-memory storage only
let db;
exports.db = db;
try {
    exports.db = db = (0, firestore_1.initializeFirestore)(app, {
        localCache: (0, firestore_1.memoryLocalCache)()
    });
    logger_service_1.logger.info('Firestore initialized with memory cache (no persistence)');
}
catch (error) {
    logger_service_1.logger.error('Failed to initialize Firestore', error);
    exports.db = db = {};
}
exports.storage = (0, storage_1.getStorage)(app);
// Use same region as deployed Cloud Functions to avoid us-central1 mismatches
exports.functions = (0, functions_1.getFunctions)(app, 'europe-west1');
// Initialize Firebase Realtime Database for live updates
exports.realtimeDb = (0, database_1.getDatabase)(app);
// Initialize Analytics (only in production and if measurement ID is provided)
const analytics = (typeof window !== 'undefined' && process.env.VITE_FIREBASE_MEASUREMENT_ID)
    ? (() => {
        try {
            return (0, analytics_1.getAnalytics)(app);
        }
        catch (error) {
            logger_service_1.logger.warn('Analytics initialization failed', { error: error === null || error === void 0 ? void 0 : error.message });
            return null;
        }
    })()
    : null;
exports.analytics = analytics;
// Bulgarian Firebase Utilities
class BulgarianFirebaseUtils {
    // Format currency in Bulgarian format
    static formatCurrency(amount) {
        return new Intl.NumberFormat(bulgarian_config_1.BULGARIAN_CONFIG.locale, {
            style: 'currency',
            currency: bulgarian_config_1.BULGARIAN_CONFIG.currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
    // Validate Bulgarian phone number
    static validateBulgarianPhone(phone) {
        const bulgarianPhoneRegex = /^(\+359|0)[8-9]\d{7,8}$/;
        return bulgarianPhoneRegex.test(phone.replace(/\s+/g, ''));
    }
    // Format Bulgarian phone number
    static formatBulgarianPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('359')) {
            return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 12)}`;
        }
        else if (cleaned.startsWith('0')) {
            return `${cleaned.slice(0, 1)} ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)}`;
        }
        return phone;
    }
    // Generate unique car ID
    static generateCarId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).slice(2, 7);
        return `CAR-${timestamp}-${random}`.toUpperCase();
    }
    // Sanitize Bulgarian text
    static sanitizeBulgarianText(text) {
        return text
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .trim();
    }
    // Format Bulgarian date
    static formatBulgarianDate(date) {
        return new Intl.DateTimeFormat(bulgarian_config_1.BULGARIAN_CONFIG.locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date);
    }
    // Format Bulgarian datetime
    static formatBulgarianDateTime(date) {
        return new Intl.DateTimeFormat(bulgarian_config_1.BULGARIAN_CONFIG.locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
    // Validate Bulgarian postal code
    static validateBulgarianPostalCode(code) {
        const postalRegex = /^\d{4}$/;
        return postalRegex.test(code);
    }
    // Get Bulgarian currency symbol
    static getCurrencySymbol() {
        return bulgarian_config_1.BULGARIAN_CONFIG.currencySymbol;
    }
    // Format number in Bulgarian format
    static formatBulgarianNumber(num) {
        return new Intl.NumberFormat(bulgarian_config_1.BULGARIAN_CONFIG.locale).format(num);
    }
}
exports.BulgarianFirebaseUtils = BulgarianFirebaseUtils;
exports.default = app;
//# sourceMappingURL=firebase-config.js.map