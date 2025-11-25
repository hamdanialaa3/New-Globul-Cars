// WorkflowAnalyticsService KPI Methods Tests
// Testing new conversion and listing KPI aggregation methods

import WorkflowAnalyticsService from '../workflow-analytics-service';
import { logger } from '../logger-service';

jest.mock('../../firebase/firebase-config');
jest.mock('../logger-service');

const mockGetDocs = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  query: jest.fn((...args) => args),
  where: jest.fn((field, op, value) => ({ field, op, value })),
  serverTimestamp: () => ({ seconds: Date.now() / 1000 }),
  addDoc: jest.fn(),
  Timestamp: {
    fromDate: (d: Date) => ({ toDate: () => d })
  }
}));

describe('WorkflowAnalyticsService - KPI Methods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getListingKpis', () => {
    it('should aggregate metrics correctly', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          { data: () => ({ views7d: 100, messages7d: 10, favorites7d: 5, views30d: 400, messages30d: 45 }) },
          { data: () => ({ views7d: 150, messages7d: 15, favorites7d: 8, views30d: 500, messages30d: 55 }) }
        ]
      });

      const kpis = await WorkflowAnalyticsService.getListingKpis('owner123');

      expect(kpis.views7d).toBe(250);
      expect(kpis.messages7d).toBe(25);
      expect(kpis.favorites7d).toBe(13);
      expect(kpis.views30d).toBe(900);
      expect(kpis.messages30d).toBe(100);
    });

    it('should calculate conversion rate correctly', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          { data: () => ({ views30d: 1000, messages30d: 50 }) }
        ]
      });

      const kpis = await WorkflowAnalyticsService.getListingKpis('owner123');

      expect(kpis.conversionRate30d).toBe(5);
    });

    it('should handle zero views without division error', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          { data: () => ({ views30d: 0, messages30d: 10 }) }
        ]
      });

      const kpis = await WorkflowAnalyticsService.getListingKpis('owner123');

      expect(kpis.conversionRate30d).toBe(0);
    });

    it('should handle missing data gracefully', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          { data: () => ({}) }
        ]
      });

      const kpis = await WorkflowAnalyticsService.getListingKpis('owner123');

      expect(kpis.views7d).toBe(0);
      expect(kpis.messages7d).toBe(0);
      expect(kpis.conversionRate30d).toBe(0);
    });

    it('should return zeros on error', async () => {
      mockGetDocs.mockRejectedValue(new Error('Firestore error'));

      const kpis = await WorkflowAnalyticsService.getListingKpis('owner123');

      expect(kpis.views7d).toBe(0);
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('getConversionSummary', () => {
    it('should calculate workflow conversion correctly', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          { data: () => ({ sessionId: 's1', action: 'entered', step: 0 }) },
          { data: () => ({ sessionId: 's1', action: 'completed', step: 7 }) },
          { data: () => ({ sessionId: 's2', action: 'entered', step: 0 }) },
          { data: () => ({ sessionId: 's2', action: 'abandoned', step: 3 }) },
          { data: () => ({ sessionId: 's3', action: 'entered', step: 0 }) },
          { data: () => ({ sessionId: 's3', action: 'completed', step: 7 }) }
        ]
      });

      const summary = await WorkflowAnalyticsService.getConversionSummary();

      expect(summary.sessions).toBe(3);
      expect(summary.published).toBe(2);
      expect(summary.conversionRate).toBeCloseTo(66.67, 1);
    });

    it('should handle zero sessions', async () => {
      mockGetDocs.mockResolvedValue({ docs: [] });

      const summary = await WorkflowAnalyticsService.getConversionSummary();

      expect(summary.sessions).toBe(0);
      expect(summary.published).toBe(0);
      expect(summary.conversionRate).toBe(0);
    });

    it('should return zeros on error', async () => {
      mockGetDocs.mockRejectedValue(new Error('Query failed'));

      const summary = await WorkflowAnalyticsService.getConversionSummary();

      expect(summary.sessions).toBe(0);
      expect(summary.published).toBe(0);
      expect(logger.warn).toHaveBeenCalled();
    });
  });
});
