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
import { serviceLogger } from './logger-wrapper';

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
      serviceLogger.info('Search saved successfully', { userId, searchId: docRef.id, name: searchData.name });
      return docRef.id;
    } catch (error) {
      serviceLogger.error('Error saving search', error as Error, { userId, name: searchData.name });
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

      serviceLogger.info('Retrieved saved searches', { userId, count: searches.length });
      return searches;
    } catch (error) {
      serviceLogger.error('Error getting searches', error as Error, { userId });
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
      serviceLogger.error('Error getting search', error as Error, { searchId });
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

      serviceLogger.info('Search updated successfully', { searchId });
    } catch (error) {
      serviceLogger.error('Error updating search', error as Error, { searchId });
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

      serviceLogger.info('Results count updated', { searchId, count });
    } catch (error) {
      serviceLogger.error('Error updating results count', error as Error, { searchId, count });
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

      serviceLogger.info('Notifications toggled', { searchId, enabled });
    } catch (error) {
      serviceLogger.error('Error toggling notifications', error as Error, { searchId, enabled });
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
      
      serviceLogger.info('Search deleted successfully', { searchId });
    } catch (error) {
      serviceLogger.error('Error deleting search', error as Error, { searchId });
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
      serviceLogger.error('Error checking limit', error as Error, { userId, maxLimit });
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
      serviceLogger.error('Error duplicating search', error as Error, { searchId });
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
