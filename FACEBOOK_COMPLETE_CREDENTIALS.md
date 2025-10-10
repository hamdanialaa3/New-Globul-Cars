# 🔵 Facebook Complete Integration Credentials

**⚠️ ملف سري - لا تشاركه!**  
**التاريخ:** 10 أكتوبر 2025  
**الحالة:** ✅ جميع البيانات متوفرة

---

## 📋 جميع البيانات المطلوبة:

### Facebook App - New Globul Cars APP F:
```
App ID: 1780064479295175
App Secret: 0e0ace07e900a3f7828f7d24fc7f5a12
```

### Facebook Page - Bulgarian Car Marketplace:
```
Page ID: 100080260449528
Page URL: https://www.facebook.com/people/Bulgarian-Car-Marketplace/100080260449528/
```

### Facebook Access Token (Graph API):
```
EAAZAS9Y73NscBPrLllmUqpwmmn702VFbzPIOEqDh8gscFea2cqQDKqwjr4cOGNOJc9teeZA3kfqRnVZAZBWGAm3K4Y1pULJEY1wyPZCO05k2fPo0rzD57x6mYZBfn326X86GZB7o5qrbQUGoISvqEnUXObslPrMmYh1LBRkYuuQVnZANv1IkUlexHmAJv18LtFEmZAjZAR4YLNPmPfVp6hdt3B14DeZALFq2xLwI3tFZBd6z
```

### Facebook Catalog (للمنتجات):
```
Catalog ID: 2042364629841974
```

### Threads Integration:
```
Threads App ID: 1322844865937799
Threads App Secret: 6c627f9cb1a9de7a04ba113210c3beb8
```

---

## 📝 ماذا تكتب في .env.local:

### انسخ هذا بالكامل والصقه في:
```
bulgarian-car-marketplace/.env.local
```

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=AIzaSyDWI_Cg5oN5mRa1TYEVlNcm9lj-TljNFow
REACT_APP_FIREBASE_AUTH_DOMAIN=studio-448742006-a3493.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=studio-448742006-a3493
REACT_APP_FIREBASE_STORAGE_BUCKET=studio-448742006-a3493.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=448742006
REACT_APP_FIREBASE_APP_ID=1:448742006:web:29740a9e5de8c4bcb42c72
REACT_APP_FIREBASE_MEASUREMENT_ID=G-R65R0TRY8W

# Facebook App Configuration
REACT_APP_FACEBOOK_APP_ID=1780064479295175
REACT_APP_FACEBOOK_APP_SECRET=0e0ace07e900a3f7828f7d24fc7f5a12
REACT_APP_FACEBOOK_PAGE_ID=100080260449528
REACT_APP_FACEBOOK_ACCESS_TOKEN=EAAZAS9Y73NscBPrLllmUqpwmmn702VFbzPIOEqDh8gscFea2cqQDKqwjr4cOGNOJc9teeZA3kfqRnVZAZBWGAm3K4Y1pULJEY1wyPZCO05k2fPo0rzD57x6mYZBfn326X86GZB7o5qrbQUGoISvqEnUXObslPrMmYh1LBRkYuuQVnZANv1IkUlexHmAJv18LtFEmZAjZAR4YLNPmPfVp6hdt3B14DeZALFq2xLwI3tFZBd6z
REACT_APP_FACEBOOK_VERIFY_TOKEN=bulgarian_car_verify_2024
REACT_APP_FACEBOOK_CATALOG_ID=2042364629841974

# Threads Integration
REACT_APP_THREADS_APP_ID=1322844865937799
REACT_APP_THREADS_APP_SECRET=6c627f9cb1a9de7a04ba113210c3beb8

# Base URLs
REACT_APP_BASE_URL=https://globul.net

# Environment
NODE_ENV=development
REACT_APP_ENVIRONMENT=development
```

---

## 🔗 الإعدادات في Facebook:

### Basic Settings:
```
URL: https://developers.facebook.com/apps/1780064479295175/settings/basic/

املأ:
- Display Name: Bulgarian Car Marketplace
- App Domains: localhost, studio-448742006-a3493.firebaseapp.com, studio-448742006-a3493.web.app, globul.net
- Privacy Policy: https://globul.net/privacy-policy
- Terms of Service: https://globul.net/terms-of-service
- User Data Deletion: https://globul.net/data-deletion
```

### Facebook Login Settings:
```
URL: https://developers.facebook.com/apps/1780064479295175/fb-login/settings/

