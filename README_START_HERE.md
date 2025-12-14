# 🚀 New Globul Cars - Start Here

> **Bulgarian Car Marketplace** - React 19 SPA with Firebase Backend

---

## 📂 Project Structure (Clean & Organized)

```
New Globul Cars/
├── 📱 bulgarian-car-marketplace/    # Main React App (START HERE)
│   ├── src/                        # Source code
│   ├── public/                     # Static files
│   ├── build/                      # Production build
│   ├── README.md                   # App documentation
│   ├── SERVER_NOW_WORKING.md       # 🔥 How to start server
│   └── START_PRODUCTION_SERVER.bat # 🔥 Quick server launcher
│
├── 🔥 functions/                    # Firebase Cloud Functions (Backend)
├── 🤖 ai-valuation-model/          # Python AI Microservice
├── 🎨 assets/                       # Optimized Media Assets
├── 📊 DDD/                          # Archive (Old docs & deprecated code)
│   └── DOCUMENTATION_ARCHIVE_NOV_2025/  # 🗄️ All old documentation
│
└── ⚙️ Config Files (Root)
    ├── firebase.json               # Firebase configuration
    ├── firestore.rules             # Database security
    ├── storage.rules               # Storage security
    └── package.json                # Root dependencies
```

---

## 🎯 Quick Start Guide

### 1️⃣ Start the Development Server

**Option A: Easy Way (Production Server)**
```bash
cd bulgarian-car-marketplace
# Double-click this file:
START_PRODUCTION_SERVER.bat
```

**Option B: Manual Way**
```bash
cd bulgarian-car-marketplace
npm start
# OR for production:
npx serve -s build -l 3000
```

**Server will be at:** http://localhost:3000

### 2️⃣ Build for Production

```bash
cd bulgarian-car-marketplace
npm run build
```

### 3️⃣ Deploy to Firebase

```bash
cd bulgarian-car-marketplace
npm run deploy
```

---

## 📚 Essential Documentation

### Core Files (Must Read):
1. **`.github/copilot-instructions.md`** - Complete project architecture & conventions
   - **What:** Comprehensive guide for GitHub Copilot AI assistant
   - **Why:** Ensures AI-generated code follows our project standards
   - **Use:** Reference when unsure about code patterns or conventions
   - **بالعربية:** دليل شامل لمساعد الذكاء الاصطناعي GitHub Copilot لفهم بنية المشروع
2. **`.github/README.md`** - Explanation of GitHub configuration files
3. **`bulgarian-car-marketplace/README.md`** - Frontend app details
4. **`bulgarian-car-marketplace/SERVER_NOW_WORKING.md`** - Server setup guide
5. **`functions/README.md`** - Backend Cloud Functions guide

### Archived Documentation:
- All old reports, guides, and temporary files → **`DDD/DOCUMENTATION_ARCHIVE_NOV_2025/`**
- Only reference if you need historical context

---

## 🛠️ Key Technologies

- **Frontend:** React 19, TypeScript, Styled Components, CRACO
- **Backend:** Firebase (Auth, Firestore, Storage, Functions)
- **Languages:** Bilingual (Bulgarian + English)
- **Theme:** Mobile.de-inspired design
- **State:** Context API (No Redux)

---

## 🌍 Environment Setup

**Required `.env` file in `bulgarian-car-marketplace/`:**
```env
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_RECAPTCHA_SITE_KEY=your_recaptcha_key
REACT_APP_GOOGLE_MAPS_API_KEY=your_maps_key
```

Copy from `.env.example` and fill in your values.

---

## 🎨 Project Highlights

### ✨ Recent Optimizations (Nov 2025):
- ✅ Build size: **77% reduction** (664 MB → 150 MB)
- ✅ Load time: **80% faster** (10s → 2s first paint)
- ✅ TypeScript errors: **100% fixed** (39 errors resolved)
- ✅ Documentation: **Organized & archived** (100+ files cleaned)
- ✅ Service deduplication: **120 → 103 services**

### 🚀 Key Features:
- 🇧🇬 **Bilingual System** (Bulgarian + English)
- 🎯 **3 Profile Types** (Private, Dealer, Company)
- 🔍 **Advanced Search** (Filters, Maps, Recommendations)
- 💬 **Real-time Messaging** (Socket.io + Firebase)
- 🤖 **AI Pricing** (XGBoost + Vertex AI)
- 📱 **Mobile-Optimized** (Bottom nav, swipe gestures)

---

## 📝 Development Workflow

### Daily Development:
```bash
# 1. Pull latest changes
git pull

# 2. Install dependencies (if needed)
cd bulgarian-car-marketplace
npm install --legacy-peer-deps

# 3. Start development
npm start
# OR use production server (faster):
.\START_PRODUCTION_SERVER.bat

# 4. Make changes in src/

# 5. Test
npm test

# 6. Build & deploy
npm run build
npm run deploy
```

### Common Commands:
```bash
# Lint (manual - auto-lint disabled)
npx lint-staged

# Type checking
npx tsc --noEmit

# Firebase emulators (local testing)
npm run emulate

# Deploy functions only
npm run deploy:functions

# Optimized build (with image optimization)
npm run build:optimized
```

---

## 🔒 Important Notes

### ✅ Do's:
- ✅ Use `useLanguage().t()` for all strings
- ✅ Follow styled-components pattern (`S.*` namespace)
- ✅ Use lazy loading for routes
- ✅ Clean up listeners in `useEffect`
- ✅ Check `.github/copilot-instructions.md` before coding

### ❌ Don'ts:
- ❌ Don't use old location fields (`location`, `city`, `region`)
- ❌ Don't add `console.log` in production code
- ❌ Don't create duplicate services
- ❌ Don't change Context provider order
- ❌ Don't delete files from `DDD/` without review

---

## 🆘 Troubleshooting

### Server won't start?
→ See `bulgarian-car-marketplace/SERVER_NOW_WORKING.md`

### Build errors?
```bash
cd bulgarian-car-marketplace
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

### Firebase errors?
```bash
# Use emulators for development
npm run emulate
```

### Need historical context?
→ Check `DDD/DOCUMENTATION_ARCHIVE_NOV_2025/`

---

## 👥 For Contributors

### New to this project?
1. Read `.github/copilot-instructions.md` (complete architecture)
2. Read `bulgarian-car-marketplace/README.md` (frontend details)
3. Start server with `START_PRODUCTION_SERVER.bat`
4. Explore `src/` directory structure
5. Check existing components before creating new ones

### Making changes?
1. Create feature branch from `main`
2. Follow existing code patterns
3. Test locally with emulators
4. Update relevant documentation (if needed)
5. Submit PR with clear description

---

## 📞 Need Help?

- **Architecture Questions:** Check `.github/copilot-instructions.md`
- **Server Issues:** Check `SERVER_NOW_WORKING.md`
- **Historical Context:** Check `DDD/DOCUMENTATION_ARCHIVE_NOV_2025/`
- **Code Patterns:** Search existing components in `src/`

---

## 🎯 Next Steps

Choose your path:

**🔧 Developer:**
1. Run `START_PRODUCTION_SERVER.bat`
2. Open http://localhost:3000
3. Start coding in `src/`

**📚 Researcher:**
1. Read `.github/copilot-instructions.md`
2. Explore `DDD/DOCUMENTATION_ARCHIVE_NOV_2025/`
3. Review old reports and decisions

**🚀 Deployer:**
1. Run `npm run build:optimized`
2. Test build locally
3. Run `npm run deploy`

---

**Last Updated:** November 5, 2025  
**Status:** ✅ Production Ready  
**Server:** http://localhost:3000 (when running)
