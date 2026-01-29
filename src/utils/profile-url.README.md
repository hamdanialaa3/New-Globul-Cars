# 🔒 Profile URL Utilities - Usage Guide
## Utility Functions for Constitution-Compliant Profile Navigation

**Created:** January 24, 2026  
**Status:** ✅ Production Ready  
**Location:** `src/utils/profile-url.utils.ts`

---

## 📋 Overview

This utility file provides helper functions to generate correct profile URLs according to the project's constitutional rules:

- `/profile/{numericId}` → ONLY for own profile
- `/profile/view/{numericId}` → For viewing other users' profiles

---

## 🎯 Quick Start

### Basic Usage

```typescript
import { getProfileUrl } from '@/utils/profile-url.utils';

// Example 1: Navigate to another user's profile
const url = getProfileUrl(80, 90); // Returns: /profile/view/80

// Example 2: Navigate to own profile
const url = getProfileUrl(90, 90); // Returns: /profile/90

// Example 3: With tab parameter
const url = getProfileUrl(80, 90, 'my-ads'); // Returns: /profile/view/80/my-ads
```

---

## 📚 API Reference

### 1. getProfileUrl()

**Smart URL Generator** - Automatically determines if it's own profile or other user's profile.

```typescript
getProfileUrl(
  targetNumericId: number | string,
  currentUserNumericId?: number | string | null,
  tab?: string
): string
```

**Parameters:**
- `targetNumericId` - The numeric ID of the profile to visit
- `currentUserNumericId` - (Optional) The numeric ID of the currently logged-in user
- `tab` - (Optional) Tab name (e.g., 'my-ads', 'favorites', 'settings')

**Returns:** Correct profile URL path

**Examples:**
```typescript
// Viewing another user's profile
getProfileUrl(80, 90); 
// → /profile/view/80

// Viewing own profile
getProfileUrl(90, 90); 
// → /profile/90

// With tab
getProfileUrl(80, 90, 'my-ads'); 
// → /profile/view/80/my-ads

// Without current user (defaults to public view)
getProfileUrl(80); 
// → /profile/view/80
```

---

### 2. getOwnProfileUrl()

**Own Profile URL Generator** - Always generates `/profile/{numericId}` format.

```typescript
getOwnProfileUrl(
  numericId: number | string,
  tab?: string
): string
```

**Use When:** You're 100% sure it's the current user's profile.

**Examples:**
```typescript
// Basic own profile
getOwnProfileUrl(90); 
// → /profile/90

// With tab
getOwnProfileUrl(90, 'favorites'); 
// → /profile/90/favorites
```

---

### 3. getPublicProfileUrl()

**Public Profile URL Generator** - Always generates `/profile/view/{numericId}` format.

```typescript
getPublicProfileUrl(
  numericId: number | string,
  tab?: string
): string
```

**Use When:** You want to view another user's profile.

**Examples:**
```typescript
// Basic public profile
getPublicProfileUrl(80); 
// → /profile/view/80

// With tab
getPublicProfileUrl(80, 'my-ads'); 
// → /profile/view/80/my-ads
```

---

### 4. isOwnProfileUrl()

**URL Ownership Checker** - Checks if a profile URL is for the current user.

```typescript
isOwnProfileUrl(
  url: string,
  currentUserNumericId: number | string | null | undefined
): boolean
```

**Examples:**
```typescript
isOwnProfileUrl('/profile/90', 90); 
// → true

isOwnProfileUrl('/profile/80', 90); 
// → false

isOwnProfileUrl('/profile/view/90', 90); 
// → false (public format, even if own profile)
```

---

### 5. extractProfileNumericId()

**Numeric ID Extractor** - Extracts the numeric ID from a profile URL.

```typescript
extractProfileNumericId(url: string): number | null
```

**Examples:**
```typescript
extractProfileNumericId('/profile/90'); 
// → 90

extractProfileNumericId('/profile/view/80'); 
// → 80

extractProfileNumericId('/profile/90/my-ads'); 
// → 90

extractProfileNumericId('/invalid'); 
// → null
```

