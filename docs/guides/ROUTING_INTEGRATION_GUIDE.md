# Routing Integration Guide
**Created:** 2026-02-18  
**Version:** 1.0  
**Status:** Implementation Ready

## Overview
This guide documents how to integrate the new redirect hooks (`useSlugRedirect`, `useUserSlugRedirect`, `useShortLinkResolver`) into the existing MainRoutes.tsx file to support:

1. **Listing slug canonicalization** (`/car/:listingNumericId/:slug`)
2. **User profile slug canonicalization** (`/u/:userNumericId/:slug`)
3. **Short link resolution** (`/s/:shortCode`)

## 1. Listing Slug Redirects

### ⚠️ Prerequisites (Services Not Yet Implemented)
The following hook requires services that **do not currently exist** in the codebase:
- `@/services/listings.service` → `getListingById()`, `getListingByNumericId()`

**Implementation Required Before Integration:**
Create `src/services/listings.service.ts` with:
```typescript
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface Listing {
  listingId: string;
  listingNumericId: number;
  slug: string;
  sellerId: string;
  // ... other fields from schemas/Listing.json
}

export async function getListingById(id: string): Promise<Listing | null> {
  const docRef = doc(db, 'listings', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as Listing : null;
}

export async function getListingByNumericId(numericId: number): Promise<Listing | null> {
  // Query listings where listingNumericId == numericId
  const q = query(collection(db, 'listings'), where('listingNumericId', '==', numericId), limit(1));
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : snapshot.docs[0].data() as Listing;
}
```

### Location in MainRoutes.tsx
Around line 256-270 (after existing `/car/:sellerNumericId/:carNumericId` routes)

### Route to Add
```tsx
{/* 🔗 NEW: Canonical listing URL with slug (SEO-optimized) */}
<Route 
  path="/car/:listingNumericId/:slug?" 
  element={<ListingSlugRedirectPage />} 
/>
```

### Component to Create
**File:** `src/pages/01_main-pages/ListingSlugRedirectPage.tsx`

```tsx
import React from 'react';
import { useSlugRedirect } from '../../hooks/useSlugRedirect';
import LoadingSpinner from '../../components/LoadingSpinner';

/**
 * Handles both legacy and canonical listing URLs:
 * - /car/:sellerId/:listingId → 301 redirect to /car/:listingNumericId/:slug
 * - /car/:listingNumericId/:oldSlug → 301 redirect to /car/:listingNumericId/:newSlug (if slug changed)
 * - /car/:listingNumericId/:correctSlug → Renders NumericCarDetailsPage
 */
const ListingSlugRedirectPage: React.FC = () => {
  const { isRedirecting } = useSlugRedirect();

  if (isRedirecting) {
    return <LoadingSpinner size="medium" message="Redirecting to canonical URL..." />;
  }

  // After redirect logic completes, render the actual listing page
  // (useSlugRedirect handles navigation internally)
  return null;
};

export default ListingSlugRedirectPage;
```

### HOC Alternative (Wrap Existing Component)
If you prefer not to create a new page, wrap `NumericCarDetailsPage`:

```tsx
import { withSlugRedirect } from '../../hooks/useSlugRedirect';

// In MainRoutes.tsx imports section:
const NumericCarDetailsPageWithSlug = withSlugRedirect(NumericCarDetailsPage);

// In routes section:
<Route 
  path="/car/:listingNumericId/:slug?" 
  element={<NumericCarDetailsPageWithSlug />} 
/>
```

---

## 2. User Profile Slug Redirects

### ⚠️ Prerequisites (Services Not Yet Implemented)
The following hook requires services that **do not currently exist** in the codebase:
- `@/services/users.service` → `getUserById()`, `getUserByNumericId()`
- `@/hooks/useAuth` → Hook for current user authentication state

**Implementation Required Before Integration:**
Create `src/services/users.service.ts` with:
```typescript
import { doc, getDoc, query, collection, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface User {
  userId: string;
  userNumericId: number;
  slug: string;
  displayName: string;
  email: string;
  roles: string[];
  // ... other fields from schemas/User.json
}

export async function getUserById(id: string): Promise<User | null> {
  const docRef = doc(db, 'users', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as User : null;
}

export async function getUserByNumericId(numericId: number): Promise<User | null> {
  const q = query(collection(db, 'users'), where('userNumericId', '==', numericId), limit(1));
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : snapshot.docs[0].data() as User;
}
```

