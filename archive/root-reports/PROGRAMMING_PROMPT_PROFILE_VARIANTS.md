# برومت برمجي شامل: تنفيذ نظام البروفايل الثلاثي
## Koli One — Profile Variants Implementation Prompt

---

## 🎯 السياق والهدف

**اسم المشروع:** Koli One  
**الإصدار:** React 18 + TypeScript 5.6 (strict) + Firebase 12 + Algolia  
**نطاق العمل:** تنفيذ واجهة بروفايل موحدة وقابلة للتوسع لثلاثة أنواع بائعين:

1. **Private Seller** (البائع الشخصي) — اللون الأساسي: `#FF7A2D` (برتقالي)
2. **Dealer** (التاجر/المعرض) — اللون الأساسي: `#2EB872` (أخضر)
3. **Corporate** (الشركة) — اللون الأساسي: `#2B7BFF` (أزرق)

**الهدف الرئيسي:** إنشء نظام عام (`ProfileShell`) يعرّض المحتوى حسب نوع البائع مع الحفاظ على هوية مرئية متماسكة، شارات توثيق، trust signals، وترجمة كاملة (BG/EN).

---

## 📋 المتطلبات الفنية العامة

### 1. الهيكل والمكونات الأساسية

#### 1.1 مكون `ProfileShell` (المركزي)

```typescript
// src/components/profile/ProfileShell.tsx

interface ProfileShellProps {
  profileType: 'private' | 'dealer' | 'corporate';
  profileId: string;                    // Numeric ID of seller
  profileData: SellerProfile;           // Data from Firebase (see types below)
  children: React.ReactNode;            // Specific variant content
  isLoading?: boolean;
  onActionClick?: (action: ProfileAction) => void;
}

interface SellerProfile {
  id: string;                           // Firebase document ID
  sellerId: string;                     // Firebase Auth UID
  numericId: number;                    // Numeric ID (URL-safe)
  profileType: 'private' | 'dealer' | 'corporate';
  
  // Basic info
  name: string;
  logo?: string;                        // URL or Firebase Storage ref
  description?: string;
  location: {
    city: string;
    region: string;
    coordinates?: { lat: number; lng: number };
  };
  
  // Contact
  phone: string;                        // +359 format
  email: string;
  businessHours?: {
    open: string;                       // "09:00"
    close: string;                      // "18:00"
    days: string[];                     // ['Monday', 'Tuesday', ...]
  };
  
  // Verification & Trust
  badges: Badge[];                      // ['phone_verified', 'dealer_verified', ...]
  verificationDocs?: {
    type: 'identity' | 'business_license' | 'tax_id';
    uploadedAt: Timestamp;
    status: 'pending' | 'approved' | 'rejected';
  }[];
  
  // Trust metrics
  stats: {
    totalListings: number;
    avgResponseTime: number;            // minutes
    responseRate: number;               // percentage (0-100)
    trustScore: number;                 // 0-100
  };
  
  // Gallery
  gallery: {
    url: string;
    type: 'image' | 'video';           // Future: add video support
    uploadedAt: Timestamp;
  }[];
  
  // Dealer/Corporate specific
  businessName?: string;                // For dealer/corporate
  businessLicense?: string;             // For dealer/corporate
  teamMembers?: {
    name: string;
    role: string;
    photo?: string;
  }[];
  
  // Corporate specific
  officeLocations?: Array<{
    name: string;
    address: string;
    phone: string;
    coordinates?: { lat: number; lng: number };
  }>;
  corporateServices?: string[];         // ['fleet_sales', 'leasing', ...]
}

type ProfileAction = 'contact' | 'book_inspection' | 'book_test_drive' | 'request_quote' | 'schedule_consultation';

type Badge = 
  | 'phone_verified' 
  | 'identity_verified' 
  | 'dealer_verified' 
  | 'company_certified'
  | 'trusted_seller';
```

**المسؤوليات:**
- استقبال `profileType` وتطبيق Theme (accent color، styles) صحيح
- توفير grid layout موحد: Header، Hero، Gallery، InfoPanel، Actions، TrustPanel
- إدارة loading state وعرض Loader موحد
- التعامل مع Redirect Intent (user غير مسجل يضغط CTA)
- دعم RTL للعربية (إذا أضيفت لاحقاً)

**Styling approach:**
استخدم Styled-Components (موجود في المشروع) مع theme provider:

