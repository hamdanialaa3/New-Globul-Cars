/**
 * 🟢 Presence Service
 * خدمة الحضور (Online/Offline)
 * 
 * @description Real-time presence tracking using Firebase Realtime Database
 * تتبع الحضور في الوقت الحقيقي
 * 
 * Features:
 * - Auto-detect online/offline status
 * - Last seen timestamp
 * - Automatic cleanup on disconnect
 * - Integration with Numeric ID system
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
  onDisconnect,
  serverTimestamp,
  off,
  DatabaseReference,
} from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { logger } from '@/services/logger-service';

// ==================== INTERFACES ====================

/**
 * Presence Status Interface
 * واجهة حالة الحضور
 */
export interface PresenceStatus {
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen: number;
  lastActive?: number;
  device?: 'mobile' | 'desktop' | 'tablet';
  currentPage?: string;
}

/**
 * Presence Callback Type
 * نوع دالة رد الاتصال
 */
export type PresenceCallback = (isOnline: boolean, lastSeen: number, status: PresenceStatus) => void;

// ==================== SERVICE CLASS ====================

/**
 * Presence Service
 * خدمة الحضور
 */
class PresenceService {
  private static instance: PresenceService;
  private db = getDatabase();
  private currentUserNumericId: number | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private activeListeners: Map<string, DatabaseReference> = new Map();
  
  // Constants
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds
  private readonly AWAY_THRESHOLD = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    logger.info('[Presence] Service initialized');
    
