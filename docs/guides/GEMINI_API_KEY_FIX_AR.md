# 🔑 حل مشكلة API Key غير صالح - Gemini AI

## المشكلة
```
API key not valid. Please pass a valid API key.
```

المفتاح الحالي `AIzaSyCeOj0W6Zf8aHkQ7vEcW-JLz8n_4bO_aV5` غير صالح أو منتهي الصلاحية.

---

## ✅ الحل (3 خطوات بسيطة)

### 1️⃣ الحصول على مفتاح API صالح

**انتقل إلى Google AI Studio:**
```
https://aistudio.google.com/apikey
```

**خطوات:**
1. سجل دخول بحساب Google
2. اضغط على "Create API key"
3. اختر مشروع Firebase الخاص بك: `fire-new-globul`
4. انسخ المفتاح (يبدأ بـ `AIza...`)

---

### 2️⃣ تحديث المفتاح في Firebase

**طريقة سريعة (استخدم السكريبت):**
```powershell
.\scripts\update-gemini-key.ps1 "YOUR_NEW_API_KEY_HERE"
```

**أو يدوياً:**
```bash
firebase functions:config:set gemini.key="YOUR_NEW_API_KEY_HERE"
```

---

### 3️⃣ نشر التحديث

```bash
firebase deploy --only functions:geminiChat
```

انتظر حتى ينتهي النشر (~30 ثانية)

---

## 🧪 اختبار

1. افتح الموقع في المتصفح
2. اضغط على زر AI Chat (الأيقونة البنفسجية أسفل اليمين)
3. اكتب رسالة واضغط Enter
4. يجب أن تحصل على رد من Gemini AI ✨

---

## 📊 حدود الاستخدام

| نوع المستخدم | الرسائل اليومية |
|--------------|-----------------|
| ضيف (غير مسجل) | 3 رسائل |
| مسجل دخول | 10 رسائل |

---

## 🔍 التحقق من الحالة

**للتحقق من المفتاح الحالي:**
```bash
firebase functions:config:get
```

**لعرض سجلات الدالة:**
```bash
firebase functions:log
```

---

## 🆘 إذا استمرت المشكلة

1. تأكد من أن المفتاح يبدأ بـ `AIza`
2. تأكد من أن المفتاح لم يُحذف من Google AI Studio
3. تحقق من القيود على المفتاح (API restrictions) في Google Cloud Console
4. جرب إنشاء مفتاح جديد

---

## 📝 ملاحظات مهمة

✅ **المصادقة تعمل الآن** - الضيوف والمستخدمين المسجلين يمكنهم استخدام AI Chat
❌ **المفتاح غير صالح** - هذه المشكلة الوحيدة المتبقية

بمجرد تحديث المفتاح، سيعمل كل شيء! 🎉
