/**
 * ⌨️ Typing Indicator Service
 * خدمة مؤشر الكتابة
 * 
 * @description Real-time typing indicators using Firebase Realtime Database
 * مؤشرات الكتابة في الوقت الحقيقي
 * 
 * Features:
 * - Real-time "is typing" detection
 * - Auto-timeout after 3 seconds of inactivity
 * - Debounced updates to reduce writes
 * - Multi-user support
 * 
 * @author Claude Opus 4.5 - Chief Architect
 * @date January 8, 2026
 */

import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  remove,
  off,
  DatabaseReference,
} from 'firebase/database';
import { logger } from '@/services/logger-service';

// ==================== INTERFACES ====================

/**
 * Typing State Interface
 * واجهة حالة الكتابة
 */
export interface TypingState {
  isTyping: boolean;
  timestamp: number;
  userName?: string;
}

/**
 * Typing Callback Type
 * نوع دالة رد الاتصال
 */
export type TypingCallback = (typingUsers: Array<{ userId: number; userName?: string }>) => void;

// ==================== SERVICE CLASS ====================

/**
 * Typing Indicator Service
 * خدمة مؤشر الكتابة
 */
class TypingIndicatorService {
  private static instance: TypingIndicatorService;
  private db = getDatabase();
  private activeListeners: Map<string, DatabaseReference> = new Map();
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  
  // Constants
  private readonly TYPING_TIMEOUT = 3000;    // 3 seconds
  private readonly DEBOUNCE_DELAY = 300;     // 300ms

  private constructor() {
    logger.info('[TypingIndicator] Service initialized');
  }

  /**
   * Get singleton instance
   */
  static getInstance(): TypingIndicatorService {
    if (!TypingIndicatorService.instance) {
      TypingIndicatorService.instance = new TypingIndicatorService();
    }
    return TypingIndicatorService.instance;
  }

  // ==================== TYPING MANAGEMENT ====================

  /**
   * Set typing status (debounced)
   * تعيين حالة الكتابة
   * 
   * @description Call this on every keystroke - it handles debouncing internally
   */
  setTyping(
    channelId: string,
    userNumericId: number,
    userName?: string
  ): void {
    const key = `${channelId}_${userNumericId}`;
    
    // Clear existing debounce timer
    const existingDebounce = this.debounceTimers.get(key);
    if (existingDebounce) {
      clearTimeout(existingDebounce);
    }
    
    // Debounce the actual update
    const debounceTimer = setTimeout(() => {
      this.updateTypingStatus(channelId, userNumericId, true, userName);
    }, this.DEBOUNCE_DELAY);
    
    this.debounceTimers.set(key, debounceTimer);
    
    // Reset auto-stop timer
    this.resetTypingTimeout(channelId, userNumericId);
  }

  /**
   * Update typing status in database
   * تحديث حالة الكتابة في قاعدة البيانات
   */
  private async updateTypingStatus(
    channelId: string,
    userNumericId: number,
    isTyping: boolean,
    userName?: string
  ): Promise<void> {
    // Validate inputs before attempting database write
    if (!channelId || !userNumericId || userNumericId <= 0) {
      logger.warn('[TypingIndicator] Invalid parameters for typing status update', {
        channelId,
        userNumericId
      });
      return;
    }
    
    const typingRef = ref(this.db, `typing/${channelId}/${userNumericId}`);
    
    if (isTyping) {
      // Firebase RTDB doesn't accept undefined, use null or omit the field
      const typingData: { isTyping: boolean; timestamp: number; userName?: string } = {
        isTyping: true,
        timestamp: Date.now(),
      };
      // Only add userName if it exists
      if (userName) {
        typingData.userName = userName;
      }
      await set(typingRef, typingData);
      logger.debug('[TypingIndicator] User started typing', { channelId, userNumericId });
    } else {
      await remove(typingRef);
      logger.debug('[TypingIndicator] User stopped typing', { channelId, userNumericId });
    }
  }

  /**
   * Reset typing timeout (auto-stop after 3 seconds)
   * إعادة ضبط مهلة الكتابة
   */
  private resetTypingTimeout(channelId: string, userNumericId: number): void {
    const key = `${channelId}_${userNumericId}`;
    
    // Clear existing timeout
    const existingTimeout = this.typingTimeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Set new timeout to stop typing
    const timeout = setTimeout(() => {
      this.stopTyping(channelId, userNumericId);
    }, this.TYPING_TIMEOUT);
    
    this.typingTimeouts.set(key, timeout);
  }

  /**
   * Stop typing (explicit)
   * إيقاف الكتابة
   * 
   * @description Call this when user sends message or clears input
   */
  stopTyping(channelId: string, userNumericId: number): void {
    const key = `${channelId}_${userNumericId}`;
    
    // Clear timers
    const timeout = this.typingTimeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.typingTimeouts.delete(key);
    }
    
    const debounce = this.debounceTimers.get(key);
    if (debounce) {
      clearTimeout(debounce);
      this.debounceTimers.delete(key);
    }
    
