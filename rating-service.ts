// src/services/rating-service.ts
// Rating and Review Service for Bulgarian Car Marketplace

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase-config';

export interface CarRating {
  id: string;
  carId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5 stars
  title: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  verifiedPurchase: boolean;
  helpful: number; // number of helpful votes
  createdAt: Timestamp;
  updatedAt: Timestamp;
  images?: string[]; // review images
  categories: {
    reliability: number; // 1-5
    performance: number; // 1-5
    comfort: number; // 1-5
    value: number; // 1-5
    design: number; // 1-5
  };
}

export interface RatingSummary {
  carId: string;
  totalRatings: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number }; // 1-5 stars count
  categoryAverages: {
    reliability: number;
    performance: number;
    comfort: number;
    value: number;
    design: number;
  };
  verifiedPurchaseCount: number;
  totalHelpful: number;
}

export class BulgarianRatingService {
  private ratingsCollection = 'car_ratings';
  private summariesCollection = 'rating_summaries';

  // Add a new rating/review
  async addRating(rating: Omit<CarRating, 'id' | 'createdAt' | 'updatedAt' | 'helpful'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.ratingsCollection), {
        ...rating,
        helpful: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Update rating summary
      await this.updateRatingSummary(rating.carId);

      return docRef.id;
    } catch (error) {
      console.error('Error adding rating:', error);
      throw new Error('Failed to add rating');
    }
  }

  // Update an existing rating
  async updateRating(ratingId: string, updates: Partial<Omit<CarRating, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const ratingRef = doc(db, this.ratingsCollection, ratingId);
      await updateDoc(ratingRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });

      // Get the rating to update summary
      const ratingDoc = await getDoc(ratingRef);
      if (ratingDoc.exists()) {
        const rating = ratingDoc.data() as CarRating;
        await this.updateRatingSummary(rating.carId);
      }
    } catch (error) {
      console.error('Error updating rating:', error);
      throw new Error('Failed to update rating');
    }
  }

  // Delete a rating
  async deleteRating(ratingId: string): Promise<void> {
    try {
      const ratingRef = doc(db, this.ratingsCollection, ratingId);
      const ratingDoc = await getDoc(ratingRef);

      if (ratingDoc.exists()) {
        const rating = ratingDoc.data() as CarRating;
        await deleteDoc(ratingRef);
        await this.updateRatingSummary(rating.carId);
      }
    } catch (error) {
      console.error('Error deleting rating:', error);
      throw new Error('Failed to delete rating');
    }
  }

  // Get ratings for a specific car
  async getCarRatings(carId: string, pageSize: number = 10, lastDoc?: any): Promise<CarRating[]> {
    try {
      let q = query(
        collection(db, this.ratingsCollection),
        where('carId', '==', carId),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );

      if (lastDoc) {
        q = query(q, orderBy('createdAt', 'desc'), limit(pageSize));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CarRating));
    } catch (error) {
      console.error('Error getting car ratings:', error);
      throw new Error('Failed to get car ratings');
    }
  }

  // Get user's ratings
  async getUserRatings(userId: string): Promise<CarRating[]> {
    try {
      const q = query(
        collection(db, this.ratingsCollection),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CarRating));
    } catch (error) {
      console.error('Error getting user ratings:', error);
      throw new Error('Failed to get user ratings');
    }
  }

  // Get rating summary for a car
  async getRatingSummary(carId: string): Promise<RatingSummary | null> {
    try {
      const summaryRef = doc(db, this.summariesCollection, carId);
      const summaryDoc = await getDoc(summaryRef);

      if (summaryDoc.exists()) {
        return summaryDoc.data() as RatingSummary;
      }

      return null;
    } catch (error) {
      console.error('Error getting rating summary:', error);
      return null;
    }
  }

  // Mark rating as helpful
  async markHelpful(ratingId: string): Promise<void> {
    try {
      const ratingRef = doc(db, this.ratingsCollection, ratingId);
      const ratingDoc = await getDoc(ratingRef);

      if (ratingDoc.exists()) {
        const currentHelpful = ratingDoc.data().helpful || 0;
        await updateDoc(ratingRef, {
          helpful: currentHelpful + 1
        });
      }
    } catch (error) {
      console.error('Error marking rating as helpful:', error);
      throw new Error('Failed to mark rating as helpful');
    }
  }

  // Update rating summary (internal method)
  private async updateRatingSummary(carId: string): Promise<void> {
    try {
      const ratings = await this.getCarRatings(carId, 1000); // Get all ratings for summary

      if (ratings.length === 0) {
        // Delete summary if no ratings
        await deleteDoc(doc(db, this.summariesCollection, carId));
        return;
      }

      const totalRatings = ratings.length;
      const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratings.forEach(rating => {
        ratingDistribution[rating.rating as keyof typeof ratingDistribution]++;
      });

      const categoryAverages = {
        reliability: ratings.reduce((sum, r) => sum + r.categories.reliability, 0) / totalRatings,
        performance: ratings.reduce((sum, r) => sum + r.categories.performance, 0) / totalRatings,
        comfort: ratings.reduce((sum, r) => sum + r.categories.comfort, 0) / totalRatings,
        value: ratings.reduce((sum, r) => sum + r.categories.value, 0) / totalRatings,
        design: ratings.reduce((sum, r) => sum + r.categories.design, 0) / totalRatings
      };

      const verifiedPurchaseCount = ratings.filter(r => r.verifiedPurchase).length;
      const totalHelpful = ratings.reduce((sum, r) => sum + (r.helpful || 0), 0);

      const summary: RatingSummary = {
        carId,
        totalRatings,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
        categoryAverages,
        verifiedPurchaseCount,
        totalHelpful
      };

      await updateDoc(doc(db, this.summariesCollection, carId), summary as any);
    } catch (error) {
      console.error('Error updating rating summary:', error);
    }
  }

  // Subscribe to rating changes for a car
  subscribeToCarRatings(carId: string, callback: (ratings: CarRating[]) => void): () => void {
    const q = query(
      collection(db, this.ratingsCollection),
      where('carId', '==', carId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ratings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CarRating));
      callback(ratings);
    });

    return unsubscribe;
  }

  // Subscribe to rating summary changes
  subscribeToRatingSummary(carId: string, callback: (summary: RatingSummary | null) => void): () => void {
    const summaryRef = doc(db, this.summariesCollection, carId);

    const unsubscribe = onSnapshot(summaryRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as RatingSummary);
      } else {
        callback(null);
      }
    });

    return unsubscribe;
  }
}

// Export singleton instance
export const bulgarianRatingService = new BulgarianRatingService();