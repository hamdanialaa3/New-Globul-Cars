// src/services/facebook-messenger-service.ts
// Professional Facebook Messenger Integration for Bulgarian Car Marketplace
// تكامل احترافي مع Facebook Messenger لسوق السيارات البلغاري

interface MessengerUser {
  id: string;
  first_name: string;
  last_name: string;
  profile_pic: string;
  locale: string;
  timezone: number;
}

interface MessengerMessage {
  id: string;
  time: number;
  messaging: MessengerMessagingEvent[];
}

interface MessengerMessagingEvent {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: {
    mid: string;
    text?: string;
    attachments?: MessengerAttachment[];
    quick_reply?: {
      payload: string;
    };
  };
  postback?: {
    payload: string;
    title: string;
  };
  delivery?: {
    mids: string[];
    watermark: number;
  };
  read?: {
    watermark: number;
  };
}

interface MessengerAttachment {
  type: 'image' | 'video' | 'file' | 'location' | 'template';
  payload: {
    url?: string;
    coordinates?: {
      lat: number;
      long: number;
    };
    template_type?: 'generic' | 'button' | 'receipt';
    elements?: MessengerElement[];
  };
}

interface MessengerElement {
  title: string;
  subtitle?: string;
  image_url?: string;
  default_action?: {
    type: 'web_url';
    url: string;
  };
  buttons?: MessengerButton[];
}

interface MessengerButton {
  type: 'web_url' | 'postback' | 'phone_number';
  title: string;
  url?: string;
  payload?: string;
  phone_number?: string;
}

interface MessengerQuickReply {
  content_type: 'text' | 'location' | 'user_phone_number' | 'user_email';
  title?: string;
  payload?: string;
  image_url?: string;
}

interface CarInquiry {
  carId: string;
  make: string;
  model: string;
  year: number;
  price: number;
  inquiryType: 'price' | 'test_drive' | 'financing' | 'inspection' | 'general';
  customerInfo: {
    userId: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
    preferredLanguage: 'bg' | 'en';
  };
  timestamp: number;
  status: 'new' | 'responded' | 'scheduled' | 'completed';
}

/**
 * Professional Facebook Messenger Service for Car Marketplace
 * خدمة احترافية لـ Facebook Messenger لسوق السيارات
 */
export class FacebookMessengerService {
  private static readonly GRAPH_API_URL = 'https://graph.facebook.com/v18.0';
  private static readonly PAGE_ID = '100080260449528'; // Bulgarian Car Marketplace page
  private pageAccessToken: string | null = null;
  private verifyToken: string;

  constructor(pageAccessToken?: string, verifyToken?: string) {
    this.pageAccessToken = pageAccessToken || process.env.REACT_APP_FACEBOOK_PAGE_ACCESS_TOKEN || null;
    this.verifyToken = verifyToken || process.env.REACT_APP_FACEBOOK_VERIFY_TOKEN || 'bulgarian_car_verify_2024';
  }

  /**
   * Verify webhook for Facebook Messenger
   * التحقق من webhook لـ Facebook Messenger
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode && token) {
      if (mode === 'subscribe' && token === this.verifyToken) {
        console.log('🔗 Facebook Messenger webhook verified successfully');
        return challenge;
      } else {
        console.error('❌ Failed to verify webhook - invalid token');
        return null;
      }
    }
    return null;
  }

  /**
   * Process incoming webhook messages
   * معالجة الرسائل الواردة من webhook
   */
  async processWebhookMessage(body: any): Promise<void> {
    if (body.object === 'page') {
      for (const entry of body.entry) {
        const webhookEvent = entry.messaging[0];
        const senderId = webhookEvent.sender.id;

        // Don't process messages from the page itself
        if (senderId === FacebookMessengerService.PAGE_ID) {
          return;
        }

        // Get user info for personalized responses
        const userInfo = await this.getUserInfo(senderId);

        // Process different types of events
        if (webhookEvent.message) {
          await this.handleMessage(senderId, webhookEvent.message, userInfo);
        } else if (webhookEvent.postback) {
          await this.handlePostback(senderId, webhookEvent.postback, userInfo);
        }
      }
    }
  }

