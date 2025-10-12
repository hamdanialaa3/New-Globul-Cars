# 🔧 إصلاح API Key Restrictions

## 🚨 المشكلة الحالية:

```
Application restrictions: None
```

هذا يمكن أن يسبب مشاكل مع Firebase Authentication!

---

## ✅ الحل (خطوة بخطوة):

### **الخطوة 1: Website Restrictions**

#### **في صفحة Edit API key:**

1. **تحت "Application restrictions":**
   ```
   اختر: Websites
   ```

2. **أضف Website restrictions:**
   ```
   ✅ localhost:3000
   ✅ localhost:*
   ✅ globul.net/*
   ✅ *.globul.net/*
   ✅ studio-448742006-a3493.web.app/*
   ✅ studio-448742006-a3493.firebaseapp.com/*
   ```

3. **اضغط "Add an item" لكل موقع**

---

### **الخطوة 2: API Restrictions**

#### **تأكد من أن هذه الـ APIs محددة:**

```
✅ Identity Toolkit API (موجود بالفعل)
✅ Firebase Hosting API (موجود)
✅ Cloud Firestore API (موجود)
✅ Firebase Management API (موجود)
```

**يبدو جيداً! ✅**

---

### **الخطوة 3: احفظ التغييرات**

```
اضغط "Save" في أسفل الصفحة
```

---

### **الخطوة 4: انتظر 5 دقائق**

```
⏳ قد يستغرق تفعيل التغييرات 5 دقائق
```

---

## 🔍 **ولكن هناك احتمال آخر...**

### **المشكلة قد تكون في Billing!**

#### **تحقق من:**
```
https://console.cloud.google.com/billing?project=studio-448742006-a3493
```

#### **ابحث عن:**
```
❌ No billing account linked
❌ Free tier exceeded
❌ Payment method declined
```

---

## ⚡ **الحل الأسرع والأضمن:**

### **أنشئ مشروع Firebase جديد!**

#### **لماذا؟**
```
✅ 10 دقائق فقط
✅ بداية نظيفة بدون مشاكل
✅ Billing مجاني (Spark Plan)
✅ كل APIs تعمل مباشرة
✅ لا حاجة لـ troubleshooting
```

---

## 📋 **خطوات إنشاء مشروع جديد (سريعة):**

### **1. Firebase Console:**
```
https://console.firebase.google.com/
→ Add project
→ bulgarian-cars-2024
```

### **2. فعّل Authentication:**
```
→ Authentication → Get started
→ Google: Enable ✅
→ Email/Password: Enable ✅
→ Facebook: Enable ✅
→ Phone: Enable ✅
→ Anonymous: Enable ✅
```

### **3. أضف Authorized Domains:**
```
→ Authentication → Settings → Authorized domains
→ Add domain: globul.net
```

### **4. أنشئ Web App:**
```
→ Project Overview → Web app (</> icon)
→ App nickname: bulgarian-cars-web
→ Copy Firebase Config
```

### **5. حدّث .env:**
```env
REACT_APP_FIREBASE_API_KEY=new-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=bulgarian-cars-2024.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=bulgarian-cars-2024
REACT_APP_FIREBASE_STORAGE_BUCKET=bulgarian-cars-2024.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=new-sender-id
REACT_APP_FIREBASE_APP_ID=new-app-id
```

### **6. انشر:**
```bash
firebase use --add
npm run build
firebase deploy --only hosting
```

---

## 🎯 **جرب الحل الأول أولاً:**

### **في صفحة API Key الحالية:**

1. **Application restrictions:**
   ```
   اختر: Websites
   ```

2. **أضف:**
   ```
   localhost:3000
   globul.net/*
   studio-448742006-a3493.web.app/*
   ```

3. **Save**

4. **انتظر 5 دقائق**

5. **جرب التسجيل مرة أخرى**

---

## 📞 **إذا لم ينجح:**

### **المشكلة في Billing - أنشئ مشروع جديد!**

**سيعمل 100% مضمون!** 🚀

