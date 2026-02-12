# 🔧 AI Chat Troubleshooting Guide
## دليل حل مشاكل الدردشة مع AI

### تم إصلاح المشكلات التالية:

#### ✅ 1. **مشكلة لون النص في Dark Mode** - FIXED ✓
**المشكلة:** النص الذي تكتبه يظهر غامق جداً في الوضع الليلي
**الحل:** تم تغيير لون النص من `theme.colors.text.primary` إلى `rgba(255,255,255,0.95)` في Dark Mode
**الملف:** `src/components/AI/UnifiedAIChat.tsx` (سطر 343)
**النتيجة:** النص الآن يظهر بوضوح كامل في الوضع الليلي ✨

---

#### ⏳ 2. **مشكلة الاتصال بـ Gemini Chat** - IMPROVED

**ما تم تحسينه:**
- ✅ إضافة تهيئة تلقائية للـ Quota عند أول استخدام
- ✅ معالجة أخطاء أفضل وأوضح
- ✅ التحقق من وجود API Key
- ✅ رسائل خطأ محددة حسب نوع المشكلة

**الملفات المعدلة:**
- `functions/src/ai-functions.ts` - تحسين `geminiChat` function
- `src/services/ai/ai-chat-debug.service.ts` - خدمة تصحيح جديدة

---

## 🔍 كيفية تتبع المشكلة (في المتصفح Console)

### 1. اختبار الاتصال الأساسي
```javascript
// افتح المتصفح Console (F12) والصق هذا:
import { aiChatDebugService } from '/src/services/ai/ai-chat-debug.service.ts';
await aiChatDebugService.testConnection('hello');
```

### 2. تشخيص كامل
```javascript
// هذا سيختبر كل شيء:
await aiChatDebugService.runFullDiagnostics();
```

### 3. نتائج التشخيص المتوقعة:

#### ✅ إذا كانت النتيجة:
```json
{
  "auth": { "authenticated": true, "uid": "xxx", "email": "user@example.com" },
  "quota": { "hasQuota": true, "remaining": 10 },
  "connection": { "success": true, "response": "Response from AI" },
  "apiKey": { "configured": true },
  "summary": "✅ Everything is working! Your AI Chat is ready."
}
```
**المعنى:** كل شيء يعمل بشكل صحيح! 🎉

---

#### ❌ إذا كانت النتيجة:

**المشكلة 1: Not authenticated**
```json
"summary": "Authentication required first"
```
**الحل:** يجب تسجيل الدخول أولاً

---

**المشكلة 2: API Key not configured**
```json
"apiKey": { "configured": false, "message": "Gemini API Key is not configured" }
```
**الحل:** تعيين متغير البيئة `GOOGLE_GENERATIVE_AI_KEY` في Firebase Cloud Functions:
1. افتح [Firebase Console](https://console.firebase.google.com/)
2. انتقل إلى Cloud Functions → الإعدادات
3. أضف متغير البيئة: `GOOGLE_GENERATIVE_AI_KEY=<your-api-key>`

---

**المشكلة 3: Quota exceeded**
```json
"quota": { "hasQuota": false, "message": "Quota exceeded. Reason: Daily limit reached" }
```
**الحل:** انتظر حتى الغد (يتم إعادة تعيين الـ Quota يومياً)

---

**المشكلة 4: Request timeout**
```json
"connection": { "success": false, "message": "Request timeout after 10 seconds" }
```
**الحل:** 
- تحقق من سرعة الإنترنت
- جرب من جهاز آخر
- تحقق من حالة Firebase في [Status Page](https://status.firebase.google.com/)

---

## 📋 الخطوات التالية:

### للمطورين:
1. **نشر التحديثات:**
   ```bash
   npm run deploy:functions
   ```

2. **اختبر في البيئة:**
   ```bash
   npm run dev
   # ثم افتح المتصفح وادخل إلى /messages
   # اختبر الدردشة
   ```

3. **إذا استمرت المشكلة:**
   - تحقق من Cloud Functions logs: `firebase functions:log --limit 100`
   - تحقق من Firestore Rules في `firestore.rules`
   - تحقق من أن المستخدم يملك صلاحيات القراءة/الكتابة في `ai_quotas`

---

### للمستخدمين:
1. **نظف ذاكرة المتصفح (Cache):**
   - اضغط `Ctrl+Shift+Delete`
   - امسح "Cookies and cached images and files"

2. **أعد تحميل الصفحة:**
   - `Ctrl+F5` أو `Cmd+Shift+R`

3. **جرب من متصفح آخر**

4. **إذا استمرت المشكلة:** اتصل بـ [support@koli.one](mailto:support@koli.one)

---

## 📊 معلومات مفيدة:

### Dark Mode Colors (الألوان في الوضع الليلي):
```typescript
// Input Text (ما يكتبه المستخدم)
الآن: rgba(255, 255, 255, 0.95)  // 95% أبيض (واضح جداً) ✨

// Placeholder (النص الخافت)
الحالي: rgba(255, 255, 255, 0.4)  // 40% أبيض (خافت)

// Background (خلفية حقل الإدخال)
الحالي: rgba(255, 255, 255, 0.06) // شفاف تماماً مع لون أبيض خافت
```

---

## 🚀 الميزات الجديدة:

### 1. **خدمة التصحيح الجديدة** (`ai-chat-debug.service.ts`)
يمكنك الآن تشخيص المشاكل تلقائياً:
```typescript
// الاختبار السريع
await aiChatDebugService.testConnection('hi');

// الاختبار الشامل
await aiChatDebugService.runFullDiagnostics();

// فحص الـ Quota
await aiChatDebugService.checkQuota();

// فحص المصادقة
await aiChatDebugService.checkAuth();

// فحص الـ API Key
await aiChatDebugService.checkApiKey();
```

### 2. **معالجة أخطاء محسّنة**
- رسائل خطأ واضحة بالعربية والإنجليزية
- تمييز بين أنواع الأخطاء المختلفة
- معلومات تصحيح لكل خطأ

### 3. **Quota Initialization التلقائية**
- لا حاجة لتهيئة يدوية للـ Quota
- ينشأ الـ Quota تلقائياً عند أول استخدام
- حدود يومية واضحة: 10 رسائل يومياً للمستخدمين المجانيين

---

## 🔐 الأمان:

### الـ Quota محمي بـ:
- ✅ مصادقة Firebase (Auth)
- ✅ قواعد Firestore (Rules)
- ✅ تحديد حدود يومية
- ✅ تتبع التكاليف والاستخدام

### البيانات محمية:
- ✅ الرسائل تُخزن بآمان في Firestore
- ✅ لا توجد رسائل مخبأة في السجلات
- ✅ كل مستخدم يرى رسائله فقط

---

## 📞 للمساعدة:

إذا استمرت المشكلة بعد محاولة كل الحلول:
1. اجمع معلومات التشخيص من `aiChatDebugService.runFullDiagnostics()`
2. خذ لقطة شاشة من الخطأ
3. اتصل بـ support@koli.one مع هذه المعلومات

---

**آخر تحديث:** January 26, 2026  
**الحالة:** ✅ جميع المشاكل تم تحديدها وحلها بشكل أولي
