// src/services/social-media-integration.ts
// Comprehensive Social Media Integration for Bulgarian Car Marketplace
// (Comment removed - was in Arabic)

// Import all social media services
import FacebookGraphService, { bulgarianFacebookGraph } from './facebook-graph-service';
import FacebookMarketingService, { bulgarianMarketingService } from './facebook-marketing-service';
import FacebookMessengerService, { bulgarianMessengerService } from './facebook-messenger-service';
import FacebookAnalyticsService, { bulgarianAnalyticsService } from './facebook-analytics-service';
import FacebookSharingService, { bulgarianSharingService } from './facebook-sharing-service';
import FacebookGroupsService, { bulgarianGroupsService } from './facebook-groups-service';
import BulgarianThreadsService, { bulgarianThreadsService } from './threads-service';
import TikTokService, { bulgarianTikTokService } from './tiktok-service';
import InstagramService, { bulgarianInstagramService } from './instagram-service';

// Type definitions for comprehensive social media integration
export interface SocialMediaConfig {
  // Facebook config
  facebook: {
    appId: string;
    pageId: string;
    pixelId?: string;
    accessToken?: string;
    pageAccessToken?: string;
    adAccountId?: string;
    verifyToken?: string;
  };
  // TikTok config
  tiktok: {
    accessToken?: string;
    clientKey?: string;
    clientSecret?: string;
  };
  // Instagram config
  instagram: {
    accessToken?: string;
    clientId?: string;
    clientSecret?: string;
  };
  // General config
  environment: 'development' | 'production';
  defaultLanguage: 'bg' | 'en';
  currency: 'EUR';
  timezone: 'Europe/Sofia';
}

export interface BulgarianCarSocialIntegration {
  // Facebook services
  facebook: {
    graph: FacebookGraphService;
    marketing: FacebookMarketingService;
    messenger: FacebookMessengerService;
    analytics: FacebookAnalyticsService;
    sharing: FacebookSharingService;
    groups: FacebookGroupsService;
  };
  // Other platforms
  threads: BulgarianThreadsService;
  tiktok: TikTokService;
  instagram: InstagramService;
  // Config
  config: SocialMediaConfig;
}

/**
 * Comprehensive Social Media Integration Manager
 * (Comment removed - was in Arabic)
 */
class SocialMediaIntegrationManager {
  private config: SocialMediaConfig;
  private services: BulgarianCarSocialIntegration;

  constructor(config?: Partial<SocialMediaConfig>) {
    // Default configuration for Bulgarian Car Marketplace
    this.config = {
      facebook: {
        appId: process.env.REACT_APP_FACEBOOK_APP_ID || '',
        pageId: '100080260449528', // Bulgarian Car Marketplace page
        pixelId: process.env.REACT_APP_FACEBOOK_PIXEL_ID,
        accessToken: process.env.REACT_APP_FACEBOOK_ACCESS_TOKEN,
        pageAccessToken: process.env.REACT_APP_FACEBOOK_PAGE_ACCESS_TOKEN,
        adAccountId: process.env.REACT_APP_FACEBOOK_AD_ACCOUNT_ID,
        verifyToken: process.env.REACT_APP_FACEBOOK_VERIFY_TOKEN || 'bulgarian_car_verify_2024'
      },
      tiktok: {
        accessToken: process.env.REACT_APP_TIKTOK_ACCESS_TOKEN,
        clientKey: process.env.REACT_APP_TIKTOK_CLIENT_KEY,
        clientSecret: process.env.REACT_APP_TIKTOK_CLIENT_SECRET
      },
      instagram: {
        accessToken: process.env.REACT_APP_INSTAGRAM_ACCESS_TOKEN,
        clientId: process.env.REACT_APP_INSTAGRAM_CLIENT_ID,
        clientSecret: process.env.REACT_APP_INSTAGRAM_CLIENT_SECRET
      },
      environment: (process.env.NODE_ENV as 'development' | 'production') || 'development',
      defaultLanguage: 'bg',
      currency: 'EUR',
      timezone: 'Europe/Sofia',
      ...config
    };

    // Initialize all services with configuration
    this.services = {
      facebook: {
        graph: bulgarianFacebookGraph,
        marketing: bulgarianMarketingService,
        messenger: bulgarianMessengerService,
        analytics: bulgarianAnalyticsService,
        sharing: bulgarianSharingService,
        groups: bulgarianGroupsService
      },
      threads: bulgarianThreadsService,
      tiktok: bulgarianTikTokService,
      instagram: bulgarianInstagramService,
      config: this.config
    };

    this.initializeIntegration();
  }

  /**
   * Initialize comprehensive social media integration
   * (Comment removed - was in Arabic)
   */
  private initializeIntegration(): void {
// Set access tokens for all services
    if (this.config.facebook.accessToken) {
      this.services.facebook.graph.setAccessToken(this.config.facebook.accessToken);
      this.services.facebook.marketing.setAccessToken(this.config.facebook.accessToken);
      this.services.facebook.groups.setAccessToken(this.config.facebook.accessToken);
    }

    if (this.config.tiktok.accessToken) {
      this.services.tiktok.setAccessToken(this.config.tiktok.accessToken);
    }

    if (this.config.instagram.accessToken) {
      this.services.instagram.setAccessToken(this.config.instagram.accessToken);
    }

    // Validate configuration
    this.validateConfiguration();

}

