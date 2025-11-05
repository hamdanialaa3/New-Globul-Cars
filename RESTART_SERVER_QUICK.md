# 🔄 إعادة تشغيل الخادم - دليل سريع

> **إذا توقف الخادم أو لم يعمل، اتبع هذه الخطوات:**

---

## 🚀 الطريقة السريعة (موصى بها)

### 1️⃣ استخدام ملف BAT:
```bash
# انقر مزدوجاً على هذا الملف:
bulgarian-car-marketplace/START_PRODUCTION_SERVER.bat
```

---

## 🔧 الطريقة اليدوية (PowerShell)

### 1️⃣ إيقاف العمليات القديمة:
```powershell
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
```

### 2️⃣ إعادة تشغيل الخادم:
```powershell
cd "c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace"
npx serve -s build -l 3000
```

### 3️⃣ فتح المتصفح:
- افتح: http://localhost:3000

---

## 🛠️ إذا لم يعمل (حل المشاكل)

### المشكلة: "المنفذ 3000 مستخدم"
```powershell
# افحص المنفذ:
Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet

# إذا كانت النتيجة True، أوقف العمليات:
Stop-Process -Name node -Force
```

### المشكلة: "build folder not found"
```powershell
cd bulgarian-car-marketplace
npm run build
```

### المشكلة: "npm command not found"
- تأكد من تثبيت Node.js: https://nodejs.org

---

## 📋 أمر واحد (كل شيء)

نسخ والصق في PowerShell:

```powershell
Stop-Process -Name node -Force -ErrorAction SilentlyContinue ; `
Start-Sleep -Seconds 2 ; `
cd "c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace" ; `
Start-Process "http://localhost:3000" ; `
npx serve -s build -l 3000
```

---

## ✅ كيف تعرف أن الخادم يعمل؟

### علامات النجاح:
```
✅ رسالة "Serving!" في Terminal
✅ "Local: http://localhost:3000"
✅ المتصفح يفتح تلقائياً
✅ الموقع يظهر بدون أخطاء
```

### علامات المشكلة:
```
❌ "Port 3000 is in use"
❌ "EACCES: permission denied"
❌ "Cannot find module"
❌ صفحة بيضاء في المتصفح
```

---

## 🔍 فحص حالة الخادم

```powershell
# فحص المنفذ:
Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet

# عرض عمليات Node.js:
Get-Process -Name node -ErrorAction SilentlyContinue | Format-Table

# فحص إذا كان serve يعمل:
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Select-Object Id, StartTime
```

---

## 💡 نصائح

### ✅ افعل:
- استخدم `START_PRODUCTION_SERVER.bat` للتشغيل السريع
- أغلق العمليات القديمة قبل إعادة التشغيل
- تأكد من وجود مجلد `build/`

### ❌ لا تفعل:
- لا تشغل عدة نوافذ خادم في نفس الوقت
- لا تغلق Terminal بينما الخادم يعمل (Ctrl+C أولاً)
- لا تحذف مجلد `build/`

---

## 🆘 المساعدة

### للمشاكل الشائعة:
📖 راجع: `SERVER_NOW_WORKING.md`

### للبناء من جديد:
```powershell
cd bulgarian-car-marketplace
npm run build
```

### لإعادة تثبيت التبعيات:
```powershell
cd bulgarian-car-marketplace
rm -r node_modules, package-lock.json -Force
npm install --legacy-peer-deps
npm run build
```

---

## 🎯 الأوامر المفيدة

| الأمر | الوظيفة |
|-------|---------|
| `npx serve -s build -l 3000` | تشغيل الخادم الإنتاجي |
| `npm start` | تشغيل خادم التطوير (بطيء) |
| `npm run build` | بناء النسخة الإنتاجية |
| `Stop-Process -Name node -Force` | إيقاف جميع خوادم Node.js |
| `Test-NetConnection localhost -Port 3000` | فحص المنفذ 3000 |

---

## 📱 تشغيل على الشبكة

الخادم متاح أيضاً على الشبكة المحلية:
```
🌐 Network: http://192.168.0.250:3000
```

يمكنك الوصول من:
- هاتفك المحمول (نفس الشبكة)
- أي جهاز على نفس الـ WiFi
- جهاز آخر في المنزل

---

**آخر تحديث:** 5 نوفمبر 2025  
**الحالة الحالية:** ✅ الخادم يعمل!  
**الرابط:** http://localhost:3000
