# CONSTITUTION Changelog

All changes to the Koli One Technical Constitution are documented here\nwith date, author, scope, and rationale.

## Format

```
## [Date] - Version [N] - [Scope: Architecture / Security / DevOps / Product / Governance]

### Changes
- [Specific change]
- [Justification]

### Approved By
- [Name] - [Title]
- [Name] - [Title]
```

## Entries

## 2026-02-18 - Version 0.2 - Slug Service & Sitemap

### Changes
- Implemented SlugService for SEO-friendly URL generation
- Integrated slug assignment into all listing creation/update flows
- Updated sitemap generator to prefer canonicalUrl with slug fallback
- Added 301 redirect middleware for slug changes
- Implemented short links service (/s/{shortCode})
- Added slug history collection for 301 redirects and analytics

### Rationale
SEO optimization requires stable, descriptive URLs. Numeric IDs are preserved for privacy, slugs added as secondary canonical URL layer.

### Approved By
- Engineering Team - Lead
- CTO - Architecture Review

## 2026-02-18 - Version 0.1 - Initial Constitution

### Changes
- Established 13-section constitution covering architecture, security, DevOps, ML, product, governance
- Defined numeric ID system (userNumericId, listingNumericId)
- Established 300-line file limit, no console.*, no emoji rules
- Created governance/ ops/ schemas/ ml/ directory structure
- Wrote RBAC, incident response, deployment runbooks

### Rationale
First formal governance document to ensure consistency, scalability, and team alignment as project grows.

### Approved By
- Alaa Al-Hamdani - Lead Developer
- CTO - Architecture Review
