# 📊 تحليل عميق لبروفايل المستخدم - وثيقة فنية شاملة

**تاريخ التحليل:** 16 ديسمبر 2025  
**الإصدار:** 1.0  
**الحالة:** جاهز للنقل الاحترافي  

---

## 🎯 المقدمة

هذه الوثيقة توثق **كل تفاصيل البروفايل الحالي بدون استثناء** من حيث:
- القيم الفعلية من الكود (ليس تخمينات)
- الألوان الحقيقية (Color codes)
- الأبعاد والمسافات بالـ Pixels/REM
- الـ Animations والـ Transitions
- الـ Responsive Design على جميع الأجهزة
- جميع الـ Edge Cases والشروط

---

## 📁 الملفات الرئيسية المتضمنة

```
src/pages/03_user-pages/profile/ProfilePage/
├── ProfilePageWrapper.tsx          [348 سطر] - الـ Layout الرئيسي
├── index.tsx                       [2129 سطر] - مكون البروفايل الرئيسي
├── styles.ts                       [1854 سطر] - جميع الـ Styled Components
├── TabNavigation.styles.ts         [784 سطر] - تصميم التبويبات
├── ProfileMyAds.tsx                [482 سطر] - تبويب إعلاناتي
├── ProfileCampaigns.tsx            [بسيط] - تبويب الحملات
├── ProfileAnalytics.tsx            [بسيط] - تبويب الإحصائيات
├── SettingsPage.tsx                [wrapper] - غلاف الإعدادات
├── hooks/
│   └── useProfile.ts               [تحويل numeric ID → Firebase UID]
└── tabs/
    ├── SettingsTab.tsx             [3115 سطر] - الإعدادات الشاملة
    ├── ProfileOverview.tsx         [معقد] - النظرة العامة
    └── ProfileConsultations.tsx    [wrapper] - الاستشارات
```

---

## 🎨 الألوان والمتغيرات (CSS Variables)

### 🔵 متغيرات الألوان الأساسية

تُستخدم من `src/styles/unified-theme.css`:

```css
/* Light Mode (Default) */
--bg-primary: #f4f4f4;              /* خلفية الصفحة الرئيسية */
--bg-card: #ffffff;                 /* خلفية الـ Cards */
--bg-secondary: #f8f9fa;            /* خلفية ثانوية */
--text-primary: #333333;            /* النص الأساسي */
--text-secondary: #666666;          /* النص الثانوي */
--text-tertiary: #999999;           /* النص الضعيف */
--accent-primary: #cc9d2c;          /* اللون الأساسي (ذهبي) */
--accent-secondary: #ff6b6b;        /* اللون الثانوي (أحمر) */
--border-primary: rgba(0, 0, 0, 0.1); /* حدود أساسية */
--border-secondary: rgba(0, 0, 0, 0.05); /* حدود ثانوية */

/* Shadows */
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.12);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.16);
--shadow-card: 0 2px 8px rgba(0, 0, 0, 0.08);

/* Dark Mode */
html[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-card: #1e293b;
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --border-primary: rgba(148, 163, 184, 0.15);
  --shadow-card: 0 4px 16px rgba(0, 0, 0, 0.3);
}
```

### 🎨 الألوان المستخدمة من Theme

من `src/styles/theme.ts`:

```typescript
bulgarianColors = {
  primary: {
    main: '#003366',         // أزرق داكن (الرؤوس)
    light: '#0066CC',        // أزرق فاتح (الروابط)
    dark: '#002244',         // أزرق أغمق
    contrastText: '#ffffff'  // نص أبيض
  },
  secondary: {
    main: '#CC0000',         // أحمر (الأزرار الرئيسية)
    light: '#FF3333',        // أحمر فاتح
    dark: '#990000',         // أحمر داكن
    contrastText: '#ffffff'
  },
  accent: {
    main: '#0066CC',         // أزرق للروابط
    light: '#3399FF',        // أزرق فاتح
    dark: '#004499',         // أزرق داكن
    contrastText: '#ffffff'
  },
  grey: {
    50: '#F8FAFC',   // الأفتح
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A'   // الأغمق
  }
}
```

---

## 📱 الحاوية الرئيسية (ProfilePageContainer)

### التحديدات الفنية:

