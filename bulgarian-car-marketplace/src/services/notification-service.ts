import { collection, doc, setDoc, updateDoc, getDoc, query, where, getDocs, orderBy, limit, Timestamp, onSnapshot } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

export interface Notification {
  id?: string;
  userId: string;
  type: 'accident' | 'maintenance' | 'insurance' | 'sale_offer' | 'market_update' | 'system' | 'promotion';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  data?: any; // بيانات إضافية
  read: boolean;
  readAt?: Timestamp;
  expiresAt?: Timestamp;
  actions?: NotificationAction[];
  timestamp: Timestamp;
  source?: string; // مصدر الإشعار
}

export interface NotificationAction {
  label: string;
  action: string;
  data?: any;
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  categories: {
    accident: boolean;
    maintenance: boolean;
    insurance: boolean;
    sale_offer: boolean;
    market_update: boolean;
    system: boolean;
    promotion: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
  };
  lastUpdated: Timestamp;
}

export interface NotificationTemplate {
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  titleTemplate: string;
  messageTemplate: string;
  actions?: NotificationAction[];
  expiresIn?: number; // ساعات
}

export class ComprehensiveNotificationService {
  private db = getFirestore();
  private readonly BULGARIAN_TIMEZONE = 'Europe/Sofia';

  // قوالب الإشعارات
  private readonly TEMPLATES: { [key: string]: NotificationTemplate } = {
    accident_detected: {
      type: 'accident',
      priority: 'critical',
      titleTemplate: '🚨 حادث مكتشف تلقائياً!',
      messageTemplate: 'تم كشف حادث في سيارتك {{carInfo}} في الموقع: {{location}}. تم إرسال المساعدة.',
      actions: [
        { label: 'عرض التفاصيل', action: 'view_accident' },
        { label: 'اتصل بالطوارئ', action: 'call_emergency' }
      ],
      expiresIn: 24
    },
    maintenance_due: {
      type: 'maintenance',
      priority: 'high',
      titleTemplate: '🔧 موعد الصيانة',
      messageTemplate: 'سيارتك {{carInfo}} تحتاج إلى صيانة: {{issues}}. الموعد المقترح: {{date}}.',
      actions: [
        { label: 'احجز موعداً', action: 'book_service' },
        { label: 'عرض التفاصيل', action: 'view_maintenance' }
      ],
      expiresIn: 168 // أسبوع
    },
    insurance_adjustment: {
      type: 'insurance',
      priority: 'medium',
      titleTemplate: '💰 تحديث قسط التأمين',
      messageTemplate: 'تم تعديل قسط التأمين لسيارتك {{carInfo}} إلى {{newPremium}} EUR ({{change}}%).',
      actions: [
        { label: 'عرض التفاصيل', action: 'view_insurance' }
      ],
      expiresIn: 72
    },
    sale_offer_received: {
      type: 'sale_offer',
      priority: 'high',
      titleTemplate: '💰 عرض شراء جديد!',
      messageTemplate: '{{buyerName}} يقدم عرض شراء بقيمة {{amount}} EUR لسيارتك {{carInfo}}.',
      actions: [
        { label: 'قبول العرض', action: 'accept_offer' },
        { label: 'رفض العرض', action: 'decline_offer' },
        { label: 'التفاوض', action: 'counter_offer' }
      ],
      expiresIn: 48
    },
    market_price_update: {
      type: 'market_update',
      priority: 'low',
      titleTemplate: '📊 تحديث أسعار السوق',
      messageTemplate: 'قيمة سيارتك {{carInfo}} في السوق الحالي: {{marketValue}} EUR ({{change}}%).',
      actions: [
        { label: 'عرض التحليل', action: 'view_analysis' }
      ],
      expiresIn: 24
    },
    system_maintenance: {
      type: 'system',
      priority: 'medium',
      titleTemplate: '⚙️ صيانة النظام',
      messageTemplate: 'سيتم إجراء صيانة على النظام في {{time}}. قد يتأثر الأداء مؤقتاً.',
      expiresIn: 2
    },
    promotional_offer: {
      type: 'promotion',
      priority: 'low',
      titleTemplate: '🎉 عرض خاص!',
      messageTemplate: '{{message}}',
      actions: [
        { label: 'استفد من العرض', action: 'claim_offer' }
      ],
      expiresIn: 168
    }
  };

