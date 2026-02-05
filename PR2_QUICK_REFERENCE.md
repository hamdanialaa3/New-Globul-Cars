# PR#2 Quick Reference Guide

## 🚀 Quick Start

This guide provides quick reference for implementing the PR#2 features in your codebase.

---

## 1. EIK Validation

### Basic Usage

```typescript
import { BulgarianEIKValidator, isValidEIK } from './bulgarian-eik-validator';

// Quick validation
if (isValidEIK('175074752')) {
  console.log('Valid EIK!');
}

// Detailed validation
const validator = new BulgarianEIKValidator();
const result = validator.validateEIK('175074752');

if (result.isValid) {
  console.log('Valid EIK');
  console.log('Format:', result.details?.format); // "EIK-9" or "EIK-13"
} else {
  console.error('Invalid EIK:', result.error);
}
```

### Common Use Cases

```typescript
// Validate user input
function validateBusinessForm(formData: any) {
  const validator = new BulgarianEIKValidator();
  const eikResult = validator.validateEIK(formData.eik);
  
  if (!eikResult.isValid) {
    return { error: eikResult.error };
  }
  
  // Proceed with form submission
  return { success: true };
}

// Format for display
const formatted = validator.formatEIK('175074752');
console.log(formatted); // "175-074-752"

// Check if string looks like EIK
if (validator.looksLikeEIK(userInput)) {
  // Perform full validation
}

// Batch validate
const eiks = ['175074752', '831919536', '123456789'];
const results = validator.validateBatch(eiks);
```

### Known Valid EIKs (for testing)

```typescript
// Use these for testing your implementation
const VALID_EIKS = {
  eik9_1: '175074752',  // Bulgartabac Holding AD
  eik9_2: '831919536',  // Sofia Municipality
  eik13_1: '1750747528001',  // Branch example
  eik13_2: '8319195360001'   // Branch example
};
```

---

## 2. Bulgarian Profile Service

### Setup

```typescript
import { BulgarianProfileService } from './bulgarian-profile-service';

const profileService = new BulgarianProfileService();
```

### Create Profile

```typescript
async function createBusinessProfile(userId: string) {
  try {
    const profile = await profileService.createProfile({
      eik: '175074752',
      companyName: 'My Bulgarian Company',
      address: {
        street: 'ul. Vitosha 1',
        city: 'Sofia',
        region: 'Sofia City',
        postalCode: '1000',
        country: 'Bulgaria'
      },
      contactPerson: 'John Doe',
      phone: '+359888123456',
      email: 'contact@company.bg',
      verificationStatus: 'pending',
      trustScore: 50
    }, userId);
    
    console.log('Profile created:', profile.id);
    return profile;
    
  } catch (error) {
    if (error.code === 'INVALID_EIK') {
      console.error('Invalid EIK provided');
    } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
      console.error('Too many requests');
    }
    throw error;
  }
}
```

### Get Profile (with caching)

```typescript
async function getBusinessProfile(profileId: string, userId: string) {
  try {
    const profile = await profileService.getProfile(profileId, userId);
    
    if (!profile) {
      console.log('Profile not found');
      return null;
    }
    
    console.log('Profile retrieved:', profile.companyName);
    return profile;
    
  } catch (error) {
    console.error('Error getting profile:', error.message);
    throw error;
  }
}
```

### Update Profile (with optimistic locking)

```typescript
async function updateBusinessProfile(
  profileId: string,
  userId: string,
  updates: Partial<BulgarianProfile>
) {
  try {
    const updatedProfile = await profileService.updateProfile(
      profileId,
      updates,
      userId
    );
    
    console.log('Profile updated:', updatedProfile.version);
    return updatedProfile;
    
  } catch (error) {
    if (error.code === 'UPDATE_CONFLICT') {
      console.error('Concurrent update detected, retrying...');
      // Retry logic here
    }
    throw error;
  }
}
```

### Delete Profile

```typescript
async function deleteBusinessProfile(profileId: string, userId: string) {
  try {
    await profileService.deleteProfile(profileId, userId);
    console.log('Profile deleted successfully');
    
  } catch (error) {
    if (error.code === 'PROFILE_NOT_FOUND') {
      console.error('Profile does not exist');
    }
    throw error;
  }
}
```

### Service Utilities

```typescript
// Check cache statistics
const cacheStats = profileService.getCacheStats();
console.log('Cache size:', cacheStats.size);
console.log('Cache TTL:', cacheStats.ttl, 'ms');

// Check remaining requests for rate limiting
const remaining = profileService.getRemainingRequests(userId);
console.log('Remaining requests:', remaining);

// Clear cache (if needed)
profileService.clearCache();
```

---

## 3. Repository Verification Middleware

### Setup

```typescript
import { RepositoryVerificationMiddleware } from './repository-verification.middleware';

const verificationMiddleware = new RepositoryVerificationMiddleware();
```

