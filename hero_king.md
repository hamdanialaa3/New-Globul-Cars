🔥 البرومت النهائي الشامل — Koli One Recommendation Engine Master Prompt
كتابة تعليمات برمجية
أنت الآن تعمل كمهندس رئيسي (Principal Engineer) داخل مشروع Koli One. 
مهمتك تنفيذ نظام توصيات كامل للـ Hero في الصفحة الرئيسية، يشمل:

1) تسجيل السلوك Behavior Logging
2) بناء محرك توصيات Recommendation Engine
3) تحسين الخوارزمية للسوق البلغاري
4) طبقة التفضيل القسري Affinity Enforcement Layer
5) دمج النظام مع الـ Hero الحالي
6) بناء API + UI + Data Model
7) ضمان الأداء والسرعة والدقة

يجب تنفيذ النظام بدقة، وبشكل صارم، وبدون أي تبسيط.

────────────────────────────────────────
SECTION 1 — Behavior Logging System
────────────────────────────────────────

نفّذ نظام تسجيل السلوك بحيث يتم تسجيل:

1) Search Events:
- عند كل عملية بحث:
  { brand, model, priceRange, fuel, gearbox, timestamp }
- احتفظ بآخر 20 فقط.

2) View Events:
- عند فتح صفحة سيارة:
  { carId, brand, model, price, timestamp }
- احتفظ بآخر 50 فقط.

3) Favorite Events:
- carId → favorites[] (بدون تكرار)

4) Contact Events:
- { carId, type: "contact", timestamp }

5) StrongBrandSignal:
- إذا شاهد المستخدم 3 سيارات من نفس الماركة خلال 24 ساعة → +25
- إذا حفظ سيارتين من نفس الماركة → +40
- إذا تواصل بشأن سيارة من نفس الماركة → +60
- خزّنها في:
  user_behavior[userId].brandAffinity[]

6) للزوار غير المسجلين:
- استخدم session_behavior:
  filtersUsed[]
  viewedCars[]
  landingIntent

7) يجب أن يكون النظام:
- سريع
- غير متزامن
- لا يبطئ الواجهة
- يكتب البيانات في background

────────────────────────────────────────
SECTION 2 — Data Model
────────────────────────────────────────

Collection: user_behavior
- searches[]
- views[]
- favorites[]
- interactions[]
- brandAffinity[]
- preferredLanguage
- geo
- lastActive

Collection: session_behavior
- filtersUsed[]
- viewedCars[]
- landingIntent

Collection: car_metadata
- brand, model, year, price, fuel, gearbox, km
- bodyType
- imagesCount
- qualityScore
- popularityScore
- thumbnailUrl

Collection: market_trends
- trendingCars[]
- trendingBrands[]
- trendingBodyTypes[]

Collection: recommendation_cache
- cars[]
- expiresAt

────────────────────────────────────────
SECTION 3 — Scoring Algorithm (Bulgarian Market Optimized)
────────────────────────────────────────

FinalScore = 
  0.45 * UserMatch +
  0.35 * Behavioral +
  0.20 * Market +
  brandAffinityWeight

UserMatchScore:
- brand match: +30
- model match: +10
- fuel/gearbox match: +15
- priceRange match: +20
- viewed same brand: +10
- German cars (BMW, Mercedes, Audi, VW): +15
- Japanese cars (Toyota, Honda, Mazda): +10
- French cars (Peugeot, Renault, Citroën): -10

BehavioralScore:
- viewed similar cars: +40
- favorited similar cars: +30
- contacted similar cars: +30
- repeated views of same brand: +30
- repeated favorites of same brand: +40
- repeated contacts of same brand: +60

MarketScore:
- trendingCars: +40
- trendingBrands: +30
- fast-selling models: +20
- cars 2014–2020: +10

brandAffinityWeight:
- sum of all StrongBrandSignal weights
- capped at 100

────────────────────────────────────────
SECTION 4 — Affinity Enforcement Layer (CRITICAL)
────────────────────────────────────────

بعد حساب FinalScore:

