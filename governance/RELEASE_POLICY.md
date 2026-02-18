# Release Policy

## Versioning
Koli One uses **calendar versioning**: `YYYY.MM.patch` (e.g., `2026.02.1`).

## Release Cadence
- **Regular releases**: bi-weekly, aligned with sprint end.
- **Hotfixes**: on-demand, within 24 hours of critical bug report.

## Release Checklist

### Pre-Release
- [ ] All PRs for this release are merged to `main`
- [ ] `npm run type-check` passes (zero errors)
- [ ] `npm test` passes (all suites)
- [ ] `npm run build` succeeds
- [ ] Manual smoke test on staging (Firebase preview channel)

### Release
- [ ] Tag release: `git tag v2026.02.1`
- [ ] Deploy hosting: `firebase deploy --only hosting`
- [ ] Deploy functions (if changed): `firebase deploy --only functions`
- [ ] Verify production: https://koli.one
- [ ] Verify key flows: login, listing creation, search, messaging

### Post-Release
- [ ] Monitor Firebase console for errors (30 min window)
- [ ] Check Algolia search index health
- [ ] Update `CHANGELOG.md` if maintained

## Rollback
1. Identify last stable deployment in Firebase Hosting console.
2. Roll back: `firebase hosting:channel:deploy rollback --only hosting`
3. Or revert commit and redeploy.
