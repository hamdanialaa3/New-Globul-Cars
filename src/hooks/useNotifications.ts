// src/hooks/useNotifications.ts
// Custom Hook for Push Notifications Management

import { useState, useEffect } from 'react';
import { logger } from '../services/logger-service';
import { fcmService, PushNotification } from '../services/fcm-service';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize FCM service
  useEffect(() => {
    let isMounted = true; // Track component mount state
    
    const initializeFCM = async () => {
      try {
        const token = await fcmService.initialize();
        
        if (!isMounted) return; // Don't update state if unmounted
        
        if (token && process.env.NODE_ENV === 'development') {
          logger.debug('FCM initialized successfully');
        }
        setIsInitialized(true);
      } catch (error) {
        if (!isMounted) return; // Don't log error if unmounted
        logger.error('Failed to initialize FCM', error as Error);
        setIsInitialized(true); // Still mark as initialized to avoid infinite loading
      }
    };

    initializeFCM();
    
    // Cleanup
    return () => {
      isMounted = false;
    };
  }, []);

  // Load notifications and subscribe to updates
  useEffect(() => {
    if (!isInitialized) return;

    let isMounted = true;

    // Load initial notifications
    setNotifications(fcmService.getNotifications());
    setUnreadCount(fcmService.getUnreadCount());

    // Subscribe to notification updates
    const unsubscribe = fcmService.subscribe((notification) => {
      if (!isMounted) return; // Prevent state updates after unmount
      setNotifications(fcmService.getNotifications());
      setUnreadCount(fcmService.getUnreadCount());
    });

    // Cleanup
    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [isInitialized]);

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    fcmService.markAsRead(notificationId);
    setNotifications(fcmService.getNotifications());
    setUnreadCount(fcmService.getUnreadCount());
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    fcmService.markAllAsRead();
    setNotifications(fcmService.getNotifications());
    setUnreadCount(fcmService.getUnreadCount());
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    fcmService.clearNotifications();
    setNotifications([]);
    setUnreadCount(0);
  };

  // Send test notification (for development)
  const sendTestNotification = () => {
    fcmService.sendTestNotification();
  };

  return {
    notifications,
    unreadCount,
    isInitialized,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    sendTestNotification
  };
};

export default useNotifications;
