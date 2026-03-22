# Repo Hygiene Policy

_Prevents debris re-accumulation after the March 2026 cleanup._

---

## 1. Root Directory

Only these categories belong at the repo root:

| Category             | Examples                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| Build/runtime config | `package.json`, `tsconfig.json`, `vite.config.ts`, `firebase.json`                                            |
| Firebase rules       | `firestore.rules`, `database.rules.json`, `storage.rules`                                                     |
| CI/env               | `.gitignore`, `.env.example`, `.npmrc`, `.prettierrc`, `.eslintrc.json`                                       |
| Project docs         | `README.md`, `CONSTITUTION.md`, `CONTRIBUTING.md`, `SECURITY.md`, `QUICK_START.md`, `LICENSE`, `CITATION.cff` |
| Data                 | `taxonomy.v1.json`                                                                                            |

**Prohibited at root**: plan files, one-off reports, scratch notes, mobile-specific configs.
New plans go in `docs/`, governance docs in `governance/`.

---

## 2. Scripts (`scripts/`)

### Before adding a new script, verify:

1. It will be used **more than once** (one-shot tasks go in `DDD/` after execution).
2. No existing script covers the same purpose.
3. It is referenced from `package.json`, a README, or a CI workflow.

### Quarterly audit rule:

Any script not executed or referenced in the past 90 days is a candidate for `DDD/`.

---

## 3. Docs (`docs/`)

- **Active docs**: guides, references, getting-started material.
- **Reports/audits**: move to `DDD/` once findings are resolved.
- **Arabic or localized docs**: keep only if actively maintained; archive stale translations.

---

## 4. Dead Code (`DDD/`)

Per CONSTITUTION.md Section 3.4 — never delete, always move to `DDD/`.

### Archive naming convention:

```
DDD/archived-<category>-<YYYY-MM>/
```

Categories: `scripts`, `docs`, `code`, `plans`, `configs`.

### DDD/ is gitignored:

Files moved there disappear from the working tree and CI.
Owner reviews periodically and may permanently delete.

---

## 5. Protected Set (AI-Critical)

These paths must **never** be moved, renamed, or archived without manual verification that all AI features still work:

| Path                                   | Reason                       |
| -------------------------------------- | ---------------------------- |
| `src/services/ai/`                     | All AI service logic         |
| `functions/src/ai-functions.ts`        | Cloud Functions AI endpoints |
| `src/config/ai-tiers.config.ts`        | Tier gating for AI features  |
| `src/pages/01_main-pages/valuation/`   | AI Valuation page            |
| `src/pages/01_main-pages/advisor/`     | AI Advisor page              |
| `src/pages/01_main-pages/history/`     | Vehicle history page         |
| `src/pages/01_main-pages/ai-analysis/` | AI Analysis flow             |
| `shared/`                              | Cross-project type contracts |
| `firestore.rules`                      | Security rules               |
| `.github/workflows/`                   | CI/CD pipelines              |

---

## 6. Generated Files

These are build outputs and must **never** be committed:

| File/Dir         | Managed by        |
| ---------------- | ----------------- |
| `build/`         | `vite build`      |
| `functions/lib/` | `tsc` (functions) |
| `.tsbuildinfo`   | `tsc` incremental |
| `node_modules/`  | `npm install`     |
| `.firebase/`     | Firebase CLI      |

All are listed in `.gitignore`.

---

## 7. Verification Gates

Before any cleanup commit, these must all pass:

```bash
npx vite build                    # Must exit 0
cd functions && npm run build     # Must exit 0
npx tsc --noEmit --skipLibCheck   # Error count must not increase
```
