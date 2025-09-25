# 🔧 دليل إعداد Facebook خطوة بخطوة
# Step-by-Step Facebook Setup Guide

## 🎯 **الهدف: ربط Bulgarian Car Marketplace مع Facebook بالكامل**

---

## 📱 **الخطوة 1: إنشاء Facebook App**

### **1.1 الذهاب لموقع Facebook Developers**
```
🌐 اذهب إلى: https://developers.facebook.com/
👤 سجل الدخول بحسابك الشخصي في Facebook
```

### **1.2 إنشاء تطبيق جديد**
```
1. انقر على "My Apps" في الأعلى
2. انقر على "Create App" (إنشاء تطبيق)
3. اختر "Business" من الخيارات
4. انقر على "Next" (التالي)
```

### **1.3 ملء تفاصيل التطبيق**
```
📝 App Display Name: Bulgarian Car Marketplace
📧 App Contact Email: your-email@domain.com  
🏢 Business Use Case: E-commerce / Automotive
✅ انقر على "Create App ID"
```

### **1.4 الحصول على App ID & Secret**
```
📋 بعد إنشاء التطبيق:
   - App ID: ستظهر في الصفحة الرئيسية
   - App Secret: Settings → Basic → App Secret (Show)
   
⚠️ احتفظ بهما في مكان آمن!
```

---

## 📄 **الخطوة 2: ربط صفحة Facebook**

### **2.1 التحقق من الصفحة الحالية**
```
🔗 صفحتك: https://www.facebook.com/profile.php?id=100080260449528
✅ تأكد أنك Admin على هذه الصفحة
📱 تأكد أن الصفحة منشورة وليست Draft
```

### **2.2 الحصول على Page Access Token**
```
1. اذهب إلى: https://developers.facebook.com/tools/explorer/
2. من Graph API Explorer:
   - User or Page: اختر صفحتك
   - Permissions: أضف هذه الصلاحيات:
     • pages_manage_posts
     • pages_read_engagement  
     • pages_messaging
     • pages_manage_metadata
3. انقر على "Generate Access Token"
4. انسخ الـ Token (طويل جداً)
```

### **2.3 تحويل الـ Token لدائم**
```
🌐 اذهب إلى: https://developers.facebook.com/tools/debug/accesstoken/
📝 الصق الـ Page Access Token
✅ انقر على "Debug"
🔄 انقر على "Extend Access Token" إذا ظهر الخيار
```

---

## 🎯 **الخطوة 3: إعداد Facebook Pixel**

### **3.1 إنشاء Business Manager (إذا لم يكن لديك)**
```
🌐 اذهب إلى: https://business.facebook.com/
✅ انشئ Business Manager جديد أو استخدم الموجود
📝 أضف موقعك: bulgariancarmarketplace.com
```

### **3.2 إنشاء Facebook Pixel**
```
1. من Business Manager → Events Manager
2. انقر على "Connect Data Sources"
3. اختر "Web" → "Facebook Pixel"
4. اختر "Create a Pixel"
5. اسم الـ Pixel: Bulgarian Car Marketplace Pixel
6. اكتب موقعك: bulgariancarmarketplace.com
7. احتفظ بـ Pixel ID
```

### **3.3 تثبيت Pixel Code (سأفعل هذا لك)**
```
📝 Pixel ID سيكون شكله: 1234567890123456
✅ سأدمجه في الكود تلقائياً
```

---

## 💰 **الخطوة 4: إعداد حساب الإعلانات**

### **4.1 إنشاء Ad Account**
```
1. من Business Manager → Ad Accounts
2. انقر على "Add" → "Create a New Ad Account"
3. اختر:
   - Ad Account Name: Bulgarian Car Marketplace Ads
   - Time Zone: (UTC+02:00) Sofia
   - Currency: EUR (Euro)
   - Business: اختر business الخاص بك
```

### **4.2 إعداد Payment Method**
```
💳 أضف طريقة دفع (Credit Card أو PayPal)
💰 لا تحتاج لدفع شيء الآن
✅ فقط لتفعيل الحساب
```

### **4.3 الحصول على Ad Account ID**
```
📋 Ad Account ID سيكون بصيغة: act_1234567890
✅ انسخه واحتفظ به
```

---

## 💬 **الخطوة 5: إعداد Facebook Messenger**

### **5.1 تفعيل Messenger Platform**
```
1. من Facebook App Dashboard
2. اذهب لـ "Add Product" (إضافة منتج)
3. اختر "Messenger" → "Set Up"
4. ربط الصفحة:
   - اختر صفحتك (100080260449528)
   - انقر على "Subscribe"
```

### **5.2 إعداد Webhooks (سأفعل هذا لك)**
```
🔗 Webhook URL: سأعطيك الـ URL بعد إعداد السيرفر
🔐 Verify Token: bulgarian_car_verify_2024
✅ سأكتب الكود كاملاً
```

---

## 📋 **ملخص المعلومات المطلوبة:**

بعد اتباع الخطوات أعلاه، أرسل لي هذه المعلومات:

```env
# معلومات Facebook App:
FACEBOOK_APP_ID=_______________
FACEBOOK_APP_SECRET=___________

# معلومات الصفحة:
FACEBOOK_PAGE_ACCESS_TOKEN=_______________

# معلومات Pixel:
FACEBOOK_PIXEL_ID=_______________

# معلومات الإعلانات:
FACEBOOK_AD_ACCOUNT_ID=act_______________

# معلومات إضافية:
BUSINESS_MANAGER_ID=___________ (اختياري)
```

---

## 🆘 **إذا واجهت مشاكل:**

### **المشكلة 1: "Access Token Invalid"**
```
✅ تأكد من صلاحيات الـ Token
✅ جدد الـ Token من Graph API Explorer
✅ تأكد أنك Admin على الصفحة
```

### **المشكلة 2: "Ad Account Not Found"**
```
✅ تأكد من كتابة act_ قبل الرقم
✅ تأكد من إضافة طريقة دفع
✅ انتظر 24 ساعة للمراجعة
```

### **المشكلة 3: "Pixel Not Working"**
```
✅ تأكد من تثبيت Pixel Code
✅ اختبر الـ Pixel من Events Manager
✅ تأكد من صحة الـ Domain
```

---

## 🎯 **بعد الحصول على المعلومات:**

### **سأقوم بـ:**
1. ✅ إعداد جميع الخدمات تلقائياً
2. ✅ تكوين ملفات البيئة
3. ✅ اختبار التكامل كاملاً
4. ✅ إنشاء أول إعلان تجريبي
5. ✅ تفعيل Messenger Bot
6. ✅ تشغيل تتبع Analytics

### **ستحصل على:**
- 🚀 موقع مربوط مع Facebook كاملاً
- 📢 نظام إعلانات أوتوماتيكي
- 💬 شات بوت ذكي باللغة البلغارية
- 📊 تتبع شامل للزوار والمبيعات
- 🔗 مشاركة احترافية على Social Media

---

**📞 أرسل لي المعلومات المتاحة وسأتولى الباقي! حتى لو كان لديك جزء من المعلومات فقط، يمكننا البدء!**