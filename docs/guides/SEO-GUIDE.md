# دليل تحسين محركات البحث (SEO) - Koli One

## 📚 جدول المحتويات

1. [Sitemap (خريطة الموقع)](#1-sitemap)
2. [Meta Tags الديناميكية](#2-meta-tags)
3. [Schema Markup (البيانات المنظمة)](#3-schema-markup)
4. [Core Web Vitals (تحسين الأداء)](#4-core-web-vitals)
5. [404 & Redirects](#5-404--redirects)
6. [robots.txt](#6-robotstxt)

---

## 1. Sitemap (خريطة الموقع)

### ✅ ما تم إنجازه

**الملف:** `scripts/generate-sitemap.js`

### 📝 كيفية الاستخدام

#### توليد Sitemap جديد:

```bash
cd c:\Users\hamda\Desktop\Koli_One_Root
node scripts/generate-sitemap.js
```

#### ما يفعله:

1. يقرأ جميع السيارات من Firestore (status = 'approved')
2. يقرأ جميع الدلرز من Firestore
3. يضيف جميع الصفحات الثابتة
4. يولد ملف `public/sitemap.xml`
5. يولد ملف `public/robots.txt`

#### إضافة صفحات جديدة:

**في `scripts/generate-sitemap.js`:**

```javascript
const STATIC_PAGES = [
  // ... الصفحات الموجودة
  
  // أضف صفحتك هنا:
  { 
    url: '/your-new-page', 
    priority: 0.7,        // من 0.0 إلى 1.0
    changefreq: 'weekly', // 'always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'
    langs: ['bg', 'en']   // اللغات المدعومة
  },
];
```

#### جدولة التوليد التلقائي:

**إضافة script في `package.json`:**

```json
{
  "scripts": {
    "generate-sitemap": "node scripts/generate-sitemap.js",
    "prebuild": "npm run generate-sitemap"
  }
}
```

الآن سيتم توليد sitemap تلقائياً قبل كل build!

### 🔗 الروابط المهمة:

- **Sitemap:** https://koli.one/sitemap.xml
- **Google Search Console:** https://search.google.com/search-console
  - أضف sitemap هناك: `https://koli.one/sitemap.xml`

---

## 2. Meta Tags الديناميكية

### ✅ ما تم إنجازه

**الملف:** `src/utils/seo/SEOHelmet.tsx`

### 📝 كيفية الاستخدام

#### مثال بسيط:

```tsx
import SEOHelmet from '@/utils/seo/SEOHelmet';

function HomePage() {
  return (
    <>
      <SEOHelmet
        title="أفضل موقع لشراء السيارات في بلغاريا"
        description="اكتشف آلاف السيارات الجديدة والمستعملة بأفضل الأسعار في بلغاريا على Koli One"
        keywords={['سيارات', 'بلغاريا', 'شراء سيارة', 'سيارات مستعملة']}
      />
      
      {/* باقي المحتوى */}
    </>
  );
}
```

#### مثال متقدم (صفحة تفاصيل السيارة):

```tsx
import SEOHelmet from '@/utils/seo/SEOHelmet';
import { generateCarProductSchema } from '@/utils/seo/schemas';

function CarDetailsPage({ car }) {
  const schema = generateCarProductSchema({
    id: car.id,
    name: `${car.brand} ${car.model} ${car.year}`,
    description: car.description,
    price: car.price,
    currency: 'BGN',
    image: car.images,
    brand: car.brand,
    model: car.model,
    year: car.year,
    mileage: car.mileage,
    fuelType: car.fuelType,
    transmission: car.transmission,
    condition: 'used',
    availability: 'in stock',
    seller: {
      name: car.seller?.name || 'Koli One',
      url: `/dealer/${car.sellerId}`
    }
  });

  return (
    <>
      <SEOHelmet
        title={`${car.brand} ${car.model} ${car.year} - ${car.price} BGN`}
        description={car.description}
        keywords={[car.brand, car.model, car.year.toString(), 'شراء', 'سيارة']}
        ogType="product"
        ogImage={car.images[0]}
        ogImageAlt={`${car.brand} ${car.model} ${car.year}`}
        schema={schema}
        product={{
          price: car.price,
          currency: 'BGN',
          availability: 'in stock'
        }}
      />
      
      {/* باقي المحتوى */}
    </>
  );
}
```

#### مثال مقال (Blog):

```tsx
import SEOHelmet from '@/utils/seo/SEOHelmet';
import { generateArticleSchema } from '@/utils/seo/schemas';

function BlogPostPage({ post }) {
  const schema = generateArticleSchema({
    title: post.title,
    description: post.excerpt,
    image: post.coverImage,
    author: post.author,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    url: `https://koli.one/blog/${post.slug}`
  });

  return (
    <>
      <SEOHelmet
        title={post.title}
        description={post.excerpt}
        keywords={post.tags}
        ogType="article"
        ogImage={post.coverImage}
        schema={schema}
        article={{
          publishedTime: post.createdAt,
          modifiedTime: post.updatedAt,
          author: post.author
        }}
      />
      
      {/* باقي المحتوى */}
    </>
  );
}
```

### 📋 جميع الخصائص المتاحة:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `title` | string | ✅ | عنوان الصفحة |
| `description` | string | ✅ | وصف الصفحة (160 حرف max) |
| `keywords` | string[] | ❌ | كلمات مفتاحية |
| `canonical` | string | ❌ | URL الأساسي |
| `noindex` | boolean | ❌ | منع الأرشفة |
| `ogType` | string | ❌ | نوع OpenGraph |
| `ogImage` | string | ❌ | صورة للمشاركة |
| `ogImageAlt` | string | ❌ | وصف الصورة |
| `twitterCard` | string | ❌ | نوع بطاقة Twitter |
| `schema` | object | ❌ | JSON-LD Schema |
| `alternateLanguages` | object | ❌ | روابط اللغات البديلة |

---

## 3. Schema Markup (البيانات المنظمة)

### ✅ ما تم إنجازه

**الملف:** `src/utils/seo/schemas.tsx`

### 📝 أنواع Schema المتاحة:

#### 1. Organization Schema (للموقع ككل)

```tsx
import { generateOrganizationSchema } from '@/utils/seo/schemas';

// في Layout أو Home:
const schema = generateOrganizationSchema();

<SEOHelmet
  title="Koli One"
  description="..."
  schema={schema}
/>
```

#### 2. WebSite Schema (مع خاصية البحث)

```tsx
import { generateWebSiteSchema } from '@/utils/seo/schemas';

const schema = generateWebSiteSchema();

<SEOHelmet schema={schema} />
```

**النتيجة:** صندوق بحث في نتائج Google! 🔍

#### 3. Product Schema (للسيارات)

```tsx
import { generateCarProductSchema } from '@/utils/seo/schemas';

const carSchema = generateCarProductSchema({
  id: '123',
  name: 'BMW X5 2024',
  description: 'سيارة فخمة...',
  price: 45000,
  currency: 'BGN',
  image: ['https://koli.one/images/car1.jpg'],
  brand: 'BMW',
  model: 'X5',
  year: 2024,
  mileage: 25000,
  fuelType: 'Diesel',
  transmission: 'Automatic',
  condition: 'used',
  availability: 'in stock'
});

<SEOHelmet schema={carSchema} />
```

**النتيجة:** نجوم التقييم والسعر في نتائج البحث! ⭐

#### 4. FAQ Schema (للأسئلة الشائعة)

```tsx
import { generateFAQSchema } from '@/utils/seo/schemas';

const faqSchema = generateFAQSchema([
  {
    question: 'كم تكلفة الإعلان؟',
    answer: 'الإعلانات مجانية للأفراد، وتبدأ من 10 BGN للدلرز.'
  },
  {
    question: 'كيف أشتري سيارة؟',
    answer: 'ابحث عن السيارة، تواصل مع البائع، اتفق على السعر!'
  }
]);

<SEOHelmet schema={faqSchema} />
```

**النتيجة:** قائمة الأسئلة المنسدلة في Google! 📋

#### 5. Breadcrumb Schema (مسار التنقل)

```tsx
import { generateBreadcrumbSchema } from '@/utils/seo/schemas';

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: 'الرئيسية', url: 'https://koli.one/' },
  { name: 'السيارات', url: 'https://koli.one/cars' },
  { name: 'BMW', url: 'https://koli.one/cars/bmw' },
  { name: 'X5', url: 'https://koli.one/car/123' }
]);

