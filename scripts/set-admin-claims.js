#!/usr/bin/env node
/**
 * set-admin-claims.js
 * 
 * Sets Firebase Auth custom claims for admin users.
 * This is required for Firestore rules `hasAdminClaim()` to work.
 * 
 * Prerequisites:
 *   1. Firebase Admin SDK service account key (download from Firebase Console → Project Settings → Service Accounts)
 *   2. Place as: web/service-account-key.json  (already in .gitignore)
 * 
 * Usage:
 *   node scripts/set-admin-claims.js
 * 
 * Or set specific emails:
 *   node scripts/set-admin-claims.js user@example.com
 */

const admin = require('firebase-admin');
const path = require('path');

// Default admin emails (update as needed)
const DEFAULT_ADMIN_EMAILS = [
  'alaa.hamdani@yahoo.com',
  'hamdanialaa@yahoo.com',
  'globul.net.m@gmail.com',
  'hamdanialaa@gmail.com'
];

async function main() {
  // Try to initialize with service account
  const serviceAccountPath = path.join(__dirname, '..', 'service-account-key.json');
  
  try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Initialized with service account');
  } catch {
    // Fallback: use application default credentials (e.g., from gcloud CLI)
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: 'fire-new-globul'
      });
      console.log('✅ Initialized with application default credentials');
    } catch (err) {
      console.error('❌ Could not initialize Firebase Admin SDK.');
      console.error('   Place your service account key at: web/service-account-key.json');
      console.error('   Download from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key');
      process.exit(1);
    }
  }

  // Get emails from CLI args or use defaults
  const emails = process.argv.slice(2).length > 0
    ? process.argv.slice(2)
    : DEFAULT_ADMIN_EMAILS;

  console.log(`\n🔐 Setting admin claims for ${emails.length} user(s)...\n`);

  for (const email of emails) {
    try {
      const user = await admin.auth().getUserByEmail(email);
      
      // Set custom claims
      await admin.auth().setCustomUserClaims(user.uid, {
        admin: true,
        role: 'super_admin'
      });

      // Verify
      const updated = await admin.auth().getUser(user.uid);
      console.log(`✅ ${email} (UID: ${user.uid})`);
      console.log(`   Claims: ${JSON.stringify(updated.customClaims)}`);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        console.log(`⚠️  ${email} — user not found in Firebase Auth, skipping`);
      } else {
        console.error(`❌ ${email} — error: ${err.message}`);
      }
    }
  }

  console.log('\n✅ Done! Users must sign out and sign back in for claims to take effect.');
  console.log('   Or call getIdTokenResult(user, true) to force refresh.\n');
  process.exit(0);
}

main();
