// src/services/omnichannel/viber-channel.service.ts
// Viber Business API Channel — Bulgaria's #1 messaging app (90%+ penetration)
// Handles bot registration, webhook processing, message sending, and AI chatbot

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';

// ─── Types ───────────────────────────────────────────────────────────

export type ViberMessageType =
  | 'text'
  | 'picture'
  | 'video'
  | 'file'
  | 'location'
  | 'rich_media'
  | 'keyboard';

export interface ViberUser {
  id: string;
  name: string;
  avatar?: string;
  language: string;
  country: string;
  apiVersion: number;
}

export interface ViberMessage {
  type: ViberMessageType;
  text?: string;
  media?: string;
  thumbnail?: string;
  fileName?: string;
  fileSize?: number;
  location?: { lat: number; lon: number };
}

export interface ViberWebhookEvent {
  event:
    | 'delivered'
    | 'seen'
    | 'failed'
    | 'subscribed'
    | 'unsubscribed'
    | 'conversation_started'
    | 'message';
  timestamp: number;
  messageToken?: number;
  sender?: ViberUser;
  message?: ViberMessage;
  userId?: string;
}

export interface ViberRichMedia {
  type: 'rich_media';
  buttonGroupColumns: number;
  buttonGroupRows: number;
  bgColor: string;
  buttons: ViberButton[];
}

export interface ViberButton {
  columns: number;
  rows: number;
  actionType: 'open-url' | 'reply' | 'none';
  actionBody: string;
  text?: string;
  textSize?: 'small' | 'regular' | 'large';
  textVAlign?: 'top' | 'middle' | 'bottom';
  textHAlign?: 'left' | 'center' | 'right';
  image?: string;
  bgColor?: string;
}

export interface ViberCarNotification {
  userId: string;
  viberUserId: string;
  carId: string;
  type:
    | 'new_message'
    | 'price_drop'
    | 'new_match'
    | 'inspection_ready'
    | 'payment_update';
  title: string;
  titleBg: string;
  body: string;
  bodyBg: string;
  imageUrl?: string;
  actionUrl: string;
  sentAt: Date;
  delivered: boolean;
  seen: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────

const VIBER_API_BASE = 'https://chatapi.viber.com/pa';

// ─── Service ─────────────────────────────────────────────────────────

class ViberChannelService {
  private static instance: ViberChannelService;
  private botToken: string | null = null;
  private botName = 'Koli.one';
  private botAvatar = 'https://koli.one/images/koli-bot-avatar.png';

  private constructor() {
    this.botToken = import.meta.env.VITE_VIBER_BOT_TOKEN || null;
  }

  static getInstance(): ViberChannelService {
    if (!ViberChannelService.instance) {
      ViberChannelService.instance = new ViberChannelService();
    }
    return ViberChannelService.instance;
  }

  /**
   * Check if Viber integration is available
   */
  isAvailable(): boolean {
    return !!this.botToken;
  }

  /**
   * Send a text message to a Viber user
   */
  async sendMessage(
    viberUserId: string,
    text: string,
    keyboard?: ViberButton[]
  ): Promise<boolean> {
    try {
      if (!this.botToken) {
        serviceLogger.warn('Viber: Bot token not configured');
        return false;
      }

      const payload: Record<string, unknown> = {
        receiver: viberUserId,
        min_api_version: 7,
        sender: {
          name: this.botName,
          avatar: this.botAvatar,
        },
        type: 'text',
        text,
      };

      if (keyboard?.length) {
        payload.keyboard = {
          type: 'keyboard',
          defaultHeight: false,
          buttons: keyboard,
        };
      }

      const response = await fetch(`${VIBER_API_BASE}/send_message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Viber-Auth-Token': this.botToken,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status !== 0) {
        serviceLogger.error('Viber: Send failed', undefined, {
          status: result.status,
          statusMessage: result.status_message,
        });
        return false;
      }

      return true;
    } catch (error) {
      serviceLogger.error('Viber: Error sending message', error as Error);
      return false;
    }
  }

  /**
   * Send a car listing card via Viber Rich Media
   */
  async sendCarCard(
    viberUserId: string,
    car: {
      id: string;
      title: string;
      price: number;
      imageUrl: string;
      year: number;
      mileage: number;
      fuel: string;
      city: string;
    }
  ): Promise<boolean> {
    try {
      if (!this.botToken) return false;

      const richMedia: ViberRichMedia = {
        type: 'rich_media',
        buttonGroupColumns: 6,
        buttonGroupRows: 7,
        bgColor: '#FFFFFF',
        buttons: [
          // Car image
          {
            columns: 6,
            rows: 3,
            actionType: 'open-url',
            actionBody: `https://koli.one/car/${car.id}`,
            image: car.imageUrl,
          },
          // Car title
          {
            columns: 6,
            rows: 1,
            actionType: 'none',
            actionBody: '',
            text: `<b>${car.title}</b>`,
            textSize: 'regular',
            textVAlign: 'middle',
            textHAlign: 'left',
          },
          // Details
          {
            columns: 6,
            rows: 1,
            actionType: 'none',
            actionBody: '',
            text: `${car.year} · ${car.mileage.toLocaleString()} км · ${car.fuel} · ${car.city}`,
            textSize: 'small',
            textVAlign: 'middle',
            textHAlign: 'left',
            bgColor: '#F5F5F5',
          },
          // Price
          {
            columns: 3,
            rows: 1,
            actionType: 'none',
            actionBody: '',
            text: `<b>€${car.price.toLocaleString()}</b>`,
            textSize: 'large',
            textVAlign: 'middle',
            textHAlign: 'left',
            bgColor: '#E8F5E9',
          },
          // View button
          {
            columns: 3,
            rows: 1,
            actionType: 'open-url',
            actionBody: `https://koli.one/car/${car.id}`,
            text: 'Виж обявата →',
            textSize: 'regular',
            textVAlign: 'middle',
            textHAlign: 'center',
            bgColor: '#1976D2',
          },
        ],
      };

