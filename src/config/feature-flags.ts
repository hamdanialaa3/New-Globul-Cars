// src/config/feature-flags.ts
/**
 * Feature Flags System for Safe Refactoring
 *
 * Purpose: Enable gradual rollout of architectural changes with instant rollback capability
 *
 * Usage:
 * - Set flag to `true` to enable new feature
 * - Set flag to `false` to use legacy code
 * - Deploy with flags OFF, then gradually enable in production
 *
 * Strategy:
 * 1. Deploy code with flags OFF (inactive)
 * 2. Enable for 10% of users
 * 3. Monitor for 48 hours
 * 4. If stable → Enable for 100%
 * 5. After 2 weeks of stability → Remove legacy code
 */

export const FEATURE_FLAGS = {
  // ==========================================
  // Week 1: Quick Wins
  // ==========================================

  /**
   * USE_UNIFIED_AUTH_GUARD
   *
   * Consolidates 3 separate guard components into one:
   * - ProtectedRoute → AuthGuard
   * - AdminRoute → AuthGuard
   * - AuthGuard (old) → AuthGuard (new)
   *
   * Benefits:
   * - Single source of truth for auth logic
   * - Consistent API across the app
   * - Easier to maintain and test
   *
   * Rollout: Week 1, Day 1-2
   * ✅ STATUS: ACTIVE (Nov 26, 2025)
   */
  USE_UNIFIED_AUTH_GUARD: true,

  /**
   * USE_CLEAN_NAMING
   *
   * Removes temporary suffixes from component names:
   * - VehicleDataPageUnified → VehicleDataPage
   * - ImagesPageUnified → ImagesPage
   * - UnifiedContactPage → ContactPage
   * - UnifiedEquipmentPage → EquipmentPage
   *
   * Benefits:
   * - Professional naming convention
   * - Clearer codebase
   * - Better developer experience
   *
   * Rollout: Week 1, Day 3
   * ⏳ STATUS: PENDING (Future)
   */
  USE_CLEAN_NAMING: false,

  /**
   * USE_EXTRACTED_PROVIDERS
   *
   * Extracts provider stack from App.tsx into AppProviders.tsx
   *
   * Benefits:
   * - App.tsx reduced from 909 → ~50 lines
   * - Provider order documented and protected
   * - Easier to test provider hierarchy
   *
   * Rollout: Week 1, Day 4
   * ✅ STATUS: ACTIVE (Nov 26, 2025)
   */
  USE_EXTRACTED_PROVIDERS: true,

  // ==========================================
  // Week 2: Route Extraction
  // ==========================================

  /**
   * USE_EXTRACTED_ROUTES
   *
   * Master flag for all route extraction features
   * If false, all route-specific flags below are ignored
   *
   * Rollout: Week 2, Day 1-5
   * ✅ STATUS: ACTIVE (Nov 26, 2025)
   */
  USE_EXTRACTED_ROUTES: true,

  /**
   * USE_AUTH_ROUTES
   *
   * Extracts authentication routes into auth.routes.tsx
   * Includes: Login, Register, Verification, OAuth Callback
   *
   * Rollout: Week 2, Day 1-2
   * ✅ STATUS: ACTIVE (Nov 26, 2025)
   */
  USE_AUTH_ROUTES: true,

  /**
   * USE_SELL_ROUTES
   *
   * Extracts sell workflow routes into sell.routes.tsx
   * Includes: ~25 routes for vehicle selling process
   *
   * Rollout: Week 2, Day 3
   * ✅ STATUS: ACTIVE (Nov 26, 2025)
   */
  USE_SELL_ROUTES: true,

  /**
   * USE_ADMIN_ROUTES
   *
   * Extracts admin routes into admin.routes.tsx
   * Includes: Admin dashboard, Super admin, Management
   *
   * Rollout: Week 2, Day 4
   * ✅ STATUS: ACTIVE (Nov 26, 2025)
   */
  USE_ADMIN_ROUTES: true,

  /**
   * USE_MAIN_ROUTES
   *
   * Extracts main application routes into main.routes.tsx
   * Includes: Home, Cars, Profile, Messages, etc.
   *
   * Rollout: Week 2, Day 5
   * ✅ STATUS: ACTIVE (Nov 26, 2025)
   */
  USE_MAIN_ROUTES: true,

  /**
   * USE_DEALER_ROUTES
   *
   * Extracts dealer routes into dealer.routes.tsx
   * Includes: Dealer pages, Dashboard, Registration
   *
   * Rollout: Week 2, Day 5
   * ✅ STATUS: ACTIVE (Nov 26, 2025)
   */
  USE_DEALER_ROUTES: true,

  // ==========================================
  // Week 3: React Router Outlets
  // ==========================================

  /**
   * USE_ROUTER_OUTLET_LAYOUTS
   *
   * Replaces wrapper-based layouts with React Router Outlet pattern
   *
   * Benefits:
   * - Follows React Router best practices
   * - Better performance (fewer re-renders)
   * - Cleaner code structure
   *
   * Rollout: Week 3, Day 1-5
   */
  USE_ROUTER_OUTLET_LAYOUTS: false,

  // ==========================================
  // Future Features (NOT RECOMMENDED YET)
  // ==========================================

  /**
   * USE_DOMAIN_FOLDERS
   *
   * Restructures folders from numbered (01_, 02_) to domain-based
   *
   * ⚠️ WARNING: High risk of Git merge conflicts
   * ⚠️ Requires updating 200+ import statements
   * ⚠️ NOT RECOMMENDED - Current structure works well
   *
   * Status: CANCELLED
   */
  USE_DOMAIN_FOLDERS: false,

  // ==========================================
  // V.2.0 Growth Engines
  // ==========================================

  /**
   * ENABLE_KOLI_CERTIFIED
   * Engine 1: Vehicle certification + history reports (carVertical)
   * 100-point inspection system with 4 certification levels
   * Status: PENDING ROLLOUT
   */
  ENABLE_KOLI_CERTIFIED: false,

  /**
   * ENABLE_OMNICHANNEL
   * Engine 2: Viber/WhatsApp + omnichannel notification routing
   * 6-channel routing with user preferences and fallback chains
   * Status: PENDING ROLLOUT
   */
  ENABLE_OMNICHANNEL: false,

  /**
   * ENABLE_CROSS_BORDER_ESCROW
   * Engine 3: 1-Click Import with escrow protection
   * Customs calculation, transport logistics, escrow payment holding
   * Status: PENDING ROLLOUT
   */
  ENABLE_CROSS_BORDER_ESCROW: false,

  /**
   * ENABLE_OPEN_BANKING
   * Engine 4: Instant credit scoring + financing pre-approval
   * DSK/TBI/Fibank/UniCredit loan offers in 15 seconds
   * Status: PENDING ROLLOUT
   */
  ENABLE_OPEN_BANKING: false,

  /**
   * ENABLE_EV_INFRASTRUCTURE
   * Engine 5: EV charging stations, battery SOH reports, route planning
   * Eldrive/Electromaps integration + 12 EV model specs
   * Status: PENDING ROLLOUT
   */
  ENABLE_EV_INFRASTRUCTURE: false,

  /**
   * ENABLE_GAMIFIED_B2B
   * Engine 7: Gamified dealer dashboard
   * XP/leveling, badges, demand heatmaps, velocity scoring, MRR analytics
   * Status: PENDING ROLLOUT
   */
  ENABLE_GAMIFIED_B2B: false,

  /**
   * ENABLE_OMNI_SCAN_AI
   * Engine 8: Live camera VIN scanning + 15-second listing
   * VIN decode, auto-fill, stolen check, license plate recognition
   * Status: PENDING ROLLOUT
   */
  ENABLE_OMNI_SCAN_AI: false,

  /**
   * ENABLE_AR_VR_SHOWROOM
   * Engine 6: AR/VR VIP Showroom
   * WebXR vehicle placement, 360° tours, interactive color changes
   * Status: PENDING ROLLOUT
   */
  ENABLE_AR_VR_SHOWROOM: false,

  /**
   * ENABLE_DAC7_REPORTING
   * Phase 0: DAC7 EU tax reporting compliance
   * Seller threshold monitoring + annual report generation
   * Status: PENDING ROLLOUT
   */
  ENABLE_DAC7_REPORTING: false,

  /**
   * ENABLE_UPSTASH_CACHE
   * Phase 0: Distributed Redis caching via Upstash
   * Reduces Firestore read costs by 80%+
   * Status: PENDING ROLLOUT
   */
  ENABLE_UPSTASH_CACHE: false,
} as const;