```typescript
// المسار: src/pages/03_user-pages/profile/ProfilePage/styles.ts (سطر ~78)

ProfilePageContainer = styled.div`
  position: relative;
  padding-top: 2rem;              // 32px
  padding-bottom: 4rem;           // 64px
  background: var(--bg-primary);  // #f4f4f4 (Light) / #0f172a (Dark)
  color: var(--text-primary);
  animation: fadeIn 0.5s ease-out;
  max-width: 1200px;              // العرض الأقصى للـ Desktop
  width: 100%;
  margin: 0 auto;                 // توسيط أفقي
  overflow-x: hidden;
  
  /* Responsive Adjustments */
  @media (max-width: 768px) {
    padding-top: 0;               // إزالة الـ padding العلوي على الموبايل
    padding-bottom: 80px;         // مساحة للـ bottom navigation
    max-width: 100%;              // استخدام العرض الكامل
  }
  
  @media (max-width: 480px) {
    padding-bottom: 70px;         // تقليل المساحة على الموبايل الصغير
  }
`;
```

### الـ Animation:

```typescript
fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);  // تحريك من الأسفل قليلاً
  }
  to {
    opacity: 1;
    transform: translateY(0);     // وصول للموضع النهائي
  }
`;
// المدة: 0.5 ثانية
// Timing: ease-out (تحريك سلس)
```

---

## 📍 الـ Header (ProfileHeader)

### القطاع الأول: الصورة والغلاف

#### 🖼️ صورة الغلاف (Cover Image)

```typescript
// CoverImageUploader Component
// المسار في ProfilePageWrapper.tsx (حوالي سطر 230)

القيم:
- الارتفاع: 400px (Desktop) → 300px (Tablet) → 200px (Mobile)
- العرض: 100% (ملء العرض الكامل)
- تأثير Blur: backdrop-filter blur(10px)
- Overlay Color: rgba(0, 51, 102, 0.4) (أزرق شفاف)
- Border Radius: 0px (بدون زوايا مدورة)
- Position: relative (أعلى الصفحة)
- Z-index: 1
```

#### 👤 الصورة الشخصية (Profile Avatar)

```typescript
// المسار: src/pages/03_user-pages/profile/ProfilePage/styles.ts (سطر ~155)

ProfileImage = styled.img`
  width: 150px;                   // Desktop
  height: 150px;
  border-radius: 50%;             // شكل دائري
  border: 4px solid ${theme.colors.primary.main};  // #003366
  object-fit: cover;              // قص الصورة بشكل متناسب
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  /* MOBILE RESPONSIVE */
  @media (max-width: 768px) {
    width: 88px;                  // حجم Instagram
    height: 88px;
    border: 4px solid white;      // حد أبيض على الموبايل
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    margin: -44px auto 16px;      // محاذاة فوق الغلاف
    z-index: 2;                   // ظهور فوق الغلاف
  }
  
  @media (max-width: 480px) {
    width: 80px;
    height: 80px;
  }
  
  @media (max-width: 380px) {
    width: 72px;
    height: 72px;
    border-width: 3px;
  }
  
  /* Morphing Animation on Hover */
  transition: transform 0.3s ease, filter 0.3s ease;
  
  &:hover {
    transform: scale(1.05);       // تكبير بنسبة 5%
    filter: brightness(1.1);      // زيادة السطوع قليلاً
  }
`;
```

### القطاع الثاني: معلومات المستخدم (User Info)

```typescript
// src/pages/03_user-pages/profile/ProfilePage/styles.ts (سطر ~190)

ProfileInfo = styled.div`
  flex-grow: 1;
  
  h1 {
    font-size: 2rem;              // 32px
    font-weight: 700;             // Bold
    color: var(--text-primary);
    margin: 0 0 8px 0;
    
    @media (max-width: 768px) {
      font-size: 1.75rem;         // 28px
      text-align: center;         // توسيط على الموبايل
    }
    
    @media (max-width: 480px) {
      font-size: 1.5rem;          // 24px
    }
  }
  
  p {
    font-size: 1rem;              // 16px
    color: var(--text-secondary); // #666666
    margin: 4px 0;
  }
`;
```

### القطاع الثالث: الأزرار الرئيسية

#### 🔘 زر Follow

```typescript
// المسار: src/pages/03_user-pages/profile/ProfilePage/TabNavigation.styles.ts

