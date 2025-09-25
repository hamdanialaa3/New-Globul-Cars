// src/services/facebook-graph-service.ts
// Professional Facebook Graph API Integration
// تكامل احترافي مع Facebook Graph API

interface FacebookUser {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
      is_silhouette: boolean;
    };
  };
  locale?: string;
  timezone?: number;
  location?: {
    name: string;
  };
  friends?: {
    data: FacebookUser[];
    paging?: {
      cursors: {
        before: string;
        after: string;
      };
    };
  };
  posts?: {
    data: FacebookPost[];
  };
}

interface FacebookPost {
  id: string;
  message?: string;
  story?: string;
  created_time: string;
  type: 'photo' | 'video' | 'link' | 'status';
  attachments?: {
    data: {
      type: string;
      media?: {
        image?: {
          src: string;
        };
      };
      title?: string;
      description?: string;
      url?: string;
    }[];
  };
  likes?: {
    summary: {
      total_count: number;
    };
  };
  comments?: {
    summary: {
      total_count: number;
    };
  };
}

interface FacebookPage {
  id: string;
  name: string;
  category: string;
  about?: string;
  website?: string;
  phone?: string;
  location?: {
    street: string;
    city: string;
    country: string;
  };
  fan_count?: number;
  picture?: {
    data: {
      url: string;
    };
  };
}

interface GraphApiResponse<T> {
  data: T;
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
    previous?: string;
  };
  error?: {
    message: string;
    type: string;
    code: number;
  };
}

/**
 * Professional Facebook Graph API Service
 * خدمة احترافية لـ Facebook Graph API
 */
export class FacebookGraphService {
  private static readonly BASE_URL = 'https://graph.facebook.com/v18.0';
  private static readonly BULGARIAN_PAGE_ID = '100080260449528'; // من الرابط المقدم
  private accessToken: string | null = null;

  constructor(accessToken?: string) {
    this.accessToken = accessToken || null;
  }

  /**
   * Set access token for API calls
   * تعيين رمز الوصول لاستدعاءات API
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Get current user profile with Bulgarian localization
   * الحصول على ملف المستخدم الحالي مع الترجمة البلغارية
   */
  async getCurrentUser(): Promise<FacebookUser> {
    if (!this.accessToken) {
      throw new Error('Access token required / مطلوب رمز الوصول');
    }

    try {
      const fields = [
        'id',
        'name', 
        'email',
        'picture.type(large)',
        'locale',
        'timezone',
        'location'
      ].join(',');

      const response = await this.makeRequest<FacebookUser>(`/me?fields=${fields}`);
      
      // Log for Bulgarian car marketplace
      console.log('🇧🇬 Facebook user fetched for Bulgarian Car Marketplace');
      
      return response;
    } catch (error) {
      console.error('Error fetching Facebook user:', error);
      throw new Error('Failed to fetch user profile / فشل في جلب ملف المستخدم');
    }
  }

  /**
   * Get user's friends for social features
   * الحصول على أصدقاء المستخدم للميزات الاجتماعية
   */
  async getUserFriends(userId: string = 'me', limit: number = 50): Promise<FacebookUser[]> {
    if (!this.accessToken) {
      throw new Error('Access token required / مطلوب رمز الوصول');
    }

    try {
      const response = await this.makeRequest<GraphApiResponse<FacebookUser[]>>(
        `/${userId}/friends?fields=id,name,picture&limit=${limit}`
      );

      console.log(`🤝 Found ${response.data.length} friends for car marketplace social features`);
      return response.data;
    } catch (error) {
      console.error('Error fetching friends:', error);
      return []; // Return empty array instead of throwing
    }
  }

