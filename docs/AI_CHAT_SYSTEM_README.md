# AI Chat System - Complete Integration Guide
# دليل التكامل الكامل لنظام المحادثة بالذكاء الاصطناعي

## 📋 Overview | نظرة عامة

This document outlines the complete AI chat system integration for Bulgarian Car Marketplace (Globul Cars), connecting the frontend chat interface with secure backend Firebase Cloud Functions.

هذا المستند يشرح التكامل الكامل لنظام المحادثة بالذكاء الاصطناعي لمنصة السيارات البلغارية (Globul Cars)، الذي يربط واجهة المحادثة الأمامية مع Cloud Functions الآمنة.

---

## 🏗️ Architecture | البنية المعمارية

```
┌─────────────────────────────────────┐
│   Frontend (React + TypeScript)    │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   RobotChatIcon.tsx          │  │  ← زر المحادثة العائم
│  │   (Floating Chat Button)     │  │
│  └──────────┬───────────────────┘  │
│             │ controls              │
│             ▼                       │
│  ┌──────────────────────────────┐  │
│  │   AIChatbot.tsx              │  │  ← واجهة المحادثة
│  │   (Chat Interface)           │  │
│  └──────────┬───────────────────┘  │
│             │ calls                 │
│             ▼                       │
│  ┌──────────────────────────────┐  │
│  │ firebase-ai-callable.service │  │  ← خدمة الاتصال
│  │   (Firebase Functions)       │  │
│  └──────────┬───────────────────┘  │
└─────────────┼───────────────────────┘
              │ HTTPS Callable
              ▼
┌─────────────────────────────────────┐
│ Backend (Firebase Cloud Functions) │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  geminiChat                  │  │  ← وظيفة المحادثة
│  │  (Chat Endpoint)             │  │
│  ├──────────────────────────────┤  │
│  │  suggestPriceAI              │  │  ← اقتراح الأسعار
│  │  (Price Suggestion)          │  │
│  ├──────────────────────────────┤  │
│  │  analyzeProfileAI            │  │  ← تحليل الملف الشخصي
│  │  (Profile Analysis)          │  │
│  └──────────┬───────────────────┘  │
│             │ uses                  │
│             ▼                       │
│  ┌──────────────────────────────┐  │
│  │   Google Gemini AI           │  │  ← Gemini 1.5 Flash
│  │   (gemini-1.5-flash)         │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 📁 File Structure | هيكل الملفات

### Frontend Files | ملفات الواجهة الأمامية

```
bulgarian-car-marketplace/src/
├── components/AI/
│   ├── RobotChatIcon.tsx           # زر المحادثة العائم (Message Circle Icon)
│   └── AIChatbot.tsx                # واجهة نافذة المحادثة
│
├── services/ai/
│   ├── firebase-ai-callable.service.ts  # خدمة الاتصال الآمن بـ Firebase Functions
│   ├── gemini-chat.service.ts           # (Legacy - للاستخدام المحلي فقط)
│   ├── ai-quota.service.ts              # إدارة حصص الاستخدام
│   └── index.ts                         # تصدير الخدمات
│
├── types/
│   └── ai.types.ts                  # أنواع TypeScript للذكاء الاصطناعي
│
└── locales/
    └── translations.ts               # ترجمات BG/EN للذكاء الاصطناعي
```

### Backend Files | ملفات الخادم

```
functions/src/ai/
├── gemini-chat-endpoint.ts          # وظيفة المحادثة الرئيسية
├── price-suggestion-endpoint.ts     # وظيفة اقتراح الأسعار
├── profile-analysis-endpoint.ts     # وظيفة تحليل الملف الشخصي
├── types.ts                         # أنواع الطلبات والردود
└── index.ts                         # تصدير الوظائف
```

---

## 🔧 Configuration | الإعدادات

### 1. Firebase Secrets Setup | إعداد الأسرار

```bash
# Set Gemini API Key
firebase functions:secrets:set GEMINI_API_KEY

# Set Model Name (optional, defaults to gemini-1.5-flash)
firebase functions:secrets:set GEMINI_MODEL
```

### 2. Environment Variables | متغيرات البيئة

**Frontend (.env):**
```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Legacy: Only for local development (NOT used in production)
REACT_APP_GOOGLE_GENERATIVE_AI_KEY=your_gemini_key
```

**Backend (Firebase Functions):**
```bash
# Secrets are automatically injected via Firebase Functions Secrets
# No .env file needed for production
```

---

## 🚀 Usage | طريقة الاستخدام

### Frontend Integration | التكامل الأمامي

#### 1. Add RobotChatIcon to App | إضافة زر المحادثة للتطبيق

```tsx
// App.tsx
import { RobotChatIcon } from '@/components/AI/RobotChatIcon';

function App() {
  return (
    <div className="App">
      {/* Your app content */}
      
      {/* Global AI Chat Button */}
      <RobotChatIcon />
    </div>
  );
}
```

#### 2. Using Firebase AI Service | استخدام خدمة الذكاء الاصطناعي

```typescript
import { firebaseAIService } from '@/services/ai';

