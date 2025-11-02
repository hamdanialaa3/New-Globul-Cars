# 🚦 Rollout Operator Checklist

Operational runbook to safely roll out the Profile Types Separation changes using Remote Config flags, with pre-flight checks, monitoring, and rollback.

---

## 🎛️ Feature Flags (Remote Config)

Keys and defaults:
- RC_PROFILE_SWITCH_GUARD_ENABLED: true (guards enabled before migration)
- RC_DEALERSHIP_MIGRATION_ENABLED: false (rollout gradually)
- RC_UI_PROFILE_SPLIT_ENABLED: false (enable after Phase 3)

Gradual rollout steps for RC_DEALERSHIP_MIGRATION_ENABLED:
1) 0% → Dry run (RC=false); run tests, emulators only
2) 10% → Observe 2 hours; error budget < 0.5% writes
3) 50% → Observe 24 hours; error budget < 0.3%, P95 < 900ms
4) 100% → Observe 48 hours; stable metrics

Scope targeting suggestions:
- Audience: country == BG, active users only (lastSeen < 30d)
- Exclude staff test accounts when measuring real impact (separate cohort)

---

## 🛫 Pre-flight Checklist

- [ ] RC flags present and documented
- [ ] Firestore/Functions emulators pass smoke tests
- [ ] Migration dry-run scripts validated on staging project
- [ ] Full Firestore export completed (backup) and retained 7 days
- [ ] Storage bucket backup (logos/avatars) completed
- [ ] Indexes deployed (if added)
- [ ] Alerting configured (Errors/min, Function latency, Aborted writes, RC changes)
- [ ] Stakeholders notified with timeline and contact channel

Optional backup commands (documented, run by ops):
- Firestore export to GCS bucket (project ops standard)
- Storage bucket rsync to backup bucket

---

## 🧪 Dry Run (Emulator / Staging)

- [ ] Run integration tests covering:
  - Profile type switch (private ⇄ dealer ⇄ company)
  - Dealer migration when dealerInfo embedded exists
  - UI snapshot vs full fetch rendering
  - Security rules: block illegal switches
- [ ] Seed synthetic users (100 dealer, 100 private, 100 company) with variations
- [ ] Verify trust score triggers fire and values look sane

---

## 🚀 Rollout Sequence

1) Enable RC_PROFILE_SWITCH_GUARD_ENABLED=true for 100%
2) Set RC_DEALERSHIP_MIGRATION_ENABLED=10%
3) Monitor metrics (see below) for 2 hours
4) Increase to 50% (24 hours monitoring)
5) Increase to 100% (48 hours monitoring)
6) After UI split is merged and validated, set RC_UI_PROFILE_SPLIT_ENABLED=true

---

## 📊 Monitoring & SLOs

Dashboards to watch:
- Cloud Functions: error rate, P95 latency, cold starts
- Firestore: aborted writes, document write failures, read bursts
- Client: JS error rate (Sentry/Crashlytics), toast error counts, route error boundaries
- Migration counters: movedCount, skippedCount, retryCount

Alert thresholds:
- Errors/min > baseline + 1.0 → WARN
- Errors/min > baseline + 2.0 or > 0.5% writes → PAGE
- Functions P95 > 1000ms for 15m → WARN
- Aborted writes > 0.3% for 15m → PAGE

---

## 🔁 Rollback Plan

Trigger rollback if any alert is sustained for > 15 minutes:
- Set RC_DEALERSHIP_MIGRATION_ENABLED=false immediately
- If UI errors due to split: set RC_UI_PROFILE_SPLIT_ENABLED=false
- Revert last functions deployment if caused by backend change
- If data corruption suspected:
  - Stop migration jobs
  - Restore affected documents from latest Firestore export (targeted restore)
  - Announce temporary read-only mode if necessary

---

## 🗣️ Comms Plan

- Pre-rollout announcement to internal channels with schedule
- In-app subtle banner during migration windows (optional): t('profile.migration.inProgress')
- Post-rollout summary with key metrics and next steps

---

## ⏱️ Timeline Template

- T-3d: Complete backups, emulators, staging dry run
- T-1d: Final RC config review, dashboards ready, alert rules verified
- T: Enable guards 100%; migration flag 10%
- T+2h: Move to 50%
- T+1d: Move to 100%
- T+2d: UI split flag ON (if tests and metrics are green)

---

## ✅ Acceptance Criteria

- Migration completed for 100% users with < 0.3% errors
- No sustained alerting during rollout
- UI renders snapshot quickly and details lazily without regressions
- Security rules effectively block illegal state transitions
- Trust score remains consistent post-changes

---

## 📎 References

- Prioritized Plan → Canonical Data Model, Security Rules, Advanced Stabilization Addenda
- Big Plan (Reference) → Narrative and full context
- Translations → keys listed in prioritized plan
