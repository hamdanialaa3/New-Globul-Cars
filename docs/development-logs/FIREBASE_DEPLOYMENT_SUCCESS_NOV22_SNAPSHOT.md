# Firebase Hosting Deployment – Safety Snapshot (Nov 22, 2025)

Deployment Successful.

| Item | Status |
|------|--------|
| Build Command | npm run deploy (CRACO build + hosting) |
| Functions Deployment | SKIPPED (firebase CLI missing) |
| Hosting URL | <https://fire-new-globul.web.app> |
| Project Console | <https://console.firebase.google.com/project/fire-new-globul/overview> |
| Snapshot Tag | checkpoint-nov22-2025 |
| Snapshot Branch | checkpoint-nov22-2025-branch |

## Notes

- Hosting build completed with warnings on large images (non-blocking).
- Functions were not deployed because `firebase` CLI is not installed in current shell.
- To deploy functions next: `npm install -g firebase-tools` then `firebase login` then `firebase deploy --only functions`.

## Verification Commands (Post-Install CLI)

```pwsh
firebase --version
firebase deploy --only functions
firebase functions:list
```

## Rollback

```pwsh
git checkout checkpoint-nov22-2025-branch
```

Generated: 2025-11-22
Author: GitHub Copilot
