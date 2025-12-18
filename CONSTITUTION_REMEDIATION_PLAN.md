# 📋 دستور المشروع - مخطط إصلاح الانتهاكات
## Project Constitution - Violation Remediation Plan

**تاريخ البدء:** ١٦ ديسمبر ٢٠٢٥  
**الحالة:** مخطط شامل | Comprehensive Plan  
**اختيار المستخدم:** Option C (Priority 1 + 2)

---

## 🎯 **الملخص التنفيذي | Executive Summary**

هذا المخطط يعالج جميع انتهاكات **الدستور** (constitution.md) بطريقة منهجية واحترافية.

| الفئة | الانتهاكات | الأولوية | الحالة |
|------|-----------|---------|--------|
| 📄 حجم الملفات (>300 سطر) | 4 ضخمة + 11 حرجة | P1 | ❌ منتظر |
| 🔴 console.log في الإنتاج | 37 في tsx + 100+ في ts | P1 | ❌ منتظر |
| 🔤 `any` types بدون تصريح | 50+ مطابقة | P1 | ❌ منتظر |
| 🔐 قواعد Firestore ضعيفة | تحتاج تشديد | P2 | ❌ منتظر |
| 📚 JSDoc comments | معظم الدوال بدون | P2 | ❌ منتظر |
| 🧪 اختبارات (40→50%) | نقص الغطاء | P2 | ❌ منتظر |
| 🎨 الإيموجيات في الكود | نادرة لكن موجودة | P1 | ⚠️ تحقق |
| 🔄 الخدمات المكررة | 103 خدمة → 90 هدف | P2 | ❌ منتظر |

---

## 🚨 **Priority 1 - Blocking Issues (CRITICAL)**

### **Task 1.1: إزالة console.log من الملفات الإنتاجية**

#### **النتائج المكتشفة:**

**Frontend (bulgarian-car-marketplace/src):**
- ✅ 37 مطابقة في ملفات `.tsx`
- ⚠️ 8 مطابقة في ملفات `.ts` (معظمها في logger-service.ts نفسه)

**الملفات الرئيسية التي تحتاج تصحيح:**

| الملف | العدد | الخطورة | الحالة |
|------|------|--------|--------|
| `src/routes/NumericCarRedirect.tsx` | 2 | 🔴 عالية | يجب إزالة |
| `src/pages/08_payment-billing/SubscriptionPage.tsx` | 1 | 🔴 عالية | يجب إزالة |
| `src/pages/03_user-pages/profile/components/ProfileTypeSwitcher.tsx` | 1 | 🟠 متوسطة | يجب إزالة |
| `src/pages/03_user-pages/profile/ProfilePage/tabs/SettingsTab.tsx` | 2 | 🔴 عالية | يجب إزالة |
| `src/pages/03_user-pages/MessagesPage.tsx` | 3 | 🔴 عالية | يجب إزالة |
| `src/pages/03_user-pages/messages/MessagesPage/index.tsx` | 30+ | 🔴 حرجة جداً | يجب إزالة |
| `src/pages/01_main-pages/components/CarDetailsGermanStyle.tsx` | 3 | 🔴 عالية | يجب إزالة |
| `src/pages/01_main-pages/CarDetailsPage.tsx` | 2 | 🟠 متوسطة | يجب إزالة |
| `src/components/guards/AuthGuard.tsx` | 1 | 🟠 متوسطة | يجب إزالة |

**Backend (functions/src):**
- ✅ 100+ مطابقة (المزيد متاح)

الملفات الأساسية:
- `functions/src/utils/logger.ts` - 3 (هذا مقصود - يجب تركه كما هو للـ Cloud Functions logging)
- `functions/src/translation.ts` - 3 (استبدال بـ logger)
- `functions/src/subscriptions/stripe-email-service.ts` - 1
- `functions/src/stripe-checkout.ts` - 4
- `functions/src/stories-functions.ts` - 6
- `functions/src/stats.ts` - 2
- `functions/src/social-media/oauth-handler.ts` - 1
- ... و 90+ ملف آخر

#### **الحل:**

```typescript
// ❌ قبل
console.log('Loading user...');
console.error('Failed:', error);

// ✅ بعد
import { logger } from '@/services/logger-service'; // Frontend
// Or for Functions:
import { logger } from './utils/logger'; // Backend (مقبول للـ Cloud Functions)

logger.info('Loading user', { userId });
logger.error('Failed', error, { context: 'userLoad' });
```

#### **جدول التنفيذ:**
- **Phase 1** (1-2 ساعة): MessagesPage/index.tsx (30+ logs) ⚡ الأولوية العليا
- **Phase 2** (2-3 ساعات): باقي ملفات Frontend (ts+tsx)
- **Phase 3** (4-6 ساعات): Backend Cloud Functions
- **Phase 4** (1 ساعة): التحقق والاختبار

