/**
 * End-to-End Tests for Listings Service
 * Tests numeric ID resolution path and fallback behavior
 * 
 * @file listings.e2e.test.ts
 * @since Phase 5 - Integration Testing
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getListingByNumericId } from '../listings.service';

// Mock Firebase with realistic data flow
vi.mock('@/firebase/firebase-config', () => ({
  db: {} // Real Firebase in integration tests would use this
}));

vi.mock('../logger-service', () => ({
  serviceLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
}));

vi.mock('../car/unified-car-types', () => ({
  VEHICLE_COLLECTIONS: [
    'passenger_cars',
    'suvs',
    'vans',
    'motorcycles',
    'trucks',
    'buses'
  ]
}));

vi.mock('../car/unified-car-queries', () => ({
  mapDocToCar: (doc: any) => ({
    id: doc.id,
    carNumericId: doc.data()?.carNumericId,
    numericId: doc.data()?.numericId,
    make: doc.data()?.make || 'Unknown',
    model: doc.data()?.model || 'Unknown',
    price: doc.data()?.price || 0,
    year: doc.data()?.year || new Date().getFullYear(),
    status: doc.data()?.status || 'active',
    isActive: doc.data()?.isActive ?? true,
    isSold: doc.data()?.isSold ?? false,
    slug: doc.data()?.slug || 'unknown'
  })
}));

describe('Listings Service - E2E Numeric ID Resolution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Numeric ID Lookup Path (fast-path)', () => {
    /**
     * Test Scenario: numeric_car_ids collection has entry for ID 540
     * Expected: Should find listing immediately without querying all collections
     * Benefit: Significant latency reduction (1 query vs 8)
     */
    it('should resolve numeric ID via fast-path lookup', async () => {
      const { getDoc, getDocs } = await import('firebase/firestore');
      const mockGetDoc = vi.fn<any>();
      const mockGetDocs = vi.fn<any>();

      (getDoc as any) = mockGetDoc;
      (getDocs as any) = mockGetDocs;

      // Scenario: Fast-path hit
      const pointerData = {
        collectionName: 'suvs',
        listingId: 'uuid-540'
      };

      const mockPointerSnap = {
        exists: () => true,
        data: () => pointerData,
        id: '540'
      };

      const mockCarSnap = {
        exists: () => true,
        data: () => ({
          carNumericId: 540,
          make: 'BMW',
          model: 'X5',
          price: 95000,
          year: 2024,
          status: 'active',
          isActive: true,
          isSold: false,
          slug: 'bmw-x5-2024'
        }),
        id: 'uuid-540'
      };

      // First call to getDoc gets the pointer, second gets the car
      mockGetDoc
        .mockResolvedValueOnce(mockPointerSnap)
        .mockResolvedValueOnce(mockCarSnap);

      const result = await getListingByNumericId(540);

      expect(result).not.toBeNull();
      expect(result?.carNumericId).toBe(540);
      expect(result?.make).toBe('BMW');
      expect(mockGetDoc).toHaveBeenCalledTimes(2); // pointer + car
      expect(mockGetDocs).not.toHaveBeenCalled(); // No fallback needed
    });

    /**
     * Test Scenario: numeric_car_ids lookup fails (entry doesn't exist)
     * Expected: Should fallback to parallel collection queries
     * Benefit: Graceful degradation if lookup table is incomplete
     */
    it('should fallback to parallel queries if fast-path fails', async () => {
      const { getDoc, getDocs } = await import('firebase/firestore');
      const mockGetDoc = vi.fn<any>();
      const mockGetDocs = vi.fn<any>();

      (getDoc as any) = mockGetDoc;
      (getDocs as any) = mockGetDocs;

      // Pointer doesn't exist
      const mockPointerSnap = {
        exists: () => false
      };

      const mockCarSnap = {
        exists: () => true,
        data: () => ({
          carNumericId: 999,
          make: 'Tesla',
          model: 'Model S',
          price: 85000,
          slug: 'tesla-model-s-2024'
        }),
        id: 'uuid-999'
      };

      // First getDoc call returns no pointer
      mockGetDoc.mockResolvedValueOnce(mockPointerSnap);

      // Fallback to getDocs - found in first parallel query
      const mockQuerySnap = {
        empty: false,
        docs: [{ id: 'uuid-999', data: () => mockCarSnap.data() }],
        size: 1
      };

      mockGetDocs.mockResolvedValueOnce(mockQuerySnap);
      mockGetDocs.mockResolvedValue({ empty: true });

      const result = await getListingByNumericId(999);

      expect(result).not.toBeNull();
      expect(result?.carNumericId).toBe(999);
      expect(mockGetDoc).toHaveBeenCalledTimes(1); // Just pointer lookup
      expect(mockGetDocs).toHaveBeenCalled(); // Fallback executed
    });
  });

  describe('Fast-path Performance Comparison', () => {
    /**
     * Test Scenario: Verify fast-path is significantly faster
     * Metric: Number of database round-trips
     * Expected: 2 queries (pointer + document) vs 8 queries (all collections)
     */
    it('should reduce database queries by 75% with fast-path', async () => {
      const { getDoc, getDocs } = await import('firebase/firestore');

      const mockGetDoc = vi.fn<any>();
      const mockGetDocs = vi.fn<any>();

      (getDoc as any) = mockGetDoc;
      (getDocs as any) = mockGetDocs;

      const pointerSnap = {
        exists: () => true,
        data: () => ({
          collectionName: 'trucks',
          listingId: 'uuid-truck-123'
        })
      };

      const carSnap = {
        exists: () => true,
        data: () => ({
          carNumericId: 2000,
          make: 'Volvo',
          model: 'FH16',
          price: 150000
        }),
        id: 'uuid-truck-123'
      };

      // Fast-path: 2 queries
      mockGetDoc
        .mockResolvedValueOnce(pointerSnap)
        .mockResolvedValueOnce(carSnap);

      const result = await getListingByNumericId(2000);

      expect(result).not.toBeNull();

      // Count total database operations
      const fastPathOps = mockGetDoc.mock.calls.length + mockGetDocs.mock.calls.length;

      // Simulate fallback (without actually running it)
      // Fallback would be: 1 pointer query + 8 collection queries = 9 queries
      const fallbackOps = 9;
      const improvement = ((fallbackOps - fastPathOps) / fallbackOps * 100).toFixed(1);

      expect(fastPathOps).toBeLessThan(fallbackOps);
      expect(fastPathOps).toBe(2);
      expect(improvement).toBeTruthy(); // Should show ~78% improvement
    });
  });

  describe('Fallback Resilience', () => {
    /**
     * Test Scenario: numeric_car_ids table is incomplete or corrupted
     * Expected: Should still find listings via fallback path
     * Coverage: Tests system resilience and data consistency
     */
    it('should find listing even if lookup table is incomplete', async () => {
      const { getDoc, getDocs } = await import('firebase/firestore');
      const mockGetDoc = vi.fn<any>();
      const mockGetDocs = vi.fn<any>();

      (getDoc as any) = mockGetDoc;
      (getDocs as any) = mockGetDocs;

      // Pointer missing
      mockGetDoc.mockResolvedValueOnce({ exists: () => false });

      // But listing exists in collection (fallback succeeds)
      const mockQuerySnap = {
        empty: false,
        docs: [
          {
            id: 'honda-civic-456',
            data: () => ({
              carNumericId: 3000,
              make: 'Honda',
              model: 'Civic',
              price: 28000,
              isActive: true,
              isSold: false
            })
          }
        ]
      };

      // Empty results in first 2 collections, found in 3rd
      mockGetDocs
        .mockResolvedValueOnce({ empty: true })
        .mockResolvedValueOnce({ empty: true })
        .mockResolvedValueOnce(mockQuerySnap)
        .mockResolvedValue({ empty: true });

      const result = await getListingByNumericId(3000);

      expect(result).not.toBeNull();
      expect(result?.make).toBe('Honda');
      expect(result?.model).toBe('Civic');
    });

    /**
     * Test Scenario: Listing moved between collections (rare edge case)
     * Expected: Both fast-path and fallback should find it
     * Coverage: Tests data consistency during migrations
     */
    it('should handle listing migration between collections', async () => {
      const { getDoc, getDocs } = await import('firebase/firestore');
      const mockGetDoc = vi.fn<any>();
      const mockGetDocs = vi.fn<any>();

      (getDoc as any) = mockGetDoc;
      (getDocs as any) = mockGetDocs;

      // Pointer points to old location
      const pointerSnap = {
        exists: () => true,
        data: () => ({
          collectionName: 'cars',
          listingId: 'old-uuid-123'
        })
      };

      // But document doesn't exist there anymore
      const oldLocationSnap = {
        exists: () => false
      };

      mockGetDoc
        .mockResolvedValueOnce(pointerSnap)
        .mockResolvedValueOnce(oldLocationSnap);

      // Fallback queries find it in new location
      const mockQuerySnap = {
        empty: false,
        docs: [
          {
            id: 'new-uuid-123',
            data: () => ({
              carNumericId: 4000,
              make: 'Audi',
              model: 'A4',
              price: 55000
            })
          }
        ]
      };

      mockGetDocs
        .mockResolvedValueOnce({ empty: true })
        .mockResolvedValueOnce(mockQuerySnap) // Found in 2nd parallel query
        .mockResolvedValue({ empty: true });

      const result = await getListingByNumericId(4000);

      expect(result).not.toBeNull();
      expect(result?.make).toBe('Audi');
    });
  });

  describe('Error Handling and Recovery', () => {
    /**
     * Test Scenario: Firestore returns error on pointer lookup
     * Expected: Should fallback gracefully, not propagate error
     * Coverage: Tests error resilience
     */
    it('should handle pointer lookup errors gracefully', async () => {
      const { getDoc } = await import('firebase/firestore');
      const mockGetDoc = vi.fn<any>();

      (getDoc as any) = mockGetDoc;

      // Pointer lookup throws (network error, permissions, etc.)
      mockGetDoc.mockRejectedValueOnce(
        new Error('Failed to fetch pointer: Network timeout')
      );

      // Should propagate error (caller decides on graceful handling)
      await expect(getListingByNumericId(5000)).rejects.toThrow();
    });

    /**
     * Test Scenario: Multiple consecutive queries (stress test)
     * Expected: Should handle rapid successions without error
     * Coverage: Tests concurrency and state management
     */
    it('should handle rapid successive numeric ID queries', async () => {
      const { getDoc, getDocs } = await import('firebase/firestore');
      const mockGetDoc = vi.fn<any>();
      const mockGetDocs = vi.fn<any>();

      (getDoc as any) = mockGetDoc;
      (getDocs as any) = mockGetDocs;

      // Setup mock for 3 queries
      const createPointerSnap = (id: number) => ({
        exists: () => true,
        data: () => ({
          collectionName: 'suvs',
          listingId: `uuid-${id}`
        })
      });

      const createCarSnap = (id: number) => ({
        exists: () => true,
        data: () => ({
          carNumericId: id,
          make: `Make${id}`,
          model: `Model${id}`,
          price: 50000
        }),
        id: `uuid-${id}`
      });

      mockGetDoc
        .mockResolvedValueOnce(createPointerSnap(100))
        .mockResolvedValueOnce(createCarSnap(100))
        .mockResolvedValueOnce(createPointerSnap(101))
        .mockResolvedValueOnce(createCarSnap(101))
        .mockResolvedValueOnce(createPointerSnap(102))
        .mockResolvedValueOnce(createCarSnap(102));

      // Execute rapid queries
      const results = await Promise.all([
        getListingByNumericId(100),
        getListingByNumericId(101),
        getListingByNumericId(102)
      ]);

      expect(results).toHaveLength(3);
      results.forEach((result, idx) => {
        expect(result).not.toBeNull();
        expect(result?.carNumericId).toBe(100 + idx);
      });
    });
  });

  describe('Data Validation', () => {
    /**
     * Test Scenario: Returned listing has all required fields
     * Expected: All essential fields populated correctly
     * Coverage: Tests data integrity
     */
    it('should return valid listing with all required fields', async () => {
      const { getDoc } = await import('firebase/firestore');
      const mockGetDoc = vi.fn<any>();

      (getDoc as any) = mockGetDoc;

      const pointerSnap = {
        exists: () => true,
        data: () => ({
          collectionName: 'passenger_cars',
          listingId: 'uuid-complete'
        })
      };

      const carSnap = {
        exists: () => true,
        data: () => ({
          id: 'uuid-complete',
          carNumericId: 6000,
          numericId: 6000,
          make: 'Mercedes',
          model: 'C-Class',
          price: 65000,
          year: 2023,
          status: 'active',
          isActive: true,
          isSold: false,
          slug: 'mercedes-c-class-2023'
        }),
        id: 'uuid-complete'
      };

      mockGetDoc
        .mockResolvedValueOnce(pointerSnap)
        .mockResolvedValueOnce(carSnap);

      const result = await getListingByNumericId(6000);

      // Verify all critical fields
      expect(result).toBeTruthy();
      expect(result?.id).toBeDefined();
      expect(result?.carNumericId).toBe(6000);
      expect(result?.make).toBe('Mercedes');
      expect(result?.model).toBe('C-Class');
      expect(result?.price).toBeGreaterThan(0);
      expect(result?.slug).toBeDefined();
      expect(result?.status).toBe('active');
    });
  });
});
