# ⚠️ Symlink مطلوب - Symlink Required

## 📋 الوضع الحالي

تم إرجاع imports في `App.tsx` للـ local paths مؤقتاً لإعادة المشروع للعمل.

**السبب**: ModuleScopePlugin لا يزال يمنع imports من خارج `src/` رغم جميع محاولات إزالته في `craco.config.js`.

---

## ✅ الحل الوحيد الموثوق: Symlink

### الخطوات:

1. **شغّل `RUN_SYMLINK.bat` كمسؤول**
   - Right-click → Run as administrator
   - انتظر حتى يظهر "✅ SUCCESS!"

2. **أعد تشغيل dev server**
   ```bash
   cd bulgarian-car-marketplace
   npm start
   ```

3. **بعد التأكد من أن symlink يعمل، غيّر imports في App.tsx**:
   ```typescript
   // من:
   import { LanguageProvider } from './contexts/LanguageContext';
   
   // إلى:
   import { LanguageProvider } from '@globul-cars/core/contexts/LanguageContext';
   ```

---

## 🔍 التحقق من Symlink

بعد إنشاء symlink، تحقق:

```cmd
cd bulgarian-car-marketplace\node_modules
dir "@globul-cars"
```

يجب أن ترى:
```
<SYMLINK>     @globul-cars [..\..\packages]
```

---

## 📝 ملاحظات

- **المشروع يعمل الآن** مع local imports ✅
- **Symlink مطلوب** لاستخدام `@globul-cars/core` imports
- **بعد إنشاء symlink**، يمكن تحديث imports في App.tsx

---

## 🚀 الخطوة التالية

1. شغّل `RUN_SYMLINK.bat` كمسؤول
2. أعد تشغيل dev server
3. إذا عمل symlink، غيّر imports في App.tsx للـ `@globul-cars/core`

