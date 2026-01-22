/**
 * AI Security Monitor
 * مراقب الأمان للذكاء الاصطناعي - كشف الاستخدام المشبوه ومنع الإساءة
 * 
 * @module security-monitor
 * @description نظام متقدم لمراقبة الأمان والكشف عن سوء الاستخدام
 */

import { db } from '../../firebase/firebase-config';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  Timestamp 
} from 'firebase/firestore';
import { logger } from '../logger-service';

// ================ Interfaces ================

export interface SecurityEvent {
  id?: string;
  userId: string;
  eventType: 'rate_limit_exceeded' | 'suspicious_content' | 'sensitive_data_detected' | 
             'repeated_failures' | 'unusual_pattern' | 'quota_manipulation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata: Record<string, any>;
  timestamp: Date;
  actionTaken?: string;
  resolved: boolean;
}

export interface UserSuspension {
  userId: string;
  reason: string;
  suspendedAt: Date;
  suspendedUntil?: Date;
  isPermanent: boolean;
  appealAllowed: boolean;
}

export interface AbuseDetection {
  userId: string;
  abuseType: string;
  confidence: number;
  evidence: string[];
  recommendedAction: 'warn' | 'suspend_temp' | 'suspend_perm' | 'none';
}

// ================ Security Monitor Class ================

class AISecurityMonitor {
  private static instance: AISecurityMonitor;
  private readonly EVENTS_COLLECTION = 'ai_security_events';
  private readonly SUSPENSIONS_COLLECTION = 'ai_user_suspensions';

  // حدود الأمان
  private readonly RATE_LIMITS = {
    requests_per_minute: 10,
    requests_per_hour: 100,
    requests_per_day: 500,
    failed_requests_threshold: 5
  };

  // أنماط المحتوى الحساس
  private readonly SENSITIVE_PATTERNS = {
    // EGN بلغاري (رقم قومي)
    egn: /\b[0-9]{10}\b/g,
    
    // أرقام بطاقات الائتمان
    creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    
    // أرقام الهاتف البلغارية
    phoneNumber: /\b(?:\+359|0)[0-9]{9}\b/g,
    
    // لوحات السيارات البلغارية
    licensePlate: /\b[A-Z]{1,2}\s?\d{4}\s?[A-Z]{2}\b/gi,
    
    // عناوين البريد الإلكتروني
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    
    // كلمات مرور محتملة
    password: /\b(?:password|парола|pass)\s*[:=]\s*\S+/gi
  };

  // كلمات محظورة
  private readonly FORBIDDEN_KEYWORDS = [
    'hack', 'хакване', 'мамене', 'измама', 'фалшив',
    'steal', 'кражба', 'пране на пари', 'нелегален'
  ];

  private constructor() {
    logger.info('AI Security Monitor initialized');
  }

  static getInstance(): AISecurityMonitor {
    if (!this.instance) {
      this.instance = new AISecurityMonitor();
    }
    return this.instance;
  }

  // ================ Abuse Detection ================

  /**
   * كشف سوء الاستخدام المحتمل
   */
  async detectAbuse(
    userId: string,
    requests: Array<{ timestamp: number; success: boolean; content: string }>
  ): Promise<AbuseDetection | null> {
    try {
      const evidence: string[] = [];
      let abuseScore = 0;

      // 1. فحص معدل الطلبات
      const recentRequests = requests.filter(r => 
        r.timestamp > Date.now() - 60 * 1000
      );

      if (recentRequests.length > this.RATE_LIMITS.requests_per_minute) {
        evidence.push(`${recentRequests.length} заявки за минута (лимит: ${this.RATE_LIMITS.requests_per_minute})`);
        abuseScore += 30;
      }

      // 2. فحص الطلبات الفاشلة المتكررة
      const failedRequests = requests.filter(r => !r.success);
      if (failedRequests.length > this.RATE_LIMITS.failed_requests_threshold) {
        evidence.push(`${failedRequests.length} неуспешни заявки (праг: ${this.RATE_LIMITS.failed_requests_threshold})`);
        abuseScore += 20;
      }

      // 3. فحص المحتوى المشبوه
      for (const request of requests) {
        if (this.containsSuspiciousContent(request.content)) {
          evidence.push('Открито подозрително съдържание');
          abuseScore += 40;
          break;
        }
      }

      // 4. فحص البيانات الحساسة
      for (const request of requests) {
        const sensitiveData = this.scanForSensitiveData(request.content);
        if (sensitiveData.length > 0) {
          evidence.push(`Открити чувствителни данни: ${sensitiveData.join(', ')}`);
          abuseScore += 50;
          break;
        }
      }

      // 5. فحص الأنماط غير العادية
      if (this.detectUnusualPattern(requests)) {
        evidence.push('Необичаен модел на използване');
        abuseScore += 25;
      }

      // تحديد الإجراء الموصى به
      let recommendedAction: AbuseDetection['recommendedAction'] = 'none';
      if (abuseScore >= 80) {
        recommendedAction = 'suspend_perm';
      } else if (abuseScore >= 60) {
        recommendedAction = 'suspend_temp';
      } else if (abuseScore >= 40) {
        recommendedAction = 'warn';
      }

      if (abuseScore >= 40) {
        const detection: AbuseDetection = {
          userId,
          abuseType: this.determineAbuseType(evidence),
          confidence: abuseScore / 100,
          evidence,
          recommendedAction
        };

        // تسجيل الحدث
        await this.logSecurityEvent({
          userId,
          eventType: 'unusual_pattern',
          severity: abuseScore >= 80 ? 'critical' : abuseScore >= 60 ? 'high' : 'medium',
          description: `Открито злоупотреба (${Math.round(abuseScore)}% увереност)`,
          metadata: { evidence, abuseScore },
          timestamp: new Date(),
          resolved: false
        });

        return detection;
      }

      return null;

    } catch (error) {
      logger.error('Abuse detection failed', error as Error);
      return null;
    }
  }

