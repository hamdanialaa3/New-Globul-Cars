/**
 * 🚀 Realtime Messaging Service
 * خدمة الرسائل في الوقت الحقيقي
 * 
 * @description High-performance messaging using Firebase Realtime Database
 * يستخدم Firebase Realtime Database للحصول على أداء فائق السرعة
 * 
 * @architecture
 * - Deterministic Channel IDs (لا تكرار للقنوات)
 * - Numeric ID System (متوافق مع دستور المشروع)
 * - Real-time subscriptions with automatic cleanup
 * 
 * @author Claude Opus 4.5 - Chief Architect
 * @date January 8, 2026
 */

import {
  getDatabase,
  ref,
  push,
  set,
  get,
  onValue,
  update,
  serverTimestamp,
  query,
  orderByChild,
  limitToLast,
  DataSnapshot,
  off,
  DatabaseReference,
} from 'firebase/database';
import { logger } from '@/services/logger-service';

// ==================== INTERFACES ====================

/**
 * Realtime Message Interface
 * واجهة الرسالة في الوقت الحقيقي
 */
export interface RealtimeMessage {
  id: string;
  channelId: string;
  senderId: number;           // Numeric ID للمرسل
  senderNumericId: number;    // Alias for senderId (for compatibility)
  senderFirebaseId: string;   // Firebase UID للتحقق
  recipientId: number;        // Numeric ID للمستلم
  recipientFirebaseId: string;
  content: string;
  type: 'text' | 'offer' | 'image' | 'system' | 'location';
  timestamp: number;
  serverTimestamp?: object;
  read: boolean;
  readAt?: number;
  metadata?: RealtimeMessageMetadata;
}

/**
 * Message Metadata for special message types
 * البيانات الوصفية للرسائل الخاصة
 */
export interface RealtimeMessageMetadata {
  // For offer messages
  offerAmount?: number;
  offerCurrency?: string;
  offerStatus?: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';
  offerExpiresAt?: number;
  
  // For image messages
  imageUrl?: string;
  imageThumbnail?: string;
  
  // For location messages
  latitude?: number;
  longitude?: number;
  locationName?: string;
  
  // For car context
  carId?: number;
  carFirebaseId?: string;
  carTitle?: string;
  carPrice?: number;
  carImage?: string;
  carMake?: string;
  carModel?: string;
}

/**
 * Realtime Channel (Conversation) Interface
 * واجهة القناة (المحادثة)
 */
export interface RealtimeChannel {
  id: string;
  buyerNumericId: number;
  buyerFirebaseId: string;
  buyerName: string;
  buyerDisplayName?: string;    // Alias for buyerName
  buyerAvatar?: string | null;  // Can be null for Firebase RTDB compatibility
  sellerNumericId: number;
  sellerFirebaseId: string;
  sellerName: string;
  sellerDisplayName?: string;   // Alias for sellerName
  sellerAvatar?: string | null; // Can be null for Firebase RTDB compatibility
  carNumericId: number;
  carFirebaseId: string;
  carTitle: string;
  carPrice: number;
  carImage: string;
  carMake?: string;
  carModel?: string;
  createdAt: number;
  updatedAt: number;
  lastActivityAt?: number;      // For sorting
  lastMessage?: {
    content: string;
    senderId: number;
    timestamp: number;
    type: string;
  };
  unreadCount: {
    [numericUserId: string]: number;
  };
  hasActiveOffer?: boolean;     // For offer filtering
  status: 'active' | 'archived' | 'blocked';
}

/**
 * Channel Participant Info
 * معلومات المشارك في القناة
 */
export interface ChannelParticipant {
  numericId: number;
  firebaseId: string;
  displayName: string;
  avatarUrl?: string | null;  // Can be null for Firebase RTDB compatibility
  isOnline?: boolean;
  lastSeen?: number;
}

/**
 * Create Channel Params
 * بارامترات إنشاء القناة
 */
export interface CreateChannelParams {
  buyer: ChannelParticipant;
  seller: ChannelParticipant;
  car: {
    numericId: number;
    firebaseId: string;
    title: string;
    price: number;
    image: string;
    make?: string;
    model?: string;
  };
}

// ==================== SERVICE CLASS ====================

/**
 * Realtime Messaging Service
 * Singleton pattern for global access
 */
class RealtimeMessagingService {
  private static instance: RealtimeMessagingService;
  private db = getDatabase();
  private activeListeners: Map<string, DatabaseReference> = new Map();

  private constructor() {
    logger.info('[RealtimeMessaging] Service initialized');
  }

