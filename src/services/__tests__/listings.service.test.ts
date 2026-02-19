/**
 * Listings Service Tests
 * Tests for listing CRUD operations across vehicle collections
 *
 * @file listings.service.test.ts
 * @since 2026-02-19
 */
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  limit: vi.fn(),
}));

vi.mock('../../firebase/firebase-config', () => ({
  db: {},
}));

vi.mock('../logger-service', () => ({
  serviceLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('../car/unified-car-queries', () => ({
  mapDocToCar: vi.fn((docSnap: any) => ({
    id: docSnap.id,
    carNumericId: docSnap.data()?.carNumericId,
    numericId: docSnap.data()?.numericId,
    slug: docSnap.data()?.slug,
    sellerNumericId: docSnap.data()?.sellerNumericId,
    make: docSnap.data()?.make || 'Unknown',
    model: docSnap.data()?.model || 'Unknown',
    isActive: docSnap.data()?.isActive ?? true,
    isSold: docSnap.data()?.isSold ?? false,
  })),
}));

vi.mock('../car/unified-car-types', () => ({
  VEHICLE_COLLECTIONS: ['passenger_cars', 'suvs', 'vans', 'motorcycles', 'trucks', 'buses'],
}));

import {
  getListingById,
  getListingByNumericId,
  getListingsBySellerNumericId,
  getActiveListings,
} from '../listings.service';
import { getDoc, getDocs } from 'firebase/firestore';

// Helper to create a mock Firestore document snapshot
function mockDocSnap(id: string, data: Record<string, any>, exists = true) {
  return {
    id,
    exists: () => exists,
    data: () => data,
    ref: { id },
  };
}

// Helper to create a mock query snapshot
function mockQuerySnapshot(docs: any[]) {
  return {
    empty: docs.length === 0,
    docs,
    size: docs.length,
    forEach: (cb: Function) => docs.forEach(cb),
  };
}

describe('listings.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── getListingById ────────────────────────────────────────────
  describe('getListingById', () => {
    it('should find listing by UUID in first collection', async () => {
      const docData = {
        carNumericId: 540,
        slug: 'bmw-x5-2020',
        make: 'BMW',
        model: 'X5',
        isActive: true,
        isSold: false,
      };
      (getDoc as Mock).mockResolvedValueOnce(mockDocSnap('uuid-123', docData, true));

      const result = await getListingById('uuid-123');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('uuid-123');
      expect(result!.listingNumericId).toBe(540);
      expect(result!.slug).toBe('bmw-x5-2020');
      expect(getDoc).toHaveBeenCalledTimes(1);
    });

    it('should search across collections until found', async () => {
      const docData = {
        carNumericId: 100,
        slug: 'honda-civic',
        make: 'Honda',
        model: 'Civic',
      };
      // Not found in first 3 collections, found in 4th
      (getDoc as Mock)
        .mockResolvedValueOnce(mockDocSnap('uuid-456', {}, false))
        .mockResolvedValueOnce(mockDocSnap('uuid-456', {}, false))
        .mockResolvedValueOnce(mockDocSnap('uuid-456', {}, false))
        .mockResolvedValueOnce(mockDocSnap('uuid-456', docData, true));

      const result = await getListingById('uuid-456');

      expect(result).not.toBeNull();
      expect(result!.listingNumericId).toBe(100);
      expect(getDoc).toHaveBeenCalledTimes(4);
    });

    it('should return null when listing not found in any collection', async () => {
      // Not found in any collection (7 = 6 vehicle + 1 legacy)
      (getDoc as Mock).mockResolvedValue(mockDocSnap('uuid-missing', {}, false));

      const result = await getListingById('uuid-missing');

      expect(result).toBeNull();
      expect(getDoc).toHaveBeenCalledTimes(7); // 6 vehicle + 1 legacy
    });

    it('should throw and propagate errors', async () => {
      (getDoc as Mock).mockRejectedValue(new Error('Firestore unavailable'));

      await expect(getListingById('uuid-err')).rejects.toThrow('Firestore unavailable');
    });
  });

  // ─── getListingByNumericId ─────────────────────────────────────
  describe('getListingByNumericId', () => {
    it('should find listing by numeric ID', async () => {
      const docData = {
        carNumericId: 540,
        slug: 'bmw-x5-2020',
        make: 'BMW',
        model: 'X5',
      };
      (getDocs as Mock).mockResolvedValueOnce(
        mockQuerySnapshot([mockDocSnap('doc-1', docData)])
      );

      const result = await getListingByNumericId(540);

      expect(result).not.toBeNull();
      expect(result!.listingNumericId).toBe(540);
      expect(result!.slug).toBe('bmw-x5-2020');
    });

    it('should search across collections until found', async () => {
      const docData = { carNumericId: 200, slug: 'test-car' };
      // Empty in first 2, found in 3rd
      (getDocs as Mock)
        .mockResolvedValueOnce(mockQuerySnapshot([]))
        .mockResolvedValueOnce(mockQuerySnapshot([]))
        .mockResolvedValueOnce(mockQuerySnapshot([mockDocSnap('doc-3', docData)]));

      const result = await getListingByNumericId(200);

      expect(result).not.toBeNull();
      expect(result!.listingNumericId).toBe(200);
      expect(getDocs).toHaveBeenCalledTimes(3);
    });

    it('should return null when not found', async () => {
      (getDocs as Mock).mockResolvedValue(mockQuerySnapshot([]));

      const result = await getListingByNumericId(99999);

      expect(result).toBeNull();
    });

    it('should throw on Firestore error', async () => {
      (getDocs as Mock).mockRejectedValue(new Error('Permission denied'));

      await expect(getListingByNumericId(1)).rejects.toThrow('Permission denied');
    });
  });

  // ─── getListingsBySellerNumericId ──────────────────────────────
  describe('getListingsBySellerNumericId', () => {
    it('should return listings for a seller', async () => {
      const docs = [
        mockDocSnap('car-1', { carNumericId: 1, sellerNumericId: 100, slug: 'car-a' }),
        mockDocSnap('car-2', { carNumericId: 2, sellerNumericId: 100, slug: 'car-b' }),
      ];
      // First collection returns 2, rest return 0
      (getDocs as Mock)
        .mockResolvedValueOnce(mockQuerySnapshot(docs))
        .mockResolvedValue(mockQuerySnapshot([]));

      const result = await getListingsBySellerNumericId(100);

      expect(result.length).toBe(2);
      expect(result[0].listingNumericId).toBe(1);
      expect(result[1].listingNumericId).toBe(2);
    });

    it('should merge results from multiple collections', async () => {
      (getDocs as Mock)
        .mockResolvedValueOnce(mockQuerySnapshot([
          mockDocSnap('car-1', { carNumericId: 1, sellerNumericId: 50 }),
        ]))
        .mockResolvedValueOnce(mockQuerySnapshot([
          mockDocSnap('suv-1', { carNumericId: 2, sellerNumericId: 50 }),
        ]))
        .mockResolvedValue(mockQuerySnapshot([]));

      const result = await getListingsBySellerNumericId(50);

      expect(result.length).toBe(2);
    });

    it('should return empty array when seller has no listings', async () => {
      (getDocs as Mock).mockResolvedValue(mockQuerySnapshot([]));

      const result = await getListingsBySellerNumericId(99999);

      expect(result).toEqual([]);
    });

    it('should respect limit parameter', async () => {
      const docs = Array.from({ length: 10 }, (_, i) =>
        mockDocSnap(`car-${i}`, { carNumericId: i, sellerNumericId: 1 })
      );
      (getDocs as Mock)
        .mockResolvedValueOnce(mockQuerySnapshot(docs))
        .mockResolvedValue(mockQuerySnapshot([]));

      const result = await getListingsBySellerNumericId(1, 5);

      expect(result.length).toBeLessThanOrEqual(5);
    });
  });

  // ─── getActiveListings ─────────────────────────────────────────
  describe('getActiveListings', () => {
    it('should return only active non-sold listings', async () => {
      const activeDocs = [
        mockDocSnap('a-1', { carNumericId: 10, isActive: true, isSold: false }),
        mockDocSnap('a-2', { carNumericId: 20, isActive: true, isSold: false }),
      ];
      (getDocs as Mock)
        .mockResolvedValueOnce(mockQuerySnapshot(activeDocs))
        .mockResolvedValue(mockQuerySnapshot([]));

      const result = await getActiveListings();

      expect(result.length).toBe(2);
      result.forEach(listing => {
        expect(listing.isActive).toBe(true);
        expect(listing.isSold).toBe(false);
      });
    });

    it('should return empty array when no active listings', async () => {
      (getDocs as Mock).mockResolvedValue(mockQuerySnapshot([]));

      const result = await getActiveListings();

      expect(result).toEqual([]);
    });

    it('should respect limit parameter', async () => {
      const docs = Array.from({ length: 30 }, (_, i) =>
        mockDocSnap(`car-${i}`, { carNumericId: i, isActive: true, isSold: false })
      );
      (getDocs as Mock)
        .mockResolvedValueOnce(mockQuerySnapshot(docs))
        .mockResolvedValue(mockQuerySnapshot([]));

      const result = await getActiveListings(10);

      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should throw on Firestore error', async () => {
      (getDocs as Mock).mockRejectedValue(new Error('Timeout'));

      await expect(getActiveListings()).rejects.toThrow('Timeout');
    });
  });
});
