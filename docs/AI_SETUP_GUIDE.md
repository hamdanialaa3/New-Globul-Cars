# 🚀 AI Setup Guide - Quick Start
# دليل الإعداد السريع للذكاء الاصطناعي

**الوقت المطلوب:** 15 دقيقة  
**المستوى:** مبتدئ → متقدم

---

## ⚡ الإعداد السريع (5 دقائق)

### **الخطوة 1: الحصول على Gemini API Key**

1. افتح: https://makersuite.google.com/app/apikey
2. سجل دخول بحساب Google
3. اضغط **"Create API Key"**
4. انسخ المفتاح (يبدأ بـ `AIza...`)

### **الخطوة 2: إضافة المفتاح للمشروع**

```bash
cd bulgarian-car-marketplace

# أضف للملف .env
echo "REACT_APP_GEMINI_API_KEY=AIzaSyC1YsQz2rpK8z_6cZev9y99rV1kIUVsrFI" >> .env
```

**أو يدوياً:**
1. افتح `bulgarian-car-marketplace/.env`
2. أضف السطر:
   ```
   REACT_APP_GEMINI_API_KEY=YOUR_KEY_HERE
   ```

### **الخطوة 3: تشغيل المشروع**

```bash
npm start
```

**✅ تم! الآن AI يعمل بالكامل.**

---

## 🧪 اختبار الميزات

### **1. تحليل الصور**

1. افتح: `http://localhost:3000/sell/inserat/car/details/bilder`
2. ارفع صورة سيارة
3. AI سيتعرف عليها تلقائياً

**النتيجة المتوقعة:**
```
✅ AI detected: BMW 320i (87% confident)
```

### **2. اقتراح الأسعار**

1. افتح: `http://localhost:3000/sell/inserat/car/details/preis`
2. اضغط **"Get AI Price Suggestion"**
3. AI سيعرض نطاق السعر

**النتيجة المتوقعة:**
```
Min: €15,400
Recommended: €17,500
Max: €19,600
```

### **3. Chatbot**

1. افتح الصفحة الرئيسية
2. ابحث عن أيقونة الـ Chatbot (bottom-right)
3. اكتب أي سؤال
4. AI سيرد باللغة المناسبة

**أمثلة:**
- "كيف أبيع سيارتي؟"
- "What cars are available in Sofia?"
- "Какви коли имате?"

---

## 🔧 الإعداد المتقدم

### **Cloud Functions (اختياري)**

```bash
cd functions

# تثبيت Dependencies
npm install

# Deploy
firebase deploy --only functions:getAIPriceValuation,functions:geminiChat
```

**الفائدة:**
- معالجة من جانب الخادم
- أمان أفضل للـ API keys
- تتبع استخدام أفضل

### **Python ML Model (اختياري)**

```bash
cd ai-valuation-model

# إنشاء بيئة افتراضية
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# تثبيت المكتبات
pip install -r requirements.txt

# تدريب النموذج
python train_model.py
```

**الفائدة:**
- دقة أعلى في التسعير (85%+)
- تخصيص للسوق البلغاري
- تعلم من بياناتك الخاصة

---

## 📊 تفعيل الحصص والفوترة

### **الخطوة 1: إنشاء Firestore Collections**

في Firebase Console:

1. افتح **Firestore Database**
2. أنشئ Collection جديدة: `ai_quotas`
3. أنشئ Collection جديدة: `ai_usage_logs`

### **الخطوة 2: إعداد Security Rules**

في `firestore.rules`:

```javascript
match /ai_quotas/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}

match /ai_usage_logs/{logId} {
  allow read: if request.auth != null && 
              resource.data.userId == request.auth.uid;
  allow write: if request.auth != null;
}
```

Deploy:
```bash
firebase deploy --only firestore:rules
```

---

## 🎨 تخصيص المكونات

### **تغيير موقع Chatbot**

```tsx
<AIChatbot 
  position="bottom-left"  // بدلاً من bottom-right
  context={{ page: 'home' }}
/>
```

### **تخصيص الألوان**

في `components/AI/AIChatbot.tsx`:

