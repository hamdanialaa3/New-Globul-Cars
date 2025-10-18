# 🗺️ خريطة روابط المشروع الشاملة
## Bulgarian Car Marketplace - Project URLs Map

---

## 🏠 الصفحات الرئيسية (Main Pages)

| الصفحة | الرابط | الوصف |
|-------|--------|-------|
| **الصفحة الرئيسية** | `http://localhost:3000/` | الصفحة الرئيسية للموقع |
| **صفحة السيارات** | `http://localhost:3000/cars` | عرض جميع السيارات المتاحة |
| **تفاصيل السيارة** | `http://localhost:3000/cars/:id` | تفاصيل سيارة محددة (معرف السيارة) |
| **تفاصيل السيارة (بديل)** | `http://localhost:3000/car/:id` | رابط بديل لتفاصيل السيارة |
| **صفحة عن الموقع** | `http://localhost:3000/about` | معلومات عن الموقع |
| **اتصل بنا** | `http://localhost:3000/contact` | صفحة التواصل |
| **المساعدة** | `http://localhost:3000/help` | صفحة المساعدة والدعم |
| **الدعم** | `http://localhost:3000/support` | يوجه إلى صفحة المساعدة |

---

## 🔐 صفحات المصادقة (Authentication Pages)
**ملاحظة:** هذه الصفحات تظهر بدون header/footer (شاشة كاملة)

| الصفحة | الرابط | الحماية |
|-------|--------|---------|
| **تسجيل الدخول** | `http://localhost:3000/login` | مفتوح |
| **إنشاء حساب** | `http://localhost:3000/register` | مفتوح |
| **التحقق من البريد** | `http://localhost:3000/verification` | مفتوح |

---

## 👤 صفحات المستخدم (User Pages)
**تتطلب تسجيل دخول (Protected Routes)**

| الصفحة | الرابط | الوصف |
|-------|--------|-------|
| **بروفايل المستخدم** | `http://localhost:3000/profile` | الملف الشخصي للمستخدم |
| **🆕 دليل المستخدمين** | `http://localhost:3000/users` | **جديد!** عرض جميع المستخدمين مع فلاتر وترتيب |
| **سياراتي** | `http://localhost:3000/my-listings` | عرض وإدارة إعلانات المستخدم |
| **تعديل السيارة** | `http://localhost:3000/edit-car/:carId` | تعديل بيانات سيارة معينة |
| **تفاصيل السيارة** | `http://localhost:3000/car-details/:carId` | تفاصيل سيارة المستخدم |
| **الرسائل** | `http://localhost:3000/messages` | صندوق الرسائل |
| **المفضلة** | `http://localhost:3000/favorites` | السيارات المفضلة |
| **الإشعارات** | `http://localhost:3000/notifications` | إشعارات المستخدم |
| **البحث المحفوظ** | `http://localhost:3000/saved-searches` | عمليات البحث المحفوظة |
| **لوحة التحكم** | `http://localhost:3000/dashboard` | لوحة تحكم المستخدم |

---

## 🚗 نظام بيع السيارات (Sell Workflow)
**تتطلب تسجيل دخول (Protected Routes)**

### صفحات البيع الرئيسية:
| الصفحة | الرابط | الوصف |
|-------|--------|-------|
| **بيع سيارة** | `http://localhost:3000/sell` | صفحة البيع الرئيسية |
| **بيع سيارة (بديل 1)** | `http://localhost:3000/sell-car` | رابط بديل لصفحة البيع |
| **إضافة سيارة (بديل 2)** | `http://localhost:3000/add-car` | رابط بديل لصفحة البيع |

### مسار البيع الموحد (Mobile.de Style Workflow):

#### 1️⃣ البداية:
```
http://localhost:3000/sell/auto
```
**الخطوة الأولى:** اختيار نوع المركبة

#### 2️⃣ نوع البائع:
```
http://localhost:3000/sell/inserat/:vehicleType/verkaeufertyp
```
**الخطوة الثانية:** تحديد نوع البائع (فرد أو تاجر)

