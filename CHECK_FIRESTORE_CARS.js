// Quick script to check Firestore for cars
// Run: node CHECK_FIRESTORE_CARS.js

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./service-account-key.json'); // You need to add this file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkCars() {
  console.log('🔍 Checking Firestore for cars...\n');
  
  const collections = [
    'cars',
    'passenger_cars',
    'suvs',
    'vans',
    'motorcycles',
    'trucks',
    'buses'
  ];
  
  let totalCars = 0;
  
  for (const collectionName of collections) {
    try {
      const snapshot = await db.collection(collectionName).limit(10).get();
      console.log(`📦 ${collectionName}: ${snapshot.size} documents (showing first 10)`);
      
      if (snapshot.size > 0) {
        totalCars += snapshot.size;
        snapshot.docs.forEach((doc, idx) => {
          const data = doc.data();
          console.log(`  ${idx + 1}. ${doc.id}:`, {
            make: data.make,
            model: data.model,
            year: data.year,
            price: data.price,
            status: data.status,
            isActive: data.isActive,
            isSold: data.isSold
          });
        });
      }
      console.log('');
    } catch (error) {
      console.error(`❌ Error checking ${collectionName}:`, error.message);
    }
  }
  
  console.log(`\n📊 Total cars found: ${totalCars}`);
  
  if (totalCars === 0) {
    console.log('\n⚠️ NO CARS FOUND IN ANY COLLECTION!');
    console.log('You need to add cars to Firestore first.');
  }
  
  process.exit(0);
}

checkCars().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
