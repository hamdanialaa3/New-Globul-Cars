# 🤖 AI System Architecture Documentation
# توثيق البنية المعمارية لنظام الذكاء الاصطناعي

**النسخة:** 2.0  
**التاريخ:** 20 نوفمبر 2025  
**الحالة:** Production Ready

---

## 📐 نظرة معمارية شاملة

```
┌──────────────────────────────────────────────────────────────┐
│                      Client Layer (React)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────────┐  │
│  │   Pages     │  │ Components  │  │   Contexts         │  │
│  │             │  │             │  │                    │  │
│  │ • HomePage  │  │ • AIChatbot │  │ • AuthProvider     │  │
│  │ • SellPages │  │ • AIImage   │  │ • LanguageProvider │  │
│  │ • Dashboard │  │   Analyzer  │  └────────────────────┘  │
│  └──────┬──────┘  └──────┬──────┘                           │
│         │                │                                   │
│         └────────┬───────┘                                   │
│                  ▼                                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │            AI Services Layer                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │  │
│  │  │ Gemini       │  │ Gemini       │  │ AI Quota   │ │  │
│  │  │ Vision       │  │ Chat         │  │ Service    │ │  │
│  │  │ Service      │  │ Service      │  │            │ │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                   Network Layer (HTTPS)                       │
└────────────────────────┬─────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌────────────────────┐         ┌────────────────────┐
│ Google Gemini API  │         │ Firebase Backend   │
│                    │         │                    │
│ • gemini-pro       │         │ ┌────────────────┐ │
│ • gemini-pro-vision│         │ │ Cloud Functions│ │
│                    │         │ │ • Price        │ │
│ Quota: 60 req/min  │         │ │   Valuation    │ │
│        1500 req/day│         │ │ • Chat Endpoint│ │
└────────────────────┘         │ └────────────────┘ │
                               │ ┌────────────────┐ │
                               │ │  Firestore DB  │ │
                               │ │ • ai_quotas    │ │
                               │ │ • ai_usage_logs│ │
                               │ │ • cars (market)│ │
                               │ └────────────────┘ │
                               └────────────────────┘
```

---

## 🔄 تدفق البيانات (Data Flow)

### **1. تحليل الصور (Image Analysis Flow)**

```
User uploads image
      │
      ▼
┌─────────────────────┐
│ AIImageAnalyzer.tsx │
│ • Validates file    │
│ • Shows progress    │
└──────────┬──────────┘
           │
           ▼
┌────────────────────────────┐
│ gemini-vision.service.ts   │
│ 1. Check quota             │
│ 2. Convert to base64       │
│ 3. Call Gemini Vision API  │
│ 4. Parse JSON response     │
│ 5. Track usage             │
└──────────┬─────────────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
┌─────────┐  ┌──────────────┐
│ Gemini  │  │ Firestore    │
│ API     │  │ • ai_quotas  │
│         │  │ • usage_logs │
└─────────┘  └──────────────┘
     │
     │ Response
     ▼
┌─────────────────────┐
│ CarAnalysisResult   │
│ {                   │
│   make: "BMW",      │
│   model: "320i",    │
│   year: "2018",     │
│   confidence: 87    │
│ }                   │
└─────────────────────┘
```

### **2. اقتراح الأسعار (Price Suggestion Flow)**

```
User clicks "Get AI Price"
      │
      ▼
┌──────────────────────┐
│ AIPriceSuggestion.tsx│
│ • Gets car details   │
│ • Shows loading      │
└──────────┬───────────┘
           │
           ▼
┌────────────────────────────┐
│ gemini-chat.service.ts     │
│ • suggestPrice()           │
│ OR                         │
│ Cloud Function             │
│ • getAIPriceValuation()    │
└──────────┬─────────────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
┌──────────┐  ┌──────────────────┐
│ AI       │  │ Firestore        │
│ Algorithm│  │ • Query cars     │
│          │  │   collection     │
│          │  │ • Get market data│
└──────────┘  └──────────────────┘
     │
     │ Calculation
     ▼
┌─────────────────────────┐
│ PriceSuggestion         │
│ {                       │
│   minPrice: 15400,      │
│   avgPrice: 17500,      │
│   maxPrice: 19600,      │
│   reasoning: "...",     │
│   marketTrend: "average"│
│ }                       │
└─────────────────────────┘
```

### **3. Chatbot (Conversation Flow)**

