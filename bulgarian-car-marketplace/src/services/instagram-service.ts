// src/services/instagram-service.ts
// Instagram Integration Service for Bulgarian Car Marketplace
// (Comment removed - was in Arabic)

import { logger } from './logger-service';
import { rateLimiter } from './rate-limiting-service';
import { socialMediaCache } from './cache-service';

// Instagram Post interface
export interface InstagramPost {
  id: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REELS';
  mediaUrl: string;
  thumbnailUrl?: string;
  caption: string;
  permalink: string;
  timestamp: string;
  likeCount: number;
  commentCount: number;
  viewCount?: number;
  hashtags: string[];
  carId?: string;
  language: 'bg' | 'en';
  location?: {
    id: string;
    name: string;
  };
}

// Instagram Car Post interface
export interface InstagramCarPost {
  carId: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REELS';
  mediaUrls: string[];
  caption: string;
  location?: string;
  hashtags: string[];
  language: 'bg' | 'en';
}

// Instagram Comment interface
export interface InstagramComment {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  likeCount: number;
  replies?: InstagramComment[];
}

// Instagram User Profile interface
export interface InstagramUserProfile {
  id: string;
  username: string;
  fullName: string;
  biography: string;
  profilePictureUrl: string;
  followerCount: number;
  followingCount: number;
  mediaCount: number;
  isVerified: boolean;
  isBusinessAccount: boolean;
  location?: string;
}

// Instagram Story interface
export interface InstagramStory {
  id: string;
  mediaType: 'IMAGE' | 'VIDEO';
  mediaUrl: string;
  thumbnailUrl?: string;
  timestamp: string;
  expiresAt: string;
  viewCount?: number;
  carId?: string;
}

/**
 * Instagram Service for Bulgarian Car Marketplace
 * (Comment removed - was in Arabic)
 */
class InstagramService {
  private accessToken: string | null = null;
  private baseUrl = 'https://graph.instagram.com';
  private bulgarianConfig = {
    defaultLanguage: 'bg' as const,
    currency: 'EUR',
    timezone: 'Europe/Sofia',
    countryCode: 'BG'
  };

  // Professional services for production readiness
  // (Comment removed - was in Arabic)
  private logger: any;
  private rateLimiter: any;

  constructor() {
    // Initialize with environment variables
    this.accessToken = process.env.REACT_APP_INSTAGRAM_ACCESS_TOKEN || null;

    // Initialize professional services - using global logger
    this.logger = logger as any;

    this.rateLimiter = rateLimiter;

    this.logger.info('InstagramService initialized', {
      hasAccessToken: !!this.accessToken,
      config: this.bulgarianConfig
    });
  }

