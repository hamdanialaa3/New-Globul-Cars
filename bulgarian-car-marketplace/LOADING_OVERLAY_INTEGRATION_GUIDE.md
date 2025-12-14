// LOADING_OVERLAY_INTEGRATION_GUIDE.md
# دليل دمج LoadingOverlay الشامل

## 🎯 نظرة عامة

تم إضافة مكون **LoadingOverlay** العام والشامل الذي يظهر في جميع الصفحات والعمليات. المكون يعرض ترس ثلاثي الأبعاد بتأثيرات بصرية مع شفافية ضبابية (blur) في الخلفية.

---

## 📂 الملفات المضافة/المعدلة

### ملفات جديدة:
1. **`src/components/LoadingOverlay/LoadingOverlay.tsx`** - المكون الرئيسي
2. **`src/components/LoadingOverlay/index.ts`** - تصدير المكون
3. **`src/components/LoadingOverlay/README.md`** - توثيق المكون
4. **`src/contexts/LoadingContext.tsx`** - إدارة الحالة العامة
5. **`src/hooks/useLoadingOverlay.ts`** - Hook سهل الاستخدام
6. **`src/services/with-loading.ts`** - Utilities للتغليف التلقائي
7. **`LOADING_OVERLAY_INTEGRATION_GUIDE.md`** - هذا الملف

### ملفات معدلة:
- **`src/providers/AppProviders.tsx`** - إضافة LoadingProvider

---

## ⚙️ البنية الهندسية

```
LoadingContext (حالة عامة)
    ↓
LoadingProvider (يوفر المتغيرات)
    ↓
AppProviders (يلتف حول التطبيق)
    ↓
LoadingOverlay (يعرض الـ UI)
    ↑
useLoadingOverlay Hook (يستخدم من المكونات)
    ↑
Services (تطلب التحميل)
```

---

## 🚀 كيفية الاستخدام

### 1️⃣ الاستخدام البسيط (الموصى به)

```tsx
import { useLoadingOverlay } from '@/hooks/useLoadingOverlay';

function MyComponent() {
  const { showLoading, hideLoading } = useLoadingOverlay();

  const handleFetch = async () => {
    showLoading('جاري جلب البيانات...');
    try {
      const data = await fetchData();
      console.log(data);
    } finally {
      hideLoading();
    }
  };

  return <button onClick={handleFetch}>جلب</button>;
}
```

### 2️⃣ مع useLoadingWrapper (للدوال الطويلة)

```tsx
import { useLoadingWrapper } from '@/services/with-loading';

function MyComponent() {
  const { withLoading } = useLoadingWrapper();

  const fetchCars = withLoading(
    async () => {
      return await carService.getAllCars();
    },
    'جاري جلب السيارات...'
  );

  return <button onClick={fetchCars}>جلب السيارات</button>;
}
```

### 3️⃣ مع useLoading مباشرة

```tsx
import { useLoading } from '@/contexts/LoadingContext';

function MyComponent() {
  const { showLoading, hideLoading } = useLoading();

  const handleAsync = async () => {
    showLoading('معالجة...');
    await doSomething();
    hideLoading();
  };

  return <button onClick={handleAsync}>ابدأ</button>;
}
```

---

## 📖 أمثلة عملية

### مثال 1: جلب قائمة السيارات

```tsx
import { useLoadingOverlay } from '@/hooks/useLoadingOverlay';
import { getAllCars } from '@/services/car-service';

function CarsListPage() {
  const [cars, setCars] = useState([]);
  const { showLoading, hideLoading } = useLoadingOverlay();

  useEffect(() => {
    const loadCars = async () => {
      showLoading('جاري تحميل قائمة السيارات...');
      try {
        const data = await getAllCars();
        setCars(data);
      } catch (error) {
        console.error(error);
      } finally {
        hideLoading();
      }
    };

    loadCars();
  }, [showLoading, hideLoading]);

  return <div>{/* عرض السيارات */}</div>;
}
```

### مثال 2: حفظ نموذج البحث

```tsx
import { useLoadingWrapper } from '@/services/with-loading';
import { saveSearchForm } from '@/services/search-service';

function SearchFormPage() {
  const { withLoading } = useLoadingWrapper();

  const handleSave = withLoading(
    async (formData) => {
      await saveSearchForm(formData);
      toast.success('تم الحفظ بنجاح');
    },
    'جاري الحفظ...'
  );

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSave(new FormData(e.currentTarget));
    }}>
      {/* حقول النموذج */}
    </form>
  );
}
```

