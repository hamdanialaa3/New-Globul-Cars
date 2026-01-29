// Adapter test using precompiled JS version of ProfileStatsService.
// Ensures aggregation, caching, and invalidation work with DI.

const path = require('path');
// Require compiled service (built by scripts/pretest-profile-stats.js)
const { profileStatsService } = require(path.resolve(__dirname, '../../../../dist-test/services/profile/profile-stats.service.js'));

function makeSnap(docs) {
  return {
    forEach: fn => docs.forEach(doc => fn({ data: () => doc })),
    size: docs.length,
    docs: docs.map(d => ({ data: () => d }))
  };
}

function makeDataSource() {
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
  profileStatsService.setDataSource(makeDataSource());
  profileStatsService.clearAllCache();
});

describe('ProfileStatsService (precompiled adapter)', () => {
  test('smoke test', () => {
    expect(typeof profileStatsService.getStats).toBe('function');
  });
  test('aggregates metrics correctly', async () => {
    const stats = await profileStatsService.getStats('agg');
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

  test('caches results', async () => {
    const first = await profileStatsService.getStats('cache');
    const second = await profileStatsService.getStats('cache');
    expect(second).toEqual(first);
  });

  test('cache invalidation triggers recompute', async () => {
    const first = await profileStatsService.getStats('invalidate');
    profileStatsService.invalidateCache('invalidate');
    profileStatsService.setDataSource({
      fetchProfile: async () => ({ data: () => ({ trustScore: 40, badges: [], type: 'private', createdAt: { toDate: () => new Date() } }) }),
      fetchListings: async () => makeSnap([]),
      fetchListingMetrics: async () => makeSnap([]),
      fetchReviews: async () => makeSnap([]),
      fetchSavedSearches: async () => []
    });
    const after = await profileStatsService.getStats('invalidate');
    expect(after.trustScore).toBe(40);
    expect(after.trustScore).not.toBe(first.trustScore);
  });
});