// Chat with AI
const response = await firebaseAIService.chat(
  'What is the average price for BMW 3 Series 2020?',
  {
    page: 'search',
    language: 'bg',
    userType: 'buyer'
  },
  conversationHistory
);

// Get Price Suggestion
const priceSuggestion = await firebaseAIService.suggestPrice({
  make: 'BMW',
  model: '3 Series',
  year: 2020,
  mileage: 50000,
  condition: 'good',
  location: 'София'
});

// Analyze Profile
const profileAnalysis = await firebaseAIService.analyzeProfile({
  name: 'John Doe',
  listings: 5,
  verified: true
  // ... more profile data
});
```

---

## 🌍 Bilingual Support | الدعم ثنائي اللغة

### Translation Keys | مفاتيح الترجمة

The system supports **Bulgarian (bg)** and **English (en)** translations:

```typescript
// Access translations via useLanguage hook
const { t, language } = useLanguage();

// AI Assistant Title
t('ai.assistant');  // BG: "AI Асистент" | EN: "AI Assistant"

// Chat Placeholder
t('ai.chat.placeholder');  // BG: "Напишете вашето съобщение..." | EN: "Type your message..."

// Welcome Message
t('ai.chat.welcome');  // BG: "Здравейте! Как мога да ви помогна днес?"
                       // EN: "Hello! How can I help you today?"
```

### Available Translation Keys | المفاتيح المتاحة

```
ai.assistant
ai.chat.title
ai.chat.placeholder
ai.chat.send
ai.chat.welcome
ai.chat.typing
ai.chat.error
ai.chat.quotaExceeded
ai.chat.openChat
ai.chat.closeChat
ai.features.priceAnalysis
ai.features.marketTrends
ai.features.carRecommendations
ai.features.sellingTips
```

---

## 🔒 Security | الأمان

### Key Security Features | ميزات الأمان الرئيسية

1. **Server-Side Processing | معالجة من جانب الخادم**
   - All AI requests go through Firebase Cloud Functions
   - No API keys exposed to client
   - جميع طلبات الذكاء الاصطناعي تمر عبر Firebase Cloud Functions
   - لا يتم كشف مفاتيح API للعميل

2. **Authentication | المصادقة**
   - User authentication via Firebase Auth
   - Requests include auth token automatically
   - مصادقة المستخدم عبر Firebase Auth
   - الطلبات تحتوي على رمز المصادقة تلقائياً

3. **Quota Management | إدارة الحصص**
   - Daily usage limits per user
   - Automatic quota tracking
   - حدود استخدام يومية لكل مستخدم
   - تتبع تلقائي للحصة

4. **Error Handling | معالجة الأخطاء**
   - Graceful error messages
   - Fallback responses
   - رسائل خطأ واضحة
   - ردود احتياطية

---

## 📊 Features | الميزات

### Current Features | الميزات الحالية

✅ **Real-time Chat | محادثة فورية**
   - Conversation history (last 6 messages)
   - Typing indicator
   - Auto-scroll to latest message
   - سجل المحادثة (آخر 6 رسائل)
   - مؤشر الكتابة
   - التمرير التلقائي للرسالة الأخيرة

✅ **Context-Aware Responses | ردود حسب السياق**
   - Page-specific AI behavior
   - User type consideration (buyer/seller/dealer)
   - Language-aware responses
   - سلوك الذكاء الاصطناعي حسب الصفحة
   - مراعاة نوع المستخدم (مشتري/بائع/تاجر)
   - ردود حسب اللغة

✅ **Price Analysis | تحليل الأسعار**
   - Market-based price suggestions
   - Min/Avg/Max pricing
   - Reasoning and trends
   - اقتراحات الأسعار حسب السوق
   - أسعار الحد الأدنى/المتوسط/الأقصى
   - التفسير والاتجاهات

✅ **Profile Analysis | تحليل الملف الشخصي**
   - Completeness score
   - Trust score
   - Improvement suggestions
   - درجة الاكتمال
   - درجة الثقة
   - اقتراحات التحسين

✅ **Quota System | نظام الحصص**
   - Free tier: 20 messages/day
   - Premium: Unlimited
   - Usage tracking
   - المستوى المجاني: 20 رسالة/يوم
   - المميز: غير محدود
   - تتبع الاستخدام

---

## 🎨 UI Components | مكونات الواجهة

### RobotChatIcon | أيقونة روبوت المحادثة

**Features:**
- Floating action button (bottom-right)
- MessageCircle icon (Lucide React)
- Smooth animations
- Bilingual tooltip
- State-based color change

**Position:**
- Desktop: `bottom: 244px; right: 32px`
- Mobile: `bottom: 212px; right: 24px`

### AIChatbot | نافذة المحادثة

**Features:**
- Modern glassmorphism design
- Message bubbles (user/assistant)
- Typing indicator with animated dots
- Auto-scroll
- Keyboard shortcut (Enter to send)
- Responsive layout

**Dimensions:**
- Desktop: `380px × 550px`
- Mobile: Full screen with margins

---

## 🧪 Testing | الاختبار

### Manual Testing | الاختبار اليدوي

1. **Chat Functionality | وظيفة المحادثة**
   ```
   ✓ Click robot icon → Chat window opens
   ✓ Type message → Send → Receive AI response
   ✓ Close button → Window closes
   ✓ Enter key → Sends message
   ```

2. **Language Switching | تبديل اللغة**
   ```
   ✓ Switch to Bulgarian → UI updates
   ✓ Switch to English → UI updates
   ✓ Tooltip shows correct language
   ```

3. **Quota System | نظام الحصص**
   ```
   ✓ Send 20 messages (free tier)
   ✓ Quota exceeded message appears
   ✓ Check quota in Firestore (`ai_quotas` collection)
   ```

### Backend Testing | اختبار الخادم

```bash
# Deploy functions
cd functions
npm run deploy

