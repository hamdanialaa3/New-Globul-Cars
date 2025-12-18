# إصلاح مشكلة CORS في Firebase Storage

## المشكلة
خطأ CORS عند محاولة الوصول إلى صور Firebase Storage من localhost:3000:
```
Access to image at 'https://firebasestorage.googleapis.com/...' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## السبب
Firebase Storage يحتاج إلى تطبيق قواعد CORS يدوياً باستخدام Google Cloud SDK.

## الحل

### الخطوة 1: تثبيت Google Cloud SDK
إذا لم يكن مثبتاً، قم بتحميله من:
https://cloud.google.com/sdk/docs/install

### الخطوة 2: تسجيل الدخول
```bash
gcloud auth login
```

### الخطوة 3: تعيين المشروع
```bash
gcloud config set project fire-new-globul
```

### الخطوة 4: تطبيق قواعد CORS
يوجد ملف `cors.json` جاهز في جذر المشروع. قم بتطبيقه:

```bash
# من داخل مجلد المشروع
gsutil cors set cors.json gs://fire-new-globul.firebasestorage.app
```

### الخطوة 5: التحقق من التطبيق
```bash
gsutil cors get gs://fire-new-globul.firebasestorage.app
```

## قواعد CORS الحالية (cors.json)
```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "X-Requested-With"]
  }
]
```

## ملاحظات هامة

### 1. أمان الإنتاج
القاعدة الحالية `"origin": ["*"]` تسمح بالوصول من أي مصدر. للإنتاج، استخدم:
```json
{
  "origin": ["https://yourdomain.com", "http://localhost:3000"],
  "method": ["GET", "HEAD"],
  "maxAgeSeconds": 3600
}
```

### 2. إذا لم يعمل الحل مباشرة
- انتظر 5-10 دقائق لتطبيق التغييرات
- امسح cache المتصفح: `Ctrl + Shift + Delete`
- جرب التصفح الخاص (Incognito Mode)
- أعد تشغيل التطبيق

### 3. حل بديل مؤقت (للتطوير فقط)
إذا كنت تريد حلاً سريعاً أثناء التطوير:

#### استخدم Cloud Functions Proxy:
```typescript
// functions/src/image-proxy.ts
import { onRequest } from 'firebase-functions/v2/https';
import { getStorage } from 'firebase-admin/storage';

export const imageProxy = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET');
  
  const imagePath = req.query.path as string;
  const bucket = getStorage().bucket();
  const file = bucket.file(imagePath);
  
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 3600000 // 1 hour
  });
  
  res.redirect(url);
});
```

## التحقق من حل المشكلة

بعد تطبيق الحل:
1. أعد تحميل الصفحة
2. افتح Developer Tools (F12)
3. تحقق من Console - يجب ألا ترى خطأ CORS
4. تحقق من Network tab - يجب أن تظهر الصور بنجاح (Status 200)

## الأوامر المختصرة

### تطبيق CORS سريعاً:
```powershell
# PowerShell
cd "C:\Users\hamda\Desktop\New Globul Cars"
gsutil cors set cors.json gs://fire-new-globul.firebasestorage.app
```

### التحقق:
```powershell
gsutil cors get gs://fire-new-globul.firebasestorage.app
```

## المشاكل الشائعة

### 1. "gsutil: command not found"
- قم بتثبيت Google Cloud SDK
- أعد تشغيل PowerShell بعد التثبيت

### 2. "AccessDeniedException"
- تأكد من تسجيل الدخول: `gcloud auth login`
- تأكد من اختيار المشروع الصحيح: `gcloud config set project fire-new-globul`

### 3. لا تزال المشكلة موجودة
- انتظر 5-10 دقائق
- امسح cache المتصفح
- جرب في وضع التصفح الخاص

## الحلول المطبقة في الكود

### 1. تحديث قواعد Firestore
✅ تم تحديث قواعد `leaderboards` للسماح بالكتابة من المستخدمين المصادق عليهم

### 2. تحسين معالجة الأخطاء
✅ تم تحسين `leaderboard.service.ts` لمعالجة أخطاء التخزين المؤقت بشكل أفضل

### 3. قواعد Storage
✅ قواعد `storage.rules` تسمح بالقراءة العامة للصور:
```
allow read: if true;
```

## الخطوات التالية

1. **قم بتطبيق الـ Firestore Rules الجديدة:**
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **قم بتطبيق قواعد CORS:**
   ```bash
   gsutil cors set cors.json gs://fire-new-globul.firebasestorage.app
   ```

3. **اختبر التطبيق:**
   - أعد تحميل الصفحة
   - تحقق من عدم وجود أخطاء CORS
   - تحقق من عمل Leaderboard بدون أخطاء permissions