  /**
   * إرسال إشعار جديد
   */
  async sendNotification(notification: Omit<Notification, 'id' | 'timestamp'>): Promise<string> {
    try {
      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const notificationData: Notification = {
        ...notification,
        id: notificationId,
        timestamp: Timestamp.now()
      };

      // التحقق من تفضيلات المستخدم
      const shouldSend = await this.shouldSendNotification(notification.userId, notification);
      if (!shouldSend) {
        console.log(`تم تجاهل الإشعار للمستخدم ${notification.userId} حسب تفضيلاته`);
        return notificationId;
      }

      await setDoc(doc(this.db, 'notifications', notificationId), notificationData);

      // إرسال الإشعارات عبر القنوات المختلفة
      await this.sendViaChannels(notificationData);

      console.log(`تم إرسال إشعار: ${notification.title} للمستخدم ${notification.userId}`);

      return notificationId;

    } catch (error) {
      console.error('خطأ في إرسال الإشعار:', error);
      throw new Error('فشل في إرسال الإشعار');
    }
  }

  /**
   * إرسال إشعار باستخدام قالب
   */
  async sendTemplatedNotification(
    userId: string,
    templateKey: string,
    templateData: { [key: string]: string },
    customData?: any
  ): Promise<string> {
    try {
      const template = this.TEMPLATES[templateKey];
      if (!template) {
        throw new Error(`قالب الإشعار غير موجود: ${templateKey}`);
      }

      // استبدال المتغيرات في القالب
      const title = this.interpolateTemplate(template.titleTemplate, templateData);
      const message = this.interpolateTemplate(template.messageTemplate, templateData);

      const notification: Omit<Notification, 'id' | 'timestamp'> = {
        userId,
        type: template.type as any,
        priority: template.priority,
        title,
        message,
        data: customData,
        read: false,
        actions: template.actions,
        expiresAt: template.expiresIn ?
          Timestamp.fromDate(new Date(Date.now() + template.expiresIn * 60 * 60 * 1000)) :
          undefined,
        source: 'system'
      };

      return await this.sendNotification(notification);

    } catch (error) {
      console.error('خطأ في إرسال الإشعار المُعد:', error);
      throw error;
    }
  }

  /**
   * الحصول على إشعارات المستخدم
   */
  async getUserNotifications(
    userId: string,
    options: {
      unreadOnly?: boolean;
      limit?: number;
      type?: string;
    } = {}
  ): Promise<Notification[]> {
    try {
      let queryRef = query(
        collection(this.db, 'notifications'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      if (options.unreadOnly) {
        queryRef = query(queryRef, where('read', '==', false));
      }

      if (options.type) {
        queryRef = query(queryRef, where('type', '==', options.type));
      }

      if (options.limit) {
        queryRef = query(queryRef, limit(options.limit));
      }

      const snapshot = await getDocs(queryRef);
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Notification);

    } catch (error) {
      console.error('خطأ في الحصول على إشعارات المستخدم:', error);
      return [];
    }
  }

  /**
   * تحديد إشعار كمقروء
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      const notificationRef = doc(this.db, 'notifications', notificationId);
      const notificationDoc = await getDoc(notificationRef);

      if (!notificationDoc.exists()) {
        throw new Error('الإشعار غير موجود');
      }

      const notification = notificationDoc.data();
      if (notification.userId !== userId) {
        throw new Error('غير مصرح لك بتعديل هذا الإشعار');
      }

      await updateDoc(notificationRef, {
        read: true,
        readAt: Timestamp.now()
      });

    } catch (error) {
      console.error('خطأ في تحديد الإشعار كمقروء:', error);
      throw error;
    }
  }

  /**
   * حذف إشعار
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      const notificationRef = doc(this.db, 'notifications', notificationId);
      const notificationDoc = await getDoc(notificationRef);

      if (!notificationDoc.exists()) {
        throw new Error('الإشعار غير موجود');
      }

      const notification = notificationDoc.data();
      if (notification.userId !== userId) {
        throw new Error('غير مصرح لك بحذف هذا الإشعار');
      }

      await updateDoc(notificationRef, {
        expiresAt: Timestamp.now() // سيتم حذفه بواسطة التنظيف
      });

    } catch (error) {
      console.error('خطأ في حذف الإشعار:', error);
      throw error;
    }
  }

  /**
   * تحديث تفضيلات الإشعارات
   */
  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    try {
      const prefsRef = doc(this.db, 'notificationPreferences', userId);
      await setDoc(prefsRef, {
        ...preferences,
        userId,
        lastUpdated: Timestamp.now()
      }, { merge: true });

    } catch (error) {
      console.error('خطأ في تحديث تفضيلات الإشعارات:', error);
      throw error;
    }
  }

  /**
   * الحصول على تفضيلات الإشعارات
   */
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const prefsDoc = await getDoc(doc(this.db, 'notificationPreferences', userId));

      if (prefsDoc.exists()) {
        return prefsDoc.data() as NotificationPreferences;
      }

