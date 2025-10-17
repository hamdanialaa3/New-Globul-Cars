# 🌐 دليل ربط الدومين والنشر
## Domain Deployment Guide - mobilebg.eu

**التاريخ:** 16 أكتوبر 2025  
**الدومين:** mobilebg.eu  
**Firebase Project:** fire-new-globul

---

## 📋 الخطوات الكاملة

### ✅ الخطوة 1: بناء المشروع للإنتاج
```bash
cd bulgarian-car-marketplace
npm run build
```

### ✅ الخطوة 2: ربط الدومين المخصص
```bash
firebase hosting:sites:create mobilebg-eu --project fire-new-globul
firebase target:apply hosting production mobilebg-eu
```

أو مباشرة:
```bash
firebase hosting:channel:deploy mobilebg-eu --expires 30d
```

### ✅ الخطوة 3: إضافة Custom Domain في Firebase Console

**في Firebase Console:**
1. اذهب إلى: https://console.firebase.google.com/project/fire-new-globul/hosting/sites
2. اضغط على "Add custom domain"
3. أدخل: `mobilebg.eu`
4. اختر "Continue"

Firebase سيعطيك DNS Records للإضافة

### ✅ الخطوة 4: تكوين DNS في مزود الدومين

**DNS Records المطلوبة (ستحصل عليها من Firebase):**

**للـ Root Domain (mobilebg.eu):**
```
Type: A
Name: @
Value: [Firebase IP addresses]

مثال:
151.101.1.195
151.101.65.195
```

**للـ www Subdomain:**
```
Type: CNAME
Name: www
Value: fire-new-globul.web.app
```

### ✅ الخطوة 5: تحديث Firebase Config
```typescript
// في firebase-config.ts
authDomain: "mobilebg.eu"
```

### ✅ الخطوة 6: النشر النهائي
```bash
firebase deploy --only hosting
```

---

## 🎯 البدء الآن

دعني أبدأ بالخطوة الأولى: بناء المشروع!

