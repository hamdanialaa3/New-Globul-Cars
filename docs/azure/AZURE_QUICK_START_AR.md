# 🚀 دليل سريع: ربط Azure بالمشروع
## خطوات بسيطة لتفعيل تسجيل الدخول بحساب Microsoft

---

## ✅ ما تم إنشاؤه

تم إنشاء 6 ملفات جديدة في المشروع:

1. **`src/config/azure-config.ts`**
   - تكوين Azure (Tenant ID، Client ID، Scopes)
   - جاهز مع معلوماتك من Azure Portal

2. **`src/services/auth/azure-auth.service.ts`**
   - Service للتعامل مع Azure Authentication
   - يستخدم MSAL library

3. **`src/components/auth/AzureLoginButton.tsx`**
   - مكون React لزر تسجيل الدخول بـ Microsoft
   - جاهز للاستخدام في أي صفحة

4. **`src/pages/auth/AzureCallbackPage.tsx`**
   - صفحة معالجة Callback بعد تسجيل الدخول
   - تُضاف كـ Route: `/auth/azure/callback`

5. **`.env.azure.example`**
   - مثال على Environment Variables المطلوبة

6. **`AZURE_SETUP_GUIDE.md`**
   - دليل كامل ومفصل بالخطوات

---

## 🎯 الخطوات السريعة (5 دقائق)

### 1️⃣ تثبيت المكتبات

افتح PowerShell في مجلد المشروع:

```powershell
cd "C:\Users\hamda\Desktop\New Globul Cars"

npm install @azure/msal-browser @azure/msal-react
```

**الانتظار:** حوالي 1-2 دقيقة

---

### 2️⃣ تسجيل التطبيق في Azure Portal

1. **افتح:** https://portal.azure.com
2. **سجل دخول:** hamdanialaa@hotmail.com
3. **انتقل إلى:** Microsoft Entra ID
4. **اختر:** App registrations → New registration

**املأ النموذج:**
```
Name: Koli One - Car Marketplace
Account type: Personal Microsoft accounts
Redirect URI: 
  - Platform: Single-page application (SPA)
  - URI: http://localhost:3000/auth/azure/callback
```

5. **اضغط:** Register
6. **احفظ:** Application (client) ID من صفحة Overview

---

### 3️⃣ إضافة Environment Variables

**افتح:** `.env.local` (أو أنشئه)

**أضف:**
```env
REACT_APP_AZURE_TENANT_ID=fdb9a393-7d60-4dae-b17b-0bb89edad2fe
REACT_APP_AZURE_CLIENT_ID=<APPLICATION_ID_من_الخطوة_السابقة>
REACT_APP_AZURE_AUTH_ENABLED=true
```

**مثال:**
```env
REACT_APP_AZURE_CLIENT_ID=a1b2c3d4-e5f6-7890-abcd-1234567890ef
```

---

### 4️⃣ إضافة Redirect URI للـ Production

في Azure Portal → التطبيق الذي سجلته → Authentication:

**أضف Redirect URI:**
```
https://koli.one/auth/azure/callback
```

**أضف Logout URL:**
```
https://koli.one
```

**اضغط:** Save

---

### 5️⃣ إضافة Callback Route

**افتح:** `src/App.tsx` (أو `src/routes/auth.routes.tsx`)

**أضف Import:**
```typescript
import AzureCallbackPage from '@/pages/auth/AzureCallbackPage';
```

**أضف Route:**
```typescript
<Route path="/auth/azure/callback" element={<AzureCallbackPage />} />
```

**مثال:**
```typescript
import { Routes, Route } from 'react-router-dom';
import AzureCallbackPage from '@/pages/auth/AzureCallbackPage';

<Routes>
  {/* Existing routes */}
  <Route path="/auth/azure/callback" element={<AzureCallbackPage />} />
</Routes>
```

---

### 6️⃣ إضافة زر تسجيل الدخول

**مثال 1: في صفحة Login**

**افتح:** `src/pages/auth/LoginPage.tsx` (أو صفحة Login الموجودة)

**أضف:**
```typescript
import AzureLoginButton from '@/components/auth/AzureLoginButton';

// داخل الـ Component
<AzureLoginButton
  mode="popup"
  variant="outline"
  fullWidth
  onSuccess={(user) => {
    console.log('Azure user logged in:', user);
    // Redirect or save user
  }}
  onError={(error) => {
    console.error('Login failed:', error);
  }}
/>
```

**مثال 2: زر بسيط**

```typescript
<AzureLoginButton />
```

---

### 7️⃣ تشغيل المشروع

```powershell
npm start
```

**افتح:** http://localhost:3000

**اضغط على:** "تسجيل الدخول بحساب Microsoft"

---

## ✅ النتيجة المتوقعة

1. **عند الضغط على الزر:**
   - تفتح نافذة منبثقة (popup) من Microsoft
   - تطلب منك تسجيل الدخول بحساب Microsoft

2. **بعد تسجيل الدخول:**
   - يعود المستخدم إلى `/auth/azure/callback`
   - تظهر رسالة "جارٍ تسجيل الدخول..."
   - بعد 2 ثانية، يُحوَّل إلى الصفحة الرئيسية

3. **Console يظهر:**
   ```
   [INFO] Azure login initiated
   [INFO] Azure login successful
   Azure user logged in: { username: "...", name: "...", ... }
   ```

---

## 🐛 إذا ظهرت مشاكل

### مشكلة: "AADSTS50011: The redirect URI does not match"

**الحل:**
1. افتح Azure Portal → التطبيق → Authentication
2. تحقق من أن الـ Redirect URI **بالضبط:**
   ```
   http://localhost:3000/auth/azure/callback
   ```
3. لا تنسَ الـ `/` في النهاية!

---

### مشكلة: "Module not found: @azure/msal-browser"

**الحل:**
```powershell
npm install @azure/msal-browser @azure/msal-react
```

---

### مشكلة: "Azure MSAL library not installed"

**الحل:**
1. تأكد من تثبيت المكتبات (الخطوة 1)
2. شغّل الـ server من جديد: `npm start`

---

## 📝 للنشر على Production

### إضافة Production Redirect URI

في Azure Portal → Authentication:

```
Redirect URIs:
✅ http://localhost:3000/auth/azure/callback
✅ https://koli.one/auth/azure/callback

Logout URLs:
✅ http://localhost:3000
✅ https://koli.one
```

### Environment Variables للـ Production

في Firebase Hosting أو Platform الذي تستخدمه:

```env
REACT_APP_AZURE_TENANT_ID=fdb9a393-7d60-4dae-b17b-0bb89edad2fe
REACT_APP_AZURE_CLIENT_ID=<YOUR_CLIENT_ID>
REACT_APP_AZURE_AUTH_ENABLED=true
```

---

## 📚 ملفات مفيدة

- **`AZURE_SETUP_GUIDE.md`** - دليل كامل ومفصل
- **`.env.azure.example`** - مثال على Environment Variables
- **`src/config/azure-config.ts`** - تكوين Azure
- **`src/services/auth/azure-auth.service.ts`** - Service للتعامل مع Azure

---

## 🎉 انتهى!

الآن لديك تسجيل دخول بحساب Microsoft مدمج في المشروع!

**ملاحظة:** إذا كنت تريد ربط Azure مع Firebase، راجع القسم المناسب في `AZURE_SETUP_GUIDE.md`.

---

**تاريخ الإنشاء:** 24 يناير 2026  
**الحالة:** ✅ جاهز للاستخدام