  /**
   * Get singleton instance
   * الحصول على المثيل الوحيد
   */
  static getInstance(): RealtimeMessagingService {
    if (!RealtimeMessagingService.instance) {
      RealtimeMessagingService.instance = new RealtimeMessagingService();
    }
    return RealtimeMessagingService.instance;
  }

  // ==================== CHANNEL ID GENERATION ====================

  /**
   * Generate Deterministic Channel ID
   * توليد معرف قناة حتمي (لا يتكرر أبداً)
   * 
   * @description This ensures that the same buyer+seller+car always gets the same channel
   * هذا يضمن أن نفس المشتري+البائع+السيارة سيحصلون على نفس القناة دائماً
   * 
   * Format: msg_{smallerId}_{largerId}_car_{carNumericId}
   * Example: msg_42_80_car_5
   */
  generateChannelId(buyerNumericId: number, sellerNumericId: number, carNumericId: number): string {
    // Sort IDs to ensure consistency regardless of who initiates
    const sortedUserIds = [buyerNumericId, sellerNumericId].sort((a, b) => a - b);
    const channelId = `msg_${sortedUserIds[0]}_${sortedUserIds[1]}_car_${carNumericId}`;
    
    logger.debug('[RealtimeMessaging] Generated channel ID', {
      buyerNumericId,
      sellerNumericId,
      carNumericId,
      channelId,
    });
    
    return channelId;
  }

  /**
   * Parse Channel ID to extract participants and car
   * تحليل معرف القناة لاستخراج المشاركين والسيارة
   */
  parseChannelId(channelId: string): { user1: number; user2: number; carId: number } | null {
    const match = channelId.match(/^msg_(\d+)_(\d+)_car_(\d+)$/);
    if (!match) {
      logger.warn('[RealtimeMessaging] Invalid channel ID format', { channelId });
      return null;
    }
    return {
      user1: parseInt(match[1], 10),
      user2: parseInt(match[2], 10),
      carId: parseInt(match[3], 10),
    };
  }

  // ==================== CHANNEL OPERATIONS ====================

  /**
   * Get or Create Channel
   * الحصول على قناة موجودة أو إنشاء جديدة
   * 
   * @description This is the main entry point for starting a conversation
   */
  async getOrCreateChannel(params: CreateChannelParams): Promise<RealtimeChannel> {
    const { buyer, seller, car } = params;
    
    // ✅ FIX Phase 4.3: Check block status BEFORE creating channel
    // Check and auto-unblock if initiator tries to message someone they blocked
    try {
      const { blockUserService } = await import('@/services/messaging/block-user.service');
      
      // Check if buyer blocked seller
      const buyerBlockedSeller = await blockUserService.isBlocked(
        buyer.numericId,
        seller.numericId
      );
      
      if (buyerBlockedSeller) {
        // Auto-unblock: if buyer initiates contact, they want to communicate
        logger.info('[RealtimeMessaging] Auto-unblocking seller for channel creation', {
          buyer: buyer.numericId,
          seller: seller.numericId
        });
        
        await blockUserService.unblockUser(buyer.firebaseId, seller.firebaseId);
      }
      
      // Check if seller blocked buyer
      const sellerBlockedBuyer = await blockUserService.isBlocked(
        seller.numericId,
        buyer.numericId
      );
      
      if (sellerBlockedBuyer) {
        // This is legitimate - seller doesn't want contact
        throw new Error('CHANNEL_BLOCKED: This user has blocked you');
      }
      
      logger.info('[RealtimeMessaging] Block check passed for channel creation', {
        buyer: buyer.numericId,
        seller: seller.numericId
      });
      
    } catch (error) {
      // Re-throw block errors (only when seller blocked buyer)
      if (error instanceof Error && error.message.includes('CHANNEL_BLOCKED')) {
        logger.warn('Channel creation blocked due to user block', {
          buyer: buyer.numericId,
          seller: seller.numericId,
          error: error.message
        });
        throw error;
      }
      
      // Log but allow creation if block check fails (fail open)
      logger.warn('Failed to check block status before channel creation', error as Error, {
        buyer: buyer.numericId,
        seller: seller.numericId
      });
    }
    
    const channelId = this.generateChannelId(buyer.numericId, seller.numericId, car.numericId);
    
    const channelRef = ref(this.db, `channels/${channelId}`);
    const snapshot = await get(channelRef);
    
    if (snapshot.exists()) {
      logger.info('[RealtimeMessaging] Found existing channel', { channelId });
      return { id: channelId, ...snapshot.val() } as RealtimeChannel;
    }
    
    // Create new channel
    const now = Date.now();
    // Firebase RTDB doesn't accept undefined values, use null or empty string
    const newChannel: Omit<RealtimeChannel, 'id'> = {
      buyerNumericId: buyer.numericId,
      buyerFirebaseId: buyer.firebaseId,
      buyerName: buyer.displayName || '',
      buyerAvatar: buyer.avatarUrl || null,
      sellerNumericId: seller.numericId,
      sellerFirebaseId: seller.firebaseId,
      sellerName: seller.displayName || '',
      sellerAvatar: seller.avatarUrl || null,
      carNumericId: car.numericId,
      carFirebaseId: car.firebaseId || '',
      carTitle: car.title || '',
      carPrice: car.price || 0,
      carImage: car.image || '',
      carMake: car.make || '',
      carModel: car.model || '',
      createdAt: now,
      updatedAt: now,
      unreadCount: {
        [buyer.numericId]: 0,
        [seller.numericId]: 0,
      },
      status: 'active',
    };
    
    await set(channelRef, newChannel);
    
    // Also index in user's channel list for fast lookup
    await this.indexChannelForUser(channelId, buyer.numericId, seller.numericId, car.numericId);
    await this.indexChannelForUser(channelId, seller.numericId, buyer.numericId, car.numericId);
    
    logger.info('[RealtimeMessaging] Created new channel', { channelId, buyer: buyer.numericId, seller: seller.numericId });
    
    return { id: channelId, ...newChannel };
  }

