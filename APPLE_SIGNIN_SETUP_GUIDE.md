# 🍎 دليل إعداد Apple Sign-In - خطوة بخطوة

## Bulgarian Car Marketplace

---

## 📋 المتطلبات:

### **قبل البدء:**
```
✓ حساب Apple Developer Program (تكلفة: $99 USD سنوياً)
✓ الوصول إلى Firebase Console
✓ domain name (globul.net)
✓ 30-45 دقيقة من الوقت
```

### **الأدوات المطلوبة:**
```
✓ متصفح (Chrome, Safari, Firefox)
✓ محرر نصوص (لتحرير .p8 file)
✓ صلاحيات إدارية على Firebase Project
```

---

## 🎯 الخطوات:

### **المرحلة 1: التسجيل في Apple Developer Program**

#### **الخطوة 1.1: التسجيل**
```
1. اذهب إلى: https://developer.apple.com/programs/enroll/
2. اضغط "Start Your Enrollment"
3. سجل دخول بـ Apple ID الخاص بك
4. اختر نوع الحساب:
   → Individual (شخصي)
   → Organization (شركة - يحتاج D-U-N-S Number)
5. أدخل معلوماتك الشخصية/معلومات الشركة
6. ادفع رسوم التسجيل: $99 USD
7. انتظر الموافقة (عادة 24-48 ساعة)
```

#### **الخطوة 1.2: التأكد من التفعيل**
```
1. افتح: https://developer.apple.com/account
2. يجب أن ترى "Membership" نشط
3. يجب أن ترى "Team ID" في الأعلى (احفظه!)
   مثال: A1B2C3D4E5
```

---

### **المرحلة 2: إنشاء App ID**

#### **الخطوة 2.1: الذهاب إلى Identifiers**
```
1. افتح: https://developer.apple.com/account/resources/identifiers/list
2. اضغط على زر "+" الأزرق (أعلى اليسار)
```

#### **الخطوة 2.2: اختيار App IDs**
```
1. اختر "App IDs"
2. اضغط "Continue"
```

#### **الخطوة 2.3: اختيار Type**
```
1. اختر "App" (الافتراضي)
2. اضغط "Continue"
```

#### **الخطوة 2.4: إدخال بيانات App ID**
```
┌─────────────────────────────────────────────────────┐
│ Description:                                        │
│ Bulgarian Car Marketplace                           │
├─────────────────────────────────────────────────────┤
│ Bundle ID:                                          │
│ ○ Explicit                                          │
│ com.globul.bulgariancarmarketplace                  │
│                                                     │
│ (أو استخدم domain معكوس: net.globul.marketplace)  │
└─────────────────────────────────────────────────────┘
```

#### **الخطوة 2.5: تفعيل Sign In with Apple**
```
1. ابحث في قائمة Capabilities عن "Sign In with Apple"
2. ضع علامة ✓ بجانبها
3. اضغط "Continue"
4. راجع البيانات
5. اضغط "Register"
6. ✅ تم! App ID جاهز
```

---

### **المرحلة 3: إنشاء Services ID (Web Configuration)**

#### **الخطوة 3.1: الذهاب إلى Services IDs**
```
1. افتح: https://developer.apple.com/account/resources/identifiers/list/serviceId
2. اضغط على زر "+" الأزرق
```

#### **الخطوة 3.2: اختيار Services IDs**
```
1. اختر "Services IDs"
2. اضغط "Continue"
```

#### **الخطوة 3.3: إدخال بيانات Services ID**
```
┌─────────────────────────────────────────────────────┐
│ Description:                                        │
│ Bulgarian Car Marketplace Web                       │
├─────────────────────────────────────────────────────┤
│ Identifier:                                         │
│ com.globul.bulgariancarmarketplace.web              │
│                                                     │
│ (يجب أن يكون مختلف عن App ID!)                    │
└─────────────────────────────────────────────────────┘
```

#### **الخطوة 3.4: تفعيل Sign In with Apple**
```
1. ضع علامة ✓ بجانب "Sign In with Apple"
2. اضغط "Configure" (زر أزرق بجانب Sign In with Apple)
```

