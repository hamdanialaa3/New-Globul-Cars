# 🔧 دليل استكشاف أخطاء المصادقة وإصلاحها

## Bulgarian Car Marketplace

**التاريخ:** 10 أكتوبر 2025  
**المشكلة:** "An error occurred during Google sign-in. Please try again."

---

## 🎯 تشخيص المشكلة:

### **ما يحدث:**
```
1. ✅ الضغط على زر Google يعمل
2. ✅ النافذة المنبثقة تظهر
3. ✅ صفحة Google Sign-In تفتح
4. ❌ بعد تسجيل الدخول، يظهر خطأ
```

### **السبب المحتمل:**

```
المشكلة الأكثر احتمالاً:
━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Authorized Domains غير مُعدّة في Firebase Console

OR

❌ Google OAuth Client غير مُعدّ بشكل صحيح

OR

❌ Domain mismatch (localhost vs production)
```

---

## 🔧 الحل الفوري (خطوة بخطوة):

### **الحل #1: تحقق من Authorized Domains في Firebase**

#### **الخطوة 1: افتح Firebase Console**
```
https://console.firebase.google.com/u/0/project/studio-448742006-a3493/authentication/settings
```

#### **الخطوة 2: اذهب إلى "Authorized domains"**
```
Settings > Authorized domains
```

#### **الخطوة 3: تأكد من وجود هذه النطاقات:**
```
يجب أن تحتوي على:
☑ localhost
☑ studio-448742006-a3493.firebaseapp.com
☑ studio-448742006-a3493.web.app
☑ globul.net

إذا كان أي منها مفقود، اضغط "Add domain" وأضفه!
```

---

### **الحل #2: تحقق من Google Sign-In Configuration**

#### **افتح:**
```
https://console.firebase.google.com/u/0/project/studio-448742006-a3493/authentication/providers
```

#### **اضغط على Google:**
```
يجب أن ترى:
✅ Enabled: Yes (أخضر)
✅ Web SDK configuration: موجودة
```

#### **اضغط على "Web SDK configuration":**
```
يجب أن ترى:
- Web client ID: موجود
- Web client secret: موجود (Optional)

إذا كانت فارغة:
1. اضغط "Save" (حتى لو لم تغير شيء)
2. سيتم إنشاء Web client تلقائياً
```

---

### **الحل #3: تحقق من Google Cloud Console**

#### **الخطوة 1: افتح Google Cloud Console**
```
https://console.cloud.google.com/apis/credentials?project=studio-448742006-a3493
```

#### **الخطوة 2: ابحث عن OAuth 2.0 Client IDs**
```
يجب أن ترى:
- Web client (auto created by Google Service)
```

#### **الخطوة 3: اضغط على Web client**

#### **الخطوة 4: تأكد من "Authorized JavaScript origins":**
```
يجب أن تحتوي على:
☑ http://localhost
☑ http://localhost:3000
☑ https://studio-448742006-a3493.firebaseapp.com
☑ https://studio-448742006-a3493.web.app
☑ https://globul.net

إذا كانت فارغة أو ناقصة، أضف كل ما سبق!
```

#### **الخطوة 5: تأكد من "Authorized redirect URIs":**
```
يجب أن تحتوي على:
☑ https://studio-448742006-a3493.firebaseapp.com/__/auth/handler
☑ https://studio-448742006-a3493.web.app/__/auth/handler
☑ https://globul.net/__/auth/handler
☑ http://localhost/__/auth/handler

أضف ما ينقص!
```

#### **الخطوة 6: اضغط SAVE في Google Cloud Console**

---

## 🚀 الحل السريع (Copy-Paste Ready):

### **إعدادات Google Cloud Console:**

**افتح:**
```
https://console.cloud.google.com/apis/credentials?project=studio-448742006-a3493
```

**في Authorized JavaScript origins، أضف:**
```
http://localhost
http://localhost:3000
https://studio-448742006-a3493.firebaseapp.com
https://studio-448742006-a3493.web.app
https://globul.net
```

