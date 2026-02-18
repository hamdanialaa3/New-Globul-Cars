# Testing Guide for Koli One

## Overview
This document outlines the complete testing strategy, tools, and processes for Koli One web and mobile apps.

## Testing Pyramid

### Unit Tests (Base)
- **Coverage target**: 80%+ for services
- **Tools**: Vitest (web), Jest (mobile)
- **Location**: `src/services/__tests__/*.test.ts`
- **Run**: `npm test`

### Integration Tests (Middle)
- **Focus**: Services + DB + Cloud Storage
- **Emulators**: Firebase Emulator Suite
- **Location**: `src/__tests__/integration/*.test.ts`
- **Setup**: `npm run emulate` (separate terminal)
- **Run**: `npm test -- --grep integration`

### E2E Tests (Top)
- **Tools**: Detox (mobile), Playwright (web)
- **Focus**: Complete user workflows (publish listing, message, payment)
- **Location**: `e2e/` directory
- **Run**: `npx detox test --configuration ios.sim.release` (mobile)

## Quick Start: Smoke Tests

### 1. Local Development Environment
```bash
# Install dependencies
npm install

# Start Firebase Emulator (Terminal 1)
npm run emulate

# Start dev server (Terminal 2)
npm start

# Run tests (Terminal 3)
npm test
```

### 2. Run Unit Tests Only
```bash
npm test -- --run --reporter=verbose
```

### 3. Run Integration Tests
```bash
# Ensure emulator is running
npm test -- --grep integration --run
```

### 4. Mobile Testing
```bash
cd mobile_new
npm install
npm start  # Expo start

# In another terminal:
npm test
```

## Acceptance Checklist (Pre-Merge)

- [ ] All unit tests pass: `npm test -- --run`
- [ ] No TypeScript errors: `npm run type-check` (web)
- [ ] Build succeeds: `npm run build`
- [ ] No console errors in dev server
- [ ] Slug generation works (new listing): Check console for slug assignment
- [ ] 301 redirects work (change listing title, verify old slug redirects)
- [ ] Sitemap includes new listings: Visit `/sitemap.xml`
- [ ] No Firebase rule violations (check Firestore Emulator logs)
- [ ] Mobile app builds without errors (Android/iOS)
- [ ] GDPR endpoint works: `POST /api/gdpr/export-user-data` (authenticated)

## Firestore Emulator Setup

### Initial Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Start emulator
firebase emulators:start

# In app, set connection to emulator (useEmulator flag in firebase-config.ts)
```

### Seed Sample Data
```bash
# Optional: Load sample users, listings, etc.
node scripts/seed-emulator.js
```

## CI/CD Gates (GitHub Actions)

All PRs must pass:
1. **Lint**: `npm run lint`
2. **Type Check**: `npx tsc --noEmit` (with increased memory)
3. **Unit Tests**: `npm test -- --run --coverage`
4. **Build**: `npm run build`
5. **Security**: SAST (CodeQL)
6. **E2E (optional)**: Key flows on staging-like env

## Performance Benchmarks

| Metric | Target | Tool |
|--------|--------|------|
| API response (p95) | < 500ms | Sentry / Grafana |
| Vision inference | ≤ 3s | Cloud Trace |
| Sitemap generation | ≤ 5s | Cloud Functions logs |
| Listing creation | ≤ 2s (end-to-end) | E2E test timing |
| Slug collision resolution | ≤ 200ms | Unit test benchmarks |

## Debugging

### Firestore Rules Issues
- Check emulator console: `http://localhost:4000`
- Enable rule debug logging: Set `debug` in firestore.rules
- Test rules in real-time: Use emulator console

### Slug Conflicts
```bash
# Query slugs in emulator
db.collection('listings').where('slug', '==', 'some-slug').get()

# Check history
db.collection('listing_slug_history').where('listingId', '==', 'id').get()
```

### Mobile App Debugging
```bash
# Expo dev tools
npm start  # Press 'j' for Flipper, 'i' for iOS simulator

# View logs
npm install -g react-native-cli
react-native log-ios
```

## Continuous Testing

- **Pre-commit**: `npm run pre-commit` (lint + format)
- **On push**: GitHub Actions runs full suite
- **Nightly**: Full E2E + performance benchmark
- **Weekly**: Security audit (npm audit, SAST)

## Contact

- **Test Lead**: Engineering Team
- **Flaky Test Report**: Open issue with `type: flaky-test`
- **Slack**: #testing-alerts
