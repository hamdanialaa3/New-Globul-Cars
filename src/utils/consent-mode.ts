// src/utils/consent-mode.ts
/**
 * Google Consent Mode v2 Implementation
 * 
 * Implements GDPR-compliant consent management for:
 * - Google Analytics 4
 * - Google Ads
 * - Google Tag Manager
 * 
 * CRITICAL: This must load BEFORE any Google services initialize
 * 
 * Learn more: https://developers.google.com/tag-platform/security/guides/consent
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

import { logger } from '@/services/logger-service';

export type ConsentStatus = 'granted' | 'denied';

export interface ConsentSettings {
  analytics_storage: ConsentStatus;
  ad_storage: ConsentStatus;
  ad_user_data: ConsentStatus;
  ad_personalization: ConsentStatus;
  functionality_storage: ConsentStatus;
  personalization_storage: ConsentStatus;
  security_storage: ConsentStatus;
}

/**
 * Default consent state (GDPR-compliant - all denied until user consent)
 */
const DEFAULT_CONSENT: ConsentSettings = {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  functionality_storage: 'granted', // Required for site to function
  personalization_storage: 'denied',
  security_storage: 'granted' // Required for security
};

/**
 * Initialize Google Consent Mode v2
 * MUST be called BEFORE any gtag/GA4 initialization
 * Safe to call multiple times (idempotent)
 */
export const initConsentMode = (): void => {
  // Initialize dataLayer if not exists
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function() {
    window.dataLayer?.push(arguments);
  };

  // Check if consent mode was already initialized
  const alreadyInitialized = window.dataLayer.some(
    (item: any) => item && item[0] === 'consent' && item[1] === 'default'
  );

  // Set default consent state (BEFORE any tags load) - only if not already set
  // Note: Consent mode is now initialized in public/index.html before any tags
  // This function is kept for backward compatibility and React-based consent updates
  if (!alreadyInitialized) {
    window.gtag('consent', 'default', {
      ...DEFAULT_CONSENT,
      wait_for_update: 500 // Wait 500ms for user consent before firing tags
    });

    // Log initialization
    if (process.env.NODE_ENV === 'development') {
      logger.debug('[Consent Mode] Initialized with default state', { DEFAULT_CONSENT });
    }
  } else if (process.env.NODE_ENV === 'development') {
    logger.debug('[Consent Mode] Already initialized in HTML, skipping');
  }
};

/**
 * Update consent settings when user makes a choice
 * 
 * @example
 * // User accepts all cookies
 * updateConsent({
 *   analytics_storage: 'granted',
 *   ad_storage: 'granted',
 *   ad_user_data: 'granted',
 *   ad_personalization: 'granted'
 * });
 */
export const updateConsent = (settings: Partial<ConsentSettings>): void => {
  // Initialize gtag if not already initialized
  if (!window.gtag) {
    // Initialize dataLayer and gtag if not exists
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function() {
      window.dataLayer?.push(arguments);
    };
    
    // Initialize consent mode with default settings if not already done
    if (!window.dataLayer.some((item: any) => item && item[0] === 'consent' && item[1] === 'default')) {
      window.gtag('consent', 'default', {
        ...DEFAULT_CONSENT,
        wait_for_update: 500,
        region: ['BG', 'EU']
      });
    }
  }

  window.gtag('consent', 'update', settings);

  // Save to localStorage for persistence
  saveConsentPreferences(settings);

  // Log update
  if (process.env.NODE_ENV === 'development') {
    logger.debug('[Consent Mode] Updated consent', { settings });
  }
};

/**
 * Grant all consents (user clicks "Accept All")
 */
export const grantAllConsents = (): void => {
  updateConsent({
    analytics_storage: 'granted',
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    personalization_storage: 'granted'
  });
};

/**
 * Deny all consents (user clicks "Reject All")
 */
export const denyAllConsents = (): void => {
  updateConsent({
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    personalization_storage: 'denied'
  });
};

/**
 * Save consent preferences to localStorage
 */
const saveConsentPreferences = (settings: Partial<ConsentSettings>): void => {
  try {
    const existing = getConsentPreferences();
    const updated = { ...existing, ...settings, timestamp: Date.now() };
    localStorage.setItem('consent_preferences', JSON.stringify(updated));
  } catch (error) {
    logger.error('[Consent Mode] Failed to save preferences', error as Error);
  }
};

/**
 * Get saved consent preferences from localStorage
 */
export const getConsentPreferences = (): (ConsentSettings & { timestamp?: number }) | null => {
  try {
    const saved = localStorage.getItem('consent_preferences');
    if (!saved) return null;
    
    const preferences = JSON.parse(saved);
    
    // Check if preferences are still valid (7 days)
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    if (preferences.timestamp && Date.now() - preferences.timestamp > sevenDaysMs) {
      // Expired - clear and return null
      localStorage.removeItem('consent_preferences');
      return null;
    }
    
    return preferences;
  } catch (error) {
    logger.error('[Consent Mode] Failed to load preferences', error as Error);
    return null;
  }
};

/**
 * Check if user has made a consent choice
 */
export const hasUserConsented = (): boolean => {
  return getConsentPreferences() !== null;
};

/**
 * Apply saved consent preferences on page load
 * Should be called after initConsentMode()
 */
export const applySavedConsent = (): void => {
  const saved = getConsentPreferences();
  if (saved) {
    // Remove timestamp before updating
    const { timestamp, ...settings } = saved;
    updateConsent(settings);
  }
};

/**
 * Clear all consent preferences (for testing or user request)
 */
export const clearConsentPreferences = (): void => {
  try {
    localStorage.removeItem('consent_preferences');
    if (process.env.NODE_ENV === 'development') {
      logger.debug('[Consent Mode] Cleared all preferences');
    }
  } catch (error) {
    logger.error('[Consent Mode] Failed to clear preferences', error as Error);
  }
};

export default {
  initConsentMode,
  updateConsent,
  grantAllConsents,
  denyAllConsents,
  getConsentPreferences,
  hasUserConsented,
  applySavedConsent,
  clearConsentPreferences
};
