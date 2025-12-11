/**
 * IndexedDB Activity Tracker
 * Tracks user activity to prevent silent data deletion
 * 
 * Problem: Old workflow data gets deleted without warning
 * Solution: Track last activity timestamp + show warning before deletion
 */

import { serviceLogger } from './logger-wrapper';

const ACTIVITY_KEY = 'globul_indexeddb_last_activity';
const INACTIVITY_THRESHOLD = 7 * 24 * 60 * 60 * 1000; // 7 days
const WARNING_THRESHOLD = 5 * 24 * 60 * 60 * 1000; // 5 days (show warning after 5 days)

export interface ActivityStatus {
  lastActivity: number;
  daysSinceActivity: number;
  isInactive: boolean;
  needsWarning: boolean;
}

export class IndexedDBActivityTracker {
  /**
   * Track user activity (call on any user interaction)
   */
  static trackActivity(): void {
    try {
      const now = Date.now();
      localStorage.setItem(ACTIVITY_KEY, now.toString());
      
      // Dispatch custom event for listeners
      window.dispatchEvent(new CustomEvent('indexeddb:activity', { 
        detail: { timestamp: now } 
      }));
      
      serviceLogger.debug('Activity tracked', { timestamp: now });
    } catch (error) {
      serviceLogger.error('Failed to track activity', error as Error);
    }
  }

  /**
   * Get last activity timestamp
   */
  static getLastActivity(): number | null {
    try {
      const saved = localStorage.getItem(ACTIVITY_KEY);
      return saved ? parseInt(saved, 10) : null;
    } catch (error) {
      serviceLogger.error('Failed to get last activity', error as Error);
      return null;
    }
  }

  /**
   * Get activity status
   */
  static getActivityStatus(): ActivityStatus {
    const lastActivity = this.getLastActivity();
    const now = Date.now();

    if (!lastActivity) {
      return {
        lastActivity: now,
        daysSinceActivity: 0,
        isInactive: false,
        needsWarning: false
      };
    }

    const timeSinceActivity = now - lastActivity;
    const daysSinceActivity = Math.floor(timeSinceActivity / (24 * 60 * 60 * 1000));

    return {
      lastActivity,
      daysSinceActivity,
      isInactive: timeSinceActivity > INACTIVITY_THRESHOLD,
      needsWarning: timeSinceActivity > WARNING_THRESHOLD && timeSinceActivity <= INACTIVITY_THRESHOLD
    };
  }

  /**
   * Check if data should be deleted (after inactivity threshold)
   */
  static shouldDeleteData(): boolean {
    const status = this.getActivityStatus();
    return status.isInactive;
  }

  /**
   * Check if warning should be shown (approaching deletion)
   */
  static shouldShowWarning(): boolean {
    const status = this.getActivityStatus();
    return status.needsWarning;
  }

  /**
   * Get warning message in Bulgarian/English
   */
  static getWarningMessage(language: 'bg' | 'en' = 'bg'): string {
    const status = this.getActivityStatus();
    const daysRemaining = 7 - status.daysSinceActivity;

    if (language === 'bg') {
      return `Вашите данни ще бъдат изтрити след ${daysRemaining} дни поради неактивност. Кликнете тук за да запазите данните.`;
    }

    return `Your data will be deleted in ${daysRemaining} days due to inactivity. Click here to keep your data.`;
  }

  /**
   * Extend session (reset activity timestamp)
   */
  static extendSession(): void {
    this.trackActivity();
    serviceLogger.info('Session extended by user');
  }

  /**
   * Clear activity tracking (call when data is intentionally cleared)
   */
  static clearTracking(): void {
    try {
      localStorage.removeItem(ACTIVITY_KEY);
      serviceLogger.info('Activity tracking cleared');
    } catch (error) {
      serviceLogger.error('Failed to clear activity tracking', error as Error);
    }
  }

  /**
   * Initialize activity tracking (call on app mount)
   */
  static initialize(): void {
    // Track initial activity
    if (!this.getLastActivity()) {
      this.trackActivity();
    }

    // Add listeners for user interactions
    const trackingEvents = [
      'click',
      'keydown',
      'scroll',
      'touchstart',
      'mousemove'
    ];

    // Throttle tracking to once per minute
    let lastTracked = 0;
    const throttleMs = 60 * 1000; // 1 minute

    const throttledTrack = () => {
      const now = Date.now();
      if (now - lastTracked > throttleMs) {
        this.trackActivity();
        lastTracked = now;
      }
    };

    trackingEvents.forEach(event => {
      window.addEventListener(event, throttledTrack, { passive: true });
    });

    serviceLogger.info('Activity tracker initialized');
  }
}

export default IndexedDBActivityTracker;