FollowButton = styled.button`
  padding: 10px 18px;
  border-radius: 50px;            // زر دائري
  border: 2px solid var(--accent-primary);
  background: transparent;
  color: var(--accent-primary);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 8px;
  display: inline-flex;
  align-items: center;
  
  &:hover {
    background: var(--accent-primary);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(204, 157, 44, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
  
  /* Loading State */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
```

#### 💬 زر Message

```typescript
// نفس Style الـ FollowButton

SyncButton = styled.button`
  padding: 10px 18px;
  border-radius: 50px;
  background: var(--accent-primary);  // #cc9d2c
  color: white;
  border: 2px solid transparent;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: var(--accent-secondary); // #ff6b6b
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
```

### القطاع الرابع: الإحصائيات

```typescript
// ProfileStats Component

StatsBar = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-primary);
  
  @media (max-width: 768px) {
    gap: 1rem;
    justify-content: space-around;
  }
`;

StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  
  strong {
    font-size: 1.5rem;            // 24px
    color: var(--accent-primary);
    margin-bottom: 4px;
  }
  
  span {
    font-size: 0.85rem;           // 14px
    color: var(--text-secondary);
  }
`;
```

---

## 🗂️ شريط التبويبات (Tab Navigation)

### الحاوية الرئيسية للتبويبات

```typescript
// المسار: src/pages/03_user-pages/profile/ProfilePage/TabNavigation.styles.ts (سطر ~1)

TabNavigation = styled.div`
  display: flex;
  gap: 8px;                       // المسافة بين الأزرار
  margin-bottom: 20px;
  padding: 12px;                  // Padding داخل الحاوية
  position: relative;
  border-radius: 18px;            // زوايا مدورة
  min-height: 70px;
  
  /* Light Mode */
  html[data-theme="light"] & {
    background: rgba(255, 255, 255, 0.95);  // شفافية
    border: 2px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  
  /* Dark Mode */
  html[data-theme="dark"] & {
    background: rgba(30, 41, 59, 0.95);     // #1e293b شفاف
    border: 2px solid rgba(148, 163, 184, 0.15);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }
  
  /* Responsive Layout */
  @media (max-width: 1024px) {
    flex-wrap: wrap;              // صفان من الأزرار
    gap: 10px;
    padding: 14px;
  }
  
  @media (max-width: 768px) {
    position: sticky;             // ثابت عند التمرير
    top: 56px;                    // أسفل الـ Header
    z-index: 9;
    gap: 8px;
    padding: 12px;
    border-radius: 16px;
    gap: 6px;
    padding: 8px;
    border-radius: 14px;
  }
  
  /* Accent Stripe at Bottom */
  &::after {
    content: '';
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: 8px;
    height: 3px;
    border-radius: 3px;
    background: var(--accent-primary);  // #cc9d2c
    opacity: 0.6;
    z-index: 1;
  }
`;
```

### زر التبويب الواحد (Tab Button)

```typescript
// src/pages/03_user-pages/profile/ProfilePage/TabNavigation.styles.ts (سطر ~85)

TabButton = styled.button`
  flex: 1;
  min-width: 90px;
  padding: 12px 16px;
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 14px;
  min-height: 48px;
  position: relative;
  overflow: hidden;
  z-index: 2;
  white-space: nowrap;
  
  /* Responsive */
  @media (max-width: 1024px) {
    flex: 0 0 calc(33.333% - 7px); // 3 أزرار في الصف
    min-width: 0;
  }
  
  /* ACTIVE STATE - Gradient & Glow */
  ${$active ? css`
    background: linear-gradient(135deg,
      rgba(255, 159, 42, 0.98) 0%,
      rgba(255, 143, 16, 1) 30%,
      rgba(255, 121, 0, 1) 60%,
      rgba(255, 102, 0, 0.98) 100%
    );
    color: white;
    border: 2px solid rgba(255, 215, 0, 0.7);
    
    /* Multi-layer Shadow */
    box-shadow: 
      0 1px 0 rgba(255, 255, 255, 0.4) inset,
      0 -1px 0 rgba(0, 0, 0, 0.1) inset,
      0 8px 24px rgba(255, 143, 16, 0.35),
      0 3px 8px rgba(255, 121, 0, 0.25),
      0 0 0 1px rgba(255, 215, 0, 0.3);
  ` : css`
    /* INACTIVE STATE - Glass Effect */
    background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.5) 0%,
      rgba(248, 249, 250, 0.4) 100%
    );
    backdrop-filter: blur(10px) saturate(140%);
    color: #6c757d;
    border: 2px solid rgba(200, 200, 200, 0.25);
  `}
  
  /* HOVER STATE */
  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 12px 32px rgba(255, 143, 16, 0.45);
  }
  
  /* Transition Smooth */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;
```

