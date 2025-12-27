# 🤖 Hybrid AI System - Complete Documentation
# النظام الهجين للذكاء الاصطناعي - التوثيق الكامل

**Created:** December 27, 2025  
**Phase:** 4.1.2 - AI Integration Complete  
**Status:** ✅ Infrastructure Complete, 🔄 Deployment Pending

---

## 📊 System Overview / نظرة عامة

The Hybrid AI System intelligently routes AI requests between **Gemini Pro** and **DeepSeek** based on:
- Operation type (single/bulk/analysis/image)
- User tier (private/dealer/company)
- Monthly budget limits ($50 Gemini, $30 DeepSeek)
- Real-time cost tracking

النظام الهجين يوجه طلبات الذكاء الاصطناعي بذكاء بين **Gemini Pro** و **DeepSeek** بناءً على:
- نوع العملية (مفرد/دفعة/تحليل/صورة)
- مستوى المستخدم (خاص/تاجر/شركة)
- حدود الميزانية الشهرية (50$ Gemini، 30$ DeepSeek)
- تتبع التكلفة في الوقت الفعلي

---

## 🏗️ Architecture / البنية المعمارية

### 1. AI Router Service
**File:** `src/services/ai/ai-router.service.ts` (278 lines)

**Main Method:**
```typescript
async generateDescription(vehicleData, options): Promise<{
  description: string;
  provider: 'gemini' | 'deepseek';
  cost: number;
  generatedBy: 'ai' | 'template';
}>
```

**Routing Rules:**
| Operation Type | Provider | Reason | Cost |
|---------------|----------|--------|------|
| Image analysis | Gemini | Vision API required | $0.002 |
| Bulk (>5 items) | DeepSeek | Cost-effective | $0.0004 |
| Market insights | DeepSeek | Faster response | $0.0004 |
| Default | DeepSeek | Balanced | $0.0004 |

### 2. Cost Optimizer Service
**File:** `src/services/ai/ai-cost-optimizer.service.ts` (121 lines)

**Firestore Collection:**
```
ai_cost_tracking/monthly_stats:
  gemini: {
    monthlySpent: number,
    requestCount: number,
    lastReset: "YYYY-MM",
    lastUpdate: Timestamp
  }
  deepseek: { /* same structure */ }
```

**Budget Configuration:**
```typescript
const BUDGET_LIMITS = {
  gemini: 50.0,   // $50/month
  deepseek: 30.0  // $30/month
};
```

**Main Methods:**
```typescript
// Track cost after AI call
await aiCostOptimizerService.trackCost('gemini', 0.002);

// Check if budget exceeded
const status = await aiCostOptimizerService.checkBudgetStatus();
// Returns: { geminiExceeded, deepseekExceeded, geminiRemaining, deepseekRemaining }
```

### 3. Enhanced DeepSeek Service
**File:** `src/services/ai/deepseek-enhanced.service.ts`

**6 Advanced Features:**

#### Feature 1: Smart Price Suggestion 💰
```typescript
const result = await deepSeekEnhancedService.suggestPrice(carData, 'bg');
// Returns: { suggestedPrice, priceRange: {min, max}, reasoning, confidence }
```

#### Feature 2: Image Analysis 📸 (Placeholder)
```typescript
const result = await deepSeekEnhancedService.analyzeCarImages(imageUrls, 'bg');
// Returns: { condition, damages, highlights, recommendations }
// Note: DeepSeek Vision API not yet available
```

#### Feature 3: Search Assistant 🔍
```typescript
const result = await deepSeekEnhancedService.searchAssistant('търся BMW под 20 хиляди', 'bg');
// Returns: { interpretation, suggestedFilters, additionalQuestions }
```

#### Feature 4: Listing Quality Checker ✅
```typescript
const result = await deepSeekEnhancedService.checkListingQuality(listing, 'bg');
// Returns: { score: 0-100, strengths, weaknesses, suggestions }
```

#### Feature 5: Fraud Detection 🚨
```typescript
const result = await deepSeekEnhancedService.detectFraud(listing, 'bg');
// Returns: { riskLevel: 'low'|'medium'|'high', confidence, warnings, reasoning }
```

#### Feature 6: Chatbot Assistant 💬
```typescript
const result = await deepSeekEnhancedService.chatbot(message, 'listing', 'bg');
// Contexts: 'general' | 'listing' | 'search' | 'support'
```

---

## 🔥 Firebase Function

**File:** `functions/src/ai/hybrid-ai-proxy.ts`  
**Export:** `hybridAIProxy` in `functions/src/index.ts`

**Cloud Function:**
```typescript
const result = await firebase.functions().httpsCallable('hybridAIProxy')({
  vehicleData: {
    make: 'BMW',
    model: 'X5',
    year: 2020,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    mileage: 50000,
    power: 265
  },
  options: {
    language: 'bg',
    userType: 'dealer',
    operationType: 'single',
    forceProvider: 'deepseek' // Optional override
  }
});

// Returns: { description, provider, cost, generatedBy, budgetStatus }
```