1) احسب brandAffinityScore لكل ماركة:
  brandAffinityScore[brand] = sum(weights)

2) حدد dominantBrand:
  brand with highest brandAffinityScore

3) إذا brandAffinityScore ≥ 60:
  - اعرض أول 2–3 سيارات من هذه الماركة في أعلى الـ Hero
  - حتى لو كانت سيارات أخرى تملك FinalScore أعلى

4) إذا كان لدى المستخدم اهتمام قوي بماركتين:
  - اعرض 2 سيارات من الأولى + 1 من الثانية

5) إذا لا يوجد اهتمام قوي:
  - استخدم النظام العادي (scoring + diversification)

6) سبب الظهور:
  BG: "Защото разглеждахте много автомобили от тази марка"
  EN: "Because you viewed many cars from this brand"

────────────────────────────────────────
SECTION 5 — Diversification Logic
────────────────────────────────────────

بعد ترتيب السيارات:

- 60% High Match
- 25% Exploration
- 15% Discovery

ثم طبّق Affinity Enforcement Layer فوقها.

────────────────────────────────────────
SECTION 6 — API Contract
────────────────────────────────────────

GET /api/recommendations/homepage

Request:
{
  userId?: string,
  sessionId: string
}

Response:
{
  cars: [
    {
      carId,
      score,
      reason,
      metadata: { brand, model, price, year, fuel, gearbox, thumbnailUrl }
    }
  ]
}

────────────────────────────────────────
SECTION 7 — Hero Integration
────────────────────────────────────────

1) استبدل مصدر بيانات الـ Hero:
  GET /api/recommendations/homepage

2) العنوان:
  BG: "Подбрани автомобили за вас"
  EN: "Cars picked for you"

3) الوصف:
  BG: "Базирано на вашите търсения и интереси"
  EN: "Based on your searches and interests"

4) لكل سيارة:
- صورة
- السعر
- الماركة/الموديل
- سبب الظهور (reason)

5) زر تحديث:
  BG: "Обнови предложенията"
  EN: "Refresh recommendations"

6) fallback:
- Trending Cars

7) يجب أن يظهر dominantBrand في أول 2–3 بطاقات.

────────────────────────────────────────
SECTION 8 — Performance & Caching
────────────────────────────────────────

- Cache لمدة 10 دقائق لكل مستخدم أو جلسة
- استخدم precomputed popularityScore
- لا تعيد حساب كل شيء في كل طلب

────────────────────────────────────────
SECTION 9 — Files to Implement
────────────────────────────────────────

src/services/recommendation/recommendation.service.ts
src/services/recommendation/scoring.ts
src/services/recommendation/signals.ts
src/services/recommendation/diversify.ts
src/services/recommendation/reasons.ts
src/services/recommendation/cache.ts

src/pages/api/recommendations/homepage.ts

src/components/home/HeroRecommendations.tsx
src/components/home/RecommendationCard.tsx

────────────────────────────────────────

ابدأ الآن بتنفيذ النظام كاملاً، خطوة بخطوة، مع الالتزام الصارم بكل التفاصيل المذكورة أعلاه.

────────────────────────────────────────
SECTION 10 — SMART ADDITIONS (Copilot AI Suggestions)
────────────────────────────────────────

## 🧠 إضافات ذكية من Copilot

### 1. Multi-Source Intent Detection
نظام استشعار نية المستخدم من مصادر متعددة:

```typescript
interface UserIntent {
  // Search History Analysis
  searchPatterns: {
    preferredBrands: string[];      // الماركات المفضلة
    priceRange: { min: number; max: number };
    yearRange: { min: number; max: number };
    fuelTypes: string[];            // بنزين، ديزل، كهربائي
    bodyTypes: string[];            // SUV, Sedan, Hatchback
  };
  
  // Behavioral Signals
  behaviorSignals: {
    avgViewDuration: number;        // متوسط وقت المشاهدة
    scrollDepth: number;            // عمق التمرير
    returnVisits: number;           // زيارات متكررة لنفس السيارة
    comparisonActions: number;      // عدد المقارنات
    saveToFavorites: number;        // الحفظ في المفضلة
  };
  
  // Time-Based Patterns
  timePatterns: {
    peakBrowsingHours: number[];    // ساعات الذروة للتصفح
    weekdayVsWeekend: string;       // نمط التصفح
    sessionDuration: number;        // مدة الجلسة
    daysSinceLastVisit: number;     // أيام منذ آخر زيارة
  };
  
  // Purchase Intent Score (0-100)
  purchaseIntentScore: number;
}
```