  /**
   * تعليق المستخدم
   */
  async suspendUser(
    userId: string,
    reason: string,
    duration?: number, // بالساعات
    isPermanent: boolean = false
  ): Promise<void> {
    try {
      const suspendedAt = new Date();
      const suspendedUntil = duration 
        ? new Date(suspendedAt.getTime() + duration * 60 * 60 * 1000)
        : undefined;

      const suspension: UserSuspension = {
        userId,
        reason,
        suspendedAt,
        suspendedUntil,
        isPermanent,
        appealAllowed: !isPermanent
      };

      await addDoc(collection(db, this.SUSPENSIONS_COLLECTION), {
        ...suspension,
        suspendedAt: Timestamp.fromDate(suspendedAt),
        suspendedUntil: suspendedUntil ? Timestamp.fromDate(suspendedUntil) : null
      });

      // تسجيل حدث أمان
      await this.logSecurityEvent({
        userId,
        eventType: 'rate_limit_exceeded',
        severity: isPermanent ? 'critical' : 'high',
        description: `Потребител суспендиран: ${reason}`,
        metadata: { duration, isPermanent },
        timestamp: new Date(),
        actionTaken: isPermanent ? 'permanent_suspension' : 'temporary_suspension',
        resolved: false
      });

      logger.warn('User suspended', {
        userId,
        reason,
        duration,
        isPermanent
      });

    } catch (error) {
      logger.error('Failed to suspend user', error as Error);
      throw error;
    }
  }