---

## 📦 Deployment Steps / خطوات النشر

### Step 1: Configure API Keys
```bash
cd functions
firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY"
firebase functions:config:set deepseek.api_key="YOUR_DEEPSEEK_API_KEY"
```

### Step 2: Install Dependencies
```bash
cd functions
npm install
npm install axios  # Required for hybrid-ai-proxy
```

### Step 3: Build and Deploy
```bash
npm run build
firebase deploy --only functions
```

### Step 4: Verify Deployment
```bash
firebase functions:log  # Check for errors
```

### Step 5: Test in Frontend
```typescript
import { aiRouterService } from '@/services/ai/ai-router.service';

const result = await aiRouterService.generateDescription({
  make: 'BMW',
  model: '320d',
  year: 2018,
  fuelType: 'Diesel',
  transmission: 'Automatic'
}, {
  language: 'bg',
  userType: 'private'
});

console.log('Description:', result.description);
console.log('Provider used:', result.provider);
console.log('Cost:', result.cost);
```

---

## 💡 Usage Examples / أمثلة الاستخدام

### Example 1: Generate Car Description (Smart Routing)
```typescript
import { aiRouterService } from '@/services/ai';

async function generateDescription() {
  const result = await aiRouterService.generateDescription(
    {
      make: 'Mercedes-Benz',
      model: 'E-Class',
      year: 2019,
      fuelType: 'Diesel',
      transmission: 'Automatic',
      mileage: 80000,
      power: 194,
      equipment: ['Кожен салон', 'Навигация', 'Камера за паркиране']
    },
    {
      language: 'bg',
      userType: 'dealer'
    }
  );

  console.log('Generated Description:', result.description);
  console.log('Provider:', result.provider); // 'deepseek' (default for dealers)
  console.log('Cost: $' + result.cost); // $0.0004
}
```

### Example 2: Bulk Operation (Force DeepSeek)
```typescript
import { aiRouterService } from '@/services/ai';

async function bulkGenerate(cars: any[]) {
  const results = await Promise.all(
    cars.map(car => 
      aiRouterService.generateDescription(car, {
        language: 'bg',
        userType: 'company',
        operationType: 'bulk',
        bulkSize: cars.length
      })
    )
  );

  // All use DeepSeek (cost-effective for bulk)
  console.log('Total cost: $' + results.reduce((sum, r) => sum + r.cost, 0));
}
```

### Example 3: Check Price with AI
```typescript
import { deepSeekEnhancedService } from '@/services/ai';

async function checkPrice() {
  const result = await deepSeekEnhancedService.suggestPrice(
    {
      make: 'Audi',
      model: 'A6',
      year: 2017,
      mileage: 120000,
      fuelType: 'Diesel',
      transmission: 'Automatic',
      condition: 'good'
    },
    'bg'
  );

  console.log('Suggested Price:', result.suggestedPrice, 'EUR');
  console.log('Price Range:', result.priceRange.min, '-', result.priceRange.max, 'EUR');
  console.log('Reasoning:', result.reasoning);
  console.log('Confidence:', result.confidence);
}
```

### Example 4: Fraud Detection
```typescript
import { deepSeekEnhancedService } from '@/services/ai';

async function checkForFraud(listing: any) {
  const result = await deepSeekEnhancedService.detectFraud(listing, 'bg');

  if (result.riskLevel === 'high') {
    console.warn('⚠️ High fraud risk detected!');
    console.log('Warnings:', result.warnings);
    console.log('Reasoning:', result.reasoning);
  }
}
```

### Example 5: Check Budget Status
```typescript
import { aiCostOptimizerService } from '@/services/ai';

async function checkBudget() {
  const status = await aiCostOptimizerService.checkBudgetStatus();

  console.log('Gemini Budget:');
  console.log('  Exceeded:', status.geminiExceeded);
  console.log('  Remaining: $' + status.geminiRemaining);

  console.log('DeepSeek Budget:');
  console.log('  Exceeded:', status.deepseekExceeded);
  console.log('  Remaining: $' + status.deepseekRemaining);
}
```

---

## 📊 Cost Comparison / مقارنة التكاليف

| Scenario | Gemini Cost | DeepSeek Cost | Savings |
|----------|------------|--------------|---------|
| Single description | $0.002 | $0.0004 | 80% |
| 100 descriptions | $0.20 | $0.04 | 80% |
| 1,000 descriptions | $2.00 | $0.40 | 80% |

**Monthly Estimates:**
- **Private User** (3 listings/month): ~$0.01 (DeepSeek)
- **Dealer** (50 listings/month): ~$0.10 (DeepSeek)
- **Company** (500 listings/month): ~$1.00 (DeepSeek)

