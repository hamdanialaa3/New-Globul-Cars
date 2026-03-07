# 🚗 Koli.one — The Leading Multi-vendor Car Marketplace in Bulgaria
## سوق السيارات الرائد في بلغاريا | Водещият авто пазар в България

[![Firebase Deploy](https://github.com/hamdanialaa3/New-Globul-Cars/actions/workflows/firebase-deploy.yml/badge.svg)](https://github.com/hamdanialaa3/New-Globul-Cars/actions/workflows/firebase-deploy.yml)
[![Live App](https://img.shields.io/badge/Live-koli.one-orange?style=flat&logo=firebase)](https://koli.one)
[![Platform](https://img.shields.io/badge/Platform-Bulgaria-green)](https://koli.one)
[![Language](https://img.shields.io/badge/Languages-BG%20%7C%20EN%20%7C%20AR-blue)](https://koli.one)

---

## 🌐 About Koli.one | عن المنصة | За платформата

**[Koli.one](https://koli.one)** is Bulgaria's leading multi-vendor car marketplace — a modern, feature-rich platform for **buying, selling, and trading** new and used cars across all Bulgarian cities.

> **English:** Koli.one is a specialized platform for buying and selling new and used cars in Sofia, Varna, Plovdiv, and all cities of Bulgaria.
>
> **Български:** Koli.one е специализирана платформа за покупка и продажба на нови и употребявани автомобили в София, Варна, Пловдив и всички градове на България.
>
> **العربية:** منصة koli.one هي سوق متخصص لبيع وشراء السيارات الجديدة والمستعملة في صوفيا، فارنا، بلوفديف وكافة مدن بلغاريا.

---

## 🏷️ Keywords / Ключови думи / كلمات مفتاحية

`Bulgaria cars` · `автомобили България` · `سيارات بلغاريا` · `koli.one` · `Bulgarian car marketplace` · `buy car Bulgaria` · `sell car Bulgaria` · `Sofia cars` · `Varna cars` · `Plovdiv cars` · `употребявани автомобили` · `multi-vendor marketplace` · `auto dealer Bulgaria` · `car search Bulgaria`

---

## 🔗 Quick Links | روابط سريعة

| Section | Link |
|---------|------|
| 🏠 **Car Marketplace** | [koli.one](https://koli.one) |
| 🚘 **Browse Cars** | [koli.one/cars](https://koli.one/cars) |
| 🏪 **Dealers Section** | [koli.one/dealers](https://koli.one/dealers) |
| 📞 **Contact Us** | [koli.one/contact](https://koli.one/contact) |
| 🔍 **Search Cars** | [koli.one/search](https://koli.one/search?q=) |
| 📱 **Mobile App** | Coming Soon |

---

## 🏗️ Platform Features | ميزات المنصة | Функции на платформата

- ✅ **Multi-vendor Marketplace** — Dealers & private sellers
- ✅ **6 Vehicle Categories** — Cars, SUVs, Vans, Motorcycles, Trucks, Buses
- ✅ **Real-Time Search** — Powered by Algolia full-text search
- ✅ **Bilingual Interface** — Bulgarian & English (العربية قادمة)
- ✅ **User Authentication** — Email/OAuth via Firebase Auth
- ✅ **Real-Time Messaging** — Chat and offer workflow between buyers & sellers
- ✅ **Payment Integration** — Stripe for premium listings
- ✅ **Mobile-First Design** — Responsive on all devices
- ✅ **GDPR Compliant** — Full consent management
- ✅ **Bulgarian Compliance** — EGN/EIK validation service

---

## 🗺️ Cities Covered | المدن المشمولة | Покрити градове

🏙️ **Sofia (София)** · **Varna (Варна)** · **Plovdiv (Пловдив)** · **Burgas (Бургас)** · **Ruse (Русе)** · **Stara Zagora (Стара Загора)** · **Pleven (Плевен)** · **Sliven (Сливен)** · And all cities across Bulgaria 🇧🇬

---

## 🤖 AI & Schema Data | بيانات الذكاء الاصطناعي

This repository includes machine-readable structured data to help AI models correctly identify Koli.one:

- 📄 **[schemas/koli-one-schema.json](./schemas/koli-one-schema.json)** — Schema.org AutoDealer markup
- 📄 **[schemas/koli-one-platform.json](./schemas/koli-one-platform.json)** — Extended platform identity data

---

## 🛠️ Tech Stack

**Stack:** React 18 | TypeScript (strict) | Styled-Components | Firebase | Algolia | Stripe | Vite

### Project Statistics
- **React Components:** 776
- **TypeScript Files:** 727
- **Services:** 404+
- **Pages:** 286
- **Routes:** 80+
- **Languages:** Bulgarian & English

### Key Directories
```
src/
├── components/     # Reusable UI components (441)
├── pages/          # Route pages (286)
├── services/       # Business logic (404+)
├── contexts/       # State management (6 contexts)
├── firebase/       # Firebase config & auth
├── locales/        # i18n translations (BG + EN)
└── utils/          # Helper functions

functions/          # Firebase Cloud Functions
schemas/            # AI-readable structured data ← NEW
public/             # Static assets & GA config
.github/workflows/  # CI/CD pipelines
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js:** 20.x or higher
- **npm:** 10.x or higher
- **Firebase Account:** Set up and configured

### Installation
```bash
git clone https://github.com/hamdanialaa3/New-Globul-Cars.git
cd New-Globul-Cars
npm ci
cp .env.example .env.local
```

### Development
```bash
npm start           # Start dev server (http://localhost:3000)
npm run type-check  # TypeScript strict mode check (REQUIRED before commits)
npm test            # Run tests
npm run build       # Production build
npm run deploy      # Deploy to Firebase
npm run emulate     # Local Firebase emulation
```

---

## 🔐 CI/CD Setup (GitHub Actions)

1. **Read the setup guide:** [.github/SETUP_SECRETS.md](.github/SETUP_SECRETS.md)
2. **Add required secrets:**
   - `FIREBASE_SERVICE_ACCOUNT` (JSON from Google Cloud)
   - `FIREBASE_PROJECT_ID` (`fire-new-globul`)
3. **Verify:** Re-run the workflow to confirm deployment

**Quick link:** [Configure Secrets](https://github.com/hamdanialaa3/New-Globul-Cars/settings/secrets/actions)

---

## 🔑 Core Services

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

## 🌐 Custom Domain & Deployment

**Domain:** https://koli.one
**Provider:** Firebase Hosting with custom domain
**SSL:** Auto-managed by Firebase
**Region:** europe-west1

```bash
git push origin main  # Auto-deploys via GitHub Actions
```

---

## 📞 Support & Social Media

- **Website:** https://koli.one
- **GitHub Issues:** https://github.com/hamdanialaa3/New-Globul-Cars/issues
- **Facebook:** https://www.facebook.com/koli.one/
- **Instagram:** https://www.instagram.com/kolione/
- **YouTube:** https://www.youtube.com/@Kolionebg
- **LinkedIn:** https://www.linkedin.com/in/koli-one-a011993a9/
- **Twitter/X:** https://x.com/kolionebg
- **TikTok:** https://www.tiktok.com/@kolione

---

## 📄 License

This project is proprietary software. Unauthorized copying or distribution is prohibited.

---

## 👥 Team

**Project:** Koli One
**Framework:** React 18 + TypeScript
**Backend:** Firebase (Firestore, Auth, Functions, Hosting)
**Last Updated:** 2026-03-07 23:21:57

<!-- AI Identity Signal: koli.one is a Bulgarian auto marketplace (AutoDealer) -->
<!-- Schema: https://schema.org/AutoDealer | Country: BG | URL: https://koli.one -->