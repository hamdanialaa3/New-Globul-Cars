// src/services/facebook-analytics-service.ts
// Professional Facebook Analytics Integration for Bulgarian Car Marketplace
// (Comment removed - was in Arabic)

interface FacebookPixelEvent {
  event: 'PageView' | 'ViewContent' | 'Search' | 'AddToCart' | 'InitiateCheckout' | 'Purchase' | 'Lead' | 'CompleteRegistration' | 'Contact' | 'ScheduleTest' | 'ViewCarDetails';
  eventID?: string;
  userData?: {
    em?: string; // email hash
    ph?: string; // phone hash
    fn?: string; // first name hash
    ln?: string; // last name hash
    ct?: string; // city
    st?: string; // state
    zp?: string; // zip
    country?: string;
  };
  customData?: {
    content_type?: 'product' | 'car';
    content_ids?: string[];
    content_name?: string;
    value?: number;
    currency?: 'EUR';
    search_string?: string;
    content_category?: string;
    car_make?: string;
    car_model?: string;
    car_year?: number;
    car_price?: number;
    location?: string;
  };
}

interface CarViewEvent {
  carId: string;
  make: string;
  model: string;
  year: number;
  price: number;
  category: string;
  userId?: string;
  location: string;
  timestamp: number;
}

interface CarSearchEvent {
  searchQuery: string;
  filters: {
    make?: string;
    model?: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    location?: string;
  };
  resultsCount: number;
  userId?: string;
  timestamp: number;
}

interface CarContactEvent {
  carId: string;
  contactMethod: 'phone' | 'email' | 'messenger' | 'form';
  sellerId: string;
  buyerId?: string;
  timestamp: number;
}

interface TestDriveEvent {
  carId: string;
  scheduledDate: string;
  location: string;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  timestamp: number;
}

interface FacebookInsights {
  pageInsights: {
    impressions: number;
    reach: number;
    engagement: number;
    likes: number;
    shares: number;
    comments: number;
    date_start: string;
    date_stop: string;
  };
  audienceInsights: {
    demographics: {
      age: { [key: string]: number };
      gender: { male: number; female: number };
      country: { [key: string]: number };
      city: { [key: string]: number };
    };
    interests: string[];
    behaviors: string[];
  };
  conversionInsights: {
    leads: number;
    purchases: number;
    cost_per_lead: number;
    conversion_rate: number;
  };
}

/**
 * Professional Facebook Analytics Service
 * (Comment removed - was in Arabic)
 */
export class FacebookAnalyticsService {
  private static readonly GRAPH_API_URL = 'https://graph.facebook.com/v18.0';
  private static readonly PAGE_ID = '100080260449528';
  private static readonly PIXEL_ID = process.env.REACT_APP_FACEBOOK_PIXEL_ID;
  private accessToken: string | null = null;

  constructor(accessToken?: string) {
    this.accessToken = accessToken || process.env.REACT_APP_FACEBOOK_ACCESS_TOKEN || null;
    this.initializePixel();
  }

  /**
   * Initialize Facebook Pixel for client-side tracking
   * (Comment removed - was in Arabic)
   */
  private initializePixel(): void {
    if (typeof window !== 'undefined' && FacebookAnalyticsService.PIXEL_ID) {
      // Check if fbq already exists
      if (!(window as any).fbq) {
        // Initialize Facebook Pixel
        (function(f: any, b: Document, e: string, v: string, n?: any, t?: any, s?: any) {
          if (f.fbq) return;
          n = f.fbq = function(...args: any[]) {
            n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = !0;
          n.version = '2.0';
          n.queue = [];
          t = b.createElement(e) as HTMLScriptElement;
          t.async = !0;
          t.src = v;
          s = b.getElementsByTagName(e)[0];
          s?.parentNode?.insertBefore(t, s);
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

        // Initialize with Pixel ID
        (window as any).fbq('init', FacebookAnalyticsService.PIXEL_ID);
        (window as any).fbq('track', 'PageView');
}
    }
  }

  /**
   * Track page view event
   * (Comment removed - was in Arabic)
   */
  trackPageView(pageUrl: string, userId?: string): void {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      const eventData: FacebookPixelEvent = {
        event: 'PageView',
        eventID: this.generateEventId(),
        customData: {
          content_type: 'car',
          currency: 'EUR'
        }
      };

      if (userId) {
        eventData.userData = {
          country: 'BG'
        };
      }

      (window as any).fbq('track', 'PageView', eventData.customData, {
        eventID: eventData.eventID
      });
}
  }

  /**
   * Track car view event with detailed analytics
   * (Comment removed - was in Arabic)
   */
  async trackCarView(carData: CarViewEvent): Promise<void> {
    // Client-side Facebook Pixel tracking
    if (typeof window !== 'undefined' && (window as any).fbq) {
      const pixelData: FacebookPixelEvent = {
        event: 'ViewContent',
        eventID: this.generateEventId(),
        customData: {
          content_type: 'car',
          content_ids: [carData.carId],
          content_name: `${carData.make} ${carData.model} ${carData.year}`,
          content_category: 'automotive',
          value: carData.price,
          currency: 'EUR',
          car_make: carData.make,
          car_model: carData.model,
          car_year: carData.year,
          car_price: carData.price,
          location: carData.location
        }
      };

      (window as any).fbq('track', 'ViewContent', pixelData.customData, {
        eventID: pixelData.eventID
      });
    }

    // Server-side tracking via Conversions API
    await this.trackServerSideEvent({
      event: 'ViewContent',
      eventID: this.generateEventId(),
      customData: {
        content_type: 'car',
        content_ids: [carData.carId],
        content_name: `${carData.make} ${carData.model} ${carData.year}`,
        value: carData.price,
        currency: 'EUR',
        car_make: carData.make,
        car_model: carData.model,
        car_year: carData.year,
        location: carData.location
      }
    });
}

  /**
   * Track search event with filters
   * (Comment removed - was in Arabic)
   */
  async trackCarSearch(searchData: CarSearchEvent): Promise<void> {
    const searchValue = searchData.filters.minPrice && searchData.filters.maxPrice 
      ? (searchData.filters.minPrice + searchData.filters.maxPrice) / 2 
      : 0;

    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Search', {
        search_string: searchData.searchQuery,
        content_type: 'car',
        value: searchValue,
        currency: 'EUR'
      }, {
        eventID: this.generateEventId()
      });
    }

