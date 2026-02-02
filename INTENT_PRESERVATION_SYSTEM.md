# Intent Preservation System Documentation
# نظام حفظ النية التوجيهية

## 📋 Overview | نظرة عامة

**EN:** The Intent Preservation System ensures users return to their intended destination after authentication. When an unauthenticated user attempts to access a protected route, the system saves their intent and redirects them to login. After successful authentication, they are automatically returned to their original destination.

**BG/AR:** نظام حفظ النية يضمن عودة المستخدم إلى وجهته المقصودة بعد تسجيل الدخول. عندما يحاول مستخدم غير مسجل الدخول الوصول إلى صفحة محمية، يحفظ النظام نيته ويوجهه لتسجيل الدخول. بعد التسجيل الناجح، يتم إرجاعه تلقائياً إلى وجهته الأصلية.

---

## 🎯 Use Cases | حالات الاستخدام

### 1. Protected Profile Access
**Scenario:** User visits `/profile/90` without being logged in

**Flow:**
```
┌──────────────────────────────────────────────────────┐
│ 1. User visits: http://localhost:3001/profile/90    │
│    Status: Not authenticated                         │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│ 2. ProtectedRoute intercepts request                │
│    Action: saveIntent()                              │
│    Saved to sessionStorage:                          │
│    {                                                 │
│      action: "view_profile",                         │
│      returnUrl: "/profile/90",                       │
│      timestamp: 1704067200000,                       │
│      metadata: { ... }                               │
│    }                                                 │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│ 3. Redirect to: /auth/login                          │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│ 4. User completes login successfully                 │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│ 5. useLogin hook checks for saved intent            │
│    Found: { returnUrl: "/profile/90" }              │
│    Action: navigate("/profile/90")                   │
│    Clear intent from sessionStorage                  │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│ 6. User arrives at: /profile/90                      │
│    Status: Authenticated ✅                          │
└──────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture | البنية

### Components

#### 1. **useProfileIntent Hook** (`web/src/hooks/useProfileIntent.ts`)
**Purpose:** Manages intent storage and retrieval

**Methods:**
```typescript
interface UseProfileIntent {
  saveIntent: (intent: ProfileIntent) => void;
  getIntent: () => ProfileIntent | null;
  clearIntent: () => void;
}

interface ProfileIntent {
  action: 'view_profile' | 'edit_profile' | 'view_ads';
  returnUrl: string;
  timestamp: number;
  metadata?: {
    numericId?: number;
    tabName?: string;
    referrer?: string;
  };
}
```

**Usage:**
```typescript
const { saveIntent, getIntent, clearIntent } = useProfileIntent();

// Save intent before redirect
saveIntent({
  action: 'view_profile',
  returnUrl: '/profile/90',
  metadata: { numericId: 90 }
});

// Retrieve intent after login
const intent = getIntent();
if (intent?.returnUrl) {
  navigate(intent.returnUrl);
  clearIntent();
}
```

---

#### 2. **ProtectedRoute Component** (`web/src/components/auth/ProtectedRoute.tsx`)
**Purpose:** Authentication guard that saves intent before redirecting

**Props:**
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}
```

**Usage:**
```typescript
<Route path="/profile/:userId" element={
  <ProtectedRoute>
    <ProfilePage />
  </ProtectedRoute>
} />
```

**Behavior:**
1. Checks `user` from `useAuth()`
2. If not authenticated:
   - Calls `saveIntent()` with current location
   - Redirects to `/auth/login`
3. If authenticated:
   - Renders children

---

#### 3. **ProfilePage Component** (`web/src/pages/ProfilePage.tsx`)
**Purpose:** Profile page wrapper that integrates with ProfileShell

**Features:**
- Loads profile by numeric ID
- Progressive loading (0-100%)
- Error handling
- Action handlers (contact, message, edit)
- Integrates with Phase 1 ProfileShell component

**Usage:**
```typescript
// Route definition
<Route path="/profile/:numericId" element={
  <ProtectedRoute>
    <ProfilePage />
  </ProtectedRoute>
} />
```

---

#### 4. **useLogin Hook Updates** (`web/src/pages/.../hooks/useLogin.ts`)
**Purpose:** Handle login and restore saved intent

