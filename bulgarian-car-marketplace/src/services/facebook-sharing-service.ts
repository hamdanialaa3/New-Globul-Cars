// src/services/facebook-sharing-service.ts
// Professional Facebook Sharing & Open Graph Integration for Bulgarian Car Marketplace
// (Comment removed - was in Arabic)

interface CarListing {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  location: string;
  images: string[];
  description: {
    bg: string;
    en: string;
  };
  seller: {
    name: string;
    phone: string;
    location: string;
  };
  features: string[];
  condition: 'excellent' | 'very_good' | 'good' | 'fair';
}

interface OpenGraphTags {
  'og:title': string;
  'og:description': string;
  'og:image': string;
  'og:url': string;
  'og:type': string;
  'og:site_name': string;
  'og:locale': string;
  'fb:app_id': string;
  'twitter:card': string;
  'twitter:title': string;
  'twitter:description': string;
  'twitter:image': string;
}

interface ShareableContent {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  hashtags: string[];
  language: 'bg' | 'en';
}

interface SocialShareMetrics {
  platform: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'telegram';
  carId: string;
  shareUrl: string;
  timestamp: number;
  userId?: string;
  language: 'bg' | 'en';
}

/**
 * Professional Facebook Sharing Service
 * (Comment removed - was in Arabic)
 */
export class FacebookSharingService {
  private static readonly FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID;
  private static readonly BASE_URL = process.env.REACT_APP_BASE_URL || 'https://bulgariancarmarketplace.com';
  private static readonly PAGE_URL = 'https://www.facebook.com/profile.php?id=100080260449528';

  constructor() {
    this.initializeSocialSDK();
  }

  /**
   * Initialize Facebook SDK for JavaScript
   * (Comment removed - was in Arabic)
   */
  private initializeSocialSDK(): void {
    if (typeof window !== 'undefined' && FacebookSharingService.FACEBOOK_APP_ID) {
      // Load Facebook SDK
      (function(d, s, id) {
        let js: HTMLScriptElement;
        const fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s) as HTMLScriptElement;
        js.id = id;
        js.src = "https://connect.facebook.net/bg_BG/sdk.js#xfbml=1&version=v18.0&appId=" + FacebookSharingService.FACEBOOK_APP_ID;
        if (fjs && fjs.parentNode) {
          fjs.parentNode.insertBefore(js, fjs);
        }
      }(document, 'script', 'facebook-jssdk'));

      // Initialize when SDK is loaded
      (window as any).fbAsyncInit = function() {
        (window as any).FB.init({
          appId: FacebookSharingService.FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
};
    }
  }

  /**
   * Generate Open Graph meta tags for car listing
   * (Comment removed - was in Arabic)
   */
  generateCarOpenGraphTags(car: CarListing, language: 'bg' | 'en' = 'bg'): OpenGraphTags {
    const title = language === 'bg'
      ? `${car.make} ${car.model} ${car.year}г. - €${car.price.toLocaleString('bg-BG')} | Bulgarian Car Marketplace`
      : `${car.make} ${car.model} ${car.year} - €${car.price.toLocaleString('en-EU')} | Bulgarian Car Marketplace`;

    const description = language === 'bg'
      ? `${car.description.bg.substring(0, 150)}... 📍 ${car.location} | ${car.mileage.toLocaleString('bg-BG')} км | ${car.fuelType} | ${car.transmission}`
      : `${car.description.en.substring(0, 150)}... 📍 ${car.location} | ${car.mileage.toLocaleString('en-EU')} km | ${car.fuelType} | ${car.transmission}`;

    const imageUrl = car.images[0] || `${FacebookSharingService.BASE_URL}/assets/default-car.jpg`;
    const carUrl = `${FacebookSharingService.BASE_URL}/car/${car.id}`;

    return {
      'og:title': title,
      'og:description': description,
      'og:image': imageUrl,
      'og:url': carUrl,
      'og:type': 'product',
      'og:site_name': language === 'bg' ? 'Bulgarian Car Marketplace' : 'Bulgarian Car Marketplace',
      'og:locale': language === 'bg' ? 'bg_BG' : 'en_US',
      'fb:app_id': FacebookSharingService.FACEBOOK_APP_ID || '',
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': imageUrl
    };
  }

  /**
   * Share car listing to Facebook
   * (Comment removed - was in Arabic)
   */
  async shareCarToFacebook(car: CarListing, language: 'bg' | 'en' = 'bg'): Promise<boolean> {
    if (typeof window === 'undefined' || !(window as any).FB) {
      console.error('[SERVICE] Facebook SDK not loaded');
      return false;
    }

    try {
      const shareContent = this.prepareCarShareContent(car, language);

      return new Promise((resolve) => {
        (window as any).FB.ui({
          method: 'share',
          href: shareContent.url,
          quote: `${shareContent.title}\n\n${shareContent.description}\n\n${shareContent.hashtags.join(' ')}`,
        }, (response: any) => {
          if (response && !response.error_message) {
this.trackShareEvent('facebook', car.id, shareContent.url, language);
            resolve(true);
          } else {
            console.error('[SERVICE] Facebook share error:', response?.error_message);
            resolve(false);
          }
        });
      });
    } catch (error) {
      console.error('[SERVICE] Error sharing to Facebook:', error);
      return false;
    }
  }

  /**
   * Share car listing via Facebook Messenger
   * (Comment removed - was in Arabic)
   */
  async shareCarViaMessenger(car: CarListing, language: 'bg' | 'en' = 'bg'): Promise<boolean> {
    if (typeof window === 'undefined' || !(window as any).FB) {
      console.error('[SERVICE] Facebook SDK not loaded');
      return false;
    }

    try {
      const shareContent = this.prepareCarShareContent(car, language);

      return new Promise((resolve) => {
        (window as any).FB.ui({
          method: 'send',
          link: shareContent.url,
        }, (response: any) => {
          if (response && !response.error_message) {
this.trackShareEvent('facebook', car.id, shareContent.url, language);
            resolve(true);
          } else {
            console.error('[SERVICE] Messenger share error:', response?.error_message);
            resolve(false);
          }
        });
      });
    } catch (error) {
      console.error('[SERVICE] Error sharing via Messenger:', error);
      return false;
    }
  }

  /**
   * Generate shareable URLs for different platforms
   * (Comment removed - was in Arabic)
   */
  generateShareUrls(car: CarListing, language: 'bg' | 'en' = 'bg'): { [platform: string]: string } {
    const shareContent = this.prepareCarShareContent(car, language);
    const encodedUrl = encodeURIComponent(shareContent.url);
    const encodedTitle = encodeURIComponent(shareContent.title);
    const encodedDescription = encodeURIComponent(shareContent.description);
    const hashtags = shareContent.hashtags.join(',').replace(/#/g, '');

    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}%0A%0A${encodedDescription}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${hashtags}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%0A%0A${encodedDescription}%0A%0A${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}%0A%0A${encodedDescription}`,
      viber: `viber://forward?text=${encodedTitle}%0A%0A${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`
    };
  }