**في Authorized redirect URIs، أضف:**
```
https://studio-448742006-a3493.firebaseapp.com/__/auth/handler
https://studio-448742006-a3493.web.app/__/auth/handler
https://globul.net/__/auth/handler
http://localhost/__/auth/handler
```

**اضغط SAVE!**

---

## 🧪 الحل البديل (Redirect بدلاً من Popup):

إذا استمرت المشكلة، استخدم Redirect mode:

### **في SocialAuthService:**

```typescript
// Instead of signInWithPopup, use signInWithRedirect
static async signInWithGoogle(): Promise<UserCredential> {
  try {
    // Use redirect instead of popup
    await signInWithRedirect(auth, googleProvider);
    
    // The page will redirect, handle result in AuthProvider
    return new Promise(() => {}); // Never resolves, redirect happens
  } catch (error: any) {
    throw new Error(this.getErrorMessage(error.code, 'Google'));
  }
}
```

---

## 🔍 التشخيص المتقدم:

### **افتح Console (F12) وابحث عن:**

```
🔍 ابحث في Console عن:

1. "auth/unauthorized-domain"
   → الحل: أضف domain في Firebase Authorized domains

2. "auth/popup-closed-by-user"
   → المستخدم أغلق النافذة، جرب مرة أخرى

3. "auth/popup-blocked"
   → المتصفح يحجب النوافذ المنبثقة
   → الحل: السماح للنوافذ المنبثقة أو استخدام redirect

4. "auth/invalid-api-key"
   → Firebase API key غير صحيح
   → الحل: تحقق من firebase-config.ts

5. "auth/network-request-failed"
   → مشكلة إنترنت
   → الحل: تحقق من الاتصال

6. "auth/operation-not-allowed"
   → Google Sign-In غير مُفعّل في Firebase
   → الحل: فعّله في Firebase Console

7. "redirect_uri_mismatch"
   → Redirect URI غير مُضاف في Google Cloud Console
   → الحل: أضف جميع redirect URIs المطلوبة
```

---

## 🛠️ حلول سريعة:

### **حل سريع #1: امسح الكاش**

```bash
# في المتصفح:
Ctrl + Shift + Delete
→ Clear cached images and files
→ Clear cookies and site data
→ Time range: All time

# أو Hard Refresh:
Ctrl + Shift + R
```

---

### **حل سريع #2: جرب في Incognito/Private Window**

```
Ctrl + Shift + N (Chrome)
Ctrl + Shift + P (Firefox)

ثم افتح:
http://localhost:3000/login

جرب Google Sign-In
```

---

### **حل سريع #3: تعطيل Popup Blocker**

```
Chrome:
Settings → Privacy and security → Site Settings → Pop-ups and redirects
→ Allow for localhost and globul.net

Firefox:
Options → Privacy & Security → Permissions
→ Allow pop-ups for localhost
```

---

## 📋 Checklist الكامل:

### **Firebase Console:**
```
☐ Authentication > Sign-in method > Google: Enabled
☐ Authentication > Settings > Authorized domains: 
   ☐ localhost
   ☐ studio-448742006-a3493.firebaseapp.com
   ☐ studio-448742006-a3493.web.app
   ☐ globul.net
```

### **Google Cloud Console:**
```
☐ APIs & Services > Credentials > OAuth 2.0 Client IDs
☐ Authorized JavaScript origins: 5 domains added
☐ Authorized redirect URIs: 4 URIs added
☐ Save clicked
```

### **Local Setup:**
```
☐ npm start running
☐ http://localhost:3000 accessible
☐ Console (F12) open for debugging
☐ Pop-up blocker disabled
☐ Cache cleared
```

---

## 🎯 الحل المضمون 100%:

### **خيار A: استخدم Firebase Hosting للاختبار**

```bash
# بدلاً من localhost:3000
# استخدم Firebase Hosting URL:

cd bulgarian-car-marketplace
npm run build
firebase deploy --only hosting

# ثم افتح:
https://studio-448742006-a3493.web.app/login

# Google Sign-In سيعمل 100% هنا!
```

