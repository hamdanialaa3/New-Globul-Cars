/**
 * Quick Firestore Data Check Script
 * فحص سريع للبيانات في Firestore
 */

const admin = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();

async function checkData() {
  console.log('🔍 Checking Firestore data...\n');
  
  try {
    // Check cars collection
    const carsSnapshot = await db.collection('cars').limit(10).get();
    console.log(`📦 Cars collection: ${carsSnapshot.size} documents (showing first 10)`);
    if (carsSnapshot.size > 0) {
      carsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  - ${doc.id}: ${data.make} ${data.model} (${data.year})`);
      });
    }
    console.log('');
    
    // Check users collection
    const usersSnapshot = await db.collection('users').limit(10).get();
    console.log(`👤 Users collection: ${usersSnapshot.size} documents (showing first 10)`);
    if (usersSnapshot.size > 0) {
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  - ${doc.id}: ${data.email || data.displayName || 'No email'}`);
      });
    }
    console.log('');
    
    // Get total counts
    const carsCountSnapshot = await db.collection('cars').count().get();
    const usersCountSnapshot = await db.collection('users').count().get();
    
    console.log('📊 Total counts:');
    console.log(`  - Total cars: ${carsCountSnapshot.data().count}`);
    console.log(`  - Total users: ${usersCountSnapshot.data().count}`);
    
    // Check recent activity with FULL FIELD DETAILS
    const recentCars = await db.collection('cars')
      .orderBy('createdAt', 'desc')
      .limit(3)
      .get();
    
    console.log('\n🕐 Recent cars (last 3) - FULL DETAILS:');
    if (recentCars.size > 0) {
      recentCars.forEach(doc => {
        const data = doc.data();
        const date = data.createdAt?.toDate() || 'Unknown date';
        console.log(`\n  🚗 ${data.make} ${data.model} (${date})`);
        console.log(`     - ID: ${doc.id}`);
        console.log(`     - Status: ${data.status || '⚠️ MISSING!'}`);
        console.log(`     - isActive: ${data.isActive !== undefined ? data.isActive : '⚠️ MISSING!'}`);
        console.log(`     - Region: ${data.region || '⚠️ MISSING!'}`);
        console.log(`     - City: ${data.city || 'N/A'}`);
        console.log(`     - LocationData: ${data.locationData ? JSON.stringify(data.locationData.cityName) : '⚠️ MISSING!'}`);
        console.log(`     - Price: ${data.price || 'N/A'} BGN`);
        console.log(`     - SellerType: ${data.sellerType || 'N/A'}`);
        console.log(`     - SellerId: ${data.sellerId || '⚠️ MISSING!'}`);
        console.log(`     - UserId: ${data.userId || '⚠️ MISSING!'}`);
        console.log(`     - OwnerId: ${data.ownerId || 'N/A'}`);
      });
    } else {
      console.log('  ⚠️ No cars found!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

checkData();
