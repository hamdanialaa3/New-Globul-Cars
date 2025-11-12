# Project Structure - New Globul Cars

**Date**: November 12, 2025  
**Cleanup Phase**: Phases 1-8 Complete  
**Branch**: checkpoint-nov7-2025-stable  
**Status**: Production-ready after systematic cleanup

---

## 📊 Cleanup Results Summary

### Before Cleanup (Pre-Phase 1)
- **Total Files**: 199,626 files
- **Total Size**: 5.79 GB
- **Status**: Bloated with node_modules, build artifacts, duplicates

### After Cleanup (Phase 8 Complete)
- **Total Files**: ~7,600 files (96.2% reduction)
- **Total Size**: ~1.4 GB (76% reduction)
- **Cleanup Phases Completed**: 8/10
- **Space Freed**: 4.42 GB

### Commits (Phases 1-8)
1. `5ca1c859` - Phase 1: Temporary files cleanup (node_modules, build/, coverage/)
2. `d2fd3dc4` - Phase 2: Documentation organization (110 files → docs/)
3. `1a93447e` - Phase 3: Duplicate files cleanup (13 files)
4. `0c0ace76` - Phase 4: Assets organization (6 image files)
5. `5146db7e` - Phase 5: Source code cleanup (DDD optimization)
6. `50e537ec` - Phase 6: Subprojects organization (992 cache files)
7. `53bd67de` - Phase 7: .gitignore enhancements
8. `c0a1114b` - Phase 8: Security cleanup (serviceAccountKey.json)

---

## 🏗️ Root Directory Structure

```
New Globul Cars/
├── 📁 bulgarian-car-marketplace/  # Main React 19 SPA (primary frontend)
├── 📁 functions/                  # Firebase Cloud Functions (Node.js backend)
├── 📁 ai-valuation-model/         # Python AI microservice (XGBoost + Vertex AI)
├── 📁 dataconnect/                # Firebase Data Connect (PostgreSQL)
├── 📁 extensions/                 # Firebase Extensions config
├── 📁 assets/                     # Optimized media assets (576 files)
├── 📁 data/                       # Static data (car brands, locales)
├── 📁 docs/                       # Organized documentation (7 categories)
├── 📁 DDD/                        # Archive folder (historical reference)
├── 📁 locales/                    # Translation files (Bulgarian/English)
├── 📁 scripts/                    # Build and utility scripts
├── 📁 types/                      # Shared TypeScript types
│
├── 📄 firebase.json               # Firebase configuration
├── 📄 firestore.rules             # Firestore security rules
├── 📄 storage.rules               # Storage security rules
├── 📄 package.json                # Root package config
├── 📄 .gitignore                  # Enhanced (Phase 7)
├── 📄 SECURITY.md                 # Security guidelines (Phase 8)
└── 📄 README_START_HERE.md        # Project entry point
```

---

## 📱 Main App: `bulgarian-car-marketplace/`

**Tech Stack**: React 19, TypeScript, Firebase, CRACO  
**Entry Point**: `src/index.tsx` → `<App />`  
**Build**: `npm run build` (outputs to `build/`)  
**Dev Server**: `npm start` (port 3000)

### Key Directories

```
bulgarian-car-marketplace/
├── 📁 src/
│   ├── 📁 components/          # Reusable UI components
│   ├── 📁 contexts/            # React Context providers
│   ├── 📁 features/            # Feature modules (analytics, billing, verification)
│   ├── 📁 pages/               # Page components (lazy-loaded)
│   │   ├── HomePage.tsx
│   │   ├── CarDetailsPage.tsx
│   │   ├── ProfilePage/        # Profile routing system
│   │   └── sell/               # Multi-step sell workflow
│   ├── 📁 services/            # 103 service files (API, Firebase, third-party)
│   ├── 📁 styles/              # Global styles, theme
│   ├── 📁 utils/               # Helper functions
│   └── 📁 firebase/            # Firebase initialization
│
├── 📁 public/                  # Static assets served directly
├── 📁 build/                   # Production build output (gitignored)
├── 📁 coverage/                # Test coverage reports (gitignored)
├── 📄 craco.config.js          # CRACO build customization
├── 📄 package.json             # 104 dependencies
└── 📄 tsconfig.json            # TypeScript config
```

