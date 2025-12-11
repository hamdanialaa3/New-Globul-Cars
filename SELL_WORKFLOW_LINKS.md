# 🚗 روابط خطوات إضافة السيارة (Sell Workflow Links)

هذا الملف يحتوي على **جميع روابط المتصفح** لخطوات إضافة السيارة في مشروع Globul Cars.

---

## 🌐 روابط التطوير (Development - localhost)

### **المسار الأساسي:**
```
http://localhost:3000
```

---

### **الخطوة 1: اختيار نوع المركبة** 🚙
```
http://localhost:3000/sell
```
**الملف:** `VehicleStartPageNew.tsx`  
**الوصف:** اختيار نوع المركبة (سيارة، دراجة نارية، شاحنة، إلخ)

---

### **الخطوة 2: اختيار نوع البائع** 👤
```
http://localhost:3000/sell/seller-type
```
**الملف:** `SellerTypePageNew.tsx`  
**الوصف:** اختيار نوع البائع (Private / Dealer / Company)

---

### **الخطوة 3: بيانات المركبة** 📝
```
http://localhost:3000/sell/inserat/car/data
```
**الملف:** `VehicleDataPageUnified.tsx`  
**الوصف:** إدخال بيانات السيارة (الماركة، الموديل، السنة، الكيلومترات، الأبواب، حالة السيارة، نوع البيع، إلخ)

**⚠️ الصفحة الحالية التي فيها المشكلة**

---

### **الخطوة 4: التجهيزات والمواصفات** 🛠️

#### **4a. صفحة التجهيزات الرئيسية (Navigation Hub)**
```
http://localhost:3000/sell/equipment
```
**الملف:** `EquipmentMainPage.tsx`  
**الوصف:** صفحة التنقل بين أقسام التجهيزات المختلفة

#### **4b. تجهيزات السلامة**
```
http://localhost:3000/sell/equipment/safety
```
**الملف:** `SafetyPage.tsx`  
**الوصف:** الوسائد الهوائية، ABS، ESC، مثبت السرعة، إلخ

#### **4c. تجهيزات الراحة**
```
http://localhost:3000/sell/equipment/comfort
```
**الملف:** `ComfortPage.tsx`  
**الوصف:** مكيف هواء، مقاعد مدفأة، فتحة سقف، مقاعد كهربائية، إلخ

#### **4d. أنظمة المعلومات والترفيه**
```
http://localhost:3000/sell/equipment/infotainment
```
**الملف:** `InfotainmentPage.tsx`  
**الوصف:** نظام ملاحة، Bluetooth، شاشة لمس، Apple CarPlay، Android Auto، إلخ

#### **4e. إضافات أخرى**
```
http://localhost:3000/sell/equipment/extras
```
**الملف:** `ExtrasPage.tsx`  
**الوصف:** حامل سقف، قضيب سحب، حماية أسفل المحرك، إلخ

#### **4f. التجهيزات الموحدة (صفحة واحدة)**
```
http://localhost:3000/sell/equipment/unified
```
**الملف:** `UnifiedEquipmentPage.tsx`  
**الوصف:** جميع التجهيزات في صفحة واحدة (بديل للصفحات الفرعية)

---

### **الخطوة 5: الصور** 📸
```
http://localhost:3000/sell/images
```
**الملف:** `ImagesPage.tsx`  
**الوصف:** رفع صور السيارة (حتى 20 صورة، drag & drop، إعادة ترتيب الصور)

---

### **الخطوة 6: السعر والتمويل** 💰
```
http://localhost:3000/sell/pricing
```
**الملف:** `PricingPage.tsx`  
**الوصف:** تحديد السعر، قابلية التفاوض، خيارات التمويل، تقييم السعر التلقائي (AI)

---

### **الخطوة 7: معلومات الاتصال** 📞

#### **7a. معلومات الاتصال الموحدة (موصى بها)**
```
http://localhost:3000/sell/contact/unified
```
**الملف:** `UnifiedContactPage.tsx`  
**الوصف:** جميع معلومات الاتصال في صفحة واحدة (الاسم، العنوان، رقم الهاتف)

#### **7b. الاسم (منفصل)**
```
http://localhost:3000/sell/contact/name
```
**الملف:** `ContactNamePage.tsx`  
**الوصف:** الاسم الأول والأخير

#### **7c. العنوان (منفصل)**
```
http://localhost:3000/sell/contact/address
```
**الملف:** `ContactAddressPage.tsx`  
**الوصف:** المدينة، المنطقة، الرمز البريدي

