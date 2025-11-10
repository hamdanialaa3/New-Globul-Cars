# CarSearchSystem

نظام البحث المعاد هيكلته للسيارات في منصة Globul Cars.

## الهيكل المعماري

```
CarSearchSystem/
├── CarSearchSystem.tsx      # المكون الرئيسي
├── types.ts                 # تعريفات الأنواع
├── styles.ts                # التصميم المرئي
├── hooks/
│   └── useCarSearch.ts      # خطاف إدارة الحالة
└── index.ts                 # نقطة التصدير
```

## المكونات

### CarSearchSystem.tsx
المكون الرئيسي المسؤول عن عرض واجهة البحث. يستخدم:
- `useCarSearch` لإدارة الحالة
- مكونات التصميم من `styles.ts`
- أنواع البيانات من `types.ts`

### useCarSearch Hook
خطاف مخصص لإدارة:
- حالة الفلاتر
- تحديث البيانات المتسلسلة (make → model → generation → bodyStyle)
- منطق البحث والإعادة تعيين

### Types
تعريفات الأنواع:
- `OptionType`: خيارات القوائم المنسدلة
- `FiltersType`: فلاتر البحث
- `CarSearchSystemProps`: خصائص المكون

### Styles
مكونات التصميم المستجيبة:
- `SearchContainer`: حاوي البحث الرئيسي
- `SearchGroup`: مجموعة كل حقل بحث
- `SearchLabel`: تسمية الحقول
- `SearchSelect`: القوائم المنسدلة
- `SearchButton`: زر البحث

## الاستخدام

```tsx
import CarSearchSystem from './components/CarSearchSystem';

const handleSearch = (filters) => {
  console.log('البحث بالفلاتر:', filters);
  // تنفيذ منطق البحث
};

<CarSearchSystem onSearch={handleSearch} />
```

## المزايا

- ✅ فصل المسؤوليات (Separation of Concerns)
- ✅ إعادة استخدام الكود (DRY)
- ✅ سهولة الصيانة والتطوير
- ✅ تصميم متجاوب
- ✅ دعم متعدد اللغات
- ✅ TypeScript للأمان النوعي

## التطوير المستقبلي

- إضافة المزيد من فلاتر البحث
- تحسين تجربة المستخدم
- إضافة اقتراحات تلقائية
- دعم البحث المتقدم