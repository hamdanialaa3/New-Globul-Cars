# Changelog — Koli One

All notable changes to this project will be documented in this file.

## [Unreleased] — 2026-02-09 — Branch: chore/cleanup-project

### Security (P0 — Critical)
- **Credentials**: Removed `dev_s_media/.env.production` from git tracking (contained Meta secrets)
- **Credentials**: Redacted 6 Google API keys from documentation files
- **Credentials**: Redacted Meta/Facebook secrets from mobile docs
- **Credentials**: Created root `.gitignore` covering secrets, credentials, backups, temp files
- **Credentials**: Created `dev_s_media/.gitignore` to prevent future `.env` commits
- **Credentials**: Created `INCIDENT.md` documenting all exposed keys requiring rotation
- **Firestore**: Restricted 3 anonymous write rules (`searchAnalytics`, `searchClicks`, `analytics_events`) — changed from `allow create: if true` to `allow create: if isAuthenticated()`
- **Firestore**: Removed duplicate weaker `web/configs/database.rules.json`
- **Firestore**: Removed stale `mobile_docs/firestore.rules` snapshot (198 lines vs 853-line production)

### Dependencies
- Removed unused packages: `three`, `socket.io-client`, `react-is`, `translate`
- Removed unused dev dependency: `@types/three`
- Moved test libraries to `devDependencies`: `@testing-library/dom`, `@testing-library/jest-dom`, `@testing-library/react`, `@testing-library/user-event`

### Dead Code Removal
- **Deleted `web/DDD/`** — 35 dead files including: 3D components (CarCarousel3D, MechanicalGear3D, DigitalTwin*), socket services, autonomous-resale services, n8n integration, IoT dashboards, and 11 `.backup`/`.bak`/`.old` files
- Removed `desktop.ini`, `type-errors-all.txt`, `server.log`, stale `web/configs/package-lock.json`

### Code Quality
- **Logger migration**: Replaced all `console.*` calls with `logger.*` across 16 source files (34 violations fixed). Uses `@/services/logger-service` with Sentry integration.
- Files migrated: GuestAccountAlert, IncompleteProfileAlert, BulkUploadModal, SmartAdSenseUnit, adService, useAdHooks, SmartHeroRecommendations, MarketplacePage, SearchResultsPage, AIValuationPage, AdvisorResults, ProfileBadges, usePromotionalOffer, https-config, azure-config, generate-sitemap

### Project Organization
- **Root directory**: Moved 33+ markdown files into categorized `documents/` subdirectories:
  - `documents/getting-started/` — onboarding & index files
  - `documents/summaries/` — executive summaries & reports
  - `documents/security/` — security guides & remediation docs
  - `documents/mobile/` — mobile development docs
  - `documents/phase1/` — phase 1 checklists & execution guides
  - `documents/features/` — feature implementation docs
  - `documents/operations/` — operational & architectural docs
  - `documents/archive/` — historical reference files
- **Scripts**: Moved shell scripts to `scripts/security/`, PowerShell scripts to `scripts/dev/`
- **Assets**: Moved 8 brand PNG files to `assets/branding/`

---

## [Previous] — 2026-02-09 — Branch: fix/security-seo-cleanup

### Security (P0 — Critical)
- **Firestore**: Locked `app_settings/*` — replaced `allow write: if true` with admin-only role check
- **Firestore**: Secured gamification collections (`leaderboard`, `achievements`, `badges`, `user_achievements`, `user_badges`) — write restricted to Cloud Functions only
- **Firestore**: Secured analytics collections (`profile_analytics`, `profile_metrics`, `userPoints`, `profile_stats`) — write restricted to owner only
- **Firestore**: Removed duplicate rule blocks for `searchAnalytics`, `searchClicks`, `achievements`, `profiles`
- **RTDB**: Added ownership validation to channels, messages, user_channels, typing, presence
- **Storage**: Secured `car-images/` with per-user ownership checks
- **Storage**: Secured `messages/` with authentication + metadata checks
- **Functions**: Removed `.env` with leaked API keys from repository tracking

### SEO (P1)
- **robots.txt**: Fixed domain from `mobilebg.eu` → `koli.one`
- **Localization**: Replaced `mobile.de` brand references in Bulgarian sell page with `Koli One`
- **SEO component**: Made `siteUrl` environment-driven via `VITE_SITE_URL`
- **SEO component**: Removed broken hreflang `/bg/` and `/en/` prefixed URLs

### Dependencies (P2)
- Removed `firebase-admin` from web dependencies (server-side only)
- Removed `react-scripts` from web dependencies (migrated to Vite)
- Moved `@types/*` packages from `dependencies` to `devDependencies`

### Code Quality
- Updated `copilot-instructions.md` to reflect Vite migration and Vitest usage
- Moved `.ts.backup` files from `src/` to `DDD/`
- Added feature-level `ErrorBoundary` wrappers for critical features
- Added skip-to-content accessibility link in App.tsx
- Created PR templates and verification scripts
- Fixed `tsconfig.json` types: replaced stale `jest`/`@jest/globals` with `vitest/globals`
- Added gzip + brotli compression plugins in `vite.config.ts`
