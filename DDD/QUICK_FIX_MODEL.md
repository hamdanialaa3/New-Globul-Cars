# ⚡ إصلاح سريع - Model المفقود

## 🎯 المشكلة
```
Липсва задължителна информация: Model (Модел)
```

## ✅ الحل (نسخ ولصق)

### 1️⃣ في ContactNamePage.tsx

**بعد السطر:**
```tsx
const make = searchParams.get('mk');
```

**أضف:**
```tsx
const model = searchParams.get('md');
```

**في handleContinue() وhandleBack()، بعد:**
```tsx
if (make) params.set('mk', make);
```

**أضف:**
```tsx
if (model) params.set('md', model);
```

---

### 2️⃣ في ContactAddressPage.tsx

**نفس الشيء:**
```tsx
const model = searchParams.get('md');
```

**وفي التنقل:**
```tsx
if (model) params.set('md', model);
```

---

### 3️⃣ في ContactPhonePage.tsx

**أضف:**
```tsx
const model = searchParams.get('md');
```

**في handleFinish(), بعد:**
```tsx
if (!make || !model) {
  setError('Липсва задължителна информация: Марка и Модел');
  setIsSubmitting(false);
  return;
}
```

**في carData:**
```tsx
const carData = {
  make: make,
  model: model,  // ← هنا
  year: parseInt(year),
  // ... باقي البيانات
};
```

**في Summary:**
```tsx
<SummaryValue>{make} {model} ({year})</SummaryValue>
```

---

## 🧪 اختبار

افتح:
```
http://localhost:3000/sell/auto
```

اتبع الخطوات وتأكد من أن URL يحتوي على `&md=Yaris`

---

## ✅ Done!

الآن Model سيظهر في Summary وسيتم حفظه!

