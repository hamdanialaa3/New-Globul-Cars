# 🔵 Facebook Setup - بطاقة مرجعية سريعة

**افتح هذا الملف واتبع الخطوات بالترتيب!**

---

## ✅ البيانات الموجودة (تم):

```
✅ App ID: 1780064479295175
✅ App Secret: 0e0ace07e900a3f7828f7d24fc7f5a12
✅ Access Token: [تم الحصول عليه]
✅ Catalog ID: 2042364629841974
✅ Threads App: 1322844865937799
✅ Firebase: Configured
✅ .env.local: Updated
```

---

## 📝 الخطوات المتبقية (10 دقائق):

### خطوة 1: Basic Settings (5 دقائق)

**افتح:**
```
https://developers.facebook.com/apps/1780064479295175/settings/basic/
```

**املأ:**

| الحقل | القيمة |
|------|--------|
| اسم العرض | `Bulgarian Car Marketplace` |
| مساحة الاسم | `bulgariancarmarketplace` |
| نطاقات التطبيق | `localhost`<br>`studio-448742006-a3493.firebaseapp.com`<br>`studio-448742006-a3493.web.app`<br>`globul.net` |
| Privacy Policy URL | `https://globul.net/privacy-policy` |
| Terms of Service | `https://globul.net/terms-of-service` |
| User Data Deletion | `https://globul.net/data-deletion` |
| الفئة | `Business and Pages` |

**اضغط:** `Save Changes`

---

### خطوة 2: Facebook Login Settings (3 دقائق)

**افتح:**
```
https://developers.facebook.com/apps/1780064479295175/fb-login/settings/
```

**في "محددات URI لإعادة توجيه OAuth الصالحة":**

**الصق (كل واحد في سطر):**
```
https://studio-448742006-a3493.firebaseapp.com/__/auth/handler
https://studio-448742006-a3493.web.app/__/auth/handler
https://globul.net/__/auth/handler
http://localhost:3000/__/auth/handler
```

**فعّل:**
```
✅ تسجيل دخول عبر الويب باستخدام OAuth
✅ تسجيل الدخول باستخدام JavaScript SDK
```

**في "النطاقات المسموح بها في JavaScript SDK":**
```
localhost
studio-448742006-a3493.firebaseapp.com
studio-448742006-a3493.web.app
globul.net
```

**اضغط:** `Save Changes`

---

### خطوة 3: Test (2 دقيقة)

**افتح:**
```
https://studio-448742006-a3493.web.app/login
```

**أو:**
```
http://localhost:3000/login
```

**اضغط:** `Continue with Facebook`

**✅ يجب أن يعمل!**

---

## 🎯 Checklist السريع:

```
في Basic Settings:
☐ Display Name: Bulgarian Car Marketplace
☐ Namespace: bulgariancarmarketplace
☐ App Domains: 4 domains added
☐ Privacy Policy: https://globul.net/privacy-policy
☐ Terms: https://globul.net/terms-of-service
☐ Data Deletion: https://globul.net/data-deletion
☐ Category: Business and Pages
☐ Save Changes ✅

في Login Settings:
☐ OAuth Redirect URIs: 4 URIs added
☐ Web OAuth Login: Enabled
☐ JavaScript SDK: Enabled
☐ JS SDK Domains: 4 domains added
☐ Save Changes ✅

Testing:
☐ Open login page
☐ Click Facebook button
☐ Login successful
☐ User saved to Firestore
☐ Shows in Super Admin
```

---

## 🔗 روابط مباشرة:

```
Basic Settings:
https://developers.facebook.com/apps/1780064479295175/settings/basic/

Login Settings:
https://developers.facebook.com/apps/1780064479295175/fb-login/settings/

Test Site:
https://studio-448742006-a3493.web.app/login

Super Admin:
https://studio-448742006-a3493.web.app/super-admin
```

---

## ⚡ للنسخ السريع:

### App Domains (4 سطور):
```
localhost
studio-448742006-a3493.firebaseapp.com
studio-448742006-a3493.web.app
globul.net
```

### OAuth URIs (4 سطور):
```
https://studio-448742006-a3493.firebaseapp.com/__/auth/handler
https://studio-448742006-a3493.web.app/__/auth/handler
https://globul.net/__/auth/handler
http://localhost:3000/__/auth/handler
```

### Privacy URLs (3 سطور):
```
https://globul.net/privacy-policy
https://globul.net/terms-of-service
https://globul.net/data-deletion
```

---

**🔵 اتبع الخطوات بالترتيب وستكتمل في 10 دقائق!** ✅

