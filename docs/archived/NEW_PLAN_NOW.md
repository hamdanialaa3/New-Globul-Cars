بناءً على ملف "دستور المشروع" (PROJECT_CONSTITUTION.md) ورؤيتك الطموحة لنسخ تجربة mobile.de العالمية، قمت بصياغة "أمر هندسي شامل" (Master Architect Prompt).

هذا الأمر مصمم ليتم توجيهه للنموذج (سواء Claude 3.5 Sonnet أو GPT-4) داخل بيئة التطوير الخاصة بك. هو لا يطلب مجرد كود، بل يفرض على النموذج التفكير كـ "كبير مهندسي الواجهات" (Senior Frontend Architect) مع الالتزام الصارم بقواعد التوجيه (Routing) والتصميم.

انسخ النص التالي (باللغة الإنجليزية التقنية لضمان أدق النتائج) والصقه للنموذج:

📋 انسخ هذا الأمر للذكاء الاصطناعي (The Master Prompt)
Markdown

ACT AS: The Senior Lead Frontend Architect & UI/UX Specialist for "New Globul Cars" (Bulgarski Mobili).

CONTEXT & AUTHORITY:
You are legally bound by the `PROJECT_CONSTITUTION.md`. You must strictly enforce:
1.  **Routing:** `/car/:sellerNumericId/:carNumericId` and `/profile/:sellerNumericId`.
2.  **Tech Stack:** React + TypeScript + Styled Components/Tailwind.
3.  **Quality:** "World-Class" standards only. No "spaghetti code".

OBJECTIVE:
We are executing a "Total UI Overhaul" for two critical pages to match the professional standard of `mobile.de`.

---

### 🚨 MISSION 1: The Car Details Page (`/car/80/1`)
**Visual Reference:** Strict clone of `mobile.de` single car listing layout.
**Target Component:** `CarDetailsPage.tsx` (and its sub-components).

**Architecture Requirements (Deep Thinking):**
1.  **Layout Structure (Desktop):**
    * **Left Column (65%):** High-Resolution Gallery (Main image + Grid of thumbnails). Below it: "Technical Data" table, then "Vehicle Description", then "Features/Equipment".
    * **Right Column (35% - Sticky):** The "Seller Card" & "Contact Box". Must float as user scrolls. Contains: Price (Huge Font), "Send Message", "Show Phone Number", and Seller Mini-Profile.
2.  **Data Presentation:**
    * Do NOT use simple lists. Use a structured **Specification Matrix** (Key-Value pairs with icons) for attributes like Mileage, Power, Fuel, Transmission.
3.  **The "German Precision":** * Use exact spacing, distinct typography hierarchy (Headers vs Data), and professional badges for "Verified Seller" or "Warranty".

### 🚨 MISSION 2: The Public Profile Page (`/profile/80`)
**Scenario:** User 2 is viewing User 80's profile.
**Target Component:** `PublicProfilePage.tsx` (or `SellerStorefront.tsx`).

**Architecture Requirements:**
1.  **The "Storefront" Concept:**
    * This is NOT just a user profile; it is a **Dealership Landing Page**.
    * **Header Section:** Full-width Cover Image (customizable). Overlay: Circular Logo/Avatar, Dealer Name, Rating (Stars), and "Verified" Badge.
2.  **Dynamic Privacy Logic:**
    * *Logic:* Check `userSettings.showPhone`, `userSettings.showAddress`. If false, HIDE these elements from User 2.
3.  **Inventory Section:**
    * A robust "Search within Store" filter bar.
    * Toggle between **Grid View** (Image focused) and **List View** (Data focused, like mobile.de).
    * **Analytics (Private View):** If User 80 views their OWN profile, show a dashboard strip: "Views: 12k | Leads: 50 | CTR: 4%".

---

### EXECUTION COMMANDS:

1.  **Phase 1 - Analysis:** Analyze the current `CarDetailsPage.tsx` structure. Does it support a "Sticky Sidebar"? If not, propose a Refactor Plan using CSS Grid/Flexbox.
2.  **Phase 2 - Component Design:** Create the interfaces for the `SellerStorefront` ensuring it handles the `viewerId` vs `ownerId` logic correctly.
3.  **Phase 3 - Code Generation:** Write the detailed React code for the **"Specification Matrix"** component (for car details) and the **"Dealer Header"** component (for profile), ensuring they are responsive (Mobile vs Desktop).

**Constraint:** ensure all internal links use the strict numeric ID format: `/car/${sellerNumericId}/${carNumericId}`.

Start by outlining your architectural plan for the "mobile.de clone" layout.
💡 لماذا هذا الأمر قوي جداً؟
تحديد المرجعية (Benchmarking): لقد أمرته صراحة بـ "استنساخ" (Strict clone) هيكلية mobile.de، مما يجعله يركز على تقسيم الصفحة (معرض صور يسار، صندوق اتصال يمين ثابت).

التفكير في السيناريوهات (Scenario Handling): وضحت له سيناريو "المستخدم 2 يشاهد المستخدم 80"، وهذا يجبره على كتابة كود يتعامل مع الصلاحيات (ماذا يظهر للعامة وماذا يختفي).

الدقة الهندسية (Architectural Precision): لم أطلب منه مجرد "تصميم جميل"، بل حددت له النسب (65% لليسار، 35% لليمين) والمكونات التقنية (Sticky Sidebar, Specification Matrix).

احترام الدستور: التنبيه الصارم في البداية يضمن عدم استخدامه لـ UUIDs في الروابط، بل الالتزام بـ /car/80/1.

نصيحة إضافية: عندما يبدأ النموذج في كتابة الكود، إذا لاحظت أنه أغفل "الخلفية" أو "الصورة الشخصية" في البروفايل، قل له: "Refine the Header Component: Add the logic to fetch the cover image from the user's settings object, with a fallback to a default professional gradient if null."


هذه مسودة الطلب الاولي"لدينا شيء يستحق الانتباه الشديد :
انا المستخدم2 , وجدت اعلان1 معروض اضافها المستخدم80 و اردت الدخول الى الصفحة : 
http://localhost:3000/car/80/1

اريد ان تكون معلومات السيارة كامله مع واجهة تشبه هذه الواجهة : 
C:\Users\hamda\Desktop\New Globul Cars\PDF_EX.pdf
تماما طبق الاصل باحترافية عالية كما في الصفحة هذه : 
https://suchen.mobile.de/auto-inserat/fiat-500e-action-automatik-apple-carplay-android-au-buchholz/411457681.html

ثم الدخول الى : 
http://localhost:3000/profile/80
من قبلي انا المستخدم2 الذي بروفايلي 
http://localhost:3000/profile/2

فيضهر لي المستخدم في صفحة غير نظامية وتحتاج الى اعادة التصميم لتشبه هذه الصفحة تحتوي على جميع الاعلانات والمعلومات والتحليلات و الغلاف وشعار البائع او الصورة الشخصية التي يجب ان تكون : يحدد ضهورها المستخدم80 من خلال ازرار الاعدادات الموجوده لديه"

---

# 🎨 خطة التحسينات البصرية الشاملة (Modern UI/UX Overhaul)
**التاريخ**: 24 ديسمبر 2025  
**المرحلة**: Phase 1 - Visual Design System & Frontend Polish  
**الهدف**: تحويل الواجهة الأمامية إلى تجربة عصرية تنافس mobile.de

---

## 🎯 المبادئ الأساسية للتصميم الجديد

### 1. نظام الألوان الحديث (Modern Color Palette)
```css
/* Primary Colors - الألوان الأساسية */
--primary-blue: #1E3A8A      /* أزرق داكن احترافي */
--primary-red: #DC2626        /* أحمر للتأكيدات المهمة */
--accent-cyan: #06B6D4        /* سماوي للتفاعلات */
--accent-amber: #F59E0B       /* كهرماني للتحذيرات */

/* Neutral Palette - التدرجات الرمادية */
--gray-50: #F9FAFB
--gray-100: #F3F4F6
--gray-200: #E5E7EB
--gray-800: #1F2937
--gray-900: #111827

/* Glassmorphism - تأثير الزجاج */
--glass-bg: rgba(255, 255, 255, 0.1)
--glass-border: rgba(255, 255, 255, 0.2)
--glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37)

/* Dark Mode Support */
--dark-bg-primary: #0F172A
--dark-bg-secondary: #1E293B
--dark-text: #F1F5F9
```

