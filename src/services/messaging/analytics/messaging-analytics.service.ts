import { db } from '@/firebase/firebase-config';
import { collection, doc, setDoc, increment, getDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { logger } from '@/services/logger-service';

/**
 * Message Analytics Data
 */
export interface MessageAnalytics {
  date: string; // YYYY-MM-DD
  conversationId: string;
  messagesSent: number;
  messagesRead: number;
  textCount: number;
  offerCount: number;
  voiceCount: number;
  actionCount: number;
  offersSent: number;
  totalOfferAmount: number;
  lastActivity: Date;
  lastReadAt?: Date;
  lastOfferAt?: Date;
}

/**
 * Conversation Analytics Summary
 */
export interface ConversationAnalyticsSummary {
  conversationId: string;
  totalMessages: number;
  totalOffers: number;
  avgResponseTime: number; // milliseconds
  lastMessageAt: Date;
  conversionRate: number; // 0-100
  leadScore: number; // 0-100
}

/**
 * MESSAGING ANALYTICS SERVICE
 * ----------------------------
 * تتبع وتحليل جميع أحداث المراسلة
 * 
 * المقاييس المتتبعة:
 * - عدد الرسائل المرسلة/المقروءة
 * - عدد العروض المرسلة/المقبولة
 * - متوسط وقت الرد
 * - معدل التحويل (محادثة → بيع)
 * - درجة العميل المحتمل (Lead Score)
 * 
 * @architect Senior System Architect
 * @compliance PROJECT_CONSTITUTION.md
 * @date December 29, 2025
 */
class MessagingAnalytics {
  private static instance: MessagingAnalytics;
  private readonly ANALYTICS_COLLECTION = 'messaging_analytics';
  private readonly CONVERSATION_ANALYTICS = 'conversation_analytics';

  private constructor() {
    logger.info('[MessagingAnalytics] Initialized');
  }

  static getInstance(): MessagingAnalytics {
    if (!this.instance) {
      this.instance = new MessagingAnalytics();
    }
    return this.instance;
  }

  /**
   * TRACK MESSAGE SENT
   * تتبع رسالة مرسلة
   */
  async trackMessageSent(
    conversationId: string,
    messageType: 'text' | 'offer' | 'voice' | 'action'
  ): Promise<void> {
    try {
      const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const analyticsRef = doc(
        db,
        this.ANALYTICS_COLLECTION,
        `${date}_${conversationId}`
      );

      const updateData: any = {
        date,
        conversationId,
        messagesSent: increment(1),
        [`${messageType}Count`]: increment(1),
        lastActivity: new Date()
      };

      await setDoc(analyticsRef, updateData, { merge: true });

      logger.debug('[MessagingAnalytics] Message sent tracked', {
        conversationId,
        messageType
      });
    } catch (error) {
      logger.warn('[MessagingAnalytics] Failed to track message sent', {
        error: (error as Error).message
      });
      // Don't throw - analytics should never break the app
    }
  }

  /**
   * TRACK MESSAGES READ
   * تتبع قراءة الرسائل
   */
  async trackMessagesRead(conversationId: string): Promise<void> {
    try {
      const date = new Date().toISOString().slice(0, 10);
      const analyticsRef = doc(
        db,
        this.ANALYTICS_COLLECTION,
        `${date}_${conversationId}`
      );

      await setDoc(analyticsRef, {
        messagesRead: increment(1),
        lastReadAt: new Date()
      }, { merge: true });

      logger.debug('[MessagingAnalytics] Messages read tracked', { conversationId });
    } catch (error) {
      logger.warn('[MessagingAnalytics] Failed to track messages read', {
        error: (error as Error).message
      });
    }
  }

  /**
   * TRACK OFFER SENT
   * تتبع عرض مرسل
   */
  async trackOfferSent(
    conversationId: string,
    amount: number,
    currency: string = 'EUR'
  ): Promise<void> {
    try {
      const date = new Date().toISOString().slice(0, 10);
      const analyticsRef = doc(
        db,
        this.ANALYTICS_COLLECTION,
        `${date}_${conversationId}`
      );

      await setDoc(analyticsRef, {
        offersSent: increment(1),
        totalOfferAmount: increment(amount),
        lastOfferAt: new Date()
      }, { merge: true });

      logger.info('[MessagingAnalytics] Offer sent tracked', {
        conversationId,
        amount,
        currency
      });
    } catch (error) {
      logger.warn('[MessagingAnalytics] Failed to track offer sent', {
        error: (error as Error).message
      });
    }
  }

  /**
   * GET CONVERSATION ANALYTICS
   * الحصول على تحليلات محادثة معينة
   */
  async getConversationAnalytics(
    conversationId: string,
    startDate?: string,
    endDate?: string
  ): Promise<MessageAnalytics[]> {
    try {
      const analyticsRef = collection(db, this.ANALYTICS_COLLECTION);
      
      // Build query
      let q = query(
        analyticsRef,
        where('conversationId', '==', conversationId)
      );

      if (startDate) {
        q = query(q, where('date', '>=', startDate));
      }

      if (endDate) {
        q = query(q, where('date', '<=', endDate));
      }

      const snapshot = await getDocs(q);
      
      const analytics: MessageAnalytics[] = snapshot.docs.map((doc: any) => 
        doc.data() as MessageAnalytics
      );

      // Sort by date
      analytics.sort((a, b) => a.date.localeCompare(b.date));

      logger.info('[MessagingAnalytics] Fetched conversation analytics', {
        conversationId,
        count: analytics.length
      });

      return analytics;
    } catch (error) {
      logger.error('[MessagingAnalytics] Failed to get conversation analytics', error as Error, {
        conversationId
      });
      throw error;
    }
  }

  /**
   * GET CONVERSATION SUMMARY
   * الحصول على ملخص تحليلات المحادثة
   */
  async getConversationSummary(conversationId: string): Promise<ConversationAnalyticsSummary | null> {
    try {
      const summaryRef = doc(db, this.CONVERSATION_ANALYTICS, conversationId);
      const summarySnap = await getDoc(summaryRef);

      if (!summarySnap.exists()) {
        logger.warn('[MessagingAnalytics] Summary not found', { conversationId });
        return null;
      }

      return summarySnap.data() as ConversationAnalyticsSummary;
    } catch (error) {
      logger.error('[MessagingAnalytics] Failed to get summary', error as Error, {
        conversationId
      });
      throw error;
    }
  }

  /**
   * UPDATE CONVERSATION SUMMARY
   * تحديث ملخص تحليلات المحادثة
   */
  async updateConversationSummary(
    conversationId: string,
    data: Partial<ConversationAnalyticsSummary>
  ): Promise<void> {
    try {
      const summaryRef = doc(db, this.CONVERSATION_ANALYTICS, conversationId);
      
      await setDoc(summaryRef, {
        conversationId,
        ...data,
        updatedAt: new Date()
      }, { merge: true });

      logger.debug('[MessagingAnalytics] Summary updated', { conversationId });
    } catch (error) {
      logger.warn('[MessagingAnalytics] Failed to update summary', {
        error: (error as Error).message
      });
    }
  }

  /**
   * CALCULATE RESPONSE TIME
   * حساب متوسط وقت الرد
   */
  async calculateResponseTime(
    conversationId: string,
    messages: Array<{ timestamp: Date; senderId: string }>
  ): Promise<number> {
    try {
      if (messages.length < 2) {
        return 0;
      }

      let totalResponseTime = 0;
      let responseCount = 0;

      // Calculate time between messages from different users
      for (let i = 1; i < messages.length; i++) {
        const prev = messages[i - 1];
        const curr = messages[i];

        // Only count if different senders (response to a message)
        if (prev.senderId !== curr.senderId) {
          const timeDiff = curr.timestamp.getTime() - prev.timestamp.getTime();
          totalResponseTime += timeDiff;
          responseCount++;
        }
      }

      const avgResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0;

      // Update summary
      await this.updateConversationSummary(conversationId, {
        avgResponseTime
      });

      logger.debug('[MessagingAnalytics] Response time calculated', {
        conversationId,
        avgResponseTime: Math.round(avgResponseTime / 1000) + 's'
      });

      return avgResponseTime;
    } catch (error) {
      logger.error('[MessagingAnalytics] Failed to calculate response time', error as Error);
      return 0;
    }
  }

  /**
   * CALCULATE LEAD SCORE
   * حساب درجة العميل المحتمل
   */
  async calculateLeadScore(conversationId: string): Promise<number> {
    try {
      const analytics = await this.getConversationAnalytics(conversationId);
      const summary = await this.getConversationSummary(conversationId).catch(() => null);
      if (analytics.length === 0) {
        return 0;
      }

      const toDate = (value: any): Date | null => {
        if (!value) return null;
        if (value instanceof Date) return value;
        if (typeof value.toDate === 'function') return value.toDate();
        return null;
      };

      const totals = analytics.reduce(
        (acc, item) => {
          acc.messages += item.messagesSent || 0;
          acc.read += item.messagesRead || 0;
          acc.offers += item.offersSent || 0;
          acc.offerAmount += item.totalOfferAmount || 0;
          const activity = toDate(item.lastActivity);
          if (activity && (!acc.lastActivity || activity > acc.lastActivity)) {
            acc.lastActivity = activity;
          }
          return acc;
        },
        { messages: 0, read: 0, offers: 0, offerAmount: 0, lastActivity: null as Date | null }
      );

      let score = 0;

      // Engagement: message volume (max 25)
      score += Math.min(totals.messages * 1.5, 25);

      // Intent: offers count + value (max 30)
      const offerScore = Math.min(totals.offers * 10, 20);
      const offerValueScore = Math.min(totals.offerAmount / 1000, 10);
      score += offerScore + offerValueScore;

      // Responsiveness: faster avg response time = higher score (max 20)
      const avgResponseMs = summary?.avgResponseTime || 0;
      if (avgResponseMs > 0) {
        const minutes = avgResponseMs / 60000;
        if (minutes <= 5) score += 20;
        else if (minutes <= 30) score += 12;
        else if (minutes <= 120) score += 6;
      }

      // Recency: last activity freshness (max 15)
      if (totals.lastActivity) {
        const hoursSince = (Date.now() - totals.lastActivity.getTime()) / (1000 * 60 * 60);
        if (hoursSince <= 24) score += 15;
        else if (hoursSince <= 72) score += 8;
      }

      // Read engagement: read ratio (max 10)
      if (totals.messages > 0) {
        const readRatio = Math.min(totals.read / totals.messages, 1);
        score += readRatio * 10;
      }

      score = Math.min(Math.round(score), 100);

      await this.updateConversationSummary(conversationId, {
        leadScore: score
      });

      logger.info('[MessagingAnalytics] Lead score calculated', {
        conversationId,
        score
      });

      return score;
    } catch (error) {
      logger.error('[MessagingAnalytics] Failed to calculate lead score', error as Error);
      return 0;
    }
  }

  /**
   * GET DAILY STATS
   * الحصول على إحصائيات يومية
   */
  async getDailyStats(date?: string): Promise<{
    totalMessages: number;
    totalOffers: number;
    totalConversations: number;
    avgMessagesPerConversation: number;
  }> {
    try {
      const targetDate = date || new Date().toISOString().slice(0, 10);
      
      const analyticsRef = collection(db, this.ANALYTICS_COLLECTION);
      const q = query(analyticsRef, where('date', '==', targetDate));
      
      const snapshot = await getDocs(q);
      
      const stats = {
        totalMessages: 0,
        totalOffers: 0,
        totalConversations: snapshot.size,
        avgMessagesPerConversation: 0
      };

      snapshot.forEach(doc => {
        const data = doc.data() as MessageAnalytics;
        stats.totalMessages += data.messagesSent || 0;
        stats.totalOffers += data.offersSent || 0;
      });

      stats.avgMessagesPerConversation = stats.totalConversations > 0
        ? Math.round(stats.totalMessages / stats.totalConversations)
        : 0;

      logger.info('[MessagingAnalytics] Daily stats calculated', {
        date: targetDate,
        ...stats
      });

      return stats;
    } catch (error) {
      logger.error('[MessagingAnalytics] Failed to get daily stats', error as Error);
      throw error;
    }
  }
}

export const messagingAnalytics = MessagingAnalytics.getInstance();
