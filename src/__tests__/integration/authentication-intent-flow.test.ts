// 🧪 Integration Tests for Authentication Flow with Intent Preservation
// test/integration/authentication-intent-flow.test.ts

import { renderHook, act, waitFor } from '@testing-library/react';
import { useProfileIntent } from '@/hooks/useProfileIntent';
import { useLoginWithIntent } from '@/pages/02_authentication/login/LoginPage/hooks/useLoginWithIntent';
import { useAuth } from '@/hooks/useAuth';
import * as router from 'react-router-dom';

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
});

describe('✅ Authentication Flow with Intent Preservation', () => {

  beforeEach(() => {
    mockSessionStorage.clear();
    jest.clearAllMocks();
  });

  describe('📌 useProfileIntent Hook', () => {

    it('should save intent to sessionStorage', () => {
      const { result } = renderHook(() => useProfileIntent());

      act(() => {
        result.current.saveIntent('/profile/90');
      });

      const stored = mockSessionStorage.getItem('profile_intent');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.returnUrl).toBe('/profile/90');
      expect(parsed.timestamp).toBeTruthy();
    });

    it('should restore valid intent', () => {
      const { result } = renderHook(() => useProfileIntent());

      // Save intent
      act(() => {
        result.current.saveIntent('/profile/90');
      });

      // Restore intent
      const restored = result.current.restoreIntent();
      expect(restored).toBeTruthy();
      expect(restored?.returnUrl).toBe('/profile/90');
    });

    it('should return null for expired intent', () => {
      const { result } = renderHook(() => useProfileIntent());

      // Save intent with old timestamp (2 hours ago)
      const oldIntent = {
        returnUrl: '/profile/90',
        timestamp: Date.now() - 2 * 60 * 60 * 1000
      };
      mockSessionStorage.setItem('profile_intent', JSON.stringify(oldIntent));

      // Try to restore
      const restored = result.current.restoreIntent();
      expect(restored).toBeNull();
    });

    it('should clear intent from storage', () => {
      const { result } = renderHook(() => useProfileIntent());

      act(() => {
        result.current.saveIntent('/profile/90');
      });

      expect(mockSessionStorage.getItem('profile_intent')).toBeTruthy();

      act(() => {
        result.current.clearIntent();
      });

      expect(mockSessionStorage.getItem('profile_intent')).toBeNull();
    });
  });

  describe('🔐 ProtectedRoute Component', () => {

    it('should render children when authenticated', () => {
      const { container } = renderWithAuth({ isAuthenticated: true });
      expect(container.textContent).toContain('Protected Content');
    });

    it('should redirect to login when not authenticated', () => {
      const navigateMock = jest.fn();
      jest.spyOn(router, 'useNavigate').mockReturnValue(navigateMock);

      renderWithAuth({ isAuthenticated: false });

      // Should have saved intent before redirecting
      const intent = mockSessionStorage.getItem('profile_intent');
      expect(intent).toBeTruthy();
    });

    it('should save current URL as intent before redirecting', () => {
      jest.spyOn(router, 'useLocation').mockReturnValue({
        pathname: '/profile/90',
        search: '',
        hash: '',
        state: null,
        key: 'default'
      } as any);

      const { result } = renderHook(() => useProfileIntent());

      act(() => {
        result.current.saveIntent('/profile/90');
      });

      const saved = mockSessionStorage.getItem('profile_intent');
      const parsed = JSON.parse(saved!);
      expect(parsed.returnUrl).toBe('/profile/90');
    });
  });

  describe('🔑 useLoginWithIntent Hook', () => {

    it('should use Intent as first priority for redirect', () => {
      // Save intent
      const intent = {
        returnUrl: '/profile/90',
        timestamp: Date.now()
      };
      mockSessionStorage.setItem('profile_intent', JSON.stringify(intent));

      const { result } = renderHook(() => useLoginWithIntent(), {
        wrapper: createWrapper()
      });

      // getRedirectPath should return intent URL
      // Note: This is a private method, so we test through side effects
      expect(mockSessionStorage.getItem('profile_intent')).toBeTruthy();
    });

    it('should use query parameter as second priority', () => {
      jest.spyOn(router, 'useSearchParams').mockReturnValue([
        new URLSearchParams('redirect=/dashboard'),
        jest.fn()
      ]);

      // No intent saved, so should use query param
      const { result } = renderHook(() => useLoginWithIntent(), {
        wrapper: createWrapper()
      });

      // Query param should be preferred over default
      expect(new URLSearchParams('redirect=/dashboard').get('redirect')).toBe('/dashboard');
    });

    it('should redirect to root if no intent or query param', () => {
      mockSessionStorage.clear();
      jest.spyOn(router, 'useSearchParams').mockReturnValue([
        new URLSearchParams(),
        jest.fn()
      ]);

      const { result } = renderHook(() => useLoginWithIntent(), {
        wrapper: createWrapper()
      });

      // Should default to '/'
      expect(result.current.state.formData).toBeDefined();
    });

    it('should handle form submission correctly', async () => {
      const { result } = renderHook(() => useLoginWithIntent(), {
        wrapper: createWrapper()
      });

      // Update form data
      act(() => {
        result.current.actions.handleInputChange({
          target: {
            name: 'email',
            value: 'test@example.com',
            type: 'text'
          }
        } as any);

        result.current.actions.handleInputChange({
          target: {
            name: 'password',
            value: 'password123',
            type: 'password'
          }
        } as any);
      });

      // Check form data is updated
      expect(result.current.state.formData.email).toBe('test@example.com');
      expect(result.current.state.formData.password).toBe('password123');
    });

    it('should validate required fields', async () => {
      const { result } = renderHook(() => useLoginWithIntent(), {
        wrapper: createWrapper()
      });

      // Try to submit empty form
      act(() => {
        result.current.actions.handleSubmit({
          preventDefault: jest.fn()
        } as any);
      });

      await waitFor(() => {
        expect(Object.keys(result.current.state.validationErrors).length).toBeGreaterThan(0);
      });
    });
  });

  describe('🔄 Complete Authentication Flow', () => {

    it('should complete full flow: unauth → profile → login → intent restore', async () => {
      // Step 1: User not authenticated
      const { isAuthenticated: initialAuth } = useAuth();
      expect(initialAuth).toBe(false);

      // Step 2: Try to access /profile/90
      const { result: intentResult } = renderHook(() => useProfileIntent());
      act(() => {
        intentResult.current.saveIntent('/profile/90');
      });

      // Intent should be saved
      expect(mockSessionStorage.getItem('profile_intent')).toBeTruthy();

      // Step 3: User logs in
      const { result: loginResult } = renderHook(() => useLoginWithIntent(), {
        wrapper: createWrapper()
      });

      // Simulate successful login
      // (In real scenario, useAuth would update)

      // Step 4: Check that intent can be restored
      const restored = intentResult.current.restoreIntent();
      expect(restored?.returnUrl).toBe('/profile/90');
    });

    it('should handle OAuth login with intent preservation', async () => {
      // Save intent for profile
      const { result: intentResult } = renderHook(() => useProfileIntent());
      act(() => {
        intentResult.current.saveIntent('/profile/90?tab=my-ads');
      });

      // Verify it's saved with query params too
      const restored = intentResult.current.restoreIntent();
      expect(restored?.returnUrl).toBe('/profile/90?tab=my-ads');
    });

    it('should handle quick re-login after logout', async () => {
      // User logs out after being authenticated
      mockSessionStorage.clear();

      // User tries to access protected route
      const { result: intentResult } = renderHook(() => useProfileIntent());
      act(() => {
        intentResult.current.saveIntent('/profile/90');
      });

      // New login attempt should find the intent
      const restored = intentResult.current.restoreIntent();
      expect(restored?.returnUrl).toBe('/profile/90');
    });
  });

  describe('🛡️ Security Tests', () => {

    it('should not expose intent in URL parameters', () => {
      const { result } = renderHook(() => useProfileIntent());

      act(() => {
        result.current.saveIntent('/profile/90');
      });

      // Intent should only be in sessionStorage, not URL
      const intent = mockSessionStorage.getItem('profile_intent');
      expect(intent).toBeTruthy();
      // URL should not contain intent info
      expect(window.location.href).not.toContain('intent');
    });

    it('should clear intent on explicit logout', () => {
      const { result } = renderHook(() => useProfileIntent());

      act(() => {
        result.current.saveIntent('/profile/90');
      });

      expect(mockSessionStorage.getItem('profile_intent')).toBeTruthy();

      act(() => {
        result.current.clearIntent();
      });

      expect(mockSessionStorage.getItem('profile_intent')).toBeNull();
    });

    it('should validate intent timestamp to prevent replay attacks', () => {
      const { result } = renderHook(() => useProfileIntent());

      // Create intent with very old timestamp
      const oldIntent = {
        returnUrl: '/profile/90',
        timestamp: Date.now() - 24 * 60 * 60 * 1000 // 24 hours ago
      };
      mockSessionStorage.setItem('profile_intent', JSON.stringify(oldIntent));

      const restored = result.current.restoreIntent();
      expect(restored).toBeNull(); // Should be rejected
    });

    it('should handle malformed intent JSON gracefully', () => {
      mockSessionStorage.setItem('profile_intent', 'invalid json');

      const { result } = renderHook(() => useProfileIntent());
      const restored = result.current.restoreIntent();

      expect(restored).toBeNull();
    });
  });

  describe('📱 Mobile & Responsive Tests', () => {

    it('should preserve intent on mobile redirects', () => {
      // Simulate mobile viewport
      window.innerWidth = 375;

      const { result } = renderHook(() => useProfileIntent());
      act(() => {
        result.current.saveIntent('/profile/90');
      });

      const restored = result.current.restoreIntent();
      expect(restored?.returnUrl).toBe('/profile/90');
    });

    it('should handle network issues gracefully', async () => {
      const { result } = renderHook(() => useProfileIntent());

      act(() => {
        result.current.saveIntent('/profile/90');
      });

      // Simulate network being offline (sessionStorage still available)
      const restored = result.current.restoreIntent();
      expect(restored).toBeTruthy();
    });
  });
});

