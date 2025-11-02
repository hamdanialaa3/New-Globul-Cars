# 🧳 Migration Runbook: users.dealerInfo → dealerships/{uid}

Step-by-step guide to execute the embedded → canonical migration with batching, idempotency, and observability.

---

## 🎯 Scope

- Move legacy `users/{uid}.dealerInfo` into `dealerships/{uid}`
- Write back `users/{uid}.dealershipRef` and `users/{uid}.dealerSnapshot`
- Delete legacy fields: `dealerInfo`, `isDealer`
- Preserve createdAt/updatedAt semantics where possible

---

## 🏗️ Design

- Idempotent batches (safe to re-run)
- Small page sizes (200–500) to avoid rate limits
- Observability counters per batch
- Backpressure via exponential backoff on retries

---

## 🔧 Script Skeleton (Pseudocode)

```ts
// scripts/migrate-dealer-info.ts (reference-only)
async function migrateDealerInfoBatch(batchSize = 200) {
  const q = query(collection(db, 'users'), where('dealerInfo', '!=', null), limit(batchSize));
  const snap = await getDocs(q);

  const batch = writeBatch(db);
  let movedCount = 0, skippedCount = 0;

  for (const docSnap of snap.docs) {
    const uid = docSnap.id;
    const user = docSnap.data();
    const dealerInfo = user.dealerInfo;

    if (!dealerInfo) { skippedCount++; continue; }

    // 1) Upsert dealerships/{uid}
    const dealerRef = doc(db, 'dealerships', uid);
    batch.set(dealerRef, {
      ...dealerInfo,
      updatedAt: serverTimestamp(),
      createdAt: user.createdAt || serverTimestamp()
    }, { merge: true });

    // 2) Snapshot + ref in users/{uid}
    batch.set(doc(db, 'users', uid), {
      dealershipRef: `dealerships/${uid}`,
      dealerSnapshot: {
        nameBG: dealerInfo.dealershipNameBG || dealerInfo.companyName || '',
        nameEN: dealerInfo.dealershipNameEN || dealerInfo.companyName || '',
        logo: dealerInfo.logo || null,
        status: user.businessVerification?.status || 'pending'
      },
      dealerInfo: deleteField(),
      isDealer: deleteField(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    movedCount++;
  }

  await batch.commit();
  return { movedCount, skippedCount };
}
```

---

## 🧪 Dry Run & Validation

- Run on staging with synthetic users (preferably 1k–5k docs)
- Validate results:
  - Dealership doc exists and contains expected fields
  - User contains dealershipRef and dealerSnapshot
  - Legacy fields removed
- Spot check 20 random records manually

---

## 🧭 Execution (Production)

1) Backups (Firestore + Storage logos)
2) RC flags → guards ON (100%), migration flag OFF
3) Run migration batches via a controlled job (Cloud Run job / CLI tool)
4) Set RC_DEALERSHIP_MIGRATION_ENABLED=10% only if code paths are fully compatible
5) Incrementally run remaining batches
6) Move to 50% and 100% per operator checklist

Batch runtime recommendations:
- Delay 200–400ms between batches
- Retry logic with jitter (100–800ms)
- Pause if aborted writes surge > 0.3%

---

## 📈 Observability

- Log per-batch metrics: movedCount, skippedCount, durationMs
- Emit Cloud Monitoring custom metrics for dashboarding
- Track total migrated vs total targeted

---

## 🛡️ Guard Rails

- Migration lock field: `users/{uid}.migrationLock`
- UI banner if lock is present: t('profile.migration.inProgress')
- Security rules allow read during lock; writes must go through guarded paths

---

## 🔁 Rollback (Targeted)

- If a specific batch introduced issues:
  - Identify affected uid range
  - Restore from Firestore export (per uid)
  - Revert RC flag if needed, pause jobs

- If dealership docs malformed:
  - Patch script to correct and re-run idempotently

---

## ✅ Completion Criteria

- 100% of legacy users processed
- Zero legacy `dealerInfo` and `isDealer` across users collection
- No elevated error rates for 48h post-completion
- All dashboards green and audit logs populated for major events

---

## 📎 References

- Prioritized Plan → Migration section & Advanced Stabilization Addenda
- Operator Checklist → Rollout sequence, flags, monitoring & rollback
- Security Rules → Type-aware validations
