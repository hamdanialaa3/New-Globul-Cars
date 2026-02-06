/**
 * 💬 useRealtimeMessaging Hook
 * خطاف الرسائل في الوقت الحقيقي
 * 
 * @description React hook for real-time messaging functionality
 * خطاف React لوظائف الرسائل في الوقت الحقيقي
 * 
 * @author Claude Opus 4.5 - Chief Architect
 * @date January 8, 2026
 */

import { useState, useEffect, useCallback, useRef } from 'react';

import {
  realtimeMessagingService,
  RealtimeChannel,
  RealtimeMessage,
  CreateChannelParams,
} from '../../services/messaging/realtime';
import { logger } from '../../services/logger-service';

// ==================== INTERFACES ====================

interface UseRealtimeMessagingOptions {
  autoMarkAsRead?: boolean;
}

interface UseRealtimeMessagingReturn {
  // State
  channels: RealtimeChannel[];
  currentChannel: RealtimeChannel | null;
  messages: RealtimeMessage[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadChannels: (userNumericId: number) => Promise<void>;
  selectChannel: (channelId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<string | null>;
  sendOffer: (amount: number, currency?: string) => Promise<string | null>;
  sendImage: (imageUrl: string, imageThumbnail?: string) => Promise<string | null>;
  markAsRead: () => Promise<void>;
  getOrCreateChannel: (params: CreateChannelParams) => Promise<RealtimeChannel | null>;

  // Utilities
  generateChannelId: typeof realtimeMessagingService.generateChannelId;
}

// ==================== HOOK ====================

export function useRealtimeMessaging(
  currentUserNumericId: number | null,
  currentUserFirebaseId: string | null,
  options: UseRealtimeMessagingOptions = {}
): UseRealtimeMessagingReturn {
  const { autoMarkAsRead = true } = options;

  // State
  const [channels, setChannels] = useState<RealtimeChannel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<RealtimeChannel | null>(null);
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for cleanup
  const channelsUnsubRef = useRef<(() => void) | null>(null);
  const messagesUnsubRef = useRef<(() => void) | null>(null);
  const isActiveRef = useRef(true);

  // ==================== CLEANUP ====================

  useEffect(() => {
    isActiveRef.current = true;

    return () => {
      isActiveRef.current = false;

      if (channelsUnsubRef.current) {
        channelsUnsubRef.current();
        channelsUnsubRef.current = null;
      }

      if (messagesUnsubRef.current) {
        messagesUnsubRef.current();
        messagesUnsubRef.current = null;
      }
    };
  }, []);

  // ==================== LOAD CHANNELS ====================

  const loadChannels = useCallback(async (userNumericId: number) => {
    if (!userNumericId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Unsubscribe from previous listener
      if (channelsUnsubRef.current) {
        channelsUnsubRef.current();
      }

      // Subscribe to real-time updates
      channelsUnsubRef.current = realtimeMessagingService.subscribeToUserChannels(
        userNumericId,
        (updatedChannels) => {
          if (isActiveRef.current) {
            setChannels(updatedChannels);
          }
        }
      );

      // Initial load
      const initialChannels = await realtimeMessagingService.getUserChannels(userNumericId);
      if (isActiveRef.current) {
        setChannels(initialChannels);
      }
    } catch (err) {
      logger.error('[useRealtimeMessaging] Failed to load channels', err instanceof Error ? err : undefined);
      if (isActiveRef.current) {
        setError('Failed to load conversations');
      }
    } finally {
      if (isActiveRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // ==================== SELECT CHANNEL ====================

  const selectChannel = useCallback(async (channelId: string) => {
    if (!currentUserNumericId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Find channel in list first (fast path)
      let channel = channels.find((c) => c.id === channelId) || null;

      // If not in list, fetch directly from RTDB (handles race condition
      // where channel was just created but subscription hasn't fired yet)
      if (!channel) {
        logger.debug('[useRealtimeMessaging] Channel not in list, fetching directly', { channelId });
        channel = await realtimeMessagingService.getChannelById(channelId);

        // Add to local channels list so subsequent renders find it
        if (channel && isActiveRef.current) {
          setChannels((prev) => {
            if (prev.find((c) => c.id === channelId)) return prev;
            return [channel!, ...prev];
          });
        }
      }

      if (channel && isActiveRef.current) {
        setCurrentChannel(channel);
      }

      // Unsubscribe from previous messages listener
      if (messagesUnsubRef.current) {
        messagesUnsubRef.current();
      }

      // Subscribe to messages
      messagesUnsubRef.current = realtimeMessagingService.subscribeToMessages(
        channelId,
        (updatedMessages) => {
          if (isActiveRef.current) {
            setMessages(updatedMessages);
          }
        }
      );

      // Mark as read
      if (autoMarkAsRead) {
        await realtimeMessagingService.markAsRead(channelId, currentUserNumericId);
      }
    } catch (err) {
      logger.error('[useRealtimeMessaging] Failed to select channel', err instanceof Error ? err : undefined);
      if (isActiveRef.current) {
        setError('Failed to load messages');
      }
    } finally {
      if (isActiveRef.current) {
        setIsLoading(false);
      }
    }
  }, [channels, currentUserNumericId, autoMarkAsRead]);

  // ==================== SEND MESSAGE ====================

  const sendMessage = useCallback(async (content: string): Promise<string | null> => {
    if (!currentChannel || !currentUserNumericId || !currentUserFirebaseId) {
      setError('Cannot send message: missing context');
      return null;
    }

    try {
      // Determine recipient
      const recipientNumericId = currentChannel.buyerNumericId === currentUserNumericId
        ? currentChannel.sellerNumericId
        : currentChannel.buyerNumericId;

      const recipientFirebaseId = currentChannel.buyerNumericId === currentUserNumericId
        ? currentChannel.sellerFirebaseId
        : currentChannel.buyerFirebaseId;

      const messageId = await realtimeMessagingService.sendTextMessage(
        currentChannel.id,
        currentUserNumericId,
        currentUserFirebaseId,
        recipientNumericId,
        recipientFirebaseId,
        content
      );

      return messageId;
    } catch (err) {
      logger.error('[useRealtimeMessaging] Failed to send message', err instanceof Error ? err : undefined);
      setError('Failed to send message');
      return null;
    }
  }, [currentChannel, currentUserNumericId, currentUserFirebaseId]);

  // ==================== SEND OFFER ====================

  const sendOffer = useCallback(async (
    amount: number,
    currency = 'EUR'
  ): Promise<string | null> => {
    if (!currentChannel || !currentUserNumericId || !currentUserFirebaseId) {
      setError('Cannot send offer: missing context');
      return null;
    }

    try {
      const recipientNumericId = currentChannel.buyerNumericId === currentUserNumericId
        ? currentChannel.sellerNumericId
        : currentChannel.buyerNumericId;

      const recipientFirebaseId = currentChannel.buyerNumericId === currentUserNumericId
        ? currentChannel.sellerFirebaseId
        : currentChannel.buyerFirebaseId;

      const messageId = await realtimeMessagingService.sendOfferMessage(
        currentChannel.id,
        currentUserNumericId,
        currentUserFirebaseId,
        recipientNumericId,
        recipientFirebaseId,
        amount,
        currency,
        {
          carId: currentChannel.carNumericId,
          carFirebaseId: currentChannel.carFirebaseId,
          carTitle: currentChannel.carTitle,
          carPrice: currentChannel.carPrice,
          carImage: currentChannel.carImage,
        }
      );

      return messageId;
    } catch (err) {
      logger.error('[useRealtimeMessaging] Failed to send offer', err instanceof Error ? err : undefined);
      setError('Failed to send offer');
      return null;
    }
  }, [currentChannel, currentUserNumericId, currentUserFirebaseId]);

  // ==================== SEND IMAGE ====================

  const sendImage = useCallback(async (
    imageUrl: string,
    imageThumbnail?: string
  ): Promise<string | null> => {
    if (!currentChannel || !currentUserNumericId || !currentUserFirebaseId) {
      setError('Cannot send image: missing context');
      return null;
    }

    try {
      const recipientNumericId = currentChannel.buyerNumericId === currentUserNumericId
        ? currentChannel.sellerNumericId
        : currentChannel.buyerNumericId;

      const recipientFirebaseId = currentChannel.buyerNumericId === currentUserNumericId
        ? currentChannel.sellerFirebaseId
        : currentChannel.buyerFirebaseId;

      const messageId = await realtimeMessagingService.sendImageMessage(
        currentChannel.id,
        currentUserNumericId,
        currentUserFirebaseId,
        recipientNumericId,
        recipientFirebaseId,
        imageUrl,
        imageThumbnail
      );

      return messageId;
    } catch (err) {
      logger.error('[useRealtimeMessaging] Failed to send image', err instanceof Error ? err : undefined);
      setError('Failed to send image');
      return null;
    }
  }, [currentChannel, currentUserNumericId, currentUserFirebaseId]);

  // ==================== MARK AS READ ====================

  const markAsRead = useCallback(async () => {
    if (!currentChannel || !currentUserNumericId) return;

    try {
      await realtimeMessagingService.markAsRead(currentChannel.id, currentUserNumericId);
    } catch (err) {
      logger.error('[useRealtimeMessaging] Failed to mark as read', err instanceof Error ? err : undefined);
    }
  }, [currentChannel, currentUserNumericId]);

  // ==================== AUTO-MARK AS READ ====================

  useEffect(() => {
    if (autoMarkAsRead && currentChannel && currentUserNumericId && messages.length > 0) {
      // Small delay to ensure state is stable and user has "seen" it
      const timer = setTimeout(() => {
        realtimeMessagingService.markAsRead(currentChannel.id, currentUserNumericId);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [messages, currentChannel, currentUserNumericId, autoMarkAsRead]);

  // ==================== GET OR CREATE CHANNEL ====================

  const getOrCreateChannel = useCallback(async (
    params: CreateChannelParams
  ): Promise<RealtimeChannel | null> => {
    try {
      const channel = await realtimeMessagingService.getOrCreateChannel(params);

      // Refresh channels list
      if (currentUserNumericId) {
        const updatedChannels = await realtimeMessagingService.getUserChannels(currentUserNumericId);
        if (isActiveRef.current) {
          setChannels(updatedChannels);
        }
      }

      return channel;
    } catch (err) {
      logger.error('[useRealtimeMessaging] Failed to get/create channel', err instanceof Error ? err : undefined);
      setError('Failed to start conversation');
      return null;
    }
  }, [currentUserNumericId]);

  // ==================== AUTO-LOAD CHANNELS ====================

  useEffect(() => {
    if (currentUserNumericId) {
      loadChannels(currentUserNumericId);
    }
  }, [currentUserNumericId, loadChannels]);

  // ==================== RETURN ====================

  return {
    // State
    channels,
    currentChannel,
    messages,
    isLoading,
    error,

    // Actions
    loadChannels,
    selectChannel,
    sendMessage,
    sendOffer,
    sendImage,
    markAsRead,
    getOrCreateChannel,

    // Utilities
    generateChannelId: realtimeMessagingService.generateChannelId.bind(realtimeMessagingService),
  };
}

export default useRealtimeMessaging;