#### **الخطوة 3.5: إعداد Domains and URLs**
```
┌─────────────────────────────────────────────────────┐
│ Primary App ID:                                     │
│ → اختر: com.globul.bulgariancarmarketplace          │
│   (الـ App ID من المرحلة 2)                        │
├─────────────────────────────────────────────────────┤
│ Domains and Subdomains:                             │
│ [+] globul.net                                      │
│ [+] studio-448742006-a3493.firebaseapp.com          │
│ [+] studio-448742006-a3493.web.app                  │
│                                                     │
│ (اضغط "+" لإضافة كل domain)                        │
├─────────────────────────────────────────────────────┤
│ Return URLs:                                        │
│ [+] https://studio-448742006-a3493.firebaseapp.com/__/auth/handler │
│ [+] https://studio-448742006-a3493.web.app/__/auth/handler        │
│ [+] https://globul.net/__/auth/handler              │
│                                                     │
│ (اضغط "+" لإضافة كل URL)                           │
│                                                     │
│ ⚠️ يجب أن تبدأ بـ https://                         │
│ ⚠️ يجب أن تنتهي بـ /__/auth/handler                │
└─────────────────────────────────────────────────────┘
```

#### **الخطوة 3.6: حفظ الإعدادات**
```
1. اضغط "Save" في نافذة Web Authentication Configuration
2. اضغط "Continue"
3. راجع البيانات
4. اضغط "Register"
5. ✅ تم! Services ID جاهز
```

#### **✅ Checkpoint 1:**
```
يجب أن يكون لديك الآن:
✓ App ID: com.globul.bulgariancarmarketplace
✓ Services ID: com.globul.bulgariancarmarketplace.web
✓ Sign In with Apple enabled على كلاهما
✓ 3 Return URLs configured
```

---

### **المرحلة 4: إنشاء Private Key (.p8)**

#### **الخطوة 4.1: الذهاب إلى Keys**
```
1. افتح: https://developer.apple.com/account/resources/authkeys/list
2. اضغط على زر "+" الأزرق
```

#### **الخطوة 4.2: تسمية المفتاح**
```
┌─────────────────────────────────────────────────────┐
│ Key Name:                                           │
│ Bulgarian Car Marketplace Sign In Key               │
└─────────────────────────────────────────────────────┘
```

#### **الخطوة 4.3: تفعيل Sign In with Apple**
```
1. ضع علامة ✓ بجانب "Sign In with Apple"
2. اضغط "Configure"
```

#### **الخطوة 4.4: اختيار Primary App ID**
```
┌─────────────────────────────────────────────────────┐
│ Primary App ID:                                     │
│ → اختر: com.globul.bulgariancarmarketplace          │
└─────────────────────────────────────────────────────┘

اضغط "Save"
```

#### **الخطوة 4.5: تسجيل المفتاح**
```
1. اضغط "Continue"
2. راجع البيانات
3. اضغط "Register"
```

#### **الخطوة 4.6: تنزيل المفتاح**
```
🚨 هذه الخطوة مهمة جداً - تنزيل مرة واحدة فقط!

1. بعد الضغط على "Register" ستظهر صفحة تأكيد
2. سترى:
   ┌──────────────────────────────────────────┐
   │ Key ID: ABC123DEF4                       │
   │ (احفظ هذا!)                             │
   └──────────────────────────────────────────┘
3. اضغط "Download" لتنزيل ملف .p8
4. الملف سيكون بصيغة: AuthKey_ABC123DEF4.p8
5. احفظه في مكان آمن!
6. ⚠️ لا يمكن تنزيله مرة أخرى!

إذا فقدت الملف:
→ ستحتاج لحذف المفتاح وإنشاء مفتاح جديد
```

#### **✅ Checkpoint 2:**
```
يجب أن يكون لديك الآن:
✓ Key ID (مثل: ABC123DEF4)
✓ ملف .p8 (AuthKey_ABC123DEF4.p8)
✓ Team ID (من الصفحة الرئيسية لـ Apple Developer)
✓ Services ID (com.globul.bulgariancarmarketplace.web)
```

