// src/components/NotificationHandler.tsx
// Component to handle FCM initialization and foreground messages
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import { useEffect } from 'react';
import { notificationService } from '@/services/notification-service';
import { useToast } from './Toast';
import { useAuth } from '@/contexts/AuthProvider';

const NotificationHandler: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Only initialize notifications if a user is logged in
    if (user) {
      // 1. Request permission and save the token
      notificationService.requestPermissionAndSaveToken(user.uid);

      // 2. Listen for foreground messages
      const unsubscribe = notificationService.onForegroundMessage((payload) => {
        const { notification } = payload;
        if (notification) {
          // Show a toast notification for foreground messages
          showToast('info', notification.body || 'New message received', notification.title);
        }
      });

      // 3. Cleanup listener on component unmount
      return () => {
        unsubscribe();
      };
    }
  }, [user, showToast]);

  // This component does not render anything
  return null;
};

export default NotificationHandler;
