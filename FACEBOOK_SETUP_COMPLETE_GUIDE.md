# 📘 Facebook OAuth - دليل الإعداد الكامل في Meta

## 🎯 **ملخص: ما المطلوب؟**

✅ **الكود:** جاهز 100% (لا يحتاج برمجة)  
⚙️ **الإعداد:** يحتاج 6 خطوات في Facebook Developer Console (10 دقائق)

---

## 🔑 **معلومات Facebook App الموجودة:**

```
App ID:     1780064479295175
App Secret: e762759ee883c3cbc256779ce0852e90
App Name:   BG Cars FC APP
```

**Dashboard:** https://developers.facebook.com/apps/1780064479295175

---

## 📋 **الخطوات المطلوبة في Meta (6 خطوات):**

### **Step 1: Login to Meta Dashboard** ✅

1. اذهب إلى: https://developers.facebook.com/apps/1780064479295175
2. Login بحسابك (alaa.hamdani@yahoo.com)
3. ستفتح صفحة App Dashboard

---

### **Step 2: Add Website Platform** ⚙️

**الموقع:** Settings > Basic

1. Scroll down إلى "Add Platform"
2. اضغط **"Website"**
3. في "Site URL" أدخل:
   ```
   http://localhost:3000
   ```
4. اضغط **"Save Changes"**

**لماذا؟** حتى يعرف Facebook أن التطبيق سيعمل من هذا الـ domain.

---

### **Step 3: Configure App Domains** ⚙️

**الموقع:** نفس الصفحة (Settings > Basic)

1. ابحث عن "App Domains"
2. أضف:
   ```
   localhost
   mobilebg.eu
   globul.net
   fire-new-globul.firebaseapp.com
   ```
3. اضغط **"Save Changes"**

**لماذا؟** للسماح للـ OAuth من هذه الـ domains.

---

### **Step 4: Enable Facebook Login Product** ⚙️

**الموقع:** Dashboard > Products

1. ابحث عن **"Facebook Login"** في قائمة Products
2. إذا لم يكن مفعّل:
   - اضغط **"Set Up"**
   - اختر **"Web"** platform
3. إذا كان مفعّل:
   - اضغط على **"Facebook Login"** من القائمة الجانبية

---

### **Step 5: Add OAuth Redirect URIs** ⚙️ **[الأهم]**

**الموقع:** Facebook Login > Settings

1. ابحث عن **"Valid OAuth Redirect URIs"**
2. أضف هذه الـ URLs **بالضبط**:

   **Development:**
   ```
   http://localhost:3000/oauth/callback
   ```

   **Production:**
   ```
   https://mobilebg.eu/oauth/callback
   https://fire-new-globul.firebaseapp.com/oauth/callback
   ```

3. اضغط **"Save Changes"**

**⚠️ مهم جداً:**
- الـ URL يجب أن يكون **بالضبط** كما هو (case-sensitive)
- بدون trailing slash `/`
- بدون مسافات

---

### **Step 6: Configure Permissions** ⚙️

**الموقع:** App Review > Permissions and Features

1. تأكد من تفعيل هذه الـ permissions:
   - ✅ `public_profile` (Basic - enabled by default)
   - ✅ `email` (Basic - enabled by default)
   - ⚙️ `pages_manage_posts` (قد يحتاج App Review للنشر)
   - ⚙️ `pages_read_engagement` (قد يحتاج App Review)

**للاختبار فقط:** الـ Basic permissions كافية

**للإنتاج:** قد تحتاج App Review من Facebook لـ advanced permissions

---

## 🧪 **Step 7: Test Mode vs Live Mode**

### **Development Mode** (للاختبار):
- App في **Development Mode** حالياً
- يعمل فقط مع Admins/Developers/Testers المضافين للـ App
- **لا يحتاج App Review**

**كيف تضيف testers:**
1. Roles > Test Users > Create Test User
2. أو: Roles > Roles > Add Testers (حسابات Facebook حقيقية)

### **Live Mode** (للإنتاج):
- لجعل App متاح لجميع المستخدمين
- يحتاج **App Review** من Facebook
- Settings > Basic > App Mode > Switch to Live

