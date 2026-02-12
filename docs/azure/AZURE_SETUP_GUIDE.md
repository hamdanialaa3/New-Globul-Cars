# 🔷 دليل إعداد Azure للمشروع
## Koli One - Azure (Microsoft Entra) Integration Guide

**التاريخ:** 24 يناير 2026  
**الحالة:** جاهز للتكوين

---

## 📋 معلومات Azure الحالية

### Tenant Information
- **Tenant ID:** `fdb9a393-7d60-4dae-b17b-0bb89edad2fe`
- **Primary Domain:** `hamdanialaahotmail.onmicrosoft.com`
- **Region:** Bulgaria
- **License:** Microsoft Entra ID Free
- **Technical Contact:** hamdanialaa@hotmail.com

---

## 🚀 خطوات الإعداد (Setup Steps)

### المرحلة 1: تثبيت المكتبات المطلوبة

```bash
# في مجلد المشروع
cd "C:\Users\hamda\Desktop\New Globul Cars"

# تثبيت MSAL (Microsoft Authentication Library)
npm install @azure/msal-browser @azure/msal-react

# تثبيت Microsoft Graph SDK (اختياري)
npm install @microsoft/microsoft-graph-client
```

---

### المرحلة 2: تسجيل التطبيق في Azure Portal

1. **افتح Azure Portal**
   - انتقل إلى: https://portal.azure.com
   - سجل دخول بحساب: hamdanialaa@hotmail.com

2. **انتقل إلى Microsoft Entra ID**
   - من القائمة الجانبية، اختر "Microsoft Entra ID"
   - أو ابحث عن "Microsoft Entra ID" في شريط البحث

3. **سجل تطبيق جديد (App Registration)**
   - اضغط على "App registrations" من القائمة اليسرى
   - اضغط "New registration"
   
   **ملء البيانات:**
   - **Name:** `Koli One - Car Marketplace`
   - **Supported account types:** 
     - اختر: "Accounts in this organizational directory only (Default Directory only - Single tenant)"
     - أو: "Accounts in any organizational directory and personal Microsoft accounts" (للسماح للمستخدمين العاديين)
   
   - **Redirect URI:**
     - Platform: `Single-page application (SPA)`
     - URI Development: `http://localhost:3000/auth/azure/callback`
     - URI Production: `https://koli.one/auth/azure/callback`
   
   - اضغط "Register"

4. **احفظ Application (client) ID**
   - بعد التسجيل، ستظهر لك صفحة Overview
   - انسخ **Application (client) ID** - ستحتاجه في الخطوة التالية

---

### المرحلة 3: تكوين الـ Redirect URIs

1. في صفحة التطبيق، اختر **Authentication** من القائمة اليسرى
2. تحت **Platform configurations**، أضف:
   - **Type:** Single-page application
   - **Redirect URIs:**
     ```
     http://localhost:3000/auth/azure/callback
     https://koli.one/auth/azure/callback
     ```
3. تحت **Logout URL:**
   ```
   http://localhost:3000
   https://koli.one
   ```
4. تحت **Implicit grant and hybrid flows:**
   - ✅ Access tokens (used for implicit flows)
   - ✅ ID tokens (used for implicit and hybrid flows)
5. اضغط **Save**

---

### المرحلة 4: تكوين API Permissions

1. اختر **API permissions** من القائمة اليسرى
2. اضغط **Add a permission**
3. اختر **Microsoft Graph**
4. اختر **Delegated permissions**
5. أضف هذه الصلاحيات:
   - ✅ `openid` (مضافة تلقائياً)
   - ✅ `profile` (مضافة تلقائياً)
   - ✅ `email` (مضافة تلقائياً)
   - ✅ `User.Read` - قراءة بروفايل المستخدم
   - ✅ `offline_access` - للحصول على refresh tokens (اختياري)
6. اضغط **Add permissions**
7. اضغط **Grant admin consent for Default Directory** (إذا كنت admin)

---

### المرحلة 5: إعداد Environment Variables

1. **افتح ملف `.env.local`** (أو أنشئه إذا لم يكن موجوداً)

