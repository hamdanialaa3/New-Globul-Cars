# AI Features Roadmap - Globul Cars
## خارطة طريق مميزات الذكاء الاصطناعي

> **Status**: Placeholder features - To be implemented later  
> **الحالة**: مميزات تجريبية - سيتم تنفيذها لاحقاً

---

## Overview / نظرة عامة

This document outlines the AI-powered features planned for the Globul Cars subscription system. These features are currently **placeholders** in the codebase and will be fully implemented in future releases.

توضح هذه الوثيقة المميزات المدعومة بالذكاء الاصطناعي المخططة لنظام الاشتراكات في Globul Cars. هذه المميزات حالياً **تجريبية** في الكود وسيتم تنفيذها بالكامل في الإصدارات المستقبلية.

---

## Feature Codes / أكواد المميزات

### 1. `ai_valuation_30` - تقييم السيارات المحدود
**Plan**: Dealer (30 uses/month)  
**الخطة**: التاجر (30 استخدام شهرياً)

**Description:**
- AI-powered car price estimation based on market data
- 30 valuations per month limit
- Considers: make, model, year, mileage, condition, location
- Returns: predicted price, confidence interval, comparable listings

**الوصف:**
- تقييم أسعار السيارات بالذكاء الاصطناعي بناءً على بيانات السوق
- حد 30 تقييم شهرياً
- يأخذ في الاعتبار: العلامة، الموديل، السنة، المسافة، الحالة، الموقع
- يعيد: السعر المتوقع، فاصل الثقة، إعلانات مشابهة

**Technical Implementation:**
```typescript
// Backend: functions/src/ai/car-valuation.ts
export const getAIValuation = onCall(async (request) => {
  const { carData, userId } = request.data;
  
  // Check subscription limits
  const usage = await checkAIUsage(userId, 'ai_valuation_30');
  if (usage >= 30) {
    throw new HttpsError('resource-exhausted', 'Monthly AI valuation limit reached');
  }
  
  // Call Vertex AI model (from ai-valuation-model/)
  const prediction = await vertexAIPredict(carData);
  
  // Increment usage counter
  await incrementAIUsage(userId, 'ai_valuation_30');
  
  return {
    predictedPrice: prediction.price,
    confidence: prediction.confidence,
    comparableListings: prediction.comparables
  };
});
```

**Frontend Integration:**
```typescript
// Usage in PricingPage component
import { getFunctions, httpsCallable } from 'firebase/functions';

const getAIValuation = async (carData: CarData) => {
  const functions = getFunctions();
  const valuate = httpsCallable(functions, 'getAIValuation');
  
  const result = await valuate({ carData });
  return result.data;
};
```

---

### 2. `ai_unlimited` - ذكاء اصطناعي غير محدود
**Plan**: Company (unlimited uses)  
**الخطة**: الشركة (استخدام غير محدود)

**Description:**
- Unlimited access to all AI features
- Includes: price estimation, market analysis, listing optimization, photo enhancement
- Priority processing queue
- Advanced analytics and predictions

**الوصف:**
- وصول غير محدود لجميع مميزات الذكاء الاصطناعي
- يشمل: تقدير الأسعار، تحليل السوق، تحسين الإعلانات، تحسين الصور
- طابور معالجة ذو أولوية
- تحليلات وتوقعات متقدمة

**Included AI Features:**
1. **Car Valuation** - تقييم السيارات
2. **Market Price Analysis** - تحليل أسعار السوق
3. **Automated Market Predictions** - توقعات السوق التلقائية
4. **Listing Optimization** - تحسين الإعلانات
5. **Photo Enhancement** - تحسين الصور
6. **Description Generation** - توليد الأوصاف
7. **Buyer Intent Analysis** - تحليل نية المشتري

---

## Detailed AI Features / المميزات التفصيلية

### A. Car Price Valuation / تقييم أسعار السيارات

**How it works:**
- Uses XGBoost model trained on Bulgarian car market data
- Hosted on Google Cloud Vertex AI
- Training data from BigQuery (historical sales, market trends)
- Updates: Weekly model retraining with new data