  /**
   * Handle incoming text messages with Bulgarian car chatbot
   * التعامل مع الرسائل النصية الواردة مع شات بوت السيارات البلغاري
   */
  private async handleMessage(senderId: string, message: any, userInfo: MessengerUser): Promise<void> {
    try {
      let responseText = '';
      let quickReplies: MessengerQuickReply[] = [];
      let attachments: any[] = [];

      // Detect language (Bulgarian or English)
      const isEnglish = this.detectEnglish(message.text);
      const lang = isEnglish ? 'en' : 'bg';

      if (message.text) {
        const text = message.text.toLowerCase();

        // Car search queries
        if (this.isCarSearchQuery(text, lang)) {
          const carResults = await this.searchCars(text, lang);
          if (carResults.length > 0) {
            attachments = [this.createCarCarousel(carResults, lang)];
            responseText = lang === 'bg' 
              ? `🚗 Намерих ${carResults.length} автомобила за теб:`
              : `🚗 I found ${carResults.length} cars for you:`;
          } else {
            responseText = lang === 'bg'
              ? '😔 Не намерих автомобили, отговарящи на критериите ти. Опитай с други параметри.'
              : '😔 No cars found matching your criteria. Try with different parameters.';
          }
        }
        // Price inquiry
        else if (this.isPriceQuery(text, lang)) {
          responseText = lang === 'bg'
            ? '💰 За коя кола искаш да знаеш цената? Изпрати ми модела или линк към обявата.'
            : '💰 Which car would you like to know the price for? Send me the model or listing link.';
          
          quickReplies = [
            { content_type: 'text', title: lang === 'bg' ? '🔍 Търси коли' : '🔍 Search cars', payload: 'SEARCH_CARS' },
            { content_type: 'text', title: lang === 'bg' ? '📞 Свържи се' : '📞 Contact us', payload: 'CONTACT_INFO' }
          ];
        }
        // Test drive request
        else if (this.isTestDriveQuery(text, lang)) {
          responseText = lang === 'bg'
            ? '🚙 Отлично! За коя кола искаш да запазиш тест драйв? Ще ти помогна да се свържеш с продавача.'
            : '🚙 Great! Which car would you like to schedule a test drive for? I\'ll help you contact the seller.';
          
          quickReplies = [
            { content_type: 'text', title: lang === 'bg' ? '📅 Избери дата' : '📅 Choose date', payload: 'SCHEDULE_TEST_DRIVE' },
            { content_type: 'user_phone_number', title: lang === 'bg' ? '📱 Телефон' : '📱 Phone' }
          ];
        }
        // Financing inquiry
        else if (this.isFinancingQuery(text, lang)) {
          responseText = lang === 'bg'
            ? '💳 Можем да те свържем с банки партньори за финансиране. Каква е желаната сума на кредита?'
            : '💳 We can connect you with partner banks for financing. What loan amount are you looking for?';
          
          quickReplies = [
            { content_type: 'text', title: '€5,000-€15,000', payload: 'FINANCING_LOW' },
            { content_type: 'text', title: '€15,000-€30,000', payload: 'FINANCING_MID' },
            { content_type: 'text', title: '€30,000+', payload: 'FINANCING_HIGH' }
          ];
        }
        // General greeting
        else if (this.isGreeting(text, lang)) {
          const greeting = lang === 'bg'
            ? `Здравей ${userInfo.first_name}! 👋 Добре дошъл в Bulgarian Car Marketplace! Как мога да ти помогна днес?`
            : `Hello ${userInfo.first_name}! 👋 Welcome to Bulgarian Car Marketplace! How can I help you today?`;
          
          responseText = greeting;
          quickReplies = [
            { content_type: 'text', title: lang === 'bg' ? '🔍 Търся кола' : '🔍 Looking for a car', payload: 'SEARCH_CARS' },
            { content_type: 'text', title: lang === 'bg' ? '🚗 Продавам кола' : '🚗 Selling a car', payload: 'SELL_CAR' },
            { content_type: 'text', title: lang === 'bg' ? '💰 Финансиране' : '💰 Financing', payload: 'FINANCING_INFO' },
            { content_type: 'text', title: lang === 'bg' ? '📞 Контакти' : '📞 Contact', payload: 'CONTACT_INFO' }
          ];
        }
        // Default response with menu
        else {
          responseText = lang === 'bg'
            ? '🤔 Не разбирам точно какво търсиш. Ето какво мога да направя за теб:'
            : '🤔 I don\'t quite understand what you\'re looking for. Here\'s what I can help you with:';
          
          quickReplies = [
            { content_type: 'text', title: lang === 'bg' ? '🔍 Търси коли' : '🔍 Search cars', payload: 'SEARCH_CARS' },
            { content_type: 'text', title: lang === 'bg' ? '💰 Цени' : '💰 Prices', payload: 'PRICE_INFO' },
            { content_type: 'text', title: lang === 'bg' ? '🚙 Тест драйв' : '🚙 Test drive', payload: 'TEST_DRIVE' },
            { content_type: 'text', title: lang === 'bg' ? '👤 Човешки агент' : '👤 Human agent', payload: 'HUMAN_AGENT' }
          ];
        }

        // Log inquiry for analytics
        await this.logCustomerInquiry(senderId, message.text, lang);

        // Send response
        if (attachments.length > 0) {
          await this.sendMessage(senderId, '', attachments, quickReplies);
        } else {
          await this.sendMessage(senderId, responseText, [], quickReplies);
        }
      }
    } catch (error) {
      console.error('Error handling message:', error);
      await this.sendMessage(senderId, 'Sorry, something went wrong. Please try again. / Съжалявам, възникна грешка. Моля, опитай отново.');
    }
  }

