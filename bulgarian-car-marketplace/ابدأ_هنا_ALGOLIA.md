# 🚀 كيف تبدأ مع Algolia - 3 خطوات

## ✅ كل شيء جاهز! فقط 3 خطوات:

---

## 1️⃣ أنشئ ملف بالمفاتيح

**في مجلد:** `bulgarian-car-marketplace`  
**اسم الملف:** `.env.local`

**انسخ والصق:**
```
VITE_ALGOLIA_APP_ID=RTGDK12KTJ
VITE_ALGOLIA_SEARCH_KEY=01d60b828b7263114c11762ff5b7df9b
```

**احفظ الملف** ✅

---

## 2️⃣ شغّل الموقع

في Terminal:
```bash
npm run dev
```

---

## 3️⃣ جرّب البحث

افتح المتصفح:
```
http://localhost:3000/search
```

**اكتب:** BMW  
**✅ النتائج تظهر فوراً!**

---

## 🎉 انتهيت!

الآن لديك:
- ⚡ بحث سريع جداً
- 🎯 9 فلاتر متقدمة
- 📊 5 خيارات ترتيب
- 🎨 واجهة احترافية

---

## 🔄 اختياري: المزامنة التلقائية

إذا أردت مزامنة السيارات الموجودة:

### خطوة إضافية 1:
**أنشئ:** `functions/.env`

**المحتوى:**
```
ALGOLIA_APP_ID=RTGDK12KTJ
ALGOLIA_ADMIN_KEY=09fbf48591c637634df71d89843c55c0
```

### خطوة إضافية 2:
```bash
cd functions
npm install algoliasearch
firebase deploy --only functions
```

### خطوة إضافية 3:
```
افتح: http://localhost:3000/admin/algolia
اضغط: Sync All Cars
✅ تمت المزامنة!
```

---

## 📚 للمزيد:

- **دليل سريع:** `ALGOLIA_QUICK_START.md`
- **دليل كامل:** `ALGOLIA_SETUP.md`
- **الملخص الشامل:** `ALGOLIA_COMPLETE_SUMMARY.md`

---

**🎊 مبروك! نظام البحث جاهز!**