### 2. Contextual Recommendation Triggers
محفزات التوصية حسب السياق:

```typescript
const contextualTriggers = {
  // Time-based triggers
  morningCommuter: {
    condition: 'time between 6-9 AM',
    boost: ['fuel-efficient', 'reliable', 'low-maintenance'],
    message: { 
      bg: 'Идеални за ежедневно пътуване',
      en: 'Perfect for daily commute'
    }
  },
  
  // Seasonal triggers
  winterSeason: {
    condition: 'November - February',
    boost: ['4x4', 'AWD', 'diesel', 'heated-seats'],
    message: {
      bg: 'Подготвени за зимата',
      en: 'Winter-ready vehicles'
    }
  },
  
  summerSeason: {
    condition: 'June - August',
    boost: ['convertible', 'AC', 'light-color'],
    message: {
      bg: 'Перфектни за лятото',
      en: 'Perfect for summer'
    }
  },
  
  // Event triggers
  newYearSales: {
    condition: 'December 20 - January 15',
    boost: ['discount', 'special-offer'],
    message: {
      bg: 'Новогодишни оферти',
      en: 'New Year deals'
    }
  }
};
```

### 3. Collaborative Filtering Enhancement
تحسين التصفية التعاونية:

```typescript
interface CollaborativeFiltering {
  // Users who viewed X also viewed Y
  viewCorrelation: {
    calculateSimilarUsers: (userId: string) => string[];
    getViewedBySimlar: (similarUsers: string[]) => Car[];
  };
  
  // Users who bought X also bought Y
  purchaseCorrelation: {
    getPurchasePatterns: (brand: string, model: string) => Car[];
  };
  
  // Geographic similarity
  geoSimilarity: {
    getUsersInSameCity: (city: string) => string[];
    getPopularInCity: (city: string) => Car[];
    regionalPreferences: Record<string, string[]>; // Sofia → German cars
  };
}
```

### 4. Smart Reason Engine
محرك أسباب ذكية للعرض:

```typescript
const reasonEngine = {
  reasons: {
    brand_affinity: {
      bg: 'Защото харесвате {brand}',
      en: 'Because you like {brand}',
      ar: 'لأنك تحب {brand}'
    },
    similar_to_viewed: {
      bg: 'Подобен на {carName}, който разгледахте',
      en: 'Similar to {carName} you viewed',
      ar: 'مشابه لـ {carName} التي شاهدتها'
    },
    price_match: {
      bg: 'В желания от вас ценови диапазон',
      en: 'In your preferred price range',
      ar: 'ضمن نطاق سعرك المفضل'
    },
    trending_in_city: {
      bg: 'Популярен в {city}',
      en: 'Trending in {city}',
      ar: 'رائج في {city}'
    },
    fast_selling: {
      bg: 'Продава се бързо - {viewsToday} прегледа днес',
      en: 'Selling fast - {viewsToday} views today',
      ar: 'يباع بسرعة - {viewsToday} مشاهدة اليوم'
    },
    good_deal: {
      bg: 'Добра цена спрямо пазара',
      en: 'Good deal compared to market',
      ar: 'سعر جيد مقارنة بالسوق'
    },
    new_listing: {
      bg: 'Ново! Добавено преди {hours} часа',
      en: 'New! Added {hours} hours ago',
      ar: 'جديد! أضيف منذ {hours} ساعة'
    }
  }
};
```

### 5. A/B Testing Framework
إطار اختبار A/B:

