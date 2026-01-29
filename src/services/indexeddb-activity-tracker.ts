/**
 * IndexedDB Activity Tracker
 * Tracks user activity to prevent silent data deletion
 */

import { serviceLogger } from './logger-service';

const ACTIVITY_KEY = 'indexeddb-last-activity';
const WARNING_DISMISSED_KEY = 'indexeddb-warning-dismissed';
const DAY_MS = 24 * 60 * 60 * 1000;
const INACTIVITY_THRESHOLD = 7 * DAY_MS; // 7 days
const WARNING_THRESHOLD = 5 * DAY_MS; // 5 days (show warning after 5 days)

export interface ActivityStatus {
  lastActivity: number | null;
  daysSinceActivity: number;
  isInactive: boolean;
  needsWarning: boolean;
}

export class IndexedDBActivityTracker {
  private static initialized = false;
  private static trackingHandler: ((event: Event) => void) | null = null;
  private static readonly trackingEvents = ['click', 'keydown', 'scroll', 'touchstart', 'mousemove'];

  /**
   * Track user activity (call on any user interaction)
   */
  static trackActivity(): void {
    try {
      const now = Date.now();
      localStorage.setItem(ACTIVITY_KEY, now.toString());
      window.dispatchEvent(new CustomEvent('indexeddb:activity', { detail: { timestamp: now } }));
      serviceLogger?.debug?.('Activity tracked', { timestamp: now });
    } catch (error) {
      serviceLogger?.error?.('Failed to track activity', error as Error);
    }
  }

  static getLastActivity(): number | null {
    try {
      const saved = localStorage.getItem(ACTIVITY_KEY);
      return saved ? parseInt(saved, 10) : null;
    } catch (error) {
      serviceLogger?.error?.('Failed to get last activity', error as Error);
      return null;
    }
  }

  static getStatusDetails(): ActivityStatus {
    const lastActivity = this.getLastActivity();
    const now = Date.now();

    if (!lastActivity) {
      return { lastActivity: null, daysSinceActivity: 0, isInactive: false, needsWarning: false };
    }

    const timeSinceActivity = now - lastActivity;
    const daysSinceActivity = Math.floor(timeSinceActivity / DAY_MS);

    return {
      lastActivity,
      daysSinceActivity,
      isInactive: timeSinceActivity >= INACTIVITY_THRESHOLD,
      needsWarning: timeSinceActivity >= WARNING_THRESHOLD && timeSinceActivity < INACTIVITY_THRESHOLD,
    };
  }

  /**
   * Get activity status label for UI/tests
   */
  static getActivityStatus(): 'active' | 'warning' | 'expired' | 'no-data' {
    const status = this.getStatusDetails();
    if (!status.lastActivity) return 'no-data';
    if (status.isInactive) return 'expired';
    if (status.needsWarning) return 'warning';
    return 'active';
  }

  static shouldDeleteData(): boolean {
    return this.getActivityStatus() === 'expired';
  }

  static shouldShowWarning(): boolean {
    const dismissed = localStorage.getItem(WARNING_DISMISSED_KEY) === 'true';
    if (dismissed) return false;
    return this.getActivityStatus() === 'warning';
  }

  static getWarningMessage(language: 'bg' | 'en' = 'bg'): string {
    const status = this.getStatusDetails();
    const daysRemaining = Math.max(0, 7 - status.daysSinceActivity);

    if (language === 'bg') {
      return `Вашите данни ще бъдат изтрити след ${daysRemaining} дни поради неактивност. Кликнете тук за да запазите данните.`;
    }

    return `Your data will be deleted in ${daysRemaining} days due to inactivity. Click here to keep your data.`;
  }

  static extendSession(): void {
    this.trackActivity();
    localStorage.removeItem(WARNING_DISMISSED_KEY);
    serviceLogger?.info?.('Session extended by user');
  }

  static dismissWarning(): void {
    localStorage.setItem(WARNING_DISMISSED_KEY, 'true');
  }

  static clearTracking(): void {
    try {
      localStorage.removeItem(ACTIVITY_KEY);
      localStorage.removeItem(WARNING_DISMISSED_KEY);
      serviceLogger?.info?.('Activity tracking cleared');
    } catch (error) {
      serviceLogger?.error?.('Failed to clear activity tracking', error as Error);
    }
  }

  static getDaysUntilDeletion(): number | null {
    const status = this.getStatusDetails();
    if (!status.lastActivity) {
      const raw = localStorage.getItem(ACTIVITY_KEY);
      return raw ? 7 : null;
    }
    const remaining = 7 - status.daysSinceActivity;
    return remaining <= 0 ? 0 : remaining;
  }

  /**
   * Initialize activity tracking (call on app mount)
   */
  static initialize(): void {
    // Reinitialize safely by removing old listeners
    if (this.trackingHandler) {
      this.trackingEvents.forEach(event => {
        window.removeEventListener(event, this.trackingHandler as EventListener);
      });
    }

    this.initialized = true;
    if (!this.getLastActivity()) {
      this.trackActivity();
    }

    let lastTracked = 0;
    const throttleMs = 60 * 1000; // 1 minute
    let hasTrackedOnce = false;
    let blocked = false;

    const throttledTrack = () => {
      if (blocked) return;
      const now = Date.now();
      if (!hasTrackedOnce) {
        this.trackActivity();
        hasTrackedOnce = true;
        lastTracked = now;
        blocked = true;
        setTimeout(() => { blocked = false; }, throttleMs);
        return;
      }
      if (now - lastTracked > throttleMs) {
        this.trackActivity();
        lastTracked = now;
        blocked = true;
        setTimeout(() => { blocked = false; }, throttleMs);
      }
    };

    this.trackingHandler = throttledTrack;
    this.trackingEvents.forEach(event => {
      window.addEventListener(event, throttledTrack);
    });

    serviceLogger?.info?.('Activity tracker initialized');
  }
}

export default IndexedDBActivityTracker;