---

### **خيار B: أضف localhost بشكل صحيح**

**في Google Cloud Console > Credentials > OAuth client:**

**Authorized JavaScript origins:**
```
http://localhost
http://localhost:3000
```

**⚠️ مهم:**
- استخدم `http://` (بدون s)
- لا تضع `/` في النهاية
- localhost بدون port
- localhost:3000 مع port
- كلاهما مطلوب!

---

## 📞 الخطوات الدقيقة للحل:

### **الخطوة 1: Google Cloud Console**

```
1. افتح: https://console.cloud.google.com/
2. اختر Project: studio-448742006-a3493
3. قائمة جانبية: APIs & Services > Credentials
4. ابحث عن: OAuth 2.0 Client IDs
5. اضغط على: Web client (auto created by Google Service)
```

### **الخطوة 2: أضف JavaScript Origins**

```
في "Authorized JavaScript origins":

اضغط "+ ADD URI"

أضف واحد تلو الآخر:
1. http://localhost
2. http://localhost:3000  
3. https://studio-448742006-a3493.firebaseapp.com
4. https://studio-448742006-a3493.web.app
5. https://globul.net

⚠️ لاحظ: localhost بدون s في http
```

### **الخطوة 3: أضف Redirect URIs**

```
في "Authorized redirect URIs":

اضغط "+ ADD URI"

أضف واحد تلو الآخر:
1. https://studio-448742006-a3493.firebaseapp.com/__/auth/handler
2. https://studio-448742006-a3493.web.app/__/auth/handler
3. https://globul.net/__/auth/handler
4. http://localhost/__/auth/handler
```

### **الخطوة 4: احفظ**

```
اضغط SAVE في أسفل الصفحة
انتظر 1-2 دقيقة للتفعيل
```

### **الخطوة 5: اختبر**

```
1. امسح كاش المتصفح (Ctrl + Shift + Delete)
2. افتح Incognito (Ctrl + Shift + N)
3. اذهب إلى http://localhost:3000/login
4. جرب Google Sign-In
5. ✅ يجب أن يعمل الآن!
```

---

## 🔍 Console Debugging:

### **افتح Console (F12) وشاهد:**

**عند الضغط على Google:**
```javascript
// يجب أن ترى:
🔵 Starting Google login...
🔐 Starting Google sign-in process...
Auth domain: studio-448742006-a3493.firebaseapp.com
Firebase app: [DEFAULT]
📱 Attempting popup sign-in...
```

**عند النجاح:**
```javascript
✅ Google sign-in successful: {
  email: "user@gmail.com",
  displayName: "User Name",
  uid: "abc123..."
}
📝 Syncing Google user to Firestore...
✅ Google user synced to Firestore
✅ Google login successful: user@gmail.com
```

**عند الفشل:**
```javascript
❌ Google sign-in error details: {
  code: "auth/...",
  message: "...",
  credential: null,
  customData: {...}
}
```

**انسخ كل هذا الـ output وأرسله لي!**

---

## 🚨 الأخطاء الشائعة والحلول:

### **خطأ 1: "auth/unauthorized-domain"**

```
السبب: localhost أو globul.net غير مُضاف

الحل:
1. Firebase Console > Authentication > Settings
2. Authorized domains > Add domain
3. أضف: localhost
4. Save
```

---

### **خطأ 2: "redirect_uri_mismatch"**

```
السبب: Redirect URI غير مُضاف في Google Cloud Console

الحل:
1. Google Cloud Console > Credentials
2. OAuth 2.0 Client > Edit
3. Authorized redirect URIs > Add URI
4. أضف: http://localhost/__/auth/handler
5. Save
```

---

### **خطأ 3: "idpiframe_initialization_failed"**

```
السبب: Cookies محظورة أو third-party cookies معطلة

الحل:
Chrome:
Settings > Privacy > Cookies
→ Allow all cookies (temporary)

Firefox:
Settings > Privacy > Custom
→ Cookies: Allow all
```

---

