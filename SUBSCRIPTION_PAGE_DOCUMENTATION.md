# 📋 الوصف البرمجي الكامل لصفحة الاشتراكات
## `/subscription` - Subscription Page Documentation

---

## 📁 **الملفات الرئيسية**

### 1. **الصفحة الرئيسية**
- **الملف**: `src/pages/08_payment-billing/SubscriptionPage.tsx`
- **المكون الرئيسي**: `SubscriptionPage`
- **المسار**: `http://localhost:3000/subscription`

### 2. **مكون إدارة الاشتراكات**
- **الملف**: `src/components/subscription/SubscriptionManager.tsx`
- **المكون**: `SubscriptionManagerEnhanced`
- **الوظيفة**: يعرض البطاقات والتفاعلات

### 3. **إعدادات الخطط**
- **الملف**: `src/config/subscription-plans.ts`
- **المحتوى**: تعريف الخطط والحدود والخصائص

---

## 🎯 **البنية الكاملة للصفحة**

### **1. Hero Header Section** (الهيدر الرئيسي)

#### **المكونات:**
- `HeroHeader`: الهيدر الرئيسي مع خلفية متدرجة
- `HeroBackgroundImages`: حاوية للصور الخلفية
- `BackgroundImage`: صور متغيرة (3 صور) مع تأثيرات ضبابية ودخانية
  - `private.png` (0s delay)
  - `dealer.png` (5s delay)
  - `company.png` (10s delay)
- `HeroContent`: محتوى الهيدر
- `BackButton`: زر العودة للخلف
- `HeroTitleWrapper`: حاوية العنوان
- `HeroIconBadge`: شارة الأيقونة (Crown)
- `HeroTitle`: العنوان الرئيسي
- `HeroSubtitle`: العنوان الفرعي
- `HeroStats`: إحصائيات (10,000+ سيارات، 98% رضا، 24/7 دعم)

#### **التأثيرات:**
- صور متغيرة كل 5 ثوانٍ
- تأثيرات ضبابية: `blur(18px)` + `brightness(0.5)`
- تأثيرات دخانية: `smokeFloat` animation
- خلفية متدرجة متحركة: `shimmer` animation

---

### **2. Trust Badges Section** (شارات الثقة)

#### **المكونات:**
- `TrustSection`: قسم الشارات
- `TrustContent`: محتوى الشارات
- `TrustBadge`: شارة واحدة (4 شارات)
  - SSL Secure (Shield icon)
  - Best Platform 2025 (Award icon)
  - 30-Day Guarantee (HeartHandshake icon)
  - Instant Activation (Clock icon)

#### **التأثيرات:**
- خلفية شفافة مع `backdrop-filter: blur(15px)`
- تأثيرات hover دخانية
- أيقونات مع `drop-shadow` و `blur`

---

### **3. Subscription Plans Section** (قسم خطط الاشتراك)

#### **المكونات الرئيسية:**

##### **A. Header Section**
- `Header`: رأس القسم
- `Title`: "Изберете вашия план" / "Choose Your Plan"
- `Subtitle`: وصف الخطط

##### **B. Interval Toggle** (تبديل الفترة)
- `IntervalToggle`: حاوية التبديل
- `IntervalButton`: زر الفترة
  - **Monthly** (Месечно): `interval === 'monthly'`
  - **Annual** (Годишно): `interval === 'annual'`
  - `SavingsBadge`: شارة التوفير "Спести до 33%" (فقط عند اختيار Annual)

##### **C. Plans Carousel** (عرض البطاقات)

###### **1. Expanded Mobile View** (عرض الجوال الموسع)
- `ExpandOverlay`: طبقة الخلفية عند التوسيع
- `ExpandSheet`: ورقة البطاقة الموسعة
- **السلوك**: 
  - يفتح عند النقر على بطاقة في الجوال
  - يغلق عند النقر خارجها أو الضغط على Escape
  - يغلق عند التمرير (touch move)

###### **2. Carousel View** (عرض الكاروسيل)
- `PlansCarousel`: حاوية الكاروسيل
- `PlansViewport`: منطقة العرض القابلة للتمرير
- `CarouselItem`: عنصر بطاقة واحد
- **السلوك**:
  - تمرير أفقي للبطاقات
  - أسهم للتنقل (ChevronLeft/ChevronRight)
  - auto-scroll عند فتح الصفحة (500ms delay)

##### **D. Plan Card** (بطاقة الخطة)

