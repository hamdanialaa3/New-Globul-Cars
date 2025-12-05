# 📧 Email Service Setup Guide

**تاريخ الإنشاء**: 5 ديسمبر 2025  
**الوقت المطلوب**: 20-30 دقيقة  
**الصعوبة**: ⭐ سهل

---

## 🎯 ما تم إنجازه

✅ **إنشاء Email Service** (`functions/src/email-service.ts`)  
✅ **تحديث VerificationService** مع Email integration  
✅ **إنشاء Email Templates** (بلغاري + إنجليزي)  
✅ **إزالة TODO Comments** من VerificationService

---

## 📋 خطوات الإعداد

### 1️⃣ اختيار Email Provider

**الخيار الأول: SendGrid (موصى به)**
- ✅ سهل الإعداد
- ✅ 100 إيميل مجاني يومياً
- ✅ Templates جاهزة
- ✅ Analytics مدمج

**الخيار الثاني: Mailgun**
- ✅ 5000 إيميل مجاني شهرياً
- ✅ API قوي
- ⚠️ إعداد أكثر تعقيداً

### 2️⃣ إعداد SendGrid (الخيار الموصى به)

#### أ) إنشاء حساب SendGrid
1. اذهب إلى [sendgrid.com](https://sendgrid.com)
2. أنشئ حساب مجاني
3. تحقق من الإيميل

#### ب) الحصول على API Key
1. في SendGrid Dashboard، اذهب إلى **Settings > API Keys**
2. اضغط **Create API Key**
3. اختر **Full Access** أو **Restricted Access**
4. انسخ API Key (يبدأ بـ `SG.`)

#### ج) إعداد Domain Authentication (اختياري)
1. اذهب إلى **Settings > Sender Authentication**
2. اضغط **Authenticate Your Domain**
3. أدخل domain الخاص بك (مثل `globul-cars.com`)
4. أضف DNS records المطلوبة

### 3️⃣ تحديث Firebase Functions Config

```bash
cd functions

# إضافة SendGrid API Key
firebase functions:config:set sendgrid.api_key="SG.your_api_key_here"

# إضافة From Email (اختياري)
firebase functions:config:set sendgrid.from_email="noreply@globul-cars.com"
firebase functions:config:set sendgrid.from_name="Globul Cars"

# عرض الإعدادات للتأكد
firebase functions:config:get
```

### 4️⃣ تثبيت Dependencies

```bash
cd functions
npm install @sendgrid/mail
npm run build
```

### 5️⃣ نشر Functions

```bash
firebase deploy --only functions:sendEmail,functions:sendVerificationSubmittedEmail,functions:sendVerificationApprovedEmail,functions:sendVerificationRejectedEmail,functions:sendAdminVerificationNotification
```

### 6️⃣ تحديث Environment Variables (اختياري)

في `.env`:
```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.your_api_key
SENDGRID_FROM_EMAIL=noreply@globul-cars.com
SENDGRID_FROM_NAME=Globul Cars

# Admin Email for notifications
ADMIN_EMAIL=admin@globul-cars.com
```

---

## 🧪 اختبار Email Service

### 1. اختبار من Firebase Console

```javascript
// في Firebase Console > Functions
const testEmail = {
  to: "test@example.com",
  templateId: "verification_submitted",
  language: "bg",
  variables: {
    userName: "Test User",
    profileType: "dealer",
    submissionDate: "5 ديسمبر 2025"
  }
};

// استدعاء Function
sendEmail(testEmail);
```

### 2. اختبار من التطبيق

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

// اختبار إرسال إيميل تأكيد التحقق
const testVerificationEmail = async () => {
  const sendEmail = httpsCallable(functions, 'sendVerificationSubmittedEmail');
  
  try {
    const result = await sendEmail({
      userId: 'test-user-id',
      userEmail: 'test@example.com',
      userName: 'Test User',
      profileType: 'dealer'
    });
    
    console.log('Email sent:', result.data);
  } catch (error) {
    console.error('Email error:', error);
  }
};
```

### 3. اختبار جميع Templates

```typescript
// اختبار جميع أنواع الإيميلات
const testAllEmails = async () => {
  const functions = getFunctions();
  
  // 1. تأكيد التحقق
  await httpsCallable(functions, 'sendVerificationSubmittedEmail')({
    userId: 'test',
    userEmail: 'user@test.com',
    userName: 'Test User',
    profileType: 'dealer'
  });
  
  // 2. موافقة على التحقق
  await httpsCallable(functions, 'sendVerificationApprovedEmail')({
    userId: 'test',
    userEmail: 'user@test.com',
    userName: 'Test User'
  });
  
  // 3. رفض التحقق
  await httpsCallable(functions, 'sendVerificationRejectedEmail')({
    userId: 'test',
    userEmail: 'user@test.com',
    userName: 'Test User',
    rejectionReason: 'Documents not clear'
  });
  
  // 4. إشعار الأدمن
  await httpsCallable(functions, 'sendAdminVerificationNotification')({
    userName: 'Test User',
    userEmail: 'user@test.com',
    profileType: 'dealer',
    requestId: 'req-123'
  });
};
```

---

## 📊 مراقبة الإيميلات

### 1. في SendGrid Dashboard
- **Activity Feed**: عرض جميع الإيميلات المرسلة
- **Statistics**: معدلات التسليم والفتح
- **Suppressions**: الإيميلات المحظورة

### 2. في Firebase Console
- **Functions Logs**: أخطاء الإرسال
- **Firestore**: `email_logs` collection

### 3. في التطبيق
```typescript
// عرض سجل الإيميلات
const getEmailLogs = async () => {
  const logsQuery = query(
    collection(db, 'email_logs'),
    orderBy('timestamp', 'desc'),
    limit(50)
  );
  
  const snapshot = await getDocs(logsQuery);
  return snapshot.docs.map(doc => doc.data());
};
```

---

## 🔧 استكمال TODO Comments

تم إكمال جميع TODO المتعلقة بـ Email Service:

### في `VerificationService.ts`:

```typescript
// ✅ DONE - Line 218
// TODO: Send email notification to admin
// تم تطبيقه في sendVerificationEmails()

// ✅ DONE - Line 219  
// TODO: Send confirmation email to user
// تم تطبيقه في sendVerificationEmails()

// ✅ DONE - Line 287
// TODO: Send approval email to user
// تم تطبيقه في sendApprovalEmail()

// ✅ DONE - Line 321
// TODO: Send rejection email to user with reason
// تم تطبيقه في sendRejectionEmail()

// ✅ DONE - Line 288 & 322
// TODO: Log action in adminLogs
// تم تطبيقه في logAdminAction()
```

---

## 🎨 تخصيص Email Templates

### 1. تعديل Templates الموجودة

في `functions/src/email-service.ts`:

```typescript
// تخصيص template التأكيد
verification_submitted: {
  subject: {
    bg: 'تم استلام طلب التحقق - شركتك',
    en: 'Verification Request Received - Your Company'
  },
  html: {
    bg: `
      <div style="font-family: Arial, sans-serif;">
        <!-- HTML template باللغة البلغارية -->
      </div>
    `,
    en: `
      <div style="font-family: Arial, sans-serif;">
        <!-- HTML template in English -->
      </div>
    `
  }
}
```

### 2. إضافة Templates جديدة

```typescript
// إضافة template جديد
welcome_email: {
  subject: {
    bg: 'مرحباً بك في Globul Cars',
    en: 'Welcome to Globul Cars'
  },
  // ... باقي التفاصيل
}
```

### 3. استخدام SendGrid Templates (متقدم)

```typescript
// استخدام SendGrid Dynamic Templates
const msg = {
  to: userEmail,
  from: 'noreply@globul-cars.com',
  templateId: 'd-1234567890abcdef', // SendGrid Template ID
  dynamicTemplateData: {
    userName: 'Test User',
    profileType: 'dealer'
  }
};
```

---

## 🚀 الخطوات التالية

### مكتمل ✅:
1. ✅ إعداد Email Service
2. ✅ إنشاء Templates أساسية
3. ✅ تكامل مع Verification System
4. ✅ إضافة Logging
5. ✅ دعم اللغتين (بلغاري + إنجليزي)

### قريباً 🔄:
6. 🔄 إضافة Welcome Email للمستخدمين الجدد
7. 🔄 إشعارات الدفع (Stripe integration)
8. 🔄 Newsletter system
9. 🔄 Password reset emails
10. 🔄 Car listing notifications

### لاحقاً 🔮:
11. 🔮 Email marketing campaigns
12. 🔮 A/B testing للـ templates
13. 🔮 Advanced analytics
14. 🔮 SMS notifications

---

## 💡 نصائح مهمة

### الأمان:
- ❌ **لا تضع** API Keys في الكود
- ✅ **استخدم** Firebase Functions Config
- ✅ **تحقق من** sender authentication
- ✅ **راقب** bounce rates

### الأداء:
- 📧 **استخدم** batch sending للإيميلات المتعددة
- ⏱️ **أضف** retry logic للفشل المؤقت
- 📊 **راقب** delivery rates
- 🔄 **استخدم** queues للإيميلات الكثيرة

### التجربة:
- 🎨 **صمم** templates responsive
- 🌍 **اختبر** في clients مختلفة
- 📱 **تأكد من** mobile compatibility
- 🔗 **أضف** unsubscribe links

---

## 🆘 استكشاف الأخطاء

### خطأ: "API key not valid"
**الحل**: تحقق من SendGrid API Key في Firebase Config

### خطأ: "From email not verified"  
**الحل**: تحقق من Domain Authentication في SendGrid

### خطأ: "Template not found"
**الحل**: تأكد من templateId في EMAIL_TEMPLATES

### خطأ: "Function timeout"
**الحل**: زيادة timeout في Firebase Functions

---

## 📞 الدعم

- 📚 [SendGrid Documentation](https://docs.sendgrid.com/)
- 🔥 [Firebase Functions Guide](https://firebase.google.com/docs/functions)
- 💬 [SendGrid Support](https://support.sendgrid.com/)
- 📧 Email: globul.net.m@gmail.com

---

**تم بواسطة**: Amazon Q Developer  
**آخر تحديث**: 5 ديسمبر 2025  
**الحالة**: ✅ جاهز للتطبيق 🚀