#### **7d. رقم الهاتف (منفصل)**
```
http://localhost:3000/sell/contact/phone
```
**الملف:** `ContactPhonePage.tsx`  
**الوصف:** رقم الهاتف للتواصل

---

## 📊 التدفق الكامل بالترتيب

```
1. http://localhost:3000/sell
   ↓ اختيار نوع المركبة
   
2. http://localhost:3000/sell/seller-type
   ↓ اختيار نوع البائع
   
3. http://localhost:3000/sell/inserat/car/data
   ↓ بيانات المركبة
   
4. http://localhost:3000/sell/equipment
   ↓ التجهيزات (صفحة رئيسية)
   ├─ http://localhost:3000/sell/equipment/safety
   ├─ http://localhost:3000/sell/equipment/comfort
   ├─ http://localhost:3000/sell/equipment/infotainment
   ├─ http://localhost:3000/sell/equipment/extras
   └─ http://localhost:3000/sell/equipment/unified
   ↓
   
5. http://localhost:3000/sell/images
   ↓ رفع الصور
   
6. http://localhost:3000/sell/pricing
   ↓ تحديد السعر
   
7. http://localhost:3000/sell/contact/unified
   ✅ معلومات الاتصال (نهاية)
```

---

## 🔄 نسخ الموبايل (Mobile Variants)

جميع الصفحات أعلاه لها نسخ محسّنة للموبايل تظهر تلقائياً على الأجهزة المحمولة:

- `MobileVehicleStartPage.tsx`
- `MobileSellerTypePage.tsx`
- `MobileSafetyPage.tsx`
- `MobileComfortPage.tsx`
- `MobileInfotainmentPage.tsx`
- `MobileExtrasPage.tsx`
- `MobileImagesPage.tsx`
- `MobilePricingPage.tsx`
- `MobileContactPage.tsx`

**الروابط تبقى نفسها**، لكن التطبيق يعرض تلقائياً النسخة المناسبة حسب حجم الشاشة.

---

## 🌍 روابط الإنتاج (Production URLs)

عند النشر على الإنتاج، استبدل `http://localhost:3000` برابط الموقع الفعلي:

### مثال:
```
https://globulcars.com/sell
https://globulcars.com/sell/seller-type
https://globulcars.com/sell/inserat/car/data
https://globulcars.com/sell/equipment
https://globulcars.com/sell/images
https://globulcars.com/sell/pricing
https://globulcars.com/sell/contact/unified
```

---

## 🔧 خدمات الدعم (Backend Services)

### **حفظ تلقائي:**
- **الخدمة:** `workflowPersistenceService.ts`
- **الوظيفة:** حفظ البيانات تلقائياً كل 500ms إلى localStorage و Firestore

### **تتبع الخطوات:**
- **الخدمة:** `workflow-analytics-service.ts`
- **الوظيفة:** تتبع تقدم المستخدم، معدلات الإكمال، نقاط الخروج

### **إدارة الحالة:**
- **الخدمة:** `sellWorkflowStepState.ts`
- **الوظيفة:** إدارة حالة كل خطوة (pending/completed/skipped)

### **النظام الموحد:**
- **Hook:** `useUnifiedWorkflow.tsx`
- **الوظيفة:** إدارة البيانات عبر جميع الخطوات، مزامنة مع Firebase

---

## 🐛 المشكلة الحالية

**الصفحة المتأثرة:**
```
http://localhost:3000/sell/inserat/car/data
```

**المشكلة:**
- الأزرار في قسم "Model details" و "Further Information" لا تعمل بشكل صحيح في **وضع سطح المكتب**
- المشكلة تظهر فقط في **الوضع الأفقي (Desktop/Landscape)**
- الوضع العمودي (Mobile/Portrait) يعمل بشكل صحيح ✅

**الأزرار المتأثرة:**
1. Doors (2/3, 4/5, 6/7)
2. Roadworthy (Yes/No)
3. Sale Type (Private/Commercial)
4. Sale Timeline (Don't know/ASAP/Within months)

**الملف:** `VehicleDataPageUnified.tsx` (سطر 1500-1580 تقريباً)

---

## 📝 ملاحظات

- جميع الروابط تستخدم React Router (Client-side routing)
- البيانات تُحفظ تلقائياً عند الانتقال بين الخطوات
- يمكن للمستخدم العودة لأي خطوة سابقة دون فقدان البيانات
- النظام يدعم استئناف التعبئة من حيث توقف المستخدم

---

**آخر تحديث:** 11 ديسمبر 2025  
**المطور:** GitHub Copilot Agent 🤖