**كيف يعمل:**
- يستخدم نموذج XGBoost مدرب على بيانات سوق السيارات البلغاري
- مستضاف على Google Cloud Vertex AI
- بيانات التدريب من BigQuery (المبيعات التاريخية، اتجاهات السوق)
- التحديثات: إعادة تدريب النموذج أسبوعياً بالبيانات الجديدة

**Input Parameters:**
```typescript
interface CarValuationInput {
  make: string;           // BMW, Mercedes, etc.
  model: string;          // 320d, C-Class, etc.
  year: number;           // 2018, 2020, etc.
  mileage: number;        // in kilometers
  fuelType: string;       // Diesel, Petrol, Electric, Hybrid
  transmission: string;   // Manual, Automatic
  condition: string;      // Excellent, Good, Fair, Poor
  location: {
    cityId: string;
    coordinates: { lat: number; lng: number; };
  };
  features: string[];     // Optional equipment
}
```

**Output:**
```typescript
interface CarValuationResult {
  predictedPrice: number;              // EUR
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  marketAnalysis: {
    averagePrice: number;
    medianPrice: number;
    totalListings: number;
    daysOnMarket: number;
  };
  comparableListings: Array<{
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    similarity: number;                // 0-100%
  }>;
  pricingRecommendation: {
    suggestedPrice: number;
    strategy: 'competitive' | 'premium' | 'aggressive';
    reasoning: string;
  };
}
```

---

### B. Market Price Analysis / تحليل أسعار السوق

**Features:**
- Historical price trends (last 6 months)
- Supply/demand analysis
- Seasonal patterns
- Regional price differences
- Competitor analysis

**المميزات:**
- اتجاهات الأسعار التاريخية (آخر 6 أشهر)
- تحليل العرض والطلب
- الأنماط الموسمية
- الفروقات الإقليمية في الأسعار
- تحليل المنافسين

**Implementation:**
```typescript
// Backend: functions/src/ai/market-analysis.ts
export const analyzeMarket = onCall(async (request) => {
  const { make, model, year } = request.data;
  
  // Query BigQuery for historical data
  const historicalData = await bigquery.query(`
    SELECT 
      DATE_TRUNC(created_at, MONTH) as month,
      AVG(price) as avg_price,
      COUNT(*) as listing_count,
      AVG(days_to_sell) as avg_days
    FROM car_listings
    WHERE make = @make 
      AND model = @model
      AND year = @year
      AND sold = true
    GROUP BY month
    ORDER BY month DESC
    LIMIT 6
  `, { make, model, year });
  
  // Analyze trends
  const trends = analyzePriceTrends(historicalData);
  
  return {
    historicalPrices: historicalData,
    trends: trends,
    seasonalFactors: calculateSeasonalFactors(historicalData),
    marketHealth: assessMarketHealth(historicalData)
  };
});
```

---

### C. Smart Pricing Recommendations / توصيات التسعير الذكية

**Strategies:**

1. **Competitive Pricing** - تسعير تنافسي
   - Price 3-5% below market average
   - Faster sales (avg 7-10 days)
   - Recommended for standard vehicles

2. **Premium Pricing** - تسعير مميز
   - Price 5-10% above market average
   - For excellent condition, low mileage, rare features
   - Longer sales cycle (avg 20-30 days)

3. **Aggressive Pricing** - تسعير عدواني
   - Price 10-15% below market
   - Quick turnover (avg 3-5 days)
   - For damaged vehicles or urgent sales

**AI Decision Logic:**
```typescript
function determinePricingStrategy(car: Car, marketData: MarketData): Strategy {
  const scores = {
    condition: scoreCondition(car.condition),
    mileage: scoreMileage(car.mileage, car.year),
    features: scoreFeatures(car.features),
    demand: scoreDemand(marketData.supplyDemand),
    urgency: scoreUrgency(car.sellerPreferences)
  };
  
  const totalScore = weightedAverage(scores);
  
  if (totalScore >= 80) return 'premium';
  if (totalScore <= 40) return 'aggressive';
  return 'competitive';
}
```

---

### D. Listing Optimization Suggestions / اقتراحات تحسين الإعلانات

**AI Analyzes:**
- Title effectiveness
- Description quality
- Photo quality and count
- Feature highlighting
- Call-to-action strength