```typescript
const accentColors = {
  private: '#FF7A2D',   // برتقالي
  dealer: '#2EB872',    // أخضر
  corporate: '#2B7BFF'  // أزرق
};

// في ProfileShell:
const StyledProfileContainer = styled.div`
  --accent-color: ${props => accentColors[props.$profileType]};
  
  button, a.btn {
    background-color: var(--accent-color);
    border-color: var(--accent-color);
    
    &:hover {
      filter: brightness(1.1);
    }
  }
  
  .badge {
    border-color: var(--accent-color);
    color: var(--accent-color);
  }
`;
```

---

#### 1.2 ثلاث Variants

**أ) PrivateProfile.tsx** (مرأب بسيط)

```typescript
// src/components/profile/variants/PrivateProfile.tsx

interface PrivateProfileProps {
  profile: SellerProfile;
  onContact: () => void;
  onBookInspection: () => void;
}

/**
 * المكون يعرّض:
 * - Hero: صورة ورشة مع blur overlay خفيف
 * - بطاقة البائع: صورة شخصية، اسم، موقع، "محلي موثوق"
 * - صور السيارات: display كبير (1-2 بطاقة في الصف)
 * - قسم القصة: نص سردي عن السيارة والصيانة
 * - سجل الصيانة: أيقونات (زيت، فرامل) مع تواريخ
 * - أزرار: "اتصل بالبائع"، "احجز معاينة" (برتقالي)
 * - Trust: عدد المكالمات السابقة، response rate
 */

export const PrivateProfile: React.FC<PrivateProfileProps> = ({
  profile,
  onContact,
  onBookInspection
}) => {
  return (
    <PrivateProfileContainer>
      {/* Hero with garage background */}
      <HeroSection>
        {/* Blurred garage image or placeholder */}
      </HeroSection>
      
      {/* Seller Card */}
      <SellerCard>
        {/* Avatar, name, location, "Local Trusted" badge */}
      </SellerCard>
      
      {/* Gallery: Large image display */}
      <GallerySection>
        {/* Image carousel or grid */}
      </GallerySection>
      
      {/* Story section: Narrative about car */}
      <StorySection>
        {/* Description, maintenance history as narrative */}
      </StorySection>
      
      {/* Actions */}
      <ActionsRow>
        <Button onClick={onContact}>
          {t('profile.private.contact')} {/* BG: Свържи се с продавача */}
        </Button>
        <Button onClick={onBookInspection}>
          {t('profile.private.bookInspection')} {/* BG: Резервирай оглед */}
        </Button>
      </ActionsRow>
      
      {/* Trust Signals */}
      <TrustPanel profile={profile} />
    </PrivateProfileContainer>
  );
};
```

**ب) DealerProfile.tsx** (معرض/كراج)

```typescript
// src/components/profile/variants/DealerProfile.tsx

interface DealerProfileProps {
  profile: SellerProfile;
  onVisitShowroom: () => void;
  onBookTestDrive: () => void;
}

/**
 * المكون يعرّض:
 * - Hero: carousel أفقي (4-6 سيارات بارزة)
 * - لوحة التاجر: شعار، تقييم النجوم، ساعات العمل، أزرار
 * - شبكة سيارات: بطاقات صغيرة مع فلتر سريع (السعر، النوع، الحالة)
 * - قسم العروض: تمويل، ضمانات، فحص ما قبل البيع
 * - فريق: صور الميكانيكيين/البائعين مع أدوارهم
 * - أزرار: "زور المعرض"، "احجز تجربة قيادة" (أخضر)
 */

export const DealerProfile: React.FC<DealerProfileProps> = ({
  profile,
  onVisitShowroom,
  onBookTestDrive
}) => {
  const [activeFilters, setActiveFilters] = useState({});
  const [carsOnDeal, setCarsOnDeal] = useState<CarListing[]>([]);
  
  useEffect(() => {
    // جلب السيارات من Firestore/Algolia مع فلترة
    // استخدم UnifiedCarService.getUserCars(profile.sellerId) أو SmartSearchService
  }, [profile.sellerId, activeFilters]);
  
  return (
    <DealerProfileContainer>
      {/* Hero: Carousel of featured cars */}
      <HeroCarousel cars={carsOnDeal.slice(0, 6)} />
      
      {/* Dealer info card */}
      <DealerCard profile={profile} />
      
      {/* Quick filters */}
      <FilterBar onFilterChange={setActiveFilters} />
      
      {/* Grid of cars */}
      <CarsGrid cars={carsOnDeal} />
      
      {/* Offers section */}
      <OffersSection profile={profile} />
      
      {/* Team section */}
      <TeamSection members={profile.teamMembers} />
      
      {/* Actions */}
      <ActionsRow>
        <Button onClick={onVisitShowroom}>
          {t('profile.dealer.visitShowroom')} {/* BG: Посети автокъщата */}
        </Button>
        <Button onClick={onBookTestDrive}>
          {t('profile.dealer.bookTestDrive')} {/* BG: Резервирай тестова пътешествие */}
        </Button>
      </ActionsRow>
      
      <TrustPanel profile={profile} />
    </DealerProfileContainer>
  );
};
```

