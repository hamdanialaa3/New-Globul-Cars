/**
 * 💬 useRealtimeMessaging Hook (Branded Types Version)
 * خطاف الرسائل في الوقت الحقيقي - إصدار الأنواع الموسومة
 * 
 * @description React hook for real-time messaging with type-safe branded IDs
 * خطاف React لوظائف الرسائل في الوقت الحقيقي مع معرفات موسومة آمنة للنوع
 * 
 * @author Implementation - January 14, 2026
 * @audit-fix Phase 2.3 - Branded Types Integration
 */

import { useState, useEffect, useCallback, useRef } from 'react';

import {
  realtimeMessagingService,
  RealtimeChannel,
  RealtimeMessage,
  CreateChannelParams,
} from '../../services/messaging/realtime';
import { logger } from '../../services/logger-service';

// ✅ Branded Types Import
import {
  NumericUserId,
  FirebaseUid,
  ChannelId,
  createNumericUserId,
  createFirebaseUid,
  parseChannelId,
  isNumericUserId,
  isFirebaseUid,
  isChannelId,
} from '../../types/branded-types';

// ==================== INTERFACES (Type-Safe) ====================

interface UseRealtimeMessagingOptions {
  autoMarkAsRead?: boolean;
}

/**
 * Type-safe return interface with branded IDs
 */
interface UseRealtimeMessagingReturn {
  // State
  channels: RealtimeChannel[];
  currentChannel: RealtimeChannel | null;
  messages: RealtimeMessage[];
  isLoading: boolean;
  error: string | null;
  
  // Actions (Type-Safe)
  loadChannels: (userFirebaseId: FirebaseUid) => Promise<void>;
  selectChannel: (channelId: ChannelId) => Promise<void>;
  sendMessage: (content: string) => Promise<string | null>;
  sendOffer: (amount: number, currency?: string) => Promise<string | null>;
  sendImage: (imageUrl: string, imageThumbnail?: string) => Promise<string | null>;
  markAsRead: () => Promise<void>;
  getOrCreateChannel: (params: CreateChannelParams) => Promise<RealtimeChannel | null>;
  
  // Utilities
  generateChannelId: typeof realtimeMessagingService.generateChannelId;
}

// ==================== HOOK (Type-Safe) ====================

/**
 * useRealtimeMessaging hook with branded types
 * 
 * @param currentUserNumericId Numeric User ID (branded type) - prevents passing wrong ID type
 * @param currentUserFirebaseId Firebase UID (branded type) - ensures type safety
 * @param options Hook configuration options
 * @returns Type-safe messaging interface
 * 
 * @example
 * import { createNumericUserId, createFirebaseUid } from '@/types/branded-types';
 * 
 * const userId = createNumericUserId(18);
 * const firebaseId = createFirebaseUid('abc123...');
 * 
 * const messaging = useRealtimeMessaging(userId, firebaseId);
 */
