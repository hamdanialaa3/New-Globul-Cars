# Routes Directory

This directory contains all application route definitions, extracted from the monolithic `App.tsx` for better organization and maintainability.

## 📁 Structure

```
routes/
├── auth.routes.tsx        ✅ Authentication routes (4 routes)
├── admin.routes.tsx       ✅ Admin routes (5 routes)
├── sell.routes.tsx        ⏳ Sell workflow routes (~25 routes)
├── dealer.routes.tsx      ⏳ Dealer routes (~6 routes)
├── main.routes.tsx        ⏳ Main app routes (~30 routes)
├── index.ts               ✅ Barrel exports
└── README.md              ✅ This file
```

## 🎯 Purpose

Extracting routes from `App.tsx` provides:
- ✅ Better code organization
- ✅ Easier maintenance
- ✅ Clearer route structure
- ✅ Faster navigation through codebase
- ✅ Reduced `App.tsx` size (909 → ~150 lines)

## ✅ Completed Route Files

### 1. Auth Routes (`auth.routes.tsx`)
**Routes**: 4  
**Status**: ✅ Complete

- `/login` - User login
- `/register` - User registration
- `/verification` - Email verification
- `/oauth/callback` - OAuth callback

**Usage**:
```typescript
import { AuthRoutes } from '@/routes';

<Route path="/*" element={<AuthRoutes />} />
```

---

### 2. Admin Routes (`admin.routes.tsx`)
**Routes**: 5  
**Status**: ✅ Complete

- `/admin` - Regular admin dashboard
- `/super-admin-login` - Super admin login
- `/super-admin` - Super admin dashboard
- `/super-admin/users` - User management
- `/diagram` - Architecture diagram

**Usage**:
```typescript
import { AdminRoutes } from '@/routes';

<Route path="/*" element={<AdminRoutes />} />
```

---

## ⏳ Pending Route Files

### 3. Sell Routes (`sell.routes.tsx`)
**Routes**: ~25  
**Status**: ⏳ To be created

**Main Workflow**:
- Vehicle start
- Seller type
- Vehicle data
- Equipment
- Images
- Pricing
- Contact
- Preview
- Submission

**Legacy Routes** (backward compatibility):
- Equipment sub-pages
- Contact sub-pages

---

### 4. Main Routes (`main.routes.tsx`)
**Routes**: ~30  
**Status**: ⏳ To be created

- Home page
- Cars listing
- Car details
- Social feed
- Profile
- Messages
- Search
- About/Legal pages

---

### 5. Dealer Routes (`dealer.routes.tsx`)
**Routes**: ~6  
**Status**: ⏳ To be created

- Dealer public page
- Dealer registration
- Dealer dashboard

---

## 🔧 Usage in App.tsx

### With Feature Flags (Recommended)

```typescript
import { FEATURE_FLAGS } from '@/config/feature-flags';
import { AuthRoutes, AdminRoutes } from '@/routes';

const App = () => {
  return (
    <Routes>
      {FEATURE_FLAGS.USE_EXTRACTED_ROUTES ? (
        // New route structure
        <>
          <Route path="/*" element={<AuthRoutes />} />
          <Route path="/*" element={<AdminRoutes />} />
          {/* Add other route files as they're created */}
        </>
      ) : (
        // Legacy routes
        <>
          <Route path="/login" element={...} />
          {/* ... existing routes ... */}
        </>
      )}
    </Routes>
  );
};
```

### Direct Usage (After Migration)

```typescript
import { AuthRoutes, AdminRoutes, SellRoutes, MainRoutes } from '@/routes';

const App = () => {
  return (
    <Routes>
      <Route path="/*" element={<AuthRoutes />} />
      <Route path="/*" element={<AdminRoutes />} />
      <Route path="/*" element={<SellRoutes />} />
      <Route path="/*" element={<MainRoutes />} />
    </Routes>
  );
};
```

---

## 📊 Progress

