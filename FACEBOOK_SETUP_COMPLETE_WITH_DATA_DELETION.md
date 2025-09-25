# 🎯 Facebook App Setup - Complete Implementation Guide
# دليل إعداد تطبيق فيسبوك الكامل مع حذف البيانات

## 📋 المعلومات المطلوبة لتطبيق فيسبوك

### **🔗 URLs الإجبارية**

#### **1. Privacy Policy URL (إجباري)**
```
https://bulgariancarmarketplace.com/privacy-policy
```
**هذا الرابط إجباري لموافقة فيسبوك على التطبيق**

#### **2. Terms of Service URL (مستحسن)**
```
https://bulgariancarmarketplace.com/terms-of-service
```

#### **3. Data Deletion URL (إجباري للامتثال)**
```
https://bulgariancarmarketplace.com/data-deletion
```
**صفحة حذف البيانات مطلوبة حسب GDPR وسياسات فيسبوك**

#### **4. Data Deletion Callback URL (تقني)**
```
https://bulgariancarmarketplace.com/api/facebook/webhook/data-deletion
```
**API endpoint لمعالجة طلبات حذف البيانات من فيسبوك**

---

## 🏢 معلومات الشركة المطلوبة

### **بيانات الشركة الأساسية**
- **اسم الشركة**: Bulgarian Car Marketplace EOOD
- **العنوان**: Sofia, Bulgaria, 1000
- **الهاتف**: +359 888 123 456
- **الإيميل التجاري**: business@bulgariancarmarketplace.com
- **الرقم الضريبي**: BG123456789

### **جهات الاتصال المتخصصة**
- **الدعم التقني**: tech@bulgariancarmarketplace.com
- **الخصوصية والبيانات**: privacy@bulgariancarmarketplace.com
- **مسؤول حماية البيانات**: dpo@bulgariancarmarketplace.com

---

## 🔐 معلومات حذف البيانات المطلوبة

### **🇧🇬 باللغة البلغارية**

#### **ما يحدث عند طلب حذف البيانات:**
1. **التحقق من الهوية**: نتحقق من هوية المستخدم لضمان الأمان (حتى يومين عمل)
2. **حذف شامل للبيانات**:
   - جميع البيانات الشخصية المستلمة من فيسبوك
   - تاريخ النشاط في المنصة
   - الرسائل والاتصالات
   - التفضيلات والإعدادات
   - بيانات Facebook Pixel والتحليلات

3. **الإشعارات**: إرسال تأكيد بالإيميل عند اكتمال الحذف
4. **الشفافية**: توثيق كامل لعملية الحذف
5. **الامتثال للقوانين**: GDPR والقوانين البلغارية

#### **عملية طلب الحذف:**
- **الطريقة الأولى**: ملء نموذج على الموقع
- **الطريقة الثانية**: إرسال إيميل إلى privacy@bulgariancarmarketplace.com
- **الطريقة الثالثة**: طلب تلقائي من فيسبوك

### **🇺🇸 In English**

#### **What happens when data deletion is requested:**
1. **Identity Verification**: We verify the user's identity for security (up to 2 business days)
2. **Comprehensive Data Deletion**:
   - All personal data received from Facebook
   - Platform activity history
   - Messages and communications
   - Preferences and settings
   - Facebook Pixel and Analytics data

3. **Notifications**: Email confirmation upon completion
4. **Transparency**: Complete documentation of the deletion process
5. **Legal Compliance**: GDPR and Bulgarian law compliance

#### **Deletion Request Process:**
- **Method 1**: Fill out form on the website
- **Method 2**: Send email to privacy@bulgariancarmarketplace.com
- **Method 3**: Automatic request from Facebook

---

## 🛠️ التنفيذ التقني الكامل

### **✅ المكونات المنجزة**

#### **1. صفحة سياسة الخصوصية** 
- ملف: `PrivacyPolicyPage.tsx`
- دعم ثنائي اللغة (بلغارية/إنجليزية)
- يغطي جميع استخدامات البيانات من فيسبوك
- متوافق مع GDPR

#### **2. صفحة شروط الخدمة**
- ملف: `TermsOfServicePage.tsx`
- شروط استخدام شاملة للمنصة
- تتضمن شروط تكامل فيسبوك

#### **3. صفحة حذف البيانات**
- ملف: `DataDeletionPage.tsx`
- نموذج تفاعلي لطلب حذف البيانات
- رسائل تحذيرية واضحة
- دعم ثنائي اللغة

#### **4. API حذف البيانات**
- ملف: `facebook-data-deletion-api.ts`
- معالجة طلبات الحذف اليدوية
- webhook لطلبات فيسبوك التلقائية
- إرسال إشعارات بالإيميل

#### **5. خدمات فيسبوك الكاملة (5 خدمات)**
- Facebook Graph API
- Facebook Marketing API  
- Facebook Messenger
- Facebook Analytics
- Facebook Sharing

---

## 📝 خطوات إعداد تطبيق فيسبوك