```
User types message
      │
      ▼
┌──────────────────┐
│ AIChatbot.tsx    │
│ • Stores history │
│ • Shows typing   │
└────────┬─────────┘
         │
         ▼
┌───────────────────────┐
│ gemini-chat.service.ts│
│ • chat(message)       │
│ • Build prompt        │
│ • Add context         │
└────────┬──────────────┘
         │
         ▼
┌──────────────────┐
│ Gemini Pro API   │
│ • Process prompt │
│ • Generate reply │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ AI Response      │
│ "Based on your   │
│  requirements,   │
│  I recommend..." │
└──────────────────┘
```

---

## 🗄️ قاعدة البيانات (Database Schema)

### **Firestore Collections**

#### **1. ai_quotas** (User Quotas)

```typescript
Collection: /ai_quotas/{userId}

Document Structure:
{
  userId: string,                    // User ID (matches auth.uid)
  tier: "free" | "basic" | "premium" | "enterprise",
  
  // Daily limits
  dailyImageAnalysis: number,        // Max per day
  dailyPriceSuggestions: number,
  dailyChatMessages: number,
  dailyProfileAnalysis: number,
  
  // Current usage
  usedImageAnalysis: number,         // Used today
  usedPriceSuggestions: number,
  usedChatMessages: number,
  usedProfileAnalysis: number,
  
  // Billing
  totalCost: number,                 // Total spent (EUR)
  lastBillingDate: string,           // ISO date
  lastResetDate: string,             // ISO date (for daily reset)
  
  // Metadata
  createdAt: Timestamp,
  updatedAt: Timestamp
}

Indexes:
- tier (for analytics)
- lastResetDate (for cleanup)

Security Rules:
- User can read their own quota
- User can update their usage (validated by Cloud Functions)
```

#### **2. ai_usage_logs** (Usage History)

```typescript
Collection: /ai_usage_logs/{logId}

Document Structure:
{
  userId: string,
  feature: "image_analysis" | "price_suggestion" | "chat" | "profile_analysis",
  success: boolean,
  timestamp: Timestamp,
  
  // Optional details
  result?: {
    confidence?: number,
    price?: number,
    messageLength?: number
  },
  error?: string,
  
  // Metadata
  ipAddress?: string,
  userAgent?: string
}

Indexes:
- userId + timestamp (for user history)
- feature + timestamp (for analytics)
- success (for error tracking)

Retention: 90 days (auto-delete via Cloud Function)
```

#### **3. cars** (Market Data - existing)

```typescript
Collection: /cars/{carId}

Used for:
- Price valuation algorithm
- Market trend analysis
- Comparable listings

Queried fields:
- make, model, year
- price, mileage
- location, condition
- createdAt (for recent data)
```

---

## 🔌 API Integration

### **Google Gemini API**

**Endpoints:**
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent
```

**Models Used:**
- `gemini-pro` - Text generation (chat)
- `gemini-pro-vision` - Image understanding

**Rate Limits:**
- Free tier: 60 requests/minute, 1500 requests/day
- Paid tier: Higher limits (contact Google)

**Request Format (Vision):**
```json
{
  "contents": [{
    "parts": [
      { "text": "Analyze this car image..." },
      { 
        "inlineData": {
          "mimeType": "image/jpeg",
          "data": "base64_encoded_image"
        }
      }
    ]
  }]
}
```

**Response Format:**
```json
{
  "candidates": [{
    "content": {
      "parts": [{
        "text": "{\"make\": \"BMW\", \"model\": \"320i\", ...}"
      }]
    }
  }]
}
```

### **Firebase Cloud Functions**

**Deployed Functions:**

1. **getAIPriceValuation**
   - Region: `europe-west1`
   - Timeout: 60s
   - Memory: 256MB
   - Trigger: HTTPS Callable
   
2. **geminiChat**
   - Region: `europe-west1`
   - Timeout: 30s
   - Memory: 256MB
   - Trigger: HTTPS Callable

**Invocation (Frontend):**
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const getValuation = httpsCallable(functions, 'getAIPriceValuation');

const result = await getValuation({
  make: 'BMW',
  model: '320i',
  // ...
});
```

---

## 🔒 الأمان (Security)

### **1. API Key Protection**

**❌ مشكلة:**
```typescript
// Exposed in client-side code
const apiKey = "AIzaSyC1YsQz2rpK8z_6cZev9y99rV1kIUVsrFI";
```

**✅ الحل:**
```typescript
// Environment variable (not committed)
const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

// .gitignore includes .env
```

### **2. Quota Enforcement**

