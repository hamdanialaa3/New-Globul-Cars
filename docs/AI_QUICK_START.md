# ⚡ Quick Start Guide - AI Hybrid System
# دليل البدء السريع - النظام الهجين للذكاء الاصطناعي

**For:** Developers & Administrators  
**Time to Deploy:** 20 minutes ⏱️  
**Last Updated:** December 27, 2025

---

## 🚀 Deployment in 5 Steps

### Step 1: Configure API Keys (5 minutes)
```bash
cd functions

# Configure Gemini API Key
firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY_HERE"

# Configure DeepSeek API Key
firebase functions:config:set deepseek.api_key="YOUR_DEEPSEEK_API_KEY_HERE"

# Verify configuration
firebase functions:config:get
```

**Get API Keys:**
- Gemini: https://makersuite.google.com/app/apikey
- DeepSeek: https://platform.deepseek.com/api_keys

---

### Step 2: Install Dependencies (2 minutes)
```bash
cd functions
npm install

# Verify axios is installed (required for hybrid-ai-proxy)
npm list axios
# If not installed: npm install axios
```

---

### Step 3: Build Functions (2 minutes)
```bash
cd functions
npm run build

# If build fails, clean and retry:
rm -rf lib
npm run build
```

---

### Step 4: Deploy to Firebase (5 minutes)
```bash
# Deploy only functions (faster)
firebase deploy --only functions

# Or deploy everything (slower)
firebase deploy
```

**Expected Output:**
```
✔  functions[hybridAIProxy]: Successful create operation.
Function URL (hybridAIProxy): https://us-central1-YOUR-PROJECT.cloudfunctions.net/hybridAIProxy
```

---

### Step 5: Test Deployment (5 minutes)

#### Test from Frontend:
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const hybridAI = httpsCallable(functions, 'hybridAIProxy');

const result = await hybridAI({
  vehicleData: {
    make: 'BMW',
    model: '320d',
    year: 2018,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    mileage: 80000
  },
  options: {
    language: 'bg',
    userType: 'dealer'
  }
});

console.log('Description:', result.data.description);
console.log('Provider:', result.data.provider);
console.log('Cost: $' + result.data.cost);
```

#### Test from CLI:
```bash
firebase functions:shell

# Then in the shell:
hybridAIProxy({
  vehicleData: { make: 'BMW', model: 'X5', year: 2020 },
  options: { language: 'bg', userType: 'dealer' }
})
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Function appears in Firebase Console → Functions
- [ ] No errors in Firebase logs: `firebase functions:log`
- [ ] Test call returns valid description
- [ ] Provider is correctly selected (DeepSeek for dealers by default)
- [ ] Cost is tracked in Firestore: `ai_cost_tracking/monthly_stats`
- [ ] Budget limits are enforced (check after 10+ calls)

---

## 🎯 Usage Examples

### Example 1: Generate Description (Auto-Routing)
```typescript
import { aiRouterService } from '@/services/ai';

const result = await aiRouterService.generateDescription(
  {
    make: 'Mercedes-Benz',
    model: 'E-Class',
    year: 2019,
    fuelType: 'Diesel',
    transmission: 'Automatic'
  },
  {
    language: 'bg',
    userType: 'dealer'
  }
);

// Returns: { description, provider: 'deepseek', cost: 0.0004, generatedBy: 'ai' }
```

### Example 2: Force Gemini (For Testing)
```typescript
const result = await aiRouterService.generateDescription(
  vehicleData,
  {
    language: 'bg',
    userType: 'dealer',
    forceProvider: 'gemini'  // Override auto-selection
  }
);

// Returns: { description, provider: 'gemini', cost: 0.002, generatedBy: 'ai' }
```

### Example 3: Check Budget Status
```typescript
import { aiCostOptimizerService } from '@/services/ai';

const status = await aiCostOptimizerService.checkBudgetStatus();

console.log('Gemini Budget Remaining: $' + status.geminiRemaining);
console.log('DeepSeek Budget Remaining: $' + status.deepseekRemaining);

if (status.geminiExceeded) {
  console.warn('⚠️ Gemini budget exceeded! Auto-switching to DeepSeek.');
}
```