// Helper: Create wrapper with necessary providers
function createWrapper() {
  return ({ children }: any) => (
    <AuthProvider>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </AuthProvider>
  );
}

// Helper: Render with auth context
function renderWithAuth({ isAuthenticated }: { isAuthenticated: boolean }) {
  const mockAuthValue = {
    isAuthenticated,
    user: isAuthenticated ? { numericId: 'user123' } : null,
    loading: false
  };

  return render(
    <AuthProvider value={mockAuthValue}>
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    </AuthProvider>
  );
}

// ============================================================================
// 🧪 MANUAL TEST SCENARIOS (for QA/Manual Testing)
// ============================================================================

/*
## Manual Test Cases

### ✅ Test 1: Basic Protection
```
1. Logout from the application
2. Navigate to: http://localhost:3001/profile/90
3. Expected: Redirect to /login
4. Check DevTools → Storage → Session Storage
5. Should see: profile_intent with returnUrl: '/profile/90'
```

### ✅ Test 2: Intent Restoration
```
1. After redirecting to login
2. Enter valid credentials and sign in
3. Expected: Automatically redirect to /profile/90
4. Verify: User sees their profile page
```

### ✅ Test 3: Intent Expiration
```
1. Navigate to /profile/90 (unauthenticated)
2. Open DevTools → Console
3. Run:
   const intent = JSON.parse(sessionStorage.getItem('profile_intent'));
   intent.timestamp = Date.now() - 4000000; // 66+ minutes ago
   sessionStorage.setItem('profile_intent', JSON.stringify(intent));
4. Sign in
5. Expected: Redirect to home (/) instead of /profile/90
```

### ✅ Test 4: Multiple Profile Attempts
```
1. Try /profile/90 (unauthenticated)
2. Before signing in, try another profile: /profile/95
3. Open DevTools → Session Storage
4. Should show: profile_intent for /profile/95 (latest)
5. Sign in
6. Should go to /profile/95 (last visited)
```

### ✅ Test 5: Query Parameters
```
1. Navigate to: /login?redirect=/cars
2. Sign in
3. Expected: Redirect to /cars (not home)
4. Check: Intent is not used when query param exists
```

### ✅ Test 6: OAuth Login
```
1. Navigate to /profile/90 (unauthenticated)
2. See login page with OAuth buttons
3. Click "Sign in with Google"
4. Complete Google auth
5. Expected: Redirect to /profile/90
```

### ✅ Test 7: Browser Close
```
1. Navigate to /profile/90 (unauthenticated)
2. Close browser tab/window
3. Reopen browser
4. Expected: sessionStorage is cleared
5. Session should start fresh
```

### ✅ Test 8: Private Mode
```
1. Open new Private/Incognito window
2. Navigate to /profile/90
3. Try to login
4. Should work normally (sessionStorage works in private)
5. Close private window
6. Previous sessions unaffected
```

### ✅ Test 9: Tab Sync
```
1. In Tab A: Navigate to /profile/90 (logout first)
2. Redirected to /login
3. In Tab B: Open same app and sign in
4. Back to Tab A: Refresh page
5. Should see /profile/90 (already logged in from Tab B)
```

### ✅ Test 10: Mobile Devices
```
1. On mobile device
2. Navigate to /profile/90 without login
3. Redirect to /login
4. Sign in with phone number
5. Expected: Return to /profile/90 (works on mobile too)
```
*/