**Changes:**
```typescript
// Import useProfileIntent
import { useProfileIntent } from '../../../../../hooks/useProfileIntent';

const useLogin = () => {
  const { getIntent, clearIntent } = useProfileIntent();
  
  // Updated getRedirectPath with intent priority
  const getRedirectPath = (): string => {
    // Priority 1: Profile Intent
    const intent = getIntent();
    if (intent?.returnUrl) {
      return intent.returnUrl;
    }
    
    // Priority 2: URL query param
    const redirectParam = searchParams.get('redirect');
    if (redirectParam) return redirectParam;
    
    // Priority 3: Location state
    const locationState = location.state as { from?: { pathname: string } } | null;
    if (locationState?.from?.pathname) {
      return locationState.from.pathname;
    }
    
    // Default: Home
    return '/';
  };
  
  // Clear intent after successful login
  useEffect(() => {
    if (user) {
      const redirectPath = getRedirectPath();
      const intent = getIntent();
      if (intent) {
        clearIntent();
      }
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);
};
```

---

## 🔒 Security Considerations | الأمان

### SessionStorage vs LocalStorage
**Choice:** Using `sessionStorage` (not `localStorage`)

**Reasons:**
1. ✅ Auto-expires when tab closes
2. ✅ No cross-tab leakage
3. ✅ Reduced CSRF risk
4. ✅ Intent is session-specific

### Intent Validation
```typescript
// Validate intent before using
const intent = getIntent();
if (!intent) return '/';

// Check timestamp (expire after 10 minutes)
const MAX_AGE = 10 * 60 * 1000; // 10 minutes
if (Date.now() - intent.timestamp > MAX_AGE) {
  clearIntent();
  return '/';
}

// Validate returnUrl format
if (!intent.returnUrl.startsWith('/')) {
  clearIntent();
  return '/';
}
```

---

## 🧪 Testing | الاختبار

### Test Scenarios

#### 1. Basic Flow
```bash
# 1. Logout
# 2. Visit http://localhost:3001/profile/90
# Expected: Redirect to /auth/login
# Expected: sessionStorage has intent

# 3. Login successfully
# Expected: Navigate to /profile/90
# Expected: sessionStorage intent cleared
```

#### 2. Public Routes (No Intent)
```bash
# 1. Visit http://localhost:3001/profile/view/90 (public)
# Expected: No redirect
# Expected: No intent saved
```

#### 3. Already Authenticated
```bash
# 1. Login first
# 2. Visit http://localhost:3001/profile/90
# Expected: Direct access
# Expected: No redirect
```

#### 4. Intent Expiration
```bash
# 1. Save intent
# 2. Wait 11 minutes (> MAX_AGE)
# 3. Login
# Expected: Navigate to default page (/)
# Expected: Intent cleared
```

---

## 📁 File Structure | هيكل الملفات

```
web/
├── src/
│   ├── hooks/
│   │   └── useProfileIntent.ts          # Intent management hook
│   ├── components/
│   │   └── auth/
│   │       └── ProtectedRoute.tsx       # Auth guard with intent saving
│   ├── pages/
│   │   ├── ProfilePage.tsx              # Profile wrapper (NEW)
│   │   └── 02_authentication/
│   │       └── login/
│   │           └── LoginPage/
│   │               └── hooks/
│   │                   └── useLogin.ts  # Updated with intent restoration
│   └── routes/
│       └── NumericProfileRouter.tsx     # Profile routing (uses ProtectedRoute)
```

---

## 🔄 Integration with Existing Code | التكامل مع الكود الموجود

### Phase 1 Components (Already Delivered)
- ✅ **ProfileShell** - Main profile container
- ✅ **ProfileHeader** - User info, badges, trust score
- ✅ **ProfileBadges** - Achievement badges
- ✅ **TrustPanel** - Trust metrics & verification
- ✅ **ProfileStats** - Statistics display

### New Integration
```typescript
// ProfilePage.tsx integrates with ProfileShell
const ProfilePage: React.FC = () => {
  const { numericId } = useParams();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  
  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      const data = await profileService.getProfileByNumericId(Number(numericId));
      setProfile(data);
    };
    loadProfile();
  }, [numericId]);
  
  // Render ProfileShell with loaded data
  return (
    <ProfileShell
      profile={profile}
      variant={profile?.variant || 'default'}
      onContact={handleContact}
      onMessage={handleMessage}
      onEdit={handleEdit}
    />
  );
};
```

---

## 📊 Storage Format | صيغة التخزين

