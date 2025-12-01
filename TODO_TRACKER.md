# 📝 TODO Tracker - مهام المشروع المتبقية

**تاريخ الإنشاء**: 1 ديسمبر 2025  
**آخر تحديث**: 1 ديسمبر 2025

---

## 🎯 ملخص سريع

| الفئة | العدد | الأولوية |
|-------|-------|----------|
| **Stripe/Payments** | 10 | 🔴 عالية |
| **Verification** | 8 | 🔴 عالية |
| **Analytics** | 12 | 🟡 متوسطة |
| **Performance** | 5 | 🟡 متوسطة |
| **UI Features** | 15 | 🟢 منخفضة |
| **المجموع** | 50 | - |

---

## 🔴 أولوية عالية (يجب إكمالها قبل الإطلاق)

### 1. Stripe Integration (10 TODO)

#### الملف: `services/stripe-service.ts`
- [ ] إضافة Stripe API Keys
- [ ] تفعيل Webhooks
- [ ] اختبار الدفع

#### الملف: `features/billing/BillingService.ts`
```typescript
// Line 125
// TODO: Call Cloud Function to create Stripe Checkout Session

// Line 144
// TODO: Cancel in Stripe

// Line 156
// TODO: Query invoices collection

// Line 165
// TODO: Update in Stripe
```

