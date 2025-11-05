# ✅ Social Media OAuth - TODO List

## 📊 **الحالة الحالية:**

### ✅ **مكتمل (100%):**
- [x] الكود Frontend كامل
- [x] الكود Backend (Cloud Functions) كامل
- [x] Deployment scripts جاهزة
- [x] Documentation كاملة
- [x] Firestore rules deployed
- [x] Facebook App ID موجود (1780064479295175)

### ⚠️ **المطلوب للاستخدام:**
- [ ] Deploy Cloud Function
- [ ] Configure Facebook redirect URL
- [ ] (Optional) Create apps للمنصات الأخرى

---

## 🎯 **Option A: Facebook فقط (الأسرع - 15 دقيقة)**

### ✅ **Step 1: Deploy Cloud Function** (5 دقائق)

```powershell
.\deploy-social-oauth.ps1
```

**عندما يطلب credentials:**
- ✅ **Facebook App ID**: `1780064479295175` (اضغط Enter)
- ✅ **Facebook App Secret**: `e762759ee883c3cbc256779ce0852e90`
- ⏩ **Twitter**: اضغط Enter (skip)
- ⏩ **TikTok**: اضغط Enter (skip)
- ⏩ **LinkedIn**: اضغط Enter (skip)
- ⏩ **Google**: اضغط Enter (skip)

انتظر حتى:
```
✅ Cloud Functions deployed successfully!
```

---

### ✅ **Step 2: Configure Facebook Redirect URL** (5 دقائق)

1. افتح: https://developers.facebook.com/apps/1780064479295175

2. **Settings > Basic**
   - Scroll down > "Add Platform" > Select "Website"
   - Site URL: `http://localhost:3000`
   - Save Changes

3. **Products > Facebook Login > Settings**
   - Valid OAuth Redirect URIs:
     ```
     http://localhost:3000/oauth/callback
     ```
   - Save Changes

---

### ✅ **Step 3: Test!** (5 دقائق)

```bash
cd bulgarian-car-marketplace
npm start
```

ثم:
1. Login to your account
2. Go to: **Profile > Settings**
3. Scroll to: **Social Media Accounts**
4. Click: **Connect** (Facebook button)
5. OAuth popup يفتح
6. Authorize the app
7. يجب أن ترى: **✅ Connected**

---

## 🎯 **Option B: كل المنصات (1-2 ساعة)**

### 📱 **Twitter/X Setup:**

1. Go to: https://developer.twitter.com/en/portal/dashboard
2. Create new App
3. User authentication settings > OAuth 2.0 > ON
4. Type: Web App
5. Callback URLs:
   - `http://localhost:3000/oauth/callback`
   - `https://mobilebg.eu/oauth/callback`
6. Scopes: `tweet.read`, `tweet.write`, `users.read`
7. Copy Client ID & Secret
8. Run `.\deploy-social-oauth.ps1` again مع Twitter credentials

---

### 📱 **TikTok Setup:**

1. Go to: https://developers.tiktok.com/
2. My apps > Create new app
3. Add product: "Login Kit"
4. Redirect domain: `localhost:3000`, `mobilebg.eu`
5. Callback URLs:
   - `http://localhost:3000/oauth/callback`
   - `https://mobilebg.eu/oauth/callback`
6. Scopes: `user.info.basic`, `video.upload`, `video.publish`
7. Copy Client Key & Secret
8. Run `.\deploy-social-oauth.ps1` again مع TikTok credentials

---

### 📱 **LinkedIn Setup:**

1. Go to: https://www.linkedin.com/developers/apps
2. Create app
3. Products > Add "Sign In with LinkedIn"
4. Auth > OAuth 2.0 settings
5. Redirect URLs:
   - `http://localhost:3000/oauth/callback`
   - `https://mobilebg.eu/oauth/callback`
6. Default scopes: `w_member_social`, `r_liteprofile`
7. Copy Client ID & Secret
8. Run `.\deploy-social-oauth.ps1` again مع LinkedIn credentials

---

### 📱 **YouTube (Google) Setup:**

1. Go to: https://console.cloud.google.com/
2. APIs & Services > Credentials
3. Create OAuth 2.0 Client ID
4. Application type: Web application
5. Authorized redirect URIs:
   - `http://localhost:3000/oauth/callback`
   - `https://mobilebg.eu/oauth/callback`
6. Enable APIs: YouTube Data API v3
7. Scopes: `https://www.googleapis.com/auth/youtube.upload`
8. Copy Client ID & Secret
9. Run `.\deploy-social-oauth.ps1` again مع Google credentials

---

## 🐛 **Troubleshooting:**

### **Error: "Cloud Function not deployed"**
**الحل:**
```bash
cd functions
npm install
npm run build
firebase deploy --only functions:exchangeOAuthToken
```

---

### **Error: "redirect_uri_mismatch"**
**الحل:** تأكد من أن URL يطابق تماماً:
```
http://localhost:3000/oauth/callback
```
(بدون trailing slash، exact port)

---

### **Error: Popup blocked**
**الحل:** Allow popups في browser settings

---

### **Error: "Token exchange failed"**
**الحل:**
```bash
# Check logs
firebase functions:log

# Re-deploy
firebase deploy --only functions:exchangeOAuthToken
```

---

## ✅ **Checklist:**

### **للاستخدام الأساسي (Facebook):**
- [ ] Run `.\deploy-social-oauth.ps1`
- [ ] Add redirect URL في Facebook app
- [ ] Test connection

### **للاستخدام الكامل (جميع المنصات):**
- [ ] Create Twitter app + get credentials
- [ ] Create TikTok app + get credentials
- [ ] Create LinkedIn app + get credentials
- [ ] Create Google OAuth app + get credentials
- [ ] Run `.\deploy-social-oauth.ps1` with all credentials
- [ ] Add redirect URLs في كل المنصات
- [ ] Test each platform

---

## 📚 **Resources:**

- [Quick Start Guide](./SOCIAL_OAUTH_QUICK_START.md)
- [Full Setup Guide](./bulgarian-car-marketplace/SOCIAL_MEDIA_OAUTH_SETUP.md)
- [Facebook App Dashboard](https://developers.facebook.com/apps/1780064479295175)

---

## 🎯 **الخلاصة:**

### **الكود:** ✅ **جاهز 100%**
### **للاستخدام:** ⚠️ **يحتاج deployment + configuration**

**الوقت المطلوب:**
- Facebook فقط: **15 دقيقة**
- كل المنصات: **1-2 ساعة**

---

**🚀 ابدأ الآن:** `.\deploy-social-oauth.ps1`

