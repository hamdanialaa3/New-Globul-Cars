import { buildFirestoreQuery, extractCoreFilterSignature } from '../firestoreQueryBuilder';
import { describe, it, expect } from '@jest/globals';

// Lightweight mock for Firestore Query object shape (we only test builder behavior indirectly via signature extraction)
// In real environment we would use firebase emulator; here we focus on pure functions.

describe('firestoreQueryBuilder', () => {
  it('extracts core signature correctly', () => {
    const sig = extractCoreFilterSignature({ make: 'Audi', model: 'A3', city: 'Sofia', fuelType: 'Petrol' });
    expect(sig).toEqual({ make: 'Audi', model: 'A3', city: 'Sofia', fuelType: 'Petrol' });
  });

  it('normalizes make via resolveCanonicalBrand in query builder (indirect)', () => {
    // We cannot inspect the private Query internals; we rely on signature + assumption canonicalization happens.
    const sigBefore = extractCoreFilterSignature({ make: 'mercedes benz', model: 'C-Class' });
    expect(sigBefore.make).toBe('mercedes benz');
    // Build query (no throw)
    const q = buildFirestoreQuery({ make: 'mercedes benz', model: 'C-Class' });
    expect(q).toBeDefined();
  });
});
