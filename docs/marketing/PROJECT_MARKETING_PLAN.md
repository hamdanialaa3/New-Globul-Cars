# 📊 خطة التسويق الرقمي الشاملة - Koli One

## استراتيجية الهيمنة على نتائج Google في بلغاريا وأوروبا

---

## 🎯 الهدف الاستراتيجي

السيطرة على نتائج بحث Google وجعل مشروع Koli One يظهر "في كل مكان" (Search, Maps, Images, Discover, Shopping) عبر استراتيجية تقنية شاملة.

**الحالة الحالية للمشروع:**

- ✅ Numeric URL System (`/car/:sellerNumericId/:carNumericId`) - **مكتمل 100%**
- ✅ SEO Utilities موجودة (`src/utils/seo.ts`) - **مكتمل جزئياً (يحتاج تطبيق)**
- ✅ Sitemap Generator موجود (`src/utils/sitemap-generator.ts`) - **يحتاج Cloud Function**
- ⚠️ Structured Data (JSON-LD) - **موجود لكن غير مستخدم في CarDetailsPage**
- ❌ Google Merchant Center Feed - **غير موجود**
- ❌ Image Optimization (WebP + Smart Naming) - **غير موجود**
- ❌ Server-Side Rendering (SSR) - **غير موجود**

---

## 📋 الخطة التنفيذية (5 ركائز أساسية)

### 🚀 أولوية التنفيذ السريعة (قبل أي شيء آخر)

- ⬤ CarSEO: تركيب `react-helmet-async` + مكون CarSEO + تطبيقه في `CarDetailsPage` مع روابط رقمية وصورة افتراضية و JSON-LD/OG/Twitter.
- ⬤ Sitemap: تحديث المولد لاستخدام الروابط الرقمية + دالة Functions + إعادة كتابة `/sitemap.xml` (baseUrl من متغير بيئة).
- ⬤ Merchant Feed: فلترة صارمة (status=isActive/active، price>0) + حدود للعدد + baseUrl من الإعدادات.
- ⬤ Image Optimizer: حواجز أمان (نوع، حجم، عدم إعادة المعالجة) + ترك alt/naming لمرحلة لاحقة.

---

## 🏗️ الركيزة 1: التحدث بـ "لغة Google" (Structured Data & Schema)

**الأولوية:** 🔴 عاجل | **التأثير:** عالي | **الوقت المتوقع:** 2-3 أيام

### الوضع الحالي:

- ✅ يوجد `src/utils/seo.ts` مع `generateCarStructuredData()` - **جاهز للاستخدام**
- ❌ غير مستخدم في `CarDetailsPage.tsx`
- ❌ لا يوجد مكون `CarSEO.tsx` كما اقترح Gemini

### المهام المطلوبة:

#### 1.1 إنشاء مكون CarSEO Component

**الملف:** `src/components/seo/CarSEO.tsx`

**المتطلبات:**

- استخدام `react-helmet-async` (تثبيت: `npm install react-helmet-async`; إضافة `HelmetProvider` في الجذر إذا لزم)
- استيراد `generateCarStructuredData` من `src/utils/seo.ts`
- إضافة Open Graph tags للمشاركة الاجتماعية
- إضافة Twitter Cards
- **⚠️ مهم:** التأكد من وجود صورة افتراضية في `public/default-car-image.webp` واستخدامها عند غياب الصور
- ضبط `baseUrl` من متغير بيئة عام (مثل `VITE_PUBLIC_BASE_URL`) بدل القيم الصلبة

**الكود المقترح:**

```typescript
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { UnifiedCar } from '../../services/car/unified-car-types';
import { generateCarStructuredData, generateCarMetaTags } from '../../utils/seo';
import { getCarDetailsUrl } from '../../utils/routing-utils';

interface CarSEOProps {
  car: UnifiedCar;
}

export const CarSEO: React.FC<CarSEOProps> = ({ car }) => {
  const structuredData = generateCarStructuredData(car);
  const metaTags = generateCarMetaTags(car);
  const carUrl = getCarDetailsUrl(car);

  // تحسين: التحقق من وجود الصور مع صورة افتراضية
  const getImageUrl = (): string => {
    if (car.images && car.images.length > 0 && car.images[0]) {
      return car.images[0];
    }
    if (car.mainImage) {
      return car.mainImage;
    }
    // صورة افتراضية موجودة في public/
    return '/default-car-image.webp';
  };

  const imageUrl = getImageUrl();

  return (
    <Helmet>
      <title>{metaTags.title}</title>
      <meta name="description" content={metaTags.description} />
      <meta name="keywords" content={metaTags.keywords} />

      {/* Open Graph */}
      <meta property="og:title" content={metaTags.og.title} />
      <meta property="og:description" content={metaTags.og.description} />
      <meta property="og:image" content={metaTags.og.image} />
      <meta property="og:url" content={metaTags.og.url} />
      <meta property="og:type" content="product" />
      <meta property="og:price:amount" content={car.price?.toString()} />
      <meta property="og:price:currency" content="EUR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTags.twitter.title} />
      <meta name="twitter:description" content={metaTags.twitter.description} />
      <meta name="twitter:image" content={metaTags.twitter.image} />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};
```

#### 1.2 تطبيق CarSEO في CarDetailsPage

**الملف:** `src/pages/01_main-pages/CarDetailsPage.tsx`

**التعديل المطلوب:**

```typescript
import { CarSEO } from '../../components/seo/CarSEO';

// داخل return:
{car && <CarSEO car={car} />}
```

#### 1.3 تحديث generateCarStructuredData لاستخدام Numeric URLs

**الملف:** `src/utils/seo.ts`

**التعديل المطلوب:**

- تحديث `generateCarStructuredData` لاستخدام `getCarDetailsUrl(car)` بدلاً من `/cars/${car.id}` (مع `baseUrl` من الإعدادات)
- إضافة `vehicleIdentificationNumber` (VIN) إذا كان متوفراً
- التحقق من توفر صورة صالحة وإلا استخدام صورة افتراضية

---

## 🗺️ الركيزة 2: خريطة الموقع الديناميكية (Dynamic Sitemap)

**الأولوية:** 🟡 متوسط | **التأثير:** عالي | **الوقت المتوقع:** 1-2 أيام

### الوضع الحالي:

- ✅ يوجد `src/utils/sitemap-generator.ts` - **جاهز**
- ❌ لا يوجد Cloud Function لخدمة sitemap.xml
- ❌ Sitemap يستخدم `/car/${doc.id}` بدلاً من Numeric URLs

### المهام المطلوبة:

#### 2.1 تحديث Sitemap Generator لاستخدام Numeric URLs

**الملف:** `src/utils/sitemap-generator.ts`

**التعديل المطلوب:**

```typescript
// في generateCarListingsSitemap:
return {
  loc:
    data.sellerNumericId && data.carNumericId
      ? `${baseUrl}/car/${data.sellerNumericId}/${data.carNumericId}`
      : `${baseUrl}/car/${doc.id}`, // Fallback للسيارات القديمة
  lastmod: lastmod.split('T')[0],
  changefreq: 'daily',
  priority: 0.8,
};
```

- اجعل `baseUrl` قادماً من الإعدادات/البيئة، وأضف تسجيلًا للعدد والزمن لمعرفة أي فشل مبكر.
- أضف حداً للدفعات أو الصفحات إذا تجاوزت النتائج 50k رابط.

#### 2.2 إنشاء Cloud Function لخدمة Sitemap

**الملف:** `functions/src/sitemap.ts`

**⚠️ ملاحظات مهمة:**

- ضبط الذاكرة (Memory Allocation) للدالة إذا كان عدد السيارات كبيراً جداً
- إضافة timeout مناسب لتجنب أخطاء Out of Memory

**الكود المقترح:**

```typescript
import * as functions from 'firebase-functions';
import { generateCompleteSitemap } from '../../src/utils/sitemap-generator';

export const sitemap = functions
  .runWith({
    memory: '512MB', // أو '1GB' إذا كان عدد السيارات > 1000
    timeoutSeconds: 60,
  })
  .https.onRequest(async (req, res) => {
    try {
      const baseUrl = 'https://koli.one'; // أو globulcars.bg
      const xml = await generateCompleteSitemap(baseUrl);

      res.set('Content-Type', 'application/xml');
      res.set('Cache-Control', 'public, max-age=3600'); // Cache 1 hour
      res.status(200).send(xml);
    } catch (error) {
      console.error('Sitemap generation error:', error);
      res.status(500).send('Error generating sitemap');
    }
  });
```

#### 2.3 إضافة Rewrite Rule في firebase.json

**الملف:** `firebase.json`

**التعديل المطلوب:**

```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "/sitemap.xml",
        "function": "sitemap"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

#### 2.4 تقديم Sitemap لـ Google Search Console

**خطوات يدوية:**

1. رفع التعديلات: `firebase deploy --only functions,hosting`
2. التحقق من الرابط: `https://koli.one/sitemap.xml`
3. إضافة في Google Search Console > Sitemaps > `sitemap.xml`

---

## 🛒 الركيزة 3: التكامل مع Google Merchant Center

**الأولوية:** 🟢 متقدم | **التأثير:** عالي جداً | **الوقت المتوقع:** 3-4 أيام

### الوضع الحالي:

- ❌ لا يوجد Google Merchant Center Feed
- ❌ لا يوجد Cloud Function لتوليد Product Feed

### المهام المطلوبة:

#### 3.1 إنشاء Google Merchant Feed Generator

**الملف:** `functions/src/merchantFeed.ts`

**⚠️ ملاحظات مهمة:**

- ضبط الذاكرة والـ timeout للتعامل مع عدد كبير من المنتجات
- التأكد من تطابق اسم الدالة مع `firebase.json`
- استخدام `baseUrl` من متغير بيئة عام (Functions config) بدل القيمة الصلبة
- فلترة صارمة: `status === 'active'` و `isActive === true` و `price > 0`، وحد أقصى (مثلاً 500) مع إمكانية ترقيم الصفحات لاحقاً
- حماية ضد الحقول الفارغة: صورة افتراضية، عملة افتراضية `EUR`

