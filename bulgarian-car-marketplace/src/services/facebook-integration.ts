// src/services/facebook-integration.ts
// Comprehensive Facebook Integration Index for Bulgarian Car Marketplace
// فهرس التكامل الشامل مع Facebook لسوق السيارات البلغاري

// Import all Facebook services
import FacebookGraphService, { bulgarianFacebookGraph } from './facebook-graph-service';
import FacebookMarketingService, { bulgarianMarketingService } from './facebook-marketing-service';
import FacebookMessengerService, { bulgarianMessengerService } from './facebook-messenger-service';
import FacebookAnalyticsService, { bulgarianAnalyticsService } from './facebook-analytics-service';
import FacebookSharingService, { bulgarianSharingService } from './facebook-sharing-service';
import FacebookGroupsService, { bulgarianGroupsService } from './facebook-groups-service';
import BulgarianThreadsService, { bulgarianThreadsService } from './threads-service';

// Type definitions for unified Facebook integration
export interface FacebookIntegrationConfig {
  appId: string;
  pageId: string;
  pixelId?: string;
  accessToken?: string;
  pageAccessToken?: string;
  adAccountId?: string;
  verifyToken?: string;
  environment: 'development' | 'production';
  defaultLanguage: 'bg' | 'en';
}

export interface BulgarianCarFacebookIntegration {
  graph: FacebookGraphService;
  marketing: FacebookMarketingService;
  messenger: FacebookMessengerService;
  analytics: FacebookAnalyticsService;
  sharing: FacebookSharingService;
  groups: FacebookGroupsService;
  threads: BulgarianThreadsService;
  config: FacebookIntegrationConfig;
}

/**
 * Comprehensive Facebook Integration Manager
 * مدير التكامل الشامل مع Facebook
 */
class FacebookIntegrationManager {
  private config: FacebookIntegrationConfig;
  private services: BulgarianCarFacebookIntegration;

  constructor(config?: Partial<FacebookIntegrationConfig>) {
    // Default configuration for Bulgarian Car Marketplace
    this.config = {
      appId: process.env.REACT_APP_FACEBOOK_APP_ID || '',
      pageId: '100080260449528', // Bulgarian Car Marketplace page
      pixelId: process.env.REACT_APP_FACEBOOK_PIXEL_ID,
      accessToken: process.env.REACT_APP_FACEBOOK_ACCESS_TOKEN,
      pageAccessToken: process.env.REACT_APP_FACEBOOK_PAGE_ACCESS_TOKEN,
      adAccountId: process.env.REACT_APP_FACEBOOK_AD_ACCOUNT_ID,
      verifyToken: process.env.REACT_APP_FACEBOOK_VERIFY_TOKEN || 'bulgarian_car_verify_2024',
      environment: (process.env.NODE_ENV as 'development' | 'production') || 'development',
      defaultLanguage: 'bg',
      ...config
    };

    // Initialize all services with configuration
    this.services = {
      graph: bulgarianFacebookGraph,
      marketing: bulgarianMarketingService,
      messenger: bulgarianMessengerService,
      analytics: bulgarianAnalyticsService,
      sharing: bulgarianSharingService,
      groups: bulgarianGroupsService,
      threads: bulgarianThreadsService,
      config: this.config
    };

    this.initializeIntegration();
  }

  /**
   * Initialize comprehensive Facebook integration
   * تهيئة التكامل الشامل مع Facebook
   */
  private initializeIntegration(): void {
    console.log('🚀 Initializing comprehensive Facebook integration for Bulgarian Car Marketplace...');

    // Set access tokens for all services
    if (this.config.accessToken) {
      this.services.graph.setAccessToken(this.config.accessToken);
      this.services.marketing.setAccessToken(this.config.accessToken);
      this.services.groups.setAccessToken(this.config.accessToken);
    }

    // Validate configuration
    this.validateConfiguration();

    console.log('✅ Facebook integration initialized successfully');
    console.log(`🇧🇬 Language: ${this.config.defaultLanguage === 'bg' ? 'Bulgarian' : 'English'}`);
    console.log(`🏢 Environment: ${this.config.environment}`);
  }

  /**
   * Validate Facebook integration configuration
   * التحقق من صحة تكوين التكامل مع Facebook
   */
  private validateConfiguration(): void {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check required configurations
    if (!this.config.appId) {
      errors.push('Facebook App ID is required');
    }

    if (!this.config.pageId) {
      errors.push('Facebook Page ID is required');
    }

    // Check optional but recommended configurations
    if (!this.config.accessToken) {
      warnings.push('Facebook Access Token not provided - some features may be limited');
    }

    if (!this.config.pixelId) {
      warnings.push('Facebook Pixel ID not provided - analytics tracking will be limited');
    }

    if (!this.config.adAccountId) {
      warnings.push('Facebook Ad Account ID not provided - marketing features will be limited');
    }

    // Log warnings and errors
    if (warnings.length > 0) {
      console.warn('⚠️ Facebook Integration Warnings:');
      warnings.forEach(warning => console.warn(`  • ${warning}`));
    }

    if (errors.length > 0) {
      console.error('❌ Facebook Integration Errors:');
      errors.forEach(error => console.error(`  • ${error}`));
      throw new Error('Facebook integration configuration incomplete');
    }

    console.log('✅ Facebook configuration validated');
  }

