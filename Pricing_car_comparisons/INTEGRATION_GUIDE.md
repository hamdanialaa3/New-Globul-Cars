# دليل التكامل مع المشروع الأصلي
## Integration Guide

**التاريخ:** 17 يناير 2026  
**المجلد:** `Pricing_car_comparisons/`

---

## 📋 الخطوات اليدوية للتكامل

### الخطوة 1: نسخ المجلد

```bash
# من مجلد المشروع الأصلي
cd "C:\Users\hamda\Desktop\New Globul Cars"
mkdir -p src\Pricing_car_comparisons

# نسخ جميع الملفات
# (استخدم File Explorer أو Terminal)
```

### الخطوة 2: تحديث Imports

جميع الملفات تستخدم مسارات نسبية. تأكد من:

1. **في `services/pricing-ai.service.ts`:**
   ```typescript
   // تغيير هذا:
   import { genai } from '../../firebase/firebase-config';
   
   // إلى:
   import { genai } from '../../../firebase/firebase-config';
   ```

2. **في `services/market-scraper.service.ts`:**
   ```typescript
   // المسارات صحيحة إذا كان المجلد في src/Pricing_car_comparisons/
   ```

### الخطوة 3: إضافة Route

افتح `src/routes/MainRoutes.tsx`:

```typescript
// في الأعلى
import { lazy } from 'react';

// Lazy loading
const CarPricingPage = lazy(() => 
  import('../Pricing_car_comparisons/pages/CarPricingPage').then(module => ({
    default: module.CarPricingPage
  }))
);

// في Routes
<Route 
  path="/pricing" 
  element={
    <Suspense fallback={<LoadingSpinner />}>
      <CarPricingPage />
    </Suspense>
  } 
/>
```

### الخطوة 4: إضافة Link في Header

افتح `src/components/Header/Header.tsx`:

```typescript
import { Link } from 'react-router-dom';

// في Navigation
<Link to="/pricing" style={{ margin: '0 16px' }}>
  تسعير السيارات
</Link>
```

### الخطوة 5: التحقق من Firebase Config

افتح `src/firebase/firebase-config.ts`:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

export const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';

export const genai = GEMINI_API_KEY 
  ? new GoogleGenerativeAI(GEMINI_API_KEY)
  : null;
```

### الخطوة 6: إضافة Environment Variable

في `.env`:

```
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

### الخطوة 7: تثبيت التبعيات (إن لزم)

```bash
npm install @google/generative-ai
```

---

## 🔧 إعداد Cloud Functions (اختياري)

للـ Web Scraping الحقيقي:

### 1. إنشاء Function

```typescript
// functions/src/pricing/market-scraper.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const scrapeBulgarianMarket = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    // Web Scraping logic
    // Return MarketPrice[]
  });
```

### 2. Deploy

```bash
firebase deploy --only functions:scrapeBulgarianMarket
```

### 3. تحديث Service

في `services/market-scraper.service.ts`:

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const scrapeMarket = httpsCallable(functions, 'scrapeBulgarianMarket');

const result = await scrapeMarket({ specs });
```

---

## ✅ Checklist

- [ ] نسخ المجلد إلى `src/Pricing_car_comparisons/`
- [ ] تحديث Imports في `pricing-ai.service.ts`
- [ ] إضافة Route في `MainRoutes.tsx`
- [ ] إضافة Link في `Header.tsx`
- [ ] التحقق من `firebase-config.ts`
- [ ] إضافة `REACT_APP_GEMINI_API_KEY` في `.env`
- [ ] تثبيت `@google/generative-ai`
- [ ] اختبار الصفحة: `/pricing`
- [ ] (اختياري) إعداد Cloud Functions

---

## 🐛 حل المشاكل

### المشكلة: "genai is not defined"
**الحل:** تأكد من إعداد `firebase-config.ts` بشكل صحيح

### المشكلة: "Module not found"
**الحل:** تحقق من مسارات Imports

### المشكلة: "API Key invalid"
**الحل:** تحقق من `.env` و Firebase Console

---

**جاهز! 🚀**