**ج) CorporateProfile.tsx** (شركة بيع السيارات)

```typescript
// src/components/profile/variants/CorporateProfile.tsx

interface CorporateProfileProps {
  profile: SellerProfile;
  onRequestQuote: () => void;
  onScheduleConsultation: () => void;
}

/**
 * المكون يعرّض:
 * - Hero سينمائي: صورة عالية الجودة أو video loop (muted)
 * - لوحة الشركة: شعار كبير، نبذة، شارات الشراكات
 * - خدمات الشركات: Fleet sales, Corporate leasing, After-sales
 * - خرائط الفروع: تفاعلية مع مواقع المكاتب
 * - شهادات: ISO, Bank partnerships
 * - كتالوج: فلترة متقدمة، تحميل PDF
 * - أزرار: "اطلب عرض سعر"، "احجز استشارة" (أزرق)
 */

export const CorporateProfile: React.FC<CorporateProfileProps> = ({
  profile,
  onRequestQuote,
  onScheduleConsultation
}) => {
  const [showCatalogPDF, setShowCatalogPDF] = useState(false);
  
  return (
    <CorporateProfileContainer>
      {/* Hero: Cinematic image or loop video */}
      <HeroVideo profile={profile} />
      
      {/* Company card with partnerships */}
      <CompanyCard profile={profile} />
      
      {/* Corporate services */}
      <CorporateServicesSection services={profile.corporateServices} />
      
      {/* Office locations map */}
      <OfficeLocationsMap locations={profile.officeLocations} />
      
      {/* Certifications */}
      <CertificationsSection />
      
      {/* Advanced catalog with PDF download */}
      <AdvancedCatalog onDownloadPDF={() => setShowCatalogPDF(true)} />
      
      {/* Analytics (corporate dashboard preview) */}
      <AnalyticsPreview profile={profile} />
      
      {/* VIP Actions */}
      <VIPActionsRow>
        <Button onClick={onRequestQuote}>
          {t('profile.corporate.requestQuote')} {/* BG: Поискай оферта */}
        </Button>
        <Button onClick={onScheduleConsultation}>
          {t('profile.corporate.scheduleConsultation')} {/* BG: Планирай консултация */}
        </Button>
      </VIPActionsRow>
      
      <TrustPanel profile={profile} />
    </CorporateProfileContainer>
  );
};
```

---

### 2. مكونات معاودة الاستخدام

#### 2.1 ProfileBadges.tsx

```typescript
// src/components/profile/ProfileBadges.tsx

interface BadgesProps {
  badges: Badge[];
  accentColor: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * يعرّض شارات التحقق مع tooltips عند hover
 * شارات متوقعة:
 * - phone_verified: أيقونة هاتف أخضر
 * - identity_verified: أيقونة هوية
 * - dealer_verified: أيقونة درع (أخضر للتاجر)
 * - company_certified: أيقونة مبنى (أزرق للشركة)
 * - trusted_seller: نجمة ذهبية
 */

export const ProfileBadges: React.FC<BadgesProps> = ({
  badges,
  accentColor,
  size = 'md'
}) => {
  const badgeIcons: Record<Badge, string> = {
    phone_verified: 'Phone',
    identity_verified: 'Shield',
    dealer_verified: 'Shield',
    company_certified: 'Building',
    trusted_seller: 'Star'
  };
  
  return (
    <BadgeContainer>
      {badges.map(badge => (
        <BadgeItem
          key={badge}
          $accentColor={accentColor}
          title={t(`badges.${badge}.description`)}
        >
          <Icon name={badgeIcons[badge]} size={size} />
          <span>{t(`badges.${badge}.label`)}</span>
        </BadgeItem>
      ))}
    </BadgeContainer>
  );
};
```

#### 2.2 TrustPanel.tsx

