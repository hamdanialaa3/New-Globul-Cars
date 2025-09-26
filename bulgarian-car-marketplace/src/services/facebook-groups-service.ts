// src/services/facebook-groups-service.ts
// Facebook Groups API Service for Bulgarian Car Marketplace
// خدمة Facebook Groups API لسوق السيارات البلغاري

import { FacebookGraphService, bulgarianFacebookGraph } from './facebook-graph-service';

export interface FacebookGroup {
  id: string;
  name: string;
  description?: string;
  privacy: 'OPEN' | 'CLOSED' | 'SECRET';
  memberCount?: number;
  cover?: {
    source: string;
  };
  icon?: string;
  updatedTime: string;
}

export interface GroupPost {
  id: string;
  message?: string;
  story?: string;
  createdTime: string;
  updatedTime: string;
  type: string;
  statusType: string;
  permalinkUrl: string;
  attachments?: any[];
  comments?: {
    data: any[];
    summary: { totalCount: number };
  };
  reactions?: {
    summary: { totalCount: number };
  };
}

export interface CarGroupPost {
  groupId: string;
  carId: string;
  message: string;
  link?: string;
  images?: string[];
  tags?: string[];
}

/**
 * Facebook Groups Service for Bulgarian Car Marketplace
 * خدمة مجموعات Facebook لسوق السيارات البلغاري
 */
class FacebookGroupsService {
  private graphService: FacebookGraphService;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  constructor(graphService: FacebookGraphService) {
    this.graphService = graphService;
  }

  /**
   * Set access token for API calls
   * تعيين رمز الوصول لاستدعاءات API
   */
  setAccessToken(token: string): void {
    if (this.graphService && typeof (this.graphService as any).setAccessToken === 'function') {
      (this.graphService as any).setAccessToken(token);
    }
  }

  /**
   * Get user's groups
   * الحصول على مجموعات المستخدم
   */
  async getUserGroups(userId: string = 'me'): Promise<FacebookGroup[]> {
    try {
      const endpoint = `${userId}/groups?fields=id,name,description,privacy,member_count,cover,icon,updated_time&limit=100`;
      const response: any = await (this.graphService as any)['makeRequest'](endpoint);

      return response.data || [];
    } catch (error) {
      console.error('Error fetching user groups:', error);
      throw error;
    }
  }

  /**
   * Get car-related groups in Bulgaria
   * الحصول على المجموعات المتعلقة بالسيارات في بلغاريا
   */
  async getBulgarianCarGroups(): Promise<FacebookGroup[]> {
    try {
      // Search for Bulgarian car groups
      const searchTerms = [
        'автомобили', 'коли', 'cars', 'automobiles',
        'BMW', 'Mercedes', 'Audi', 'Volkswagen',
        'продажба коли', 'car sale', 'авто пазар'
      ];

      const allGroups: FacebookGroup[] = [];

      for (const term of searchTerms) {
        try {
          const endpoint = `search?q=${encodeURIComponent(term)}&type=group&fields=id,name,description,privacy,member_count,cover,icon,updated_time&limit=50`;
          const response: any = await (this.graphService as any)['makeRequest'](endpoint);

          if (response.data) {
            allGroups.push(...response.data);
          }
        } catch (error) {
          console.warn(`Error searching for term "${term}":`, error);
        }
      }

      // Remove duplicates and filter Bulgarian groups
      const uniqueGroups = allGroups.filter((group, index, self) =>
        index === self.findIndex(g => g.id === group.id)
      );

      return uniqueGroups;
    } catch (error) {
      console.error('Error fetching Bulgarian car groups:', error);
      throw error;
    }
  }

  /**
   * Get group posts
   * الحصول على منشورات المجموعة
   */
  async getGroupPosts(groupId: string, limit: number = 25): Promise<GroupPost[]> {
    try {
      const endpoint = `${groupId}/feed?fields=id,message,story,created_time,updated_time,type,status_type,permalink_url,attachments{url,type,title,description},comments.summary(true),reactions.summary(true)&limit=${limit}`;
      const response: any = await (this.graphService as any)['makeRequest'](endpoint);

      return response.data || [];
    } catch (error) {
      console.error(`Error fetching posts for group ${groupId}:`, error);
      throw error;
    }
  }