### التبويبات المتوفرة:

| الرقم | الاسم (EN) | الاسم (BG) | الرمز | الدالة |
|------|-----------|-----------|------|--------|
| 1 | Profile | Профил | UserCircle | عرض البيانات العامة |
| 2 | My Ads | Моите обяви | Car | عرض إعلاناتي |
| 3 | Campaigns | Кампании | Megaphone | إدارة الحملات |
| 4 | Analytics | Статистика | BarChart3 | عرض الإحصائيات |
| 5 | Settings | Настройки | Shield | الإعدادات الشاملة |
| 6 | Consultations | Консултации | MessageCircle | الاستشارات |

---

## 📋 تبويب "My Ads" (إعلاناتي)

### الـ Container والـ Header

```typescript
// src/pages/03_user-pages/profile/ProfilePage/ProfileMyAds.tsx (سطر ~105)

SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

SectionTitle = styled.h2`
  font-size: 1.75rem;             // 28px
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;            // 24px
    text-align: center;
  }
`;

AddButton = styled.button`
  padding: 12px 20px;
  background: var(--accent-primary);    // #cc9d2c
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--accent-secondary); // #ff6b6b
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 107, 107, 0.3);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;
```

### شريط الترتيب والتصفية

```typescript
// FiltersBar Component (سطر ~125)

FiltersBar = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

FilterLabel = styled.label`
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
`;

FilterSelect = styled.select`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--accent-primary);
  }
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(204, 157, 44, 0.1);
  }
  
  option {
    background: var(--bg-card);
    color: var(--text-primary);
  }
`;
```

### خيارات الترتيب (10 خيارات)

| القيمة | التسمية (EN) | التسمية (BG) |
|--------|------------|------------|
| newest | Newest first | Най-нови първо |
| oldest | Oldest first | Най-стари първо |
| nameAsc | Name (A-Z) | Име (А-Я) |
| nameDesc | Name (Z-A) | Име (Я-А) |
| priceLow | Price: Low to High | Цена: ниска → висока |
| priceHigh | Price: High to Low | Цена: висока → ниска |
| yearNew | Year: New to Old | Година: нова → стара |
| yearOld | Year: Old to New | Година: стара → нова |
| make | By Make | По марка |
| model | By Model | По модел |

### خيارات التصفية (4 خيارات)

| القيمة | التسمية (EN) | التسمية (BG) |
|--------|------------|------------|
| all | All | Всички |
| active | Active | Активни |
| sold | Sold | Продадени |
| pending | Pending | В изчакване |

### شبكة السيارات

```typescript
// CarsGrid Component

CarsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.2rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);  // عمودين على الموبايل
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;             // عمود واحد على الموبايل الصغير
    gap: 0.75rem;
  }
`;
```

### حالة "لا توجد سيارات" (Empty State)

```typescript
// EmptyState Component

EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  color: var(--text-secondary);
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

EmptyText = styled.p`
  font-size: 1.1rem;
  margin: 1rem 0 2rem 0;
  color: var(--text-secondary);
`;

FilterResetButton = styled.button`
  padding: 10px 16px;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--accent-secondary);
    transform: translateY(-2px);
  }
`;
```

---

## ⚙️ تبويب "Settings" (الإعدادات)

### البنية الأساسية

```typescript
// src/pages/03_user-pages/profile/ProfilePage/tabs/SettingsTab.tsx (سطر ~1)

// 9 أقسام رئيسية:
```

### 📝 القسم الأول: تعديل المعلومات (Edit Information)

