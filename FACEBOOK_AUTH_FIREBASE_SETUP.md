# 🔵 إعداد Facebook Authentication في Firebase - دليل شامل

**التاريخ:** 10 أكتوبر 2025  
**الهدف:** تفعيل Facebook Login في Bulgarian Car Marketplace  
**الوقت المطلوب:** 15-20 دقيقة

---

## 📋 الخطوات الكاملة:

---

## الجزء الأول: إنشاء Facebook App

### الخطوة 1: اذهب لـ Facebook Developers

**افتح:**
```
https://developers.facebook.com/apps
```

### الخطوة 2: انشئ App جديد (إذا لم يكن موجود)

**اضغط:** `Create App`

**اختر:**
- Type: `Consumer` (للمستخدمين العاديين)
- App Name: `Bulgarian Car Marketplace`
- App Contact Email: `alaa.hamdani@yahoo.com`

**اضغط:** `Create App`

---

### الخطوة 3: احصل على App ID و App Secret

**في Dashboard → Settings → Basic:**

```
App ID: 
مثال: 1234567890123456

App Secret:
[اضغط Show] → سيظهر السر
مثال: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

⚠️ احفظهما! ستحتاجهما في الخطوة التالية
```

---

### الخطوة 4: أضف Facebook Login Product

**في Dashboard → Add Product:**

1. ابحث عن **"Facebook Login"**
2. اضغط **"Set Up"**
3. اختر **"Web"** (للموقع)

---

### الخطوة 5: أضف Valid OAuth Redirect URIs

**في Facebook Login → Settings:**

**أضف هذه URIs:**

```
Development:
http://localhost:3000
http://localhost:3000/__/auth/handler

Production:
https://studio-448742006-a3493.firebaseapp.com
https://studio-448742006-a3493.firebaseapp.com/__/auth/handler
https://studio-448742006-a3493.web.app
https://studio-448742006-a3493.web.app/__/auth/handler
https://globul.net
https://globul.net/__/auth/handler
```

**اضغط:** `Save Changes`

---

## الجزء الثاني: إعداد Firebase Console

### الخطوة 6: افتح Firebase Authentication

**افتح:**
```
https://console.firebase.google.com/u/0/project/studio-448742006-a3493/authentication/providers
```

### الخطوة 7: فعّل Facebook Provider

**في Sign-in providers:**

1. ابحث عن **"Facebook"**
2. اضغط عليه
3. سيفتح نافذة **"Configure provider"**

---

### الخطوة 8: املأ البيانات في Firebase

**في Configure provider (Step 2 of 2):**

#### 1. App ID:
```
الصق App ID من Facebook Developers
مثال: 1234567890123456
```

#### 2. App secret:
```
الصق App Secret من Facebook Developers
مثال: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

#### 3. OAuth redirect URI:
```
انسخ هذا URI:
https://studio-448742006-a3493.firebaseapp.com/__/auth/handler

⚠️ مهم! ستحتاجه في الخطوة التالية
```

**اضغط:** `Save`

---

### الخطوة 9: ارجع لـ Facebook Developers

**افتح:**
```
https://developers.facebook.com/apps/YOUR_APP_ID/fb-login/settings/
```

**في Valid OAuth Redirect URIs:**

**أضف:**
```
https://studio-448742006-a3493.firebaseapp.com/__/auth/handler
```

*(نفس الـ URI من Firebase)*

**اضغط:** `Save Changes`

---

## الجزء الثالث: تفعيل Facebook App

### الخطوة 10: اجعل App Live

**في Facebook App Dashboard → App Review:**

1. اضغط **"Request Advanced Access"** للـ:
   - `email`
   - `public_profile`

2. اذهب لـ **Settings → Basic**

3. في أعلى الصفحة، غيّر:
   ```
   Mode: Development → Live
   ```

4. اضغط **"Switch Mode"**

---

## الجزء الرابع: إعداد Project (Environment Variables)

### الخطوة 11: أنشئ ملف .env

**في Terminal:**
```bash
cd "C:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace"
```

**أنشئ ملف `.env`:**
```bash
New-Item -Path .env -ItemType File
```

### الخطوة 12: املأ .env بالبيانات

**افتح `.env` وأضف:**

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=AIzaSyDWI_Cg5oN5mRa1TYEVlNcm9lj-TljNFow
REACT_APP_FIREBASE_AUTH_DOMAIN=studio-448742006-a3493.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=studio-448742006-a3493
REACT_APP_FIREBASE_STORAGE_BUCKET=studio-448742006-a3493.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=448742006
REACT_APP_FIREBASE_APP_ID=1:448742006:web:29740a9e5de8c4bcb42c72
REACT_APP_FIREBASE_MEASUREMENT_ID=G-R65R0TRY8W

# Facebook Configuration
REACT_APP_FACEBOOK_APP_ID=YOUR_FACEBOOK_APP_ID_HERE
REACT_APP_FACEBOOK_APP_SECRET=YOUR_FACEBOOK_APP_SECRET_HERE
REACT_APP_FACEBOOK_PAGE_ID=100080260449528
REACT_APP_FACEBOOK_PIXEL_ID=YOUR_PIXEL_ID_HERE
REACT_APP_FACEBOOK_ACCESS_TOKEN=YOUR_ACCESS_TOKEN_HERE
REACT_APP_FACEBOOK_PAGE_ACCESS_TOKEN=YOUR_PAGE_TOKEN_HERE

# Base URL
REACT_APP_BASE_URL=https://globul.net

# Environment
NODE_ENV=development
```

