# last_update_plan — Execution Status (Jan 6, 2026)

This file now reflects a truth-first status update, aligned with دستور المشروع (numeric routes, max ~300 lines per code file, no deletions, DRY, realistic data).

## Verified as Implemented
- Stripe payment failure auto-downgrade and listing deactivation: functions/src/stripe-webhooks.ts (handles customer.subscription.*, invoice.payment_failed with deactivateExcessListings + notifications).
- Scheduled + HTTP sitemap generation every 6h: functions/src/sitemap.ts (cached XML, city/brand/car/profile coverage).
- robots.txt present and scoped: public/robots.txt (sitemaps listed, admin/dev paths disallowed).
- Canonical tags on SEO landing pages: src/pages/seo/CityCarsPage.tsx and src/pages/seo/BrandCityPage.tsx include <link rel="canonical" />.
- Numeric car fallback UI exists: src/pages/01_main-pages/NumericCarDetailsPage.tsx renders an inline “Car Not Found” state when lookup fails (still room for richer UX below).

## Still Missing (must build)
1) Story ↔ Car lifecycle protection: no onDelete/onSold trigger to hide/delete linked stories.
2) AI messaging resilience: no Promise.race timeout + human handover or sentiment escalation.
3) Draft safety: no immediate save on critical fields or beforeunload hook in sell workflow.
4) Dedicated CarNotFoundPage with similar cars + route-level fallback (currently inline only).
5) Offline detection banner + queued saves for SellWorkflow.
6) Abandoned workflow analytics + daily detector + re-engagement email.
7) Archive stale listings (60+ days) with seller notifications.
8) Boost listing infrastructure (schema fields, Stripe flow, ranking boost).
9) GlassBottomNav keyboard overlap fix (auto-hide on keyboard open).
10) Dark-mode glass variants for legibility.
11) Standard useAsyncAction hook to unify loading/error UX.

## Next Actions (do in this order)
- Day 1: Implement car-lifecycle trigger; ship AI timeout + handover; add draft beforeunload + critical-field save.
- Day 2: Build CarNotFoundPage with suggestions; add offline banner; add useAsyncAction hook and start migrating hotspots.
- Day 3: Ship abandoned workflow tracking + daily detector; add archive-stale-listings scheduler + notifications.
- Day 4: Add boost listing fields + Stripe flow + search boost toggle (guarded behind feature flag).
- Day 5: GlassBottomNav keyboard detection + dark-mode glass tokens; regression pass on SellWorkflow autosave.

## Testing & Safeguards
- Keep all new code files ≤300 lines or split modules; preserve numeric routing (/car/{sellerId}/{carId}, /profile/{id}).
- Add unit/integration coverage for: stripe payment_failed downgrade, car delete trigger, AI timeout fallback, stale-listing scheduler.
- After changes: run npm run type-check, npm run test:ci, and verify sitemap scheduled deployment.

Status last updated: January 6, 2026 — pending items remain open until code lands.
