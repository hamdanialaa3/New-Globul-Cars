// Firebase Backup Service (FREE - Using GitHub Actions OR Cloud Scheduler)
// Automated daily backups to Cloud Storage

/**
 * Backup Strategy (100% FREE):
 * 
 * Option 1: GitHub Actions (RECOMMENDED - 100% FREE)
 * - 2000 minutes/month free
 * - Runs on schedule (cron)
 * - No Cloud Scheduler costs
 * 
 * Option 2: Cloud Scheduler + Cloud Functions
 * - 3 jobs free/month (Firebase Spark plan)
 * - May exceed free tier if many backups
 */

// ========== Option 1: GitHub Actions Backup (FREE - RECOMMENDED) ==========

/**
 * Create .github/workflows/firebase-backup.yml
 */
export const GITHUB_ACTIONS_BACKUP_WORKFLOW = `
name: Firebase Backup

on:
  schedule:
    # Run daily at 2 AM UTC (FREE - GitHub Actions)
    - cron: '0 2 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  backup:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Firebase Tools
        run: npm install -g firebase-tools
      
      - name: Authenticate Firebase
        env:
          FIREBASE_TOKEN: \${{ secrets.FIREBASE_TOKEN }}
        run: echo "$FIREBASE_TOKEN" > firebase-token.txt
      
      - name: Export Firestore Data
        run: |
          firebase --token "$(cat firebase-token.txt)" firestore:export gs://your-bucket/backups/$(date +%Y%m%d)
      
      - name: Cleanup
        run: rm firebase-token.txt
      
      - name: Send notification
        if: failure()
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: smtp.gmail.com
          server_port: 465
          username: \${{ secrets.EMAIL_USERNAME }}
          password: \${{ secrets.EMAIL_PASSWORD }}
          to: admin@globulcars.bg
          from: GitHub Actions
          subject: ❌ Firebase Backup Failed
          body: Check GitHub Actions logs for details.

# Setup:
# 1. Generate Firebase token: firebase login:ci
# 2. Add to GitHub Secrets: FIREBASE_TOKEN
# 3. Replace 'your-bucket' with your Firebase Storage bucket
# 4. (Optional) Add email credentials to GitHub Secrets
`;

// ========== Option 2: Cloud Functions Backup (FREE tier may not cover) ==========

/**
 * Cloud Function for scheduled backups
 * Deploy to Firebase Functions
 */
export const CLOUD_FUNCTION_BACKUP = `
// functions/src/backup.ts
import * as functions from 'firebase-functions';
import { firestore } from 'firebase-admin';

const client = new firestore.v1.FirestoreAdminClient();
const bucket = 'gs://your-project-id.appspot.com/backups';

export const scheduledFirestoreBackup = functions.pubsub
  .schedule('every 24 hours')
  .timeZone('Europe/Sofia') // Bulgarian timezone
  .onRun(async (context) => {
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    const databaseName = client.databasePath(projectId!, '(default)');
    
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const outputUriPrefix = \`\${bucket}/\${timestamp}\`;
    
    try {
      const [response] = await client.exportDocuments({
        name: databaseName,
        outputUriPrefix,
        collectionIds: [], // Empty = all collections
      });
      
      console.log(\`✅ Backup started: \${response.name}\`);
      return { success: true, operation: response.name };
    } catch (error) {
      console.error('❌ Backup failed:', error);
      throw error;
    }
  });

// Deploy:
// firebase deploy --only functions:scheduledFirestoreBackup
`;

// ========== Manual Backup Script (FREE - Run locally) ==========

/**
 * Manual backup script
 * Run: node scripts/backup-firestore.js
 */
export const MANUAL_BACKUP_SCRIPT = `
// scripts/backup-firestore.js
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const backupCollection = async (collectionName) => {
  const snapshot = await db.collection(collectionName).get();
  const data = {};
  
  snapshot.forEach(doc => {
    data[doc.id] = doc.data();
  });
  
  return data;
};

const backupAllCollections = async () => {
  const collections = ['cars', 'users', 'messages', 'reviews', 'subscriptions'];
  const backup = {};
  
  for (const collectionName of collections) {
    console.log(\`Backing up \${collectionName}...\`);
    backup[collectionName] = await backupCollection(collectionName);
  }
  
  const fs = require('fs');
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = \`backup-\${timestamp}.json\`;
  
  fs.writeFileSync(filename, JSON.stringify(backup, null, 2));
  console.log(\`✅ Backup saved to \${filename}\`);
};

backupAllCollections().catch(console.error);
`;