#### 3️⃣ بيانات المركبة:
```
http://localhost:3000/sell/inserat/:vehicleType/fahrzeugdaten/antrieb-und-umwelt
```
**الخطوة الثالثة:** إدخال بيانات السيارة الأساسية

#### 4️⃣ التجهيزات (Unified - الموحد):
```
http://localhost:3000/sell/inserat/:vehicleType/equipment
```
**الخطوة الرابعة:** جميع التجهيزات في صفحة واحدة

#### 4️⃣ (أ) التجهيزات (Legacy - القديم):
**للحفاظ على التوافق مع النظام القديم:**

| التجهيزات | الرابط |
|-----------|---------|
| **الرئيسية** | `/sell/inserat/:vehicleType/ausstattung` |
| **السلامة** | `/sell/inserat/:vehicleType/ausstattung/sicherheit` |
| **الراحة** | `/sell/inserat/:vehicleType/ausstattung/komfort` |
| **الترفيه** | `/sell/inserat/:vehicleType/ausstattung/infotainment` |
| **الإضافات** | `/sell/inserat/:vehicleType/ausstattung/extras` |

#### 5️⃣ الصور:
```
http://localhost:3000/sell/inserat/:vehicleType/details/bilder
```
**الخطوة الخامسة:** رفع صور السيارة

#### 6️⃣ السعر:
```
http://localhost:3000/sell/inserat/:vehicleType/details/preis
```
**الخطوة السادسة:** تحديد السعر

#### 7️⃣ بيانات الاتصال (Unified - الموحد):
```
http://localhost:3000/sell/inserat/:vehicleType/contact
```
**الخطوة السابعة:** جميع بيانات الاتصال في صفحة واحدة

#### 7️⃣ (أ) بيانات الاتصال (Legacy - القديم):
**للحفاظ على التوافق مع النظام القديم:**

| بيانات الاتصال | الرابط |
|----------------|---------|
| **الاسم** | `/sell/inserat/:vehicleType/kontakt/name` |
| **العنوان** | `/sell/inserat/:vehicleType/kontakt/adresse` |
| **الهاتف** | `/sell/inserat/:vehicleType/kontakt/telefonnummer` |

---

## 🔍 صفحات البحث والتصفح (Search & Browse)

| الصفحة | الرابط | الحماية |
|-------|--------|---------|
| **البحث المتقدم** | `http://localhost:3000/advanced-search` | محمي ✅ |
| **العلامات التجارية الرائجة** | `http://localhost:3000/top-brands` | مفتوح |
| **معرض العلامات** | `http://localhost:3000/brand-gallery` | محمي ✅ |
| **التجار** | `http://localhost:3000/dealers` | محمي ✅ |
| **التمويل** | `http://localhost:3000/finance` | محمي ✅ |

---

## 👨‍💼 صفحات الإدارة (Admin Pages)

### إدارة عادية:
| الصفحة | الرابط | الحماية |
|-------|--------|---------|
| **تسجيل دخول الإدارة** | `http://localhost:3000/admin-login` | مفتوح |
| **لوحة الإدارة** | `http://localhost:3000/admin` | محمي بصلاحية Admin ✅ |

### سوبر أدمن (Super Admin):
**ملاحظة:** تظهر بدون header/footer (شاشة كاملة)

| الصفحة | الرابط | الحماية |
|-------|--------|---------|
| **تسجيل دخول السوبر أدمن** | `http://localhost:3000/super-admin-login` | مفتوح |
| **لوحة السوبر أدمن** | `http://localhost:3000/super-admin` | محمي ✅ |

---

## 📊 صفحات متقدمة (Advanced Features)

| الصفحة | الرابط | الوصف |
|-------|--------|-------|
| **بوابة التحليلات B2B** | `http://localhost:3000/analytics` | تحليلات الأعمال |
| **التوأم الرقمي** | `http://localhost:3000/digital-twin` | نموذج رقمي للسيارة |
| **الاشتراكات** | `http://localhost:3000/subscription` | إدارة الاشتراكات |

---

## ⚖️ الصفحات القانونية (Legal Pages)