أضف OAuth Redirect URIs:
- https://studio-448742006-a3493.firebaseapp.com/__/auth/handler
- https://studio-448742006-a3493.web.app/__/auth/handler
- https://globul.net/__/auth/handler
- http://localhost:3000/__/auth/handler

فعّل:
✅ Web OAuth Login
✅ JavaScript SDK

JavaScript SDK Domains:
- localhost
- studio-448742006-a3493.firebaseapp.com
- studio-448742006-a3493.web.app
- globul.net
```

---

## 🎯 الميزات الجاهزة للاستخدام:

### 1. Facebook Authentication
```javascript
import { SocialAuthService } from './firebase/social-auth-service';

// Login with Facebook
const result = await SocialAuthService.signInWithFacebook();
console.log('User:', result.user.email);
```

### 2. Facebook Graph API
```javascript
import { bulgarianFacebookGraph } from './services/facebook-graph-service';

// Get page data
const pageData = await bulgarianFacebookGraph.getPageData();
console.log('Page followers:', pageData.fan_count);

// Post to page
await bulgarianFacebookGraph.postToPage({
  message: 'Check out this BMW X5!',
  link: 'https://globul.net/cars/bmw-x5-123'
});
```

### 3. Facebook Catalog
```javascript
import { bulgarianMarketingService } from './services/facebook-marketing-service';

// Add car to catalog
await bulgarianMarketingService.addCarToCatalog({
  id: 'car-123',
  title: 'BMW X5 2020',
  price: 25000,
  currency: 'EUR',
  availability: 'in stock',
  url: 'https://globul.net/cars/bmw-x5-123',
  imageUrl: 'https://...'
});
```

### 4. Facebook Messenger
```javascript
import { bulgarianMessengerService } from './services/facebook-messenger-service';

// Send message
await bulgarianMessengerService.sendMessage(
  userId,
  'مرحباً! شكراً على اهتمامك بالسيارة'
);
```

### 5. Threads Posting
```javascript
import { bulgarianThreadsService } from './services/threads-service';

// Post to Threads
await bulgarianThreadsService.postCarToThreads({
  make: 'BMW',
  model: 'X5',
  year: 2020,
  price: 25000,
  images: ['...']
});
```

---

## 📊 Integration Checklist:

```
Facebook App Setup:
✅ App created
✅ App ID configured
✅ App Secret configured
✅ Access Token generated
✅ Catalog ID found

Environment Variables:
✅ All credentials in .env.local
✅ Development server will load them

Code Integration:
✅ Auth service ready
✅ Graph API service ready
✅ Marketing service ready
✅ Messenger service ready
✅ Threads service ready
✅ Auto-sync to Firestore

Firebase Console:
✅ Facebook provider configured
✅ App ID: 1780064479295175
✅ App Secret: configured

Pending (في Facebook):
⏳ App Domains (Basic Settings)
⏳ OAuth Redirect URIs (Login Settings)
⏳ JavaScript SDK Domains
⏳ Save Changes
```

---

## 🎉 بعد إكمال الإعدادات:

```
Users يمكنهم:
✅ تسجيل الدخول بـ Facebook
✅ مشاركة السيارات على Facebook
✅ استقبال رسائل Messenger
✅ رؤية الإعلانات المستهدفة
✅ تتبع نشاطهم (Facebook Pixel)

Admins يمكنهم:
✅ إدارة Facebook Page من Super Admin
✅ مشاهدة إحصائيات Facebook
✅ إضافة سيارات للـ Catalog
✅ إنشاء حملات إعلانية
✅ تتبع التحويلات
```

---

## 🔗 Quick Links:

```
Facebook App: https://developers.facebook.com/apps/1780064479295175/
Basic Settings: https://developers.facebook.com/apps/1780064479295175/settings/basic/
Login Settings: https://developers.facebook.com/apps/1780064479295175/fb-login/settings/
Graph API Explorer: https://developers.facebook.com/tools/explorer/
Business Manager: https://business.facebook.com/
```

---

**✅ التكامل 100% جاهز! أكمل الإعدادات في Facebook وسيعمل كل شيء!** 🚀

