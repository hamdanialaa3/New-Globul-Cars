# 🧹 تعليمات تنظيف الكاشات والمنافذ والخوادم

## ✅ تم إنشاء سكريبتات التنظيف

تم إنشاء سكريبتات شاملة لتنظيف جميع الكاشات والمنافذ والخوادم.

---

## 🚀 الاستخدام السريع

### تنظيف شامل (موصى به)
```bash
npm run clean
```

### تنظيف الكاشات فقط
```bash
npm run clean:cache
```

### تنظيف شامل مع إعادة تثبيت
```bash
npm run clean:all
```

---

## 📋 ما يتم تنظيفه

### 1. عمليات Node.js
- ✅ إيقاف جميع عمليات Node.js قيد التشغيل
- ✅ تحرير الذاكرة والموارد

### 2. كاشات npm
- ✅ تنظيف npm cache
- ✅ حذف ملفات npm المؤقتة

### 3. مجلدات البناء
- ✅ حذف `build/`
- ✅ حذف `dist/`
- ✅ حذف `.next/` (إذا كان مستخدماً)
- ✅ حذف `out/` (إذا كان مستخدماً)

### 4. كاشات TypeScript
- ✅ حذف `.tsbuildinfo`
- ✅ حذف `tsconfig.tsbuildinfo`

### 5. كاشات React/CRA
- ✅ حذف `.cache/`
- ✅ حذف `node_modules/.cache/`

### 6. كاشات Vite
- ✅ حذف `node_modules/.vite/`

### 7. ملفات السجلات
- ✅ حذف `npm-debug.log`
- ✅ حذف `yarn-debug.log`
- ✅ حذف `yarn-error.log`

### 8. تقارير التغطية
- ✅ حذف `coverage/`

### 9. المنافذ (Ports)
- ✅ تنظيف المنافذ: 3000, 3001, 5173, 8080, 5000, 5001

---

## 🔧 تنظيف يدوي للمنافذ

### Windows PowerShell
```powershell
# تشغيل السكريبت المخصص
.\scripts\clean-ports.ps1

# أو يدوياً لكل منفذ
Get-NetTCPConnection -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Linux/Mac
```bash
# تشغيل السكريبت المخصص
chmod +x scripts/clean-ports.sh
./scripts/clean-ports.sh

# أو يدوياً لكل منفذ
lsof -ti:3000 | xargs kill -9
```

---

## 🌐 تنظيف كاشات المتصفح

### Chrome/Edge
1. اضغط `Ctrl + Shift + Delete` (أو `Cmd + Shift + Delete` على Mac)
2. اختر "Cached images and files"
3. اختر "All time"
4. اضغط "Clear data"

### Firefox
1. اضغط `Ctrl + Shift + Delete`
2. اختر "Cache"
3. اختر "Everything"
4. اضغط "Clear Now"

### Safari
1. اضغط `Cmd + Option + E` لمسح الكاش
2. أو من القائمة: Safari → Clear History → All History

---

## 📦 تنظيف node_modules (اختياري)

⚠️ **تحذير**: هذا سيحذف جميع الحزم المثبتة. ستحتاج إلى `npm install` بعد ذلك.

```bash
# حذف node_modules
rm -rf node_modules  # Linux/Mac
Remove-Item -Recurse -Force node_modules  # Windows PowerShell

# إعادة التثبيت
npm install
```

---

## 🔄 إعادة التشغيل بعد التنظيف

بعد التنظيف، قم بإعادة تشغيل الخادم:

```bash
npm start
```

---

## 📝 ملاحظات

- ✅ السكريبتات آمنة ولا تحذف ملفات مهمة
- ✅ ملفات `.env.local` لا يتم حذفها (تحتوي على إعدادات مهمة)
- ✅ `node_modules/` لا يتم حذفها تلقائياً (استخدم `npm run clean:all` إذا أردت)
- ✅ جميع العمليات تتم بأمان مع معالجة الأخطاء

---

## 🆘 حل المشاكل

### إذا فشل تنظيف المنافذ
- على Windows: قد تحتاج إلى تشغيل PowerShell كمسؤول (Run as Administrator)
- على Linux/Mac: قد تحتاج إلى `sudo`

### إذا استمرت المشاكل
```bash
# إعادة تشغيل الكمبيوتر (حل نهائي)
# أو إعادة تشغيل Terminal/Command Prompt
```

---

**تاريخ الإنشاء**: 23 ديسمبر 2025  
**الإصدار**: 1.0.0

