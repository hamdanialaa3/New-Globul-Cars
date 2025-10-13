# 🔵 دليل Facebook Business Account للمصادقة

**حساب الأعمال الجديد:** Facebook Business Account  
**الصفحة:** Bulgarian Car Marketplace (ID: 100080260449528)  
**الهدف:** ربط Firebase Authentication بحساب الأعمال

---

## 📋 المعلومات الموجودة حالياً:

```
✅ Facebook Page ID: 100080260449528
✅ Facebook Page URL: https://www.facebook.com/people/Bulgarian-Car-Marketplace/100080260449528/
✅ Project Firebase: studio-448742006-a3493

❌ مطلوب الآن:
   - Facebook App ID (من Business Account)
   - Facebook App Secret (من Business Account)
```

---

## 🚀 الخطوات لحساب الأعمال (Facebook Business):

### الخطوة 1: افتح Facebook Business Manager

**افتح:**
```
https://business.facebook.com/settings/
```

**أو:**
```
https://business.facebook.com/latest/home
```

---

### الخطوة 2: اذهب لـ Business Settings

**في القائمة اليسرى، اضغط:**
```
⚙️ Business Settings
```

---

### الخطوة 3: اذهب لـ Apps

**في Business Settings → اضغط:**
```
Users > System Users
أو
Apps > Business Apps
```

---

### الخطوة 4: انشئ App أو اختر الموجود

#### إذا كان لديك App:
```
1. ستجد قائمة بالـ Apps
2. اختر App المرتبط بـ Bulgarian Car Marketplace
3. اضغط عليه
```

#### إذا لم يكن لديك App:
```
1. اضغط "Add" أو "Create App"
2. اختر "For Everything Else" أو "Business"
3. App Name: Bulgarian Car Marketplace
4. Contact Email: alaa.hamdani@yahoo.com
5. Select Business Account: [اختر حسابك]
6. Create App
```

---

### الخطوة 5: احصل على App ID

**بعد دخول Dashboard:**

**في الأعلى:**
```
┌────────────────────────────────────┐
│ Bulgarian Car Marketplace          │
│ App ID: 1234567890123456  ← هنا!  │
└────────────────────────────────────┘
```

**انسخ الرقم كاملاً**

---

### الخطوة 6: احصل على App Secret

**اذهب لـ:**
```
Settings > Basic (من القائمة اليسرى)
```

**ستجد:**
```
App Secret
••••••••••••••  [Show] ← اضغط Show
```

**اضغط Show:**
```
سيطلب Facebook Password
أدخل password حسابك في Facebook
```

**بعد الإدخال:**
```
App Secret
5e2b8c9f4a3d1e6b7c8d9e0f1a2b3c4d ← انسخ هذا!
```

---

## ✅ الآن في Firebase Console:

**افتح:**
```
https://console.firebase.google.com/u/0/project/studio-448742006-a3493/authentication/providers
```

**ابحث عن Facebook → اضغط عليه**

**املأ:**

### App ID:
```
[الصق App ID من Facebook Business]
مثال: 1234567890123456
```

### App secret:
```
[الصق App Secret من Facebook Business]
مثال: 5e2b8c9f4a3d1e6b7c8d9e0f1a2b3c4d
```

**اضغط:** `Save`

---

## 🔗 الخطوة 7: أضف OAuth Redirect URI في Facebook

**Firebase سيعطيك هذا URI:**
```
https://studio-448742006-a3493.firebaseapp.com/__/auth/handler
```

**انسخه!**

---

**ارجع لـ Facebook App:**
```
https://developers.facebook.com/apps/YOUR_APP_ID/fb-login/settings/
```

**إذا لم تجد "Facebook Login":**
```
1. اذهب لـ Dashboard
2. اضغط "Add Product"
3. ابحث عن "Facebook Login"
4. اضغط "Set Up"
5. اختر "Web"
```

**الآن في Facebook Login > Settings:**

**في "Valid OAuth Redirect URIs":**
```
أضف هذه URIs:

https://studio-448742006-a3493.firebaseapp.com/__/auth/handler
https://studio-448742006-a3493.web.app/__/auth/handler
https://globul.net/__/auth/handler
http://localhost:3000/__/auth/handler
```

**اضغط:** `Save Changes`

---

## 🎯 لحساب الأعمال (Facebook Business) تحديداً:

### مصادر App ID و Secret في Business Account:

#### الطريقة 1: من Business Settings
```
1. https://business.facebook.com/settings/
2. Apps > Business Apps
3. اختر App
4. انسخ App ID
5. اذهب لـ Settings > Basic
6. احصل على App Secret
```

#### الطريقة 2: من Developers Console
```
1. https://developers.facebook.com/apps
2. اختر App المرتبط بـ Business Account
3. Settings > Basic
4. App ID و App Secret موجودان هنا
```

---

## 📝 معلومات إضافية لـ Business Account:

### إذا كان عندك Facebook Business Manager:

**افتح Business Manager:**
```
https://business.facebook.com/
```

**للحصول على:**

#### 1. Facebook Page Access Token:
```
Business Settings > Users > System Users
→ Create System User
→ Add Assets (اختر Page الخاص بك)
→ Generate Token
→ انسخ Token
```

#### 2. Ad Account ID:
```
Business Settings > Accounts > Ad Accounts
→ ستجد قائمة بـ Ad Accounts
→ Account ID: act_1234567890
→ انسخه
```

#### 3. Business ID:
```
Business Settings > Business Info
→ Business ID: 1234567890123456
```

---

## 🔐 ما تحتاجه الآن (فقط هذين):

### للصق في Firebase Console:

```
1. App ID: ________________
   (احصل عليه من: https://developers.facebook.com/apps)

2. App Secret: ________________
   (في نفس الصفحة، اضغط Settings > Basic > Show)
```

---

## ⚡ الخطوات السريعة:

```
1. افتح: https://developers.facebook.com/apps
   
2. إذا رأيت App:
   → اضغط عليه
   → Settings > Basic
   → انسخ App ID
   → اضغط Show في App Secret
   → انسخ App Secret
   
3. إذا لم تر أي App:
   → اضغط Create App
   → اختر "Business"
   → أنشئ App جديد
   → احصل على App ID و Secret

4. الصق في Firebase Console
   
5. انسخ OAuth URI من Firebase

6. ارجع لـ Facebook App
   → Facebook Login > Settings
   → أضف OAuth URI
   
7. Done! ✅
```

---

## 🔗 الروابط المباشرة:

### للحصول على App ID و Secret:
```
https://developers.facebook.com/apps
```

### Business Manager (إذا كنت تستخدمه):
```
https://business.facebook.com/settings/apps
```

### صفحتك على Facebook:
```
https://www.facebook.com/people/Bulgarian-Car-Marketplace/100080260449528/
```

---

## 💡 نصيحة:

**إذا كنت محتار:**

**افتح هذا الرابط الآن:**
```
https://developers.facebook.com/apps
```

**وأخبرني ماذا ترى:**
- إذا رأيت قائمة Apps → أخبرني بأسماء Apps
- إذا رأيت صفحة فارغة → سأساعدك في إنشاء App
- إذا رأيت رسالة → أخبرني بها

**🔵 ماذا ترى عند فتح الرابط؟**
