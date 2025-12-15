# 🚗 روابط خطوات إضافة السيارة (Sell Workflow Links)

هذا الملف يحتوي على **جميع روابط المتصفح** لخطوات إضافة السيارة في مشروع Globul Cars.

**⚠️ ملاحظة مهمة:** هذا التوثيق يعكس البنية الفعلية المستخدمة في الكود حالياً. جميع الصفحات موحدة في تصميم واحد لكل خطوة.

---

## 🌐 روابط التطوير (Development - localhost)

### **المسار الأساسي:**
```
http://localhost:3000
```

---

## 📋 الخطوات الرئيسية (8 خطوات متسلسلة)

### **الخطوة 1: اختيار نوع المركبة** 🚙
```
http://localhost:3000/sell/auto
```
**الملف:** `VehicleStartPageNew.tsx`  
**الوصف:** اختيار نوع المركبة (سيارة، دراجة نارية، شاحنة، إلخ)  
**التوجيه:** `/sell/auto` → `VehicleStartPage`

---

### **الخطوة 2: بيانات المركبة ونوع البائع** 📝
```
http://localhost:3000/sell/inserat/:vehicleType/data
```
**مثال:**
```
http://localhost:3000/sell/inserat/car/data
http://localhost:3000/sell/inserat/motorcycle/data
http://localhost:3000/sell/inserat/truck/data
```

**الملف:** `VehicleDataPageUnified.tsx`  
**الوصف:** صفحة موحدة تحتوي على:
- إدخال بيانات السيارة (الماركة، الموديل، السنة، الكيلومترات، الأبواب، حالة السيارة)
- اختيار نوع البائع (Private / Dealer / Company) - **مدمج في نفس الصفحة**
- نوع البيع (Private/Commercial)
- معلومات إضافية (Roadworthy, Sale Timeline)

**⚠️ الصفحة الحالية التي فيها المشكلة** (الأزرار في Desktop لا تعمل بشكل صحيح)

**التوجيه:** `/sell/inserat/:vehicleType/data` → `VehicleDataPageUnified`

---

### **الخطوة 3: التجهيزات والمواصفات** 🛠️
```
http://localhost:3000/sell/inserat/:vehicleType/equipment
```
**مثال:**
```
http://localhost:3000/sell/inserat/car/equipment
```

**الملف:** `UnifiedEquipmentPage.tsx`  
**الوصف:** صفحة موحدة تحتوي على جميع التجهيزات في صفحة واحدة:
- تجهيزات السلامة (Safety): الوسائد الهوائية، ABS، ESC، مثبت السرعة
- تجهيزات الراحة (Comfort): مكيف هواء، مقاعد مدفأة، فتحة سقف، مقاعد كهربائية
- أنظمة المعلومات والترفيه (Infotainment): نظام ملاحة، Bluetooth، شاشة لمس، Apple CarPlay، Android Auto
- إضافات أخرى (Extras): حامل سقف، قضيب سحب، حماية أسفل المحرك

**التوجيه:** `/sell/inserat/:vehicleType/equipment` → `UnifiedEquipmentPage`

**📌 ملاحظة:** الصفحات الفرعية القديمة (`SafetyPage`, `ComfortPage`, `InfotainmentPage`, `ExtrasPage`, `EquipmentMainPage`) لم تعد مستخدمة. تم استبدالها بصفحة موحدة واحدة.

---

### **الخطوة 4: الصور** 📸
```
http://localhost:3000/sell/inserat/:vehicleType/images
```
**مثال:**
```
http://localhost:3000/sell/inserat/car/images
```

**الملف:** `ImagesPageUnified.tsx`  
**الوصف:** رفع صور السيارة:
- حتى 20 صورة
- Drag & drop للرفع
- إعادة ترتيب الصور
- معاينة قبل الرفع

**التوجيه:** `/sell/inserat/:vehicleType/images` → `ImagesPageUnified`

---

### **الخطوة 5: السعر والتمويل** 💰
```
http://localhost:3000/sell/inserat/:vehicleType/pricing
```
**مثال:**
```
http://localhost:3000/sell/inserat/car/pricing
```

**الملف:**
- **Desktop:** `PricingPage.tsx`
- **Mobile:** `MobilePricingPage.tsx`

**الوصف:** تحديد:
- السعر
- قابلية التفاوض
- خيارات التمويل
- تقييم السعر التلقائي (AI)

**التوجيه:** `/sell/inserat/:vehicleType/pricing` → `PricingPage` (Desktop) / `MobilePricingPage` (Mobile)

---

