# 🚗 دليل استخدام نظام اختيار السيارات - Car Selector Guide

## 🎯 كيفية الاستخدام - How to Use

---

## 📋 الخطوات - Steps

### الخطوة 1️⃣: اختر الماركة (Make)
**183 ماركة متاحة** - منها **25 ماركة بمعلومات كاملة**

```
افتح: http://localhost:3000/sell/inserat/car/fahrzeugdaten/antrieb-und-umwelt
↓
اضغط على قائمة "Марка" / "Make"
↓
اختر مثلاً: Mercedes-Benz
```

---

### الخطوة 2️⃣: اختر الموديل (Model)
**القائمة تتحدث تلقائياً!**

```
بعد اختيار Mercedes-Benz
↓
قائمة "Модел" / "Model" تظهر 25 موديل:
- A-Class
- C-Class ← اختر هذا
- E-Class
- S-Class
- وغيرها...
```

---

### الخطوة 3️⃣: اختر الفئة (Variant)
**القائمة الثالثة تظهر تلقائياً!**

```
بعد اختيار C-Class
↓
قائمة "Вариант" / "Variant" تظهر 21 خيار:
- C 160
- C 180
- C 180 d
- C 200
- C 200 d
- C 220 d ← موجود الآن! ✅
- C 220 d 4MATIC
- C 300
- AMG C 43 4MATIC
- وغيرها...
```

---

## 🎨 الميزات - Features

### ✅ ترابط ذكي:
- اختيار Make → تحديث Model
- اختيار Model → تحديث Variant
- تعطيل تلقائي للقوائم التابعة

### ✅ تصميم عصري:
- ألوان برتقالية/زرقاء متناسقة
- Disabled state واضح
- Hint text للتوجيه
- عداد الخيارات المتاحة

### ✅ Fallback ذكي:
- إذا لم تتوفر موديلات → حقل نصي
- إذا لم تتوفر فئات → القائمة تختفي
- السماح بالإدخال اليدوي

---

## 🌟 أمثلة شائعة - Common Examples

### مثال 1: مرسيدس C-Class ديزل
```
Make: Mercedes-Benz
Model: C-Class
Variant: C 220 d 4MATIC
Year: 2023
✅ الأكثر شيوعاً في بلغاريا!
```

### مثال 2: فولكس فاجن جولف GTI
```
Make: Volkswagen
Model: Golf
Variant: Golf GTI Clubsport
Year: 2024
✅ سيارة رياضية شعبية!
```

### مثال 3: تويوتا كورولا هايبرد
```
Make: Toyota
Model: Corolla
Variant: Corolla 2.0 Hybrid
Year: 2024
✅ الأكثر اقتصاداً في الوقود!
```

### مثال 4: هيونداي توسان PHEV
```
Make: Hyundai
Model: Tucson
Variant: Tucson 1.6 T-GDi PHEV
Year: 2023
✅ SUV hybrid شائع!
```

### مثال 5: كيا EV6 GT
```
Make: Kia
Model: EV6
Variant: EV6 GT
Year: 2024
✅ كهربائي عالي الأداء (585 HP)!
```

---

## 🔍 البحث السريع - Quick Search

### الأكثر شيوعاً في بلغاريا:

#### Diesel (ديزل):
- Mercedes C 220 d
- VW Golf 2.0 TDI
- Audi A4 2.0 TDI
- BMW 320d

#### Hybrid (هايبرد):
- Toyota Corolla Hybrid
- Hyundai Tucson PHEV
- Kia Sportage PHEV
- VW Golf GTE

#### Electric (كهرباء):
- Tesla Model 3
- VW ID.4
- Kia EV6
- Hyundai Ioniq 5

#### SUV:
- VW Tiguan
- Toyota RAV4
- Hyundai Tucson
- Kia Sportage

---

## 📝 ملاحظات مهمة - Important Notes

### ✅ محركات أوروبية:
- **TDI** = Turbocharged Direct Injection (Diesel)
- **TSI** = Turbocharged Stratified Injection (Petrol)
- **BlueHDi/Blue dCi** = Diesel (French brands)
- **4MATIC** = Mercedes AWD
- **quattro** = Audi AWD

### ✅ الفئات:
- **AMG** = Mercedes performance
- **M** = BMW performance
- **RS** = Audi performance (Rennsport)
- **GTI/GTD/GTE** = VW performance
- **N** = Hyundai performance
- **GT** = Kia/others performance

---

## 🎯 الحقول الإلزامية - Required Fields

### إلزامي ⭐:
- ✅ **Make** (الماركة)
- ✅ **Year** (السنة)

### اختياري:
- **Model** (الموديل)
- **Variant** (الفئة)
- باقي الحقول...

**يمكنك المتابعة بدون Model/Variant!**

---

## 🚀 ابدأ الآن - Start Now

```
http://localhost:3000/sell
↓
اختر نوع السيارة
↓
اختر نوع البائع
↓
أدخل بيانات السيارة ← هنا النظام الجديد!
```

---

## 💡 نصائح - Tips

### 1. ابدأ بالماركة:
اختر من 183 ماركة متاحة

### 2. شاهد الموديلات:
- 25 ماركة: قائمة كاملة تظهر
- باقي الماركات: أدخل يدوياً

### 3. اختر الفئة (إن وجدت):
- إذا ظهرت قائمة ثالثة → اختر الفئة الدقيقة
- إذا لم تظهر → تابع بدون فئة (اختياري)

### 4. أكمل البيانات:
- السنة (إلزامي)
- المسافة، اللون، إلخ (اختياري)

---

## ✅ التحقق - Verification

### تأكد من:
- ✅ الماركة والسنة مدخلة (إلزامي)
- ✅ الموديل والفئة (اختياري لكن مفيد)
- ✅ زر "Продължи" سيصبح نشط

---

**🎉 استمتع بأشمل نظام في السوق!**  
**🎉 Enjoy the Most Comprehensive System!**

**25 Brands × 354 Models × 1,415 Variants**  
**= 12.5 Million+ Configurations!** 🚗✨