###### **البنية:**
```typescript
<Card>
  {/* Badge (للخطة الشائعة فقط) */}
  {plan.popular && (
    <>
      <Badge>Най-популярен / Most Popular</Badge>
      <PopularityIndicator>⭐⭐⭐⭐⭐</PopularityIndicator>
    </>
  )}

  {/* Icon */}
  <IconWrapper>
    <Icon /> {/* Crown, TrendingUp, or Building2 */}
  </IconWrapper>

  {/* Plan Name */}
  <PlanName>{plan.name.bg / plan.name.en}</PlanName>

  {/* Plan Description */}
  <PlanDescription>{plan.description.bg / plan.description.en}</PlanDescription>

  {/* Price */}
  <Price>
    {plan.id === 'free' ? (
      <div className="amount">Безплатно / Free</div>
    ) : (
      <>
        <div className="amount">
          <span className="currency">€</span>
          <span className="euro-amount">{euroPart}</span>
          <span className="cents-amount">
            .{restCents}
            <span style={{ fontSize: '4.5rem' }}>{lastDigit}</span>
          </span>
        </div>
        <div className="period">на месец / per month</div>
        {originalPrice && <div className="original-price">Обикновено {originalPrice}</div>}
      </>
    )}
  </Price>

  {/* Features List */}
  <FeatureList $free={plan.id === 'free'}>
    {features.map((feature) => (
      <FeatureItem $free={plan.id === 'free'}>
        {feature.icon}
        <span>{feature.text}</span>
      </FeatureItem>
    ))}
  </FeatureList>

  {/* Subscribe Button */}
  <Button
    $selected={isCurrent}
    $free={plan.id === 'free'}
    onClick={() => handleSubscribe(plan)}
    disabled={loading || isCurrent || plan.id === 'free'}
  >
    {isCurrent ? (
      <>✓ Текущ план / Current Plan</>
    ) : plan.id === 'free' ? (
      <>👁️ Започнете безплатно / Start Free</>
    ) : loading ? (
      <>⚡ Зареждане... / Loading...</>
    ) : (
      <>👁️ Избери план / Select Plan →</>
    )}
  </Button>

  {/* Money Back Guarantee (للخطط المدفوعة فقط) */}
  {plan.id !== 'free' && (
    <MoneyBackGuarantee>
      <Shield /> 30-дневна гаранция за връщане на пари
    </MoneyBackGuarantee>
  )}
</Card>
```

###### **الخطط الثلاث:**

**1. Free Plan (Безплатен)**
- **السعر**: 0 EUR (Безплатно / Free)
- **الحد الأقصى للإعلانات**: 3 обяви/месец
- **الخصائص**:
  - 3 обяви/месец
  - Чат с купувачи (Chat with buyers)
- **الزر**: "Започнете безплатно" (معطل - لا يمكن الاشتراك)
- **المحاذاة**: النص في الوسط (`$free={true}`)

**2. Dealer Plan (Професионален Търговец)**
- **السعر**: 
  - Monthly: €27.78 (€27.7**8** - الرقم الأخير كبير)
  - Annual: €278 (توفير 33%)
- **الحد الأقصى للإعلانات**: 30 обяви/месец
- **الخصائص**:
  - 30 обяви/месец
  - Групово качване (Bulk upload)
  - Отличена обява (Featured badge)
  - Основни анализи (Basic analytics)
  - Кампании и имейл (Campaigns & email)
  - Приоритетна поддръжка (Priority support)
  - Консултации (Consultations)
  - Чат с купувачи (Chat with buyers)
- **الزر**: "Избери план" → يفتح Stripe Checkout
- **الشارة**: "Най-популярен" (Most Popular) + ⭐⭐⭐⭐⭐

**3. Company Plan (Корпоративен)**
- **السعر**:
  - Monthly: €137.88 (€137.8**8** - الرقم الأخير كبير)
  - Annual: €1288 (توفير 33%)
- **الحد الأقصى للإعلانات**: Неограничени обяви (Unlimited)
- **الخصائص**:
  - Неограничени обяви (Unlimited listings)
  - Групово качване (Bulk upload)
  - Отличена обява (Featured badge)
  - Основни анализи (Basic analytics)
  - Разширени анализи (Advanced analytics)
  - API достъп (API access)
  - Webhooks
  - Кампании и имейл (Campaigns & email)
  - Приоритетна поддръжка (Priority support)
  - Консултации (Consultations)
  - Чат с купувачи (Chat with buyers)
- **الزر**: "Избери план" → يفتح Stripe Checkout

---

### **4. Comparison Table Section** (جدول المقارنة)

