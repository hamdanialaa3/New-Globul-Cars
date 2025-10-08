// src/services/tiktok-service.ts
// TikTok Integration Service for Bulgarian Car Marketplace
// (Comment removed - was in Arabic)

import { Logger, LogLevel } from './logger-service';
import { rateLimiter } from './rate-limiting-service';
import { socialMediaCache } from './cache-service';

// TikTok Video interface
export interface TikTokVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  hashtags: string[];
  carId?: string;
  language: 'bg' | 'en';
}

// TikTok Car Post interface
export interface TikTokCarPost {
  carId: string;
  title: string;
  description: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  hashtags: string[];
  location?: string;
  language: 'bg' | 'en';
  privacyLevel: 'public' | 'friends' | 'private';
}

// TikTok Comment interface
export interface TikTokComment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  likes: number;
  replies?: TikTokComment[];
}

// TikTok User Profile interface
export interface TikTokUserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  followerCount: number;
  followingCount: number;
  videoCount: number;
  verified: boolean;
  location?: string;
}

/**
 * TikTok Service for Bulgarian Car Marketplace
 * (Comment removed - was in Arabic)
 */
class TikTokService {
  private accessToken: string | null = null;
  private baseUrl = 'https://open-api.tiktok.com';
  private bulgarianConfig = {
    defaultLanguage: 'bg' as const,
    currency: 'EUR',
    timezone: 'Europe/Sofia',
    countryCode: 'BG'
  };

  // Professional services for production readiness
  // (Comment removed - was in Arabic)
  private logger: Logger;
  private rateLimiter: any;

