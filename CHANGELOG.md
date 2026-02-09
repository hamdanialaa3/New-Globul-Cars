# Changelog — Koli One

All notable changes to this project will be documented in this file.

## [Unreleased] — 2026-02-09 — Branch: fix/security-seo-cleanup

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