#### **المكونات:**
- `ComparisonSection`: قسم المقارنة
- `ComparisonTable`: الجدول
- `TableHeader`: رأس الجدول
  - Функция (Feature)
  - Безплатен (Free)
  - Търговец (Dealer)
  - Компания (Company)
- `TableRow`: صف الميزة
- `FeatureCell`: خلية الميزة (مع أيقونة)
- `ValueCell`: خلية القيمة (✓ أو نص)

#### **الميزات المقارنة:**
1. Брой обяви месечно (Monthly listings): 3 / 30 / Неограничено
2. Анализи (Analytics): — / Основни / Разширени
3. Групово качване (Bulk upload): — / ✓ / ✓
4. Отличаване/Badge (Featured badge): — / ✓ / ✓
5. Управление на екип (Team management): 0 / 3 / 10
6. API достъп (API access): — / — / ✓
7. Приоритетна поддръжка (Priority support): — / ✓ / ✓
8. Маркетинг кампании (Marketing campaigns): — / 5 / Неограничено

#### **التأثيرات:**
- خلفية شفافة مع `backdrop-filter: blur(20px)`
- صفوف متناوبة مع خلفية شفافة
- تأثيرات hover دخانية

---

### **5. Testimonials Section** (قسم الشهادات)

#### **المكونات:**
- `TestimonialsSection`: قسم الشهادات
- `TestimonialsGrid`: شبكة الشهادات (3 أعمدة)
- `TestimonialCard`: بطاقة شهادة واحدة
- `QuoteIcon`: أيقونة الاقتباس
- `Stars`: النجوم (⭐⭐⭐⭐⭐)
- `TestimonialText`: نص الشهادة
- `TestimonialAuthor`: معلومات المؤلف
  - `AuthorAvatar`: الصورة الرمزية (ИП, МГ, СН)
  - `AuthorInfo`: الاسم والمنصب

#### **الشهادات:**
1. **Иван Петров** - Автокъща София
   - "С Dealer плана продажбите ни се увеличиха с 40%..."
2. **Мария Георгиева** - Частен продавач
   - "Безплатният план ми позволи да продам колата си за 2 дни..."
3. **Стоян Николов** - Fleet Manager
   - "Company планът е идеален за нашия fleet..."

#### **التأثيرات:**
- خلفية شفافة دخانية
- تأثيرات hover مع glow

---

### **6. FAQ Section** (قسم الأسئلة الشائعة)

#### **المكونات:**
- `FAQSection`: قسم FAQ
- `FAQList`: قائمة الأسئلة
- `FAQItem`: عنصر سؤال واحد
- `FAQQuestion`: السؤال (زر قابل للنقر)
- `FAQAnswer`: الإجابة (قابلة للطي)

#### **الأسئلة:**
1. Какво включва безплатният план؟
2. Как работят AI функциите؟
3. Мога ли да сменя плана си по всяко време؟
4. Какво означава "неограничени AI функции"؟
5. Има ли скрити такси؟

#### **السلوك:**
- النقر على السؤال يفتح/يغلق الإجابة
- أيقونة ChevronDown تدور عند الفتح
- انتقال سلس مع `max-height` animation

---

### **7. CTA Section** (قسم الدعوة للإجراء)

#### **المكونات:**
- `CTASection`: قسم CTA
- `CTAContent`: محتوى CTA
- `CTATitle`: العنوان (Target icon)
- `CTAText`: النص
- `CTAButton`: الزر "Изберете план сега"

#### **السلوك:**
- النقر على الزر ينتقل للأعلى (scroll to top)
- خلفية متدرجة دخانية
- تأثيرات hover مع glow

---

## 🔧 **الدوال والوظائف الرئيسية**

### **1. handleSubscribe(plan: Plan)**
```typescript
const handleSubscribe = async (plan: Plan) => {
  // 1. التحقق من تسجيل الدخول
  if (!currentUser) {
    alert('Моля, влезте в профила си');
    return;
  }

  // 2. منع الاشتراك في الخطة المجانية
  if (plan.id === 'free') {
    alert('Това е безплатният план');
    return;
  }

  // 3. إنشاء جلسة الدفع
  setLoading(true);
  const { url } = await billingService.createCheckoutSession(
    currentUser.uid,
    plan.id,
    interval
  );

  // 4. التوجيه إلى Stripe Checkout
  window.location.href = url;
}
```

**المسار الكامل:**
1. المستخدم ينقر على "Избери план"
2. يتم التحقق من تسجيل الدخول
3. يتم استدعاء `billingService.createCheckoutSession()`
4. يتم الحصول على URL من Stripe
5. يتم التوجيه إلى صفحة الدفع

