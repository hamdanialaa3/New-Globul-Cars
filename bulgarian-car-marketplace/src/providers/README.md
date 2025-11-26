# Application Providers

This directory contains all application-level provider components that wrap the entire application.

## 📁 Structure

```
providers/
├── AppProviders.tsx       # Main provider stack
├── index.ts               # Barrel exports
├── __tests__/
│   └── AppProviders.test.tsx  # Test suite
└── README.md              # This file
```

## 🎯 Purpose

The `AppProviders` component consolidates all application-level providers into a single, well-documented component. This improves code organization, maintainability, and makes the provider hierarchy explicit and documented.

## ✨ Features

- ✅ **Centralized Provider Management**: All providers in one place
- ✅ **Well-Documented Hierarchy**: Clear documentation of provider order and dependencies
- ✅ **Type-Safe**: Full TypeScript support
- ✅ **Tested**: Comprehensive test suite
- ✅ **Performance Optimized**: Lazy loading for non-critical components

## 📖 Usage

### Basic Usage

```tsx
import { AppProviders } from '@/providers';
import { AppRoutes } from '@/routes';

const App: React.FC = () => {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
};

export default App;
```

### With Feature Flags

```tsx
import { FEATURE_FLAGS } from '@/config/feature-flags';
import { AppProviders } from '@/providers';
import { AppRoutes } from '@/routes';

const App: React.FC = () => {
  if (FEATURE_FLAGS.USE_EXTRACTED_PROVIDERS) {
    return (
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    );
  }

  // Legacy provider stack
  return (
    <ThemeProvider theme={bulgarianTheme}>
      {/* ... old nested providers ... */}
    </ThemeProvider>
  );
};
```

## 🔧 Provider Hierarchy

The providers are nested in a specific order. **DO NOT CHANGE THIS ORDER** without careful consideration.

### Order (Outer to Inner)

1. **ThemeProvider** (styled-components)
   - Provides base theme tokens to all styled components
   - No dependencies

2. **GlobalStyles**
   - Applies global CSS using theme tokens
   - Depends on: ThemeProvider

3. **ErrorBoundary**
   - Catches all errors in child components
   - No dependencies

4. **LanguageProvider**
   - Provides translation functions
   - **MUST** be before AuthProvider, CustomThemeProvider, ToastProvider
   - No dependencies

5. **CustomThemeProvider**
   - Provides dark/light mode toggle
   - Depends on: LanguageProvider

6. **AuthProvider**
   - Provides authentication state
   - **MUST** be before ProfileTypeProvider
   - Depends on: LanguageProvider

7. **ProfileTypeProvider**
   - Provides user profile type
   - Depends on: AuthProvider

8. **ToastProvider**
   - Provides toast notifications
   - Depends on: LanguageProvider

9. **GoogleReCaptchaProvider**
   - Provides reCAPTCHA functionality
   - No dependencies

10. **Router** (BrowserRouter)
    - Provides routing context
    - **MUST** wrap FilterProvider
    - No dependencies

11. **FilterProvider**
    - Provides search/filter state
    - Depends on: Router

### Dependency Graph

```
ThemeProvider
  └─ GlobalStyles
      └─ ErrorBoundary
          └─ LanguageProvider
              ├─ CustomThemeProvider
              ├─ AuthProvider
              │   └─ ProfileTypeProvider
              └─ ToastProvider
                  └─ GoogleReCaptchaProvider
                      └─ Router
                          └─ FilterProvider
                              └─ Children
```

## ⚠️ Critical Notes

### Provider Order is Critical

The provider order is **NOT arbitrary**. Each provider may depend on providers above it. Changing the order can break the application in subtle ways.

**Example of what can go wrong:**
- If `AuthProvider` is before `LanguageProvider`, error messages won't be translated
- If `ProfileTypeProvider` is before `AuthProvider`, it won't have access to user data
- If `FilterProvider` is before `Router`, navigation won't work

### Testing Provider Order

When modifying the provider order, test:
1. Authentication flow (login/logout)
2. Language switching
3. Theme switching (dark/light mode)
4. Profile type detection
5. Toast notifications
6. Search/filter functionality

