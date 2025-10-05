# 🖼️ تحديث الشعار - دليل التنفيذ

## 📋 الخطوات المطلوبة:

### 1. إضافة الشعار الجديد:
```bash
# انقل الصورة المرفقة إلى:
C:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\public\logo-new.png
```

### 2. تحديث المراجع في الكود:

#### في `src/components/Header.tsx`:
```tsx
// غير هذا السطر:
<img src="/logo.png" alt="Globul Cars Logo" style={{ height: '140px' }} />

// إلى:
<img src="/logo-new.png" alt="Globul Cars Logo" style={{ height: '140px' }} />
```

#### في `public/manifest.json`:
```json
{
  "icons": [
    {
      "src": "/logo-new.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/logo-new.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### في `public/index.html`:
```html
<link rel="icon" href="/logo-new.png" />
```

### 3. إنشاء أحجام مختلفة للشعار:
```bash
# إنشاء أيقونات بأحجام مختلفة
# 192x192 للـ PWA
# 512x512 للـ PWA
# 32x32 للـ favicon
```

## 🎯 الملفات التي تحتاج تحديث:

### المكونات:
- ✅ `src/components/Header.tsx` - الشعار الرئيسي
- ✅ `src/components/Footer.tsx` - شعار الفوتر
- ✅ `src/pages/HomePage.tsx` - شعار الصفحة الرئيسية

### ملفات PWA:
- ✅ `public/manifest.json` - أيقونات التطبيق
- ✅ `public/index.html` - أيقونة المتصفح

### ملفات أخرى:
- ✅ `src/components/ThemePreview.tsx` - معاينة الثيم
- ✅ أي مكان آخر يستخدم الشعار

## 🚀 بعد إضافة الشعار:

1. **أعد تشغيل الخادم:**
```bash
npm start
```

2. **تحقق من:**
   - الشعار في الهيدر
   - الشعار في الفوتر
   - أيقونة المتصفح
   - أيقونات PWA

3. **اختبر على:**
   - المتصفح العادي
   - الهاتف المحمول
   - وضع PWA

---

**📝 ملاحظة:** تأكد من أن الشعار بصيغة PNG مع خلفية شفافة لأفضل النتائج!