  /**
   * Handle postback events (button clicks)
   * التعامل مع أحداث postback (النقر على الأزرار)
   */
  private async handlePostback(senderId: string, postback: any, userInfo: MessengerUser): Promise<void> {
    const payload = postback.payload;
    const lang = userInfo.locale?.startsWith('bg') ? 'bg' : 'en';

    try {
      switch (payload) {
        case 'SEARCH_CARS':
          await this.sendCarSearchOptions(senderId, lang);
          break;
        
        case 'SELL_CAR':
          await this.sendMessage(senderId, lang === 'bg' 
            ? '🚗 За да продадеш кола, посети нашия сайт и създай обява безплатно!'
            : '🚗 To sell your car, visit our website and create a listing for free!');
          break;
        
        case 'FINANCING_INFO':
          await this.sendMessage(senderId, lang === 'bg'
            ? '💳 Предлагаме партньорство с водещи банки за автокредити с най-добри условия!'
            : '💳 We offer partnerships with leading banks for car loans with the best terms!');
          break;
        
        case 'CONTACT_INFO':
          await this.sendContactInfo(senderId, lang);
          break;
        
        case 'HUMAN_AGENT':
          await this.transferToHumanAgent(senderId, lang);
          break;
        
        default:
          await this.sendMessage(senderId, 'How can I help you? / Как мога да ти помогна?');
          break;
      }
    } catch (error) {
      console.error('Error handling postback:', error);
    }
  }

