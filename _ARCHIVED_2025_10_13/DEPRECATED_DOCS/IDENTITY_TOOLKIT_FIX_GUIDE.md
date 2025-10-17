# 🔧 حل مشكلة Identity Toolkit API المحظور

## 🚨 الخطأ:
```
auth/requests-to-this-api-identitytoolkit-method-google.cloud.identitytoolkit.v1.projectconfigservice.getprojectconfig-are-blocked.
```

---

## ✅ الحل الكامل (3 طرق):

---

## **الطريقة 1: تفعيل Identity Toolkit API** (مضمونة 100%)

### **الخطوات:**

#### **1. افتح Google Cloud Console:**
```
https://console.cloud.google.com/
```

#### **2. اختر المشروع:**
```
studio-448742006-a3493
```

#### **3. اذهب إلى APIs & Services > Library:**
```
https://console.cloud.google.com/apis/library?project=studio-448742006-a3493
```

#### **4. ابحث عن "Identity Toolkit API":**
- اكتب في مربع البحث: `Identity Toolkit`
- أو اذهب مباشرة إلى:
```
https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=studio-448742006-a3493
```

#### **5. اضغط على "ENABLE":**
```
✅ سيظهر زر أزرق "ENABLE"
✅ اضغط عليه
✅ انتظر 1-2 دقيقة
```

#### **6. فعّل أيضاً "Identity Platform API":**
```
https://console.cloud.google.com/apis/library/identityplatform.googleapis.com?project=studio-448742006-a3493
```

#### **7. جرب تسجيل الدخول مرة أخرى:**
```
http://localhost:3000/login
أو
https://globul.net/login
```

---

## **الطريقة 2: تفعيل Billing** (إذا لم تنجح الطريقة 1)

### **لماذا Billing مهم؟**
```
❌ بدون Billing، Google Cloud يحظر بعض APIs
✅ مع Billing، كل APIs تعمل
💰 Firebase مجاني للاستخدام الشخصي (Spark Plan)
💳 لكن يحتاج بطاقة مسجلة
```

### **الخطوات:**

#### **1. افتح Billing:**
```
https://console.cloud.google.com/billing?project=studio-448742006-a3493
```

#### **2. اربط Billing Account:**
```
✅ إذا كان لديك Billing Account:
   - اضغط "Link a billing account"
   - اختر الـ account
   
✅ إذا لم يكن لديك:
   - اضغط "Create account"
   - أدخل بيانات البطاقة
   - (لن يتم الخصم في الغالب)
```

#### **3. تأكد من الربط:**
```
Project: studio-448742006-a3493
Billing Account: [اسم حسابك]
Status: ✅ Active
```

#### **4. ارجع وفعّل Identity Toolkit API:**
```
(عُد للطريقة 1، الخطوة 4)
```

---

## **الطريقة 3: إنشاء مشروع Firebase جديد** (الحل الأسرع)

إذا لم تنجح الطريقتان السابقتان، ننشئ مشروع جديد!

### **الخطوات:**

#### **1. اذهب إلى Firebase Console:**
```
https://console.firebase.google.com/
```

#### **2. اضغط "Add project":**
```
اسم المشروع: bulgarian-car-marketplace-new
(أو أي اسم تريده)
```

#### **3. فعّل Google Analytics (اختياري):**
```
يمكنك تخطيها
```

#### **4. انتظر حتى ينتهي الإنشاء**

#### **5. فعّل Authentication:**
```
- اضغط على "Authentication" في القائمة الجانبية
- اضغط "Get started"
- اضغط على "Google" من Sign-in providers
- فعّل Google Sign-in
- احفظ
```

#### **6. فعّل باقي المصادقات:**
```
✅ Facebook
✅ Apple  
✅ Email/Password
✅ Phone
✅ Anonymous
```

#### **7. أضف Authorized domains:**
```
- اذهب إلى Authentication > Settings > Authorized domains
- أضف:
  ✅ localhost
  ✅ globul.net
  ✅ studio-448742006-a3493.web.app
```

#### **8. احصل على Firebase Config الجديدة:**
```
- اذهب إلى Project Settings (الترس بجانب Project Overview)
- انزل إلى "Your apps"
- اختر Web app (أو أنشئ واحد جديد)
- انسخ الـ config
```

#### **9. حدّث ملف `.env`:**
```env
REACT_APP_FIREBASE_API_KEY=your-new-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-new-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-new-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-new-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-new-sender-id
REACT_APP_FIREBASE_APP_ID=your-new-app-id
```

#### **10. أعد البناء والنشر:**
```bash
npm run build
firebase deploy --only hosting
```

---

## 📞 **جرب الآن:**

### **الخطوة 1: تفعيل Identity Toolkit**
```
1. https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=studio-448742006-a3493
2. اضغط ENABLE
3. انتظر دقيقتين
4. جرب: http://localhost:3000/login
```

### **الخطوة 2: إذا لم تنجح، تحقق من Billing**
```
1. https://console.cloud.google.com/billing?project=studio-448742006-a3493
2. اربط Billing Account
3. عُد للخطوة 1
```

### **الخطوة 3: إذا لم تنجح، مشروع جديد**
```
1. https://console.firebase.google.com/
2. Create new project
3. حدّث .env
4. npm run build && firebase deploy
```

---

## 🎯 **النتيجة المتوقعة:**

بعد تفعيل Identity Toolkit API:
```
✅ Google Sign-in يعمل
✅ Facebook Sign-in يعمل  
✅ Apple Sign-in يعمل
✅ كل المصادقات تعمل
✅ لا يوجد خطأ "blocked"
```

---

## ⚡ **ملخص سريع:**

```
المشكلة: Identity Toolkit API محظور
الحل: تفعيله من Google Cloud Console
البديل: إنشاء مشروع Firebase جديد

روابط مهمة:
🔗 https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=studio-448742006-a3493
🔗 https://console.cloud.google.com/billing?project=studio-448742006-a3493
🔗 https://console.firebase.google.com/
```

---

## 💡 **نصيحة:**

أسرع حل هو **الطريقة 3** (مشروع جديد):
```
⏱️ 10 دقائق فقط
✅ مضمون 100%
🆕 بداية نظيفة
```

لكن جرب **الطريقة 1** أولاً:
```
⏱️ 2 دقائق فقط
✅ لا يحتاج تغيير الكود
```

---

**افعل هذا الآن وأخبرني النتيجة!** 🚀