  /**
   * Post to a car group
   * النشر في مجموعة سيارات
   */
  async postToCarGroup(postData: CarGroupPost): Promise<any> {
    try {
      const { groupId, message, link, tags } = postData;

      // Create post message with car details
      let postMessage = message;

      if (tags && tags.length > 0) {
        postMessage += '\n\n' + tags.map(tag => `#${tag}`).join(' ');
      }

      let endpoint = `${groupId}/feed?message=${encodeURIComponent(postMessage)}`;

      if (link) {
        endpoint += `&link=${encodeURIComponent(link)}`;
      }

      // Post to group
      const response: any = await (this.graphService as any)['makeRequest'](endpoint);

      return response;
    } catch (error) {
      console.error('Error posting to car group:', error);
      throw error;
    }
  }

  /**
   * Join a car group
   * الانضمام إلى مجموعة سيارات
   */
  async joinCarGroup(groupId: string): Promise<boolean> {
    try {
      const endpoint = `${groupId}/members`;
      await (this.graphService as any)['makeRequest'](endpoint);

      return true;
    } catch (error) {
      console.error(`Error joining group ${groupId}:`, error);
      return false;
    }
  }

  /**
   * Leave a car group
   * مغادرة مجموعة سيارات
   */
  async leaveCarGroup(groupId: string): Promise<boolean> {
    try {
      const endpoint = `${groupId}/members`;
      await (this.graphService as any)['makeRequest'](endpoint);

      return true;
    } catch (error) {
      console.error(`Error leaving group ${groupId}:`, error);
      return false;
    }
  }

  /**
   * Search for car groups by location
   * البحث عن مجموعات السيارات حسب الموقع
   */
  async searchCarGroupsByLocation(location: string, radius: number = 50): Promise<FacebookGroup[]> {
    try {
      const endpoint = `search?q=${encodeURIComponent(`автомобили ${location}`)}&type=group&fields=id,name,description,privacy,member_count,cover,icon,updated_time,location&limit=50`;
      const response: any = await (this.graphService as any)['makeRequest'](endpoint);

      return response.data || [];
    } catch (error) {
      console.error(`Error searching car groups in ${location}:`, error);
      throw error;
    }
  }

  /**
   * Get trending car discussions in groups
   * الحصول على المناقشات الرائجة حول السيارات في المجموعات
   */
  async getTrendingCarDiscussions(limit: number = 10): Promise<any[]> {
    try {
      const bulgarianGroups = await this.getBulgarianCarGroups();
      const trendingPosts: any[] = [];

      // Get recent posts from top groups
      for (const group of bulgarianGroups.slice(0, 5)) {
        try {
          const posts = await this.getGroupPosts(group.id, 5);

          // Filter posts with high engagement
          const engagedPosts = posts.filter(post =>
            (post.comments?.summary?.totalCount || 0) > 5 ||
            (post.reactions?.summary?.totalCount || 0) > 10
          );

          trendingPosts.push(...engagedPosts.map(post => ({
            ...post,
            groupName: group.name,
            groupId: group.id
          })));
        } catch (error) {
          console.warn(`Error fetching posts from group ${group.id}:`, error);
        }
      }

      // Sort by engagement and return top posts
      return trendingPosts
        .sort((a, b) => {
          const aEngagement = (a.comments?.summary?.totalCount || 0) + (a.reactions?.summary?.totalCount || 0);
          const bEngagement = (b.comments?.summary?.totalCount || 0) + (b.reactions?.summary?.totalCount || 0);
          return bEngagement - aEngagement;
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting trending car discussions:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const bulgarianGroupsService = new FacebookGroupsService(bulgarianFacebookGraph);

export default FacebookGroupsService;