**الكود المقترح:**

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export const googleMerchantFeed = functions
  .runWith({
    memory: '512MB', // أو '1GB' إذا كان عدد السيارات > 500
    timeoutSeconds: 60,
  })
  .https.onRequest(async (req, res) => {
    try {
      const baseUrl = 'https://koli.one';

      // جلب السيارات النشطة فقط
      const carsRef = db
        .collection('cars')
        .where('status', '==', 'active')
        .limit(500); // Google limit

      const snapshot = await carsRef.get();

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>Koli One - Used Cars Bulgaria</title>
  <link>${baseUrl}</link>
  <description>Premium Used Cars Marketplace in Bulgaria</description>`;

      snapshot.docs.forEach(doc => {
        const car = doc.data();

        if (car.sellerNumericId && car.carNumericId && car.price) {
          const productUrl = `${baseUrl}/car/${car.sellerNumericId}/${car.carNumericId}`;
          const imageUrl = car.images?.[0] || car.mainImage || '';
          const description = car.description
            ? car.description.replace(/<[^>]*>?/gm, '').substring(0, 5000)
            : `${car.make} ${car.model} ${car.year}`;

          xml += `
  <item>
    <g:id>${doc.id}</g:id>
    <g:title><![CDATA[${car.make} ${car.model} ${car.year} - ${car.fuelType || 'N/A'}]]></g:title>
    <g:description><![CDATA[${description}]]></g:description>
    <g:link>${productUrl}</g:link>
    <g:image_link>${imageUrl}</g:image_link>
    <g:condition>used</g:condition>
    <g:price>${car.price} ${car.currency || 'EUR'}</g:price>
    <g:availability>${car.isSold ? 'out_of_stock' : 'in_stock'}</g:availability>
    <g:brand>${car.make}</g:brand>
    <g:google_product_category>Vehicles &gt; Cars</g:google_product_category>
    <g:vehicle_type>car</g:vehicle_type>
    <g:year>${car.year}</g:year>
    ${car.mileage ? `<g:mileage>${car.mileage} km</g:mileage>` : ''}
    ${car.transmission ? `<g:transmission>${car.transmission}</g:transmission>` : ''}
    ${car.color ? `<g:color>${car.color}</g:color>` : ''}
  </item>`;
        }
      });

      xml += `
</channel>
</rss>`;

      res.set('Content-Type', 'application/xml');
      res.set('Cache-Control', 'public, max-age=3600');
      res.status(200).send(xml);
    } catch (error) {
      console.error('Merchant Feed Error:', error);
      res.status(500).send('Error generating feed');
    }
  });
```

#### 3.2 إضافة Rewrite Rule في firebase.json

```json
{
  "source": "/feed/products.xml",
  "function": "googleMerchantFeed"
}
```

#### 3.3 إعداد Google Merchant Center (يدوي)

**خطوات:**

1. إنشاء حساب في [Google Merchant Center](https://merchants.google.com/)
2. تأكيد ملكية النطاق (koli.one)
3. Products > Feeds > Add Feed
4. النوع: Scheduled Fetch
5. الرابط: `https://koli.one/feed/products.xml`
6. التكرار: Daily

---

## 🖼️ الركيزة 4: هيمنة الصور (Image SEO & Optimization)

**الأولوية:** 🟡 متوسط | **التأثير:** متوسط-عالي | **الوقت المتوقع:** 4-5 أيام

### الوضع الحالي:

- ❌ لا يوجد تحويل تلقائي لـ WebP
- ❌ لا يوجد تسمية ذكية للصور
- ❌ لا يوجد Alt Text ديناميكي

### المهام المطلوبة:

#### 4.1 إنشاء Image Optimization Cloud Function

**الملف:** `functions/src/imageOptimizer.ts`

**المتطلبات:**

```bash
cd functions
npm install sharp fs-extra
```

**الكود المقترح:**

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs-extra';
import sharp from 'sharp';

const bucket = admin.storage().bucket();

export const optimizeImage = functions.storage
  .object()
  .onFinalize(async object => {
    const filePath = object.name;
    const fileName = path.basename(filePath!);

    // فحوصات الأمان
    if (!object.contentType?.startsWith('image/')) return;
    if (!filePath) return;
    if (fileName.includes('webp') || fileName.includes('optimized')) return;
    if (object.size && Number(object.size) > 10 * 1024 * 1024) return; // حد الحجم 10MB

    const workingDir = path.join(os.tmpdir(), 'image-optimization');
    const tempFilePath = path.join(workingDir, fileName);
    const newFileName = `${path.parse(fileName).name}.webp`;
    const tempNewPath = path.join(workingDir, newFileName);

    await fs.ensureDir(workingDir);

    try {
      // تحميل الملف الأصلي
      await bucket.file(filePath).download({ destination: tempFilePath });

      // تحويل لـ WebP + ضغط
      await sharp(tempFilePath)
        .webp({ quality: 80 })
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .toFile(tempNewPath);

      // رفع الصورة المحسنة
      const newFilePath = path.dirname(filePath) + '/' + newFileName;
      await bucket.upload(tempNewPath, {
        destination: newFilePath,
        metadata: {
          contentType: 'image/webp',
          metadata: { optimized: 'true', originalFile: filePath },
        },
      });

      // تحديث رابط الصورة في Firestore (اختياري ومشروط بضوابط مستقبلية)

      await fs.remove(workingDir);
      console.log(`✅ Image optimized: ${newFileName}`);
    } catch (error) {
      console.error('Image optimization error:', error);
      await fs.remove(workingDir);
    }
  });
```

#### 4.2 إضافة Smart Naming في Image Uploader

**الملف:** `src/services/car/image-upload.service.ts` أو مكون الرفع

**الكود المقترح:**

```typescript
const generateSEOFriendlyName = (
  file: File,
  car: { make: string; model: string; year: number; city?: string },
  index: number
): File => {
  const extension = file.name.split('.').pop();
  const make = car.make.toLowerCase().replace(/\s+/g, '-');
  const model = car.model.toLowerCase().replace(/\s+/g, '-');
  const city = car.city?.toLowerCase().replace(/\s+/g, '-') || 'bulgaria';

  const newName = `${make}-${model}-${car.year}-${city}-${String(index + 1).padStart(2, '0')}.${extension}`;

  return new File([file], newName, { type: file.type });
};
```

#### 4.3 إضافة Alt Text ديناميكي في CarImageGallery

**الملف:** `src/pages/01_main-pages/components/CarImageGallery.tsx`

**الكود المقترح:**

```typescript
const getAltText = (car: UnifiedCar, index: number): string => {
  const location = car.locationData?.cityName || car.city || 'България';
  const color = car.color || 'неизвестен цвят';

  return `${car.make} ${car.model} ${car.year} ${color} за продажба в ${location} - снимка ${index + 1}`;
};

// في JSX:
<img
  src={imageUrl}
  alt={getAltText(car, index)}
  loading="lazy"
/>
```

---

## ⚡ الركيزة 5: حل مشكلة React SSR (Server-Side Rendering)

**الأولوية:** 🔵 طويل المدى | **التأثير:** عالي جداً | **الوقت المتوقع:** 1-2 أسابيع

### الوضع الحالي:

- ❌ المشروع SPA (Single Page Application)
- ❌ Google قد يرى صفحة بيضاء قبل تحميل JavaScript

### الحلول المقترحة:

#### 5.1 الحل السريع: Prerendering Service

**الأداة:** [Prerender.io](https://prerender.io/) أو [BromBone](https://www.brombone.com/)

**التكلفة:** ~$10-50/شهر

**التنفيذ:**

1. إضافة middleware في `firebase.json`:

```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html",
        "headers": {
          "X-Prerender-Token": "YOUR_TOKEN"
        }
      }
    ]
  }
}
```

#### 5.2 الحل الجذري: Migration إلى Next.js

**الأولوية:** منخفضة (مشروع كبير)

**الفوائد:**

- SSR مدمج
- Image Optimization مدمج
- أفضل SEO
- أداء أفضل

**التكلفة:** إعادة هيكلة كبيرة (2-4 أسابيع)

---

## 📱 الركيزة 7: الإعلانات الذكية والخوارزميات العميقة (Smart Ads & Deep Learning)

**الأولوية:** 🔴 عاجل | **التأثير:** عالي جداً | **الوقت المتوقع:** 2-3 أسابيع

### الهدف الاستراتيجي:

الوصول إلى كل مستخدم Android و iOS في بلغاريا وأوروبا من خلال إعلانات ذكية مدعومة بخوارزميات عميقة للاستهداف الدقيق وتحسين الأداء التلقائي.

### الوضع الحالي:

- ❌ لا يوجد تكامل مع Google Ads
- ❌ لا يوجد تكامل مع Facebook/Instagram Ads
- ❌ لا يوجد تكامل مع TikTok Ads
- ❌ لا يوجد تكامل مع Apple Search Ads
- ❌ لا يوجد نظام Retargeting
- ❌ لا يوجد Machine Learning للاستهداف الذكي

### ضوابط أساسية قبل أي تكامل إعلاني

- الامتثال والخصوصية: تطبيق Consent Mode v2، و CMP ملائمة لـ GDPR/TTD، وعدم إرسال أي معرفات شخصية (PII) داخل الـ events أو الـ feeds.
- جودة البيانات: الاقتصار على السيارات `status=active` و `isActive=true` و `price>0`، وضبط العملة EUR وتوحيد المناطق.
- الروابط الرقمية: جميع الحملات والروابط العميقة تستخدم `/car/:sellerNumericId/:carNumericId` مع `baseUrl` من البيئة (prod/stage) لتجنّب كسر الروابط.
- الحوكمة المالية: سقوف إنفاق (daily cap) وخط أساس bid (Target CPA/ROAS) لا يتم رفعه إلا بعد تحقق تحويلات كافية (حد أدنى 30-50 تحويل لكل حملة).
- التسليم المرحلي: تشغيل أولي على نطاق صغير (حسابات/مناطق اختبار) ثم توسيع تدريجي بعد مراقبة KPIs (CPL، CPA، ROAS، CTR، CVR).

---

### 7.1 Google Ads Integration (Google Ads API)

#### 7.1.1 إعداد Google Ads Account

**المتطلبات:**

- إنشاء حساب Google Ads
- الحصول على Developer Token
- إعداد OAuth 2.0 credentials
- ربط مع Google Merchant Center (من الركيزة 3)

#### 7.1.2 Dynamic Search Ads (DSA)

**الملف:** `functions/src/google-ads-sync.ts`

**الوظيفة:** مزامنة تلقائية للسيارات النشطة مع Google Ads

**ضوابط:**

- `baseUrl` من الإعدادات (stage/prod) + روابط رقمية فقط.
- فلترة صارمة: `status='active'`, `isActive=true`, `price>0`, حد أقصى 1000/دفعة مع صفّية أو pagination.
- احترام قيود Google Ads API (rate limits) مع backoff وتسجيل الأخطاء الجزئية.
- لا تُرسل PII في الحقول الإعلانية (أسماء/هواتف/إيميلات). استخدم نصوص نظيفة مختصرة ووصف ≤ 80 حرف.

**الكود المقترح:**

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleAdsApi, Customer } from 'google-ads-api';

const client = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
});

export const syncCarsToGoogleAds = functions
  .runWith({ memory: '1GB', timeoutSeconds: 540 })
  .pubsub.schedule('every 6 hours')
  .onRun(async context => {
    try {
      const db = admin.firestore();
      const carsRef = db
        .collection('cars')
        .where('status', '==', 'active')
        .where('price', '>', 0)
        .limit(1000);

      const snapshot = await carsRef.get();
      const customer: Customer = await client.Customer({
        customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID!,
        refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
      });

      const ads = snapshot.docs.map(doc => {
        const car = doc.data();
        return {
          headline1: `${car.make} ${car.model} ${car.year}`,
          headline2: `${car.price.toLocaleString()} ${car.currency || 'EUR'}`,
          headline3: car.locationData?.cityName || 'Bulgaria',
          description:
            car.description?.substring(0, 80) ||
            `${car.make} ${car.model} للبيع`,
          finalUrl: `https://koli.one/car/${car.sellerNumericId}/${car.carNumericId}`,
          imageUrl: car.images?.[0] || car.mainImage,
        };
      });

      // إنشاء/تحديث الإعلانات في Google Ads
      await customer.adGroups.adGroupAds.create(ads);

      console.log(`✅ Synced ${ads.length} cars to Google Ads`);
    } catch (error) {
      console.error('Google Ads sync error:', error);
    }
  });