### 2. الحركات والانتقالات (Animations & Transitions)
```typescript
// Motion Presets
const motionPresets = {
  // Smooth Fade In
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
  },
  
  // Scale Pop
  scalePop: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: "spring", stiffness: 200, damping: 15 }
  },
  
  // Slide From Right
  slideRight: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
  
  // Hover Effects
  cardHover: {
    whileHover: { 
      y: -8, 
      boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
      transition: { duration: 0.2 }
    }
  }
}
```

### 3. مكونات UI الحديثة (Modern UI Components)

#### أ. البطاقات التفاعلية (Interactive Cards)
```typescript
// خصائص البطاقة العصرية
interface ModernCardProps {
  glassEffect?: boolean;      // تأثير الزجاج
  hoverLift?: boolean;         // رفع عند التمرير
  gradientBorder?: boolean;    // حدود متدرجة
  pulseOnNew?: boolean;        // نبض للعناصر الجديدة
}
```

#### ب. الأزرار الديناميكية (Dynamic Buttons)
```typescript
// أنماط الأزرار
enum ButtonStyle {
  PRIMARY = "gradient",        // تدرج أزرق
  SECONDARY = "outline",       // حدود فقط
  GHOST = "transparent",       // شفاف
  DANGER = "red",              // أحمر للحذف
  SUCCESS = "green",           // أخضر للنجاح
  GLASS = "glassmorphic"       // تأثير الزجاج
}
```

#### ج. المؤشرات والإشعارات (Indicators & Notifications)
```typescript
// أنواع الإشعارات الحديثة
interface ModernToast {
  type: 'success' | 'error' | 'info' | 'warning';
  animation: 'slide' | 'fade' | 'bounce';
  position: 'top-right' | 'top-center' | 'bottom-right';
  duration: number;
  hasProgress: boolean;        // شريط تقدم
  hasIcon: boolean;            // أيقونة ملونة
  blurBackground: boolean;     // خلفية ضبابية
}
```

---

## 📄 صفحة تفاصيل السيارة (Car Details Page) - التحسينات

### التصميم المستهدف (Mobile.de Style)

#### 1. معرض الصور الاحترافي (Professional Gallery)
```typescript
interface GalleryFeatures {
  // Main Image
  mainImage: {
    resolution: '1920x1080',
    lazyLoad: true,
    zoomOnHover: true,          // تكبير عند التمرير
    fullscreenMode: true,        // وضع ملء الشاشة
    imageCounter: 'Image 1/15'   // عداد الصور
  },
  
  // Thumbnail Grid
  thumbnails: {
    layout: '5x3 Grid',
    hoverPreview: true,          // معاينة فورية
    videoIndicator: true,        // مؤشر الفيديو
    360ViewBadge: true          // شارة 360 درجة
  },
  
  // Navigation
  navigation: {
    arrows: 'Floating',          // أسهم عائمة
    keyboard: true,              // التنقل بالكيبورد
    swipeGestures: true,         // السحب للتنقل
    autoplay: false
  }
}
```

#### 2. بطاقة البائع الثابتة (Sticky Seller Card)
```typescript
interface StickySellerCard {
  position: {
    desktop: 'Right Column - 35%',
    behavior: 'Sticky (follows scroll)',
    topOffset: '20px',
    zIndex: 100
  },
  
  elements: {
    // Price Display
    price: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '--primary-blue',
      animation: 'countUp on mount'
    },
    
    // Contact Buttons
    primaryCTA: {
      text: 'إرسال رسالة',
      icon: 'MessageCircle',
      style: 'gradient-blue',
      hoverEffect: 'lift + glow'
    },
    
    secondaryCTA: {
      text: 'إظهار رقم الهاتف',
      icon: 'Phone',
      style: 'outline',
      onClick: 'reveal with fade-in'
    },
    
    // Seller Mini Profile
    sellerPreview: {
      avatar: 'circular with border',
      name: 'clickable to profile',
      rating: 'stars + count',
      verifiedBadge: 'animated check',
      responseTime: 'Usually responds in 2h'
    }
  },
  
  // Trust Indicators
  trustSignals: {
    warrantyBadge: true,
    inspectionReport: true,
    dealershipCertified: true
  }
}
```