---

### **المرحلة 5: إعداد Firebase Console**

#### **الخطوة 5.1: فتح Firebase Authentication**
```
1. افتح: https://console.firebase.google.com
2. اختر مشروعك: studio-448742006-a3493
3. اذهب إلى: Authentication > Sign-in method
4. ابحث عن "Apple" في قائمة Providers
5. اضغط على "Apple" (يجب أن يكون Enabled بالفعل)
```

#### **الخطوة 5.2: إدخال Services ID**
```
┌─────────────────────────────────────────────────────┐
│ OAuth code flow configuration (optional):           │
│                                                     │
│ Services ID:                                        │
│ com.globul.bulgariancarmarketplace.web              │
│                                                     │
│ (هذا من المرحلة 3)                                 │
└─────────────────────────────────────────────────────┘
```

#### **الخطوة 5.3: فتح Firebase Project Settings**
```
1. في Firebase Console، اضغط على ⚙️ (Settings)
2. اختر "Project settings"
3. اذهب إلى تبويب "Service accounts"
4. ابحث عن قسم "Apple provider configuration"
```

#### **الخطوة 5.4: إدخال Apple Team ID**
```
┌─────────────────────────────────────────────────────┐
│ Apple Team ID:                                      │
│ A1B2C3D4E5                                          │
│                                                     │
│ (Team ID من صفحة Apple Developer Account)          │
└─────────────────────────────────────────────────────┘
```

#### **الخطوة 5.5: إدخال Key ID**
```
┌─────────────────────────────────────────────────────┐
│ Key ID:                                             │
│ ABC123DEF4                                          │
│                                                     │
│ (من المرحلة 4)                                     │
└─────────────────────────────────────────────────────┘
```

#### **الخطوة 5.6: إدخال Private Key**
```
1. افتح ملف .p8 بمحرر نصوص (Notepad, TextEdit, VS Code)
2. انسخ **كامل** محتوى الملف، بما في ذلك:
   -----BEGIN PRIVATE KEY-----
   [محتوى المفتاح]
   -----END PRIVATE KEY-----
3. الصق في حقل "Private key" في Firebase

┌─────────────────────────────────────────────────────┐
│ Private key:                                        │
│ -----BEGIN PRIVATE KEY-----                         │
│ MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIB...    │
│ [عدة أسطر من النص المشفر]                         │
│ -----END PRIVATE KEY-----                           │
└─────────────────────────────────────────────────────┘

⚠️ تأكد من نسخ كل شيء من BEGIN إلى END!
```

#### **الخطوة 5.7: حفظ الإعدادات**
```
1. راجع جميع البيانات:
   ✓ Services ID
   ✓ Team ID
   ✓ Key ID
   ✓ Private Key
2. اضغط "Save" في Firebase Console
3. ✅ تم! Firebase مُعدّ الآن!
```

---

### **المرحلة 6: الاختبار**

#### **الخطوة 6.1: اختبار محلي (localhost)**
```
⚠️ Apple Sign-In لا يعمل على localhost بشكل طبيعي!

سبب: Apple يتطلب HTTPS و domain صالح.

الحل:
→ اختبر على Firebase Hosting أو على globul.net مباشرة
```

#### **الخطوة 6.2: اختبار على Firebase Hosting**
```
1. انشر المشروع على Firebase:
   firebase deploy --only hosting

2. افتح:
   https://studio-448742006-a3493.web.app/login

3. اضغط على زر "Continue with Apple"
```

#### **الخطوة 6.3: اختبار على globul.net**
```
1. افتح: https://globul.net/login
2. اضغط على زر "Continue with Apple"
3. سيتم توجيهك إلى صفحة تسجيل دخول Apple
```

#### **الخطوة 6.4: تسجيل دخول بـ Apple ID**
```
1. أدخل Apple ID (email)
2. أدخل Password
3. إذا كان 2FA مُفعّل، أدخل الرمز
4. ستظهر صفحة "Sign in to Bulgarian Car Marketplace"
```