    // Listen for visibility changes
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
  }

  /**
   * Get singleton instance
   */
  static getInstance(): PresenceService {
    if (!PresenceService.instance) {
      PresenceService.instance = new PresenceService();
    }
    return PresenceService.instance;
  }

  // ==================== PRESENCE MANAGEMENT ====================

  /**
   * Initialize presence for current user
   * تهيئة الحضور للمستخدم الحالي
   * 
   * @description Call this after user logs in
   */
  async initialize(numericUserId: number, device?: 'mobile' | 'desktop' | 'tablet'): Promise<void> {
    // ✅ Guard: Check authentication first
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      logger.warn('[Presence] Cannot initialize: User not authenticated');
      return;
    }
    
    // ✅ Guard: Don't initialize if no numeric ID
    if (!numericUserId || numericUserId <= 0) {
      logger.warn('[Presence] Cannot initialize: Invalid numericUserId', { numericUserId });
      return;
    }
    
    this.currentUserNumericId = numericUserId;
    
    const presenceRef = ref(this.db, `presence/${numericUserId}`);
    const connectedRef = ref(this.db, '.info/connected');
    
    // Listen for connection state
    onValue(connectedRef, async (snapshot) => {
      if (snapshot.val() === true) {
        // We're connected (or reconnected)
        
        try {
          // Set online status
          await set(presenceRef, {
            status: 'online',
            lastSeen: serverTimestamp(),
            lastActive: serverTimestamp(),
            device: device || this.detectDevice(),
            uid: currentUser.uid, // Required by database rules
          });
          
          // Set up disconnect handler (when connection is lost)
          await onDisconnect(presenceRef).set({
            status: 'offline',
            lastSeen: serverTimestamp(),
            device: device || this.detectDevice(),
            uid: currentUser.uid, // Required by database rules
          });
          
          logger.info('[Presence] User is now online', { numericUserId });
        } catch (error) {
          logger.error('[Presence] Failed to set online status', error as Error, { numericUserId });
        }
      }
    });
    
    // Start heartbeat
    this.startHeartbeat(numericUserId);
  }

  /**
   * Detect device type
   * اكتشاف نوع الجهاز
   */
  private detectDevice(): 'mobile' | 'desktop' | 'tablet' {
    if (typeof window === 'undefined') return 'desktop';
    
    const ua = navigator.userAgent.toLowerCase();
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  /**
   * Handle visibility change (tab focus/blur)
   * معالجة تغيير الرؤية
   */
  private async handleVisibilityChange(): Promise<void> {
    if (!this.currentUserNumericId) return;
    
    const presenceRef = ref(this.db, `presence/${this.currentUserNumericId}`);
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    if (document.visibilityState === 'hidden') {
      // Tab is hidden, set as away
      await set(presenceRef, {
        status: 'away',
        lastSeen: serverTimestamp(),
        device: this.detectDevice(),
        uid: currentUser.uid,
      });
      logger.debug('[Presence] User is away (tab hidden)');
    } else {
      // Tab is visible, set as online
      await set(presenceRef, {
        status: 'online',
        lastSeen: serverTimestamp(),
        lastActive: serverTimestamp(),
        device: this.detectDevice(),
        uid: currentUser.uid,
      });
      logger.debug('[Presence] User is back online (tab visible)');
    }
  }

  /**
   * Start heartbeat to keep presence alive
   * بدء نبضة القلب للحفاظ على الحضور
   */
  private startHeartbeat(numericUserId: number): void {
    // Clear existing heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.heartbeatInterval = setInterval(async () => {
      if (!this.currentUserNumericId) return;
      
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      
      const presenceRef = ref(this.db, `presence/${numericUserId}`);
      await set(presenceRef, {
        status: document.visibilityState === 'hidden' ? 'away' : 'online',
        lastSeen: serverTimestamp(),
        lastActive: document.visibilityState === 'visible' ? serverTimestamp() : null,
        device: this.detectDevice(),
        uid: currentUser.uid,
      });
    }, this.HEARTBEAT_INTERVAL);
  }

  /**
   * Set user as offline (call on logout)
   * تعيين المستخدم كغير متصل
   */
  async setOffline(): Promise<void> {
    if (!this.currentUserNumericId) return;
    
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    const presenceRef = ref(this.db, `presence/${this.currentUserNumericId}`);
    
    await set(presenceRef, {
      status: 'offline',
      lastSeen: serverTimestamp(),
      uid: currentUser.uid,
    });
    
    // Clear heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    logger.info('[Presence] User set to offline', { numericUserId: this.currentUserNumericId });
    this.currentUserNumericId = null;
  }

  /**
   * Update current page (for activity tracking)
   * تحديث الصفحة الحالية
   */
  async updateCurrentPage(pageName: string): Promise<void> {
    if (!this.currentUserNumericId) return;
    
    const presenceRef = ref(this.db, `presence/${this.currentUserNumericId}`);
    const snapshot = await get(presenceRef);
    
    if (snapshot.exists()) {
      await set(presenceRef, {
        ...snapshot.val(),
        currentPage: pageName,
        lastActive: serverTimestamp(),
      });
    }
  }

  // ==================== PRESENCE QUERIES ====================

  /**
   * Get presence status for a user
   * الحصول على حالة الحضور
   */
  async getPresence(numericUserId: number): Promise<PresenceStatus | null> {
    const presenceRef = ref(this.db, `presence/${numericUserId}`);
    const snapshot = await get(presenceRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return snapshot.val() as PresenceStatus;
  }

  /**
   * Check if user is online
   * التحقق مما إذا كان المستخدم متصل
   */
  async isOnline(numericUserId: number): Promise<boolean> {
    const presence = await this.getPresence(numericUserId);
    return presence?.status === 'online';
  }

  /**
   * Get last seen time for a user
   * الحصول على آخر مرة شوهد فيها المستخدم
   */
  async getLastSeen(numericUserId: number): Promise<number | null> {
    const presence = await this.getPresence(numericUserId);
    return presence?.lastSeen || null;
  }

  /**
   * Subscribe to presence updates for a user
   * الاشتراك في تحديثات الحضور
   */
  subscribeToPresence(numericUserId: number, callback: PresenceCallback): () => void {
    const presenceRef = ref(this.db, `presence/${numericUserId}`);
    const listenerKey = `presence_${numericUserId}`;
    
    this.activeListeners.set(listenerKey, presenceRef);
    
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as PresenceStatus;
        callback(
          data.status === 'online',
          data.lastSeen || 0,
          data
        );
      } else {
        callback(false, 0, { status: 'offline', lastSeen: 0 });
      }
    });
    
    return () => {
      off(presenceRef);
      this.activeListeners.delete(listenerKey);
    };
  }

  /**
   * Subscribe to multiple users' presence
   * الاشتراك في حضور عدة مستخدمين
   */
  subscribeToMultiplePresence(
    numericUserIds: number[],
    callback: (presenceMap: Map<number, PresenceStatus>) => void
  ): () => void {
    const unsubscribers: Array<() => void> = [];
    const presenceMap = new Map<number, PresenceStatus>();
    
    for (const userId of numericUserIds) {
      const unsubscribe = this.subscribeToPresence(userId, (isOnline, lastSeen, status) => {
        presenceMap.set(userId, status);
        callback(new Map(presenceMap)); // Create new Map to trigger React re-renders
      });
      unsubscribers.push(unsubscribe);
    }
    
    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Format last seen for display
   * تنسيق آخر مرة شوهد فيها
   */
  formatLastSeen(timestamp: number, locale: 'bg' | 'en' = 'bg'): string {
    if (!timestamp) {
      return locale === 'bg' ? 'Неизвестно' : 'Unknown';
    }
    
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) {
      return locale === 'bg' ? 'Току-що' : 'Just now';
    }
    if (minutes < 60) {
      return locale === 'bg' 
        ? `Преди ${minutes} минути` 
        : `${minutes} minutes ago`;
    }
    if (hours < 24) {
      return locale === 'bg'
        ? `Преди ${hours} часа`
        : `${hours} hours ago`;
    }
    if (days < 7) {
      return locale === 'bg'
        ? `Преди ${days} дни`
        : `${days} days ago`;
    }
    
    // Return formatted date
    return new Date(timestamp).toLocaleDateString(locale === 'bg' ? 'bg-BG' : 'en-US');
  }

  // ==================== CLEANUP ====================

  /**
   * Cleanup all listeners and intervals
   * تنظيف جميع المستمعين والفترات
   */
  cleanup(): void {
    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    // Unsubscribe from visibility
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
    
    // Clean up listeners
    this.activeListeners.forEach((ref) => {
      off(ref);
    });
    this.activeListeners.clear();
    
    logger.info('[Presence] Service cleaned up');
  }
}

// ==================== EXPORTS ====================

export const presenceService = PresenceService.getInstance();
export default PresenceService;