---

### **Task 1.2: استبدال `any` Type**

#### **النتائج المكتشفة:**

**الأنماط الرئيسية:**

```typescript
// ❌ نمط 1: catch blocks
catch (error: any) => { ... }

// ❌ نمط 2: function parameters
function process(data: any) { ... }

// ❌ نمط 3: object updates
{ [key: string]: any }

// ❌ نمط 4: return types
async function fetch(): Promise<any> { ... }
```

**الملفات الأولوية في functions/src:**

| الملف | العدد | النمط الرئيسي | الحل المقترح |
|------|------|------------|-----------|
| `subscriptions/stripeWebhook.ts` | 8 | catch + params | StripeEvent, WebhookData interfaces |
| `team/inviteMember.ts` | 6 | params + return | Invitation, User types |
| `verification/verifyEIK.ts` | 5 | catch + params | EIKResponse, ValidationResult |
| `service-network.ts` | 4 | object typing | Record<string, ServiceProvider> |
| Error handlers | ~15 | catch blocks | Error type with proper narrowing |

#### **الحل:**

```typescript
// ❌ قبل
export const stripeWebhook = onCall(async (request: any) => {
  try {
    const event: any = request.data;
    return { success: true } as any;
  } catch (error: any) {
    return { error: error.message };
  }
});

// ✅ بعد
interface StripeWebhookData {
  eventId: string;
  eventType: string;
  timestamp: number;
  payload: Record<string, unknown>;
}

interface WebhookResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const stripeWebhook = onCall<StripeWebhookData, WebhookResponse>(
  async (request) => {
    try {
      const { eventId, payload } = request.data;
      return { success: true, message: 'Webhook processed' };
    } catch (error: unknown) {
      const errorMsg = error instanceof Error 
        ? error.message 
        : 'Unknown error';
      logger.error('Webhook failed', error as Error);
      return { success: false, error: errorMsg };
    }
  }
);
```

#### **جدول التنفيذ:**
- **Phase 1** (2-3 ساعات): stripeWebhook.ts + payment functions
- **Phase 2** (2-3 ساعات): team + verification functions
- **Phase 3** (2 ساعة): error handling refactor
- **Phase 4** (1 ساعة): tests update

---

### **Task 1.3: تقسيم الملفات الضخمة (>2000 سطر)**

#### **الملفات الحرجة جداً:**

| الملف | الأسطر | الحجم | الأولوية |
|------|--------|-------|---------|
| `src/constants/carData_static.ts` | 4,102 | 92 KB | 🔴 عالية |
| `src/locales/translations.ts` | 2,489 | 123 KB | 🔴 عالية |
| `src/pages/01_main-pages/CarDetailsPage.tsx` | 2,325 | 82 KB | 🔴 عالية |
| `src/pages/03_user-pages/profile/ProfilePage/index.tsx` | 2,172 | 105 KB | 🔴 عالية |

#### **مثال: تقسيم CarDetailsPage.tsx**

```
CarDetailsPage/
├── index.tsx                    (200-250 سطر)
├── types.ts                     (100 سطر)
├── hooks/
│   ├── useCarDetails.ts         (150 سطر)
│   ├── usePricingInfo.ts        (100 سطر)
│   └── useContactDealer.ts      (80 سطر)
├── components/
│   ├── CarGallery.tsx           (150 سطر)
│   ├── SpecificationsPanel.tsx  (200 سطر)
│   ├── PricingSection.tsx       (120 سطر)
│   ├── ContactSection.tsx       (100 سطر)
│   ├── ReviewsSection.tsx       (150 سطر)
│   └── RelatedCars.tsx          (100 سطر)
├── utils/
│   ├── formatCarDetails.ts      (80 سطر)
│   └── calculatePrice.ts        (60 سطر)
└── styles.ts                    (150 سطر)
```

#### **جدول التنفيذ:**
- **Phase 1** (3-4 ساعات): `carData_static.ts`
- **Phase 2** (2-3 ساعات): `translations.ts`
- **Phase 3** (4-5 ساعات): `CarDetailsPage.tsx`
- **Phase 4** (3-4 ساعات): `ProfilePage/index.tsx`

---

### **Task 1.4: إزالة الإيموجيات من الكود**

#### **البحث المطلوب:**
```bash
grep -r "[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF]" bulgarian-car-marketplace/src functions/src
```

**ملاحظة:** استخدام SVG icons بدلاً من emojis في UI code

---

## 📊 **Priority 2 - Important Issues**

