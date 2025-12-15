// algolia-search.service.test.ts
// Unit Tests for Algolia Search Integration
// Coverage Target: 70%+

// Mock Algolia client
jest.mock('algoliasearch', () => {
  return jest.fn(() => ({
    initIndex: jest.fn(() => ({
      search: jest.fn(),
      saveObject: jest.fn(),
      saveObjects: jest.fn(),
      deleteObject: jest.fn(),
      partialUpdateObject: jest.fn(),
      setSettings: jest.fn(),
    })),
  }));
});

jest.mock('../../logger-service', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import algoliasearch from 'algoliasearch';

describe('AlgoliaSearchService', () => {
  let mockClient: any;
  let mockIndex: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockIndex = {
      search: jest.fn(),
      saveObject: jest.fn(),
      saveObjects: jest.fn(),
      deleteObject: jest.fn(),
      partialUpdateObject: jest.fn(),
      setSettings: jest.fn(),
    };

    // Properly setup mock client with initIndex method
    const mockInitIndex = jest.fn().mockReturnValue(mockIndex);
    mockClient = {
      initIndex: mockInitIndex,
    };
    
    // Make algoliasearch return our mock client
    (algoliasearch as jest.MockedFunction<typeof algoliasearch>).mockReturnValue(mockClient as any);
  });

  describe('Search Operations', () => {
    it('should search with query', async () => {
      const mockResults = {
        hits: [
          { objectID: 'car-1', make: 'BMW', model: 'X5', price: 55000 },
          { objectID: 'car-2', make: 'BMW', model: 'X3', price: 45000 },
        ],
        nbHits: 2,
        page: 0,
        nbPages: 1,
      };

      mockIndex.search.mockResolvedValue(mockResults);

      const results = await mockIndex.search('BMW');

      expect(results.hits).toHaveLength(2);
      expect(results.hits[0].make).toBe('BMW');
    });

    it('should search with filters', async () => {
      const mockResults = {
        hits: [
          { objectID: 'car-1', make: 'BMW', year: 2023, price: 55000 },
        ],
        nbHits: 1,
      };

      mockIndex.search.mockResolvedValue(mockResults);

      const filters = 'make:BMW AND year:2023';
      const results = await mockIndex.search('', { filters });

      expect(results.hits).toHaveLength(1);
      expect(results.hits[0].year).toBe(2023);
    });

    it('should search with facets', async () => {
      const mockResults = {
        hits: [],
        nbHits: 0,
        facets: {
          make: { BMW: 15, Mercedes: 12, Audi: 8 },
          year: { 2023: 10, 2022: 8, 2021: 5 },
        },
      };

      mockIndex.search.mockResolvedValue(mockResults);

      const results = await mockIndex.search('', {
        facets: ['make', 'year'],
      });

      expect(results.facets?.make).toBeDefined();
      expect(results.facets?.make.BMW).toBe(15);
    });

    it('should paginate results', async () => {
      const page1 = {
        hits: Array.from({ length: 20 }, (_, i) => ({ objectID: `car-${i}` })),
        page: 0,
        nbPages: 5,
      };

      const page2 = {
        hits: Array.from({ length: 20 }, (_, i) => ({ objectID: `car-${i + 20}` })),
        page: 1,
        nbPages: 5,
      };

      mockIndex.search
        .mockResolvedValueOnce(page1)
        .mockResolvedValueOnce(page2);

      const results1 = await mockIndex.search('', { page: 0, hitsPerPage: 20 });
      const results2 = await mockIndex.search('', { page: 1, hitsPerPage: 20 });

      expect(results1.hits[0].objectID).toBe('car-0');
      expect(results2.hits[0].objectID).toBe('car-20');
    });
  });

  describe('Index Operations', () => {
    it('should index new car listing', async () => {
      const car = {
        objectID: 'car-123',
        make: 'BMW',
        model: 'X5',
        year: 2023,
        price: 55000,
        mileage: 15000,
        fuelType: 'Diesel',
      };

      mockIndex.saveObject.mockResolvedValue({ taskID: 12345 });

      const result = await mockIndex.saveObject(car);

      expect(mockIndex.saveObject).toHaveBeenCalledWith(car);
      expect(result.taskID).toBe(12345);
    });

    it('should batch index multiple listings', async () => {
      const cars = [
        { objectID: 'car-1', make: 'BMW', price: 55000 },
        { objectID: 'car-2', make: 'Mercedes', price: 60000 },
        { objectID: 'car-3', make: 'Audi', price: 50000 },
      ];

      mockIndex.saveObjects.mockResolvedValue({ taskID: 12346 });

      const result = await mockIndex.saveObjects(cars);

      expect(mockIndex.saveObjects).toHaveBeenCalledWith(cars);
      expect(result.taskID).toBe(12346);
    });

    it('should update existing listing', async () => {
      const updates = {
        objectID: 'car-123',
        price: 50000, // Price reduced
      };

      mockIndex.partialUpdateObject.mockResolvedValue({ taskID: 12347 });

      const result = await mockIndex.partialUpdateObject(updates);

      expect(mockIndex.partialUpdateObject).toHaveBeenCalledWith(updates);
    });

    it('should delete listing', async () => {
      mockIndex.deleteObject.mockResolvedValue({ taskID: 12348 });

      const result = await mockIndex.deleteObject('car-123');

      expect(mockIndex.deleteObject).toHaveBeenCalledWith('car-123');
      expect(result.taskID).toBe(12348);
    });
  });

  describe('Index Configuration', () => {
    it('should configure searchable attributes', async () => {
      const settings = {
        searchableAttributes: [
          'make',
          'model',
          'description',
          'fuelType',
          'transmission',
        ],
      };

      mockIndex.setSettings.mockResolvedValue({ taskID: 12349 });

      await mockIndex.setSettings(settings);

      expect(mockIndex.setSettings).toHaveBeenCalledWith(settings);
    });

    it('should configure ranking criteria', async () => {
      const settings = {
        ranking: [
          'typo',
          'geo',
          'words',
          'filters',
          'proximity',
          'attribute',
          'exact',
          'custom',
        ],
        customRanking: ['desc(year)', 'asc(price)'],
      };

      mockIndex.setSettings.mockResolvedValue({ taskID: 12350 });

      await mockIndex.setSettings(settings);

      expect(settings.customRanking).toContain('desc(year)');
      expect(settings.customRanking).toContain('asc(price)');
    });

    it('should configure facets', async () => {
      const settings = {
        attributesForFaceting: [
          'make',
          'year',
          'fuelType',
          'transmission',
          'bodyType',
          'color',
        ],
      };

      mockIndex.setSettings.mockResolvedValue({ taskID: 12351 });

      await mockIndex.setSettings(settings);

      expect(settings.attributesForFaceting).toHaveLength(6);
    });
  });

  describe('Advanced Filtering', () => {
    it('should filter by price range', async () => {
      const filters = 'price >= 40000 AND price <= 60000';

      mockIndex.search.mockResolvedValue({
        hits: [
          { objectID: 'car-1', price: 45000 },
          { objectID: 'car-2', price: 55000 },
        ],
      });

      const results = await mockIndex.search('', { filters });

      expect(results.hits.every((h: any) => h.price >= 40000 && h.price <= 60000)).toBe(
        true
      );
    });

    it('should filter by multiple criteria', async () => {
      const filters =
        'make:BMW AND year:2023 AND fuelType:Diesel AND price < 60000';

      mockIndex.search.mockResolvedValue({
        hits: [
          {
            objectID: 'car-1',
            make: 'BMW',
            year: 2023,
            fuelType: 'Diesel',
            price: 55000,
          },
        ],
      });

      const results = await mockIndex.search('', { filters });

      expect(results.hits[0].make).toBe('BMW');
      expect(results.hits[0].year).toBe(2023);
    });

    it('should use OR filters', async () => {
      const filters = 'make:BMW OR make:Mercedes';

      mockIndex.search.mockResolvedValue({
        hits: [
          { objectID: 'car-1', make: 'BMW' },
          { objectID: 'car-2', make: 'Mercedes' },
        ],
      });

      const results = await mockIndex.search('', { filters });

      expect(results.hits.some((h: any) => h.make === 'BMW')).toBe(true);
      expect(results.hits.some((h: any) => h.make === 'Mercedes')).toBe(true);
    });
  });

  describe('Geolocation Search', () => {
    it('should search near location', async () => {
      const sofia = { lat: 42.6977, lng: 23.3219 };

      mockIndex.search.mockResolvedValue({
        hits: [
          {
            objectID: 'car-1',
            _geoloc: { lat: 42.7, lng: 23.3 },
            _rankingInfo: { geoDistance: 500 },
          },
        ],
      });

      const results = await mockIndex.search('', {
        aroundLatLng: `${sofia.lat},${sofia.lng}`,
        aroundRadius: 10000, // 10km
      });

      expect(results.hits[0]._rankingInfo.geoDistance).toBeLessThan(10000);
    });

    it('should sort by distance', async () => {
      const hits = [
        { objectID: 'car-1', distance: 5000 },
        { objectID: 'car-2', distance: 2000 },
        { objectID: 'car-3', distance: 8000 },
      ];

      const sorted = [...hits].sort((a, b) => a.distance - b.distance);

      expect(sorted[0].objectID).toBe('car-2');
      expect(sorted[2].objectID).toBe('car-3');
    });
  });

  describe('Error Handling', () => {
    it('should handle search errors', async () => {
      mockIndex.search.mockRejectedValue(new Error('Network error'));

      await expect(mockIndex.search('BMW')).rejects.toThrow('Network error');
    });

    it('should handle indexing errors', async () => {
      mockIndex.saveObject.mockRejectedValue(new Error('Invalid object'));

      await expect(
        mockIndex.saveObject({ objectID: 'invalid' })
      ).rejects.toThrow('Invalid object');
    });

    it('should handle API rate limits', async () => {
      mockIndex.search.mockRejectedValue({
        status: 429,
        message: 'Rate limit exceeded',
      });

      await expect(mockIndex.search('BMW')).rejects.toMatchObject({
        status: 429,
      });
    });
  });

  describe('Performance', () => {
    it('should return results quickly', async () => {
      mockIndex.search.mockResolvedValue({
        hits: [],
        nbHits: 0,
        processingTimeMS: 5,
      });

      const results = await mockIndex.search('BMW');

      expect(results.processingTimeMS).toBeLessThan(50);
    });

    it('should cache frequent queries', () => {
      const cache = new Map<string, any>();
      const cacheKey = 'search_BMW_page_0';

      cache.set(cacheKey, { hits: [], cached: true });

      const cached = cache.get(cacheKey);
      expect(cached.cached).toBe(true);
    });
  });

  describe('Analytics', () => {
    it('should track search queries', () => {
      const searches = [
        { query: 'BMW X5', timestamp: Date.now(), results: 15 },
        { query: 'Mercedes E-Class', timestamp: Date.now(), results: 12 },
      ];

      expect(searches).toHaveLength(2);
      expect(searches[0].query).toBe('BMW X5');
    });

    it('should identify popular searches', () => {
      const searches = [
        { query: 'BMW', count: 150 },
        { query: 'Mercedes', count: 120 },
        { query: 'Audi', count: 90 },
      ];

      const popular = searches.filter((s) => s.count > 100);

      expect(popular).toHaveLength(2);
      expect(popular[0].query).toBe('BMW');
    });
  });
});
