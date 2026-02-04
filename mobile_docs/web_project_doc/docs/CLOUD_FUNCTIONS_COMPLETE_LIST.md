# ☁️ Cloud Functions Complete List (Jan 17, 2026)

**المراجعة:** 17 يناير 2026  
**الإصدار:** 2.1 (29+ functions)  
**الحالة:** ✅ إنتاج جاهز  
**الموقع:** `functions/src/`

---

## 📋 جدول المحتويات

1. [ملخص](#ملخص)
2. [خدمات الرسائل](#خدمات-الرسائل)
3. [خدمات الإشعارات](#خدمات-الإشعارات)
4. [خدمات البحث والفهرسة](#خدمات-البحث-والفهرسة)
5. [خدمات الصور والوسائط](#خدمات-الصور-والوسائط)
6. [خدمات الذكاء الاصطناعي](#خدمات-الذكاء-الاصطناعي)
7. [خدمات تسويقية](#خدمات-تسويقية)
8. [خدمات العمليات المجدولة](#خدمات-العمليات-المجدولة)
9. [خدمات SEO](#خدمات-seo)
10. [خدمات الدفع](#خدمات-الدفع)

---

## ملخص

```
Total Cloud Functions: 29

┌─────────────────────────────────────────┐
│ Realtime Database Functions (3)         │
├─────────────────────────────────────────┤
│ Firestore Trigger Functions (8)         │
├─────────────────────────────────────────┤
│ HTTP Functions (6)                      │
├─────────────────────────────────────────┤
│ Scheduled Functions (4)                 │
├─────────────────────────────────────────┤
│ Storage Functions (2)                   │
├─────────────────────────────────────────┤
│ Admin Functions (6)                     │
└─────────────────────────────────────────┘
```

---

## خدمات الرسائل

### 1. onNewMessage
- **نوع:** Realtime Database Trigger
- **المسار:** `/channels/{channelId}/messages/{messageId}`
- **الفعل:** إنشاء رسالة جديدة
- **المهام:**
  - حفظ الرسالة في Firestore
  - إرسال إشعارات دفع
  - تحديث آخر رسالة في الناول
  - معالجة الملفات المرفقة
- **الملف:** `functions/src/messaging/on-new-message.ts`

### 2. onMessageDeleted
- **نوع:** Realtime Database Trigger
- **المسار:** `/channels/{channelId}/messages/{messageId}`
- **الفعل:** حذف رسالة
- **المهام:**
  - حذف من Firestore
  - حذف الملفات المرفقة من Storage
  - تحديث عداد الرسائل
- **الملف:** `functions/src/messaging/on-message-deleted.ts`

### 3. notifyOnNewMessage
- **نوع:** HTTP Function
- **الإجراء:** `POST /notifyOnNewMessage`
- **المهام:**
  - إرسال إشعارات دفع (FCM)
  - إرسال بريد إلكتروني
  - تحديث سجل الإخطارات
- **الملف:** `functions/src/notifications/notify-on-new-message.ts`

---

## خدمات الإشعارات

### 4. onNewCarPosted
- **نوع:** Firestore Trigger (collections: passenger_cars, suvs, vans, etc.)
- **الفعل:** إنشاء سيارة جديدة
- **المهام:**
  - إرسال إخطارات للمتابعين
  - تحديث طعوم (feeds)
  - تسجيل في التحليلات
- **الملف:** `functions/src/notifications/on-new-car-posted.ts`

### 5. onPriceUpdate
- **نوع:** Firestore Trigger
- **الفعل:** تحديث سعر السيارة
- **المهام:**
  - إرسال إخطارات بتغيير السعر
  - تسجيل السعر الجديد
- **الملف:** `functions/src/notifications/on-price-update.ts`

### 6. onNewInquiry
- **نوع:** Firestore Trigger
- **الفعل:** استفسار جديد
- **المهام:**
  - إرسال إخطارات للبائع
  - تسجيل في CRM
  - معالجة تحديد الموعد
- **الملف:** `functions/src/notifications/on-new-inquiry.ts`

### 7. onNewOffer
- **نوع:** Firestore Trigger
- **الفعل:** عرض جديد من المشتري
- **المهام:**
  - إرسال إخطارات للبائع
  - تسجيل في سجل العروض
  - إرسال تفاصيل العرض
- **الملف:** `functions/src/notifications/on-new-offer.ts`

### 8. onVerificationUpdate
- **نوع:** Firestore Trigger
- **الفعل:** تحديث حالة التحقق
- **المهام:**
  - إرسال إشعار بالتحقق
  - تفعيل ميزات جديدة
  - إرسال شهادة التحقق
- **الملف:** `functions/src/notifications/on-verification-update.ts`

### 9. notifyFollowersOnNewCar
- **نوع:** HTTP Function
- **الإجراء:** `POST /notifyFollowersOnNewCar`
- **المهام:**
  - إرسال إخطارات لجميع المتابعين
  - معالجة دفعات الإخطارات
  - تتبع معدل الفتح
- **الملف:** `functions/src/notifications/notify-followers-on-new-car.ts`

### 10. cleanupOldNotifications
- **نوع:** Scheduled Function (يومي)
- **الفعل:** تنظيف الإخطارات القديمة
- **المهام:**
  - حذف إخطارات أقدم من 30 يوم
  - تحرير مساحة التخزين
- **الملف:** `functions/src/scheduled/cleanup-old-notifications.ts`

### 11. dailyReminder
- **نوع:** Scheduled Function (يومي)
- **الفعل:** إرسال تذكيرات يومية
- **المهام:**
  - تذكيرات البائعين بقوائمهم
  - تذكيرات المشترين بقوائمهم المفضلة
  - تنبيهات الأسعار
- **الملف:** `functions/src/scheduled/daily-reminder.ts`

---

## خدمات البحث والفهرسة

### 12-17. syncCarsToAlgolia (6 functions)

```
├── syncPassengerCarsToAlgolia
├── syncSuvsToAlgolia
├── syncVansToAlgolia
├── syncMotorcyclesToAlgolia
├── syncTrucksToAlgolia
├── syncBusesToAlgolia
└── batchSyncAllCarsToAlgolia
```

- **نوع:** Firestore Triggers
- **الفعل:** تحديث/حذف/إنشاء سيارة
- **المهام:**
  - مزامنة مع Algolia
  - تحديث الفهارس
  - تحديث الترتيب
- **الملف:** `functions/src/algolia/sync-cars-to-algolia.ts`

### 18. searchHandler
- **نوع:** HTTP Function
- **الإجراء:** `POST /search`
- **المهام:**
  - البحث المتقدم
  - تجميع النتائج
  - إرجاع النتائج المرتبة
- **الملف:** `functions/src/search/search-handler.ts`

---

## خدمات الصور والوسائط

### 19. optimizeUploadedImage
- **نوع:** Storage Trigger
- **الفعل:** تحميل صورة جديدة
- **المهام:**
  - ضغط الصورة
  - تحويل إلى WebP
  - إنشاء نسخ (thumbnails)
  - التحقق من الجودة
- **الملف:** `functions/src/image-optimizer.ts`

### 20. cleanupDeletedImages
- **نوع:** Storage Trigger
- **الفعل:** حذف صورة
- **المهام:**
  - حذف النسخ المختلفة
  - تحرير المساحة
  - تحديث قائمة الصور
- **الملف:** `functions/src/image-cleanup.ts`

---

## خدمات الذكاء الاصطناعي

### 21. aiGenerateCarDescription
- **نوع:** HTTP Function
- **الإجراء:** `POST /aiGenerateCarDescription`
- **المهام:**
  - توليد الأوصاف بـ Gemini
  - تحسين العناوين
  - الترجمة التلقائية
- **الملف:** `functions/src/ai/ai-generate-car-description.ts`

### 22. aiGenerateText
- **نوع:** HTTP Function
- **الإجراء:** `POST /aiGenerateText`
- **المهام:**
  - توليد نصوص متقدمة
  - معالجة المحتوى
  - تحليل النوايا
- **الملف:** `functions/src/ai/ai-generate-text.ts`

### 23. hybridAIProxy
- **نوع:** HTTP Function
- **الإجراء:** `POST /hybridAIProxy`
- **المهام:**
  - توجيه الطلبات بين مزودي AI
  - موازنة الحمل
  - إدارة الفشل والتجاوز
- **الملف:** `functions/src/ai/hybrid-ai-proxy.ts`

### 24. evaluateCar
- **نوع:** HTTP Function
- **الإجراء:** `POST /evaluateCar`
- **المهام:**
  - تقييم السيارة
  - كشف الأضرار
  - تحليل الصور
- **الملف:** `functions/src/ai/evaluate-car.ts`

---

## خدمات تسويقية

### 25. syncCarsToGoogleAds
- **نوع:** Firestore Trigger
- **الفعل:** إنشاء/تحديث سيارة
- **المهام:**
  - مزامنة مع Google Ads
  - تحديث خلاصات الإعلانات
  - تتبع الأداء
- **الملف:** `functions/src/marketing/sync-cars-to-google-ads.ts`

### 26. syncCarsToFacebookAds
- **نوع:** Firestore Trigger
- **الفعل:** إنشاء/تحديث سيارة
- **المهام:**
  - مزامنة مع Facebook Catalog
  - إنشاء إعلانات ديناميكية
  - تحديث المخزون
- **الملف:** `functions/src/marketing/sync-cars-to-facebook-ads.ts`

---

## خدمات العمليات المجدولة

### 27. archiveSoldCars
- **نوع:** Scheduled Function (يومي)
- **الفعل:** أرشفة السيارات المباعة
- **المهام:**
  - نقل السيارات إلى مجلد الأرشيف
  - تحديث الإحصائيات
  - تنظيف الملفات المؤقتة
- **الملف:** `functions/src/scheduled/archive-sold-cars.ts`

### 28. cleanupExpiredDrafts
- **نوع:** Scheduled Function (يومي)
- **الفعل:** حذف المسودات المنتهية
- **المهام:**
  - حذف المسودات القديمة
  - تحرير المساحة
  - إرسال تنبيهات للمستخدمين
- **الملف:** `functions/src/scheduled/cleanup-expired-drafts.ts`

### 29. manualArchiveSoldCars
- **نوع:** HTTP Function (Admin)
- **الإجراء:** `POST /admin/manualArchiveSoldCars`
- **المهام:**
  - أرشفة يدوية للسيارات
  - تحديث الحالة
  - إرسال تقارير
- **الملف:** `functions/src/admin/manual-archive-sold-cars.ts`

---

## خدمات SEO

### 30. sitemap
- **نوع:** HTTP Function
- **الإجراء:** `GET /sitemap.xml`
- **المهام:**
  - توليد خريطة الموقع
  - تحديث الأولويات
  - تقديم لـ Google
- **الملف:** `functions/src/seo/sitemap.ts`

### 31. merchantFeedGenerator
- **نوع:** Scheduled Function (يومي)
- **الفعل:** توليد خلاصة التاجر
- **المهام:**
  - توليد Google Shopping feed
  - تحديث الفهارس
  - تحسين البيانات
- **الملف:** `functions/src/seo/merchant-feed-generator.ts`

### 32. updateMerchantFeedCache
- **نوع:** Firestore Trigger
- **الفعل:** تحديث سيارة
- **المهام:**
  - تحديث ذاكرة التخزين المؤقت
  - تحديث الخلاصات
  - إعادة فهرسة
- **الملف:** `functions/src/seo/update-merchant-feed-cache.ts`

### 33. prerender SEO
- **نوع:** HTTP Function
- **الإجراء:** `GET /prerender`
- **المهام:**
  - عرض قبلي (prerendering)
  - تحسين SEO
  - تحسين الأداء
- **الملف:** `functions/src/seo/prerender-seo.ts`

### 34. requestIndexing
- **نوع:** HTTP Function
- **الإجراء:** `POST /requestIndexing`
- **المهام:**
  - طلب فهرسة من Google
  - تتبع حالة الفهرسة
  - إعادة محاولة
- **الملف:** `functions/src/seo/request-indexing.ts`

### 35. logSearchEvent
- **نوع:** HTTP Function
- **الإجراء:** `POST /logSearchEvent`
- **المهام:**
  - تسجيل أحداث البحث
  - تحليل الكلمات المفتاحية
  - تحسين السيو
- **الملف:** `functions/src/seo/log-search-event.ts`

---

## خدمات الدفع

### 36. stripeWebhooks
- **نوع:** HTTP Function
- **الإجراء:** `POST /stripe/webhooks` (Deprecated - Manual Payment)
- **المهام:**
  - معالجة أحداث Stripe
  - تحديث حالات الدفع
  - تفعيل الاشتراكات
- **الملف:** `functions/src/stripe-webhooks.ts`
- **الحالة:** ⚠️ مُستَبدَل بنظام التحويل البنكي اليدوي (Jan 9-16)

---

## خدمات إضافية

### Analytics & Reporting
- B2B Analytics Export
- Export B2B Leads
- Get B2B Analytics

### Admin Functions
- User Management
- Role Assignment
- Report Generation

---

## نشر Cloud Functions

### الخطوة 1: التثبيت

```bash
cd functions
npm install
```

### الخطوة 2: تكوين Firestore

```bash
firebase functions:config:set algolia.app_id="YOUR_APP_ID"
firebase functions:config:set algolia.admin_key="YOUR_ADMIN_KEY"
firebase functions:config:set stripe.secret_key="YOUR_SECRET_KEY"
```

### الخطوة 3: النشر

```bash
firebase deploy --only functions

# أو نشر دوال محددة
firebase deploy --only functions:syncPassengerCarsToAlgolia,functions:onNewMessage
```

### الخطوة 4: المراقبة

```bash
firebase functions:log
firebase functions:list
firebase functions:describe onNewMessage
```

---

## الملفات والهياكل

```
functions/
├── src/
│   ├── index.ts                    # نقطة الدخول الرئيسية
│   ├── messaging/
│   │   ├── on-new-message.ts
│   │   └── on-message-deleted.ts
│   ├── notifications/
│   │   ├── on-new-car-posted.ts
│   │   ├── notify-on-new-message.ts
│   │   └── notify-followers-on-new-car.ts
│   ├── algolia/
│   │   └── sync-cars-to-algolia.ts (6 functions)
│   ├── image-optimizer.ts
│   ├── ai/
│   │   ├── ai-generate-car-description.ts
│   │   ├── ai-generate-text.ts
│   │   ├── hybrid-ai-proxy.ts
│   │   └── evaluate-car.ts
│   ├── marketing/
│   │   ├── sync-cars-to-google-ads.ts
│   │   └── sync-cars-to-facebook-ads.ts
│   ├── seo/
│   │   ├── sitemap.ts
│   │   ├── merchant-feed-generator.ts
│   │   └── request-indexing.ts
│   ├── scheduled/
│   │   ├── archive-sold-cars.ts
│   │   ├── cleanup-expired-drafts.ts
│   │   └── cleanup-old-notifications.ts
│   ├── admin/
│   │   └── manual-archive-sold-cars.ts
│   └── stripe-webhooks.ts
├── package.json
└── tsconfig.json
```

---

## الخلاصة

✅ **29+ Cloud Functions مع:**
- ✅ معالجة الرسائل الفعلية
- ✅ إرسال إخطارات شاملة
- ✅ مزامنة محركات البحث
- ✅ معالجة الصور والوسائط
- ✅ خدمات الذكاء الاصطناعي
- ✅ تسويق وSEO
- ✅ العمليات المجدولة

**التاريخ:** 17 يناير 2026  
**الحالة:** ✅ إنتاج جاهز