---

### **2. getFeaturesList(plan: Plan)**
```typescript
const getFeaturesList = (plan: Plan) => {
  const items = [];

  // 1. إضافة حد الإعلانات
  const cap = plan.listingCap === -1
    ? 'Неограничени обяви'
    : `${plan.listingCap} обяви/месец`;
  items.push({ icon: <Car />, text: cap });

  // 2. إضافة الميزات من plan.features
  plan.features.forEach((key) => {
    const label = featureLabels[key];
    if (label) {
      items.push({ icon: label.icon, text: label.bg });
    }
  });

  // 3. إضافة "Чат с купувачи" دائماً
  items.push({ 
    icon: <MessageSquare />, 
    text: 'Чат с купувачи' 
  });

  return items;
}
```

---

### **3. getOriginalPrice(planId, interval)**
```typescript
const getOriginalPrice = (planId: string, interval: BillingInterval) => {
  if (planId === 'free' || interval === 'monthly') return null;

  // حساب السعر الأصلي (monthly * 12)
  if (planId === 'dealer') {
    const monthlyPrice = 27.78;
    const annualEquivalent = monthlyPrice * 12; // 333.36
    return `€${annualEquivalent.toFixed(2)}`;
  }
  
  if (planId === 'company') {
    const monthlyPrice = 137.88;
    const annualEquivalent = monthlyPrice * 12; // 1654.56
    return `€${annualEquivalent.toFixed(2)}`;
  }
}
```

**الاستخدام**: يعرض السعر الأصلي (بدون خصم) عند اختيار Annual

---