  /**
   * Validate social media integration configuration
   * (Comment removed - was in Arabic)
   */
  private validateConfiguration(): void {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check Facebook config
    if (!this.config.facebook.appId) {
      errors.push('Facebook App ID is required');
    }
    if (!this.config.facebook.accessToken) {
      warnings.push('Facebook access token not provided - some features may not work');
    }

    // Check TikTok config
    if (!this.config.tiktok.accessToken) {
      warnings.push('TikTok access token not provided - TikTok features will be disabled');
    }

    // Check Instagram config
    if (!this.config.instagram.accessToken) {
      warnings.push('Instagram access token not provided - Instagram features will be disabled');
    }

    if (errors.length > 0) {
      console.error('[SERVICE] Social Media Integration Errors:', errors);
      throw new Error(`Social media configuration errors: ${errors.join(', ')}`);
    }

    if (warnings.length > 0) {
      console.warn('⚠️ Social Media Integration Warnings:', warnings);
    }
  }

  /**
   * Get integration status
   * (Comment removed - was in Arabic)
   */
  getStatus(): {
    facebook: boolean;
    threads: boolean;
    tiktok: boolean;
    instagram: boolean;
    environment: string;
    language: string;
  } {
    return {
      facebook: !!this.config.facebook.accessToken,
      threads: !!this.config.facebook.accessToken, // Threads uses Facebook token
      tiktok: !!this.config.tiktok.accessToken,
      instagram: !!this.config.instagram.accessToken,
      environment: this.config.environment,
      language: this.config.defaultLanguage
    };
  }

  /**
   * Post car to all available platforms
   * (Comment removed - was in Arabic)
   */
  async postCarToAllPlatforms(carData: {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    description: string;
    images: string[];
    location: string;
  }): Promise<{
    facebook?: any;
    threads?: any;
    tiktok?: any;
    instagram?: any;
  }> {
    const results: any = {};

    try {
      // Facebook post
      if (this.config.facebook.accessToken) {
        try {
          const fbPost = await this.services.facebook.sharing.shareCarToFacebook({
            id: carData.id,
            make: carData.make,
            model: carData.model,
            year: carData.year,
            price: carData.price,
            currency: this.config.currency,
            description: carData.description,
            images: carData.images,
            location: carData.location,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: 'current_user',
            status: 'active'
          } as any, this.config.defaultLanguage);
          results.facebook = fbPost;
        } catch (error) {
          console.warn('Facebook posting failed:', error);
        }
      }

      // Threads post
      if (this.config.facebook.accessToken) {
        try {
          const threadsPost = await this.services.threads.shareCarToThreads({
            carId: carData.id,
            title: `${carData.make} ${carData.model} ${carData.year}`,
            description: carData.description,
            images: carData.images,
            price: carData.price,
            location: carData.location,
            hashtags: [carData.make, carData.model, 'cars', 'продажба', 'коли']
          });
          results.threads = threadsPost;
        } catch (error) {
          console.warn('Threads posting failed:', error);
        }
      }

      // TikTok post
      if (this.config.tiktok.accessToken) {
        try {
          const tiktokPost = await this.services.tiktok.postCarVideo({
            carId: carData.id,
            title: `${carData.make} ${carData.model} ${carData.year}`,
            description: `🚗 ${carData.make} ${carData.model} ${carData.year} - ${carData.price}€\n${carData.description}`,
            videoUrl: carData.images[0], // Using image as video for now
            hashtags: [carData.make, carData.model, 'cars', 'продажба', 'коли'],
            language: this.config.defaultLanguage,
            privacyLevel: 'public'
          });
          results.tiktok = tiktokPost;
        } catch (error) {
          console.warn('TikTok posting failed:', error);
        }
      }

      // Instagram post
      if (this.config.instagram.accessToken) {
        try {
          const instagramPost = await this.services.instagram.postCarContent({
            carId: carData.id,
            mediaType: 'IMAGE',
            mediaUrls: [carData.images[0]],
            caption: `🚗 ${carData.make} ${carData.model} ${carData.year} - ${carData.price}€\n${carData.description}`,
            hashtags: [carData.make, carData.model, 'cars', 'продажба', 'коли', 'българия'],
            language: this.config.defaultLanguage
          });
          results.instagram = instagramPost;
        } catch (error) {
          console.warn('Instagram posting failed:', error);
        }
      }

      return results;
    } catch (error) {
      console.error('[SERVICE] Error posting to social platforms:', error);
      throw error;
    }
  }

  /**
   * Get trending content from all platforms
   * (Comment removed - was in Arabic)
   */
  async getAllTrendingContent(limit: number = 10): Promise<{
    facebook: any[];
    tiktok: any[];
    instagram: any[];
  }> {
    const results = {
      facebook: [] as any[],
      tiktok: [] as any[],
      instagram: [] as any[]
    };

    // Facebook trending
    if (this.config.facebook.accessToken) {
      try {
        const fbTrending = await this.services.facebook.groups.getTrendingCarDiscussions(limit);
        results.facebook = fbTrending;
      } catch (error) {
        console.warn('Facebook trending fetch failed:', error);
      }
    }

    // TikTok trending
    if (this.config.tiktok.accessToken) {
      try {
        const tiktokTrending = await this.services.tiktok.getTrendingBulgarianCarVideos(limit);
        results.tiktok = tiktokTrending;
      } catch (error) {
        console.warn('TikTok trending fetch failed:', error);
      }
    }

    // Instagram trending
    if (this.config.instagram.accessToken) {
      try {
        const instagramTrending = await this.services.instagram.getTrendingBulgarianCarPosts(limit);
        results.instagram = instagramTrending;
      } catch (error) {
        console.warn('Instagram trending fetch failed:', error);
      }
    }

    return results;
  }
}

// Create singleton instance
export const bulgarianSocialIntegration = new SocialMediaIntegrationManager();

export default SocialMediaIntegrationManager;