# Test chat endpoint (requires auth token)
curl -X POST \
  https://europe-west1-YOUR_PROJECT.cloudfunctions.net/geminiChat \
  -H "Content-Type: application/json" \
  -d '{"data":{"message":"Hello AI!","context":{"page":"home","language":"en"}}}'
```

---

## 📈 Monitoring | المراقبة

### Firestore Collections | مجموعات Firestore

1. **`ai_quotas`** - Usage quotas per user
   ```json
   {
     "userId": "abc123",
     "dailyChatMessages": 20,
     "usedChatMessages": 5,
     "lastResetDate": "2025-11-21"
   }
   ```

2. **`ai_usage_logs`** - Activity logs
   ```json
   {
     "userId": "abc123",
     "feature": "chat",
     "success": true,
     "timestamp": "2025-11-21T10:30:00Z",
     "metadata": { "messageLength": 25 }
   }
   ```

### Firebase Console Monitoring

- **Functions logs**: `Firebase Console → Functions → Logs`
- **Usage statistics**: `Firestore → Data → ai_usage_logs`
- **Quota tracking**: `Firestore → Data → ai_quotas`

---

## 🚨 Troubleshooting | حل المشاكل

### Common Issues | المشاكل الشائعة

**1. "GEMINI_API_KEY not configured"**
```bash
# Solution | الحل
firebase functions:secrets:set GEMINI_API_KEY
# Enter your key when prompted
```

**2. Chat window not opening**
```typescript
// Check: RobotChatIcon imported in App.tsx
import { RobotChatIcon } from '@/components/AI/RobotChatIcon';

// Check: Component rendered
<RobotChatIcon />
```

**3. Quota exceeded immediately**
```bash
# Reset quota manually in Firestore
# Or wait until next day (automatic reset)
```

**4. "Failed to call function"**
```bash
# Check function deployment
firebase deploy --only functions:geminiChat

# Check Firebase region
# Must be 'europe-west1' (Bulgaria)
```

---

## 📚 API Reference | مرجع API

### firebaseAIService Methods

#### `chat(message, context, conversationHistory)`

**Parameters:**
- `message`: string - User's message
- `context`: AIChatContext - Page context, language, user type
- `conversationHistory`: AIChatMessage[] - Previous messages

**Returns:** `Promise<{ message: string; quotaRemaining?: number }>`

#### `suggestPrice(carDetails)`

**Parameters:**
- `carDetails`: Object with make, model, year, mileage, condition, location

**Returns:** `Promise<PriceSuggestion>`

#### `analyzeProfile(profileData)`

**Parameters:**
- `profileData`: Object with user profile information

**Returns:** `Promise<ProfileAnalysis>`

---

## 🔄 Updates & Deployment | التحديثات والنشر

### Deploy Frontend | نشر الواجهة

```bash
cd bulgarian-car-marketplace
npm run build
firebase deploy --only hosting
```

### Deploy Functions | نشر الوظائف

```bash
cd functions
npm run build
firebase deploy --only functions
```

### Deploy All | نشر كل شيء

```bash
firebase deploy
```

---

## 📝 Changelog | سجل التغييرات

### November 21, 2025
✅ Complete AI chat system integration
✅ RobotChatIcon floating button (MessageCircle icon)
✅ AIChatbot with Firebase Functions backend
✅ Bilingual support (BG/EN)
✅ Secure server-side Gemini integration
✅ Quota management system
✅ Price suggestion endpoint
✅ Profile analysis endpoint
✅ Translation keys added
✅ Full documentation

---

## 👥 Team & Support | الفريق والدعم

**Developed by:** Globul Cars Development Team
**Supported Languages:** Bulgarian (bg), English (en)
**AI Model:** Google Gemini 1.5 Flash
**Region:** Bulgaria (europe-west1)

**Support:**
- GitHub Issues: [Repository Issues](https://github.com/your-repo/issues)
- Documentation: This file
- Email: support@globulcars.bg

---

## 📄 License | الترخيص

Proprietary - Bulgarian Car Marketplace (Globul Cars)
© 2025 All Rights Reserved

---

**Last Updated:** November 21, 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready
