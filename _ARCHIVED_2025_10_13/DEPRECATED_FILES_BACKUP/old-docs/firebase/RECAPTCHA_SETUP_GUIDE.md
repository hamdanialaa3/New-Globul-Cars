# إعداد reCAPTCHA و App Check للمشروع

## المشكلة
لم يتم إعداد reCAPTCHA في Firebase Console، لذلك لا يوجد Site Key متاح.

## الحل: إعداد reCAPTCHA في Firebase Console

### الخطوة 1: تفعيل reCAPTCHA Enterprise API
1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. اختر مشروعك: "New Globul Cars"
3. من القائمة الجانبية: **APIs & Services** → **Library**
4. ابحث عن "reCAPTCHA Enterprise API"
5. اضغط **Enable**

### الخطوة 2: إعداد reCAPTCHA في Firebase Console
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك: "New Globul Cars"
3. من القائمة الجانبية: **App Check**
4. اضغط على **Get started**
5. اختر **reCAPTCHA** كمزود
6. اضغط **Register reCAPTCHA Enterprise**
7. املأ البيانات:
   - **Display name**: "Globul Cars reCAPTCHA"
   - **Domains**: أضف domain موقعك (مثل: `studio-448742006-a3493.web.app`)
   - **Type**: اختر "Score-based" أو "Checkbox" حسب الحاجة
8. اضغط **Create key**

### الخطوة 3: الحصول على Site Key
بعد إنشاء المفتاح، ستجد:
- **Site Key**: هذا هو المفتاح المطلوب (يبدأ بـ "6L")
- **Secret Key**: احفظه في مكان آمن (لا تضعه في الكود)

### الخطوة 4: إضافة Site Key إلى المشروع
1. افتح ملف `.env` في مجلد المشروع
2. استبدل هذا السطر:
```env
REACT_APP_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
```
بـ:
```env
REACT_APP_RECAPTCHA_SITE_KEY=6LXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### الخطوة 5: إضافة Debug Tokens (اختياري للتطوير)
1. في Firebase Console → App Check → Apps
2. بجانب تطبيقك: اضغط ⋮ → **Manage debug tokens**
3. اضغط **Add debug token**
4. ألصق أي من الرموز التي حصلت عليها من Developer Console

## التحقق من الإعداد
1. شغل المشروع: `npm start`
2. افتح Developer Console (F12)
3. يجب أن ترى رسائل App Check بدون أخطاء

## ملاحظات مهمة
- **لا تشارك Site Key** مع أي شخص
- **لا تضع Secret Key** في الكود العام
- Site Key آمن للاستخدام في الكود الأمامي
- Secret Key يُستخدم فقط في الخادم

## استكشاف الأخطاء
إذا ظهرت أخطاء:
1. تأكد من تفعيل reCAPTCHA Enterprise API في Google Cloud
2. تأكد من إضافة domain موقعك في إعدادات reCAPTCHA
3. تأكد من صحة Site Key في ملف `.env`