<SEOHelmet schema={breadcrumbSchema} />
```

#### 6. Schema متعدد (دمج أكثر من schema)

```tsx
import { 
  combineSchemas, 
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateCarProductSchema 
} from '@/utils/seo/schemas';

const schemas = combineSchemas(
  generateOrganizationSchema(),
  generateWebSiteSchema(),
  generateCarProductSchema(car)
);

<SEOHelmet schema={schemas} />
```

---

## 4. Core Web Vitals (تحسين الأداء)

### ✅ ما تم إنجازه

**الملفات:**
- `src/components/SEO/LazyImage.tsx`
- `src/hooks/useWebVitals.ts`

### 📝 كيفية الاستخدام

#### 1. استبدال الصور بـ LazyImage

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
  priority={false} // false = lazy load
/>
```

#### 2. صور فوق الطية (Above the Fold)

```tsx
// Hero image - يجب أن يتم تحميلها فوراً
<LazyImage
  src="/images/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority={true} // ⚠️ true = تحميل فوري
/>
```

#### 3. مراقبة الأداء

**في `App.tsx` أو `MainLayout.tsx`:**

```tsx
import { useWebVitals } from '@/hooks/useWebVitals';

function App() {
  useWebVitals(); // يبدأ المراقبة تلقائياً
  
  return (
    // ...
  );
}
```

**النتيجة في Console:**
```
✅ [Web Vital] LCP: 1850ms (good)
✅ [Web Vital] FID: 45ms (good)
⚠️ [Web Vital] CLS: 0.15 (needs-improvement)
```