---

### 6. validateProfileUrl()

**Constitution Validator** - Validates if a profile URL follows the constitution rules.

```typescript
validateProfileUrl(
  url: string,
  currentUserNumericId?: number | string | null
): {
  isValid: boolean;
  error?: string;
  suggestedUrl?: string;
}
```

**Examples:**
```typescript
// Valid: Own profile with correct format
validateProfileUrl('/profile/90', 90);
// → { isValid: true }

// Invalid: Accessing another user with private format
validateProfileUrl('/profile/80', 90);
// → {
//   isValid: false,
//   error: 'Cannot access another user\'s profile with private URL format',
//   suggestedUrl: '/profile/view/80'
// }

// Valid: Viewing another user with public format
validateProfileUrl('/profile/view/80', 90);
// → { isValid: true }
```

---

## 🔄 Migration Guide

### From Old Pattern to New Pattern

#### Before (Manual Logic)
```typescript
// ❌ Old way - prone to errors, inconsistent
const handleProfileClick = () => {
  if (isOwnProfile) {
    navigate(`/profile/${userId}`);
  } else {
    navigate(`/profile/view/${userId}`);
  }
};
```

#### After (Using Utilities)
```typescript
// ✅ New way - consistent, less error-prone
import { getProfileUrl } from '@/utils/profile-url.utils';

const handleProfileClick = () => {
  navigate(getProfileUrl(userId, currentUserId));
};
```

---

## 🎨 Real-World Examples

### Example 1: Car Details Page
```typescript
import { getPublicProfileUrl } from '@/utils/profile-url.utils';

const CarDetailsPage = ({ car }) => {
  const handleSellerClick = () => {
    // Seller is always another user (public view)
    navigate(getPublicProfileUrl(car.sellerNumericId));
  };

  return (
    <button onClick={handleSellerClick}>
      View Seller Profile
    </button>
  );
};
```

### Example 2: Navigation After Action
```typescript
import { getOwnProfileUrl } from '@/utils/profile-url.utils';

const WizardOrchestrator = () => {
  const handlePublishSuccess = (userNumericId) => {
    // After publishing ad, go to own profile
    navigate(getOwnProfileUrl(userNumericId, 'my-ads'));
  };
};
```

### Example 3: Link Component
```typescript
import { getProfileUrl } from '@/utils/profile-url.utils';

const UserCard = ({ userId, currentUserId }) => {
  return (
    <Link to={getProfileUrl(userId, currentUserId)}>
      View Profile
    </Link>
  );
};
```

### Example 4: URL Validation
```typescript
import { validateProfileUrl } from '@/utils/profile-url.utils';

const checkUrlBeforeNavigation = (url, currentUserId) => {
  const validation = validateProfileUrl(url, currentUserId);
  
  if (!validation.isValid) {
    console.warn(validation.error);
    if (validation.suggestedUrl) {
      return validation.suggestedUrl; // Use suggested URL
    }
  }
  
  return url;
};
```

---

## ⚠️ Important Notes

### 1. Type Safety
All functions accept both `number` and `string` for numeric IDs and convert internally:

```typescript
getProfileUrl('90', '80'); // ✅ Works
getProfileUrl(90, 80);     // ✅ Works
```

### 2. Null Handling
Functions gracefully handle null/undefined values:

```typescript
getProfileUrl(80, null);      // → /profile/view/80 (defaults to public)
getProfileUrl(80, undefined); // → /profile/view/80 (defaults to public)
```

### 3. Invalid ID Handling
If numeric ID is invalid, functions return safe fallback:

```typescript
getProfileUrl('invalid', 90);  // → /profile (fallback)
getOwnProfileUrl('invalid');   // → /profile (fallback)
```

### 4. Logging
All functions log errors to `logger-service` for debugging:

```typescript
logger.error('Invalid target numeric ID', { targetNumericId });
```

---

## 🧪 Testing

