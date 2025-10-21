/**
 * Recommendations Service - ML-based content recommendations
 * Location: Bulgaria | Languages: BG/EN | Currency: EUR
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';

// ==================== INTERFACES ====================

export interface UserRecommendation {
  userId: string;
  displayName: string;
  profileImage?: string;
  profileType: 'private' | 'dealer' | 'company';
  isVerified: boolean;
  reason: string;
  score: number;
  mutualFollowers: number;
}

export interface PostRecommendation {
  postId: string;
  authorId: string;
  content: string;
  images: string[];
  likes: number;
  comments: number;
  reason: string;
  score: number;
}

export interface CarRecommendation {
  carId: string;
  make: string;
  model: string;
  year: number;
  price: number;
  images: string[];
  reason: string;
  score: number;
}

// ==================== SERVICE CLASS ====================

class RecommendationsService {
  /**
   * Get personalized user recommendations based on collaborative filtering
   */
  async getUserRecommendations(userId: string, limitCount = 10): Promise<UserRecommendation[]> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return [];
      
      const userData = userDoc.data();
      const userInterests = userData.interests || [];
      const userFollowing = await this.getFollowingIds(userId);
      
      const allUsers = await getDocs(
        query(
          collection(db, 'users'),
          where('isActive', '==', true),
          limit(100)
        )
      );
      
      const recommendations: UserRecommendation[] = [];
      
      for (const userDocSnap of allUsers.docs) {
        const targetUserId = userDocSnap.id;
        
        if (targetUserId === userId || userFollowing.includes(targetUserId)) {
          continue;
        }
        
        const targetUser = userDocSnap.data();
        const targetInterests = targetUser.interests || [];
        
        const commonInterests = userInterests.filter((interest: string) => 
          targetInterests.includes(interest)
        );
        
        const mutualFollowers = await this.getMutualFollowersCount(userId, targetUserId);
        
        let score = 0;
        let reason = '';
        
        if (mutualFollowers > 0) {
          score += mutualFollowers * 2;
          reason = `${mutualFollowers} mutual followers`;
        }
        
        if (commonInterests.length > 0) {
          score += commonInterests.length * 3;
          if (reason) reason += ' • ';
          reason += `Interested in ${commonInterests[0]}`;
        }
        
        if (targetUser.profileType === 'dealer' || targetUser.profileType === 'company') {
          score += 1;
        }
        
        if (targetUser.isVerified) {
          score += 2;
          if (reason) reason += ' • ';
          reason += 'Verified';
        }
        
        if (score > 0) {
          recommendations.push({
            userId: targetUserId,
            displayName: targetUser.displayName || 'Anonymous',
            profileImage: targetUser.profileImage?.url,
            profileType: targetUser.profileType || 'private',
            isVerified: targetUser.isVerified || false,
            reason: reason || 'Recommended for you',
            score,
            mutualFollowers
          });
        }
      }
      
      recommendations.sort((a, b) => b.score - a.score);
      return recommendations.slice(0, limitCount);
    } catch (error) {
      console.error('[RECOMMENDATIONS] Error getting user recommendations:', error);
      return [];
    }
  }

  /**
   * Get personalized post recommendations
   */
  async getPostRecommendations(userId: string, limitCount = 20): Promise<PostRecommendation[]> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return [];
      
      const userData = userDoc.data();
      const userInterests = userData.interests || [];
      
      const recentPosts = await getDocs(
        query(
          collection(db, 'posts'),
          where('visibility', '==', 'public'),
          orderBy('createdAt', 'desc'),
          limit(50)
        )
      );
      
      const recommendations: PostRecommendation[] = [];
      
      for (const postDoc of recentPosts.docs) {
        const post = postDoc.data();
        const postTags = post.tags || [];
        
        const commonTags = userInterests.filter((interest: string) => 
          postTags.includes(interest)
        );
        
        let score = 0;
        let reason = '';
        
        score += (post.likes || 0) * 0.5;
        score += (post.comments || 0) * 1;
        score += commonTags.length * 5;
        
        if (post.hasMedia) {
          score += 2;
        }
        
        if (commonTags.length > 0) {
          reason = `Matches your interest in ${commonTags[0]}`;
        } else if (post.likes > 10) {
          reason = 'Popular post';
        } else {
          reason = 'Recommended for you';
        }
        
        recommendations.push({
          postId: postDoc.id,
          authorId: post.authorId,
          content: post.content,
          images: post.images || [],
          likes: post.likes || 0,
          comments: post.comments || 0,
          reason,
          score
        });
      }
      
      recommendations.sort((a, b) => b.score - a.score);
      return recommendations.slice(0, limitCount);
    } catch (error) {
      console.error('[RECOMMENDATIONS] Error getting post recommendations:', error);
      return [];
    }
  }

  /**
   * Get similar car recommendations
   */
  async getCarRecommendations(userId: string, limitCount = 10): Promise<CarRecommendation[]> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return [];
      
      const userData = userDoc.data();
      const viewHistory = userData.viewHistory || [];
      
      if (viewHistory.length === 0) {
        return this.getTrendingCars(limitCount);
      }
      
      const lastViewed = viewHistory.slice(-5);
      
      const carDocs = await Promise.all(
        lastViewed.map((carId: string) => 
          getDoc(doc(db, 'cars', carId))
        )
      );
      
      const viewedCars = carDocs
        .filter(doc => doc.exists())
        .map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (viewedCars.length === 0) {
        return this.getTrendingCars(limitCount);
      }
      
      const avgPrice = viewedCars.reduce((sum, car: any) => sum + (car.price || 0), 0) / viewedCars.length;
      const makes = [...new Set(viewedCars.map((car: any) => car.make))];
      
      const similarCars = await getDocs(
        query(
          collection(db, 'cars'),
          where('status', '==', 'active'),
          orderBy('createdAt', 'desc'),
          limit(50)
        )
      );
      
      const recommendations: CarRecommendation[] = [];
      
      for (const carDoc of similarCars.docs) {
        if (lastViewed.includes(carDoc.id)) continue;
        
        const car = carDoc.data();
        let score = 0;
        let reason = '';
        
        if (makes.includes(car.make)) {
          score += 10;
          reason = `Similar to your viewed ${car.make} cars`;
        }
        
        const priceDiff = Math.abs((car.price || 0) - avgPrice);
        if (priceDiff < avgPrice * 0.2) {
          score += 8;
          if (reason) reason += ' • ';
          reason += 'In your price range';
        }
        
        if (car.images && car.images.length > 3) {
          score += 2;
        }
        
        if (score > 0) {
          recommendations.push({
            carId: carDoc.id,
            make: car.make,
            model: car.model,
            year: car.year,
            price: car.price || 0,
            images: car.images || [],
            reason: reason || 'You might like this',
            score
          });
        }
      }
      
      recommendations.sort((a, b) => b.score - a.score);
      return recommendations.slice(0, limitCount);
    } catch (error) {
      console.error('[RECOMMENDATIONS] Error getting car recommendations:', error);
      return [];
    }
  }

  // ==================== PRIVATE HELPERS ====================

  private async getFollowingIds(userId: string): Promise<string[]> {
    const followsSnapshot = await getDocs(
      query(collection(db, 'follows'), where('followerId', '==', userId))
    );
    
    return followsSnapshot.docs.map(doc => doc.data().followingId);
  }

  private async getMutualFollowersCount(userId1: string, userId2: string): Promise<number> {
    const user1Following = await this.getFollowingIds(userId1);
    const user2Following = await this.getFollowingIds(userId2);
    
    const mutual = user1Following.filter(id => user2Following.includes(id));
    return mutual.length;
  }

  private async getTrendingCars(limitCount: number): Promise<CarRecommendation[]> {
    const trendingCars = await getDocs(
      query(
        collection(db, 'cars'),
        where('status', '==', 'active'),
        orderBy('views', 'desc'),
        limit(limitCount)
      )
    );
    
    return trendingCars.docs.map(doc => {
      const car = doc.data();
      return {
        carId: doc.id,
        make: car.make,
        model: car.model,
        year: car.year,
        price: car.price || 0,
        images: car.images || [],
        reason: 'Trending now',
        score: car.views || 0
      };
    });
  }
}

export const recommendationsService = new RecommendationsService();
