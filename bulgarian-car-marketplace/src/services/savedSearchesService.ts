// Saved Searches Service - Firebase Backend
// Premium World-Class Implementation

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';

// Types
export interface SavedSearchFilters {
  // Basic
  make?: string;
  model?: string;
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  mileageMax?: number;
  
  // Technical
  fuelType?: string;
  transmission?: string;
  engineMin?: number;
  engineMax?: number;
  powerMin?: number;
  powerMax?: number;
  
  // Location
  location?: string;
  radius?: number;
  
  // Condition
  condition?: string;
  vehicleType?: string;
  
  // Features
  features?: string[];
  
  // Other
  color?: string;
  doors?: number;
  seats?: number;
  [key: string]: any;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  filters: SavedSearchFilters;
  resultsCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  notifyOnNewResults: boolean;
  lastChecked?: Timestamp;
}

export interface SavedSearchInput {
  name: string;
  filters: SavedSearchFilters;
  resultsCount: number;
  notifyOnNewResults?: boolean;
}

class SavedSearchesService {
  private collectionName = 'savedSearches';

  /**
   * Save a new search
   */
  async saveSearch(userId: string, searchData: SavedSearchInput): Promise<string> {
    try {
      const searchesRef = collection(db, this.collectionName);
      
      const newSearch = {
        userId,
        name: searchData.name,
        filters: searchData.filters,
        resultsCount: searchData.resultsCount,
        notifyOnNewResults: searchData.notifyOnNewResults || false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastChecked: serverTimestamp()
      };

      const docRef = await addDoc(searchesRef, newSearch);
      console.log('[SavedSearches] Search saved successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('[SavedSearches] Error saving search:', error);
      throw error;
    }
  }

  /**
   * Get all saved searches for a user
   */
  async getUserSearches(userId: string): Promise<SavedSearch[]> {
    try {
      const searchesRef = collection(db, this.collectionName);
      const q = query(
        searchesRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const searches: SavedSearch[] = [];

      querySnapshot.forEach((doc) => {
        searches.push({
          id: doc.id,
          ...doc.data()
        } as SavedSearch);
      });

      console.log(`[SavedSearches] Retrieved ${searches.length} searches for user ${userId}`);
      return searches;
    } catch (error) {
      console.error('[SavedSearches] Error getting searches:', error);
      throw error;
    }
  }

  /**
   * Get a specific saved search
   */
  async getSearch(searchId: string): Promise<SavedSearch | null> {
    try {
      const searchRef = doc(db, this.collectionName, searchId);
      const searchDoc = await getDoc(searchRef);

      if (searchDoc.exists()) {
        return {
          id: searchDoc.id,
          ...searchDoc.data()
        } as SavedSearch;
      }

      return null;
    } catch (error) {
      console.error('[SavedSearches] Error getting search:', error);
      throw error;
    }
  }

  /**
   * Update a saved search
   */
  async updateSearch(
    searchId: string,
    updates: Partial<SavedSearchInput>
  ): Promise<void> {
    try {
      const searchRef = doc(db, this.collectionName, searchId);
      
      await updateDoc(searchRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      console.log('[SavedSearches] Search updated successfully:', searchId);
    } catch (error) {
      console.error('[SavedSearches] Error updating search:', error);
      throw error;
    }
  }

  /**
   * Update results count for a search
   */
  async updateResultsCount(searchId: string, count: number): Promise<void> {
    try {
      const searchRef = doc(db, this.collectionName, searchId);
      
      await updateDoc(searchRef, {
        resultsCount: count,
        lastChecked: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('[SavedSearches] Results count updated:', searchId, count);
    } catch (error) {
      console.error('[SavedSearches] Error updating results count:', error);
      throw error;
    }
  }

  /**
   * Toggle notifications for a search
   */
  async toggleNotifications(searchId: string, enabled: boolean): Promise<void> {
    try {
      const searchRef = doc(db, this.collectionName, searchId);
      
      await updateDoc(searchRef, {
        notifyOnNewResults: enabled,
        updatedAt: serverTimestamp()
      });

      console.log('[SavedSearches] Notifications toggled:', searchId, enabled);
    } catch (error) {
      console.error('[SavedSearches] Error toggling notifications:', error);
      throw error;
    }
  }

  /**
   * Delete a saved search
   */
  async deleteSearch(searchId: string): Promise<void> {
    try {
      const searchRef = doc(db, this.collectionName, searchId);
      await deleteDoc(searchRef);
      
      console.log('[SavedSearches] Search deleted successfully:', searchId);
    } catch (error) {
      console.error('[SavedSearches] Error deleting search:', error);
      throw error;
    }
  }

  /**
   * Check if user has reached max saved searches
   */
  async hasReachedLimit(userId: string, maxLimit: number = 10): Promise<boolean> {
    try {
      const searches = await this.getUserSearches(userId);
      return searches.length >= maxLimit;
    } catch (error) {
      console.error('[SavedSearches] Error checking limit:', error);
      return false;
    }
  }

  /**
   * Duplicate a saved search
   */
  async duplicateSearch(searchId: string, newName?: string): Promise<string> {
    try {
      const originalSearch = await this.getSearch(searchId);
      
      if (!originalSearch) {
        throw new Error('Search not found');
      }

      const duplicatedSearch: SavedSearchInput = {
        name: newName || `${originalSearch.name} (Copy)`,
        filters: { ...originalSearch.filters },
        resultsCount: originalSearch.resultsCount,
        notifyOnNewResults: false
      };

      return await this.saveSearch(originalSearch.userId, duplicatedSearch);
    } catch (error) {
      console.error('[SavedSearches] Error duplicating search:', error);
      throw error;
    }
  }

  /**
   * Get search summary (for display)
   */
  generateSearchSummary(filters: SavedSearchFilters): string {
    const parts: string[] = [];

    if (filters.make) parts.push(filters.make);
    if (filters.model) parts.push(filters.model);
    if (filters.yearMin || filters.yearMax) {
      const yearRange = `${filters.yearMin || ''}${filters.yearMin && filters.yearMax ? '-' : ''}${filters.yearMax || ''}`;
      parts.push(yearRange);
    }
    if (filters.priceMin || filters.priceMax) {
      const priceRange = `€${filters.priceMin || 0}-${filters.priceMax || '∞'}`;
      parts.push(priceRange);
    }
    if (filters.location) parts.push(`📍 ${filters.location}`);

    return parts.join(' · ') || 'All Cars';
  }
}

export const savedSearchesService = new SavedSearchesService();
export default savedSearchesService;