  /**
   * فحص إذا كان المستخدم معلق
   */
  async isUserSuspended(userId: string): Promise<{
    suspended: boolean;
    reason?: string;
    until?: Date;
  }> {
    try {
      const q = query(
        collection(db, this.SUSPENSIONS_COLLECTION),
        where('userId', '==', userId),
        orderBy('suspendedAt', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return { suspended: false };
      }

      const suspension = snapshot.docs[0].data() as UserSuspension;

      // فحص إذا انتهى التعليق المؤقت
      if (!suspension.isPermanent && suspension.suspendedUntil) {
        const until = suspension.suspendedUntil;
        if (until < new Date()) {
          return { suspended: false };
        }
      }

      return {
        suspended: true,
        reason: suspension.reason,
        until: suspension.suspendedUntil
      };

    } catch (error) {
      logger.error('Failed to check suspension status', error as Error);
      return { suspended: false };
    }
  }

  // ================ Content Moderation ================

  /**
   * فحص المحتوى للكلمات المحظورة
   */
  containsSuspiciousContent(content: string): boolean {
    const lowerContent = content.toLowerCase();
    return this.FORBIDDEN_KEYWORDS.some(keyword => 
      lowerContent.includes(keyword)
    );
  }

  /**
   * فحص البيانات الحساسة
   */
  scanForSensitiveData(content: string): string[] {
    const detectedTypes: string[] = [];

    if (this.SENSITIVE_PATTERNS.egn.test(content)) {
      detectedTypes.push('ЕГН');
    }

    if (this.SENSITIVE_PATTERNS.creditCard.test(content)) {
      detectedTypes.push('Номер на кредитна карта');
    }

    if (this.SENSITIVE_PATTERNS.phoneNumber.test(content)) {
      detectedTypes.push('Телефонен номер');
    }

    if (this.SENSITIVE_PATTERNS.email.test(content)) {
      detectedTypes.push('Email адрес');
    }

    if (this.SENSITIVE_PATTERNS.password.test(content)) {
      detectedTypes.push('Парола');
    }

    return detectedTypes;
  }

  /**
   * تعقيم المحتوى من البيانات الحساسة
   */
  sanitizeContent(content: string): string {
    let sanitized = content;

    // استبدال EGN
    sanitized = sanitized.replace(this.SENSITIVE_PATTERNS.egn, '[ЕГН СКРИТО]');

    // استبدال أرقام البطاقات
    sanitized = sanitized.replace(this.SENSITIVE_PATTERNS.creditCard, '[КАРТА СКРИТА]');

    // استبدال أرقام الهاتف
    sanitized = sanitized.replace(this.SENSITIVE_PATTERNS.phoneNumber, '[ТЕЛ. СКРИТ]');

    // استبدال البريد الإلكتروني
    sanitized = sanitized.replace(this.SENSITIVE_PATTERNS.email, '[EMAIL СКРИТ]');

    // استبدال كلمات المرور
    sanitized = sanitized.replace(this.SENSITIVE_PATTERNS.password, '[ПАРОЛА СКРИТА]');

    return sanitized;
  }

  // ================ Pattern Detection ================

  /**
   * كشف الأنماط غير العادية
   */
  private detectUnusualPattern(
    requests: Array<{ timestamp: number; success: boolean; content: string }>
  ): boolean {
    if (requests.length < 5) return false;

    // فحص الطلبات المتطابقة
    const contentSet = new Set(requests.map(r => r.content));
    if (contentSet.size === 1 && requests.length > 10) {
      return true; // نفس المحتوى مُكرر عدة مرات
    }

    // فحص التوزيع الزمني
    const timestamps = requests.map(r => r.timestamp).sort();
    const intervals: number[] = [];
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1]);
    }

    // إذا كانت الفواصل الزمنية متطابقة تماماً (بوت)
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => 
      sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;

    if (variance < 100 && intervals.length > 5) {
      return true; // أتمتة محتملة
    }

    return false;
  }

  /**
   * تحديد نوع سوء الاستخدام
   */
  private determineAbuseType(evidence: string[]): string {
    const evidenceText = evidence.join(' ').toLowerCase();

    if (evidenceText.includes('заявки за минута')) {
      return 'rate_limit_abuse';
    }

    if (evidenceText.includes('чувствителни данни')) {
      return 'sensitive_data_exposure';
    }

    if (evidenceText.includes('подозрително съдържание')) {
      return 'malicious_content';
    }

    if (evidenceText.includes('необичаен модел')) {
      return 'automation_detected';
    }

    return 'general_abuse';
  }

  // ================ Event Logging ================

  /**
   * تسجيل حدث أمان
   */
  async logSecurityEvent(event: Omit<SecurityEvent, 'id'>): Promise<string> {
    try {
      const eventRef = await addDoc(collection(db, this.EVENTS_COLLECTION), {
        ...event,
        timestamp: Timestamp.fromDate(event.timestamp)
      });

      logger.warn('Security event logged', {
        eventId: eventRef.id,
        userId: event.userId,
        eventType: event.eventType,
        severity: event.severity
      });

      // إشعار المشرفين للأحداث الحرجة
      if (event.severity === 'critical') {
        await this.notifyAdmins(event);
      }

      return eventRef.id;

    } catch (error) {
      logger.error('Failed to log security event', error as Error);
      throw error;
    }
  }

  /**
   * الحصول على أحداث المستخدم
   */
  async getUserSecurityEvents(
    userId: string,
    limit_count: number = 50
  ): Promise<SecurityEvent[]> {
    try {
      const q = query(
        collection(db, this.EVENTS_COLLECTION),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limit_count)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      })) as SecurityEvent[];

    } catch (error) {
      logger.error('Failed to get security events', error as Error);
      return [];
    }
  }

  // ================ Admin Notifications ================

  /**
   * إشعار المشرفين
   */
  private async notifyAdmins(event: Omit<SecurityEvent, 'id'>): Promise<void> {
    try {
      // TODO: إرسال إشعار للمشرفين عبر البريد الإلكتروني أو Slack
      logger.warn('CRITICAL SECURITY EVENT', {
        userId: event.userId,
        eventType: event.eventType,
        description: event.description
      });

      // يمكن إضافة تكامل مع:
      // - SendGrid للبريد الإلكتروني
      // - Slack Webhook
      // - Discord Webhook
      // - SMS عبر Twilio

    } catch (error) {
      logger.error('Failed to notify admins', error as Error);
    }
  }

  // ================ Statistics ================

  /**
   * إحصائيات الأمان
   */
  async getSecurityStats(): Promise<{
    totalEvents: number;
    eventsBySeverity: Record<string, number>;
    suspendedUsers: number;
    topAbuseTypes: Array<{ type: string; count: number }>;
  }> {
    try {
      const eventsSnapshot = await getDocs(collection(db, this.EVENTS_COLLECTION));
      const events = eventsSnapshot.docs.map((doc: any) => doc.data() as SecurityEvent);

      const suspensionsSnapshot = await getDocs(
        collection(db, this.SUSPENSIONS_COLLECTION)
      );

      const eventsBySeverity: Record<string, number> = {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      };

      events.forEach(event => {
        eventsBySeverity[event.severity]++;
      });

      const abuseTypes: Record<string, number> = {};
      events.forEach(event => {
        const type = event.eventType;
        abuseTypes[type] = (abuseTypes[type] || 0) + 1;
      });

      const topAbuseTypes = Object.entries(abuseTypes)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalEvents: events.length,
        eventsBySeverity,
        suspendedUsers: suspensionsSnapshot.size,
        topAbuseTypes
      };

    } catch (error) {
      logger.error('Failed to get security stats', error as Error);
      throw error;
    }
  }
}

// ================ Export ================

export const aiSecurityMonitor = AISecurityMonitor.getInstance();
export default aiSecurityMonitor;
