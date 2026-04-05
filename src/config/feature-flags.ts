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
  //
  // Rollout strategy (applies to every flag below):
  //  Step 1 → Deploy with flag OFF (code ships inactive)
  //  Step 2 → Enable for 10% of users; monitor 48 hours
  //  Step 3 → If error rate / p95 latency unchanged → 50%
  //  Step 4 → Monitor 24 hours → Enable 100%
  //  Step 5 → After 2 weeks of stability → remove legacy branch
  //
  // Recommended activation sequence (lowest → highest risk):
  //   1. ENABLE_OMNI_SCAN_AI        (UI-only, zero backend deps)
  //   2. ENABLE_EV_INFRASTRUCTURE   (read-only external data)
  //   3. ENABLE_DAC7_REPORTING      (backend-only, no user UI change)
  //   4. ENABLE_UPSTASH_CACHE       (transparent caching layer)
  //   5. ENABLE_OMNICHANNEL         (requires Viber/WhatsApp API keys)
  //   6. ENABLE_KOLI_CERTIFIED      (requires carVertical API key)
  //   7. ENABLE_GAMIFIED_B2B        (dealer-only surface, medium risk)
  //   8. ENABLE_AR_VR_SHOWROOM      (WebXR, device compatibility matrix)
  //   9. ENABLE_OPEN_BANKING        (external bank APIs, financial data)
  //  10. ENABLE_CROSS_BORDER_ESCROW (payments + legal compliance)
  // ==========================================

  /**
   * ENABLE_OMNI_SCAN_AI
   * Engine 8: Live camera VIN scanning + 15-second listing
   * VIN decode, auto-fill, stolen check, license plate recognition
   *
   * Risk: LOW — pure UI enhancement, no new backend APIs required
   * Dependencies:
   *   - expo-camera permission flow tested on iOS + Android
   *   - VIN decode service (src/services/vin-service.ts) deployed
   * Rollout order: #1 — enable first (safest engine)
   * Pre-rollout checklist:
   *   □ Camera permission UX reviewed on both platforms
   *   □ VIN decode fallback (manual entry) confirmed working
   *   □ Stolen-check error handling returns graceful UI
   * Monitor (48 h window):
   *   - Listing completion rate must stay ≥ baseline
   *   - No increase in camera permission denial reports
   * Status: PENDING ROLLOUT
   */
  ENABLE_OMNI_SCAN_AI: false,

  /**
   * ENABLE_EV_INFRASTRUCTURE
   * Engine 5: EV charging stations, battery SOH reports, route planning
   * Eldrive/Electromaps integration + 12 EV model specs
   *
   * Risk: LOW — read-only external data, no write paths modified
   * Dependencies:
   *   - Eldrive/Electromaps API key provisioned in Firebase Remote Config
   *   - EV model specs seeded in Firestore `ev_specs` collection
   * Rollout order: #2
   * Pre-rollout checklist:
   *   □ API key stored in Secret Manager (not in client bundle)
   *   □ Charging station map tile loads within 3 s on 4G
   *   □ SOH report shows graceful "unavailable" for non-EV listings
   * Monitor (48 h window):
   *   - No 429 rate-limit errors from Eldrive/Electromaps
   *   - EV listing page p95 load time ≤ 3 s
   * Status: PENDING ROLLOUT
   */
  ENABLE_EV_INFRASTRUCTURE: false,

  /**
   * ENABLE_DAC7_REPORTING
   * Phase 0: DAC7 EU tax reporting compliance
   * Seller threshold monitoring + annual report generation
   *
   * Risk: LOW — backend-only Cloud Function, no user-facing pages changed
   * Dependencies:
   *   - functions/src/dac7/ Cloud Function deployed and tested
   *   - Seller threshold config (€2,000 / 30 transactions) verified
   *   - Admin report download endpoint behind admin auth guard
   * Rollout order: #3 — no user impact, can enable at 100% immediately
   * Pre-rollout checklist:
   *   □ Function execution < 540 s for max dataset (stress test)
   *   □ Report PDF generation tested with mock data
   *   □ Legal review of report format completed
   * Monitor (48 h window):
   *   - Cloud Function error rate < 0.1%
   *   - No false-positive threshold alerts in admin panel
   * Status: PENDING ROLLOUT
   */
  ENABLE_DAC7_REPORTING: false,

  /**
   * ENABLE_UPSTASH_CACHE
   * Phase 0: Distributed Redis caching via Upstash
   * Reduces Firestore read costs by 80%+
   *
   * Risk: LOW — caching is transparent; stale-data TTL is 60 s by default
   * Dependencies:
   *   - Upstash Redis instance provisioned (EU-West region for GDPR)
   *   - UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in Secret Manager
   *   - Cache invalidation hooks wired in ListingService + SearchService
   * Rollout order: #4
   * Pre-rollout checklist:
   *   □ Cache hit rate target: ≥ 60% for search queries
   *   □ Cache invalidation tested on listing create/update/delete
   *   □ Fallback to Firestore confirmed when Redis times out
   * Monitor (48 h window):
   *   - Firestore read billing: expect ≥ 50% reduction
   *   - No stale listing data complaints (check support queue)
   *   - Upstash memory usage < 80% of plan limit
   * Status: PENDING ROLLOUT
   */
  ENABLE_UPSTASH_CACHE: false,

  /**
   * ENABLE_OMNICHANNEL
   * Engine 2: Viber/WhatsApp + omnichannel notification routing
   * 6-channel routing with user preferences and fallback chains
   *
   * Risk: LOW (notification delivery) / MEDIUM (user preference UI)
   * Dependencies:
   *   - Viber Bot API key + WhatsApp Business API token in Secret Manager
   *   - Notification preference page deployed (src/pages/notifications/)
   *   - Fallback chain: Viber → WhatsApp → Push → Email
   * Rollout order: #5 — requires external API keys before enabling
   * Pre-rollout checklist:
   *   □ Viber/WhatsApp sandbox tests pass (message delivery confirmed)
   *   □ Opt-out flow compliant with GDPR (unsubscribe link in every message)
   *   □ Rate limits configured (max 10 notifs/user/day)
   * Monitor (48 h window):
   *   - Notification delivery rate ≥ 95%
   *   - No spam reports from Viber/WhatsApp platforms
   *   - Opt-out rate < 2%
   * Status: PENDING ROLLOUT
   */
  ENABLE_OMNICHANNEL: false,

  /**
   * ENABLE_KOLI_CERTIFIED
   * Engine 1: Vehicle certification + history reports (carVertical)
   * 100-point inspection system with 4 certification levels
   *
   * Risk: MEDIUM — introduces external paid API calls and new data model
   * Dependencies:
   *   - carVertical API key provisioned; CARVETICAL_API_KEY in Secret Manager
   *   - `certified_vehicles` Firestore collection + security rules deployed
   *   - Stripe product created for certification upsell (if paid tier)
   * Rollout order: #6
   * Pre-rollout checklist:
   *   □ carVertical response cached in Firestore (avoid re-billing same VIN)
   *   □ 100-point checklist UI reviewed by QA on mobile + web
   *   □ API error returns graceful "report unavailable" without crashing
   *   □ Certification badge visible on listing cards + search results
   * Monitor (48 h window):
   *   - carVertical API error rate < 1%
   *   - Certification funnel conversion ≥ internal target
   *   - No duplicate billing events in Stripe dashboard
   * Status: PENDING ROLLOUT
   */
  ENABLE_KOLI_CERTIFIED: false,

  /**
   * ENABLE_GAMIFIED_B2B
   * Engine 7: Gamified dealer dashboard
   * XP/leveling, badges, demand heatmaps, velocity scoring, MRR analytics
   *
   * Risk: MEDIUM — affects dealer-only surfaces; no buyer-facing changes
   * Dependencies:
   *   - `dealer_stats` Firestore collection backfilled for existing dealers
   *   - XP calculation Cloud Function deployed (functions/src/gamification/)
   *   - Dealer role check in UI guards (isDealer flag on user profile)
   * Rollout order: #7 — dealer-only, safe to enable for B2B segment first
   * Pre-rollout checklist:
   *   □ XP calculation idempotent (re-runs don't double-award XP)
   *   □ Heatmap tiles load ≤ 2 s on dealer dashboard
   *   □ Badge display degrades gracefully if stats not yet backfilled
   * Monitor (48 h window):
   *   - Dealer session duration: expect +15% (engagement target)
   *   - No XP inflation bugs (cap at max level correctly enforced)
   *   - MRR analytics figures match billing system within 5%
   * Status: PENDING ROLLOUT
   */
  ENABLE_GAMIFIED_B2B: false,

  /**
   * ENABLE_AR_VR_SHOWROOM
   * Engine 6: AR/VR VIP Showroom
   * WebXR vehicle placement, 360° tours, interactive color changes
   *
   * Risk: MEDIUM-HIGH — WebXR API has limited browser + device support
   * Dependencies:
   *   - WebXR polyfill bundled and tested on iOS Safari + Chrome Android
   *   - 3D model assets (glTF) uploaded to Firebase Storage `/models/`
   *   - AR feature detection gate (checks navigator.xr before rendering)
   * Rollout order: #8 — enable only after device compatibility matrix verified
   * Pre-rollout checklist:
   *   □ Graceful fallback to 360° photo gallery when WebXR unavailable
   *   □ glTF model sizes ≤ 5 MB per vehicle (performance budget)
   *   □ AR session battery drain tested on mid-range devices
   *   □ 3D assets served via CDN with correct CORS headers
   * Monitor (48 h window):
   *   - AR session start rate (% of listing page visits)
   *   - No WebXR crash reports on Sentry
   *   - LCP on listing page ≤ 3 s (3D assets must not block FCP)
   * Status: PENDING ROLLOUT
   */
  ENABLE_AR_VR_SHOWROOM: false,

  /**
   * ENABLE_OPEN_BANKING
   * Engine 4: Instant credit scoring + financing pre-approval
   * DSK/TBI/Fibank/UniCredit loan offers in 15 seconds
   *
   * Risk: HIGH — processes financial PII; regulated under PSD2 + GDPR
   * Dependencies:
   *   - PSD2 Open Banking consent flow reviewed by legal team
   *   - Bank API credentials (DSK, TBI, Fibank, UniCredit) in Secret Manager
   *   - GDPR data processing agreement signed with each bank partner
   *   - Credit score data stored encrypted in Firestore with 30-day TTL
   * Rollout order: #9 — DO NOT enable before legal sign-off
   * Pre-rollout checklist:
   *   □ Legal review and DPO sign-off obtained
   *   □ Consent UI includes explicit opt-in (GDPR Art. 6)
   *   □ Credit data never logged in plaintext (audit Cloud Functions)
   *   □ 15-second timeout + graceful fallback if bank API is slow
   *   □ Penetration test passed for the open-banking endpoint
   * Monitor (48 h window):
   *   - Bank API p95 response time ≤ 10 s
   *   - Financing funnel completion rate ≥ internal target
   *   - Zero plaintext PII in Cloud Function logs (automated check)
   *   - No GDPR deletion requests unhandled in support queue
   * Status: PENDING ROLLOUT — awaiting legal sign-off
   */
  ENABLE_OPEN_BANKING: false,

  /**
   * ENABLE_CROSS_BORDER_ESCROW
   * Engine 3: 1-Click Import with escrow protection
   * Customs calculation, transport logistics, escrow payment holding
   *
   * Risk: HIGH — holds real funds in escrow; customs and legal compliance required
   * Dependencies:
   *   - Licensed payment institution or e-money license confirmed for escrow
   *   - Customs tariff tables seeded and versioned in Firestore
   *   - Transport partner APIs (logistics providers) integrated and tested
   *   - ENABLE_OPEN_BANKING enabled first (financing pre-approval for imports)
   *   - Legal review: Bulgarian customs law + EU import regulations
   * Rollout order: #10 — LAST; must be preceded by ENABLE_OPEN_BANKING
   * Pre-rollout checklist:
   *   □ Escrow fund segregation verified with payment provider
   *   □ Dispute resolution flow documented and tested end-to-end
   *   □ Customs calculation engine audited against official tariff rates
   *   □ Fraud detection rules (velocity checks, known-bad IBANs) active
   *   □ Full legal compliance review completed for all target markets
   * Monitor (72 h window — extended due to transaction risk):
   *   - Escrow transaction success rate ≥ 99%
   *   - Average hold time ≤ 72 hours (transport SLA met)
   *   - Dispute rate < 0.5% of transactions
   *   - Zero funds stuck in unresolved escrow state
   * Status: PENDING ROLLOUT — awaiting legal + payment provider sign-off
   */
  ENABLE_CROSS_BORDER_ESCROW: false,
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

