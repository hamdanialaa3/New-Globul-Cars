import { collection, getDocs, query, where, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { logger } from '../logger-service';

interface SmartContact {
  id: string;
  displayName: string;
  photoURL?: string;
  isOnline: boolean;
  location?: {
    city?: string;
    country?: string;
  };
  interests?: string[];
  lastActivity?: Date;
  mutualFriends?: number;
  relevanceScore: number;
}

class SmartContactsService {
  private static instance: SmartContactsService;

  public static getInstance(): SmartContactsService {
    if (!SmartContactsService.instance) {
      SmartContactsService.instance = new SmartContactsService();
    }
    return SmartContactsService.instance;
  }

  // Get smart contacts with intelligent ranking
  public async getSmartContacts(
    currentUserId: string,
    limitCount: number = 20
  ): Promise<SmartContact[]> {
    try {
      logger.info('Fetching smart contacts', { userId: currentUserId, limit: limitCount });

      // Fetch all users from Firestore
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const allUsers = usersSnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            displayName: data.displayName || data.email?.split('@')[0] || 'User',
            photoURL: data.photoURL || data.profile?.avatar || `https://i.pravatar.cc/150?u=${doc.id}`,
            isOnline: data.isOnline || false,
            location: data.location || { city: 'Unknown', country: 'Bulgaria' },
            interests: data.interests || this.extractInterestsFromProfile(data),
            lastActivity: data.lastActivity?.toDate ? data.lastActivity.toDate() : new Date(data.lastActivity || Date.now()),
            mutualFriends: 0, // Will be calculated
            relevanceScore: 0, // Will be calculated
          };
        })
        .filter(user => user.id !== currentUserId); // Exclude current user

      // Get current user data for comparison
      const currentUser = await this.getUserData(currentUserId);

      // Calculate relevance scores using smart algorithms
      const rankedUsers = allUsers.map(user => ({
        ...user,
        relevanceScore: this.calculateRelevanceScore(user, currentUser),
      }));

      // Sort by relevance score (highest first) and online status
      rankedUsers.sort((a, b) => {
        // Online users first
        if (a.isOnline !== b.isOnline) {
          return b.isOnline ? 1 : -1;
        }
        // Then by relevance score
        return b.relevanceScore - a.relevanceScore;
      });

      // Return top N contacts
      const topContacts = rankedUsers.slice(0, limitCount);

      logger.info('Smart contacts fetched successfully', {
        total: allUsers.length,
        returned: topContacts.length,
      });

      return topContacts;
    } catch (error) {
      logger.error('Error fetching smart contacts', error as Error);
      // Return empty array instead of throwing
      return [];
    }
  }

  // Calculate relevance score based on multiple factors
  private calculateRelevanceScore(
    contact: SmartContact,
    currentUser: any
  ): number {
    let score = 0;

    // 1. Location proximity (30 points max)
    if (currentUser?.location && contact.location) {
      if (contact.location.city === currentUser.location.city) {
        score += 30; // Same city
      } else if (contact.location.country === currentUser.location.country) {
        score += 15; // Same country
      }
    }

    // 2. Shared interests (40 points max)
    if (currentUser?.interests && contact.interests) {
      const sharedInterests = contact.interests.filter(
        (interest: string) => currentUser.interests?.includes(interest)
      );
      score += Math.min(sharedInterests.length * 10, 40);
    }

    // 3. Recent activity (20 points max)
    if (contact.lastActivity) {
      const hoursSinceActivity = (Date.now() - contact.lastActivity.getTime()) / (1000 * 60 * 60);
      if (hoursSinceActivity < 1) {
        score += 20; // Active in last hour
      } else if (hoursSinceActivity < 24) {
        score += 10; // Active today
      } else if (hoursSinceActivity < 168) {
        score += 5; // Active this week
      }
    }

    // 4. Online status bonus (10 points)
    if (contact.isOnline) {
      score += 10;
    }

    return score;
  }

  // Get user data for comparison
  private async getUserData(userId: string): Promise<any> {
    try {
      const usersSnapshot = await getDocs(
        query(collection(db, 'users'), where('__name__', '==', userId))
      );

      if (!usersSnapshot.empty) {
        const data = usersSnapshot.docs[0].data();
        return {
          id: userId,
          location: data.location || { city: 'Unknown', country: 'Bulgaria' },
          interests: data.interests || this.extractInterestsFromProfile(data),
        };
      }

      return null;
    } catch (error) {
      logger.error('Error fetching user data', error as Error);
      return null;
    }
  }

  // Extract interests from user profile
  private extractInterestsFromProfile(userData: any): string[] {
    const interests: string[] = [];

    // Extract from profile data
    if (userData.profile?.favoriteCarBrands) {
      interests.push(...userData.profile.favoriteCarBrands);
    }

    if (userData.profile?.carPreferences) {
      interests.push(...Object.keys(userData.profile.carPreferences));
    }

    // Add default car-related interests
    if (interests.length === 0) {
      interests.push('cars', 'automotive');
    }

    return interests;
  }

  // Get online users count
  public async getOnlineUsersCount(): Promise<number> {
    try {
      const usersSnapshot = await getDocs(
        query(collection(db, 'users'), where('isOnline', '==', true))
      );
      return usersSnapshot.docs.length;
    } catch (error) {
      logger.error('Error fetching online users count', error as Error);
      return 0;
    }
  }

  // Get recent active users
  public async getRecentActiveUsers(limitCount: number = 10): Promise<SmartContact[]> {
    try {
      const usersSnapshot = await getDocs(
        query(
          collection(db, 'users'),
          orderBy('lastActivity', 'desc'),
          firestoreLimit(limitCount)
        )
      );

      return usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          displayName: data.displayName || data.email?.split('@')[0] || 'User',
          photoURL: data.photoURL || `https://i.pravatar.cc/150?u=${doc.id}`,
          isOnline: data.isOnline || false,
          location: data.location,
          interests: data.interests,
          lastActivity: data.lastActivity?.toDate(),
          relevanceScore: 0,
        };
      });
    } catch (error) {
      logger.error('Error fetching recent active users', error as Error);
      return [];
    }
  }
}

export const smartContactsService = SmartContactsService.getInstance();