### Verify Before Read

```typescript
async function readRepository(repoId: string, userId: string) {
  // Verify repository exists and user has access
  const verification = await verificationMiddleware.verifyRepositoryExists(
    repoId,
    userId,
    {
      checkPermissions: true,
      checkLock: false,  // Not needed for read
      checkQuota: false
    }
  );
  
  if (!verification.isValid) {
    console.error('Verification failed:', verification.errors);
    return null;
  }
  
  if (verification.warnings.length > 0) {
    console.warn('Warnings:', verification.warnings);
  }
  
  // Proceed with read operation
  const data = await fetchRepositoryData(repoId);
  return data;
}
```

### Verify Before Write

```typescript
async function updateRepository(
  repoId: string,
  userId: string,
  updates: any
) {
  // Verify write permission
  const verification = await verificationMiddleware.verifyBeforeWrite(
    repoId,
    userId,
    'update'
  );
  
  if (!verification.isValid) {
    console.error('Write not allowed:', verification.errors);
    throw new Error('Cannot update repository');
  }
  
  // Perform update
  await performUpdate(repoId, updates);
  
  // Verify integrity after update
  const integrityCheck = await verificationMiddleware.verifyIntegrity(repoId);
  
  if (!integrityCheck.isValid) {
    console.error('Integrity check failed:', integrityCheck.errors);
    // Rollback or alert
    await rollbackUpdate(repoId);
    throw new Error('Data integrity compromised');
  }
  
  console.log('Repository updated successfully');
}
```

### Verify Different Operations

```typescript
// Create operation
const createCheck = await verificationMiddleware.verifyBeforeWrite(
  repoId, userId, 'create'
);

// Update operation
const updateCheck = await verificationMiddleware.verifyBeforeWrite(
  repoId, userId, 'update'
);

// Delete operation
const deleteCheck = await verificationMiddleware.verifyBeforeWrite(
  repoId, userId, 'delete'
);

// Archive operation
const archiveCheck = await verificationMiddleware.verifyBeforeWrite(
  repoId, userId, 'archive'
);
```

---

## 4. Error Handling

### Error Codes Reference

```typescript
enum BulgarianProfileError {
  INVALID_EIK = 'INVALID_EIK',
  PROFILE_NOT_FOUND = 'PROFILE_NOT_FOUND',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  UPDATE_CONFLICT = 'UPDATE_CONFLICT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  CACHE_ERROR = 'CACHE_ERROR'
}
```

### Error Handling Pattern

```typescript
try {
  await profileService.updateProfile(profileId, updates, userId);
} catch (error) {
  if (error instanceof BulgarianProfileException) {
    switch (error.code) {
      case BulgarianProfileError.INVALID_EIK:
        showError('Invalid business ID. Please check and try again.');
        break;
        
      case BulgarianProfileError.RATE_LIMIT_EXCEEDED:
        showError('Too many requests. Please wait a minute.');
        break;
        
      case BulgarianProfileError.UPDATE_CONFLICT:
        showError('This profile was updated by someone else. Please refresh.');
        break;
        
      case BulgarianProfileError.PROFILE_NOT_FOUND:
        showError('Profile not found. It may have been deleted.');
        break;
        
      default:
        showError('An error occurred. Please try again.');
    }
    
    // Log for debugging
    console.error('Profile error:', error.code, error.message, error.details);
  } else {
    showError('Unexpected error occurred.');
    console.error('Unexpected error:', error);
  }
}
```

---

## 5. React/UI Integration

### Form Validation Hook

```typescript
import { useState } from 'react';
import { BulgarianEIKValidator } from './bulgarian-eik-validator';

function useEIKValidation() {
  const [eikError, setEIKError] = useState<string | null>(null);
  const validator = new BulgarianEIKValidator();
  
  const validateEIK = (eik: string): boolean => {
    const result = validator.validateEIK(eik);
    
    if (!result.isValid) {
      setEIKError(result.error || 'Invalid EIK');
      return false;
    }
    
    setEIKError(null);
    return true;
  };
  
  return { validateEIK, eikError };
}

// Usage in component
function BusinessForm() {
  const { validateEIK, eikError } = useEIKValidation();
  const [eik, setEIK] = useState('');
  
  const handleEIKChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEIK(value);
    
    if (value.length >= 9) {
      validateEIK(value);
    }
  };
  
  return (
    <div>
      <input
        type="text"
        value={eik}
        onChange={handleEIKChange}
        placeholder="Enter EIK (9 or 13 digits)"
      />
      {eikError && <span className="error">{eikError}</span>}
    </div>
  );
}
```

### Profile Management Component

