# Social Media Token Migration & Hardening Plan

## Overview
This document tracks the staged migration from exposing long‑lived social media tokens in the frontend build to a secure, short‑lived, centrally issued token flow. Applies to: Facebook, Instagram, TikTok (and Threads by inheritance).

## Phases
| Phase | Status | Description |
|-------|--------|-------------|
| 0 | Complete | Direct `REACT_APP_*` env usage in client bundles (insecure baseline) |
| 1a | Complete | Introduced `social-token-provider.ts` abstraction (lazy, centralized) |
| 1b | Complete | Added Firebase Functions callable `getSocialAccessToken` + HTTP `fetchSocialAccessToken` (bridge – still returns long token) |
| 1c | In Progress | Frontend now attempts backend callable first, then falls back to env |
| 2 | Planned | Rotate to short‑lived (10–15m) scoped tokens issued server-side; remove env fallback from client build |
| 3 | Planned | Add refresh / rotation service + audit logging and anomaly detection |
| 4 | Planned | Enforce per-user / per-role scoping (e.g. marketing vs. read-only) |
| 5 | Planned | Add secrets manager (GCP Secret Manager) + automatic version rotation pipeline |

## Current Implementation (Phase 1 Bridge)
### Backend (`functions/src/social-tokens.ts`)
* Callable: `getSocialAccessToken` (auth required outside emulator)
* HTTP: `fetchSocialAccessToken` for non-Firebase contexts
* Metrics: `getSocialTokenMetrics` (requests, cacheHits, perPlatform)
* In-memory 10m TTL cache (bridge only – not persistent)
* Optional Secret Manager lookup (controlled via `ENABLE_SECRET_MANAGER=1`) with per-platform secret naming (`SOCIAL_TOKEN_<PLATFORM>` or override `SECRET_<PLATFORM>_NAME`)

### Frontend (`social-token-provider.ts`)
Resolution order:
1. In-memory token map (not expired)
2. Cache layer (`socialMediaCache` – 5 min)
3. Firebase callable (if functions SDK & app present)
4. Environment fallback (legacy – to be removed Phase 2)

### Security Notes
* Auth enforced on callable (except emulator) – prevents anonymous scraping.
* No scopes yet – tokens are still the original long-lived tokens (risk remains until Phase 2).
* Logging is intentionally minimal to avoid leaking tokens; only metadata is logged at debug level.

## Upcoming Changes (Phase 2 Tasks)
1. Replace raw long-lived tokens with server-kept secrets (GCP Secret Manager).
2. Introduce short-lived derived tokens (opaque or JWT-wrapped) containing:
   * platform
   * issuedAt / expiresAt
   * allowed operations (claims)
3. Enforce expiry & claim checks inside each service before API call.
4. Add background rotation job (Cloud Scheduler + Function) to rotate platform tokens if supported.
5. Remove direct `.env` platform token references from frontend build & CI lints on `REACT_APP_*_ACCESS_TOKEN` patterns.

## Risk Register
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Long-lived token leakage in build | High | Phase 2 removal of env fallback + secret manager |
| Callable abuse (enumeration) | Medium | Auth mandatory + basic per-UID/IP rate limiting implemented (Phase 1); enhance sliding window & backoff Phase 2 |
| Cache poisoning (bridge) | Low | Only internal memory; will move to signed payloads Phase 2 |
| Missing rotation | High | Add scheduled rotation + alert when token age > threshold |

## Metrics & Observability
`getSocialTokenMetrics` returns:
```
{
  requests,
  perPlatform: { facebook, instagram, tiktok },
  cacheHits,
  backendIssues,
  lastRequestAt,
  cacheHitRate,
  now
}
```
Planned additions:
* BigQuery export (daily) for anomaly detection
* Alert if backendIssues / requests > 0.05 rolling window

## Decommission Plan for Fallback
| Step | Trigger | Action |
|------|---------|--------|
| A | Short-lived tokens stable | Add warning log when env fallback used |
| B | 2 weeks after A | Throw error instead of fallback in non-development |
| C | 2 weeks after B | Remove fallback branches + delete old env keys |

## Action Checklist (Next Sprint)
- [ ] Integrate GCP Secret Manager fetch for raw tokens
- [ ] Add `X-Social-Token-Issuer` header for callable responses
- [x] Introduce per-request rate limiting (basic in-memory) – expand to sliding window & persistence
- [ ] Add unit tests: cache hit, cache miss, auth required, metrics shape (partial: auth + rate limit covered)
- [x] Create GitHub Action to grep & fail on new `REACT_APP_*ACCESS_TOKEN` usages (baseline in `.github/workflows/ci.yml`)
  - [ ] Add allowlist for legacy docs if needed
  - [x] (Added) Optional Secret Manager dynamic retrieval scaffold (will enforce in Phase 2)

---
Maintainer: Security / Platform Engineering
Last Updated: (auto-filled)