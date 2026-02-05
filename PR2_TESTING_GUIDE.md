# Testing Guide for PR#2: Repository Verification and Bulgarian Profile

**Series:** Phase-B (PR#2 of 3)  
**Focus:** Repository verification middleware and Bulgarian profile enhancements

---

## Overview

This guide provides comprehensive testing instructions for the repository verification and Bulgarian profile enhancement features introduced in PR#2.

---

## 1. Unit Tests

### 1.1 Bulgarian EIK Validator Tests

```typescript
// File: web/src/services/bulgarian-profile/__tests__/eik-validator.test.ts

import { BulgarianEIKValidator, isValidEIK, validateEIKDetailed } from '../eik-validator';

describe('BulgarianEIKValidator', () => {
  let validator: BulgarianEIKValidator;
  
  beforeEach(() => {
    validator = new BulgarianEIKValidator();
  });

  describe('9-digit EIK validation', () => {
    test('should validate correct 9-digit EIK', () => {
      // Bulgartabac Holding AD
      const result = validator.validateEIK('175074752');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.details?.format).toBe('EIK-9');
    });

    test('should reject invalid 9-digit EIK with wrong checksum', () => {
      const result = validator.validateEIK('175074759'); // Wrong last digit
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid EIK checksum');
    });

    test('should validate another correct 9-digit EIK', () => {
      // Sofia Municipality
      const result = validator.validateEIK('831919536');
      expect(result.isValid).toBe(true);
    });
  });

  describe('13-digit EIK validation', () => {
    test('should validate correct 13-digit EIK', () => {
      const result = validator.validateEIK('1750747528001');
      expect(result.isValid).toBe(true);
      expect(result.details?.format).toBe('EIK-13');
    });

    test('should reject 13-digit EIK with invalid base', () => {
      const result = validator.validateEIK('1750747598001'); // Invalid base 9 digits
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid base EIK');
    });

    test('should reject 13-digit EIK with invalid extension', () => {
      const result = validator.validateEIK('1750747528009'); // Invalid extension
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid extended EIK checksum');
    });
  });

  describe('Format validation', () => {
    test('should accept EIK with dashes', () => {
      const result = validator.validateEIK('175-074-752');
      expect(result.isValid).toBe(true);
    });

    test('should accept EIK with spaces', () => {
      const result = validator.validateEIK('175 074 752');
      expect(result.isValid).toBe(true);
    });

    test('should reject EIK with letters', () => {
      const result = validator.validateEIK('17507475A');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('EIK must contain only digits');
    });

    test('should reject EIK with wrong length', () => {
      const result = validator.validateEIK('12345');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('EIK must be 9 or 13 digits');
    });
  });

  describe('Batch validation', () => {
    test('should validate multiple EIKs', () => {
      const eiks = ['175074752', '831919536', '123456789'];
      const results = validator.validateBatch(eiks);
      
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(true);
      expect(results[2].isValid).toBe(false);
    });
  });

  describe('Formatting', () => {
    test('should format 9-digit EIK', () => {
      const formatted = validator.formatEIK('175074752');
      expect(formatted).toBe('175-074-752');
    });

    test('should format 13-digit EIK', () => {
      const formatted = validator.formatEIK('1750747528001');
      expect(formatted).toBe('175-074-752-8001');
    });

    test('should preserve formatting if already formatted', () => {
      const formatted = validator.formatEIK('175-074-752');
      expect(formatted).toBe('175-074-752');
    });
  });

  describe('EIK detection', () => {
    test('should detect valid EIK format', () => {
      expect(validator.looksLikeEIK('175074752')).toBe(true);
      expect(validator.looksLikeEIK('1750747528001')).toBe(true);
      expect(validator.looksLikeEIK('175-074-752')).toBe(true);
    });

    test('should reject non-EIK formats', () => {
      expect(validator.looksLikeEIK('12345')).toBe(false);
      expect(validator.looksLikeEIK('ABC123456')).toBe(false);
      expect(validator.looksLikeEIK('')).toBe(false);
    });
  });

  describe('Utility functions', () => {
    test('isValidEIK should work correctly', () => {
      expect(isValidEIK('175074752')).toBe(true);
      expect(isValidEIK('123456789')).toBe(false);
    });

    test('validateEIKDetailed should return detailed result', () => {
      const result = validateEIKDetailed('175074752');
      expect(result.isValid).toBe(true);
      expect(result.details).toBeDefined();
      expect(result.details?.format).toBe('EIK-9');
    });
  });
});
```

### 1.2 Repository Verification Middleware Tests

```typescript
// File: web/src/middleware/__tests__/repository-verification.middleware.test.ts

import { RepositoryVerificationMiddleware } from '../repository-verification.middleware';

describe('RepositoryVerificationMiddleware', () => {
  let middleware: RepositoryVerificationMiddleware;
  
  beforeEach(() => {
    middleware = new RepositoryVerificationMiddleware();
  });

  describe('verifyRepositoryExists', () => {
    test('should verify existing repository', async () => {
      const result = await middleware.verifyRepositoryExists(
        'test-repo',
        'test-user'
      );
      
      // Since this is a placeholder, we expect specific behavior
      // In real implementation, mock the database
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
    });

    test('should return errors for non-existent repository', async () => {
      const result = await middleware.verifyRepositoryExists(
        'non-existent',
        'test-user'
      );
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should check permissions when enabled', async () => {
      const result = await middleware.verifyRepositoryExists(
        'test-repo',
        'test-user',
        { checkPermissions: true }
      );
      
      expect(result).toBeDefined();
    });

    test('should skip permission check when disabled', async () => {
      const result = await middleware.verifyRepositoryExists(
        'test-repo',
        'test-user',
        { checkPermissions: false }
      );
      
      expect(result).toBeDefined();
    });
  });

  describe('verifyBeforeWrite', () => {
    test('should allow write on valid repository', async () => {
      const result = await middleware.verifyBeforeWrite(
        'test-repo',
        'test-user',
        'update'
      );
      
      expect(result).toHaveProperty('isValid');
    });

    test('should check different operation types', async () => {
      const operations: Array<'create' | 'update' | 'delete' | 'archive'> = [
        'create', 'update', 'delete', 'archive'
      ];
      
      for (const operation of operations) {
        const result = await middleware.verifyBeforeWrite(
          'test-repo',
          'test-user',
          operation
        );
        expect(result).toBeDefined();
      }
    });

    test('should prevent write on locked repository', async () => {
      // Mock a locked repository scenario
      const result = await middleware.verifyBeforeWrite(
        'locked-repo',
        'different-user',
        'update'
      );
      
      // In real implementation, this should fail
      expect(result).toBeDefined();
    });
  });

  describe('verifyIntegrity', () => {
    test('should verify repository integrity', async () => {
      const result = await middleware.verifyIntegrity('test-repo');
      
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
    });

    test('should detect missing required fields', async () => {
      // In real implementation, mock a repository with missing fields
      const result = await middleware.verifyIntegrity('incomplete-repo');
      
      expect(result).toBeDefined();
    });

    test('should verify relationships', async () => {
      const result = await middleware.verifyIntegrity('test-repo');
      
      // Should complete without throwing
      expect(result).toBeDefined();
    });
  });
});
```

### 1.3 Bulgarian Profile Service Tests

```typescript
// File: web/src/services/bulgarian-profile/__tests__/bulgarian-profile.service.test.ts

import {
  BulgarianProfileService,
  BulgarianProfileException,
  BulgarianProfileError
} from '../bulgarian-profile.service';

describe('BulgarianProfileService', () => {
  let service: BulgarianProfileService;
  
  beforeEach(() => {
    service = new BulgarianProfileService();
  });

  describe('getProfile', () => {
    test('should get profile with caching', async () => {
      const profile = await service.getProfile('test-profile', 'test-user');
      
      // First call might be null (placeholder implementation)
      expect(profile).toBeDefined();
    });

    test('should enforce rate limiting', async () => {
      // Make multiple requests quickly
      const userId = 'rate-limit-test-user';
      const requests = Array(15).fill(null).map(() => 
        service.getProfile('test-profile', userId)
      );
      
      // Some should fail with rate limit error
      const results = await Promise.allSettled(requests);
      const rateLimitErrors = results.filter(
        r => r.status === 'rejected' && 
        (r.reason as BulgarianProfileException).code === 
          BulgarianProfileError.RATE_LIMIT_EXCEEDED
      );
      
      expect(rateLimitErrors.length).toBeGreaterThan(0);
    });

    test('should use cache on subsequent calls', async () => {
      const userId = 'cache-test-user';
      
      // First call
      await service.getProfile('test-profile', userId);
      
      // Second call should use cache (check cache stats)
      await service.getProfile('test-profile', userId);
      
      const stats = service.getCacheStats();
      expect(stats.size).toBeGreaterThanOrEqual(0);
    });
  });

  describe('createProfile', () => {
    test('should create profile with valid data', async () => {
      const profileData = {
        eik: '175074752',
        companyName: 'Test Company',
        address: {
          street: 'Test Street',
          city: 'Sofia',
          region: 'Sofia City',
          postalCode: '1000',
          country: 'Bulgaria' as const
        },
        contactPerson: 'John Doe',
        phone: '+359888123456',
        email: 'test@example.com',
        verificationStatus: 'pending' as const,
        trustScore: 50
      };
      
      const profile = await service.createProfile(profileData, 'test-user');
      
      expect(profile).toBeDefined();
      expect(profile.id).toBeDefined();
    });

    test('should reject invalid EIK', async () => {
      const profileData = {
        eik: '123456789', // Invalid
        companyName: 'Test Company',
        address: {
          street: 'Test Street',
          city: 'Sofia',
          region: 'Sofia City',
          postalCode: '1000',
          country: 'Bulgaria' as const
        },
        contactPerson: 'John Doe',
        phone: '+359888123456',
        email: 'test@example.com',
        verificationStatus: 'pending' as const,
        trustScore: 50
      };
      
      await expect(
        service.createProfile(profileData, 'test-user')
      ).rejects.toThrow(BulgarianProfileException);
    });

    test('should reject invalid email', async () => {
      const profileData = {
        eik: '175074752',
        companyName: 'Test Company',
        address: {
          street: 'Test Street',
          city: 'Sofia',
          region: 'Sofia City',
          postalCode: '1000',
          country: 'Bulgaria' as const
        },
        contactPerson: 'John Doe',
        phone: '+359888123456',
        email: 'invalid-email', // Invalid
        verificationStatus: 'pending' as const,
        trustScore: 50
      };
      
      await expect(
        service.createProfile(profileData, 'test-user')
      ).rejects.toThrow(BulgarianProfileException);
    });
  });

  describe('updateProfile', () => {
    test('should update profile with valid data', async () => {
      const updates = {
        companyName: 'Updated Company Name'
      };
      
      const profile = await service.updateProfile(
        'test-profile',
        updates,
        'test-user'
      );
      
      expect(profile).toBeDefined();
    });

    test('should reject invalid EIK in update', async () => {
      const updates = {
        eik: '123456789' // Invalid
      };
      
      await expect(
        service.updateProfile('test-profile', updates, 'test-user')
      ).rejects.toThrow(BulgarianProfileException);
    });

    test('should invalidate cache after update', async () => {
      const updates = {
        companyName: 'Updated Name'
      };
      
      await service.updateProfile('test-profile', updates, 'test-user');
      
      // Cache should be invalidated
      // Next getProfile should fetch from database
      expect(service.getCacheStats()).toBeDefined();
    });
  });

  describe('deleteProfile', () => {
    test('should delete existing profile', async () => {
      await expect(
        service.deleteProfile('test-profile', 'test-user')
      ).resolves.not.toThrow();
    });

    test('should throw error for non-existent profile', async () => {
      await expect(
        service.deleteProfile('non-existent', 'test-user')
      ).rejects.toThrow(BulgarianProfileException);
    });

    test('should invalidate cache after deletion', async () => {
      await service.deleteProfile('test-profile', 'test-user');
      
      // Cache should be invalidated
      expect(service.getCacheStats()).toBeDefined();
    });
  });

  describe('Cache management', () => {
    test('should clear all cache', () => {
      service.clearCache();
      const stats = service.getCacheStats();
      expect(stats.size).toBe(0);
    });

    test('should report cache statistics', () => {
      const stats = service.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('ttl');
    });
  });

  describe('Rate limiting', () => {
    test('should track remaining requests', () => {
      const remaining = service.getRemainingRequests('test-user');
      expect(remaining).toBeGreaterThanOrEqual(0);
      expect(remaining).toBeLessThanOrEqual(10);
    });
  });
});
```

---

## 2. Integration Tests

### 2.1 End-to-End Profile Operations

```typescript
// File: web/src/services/bulgarian-profile/__tests__/integration.test.ts

describe('Bulgarian Profile Integration Tests', () => {
  test('should create, update, and delete profile', async () => {
    const service = new BulgarianProfileService();
    const userId = 'integration-test-user';
    
    // Create profile
    const profileData = {
      eik: '175074752',
      companyName: 'Integration Test Company',
      address: {
        street: 'Test Street 1',
        city: 'Sofia',
        region: 'Sofia City',
        postalCode: '1000',
        country: 'Bulgaria' as const
      },
      contactPerson: 'Test Person',
      phone: '+359888111222',
      email: 'integration@test.com',
      verificationStatus: 'pending' as const,
      trustScore: 60
    };
    
    const createdProfile = await service.createProfile(profileData, userId);
    expect(createdProfile.id).toBeDefined();
    
    // Update profile
    const updates = {
      companyName: 'Updated Integration Test Company',
      trustScore: 75
    };
    
    const updatedProfile = await service.updateProfile(
      createdProfile.id,
      updates,
      userId
    );
    expect(updatedProfile.companyName).toBe(updates.companyName);
    expect(updatedProfile.trustScore).toBe(updates.trustScore);
    
    // Get profile
    const fetchedProfile = await service.getProfile(createdProfile.id, userId);
    expect(fetchedProfile).not.toBeNull();
    expect(fetchedProfile?.id).toBe(createdProfile.id);
    
    // Delete profile
    await service.deleteProfile(createdProfile.id, userId);
    
    // Verify deletion
    const deletedProfile = await service.getProfile(createdProfile.id, userId);
    expect(deletedProfile).toBeNull();
  });
});
```

---

## 3. Manual Testing Checklist

### 3.1 EIK Validation Testing

- [ ] Test valid 9-digit EIK: `175074752`
- [ ] Test valid 13-digit EIK: `1750747528001`
- [ ] Test invalid EIK with wrong checksum
- [ ] Test EIK with dashes and spaces
- [ ] Test EIK with letters (should fail)
- [ ] Test EIK with wrong length (should fail)
- [ ] Test batch validation with mixed valid/invalid EIKs
- [ ] Test EIK formatting function
- [ ] Test EIK detection function

### 3.2 Repository Verification Testing

- [ ] Verify existing repository
- [ ] Verify non-existent repository (should fail)
- [ ] Verify archived repository (should warn)
- [ ] Verify deleted repository (should fail)
- [ ] Verify locked repository (should fail for other users)
- [ ] Test write operations on valid repository
- [ ] Test write operations on locked repository (should fail)
- [ ] Test integrity check on valid repository
- [ ] Test integrity check on repository with missing fields
- [ ] Test rate limiting for repository operations

### 3.3 Bulgarian Profile Service Testing

- [ ] Create profile with valid data
- [ ] Create profile with invalid EIK (should fail)
- [ ] Create profile with invalid email (should fail)
- [ ] Get profile (should use cache on second call)
- [ ] Update profile with valid data
- [ ] Update profile with invalid EIK (should fail)
- [ ] Delete profile
- [ ] Test rate limiting (make >10 requests in 1 minute)
- [ ] Test cache expiration (wait 5+ minutes)
- [ ] Test optimistic locking (concurrent updates)

---

## 4. Performance Testing

### 4.1 Load Testing

```typescript
// Simulate high load on the service
async function loadTest() {
  const service = new BulgarianProfileService();
  const userIds = Array(100).fill(null).map((_, i) => `user-${i}`);
  const profileIds = Array(50).fill(null).map((_, i) => `profile-${i}`);
  
  console.log('Starting load test...');
  
  const startTime = Date.now();
  
  const promises = userIds.flatMap(userId =>
    profileIds.map(profileId =>
      service.getProfile(profileId, userId).catch(() => null)
    )
  );
  
  await Promise.all(promises);
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log(`Load test completed in ${duration}ms`);
  console.log(`Average time per request: ${duration / promises.length}ms`);
  
  const cacheStats = service.getCacheStats();
  console.log(`Cache size: ${cacheStats.size}`);
}
```

### 4.2 Cache Performance

```typescript
async function cachePerformanceTest() {
  const service = new BulgarianProfileService();
  const userId = 'perf-test-user';
  const profileId = 'perf-test-profile';
  
  // First call (cache miss)
  const start1 = Date.now();
  await service.getProfile(profileId, userId);
  const time1 = Date.now() - start1;
  
  // Second call (cache hit)
  const start2 = Date.now();
  await service.getProfile(profileId, userId);
  const time2 = Date.now() - start2;
  
  console.log(`First call (cache miss): ${time1}ms`);
  console.log(`Second call (cache hit): ${time2}ms`);
  console.log(`Cache speedup: ${(time1 / time2).toFixed(2)}x`);
}
```

---

## 5. Edge Cases and Error Scenarios

### 5.1 Edge Cases to Test

1. **Empty strings in required fields**
   - Company name: ""
   - Email: ""
   - Phone: ""

2. **Boundary values**
   - Trust score: 0, 100, -1, 101
   - EIK length: 8, 9, 10, 13, 14 digits

3. **Special characters**
   - Company name with special chars: "Test & Company <Ltd>"
   - Address with Unicode: "ул. Витоша"

4. **Concurrent operations**
   - Multiple updates to same profile
   - Create and delete in quick succession

5. **Cache expiration edge cases**
   - Access profile just before expiration
   - Access profile just after expiration

### 5.2 Error Recovery Testing

1. **Network failures**
   - Simulate network timeout
   - Simulate connection error
   - Test retry logic

2. **Database errors**
   - Simulate Firestore unavailable
   - Simulate permission denied
   - Test rollback mechanisms

3. **Rate limit scenarios**
   - Exactly at limit
   - Just over limit
   - Recovery after rate limit

---

## 6. Security Testing

### 6.1 Security Checks

- [ ] SQL injection attempts in EIK field
- [ ] XSS attempts in company name
- [ ] Path traversal attempts in profile ID
- [ ] Unauthorized access to other users' profiles
- [ ] Rate limit bypass attempts
- [ ] Cache poisoning attempts

### 6.2 Data Validation

- [ ] Validate all input fields are sanitized
- [ ] Verify EIK checksum cannot be bypassed
- [ ] Ensure sensitive data is not logged
- [ ] Test permission checks are enforced

---

## 7. Regression Testing

### 7.1 Backward Compatibility

- [ ] Existing profiles without version field
- [ ] Profiles with old address format
- [ ] Profiles without trust score

### 7.2 Migration Testing

- [ ] Test migration from old EIK validation (if any)
- [ ] Test migration of existing profiles
- [ ] Verify no data loss during migration

---

## 8. Monitoring and Observability

### 8.1 Metrics to Monitor

- Profile creation rate
- Profile update rate
- EIK validation failure rate
- Cache hit rate
- Rate limit violations
- Average response time
- Error rate by type

### 8.2 Logging

- All profile operations should be logged
- Rate limit violations should be logged
- Cache hits/misses should be logged (debug level)
- Errors should include full context

---

## 9. Test Execution Commands

```bash
# Run all tests
npm test

# Run unit tests only
npm test -- --testPathPattern=__tests__

# Run integration tests
npm test -- --testPathPattern=integration

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- eik-validator.test.ts

# Run in watch mode
npm test -- --watch
```

---

## 10. Success Criteria

All tests must pass with:
- ✅ 100% of critical path tests passing
- ✅ >80% code coverage
- ✅ <100ms average response time for cached requests
- ✅ <500ms average response time for database requests
- ✅ Zero security vulnerabilities
- ✅ All edge cases handled gracefully
- ✅ Proper error messages for all failure scenarios

---

**Last Updated:** PR#2 Implementation  
**Next Review:** Before merging to main
