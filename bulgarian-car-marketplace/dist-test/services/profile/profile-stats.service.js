"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var profile_stats_service_exports = {};
__export(profile_stats_service_exports, {
  default: () => profile_stats_service_default,
  profileStatsService: () => profileStatsService
});
module.exports = __toCommonJS(profile_stats_service_exports);
var import_firestore = require("firebase/firestore");
var import_firebase_config = require("@/firebase/firebase-config");
var import_logger_service = require("@/services/logger-service");
var import_saved_searches = require("@/services/search/saved-searches.service");
const defaultDataSource = {
  fetchProfile: async (profileId) => {
    const snap = await (0, import_firestore.getDocs)((0, import_firestore.query)((0, import_firestore.collection)(import_firebase_config.db, "profiles"), (0, import_firestore.where)("userId", "==", profileId)));
    return snap.docs[0] || null;
  },
  fetchListings: async (profileId) => (0, import_firestore.getDocs)((0, import_firestore.query)((0, import_firestore.collection)(import_firebase_config.db, "listings"), (0, import_firestore.where)("ownerProfileId", "==", profileId))),
  fetchListingMetrics: async (profileId) => (0, import_firestore.getDocs)((0, import_firestore.query)((0, import_firestore.collection)(import_firebase_config.db, "listingMetrics"), (0, import_firestore.where)("ownerProfileId", "==", profileId))),
  fetchReviews: async (profileId) => (0, import_firestore.getDocs)((0, import_firestore.query)((0, import_firestore.collection)(import_firebase_config.db, "reviews"), (0, import_firestore.where)("profileId", "==", profileId))),
  fetchSavedSearches: async (profileId) => import_saved_searches.savedSearchesService.list(profileId)
};
class ProfileStatsService {
  constructor(dataSource = defaultDataSource) {
    this.cache = /* @__PURE__ */ new Map();
    this.listeners = /* @__PURE__ */ new Map();
    this.CACHE_TTL = 5 * 60 * 1e3;
    this.dataSource = dataSource;
  }
  static getInstance() {
    if (!this.instance) this.instance = new ProfileStatsService(defaultDataSource);
    return this.instance;
  }
  // Allow tests or callers to swap data source (e.g. in-memory, pre-fetched)
  setDataSource(ds) {
    this.dataSource = ds;
    this.clearAllCache();
  }
  /**
   * Get comprehensive profile stats with intelligent caching
   * Falls back gracefully if individual metrics fail
   */
  async getStats(profileId, skipCache = false) {
    if (!skipCache) {
      const cached = this.getCached(profileId);
      if (cached) {
        import_logger_service.logger.debug("ProfileStats cache hit", { profileId });
        return cached;
      }
    }
    import_logger_service.logger.info("ProfileStats fetching fresh", { profileId });
    const startTime = Date.now();
    try {
      const [profileDoc, listingsSnap, metricsSnap, reviewsSnap, searchesSnap] = await Promise.all([
        this.dataSource.fetchProfile(profileId),
        this.dataSource.fetchListings(profileId),
        this.dataSource.fetchListingMetrics(profileId),
        this.dataSource.fetchReviews(profileId),
        this.dataSource.fetchSavedSearches(profileId)
      ]);
      const stats = this.aggregateStats(profileDoc, listingsSnap, metricsSnap, reviewsSnap, searchesSnap);
      this.setCached(profileId, stats);
      const duration = Date.now() - startTime;
      import_logger_service.logger.info("ProfileStats computed successfully", { profileId, duration });
      return stats;
    } catch (error) {
      import_logger_service.logger.error("ProfileStats fetch failed", error, { profileId });
      throw new Error(`Failed to load profile stats: ${error.message}`);
    }
  }
  /**
   * Setup real-time listener for live updates
   * Caller MUST cleanup via returned unsubscribe function
   */
  setupRealtime(profileId, callback) {
    this.cleanupListener(profileId);
    const unsubscribe = (0, import_firestore.onSnapshot)(
      (0, import_firestore.doc)(import_firebase_config.db, "profiles", profileId),
      async (snapshot) => {
        if (!snapshot.exists()) return;
        try {
          this.invalidateCache(profileId);
          const stats = await this.getStats(profileId, true);
          callback(stats);
        } catch (e) {
          import_logger_service.logger.warn("Realtime stats update failed", { error: e.message });
        }
      },
      (error) => {
        import_logger_service.logger.error("Realtime listener error", error);
      }
    );
    this.listeners.set(profileId, unsubscribe);
    return unsubscribe;
  }
  /**
   * Cleanup listener for profile
   */
  cleanupListener(profileId) {
    const unsubscribe = this.listeners.get(profileId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(profileId);
    }
  }
  /**
   * Invalidate cache entry
   */
  invalidateCache(profileId) {
    this.cache.delete(profileId);
  }
  /**
   * Clear all cache (useful for logout/switch user)
   */
  clearAllCache() {
    this.cache.clear();
  }
  // ========== Private Helper Methods ==========
  getCached(profileId) {
    const entry = this.cache.get(profileId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(profileId);
      return null;
    }
    return entry.data;
  }
  setCached(profileId, data) {
    this.cache.set(profileId, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.CACHE_TTL
    });
  }
  // Legacy private methods removed; dataSource handles retrieval.
  aggregateStats(profileDoc, listingsSnap, metricsSnap, reviewsSnap, searchesSnap) {
    const profile = profileDoc?.data() || {};
    const trustScore = profile.trustScore || 0;
    const badges = profile.badges || [];
    const verification = profile.verification || { phoneVerified: false, idVerified: false, businessVerified: false };
    const profileType = profile.type || "private";
    const createdAt = profile.createdAt?.toDate() || /* @__PURE__ */ new Date();
    const accountAge = Math.floor((Date.now() - createdAt.getTime()) / (1e3 * 60 * 60 * 24));
    let activeListings = 0;
    let soldListings = 0;
    listingsSnap.forEach((d) => {
      const status = d.data().status;
      if (status === "published") activeListings++;
      if (status === "sold") soldListings++;
    });
    const totalListings = listingsSnap.size;
    let views30d = 0, messages30d = 0, favorites30d = 0;
    metricsSnap.forEach((d) => {
      const m = d.data();
      views30d += m.views30d || 0;
      messages30d += m.messages30d || 0;
      favorites30d += m.favorites30d || 0;
    });
    const stats = profile.stats || {};
    const avgResponseMinutes = stats.avgResponseMinutes || 0;
    const responseRate = stats.responseRate || 0;
    let totalRating = 0;
    reviewsSnap.forEach((d) => {
      totalRating += d.data().rating || 0;
    });
    const reviewCount = reviewsSnap.size;
    const avgRating = reviewCount > 0 ? totalRating / reviewCount : 0;
    const conversionRate30d = views30d > 0 ? messages30d / views30d * 100 : 0;
    const savedSearchesCount = searchesSnap.length;
    return {
      trustScore,
      badges,
      verificationStatus: {
        phone: verification.phoneVerified || false,
        id: verification.idVerified || false,
        business: verification.businessVerified || false
      },
      activeListings,
      totalListings,
      soldListings,
      views30d,
      messages30d,
      favorites30d,
      avgResponseMinutes,
      responseRate,
      reviewCount,
      avgRating,
      conversionRate30d,
      savedSearchesCount,
      profileType,
      accountAge,
      lastUpdated: import_firestore.Timestamp.fromDate(/* @__PURE__ */ new Date())
    };
  }
}
const profileStatsService = ProfileStatsService.getInstance();
var profile_stats_service_default = profileStatsService;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  profileStatsService
});
