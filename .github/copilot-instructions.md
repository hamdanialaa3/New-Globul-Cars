# Copilot Instructions: Bulgarian Car Marketplace (Bulgarski Mobili)

**Updated:** January 6, 2026 | **Project Size:** 772 React components, 161 services, 6 Firestore collections, 180K+ LOC

## Stack & Runtime

- **Frontend**: React 18 + TypeScript (strict) + Styled-Components; **Build**: CRACO (Webpack with custom config).
- **Backend**: Firebase (Auth/Firestore/Functions/Storage/FCM/Hosting); Node >=18 (Functions use Node 20).
- **Search**: Algolia (hybrid with Firestore); **Payments**: Stripe; **Maps**: Google Maps; **Verification**: hCaptcha.

## Architecture Overview

### Data Distribution

- **Multi-collection pattern**: Cars stored across separate Firestore collections by type (`passenger_cars`, `suvs`, `vans`, `motorcycles`, `trucks`, `buses`).
  - Always resolve collection name via `SellWorkflowCollections.getCollectionNameForVehicleType(vehicleType)` — never hardcode collection names.
  - Unified query orchestration in `UnifiedSearchService` + `firestoreQueryBuilder` + `queryOrchestrator`.

### Numeric ID System (Critical Contract)

- **All public URLs must use numeric IDs only** — never expose UUIDs or Firebase UIDs.
- **User IDs**: `numericId` field on `users` collection, managed by `numeric-id-counter` in `counters` collection.
- **Car IDs**: Double key system (`sellerNumericId`, `carNumericId`) — generated during creation, stored on car documents.
- **URL patterns**:
  - Profile: `/profile/:numericId` (e.g., `/profile/18`)
  - Car details: `/car/:sellerNumericId/:carNumericId` (e.g., `/car/1/5`)
  - Edit car: `/car/:sellerNumericId/:carNumericId/edit`
  - Messaging: `/messages/:senderId/:recipientId`
- **Implementation**: [UnifiedCarService.createCarListing()](src/services/UnifiedCarService.ts) handles ID assignment and plan enforcement; [numeric-car-system.service.ts](src/services/numeric-car-system.service.ts) + [numeric-id-assignment.service.ts](src/services/numeric-id-assignment.service.ts) manage counters.
- **Reference**: [docs/STRICT_NUMERIC_ID_SYSTEM.md](docs/STRICT_NUMERIC_ID_SYSTEM.md), [PROJECT_CONSTITUTION.md](PROJECT_CONSTITUTION.md)

## Core Services (Use, Don't Duplicate)

- **Car operations**: `UnifiedCarService` for create/update/delete (enforces numeric IDs + plan limits).
- **Search**: `UnifiedSearchService` orchestrates Firestore + Algolia queries across collections.
- **Listings**: `sell-workflow-service.ts` manages sell flow state and returns numeric URLs.
- **Profiles**: `bulgarian-profile-service.ts` resolves user data + enforces plan tier limits.
- **Numeric IDs**: `numeric-car-system.service.ts` + `numeric-id-assignment.service.ts` handle counter increments.
- **Messaging**: `AdvancedMessagingService` orchestrates conversations, offers, and file uploads; see [MESSAGING_SYSTEM_FINAL.md](MESSAGING_SYSTEM_FINAL.md).
- **AI Services**: Coordinated via `aiRouterService` (smart provider selection between Gemini, DeepSeek, OpenAI):
  - `vehicleDescriptionGenerator` — AI-powered car descriptions with template fallback.
  - `geminiVisionService` — image analysis and quality scoring.
  - `aiQuotaService` — quota management and cost tracking.
  - Import from [src/services/ai/index.ts](src/services/ai/index.ts) barrel; never duplicate AI logic.
- **Logging**: `logger-service.ts` (replaces console; enforced by `scripts/ban-console.js`).
- **Errors**: `error-handling-service.ts` captures and logs exceptions.

## User Profiles & Plan System