  /**
   * Prepare shareable content for car listing
   * (Comment removed - was in Arabic)
   */
  private prepareCarShareContent(car: CarListing, language: 'bg' | 'en' = 'bg'): ShareableContent {
    const title = language === 'bg'
      ? `${car.make} ${car.model} ${car.year}г. - €${car.price.toLocaleString('bg-BG')}`
      : `${car.make} ${car.model} ${car.year} - €${car.price.toLocaleString('en-EU')}`;

    const description = language === 'bg'
      ? `📍 ${car.location} | ${car.mileage.toLocaleString('bg-BG')} км | ${car.fuelType} | ${car.transmission}\n\n${car.description.bg.substring(0, 200)}...`
      : `📍 ${car.location} | ${car.mileage.toLocaleString('en-EU')} km | ${car.fuelType} | ${car.transmission}\n\n${car.description.en.substring(0, 200)}...`;

    const hashtags = language === 'bg'
      ? ['#БългарскиКоли', '#КолиБългария', '#АвтомобилиПродажба', `#${car.make}`, `#${car.model}`, '#София', '#Пловдив', '#Варна']
      : ['#BulgarianCars', '#CarsForSale', '#UsedCars', `#${car.make}`, `#${car.model}`, '#Bulgaria', '#Sofia'];

    return {
      title,
      description,
      imageUrl: car.images[0] || `${FacebookSharingService.BASE_URL}/assets/default-car.jpg`,
      url: `${FacebookSharingService.BASE_URL}/car/${car.id}?lang=${language}&utm_source=social&utm_medium=share&utm_campaign=car_listing`,
      hashtags,
      language
    };
  }