  /**
   * Get all Facebook services
   * الحصول على جميع خدمات Facebook
   */
  getServices(): BulgarianCarFacebookIntegration {
    return this.services;
  }

  /**
   * Get specific Facebook service
   * الحصول على خدمة Facebook محددة
   */
  getService<T extends keyof Omit<BulgarianCarFacebookIntegration, 'config'>>(
    serviceName: T
  ): BulgarianCarFacebookIntegration[T] {
    return this.services[serviceName];
  }

  /**
   * Comprehensive car listing workflow
   * سير عمل شامل لقائمة السيارات
   */
  async processNewCarListing(carData: any, options?: {
    createAd?: boolean;
    shareToPage?: boolean;
    trackAnalytics?: boolean;
    language?: 'bg' | 'en';
  }): Promise<{
    success: boolean;
    results: {
      advertisement?: string;
      pagePost?: string;
      openGraphTags?: any;
      analyticsTracked?: boolean;
    };
    errors: string[];
  }> {
    const results: any = {};
    const errors: string[] = [];
    const language = options?.language || this.config.defaultLanguage;

    console.log(`🚗 Processing new car listing: ${carData.make} ${carData.model} ${carData.year}`);

    try {
      // 1. Create Open Graph tags for sharing
      const openGraphTags = this.services.sharing.generateCarOpenGraphTags(carData, language);
      results.openGraphTags = openGraphTags;
      console.log('✅ Open Graph tags generated');

      // 2. Track analytics event
      if (options?.trackAnalytics !== false) {
        await this.services.analytics.trackCarView({
          carId: carData.id,
          make: carData.make,
          model: carData.model,
          year: carData.year,
          price: carData.price,
          category: 'automotive',
          location: carData.location,
          timestamp: Date.now()
        });
        results.analyticsTracked = true;
        console.log('✅ Analytics event tracked');
      }

      // 3. Create Facebook advertisement
      if (options?.createAd && this.config.adAccountId) {
        try {
          const campaign = await this.services.marketing.createCarAdCampaign(
            carData,
            Math.min(50, carData.price * 0.01) // Dynamic budget: 1% of car price, max €50/day
          );
          results.advertisement = campaign.id;
          console.log('✅ Facebook advertisement created');
        } catch (error) {
          errors.push(`Failed to create advertisement: ${error}`);
        }
      }

      // 4. Share to Facebook page
      if (options?.shareToPage) {
        try {
          const postId = await this.services.sharing.createCarListingPost(carData, language);
          results.pagePost = postId;
          console.log('✅ Facebook page post created');
        } catch (error) {
          errors.push(`Failed to create page post: ${error}`);
        }
      }

      return {
        success: errors.length === 0,
        results,
        errors
      };
    } catch (error) {
      console.error('Error processing car listing:', error);
      errors.push(`General processing error: ${error}`);
      
      return {
        success: false,
        results,
        errors
      };
    }
  }

  /**
   * Handle customer inquiry workflow
   * التعامل مع سير عمل استفسار العميل
   */
  async processCustomerInquiry(inquiryData: {
    carId: string;
    customerId: string;
    inquiryType: 'price' | 'test_drive' | 'financing' | 'general';
    message: string;
    contactMethod: 'messenger' | 'phone' | 'email';
    language?: 'bg' | 'en';
  }): Promise<{
    success: boolean;
    response?: string;
    trackingId?: string;
  }> {
    const language = inquiryData.language || this.config.defaultLanguage;

    console.log(`📞 Processing customer inquiry for car ${inquiryData.carId}`);

    try {
      // Track contact event
      await this.services.analytics.trackCarContact({
        carId: inquiryData.carId,
        contactMethod: inquiryData.contactMethod,
        sellerId: 'seller_placeholder',
        buyerId: inquiryData.customerId,
        timestamp: Date.now()
      });

      // Generate appropriate response based on inquiry type
      let response = '';
      
      if (language === 'bg') {
        switch (inquiryData.inquiryType) {
          case 'price':
            response = '💰 Благодаря за интереса! Ще получите актуални подробности за цената по имейл или телефон.';
            break;
          case 'test_drive':
            response = '🚙 Отлично! Ще се свържем с вас, за да организираме тест драйв в удобно за вас време.';
            break;
          case 'financing':
            response = '💳 Разполагаме с партньорство с водещи банки. Ще ви изпратим информация за финансиране.';
            break;
          default:
            response = '📞 Благодаря за запитването! Нашият екип ще се свърже с вас възможно най-скоро.';
        }
      } else {
        switch (inquiryData.inquiryType) {
          case 'price':
            response = '💰 Thank you for your interest! You will receive current pricing details via email or phone.';
            break;
          case 'test_drive':
            response = '🚙 Excellent! We will contact you to arrange a test drive at your convenience.';
            break;
          case 'financing':
            response = '💳 We have partnerships with leading banks. We will send you financing information.';
            break;
          default:
            response = '📞 Thank you for your inquiry! Our team will contact you as soon as possible.';
        }
      }

      const trackingId = `inquiry_${inquiryData.carId}_${Date.now()}`;

      console.log('✅ Customer inquiry processed successfully');

      return {
        success: true,
        response,
        trackingId
      };
    } catch (error) {
      console.error('Error processing customer inquiry:', error);
      return {
        success: false
      };
    }
  }