Create `src/hooks/useAuth.ts` with:
```typescript
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext'; // Assumes AuthContext exists

export interface AuthUser {
  userId: string;
  email: string;
  roles: string[];
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  
  return {
    currentUser: context.user as AuthUser | null,
    isAuthenticated: !!context.user,
  };
}
```

### Location in MainRoutes.tsx
Around line 331 (where `/profile/*` route exists)

### Routes to Add
```tsx
{/* 🔗 NEW: Canonical user profile URL with slug */}
<Route 
  path="/u/:userNumericId/:slug?" 
  element={<UserProfileSlugRedirectPage />} 
/>

{/* 🔐 NEW: User settings with access guard */}
<Route 
  path="/profile/:userNumericId/settings" 
  element={<UserSettingsGuardedPage />} 
/>
```

### Components to Create
**File:** `src/pages/03_user-pages/UserProfileSlugRedirectPage.tsx`

```tsx
import React from 'react';
import { useUserSlugRedirect } from '../../hooks/useUserSlugRedirect';
import LoadingSpinner from '../../components/LoadingSpinner';

/**
 * Handles:
 * - /profile/:userNumericId → 301 redirect to /u/:userNumericId/:slug
 * - /u/:userNumericId/:oldSlug → 301 redirect to /u/:userNumericId/:newSlug
 * - /u/:userNumericId/:correctSlug → Renders profile (delegate to NumericProfileRouter)
 */
const UserProfileSlugRedirectPage: React.FC = () => {
  const { isRedirecting } = useUserSlugRedirect();

  if (isRedirecting) {
    return <LoadingSpinner size="medium" message="Redirecting to profile..." />;
  }

  return null; // Hook handles navigation
};

export default UserProfileSlugRedirectPage;
```

**File:** `src/pages/03_user-pages/UserSettingsGuardedPage.tsx`

```tsx
import React from 'react';
import { useUserSettingsGuard } from '../../hooks/useUserSlugRedirect';
import LoadingSpinner from '../../components/LoadingSpinner';

/**
 * Checks if current user is owner or admin before allowing /profile/:id/settings access.
 * Redirects to /login (if not authenticated) or /unauthorized (if not owner/admin).
 */
const UserSettingsGuardedPage: React.FC = () => {
  const { isChecking } = useUserSettingsGuard();

  if (isChecking) {
    return <LoadingSpinner size="medium" message="Verifying access..." />;
  }

  // After guard passes, render the settings page
  const SettingsPage = React.lazy(() => import('../../features/settings/SettingsPage'));
  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      <SettingsPage />
    </React.Suspense>
  );
};

export default UserSettingsGuardedPage;
```

### HOC Alternative
```tsx
import { withUserSlugRedirect, withUserSettingsGuard } from '../../hooks/useUserSlugRedirect';

const ProfilePageWithSlug = withUserSlugRedirect(NumericProfileRouter);
const SettingsPageGuarded = withUserSettingsGuard(SettingsPage);

// In routes:
<Route path="/u/:userNumericId/:slug?" element={<ProfilePageWithSlug />} />
<Route path="/profile/:userNumericId/settings" element={<SettingsPageGuarded />} />
```

---

## 3. Short Link Resolution

### ✅ Prerequisites Met
This hook uses `ShortLinksService` which **already exists** in `src/services/short-links.service.ts`.

### Location in MainRoutes.tsx
Add near the top of the routes list (before specific routes to avoid shadowing)

### Route to Add
```tsx
{/* 🔗 NEW: Short link resolver (/s/:shortCode) */}
<Route 
  path="/s/:shortCode" 
  element={<ShortLinkResolverPage />} 
/>
```

### Component to Use (Already Exported)
The hook already exports a ready-to-use component:

```tsx
// In MainRoutes.tsx imports:
import { ShortLinkResolverComponent } from '../hooks/useShortLinkResolver';

// In routes:
<Route 
  path="/s/:shortCode" 
  element={<ShortLinkResolverComponent />} 
/>
```

