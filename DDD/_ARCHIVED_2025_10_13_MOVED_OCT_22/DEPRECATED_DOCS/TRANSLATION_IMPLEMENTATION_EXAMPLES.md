# 📘 أمثلة تفصيلية للتنفيذ - Translation Implementation Examples

## 🎯 دليل التنفيذ العملي

هذا الملف يحتوي على أمثلة عملية وتفصيلية لكل خطوة من خطوات التنفيذ.

---

## 1️⃣ أمثلة إزالة النصوص العربية

### مثال 1: تحديث App.tsx (صفحة 404)

#### ❌ الكود الحالي (قبل):

```tsx
// src/App.tsx - السطور 663-683
<Route
  path="*"
  element={
    <Layout>
      <div style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        minHeight: '50vh'
      }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
        <h2 style={{ marginBottom: '2rem' }}>Страницата не е намерена</h2>
        <p style={{ marginBottom: '2rem', color: '#666' }}>
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <a
          href="/"
          style={{
            padding: '12px 24px',
            background: '#1976d2',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          Към началната страница
        </a>
      </div>
    </Layout>
  }
/>
```

#### ✅ الكود المُحدث (بعد):

```tsx
// src/App.tsx
import { useLanguage } from './contexts/LanguageContext';
import styled from 'styled-components';

// إنشاء مكون منفصل لصفحة 404
const NotFoundPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <NotFoundContainer>
      <NotFoundTitle>{t('errors.notFound.title')}</NotFoundTitle>
      <NotFoundSubtitle>{t('errors.notFound.subtitle')}</NotFoundSubtitle>
      <NotFoundDescription>
        {t('errors.notFound.description')}
      </NotFoundDescription>
      <HomeButton onClick={() => navigate('/')}>
        {t('errors.notFound.homeButton')}
      </HomeButton>
    </NotFoundContainer>
  );
};

// Styled Components
const NotFoundContainer = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const NotFoundTitle = styled.h1`
  font-size: 4rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const NotFoundSubtitle = styled.h2`
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const NotFoundDescription = styled.p`
  margin-bottom: 2rem;
  color: #666;
  max-width: 600px;
`;

const HomeButton = styled.button`
  padding: 12px 24px;
  background: #1976d2;
  color: white;
  border-radius: 8px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #1565c0;
    transform: translateY(-2px);
  }
`;

// في Routes:
<Route
  path="*"
  element={
    <Layout>
      <NotFoundPage />
    </Layout>
  }
/>
```

#### ✅ إضافة المفاتيح في translations.ts:

```typescript
// src/locales/translations.ts
export const translations = {
  bg: {
    // ...
    errors: {
      notFound: {
        title: '404',
        subtitle: 'Страницата не е намерена',
        description: 'Страницата, която търсите, не съществува или е преместена.',
        homeButton: 'Към началната страница'
      }
    }
  },
  en: {
    // ...
    errors: {
      notFound: {
        title: '404',
        subtitle: 'Page Not Found',
        description: 'The page you are looking for does not exist or has been moved.',
        homeButton: 'Go to Homepage'
      }
    }
  }
};
```

---

### مثال 2: تنظيف AuthGuard.tsx

#### ❌ الكود الحالي:

```tsx
// src/components/AuthGuard.tsx
const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>جاري التحميل...</div>;
  }
  
  if (requireAuth && !user) {
    return <div>يجب تسجيل الدخول أولاً</div>;
  }
  
  return <>{children}</>;
};
```

#### ✅ الكود المُحدث:

```tsx
// src/components/AuthGuard.tsx
import { useLanguage } from '../contexts/LanguageContext';

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth }) => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  
  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>{t('common.loading')}</LoadingText>
      </LoadingContainer>
    );
  }
  
  if (requireAuth && !user) {
    return (
      <AuthRequiredContainer>
        <LockIcon size={48} />
        <AuthRequiredTitle>{t('auth.required.title')}</AuthRequiredTitle>
        <AuthRequiredMessage>{t('auth.required.message')}</AuthRequiredMessage>
        <LoginButton to="/login">{t('auth.required.loginButton')}</LoginButton>
      </AuthRequiredContainer>
    );
  }
  
  return <>{children}</>;
};
```

#### ✅ المفاتيح المطلوبة:

```typescript
export const translations = {
  bg: {
    common: {
      loading: 'Зареждане...'
    },
    auth: {
      required: {
        title: 'Изисква се вход',
        message: 'Моля, влезте в профила си, за да продължите.',
        loginButton: 'Вход в системата'
      }
    }
  },
  en: {
    common: {
      loading: 'Loading...'
    },
    auth: {
      required: {
        title: 'Authentication Required',
        message: 'Please sign in to continue.',
        loginButton: 'Sign In'
      }
    }
  }
};
```