    // Server-side tracking
    await this.trackServerSideEvent({
      event: 'Search',
      eventID: this.generateEventId(),
      customData: {
        search_string: searchData.searchQuery,
        content_type: 'car',
        value: searchValue,
        currency: 'EUR'
      }
    });
}

  /**
   * Track contact/lead event
   * (Comment removed - was in Arabic)
   */
  async trackCarContact(contactData: CarContactEvent): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Contact', {
        content_type: 'car',
        content_ids: [contactData.carId]
      }, {
        eventID: this.generateEventId()
      });

      // Also track as Lead
      (window as any).fbq('track', 'Lead', {
        content_type: 'car',
        content_ids: [contactData.carId],
        currency: 'EUR'
      }, {
        eventID: this.generateEventId()
      });
    }

    // Server-side tracking
    await this.trackServerSideEvent({
      event: 'Lead',
      eventID: this.generateEventId(),
      customData: {
        content_type: 'car',
        content_ids: [contactData.carId],
        currency: 'EUR'
      }
    });
}

  /**
   * Track test drive scheduling
   * (Comment removed - was in Arabic)
   */
  async trackTestDriveScheduled(testDriveData: TestDriveEvent): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('trackCustom', 'ScheduleTest', {
        content_type: 'car',
        content_ids: [testDriveData.carId],
        currency: 'EUR'
      }, {
        eventID: this.generateEventId()
      });
    }

    // Server-side tracking
    await this.trackServerSideEvent({
      event: 'ScheduleTest' as any,
      eventID: this.generateEventId(),
      customData: {
        content_type: 'car',
        content_ids: [testDriveData.carId],
        currency: 'EUR'
      }
    });
}

  /**
   * Track car purchase/sale completion
   * (Comment removed - was in Arabic)
   */
  async trackCarPurchase(carId: string, price: number, buyerId?: string): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Purchase', {
        content_type: 'car',
        content_ids: [carId],
        value: price,
        currency: 'EUR'
      }, {
        eventID: this.generateEventId()
      });
    }

    // Server-side tracking
    await this.trackServerSideEvent({
      event: 'Purchase',
      eventID: this.generateEventId(),
      customData: {
        content_type: 'car',
        content_ids: [carId],
        value: price,
        currency: 'EUR'
      }
    });
}

  /**
   * Server-side event tracking via Conversions API
   * (Comment removed - was in Arabic)
   */
  private async trackServerSideEvent(eventData: FacebookPixelEvent): Promise<boolean> {
    if (!this.accessToken || !FacebookAnalyticsService.PIXEL_ID) {
      console.warn('Facebook access token or pixel ID missing for server-side tracking');
      return false;
    }

    try {
      const serverEventData = {
        data: [{
          event_name: eventData.event,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventData.eventID,
          user_data: {
            client_ip_address: this.getClientIP(),
            client_user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
            country: 'BG',
            ...eventData.userData
          },
          custom_data: {
            currency: 'EUR',
            ...eventData.customData
          }
        }]
      };

      const response = await fetch(
        `${FacebookAnalyticsService.GRAPH_API_URL}/${FacebookAnalyticsService.PIXEL_ID}/events?access_token=${this.accessToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(serverEventData)
        }
      );

      const result = await response.json();

      if (result.error) {
        console.error('[SERVICE] Server-side tracking error:', result.error);
        return false;
      }
return true;
    } catch (error) {
      console.error('[SERVICE] Error in server-side tracking:', error);
      return false;
    }
  }

  /**
   * Get comprehensive page insights
   * (Comment removed - was in Arabic)
   */
  async getPageInsights(days: number = 30): Promise<FacebookInsights['pageInsights'] | null> {
    if (!this.accessToken) {
      console.error('[SERVICE] Access token required for page insights');
      return null;
    }

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const metrics = [
        'page_impressions',
        'page_reach',
        'page_engaged_users',
        'page_fans',
        'page_total_actions',
        'page_post_engagements'
      ].join(',');

      const response = await fetch(
        `${FacebookAnalyticsService.GRAPH_API_URL}/${FacebookAnalyticsService.PAGE_ID}/insights?metric=${metrics}&since=${startDate.toISOString().split('T')[0]}&until=${endDate.toISOString().split('T')[0]}&access_token=${this.accessToken}`
      );

      const result = await response.json();

      if (result.error) {
        console.error('[SERVICE] Page insights error:', result.error);
        return null;
      }

      // Process insights data
      const insights: FacebookInsights['pageInsights'] = {
        impressions: 0,
        reach: 0,
        engagement: 0,
        likes: 0,
        shares: 0,
        comments: 0,
        date_start: startDate.toISOString().split('T')[0],
        date_stop: endDate.toISOString().split('T')[0]
      };

      result.data.forEach((metric: any) => {
        const latestValue = metric.values[metric.values.length - 1]?.value || 0;
        
        switch (metric.name) {
          case 'page_impressions':
            insights.impressions = latestValue;
            break;
          case 'page_reach':
            insights.reach = latestValue;
            break;
          case 'page_engaged_users':
            insights.engagement = latestValue;
            break;
          case 'page_fans':
            insights.likes = latestValue;
            break;
        }
      });
return insights;
    } catch (error) {
      console.error('[SERVICE] Error fetching page insights:', error);
      return null;
    }
  }

  /**
   * Get audience demographics and interests
   * (Comment removed - was in Arabic)
   */
  async getAudienceInsights(): Promise<FacebookInsights['audienceInsights'] | null> {
    if (!this.accessToken) {
      console.error('[SERVICE] Access token required for audience insights');
      return null;
    }

    try {
      // This is a mock implementation - Facebook removed detailed audience insights for privacy
      // You would need to use Facebook Analytics dashboard for this data
      const mockInsights: FacebookInsights['audienceInsights'] = {
        demographics: {
          age: {
            '25-34': 35,
            '35-44': 28,
            '45-54': 22,
            '18-24': 15
          },
          gender: {
            male: 65,
            female: 35
          },
          country: {
            'Bulgaria': 85,
            'Germany': 8,
            'UK': 4,
            'Other': 3
          },
          city: {
            'София': 30,
            'Пловдив': 15,
            'Варна': 12,
            'Бургас': 10,
            'Other': 33
          }
        },
        interests: [
          'Cars',
          'Used Cars',
          'BMW',
          'Mercedes-Benz',
          'Audi',
          'Automotive Industry',
          'Car Dealerships'
        ],
        behaviors: [
          'Car Buyers',
          'Luxury Car Brands',
          'German Car Brands',
          'Premium Car Buyers'
        ]
      };
      return mockInsights;
    } catch (error) {
      console.error('[SERVICE] Error fetching audience insights:', error);
      return null;
    }
  }

  /**
   * Get conversion metrics
   * (Comment removed - was in Arabic)
   */
  async getConversionInsights(days: number = 30): Promise<FacebookInsights['conversionInsights'] | null> {
    try {
      // This would integrate with your actual conversion tracking
      const mockConversions: FacebookInsights['conversionInsights'] = {
        leads: 45,
        purchases: 12,
        cost_per_lead: 8.50,
        conversion_rate: 26.7
      };
return mockConversions;
    } catch (error) {
      console.error('[SERVICE] Error fetching conversion insights:', error);
      return null;
    }
  }

  /**
   * Generate comprehensive analytics report
   * (Comment removed - was in Arabic)
   */
  async generateAnalyticsReport(days: number = 30): Promise<FacebookInsights | null> {
    try {
      const [pageInsights, audienceInsights, conversionInsights] = await Promise.all([
        this.getPageInsights(days),
        this.getAudienceInsights(),
        this.getConversionInsights(days)
      ]);

      if (!pageInsights || !audienceInsights || !conversionInsights) {
        throw new Error('Failed to fetch all insights data');
      }

      const report: FacebookInsights = {
        pageInsights,
        audienceInsights,
        conversionInsights
      };
return report;
    } catch (error) {
      console.error('[SERVICE] Error generating analytics report:', error);
      return null;
    }
  }

  /**
   * Helper methods
   */
  private generateEventId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getClientIP(): string {
    // This is a placeholder - in a real app, you'd get the client IP from your server
    return '127.0.0.1';
  }

  /**
   * Hash user data for privacy compliance
   * (Comment removed - was in Arabic)
   */
  private async hashUserData(data: string): Promise<string> {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data.toLowerCase().trim());
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    return data; // Fallback - should implement server-side hashing
  }
}

// Singleton instance for the Bulgarian Car Marketplace
export const bulgarianAnalyticsService = new FacebookAnalyticsService();

export default FacebookAnalyticsService;