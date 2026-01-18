# دليل البدء السريع
## Quick Start Guide

**التاريخ:** 17 يناير 2026  
**المجلد:** `Pricing_car_comparisons/`

---

## ⚡ البدء السريع (5 دقائق)

### 1. نسخ المجلد

```bash
# نسخ المجلد إلى المشروع الأصلي
# من: Pricing_car_comparisons/
# إلى: src/Pricing_car_comparisons/
```

### 2. إضافة Route

في `src/routes/MainRoutes.tsx`:

```typescript
import { CarPricingPage } from '../Pricing_car_comparisons/pages/CarPricingPage';

<Route path="/pricing" element={<CarPricingPage />} />
```

### 3. إضافة Link

في `src/components/Header/Header.tsx`:

```typescript
<Link to="/pricing">تسعير السيارات</Link>
```

### 4. إعداد API Key

في `.env`:

```
REACT_APP_GEMINI_API_KEY=your_api_key_here
```

### 5. تثبيت التبعيات

```bash
npm install @google/generative-ai
```

### 6. تشغيل المشروع

```bash
npm start
```

افتح: `http://localhost:3000/pricing`

---

## 📁 هيكل الملفات

```
Pricing_car_comparisons/
├── components/          # مكونات React
│   ├── PricingForm.tsx
│   └── PricingResult.tsx
├── pages/              # الصفحات
│   └── CarPricingPage.tsx
├── services/           # الخدمات
│   ├── pricing-ai.service.ts      # Gemini AI
│   ├── market-scraper.service.ts  # Web Scraping
│   └── price-calculator.service.ts # حساب السعر
├── hooks/              # React Hooks
│   └── usePricing.ts
├── types/              # TypeScript Types
│   └── pricing.types.ts
├── config/             # الإعدادات
│   └── bulgarian-sources.config.ts
├── utils/              # الأدوات
│   ├── price-formatters.ts
│   └── validation.ts
├── index.ts            # التصديرات
└── README.md           # التوثيق الكامل
```

---

## 🔑 المفاتيح المطلوبة

### Google Gemini API

1. اذهب إلى: https://makersuite.google.com/app/apikey
2. أنشئ API Key
3. أضفه إلى `.env`:
   ```
   REACT_APP_GEMINI_API_KEY=AIzaSy...
   ```

---

## 🎯 الميزات

✅ **تحليل AI ذكي** - استخدام Gemini 2.5 Flash  
✅ **بحث في السوق البلغاري** - 6 مواقع رئيسية  
✅ **حساب دقيق للسعر** - Low/Average/High  
✅ **واجهة احترافية** - React + TypeScript  
✅ **متوافق مع المشروع** - نفس التقنيات والمعايير  

---

## 📚 التوثيق

- **README.md** - التوثيق الكامل
- **INTEGRATION_GUIDE.md** - دليل التكامل التفصيلي
- **DEPLOYMENT_GUIDE.md** - دليل النشر
- **IMPLEMENTATION_PLAN.md** - خطة التنفيذ

---

## ⚠️ ملاحظات

1. **Web Scraping**: حالياً يستخدم Mock Data. للـ Production، يجب إعداد Cloud Functions.

2. **API Limits**: Gemini API له حدود استخدام. راقب الاستخدام.

3. **Caching**: النتائج محفوظة لمدة 24 ساعة.

---

## 🐛 حل المشاكل

### "Gemini API not configured"
→ أضف `REACT_APP_GEMINI_API_KEY` إلى `.env`

### "Module not found"
→ تحقق من مسارات Imports

### "Route not found"
→ تأكد من إضافة Route في `MainRoutes.tsx`

---

**جاهز للاستخدام! 🚀**
