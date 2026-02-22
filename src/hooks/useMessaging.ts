/**
 * React Hook: useMessaging
 * Hook for managing messaging with automatic cleanup
 * 
 * @description Prevents memory leaks by properly cleaning up listeners
 * @author AI Senior System Architect
 * @date January 16, 2026
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
    RealtimeMessagingService,
    RealtimeMessage,
    RealtimeChannel
} from '@/services/messaging/realtime/realtime-messaging.service';
import { logger } from '@/services/logger-service';

/**
 * Hook for messaging with a specific channel
 * Automatically handles listener cleanup on unmount
 */
export function useMessaging(channelId: string | null) {
    const [messages, setMessages] = useState<RealtimeMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const serviceRef = useRef(RealtimeMessagingService.getInstance());
    const unsubscribeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (!channelId) {
            setMessages([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        // Subscribe to messages
        const unsubscribe = serviceRef.current.subscribeToMessages(
            channelId,
            (newMessages) => {
                setMessages(newMessages);
                setLoading(false);
            }
        );

        // Store unsubscribe function
        unsubscribeRef.current = unsubscribe;

        // Load initial messages
        serviceRef.current.getMessages(channelId, 50)
            .then((initialMessages) => {
                setMessages(initialMessages);
                setLoading(false);
            })
            .catch((err) => {
                logger.error('Failed to load initial messages', err);
                setError(err);
                setLoading(false);
            });

        // ✅ CRITICAL: Cleanup on unmount
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
        };
    }, [channelId]);

    // Send message callback
    const sendMessage = useCallback(
        async (
            senderId: number,
            senderFirebaseId: string,
            recipientId: number,
            recipientFirebaseId: string,
            content: string
        ) => {
            if (!channelId) {
                throw new Error('No channel ID');
            }

            try {
                const messageId = await serviceRef.current.sendTextMessage(
                    channelId,
                    senderId,
                    senderFirebaseId,
                    recipientId,
                    recipientFirebaseId,
                    content
                );
                return messageId;
            } catch (err) {
                logger.error('Failed to send message', err as Error);
                throw err;
            }
        },
        [channelId]
    );

    // Mark as read callback
    const markAsRead = useCallback(
        async (readerNumericId: number) => {
            if (!channelId) return;

            try {
                await serviceRef.current.markAsRead(channelId, readerNumericId);
            } catch (err) {
                logger.error('Failed to mark as read', err as Error);
            }
        },
        [channelId]
    );

    return {
        messages,
        loading,
        error,
        sendMessage,
        markAsRead
    };
}

/**
 * Hook for user's channel list
 * Automatically handles listener cleanup on unmount
 */
export function useUserChannels(userFirebaseId: string | null) {
    const [channels, setChannels] = useState<RealtimeChannel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const serviceRef = useRef(RealtimeMessagingService.getInstance());
    const unsubscribeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (!userFirebaseId) {
            setChannels([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        // Subscribe to user's channels
        // 🔒 Path uses Firebase UID — rules require auth.uid == $userUid
        const unsubscribe = serviceRef.current.subscribeToUserChannels(
            userFirebaseId,
            (newChannels) => {
                setChannels(newChannels);
                setLoading(false);
            }
        );

        // Store unsubscribe function
        unsubscribeRef.current = unsubscribe;

        // Load initial channels
        serviceRef.current.getUserChannels(userFirebaseId)
            .then((initialChannels) => {
                setChannels(initialChannels);
                setLoading(false);
            })
            .catch((err) => {
                logger.error('Failed to load user channels', err);
                setError(err);
                setLoading(false);
            });

        // ✅ CRITICAL: Cleanup on unmount
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
        };
    }, [userFirebaseId]);

    return {
        channels,
        loading,
        error
    };
}

/**
 * Hook for global messaging cleanup
 * Call this on logout or app unmount
 */
export function useMessagingCleanup() {
    const serviceRef = useRef(RealtimeMessagingService.getInstance());

    useEffect(() => {
        // Cleanup on unmount (e.g., logout)
        return () => {
            serviceRef.current.cleanup();
            logger.info('[useMessagingCleanup] All messaging listeners cleaned up');
        };
    }, []);
}

/**
 * Example Usage:
 * 
 * // In a messaging component
 * function MessagingPage({ channelId }) {
 *   const { messages, loading, sendMessage, markAsRead } = useMessaging(channelId);
 *   
 *   useEffect(() => {
 *     if (messages.length > 0) {
 *       markAsRead(currentUser.numericId);
 *     }
 *   }, [messages]);
 *   
 *   return (
 *     <div>
 *       {messages.map(msg => <Message key={msg.id} message={msg} />)}
 *     </div>
 *   );
 * }
 * 
 * // In App.tsx or main layout
 * function App() {
 *   useMessagingCleanup(); // Cleanup on app unmount
 *   return <Router>...</Router>;
 * }
 */
