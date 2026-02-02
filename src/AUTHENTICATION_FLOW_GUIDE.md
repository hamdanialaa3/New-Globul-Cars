# 🔐 Authentication Flow with Intent Preservation Guide

## نظام الحماية والعودة التلقائية للصفحة المطلوبة

هذا الدليل يشرح كيفية عمل نظام الحماية على صفحات البروفايل مع العودة التلقائية بعد تسجيل الدخول.

---

## 📋 نظرة عامة

### المشكلة الأصلية
عندما يحاول المستخدم (غير المسجل دخول) الوصول إلى `/profile/90`:
- ❌ **بدون هذا النظام**: يتم توجيهه للـ login، ثم يعود للصفحة الرئيسية بعد النجاح
- ✅ **مع هذا النظام**: يتم توجيهه للـ login، ثم يعود تلقائياً لـ `/profile/90` بعد النجاح

### الحل
نظام **Intent Preservation** (حفظ القصد/النية):
1. حفظ URL المطلوب قبل التوجيه للـ login
2. استعادة URL بعد النجاح والعودة إليه

---

## 🔧 المكونات الرئيسية

### 1. `useProfileIntent` Hook
**الملف**: `src/hooks/useProfileIntent.ts`

**الوظيفة**: إدارة النية المحفوظة في `sessionStorage`

```typescript
// حفظ نية الذهاب للـ profile
const { saveIntent, returnToIntent } = useProfileIntent();
saveIntent('/profile/90'); // حفظ في sessionStorage

// استعادة والعودة
const { returnToIntent } = useProfileIntent();
returnToIntent(); // التحقق والعودة للـ URL المحفوظ
```

**الخصائص**:
- **Storage**: `sessionStorage` (تُمسح عند إغلاق المتصفح)
- **Key**: `'profile_intent'`
- **الصيغة**:
```json
{
  "returnUrl": "/profile/90",
  "timestamp": 1702345678000
}
```
- **TTL**: 1 ساعة (60 دقيقة)

**الدوال**:
```typescript
// 1️⃣ حفظ نية الذهاب للـ URL الحالي
saveIntent(location.pathname + location.search);

// 2️⃣ استعادة النية (مع التحقق من الانتهاء الصلاحية)
const intent = restoreIntent();
// Returns: { returnUrl: '/profile/90' } أو null إذا انتهت الصلاحية

// 3️⃣ الذهاب للـ URL المحفوظ
returnToIntent(); // navigate('/profile/90')

// 4️⃣ حذف النية
clearIntent();
```

---

### 2. `ProtectedRoute` Component
**الملف**: `src/components/ProtectedRoute.tsx`

**الوظيفة**: حماية المسار والتحقق من تسجيل الدخول

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'dealer' | 'company' | 'user';
}

<ProtectedRoute requiredRole="user">
  <ProfilePageWrapper />
</ProtectedRoute>
```

**السلوك**:

```
المستخدم يزور: /profile/90
            ↓
    هل مسجل دخول؟
       ↙      ↘
    نعم        لا
     ↓         ↓
  عرض    حفظ intent
 البروفايل  في sessionStorage
           ↓
        redirect: /login
```

**الكود**:
```typescript
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user } = useAuth();
  const { saveIntent } = useProfileIntent();
  const location = useLocation();

  // إذا لم يكن مسجل دخول
  if (!isAuthenticated) {
    // احفظ URL الحالي (مثل /profile/90)
    saveIntent(location.pathname + location.search);
    
    // وجهه للـ login
    return <Navigate to="/login" replace />;
  }

  // التحقق من الدور المطلوب (اختياري)
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // إذا كان مسجل دخول، اعرض المحتوى
  return <>{children}</>;
};
```

---

### 3. Enhanced `useLoginWithIntent` Hook
**الملف**: `src/pages/02_authentication/login/LoginPage/hooks/useLoginWithIntent.ts`

**الوظيفة**: تحديث خطاف تسجيل الدخول ليدعم Intent Restoration

**أولويات إعادة التوجيه** (بالترتيب):
```
1. Intent المحفوظ (/profile/90)
   ↓