  /**
   * Set access token for API calls
   * (Comment removed - was in Arabic)
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Get current user profile
   * (Comment removed - was in Arabic)
   */
  async getCurrentUser(): Promise<InstagramUserProfile> {
    const cacheKey = 'current_user_profile';

    // Check cache first
    const cached = socialMediaCache.get<InstagramUserProfile>(cacheKey);
    if (cached) {
      this.logger.debug('Returning cached Instagram user profile');
      return cached;
    }

    if (!this.accessToken) {
      const error = new Error('Instagram access token required / مطلوب رمز وصول Instagram');
      this.logger.error('Instagram access token missing', undefined, { errorMessage: error.message });
      throw error;
    }

    try {
      // Check rate limit
      await this.rateLimiter.checkLimit('getCurrentUser');

      this.logger.info('Fetching Instagram user profile');

      const response = await fetch(`${this.baseUrl}/me?fields=id,username,account_type,media_count&access_token=${this.accessToken}`);

      if (!response.ok) {
        const errorData = await response.text();
        this.logger.error('Instagram API error', undefined, {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`Instagram API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      const userProfile = this.mapInstagramUser(data);

      // Cache the result
      socialMediaCache.set(cacheKey, userProfile, 300000); // 5 minutes

      this.logger.info('Successfully fetched Instagram user profile', {
        username: userProfile.username,
        followerCount: userProfile.followerCount
      });

      return userProfile;
    } catch (error) {
      this.logger.error('Error fetching Instagram user profile',
        error instanceof Error ? error : new Error(String(error)), {
        hasAccessToken: !!this.accessToken
      });

      // If it's a rate limit error, handle it specially
      if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
        this.logger.warn('Rate limit exceeded for Instagram API', { error: error.message });
      }

      throw error;
    }
  }

  /**
   * Post car content to Instagram
   * (Comment removed - was in Arabic)
   */
  async postCarContent(postData: InstagramCarPost): Promise<InstagramPost> {
    if (!this.accessToken) {
      throw new Error('Instagram access token required / مطلوب رمز وصول Instagram');
    }

    try {
      // Create container for the media
      const containerData = {
        image_url: postData.mediaUrls[0], // For single image
        caption: this.generateBulgarianCaption(postData),
        access_token: this.accessToken
      };

      // Create media container
      const containerResponse = await fetch(`${this.baseUrl}/me/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(containerData)
      });

      if (!containerResponse.ok) {
        throw new Error(`Instagram container creation error: ${containerResponse.status}`);
      }

      const containerResult = await containerResponse.json();
      const containerId = containerResult.id;

      // Publish the container
      const publishResponse = await fetch(`${this.baseUrl}/me/media_publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: this.accessToken
        })
      });

      if (!publishResponse.ok) {
        throw new Error(`Instagram publish error: ${publishResponse.status}`);
      }

      const publishResult = await publishResponse.json();

      // Get the published media details
      const mediaResponse = await fetch(`${this.baseUrl}/${publishResult.id}?fields=id,media_type,media_url,thumbnail_url,caption,permalink,timestamp,like_count,comments_count&access_token=${this.accessToken}`);

      if (!mediaResponse.ok) {
        throw new Error(`Instagram media fetch error: ${mediaResponse.status}`);
      }

      const mediaData = await mediaResponse.json();
      return this.mapInstagramPost(mediaData);
    } catch (error) {
      console.error('[SERVICE] Error posting to Instagram:', error);
      throw error;
    }
  }

  /**
   * Get user's posts
   * (Comment removed - was in Arabic)
   */
  async getUserPosts(limit: number = 20): Promise<InstagramPost[]> {
    if (!this.accessToken) {
      throw new Error('Instagram access token required / مطلوب رمز وصول Instagram');
    }

    try {
      const response = await fetch(`${this.baseUrl}/me/media?fields=id,media_type,media_url,thumbnail_url,caption,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${this.accessToken}`);

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data.map((post: any) => this.mapInstagramPost(post));
    } catch (error) {
      console.error('[SERVICE] Error fetching Instagram posts:', error);
      throw error;
    }
  }

  /**
   * Search for car-related posts
   * (Comment removed - was in Arabic)
   */
  async searchCarPosts(query: string, limit: number = 20): Promise<InstagramPost[]> {
    try {
      // Use Instagram's hashtag search
      const hashtag = encodeURIComponent(query.replace(/\s+/g, '').toLowerCase());
      const response = await fetch(`${this.baseUrl}/ig_hashtag_search?user_id=me&q=${hashtag}&access_token=${this.accessToken}`);

      if (!response.ok) {
        throw new Error(`Instagram hashtag search error: ${response.status}`);
      }

      const hashtagData = await response.json();
      const hashtagId = hashtagData.data[0]?.id;

      if (!hashtagId) {
        return [];
      }

      // Get recent media for this hashtag
      const mediaResponse = await fetch(`${this.baseUrl}/${hashtagId}/recent_media?fields=id,media_type,media_url,thumbnail_url,caption,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${this.accessToken}`);

      if (!mediaResponse.ok) {
        throw new Error(`Instagram media fetch error: ${mediaResponse.status}`);
      }

      const mediaData = await mediaResponse.json();
      return mediaData.data.map((post: any) => this.mapInstagramPost(post));
    } catch (error) {
      console.error('[SERVICE] Error searching Instagram posts:', error);
      throw error;
    }
  }

  /**
   * Get trending car posts in Bulgaria
   * (Comment removed - was in Arabic)
   */
  async getTrendingBulgarianCarPosts(limit: number = 20): Promise<InstagramPost[]> {
    try {
      const bulgarianHashtags = [
        'коли',
        'автомобили',
        'cars',
        'bmw',
        'mercedes',
        'продажбаколи',
        'carsale',
        'българскиавтомобили',
        'bulgariancars'
      ];

      const allPosts: InstagramPost[] = [];

      for (const hashtag of bulgarianHashtags) {
        try {
          const posts = await this.searchCarPosts(hashtag, Math.ceil(limit / bulgarianHashtags.length));
          allPosts.push(...posts);
        } catch (error) {
          console.warn(`Error searching for hashtag "${hashtag}":`, error);
        }
      }

      // Remove duplicates and sort by engagement
      const uniquePosts = allPosts
        .filter((post, index, self) =>
          index === self.findIndex(p => p.id === post.id)
        )
        .sort((a, b) => (b.likeCount + b.commentCount) - (a.likeCount + a.commentCount))
        .slice(0, limit);

      return uniquePosts;
    } catch (error) {
      console.error('[SERVICE] Error getting trending Bulgarian car posts:', error);
      throw error;
    }
  }

  /**
   * Get post comments
   * (Comment removed - was in Arabic)
   */
  async getPostComments(postId: string, limit: number = 20): Promise<InstagramComment[]> {
    if (!this.accessToken) {
      throw new Error('Instagram access token required / مطلوب رمز وصول Instagram');
    }

    try {
      const response = await fetch(`${this.baseUrl}/${postId}/comments?fields=id,text,username,timestamp,like_count,replies&limit=${limit}&access_token=${this.accessToken}`);

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data.map((comment: any) => this.mapInstagramComment(comment));
    } catch (error) {
      console.error('[SERVICE] Error fetching post comments:', error);
      throw error;
    }
  }

  /**
   * Create Instagram Story for car
   * (Comment removed - was in Arabic)
   */
  async createCarStory(storyData: { carId: string; mediaUrl: string; stickerText?: string }): Promise<InstagramStory> {
    if (!this.accessToken) {
      throw new Error('Instagram access token required / مطلوب رمز وصول Instagram');
    }

    try {
      // Create story container
      const containerData = {
        image_url: storyData.mediaUrl,
        access_token: this.accessToken
      };

      const containerResponse = await fetch(`${this.baseUrl}/me/stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(containerData)
      });

      if (!containerResponse.ok) {
        throw new Error(`Instagram story creation error: ${containerResponse.status}`);
      }

      const containerResult = await containerResponse.json();

      return {
        id: containerResult.id,
        mediaType: 'IMAGE',
        mediaUrl: storyData.mediaUrl,
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        carId: storyData.carId
      };
    } catch (error) {
      console.error('[SERVICE] Error creating Instagram story:', error);
      throw error;
    }
  }

