# 🛒 دليل كاتالوج Facebook الشامل

**المشروع:** Globul Cars  
**التاريخ:** 13 أكتوبر 2025

---

## ✅ ما تم إنشاؤه:

1. ✅ **facebook-catalog-service.ts** - خدمة التكامل
2. ✅ **facebook-catalog.ts** (Functions) - API endpoints تلقائية
3. ✅ **FacebookCatalogPage.tsx** - صفحة إدارة الكتالوج

---

## 🎯 كيف يعمل النظام:

```
موقعك (Firestore)
    ↓
إعلانات السيارات النشطة (status: 'active')
    ↓
Product Feed (XML/CSV)
    ↓
Facebook Catalog
    ↓
يظهر في:
- Facebook Marketplace ✅
- Instagram Shopping ✅
- Facebook Ads ✅
- Instagram Ads ✅
```

---

## 📊 ما الذي سيظهر في Facebook:

### ✅ سيظهر تلقائياً:

كل سيارة في Firestore بحالة **"active"** مع:
- ✅ الصور
- ✅ السعر
- ✅ المواصفات (Make, Model, Year, Mileage)
- ✅ الموقع (City, Region)
- ✅ معلومات البائع
- ✅ رابط للموقع

### ❌ لن يظهر:

- ❌ السيارات بحالة "draft" (مسودة)
- ❌ السيارات بحالة "sold" (مباعة)
- ❌ السيارات بحالة "expired" (منتهية)
- ❌ السيارات بدون صور
- ❌ السيارات المحذوفة

---

## 🔧 طريقة التفعيل:

### المرحلة 1: إعداد Firebase Functions ⚡

```bash
# 1. اذهب لمجلد functions
cd functions

# 2. ثبّت التبعيات
npm install

# 3. ابنِ المشروع
npm run build

# 4. انشر Functions
cd ..
firebase deploy --only functions
```

**بعد النشر، ستحصل على روابط:**
```
✅ XML Feed: https://us-central1-fire-new-globul.cloudfunctions.net/facebookCatalogXML
✅ CSV Feed: https://us-central1-fire-new-globul.cloudfunctions.net/facebookCatalogCSV
```

---

### المرحلة 2: إعداد Facebook Commerce Manager 🛒

#### الخطوة 1: إنشاء Business Manager (إذا لم يكن موجوداً)

```
https://business.facebook.com/
```

1. اضغط **"Create account"**
2. أدخل:
   - Business name: **Globul Cars**
   - Your name: **Alaa Al Hamadani**
   - Business email: **alaa.hamdani@yahoo.com**

#### الخطوة 2: إنشاء Catalog

```
https://business.facebook.com/commerce
```

1. اضغط **"Create catalog"**
2. اختر **"Vehicles"** (مهم! اختر المركبات)
3. أدخل:
   - Catalog name: **Globul Cars Bulgaria**
   - Business: اختر الـ business الذي أنشأته

#### الخطوة 3: ربط Facebook Page

1. في Catalog Settings
2. اضغط **"Add Page"**
3. اختر صفحة Facebook الخاصة بـ Globul Cars
4. (إذا لم يكن لديك صفحة، أنشئها أولاً)

#### الخطوة 4: إضافة Data Feed

1. في Catalog → **Data Sources**
2. اضغط **"Add Data Source"**
3. اختر **"Data Feed"**
4. أدخل:
   - **Name:** Globul Cars Live Feed
   - **Feed URL:** 
   ```
   https://us-central1-fire-new-globul.cloudfunctions.net/facebookCatalogXML
   ```
5. **Upload schedule:** Hourly (كل ساعة)
6. اضغط **"Start Upload"**

#### الخطوة 5: التحقق من البيانات

بعد 10-30 دقيقة:
1. افتح Catalog → **Items**
2. يجب أن ترى السيارات تظهر
3. تحقق من:
   - ✅ الصور واضحة
   - ✅ الأسعار صحيحة
   - ✅ الروابط تعمل

---

### المرحلة 3: تفعيل Commerce Features 🎨

#### 1. Facebook Marketplace:

في Commerce Manager:
1. اذهب إلى **Commerce Account Settings**
2. فعّل **"Checkout on Facebook"** (اختياري)
3. فعّل **"Shops"**

#### 2. Instagram Shopping:

1. اربط Instagram Business Account
2. في Instagram → **Settings** → **Business**
3. اضغط **"Set up Instagram Shopping"**
4. اختر catalog الذي أنشأته

#### 3. Dynamic Ads:

في Facebook Ads Manager:
1. أنشئ Campaign جديدة
2. اختر **"Catalog Sales"**
3. اختر catalog الخاص بك
4. Facebook سيعرض السيارات تلقائياً!

---

## 🎯 التحكم في ما يُعرض:

### يمكنك التحكم بعدة طرق:

#### 1. في الكود (facebook-catalog.ts):

```typescript
// فقط السيارات المميزة
where('isFeatured', '==', true)

// فقط السيارات فوق 10,000 يورو
where('price', '>=', 10000)

// فقط من باعة معتمدين
where('sellerType', '==', 'dealer')

// فقط في Sofia
where('city', '==', 'Sofia')
```

#### 2. في Facebook Catalog:

- يمكنك إنشاء **Product Sets** (مجموعات منتجات)
- مثل: "BMW Cars Only", "Cars under 20k", "Sofia Cars"
- واستخدام كل مجموعة في إعلانات مختلفة

#### 3. عبر حقل `status`:

في موقعك، عندما تضيف سيارة:
- **Active** → تظهر في Facebook ✅
- **Draft** → لا تظهر ❌
- **Sold** → لا تظهر (تُحذف تلقائياً) ❌

---

## 📊 مثال عملي:

### لديك في الموقع:

| ID | Car | Status | السعر | في Facebook؟ |
|----|-----|--------|-------|--------------|
| 1 | BMW X5 | active | 50000€ | ✅ نعم |
| 2 | Audi A4 | draft | 30000€ | ❌ لا |
| 3 | Mercedes C | active | 40000€ | ✅ نعم |
| 4 | VW Golf | sold | 15000€ | ❌ لا |
| 5 | Toyota | active | 20000€ | ✅ نعم |

**سيظهر في Facebook Catalog: 3 سيارات فقط (BMW, Mercedes, Toyota)**

---

## 🔄 التحديث التلقائي:

### السيناريو:

1. **الساعة 10:00** → عندك 100 سيارة نشطة
2. **الساعة 10:30** → أضفت سيارة جديدة → 101 سيارة
3. **الساعة 11:00** → Facebook يقرأ الـ Feed تلقائياً
4. **النتيجة** → الكتالوج الآن فيه 101 سيارة ✨

**كل شيء تلقائي بدون أي تدخل منك!** 🚀

---

## 💡 فوائد إضافية:

### 1. البحث الذكي:
```
شخص يبحث في Facebook عن "BMW X5 Sofia"
→ يظهر له إعلانك مباشرة! ✅
```

### 2. الإعلانات الديناميكية:
```
شخص زار صفحة BMW X5 في موقعك
→ Facebook يعرض له نفس السيارة في إعلان
→ معدل تحويل أعلى! 📈
```

### 3. Instagram Shopping:
```
الناس يتصفحون Instagram
→ يشوفون سياراتك في Shopping tab
→ يضغطون → يروحون لموقعك! 🎯
```

---

## ⚙️ خطوات التفعيل السريعة:

### 1. انشر Functions (الآن):
```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

### 2. في Facebook Commerce Manager:
1. أنشئ Catalog (نوع: Vehicles)
2. أضف Data Feed
3. استخدم URL:
   ```
   https://us-central1-fire-new-globul.cloudfunctions.net/facebookCatalogXML
   ```
4. جدولة: كل ساعة

### 3. انتظر 30 دقيقة:
- Facebook سيقرأ الـ Feed
- سيحلل البيانات
- سيعرض السيارات

### 4. تحقق من النتيجة:
- افتح Commerce Manager → Catalog → Items
- يجب أن ترى سياراتك ✨

---

## 🎊 النتيجة النهائية:

✅ **موقعك** → يعرض السيارات  
✅ **Facebook Marketplace** → يعرض نفس السيارات  
✅ **Instagram** → يعرض نفس السيارات  
✅ **Facebook Ads** → إعلانات تلقائية  
✅ **التحديث** → تلقائي كل ساعة  

**كل شيء متزامن ومتكامل!** 🚀

---

**هل تريد مني نشر Functions الآن لتفعيل التكامل؟** 🔥

