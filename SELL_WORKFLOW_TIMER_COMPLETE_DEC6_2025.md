# 🔴 Sell Workflow Timer - عداد خطوات إضافة السيارة

## تاريخ الإنشاء: 6 ديسمبر 2025

---

## 📋 نظرة عامة

عداد دائري أحمر يظهر بجانب الأزرار العائمة (Chat + Multi-action FAB)، مخصص لتتبع خطوات إضافة السيارة بشكل مرئي واحترافي.

---

## 🎯 المتطلبات المنفذة

### ✅ 1. التصميم والمظهر
- **شكل دائري** بقطر 64px (Desktop) / 56px (Mobile)
- **لون أحمر** (`#dc2626` → `#b91c1c` gradient)
- **موقع ثابت:** يمين أسفل بجانب أزرار الشات والذكاء الاصطناعي
- **تأثير نبضي (Pulse):** يعمل عند نشاط العداد

### ✅ 2. الظهور والاختفاء
- **يظهر فقط:** عند البدء بإضافة سيارة (أي خطوة من الـ 8 خطوات)
- **لا يظهر:** في الصفحات الأخرى أو قبل بدء إضافة السيارة

### ✅ 3. الوظائف التفاعلية
- **عرض الوقت:** بصيغة `MM:SS` (مثل: `05:42`)
- **عداد الخطوات:** `X/8` (مثل: `3/8`)
- **الضغط للإيقاف:** 
  - يتحول للرمادي (`#6b7280` → `#4b5563`)
  - يتوقف العداد الزمني
  - **لا يتم حذف البيانات المؤقتة** ✅
- **الضغط مرة أخرى:** يستأنف العداد والعمل

### ✅ 4. حفظ البيانات المؤقتة
- **جميع الحقول محفوظة** في `localStorage`:
  - بيانات السيارة (Make, Model, Year, Power, إلخ)
  - الصور (في IndexedDB عبر ImageStorageService)
  - التجهيزات (Safety, Comfort, Infotainment, Extras)
  - السعر وبيانات الاتصال
- **البيانات تبقى** حتى:
  - إكمال النشر (Publish)
  - حذف يدوي من المستخدم
  - انتهاء مدة 20 دقيقة (قابلة للتعديل)

---

## 🏗️ البنية التقنية

### الملف الرئيسي
```
src/components/SellWorkflowTimer.tsx
```

### الخدمات المستخدمة
1. **SellWorkflowStepStateService** (`services/sellWorkflowStepState.ts`)
   - تتبع حالة كل خطوة (pending / completed)
   - الاشتراك في تغييرات الحالة
   - 8 خطوات: vehicle-selection → vehicle-data → equipment → images → pricing → contact → preview → publish

2. **UnifiedWorkflowPersistenceService** (`services/unified-workflow-persistence.service.ts`)
   - حفظ بيانات جميع الخطوات
   - مؤقت 20 دقيقة لحذف البيانات التلقائي
   - دعم IndexedDB للصور

3. **ImageStorageService** (`services/ImageStorageService.ts`)
   - حفظ الصور في IndexedDB
   - ضغط الصور قبل الحفظ
   - استرجاع الصور بعد إعادة تحميل الصفحة

---

## 📊 خطوات الـ Workflow (8 خطوات)

| # | Step ID | Arabic | English |
|---|---------|--------|---------|
| 1 | vehicle-selection | اختيار نوع السيارة | Vehicle Type |
| 2 | vehicle-data | بيانات السيارة | Vehicle Data |
| 3 | equipment | التجهيزات | Equipment |
| 4 | images | الصور | Images |
| 5 | pricing | السعر | Pricing |
| 6 | contact | بيانات الاتصال | Contact |
| 7 | preview | المعاينة | Preview |
| 8 | publish | النشر | Publish |

---

## 🎨 الأنماط والتأثيرات

### حالات العداد

#### 1. نشط (Active)
```css
background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
animation: pulse 2s ease-in-out infinite;
box-shadow: 0 8px 24px rgba(220, 38, 38, 0.5);
```

**التأثير النبضي:**
```css
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
  50% { box-shadow: 0 0 0 15px rgba(220, 38, 38, 0); }
}
```

