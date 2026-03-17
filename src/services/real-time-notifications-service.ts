// Real-time Notifications Service - نظام الإشعارات الفوري للمالك
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';

export interface Notification {
  id: string;
  type: 'user_activity' | 'system_alert' | 'security_breach' | 'content_report' | 'revenue_update';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  read: boolean;
  data?: any;
  source: string;
  actionRequired: boolean;
  actionUrl?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  notificationTypes: {
    user_activity: boolean;
    system_alert: boolean;
    security_breach: boolean;
    content_report: boolean;
    revenue_update: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily';
}

export class RealTimeNotificationsService {
  private static instance: RealTimeNotificationsService;
  private notificationCallbacks: Array<(notification: Notification) => void> = [];
  private settings: NotificationSettings = {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    notificationTypes: {
      user_activity: true,
      system_alert: true,
      security_breach: true,
      content_report: true,
      revenue_update: true
    },
    frequency: 'immediate'
  };

  public static getInstance(): RealTimeNotificationsService {
    if (!RealTimeNotificationsService.instance) {
      RealTimeNotificationsService.instance = new RealTimeNotificationsService();
    }
    return RealTimeNotificationsService.instance;
  }

  // إنشاء إشعار جديد
  public async createNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<string> {
    try {
      const notificationRef = await addDoc(collection(db, 'admin_notifications'), {
        ...notification,
        timestamp: serverTimestamp(),
        read: false
      });

      // إرسال الإشعار الفوري
      await this.sendImmediateNotification({
        id: notificationRef.id,
        ...notification,
        timestamp: new Date(),
        read: false
      });

      return notificationRef.id;
    } catch (error) {
      serviceLogger.error('Error creating notification', error as Error, { type: notification.type });
      throw error;
    }
  }

  // إشعار نشاط المستخدم
  public async notifyUserActivity(activity: string, userId: string, userEmail: string): Promise<void> {
    await this.createNotification({
      type: 'user_activity',
      title: 'User Activity Detected',
      message: `${activity} by user ${userEmail}`,
      priority: 'medium',
      source: 'user_monitor',
      actionRequired: false,
      data: { userId, userEmail, activity }
    });
  }

  // إشعار تنبيه النظام
  public async notifySystemAlert(alert: string, severity: 'low' | 'medium' | 'high' | 'critical'): Promise<void> {
    await this.createNotification({
      type: 'system_alert',
      title: 'System Alert',
      message: alert,
      priority: severity,
      source: 'system_monitor',
      actionRequired: severity === 'critical' || severity === 'high',
      data: { alert, severity }
    });
  }

  // إشعار خرق أمني
  public async notifySecurityBreach(breach: string, details: any): Promise<void> {
    await this.createNotification({
      type: 'security_breach',
      title: 'Security Breach Detected',
      message: breach,
      priority: 'critical',
      source: 'security_monitor',
      actionRequired: true,
      data: { breach, details }
    });
  }

  // إشعار تقرير المحتوى
  public async notifyContentReport(reportType: string, contentId: string, reporterId: string): Promise<void> {
    await this.createNotification({
      type: 'content_report',
      title: 'Content Reported',
      message: `${reportType} content reported by user`,
      priority: 'high',
      source: 'content_moderator',
      actionRequired: true,
      actionUrl: `/admin/content/${contentId}`,
      data: { reportType, contentId, reporterId }
    });
  }

  // إشعار تحديث الإيرادات
  public async notifyRevenueUpdate(amount: number, change: number): Promise<void> {
    await this.createNotification({
      type: 'revenue_update',
      title: 'Revenue Update',
      message: `Revenue updated: $${amount} (${change > 0 ? '+' : ''}${change}%)`,
      priority: 'medium',
      source: 'revenue_tracker',
      actionRequired: false,
      data: { amount, change }
    });
  }

  // الحصول على الإشعارات
  public async getNotifications(limitCount: number = 50): Promise<Notification[]> {
    try {
      const notificationsRef = collection(db, 'admin_notifications');
      const q = query(
        notificationsRef,
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as Notification));
    } catch (error) {
      serviceLogger.error('Error getting notifications', error as Error, { limitCount });
      return [];
    }
  }

