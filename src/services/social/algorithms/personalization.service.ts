// Personalization Service - Track User Interests & Personalize Feed
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import {
  doc,
  getDoc,
  setDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase-config';
import { Post } from '../posts.service';
import {
  UserInterests,
  UserInterestsData,
  UserAction,
  PostScore,
  interestsToData,
  dataToInterests,
  getPriceRange
} from '../../../types/social-feed.types';
import { logger } from '../../logger-service';

class PersonalizationService {
  private readonly DECAY_RATE = 0.95;
  private readonly DECAY_INTERVAL = 86400000; // 24 hours

  // Get user interests
  async getUserInterests(userId: string): Promise<UserInterests> {
    try {
      const interestsDoc = await getDoc(doc(db, 'userInterests', userId));
      
      if (!interestsDoc.exists()) {
        return this.createDefaultInterests();
      }

      const data = interestsDoc.data() as UserInterestsData;
      return dataToInterests(data);
    } catch (error) {
      logger.error('Error getting user interests', error as Error, { userId });
      return this.createDefaultInterests();
    }
  }

  // Track user interaction
  async trackInterest(userId: string, action: UserAction, post: Post): Promise<void> {
    const interests = await this.getUserInterests(userId);

    const weight = this.getActionWeight(action.type);
    
    if (weight === 0) return;

    await this.updateInterests(interests, post, weight);
    await this.saveUserInterests(userId, interests);
  }

  // Get action weight
  private getActionWeight(actionType: string): number {
    const weights: Record<string, number> = {
      like: 2,
      love: 3,
      haha: 2,
      wow: 2,
      sad: 2,
      angry: 1,
      support: 3,
      comment: 5,
      share: 7,
      save: 6,
      view: 1,
      skip: -2,
      hide: -5
    };

    return weights[actionType] || 0;
  }

  // Update interests based on post
  private async updateInterests(
    interests: UserInterests,
    post: Post,
    weight: number
  ): Promise<void> {
    // Car brand
    if (post.content.carReference?.brand) {
      const brand = post.content.carReference.brand;
      interests.carBrands.set(
        brand,
        (interests.carBrands.get(brand) || 0) + weight
      );

      // Car type
      if (post.content.carReference.type) {
        const type = post.content.carReference.type;
        interests.carTypes.set(
          type,
          (interests.carTypes.get(type) || 0) + weight
        );
      }

      // Price range
      if (post.content.carReference.price) {
        const range = getPriceRange(post.content.carReference.price);
        interests.priceRanges.set(
          range,
          (interests.priceRanges.get(range) || 0) + weight
        );
      }
    }

    // Location
    if (post.location?.city) {
      const city = post.locationData?.cityName;
      interests.locations.set(
        city,
        (interests.locations.get(city) || 0) + weight
      );
    }

    // Hashtags
    post.content.hashtags?.forEach(tag => {
      interests.hashtags.set(
        tag,
        (interests.hashtags.get(tag) || 0) + weight
      );
    });

    // Author
    interests.authors.set(
      post.authorId,
      (interests.authors.get(post.authorId) || 0) + weight
    );

    // Post type
    interests.postTypes.set(
      post.type,
      (interests.postTypes.get(post.type) || 0) + weight
    );

    interests.updatedAt = Date.now();
  }

  // Personalize score based on interests
  async personalizeScore(
    post: Post,
    userId: string,
    baseScore: PostScore
  ): Promise<PostScore> {
    const interests = await this.getUserInterests(userId);
    let bonus = 0;

    // Car brand bonus (max +10)
    if (post.content.carReference?.brand) {
      const brandInterest = interests.carBrands.get(
        post.content.carReference.brand
      ) || 0;
      bonus += Math.min(brandInterest * 0.5, 10);
    }

    // Author bonus (max +5)
    const authorInterest = interests.authors.get(post.authorId) || 0;
    bonus += Math.min(authorInterest * 0.3, 5);

    // Location bonus (max +3)
    if (post.location?.city) {
      const locationInterest = interests.locations.get(post.locationData?.cityName) || 0;
      bonus += Math.min(locationInterest * 0.2, 3);
    }

    // Hashtag bonus (max +5)
    let hashtagBonus = 0;
    post.content.hashtags?.forEach(tag => {
      const tagInterest = interests.hashtags.get(tag) || 0;
      hashtagBonus += tagInterest * 0.1;
    });
    bonus += Math.min(hashtagBonus, 5);

    // Post type bonus (max +3)
    const typeInterest = interests.postTypes.get(post.type) || 0;
    bonus += Math.min(typeInterest * 0.2, 3);

    return {
      ...baseScore,
      totalScore: Math.min(baseScore.totalScore + bonus, 100),
      personalizedBonus: bonus
    };
  }

  // Apply time decay to old interests
  async decayInterests(userId: string): Promise<void> {
    const interests = await this.getUserInterests(userId);
    
    const ageHours = (Date.now() - interests.updatedAt) / 3600000;
    if (ageHours < 24) return; // Only decay once per day

    const decayFactor = Math.pow(this.DECAY_RATE, Math.floor(ageHours / 24));

    interests.carBrands.forEach((value, key) => {
      interests.carBrands.set(key, value * decayFactor);
    });

    interests.carTypes.forEach((value, key) => {
      interests.carTypes.set(key, value * decayFactor);
    });

    interests.locations.forEach((value, key) => {
      interests.locations.set(key, value * decayFactor);
    });

    interests.hashtags.forEach((value, key) => {
      interests.hashtags.set(key, value * decayFactor);
    });

    interests.authors.forEach((value, key) => {
      interests.authors.set(key, value * decayFactor);
    });

    interests.postTypes.forEach((value, key) => {
      interests.postTypes.set(key, value * decayFactor);
    });

    interests.updatedAt = Date.now();

    await this.saveUserInterests(userId, interests);
  }

  // Save interests to Firestore
  private async saveUserInterests(
    userId: string,
    interests: UserInterests
  ): Promise<void> {
    const data = interestsToData(interests);
    await setDoc(doc(db, 'userInterests', userId), data);
  }

  // Create default interests
  private createDefaultInterests(): UserInterests {
    return {
      carBrands: new Map(),
      carTypes: new Map(),
      priceRanges: new Map(),
      locations: new Map(),
      hashtags: new Map(),
      authors: new Map(),
      postTypes: new Map(),
      updatedAt: Date.now()
    };
  }

  // Get top interests for user
  async getTopInterests(userId: string, limit: number = 5) {
    const interests = await this.getUserInterests(userId);

    return {
      carBrands: this.getTopN(interests.carBrands, limit),
      locations: this.getTopN(interests.locations, limit),
      hashtags: this.getTopN(interests.hashtags, limit),
      authors: this.getTopN(interests.authors, limit)
    };
  }

  // Helper: Get top N from Map
  private getTopN(map: Map<string, number>, n: number): Array<[string, number]> {
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n);
  }

  // Clear user interests
  async clearUserInterests(userId: string): Promise<void> {
    const defaultInterests = this.createDefaultInterests();
    await this.saveUserInterests(userId, defaultInterests);
  }
}

export default new PersonalizationService();