  /**
   * Index channel for a user (for fast user-specific queries)
   * فهرسة القناة للمستخدم
   */
  private async indexChannelForUser(
    channelId: string,
    userNumericId: number,
    otherUserNumericId: number,
    carNumericId: number
  ): Promise<void> {
    const indexRef = ref(this.db, `user_channels/${userNumericId}/${channelId}`);
    await set(indexRef, {
      channelId,
      otherUserId: otherUserNumericId,
      carId: carNumericId,
      createdAt: serverTimestamp(),
    });
  }

  /**
   * Get user's channels
   * الحصول على قنوات المستخدم
   */
  async getUserChannels(userNumericId: number): Promise<RealtimeChannel[]> {
    const userChannelsRef = ref(this.db, `user_channels/${userNumericId}`);
    const indexSnapshot = await get(userChannelsRef);
    
    if (!indexSnapshot.exists()) {
      return [];
    }
    
    const channelIds = Object.keys(indexSnapshot.val());
    const channels: RealtimeChannel[] = [];
    
    // Fetch all channels in parallel
    const promises = channelIds.map(async (channelId) => {
      const channelRef = ref(this.db, `channels/${channelId}`);
      const channelSnapshot = await get(channelRef);
      if (channelSnapshot.exists()) {
        channels.push({ id: channelId, ...channelSnapshot.val() });
      }
    });
    
    await Promise.all(promises);
    
    // Sort by updatedAt descending
    channels.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    
    logger.debug('[RealtimeMessaging] Fetched user channels', {
      userNumericId,
      count: channels.length,
    });
    
    return channels;
  }

  /**
   * Subscribe to user's channels (real-time updates)
   * الاشتراك في تحديثات قنوات المستخدم
   */
  subscribeToUserChannels(
    userNumericId: number,
    callback: (channels: RealtimeChannel[]) => void
  ): () => void {
    const userChannelsRef = ref(this.db, `user_channels/${userNumericId}`);
    const listenerKey = `user_channels_${userNumericId}`;
    
    // Store reference for cleanup
    this.activeListeners.set(listenerKey, userChannelsRef);
    
    const unsubscribe = onValue(userChannelsRef, async (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      
      const channelIds = Object.keys(snapshot.val());
      const channels: RealtimeChannel[] = [];
      
      // Fetch all channels
      for (const channelId of channelIds) {
        const channelRef = ref(this.db, `channels/${channelId}`);
        const channelSnapshot = await get(channelRef);
        if (channelSnapshot.exists()) {
          channels.push({ id: channelId, ...channelSnapshot.val() });
        }
      }
      
      // Sort by last activity
      channels.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      callback(channels);
    });
    
    return () => {
      off(userChannelsRef);
      this.activeListeners.delete(listenerKey);
      logger.debug('[RealtimeMessaging] Unsubscribed from user channels', { userNumericId });
    };
  }

  // ==================== MESSAGE OPERATIONS ====================