2. **أضف هذه المتغيرات:**

```env
# Azure Authentication
REACT_APP_AZURE_TENANT_ID=fdb9a393-7d60-4dae-b17b-0bb89edad2fe
REACT_APP_AZURE_CLIENT_ID=<ضع_Application_ID_هنا>
REACT_APP_AZURE_AUTH_ENABLED=true
```

3. **استبدل `<ضع_Application_ID_هنا>`** بالـ Application (client) ID الذي نسخته من Azure Portal

---

### المرحلة 6: إضافة زر تسجيل الدخول بـ Azure

**مثال - إضافة زر في صفحة Login:**

```typescript
// src/pages/auth/LoginPage.tsx
import { azureAuthService } from '@/services/auth/azure-auth.service';

const LoginPage = () => {
  const handleAzureLogin = async () => {
    try {
      await azureAuthService.initialize();
      await azureAuthService.loginWithPopup();
      // User is now logged in
    } catch (error) {
      console.error('Azure login failed', error);
    }
  };

  return (
    <div>
      {/* Existing login buttons */}
      
      {/* New Azure login button */}
      <button onClick={handleAzureLogin}>
        تسجيل الدخول بحساب Microsoft
      </button>
    </div>
  );
};
```

---

### المرحلة 7: معالجة Redirect Callback

**إضافة Route لمعالجة Callback:**

```typescript
// src/App.tsx أو src/routes/auth.routes.tsx
import { useEffect } from 'react';
import { azureAuthService } from '@/services/auth/azure-auth.service';

const AzureCallbackPage = () => {
  useEffect(() => {
    const handleCallback = async () => {
      const result = await azureAuthService.handleRedirectCallback();
      
      if (result && result.success) {
        // تسجيل الدخول نجح
        // احفظ بيانات المستخدم في Firebase أو Context
        console.log('Azure user:', result.account);
        
        // Redirect to dashboard or home
        window.location.href = '/';
      }
    };
    
    handleCallback();
  }, []);

  return <div>جارٍ تسجيل الدخول...</div>;
};

// إضافة Route
<Route path="/auth/azure/callback" element={<AzureCallbackPage />} />
```

---

## 🔧 تفعيل Azure في الكود

### 1. تحديث `azure-auth.service.ts`

بعد تثبيت المكتبات، قم بإلغاء التعليق على الكود في:
- `src/services/auth/azure-auth.service.ts`

ابحث عن `// TODO: Uncomment after installing` وقم بإلغاء التعليق على الكود.

### 2. ربط Azure مع Firebase (اختياري)

إذا أردت ربط تسجيل دخول Azure مع Firebase:

```typescript
// src/services/auth/azure-firebase-integration.ts
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/firebase/firebase-config';
import { azureAuthService } from './azure-auth.service';

export const loginWithAzureAndFirebase = async () => {
  // 1. تسجيل دخول Azure
  const azureResult = await azureAuthService.loginWithPopup();
  
  if (!azureResult.success) {
    throw new Error('Azure login failed');
  }
  
  // 2. إرسال Azure token إلى Cloud Function
  // Cloud Function يتحقق من التوكن ويُنشئ Custom Token للـ Firebase
  const response = await fetch('YOUR_CLOUD_FUNCTION_URL/azureLogin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      azureToken: azureResult.idToken 
    }),
  });
  
  const { firebaseToken } = await response.json();
  
  // 3. تسجيل دخول Firebase باستخدام Custom Token
  await signInWithCustomToken(auth, firebaseToken);
};
```

---

## ✅ اختبار التكامل

### 1. اختبار محلي (Development)

```bash
# شغّل السيرفر
npm start

# افتح المتصفح على
http://localhost:3000

# اضغط على "تسجيل الدخول بحساب Microsoft"
# يجب أن تُحوَّل لصفحة تسجيل دخول Microsoft
```

### 2. التحقق من الـ Callback

- بعد تسجيل الدخول، يجب أن يعود المستخدم إلى:
  ```
  http://localhost:3000/auth/azure/callback
  ```
