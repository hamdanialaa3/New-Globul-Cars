# Facebook Setup Instructions
# تعليمات إعداد فيسبوك

**للوصول إلى 100% من تكامل فيسبوك**

---

## الخطوة 1: إنشاء ملف .env

### في مجلد bulgarian-car-marketplace:

```bash
cd bulgarian-car-marketplace
notepad .env
```

### انسخ هذا المحتوى:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=AIzaSyBrQmYxT_t8-RnOX4vfRKJ1CJ3f5LBfBJc
REACT_APP_FIREBASE_AUTH_DOMAIN=studio-448742006-a3493.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=studio-448742006-a3493
REACT_APP_FIREBASE_STORAGE_BUCKET=studio-448742006-a3493.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=448742006
REACT_APP_FIREBASE_APP_ID=1:448742006:web:globul-cars-marketplace

# Google reCAPTCHA
REACT_APP_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI

# Facebook Configuration (املأ هذه القيم بعد إنشاء التطبيق)
REACT_APP_FACEBOOK_APP_ID=your_app_id_here
REACT_APP_FACEBOOK_PAGE_ID=100080260449528
REACT_APP_FACEBOOK_PIXEL_ID=your_pixel_id_here
REACT_APP_FACEBOOK_ACCESS_TOKEN=your_access_token_here
REACT_APP_FACEBOOK_PAGE_ACCESS_TOKEN=your_page_access_token_here
REACT_APP_FACEBOOK_AD_ACCOUNT_ID=your_ad_account_id_here
REACT_APP_FACEBOOK_VERIFY_TOKEN=bulgarian_car_verify_2024

# Google Maps
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Environment
REACT_APP_ENVIRONMENT=production
NODE_ENV=production
```

---

## الخطوة 2: إنشاء تطبيق فيسبوك

### 2.1 الذهاب إلى Facebook Developers

```
URL: https://developers.facebook.com/apps/
```

### 2.2 إنشاء تطبيق جديد

```
1. انقر "Create App"
2. اختر "Business" type
3. املأ المعلومات:
   - App Display Name: Bulgarian Car Marketplace
   - App Contact Email: support@globulcars.bg
   - App Purpose: Business → Automotive
4. انقر "Create App"
```

### 2.3 الحصول على App ID

```
من Settings → Basic:
- نسخ "App ID"
- استبدل "your_app_id_here" في ملف .env
```

---

## الخطوة 3: إضافة URLs القانونية

### في App Settings → Basic:

```
Privacy Policy URL:
https://globul.net/privacy-policy

Terms of Service URL:
https://globul.net/terms-of-service

User Data Deletion:
https://globul.net/data-deletion
```

---

## الخطوة 4: تفعيل Facebook Login

### 4.1 إضافة Product

```
1. من Dashboard → Add Product
2. اختر "Facebook Login" → Set Up
3. اختر "Web" platform
```

### 4.2 تكوين OAuth Redirects

```
في Facebook Login → Settings:

Valid OAuth Redirect URIs:
https://globul.net/
https://globul.net/login
https://globul.net/register
http://localhost:3000/
http://localhost:3000/login
```

### 4.3 تفعيل في Firebase

```
1. Firebase Console: https://console.firebase.google.com/project/studio-448742006-a3493
2. Authentication → Sign-in providers
3. Enable "Facebook"
4. أدخل:
   - App ID: من Facebook
   - App Secret: من Facebook Settings → Basic → Show
5. Save
```

---

## الخطوة 5: إنشاء Facebook Pixel

### 5.1 في Events Manager

```
1. Business Manager: https://business.facebook.com
2. Events Manager → Data Sources
3. انقر "Add" → "Facebook Pixel"
4. اختر "Manually Install Code"
5. نسخ Pixel ID
6. استبدل "your_pixel_id_here" في .env
```

---

## الخطوة 6: إعداد Messenger

### 6.1 إضافة Messenger Product

```
1. Dashboard → Add Product
2. اختر "Messenger"
3. Set Up
```

### 6.2 تكوين Webhook

```
في Messenger → Settings:

Callback URL:
https://us-central1-studio-448742006-a3493.cloudfunctions.net/messengerWebhook

Verify Token:
bulgarian_car_verify_2024

Subscribe to: messages, messaging_postbacks
```

---

## الخطوة 7: نشر Firebase Functions

### في Terminal:

```bash
cd "C:\Users\hamda\Desktop\New Globul Cars"
firebase deploy --only functions:handleFacebookDataDeletion,functions:messengerWebhook
```

---

## الخطوة 8: إعداد متغيرات Functions

### في Firebase Console:

```bash
firebase functions:config:set \
  facebook.app_secret="YOUR_APP_SECRET" \
  facebook.page_access_token="YOUR_PAGE_ACCESS_TOKEN" \
  facebook.verify_token="bulgarian_car_verify_2024"
```

---

## الخطوة 9: اختبار التكامل

### 9.1 اختبار Facebook Login

```
1. افتح: http://localhost:3000/login
2. انقر "Continue with Facebook"
3. تحقق من تسجيل الدخول
```

### 9.2 اختبار Messenger Widget

```
1. افتح: http://localhost:3000
2. ابحث عن Messenger icon (أسفل يمين)
3. أرسل رسالة تجريبية
```

### 9.3 اختبار Pixel

```
1. Facebook Events Manager
2. Test Events tool
3. أدخل: https://globul.net
4. تحقق من PageView event
```

---

## الخطوة 10: طلب App Review

### 10.1 إعداد للمراجعة

```
Screenshots needed:
- Login page with Facebook button
- After successful Facebook login
- User profile with Facebook data
```

### 10.2 Permissions المطلوبة

```
Basic permissions:
- email
- public_profile

Advanced permissions (optional):
- user_friends
- pages_messaging
- ads_management
```

### 10.3 Submit for Review

```
1. App Review → Permissions and Features
2. Request: email, public_profile
3. Provide screenshots and description
4. Submit
5. Wait 2-5 business days
```

---

## ✅ Verification Checklist

قبل النشر النهائي، تحقق من:

- [ ] ملف .env موجود بجميع المفاتيح
- [ ] تطبيق فيسبوك منشئ ومفعل
- [ ] URLs القانونية مضافة في App Settings
- [ ] Facebook Login مفعل في Firebase
- [ ] OAuth Redirects مكونة
- [ ] Facebook Pixel منشئ ومفعل
- [ ] Messenger webhook مكون
- [ ] Firebase Functions منشورة
- [ ] Facebook Login يعمل محلياً
- [ ] Messenger widget يظهر
- [ ] Pixel يتتبع PageViews

---

## 🎯 الوقت المتوقع

- الخطوة 1-3: 30 دقيقة (إعداد أساسي)
- الخطوة 4-6: 45 دقيقة (تفعيل المنتجات)
- الخطوة 7-8: 15 دقيقة (نشر Functions)
- الخطوة 9: 20 دقيقة (اختبار)
- الخطوة 10: 30 دقيقة (App Review)

**إجمالي: 2-3 ساعات**

---

## 📞 الدعم

إذا واجهت مشاكل:

### Facebook Support:
- Developers: https://developers.facebook.com/support
- Community: https://stackoverflow.com/questions/tagged/facebook

### الوثائق:
- FACEBOOK_TODO_LIST.md (خطوات مفصلة)
- FACEBOOK_INTEGRATION_ANALYSIS.md (تحليل شامل)
- DEPRECATED_DOCS/FACEBOOK_INTEGRATION_GUIDE.md (دليل كامل)

---

**بعد إكمال هذه الخطوات، ستكون لديك تكامل فيسبوك 100%! ✅**