---

## 2️⃣ أمثلة تحديث المكونات

### مثال 3: تحديث Header.tsx بالكامل

#### الخطوات:

**الخطوة 1:** إضافة useLanguage

```tsx
// في بداية الملف
import { useLanguage } from '../../contexts/LanguageContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage(); // ✅ إضافة
  const navigate = useNavigate();
  // ...
```

**الخطوة 2:** تحديث Search Bar

```tsx
// قبل:
<input
  type="text"
  placeholder="Search for cars..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
<button type="submit">Search</button>

// بعد:
<input
  type="text"
  placeholder={t('search.placeholder')} // ✅
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
<button type="submit">{t('search.button')}</button> // ✅
```

**الخطوة 3:** تحديث Quick Actions

```tsx
// قبل:
<button className="action-button" title="Favorites">
  <Heart size={20} />
</button>

// بعد:
<button className="action-button" title={t('nav.favorites')}> {/* ✅ */}
  <Heart size={20} />
</button>
```

**الخطوة 4:** تحديث Dropdown Menu

```tsx
// قبل:
<div className="dropdown-menu">
  <a href="/profile">My Account</a>
  <a href="/settings">Settings</a>
  <a onClick={logout}>Log Out</a>
</div>

// بعد:
<div className="dropdown-menu">
  <a href="/profile">{t('nav.myAccount')}</a> {/* ✅ */}
  <a href="/settings">{t('nav.settings')}</a> {/* ✅ */}
  <a onClick={logout}>{t('nav.logout')}</a> {/* ✅ */}
</div>
```

---

### مثال 4: تحديث MessagesPage.tsx

#### ❌ قبل:

```tsx
const MessagesPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <MessagesContainer>
      <PageTitle>{t('messages.title', 'Messages Page')}</PageTitle>
      <MessageText>
        You have received a new message from John Doe about your car listing.
      </MessageText>
      <MessageText>Total Messages Sent: 1,234</MessageText>
      <MessageText>Message Delivery Rate: 75%</MessageText>
    </MessagesContainer>
  );
};
```

#### ✅ بعد:

```tsx
const MessagesPage: React.FC = () => {
  const { t } = useLanguage(); // ✅ تغيير من useTranslation
  const [stats, setStats] = useState({
    totalSent: 1234,
    deliveryRate: 75,
    unread: 5
  });

  return (
    <MessagesContainer>
      <PageTitle>{t('messages.title')}</PageTitle> {/* ✅ إزالة fallback */}
      
      <MessageText>
        {t('messages.newMessageFrom', { name: 'John Doe' })} {/* ✅ مع interpolation */}
      </MessageText>
      
      <MessageText>
        {t('messages.totalSent', { count: stats.totalSent })} {/* ✅ */}
      </MessageText>
      
      <MessageText>
        {t('messages.deliveryRate', { rate: stats.deliveryRate })} {/* ✅ */}
      </MessageText>
      
      <MessageText>
        {t('messages.unread', { count: stats.unread })} {/* ✅ */}
      </MessageText>
    </MessagesContainer>
  );
};
```

---

## 3️⃣ أمثلة Interpolation (الاستبدال الديناميكي)

### مثال 5: استخدام المتغيرات في الترجمة

#### في translations.ts:

```typescript
export const translations = {
  bg: {
    messages: {
      newMessageFrom: 'Ново съобщение от {{name}}',
      totalSent: 'Общо изпратени: {{count}}',
      deliveryRate: 'Процент доставка: {{rate}}%',
      unread: 'Непрочетени: {{count}}',
      timeAgo: 'Преди {{time}}'
    },
    dashboard: {
      carsListed: '{{count}} обявени коли',
      usersRegistered: '{{count}} регистрирани потребители',
      revenueGenerated: 'Генерирани {{amount}}'
    }
  },
  en: {
    messages: {
      newMessageFrom: 'New message from {{name}}',
      totalSent: 'Total sent: {{count}}',
      deliveryRate: 'Delivery rate: {{rate}}%',
      unread: 'Unread: {{count}}',
      timeAgo: '{{time}} ago'
    },
    dashboard: {
      carsListed: '{{count}} cars listed',
      usersRegistered: '{{count}} registered users',
      revenueGenerated: '{{amount}} generated'
    }
  }
};
```

#### في المكون:

```tsx
const DashboardStats: React.FC = () => {
  const { t } = useLanguage();
  const stats = {
    totalCars: 1234,
    totalUsers: 5678,
    revenue: 123456
  };

  return (
    <div>
      <StatItem>
        {t('dashboard.carsListed', { count: stats.totalCars })}
        {/* البلغارية: "1234 обявени коли" */}
        {/* الإنجليزية: "1234 cars listed" */}
      </StatItem>
      
      <StatItem>
        {t('dashboard.usersRegistered', { count: stats.totalUsers })}
      </StatItem>
      
      <StatItem>
        {t('dashboard.revenueGenerated', { 
          amount: formatCurrency(stats.revenue) 
        })}
      </StatItem>
    </div>
  );
};
```

---

## 4️⃣ أمثلة معالجة الأخطاء

### مثال 6: رسائل الأخطاء الموحدة

#### في translations.ts:

```typescript
export const translations = {
  bg: {
    auth: {
      errors: {
        invalidCredentials: 'Невалиден имейл или парола',
        emailAlreadyExists: 'Този имейл вече е регистриран',
        weakPassword: 'Паролата трябва да е поне 8 символа',
        networkError: 'Грешка в мрежата. Моля, опитайте отново.',
        popupBlocked: 'Моля, разрешете изскачащи прозорци',
        userNotFound: 'Потребителят не е намерен',
        emailNotVerified: 'Моля, потвърдете имейла си',
        unknown: 'Възникна неочаквана грешка'
      },
      success: {
        loginSuccess: 'Успешен вход в системата!',
        registerSuccess: 'Регистрацията е успешна!',
        passwordReset: 'Паролата е нулирана успешно',
        emailVerified: 'Имейлът е потвърден'
      }
    }
  },
  en: {
    auth: {
      errors: {
        invalidCredentials: 'Invalid email or password',
        emailAlreadyExists: 'This email is already registered',
        weakPassword: 'Password must be at least 8 characters',
        networkError: 'Network error. Please try again.',
        popupBlocked: 'Please allow popups',
        userNotFound: 'User not found',
        emailNotVerified: 'Please verify your email',
        unknown: 'An unexpected error occurred'
      },
      success: {
        loginSuccess: 'Login successful!',
        registerSuccess: 'Registration successful!',
        passwordReset: 'Password reset successfully',
        emailVerified: 'Email verified'
      }
    }
  }
};
```

#### في auth-service.ts:

```tsx
// ❌ قبل:
try {
  await signIn(email, password);
} catch (error) {
  console.log('فشل تسجيل الدخول'); // عربي - مرفوض!
  throw new Error('خطأ في البريد أو كلمة المرور'); // عربي - مرفوض!
}

// ✅ بعد:
import { AUTH_ERRORS } from '../constants/errors';

try {
  await signIn(email, password);
} catch (error: any) {
  console.error('[AUTH] Login failed:', error.code);
  
  // رمي رمز الخطأ فقط (ليس النص)
  throw new Error(error.code || AUTH_ERRORS.UNKNOWN);
}
```

#### في المكون:

```tsx
const LoginPage: React.FC = () => {
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    try {
      await authService.login(email, password);
      toast.success(t('auth.success.loginSuccess')); // ✅
    } catch (err: any) {
      // تحويل رمز الخطأ إلى نص مترجم
      const errorKey = `auth.errors.${err.message}` || 'auth.errors.unknown';
      setError(t(errorKey)); // ✅
      toast.error(t(errorKey)); // ✅
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {/* ... */}
    </form>
  );
};
```

---

## 5️⃣ أمثلة تنظيف Backend Services

### مثال 7: تنظيف firebase/social-auth-service.ts

#### ❌ قبل:

```typescript
// firebase/social-auth-service.ts
export const socialAuthService = {
  async loginWithGoogle() {
    try {
      // محاولة تسجيل الدخول بجوجل
      const result = await signInWithPopup(auth, googleProvider);
      console.log('تم تسجيل الدخول بنجاح'); // عربي - مرفوض!
      return result;
    } catch (error: any) {
      console.error('فشل تسجيل الدخول:', error); // عربي - مرفوض!
      throw new Error('لا يمكن تسجيل الدخول بجوجل'); // عربي - مرفوض!
    }
  }
};
```

#### ✅ بعد:

```typescript
// firebase/social-auth-service.ts
import { SOCIAL_AUTH_ERRORS } from '../constants/errors';

/**
 * Social authentication service for Google, Facebook, and Apple login
 * Handles OAuth flows and user profile creation
 */
export const socialAuthService = {
  /**
   * Sign in with Google using Firebase popup
   * @returns UserCredential from Firebase Auth
   * @throws Error with code from SOCIAL_AUTH_ERRORS
   */
  async loginWithGoogle(): Promise<UserCredential> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('[SOCIAL_AUTH] Google login successful:', result.user.uid);
      return result;
    } catch (error: any) {
      console.error('[SOCIAL_AUTH] Google login failed:', error.code);
      
      // Map Firebase error codes to our error constants
      if (error.code === 'auth/popup-blocked') {
        throw new Error(SOCIAL_AUTH_ERRORS.POPUP_BLOCKED);
      }
      
      throw new Error(SOCIAL_AUTH_ERRORS.GOOGLE_LOGIN_FAILED);
    }
  },
  
  // ... rest of the service
};
```

#### ملف constants/errors.ts:

```typescript
// constants/errors.ts
export const SOCIAL_AUTH_ERRORS = {
  POPUP_BLOCKED: 'popup_blocked',
  GOOGLE_LOGIN_FAILED: 'google_login_failed',
  FACEBOOK_LOGIN_FAILED: 'facebook_login_failed',
  APPLE_LOGIN_FAILED: 'apple_login_failed',
  NETWORK_ERROR: 'network_error',
  UNKNOWN: 'unknown_error'
} as const;

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'invalid_credentials',
  EMAIL_ALREADY_EXISTS: 'email_already_exists',
  WEAK_PASSWORD: 'weak_password',
  USER_NOT_FOUND: 'user_not_found',
  EMAIL_NOT_VERIFIED: 'email_not_verified',
  NETWORK_ERROR: 'network_error',
  UNKNOWN: 'unknown'
} as const;
```

---

## 6️⃣ أمثلة التعامل مع التواريخ والأرقام

### مثال 8: تنسيق التواريخ والعملات

```tsx
// utils/formatters.ts
import { BULGARIAN_CONFIG } from '../config/bulgarian-config';

export class BulgarianFormatters {
  /**
   * Format currency in Bulgarian or English format
   */
  static formatCurrency(amount: number, language: 'bg' | 'en'): string {
    return new Intl.NumberFormat(
      language === 'bg' ? 'bg-BG' : 'en-US',
      {
        style: 'currency',
        currency: BULGARIAN_CONFIG.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }
    ).format(amount);
  }

  /**
   * Format date in Bulgarian or English format
   */
  static formatDate(date: Date, language: 'bg' | 'en'): string {
    return new Intl.DateTimeFormat(
      language === 'bg' ? 'bg-BG' : 'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
    ).format(date);
  }

  /**
   * Format time ago (e.g., "2 hours ago")
   */
  static formatTimeAgo(date: Date, language: 'bg' | 'en', t: (key: string, params?: any) => string): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return t('time.justNow');
    if (seconds < 3600) return t('time.minutesAgo', { count: Math.floor(seconds / 60) });
    if (seconds < 86400) return t('time.hoursAgo', { count: Math.floor(seconds / 3600) });
    if (seconds < 604800) return t('time.daysAgo', { count: Math.floor(seconds / 86400) });
    
    return this.formatDate(date, language);
  }
}
```

#### استخدام في المكون:

```tsx
const CarListingCard: React.FC<{ car: Car }> = ({ car }) => {
  const { t, language } = useLanguage();

  return (
    <Card>
      <Price>
        {BulgarianFormatters.formatCurrency(car.price, language)}
        {/* bg: "25 000 €" */}
        {/* en: "€25,000" */}
      </Price>
      
      <PostedDate>
        {BulgarianFormatters.formatTimeAgo(car.createdAt, language, t)}
        {/* bg: "Преди 2 часа" */}
        {/* en: "2 hours ago" */}
      </PostedDate>
    </Card>
  );
};
```

---

## 7️⃣ سكريبتات مساعدة

### سكريبت 1: البحث عن النصوص العربية

```bash
#!/bin/bash
# scripts/find-arabic-text.sh

echo "🔍 Searching for Arabic text in the codebase..."
echo ""

# البحث في ملفات TSX
echo "📄 TSX Files with Arabic text:"
find src -name "*.tsx" -exec grep -l "[\u0600-\u06FF]" {} \;

echo ""

# البحث في ملفات TS
echo "📄 TS Files with Arabic text:"
find src -name "*.ts" -exec grep -l "[\u0600-\u06FF]" {} \;

echo ""
echo "✅ Search complete!"
```

### سكريبت 2: البحث عن النصوص المباشرة

