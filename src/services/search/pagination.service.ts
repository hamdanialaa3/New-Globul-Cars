// src/services/search/pagination.service.ts
// Pagination Service - Universal Pagination for Search Results
// خدمة Pagination موحدة لجميع نتائج البحث
// Created: December 28, 2025

import { DocumentSnapshot } from 'firebase/firestore';
import { logger } from '@/services/logger-service';
import { CarListing } from '@/types/CarListing';

// ============================================================================
// TYPES
// ============================================================================

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalResults: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  lastDoc: DocumentSnapshot | null;
  firstDoc: DocumentSnapshot | null;
}

export interface PaginationConfig {
  initialPage?: number;
  pageSize?: number;
  maxPageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationState;
  source: 'firestore' | 'algolia' | 'cache';
}

// ============================================================================
// PAGINATION SERVICE
// ============================================================================

class PaginationService {
  private static instance: PaginationService;

  private readonly DEFAULT_PAGE_SIZE = 20;
  private readonly MAX_PAGE_SIZE = 100;
  private readonly MIN_PAGE_SIZE = 10;

  // Cache للـ pagination states (لكل جلسة بحث)
  private paginationCache = new Map<string, PaginationState>();

  static getInstance(): PaginationService {
    if (!this.instance) {
      this.instance = new PaginationService();
    }
    return this.instance;
  }

  /**
   * إنشاء Pagination State جديد
   */
  createPaginationState(
    totalResults: number,
    config: PaginationConfig = {}
  ): PaginationState {
    const pageSize = this.validatePageSize(
      config.pageSize || this.DEFAULT_PAGE_SIZE
    );
    const currentPage = config.initialPage || 1;
    const totalPages = Math.ceil(totalResults / pageSize);

    return {
      currentPage,
      pageSize,
      totalResults,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      lastDoc: null,
      firstDoc: null,
    };
  }

  /**
   * تحديث Pagination State عند الانتقال للصفحة التالية
   */
  goToNextPage(state: PaginationState): PaginationState {
    if (!state.hasNextPage) {
      logger.warn('Attempted to go to next page when none exists');
      return state;
    }

    const newPage = state.currentPage + 1;

    return {
      ...state,
      currentPage: newPage,
      hasNextPage: newPage < state.totalPages,
      hasPreviousPage: true,
    };
  }

  /**
   * تحديث Pagination State عند الانتقال للصفحة السابقة
   */
  goToPreviousPage(state: PaginationState): PaginationState {
    if (!state.hasPreviousPage) {
      logger.warn('Attempted to go to previous page when none exists');
      return state;
    }

    const newPage = state.currentPage - 1;

    return {
      ...state,
      currentPage: newPage,
      hasNextPage: true,
      hasPreviousPage: newPage > 1,
    };
  }

  /**
   * الانتقال لصفحة محددة
   */
  goToPage(state: PaginationState, pageNumber: number): PaginationState {
    if (pageNumber < 1 || pageNumber > state.totalPages) {
      logger.warn(`Invalid page number: ${pageNumber}`, {
        totalPages: state.totalPages,
      });
      return state;
    }

    return {
      ...state,
      currentPage: pageNumber,
      hasNextPage: pageNumber < state.totalPages,
      hasPreviousPage: pageNumber > 1,
    };
  }

  /**
   * حساب الـ Offset و Limit من الـ Pagination State
   */
  getOffsetAndLimit(state: PaginationState): { offset: number; limit: number } {
    return {
      offset: (state.currentPage - 1) * state.pageSize,
      limit: state.pageSize,
    };
  }

  /**
   * تطبيق Pagination على مصفوفة (Client-Side)
   */
  paginateArray<T>(
    array: T[],
    page: number,
    pageSize: number
  ): PaginatedResult<T> {
    const safePageSize = this.validatePageSize(pageSize);
    const safePage = Math.max(1, page);

    const totalResults = array.length;
    const totalPages = Math.ceil(totalResults / safePageSize);
    const startIndex = (safePage - 1) * safePageSize;
    const endIndex = startIndex + safePageSize;

    const data = array.slice(startIndex, endIndex);

    return {
      data,
      pagination: {
        currentPage: safePage,
        pageSize: safePageSize,
        totalResults,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPreviousPage: safePage > 1,
        lastDoc: null,
        firstDoc: null,
      },
      source: 'cache',
    };
  }