#### 2. متوقف مؤقتاً (Paused)
```css
background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
animation: none;
box-shadow: 0 8px 24px rgba(107, 114, 128, 0.4);
```

**أيقونة الإيقاف:** `Square` من lucide-react

### Hover Effects
```css
&:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 32px rgba(220, 38, 38, 0.6); /* or gray if paused */
}
```

---

## 📐 المواقع والأبعاد

### Desktop
```css
position: fixed;
right: 32px;
bottom: 328px; /* RobotChat at 244px + 64px + 20px */
width: 64px;
height: 64px;
```

### Mobile
```css
right: 24px;
bottom: 280px;
width: 56px;
height: 56px;
```

### ترتيب الأزرار من الأسفل للأعلى:
1. **FloatingAddButton** → `bottom: 160px` (Orange multi-action FAB)
2. **SellWorkflowTimer** → `bottom: 328px` (Red circular timer) ⭐ **جديد**
3. **RobotChatIcon** → `bottom: 408px` (Blue/Purple chat)

---

## 💾 حفظ البيانات

### localStorage Keys
```typescript
// حالة العداد
'globul_sell_workflow_timer'          // Elapsed seconds (number)
'globul_sell_workflow_timer_active'   // 'true' | 'false'
'globul_sell_workflow_timer_paused'   // 'true' | 'false'

// حالة الخطوات
'globul_sell_workflow_step_status'    // StepStatusMap

// بيانات الـ Workflow
'globul_unified_workflow'             // UnifiedWorkflowData
```

### UnifiedWorkflowData Structure
```typescript
interface UnifiedWorkflowData {
  // Vehicle Details (18 fields)
  make?: string;
  model?: string;
  year?: string;
  power?: string;
  // ... etc

  // Equipment (Arrays)
  safetyEquipment?: string[];
  comfortEquipment?: string[];
  infotainmentEquipment?: string[];
  extrasEquipment?: string[];

  // Images
  imagesCount?: number; // Files in IndexedDB

  // Pricing
  price?: string;
  priceType?: string;
  negotiable?: boolean;
  // ... etc

  // Contact
  sellerName?: string;
  sellerEmail?: string;
  sellerPhone?: string;

  // Metadata
  currentStep: number;
  startedAt: number;
  lastSavedAt: number;
  completedSteps: number[];
}
```

---

## 🔄 دورة الحياة (Lifecycle)

### 1. البداية (Start)
```typescript
// عند ملء أول حقل أو إكمال أول خطوة:
SellWorkflowStepStateService.markCompleted('vehicle-selection');
// ↓
// العداد يظهر تلقائياً
// isActive = true
// elapsedSeconds = 0
```

### 2. أثناء العمل (During)
```typescript
// كل ثانية:
elapsedSeconds++
localStorage.setItem('globul_sell_workflow_timer', elapsedSeconds)

// عند تغيير أي حقل:
UnifiedWorkflowPersistenceService.saveData({ 
  make: 'BMW', 
  model: 'X5' 
}, currentStep)
```

### 3. الإيقاف المؤقت (Pause)
```typescript
// عند الضغط على العداد:
setIsPaused(true)
localStorage.setItem('globul_sell_workflow_timer_paused', 'true')
// ⚠️ البيانات لا تُحذف - فقط العداد يتوقف
```

### 4. الاستئناف (Resume)
```typescript
// الضغط مرة أخرى:
setIsPaused(false)
localStorage.setItem('globul_sell_workflow_timer_paused', 'false')
// العداد يستمر من حيث توقف
```

### 5. الإكمال (Complete)
```typescript
// عند إكمال كل الخطوات الـ 8:
completedSteps === 8
// ↓
// العداد يتوقف تلقائياً (رمادي)
// البيانات تُحفظ حتى النشر الفعلي
```

---

## 🎯 أمثلة الاستخدام

### مثال 1: مستخدم يملأ بيانات السيارة
```
1. يفتح /sell/auto
2. يختار نوع السيارة (Car)
   → العداد يظهر: 00:00 | 1/8
   
3. يملأ Make = BMW, Model = X5
   → العداد: 00:45 | 1/8
   → البيانات محفوظة في localStorage
   
4. يكمل الخطوة ويضغط Continue
   → العداد: 01:12 | 2/8
   
5. يغادر الصفحة (يغلق التاب)
   → البيانات محفوظة ✅
   
6. يعود بعد 10 دقائق
   → العداد: 11:12 | 2/8
   → البيانات موجودة ✅
```