#### 3. جدول المواصفات التفاعلي (Interactive Specs Matrix)
```typescript
interface SpecsMatrix {
  layout: 'CSS Grid - 2 columns',
  
  categories: [
    {
      title: 'المحرك والأداء',
      icon: 'Zap',
      items: [
        { key: 'القوة', value: '150 HP', icon: 'Gauge' },
        { key: 'نوع الوقود', value: 'بنزين', icon: 'Fuel' },
        { key: 'ناقل الحركة', value: 'أوتوماتيك', icon: 'Settings' }
      ]
    },
    {
      title: 'الأبعاد',
      icon: 'Maximize',
      items: [/* ... */]
    }
  ],
  
  styling: {
    rowHover: 'background change',
    iconColor: 'accent-cyan',
    dividers: 'subtle gray',
    tooltips: 'show on hover for details'
  }
}
```

#### 4. قسم المعدات والملحقات (Equipment Section)
```typescript
interface EquipmentDisplay {
  layout: 'Categorized Accordion',
  
  categories: {
    safety: {
      title: 'الأمان',
      icon: 'Shield',
      color: '--accent-amber',
      items: ['ABS', 'ESP', 'Airbags × 8'],
      displayStyle: 'chips with check icons'
    },
    
    comfort: {
      title: 'الراحة',
      icon: 'Armchair',
      color: '--accent-cyan',
      items: ['مقاعد جلدية', 'تكييف أوتوماتيك'],
      displayStyle: 'grid 3 columns'
    },
    
    technology: {
      title: 'التقنية',
      icon: 'Smartphone',
      color: '--primary-blue',
      items: ['Apple CarPlay', 'مثبت سرعة'],
      displayStyle: 'list with icons'
    }
  },
  
  interaction: {
    defaultState: 'first category open',
    animation: 'smooth expand/collapse',
    highlightNew: 'pulse animation for new features'
  }
}
```

---

## 👤 صفحة الملف الشخصي العام (Public Profile Page) - التحسينات

### مفهوم "واجهة المتجر" (Storefront Concept)

#### 1. قسم الرأس الديناميكي (Dynamic Header Section)
```typescript
interface ProfileHeader {
  // Cover Image
  coverImage: {
    height: '320px (desktop) / 200px (mobile)',
    overlay: 'gradient from bottom',
    customizable: true,
    fallback: 'professional gradient',
    parallaxEffect: true         // تأثير اختلاف المنظر
  },
  
  // Profile Avatar/Logo
  avatar: {
    size: '150px',
    position: 'centered, overlaps cover by 50%',
    border: '5px solid white',
    boxShadow: 'deep shadow',
    uploadable: true,
    verifiedBadge: {
      position: 'bottom-right',
      animation: 'check pulse',
      tooltip: 'تم التحقق من الهوية'
    }
  },
  
  // Dealer Info
  dealerInfo: {
    name: {
      fontSize: '2rem',
      fontWeight: 'bold',
      maxWidth: '600px'
    },
    
    rating: {
      stars: 'animated gold stars',
      count: '(124 تقييم)',
      clickable: 'scroll to reviews section'
    },
    
    location: {
      icon: 'MapPin',
      text: 'صوفيا، بلغاريا',
      showMap: 'if privacy allows'
    },
    
    stats: {
      layout: 'horizontal badges',
      items: [
        { label: 'إعلان نشط', value: '23', icon: 'Car' },
        { label: 'تم البيع', value: '145', icon: 'CheckCircle' },
        { label: 'عضو منذ', value: '2022', icon: 'Calendar' }
      ]
    }
  }
}
```