  /**
   * Send a message
   * إرسال رسالة
   * 
   * @description Checks if user is blocked before sending message
   * يتحقق من حظر المستخدم قبل إرسال الرسالة
   */
  async sendMessage(
    channelId: string,
    message: Omit<RealtimeMessage, 'id' | 'timestamp' | 'serverTimestamp' | 'read' | 'channelId'>
  ): Promise<string> {
    // 🔴 CRITICAL: Check if user is blocked before sending
    try {
      const { blockUserService } = await import('@/services/messaging/block-user.service');
      
      // Check if recipient blocked sender
      const hasBlockedMe = await blockUserService.hasBlockedMe(
        message.senderId,
        message.recipientId
      );
      
      if (hasBlockedMe) {
        throw new Error('MESSAGE_BLOCKED: Recipient has blocked you');
      }
      
      // Check if sender blocked recipient
      const isBlocked = await blockUserService.isBlocked(
        message.senderId,
        message.recipientId
      );
      
      if (isBlocked) {
        throw new Error('MESSAGE_BLOCKED: You have blocked this user');
      }
    } catch (error) {
      // Re-throw block errors, log others but continue (fail open for now)
      if (error instanceof Error && error.message.includes('MESSAGE_BLOCKED')) {
        logger.warn('Message blocked by block system', {
          channelId,
          senderId: message.senderId,
          recipientId: message.recipientId,
          error: error.message,
        });
        throw error;
      }
      // If block check fails, log but continue (fail open)
      logger.warn('Failed to check block status before sending message', error as Error, {
        channelId,
        senderId: message.senderId,
        recipientId: message.recipientId,
      });
    }
    
    const messagesRef = ref(this.db, `messages/${channelId}`);
    const newMessageRef = push(messagesRef);
    const messageId = newMessageRef.key!;
    
    const now = Date.now();
    const fullMessage: RealtimeMessage = {
      ...message,
      id: messageId,
      channelId,
      timestamp: now,
      serverTimestamp: serverTimestamp(),
      read: false,
    };
    
    await set(newMessageRef, fullMessage);
    
    // Update channel's last message and updatedAt
    const channelRef = ref(this.db, `channels/${channelId}`);
    await update(channelRef, {
      updatedAt: now,
      lastMessage: {
        content: message.content,
        senderId: message.senderId,
        timestamp: now,
        type: message.type,
      },
      [`unreadCount/${message.recipientId}`]: (await this.getUnreadCount(channelId, message.recipientId)) + 1,
    });
    
    logger.info('[RealtimeMessaging] Message sent', {
      channelId,
      messageId,
      senderId: message.senderId,
      type: message.type,
    });
    
    return messageId;
  }

  /**
   * Send a text message (convenience method)
   * إرسال رسالة نصية
   */
  async sendTextMessage(
    channelId: string,
    senderId: number,
    senderFirebaseId: string,
    recipientId: number,
    recipientFirebaseId: string,
    content: string
  ): Promise<string> {
    return this.sendMessage(channelId, {
      senderId,
      senderNumericId: senderId,
      senderFirebaseId,
      recipientId,
      recipientFirebaseId,
      content,
      type: 'text',
    });
  }

  /**
   * Send an offer message
   * إرسال عرض سعر
   */
  async sendOfferMessage(
    channelId: string,
    senderId: number,
    senderFirebaseId: string,
    recipientId: number,
    recipientFirebaseId: string,
    offerAmount: number,
    offerCurrency: string = 'EUR',
    carMetadata?: RealtimeMessageMetadata
  ): Promise<string> {
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now
    
    return this.sendMessage(channelId, {
      senderId,
      senderNumericId: senderId,
      senderFirebaseId,
      recipientId,
      recipientFirebaseId,
      content: `💰 عرض سعر: ${offerAmount.toLocaleString('de-DE')} ${offerCurrency}`,
      type: 'offer',
      metadata: {
        offerAmount,
        offerCurrency,
        offerStatus: 'pending',
        offerExpiresAt: expiresAt,
        ...carMetadata,
      },
    });
  }

  /**
   * Send an image message
   * إرسال رسالة صورة
   */
  async sendImageMessage(
    channelId: string,
    senderId: number,
    senderFirebaseId: string,
    recipientId: number,
    recipientFirebaseId: string,
    imageUrl: string,
    imageThumbnail?: string
  ): Promise<string> {
    return this.sendMessage(channelId, {
      senderId,
      senderNumericId: senderId,
      senderFirebaseId,
      recipientId,
      recipientFirebaseId,
      content: '📷 صورة',
      type: 'image',
      metadata: {
        imageUrl,
        imageThumbnail: imageThumbnail || imageUrl,
      },
    });
  }

