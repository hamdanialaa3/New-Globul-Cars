# PROJECT CONSTITUTION
## Koli One - Development Standards & Governance

---

## 1. Architecture Overview

### 1.1 Tech Stack
- **Frontend**: React 18 SPA (Vite build, CRACO fallback)
- **Backend**: Firebase (Firestore, Auth, Cloud Functions, Storage, Hosting)
- **Search**: Algolia (hybrid Firestore + Algolia)
- **Messaging**: Firebase Realtime Database v2
- **Mobile**: Expo Router (React Native) in `mobile_new/`
- **Deployment**: Firebase Hosting at https://koli.one

### 1.2 Folder Structure
- `src/` -- Web app source (components, services, routes, hooks, types)
- `src/services/` -- Domain logic (sell workflow, numeric IDs, slugs, messaging, auth)
- `src/components/` -- Reusable UI components
- `src/routes/` -- Page-level route components
- `functions/` -- Firebase Cloud Functions (backend)
- `mobile_new/` -- Expo Router mobile app
- `schemas/` -- Versioned JSON Schema definitions
- `governance/` -- Change approval, release policy
- `ops/` -- Operational playbooks (deployment, incident response)
- `ml/` -- ML dataset and model registries
- `DDD/` -- Deleted files archive (never delete from project)
- `scripts/` -- Build and utility scripts

### 1.3 Data Contracts
- Canonical schemas live in `schemas/` (Listing, User, Story, Campaign).
- Vehicle taxonomy in `schemas/taxonomy.v1.json`.
- All Firestore documents must conform to their corresponding schema.

---

## 2. Locale & Regional Standards

| Setting | Value |
|---------|-------|
| Country | Bulgaria |
| Languages | Bulgarian (bg), English (en) |
| Currency | EUR (always) |
| Phone prefix | +359 |
| Coordinate scope | Bulgarian territory |

---

## 3. Code Standards

### 3.1 File Size
- Maximum **300 lines** per file.
- If exceeded, split into multiple files with clear imports and JSDoc.

### 3.2 No Console Calls
- `console.*` is banned in `src/`. Build blocks it via `scripts/ban-console.js`.
- Use `logger-service.ts` (`logger` for general, `serviceLogger` for services).

### 3.3 No Emoji in Code
- Unicode emoji characters are prohibited in source files.
- ASCII art markers like `// ---` or `// ===` are acceptable.

### 3.4 No Deletion
- Never delete files from the project.
- Move deprecated files to `DDD/` (acts as recycle bin).
- Owner reviews `DDD/` manually.

### 3.5 No Duplicate Logic
- Extract shared logic into services or utilities.
- Single source of truth for each domain concept.

### 3.6 TypeScript Strict
- All source must pass `npm run type-check` with zero errors.
- Use proper types; avoid `any` unless index signatures require it.

### 3.7 Imports
- Use path aliases (`@/...`) configured in `tsconfig.json`.
- Avoid deep relative paths (more than 3 levels).

---

## 4. URL & Privacy Standards (CRITICAL)

### 4.1 Numeric ID System (NEVER MODIFY)
Firebase UIDs must **never** appear in public URLs.

#### Correct URL Patterns:
```
/profile/{numericId}                        -- Own profile
/profile/view/{numericId}                   -- Viewing another user's profile
/car/{sellerNumericId}/{carNumericId}       -- Car listing
/car/{sellerNumericId}/{carNumericId}/edit  -- Edit listing
/messages/{senderId}/{recipientId}          -- Messages
```

#### Examples:
```
/profile/90          -- User #90's own profile (only if logged in as user 90)
/profile/view/90     -- Anyone viewing user 90's public profile
/car/90/5            -- User #90's 5th car listing
/car/90/5/edit       -- Edit that listing (owner only)
```

#### Strict Access Rules:
- User N can access `/profile/N` (own profile) when logged in as user N.
- Visiting another user's profile redirects to `/profile/view/{id}`.
- No user can access `/profile/{X}` where X is not their own numericId.

### 4.2 SEO Slug System
- SlugService (`src/services/slug.service.ts`) generates SEO-friendly slugs.
- Slugs are stored on listing documents as `slug` and `canonicalUrl`.
- Canonical path format: `/car/{sellerNumericId}/{carNumericId}/{slug}`
- Slug index collection: `listing_slugs` (collision prevention).
- Slug history collection: `listing_slug_history` (301 redirects).
- Slugs are assigned automatically during listing creation and updated on edit.

