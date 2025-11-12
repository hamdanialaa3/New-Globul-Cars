# 🤖 AI Setup Guide - Free Gemini Integration

## ✅ ما تم إنشاؤه:

### **1. Services:**
- ✅ `src/services/ai/gemini-vision.service.ts` - تحليل الصور
- ✅ `src/services/ai/gemini-chat.service.ts` - المحادثات الذكية
- ✅ `src/services/ai/index.ts` - Exports

### **2. Types:**
- ✅ `src/types/ai.types.ts` - TypeScript types

### **3. Components:**
- ✅ `src/components/AI/AIImageAnalyzer.tsx` - مكون تحليل الصور
- ✅ `src/components/AI/index.ts` - Exports

### **4. Hooks:**
- ✅ `src/hooks/useAIImageAnalysis.ts` - Hook للتحليل

---

## 🚀 خطوات التفعيل:

### **الخطوة 1: تثبيت المكتبة**
```bash
cd bulgarian-car-marketplace
npm install @google/generative-ai
```

### **الخطوة 2: الحصول على API Key (مجاني)**
1. اذهب إلى: https://makersuite.google.com/app/apikey
2. سجل دخول بحساب Google
3. اضغط "Create API Key"
4. انسخ المفتاح

### **الخطوة 3: إضافة المفتاح للـ .env**
```bash
# في ملف: bulgarian-car-marketplace/.env
REACT_APP_GEMINI_KEY=your_api_key_here
```

### **الخطوة 4: إعادة تشغيل السيرفر**
```bash
npm start
```

---

## 📝 كيفية الاستخدام:

### **مثال 1: في صفحة إضافة سيارة**
```typescript
import { AIImageAnalyzer } from '@/components/AI';

const SellPage = () => {
  const handleAnalysisComplete = (result) => {
    // ملء النموذج تلقائياً
    setFormData({
      make: result.make,
      model: result.model,
      year: result.year,
      color: result.color
    });
  };

  return (
    <div>
      <AIImageAnalyzer 
        onAnalysisComplete={handleAnalysisComplete}
        onError={(err) => console.error(err)}
      />
    </div>
  );
};
```

### **مثال 2: استخدام Hook**
```typescript
import { useAIImageAnalysis } from '@/hooks/useAIImageAnalysis';

const MyComponent = () => {
  const { analyzing, result, analyzeImage, isReady } = useAIImageAnalysis();

  const handleUpload = async (file: File) => {
    const result = await analyzeImage(file);
    if (result) {
      console.log('Car detected:', result.make, result.model);
    }
  };

  return (
    <div>
      {isReady ? (
        <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
      ) : (
        <p>AI not configured</p>
      )}
      {analyzing && <p>Analyzing...</p>}
      {result && <p>Found: {result.make} {result.model}</p>}
    </div>
  );
};
```

---

## 🎯 الميزات المتاحة:

### **1. تحليل صور السيارات**
```typescript
import { geminiVisionService } from '@/services/ai';

const result = await geminiVisionService.analyzeCarImage(imageFile);
// result: { make, model, year, color, condition, confidence, suggestions }
```

### **2. تحليل جودة الصور**
```typescript
const quality = await geminiVisionService.analyzeImageQuality(imageFile);
// quality: { clarity, lighting, angle, overallScore, suggestions }
```

### **3. اقتراح الأسعار**
```typescript
import { geminiChatService } from '@/services/ai';

const price = await geminiChatService.suggestPrice({
  make: 'BMW',
  model: '320i',
  year: 2019,
  mileage: 85000,
  condition: 'good',
  location: 'Sofia'
});
// price: { minPrice, avgPrice, maxPrice, reasoning, marketTrend }
```

### **4. تحليل البروفايل**
```typescript
const analysis = await geminiChatService.analyzeProfile(profileData);
// analysis: { completeness, trustScore, suggestions, missingFields }
```

### **5. محادثة ذكية**
```typescript
const response = await geminiChatService.chat(
  'أبحث عن سيارة عائلية اقتصادية',
  { language: 'ar', page: 'search' }
);
```

---

## 💰 التكلفة:

```yaml
Google Gemini Pro:
  ✅ مجاني تماماً
  ✅ 60 requests/دقيقة
  ✅ 1,500 requests/يوم
  ✅ كافي لـ 500 مستخدم نشط

التكلفة: $0/شهر 🎉
```

---

## 🐛 استكشاف الأخطاء:

### **المشكلة: "Gemini service not initialized"**
```
الحل: تأكد من إضافة REACT_APP_GEMINI_KEY في .env
```

### **المشكلة: "Failed to analyze image"**
```
الحل: 
1. تأكد من أن الصورة < 10MB
2. تأكد من أن الصورة بصيغة JPEG/PNG
3. تحقق من اتصال الإنترنت
```

### **المشكلة: "Rate limit exceeded"**
```
الحل: تجاوزت 1,500 طلب/يوم
انتظر 24 ساعة أو استخدم API key آخر
```

---

## ✅ الخطوات التالية:

1. ✅ ثبت المكتبة: `npm install @google/generative-ai`
2. ✅ احصل على API key من Google
3. ✅ أضف المفتاح للـ .env
4. ✅ أعد تشغيل السيرفر
5. ✅ جرب المكون في صفحة /sell

---

**🎉 جاهز للاستخدام! التكلفة: $0**