### Provider Hierarchy (CRITICAL ORDER)
**From `App.tsx:1-25` - DO NOT reorder:**
```
ThemeProvider → GlobalStyles → LanguageProvider → AuthProvider → 
ProfileTypeProvider → ToastProvider → GoogleReCaptchaProvider → Router
```

---

## ⚙️ Backend: `functions/`

**Tech Stack**: TypeScript, Firebase Functions, Node.js  
**Build**: `npm run build` (outputs to `lib/` - gitignored)  
**Deploy**: `npm run deploy` from root

### Structure

```
functions/
├── 📁 src/
│   ├── index.ts               # Exports all functions
│   ├── 📁 analytics/          # User behavior, search analytics
│   ├── 📁 auth/               # Admin roles, user claims
│   ├── 📁 billing/            # Subscriptions, payments
│   ├── 📁 messaging/          # Real-time messaging, notifications
│   ├── 📁 verification/       # Phone OTP, ID docs, EIK validation
│   ├── 📁 team/               # Member invitations, roles
│   └── [+10 more domains]     # 98+ Cloud Functions total
│
├── 📁 adapters/
│   └── financial-services-manager.js  # Bulgarian financial partners
│
├── 📁 lib/                    # Compiled JS (gitignored after Phase 6)
├── 📄 package.json
└── 📄 tsconfig.json
```

### Deployment Region
- **europe-west1** (closest to Bulgaria)

---

## 🤖 AI Valuation: `ai-valuation-model/`

**Tech Stack**: Python 3.11, XGBoost, Vertex AI, BigQuery  
**Purpose**: Predict car prices based on Bulgarian market data

### Key Files

```
ai-valuation-model/
├── train_model.py             # Train on historical data
├── deploy_model.py            # Deploy to Vertex AI
├── test_model.py              # Validation against holdout set
├── predict.py                 # Prediction endpoint
├── requirements.txt           # Python dependencies
└── __init__.py
```

### Integration
- Called from: `functions/src/autonomous-resale-engine.ts`
- Input: Car details (make, model, year, mileage, condition, location)
- Output: Predicted price (EUR), confidence interval, comparables

---

## 🗄️ Data Connect: `dataconnect/`

**Tech Stack**: Firebase Data Connect, PostgreSQL 17  
**Purpose**: Structured relational data (alternative to Firestore)

### Structure

```
dataconnect/
├── dataconnect.yaml           # Config
├── seed_data.gql              # Initial data
├── 📁 schema/                 # GraphQL schemas
├── 📁 example/                # Sample queries
└── 📁 .dataconnect/           # Cache (pgliteData/ - gitignored after Phase 6)
```

### Status
- **Cache cleaned**: 992 PostgreSQL cache files removed (Phase 6)
- **gitignore added**: `.dataconnect/pgliteData/` now ignored

---

## 📚 Documentation: `docs/`

**Organization**: Completed in Phase 2 (110+ markdown files)

### Categories

```
docs/
├── 📁 00_PROJECT_INFO/         # README, structure, master plan (4 files)
├── 📁 01_ARCHITECTURE/         # System design docs (0 files - to be added)
├── 📁 02_DEVELOPMENT/          # Dev guides, hot reload, deployment (21 files)
├── 📁 03_DEPLOYMENT/           # Deployment guides (0 files - to be added)
├── 📁 04_FEATURES/             # Feature specs (0 files - to be added)
├── 📁 05_ARCHIVE/              # Historical docs, analysis reports (20 files)
├── 📁 06_PLANS/                # Restructure plans, cleanup logs (24 files)
└── 📁 07_ARABIC_DOCS/          # Arabic summaries and translations (41 files)
```

---

