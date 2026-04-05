// src/services/search/user-search.service.ts
// User Search Service — Algolia-powered with Firestore fallback

import { usersIndex } from '@/services/algolia/algolia-client';
import { db } from '@/firebase/firebase-config';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { serviceLogger } from '@/services/logger-service';
import type {
  UserSearchResult,
  UserSearchFilters,
  UserSearchSort,
} from '@/types/user-search.types';

class UserSearchService {
  private static instance: UserSearchService;
  private algoliaFailed = false;

  private constructor() {}

  static getInstance(): UserSearchService {
    if (!UserSearchService.instance) {
      UserSearchService.instance = new UserSearchService();
    }
    return UserSearchService.instance;
  }

  /**
   * Race an Algolia call against a timeout.
   * Algolia's lite client can hang on CORS failures; this ensures fallback triggers fast.
   */
  private algoliaWithTimeout<T>(promise: Promise<T>, ms = 4000): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Algolia timeout')), ms)
      ),
    ]);
  }

  /**
   * Full user search with filters, sorting, and pagination.
   * Falls back to Firestore when Algolia is unavailable.
   */
  async searchUsers(
    searchText: string,
    filters: UserSearchFilters = {},
    sort: UserSearchSort = 'relevance',
    page: number = 0
  ): Promise<{ hits: UserSearchResult[]; nbHits: number; nbPages: number }> {
    // For empty queries ("show all users"), go straight to Firestore
    if (!searchText.trim() || this.algoliaFailed) {
      return this.searchUsersFirestore(searchText, filters, sort, page);
    }

    // Try Algolia with timeout
    try {
      const facetFilters = this.buildFacetFilters(filters);
      const numericFilters = this.buildNumericFilters(filters);

      const result = await this.algoliaWithTimeout(
        usersIndex.search<UserSearchResult>(searchText, {
          page,
          hitsPerPage: 20,
          facetFilters,
          numericFilters,
          attributesToRetrieve: [
            'objectID',
            'numericId',
            'displayName',
            'businessName',
            'accountType',
            'avatarUrl',
            'city',
            'region',
            'rating',
            'reviewsCount',
            'listingsCount',
            'isVerified',
            'isOnline',
            'lastActiveAt',
            'description',
          ],
          attributesToHighlight: ['displayName', 'businessName'],
        })
      );

      return {
        hits: result.hits,
        nbHits: result.nbHits,
        nbPages: result.nbPages,
      };
    } catch (error) {
      serviceLogger.error(
        'Algolia user search failed, falling back to Firestore',
        error as Error
      );
      this.algoliaFailed = true;
    }

    // Firestore fallback
    return this.searchUsersFirestore(searchText, filters, sort, page);
  }

  /**
   * Firestore fallback: fetch users directly from the users collection
   */
  private async searchUsersFirestore(
    searchQuery: string,
    filters: UserSearchFilters,
    sort: UserSearchSort,
    page: number
  ): Promise<{ hits: UserSearchResult[]; nbHits: number; nbPages: number }> {
    try {
      const usersRef = collection(db, 'users');
      const constraints: any[] = [];

      // Filters — query profileType (canonical field in Firestore)
      if (filters.accountType) {
        constraints.push(where('profileType', '==', filters.accountType));
      }
      if (filters.isVerified === true) {
        constraints.push(where('isVerified', '==', true));
      }
      if (filters.city) {
        constraints.push(where('city', '==', filters.city));
      }

      constraints.push(limit(100));

      const q = query(usersRef, ...constraints);
      const snap = await getDocs(q);

      let users: UserSearchResult[] = snap.docs.map(doc => {
        const d = doc.data();
        return {
          objectID: doc.id,
          numericId: d.numericId || 0,
          displayName: d.displayName || d.businessName || 'User',
          businessName: d.businessName || '',
          accountType: d.profileType || d.accountType || 'private',
          avatarUrl: d.avatarUrl || d.photoURL || '',
          city: d.city || '',
          region: d.region || '',
          rating: d.averageRating || d.stats?.averageRating || 0,
          reviewsCount: d.reviewsCount || d.stats?.reviewsCount || 0,
          listingsCount: d.listingsCount || d.stats?.totalListings || 0,
          isVerified: d.isVerified || false,
          isOnline: d.isOnline || false,
          lastActiveAt: d.lastActiveAt || 0,
          description: d.bio || d.description || '',
        };
      });

      // Client-side text filter
      if (searchQuery.trim()) {
        const lowerQ = searchQuery.toLowerCase();
        users = users.filter(
          u =>
            u.displayName.toLowerCase().includes(lowerQ) ||
            (u.businessName && u.businessName.toLowerCase().includes(lowerQ)) ||
            u.city.toLowerCase().includes(lowerQ)
        );
      }

      // Client-side numeric filters
      if (filters.minRating != null && filters.minRating > 0) {
        users = users.filter(u => u.rating >= filters.minRating!);
      }
      if (filters.minListings != null && filters.minListings > 0) {
        users = users.filter(u => u.listingsCount >= filters.minListings!);
      }

      // Client-side sorting
      switch (sort) {
        case 'rating_desc':
          users.sort((a, b) => b.rating - a.rating);
          break;
        case 'listings_desc':
          users.sort((a, b) => b.listingsCount - a.listingsCount);
          break;
        case 'recent_activity':
          users.sort((a, b) => b.lastActiveAt - a.lastActiveAt);
          break;
        default:
          // relevance: verified first, then by rating
          users.sort((a, b) => {
            if (a.isVerified !== b.isVerified) return b.isVerified ? 1 : -1;
            return b.rating - a.rating;
          });
      }

      // Pagination
      const hitsPerPage = 20;
      const start = page * hitsPerPage;
      const paged = users.slice(start, start + hitsPerPage);

      return {
        hits: paged,
        nbHits: users.length,
        nbPages: Math.ceil(users.length / hitsPerPage),
      };
    } catch (error) {
      serviceLogger.error(
        'Firestore user search fallback failed',
        error as Error
      );
      return { hits: [], nbHits: 0, nbPages: 0 };
    }
  }

  /**
   * Autocomplete — lightweight search for dropdown suggestions
   */
  async autocompleteUsers(
    searchQuery: string,
    maxResults: number = 5
  ): Promise<UserSearchResult[]> {
    if (!searchQuery.trim()) return [];

    if (!this.algoliaFailed) {
      try {
        const result = await this.algoliaWithTimeout(
          usersIndex.search<UserSearchResult>(searchQuery, {
            hitsPerPage: maxResults,
            attributesToRetrieve: [
              'objectID',
              'numericId',
              'displayName',
              'businessName',
              'accountType',
              'avatarUrl',
              'city',
              'rating',
              'reviewsCount',
              'isVerified',
            ],
            attributesToHighlight: ['displayName', 'businessName'],
          })
        );

        return result.hits;
      } catch (error) {
        serviceLogger.error(
          'Algolia autocomplete failed, using Firestore',
          error as Error
        );
        this.algoliaFailed = true;
      }
    }

    // Firestore fallback for autocomplete
    const result = await this.searchUsersFirestore(
      searchQuery,
      {},
      'relevance',
      0
    );
    return result.hits.slice(0, maxResults);
  }

  /**
   * Get popular / top-rated users (empty query, sorted by custom ranking)
   */
  async getPopularUsers(maxResults: number = 10): Promise<UserSearchResult[]> {
    // Always use Firestore for popular users — no text search needed
    const result = await this.searchUsersFirestore('', {}, 'rating_desc', 0);
    return result.hits.slice(0, maxResults);
  }

  // ==================== PRIVATE HELPERS ====================

  private buildFacetFilters(filters: UserSearchFilters): string[][] {
    const facetFilters: string[][] = [];

    if (filters.accountType) {
      facetFilters.push([`accountType:${filters.accountType}`]);
    }
    if (filters.city) {
      facetFilters.push([`city:${filters.city}`]);
    }
    if (filters.region) {
      facetFilters.push([`region:${filters.region}`]);
    }
    if (filters.isVerified !== undefined) {
      facetFilters.push([`isVerified:${filters.isVerified}`]);
    }

    return facetFilters;
  }

  private buildNumericFilters(filters: UserSearchFilters): string[] {
    const numericFilters: string[] = [];

    if (filters.minRating != null && filters.minRating > 0) {
      numericFilters.push(`rating >= ${filters.minRating}`);
    }
    if (filters.minListings != null && filters.minListings > 0) {
      numericFilters.push(`listingsCount >= ${filters.minListings}`);
    }
    if (filters.activeWithinDays != null && filters.activeWithinDays > 0) {
      const cutoff =
        Math.floor(Date.now() / 1000) - filters.activeWithinDays * 86400;
      numericFilters.push(`lastActiveAt >= ${cutoff}`);
    }

    return numericFilters;
  }
}

export const userSearchService = UserSearchService.getInstance();
export default userSearchService;
