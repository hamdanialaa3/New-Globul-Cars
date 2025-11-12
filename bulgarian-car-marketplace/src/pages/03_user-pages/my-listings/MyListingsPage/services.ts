// src/pages/MyListingsPage/services.ts
// Services for MyListingsPage

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { MyListing, MyListingsStats } from './types';
import { logger } from '@/services/logger-service';

class MyListingsService {
  private collectionName = 'cars';

  /**
   * Get all listings for a specific user
   */
  async getUserListings(userId: string): Promise<MyListing[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const listings: MyListing[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        listings.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as MyListing);
      });

      return listings;
    } catch (error) {
      logger.error('[MyListingsService] Error fetching user listings', error as Error, { userId });
      throw new Error('Failed to fetch user listings');
    }
  }

  /**
   * Get user listing statistics
   */
  async getUserStats(userId: string): Promise<MyListingsStats> {
    try {
      const listings = await this.getUserListings(userId);
      
      const stats: MyListingsStats = {
        totalListings: listings.length,
        activeListings: listings.filter(l => l.status === 'active').length,
        soldListings: listings.filter(l => l.status === 'sold').length,
        totalViews: listings.reduce((sum, l) => sum + l.views, 0),
        totalInquiries: listings.reduce((sum, l) => sum + l.inquiries, 0)
      };

      return stats;
    } catch (error) {
      logger.error('[MyListingsService] Error fetching user stats', error as Error, { userId });
      throw new Error('Failed to fetch user statistics');
    }
  }

  /**
   * Update listing status (active, sold, inactive, etc.)
   */
  async updateListingStatus(listingId: string, status: string): Promise<void> {
    try {
      const listingRef = doc(db, this.collectionName, listingId);
      await updateDoc(listingRef, {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      logger.error('[MyListingsService] Error updating listing status', error as Error, { listingId, status });
      throw new Error('Failed to update listing status');
    }
  }

  /**
   * Toggle featured status
   */
  async toggleFeatured(listingId: string, featured: boolean): Promise<void> {
    try {
      const listingRef = doc(db, this.collectionName, listingId);
      await updateDoc(listingRef, {
        isFeatured: featured,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      logger.error('[MyListingsService] Error toggling featured status', error as Error, { listingId, featured });
      throw new Error('Failed to toggle featured status');
    }
  }

  /**
   * Delete a listing
   */
  async deleteListing(listingId: string): Promise<void> {
    try {
      const listingRef = doc(db, this.collectionName, listingId);
      await deleteDoc(listingRef);
    } catch (error) {
      logger.error('[MyListingsService] Error deleting listing', error as Error, { listingId });
      throw new Error('Failed to delete listing');
    }
  }

  /**
   * Get listing by ID
   */
  async getListingById(listingId: string): Promise<MyListing | null> {
    try {
      const listingRef = doc(db, this.collectionName, listingId);
      const docSnap = await getDocs(query(collection(db, this.collectionName), where('__name__', '==', listingId)));
      
      if (docSnap.empty) {
        return null;
      }

      const docData = docSnap.docs[0];
      const data = docData.data();
      
      return {
        id: docData.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as MyListing;
    } catch (error) {
      logger.error('[MyListingsService] Error fetching listing by ID', error as Error, { listingId });
      throw new Error('Failed to fetch listing');
    }
  }

  /**
   * Update listing views count
   */
  async incrementViews(listingId: string): Promise<void> {
    try {
      const listingRef = doc(db, this.collectionName, listingId);
      const currentListing = await this.getListingById(listingId);
      
      if (currentListing) {
        await updateDoc(listingRef, {
          views: currentListing.views + 1,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      logger.error('[MyListingsService] Error incrementing views', error as Error, { listingId });
      // Don't throw error for view increment failures
    }
  }

  /**
   * Update listing inquiries count
   */
  async incrementInquiries(listingId: string): Promise<void> {
    try {
      const listingRef = doc(db, this.collectionName, listingId);
      const currentListing = await this.getListingById(listingId);
      
      if (currentListing) {
        await updateDoc(listingRef, {
          inquiries: currentListing.inquiries + 1,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      logger.error('[MyListingsService] Error incrementing inquiries', error as Error, { listingId });
      // Don't throw error for inquiry increment failures
    }
  }
}

// Export singleton instance
export const myListingsService = new MyListingsService();
export default myListingsService;
