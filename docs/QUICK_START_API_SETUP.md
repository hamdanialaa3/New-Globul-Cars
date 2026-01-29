# ⚡ دليل البدء السريع - إعداد API Keys

## 🎯 الهدف
الحصول على جميع المفاتيح المطلوبة خلال **1-2 ساعة**.

---

## ✅ Checklist - اتبع الخطوات بالترتيب

### **المرحلة 1: Facebook/Instagram (30 دقيقة)** ⭐ أولوية قصوى

#### 1. إنشاء Facebook App
- [ ] افتح: https://developers.facebook.com/apps/
- [ ] اضغط "Create App"
- [ ] اختر Type: **"Business"**
- [ ] Display Name: `Koli One Social Integration`
- [ ] App Contact Email: `info@koli.one`
- [ ] اضغط "Create App"

#### 2. احصل على App ID & Secret
- [ ] افتح: https://developers.facebook.com/apps/2026958077871354/settings/basic/
- [ ] App ID: `2026958077871354` (موجود)
- [ ] App Secret: اضغط **"Show"** → انسخه → احفظه في `.env.local`

#### 3. احصل على Page Access Token
- [ ] افتح: https://developers.facebook.com/tools/explorer/
- [ ] User or Page: اختر **صفحة "koli.one"**
- [ ] Permissions: أضف:
  - `pages_manage_posts`
  - `pages_read_engagement`
  - `instagram_basic`
  - `instagram_content_publish`
- [ ] اضغط **"Generate Access Token"**
- [ ] انسخ Token

#### 4. حوّل Token إلى Long-lived (مهم!)
افتح في المتصفح (استبدل YOUR_TOKEN):
```
https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=2026958077871354&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_TOKEN
```
- [ ] انسخ `access_token` الجديد
- [ ] هذا يدوم 60 يوم

#### 5. احصل على Instagram Business Account ID
افتح في المتصفح:
```
https://graph.facebook.com/v18.0/me/accounts?access_token=YOUR_PAGE_TOKEN
```
ثم:
```
https://graph.facebook.com/v18.0/PAGE_ID?fields=instagram_business_account&access_token=YOUR_PAGE_TOKEN
```
- [ ] انسخ `instagram_business_account.id`

#### 6. اطلب Permissions (مهم للإنتاج!)
- [ ] افتح: https://developers.facebook.com/apps/2026958077871354/app-review/permissions/
- [ ] اطلب:
  - `pages_manage_posts` → ضروري للنشر
  - `pages_read_engagement` → لقراءة التفاعل
  - `instagram_basic` → معلومات Instagram
  - `instagram_content_publish` → النشر على Instagram
- [ ] املأ استمارة App Review (5-7 أيام للموافقة)

---

### **المرحلة 2: YouTube (30 دقيقة)**

#### 1. إنشاء Google Cloud Project
- [ ] افتح: https://console.cloud.google.com/
- [ ] اضغط "Select a project" → "New Project"
- [ ] Project Name: `Koli One Social`
- [ ] اضغط "Create"

#### 2. تفعيل YouTube Data API
- [ ] افتح: https://console.cloud.google.com/apis/library/youtube.googleapis.com
- [ ] اضغط **"Enable"**

#### 3. إنشاء API Key
- [ ] افتح: https://console.cloud.google.com/apis/credentials
- [ ] اضغط "Create Credentials" → **"API Key"**
- [ ] انسخ API Key
- [ ] اضغط "Edit API Key" → Restrict to **"YouTube Data API v3"**

#### 4. إنشاء OAuth 2.0 Client
- [ ] نفس الصفحة → "Create Credentials" → **"OAuth client ID"**
- [ ] Application type: **"Web application"**
- [ ] Name: `Koli One YouTube Integration`
- [ ] Authorized redirect URIs: `https://koli.one/auth/youtube/callback`
- [ ] اضغط "Create"
- [ ] انسخ **Client ID** و **Client Secret**

#### 5. احصل على Refresh Token
- [ ] افتح: https://developers.google.com/oauthplayground/
- [ ] Settings ⚙️ → ✅ "Use your own OAuth credentials"
- [ ] أدخل Client ID & Client Secret
- [ ] Select & authorize APIs:
  - `https://www.googleapis.com/auth/youtube.upload`
  - `https://www.googleapis.com/auth/youtube.force-ssl`
- [ ] اضغط "Authorize APIs"
- [ ] سجّل دخول بحساب @Kolionebg
- [ ] اضغط "Exchange authorization code for tokens"
- [ ] انسخ **"Refresh token"**

---

### **المرحلة 3: LinkedIn (20 دقيقة)**

