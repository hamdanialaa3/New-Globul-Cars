# 🚀 دليل الإعداد السريع - Google Maps

## ⚡ خطوتان فقط!

### الخطوة 1️⃣: احصل على API Key

1. اذهب إلى: https://console.cloud.google.com/
2. أنشئ مشروع جديد (أو استخدم موجود)
3. فعّل **Maps JavaScript API**
4. اذهب إلى **Credentials** > **Create API Key**
5. انسخ الـ API Key

### الخطوة 2️⃣: أضف API Key للمشروع

**أنشئ ملف `.env` في مجلد المشروع:**

```bash
cd bulgarian-car-marketplace
```

**أنشئ الملف يدوياً أو بالأمر:**

**Windows (PowerShell):**
```powershell
"REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE" | Out-File -FilePath .env -Encoding utf8
```

**أو يدوياً:**
1. أنشئ ملف اسمه `.env` في المجلد `bulgarian-car-marketplace`
2. اكتب بداخله:
```
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

### الخطوة 3️⃣: شغّل المشروع

```bash
npm start
```

---

## ✅ النتيجة

الآن ستظهر خريطة Google Maps التفاعلية مع جميع المدن البلغارية! 🗺️

---

## 🔧 إذا لم تعمل

### تأكد من:
- ✅ ملف `.env` موجود في مجلد `bulgarian-car-marketplace`
- ✅ API Key صحيح (بدون مسافات)
- ✅ أعدت تشغيل `npm start` بعد إنشاء `.env`

### إذا ظهرت رسالة API Key:
- هذا طبيعي! الخريطة ستعمل بعد إضافة الـ Key
- القسم سيظهر بشكل طبيعي مع قائمة المدن

---

## 💰 مجاني؟

نعم! Google Maps تعطيك:
- **$200 رصيد مجاني شهرياً**
- **~28,000 تحميل خريطة مجاناً**
- كافي لـ **~900 زائر يومياً**

---

**جاهز! 🎉**