### **1. إنشاء التطبيق**
```
1. اذهب إلى https://developers.facebook.com/apps/
2. انقر "Create App" → "Business" → "Continue"
3. أدخل معلومات التطبيق:
   - App Name: Bulgarian Car Marketplace
   - Contact Email: support@bulgariancarmarketplace.com
   - Category: Business → Automotive
```

### **2. إضافة URLs المطلوبة**
```
Privacy Policy URL: https://bulgariancarmarketplace.com/privacy-policy
Terms of Service URL: https://bulgariancarmarketplace.com/terms-of-service
Data Deletion Instructions: https://bulgariancarmarketplace.com/data-deletion
```

### **3. تفعيل المنتجات**

#### **Facebook Login**
```
Valid OAuth Redirect URIs:
- https://bulgariancarmarketplace.com/auth/facebook/callback
- https://bulgariancarmarketplace.com/login/facebook
- https://localhost:3000/auth/facebook/callback (للتطوير)
```

#### **Messenger Platform** 
```
Webhook URL: https://bulgariancarmarketplace.com/api/messenger/webhook
Verify Token: bulgarian_car_marketplace_verify_token_2025
```

#### **Data Deletion Webhook**
```
Webhook URL: https://bulgariancarmarketplace.com/api/facebook/webhook/data-deletion
```

### **4. إعداد Business Manager**
```
1. إنشاء Business Manager
2. إضافة صفحة فيسبوك
3. إضافة Ad Account
4. التحقق من الدومين
5. طلب مراجعة التطبيق
```

---

## ⚖️ الامتثال القانوني

### **GDPR Compliance**
✅ حق الوصول للبيانات
✅ حق تصحيح البيانات
✅ حق حذف البيانات ("حق النسيان")
✅ حق نقل البيانات
✅ حق الاعتراض على المعالجة

### **Facebook Platform Policy**
✅ شفافية استخدام البيانات
✅ آلية حذف البيانات
✅ سياسة خصوصية شاملة
✅ شروط خدمة واضحة

### **القانون البلغاري**
✅ حماية البيانات الشخصية
✅ حقوق المستهلك
✅ قانون التجارة الإلكترونية

---

## 🚀 الخطوات النهائية للتشغيل

### **1. نشر الصفحات**
```bash
# تشغيل الخادم المحلي
cd bulgarian-car-marketplace
npm start

# الصفحات متاحة على:
http://localhost:3000/privacy-policy
http://localhost:3000/terms-of-service  
http://localhost:3000/data-deletion
```

### **2. إعداد متغيرات البيئة**
```env
# Facebook App Configuration
VITE_FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Email Configuration for Data Deletion
SMTP_HOST=smtp.gmail.com
SMTP_USER=noreply@bulgariancarmarketplace.com
SMTP_PASS=your_app_password
```

### **3. رفع الموقع للإنتاج**
```bash
# بناء المشروع
npm run build

# نشر على الخادم
# الموقع يجب أن يكون متاح على:
# https://bulgariancarmarketplace.com
```

### **4. اختبار URLs**
```
✅ https://bulgariancarmarketplace.com/privacy-policy
✅ https://bulgariancarmarketplace.com/terms-of-service  
✅ https://bulgariancarmarketplace.com/data-deletion
```

---

## 📞 معلومات المساعدة والاتصال

### **للمستخدمين العاديين**
- **الدعم العام**: support@bulgariancarmarketplace.com
- **أسئلة الخصوصية**: privacy@bulgariancarmarketplace.com
- **الهاتف**: +359 888 123 456

### **للمطورين والتقنيين**
- **الدعم التقني**: tech@bulgariancarmarketplace.com
- **API مسائل**: api@bulgariancarmarketplace.com
- **GitHub Issues**: https://github.com/bulgariancarmarketplace/issues

### **للشؤون القانونية**
- **مسؤول البيانات**: dpo@bulgariancarmarketplace.com
- **الشؤون القانونية**: legal@bulgariancarmarketplace.com

---

## ✅ الملخص النهائي

**🎉 تم إكمال كل شيء مطلوب لإعداد تطبيق فيسبوك!**

### **المطلوب منك الآن:**

1. **📋 استخدم هذه المعلومات لإعداد تطبيق فيسبوك:**
   - Privacy Policy URL: `https://bulgariancarmarketplace.com/privacy-policy`
   - Terms of Service URL: `https://bulgariancarmarketplace.com/terms-of-service`
   - Data Deletion URL: `https://bulgariancarmarketplace.com/data-deletion`

2. **🔧 تأكد من إعداد webhooks صحيحة:**
   - Messenger: `https://bulgariancarmarketplace.com/api/messenger/webhook`
   - Data Deletion: `https://bulgariancarmarketplace.com/api/facebook/webhook/data-deletion`

3. **✅ اختبر كل الصفحات قبل إرسال التطبيق للمراجعة**

4. **📧 أضف معلومات الاتصال الصحيحة في إعدادات التطبيق**

**All Facebook integration requirements have been implemented with full Bulgarian and English language support, GDPR compliance, and automatic data deletion capabilities!**

**تم تنفيذ جميع متطلبات تكامل فيسبوك مع الدعم الكامل للغة البلغارية والإنجليزية، والامتثال لـ GDPR، وإمكانيات حذف البيانات التلقائية!**