```typescript
// src/components/profile/TrustPanel.tsx

interface TrustPanelProps {
  profile: SellerProfile;
  accentColor: string;
}

/**
 * يعرّض:
 * - Trust Score (0-100) مع شريط تقدم
 * - Response rate (%)
 * - Average response time (minutes)
 * - عدد التقييمات إن وجدت
 * - تاريخ الانضمام
 */

export const TrustPanel: React.FC<TrustPanelProps> = ({
  profile,
  accentColor
}) => {
  const { stats } = profile;
  
  return (
    <TrustPanelContainer>
      <TrustScoreCard>
        <ScoreValue accentColor={accentColor}>{stats.trustScore}</ScoreValue>
        <ProgressBar value={stats.trustScore} maxValue={100} accentColor={accentColor} />
        <Label>{t('profile.trustScore')}</Label>
      </TrustScoreCard>
      
      <MetricsGrid>
        <MetricItem>
          <Value>{stats.responseRate}%</Value>
          <Label>{t('profile.responseRate')}</Label>
        </MetricItem>
        <MetricItem>
          <Value>{stats.avgResponseTime}m</Value>
          <Label>{t('profile.avgResponseTime')}</Label>
        </MetricItem>
        <MetricItem>
          <Value>{stats.totalListings}</Value>
          <Label>{t('profile.totalListings')}</Label>
        </MetricItem>
      </MetricsGrid>
    </TrustPanelContainer>
  );
};
```

#### 2.3 ProfileLoader.tsx

```typescript
// src/components/ui/PageLoader/ProfileLoader.tsx

interface ProfileLoaderProps {
  stage: number; // 0-100
  profileType: 'private' | 'dealer' | 'corporate';
  message?: string; // Optional override message
}

/**
 * عرض Loader موحد مع:
 * - مسنن دوّار (spinner) موضوع وسط الشاشة
 * - عداد مئوي رقمي أسفل المسنن
 * - رسالة نصية متغيرة حسب مرحلة التحميل
 * - لون يتبع accent color للنوع
 * 
 * Stages:
 * 0-30: "Ignition..." (BG: Запалване...)
 * 30-70: "Accelerating..." (BG: Ускоряване...)
 * 70-100: "You're on the road..." (BG: На път сте...)
 */

const loaderMessages = {
  ignition: { bg: 'Запалване...', en: 'Ignition...' },
  accelerating: { bg: 'Ускоряване...', en: 'Accelerating...' },
  onRoad: { bg: 'На път сте...', en: "You're on the road..." }
};

export const ProfileLoader: React.FC<ProfileLoaderProps> = ({
  stage,
  profileType,
  message
}) => {
  const accentColor = {
    private: '#FF7A2D',
    dealer: '#2EB872',
    corporate: '#2B7BFF'
  }[profileType];
  
  const getMessageKey = () => {
    if (stage < 30) return 'ignition';
    if (stage < 70) return 'accelerating';
    return 'onRoad';
  };
  
  const messageKey = getMessageKey();
  const displayMessage = message || loaderMessages[messageKey][useLanguage().lang]; // Using existing useLanguage hook
  
  return (
    <LoaderOverlay>
      <LoaderContent>
        <Spinner accentColor={accentColor} />
        <PercentageDisplay>{stage}%</PercentageDisplay>
        <LoaderMessage>{displayMessage}</LoaderMessage>
      </LoaderContent>
    </LoaderOverlay>
  );
};
```

---

### 3. طبقة البيانات والخدمات

#### 3.1 إنشاء/توسيع ProfileService

```typescript
// src/services/profile/profile-service.ts

import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { logger } from '@/services/logger-service';

export class ProfileService {
  /**
   * جلب بيانات البروفايل الكاملة للبائع
   * @param numericId الرقم التسلسلي للبائع (URL-safe)
   */
  async getProfileByNumericId(numericId: number): Promise<SellerProfile> {
    try {
      // 1. جلب UID من collection `users` بناءً على numericId
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('numericId', '==', numericId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error(`Profile not found for numericId: ${numericId}`);
      }
      
      const userDoc = snapshot.docs[0];
      const uid = userDoc.id;
      const userData = userDoc.data();
      
      // 2. جلب بيانات الملف الكامل
      const profileRef = doc(db, 'seller_profiles', uid);
      const profileSnap = await getDoc(profileRef);
      
      if (!profileSnap.exists()) {
        logger.warn(`Profile doc not found for uid: ${uid}`);
        // Return basic profile from userData
        return this.buildProfileFromUserData(userData, uid);
      }
      
      return {
        id: profileSnap.id,
        ...profileSnap.data(),
        numericId
      } as SellerProfile;
    } catch (err) {
      logger.error('Error fetching profile:', err);
      throw err;
    }
  }
  
  /**
   * جلب سيارات البائع مع الفلترة
   */
  async getSellerCars(
    sellerId: string,
    profileType: 'private' | 'dealer' | 'corporate',
    filters?: CarFilters
  ): Promise<CarListing[]> {
    // استخدم UnifiedCarService + search service
    // تحسيب: private sellers عادة يملكون 1-3 سيارات
    //        dealers يملكون 20-100
    //        corporate يملكون 100+
    
    const { UnifiedCarService } = await import('@/services/car/unified-car-service');
    const cars = await UnifiedCarService.getUserCars(sellerId);
    
    // تطبيق filters إن وجدت
    if (filters) {
      return cars.filter(car => this.applyCarFilters(car, filters));
    }
    
    return cars;
  }
  
  /**
   * تحديث Trust Score تلقائياً
   */
  async calculateTrustScore(uid: string): Promise<number> {
    // نقاط:
    // - phone verified: +10
    // - identity verified: +15
    // - dealer verified: +20
    // - company certified: +25
    // - لكل تقييم إيجابي: +2 (max 50)
    // - response rate > 80%: +15
    // - الانضمام منذ سنة: +10
    
    // ... حساب النقاط ...
    
    return trustScore;
  }
}

export const profileService = new ProfileService();
```

