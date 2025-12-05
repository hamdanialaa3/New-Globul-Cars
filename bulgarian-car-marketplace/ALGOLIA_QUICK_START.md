# ⚡ Algolia Quick Start - 3 خطوات فقط!

## 🎯 ابدأ في 3 دقائق:

---

## خطوة 1️⃣: أنشئ ملف `.env.local`

**المكان:** `bulgarian-car-marketplace/.env.local`

**انسخ هذا:**
```env
VITE_ALGOLIA_APP_ID=RTGDK12KTJ
VITE_ALGOLIA_SEARCH_KEY=01d60b828b7263114c11762ff5b7df9b
```

**كيف؟**
1. في VS Code، انقر بزر الماوس الأيمن على مجلد `bulgarian-car-marketplace`
2. اختر "New File"
3. اسمه: `.env.local`
4. الصق المحتوى
5. احفظ (Ctrl+S)

---

## خطوة 2️⃣: أنشئ ملف `functions/.env`

**المكان:** `functions/.env`

**انسخ هذا:**
```env
ALGOLIA_APP_ID=RTGDK12KTJ
ALGOLIA_ADMIN_KEY=09fbf48591c637634df71d89843c55c0
```

**كيف؟**
1. افتح مجلد `functions`
2. أنشئ ملف: `.env`
3. الصق المحتوى
4. احفظ

---

## خطوة 3️⃣: شغّل الموقع

**في Terminal:**
```bash
npm run dev
```

**افتح المتصفح:**
```
http://localhost:3000/search
```

---

## 🎉 انتهيت!

**الآن لديك:**
- ✅ بحث سريع جداً
- ✅ 9 فلاتر متقدمة
- ✅ ترتيب ذكي
- ✅ واجهة احترافية

---

## 🔄 المزامنة (اختياري):

لمزامنة السيارات الموجودة:

```bash
cd functions
npm install algoliasearch
firebase deploy --only functions
```

ثم افتح:
```
http://localhost:3000/admin/algolia
```

اضغط: **Sync All Cars**

---

## ❓ مشكلة؟

### "No results found"
**الحل:** نفّذ المزامنة من `/admin/algolia`

### "Algolia not configured"
**الحل:** تأكد من إنشاء `.env.local` بشكل صحيح

### Functions errors
**الحل:** تأكد من `functions/.env` موجود

---

**هذا كل شيء! استمتع بالبحث السريع! 🚀**