#### **الخطوة 6.5: اختيار بيانات المشاركة**
```
Apple سيطلب منك اختيار:

┌─────────────────────────────────────────────────────┐
│ Share My Email                                      │
│ ○ Share My Email (example@icloud.com)              │
│ ○ Hide My Email (random@privaterelay.appleid.com)  │
│                                                     │
│ Share My Name                                       │
│ [✓] First Name: Alaa                                │
│ [✓] Last Name: Hamadani                             │
│                                                     │
│ [Continue]                                          │
└─────────────────────────────────────────────────────┘

⚠️ مهم:
- إذا اخترت "Hide My Email"، ستحصل على email وهمي
- يمكن تغيير الاسم قبل المتابعة
- البيانات ستُرسل لمرة واحدة فقط (أول تسجيل)
```

#### **الخطوة 6.6: إنهاء التسجيل**
```
1. اضغط "Continue"
2. ستتم إعادة توجيهك إلى:
   https://globul.net (أو firebase hosting URL)
3. يجب أن تكون مسجل دخول الآن!
```

#### **الخطوة 6.7: التحقق من Firestore**
```
1. افتح Firebase Console
2. اذهب إلى Firestore Database
3. افتح collection "users"
4. يجب أن ترى مستخدم جديد بـ:
   ┌──────────────────────────────────────────┐
   │ uid: "apple_user_uid"                    │
   │ email: "user@icloud.com" أو private      │
   │ displayName: "Alaa Hamadani"             │
   │ providers: ["apple.com"]                 │
   │ emailVerified: true                      │
   │ createdAt: [Timestamp]                   │
   └──────────────────────────────────────────┘
```

#### **الخطوة 6.8: التحقق من Super Admin**
```
1. افتح: https://globul.net/super-admin
2. سجل دخول كـ Super Admin
3. اذهب إلى "Advanced User Management"
4. يجب أن ترى المستخدم الجديد مع:
   - Badge "Apple"
   - Avatar (إن وُجد)
   - Email (أو private relay)
```

---

## 🐛 استكشاف الأخطاء:

### **خطأ 1: "Invalid Client"**
```
السبب: Services ID غير صحيح

الحل:
1. تأكد أن Services ID في Firebase يطابق Services ID في Apple Developer Console
2. يجب أن يكون: com.globul.bulgariancarmarketplace.web
3. تأكد من عدم وجود مسافات أو أخطاء إملائية
```

### **خطأ 2: "Invalid Redirect URI"**
```
السبب: Return URL غير مُضاف في Apple Developer Console

الحل:
1. افتح Services ID في Apple Developer Console
2. اضغط "Edit"
3. اضغط "Configure" بجانب Sign In with Apple
4. تأكد أن Return URLs تحتوي على:
   https://studio-448742006-a3493.firebaseapp.com/__/auth/handler
   https://globul.net/__/auth/handler
5. اضغط "Save"
```

### **خطأ 3: "Invalid Key"**
```
السبب: Private Key غير صحيح أو غير مكتمل

الحل:
1. تأكد من نسخ كامل محتوى .p8 file
2. يجب أن يبدأ بـ: -----BEGIN PRIVATE KEY-----
3. يجب أن ينتهي بـ: -----END PRIVATE KEY-----
4. لا تضف أو تحذف أي أحرف
5. إذا لم ينجح، أنشئ Private Key جديد
```

### **خطأ 4: "Invalid Team ID"**
```
السبب: Team ID غير صحيح

الحل:
1. افتح: https://developer.apple.com/account
2. Team ID موجود في الأعلى (عادة 10 أحرف)
3. مثال: A1B2C3D4E5
4. انسخه بدون مسافات
5. الصقه في Firebase Console
```

### **خطأ 5: "Authentication Failed"**
```
السبب: قد يكون من عدة أسباب

الحل:
1. تحقق من Console في المتصفح (F12)
2. ابحث عن رسالة الخطأ التفصيلية
3. راجع جميع الإعدادات:
   ✓ Services ID
   ✓ Team ID
   ✓ Key ID
   ✓ Private Key
   ✓ Return URLs
4. تأكد أن Sign In with Apple مُفعّل على App ID و Services ID
```

