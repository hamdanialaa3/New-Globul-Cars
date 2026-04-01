# Koli One – Copilot Instructions (Repo Root)

> **📖 Complete Project Knowledge**: For full understanding of every service, hook, page, integration, and workflow, read [`CODEBASE.md`](../CODEBASE.md) at repo root. It is the single source of truth for AI assistants.

## Big picture

- Web app (React + Firebase marketplace): source lives directly under `src/`. No `web/` subdirectory exists.
- Mobile app (Expo Router): lives under `mobile_new/`; providers wired in `mobile_new/app/_layout.tsx`.

## Non‑negotiable web rules

- Privacy URLs use numeric IDs only; never expose Firebase UIDs in routes. See `src/services/numeric-id-*.ts` and `src/utils/constitution-audit.ts`.
- Vehicle data is split across 6 collections; always resolve via `src/services/sell-workflow-collections.ts`.
- No console.\* in `src/`; build blocks it via `scripts/ban-console.js`. Use `src/services/logger-service.ts` instead.
- Firestore listeners must use the `isActive` guard to avoid state updates after unmount.
- Do not delete files; move to `DDD/` instead.

## Key flows & integrations

- Search is hybrid Firestore + Algolia (`src/services/search/`).
- Messaging uses Realtime Database v2 (`src/hooks/messaging/useRealtimeMessaging`, `src/services/messaging/realtime/`).
- Payments are manual bank transfers; config in `src/config/bank-details.ts`.

## Mobile app conventions

- Routing lives in `mobile_new/app`; tabs layout in `mobile_new/app/(tabs)/_layout.tsx`.
- Root providers and navigation logic live in `mobile_new/app/_layout.tsx`.
- Use styled-components/native theme from `mobile_new/src/styles/theme`.

## Developer workflows (run from repo root)

- Dev server: `npm start` or `npm run start:dev`
- Quality gates: `npm run type-check`, `npm test`, `npm run build`
- Firebase emulators: `npm run emulate`
- Mobile dev server: `cd mobile_new && npm start`

## Imports & structure

- Web uses path aliases (`@/...`) configured in `tsconfig.json`; avoid deep relative paths.
- Tests live in `__tests__` folders; provider wrappers required (ThemeProvider + LanguageProvider). See `docs/testing/README.md`.

## Where to look first

- **Complete project knowledge (read first)**: `CODEBASE.md`
- Architecture rules: `CONSTITUTION.md`, `.cursorrules`
- Getting started: `docs/getting-started/README.md`
- AI context maintenance: `docs/AI_CONTEXT_GUIDE.md`
