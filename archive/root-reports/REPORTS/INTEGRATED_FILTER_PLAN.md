# 📋 خطة الفلاتر المتكاملة - Integrated Filter Plan

> **تاريخ الإنشاء:** 30 يناير 2026  
> **المشروع:** Koli.one - New Globul Cars  
> **الإصدار:** 1.0

---

## 📑 جدول المحتويات - Table of Contents

| # | القسم | Section | الرابط |
|---|-------|---------|--------|
| 1 | نظرة عامة على خطة الفلاتر المتكاملة | Overview | [🔗 انتقل](#1-نظرة-عامة-على-خطة-الفلاتر-المتكاملة) |
| 2 | جدول تعريف الفلاتر الأساسية والمنطق التنفيذي | Filter Definition Table | [🔗 انتقل](#2-جدول-تعريف-الفلاتر-الأساسية-والمنطق-التنفيذي) |
| 3 | قواعد الربط مع صفحة إضافة الإعلان | Sell Page Linking Rules | [🔗 انتقل](#3-قواعد-الربط-مع-صفحة-إضافة-الإعلان) |
| 4 | تصميم واجهة المستخدم وسلوك URL | UI Design & URL Behavior | [🔗 انتقل](#4-تصميم-واجهة-المستخدم-وسلوك-url) |
| 5 | بنية API وفلترة على الخادم | API Structure & Server Filtering | [🔗 انتقل](#5-بنية-api-وفلترة-على-الخادم) |
| 6 | تتبع التحليلات وأحداث القياس | Analytics & Measurement Events | [🔗 انتقل](#6-تتبع-التحليلات-وأحداث-القياس) |
| 7 | معايير القبول واختبارات QA | Acceptance Criteria & QA Tests | [🔗 انتقل](#7-معايير-القبول-واختبارات-qa) |
| 8 | أولويات التنفيذ وتقديرات زمنية مقترحة | Implementation Priorities | [🔗 انتقل](#8-أولويات-التنفيذ-وتقديرات-زمنية-مقترحة) |
| 9 | تطبيق المنطق على الأقسام الـ15 | Applying Logic to 15 Sections | [🔗 انتقل](#9-كيف-نطبّق-المنطق-على-بقية-الأقسام-الـ15-بإبداع-ودقة) |
| 10 | الخطوات التالية التلقائية | Next Automated Steps | [🔗 انتقل](#10-الخطوة-التالية-التي-سأقوم-بها-تلقائياً) |
| 11 | خاتمة وتنفيذ عملي فوري | Conclusion & Immediate Action | [🔗 انتقل](#11-خاتمة-وتنفيذ-عملي-فوري) |
| 12 | أوامر جاهزة للتنفيذ | Ready-to-Use Commands | [🔗 انتقل](#12-أوامر-جاهزة-يمكنك-لصقها-مباشرة) |
| 13 | قائمة تحقق سريعة | Quick Checklist | [🔗 انتقل](#13-قائمة-تحقق-سريعة-لكل-مخرَج-قبل-الانتقال-للقسم-التالي) |
| 14 | التعامل مع الأخطاء والنواقص | Error Handling | [🔗 انتقل](#14-كيف-تتعامل-مع-الأخطاء-أو-النواقص-من-الموديل) |
| 15 | تسلسل التنفيذ المقترح | Execution Sequence | [🔗 انتقل](#15-تسلسل-تنفيذ-مقترح-وزمني-فريق-صغير) |
| 16 | نصائح عملية لكتابة الأوامر | Practical Tips | [🔗 انتقل](#16-نصيحة-عملية-لكتابة-الأوامر-للموديل) |

---

## 1. نظرة عامة على خطة الفلاتر المتكاملة

[⬆️ العودة للمحتويات](#📑-جدول-المحتويات---table-of-contents)

هذه خطة عملية ومفصّلة لبناء نظام فلاتر منطقي، قابل للقياس، وقابل للتوسيع لكل الأقسام الـ15 في الصفحة الرئيسية.

### الأهداف الرئيسية:
- ✅ تحويل المنطق الوصفي إلى **قواعد اختيار واضحة**
- ✅ تعريف **حقول إدخال** في صفحة إضافة الإعلان
- ✅ تصميم **معاملات API** موحّدة
- ✅ إنشاء **أحداث تتبع** قابلة للقياس
- ✅ جعل كل فلتر **قابلاً للاختبار والنشر** بسرعة

### المخرجات المتوقعة:
| المخرج | الوصف | الحالة |
|--------|-------|--------|
| Filter Definition Table | جدول كامل بجميع الفلاتر | ✅ مكتمل |
| API Contract | عقد API موحّد | ✅ مكتمل |
| QA Test Cases | حالات اختبار | ✅ مكتمل |
| Implementation Manifest | ملف JSON للمهام | 🔄 قيد التحديث |

---

## 2. جدول تعريف الفلاتر الأساسية والمنطق التنفيذي

[⬆️ العودة للمحتويات](#📑-جدول-المحتويات---table-of-contents)

### جدول الفلاتر الكامل:

| # | فلتر | منطق الاختيار | حقل في صفحة البيع | نوع واجهة المستخدم | مثال Query Param |
|---|------|---------------|-------------------|-------------------|------------------|
| 1 | **Family Cars** | مقاعد ≥ 7 | `seats` | اختيار رقمي أو قائمة مسبقة | `?seats_min=7` |
| 2 | **Sports Cars** | مقعدين AND engine_hp > 240 | `seats`, `engine_hp` | شريط نطاق + اختيار مقاعد | `?seats_max=2&engine_hp_min=241` |
| 3 | **Electric** | fuel = electric | `fuel_type` | قائمة اختيار واحدة | `?fuel=electric` |
| 4 | **Newly Added** | ترتيب حسب created_at نزولياً | `created_at` | زر فرز أو toggle | `?sort=created_desc` |
| 5 | **Low Mileage New** | mileage <= 3515 | `mileage` | نطاق أرقام | `?mileage_max=3515` |
| 6 | **Price Range** | price_min / price_max | `price` | نطاق أرقام مع عملة | `?price_min=5000&price_max=15000` |
| 7 | **Year Range** | year_min / year_max | `year` | نطاق أو selects | `?year_min=2015&year_max=2023` |
| 8 | **Brand** | اختيار متعدد من قائمة الماركات | `brand` | بحث أو قائمة منسدلة | `?brand=mazda` |
| 9 | **Model** | اختيار متعدد مرتبط بالماركة | `model` | بحث ديناميكي | `?model=mazda6` |
| 10 | **Transmission** | transmission (auto/manual) | `transmission` | راديو أو قائمة | `?transmission=automatic` |
| 11 | **Fuel Type** | بنزين/ديزل/هجين/كهرباء | `fuel_type` | قائمة أيقونات | `?fuel=petrol` |
| 12 | **Body Type** | Sedan/SUV/Hatchback... | `body_type` | أيقونات + عدادات | `?body_type=suv` |
| 13 | **Mileage Max** | mileage_max | `mileage` | شريط نطاق | `?mileage_max=100000` |
| 14 | **Location / Region** | city أو region | `city` | اختيار مدينة أو تحديد جغرافي | `?city=sofia` |
| 15 | **Dealer Verified** | dealer_verified = true | `seller_type`, `dealer_verified` | Toggle | `?dealer_verified=true` |
| 16 | **Certified / Premium** | علامة تحقق أو badge | `is_premium` | فلتر badge | `?is_premium=true` |
| 17 | **Features** | sunroof, nav, camera... | `features[]` | checkboxes متعددة | `?features=sunroof,nav` |
| 18 | **Condition** | New / Used | `condition` | راديو | `?condition=used` |
| 19 | **Seller Type** | Dealer / Private | `seller_type` | Toggle | `?seller_type=dealer` |
| 20 | **Posted Within** | 24h / 7d / 30d | `posted_within` | قائمة زمنية | `?posted_within=7d` |
| 21 | **Color** | اختيار لون | `color` | قائمة أو بحث | `?color=black` |
| 22 | **VIN Check Available** | فلتر حسب وجود فحص VIN | `vin_checked` | Toggle | `?vin_checked=true` |

### مخطط العلاقات بين الفلاتر:

```
┌─────────────────────────────────────────────────────────────┐
│                    Filter Dependencies                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Brand ──────► Model (cascading dependency)                │
│                                                             │
│   Seller Type ──────► Dealer Verified (conditional)         │
│                                                             │
│   Fuel Type ──────► Engine HP (affects range options)       │
│                                                             │
│   Body Type ──────► Seats (suggests typical ranges)         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. قواعد الربط مع صفحة إضافة الإعلان

[⬆️ العودة للمحتويات](#📑-جدول-المحتويات---table-of-contents)

### القاعدة العامة:
> كل فلتر يجب أن يقابله حقل واضح في `/sell/auto` أو في نموذج البيع.

### أمثلة تنفيذية:

#### 🚗 Family Cars
```typescript
// حقل seats في نموذج البيع
// عند إدخال قيمة ≥7 يتم وسم الإعلان كـ family=true
interface FamilyCarRule {
  field: 'seats';
  condition: (value: number) => value >= 7;
  autoTag: 'family';
}
```

#### 🏎️ Sports Cars
```typescript
// حقل seats و engine_hp
// إذا seats==2 و engine_hp>240 يتم وسم sports=true
interface SportsCarRule {
  fields: ['seats', 'engine_hp'];
  condition: (seats: number, hp: number) => seats === 2 && hp > 240;
  autoTag: 'sports';
}
```

#### ⚡ Electric
```typescript
// حقل fuel_type يملأ تلقائياً من اختيار البائع
// fuel_type == 'electric' يفعّل فلتر الكهرباء
interface ElectricRule {
  field: 'fuel_type';
  condition: (value: string) => value === 'electric';
  autoTag: 'electric';
}
```

#### 🆕 Low Mileage New
```typescript
// حقل mileage مطلوب
// إذا mileage <= 3515 يتم وسم new_condition=true
interface LowMileageRule {
  field: 'mileage';
  condition: (value: number) => value <= 3515;
  autoTag: 'new_condition';
}
```

### جدول ربط الحقول:

| الفلتر | الحقل المطلوب | نوع البيانات | التحقق | الوسم التلقائي |
|--------|---------------|--------------|--------|----------------|
| Family Cars | `seats` | `number` | `>= 7` | `family=true` |
| Sports Cars | `seats`, `engine_hp` | `number`, `number` | `seats=2 && hp>240` | `sports=true` |
| Electric | `fuel_type` | `enum` | `=== 'electric'` | `electric=true` |
| Low Mileage | `mileage` | `number` | `<= 3515` | `new_condition=true` |
| Premium | `is_premium` | `boolean` | Admin verified | `premium=true` |

---

## 4. تصميم واجهة المستخدم وسلوك URL

[⬆️ العودة للمحتويات](#📑-جدول-المحتويات---table-of-contents)

### حالة الفلاتر في URL:
- كل تغيير فلتر يحدث `pushState` مع تحديث Query Params قابلة للمشاركة

```typescript
// مثال على تحديث URL
const updateFilterURL = (filters: FilterState) => {
  const params = new URLSearchParams();
  
  if (filters.brand) params.set('brand', filters.brand);
  if (filters.priceMin) params.set('price_min', filters.priceMin.toString());
  if (filters.priceMax) params.set('price_max', filters.priceMax.toString());
  
  window.history.pushState({}, '', `?${params.toString()}`);
};
```

### Deep Linking:
- ✅ روابط قابلة للمشاركة تعيد نفس النتائج عند الفتح في نافذة جديدة
- ✅ دعم bookmark للبحث المحفوظ

### Reset و Presets:

| Preset | الفلاتر المطبقة | الرابط |
|--------|----------------|--------|
| Family | `?seats_min=7` | `/search?preset=family` |
| Sports | `?seats_max=2&engine_hp_min=241` | `/search?preset=sports` |
| Electric | `?fuel=electric` | `/search?preset=electric` |
| Newly Added | `?sort=created_desc` | `/search?preset=new` |

### Mobile UX:
```
┌─────────────────────────────┐
│  🔍 Search Cars             │
├─────────────────────────────┤
│  [Filter Button] 🎛️         │
│                             │
│  ┌───────────────────────┐  │
│  │ Modal Filter Panel    │  │
│  │ ─────────────────     │  │
│  │ Brand: [Select ▼]     │  │
│  │ Price: [═══●═══]      │  │
│  │ Year:  [2015] - [2024]│  │
│  │                       │  │
│  │ [Reset] [Apply: 234]  │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

### Accessibility:
- ✅ كل عنصر فلتر له `ARIA label`
- ✅ دعم التنقل بالكيبورد (Tab, Enter, Space)
- ✅ قارئات الشاشة مدعومة

---

## 5. بنية API وفلترة على الخادم

[⬆️ العودة للمحتويات](#📑-جدول-المحتويات---table-of-contents)

### Endpoint المركزي:

```
GET /api/search
```

### Query Parameters المدعومة:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `brand` | string | Brand filter | `mazda` |
| `model` | string | Model filter | `mazda6` |
| `price_min` | number | Minimum price | `5000` |
| `price_max` | number | Maximum price | `15000` |
| `year_min` | number | Minimum year | `2015` |
| `year_max` | number | Maximum year | `2023` |
| `fuel` | enum | Fuel type | `electric` |
| `transmission` | enum | Transmission | `automatic` |
| `body_type` | enum | Body type | `suv` |
| `seats_min` | number | Minimum seats | `7` |
| `seats_max` | number | Maximum seats | `2` |
| `mileage_max` | number | Maximum mileage | `100000` |
| `city` | string | City/Region | `sofia` |
| `dealer_verified` | boolean | Verified dealers only | `true` |
| `is_premium` | boolean | Premium listings | `true` |
| `features` | string[] | Features list | `sunroof,nav` |
| `condition` | enum | New/Used | `used` |
| `seller_type` | enum | Dealer/Private | `dealer` |
| `posted_within` | enum | Time range | `7d` |
| `color` | string | Color filter | `black` |
| `vin_checked` | boolean | VIN check available | `true` |
| `sort` | enum | Sort order | `created_desc` |
| `page` | number | Page number | `1` |
| `pageSize` | number | Results per page | `20` |

### مثال استجابة API:

```json
{
  "items": [
    {
      "id": "123",
      "title": "Mazda 6",
      "price": 8600,
      "year": 2011,
      "brand": "Mazda",
      "model": "6",
      "mileage": 150000,
      "fuel_type": "petrol",
      "transmission": "automatic",
      "body_type": "sedan",
      "city": "Sofia",
      "seller_type": "dealer",
      "is_premium": false,
      "images": ["https://..."],
      "created_at": "2026-01-30T10:00:00Z"
    }
  ],
  "facets": {
    "brandCounts": [
      { "brand": "Mazda", "count": 120 },
      { "brand": "BMW", "count": 98 },
      { "brand": "Toyota", "count": 85 }
    ],
    "bodyTypeCounts": [
      { "type": "SUV", "count": 980 },
      { "type": "Sedan", "count": 750 },
      { "type": "Hatchback", "count": 420 }
    ],
    "fuelTypeCounts": [
      { "type": "Petrol", "count": 1200 },
      { "type": "Diesel", "count": 800 },
      { "type": "Electric", "count": 150 }
    ],
    "priceRange": {
      "min": 500,
      "max": 250000
    },
    "yearRange": {
      "min": 1990,
      "max": 2026
    }
  },
  "total": 440,
  "page": 1,
  "pageSize": 20,
  "totalPages": 22
}
```

### Facets و Counts:
- الاستجابة تحتوي `facets` لتغذية العدادات في الواجهة
- تحديث ديناميكي للعدادات عند تغيير الفلاتر

---

## 6. تتبع التحليلات وأحداث القياس

[⬆️ العودة للمحتويات](#📑-جدول-المحتويات---table-of-contents)

### أحداث قياسية:

| Event Name | Payload | Trigger |
|------------|---------|---------|
| `filter_changed` | `{filter_name, value, user_id?}` | عند تغيير أي فلتر |
| `filter_applied` | `{filters, result_count}` | عند تطبيق الفلاتر |
| `listing_viewed` | `{listing_id, source}` | عند عرض إعلان |
| `search_performed` | `{query, filters, result_count}` | عند إجراء بحث |
| `preset_selected` | `{preset_name, filters}` | عند اختيار preset |
| `filter_reset` | `{previous_filters}` | عند مسح الفلاتر |

### مثال تتبع:

```typescript
// تتبع تغيير الفلتر
const trackFilterChange = (filterName: string, value: any) => {
  analytics.track('filter_changed', {
    filter_name: filterName,
    value: value,
    timestamp: new Date().toISOString(),
    page: window.location.pathname
  });
};

// تتبع تطبيق الفلاتر
const trackFiltersApplied = (filters: FilterState, resultCount: number) => {
  analytics.track('filter_applied', {
    filters: filters,
    result_count: resultCount,
    timestamp: new Date().toISOString()
  });
};
```

### UTM و Attribution:

```
Template: ?utm_source={source}&utm_campaign={campaign}&utm_content={content}

مثال: ?utm_source=facebook&utm_campaign=kolione_launch&utm_content=adA
```

| Source | Campaign Example | Content |
|--------|-----------------|---------|
| facebook | `kolione_launch` | `ad_family_cars` |
| google | `kolione_search` | `keyword_used_cars` |
| instagram | `kolione_stories` | `story_electric` |
| email | `newsletter_jan2026` | `cta_browse` |

---

## 7. معايير القبول واختبارات QA

[⬆️ العودة للمحتويات](#📑-جدول-المحتويات---table-of-contents)

### معايير قبول الفلاتر:

| # | المعيار | الحالة |
|---|---------|--------|
| 1 | تغيير أي فلتر يحدث تحديث URL صحيح | ⬜ |
| 2 | إعادة تحميل الصفحة تعيد نفس حالة الفلاتر | ⬜ |
| 3 | مشاركة الرابط في نافذة جديدة يعيد نفس النتائج | ⬜ |
| 4 | العدادات (facets) تتطابق مع نتائج البحث | ⬜ |
| 5 | زر Reset يمسح جميع الفلاتر ويعيد URL للحالة الأصلية | ⬜ |
| 6 | Presets تطبق الفلاتر الصحيحة | ⬜ |

### حالات اختبار مقترحة:

#### Test Case 1: Family Cars Filter
```gherkin
Given أنا في صفحة البحث
When أطبق فلتر seats_min=7
Then كل نتيجة تحتوي seats >= 7
And URL يحتوي ?seats_min=7
```

#### Test Case 2: Sports Cars Filter
```gherkin
Given أنا في صفحة البحث
When أطبق فلتر engine_hp_min=241 و seats_max=2
Then كل نتيجة تحتوي engine_hp > 240 و seats <= 2
And كل نتيجة موسومة sports=true
```

#### Test Case 3: Deep Link Sharing
```gherkin
Given رابط مع fuel=electric
When أفتح الرابط في متصفح جديد
Then الفلاتر مطبقة تلقائياً
And النتائج تعرض سيارات كهربائية فقط
```

#### Test Case 4: URL State Persistence
```gherkin
Given فلاتر مطبقة (brand=mazda, price_max=15000)
When أعيد تحميل الصفحة
Then نفس الفلاتر مطبقة
And نفس النتائج معروضة
```

#### Test Case 5: Facets Accuracy
```gherkin
Given فلتر body_type=suv مطبق
When أنظر للعدادات
Then عداد SUV يساوي عدد النتائج الفعلي
```

---

## 8. أولويات التنفيذ وتقديرات زمنية مقترحة

[⬆️ العودة للمحتويات](#📑-جدول-المحتويات---table-of-contents)

### المرحلة 1: Critical (أسبوع 1)

| المهمة | الفريق | التقدير |
|--------|--------|---------|
| Persistent URL state | Frontend | 1 يوم |
| Price/Brand/Model filters | Frontend | 2 يوم |
| Body Type filter | Frontend | 0.5 يوم |
| API search endpoint | Backend | 2 يوم |

**إجمالي التقدير:** 3-5 أيام عمل فريق Frontend + Backend

### المرحلة 2: High (أسبوع 2)

| المهمة | الفريق | التقدير |
|--------|--------|---------|
| Deep filters (mileage, engine_hp) | Frontend | 2 يوم |
| Drive Type landing pages | Frontend | 1 يوم |
| Geo targeting (city/region) | Backend + Frontend | 2 يوم |
| Facets implementation | Backend | 2 يوم |

**إجمالي التقدير:** 4-7 أيام

### المرحلة 3: Medium (أسبوع 3)

| المهمة | الفريق | التقدير |
|--------|--------|---------|
| Dealer verified flags | Backend | 1 يوم |
| Premium badges | Frontend + Backend | 2 يوم |
| Recently viewed cross-device sync | Backend | 2 يوم |

**إجمالي التقدير:** 5 أيام

### المرحلة 4: Polish (أسبوع 4)

| المهمة | الفريق | التقدير |
|--------|--------|---------|
| SEO schema markup | Frontend | 1 يوم |
| Accessibility pass | Frontend | 1 يوم |
| Analytics hardening | Full Stack | 0.5 يوم |
| Creative presets | Design + Frontend | 0.5 يوم |

**إجمالي التقدير:** 3 أيام

### Timeline Overview:

```
Week 1 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       │ URL State │ Basic Filters │ API Endpoint │
       
Week 2 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       │ Deep Filters │ Landing Pages │ Geo Targeting │
       
Week 3 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       │ Dealer Verification │ Premium Badges │ Cross-device │
       
Week 4 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       │ SEO │ A11y │ Analytics │ Presets │
```

---

## 9. كيف نطبّق المنطق على بقية الأقسام الـ15 بإبداع ودقة

[⬆️ العودة للمحتويات](#📑-جدول-المحتويات---table-of-contents)

### ربط كل قسم بفلاتر مخصصة:

| Section | الفلاتر المستخدمة | API Params |
|---------|------------------|------------|
| Section 1: Hero Search | All basic filters | `?brand=&model=&price_min=` |
| Section 2: Quick Categories | `body_type` presets | `?body_type=suv` |
| Section 3: Featured Listings | `is_featured=true` | `?is_featured=true` |
| Section 4: Price Ranges | `price_min`, `price_max` | `?price_min=5000&price_max=10000` |
| Section 5: Body Types | `body_type` with counts | `?body_type=sedan` |
| Section 6: Latest Listings | `sort=created_desc`, `region` | `?sort=created_desc&region=sofia` |
| Section 7: Popular Brands | `brandCounts` facet | `?brand=bmw` |
| Section 8: Electric/Hybrid | `fuel=electric\|hybrid` | `?fuel=electric` |
| Section 9: Budget Cars | `price_max=5000` | `?price_max=5000` |
| Section 10: Premium Listings | `is_premium=true` | `?is_premium=true` |
| Section 11: Verified Dealers | `dealer_verified=true`, `seller_type=dealer` | `?dealer_verified=true&seller_type=dealer` |
| Section 12: Recently Viewed | User-specific, cookies/localStorage | N/A (client-side) |
| Section 13: Popular Searches | Analytics-driven | Cached popular queries |
| Section 14: City Spotlights | `city` filter | `?city=plovdiv` |
| Section 15: Newsletter/CTA | N/A | N/A |

### قواعد تجميع ذكية (ETL Rules):

```typescript
// قواعد التصنيف التلقائي
const classificationRules = {
  family: (car) => car.seats >= 7,
  sports: (car) => car.seats === 2 && car.engine_hp > 240,
  economy: (car) => car.fuel_consumption < 6 || car.fuel_type === 'electric',
  luxury: (car) => car.price > 50000 || car.is_premium,
  budget: (car) => car.price < 5000
};

// تطبيق القواعد عند الإضافة
const autoClassify = (car: Car): string[] => {
  const tags: string[] = [];
  for (const [tag, rule] of Object.entries(classificationRules)) {
    if (rule(car)) tags.push(tag);
  }
  return tags;
};
```

### لوحات تحكم للـ Editors:

| الميزة | الوصف | الأولوية |
|--------|-------|----------|
| Manual Premium Tagging | وسم الإعلانات كـ Premium يدوياً | High |
| Verification Dashboard | لوحة تحقق من التجار | High |
| Change Log | سجل تغييرات الوسوم | Medium |
| Badge Expiry | تاريخ انتهاء البادج | Medium |

### توسيع AI:

```typescript
// استخدام AI لتصنيف الصور واستخراج الميزات
interface AIFeatureExtraction {
  detectSunroof: (imageUrl: string) => Promise<boolean>;
  detectLeatherSeats: (imageUrl: string) => Promise<boolean>;
  detectNavigationSystem: (imageUrl: string) => Promise<boolean>;
  extractAllFeatures: (images: string[]) => Promise<string[]>;
}

// ملء حقل features تلقائياً
const autoPopulateFeatures = async (car: Car): Promise<Car> => {
  const detectedFeatures = await aiService.extractAllFeatures(car.images);
  return {
    ...car,
    features: [...car.features, ...detectedFeatures]
  };
};
```

---

## 10. الخطوة التالية التي سأقوم بها تلقائياً

[⬆️ العودة للمحتويات](#📑-جدول-المحتويات---table-of-contents)

### المهام التلقائية:

| # | المهمة | الملف الناتج | الحالة |
|---|--------|-------------|--------|
| 1 | توليد IMPLEMENTATION_MANIFEST.json | `TASKS/IMPLEMENTATION_MANIFEST.json` | ✅ مكتمل |
| 2 | إنشاء SECTION_REPORT مفصّل لكل فلتر | `REPORTS/SECTION_REPORT_01..15.md` | ✅ مكتمل |
| 3 | تحديث MISSING_ITEMS_SUMMARY.md | `REPORTS/MISSING_ITEMS_SUMMARY.md` | ✅ مكتمل |
| 4 | **إنشاء خدمة الفلاتر الرئيسية** | `src/services/filters/homepage-filter.service.ts` | ✅ مكتمل |
| 5 | **إنشاء خدمة حالة URL** | `src/services/filters/filter-url-state.service.ts` | ✅ مكتمل |
| 6 | **إنشاء خدمة التحليلات** | `src/services/filters/filter-analytics.service.ts` | ✅ مكتمل |
| 7 | **إنشاء Hook للفلاتر** | `src/hooks/filters/useHomepageFilters.ts` | ✅ مكتمل |
| 8 | **تحديث الأنواع** | `src/types/showcase.types.ts` | ✅ مكتمل |
| 9 | **تحديث queryBuilder.service.ts** | `src/services/queryBuilder.service.ts` | ✅ مكتمل |
| 10 | **إضافة المسارات الجديدة** | `src/routes/MainRoutes.tsx` | ✅ مكتمل |

### هيكل IMPLEMENTATION_MANIFEST.json:

```json
{
  "tasks": [
    {
      "section_id": "SEC-01",
      "task_id": "TASK-001",
      "title": "Implement persistent URL state for filters",
      "owner": "Frontend Team",
      "priority": "Critical",
      "estimate_hours": 8,
      "acceptance_criteria": [
        "URL updates on filter change",
        "Page reload restores filter state",
        "Shareable links work correctly"
      ]
    }
  ]
}
```

---

## 11. خاتمة وتنفيذ عملي فوري

[⬆️ العودة للمحتويات](#📑-جدول-المحتويات---table-of-contents)

### ملخص الخطة:

الخطة أعلاه تحول المنطق الوصفي إلى **خارطة طريق تنفيذية** قابلة للتنفيذ فوراً.

### الملفات المُنشأة:

| الملف | المسار | الوصف |
|-------|--------|-------|
| Implementation Manifest | `TASKS/IMPLEMENTATION_MANIFEST.json` | قائمة المهام بصيغة JSON |
| Section Reports | `REPORTS/SECTION_REPORT_01..15.md` | تقارير تفصيلية لكل قسم |
| Missing Items | `REPORTS/MISSING_ITEMS_SUMMARY.md` | ملخص العناصر الناقصة |
| QA Test Cases | `QA/TRIAL_TESTCASES.md` | حالات الاختبار |
| **This Plan** | `REPORTS/INTEGRATED_FILTER_PLAN.md` | هذا الملف |

### الخطوات التالية:

1. ✅ مراجعة هذه الخطة
2. ⬜ تنفيذ المرحلة 1 (Critical)
3. ⬜ اختبار وتحقق
4. ⬜ الانتقال للمرحلة 2

---

## 12. أوامر جاهزة يمكنك لصقها مباشرة

[⬆️ العودة للمحتويات](#📑-جدول-المحتويات---table-of-contents)

### أوامر التوليد:

```
Start: Produce SECTION_REPORT_01.md now. Include: current state, missing items, 
tasks with owners and estimates, API contract example, QA test cases, SEO notes. 
Save to REPORTS/SECTION_REPORT_01.md.
```

```
Next: Produce SECTION_REPORT_02.md with same template. 
Save to REPORTS/SECTION_REPORT_02.md.
```

```
After all sections: Aggregate tasks into TASKS/IMPLEMENTATION_MANIFEST.json 
with fields section_id, task_id, title, owner, priority, estimate_hours, 
acceptance_criteria.
```

### أوامر التصحيح:

```
Revise SECTION_REPORT_03.md: add API endpoint examples and include sample 
response for GET /api/premium.
```

```
Re-estimate tasks in SECTION_REPORT_05.md with senior frontend and backend 
effort assumptions.
```

---

## 13. قائمة تحقق سريعة لكل مخرَج قبل الانتقال للقسم التالي

[⬆️ العودة للمحتويات](#📑-جدول-المحتويات---table-of-contents)

### Checklist:

| # | البند | الحالة |
|---|-------|--------|
| 1 | وجود كل البنود المطلوبة: current state, missing items, tasks, API, QA, SEO | ⬜ |
| 2 | أمثلة حقيقية: حقل API واحد على الأقل مع payload مثال | ⬜ |
| 3 | معايير قبول: لكل مهمة يوجد acceptance criteria قابل للاختبار | ⬜ |
| 4 | تقدير جهد: ساعات معقولة وموزعة حسب المالك | ⬜ |
| 5 | روابط ملفات: مسارات حفظ REPORTS/ و TASKS/ صحيحة | ⬜ |
| 6 | أحداث تتبع: event names موحّدة (filter_changed, listing_viewed) | ⬜ |

---

## 14. كيف تتعامل مع الأخطاء أو النواقص من الموديل

[⬆️ العودة للمحتويات](#📑-جدول-المحتويات---table-of-contents)

### إذا التقرير ناقص:

```
Revise SECTION_REPORT_03.md: add API endpoint examples and include sample 
response for GET /api/premium.
```

### إذا التقديرات غير واقعية:

```
Re-estimate tasks in SECTION_REPORT_05.md with senior frontend and backend 
effort assumptions.
```

### إذا الأمثلة غير كافية:

```
Add 3 more QA test cases to SECTION_REPORT_07.md covering edge cases for 
price range filter.
```

### إذا الـ API غير مكتمل:

```
Complete API contract in SECTION_REPORT_11.md with error response examples 
and rate limiting headers.
```

---

## 15. تسلسل تنفيذ مقترح وزمني (فريق صغير)

[⬆️ العودة للمحتويات](#📑-جدول-المحتويات---table-of-contents)

### الجدول الزمني:

| اليوم | المهام | المخرجات |
|-------|--------|----------|
| **يوم 1** | تشغيل الموديل لإنتاج التقارير 01–05، مراجعة سريعة | `SECTION_REPORT_01..05.md` |
| **يوم 2** | إنتاج التقارير 06–10، دمج الملاحظات من اليوم 1 | `SECTION_REPORT_06..10.md` |
| **يوم 3** | إنتاج التقارير 11–15، توليد MANIFEST و SUMMARY | `SECTION_REPORT_11..15.md`, `IMPLEMENTATION_MANIFEST.json`, `MISSING_ITEMS_SUMMARY.md` |
| **يوم 4–7** | تنفيذ Critical fixes | Persistent URL, Filters, Analytics, API |

### Gantt Chart:

```
Day 1  ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
       Reports 01-05

Day 2  ░░░░░░░░████████░░░░░░░░░░░░░░░░░░░░░░
       Reports 06-10

Day 3  ░░░░░░░░░░░░░░░░████████░░░░░░░░░░░░░░
       Reports 11-15 + Aggregation

Day 4-7 ░░░░░░░░░░░░░░░░░░░░░░░░████████████████
        Implementation Sprint
```

---

## 16. نصيحة عملية لكتابة الأوامر للموديل

[⬆️ العودة للمحتويات](#📑-جدول-المحتويات---table-of-contents)

### أفضل الممارسات:

| النصيحة | المثال |
|---------|--------|
| **كن محدداً** | اذكر اسم الملف الناتج، الحقول المطلوبة، صيغة الحفظ |
| **اطلب أمثلة واقعية** | payload JSON، أسماء أحداث analytics، مسارات API |
| **اطلب قوائم مهام** | قوائم قابلة للتنفيذ مع مالك وتقدير ساعات |
| **اطلب حالات اختبار** | حالات قصيرة قابلة للتنفيذ يدوياً وذاتياً |

### مثال أمر مثالي:

```
Generate SECTION_REPORT_08.md for "Electric & Hybrid Vehicles" section.

Include:
1. Current state analysis with file paths
2. Missing items list with priority
3. 5 tasks with owner (Frontend/Backend/Full Stack), estimate in hours
4. API contract with GET /api/search?fuel=electric example
5. 3 QA test cases in Gherkin format
6. SEO recommendations for landing page

Save to: REPORTS/SECTION_REPORT_08.md
```

---

## 📎 ملفات ذات صلة - Related Files

| الملف | الوصف | الرابط |
|-------|-------|--------|
| Section Report 01 | Hero Search | [SECTION_REPORT_01.md](./SECTION_REPORT_01.md) |
| Section Report 02 | Quick Categories | [SECTION_REPORT_02.md](./SECTION_REPORT_02.md) |
| Section Report 03 | Featured Listings | [SECTION_REPORT_03.md](./SECTION_REPORT_03.md) |
| Section Report 04 | Price Ranges | [SECTION_REPORT_04.md](./SECTION_REPORT_04.md) |
| Section Report 05 | Body Types | [SECTION_REPORT_05.md](./SECTION_REPORT_05.md) |
| Section Report 06 | Latest Listings | [SECTION_REPORT_06.md](./SECTION_REPORT_06.md) |
| Section Report 07 | Popular Brands | [SECTION_REPORT_07.md](./SECTION_REPORT_07.md) |
| Section Report 08 | Electric/Hybrid | [SECTION_REPORT_08.md](./SECTION_REPORT_08.md) |
| Section Report 09 | Budget Cars | [SECTION_REPORT_09.md](./SECTION_REPORT_09.md) |
| Section Report 10 | Premium Listings | [SECTION_REPORT_10.md](./SECTION_REPORT_10.md) |
| Section Report 11 | Verified Dealers | [SECTION_REPORT_11.md](./SECTION_REPORT_11.md) |
| Section Report 12 | Recently Viewed | [SECTION_REPORT_12.md](./SECTION_REPORT_12.md) |
| Section Report 13 | Popular Searches | [SECTION_REPORT_13.md](./SECTION_REPORT_13.md) |
| Section Report 14 | City Spotlights | [SECTION_REPORT_14.md](./SECTION_REPORT_14.md) |
| Section Report 15 | Newsletter/CTA | [SECTION_REPORT_15.md](./SECTION_REPORT_15.md) |
| Implementation Manifest | JSON Task List | [IMPLEMENTATION_MANIFEST.json](../TASKS/IMPLEMENTATION_MANIFEST.json) |
| Missing Items Summary | Gap Analysis | [MISSING_ITEMS_SUMMARY.md](./MISSING_ITEMS_SUMMARY.md) |
| QA Test Cases | Trial Tests | [TRIAL_TESTCASES.md](../QA/TRIAL_TESTCASES.md) |

---

> **آخر تحديث:** 30 يناير 2026  
> **المؤلف:** GitHub Copilot  
> **الإصدار:** 1.0
