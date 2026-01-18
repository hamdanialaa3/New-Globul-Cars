# دليل النشر
## Deployment Guide

**التاريخ:** 17 يناير 2026  
**المجلد:** `Pricing_car_comparisons/`

---

## 📋 متطلبات ما قبل النشر

### 1. Google Gemini API

1. اذهب إلى [Google AI Studio](https://makersuite.google.com/app/apikey)
2. أنشئ API Key جديد
3. أضفه إلى `.env`:
   ```
   REACT_APP_GEMINI_API_KEY=your_api_key_here
   ```

### 2. Firebase Config

تأكد من أن `firebase-config.ts` يحتوي على:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

export const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
export const genai = GEMINI_API_KEY 
  ? new GoogleGenerativeAI(GEMINI_API_KEY)
  : null;
```

### 3. تثبيت التبعيات

```bash
npm install @google/generative-ai
```

---

## 🚀 خطوات النشر

### 1. Build المشروع

```bash
npm run build
```

### 2. Deploy إلى Firebase Hosting

```bash
firebase deploy --only hosting
```

### 3. التحقق من النشر

افتح: `https://mobilebg.eu/pricing`

---

## 🔧 إعداد Cloud Functions (اختياري)

للـ Web Scraping الحقيقي:

### 1. إنشاء Function

```typescript
// functions/src/pricing/market-scraper.ts
import * as functions from 'firebase-functions';
import * as puppeteer from 'puppeteer';

export const scrapeBulgarianMarket = functions
  .region('europe-west1')
  .runWith({ memory: '1GB', timeoutSeconds: 60 })
  .https.onCall(async (data, context) => {
    const { specs } = data;
    
    // Web Scraping logic
    const browser = await puppeteer.launch();
    // ... scraping code
    
    return { prices: [] };
  });
```

### 2. Deploy Function

```bash
firebase deploy --only functions:scrapeBulgarianMarket
```

---

## ✅ Checklist

- [ ] إعداد Gemini API Key
- [ ] تحديث `firebase-config.ts`
- [ ] تثبيت `@google/generative-ai`
- [ ] Build المشروع
- [ ] Deploy إلى Firebase
- [ ] اختبار الصفحة
- [ ] (اختياري) إعداد Cloud Functions

---

**جاهز للنشر! 🚀**
