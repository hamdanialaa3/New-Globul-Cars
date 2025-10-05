# تخصيص زر/أيقونة Top Brands
# Top Brands Button Customization Guide

---

## 🎯 النص والأيقونة الحالية

### ما سيراه المستخدمون في الهيدر:

```
🚗 Top Brands ▼       (English)
🚗 Топ марки ▼        (Bulgarian)
```

---

## 📍 موقع الزر في الكود

الزر موجود في: `src/components/TopBrands/TopBrandsMenu.tsx`

```tsx
<button className="top-brands-trigger">
  {/* الأيقونة */}
  <svg>...</svg>
  
  {/* النص */}
  <span>{t.topBrands}</span>
  
  {/* السهم */}
  <svg className="arrow">...</svg>
</button>
```

---

## 🎨 خيارات الأيقونات

### ✅ الأيقونة الحالية: سيارة 🚗

```tsx
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
  <path d="M5 17h14v-5l-3-4H8l-3 4v5zm0 0v2m14-2v2M7 11h10M9 14h6" strokeWidth="2"/>
</svg>
```

**النتيجة:** 🚗 Top Brands ▼

---

### الخيار 2: أيقونة قائمة (3 خطوط)

```tsx
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
  <path d="M3 12h18M3 6h18M3 18h18" strokeWidth="2" strokeLinecap="round"/>
</svg>
```

**النتيجة:** ☰ Top Brands ▼

---

### الخيار 3: أيقونة ماركات/شعار

```tsx
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
  <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2"/>
  <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2"/>
  <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2"/>
  <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="2"/>
</svg>
```

**النتيجة:** ⊞ Top Brands ▼

---

### الخيار 4: أيقونة نجمة (للمفضلة)

```tsx
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeWidth="2" strokeLinejoin="round"/>
</svg>
```

**النتيجة:** ⭐ Top Brands ▼

---

### الخيار 5: أيقونة بحث/عدسة

```tsx
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
  <circle cx="11" cy="11" r="8" strokeWidth="2"/>
  <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
</svg>
```

**النتيجة:** 🔍 Top Brands ▼

---

### الخيار 6: أيقونة شبكة/grid

```tsx
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
  <rect x="3" y="3" width="8" height="8" strokeWidth="2"/>
  <rect x="3" y="13" width="8" height="8" strokeWidth="2"/>
  <rect x="13" y="3" width="8" height="8" strokeWidth="2"/>
  <rect x="13" y="13" width="8" height="8" strokeWidth="2"/>
</svg>
```

**النتيجة:** ⊟ Top Brands ▼

---

### الخيار 7: بدون أيقونة (نص فقط)

```tsx
<button className="top-brands-trigger">
  <span>{t.topBrands}</span>
  <svg className="arrow">...</svg>
</button>
```

**النتيجة:** Top Brands ▼

---

## 📝 تغيير النص

### النص الحالي

في `locales/brands.i18n.json`:

```json
{
  "en": {
    "topBrands": "Top Brands"
  },
  "bg": {
    "topBrands": "Топ марки"
  }
}
```

### خيارات النص البديلة

#### الخيار 1: "Browse Brands"
```json
{
  "en": {
    "topBrands": "Browse Brands"
  },
  "bg": {
    "topBrands": "Разглеждане на марки"
  }
}
```

#### الخيار 2: "Car Brands"
```json
{
  "en": {
    "topBrands": "Car Brands"
  },
  "bg": {
    "topBrands": "Марки автомобили"
  }
}
```

#### الخيار 3: "All Brands"
```json
{
  "en": {
    "topBrands": "All Brands"
  },
  "bg": {
    "topBrands": "Всички марки"
  }
}
```

#### الخيار 4: "Brands"
```json
{
  "en": {
    "topBrands": "Brands"
  },
  "bg": {
    "topBrands": "Марки"
  }
}
```

---

## 🎨 تغيير الشكل والتصميم

### 1. تكبير الأيقونة والنص

في `src/components/TopBrands/TopBrandsMenu.css`:

```css
.top-brands-trigger {
  font-size: 16px;        /* بدلاً من 15px */
  padding: 12px 20px;     /* بدلاً من 10px 16px */
}

.top-brands-trigger svg {
  width: 24px;            /* بدلاً من 20px */
  height: 24px;
}
```

---

### 2. تغيير اللون

```css
.top-brands-trigger {
  color: #2563eb;         /* أزرق */
}

.top-brands-trigger:hover {
  color: #1d4ed8;         /* أزرق داكن */
  background: #eff6ff;    /* خلفية زرقاء فاتحة */
}
```

---

### 3. إضافة خلفية ملونة

```css
.top-brands-trigger {
  background: #2563eb;    /* خلفية زرقاء */
  color: white;           /* نص أبيض */
  border-radius: 8px;
}

.top-brands-trigger:hover {
  background: #1d4ed8;
}
```

---

### 4. إضافة حدود (Border)

```css
.top-brands-trigger {
  border: 2px solid #2563eb;
  border-radius: 8px;
}

.top-brands-trigger:hover {
  background: #2563eb;
  color: white;
}
```

---

## 🎯 أمثلة كاملة للأنماط

### النمط 1: زر بسيط وواضح

```tsx
// في TopBrandsMenu.tsx
<button className="top-brands-trigger">
  <svg width="20" height="20" viewBox="0 0 24 24">
    {/* أيقونة سيارة */}
  </svg>
  <span>{t.topBrands}</span>
  <svg className="arrow">...</svg>
</button>
```

