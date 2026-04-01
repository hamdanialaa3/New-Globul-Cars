// src/services/omnichannel/omnichannel-router.service.ts
// Omnichannel Router — Unified messaging across Viber, WhatsApp, Push, Email, In-App
// Routes notifications to the user's preferred channel

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';
import { viberChannelService } from './viber-channel.service';

// ─── Types ───────────────────────────────────────────────────────────

export type NotificationChannel =
  | 'viber'
  | 'whatsapp'
  | 'push'
  | 'email'
  | 'in_app'
  | 'sms';

export type NotificationType =
  | 'new_message'
  | 'price_drop'
  | 'new_match'
  | 'inspection_ready'
  | 'payment_update'
  | 'offer_received'
  | 'car_sold'
  | 'review_received'
  | 'certification_complete'
  | 'financing_approved'
  | 'insurance_quote';

export interface UserChannelPreferences {
  userId: string;
  preferredChannel: NotificationChannel;
  enabledChannels: NotificationChannel[];
  viberUserId?: string;
  whatsappPhone?: string;
  pushToken?: string;
  email?: string;
  phone?: string;
  quietHours?: { start: string; end: string };
  notificationTypes: Partial<Record<NotificationType, boolean>>;
}

export interface OmnichannelMessage {
  userId: string;
  type: NotificationType;
  title: { en: string; bg: string };
  body: { en: string; bg: string };
  imageUrl?: string;
  actionUrl: string;
  data?: Record<string, unknown>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface DeliveryResult {
  channel: NotificationChannel;
  success: boolean;
  messageId?: string;
  error?: string;
}

// ─── Service ─────────────────────────────────────────────────────────

class OmnichannelRouterService {
  private static instance: OmnichannelRouterService;

  private constructor() {}

  static getInstance(): OmnichannelRouterService {
    if (!OmnichannelRouterService.instance) {
      OmnichannelRouterService.instance = new OmnichannelRouterService();
    }
    return OmnichannelRouterService.instance;
  }

  /**
   * Send a notification via the user's preferred channel with fallback
   */
  async send(message: OmnichannelMessage): Promise<DeliveryResult[]> {
    const results: DeliveryResult[] = [];

    try {
      const prefs = await this.getUserPreferences(message.userId);

      if (!prefs) {
        // Default: in-app only
        const result = await this.sendInApp(message);
        results.push(result);
        return results;
      }

      // Check quiet hours
      if (this.isQuietHours(prefs)) {
        // Queue for later, send in-app silently
        const result = await this.sendInApp(message);
        results.push(result);
        return results;
      }

      // Check if notification type is enabled
      if (prefs.notificationTypes[message.type] === false) {
        return results;
      }

      // Send via preferred channel first
      const primaryResult = await this.sendViaChannel(
        prefs.preferredChannel,
        message,
        prefs
      );
      results.push(primaryResult);

      // If primary fails, try fallback channels
      if (!primaryResult.success) {
        for (const channel of prefs.enabledChannels) {
          if (channel !== prefs.preferredChannel) {
            const fallbackResult = await this.sendViaChannel(
              channel,
              message,
              prefs
            );
            results.push(fallbackResult);
            if (fallbackResult.success) break;
          }
        }
      }

      // Always send in-app as backup
      if (!results.some(r => r.channel === 'in_app')) {
        const inAppResult = await this.sendInApp(message);
        results.push(inAppResult);
      }

      // Log delivery
      await this.logDelivery(message, results);

      return results;
    } catch (error) {
      serviceLogger.error('Omnichannel: Send error', error as Error, {
        userId: message.userId,
      });
      return [{ channel: 'in_app', success: false, error: 'Send failed' }];
    }
  }