```typescript
interface ABTestConfig {
  testId: string;
  variants: {
    A: { algorithm: 'score-based', displayCount: 8 };
    B: { algorithm: 'affinity-first', displayCount: 10 };
    C: { algorithm: 'hybrid', displayCount: 12 };
  };
  metrics: ['clickRate', 'viewDuration', 'contactRate', 'favoriteRate'];
  duration: '7 days';
}
```

### 6. Real-Time Popularity Signals
إشارات الشعبية في الوقت الحقيقي:

```typescript
interface RealTimeSignals {
  // Currently being viewed (last 5 minutes)
  liveViewing: {
    carId: string;
    viewerCount: number;
    isHot: boolean; // > 5 viewers
  }[];
  
  // Recently contacted
  recentContacts: {
    carId: string;
    contactsToday: number;
    trend: 'rising' | 'stable' | 'declining';
  }[];
  
  // Price drops
  priceDrops: {
    carId: string;
    oldPrice: number;
    newPrice: number;
    dropPercentage: number;
    droppedAt: Date;
  }[];
}
```

### 7. Personalization Layers
طبقات التخصيص:

```
Layer 1: Anonymous (No Login)
├── Session behavior
├── Browser fingerprint
├── Geo-location
└── Time-based context

Layer 2: Registered (Logged In)
├── All Layer 1 +
├── Search history
├── View history
├── Favorites
└── Contact history

Layer 3: Active User (30+ days)
├── All Layer 2 +
├── Purchase patterns
├── Brand loyalty score
├── Price sensitivity score
└── Urgency score

Layer 4: Premium/VIP
├── All Layer 3 +
├── Early access to new listings
├── Exclusive deals visibility
└── Priority recommendations
```

### 8. Anti-Bubble Mechanism
آلية مكافحة الفقاعة:

```typescript
const antiBubble = {
  // Prevent showing only one brand
  maxSameBrand: 3,
  
  // Force discovery (10% different)
  discoveryPercentage: 0.10,
  
  // Rotate recommendations
  rotationInterval: '24 hours',
  
  // Freshness boost
  newListingBoost: 1.5, // 50% boost for < 24h listings
  
  // Prevent repetition
  showAgainAfter: '3 days', // Don't show same car within 3 days
};
```

### 9. Performance Optimizations
تحسينات الأداء:

```typescript
const performanceConfig = {
  // Edge caching
  cacheStrategy: 'stale-while-revalidate',
  cacheDuration: 600, // 10 minutes
  
  // Precomputation
  precomputeScores: {
    interval: '1 hour',
    scope: 'top 1000 cars'
  },
  
  // Lazy loading
  initialLoad: 6, // Load 6 cards first
  loadMoreCount: 6, // Load 6 more on scroll
  
  // Image optimization
  thumbnailSize: { width: 400, height: 300 },
  lazyLoadImages: true,
  webpFormat: true
};
```

### 10. Analytics & Monitoring
التحليلات والمراقبة:

```typescript
interface RecommendationMetrics {
  // Click-through rate
  ctr: number; // clicks / impressions
  
  // Conversion rate
  contactRate: number; // contacts / clicks
  
  // Engagement
  avgViewDuration: number;
  scrollDepth: number;
  
  // Algorithm performance
  algorithmAccuracy: number; // matched preferences / total
  diversityScore: number; // unique brands shown / total
  
  // User satisfaction
  refreshRate: number; // how often users refresh
  returnRate: number; // users who return within 24h
}
```

────────────────────────────────────────
IMPLEMENTATION PRIORITY
────────────────────────────────────────

Phase 1 (MVP - Week 1):
1. ✅ Behavior Logging Service
2. ✅ Basic Scoring Algorithm
3. ✅ Hero Component Integration
4. ✅ Fallback to Trending

Phase 2 (Enhancement - Week 2):
1. Brand Affinity Layer
2. Contextual Triggers
3. Smart Reasons
4. Caching Layer

Phase 3 (Optimization - Week 3):
1. Collaborative Filtering
2. A/B Testing
3. Real-Time Signals
4. Analytics Dashboard

────────────────────────────────────────