### **الخطوة 6: معلومات الاتصال** 📞
```
http://localhost:3000/sell/inserat/:vehicleType/contact
```
**مثال:**
```
http://localhost:3000/sell/inserat/car/contact
```

**الملف:**
- **Desktop:** `UnifiedContactPage.tsx`
- **Mobile:** `MobileContactPage.tsx`

**الوصف:** صفحة موحدة تحتوي على جميع معلومات الاتصال:
- الاسم (الأول والأخير)
- العنوان (المدينة، المنطقة، الرمز البريدي)
- رقم الهاتف
- طريقة الاتصال المفضلة

**التوجيه:** `/sell/inserat/:vehicleType/contact` → `UnifiedContactPage` (Desktop) / `MobileContactPage` (Mobile)

**📌 ملاحظة:** الصفحات المنفصلة القديمة (`ContactNamePage`, `ContactAddressPage`, `ContactPhonePage`) لم تعد مستخدمة. تم استبدالها بصفحة موحدة واحدة.

---

### **الخطوة 7: المعاينة** 👀
```
http://localhost:3000/sell/inserat/:vehicleType/preview
```
**مثال:**
```
http://localhost:3000/sell/inserat/car/preview
```

**الملف:**
- **Desktop:** `DesktopPreviewPage.tsx`
- **Mobile:** `MobilePreviewPage.tsx`

**الوصف:** معاينة جميع المعلومات المدخلة قبل النشر النهائي

**التوجيه:** `/sell/inserat/:vehicleType/preview` → `DesktopPreviewPage` (Desktop) / `MobilePreviewPage` (Mobile)

---

### **الخطوة 8: النشر** 🚀
```
http://localhost:3000/sell/inserat/:vehicleType/submission
```
**مثال:**
```
http://localhost:3000/sell/inserat/car/submission
```

**الملف:**
- **Desktop:** `DesktopSubmissionPage.tsx`
- **Mobile:** `MobileSubmissionPage.tsx`

**الوصف:** النشر النهائي للإعلان ونقله لقاعدة البيانات

**التوجيه:** `/sell/inserat/:vehicleType/submission` → `DesktopSubmissionPage` (Desktop) / `MobileSubmissionPage` (Mobile)

---

## 📊 التدفق الكامل بالترتيب

```
1. http://localhost:3000/sell/auto
   ↓ اختيار نوع المركبة (سيارة/دراجة/شاحنة)
   
2. http://localhost:3000/sell/inserat/car/data
   ↓ بيانات المركبة + نوع البائع (موحد في صفحة واحدة)
   
3. http://localhost:3000/sell/inserat/car/equipment
   ↓ التجهيزات (جميع الفئات في صفحة موحدة واحدة)
   
4. http://localhost:3000/sell/inserat/car/images
   ↓ رفع الصور (حتى 20 صورة)
   
5. http://localhost:3000/sell/inserat/car/pricing
   ↓ تحديد السعر والتمويل
   
6. http://localhost:3000/sell/inserat/car/contact
   ↓ معلومات الاتصال (موحدة في صفحة واحدة)
   
7. http://localhost:3000/sell/inserat/car/preview
   ↓ معاينة جميع البيانات
   
8. http://localhost:3000/sell/inserat/car/submission
   ✅ النشر النهائي
```

---

## 🔄 نسخ الموبايل (Mobile Variants)

النظام يدعم تلقائياً التحويل بين نسخ Desktop و Mobile بناءً على حجم الشاشة:

### **الصفحات التي لها نسخ موبايل:**
- `PricingPage` ↔ `MobilePricingPage`
- `UnifiedContactPage` ↔ `MobileContactPage`
- `DesktopPreviewPage` ↔ `MobilePreviewPage`
- `DesktopSubmissionPage` ↔ `MobileSubmissionPage`

### **الصفحات الموحدة (Responsive):**
الصفحات التالية تصميمها متجاوب وتعمل على جميع الأحجام:
- `VehicleStartPageNew.tsx`
- `VehicleDataPageUnified.tsx`
- `UnifiedEquipmentPage.tsx`
- `ImagesPageUnified.tsx`

**الروابط تبقى نفسها**، لكن التطبيق يعرض تلقائياً النسخة المناسبة حسب حجم الشاشة.

---

## 🔀 إعادة التوجيهات (Redirects - Backward Compatibility)

النظام يحتوي على إعادة توجيهات للروابط القديمة لضمان التوافق مع الإصدارات السابقة:

```
/ausstattung/*              → /equipment
/kontakt/*                  → /contact
/details/bilder/*           → /images
/details/preis/*            → /pricing
/verkaeufertyp              → /data (مدمج الآن)
```

جميع الروابط القديمة يتم إعادة توجيهها تلقائياً للروابط الجديدة.