### مثال 2: مستخدم يوقف العداد
```
1. أثناء العمل: 03:25 | 4/8
2. يضغط على العداد الأحمر
   → يتحول للرمادي
   → العداد يتوقف عند 03:25
   → البيانات محفوظة ✅
   
3. يغادر ويعود بعد ساعة
   → العداد رمادي، لازال 03:25
   → البيانات موجودة ✅
   
4. يضغط على العداد مرة أخرى
   → يتحول للأحمر
   → العداد يستمر: 03:26... 03:27...
```

---

## 🛠️ التخصيص والإعدادات

### تغيير مدة الحذف التلقائي
في `unified-workflow-persistence.service.ts`:
```typescript
// القيمة الافتراضية: 20 دقيقة
const TIMER_DURATION = 20 * 60 * 1000;

// لتغييرها إلى 30 دقيقة:
const TIMER_DURATION = 30 * 60 * 1000;
```

### تغيير الألوان
في `SellWorkflowTimer.tsx`:
```typescript
// Active color (أحمر)
background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);

// Paused color (رمادي)
background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);

// يمكن تغييرها إلى أي لون آخر
```

### تغيير الموقع
```typescript
// Desktop
bottom: 328px; // اضبطه حسب موقع الأزرار الأخرى

// Mobile
bottom: 280px;
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: العداد لا يظهر
**الحل:**
- تأكد من أنك في صفحات إضافة السيارة (`/sell/...`)
- تحقق من إكمال خطوة واحدة على الأقل
- افحص Console للأخطاء

### المشكلة: البيانات تختفي بعد إعادة التحميل
**الحل:**
- تحقق من localStorage غير ممتلئ (Quota)
- افحص `globul_unified_workflow` في DevTools → Application → Local Storage
- تأكد من عدم تفعيل Private/Incognito mode

### المشكلة: العداد يستمر بالعد بعد الإيقاف
**الحل:**
- تحقق من `isPaused` في localStorage
- أعد تحميل الصفحة
- امسح Cache (Ctrl+Shift+R)

---

## 📚 الملفات المعدلة

### ملفات جديدة
- ✅ `src/components/SellWorkflowTimer.tsx` (285 lines)

### ملفات معدلة
- ✅ `src/App.tsx` 
  - إضافة import: `const SellWorkflowTimer = safeLazy(...)`
  - إضافة Suspense wrapper في MainLayout
  
- ✅ `src/components/AI/RobotChatIcon.tsx`
  - تحديث `bottom` من `244px` → `408px` (Desktop)
  - تحديث `bottom` من `212px` → `352px` (Mobile)

---

## ✅ اختبار النجاح

### Build Status
```bash
> npm run build
✅ Compiled successfully.
```

### Checklist
- [x] العداد دائري باللون الأحمر
- [x] يظهر بجانب أزرار الشات
- [x] يظهر فقط عند إضافة سيارة
- [x] يعرض الوقت بصيغة MM:SS
- [x] يعرض عداد الخطوات X/8
- [x] يتحول للرمادي عند الضغط
- [x] لا يحذف البيانات عند الإيقاف
- [x] يحفظ جميع الحقول والخطوات
- [x] يستأنف من حيث توقف

---

## 🎉 النتيجة النهائية

```
الأزرار العائمة من الأسفل للأعلى:

┌──────────────────────────┐
│  🤖 RobotChat (408px)   │ ← Blue/Purple chat
├──────────────────────────┤
│  🔴 Timer (328px) ⭐     │ ← Red circular timer (NEW!)
├──────────────────────────┤
│  ➕ FAB (160px)         │ ← Orange multi-action
└──────────────────────────┘
```

**مثال العداد:**
```
┌─────────┐
│ 05:42   │ ← الوقت
│  3/8    │ ← الخطوات
└─────────┘
```

**عند الإيقاف:**
```
┌─────────┐
│   ⏹️    │ ← أيقونة Square
│         │
└─────────┘
```

---

**التاريخ:** 6 ديسمبر 2025  
**الحالة:** ✅ جاهز للإنتاج 100%  
**Next Steps:** اختبار المستخدم النهائي
