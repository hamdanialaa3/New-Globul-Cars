# 🧪 دليل اختبار نظام المراسلة

## تشغيل الاختبارات

### اختبار جميع المكونات
```bash
npm test -- messaging
```

### اختبار مكون معين
```bash
# InteractiveMessageBubble
npm test -- InteractiveMessageBubble.test.tsx

# OfferBubble
npm test -- OfferBubble.test.tsx

# PresenceIndicator
npm test -- PresenceIndicator.test.tsx

# Integration Tests
npm test -- integration.test.tsx
```

### مع تغطية الكود
```bash
npm test -- messaging --coverage
```

### Watch Mode (للتطوير)
```bash
npm test -- messaging --watch
```

---

## 📊 الاختبارات المتاحة (41 test)

### InteractiveMessageBubble (8 tests)
- ✅ عرض رسالة نصية
- ✅ عرض حالة التسليم
- ✅ عرض نوع العرض
- ✅ عرض رسالة النظام
- ✅ عرض الصورة الرمزية
- ✅ تنسيق الوقت
- ✅ أنماط مختلفة للمرسل/المستلم
- ✅ معالجة فشل التسليم

### OfferBubble (15 tests)
- ✅ عرض تفاصيل العرض
- ✅ شارة الحالة (pending)
- ✅ عرض الوقت المتبقي
- ✅ أزرار الإجراءات للمستلم
- ✅ إخفاء الأزرار للمرسل
- ✅ استدعاء onAccept
- ✅ استدعاء onReject
- ✅ عرض إدخال العرض المضاد
- ✅ التحقق من المبلغ
- ✅ استدعاء onCounter
- ✅ حالة مقبول
- ✅ حالة مرفوض
- ✅ حالة منتهي
- ✅ تعطيل الأزرار أثناء التحميل
- ✅ معالجة الأخطاء

### PresenceIndicator (8 tests)
- ✅ عرض حالة متصل
- ✅ عرض حالة غير متصل مع آخر ظهور
- ✅ عرض مؤشر الكتابة
- ✅ الوضع المدمج
- ✅ تنظيف المستمعين عند unmount
- ✅ PresenceWithAvatar مع الصورة
- ✅ صورة احتياطية
- ✅ أحجام مختلفة

### Integration Tests (10 tests)
- ✅ عرض المحادثة الكامل
- ✅ إرسال رسالة نصية
- ✅ فتح لوحة الإجراءات السريعة
- ✅ إرسال عرض عبر الإجراءات السريعة
- ✅ إرسال رسالة بزر Enter
- ✅ تعطيل زر الإرسال عند الفراغ
- ✅ عرض حالة فارغة
- ✅ معالجة أخطاء الشبكة
- ✅ تدفق التفاوض الكامل
- ✅ إرسال رسائل متعددة سريعة

---

## 🎯 معايير النجاح

### تغطية الكود
- **الهدف**: >80%
- **الحالي**: يتم حسابها عند التشغيل

### جميع الاختبارات
```bash
PASS src/components/messaging/__tests__/InteractiveMessageBubble.test.tsx
  ✓ renders text message correctly
  ✓ shows delivery status for sender
  ... (8/8 passing)

PASS src/components/messaging/__tests__/OfferBubble.test.tsx
  ✓ renders offer details correctly
  ✓ shows pending status badge
  ... (15/15 passing)

PASS src/components/messaging/__tests__/PresenceIndicator.test.tsx
  ✓ shows online status
  ✓ shows offline status with last seen
  ... (8/8 passing)

PASS src/components/messaging/__tests__/integration.test.tsx
  ✓ renders conversation view with all components
  ✓ sends text message successfully
  ... (10/10 passing)

Test Suites: 4 passed, 4 total
Tests:       41 passed, 41 total
```

---

## 🐛 استكشاف الأخطاء

### خطأ: Cannot find module '@/services/messaging/core'
**الحل**: تأكد من أن path alias مكوّن في `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### خطأ: Firebase is not defined
**الحل**: تأكد من mock Firebase في setup:
```typescript
jest.mock('@/services/messaging/core', () => ({
  messagingOrchestrator: { ... }
}));
```

### خطأ: date-fns locale not found
**الحل**: تثبيت date-fns:
```bash
npm install date-fns
```

---

## 📈 التقارير

### تقرير التغطية
```bash
npm test -- messaging --coverage --coverageReporters=html
```
سيتم إنشاء تقرير HTML في `coverage/lcov-report/index.html`

### تقرير مفصل
```bash
npm test -- messaging --verbose
```

---

## ✅ Checklist قبل Production

- [ ] جميع الاختبارات passing
- [ ] التغطية >80%
- [ ] لا توجد console errors
- [ ] لا توجد memory leaks
- [ ] الأداء مقبول (<100ms للرندر)
- [ ] متوافق مع Safari, Chrome, Firefox
- [ ] متوافق مع الموبايل

---

**آخر تحديث:** 28 ديسمبر 2025