  // الاشتراك في الإشعارات الفورية
  public subscribeToNotifications(callback: (notification: Notification) => void): () => void {
    this.notificationCallbacks.push(callback);

    let isActive = true; // Prevent callback execution after unsubscribe

    const unsubscribe = onSnapshot(
      query(collection(db, 'admin_notifications'), orderBy('timestamp', 'desc'), limit(10)),
      (snapshot) => {
        if (!isActive) return; // Check before processing

        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const notification = {
              id: change.doc.id,
              ...change.doc.data(),
              timestamp: change.doc.data().timestamp?.toDate() || new Date()
            } as Notification;

            // إرسال الإشعار للمشتركين
            this.notificationCallbacks.forEach(cb => cb(notification));
          }
        });
      },
      (error) => {
        // Gracefully handle permission-denied (non-admin user)
        if ((error as any).code !== 'permission-denied') {
          serviceLogger.error('Admin notifications listener error:', error as Error);
        }
      }
    );

    return () => {
      isActive = false; // Disable callback first
      unsubscribe();
      const index = this.notificationCallbacks.indexOf(callback);
      if (index > -1) {
        this.notificationCallbacks.splice(index, 1);
      }
    };
  }

  // تمييز الإشعار كمقروء
  public async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'admin_notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
    } catch (error) {
      serviceLogger.error('Error marking notification as read', error as Error, { notificationId });
    }
  }

  // حذف الإشعار
  public async deleteNotification(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'admin_notifications', notificationId);
      await deleteDoc(notificationRef);
    } catch (error) {
      serviceLogger.error('Error deleting notification', error as Error, { notificationId });
    }
  }

  // حذف جميع الإشعارات المقروءة
  public async clearReadNotifications(): Promise<void> {
    try {
      const notificationsRef = collection(db, 'admin_notifications');
      const q = query(notificationsRef, where('read', '==', true));
      const snapshot = await getDocs(q);
      
      const deletePromises = snapshot.docs.map((doc: any) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      serviceLogger.error('Error clearing read notifications', error as Error);
    }
  }

  // إرسال الإشعار الفوري
  private async sendImmediateNotification(notification: Notification): Promise<void> {
    // إرسال إشعار المتصفح
    if (this.settings.pushNotifications && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: notification.id,
          requireInteraction: notification.priority === 'critical'
        });
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico'
          });
        }
      }
    }

    // إرسال إشعار البريد الإلكتروني (محاكاة)
    if (this.settings.emailNotifications) {
      serviceLogger.info('Email notification sent', { title: notification.title, type: notification.type });
    }

    // إرسال إشعار SMS (محاكاة)
    if (this.settings.smsNotifications) {
      serviceLogger.info('SMS notification sent', { title: notification.title, type: notification.type });
    }
  }

  // تحديث إعدادات الإشعارات
  public updateSettings(settings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  // الحصول على إعدادات الإشعارات
  public getSettings(): NotificationSettings {
    return this.settings;
  }

  // إحصائيات الإشعارات
  public async getNotificationStats(): Promise<{
    total: number;
    unread: number;
    byType: { [key: string]: number };
    byPriority: { [key: string]: number };
  }> {
    try {
      const notificationsRef = collection(db, 'admin_notifications');
      const snapshot = await getDocs(notificationsRef);
      
      const notifications = snapshot.docs.map((doc: any) => doc.data());
      
      const stats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.read).length,
        byType: {} as { [key: string]: number },
        byPriority: {} as { [key: string]: number }
      };

      notifications.forEach(notification => {
        // إحصائيات النوع
        stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
        
        // إحصائيات الأولوية
        stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
      });

      return stats;
    } catch (error) {
      serviceLogger.error('Error getting notification stats', error as Error);
      return {
        total: 0,
        unread: 0,
        byType: {},
        byPriority: {}
      };
    }
  }
}

export const realTimeNotificationsService = RealTimeNotificationsService.getInstance();
