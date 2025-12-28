# 🔐 دليل تدوير المفاتيح - لماذا وكيف؟

## 🎯 الهدف من التدوير

**السيناريو:**
- المفاتيح الحالية **exposed** في Git history (commits قديمة)
- أي شخص وصل للـ repository يمكنه رؤية المفاتيح القديمة
- **الحل:** إنشاء مفاتيح جديدة وإيقاف القديمة

## ✅ ما الذي سيحدث؟

### قبل التدوير:
```
المشروع يعمل بـ: Firebase Key = AIzaSy...abc123
```

### بعد التدوير:
```
1. تنشئ مفتاح جديد في Firebase: AIzaSy...xyz789
2. تحدث .env.local بالمفتاح الجديد
3. المشروع يستمر بالعمل بنفس الطريقة (بس بمفتاح جديد)
4. المفتاح القديم (abc123) يصبح غير صالح
```

## 🔄 خطوات التدوير (بالتفصيل)

### 1️⃣ Firebase Web API Key
```
✅ الوضع الحالي:
   REACT_APP_FIREBASE_API_KEY=AIzaSyAUYM_qygK5pUrlXtdDLmEi-_Kh9SyvRmk

📝 الخطوات:
   1. افتح: https://console.firebase.google.com/
   2. اختر: fire-new-globul
   3. Settings → General → Your apps → Web App
   4. انقر "Add app" (أو استخدم التطبيق الموجود)
   5. انسخ المفتاح الجديد
   6. افتح .env.local واستبدل القيمة القديمة بالجديدة
   7. احفظ الملف
   8. شغّل: npm start (للتأكد أن كل شيء يعمل)

⚠️ ملاحظة: المفتاح القديم سيستمر بالعمل حتى تحذفه من Firebase Console
```

### 2️⃣ Google Maps API Key
```
✅ الوضع الحالي:
   REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyAUYM_qygK5pUrlXtdDLmEi-_Kh9SyvRmk

📝 الخطوات:
   1. افتح: https://console.cloud.google.com/
   2. اختر المشروع المرتبط
   3. APIs & Services → Credentials
   4. انقر "Create Credentials" → API key
   5. Edit الجديد:
      - Application restrictions: HTTP referrers
      - Website restrictions: 
        * https://fire-new-globul.web.app/*
        * https://mobilebg.eu/*
        * http://localhost:3000/*
      - API restrictions: 
        * Maps JavaScript API
        * Places API
        * Geocoding API
   6. انسخ المفتاح الجديد
   7. افتح .env.local واستبدل
   8. احذف المفتاح القديم من Google Cloud Console
```

### 3️⃣ Stripe Keys
```
✅ الوضع الحالي:
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51SaPwf...

📝 الخطوات:
   1. افتح: https://dashboard.stripe.com/
   2. Developers → API keys
   3. انقر "Roll key" على:
      - Secret key (sk_test_...)
      - Publishable key (pk_test_...)
   4. انسخ كلا المفتاحين الجديدين
   5. حدّث في .env.local:
      - REACT_APP_STRIPE_PUBLISHABLE_KEY (للـ frontend)
      - STRIPE_SECRET_KEY (للـ backend/functions)
   6. المفاتيح القديمة تصبح غير صالحة تلقائياً
```

### 4️⃣ DeepSeek API (AI)
```
✅ الوضع الحالي:
   REACT_APP_DEEPSEEK_API_KEY=sk-f301f893f466...

📝 الخطوات:
   1. افتح: https://platform.deepseek.com/
   2. API Keys → Create new key
   3. انسخ المفتاح الجديد
   4. افتح .env.local واستبدل
   5. احذف المفتاح القديم من DeepSeek dashboard
```

### 5️⃣ Firebase Service Account (Backend)
```
✅ الوضع الحالي:
   FIREBASE_SERVICE_ACCOUNT_KEY='{...private_key...}'

📝 الخطوات:
   1. افتح: https://console.firebase.google.com/
   2. Project Settings → Service Accounts
   3. انقر "Generate new private key"
   4. ملف JSON سيُنزّل
   5. افتحه بـ Notepad
   6. احذف جميع المسافات والـ line breaks (اجعله سطر واحد)
   7. استبدل في .env.local:
      FIREBASE_SERVICE_ACCOUNT_KEY='<النص JSON بالكامل>'
   8. احذف الـ Service Account القديم من Firebase
```

## 🧪 الاختبار بعد التدوير

```bash
# 1. اختبر التطوير المحلي
npm start
# تحقق من:
# - تسجيل الدخول يعمل (Firebase Auth)
# - الخريطة تظهر (Google Maps)
# - AI يعمل (DeepSeek)

# 2. اختبر البناء
npm run build

# 3. اختبر النشر
firebase deploy
```

## 📋 Checklist

قبل البدء:
- [ ] خذ backup من كل ملفات .env الحالية
- [ ] تأكد أن لديك وصول لكل Consoles (Firebase, Google Cloud, Stripe, etc.)

أثناء التدوير:
- [ ] Firebase Web API Key
- [ ] Google Maps API Key
- [ ] Stripe Keys (Secret + Publishable)
- [ ] DeepSeek API Key
- [ ] Firebase Service Account Key
- [ ] Facebook App Secret (إذا مستخدم)
- [ ] Algolia API Key (إذا مستخدم)

بعد التدوير:
- [ ] اختبار محلي (npm start)
- [ ] اختبار البناء (npm run build)
- [ ] تحديث GitHub Secrets
- [ ] نشر للإنتاج (firebase deploy)
- [ ] حذف المفاتيح القديمة من كل Console

## ⏱️ الوقت المتوقع

- Firebase: 3-5 دقائق
- Google Maps: 5-7 دقائق
- Stripe: 2-3 دقائق
- DeepSeek: 2 دقيقة
- Service Account: 3-5 دقائق

**المجموع:** 15-25 دقيقة

## 🎯 النتيجة النهائية

- ✅ مفاتيح جديدة آمنة (غير exposed)
- ✅ المشروع يعمل بنفس الطريقة
- ✅ المفاتيح القديمة معطلة (لا يمكن استخدامها)
- ✅ Git history لم يعد يحتوي على مفاتيح صالحة

## ❓ أسئلة شائعة

**س: هل سيتوقف الموقع عن العمل؟**
ج: لا! بمجرد تحديث .env.local بالمفاتيح الجديدة، كل شيء يعمل.

**س: هل يجب تدوير كل المفاتيح دفعة واحدة؟**
ج: لا، يمكنك تدويرها واحداً تلو الآخر. لكن **Firebase أولاً** لأنه الأهم.

**س: ماذا لو نسيت تحديث مفتاح؟**
ج: المشروع سيظهر خطأ عند محاولة استخدام الخدمة (مثلاً: Maps لن تعمل).

**س: هل المفاتيح الموجودة في .env.local حالياً آمنة؟**
ج: الملف نفسه آمن (محلي فقط)، لكن **القيم داخله** exposed في Git history.

---

**💡 نصيحة:** ابدأ بـ Firebase لأنه الأهم. إذا نجح، باقي المفاتيح سهلة!