```

#### 7.1.3 Smart Bidding (Target CPA, Target ROAS)

**الإعداد:**

- استخدام Google Ads Smart Bidding algorithms
- Target CPA: 5-10 EUR per conversion
- Target ROAS: 300-400%
- استخدام Conversion Tracking من Firebase
- بدء Smart Bidding فقط بعد الوصول لعتبة تحويلات (≥30-50 خلال 30 يوم)؛ قبلها استخدم Manual CPC أو Max Clicks بحدود إنفاق يومية منخفضة.

#### 7.1.4 Google Shopping Ads

**الربط:**

- ربط Google Merchant Feed (من الركيزة 3) مع Google Ads
- إنشاء Shopping Campaigns تلقائياً
- استخدام Product Groups للاستهداف حسب: Make, Model, Price Range, Location
- تأكد من توافق الأسعار/العملة مع الـ feed (EUR)، والتحقق من الصور الصالحة، وتجنب رفض السياسات (مركبات = فئة خاصة).

---

### 7.2 Facebook & Instagram Ads Integration

#### 7.2.1 Facebook Marketing API

**الملف:** `functions/src/facebook-ads-sync.ts`

**المتطلبات:**

- Facebook App ID: `1780064479295175` (موجود في الذاكرة)
- Access Token من Facebook Business Manager
- Pixel ID للتتبع

**ضوابط:**

- لا ترسل PII داخل الكرياتيف أو الـ feed؛ التزم بالحقول المسموح بها (make/model/year/price/location عامة).
- استخدم Server-Side Events (CAPI) مع deduplication ID مطابق للويب (Pixel) لتفادي التكرار.
- حد أقصى للدفعات (batch) وتطبيق backoff/ retry للـ rate limits.
- استخدم الروابط الرقمية الموحدة + `baseUrl` من البيئة.

**الكود المقترح:**

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN!;
const FACEBOOK_PIXEL_ID = process.env.FACEBOOK_PIXEL_ID!;
const AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID!;

export const syncCarsToFacebookAds = functions
  .runWith({ memory: '1GB', timeoutSeconds: 540 })
  .pubsub.schedule('every 6 hours')
  .onRun(async context => {
    try {
      const db = admin.firestore();
      const carsRef = db
        .collection('cars')
        .where('status', '==', 'active')
        .where('price', '>', 0)
        .limit(100);

      const snapshot = await carsRef.get();

      for (const doc of snapshot.docs) {
        const car = doc.data();

        // إنشاء Product Catalog Item
        const catalogItem = {
          retailer_id: `${car.sellerNumericId}_${car.carNumericId}`,
          name: `${car.make} ${car.model} ${car.year}`,
          description: car.description?.substring(0, 5000) || '',
          image_url: car.images?.[0] || car.mainImage,
          price: car.price * 100, // بالـ cents
          currency: car.currency || 'EUR',
          availability: car.isSold ? 'out of stock' : 'in stock',
          url: `https://koli.one/car/${car.sellerNumericId}/${car.carNumericId}`,
          brand: car.make,
          category: 'Vehicles > Cars',
          condition: 'used',
        };

        await axios.post(
          `https://graph.facebook.com/v18.0/${process.env.FACEBOOK_CATALOG_ID}/products`,
          catalogItem,
          { params: { access_token: FACEBOOK_ACCESS_TOKEN } }
        );
      }

      console.log(`✅ Synced ${snapshot.docs.length} cars to Facebook Catalog`);
    } catch (error) {
      console.error('Facebook Ads sync error:', error);
    }
  });
```

#### 7.2.2 Dynamic Product Ads (DPA)

**الإعداد:**

- استخدام Facebook Dynamic Product Ads
- استهداف: Lookalike Audiences, Custom Audiences, Retargeting
- استخدام Facebook Pixel للتتبع والتحويل

#### 7.2.3 Instagram Shopping Ads

**الربط:**

- ربط Facebook Catalog مع Instagram Shopping
- إنشاء Instagram Shopping Tags تلقائياً
- استهداف مستخدمي Instagram في بلغاريا

---

### 7.3 TikTok Ads Integration

#### 7.3.1 TikTok Marketing API

**الملف:** `functions/src/tiktok-ads-sync.ts`

**المتطلبات:**

- TikTok Business Account
- TikTok Pixel للتتبع
- Access Token من TikTok Ads Manager

**ضوابط:**

- استخدام الروابط الرقمية مع `baseUrl` من البيئة، وعدم تمرير PII.
- فلترة المنتجات بنفس معايير الجودة (active/isActive/price>0) وحد أقصى للدفعات لتجنّب rate limits.
- استخدم Server-Side Events مع deduplication ID متوافق مع Web Pixel.
- مراجعة سياسة المركبات في TikTok لتفادي رفض المحتوى.

**الكود المقترح:**

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

const TIKTOK_ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN!;
const TIKTOK_ADVERTISER_ID = process.env.TIKTOK_ADVERTISER_ID!;

export const syncCarsToTikTokAds = functions
  .runWith({ memory: '512MB', timeoutSeconds: 300 })
  .pubsub.schedule('every 12 hours')
  .onRun(async context => {
    try {
      const db = admin.firestore();
      const carsRef = db
        .collection('cars')
        .where('status', '==', 'active')
        .where('price', '>', 0)
        .limit(50);

      const snapshot = await carsRef.get();

      const products = snapshot.docs.map(doc => {
        const car = doc.data();
        return {
          id: `${car.sellerNumericId}_${car.carNumericId}`,
          title: `${car.make} ${car.model} ${car.year}`,
          description: car.description?.substring(0, 200) || '',
          image_url: car.images?.[0] || car.mainImage,
          price: car.price,
          sale_price: car.price,
          currency: car.currency || 'EUR',
          availability: car.isSold ? 'out_of_stock' : 'in_stock',
          link: `https://koli.one/car/${car.sellerNumericId}/${car.carNumericId}`,
        };
      });

      await axios.post(
        `https://business-api.tiktok.com/open_api/v1.3/product/sync/`,
        { products },
        {
          headers: {
            'Access-Token': TIKTOK_ACCESS_TOKEN,
            'Content-Type': 'application/json',
          },
          params: {
            advertiser_id: TIKTOK_ADVERTISER_ID,
          },
        }
      );

      console.log(`✅ Synced ${products.length} cars to TikTok Catalog`);
    } catch (error) {
      console.error('TikTok Ads sync error:', error);
    }
  });