### Example 4: Price Suggestion
```typescript
import { deepSeekEnhancedService } from '@/services/ai';

const priceAnalysis = await deepSeekEnhancedService.suggestPrice(
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

console.log('Suggested Price:', priceAnalysis.suggestedPrice, 'EUR');
console.log('Range:', priceAnalysis.priceRange.min, '-', priceAnalysis.priceRange.max, 'EUR');
console.log('Reasoning:', priceAnalysis.reasoning);
```

### Example 5: Fraud Detection
```typescript
import { deepSeekEnhancedService } from '@/services/ai';

const fraudCheck = await deepSeekEnhancedService.detectFraud(listing, 'bg');

if (fraudCheck.riskLevel === 'high') {
  console.error('🚨 High fraud risk detected!');
  console.log('Warnings:', fraudCheck.warnings);
  console.log('Reasoning:', fraudCheck.reasoning);
}
```

---

## 🔧 Configuration

### Adjust Budget Limits
**File:** `src/services/ai/ai-cost-optimizer.service.ts`

```typescript
private readonly BUDGET_LIMITS = {
  gemini: 50.0,   // Change to your preferred monthly limit
  deepseek: 30.0  // Change to your preferred monthly limit
};
```

### Adjust Cost Per Request
**File:** `src/services/ai/ai-router.service.ts`

```typescript
private readonly COSTS = {
  gemini: 0.002,   // Update if Gemini pricing changes
  deepseek: 0.0004 // Update if DeepSeek pricing changes
};
```

---

## 🐛 Troubleshooting

### Issue: "Gemini API key not configured"
**Solution:**
```bash
firebase functions:config:set gemini.api_key="YOUR_KEY"
firebase deploy --only functions
```

### Issue: "DeepSeek API failed"
**Solution:**
1. Check API key is correct: `firebase functions:config:get`
2. Verify DeepSeek account has credits: https://platform.deepseek.com/usage
3. Check Firebase Functions logs: `firebase functions:log`

### Issue: "Budget exceeded" error
**Solution:**
1. Check current spending: Query Firestore `ai_cost_tracking/monthly_stats`
2. Increase budget limits in `ai-cost-optimizer.service.ts`
3. Wait for monthly reset (automatic on 1st of month)

### Issue: Functions deployment fails
**Solution:**
```bash
cd functions
rm -rf node_modules lib package-lock.json
npm install
npm run build
firebase deploy --only functions
```

### Issue: "Cannot find module 'axios'"
**Solution:**
```bash
cd functions
npm install axios
npm run build
firebase deploy --only functions
```

---

## 📊 Monitoring

### View Real-time Costs
```typescript
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';

const statsRef = doc(db, 'ai_cost_tracking', 'monthly_stats');

onSnapshot(statsRef, (snapshot) => {
  const data = snapshot.data();
  console.log('Gemini Spent: $' + data.gemini.monthlySpent);
  console.log('DeepSeek Spent: $' + data.deepseek.monthlySpent);
});
```

### Check Firebase Logs
```bash
# View all logs
firebase functions:log

# View only errors
firebase functions:log --only error

# View specific function
firebase functions:log --only hybridAIProxy

# Tail logs (real-time)
firebase functions:log --tail
```

---

## 🎯 Next Steps

After successful deployment:

1. ✅ Test with real car data
2. ✅ Verify costs are tracked correctly
3. ✅ Integrate into sell workflow UI
4. ✅ Build AIFeaturesModal component
5. ✅ Build AIUsageAnalytics dashboard
6. ✅ Add to profile page
7. ✅ Write unit tests

---

## 📞 Support

**Issues:** https://github.com/YOUR_REPO/issues  
**Docs:** `docs/AI_HYBRID_SYSTEM.md` (full documentation)  
**Tracker:** `docs/AI_DEEP_PLAN_TRACKER.md` (progress tracker)  
**Report:** `docs/AI_COMPLETION_REPORT_AR.md` (Arabic summary)

---

**Version:** 1.0.0  
**Status:** Ready for Production ✅  
**Estimated Setup Time:** 20 minutes
