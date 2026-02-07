import { logger } from '../services/logger-service';

/**
 * Environment Variables Validation
 * Validates required environment variables on app startup
 */

interface EnvConfig {
  REACT_APP_ADMIN_EMAIL?: string;
  REACT_APP_ADMIN_PASSWORD?: string;
  REACT_APP_FIREBASE_API_KEY?: string;
  REACT_APP_FIREBASE_AUTH_DOMAIN?: string;
  REACT_APP_FIREBASE_PROJECT_ID?: string;
  REACT_APP_FIREBASE_STORAGE_BUCKET?: string;
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID?: string;
  REACT_APP_FIREBASE_APP_ID?: string;
}

class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

/**
 * Validates required environment variables
 * Throws error if critical variables are missing
 */
export function validateEnvironmentVariables(): void {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Critical Firebase variables
  const requiredFirebaseVars = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_AUTH_DOMAIN',
    'REACT_APP_FIREBASE_PROJECT_ID',
    'REACT_APP_FIREBASE_STORAGE_BUCKET',
    'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
    'REACT_APP_FIREBASE_APP_ID'
  ];

  requiredFirebaseVars.forEach(varName => {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  });

  // Admin credentials (warnings only - app can work without them)
  if (!import.meta.env.VITE_ADMIN_EMAIL) {
    warnings.push('REACT_APP_ADMIN_EMAIL not set - Super Admin login will not work');
  }

  if (!import.meta.env.VITE_ADMIN_PASSWORD) {
    warnings.push('REACT_APP_ADMIN_PASSWORD not set - Super Admin login will not work');
  }

  // Log warnings in development
  if (process.env.NODE_ENV === 'development' && warnings.length > 0) {
    logger.warn('⚠️ Environment Variable Warnings:', warnings);
  }

  // Handle missing critical variables
  if (errors.length > 0) {
    const message = `Missing required environment variables:\n${errors.join('\n')}\n\n` +
      'Please check your .env file and ensure all required variables are set.';

    // In production, log and continue (Firebase config has safe fallbacks in firebase-config.ts)
    if (process.env.NODE_ENV === 'production') {
      logger.error(message);
      return; // Do not crash the app in production
    }

    // In non-production, throw to catch misconfiguration early
    throw new EnvValidationError(message);
  }
}

/**
 * Get admin email from environment
 * Returns empty string if not set (for security)
 */
export function getAdminEmail(): string {
  return import.meta.env.VITE_ADMIN_EMAIL || '';
}

/**
 * Get admin password from environment
 * Returns empty string if not set (for security)
 */
export function getAdminPassword(): string {
  return import.meta.env.VITE_ADMIN_PASSWORD || '';
}

/**
 * Check if admin credentials are configured
 */
export function isAdminConfigured(): boolean {
  return !!(
    import.meta.env.VITE_ADMIN_EMAIL &&
    import.meta.env.VITE_ADMIN_PASSWORD &&
    import.meta.env.VITE_ADMIN_EMAIL.trim() !== '' &&
    import.meta.env.VITE_ADMIN_PASSWORD.trim() !== ''
  );
}
