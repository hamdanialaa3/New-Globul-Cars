# 🚀 دليل البدء السريع - SEO

## خطوات سريعة لتحسين SEO في 10 دقائق

### الخطوة 1️⃣ : توليد Sitemap

```bash
cd c:\Users\hamda\Desktop\Koli_One_Root
node scripts/generate-sitemap.js
```

✅ هذا سينشئ:
- `public/sitemap.xml`
- `public/robots.txt`

---

### الخطوة 2️⃣ : إضافة Web Vitals Monitoring

**في `src/App.tsx`:**

```tsx
import { useWebVitals } from '@/hooks/useWebVitals';

function App() {
  useWebVitals(); // ✅ أضف هذا السطر
  
  return (
    // باقي الكود
  );
}
```

---

### الخطوة 3️⃣ : إضافة SEOHelmet في صفحة رئيسية

**في `src/pages/01_main-pages/home/HomePage.tsx`:**

```tsx
import SEOHelmet from '@/utils/seo/SEOHelmet';
import { generateOrganizationSchema, generateWebSiteSchema, combineSchemas } from '@/utils/seo/schemas';

function HomePage() {
  const schemas = combineSchemas(
    generateOrganizationSchema(),
    generateWebSiteSchema()
  );
  
  return (
    <>
      <SEOHelmet
        title="Koli One - أفضل موقع لشراء وبيع السيارات في بلغاريا"
        description="اكتشف آلاف السيارات الجديدة والمستعملة بأفضل الأسعار في بلغاريا."
        keywords={['سيارات', 'بلغاريا', 'شراء سيارة', 'سيارات مستعملة']}
        schema={schemas}
      />
      
      {/* باقي الصفحة */}
    </>
  );
}
```

---

### الخطوة 4️⃣ : إضافة RedirectManager

**في `src/AppRoutes.tsx` في النهاية:**

```tsx
import { RedirectManager } from '@/components/SEO/RedirectManager';

<Routes>
  {/* جميع المسارات الموجودة */}
  
  {/* **آخر مسار** - للتعامل مع 404 و Redirects */}
  <Route path="*" element={<RedirectManager />} />
</Routes>
```

---

### الخطوة 5️⃣ : استبدال صورة واحدة بـ LazyImage (كاختبار)

**اختر أي صفحة بها صورة:**

**قبل:**
```tsx
<img src="/images/car.jpg" alt="Car" />
```

**بعد:**
```tsx
import LazyImage from '@/components/SEO/LazyImage';

<LazyImage
  src="/images/car.jpg"
  alt="BMW X5 2024"
  width={800}
  height={600}
  priority={false}
/>
```

---

### الخطوة 6️⃣ : اختبار في المتصفح

1. **شغّل السيرفر:**
```bash
npm start
```

2. **افتح Console في Chrome (F12)**

3. **يجب أن ترى:**
```
✅ [Web Vital] LCP: 1850ms (good)
✅ [Web Vital] FID: 45ms (good)
✅ [Web Vital] CLS: 0.08 (good)
```

---

### الخطوة 7️⃣ : اختبار Lighthouse

1. **في Chrome:**
   - Right-click → Inspect → Lighthouse
   - اختر "Performance" و "SEO"
   - اضغط "Generate Report"

2. **يجب أن تحصل على:**
   - Performance: 90+ ✅
   - SEO: 95+ ✅

---

### الخطوة 8️⃣ : رفع Sitemap إلى Google

1. **اذهب إلى:**
   https://search.google.com/search-console

2. **أضف موقعك:**
   `https://koli.one`

3. **أضف Sitemap:**
   - اذهب إلى "Sitemaps"
   - أضف: `https://koli.one/sitemap.xml`
   - اضغط "Submit"

---

## ✅ تم! الآن موقعك محسّن لمحركات البحث

### الخطوات التالية (اختيارية):

- [ ] أضف Schema Markup في صفحة تفاصيل السيارة
- [ ] استبدل باقي الصور بـ LazyImage
- [ ] أضف FAQ Schema في صفحة الأسئلة
- [ ] أضف Breadcrumb Schema في الصفحات الداخلية

---

## 📚 للمزيد من التفاصيل:

- [دليل SEO الكامل](./SEO-GUIDE.md)
- [أمثلة عملية](../../src/examples/SEO-Examples.tsx)
- [تحسينات Core Web Vitals](./performance-optimization.md)

---

## 🆘 مشاكل شائعة:

### المشكلة: Web Vitals لا تظهر في Console

**الحل:**
```tsx
// تأكد من إضافة useWebVitals في App.tsx
import { useWebVitals } from '@/hooks/useWebVitals';

function App() {
  useWebVitals(); // ✅
  // ...
}
```

### المشكلة: Sitemap فارغ

**الحل:**
```bash
# تأكد من وجود serviceAccountKey.json
node scripts/generate-sitemap.js
```

### المشكلة: 404 Page لا تعمل

**الحل:**
```tsx
// تأكد أن RedirectManager في **آخر** Route
<Route path="*" element={<RedirectManager />} />
```

---

✅ **أي سؤال؟ تحقق من الأمثلة في `src/examples/SEO-Examples.tsx`**
