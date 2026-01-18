# 🚀 دليل المطور السريع - المكونات الجديدة
## 17 يناير 2026

---

## 📦 المكونات المتاحة

### 1. SellerDashboardPage
**الموقع:** `src/pages/09_dealer-company/SellerDashboardPage.tsx`

#### الاستخدام
```tsx
import SellerDashboardPage from '@/pages/09_dealer-company/SellerDashboardPage';

// في المسار
<Route path="/seller-dashboard" element={<SellerDashboardPage />} />
```

#### Props
```tsx
// لا يوجد props - يستخدم useAuth و useLanguage internally
```

#### المميزات
- 📊 عرض إحصائيات البائع (5 بطاقات)
- 🔔 نظام التنبيهات (warning/error/info)
- ✅ إدارة المهام
- 📈 معدلات الاستجابة
- 🌍 دعم لغات متعدد

#### الاعتماديات
```tsx
- useAuth() Context
- useLanguage() Context
- dealerDashboardService (مع fallback)
```

---

### 2. PriceSuggestionWidget
**الموقع:** `src/components/Pricing/PriceSuggestionWidget.tsx`

#### الاستخدام
```tsx
import PriceSuggestionWidget from '@/components/Pricing/PriceSuggestionWidget';

<PriceSuggestionWidget
  carId="car-123"
  currentPrice={15000}
  carData={{
    brand: "BMW",
    model: "X5",
    year: 2020,
    mileage: 45000,
    condition: "excellent",
    location: "Sofia"
  }}
  onApplyPrice={(price) => {
    console.log('Applied price:', price);
  }}
  size="medium"
/>
```

#### Props
```tsx
interface PriceSuggestionWidgetProps {
  carId: string;                    // معرّف السيارة
  currentPrice: number;             // السعر الحالي بالـ EUR
  carData: {
    brand: string;
    model: string;
    year: number;
    mileage: number;
    condition: string;
    location: string;
  };
  onApplyPrice?: (price: number) => void;  // callback عند تطبيق السعر
  size?: 'small' | 'medium' | 'large';
}
```

#### المميزات
- 💰 توصيات أسعار ذكية
- 📊 مقارنة مع السعر الحالي
- 📈 نطاق أسعار مقترح
- 🎯 مؤشر ثقة (0-100%)
- 🎨 تصميم Glassmorphism

#### الحالات الاستخدام
```tsx
// في صفحة تعديل السعر
<PriceSuggestionWidget
  carId={carId}
  currentPrice={car.price}
  carData={car}
  onApplyPrice={handlePriceUpdate}
  size="large"
/>

// في dashboard البائع (مصغر)
<PriceSuggestionWidget
  carId={car.id}
  currentPrice={car.price}
  carData={car}
  size="small"
/>
```

---

### 3. ImageVerificationBadge
**الموقع:** `src/components/Images/ImageVerificationBadge.tsx`

#### الاستخدام
```tsx
import ImageVerificationBadge from '@/components/Images/ImageVerificationBadge';

// نسخة عادية
<ImageVerificationBadge
  status="verified"
  confidence={95}
  isOriginal={true}
  qualityScore={88}
  onClick={() => console.log('Badge clicked')}
/>

// نسخة مضغوطة
<ImageVerificationBadge
  status="verified"
  compact={true}
  showLabel={true}
/>
```

#### Props
```tsx
interface ImageVerificationBadgeProps {
  status: 'verified' | 'processing' | 'unverified' | 'suspicious';
  confidence?: number;              // 0-100
  isOriginal?: boolean;
  qualityScore?: number;            // 0-100
  onClick?: () => void;
  compact?: boolean;                // تقليل الحجم
  showLabel?: boolean;              // إخفاء النص
}
```

#### الحالات الاستخدام
```tsx
// حالة التحقق الناجح
<ImageVerificationBadge
  status="verified"
  confidence={95}
  isOriginal={true}
  qualityScore={92}
/>

// أثناء المعالجة
<ImageVerificationBadge
  status="processing"
/>

// صورة مريبة
<ImageVerificationBadge
  status="suspicious"
  confidence={45}
/>

// شارة صغيرة في الجالري
<ImageVerificationBadge
  status="verified"
  compact={true}
  showLabel={false}
/>
```

#### الحالات المرئية
- ✅ **Verified** (أخضر) - تم التحقق
- ⏳ **Processing** (أصفر) - قيد المعالجة
- ❌ **Unverified** (رمادي) - غير معين
- 🚩 **Suspicious** (أحمر) - مريب

---

### 4. LandingNavigation
**الموقع:** `src/components/Navigation/LandingNavigation.tsx`

#### الاستخدام
```tsx
import LandingNavigation from '@/components/Navigation/LandingNavigation';

// في رأس الصفحة
<header>
  <Logo />
  <LandingNavigation compact={false} />
  <UserMenu />
</header>
```

#### Props
```tsx
interface LandingNavProps {
  className?: string;
  compact?: boolean;
}
```

#### الروابط المتضمنة
1. **Browse Cars** - `/search`
2. **Why Us** - `/why-us`
3. **Launch Offer** - `/launch-offer`
4. **Comparison** - `/competitive-comparison`
5. **Sell Car** - `/sell`

---

## 🔧 الخدمات المتاحة

