# Deployment Runbook

## Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Authenticated: `firebase login`
- Project selected: `firebase use fire-new-globul`

## Web App (Hosting)

### Build
```bash
cd c:\Users\hamda\Desktop\Koli_One_Root
npm run build
```

### Preview (Staging Channel)
```bash
firebase hosting:channel:deploy preview --expires 7d
```

### Deploy to Production
```bash
firebase deploy --only hosting
```

### Verify
- https://koli.one — check home page loads
- Test listing creation flow
- Test search functionality
- Test login/auth flows

## Cloud Functions

### Deploy All Functions
```bash
firebase deploy --only functions
```

### Deploy Specific Function
```bash
firebase deploy --only functions:functionName
```

### Check Logs
```bash
firebase functions:log --only functionName
```

## Firestore

### Deploy Rules
```bash
firebase deploy --only firestore:rules
```

### Deploy Indexes
```bash
firebase deploy --only firestore:indexes
```

## Storage

### Deploy Rules
```bash
firebase deploy --only storage
```

## Full Deploy
```bash
firebase deploy
```

## Rollback
1. Go to Firebase Hosting console
2. Find previous deployment
3. Click "Rollback to this version"

Or via CLI:
```bash
firebase hosting:clone fire-new-globul:live fire-new-globul:live --version PREVIOUS_VERSION_ID
```