**للاختبار الآن:** اترك App في Development Mode

---

## ✅ **Checklist - تأكد من:**

قبل أن تجرب OAuth، تحقق من:

- [ ] ✅ App ID موجود: `1780064479295175`
- [ ] ✅ App Secret موجود: `e76...90`
- [ ] ⚙️ Website Platform مضاف (localhost:3000)
- [ ] ⚙️ App Domains محدثة
- [ ] ⚙️ Facebook Login مفعّل
- [ ] ⚙️ OAuth Redirect URIs مضافة
- [ ] ⚙️ Basic permissions enabled
- [ ] ⚙️ حسابك مضاف كـ Admin/Developer
- [ ] ✅ Cloud Function deployed (`exchangeOAuthToken`)
- [ ] ✅ Frontend code deployed (npm start)

---

## 🧪 **كيف تختبر؟**

### **1. Deploy Cloud Function أولاً:**
```powershell
.\deploy-social-oauth.ps1
```

### **2. شغّل التطبيق:**
```bash
cd bulgarian-car-marketplace
npm start
```

### **3. اختبر OAuth:**
1. افتح: http://localhost:3000
2. Login بحسابك
3. اذهب إلى: **Profile > Settings**
4. Scroll down إلى: **Social Media Accounts**
5. اضغط **"Connect"** على Facebook button
6. OAuth popup يفتح
7. Authorize the app
8. يجب أن ترى: **✅ Connected**

### **4. اختبر Cross-posting:**
1. اذهب إلى: **Create Post**
2. اكتب post
3. في Footer، ستشاهد: **"Also share on:"**
4. اختر Facebook
5. اضغط **Publish**
6. يجب أن ينشر على Facebook أيضاً!

---

## 🐛 **Troubleshooting:**

### **Error: "redirect_uri_mismatch"**
**السبب:** الـ URL في Facebook settings لا يطابق الـ URL المستخدم

**الحل:**
1. تحقق من Facebook Login > Settings > Valid OAuth Redirect URIs
2. تأكد أن URL **بالضبط**:
   ```
   http://localhost:3000/oauth/callback
   ```
   (بدون trailing slash، exact port 3000)

---

### **Error: "App Not Setup: This app is still in development mode"**
**السبب:** App في Development Mode وأنت لست Admin

**الحل:**
1. Roles > Roles > Add yourself as Admin/Developer
2. أو: Switch app to Live Mode (يحتاج App Review)

---

### **Error: "Invalid Scopes"**
**السبب:** تطلب permissions غير مفعّلة

**الحل:**
1. App Review > Permissions and Features
2. تأكد من تفعيل الـ permissions المطلوبة
3. للاختبار: استخدم Basic permissions فقط

---

### **Popup blocked**
**الحل:** Allow popups في browser settings

---

### **Error: "Token exchange failed"**
**السبب:** Cloud Function غير deployed أو configuration خطأ

**الحل:**
```bash
# Check if function exists
firebase functions:list

# Re-deploy
firebase deploy --only functions:exchangeOAuthToken

# Check logs
firebase functions:log
```

---

## 📊 **الخلاصة:**

| الجزء | يحتاج برمجة؟ | يحتاج إعداد؟ | الوقت |
|-------|-------------|--------------|-------|
| الكود (Frontend/Backend) | ❌ جاهز | ❌ جاهز | 0 دقيقة |
| Facebook App Settings | ❌ لا | ✅ نعم | 10 دقيقة |
| Cloud Function Deploy | ❌ لا | ✅ نعم | 5 دقائق |

---

## 🎯 **الخطوة التالية:**

الآن اتبع الخطوات 1-6 أعلاه في Facebook Developer Console

**Dashboard:** https://developers.facebook.com/apps/1780064479295175

---

## 📚 **Resources:**

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/web)
- [OAuth Best Practices](https://developers.facebook.com/docs/facebook-login/security)
- [App Review Process](https://developers.facebook.com/docs/app-review)

---

**💡 Tip:** ابدأ بـ Development Mode للاختبار، ثم انتقل إلى Live Mode بعد التأكد من كل شيء.

