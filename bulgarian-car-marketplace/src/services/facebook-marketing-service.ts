// src/services/facebook-marketing-service.ts
// Professional Facebook Marketing API Integration for Bulgarian Car Marketplace
// (Comment removed - was in Arabic)

interface CarAdData {
  make: string;
  model: string;
  year: number;
  price: number; // في اليورو
  mileage: number;
  fuelType: string;
  transmission: string;
  images: string[];
  description: {
    bg: string;
    en: string;
  };
  location: {
    city: string;
    region: string;
    country: 'Bulgaria';
  };
  contactInfo: {
    phone: string;
    email: string;
  };
}

interface FacebookAdCampaign {
  id: string;
  name: string;
  objective: 'LEAD_GENERATION' | 'CONVERSIONS' | 'LINK_CLICKS' | 'REACH' | 'TRAFFIC';
  status: 'ACTIVE' | 'PAUSED' | 'DELETED';
  daily_budget?: number; // في اليورو سنت (100 = 1€)
  lifetime_budget?: number;
  start_time?: string;
  end_time?: string;
  targeting?: FacebookTargeting;
  insights?: CampaignInsights;
}

interface FacebookAdSet {
  id: string;
  name: string;
  campaign_id: string;
  optimization_goal: 'LEAD_GENERATION' | 'CONVERSIONS' | 'LINK_CLICKS';
  billing_event: 'IMPRESSIONS' | 'CLICKS' | 'ACTIONS';
  bid_amount?: number;
  daily_budget: number;
  targeting: FacebookTargeting;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED';
}

interface FacebookTargeting {
  geo_locations: {
    countries?: string[];
    regions?: { key: string; name: string }[];
    cities?: { key: string; name: string; radius: number }[];
  };
  age_min?: number;
  age_max?: number;
  genders?: (1 | 2)[]; // 1 = male, 2 = female
  interests?: { id: string; name: string }[];
  behaviors?: { id: string; name: string }[];
  detailed_targeting?: {
    and?: any[];
    or?: any[];
    not?: any[];
  };
  custom_audiences?: string[];
  lookalike_audiences?: string[];
}

interface FacebookAd {
  id: string;
  name: string;
  adset_id: string;
  creative: FacebookAdCreative;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED';
  tracking_specs?: any[];
}

interface FacebookAdCreative {
  id: string;
  name: string;
  object_story_spec: {
    page_id: string;
    link_data?: {
      link: string;
      message: string;
      name: string;
      description: string;
      image_hash?: string;
      call_to_action?: {
        type: 'LEARN_MORE' | 'SHOP_NOW' | 'CONTACT_US' | 'GET_QUOTE';
        value?: {
          link: string;
        };
      };
    };
    video_data?: {
      video_id: string;
      message: string;
      call_to_action?: any;
    };
  };
}

interface CampaignInsights {
  impressions: number;
  clicks: number;
  ctr: number; // Click-through rate
  cpc: number; // Cost per click in Euro cents
  cpp: number; // Cost per thousand impressions
  spend: number; // في اليورو سنت
  reach: number;
  frequency: number;
  conversions: number;
  cost_per_conversion: number;
  date_start: string;
  date_stop: string;
}

/**
 * Professional Facebook Marketing API Service
 * (Comment removed - was in Arabic)
 */
export class FacebookMarketingService {
  private static readonly BASE_URL = 'https://graph.facebook.com/v18.0';
  private static readonly BULGARIAN_PAGE_ID = '100080260449528';
  private static readonly AD_ACCOUNT_ID = process.env.REACT_APP_FACEBOOK_AD_ACCOUNT_ID;
  private accessToken: string | null = null;

  constructor(accessToken?: string) {
    this.accessToken = accessToken || process.env.REACT_APP_FACEBOOK_ACCESS_TOKEN || null;
  }

  /**
   * Set access token for API calls
   * (Comment removed - was in Arabic)
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Create automated car advertisement campaign
   * (Comment removed - was in Arabic)
   */
  async createCarAdCampaign(carData: CarAdData, budget: number): Promise<FacebookAdCampaign> {
    if (!this.accessToken || !FacebookMarketingService.AD_ACCOUNT_ID) {
      throw new Error('Access token and Ad Account ID required / مطلوب رمز الوصول ومعرف حساب الإعلانات');
    }

    try {
      // Step 1: Create Campaign
      const campaignData = {
        name: `${carData.make} ${carData.model} ${carData.year} - Bulgarian Car Marketplace`,
        objective: 'LEAD_GENERATION',
        status: 'PAUSED', // Start paused for review
        special_ad_categories: [], // No special categories for car ads
        access_token: this.accessToken
      };

      const campaign = await this.makeRequest<FacebookAdCampaign>(
        `/act_${FacebookMarketingService.AD_ACCOUNT_ID}/campaigns`,
        'POST',
        campaignData
      );
// Step 2: Create Ad Set with Bulgarian targeting
      const adSet = await this.createBulgarianCarAdSet(campaign.id, carData, budget);

      // Step 3: Create Ad Creative
      const creative = await this.createCarAdCreative(carData);

      // Step 4: Create Ad
      await this.createAd(adSet.id, creative.id, carData);
return {
        ...campaign,
        targeting: adSet.targeting,
        daily_budget: budget
      };
    } catch (error) {
      console.error('[SERVICE] Error creating car ad campaign:', error);
      throw new Error('Failed to create advertisement / فشل في إنشاء الإعلان');
    }
  }