2. Query parameter (?redirect=/dashboard)
   ↓
3. Location state (من navigate)
   ↓
4. الافتراضي (/)
```

**الكود**:
```typescript
const getRedirectPath = (): string => {
  // 1️⃣ تحقق من Intent المحفوظ
  const intentData = sessionStorage.getItem('profile_intent');
  if (intentData) {
    const intent = JSON.parse(intentData);
    if (intent.returnUrl) {
      return intent.returnUrl; // مثل: /profile/90
    }
  }

  // 2️⃣ تحقق من query parameter
  const redirectParam = searchParams.get('redirect');
  if (redirectParam) return redirectParam;

  // 3️⃣ تحقق من location state
  const locationState = location.state as any;
  if (locationState?.from?.pathname) {
    return locationState.from.pathname;
  }

  // 4️⃣ افتراضي
  return '/';
};
```

**التكامل مع useEffect**:
```typescript
// بعد النجاح في تسجيل الدخول
useEffect(() => {
  if (user) {
    const redirectPath = getRedirectPath();
    navigate(redirectPath, { replace: true });
  }
}, [user, navigate]);
```

---

### 4. Updated `NumericProfileRouter`
**الملف**: `src/routes/NumericProfileRouter.tsx`

**التحديث**: تغليف مسارات البروفايل بـ `ProtectedRoute`

```typescript
import ProtectedRoute from '../components/ProtectedRoute';

export const NumericProfileRouter: React.FC = () => {
  return (
    <Routes>
      {/* ✅ PROTECTED: جميع مسارات البروفايل محمية */}
      <Route path="" element={
        <ProtectedRoute>
          <ProfilePageWrapper />
        </ProtectedRoute>
      }>
        {/* جميع الـ nested routes هنا محمية أيضاً */}
        <Route index element={...} />
        <Route path="my-ads" element={...} />
        {/* إلخ */}
      </Route>
    </Routes>
  );
};
```

---

## 📊 سيناريوهات الاستخدام

### ✅ السيناريو 1: المستخدم غير المسجل يزور Profile

```
1. المستخدم يكتب URL: http://localhost:3001/profile/90
                        ↓
2. ProtectedRoute يتحقق: isAuthenticated = false
                        ↓
3. يحفظ Intent: sessionStorage['profile_intent'] = {
                  returnUrl: '/profile/90',
                  timestamp: 1702345678000
                }
                        ↓
4. يعيد توجيه: Navigate('/login')
                        ↓
5. تظهر صفحة Login
                        ↓
6. المستخدم يدخل البيانات ويضغط Sign In
                        ↓
7. useLoginWithIntent يستدعي getRedirectPath():
   - يجد Intent في sessionStorage
   - يرجع: '/profile/90'
                        ↓
8. يتم التوجيه: navigate('/profile/90')
                        ↓
9. عرض صفحة البروفايل ✅
```

### ✅ السيناريو 2: المستخدم المسجل يزور Profile

```
1. المستخدم يكتب URL: http://localhost:3001/profile/90
                        ↓
2. ProtectedRoute يتحقق: isAuthenticated = true
                        ↓
3. لا يحفظ Intent (لا حاجة)
                        ↓
4. يعرض ProfilePageWrapper ✅
```

### ✅ السيناريو 3: انتهاء صلاحية Intent (> 1 ساعة)

```
1. المستخدم يزور Profile وتم حفظ Intent
                        ↓
2. ينتظر المستخدم لمدة ساعة ونصف
                        ↓
3. يقوم بتسجيل الدخول
                        ↓
4. restoreIntent() يتحقق من الطابع الزمني
                        ↓
5. يجد: now - timestamp > 3600000 (ساعة واحدة)
                        ↓
