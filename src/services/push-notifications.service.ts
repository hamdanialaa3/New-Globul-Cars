/**
 * Push Notifications Service
 * خدمة الإشعارات الفورية
 * 
 * @description Handles FCM token management and push notification sending
 * @author AI Senior System Architect
 * @date January 16, 2026
 */

import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { logger } from './logger-service';

// FCM Vapid Key (get from Firebase Console → Project Settings → Cloud Messaging)
const VAPID_KEY = process.env.REACT_APP_FCM_VAPID_KEY || '';

class PushNotificationService {
    private static instance: PushNotificationService;
    private messaging: Messaging | null = null;
    private currentToken: string | null = null;

    private constructor() {
        try {
            this.messaging = getMessaging();
            this.setupMessageListener();
        } catch (error) {
            logger.error('Failed to initialize messaging', error as Error);
        }
    }

    static getInstance(): PushNotificationService {
        if (!PushNotificationService.instance) {
            PushNotificationService.instance = new PushNotificationService();
        }
        return PushNotificationService.instance;
    }

    /**
     * Request notification permission and get FCM token
     */
    async requestPermission(userId: string): Promise<string | null> {
        if (!this.messaging) {
            logger.warn('Messaging not initialized');
            return null;
        }

        try {
            // Request permission
            const permission = await Notification.requestPermission();

            if (permission !== 'granted') {
                logger.info('Notification permission denied');
                return null;
            }

            // Get FCM token
            const token = await getToken(this.messaging, {
                vapidKey: VAPID_KEY
            });

            if (token) {
                this.currentToken = token;

                // Save token to user document
                await this.saveTokenToUser(userId, token);

                logger.info('FCM token obtained and saved', { userId });
                return token;
            }

            return null;
        } catch (error) {
            logger.error('Error getting FCM token', error as Error);
            return null;
        }
    }

    /**
     * Save FCM token to user document
     */
    private async saveTokenToUser(userId: string, token: string): Promise<void> {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                fcmTokens: arrayUnion(token),
                lastTokenUpdate: new Date()
            });
        } catch (error) {
            logger.error('Failed to save FCM token', error as Error, { userId });
        }
    }

    /**
     * Remove FCM token from user document (on logout)
     */
    async removeToken(userId: string): Promise<void> {
        if (!this.currentToken) return;

        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                fcmTokens: arrayRemove(this.currentToken)
            });

            this.currentToken = null;
            logger.info('FCM token removed', { userId });
        } catch (error) {
            logger.error('Failed to remove FCM token', error as Error, { userId });
        }
    }

    /**
     * Setup listener for foreground messages
     */
    private setupMessageListener(): void {
        if (!this.messaging) return;

        onMessage(this.messaging, (payload) => {
            logger.info('Foreground message received', payload);

            // Show notification
            if (payload.notification) {
                this.showNotification(
                    payload.notification.title || 'New Message',
                    payload.notification.body || '',
                    payload.notification.icon
                );
            }

            // Dispatch custom event for app to handle
            window.dispatchEvent(new CustomEvent('fcm-message', {
                detail: payload
            }));
        });
    }

    /**
     * Show browser notification
     */
    private showNotification(title: string, body: string, icon?: string): void {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body,
                icon: icon || '/logo192.png',
                badge: '/logo192.png',
                tag: 'messaging',
                requireInteraction: false
            });
        }
    }

    /**
     * Check if notifications are supported and enabled
     */
    isSupported(): boolean {
        return 'Notification' in window && 'serviceWorker' in navigator;
    }

    /**
     * Get current permission status
     */
    getPermissionStatus(): NotificationPermission {
        return Notification.permission;
    }
}

export const pushNotificationService = PushNotificationService.getInstance();

/**
 * React Hook for Push Notifications
 */
export function usePushNotifications(userId: string | null) {
    const [isEnabled, setIsEnabled] = React.useState(false);
    const [token, setToken] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!userId) return;

        const service = pushNotificationService;

        // Check if already enabled
        if (service.getPermissionStatus() === 'granted') {
            setIsEnabled(true);
        }

        // Listen for foreground messages
        const handleMessage = (event: Event) => {
            const customEvent = event as CustomEvent;
            console.log('FCM message received in app:', customEvent.detail);
        };

        window.addEventListener('fcm-message', handleMessage);

        return () => {
            window.removeEventListener('fcm-message', handleMessage);
        };
    }, [userId]);

    const enableNotifications = async () => {
        if (!userId) return;

        const fcmToken = await pushNotificationService.requestPermission(userId);
        if (fcmToken) {
            setToken(fcmToken);
            setIsEnabled(true);
        }
    };

    const disableNotifications = async () => {
        if (!userId) return;

        await pushNotificationService.removeToken(userId);
        setIsEnabled(false);
        setToken(null);
    };

    return {
        isEnabled,
        token,
        isSupported: pushNotificationService.isSupported(),
        permissionStatus: pushNotificationService.getPermissionStatus(),
        enableNotifications,
        disableNotifications
    };
}

// Add React import for hook
import React from 'react';