  /**
   * Send message with attachments and quick replies
   * إرسال رسالة مع المرفقات والردود السريعة
   */
  async sendMessage(
    recipientId: string, 
    text: string, 
    attachments: any[] = [], 
    quickReplies: MessengerQuickReply[] = []
  ): Promise<boolean> {
    if (!this.pageAccessToken) {
      console.error('Page access token not found');
      return false;
    }

    try {
      const messageData: any = {
        recipient: { id: recipientId },
        message: {}
      };

      if (attachments.length > 0) {
        messageData.message.attachment = attachments[0];
      } else if (text) {
        messageData.message.text = text;
      }

      if (quickReplies.length > 0) {
        messageData.message.quick_replies = quickReplies;
      }

      const response = await fetch(`${FacebookMessengerService.GRAPH_API_URL}/me/messages?access_token=${this.pageAccessToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      const result = await response.json();

      if (result.error) {
        console.error('Messenger API error:', result.error);
        return false;
      }

      console.log('✅ Message sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  /**
   * Get user information from Messenger
   * الحصول على معلومات المستخدم من Messenger
   */
  async getUserInfo(userId: string): Promise<MessengerUser> {
    try {
      const response = await fetch(
        `${FacebookMessengerService.GRAPH_API_URL}/${userId}?fields=first_name,last_name,profile_pic,locale,timezone&access_token=${this.pageAccessToken}`
      );

      const userInfo = await response.json();

      if (userInfo.error) {
        throw new Error(userInfo.error.message);
      }

      return userInfo;
    } catch (error) {
      console.error('Error fetching user info:', error);
      // Return default user info
      return {
        id: userId,
        first_name: 'Friend',
        last_name: '',
        profile_pic: '',
        locale: 'bg_BG',
        timezone: 2
      };
    }
  }

  /**
   * Create car carousel for displaying search results
   * إنشاء عرض متحرك للسيارات لعرض نتائج البحث
   */
  private createCarCarousel(cars: any[], lang: 'bg' | 'en'): any {
    const elements = cars.slice(0, 10).map(car => ({
      title: `${car.make} ${car.model} ${car.year}`,
      subtitle: lang === 'bg' 
        ? `€${car.price.toLocaleString('bg-BG')} • ${car.mileage.toLocaleString('bg-BG')} км • ${car.location}`
        : `€${car.price.toLocaleString('en-EU')} • ${car.mileage.toLocaleString('en-EU')} km • ${car.location}`,
      image_url: car.images?.[0] || 'https://via.placeholder.com/300x200/cccccc/ffffff?text=Car',
      default_action: {
        type: 'web_url',
        url: `${process.env.REACT_APP_BASE_URL}/car/${car.id}`
      },
      buttons: [
        {
          type: 'web_url',
          title: lang === 'bg' ? '📱 Детайли' : '📱 Details',
          url: `${process.env.REACT_APP_BASE_URL}/car/${car.id}`
        },
        {
          type: 'postback',
          title: lang === 'bg' ? '🚙 Тест драйв' : '🚙 Test drive',
          payload: `TEST_DRIVE_${car.id}`
        },
        {
          type: 'phone_number',
          title: lang === 'bg' ? '📞 Обади се' : '📞 Call',
          phone_number: car.sellerPhone || '+359888123456'
        }
      ]
    }));

    return {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: elements
      }
    };
  }

  /**
   * Send car search options
   * إرسال خيارات البحث عن السيارات
   */
  private async sendCarSearchOptions(recipientId: string, lang: 'bg' | 'en'): Promise<void> {
    const text = lang === 'bg'
      ? '🔍 Как искаш да търсиш кола?'
      : '🔍 How would you like to search for a car?';

    const quickReplies: MessengerQuickReply[] = [
      { content_type: 'text' as const, title: lang === 'bg' ? '🏷️ По марка' : '🏷️ By brand', payload: 'SEARCH_BY_BRAND' },
      { content_type: 'text' as const, title: lang === 'bg' ? '💰 По цена' : '💰 By price', payload: 'SEARCH_BY_PRICE' },
      { content_type: 'text' as const, title: lang === 'bg' ? '📅 По година' : '📅 By year', payload: 'SEARCH_BY_YEAR' },
      { content_type: 'text' as const, title: lang === 'bg' ? '⛽ По гориво' : '⛽ By fuel', payload: 'SEARCH_BY_FUEL' }
    ];

    await this.sendMessage(recipientId, text, [], quickReplies);
  }

  /**
   * Send contact information
   * إرسال معلومات الاتصال
   */
  private async sendContactInfo(recipientId: string, lang: 'bg' | 'en'): Promise<void> {
    const text = lang === 'bg'
      ? `📞 Свържи се с нас:\n\n🏢 Bulgarian Car Marketplace\n📱 +359 888 123 456\n📧 info@bulgariancarmarketplace.com\n🌐 ${process.env.REACT_APP_BASE_URL}\n📍 София, България`
      : `📞 Contact us:\n\n🏢 Bulgarian Car Marketplace\n📱 +359 888 123 456\n📧 info@bulgariancarmarketplace.com\n🌐 ${process.env.REACT_APP_BASE_URL}\n📍 Sofia, Bulgaria`;

    const buttons = [
      {
        type: 'phone_number',
        title: lang === 'bg' ? '📞 Обади се' : '📞 Call now',
        phone_number: '+359888123456'
      },
      {
        type: 'web_url',
        title: lang === 'bg' ? '🌐 Сайт' : '🌐 Website',
        url: process.env.REACT_APP_BASE_URL || 'https://bulgariancarmarketplace.com'
      }
    ];

    const attachment = {
      type: 'template',
      payload: {
        template_type: 'button',
        text: text,
        buttons: buttons
      }
    };

    await this.sendMessage(recipientId, '', [attachment]);
  }

  /**
   * Transfer to human agent
   * النقل إلى وكيل بشري
   */
  private async transferToHumanAgent(recipientId: string, lang: 'bg' | 'en'): Promise<void> {
    const text = lang === 'bg'
      ? '👤 Свързвам те с нашия екип. Моля, изчакай малко...'
      : '👤 Connecting you with our team. Please wait a moment...';

    await this.sendMessage(recipientId, text);

    // Here you would typically integrate with a customer service platform
    // Log the request for manual follow-up
    console.log(`🏷️ Human agent requested for user ${recipientId}`);
  }

  // Helper methods for text analysis
  private detectEnglish(text: string): boolean {
    const englishPatterns = /\b(car|cars|price|buy|sell|test|drive|financing|hello|hi|help|info)\b/i;
    return englishPatterns.test(text);
  }

  private isCarSearchQuery(text: string, lang: 'bg' | 'en'): boolean {
    if (lang === 'bg') {
      return /\b(търся|кола|автомобил|коли|bmw|mercedes|audi|volkswagen|toyota|opel)\b/i.test(text);
    }
    return /\b(looking for|search|car|cars|bmw|mercedes|audi|volkswagen|toyota|opel)\b/i.test(text);
  }

  private isPriceQuery(text: string, lang: 'bg' | 'en'): boolean {
    if (lang === 'bg') {
      return /\b(цена|цени|струва|колко|евро|лв)\b/i.test(text);
    }
    return /\b(price|cost|how much|euro|eur|€)\b/i.test(text);
  }

  private isTestDriveQuery(text: string, lang: 'bg' | 'en'): boolean {
    if (lang === 'bg') {
      return /\b(тест драйв|тест|пробвам|проба|карам)\b/i.test(text);
    }
    return /\b(test drive|test|try|drive|driving)\b/i.test(text);
  }

  private isFinancingQuery(text: string, lang: 'bg' | 'en'): boolean {
    if (lang === 'bg') {
      return /\b(кредит|финансиране|банка|лизинг|разсрочване)\b/i.test(text);
    }
    return /\b(loan|credit|financing|finance|bank|leasing|installment)\b/i.test(text);
  }

  private isGreeting(text: string, lang: 'bg' | 'en'): boolean {
    if (lang === 'bg') {
      return /\b(здравей|здрасти|добър ден|привет|хей|начало|старт)\b/i.test(text);
    }
    return /\b(hello|hi|hey|good morning|good afternoon|start|begin)\b/i.test(text);
  }

  /**
   * Mock search cars function (replace with actual search logic)
   * وظيفة وهمية للبحث عن السيارات (استبدل بمنطق البحث الفعلي)
   */
  private async searchCars(query: string, lang: 'bg' | 'en'): Promise<any[]> {
    // This is a mock implementation
    // In a real app, you would search your car database
    return [
      {
        id: '1',
        make: 'BMW',
        model: '320d',
        year: 2018,
        price: 25000,
        mileage: 85000,
        location: 'София',
        images: ['https://example.com/bmw320d.jpg'],
        sellerPhone: '+359888111222'
      }
    ];
  }

  /**
   * Log customer inquiry for analytics
   * تسجيل استفسار العميل للتحليلات
   */
  private async logCustomerInquiry(userId: string, message: string, language: 'bg' | 'en'): Promise<void> {
    const inquiry: Partial<CarInquiry> = {
      customerInfo: {
        userId,
        firstName: 'Unknown',
        lastName: '',
        preferredLanguage: language
      },
      timestamp: Date.now(),
      status: 'new'
    };

    // Here you would save to your database
    console.log('📊 Logged customer inquiry:', inquiry);
  }
}

// Singleton instance for the Bulgarian Car Marketplace
export const bulgarianMessengerService = new FacebookMessengerService();

export default FacebookMessengerService;