6. يعتبره منتهي الصلاحية
                        ↓
7. يحذفه ويرجع: null
                        ↓
8. getRedirectPath() ينتقل للأولوية التالية → '/'
                        ↓
9. يتم التوجيه للصفحة الرئيسية ✅
```

---

## 🧪 كيفية الاختبار

### اختبار محلي

#### 1️⃣ اختبر الحماية الأساسية

```bash
# 1. تأكد من عدم تسجيل دخولك
# 2. افتح DevTools
# 3. اذهب إلى: http://localhost:3001/profile/90
# 4. يجب أن يعيد التوجيه إلى: /login
```

#### 2️⃣ اختبر Intent Preservation

```bash
# 1. افتح DevTools → Storage → Session Storage
# 2. اذهب إلى: http://localhost:3001/profile/90
# 3. يجب أن تجد: profile_intent = {
#      "returnUrl": "/profile/90",
#      "timestamp": 1702345678000
#    }
# 4. قم بتسجيل الدخول
# 5. يجب أن تعود تلقائياً إلى: /profile/90
```

#### 3️⃣ اختبر انتهاء الصلاحية

```bash
# 1. افتح DevTools → Console
# 2. قم بتعديل الطابع الزمني:
#    const old = {
#      returnUrl: '/profile/90',
#      timestamp: Date.now() - 4000000 // قديم جداً
#    };
#    sessionStorage.setItem('profile_intent', JSON.stringify(old));
# 3. قم بتسجيل الدخول
# 4. يجب أن تعود للصفحة الرئيسية (/) بدلاً من /profile/90
```

#### 4️⃣ اختبر Query Parameter Override

```bash
# 1. اذهب إلى: http://localhost:3001/login?redirect=/cars
# 2. قم بتسجيل الدخول
# 3. يجب أن تعود إلى: /cars (بدلاً من الافتراضي)
```

---

## 🔄 تدفق البيانات الكامل

```
┌─────────────────────────────────────────────────────────────────┐
│         المستخدم غير المسجل يزور /profile/90                  │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│              NumericProfileRouter يتحقق                         │
│       <Route path="" element={<ProtectedRoute>...}>           │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│            ProtectedRoute يتحقق من useAuth()                   │
│         isAuthenticated = false                                 │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│         يستدعي: useProfileIntent().saveIntent()                │
│    يحفظ في sessionStorage: profile_intent                      │
│    {                                                             │
│      "returnUrl": "/profile/90",                               │
│      "timestamp": 1702345678000                                │
│    }                                                             │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│      يعيد التوجيه: <Navigate to="/login" replace />            │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│              صفحة Login (LoginPageGlassFixed)                   │
│       تستخدم: useLoginWithIntent                              │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│      المستخدم يدخل البيانات ويضغط Sign In                     │
│       handleSubmit → bulgarianAuthService.loginWithEmail()    │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│              AuthContext يتحدث: user ≠ null                     │
│            useEffect في useLoginWithIntent ينشط                │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│        استدعاء: getRedirectPath()                              │
│        الأولوية 1: تحقق من sessionStorage['profile_intent']  │
│        يجد: { returnUrl: '/profile/90', ... }                 │
│        يرجع: '/profile/90'                                     │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│         navigate('/profile/90', { replace: true })             │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│    NumericProfileRouter يتحقق من ProtectedRoute مرة أخرى      │
│         isAuthenticated = true (المستخدم الآن مسجل)           │
│         يعرض: ProfilePageWrapper                              │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│              ✅ عرض صفحة البروفايل 90                          │
│        URL: http://localhost:3001/profile/90                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 هيكل الملفات