```typescript
// Form Fields:

1. Display Name
   - نوع: Text Input
   - القيد: max-length = 100
   - Placeholder: "John Doe"
   - Font Size: 1rem

2. Email
   - نوع: Email Input
   - Status Badge: "Verified" / "Unverified"
   - Verification Button: عند الحاجة

3. Phone
   - نوع: Tel Input
   - Format: +359 (Bulgaria)
   - Verification Status: Badge

4. Bio
   - نوع: Textarea
   - Rows: 4
   - Max-length: 500
   - Character Counter: نعم
   - Font Size: 0.95rem

5. Preferred Language
   - نوع: Select Dropdown
   - الخيارات: Bulgarian, English
   - Flag Icons: نعم
```

### 🏢 القسم الثاني: الحساب (Account)

```typescript
// يعرض معلومات الحساب الأساسية
// بالإضافة إلى:

// DealershipInfoForm (للحسابات التجارية فقط):
{
  dealershipName: string;
  licenseNumber: string;
  address: string;
  phone: string;
  mapLocation: { lat, lng };
  businessHours: {
    monday: { open, close };
    // ... أيام أخرى
  }
}
```

### 🔒 القسم الثالث: الخصوصية (Privacy)

```typescript
// Toggle Switches:

1. Profile Visibility
   - الخيارات: Public, Private, Friends Only
   - Default: Public
   - Icon: Eye / EyeOff

2. Show Phone
   - نوع: Boolean Toggle
   - اللون عند التفعيل: --accent-primary
   - اللون عند التعطيل: --text-tertiary

3. Show Email
   - نفس التوثيق

4. Show Last Seen
   - نفس التوثيق

5. Allow Messages
   - نفس التوثيق

6. Show Activity
   - نفس التوثيق
```

### 🔔 القسم الرابع: الإخطارات (Notifications)

```typescript
// ثلاث مجموعات رئيسية:

1. Email Notifications
   - Main Toggle: تفعيل/تعطيل كل الإخطارات البريدية
   - Sub-toggles:
     * New Messages
     * Price Alerts
     * Favorite Updates
     * New Listings
     * Promotions
     * Newsletter

2. SMS Notifications
   - نفس البنية

3. Push Notifications
   - نفس البنية

كل toggle:
- العرض: 48px × 24px
- الحد الأدنى للارتفاع: 44px
- Transition Duration: 0.3s ease
- اللون (مفعل): --accent-primary
- اللون (معطل): --border-primary
```

### 🎨 القسم الخامس: المظهر (Appearance)

```typescript
// 4 خيارات رئيسية:

1. Theme Selection
   - الخيارات: Auto, Light, Dark
   - Indicators: Radio buttons
   - Icons: Sun, Moon, Laptop
   - Default: Auto

2. Currency
   - Selected: EUR (€)
   - Display: "EUR - Euro"

3. Date Format
   - الخيارات: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
   - Default: DD/MM/YYYY (Bulgaria)

4. Compact View
   - نوع: Checkbox
   - الوصف: "Show condensed layout"
```

### 🛡️ القسم السادس: الأمان (Security)

```typescript
// 4 عناصر رئيسية:

1. Two-Factor Authentication (2FA)
   - Status Badge: Enabled / Disabled
   - Button: Enable / Disable
   - QR Code: للـ Google Authenticator
   - Backup Codes: 10 رموز احتياطية

2. Login Alerts
   - Toggle: تفعيل/تعطيل
   - الوصف: "Get notified of new logins"

3. Session Timeout
   - نوع: Slider
   - المدة: 15 - 1440 دقيقة (15 دقيقة - 24 ساعة)
   - Display: "Logout after X minutes of inactivity"
   - Default: 60 دقيقة

4. Password Change
   - Field 1: Old Password (type: password)
   - Field 2: New Password (type: password)
   - Field 3: Confirm Password (type: password)
   - Password Requirements:
     * Minimum 8 characters
     * At least 1 uppercase letter
     * At least 1 number
     * At least 1 special character
   - Strength Indicator: Weak / Fair / Good / Strong
   - Button: Change Password (عند الملء الصحيح)
```

### 🚗 القسم السابع: تفضيلات السيارات (Car Preferences)

