/**
 * 🔔 usePushNotifications Hook
 * خطاف الإشعارات الفورية
 * 
 * @description React hook for FCM push notifications
 * خطاف React لإشعارات FCM
 * 
 * @author Claude Opus 4.5 - Chief Architect
 * @date January 8, 2026
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { MessagePayload } from 'firebase/messaging';

import { pushNotificationService } from '../../services/messaging/realtime';
import { logger } from '../../services/logger-service';

// ==================== INTERFACES ====================

interface UsePushNotificationsReturn {
  // State
  hasPermission: boolean;
  isSupported: boolean;
  permissionStatus: NotificationPermission | 'unsupported';
  fcmToken: string | null;
  
  // Actions
  requestPermission: () => Promise<boolean>;
  removeToken: () => Promise<void>;
  
  // Foreground notifications
  onNotification: (callback: (payload: MessagePayload) => void) => () => void;
}

// ==================== HOOK ====================

export function usePushNotifications(
  userFirebaseId: string | null,
  userNumericId: number | null
): UsePushNotificationsReturn {
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('unsupported');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const isActiveRef = useRef(true);

  // Check if supported
  const isSupported = pushNotificationService.isSupported();

  // ==================== INITIALIZE ====================

  useEffect(() => {
    isActiveRef.current = true;
    
    // Update permission status
    const status = pushNotificationService.getPermissionStatus();
    setPermissionStatus(status);
    setHasPermission(status === 'granted');
    
    // Get existing token if permission already granted
    if (status === 'granted' && userFirebaseId) {
      pushNotificationService.getStoredToken(userFirebaseId).then((token) => {
        if (isActiveRef.current && token) {
          setFcmToken(token);
        }
      });
    }
    
    return () => {
      isActiveRef.current = false;
    };
  }, [userFirebaseId]);

  // ==================== REQUEST PERMISSION ====================

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!userFirebaseId || !userNumericId) {
      logger.warn('[usePushNotifications] Cannot request permission: missing user context');
      return false;
    }

    try {
      const token = await pushNotificationService.requestPermissionAndGetToken(
        userFirebaseId,
        userNumericId
      );

      if (token) {
        if (isActiveRef.current) {
          setHasPermission(true);
          setPermissionStatus('granted');
          setFcmToken(token);
        }
        return true;
      }

      // Permission denied
      if (isActiveRef.current) {
        setHasPermission(false);
        setPermissionStatus(pushNotificationService.getPermissionStatus());
      }
      return false;
    } catch (err) {
      logger.error('[usePushNotifications] Failed to request permission', err as Error);
      return false;
    }
  }, [userFirebaseId, userNumericId]);

  // ==================== REMOVE TOKEN ====================

  const removeToken = useCallback(async (): Promise<void> => {
    if (!userFirebaseId) return;

    try {
      await pushNotificationService.removeToken(userFirebaseId);
      if (isActiveRef.current) {
        setFcmToken(null);
      }
    } catch (err) {
      logger.error('[usePushNotifications] Failed to remove token', err as Error);
    }
  }, [userFirebaseId]);

  // ==================== FOREGROUND NOTIFICATIONS ====================

  const onNotification = useCallback((
    callback: (payload: MessagePayload) => void
  ): () => void => {
    return pushNotificationService.onForegroundNotification(callback);
  }, []);

  // ==================== RETURN ====================

  return {
    hasPermission,
    isSupported,
    permissionStatus,
    fcmToken,
    requestPermission,
    removeToken,
    onNotification,
  };
}

export default usePushNotifications;