**Alternative:** Create a dedicated page wrapper if you need layout:

**File:** `src/pages/01_main-pages/ShortLinkResolverPage.tsx`

```tsx
import React from 'react';
import { ShortLinkResolverComponent } from '../../hooks/useShortLinkResolver';
import { Box, Typography } from '@mui/material';
import LoadingSpinner from '../../components/LoadingSpinner';

const ShortLinkResolverPage: React.FC = () => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column'
      }}
    >
      <LoadingSpinner size="large" />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Redirecting to your destination...
      </Typography>
      <ShortLinkResolverComponent />
    </Box>
  );
};

export default ShortLinkResolverPage;
```

---

## 4. Complete Integration Example

### Updated MainRoutes.tsx (Relevant Sections)

```tsx
// ============= IMPORTS SECTION =============
import { ShortLinkResolverComponent } from '../hooks/useShortLinkResolver';

// Lazy-loaded pages for new routes
const ListingSlugRedirectPage = safeLazy(() => import('../pages/01_main-pages/ListingSlugRedirectPage'));
const UserProfileSlugRedirectPage = safeLazy(() => import('../pages/03_user-pages/UserProfileSlugRedirectPage'));
const UserSettingsGuardedPage = safeLazy(() => import('../pages/03_user-pages/UserSettingsGuardedPage'));

// ============= ROUTES SECTION =============
function MainRoutes() {
  return (
    <Routes>
      {/* ... existing routes ... */}

      {/* 🔗 SHORT LINKS (must be early to avoid shadowing) */}
      <Route 
        path="/s/:shortCode" 
        element={<ShortLinkResolverComponent />} 
      />

      {/* 🔢 LISTING ROUTES WITH SLUG SUPPORT */}
      <Route 
        path="/car/:listingNumericId/:slug?" 
        element={<ListingSlugRedirectPage />} 
      />
      <Route 
        path="/car/:sellerNumericId/:carNumericId" 
        element={<NumericCarDetailsPage />} 
      />
      <Route 
        path="/car/:sellerNumericId/:carNumericId/edit" 
        element={
          <AuthGuard requireAuth={true}>
            <EditCarPage />
          </AuthGuard>
        } 
      />

      {/* 🔗 USER PROFILE ROUTES WITH SLUG SUPPORT */}
      <Route 
        path="/u/:userNumericId/:slug?" 
        element={<UserProfileSlugRedirectPage />} 
      />
      <Route 
        path="/profile/:userNumericId/settings" 
        element={<UserSettingsGuardedPage />} 
      />
      <Route 
        path="/profile/*" 
        element={<NumericProfileRouter />} 
      />

      {/* ... rest of routes ... */}
    </Routes>
  );
}
```

---

## 5. Testing Checklist

### Listing Slug Redirects
- [ ] Visit `/car/123/used-bmw-x5-2020` → Should render listing details (no redirect if slug correct)
- [ ] Visit `/car/123/old-slug` → Should 301 redirect to `/car/123/new-slug` (if slug changed in Firestore)
- [ ] Visit `/car/<seller_uid>/<listing_uid>` → Should 301 redirect to `/car/:numericId/:slug`

### User Profile Slug Redirects
- [ ] Visit `/u/456/john-doe` → Should render profile (no redirect if slug correct)
- [ ] Visit `/u/456/old-username` → Should 301 redirect to `/u/456/new-username`
- [ ] Visit `/profile/456` → Should 301 redirect to `/u/456/:slug`

### User Settings Access Guard
- [ ] Visit `/profile/456/settings` as owner → Should render settings page
- [ ] Visit `/profile/456/settings` as admin → Should render settings page
- [ ] Visit `/profile/456/settings` as different user → Should redirect to `/unauthorized`
- [ ] Visit `/profile/456/settings` while logged out → Should redirect to `/login`

### Short Links
- [ ] Visit `/s/abc123` (valid code) → Should 301 redirect to target URL (e.g., `/car/123/bmw-x5`)
- [ ] Visit `/s/abc123` (expired code) → Should redirect to `/404`
- [ ] Visit `/s/invalid` → Should redirect to `/404`
- [ ] Check Firestore `short_links/:code` → clickCount should increment

