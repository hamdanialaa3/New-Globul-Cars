# Social Token Rotation Design (Draft)

## Goal
Eliminate long-lived raw social platform tokens from client exposure and enable automatic rotation with minimal downtime.

## Components
1. Secret Manager (authoritative store) – current version + previous version (grace window)
2. Rotation Function (Cloud Scheduler trigger) – fetch new token via platform API (or manual upload), store new secret version, mark metadata (issuedAt, expiresAt, rotationId)
3. Distribution Layer (`getSocialAccessToken`) – mint short-lived ephemeral tokens (5m) referencing rotationId implicitly via HMAC key derivation
4. Revocation / Anomaly Monitor – detect unusual issuance spikes or invalid signature rates

## Rotation Flow
1. Scheduler invokes `rotateSocialPlatformTokens`
2. For each platform:
   - Retrieve current secret metadata
   - Acquire new token (API exchange or manual pipeline) – placeholder until platform OAuth integration
   - Store as new Secret Manager version
   - Update rotation manifest (Firestore doc: social_tokens/rotation_state)
3. Increment rotation generation (used to derive signing secret: baseSigningSecret + generation)
4. Old version accepted for a grace period (e.g. 15m) while ephemeral tokens naturally expire

## Signing Secret Derivation (Future)
Current: single `EPHEMERAL_SIGNING_SECRET`.
Future: `HMAC_KEY = H(baseSecret + generation)`; generation increments on rotation.
Allows overlapping validity for N=2 generations (current + previous) for smooth rollover.

## Manifest (Firestore Example)
```
social_tokens/rotation_state: {
  currentGeneration: 12,
  previousGeneration: 11,
  lastRotationAt: 1730000000000,
  platforms: {
    facebook: { version: 'v23', rotatedAt: 1730000000000 },
    instagram: { version: 'v17', rotatedAt: 1730000000000 },
    tiktok: { version: 'v05', rotatedAt: 1730000000000 }
  }
}
```

## Future Tasks
- Implement `rotateSocialPlatformTokens` function stub
- Implement dual-generation verification (accept previousGeneration)
- Add anomaly alerts (Stackdriver metric + threshold)
- Add manual rotation trigger (callable) with role-based auth

## Security Considerations
- Ensure rotation function service account has least privilege (access to specific secrets only)
- Log rotation events (without token values) to audit sink
- Deny raw token fallback once rotation stable + ephemeral path validated

---
Status: Draft – implementation pending after Phase 2 verification adoption.