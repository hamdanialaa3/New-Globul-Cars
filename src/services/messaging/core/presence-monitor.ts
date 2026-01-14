import { realtimeDb as database } from '@/firebase/firebase-config';
import { ref, onValue, set, serverTimestamp, off } from 'firebase/database';
import { logger } from '@/services/logger-service';

/**
 * User Presence Status
 */
export type PresenceStatus = 'online' | 'offline' | 'away';

/**
 * User Presence Data
 */
export interface UserPresence {
  userId: string;
  status: PresenceStatus;
  lastSeen: number;
  isTyping?: boolean;
  conversationId?: string;
}

/**
 * PRESENCE MONITOR (CORE SERVICE)
 * --------------------------------
 * نظام مراقبة الحضور - Online/Offline/Typing
 * 
 * الميزات:
 * - تتبع حالة الاتصال (online/offline/away)
 * - آخر ظهور (last seen)
 * - مؤشر الكتابة (typing indicator)
 * - مزامنة عبر جميع الأجهزة
 * 
 * التقنية:
 * - Firebase Realtime Database (presence/)
 * - Server timestamps
 * - Connection listeners
 * 
 * @architect Senior System Architect
 * @compliance PROJECT_CONSTITUTION.md
 * @date December 29, 2025
 */
class PresenceMonitor {
  private static instance: PresenceMonitor;
  private presenceListeners: Map<string, () => void> = new Map();
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private readonly TYPING_TIMEOUT = 3000; // 3 seconds

  private constructor() {
    logger.info('[PresenceMonitor] Initialized');
  }

  static getInstance(): PresenceMonitor {
    if (!this.instance) {
      this.instance = new PresenceMonitor();
    }
    return this.instance;
  }

  /**
   * SET USER ONLINE
   * تعيين المستخدم كمتصل
   */
  async setOnline(userId: string): Promise<void> {
    if (!userId) {
      logger.warn('[PresenceMonitor] Cannot set online without userId');
      return;
    }
    
    try {
      const presenceRef = ref(database, `presence/${userId}`);

      const presenceData: UserPresence = {
        userId,
        status: 'online',
        lastSeen: Date.now(),
        isTyping: false
      };

      await set(presenceRef, presenceData);

      // Set up automatic offline on disconnect
      this.setupDisconnectHandler(userId);

      logger.info('[PresenceMonitor] User set to online', { userId });
    } catch (error) {
      logger.error('[PresenceMonitor] Failed to set online', error as Error, { userId });
      throw error;
    }
  }

  /**
   * SET USER OFFLINE
   * تعيين المستخدم كغير متصل
   */
  async setOffline(userId: string): Promise<void> {
    if (!userId) {
      logger.warn('[PresenceMonitor] Cannot set offline without userId');
      return;
    }
    
    try {
      const presenceRef = ref(database, `presence/${userId}`);

      const presenceData: UserPresence = {
        userId,
        status: 'offline',
        lastSeen: Date.now(),
        isTyping: false
      };

      await set(presenceRef, presenceData);

      logger.info('[PresenceMonitor] User set to offline', { userId });
    } catch (error) {
      logger.error('[PresenceMonitor] Failed to set offline', error as Error, { userId });
      throw error;
    }
  }

  /**
   * SET USER TYPING
   * تعيين المستخدم كيكتب الآن
   */
  async setTyping(userId: string, conversationId: string, isTyping: boolean): Promise<void> {
    try {
      const presenceRef = ref(database, `presence/${userId}`);

      await set(presenceRef, {
        userId,
        status: 'online',
        lastSeen: Date.now(),
        isTyping,
        conversationId: isTyping ? conversationId : null
      });

      // Auto-clear typing after timeout
      if (isTyping) {
        this.scheduleTypingClear(userId, conversationId);
      } else {
        this.clearTypingTimeout(userId);
      }

      logger.info('[PresenceMonitor] Typing status updated', {
        userId,
        conversationId,
        isTyping
      });
    } catch (error) {
      logger.error('[PresenceMonitor] Failed to set typing', error as Error);
      // Fail silently for typing indicators
    }
  }