#### 1. إنشاء LinkedIn App
- [ ] افتح: https://www.linkedin.com/developers/apps/
- [ ] اضغط **"Create app"**
- [ ] App Name: `Koli One`
- [ ] LinkedIn Page: اختر صفحة **"Koli One"**
- [ ] App logo: ارفع logo.png
- [ ] اضغط "Create app"

#### 2. احصل على Credentials
- [ ] Tab: **"Auth"**
- [ ] انسخ **Client ID**
- [ ] انسخ **Client Secret**

#### 3. إعداد OAuth 2.0
- [ ] Redirect URLs: أضف `https://koli.one/auth/linkedin/callback`
- [ ] Tab: **"Products"**
- [ ] اطلب: **"Share on LinkedIn"** و **"Sign In with LinkedIn"**

#### 4. احصل على Organization ID
- [ ] افتح صفحة الشركة: https://www.linkedin.com/company/koli-one/admin/
- [ ] Organization ID موجود في URL بعد `/company/`

---

### **المرحلة 4: X (Twitter) (20 دقيقة)**

#### 1. التسجيل كمطور
- [ ] افتح: https://developer.twitter.com/en/portal/petition/essential/basic-info
- [ ] سجّل كمطور (إذا لم تكن مسجلاً)
- [ ] Use case: **"Making a bot"**

#### 2. إنشاء Project & App
- [ ] افتح: https://developer.twitter.com/en/portal/projects/new
- [ ] Project Name: `Koli One Social`
- [ ] Use case: **"Publish & analyze Tweets"**
- [ ] App Name: `KoliOneBot`

#### 3. احصل على Keys
- [ ] بعد الإنشاء، انسخ:
  - **API Key**
  - **API Key Secret**
  - **Bearer Token**

#### 4. إعداد OAuth 2.0
- [ ] Settings → User authentication settings
- [ ] App permissions: **"Read and write"**
- [ ] Type of App: **"Web App"**
- [ ] Callback URL: `https://koli.one/auth/twitter/callback`
- [ ] Website URL: `https://koli.one`
- [ ] احصل على **Client ID** و **Client Secret**

#### ⚠️ 5. الترقية إلى Basic Plan (للنشر)
- [ ] افتح: https://developer.twitter.com/en/portal/products
- [ ] اختر **"Basic"** - $100/month
- [ ] يدعم 3,333 posts/month

---

### **المرحلة 5: TikTok (15 دقيقة)**

#### 1. التسجيل
- [ ] افتح: https://developers.tiktok.com/
- [ ] سجّل كمطور

#### 2. إنشاء App
- [ ] افتح: https://developers.tiktok.com/apps/
- [ ] اضغط **"Create an app"**
- [ ] App Name: `Koli One`
- [ ] Products: اختر **"Login Kit"** و **"Content Posting API"**

#### 3. ملء الاستمارة
- [ ] App Description: `Car marketplace platform for Bulgaria`
- [ ] Website: `https://koli.one`
- [ ] Privacy Policy: `https://koli.one/privacy-policy`

#### 4. احصل على Credentials
- [ ] بعد الموافقة (5-7 أيام):
  - **Client Key**
  - **Client Secret**

---

## 📋 بعد الانتهاء من جمع المفاتيح

### 1. إنشاء ملف .env.local
```bash
# في جذر المشروع
cp .env.example .env.local
```

### 2. املأ المفاتيح
افتح `.env.local` وضع جميع المفاتيح التي حصلت عليها.

### 3. تأمين الملف
```bash
# أضف إلى .gitignore (إذا لم يكن موجوداً)
echo ".env.local" >> .gitignore
```

### 4. اختبار الاتصال
سأكتب لك script للاختبار:
```bash
npm run test:social-api
```

---

## 🆘 مشاكل شائعة وحلولها

### ❌ Facebook Token expired
**الحل**: Token يدوم 60 يوم فقط. احصل على token جديد كل شهرين.

### ❌ YouTube quota exceeded
**الحل**: Quota = 10,000 units/day. Video upload = 1,600 units. حدّد 6 uploads/day max.

### ❌ Twitter API returns 429
**الحل**: Rate limited. انتظر 15 دقيقة أو upgrade plan.

### ❌ TikTok API not approved
**الحل**: TikTok بطيء في الموافقة. استخدم Buffer/Hootsuite كبديل مؤقت.

---

## 🎉 بعد الانتهاء

عندما تحصل على جميع المفاتيح، أخبرني وسأكتب لك:
1. ✅ Auto-posting service
2. ✅ Scheduling system
3. ✅ Hashtag generator (AI)
4. ✅ Analytics dashboard
5. ✅ Content calendar automation

---

## 📞 تحتاج مساعدة؟

إذا واجهت أي مشكلة في أي خطوة، أخبرني وسأساعدك! 🚀

**الوقت المتوقع الكلي**: 1.5 - 2 ساعة ⏱️