```typescript
// 2 عنصر رئيسي:

1. Price Range
   - Min Slider: 0 - 100,000 EUR
   - Max Slider: 0 - 100,000 EUR
   - Display Format: "€0 - €100,000"
   - Labels: "Min Price" / "Max Price"

2. Search Radius
   - نوع: Slider أو Input
   - الوحدة: km (كيلومتر)
   - النطاق: 5 - 500 km
   - Default: 50 km
   - Display: "Search within X km"
```

### 📥 القسم الثامن: البيانات والتصدير (Data & Export)

```typescript
// خيارات:

1. Download Profile Data
   - الوصف: "Download a copy of all your profile data in JSON format"
   - Button: "Download Data"
   - الأيقونة: Download
   - اللون: --accent-primary

2. Delete Profile Data
   - التحذير: "This action cannot be undone"
   - الوصف: "Permanently delete all your data"
   - Button: "Delete All Data" (بلون أحمر)
   - الأيقونة: Trash2
   - اللون: --error
   - Confirmation Dialog: نعم (مطلوب تأكيد)
   - مدة المهلة: 30 يوم قبل الحذف النهائي
```

### 🖼️ القسم التاسع: رفع الصورة (Photo Upload)

```typescript
// ProfileImageUploader Component

Upload Area:
- نوع: Drag & Drop
- الخلفية: var(--bg-secondary)
- Border: 2px dashed var(--border-primary)
- Border Radius: 12px
- Min Height: 150px
- Hover Effect: border-color يتغير لـ --accent-primary

Supported Formats:
- .jpg, .jpeg, .png, .webp
- Max File Size: 5MB

Preview:
- الحجم: 150px × 150px
- Border: 2px solid var(--accent-primary)
- Border Radius: 50% (دائري)
- Effect: crop / resize

Buttons:
- Save: green
- Delete: red
- Cancel: gray
```

---

## 🎬 الـ Animations والـ Transitions

### 1️⃣ fadeIn Animation

```typescript
keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

المدة: 0.5s ease-out
الاستخدام: Page Load، Tab Switch
الملف: styles.ts (سطر ~10)
```

### 2️⃣ pulse Animation

```typescript
const pulse = (color: string) => keyframes`
  0% { 
    box-shadow: 0 0 0 0 ${color}; 
  }
  70% { 
    box-shadow: 0 0 0 10px rgba(204, 169, 44, 0); 
  }
  100% { 
    box-shadow: 0 0 0 0 rgba(204, 169, 44, 0); 
  }
`;

المدة: 2s infinite
الاستخدام: Trust Badges، Verification Indicators
الملف: styles.ts (سطر ~16)
```

### 3️⃣ slideInFromLeft Animation

```typescript
keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

المدة: 0.4s ease-out
الاستخدام: Sidebar Items، Profile Details
```

### 4️⃣ Hover Transitions

```typescript
// على الأزرار
transition: all 0.3s ease;

&:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

// على الصور
transform: scale(1.05);
filter: brightness(1.1);

// على الـ Tabs
background: linear-gradient(gradient);
color: white;
transform: translateY(-2px) scale(1.02);
```

---

## 📐 الأبعاد والمسافات (Sizing & Spacing)

### الـ Font Sizes

```typescript
من src/styles/theme.ts:

xs: 0.75rem;      // 12px  (رسائل صغيرة)
sm: 0.875rem;     // 14px  (النصوص الثانوية)
base: 1rem;       // 16px  (النص الأساسي)
md: 1.0625rem;    // 17px
lg: 1.125rem;     // 18px  (الرؤوس)
xl: 1.25rem;      // 20px
xxl: 1.5rem;      // 24px  (الرؤوس الكبيرة)
xxxl: 2rem;       // 32px  (الرؤوس الضخمة)
```

### المسافات (Padding & Margin)

```typescript
0.25rem = 4px
0.5rem = 8px
0.75rem = 12px
1rem = 16px
1.5rem = 24px
2rem = 32px
3rem = 48px
4rem = 64px
```

### Border Radius

```typescript
4px   - الحد الأدنى (inputs صغيرة)
8px   - عناصر متوسطة
12px  - buttons، cards عادية
14px  - tabs
16px  - large components
18px  - tab navigation
50px  - زوايا دائرية كاملة (buttons)
```