  /**
   * Get unread count for a user in a channel
   * الحصول على عدد الرسائل غير المقروءة
   */
  private async getUnreadCount(channelId: string, userNumericId: number): Promise<number> {
    const channelRef = ref(this.db, `channels/${channelId}/unreadCount/${userNumericId}`);
    const snapshot = await get(channelRef);
    return snapshot.exists() ? snapshot.val() : 0;
  }

  /**
   * Mark messages as read
   * تحديد الرسائل كمقروءة
   */
  async markAsRead(channelId: string, readerNumericId: number): Promise<void> {
    // Reset unread count
    const channelRef = ref(this.db, `channels/${channelId}/unreadCount/${readerNumericId}`);
    await set(channelRef, 0);
    
    // Mark individual messages as read (optional optimization)
    const messagesRef = ref(this.db, `messages/${channelId}`);
    const snapshot = await get(messagesRef);
    
    if (snapshot.exists()) {
      const updates: { [key: string]: any } = {};
      const now = Date.now();
      
      snapshot.forEach((childSnapshot) => {
        const message = childSnapshot.val();
        if (message.recipientId === readerNumericId && !message.read) {
          updates[`${childSnapshot.key}/read`] = true;
          updates[`${childSnapshot.key}/readAt`] = now;
        }
      });
      
      if (Object.keys(updates).length > 0) {
        await update(messagesRef, updates);
      }
    }
    
    logger.debug('[RealtimeMessaging] Marked messages as read', {
      channelId,
      readerNumericId,
    });
  }

  /**
   * Get messages for a channel
   * الحصول على رسائل القناة
   */
  async getMessages(channelId: string, limit: number = 50): Promise<RealtimeMessage[]> {
    const messagesRef = query(
      ref(this.db, `messages/${channelId}`),
      orderByChild('timestamp'),
      limitToLast(limit)
    );
    
    const snapshot = await get(messagesRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const messages: RealtimeMessage[] = [];
    snapshot.forEach((childSnapshot) => {
      messages.push({ id: childSnapshot.key!, ...childSnapshot.val() });
    });
    
    return messages.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Subscribe to messages (real-time updates)
   * الاشتراك في الرسائل في الوقت الحقيقي
   */
  subscribeToMessages(
    channelId: string,
    callback: (messages: RealtimeMessage[]) => void
  ): () => void {
    const messagesRef = query(
      ref(this.db, `messages/${channelId}`),
      orderByChild('timestamp'),
      limitToLast(100)
    );
    
    const listenerKey = `messages_${channelId}`;
    this.activeListeners.set(listenerKey, ref(this.db, `messages/${channelId}`));
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const messages: RealtimeMessage[] = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          messages.push({ id: childSnapshot.key!, ...childSnapshot.val() });
        });
      }
      
      callback(messages.sort((a, b) => a.timestamp - b.timestamp));
    });
    
    return () => {
      off(ref(this.db, `messages/${channelId}`));
      this.activeListeners.delete(listenerKey);
      logger.debug('[RealtimeMessaging] Unsubscribed from messages', { channelId });
    };
  }

  // ==================== OFFER MANAGEMENT ====================

  /**
   * Update offer status
   * تحديث حالة العرض
   */
  async updateOfferStatus(
    channelId: string,
    messageId: string,
    newStatus: 'accepted' | 'rejected' | 'countered' | 'expired',
    counterAmount?: number
  ): Promise<void> {
    const messageRef = ref(this.db, `messages/${channelId}/${messageId}/metadata`);
    
    const updates: Partial<RealtimeMessageMetadata> = {
      offerStatus: newStatus,
    };
    
    if (newStatus === 'countered' && counterAmount) {
      updates.offerAmount = counterAmount;
    }
    
    await update(messageRef, updates);
    
    logger.info('[RealtimeMessaging] Offer status updated', {
      channelId,
      messageId,
      newStatus,
      counterAmount,
    });
  }

  // ==================== CLEANUP ====================

  /**
   * Cleanup all listeners (call on logout/unmount)
   * تنظيف جميع المستمعين
   */
  cleanup(): void {
    this.activeListeners.forEach((ref, key) => {
      off(ref);
      logger.debug('[RealtimeMessaging] Cleaned up listener', { key });
    });
    this.activeListeners.clear();
  }
}

// ==================== EXPORTS ====================

export const realtimeMessagingService = RealtimeMessagingService.getInstance();
export default RealtimeMessagingService;