  /**
   * Get user's channel preferences
   */
  async getUserPreferences(
    userId: string
  ): Promise<UserChannelPreferences | null> {
    try {
      const prefDoc = await getDoc(doc(db, 'user_channel_preferences', userId));
      if (!prefDoc.exists()) return null;
      return prefDoc.data() as UserChannelPreferences;
    } catch (error) {
      serviceLogger.error(
        'Omnichannel: Error getting preferences',
        error as Error
      );
      return null;
    }
  }

  /**
   * Update user's channel preferences
   */
  async updatePreferences(prefs: UserChannelPreferences): Promise<void> {
    try {
      await setDoc(
        doc(db, 'user_channel_preferences', prefs.userId),
        {
          ...prefs,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      serviceLogger.error(
        'Omnichannel: Error updating preferences',
        error as Error
      );
      throw error;
    }
  }

  // ─── Channel Dispatchers ──────────────────────────────────────────

  private async sendViaChannel(
    channel: NotificationChannel,
    message: OmnichannelMessage,
    prefs: UserChannelPreferences
  ): Promise<DeliveryResult> {
    switch (channel) {
      case 'viber':
        return this.sendViber(message, prefs);
      case 'whatsapp':
        return this.sendWhatsApp(message, prefs);
      case 'push':
        return this.sendPush(message, prefs);
      case 'email':
        return this.sendEmail(message, prefs);
      case 'sms':
        return this.sendSMS(message, prefs);
      case 'in_app':
        return this.sendInApp(message);
      default:
        return { channel, success: false, error: 'Unknown channel' };
    }
  }

  private async sendViber(
    message: OmnichannelMessage,
    prefs: UserChannelPreferences
  ): Promise<DeliveryResult> {
    if (!prefs.viberUserId || !viberChannelService.isAvailable()) {
      return {
        channel: 'viber',
        success: false,
        error: 'Viber not configured',
      };
    }

    const success = await viberChannelService.sendNotification({
      userId: message.userId,
      viberUserId: prefs.viberUserId,
      carId: (message.data?.carId as string) || '',
      type: message.type as any,
      title: message.title.en,
      titleBg: message.title.bg,
      body: message.body.en,
      bodyBg: message.body.bg,
      imageUrl: message.imageUrl,
      actionUrl: message.actionUrl,
    });

    return { channel: 'viber', success };
  }

  private async sendWhatsApp(
    message: OmnichannelMessage,
    prefs: UserChannelPreferences
  ): Promise<DeliveryResult> {
    if (!prefs.whatsappPhone) {
      return {
        channel: 'whatsapp',
        success: false,
        error: 'WhatsApp not configured',
      };
    }

    // WhatsApp Business API integration
    try {
      const waToken = import.meta.env.VITE_WHATSAPP_TOKEN;
      const waPhoneId = import.meta.env.VITE_WHATSAPP_PHONE_ID;

      if (!waToken || !waPhoneId) {
        return {
          channel: 'whatsapp',
          success: false,
          error: 'WhatsApp API not configured',
        };
      }

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${waPhoneId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${waToken}`,
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: prefs.whatsappPhone,
            type: 'text',
            text: {
              body: `${message.title.bg}\n\n${message.body.bg}\n\n${message.actionUrl}`,
            },
          }),
        }
      );

      const result = await response.json();
      return {
        channel: 'whatsapp',
        success: response.ok,
        messageId: result.messages?.[0]?.id,
      };
    } catch (error) {
      return {
        channel: 'whatsapp',
        success: false,
        error: 'WhatsApp send failed',
      };
    }
  }

  private async sendPush(
    message: OmnichannelMessage,
    prefs: UserChannelPreferences
  ): Promise<DeliveryResult> {
    if (!prefs.pushToken) {
      return {
        channel: 'push',
        success: false,
        error: 'Push token not available',
      };
    }

    // Store notification for push service to pick up
    try {
      await setDoc(doc(collection(db, 'push_queue')), {
        userId: message.userId,
        token: prefs.pushToken,
        title: message.title.bg,
        body: message.body.bg,
        imageUrl: message.imageUrl,
        actionUrl: message.actionUrl,
        data: message.data,
        priority: message.priority,
        createdAt: serverTimestamp(),
        sent: false,
      });

      return { channel: 'push', success: true };
    } catch {
      return { channel: 'push', success: false, error: 'Failed to queue push' };
    }
  }

  private async sendEmail(
    message: OmnichannelMessage,
    prefs: UserChannelPreferences
  ): Promise<DeliveryResult> {
    if (!prefs.email) {
      return { channel: 'email', success: false, error: 'Email not available' };
    }

    try {
      // Queue email via Firestore trigger (Firebase Extension: Trigger Email)
      await setDoc(doc(collection(db, 'mail')), {
        to: prefs.email,
        message: {
          subject: message.title.bg,
          text: `${message.body.bg}\n\n${message.actionUrl}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1976D2;">${message.title.bg}</h2>
              ${message.imageUrl ? `<img src="${message.imageUrl}" style="max-width: 100%; border-radius: 8px;" alt="" />` : ''}
              <p style="font-size: 16px; line-height: 1.6;">${message.body.bg}</p>
              <a href="${message.actionUrl}" style="display: inline-block; padding: 12px 24px; background: #1976D2; color: white; text-decoration: none; border-radius: 6px;">Отвори в Koli.one</a>
            </div>
          `,
        },
      });

      return { channel: 'email', success: true };
    } catch {
      return {
        channel: 'email',
        success: false,
        error: 'Failed to queue email',
      };
    }
  }

  private async sendSMS(
    message: OmnichannelMessage,
    prefs: UserChannelPreferences
  ): Promise<DeliveryResult> {
    // SMS only for urgent/high priority notifications
    if (message.priority !== 'urgent' && message.priority !== 'high') {
      return {
        channel: 'sms',
        success: false,
        error: 'SMS only for urgent messages',
      };
    }

    if (!prefs.phone) {
      return { channel: 'sms', success: false, error: 'Phone not available' };
    }

    // Queue SMS for Cloud Function to process
    try {
      await setDoc(doc(collection(db, 'sms_queue')), {
        phone: prefs.phone,
        message: `${message.title.bg}: ${message.body.bg}`,
        priority: message.priority,
        createdAt: serverTimestamp(),
        sent: false,
      });

      return { channel: 'sms', success: true };
    } catch {
      return { channel: 'sms', success: false, error: 'Failed to queue SMS' };
    }
  }

  private async sendInApp(
    message: OmnichannelMessage
  ): Promise<DeliveryResult> {
    try {
      await setDoc(doc(collection(db, 'in_app_notifications')), {
        userId: message.userId,
        type: message.type,
        title: message.title,
        body: message.body,
        imageUrl: message.imageUrl,
        actionUrl: message.actionUrl,
        data: message.data,
        read: false,
        createdAt: serverTimestamp(),
      });

      return { channel: 'in_app', success: true };
    } catch {
      return {
        channel: 'in_app',
        success: false,
        error: 'Failed to store in-app notification',
      };
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────

  private isQuietHours(prefs: UserChannelPreferences): boolean {
    if (!prefs.quietHours) return false;
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;

    const [startH, startM] = prefs.quietHours.start.split(':').map(Number);
    const [endH, endM] = prefs.quietHours.end.split(':').map(Number);
    const startTime = startH * 60 + startM;
    const endTime = endH * 60 + endM;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    }
    // Crosses midnight
    return currentTime >= startTime || currentTime <= endTime;
  }

  private async logDelivery(
    message: OmnichannelMessage,
    results: DeliveryResult[]
  ): Promise<void> {
    try {
      await setDoc(doc(collection(db, 'notification_delivery_log')), {
        userId: message.userId,
        type: message.type,
        results,
        successful: results.some(r => r.success),
        timestamp: serverTimestamp(),
      });
    } catch {
      // Non-critical
    }
  }
}

export const omnichannelRouter = OmnichannelRouterService.getInstance();
