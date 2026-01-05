/**
 * Tests for carsService.ts
 * Verifies the facade correctly exports and delegates to UnifiedCarService
 */

import { 
  Car, 
  SearchFilters,
  getCarById,
  getAllCars,
  searchCars,
  getCarsByBrand,
  getFeaturedCars,
  getNewCars,
  getSimilarCars,
  getUserCars
} from '../carsService';

// Mock the unified car service
jest.mock('../car/unified-car-service', () => ({
  unifiedCarService: {
    getCarById: jest.fn(),
    searchCars: jest.fn(),
    getFeaturedCars: jest.fn(),
    getNewCarsLast24Hours: jest.fn(),
    getSimilarCars: jest.fn(),
    getUserCars: jest.fn()
  }
}));

// Mock the logger
jest.mock('../logger-service', () => ({
  serviceLogger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

import { unifiedCarService } from '../car/unified-car-service';

describe('carsService', () => {
  const mockCar: Car = {
    id: 'test-car-1',
    sellerId: 'user-123',
    make: 'BMW',
    model: 'X5',
    year: 2020,
    price: 35000,
    mileage: 50000,
    fuelType: 'Дизел',
    transmission: 'Автоматична',
    status: 'active',
    isActive: true,
    isSold: false,
    views: 100,
    favorites: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: ['image1.jpg', 'image2.jpg']
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Type Exports', () => {
    it('should export Car type compatible with UnifiedCar', () => {
      const car: Car = mockCar;
      expect(car.id).toBe('test-car-1');
      expect(car.make).toBe('BMW');
    });

    it('should export SearchFilters type', () => {
      const filters: SearchFilters = {
        make: 'BMW',
        minPrice: 10000,
        maxPrice: 50000
      };
      expect(filters.make).toBe('BMW');
    });
  });

  describe('getCarById', () => {
    it('should call unifiedCarService.getCarById with string ID', async () => {
      (unifiedCarService.getCarById as jest.Mock).mockResolvedValue(mockCar);

      const result = await getCarById('test-car-1');

      expect(unifiedCarService.getCarById).toHaveBeenCalledWith('test-car-1');
      expect(result).toEqual(mockCar);
    });

    it('should convert numeric ID to string', async () => {
      (unifiedCarService.getCarById as jest.Mock).mockResolvedValue(mockCar);

      const result = await getCarById(123);

      expect(unifiedCarService.getCarById).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockCar);
    });

    it('should return null when car not found', async () => {
      (unifiedCarService.getCarById as jest.Mock).mockResolvedValue(null);

      const result = await getCarById('nonexistent');

      expect(result).toBeNull();
    });

    it('should throw error when service fails', async () => {
      const error = new Error('Database error');
      (unifiedCarService.getCarById as jest.Mock).mockRejectedValue(error);

      await expect(getCarById('test-car-1')).rejects.toThrow('Database error');
    });
  });

  describe('getAllCars', () => {
    it('should call searchCars with default isActive filter', async () => {
      const mockCars = [mockCar];
      (unifiedCarService.searchCars as jest.Mock).mockResolvedValue(mockCars);

      const result = await getAllCars();

      expect(unifiedCarService.searchCars).toHaveBeenCalledWith(
        { isActive: true },
        50
      );
      expect(result).toEqual(mockCars);
    });

    it('should pass custom filters and limit', async () => {
      const mockCars = [mockCar];
      (unifiedCarService.searchCars as jest.Mock).mockResolvedValue(mockCars);

      const filters: SearchFilters = { make: 'BMW', minYear: 2015 };
      const result = await getAllCars(filters, 20);

      expect(unifiedCarService.searchCars).toHaveBeenCalledWith(
        { isActive: true, ...filters },
        20
      );
      expect(result).toEqual(mockCars);
    });
  });

  describe('searchCars', () => {
    it('should delegate to unifiedCarService.searchCars', async () => {
      const mockCars = [mockCar];
      (unifiedCarService.searchCars as jest.Mock).mockResolvedValue(mockCars);

      const filters: SearchFilters = { make: 'BMW', minPrice: 20000 };
      const result = await searchCars(filters, 30);

      expect(unifiedCarService.searchCars).toHaveBeenCalledWith(filters, 30);
      expect(result).toEqual(mockCars);
    });
  });

  describe('getCarsByBrand', () => {
    it('should search cars by make', async () => {
      const mockCars = [mockCar];
      (unifiedCarService.searchCars as jest.Mock).mockResolvedValue(mockCars);

      const result = await getCarsByBrand('BMW', 15);

      expect(unifiedCarService.searchCars).toHaveBeenCalledWith(
        { make: 'BMW', isActive: true },
        15
      );
      expect(result).toEqual(mockCars);
    });

    it('should return empty array for empty brand name', async () => {
      const result = await getCarsByBrand('', 10);

      expect(unifiedCarService.searchCars).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('getFeaturedCars', () => {
    it('should delegate to unifiedCarService.getFeaturedCars', async () => {
      const mockCars = [mockCar];
      (unifiedCarService.getFeaturedCars as jest.Mock).mockResolvedValue(mockCars);

      const result = await getFeaturedCars(6);

      expect(unifiedCarService.getFeaturedCars).toHaveBeenCalledWith(6);
      expect(result).toEqual(mockCars);
    });
  });

  describe('getNewCars', () => {
    it('should delegate to unifiedCarService.getNewCarsLast24Hours', async () => {
      const mockCars = [mockCar];
      (unifiedCarService.getNewCarsLast24Hours as jest.Mock).mockResolvedValue(mockCars);

      const result = await getNewCars(10);

      expect(unifiedCarService.getNewCarsLast24Hours).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockCars);
    });
  });

  describe('getSimilarCars', () => {
    it('should delegate to unifiedCarService.getSimilarCars', async () => {
      const mockCars = [mockCar];
      (unifiedCarService.getSimilarCars as jest.Mock).mockResolvedValue(mockCars);

      const result = await getSimilarCars('test-car-1', 8);

      expect(unifiedCarService.getSimilarCars).toHaveBeenCalledWith('test-car-1', 8);
      expect(result).toEqual(mockCars);
    });
  });

  describe('getUserCars', () => {
    it('should delegate to unifiedCarService.getUserCars', async () => {
      const mockCars = [mockCar];
      (unifiedCarService.getUserCars as jest.Mock).mockResolvedValue(mockCars);

      const result = await getUserCars('user-123');

      expect(unifiedCarService.getUserCars).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockCars);
    });

    it('should return empty array for empty userId', async () => {
      const result = await getUserCars('');

      expect(unifiedCarService.getUserCars).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
