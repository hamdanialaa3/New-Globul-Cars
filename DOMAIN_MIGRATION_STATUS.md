# Domain Migration Status — globul.net → mobilebg.eu

Date: 2025-11-04

## Summary
Code-level references to globul.net have been migrated to mobilebg.eu in Cloud Functions and SPA where relevant. No behavior change—only URLs/emails were updated. Provider stack and bilingual system unchanged.

## Files updated
- functions/src/verification/emailService.ts
  - profile/admin links → mobilebg.eu
- functions/src/facebook/messenger-webhook.ts
  - Response links → mobilebg.eu
- functions/src/facebook/data-deletion.ts
  - Confirmation URL → mobilebg.eu
- functions/src/reviews/reportReview.ts
  - Admin email + admin URL → mobilebg.eu
- functions/src/team/acceptInvite.ts
  - Dashboard URL → mobilebg.eu
- functions/src/team/inviteMember.ts
  - Team invitation link → mobilebg.eu
- functions/src/billing/generateInvoice.ts
  - Company invoice email → invoice@mobilebg.eu
- functions/src/facebook-catalog.ts
  - Documented feed URLs → mobilebg.eu
- bulgarian-car-marketplace/src/pages/DealerPublicPage/index.tsx
  - og:image fallback now local (/default-dealer.png)
- bulgarian-car-marketplace/src/pages/N8nTestPage.tsx
  - Test email → test@mobilebg.eu
- bulgarian-car-marketplace/public/catalog-feed.xml
  - Sample image link → https://mobilebg.eu/sample-car.jpg
- .env.example
  - DOMAIN=mobilebg.eu

## Verification checklist
After deploy, validate:
- Approval/Reject verification emails open https://mobilebg.eu/profile and /admin/verification
- Team invitation email opens https://mobilebg.eu/team/accept-invite/{id}
- Messenger auto-replies use https://mobilebg.eu links
- Review auto-flag email sent to admin@mobilebg.eu with correct admin URL
- Invoice emails come from invoice@mobilebg.eu (as configured)

## How to deploy
Use your usual deploy flow. Example (PowerShell):

```powershell
# From repo root
npm run build --workspace functions  # if you have a build step
firebase deploy --only functions
```

If you use npm scripts:

```powershell
npm run deploy:functions
```

## Notes
- Compiled outputs (functions/lib/**, build/**) were not edited.
- One Gmail occurrence remains as metadata in SPA: live-firebase-counters-service.ts ('globul.net.m@gmail.com'); left intentionally since it’s not a domain link. Update if you want to rebrand the address.
- Algolia crawler: see ALGOLIA_CRAWLER_RUNBOOK.md for safe reindexing on mobilebg.eu.
