/**
 * Guest Identity Persistence Service
 * 
 * Ensures the same guest account is restored when a user
 * returns to the site on the same browser/device.
 * 
 * Strategy (3-layer persistence):
 * 1. Cookie (koli_guest_uid) - survives browser restart, 1 year TTL
 * 2. localStorage (koli_guest_uid) - backup if cookie is cleared
 * 3. IndexedDB (Firebase Auth internal) - Firebase's own persistence
 * 
 * Flow:
 * - Guest signs in -> save Firebase UID to Cookie + localStorage
 * - Guest returns -> read stored UID -> restore via custom token
 * - If all storage cleared -> create new guest (normal behavior)
 * 
 * Created: February 6, 2026
 */

import { logger } from './logger-service';

const COOKIE_NAME = 'koli_guest_uid';
const LS_KEY = 'koli_guest_uid';
const COOKIE_MAX_AGE_DAYS = 365;

interface StoredGuestIdentity {
  uid: string;
  numericId?: number;
  createdAt: string;
}

/**
 * Set a persistent cookie with SameSite=Lax for security
 */
function setCookie(name: string, value: string, days: number): void {
  try {
    const maxAge = days * 24 * 60 * 60;
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
  } catch (err) {
    logger.warn('[GuestIdentity] Failed to set cookie', { error: String(err) });
  }
}

/**
 * Read a cookie by name
 */
function getCookie(name: string): string | null {
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [key, val] = cookie.trim().split('=');
      if (key === name && val) {
        return decodeURIComponent(val);
      }
    }
  } catch (err) {
    logger.warn('[GuestIdentity] Failed to read cookie', { error: String(err) });
  }
  return null;
}

/**
 * Delete a cookie
 */
function deleteCookie(name: string): void {
  try {
    document.cookie = `${name}=; path=/; max-age=0`;
  } catch {
    // silent
  }
}

class GuestIdentityService {
  /**
   * Save guest identity to Cookie + localStorage
   * Called after successful anonymous sign-in
   */
  saveIdentity(uid: string, numericId?: number): void {
    const identity: StoredGuestIdentity = {
      uid,
      numericId,
      createdAt: new Date().toISOString()
    };

    const json = JSON.stringify(identity);

    // Layer 1: Cookie (1 year)
    setCookie(COOKIE_NAME, json, COOKIE_MAX_AGE_DAYS);

    // Layer 2: localStorage (persistent)
    try {
      localStorage.setItem(LS_KEY, json);
    } catch (err) {
      logger.warn('[GuestIdentity] localStorage write failed', { error: String(err) });
    }

    logger.info('[GuestIdentity] Identity saved', { uid, numericId });
  }

  /**
   * Update stored numericId (called after numeric ID is assigned)
   */
  updateNumericId(numericId: number): void {
    const existing = this.getStoredIdentity();
    if (existing) {
      this.saveIdentity(existing.uid, numericId);
    }
  }

  /**
   * Retrieve stored guest identity
   * Checks Cookie first, falls back to localStorage
   * Auto-heals if one layer is missing
   */
  getStoredIdentity(): StoredGuestIdentity | null {
    let identity: StoredGuestIdentity | null = null;

    // Layer 1: Try Cookie
    const cookieVal = getCookie(COOKIE_NAME);
    if (cookieVal) {
      try {
        identity = JSON.parse(cookieVal);
      } catch {
        // corrupted cookie
        deleteCookie(COOKIE_NAME);
      }
    }

    // Layer 2: Try localStorage (fallback)
    if (!identity) {
      try {
        const lsVal = localStorage.getItem(LS_KEY);
        if (lsVal) {
          identity = JSON.parse(lsVal);
          // Self-heal: restore cookie from localStorage
          if (identity) {
            setCookie(COOKIE_NAME, lsVal, COOKIE_MAX_AGE_DAYS);
            logger.info('[GuestIdentity] Restored cookie from localStorage');
          }
        }
      } catch {
        // corrupted localStorage
        try { localStorage.removeItem(LS_KEY); } catch { /* silent */ }
      }
    }

    // Self-heal: if cookie exists but localStorage missing
    if (identity && !localStorage.getItem(LS_KEY)) {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(identity));
      } catch { /* silent */ }
    }

    return identity;
  }

  /**
   * Get stored guest Firebase UID (convenience shortcut)
   */
  getStoredUid(): string | null {
    return this.getStoredIdentity()?.uid ?? null;
  }

  /**
   * Clear guest identity (for account linking / upgrade)
   */
  clearIdentity(): void {
    deleteCookie(COOKIE_NAME);
    try {
      localStorage.removeItem(LS_KEY);
    } catch { /* silent */ }
    logger.info('[GuestIdentity] Identity cleared');
  }

  /**
   * Check if a stored guest identity exists
   */
  hasStoredIdentity(): boolean {
    return this.getStoredUid() !== null;
  }
}

export const guestIdentityService = new GuestIdentityService();