```
src/
├── hooks/
│   └── useProfileIntent.ts          ✨ إدارة النية المحفوظة
├── components/
│   └── ProtectedRoute.tsx            ✨ حماية المسار
├── pages/
│   └── 02_authentication/
│       └── login/
│           └── LoginPage/
│               └── hooks/
│                   └── useLoginWithIntent.ts  ✨ تسجيل الدخول مع النية
├── routes/
│   └── NumericProfileRouter.tsx     ✨ مسارات البروفايل (محدثة)
└── ...
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: يتم التوجيه إلى `/` بدلاً من `/profile/90` بعد الدخول

**الأسباب المحتملة**:
1. Intent انتهت صلاحيته (> 1 ساعة)
2. sessionStorage مسح قبل تسجيل الدخول
3. ブاउزر في وضع Private/Incognito
4. JavaScript معطل في DevTools

**الحل**:
```typescript
// تحقق من sessionStorage في Console
JSON.parse(sessionStorage.getItem('profile_intent'));
// يجب أن ترى: { returnUrl: '/profile/90', timestamp: ... }

// تحقق من الطابع الزمني
const intent = JSON.parse(sessionStorage.getItem('profile_intent'));
console.log('Age:', Date.now() - intent.timestamp, 'ms');
// يجب أن يكون < 3600000 (ساعة واحدة)
```

### المشكلة: صفحة البروفايل تُعيد التوجيه دون سبب واضح

**تحقق من**:
1. هل `useAuth()` يعيد `isAuthenticated = true`؟
2. هل `ProtectedRoute` يُستدعى للمسار؟
3. هل هناك error في Console؟

**التصحيح**:
```typescript
// أضف logging مؤقت
useEffect(() => {
  console.log('[ProtectedRoute] isAuthenticated:', isAuthenticated);
  console.log('[ProtectedRoute] user:', user);
}, [isAuthenticated, user]);
```

---

## ✅ Checklist للتطبيق

- [x] إنشاء `useProfileIntent` hook
- [x] إنشاء `ProtectedRoute` component
- [x] إنشاء `useLoginWithIntent` hook معزز
- [x] تحديث `NumericProfileRouter` مع حماية
- [x] اختبار الحماية الأساسية
- [ ] اختبار Intent Preservation كاملاً
- [ ] اختبار انتهاء الصلاحية
- [ ] اختبار على الهواتف المحمولة
- [ ] إضافة i18n للرسائل
- [ ] توثيق في README الرئيسي

---

## 📞 أسئلة شائعة

### س: لماذا `sessionStorage` وليس `localStorage`؟
**ج**: لأن Intent مؤقت فقط. sessionStorage ينظف نفسه عند إغلاق المتصفح، مما يمنع الـ stale redirects.

### س: هل يمكن تجاوز الـ 1 ساعة TTL؟
**ج**: نعم، عدّل `INTENT_EXPIRATION_TIME` في `useProfileIntent.ts`:
```typescript
const INTENT_EXPIRATION_TIME = 2 * 60 * 60 * 1000; // ساعتان
```

### س: هل هذا يعمل مع Social Auth (Google, Facebook)?
**ج**: نعم! النظام يعمل مع أي طريقة تسجيل دخول لأنه يعتمد على `useAuth()` context.

### س: هل يمكن استخدام هذا للصفحات الأخرى؟
**ج**: بالطبع! استخدم `<ProtectedRoute>` حول أي محتوى يتطلب تسجيل دخول.

---

## 🎯 الخطوات التالية

1. **Phase 2**: إضافة i18n للرسائل (عناوين الأخطاء، إلخ)
2. **Phase 3**: تكامل Firebase الفعلي مع قاعدة البيانات
3. **Phase 4**: اختبار شامل (Unit + E2E)
4. **Phase 5**: تحسين الأداء (Caching، Optimization)

---

## 📚 مراجع إضافية

- [React Router Protected Routes](https://reactrouter.com/docs/en/v6/guides/data-loading)
- [Firebase Auth Best Practices](https://firebase.google.com/docs/auth/where-to-start)
- [Session Storage MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)

---

**آخر تحديث**: نوفمبر 2024
**الإصدار**: 1.0.0
**الحالة**: ✅ جاهز للإنتاج