### **خطأ 4: "auth/popup-closed-by-user"**

```
السبب: المستخدم أغلق النافذة قبل إنهاء العملية

الحل:
- جرب مرة أخرى
- انتظر حتى تكتمل العملية
```

---

## 🎯 الحل المضمون (استخدم Redirect):

إذا استمرت المشاكل مع Popup، استخدم Redirect mode:

### **تحديث مؤقت في LoginPageGlass.tsx:**

```typescript
const handleGoogleLogin = async () => {
  setLoading(true);
  setError('');
  setSuccess('');
  
  try {
    // استخدم redirect بدلاً من popup
    await SocialAuthService.signInWithGoogleRedirect();
    // الصفحة ستُعاد توجيهها، AuthProvider سيتعامل مع النتيجة
  } catch (err: any) {
    console.error('❌ Google redirect error:', err);
    setError(err.message);
    setLoading(false);
  }
};
```

---

## 📸 Screenshots المطلوبة:

### **لمساعدتك بشكل أفضل، أرسل screenshots لـ:**

1. **Firebase Console > Authentication > Settings > Authorized domains**
   
2. **Google Cloud Console > Credentials > OAuth 2.0 Client**

3. **Console (F12) بعد الضغط على Google Sign-In**

---

## 🔧 الحل السريع (نسخ ولصق):

### **أضف هذه الدومينات في Firebase:**

**Firebase Console > Authentication > Settings > Authorized domains:**
```
localhost
studio-448742006-a3493.firebaseapp.com
studio-448742006-a3493.web.app
globul.net
```

**كيف:**
```
1. افتح: https://console.firebase.google.com/u/0/project/studio-448742006-a3493/authentication/settings
2. ابحث عن: Authorized domains
3. اضغط: Add domain
4. الصق: localhost
5. اضغط: Add
6. كرر للباقي
7. ✅ تم!
```

---

## 🎯 الحل النهائي (إذا لم ينجح كل ما سبق):

### **أعد إنشاء OAuth Client:**

```
Google Cloud Console > Credentials

1. احذف OAuth 2.0 Client الموجود
2. اضغط "+ CREATE CREDENTIALS"
3. اختر "OAuth client ID"
4. Application type: Web application
5. Name: Bulgarian Car Marketplace Web
6. Authorized JavaScript origins:
   - http://localhost
   - http://localhost:3000
   - https://studio-448742006-a3493.firebaseapp.com
   - https://studio-448742006-a3493.web.app
   - https://globul.net
7. Authorized redirect URIs:
   - https://studio-448742006-a3493.firebaseapp.com/__/auth/handler
   - https://studio-448742006-a3493.web.app/__/auth/handler
   - https://globul.net/__/auth/handler
   - http://localhost/__/auth/handler
8. CREATE
9. انسخ Client ID
10. Firebase Console > Authentication > Google > Edit
11. الصق Web client ID الجديد
12. Save
13. ✅ جرب مرة أخرى!
```

---

## 💡 نصائح إضافية:

### **1. استخدم Firebase Hosting للاختبار:**
```
بدلاً من localhost، استخدم:
https://studio-448742006-a3493.web.app/login

عادةً يعمل 100% بدون مشاكل!
```

### **2. جرّب متصفح آخر:**
```
Chrome → Firefox
أو
Firefox → Chrome

أحياناً المشكلة تكون في المتصفح
```

### **3. تحقق من الوقت/التاريخ:**
```
تأكد أن الوقت/التاريخ صحيح في جهازك
OAuth يعتمد على الوقت الصحيح!
```

---

## 📞 اتصل بي بهذه المعلومات:

**1. نسخ كل Console output عند الضغط على Google**

**2. أخبرني: هل localhost في Authorized domains؟**

**3. Screenshot من Google Cloud Console > Credentials**

**4. أخبرني: هل تعمل على localhost أم globul.net؟**

---

**🚀 سأصلح المشكلة فوراً بمجرد معرفة التفاصيل!**

**📞 أرسل لي Console output الآن!**