**الذكاء الاصطناعي يحلل:**
- فعالية العنوان
- جودة الوصف
- جودة وعدد الصور
- إبراز المميزات
- قوة الدعوة للإجراء

**Suggestions Include:**
```typescript
interface OptimizationSuggestions {
  title: {
    current: string;
    suggested: string;
    improvements: string[];
    impact: 'low' | 'medium' | 'high';
  };
  description: {
    wordCount: number;
    readabilityScore: number;
    missingKeywords: string[];
    suggestedAdditions: string[];
  };
  photos: {
    count: number;
    qualityScore: number;
    missingAngles: string[];  // 'front', 'rear', 'interior', 'engine'
    suggestedEnhancements: string[];
  };
  features: {
    highlighted: string[];
    shouldHighlight: string[];  // High-value features not mentioned
    marketDemand: { feature: string; importance: number; }[];
  };
}
```

---

### E. Photo Enhancement / تحسين الصور

**AI-Powered:**
- Auto brightness/contrast adjustment
- Background blur for professional look
- Damage detection and highlighting
- Angle recommendations
- Best photo selection for thumbnail

**مدعوم بالذكاء الاصطناعي:**
- ضبط السطوع والتباين التلقائي
- طمس الخلفية للحصول على مظهر احترافي
- اكتشاف الأضرار وتسليط الضوء عليها
- توصيات الزوايا
- اختيار أفضل صورة للصورة المصغرة

**Implementation Plan:**
```typescript
// Use TensorFlow.js or Cloud Vision API
export const enhancePhoto = onCall(async (request) => {
  const { imageUrl, enhancements } = request.data;
  
  // Download image
  const image = await downloadImage(imageUrl);
  
  // Apply AI enhancements
  if (enhancements.includes('auto-adjust')) {
    image = await autoAdjustBrightness(image);
    image = await autoAdjustContrast(image);
  }
  
  if (enhancements.includes('background-blur')) {
    image = await applyBackgroundBlur(image);
  }
  
  if (enhancements.includes('damage-detection')) {
    const damages = await detectDamages(image);
    image = await highlightDamages(image, damages);
  }
  
  // Upload enhanced image
  const enhancedUrl = await uploadToStorage(image);
  
  return { enhancedUrl };
});
```

---

### F. Auto-Generated Descriptions / توليد الأوصاف التلقائي

**AI Features:**
- Natural language generation
- Market-specific keywords
- SEO optimization
- Multi-language support (Bulgarian + English)
- Tone customization (professional, friendly, urgent)

**مميزات الذكاء الاصطناعي:**
- توليد اللغة الطبيعية
- كلمات مفتاحية خاصة بالسوق
- تحسين SEO
- دعم متعدد اللغات (البلغارية + الإنجليزية)
- تخصيص النبرة (احترافي، ودود، عاجل)

**Example Output:**
```typescript
interface GeneratedDescription {
  bg: {
    title: "BMW 320d xDrive, 2020, Дизел, Автоматик - Отлично състояние";
    description: `
      Предлагаме ви тази прекрасна BMW 320d в отлично състояние. 
      Автомобилът е произведен през 2020 година и има изминати само 45,000 км.
      
      Основни характеристики:
      • Двигател: 2.0 дизел
      • Мощност: 190 к.с.
      • Скоростна кутия: Автоматична (8-степенна)
      • Задвижване: xDrive (4x4)
      
      Оборудване:
      • Навигационна система
      • Кожен салон
      • Климатроник
      • Паркинг сензори и камера
      
      Автомобилът е с пълна сервизна история и е в безупречно техническо състояние.
    `;
  };
  en: {
    title: "BMW 320d xDrive, 2020, Diesel, Automatic - Excellent Condition";
    description: `
      We offer you this beautiful BMW 320d in excellent condition.
      The car was manufactured in 2020 and has only 45,000 km.
      
      Key Features:
      • Engine: 2.0 diesel
      • Power: 190 hp
      • Transmission: Automatic (8-speed)
      • Drive: xDrive (4x4)
      
      Equipment:
      • Navigation system
      • Leather interior
      • Climate control
      • Parking sensors and camera
      
      The car has full service history and is in impeccable technical condition.
    `;
  };
  seoKeywords: ['bmw 320d', 'xdrive', 'дизел', 'автоматик', '2020'];
  readabilityScore: 85;
}
```

