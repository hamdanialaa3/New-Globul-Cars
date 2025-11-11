import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';

class NotificationService {
  private messaging: any;

  async initialize() {
    try {
      this.messaging = getMessaging();
      await this.requestPermission();
      this.listenForMessages();
    } catch (error) {
      console.error('❌ Notification init failed:', error);
    }
  }

  async requestPermission() {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      const token = await this.getToken();
      return token;
    } else {
      console.log('❌ Notification permission denied');
      return null;
    }
  }

  async getToken() {
    try {
      const token = await getToken(this.messaging, {
        vapidKey: 'YOUR_VAPID_KEY' // سنضيفه لاحقاً
      });
      console.log('🔑 FCM Token:', token);
      return token;
    } catch (error) {
      console.error('❌ Token error:', error);
      return null;
    }
  }

  async requestPermissionAndSaveToken(userId?: string) {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        const token = await this.getToken();
        
        if (token && userId) {
          await this.saveToken(userId, token);
        }
        
        return token;
      } else {
        console.log('❌ Notification permission denied');
        return null;
      }
    } catch (error) {
      console.error('❌ Request permission and save token failed:', error);
      return null;
    }
  }

  onForegroundMessage(callback: (payload: any) => void) {
    if (!this.messaging) {
      this.messaging = getMessaging();
    }
    
    return onMessage(this.messaging, callback);
  }

  async saveToken(userId: string, token: string) {
    try {
      await setDoc(doc(db, 'userTokens', userId), {
        token,
        updatedAt: new Date(),
        platform: 'web'
      });
      console.log('✅ Token saved');
    } catch (error) {
      console.error('❌ Token save failed:', error);
    }
  }

  listenForMessages() {
    onMessage(this.messaging, (payload) => {
      console.log('📬 Foreground Message:', payload);
      this.showNotification(payload);
    });
  }

  showNotification(payload: any) {
    const { title, body, icon } = payload.notification;
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/Logo1.png',
        badge: '/Logo1.png',
        vibrate: [200, 100, 200],
        tag: payload.data?.type || 'default'
      });
    }
  }

  // Notification Templates
  async sendNewCarNotification(userId: string, carData: any) {
    return this.sendNotification(userId, {
      title: '🚗 سيارة جديدة!',
      body: `${carData.brand} ${carData.model} - ${carData.price}€`,
      type: 'new_car',
      data: { carId: carData.id }
    });
  }

  async sendPriceDropNotification(userId: string, carData: any, oldPrice: number) {
    return this.sendNotification(userId, {
      title: '💰 السعر انخفض!',
      body: `${carData.brand} ${carData.model} من ${oldPrice}€ إلى ${carData.price}€`,
      type: 'price_drop',
      data: { carId: carData.id }
    });
  }

  async sendMessageNotification(userId: string, senderName: string) {
    return this.sendNotification(userId, {
      title: '💬 رسالة جديدة',
      body: `رسالة من ${senderName}`,
      type: 'message',
      data: { type: 'message' }
    });
  }

  async sendFavoriteCarAvailableNotification(userId: string, carData: any) {
    return this.sendNotification(userId, {
      title: '⭐ السيارة المفضلة متاحة!',
      body: `${carData.brand} ${carData.model} متاحة الآن`,
      type: 'favorite_available',
      data: { carId: carData.id }
    });
  }

  async sendViewNotification(sellerId: string, carData: any, viewCount: number) {
    return this.sendNotification(sellerId, {
      title: '👀 مشاهدات جديدة',
      body: `إعلانك ${carData.brand} ${carData.model} حصل على ${viewCount} مشاهدة`,
      type: 'views',
      data: { carId: carData.id }
    });
  }

  async sendInquiryNotification(sellerId: string, carData: any) {
    return this.sendNotification(sellerId, {
      title: '❓ استفسار جديد',
      body: `شخص مهتم بـ ${carData.brand} ${carData.model}`,
      type: 'inquiry',
      data: { carId: carData.id }
    });
  }

  async sendOfferNotification(sellerId: string, carData: any, offerPrice: number) {
    return this.sendNotification(sellerId, {
      title: '💵 عرض سعر جديد',
      body: `عرض ${offerPrice}€ على ${carData.brand} ${carData.model}`,
      type: 'offer',
      data: { carId: carData.id }
    });
  }

  async sendVerificationNotification(userId: string, status: string) {
    return this.sendNotification(userId, {
      title: status === 'approved' ? '✅ تم التحقق' : '⏳ قيد المراجعة',
      body: status === 'approved' ? 'حسابك تم التحقق منه بنجاح' : 'طلب التحقق قيد المراجعة',
      type: 'verification',
      data: { status }
    });
  }

  async sendReminderNotification(userId: string, message: string) {
    return this.sendNotification(userId, {
      title: '⏰ تذكير',
      body: message,
      type: 'reminder',
      data: {}
    });
  }

  async sendPromotionNotification(userId: string, promotion: any) {
    return this.sendNotification(userId, {
      title: '🎉 عرض خاص',
      body: promotion.message,
      type: 'promotion',
      data: { promotionId: promotion.id }
    });
  }

  private async sendNotification(userId: string, notification: any) {
    try {
      const tokenDoc = await getDoc(doc(db, 'userTokens', userId));
      
      if (!tokenDoc.exists()) {
        console.log('❌ No token for user:', userId);
        return;
      }

      const token = tokenDoc.data().token;
      
      // هنا سنستخدم Firebase Cloud Functions لإرسال الإشعار
      // سيتم إضافته في الخطوة التالية
      console.log('📤 Sending notification to:', userId, notification);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Send notification failed:', error);
      return { success: false, error };
    }
  }
}

export const notificationService = new NotificationService();
