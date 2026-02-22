# Cost Control and Resource Governance

## Overview
Koli One operates on public cloud infrastructure (Firebase, Google Cloud). Cost control requires tagging discipline, budget alerts, and monthly reviews to prevent runaway spending.

## Resource Tagging Convention

All cloud resources must be tagged with the following labels:

```
Environment: [dev, staging, prod]
Service: [api, functions, storage, database, ml, search]
Owner: [ml-team, backend-team, infrastructure-team, product-team]
CostCenter: [engineering, product, operations]
Project: [koli-one, alaa-technologies]
CreatedDate: [YYYY-MM-DD]
Deprecation: [date if resource is planned for retirement]
```

### Example (Google Cloud Tag)
```yaml
labels:
  environment: prod
  service: vision-inference
  owner: ml-team
  cost_center: engineering
  project: koli-one
  created_date: 2025-11-01
```

## Budget Allocation and Limits

### Monthly Budget Targets (as of Feb 2026)
| Service | Budget (EUR) | Owner | Alert (80%) | Hard Limit |
|---------|--------------|-------|-------------|-----------|
| Firestore Database | 2,500 | Backend Team | 2,000 | 2,750 |
| Cloud Storage | 800 | Infrastructure | 640 | 900 |
| Cloud Functions | 1,200 | Backend Team | 960 | 1,320 |
| Vision AI / ML | 2,000 | ML Team | 1,600 | 2,200 |
| Algolia Search | 400 | Backend Team | 320 | 450 |
| CDN / Cloud Armor | 600 | Infrastructure | 480 | 666 |
| Compute / Servers | 1,500 | DevOps | 1,200 | 1,650 |
| **Total** | **9,000** | — | 7,200 | 10,000 |

## Alert Configuration

### Google Cloud Billing Alerts
1. **80% Threshold Alert**: Triggered when service approaches budget (automatic email to owner + finance)
2. **100% Threshold Alert**: Hard limit enforcement (automatic email to CTO + CFO)
3. **Daily Email Reports**: Actual spend vs. budget for each service (sent to cost-center leads)

### Setup (Cloud Console)
```bash
gcloud billing budgets create \
  --billing-account=[BILLING_ID] \
  --display-name="Koli One - Firestore" \
  --budget-amount=2500 \
  --threshold-rule=percent=80 \
  --threshold-rule=percent=100
```

## Cost Optimization Practices

### Database (Firestore)
- **Read/Write Optimization**: Index only fields used in queries (ops/firestore.rules documents this)
- **Automatic Snapshots**: Disable snapshots on collections with >10k docs unless queried
- **Archival**: Move listings older than 2 years to archive bucket (cheaper storage tier)

### Storage (Cloud Storage)
- **Lifecycle Policies**: Transition objects >90 days old to Nearline tier
- **Compression**: All media uploads auto-compressed to WebP/AVIF before storage
- **Cleanup**: Daily cron deletes temporary uploads >7 days old

### Functions (Cloud Functions)
- **Memory/Timeout**: Optimize tier (384MB baseline for most functions)
- **Concurrency**: Set max concurrent instances to prevent cost spike
- **Cold Starts**: Pre-warm critical functions (vision, pricing) every 5 minutes

### AI / ML Services
- **Vision Quota**: Enforce per-user daily quota (50 free calls, then per-call billing)
- **Model Inference**: Cache predictions for identical inputs (10-minute TTL in Redis)
- **Batch Processing**: Run retraining jobs during off-peak hours (cheaper compute)

### Search (Algolia)
- **Index Size**: Monitor index growth; archive old listings to separate indices
- **Query Optimization**: Implement faceting limits and result pagination

## Monthly Cost Review Process

### Timeline
- **Month End**: Finance exports actual spend from Cloud Billing
- **1st of Month**: Cost review meeting (Backend Lead, ML Lead, DevOps, CFO)
- **5th of Month**: Variance analysis and corrective actions

### Review Checklist
- [ ] Compare actual spend vs. budget
- [ ] Identify anomalies (e.g., 3x normal Firestore spend)
- [ ] Root cause analysis for >15% variance
- [ ] Optimization plan if overspend
- [ ] Updated forecast for next month
- [ ] Document findings in cost_review_YYYY-MM.md

### Sample Review Report
```markdown
## Cost Review - January 2026

**Total Spend**: EUR 8,200 (91% of budget)

### Variance Analysis
| Service | Budget | Actual | Variance | Status |
|---------|--------|--------|----------|--------|
| Firestore | 2,500 | 2,600 | +4% | ⚠️ Over |
| Storage | 800 | 720 | -10% | ✓ Good |
| Functions | 1,200 | 1,100 | -8% | ✓ Good |
| Vision AI | 2,000 | 1,850 | -8% | ✓ Good |

### Actions Taken
1. Firestore over: Identified 3 unused indexes, removed (will save ~200 EUR/mo)
2. Vision AI good: Cache hit rate 72%, no action needed
3. Storage good: Lifecycle policies working, no action needed

### Forecast for February 2026
**Predicted Spend**: EUR 8,050 (target: EUR 9,000)
```

## Chargeback Model (Internal)

If multiple teams share resources, track usage and charge back quarterly:

```
Vision API calls: EUR 0.01 per inference
Storage: EUR 0.015 per GB
Firestore: EUR 0.0006 per read, EUR 0.0018 per write
Functions: EUR 0.0000002083 per GB-second
```

## Deprecation and Resource Cleanup

### Quarterly Cleanup
1. Identify unused resources: 0 reads/writes in past 90 days
2. Notify owner: "This GCS bucket has been unused for 90 days. Will delete on [date]."
3. Retain for 30 days (grace period), then delete
4. Log deletion in cost_cleanup_YYYY-MM.md

### Example
```bash
# Find unused Firestore collections
gcloud firestore collections --summary | grep -E "documents: 0|documents: <10"

# Archive or delete
gcloud firestore export gs://backup-bucket/archive/[collection]
gcloud firestore delete-collection [collection-name]
```

## Annual Cost Planning

**Q1 Review**: Final budget for fiscal year, allocate reserves for growth
**Q2 Midyear**: Variance review, adjust forecasts
**Q3 Planning**: Negotiate volume discounts with vendors (Algolia, cloud providers)
**Q4 Review**: Year-end spend analysis, plan next year

## Escalation

- **80% threshold**: Email alert, owner investigates within 2 days
- **100% spent**: CTO + CFO approval required for additional spend
- **Recurring overspend (>3 months)**: Budget review board meeting, cost reduction plan mandatory

## Tools and Scripts

- **Cost Export**: `scripts/export-cloud-costs.sh` (monthly export to CSV)
- **Alert Dashboard**: Google Cloud Console → Billing → Budgets
- **Tagging Audit**: `scripts/audit-resource-tags.sh` (weekly check for untagged resources)

## See Also
- [CHANGE_APPROVAL.md](CHANGE_APPROVAL.md) — Approval required for cost-impacting changes
- [governance/RELEASE_POLICY.md](RELEASE_POLICY.md) — Canary deployments reduce risk and cost
