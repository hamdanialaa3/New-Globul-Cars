# 🔥 دليل ربط الدومين المخصص مع Firebase
## Firebase Custom Domain Setup - mobilebg.eu

**الدومين:** mobilebg.eu  
**Firebase Project:** fire-new-globul  
**التاريخ:** 16 أكتوبر 2025

---

## 📋 الخطوات الكاملة بالترتيب

### ✅ الخطوة 1: DNS Records (مكتملة ✅)

**ما تم إضافته:**
```
✅ A Record:
   Host: mobilebg.eu
   Type: A
   Data: 199.36.158.100
   TTL: 30 mins

✅ TXT Record:
   Host: mobilebg.eu
   Type: TXT
   Data: hosting-site=fire-new-globul
   TTL: 30 mins
```

---

### 🔄 الخطوة 2: إضافة Custom Domain في Firebase Console

**⚠️ هذه الخطوة يجب عليك أنت القيام بها يدوياً:**

#### أ. افتح Firebase Console
```
https://console.firebase.google.com/project/fire-new-globul/hosting/sites
```

#### ب. اضغط على "Add custom domain"
- في القائمة الجانبية، اختر "Hosting"
- اضغط على زر "Add custom domain"

#### ج. أدخل الدومين
```
mobilebg.eu
```

#### د. اختر Setup Mode
- اختر: "Advanced setup" أو "Quick setup"
- اضغط "Continue"

#### هـ. تحقق من DNS Records
Firebase سيعرض لك الـ Records المطلوبة:
```
✅ A Record: 199.36.158.100  ← موجود!
✅ TXT Record: hosting-site=fire-new-globul  ← موجود!
```

#### و. انتظر التحقق
- Firebase سيتحقق تلقائياً (قد يستغرق 5-10 دقائق)
- ستظهر رسالة: "Domain verification successful ✅"
- سيبدأ Firebase في إصدار SSL Certificate

---

### 🔄 الخطوة 3: إضافة www Subdomain (اختياري)

**إذا أردت www.mobilebg.eu أيضاً:**

1. في نفس شاشة Custom Domain في Firebase
2. اضغط "Add another domain"
3. أدخل: `www.mobilebg.eu`
4. أضف CNAME Record في DNS:
   ```
   Host: www
   Type: CNAME
   Data: fire-new-globul.web.app
   TTL: 30 mins
   ```

---

### ✅ الخطوة 4: Firebase Config (مكتملة ✅)

```typescript
// تم تحديث firebase-config.ts:
authDomain: "mobilebg.eu"  ✅
```

---

### 🔄 الخطوة 5: إعادة البناء والنشر

```bash
# إعادة البناء (قيد التنفيذ...)
cd bulgarian-car-marketplace
npm run build

# النشر على Firebase
cd ..
firebase deploy --only hosting
```

---

## 📊 حالة DNS Propagation

**للتحقق من انتشار DNS:**

```bash
# Windows PowerShell:
nslookup mobilebg.eu

# يجب أن يعرض:
# Address: 199.36.158.100
```

**أو استخدم أدوات أونلاين:**
- https://www.whatsmydns.net/#A/mobilebg.eu
- https://dnschecker.org/#A/mobilebg.eu

---

## 🔐 SSL Certificate

**Firebase سيُصدر SSL تلقائياً:**
- ⏱ الوقت: 15-30 دقيقة بعد التحقق من الدومين
- 🔒 Let's Encrypt SSL (مجاني)
- 🔄 التجديد تلقائي

**للتحقق:**
```
https://mobilebg.eu  ← يجب أن يعرض 🔒 (آمن)
```

---

## 🚀 بعد اكتمال كل شيء:

### الروابط النهائية:

```
الدومين الرئيسي:
✅ https://mobilebg.eu

Firebase Domains (ستبقى تعمل):
✅ https://fire-new-globul.web.app
✅ https://fire-new-globul.firebaseapp.com

www Subdomain (إذا أضفته):
✅ https://www.mobilebg.eu
```

---

## 🔍 استكشاف الأخطاء

### مشكلة: "Domain verification failed"
**الحل:**
- تحقق من DNS Records باستخدام `nslookup`
- انتظر 30-60 دقيقة لانتشار DNS
- تأكد من TXT Record صحيح: `hosting-site=fire-new-globul`

### مشكلة: "SSL not working"
**الحل:**
- انتظر 15-30 دقيقة
- Firebase يُصدر SSL تلقائياً
- افتح الصفحة في Incognito mode

### مشكلة: "Too many redirects"
**الحل:**
- امسح cache المتصفح
- تحقق من firewall/CDN settings
- تأكد من عدم وجود redirect loops

---

## 📝 ملاحظات مهمة:

1. **الدومين محجوز باسمك؟** ✅ (mobilebg.eu)
2. **DNS Provider:** تحقق من أنه يدعم A Records و TXT Records
3. **TTL:** 30 دقيقة (جيد للبداية، يمكن زيادته لاحقاً لـ 1 hour أو أكثر)
4. **Cloudflare:** إذا كنت تستخدم Cloudflare، أوقف Proxy (🧡 orange cloud) مؤقتاً

---

## 🎯 الخطوة التالية الآن:

**✋ توقف هنا وافعل ما يلي:**

1. **افتح هذا الرابط في متصفحك:**
   ```
   https://console.firebase.google.com/project/fire-new-globul/hosting/sites
   ```

2. **اضغط "Add custom domain"**

3. **أدخل:** `mobilebg.eu`

4. **تابع الخطوات حتى ترى "Domain verification successful ✅"**

5. **ثم أخبرني لنكمل النشر!** 🚀

---

**⏳ بانتظارك...** 😊

