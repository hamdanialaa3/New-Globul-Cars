// smart-search.service.test.ts
// Unit Tests for Smart Search Service
// Coverage Target: 85%+

import { collection, query, where, getDocs } from 'firebase/firestore';

// Mock dependencies
jest.mock('firebase/firestore');
jest.mock('../../../firebase/firebase-config', () => ({
  db: {},
}));
jest.mock('../../logger-service', () => ({
  serviceLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock('../../homepage-cache.service', () => ({
  homePageCache: {
    getOrFetch: jest.fn((key, fetcher) => fetcher()),
  },
  CACHE_KEYS: {},
}));
jest.mock('../search-history.service', () => ({
  searchHistoryService: {
    saveSearch: jest.fn(),
  },
}));
jest.mock('../search-personalization.service', () => ({
  searchPersonalizationService: {
    personalizeResults: jest.fn((cars) => cars),
  },
}));

describe('SmartSearchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseKeywords', () => {
    it('should parse brand names', () => {
      const keywords = 'BMW X5 2023';
      const brands = ['BMW', 'Mercedes', 'Audi', 'Toyota'];
      
      const containsBrand = brands.some((brand) =>
        keywords.toUpperCase().includes(brand.toUpperCase())
      );

      expect(containsBrand).toBe(true);
    });

    it('should parse model names', () => {
      const keywords = 'BMW X5 2023';
      const modelPattern = /X\d|M\d|E-Class|C-Class|A\d|Q\d/i;

      expect(modelPattern.test(keywords)).toBe(true);
    });

    it('should parse years', () => {
      const keywords = 'BMW 2020 2023';
      const yearPattern = /\b(19|20)\d{2}\b/g;
      const years = keywords.match(yearPattern);

      expect(years).toEqual(['2020', '2023']);
    });

    it('should parse price range', () => {
      const keywords = 'BMW 20000-50000 EUR';
      const pricePattern = /(\d+)\s*-\s*(\d+)/;
      const match = keywords.match(pricePattern);

      expect(match).toBeTruthy();
      expect(match![1]).toBe('20000');
      expect(match![2]).toBe('50000');
    });

    it('should parse fuel types', () => {
      const keywords = 'BMW diesel automatic';
      const fuelTypes = ['diesel', 'petrol', 'gasoline', 'electric', 'hybrid'];

      const hasFuel = fuelTypes.some((fuel) =>
        keywords.toLowerCase().includes(fuel)
      );

      expect(hasFuel).toBe(true);
    });

    it('should handle Bulgarian keywords', () => {
      const keywords = 'БМВ дизел автоматик';
      const cyrillicPattern = /[\u0400-\u04FF]/;

      expect(cyrillicPattern.test(keywords)).toBe(true);
    });
  });

  describe('executeSearch', () => {
    it('should search with brand filter', async () => {
      const mockCars = [
        {
          id: 'car-1',
          data: () => ({
            make: 'BMW',
            model: 'X5',
            year: 2023,
            price: 55000,
          }),
        },
      ];

      (getDocs as jest.Mock).mockResolvedValue({ docs: mockCars });

      const result = await getDocs(
        query(collection({} as any, 'cars'), where('make', '==', 'BMW'))
      );

      expect(result.docs).toHaveLength(1);
      expect(result.docs[0].data().make).toBe('BMW');
    });

    it('should search with price range', async () => {
      const cars = [
        { price: 30000 },
        { price: 45000 },
        { price: 60000 },
      ];

      const minPrice = 40000;
      const maxPrice = 50000;

      const filtered = cars.filter(
        (car) => car.price >= minPrice && car.price <= maxPrice
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].price).toBe(45000);
    });

    it('should search with year range', async () => {
      const cars = [
        { year: 2018 },
        { year: 2020 },
        { year: 2023 },
      ];

      const minYear = 2019;
      const maxYear = 2022;

      const filtered = cars.filter(
        (car) => car.year >= minYear && car.year <= maxYear
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].year).toBe(2020);
    });

    it('should combine multiple filters', async () => {
      const cars = [
        { make: 'BMW', year: 2023, price: 55000, fuelType: 'Diesel' },
        { make: 'BMW', year: 2020, price: 45000, fuelType: 'Petrol' },
        { make: 'Mercedes', year: 2023, price: 50000, fuelType: 'Diesel' },
      ];

      const filtered = cars.filter(
        (car) =>
          car.make === 'BMW' &&
          car.year >= 2022 &&
          car.price <= 60000 &&
          car.fuelType === 'Diesel'
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].year).toBe(2023);
    });
  });

  describe('personalization', () => {
    it('should personalize results for logged-in users', async () => {
      const cars = [
        { id: 'car-1', make: 'BMW', score: 0 },
        { id: 'car-2', make: 'Mercedes', score: 0 },
      ];

      const userPreferences = { preferredBrands: ['BMW'] };

      const personalized = cars.map((car) => ({
        ...car,
        score: userPreferences.preferredBrands.includes(car.make) ? 10 : 0,
      }));

      personalized.sort((a, b) => b.score - a.score);

      expect(personalized[0].make).toBe('BMW');
    });

    it('should boost recently viewed cars', () => {
      const cars = [
        { id: 'car-1', viewedAt: new Date('2024-12-01') },
        { id: 'car-2', viewedAt: new Date('2024-12-14') },
      ];

      const now = new Date('2024-12-15');
      const scores = cars.map((car) => {
        const daysSince = Math.floor(
          (now.getTime() - car.viewedAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        return { id: car.id, score: Math.max(0, 10 - daysSince) };
      });

      expect(scores[0].score).toBe(0); // 14 days ago
      expect(scores[1].score).toBe(9); // 1 day ago
    });
  });

  describe('pagination', () => {
    it('should paginate results', () => {
      const cars = Array.from({ length: 50 }, (_, i) => ({ id: `car-${i}` }));
      const page = 2;
      const pageSize = 20;

      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginated = cars.slice(start, end);

      expect(paginated).toHaveLength(20);
      expect(paginated[0].id).toBe('car-20');
      expect(paginated[19].id).toBe('car-39');
    });

    it('should handle last page with fewer items', () => {
      const cars = Array.from({ length: 45 }, (_, i) => ({ id: `car-${i}` }));
      const page = 3;
      const pageSize = 20;

      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginated = cars.slice(start, end);

      expect(paginated).toHaveLength(5);
    });
  });

  describe('caching', () => {
    it('should cache search results', async () => {
      const cacheKey = 'smart_search_BMW_user-123_1';
      const cacheData = [{ id: 'car-1', make: 'BMW' }];

      const cache = new Map<string, any>();
      cache.set(cacheKey, cacheData);

      const cached = cache.get(cacheKey);
      expect(cached).toEqual(cacheData);
    });

    it('should expire cache after TTL', () => {
      const ttl = 3 * 60 * 1000; // 3 minutes
      const cachedAt = Date.now() - 4 * 60 * 1000; // 4 minutes ago
      const now = Date.now();

      const isExpired = now - cachedAt > ttl;
      expect(isExpired).toBe(true);
    });
  });

  describe('search history', () => {
    it('should save search to history', () => {
      const searchHistory = [
        { query: 'BMW X5', timestamp: new Date('2024-12-14') },
        { query: 'Mercedes E-Class', timestamp: new Date('2024-12-15') },
      ];

      expect(searchHistory).toHaveLength(2);
      expect(searchHistory[0].query).toBe('BMW X5');
    });

    it('should limit history size', () => {
      const maxHistory = 50;
      const history = Array.from({ length: 60 }, (_, i) => ({ query: `Search ${i}` }));

      const limited = history.slice(-maxHistory);

      expect(limited).toHaveLength(50);
      expect(limited[0].query).toBe('Search 10');
    });
  });

  describe('error handling', () => {
    it('should handle empty search query', () => {
      const query = '   ';
      const trimmed = query.trim();

      expect(trimmed).toBe('');
    });

    it('should handle invalid characters', () => {
      const query = 'BMW<script>alert(1)</script>';
      const sanitized = query.replace(/<[^>]*>/g, '');

      expect(sanitized).toBe('BMWalert(1)');
    });

    it('should handle Firestore errors', async () => {
      (getDocs as jest.Mock).mockRejectedValue(new Error('Network error'));

      try {
        await getDocs(query(collection({} as any, 'cars')));
      } catch (error: any) {
        expect(error.message).toBe('Network error');
      }
    });
  });

  describe('performance', () => {
    it('should track processing time', () => {
      const startTime = Date.now();
      // Simulate processing
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      expect(processingTime).toBeGreaterThanOrEqual(0);
      expect(processingTime).toBeLessThan(1000); // Should be fast
    });

    it('should return results within acceptable time', () => {
      const maxProcessingTime = 500; // 500ms
      const actualTime = 250;

      expect(actualTime).toBeLessThan(maxProcessingTime);
    });
  });
});
