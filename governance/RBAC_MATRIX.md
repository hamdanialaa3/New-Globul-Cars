# RBAC Matrix — Role-Based Access Control

## Overview
Defines roles, permissions, and restrictions for Koli One system.

## Roles

| Role | Scope | Primary Responsibilities |
|------|-------|--------------------------|
| **Super Admin** | System-wide | Infrastructure, user oversight, incident response |
| **Admin** | Business operations | Content moderation, fraud detection, support escalation |
| **Support** | Customer service | Respond to user issues, process refunds |
| **Developer** | Code changes | Merge to main, deploy to staging/prod |
| **ML Engineer** | Model training & deployment | Run training pipelines, deploy A/B models |
| **DevOps** | Infrastructure & secrets | Manage infra, rotate keys, on-call |
| **Seller/Dealer** | Own listings | Create, edit, view analytics for own listings |
| **User** | Consumer | Browse, message, buy |

## Permissions Matrix

| Action | Super Admin | Admin | Support | Dev | ML | DevOps | Seller | User |
|--------|-------------|-------|---------|-----|----|----- ---|--------|------|
| **Authentication & Accounts** | | | | | | | | |
| Delete user account | ✓ | ✓ | | | | | | ✓ (own) |
| Ban user | ✓ | ✓ | | | | | | |
| Reset user password (admin) | ✓ | ✓ | ✓ | | | | | |
| View user audit logs | ✓ | ✓ | | | | | | |
| **Listing Management** | | | | | | | | |
| Create listing | ✓ | ✓ | | | | | ✓ | ✓ |
| Edit own listing | ✓ | ✓ | | | | | ✓ | ✓ |
| Edit any listing | ✓ | | | | | | | |
| Delete own listing | ✓ | ✓ | | | | | ✓ | ✓ |
| Approve listing (moderation) | ✓ | ✓ | | | | | | |
| View listing analytics | ✓ | ✓ | | | | | ✓ | |
| **Content Moderation** | | | | | | | | |
| View moderation queue | ✓ | ✓ | | | | | | |
| Moderate content | ✓ | ✓ | | | | | | |
| Ban seller | ✓ | ✓ | | | | | | |
| **Code & Infrastructure** | | | | | | | | |
| Merge to main branch | ✓ | | | ✓ | ✓ | ✓ | | |
| Deploy to staging | ✓ | | | ✓ | ✓ | ✓ | | |
| Deploy to production | ✓ | | | ✓ | ✓ | ✓ | | |
| View CI/CD logs | ✓ | | | ✓ | ✓ | ✓ | | |
| **Secrets & Keys** | | | | | | | | |
| Manage API keys | ✓ | | | | | ✓ | | |
| Rotate secrets | ✓ | | | | | ✓ | | |
| Access Secret Manager | ✓ | | | | | ✓ | | |
| **ML Operations** | | | | | | | | |
| Train models | ✓ | | | ✓ | ✓ | | | |
| Deploy model to prod | ✓ | | | ✓ | ✓ | | | |
| A/B test models | ✓ | | | ✓ | ✓ | | | |
| Access dataset registry | ✓ | | | ✓ | ✓ | | | |
| **Governance** | | | | | | | | |
| Edit CONSTITUTION.md | ✓ | | | | | | | |
| Approve schema changes | ✓ | | | | | | | |
| Schedule architecture review | ✓ | | | | | | | |
| **Billing & Finance** | | | | | | | | |
| View payment reports | ✓ | ✓ | | | | | | |
| Process refunds | ✓ | ✓ | ✓ | | | | | |
| Manage payment method | ✓ | | | | | | ✓ | ✓ (own) |

## MFA (Multi-Factor Authentication)

**Required for:**
- Super Admin (2-factor mandatory)
- Admin (2-factor mandatory)
- DevOps (2-factor mandatory)
- All developers with prod access (2-factor mandatory)

**Recommended for:**
- Support (2-factor recommended)
- All users with sensitive access

## Data Access Restrictions

| Role | Can access | Cannot access |
|------|----------|-----------------|
| Super Admin | All data | None |
| Admin | User data, listings, analytics | Encrypted payments, secrets |
| Support | User contact info, listing details, conversation history | Encrypted payments, secrets, source code |
| Developer | Source code, dev Firebase project, staging data | Production secrets, user auth tokens, payment info |
| ML | Training datasets, model performance | User PII beyond what training data requires, payment info |
| DevOps | Infrastructure logs, secrets, audit logs | Application code, user data |
| Seller | Own listing data, messages, sales analytics | Other sellers' data, user contact info |
| User | Own profile, messages, favorite listings | Other users' contact info, admin data |

## Audit & Monitoring

- All privileged actions logged to `audit_logs` collection
- Sensitive actions (secret rotation, user ban) trigger Slack alert
- Monthly access review by Security Lead
- Unauthorized access attempts trigger immediate alert + block

## Review Schedule

- **Monthly**: Verify access levels align with actual role
- **Quarterly**: Security audit of SuperAdmin actions
- **Annual**: Full RBAC matrix review and reset

## Contact

- **Questions**: Open issue with `label: rbac`
- **Changes**: Submit PR to update matrix
- **Emergency**: Page on-call DBA + Security Lead