- **Types**: [src/types/user/bulgarian-user.types.ts](src/types/user/bulgarian-user.types.ts) — canonical source (don't create alternatives).
- **Plans**: `free` (3 listings) | `dealer` (10) | `company` (unlimited); stored as `planTier` field on `users`.
- **Limits enforcement**: [src/utils/listing-limits.ts](src/utils/listing-limits.ts) — use `canAddListing(userId)` before car creation.
- **Context**: `ProfileTypeContext` manages profile type (`private` | `dealer` | `company`) + permissions.

## State Management & Contexts

- **Context barrel**: [src/contexts/index.ts](src/contexts/index.ts) — import from barrel, not individual files.
  - Available: `AuthContext`, `ProfileTypeContext`, `LanguageContext`, `ThemeContext`, `LoadingContext`, `FilterContext`.
- **No Redux** — use React Context + hooks exclusively.
- **Loading states**: Use `LoadingContext` or `LightweightLoadingOverlay` component for consistency.

## Routing & Code Splitting

- **Route files**: All route definitions in `src/routes/` (extracted from `App.tsx` for clarity).
  - ✅ Completed: `auth.routes.tsx` (4 routes), `admin.routes.tsx` (5 routes).
  - ⏳ Pending: `sell.routes.tsx`, `dealer.routes.tsx`, `main.routes.tsx` — ongoing extraction.
  - Don't add routes to `AppRoutes.tsx` directly; create modular route files in `src/routes/`.
  - See [src/routes/README.md](src/routes/README.md) for structure and extraction status.
- **Lazy loading**: Use `safeLazy()` from [src/utils/lazyImport.ts](src/utils/lazyImport.ts) to wrap page imports.
  - Prevents "Unexpected token <" runtime errors from webpack code-splitting.
- **Dynamic imports**: Follow `safeLazy` pattern for all page-level components.

## Imports & Path Aliases

- **Use path aliases**: `@/services/...`, `@/pages/...`, `@/components/...`, etc. (configured in `tsconfig.json`, `craco.config.js`, `jest.config.js`).
- **Keep in sync**: When adding new aliases, update all three config files.
- **Monorepo hints**: `@globul-cars/core`, `@globul-cars/services` aliases exist in configs (future monorepo structure).
- **Import order**: Relative imports last; third-party + aliases first for clarity.
- **Module resolution**: CRACO removes CRA's `ModuleScopePlugin` to allow imports outside `src/` when needed.

## Search & Algolia Integration

- **Config files**:
  - [algolia-index-config.json](algolia-index-config.json) — index settings + searchable attributes.
  - [algolia-record-template.json](algolia-record-template.json) — record structure template.
- **Sync command**: `npm run sync-algolia` or `SYNC_ALGOLIA_NOW.bat` when config changes.
- **Array fields**: Pass arrays (not comma-separated strings) for `searchableAttributes`, `attributesToSnippet`, etc.
- **Firestore-Algolia hybrid**: Use `UnifiedSearchService` to query both; falls back gracefully if Algolia unavailable.

## Real-time Messaging & Offers

- **Entry point**: `/messages/:numericId1/:numericId2` (numeric ID resolution for user privacy).
- **Service**: `AdvancedMessagingService` handles sends, reads, offers, file uploads, and soft deletes.
- **Orchestrator**: `MessagingOrchestrator` (facade) coordinates `MessageSender`, `ConversationLoader`, `ActionHandler`, `StatusManager`, `SearchManager`.
- **Features**: Inbox view, offer workflow, file validation, message search, archive per-user, mark as read.
- **Firestore collections**: `conversations` (single doc per pair) + `messages` (all exchanges); offers stored in `messages.offers[]`.
- **Key methods**:
  - `sendMessage(conversationId, text, senderId, attachments)` — validates files, uploads to Storage, appends to messages.
  - `sendOfferMessage(conversationId, carId, price)` — integrates with `OfferWorkflowService`.
  - `markMessagesAsRead(conversationId, userId)` — sets read status and notification state.
- **Real-time**: Uses Firestore `onSnapshot()` listeners with `isActive` flag cleanup (see Firestore Patterns below).

## Logging (Critical Rule)

- **Ban**: `console.log()`, `console.error()`, `console.warn()` in `src/` (enforced by `scripts/ban-console.js` during prebuild).
- **Use**: Import `logger` from [src/services/logger-service.ts](src/services/logger-service.ts).
  - `logger.debug(msg, context)`, `logger.info(msg, context)`, `logger.warn(msg, context)`, `logger.error(msg, error, context)`.
- **Only exception**: `logger-service.ts` itself may touch `console`.

## Firestore Patterns (Critical)

- **Listeners cleanup**: Always use the `isActive` flag pattern to prevent memory leaks and race conditions:
  ```typescript
  let isActive = true;
  const unsubscribe = onSnapshot(ref, snap => {
    if (!isActive) return; // Prevent state updates after unmount
    // ... process snapshot
  });
  return () => {
    isActive = false;
    try {
      unsubscribe();
    } catch (e) {
      logger.warn('cleanup error', e);
    }
  };
  ```
  **Why**: Components unmount but async updates continue → `setState on unmounted component` error. The `isActive` flag gates all state updates.
- **Avoid duplicate listeners** on same document; consolidate subscriptions.
- **Collection references**: Use `SellWorkflowCollections.getCollectionNameForVehicleType(vehicleType)` to resolve car collection names dynamically — never hardcode.

## Testing

- **Framework**: Jest + React Testing Library (RTL).
- **Commands**: `npm test` (watch) | `npm run test:ci` (CI mode with coverage).
- **File patterns**: `src/**/__tests__/**/*.test.{ts,tsx}`, `src/**/*.test.{ts,tsx}`, `src/**/*.spec.{ts,tsx}`.
- **Mocks**: [src/**mocks**/firebase/firebase-config.ts](src/__mocks__/firebase/firebase-config.ts) — d3 also mocked globally.
- **Run specific test**: `npm test -- --testPathPattern=filename --watchAll=false`.

## Build & Development

- **Dev server**: `npm start` (CRACO on port 3000, auto-open).
  - Alternative: `npm run start:dev` (4GB memory, no auto-open).
  - **CRACO config**: Custom webpack setup in [craco.config.js](craco.config.js) — handles path aliases, cache busting, ModuleScopePlugin removal for monorepo support.
- **Type checking**: `npm run type-check` (before committing).
- **Production build**: `npm run build` (runs `prebuild` ban-console check first).
  - `npm run build:analyze` — shows bundle size breakdown.
  - `npm run build:optimized` — builds + optimizes images with `node scripts/optimize-images.js`.
- **Algolia sync**: `npm run sync-algolia` or `SYNC_ALGOLIA_NOW.bat` — updates index config and record templates.
- **Local Firebase**: `npm run emulate` — starts Firebase emulators for local testing.
- **AI knowledge base**: `npm run train-ai` — regenerates [data/project-knowledge.json](data/project-knowledge.json) from codebase.
- **Cache issues**: `npm run clean:3000` (port) | `npm run clean:cache` | `npm run clean:all`.
  - Helper scripts: `scripts/clear-dev-caches.ps1` (PowerShell), batch files in root.

## Deployment

- **Hosting**: `npm run deploy` (both) | `npm run deploy:hosting` (frontend only).
- **Functions**: `npm run deploy:functions` (backend only) or `DEPLOY_FUNCTIONS.bat`; code in [functions/src](functions/src).
- **Windows helpers**: Root directory contains `.bat` (batch) and `.ps1` (PowerShell) scripts for common tasks.
  - `START_SERVER_CLEAN.ps1` — cleans cache and starts dev server.
  - `SYNC_ALGOLIA_NOW.bat` — quick Algolia sync.
  - `CLEAN_PORT_3000.bat` — kills process on port 3000.
- **Pre-deploy checklist**:
  1. Run `npm run type-check` (no TS errors).
  2. Run `npm run check-security` (verify env vars are not exposed).
  3. Ensure `.env.local` is in `.gitignore` (never committed).
  4. Test locally: `firebase emulators:start`.
- **Node version**: Functions require Node 20 (enforce via `firebase.json`).
- **CORS & Auth**: Firestore Rules + Functions enforce request origin + UID checks.

## Performance Optimization

- **Images**: Convert to WebP format; use `browser-image-compression` for client uploads.
- **Heavy lists**: Apply `useCallback` + `useMemo` to list item components (e.g., `ConversationsList`).
- **Loading states**: Always use `LoadingContext` or `LightweightLoadingOverlay` — never block UI with synchronous ops.
- **Bundle analysis**: Run `npm run build:analyze` after major changes to catch regressions.

## Localization (i18n)

- **Languages**: Bulgarian (`bg`) and English (`en`).
- **Hook**: `useLanguage()` from context — all UI text must be dynamically resolved.
- **Files**: [src/locales/bg](src/locales/bg) and [src/locales/en](src/locales/en) — must be updated in sync.
- **Key namespaces**: `common`, `auth`, `advancedSearch`, `carDetails`, `profile`, etc.
- **Never hardcode strings** — always use namespace keys.

## Bulgarian Market Defaults

- **Currency**: EUR (enforced in profile types).
- **Phone prefix**: `+359` (Bulgaria country code).
- **Cities**: Load from [src/services/bulgaria-locations.service.ts](src/services/bulgaria-locations.service.ts).
- **Validation**: Comply with EGN (Личен номер) + EIK (ЕИК/ПИК) validation services.

## Payments (Stripe Integration)

- **Checkout sessions**: Live under `customers/{uid}/checkout_sessions` collection.
- **Security**: Firestore Rules enforce that only the authenticated user can read/write their own checkout sessions.
- **Webhook handling**: `functions/src/notifications/` listens for Stripe events.

## Critical Docs to Reference

- [PROJECT_CONSTITUTION.md](PROJECT_CONSTITUTION.md) — immutable architectural rules (Arabic + English).
- [docs/STRICT_NUMERIC_ID_SYSTEM.md](docs/STRICT_NUMERIC_ID_SYSTEM.md) — numeric ID strategy detail.
- [MESSAGING_SYSTEM_FINAL.md](MESSAGING_SYSTEM_FINAL.md) — messaging architecture, offers, file uploads, search.
- [SECURITY.md](SECURITY.md) — Firestore Rules, Cloud Functions auth, API security, key rotation.
- [PROJECT_COMPLETE_INVENTORY.md](PROJECT_COMPLETE_INVENTORY.md) — full file/service inventory.
- [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) — navigation hub for all docs.
- [data/project-knowledge.json](data/project-knowledge.json) — AI training data (regenerate with `npm run train-ai`).

## Quick Debugging

- **Port 3000 stuck**: `npm run clean:3000` or `CLEAN_PORT_3000.bat`.
- **Webpack/CRACO cache**: Delete `node_modules/.cache`, `.cache`, and restart dev server.
- **Firestore listener errors**: Missing `isActive` flag in cleanup — causes "setState on unmounted component". Check patterns in Firestore Patterns section above.
- **Numeric ID not assigned**: Verify `UnifiedCarService.createCarListing()` called + `counters/{uid}/cars` document exists.
- **Algolia not syncing**: Run `npm run sync-algolia` manually; check `algolia-index-config.json` format (use arrays, not comma-separated strings).
- **Console errors during build**: Check `scripts/ban-console.js` — may have caught illegal `console.log` usage.
- **Type errors from path aliases**: Ensure aliases match across `tsconfig.json`, `craco.config.js`, and `jest.config.js`.
- **env vars missing**: See `functions/.env` template (not committed); ask team lead for production keys.
- **Test failures**: Check `src/__mocks__/firebase/firebase-config.ts` — Firebase must be mocked for Jest.
