/**
 * Fix Invalid Conversations - Delete conversations with UID as ID
 * 
 * Run: node scripts/fix-invalid-conversations.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');

try {
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  console.log('Make sure firebase-service-account.json exists in project root');
  process.exit(1);
}

const db = admin.firestore();

async function fixInvalidConversations() {
  console.log('🔍 Scanning for invalid conversations...\n');
  
  const conversationsRef = db.collection('conversations');
  const snapshot = await conversationsRef.get();
  
  let validCount = 0;
  let invalidCount = 0;
  const invalidDocs = [];
  
  snapshot.docs.forEach(doc => {
    const docId = doc.id;
    const data = doc.data();
    
    // Check if ID is valid (20 chars)
    if (docId.length !== 20) {
      console.log(`❌ Invalid conversation found:`);
      console.log(`   ID: ${docId} (length: ${docId.length})`);
      console.log(`   Participants: ${data.participants?.join(', ')}`);
      console.log('');
      invalidDocs.push(doc.ref);
      invalidCount++;
    } else {
      validCount++;
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Valid conversations: ${validCount}`);
  console.log(`   Invalid conversations: ${invalidCount}`);
  
  if (invalidDocs.length === 0) {
    console.log('\n✅ No invalid conversations found!');
    process.exit(0);
  }
  
  console.log(`\n⚠️  Found ${invalidDocs.length} invalid conversation(s)`);
  console.log('These will be DELETED. Continue? (yes/no)');
  
  // Wait for user confirmation
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('', async (answer) => {
    readline.close();
    
    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled');
      process.exit(0);
    }
    
    console.log('\n🗑️  Deleting invalid conversations...');
    
    const batch = db.batch();
    invalidDocs.forEach(docRef => {
      batch.delete(docRef);
    });
    
    try {
      await batch.commit();
      console.log(`✅ Successfully deleted ${invalidDocs.length} invalid conversation(s)`);
      console.log('\n✨ Done! Refresh your browser to see the fix.');
    } catch (error) {
      console.error('❌ Failed to delete conversations:', error);
      process.exit(1);
    }
    
    process.exit(0);
  });
}

// Run
fixInvalidConversations().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