      const response = await fetch(`${VIBER_API_BASE}/send_message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Viber-Auth-Token': this.botToken,
        },
        body: JSON.stringify({
          receiver: viberUserId,
          min_api_version: 7,
          sender: { name: this.botName, avatar: this.botAvatar },
          type: 'rich_media',
          rich_media: richMedia,
        }),
      });

      const result = await response.json();
      return result.status === 0;
    } catch (error) {
      serviceLogger.error('Viber: Error sending car card', error as Error);
      return false;
    }
  }

  /**
   * Send a notification to a Viber user
   */
  async sendNotification(
    notification: Omit<ViberCarNotification, 'sentAt' | 'delivered' | 'seen'>
  ): Promise<boolean> {
    try {
      const sent = await this.sendMessage(
        notification.viberUserId,
        `${notification.titleBg}\n\n${notification.bodyBg}`,
        [
          {
            columns: 6,
            rows: 1,
            actionType: 'open-url',
            actionBody: notification.actionUrl,
            text: 'Отвори в Koli.one →',
            textSize: 'regular',
            textVAlign: 'middle',
            textHAlign: 'center',
            bgColor: '#1976D2',
          },
        ]
      );

      if (sent) {
        await setDoc(doc(collection(db, 'viber_notifications')), {
          ...notification,
          sentAt: serverTimestamp(),
          delivered: true,
          seen: false,
        });
      }

      return sent;
    } catch (error) {
      serviceLogger.error('Viber: Error sending notification', error as Error);
      return false;
    }
  }

  /**
   * Process incoming Viber webhook event
   */
  async processWebhook(event: ViberWebhookEvent): Promise<void> {
    try {
      serviceLogger.info('Viber: Webhook received', { eventType: event.event });

      switch (event.event) {
        case 'conversation_started':
          if (event.sender) {
            await this.handleConversationStarted(event.sender);
          }
          break;
        case 'message':
          if (event.sender && event.message) {
            await this.handleIncomingMessage(event.sender, event.message);
          }
          break;
        case 'subscribed':
          if (event.sender) {
            await this.handleSubscribed(event.sender);
          }
          break;
        case 'unsubscribed':
          if (event.userId) {
            await this.handleUnsubscribed(event.userId);
          }
          break;
      }
    } catch (error) {
      serviceLogger.error('Viber: Webhook processing error', error as Error);
    }
  }

  /**
   * Link a Viber user to a Koli user account
   */
  async linkViberAccount(userId: string, viberUserId: string): Promise<void> {
    try {
      await setDoc(
        doc(db, 'viber_links', userId),
        {
          userId,
          viberUserId,
          linkedAt: serverTimestamp(),
          isActive: true,
          notificationsEnabled: true,
        },
        { merge: true }
      );

      serviceLogger.info('Viber: Account linked', { userId, viberUserId });
    } catch (error) {
      serviceLogger.error('Viber: Error linking account', error as Error);
      throw error;
    }
  }

  /**
   * Get Viber user ID for a Koli user
   */
  async getViberUserId(userId: string): Promise<string | null> {
    try {
      const linkDoc = await getDoc(doc(db, 'viber_links', userId));
      if (!linkDoc.exists()) return null;
      return linkDoc.data().viberUserId || null;
    } catch (error) {
      serviceLogger.error('Viber: Error getting linked user', error as Error);
      return null;
    }
  }

  // ─── Event Handlers ───────────────────────────────────────────────

  private async handleConversationStarted(sender: ViberUser): Promise<void> {
    await this.sendMessage(
      sender.id,
      '🚗 Добре дошли в Koli.one!\n\n' +
        'Аз съм вашият виртуален асистент. Мога да ви помогна с:\n\n' +
        '🔍 Търсене на автомобили\n' +
        '💰 Оценка на цена\n' +
        '📋 Статус на обявата\n' +
        '💬 Съобщения от купувачи\n\n' +
        'Просто напишете какво търсите!',
      [
        {
          columns: 3,
          rows: 1,
          actionType: 'reply',
          actionBody: 'Търси кола',
          text: '🔍 Търси кола',
          textSize: 'regular',
          textVAlign: 'middle',
          textHAlign: 'center',
          bgColor: '#E3F2FD',
        },
        {
          columns: 3,
          rows: 1,
          actionType: 'reply',
          actionBody: 'Моите обяви',
          text: '📋 Моите обяви',
          textSize: 'regular',
          textVAlign: 'middle',
          textHAlign: 'center',
          bgColor: '#E8F5E9',
        },
      ]
    );
  }

  private async handleIncomingMessage(
    sender: ViberUser,
    message: ViberMessage
  ): Promise<void> {
    if (message.type !== 'text' || !message.text) return;

    // Store message for analytics
    await setDoc(doc(collection(db, 'viber_messages')), {
      viberUserId: sender.id,
      senderName: sender.name,
      messageText: message.text,
      receivedAt: serverTimestamp(),
    });

    // Route to AI chatbot logic
    const response = await this.generateAIResponse(message.text, sender.id);
    await this.sendMessage(sender.id, response);
  }

  private async handleSubscribed(sender: ViberUser): Promise<void> {
    await setDoc(doc(db, 'viber_subscribers', sender.id), {
      viberUserId: sender.id,
      name: sender.name,
      language: sender.language,
      subscribedAt: serverTimestamp(),
      isActive: true,
    });
  }

  private async handleUnsubscribed(userId: string): Promise<void> {
    await updateDoc(doc(db, 'viber_subscribers', userId), {
      isActive: false,
      unsubscribedAt: serverTimestamp(),
    });
  }

  /**
   * Generate AI response for common car-related queries
   */
  private async generateAIResponse(
    userMessage: string,
    viberUserId: string
  ): Promise<string> {
    const lowerMessage = userMessage.toLowerCase();

    // Simple intent detection for common queries
    if (
      lowerMessage.includes('цена') ||
      lowerMessage.includes('колко струва') ||
      lowerMessage.includes('price')
    ) {
      return '💰 За оценка на цената, моля посетете:\nhttps://koli.one/sell\n\nНашият AI ще ви даде справедлива пазарна цена за секунди!';
    }

    if (
      lowerMessage.includes('търси') ||
      lowerMessage.includes('search') ||
      lowerMessage.includes('кола')
    ) {
      return '🔍 Търсете автомобили на:\nhttps://koli.one/search\n\nНад 10,000 проверени обяви с AI анализ!';
    }

    if (
      lowerMessage.includes('продавам') ||
      lowerMessage.includes('sell') ||
      lowerMessage.includes('обява')
    ) {
      return '📸 Публикувайте обява безплатно:\nhttps://koli.one/sell\n\nСамо сканирайте VIN и нашият AI попълва всичко за 15 секунди!';
    }

    if (lowerMessage.includes('помощ') || lowerMessage.includes('help')) {
      return (
        '❓ Как мога да помогна?\n\n' +
        '🔍 Търсене — напишете "търси [марка]"\n' +
        '💰 Цена — напишете "цена"\n' +
        '📸 Продажба — напишете "продавам"\n' +
        '📞 Контакт — support@koli.one'
      );
    }

    return '🤖 Благодаря за съобщението! За пълната функционалност посетете:\nhttps://koli.one\n\nИли напишете "помощ" за опции.';
  }
}

export const viberChannelService = ViberChannelService.getInstance();