### مثال 3: عملية متعددة الخطوات

```tsx
import { useLoadingOverlay } from '@/hooks/useLoadingOverlay';

function MultiStepProcess() {
  const { showLoading, hideLoading } = useLoadingOverlay();

  const handleMultiStep = async () => {
    try {
      showLoading('الخطوة 1: التحقق...');
      await step1Verify();

      showLoading('الخطوة 2: المعالجة...');
      await step2Process();

      showLoading('الخطوة 3: الحفظ...');
      await step3Save();

      showLoading('الخطوة 4: الإرسال...');
      await step4Send();

    } finally {
      hideLoading();
    }
  };

  return <button onClick={handleMultiStep}>ابدأ العملية</button>;
}
```

---

## 🎨 المميزات البصرية

### الترس ثلاثي الأبعاد
- رسم باستخدام Three.js
- دوران سلس مع تأثيرات إضاءة
- حركة إضاءة متقدمة (flashLight)

### الخلفية
- اللون: `rgba(5, 5, 10, 0.9)` (أسود شبه شفاف)
- Backdrop Filter: `blur(10px)` (ضبابية)
- يسمح برؤية المحتوى تحتها

### النصوص
- النسبة المئوية: بيضاء بحجم كبير
- الرسالة: زرقاء فيروزية (`#00ccff`)
- الخط: `'Exo 2'` (خط مستقبلي)

---

## 🔌 التكامل مع الخدمات الموجودة

### مثال: تكامل car-service

```typescript
// src/services/car-service-with-loading.ts
import { useLoadingWrapper } from '@/services/with-loading';
import * as carService from './car-service';

export const createLoadingCarService = () => {
  const { withLoading } = useLoadingWrapper();

  return {
    getAllCars: withLoading(
      () => carService.getAllCars(),
      'جاري جلب السيارات...'
    ),

    getCarById: withLoading(
      (id) => carService.getCarById(id),
      'جاري تحميل السيارة...'
    ),

    createCar: withLoading(
      (data) => carService.createCar(data),
      'جاري إنشاء السيارة...'
    ),

    deleteCar: withLoading(
      (id) => carService.deleteCar(id),
      'جاري الحذف...'
    ),
  };
};
```

---

## ✅ قائمة التحقق

- [x] تم إنشاء مكون LoadingOverlay
- [x] تم إنشاء LoadingContext
- [x] تم إنشاء Hook useLoadingOverlay
- [x] تم إنشاء useLoadingWrapper
- [x] تم دمج LoadingProvider في AppProviders
- [x] تم إضافة التوثيق الشامل
- [ ] تطبيق في جميع صفحات البحث
- [ ] تطبيق في جميع نماذج الحفظ
- [ ] تطبيق في جلب البيانات

---

## 🔗 الملفات الرئيسية

| الملف | الغرض |
|------|-------|
| `LoadingOverlay.tsx` | المكون الرئيسي |
| `LoadingContext.tsx` | إدارة الحالة |
| `useLoadingOverlay.ts` | Hook سهل |
| `with-loading.ts` | Utilities |
| `AppProviders.tsx` | التكامل |

---

## 📝 ملاحظات

- يتم إغلاق LoadingOverlay تلقائياً عند اكتمال العملية
- يدعم الرسائل بالعربية والإنجليزية
- يعمل مع جميع الصفحات والمكونات
- آمن للاستخدام المتزامن (التعامل مع رسالة واحدة في كل مرة)

---

## 🆘 استكشاف الأخطاء

### المشكلة: LoadingOverlay لا يظهر
**الحل**: تأكد من وجود LoadingProvider في AppProviders

### المشكلة: الخطأ `useLoading must be used within LoadingProvider`
**الحل**: استخدم الـ Hook فقط داخل مكون مغلف بـ LoadingProvider

### المشكلة: LoadingOverlay معلق
**الحل**: تأكد من استخدام `finally` لإغلاق التحميل

---

## 📚 موارد إضافية

- [Three.js Documentation](https://threejs.org/)
- [React Context API](https://react.dev/reference/react/useContext)
- [Styled Components](https://styled-components.com/)

