# 🚀 Social Media OAuth - Quick Start

## ⚡ الإعداد السريع (5 دقائق)

### 1️⃣ **تشغيل Deploy Script**

**Windows:**
```powershell
.\deploy-social-oauth.ps1
```

**Linux/Mac:**
```bash
chmod +x deploy-social-oauth.sh
./deploy-social-oauth.sh
```

السكريبت سيطلب منك:
- ✅ Facebook credentials (موجودة مسبقاً)
- ⚙️ Twitter credentials (optional)
- ⚙️ TikTok credentials (optional)
- ⚙️ LinkedIn credentials (optional)
- ⚙️ Google credentials (optional)

---

### 2️⃣ **إضافة Redirect URLs**

اذهب إلى كل منصة وأضف:

#### Development:
```
http://localhost:3000/oauth/callback
```

#### Production:
```
https://mobilebg.eu/oauth/callback
https://fire-new-globul.firebaseapp.com/oauth/callback
```

---

### 3️⃣ **اختبار**

1. شغّل التطبيق:
```bash
cd bulgarian-car-marketplace
npm start
```

2. افتح المتصفح: `http://localhost:3000`

3. اذهب إلى: **Profile > Settings > Social Media Accounts**

4. اضغط **Connect** على أي منصة

5. أكمل OAuth flow

6. ستشاهد: ✅ **Connected**

---

## 📱 إعداد كل منصة

### ✅ Facebook (جاهز!)
- App ID: `1780064479295175`
- App Secret: `e762759ee883c3cbc256779ce0852e90`
- [Dashboard](https://developers.facebook.com/apps/1780064479295175)

### ⚙️ Twitter/X
1. [Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create App
3. User authentication > OAuth 2.0 > ON
4. Copy Client ID & Secret

### ⚙️ TikTok
1. [Developers Portal](https://developers.tiktok.com/)
2. Create App
3. Add "Login Kit"
4. Copy Client Key & Secret

### ⚙️ LinkedIn
1. [Developer Apps](https://www.linkedin.com/developers/apps)
2. Create App
3. Add "Sign In with LinkedIn"
4. Copy Client ID & Secret

### ⚙️ YouTube (Google)
1. [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services > Credentials
3. Create OAuth 2.0 Client ID
4. Enable YouTube Data API v3
5. Copy Client ID & Secret

---

## 🔧 الإعداد اليدوي (إذا لم يعمل السكريبت)

### Step 1: Install Dependencies
```bash
cd functions
npm install
```

### Step 2: Build Functions
```bash
npm run build
```

### Step 3: Set Secrets (Facebook فقط للبداية)
```bash
firebase functions:config:set \
  facebook.app_id="1780064479295175" \
  facebook.app_secret="e762759ee883c3cbc256779ce0852e90"
```

### Step 4: Deploy
```bash
firebase deploy --only functions:exchangeOAuthToken
```

---

## 🧪 التحقق من التثبيت

### Check Cloud Function:
```bash
firebase functions:list
```

يجب أن ترى:
```
✔ exchangeOAuthToken(us-central1)
```

### Check Config:
```bash
firebase functions:config:get
```

يجب أن ترى:
```json
{
  "facebook": {
    "app_id": "1780064479295175",
    "app_secret": "e76..."
  }
}
```

---

## ❌ Troubleshooting

### Error: "redirect_uri_mismatch"
**الحل:** تأكد من أن الـ URL في developer console يطابق تماماً:
```
http://localhost:3000/oauth/callback
```
(بدون trailing slash)

### Error: "Invalid scope"
**الحل:** تحقق من أن الـ scopes موجودة في app settings

### Error: Popup blocked
**الحل:** اسمح للـ popups في browser settings

### Error: "Token exchange failed"
**الحل:**
1. تحقق من deploy الـ Cloud Function
2. تحقق من Firebase config
3. راجع logs: `firebase functions:log`

---

## 🎯 الخطوات التالية

بعد نجاح الربط:

1. ✅ **Create Post** - جرب cross-posting
2. ✅ **Test Auto-Share** - انشر على كل المنصات
3. ✅ **Check Firestore** - تحقق من الـ tokens
4. ✅ **Monitor Usage** - راقب الـ API limits

---

## 📚 Resources

- [Full Documentation](bulgarian-car-marketplace/SOCIAL_MEDIA_OAUTH_SETUP.md)
- [Cloud Function Code](functions/src/social-media/oauth-handler.ts)
- [Frontend Service](bulgarian-car-marketplace/src/services/social/social-media.service.ts)
- [Settings UI](bulgarian-car-marketplace/src/components/Profile/SocialMedia/SocialMediaSettings.tsx)

---

## 💡 Tips

- ✅ ابدأ بـ Facebook (جاهز مسبقاً)
- ✅ اختبر في Development أولاً
- ✅ راجع logs في حالة الأخطاء
- ✅ احفظ الـ Client IDs في مكان آمن
- ✅ استخدم Secrets في Production

---

**Need Help?** Check console logs for detailed errors.