```tsx
const ChatWindow = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  // غيّر الألوان هنا
`;
```

### **تعطيل ميزة معينة**

```tsx
// في ai-quota.service.ts
const AI_TIER_CONFIGS = {
  free: {
    // ...
    dailyImageAnalysis: 0,  // تعطيل تحليل الصور للـ Free tier
  }
};
```

---

## 🐛 حل المشاكل الشائعة

### **مشكلة 1: "Gemini service not initialized"**

**السبب:** API Key مفقود أو خاطئ

**الحل:**
1. تأكد من وجود `REACT_APP_GEMINI_API_KEY` في `.env`
2. أعد تشغيل `npm start`
3. تأكد أن المفتاح يبدأ بـ `AIza`

### **مشكلة 2: "Daily limit reached"**

**السبب:** استنفدت الحصة اليومية

**الحل:**
1. انتظر حتى منتصف الليل (reset تلقائي)
2. أو ترقية للـ Basic/Premium tier
3. أو مسح Firestore document يدوياً:
   ```javascript
   // Firebase Console → Firestore
   // ai_quotas/{userId} → Delete
   ```

### **مشكلة 3: Cloud Functions لا تعمل**

**السبب:** لم يتم Deploy

**الحل:**
```bash
cd functions
firebase deploy --only functions
```

### **مشكلة 4: بطء في الاستجابة**

**السبب:** Gemini API قد يكون بطيئاً أحياناً

**الحل:**
1. إضافة Timeout أطول:
   ```typescript
   // في gemini-vision.service.ts
   const result = await Promise.race([
     this.model.generateContent(...),
     new Promise((_, reject) => 
       setTimeout(() => reject('Timeout'), 30000)
     )
   ]);
   ```

---

## 📈 المراقبة والإحصائيات

### **Dashboard الاستخدام**

افتح: `http://localhost:3000/ai-dashboard`

**المعلومات المتاحة:**
- Current tier
- Usage today/month
- Remaining quota
- Total cost
- Upgrade options

### **Firebase Analytics**

```bash
# في Firebase Console
# Analytics → Events → Custom Events
```

**Events المتتبعة:**
- `ai_image_analysis_success`
- `ai_price_suggestion_requested`
- `ai_chat_message_sent`
- `ai_quota_exceeded`

---

## 💡 نصائح للأداء

### **1. Lazy Loading**

```tsx
// تحميل AI Components فقط عند الحاجة
const AIChatbot = React.lazy(() => import('@/components/AI/AIChatbot'));

<Suspense fallback={<div>Loading...</div>}>
  <AIChatbot />
</Suspense>
```

### **2. Caching**

```typescript
// في gemini-vision.service.ts
private cache = new Map<string, CarAnalysisResult>();

analyzeCarImage(file: File) {
  const hash = await this.hashFile(file);
  if (this.cache.has(hash)) {
    return this.cache.get(hash)!;
  }
  // ... analyze
  this.cache.set(hash, result);
}
```

### **3. Debouncing**

```typescript
// في AIChatbot
const debouncedSend = useDebounce(handleSend, 500);
```

---

## 🔐 الأمان

### **1. حماية API Keys**

**❌ لا تفعل:**
```typescript
// NEVER commit .env to Git
const apiKey = "AIzaSy...";  // Hardcoded key
```

**✅ افعل:**
```typescript
const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
```

### **2. Rate Limiting**

```typescript
// في ai-quota.service.ts
if (usedToday >= dailyLimit) {
  throw new Error('Rate limit exceeded');
}
```

### **3. Input Validation**

```typescript
// في gemini-chat.service.ts
if (message.length > 1000) {
  throw new Error('Message too long');
}
```

---

## 📚 موارد إضافية

### **التوثيق الرسمي:**

- **Gemini API:** https://ai.google.dev/docs
- **Firebase Functions:** https://firebase.google.com/docs/functions
- **XGBoost:** https://xgboost.readthedocs.io/

### **ملفات المشروع:**

- **التوثيق الكامل:** `/docs/AI_IMPLEMENTATION_COMPLETE.md`
- **أمثلة الكود:** `/src/components/AI/`
- **الخدمات:** `/src/services/ai/`

### **الدعم:**

- 💬 **Chatbot:** متاح في الموقع
- 📧 **Email:** tech@globulcars.bg
- 🐛 **GitHub Issues:** للمشاكل التقنية

---

## ✅ Checklist للإعداد

```
[ ] حصلت على Gemini API Key
[ ] أضفت المفتاح لـ .env
[ ] ثبتت npm packages (npm install)
[ ] شغلت المشروع (npm start)
[ ] اختبرت تحليل الصور
[ ] اختبرت اقتراح الأسعار
[ ] اختبرت Chatbot
[ ] أنشأت Firestore collections
[ ] أعددت Security Rules
[ ] Deploy Cloud Functions (اختياري)
[ ] دربت ML Model (اختياري)
```

---

## 🎉 تهانينا!

**نظام AI الخاص بك جاهز الآن للعمل!** 🚀

للأسئلة أو المشاكل، راجع:
- `/docs/AI_IMPLEMENTATION_COMPLETE.md` (التوثيق الكامل)
- قسم "حل المشاكل" أعلاه
- اتصل بالدعم الفني
