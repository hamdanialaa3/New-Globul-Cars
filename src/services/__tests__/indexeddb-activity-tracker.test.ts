// Tests for indexeddb-activity-tracker.ts
import IndexedDBActivityTracker from '../indexeddb-activity-tracker';

describe('IndexedDBActivityTracker', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('trackActivity', () => {
    it('should store last activity timestamp', () => {
      IndexedDBActivityTracker.trackActivity();

      const stored = localStorage.getItem('indexeddb-last-activity');
      expect(stored).toBeTruthy();

      const timestamp = parseInt(stored!, 10);
      expect(timestamp).toBeGreaterThan(0);
      expect(timestamp).toBeLessThanOrEqual(Date.now());
    });

    it('should update timestamp on subsequent calls', () => {
      IndexedDBActivityTracker.trackActivity();
      const first = localStorage.getItem('indexeddb-last-activity');

      // Wait a bit
      jest.advanceTimersByTime(100);

      IndexedDBActivityTracker.trackActivity();
      const second = localStorage.getItem('indexeddb-last-activity');

      expect(parseInt(second!, 10)).toBeGreaterThan(parseInt(first!, 10));
    });
  });

  describe('getActivityStatus', () => {
    it('should return "active" for recent activity', () => {
      IndexedDBActivityTracker.trackActivity();

      const status = IndexedDBActivityTracker.getActivityStatus();
      expect(status).toBe('active');
    });

    it('should return "warning" after 5 days', () => {
      const fiveDaysAgo = Date.now() - (5 * 24 * 60 * 60 * 1000);
      localStorage.setItem('indexeddb-last-activity', fiveDaysAgo.toString());

      const status = IndexedDBActivityTracker.getActivityStatus();
      expect(status).toBe('warning');
    });

    it('should return "expired" after 7 days', () => {
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      localStorage.setItem('indexeddb-last-activity', sevenDaysAgo.toString());

      const status = IndexedDBActivityTracker.getActivityStatus();
      expect(status).toBe('expired');
    });

    it('should return "no-data" if no activity tracked', () => {
      const status = IndexedDBActivityTracker.getActivityStatus();
      expect(status).toBe('no-data');
    });
  });

  describe('shouldDeleteData', () => {
    it('should return false for recent activity', () => {
      IndexedDBActivityTracker.trackActivity();

      const shouldDelete = IndexedDBActivityTracker.shouldDeleteData();
      expect(shouldDelete).toBe(false);
    });

    it('should return true after 7 days', () => {
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      localStorage.setItem('indexeddb-last-activity', sevenDaysAgo.toString());

      const shouldDelete = IndexedDBActivityTracker.shouldDeleteData();
      expect(shouldDelete).toBe(true);
    });

    it('should return false if no activity exists', () => {
      const shouldDelete = IndexedDBActivityTracker.shouldDeleteData();
      expect(shouldDelete).toBe(false);
    });
  });

  describe('shouldShowWarning', () => {
    it('should return false for recent activity', () => {
      IndexedDBActivityTracker.trackActivity();

      const shouldWarn = IndexedDBActivityTracker.shouldShowWarning();
      expect(shouldWarn).toBe(false);
    });

    it('should return true after 5 days', () => {
      const fiveDaysAgo = Date.now() - (5 * 24 * 60 * 60 * 1000);
      localStorage.setItem('indexeddb-last-activity', fiveDaysAgo.toString());

      const shouldWarn = IndexedDBActivityTracker.shouldShowWarning();
      expect(shouldWarn).toBe(true);
    });

    it('should return false for activity between 5-7 days but already dismissed', () => {
      const fiveDaysAgo = Date.now() - (5 * 24 * 60 * 60 * 1000);
      localStorage.setItem('indexeddb-last-activity', fiveDaysAgo.toString());
      localStorage.setItem('indexeddb-warning-dismissed', 'true');

      const shouldWarn = IndexedDBActivityTracker.shouldShowWarning();
      expect(shouldWarn).toBe(false);
    });

    it('should return false if no activity exists', () => {
      const shouldWarn = IndexedDBActivityTracker.shouldShowWarning();
      expect(shouldWarn).toBe(false);
    });
  });

  describe('extendSession', () => {
    it('should update last activity to current time', () => {
      const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000);
      localStorage.setItem('indexeddb-last-activity', twoDaysAgo.toString());

      IndexedDBActivityTracker.extendSession();

      const updated = localStorage.getItem('indexeddb-last-activity');
      const timestamp = parseInt(updated!, 10);

      // Should be within last second
      expect(timestamp).toBeGreaterThan(Date.now() - 1000);
      expect(timestamp).toBeLessThanOrEqual(Date.now());
    });

    it('should clear warning dismissed flag', () => {
      localStorage.setItem('indexeddb-warning-dismissed', 'true');

      IndexedDBActivityTracker.extendSession();

      const dismissed = localStorage.getItem('indexeddb-warning-dismissed');
      expect(dismissed).toBeNull();
    });
  });

  describe('dismissWarning', () => {
    it('should set warning dismissed flag', () => {
      IndexedDBActivityTracker.dismissWarning();

      const dismissed = localStorage.getItem('indexeddb-warning-dismissed');
      expect(dismissed).toBe('true');
    });
  });

  describe('initialize', () => {
    it('should set up activity tracking listeners', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      IndexedDBActivityTracker.initialize();

      expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should throttle activity tracking (once per minute)', () => {
      IndexedDBActivityTracker.initialize();

      const trackSpy = jest.spyOn(IndexedDBActivityTracker, 'trackActivity');

      // Simulate multiple clicks
      window.dispatchEvent(new Event('click'));
      window.dispatchEvent(new Event('click'));
      window.dispatchEvent(new Event('click'));

      // Should only track once
      expect(trackSpy).toHaveBeenCalledTimes(1);

      trackSpy.mockRestore();
    });
  });

  describe('getDaysUntilDeletion', () => {
    it('should return 7 for new activity', () => {
      IndexedDBActivityTracker.trackActivity();

      const days = IndexedDBActivityTracker.getDaysUntilDeletion();
      expect(days).toBe(7);
    });

    it('should return correct days remaining', () => {
      const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
      localStorage.setItem('indexeddb-last-activity', threeDaysAgo.toString());

      const days = IndexedDBActivityTracker.getDaysUntilDeletion();
      expect(days).toBe(4); // 7 - 3 = 4 days left
    });

    it('should return 0 for expired data', () => {
      const eightDaysAgo = Date.now() - (8 * 24 * 60 * 60 * 1000);
      localStorage.setItem('indexeddb-last-activity', eightDaysAgo.toString());

      const days = IndexedDBActivityTracker.getDaysUntilDeletion();
      expect(days).toBe(0);
    });

    it('should return null if no activity', () => {
      const days = IndexedDBActivityTracker.getDaysUntilDeletion();
      expect(days).toBeNull();
    });
  });
});