---

## 🌍 روابط الإنتاج (Production URLs)

عند النشر على الإنتاج، استبدل `http://localhost:3000` برابط الموقع الفعلي:

### مثال:
```
https://globulcars.com/sell/auto
https://globulcars.com/sell/inserat/car/data
https://globulcars.com/sell/inserat/car/equipment
https://globulcars.com/sell/inserat/car/images
https://globulcars.com/sell/inserat/car/pricing
https://globulcars.com/sell/inserat/car/contact
https://globulcars.com/sell/inserat/car/preview
https://globulcars.com/sell/inserat/car/submission
```

---

## 🔧 خدمات الدعم (Backend Services)

### **حفظ تلقائي:**
- **الخدمة:** `workflowPersistenceService.ts`
- **الوظيفة:** حفظ البيانات تلقائياً كل 500ms إلى localStorage و Firestore
- **الميزة:** استئناف التعبئة من حيث توقف المستخدم

### **تتبع الخطوات:**
- **الخدمة:** `workflow-analytics-service.ts`
- **الوظيفة:** تتبع تقدم المستخدم، معدلات الإكمال، نقاط الخروج
- **التحليل:** تتبع معدلات التحويل لكل خطوة

### **إدارة الحالة:**
- **الخدمة:** `sellWorkflowStepState.ts`
- **الوظيفة:** إدارة حالة كل خطوة (pending/completed/skipped)
- **الميزة:** تتبع تقدم المستخدم عبر الخطوات

### **النظام الموحد:**
- **Hook:** `useUnifiedWorkflow.tsx`
- **الوظيفة:** إدارة البيانات عبر جميع الخطوات، مزامنة مع Firebase
- **الميزة:** مزامنة تلقائية بين localStorage و Firestore

---

## 🐛 المشكلة الحالية

### **الصفحة المتأثرة:**
```
http://localhost:3000/sell/inserat/car/data
```

### **المشكلة:**
- الأزرار في قسم "Model details" و "Further Information" لا تعمل بشكل صحيح في **وضع سطح المكتب**
- المشكلة تظهر فقط في **الوضع الأفقي (Desktop/Landscape)**
- الوضع العمودي (Mobile/Portrait) يعمل بشكل صحيح ✅

### **الأزرار المتأثرة:**
1. **Doors:** (2/3, 4/5, 6/7)
2. **Roadworthy:** (Yes/No)
3. **Sale Type:** (Private/Commercial)
4. **Sale Timeline:** (Don't know/ASAP/Within months)

### **الملف:** 
`VehicleDataPageUnified.tsx` (سطر 1500-1580 تقريباً)

### **الحالة:**
⚠️ قيد المعالجة

---

## 📝 ملاحظات مهمة

### **البنية الموحدة:**
- جميع الصفحات الرئيسية موحدة في تصميم واحد لكل خطوة
- لا توجد صفحات فرعية متعددة - كل خطوة = صفحة واحدة
- التصميم متجاوب يعمل على جميع الأجهزة

### **التوجيه:**
- جميع الروابط تستخدم React Router (Client-side routing)
- المسارات تستخدم `:vehicleType` كمعامل ديناميكي (car, motorcycle, truck, إلخ)

### **حفظ البيانات:**
- البيانات تُحفظ تلقائياً عند الانتقال بين الخطوات
- يمكن للمستخدم العودة لأي خطوة سابقة دون فقدان البيانات
- النظام يدعم استئناف التعبئة من حيث توقف المستخدم
- المزامنة التلقائية بين localStorage و Firestore

### **الخطوات:**
- إجمالي **8 خطوات** متسلسلة
- كل خطوة مطلوبة قبل الانتقال للخطوة التالية
- يمكن التعديل والعودة للخطوات السابقة في أي وقت

---

## 📌 ملخص التغييرات

### **ما تم توحيده:**
1. ✅ **نوع البائع** - مدمج الآن في صفحة بيانات المركبة (كان منفصلاً)
2. ✅ **التجهيزات** - جميع الفئات في صفحة موحدة واحدة (كانت 6 صفحات)
3. ✅ **معلومات الاتصال** - جميع الحقول في صفحة موحدة واحدة (كانت 4 صفحات)

### **النتيجة:**
- **قبل:** 13+ صفحة معقدة
- **الآن:** 8 صفحات موحدة وبسيطة
- **التحسين:** بنية أنظف، أسهل في الصيانة، تجربة مستخدم أفضل

---

**آخر تحديث:** 11 ديسمبر 2025  
**حالة التوثيق:** ✅ محدث ويعكس البنية الفعلية الحالية
