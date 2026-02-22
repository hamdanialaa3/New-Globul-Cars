# Third-Party Risk Assessment and Management

## Overview
Koli One depends on external vendors and open-source libraries. This document defines the vetting process, ongoing monitoring, and exit strategies for third-party integrations.

## Vendor Categories and Risk Levels

### Critical Tier (Risk Level: HIGH)
Services essential to core platform operation. Outage = platform unavailable.

| Vendor | Service | RTO | SLA | Owner |
|--------|---------|-----|-----|-------|
| Google Cloud | Firestore, Cloud Storage, Cloud Functions | 15 min | 99.95% | DevOps |
| Firebase | Auth, Realtime Database v2 | 15 min | 99.95% | Backend |
| Algolia | Search Indexing | 60 min | 99.9% | Backend |

### High Tier (Risk Level: MEDIUM-HIGH)
Secondary services with degraded-mode alternatives.

| Vendor | Service | Alternative | Owner |
|--------|---------|-------------|-------|
| SendGrid | Email (notifications) | Built-in SMTP fallback | Operations |
| Sentry | Error Monitoring | Local log aggregation | DevOps |
| TensorFlow Serving | ML Inference | Local batch inference | ML Team |

### Medium Tier (Risk Level: MEDIUM)
Convenience services; platform functions without them require manual workarounds.

| Vendor | Service | Alternative | Owner |
|--------|---------|-------------|-------|
| Stripe / Wise | Payment Processing | Manual bank transfers | Finance |
| Figma | Design Collaboration | Adobe XD export | Product |
| GitHub | Version Control | GitLab self-hosted fallback | Engineering |

### Low Tier (Risk Level: LOW)
Development and testing only; no production impact.

| Vendor | Service | Alternative | Owner |
|--------|---------|-------------|-------|
| CircleCI | CI/CD | GitHub Actions (native) | DevOps |
| Snyk | Dependency Scanning | npm audit (built-in) | Security |
| Vercel | Deployment Preview | Local Docker build | Engineering |

## Vendor Vetting Checklist

### Initial Assessment (Before Adoption)

**Security & Compliance** (Required: ALL PASS)
- [ ] Privacy policy reviewed and GDPR-compliant
- [ ] Data Processing Agreement (DPA) available or willing to sign
- [ ] SOC 2 Type II certification OR equivalent audit report
- [ ] Encryption in transit (TLS 1.2+) and at rest
- [ ] No data sharing with third parties without explicit consent
- [ ] Compliance certifications (ISO 27001, HIPAA if applicable)

**Operational Readiness** (Required for Critical/High Tier)
- [ ] SLA commitment documented (99.5%+)
- [ ] Status page and incident history reviewed (looking for patterns)
- [ ] Redundancy and failover strategy documented
- [ ] Support response time SLA (4 hours for P1)
- [ ] API rate limits and quotas understood

**Financial Stability** (Required for Critical Tier)
- [ ] Vendor company funding or profitability confirmed (not a startup at risk)
- [ ] Pricing model transparent and predictable
- [ ] Annual cost < 10% of engineering budget

**Licensing & Legal** (Required: ALL PASS)
- [ ] Open-source licenses compatible with project (MIT/Apache 2.0 preferred; verify GPL conflicts)
- [ ] Terms of Service acceptable (no vendor lock-in clauses)
- [ ] Exit/termination clause allows 30-day notice
- [ ] Data deletion on account closure guaranteed

### Ongoing Monitoring (Quarterly)

1. **Security Incidents**: Monitor vendor advisories, CVEs, security breaches
2. **Performance**: Check status page and incident frequency
3. **Cost Creep**: Review monthly bills for unexpected increases
4. **License Changes**: Review vendor's roadmap for EOL announcements
5. **Alternative Evaluation**: Annually reassess alternatives (especially for High/Critical tiers)

### Red Flags (Immediate Review)
- Vendor announces SLA reduction
- Security breach disclosed (even if not affecting us)
- Major price increase (>20% unannounced)
- Key personnel exodus (CEO/CTO leaving)
- Acquisition by hostile actor (evaluated case-by-case)
- License change incompatible with our use (e.g., GPL → proprietary)
- Loss of API documentation or discontinuation notice