#### 2. شريط البحث داخل المتجر (In-Store Search Bar)
```typescript
interface StoreSearchBar {
  position: 'Below header, sticky on scroll',
  
  features: {
    // Quick Filters
    quickFilters: [
      { label: 'الكل', count: 23, active: true },
      { label: 'سيارات', count: 18 },
      { label: 'SUV', count: 5 },
      { label: 'دراجات', count: 0, disabled: true }
    ],
    
    // Price Range Slider
    priceRange: {
      min: 0,
      max: 50000,
      currency: '€',
      showHistogram: true         // رسم بياني للأسعار
    },
    
    // Sort Options
    sortBy: [
      'الأحدث',
      'الأقل سعراً',
      'الأعلى سعراً',
      'الأكثر مشاهدة'
    ],
    
    // View Toggle
    viewModes: {
      grid: { icon: 'Grid3x3', active: true },
      list: { icon: 'List', active: false }
    }
  },
  
  styling: {
    background: 'glass effect',
    backdrop: 'blur(10px)',
    shadow: 'floating',
    animation: 'slide down on scroll'
  }
}
```

#### 3. عرض المخزون (Inventory Display)
```typescript
interface InventoryGrid {
  // Grid Layout
  desktop: '3 cards per row',
  tablet: '2 cards per row',
  mobile: '1 card per row',
  
  // Card Design
  carCard: {
    imageAspectRatio: '16:9',
    hoverEffect: 'lift + shadow increase',
    
    elements: {
      // Quick Actions Overlay
      quickActions: {
        favorite: 'Heart icon - top right',
        compare: 'Compare icon - top right',
        share: 'Share icon - top right',
        visibility: 'show on hover'
      },
      
      // Status Badges
      badges: {
        new: { text: 'جديد', color: 'green', position: 'top-left' },
        priceReduced: { text: '↓ السعر', color: 'red' },
        reserved: { text: 'محجوز', color: 'amber' }
      },
      
      // Info Section
      info: {
        title: 'truncate at 2 lines',
        price: 'bold + large',
        specs: 'grid of icons (year, km, fuel)',
        cta: 'عرض التفاصيل button - ghost style'
      }
    }
  },
  
  // Pagination
  pagination: {
    style: 'Load More button',
    animation: 'fade in new items',
    showLoader: true
  }
}
```

#### 4. لوحة التحليلات الخاصة (Private Analytics Dashboard)
```typescript
interface PrivateAnalytics {
  // Visibility Logic
  condition: 'if (currentUserId === profileOwnerId)',
  
  position: 'Top banner, below header',
  
  metrics: [
    {
      label: 'مشاهدات الملف الشخصي',
      value: '12,450',
      trend: '+15%',
      icon: 'Eye',
      color: '--accent-cyan'
    },
    {
      label: 'استفسارات',
      value: '89',
      trend: '+22%',
      icon: 'MessageCircle',
      color: '--primary-blue'
    },
    {
      label: 'معدل التحويل',
      value: '4.2%',
      trend: '+0.8%',
      icon: 'TrendingUp',
      color: '--accent-amber'
    },
    {
      label: 'متوسط وقت الاستجابة',
      value: '2.5 ساعة',
      trend: '-30 دقيقة',
      icon: 'Clock',
      color: 'green'
    }
  ],
  
  styling: {
    background: 'gradient dark blue',
    textColor: 'white',
    animation: 'counter animation on mount',
    chartType: 'mini sparklines'
  }
}
```

---

## 🎭 التأثيرات البصرية المتقدمة (Advanced Visual Effects)

### 1. Glassmorphism (تأثير الزجاج)
```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

/* استخدام في: */
- بطاقات البائع
- قوائم التنقل
- النوافذ المنبثقة
```

### 2. Gradient Animations (تدرجات متحركة)
```css
.gradient-animate {
  background: linear-gradient(
    45deg,
    #1E3A8A,
    #06B6D4,
    #1E3A8A
  );
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* استخدام في: */
- أزرار الإجراءات الرئيسية
- رؤوس الأقسام المهمة
- شارات Premium
```