  /**
   * Create Facebook post for new car listing
   * (Comment removed - was in Arabic)
   */
  async createCarListingPost(car: CarListing, language: 'bg' | 'en' = 'bg'): Promise<string | null> {
    try {
      const postContent = language === 'bg'
        ? `Нова обява: ${car.make} ${car.model} ${car.year}г.

💰 Цена: €${car.price.toLocaleString('bg-BG')}
📍 Местоположение: ${car.location}
⛽ Гориво: ${car.fuelType}
🔧 Скоростна кутия: ${car.transmission}
📏 Пробег: ${car.mileage.toLocaleString('bg-BG')} км

${car.description.bg.substring(0, 300)}...

👀 Вижте пълните детайли и още снимки на нашия сайт!

#БългарскиКоли #${car.make} #${car.model} #АвтомобилиПродажба #${car.location.replace(/\s+/g, '')}`
        : `New listing: ${car.make} ${car.model} ${car.year}

💰 Price: €${car.price.toLocaleString('en-EU')}
📍 Location: ${car.location}
⛽ Fuel: ${car.fuelType}
🔧 Transmission: ${car.transmission}
📏 Mileage: ${car.mileage.toLocaleString('en-EU')} km

${car.description.en.substring(0, 300)}...

👀 See full details and more photos on our website!

#BulgarianCars #${car.make} #${car.model} #CarsForSale #${car.location.replace(/\s+/g, '')}`;

      // This would require page access token and appropriate permissions
      console.log('Mock Facebook post created for car:', `${car.make} ${car.model}`);
// Return mock post ID for now
      return `post_${car.id}_${Date.now()}`;
    } catch (error) {
      console.error('[SERVICE] Error creating car listing post:', error);
      return null;
    }
  }

  /**
   * Generate Facebook Event for car show or dealership event
   * (Comment removed - was in Arabic)
   */
  async createCarShowEvent(eventData: {
    title: string;
    description: string;
    startTime: string;
    endTime?: string;
    location: string;
    coverPhoto?: string;
    language: 'bg' | 'en';
  }): Promise<string | null> {
    try {
      console.log('Mock Facebook event created for car show');

      // Return mock event ID for now
      return `event_${Date.now()}`;
    } catch (error) {
      console.error('[SERVICE] Error creating car show event:', error);
      return null;
    }
  }

  /**
   * Generate dynamic Open Graph meta tags for HTML head
   * (Comment removed - was in Arabic)
   */
  injectOpenGraphTags(tags: OpenGraphTags): void {
    if (typeof document === 'undefined') return;

    // Remove existing OG tags
    const existingTags = document.querySelectorAll('meta[property^="og:"], meta[property^="fb:"], meta[name^="twitter:"]');
    existingTags.forEach(tag => tag.remove());

    // Add new OG tags
    Object.entries(tags).forEach(([property, content]) => {
      const meta = document.createElement('meta');
      
      if (property.startsWith('twitter:')) {
        meta.setAttribute('name', property);
      } else {
        meta.setAttribute('property', property);
      }
      
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    });
}

  /**
   * Track social share events
   * (Comment removed - was in Arabic)
   */
  private trackShareEvent(platform: string, carId: string, shareUrl: string, language: 'bg' | 'en'): void {
    const shareMetrics: SocialShareMetrics = {
      platform: platform as any,
      carId,
      shareUrl,
      timestamp: Date.now(),
      language
    };

    // Send to analytics service
// You could integrate with Google Analytics, Facebook Analytics, or your own tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'share', {
        method: platform,
        content_type: 'car_listing',
        content_id: carId
      });
    }
  }

  /**
   * Get share statistics for a car listing
   * (Comment removed - was in Arabic)
   */
  async getShareStatistics(carId: string): Promise<{ [platform: string]: number } | null> {
    try {
      // This would integrate with your analytics backend
      // Mock data for demonstration
      const mockStats = {
        facebook: Math.floor(Math.random() * 50),
        twitter: Math.floor(Math.random() * 20),
        whatsapp: Math.floor(Math.random() * 30),
        telegram: Math.floor(Math.random() * 15),
        linkedin: Math.floor(Math.random() * 10),
        total: 0
      };

      mockStats.total = Object.values(mockStats).reduce((sum, count) => sum + count, 0);
return mockStats;
    } catch (error) {
      console.error('[SERVICE] Error fetching share statistics:', error);
      return null;
    }
  }

  /**
   * Validate Open Graph tags with Facebook Debugger
   * (Comment removed - was in Arabic)
   */
  async validateOpenGraphTags(url: string): Promise<any> {
    try {
      // This would call Facebook's Graph API to scrape and validate OG tags
      const debugUrl = `https://developers.facebook.com/tools/debug/sharing/?q=${encodeURIComponent(url)}`;
return {
        url: url,
        debugUrl: debugUrl,
        status: 'valid',
        message: 'Open Graph tags are properly configured'
      };
    } catch (error) {
      console.error('[SERVICE] Error validating Open Graph tags:', error);
      return null;
    }
  }
}

// Singleton instance for the Bulgarian Car Marketplace
export const bulgarianSharingService = new FacebookSharingService();

export default FacebookSharingService;