# ⚠️ تنبيهات ونقاط مهمة - يجب قراءتها أولاً!

**أهمية:** 🔴 حرجة  
**الوقت:** 2 دقيقة  

---

## � المتطلبات الإلزامية

### ✅ اللغات الرسمية (MANDATORY)

**اللغات المسموحة فقط:**
- 🇧🇬 **بلغاري (BG)** - اللغة الأساسية
- 🇬🇧 **إنجليزي (EN)** - اللغة الثانية

**ممنوع:**
- ❌ لا عربية (AR) في الإنتاج
- ❌ لا لغات أخرى

**التحقق:**
```typescript
// ✅ صحيح
const supportedLanguages = ['bg', 'en'];

// ❌ خطأ
const languages = ['ar', 'bg', 'en']; // لا تفعل هذا!
```

**الملفات المتأثرة:**
- `src/locales/translations.ts` - يجب أن تحتوي BG و EN فقط
- `useLanguage()` hook - يدعم BG و EN فقط
- localStorage key: `globul-cars-language` - القيم: 'bg' أو 'en'

---

### ✅ الموقع الجغرافي (MANDATORY)

**المشروع في:** 🇧🇬 **جمهورية بلغاريا**

**الآثار:**
- 🗺️ المدن: فقط مدن بلغاريا (Sofia, Plovdiv, Burgas, Varna, إلخ)
- 🏛️ القوانين: تشريعات بلغاريا الأوروبية
- 🏦 البنوك: البنوك البلغارية فقط
- 🚚 التسليم: إلى بلغاريا فقط
- 📞 رقم الاتصال: +359 (رمز بلغاريا)

**الملفات المتأثرة:**
- `src/data/bulgarian-cities.ts` - قائمة مدن بلغاريا
- `src/services/location-service.ts` - التحقق من الموقع
- Firebase Rules - التحقق من الموقع الجغرافي

---

### ✅ العملة (MANDATORY)

**العملة الرسمية:** 💶 **اليورو (EUR)**

**التنسيق:**
```typescript
// ✅ صحيح
const price = 15000; // EUR
const formatted = '15.000,00 BGN'; // عرض بصيغة محلية

// ❌ خطأ
const price = 15000; // ماذا؟ (غير واضح)
const formatted = '15000'; // بدون عملة

// ❌ خطأ جداً
const currency = 'USD'; // نعم؟ لا! اليورو فقط!
```

**معايير:**
- [ ] كل السعر يعرض بـ EUR
- [ ] الفاصل العشري: فاصلة (,) بدلاً من نقطة (.)
- [ ] فاصل الآلاف: نقطة (.) بدلاً من فاصلة (,)
- [ ] مثال: `1.234,56 BGN` ليس `1,234.56 BGN`

**الملفات المتأثرة:**
- `src/utils/currency-formatter.ts` - تنسيق العملة
- `src/constants/pricing.ts` - ثوابت الأسعار
- `src/locales/translations.ts` - نصوص العملة

---

## �🚨 تنبيهات حرجة

### 1️⃣ البيانات الحساسة ⚠️

**تحذير:** عند مشاهرة ملف مستخدم آخر:

```typescript
// ✅ صحيح: إخفاء الإعدادات
if (!isOwnProfile) {
  return <PublicProfileView />;
}

// ❌ خطأ: عرض الإعدادات للزائرين
// لا تفعل هذا أبداً!
```

**النقطة:** إذا كنت تعدّل الكود، تأكد من:
- [ ] Settings مخفي للزائرين
- [ ] البيانات الشخصية محمية
- [ ] لا توجد بيانات sensitive مرئية

---

### 2️⃣ Numeric ID Conversion ⚠️

**التحويل يحدث هنا:**
```
URL: /profile/18
  ↓
useProfile("18")
  ↓
getFirebaseUidByNumericId(18)
  ↓
Firebase UID: "xyz123..."
  ↓
Load Data ✓
```

