# 🏛️ دستور المشروع - PROJECT CONSTITUTION
## Bulgarian Car Marketplace (Bulgarski Avtomobili) - معايير التطوير الثابتة

**📅 آخر تحديث:** 5 يناير 2026  
**🚀 الحالة:** Production Active (mobilebg.eu)  
**📦 النسخة:** 0.3.0  
**🔥 Firebase:** fire-new-globul  
**⚙️ GitHub:** hamdanialaa3/New-Globul-Cars

---

## 📊 ملخص المشروع (Project Overview)

### الإحصائيات الحالية:
- **776 مكون React (TSX)**
- **727 ملف TypeScript**
- **404 خدمة TypeScript**
- **185,000+ سطر برمجي**
- **286 صفحة**
- **80+ route**
- **8 Context Providers**
- **25+ Custom Hooks**
- **6 مجموعات Firestore** (passenger_cars, suvs, vans, motorcycles, trucks, buses)
- **12 Cloud Functions** (Node.js 20)

### الميزات المكتملة 100%:
✅ نظام Numeric ID  
✅ Multi-collection car storage  
✅ Hybrid Search (Firestore + Algolia)  
✅ Drive Type System (FWD/RWD/AWD/4WD)  
✅ Smart Classification System  
✅ Glassmorphism UI Design  
✅ **Real-time Messaging (Unified System - Phase 1 & 2)** ⭐ جديد!  
✅ AI-powered descriptions (Gemini)  
✅ Multi-language (BG/EN)  
✅ Google Analytics 4 + BigQuery  
✅ WhatsApp Business Integration  
✅ Facebook/Instagram Auto-posting  

---

## 1️⃣ المبادئ الأساسية (Core Principles)

### 1.1 الجودة والأداء (Quality & Performance)
- **🚫 No Spaghetti Code:** كود نظيف، منظم، قابل للصيانة
- **⚡ Performance First:** كل ميلي ثانية تهم
  - صور WebP فقط
  - Lazy loading للمكونات
  - Code splitting بـ React.memo()
  - Firestore queries محسّنة (indexes مطلوبة)
- **📱 Mobile-First:** التصميم يبدأ من الموبايل
- **🎨 WOW Effect:** تصميم يبهر من النظرة الأولى

### 1.2 التجربة البلغارية (Bulgarian Experience)
- **🇧🇬 اللغة:** Bulgarian (primary) + English
- **💶 العملة:** EUR حصرياً
- **📞 الهاتف:** +359 (Bulgaria prefix)
- **🏙️ المدن:** قائمة المدن البلغارية من `bulgaria-locations.service.ts`
- **🚗 السوق:** السيارات المستعملة في بلغاريا

---

## 2️⃣ قواعد التطوير (Development Rules)

### 2.1 هيكلية المجلدات (Folder Structure)
```
src/
├── components/       # 441 مكون (قابلة لإعادة الاستخدام)
├── pages/            # 286 صفحة كاملة
├── features/         # ميزات معقدة (car-listing, messaging, search)
├── services/         # 404 خدمة (Firebase, API, utilities)
├── contexts/         # 8 Context Providers
├── hooks/            # 25+ Custom Hooks
├── routes/           # 80+ route definitions
├── types/            # TypeScript definitions
├── styles/           # Styled-components + CSS
├── utils/            # Helper functions
└── locales/          # i18n (bg/en)
```

### 2.2 قواعد التسمية (Naming Conventions)
- **المكونات:** `PascalCase` → `CarCard.tsx`, `SearchWidget.tsx`
- **الدوال/المتغيرات:** `camelCase` → `handleSearch`, `userData`
- **الثوابت:** `UPPER_SNAKE_CASE` → `MAX_UPLOAD_SIZE`, `API_ENDPOINT`
- **Types/Interfaces:** `PascalCase` → `UserProfile`, `CarData`
- **Contexts:** `PascalCase + Context` → `AuthContext`, `ThemeContext`
- **Hooks:** `use + PascalCase` → `useAuth`, `useCars`
- **Services:** `kebab-case + .service.ts` → `numeric-car-system.service.ts`

