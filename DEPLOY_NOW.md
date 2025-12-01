# نشر التحديثات الآن - Deploy Updates Now

## 🚀 خطوات النشر السريع

### الطريقة 1: استخدام السكريبت (الأسهل)

```powershell
cd "C:\Users\hamda\Desktop\New Globul Cars"
.\QUICK_DEPLOY.ps1
```

### الطريقة 2: الأوامر اليدوية

```powershell
cd "C:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace"

# مسح مجلد البناء القديم
if (Test-Path "build") { Remove-Item -Recurse -Force "build" }

# بناء المشروع
npm run build

# نشر مع force (إجبار)
firebase deploy --only hosting --force
```

---

## 🔧 بعد النشر - مسح Cache المتصفح

### طريقة سريعة (Hard Refresh):
- **Windows:** اضغط `Ctrl + Shift + R` أو `Ctrl + F5`
- **Mac:** اضغط `Cmd + Shift + R`

### طريقة كاملة (مسح Cache):
1. اضغط `Ctrl + Shift + Delete`
2. اختر "Cached images and files"
3. اختر "All time"
4. اضغط "Clear data"

### طريقة Developer Tools:
1. اضغط `F12` لفتح Developer Tools
2. اضغط بزر الماوس الأيمن على زر Refresh
3. اختر "Empty Cache and Hard Reload"

---

## ✅ التحقق من النشر

بعد النشر:
1. افتح: https://mobilebg.eu/
2. اضغط `Ctrl + Shift + R` (Hard Refresh)
3. يجب أن ترى التحديثات الجديدة

---

## 📋 التغييرات المطبقة

✅ تحديث `firebase.json` - إزالة cache من ملفات JS/CSS
✅ تحديث `index.html` - إضافة meta tags لمنع cache
✅ إنشاء سكريبتات النشر السريع

---

**ملاحظة:** قد يستغرق الأمر 1-2 دقيقة حتى تظهر التحديثات على جميع الخوادم.

