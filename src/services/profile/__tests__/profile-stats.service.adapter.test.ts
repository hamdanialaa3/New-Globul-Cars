// Adapter-based unit test for ProfileStatsService using injected data source.
// Ensures aggregation, caching, and invalidation without hitting Firebase.

import { profileStatsService, ProfileStatsDataSource } from '../profile-stats.service';

function makeSnap(docs: any[]) {
  return {
    forEach: (fn: (d: any) => void) => docs.forEach(doc => fn({ data: () => doc })),
    size: docs.length,
    docs: docs.map(d => ({ data: () => d }))
  };
}

function defaultDataSource(): ProfileStatsDataSource {
  return {
    fetchProfile: async () => ({ data: () => ({
      trustScore: 82,
      badges: ['verified'],
      verification: { phoneVerified: true, idVerified: false, businessVerified: false },
      type: 'dealer',
      createdAt: { toDate: () => new Date(Date.now() - 12 * 86400000) },
      stats: { avgResponseMinutes: 18, responseRate: 88 }
    }) }),
    fetchListings: async () => makeSnap([
      { status: 'published' },
      { status: 'published' },
      { status: 'sold' }
    ]),
    fetchListingMetrics: async () => makeSnap([
      { views30d: 120, messages30d: 14, favorites30d: 9 },
      { views30d: 80, messages30d: 6, favorites30d: 3 }
    ]),
    fetchReviews: async () => makeSnap([
      { rating: 5 },
      { rating: 4 },
      { rating: 5 }
    ]),
    fetchSavedSearches: async () => ([{ id: 's1' }, { id: 's2' }])
  };
}

beforeEach(() => {
  profileStatsService.setDataSource(defaultDataSource());
  profileStatsService.clearAllCache();
});

describe('ProfileStatsService (adapter injection)', () => {
  it('aggregates metrics correctly', async () => {
    const stats = await profileStatsService.getStats('profile-agg');
    expect(stats.trustScore).toBe(82);
    expect(stats.activeListings).toBe(2);
    expect(stats.soldListings).toBe(1);
    expect(stats.totalListings).toBe(3);
    expect(stats.views30d).toBe(200);
    expect(stats.messages30d).toBe(20);
    expect(stats.favorites30d).toBe(12);
    expect(stats.reviewCount).toBe(3);
    expect(stats.avgRating).toBeCloseTo((5 + 4 + 5) / 3);
    expect(stats.conversionRate30d).toBeCloseTo((20 / 200) * 100);
    expect(stats.savedSearchesCount).toBe(2);
    expect(stats.accountAge).toBeGreaterThanOrEqual(11);
  });

  it('caches results (second call returns same reference values)', async () => {
    const first = await profileStatsService.getStats('profile-cache');
    const second = await profileStatsService.getStats('profile-cache');
    expect(second).toEqual(first);
  });

  it('cache invalidation triggers recompute with new datasource', async () => {
    const first = await profileStatsService.getStats('profile-invalidate');
    profileStatsService.invalidateCache('profile-invalidate');
    const ds2: ProfileStatsDataSource = {
      fetchProfile: async () => ({ data: () => ({ trustScore: 40, badges: [], type: 'private', createdAt: { toDate: () => new Date() } }) }),
      fetchListings: async () => makeSnap([]),
      fetchListingMetrics: async () => makeSnap([]),
      fetchReviews: async () => makeSnap([]),
      fetchSavedSearches: async () => []
    };
    profileStatsService.setDataSource(ds2);
    const after = await profileStatsService.getStats('profile-invalidate');
    expect(after.trustScore).toBe(40);
    expect(after.trustScore).not.toBe(first.trustScore);
  });
});