---

## 🔐 Security / الأمان

✅ **API Keys Protected:** All keys stored server-side in Firebase Functions Config  
✅ **Client-side Security:** No keys exposed in frontend code  
✅ **Firestore Rules:** Only authenticated users can access AI features  
✅ **Cost Tracking:** Prevents unlimited spending with budget limits  
✅ **Error Handling:** Graceful fallbacks if one provider fails

---

## 🎯 Integration Points / نقاط التكامل

### 1. Sell Workflow (Description Generator)
**File:** `src/components/SellWorkflow/WizardOrchestrator.tsx`
- **Step 6.5:** Smart Description Generator
- Uses `aiRouterService.generateDescription()`
- Shows provider badge (Gemini/DeepSeek)
- Displays cost estimate

### 2. Profile Page (Usage Analytics)
**File:** `src/pages/03_user-pages/profile/ProfilePage/`
- **Tab:** AI Usage Analytics (Dealer/Company only)
- Shows monthly usage statistics
- Cost tracking per provider
- Quota progress bars

### 3. Search Page (AI Assistant)
**File:** `src/pages/01_main-pages/SearchPage.tsx`
- Chat bubble icon in search bar
- Natural language query parsing
- Uses `deepSeekEnhancedService.searchAssistant()`

### 4. Car Details Page (Quality Check)
**File:** `src/pages/01_main-pages/car-details/`
- Admin tool: Check listing quality
- Fraud detection badge
- Uses `deepSeekEnhancedService.checkListingQuality()` and `detectFraud()`

---

## 🐛 Troubleshooting / استكشاف الأخطاء

### Issue 1: "Gemini API key not configured"
**Solution:**
```bash
firebase functions:config:set gemini.api_key="YOUR_KEY"
firebase deploy --only functions
```

### Issue 2: "DeepSeek API failed"
**Solution:** Check DeepSeek API quota and billing at https://platform.deepseek.com

### Issue 3: "Budget exceeded" error
**Solution:** Check Firestore `ai_cost_tracking/monthly_stats` and increase budget limits in `ai-cost-optimizer.service.ts`

### Issue 4: Functions deployment fails
**Solution:**
```bash
cd functions
rm -rf node_modules package-lock.json
npm install
npm run build
firebase deploy --only functions
```

---

## 📈 Future Enhancements / التحسينات المستقبلية

🔄 **Phase 4.2 - UI Components:**
- [ ] AIFeaturesModal (pricing comparison)
- [ ] AIUsageAnalytics dashboard
- [ ] AI Assistant chat widget

🔄 **Phase 4.3 - Advanced Features:**
- [ ] DeepSeek Vision API integration (when available)
- [ ] Multi-model ensemble (combine Gemini + DeepSeek responses)
- [ ] A/B testing framework for AI outputs

🔄 **Phase 4.4 - Analytics:**
- [ ] Admin analytics dashboard
- [ ] Cost forecasting
- [ ] Provider performance comparison

---

## ✅ Completion Status / حالة الإنجاز

**Deep_plan.md Progress:**
- **Before:** 45% (Basic services existed)
- **After Phase 1:** 65% (Infrastructure + Advanced Features)
- **Target:** 100% (UI + Integration + Testing + Docs)

**Phase 1 (COMPLETED):**
✅ AI Router Service (278 lines)  
✅ Cost Optimizer Service (121 lines)  
✅ Enhanced DeepSeek Service (6 features)  
✅ Firebase Hybrid AI Proxy (server-side routing)  
✅ Updated vehicle-description-generator (uses AI Router)  
✅ Exported services in `src/services/ai/index.ts`

**Phase 2 (PENDING - Firebase Deployment):**
⏳ Configure API keys in Firebase Functions Config  
⏳ Deploy `hybridAIProxy` function  
⏳ Test in production environment

**Phase 3 (PENDING - UI Components):**
⏳ AIFeaturesModal component  
⏳ AIUsageAnalytics dashboard  
⏳ AI Assistant chat widget

**Phase 4 (PENDING - Integration):**
⏳ Integrate into sell workflow  
⏳ Integrate into profile page  
⏳ Integrate into search page  
⏳ Integrate into car details page

**Phase 5 (PENDING - Testing & Docs):**
⏳ Unit tests for services  
⏳ Integration tests for AI Router  
⏳ E2E tests for description generation  
⏳ User documentation (BG/EN)

---

## 📞 Contact / الاتصال

**Developer:** AI Architect Team  
**Project:** Bulgarski Mobili (New Globul Cars)  
**Date:** December 27, 2025  
**Status:** Infrastructure Complete ✅

---

**Version:** 1.0.0  
**Last Updated:** December 27, 2025
