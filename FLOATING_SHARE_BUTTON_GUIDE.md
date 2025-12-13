# FloatingShareButton - دليل زر المشاركة العائم 🎯

## 📋 نظرة عامة

زر مشاركة عائم احترافي بتأثير **القرص الدوار (Spinning Dial)** يظهر في جميع صفحات التطبيق.

---

## 🎨 التصميم والموقع

### الموقع على الشاشة:
- **Desktop:** `bottom: 328px; right: 32px`
- **Mobile:** `bottom: 288px; right: 24px`

### الترتيب العائم (من الأسفل للأعلى):
1. **FloatingAddButton** (أخضر) - زر إضافة إعلان - `bottom: 244px`
2. **FloatingShareButton** (برتقالي) - زر المشاركة (جديد) - `bottom: 328px` ⭐
3. **RobotChatIcon** (أرجواني) - زر الدردشة مع AI - `bottom: 408px`

---

## ✨ المميزات

### 1. **تأثير الدوران (Spinning Dial)**
- عند النقر على الزر، يدور 360 درجة
- تظهر 7 أيقونات Social Media في شكل دائري
- حركة سلسة باستخدام CSS Transform

### 2. **المنصات الاجتماعية**
يدعم المشاركة عبر:
- 🔵 **Facebook** - `45°`
- 🟣 **Instagram** - `90°`
- 🔵 **Twitter/X** - `135°`
- 🔵 **LinkedIn** - `180°`
- 🟢 **WhatsApp** - `225°`
- 🔵 **Telegram** - `270°`
- 🔴 **Email** - `315°`

### 3. **تأثيرات بصرية**
- ✅ حركة طفو (Float Animation) مستمرة
- ✅ تكبير عند Hover على الأيقونات
- ✅ ألوان حدود مخصصة لكل منصة
- ✅ Tooltip ثنائي اللغة (BG/EN)
- ✅ ظل متحرك (Box Shadow)

### 4. **التفاعل**
- **النقر:** يفتح/يغلق قائمة المشاركة
- **Hover:** يظهر Tooltip
- **دوران:** تأثير spinning عند الفتح/الإغلاق
- **الأيقونات:** تنتشر في دائرة نصف قطرها 120px

---

## 🔧 البنية التقنية

### الكود الأساسي:

```typescript
// FloatingShareButton.tsx
import { Share2 } from 'lucide-react';

const socialLinks = [
  { name: 'Facebook', angle: 45, accent: '#1877F2' },
  { name: 'Instagram', angle: 90, accent: '#E1306C' },
  // ... إلخ
];
```

### آلية الدوران:

```typescript
transform: translate(-50%, -50%) 
           rotate(var(--a)) 
           translate(var(--r), 0) 
           rotate(calc(-1 * var(--a)));
```

**الخطوات:**
1. `translate(-50%, -50%)` - وضع الأيقونة في المركز
2. `rotate(var(--a))` - دوران بالزاوية المحددة
3. `translate(var(--r), 0)` - دفع الأيقونة بعيدًا عن المركز
4. `rotate(calc(-1 * var(--a)))` - إلغاء الدوران لتبقى الأيقونة مستقيمة

---

## 📁 الملفات

```
bulgarian-car-marketplace/src/components/
└── FloatingShareButton/
    ├── FloatingShareButton.tsx   (المكون الرئيسي)
    └── index.ts                  (Re-export)
```

**Integration:**
- يتم استيراده في `App.tsx`
- يعمل في جميع الصفحات (Global)
- مستقل عن صفحات البروفايل والسيارات

---

## 🎯 الاستخدام

المكون يعمل تلقائيًا بدون إعدادات:

```tsx
// في App.tsx
<Suspense fallback={null}>
  <FloatingShareButton />
</Suspense>
```

**يشارك:**
- URL الصفحة الحالية (`window.location.href`)
- يفتح نافذة منبثقة للمشاركة
- يتتبع الأحداث في Analytics

---

## 📊 التتبع (Analytics)

```typescript
logger.info('FloatingShareButton toggled', { isActive });
logger.info('Share clicked', { platform, url });
```

---

## 🎨 التخصيص

### تغيير الموقع:
```css
bottom: 328px; /* اضبط هنا */
right: 32px;
```

### تغيير اللون:
```css
background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
```

### تغيير نصف القطر:
```typescript
$r={120} // اضبط المسافة بين الأيقونات والمركز
```

### إضافة منصة جديدة:
```typescript
{
  name: 'Pinterest',
  url: (url) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}`,
  icon: 'https://cdn-icons-png.flaticon.com/512/145/145808.png',
  accent: '#E60023',
  angle: 360 // زاوية جديدة
}
```

---

## 🚀 الأداء

- **Lazy Loaded:** يتم تحميله عند الطلب
- **CSS Animations:** أداء عالي (GPU accelerated)
- **No Re-renders:** State محلي فقط
- **Small Bundle:** ~10KB (gzipped)

---

## ✅ التوافق

- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Mobile (iOS, Android)
- ✅ Responsive (Breakpoints: 768px, 480px)
- ✅ Accessibility (ARIA labels)
- ✅ RTL Support (مع تعديلات بسيطة)

---

## 📝 ملاحظات

1. **استبدل ShareButton القديم:**
   - تم إزالة ShareButton من ProfilePageWrapper
   - تم إزالة ShareButton من CarDetailsGermanStyle
   - الآن المشاركة تتم عبر الزر العائم فقط

2. **موقع ثابت:**
   - يظهر في جميع الصفحات
   - لا يتأثر بالتمرير (Scroll)
   - z-index: 1001 (فوق معظم العناصر)

3. **تحسينات مستقبلية:**
   - [ ] إضافة QR Code للمشاركة
   - [ ] إضافة Copy Link مباشر
   - [ ] تخصيص الرسالة لكل صفحة

---

## 🐛 استكشاف الأخطاء

**الزر لا يظهر؟**
- تأكد من تشغيل الخادم المحلي
- افتح Console للتحقق من الأخطاء
- تأكد من `z-index` عالي بما يكفي

**الأيقونات لا تنتشر؟**
- تحقق من `$active` state
- تأكد من `transition` properties
- افحص CSS variables (`--r`, `--a`)

**الصور لا تظهر؟**
- استخدم CDN بديل (Flaticon, IconFinder)
- أو استبدل بأيقونات SVG محلية

---

## 📚 الموارد

- **Lucide Icons:** https://lucide.dev/icons/share-2
- **Flaticon (Social Icons):** https://www.flaticon.com/
- **CSS Transform Guide:** https://developer.mozilla.org/en-US/docs/Web/CSS/transform

---

**تم الإنشاء:** 13 ديسمبر 2025  
**الإصدار:** 1.0.0  
**الحالة:** ✅ مفعّل ويعمل
