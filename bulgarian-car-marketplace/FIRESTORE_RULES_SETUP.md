# إعداد قواعد Firestore لميزات AI

## المشكلة الحالية
```
FirebaseError: Missing or insufficient permissions
```

## الحل: نشر قواعد Firestore الجديدة

### الطريقة 1: عبر Firebase Console (الأسرع)

1. افتح Firebase Console:
   https://console.firebase.google.com/project/fire-new-globul/firestore/rules

2. انسخ محتوى ملف `firestore.rules` والصقه في المحرر

3. اضغط على **Publish** (نشر)

### الطريقة 2: عبر Firebase CLI

```bash
# تثبيت Firebase CLI (إذا لم يكن مثبتاً)
npm install -g firebase-tools

# تسجيل الدخول
firebase login

# الملفات المطلوبة موجودة:
# - .firebaserc
# - firebase.json
# - firestore.rules
# - firestore.indexes.json

# نشر القواعد فقط
firebase deploy --only firestore:rules
```

## القواعد المهمة المضافة

### 1. AI Quotas (حصص الذكاء الاصطناعي)
```javascript
match /ai_quotas/{userId} {
  allow read: if isOwner(userId) || isAdmin();
  allow create: if isAuthenticated();
  allow update: if isOwner(userId) || isAdmin();
  allow delete: if isAdmin();
}
```

### 2. AI Usage Logs (سجلات استخدام AI)
```javascript
match /ai_usage_logs/{logId} {
  allow read: if isAuthenticated() && 
                 (resource.data.userId == request.auth.uid || isAdmin());
  allow create: if isAuthenticated();
  allow update, delete: if isAdmin();
}
```

## التحقق من نجاح النشر

بعد نشر القواعد:

1. افتح `/admin/ai-quotas`
2. اضغط على "إنشاء حصة" لأي مستخدم
3. يجب أن تعمل بدون أخطاء

## ملاحظات مهمة

- ✅ القواعد تسمح للمستخدمين بقراءة حصصهم الخاصة فقط
- ✅ الأدمن يمكنه إدارة جميع الحصص
- ✅ يتم إنشاء الحصة تلقائياً عند أول استخدام
- ✅ القواعد آمنة ولا تسمح بالوصول غير المصرح به

## الروابط المفيدة

- Firebase Console Rules: https://console.firebase.google.com/project/fire-new-globul/firestore/rules
- AI Quotas Manager: http://localhost:3000/admin/ai-quotas
- AI Dashboard: http://localhost:3000/ai-dashboard
