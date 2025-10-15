# ✅ Checklist إعداد Facebook مع Firebase

**التاريخ:** 13 أكتوبر 2025  
**المشروع:** Globul Cars

---

## 📋 الخطوات المطلوبة

### ✅ 1. إعدادات Facebook App (مكتملة)

- [x] **App ID:** 1780064479295175
- [x] **App Secret:** e762759ee883c3cbc256779ce0852e90
- [x] **Display Name:** BG Cars FC APP
- [x] **App Domains:**
  - [x] localhost
  - [x] mobilebg.eu
  - [x] globul.net
  - [x] fire-new-globul.firebaseapp.com
- [x] **Privacy Policy URL:** https://mobilebg.eu/privacy-policy
- [x] **Terms of Service URL:** https://mobilebg.eu/terms-of-service
- [x] **Data Deletion URL:** https://fire-new-globul.web.app/data-deletion

---

### ⏳ 2. OAuth Redirect URIs (يحتاج تحديث)

**في Facebook App → Use Cases → Authentication → Settings:**

#### محددات URI لإعادة توجيه OAuth الصالحة:

أضف هذه العناوين:
```
[ ] https://fire-new-globul.firebaseapp.com/__/auth/handler
[ ] http://localhost:3000
```

⚠️ **مهم:** تأكد من:
- `/` مزدوجة في `/__/auth/handler` (شرطتين سفليتين)
- لا مسافات قبل أو بعد العنوان
- كل عنوان في سطر منفصل

---

### ⏳ 3. إعدادات OAuth (يحتاج تحديث)

**في نفس الصفحة، تأكد من تفعيل:**

```
[ ] تسجيل دخول العميل عبر OAuth = ON
[ ] تسجيل دخول عبر الويب باستخدام OAuth = ON
[ ] فرض HTTPS = ON
[ ] استخدام الوضع الصارم لمحددات URI = ON
```

---

### ⏳ 4. النطاقات المسموح بها في JavaScript SDK

**في نفس الصفحة:**

أضف (بدون `/` في النهاية):
```
[ ] https://fire-new-globul.firebaseapp.com
[ ] https://mobilebg.eu
[ ] https://localhost
```

---

### ⏳ 5. تفعيل App Mode = Live

**في Dashboard أو Settings → Basic:**

```
[ ] تحويل App Mode من Development إلى Live
```

**قد يُطلب منك:**
- [x] Privacy Policy ✅ (مضاف)
- [x] Terms of Service ✅ (مضاف)
- [x] Data Deletion ✅ (مضاف)
- [ ] App Icon (1024x1024) ⏳ (إذا لم يكن مضافاً)

---

### ⏳ 6. إعداد Firebase Authentication

**في Firebase Console:**
```
https://console.firebase.google.com/project/fire-new-globul/authentication/providers
```

**خطوات:**
1. [ ] اذهب إلى Authentication → Sign-in method
2. [ ] اضغط على Facebook
3. [ ] أدخل:
   - App ID: `1780064479295175`
   - App Secret: `e762759ee883c3cbc256779ce0852e90`
4. [ ] فعّل Facebook Provider
5. [ ] احفظ التغييرات

---

### ⏳ 7. اختبار تسجيل الدخول

بعد إكمال كل الخطوات:

```
[ ] أعد تشغيل الخادم المحلي
[ ] امسح cache المتصفح
[ ] جرّب تسجيل الدخول مع Facebook
[ ] تحقق من ظهور نافذة Facebook المنبثقة
[ ] أكمل تسجيل الدخول
[ ] تحقق من نجاح العملية
```

---

## 🎯 الخطوات التالية

### الآن (حالاً):
1. أضف OAuth Redirect URIs في Facebook
2. فعّل الإعدادات المطلوبة
3. احفظ التغييرات
4. حوّل التطبيق إلى Live
5. انتظر 5 دقائق
6. جرّب تسجيل الدخول

### بعد نجاح الاختبار:
1. انشر التحديث على Firebase
2. اختبر على الموقع المباشر
3. تحقق من عمل تسجيل الدخول على mobilebg.eu

---

## 📝 ملاحظات مهمة

### للربط مع Firebase:
- App ID و App Secret يجب إضافتهم في Firebase Console
- OAuth Redirect URI يُنشأ تلقائياً من Firebase
- يجب أن يتطابق في كلا الجانبين (Facebook & Firebase)

### للأمان:
- ✅ App Secret محفوظ في Firebase فقط
- ✅ لا يظهر في الكود
- ✅ محمي في .gitignore

---

## 🔗 الروابط المهمة

| الخدمة | الرابط |
|--------|--------|
| **Facebook App** | https://developers.facebook.com/apps/1780064479295175 |
| **Firebase Console** | https://console.firebase.google.com/project/fire-new-globul |
| **الموقع المباشر** | https://fire-new-globul.web.app |
| **الدومين المخصص** | https://mobilebg.eu |

---

**تاريخ الإنشاء:** 13 أكتوبر 2025  
**الحالة:** جاهز للتفعيل  
**آخر تحديث:** الآن