  /**
   * حفظ Pagination State في Cache
   */
  savePaginationState(searchId: string, state: PaginationState): void {
    this.paginationCache.set(searchId, state);
    logger.debug('Pagination state saved', { searchId, state });
  }

  /**
   * جلب Pagination State من Cache
   */
  getPaginationState(searchId: string): PaginationState | null {
    return this.paginationCache.get(searchId) || null;
  }

  /**
   * مسح Pagination State من Cache
   */
  clearPaginationState(searchId: string): void {
    this.paginationCache.delete(searchId);
  }

  /**
   * مسح جميع الـ Pagination States
   */
  clearAllPaginationStates(): void {
    this.paginationCache.clear();
  }

  /**
   * التحقق من صحة Page Size
   */
  private validatePageSize(pageSize: number): number {
    if (pageSize < this.MIN_PAGE_SIZE) {
      logger.warn(`Page size too small: ${pageSize}, using minimum`, {
        minimum: this.MIN_PAGE_SIZE,
      });
      return this.MIN_PAGE_SIZE;
    }

    if (pageSize > this.MAX_PAGE_SIZE) {
      logger.warn(`Page size too large: ${pageSize}, using maximum`, {
        maximum: this.MAX_PAGE_SIZE,
      });
      return this.MAX_PAGE_SIZE;
    }

    return pageSize;
  }

  /**
   * إنشاء Search ID فريد (لحفظ الـ Pagination State)
   */
  createSearchId(filters: Record<string, unknown>): string {
    return JSON.stringify(filters);
  }

  /**
   * حساب الإحصائيات
   */
  getStats(state: PaginationState): {
    showingFrom: number;
    showingTo: number;
    showingTotal: number;
  } {
    const showingFrom = (state.currentPage - 1) * state.pageSize + 1;
    const showingTo = Math.min(
      state.currentPage * state.pageSize,
      state.totalResults
    );

    return {
      showingFrom,
      showingTo,
      showingTotal: state.totalResults,
    };
  }

  /**
   * تحديث Total Results (مفيد عند إضافة/حذف نتائج)
   */
  updateTotalResults(
    state: PaginationState,
    newTotal: number
  ): PaginationState {
    const newTotalPages = Math.ceil(newTotal / state.pageSize);
    const newCurrentPage = Math.min(state.currentPage, newTotalPages);

    return {
      ...state,
      totalResults: newTotal,
      totalPages: newTotalPages,
      currentPage: newCurrentPage,
      hasNextPage: newCurrentPage < newTotalPages,
      hasPreviousPage: newCurrentPage > 1,
    };
  }

  /**
   * Infinite Scroll Mode - تحميل المزيد من النتائج
   */
  async loadMore<T>(
    currentData: T[],
    fetchMore: (page: number, pageSize: number) => Promise<T[]>,
    state: PaginationState
  ): Promise<{ data: T[]; newState: PaginationState }> {
    if (!state.hasNextPage) {
      logger.info('No more pages to load');
      return { data: currentData, newState: state };
    }

    try {
      const nextPage = state.currentPage + 1;
      const newData = await fetchMore(nextPage, state.pageSize);

      const updatedData = [...currentData, ...newData];
      const newState = this.goToNextPage(state);

      logger.info('Loaded more results', {
        newItemsCount: newData.length,
        totalItemsCount: updatedData.length,
        currentPage: newState.currentPage,
      });

      return {
        data: updatedData,
        newState,
      };
    } catch (error) {
      logger.error('Failed to load more results', error as Error);
      return { data: currentData, newState: state };
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const paginationService = PaginationService.getInstance();
export default paginationService;
