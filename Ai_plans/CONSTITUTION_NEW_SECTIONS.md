# 🏛️ دستور المشروع - الأقسام الجديدة (17 يناير 2026)

## 4.2 AI Router Pattern (NEW - Jan 17, 2026)

**قاعدة ذهبية:** استخدم `AIRouter` بدلاً من استدعاء مزودي الذكاء الاصطناعي مباشرة.

**الأنماط الصحيحة:**
```typescript
// ✅ CORRECT - استخدام AIRouter
import { AIRouter } from '@/services/ai/ai-router.service';

const description = await AIRouter.generate({
  task: 'description',
  input: carData,
  options: { language: 'bg', maxTokens: 500 }
});

const imageAnalysis = await AIRouter.analyzeImage({
  task: 'damage-detection',
  input: imageBuffer,
  options: { confidence: 0.8 }
});

const voiceTranscription = await AIRouter.transcribe({
  task: 'voice-search',
  input: audioBlob,
  options: { language: 'bg' }
});
```

**الأنماط الخاطئة:**
```typescript
// ❌ WRONG - استدعاء مباشر لمزود
const response = await openai.createChatCompletion(...);
const response = await gemini.generateContent(...);

// ❌ WRONG - عدم استخدام cost optimizer
const expensive = await AIRouter.generate(...); // بدون تتبع التكاليف
```

**الميزات:**
- ✅ تجاوز تلقائي بين مزودي الخدمة (Gemini → OpenAI → DeepSeek)
- ✅ تتبع التكاليف والاستخدام
- ✅ إدارة حصص الاستخدام
- ✅ معالجة الأخطاء والإعادة
- ✅ Fallback تلقائي عند فشل المزود

**المزودون المدعومون:**
1. **Google Gemini** - الأساسي (وصول سريع، جودة عالية)
2. **OpenAI** - الاحتياطي (GPT-4، نتائج معقدة)
3. **DeepSeek** - الاقتصادي (توفير التكاليف)

**الخدمات الداخلية:**
- `gemini-vision.service.ts` - تحليل الصور
- `vehicle-description-generator.service.ts` - توليد الأوصاف
- `whisper.service.ts` - التعرف على الكلام
- `nlu-multilingual.service.ts` - فهم اللغة الطبيعية
- `ai-cost-optimizer.service.ts` - تتبع التكاليف

---

## 4.3 Manual Payment System (NEW - Jan 9-16, 2026)

**قاعدة ذهبية:** لا تستخدم Stripe بعد الآن. استخدم نظام التحويل البنكي اليدوي.

**البنوك المدعومة:**
```
┌─────────────────────────────────────────────────┐
│  البنك      │ IBAN                   │ الاستخدام │
├─────────────────────────────────────────────────┤
│ iCard       │ BG98INTF40012039023344 │ فوري ⚡  │
│ Revolut     │ LT44 3250 0419 1285 4116 │ دولي 🌍 │
└─────────────────────────────────────────────────┘
```

**الأنماط الصحيحة:**
```typescript
// ✅ CORRECT - Generate payment reference
import { generatePaymentReference, BANK_DETAILS } from '@/config/bank-details';

const reference = generatePaymentReference('subscription', 'dealer');
// Output: GLOBUL-SUB-dealer-1704835200

// Redirect to payment instructions
window.location.href = `/billing/manual-payment?plan=dealer&reference=${reference}`;

// Get bank details for display
const bankInfo = BANK_DETAILS.icard;
// { iban, bic, revtag, supportsInstant }
```

**الأنماط الخاطئة:**
```typescript
// ❌ WRONG - استخدام Stripe (DEPRECATED)
import { STRIPE_PRICE_IDS } from '@/config/stripe-extension.config.ts';
const session = await stripe.checkout.sessions.create(...);

// ❌ WRONG - hardcoding bank details
const iban = 'BG98INTF40012039023344'; // استخدم BANK_DETAILS بدلاً من ذلك
```

**دورة حياة الدفع:**
```
1. pending_manual_verification
   ↓
2. verified (by admin in dashboard)
   ↓
3. completed (subscription activated)

   OR ❌

2. rejected (by admin with reason)
   ↓
3. expired (after 7 days if not verified)
```

**الحالات وانتقالاتها:**
| من | إلى | الشرط |
|------|---------|---------|
| pending | verified | تم التحقق من البنك |
| verified | completed | فعّل الاشتراك |
| pending | rejected | رفض المسؤول |
| pending | expired | مرور 7 أيام |

**الملفات الرئيسية:**
- `src/config/bank-details.ts` - تكوين البنوك وإنشاء المراجع
- `src/pages/09_admin/manual-payments/` - لوحة التحقق من الدفع
- `src/services/payment.service.ts` - معالجة حالات الدفع

---

## 4.4 Advanced Messaging Architecture (NEW - Phase 3)

**قاعدة ذهبية:** استخدم `useRealtimeMessaging` hook لجميع عمليات المراسلة.

**البنية في Realtime Database:**
```
/channels/{channelId}/
├── buyerNumericId: number
├── sellerNumericId: number
├── carNumericId: number
├── carCollection: 'passenger_cars' | 'suvs' | ...
├── createdAt: timestamp
├── updatedAt: timestamp
├── lastMessageAt: timestamp
├── isArchived: { [userId]: boolean }
├── messages/
│   └── {messageId}/
│       ├── senderId: string
│       ├── text: string
│       ├── createdAt: timestamp
│       ├── isRead: { [userId]: boolean }
│       └── attachments: AttachmentData[]
├── metadata/
│   ├── messageCount: number
│   └── participantCount: number
├── presence/{numericId}/
│   ├── online: boolean
│   ├── lastSeen: timestamp
│   └── currentPage: string
└── typing/{numericId}/
    └── isTyping: boolean
```

**الأنماط الصحيحة:**
```typescript
// ✅ CORRECT - استخدام hook
import { useRealtimeMessaging } from '@/hooks/messaging/useRealtimeMessaging';

const {
  channels,        // List of all channels
  currentChannel,  // Active channel
  messages,        // Messages in current channel
  isLoading,
  sendMessage,     // Send text message
  sendOffer,       // Send offer message
  selectChannel,   // Switch channel
  markAsRead,      // Mark as read
  archiveChannel,  // Archive conversation
  deleteMessage    // Delete message
} = useRealtimeMessaging(numericId, firebaseId, {
  autoMarkAsRead: true,
  presenceTracking: true,
  typingIndicators: true
});

// Send message
await sendMessage(currentChannel.id, 'Hello!');

// Send offer
await sendOffer(currentChannel.id, {
  price: 5000,
  includesDelivery: true,
  notes: 'Available for test drive'
});

// Mark as read
await markAsRead(currentChannel.id);
```

**الأنماط الخاطئة:**
```typescript
// ❌ WRONG - استخدام AdvancedMessagingService مباشرة (Legacy)
import { AdvancedMessagingService } from '@/services/advanced-messaging.service';
await AdvancedMessagingService.sendMessage(...);

// ❌ WRONG - Firestore listeners بدون isActive flag
onSnapshot(query, snap => {
  setState(snap.data()); // قد يسبب memory leaks!
});

// ❌ WRONG - استخدام Firebase UIDs في القنوات
const channelId = `${firebaseUid1}_${firebaseUid2}`; // استخدم numeric IDs بدلاً من ذلك
```

**ميزات الرسائل:**
- ✅ رسائل نصية في الوقت الفعلي
- ✅ رسائل العروض (offer messages)
- ✅ تحميل الملفات والصور
- ✅ تتبع القراءة والحالة
- ✅ مؤشرات الكتابة
- ✅ حالة التواجد (presence)
- ✅ أرشفة المحادثات
- ✅ حذف الرسائل

**الملفات الرئيسية:**
- `src/hooks/messaging/useRealtimeMessaging.ts` - Hook أساسي
- `src/services/advanced-messaging.service.ts` - خدمة وراثية
- `src/services/typing-indicator.service.ts` - مؤشرات الكتابة
- `src/pages/03_user-messages/MessagesPage.tsx` - صفحة الرسائل

---

## 4.5 Autonomous Resale Engine Pattern

**قاعدة ذهبية:** استخدم `AutonomousResaleEngine` للتنبؤات والتحليل.