### 📊 مقاييس الأداء المستهدفة:

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** | < 2.5s | 2.5s - 4.0s | > 4.0s |
| **FID** | < 100ms | 100ms - 300ms | > 300ms |
| **CLS** | < 0.1 | 0.1 - 0.25 | > 0.25 |

**اقرأ المزيد:** [docs/guides/performance-optimization.md](../guides/performance-optimization.md)

---

## 5. 404 & Redirects

### ✅ ما تم إنجازه

**الملف:** `src/components/SEO/RedirectManager.tsx`

### 📝 كيفية الاستخدام

#### 1. إضافة Redirect جديد

**في `RedirectManager.tsx`:**

```tsx
const REDIRECT_RULES: Record<string, string> = {
  // قديم -> جديد
  '/old-cars': '/cars',
  '/contact-us': '/contact',
  
  // أضف redirects هنا:
  '/automobiles': '/cars',
  '/sell-your-car': '/sell',
};
```

#### 2. Redirects بـ Pattern (Regex)

```tsx
const PATTERN_REDIRECTS = [
  // إزالة trailing slash
  { 
    pattern: /^\/blog\/([^/]+)\/$/, 
    replacement: '/blog/$1' 
  },
  
  // أضف pattern جديد:
  {
    pattern: /^\/cars\/brand-(\w+)$/,
    replacement: '/cars?brand=$1'
  }
];
```

#### 3. تفعيل RedirectManager

**في `AppRoutes.tsx`:**

```tsx
import { RedirectManager } from '@/components/SEO/RedirectManager';

<Routes>
  {/* جميع الصفحات الموجودة */}
  
  {/* في النهاية - للتعامل مع 404 و Redirects */}
  <Route path="*" element={<RedirectManager />} />
</Routes>
```

### 🎨 تخصيص صفحة 404

**عدّل في `RedirectManager.tsx` - NotFoundPage:**

```tsx
const NotFoundPage: React.FC = () => {
  return (
    <NotFoundContainer>
      <ErrorCode>404</ErrorCode>
      <ErrorTitle>الصفحة غير موجودة</ErrorTitle>
      <ErrorMessage>
        نص مخصص هنا...
      </ErrorMessage>
      
      {/* أزرار مخصصة */}
    </NotFoundContainer>
  );
};
```

---

## 6. robots.txt

### ✅ ما تم إنجازه

**الموقع:** `public/robots.txt` (يتم توليده تلقائياً)

### 📝 المحتوى الحالي:

```txt
# Koli One - Bulgarian Car Marketplace

User-agent: *
Allow: /
Allow: /search
Allow: /cars
Allow: /bmw-*
Allow: /audi-*

# Block private pages
Disallow: /admin
Disallow: /dashboard
Disallow: /messages
Disallow: /api

# Block duplicate content
Disallow: /*?*utm_*
Disallow: /*?*fbclid=*

# Sitemap
Sitemap: https://koli.one/sitemap.xml
```

### 📝 كيفية التعديل

**في `scripts/generate-sitemap.js`:**

```javascript
function generateRobotsTxt() {
  const robotsTxt = `# Koli One
User-agent: *
Allow: /

# أضف قواعد جديدة هنا:
Disallow: /your-private-page

Sitemap: ${BASE_URL}/sitemap.xml
`;
  // ...
}
```

---

## 📋 Checklist النهائي

### مهام إلزامية:

- [ ] **1. توليد Sitemap:** `node scripts/generate-sitemap.js`
- [ ] **2. إضافة SEOHelmet في كل صفحة**
- [ ] **3. إضافة Schema Markup المناسب**
- [ ] **4. استبدال `<img>` بـ `<LazyImage>`**
- [ ] **5. إضافة Web Vitals monitoring:** `useWebVitals()`
- [ ] **6. إضافة RedirectManager في AppRoutes**
- [ ] **7. رفع sitemap.xml إلى Google Search Console**

### مهام اختيارية (محسنة):

- [ ] إضافة FAQ Schema في صفحة الأسئلة
- [ ] إضافة Breadcrumb Schema
- [ ] ضغط الصور إلى WebP
- [ ] Preload الخطوط المهمة
- [ ] إضافة canonical URLs لتجنب Duplicate Content

---

## 🔗 روابط مفيدة

### أدوات الاختبار:

1. **Google PageSpeed Insights**
   - https://pagespeed.web.dev/
   
2. **Google Search Console**
   - https://search.google.com/search-console

3. **Rich Results Test**
   - https://search.google.com/test/rich-results
   
4. **Schema Validator**
   - https://validator.schema.org/

5. **Web Vitals Chrome Extension**
   - https://chrome.google.com/webstore/detail/web-vitals

### توثيق Schema:

- https://schema.org/
- https://developers.google.com/search/docs/appearance/structured-data/search-gallery

---

## 🆘 الدعم

إذا واجهت مشاكل:

1. **Console Errors:** افتح Developer Tools → Console
2. **Lighthouse:** Right-click → Inspect → Lighthouse → Generate Report
3. **Web Vitals:** تحقق من الـ console logs بعد إضافة `useWebVitals()`

---

✅ **جميع الأدوات جاهزة! ابدأ بتطبيقها الآن!** 🚀
