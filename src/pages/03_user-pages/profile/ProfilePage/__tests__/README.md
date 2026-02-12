# Profile Routing Constitution Tests

## Overview

This directory contains **critical unit tests** that enforce the STRICT routing rules defined in `CONSTITUTION.md`.

**Purpose:** Ensure that profile routing follows constitutional rules at all times.

---

## Test File

### `ProfileRouting.constitution.test.tsx`

**6 Comprehensive Tests:**

| Test # | Scenario | Expected Result |
|--------|----------|-----------------|
| 1 | User 90 accessing `/profile/90` | ✅ ALLOWED (own profile) |
| 2 | User 90 accessing `/profile/80` | 🔄 REDIRECT to `/profile/view/80` |
| 3 | User 90 accessing `/profile/view/90` | 🔄 REDIRECT to `/profile/90` |
| 4 | User 80 accessing `/profile/view/80` | 🔄 REDIRECT to `/profile/80` |
| 5 | Loading State (no data) | ⏳ Shows validation message |
| 6 | Firebase UID in URL | ❌ REJECTED + redirect |

---

## Running Tests

### Run Constitution Tests Only:
```bash
npm test ProfileRouting.constitution.test
```

### Run All Profile Tests:
```bash
npm test profile
```

### Run with Coverage:
```bash
npm run test:ci
```

---

## Expected Output

```
PASS  src/pages/03_user-pages/profile/ProfilePage/__tests__/ProfileRouting.constitution.test.tsx
  🏛️ Constitution Profile Routing Tests
    ✅ RULE 1: User 90 can access own profile /profile/90
    ✅ RULE 2: User 90 accessing /profile/80 → REDIRECT to /profile/view/80
    ✅ RULE 3: User 90 accessing /profile/view/90 → REDIRECT to /profile/90
    ✅ RULE 4: User 80 accessing /profile/view/80 → REDIRECT to /profile/80
    ✅ Loading Guard: Shows validation message when data not ready
    ✅ Firebase UID in URL → Should reject and redirect

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Time:        2.145s
```

---

## Constitution Rules (Reference)

From `CONSTITUTION.md`:

```
User 90 (Owner):
✅ /profile/90 → Allowed (private profile)
❌ /profile/80 → REDIRECT to /profile/view/80
❌ /profile/view/90 → REDIRECT to /profile/90

User visiting User 80:
❌ /profile/80 → REDIRECT to /profile/view/80
✅ /profile/view/80 → Allowed (public view)
```

---

## When Tests Fail

### If Test 1 Fails (Own Profile Access):
**Problem:** User cannot access their own profile  
**Check:**
- `useProfile` hook returning correct `isOwnProfile`
- `viewer.numericId` matches `activeProfile.numericId`

### If Test 2 Fails (Other User Redirect):
**Problem:** User can access other user's private profile  
**Check:**
- `ProfilePageWrapper.tsx` routing logic (line ~130-170)
- Validation for `viewerNumericId !== targetNumericId`

### If Test 3/4 Fail (Owner Format Redirect):
**Problem:** Owner can access public view format  
**Check:**
- Logic for detecting `/profile/view/{own_id}`
- Redirect to `/profile/{own_id}` is working

### If Test 5 Fails (Loading Guard):
**Problem:** Content shown before validation complete  
**Check:**
- `isValidationReady` state is being set correctly
- Loading UI is rendering properly

### If Test 6 Fails (UID Rejection):
**Problem:** Firebase UIDs accepted in URLs  
**Check:**
- Regex validation `/^\d+$/` is working
- Redirect to `/profile` on invalid ID

---

## Test Mocks

### Required Mocks:
- `useAuth` → Current user data
- `useProfile` → Profile and viewer data
- `useNavigate` → Track redirects
- `useLocation` → Current path
- `useParams` → URL parameters

### Mock Structure:
```typescript
(useProfile as jest.Mock).mockReturnValue({
  user: { uid: 'firebase-uid-90', numericId: 90 },
  viewer: { uid: 'firebase-uid-90', numericId: 90 },
  target: null,
  loading: false,
  error: null,
  isOwnProfile: true
});
```

---

## Maintenance

### When to Update Tests:

1. **Constitution rules change** → Update test expectations
2. **New routing rules added** → Add new tests
3. **ProfilePageWrapper logic changes** → Verify all tests pass

### Adding New Tests:

```typescript
it('New routing rule description', async () => {
  // 1. Setup mocks
  (useProfile as jest.Mock).mockReturnValue({ /* ... */ });
  
  // 2. Render component
  render(
    <MemoryRouter initialEntries={['/profile/123']}>
      <ProfilePageWrapper />
    </MemoryRouter>
  );
  
  // 3. Assert behavior
  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith(/* expected redirect */);
  });
});
```

---

## Important Notes

⚠️ **CRITICAL:** These tests enforce CONSTITUTION rules. DO NOT disable or skip them.

✅ **Best Practice:** Run tests before every commit that touches profile routing.

📚 **Documentation:** See `CONSTITUTION.md` for full routing rules.

🔒 **Security:** These tests prevent unauthorized profile access.

---

**Last Updated:** January 24, 2026  
**Status:** ✅ All tests passing

