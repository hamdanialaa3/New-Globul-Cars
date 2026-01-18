// Facebook Auto-Post Service
// النشر الأوتوماتيكي على Facebook عند إضافة سيارة
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import axios from 'axios';

import { logger } from '../logger-service';

interface CarPostData {
  carId: string;
  make: string;
  model: string;
  year: number;
  price: number;
  images: string[];
  city: string;
  region?: string;
  mileage?: number;
  fuelType?: string;
  sellerNumericId: number;
  carNumericId: number;
}

interface FacebookPostResponse {
  id: string; // Facebook Post ID
  success: boolean;
  error?: string;
}

class FacebookAutoPostService {
  private pageId = process.env.REACT_APP_FACEBOOK_PAGE_ID || '100080260449528';
  private pageAccessToken = process.env.REACT_APP_FACEBOOK_PAGE_ACCESS_TOKEN || '';
  
  private baseUrl = 'https://graph.facebook.com/v18.0';
  private siteBaseUrl = process.env.REACT_APP_BASE_URL || 'https://koli.one';

  constructor() {
    if (!this.pageAccessToken || !this.pageId) {
      logger.warn('Facebook configuration missing', {
        hasPageId: !!this.pageId,
        hasToken: !!this.pageAccessToken
      } as Record<string, unknown>);
    }
  }

  /**
   * Post car as photo to Facebook Page
   * النشر على Facebook مع صورة
   */
  async postCarWithPhoto(car: CarPostData): Promise<FacebookPostResponse> {
    try {
      // Validate data
      if (!car.images || car.images.length === 0) {
        logger.warn('No images available for Facebook post', { carId: car.carId });
        return { id: '', success: false, error: 'No images' };
      }

      // Generate caption
      const caption = this.generateCaption(car, 'bg'); // Bulgarian by default

      // Post photo with caption
      const postUrl = `${this.baseUrl}/${this.pageId}/photos`;
      
      const response = await axios.post(postUrl, {
        url: car.images[0], // Main image
        caption,
        access_token: this.pageAccessToken
      });

      logger.info('✅ Car posted to Facebook successfully', {
        carId: car.carId,
        facebookPostId: response.data.id,
        make: car.make,
        model: car.model
      });

      return {
        id: response.data.id,
        success: true
      };

    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      
      // ✅ FIX: Detect CORS/Network errors and return gracefully without logging as critical error
      const errorMessage = err.response?.data?.error?.message || err.message || 'Unknown error';
      const isCorsError = errorMessage.includes('Network Error') || errorMessage.includes('CORS');
      
      if (isCorsError) {
        logger.warn('⚠️ Facebook auto-post skipped (CORS - should be called from Cloud Functions)', {
          carId: car.carId
        });
      } else {
        logger.error('❌ Failed to post car to Facebook', error as Error, {
          carId: car.carId,
          errorMessage
        });
      }

      return {
        id: '',
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Post car as link (fallback if no images)
   * النشر كرابط إذا لم تتوفر صور
   */
  async postCarAsLink(car: CarPostData): Promise<FacebookPostResponse> {
    try {
      const message = this.generateCaption(car, 'bg');
      const carUrl = `${this.siteBaseUrl}/car/${car.sellerNumericId}/${car.carNumericId}`;

      const postUrl = `${this.baseUrl}/${this.pageId}/feed`;
      
      const response = await axios.post(postUrl, {
        message,
        link: carUrl,
        access_token: this.pageAccessToken
      });

      logger.info('✅ Car posted to Facebook as link', {
        carId: car.carId,
        facebookPostId: response.data.id
      });

      return {
        id: response.data.id,
        success: true
      };

    } catch (error: unknown) {
      const err = error as { message?: string };
      logger.error('❌ Failed to post car link to Facebook', error as Error, {
        carId: car.carId
      });

      return {
        id: '',
        success: false,
        error: err.message || 'Unknown error'
      };
    }
  }

  /**
   * Generate caption for Facebook post
   * إنشاء النص المرافق للمنشور
   */
  private generateCaption(car: CarPostData, language: 'bg' | 'en' = 'bg'): string {
    const carUrl = `${this.siteBaseUrl}/car/${car.sellerNumericId}/${car.carNumericId}`;

    if (language === 'bg') {
      return `
🚗 ${car.make} ${car.model} ${car.year}
💰 €${car.price.toLocaleString('bg-BG')}
${car.mileage ? `📊 ${car.mileage.toLocaleString('bg-BG')} км` : ''}
${car.fuelType ? `⛽ ${car.fuelType}` : ''}
📍 ${car.city}${car.region ? `, ${car.region}` : ''}, България

👉 Вижте пълните детайли и още снимки:
${carUrl}

#БългарскиАвтомобили #${car.make} #${car.model} #${car.city} #BulgarianCars #AutomotiveBulgaria
      `.trim();
    } else {
      return `
🚗 ${car.make} ${car.model} ${car.year}
💰 €${car.price.toLocaleString('en-US')}
${car.mileage ? `📊 ${car.mileage.toLocaleString('en-US')} km` : ''}
${car.fuelType ? `⛽ ${car.fuelType}` : ''}
📍 ${car.city}${car.region ? `, ${car.region}` : ''}, Bulgaria

👉 See full details and more photos:
${carUrl}

#BulgarianCars #${car.make} #${car.model} #${car.city} #AutomotiveBulgaria
      `.trim();
    }
  }

  /**
   * Add engagement comment after posting (Algorithm Hack)
   * إضافة تعليق لزيادة التفاعل
   */
  async addEngagementComment(postId: string, language: 'bg' | 'en' = 'bg'): Promise<void> {
    try {
      // Wait 30 seconds after post
      await this.delay(30000);

      const commentText = language === 'bg'
        ? `🤔 Какво мислите за тази кола?\n\nНапишете в коментарите:\n❤️ Ако ви харесва\n😍 Ако обмисляте да я купите\n💰 Ако цената е добра`
        : `🤔 What do you think about this car?\n\nWrite in the comments:\n❤️ If you like it\n😍 If you're considering buying it\n💰 If the price is good`;

      const commentUrl = `${this.baseUrl}/${postId}/comments`;
      
      await axios.post(commentUrl, {
        message: commentText,
        access_token: this.pageAccessToken
      });

      logger.info('✅ Engagement comment added', { postId });

    } catch (error) {
      logger.error('Failed to add engagement comment', error as Error, { postId });
    }
  }

  /**
   * Helper: Delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test connection to Facebook API
   * اختبار الاتصال بـ Facebook API
   */
  async testConnection(): Promise<boolean> {
    try {
      const testUrl = `${this.baseUrl}/me?access_token=${this.pageAccessToken}`;
      const response = await axios.get(testUrl);
      
      logger.info('✅ Facebook API connection successful', {
        pageId: response.data.id,
        pageName: response.data.name
      });

      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      logger.error('❌ Facebook API connection failed', error as Error, {
        errorMessage: err.response?.data?.error?.message || err.message || 'Unknown error'
      });

      return false;
    }
  }
}

// Singleton instance
export const facebookAutoPostService = new FacebookAutoPostService();
