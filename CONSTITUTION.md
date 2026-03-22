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

### 1.3 Data Contracts & Schemas

- **Canonical schemas** live in `schemas/`:
  - [`schemas/User.json`](schemas/User.json) — User profiles with numeric IDs and slugs
  - [`schemas/Listing.json`](schemas/Listing.json) — Vehicle listings with SEO-friendly URLs
  - [`schemas/Story.json`](schemas/Story.json) — User-generated content
  - [`schemas/Campaign.json`](schemas/Campaign.json) — Marketing campaigns
- **Vehicle taxonomy**: [`taxonomy.v1.json`](taxonomy.v1.json) — Brands, models, generations, trims
- **API Contract**: [`api/openapi.yaml`](api/openapi.yaml) — OpenAPI 3.0 specification
- All Firestore documents must conform to their corresponding schema before insert/update
- **Migration Policy**: Schema version bumps require CAB approval (see [Governance](#10-governance))

### 1.4 URL Routing & Canonicalization

- **Canonical listing URL**: `/car/{listingNumericId}/{slug}` (e.g., `/car/540/alaa-320d-sport`)
- **Legacy support**: `/car/{sellerId}/{listingId}` → 301 redirect to canonical
- **Canonical user URL**: `/u/{userNumericId}/{userSlug}` (e.g., `/u/1/alaa-al-hamdani`)
- **Short links**: `/s/{shortCode}` resolves and redirects with click tracking
- **Redirect hooks**: [`src/hooks/useSlugRedirect.ts`](src/hooks/useSlugRedirect.ts), [`src/hooks/useUserSlugRedirect.ts`](src/hooks/useUserSlugRedirect.ts)
- **Implementation details**: See [`ops/301_REDIRECT_PLAN.md`](ops/301_REDIRECT_PLAN.md)

---

## 2. Locale & Regional Standards

| Setting          | Value                        |
| ---------------- | ---------------------------- |
| Country          | Bulgaria                     |
| Languages        | Bulgarian (bg), English (en) |
| Currency         | EUR (always)                 |
| Phone prefix     | +359                         |
| Coordinate scope | Bulgarian territory          |

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

  const unsubscribe = onSnapshot(docRef, snapshot => {
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

## 11. Governance & Change Management

### 11.1 Change Approval

See [governance/CHANGE_APPROVAL.md](governance/CHANGE_APPROVAL.md) for the CAB process, PR review requirements, and approval thresholds.

### 11.2 Release Policy

See [governance/RELEASE_POLICY.md](governance/RELEASE_POLICY.md) for semantic versioning, deployment cadence (weekly production), and hotfix procedures.

### 11.3 RBAC & Access Control

See [governance/RBAC_MATRIX.md](governance/RBAC_MATRIX.md) for role definitions (Admin, Dealer, User), permission matrix, and MFA requirements.

### 11.4 Data Retention & Privacy

See [governance/DATA_RETENTION_POLICY.md](governance/DATA_RETENTION_POLICY.md) for GDPR compliance, retention periods (users: 7 years, listings: 2 years), and deletion procedures.

### 11.5 Cost Control & Budgeting

See [governance/COST_CONTROL.md](governance/COST_CONTROL.md) for monthly budget (EUR 9,000), resource tagging convention, alert thresholds (80%/100%), and quarterly cleanup process.

### 11.6 Third-Party Risk Management

See [governance/THIRD_PARTY_RISK.md](governance/THIRD_PARTY_RISK.md) for vendor tier classification, vetting checklist (SOC 2, DPA, SLA), exit strategies, and annual review schedule.

### 11.7 Repo Hygiene

See [governance/REPO_HYGIENE.md](governance/REPO_HYGIENE.md) for root directory rules, scripts/docs lifecycle, DDD/ naming conventions, AI-critical protected paths, and verification gates.

### 11.8 Change Log

See [governance/CHANGELOG.md](governance/CHANGELOG.md) for release notes, breaking changes, and migration guides.

---

## 12. Operations & Deployment

### 12.1 Infrastructure as Code

All GCP resources defined in [ops/infra/main.tf](ops/infra/main.tf):

- Firestore database (OPTIMISTIC concurrency)
- Storage buckets (media, backups, functions) with lifecycle policies
- Cloud Functions (image_processor, pricing_estimator)
- Redis cache (production only, 5GB standard tier)
- Monitoring alerts (Firestore quota >80%)

**Deploy**: `terraform init && terraform plan && terraform apply`

### 12.2 Security Rules

Firestore security rules in [ops/firestore.rules](ops/firestore.rules):

- RBAC enforcement (isAdmin, isDealer helpers)
- Seller validation (listings.sellerId == request.auth.uid)
- MFA checks (request.auth.token.mfa == true)
- Audit logging for all writes

**Deploy**: `firebase deploy --only firestore:rules`

### 12.3 Testing Strategy

- **Unit Tests**: Vitest (services, hooks, utils)
- **Integration Tests**: Firebase Emulator Suite
- **E2E Tests**: Playwright (critical flows)
- **Coverage**: Minimum 80% for services, 70% for components

**Commands**:

```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Generate coverage report
cd e2e && npm test          # Run Playwright
```

### 12.4 Observability

- **Logging**: [src/services/logger-service.ts](src/services/logger-service.ts) (structured logs, no console.\*)
- **Monitoring**: Firebase Performance Monitoring + Google Cloud Monitoring
- **Alerting**: Alert policy for Firestore quota, Redis memory, Function errors
- **Tracing**: Cloud Trace for Functions (automatic)

### 12.5 Secrets Management

- **Development**: `.env.local` (git-ignored, template in [.env.example](.env.example))
- **Production**: Google Cloud Secret Manager
- **Rotation**: Secrets rotated quarterly (Q1, Q3)

### 12.6 Offline-First Architecture

- **Service Worker**: [public/service-worker.js](public/service-worker.js) (caches assets, API responses)
- **IndexedDB**: Listing drafts, user preferences
- **Sync Strategy**: Background sync for offline writes

### 12.7 CI/CD Pipeline

- **GitHub Actions**: `.github/workflows/ci.yml`
- **Quality Gates**: Type check → Test → Build → Deploy (staging) → Manual approval → Deploy (prod)
- **Deployment**: Firebase Hosting + Functions + Firestore Rules + Storage Rules
- **Rollback**: `firebase hosting:rollback` (last 10 versions retained)

### 12.8 Incident Response

See [ops/playbooks/incident-response.md](ops/playbooks/incident-response.md) for:

- Severity levels (P0-P3)
- Escalation paths (on-call rotation)
- Post-mortem template

---

## 13. ML Governance & AI Operations

### 13.1 Dataset Registry

See [ml/dataset_registry.csv](ml/dataset_registry.csv) for:

- Training datasets (source, size, version, last_updated)
- Validation splits (80/10/10 train/val/test)
- Data provenance and licensing

### 13.2 Model Registry

See [ml/model_registry.json](ml/model_registry.json) for:

- Model name, version, framework (TensorFlow, PyTorch)
- Accuracy metrics (precision, recall, F1)
- Rollout percentage (10% → 50% → 100%)
- Rollback triggers (accuracy drop >5%, latency >500ms)

### 13.3 Feature Flags

ML features controlled via [src/config/feature-flags.ts](src/config/feature-flags.ts):

- `ai_pricing_estimator`: 100% (production)
- `ai_condition_classifier`: 50% (A/B test)
- `ai_photo_enhancement`: 10% (beta)

### 13.4 AI Quota & Cost Management

- **Vision API**: 10,000 calls/month (EUR 300 budget)
- **Vertex AI**: 5,000 predictions/month (EUR 150 budget)
- **Monitoring**: Track usage in Google Cloud Console → AI Platform → Quotas
- **Alerts**: Email at 80% quota, block at 100%

---

## 14. Developer Onboarding & Workflows

### 14.1 One-Command Setup

```bash
./dev.sh install   # Install deps, setup .env.local, check prerequisites
./dev.sh start     # Start web dev server + Firebase emulators
```

**Prerequisites**: Node.js 20+, npm 10+, Java 11+ (for Firebase Emulator)

### 14.2 Dev Container (VSCode)

Open project in VSCode → "Reopen in Container" (uses [.devcontainer/devcontainer.json](.devcontainer/devcontainer.json)):

- Node 20 base image
- Extensions: TypeScript, Prettier, ESLint, Copilot, Playwright, Vitest
- Ports forwarded: 3000 (web), 4000 (Firebase UI), 5173 (Vite), 9099 (emulator)
- Post-create: `npm install && npm run setup`

### 14.3 Environment Setup

Copy [.env.example](.env.example) to `.env.local` and set:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=fire-new-globul
VITE_ALGOLIA_APP_ID=...
VITE_ALGOLIA_SEARCH_API_KEY=...
```

**Emulator Mode**: Set `VITE_USE_FIREBASE_EMULATOR=true` to use local Firestore/Auth.

### 14.4 Project Layout

- [web/src/services/](web/src/services/): Domain logic (auth, listings, messaging, search)
- [web/src/components/](web/src/components/): React components (layout, forms, cards)
- [web/src/routes/](web/src/routes/): React Router routes
- [web/src/hooks/](web/src/hooks/): Custom React hooks (useSlugRedirect, useShortLinkResolver)
- [web/src/config/](web/src/config/): App configuration (Firebase, Algolia, feature flags)
- [docs/](docs/): Architecture, ADRs, API guides
- [governance/](governance/): Policies (RBAC, change approval, cost control)
- [ops/](ops/): Infrastructure (Terraform, Firestore rules, playbooks)
- [schemas/](schemas/): JSON Schemas (User, Listing, Story, Campaign)

### 14.5 Web Development Commands

```bash
cd <project-root>
npm start               # Dev server
npm run start:dev       # Dev with extra logging
npm run type-check      # TypeScript validation
npm test                # Run tests
npm run build           # Production build
```

### 14.6 Firebase Emulators

```bash
npm run emulate         # Start all emulators
```

### 14.7 Mobile Development

```bash
cd mobile_new/
npm start               # Expo dev server (expo start)
```

---

## 15. Git & Deployment

### 15.1 Repository

- GitHub: https://github.com/hamdanialaa3/New-Globul-Cars
- Account: `hamdanialaa3`

### 15.2 Firebase Project

- Project: `fire-new-globul`
- Console: https://console.firebase.google.com/project/fire-new-globul

### 15.3 Production Domain

- https://koli.one
- Alternate: https://fire-new-globul.web.app

---

**Last Updated:** February 18, 2026