// ========== Restore Script (FREE) ==========

/**
 * Restore from backup
 * Run: node scripts/restore-firestore.js backup-2025-11-07.json
 */
export const RESTORE_SCRIPT = `
// scripts/restore-firestore.js
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');
const fs = require('fs');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const restoreCollection = async (collectionName, data) => {
  const batch = db.batch();
  let count = 0;
  
  for (const [docId, docData] of Object.entries(data)) {
    const docRef = db.collection(collectionName).doc(docId);
    batch.set(docRef, docData);
    count++;
    
    // Firestore batch limit: 500 operations
    if (count % 500 === 0) {
      await batch.commit();
      console.log(\`  Restored \${count} documents...\`);
    }
  }
  
  await batch.commit();
  console.log(\`✅ Restored \${count} documents to \${collectionName}\`);
};

const restoreFromBackup = async (backupFile) => {
  const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
  
  for (const [collectionName, data] of Object.entries(backup)) {
    console.log(\`Restoring \${collectionName}...\`);
    await restoreCollection(collectionName, data);
  }
  
  console.log('✅ Restore complete!');
};

const backupFile = process.argv[2];
if (!backupFile) {
  console.error('Usage: node restore-firestore.js <backup-file.json>');
  process.exit(1);
}

restoreFromBackup(backupFile).catch(console.error);
`;

// ========== Backup Retention Policy (FREE - Cloud Storage lifecycle) ==========

/**
 * Cloud Storage lifecycle rules (FREE)
 * Delete old backups automatically to save storage costs
 * 
 * Create lifecycle.json:
 */
export const LIFECYCLE_RULES = `
{
  "lifecycle": {
    "rule": [
      {
        "action": {
          "type": "Delete"
        },
        "condition": {
          "age": 30,
          "matchesPrefix": ["backups/"]
        }
      },
      {
        "action": {
          "type": "SetStorageClass",
          "storageClass": "COLDLINE"
        },
        "condition": {
          "age": 7,
          "matchesPrefix": ["backups/"]
        }
      }
    ]
  }
}

# Apply lifecycle rules:
# gsutil lifecycle set lifecycle.json gs://your-bucket
`;

// ========== Setup Checklist (100% FREE) ==========

/**
 * Backup setup guide (choose GitHub Actions for 100% FREE):
 * 
 * ✅ 1. Choose backup method:
 *    - GitHub Actions (RECOMMENDED - 100% FREE, 2000 min/month)
 *    - Cloud Scheduler (May exceed free tier)
 * 
 * ✅ 2. GitHub Actions setup:
 *    a. Generate Firebase token: firebase login:ci
 *    b. Add to GitHub Secrets as FIREBASE_TOKEN
 *    c. Create .github/workflows/firebase-backup.yml
 *    d. Update bucket name in workflow
 *    e. Test with manual trigger
 * 
 * ✅ 3. Create manual backup script:
 *    a. Create scripts/backup-firestore.js
 *    b. Test: node scripts/backup-firestore.js
 * 
 * ✅ 4. Create restore script:
 *    a. Create scripts/restore-firestore.js
 *    b. Test restore in emulator first!
 * 
 * ✅ 5. Setup lifecycle rules:
 *    a. Create lifecycle.json
 *    b. Apply: gsutil lifecycle set lifecycle.json gs://bucket
 *    c. Keep 30 days, archive after 7 days
 * 
 * ✅ 6. Test complete workflow:
 *    a. Trigger GitHub Action manually
 *    b. Verify backup in Cloud Storage
 *    c. Test restore in emulator
 *    d. Document process
 * 
 * Total cost: €0 (GitHub Actions free tier covers daily backups)
 */

/**
 * Alternative FREE backup methods:
 * 
 * 1. Vercel Cron Jobs (FREE - if using Vercel)
 *    - Hobby plan includes cron
 *    - Same as GitHub Actions
 * 
 * 2. Netlify Build Hooks (FREE)
 *    - Trigger backup on deploy
 *    - Limited scheduling
 * 
 * 3. Manual backups (FREE - but requires discipline)
 *    - Run script weekly
 *    - Save to local/external storage
 */

const backupService = {
  GITHUB_ACTIONS_BACKUP_WORKFLOW,
  CLOUD_FUNCTION_BACKUP,
  MANUAL_BACKUP_SCRIPT,
  RESTORE_SCRIPT,
  LIFECYCLE_RULES,
};

export default backupService;
