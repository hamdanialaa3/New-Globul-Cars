# New Globul Cars - Bulgarian Car Marketplace

A modern, feature-rich React + TypeScript application for buying, selling, and trading cars in Bulgaria.

**Stack:** React 18 | TypeScript (strict) | Styled-Components | Firebase | Algolia | Stripe

---

## 📋 Quick Links

- **Live App:** https://mobilebg.eu
- **GitHub:** https://github.com/hamdanialaa3/New-Globul-Cars
- **Firebase Console:** https://console.firebase.google.com/project/fire-new-globul

---

## 🚀 Getting Started

### Prerequisites

- **Node.js:** 20.x or higher
- **npm:** 10.x or higher
- **Firebase Account:** Set up and configured
- **Git:** For version control

### Installation

```bash
# Clone the repository
git clone https://github.com/hamdanialaa3/New-Globul-Cars.git
cd New-Globul-Cars

# Install dependencies
npm ci

# Configure Firebase (optional for local development)
# Copy and update .env.local with your Firebase config
cp .env.example .env.local
```

### Development

```bash
# Start dev server (http://localhost:3000)
npm start

# Type checking (REQUIRED before commits)
npm run type-check

# Run tests
npm test

# Build for production
npm run build

# Deploy to Firebase
npm run deploy

# Local Firebase emulation
npm run emulate
```

---

## 🏗️ Project Architecture

### Features

- ✅ **User Authentication** - Email/OAuth via Firebase Auth
- ✅ **Car Listings** - 6 vehicle categories (cars, SUVs, vans, motorcycles, trucks, buses)
- ✅ **Numeric ID System** - Privacy-first URL design (no Firebase UIDs exposed)
- ✅ **Real-Time Messaging** - Chat and offer workflow
- ✅ **Search & Filtering** - Algolia full-text search
- ✅ **Payment Integration** - Stripe for premium features
- ✅ **Multi-Language** - Bulgarian & English
- ✅ **Responsive Design** - Mobile-first, all devices

### Project Statistics

- **React Components:** 776
- **TypeScript Files:** 727
- **Services:** 404
- **Pages:** 286
- **Routes:** 80+

### Key Directories

```
src/
├── components/     # Reusable UI components (441)
├── pages/         # Route pages (286)
├── services/      # Business logic (404)
├── contexts/      # State management (6 contexts)
├── firebase/      # Firebase config & auth
├── locales/       # i18n translations
└── utils/         # Helper functions

functions/         # Firebase Cloud Functions
public/           # Static assets & GA config
.github/workflows/ # CI/CD pipelines
```

---

## 📚 Documentation

- **[DEPLOYMENT_SUCCESS_CHECKLIST.md](./DEPLOYMENT_SUCCESS_CHECKLIST.md)** - ⭐ **START HERE** - Complete deployment & verification checklist
- **[FIREBASE_DEPLOYMENT_SETUP.md](./FIREBASE_DEPLOYMENT_SETUP.md)** - Deployment prerequisites and troubleshooting
- **[PROJECT_CONSTITUTION.md](./PROJECT_CONSTITUTION.md)** - Architectural rules and constraints
- **[MESSAGING_SYSTEM_FINAL.md](./MESSAGING_SYSTEM_FINAL.md)** - Real-time messaging implementation
- **[FIRESTORE_INDEXES_GUIDE.md](./FIRESTORE_INDEXES_GUIDE.md)** - Required composite indexes
- **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - Complete documentation index

---

## 🚀 Deployment

### Automatic Deployment

Deployments are triggered automatically on push to `main`:

```bash
git push origin main  # Triggers GitHub Actions workflow
```

The workflow will:
1. Build the React app
2. Run type checking
3. Deploy to Firebase Hosting
4. Deploy Cloud Functions

**Workflow Status:** https://github.com/hamdanialaa3/New-Globul-Cars/actions

### Before First Deployment

⚠️ **IMPORTANT:** Read [FIREBASE_DEPLOYMENT_SETUP.md](./FIREBASE_DEPLOYMENT_SETUP.md) for required IAM permissions setup.

### Manual Deployment

```bash
# Build first
npm run build

# Deploy via Firebase CLI
firebase deploy --project fire-new-globul

# Or deploy specific resources
firebase deploy --only hosting --project fire-new-globul
firebase deploy --only functions --project fire-new-globul
```

---

## 🛠️ Development Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Start dev server on port 3000 |
| `npm run type-check` | TypeScript strict mode check |
| `npm run build` | Production build with checks |
| `npm test` | Run Jest tests |
| `npm run deploy` | Deploy to Firebase |
| `npm run emulate` | Run Firebase emulator |
| `npm run clean:3000` | Kill stuck port 3000 process |
| `npm run clean:all` | Full cache & node_modules clean |

---

## 🔑 Core Services

All business logic is encapsulated in services under `src/services/`:

| Service | Purpose |
|---------|---------|
| `UnifiedCarService` | Car CRUD + numeric ID management |
| `AdvancedMessagingService` | Real-time messaging |
| `OfferWorkflowService` | Car offer workflows |
| `numeric-id-system.service` | URL-safe ID resolution |
| `SellWorkflowCollections` | Multi-collection car management |
| `bulgarian-compliance-service` | EGN/EIK validation |
| `firebase-cache.service` | Firestore optimization |

---

## 🔐 Security & Best Practices

### TypeScript Strict Mode

All code must pass strict TypeScript checking:

```bash
npm run type-check  # Run before commits
```

### No console.* in src/

Console statements are auto-banned during build via `scripts/ban-console.js`. Use the logger service instead:

```typescript
import { logger } from '@/services/logger-service';
logger.info('action', { userId, context });
logger.error('failed', error, { metadata });
```

### Firebase Security Rules

Security rules are enforced at the Firestore/Storage level. See Firebase Console for active rules.

---

## 🌐 Custom Domain

**Domain:** https://mobilebg.eu  
**Provider:** Custom domain connected to Firebase Hosting  
**SSL:** Auto-managed by Firebase

---

## 📞 Support & Issues

- **GitHub Issues:** https://github.com/hamdanialaa3/New-Globul-Cars/issues
- **Firebase Console:** https://console.firebase.google.com/project/fire-new-globul

---

## 📄 License

This project is proprietary software. Unauthorized copying or distribution is prohibited.

---

## 👥 Team

**Project:** Bulgarian Car Marketplace  
**Framework:** React 18 + TypeScript  
**Backend:** Firebase (Firestore, Auth, Functions, Hosting)  
**Last Updated:** January 9, 2026