```

---

### 7.4 Apple Search Ads Integration

#### 7.4.1 Apple Search Ads API

**الملف:** `functions/src/apple-search-ads-sync.ts`

**المتطلبات:**

- Apple Search Ads Account
- API Key و Organization ID
- Campaign Group ID

**ضوابط:**

- الإطلاق فقط عند توفر تطبيق iOS أو تجربة PWA مقبولة عبر المتجر؛ خلاف ذلك التركيز على القنوات الأخرى أولاً.
- التزام سياسات الخصوصية في Apple وعدم تمرير أي PII؛ الاعتماد على معرّفات الإعلانات المسموح بها فقط.
- سقوف إنفاق منخفضة في البداية، مع مراقبة SKAdNetwork وربط أحداث Firebase/GA4 بخريطة تحويل واضحة.

**الكود المقترح:**

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

const APPLE_ORG_ID = process.env.APPLE_SEARCH_ADS_ORG_ID!;
const APPLE_API_KEY = process.env.APPLE_SEARCH_ADS_API_KEY!;

export const syncCarsToAppleSearchAds = functions
  .runWith({ memory: '512MB', timeoutSeconds: 300 })
  .pubsub.schedule('daily at 02:00')
  .onRun(async context => {
    try {
      const db = admin.firestore();
      const carsRef = db
        .collection('cars')
        .where('status', '==', 'active')
        .where('price', '>', 0)
        .limit(100);

      const snapshot = await carsRef.get();

      // Apple Search Ads يستخدم Keywords بدلاً من Product Feed
      const keywords = snapshot.docs.flatMap(doc => {
        const car = doc.data();
        return [
          `${car.make} ${car.model}`,
          `${car.make} ${car.model} ${car.year}`,
          `купувам ${car.make} ${car.model}`, // بلغاري
          `продавам ${car.make} ${car.model}`, // بلغاري
        ];
      });

      // إنشاء/تحديث Keywords في Campaign
      await axios.post(
        `https://api.searchads.apple.com/api/v4/campaigns/${process.env.APPLE_CAMPAIGN_ID}/keywords`,
        { keywords },
        {
          headers: {
            Authorization: `Bearer ${APPLE_API_KEY}`,
            'X-AP-Context': `orgId=${APPLE_ORG_ID}`,
          },
        }
      );

      console.log(`✅ Synced ${keywords.length} keywords to Apple Search Ads`);
    } catch (error) {
      console.error('Apple Search Ads sync error:', error);
    }
  });
```

---

### 7.5 Machine Learning & Deep Learning للاستهداف الذكي

#### 7.5.1 Predictive Audience Segmentation

**الملف:** `functions/src/ml-audience-segmentation.ts`

**الوظيفة:** استخدام ML لتقسيم الجمهور بناءً على:

- تاريخ البحث والتصفح
- الموقع الجغرافي
- السلوك الشرائي السابق
- التفاعل مع الإعلانات

**الكود المقترح:**

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { VertexAI } from '@google-cloud/vertexai';

const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID!,
  location: 'europe-west1',
});

export const generateMLAudiences = functions
  .runWith({ memory: '2GB', timeoutSeconds: 540 })
  .pubsub.schedule('daily at 03:00')
  .onRun(async context => {
    try {
      const db = admin.firestore();

      // جمع بيانات المستخدمين
      const usersRef = db.collection('users');
      const usersSnapshot = await usersSnapshot.get();

      const userData = usersSnapshot.docs.map(doc => ({
        userId: doc.id,
        searchHistory: doc.data().searchHistory || [],
        viewedCars: doc.data().viewedCars || [],
        location: doc.data().locationData,
        preferences: doc.data().preferences || {},
      }));

      // استخدام Vertex AI للتنبؤ
      const model = vertexAI.getGenerativeModel({
        model: 'gemini-pro',
      });

      const prompt = `
        Analyze user behavior data and segment users into:
        1. High-intent buyers (likely to purchase in 7 days)
        2. Medium-intent browsers (likely to purchase in 30 days)
        3. Low-intent researchers (just browsing)
        
        User data: ${JSON.stringify(userData)}
      `;

      const result = await model.generateContent(prompt);
      const segments = JSON.parse(result.response.text());

      // حفظ التقسيمات في Firestore
      for (const segment of segments) {
        await db.collection('ml_audiences').doc(segment.segmentId).set({
          userIds: segment.userIds,
          intent: segment.intent,
          predictedConversionRate: segment.conversionRate,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      console.log(`✅ Generated ${segments.length} ML audience segments`);
    } catch (error) {
      console.error('ML audience segmentation error:', error);
    }
  });
```

#### 7.5.2 Dynamic Creative Optimization (DCO)

**الوظيفة:** توليد إعلانات ديناميكية بناءً على:

- تفضيلات المستخدم
- الموقع الجغرافي
- الوقت من اليوم
- الجهاز (Android/iOS)

**الكود المقترح:**

```typescript
export const generateDynamicAd = async (userId: string, car: any) => {
  const user = await db.collection('users').doc(userId).get();
  const userData = user.data();

  // استخدام ML لتوليد الإعلان الأمثل
  const adVariations = [
    {
      headline: `${car.make} ${car.model} - ${car.price} ${car.currency}`,
      description: 'Premium quality used car',
      image: car.images[0],
    },
    {
      headline: `Find your dream ${car.make} in ${userData.locationData?.cityName}`,
      description: `${car.year} model, ${car.mileage} km`,
      image: car.images[1] || car.images[0],
    },
  ];

  // اختيار الإعلان بناءً على أداء سابق
  const bestAd = await selectBestPerformingAd(adVariations, userId);

  return bestAd;
};
```

#### 7.5.3 Real-Time Bidding (RTB) Optimization

**الوظيفة:** تحسين المزايدة التلقائية بناءً على:

- احتمالية التحويل
- قيمة العميل المتوقعة (LTV)
- المنافسة في السوق

---

### 7.6 Retargeting & Remarketing

#### 7.6.1 Google Ads Remarketing

**الإعداد:**

- إنشاء Remarketing Lists في Google Ads
- استهداف: زوار الموقع، مشاهدو السيارات، متخليون عن السلة
- استخدام Google Tag Manager للتتبع

#### 7.6.2 Facebook Retargeting

**الإعداد:**

- إنشاء Custom Audiences من Facebook Pixel
- استهداف: Lookalike Audiences من العملاء الحاليين
- Dynamic Product Ads للسيارات المعروضة سابقاً

#### 7.6.3 Cross-Platform Retargeting

**الملف:** `src/services/retargeting.service.ts`

**الكود المقترح:**

```typescript
export const trackUserForRetargeting = async (
  userId: string,
  action: string,
  carId?: string
) => {
  // Google Ads
  if (window.gtag) {
    window.gtag('event', action, {
      user_id: userId,
      car_id: carId,
    });
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq('track', action, {
      content_ids: carId ? [carId] : [],
      content_type: 'product',
    });
  }

  // TikTok Pixel
  if (window.ttq) {
    window.ttq.track(action, {
      content_id: carId,
      content_type: 'product',
    });
  }

  // حفظ في Firestore للتحليل
  await db.collection('retargeting_events').add({
    userId,
    action,
    carId,
    timestamp: new Date(),
    platform: 'web',
  });
};
```

---

### 7.7 Location-Based Targeting (Geofencing)

#### 7.7.1 استهداف جغرافي ذكي

**الوظيفة:** استهداف المستخدمين بناءً على:

- موقعهم الحالي (GPS)
- المدن التي يزورونها
- قربهم من معارض السيارات

**الكود المقترح:**

```typescript
export const getGeoTargetedAds = async (
  latitude: number,
  longitude: number
) => {
  // العثور على السيارات القريبة
  const nearbyCars = await db
    .collection('cars')
    .where('status', '==', 'active')
    .where('locationData.latitude', '>=', latitude - 0.1)
    .where('locationData.latitude', '<=', latitude + 0.1)
    .where('locationData.longitude', '>=', longitude - 0.1)
    .where('locationData.longitude', '<=', longitude + 0.1)
    .limit(10)
    .get();

  return nearbyCars.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    distance: calculateDistance(latitude, longitude, doc.data().locationData),
  }));
};
```

---

### 7.8 Conversion Tracking & Analytics

#### 7.8.1 إعداد Conversion Tracking

**المنصات:**

- Google Ads Conversion Tracking
- Facebook Pixel Events
- TikTok Pixel Events
- Apple Search Ads Attribution

**الكود المقترح:**

```typescript
// في CarDetailsPage عند النقر على "اتصل بالبائع"
export const trackCarContact = async (
  carId: string,
  method: 'phone' | 'email' | 'whatsapp'
) => {
  // Google Ads
  window.gtag?.('event', 'contact_seller', {
    car_id: carId,
    contact_method: method,
  });

  // Facebook Pixel
  window.fbq?.('track', 'Contact', {
    content_ids: [carId],
    content_type: 'product',
  });

  // حفظ في Firestore
  await db.collection('conversions').add({
    carId,
    method,
    timestamp: new Date(),
    source: 'ad',
  });
};
```

---

### 7.9 A/B Testing & Optimization

#### 7.9.1 اختبار الإعلانات

**الوظيفة:** اختبار متغيرات مختلفة:

- Headlines
- Descriptions
- Images
- Call-to-Action buttons

**الكود المقترح:**

```typescript
export const runAdABTest = async (adVariations: any[]) => {
  // تقسيم الجمهور عشوائياً
  const users = await getActiveUsers();
  const groups = splitUsersIntoGroups(users, adVariations.length);

  // عرض إعلانات مختلفة لكل مجموعة
  for (let i = 0; i < adVariations.length; i++) {
    await showAdToGroup(groups[i], adVariations[i]);
  }

  // مراقبة الأداء واختيار الأفضل
  const results = await analyzeAdPerformance(adVariations);
  return results.bestPerforming;
};
```

---

## 📅 جدول التنفيذ المقترح

### المرحلة 1: الأساسيات (أسبوع 1)

- [x] **اليوم 1-2:** تطبيق CarSEO Component في CarDetailsPage
- [x] **اليوم 3:** تحديث Sitemap Generator لاستخدام Numeric URLs
- [x] **اليوم 4-5:** إنشاء Cloud Function لـ Sitemap
- [ ] **اليوم 6-7:** اختبار وتقديم Sitemap لـ Google Search Console

### المرحلة 2: التكاملات المتقدمة (أسبوع 2)

- [x] **اليوم 8-10:** إنشاء Google Merchant Feed
- [ ] **اليوم 11-12:** إعداد Google Merchant Center
- [ ] **اليوم 13-14:** اختبار Feed والتحقق من الموافقة

### المرحلة 3: تحسين الصور (أسبوع 3)

