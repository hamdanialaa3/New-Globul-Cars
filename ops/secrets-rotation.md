# Secrets Rotation Policy

## Overview
This document defines the process and schedule for rotating API keys, database credentials, and service account keys across Koli One infrastructure.

## Rotation Schedule

| Secret Type | Rotation Frequency | Last Rotated | Owner |
|-------------|-------------------|--------------|-------|
| Firebase Service Account | 90 days | [Update date] | Ops Lead |
| Algolia API Key | 90 days | [Update date] | Search Lead |
| Cloud Storage CORS credentials | 90 days | [Update date] | DevOps |
| Database connection strings | 180 days | [Update date] | DBA |
| JWT signing keys | Annual | [Update date] | Auth Lead |
| Third-party API keys (Stripe, etc.) | 90 days | [Update date] | Finance |

## Rotation Process

### Phase 1: Generate New Key
1. Log in to provider console (Firebase, Algolia, etc.)
2. Generate new key/credential
3. Store in Secret Manager (not committed to repo)
4. Document with timestamp and rotated-by

### Phase 2: Deploy with Both Keys
1. Update environment variable to use new key
2. Keep old key as fallback in Secret Manager for 7 days
3. Deploy to staging first
4. Run smoke tests to confirm functionality

### Phase 3: Cleanup
After 7 days of successful operation:
1. Delete old key from provider
2. Remove fallback from Secret Manager
3. Update rotation log with completion date

## Emergency Rotation

If a key is compromised:
1. **IMMEDIATELY** revoke the key from provider
2. Generate new key
3. Update Secret Manager
4. Deploy within 15 minutes
5. Notify security team
6. Post-incident review within 24 hours

## Verification Checklist

- [ ] New key works in staging
- [ ] Auth flows pass (login, OAuth)
- [ ] Algolia search works
- [ ] File uploads work (Cloud Storage)
- [ ] Payments process correctly (Stripe)
- [ ] No 401/403 errors in logs
- [ ] Monitoring alert silent (no spike in errors)
- [ ] Team notified of rotation completion

## Tools & Access

- **Secret Manager**: Google Cloud Secret Manager
- **Access Control**: IAM roles (minimal privilege)
- **Audit Logs**: Cloud Audit Logs (retained 365 days)
- **Alerts**: Automated alerts on rotation failure

## Contact

- **Secrets Lead**: DevOps Team
- **Emergency**: Page on-call engineer
- **Escalation**: Tech Lead / CTO
