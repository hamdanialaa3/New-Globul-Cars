# 📤 حالة النشر - التغييرات في SellVehicleStep1
## Deployment Status - SellVehicleStep1 Changes

**تاريخ**: 14 ديسمبر 2025

---

## ✅ التغييرات المطلوبة

### SellVehicleStep1.tsx - تعطيل البطاقات الـ5

**التغييرات**:
- ✅ Car فقط نشط (`disabled: false`)
- ✅ Van معطل (`disabled: true`) + Badge "Coming Soon"
- ✅ Motorcycle معطل (`disabled: true`) + Badge "Coming Soon"
- ✅ Truck معطل (`disabled: true`) + Badge "Coming Soon"
- ✅ Bus معطل (`disabled: true`) + Badge "Coming Soon"
- ✅ Parts معطل (`disabled: true`) + Badge "Coming Soon"

**الملف**: `bulgarian-car-marketplace/src/components/sell-workflow/steps/SellVehicleStep1.tsx`

---

## 📋 خطوات النشر

### 1. ✅ إضافة إلى Git
```bash
git add bulgarian-car-marketplace/src/components/sell-workflow/steps/SellVehicleStep1.tsx
```

### 2. ✅ Commit
```bash
git commit -m "feat: تعطيل بطاقات Van/Motorcycle/Truck/Bus/Parts في SellVehicleStep1 - Car فقط نشط"
```

### 3. ✅ Push إلى GitHub
```bash
git push origin main
```

### 4. ⏳ Build المشروع
```bash
cd bulgarian-car-marketplace
npm run build
```

### 5. ⏳ Deploy إلى Firebase
```bash
cd ..
firebase deploy --only hosting
```

---

## 🌐 المواقع المستهدفة

- ✅ https://fire-new-globul.web.app/sell/auto
- ✅ https://fire-new-globul.web.app/
- ✅ https://mobilebg.eu/

---

## ✅ التحقق

بعد النشر، تحقق من:
- ✅ Car فقط يمكن اختياره
- ✅ البطاقات الأخرى معطلة مع Badge "Coming Soon"
- ✅ Toast message عند الضغط على بطاقة معطلة

---

**الحالة**: ⏳ قيد النشر
