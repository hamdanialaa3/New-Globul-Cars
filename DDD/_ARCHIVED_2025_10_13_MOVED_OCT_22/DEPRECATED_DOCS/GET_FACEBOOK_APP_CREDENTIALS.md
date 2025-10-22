# 🎯 كيف تحصل على Facebook App ID و App Secret - دليل مصور

**آخر تحديث:** 10 أكتوبر 2025  
**لحساب:** Facebook Business Account  
**الصفحة:** Bulgarian Car Marketplace

---

## 🔍 ما تكتبه بالضبط في Firebase:

```
Configure provider (Step 2 of 2)
Facebook

App ID:
┌────────────────────────────────────┐
│ [رقم من 15-16 خانة]               │ ← من Facebook Developers
│ مثال: 389204730147152              │
└────────────────────────────────────┘

App secret:
┌────────────────────────────────────┐
│ [نص من 32 حرف وأرقام]             │ ← من Facebook Developers  
│ مثال: 5e2b8c9f4a3d1e6b7c8d9e0f... │
└────────────────────────────────────┘
```

---

## 📱 كيف تحصل عليهما (3 طرق):

---

## 🔵 الطريقة 1: من Facebook Developers (الأسهل)

### الخطوة 1:
**افتح:**
```
https://developers.facebook.com/apps
```

### الخطوة 2: سترى واحدة من هذه الحالات:

#### حالة A: ترى قائمة Apps ✅
```
My Apps
├── Bulgarian Car Marketplace
├── Another App
└── ...

→ اضغط على "Bulgarian Car Marketplace"
→ اذهب للخطوة 3
```

#### حالة B: صفحة فارغة (No apps) ❌
```
You don't have any apps yet

→ اضغط "Create App"
→ اتبع الخطوات في الطريقة 3
```

#### حالة C: رسالة "Join Developer Program" ⚠️
```
→ اضغط "Get Started"
→ املأ البيانات المطلوبة
→ ارجع للخطوة 1
```

---

### الخطوة 3: في App Dashboard

**في أعلى الصفحة:**
```
┌─────────────────────────────────────────┐
│ 📱 Bulgarian Car Marketplace            │
│ App ID: 389204730147152  ← انسخ هذا!   │
└─────────────────────────────────────────┘
```

**انسخ App ID → الصقه في Firebase!**

---

### الخطوة 4: احصل على App Secret

**في القائمة اليسرى، اضغط:**
```
Settings > Basic
```

**ابحث عن:**
```
App Secret
••••••••••••••••••••••••  [Show]
```

**اضغط "Show"**

**أدخل Facebook Password:**
```
[password حسابك في Facebook]
```

**سيظهر:**
```
App Secret
5e2b8c9f4a3d1e6b7c8d9e0f1a2b3c4d
```

**انسخه → الصقه في Firebase!**

---

## 🏢 الطريقة 2: من Facebook Business Manager

### إذا كنت تستخدم Business Manager:

**الخطوة 1: افتح Business Settings**
```
https://business.facebook.com/settings/
```

**الخطوة 2: في القائمة اليسرى:**
```
Apps > Apps
```

**الخطوة 3: ستجد:**
```
Business Apps
├── Bulgarian Car Marketplace
│   App ID: 389204730147152
└── ...
```

**الخطوة 4: اضغط على App**

**الخطوة 5: View in Developers**
```
سيفتح Facebook Developers Console
→ اتبع الطريقة 1 من الخطوة 3
```

---

## ➕ الطريقة 3: إنشاء App جديد (إذا لم يكن موجود)

### للحسابات الشخصية:

**افتح:**
```
https://developers.facebook.com/apps/create/
```

**اختر:**
```
○ Consumer
● Business  ← اختر هذا لحساب الأعمال!
```

**املأ:**
```
App Name: Bulgarian Car Marketplace
Contact Email: alaa.hamdani@yahoo.com
Business Account: [اختر حسابك]
```

