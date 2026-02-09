# 🚨 INCIDENT REPORT — Credential Exposure & Rotation Required

**Date Discovered**: 2026-02-09  
**Severity**: HIGH  
**Status**: REMEDIATED (rotation pending)  
**Branch**: `chore/cleanup-project`

---

## Summary

During project cleanup, multiple API keys and secrets were found exposed in git-tracked files (documentation, config, and env files). All keys have been **redacted from current files** and `.gitignore` rules added, but the keys **remain in git history** and must be rotated.

---

## Exposed Credentials — MUST ROTATE

### 1. Google API Keys (6 keys)
| Key Prefix | Found In | Status |
|---|---|---|
| `AIzaSyBJWvA2rRN6-7emL4DL9jp6SVRuKDYwvCU` | docs, firebase-config history | Redacted — **ROTATE** |
| `AIzaSyCYxOoD-tViZHLh3XhdbwQo8rRA5Q56NVs` | docs, firebase-config history | Redacted — **ROTATE** |
| `AIzaSyAchmKCk8ipzv0dDwbQ2xU1Pa6o4CQsEu8` | docs | Redacted — **ROTATE** |
| `AIzaSyAUYM_qygK5pUrlXtdDLmEi-_Kh9SyvRmk` | docs | Redacted — **ROTATE** |
| `AIzaSyC1YsQz2rpK8z_6cZev9y99rV1kIUVsrFI` | docs | Redacted — **ROTATE** |
| `AIzaSy*` (6th key) | docs | Redacted — **ROTATE** |

**Action**: Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials), regenerate all keys, and update `.env` files.

### 2. Firebase Service Account Private Key
| Detail | Value |
|---|---|
| Service Account | `firebase-adminsdk-fbsvc@fire-new-globul.iam.gserviceaccount.com` |
| File | `web/configs/firebase-service-account.json` (on disk, not in git) |
| Status | `.gitignore` now blocks it — **ROTATE KEY** |

**Action**: Go to [Firebase Console → Project Settings → Service Accounts](https://console.firebase.google.com/), generate a new private key, replace the file locally.

### 3. Meta / Facebook Secrets
| Secret | Found In | Status |
|---|---|---|
| `META_APP_SECRET` | `dev_s_media/.env.production` (removed from git) | **ROTATE** |
| `THREADS_APP_SECRET` | `dev_s_media/.env.production` (removed from git) | **ROTATE** |
| `PAGE_ACCESS_TOKEN` | `dev_s_media/.env.production` (removed from git) | **ROTATE** |

**Action**: Go to [Meta Developer Portal](https://developers.facebook.com/), regenerate app secret and page tokens.

---

## Remediation Completed

| Action | Status |
|---|---|
| Created root `.gitignore` covering secrets | ✅ |
| Created `dev_s_media/.gitignore` | ✅ |
| Removed `.env.production` from git tracking | ✅ |
| Redacted API keys in 6+ documentation files | ✅ |
| Firebase SA key confirmed not in git | ✅ |

## Remediation Pending

| Action | Priority | Owner |
|---|---|---|
| Rotate all 6 Google API keys | **P0** | Project Lead |
| Rotate Firebase service account key | **P0** | Project Lead |
| Rotate Meta app secrets & page tokens | **P0** | Project Lead |
| Rewrite git history to purge old keys | **P1** | DevOps |
| Enable GitHub secret scanning alerts | **P1** | DevOps |
| Set up pre-commit hooks for secret detection | **P2** | Dev Team |

---

## Git History Rewrite (Deferred)

Leaked keys persist in git history. To fully purge:

```bash
# Use BFG Repo-Cleaner (requires team coordination)
# See: scripts/security/GIT_CLEANUP_MANUAL.sh

# 1. Backup repo
git clone --mirror <repo-url> backup.git

# 2. Run BFG to remove secrets
bfg --replace-text secrets-to-remove.txt backup.git

# 3. Force push (COORDINATE WITH TEAM FIRST)
cd backup.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

⚠️ **WARNING**: Force push rewrites history for ALL team members. Coordinate before executing.

---

## Timeline

| Date | Action |
|---|---|
| 2026-02-09 | Credentials discovered during cleanup audit |
| 2026-02-09 | All keys redacted from current files |
| 2026-02-09 | `.gitignore` rules added to prevent reoccurrence |
| TBD | Key rotation by project lead |
| TBD | Git history rewrite |
