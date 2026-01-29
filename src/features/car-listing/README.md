# 🚀 Car Listing Feature 2.0 - Implementation Guide
## دليل التنفيذ: نظام إضافة إعلان السيارة 2.0

---

## 📋 Overview

هذا النظام الجديد يستخدم:
- ✅ **Zustand** للـ State Management
- ✅ **React Hook Form** لإدارة النماذج
- ✅ **Zod** للتحقق من البيانات
- ✅ **Framer Motion** للحركات السلسة

**مع الحفاظ على جميع التفاصيل الموجودة:**
- ✅ BrandModelMarkdownDropdown مع الشعارات والـ GlassSphere
- ✅ ألوان القوائم المنسدلة (featured brands باللون البرتقالي/الأزرق)
- ✅ جميع التفاصيل البصرية (Green border pulse, Toggle buttons, etc.)

---

## 🏗️ البنية

```
features/car-listing/
├── stores/
│   └── car-listing-store.ts        # Zustand Store
├── schemas/
│   └── car-listing.schema.ts       # Zod Schemas
├── components/
│   ├── wizard/                     # Wizard Components
│   │   ├── CarListingWizard.tsx
│   │   ├── WizardProgress.tsx
│   │   ├── WizardNavigation.tsx
│   │   └── StepTransition.tsx
│   └── steps/                      # Step Components
│       ├── Step1VehicleType.tsx
│       ├── Step2VehicleData.tsx    # Uses BrandModelMarkdownDropdown ✅
│       ├── Step3Equipment.tsx
│       ├── Step4Images.tsx
│       ├── Step5Pricing.tsx
│       └── Step6Contact.tsx
├── hooks/
│   └── useCarListingForm.ts        # React Hook Form integration
└── utils/
    └── image-compression.ts        # Image optimization
```

---

## 🔄 Migration Strategy

### Phase 1: Use New Store Alongside Old System

```typescript
// في Step Component الجديد
import { useCarListingStore } from '@/features/car-listing/stores/car-listing-store';
import { useSellWorkflow } from '@/hooks/useSellWorkflow'; // القديم - للتوافق

const Step2VehicleData = () => {
  // النظام الجديد
  const { formData, updateStepData } = useCarListingStore();
  
  // النظام القديم (للتوافق المؤقت)
  const { workflowData, updateWorkflowData } = useSellWorkflow();
  
  // مزامنة بين النظامين (مؤقت)
  useEffect(() => {
    if (formData.step2?.make) {
      updateWorkflowData({ make: formData.step2.make }, 'vehicle-data');
    }
  }, [formData.step2]);
  
  // ... rest of component
};
```

---

## 📝 Example: Step 2 with BrandModelMarkdownDropdown

```typescript
// components/steps/Step2VehicleData.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCarListingStore } from '../../stores/car-listing-store';
import { step2Schema, Step2Data } from '../../schemas/car-listing.schema';
import BrandModelMarkdownDropdown from '@/components/BrandModelMarkdownDropdown'; // ✅ الحفاظ على المكون الحالي

export const Step2VehicleData = () => {
  const { formData, updateStepData } = useCarListingStore();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: formData.step2 || {},
    mode: 'onChange', // ✅ Real-time validation
  });
  
  const make = watch('make');
  const model = watch('model');
  
  // ✅ الحفاظ على BrandModelMarkdownDropdown مع جميع التفاصيل
  const handleBrandChange = (brand: string) => {
    setValue('make', brand, { shouldValidate: true });
    updateStepData('step2', { make: brand });
  };
  
  const handleModelChange = (model: string) => {
    setValue('model', model, { shouldValidate: true });
    updateStepData('step2', { model });
  };
  
  return (
    <form onSubmit={handleSubmit((data) => {
      updateStepData('step2', data);
    })}>
      {/* ✅ استخدام BrandModelMarkdownDropdown الحالي مع جميع التفاصيل */}
      <BrandModelMarkdownDropdown
        brand={make || ''}
        model={model || ''}
        onBrandChange={handleBrandChange}
        onModelChange={handleModelChange}
      />
      
      {/* باقي الحقول مع الحفاظ على التفاصيل */}
      {/* ... */}
    </form>
  );
};
```

---

## 🎨 Preserving Visual Details

### 1. Featured Brands Styling

```typescript
// في BrandModelMarkdownDropdown - الحفاظ على الألوان
<Select>
  {brands.map(brand => (
    <option
      key={brand}
      value={brand}
      className={isFeaturedBrand(brand) ? 'popular-brand' : ''}
      style={isFeaturedBrand(brand) ? {
        fontWeight: '700',
        color: '#ff8f10', // ✅ اللون البرتقالي
        backgroundColor: 'rgba(255, 143, 16, 0.05)'
      } : {}}
    >
      {isFeaturedBrand(brand) ? `● ${brand}` : brand}
    </option>
  ))}
</Select>
```

### 2. GlassSphere with Logo

```typescript
// ✅ الحفاظ على GlassSphere مع CarBrandLogo
<GlassSphere>
  {selectedBrand && (
    <CarBrandLogo make={selectedBrand} size={192} showName={false} />
  )}
</GlassSphere>
```

### 3. Green Border Pulse (Success State)

```typescript
// ✅ الحفاظ على Green border عند ملء الحقل
const getInputStyle = (hasValue: boolean) => ({
  borderColor: hasValue ? '#22c55e' : 'var(--border)', // ✅ Green
  color: hasValue ? '#22c55e' : 'var(--text-primary)',
  fontWeight: hasValue ? '600' : 'normal',
  transition: 'all 0.3s ease'
});
```

---

## 🔧 Store Usage

### Update Form Data

```typescript
const { updateStepData } = useCarListingStore();

// Update step 2 data
updateStepData('step2', {
  make: 'BMW',
  model: 'X5',
  year: 2020,
});
```

### Validate Step

```typescript
const { validateStep } = useCarListingStore();

const handleNext = async () => {
  const isValid = await validateStep(currentStep);
  if (isValid) {
    goToNextStep();
  }
};
```

### Access Form Data

```typescript
const { formData } = useCarListingStore();

const make = formData.step2?.make;
const price = formData.step5?.price;
```

---

## 🚀 Next Steps

1. ✅ **Store & Schemas** - تم إنشاؤها
2. ⏳ **Step Components** - تحتاج للتنفيذ مع الحفاظ على التفاصيل
3. ⏳ **Wizard Component** - Parent component
4. ⏳ **Progress & Navigation** - Components
5. ⏳ **Image Compression** - Utility
6. ⏳ **Integration** - دمج مع النظام القديم

---

## 📚 Resources

- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Framer Motion](https://www.framer.com/motion/)

---

**تم الإنشاء:** 2025-01-26  
**الحالة:** 🚧 قيد التنفيذ