  /**
   * Create targeted ad set for Bulgarian car buyers
   * (Comment removed - was in Arabic)
   */
  private async createBulgarianCarAdSet(
    campaignId: string, 
    carData: CarAdData, 
    dailyBudget: number
  ): Promise<FacebookAdSet> {
    // Define Bulgarian car buyer targeting
    const targeting: FacebookTargeting = {
      geo_locations: {
        countries: ['BG'], // Bulgaria
        regions: [
          { key: '452932', name: 'Sofia' },
          { key: '452928', name: 'Plovdiv' },
          { key: '452930', name: 'Varna' },
          { key: '452929', name: 'Burgas' }
        ]
      },
      age_min: 25,
      age_max: 65,
      genders: [1, 2], // All genders
      interests: [
        { id: '6003107902433', name: 'Cars' },
        { id: '6003397425791', name: 'Used Cars' },
        { id: '6003449076701', name: 'Car Dealerships' },
        { id: '6015559470183', name: 'Automotive Industry' }
      ],
      behaviors: [
        { id: '6002714895372', name: 'Car Buyers' },
        { id: '6017253486583', name: 'Premium Car Brands' }
      ]
    };

    // Adjust targeting based on car price (Euro)
    if (carData.price > 30000) {
      targeting.behaviors?.push({ id: '6017253511383', name: 'Luxury Car Brands' });
      targeting.detailed_targeting = {
        and: [
          { id: '6003695018204', name: 'Household income: Top 10%' }
        ]
      };
    }

    const adSetData = {
      name: `AdSet - ${carData.make} ${carData.model} - Bulgarian Target`,
      campaign_id: campaignId,
      daily_budget: dailyBudget * 100, // Convert EUR to cents
      optimization_goal: 'LEAD_GENERATION',
      billing_event: 'IMPRESSIONS',
      targeting: targeting,
      status: 'PAUSED',
      access_token: this.accessToken
    };

    const adSet = await this.makeRequest<FacebookAdSet>(
      `/act_${FacebookMarketingService.AD_ACCOUNT_ID}/adsets`,
      'POST',
      adSetData
    );
return { ...adSet, targeting };
  }

  /**
   * Create compelling ad creative for car listing
   * (Comment removed - was in Arabic)
   */
  private async createCarAdCreative(carData: CarAdData): Promise<FacebookAdCreative> {
    // Upload car image to Facebook
    let imageHash: string | undefined;
    if (carData.images.length > 0) {
      imageHash = await this.uploadImage(carData.images[0]);
    }

    // Create bilingual ad text
    const adText = {
      bg: `${carData.make} ${carData.model} ${carData.year}г.\n💰 ${carData.price.toLocaleString('bg-BG')} €\n📍 ${carData.location.city}, България\n${carData.description.bg}`,
      en: `${carData.make} ${carData.model} ${carData.year}\n💰 €${carData.price.toLocaleString('en-EU')}\n📍 ${carData.location.city}, Bulgaria\n${carData.description.en}`
    };

    const creativeData = {
      name: `Creative - ${carData.make} ${carData.model} ${carData.year}`,
      object_story_spec: {
        page_id: FacebookMarketingService.BULGARIAN_PAGE_ID,
        link_data: {
          link: `${process.env.REACT_APP_BASE_URL}/car/${carData.make}-${carData.model}-${carData.year}`,
          message: adText.bg, // Primary language Bulgarian
          name: `${carData.make} ${carData.model} ${carData.year} - €${carData.price.toLocaleString('en-EU')}`,
          description: `${carData.mileage.toLocaleString('bg-BG')} км | ${carData.fuelType} | ${carData.transmission} | ${carData.location.city}`,
          image_hash: imageHash,
          call_to_action: {
            type: 'CONTACT_US',
            value: {
              link: `${process.env.REACT_APP_BASE_URL}/contact?car=${carData.make}-${carData.model}`
            }
          }
        }
      },
      access_token: this.accessToken
    };

    const creative = await this.makeRequest<FacebookAdCreative>(
      `/act_${FacebookMarketingService.AD_ACCOUNT_ID}/adcreatives`,
      'POST',
      creativeData
    );
return creative;
  }

  /**
   * Create final advertisement
   * (Comment removed - was in Arabic)
   */
  private async createAd(adSetId: string, creativeId: string, carData: CarAdData): Promise<FacebookAd> {
    const adData = {
      name: `Ad - ${carData.make} ${carData.model} ${carData.year}`,
      adset_id: adSetId,
      creative: { creative_id: creativeId },
      status: 'PAUSED',
      tracking_specs: [
        {
          'action.type': ['lead'],
          fb_pixel: [process.env.REACT_APP_FACEBOOK_PIXEL_ID]
        }
      ],
      access_token: this.accessToken
    };

    const ad = await this.makeRequest<FacebookAd>(
      `/act_${FacebookMarketingService.AD_ACCOUNT_ID}/ads`,
      'POST',
      adData
    );
return ad;
  }

