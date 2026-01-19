// src/services/search/query-optimization.service.ts
// Query Optimization Service - Multi-Collection Query Optimizer
// خدمة تحسين الاستعلامات للبحث في Multi-Collections
// Created: December 28, 2025

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  Query,
  DocumentSnapshot,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { logger } from '@/services/logger-service';
import { CarListing } from '@/types/CarListing';

// ============================================================================
// TYPES
// ============================================================================

export interface SearchFilters {
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMin?: number;
  mileageMax?: number;
  fuelType?: string;
  transmission?: string;
  city?: string;
  region?: string;
  isActive?: boolean;
  isSold?: boolean;
  featured?: boolean;
  locationData?: {
    cityName?: string;
    regionName?: string;
    district?: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface PaginationOptions {
  page: number;
  limit: number;
  lastDoc?: DocumentSnapshot | null;
}

export interface OptimizedSearchResult {
  cars: CarListing[];
  totalResults: number;
  hasMore: boolean;
  lastDoc: DocumentSnapshot | null;
  source: 'firestore' | 'algolia';
  executionTime: number;
  queriesExecuted: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COLLECTIONS = [
  'passenger_cars',
  'suvs',
  'vans',
  'motorcycles',
  'trucks',
  'buses',
];

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// ============================================================================
// QUERY OPTIMIZATION SERVICE
// ============================================================================

class QueryOptimizationService {
  private static instance: QueryOptimizationService;
  private totalQueries = 0;
  private totalDurationMs = 0;
  private cacheHits = 0;

  static getInstance(): QueryOptimizationService {
    if (!this.instance) {
      this.instance = new QueryOptimizationService();
    }
    return this.instance;
  }

  /**
   * البحث المُحسّن عبر Multi-Collections مع Pagination
   */
  async optimizedSearch(
    filters: SearchFilters,
    pagination: PaginationOptions
  ): Promise<OptimizedSearchResult> {
    const startTime = Date.now();
    const safeLimit = Math.min(pagination.limit || DEFAULT_LIMIT, MAX_LIMIT);
    const currentPage = Math.max(1, pagination.page || 1);
    const offset = (currentPage - 1) * safeLimit;

    logger.info('🚀 Starting optimized multi-collection search', {
      filters,
      pagination: { ...pagination, limit: safeLimit },
    });

    try {
      // استراتيجية التحسين: بحث متوازٍ في Collections
      const results = await this.parallelCollectionSearch(
        filters,
        safeLimit,
        pagination.lastDoc
      );

      const pagedResults = results.slice(offset, offset + safeLimit);
      const hasMore = results.length > offset + safeLimit;

      const executionTime = Date.now() - startTime;

      // Track performance counters
      this.totalQueries += 1;
      this.totalDurationMs += executionTime;

      logger.info('✅ Optimized search completed', {
        totalResults: results.length,
        executionTime: `${executionTime}ms`,
        collectionsSearched: COLLECTIONS.length,
      });

      return {
        cars: pagedResults,
        totalResults: results.length,
        hasMore,
        lastDoc: null, // Pagination is offset-based across collections
        source: 'firestore',
        executionTime,
        queriesExecuted: COLLECTIONS.length,
      };
    } catch (error) {
      logger.error('❌ Optimized search failed', error as Error);
      throw error;
    }
  }

  /**
   * بحث متوازٍ في جميع الـ Collections
   */
  private async parallelCollectionSearch(
    filters: SearchFilters,
    limit: number,
    lastDoc?: DocumentSnapshot | null
  ): Promise<CarListing[]> {
    // تنفيذ البحث في جميع الـ Collections بشكل متوازٍ
    const promises = COLLECTIONS.map((collectionName) =>
      this.searchSingleCollection(collectionName, filters, Math.ceil(limit / 2))
    );

    const results = await Promise.all(promises);
    const allCars = results.flat();

    // ترتيب النتائج حسب التاريخ (الأحدث أولاً)
    allCars.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    return allCars;
  }

  /**
   * البحث في Collection واحدة
   */
  private async searchSingleCollection(
    collectionName: string,
    filters: SearchFilters,
    limit: number
  ): Promise<CarListing[]> {
    try {
      const queryConstraints = this.buildQueryConstraints(filters, limit);
      const q = query(collection(db, collectionName), ...queryConstraints);

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CarListing[];
    } catch (error) {
      logger.error(`❌ Error searching collection: ${collectionName}`, error as Error);
      return [];
    }
  }

  /**
   * بناء Query Constraints بشكل محسّن
   */
  private buildQueryConstraints(
    filters: SearchFilters,
    limitValue: number
  ): QueryConstraint[] {
    const constraints: QueryConstraint[] = [];

    // 1. الفلاتر الأساسية (دائماً)
    constraints.push(where('isActive', '==', filters.isActive !== false));

    // 2. الفلاتر النصية (Make, Model, City)
    if (filters.make) {
      constraints.push(where('make', '==', filters.make));
    }

    if (filters.model) {
      constraints.push(where('model', '==', filters.model));
    }

    if (filters.city) {
      constraints.push(where('city', '==', filters.city));
    }

    if (filters.region) {
      constraints.push(where('region', '==', filters.region));
    }

    if (filters.fuelType) {
      constraints.push(where('fuelType', '==', filters.fuelType));
    }

    if (filters.transmission) {
      constraints.push(where('transmission', '==', filters.transmission));
    }

    if (filters.featured !== undefined) {
      constraints.push(where('featured', '==', filters.featured));
    }

    // 3. الفلاتر الرقمية (تحتاج indexes!)
    // ملاحظة: Firestore يسمح بـ range query واحدة فقط لكل استعلام
    // سنطبق الباقي Client-Side إن لزم الأمر

    if (filters.yearMin !== undefined) {
      constraints.push(where('year', '>=', filters.yearMin));
    }

    if (filters.yearMax !== undefined && filters.yearMin === undefined) {
      constraints.push(where('year', '<=', filters.yearMax));
    }

    // 4. الترتيب والحد
    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(limitValue));

    return constraints;
  }

  /**
   * فلترة Client-Side للفلاتر المعقدة
   */
  filterClientSide(cars: CarListing[], filters: SearchFilters): CarListing[] {
    return cars.filter((car) => {
      // Year Range (إذا كان كلاهما موجود)
      if (filters.yearMin && car.year < filters.yearMin) return false;
      if (filters.yearMax && car.year > filters.yearMax) return false;

      // Price Range
      if (filters.priceMin && car.price < filters.priceMin) return false;
      if (filters.priceMax && car.price > filters.priceMax) return false;

      // Mileage Range
      if (filters.mileageMin && (car.mileage || 0) < filters.mileageMin)
        return false;
      if (filters.mileageMax && (car.mileage || 0) > filters.mileageMax)
        return false;

      // isSold filter
      if (filters.isSold === false && car.status === 'sold') return false;

      return true;
    });
  }

  /**
   * البحث مع فلترة Client-Side (للفلاتر المعقدة)
   */
  async searchWithClientFilters(
    filters: SearchFilters,
    pagination: PaginationOptions
  ): Promise<OptimizedSearchResult> {
    // 1. البحث الأساسي
    const result = await this.optimizedSearch(filters, {
      ...pagination,
      limit: pagination.limit * 2, // جلب ضعف العدد للفلترة
    });

    // 2. الفلترة Client-Side
    const filteredCars = this.filterClientSide(result.cars, filters);

    // 3. Pagination بعد الفلترة
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedCars = filteredCars.slice(startIndex, endIndex);

    return {
      ...result,
      cars: paginatedCars,
      totalResults: filteredCars.length,
      hasMore: endIndex < filteredCars.length,
    };
  }

  /**
   * جلب السيارات المميزة (Featured) فقط
   */
  async getFeaturedCars(limit: number = 10): Promise<CarListing[]> {
    const startTime = Date.now();

    logger.info('⭐ Fetching featured cars', { limit });

    try {
      const result = await this.optimizedSearch(
        { featured: true, isActive: true, isSold: false },
        { page: 1, limit }
      );

      logger.info('✅ Featured cars fetched', {
        count: result.cars.length,
        executionTime: `${Date.now() - startTime}ms`,
      });

      return result.cars;
    } catch (error) {
      logger.error('❌ Failed to fetch featured cars', error as Error);
      return [];
    }
  }

  /**
   * إحصائيات الأداء
   */
  async getPerformanceStats(): Promise<{
    averageQueryTime: number;
    totalQueries: number;
    cacheHitRate: number;
  }> {
    const averageQueryTime = this.totalQueries > 0
      ? Math.round(this.totalDurationMs / this.totalQueries)
      : 0;

    return {
      averageQueryTime,
      totalQueries: this.totalQueries,
      cacheHitRate: this.totalQueries > 0 ? this.cacheHits / this.totalQueries : 0,
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const queryOptimizationService = QueryOptimizationService.getInstance();
export default queryOptimizationService;
