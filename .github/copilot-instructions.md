# Koli One – Copilot Instructions (Repo Root)

## Big picture
- Two active apps: web/ (React + Firebase marketplace) and mobile_new/ (Expo Router mobile app).
- Web app is service‑first: domain logic lives in web/src/services, UI in web/src/components, routes in web/src/routes.
- Mobile app uses Expo Router in mobile_new/app with tabs and auth flows; providers are wired in mobile_new/app/_layout.tsx.

## Non‑negotiable web rules (from existing guidance)
- Privacy URLs use numeric IDs only; never expose Firebase UIDs in routes. See web/src/services/numeric-id-*.ts and web/src/utils/constitution-audit.ts.
- Vehicle data is split across 6 collections; always resolve via web/src/services/sell-workflow-collections.ts.
- No console.* in web/src; build blocks it via web/scripts/ban-console.js. Use web/src/services/logger-service.ts instead.
- Firestore listeners must use the isActive guard to avoid state updates after unmount (see pattern in web/.github/copilot-instructions.md).
- Do not delete files; move to web/DDD/ instead.

## Key flows & integrations
- Search is hybrid Firestore + Algolia (web/src/services/search/*, web/algolia-*.json).
- Messaging uses Realtime Database v2 (web/src/hooks/messaging/useRealtimeMessaging, web/src/services/messaging/realtime/*).
- Payments are manual bank transfers; config in web/src/config/bank-details.ts.

## Mobile app conventions
- Routing lives in mobile_new/app; tabs layout in mobile_new/app/(tabs)/_layout.tsx.
- Root providers and navigation logic live in mobile_new/app/_layout.tsx (AuthProvider, theme, notifications).
- Use styled-components/native theme from mobile_new/src/styles/theme.

## Developer workflows (run inside the app folder)
- Web dev server: npm start or npm run start:dev (web/).
- Web quality gates: npm run type-check, npm test, npm run build (web/).
- Firebase emulators: npm run emulate (web/).
- Mobile dev server: npm start (expo start) (mobile_new/).

## Imports & structure
- Web uses path aliases (@/...) configured in web/tsconfig.json; avoid deep relative paths.
- Tests live in __tests__ folders; provider wrappers are required (ThemeProvider + LanguageProvider). See web/docs/testing/README.md.

## Where to look first
- Web architecture: web/.github/copilot-instructions.md, web/README.md.
- Getting started: web/docs/getting-started/README.md.