---

## 6. Migration Strategy

### Phase 1: Non-Breaking Addition (Recommended)
1. Add new routes **alongside** existing routes (don't replace)
2. Deploy to staging for 1 week
3. Monitor logs for redirect patterns (`serviceLogger` will track all redirects)
4. Verify zero TypeScript errors: `npm run type-check`

### Phase 2: Gradual Rollout
1. Update internal links in UI to use new slug-based URLs:
   ```tsx
   // Old: /car/${sellerId}/${listingId}
   // New: /car/${listingNumericId}/${slug}
   ```
2. Update sitemap.xml to include slug-based URLs
3. Add `<link rel="canonical" href="/car/:numericId/:slug" />` to listing pages

### Phase 3: Legacy Route Deprecation (3-6 months)
1. Add deprecation warnings to old routes (console.warn in NumericCarDetailsPage)
2. Update all external backlinks (social media, email campaigns)
3. After 6 months, consider removing legacy UUID routes (or keep for permanent backwards compatibility)

---

## 7. Performance Considerations

### Firestore Reads
- **useSlugRedirect**: 1 read per redirect (checks if slug changed)
- **useUserSlugRedirect**: 1 read per redirect
- **useShortLinkResolver**: 1 read + 1 write (increment clickCount)

**Optimization:** If redirect frequency is high, consider adding Redis cache layer:
```typescript
// In useSlugRedirect.ts
const cachedSlug = await redisClient.get(`listing:${numericId}:slug`);
if (cachedSlug) return cachedSlug;
// ... else fetch from Firestore and cache
```

### SEO Impact
- **301 redirects preserve PageRank** (Google treats them as permanent moves)
- **Slug stability is critical**: Avoid changing slugs after launch (damages SEO)
- **Canonical URLs prevent duplicate content penalties**

---

## 8. Rollback Plan

If issues arise after deployment:

1. **Immediate Rollback** (< 5 minutes):
   ```bash
   git revert <commit-hash>
   firebase deploy --only hosting
   ```

2. **Disable Specific Routes**:
   Comment out new routes in MainRoutes.tsx, redeploy.

3. **Feature Flag** (Future Enhancement):
   Add to `src/config/feature-flags.ts`:
   ```typescript
   export const FEATURE_FLAGS = {
     enableSlugRedirects: true,
     enableShortLinks: true,
   };
   ```

---

## 9. Related Documentation

- [src/hooks/useSlugRedirect.ts](../../src/hooks/useSlugRedirect.ts) - Listing slug redirect hook
- [src/hooks/useUserSlugRedirect.ts](../../src/hooks/useUserSlugRedirect.ts) - User profile redirects + settings guard
- [src/hooks/useShortLinkResolver.ts](../../src/hooks/useShortLinkResolver.ts) - Short link resolution (/s/:code)
- [CONSTITUTION.md](../../CONSTITUTION.md) - Section 1.4 "URL Routing & Canonicalization"
- [api/openapi.yaml](../../api/openapi.yaml) - REST API spec with short link endpoints

---

## 10. Support & Troubleshooting

### Common Issues

**Issue:** "Hook called outside of Router context"  
**Fix:** Ensure MainRoutes.tsx is wrapped in `<BrowserRouter>` (check App.tsx or index.tsx)

**Issue:** "Infinite redirect loop"  
**Fix:** Check if slug value in Firestore matches URL param exactly (case-sensitive)

**Issue:** "Short link not found but code exists in Firestore"  
**Fix:** Check `expiresAt` field; expired links return 404

**Issue:** "TypeScript error: Property 'slug' does not exist"  
**Fix:** Ensure Firestore types include `slug?: string` in Listing and User interfaces

### Debug Logging
All hooks use `serviceLogger` for structured logging:

```bash
# Enable debug mode
localStorage.setItem('debug', 'true');

# View redirect logs in console
# Format: [useSlugRedirect] Redirecting from /car/abc/... to /car/123/bmw-x5
```

---

**Last Updated:** February 18, 2026  
**Maintainer:** Koli One Engineering Team  
**Status:** ✅ Ready for Implementation