      // إرجاع التفضيلات الافتراضية
      return {
        userId,
        email: true,
        push: true,
        sms: false,
        categories: {
          accident: true,
          maintenance: true,
          insurance: true,
          sale_offer: true,
          market_update: false,
          system: true,
          promotion: false
        },
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        },
        lastUpdated: Timestamp.now()
      };

    } catch (error) {
      console.error('خطأ في الحصول على تفضيلات الإشعارات:', error);
      return null;
    }
  }

  /**
   * إرسال إشعار طوارئ للحوادث
   */
  async sendAccidentAlert(
    userId: string,
    vin: string,
    location: { latitude: number; longitude: number; address?: string },
    severity: 'minor' | 'moderate' | 'major'
  ): Promise<void> {
    try {
      const carInfo = await this.getCarInfo(vin);
      const locationStr = location.address || `${location.latitude}, ${location.longitude}`;

      await this.sendTemplatedNotification(
        userId,
        'accident_detected',
        {
          carInfo,
          location: locationStr
        },
        {
          vin,
          location,
          severity,
          timestamp: Timestamp.now()
        }
      );

      // إشعار الطوارئ إذا كان الحادث خطيراً
      if (severity === 'major') {
        await this.notifyEmergencyServices(location, severity);
      }

    } catch (error) {
      console.error('خطأ في إرسال إشعار الحادث:', error);
    }
  }

  /**
   * إرسال إشعار صيانة
   */
  async sendMaintenanceAlert(
    userId: string,
    vin: string,
    issues: string[],
    recommendedDate: Date
  ): Promise<void> {
    try {
      const carInfo = await this.getCarInfo(vin);
      const dateStr = recommendedDate.toLocaleDateString('bg-BG');

      await this.sendTemplatedNotification(
        userId,
        'maintenance_due',
        {
          carInfo,
          issues: issues.join(', '),
          date: dateStr
        },
        {
          vin,
          issues,
          recommendedDate: Timestamp.fromDate(recommendedDate)
        }
      );

    } catch (error) {
      console.error('خطأ في إرسال إشعار الصيانة:', error);
    }
  }

  /**
   * إرسال إشعار تحديث التأمين
   */
  async sendInsuranceUpdate(
    userId: string,
    vin: string,
    oldPremium: number,
    newPremium: number
  ): Promise<void> {
    try {
      const carInfo = await this.getCarInfo(vin);
      const change = ((newPremium - oldPremium) / oldPremium * 100).toFixed(1);
      const changeStr = `${change}%`;

      await this.sendTemplatedNotification(
        userId,
        'insurance_adjustment',
        {
          carInfo,
          newPremium: newPremium.toString(),
          change: changeStr
        },
        {
          vin,
          oldPremium,
          newPremium,
          change: parseFloat(change)
        }
      );

    } catch (error) {
      console.error('خطأ في إرسال إشعار التأمين:', error);
    }
  }

  /**
   * إرسال إشعار عرض شراء
   */
  async sendSaleOfferNotification(
    userId: string,
    vin: string,
    buyerName: string,
    amount: number,
    offerId: string
  ): Promise<void> {
    try {
      const carInfo = await this.getCarInfo(vin);

      await this.sendTemplatedNotification(
        userId,
        'sale_offer_received',
        {
          buyerName,
          amount: amount.toString(),
          carInfo
        },
        {
          vin,
          buyerName,
          amount,
          offerId
        }
      );

    } catch (error) {
      console.error('خطأ في إرسال إشعار عرض الشراء:', error);
    }
  }

  /**
   * إرسال تحديث أسعار السوق
   */
  async sendMarketUpdate(
    userId: string,
    vin: string,
    marketValue: number,
    changePercent: number
  ): Promise<void> {
    try {
      const carInfo = await this.getCarInfo(vin);
      const changeStr = `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%`;

      await this.sendTemplatedNotification(
        userId,
        'market_price_update',
        {
          carInfo,
          marketValue: marketValue.toString(),
          change: changeStr
        },
        {
          vin,
          marketValue,
          changePercent
        }
      );

    } catch (error) {
      console.error('خطأ في إرسال تحديث السوق:', error);
    }
  }

  /**
   * التحقق من إمكانية إرسال الإشعار
   */
  private async shouldSendNotification(userId: string, notification: Notification): Promise<boolean> {
    try {
      const preferences = await this.getNotificationPreferences(userId);
      if (!preferences) return true; // إرسال افتراضي

      // التحقق من فئة الإشعار
      if (!preferences.categories[notification.type]) {
        return false;
      }

      // التحقق من ساعات الهدوء
      if (preferences.quietHours.enabled) {
        const now = new Date();
        const currentTime = now.getHours() * 100 + now.getMinutes();
        const startTime = this.parseTime(preferences.quietHours.start);
        const endTime = this.parseTime(preferences.quietHours.end);

        if (this.isTimeInRange(currentTime, startTime, endTime)) {
          // في ساعات الهدوء، فقط الإشعارات الحرجة
          return notification.priority === 'critical';
        }
      }

      return true;

    } catch (error) {
      console.error('خطأ في التحقق من إمكانية إرسال الإشعار:', error);
      return true; // إرسال في حالة الخطأ
    }
  }

  /**
   * إرسال الإشعار عبر القنوات المختلفة
   */
  private async sendViaChannels(notification: Notification): Promise<void> {
    try {
      const preferences = await this.getNotificationPreferences(notification.userId);

      if (preferences?.push) {
        await this.sendPushNotification(notification);
      }

      if (preferences?.email) {
        await this.sendEmailNotification(notification);
      }

      if (preferences?.sms && notification.priority === 'critical') {
        await this.sendSMSNotification(notification);
      }

    } catch (error) {
      console.error('خطأ في إرسال الإشعار عبر القنوات:', error);
    }
  }

  /**
   * إرسال إشعار Push
   */
  private async sendPushNotification(notification: Notification): Promise<void> {
    try {
      // في الإنتاج، سيتم استخدام FCM أو خدمة Push أخرى
      console.log(`إرسال Push للمستخدم ${notification.userId}: ${notification.title}`);

    } catch (error) {
      console.error('خطأ في إرسال Push:', error);
    }
  }

  /**
   * إرسال إشعار بريد إلكتروني
   */
  private async sendEmailNotification(notification: Notification): Promise<void> {
    try {
      // في الإنتاج، سيتم استخدام SendGrid أو خدمة بريد إلكتروني
      console.log(`إرسال بريد إلكتروني للمستخدم ${notification.userId}: ${notification.title}`);

    } catch (error) {
      console.error('خطأ في إرسال البريد الإلكتروني:', error);
    }
  }

  /**
   * إرسال إشعار SMS
   */
  private async sendSMSNotification(notification: Notification): Promise<void> {
    try {
      // في الإنتاج، سيتم استخدام Twilio أو خدمة SMS
      console.log(`إرسال SMS للمستخدم ${notification.userId}: ${notification.title}`);

    } catch (error) {
      console.error('خطأ في إرسال SMS:', error);
    }
  }

  /**
   * إشعار خدمات الطوارئ
   */
  private async notifyEmergencyServices(
    location: { latitude: number; longitude: number },
    severity: string
  ): Promise<void> {
    try {
      // في الإنتاج، سيتم إرسال إشعار لخدمات الطوارئ المحلية
      console.log(`إرسال إشعار لخدمات الطوارئ: ${severity} في ${location.latitude}, ${location.longitude}`);

    } catch (error) {
      console.error('خطأ في إشعار خدمات الطوارئ:', error);
    }
  }

  /**
   * الحصول على معلومات السيارة
   */
  private async getCarInfo(vin: string): Promise<string> {
    try {
      const carDoc = await getDoc(doc(this.db, 'cars', vin));
      if (carDoc.exists()) {
        const car = carDoc.data();
        return `${car.make} ${car.model} (${car.year})`;
      }
      return `VIN: ${vin}`;
    } catch (error) {
      console.error('خطأ في الحصول على معلومات السيارة:', error);
      return `VIN: ${vin}`;
    }
  }

  /**
   * استبدال المتغيرات في القالب
   */
  private interpolateTemplate(template: string, data: { [key: string]: string }): string {
    let result = template;
    Object.entries(data).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return result;
  }

  /**
   * تحليل الوقت من سلسلة
   */
  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 100 + minutes;
  }

  /**
   * التحقق من وجود الوقت في النطاق
   */
  private isTimeInRange(current: number, start: number, end: number): boolean {
    if (start <= end) {
      return current >= start && current <= end;
    } else {
      // يمتد النطاق إلى اليوم التالي
      return current >= start || current <= end;
    }
  }

  /**
   * إنشاء مستمع للإشعارات الجديدة
   */
  onNewNotifications(userId: string, callback: (notifications: Notification[]) => void): () => void {
    const q = query(
      collection(this.db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }) as Notification);
      callback(notifications);
    });

    return unsubscribe;
  }

  /**
   * تنظيف الإشعارات المنتهية الصلاحية
   */
  async cleanupExpiredNotifications(): Promise<void> {
    try {
      const now = Timestamp.now();
      const expiredQuery = query(
        collection(this.db, 'notifications'),
        where('expiresAt', '<', now)
      );

      const snapshot = await getDocs(expiredQuery);

      for (const doc of snapshot.docs) {
        await updateDoc(doc.ref, {
          read: true,
          expired: true
        });
      }

      console.log(`تم تنظيف ${snapshot.size} إشعار منتهي الصلاحية`);

    } catch (error) {
      console.error('خطأ في تنظيف الإشعارات المنتهية:', error);
    }
  }
}

export const notificationService = new ComprehensiveNotificationService();