### 2.3 Path Aliases (tsconfig.json)
```typescript
"@/components/*" → "src/components/*"
"@/services/*"   → "src/services/*"
"@/pages/*"      → "src/pages/*"
"@/hooks/*"      → "src/hooks/*"
"@/types/*"      → "src/types/*"
"@/contexts/*"   → "src/contexts/*"
"@/utils/*"      → "src/utils/*"
```

---

## 3️⃣ التكنولوجيا (Tech Stack)

### 3.1 Frontend Stack
```json
{
  "react": "^18.3.1",
  "typescript": "^5.6.3",
  "styled-components": "^6.1.13",
  "react-router-dom": "^7.9.1",
  "framer-motion": "^12.23.26",
  "lucide-react": "^0.469.0"
}
```

### 3.2 Backend Stack (Firebase 12.3.0)
- **Authentication:** Multi-provider (Google, Facebook, Apple, Email, Phone)
- **Firestore:** 6 collections + multi-index system
- **Cloud Storage:** Image hosting (WebP optimized)
- **Cloud Functions:** Node.js 20, 12 functions
- **FCM:** Push notifications
- **Hosting:** CDN + Custom domain (mobilebg.eu)

### 3.3 Third-party Integrations
- **Algolia:** Hybrid search
- **Google Gemini:** AI descriptions
- **Stripe:** Payments
- **hCaptcha:** Bot protection
- **Google Analytics 4:** Analytics + BigQuery
- **WhatsApp Business API:** Messaging
- **Meta Business Suite:** Facebook/Instagram ads

### 3.4 Build Tools
- **CRACO 7.x:** Webpack customization
- **TypeScript 5.6.3:** Strict mode
- **ESLint + Prettier:** Code quality

---

## 4️⃣ المعايير المعمارية (Architectural Standards)

### 4.1 نظام Numeric ID (CRITICAL - لا يُمس)
**❌ NEVER use Firebase UIDs in public URLs**

#### الأنماط الصحيحة:
```typescript
// ✅ User Profile
/profile/:numericId
Example: /profile/18

// ✅ Car Details (Double ID System)
/car/:sellerNumericId/:carNumericId
Example: /car/1/5  // User #1's 5th car

// ✅ Edit Car
/car/:sellerNumericId/:carNumericId/edit

// ✅ Messages
/messages/:senderId/:recipientId
Example: /messages/1/18
```

#### الخدمات المسؤولة:
- `numeric-car-system.service.ts` (300+ lines)
- `numeric-id-assignment.service.ts`
- Counter: `counters/{uid}/cars` in Firestore

#### الحماية:
- `NumericIdGuard.tsx` - redirects invalid URLs
- `repairMissingIds()` - fixes legacy data

### 4.2 Multi-collection Pattern (CRITICAL)
**❌ NEVER hardcode collection names**

#### الـ 6 مجموعات:
```typescript
passenger_cars  // سيارات الركاب
suvs            // الدفع الرباعي
vans            // الفانات
motorcycles     // الدراجات النارية
trucks          // الشاحنات
buses           // الباصات
```

#### الاستخدام الصحيح:
```typescript
import { SellWorkflowCollections } from '@/services/sell-workflow-collections.service';

const collectionName = SellWorkflowCollections
  .getCollectionNameForVehicleType(vehicleType);

// ✅ Dynamic collection resolution
// ❌ NEVER: db.collection('passenger_cars')
```

### 4.3 Firestore Listeners (CRITICAL - Memory Leaks)
### 4.3 Firestore Listeners (CRITICAL - Memory Leaks)
**⚠️ ALWAYS use `isActive` flag pattern**

```typescript
// ✅ CORRECT Pattern (from FIRESTORE_LISTENERS_FIX.md)
useEffect(() => {
  let isActive = true; // Prevent updates after unmount
  
  const unsubscribe = onSnapshot(docRef, (snapshot) => {
    if (!isActive) return; // Critical check
    // Update state...
  });
  
  return () => {
    isActive = false;
    try {
      unsubscribe();
    } catch (error) {
      logger.warn('Cleanup error', error);
    }
  };
}, [dependencies]);

// ❌ WRONG - Causes memory leaks
useEffect(() => {
  const unsubscribe = onSnapshot(docRef, (snapshot) => {
    setState(snapshot.data()); // Can run after unmount!
  });
  return unsubscribe;
}, []);
```

