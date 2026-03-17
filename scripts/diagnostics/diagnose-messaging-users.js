const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin with default credentials
try {
  initializeApp();
} catch (e) {
  // Ignore if already initialized
}

const db = getFirestore();

async function diagnose() {
  console.log('🔍 Diagnosing users 80 and 90...');
  
  const targetIds = [80, 90];
  
  for (const id of targetIds) {
    console.log(`\n----------------------------------------`);
    console.log(`Checking ID: ${id}`);
    
    // 1. Check as NUMBER
    const snapshotNum = await db.collection('users').where('numericId', '==', Number(id)).get();
    
    // 2. Check as STRING
    const snapshotStr = await db.collection('users').where('numericId', '==', String(id)).get();
    
    if (snapshotNum.empty && snapshotStr.empty) {
      console.log(`❌ User NOT FOUND by either number or string query.`);
    } else {
      if (!snapshotNum.empty) {
        console.log(`✅ Found by NUMBER Query.`);
        snapshotNum.forEach(doc => {
          const data = doc.data();
          console.log(`   • UID: ${doc.id}`);
          console.log(`   • numericId value: ${data.numericId}`);
          console.log(`   • numericId type: ${typeof data.numericId}`);
          console.log(`   • Email: ${data.email}`);
        });
      }
      
      if (!snapshotStr.empty) {
        console.log(`⚠️ Found by STRING Query.`);
        snapshotStr.forEach(doc => {
          const data = doc.data();
          console.log(`   • UID: ${doc.id}`);
          console.log(`   • numericId value: '${data.numericId}'`);
          console.log(`   • numericId type: ${typeof data.numericId}`);
          console.log(`   • Email: ${data.email}`);
        });
      }
    }
  }
  console.log(`\n----------------------------------------`);
}

diagnose().then(() => {
  console.log('Diagnosis complete.');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
