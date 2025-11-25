// SavedSearchesService Validation Tests
// Testing criteria validation logic and CRUD operations

import { savedSearchesService, SavedSearchCriteria } from '../saved-searches.service';

jest.mock('../../firebase/firebase-config');

const mockAddDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockDeleteDoc = jest.fn();
const mockUpdateDoc = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  query: jest.fn((...args) => args),
  where: jest.fn(),
  Timestamp: {
    fromDate: (d: Date) => ({ toDate: () => d })
  }
}));

describe('SavedSearchesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validation', () => {
    it('should reject minYear > maxYear', async () => {
      const criteria: SavedSearchCriteria = {
        minYear: 2023,
        maxYear: 2020
      };

      await expect(
        savedSearchesService.create('user123', criteria)
      ).rejects.toThrow('minYear cannot exceed maxYear');
    });

    it('should reject negative maxPriceEur', async () => {
      const criteria: SavedSearchCriteria = {
        maxPriceEur: -100
      };

      await expect(
        savedSearchesService.create('user123', criteria)
      ).rejects.toThrow('maxPriceEur must be >= 0');
    });

    it('should reject too many fuelTypes', async () => {
      const criteria: SavedSearchCriteria = {
        fuelTypes: Array(15).fill('diesel')
      };

      await expect(
        savedSearchesService.create('user123', criteria)
      ).rejects.toThrow('Too many fuelTypes');
    });

    it('should accept valid criteria', async () => {
      const criteria: SavedSearchCriteria = {
        make: 'BMW',
        model: '3 Series',
        minYear: 2018,
        maxYear: 2023,
        maxPriceEur: 25000
      };

      mockAddDoc.mockResolvedValue({ id: 'search123' });

      const result = await savedSearchesService.create('user123', criteria);
      
      expect(result.id).toBe('search123');
      expect(result.criteria.make).toBe('BMW');
      expect(mockAddDoc).toHaveBeenCalled();
    });
  });

  describe('CRUD Operations', () => {
    it('should list saved searches for user', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          { id: 's1', data: () => ({ userId: 'user123', criteria: { make: 'Audi' } }) },
          { id: 's2', data: () => ({ userId: 'user123', criteria: { make: 'BMW' } }) }
        ]
      });

      const list = await savedSearchesService.list('user123');

      expect(list.length).toBe(2);
      expect(list[0].id).toBe('s1');
      expect(list[1].criteria.make).toBe('BMW');
    });

    it('should create with default notification settings', async () => {
      mockAddDoc.mockResolvedValue({ id: 'search123' });

      const result = await savedSearchesService.create('user123', { make: 'Toyota' });

      expect(result.notification.enabled).toBe(true);
      expect(result.notification.channels).toEqual(['inapp']);
    });

    it('should delete saved search', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);

      await savedSearchesService.delete('user123', 'search123');

      expect(mockDeleteDoc).toHaveBeenCalled();
    });

    it('should disable/enable notifications', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await savedSearchesService.disable('user123', 'search123');
      expect(mockUpdateDoc).toHaveBeenCalledWith(expect.anything(), { 'notification.enabled': false });

      await savedSearchesService.enable('user123', 'search123');
      expect(mockUpdateDoc).toHaveBeenCalledWith(expect.anything(), { 'notification.enabled': true });
    });
  });

  describe('Query Plan Builder', () => {
    it('should build simple query plan', () => {
      const criteria: SavedSearchCriteria = {
        make: 'BMW',
        model: 'X5'
      };

      const plan = savedSearchesService.buildQueryPlan(criteria);

      expect(plan.fields.make).toBe('BMW');
      expect(plan.fields.model).toBe('X5');
    });

    it('should handle year range', () => {
      const criteria: SavedSearchCriteria = {
        minYear: 2015,
        maxYear: 2020
      };

      const plan = savedSearchesService.buildQueryPlan(criteria);

      expect(plan.range.year).toEqual([2015, 2020]);
    });

    it('should handle single fuel type', () => {
      const criteria: SavedSearchCriteria = {
        fuelTypes: ['diesel']
      };

      const plan = savedSearchesService.buildQueryPlan(criteria);

      expect(plan.fields.fuelType).toBe('diesel');
    });

    it('should not add fuel field for multiple types', () => {
      const criteria: SavedSearchCriteria = {
        fuelTypes: ['diesel', 'petrol']
      };

      const plan = savedSearchesService.buildQueryPlan(criteria);

      expect(plan.fields.fuelType).toBeUndefined();
    });
  });
});
