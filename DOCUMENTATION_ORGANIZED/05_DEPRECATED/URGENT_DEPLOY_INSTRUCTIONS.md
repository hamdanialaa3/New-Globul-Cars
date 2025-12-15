# 🚨 تعليمات النشر العاجلة - SellVehicleStep1
## Urgent Deploy Instructions - December 14, 2025

---

## ✅ التحقق المحلي

**الملف**: `bulgarian-car-marketplace/src/components/sell-workflow/steps/SellVehicleStep1.tsx`

**التغييرات موجودة محلياً**:
- ✅ Car: `disabled: false` (نشط)
- ✅ Van: `disabled: true` (معطل)
- ✅ Motorcycle: `disabled: true` (معطل)
- ✅ Truck: `disabled: true` (معطل)
- ✅ Bus: `disabled: true` (معطل)
- ✅ Parts: `disabled: true` (معطل)

**الحالة المحلية**: ✅ **صحيح 100%**

---

## 🚀 النشر الفوري (تنفيذ يدوي)

افتح **Terminal** في مجلد المشروع ونفّذ بالترتيب:

### الخطوة 1: الانتقال للمجلد
```bash
cd "c:\Users\hamda\Desktop\New Globul Cars"
```

### الخطوة 2: إضافة الملف
```bash
git add bulgarian-car-marketplace/src/components/sell-workflow/steps/SellVehicleStep1.tsx
```

### الخطوة 3: Commit
```bash
git commit -m "fix: نشر تغييرات SellVehicleStep1 - تعطيل البطاقات ال5"
```

### الخطوة 4: Push
```bash
git push origin main
```

### الخطوة 5: Build (2-5 دقائق)
```bash
cd bulgarian-car-marketplace
npm run build
```

**انتظر حتى ينتهي Build** (سترى "Build completed" أو "Compiled successfully")

### الخطوة 6: Deploy
```bash
cd ..
firebase deploy --only hosting
```

**انتظر حتى ينتهي Deploy** (سترى "Deploy complete!")

---

## 🎯 أو استخدم السكريبت

```bash
DEPLOY_SELLVEHICLESTEP1_NOW.bat
```

---

## 🌐 التحقق بعد النشر

1. انتظر 1-2 دقيقة بعد Deploy
2. افتح: https://fire-new-globul.web.app/sell/auto
3. امسح cache المتصفح (Ctrl+Shift+Delete)
4. تحقق من:
   - ✅ Car فقط نشط (يمكن اختياره)
   - ✅ البطاقات الأخرى معطلة (باهتة + Badge "Soon")

---

## ⚠️ إذا لم تظهر التغييرات

1. تأكد من أن Build تم بنجاح (مجلد `build` موجود)
2. تأكد من أن Deploy تم بنجاح (رسالة "Deploy complete!")
3. انتظر 2-3 دقائق إضافية
4. امسح cache المتصفح تماماً
5. افتح في نافذة خاصة (Incognito)

---

**الحالة**: ⏳ **قيد النشر - نفّذ الأوامر أعلاه**