---

## 📱 Responsive Breakpoints

```typescript
// من ProfilePageWrapper و Styled Components

Desktop:  > 1024px
  - عرض 3 أزرار في التبويبات
  - Sidebar على اليمين/اليسار
  - عمود واحد للمحتوى
  - Font sizes كاملة

Tablet:   768px - 1024px
  - عرض متوسط
  - 2 صفوف من التبويبات
  - صورة شخصية محاذاة للأعلى
  - Grid: 2 أعمدة للسيارات

Mobile:   480px - 768px
  - Sticky tabs في الأعلى (top: 56px)
  - صورة شخصية فوق الغلاف (margin: -44px auto)
  - عمود واحد للمحتوى
  - Grid: عمودين للسيارات
  - Font sizes مخفضة

Small:    < 480px
  - صورة شخصية أصغر (72px × 72px)
  - Font sizes أصغر
  - Padding/Margin مخفضة
  - Grid: عمود واحد فقط
```

---

## 🔄 Data Flow والحالات الشرطية

### حالات المستخدم (User States)

```typescript
1. المستخدم نفسه يشاهد ملفه:
   - isOwnProfile = true
   - عرض: زر Edit، زر Settings، زر Add New
   - عرض: جميع الأقسام الخاصة
   - إمكانية التعديل: نعم

2. مستخدم يشاهد ملف آخر:
   - isOwnProfile = false
   - عرض: زر Follow، زر Message
   - إخفاء: Settings، Edit، Add New
   - عرض: PublicProfileView فقط

3. مستخدم لم يسجل دخول:
   - يرى AuthGuard
   - إعادة التوجيه إلى Login

4. ملف لم يُعثر عليه:
   - عرض: "User not found" message
   - عرض: Back button
```

### Numeric ID Conversion

```typescript
// من useProfile.ts hook

1. كشف numeric ID:
   const isNumericId = /^\d+$/.test(targetUserId);

2. تحويل إلى Firebase UID:
   if (isNumericId) {
     const firebaseUid = await getFirebaseUidByNumericId(numericId);
   }

3. تحميل البيانات:
   const user = await bulgarianAuthService.getUserProfileById(uid);
   const cars = await unifiedCarService.getUserCars(uid);

4. تعيين الأدوار:
   viewer = current logged-in user
   target = user being viewed
   activeProfile = target ?? user (ترجيح target)
```

---

## 🎯 الشروط الخاصة (Edge Cases)

### 1. مستخدم بدون صورة شخصية

```typescript
-> عرض default avatar
-> اللون: gray-300
-> الأيقونة: User من lucide-react
```

### 2. ملف بدون سيارات

```typescript
-> عرض EmptyState
-> الأيقونة: Car
-> الرسالة: "You don't have any listings yet"
-> زر: Add New (للمالك فقط)
```

### 3. ملف بدون حملات

```typescript
-> عرض EmptyState
-> الرسالة: "No campaigns yet"
-> زر: Create Campaign
```

### 4. بطء التحميل

```typescript
-> عرض Loading spinner
-> النص: "Loading..."
```

### 5. خطأ في الحصول على البيانات

```typescript
-> عرض error message
-> زر: Retry
```

---

## ✅ قائمة التحقق النهائية

قبل النقل الاحترافي، تأكد من:

- [ ] جميع الألوان CSS Variables مستخدمة
- [ ] جميع الـ Animations سلسة وبدون تأخير
- [ ] جميع الـ Responsive breakpoints تعمل
- [ ] جميع الـ Translations موجودة (BG + EN)
- [ ] جميع الأزرار لها Hover effects
- [ ] جميع الـ Icons من lucide-react
- [ ] جميع الـ Forms validation موجود
- [ ] جميع الـ Loading states معرفة
- [ ] جميع الـ Error states معرفة
- [ ] جميع الـ Empty states معرفة
- [ ] Accessibility (ARIA labels، semantic HTML)
- [ ] Performance (No memory leaks، cleanup functions)

---

**📅 آخر تحديث:** 16 ديسمبر 2025  
**⚖️ الإصدار:** 1.0 - Production Ready  
**👤 الحالة:** جاهز للتنفيذ الاحترافي بدون أخطاء