#### 3.2 توسيع Firebase collections

```typescript
// إضافة collection جديدة: "seller_profiles"
// Document structure:

/**
 * Firestore: seller_profiles/{uid}
 * 
 * {
 *   profileType: 'private' | 'dealer' | 'corporate',
 *   name: string,
 *   logo: string (URL),
 *   description: string,
 *   location: { city, region, coordinates },
 *   contact: { phone, email, businessHours },
 *   badges: [],
 *   verificationDocs: [],
 *   stats: { totalListings, avgResponseTime, responseRate, trustScore },
 *   gallery: [],
 *   teamMembers: [],                    // Dealer/Corporate
 *   officeLocations: [],               // Corporate
 *   corporateServices: [],             // Corporate
 *   createdAt: Timestamp,
 *   updatedAt: Timestamp
 * }
 */
```

---

### 4. نظام الترجمة (i18n) والنصوص

#### 4.1 إضافة keys إلى locales

```json
// src/locales/bg.json
{
  "profile": {
    "private": {
      "contact": "Свържи се с продавача",
      "bookInspection": "Резервирай оглед",
      "sellerBadge": "Местен продавач",
      "trustCaption": "Надежден и проверен"
    },
    "dealer": {
      "visitShowroom": "Посети автокъщата",
      "bookTestDrive": "Резервирай тестова пътешествие",
      "sellerBadge": "Проверена автокъща",
      "inStock": "В наличност"
    },
    "corporate": {
      "requestQuote": "Поискай оферта",
      "scheduleConsultation": "Планирай консултация",
      "sellerBadge": "Корпоративен дилър",
      "corporateOffers": "Корпоративни оферти"
    },
    "badges": {
      "phone_verified": {
        "label": "Телефон проверен",
        "description": "Номерът на телефона е потвърден"
      },
      "identity_verified": {
        "label": "Личност проверена",
        "description": "Самоличността е проверена от Koli One"
      },
      "dealer_verified": {
        "label": "Дилър проверен",
        "description": "Бизнесът е официално регистриран"
      },
      "company_certified": {
        "label": "Компания сертифицирана",
        "description": "Сертифицирана корпоративна компания"
      },
      "trusted_seller": {
        "label": "Доверен продавач",
        "description": "Висок рейтинг и обратна връзка"
      }
    },
    "loader": {
      "ignition": "Запалване...",
      "accelerating": "Ускоряване...",
      "onRoad": "На път сте..."
    },
    "trustScore": "Оценка на доверието",
    "responseRate": "Процент на отговора",
    "avgResponseTime": "Средно време за отговор",
    "totalListings": "Общо обяви"
  }
}
```

```json
// src/locales/en.json
{
  "profile": {
    "private": {
      "contact": "Contact Seller",
      "bookInspection": "Book Inspection",
      "sellerBadge": "Local Seller",
      "trustCaption": "Trustworthy & Verified"
    },
    "dealer": {
      "visitShowroom": "Visit Showroom",
      "bookTestDrive": "Book Test Drive",
      "sellerBadge": "Verified Dealer",
      "inStock": "In stock"
    },
    "corporate": {
      "requestQuote": "Request Corporate Quote",
      "scheduleConsultation": "Schedule Consultation",
      "sellerBadge": "Corporate Dealer",
      "corporateOffers": "Corporate Offers"
    },
    "badges": {
      "phone_verified": {
        "label": "Phone Verified",
        "description": "Phone number confirmed"
      },
      "identity_verified": {
        "label": "Identity Verified",
        "description": "Identity verified by Koli One"
      },
      "dealer_verified": {
        "label": "Dealer Verified",
        "description": "Business officially registered"
      },
      "company_certified": {
        "label": "Company Certified",
        "description": "Certified corporate company"
      },
      "trusted_seller": {
        "label": "Trusted Seller",
        "description": "High rating and feedback"
      }
    },
    "loader": {
      "ignition": "Ignition...",
      "accelerating": "Accelerating...",
      "onRoad": "You're on the road..."
    },
    "trustScore": "Trust Score",
    "responseRate": "Response Rate",
    "avgResponseTime": "Average Response Time",
    "totalListings": "Total Listings"
  }
}
```