/**
 * Recommended activation sequence for V2 Growth Engines.
 * Enable flags in this order. Each step requires the previous to be stable
 * for ≥ 48 hours (72 hours for ENABLE_CROSS_BORDER_ESCROW).
 *
 * Do NOT skip steps — later engines may depend on earlier ones.
 */
export const V2_ROLLOUT_ORDER: ReadonlyArray<keyof typeof FEATURE_FLAGS> = [
  'ENABLE_OMNI_SCAN_AI', // Step 1 — UI only, zero backend deps
  'ENABLE_EV_INFRASTRUCTURE', // Step 2 — read-only external data
  'ENABLE_DAC7_REPORTING', // Step 3 — backend Cloud Function, no user UI
  'ENABLE_UPSTASH_CACHE', // Step 4 — transparent caching layer
  'ENABLE_OMNICHANNEL', // Step 5 — requires Viber/WhatsApp API keys
  'ENABLE_KOLI_CERTIFIED', // Step 6 — requires carVertical API key
  'ENABLE_GAMIFIED_B2B', // Step 7 — dealer-only surface
  'ENABLE_AR_VR_SHOWROOM', // Step 8 — WebXR, device compat matrix needed
  'ENABLE_OPEN_BANKING', // Step 9 — PSD2/GDPR legal sign-off required
  'ENABLE_CROSS_BORDER_ESCROW', // Step 10 — payments + legal compliance (last)
] as const;
