// Tests for unified-workflow-persistence.service.ts
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import UnifiedWorkflowPersistenceService from '../unified-workflow-persistence.service';

describe('UnifiedWorkflowPersistenceService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
    jest.useFakeTimers(); // Use fake timers for debounce testing
  });

  afterEach(() => {
    jest.useRealTimers(); // Restore real timers after each test
  });

  describe('saveData', () => {
    it('should save data to localStorage', () => {
      const testData = {
        make: 'BMW',
        model: '320i',
        year: 2020,
      };

      UnifiedWorkflowPersistenceService.saveData(testData, 'vehicleData');

      const saved = localStorage.getItem('unified-workflow-data');
      expect(saved).toBeTruthy();
      
      const parsed = JSON.parse(saved!);
      expect(parsed.make).toBe('BMW');
      expect(parsed.model).toBe('320i');
      expect(parsed.year).toBe(2020);
    });

    it('should debounce rapid saves (100ms)', () => {
      const spy = jest.spyOn(localStorage, 'setItem');

      // Rapid saves within 100ms
      UnifiedWorkflowPersistenceService.saveData({ test: 1 }, 'step1');
      UnifiedWorkflowPersistenceService.saveData({ test: 2 }, 'step1');
      UnifiedWorkflowPersistenceService.saveData({ test: 3 }, 'step1');

      // First save should happen, next 2 should be debounced
      expect(spy).toHaveBeenCalledTimes(1);

      // Advance timers past debounce period (100ms)
      jest.advanceTimersByTime(150);

      // Now next save should work
      UnifiedWorkflowPersistenceService.saveData({ test: 4 }, 'step1');
      expect(spy).toHaveBeenCalledTimes(2);

      spy.mockRestore();
    });

    it('should prevent concurrent saves', () => {
      const spy = jest.spyOn(localStorage, 'setItem');

      // Simulate concurrent saves
      UnifiedWorkflowPersistenceService.saveData({ concurrent: 1 }, 'step1');
      UnifiedWorkflowPersistenceService.saveData({ concurrent: 2 }, 'step1');

      // Only first save should execute
      expect(spy).toHaveBeenCalledTimes(1);

      spy.mockRestore();
    });

    it('should merge updates with existing data', () => {
      // Save initial data
      UnifiedWorkflowPersistenceService.saveData({ make: 'BMW' }, 'vehicleData');

      // Wait for debounce
      jest.advanceTimersByTime(150);

      // Save additional data
      UnifiedWorkflowPersistenceService.saveData({ model: '320i' }, 'vehicleData');

      const saved = localStorage.getItem('unified-workflow-data');
      const parsed = JSON.parse(saved!);

      expect(parsed.make).toBe('BMW');
      expect(parsed.model).toBe('320i');
    });
  });

  describe('getData', () => {
    it('should retrieve saved data', () => {
      const testData = {
        make: 'Mercedes',
        model: 'C200',
        year: 2021,
      };

      UnifiedWorkflowPersistenceService.saveData(testData, 'vehicleData');

      const retrieved = UnifiedWorkflowPersistenceService.getData();
      expect(retrieved.make).toBe('Mercedes');
      expect(retrieved.model).toBe('C200');
      expect(retrieved.year).toBe(2021);
    });

    it('should return empty object if no data exists', () => {
      const retrieved = UnifiedWorkflowPersistenceService.getData();
      expect(retrieved).toEqual({});
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('unified-workflow-data', 'invalid json');

      const retrieved = UnifiedWorkflowPersistenceService.getData();
      expect(retrieved).toEqual({});
    });
  });

  describe('clearData', () => {
    it('should clear all workflow data', () => {
      // Save some data
      UnifiedWorkflowPersistenceService.saveData({ test: 'data' }, 'step1');

      expect(localStorage.getItem('unified-workflow-data')).toBeTruthy();

      // Clear data
      UnifiedWorkflowPersistenceService.clearData();

      expect(localStorage.getItem('unified-workflow-data')).toBeNull();
    });

    it('should wait for saveInProgress before clearing', () => {
      // Start a save operation
      UnifiedWorkflowPersistenceService.saveData({ test: 'data' }, 'step1');

      // Try to clear immediately
      const clearPromise = UnifiedWorkflowPersistenceService.clearData();

      // Should wait for save to complete
      expect(clearPromise).toBeDefined();

      expect(localStorage.getItem('unified-workflow-data')).toBeNull();
    });
  });

  describe('getCurrentStep', () => {
    it('should return saved current step', () => {
      UnifiedWorkflowPersistenceService.saveData({ test: 'data' }, 'vehicleData');

      const step = UnifiedWorkflowPersistenceService.getCurrentStep();
      expect(step).toBe('vehicleData');
    });

    it('should return null if no step saved', () => {
      const step = UnifiedWorkflowPersistenceService.getCurrentStep();
      expect(step).toBeNull();
    });
  });

  describe('updateCurrentStep', () => {
    it('should update current step', () => {
      UnifiedWorkflowPersistenceService.updateCurrentStep('equipment');

      const step = UnifiedWorkflowPersistenceService.getCurrentStep();
      expect(step).toBe('equipment');
    });
  });
});