**استبدل:**
- `YOUR_FACEBOOK_APP_ID_HERE` → App ID من الخطوة 3
- `YOUR_FACEBOOK_APP_SECRET_HERE` → App Secret من الخطوة 3

---

## ✅ التحقق من الإعدادات:

### في Firebase Console:

**افتح:**
```
https://console.firebase.google.com/u/0/project/studio-448742006-a3493/authentication/providers
```

**يجب أن ترى:**
```
Facebook
Status: ✅ Enabled
App ID: [Your App ID]
App Secret: ••••••••
```

---

### في Facebook Developers:

**افتح:**
```
https://developers.facebook.com/apps/YOUR_APP_ID/settings/basic/
```

**تحقق من:**
```
✅ App ID موجود
✅ App Secret موجود
✅ App Domains تحتوي على: globul.net
✅ App Mode: Live (ليس Development)
```

---

## 🧪 اختبار Facebook Login:

### الخطوة 13: أعد تشغيل Development Server

```bash
cd bulgarian-car-marketplace
npm start
```

### الخطوة 14: اختبر Login

**افتح:**
```
http://localhost:3000/login
```

**يجب أن ترى:**
```
زر "Continue with Facebook" 🔵
```

**اضغط عليه:**
```
سيفتح نافذة Facebook
سجل دخول بحسابك
اسمح بالأذونات
سيعيد توجيهك للموقع ✅
```

---

## 📝 الحقول المطلوبة في Firebase Console:

### ما تكتبه بالضبط:

```
┌─────────────────────────────────────────────┐
│ Configure provider (Step 2 of 2) - Facebook │
├─────────────────────────────────────────────┤
│                                              │
│ App ID:                                      │
│ ┌─────────────────────────────────────────┐ │
│ │ [الصق App ID من Facebook هنا]          │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ App secret:                                  │
│ ┌─────────────────────────────────────────┐ │
│ │ [الصق App Secret من Facebook هنا]      │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ OAuth redirect URI:                          │
│ https://studio-448742006-a3493...handler    │
│ (copy this and add to Facebook app)          │
│                                              │
│ [Cancel]                        [Save]       │
└─────────────────────────────────────────────┘
```

---

## 🔍 كيف تحصل على البيانات:

### Facebook App ID:

**1. اذهب لـ:**
```
https://developers.facebook.com/apps
```

**2. اختر App الخاص بك (أو انشئ واحد جديد)**

**3. في Dashboard → Settings → Basic:**
```
App ID: [هنا يظهر الرقم]
مثال: 1234567890123456
```

**4. انسخه والصقه في Firebase**

---

### Facebook App Secret:

**1. في نفس الصفحة (Settings → Basic):**
```
App Secret: [••••••••]
```

**2. اضغط:** `Show`

**3. أدخل Facebook password للتأكيد**

**4. انسخ السر:**
```
مثال: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**5. الصقه في Firebase**

---

## 📱 Facebook App Settings (المطلوبة):

### في Facebook Developers Console:

#### App Domains:
```
globul.net
studio-448742006-a3493.web.app
studio-448742006-a3493.firebaseapp.com
localhost
```

#### Privacy Policy URL:
```
https://globul.net/privacy-policy
```

#### Terms of Service URL:
```
https://globul.net/terms-of-service
```

#### Data Deletion Instructions URL:
```
https://globul.net/data-deletion
```

---

## ⚠️ Troubleshooting:

### Problem 1: "App ID is invalid"
```
Solution:
- تأكد من نسخ App ID بالكامل (16 رقم عادة)
- لا توجد مسافات قبل أو بعد الرقم
- تحقق من أن App موجود ولم يُحذف
```

### Problem 2: "App Secret is invalid"
```
Solution:
- اضغط "Show" في Facebook لرؤية السر
- انسخه بالكامل (32 حرف عادة)
- لا توجد مسافات
```

### Problem 3: "Redirect URI mismatch"
```
Solution:
- تأكد من إضافة URI في Facebook Login Settings
- يجب أن يطابق تماماً:
  https://studio-448742006-a3493.firebaseapp.com/__/auth/handler
```

---

## 🎯 الخطوات المختصرة (Quick Guide):

```
1. Facebook Developers → Create App
   ↓
