# Facebook Integration - TODO List
# قائمة مهام تكامل فيسبوك

**Created:** 9 October 2025  
**Project:** Globul Cars - Bulgarian Car Marketplace

---

## 📊 الحالة الحالية: 60% Complete

**ما هو موجود:**
- ✅ 6 خدمات Facebook services (كاملة)
- ✅ 4 صفحات قانونية (Privacy, Terms, Cookies, Data Deletion)
- ✅ SocialLogin component
- ✅ Integration manager

**ما هو مفقود:**
- ❌ إعداد تطبيق فيسبوك الفعلي
- ❌ ملف .env بالمفاتيح
- ❌ Firebase Functions (webhooks)
- ❌ Frontend components (Pixel, Messenger)

---

## 🎯 المهام المطلوبة

### المرحلة 1: إعداد تطبيق فيسبوك (1-2 ساعة)

#### ☐ Task 1.1: إنشاء Facebook App
```
1. الذهاب إلى: https://developers.facebook.com/apps/
2. انقر "Create App"
3. اختر "Business" type
4. املأ المعلومات:
   - App Name: Bulgarian Car Marketplace
   - Contact Email: support@globulcars.bg
   - Category: Business → Automotive
5. انقر "Create App"
```

#### ☐ Task 1.2: إضافة URLs القانونية
```
في App Settings → Basic:
- Privacy Policy URL: https://globul.net/privacy-policy
- Terms of Service URL: https://globul.net/terms-of-service
- Data Deletion Instructions: https://globul.net/data-deletion
```

#### ☐ Task 1.3: الحصول على App ID & Secret
```
من Settings → Basic:
- نسخ App ID
- نسخ App Secret (اضغط Show)
- احفظهم في مكان آمن
```

### المرحلة 2: تفعيل Facebook Login (30 دقيقة)

#### ☐ Task 2.1: إضافة Facebook Login Product
```
1. من Dashboard → Add Product
2. اختر "Facebook Login"
3. اختر "Web" platform
```

#### ☐ Task 2.2: تكوين OAuth Redirect URLs
```
في Facebook Login → Settings:

Valid OAuth Redirect URIs:
- https://globul.net/
- https://globul.net/login
- https://globul.net/register
- http://localhost:3000/ (للتطوير)
- http://localhost:3000/login (للتطوير)
```

#### ☐ Task 2.3: تفعيل في Firebase
```
1. Firebase Console → Authentication → Sign-in providers
2. Enable Facebook
3. أدخل App ID و App Secret
```

### المرحلة 3: إنشاء ملف .env (15 دقيقة)

#### ☐ Task 3.1: إنشاء الملف
```bash
cd bulgarian-car-marketplace
notepad .env
```

#### ☐ Task 3.2: إضافة المحتوى
```env
# Firebase Configuration (موجود)
REACT_APP_FIREBASE_API_KEY=AIzaSyBrQmYxT_t8-RnOX4vfRKJ1CJ3f5LBfBJc
REACT_APP_FIREBASE_AUTH_DOMAIN=studio-448742006-a3493.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=studio-448742006-a3493
REACT_APP_FIREBASE_STORAGE_BUCKET=studio-448742006-a3493.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=448742006
REACT_APP_FIREBASE_APP_ID=1:448742006:web:globul-cars-marketplace

# Google reCAPTCHA (موجود)
REACT_APP_RECAPTCHA_SITE_KEY=your_recaptcha_key

# Facebook Configuration (جديد - املأ بالقيم من فيسبوك)
REACT_APP_FACEBOOK_APP_ID=YOUR_APP_ID_HERE
REACT_APP_FACEBOOK_PAGE_ID=100080260449528
REACT_APP_FACEBOOK_PIXEL_ID=YOUR_PIXEL_ID_HERE
REACT_APP_FACEBOOK_ACCESS_TOKEN=YOUR_ACCESS_TOKEN_HERE
REACT_APP_FACEBOOK_PAGE_ACCESS_TOKEN=YOUR_PAGE_TOKEN_HERE
REACT_APP_FACEBOOK_AD_ACCOUNT_ID=YOUR_AD_ACCOUNT_ID_HERE
REACT_APP_FACEBOOK_VERIFY_TOKEN=bulgarian_car_verify_2024

# Environment
REACT_APP_ENVIRONMENT=development
NODE_ENV=development
```

#### ☐ Task 3.3: استبدال القيم
- استبدل YOUR_APP_ID_HERE بالـ App ID الفعلي
- استبدل YOUR_PIXEL_ID_HERE بالـ Pixel ID
- وهكذا لباقي القيم

### المرحلة 4: إنشاء Firebase Functions (1-2 ساعة)

#### ☐ Task 4.1: Data Deletion Webhook
**الملف:** `functions/src/facebook/data-deletion.ts`

**المحتوى:**
- verify signed_request from Facebook
- decode user_id
- delete user data from Firestore
- return confirmation_code