**إذا كان لديك 404:**
1. تحقق من الـ Firestore (وجود الـ document)
2. تحقق من الـ conversion logic
3. امسح الـ cache وأعد التشغيل

---

### 3️⃣ Context Injection ⚠️

**البيانات تُمرر عبر Outlet:**
```typescript
<Outlet context={{
  user,           // مطلوب
  viewer,         // مطلوب
  isOwnProfile,   // مطلوب
  theme,          // مطلوب
  userCars,       // مطلوب
  refresh,        // مطلوب
  setUser         // مطلوب
}} />
```

**إذا كانت بيانات مفقودة:**
- تحقق من ProfilePageWrapper
- تأكد من أن جميع المتغيرات موجودة
- لا تنسَ أي متغير!

---

### 4️⃣ Firebase Security Rules ⚠️

**تحقق من القواعس:**

```javascript
// يجب أن تكون مثل هذا:
match /numericIds/{uid} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == uid;
}
```

**إذا كان لديك Permission Denied:**
- تحقق من Firebase Rules
- تأكد من أنك مسجل دخول
- تحقق من Firestore Console

---

### 5️⃣ Console Errors ⚠️

**لا تتجاهل الأخطاء الحمراء!**

إذا رأيت أخطاء في Console:
1. اقرأ الرسالة بعناية
2. ابحث عن الملف المذكور
3. أصلح الخطأ قبل الإطلاق

**الأخطاء الشائعة:**
- "Cannot find X" → ملف مفقود
- "Permission denied" → Firebase Rules
- "Undefined is not an object" → متغير مفقود

---

## 🛑 قبل الإطلاق - فحص شامل

### قبل البناء (npm run build):

- [ ] لا توجد أخطاء في Console (F12)
- [ ] جميع الـ Routes تعمل
- [ ] جميع البيانات تظهر
- [ ] Responsive يعمل (جرب F12)
- [ ] الألوان صحيحة (Light + Dark)
- [ ] الترجمات صحيحة (AR + EN + BG)

### قبل النشر (npm run deploy):

- [ ] `npm run build` نجح
- [ ] الـ Build لا يحتوي على أخطاء
- [ ] Firebase Rules آمنة
- [ ] لا توجد API keys معرضة
- [ ] Environment variables صحيحة

---

## 🔐 نقاط أمان حرجة

### 1. لا تنشر API Keys

**❌ خطأ:**
```typescript
const API_KEY = "pk_live_abcdef123456"; // في الكود!
```

**✅ صحيح:**
```typescript
const API_KEY = process.env.REACT_APP_API_KEY; // من .env
```

### 2. Firebase Rules

**تأكد من:**
- [ ] المستخدمون يقرأون بيانتهم فقط
- [ ] لا توجد بيانات عامة sensitive
- [ ] الحذف يتطلب تحقق إضافي

### 3. Passwords و Tokens

**لا تخزن أبداً:**
- [ ] Passwords في Firestore
- [ ] Firebase Admin keys في Frontend
- [ ] API Secrets في الكود

---

## 🐛 أخطاء شائعة - كيفية الاستكشاف

### الخطأ: 404 Not Found

```
http://localhost:3000/profile/18 → 404

الحل:
1. تحقق من Console (F12)
2. ابحث عن numeric ID conversion error
3. تحقق من Firestore (هل الـ document موجود؟)
4. امسح cache: Remove-Item -Path build -Recurse
5. أعد npm start
```

### الخطأ: Data Not Showing

```
الصفحة تحمل لكن البيانات مفقودة

الحل:
1. تحقق من Firebase Console
2. تحقق من البيانات في Firestore
3. تحقق من Console for errors
4. أتأكد من أنك مسجل دخول
```

### الخطأ: Responsive Broken

```
التخطيط مختلف على Mobile

الحل:
1. تحقق من media queries في styles.ts
2. استخدم Chrome DevTools Responsive mode
3. اختبر على أجهزة حقيقية
4. تحقق من CSS units (px vs rem)
```