    // Update database
    this.updateTypingStatus(channelId, userNumericId, false);
  }

  /**
   * Stop all typing for a user (call on logout/disconnect)
   * إيقاف كل الكتابة للمستخدم
   */
  async stopAllTyping(userNumericId: number): Promise<void> {
    // Clear all local timers for this user
    this.typingTimeouts.forEach((timeout, key) => {
      if (key.endsWith(`_${userNumericId}`)) {
        clearTimeout(timeout);
        this.typingTimeouts.delete(key);
      }
    });
    
    this.debounceTimers.forEach((timer, key) => {
      if (key.endsWith(`_${userNumericId}`)) {
        clearTimeout(timer);
        this.debounceTimers.delete(key);
      }
    });
    
    logger.info('[TypingIndicator] Stopped all typing for user', { userNumericId });
  }

  // ==================== TYPING QUERIES ====================

  /**
   * Get current typing users for a channel
   * الحصول على المستخدمين الذين يكتبون حالياً
   */
  async getTypingUsers(channelId: string): Promise<Array<{ userId: number; userName?: string }>> {
    const typingRef = ref(this.db, `typing/${channelId}`);
    const snapshot = await get(typingRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const typingUsers: Array<{ userId: number; userName?: string }> = [];
    const now = Date.now();
    
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val() as TypingState;
      // Only include if typing is recent (within timeout period)
      if (data.isTyping && now - data.timestamp < this.TYPING_TIMEOUT) {
        typingUsers.push({
          userId: parseInt(childSnapshot.key!, 10),
          userName: data.userName,
        });
      }
    });
    
    return typingUsers;
  }

  /**
   * Subscribe to typing indicators for a channel
   * الاشتراك في مؤشرات الكتابة
   */
  subscribeToTyping(
    channelId: string,
    excludeUserId: number,
    callback: TypingCallback
  ): () => void {
    const typingRef = ref(this.db, `typing/${channelId}`);
    const listenerKey = `typing_${channelId}`;
    
    this.activeListeners.set(listenerKey, typingRef);
    
    const unsubscribe = onValue(typingRef, (snapshot) => {
      const typingUsers: Array<{ userId: number; userName?: string }> = [];
      const now = Date.now();
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const userId = parseInt(childSnapshot.key!, 10);
          const data = childSnapshot.val() as TypingState;
          
          // Exclude current user and expired typing states
          if (
            userId !== excludeUserId &&
            data.isTyping &&
            now - data.timestamp < this.TYPING_TIMEOUT
          ) {
            typingUsers.push({
              userId,
              userName: data.userName,
            });
          }
        });
      }
      
      callback(typingUsers);
    });
    
    return () => {
      off(typingRef);
      this.activeListeners.delete(listenerKey);
    };
  }

  /**
   * Check if anyone is typing in a channel
   * التحقق مما إذا كان أي شخص يكتب
   */
  async isAnyoneTyping(channelId: string, excludeUserId?: number): Promise<boolean> {
    const typingUsers = await this.getTypingUsers(channelId);
    
    if (excludeUserId) {
      return typingUsers.some((u) => u.userId !== excludeUserId);
    }
    
    return typingUsers.length > 0;
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Format typing indicator text for display
   * تنسيق نص مؤشر الكتابة
   */
  formatTypingText(
    typingUsers: Array<{ userId: number; userName?: string }>,
    locale: 'bg' | 'en' = 'bg'
  ): string {
    if (typingUsers.length === 0) {
      return '';
    }
    
    const names = typingUsers
      .map((u) => u.userName || `User ${u.userId}`)
      .slice(0, 3); // Max 3 names
    
    if (locale === 'bg') {
      if (names.length === 1) {
        return `${names[0]} пише...`;
      }
      if (names.length === 2) {
        return `${names[0]} и ${names[1]} пишат...`;
      }
      return `${names[0]}, ${names[1]} и други пишат...`;
    }
    
    // English
    if (names.length === 1) {
      return `${names[0]} is typing...`;
    }
    if (names.length === 2) {
      return `${names[0]} and ${names[1]} are typing...`;
    }
    return `${names[0]}, ${names[1]} and others are typing...`;
  }

  // ==================== CLEANUP ====================

  /**
   * Cleanup all listeners and timers
   * تنظيف جميع المستمعين والمؤقتات
   */
  cleanup(): void {
    // Clear all timeouts
    this.typingTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.typingTimeouts.clear();
    
    // Clear all debounce timers
    this.debounceTimers.forEach((timer) => clearTimeout(timer));
    this.debounceTimers.clear();
    
    // Unsubscribe from listeners
    this.activeListeners.forEach((ref) => off(ref));
    this.activeListeners.clear();
    
    logger.info('[TypingIndicator] Service cleaned up');
  }
}

// ==================== EXPORTS ====================

export const typingIndicatorService = TypingIndicatorService.getInstance();
export default TypingIndicatorService;
