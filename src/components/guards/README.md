# Authentication Guards

This directory contains all authentication and authorization guard components for the application.

## 📁 Structure

```
guards/
├── AuthGuard.tsx          # Unified authentication guard
├── index.ts               # Barrel exports
├── __tests__/
│   └── AuthGuard.test.tsx # Comprehensive test suite
└── README.md              # This file
```

## 🎯 Purpose

The `AuthGuard` component consolidates all authentication and authorization logic into a single, flexible component. It replaces the previous fragmented approach of having separate `ProtectedRoute`, `AdminRoute`, and `AuthGuard` components.

## ✨ Features

- ✅ **Flexible Permission System**: Support for auth, admin, and email verification checks
- ✅ **Beautiful UI**: Professional unauthorized access messages with translations
- ✅ **Loading States**: Smooth loading indicators during auth checks
- ✅ **Customizable Redirects**: Configure where users are redirected on failure
- ✅ **Translation Support**: Full BG/EN translation support
- ✅ **Type-Safe**: Full TypeScript support with comprehensive interfaces

## 📖 Usage Examples

### Basic Authentication Protection

```tsx
import { AuthGuard } from '@/components/guards';

// Protect a page - requires user to be logged in
<AuthGuard requireAuth={true}>
  <DashboardPage />
</AuthGuard>
```

### Admin-Only Protection

```tsx
import { AuthGuard } from '@/components/guards';

// Requires both authentication AND admin role
<AuthGuard requireAuth={true} requireAdmin={true}>
  <AdminPanel />
</AuthGuard>
```

### Email Verification Required

```tsx
import { AuthGuard } from '@/components/guards';

// Requires authenticated user with verified email
<AuthGuard requireAuth={true} requireVerified={true}>
  <SellCarPage />
</AuthGuard>
```

### Combined Requirements

```tsx
import { AuthGuard } from '@/components/guards';

// Super protected: auth + admin + verified
<AuthGuard 
  requireAuth={true} 
  requireAdmin={true} 
  requireVerified={true}
>
  <SuperAdminPanel />
</AuthGuard>
```

### Custom Redirect

```tsx
import { AuthGuard } from '@/components/guards';

// Redirect to custom page instead of showing message
<AuthGuard 
  requireAuth={true}
  showMessage={false}
  redirectTo="/custom-login"
>
  <ProtectedContent />
</AuthGuard>
```

### Public Route (No Protection)

```tsx
import { AuthGuard } from '@/components/guards';

// No protection - anyone can access
<AuthGuard requireAuth={false}>
  <PublicPage />
</AuthGuard>
```

## 🔧 API Reference

### AuthGuardProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | **required** | Content to protect |
| `requireAuth` | `boolean` | `true` | Require user to be authenticated |
| `requireAdmin` | `boolean` | `false` | Require user to have admin role |
| `requireVerified` | `boolean` | `false` | Require user to have verified email |
| `redirectTo` | `string` | `'/login'` | Custom redirect path for unauthorized access |
| `showMessage` | `boolean` | `true` | Show UI message instead of redirecting |

## 🔄 Migration Guide

### From ProtectedRoute

**Before:**
```tsx
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>
```

**After:**
```tsx
<AuthGuard requireAuth={true}>
  <DashboardPage />
</AuthGuard>
```

### From AdminRoute

**Before:**
```tsx
<AdminRoute>
  <AdminPanel />
</AdminRoute>
```

**After:**
```tsx
<AuthGuard requireAuth={true} requireAdmin={true}>
  <AdminPanel />
</AuthGuard>
```

### From Legacy AuthGuard

**Before:**
```tsx
<AuthGuard requireAuth={true}>
  <SomePage />
</AuthGuard>
```

**After:**
```tsx
// Same API! Just import from new location
import { AuthGuard } from '@/components/guards';

<AuthGuard requireAuth={true}>
  <SomePage />
</AuthGuard>
```

## 🧪 Testing

Run the test suite:

```bash
# Run all guard tests
npm test -- guards

# Run with coverage
npm test -- --coverage guards

# Watch mode
npm test -- --watch guards
```

## 🎨 UI Messages

The component displays beautiful, translated messages for different scenarios:

1. **Login Required**: Shows when `requireAuth` fails
   - Displays lock icon
   - Shows page name user tried to access
   - Provides "Login" and "Back to Home" buttons

2. **Admin Required**: Shows when `requireAdmin` fails
   - Displays shield icon
   - Explains admin access is needed
   - Provides "Back to Home" button

3. **Verification Required**: Shows when `requireVerified` fails
   - Displays mail icon
   - Explains email verification is needed
   - Provides "Verify Email" and "Back to Home" buttons

## 🌍 Translation Keys

The component uses the following translation keys:

```
auth.required.title
auth.required.message
auth.required.enjoyFeatures
auth.required.loginButton
auth.required.backButton
auth.adminRequired.title
auth.adminRequired.message
auth.verificationRequired.title
auth.verificationRequired.message
auth.verificationRequired.verifyButton
auth.pageNames.advancedSearch
auth.pageNames.sell
auth.pageNames.sellCar
auth.pageNames.brandGallery
auth.pageNames.dealers
auth.pageNames.finance
auth.pageNames.profile
auth.pageNames.dashboard
auth.pageNames.thisPage
common.loading
```

## 🚀 Performance

- **Lazy Loading**: Component uses React.lazy for optimal code splitting
- **Memoization**: Styled components are memoized to prevent unnecessary re-renders
- **Efficient Checks**: Authentication checks are performed in optimal order (auth → admin → verified)

## 🔒 Security

- **No Client-Side Secrets**: All sensitive checks are server-side
- **Role Verification**: Admin role is verified against server data
- **Email Verification**: Email verification status is checked from Firebase Auth

## 📝 Notes

- The component integrates with `useAuth` hook from `@/hooks/useAuth`
- Translations are managed through `useLanguage` from `@/contexts/LanguageContext`
- All redirects preserve the original location in state for post-login navigation
- Loading states prevent flash of unauthorized content (FOUC)

## 🔗 Related

- [Feature Flags](../../config/feature-flags.ts) - Controls rollout of new guard system
- [useAuth Hook](../../hooks/useAuth.ts) - Authentication state management
- [LanguageContext](../../contexts/LanguageContext.tsx) - Translation system

---

**Last Updated**: November 26, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