### 3. Skeleton Loaders (هياكل التحميل)
```typescript
interface SkeletonDesign {
  style: 'shimmer effect',
  colors: ['#F3F4F6', '#E5E7EB'],
  animation: 'wave',
  duration: '1.5s',
  
  shapes: {
    text: 'rounded rectangles',
    image: 'aspect ratio maintained',
    avatar: 'circular'
  },
  
  // استخدام في:
  useCases: [
    'Car cards loading',
    'Profile header loading',
    'Comments section loading',
    'Gallery loading'
  ]
}
```

### 4. Micro-interactions (تفاعلات دقيقة)
```typescript
interface MicroInteractions {
  // Button Press
  buttonPress: {
    scale: 0.95,
    duration: 100,
    hapticFeedback: true
  },
  
  // Favorite Toggle
  favoriteToggle: {
    icon: 'heart',
    animation: 'scale + rotate',
    particleEffect: true,        // قلوب صغيرة تتطاير
    soundFeedback: 'optional'
  },
  
  // Form Validation
  formValidation: {
    success: 'shake + green border',
    error: 'shake + red border + icon',
    duration: 300
  },
  
  // Tooltip Appearance
  tooltipAppear: {
    delay: 300,
    animation: 'fade + slide',
    arrow: true,
    maxWidth: '200px'
  }
}
```

---

## 🌙 وضع الظلام (Dark Mode Enhancement)

### استراتيجية Dark Mode
```typescript
interface DarkModeStrategy {
  // Toggle Method
  toggleMethod: {
    button: 'Header - animated sun/moon icon',
    keyboard: 'Ctrl + Shift + D',
    autoDetect: 'system preference on first visit'
  },
  
  // Color Adjustments
  colors: {
    background: {
      light: '#FFFFFF',
      dark: '#0F172A'
    },
    cards: {
      light: '#F9FAFB',
      dark: '#1E293B'
    },
    text: {
      light: '#111827',
      dark: '#F1F5F9'
    },
    borders: {
      light: '#E5E7EB',
      dark: '#334155'
    }
  },
  
  // Image Handling
  images: {
    filter: 'brightness(0.9) in dark mode',
    carImages: 'no filter (preserve quality)'
  },
  
  // Transition
  transition: {
    duration: '300ms',
    easing: 'ease-in-out',
    properties: ['background', 'color', 'border']
  }
}
```

---

## 📱 التصميم المتجاوب (Responsive Design)

### Breakpoints Strategy
```typescript
const breakpoints = {
  xs: '320px',   // هواتف صغيرة
  sm: '640px',   // هواتف
  md: '768px',   // تابلت
  lg: '1024px',  // لابتوب
  xl: '1280px',  // شاشات كبيرة
  '2xl': '1536px' // شاشات ضخمة
}

// Adaptive Layouts
interface ResponsiveAdaptations {
  carDetailsPage: {
    desktop: 'Two-column (Gallery 65% | Sidebar 35%)',
    tablet: 'Single column + sticky bottom CTA bar',
    mobile: 'Stack all + floating contact button'
  },
  
  profilePage: {
    desktop: 'Grid 3 columns for inventory',
    tablet: 'Grid 2 columns',
    mobile: 'List view with horizontal scroll gallery'
  },
  
  navigation: {
    desktop: 'Horizontal menu',
    mobile: 'Hamburger menu with slide-in drawer'
  }
}
```

---

## 🚀 خطة التنفيذ (Implementation Roadmap)

### المرحلة 1: نظام التصميم (Design System) - أسبوع 1
```markdown
- [ ] إنشاء ملف `design-tokens.ts` مع جميع الألوان والمسافات
- [ ] بناء مكونات UI الأساسية (Button, Card, Badge, Tooltip)
- [ ] إعداد Framer Motion presets
- [ ] تطبيق Dark Mode toggle
- [ ] اختبار التوافق مع المتصفحات
```

