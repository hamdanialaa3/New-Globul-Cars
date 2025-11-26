# 📘 Migration Guide
## Complete Guide for Activating Refactored Code

**Version**: 1.0  
**Date**: November 26, 2025  
**Status**: Production Ready

---

## 🎯 Overview

This guide provides step-by-step instructions for migrating from the legacy codebase to the refactored architecture. All changes are behind feature flags for safe, gradual rollout.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Week 1 Migration](#week-1-migration)
3. [Week 2 Migration](#week-2-migration)
4. [Week 3 Migration](#week-3-migration)
5. [Testing Procedures](#testing-procedures)
6. [Rollback Procedures](#rollback-procedures)
7. [Monitoring](#monitoring)

---

## Prerequisites

### Before You Begin

✅ **Backup**: Create full backup of current codebase  
✅ **Tests**: Ensure all existing tests pass  
✅ **Documentation**: Read all README files  
✅ **Team**: Brief team on changes  
✅ **Monitoring**: Set up monitoring tools  

### Required Tools

- Node.js 16+
- npm 8+
- Git
- Code editor (VS Code recommended)

---

## Week 1 Migration

### Feature 1: Unified AuthGuard

**What Changed**: 3 guard components → 1 unified component

**Steps**:

1. **Enable Feature Flag**
   ```typescript
   // src/config/feature-flags.ts
   export const FEATURE_FLAGS = {
     USE_UNIFIED_AUTH_GUARD: true, // ← Change to true
     // ...
   };
   ```

2. **Update Imports** (if needed)
   ```typescript
   // Before
   import ProtectedRoute from '@/components/ProtectedRoute';
   import AdminRoute from '@/components/AdminRoute';
   
   // After
   import { AuthGuard } from '@/components/guards';
   ```

3. **Update Route Usage**
   ```typescript
   // Before
   <ProtectedRoute>
     <MyPage />
   </ProtectedRoute>
   
   // After
   <AuthGuard requireAuth={true}>
     <MyPage />
   </AuthGuard>
   ```

4. **Test**
   ```bash
   npm run type-check
   npm test
   npm run dev
   # Test all protected routes
   ```

5. **Deploy** (gradual rollout)
   - Deploy to staging
   - Test thoroughly
   - Deploy to 10% of production
   - Monitor for 24 hours
   - Deploy to 100%

---

### Feature 2: Extracted Providers

**What Changed**: Providers extracted from App.tsx to AppProviders.tsx

**Steps**:

1. **Enable Feature Flag**
   ```typescript
   // src/config/feature-flags.ts
   USE_EXTRACTED_PROVIDERS: true,
   ```

2. **Update App.tsx**
   ```typescript
   // Before
   <ThemeProvider>
     <LanguageProvider>
       <AuthProvider>
         {/* ... nested providers ... */}
       </AuthProvider>
     </LanguageProvider>
   </ThemeProvider>
   
   // After
   import { AppProviders } from '@/providers';
   
   <AppProviders>
     <Routes>...</Routes>
   </AppProviders>
   ```

3. **Test**
   ```bash
   npm test
   # Test all features that use contexts
   ```

4. **Deploy** (gradual rollout)

---

## Week 2 Migration

### Feature: Extracted Routes

**What Changed**: Routes extracted from App.tsx to separate files

**Steps**:

1. **Enable Master Flag**
   ```typescript
   // src/config/feature-flags.ts
   USE_EXTRACTED_ROUTES: true,
   ```

2. **Enable Individual Route Flags**
   ```typescript
   USE_AUTH_ROUTES: true,
   USE_ADMIN_ROUTES: true,
   USE_SELL_ROUTES: true,
   // Enable one at a time for safety
   ```

3. **Update App.tsx**
   ```typescript
   import { 
     AuthRoutes, 
     AdminRoutes, 
     SellRoutes, 
     MainRoutes,
     DealerRoutes 
   } from '@/routes';
   
   <Routes>
     <Route path="/*" element={<AuthRoutes />} />
     <Route path="/*" element={<AdminRoutes />} />
     <Route path="/*" element={<SellRoutes />} />
     <Route path="/*" element={<MainRoutes />} />
     <Route path="/*" element={<DealerRoutes />} />
   </Routes>
   ```

4. **Test Each Route File**
   ```bash
   # Test auth routes
   # Navigate to /login, /register, etc.
   
   # Test admin routes
   # Navigate to /admin, /super-admin, etc.
   
   # Test sell routes
   # Navigate to /sell/auto, etc.
   ```

5. **Deploy** (one route file at a time)
   - Enable AUTH_ROUTES first
   - Test for 24 hours
   - Enable ADMIN_ROUTES
   - Test for 24 hours
   - Continue for all route files

---

## Week 3 Migration

### Feature: React Router Outlets

**What Changed**: Wrapper-based layouts → Outlet-based layouts

**Steps**:

1. **Enable Feature Flag**
   ```typescript
   // src/config/feature-flags.ts
   USE_ROUTER_OUTLET_LAYOUTS: true,
   ```

2. **Update Route Files** (if not already done)
   ```typescript
   // Before
   <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
   
   // After
   <Route element={<MainLayout />}>
     <Route path="/" element={<HomePage />} />
   </Route>
   ```

3. **Test**
   ```bash
   # Navigate between routes
   # Verify layout persists
   # Check for re-render issues
   ```

4. **Monitor Performance**
   - Measure route transition time
   - Check layout re-renders
   - Verify improvements

5. **Deploy** (gradual rollout)

---

## Testing Procedures

### Automated Testing

```bash
# Type checking
npm run type-check

# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests (if available)
npm run test:e2e

# Build test
npm run build
```

### Manual Testing Checklist

#### Authentication
- [ ] Login works
- [ ] Logout works
- [ ] Registration works
- [ ] Email verification works
- [ ] OAuth callback works
- [ ] Protected routes redirect to login
- [ ] Admin routes require admin role

#### Navigation
- [ ] All routes accessible
- [ ] Browser back/forward works
- [ ] Deep linking works
- [ ] 404 page shows for invalid routes

#### Layouts
- [ ] Header persists across routes
- [ ] Footer persists across routes
- [ ] Layout doesn't re-render on navigation
- [ ] Full-screen layout works (no header/footer)

#### Performance
- [ ] Route transitions are fast
- [ ] No unnecessary re-renders
- [ ] No console errors
- [ ] No memory leaks

#### Mobile
- [ ] All features work on mobile
- [ ] Responsive design works
- [ ] Touch interactions work

---

## Rollback Procedures

### Emergency Rollback

If critical issues arise, rollback immediately:

```typescript
// src/config/feature-flags.ts
export const FEATURE_FLAGS = {
  USE_UNIFIED_AUTH_GUARD: false,      // ← Set to false
  USE_EXTRACTED_PROVIDERS: false,     // ← Set to false
  USE_EXTRACTED_ROUTES: false,        // ← Set to false
  USE_ROUTER_OUTLET_LAYOUTS: false,   // ← Set to false
  // ...
};
```

**Deploy immediately** - Legacy code will be used.

### Partial Rollback

Rollback specific features:

```typescript
// Rollback only routes
USE_EXTRACTED_ROUTES: false,
USE_AUTH_ROUTES: false,
USE_SELL_ROUTES: false,
// Keep other features enabled
```

### Git Rollback

If feature flags don't work:

```bash
# Rollback to previous commit
git revert HEAD
git push

# Or rollback to specific commit
git reset --hard <commit-hash>
git push --force
```

---

## Monitoring

### Metrics to Monitor

1. **Error Rate**
   - Watch for increase in errors
   - Monitor error types
   - Check error frequency

2. **Performance**
   - Route transition time
   - Layout re-render count
   - Bundle size
   - Load time

3. **User Experience**
   - Navigation success rate
   - Authentication success rate
   - Page load time
   - User complaints

### Monitoring Tools

- **Console**: Check for errors
- **React DevTools**: Check re-renders
- **Network Tab**: Check requests
- **Performance Tab**: Check performance
- **Analytics**: Check user behavior

### Alert Thresholds

- **Error Rate**: >5% increase → Investigate
- **Error Rate**: >10% increase → Rollback
- **Performance**: >20% slower → Investigate
- **Performance**: >50% slower → Rollback

---

## Gradual Rollout Strategy

### Phase 1: Staging (Day 1)
- Enable all features in staging
- Test thoroughly
- Fix any issues

### Phase 2: 10% Production (Day 2-3)
- Enable for 10% of users
- Monitor closely
- Fix any issues

### Phase 3: 50% Production (Day 4-5)
- Enable for 50% of users
- Monitor
- Fix any issues

### Phase 4: 100% Production (Day 6-7)
- Enable for all users
- Monitor
- Celebrate! 🎉

### Phase 5: Cleanup (Week 2)
- Remove legacy code
- Remove feature flags
- Update documentation

---

## Common Issues & Solutions

### Issue: Routes not working

**Solution**:
1. Check feature flags are enabled
2. Check route file imports
3. Check route paths match
4. Check console for errors

### Issue: Layout re-rendering

**Solution**:
1. Verify Outlet pattern is used
2. Check for unnecessary state in layout
3. Use React DevTools to debug

### Issue: Authentication not working

**Solution**:
1. Check AuthGuard is imported correctly
2. Check feature flag is enabled
3. Check user session is valid
4. Check console for errors

---

## Support

### Getting Help

- **Documentation**: Check all README files
- **Code Comments**: Check inline comments
- **Git History**: Check commit messages
- **Team**: Ask team members

### Reporting Issues

1. Check if issue is known
2. Try rollback procedure
3. Document issue clearly
4. Report to team lead

---

## Conclusion

This migration guide provides all necessary steps for safe, gradual activation of refactored code. Follow procedures carefully and monitor closely.

**Remember**: You can always rollback by setting feature flags to `false`.

---

**Version**: 1.0  
**Last Updated**: November 26, 2025  
**Status**: ✅ Complete
