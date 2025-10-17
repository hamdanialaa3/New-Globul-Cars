# Firebase Regions Unification Plan

Current state
- Cloud Functions (stats, analytics, etc.): deployed in europe-west1
- Extensions (Delete User Data): deployed in europe-west3
- Firestore: nam5 (multi-region)

Issue
Multiple regions increase monitoring complexity and may cause slight latency between services.

Recommendation
Unify all new deployments to europe-west3 for consistency.

Action plan
1. Keep existing functions in europe-west1 for now (no disruption)
2. Deploy all NEW functions to europe-west3
3. Gradually migrate critical functions to europe-west3 during maintenance windows
4. Update function region in code before deployment

How to change function region in code
Open functions/src/yourFunction.ts and set region:
```typescript
export const myFunction = functions.region('europe-west3').https.onCall(...)
```

Benefits of unification
- Simpler monitoring in Firebase Console
- Potentially lower inter-region data transfer costs
- Consistent deployment patterns

Notes
- Firestore nam5 is multi-region and works well with both europe-west1 and europe-west3
- No immediate action needed; proceed incrementally