- [x] **اليوم 15-17:** إنشاء Image Optimization Function
- [x] **اليوم 18-19:** تطبيق Smart Naming في Image Uploader
- [ ] **اليوم 20-21:** إضافة Alt Text ديناميكي

### المرحلة 4: لوحة تحكم الأدمن (أسبوع 4)

- [ ] **اليوم 22:** توحيد المسارات (`/super-admin`) وإضافة `SuperAdminAuthGuard`
- [x] **اليوم 23:** تحسين SuperAdminDashboard - إضافة Marketing Status Panel
- [x] **اليوم 24-25:** إنشاء CarModerationPage مع ربط Firebase (Real-time listener)
- [x] **اليوم 26-27:** إنشاء MarketingTools Component و marketing-status.service
- [x] **اليوم 28:** ربط Cloud Functions مع Admin Dashboard واختبار شامل

### المرحلة 5: الإعلانات الذكية (أسبوع 5-6)

- [ ] **اليوم 29-30:** إعداد Google Ads Account وربط API
- [ ] **اليوم 31-32:** إنشاء Google Ads Sync Function و Dynamic Search Ads
- [ ] **اليوم 33-34:** إعداد Facebook/Instagram Ads وربط Catalog
- [ ] **اليوم 35-36:** إعداد TikTok Ads و Apple Search Ads
- [ ] **اليوم 37-38:** إعداد Retargeting Pixels (Google, Facebook, TikTok)
- [ ] **اليوم 39-40:** إعداد Conversion Tracking لجميع المنصات
- [ ] **اليوم 41-42:** اختبار شامل للإعلانات وتحسين الأداء

### المرحلة 6: Machine Learning & Optimization (أسبوع 7-8)

- [ ] **اليوم 43-45:** إعداد ML Audience Segmentation
- [ ] **اليوم 46-48:** تطبيق Dynamic Creative Optimization
- [ ] **اليوم 49-50:** إعداد Real-Time Bidding Optimization
- [ ] **اليوم 51-52:** تطبيق A/B Testing Framework
- [ ] **اليوم 53-54:** مراقبة وتحسين الأداء المستمر

### المرحلة 7: التحسينات طويلة المدى (شهر 2+)

- [ ] **شهر 2:** تقييم Prerendering Service
- [ ] **شهر 3+:** دراسة Migration إلى Next.js (اختياري)
- [ ] **شهر 3+:** تطوير تطبيق Mobile (Android/iOS) وربطه بالإعلانات

---

## 🎯 مؤشرات النجاح (KPIs)

### قصيرة المدى (شهر 1):

- ✅ ظهور Rich Snippets في نتائج البحث (أسعار + صور)
- ✅ فهرسة 100% من السيارات النشطة في Google
- ✅ قبول Google Merchant Feed بدون أخطاء

### متوسطة المدى (شهر 2-3):

- 📈 زيادة 30-50% في Organic Traffic
- 📈 زيادة 20-30% في CTR من نتائج البحث
- 📈 ظهور في Google Shopping

### طويلة المدى (شهر 4-6):

- 📈 تصدر نتائج البحث للكلمات المفتاحية المستهدفة
- 📈 زيادة 100%+ في Organic Traffic
- 📈 ظهور في Google Images للبحث بالصور
- 📈 زيادة 200-300% في Paid Traffic من Google Ads
- 📈 زيادة 150-200% في Paid Traffic من Facebook/Instagram Ads
- 📈 ROAS (Return on Ad Spend) > 400%
- 📈 Cost per Acquisition (CPA) < 10 EUR

---

## 💡 اقتراحات إضافية بناءً على واقع المشروع

### 1. تحسين SEO Utilities الموجود

**الملف:** `src/utils/seo.ts`

**التحسينات المقترحة:**

- ✅ تحديث `generateCarMetaTags` لاستخدام Numeric URLs
- ✅ إضافة `generateOrganizationStructuredData` في HomePage
- ✅ إضافة Breadcrumb Schema في جميع الصفحات

### 2. إضافة Programmatic SEO Pages

**صفحات ديناميكية تلقائية:**

- `/compare/{make1}/{model1}/vs/{make2}/{model2}`
- `/prices/{city}/{year}`
- `/finance/calculator`

### 3. Google Business Profile Integration

- تشجيع المعارض على ربط حسابات Google Business
- عرض سيارات المعرض في Google Maps

### 4. Social Media Integration

**الملفات الموجودة:**

- `src/services/social/social-media.service.ts`
- `src/pages/01_main-pages/home/HomePage/SocialMediaSection.tsx`

**التحسينات:**

- ربط Auto-posting عند إضافة سيارة جديدة
- إضافة Open Graph tags للمشاركة

---

## 📝 ملاحظات مهمة

1. **Numeric URLs:** ✅ تم إصلاحها 100% - جميع الملفات تستخدم `getCarDetailsUrl()`
2. **SEO Utilities:** موجودة لكن غير مستخدمة - تحتاج تطبيق فقط
3. **Sitemap:** موجود لكن يحتاج Cloud Function
4. **Image Optimization:** غير موجود - يحتاج تطوير كامل
5. **SSR:** غير موجود - حل طويل المدى

---

## 🎛️ الركيزة 6: لوحة تحكم الأدمن المتكاملة (Admin Panel Integration)

**الأولوية:** 🟡 متوسط | **التأثير:** عالي | **الوقت المتوقع:** 3-4 أيام

### الوضع الحالي:

- ✅ يوجد `SuperAdminDashboard` في `src/pages/06_admin/super-admin/SuperAdminDashboard/`
- ✅ يوجد `SuperAdminUsersPage` لإدارة المستخدمين
- ✅ يوجد مكونات إدارية متقدمة (AdminOverview, LiveCounters, etc.)
- ⚠️ يحتاج تحسين وربط مع ميزات التسويق (Google Merchant, Sitemap, Image Optimization)

### المهام المطلوبة:

#### 6.1 تحسين SuperAdminDashboard لمراقبة ميزات التسويق

**الملف:** `src/pages/06_admin/super-admin/SuperAdminDashboard/index.tsx`

**التحسينات المقترحة:**

- إضافة قسم "SEO & Marketing Status" لمراقبة:
  - حالة Google Merchant Feed (آخر تحديث، عدد المنتجات)
  - حالة Sitemap Generation (آخر تحديث، عدد URLs)
  - حالة Image Optimization (عدد الصور المحسنة، الصور العالقة)
  - حالة Structured Data (عدد الصفحات مع JSON-LD)

**الكود المقترح للإضافة:**

```typescript
// في SuperAdminDashboard - إضافة قسم جديد
<MarketingStatusPanel>
  <h3>SEO & Marketing Status</h3>
  <StatusItem
    label="Google Merchant Feed"
    status={merchantFeedStatus}
    lastUpdate={merchantFeedLastUpdate}
    count={merchantFeedProductCount}
  />
  <StatusItem
    label="Sitemap Generation"
    status={sitemapStatus}
    lastUpdate={sitemapLastUpdate}
    count={sitemapUrlCount}
  />
  <StatusItem
    label="Image Optimization"
    status={imageOptStatus}
    lastUpdate={imageOptLastUpdate}
    count={optimizedImagesCount}
  />
  <StatusItem
    label="Structured Data"
    status={structuredDataStatus}
    lastUpdate={structuredDataLastUpdate}
    count={pagesWithStructuredData}
  />
</MarketingStatusPanel>
```

#### 6.2 إضافة صفحة مراقبة السيارات (Car Moderation)

**الملف:** `src/pages/06_admin/super-admin/CarModerationPage.tsx` (جديد)

**الوظائف المطلوبة:**

- عرض السيارات بانتظار الموافقة (status: 'pending')
- أزرار سريعة: قبول / رفض / معاينة
- فلترة حسب: الحالة، التاريخ، البائع
- ربط مع Firebase Firestore

**الكود المقترح:**

```typescript
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase/firebase-config';
import { getCarDetailsUrl } from '../../../utils/routing-utils';
import { FiEye, FiCheck, FiX, FiFilter } from 'lucide-react';

const CarModerationPage: React.FC = () => {
  const [pendingCars, setPendingCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingCars();
  }, []);

  const loadPendingCars = async () => {
    try {
      const q = query(
        collection(db, 'cars'),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      setPendingCars(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error loading pending cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (carId: string) => {
    try {
      await updateDoc(doc(db, 'cars', carId), { status: 'active' });
      loadPendingCars(); // Reload
    } catch (error) {
      console.error('Error approving car:', error);
    }
  };

  const handleReject = async (carId: string, reason?: string) => {
    try {
      await updateDoc(doc(db, 'cars', carId), {
        status: 'rejected',
        rejectionReason: reason
      });
      loadPendingCars();
    } catch (error) {
      console.error('Error rejecting car:', error);
    }
  };

  return (
    <div>
      <h1>إدارة الإعلانات - بانتظار الموافقة</h1>
      {pendingCars.map((car) => (
        <CarModerationCard
          key={car.id}
          car={car}
          onApprove={() => handleApprove(car.id)}
          onReject={(reason) => handleReject(car.id, reason)}
          onView={() => window.open(getCarDetailsUrl(car), '_blank')}
        />
      ))}
    </div>
  );
};
```

#### 6.3 إضافة أدوات إدارية للتسويق

**الملف:** `src/components/SuperAdmin/MarketingTools.tsx` (جديد)

**الوظائف:**

- زر "Regenerate Sitemap" (يدوي)
- زر "Test Merchant Feed" (اختبار الرابط)
- زر "Optimize All Images" (معالجة جماعية)
- زر "Validate Structured Data" (فحص JSON-LD)

#### 6.4 ربط Admin Dashboard مع Cloud Functions

**الملف:** `src/services/admin/marketing-status.service.ts` (جديد)

**الوظائف:**

- `getMerchantFeedStatus()` - جلب حالة Merchant Feed
- `getSitemapStatus()` - جلب حالة Sitemap
- `getImageOptimizationStatus()` - جلب حالة Image Optimization
- `triggerSitemapRegeneration()` - إعادة توليد Sitemap يدوياً