  /**
   * Generate comprehensive Facebook integration report
   * إنشاء تقرير شامل للتكامل مع Facebook
   */
  async generateIntegrationReport(days: number = 30): Promise<{
    pageInsights?: any;
    audienceInsights?: any;
    conversionInsights?: any;
    adPerformance?: any;
    integrationStatus: {
      graph: boolean;
      marketing: boolean;
      messenger: boolean;
      analytics: boolean;
      sharing: boolean;
    };
    recommendations: string[];
  }> {
    console.log('📊 Generating comprehensive Facebook integration report...');

    try {
      // Get analytics insights
      const analyticsReport = await this.services.analytics.generateAnalyticsReport(days);

      // Get active campaigns
      const activeCampaigns = await this.services.marketing.getActiveCampaigns();

      // Check integration status
      const integrationStatus = {
        graph: !!this.config.accessToken,
        marketing: !!this.config.adAccountId,
        messenger: !!this.config.pageAccessToken,
        analytics: !!this.config.pixelId,
        sharing: !!this.config.appId
      };

      // Generate recommendations
      const recommendations: string[] = [];

      if (!integrationStatus.marketing) {
        recommendations.push('Set up Facebook Ad Account ID for automated car advertising');
      }

      if (!integrationStatus.messenger) {
        recommendations.push('Configure Facebook Page Access Token for Messenger integration');
      }

      if (!integrationStatus.analytics) {
        recommendations.push('Add Facebook Pixel ID for enhanced analytics tracking');
      }

      if (activeCampaigns.length === 0) {
        recommendations.push('Consider creating your first car advertisement campaign');
      }

      if (analyticsReport?.conversionInsights && analyticsReport.conversionInsights.conversion_rate < 20) {
        recommendations.push('Optimize conversion rate - current rate is below 20%');
      }

      console.log('✅ Integration report generated successfully');

      return {
        pageInsights: analyticsReport?.pageInsights,
        audienceInsights: analyticsReport?.audienceInsights,
        conversionInsights: analyticsReport?.conversionInsights,
        adPerformance: { activeCampaigns: activeCampaigns.length },
        integrationStatus,
        recommendations
      };
    } catch (error) {
      console.error('Error generating integration report:', error);
      return {
        integrationStatus: {
          graph: false,
          marketing: false,
          messenger: false,
          analytics: false,
          sharing: false
        },
        recommendations: ['Fix integration configuration errors']
      };
    }
  }

  /**
   * Update integration configuration
   * تحديث تكوين التكامل
   */
  updateConfiguration(newConfig: Partial<FacebookIntegrationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🔄 Facebook integration configuration updated');
    this.initializeIntegration();
  }

  /**
   * Get current configuration (without sensitive data)
   * الحصول على التكوين الحالي (بدون بيانات حساسة)
   */
  getConfiguration(): Omit<FacebookIntegrationConfig, 'accessToken' | 'pageAccessToken'> {
    const { accessToken, pageAccessToken, ...publicConfig } = this.config;
    return publicConfig;
  }
}

// Create singleton instance for Bulgarian Car Marketplace
const bulgarianFacebookIntegration = new FacebookIntegrationManager();

// Export services and manager
export {
  FacebookGraphService,
  FacebookMarketingService,
  FacebookMessengerService,
  FacebookAnalyticsService,
  FacebookSharingService,
  FacebookIntegrationManager,
  bulgarianFacebookGraph,
  bulgarianMarketingService,
  bulgarianMessengerService,
  bulgarianAnalyticsService,
  bulgarianSharingService,
  bulgarianFacebookIntegration
};

export default bulgarianFacebookIntegration;