### **Task 2.1: تشديد قواعم Firestore Rules**

الملفات المعنية:
- `firestore.rules` (الملف الرئيسي)
- `storage.rules` (قواعم التخزين)

#### **التحسينات المقترحة:**

```firestore
// ❌ قبل (ضعيف جداً)
match /{document=**} {
  allow read, write: if true;
}

// ✅ بعد (آمن)
match /databases/{database}/documents {
  // Only authenticated users
  match /users/{userId} {
    allow read: if request.auth != null && request.auth.uid == userId;
    allow write: if request.auth.uid == userId && 
                    request.resource.data.keys().hasOnly(['name', 'email', 'phone']);
  }

  // Public listings (read-only for guests)
  match /cars/{carId} {
    allow read: if true;
    allow write: if request.auth != null && 
                    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.sellerId != null;
  }

  // Private messages (only participants)
  match /messages/{messageId} {
    allow read: if request.auth.uid in resource.data.participantIds;
    allow write: if request.auth.uid in resource.data.participantIds;
  }
}
```

---

### **Task 2.2: إضافة JSDoc Comments**

مثال:

```typescript
/**
 * Fetches all cars listed by a specific seller
 * 
 * @param sellerId - The Firestore user ID of the seller
 * @param filters - Optional filters (price range, condition, etc.)
 * @returns Promise containing array of Car objects
 * @throws Error if database query fails or sellerId is invalid
 * 
 * @example
 * const cars = await getSellerCars('user123', { maxPrice: 50000 });
 */
export async function getSellerCars(
  sellerId: string,
  filters?: CarFilters
): Promise<Car[]> {
  // implementation
}
```

---

### **Task 2.3: تحسين اختبارات (50%+ coverage)**

الأهداف:
- Services: 80%+ coverage
- Utils: 90%+ coverage
- Hooks: 70%+ coverage
- Components: 50%+ coverage

---

## 📅 **جدول المشروع الكامل**

| المرحلة | المهام | المدة | التاريخ المتوقع | الحالة |
|--------|-------|------|-----------------|--------|
| P1.1 | حذف console.log | 7-8 ساعات | ١٦-١٧ ديسمبر | ❌ منتظر |
| P1.2 | استبدال `any` | 7-8 ساعات | ١٧-١٨ ديسمبر | ❌ منتظر |
| P1.3 | تقسيم الملفات | 10-12 ساعة | ١٨-١٩ ديسمبر | ❌ منتظر |
| P1.4 | إزالة الإيموجيات | 1-2 ساعة | ١٩ ديسمبر | ❌ منتظر |
| P1.5 | Profile Settings fixes | 3-4 ساعات | ١٩-٢٠ ديسمبر | ❌ منتظر |
| P2.1 | Firestore rules | 2-3 ساعات | ٢٠ ديسمبر | ❌ منتظر |
| P2.2 | JSDoc comments | 3-4 ساعات | ٢٠-٢١ ديسمبر | ❌ منتظر |
| P2.3 | Test coverage | 4-5 ساعات | ٢١-٢٢ ديسمبر | ❌ منتظر |
| **الإجمالي** | **8 مهام** | **37-41 ساعة** | **بحلول ٢٢ ديسمبر** | **متقدم** |

---

## 🚀 **البدء الفوري | Immediate Action**

```bash
# 1. تحديث قائمة المهام
npm run task:list

# 2. بدء المرحلة الأولى
npm run fix:console-logs -- --dry-run

# 3. مراقبة التقدم
npm run monitor:constitution
```

---

## ✅ **معايير القبول | Acceptance Criteria**

### **كل مهمة يجب أن تحقق:**
1. ✅ جميع الملفات تمر ESLint (بدون تحذيرات)
2. ✅ TypeScript compilation بدون أخطاء
3. ✅ جميع الاختبارات تمر (npm test)
4. ✅ لا توجد console.log في الإنتاج
5. ✅ لا توجد `any` types (إلا مع تعليق TSIgnore مبرر)
6. ✅ جميع الملفات ≤ 300 سطر
7. ✅ JSDoc لكل دالة مُصدَّرة
8. ✅ Firestore rules مشددة وآمنة

---

## 📝 **ملاحظات مهمة**

- **لا تحذف ملفات** - انقل إلى `/ARCHIVE/` فقط
- **ضم double-language support** - اختبر BG و EN كليهما
- **اختبر بعد كل مرحلة** - `npm test && npm run build`
- **GitHub commits منتظمة** - commit بعد كل مهمة فرعية

---

**معد بواسطة:** GitHub Copilot  
**آخر تحديث:** ١٦ ديسمبر ٢٠٢٥  
**الإصدار:** 1.0.0