## Data Processing Agreement (DPA) Template

For Critical and High Tier vendors, execute a DPA covering:

```
1. Data Subject Rights: Koli One customers are data subjects; vendor must respect
   GDPR rights (access, deletion, portability, rectification)

2. Data Sub-processors: Any sub-contractor processing data must be approved by us;
   vendor liable for sub-processor compliance

3. Incident Notification: Vendor must notify us within 24 hours of suspected breach

4. Data Deletion: Upon account closure, all customer data deleted within 30 days
   (proof of deletion provided)

5. Audit Rights: Annual audit or SOC 2 report provided to us

6. Liability: Vendor liable for data breaches caused by negligence; cap liability
   at 12 months of fees paid
```

## Exit Strategy by Tier

### Critical Tier (Firestore, Firebase)
**Exit Plan**:
1. Parallel data export (monthly automated exports to CSV + JSON)
2. Develop migration scripts to alternative DB (PostgreSQL, MongoDB)
3. Staging test of full migration (3-month lead time)
4. Canary migration: Dual-write for 2 weeks, validate sync, then cut over

**Timeline to Alternative**: 90 days minimum

**Trigger for Exit**: SLA breach >2 incidents/month, pricing >30% above alternatives, or EOL announcement

### High Tier (Algolia, Firebase Realtime)
**Exit Plan**:
1. Switch primary index to Elasticsearch (self-hosted or managed)
2. Data export and reindex (1-2 weeks)
3. Query routing change (feature flag: USE_ELASTICSEARCH=true)
4. Shadow traffic testing (run queries against both, compare results)

**Timeline to Alternative**: 30 days minimum

**Trigger for Exit**: SLA breach >5 incidents/month OR no resolution within SLA

### Medium Tier (SendGrid, Sentry)
**Exit Plan**:
1. Use built-in alternative (SMTP for email, local logs for monitoring)
2. Halt new feature adoption from vendor
3. Migrate data if possible, then deactivate account

**Timeline to Alternative**: 7 days (immediate degradation acceptable)

**Trigger for Exit**: Cost spike, acquisition, or feature deprecation

## Vendor Risk Register

```markdown
## Vendor: Algolia

**Risk Category**: HIGH

**Risk Statement**: Algolia outage (>4 hours) blocks search; no degradation mode.

**Mitigation**:
- Maintain read-only cache of search results (Redis, 1-hour TTL)
- Develop Elasticsearch fallback (staging ready, not deployed)
- Algolia SLA guarantees 99.9% availability

**Exit Plan**: Switch to Elasticsearch (30-day lead time)

**Owner**: Backend Lead

**Status**: ✓ Mitigated (SLA + cache + fallback plan ready)
```

## Vendor Decision Log

| Vendor | Decision | Date | Owner | Rationale |
|--------|----------|------|-------|-----------|
| Algolia | Approved | 2024-06-01 | CTO | Best search; SLA + exit plan in place |
| SendGrid | Approved | 2024-03-15 | Ops | Reliable; SMTP fallback available |
| Stripe | Approved (Conditional) | 2024-08-20 | Finance | Only for future payments; bank transfers default |
| Vercel | Rejected | 2024-07-10 | DevOps | GitHub Actions sufficient; vendor lock-in risk |

## Annual Vendor Review

**Q1 Agenda**:
- [ ] Review Critical Tier SLAs and incidents
- [ ] Assess pricing adjustments
- [ ] Update DPAs and license compliance
- [ ] Test exit plan for 1 Critical Tier vendor (run-through without cutover)

**Q2 Agenda**:
- [ ] Evaluate new alternatives for High Tier vendors
- [ ] Security audit of vendor compliance matrix
- [ ] Update risk register

**Q3 Agenda**:
- [ ] Cost optimization review
- [ ] Incident post-mortems related to vendor issues

**Q4 Agenda**:
- [ ] Plan budget for redundancy investments
- [ ] Finalize next year vendor roadmap

## See Also
- [governance/CHANGE_APPROVAL.md](CHANGE_APPROVAL.md) — CAB approval for new vendor adoption
- [Vendor SLA Matrix](../ops/sla-matrix.md) — Detailed SLOs and alerts
- [Data Processing Agreement](../legal/dpa-template.md) — Legal DPA template