  constructor() {
    // Initialize with environment variables
    this.accessToken = process.env.REACT_APP_TIKTOK_ACCESS_TOKEN || null;

    // Initialize professional services
    this.logger = new Logger('TikTokService', {
      level: LogLevel.INFO,
      enableConsole: true,
      enableRemote: true,
      maxEntries: 1000,
      retentionDays: 7
    });

    this.rateLimiter = rateLimiter;

    this.logger.info('TikTokService initialized', {
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
  async getCurrentUser(): Promise<TikTokUserProfile> {
    const cacheKey = 'current_user_profile';

    // Check cache first
    const cached = socialMediaCache.get<TikTokUserProfile>(cacheKey);
    if (cached) {
      this.logger.debug('Returning cached TikTok user profile');
      return cached;
    }

    if (!this.accessToken) {
      const error = new Error('TikTok access token required / مطلوب رمز وصول TikTok');
      this.logger.error('TikTok access token missing', undefined, { errorMessage: error.message });
      throw error;
    }

    try {
      // Check rate limit
      await this.rateLimiter.checkLimit('getCurrentUser');

      this.logger.info('Fetching TikTok user profile');

      const response = await fetch(`${this.baseUrl}/user/info/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        this.logger.error('TikTok API error', undefined, {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`TikTok API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      const userProfile = this.mapTikTokUser(data.data);

      // Cache the result
      socialMediaCache.set(cacheKey, userProfile, 300000); // 5 minutes

      this.logger.info('Successfully fetched TikTok user profile', {
        username: userProfile.username,
        followerCount: userProfile.followerCount
      });

      return userProfile;
    } catch (error) {
      this.logger.error('Error fetching TikTok user profile', error instanceof Error ? error : new Error(String(error)), {
        hasAccessToken: !!this.accessToken
      });

      // If it's a rate limit error, handle it specially
      if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
        this.logger.warn('Rate limit exceeded for TikTok API', { error: error.message });
      }

      throw error;
    }
  }

  /**
   * Post car video to TikTok
   * (Comment removed - was in Arabic)
   */
  async postCarVideo(postData: TikTokCarPost): Promise<TikTokVideo> {
    if (!this.accessToken) {
      throw new Error('TikTok access token required / مطلوب رمز وصول TikTok');
    }

    try {
      // Prepare video data
      const videoData = {
        title: postData.title,
        description: this.generateBulgarianDescription(postData),
        video_url: postData.videoUrl,
        thumbnail_url: postData.thumbnailUrl,
        privacy_level: postData.privacyLevel,
        disable_duet: false,
        disable_stitch: false,
        disable_comment: false,
        video_cover_timestamp_ms: 1000
      };

      const response = await fetch(`${this.baseUrl}/share/video/upload/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(videoData)
      });

      if (!response.ok) {
        throw new Error(`TikTok API error: ${response.status}`);
      }

      const data = await response.json();
      return this.mapTikTokVideo(data.data);
    } catch (error) {
      console.error('[SERVICE] Error posting to TikTok:', error);
      throw error;
    }
  }

  /**
   * Get user's videos
   * (Comment removed - was in Arabic)
   */
  async getUserVideos(userId?: string, limit: number = 20): Promise<TikTokVideo[]> {
    if (!this.accessToken) {
      throw new Error('TikTok access token required / مطلوب رمز وصول TikTok');
    }

    try {
      const response = await fetch(`${this.baseUrl}/video/list/?count=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`TikTok API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data.videos.map((video: any) => this.mapTikTokVideo(video));
    } catch (error) {
      console.error('[SERVICE] Error fetching TikTok videos:', error);
      throw error;
    }
  }

  /**
   * Search for car-related videos
   * (Comment removed - was in Arabic)
   */
  async searchCarVideos(query: string, limit: number = 20): Promise<TikTokVideo[]> {
    try {
      // Use TikTok's search API
      const searchQuery = encodeURIComponent(`${query} cars automobiles`);
      const response = await fetch(`${this.baseUrl}/research/video/query/?keyword=${searchQuery}&count=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`TikTok API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data.videos.map((video: any) => this.mapTikTokVideo(video));
    } catch (error) {
      console.error('[SERVICE] Error searching TikTok videos:', error);
      throw error;
    }
  }

  /**
   * Get trending car videos in Bulgaria
   * (Comment removed - was in Arabic)
   */
  async getTrendingBulgarianCarVideos(limit: number = 20): Promise<TikTokVideo[]> {
    try {
      const bulgarianQueries = [
        'коли българия',
        'автомобили бг',
        'cars bulgaria',
        'bmw българия',
        'mercedes бг',
        'продажба коли',
        'car sale bulgaria'
      ];

      const allVideos: TikTokVideo[] = [];

      for (const query of bulgarianQueries) {
        try {
          const videos = await this.searchCarVideos(query, Math.ceil(limit / bulgarianQueries.length));
          allVideos.push(...videos);
        } catch (error) {
          console.warn(`Error searching for "${query}":`, error);
        }
      }

      // Remove duplicates and sort by engagement
      const uniqueVideos = allVideos
        .filter((video, index, self) =>
          index === self.findIndex(v => v.id === video.id)
        )
        .sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares))
        .slice(0, limit);

      return uniqueVideos;
    } catch (error) {
      console.error('[SERVICE] Error getting trending Bulgarian car videos:', error);
      throw error;
    }
  }

  /**
   * Get video comments
   * (Comment removed - was in Arabic)
   */
  async getVideoComments(videoId: string, limit: number = 20): Promise<TikTokComment[]> {
    if (!this.accessToken) {
      throw new Error('TikTok access token required / مطلوب رمز وصول TikTok');
    }

    try {
      const response = await fetch(`${this.baseUrl}/video/comment/list/?video_id=${videoId}&count=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`TikTok API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data.comments.map((comment: any) => this.mapTikTokComment(comment));
    } catch (error) {
      console.error('[SERVICE] Error fetching video comments:', error);
      throw error;
    }
  }

  /**
   * Generate Bulgarian description for car post
   * (Comment removed - was in Arabic)
   */
  private generateBulgarianDescription(postData: TikTokCarPost): string {
    let description = postData.description;

    // Add hashtags
    if (postData.hashtags && postData.hashtags.length > 0) {
      description += '\n\n' + postData.hashtags.map(tag => `#${tag}`).join(' ');
    }

    // Add Bulgarian car marketplace branding
    description += '\n\n#GlobulCars #БългарскиАвтомобили #ПродажбаКоли';

    return description;
  }

  /**
   * Map TikTok API user data to our interface
   * (Comment removed - was in Arabic)
   */
  private mapTikTokUser(data: any): TikTokUserProfile {
    return {
      id: data.user_id || data.id,
      username: data.username || data.unique_id,
      displayName: data.nickname || data.display_name,
      bio: data.signature || data.bio || '',
      avatarUrl: data.avatar_url || data.avatar,
      followerCount: data.follower_count || 0,
      followingCount: data.following_count || 0,
      videoCount: data.video_count || 0,
      verified: data.verified || false,
      location: data.location || this.bulgarianConfig.countryCode
    };
  }

  /**
   * Map TikTok API video data to our interface
   * (Comment removed - was in Arabic)
   */
  private mapTikTokVideo(data: any): TikTokVideo {
    return {
      id: data.video_id || data.id,
      title: data.title || data.desc || '',
      description: data.desc || data.description || '',
      videoUrl: data.video_url || data.play_url,
      thumbnailUrl: data.thumbnail_url || data.cover_url,
      duration: data.duration || 0,
      views: data.view_count || data.stats?.play_count || 0,
      likes: data.like_count || data.stats?.digg_count || 0,
      comments: data.comment_count || data.stats?.comment_count || 0,
      shares: data.share_count || data.stats?.share_count || 0,
      createdAt: data.create_time || data.createTime,
      hashtags: this.extractHashtags(data.desc || data.description || ''),
      language: this.detectLanguage(data.desc || data.description || ''),
      carId: data.car_id
    };
  }

  /**
   * Map TikTok API comment data to our interface
   * (Comment removed - was in Arabic)
   */
  private mapTikTokComment(data: any): TikTokComment {
    return {
      id: data.comment_id || data.id,
      text: data.text || data.content,
      authorId: data.user_id || data.user?.id,
      authorName: data.user?.nickname || data.user?.display_name || 'Unknown',
      createdAt: data.create_time || data.createTime,
      likes: data.like_count || data.digg_count || 0,
      replies: data.replies?.map((reply: any) => this.mapTikTokComment(reply))
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
export const bulgarianTikTokService = new TikTokService();

export default TikTokService;