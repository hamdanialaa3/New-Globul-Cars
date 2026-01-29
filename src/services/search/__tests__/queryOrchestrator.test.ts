import { describe, it, expect } from '@jest/globals';
import { runUnifiedQuery } from '../queryOrchestrator';

// Mock Algolia search service to isolate orchestrator decision logic
jest.mock('@/services/algoliaSearchService', () => ({
  __esModule: true,
  default: {
    searchCars: async () => ({
      cars: [{ id: 'ALG1', make: 'Audi', model: 'A3' }],
      totalResults: 1,
      processingTime: 7
    })
  }
}));

// Mock Firestore getDocs to avoid hitting real Firebase, keep other exports intact
jest.mock('firebase/firestore', () => {
  const actual = jest.requireActual('firebase/firestore');
  return {
    ...actual,
    getDocs: async (_q: any) => ({
      forEach: (cb: any) => {
        cb({ id: 'FS1', data: () => ({ make: 'Audi', model: 'A3' }) });
        cb({ id: 'FS2', data: () => ({ make: 'Audi', model: 'A4' }) });
      }
    })
  };
});

describe('queryOrchestrator', () => {
  it('routes to Algolia when free text searchDescription present', async () => {
    const res = await runUnifiedQuery({ searchDescription: 'turbo sport' });
    expect(res.source).toBe('algolia');
    expect(res.cars.length).toBe(1);
  });

  it('routes to Algolia when equipment arrays provided (no text)', async () => {
    const res = await runUnifiedQuery({ safetyEquipment: ['ABS', 'Airbags'] } as any);
    expect(res.source).toBe('algolia');
  });

  it('routes to Firestore when neither text nor arrays provided', async () => {
    // Provide simple exact filters that should trigger Firestore path
    const res = await runUnifiedQuery({ make: 'Audi', model: 'A3' });
    expect(res.source).toBe('firestore');
    expect(res.cars.length).toBeGreaterThan(0);
  });
});
