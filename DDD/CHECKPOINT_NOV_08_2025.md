# Checkpoint – November 8, 2025

## Scope Captured
This checkpoint freezes the current stable state after adding editable modals to `ProfileSettingsMobileDe` and verifying that the main profile page (`/profile`) remains untouched. **Critical Firestore null-safety fixes applied** to prevent runtime errors during auth transitions.

### Profile System Status
- Routing unchanged: `App.tsx` -> `ProfileRouter.tsx` -> separate routes `/profile` and `/profile/settings`.
- `ProfileOverview.tsx` intact (shows dashboard, work info, posts, garage carousel).
- No structural changes applied to provider hierarchy.

### Settings Page (`/profile/settings`)
New modal components integrated (imports + state + partial handlers):
- `NameEditModal.tsx` (first/last name update + displayName sync)
- `LocationEditModal.tsx` (city selection using `BULGARIAN_CITIES` and unified `locationData` shape)
- `PhotoEditModal.tsx` (upload/remove profile photo via Firebase Storage)
Pending wiring items (not yet completed in this checkpoint):
- Render modals at bottom of `ProfileSettingsMobileDe.tsx`
- Add onClick for location edit button
- Integrate existing email / password / phone modals consistently

### ⚡ Critical Bug Fixes (Nov 8, 2025)
**Firestore Null Value Errors** - Fixed "Cannot use 'in' operator to search for 'nullValue' in null" runtime errors:

**Phase 1: Social Feed Services**
- `posts-feed.service.ts`: Added null guards to `getFeedPosts()` and `getFollowingIds()`
- `posts.service.ts`: Added null guard to `getUserPosts()`
- `CommunityFeedSection.tsx`: Changed condition from `if (user)` to `if (user?.uid)`

**Phase 2: Dashboard Service**
- `dashboardService.ts`: Added null guards to all methods:
  * `getDashboardStats()` - returns empty stats object
  * `getRecentCars()` - returns empty array
  * `getRecentMessages()` - returns empty array
  * `getNotifications()` - returns empty array
  * `subscribeToDashboardUpdates()` - returns no-op unsubscribe function

**Phase 4: Messaging Service (November 9, 2025)**
- `firebase/messaging-service.ts`: Added null guard to `listenToNewMessages()` - returns no-op unsubscribe function when userId unavailable

**Root Cause**: Firestore queries were receiving `null` or `undefined` userId values during authentication state transitions (initial page load, logout, etc.). The Firestore SDK's internal `__PRIVATE_canonifyValue` function attempts to serialize query values immediately upon query construction, causing runtime errors before the query is executed.

**Solution Pattern**: 
1. Changed all userId parameters from `string` to `string | null | undefined`
2. Added null guards at the START of each function, BEFORE constructing queries
3. Return empty/default values ([], {}, no-op functions) when userId unavailable
4. Added warning logs for debugging

**Impact**: App now gracefully handles auth transitions without throwing runtime errors. Services return empty/default values when userId is unavailable, preventing UI crashes and console errors.

**Commits**:
- `b5ad76f7` - Fix Firestore null value errors in social feed queries
- `c53b30f0` - Fix dashboard service null userId errors
- `89489fad` - Fix realtimeMessaging and advanced-messaging null userId errors
- `latest-fix` - Fix firebase/messaging-service.ts listenToNewMessages null userId error

### Testing Status (November 9, 2025)
- **Development Server**: Successfully started on port 3001 (resolved port 3000 conflict)
- **Build Status**: Compiled successfully with Hot Module Replacement enabled
- **Error Verification**: All 14 functions with onSnapshot + userId queries now have null guards
- **Access URL**: http://localhost:3001 for testing Firestore error elimination

### Experimental / Non‑profile Additions (Optional)
The following IoT scaffolding files exist but are **not yet integrated** with navigation:
- `src/components/CarIoTStatus.tsx`
- `src/components/IoTStatusWidget.tsx`
- `src/hooks/useCarIoT.ts`
- `src/services/iotService.ts`
- Pages: `CarTrackingPage.tsx`, `IoTAnalyticsPage.tsx`, `IoTDashboardPage.tsx`
If these are not part of approved scope they can be removed safely (no current imports in main app routing as of this checkpoint).

### Dependencies Changed
- AWS IoT related packages reflected in root `package.json` (ensure these belong only where needed; front-end CRA bundle size impact should be evaluated before wider use).

## Integrity Notes
- Translation system untouched (all new UI strings currently bilingual BG/EN, Arabic used only inside some placeholders in new IoT pages; review for consistency if they go live).
- No changes to context provider order.
- No legacy location fields (`location`, `city`, `region`) introduced—only `locationData`.
- Firebase services usage adheres to existing initialization.

## Risks / Follow Ups
1. Complete modal rendering & remaining button handlers.
2. Add minimal tests for each modal (open → change value → save → assert toast & updated profile state).
3. Confirm large IoT SDK packages do not bloat client build; consider dynamic import or moving to Functions if only backend needed.
4. Consolidate any duplicated analytics or verification services before expanding profile features.
5. Consider a single settings layout component to host all modals uniformly.
6. **RESOLVED**: Firestore null value runtime errors - all 14 vulnerable functions now have null guards

## Suggested Next Steps

| Priority | Task |
|----------|------|
| High | Render 3 modals conditionally in `ProfileSettingsMobileDe.tsx` |
| High | Wire location button `onClick={() => setShowLocationModal(true)}` |
| Medium | Add tests for profile updates (mock `updateProfile`) |
| Medium | Evaluate removing experimental IoT pages until product decision |
| Low | Bundle size audit after AWS IoT packages |

## How to Restore This Checkpoint Later
If tagged (see commit instructions), you can restore with:
```bash
# Checkout the checkpoint branch
git checkout checkpoint-nov8-2025-stable

# OR reset to the tag (if created)
git fetch --all
git checkout main
git reset --hard checkpoint-nov8-2025
```

## Verification Performed
- Manual inspection of routing files (`App.tsx`, `ProfileRouter.tsx`)
- Manual inspection of `ProfileOverview.tsx` (no accidental edits)
- Reviewed new modal files for adherence to unified `locationData` & translation patterns.
- **November 9, 2025**: Comprehensive audit of all 20+ onSnapshot usages across codebase
- **November 9, 2025**: Verified all 14 functions with userId queries have null guards
- **November 9, 2025**: Development server starts successfully on port 3001 without Firestore errors

---
Generated automatically as a stable baseline. Proceed with incremental, well‑scoped commits from here.