### dealerDashboardService
```tsx
import { dealerDashboardService } from '@/services/dealer/dealer-dashboard.service';

// الطرق المتاحة
await dealerDashboardService.getStats(userId);        // الإحصائيات
await dealerDashboardService.getAlerts(userId);       // التنبيهات
await dealerDashboardService.getTasks(userId);        // المهام
```

---

## 🎨 معايير التصميم

### الألوان
```tsx
// Primary
#3b82f6  // أزرق
#667eea  // أرجواني
#764ba2  // أرجواني داكن

// Success
#10b981  // أخضر
#4ade80  // أخضر فاتح

// Warning
#f59e0b  // أصفر

// Danger
#ef4444  // أحمر
```

### الأيقونات
```tsx
import {
  CheckSquare,
  DollarSign,
  Verified,
  TrendingUp,
  Eye,
  AlertCircle,
  // ... من lucide-react
} from 'lucide-react';
```

### الخطوط
```tsx
// Heading
font-size: 32px
font-weight: 800
letter-spacing: -0.5px

// Body
font-size: 14px
font-weight: 400
line-height: 1.5
```

---

## 📱 الاستجابة

### Breakpoints
```tsx
480px   // الهاتف
768px   // الجهاز اللوحي
1024px  // اللابتوب
1440px  // الشاشات الكبيرة
```

### مثال الاستجابة
```tsx
const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;
```

---

## 🌍 دعم اللغات

جميع المكونات تدعم اللغات عبر `useLanguage()` Context:

```tsx
const { language } = useLanguage();

const text = language === 'bg' ? labels.bg : labels.en;
```

**اللغات المدعومة:**
- 🇧🇬 Bulgarian (bg)
- 🇬🇧 English (en)

---

## 🔒 الأمان

### التحقق من الإدخال
```tsx
// Validation
if (!user?.uid) return;
if (confidence < 0 || confidence > 100) {
  confidence = 0;
}
```

### معالجة الأخطاء
```tsx
try {
  // العملية
} catch (error) {
  // Use fallback data
  setStats(mockStats);
} finally {
  setLoading(false);
}
```

---

## 📊 الأداء

### Lazy Loading
```tsx
const SellerDashboardPage = safeLazy(() => 
  import('@/pages/09_dealer-company/SellerDashboardPage')
);
```

### Memoization
```tsx
export const MemoComponent = React.memo(MyComponent);
```

---

## 🧪 الاختبار

### مثال اختبار
```tsx
import { render, screen } from '@testing-library/react';
import SellerDashboardPage from '@/pages/09_dealer-company/SellerDashboardPage';

test('renders dashboard', () => {
  render(<SellerDashboardPage />);
  expect(screen.getByText('Seller Dashboard')).toBeInTheDocument();
});
```

---

## 🐛 الأخطاء الشائعة

### ❌ خطأ: استيراد غير صحيح
```tsx
// ❌ خطأ
import ImageVerificationBadge from './ImageVerificationBadge';

// ✅ صحيح
import ImageVerificationBadge from '@/components/Images/ImageVerificationBadge';
```

### ❌ خطأ: نسيان useAuth
```tsx
// ❌ خطأ - الصفحة ستفشل بدون مستخدم
const { user } = useAuth();

// ✅ صحيح - يجب التحقق
if (!user) return <div>Please login</div>;
```

### ❌ خطأ: أسماء الأيقونات الخاطئة
```tsx
// ❌ خطأ
import { ImageCheck, Bank, VerifiedIcon } from 'lucide-react';

// ✅ صحيح
import { CheckSquare, DollarSign, Verified } from 'lucide-react';
```

---

## 💡 النصائح والحيل

### 1. استخدام Mock Data أثناء التطوير
```tsx
const mockStats = {
  activeListings: 5,
  totalViews: 1200,
  // ...
};
```

### 2. تطبيق Responsive بسهولة
```tsx
const ResponsiveContainer = styled.div`
  @media (max-width: 768px) {
    padding: 16px; // أصغر على الجوال
  }
  @media (min-width: 1024px) {
    padding: 24px; // أكبر على الشاشات الكبيرة
  }
`;
```

### 3. اختبار اللغات المتعددة
```tsx
// اختبر بـ language = 'bg' و language = 'en'
const { language } = useLanguage();
```

---

## 🚀 البدء السريع

```bash
# 1. تثبيت المعتمدات
npm install

# 2. بدء السيرفر
npm start

# 3. زيارة الصفحات
# - http://localhost:3000/seller-dashboard
# - http://localhost:3000/why-us
# - http://localhost:3000/launch-offer
# - http://localhost:3000/competitive-comparison

# 4. تشغيل الاختبارات
npm test

# 5. البناء للإنتاج
npm run build
```

---

## 📚 الموارد

- **TypeScript Docs:** https://www.typescriptlang.org/docs/
- **React Docs:** https://react.dev/
- **Styled-Components:** https://styled-components.com/
- **Lucide Icons:** https://lucide.dev/

---

## 📞 الدعم والمساعدة

إذا واجهت مشكلة:
1. تحقق من `TESTING_CHECKLIST_JAN17_2026.md`
2. راجع الأخطاء الشائعة أعلاه
3. تحقق من قيم Props المطلوبة
4. تأكد من استيراد المكونات بشكل صحيح

---

**آخر تحديث:** 17 يناير 2026  
**الإصدار:** v2.0.0-beta  
**الحالة:** ✅ جاهز للاستخدام  

🎉 **استمتع بالترميز!**