  /**
   * Upload image to Facebook for ads
   * (Comment removed - was in Arabic)
   */
  private async uploadImage(imageUrl: string): Promise<string> {
    try {
      const imageData = {
        url: imageUrl,
        access_token: this.accessToken
      };

      const response = await this.makeRequest<{ hash: string }>(
        `/act_${FacebookMarketingService.AD_ACCOUNT_ID}/adimages`,
        'POST',
        imageData
      );
return response.hash;
    } catch (error) {
      console.error('[SERVICE] Error uploading image:', error);
      throw new Error('Failed to upload car image / فشل في رفع صورة السيارة');
    }
  }

  /**
   * Get campaign insights and performance
   * (Comment removed - was in Arabic)
   */
  async getCampaignInsights(campaignId: string, dateRange?: { since: string; until: string }): Promise<CampaignInsights> {
    try {
      let endpoint = `/${campaignId}/insights?fields=impressions,clicks,ctr,cpc,cpp,spend,reach,frequency,conversions,cost_per_conversion`;
      
      if (dateRange) {
        endpoint += `&time_range={since:'${dateRange.since}',until:'${dateRange.until}'}`;
      }

      const response = await this.makeRequest<{ data: CampaignInsights[] }>(endpoint);
      
      if (response.data.length === 0) {
        throw new Error('No insights data available');
      }

      const insights = response.data[0];
return insights;
    } catch (error) {
      console.error('[SERVICE] Error fetching campaign insights:', error);
      throw new Error('Failed to fetch campaign insights / فشل في جلب إحصائيات الحملة');
    }
  }

  /**
   * Get all active campaigns
   * (Comment removed - was in Arabic)
   */
  async getActiveCampaigns(): Promise<FacebookAdCampaign[]> {
    try {
      const response = await this.makeRequest<{ data: FacebookAdCampaign[] }>(
        `/act_${FacebookMarketingService.AD_ACCOUNT_ID}/campaigns?fields=id,name,objective,status,daily_budget,lifetime_budget&effective_status=[ACTIVE]`
      );
return response.data;
    } catch (error) {
      console.error('[SERVICE] Error fetching campaigns:', error);
      return [];
    }
  }

  /**
   * Pause or activate campaign
   * (Comment removed - was in Arabic)
   */
  async updateCampaignStatus(campaignId: string, status: 'ACTIVE' | 'PAUSED'): Promise<boolean> {
    try {
      await this.makeRequest(`/${campaignId}`, 'POST', {
        status: status,
        access_token: this.accessToken
      });
return true;
    } catch (error) {
      console.error('[SERVICE] Error updating campaign status:', error);
      return false;
    }
  }

  /**
   * Create lookalike audience based on existing customers
   * (Comment removed - was in Arabic)
   */
  async createLookalikeAudience(sourceAudienceId: string, name: string): Promise<string> {
    try {
      const audienceData = {
        name: `${name} - Bulgarian Car Buyers Lookalike`,
        subtype: 'LOOKALIKE',
        origin_audience_id: sourceAudienceId,
        lookalike_spec: {
          ratio: 0.01, // 1% of Bulgarian population
          country: 'BG'
        },
        access_token: this.accessToken
      };

      const response = await this.makeRequest<{ id: string }>(
        `/act_${FacebookMarketingService.AD_ACCOUNT_ID}/customaudiences`,
        'POST',
        audienceData
      );
return response.id;
    } catch (error) {
      console.error('[SERVICE] Error creating lookalike audience:', error);
      throw new Error('Failed to create lookalike audience / فشل في إنشاء الجمهور المشابه');
    }
  }

  /**
   * Get conversion tracking data
   * (Comment removed - was in Arabic)
   */
  async getConversions(campaignId: string): Promise<any> {
    try {
      const response = await this.makeRequest<{ data: any[] }>(
        `/${campaignId}/insights?fields=conversions,conversion_values,cost_per_conversion&action_breakdowns=action_type`
      );
return response.data;
    } catch (error) {
      console.error('[SERVICE] Error fetching conversions:', error);
      return [];
    }
  }

  /**
   * Make authenticated request to Marketing API
   * (Comment removed - was in Arabic)
   */
  private async makeRequest<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    const url = `${FacebookMarketingService.BASE_URL}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'BulgarianCarMarketplace/1.0'
      }
    };

    if (method !== 'GET' && data) {
      if (!data.access_token && this.accessToken) {
        data.access_token = this.accessToken;
      }
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`Facebook Marketing API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(`Facebook Marketing API error: ${result.error.message}`);
    }

    return result;
  }
}

// Singleton instance for the Bulgarian Car Marketplace
export const bulgarianMarketingService = new FacebookMarketingService();

export default FacebookMarketingService;