---

### 5. العزل والتوجيه (Intent & Redirect)

#### 5.1 إدارة Intent غير المسجل

```typescript
// src/hooks/useProfileIntent.ts

interface ProfileIntent {
  action: ProfileAction;
  profileId: string;
  profileType: string;
  redirectAfterAuth?: string;
}

export const useProfileIntent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  
  const handleProtectedAction = (action: ProfileIntent) => {
    if (!user) {
      // حفظ Intent في Router state (لا تستخدم sessionStorage مباشرة)
      navigate('/login', {
        state: {
          from: location.pathname,
          intent: action,
          redirectAfterAuth: `/profile/view/${action.profileId}`
        }
      });
    } else {
      // تنفيذ الـaction مباشرة
      executeAction(action);
    }
  };
  
  const executeAction = (action: ProfileIntent) => {
    switch (action.action) {
      case 'contact':
        // فتح نموذج الرسالة
        break;
      case 'book_inspection':
        // فتح calendar للحجز
        break;
      case 'book_test_drive':
        // فتح calendar للتجربة
        break;
      case 'request_quote':
        // فتح نموذج طلب عرض السعر
        break;
      case 'schedule_consultation':
        // فتح calendar للاستشارة
        break;
    }
  };
  
  return { handleProtectedAction };
};
```

#### 5.2 LoginPage redirect logic

```typescript
// في LoginPage.tsx: بعد تسجيل الدخول الناجح

const handleLoginSuccess = (user: User) => {
  const state = location.state as any;
  
  if (state?.intent) {
    // تنفيذ الـintent الأصلي
    const { intent } = state;
    executeIntent(intent);
    
    // ثم التوجيه
    const redirectTo = state?.redirectAfterAuth || '/';
    navigate(redirectTo);
  } else {
    navigate('/');
  }
};
```

---

### 6. الاختبارات (Testing)

#### 6.1 Unit Tests

```typescript
// src/components/profile/__tests__/ProfileShell.test.tsx

import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { ProfileShell } from '../ProfileShell';
import { bulgarianTheme } from '@/styles/theme';

// Mock data
const mockPrivateProfile = {
  id: 'doc-1',
  profileType: 'private',
  name: 'John Doe',
  badges: ['phone_verified'],
  stats: { trustScore: 85, responseRate: 90, avgResponseTime: 5, totalListings: 2 }
  // ... more fields
};

describe('ProfileShell', () => {
  test('renders private profile with orange accent', () => {
    render(
      <ThemeProvider theme={bulgarianTheme}>
        <ProfileShell
          profileType="private"
          profileId="1"
          profileData={mockPrivateProfile}
        >
          <div>Test content</div>
        </ProfileShell>
      </ThemeProvider>
    );
    
    // assert that accent color is applied
    const accentElement = screen.getByRole('button');
    expect(accentElement).toHaveStyle('--accent-color: #FF7A2D');
  });
  
  test('renders dealer profile with green accent', () => {
    const dealerProfile = { ...mockPrivateProfile, profileType: 'dealer' };
    
    render(
      <ThemeProvider theme={bulgarianTheme}>
        <ProfileShell
          profileType="dealer"
          profileId="2"
          profileData={dealerProfile}
        >
          <div>Test content</div>
        </ProfileShell>
      </ThemeProvider>
    );
    
    const accentElement = screen.getByRole('button');
    expect(accentElement).toHaveStyle('--accent-color: #2EB872');
  });
  
  test('renders corporate profile with blue accent', () => {
    const corpProfile = { ...mockPrivateProfile, profileType: 'corporate' };
    
    render(
      <ThemeProvider theme={bulgarianTheme}>
        <ProfileShell
          profileType="corporate"
          profileId="3"
          profileData={corpProfile}
        >
          <div>Test content</div>
        </ProfileShell>
      </ThemeProvider>
    );
    
    const accentElement = screen.getByRole('button');
    expect(accentElement).toHaveStyle('--accent-color: #2B7BFF');
  });
});

describe('ProfileBadges', () => {
  test('displays all badges with correct labels', () => {
    const badges = ['phone_verified', 'identity_verified', 'dealer_verified'];
    
    render(
      <ProfileBadges badges={badges} accentColor="#2EB872" />
    );
    
    expect(screen.getByText('Phone Verified')).toBeInTheDocument();
    expect(screen.getByText('Identity Verified')).toBeInTheDocument();
    expect(screen.getByText('Dealer Verified')).toBeInTheDocument();
  });
});

describe('TrustPanel', () => {
  test('displays trust score and metrics correctly', () => {
    render(
      <TrustPanel profile={mockPrivateProfile} accentColor="#FF7A2D" />
    );
    
    expect(screen.getByText('85')).toBeInTheDocument(); // Trust score
    expect(screen.getByText('90%')).toBeInTheDocument(); // Response rate
    expect(screen.getByText('5m')).toBeInTheDocument(); // Avg response time
  });
});
```