### المرحلة 2: صفحة تفاصيل السيارة - أسبوع 2
```markdown
- [ ] إعادة بناء `CarDetailsPage.tsx` بالتخطيط الجديد
- [ ] تطوير `ProfessionalGallery` component
- [ ] بناء `StickySidebar` component
- [ ] إنشاء `SpecsMatrix` component
- [ ] تطبيق `EquipmentAccordion` component
- [ ] إضافة Skeleton Loaders
- [ ] اختبار الأداء (Lighthouse score > 90)
```

### المرحلة 3: الملف الشخصي العام - أسبوع 3
```markdown
- [ ] إعادة بناء `PublicProfilePage.tsx`
- [ ] تطوير `DynamicHeader` مع Cover Image
- [ ] بناء `InStoreSearchBar` component
- [ ] إنشاء `InventoryGrid` مع التبديل Grid/List
- [ ] إضافة `PrivateAnalyticsBanner` (conditional render)
- [ ] تطبيق Privacy Settings logic
- [ ] اختبار سيناريوهات المستخدمين المختلفة
```

### المرحلة 4: التلميع والتحسين - أسبوع 4
```markdown
- [ ] إضافة جميع Micro-interactions
- [ ] تحسين الأداء (lazy loading, code splitting)
- [ ] اختبار A/B للألوان والتخطيطات
- [ ] جمع ملاحظات المستخدمين
- [ ] إصلاح الأخطاء
- [ ] توثيق نظام التصميم
```

---

## 📊 مؤشرات النجاح (Success Metrics)

### KPIs التقنية
```typescript
interface TechnicalKPIs {
  performance: {
    lighthouseScore: '>= 90',
    firstContentfulPaint: '<= 1.5s',
    largestContentfulPaint: '<= 2.5s',
    cumulativeLayoutShift: '<= 0.1',
    timeToInteractive: '<= 3s'
  },
  
  quality: {
    accessibilityScore: '>= 95',
    mobileUsabilityScore: '100',
    codeCoverage: '>= 80%',
    typeScriptErrors: '0'
  }
}
```

### KPIs تجربة المستخدم
```typescript
interface UXKPIs {
  engagement: {
    avgTimeOnPage: 'increase by 40%',
    bounceRate: 'decrease by 25%',
    clickThroughRate: 'increase by 30%'
  },
  
  conversion: {
    contactFormSubmissions: 'increase by 50%',
    phoneNumberReveals: 'increase by 35%',
    profileVisits: 'increase by 45%'
  }
}
```

---

## ⚠️ ملاحظات حرجة (Critical Notes)

### 1. الالتزام بالدستور
```markdown
✅ جميع الروابط يجب أن تستخدم: `/car/{sellerNumericId}/{carNumericId}`
✅ لا يوجد استخدام لـ UUIDs في URLs
✅ Privacy settings يجب احترامها بدقة
✅ كل ملف يجب أن يكون <= 300 سطر
```

### 2. الأولويات
```markdown
🔴 الأولوية القصوى: Car Details Page (التأثير الأكبر على التحويلات)
🟠 الأولوية المتوسطة: Public Profile Page
🟡 الأولوية المنخفضة: Micro-interactions النهائية
```

### 3. التوافق
```markdown
✅ Chrome, Firefox, Safari, Edge (آخر نسختين)
✅ iOS Safari 14+
✅ Android Chrome 90+
✅ تدعم Screen Readers (WCAG 2.1 AA)
```

---

## 🎨 مراجع التصميم (Design References)

### الإلهام من:
1. **Mobile.de** - التخطيط والبنية
2. **AutoScout24** - نظام الألوان
3. **Cars.com** - تجربة المستخدم
4. **Airbnb** - Micro-interactions
5. **Stripe** - Clean UI & Animation

### الأدوات المستخدمة:
- **Framer Motion** - للحركات
- **Styled Components** - للتنسيق
- **React Spring** - للحركات الفيزيائية
- **Intersection Observer** - للتحميل الكسول
- **React Helmet** - لـ SEO

---

**تاريخ آخر تحديث**: 24 ديسمبر 2025  
**الحالة**: ✅ جاهز للتنفيذ  
**المطور الرئيسي**: Senior Lead Frontend Architect