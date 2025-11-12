/**
 * Verify Migration Script
 * سكريبت التحقق من الترحيل
 */

const admin = require('firebase-admin');

const db = admin.firestore();

async function verifyCars() {
  console.log('🚗 Verifying cars...');
  const snapshot = await db.collection('cars').limit(100).get();
  
  const issues = [];
  let valid = 0;
  
  snapshot.forEach(doc => {
    const data = doc.data();
    
    // Check required fields
    if (!data.status) issues.push(`${doc.id}: missing status`);
    if (data.isActive === undefined) issues.push(`${doc.id}: missing isActive`);
    if (data.isSold === undefined) issues.push(`${doc.id}: missing isSold`);
    if (!data.createdAt) issues.push(`${doc.id}: missing createdAt`);
    
    if (issues.length === 0) valid++;
  });
  
  console.log(`✅ Valid: ${valid}/${snapshot.size}`);
  if (issues.length > 0) {
    console.log(`⚠️  Issues found: ${issues.length}`);
    issues.slice(0, 10).forEach(issue => console.log(`   - ${issue}`));
  }
}

async function verifyUsers() {
  console.log('\n👤 Verifying users...');
  const snapshot = await db.collection('users').limit(100).get();
  
  const issues = [];
  let valid = 0;
  
  snapshot.forEach(doc => {
    const data = doc.data();
    
    if (!data.email) issues.push(`${doc.id}: missing email`);
    if (!data.lastActive) issues.push(`${doc.id}: missing lastActive`);
    
    if (issues.length === 0) valid++;
  });
  
  console.log(`✅ Valid: ${valid}/${snapshot.size}`);
  if (issues.length > 0) {
    console.log(`⚠️  Issues found: ${issues.length}`);
    issues.slice(0, 10).forEach(issue => console.log(`   - ${issue}`));
  }
}

async function main() {
  console.log('🔍 Starting verification...\n');
  
  try {
    await verifyCars();
    await verifyUsers();
    
    console.log('\n✨ Verification complete!');
  } catch (error) {
    console.error('\n❌ Verification failed:', error);
  }
}

if (require.main === module) {
  main().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { verifyCars, verifyUsers };