---

## 🔗 التكامل بين التسويق والأدمن

### الربط المطلوب:

#### 1. مراقبة Google Merchant Feed من الأدمن:

- عرض آخر وقت تحديث Feed
- عرض عدد المنتجات في Feed
- عرض الأخطاء (إن وجدت)
- زر لإعادة توليد Feed يدوياً

#### 2. مراقبة Sitemap من الأدمن:

- عرض آخر وقت توليد Sitemap
- عرض عدد URLs في Sitemap
- عرض حالة Google Search Console (مقدمة/معالجة)
- زر لإعادة توليد Sitemap يدوياً

#### 3. مراقبة Image Optimization من الأدمن:

- عرض عدد الصور المحسنة اليوم
- عرض الصور العالقة (فشل التحويل)
- عرض توفير المساحة (MB)
- زر لمعالجة الصور العالقة

#### 4. مراقبة Structured Data من الأدمن:

- عرض عدد الصفحات مع JSON-LD
- عرض الأخطاء في Structured Data
- زر للتحقق من جميع الصفحات

---

## 📋 جدول التنفيذ المحدث (شامل الأدمن)

### المرحلة 1: الأساسيات (أسبوع 1)

- [ ] **اليوم 1-2:** تطبيق CarSEO Component في CarDetailsPage
- [ ] **اليوم 3:** تحديث Sitemap Generator لاستخدام Numeric URLs
- [ ] **اليوم 4-5:** إنشاء Cloud Function لـ Sitemap
- [ ] **اليوم 6-7:** اختبار وتقديم Sitemap لـ Google Search Console

### المرحلة 2: التكاملات المتقدمة (أسبوع 2)

- [ ] **اليوم 8-10:** إنشاء Google Merchant Feed
- [ ] **اليوم 11-12:** إعداد Google Merchant Center
- [ ] **اليوم 13-14:** اختبار Feed والتحقق من الموافقة

### المرحلة 3: تحسين الصور (أسبوع 3)

- [x] **اليوم 15-17:** إنشاء Image Optimization Function
- [x] **اليوم 18-19:** تطبيق Smart Naming في Image Uploader
- [ ] **اليوم 20-21:** إضافة Alt Text ديناميكي

### المرحلة 4: لوحة تحكم الأدمن (أسبوع 4)

- [x] **اليوم 22-23:** تحسين SuperAdminDashboard - إضافة Marketing Status Panel
- [x] **اليوم 24-25:** إنشاء CarModerationPage
- [x] **اليوم 26-27:** إنشاء MarketingTools Component
- [x] **اليوم 28:** إنشاء marketing-status.service وربط Cloud Functions

### المرحلة 5: التحسينات طويلة المدى (شهر 2+)

- [ ] **شهر 2:** تقييم Prerendering Service
- [ ] **شهر 3+:** دراسة Migration إلى Next.js (اختياري)

---

## ✅ Checklist التنفيذ (محدث)

### أساسيات SEO:

- [ ] تثبيت `react-helmet-async`
- [ ] إنشاء `src/components/seo/CarSEO.tsx`
- [ ] تطبيق CarSEO في CarDetailsPage
- [ ] تحديث `generateCarStructuredData` لاستخدام Numeric URLs

### Sitemap:

- [ ] تحديث `sitemap-generator.ts` لاستخدام Numeric URLs
- [ ] إنشاء `functions/src/sitemap.ts`
- [ ] إضافة rewrite rule في `firebase.json`
- [ ] Deploy واختبار
- [ ] تقديم لـ Google Search Console

### Google Merchant:

- [ ] إنشاء `functions/src/merchantFeed.ts`
- [ ] إضافة rewrite rule
- [ ] Deploy واختبار
- [ ] إعداد Google Merchant Center
- [ ] تقديم Feed

### Image Optimization:

- [ ] تثبيت `sharp` في functions
- [ ] إنشاء `functions/src/imageOptimizer.ts`
- [ ] إضافة Smart Naming في Image Uploader
- [ ] إضافة Alt Text ديناميكي

---

## 🎛️ الركيزة 6: لوحة تحكم الأدمن المتكاملة (Admin Panel Integration)

**الأولوية:** 🟡 متوسط | **التأثير:** عالي | **الوقت المتوقع:** 3-4 أيام

### الوضع الحالي:

- ✅ يوجد `SuperAdminDashboard` في `src/pages/06_admin/super-admin/SuperAdminDashboard/`
- ✅ يوجد `SuperAdminUsersPage` لإدارة المستخدمين
- ✅ يوجد مكونات إدارية متقدمة (AdminOverview, LiveCounters, etc.)
- ⚠️ يحتاج تحسين وربط مع ميزات التسويق (Google Merchant, Sitemap, Image Optimization)

### المهام المطلوبة:

#### 6.1 تحسين SuperAdminDashboard لمراقبة ميزات التسويق

**الملف:** `src/pages/06_admin/super-admin/SuperAdminDashboard/index.tsx`

**التحسينات المقترحة:**

- إضافة قسم "SEO & Marketing Status" لمراقبة:
  - حالة Google Merchant Feed (آخر تحديث، عدد المنتجات)
  - حالة Sitemap Generation (آخر تحديث، عدد URLs)
  - حالة Image Optimization (عدد الصور المحسنة، الصور العالقة)
  - حالة Structured Data (عدد الصفحات مع JSON-LD)

**الكود المقترح للإضافة:**

```typescript
// في SuperAdminDashboard - إضافة قسم جديد
<MarketingStatusPanel>
  <h3>SEO & Marketing Status</h3>
  <StatusItem
    label="Google Merchant Feed"
    status={merchantFeedStatus}
    lastUpdate={merchantFeedLastUpdate}
    count={merchantFeedProductCount}
  />
  <StatusItem
    label="Sitemap Generation"
    status={sitemapStatus}
    lastUpdate={sitemapLastUpdate}
    count={sitemapUrlCount}
  />
  <StatusItem
    label="Image Optimization"
    status={imageOptStatus}
    lastUpdate={imageOptLastUpdate}
    count={optimizedImagesCount}
  />
  <StatusItem
    label="Structured Data"
    status={structuredDataStatus}
    lastUpdate={structuredDataLastUpdate}
    count={pagesWithStructuredData}
  />
</MarketingStatusPanel>
```

#### 6.2 إضافة صفحة مراقبة السيارات (Car Moderation)

**الملف:** `src/pages/06_admin/super-admin/CarModerationPage.tsx` (جديد)

**الوظائف المطلوبة:**

- عرض السيارات بانتظار الموافقة (status: 'pending')
- أزرار سريعة: قبول / رفض / معاينة
- فلترة حسب: الحالة، التاريخ، البائع
- ربط مع Firebase Firestore

**الكود المقترح:**

```typescript
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase/firebase-config';
import { getCarDetailsUrl } from '../../../utils/routing-utils';
import { FiEye, FiCheck, FiX, FiFilter } from 'lucide-react';

const CarModerationPage: React.FC = () => {
  const [pendingCars, setPendingCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingCars();
  }, []);

  const loadPendingCars = async () => {
    try {
      const q = query(
        collection(db, 'cars'),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      setPendingCars(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error loading pending cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (carId: string) => {
    try {
      await updateDoc(doc(db, 'cars', carId), { status: 'active' });
      loadPendingCars(); // Reload
    } catch (error) {
      console.error('Error approving car:', error);
    }
  };

  const handleReject = async (carId: string, reason?: string) => {
    try {
      await updateDoc(doc(db, 'cars', carId), {
        status: 'rejected',
        rejectionReason: reason
      });
      loadPendingCars();
    } catch (error) {
      console.error('Error rejecting car:', error);
    }
  };

  return (
    <div>
      <h1>إدارة الإعلانات - بانتظار الموافقة</h1>
      {pendingCars.map((car) => (
        <CarModerationCard
          key={car.id}
          car={car}
          onApprove={() => handleApprove(car.id)}
          onReject={(reason) => handleReject(car.id, reason)}
          onView={() => window.open(getCarDetailsUrl(car), '_blank')}
        />
      ))}
    </div>
  );
};
```

#### 6.3 إضافة أدوات إدارية للتسويق

**الملف:** `src/components/SuperAdmin/MarketingTools.tsx` (جديد)

**الوظائف:**

- زر "Regenerate Sitemap" (يدوي)
- زر "Test Merchant Feed" (اختبار الرابط)
- زر "Optimize All Images" (معالجة جماعية)
- زر "Validate Structured Data" (فحص JSON-LD)

#### 6.4 ربط Admin Dashboard مع Cloud Functions

**الملف:** `src/services/admin/marketing-status.service.ts` (جديد)

**الوظائف:**

- `getMerchantFeedStatus()` - جلب حالة Merchant Feed
- `getSitemapStatus()` - جلب حالة Sitemap
- `getImageOptimizationStatus()` - جلب حالة Image Optimization
- `triggerSitemapRegeneration()` - إعادة توليد Sitemap يدوياً

---

## 🔗 التكامل بين التسويق والأدمن

### الربط المطلوب:

#### 1. مراقبة Google Merchant Feed من الأدمن:

- عرض آخر وقت تحديث Feed
- عرض عدد المنتجات في Feed
- عرض الأخطاء (إن وجدت)
- زر لإعادة توليد Feed يدوياً

#### 2. مراقبة Sitemap من الأدمن:

- عرض آخر وقت توليد Sitemap
- عرض عدد URLs في Sitemap
- عرض حالة Google Search Console (مقدمة/معالجة)
- زر لإعادة توليد Sitemap يدوياً

#### 3. مراقبة Image Optimization من الأدمن:

- عرض عدد الصور المحسنة اليوم
- عرض الصور العالقة (فشل التحويل)
- عرض توفير المساحة (MB)
- زر لمعالجة الصور العالقة

#### 4. مراقبة Structured Data من الأدمن:

- عرض عدد الصفحات مع JSON-LD
- عرض الأخطاء في Structured Data
- زر للتحقق من جميع الصفحات

---

## 📐 هيكل لوحة تحكم الأدمن المقترح

### ⚠️ مهم: الدمج لا الاستبدال

**لا تقم بإنشاء مجلد جديد `src/pages/admin/`** - استخدم الملفات الموجودة في `src/pages/06_admin/` وقم بتحديثها فقط.

### الملفات المطلوبة:

```
src/
  └── pages/
      └── 06_admin/                          (موجود ✅ - تحديث فقط)
          └── super-admin/
              ├── SuperAdminDashboard/        (موجود ✅ - تحديث)
              ├── SuperAdminUsersPage.tsx     (موجود ✅)
              ├── CarModerationPage.tsx       (جديد - يحتاج إنشاء)
              └── MarketingToolsPage.tsx      (جديد - يحتاج إنشاء)

  └── components/
      └── SuperAdmin/                        (موجود ✅ - إضافة مكونات جديدة)
          ├── MarketingStatusPanel.tsx        (جديد)
          ├── MarketingTools.tsx               (جديد)
          └── CarModerationCard.tsx           (جديد)

  └── services/
      └── admin/                             (جديد - يحتاج إنشاء)
          └── marketing-status.service.ts     (جديد)
```

### المسارات الموحدة:

- **لوحة التحكم:** `/super-admin` (بدلاً من `/admin`)
- **صفحة تسجيل الدخول:** `/super-admin-login` (موجود)
- **حماية:** إضافة `SuperAdminAuthGuard` في `AppRoutes.tsx`

### الملف 1: MarketingStatusPanel Component

**الملف:** `src/components/SuperAdmin/MarketingStatusPanel.tsx`

**الوظيفة:** عرض حالة جميع ميزات التسويق في لوحة واحدة

**الكود المقترح:**

```typescript
import React, { useEffect, useState } from 'react';
import { marketingStatusService } from '../../../services/admin/marketing-status.service';

interface MarketingStatus {
  merchantFeed: { status: string; lastUpdate: string; count: number };
  sitemap: { status: string; lastUpdate: string; count: number };
  imageOptimization: { status: string; lastUpdate: string; count: number; pending: number };
  structuredData: { status: string; lastUpdate: string; count: number };
}

export const MarketingStatusPanel: React.FC = () => {
  const [status, setStatus] = useState<MarketingStatus | null>(null);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    const data = await marketingStatusService.getAllStatus();
    setStatus(data);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-bold text-gray-800 text-lg mb-4">SEO & Marketing Status</h3>
      <div className="space-y-4">
        <SystemStatusItem
          label="Google Merchant Feed"
          status={status?.merchantFeed.status || 'unknown'}
          time={status?.merchantFeed.lastUpdate || 'N/A'}
          count={status?.merchantFeed.count}
        />
        <SystemStatusItem
          label="Sitemap Generation"
          status={status?.sitemap.status || 'unknown'}
          time={status?.sitemap.lastUpdate || 'N/A'}
          count={status?.sitemap.count}
        />
        <SystemStatusItem
          label="Image Optimization"
          status={status?.imageOptimization.status || 'unknown'}
          time={status?.imageOptimization.lastUpdate || 'N/A'}
          count={status?.imageOptimization.count}
          pending={status?.imageOptimization.pending}
        />
        <SystemStatusItem
          label="Structured Data"
          status={status?.structuredData.status || 'unknown'}
          time={status?.structuredData.lastUpdate || 'N/A'}
          count={status?.structuredData.count}
        />
      </div>
      <button
        onClick={loadStatus}
        className="mt-6 w-full py-2 bg-gray-50 text-gray-600 rounded-lg text-sm hover:bg-gray-100 transition"
      >
        تحديث الحالة
      </button>
    </div>
  );
};
```

### الملف 2: CarModerationPage (محدث)

**الملف:** `src/pages/06_admin/super-admin/CarModerationPage.tsx`

**التحسينات على الكود الموجود:**

- ربط حقيقي مع Firebase
- استخدام Numeric URLs عند المعاينة
- إضافة فلترة متقدمة
- إضافة بحث

**الكود المحدث:**

```typescript
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase/firebase-config';
import { getCarDetailsUrl } from '../../../utils/routing-utils';
import { FiEye, FiCheck, FiX, FiFilter, FiSearch } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

const CarModerationPage: React.FC = () => {
  const { language } = useLanguage();
  const [pendingCars, setPendingCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reported'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCars();
  }, [filter]);

  const loadCars = async () => {
    setLoading(true);
    try {
      let q = query(collection(db, 'cars'), orderBy('createdAt', 'desc'));

      if (filter === 'pending') {
        q = query(q, where('status', '==', 'pending'));
      } else if (filter === 'reported') {
        q = query(q, where('reported', '==', true));
      }

      const snapshot = await getDocs(q);
      const cars = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPendingCars(cars);
    } catch (error) {
      console.error('Error loading cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (carId: string) => {
    try {
      await updateDoc(doc(db, 'cars', carId), {
        status: 'active',
        approvedAt: new Date(),
        approvedBy: 'admin' // TODO: Get from auth
      });
      loadCars();
    } catch (error) {
      console.error('Error approving car:', error);
    }
  };

  const handleReject = async (carId: string, reason?: string) => {
    try {
      await updateDoc(doc(db, 'cars', carId), {
        status: 'rejected',
        rejectionReason: reason || 'No reason provided',
        rejectedAt: new Date()
      });
      loadCars();
    } catch (error) {
      console.error('Error rejecting car:', error);
    }
  };

  const filteredCars = pendingCars.filter(car => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      car.make?.toLowerCase().includes(search) ||
      car.model?.toLowerCase().includes(search) ||
      car.sellerName?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {language === 'bg' ? 'Управление на обяви' : 'Car Moderation'}
        </h1>
        <div className="flex gap-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={language === 'bg' ? 'Търсене...' : 'Search...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-200 rounded-lg"
          >
            <option value="pending">{language === 'bg' ? 'В очакване' : 'Pending'}</option>
            <option value="reported">{language === 'bg' ? 'Докладвани' : 'Reported'}</option>
            <option value="all">{language === 'bg' ? 'Всички' : 'All'}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-4">
          {filteredCars.map((car) => (
            <CarModerationCard
              key={car.id}
              car={car}
              onApprove={() => handleApprove(car.id)}
              onReject={(reason) => handleReject(car.id, reason)}
              onView={() => window.open(getCarDetailsUrl(car), '_blank')}
            />
          ))}
        </div>
      )}
    </div>
  );
};
```

### الملف 3: Marketing Tools Component

**الملف:** `src/components/SuperAdmin/MarketingTools.tsx`

**الوظائف:**

- أزرار للتحكم في ميزات التسويق
- اختبار الروابط
- إعادة توليد يدوية

---

## 📅 جدول التنفيذ المحدث (شامل الأدمن)

### المرحلة 1: الأساسيات (أسبوع 1)

- [ ] **اليوم 1-2:** تطبيق CarSEO Component في CarDetailsPage
- [ ] **اليوم 3:** تحديث Sitemap Generator لاستخدام Numeric URLs
- [ ] **اليوم 4-5:** إنشاء Cloud Function لـ Sitemap
- [ ] **اليوم 6-7:** اختبار وتقديم Sitemap لـ Google Search Console

### المرحلة 2: التكاملات المتقدمة (أسبوع 2)

- [ ] **اليوم 8-10:** إنشاء Google Merchant Feed
- [ ] **اليوم 11-12:** إعداد Google Merchant Center
- [ ] **اليوم 13-14:** اختبار Feed والتحقق من الموافقة

### المرحلة 3: تحسين الصور (أسبوع 3)

- [ ] **اليوم 15-17:** إنشاء Image Optimization Function
- [ ] **اليوم 18-19:** تطبيق Smart Naming في Image Uploader
- [ ] **اليوم 20-21:** إضافة Alt Text ديناميكي

### المرحلة 4: لوحة تحكم الأدمن (أسبوع 4)

- [ ] **اليوم 22:** توحيد المسارات (`/super-admin`) وإضافة `SuperAdminAuthGuard`
- [x] **اليوم 23:** تحسين SuperAdminDashboard - إضافة Marketing Status Panel
- [x] **اليوم 24-25:** إنشاء CarModerationPage مع ربط Firebase (Real-time listener)
- [x] **اليوم 26-27:** إنشاء MarketingTools Component و marketing-status.service
- [x] **اليوم 28:** ربط Cloud Functions مع Admin Dashboard واختبار شامل

### المرحلة 5: التحسينات طويلة المدى (شهر 2+)

- [ ] **شهر 2:** تقييم Prerendering Service
- [ ] **شهر 3+:** دراسة Migration إلى Next.js (اختياري)

---

## ✅ Checklist التنفيذ (محدث)

### أساسيات SEO:

- [ ] تثبيت `react-helmet-async`
- [ ] إنشاء `src/components/seo/CarSEO.tsx`
- [ ] تطبيق CarSEO في CarDetailsPage
- [ ] تحديث `generateCarStructuredData` لاستخدام Numeric URLs

### Sitemap:

- [ ] تحديث `sitemap-generator.ts` لاستخدام Numeric URLs
- [ ] إنشاء `functions/src/sitemap.ts`
- [ ] إضافة rewrite rule في `firebase.json`
- [ ] Deploy واختبار
- [ ] تقديم لـ Google Search Console

### Google Merchant:

- [ ] إنشاء `functions/src/merchantFeed.ts`
- [ ] إضافة rewrite rule
- [ ] Deploy واختبار
- [ ] إعداد Google Merchant Center
- [ ] تقديم Feed

### Image Optimization:

- [x] تثبيت `sharp` في functions
- [x] إنشاء `functions/src/imageOptimizer.ts`
- [x] إضافة Smart Naming في Image Uploader
- [ ] إضافة Alt Text ديناميكي

### Admin Panel:

- [ ] توحيد المسارات (`/super-admin`) وإضافة `SuperAdminAuthGuard`
- [x] تحديث `SuperAdminDashboard` - إضافة Marketing Status Panel
- [x] إنشاء `CarModerationPage.tsx` مع ربط حقيقي (Real-time listener)
- [x] إنشاء `MarketingTools.tsx`
- [x] إنشاء `marketing-status.service.ts`
- [x] ربط Cloud Functions مع Admin Dashboard
- [x] **⚠️ مهم:** استبدال أي بيانات وهمية بربط حقيقي مع Firestore

### Smart Ads & ML:

- [ ] إعداد Google Ads Account و Developer Token
- [ ] إنشاء `google-ads-sync.ts` Function
- [ ] إعداد Facebook Marketing API و Catalog
- [ ] إنشاء `facebook-ads-sync.ts` Function
- [ ] إعداد TikTok Ads API
- [ ] إنشاء `tiktok-ads-sync.ts` Function
- [ ] إعداد Apple Search Ads API
- [ ] إنشاء `apple-search-ads-sync.ts` Function
- [ ] إعداد Retargeting Pixels (Google, Facebook, TikTok)
- [ ] إنشاء `retargeting.service.ts`
- [ ] إعداد Conversion Tracking لجميع المنصات
- [ ] إنشاء `ml-audience-segmentation.ts` Function
- [ ] تطبيق Dynamic Creative Optimization
- [ ] إعداد A/B Testing Framework

---

## 📌 ملاحظات مهمة للمطور (Technical Notes)

### 1. توحيد المسارات والروابط

- **المسار الموحد:** `/super-admin` (بدلاً من `/admin`)
- **صفحة تسجيل الدخول:** `/super-admin-login` (موجود)
- **الحماية:** إضافة `SuperAdminAuthGuard` في `AppRoutes.tsx` أو `MainRoutes.tsx`
- **التأكد من:** تطابق جميع الروابط الداخلية في `AdminLayout` مع المسار الموحد

### 2. الدمج لا الاستبدال

- **❌ لا تقم بإنشاء:** `src/pages/admin/` (مجلد جديد)
- **✅ قم بتحديث:** `src/pages/06_admin/super-admin/` (الموجود)
- **الهدف:** تجنب التكرار والازدواجية في الكود

### 3. الربط الحقيقي مع Firestore

- **❌ لا تستخدم:** بيانات وهمية (`dummyCars`, أرقام ثابتة)
- **✅ استخدم:** Real-time listeners (`onSnapshot`) لمراقبة التغييرات الفورية
- **✅ استخدم:** TypeScript interfaces (`UnifiedCar`) بدلاً من `any[]`

### 4. تحسينات Cloud Functions

- **الذاكرة:** ضبط `memory: '512MB'` أو `'1GB'` حسب عدد السيارات
- **Timeout:** ضبط `timeoutSeconds: 60` لتجنب أخطاء Out of Memory
- **التأكد من:** تطابق أسماء الدوال في `firebase.json` مع الأسماء المصدرة

### 5. تحسينات SEO

- **الصور الافتراضية:** التأكد من وجود `/public/default-car-image.webp`
- **التحقق:** إضافة validation للصور قبل استخدامها في Structured Data

## 🧠 ركيزة الإعلانات الذكية / تغطية Android + iOS (مقترح إضافة)

**الأولوية:** 🔴 عاجل | **التأثير:** عالي جداً | **الوقت المتوقع:** 3-5 أيام للتفعيل الأولي

### الأهداف

- الوصول لكل مستخدم Android و iOS عبر حملات Google Ads (App / Performance Max / Dynamic Remarketing) مع تتبع دقيق.
- تمكين الروابط العميقة (Deep Links) و Universal Links + App Links لفتح التطبيق أو الـ PWA بسلاسة.
- تغذية خوارزميات Google/Apple ببيانات تحويلات غنية لتحسين التسعير الآلي.

### المهام المطلوبة

1. **القياس والتتبع (Measurement)**

- تفعيل **GA4 + Google Tag Manager** على الويب، و **Firebase Analytics** للتطبيق/الـ PWA.
- تفعيل **Consent Mode v2** ودعم CMP للامتثال (GDPR/TTD).
- إعداد **Enhanced Conversions** في Google Ads (ويب) و **SKAdNetwork** على iOS + **App Attribution** من Firebase للأندرويد/آي أو إس.
- تعريف Events موحدة: `view_car`, `start_checkout`, `submit_lead`, `message_seller`, `add_to_favorites` مع معلمات (sellerNumericId, carNumericId, price, currency=EUR, region).

2. **الروابط العميقة (Deep Links)**

- إعداد **Android App Links** و **iOS Universal Links** بنفس السكيمة الرقمية `/car/:sellerNumericId/:carNumericId`.
- دعم **Deferred Deep Links** عبر Firebase Dynamic Links (يفتح المتجر ثم يعود لصفحة السيارة بعد التثبيت).
- نشر `assetlinks.json` و `apple-app-site-association` في الاستضافة.

3. **التطبيق/الـ PWA**

- تأكيد **PWA installability** (manifest، service worker، أيقونات، offline fallback) وتحسين Lighthouse mobile.
- في حال وجود تطبيق هجين/Native لاحقاً: مزامنة الأحداث مع Firebase Analytics وضبط In-App Events لـ App Campaigns.

4. **الحملات الإعلانية**

- إطلاق **Performance Max** مع Feeds (Merchant + Page Feed بروابط رقمية).
- إطلاق **App Campaigns (Install/Engagement)** بعد تفعيل قياس SKAd/Android.
- **Dynamic Remarketing for Autos** باستخدام Merchant feed / remarketing tags مع معلمات رقمية لضمان تطابق الصفحات.
- إعداد قوائم **RLSA** و **Lookalike** عبر إشارات GA4/Firebase.

5. **جودة البيانات والإشارات**

- إرسال **server-side events** (Functions) لتقليل فقدان الكوكيز.
- توحيد العملة EUR وضبط geo-targeting (بلغاريا/أوروبا) في الحملات.
- إضافة **Offline Conversions** (استيراد المبيعات الهاتفية/المعرض) إلى Google Ads باستخدام GCLID/GBRAID/WMCLID.

6. **الاختبار والتحسين**

- A/B للافتات والصفحات المقصودة (GA4 Experiments أو أدوات خفيفة).
- مراقبة LCP/CLS للأجهزة المحمولة لتحسين Quality Score.

### مخرجات سريعة مطلوبة

- ملفات: `assetlinks.json`, `apple-app-site-association`, إعداد Dynamic Links.
- ضبط Tags في GTM للويب + إعداد SDK في Firebase للتطبيق/الـ PWA.
- دليل تشغيل حملات: Performance Max + App + Dynamic Remarketing مع معلمات UTM موحدة.

### مصفوفة المتغيرات البيئية (Environment Variables)

- **عام (Frontend/PWA):**
  - `VITE_PUBLIC_BASE_URL` (prod/stage) للروابط الرقمية.
  - `VITE_GA4_MEASUREMENT_ID`, `VITE_GTM_ID`, `VITE_CONSENT_MODE`.
  - `VITE_FIREBASE_*` (التكوين الحالي).
- **Functions / Server:**
  - Google Ads: `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_CUSTOMER_ID`, `GOOGLE_ADS_REFRESH_TOKEN`.
  - Facebook: `FACEBOOK_ACCESS_TOKEN`, `FACEBOOK_PIXEL_ID`, `FACEBOOK_APP_ID`, (اختياري) `FACEBOOK_APP_SECRET`.
  - TikTok: `TIKTOK_ACCESS_TOKEN`, `TIKTOK_ADVERTISER_ID`, `TIKTOK_PIXEL_ID`.
  - Apple Search Ads: `APPLE_SEARCH_ADS_ORG_ID`, `APPLE_SEARCH_ADS_API_KEY`, (اختياري) `APPLE_SEARCH_ADS_GROUP_ID`.
  - Merchant/Sitemaps: `PUBLIC_BASE_URL`, `MERCHANT_FEED_MEM_LIMIT`, `SITEMAP_MEM_LIMIT` (اختياري للضبط)، مفاتيح إدارة إن وجدت.
  - Security: `RATE_LIMIT_WINDOWS`, `MAX_BATCH_SIZE` لكل منصة (اختياري لضبط الحصة).

### جدول التنفيذ المرحلي (اقتراح 4 أسابيع)

- **الأسبوع 1:** CarSEO + Sitemap (Functions) + Consent Mode v2 + GA4/GTM + Events موحدة.
- **الأسبوع 2:** Merchant Feed (فلترة صارمة) + Image Optimizer حواجز الأمان + Dynamic Links/assetlinks/aa-sa.
- **الأسبوع 3:** إطلاق محدود Google Ads (PMax/DSA) بميزانية اختبارية + Facebook CAPI/Pixels + TikTok Pixel/Events (بدون scale كبير).
- **الأسبوع 4:** Retargeting متعدد المنصات + Smart Bidding/ROAS بعد توافر ≥30-50 تحويل/حملة + إعداد Apple Search Ads عند توفر التطبيق.

### KPIs رئيسية للمراقبة

- **Acquisition:** CPC, CTR, CVR, CPA, Target CPA/ROAS مقابل الفعلي.
- **Revenue/Value:** ROAS، متوسط قيمة الطلب (AOV) إن وجد، Leads Quality (قبول/رفض بعد التدقيق).
- **Engagement:** Time on page، Scroll/Interaction، نسبة الرسائل المرسلة/المشاهدة.
- **سرعة التجربة:** LCP/CLS على الموبايل، معدل رفض الصفحات المقصودة.
- **نظافة البيانات:** معدل أحداث مكررة/مرفوضة، جودة الصور/الأسعار، نسب الأخطاء في الـ feeds والـ Functions.

---

**آخر تحديث:** 2025-01-XX  
**الحالة:** جاهز للتنفيذ ✅  
**مراجعة:** Gemini Pro 3 ✅