```css
/* في TopBrandsMenu.css */
.top-brands-trigger {
  padding: 10px 16px;
  font-size: 15px;
  font-weight: 500;
  color: #111827;
}
```

**النتيجة:** 🚗 Top Brands ▼ (نمط بسيط)

---

### النمط 2: زر بارز بخلفية

```css
.top-brands-trigger {
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 600;
  background: #2563eb;
  color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

.top-brands-trigger:hover {
  background: #1d4ed8;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}
```

**النتيجة:** زر أزرق مع ظل

---

### النمط 3: زر بحدود (Outlined)

```css
.top-brands-trigger {
  padding: 10px 16px;
  font-size: 15px;
  font-weight: 500;
  background: transparent;
  color: #2563eb;
  border: 2px solid #2563eb;
  border-radius: 8px;
}

.top-brands-trigger:hover {
  background: #2563eb;
  color: white;
}
```

**النتيجة:** زر بحدود زرقاء

---

### النمط 4: زر مدمج في الهيدر

```css
.top-brands-trigger {
  padding: 8px 12px;
  font-size: 14px;
  background: transparent;
  color: inherit;
}

.top-brands-trigger:hover {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
}
```

**النتيجة:** زر شفاف يندمج مع الهيدر

---

## 🔧 كيف تطبق التغييرات؟

### الخطوة 1: تغيير الأيقونة

افتح `src/components/TopBrands/TopBrandsMenu.tsx`:

```tsx
// ابحث عن هذا السطر (حوالي السطر 39-42)
<svg width="20" height="20" viewBox="0 0 24 24">
  {/* استبدل المسار هنا */}
</svg>
```

واستبدل بالأيقونة التي تريدها من الأعلى.

---

### الخطوة 2: تغيير النص

افتح `locales/brands.i18n.json`:

```json
{
  "en": {
    "topBrands": "النص الجديد بالإنجليزية"
  },
  "bg": {
    "topBrands": "النص الجديد بالبلغارية"
  }
}
```

---

### الخطوة 3: تغيير التصميم

افتح `src/components/TopBrands/TopBrandsMenu.css`:

```css
/* ابحث عن .top-brands-trigger */
.top-brands-trigger {
  /* غيّر الخصائص هنا */
  background: #your-color;
  color: white;
  /* ... */
}
```

---

## 🎨 أمثلة حسب النمط

### نمط Mobile.de الأصلي (الحالي)

```tsx
// أيقونة سيارة + نص بسيط
🚗 Top Brands ▼
```

```css
.top-brands-trigger {
  padding: 10px 16px;
  background: transparent;
  color: inherit;
}
```

---

### نمط معرض السيارات

```tsx
// أيقونة شبكة + خلفية زرقاء
⊟ Browse Cars ▼
```

```css
.top-brands-trigger {
  background: #2563eb;
  color: white;
  border-radius: 8px;
  padding: 12px 20px;
}
```

---

### نمط أنيق ومميز

```tsx
// أيقونة نجمة + حدود
⭐ Featured Brands ▼
```

```css
.top-brands-trigger {
  border: 2px solid #f59e0b;
  color: #f59e0b;
  border-radius: 8px;
}

.top-brands-trigger:hover {
  background: #f59e0b;
  color: white;
}
```

---

## ✅ التوصيات

### للمشروع البلغاري (Globul Cars):

#### الخيار 1: نمط مباشر وواضح ✨ (موصى به)
```tsx
🚗 Топ марки ▼
```
- أيقونة سيارة (الحالي)
- نص "Топ марки"
- تصميم بسيط

**لماذا؟** واضح ومباشر للمستخدمين البلغاريين

---

#### الخيار 2: نمط عصري
```tsx
⊞ Марки ▼
```
- أيقونة شبكة
- نص أقصر "Марки"
- خلفية ملونة

**لماذا؟** عصري وجذاب

---

#### الخيار 3: نمط كلاسيكي
```tsx
☰ Разглеждане на марки ▼
```
- أيقونة قائمة
- نص وصفي
- تصميم بسيط

**لماذا؟** مألوف ومعروف

---

## 🎯 النصيحة النهائية

**الأفضل:** ابقِ على التصميم الحالي! 👍

```tsx
🚗 Top Brands ▼      (EN)
🚗 Топ марки ▼       (BG)
```

**لماذا؟**
- ✅ واضح ومباشر
- ✅ أيقونة مناسبة (سيارة)
- ✅ نص قصير وسهل
- ✅ مستوحى من mobile.de
- ✅ يعمل بشكل ممتاز

**لكن** إذا أردت التغيير، اختر من الخيارات أعلاه! 🎨

---

## 📞 ملاحظات إضافية

### في الموبايل

الزر يتكيف تلقائياً:

```
Desktop:  🚗 Top Brands ▼
Mobile:   🚗 Марки ▼     (نص أقصر)
```

يمكنك التحكم بهذا في CSS:

```css
@media (max-width: 768px) {
  .top-brands-trigger span {
    display: none; /* إخفاء النص */
  }
  
  /* أو نص أقصر */
  .top-brands-trigger span::after {
    content: "Brands";
  }
}
```

---

**تم! الآن لديك جميع الخيارات للتخصيص! 🎨**

