### 4.3 Numeric ID Implementation Files
- `src/services/numeric-id-generator.service.ts`
- `src/services/numeric-id-counter.service.ts`
- `src/services/numeric-id-profile.service.ts`
- `src/services/numeric-id-utils.service.ts`
- `src/services/numeric-car-system.service.ts`
- `functions/src/triggers/onUserCreated.ts` (assigns numericId on signup)

---

## 5. Security & Privacy

### 5.1 Authentication
- Firebase Auth with Google, email/password, and guest sign-in.
- All authenticated routes check `auth.currentUser` before operations.
- Rate limiting applied to listing creation and messaging.

### 5.2 Firestore Security Rules
- Defined in `firestore.rules` at project root.
- Users can only read/write their own documents.
- Listing ownership verified by `userId` field matching auth UID.
- Public read for published listings; write restricted to owner.

### 5.3 Data Privacy
- Firebase UIDs are internal-only; never exposed in URLs or client-visible IDs.
- Numeric IDs used for all public-facing references.
- GDPR considerations: user data deletion workflow planned.

---

## 6. Firestore Listeners

### 6.1 isActive Guard Pattern
All Firestore real-time listeners must use the `isActive` guard to prevent
state updates after component unmount:

```typescript
useEffect(() => {
  let isActive = true;

  const unsubscribe = onSnapshot(docRef, (snapshot) => {
    if (!isActive) return; // Guard
    setData(snapshot.data());
  });

  return () => {
    isActive = false;
    unsubscribe();
  };
}, []);
```

---

## 7. Vehicle Data Architecture

### 7.1 Six Collections
Vehicle data is split across 6 Firestore collections:
`cars`, `trucks`, `buses`, `trailers`, `caravans`, `agricultural`.

Resolution is handled by `src/services/sell-workflow-collections.ts`.

### 7.2 Sell Workflow (6 Files)
- `sell-workflow-collections.ts` -- Collection routing by vehicle type
- `sell-workflow-operations.ts` -- CRUD with rate limiting and slug integration
- `sell-workflow-transformers.ts` -- Data transformation and normalization
- `sell-workflow-validation.ts` -- Input validation
- `sell-workflow-images.ts` -- Image upload handling
- `sell-workflow-types.ts` -- TypeScript interfaces

---

## 8. Search Architecture

### 8.1 Hybrid Search
- Primary: Algolia for full-text search with facets and filters.
- Fallback: Firestore queries for simple lookups.
- Configuration: `configs/algolia-index-config.json`
- Services: `src/services/search/*`

---

## 9. Testing Standards

### 9.1 Required Coverage
- All service files must have corresponding `__tests__/` test files.
- Provider wrappers required: `ThemeProvider` + `LanguageProvider`.
- Documentation: `docs/testing/README.md`

### 9.2 Quality Gates
```bash
npm run type-check   # Zero TypeScript errors
npm test             # All suites pass
npm run build        # Successful production build
```

---

## 10. Dependency Management

### 10.1 Commands
```bash
npm outdated            # Check for updates
npm audit               # Security vulnerabilities
npm dedupe              # Remove duplicates
```

### 10.2 Algolia Sync
```bash
npm run sync-algolia    # Sync Algolia indexes
```

---

## 11. Governance

### 11.1 Change Approval
See `governance/CHANGE_APPROVAL.md` for the PR review process.

### 11.2 Release Policy
See `governance/RELEASE_POLICY.md` for versioning and deployment cadence.

### 11.3 Incident Response
See `ops/playbooks/incident-response.md` for severity levels and response steps.

---

## 12. Developer Workflows

### 12.1 Web Development
```bash
cd <project-root>
npm start               # Dev server
npm run start:dev       # Dev with extra logging
npm run type-check      # TypeScript validation
npm test                # Run tests
npm run build           # Production build
```

### 12.2 Firebase Emulators
```bash
npm run emulate         # Start all emulators
```

### 12.3 Mobile Development
```bash
cd mobile_new/
npm start               # Expo dev server (expo start)
```

---

## 13. Git & Deployment

### 13.1 Repository
- GitHub: https://github.com/hamdanialaa3/New-Globul-Cars
- Account: `hamdanialaa3`

### 13.2 Firebase Project
- Project: `fire-new-globul`
- Console: https://console.firebase.google.com/project/fire-new-globul

### 13.3 Production Domain
- https://koli.one
- Alternate: https://fire-new-globul.web.app

---

**Last Updated:** February 18, 2026