**الأنماط الصحيحة:**
```typescript
// ✅ CORRECT - استخدام Autonomous Resale Engine
import { AutonomousResaleEngine } from '@/services/autonomous-resale-engine.ts';

// 1. التنبؤ بقيمة إعادة البيع
const resaleValue = await AutonomousResaleEngine.predictResaleValue({
  vehicleData: carData,
  marketConditions: currentMarketData,
  options: { 
    confidence: 0.85,
    timeframe: 'one-year' // one-year | two-years | five-years
  }
});

// 2. تحليل اتجاهات السوق
const trends = await AutonomousResaleEngine.analyzeMarketTrends({
  vehicleType: 'passenger_cars',
  region: 'Bulgaria',
  timeframe: '6-months'
});

// 3. توصيات التسعير
const pricing = await AutonomousResaleEngine.recommendPricing({
  carData,
  marketComps: similarListings,
  strategicGoal: 'quick-sale' | 'max-profit' | 'competitive'
});

// 4. تقييم الجودة والحالة
const qualityScore = await AutonomousResaleEngine.assessQuality({
  carData,
  images: carImages,
  serviceHistory: maintenanceRecords
});

// 5. التنبؤ بفترة البيع
const saleTimeline = await AutonomousResaleEngine.predictSaleTimeline({
  carData,
  price: listingPrice,
  marketTrends: trends
});
```

**الأنماط الخاطئة:**
```typescript
// ❌ WRONG - حساب يدوي للقيمة
const resaleValue = carPrice * 0.7; // Hard-coded depreciation!

// ❌ WRONG - استخدام بيانات قديمة
const pricing = await engine.recommendPricing({
  carData: oldData, // قد تكون البيانات قديمة جداً
  marketComps: null // لا توجد بيانات المقارنة
});
```

**المحركات الداخلية:**
- `depreciation-calculator.ts` - حساب الاستهلاك
- `market-trends-analyzer.ts` - تحليل الاتجاهات
- `pricing-recommendation-engine.ts` - توصيات التسعير
- `quality-assessment-engine.ts` - تقييم الجودة
- `sale-timeline-predictor.ts` - التنبؤ بفترة البيع

**الملفات الرئيسية:**
- `src/services/autonomous-resale-engine.ts` - الواجهة الرئيسية
- `src/services/autonomous-resale-data.ts` - مصادر البيانات
- `src/services/autonomous-resale-operations.ts` - العمليات

---

## 4.6 Advanced Analytics & Monitoring (NEW)

**قاعدة ذهبية:** استخدم الخدمات المركزية للتحليلات والمراقبة.

**الأنماط الصحيحة:**
```typescript
// ✅ CORRECT - استخدام analytics service
import { analyticsService } from '@/services/analytics/analytics.service';

// Track user events
analyticsService.trackEvent('car_view', {
  carId: car.id,
  numericId: seller.numericId,
  timestamp: new Date()
});

// Track conversions
analyticsService.trackConversion('offer_sent', {
  offerId: offer.id,
  value: offer.price
});

// Get analytics dashboard data
const dashboardData = await analyticsService.getDashboardMetrics({
  dateRange: 'last-30-days',
  metrics: ['views', 'offers', 'conversions']
});

// Monitor performance
import { performanceMonitor } from '@/services/performance-monitor.service';
const metrics = performanceMonitor.getMetrics();
// { pageLoadTime, responseTime, errorRate }
```

**الأنماط الخاطئة:**
```typescript
// ❌ WRONG - Tracking مباشر بدون centralization
gtag('event', 'view', { ... });
firebase.analytics().logEvent('view', { ... });

// ❌ WRONG - Hard-coding analytics keys
const eventId = 'user_clicked_button'; // استخدم enum بدلاً من ذلك
```

---

## ملخص التحديثات

| النظام | الحالة | الملف |
|------|------|-------|
| AI Router | ✅ جديد | `ai-router.service.ts` |
| Manual Payments | ✅ جديد | `bank-details.ts` |
| Messaging v3 | ✅ محدّث | `useRealtimeMessaging.ts` |
| Resale Engine | ✅ جديد | `autonomous-resale-engine.ts` |
| Analytics | ✅ محدّث | `analytics.service.ts` |

**التاريخ:** 17 يناير 2026  
**المحدّث من قبل:** System Architect