## 🗃️ DDD Archive: `DDD/`

**Purpose**: Historical archive for manually-reviewed content  
**Rule**: **NEVER auto-delete from DDD/** - requires manual review

### Contents

```
DDD/
├── 📁 DOCUMENTATION_ARCHIVE_NOV_2025/  # Pre-Phase 2 docs
├── 📁 RESTRUCTURE_PLANS/               # Old restructure attempts
├── 📁 scripts/                         # Old/duplicate scripts
├── 📁 src/READMEs/                     # Component READMEs
├── SellPage-old-unused.tsx             # Archived in Phase 5
├── craco.config.backup.js              # Archived in Phase 3
└── [+configs, BAT scripts, logos]      # Various archived files
```

### What Was Removed (Phase 5)
- `DDD/node_modules/` (old archive - deleted)
- `DDD/build/` (old archive - deleted)
- `DDD/public/` (old archive - deleted)

---

## 🎨 Assets: `assets/`

**Organization**: Completed in Phase 4  
**Total**: 576 optimized files

### Structure

```
assets/
├── 📁 images/
│   ├── 📁 cars/               # Car photos, thumbnails
│   ├── 📁 logos/              # 4 active logos (Logo1.png, logo.png, logo192.png, logo512.png)
│   └── 📁 ui/                 # UI icons, backgrounds
├── 📁 videos/                 # Demo videos, tutorials
├── 📁 models/                 # 3D models (if any)
└── 📁 bottom/                 # Footer assets
```

### Archived in Phase 4
- `Logo1.png` (root) → `DDD/Logo1-root-duplicate.png`
- `my-grage.jpg` → `docs/05_ARCHIVE/`
- `Screenshot.jpg` → `docs/05_ARCHIVE/`
- `logo-new.png` → `DDD/`
- `logo-original.jpg` → `DDD/`

---

## 🔐 Security

### Sensitive Files (gitignored)
- `serviceAccountKey.json` - **Removed from git tracking in Phase 8**
- `.env` files - Never committed
- `*.pem` files - Private keys

### Setup
1. Get Firebase service account key from Firebase Console
2. Save as `serviceAccountKey.json` in root
3. File is automatically ignored (.gitignore line 52)

**See**: `SECURITY.md` for full guidelines

---

## 🧪 Testing

### React App
```bash
cd bulgarian-car-marketplace
npm test                # Watch mode
npm run test:ci         # CI mode with coverage
```

### Cloud Functions
```bash
cd functions
npm test
```

### Coverage
- Reports generated in `coverage/` (gitignored)

---

## 🚀 Deployment

### Full Deployment
```bash
npm run deploy          # Builds app + deploys hosting + functions
```

### Hosting Only
```bash
cd bulgarian-car-marketplace
npm run deploy          # Build + firebase deploy --only hosting
```

### Functions Only
```bash
npm run deploy:functions  # From root
```

### Firebase Emulators (Local Development)
```bash
npm run emulate         # From root
# UI: http://localhost:4000
# Firestore: http://localhost:8081
```

---

## 🌐 Bilingual System

### Languages
- **Bulgarian** (bg) - Primary
- **English** (en) - Secondary

### Translation Files
- **Location**: `locales/translations.ts` (2100+ lines)
- **Structure**: Single `translations` object with `bg` and `en` keys
- **Usage**: `const { t } = useLanguage(); t('namespace.key')`
- **Persistence**: `localStorage` key: `'globul-cars-language'`
- **Document integration**: `<html lang>` attribute auto-updates (`bg-BG` or `en-US`)

---

## 📦 Dependencies

### Root `package.json`
- Firebase CLI tools
- Testing utilities
- Build scripts

### `bulgarian-car-marketplace/package.json`
- **Total**: 104 dependencies
- **Key**: React 19, Firebase SDK, styled-components, react-router-dom

### `functions/package.json`
- **Total**: ~50 dependencies
- **Key**: Firebase Functions, Firebase Admin, TypeScript

### `ai-valuation-model/requirements.txt`
- **Key**: xgboost, google-cloud-aiplatform, pandas, numpy

---

## 🔧 Build Configuration

### CRACO (`craco.config.js`)
- **ESLint**: Disabled for faster builds (rely on TypeScript)
- **Node.js polyfills**: Browser shims for `buffer`, `stream`, `crypto`, etc.
- **Webpack optimization**: Vendor/common chunk splitting
- **Styled Components**: Minification + `pure` annotations

### TypeScript (`tsconfig.json`)
- **Target**: ES2020
- **Module**: ESNext
- **Strict**: Enabled
- **baseUrl**: `src/`

---

## 📊 Current Project Status

### Phases Complete: 8/10

✅ **Phase 1**: Temporary files cleanup (4.42 GB freed)  
✅ **Phase 2**: Documentation organization (110 files)  
✅ **Phase 3**: Duplicate files cleanup (13 files)  
✅ **Phase 4**: Assets organization (6 files)  
✅ **Phase 5**: Source code cleanup (DDD optimized)  
✅ **Phase 6**: Subprojects organization (992 cache files)  
✅ **Phase 7**: .gitignore improvements  
✅ **Phase 8**: Security cleanup  
⏳ **Phase 9**: PROJECT_STRUCTURE.md creation (IN PROGRESS)  
⏳ **Phase 10**: Testing & verification

### Next Steps
- Complete Phase 9 documentation
- Execute Phase 10 testing
- Final verification (npm build, Firebase deploy test)

---

## 📝 Recent Optimizations (Oct 2025)

### Build Size
- **Before**: 664 MB
- **After**: 150 MB (77% reduction)
- **Method**: Service consolidation, lazy loading, tree-shaking

### Load Time
- **Before**: 10s (first contentful paint)
- **After**: 2s
- **Method**: Code splitting, CRACO optimization, image compression

### Service Deduplication
- **Before**: 120 services
- **After**: 103 services
- **Consolidated**: Location services (5 → 1), Firebase wrappers (7 → 3), analytics (4 → 2)

### Breaking Changes to Avoid
- Don't restore old location field structure (`location`, `city`, `region`)
- Don't add new duplicate services
- Don't use `console.log` in production - use `logger-service.ts`

---

## 🛠️ Development Workflow

### Starting Development
```bash
# Install dependencies (if needed after cleanup)
cd bulgarian-car-marketplace
npm install --legacy-peer-deps

# Start dev server
npm start  # Port 3000

# In another terminal - start emulators
npm run emulate  # From root
```

### Making Changes
1. Work on feature branch
2. Test locally with emulators
3. Run tests: `npm test`
4. Build: `npm run build`
5. Commit with descriptive message

### Pre-Deployment Checklist
- [ ] All tests passing (`npm run test:ci`)
- [ ] Build successful (`npm run build`)
- [ ] No `console.log` statements in production code
- [ ] Environment variables set correctly
- [ ] Firebase rules reviewed (if changed)

---

## 🌟 Key Features

### 104 Pages
- Homepage, Car Details, Profile System, Sell Workflow, Search, Messaging, Analytics, Billing, etc.

### Profile System (3 Types)
- **Private**: Individual sellers (`#FF8F10` orange)
- **Dealer**: Professional dealers (`#16a34a` green)
- **Company**: Corporate/fleet (`#1d4ed8` blue)

### Sell Workflow
- Multi-step wizard (mobile.de-inspired)
- Desktop + Mobile variants
- Auto-save to localStorage + Firestore drafts

### Real-time Features
- Messaging (Socket.io + Firebase)
- Notifications (FCM)
- Analytics dashboard

---

## 📞 Support

For issues or questions:
- Check `docs/02_DEVELOPMENT/` for dev guides
- Review `SECURITY.md` for security concerns
- See `README_START_HERE.md` for quickstart

---

**Last Updated**: November 12, 2025  
**Cleanup Phase**: 8/10 Complete  
**Branch**: checkpoint-nov7-2025-stable