**الخطوات المطلوبة**:
1. الحصول على Stripe API Keys من [stripe.com](https://stripe.com)
2. إضافة Keys إلى `.env`:
   ```
   REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```
3. إنشاء Cloud Function لـ Checkout Session
4. تفعيل Webhooks في Stripe Dashboard
5. اختبار الدفع التجريبي

---

### 2. Email Service (5 TODO)

#### الملف: `features/verification/VerificationService.ts`
```typescript
// Line 218
// TODO: Send email notification to admin

// Line 219
// TODO: Send confirmation email to user

// Line 287
// TODO: Send approval email to user

// Line 321
// TODO: Send rejection email to user with reason
```

**الخطوات المطلوبة**:
1. اختيار خدمة Email (SendGrid, Mailgun, أو Firebase Extensions)
2. إعداد Templates للإيميلات
3. تكامل مع Firebase Functions
4. اختبار إرسال الإيميلات

---

### 3. Verification System (3 TODO)

#### الملف: `features/verification/VerificationService.ts`
```typescript
// Line 288
// TODO: Log action in adminLogs

// Line 322
// TODO: Log action in adminLogs
```

#### الملف: `features/verification/AdminApprovalQueue.tsx`
```typescript
// Line 327
// TODO: Call Bulgarian Trade Registry API
```

**الخطوات المطلوبة**:
1. إنشاء collection `adminLogs` في Firestore
2. إضافة logging function
3. (اختياري) تكامل مع Bulgarian Trade Registry API

---

## 🟡 أولوية متوسطة (يمكن إكمالها بعد الإطلاق)

### 4. Analytics Tracking (12 TODO)

#### الملف: `services/social/analytics.service.ts`
```typescript
// Line 320
// TODO: Implement daily follower growth tracking

// Line 325
// TODO: Implement engagement trend calculation

// Line 330
// TODO: Implement car views trend tracking

// Line 335
// TODO: Implement inquiries trend tracking
```

#### الملف: `services/monitoring-service.ts`
```typescript
// Line 84
// TODO: Send to analytics service (Google Analytics, Mixpanel, etc.)

// Line 528
// TODO: Send to Google Analytics, Mixpanel, or other analytics service
```

#### الملف: `pages/01_main-pages/home/HomePage/`
```typescript
// DealerSpotlight.tsx
// Line 110-112
// TODO(analytics): Fire 'home_dealerspotlight_view' when visible
// TODO(analytics): Track 'home_dealerspotlight_click_dealer' with dealer id
// TODO(analytics): Track 'home_dealerspotlight_view_all'

// LifeMomentsBrowse.tsx
// Line 94-95
// TODO(analytics): Fire 'home_lifemoments_view' once visible
// TODO(analytics): Track 'home_lifemoments_click' with moment key

// LoyaltyBanner.tsx
// Line 140-141
// TODO(analytics): Fire 'home_loyaltybanner_view' when visible & unauthenticated
// TODO(analytics): Track 'home_loyaltybanner_signup_click' & 'home_loyaltybanner_signin_click'

// TrustStrip.tsx
// Line 98-99
// TODO(analytics): fire 'home_truststrip_view' when component becomes visible
// TODO(analytics): track clicks on browse and sell buttons
```

**الخطوات المطلوبة**:
1. اختيار منصة Analytics (Google Analytics 4, Mixpanel, Amplitude)
2. إنشاء Event Tracking System
3. تفعيل IntersectionObserver للـ view events
4. إضافة onClick handlers للـ click events

---

### 5. Performance Optimization (5 TODO)

#### الملف: `services/performance-service.ts`
```typescript
// Line 281
// TODO: Implement compression using a library like pako or lz-string

// Line 336
// TODO: Implement decompression using a library like pako or lz-string
```

#### الملف: `services/analytics/car-analytics.service.ts`
```typescript
// Line 215
// TODO: Implement actual aggregation across user's cars
```

**الخطوات المطلوبة**:
1. تثبيت مكتبة compression (pako أو lz-string)
2. تطبيق compression للبيانات الكبيرة
3. تحسين aggregation queries

---

## 🟢 أولوية منخفضة (ميزات إضافية)

### 6. UI Features (15 TODO)

#### الملف: `pages/07_advanced-features/EventsPage/index.tsx`
```typescript
// Line 201
// TODO: Open event creator modal
```

#### الملف: `pages/03_user-pages/notifications/NotificationsPage/index.tsx`
```typescript
// Line 111
// TODO: Update in Firebase

// Line 118
// TODO: Update in Firebase

// Line 123
// TODO: Delete from Firebase
```

#### الملف: `components/Stories/StoriesCarousel.tsx`
```typescript
// Line 234
// TODO: Open story creator modal
```

#### الملف: `components/Profile/CoverImageUploader.tsx`
```typescript
// Line 436
// TODO: Implement drag/reposition functionality
```

#### الملف: `pages/01_main-pages/map/MapPage/index.tsx`
```typescript
// Line 4
// TODO replace user counts with real service

// Line 803
// TODO: analytics events (mapPage_view, mapPage_toggle_layer)
```

**الخطوات المطلوبة**:
1. إنشاء Event Creator Modal
2. إنشاء Story Creator Modal
3. تطبيق Drag & Drop للصور
4. ربط Notifications بـ Firebase
5. إضافة real user counts service

---

### 7. External Integrations (5 TODO)

#### الملف: `services/error-handling-service.ts`
```typescript
// Line 163
// TODO: Send to external monitoring service (Sentry, etc.) for production

// Line 318
// TODO: Integrate with Sentry or other monitoring service
```

#### الملف: `services/notification-service.ts`
```typescript
// Line 79
// TODO: Add proper VAPID key from Firebase Console
```

#### الملف: `services/user-settings.service.ts`
```typescript
// Line 367
// TODO: Collect data from other collections (listings, messages, etc.)
```

**الخطوات المطلوبة**:
1. (اختياري) إعداد Sentry للمراقبة
2. إضافة VAPID keys للإشعارات
3. تحسين data collection

---

## 📊 خطة التنفيذ

### الأسبوع 1: الأساسيات
- [ ] إكمال Stripe Integration
- [ ] إعداد Email Service
- [ ] تفعيل Verification Logging

### الأسبوع 2: التحسينات
- [ ] إضافة Analytics Tracking الأساسي
- [ ] تحسين Performance
- [ ] اختبار شامل

### الأسبوع 3: الميزات الإضافية
- [ ] UI Features
- [ ] External Integrations (اختياري)
- [ ] تحسينات نهائية

---

## ✅ تتبع التقدم

```
المكتمل:     0/50  (0%)
قيد العمل:   0/50  (0%)
المتبقي:     50/50 (100%)
```

---

## 📝 ملاحظات

1. **Stripe** هو الأولوية القصوى إذا كان الموقع تجارياً
2. **Email Service** ضروري للتواصل مع المستخدمين
3. **Analytics** مهم لفهم سلوك المستخدمين
4. **Performance** يمكن تحسينه تدريجياً
5. **UI Features** يمكن إضافتها في التحديثات القادمة

---

**آخر تحديث**: 1 ديسمبر 2025  
**الحالة**: 🔴 يحتاج عمل
