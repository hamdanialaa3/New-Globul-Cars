// Facebook Auto-Post Service
// 🔒 SECURED: All Facebook API calls routed through Cloud Functions
// Client-side only prepares data and triggers the Cloud Function
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import { serviceLogger as logger } from '../logger-service';

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

/**
 * Facebook Auto-Post Service (Client-Side Proxy)
 * 
 * 🔒 SECURITY FIX: The page access token is NEVER exposed client-side.
 * All Graph API calls are routed through Cloud Functions which hold
 * the access token securely via environment variables or Secret Manager.
 */
class FacebookAutoPostService {
  private readonly cloudFunctionBaseUrl = '/api/facebook';
  private siteBaseUrl = import.meta.env.VITE_BASE_URL || 'https://koli.one';

  /**
   * Post car with photo via Cloud Function
   */
  async postCarWithPhoto(car: CarPostData): Promise<FacebookPostResponse> {
    try {
      if (!car.images || car.images.length === 0) {
        logger.warn('No images available for Facebook post', { carId: car.carId });
        return { id: '', success: false, error: 'No images' };
      }

      const caption = this.generateCaption(car, 'bg');

      const response = await fetch(`${this.cloudFunctionBaseUrl}/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'photo',
          imageUrl: car.images[0],
          caption,
          carId: car.carId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.statusText}`);
      }

      const data = await response.json();

      logger.info('✅ Car posted to Facebook successfully', {
        carId: car.carId,
        facebookPostId: data.id,
        make: car.make,
        model: car.model
      });

      return {
        id: data.id || '',
        success: data.success || false,
        error: data.error,
      };
    } catch (error: unknown) {
      const err = error as { message?: string };
      const errorMessage = err.message || 'Unknown error';

      logger.error('❌ Failed to post car to Facebook', error as Error, {
        carId: car.carId,
        errorMessage
      });

      return {
        id: '',
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Post car as link (fallback if no images) via Cloud Function
   */
  async postCarAsLink(car: CarPostData): Promise<FacebookPostResponse> {
    try {
      const message = this.generateCaption(car, 'bg');
      const carUrl = `${this.siteBaseUrl}/car/${car.sellerNumericId}/${car.carNumericId}`;

      const response = await fetch(`${this.cloudFunctionBaseUrl}/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'link',
          message,
          link: carUrl,
          carId: car.carId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.statusText}`);
      }

      const data = await response.json();

      logger.info('✅ Car posted to Facebook as link', {
        carId: car.carId,
        facebookPostId: data.id
      });

      return {
        id: data.id || '',
        success: data.success || false,
        error: data.error,
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
   * Generate caption for Facebook post (client-side, no secret data)
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
   * Add engagement comment after posting via Cloud Function
   */
  async addEngagementComment(postId: string, language: 'bg' | 'en' = 'bg'): Promise<void> {
    try {
      await fetch(`${this.cloudFunctionBaseUrl}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, language }),
      });

      logger.info('✅ Engagement comment added', { postId });
    } catch (error) {
      logger.error('Failed to add engagement comment', error as Error, { postId });
    }
  }

  /**
   * Test connection to Facebook API via Cloud Function
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.cloudFunctionBaseUrl}/test`, { method: 'GET' });
      if (!response.ok) throw new Error('Connection test failed');

      const data = await response.json();
      logger.info('✅ Facebook API connection successful', data);
      return true;
    } catch (error: unknown) {
      logger.error('❌ Facebook API connection failed', error as Error);
      return false;
    }
  }
}

// Singleton instance
export const facebookAutoPostService = new FacebookAutoPostService();