### Unit Tests Example
```typescript
import {
  getProfileUrl,
  getOwnProfileUrl,
  getPublicProfileUrl,
  isOwnProfileUrl,
  extractProfileNumericId,
  validateProfileUrl
} from '@/utils/profile-url.utils';

describe('Profile URL Utils', () => {
  describe('getProfileUrl', () => {
    it('should return own profile URL when IDs match', () => {
      expect(getProfileUrl(90, 90)).toBe('/profile/90');
    });

    it('should return public profile URL when IDs differ', () => {
      expect(getProfileUrl(80, 90)).toBe('/profile/view/80');
    });

    it('should include tab in URL', () => {
      expect(getProfileUrl(80, 90, 'my-ads')).toBe('/profile/view/80/my-ads');
    });

    it('should default to public when no currentUserId', () => {
      expect(getProfileUrl(80)).toBe('/profile/view/80');
    });
  });

  describe('getOwnProfileUrl', () => {
    it('should generate own profile URL', () => {
      expect(getOwnProfileUrl(90)).toBe('/profile/90');
    });

    it('should include tab', () => {
      expect(getOwnProfileUrl(90, 'favorites')).toBe('/profile/90/favorites');
    });
  });

  describe('getPublicProfileUrl', () => {
    it('should generate public profile URL', () => {
      expect(getPublicProfileUrl(80)).toBe('/profile/view/80');
    });

    it('should include tab', () => {
      expect(getPublicProfileUrl(80, 'my-ads')).toBe('/profile/view/80/my-ads');
    });
  });

  describe('isOwnProfileUrl', () => {
    it('should return true for own profile', () => {
      expect(isOwnProfileUrl('/profile/90', 90)).toBe(true);
    });

    it('should return false for other user', () => {
      expect(isOwnProfileUrl('/profile/80', 90)).toBe(false);
    });
  });

  describe('extractProfileNumericId', () => {
    it('should extract ID from /profile/{id}', () => {
      expect(extractProfileNumericId('/profile/90')).toBe(90);
    });

    it('should extract ID from /profile/view/{id}', () => {
      expect(extractProfileNumericId('/profile/view/80')).toBe(80);
    });

    it('should return null for invalid URL', () => {
      expect(extractProfileNumericId('/invalid')).toBe(null);
    });
  });

  describe('validateProfileUrl', () => {
    it('should validate own profile URL', () => {
      const result = validateProfileUrl('/profile/90', 90);
      expect(result.isValid).toBe(true);
    });

    it('should reject private URL for other user', () => {
      const result = validateProfileUrl('/profile/80', 90);
      expect(result.isValid).toBe(false);
      expect(result.suggestedUrl).toBe('/profile/view/80');
    });

    it('should validate public URL for other user', () => {
      const result = validateProfileUrl('/profile/view/80', 90);
      expect(result.isValid).toBe(true);
    });
  });
});
```

---

## 🔗 Related Documentation

- [PROFILE_ROUTING_COMPLETE_ANALYSIS.md](../PROFILE_ROUTING_COMPLETE_ANALYSIS.md) - Complete routing analysis
- [CONSTITUTION.md](../CONSTITUTION.md) - Project constitution rules
- [ProfilePageWrapper.tsx](../src/pages/03_user-pages/profile/ProfilePage/ProfilePageWrapper.tsx) - Route guard implementation

---

## 📊 Usage Statistics (Current Codebase)

### Files Already Implementing Correct Logic (No Migration Needed)
- ✅ CarDetailsGermanStyle.tsx - Uses own logic (correct)
- ✅ CarDetailsMobileDEStyle.tsx - Uses own logic (correct)
- ✅ FavoritesRedirectPage.tsx - Always own profile (correct)
- ✅ PendingFavoriteHandler.tsx - Always own profile (correct)
- ✅ WizardOrchestrator.tsx - Always own profile (correct)

### Future Usage (Optional Enhancement)
New code can use these utilities for cleaner, more consistent implementation.

---

**© 2026 Koli One - All Rights Reserved**  
**Last Updated:** January 24, 2026  
**Document:** Profile URL Utilities - Usage Guide  
**Status:** ✅ Production Ready
