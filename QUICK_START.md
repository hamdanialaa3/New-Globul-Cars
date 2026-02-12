# 🚀 How to Start Development Server - Quick Guide

## ⚡ الطريقة الأسرع والأفضل

### Windows - الطريقة 1 (الأسهل):
```
اضغط نقراً مزدوجاً على:
START_DEV.bat
```

### Windows - الطريقة 2 (PowerShell):
```powershell
.\START_DEV.ps1
```

### macOS / Linux:
```bash
npm run start:dev
```

---

## ⏱️ الوقت المتوقع

### المرة الأولى:
- **Webpack build:** 20-40 ثانية
- **TypeScript compilation:** 10-20 ثانية
- **Server startup:** 5 ثوان
- **الإجمالي:** 35-65 ثانية

### المرات التالية (Hot Reload):
- **Fast refresh:** 2-5 ثوان ⚡

---

## 🎯 المدرج التفاعلي

| الوقت | ماذا يحدث |
|-------|-----------|
| 0-5s | Node.js ينطلق |
| 5-15s | Webpack يبدأ الترجمة |
| 15-40s | TypeScript يجمّع الملفات |
| 40-50s | ESLint يفحص الكود |
| 50-60s | Dev server جاهز ✓ |
| 60s+ | الصفحة تحميل في المتصفح |

---

## 🔍 معالجة المشاكل

### المشكلة: "Port 3000 already in use"

```bash
# الحل الأول: استخدم START_DEV.bat (يحلها تلقائياً)

# أو يدويًا:
npm start  # سيسأل عن بورت بديل
```

### المشكلة: "Out of memory" أو crashes

```bash
# زيادة الذاكرة المخصصة:
$env:NODE_OPTIONS='--max_old_space_size=8192'
npm start
```

### المشكلة: بطيء جداً جداً (>120 ثانية)

```bash
# نظّف كل شيء وأعد التثبيت:
npm run clean:all
npm install --legacy-peer-deps
npm run start:dev
```

---

## 📚 الأوامر المتاحة

```bash
npm start                   # بدء بطيء، يفتح المتصفح
npm run start:dev          # بدء مُحسّن، بدون متصفح
npm run build              # بناء production
npm run type-check         # فحص TypeScript
npm run test               # تشغيل الاختبارات
npm run clean:all          # تنظيف شامل
npm run dev:vite           # بدء مع Vite (أسرع 5x - مستقبلي)
```

---

## 💡 نصائح الأداء

### 1. أغلق البرامج الثقيلة
- مستعرضات أخرى
- Docker
- VirtualBox
- IDEs الثقيلة

### 2. استخدم SSD
- HDD = بطيء جداً
- SSD = سريع ⚡

### 3. تقليل RAM المستخدم
- أغلق التطبيقات غير الضرورية
- تحقق من استخدام الذاكرة:

```powershell
Get-Process | Where-Object { $_.Memory -gt 500MB } | Sort-Object Memory -Descending
```

### 4. تحديث Node.js
```bash
node --version
# يجب أن تكون v18+ أو v20+
```

---

## 🎓 المرة القادمة

بعد إغلاق التطبيق وتشغيله مرة أخرى:
- **المرة الأولى:** 30-60 ثانية
- **المرات التالية:** فقط 2-5 ثوانٍ بفضل caching ⚡

---

## 🆘 هل تحتاج مساعدة؟

اقرأ: [SLOW_START_SOLUTIONS.md](SLOW_START_SOLUTIONS.md)

---

**الخلاصة:** استخدم `START_DEV.bat` وتمتع بأسرع طريقة ممكنة! 🚀