---

### G. Buyer Intent Analysis / تحليل نية المشتري

**AI Tracks:**
- Message sentiment analysis
- Question patterns
- Response time expectations
- Negotiation readiness
- Purchase probability score

**الذكاء الاصطناعي يتتبع:**
- تحليل مشاعر الرسائل
- أنماط الأسئلة
- توقعات وقت الاستجابة
- جاهزية التفاوض
- درجة احتمالية الشراء

**Use Cases:**
```typescript
interface BuyerIntent {
  intentScore: number;              // 0-100
  sentiment: 'positive' | 'neutral' | 'negative';
  questions: {
    technical: number;              // Count of technical questions
    pricing: number;                // Count of pricing questions
    scheduling: number;             // Count of viewing/test drive requests
  };
  recommendedActions: string[];     // AI-suggested next steps
  urgency: 'low' | 'medium' | 'high';
  conversionProbability: number;    // 0-100%
}
```

---

## Database Schema for AI Usage Tracking / مخطط قاعدة البيانات لتتبع استخدام الذكاء الاصطناعي

```typescript
// Firestore: users/{userId}/ai_usage/{month}
interface AIUsageTracking {
  userId: string;
  month: string;                    // 'YYYY-MM'
  planId: 'free' | 'dealer' | 'company';
  
  valuations: {
    count: number;
    limit: number;                  // 0 for free, 30 for dealer, -1 for company (unlimited)
    lastUsed: Timestamp;
  };
  
  marketAnalysis: {
    count: number;
    limit: number;
  };
  
  photoEnhancements: {
    count: number;
    limit: number;
  };
  
  descriptionGenerations: {
    count: number;
    limit: number;
  };
  
  totalUsage: number;
  resetDate: Timestamp;             // First day of next month
}
```

---

## Cloud Functions Structure / هيكل Cloud Functions

```
functions/
└── src/
    └── ai/
        ├── index.ts                      # Export all AI functions
        ├── car-valuation.ts              # Price estimation
        ├── market-analysis.ts            # Market trends
        ├── pricing-strategy.ts           # Smart pricing
        ├── listing-optimization.ts       # Listing improvements
        ├── photo-enhancement.ts          # Image processing
        ├── description-generator.ts      # Auto descriptions
        ├── buyer-intent.ts               # Intent analysis
        ├── usage-tracker.ts              # Usage limits
        └── models/
            └── vertex-ai-client.ts       # Vertex AI integration
```

---

## Frontend Integration Points / نقاط التكامل في الواجهة الأمامية

### 1. Pricing Page - صفحة التسعير
```typescript
// pages/sell/PricingPage.tsx
import { AIValuationButton } from '@/components/ai/AIValuationButton';

<AIValuationButton 
  carData={formData}
  onResult={(valuation) => {
    setPriceField(valuation.suggestedPrice);
    setMarketAnalysis(valuation.marketAnalysis);
  }}
/>
```

### 2. Images Page - صفحة الصور
```typescript
// pages/sell/ImagesPage.tsx
import { PhotoEnhancer } from '@/components/ai/PhotoEnhancer';

<PhotoEnhancer 
  photos={uploadedPhotos}
  onEnhance={(enhanced) => {
    setPhotos(enhanced);
  }}
/>
```

### 3. Vehicle Data Page - صفحة بيانات السيارة
```typescript
// pages/sell/VehicleData.tsx
import { DescriptionGenerator } from '@/components/ai/DescriptionGenerator';

<DescriptionGenerator 
  carData={formData}
  onGenerate={(description) => {
    setDescription(description);
  }}
/>
```

---

## API Rate Limiting / تحديد معدل API

```typescript
// Implement rate limiting per plan
const AI_LIMITS = {
  free: {
    valuations: 0,
    marketAnalysis: 0,
    photoEnhancements: 0,
    descriptionGenerations: 0
  },
  dealer: {
    valuations: 30,          // per month
    marketAnalysis: 30,
    photoEnhancements: 50,
    descriptionGenerations: 30
  },
  company: {
    valuations: -1,          // unlimited
    marketAnalysis: -1,
    photoEnhancements: -1,
    descriptionGenerations: -1
  }
};
```