- تحقق من Console للتأكد من عدم وجود أخطاء

### 3. التحقق من Token

```typescript
// في أي مكان في التطبيق
import { azureAuthService } from '@/services/auth/azure-auth.service';

// الحصول على Access Token
const token = await azureAuthService.getAccessToken();
console.log('Azure Access Token:', token);

// التحقق من حالة تسجيل الدخول
const isLoggedIn = azureAuthService.isAuthenticated();
console.log('Is logged in:', isLoggedIn);

// الحصول على بيانات المستخدم
const user = azureAuthService.getCurrentUser();
console.log('Current user:', user);
```

---

## 🔐 الأمان (Security Best Practices)

### 1. حماية Environment Variables

```bash
# لا تنشر هذه الملفات على Git
.env.local
.env.production.local
```

تأكد من إضافتها إلى `.gitignore`:

```gitignore
# Environment files
.env.local
.env.*.local
```

### 2. استخدام HTTPS في Production

Azure لن يعمل بشكل صحيح على HTTP في الإنتاج. تأكد من:
- ✅ استخدام HTTPS في كل الـ Redirect URIs
- ✅ شهادة SSL صالحة على koli.one

### 3. تفعيل Security Defaults

في Azure Portal:
- ✅ Security defaults مُفعَّلة (كما ظهر في معلوماتك)
- ✅ Multi-Factor Authentication (MFA) مُوصى به

---

## 📊 مراقبة الاستخدام (Monitoring)

### 1. Azure Portal - Sign-ins

- انتقل إلى: **Microsoft Entra ID > Sign-in logs**
- شاهد كل محاولات تسجيل الدخول
- راقب الأخطاء والمشاكل

### 2. Application Insights (اختياري)

لمراقبة أداء التطبيق مع Azure:

```bash
npm install @microsoft/applicationinsights-web
```

---

## 🐛 حل المشاكل الشائعة

### المشكلة 1: "AADSTS50011: The redirect URI does not match"

**الحل:**
- تأكد من أن الـ Redirect URI في Azure Portal **مطابق تماماً** للـ URI في الكود
- لا تنسَ `/auth/azure/callback` في النهاية

### المشكلة 2: "AADSTS700016: Application not found in the directory"

**الحل:**
- تأكد من صحة الـ `REACT_APP_AZURE_CLIENT_ID`
- تأكد من صحة الـ `REACT_APP_AZURE_TENANT_ID`

### المشكلة 3: "User canceled the authentication flow"

**الحل:**
- هذا طبيعي - المستخدم أغلق نافذة تسجيل الدخول
- لا حاجة للتعامل معه كخطأ

### المشكلة 4: "CORS Error"

**الحل:**
- Azure لا يتطلب CORS configuration للـ SPA
- إذا ظهرت مشكلة CORS، تحقق من:
  - الـ Redirect URI مُسجَّل كـ "Single-page application"
  - لا تستخدم "Web" platform

---

## 📚 مصادر إضافية

- [Microsoft Entra ID Documentation](https://learn.microsoft.com/en-us/entra/identity/)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [Azure Portal](https://portal.azure.com)
- [Microsoft Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer)

---

## ✅ Checklist للنشر

- [ ] تثبيت `@azure/msal-browser` و `@azure/msal-react`
- [ ] تسجيل التطبيق في Azure Portal
- [ ] إضافة Redirect URIs (development + production)
- [ ] تكوين API Permissions
- [ ] إضافة Environment Variables
- [ ] إلغاء التعليق على الكود في `azure-auth.service.ts`
- [ ] إضافة زر تسجيل الدخول بـ Azure
- [ ] إضافة Route للـ Callback
- [ ] اختبار تسجيل الدخول محلياً
- [ ] اختبار تسجيل الدخول على Production
- [ ] مراقبة Sign-in logs في Azure Portal

---

**تم الإنشاء:** 24 يناير 2026  
**الحالة:** ✅ جاهز للتطبيق  
**التالي:** تثبيت المكتبات وتسجيل التطبيق في Azure Portal

