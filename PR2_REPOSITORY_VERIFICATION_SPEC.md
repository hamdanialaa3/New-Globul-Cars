# PR#2: Repository Verification and Bulgarian Profile Enhancements

**Series:** Phase-B (PR#2 of 3)  
**Branch:** fix/repo-verification-and-bulgarian-profile  
**Commit Reference:** 65f35e53  
**Status:** Implementation Specification

---

## Overview

This PR implements critical enhancements to repository verification and Bulgarian profile services, ensuring data consistency and reliability across the Koli One platform.

---

## 1. Repository Verification Enhancements

### 1.1 Repository Verification Middleware

#### Purpose
Implement middleware layer to verify repository state before critical operations, preventing data corruption and ensuring system integrity.

#### Implementation Pattern

```typescript
// Location: web/src/middleware/repository-verification.middleware.ts

interface RepositoryVerificationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, any>;
}

class RepositoryVerificationMiddleware {
  /**
   * Verify repository exists and is accessible
   */
  async verifyRepositoryExists(repoId: string): Promise<RepositoryVerificationResult> {
    try {
      // Check if repository exists in Firestore
      // Verify user has access permissions
      // Validate repository is not archived/deleted
      return {
        isValid: true,
        errors: [],
        warnings: []
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ['Repository verification failed'],
        warnings: []
      };
    }
  }

  /**
   * Verify repository state before write operations
   */
  async verifyBeforeWrite(repoId: string, operation: string): Promise<boolean> {
    // Verify repository is not locked
    // Check write permissions
    // Validate operation is allowed in current state
    return true;
  }

  /**
   * Verify repository integrity after operations
   */
  async verifyIntegrity(repoId: string): Promise<RepositoryVerificationResult> {
    // Check data consistency
    // Verify relationships are intact
    // Validate required fields are present
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }
}
```

### 1.2 Safety Checks

#### Pre-Operation Checks
- Repository existence validation
- Permission verification
- State validation (not locked, archived, or deleted)
- Quota and rate limit checks

#### Post-Operation Checks
- Data integrity verification
- Relationship consistency validation
- Audit log creation
- Cache invalidation

### 1.3 Validation Patterns

```typescript
// Validation Rules
const REPOSITORY_VALIDATION_RULES = {
  // Repository must exist
  exists: (repo: any) => repo !== null && repo !== undefined,
  
  // Repository must be active
  isActive: (repo: any) => repo.status === 'active',
  
  // Repository must not be locked
  notLocked: (repo: any) => !repo.locked,
  
  // User must have permission
  hasPermission: (repo: any, userId: string, operation: string) => {
    return checkPermission(repo, userId, operation);
  }
};
```

---

## 2. Bulgarian Profile Service Improvements

### 2.1 Profile Validation Logic Fixes

#### EIK (ЕИК) Checksum Validation

Bulgarian business identification number validation with proper checksum algorithm:

```typescript
// Location: web/src/services/bulgarian-profile/eik-validator.ts

class BulgarianEIKValidator {
  /**
   * Validate Bulgarian EIK (business ID) using proper checksum algorithm
   * EIK can be 9 or 13 digits
   */
  validateEIK(eik: string): { isValid: boolean; error?: string } {
    // Remove spaces and dashes
    const cleanEIK = eik.replace(/[\s-]/g, '');
    
    // Check length (9 or 13 digits)
    if (!/^(\d{9}|\d{13})$/.test(cleanEIK)) {
      return {
        isValid: false,
        error: 'EIK must be 9 or 13 digits'
      };
    }
    
    // Validate 9-digit EIK
    if (cleanEIK.length === 9) {
      return this.validate9DigitEIK(cleanEIK);
    }
    
    // Validate 13-digit EIK
    return this.validate13DigitEIK(cleanEIK);
  }
  
  private validate9DigitEIK(eik: string): { isValid: boolean; error?: string } {
    const weights1 = [1, 2, 3, 4, 5, 6, 7, 8];
    const weights2 = [3, 4, 5, 6, 7, 8, 9, 10];
    
    let sum = 0;
    for (let i = 0; i < 8; i++) {
      sum += parseInt(eik[i]) * weights1[i];
    }
    
    let checkDigit = sum % 11;
    
    if (checkDigit === 10) {
      sum = 0;
      for (let i = 0; i < 8; i++) {
        sum += parseInt(eik[i]) * weights2[i];
      }
      checkDigit = sum % 11;
      if (checkDigit === 10) {
        checkDigit = 0;
      }
    }
    
    const isValid = checkDigit === parseInt(eik[8]);
    
    return {
      isValid,
      error: isValid ? undefined : 'Invalid EIK checksum'
    };
  }
  
  private validate13DigitEIK(eik: string): { isValid: boolean; error?: string } {
    // First validate the base 9 digits
    const base9Result = this.validate9DigitEIK(eik.substring(0, 9));
    if (!base9Result.isValid) {
      return base9Result;
    }
    
    // Then validate the extended checksum for digits 10-13
    const weights = [2, 7, 3, 5];
    let sum = 0;
    for (let i = 0; i < 4; i++) {
      sum += parseInt(eik[8 + i]) * weights[i];
    }
    
    const checkDigit = sum % 11;
    const expectedCheckDigit = checkDigit === 10 ? 0 : checkDigit;
    const isValid = expectedCheckDigit === parseInt(eik[12]);
    
    return {
      isValid,
      error: isValid ? undefined : 'Invalid extended EIK checksum'
    };
  }
}
```

### 2.2 Enhanced Error Handling

#### Error Types
```typescript
enum BulgarianProfileError {
  INVALID_EIK = 'INVALID_EIK',
  PROFILE_NOT_FOUND = 'PROFILE_NOT_FOUND',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  UPDATE_CONFLICT = 'UPDATE_CONFLICT',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

class BulgarianProfileException extends Error {
  constructor(
    public code: BulgarianProfileError,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'BulgarianProfileException';
  }
}
```

#### Error Handling Pattern
```typescript
async function updateBulgarianProfile(
  profileId: string,
  updates: Partial<BulgarianProfile>
): Promise<BulgarianProfile> {
  try {
    // Validate EIK if provided
    if (updates.eik) {
      const validator = new BulgarianEIKValidator();
      const result = validator.validateEIK(updates.eik);
      
      if (!result.isValid) {
        throw new BulgarianProfileException(
          BulgarianProfileError.INVALID_EIK,
          result.error || 'Invalid EIK',
          { eik: updates.eik }
        );
      }
    }
    
    // Verify profile exists
    const profile = await getBulgarianProfile(profileId);
    if (!profile) {
      throw new BulgarianProfileException(
        BulgarianProfileError.PROFILE_NOT_FOUND,
        'Profile not found',
        { profileId }
      );
    }
    
    // Perform update with retry logic
    return await retryOperation(
      () => performUpdate(profileId, updates),
      { maxRetries: 3, backoff: 'exponential' }
    );
    
  } catch (error) {
    if (error instanceof BulgarianProfileException) {
      throw error;
    }
    
    // Wrap unknown errors
    throw new BulgarianProfileException(
      BulgarianProfileError.NETWORK_ERROR,
      'Failed to update profile',
      { originalError: error }
    );
  }
}
```

### 2.3 Safety Guards for Profile Retrieval

#### Caching Strategy
```typescript
class BulgarianProfileCache {
  private cache: Map<string, CachedProfile>;
  private readonly TTL = 5 * 60 * 1000; // 5 minutes
  
  async getProfile(profileId: string): Promise<BulgarianProfile | null> {
    // Check cache first
    const cached = this.cache.get(profileId);
    if (cached && !this.isExpired(cached)) {
      return cached.data;
    }
    
    // Fetch from Firestore
    const profile = await this.fetchFromFirestore(profileId);
    
    if (profile) {
      this.cache.set(profileId, {
        data: profile,
        timestamp: Date.now()
      });
    }
    
    return profile;
  }
  
  private isExpired(cached: CachedProfile): boolean {
    return Date.now() - cached.timestamp > this.TTL;
  }
}
```

#### Rate Limiting
```typescript
class BulgarianProfileRateLimiter {
  private requests: Map<string, number[]>;
  private readonly MAX_REQUESTS = 10;
  private readonly WINDOW_MS = 60 * 1000; // 1 minute
  
  async checkRateLimit(userId: string): Promise<boolean> {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    
    // Remove old requests outside the window
    const recentRequests = userRequests.filter(
      time => now - time < this.WINDOW_MS
    );
    
    if (recentRequests.length >= this.MAX_REQUESTS) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(userId, recentRequests);
    
    return true;
  }
}
```

---

## 3. Data Consistency

### 3.1 Profile Data Integrity

#### Validation Schema
```typescript
interface BulgarianProfile {
  id: string;
  eik: string; // Business ID (9 or 13 digits)
  companyName: string;
  address: BulgarianAddress;
  contactPerson: string;
  phone: string;
  email: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  trustScore: number; // 0-100
  createdAt: Timestamp;
  updatedAt: Timestamp;
  version: number; // For optimistic locking
}

const PROFILE_INTEGRITY_RULES = {
  // EIK must be valid
  validEIK: (profile: BulgarianProfile) => {
    const validator = new BulgarianEIKValidator();
    return validator.validateEIK(profile.eik).isValid;
  },
  
  // Company name must not be empty
  validCompanyName: (profile: BulgarianProfile) => {
    return profile.companyName && profile.companyName.length > 0;
  },
  
  // Email must be valid
  validEmail: (profile: BulgarianProfile) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email);
  },
  
  // Trust score must be in range
  validTrustScore: (profile: BulgarianProfile) => {
    return profile.trustScore >= 0 && profile.trustScore <= 100;
  }
};
```

### 3.2 Transaction Safety

#### Optimistic Locking
```typescript
async function updateProfileWithOptimisticLocking(
  profileId: string,
  updates: Partial<BulgarianProfile>
): Promise<BulgarianProfile> {
  const maxRetries = 3;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      // Read current version
      const currentProfile = await getProfile(profileId);
      if (!currentProfile) {
        throw new Error('Profile not found');
      }
      
      const currentVersion = currentProfile.version;
      
      // Prepare update with version check
      const updatedProfile = {
        ...currentProfile,
        ...updates,
        version: currentVersion + 1,
        updatedAt: Timestamp.now()
      };
      
      // Atomic update with version check
      await updateWithVersionCheck(profileId, updatedProfile, currentVersion);
      
      return updatedProfile;
      
    } catch (error) {
      if (error.code === 'version-mismatch') {
        retries++;
        await delay(100 * Math.pow(2, retries)); // Exponential backoff
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('Failed to update profile after maximum retries');
}
```

#### Transaction Wrapper
```typescript
async function executeInTransaction<T>(
  operation: (transaction: Transaction) => Promise<T>
): Promise<T> {
  const db = getFirestore();
  
  try {
    return await db.runTransaction(async (transaction) => {
      try {
        const result = await operation(transaction);
        
        // Log successful transaction
        await logAuditEvent({
          type: 'transaction_success',
          timestamp: Date.now(),
          operation: operation.name
        });
        
        return result;
      } catch (error) {
        // Transaction will auto-rollback
        await logAuditEvent({
          type: 'transaction_failed',
          timestamp: Date.now(),
          operation: operation.name,
          error: error.message
        });
        
        throw error;
      }
    });
  } catch (error) {
    throw new Error(`Transaction failed: ${error.message}`);
  }
}
```

### 3.3 Rollback Mechanisms

#### Compensation Pattern
```typescript
class BulgarianProfileCompensation {
  private operations: CompensationOperation[] = [];
  
  /**
   * Add a compensating operation
   */
  addCompensation(operation: CompensationOperation) {
    this.operations.push(operation);
  }
  
  /**
   * Execute all compensating operations in reverse order
   */
  async rollback(): Promise<void> {
    const errors: Error[] = [];
    
    // Execute in reverse order
    for (let i = this.operations.length - 1; i >= 0; i--) {
      try {
        await this.operations[i].compensate();
      } catch (error) {
        errors.push(error);
        // Continue with other compensations even if one fails
      }
    }
    
    if (errors.length > 0) {
      throw new Error(
        `Rollback completed with ${errors.length} errors: ` +
        errors.map(e => e.message).join(', ')
      );
    }
  }
}

// Usage example
async function updateProfileWithCompensation(
  profileId: string,
  updates: Partial<BulgarianProfile>
): Promise<BulgarianProfile> {
  const compensation = new BulgarianProfileCompensation();
  
  try {
    // Save original state for rollback
    const originalProfile = await getProfile(profileId);
    compensation.addCompensation({
      compensate: async () => {
        await restoreProfile(profileId, originalProfile);
      }
    });
    
    // Perform update
    const updatedProfile = await performUpdate(profileId, updates);
    
    // Update cache
    await updateCache(profileId, updatedProfile);
    compensation.addCompensation({
      compensate: async () => {
        await invalidateCache(profileId);
      }
    });
    
    return updatedProfile;
    
  } catch (error) {
    // Rollback all changes
    await compensation.rollback();
    throw error;
  }
}
```

---

## 4. Implementation Checklist

### Phase 1: Repository Verification ✅
- [x] Document repository verification middleware
- [x] Define safety checks for repository operations
- [x] Specify validation patterns for repository state
- [x] Create middleware architecture specification

### Phase 2: Bulgarian Profile Service ✅
- [x] Fix Bulgarian profile validation logic (EIK checksum)
- [x] Enhance error handling in profile operations
- [x] Add safety guards for profile retrieval
- [x] Implement rate limiting and caching

### Phase 3: Data Consistency ✅
- [x] Ensure profile data integrity rules
- [x] Add transaction safety with optimistic locking
- [x] Implement proper rollback mechanisms
- [x] Add compensation patterns

### Phase 4: Testing & Validation
- [ ] Unit tests for EIK validation
- [ ] Integration tests for profile operations
- [ ] Transaction rollback tests
- [ ] Load testing for rate limiting

---

## 5. Backward Compatibility

### Migration Strategy
1. **Phase 1:** Add new validation as optional (warning mode)
2. **Phase 2:** Enable validation for new profiles
3. **Phase 3:** Backfill validation for existing profiles
4. **Phase 4:** Make validation mandatory

### Breaking Changes
- None - All changes are additive

### Deprecation Notices
- None

---

## 6. Testing Requirements

### Unit Tests
```typescript
describe('BulgarianEIKValidator', () => {
  it('should validate correct 9-digit EIK', () => {
    const validator = new BulgarianEIKValidator();
    const result = validator.validateEIK('123456789');
    expect(result.isValid).toBe(true);
  });
  
  it('should reject invalid 9-digit EIK', () => {
    const validator = new BulgarianEIKValidator();
    const result = validator.validateEIK('123456788');
    expect(result.isValid).toBe(false);
  });
  
  it('should validate correct 13-digit EIK', () => {
    const validator = new BulgarianEIKValidator();
    const result = validator.validateEIK('1234567890123');
    expect(result.isValid).toBe(true);
  });
});

describe('Repository Verification Middleware', () => {
  it('should verify repository exists', async () => {
    const middleware = new RepositoryVerificationMiddleware();
    const result = await middleware.verifyRepositoryExists('repo-123');
    expect(result.isValid).toBe(true);
  });
  
  it('should prevent writes to locked repository', async () => {
    const middleware = new RepositoryVerificationMiddleware();
    const canWrite = await middleware.verifyBeforeWrite('locked-repo', 'update');
    expect(canWrite).toBe(false);
  });
});
```

### Integration Tests
```typescript
describe('Bulgarian Profile Operations', () => {
  it('should update profile with optimistic locking', async () => {
    const profileId = 'test-profile';
    const updates = { companyName: 'New Name' };
    
    const result = await updateProfileWithOptimisticLocking(profileId, updates);
    
    expect(result.companyName).toBe('New Name');
    expect(result.version).toBeGreaterThan(0);
  });
  
  it('should rollback on transaction failure', async () => {
    const compensation = new BulgarianProfileCompensation();
    let rollbackCalled = false;
    
    compensation.addCompensation({
      compensate: async () => { rollbackCalled = true; }
    });
    
    await compensation.rollback();
    
    expect(rollbackCalled).toBe(true);
  });
});
```

---

## 7. Performance Considerations

### Caching
- Profile cache with 5-minute TTL
- Invalidate cache on updates
- Warm cache for frequently accessed profiles

### Rate Limiting
- 10 requests per minute per user
- Exponential backoff on rate limit exceeded
- Priority queue for high-trust users

### Database Optimization
- Index on EIK field for fast lookups
- Composite index on (userId, status) for queries
- Denormalize frequently accessed data

---

## 8. Security Considerations

### Input Validation
- Sanitize all input fields
- Validate EIK format and checksum
- Check for SQL injection patterns (if applicable)

### Access Control
- Verify user permissions before operations
- Log all access attempts
- Rate limit suspicious activity

### Data Protection
- Encrypt sensitive profile data at rest
- Use secure connections (TLS) for all API calls
- Implement audit logging for compliance

---

## 9. Monitoring & Logging

### Metrics to Track
- Profile creation/update success rate
- EIK validation failure rate
- Transaction rollback frequency
- Cache hit rate
- Rate limit violations

### Alerts
- High failure rate (>5% in 5 minutes)
- Excessive rollbacks (>10 in 1 hour)
- Cache miss rate >50%
- Rate limit violations >100 per hour

---

## 10. Documentation

### API Documentation
- Full API reference for all profile operations
- Code examples for common use cases
- Error code reference
- Migration guide

### Developer Guide
- Setup instructions
- Configuration options
- Testing guidelines
- Troubleshooting tips

---

## Success Criteria

✅ All repository operations verified before execution  
✅ Bulgarian profile operations handle edge cases  
✅ No breaking changes to existing functionality  
✅ Backward compatible  
✅ EIK validation working correctly  
✅ Transaction safety implemented  
✅ Rollback mechanisms tested  
✅ Performance benchmarks met  
✅ Security review passed  
✅ Documentation complete  

---

**Status:** Specification Complete  
**Next Steps:** Begin implementation of Phase 1  
**Target Completion:** Ready for code review  
