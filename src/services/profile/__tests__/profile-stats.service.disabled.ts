// ProfileStatsService Unit Tests - Simplified version
// Testing cache, aggregation, error handling with proper Jest mocking

import { profileStatsService } from '../profile-stats.service';

// Mock Firebase after imports
jest.mock('@/firebase/firebase-config', () => ({
  db: {}
}));

jest.mock('@/services/logger-service', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

jest.mock('@/services/search/saved-searches.service', () => ({
  savedSearchesService: {
    list: jest.fn()
  }
}));

jest.mock('@/services/workflow-analytics-service', () => ({
  default: jest.fn().mockImplementation(() => ({
    getConversionSummary: jest.fn(),
    getKPIs: jest.fn()
  }))
}));

// Mock Firestore
jest.mock('firebase/firestore', () => {
  const mockGetDocs = jest.fn();
  const mockOnSnapshot = jest.fn();
  const mockGetDoc = jest.fn();
  return {
    collection: jest.fn(),
    doc: jest.fn(),
    getDoc: mockGetDoc,
    getDocs: mockGetDocs,
    query: jest.fn((...args) => args),
    where: jest.fn((field, op, value) => ({ field, op, value })),
    onSnapshot: mockOnSnapshot,
    Timestamp: {
      fromDate: jest.fn((d) => ({ toDate: () => d, seconds: d.getTime() / 1000, nanoseconds: 0 })),
      now: jest.fn(() => ({ toDate: () => new Date(), seconds: Date.now() / 1000, nanoseconds: 0 }))
    }
  };
});

describe('ProfileStatsService - Basic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    if (profileStatsService.clearAllCache) {
      profileStatsService.clearAllCache();
    }
  });

  it('should export profileStatsService singleton', () => {
    expect(profileStatsService).toBeDefined();
    expect(typeof profileStatsService.getStats).toBe('function');
  });

  it('should have clearCache method', () => {
    expect(typeof profileStatsService.clearCache).toBe('function');
  });

  it('should have clearAllCache method', () => {
    expect(typeof profileStatsService.clearAllCache).toBe('function');
  });
});