---

## 📝 الملفات التي لا تعدّل

### ⛔ تجنب تعديل هذه:

1. **Firebase Config** (`firebase-config.ts`)
   - الـ Keys قد تكون خاطئة
   - استخدم .env بدلاً من ذلك

2. **Security Rules** (بحذر)
   - تحقق من impacts قبل التغيير
   - اختبر على emulator أولاً

3. **Database Schema** (بحذر)
   - قد تكسر البيانات القديمة
   - قم بـ migration بعناية

---

## ✅ قائمة التحقق قبل الإطلاق

```
الاختبار:
[ ] npm start يعمل بدون أخطاء
[ ] /profile يحول إلى /profile/18
[ ] جميع الـ Tabs تعمل
[ ] البيانات تظهر صحيحة
[ ] الـ Forms تحفظ البيانات
[ ] الأزرار تعمل (Follow, Message, etc)

الجودة:
[ ] لا توجد console errors
[ ] لا توجد console warnings
[ ] Lighthouse > 90
[ ] لا توجد memory leaks

الأمان:
[ ] لا توجد API keys معرضة
[ ] Firebase Rules آمنة
[ ] البيانات الحساسة محمية
[ ] لا توجد XSS vulnerabilities

الـ Build:
[ ] npm run build نجح
[ ] Build size معقول
[ ] لا توجد أخطاء في Build

الـ Deploy:
[ ] npm run deploy نجح
[ ] الموقع يعمل على الإنتاج
[ ] البيانات تُحمّل صحيحة
[ ] الأداء جيد (< 2s load time)
```

---

## 🆘 إذا واجهت مشكلة

### الخطوات:

1. **اقرأ الخطأ بعناية**
   - Console message يخبرك الكثير

2. **جرّب الـ Basic Fixes:**
   ```bash
   npm install                          # إصلاح المكتبات
   Remove-Item -Path build -Recurse    # مسح الـ cache
   npm start                           # أعد التشغيل
   ```

3. **ابحث في الوثائق:**
   - استخدم Ctrl+F في الملفات

4. **تحقق من Logs:**
   - Firebase Console
   - Browser DevTools Console
   - Browser Network tab

5. **اطلب مساعدة:**
   - اقرأ الملفات المتعلقة
   - اتبع خطوات الاستكشاف

---

## 🎯 ملخص الأشياء المهمة

| الموضوع | المستوى | التفاصيل |
|--------|--------|----------|
| Numeric ID Conversion | 🔴 حرجة | يجب أن يعمل بدقة |
| Context Injection | 🔴 حرجة | جميع البيانات مطلوبة |
| Security Rules | 🔴 حرجة | حماية البيانات الحساسة |
| Error Handling | 🟠 مهمة | التعامل مع الأخطاء |
| Performance | 🟠 مهمة | تحميل سريع |
| Responsive | 🟡 تطوير | تخطيط على جميع الأجهزة |
| Translations | 🟡 تطوير | BG + EN موجودة |

---

## 📞 الدعم السريع

### لكل مشكلة، ابدأ هنا:

| المشكلة | الحل السريع |
|--------|-----------|
| 404 Error | امسح cache، تحقق من Firestore |
| بيانات مفقودة | تحقق من Firebase، تحقق من Console |
| Responsive broken | تحقق من media queries |
| ألوان غريبة | تحقق من CSS variables |
| ترجمات مفقودة | تحقق من translations.ts |
| أداء بطيء | استخدم Lighthouse، تحقق من Network |

---

## 🎉 النقطة الأخيرة

**تذكر:**

```
هذا النظام مُختبر وموثق بعناية.
إذا اتبعت التعليمات:
  → لن تواجه مشاكل
  → الإطلاق سيكون سلس
  → الصيانة ستكون سهلة

جيد الحظ! 🚀
```

---

**اقرأ هذا التنبيه أولاً قبل أي شيء آخر!** ⚠️