### 4.4 Logging (BAN console.log)
**❌ console.log/error/warn are BANNED in src/**

```typescript
// ✅ CORRECT
import { logger } from '@/services/logger-service';

logger.debug('User clicked', { userId, action });
logger.info('Car created', { carId });
logger.warn('API slow', { latency });
logger.error('Failed to save', error, { context });

// ❌ WRONG - Build will fail
console.log('test'); // Blocked by scripts/ban-console.js
```

### 4.5 State Management
- **Context API:** Global state (Auth, Theme, Language, Profile)
- **Zustand:** car-listing store
- **Local State:** useState/useReducer for component-specific
- **❌ NO Redux** - Keep it simple

### 4.6 Routing
- **Modular:** Routes split in `src/routes/` (not in App.tsx)
- **Lazy Loading:** Use `safeLazy()` from `lazyImport.ts`
- **Guards:** AuthGuard, NumericIdGuard for protected routes

---

## 5️⃣ سير العمل (Workflow)

### 5.1 قبل البدء (Before Starting)
1. **فهم المهمة 100%:** اقرأ المتطلبات مرتين
2. **البحث في الكود:** استخدم `semantic_search` للخدمات الموجودة
3. **التخطيط:** خطط قبل الكتابة
4. **التحقق من التوثيق:** راجع [DOCUMENTATION_MASTER_INDEX.md](DOCUMENTATION_MASTER_INDEX.md)

### 5.2 أثناء العمل (During Development)
- **DRY Principle:** Don't Repeat Yourself
- **Single Responsibility:** كل function/component لها مهمة واحدة
- **TypeScript Strict:** لا تستخدم `any` إلا للضرورة
- **Error Handling:** استخدم try-catch + `error-handling-service.ts`
- **Accessibility:** ARIA labels, semantic HTML

### 5.3 قبل الـ Commit (Before Committing)
```bash
npm run type-check      # No TypeScript errors
npm run build           # Build succeeds
npm run check-security  # No exposed secrets
```

### 5.4 قبل الـ Deploy (Before Deployment)
1. **Test Locally:** `firebase emulators:start`
2. **Review Firestore Rules:** `firestore.rules`
3. **Check Indexes:** `firestore.indexes.json`
4. **Verify Functions:** `functions/src/`
5. **Test on Staging:** Deploy to test environment first

---

## 6️⃣ الأمان والخصوصية (Security & Privacy)

### 6.1 Environment Variables
```bash
# .env.local (NEVER commit)
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_ALGOLIA_APP_ID=...
REACT_APP_ALGOLIA_API_KEY=...  # Search-only key
REACT_APP_STRIPE_PUBLIC_KEY=...
REACT_APP_HCAPTCHA_SITE_KEY=...
```

### 6.2 Firestore Security Rules
- **NEVER trust client:** Validate on server
- **User isolation:** Users can only read/write their own data
- **Plan enforcement:** Check `planTier` before write
- **Rate limiting:** Cloud Functions handle throttling

### 6.3 API Keys
- **Public keys only:** Frontend has public/search-only keys
- **Admin keys:** Stay in Cloud Functions
- **Key rotation:** Follow [KEY_ROTATION_GUIDE_AR.md](KEY_ROTATION_GUIDE_AR.md)

### 6.4 GDPR Compliance
- **Cookie Banner:** hCaptcha + Analytics consent
- **Data Deletion:** User can delete account
- **Data Export:** Available on request
- **Privacy Policy:** Linked in footer

---

## 7️⃣ التصميم والـ UI (Design & UI)

### 7.1 Design System (January 2026)
- **Glassmorphism:** `glassmorphism-buttons.ts` + `global-glassmorphism-buttons.css`
- **Colors:** Smart text color (WCAG AAA) from `SMART_TEXT_COLOR_SYSTEM.md`
- **Typography:** Responsive (0.95rem desktop → 0.6rem mobile)
- **Spacing:** Consistent padding/margin scale
- **Animations:** Framer Motion (subtle, performant)

### 7.2 Responsive Breakpoints
```typescript
const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  laptop: '1024px',
  desktop: '1440px'
};
```

### 7.3 Icons
- **Lucide React:** Primary icon library
- **SVG:** Custom brand logos in `assets/images/professional_car_logos/`

### 7.4 Images
- **Format:** WebP only (convert with `browser-image-compression`)
- **Optimization:** Cloud Function `image-optimizer.ts`
- **Lazy Loading:** Native `loading="lazy"` + React lazy
- **Featured Image:** First image marked as featured

---

## 8️⃣ الاختبار (Testing)

### 8.1 Test Framework
- **Jest + RTL:** Unit + Integration tests
- **File patterns:** `*.test.tsx`, `*.spec.ts`
- **Mocks:** `src/__mocks__/firebase/`

### 8.2 Commands
```bash
npm test                # Watch mode
npm run test:ci         # CI mode with coverage
npm test -- --testPathPattern=filename  # Specific test
```

### 8.3 Coverage Target
- **Statements:** > 70%
- **Branches:** > 60%
- **Functions:** > 70%
- **Lines:** > 70%

---

## 9️⃣ التوثيق (Documentation)

### 9.1 الملفات الرئيسية
- [DOCUMENTATION_MASTER_INDEX.md](DOCUMENTATION_MASTER_INDEX.md) - فهرس شامل
- [PROJECT_COMPLETE_INVENTORY.md](PROJECT_COMPLETE_INVENTORY.md) - جرد الملفات
- [FIRESTORE_LISTENERS_FIX.md](FIRESTORE_LISTENERS_FIX.md) - نمط الـ listeners
- [SECURITY.md](SECURITY.md) - الأمان

### 9.2 Feature Documentation
- **UI:** UI_REDESIGN_REPORT.md, GLASSMORPHISM_IMPLEMENTATION_REPORT.md
- **Systems:** SMART_CLASSIFICATION_SYSTEM_JAN3_2026.md, SMART_TEXT_COLOR_SYSTEM.md
- **Integrations:** META_INTEGRATION_MASTER_PLAN.md, WHATSAPP_AI_INTEGRATION_MASTER_PLAN.md

### 9.3 معايير التوثيق
- **ملفات جديدة:** أضف README.md في المجلد
- **Functions معقدة:** JSDoc comments
- **APIs:** Document parameters + return types
- **Breaking Changes:** Update CHANGELOG.md

---

## 🔟 الأرشيف والتنظيف (Hygiene)

### 10.1 Code Cleanup
- **❌ No Zombie Code:** حذف الكود غير المستخدم
- **❌ No Commented Code:** حذف التعليقات القديمة
- **✅ Clean Imports:** Remove unused imports (ESLint)
- **✅ Clean Root:** Keep root directory organized

### 10.2 Dependency Management
```bash
npm outdated            # Check for updates
npm audit               # Security vulnerabilities
npm dedupe              # Remove duplicates
```

### 10.3 Build Optimization
```bash
npm run build:analyze   # Bundle size analysis
npm run clean:cache     # Clear build cache
npm run clean:all       # Full cleanup
```

---

## 1️⃣1️⃣ الميزات الحديثة (Recent Features)

### ✨ يناير 2026:
- ✅ **Unified Messaging System** (Phase 1 & 2) - 4-5 يناير
  - توحيد نظامين منفصلين في نظام واحد
  - حذف 829 سطر كود مكرر
  - MessagingOrchestrator (Facade Pattern)
  - Mark as Read, Offer System, Archive, File Upload
- ✅ **Drive Type System** (FWD/RWD/AWD/4WD) - 3 يناير
- ✅ **Smart Classification** - AI-powered vehicle categorization - 3 يناير
- ✅ **UI Redesign** - Mobile.de-inspired modern design - 3 يناير
- ✅ **Google Analytics 4 + BigQuery** - Complete integration - 3 يناير
- ✅ **Consent Mode v2** - GDPR compliance - 3 يناير

### ✨ ديسمبر 2025:
- ✅ **Glassmorphism Design** - Sci-fi glass effects
- ✅ **Messaging System** - Real-time chat + FCM
- ✅ **Icon System** - Lucide React migration
- ✅ **Smart Text Colors** - WCAG AAA compliance
- ✅ **Image Upload Enhancement** - Multi-upload + compression

---

## 1️⃣2️⃣ الأوامر المهمة (Important Commands)

### Development
```bash
npm start                      # Dev server (port 3000)
npm run start:dev              # Dev with 4GB memory
npm run type-check             # TypeScript validation
npm run build                  # Production build
npm run build:analyze          # Bundle analysis
```

### Deployment
```bash
npm run deploy                 # Deploy all (hosting + functions)
npm run deploy:hosting         # Frontend only
npm run deploy:functions       # Backend only
```

### Firebase
```bash
firebase emulators:start       # Local emulators
firebase deploy --only firestore:rules    # Update rules
firebase deploy --only firestore:indexes  # Update indexes
```

### Cleanup
```bash
npm run clean:3000             # Kill port 3000
npm run clean:cache            # Clear caches
npm run clean:all              # Full cleanup
scripts/clear-dev-caches.ps1   # PowerShell cleanup
```

### Algolia
```bash
npm run sync-algolia           # Sync Algolia indexes
```

---

## 1️⃣3️⃣ الأخطاء الشائعة (Common Mistakes)

### ❌ DON'T:
1. **Use Firebase UIDs in URLs** → Use numeric IDs
2. **Hardcode collection names** → Use `SellWorkflowCollections`
3. **Forget `isActive` flag** → Memory leaks
4. **Use console.log** → Use `logger` service
5. **Skip type-check before commit** → Build failures
6. **Deploy without testing** → Production issues
7. **Expose API keys in frontend** → Security risk
8. **Create new services without checking** → Code duplication
9. **Ignore ESLint warnings** → Technical debt
10. **Skip documentation** → Maintenance nightmare

### ✅ DO:
1. **Read PROJECT_CONSTITUTION.md** → Before any work
2. **Use semantic_search** → Find existing code
3. **Follow naming conventions** → Consistency
4. **Write tests** → Quality assurance
5. **Update documentation** → Help future developers
6. **Review Firestore Rules** → Security
7. **Check bundle size** → Performance
8. **Test on mobile** → Responsive design
9. **Ask questions** → Before guessing
10. **Keep it simple** → YAGNI principle

---

## 1️⃣4️⃣ الروابط المهمة (Important Links)

### Production
- **Live Site:** https://mobilebg.eu
- **Firebase Hosting:** https://fire-new-globul.web.app
- **GitHub:** https://github.com/hamdanialaa3/New-Globul-Cars
- **Firebase Console:** https://console.firebase.google.com/project/fire-new-globul

### Documentation
- **Master Index:** [DOCUMENTATION_MASTER_INDEX.md](DOCUMENTATION_MASTER_INDEX.md)
- **Complete Inventory:** [PROJECT_COMPLETE_INVENTORY.md](PROJECT_COMPLETE_INVENTORY.md)
- **Latest Deployment:** [DEPLOYMENT_SUCCESS_JAN3_2026.md](DEPLOYMENT_SUCCESS_JAN3_2026.md)

### Support
- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions

---

## 📌 القاعدة الذهبية (Golden Rule)

> **"إذا كنت في شك، لا تفعل. اسأل، ابحث، افهم، ثم نفذ."**
> 
> **"If in doubt, don't. Ask, search, understand, then execute."**

---

**الدستور ثابت. المعايير واضحة. التطوير احترافي. المشروع ناجح.**  
**Constitution is fixed. Standards are clear. Development is professional. Project is successful.**

---

**© 2026 Bulgarian Car Marketplace - All Rights Reserved**  
**Last Updated:** January 4, 2026 by Senior System Architect

