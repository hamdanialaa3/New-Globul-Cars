# نظام تسعير السيارات بالذكاء الاصطناعي
## AI-Powered Car Pricing System

**المجلد:** `Pricing_car_comparisons/`  
**التاريخ:** 17 يناير 2026  
**الحالة:** ✅ جاهز للاستخدام

---

## 📋 نظرة عامة

نظام ذكي لتسعير السيارات يعتمد على:
- **Google Gemini AI** لتحليل بيانات السوق
- **Web Scraping** للمواقع البلغارية (حصراً)
- **Market Intelligence** لتقدير الأسعار الدقيقة
- **Real-time Updates** من الأسواق البلغارية

---

## 🏗️ البنية

```
Pricing_car_comparisons/
├── components/           # مكونات React
│   ├── PricingForm.tsx
│   └── PricingResult.tsx
├── pages/               # الصفحات
│   └── CarPricingPage.tsx
├── services/            # الخدمات
│   ├── pricing-ai.service.ts
│   ├── market-scraper.service.ts
│   └── price-calculator.service.ts
├── hooks/              # React Hooks
│   └── usePricing.ts
├── types/              # TypeScript Types
│   └── pricing.types.ts
├── config/             # الإعدادات
│   └── bulgarian-sources.config.ts
├── utils/              # الأدوات المساعدة
│   ├── price-formatters.ts
│   └── validation.ts
└── README.md           # هذا الملف
```

---

## 🚀 التثبيت والاستخدام

### 1. نسخ المجلد إلى المشروع الأصلي

```bash
# نسخ المجلد كاملاً
cp -r Pricing_car_comparisons/ /path/to/New-Globul-Cars/src/
```

### 2. إضافة Route في المشروع الأصلي

افتح `src/routes/MainRoutes.tsx` وأضف:

```typescript
import { CarPricingPage } from '../Pricing_car_comparisons/pages/CarPricingPage';

// في Routes
<Route path="/pricing" element={<CarPricingPage />} />
```

### 3. إضافة Link في Navigation

افتح `src/components/Header/Header.tsx` وأضف:

```typescript
<Link to="/pricing">تسعير السيارات</Link>
```

### 4. التحقق من Firebase Config

تأكد من أن `src/firebase/firebase-config.ts` يحتوي على:

```typescript
export const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
export const genai = GEMINI_API_KEY ? genai.configure({ apiKey: GEMINI_API_KEY }) : null;
```

### 5. تثبيت التبعيات (إن وجدت)

```bash
npm install recharts  # للرسوم البيانية (اختياري)
```

---

## 🔧 الإعدادات

### Google Gemini API

المفتاح موجود في `firebase-config.ts`. تأكد من:
1. تفعيل Gemini API في Google Cloud Console
2. إضافة المفتاح إلى `.env`:
   ```
   REACT_APP_GEMINI_API_KEY=your_api_key_here
   ```

### المواقع البلغارية

يمكن تعديل قائمة المواقع في:
```
config/bulgarian-sources.config.ts
```

---

## 📊 كيفية العمل

### 1. إدخال البيانات
المستخدم يدخل:
- البراند (Brand)
- الموديل (Model)
- الفئة (Category)
- السنة (Year)
- المسافة المقطوعة (Mileage)

### 2. معالجة AI
- Gemini AI يحلل المواصفات
- البحث في بيانات السوق
- مقارنة مع سيارات مشابهة
- حساب السعر التقريبي

### 3. البحث في السوق
- البحث في المواقع البلغارية
- تجميع الأسعار
- تحليل الاتجاهات

### 4. عرض النتائج
- السعر المقدر (Low - Average - High)
- التحليل والاستنتاج
- العوامل المؤثرة
- بيانات السوق

---

## 🔗 التكامل مع Cloud Functions

للـ Web Scraping الحقيقي، يجب إنشاء Cloud Function:

### 1. إنشاء Cloud Function

```typescript
// functions/src/pricing/market-scraper.ts
import * as functions from 'firebase-functions';
import * as puppeteer from 'puppeteer';

export const scrapeBulgarianMarket = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    // Web Scraping logic
  });
```

### 2. استدعاء من Frontend

```typescript
// في market-scraper.service.ts
const functions = getFunctions();
const scrapeMarket = httpsCallable(functions, 'scrapeBulgarianMarket');
const result = await scrapeMarket({ specs });
```

---

## 🎨 التخصيص

### الألوان
يمكن تعديل الألوان في `components/PricingForm.tsx` و `components/PricingResult.tsx`

### اللغة
النصوص حالياً بالعربية. يمكن إضافة دعم للبلغارية والإنجليزية.

---

## ⚠️ ملاحظات مهمة

1. **Web Scraping**: الكود الحالي يستخدم Mock Data. للـ Production، يجب تنفيذ Cloud Functions.

2. **Rate Limiting**: Gemini API له حدود استخدام. تأكد من إدارة الطلبات.

3. **Caching**: النتائج محفوظة لمدة 24 ساعة (يمكن تعديلها في `config/bulgarian-sources.config.ts`).

4. **Error Handling**: جميع الأخطاء معالجة. تأكد من مراجعة Console للأخطاء.

---

## 📝 التطوير المستقبلي

- [ ] إضافة Charts للرسوم البيانية
- [ ] دعم المزيد من المواقع البلغارية
- [ ] تحسين دقة AI
- [ ] إضافة History للمستخدمين
- [ ] Export النتائج إلى PDF

---

## 📞 الدعم

للمساعدة أو الإبلاغ عن مشاكل:
1. راجع `IMPLEMENTATION_PLAN.md`
2. راجع `INTEGRATION_GUIDE.md`
3. تحقق من Console للأخطاء

---

**جاهز للاستخدام! 🚀**