| الصفحة | الرابط |
|-------|--------|
| **سياسة الخصوصية** | `http://localhost:3000/privacy-policy` |
| **شروط الخدمة** | `http://localhost:3000/terms-of-service` |
| **حذف البيانات** | `http://localhost:3000/data-deletion` |
| **سياسة ملفات تعريف الارتباط** | `http://localhost:3000/cookie-policy` |
| **خريطة الموقع** | `http://localhost:3000/sitemap` |

---

## 🧪 صفحات الاختبار (Test Pages)
**للمطورين فقط**

| الصفحة | الرابط | الغرض |
|-------|--------|-------|
| **اختبار الثيم** | `http://localhost:3000/theme-test` | اختبار المظهر |
| **اختبار الخلفية** | `http://localhost:3000/background-test` | اختبار الخلفيات |
| **عرض شامل للثيم** | `http://localhost:3000/full-demo` | عرض كامل للتصميم |
| **اختبار التأثيرات** | `http://localhost:3000/effects-test` | اختبار التأثيرات |

---

## ❌ صفحة الخطأ (Error Page)

| الصفحة | الرابط | متى تظهر |
|-------|--------|-----------|
| **404 - غير موجود** | أي رابط غير معرف | عند الوصول لرابط غير موجود |

---

## 🔑 ملاحظات الحماية (Protection Notes)

### 🔓 **صفحات مفتوحة (Public)**
- يمكن الوصول إليها بدون تسجيل دخول

### 🔐 **صفحات محمية (Protected Routes)**
- تتطلب تسجيل دخول
- يتم توجيه المستخدم لصفحة Login إذا لم يكن مسجلاً

### 🛡️ **صفحات إدارية (Admin Routes)**
- تتطلب تسجيل دخول
- تتطلب صلاحيات Admin
- يتم رفض الوصول للمستخدمين العاديين

### 🔒 **AuthGuard Routes**
- تتطلب تسجيل دخول مع التحقق من البريد الإلكتروني
- حماية إضافية للصفحات الحساسة

---

## 📱 معلومات إضافية (Additional Info)

### البيئة الحالية:
```
Environment: Development (localhost)
Base URL: http://localhost:3000
Port: 3000
```

### البيئة الإنتاجية:
```
Production URL: https://fire-new-globul.web.app
Domain: https://mobilebg.eu
```

### تقنيات الحماية المستخدمة:
- ✅ React Router v6
- ✅ Firebase Authentication
- ✅ Protected Routes
- ✅ Admin Routes
- ✅ Auth Guards
- ✅ Google reCAPTCHA v3

---

## 🎯 إحصائيات المشروع

| المقياس | العدد |
|---------|-------|
| **إجمالي الصفحات الرئيسية** | 50+ صفحة |
| **الصفحات العامة** | 15 صفحة |
| **الصفحات المحمية** | 25+ صفحة |
| **صفحات الإدارة** | 4 صفحات |
| **صفحات البيع (Workflow)** | 15+ صفحة |
| **الصفحات القانونية** | 5 صفحات |
| **صفحات الاختبار** | 4 صفحات |

---

## 📋 معلومات التكامل (Integration Info)

### Facebook:
- **App ID:** 1780064479295175
- **Threads App ID:** 1322844865937799
- **Pixel ID:** موجود ومفعل

### Firebase:
- **Project ID:** fire-new-globul
- **Domain:** fire-new-globul.firebaseapp.com

### Social Media:
- **Instagram:** @globulnet
- **TikTok:** @globulnet
- **Facebook Page ID:** 109254638332601

---

## 🔄 روابط بديلة (Alias Routes)

| الرابط الأصلي | الروابط البديلة |
|---------------|------------------|
| `/sell` | `/sell-car`, `/add-car` |
| `/cars/:id` | `/car/:id` |
| `/help` | `/support` |

---

## 🚀 الحالة النهائية

✅ **جميع الروابط تعمل بشكل صحيح**
✅ **الحماية مطبقة على الصفحات المطلوبة**
✅ **التوجيه يعمل بشكل سليم**
✅ **صفحات الخطأ مُعالجة**

---

**تم إنشاء هذا الملف:** 16 أكتوبر 2025  
**الإصدار:** 1.0  
**اللغات المدعومة:** English, العربية, Български

---

## 🎉 المشروع جاهز للنشر!