/**
 * Type-safe feature flag checker
 *
 * @param flag - Feature flag name
 * @returns boolean - Whether the feature is enabled
 *
 * @example
 * if (isFeatureEnabled('USE_UNIFIED_AUTH_GUARD')) {
 *   return <NewAuthGuard />;
 * }
 * return <LegacyAuthGuard />;
 */
export const isFeatureEnabled = (flag: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[flag];
};

/**
 * Get all enabled features
 * Useful for debugging and monitoring
 *
 * @returns Array of enabled feature names
 */
export const getEnabledFeatures = (): string[] => {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => enabled)
    .map(([name]) => name);
};

/**
 * Feature flag metadata for monitoring
 */
export const FEATURE_FLAG_METADATA = {
  USE_UNIFIED_AUTH_GUARD: {
    week: 1,
    day: '1-2',
    risk: 'low',
    impact: 'medium',
  },
  USE_CLEAN_NAMING: {
    week: 1,
    day: '3',
    risk: 'low',
    impact: 'low',
  },
  USE_EXTRACTED_PROVIDERS: {
    week: 1,
    day: '4',
    risk: 'medium',
    impact: 'high',
  },
  USE_EXTRACTED_ROUTES: {
    week: 2,
    day: '1-5',
    risk: 'medium',
    impact: 'high',
  },
  USE_AUTH_ROUTES: {
    week: 2,
    day: '1-2',
    risk: 'low',
    impact: 'medium',
  },
  USE_SELL_ROUTES: {
    week: 2,
    day: '3-4',
    risk: 'medium',
    impact: 'high',
  },
  USE_ADMIN_ROUTES: {
    week: 2,
    day: '3-4',
    risk: 'low',
    impact: 'medium',
  },
  USE_MAIN_ROUTES: {
    week: 2,
    day: '5',
    risk: 'medium',
    impact: 'high',
  },
  USE_DEALER_ROUTES: {
    week: 2,
    day: '5',
    risk: 'low',
    impact: 'medium',
  },
  USE_ROUTER_OUTLET_LAYOUTS: {
    week: 3,
    day: '1-5',
    risk: 'medium',
    impact: 'high',
  },
  USE_DOMAIN_FOLDERS: {
    week: null,
    day: null,
    risk: 'very-high',
    impact: 'very-high',
  },
  // V.2.0 Growth Engines
  ENABLE_KOLI_CERTIFIED: {
    phase: 'v2.0-engine-1',
    risk: 'medium',
    impact: 'very-high',
    description: 'Vehicle certification + history reports',
  },
  ENABLE_OMNICHANNEL: {
    phase: 'v2.0-engine-2',
    risk: 'low',
    impact: 'high',
    description: 'Viber/WhatsApp + omnichannel routing',
  },
  ENABLE_CROSS_BORDER_ESCROW: {
    phase: 'v2.0-engine-3',
    risk: 'high',
    impact: 'very-high',
    description: 'Cross-border 1-Click Import with escrow',
  },
  ENABLE_OPEN_BANKING: {
    phase: 'v2.0-engine-4',
    risk: 'high',
    impact: 'very-high',
    description: 'Credit scoring + bank financing pre-approval',
  },
  ENABLE_EV_INFRASTRUCTURE: {
    phase: 'v2.0-engine-5',
    risk: 'low',
    impact: 'high',
    description: 'EV charging + battery SOH analysis',
  },
  ENABLE_GAMIFIED_B2B: {
    phase: 'v2.0-engine-7',
    risk: 'medium',
    impact: 'high',
    description: 'Gamified dealer dashboard + XP system',
  },
  ENABLE_OMNI_SCAN_AI: {
    phase: 'v2.0-engine-8',
    risk: 'medium',
    impact: 'very-high',
    description: 'VIN scanning + 15-second listing creation',
  },
  ENABLE_DAC7_REPORTING: {
    phase: 'v2.0-phase-0',
    risk: 'low',
    impact: 'medium',
    description: 'EU DAC7 tax reporting compliance',
  },
  ENABLE_UPSTASH_CACHE: {
    phase: 'v2.0-phase-0',
    risk: 'low',
    impact: 'high',
    description: 'Distributed Redis caching layer',
  },
} as const;

export default FEATURE_FLAGS;