2. Get App ID & App Secret
   ↓
3. Facebook Login → Add Product
   ↓
4. Settings → Add Redirect URIs
   ↓
5. Firebase Console → Authentication → Facebook
   ↓
6. Paste App ID & App Secret
   ↓
7. Copy OAuth redirect URI → Back to Facebook
   ↓
8. App Review → Make App Live
   ↓
9. Test Login → Done! ✅
```

---

## 📊 القيم التي تحتاجها:

### للصق في Firebase Console:

```
App ID: _____________________ (16 رقم)

App Secret: _____________________ (32 حرف)
```

### للصق في Facebook Developers:

```
OAuth Redirect URI:
https://studio-448742006-a3493.firebaseapp.com/__/auth/handler
```

---

## 🔗 الروابط المباشرة:

### Firebase Authentication Setup:
```
https://console.firebase.google.com/u/0/project/studio-448742006-a3493/authentication/providers
```

### Facebook Developers Console:
```
https://developers.facebook.com/apps
```

### Facebook App Settings (بعد الإنشاء):
```
https://developers.facebook.com/apps/YOUR_APP_ID/settings/basic/
```

### Facebook Login Settings:
```
https://developers.facebook.com/apps/YOUR_APP_ID/fb-login/settings/
```

---

## ✅ Checklist للنجاح:

```
في Facebook Developers:
☐ App created
☐ App ID copied
☐ App Secret copied
☐ Facebook Login product added
☐ OAuth redirect URIs added
☐ App mode = Live
☐ Permissions requested (email, public_profile)

في Firebase Console:
☐ Facebook provider enabled
☐ App ID pasted
☐ App Secret pasted
☐ Configuration saved

في Project:
☐ .env file created
☐ REACT_APP_FACEBOOK_APP_ID set
☐ Development server restarted

Testing:
☐ Facebook login button appears
☐ Click opens Facebook auth window
☐ Login successful
☐ User redirected to dashboard
```

---

## 💡 معلومات إضافية:

### إذا لم يكن لديك Facebook App:

**خيار 1: انشئ App جديد (15 دقيقة)**
- اتبع الخطوات أعلاه

**خيار 2: استخدم Test App (للتطوير)**
- Facebook يسمح بـ Test Apps
- لا تحتاج App Review
- يعمل فقط مع Test Users

**خيار 3: أجل Facebook Auth**
- ركز على Google Auth أولاً
- Facebook Auth اختياري
- يمكن إضافته لاحقاً

---

## 🎓 ملاحظات مهمة:

### App Review:
```
⚠️ Facebook يطلب App Review للإنتاج
⚠️ يحتاج:
   - Privacy Policy URL
   - Terms of Service URL
   - Data Deletion Instructions
   - App Icon & Screenshots
   - Use Case Description

⏱️ الوقت: 1-7 أيام للموافقة
```

### Permissions:
```
Basic (لا تحتاج Review):
✅ public_profile
✅ email

Advanced (تحتاج Review):
⚠️ user_birthday
⚠️ user_location
⚠️ user_photos
```

---

## 🚀 البديل الأسرع (إذا لم يكن عندك Facebook App):

### استخدم Google Authentication فقط:

**Google Auth:**
```
✅ Enabled بالفعل
✅ يعمل بدون مشاكل
✅ لا يحتاج App Review
✅ سريع وموثوق
```

**Facebook Auth:**
```
⏳ يحتاج إعداد
⏳ يحتاج App Review
⏳ اختياري (ليس ضروري)
```

**النصيحة:**
```
استخدم Google Auth الآن ✅
أضف Facebook Auth لاحقاً ⏳
```

---

## 📝 الملخص:

### ما تحتاجه من Facebook:
```
1. Facebook App ID (16 رقم)
2. Facebook App Secret (32 حرف)
3. OAuth Redirect URI configured
```

### ما تكتبه في Firebase:
```
App ID: [paste from Facebook]
App secret: [paste from Facebook]
```

### ما تضيفه في Facebook:
```
OAuth redirect URI:
https://studio-448742006-a3493.firebaseapp.com/__/auth/handler
```

---

## 🎯 الخطوة الأولى الآن:

**افتح:**
```
https://developers.facebook.com/apps
```

**إذا كان لديك App:**
- اذهب لـ Settings → Basic
- انسخ App ID و App Secret
- الصقهما في Firebase Console

**إذا لم يكن لديك App:**
- اضغط "Create App"
- اتبع الخطوات أعلاه
- أو أخبرني لأساعدك!

---

**🔵 جاهز لمساعدتك في أي خطوة!**

**ما هي حالتك الآن؟**
1. عندي Facebook App ID → أعطني إياه وأكمل الإعداد
2. ما عندي App → ساعدني في إنشاء واحد
3. أريد تأجيل Facebook → نستخدم Google فقط