```typescript
function BusinessProfileManager() {
  const [profile, setProfile] = useState<BulgarianProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const profileService = new BulgarianProfileService();
  
  const loadProfile = async (profileId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await profileService.getProfile(profileId, currentUserId);
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const updateProfile = async (updates: Partial<BulgarianProfile>) => {
    if (!profile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updated = await profileService.updateProfile(
        profile.id,
        updates,
        currentUserId
      );
      setProfile(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {loading && <Loader />}
      {error && <ErrorMessage message={error} />}
      {profile && <ProfileDisplay profile={profile} onUpdate={updateProfile} />}
    </div>
  );
}
```

---

## 6. Testing Quick Reference

### Unit Test Template

```typescript
import { BulgarianEIKValidator } from './bulgarian-eik-validator';

describe('EIK Validation', () => {
  it('validates correct EIK', () => {
    const validator = new BulgarianEIKValidator();
    const result = validator.validateEIK('175074752');
    expect(result.isValid).toBe(true);
  });
  
  it('rejects invalid EIK', () => {
    const validator = new BulgarianEIKValidator();
    const result = validator.validateEIK('123456789');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### Integration Test Template

```typescript
describe('Profile Service Integration', () => {
  it('creates and retrieves profile', async () => {
    const service = new BulgarianProfileService();
    
    const created = await service.createProfile({
      eik: '175074752',
      companyName: 'Test Company',
      // ... other fields
    }, 'test-user');
    
    expect(created.id).toBeDefined();
    
    const retrieved = await service.getProfile(created.id, 'test-user');
    expect(retrieved?.companyName).toBe('Test Company');
  });
});
```

---

## 7. Common Pitfalls

### ❌ Don't Do This

```typescript
// Don't validate without checking result
validator.validateEIK(eik);  // Result ignored!

// Don't ignore rate limits
for (let i = 0; i < 100; i++) {
  await profileService.getProfile(id, userId);  // Will fail!
}

// Don't skip error handling
const profile = await profileService.getProfile(id, userId);  // Can throw!
```

### ✅ Do This Instead

```typescript
// Always check validation result
const result = validator.validateEIK(eik);
if (!result.isValid) {
  console.error(result.error);
  return;
}

// Respect rate limits
const remaining = profileService.getRemainingRequests(userId);
if (remaining === 0) {
  console.log('Rate limit reached, please wait');
  return;
}

// Always handle errors
try {
  const profile = await profileService.getProfile(id, userId);
} catch (error) {
  handleError(error);
}
```

---

## 8. Performance Tips

### Caching

```typescript
// Cache is automatic, but you can optimize:

// Clear cache when user logs out
window.addEventListener('logout', () => {
  profileService.clearCache();
});

// Pre-warm cache for frequently accessed profiles
const popularProfiles = ['id1', 'id2', 'id3'];
popularProfiles.forEach(id => {
  profileService.getProfile(id, userId).catch(() => {});
});
```

### Batch Operations

```typescript
// Instead of multiple single validations
const eiks = ['175074752', '831919536', '123456789'];
const results = validator.validateBatch(eiks);

// Process results
results.forEach((result, index) => {
  if (result.isValid) {
    console.log(`${eiks[index]}: Valid`);
  }
});
```

---

## 9. Configuration

### Adjust Rate Limits

```typescript
// In bulgarian-profile-service.example.ts
class BulgarianProfileRateLimiter {
  private readonly MAX_REQUESTS = 10;  // Change to 20 for higher limit
  private readonly WINDOW_MS = 60 * 1000;  // Change to 120000 for 2 minutes
}
```

### Adjust Cache TTL

```typescript
// In bulgarian-profile-service.example.ts
class BulgarianProfileCache {
  private readonly TTL = 5 * 60 * 1000;  // Change to 10 * 60 * 1000 for 10 minutes
}
```

---

## 10. Troubleshooting

### EIK Validation Issues

**Problem:** Valid EIK rejected  
**Solution:** Check for extra spaces or dashes. The validator handles these, but double-check input.

**Problem:** Getting wrong checksum  
**Solution:** Verify you're using the correct algorithm for 9 vs 13 digit EIKs.

### Profile Service Issues

**Problem:** Rate limit exceeded  
**Solution:** Check remaining requests with `getRemainingRequests()` before making calls.

**Problem:** Cache not working  
**Solution:** Verify profile IDs are consistent. Cache invalidation happens on updates.

**Problem:** Update conflicts  
**Solution:** This is expected with concurrent updates. The service retries automatically.

### Repository Verification Issues

**Problem:** Verification always fails  
**Solution:** Check that the repository exists and user has proper permissions.

**Problem:** Locked repository  
**Solution:** Verify the lock status and who locked it with the metadata returned.

---

## 📚 Additional Resources

- **Full Specification:** `PR2_REPOSITORY_VERIFICATION_SPEC.md`
- **Testing Guide:** `PR2_TESTING_GUIDE.md`
- **Implementation Summary:** `PR2_IMPLEMENTATION_SUMMARY.md`

---

**Quick Reference Version:** 1.0  
**Last Updated:** 2026-02-05  
**PR:** #2 of 3 (Phase-B)