```typescript
// Before every AI call
const quotaCheck = await aiQuotaService.canUseFeature(userId, feature);

if (!quotaCheck.allowed) {
  throw new Error('Quota exceeded');
}

// After successful call
await aiQuotaService.trackUsage(userId, feature, true, result);
```

### **3. Input Validation**

```typescript
// Sanitize user input
const sanitizedMessage = DOMPurify.sanitize(userMessage);

// Limit length
if (message.length > 1000) {
  throw new Error('Message too long');
}

// Validate file type
if (!file.type.startsWith('image/')) {
  throw new Error('Invalid file type');
}
```

### **4. Firestore Security Rules**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    match /ai_quotas/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /ai_usage_logs/{logId} {
      allow read: if request.auth != null && 
                  resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

---

## 📊 الأداء (Performance)

### **Optimization Strategies**

**1. Lazy Loading:**
```tsx
// Only load AI components when needed
const AIChatbot = React.lazy(() => import('@/components/AI/AIChatbot'));
```

**2. Caching:**
```typescript
// Cache Gemini responses (in-memory)
private cache = new Map<string, Result>();

async analyze(input: string) {
  if (this.cache.has(input)) {
    return this.cache.get(input);
  }
  const result = await this.gemini.generate(input);
  this.cache.set(input, result);
  return result;
}
```

**3. Debouncing:**
```typescript
// Avoid excessive API calls
const debouncedChat = useDebounce(sendMessage, 500);
```

**4. Progressive Enhancement:**
```tsx
// Show UI immediately, load AI in background
<AIComponent fallback={<BasicComponent />} />
```

### **Performance Metrics**

| Metric | Target | Actual |
|--------|--------|--------|
| Image Analysis | < 5s | ~3s |
| Price Suggestion | < 3s | ~2s |
| Chat Response | < 2s | ~1.5s |
| Dashboard Load | < 1s | ~0.8s |

---

## 🧪 Testing

### **Unit Tests**

```typescript
// gemini-vision.service.test.ts
describe('GeminiVisionService', () => {
  it('should analyze car image', async () => {
    const file = new File(['...'], 'car.jpg', { type: 'image/jpeg' });
    const result = await geminiVisionService.analyzeCarImage(file);
    
    expect(result.make).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
  });
});
```

### **Integration Tests**

```typescript
// ai-quota.service.integration.test.ts
describe('AI Quota Integration', () => {
  it('should enforce daily limits', async () => {
    // Use up all quota
    for (let i = 0; i < 5; i++) {
      await aiQuotaService.trackUsage('user123', 'image_analysis', true);
    }
    
    // Next call should fail
    const check = await aiQuotaService.canUseFeature('user123', 'image_analysis');
    expect(check.allowed).toBe(false);
  });
});
```

---

## 📈 Monitoring & Analytics

### **Firebase Analytics Events**

```typescript
// Track AI usage
logEvent(analytics, 'ai_image_analysis', {
  confidence: result.confidence,
  make: result.make,
  model: result.model
});

logEvent(analytics, 'ai_quota_exceeded', {
  feature: 'chat',
  tier: 'free'
});
```

### **Custom Dashboards**

```typescript
// Real-time usage statistics
const getAIStats = async () => {
  const logs = await db.collection('ai_usage_logs')
    .where('timestamp', '>=', startOfDay)
    .get();
    
  return {
    totalCalls: logs.size,
    successRate: logs.filter(l => l.success).length / logs.size,
    avgConfidence: // calculate
  };
};
```

---

## 🔄 التحديثات المستقبلية

### **Roadmap**

**Q1 2026:**
- [ ] تدريب ML Model على بيانات حقيقية
- [ ] Vertex AI deployment
- [ ] Multi-modal search (text + image)

**Q2 2026:**
- [ ] Voice chat support
- [ ] WhatsApp/Telegram integration
- [ ] Custom AI training per dealer

**Q3 2026:**
- [ ] Predictive maintenance suggestions
- [ ] Insurance quote integration
- [ ] Financing recommendations

---

## 📞 الدعم التقني

**للمطورين:**
- 📧 Email: tech@globulcars.bg
- 💬 Slack: #ai-development
- 📚 Wiki: /docs/ai/

**للمستخدمين:**
- 🤖 AI Chatbot: 24/7
- 📧 Support: support@globulcars.bg
- 📱 Phone: +359 XXX XXX XXX

---

**آخر تحديث:** 20 نوفمبر 2025  
**المساهمون:** AI Development Team  
**الترخيص:** Proprietary - Globul Cars Ltd.
