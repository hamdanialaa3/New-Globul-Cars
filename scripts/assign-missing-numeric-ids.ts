/**
 * Assign Missing Numeric IDs to Users
 * Run this script to assign numeric IDs to users who don't have them yet
 * 
 * Usage: npx ts-node scripts/assign-missing-numeric-ids.ts
 */

import * as admin from 'firebase-admin';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, '..', 'firebase-service-account.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://fire-new-globul.firebaseio.com'
});

const db = admin.firestore();

interface UserDoc {
  uid: string;
  email?: string;
  numericId?: number;
  displayName?: string;
  createdAt?: admin.firestore.Timestamp;
}

async function assignMissingNumericIds() {
  console.log('🔍 Finding users without numeric IDs...\n');

  try {
    // Get all users from Firestore
    const usersSnapshot = await db.collection('users').get();
    
    const usersWithoutNumericId: UserDoc[] = [];
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data() as UserDoc;
      if (!userData.numericId) {
        usersWithoutNumericId.push({
          ...userData,
          uid: doc.id
        });
      }
    });

    console.log(`Found ${usersWithoutNumericId.length} users without numeric IDs\n`);

    if (usersWithoutNumericId.length === 0) {
      console.log('✅ All users have numeric IDs assigned!');
      process.exit(0);
    }

    // Display users
    console.log('Users needing numeric ID assignment:');
    console.log('─'.repeat(80));
    usersWithoutNumericId.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email || 'No email'}`);
      console.log(`   UID: ${user.uid}`);
      console.log(`   Name: ${user.displayName || 'No name'}`);
      console.log('');
    });
    console.log('─'.repeat(80));
    console.log('');

    // Get current counter
    const counterDoc = await db.collection('counters').doc('users').get();
    let currentCount = counterDoc.exists ? (counterDoc.data()?.count || 0) : 0;

    console.log(`Current users counter: ${currentCount}\n`);

    // Assign numeric IDs
    const batch = db.batch();
    const assignments: Array<{email: string, uid: string, numericId: number}> = [];

    for (const user of usersWithoutNumericId) {
      currentCount++;
      
      // Update user document with numeric ID
      const userRef = db.collection('users').doc(user.uid);
      batch.update(userRef, {
        numericId: currentCount,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Create numeric ID mapping
      const mappingRef = db.collection('numeric_ids').doc(String(currentCount));
      batch.set(mappingRef, {
        firebaseUid: user.uid,
        type: 'user',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      assignments.push({
        email: user.email || 'No email',
        uid: user.uid,
        numericId: currentCount
      });

      console.log(`✅ Assigning ID ${currentCount} to: ${user.email || user.uid}`);
    }

    // Update counter
    const counterRef = db.collection('counters').doc('users');
    batch.set(counterRef, {
      count: currentCount,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // Commit batch
    console.log('\n📝 Committing changes to Firestore...');
    await batch.commit();

    console.log('\n✅ Successfully assigned numeric IDs!\n');
    console.log('Summary:');
    console.log('─'.repeat(80));
    assignments.forEach(assignment => {
      console.log(`Email: ${assignment.email}`);
      console.log(`UID: ${assignment.uid}`);
      console.log(`→ Numeric ID: ${assignment.numericId}`);
      console.log('');
    });
    console.log('─'.repeat(80));
    console.log(`\nNew users counter: ${currentCount}`);
    console.log('\n🎉 Done! Users can now use numeric ID URLs.\n');

  } catch (error) {
    console.error('❌ Error assigning numeric IDs:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the script
assignMissingNumericIds();