#### 6.2 Integration Tests

```typescript
// src/pages/__tests__/ProfileView.test.tsx

test('private profile loads and displays correctly', async () => {
  // Setup
  const mockProfileData = await profileService.getProfileByNumericId(1);
  
  // Render
  const { container } = render(
    <MemoryRouter initialEntries={['/profile/1']}>
      <ProfileViewPage />
    </MemoryRouter>
  );
  
  // Wait for data load
  await waitFor(() => {
    expect(screen.getByText(mockProfileData.name)).toBeInTheDocument();
  });
  
  // Verify variant rendering
  expect(container.querySelector('[data-variant="private"]')).toBeInTheDocument();
});

test('intent preserved after login', async () => {
  // 1. غير مسجل يضغط "Contact Seller"
  render(<ProfileViewPage />);
  fireEvent.click(screen.getByText('Contact Seller'));
  
  // 2. تم redirect إلى login
  expect(window.location.pathname).toBe('/login');
  
  // 3. تسجيل الدخول
  fireEvent.click(screen.getByText('Login'));
  
  // 4. بعد تسجيل الدخول، يجب أن يعود إلى البروفايل ويفتح الـcontact form
  await waitFor(() => {
    expect(window.location.pathname).toContain('/profile');
    expect(screen.getByRole('dialog', { name: /contact seller/i })).toBeInTheDocument();
  });
});
```

---

### 7. Accessibility Requirements

```typescript
/**
 * Accessibility checks required:
 * 1. Image alt text for all profile pictures, car images
 * 2. Color contrast (WCAG AA minimum)
 * 3. Focus management: Tab order makes sense, focus visible
 * 4. Semantic HTML: Use <button> not <div role="button">
 * 5. ARIA labels for complex regions
 * 6. Keyboard navigation: All interactive elements accessible via keyboard
 * 7. Screen reader testing: With NVDA/JAWS
 */

// Example:
<button
  aria-label={t('profile.private.contact')}
  aria-describedby="contact-help"
  onClick={handleContact}
>
  {t('profile.private.contact')}
</button>
<span id="contact-help" hidden>
  {t('accessibility.contactHelp')}
</span>
```

---

### 8. ملفات التطوير والتقدير الزمني

#### 8.1 الملفات المطلوب إنشاؤها/تحديثها

```
src/
├── components/profile/
│   ├── ProfileShell.tsx                 [جديد]
│   ├── ProfileShell.styles.ts           [جديد]
│   ├── ProfileBadges.tsx                [جديد]
│   ├── TrustPanel.tsx                   [جديد]
│   ├── variants/
│   │   ├── PrivateProfile.tsx           [جديد]
│   │   ├── PrivateProfile.styles.ts     [جديد]
│   │   ├── DealerProfile.tsx            [جديد]
│   │   ├── DealerProfile.styles.ts      [جديد]
│   │   ├── CompanyProfile.tsx           [جديد]
│   │   └── CompanyProfile.styles.ts     [جديد]
│   └── __tests__/
│       ├── ProfileShell.test.tsx        [جديد]
│       ├── ProfileBadges.test.tsx       [جديد]
│       └── TrustPanel.test.tsx          [جديد]
├── components/ui/PageLoader/
│   ├── ProfileLoader.tsx                [جديد]
│   └── ProfileLoader.styles.ts          [جديد]
├── services/profile/
│   ├── profile-service.ts               [جديد]
│   ├── profile-types.ts                 [جديد]
│   └── __tests__/
│       └── profile-service.test.ts      [جديد]
├── hooks/
│   └── useProfileIntent.ts              [جديد]
├── pages/
│   ├── profile/
│   │   ├── ProfileViewPage.tsx          [تحديث أو جديد]
│   │   └── __tests__/
│   │       └── ProfileViewPage.test.tsx [جديد]
├── locales/
│   ├── bg.json                          [تحديث]
│   └── en.json                          [تحديث]
├── types/
│   └── profile.types.ts                 [جديد]
└── styles/
    └── profileTheme.ts                  [جديد]
```