---

## Testing Strategy / استراتيجية الاختبار

### Unit Tests
```typescript
// __tests__/ai/car-valuation.test.ts
describe('AI Car Valuation', () => {
  it('should return predicted price within confidence interval', async () => {
    const carData = {
      make: 'BMW',
      model: '320d',
      year: 2020,
      mileage: 45000
    };
    
    const result = await getAIValuation(carData);
    
    expect(result.predictedPrice).toBeGreaterThan(result.confidenceInterval.lower);
    expect(result.predictedPrice).toBeLessThan(result.confidenceInterval.upper);
  });
  
  it('should respect usage limits for dealer plan', async () => {
    // Test rate limiting logic
  });
});
```

### Integration Tests
```typescript
// __tests__/integration/ai-workflow.test.ts
describe('Complete AI Workflow', () => {
  it('should valuate, analyze market, and generate description', async () => {
    // Test full AI pipeline
  });
});
```

---

## Cost Estimation / تقدير التكاليف

### Vertex AI Costs
- **Training**: ~€50-100/month (weekly retraining)
- **Predictions**: €0.02 per 1000 predictions
- **Storage**: €0.026/GB/month

### Cloud Vision API (Photo Enhancement)
- €1.50 per 1000 images

### Monthly Cost Projections:
- **100 dealers** × 30 valuations = 3,000 predictions = €0.06
- **10 companies** × 200 valuations = 2,000 predictions = €0.04
- **Photo enhancements**: 1,000 images = €1.50
- **Total**: ~€1.60/month + fixed costs (~€100/month for training)

**Profit Margin:**
- Revenue: (100 × €29) + (10 × €199) = €4,890
- AI Costs: ~€102
- **Margin**: ~€4,788 (98% profit margin on AI features)

---

## Roadmap Timeline / الجدول الزمني

### Phase 1: Foundation (Month 1-2)
- ✅ Plan structure updated with AI feature codes
- ✅ Usage tracking schema designed
- ⏳ Vertex AI model setup
- ⏳ BigQuery data pipeline

### Phase 2: Core Features (Month 3-4)
- ⏳ Car valuation API
- ⏳ Market analysis API
- ⏳ Usage tracking and limits
- ⏳ Basic frontend integration

### Phase 3: Advanced Features (Month 5-6)
- ⏳ Photo enhancement
- ⏳ Description generation
- ⏳ Buyer intent analysis
- ⏳ Complete UI/UX

### Phase 4: Optimization (Month 7+)
- ⏳ Model improvement
- ⏳ Performance optimization
- ⏳ A/B testing
- ⏳ User feedback integration

---

## Documentation References / مراجع التوثيق

### External Resources:
- **Vertex AI**: https://cloud.google.com/vertex-ai/docs
- **BigQuery ML**: https://cloud.google.com/bigquery-ml/docs
- **Cloud Vision API**: https://cloud.google.com/vision/docs
- **TensorFlow.js**: https://www.tensorflow.org/js

### Internal Files:
- `ai-valuation-model/` - Python ML microservice
- `functions/src/autonomous-resale-engine.ts` - Integration point
- `BillingService.ts` - Plan definitions with AI features
- `SubscriptionManager.tsx` - UI display

---

## Notes for Developers / ملاحظات للمطورين

1. **Feature Flags**: All AI features should be behind feature flags for gradual rollout
2. **Graceful Degradation**: If AI service is down, fall back to manual input
3. **Privacy**: Ensure GDPR compliance for AI data processing
4. **Transparency**: Always show users when AI is being used
5. **User Control**: Allow users to opt-out of AI features

**احتياطات مهمة:**
- جميع مميزات الذكاء الاصطناعي يجب أن تكون خلف feature flags
- في حالة فشل خدمة AI، العودة للإدخال اليدوي
- ضمان الامتثال لـ GDPR في معالجة بيانات AI
- إظهار للمستخدمين متى يتم استخدام AI
- السماح للمستخدمين بإلغاء الاشتراك في مميزات AI

---

**Last Updated**: November 25, 2025  
**آخر تحديث**: 25 نوفمبر 2025

**Maintained By**: Development Team  
**المسؤول**: فريق التطوير