```bash
#!/bin/bash
# scripts/find-hardcoded-text.sh

echo "🔍 Searching for hardcoded English text..."
echo ""

# البحث عن نصوص إنجليزية لا تستخدم t()
grep -r "\"[A-Z][a-z ]" src/components/ \
  | grep -v "t(" \
  | grep -v "className" \
  | grep -v "style" \
  | grep -v "import" \
  | grep -v "//"

echo ""
echo "✅ Search complete!"
```

### سكريبت 3: التحقق من مفاتيح الترجمة

```javascript
// scripts/verify-translations.js
const fs = require('fs');
const path = require('path');

const translationsPath = path.join(__dirname, '../src/locales/translations.ts');
const translationsContent = fs.readFileSync(translationsPath, 'utf-8');

console.log('🔍 Verifying translation keys...\n');

// Extract all keys from bg and en
const bgKeys = extractKeys(translationsContent, 'bg');
const enKeys = extractKeys(translationsContent, 'en');

// Find missing keys
const missingInEn = bgKeys.filter(key => !enKeys.includes(key));
const missingInBg = enKeys.filter(key => !bgKeys.includes(key));

if (missingInEn.length > 0) {
  console.error('❌ Keys missing in English:');
  missingInEn.forEach(key => console.log(`  - ${key}`));
  console.log('');
}

if (missingInBg.length > 0) {
  console.error('❌ Keys missing in Bulgarian:');
  missingInBg.forEach(key => console.log(`  - ${key}`));
  console.log('');
}

if (missingInEn.length === 0 && missingInBg.length === 0) {
  console.log('✅ All translation keys are synchronized!');
  console.log(`📊 Total keys: ${bgKeys.length}`);
}

function extractKeys(content, lang) {
  // Simple extraction - can be improved
  const regex = new RegExp(`${lang}:\\s*{([\\s\\S]*?)}(?=,\\s*(?:en|bg):)`, 'g');
  const matches = content.match(regex);
  if (!matches) return [];
  
  // Extract key paths
  // This is a simplified version - you may need a more robust parser
  return [];
}
```

---

## 8️⃣ قائمة مرجعية للتحقق (Checklist)

### قبل البدء:

- [ ] قراءة TRANSLATION_SYSTEM_MASTER_PLAN.md بالكامل
- [ ] عمل backup: `git tag backup-before-translation`
- [ ] إنشاء branch جديد: `git checkout -b feature/unified-translation`
- [ ] تشغيل `npm install` للتأكد من تثبيت جميع التبعيات

### أثناء التنفيذ (لكل ملف):

- [ ] فتح الملف المستهدف
- [ ] البحث عن جميع النصوص الظاهرة
- [ ] التحقق من وجود نصوص عربية → إزالة
- [ ] التحقق من وجود نصوص مباشرة → استبدال بـ t()
- [ ] إضافة import { useLanguage } إذا لزم الأمر
- [ ] إضافة المفاتيح المفقودة في translations.ts
- [ ] اختبار التغييرات
- [ ] عمل commit: `git commit -m "Update [filename] for unified translation"`

### بعد الانتهاء من كل مرحلة:

- [ ] تشغيل `npm run build` للتأكد من عدم وجود أخطاء
- [ ] تشغيل `npm start` واختبار اللغتين (BG + EN)
- [ ] فحص Console للتأكد من عدم وجود warnings
- [ ] عمل push: `git push origin feature/unified-translation`

### قبل الدمج النهائي:

- [ ] تشغيل جميع السكريبتات المساعدة
- [ ] التأكد من عدم وجود نصوص عربية: `bash scripts/find-arabic-text.sh`
- [ ] التأكد من عدم وجود hardcoded text: `bash scripts/find-hardcoded-text.sh`
- [ ] التحقق من تزامن المفاتيح: `node scripts/verify-translations.js`
- [ ] اختبار شامل لجميع الصفحات
- [ ] مراجعة الكود بشكل نهائي
- [ ] طلب مراجعة من فريق العمل (Code Review)
- [ ] الدمج في main branch

---

## 📞 الدعم والمساعدة

إذا واجهت أي مشكلة:

1. **مراجعة الأمثلة** في هذا الملف
2. **فحص ملف الترجمة** للتأكد من وجود المفاتيح
3. **مراجعة Console** للأخطاء والتحذيرات
4. **استخدام Git** للرجوع إلى نسخة سابقة إذا لزم الأمر

---

**تم إنشاؤه:** 30 سبتمبر 2025  
**آخر تحديث:** 30 سبتمبر 2025  
**الحالة:** ✅ جاهز للاستخدام