### **4. Auto-scroll Function**
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    const el = viewportRef.current;
    if (el) {
      const firstCard = el.querySelector('[data-plan-card]');
      if (firstCard) {
        firstCard.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest', 
          inline: 'center' 
        });
      }
    }
  }, 500);

  return () => clearTimeout(timer);
}, []);
```

**السلوك**: عند فتح الصفحة، يتم التمرير تلقائياً للبطاقات بعد 500ms

---

## 🎨 **التأثيرات والأنيميشن**

### **1. Hero Header Images**
- **Animation**: `imageTransition` (15s infinite)
- **Delays**: 0s, 5s, 10s
- **Effects**: 
  - `blur(18px)` + `brightness(0.5)`
  - `smokeFloat` animation
  - `radial-gradient` overlays

### **2. Price Display**
- **Euro amount**: صغير (1.5rem)
- **Cents amount**: متوسط (3.8rem)
- **Last digit**: كبير جداً (4.5rem) مع:
  - `pulse` animation
  - `text-shadow` glow
  - gradient colors

### **3. Cards**
- **Shimmer effect**: للبطاقة الشائعة
- **Background images**: شفافة (opacity: 0.15)
  - `private.png` للخطة المجانية
  - `dealer.png` لخطة Dealer
  - `company.png` لخطة Company
- **Light thread**: `box-shadow` مع `inset` و `outset`

### **4. Icons & Elements**
- **Drop shadow**: `drop-shadow(0 0 8px rgba(255, 143, 16, 0.4))`
- **Blur effect**: `blur(0.5px)`
- **Opacity**: 0.85 → 1 (عند hover)

---

## 📊 **حالة المكون (State)**

### **SubscriptionManager Component State:**
```typescript
const [loading, setLoading] = useState(false);
const [interval, setInterval] = useState<BillingInterval>('monthly');
const [currentPlan, setCurrentPlan] = useState<string | null>(null);
const [canScrollLeft, setCanScrollLeft] = useState(false);
const [canScrollRight, setCanScrollRight] = useState(false);
const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
```

### **SubscriptionPage Component State:**
```typescript
const [openFAQ, setOpenFAQ] = useState<number | null>(null);
const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
```

---

## 🔗 **الخدمات والتبعيات**

### **1. billingService**
- **الملف**: `src/features/billing/BillingService.ts`
- **الوظائف**:
  - `getAvailablePlans()`: الحصول على الخطط المتاحة
  - `createCheckoutSession(userId, planId, interval)`: إنشاء جلسة الدفع

### **2. subscriptionService**
- **الملف**: `src/services/billing/subscription-service.ts`
- **الوظائف**:
  - `createCheckoutSession(params)`: إنشاء جلسة Stripe Checkout
  - `getSubscriptionStatus(userId)`: الحصول على حالة الاشتراك

### **3. useAuth**
- **الملف**: `src/contexts/AuthProvider.tsx`
- **الوظيفة**: الحصول على `currentUser`

### **4. useLanguage**
- **الملف**: `src/contexts/LanguageContext.tsx`
- **الوظيفة**: الحصول على `language` و `t` (translation function)

---

## 🎯 **الأزرار والتفاعلات**

### **1. زر "Избери план" (Select Plan)**
- **الحالة**: `disabled={loading || isCurrent || plan.id === 'free'}`
- **السلوك**: 
  - إذا كان المستخدم غير مسجل: `alert` + redirect to login
  - إذا كانت الخطة مجانية: `alert` فقط
  - إذا كانت الخطة الحالية: يعرض "Текущ план"
  - خلاف ذلك: يفتح Stripe Checkout

### **2. زر "Започнете безплатно" (Start Free)**
- **الحالة**: `disabled={true}` (دائماً معطل)
- **السلوك**: لا شيء (فقط للعرض)

### **3. Interval Toggle Buttons**
- **Monthly**: `onClick={() => setInterval('monthly')}`
- **Annual**: `onClick={() => setInterval('annual')}`
- **السلوك**: يغير السعر والخصائص المعروضة

### **4. Carousel Navigation Arrows**
- **Left Arrow**: `onClick={() => scrollByOneCard('left')}`
- **Right Arrow**: `onClick={() => scrollByOneCard('right')}`
- **السلوك**: يمرر البطاقات أفقياً

### **5. FAQ Question Buttons**
- **السلوك**: `onClick={() => setOpenFAQ(openFAQ === index ? null : index)}`
- **النتيجة**: يفتح/يغلق الإجابة

### **6. CTA Button**
- **السلوك**: `onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}`
- **النتيجة**: ينتقل للأعلى

---

## 📱 **التجاوب (Responsive)**

### **Desktop (> 1024px)**
- عرض 3 بطاقات جنباً إلى جنب
- لا يوجد carousel
- FAQ مفتوح/مغلق

### **Tablet (768px - 1024px)**
- عرض 2 بطاقة
- carousel مع أسهم
- FAQ قابل للطي

### **Mobile (< 768px)**
- عرض بطاقة واحدة
- carousel أفقي مع تمرير
- tap-to-expand للبطاقات
- FAQ قابل للطي

---

## 🎨 **الألوان والثيم**

### **Primary Colors:**
- `var(--accent-primary)`: #FF8F10 (برتقالي)
- `var(--accent-secondary)`: #FFD700 (ذهبي)
- `var(--text-primary)`: النص الأساسي
- `var(--text-secondary)`: النص الثانوي

### **Plan Colors:**
- **Free**: `linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)` (رمادي)
- **Dealer**: `linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)` (برتقالي-ذهبي)
- **Company**: `linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)` (أزرق)

---

## 🔐 **الأمان والتحقق**

### **1. تسجيل الدخول**
- يتم التحقق من `currentUser` قبل الاشتراك
- إذا لم يكن مسجلاً: redirect to `/login`

### **2. الخطة المجانية**
- لا يمكن الاشتراك فيها (زر معطل)
- فقط للعرض

### **3. Stripe Checkout**
- يتم إنشاء جلسة آمنة
- التوجيه إلى Stripe للدفع
- بعد الدفع: redirect to `/billing/success`

---

## 📝 **ملاحظات مهمة**

1. **المحاذاة في البطاقة المجانية**: النص "3 обяви/месец" و "Чат с купувачи" في الوسط (`$free={true}`)

2. **تأثير السعر**: الرقم الأخير من السنتات كبير جداً (4.5rem) مع تأثير `pulse`

3. **الصور الخلفية**: تتغير كل 5 ثوانٍ في Hero Header مع تأثيرات ضبابية ودخانية

4. **Auto-scroll**: عند فتح الصفحة، يتم التمرير تلقائياً للبطاقات بعد 500ms

5. **الخطة الشائعة**: Dealer Plan لديها شارة "Най-популярен" + ⭐⭐⭐⭐⭐

6. **التوفير**: عند اختيار Annual، يتم عرض السعر الأصلي (monthly * 12) مع خط

---

## 🚀 **خطوات التطوير المستقبلية**

1. إضافة المزيد من التأثيرات البصرية
2. تحسين تجربة المستخدم على الجوال
3. إضافة المزيد من الشهادات
4. تحسين أداء الصور الخلفية
5. إضافة تحليلات (analytics) للنقرات

---

**آخر تحديث**: 2026-01-07
**الإصدار**: 1.0.0
