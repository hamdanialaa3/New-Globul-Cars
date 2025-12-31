// unified-car.service.test.ts
// Unit Tests for Unified Car Service
// Coverage Target: 80%+

import { UnifiedCarService } from '../unified-car-service';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
}));


jest.mock('../../homepage-cache.service', () => ({
  homePageCache: {
    get: jest.fn(),
    set: jest.fn(),
  },
  CACHE_KEYS: {
    FEATURED_CARS: 'featured-cars',
    NEW_LISTINGS: 'new-listings',
  },
}));

describe('UnifiedCarService', () => {
  let service: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Create new instance via getInstance pattern
    service = new (UnifiedCarService as any)();
  });

  describe('getFeaturedCars', () => {
    it('should return featured cars from multiple collections', async () => {
      const mockCars = [
        {
          id: 'car-1',
          make: 'BMW',
          model: 'X5',
          year: 2023,
          price: 55000,
          status: 'active',
          isActive: true,
          isSold: false,
        },
        {
          id: 'car-2',
          make: 'Mercedes',
          model: 'E-Class',
          year: 2022,
          price: 48000,
          status: 'active',
          isActive: true,
          isSold: false,
        },
      ];

      const mockSnapshot = {
        docs: mockCars.map((car) => ({
          id: car.id,
          data: () => car,
        })),
      };

      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await service.getFeaturedCars(2);

      expect(result).toHaveLength(2);
      expect(result[0].make).toBe('BMW');
      expect(getDocs).toHaveBeenCalled();
    });

    it('should filter out inactive cars', async () => {
      const mockCars = [
        {
          id: 'car-1',
          status: 'active',
          isActive: true,
          isSold: false,
        },
        {
          id: 'car-2',
          status: 'draft',
          isActive: false,
          isSold: false,
        },
      ];

      const mockSnapshot = {
        docs: mockCars.map((car) => ({
          id: car.id,
          data: () => car,
        })),
      };

      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await service.getFeaturedCars(2);

      expect(result.every((car: any) => car.isActive)).toBe(true);
    });

    it('should handle empty results', async () => {
      (getDocs as jest.Mock).mockResolvedValue({ docs: [] });

      const result = await service.getFeaturedCars(4);

      expect(result).toHaveLength(0);
    });

    it('should handle errors gracefully', async () => {
      (getDocs as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      const result = await service.getFeaturedCars(4);

      expect(result).toHaveLength(0);
    });
  });

  describe('getCarById', () => {
    it('should return car details by ID', async () => {
      const mockCar = {
        id: 'car-123',
        make: 'BMW',
        model: 'X5',
        year: 2023,
        price: 55000,
        status: 'active',
      };

      const mockDoc = {
        exists: () => true,
        id: 'car-123',
        data: () => mockCar,
      };

      (getDoc as jest.Mock).mockResolvedValue(mockDoc);

      const result = await service.getCarById('car-123');

      expect(result).toBeDefined();
      expect(result?.make).toBe('BMW');
      expect(getDoc).toHaveBeenCalled();
    });

    it('should return null for non-existent car', async () => {
      const mockDoc = {
        exists: () => false,
      };

      (getDoc as jest.Mock).mockResolvedValue(mockDoc);

      const result = await service.getCarById('non-existent');

      expect(result).toBeNull();
    });

    it('should handle errors', async () => {
      (getDoc as jest.Mock).mockRejectedValue(new Error('Not found'));

      const result = await service.getCarById('error-car');

      expect(result).toBeNull();
    });
  });

  describe('searchCars', () => {
    it('should search cars with filters', async () => {
      const mockCars = [
        {
          id: 'car-1',
          make: 'BMW',
          model: 'X5',
          year: 2023,
          price: 55000,
          fuelType: 'Diesel',
        },
      ];

      const mockSnapshot = {
        docs: mockCars.map((car) => ({
          id: car.id,
          data: () => car,
        })),
      };

      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const filters = {
        make: 'BMW',
        minYear: 2020,
        maxYear: 2024,
      };

      const result = await service.searchCars(filters);

      expect(result).toHaveLength(1);
      expect(result[0].make).toBe('BMW');
    });

    it('should handle multiple filters', async () => {
      const filters = {
        make: 'BMW',
        model: 'X5',
        minPrice: 40000,
        maxPrice: 60000,
        fuelType: 'Diesel',
        transmission: 'Automatic',
      };

      const mockSnapshot = { docs: [] };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await service.searchCars(filters);

      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array on error', async () => {
      (getDocs as jest.Mock).mockRejectedValue(new Error('Search failed'));

      const result = await service.searchCars({ make: 'BMW' });

      expect(result).toEqual([]);
    });
  });

  describe('mapDocToCar', () => {
    it('should map Firestore doc to UnifiedCar interface', () => {
      const mockDoc = {
        id: 'car-123',
        data: () => ({
          sellerId: 'seller-1',
          make: 'BMW',
          model: 'X5',
          year: 2023,
          price: 55000,
          status: 'active',
          isActive: true,
          isSold: false,
          views: 10,
          favorites: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };

      const result = service.mapDocToCar(mockDoc);

      expect(result.id).toBe('car-123');
      expect(result.make).toBe('BMW');
      expect(result.price).toBe(55000);
    });

    it('should handle missing optional fields', () => {
      const mockDoc = {
        id: 'car-456',
        data: () => ({
          sellerId: 'seller-1',
          make: 'Mercedes',
          model: 'C-Class',
          year: 2022,
          price: 40000,
          status: 'active',
          isActive: true,
          isSold: false,
          views: 0,
          favorites: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };

      const result = service.mapDocToCar(mockDoc);

      expect(result.mileage).toBeUndefined();
      expect(result.fuelType).toBeUndefined();
    });
  });
});