  /**
   * Get user's posts for engagement analysis
   * الحصول على منشورات المستخدم لتحليل التفاعل
   */
  async getUserPosts(userId: string = 'me', limit: number = 25): Promise<FacebookPost[]> {
    if (!this.accessToken) {
      throw new Error('Access token required / مطلوب رمز الوصول');
    }

    try {
      const fields = [
        'id',
        'message',
        'story', 
        'created_time',
        'type',
        'attachments{type,media,title,description,url}',
        'likes.summary(total_count)',
        'comments.summary(total_count)'
      ].join(',');

      const response = await this.makeRequest<GraphApiResponse<FacebookPost[]>>(
        `/${userId}/posts?fields=${fields}&limit=${limit}`
      );

      console.log(`📱 Fetched ${response.data.length} posts for user engagement analysis`);
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }

  /**
   * Get Bulgarian Car Marketplace Facebook page data
   * الحصول على بيانات صفحة Facebook لسوق السيارات البلغاري
   */
  async getBulgarianCarPage(): Promise<FacebookPage> {
    try {
      const fields = [
        'id',
        'name',
        'category',
        'about',
        'website',
        'phone',
        'location',
        'fan_count',
        'picture.type(large)'
      ].join(',');

      // Use app access token for public page data
      const response = await this.makeRequest<FacebookPage>(
        `/${FacebookGraphService.BULGARIAN_PAGE_ID}?fields=${fields}`,
        true // Use app token
      );

      console.log('🇧🇬 Bulgarian Car Marketplace page data fetched');
      return response;
    } catch (error) {
      console.error('Error fetching Bulgarian car page:', error);
      throw new Error('Failed to fetch page data / فشل في جلب بيانات الصفحة');
    }
  }

  /**
   * Get page posts for Bulgarian Car Marketplace
   * الحصول على منشورات الصفحة لسوق السيارات البلغاري
   */
  async getPagePosts(limit: number = 20): Promise<FacebookPost[]> {
    try {
      const fields = [
        'id',
        'message',
        'story',
        'created_time',
        'type',
        'attachments{type,media,title,description,url}',
        'likes.summary(total_count)',
        'comments.summary(total_count)'
      ].join(',');

      const response = await this.makeRequest<GraphApiResponse<FacebookPost[]>>(
        `/${FacebookGraphService.BULGARIAN_PAGE_ID}/posts?fields=${fields}&limit=${limit}`,
        true
      );

      console.log(`🚗 Fetched ${response.data.length} posts from Bulgarian Car Marketplace page`);
      return response.data;
    } catch (error) {
      console.error('Error fetching page posts:', error);
      return [];
    }
  }

  /**
   * Search for car-related content
   * البحث عن محتوى متعلق بالسيارات
   */
  async searchCarContent(query: string, type: 'user' | 'page' | 'event' = 'page'): Promise<any[]> {
    try {
      const encodedQuery = encodeURIComponent(`${query} cars Bulgaria`);
      
      const response = await this.makeRequest<GraphApiResponse<any[]>>(
        `/search?q=${encodedQuery}&type=${type}&fields=id,name,category,picture`,
        true
      );

      console.log(`🔍 Found ${response.data.length} car-related ${type}s in Bulgaria`);
      return response.data;
    } catch (error) {
      console.error('Error searching car content:', error);
      return [];
    }
  }

  /**
   * Get user's interests for targeted advertising
   * الحصول على اهتمامات المستخدم للإعلانات المستهدفة
   */
  async getUserInterests(userId: string = 'me'): Promise<string[]> {
    if (!this.accessToken) {
      return [];
    }

    try {
      const response = await this.makeRequest<GraphApiResponse<any[]>>(
        `/${userId}/likes?fields=name,category&limit=100`
      );

      const interests = response.data
        .filter(like => like.category && like.name)
        .map(like => like.name);

      console.log(`🎯 Extracted ${interests.length} interests for targeted advertising`);
      return interests;
    } catch (error) {
      console.error('Error fetching interests:', error);
      return [];
    }
  }

  /**
   * Post to Bulgarian Car Marketplace page (requires page access token)
   * النشر على صفحة سوق السيارات البلغاري
   */
  async postToPage(message: string, link?: string, imageUrl?: string): Promise<string | null> {
    if (!this.accessToken) {
      throw new Error('Page access token required / مطلوب رمز وصول الصفحة');
    }

    try {
      const postData: any = {
        message: message,
        access_token: this.accessToken
      };

      if (link) {
        postData.link = link;
      }

      if (imageUrl) {
        postData.picture = imageUrl;
      }

      const response = await fetch(`${FacebookGraphService.BASE_URL}/${FacebookGraphService.BULGARIAN_PAGE_ID}/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error.message);
      }

      console.log('🚗 Successfully posted to Bulgarian Car Marketplace page');
      return result.id;
    } catch (error) {
      console.error('Error posting to page:', error);
      throw new Error('Failed to post to page / فشل في النشر على الصفحة');
    }
  }

  /**
   * Get insights for a specific post
   * الحصول على إحصائيات منشور معين
   */
  async getPostInsights(postId: string): Promise<any> {
    try {
      const metrics = [
        'post_impressions',
        'post_engaged_users',
        'post_clicks',
        'post_reactions_by_type_total'
      ].join(',');

      const response = await this.makeRequest<GraphApiResponse<any[]>>(
        `/${postId}/insights?metric=${metrics}`,
        true
      );

      console.log(`📊 Fetched insights for post ${postId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching post insights:', error);
      return null;
    }
  }

  /**
   * Make authenticated request to Graph API
   * إجراء طلب مصادق عليه إلى Graph API
   */
  private async makeRequest<T>(endpoint: string, useAppToken: boolean = false): Promise<T> {
    let url = `${FacebookGraphService.BASE_URL}${endpoint}`;
    
    // Add access token
    if (useAppToken) {
      // For public data, use app access token (if available)
      const appToken = process.env.REACT_APP_FACEBOOK_APP_TOKEN;
      if (appToken) {
        url += (endpoint.includes('?') ? '&' : '?') + `access_token=${appToken}`;
      }
    } else if (this.accessToken) {
      url += (endpoint.includes('?') ? '&' : '?') + `access_token=${this.accessToken}`;
    }

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BulgarianCarMarketplace/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Facebook API error: ${data.error.message}`);
    }

    return data;
  }

  /**
   * Get Bulgarian localized error messages
   * الحصول على رسائل الخطأ المترجمة للبلغارية
   */
  private static getLocalizedError(error: string, locale: 'bg' | 'en' = 'bg'): string {
    const errors = {
      bg: {
        'access_token': 'Необходим е токен за достъп',
        'invalid_user': 'Невалиден потребител',
        'rate_limit': 'Превишен е лимитът на заявките',
        'permissions': 'Недостатъчни разрешения',
        'network': 'Грешка в мрежата'
      },
      en: {
        'access_token': 'Access token required',
        'invalid_user': 'Invalid user',
        'rate_limit': 'Rate limit exceeded', 
        'permissions': 'Insufficient permissions',
        'network': 'Network error'
      }
    };

    return errors[locale][error as keyof typeof errors.bg] || error;
  }
}

// Singleton instance for the Bulgarian Car Marketplace
export const bulgarianFacebookGraph = new FacebookGraphService();

export default FacebookGraphService;