  /**
   * Generate Bulgarian caption for car post
   * (Comment removed - was in Arabic)
   */
  private generateBulgarianCaption(postData: InstagramCarPost): string {
    let caption = postData.caption;

    // Add hashtags
    if (postData.hashtags && postData.hashtags.length > 0) {
      caption += '\n\n' + postData.hashtags.map(tag => `#${tag}`).join(' ');
    }

    // Add Bulgarian car marketplace branding
    caption += '\n\n#GlobulCars #БългарскиАвтомобили #ПродажбаКоли #АвтоБГ';

    return caption;
  }

  /**
   * Map Instagram API user data to our interface
   * (Comment removed - was in Arabic)
   */
  private mapInstagramUser(data: any): InstagramUserProfile {
    return {
      id: data.id,
      username: data.username,
      fullName: data.name || '',
      biography: data.biography || '',
      profilePictureUrl: data.profile_picture_url || '',
      followerCount: data.followers_count || 0,
      followingCount: data.follows_count || 0,
      mediaCount: data.media_count || 0,
      isVerified: data.is_verified || false,
      isBusinessAccount: data.is_business_account || false,
      location: data.location || this.bulgarianConfig.countryCode
    };
  }

  /**
   * Map Instagram API post data to our interface
   * (Comment removed - was in Arabic)
   */
  private mapInstagramPost(data: any): InstagramPost {
    return {
      id: data.id,
      mediaType: data.media_type,
      mediaUrl: data.media_url,
      thumbnailUrl: data.thumbnail_url,
      caption: data.caption || '',
      permalink: data.permalink,
      timestamp: data.timestamp,
      likeCount: data.like_count || 0,
      commentCount: data.comments_count || 0,
      viewCount: data.view_count,
      hashtags: this.extractHashtags(data.caption || ''),
      language: this.detectLanguage(data.caption || ''),
      carId: data.car_id
    };
  }

  /**
   * Map Instagram API comment data to our interface
   * (Comment removed - was in Arabic)
   */
  private mapInstagramComment(data: any): InstagramComment {
    return {
      id: data.id,
      text: data.text,
      username: data.username,
      timestamp: data.timestamp,
      likeCount: data.like_count || 0,
      replies: data.replies?.data?.map((reply: any) => this.mapInstagramComment(reply))
    };
  }

  /**
   * Extract hashtags from text
   * (Comment removed - was in Arabic)
   */
  private extractHashtags(text: string): string[] {
    const hashtagRegex = /#[\w\u0400-\u04FF]+/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
  }

  /**
   * Detect language from text
   * (Comment removed - was in Arabic)
   */
  private detectLanguage(text: string): 'bg' | 'en' {
    // Simple language detection based on Cyrillic characters
    const cyrillicRegex = /[\u0400-\u04FF]/;
    return cyrillicRegex.test(text) ? 'bg' : 'en';
  }
}

// Create singleton instance
export const bulgarianInstagramService = new InstagramService();

export default InstagramService;