#### 8.2 التقدير الزمني (Estimation)

| Task | Duration | Complexity |
|------|----------|-----------|
| ProfileShell component & theme wiring | 6h | Medium |
| PrivateProfile variant | 6h | Medium |
| DealerProfile variant (carousel + filters) | 10h | High |
| CompanyProfile variant (video + features) | 12h | High |
| ProfileBadges, TrustPanel, reusable components | 4h | Low |
| ProfileLoader & transitions | 4h | Medium |
| ProfileService & Firebase integration | 5h | Medium |
| Intent/Redirect flow | 4h | Medium |
| i18n integration (BG/EN) | 3h | Low |
| Accessibility audit & fixes | 4h | Medium |
| Testing (unit + integration) | 8h | Medium |
| Documentation & code review | 3h | Low |
| **Total** | **~69 hours** | - |

---

### 9. خطوات التنفيذ المرحلية

#### Phase 1: Foundation (Week 1)
1. إنشاء ProfileShell الأساسي وProfileService
2. تحضير types والـ Firebase collection
3. تطبيق المكونات المعاودة الاستخدام (ProfileBadges, TrustPanel)

#### Phase 2: Private & Dealer (Week 2)
1. تنفيذ PrivateProfile variant كاملة
2. تنفيذ DealerProfile variant مع carousel وفلترة

#### Phase 3: Corporate & Polish (Week 3)
1. تنفيذ CompanyProfile variant مع video و corporate features
2. ProfileLoader و transitions
3. Intent/Redirect flow

#### Phase 4: Testing & Localization (Week 4)
1. اختبارات شاملة (unit + integration)
2. i18n كامل (BG/EN)
3. Accessibility audit
4. QA و bug fixes

---

### 10. معايير القبول (Acceptance Criteria)

#### AC1: Profile Rendering
- [ ] ProfileShell يعرّض البيانات الصحيحة حسب `profileType`
- [ ] الألوان المطبّقة صحيحة (برتقالي/أخضر/أزرق)
- [ ] Hero و Gallery يعرضان المحتوى المناسب لكل variant

#### AC2: Trust & Verification
- [ ] شارات التحقق تظهر بصحة
- [ ] TrustPanel يعرّض الإحصائيات بشكل صحيح
- [ ] Tooltips تظهر عند hover على الشارات

#### AC3: Localization
- [ ] جميع النصوص تدعم BG و EN
- [ ] التبديل بين اللغات يعمل بسلاسة
- [ ] No hardcoded strings في JSX

#### AC4: Interactions
- [ ] جميع الأزرار تعمل وتتحقق من المصادقة
- [ ] ProfileLoader يظهر عند التنقل
- [ ] Intent محفوظ بعد تسجيل الدخول

#### AC5: Accessibility
- [ ] WCAG AA compliance
- [ ] الملاحة عبر لوحة المفاتيح تعمل بشكل كامل
- [ ] Screen reader support مختبر

#### AC6: Testing
- [ ] 80%+ code coverage
- [ ] جميع unit tests تمر
- [ ] Integration tests تمر (private + dealer + corporate)

---

### 11. ملاحظات نهائية للمطور

1. **الألوان:** لا تغيّر `#FF7A2D`, `#2EB872`, `#2B7BFF` دون تصريح التصميم
2. **Components تكون reusable:** ProfileBadges و TrustPanel يجب أن تُستخدم في عناصر أخرى
3. **Commits صغيرة:** كل commit = ميزة واحدة (e.g., `profile: add ProfileShell component`)
4. **استخدم semantic HTML:** Button لا Div
5. **اختبر على الهاتف:** خاصة Dealer و Corporate مع carousels والفلترة
6. **Logging:** استخدم `logger-service` لا `console.*`
7. **Path aliases:** استخدم `@/services`, `@/components`, إلخ
8. **TypeScript strict:** No `any` types

---

## 📞 التواصل والدعم

إذا واجهت مشاكل أو أسئلة:
1. تحقق من `CONSTITUTION.md` للمعايير المعمارية
2. اقرأ `.github/copilot-instructions.md` للأنماط والتوافقيات
3. تابع `docs/getting-started/` للموارد الإضافية

---

**ملخص:** هذا البرومت يوفر رؤية شاملة وجاهزة للتنفيذ لنظام البروفايل الثلاثي. ابدأ بـ Phase 1 واتبع الخطوات المرحلية. اطلب تحديثات أو توضيحات عند الحاجة.

**Happy coding! 🚗**
