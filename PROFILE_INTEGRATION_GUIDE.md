// QUICK INTEGRATION GUIDE - Profile System
// How to use the profile system in your app

## 🎯 BASIC USAGE

### 1. Import the ProfileShell Component
```typescript
import { ProfileShell } from '@/components/profile';
import { profileService } from '@/services/profile/profile-service';
import { useState, useEffect } from 'react';

export default function ProfilePage({ params: { numericId } }) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const data = await profileService.getProfileByNumericId(parseInt(numericId));
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (numericId) {
      loadProfile();
    }
  }, [numericId]);

  return (
    <ProfileShell
      profile={profile}
      isLoading={isLoading}
      error={error}
      isViewOnly={true}
      onActionClick={(action, payload) => {
        console.log(`Action: ${action}`, payload);
        // Handle contact, message, etc.
      }}
    />
  );
}
```

---

## 🎨 USING INDIVIDUAL COMPONENTS

### ProfileBadges (Standalone)
```typescript
import { ProfileBadges } from '@/components/profile';

<ProfileBadges
  badges={['phone_verified', 'identity_verified']}
  compact={false}
  maxDisplay={5}
  onBadgeClick={(badge) => console.log(badge)}
  highlightedBadges={['phone_verified']}
  isHorizontal={false}
/>
```

### TrustPanel (Standalone)
```typescript
import { TrustPanel } from '@/components/profile';

<TrustPanel
  profile={sellerProfile}
  expandedBadges={false}
  onBadgeClick={(badge) => console.log(badge)}
  showFullMetrics={true}
/>
```

### ProfileLoader (Loading States)
```typescript
import { ProfileLoader } from '@/components/profile';

<ProfileLoader
  progress={65}
  isFullScreen={false}
  showTip={true}
  customMessage="Loading profile data..."
  showBar={false}
  onComplete={() => console.log('Loading complete')}
/>
```

---

## 🔧 SERVICE INTEGRATION

### Get Profile by Numeric ID (Privacy-First)
```typescript
import { profileService } from '@/services/profile/profile-service';

const profile = await profileService.getProfileByNumericId(42);
// Returns complete SellerProfile with calculated trust score
```

### Get Profile by Firebase UID
```typescript
const profile = await profileService.getProfileByUid(firebaseUid);
// For authenticated users accessing their own profile
```

### Calculate Trust Score
```typescript
const score = profileService.calculateTrustScore({
  badges: ['phone_verified', 'identity_verified'],
  responseRate: 95,
  totalReviews: 28,
  createdAt: new Date('2022-01-15'),
});
// Returns: 0-100
```

### Get Seller's Cars
```typescript
const cars = await profileService.getSellerCars(sellerId, limit = 50);
// Returns array of CarListing objects from UnifiedCarService
```

### Validate Profile Completeness
```typescript
const validation = profileService.validateProfile(profile);
if (!validation.isComplete) {
  console.log('Missing fields:', validation.missingFields);
}
```

---

## 🎨 THEMING & STYLING

### Access Profile Theme in Child Components
```typescript
import { useProfileTheme } from '@/components/profile';

function MyComponent() {
  const { accentColor, profileType, profile } = useProfileTheme();
  
  return (
    <div style={{ borderColor: accentColor }}>
      {profileType === 'dealer' && <p>This is a dealer profile</p>}
    </div>
  );
}
```

### Apply Custom Styling
```typescript
import styled from 'styled-components';
import { useProfileTheme } from '@/components/profile';

const CustomCard = styled.div`
  border-left: 4px solid ${(props) => props.theme.accent};
`;

// Inside component:
const { accentColor } = useProfileTheme();
```

---

## 📍 ROUTING INTEGRATION

### URL Structure
```
/profile/:numericId          → View own profile (if viewer ID matches)
/profile/view/:numericId     → View other's profile (read-only)
/profile/:numericId/edit     → Edit own profile
```

### React Router Integration
```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProfilePage from './pages/ProfilePage';

<Routes>
  <Route path="/profile/:numericId" element={<ProfilePage />} />
  <Route path="/profile/view/:numericId" element={<ProfilePage viewOnly={true} />} />
</Routes>
```

---

## 🔐 PERMISSION MANAGEMENT

### Check if User Can Edit Profile
```typescript
function canEditProfile(viewerNumericId, profileNumericId, userRole) {
  // Own profile
  if (viewerNumericId === profileNumericId) return true;
  
  // Admin or support role
  if (['admin', 'moderator'].includes(userRole)) return true;
  
  return false;
}
```

### Intent Preservation for Login
```typescript
// In action handler:
function handleContactClick(payload) {
  if (!userIsAuthenticated) {
    // Save intent
    sessionStorage.setItem('profileIntent', JSON.stringify({
      action: 'contact',
      payload,
      returnTo: window.location.pathname
    }));
    
    // Redirect to login
    router.push('/auth/login');
  }
}

// After login, resume intent:
if (sessionStorage.getItem('profileIntent')) {
  const intent = JSON.parse(sessionStorage.getItem('profileIntent'));
  handleProfileAction(intent.action, intent.payload);
  router.push(intent.returnTo);
}
```

---

## 🌐 i18n INTEGRATION

### Keys to Add to Locales
Add to `src/locales/bg.json` and `en.json`:

```json
{
  "profile": {
    "garage": "🏠 Моя гараж / My Garage",
    "story": "📖 Моя история / My Story",
    "inventory": "🚗 Инвентар / Inventory",
    "filters": "Филтри / Filters",
    "contact": "📞 Контакт / Contact",
    "message": "✉️ Съобщение / Message",
    "trust": "🛡️ Сигурност и репутация / Trust & Reputation",
    "memberSince": "Член от / Member since",
    "location": "Местоположение / Location"
  },
  "badges": {
    "phone_verified": "Потвърден телефон / Phone Verified",
    "identity_verified": "Проверена самоличност / Identity Verified",
    "dealer_verified": "Проверен дилър / Dealer Verified",
    "company_certified": "Сертифицирана компания / Company Certified",
    "trusted_seller": "Надежден продавач / Trusted Seller"
  },
  "loader": {
    "starting": "Начало... / Starting...",
    "connecting": "Свързване с базата... / Connecting to database...",
    "profile": "Зареждане на профила... / Loading profile...",
    "listings": "Зареждане на обяви... / Loading listings..."
  }
}
```

---

## 🧪 TESTING EXAMPLES

### Unit Test Template
```typescript
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { LanguageProvider } from '@/contexts/LanguageContext';
import ProfileShell from '@/components/profile/ProfileShell';

const mockTheme = {
  colors: {
    accent: '#2B7BFF',
    textPrimary: '#333',
    textSecondary: '#999',
    borderLight: '#e0e0e0'
  }
};

const mockProfile = {
  id: 'uid123',
  sellerId: 'uid123',
  numericId: 42,
  profileType: 'dealer',
  name: 'Test Dealer',
  // ... other fields
};

describe('ProfileShell', () => {
  it('renders dealer variant for dealer profile', () => {
    render(
      <ThemeProvider theme={mockTheme}>
        <LanguageProvider>
          <ProfileShell profile={mockProfile} isLoading={false} />
        </LanguageProvider>
      </ThemeProvider>
    );
    
    expect(screen.getByText('Test Dealer')).toBeInTheDocument();
  });
});
```

---

## 🐛 DEBUGGING TIPS

### Enable Verbose Logging
```typescript
// In profile-service.ts
import { logger } from '@/services/logger-service';

// Already included in all methods:
logger.info(`[Profile] Fetching profile for numericId: ${numericId}`);
logger.error('[Profile] Error fetching profile:', err);
```

### Check ProfileThemeContext
```typescript
import { useProfileTheme } from '@/components/profile';

function DebugComponent() {
  const theme = useProfileTheme();
  console.log('Profile Theme:', theme);
  return <pre>{JSON.stringify(theme, null, 2)}</pre>;
}
```

### Verify Firebase Queries
```typescript
// Test in browser console after profile loads
db.collection('seller_profiles').doc('uid123').get()
  .then(doc => console.log(doc.data()));
```

---

## 📊 PERFORMANCE TIPS

### 1. Memoize Profile Objects
```typescript
const memoizedProfile = useMemo(() => profile, [profile.id]);
```

### 2. Use ProfileLoader During Fetch
```typescript
{isLoading && <ProfileLoader progress={progress} />}
```

### 3. Lazy Load UnifiedCarService
```typescript
// Already implemented in ProfileService
const { UnifiedCarService } = await import('@/services/car/unified-car-service');
```

### 4. Cache Trust Score
```typescript
// In profile-service.ts - already calculated on fetch
// Cache in Redis for 24 hours in production
```

---

## ❌ COMMON MISTAKES TO AVOID

### ❌ DON'T
```typescript
// Using Firebase UID in URLs
/profile/${firebaseUid}  // WRONG! Privacy violation

// Using console.log
console.log('profile:', profile);  // Use logger-service

// Hardcoding strings
<span>Contact</span>  // Extract to i18n

// Any TypeScript types
const profile: any = data;  // Use proper types
```

### ✅ DO
```typescript
// Use numeric ID in URLs
/profile/${numericId}  // Correct!

// Use logger service
logger.info('[Profile] Profile loaded:', profile);

// Use i18n keys
<span>{language === 'bg' ? 'Контакт' : 'Contact'}</span>

// Use proper types
const profile: SellerProfile = data;
```

---

## 🆘 TROUBLESHOOTING

### Profile Not Loading
- Check browser console for errors
- Verify numeric ID is valid: `SELECT * FROM users WHERE numericId = ?`
- Check Firestore security rules allow read access
- Verify seller_profiles collection exists

### Wrong Colors Showing
- Check ProfileThemeContext is being provided
- Verify profile.profileType is one of: 'private', 'dealer', 'corporate'
- Check theme provider is wrapping ProfileShell

### i18n Keys Not Showing
- Verify keys exist in src/locales/{bg,en}.json
- Check language context is initialized
- Use fallback strings during development

### Trust Score Always 0
- Check user has badges or reviews in userData
- Verify responseRate and totalReviews fields exist
- Check calculateTrustScore() logic

---

## 📞 SUPPORT

For questions or issues:
1. Check PROGRAMMING_PROMPT_PROFILE_VARIANTS.md for detailed specs
2. Check PHASE_1_IMPLEMENTATION_COMPLETE.md for architecture
3. Check inline component comments for usage details
4. Review test examples in this guide

---

**Framework Version:** React 18 + TypeScript 5.6 (strict)
**Last Updated:** Phase 1 Complete
**Status:** Production Ready ✅