### **خطأ 6: "Domain Not Verified"**
```
السبب: Domain غير مُضاف في Apple Developer Console

الحل:
1. افتح Services ID في Apple Developer Console
2. اضغط "Edit" ثم "Configure"
3. تأكد أن Domains and Subdomains تحتوي على:
   globul.net
   studio-448742006-a3493.firebaseapp.com
4. اضغط "Save"
5. انتظر 5-10 دقائق للتفعيل
```

---

## 📝 Checklist النهائي:

### **قبل الإطلاق:**
```
☐ Apple Developer Program active ($99 paid)
☐ Team ID copied and saved
☐ App ID created with Sign In with Apple enabled
☐ Services ID created with:
  ☐ Sign In with Apple enabled
  ☐ 3 Domains added
  ☐ 3 Return URLs added
☐ Private Key (.p8) created and downloaded
☐ Key ID copied and saved
☐ Firebase Console configured with:
  ☐ Services ID
  ☐ Team ID
  ☐ Key ID
  ☐ Private Key content
☐ Code deployed to Firebase Hosting
☐ Tested on https://globul.net/login
☐ User appears in Firestore
☐ User appears in Super Admin dashboard
```

---

## 🎯 ملخص سريع:

### **البيانات المطلوبة:**

```
┌────────────────────┬──────────────────────────────────────┐
│ Item               │ Example / Location                   │
├────────────────────┼──────────────────────────────────────┤
│ Team ID            │ A1B2C3D4E5 (من Account homepage)    │
│ App ID             │ com.globul.bulgariancarmarketplace   │
│ Services ID        │ com.globul.bulgariancarmarketplace.web │
│ Key ID             │ ABC123DEF4 (من Keys page)            │
│ Private Key (.p8)  │ AuthKey_ABC123DEF4.p8 (downloaded)   │
└────────────────────┴──────────────────────────────────────┘
```

### **الوقت المتوقع:**

```
Apple Developer Enrollment:     24-48 hours (approval)
Setup (بعد الموافقة):             30-45 minutes
Testing:                         10-15 minutes
───────────────────────────────────────────────────
Total:                           1-3 days
```

### **التكلفة:**

```
Apple Developer Program:  $99 USD/year
Firebase (Blaze Plan):    $0 (within free tier)
Domain (globul.net):      Already owned
───────────────────────────────────────────────────
Total New Cost:           $99 USD/year
```

---

## 🎉 بعد الإكمال:

### **ما سيعمل:**

```
✅ تسجيل دخول بـ Apple على Safari (Desktop & Mobile)
✅ تسجيل دخول بـ Apple على iOS devices (native experience)
✅ تسجيل دخول بـ Apple على iPadOS
✅ "Hide My Email" feature
✅ Auto-sync to Firestore
✅ Appearance in Super Admin Dashboard
✅ Full authentication flow with Email/Password, Google, Facebook, Apple
```

### **النتيجة النهائية:**

```
┌───────────────────────────────────────────────┐
│                                               │
│  🎯 4/4 Authentication Providers Working!    │
│                                               │
│  ✅ Email/Password                            │
│  ✅ Google Sign-In                            │
│  ✅ Facebook Sign-In                          │
│  ✅ Apple Sign-In                             │
│                                               │
│  Status: 100% Complete! 🎉                   │
│                                               │
└───────────────────────────────────────────────┘
```

---

## 📞 الدعم:

### **Apple Developer Support:**
```
URL: https://developer.apple.com/support/
Phone: Varies by region
Email: developer.apple.com/contact
```

### **Firebase Support:**
```
URL: https://firebase.google.com/support
Docs: https://firebase.google.com/docs/auth/web/apple
Community: https://stackoverflow.com/questions/tagged/firebase-authentication
```

### **Project Support:**
```
Developer: Alaa Al Hamadani
Email: alaa.hamdani@yahoo.com
Project: Bulgarian Car Marketplace
Domain: https://globul.net
```

---

**✅ دليل إعداد Apple Sign-In مكتمل!**

**📅 التاريخ: 10 أكتوبر 2025**

**🍎 استمتع بتسجيل الدخول بـ Apple!**