#### ☐ Task 4.2: Messenger Webhook
**الملف:** `functions/src/facebook/messenger-webhook.ts`

**المحتوى:**
- verify webhook token
- process incoming messages
- auto-respond with car info (Bulgarian)
- save conversation to Firestore

#### ☐ Task 4.3: تحديث functions/src/index.ts
```typescript
export { handleDataDeletion } from './facebook/data-deletion';
export { messengerWebhook } from './facebook/messenger-webhook';
```

#### ☐ Task 4.4: Deploy Functions
```bash
firebase deploy --only functions
```

### المرحلة 5: Frontend Components (1 ساعة)

#### ☐ Task 5.1: FacebookPixel Component
**الملف:** `src/components/FacebookPixel.tsx`

**الميزات:**
- Initialize pixel
- Track pageview automatically
- Track custom events (ViewContent, Search, Contact)

#### ☐ Task 5.2: FacebookMessengerWidget
**الملف:** `src/components/FacebookMessengerWidget.tsx`

**الميزات:**
- Customer Chat Plugin
- Bulgarian greeting
- Auto-open on mobile

#### ☐ Task 5.3: دمج في App.tsx
```typescript
import FacebookPixel from './components/FacebookPixel';
import FacebookMessengerWidget from './components/FacebookMessengerWidget';

// في return:
<FacebookPixel />
<FacebookMessengerWidget />
```

### المرحلة 6: Testing (1 ساعة)

#### ☐ Task 6.1: اختبار Facebook Login
- تسجيل دخول جديد بـ Facebook
- التحقق من حفظ البيانات

#### ☐ Task 6.2: اختبار Pixel
- فتح Facebook Events Manager
- التحقق من تتبع PageView

#### ☐ Task 6.3: اختبار Messenger
- فتح Chat widget
- إرسال رسالة
- التحقق من الاستلام

#### ☐ Task 6.4: اختبار Data Deletion
- طلب حذف بيانات
- التحقق من عمل Webhook

### المرحلة 7: App Review & Launch (2-3 أيام)

#### ☐ Task 7.1: إعداد للمراجعة
- Screenshots للتطبيق
- شرح استخدام Facebook Login
- Video demo

#### ☐ Task 7.2: طلب Permissions
- email (basic)
- public_profile
- user_friends (optional)

#### ☐ Task 7.3: Submit for Review
- إرسال التطبيق للمراجعة
- انتظار الموافقة (2-5 أيام)

---

## 🛠️ الأدوات المطلوبة

### Online Tools:
1. Facebook Developers Console: https://developers.facebook.com
2. Facebook Business Manager: https://business.facebook.com
3. Firebase Console: https://console.firebase.google.com

### Local Tools:
- Code Editor (VS Code)
- Terminal/Command Prompt
- Web Browser (للاختبار)

---

## 📚 الموارد المفيدة

### Documentation:
- Facebook Graph API: https://developers.facebook.com/docs/graph-api
- Facebook Login: https://developers.facebook.com/docs/facebook-login
- Messenger Platform: https://developers.facebook.com/docs/messenger-platform
- Facebook Pixel: https://developers.facebook.com/docs/meta-pixel

### Our Documentation:
- `FACEBOOK_INTEGRATION_GUIDE.md` (في DEPRECATED_DOCS)
- `FACEBOOK_SETUP_COMPLETE_WITH_DATA_DELETION.md` (في DEPRECATED_DOCS)

---

## ⏱️ التقدير الزمني

| المرحلة | الوقت المتوقع | الأولوية |
|---------|----------------|----------|
| إعداد التطبيق | 1-2 ساعة | HIGH |
| ملف .env | 15 دقيقة | HIGH |
| Firebase Functions | 2-3 ساعات | HIGH |
| Frontend Components | 1-2 ساعة | MEDIUM |
| Testing | 1-2 ساعة | MEDIUM |
| App Review | 2-5 أيام | LOW |

**إجمالي وقت التطوير:** 5-8 ساعات  
**إجمالي مع المراجعة:** 7-12 يوم

---

## ✅ Checklist Summary

- [ ] Create Facebook App (1.1-1.3)
- [ ] Configure Facebook Login (2.1-2.3)
- [ ] Create .env file (3.1-3.3)
- [ ] Create Data Deletion webhook (4.1)
- [ ] Create Messenger webhook (4.2)
- [ ] Deploy Functions (4.4)
- [ ] Create FacebookPixel component (5.1)
- [ ] Create Messenger Widget (5.2)
- [ ] Integrate in App.tsx (5.3)
- [ ] Test Facebook Login (6.1)
- [ ] Test Pixel tracking (6.2)
- [ ] Test Messenger (6.3)
- [ ] Test Data Deletion (6.4)
- [ ] Submit for App Review (7.3)

**Total Tasks: 14**  
**Estimated Time: 5-8 hours development + 2-5 days review**

---

**Ready to start? Let's begin with Task 1.1! 🚀**

