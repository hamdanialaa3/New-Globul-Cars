# 🚀 Quick Start Guide - AI Chat System
# دليل البدء السريع - نظام المحادثة بالذكاء الاصطناعي

## ⚡ 3 خطوات للبدء | 3 Steps to Get Started

### 1️⃣ إعداد Gemini API Key
```bash
# في terminal من جذر المشروع
firebase functions:secrets:set GEMINI_API_KEY

# أدخل مفتاحك عندما يطلب منك:
# احصل على مفتاح من: https://aistudio.google.com/app/apikey
```

### 2️⃣ نشر Cloud Functions
```bash
cd functions
npm install
npm run build
firebase deploy --only functions:geminiChat,functions:suggestPriceAI,functions:analyzeProfileAI
```

### 3️⃣ نشر الواجهة الأمامية
```bash
cd bulgarian-car-marketplace
npm install
npm run build
firebase deploy --only hosting
```

---

## ✅ التحقق من التشغيل | Verify Installation

### اختبار 1: التحقق من الأيقونة
1. افتح الموقع
2. ابحث عن أيقونة دائرية زرقاء أسفل اليمين (💬)
3. إذا ظهرت → ✅ جيد

### اختبار 2: فتح المحادثة
1. اضغط على الأيقونة
2. يجب أن تظهر نافذة المحادثة
3. رسالة الترحيب تظهر → ✅ جيد

### اختبار 3: إرسال رسالة
1. اكتب: "Hello"
2. اضغط Enter
3. الذكاء الاصطناعي يرد → ✅ جيد

---

## 🎯 الأوامر المفيدة | Useful Commands

### تطوير محلي | Local Development
```bash
# تشغيل الواجهة الأمامية
cd bulgarian-car-marketplace
npm start

# تشغيل Functions محلياً
cd functions
npm run serve
```

### نشر | Deployment
```bash
# نشر كل شيء
firebase deploy

# نشر Functions فقط
firebase deploy --only functions

# نشر Hosting فقط
firebase deploy --only hosting
```

### عرض السجلات | View Logs
```bash
# سجلات Functions الحية
firebase functions:log

# سجلات وظيفة محددة
firebase functions:log --only geminiChat
```

---

## 🔍 اختبار الميزات | Test Features

### 1. المحادثة العامة | General Chat
```
User: "مرحبا، كيف حالك؟"
AI: يرد بالترحيب ويسأل كيف يمكنه المساعدة
```

### 2. السؤال عن الأسعار | Price Questions
```
User: "What is the price of BMW 3 Series 2020?"
AI: يعطي نطاق الأسعار بناءً على السوق البلغاري
```

### 3. نصائح البيع | Selling Tips
```
User: "How can I sell my car faster?"
AI: يعطي نصائح عملية لتحسين الإعلان
```

### 4. توصيات السيارات | Car Recommendations
```
User: "أريد سيارة عائلية بسعر معقول"
AI: يقترح سيارات مناسبة بناءً على الميزانية
```

---

## 🌍 تبديل اللغة | Language Switching

### طريقة 1: من واجهة المستخدم
1. اضغط على أيقونة العلم في Header
2. اختر البلغارية (bg) أو الإنجليزية (en)
3. الواجهة تتحدث تلقائياً

### طريقة 2: برمجياً
```typescript
const { setLanguage } = useLanguage();

// تغيير إلى البلغارية
setLanguage('bg');

// تغيير إلى الإنجليزية
setLanguage('en');
```

---

## 📊 مراقبة الاستخدام | Monitor Usage

### عرض حصص المستخدم | View User Quotas
1. افتح Firebase Console
2. اذهب إلى Firestore Database
3. افتح collection `ai_quotas`
4. ابحث عن userId
5. شاهد `usedChatMessages` و `dailyChatMessages`

### عرض سجل الاستخدام | View Usage Logs
1. افتح Firestore Database
2. افتح collection `ai_usage_logs`
3. فلتر حسب `userId` أو `feature`
4. شاهد الإحصائيات

---

## 🛠️ حل المشاكل السريع | Quick Troubleshooting

### المشكلة: الزر لا يظهر
```typescript
// تحقق من App.tsx
import { RobotChatIcon } from '@/components/AI/RobotChatIcon';

// تأكد من وجود هذا السطر
<RobotChatIcon />
```

### المشكلة: النافذة لا تفتح
```typescript
// تحقق من console في المتصفح
// F12 → Console
// ابحث عن أخطاء JavaScript
```

### المشكلة: لا يرد الذكاء الاصطناعي
```bash
# تحقق من Functions logs
firebase functions:log --only geminiChat

# ابحث عن:
# ❌ "GEMINI_API_KEY not configured" → أضف المفتاح
# ❌ "Quota exceeded" → انتظر حتى اليوم التالي
```

### المشكلة: خطأ CORS
```bash
# تأكد من نشر Functions في نفس المشروع
firebase use --add
# اختر مشروعك
```

---

## 🎨 تخصيص الواجهة | Customize UI

### تغيير موضع الأيقونة
```typescript
// في RobotChatIcon.tsx
const FloatingContainer = styled.div`
  position: fixed;
  right: 32px;           // ← غير هذا
  bottom: 244px;         // ← وهذا
  z-index: 1000;
`;
```

### تغيير الألوان
```typescript
// في RobotChatIcon.tsx
const ChatButton = styled.button<{ $isActive: boolean }>`
  background: ${props => props.$isActive 
    ? 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)'  // ← مفتوح
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'  // ← مغلق
  };
`;
```

### تغيير حجم النافذة
```typescript
// في AIChatbot.tsx
const ChatWindow = styled.div<{ $position: string }>`
  width: 380px;          // ← العرض
  height: 550px;         // ← الارتفاع
`;
```

---

## 📞 الدعم | Support

### وثائق كاملة
📄 `docs/AI_CHAT_SYSTEM_README.md`

### ملخص سريع بالعربية
📄 `docs/AI_CHAT_SUMMARY_AR.md`

### GitHub Issues
🐛 [فتح مشكلة جديدة](https://github.com/your-repo/issues/new)

---

## ✅ قائمة التحقق | Checklist

قبل الإطلاق، تأكد من:

- [ ] ✅ Gemini API Key مضاف للـ Secrets
- [ ] ✅ Functions منشورة بنجاح
- [ ] ✅ Hosting منشور بنجاح
- [ ] ✅ الأيقونة تظهر في الموقع
- [ ] ✅ نافذة المحادثة تفتح
- [ ] ✅ الذكاء الاصطناعي يرد على الرسائل
- [ ] ✅ اللغتين تعملان (BG + EN)
- [ ] ✅ نظام الحصص يعمل
- [ ] ✅ السجلات تُحفظ في Firestore

---

## 🎉 مبروك!

إذا نجحت جميع الاختبارات، فأنت الآن لديك:

✅ نظام محادثة ذكاء اصطناعي كامل
✅ متصل بشكل آمن مع Gemini AI
✅ يدعم البلغارية والإنجليزية
✅ نظام حصص للمستخدمين
✅ سجلات كاملة للاستخدام

**استمتع بنظام الذكاء الاصطناعي! 🚀**

---

**آخر تحديث:** 21 نوفمبر 2025
**الإصدار:** 1.0.0