## 🧪 Testing

### Running Tests

```bash
# Run all provider tests
npm test -- providers

# Run with coverage
npm test -- --coverage providers

# Watch mode
npm test -- --watch providers
```

### Test Coverage

The test suite covers:
- ✅ All providers are present
- ✅ Children are rendered correctly
- ✅ Missing configuration is handled gracefully
- ✅ Provider hierarchy is maintained

## 📊 Impact

### Before Refactoring

```tsx
// App.tsx (909 lines)
const App = () => {
  return (
    <ThemeProvider theme={bulgarianTheme}>
      <GlobalStyles />
      <ErrorBoundary>
        <LanguageProvider>
          <CustomThemeProvider>
            <AuthProvider>
              <ProfileTypeProvider>
                <ToastProvider>
                  <GoogleReCaptchaProvider>
                    <Router>
                      <FilterProvider>
                        {/* 90+ lines of provider nesting */}
                        <Routes>
                          {/* ... routes ... */}
                        </Routes>
                      </FilterProvider>
                    </Router>
                  </GoogleReCaptchaProvider>
                </ToastProvider>
              </ProfileTypeProvider>
            </AuthProvider>
          </CustomThemeProvider>
        </LanguageProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};
```

### After Refactoring

```tsx
// App.tsx (~50 lines)
import { AppProviders } from '@/providers';

const App = () => {
  return (
    <AppProviders>
      <Routes>
        {/* ... routes ... */}
      </Routes>
    </AppProviders>
  );
};
```

**Improvement**: App.tsx reduced by ~90 lines (10% of total file)

## 🔍 Debugging

### Common Issues

#### 1. "Cannot read property 'X' of undefined"
**Cause**: A component is trying to use a context before its provider is mounted.  
**Solution**: Ensure the provider is above the component in the tree.

#### 2. Translations not working
**Cause**: `LanguageProvider` is not high enough in the tree.  
**Solution**: `LanguageProvider` must be before any component that uses translations.

#### 3. Auth state not available
**Cause**: `AuthProvider` is not high enough in the tree.  
**Solution**: `AuthProvider` must be before any component that uses auth.

### Debugging Tips

1. **Use React DevTools**: Inspect the component tree to verify provider order
2. **Check Console**: Look for context-related errors
3. **Add Logging**: Temporarily add console.logs in providers to track initialization
4. **Test in Isolation**: Test each provider individually

## 🚀 Performance

### Optimizations

1. **Lazy Loading**: Non-critical components (FacebookPixel, ProgressBar) are lazy-loaded
2. **Memoization**: Each provider should memoize its value to prevent unnecessary re-renders
3. **Suspense Boundaries**: Strategic Suspense boundaries for better loading states

### Performance Monitoring

Monitor these metrics:
- Initial render time
- Provider initialization time
- Re-render frequency
- Memory usage

## 📝 Migration Guide

### From Legacy Provider Stack

**Before** (in App.tsx):
```tsx
<ThemeProvider theme={bulgarianTheme}>
  <GlobalStyles />
  <ErrorBoundary>
    {/* ... many nested providers ... */}
  </ErrorBoundary>
</ThemeProvider>
```

**After**:
```tsx
import { AppProviders } from '@/providers';

<AppProviders>
  {children}
</AppProviders>
```

### Gradual Migration

Use feature flags for gradual migration:

```tsx
import { FEATURE_FLAGS } from '@/config/feature-flags';
import { AppProviders } from '@/providers';

const App = () => {
  if (FEATURE_FLAGS.USE_EXTRACTED_PROVIDERS) {
    return <AppProviders><Routes /></AppProviders>;
  }
  
  // Legacy code
  return <ThemeProvider>...</ThemeProvider>;
};
```

## 🔗 Related

- [Feature Flags](../config/feature-flags.ts) - Controls rollout of new provider system
- [App.tsx](../App.tsx) - Main application component
- [Contexts](../contexts/) - Individual context implementations

---

**Created**: November 26, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Part of**: Week 1, Day 4 - Extract Provider Stack