```
Auth Routes:    [████████████] 100% ✅
Admin Routes:   [████████████] 100% ✅
Sell Routes:    [░░░░░░░░░░░░]   0% ⏳
Main Routes:    [░░░░░░░░░░░░]   0% ⏳
Dealer Routes:  [░░░░░░░░░░░░]   0% ⏳
───────────────────────────────────────
Overall:        [███░░░░░░░░░]  20%
```

---

## 🎯 Benefits

### Before Refactoring
```typescript
// App.tsx (909 lines)
const App = () => {
  return (
    <Routes>
      <Route path="/login" element={...} />
      <Route path="/register" element={...} />
      {/* ... 70+ routes ... */}
    </Routes>
  );
};
```

### After Refactoring
```typescript
// App.tsx (~150 lines)
import { AuthRoutes, AdminRoutes, SellRoutes, MainRoutes } from '@/routes';

const App = () => {
  return (
    <Routes>
      <Route path="/*" element={<AuthRoutes />} />
      <Route path="/*" element={<AdminRoutes />} />
      <Route path="/*" element={<SellRoutes />} />
      <Route path="/*" element={<MainRoutes />} />
    </Routes>
  );
};
```

**Improvement**: -759 lines from App.tsx (-83%)

---

## 🔍 Route File Structure

Each route file follows this pattern:

```typescript
// src/routes/[name].routes.tsx
import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AuthGuard } from '@/components/guards';

// Lazy load pages
const Page1 = React.lazy(() => import('@/pages/...'));
const Page2 = React.lazy(() => import('@/pages/...'));

export const [Name]Routes: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/route1" element={<Page1 />} />
        <Route 
          path="/route2" 
          element={
            <AuthGuard requireAuth={true}>
              <Page2 />
            </AuthGuard>
          } 
        />
      </Routes>
    </Suspense>
  );
};

export default [Name]Routes;
```

---

## ⚠️ Important Notes

### Route Order
- More specific routes must come before generic ones
- Example: `/sell/auto` before `/sell/*`

### AuthGuard
- All protected routes use `AuthGuard` component
- Check requirements: `requireAuth`, `requireAdmin`, `requireVerified`

### Lazy Loading
- All pages are lazy loaded for better performance
- Wrapped in `Suspense` with appropriate fallback

### Mobile/Desktop
- Some routes render different components for mobile/desktop
- Use `useIsMobile()` hook where needed

---

## 🧪 Testing

### For Each Route File

```bash
# Type check
npm run type-check

# Run tests
npm test

# Manual testing
npm run dev
# Navigate to each route and verify
```

### Checklist

- [ ] All routes render correctly
- [ ] AuthGuard protection works
- [ ] Lazy loading works
- [ ] Mobile/desktop variations work
- [ ] Redirects work correctly
- [ ] No console errors
- [ ] TypeScript compiles
- [ ] Tests pass

---

## 📝 Migration Guide

### Step 1: Create Route File
1. Create new file in `src/routes/`
2. Import necessary pages and components
3. Define routes with appropriate guards
4. Export component

### Step 2: Update Barrel Export
1. Add export to `src/routes/index.ts`

### Step 3: Update App.tsx
1. Import new route component
2. Add to routes (behind feature flag)
3. Test thoroughly

### Step 4: Enable Feature Flag
1. Set `USE_EXTRACTED_ROUTES` to `true`
2. Test in development
3. Deploy to production
4. Monitor for issues

### Step 5: Cleanup
1. Remove legacy routes from App.tsx
2. Remove feature flag
3. Update documentation

---

## 🔗 Related

- [Week 2 Implementation Plan](../WEEK2_IMPLEMENTATION_PLAN.md)
- [Feature Flags](../src/config/feature-flags.ts)
- [AuthGuard](../src/components/guards/README.md)
- [App.tsx](../src/App.tsx)

---

**Created**: November 26, 2025  
**Version**: 1.0.0  
**Status**: 🟡 In Progress (20% complete)  
**Part of**: Week 2 - Route Extraction