export function useRealtimeMessaging(
  currentUserNumericId: NumericUserId | null,
  currentUserFirebaseId: FirebaseUid | null,
  options: UseRealtimeMessagingOptions = {}
): UseRealtimeMessagingReturn {
  const { autoMarkAsRead = true } = options;
  
  // ==================== TYPE VALIDATION ====================
  
  // Validate branded types at runtime (development safety)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (currentUserNumericId !== null && !isNumericUserId(currentUserNumericId)) {
        logger.error('[useRealtimeMessaging] Invalid NumericUserId provided', new Error('Type validation failed'), {
          receivedType: typeof currentUserNumericId,
          receivedValue: currentUserNumericId
        });
      }
      
      if (currentUserFirebaseId !== null && !isFirebaseUid(currentUserFirebaseId)) {
        logger.error('[useRealtimeMessaging] Invalid FirebaseUid provided', new Error('Type validation failed'), {
          receivedType: typeof currentUserFirebaseId,
          receivedValue: currentUserFirebaseId
        });
      }
    }
  }, [currentUserNumericId, currentUserFirebaseId]);
  
  // ==================== STATE ====================
  
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

  // ==================== LOAD CHANNELS (Type-Safe) ====================

  const loadChannels = useCallback(async (userFirebaseId: FirebaseUid) => {
    if (!userFirebaseId) return;
    
    // Runtime validation
    if (!isFirebaseUid(userFirebaseId)) {
      logger.error('[useRealtimeMessaging] loadChannels called with invalid FirebaseUid', new Error('Invalid ID type'));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Unsubscribe from previous listener
      if (channelsUnsubRef.current) {
        channelsUnsubRef.current();
      }
      
      // Subscribe to real-time updates
      // Note: Service accepts string (Firebase UID), ensures type-safety at the hook level
      channelsUnsubRef.current = realtimeMessagingService.subscribeToUserChannels(
        userFirebaseId as string, // Safe cast after validation
        (updatedChannels) => {
          if (isActiveRef.current) {
            setChannels(updatedChannels);
          }
        }
      );
      
      // Initial load
      const initialChannels = await realtimeMessagingService.getUserChannels(
        userFirebaseId as string
      );
      
      if (isActiveRef.current) {
        setChannels(initialChannels);
      }
    } catch (err) {
      logger.error('[useRealtimeMessaging] Failed to load channels', err instanceof Error ? err : undefined, {
        userFirebaseId
      });
      if (isActiveRef.current) {
        setError('Failed to load conversations');
      }
    } finally {
      if (isActiveRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // ==================== SELECT CHANNEL (Type-Safe) ====================

  const selectChannel = useCallback(async (channelId: ChannelId) => {
    if (!currentUserNumericId) return;
    
    // Validate ChannelId format
    if (!isChannelId(channelId)) {
      logger.error('[useRealtimeMessaging] selectChannel called with invalid ChannelId', new Error('Invalid ID format'), {
        channelId
      });
      setError('Invalid channel ID');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Find channel in list
      const channel = channels.find((c) => c.id === channelId);
      if (channel) {
        setCurrentChannel(channel);
      }
      
      // Unsubscribe from previous messages listener
      if (messagesUnsubRef.current) {
        messagesUnsubRef.current();
      }
      
      // Subscribe to messages
      messagesUnsubRef.current = realtimeMessagingService.subscribeToMessages(
        channelId as string, // Safe cast after validation
        (updatedMessages) => {
          if (isActiveRef.current) {
            setMessages(updatedMessages);
          }
        }
      );
      
      // Mark as read
      if (autoMarkAsRead) {
        await realtimeMessagingService.markAsRead(
          channelId as string,
          currentUserNumericId as number
        );
      }
    } catch (err) {
      logger.error('[useRealtimeMessaging] Failed to select channel', err instanceof Error ? err : undefined, {
        channelId
      });
      if (isActiveRef.current) {
        setError('Failed to load messages');
      }
    } finally {
      if (isActiveRef.current) {
        setIsLoading(false);
      }
    }
  }, [channels, currentUserNumericId, autoMarkAsRead]);

  // ==================== SEND MESSAGE (Type-Safe) ====================

  const sendMessage = useCallback(async (content: string): Promise<string | null> => {
    if (!currentChannel || !currentUserNumericId || !currentUserFirebaseId) {
      setError('Cannot send message: missing context');
      return null;
    }
    
    try {
      // Determine recipient (type-safe)
      const recipientNumericId = currentChannel.buyerNumericId === (currentUserNumericId as number)
        ? createNumericUserId(currentChannel.sellerNumericId)
        : createNumericUserId(currentChannel.buyerNumericId);
      
      const recipientFirebaseId = currentChannel.buyerNumericId === (currentUserNumericId as number)
        ? createFirebaseUid(currentChannel.sellerFirebaseId)
        : createFirebaseUid(currentChannel.buyerFirebaseId);
      
      const messageId = await realtimeMessagingService.sendTextMessage(
        currentChannel.id,
        currentUserNumericId as number,
        currentUserFirebaseId as string,
        recipientNumericId as number,
        recipientFirebaseId as string,
        content
      );
      
      return messageId;
    } catch (err) {
      logger.error('[useRealtimeMessaging] Failed to send message', err instanceof Error ? err : undefined);
      setError('Failed to send message');
      return null;
    }
  }, [currentChannel, currentUserNumericId, currentUserFirebaseId]);

  // ==================== SEND OFFER (Type-Safe) ====================

  const sendOffer = useCallback(async (
    amount: number,
    currency = 'EUR'
  ): Promise<string | null> => {
    if (!currentChannel || !currentUserNumericId || !currentUserFirebaseId) {
      setError('Cannot send offer: missing context');
      return null;
    }
    
    try {
      const recipientNumericId = currentChannel.buyerNumericId === (currentUserNumericId as number)
        ? createNumericUserId(currentChannel.sellerNumericId)
        : createNumericUserId(currentChannel.buyerNumericId);
      
      const recipientFirebaseId = currentChannel.buyerNumericId === (currentUserNumericId as number)
        ? createFirebaseUid(currentChannel.sellerFirebaseId)
        : createFirebaseUid(currentChannel.buyerFirebaseId);
      
      const messageId = await realtimeMessagingService.sendOfferMessage(
        currentChannel.id,
        currentUserNumericId as number,
        currentUserFirebaseId as string,
        recipientNumericId as number,
        recipientFirebaseId as string,
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

  // ==================== SEND IMAGE (Type-Safe) ====================

  const sendImage = useCallback(async (
    imageUrl: string,
    imageThumbnail?: string
  ): Promise<string | null> => {
    if (!currentChannel || !currentUserNumericId || !currentUserFirebaseId) {
      setError('Cannot send image: missing context');
      return null;
    }
    
    try {
      const recipientNumericId = currentChannel.buyerNumericId === (currentUserNumericId as number)
        ? createNumericUserId(currentChannel.sellerNumericId)
        : createNumericUserId(currentChannel.buyerNumericId);
      
      const recipientFirebaseId = currentChannel.buyerNumericId === (currentUserNumericId as number)
        ? createFirebaseUid(currentChannel.sellerFirebaseId)
        : createFirebaseUid(currentChannel.buyerFirebaseId);
      
      const messageId = await realtimeMessagingService.sendImageMessage(
        currentChannel.id,
        currentUserNumericId as number,
        currentUserFirebaseId as string,
        recipientNumericId as number,
        recipientFirebaseId as string,
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
      await realtimeMessagingService.markAsRead(
        currentChannel.id,
        currentUserNumericId as number
      );
    } catch (err) {
      logger.error('[useRealtimeMessaging] Failed to mark as read', err instanceof Error ? err : undefined);
    }
  }, [currentChannel, currentUserNumericId]);

  // ==================== GET OR CREATE CHANNEL ====================

  const getOrCreateChannel = useCallback(async (
    params: CreateChannelParams
  ): Promise<RealtimeChannel | null> => {
    try {
      const channel = await realtimeMessagingService.getOrCreateChannel(params);
      
      // Refresh channels list
      if (currentUserFirebaseId) {
        const updatedChannels = await realtimeMessagingService.getUserChannels(
          currentUserFirebaseId as string
        );
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
  }, [currentUserFirebaseId]);

  // ==================== AUTO-LOAD CHANNELS ====================

  useEffect(() => {
    if (currentUserFirebaseId) {
      loadChannels(currentUserFirebaseId);
    }
  }, [currentUserFirebaseId, loadChannels]);

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
