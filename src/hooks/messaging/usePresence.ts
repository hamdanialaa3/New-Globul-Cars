/**
 * 🟢 usePresence Hook
 * خطاف الحضور
 * 
 * @description React hook for presence (online/offline) tracking
 * خطاف React لتتبع الحضور
 * 
 * @author Claude Opus 4.5 - Chief Architect
 * @date January 8, 2026
 */

import { useState, useEffect, useCallback, useRef } from 'react';

import {
  presenceService,
  PresenceStatus,
} from '../../services/messaging/realtime';
import { logger } from '../../services/logger-service';

// ==================== INTERFACES ====================

interface UsePresenceOptions {
  autoInitialize?: boolean;
  device?: 'mobile' | 'desktop' | 'tablet';
}

interface UsePresenceReturn {
  // Current user state
  isInitialized: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  setOffline: () => Promise<void>;
  updateCurrentPage: (pageName: string) => Promise<void>;
  
  // Query other users
  getPresence: (numericUserId: number) => Promise<PresenceStatus | null>;
  isOnline: (numericUserId: number) => Promise<boolean>;
  subscribeToPresence: (
    numericUserId: number,
    callback: (isOnline: boolean, status: PresenceStatus) => void
  ) => () => void;
  
  // Utilities
  formatLastSeen: (timestamp: number, locale?: 'bg' | 'en') => string;
}

// ==================== HOOK: usePresence ====================

export function usePresence(
  currentUserNumericId: number | null,
  options: UsePresenceOptions = {}
): UsePresenceReturn {
  const { autoInitialize = true, device } = options;
  
  const [isInitialized, setIsInitialized] = useState(false);
  const isActiveRef = useRef(true);

  // ==================== CLEANUP ====================

  useEffect(() => {
    isActiveRef.current = true;
    
    return () => {
      isActiveRef.current = false;
    };
  }, []);

  // ==================== INITIALIZE ====================

  const initialize = useCallback(async () => {
    if (!currentUserNumericId) return;
    
    try {
      await presenceService.initialize(currentUserNumericId, device);
      if (isActiveRef.current) {
        setIsInitialized(true);
      }
      logger.info('[usePresence] Initialized for user', { numericId: currentUserNumericId });
    } catch (err) {
      logger.error('[usePresence] Failed to initialize', err instanceof Error ? err : undefined);
    }
  }, [currentUserNumericId, device]);

  // ==================== SET OFFLINE ====================

  const setOffline = useCallback(async () => {
    try {
      await presenceService.setOffline();
      if (isActiveRef.current) {
        setIsInitialized(false);
      }
    } catch (err) {
      logger.error('[usePresence] Failed to set offline', err instanceof Error ? err : undefined);
    }
  }, []);

  // ==================== UPDATE CURRENT PAGE ====================

  const updateCurrentPage = useCallback(async (pageName: string) => {
    try {
      await presenceService.updateCurrentPage(pageName);
    } catch (err) {
      logger.error('[usePresence] Failed to update current page', err instanceof Error ? err : undefined);
    }
  }, []);

  // ==================== QUERY METHODS ====================

  const getPresence = useCallback(async (numericUserId: number): Promise<PresenceStatus | null> => {
    return presenceService.getPresence(numericUserId);
  }, []);

  const isOnline = useCallback(async (numericUserId: number): Promise<boolean> => {
    return presenceService.isOnline(numericUserId);
  }, []);

  const subscribeToPresence = useCallback((
    numericUserId: number,
    callback: (isOnline: boolean, status: PresenceStatus) => void
  ): () => void => {
    return presenceService.subscribeToPresence(numericUserId, (online, lastSeen, status) => {
      callback(online, status);
    });
  }, []);

  // ==================== UTILITY METHODS ====================

  const formatLastSeen = useCallback((timestamp: number, locale: 'bg' | 'en' = 'bg'): string => {
    return presenceService.formatLastSeen(timestamp, locale);
  }, []);

  // ==================== AUTO-INITIALIZE ====================

  useEffect(() => {
    if (autoInitialize && currentUserNumericId && !isInitialized) {
      initialize();
    }
    
    return () => {
      // Set offline on unmount if initialized
      if (isInitialized) {
        presenceService.setOffline();
      }
    };
  }, [autoInitialize, currentUserNumericId, isInitialized, initialize]);

  // ==================== RETURN ====================

  return {
    isInitialized,
    initialize,
    setOffline,
    updateCurrentPage,
    getPresence,
    isOnline,
    subscribeToPresence,
    formatLastSeen,
  };
}

// ==================== HOOK: useUserPresence ====================

/**
 * Hook to subscribe to a single user's presence
 * خطاف للاشتراك في حضور مستخدم واحد
 */
export function useUserPresence(numericUserId: number | null): {
  isOnline: boolean;
  lastSeen: number;
  status: PresenceStatus | null;
  formattedLastSeen: string;
} {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(0);
  const [status, setStatus] = useState<PresenceStatus | null>(null);

  useEffect(() => {
    if (!numericUserId) {
      setIsOnline(false);
      setLastSeen(0);
      setStatus(null);
      return;
    }

    const unsubscribe = presenceService.subscribeToPresence(
      numericUserId,
      (online, seen, fullStatus) => {
        setIsOnline(online);
        setLastSeen(seen);
        setStatus(fullStatus);
      }
    );

    return unsubscribe;
  }, [numericUserId]);

  const formattedLastSeen = lastSeen ? presenceService.formatLastSeen(lastSeen) : '';

  return {
    isOnline,
    lastSeen,
    status,
    formattedLastSeen,
  };
}

export default usePresence;