  /**
   * WATCH USER PRESENCE
   * مراقبة حالة اتصال مستخدم
   */
  watchUserPresence(
    userId: string,
    callback: (presence: UserPresence | null) => void
  ): () => void {
    try {
      const presenceRef = ref(database, `presence/${userId}`);

      const unsubscribe = onValue(presenceRef, (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
          callback(data as UserPresence);
        } else {
          callback(null);
        }
      });

      // Store listener for cleanup
      this.presenceListeners.set(userId, unsubscribe);

      logger.info('[PresenceMonitor] Watching presence', { userId });

      // Return cleanup function
      return () => {
        off(presenceRef);
        this.presenceListeners.delete(userId);
        logger.info('[PresenceMonitor] Stopped watching presence', { userId });
      };
    } catch (error) {
      logger.error('[PresenceMonitor] Failed to watch presence', error as Error, { userId });
      return () => {}; // Return no-op
    }
  }

  /**
   * GET USER PRESENCE
   * الحصول على حالة المستخدم الحالية
   */
  async getUserPresence(userId: string): Promise<UserPresence | null> {
    return new Promise((resolve) => {
      try {
        const presenceRef = ref(database, `presence/${userId}`);

        onValue(presenceRef, (snapshot) => {
          const data = snapshot.val();
          resolve(data as UserPresence | null);
        }, {
          onlyOnce: true
        });
      } catch (error) {
        logger.error('[PresenceMonitor] Failed to get presence', error as Error, { userId });
        resolve(null);
      }
    });
  }

  /**
   * WATCH CONVERSATION TYPING
   * مراقبة من يكتب في محادثة معينة
   */
  watchConversationTyping(
    conversationId: string,
    callback: (typingUsers: string[]) => void
  ): () => void {
    try {
      const presenceRef = ref(database, 'presence');

      const unsubscribe = onValue(presenceRef, (snapshot) => {
        const allPresence = snapshot.val() || {};
        
        const typingUsers: string[] = [];
        
        Object.values(allPresence).forEach((presence: any) => {
          if (presence.isTyping && presence.conversationId === conversationId) {
            typingUsers.push(presence.userId);
          }
        });

        callback(typingUsers);
      });

      logger.info('[PresenceMonitor] Watching conversation typing', { conversationId });

      return () => {
        off(presenceRef);
        logger.info('[PresenceMonitor] Stopped watching conversation typing', { conversationId });
      };
    } catch (error) {
      logger.error('[PresenceMonitor] Failed to watch typing', error as Error, { conversationId });
      return () => {};
    }
  }

  /**
   * SETUP DISCONNECT HANDLER
   * إعداد معالج الانقطاع التلقائي
   * @private
   */
  private setupDisconnectHandler(userId: string): void {
    try {
      // ✅ تفعيل onDisconnect مع Firebase Realtime Database
      // عند فقد الاتصال، يتم تحديث حالة المستخدم إلى offline وتسجيل آخر ظهور
      const presenceRef = ref(database, `presence/${userId}`);
      // onDisconnect متوفرة فقط في بيئة المتصفح/Node مع WebSocket
      // يجب التأكد من وجود window (بيئة متصفح)
      if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
        // استيراد onDisconnect ديناميكياً لتفادي مشاكل SSR
        import('firebase/database').then(({ onDisconnect, serverTimestamp }) => {
          try {
            onDisconnect(presenceRef).set({
              userId,
              status: 'offline',
              lastSeen: serverTimestamp(),
              isTyping: false
            });
            logger.info('[PresenceMonitor] Disconnect handler set up', { userId });
          } catch (err) {
            logger.warn('[PresenceMonitor] Failed to set disconnect handler (inner)', {
              error: (err as Error).message
            });
          }
        });
      } else {
        logger.warn('[PresenceMonitor] onDisconnect not available in this environment', { userId });
      }
    } catch (error) {
      logger.warn('[PresenceMonitor] Failed to set disconnect handler', {
        error: (error as Error).message
      });
    }
  }

  /**
   * SCHEDULE TYPING CLEAR
   * جدولة مسح حالة الكتابة التلقائي
   * @private
   */
  private scheduleTypingClear(userId: string, conversationId: string): void {
    // Clear existing timeout
    this.clearTypingTimeout(userId);

    // Set new timeout
    const timeout = setTimeout(() => {
      this.setTyping(userId, conversationId, false).catch(() => {
        // Silent fail
      });
    }, this.TYPING_TIMEOUT);

    this.typingTimeouts.set(userId, timeout);
  }

  /**
   * CLEAR TYPING TIMEOUT
   * مسح مؤقت الكتابة
   * @private
   */
  private clearTypingTimeout(userId: string): void {
    const timeout = this.typingTimeouts.get(userId);
    
    if (timeout) {
      clearTimeout(timeout);
      this.typingTimeouts.delete(userId);
    }
  }

  /**
   * CLEANUP
   * تنظيف جميع المستمعين (عند تسجيل الخروج)
   */
  cleanup(): void {
    logger.info('[PresenceMonitor] Cleaning up', {
      listeners: this.presenceListeners.size,
      timeouts: this.typingTimeouts.size
    });

    // Clear all listeners
    this.presenceListeners.forEach((unsubscribe) => unsubscribe());
    this.presenceListeners.clear();

    // Clear all timeouts
    this.typingTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.typingTimeouts.clear();
  }
}

export const presenceMonitor = PresenceMonitor.getInstance();