**Create App**

---

### للحسابات التجارية (Business):

**افتح:**
```
https://business.facebook.com/settings/apps
```

**اضغط:** `Add > Create a New App ID`

**املأ:**
```
App Name: Bulgarian Car Marketplace Auth
Purpose: Login & Authentication
```

**Create**

---

## 📊 الفرق بين الحسابات:

### Personal Developer Account:
```
✅ مجاني
✅ سهل الإنشاء
⚠️ محدود في الميزات
⚠️ يحتاج App Review للإنتاج
```

### Business Account:
```
✅ ميزات متقدمة
✅ إحصائيات تفصيلية
✅ Ad Account integration
✅ System Users
⚠️ أكثر تعقيداً
```

---

## 🎯 ما تحتاجه بالضبط لـ Firebase:

```
فقط اثنين:

1. App ID (رقم من 15-16 خانة)
   احصل عليه من: Facebook Developers > App Dashboard
   
2. App Secret (نص من 32 حرف)
   احصل عليه من: Settings > Basic > Show
```

---

## 🔗 الروابط الكاملة:

### حساب المطورين:
```
Main: https://developers.facebook.com/
Apps: https://developers.facebook.com/apps
Create: https://developers.facebook.com/apps/create/
```

### حساب الأعمال:
```
Main: https://business.facebook.com/
Settings: https://business.facebook.com/settings/
Apps: https://business.facebook.com/settings/apps
```

### صفحتك:
```
https://www.facebook.com/people/Bulgarian-Car-Marketplace/100080260449528/
```

---

## ⚠️ مشاكل شائعة وحلولها:

### Problem 1: "You don't have access to this app"
```
Solution:
- تأكد أنك Admin على Business Account
- اذهب لـ Business Settings > People > Add yourself as Admin
```

### Problem 2: "App is in Development Mode"
```
Solution:
- للتجربة: يعمل بدون مشاكل
- للإنتاج: غيّر Mode لـ "Live" بعد الانتهاء
```

### Problem 3: "Invalid App Secret"
```
Solution:
- تأكد من الضغط على "Show" أولاً
- انسخ السر كاملاً (32 حرف)
- لا تضع مسافات قبل أو بعد
```

---

## 📋 Checklist سريع:

```
☐ فتحت Facebook Developers أو Business Manager
☐ وجدت أو أنشأت App
☐ نسخت App ID (15-16 رقم)
☐ نسخت App Secret (32 حرف - بعد الضغط على Show)
☐ لصقتهما في Firebase Console
☐ نسخت OAuth Redirect URI من Firebase
☐ أضفته في Facebook Login Settings
☐ حفظت كل شيء
```

---

## 🎓 معلومات إضافية:

### Facebook Page ID (موجود بالفعل):
```
Page ID: 100080260449528
Page URL: https://www.facebook.com/people/Bulgarian-Car-Marketplace/100080260449528/

هذا مختلف عن App ID!
- Page ID: للصفحة
- App ID: للتطبيق/الربط
```

### Access Tokens (للميزات المتقدمة):
```
بعد الإعداد الأساسي، يمكنك الحصول على:

1. User Access Token: للمستخدمين
2. Page Access Token: للصفحة
3. App Access Token: للتطبيق

لكن الآن فقط تحتاج:
✅ App ID
✅ App Secret
```

---

## 🎯 الخطوة الأولى الآن:

**افتح أحد هذين الرابطين:**

### للمطورين:
```
https://developers.facebook.com/apps
```

### للأعمال:
```
https://business.facebook.com/settings/apps
```

**ثم أخبرني:**
- ✅ وجدت App → أعطني App ID
- ❌ ما في App → سأساعدك في إنشاء واحد
- ❓ محتار → أخبرني ماذا ترى بالضبط

---

**🔵 ماذا ترى الآن في Facebook Developers أو Business Manager؟**