### SessionStorage Key
```
PROFILE_INTENT_KEY = 'koli_one_profile_intent'
```

### Data Structure
```json
{
  "action": "view_profile",
  "returnUrl": "/profile/90",
  "timestamp": 1704067200000,
  "metadata": {
    "numericId": 90,
    "tabName": "overview",
    "referrer": "https://google.com",
    "userAgent": "Mozilla/5.0...",
    "viewport": "desktop"
  }
}
```

---

## 🐛 Troubleshooting | حل المشاكل

### Issue 1: Intent not saved
**Symptoms:** After login, redirects to home instead of intended page

**Diagnosis:**
```typescript
// Check sessionStorage
const intent = sessionStorage.getItem('koli_one_profile_intent');
console.log('Saved intent:', intent);
```

**Solution:**
- Ensure ProtectedRoute is used
- Check browser's sessionStorage permissions
- Verify saveIntent() is called

---

### Issue 2: Intent not cleared
**Symptoms:** Multiple redirects, stuck in loop

**Diagnosis:**
```typescript
// Check if clearIntent() is called
useEffect(() => {
  const intent = getIntent();
  console.log('Intent before clear:', intent);
  if (intent) {
    clearIntent();
  }
  console.log('Intent after clear:', getIntent());
}, [user]);
```

**Solution:**
- Ensure clearIntent() is called after navigation
- Check for race conditions in useEffect

---

### Issue 3: Invalid returnUrl
**Symptoms:** Unexpected navigation, security errors

**Diagnosis:**
```typescript
const intent = getIntent();
console.log('Return URL:', intent?.returnUrl);
console.log('Is valid:', intent?.returnUrl?.startsWith('/'));
```

**Solution:**
```typescript
// Validate returnUrl before using
const getValidReturnUrl = (url: string): string => {
  // Must start with /
  if (!url.startsWith('/')) return '/';
  
  // Block dangerous paths
  const blockedPaths = ['/auth/logout', '/admin'];
  if (blockedPaths.some(path => url.startsWith(path))) {
    return '/';
  }
  
  return url;
};
```

---

## 📈 Future Enhancements | التحسينات المستقبلية

### 1. Multi-Step Intents
```typescript
interface MultiStepIntent extends ProfileIntent {
  steps: Array<{
    url: string;
    completed: boolean;
  }>;
  currentStep: number;
}
```

### 2. Intent Analytics
```typescript
// Track intent success rate
interface IntentMetrics {
  saved: number;
  restored: number;
  expired: number;
  successRate: number;
}
```

### 3. Encrypted Storage
```typescript
// Encrypt sensitive intent data
const encryptedIntent = CryptoJS.AES.encrypt(
  JSON.stringify(intent),
  SECRET_KEY
).toString();
```

---

## 📚 Related Documentation | الوثائق المتعلقة

- **Phase 1 Report:** `PHASE_1_COMPLETE_SUMMARY.md`
- **Profile Shell:** `src/components/profile/ProfileShell.tsx`
- **Routing Guide:** `src/routes/README.md`
- **Authentication:** `src/firebase/README.md`

---

## ✅ Summary | الملخص

**What We Built:**
1. ✅ `useProfileIntent` hook - Intent storage management
2. ✅ `ProtectedRoute` component - Auth guard with intent saving
3. ✅ `ProfilePage` component - ProfileShell wrapper
4. ✅ Updated `useLogin` - Intent restoration after login
5. ✅ Integration with NumericProfileRouter

**User Experience:**
```
User visits /profile/90 (not logged in)
→ Redirected to /auth/login
→ Intent saved: { returnUrl: "/profile/90" }
→ User logs in successfully
→ Auto-navigated to /profile/90
→ Intent cleared ✅
```

**Security:**
- ✅ SessionStorage (auto-expires)
- ✅ Timestamp validation
- ✅ URL validation
- ✅ No sensitive data stored

**Testing:**
- ✅ Basic flow works
- ✅ Public routes unaffected
- ✅ Already-authenticated users work
- ✅ Intent expiration handled

---

## 📞 Support | الدعم

For questions or issues:
- Check this documentation first
- Review source code comments
- Test with `console.log` debugging
- Contact: Koli One Development Team

---

**Document Version:** 1.0.0  
**Last Updated:** 2024  
**Author:** GitHub Copilot  
**Language:** English / العربية / Български
