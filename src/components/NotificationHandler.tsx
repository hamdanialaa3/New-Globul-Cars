import { logger } from '../services/logger-service';
// src/components/NotificationHandler.tsx
// Component to handle FCM initialization and foreground messages
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import { useEffect } from 'react';
import { notificationService } from '../services/notification-service';
import { useToast } from './Toast';
import { useAuth } from '../contexts/AuthProvider';

const NotificationHandler: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Skip Firebase messaging in development to prevent errors
    if (process.env.NODE_ENV === 'development') {
      logger.info('📱 Notifications disabled in development mode');
      return;
    }

    // Only initialize notifications if a user is logged in
    if (user) {
      // ✅ CRITICAL FIX: Don't request permission automatically in useEffect
      // Notification.requestPermission() can only be called from a user event handler
      // Instead, only listen for foreground messages (permission will be requested on user interaction)
      
      // 1. Listen for foreground messages only (don't request permission here)
      // Permission will be requested when user clicks a button (e.g., NotificationBanner)
      const unsubscribe = notificationService.onForegroundMessage((payload) => {
        const { notification } = payload;
        if (notification) {
          // Show a toast notification for foreground messages
          showToast('info', notification.body || 'New message received', notification.title);
        }
      });

      // 2. Cleanup listener on component unmount
      return () => {
        unsubscribe();
      };
    }
  }, [user, showToast]);

  // This component does not render anything
  return null;
};

export default NotificationHandler;
