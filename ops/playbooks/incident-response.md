# Incident Response Playbook

## Severity Levels

| Level | Impact | Response Time | Example |
|-------|--------|---------------|---------|
| **P0** | Site down, data loss | < 30 min | Firebase outage, auth broken |
| **P1** | Major feature broken | < 2 hours | Listing creation fails, payments broken |
| **P2** | Minor feature broken | < 24 hours | Search filters not working, styling issue |
| **P3** | Cosmetic / low impact | Next sprint | Typo, minor UI alignment |

## P0 / P1 Response Steps

### 1. Detect
- Firebase console alerts
- User reports
- Monitoring dashboards

### 2. Assess
- Identify affected component (hosting, functions, Firestore, Auth, Algolia)
- Estimate user impact (all users, specific region, specific flow)

### 3. Communicate
- Update project status (GitHub issue with `[INCIDENT]` label)
- Notify stakeholders

### 4. Mitigate
- If deployment caused it: roll back via Firebase Hosting console
- If data issue: check Firestore rules and security
- If external service: check Firebase Status Dashboard

### 5. Resolve
- Create `hotfix/*` branch
- Minimal fix, fast-track review
- Deploy and verify

### 6. Post-Mortem
- Document: what happened, timeline, root cause, fix applied
- File in `docs/reports/incidents/`
- Identify preventive measures

## Key Resources

| Resource | URL |
|----------|-----|
| Firebase Console | https://console.firebase.google.com/project/fire-new-globul |
| Firebase Status | https://status.firebase.google.com |
| Production Site | https://koli.one |
| GitHub Repo | https://github.com/hamdanialaa3/New-Globul-Cars |
