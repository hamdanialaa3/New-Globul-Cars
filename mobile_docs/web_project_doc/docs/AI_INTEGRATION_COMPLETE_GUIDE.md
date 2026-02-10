# 🤖 AI Integration System - دليل شامل (Jan 17, 2026)

**المراجعة:** 17 يناير 2026  
**الإصدار:** 3.0 (Multi-Provider Resilience)  
**الحالة:** ✅ إنتاج جاهز

---

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [معمارية النظام](#معمارية-النظام)
3. [مزودو الخدمة](#مزودو-الخدمة)
4. [AIRouter - المحرك الرئيسي](#airouter---المحرك-الرئيسي)
5. [خدمات AI المتخصصة](#خدمات-ai-المتخصصة)
6. [أمثلة الاستخدام](#أمثلة-الاستخدام)
7. [إدارة التكاليف](#إدارة-التكاليف)
8. [معالجة الأخطاء](#معالجة-الأخطاء)

---

## نظرة عامة

نظام AI في المشروع يوفر 23 خدمة متخصصة مع:

- **التجاوز التلقائي:** Gemini → OpenAI → DeepSeek
- **تتبع التكاليف:** مراقبة الإنفاق بالدقيقة
- **إدارة الحصص:** حدود الاستخدام والتكاليف
- **الموثوقية العالية:** Fallback آلي عند الفشل
- **دعم متعدد اللغات:** Bulgarian, English, Arabic

### الإحصائيات

```
📊 خدمات AI في المشروع
├── Vision Services (4)
│   ├── Damage Detection
│   ├── OCR (Document reading)
│   ├── Image Classification
│   └── Quality Assessment
├── Text Services (8)
│   ├── Description Generation
│   ├── Title Optimization
│   ├── Translation (3 languages)
│   ├── Sentiment Analysis
│   └── Content Moderation
├── Speech Services (2)
│   ├── Voice Transcription (Whisper)
│   └── Voice-to-Text Search
├── NLU Services (3)
│   ├── Query Understanding
│   ├── Entity Recognition
│   └── Synonym Expansion
├── Specialized Services (6)
│   ├── Autonomous Resale Engine
│   ├── Market Trend Analysis
│   ├── Price Recommendation
│   ├── Lead Scoring
│   ├── Chat Completion
│   └── RAG Search
└── Infrastructure (5)
    ├── Cost Optimizer
    ├── Quota Manager
    ├── Error Handler
    ├── Cache Manager
    └── Batch Processor
```

---

## معمارية النظام

```
┌─────────────────────────────────────────────────────────┐
│  المكونات العميلة (Client Components)                    │
│  ├── CarDescriptionGenerator                             │
│  ├── DamageDetectorWidget                               │
│  ├── VoiceSearchButton                                  │
│  ├── ImageAnalyzer                                      │
│  └── SmartAutocomplete                                  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  طبقة الخدمات (Services Layer)                           │
│  ├── AIRouter (المحرك الرئيسي)                          │
│  ├── Task Dispatcher                                    │
│  └── Response Processor                                 │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  طبقة المزودين (Provider Layer)                          │
│  ├── GeminiProvider                                     │
│  ├── OpenAIProvider                                     │
│  └── DeepSeekProvider                                   │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  خدمات البنية التحتية (Infrastructure)                  │
│  ├── Cost Tracker (Firestore: ai_costs collection)     │
│  ├── Cache Manager (Redis/Firestore)                    │
│  ├── Rate Limiter (API quotas)                         │
│  └── Error Handler (Fallback strategy)                 │
└─────────────────────────────────────────────────────────┘
```

---

## مزودو الخدمة

### 1. Google Gemini (الأساسي)

**المميزات:**
- ✅ الوصول السريع والموثوق
- ✅ رؤية متقدمة (Vision API)
- ✅ مدخلات طويلة (up to 1M tokens)
- ✅ أسعار معقولة
- ✅ دعم اللغات العربية والبلغارية

**الحد الأقصى للاستخدام:**
- 15 request/min (free)
- 500 request/min (paid)

**حالات الاستخدام:**
- توليد الأوصاف التلقائية
- تحليل الصور والأضرار
- OCR وقراءة الوثائق
- تحليل الاتجاهات

### 2. OpenAI (الاحتياطي)

**المميزات:**
- ✅ نموذج GPT-4 متقدم
- ✅ جودة عالية للنصوص المعقدة
- ✅ دقة في المهام المتخصصة

**الحد الأقصى للاستخدام:**
- 3,500 request/min (paid)
- دعم Whisper لتحويل الصوت

**حالات الاستخدام:**
- عمليات معقدة تحتاج GPT-4
- Fallback عند فشل Gemini

### 3. DeepSeek (الاقتصادي)

**المميزات:**
- ✅ أسعار منخفضة جداً
- ✅ جودة معقولة
- ✅ أداء سريع

**حالات الاستخدام:**
- Fallback ثالث عند فشل الآخرين
- مهام غير حرجة
- توليد الأوصاف البسيطة

---

## AIRouter - المحرك الرئيسي

### الواجهة

```typescript
interface AIRouterRequest {
  task: AITask;           // 'description', 'damage-detection', etc
  input: any;             // البيانات المدخلة
  options?: {
    language?: string;    // 'bg' | 'en' | 'ar'
    maxTokens?: number;
    temperature?: number;
    confidence?: number;  // للرؤية (0-1)
  };
}

interface AIRouterResponse {
  success: boolean;
  data?: any;
  error?: string;
  provider: 'gemini' | 'openai' | 'deepseek';
  costUSD?: number;
  tokensUsed?: number;
  executionTimeMs?: number;
}
```

### مهام مدعومة

```typescript
type AITask = 
  // Text Generation
  | 'description'              // توليد أوصاف السيارات
  | 'title-optimization'       // تحسين العناوين
  | 'translation'              // الترجمة
  
  // Vision
  | 'damage-detection'         // كشف الأضرار
  | 'quality-assessment'       // تقييم الجودة
  | 'document-recognition'     // قراءة الوثائق
  | 'object-detection'         // الكشف عن الأجسام
  
  // Speech
  | 'voice-transcription'      // تحويل الصوت
  | 'voice-search'             // البحث بالصوت
  
  // NLU
  | 'query-understanding'      // فهم الاستفسار
  | 'entity-recognition'       // التعرف على الكيانات
  | 'sentiment-analysis'       // تحليل المشاعر
  
  // Specialized
  | 'resale-value'             // التنبؤ بقيمة إعادة البيع
  | 'market-trends'            // تحليل اتجاهات السوق
  | 'price-recommendation'     // توصيات التسعير
```

### أمثلة الاستخدام

#### مثال 1: توليد الوصف

```typescript
import { AIRouter } from '@/services/ai/ai-router.service';

const description = await AIRouter.generate({
  task: 'description',
  input: {
    make: 'BMW',
    model: '320i',
    year: 2018,
    mileage: 95000,
    condition: 'excellent',
    features: ['ABS', 'ESP', 'Air Conditioning']
  },
  options: {
    language: 'bg',
    maxTokens: 200
  }
});

// Response
{
  success: true,
  data: "Отличен BMW 320i от 2018 година с пробег 95000 км...",
  provider: 'gemini',
  costUSD: 0.002,
  executionTimeMs: 450
}
```

#### مثال 2: كشف الأضرار

```typescript
const analysis = await AIRouter.analyzeImage({
  task: 'damage-detection',
  input: imageBuffer, // شريط البيانات الثنائية
  options: {
    confidence: 0.8
  }
});

// Response
{
  success: true,
  data: {
    damagesDetected: [
      { location: 'Front bumper', severity: 'minor', confidence: 0.92 },
      { location: 'Right door', severity: 'moderate', confidence: 0.85 }
    ],
    overallCondition: 'fair',
    estimatedRepairCost: '$2,500-3,500'
  },
  provider: 'gemini',
  costUSD: 0.005
}
```

#### مثال 3: البحث بالصوت

```typescript
const searchResults = await AIRouter.transcribe({
  task: 'voice-search',
  input: audioBlob,
  options: {
    language: 'bg'
  }
});

// Response
{
  success: true,
  data: {
    query: "BMW черен цвят от 2020 година",
    confidence: 0.95,
    intent: 'search'
  },
  provider: 'openai' // Whisper API
}
```

---

## خدمات AI المتخصصة

### 1. Vehicle Description Generator

```typescript
import { VehicleDescriptionGenerator } from '@/services/ai/vehicle-description-generator.service';

const description = await VehicleDescriptionGenerator.generateDescription({
  vehicleData: car,
  tone: 'professional',
  length: 'medium',
  language: 'bg'
});
```

### 2. Gemini Vision Service

```typescript
import { GeminiVisionService } from '@/services/ai/gemini-vision.service';

const damage = await GeminiVisionService.detectDamage(imageUrl);
const quality = await GeminiVisionService.assessQuality(images);
const text = await GeminiVisionService.readDocument(documentImage);
```

### 3. NLU Multilingual Service

```typescript
import { NLUMultilingualService } from '@/services/ai/nlu-multilingual.service';

const entities = await NLUMultilingualService.extractEntities(text);
const sentiment = await NLUMultilingualService.analyzeSentiment(text);
const synonyms = await NLUMultilingualService.expandSynonyms(query);
```

### 4. Whisper Speech Service

```typescript
import { WhisperService } from '@/services/ai/whisper.service';

const transcript = await WhisperService.transcribe(audioBlob, 'bg');
const searchQuery = await WhisperService.voiceSearch(audioBlob);
```

### 5. AI Cost Optimizer

```typescript
import { AICostOptimizer } from '@/services/ai/ai-cost-optimizer.service';

// Track costs
await AICostOptimizer.logCost({
  task: 'description',
  provider: 'gemini',
  costUSD: 0.002,
  tokensUsed: 150
});

// Get cost report
const report = await AICostOptimizer.getCostReport({
  dateRange: 'last-30-days'
});
```

---

## أمثلة الاستخدام

### في صفحات الكمبوننت

```typescript
import { useAI } from '@/hooks/ai/useAI';

function CarListingForm() {
  const { generate, isLoading, error } = useAI();

  const handleGenerateDescription = async (carData) => {
    const result = await generate({
      task: 'description',
      input: carData,
      options: { language: 'bg', maxTokens: 200 }
    });

    if (result.success) {
      setDescription(result.data);
      setGeneratedCost(result.costUSD);
    }
  };

  return (
    <button onClick={() => handleGenerateDescription(formData)}>
      🤖 توليد الوصف
    </button>
  );
}
```

### في الخدمات

```typescript
import { AIRouter } from '@/services/ai/ai-router.service';

export async function createCarListing(carData) {
  // Generate description
  const description = await AIRouter.generate({
    task: 'description',
    input: carData,
    options: { language: 'bg' }
  });

  // Analyze images
  const imageAnalysis = await AIRouter.analyzeImage({
    task: 'quality-assessment',
    input: carData.images[0],
    options: { confidence: 0.8 }
  });

  // Create listing
  return {
    ...carData,
    description: description.data,
    qualityScore: imageAnalysis.data.overallCondition
  };
}
```

---

## إدارة التكاليف

### تتبع التكاليف

كل استدعاء AI يسجل تكلفته في Firestore:

```
ai_costs/
├── {docId}/
│   ├── userId: string
│   ├── task: string
│   ├── provider: string
│   ├── costUSD: number
│   ├── tokensUsed: number
│   ├── timestamp: timestamp
│   └── metadata: object
```

### حدود التكاليف

```typescript
// Daily limits
const DAILY_LIMITS = {
  free: 5.00,        // $5/يوم
  dealer: 50.00,     // $50/يوم
  company: 500.00    // $500/يوم
};

// Monthly limits
const MONTHLY_LIMITS = {
  free: 50.00,       // $50/شهر
  dealer: 500.00,    // $500/شهر
  company: 5000.00   // $5000/شهر
};
```

### مراقبة الإنفاق

```typescript
const costs = await AICostOptimizer.getCostReport({
  userId: user.id,
  dateRange: 'last-30-days'
});

if (costs.totalCostUSD > userLimit) {
  // Prevent further requests
  throw new Error('AI quota exceeded');
}
```

---

## معالجة الأخطاء

### استراتيجية Fallback

```
Request
  ↓
Try Gemini
  ├─ Success → Return
  └─ Fail → Try OpenAI
      ├─ Success → Return
      └─ Fail → Try DeepSeek
          ├─ Success → Return
          └─ Fail → Error
```

### رموز الأخطاء

| الكود | الوصف | الإجراء |
|-----|-------|---------|
| `RATE_LIMIT` | تجاوز الحد الأقصى | الانتظار وإعادة المحاولة |
| `QUOTA_EXCEEDED` | تجاوز الحصة | الترقية أو الانتظار |
| `INVALID_INPUT` | إدخال غير صحيح | التحقق من البيانات |
| `SERVICE_ERROR` | خطأ الخدمة | الانتظار والمحاولة |
| `TIMEOUT` | انتهت صلاحية الطلب | إعادة المحاولة |

### مثال معالجة الأخطاء

```typescript
try {
  const result = await AIRouter.generate({
    task: 'description',
    input: carData,
    options: { language: 'bg' }
  });

  if (!result.success) {
    if (result.error.includes('quota')) {
      // Show upgrade message
      showNotification('نقص في الحصة. يرجى الترقية.');
    } else if (result.error.includes('rate')) {
      // Retry after delay
      setTimeout(() => retry(), 5000);
    } else {
      // Generic error
      showNotification('حدث خطأ. يرجى المحاولة لاحقاً.');
    }
  }
} catch (error) {
  logger.error('AI service error', error);
  // Fallback UI
}
```

---

## الملفات المرتبطة

```
src/services/ai/
├── ai-router.service.ts           # المحرك الرئيسي
├── gemini-vision.service.ts        # رؤية Gemini
├── vehicle-description-generator.service.ts
├── whisper.service.ts              # Whisper API
├── nlu-multilingual.service.ts     # فهم اللغة الطبيعية
├── ai-cost-optimizer.service.ts    # تتبع التكاليف
├── ai-cache-manager.service.ts     # إدارة التخزين المؤقت
├── ai-quota-manager.service.ts     # إدارة الحصص
└── providers/
    ├── gemini-provider.ts
    ├── openai-provider.ts
    └── deepseek-provider.ts

src/hooks/ai/
├── useAI.ts                        # Hook رئيسي
├── useVisionAI.ts
├── useSpeechAI.ts
└── useAICost.ts

functions/src/ai/
├── ai-handlers.ts                  # معالجات Cloud
├── ai-batch-processor.ts           # معالجة دفعات
└── ai-webhooks.ts                  # Webhooks
```

---

## الخلاصة

✅ **نظام AI متكامل مع:**
- ✅ 23 خدمة متخصصة
- ✅ تجاوز تلقائي بين المزودين
- ✅ تتبع شامل للتكاليف
- ✅ معالجة أخطاء موثوقة
- ✅ دعم متعدد اللغات
- ✅ أمان وخصوصية عالية

**التاريخ:** 17 يناير 2026  
**الحالة:** ✅ إنتاج جاهز
