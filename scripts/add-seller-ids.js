/**
 * Add Missing sellerId Field to Cars
 * إضافة حقل sellerId المفقود للسيارات القديمة
 * 
 * This script adds sellerId field to cars that don't have it.
 * It tries to match with existing users by email or other fields.
 */

const admin = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();

/**
 * Try to find the seller ID for a car
 */
async function findSellerId(carData) {
  // 1. Check if userId exists (legacy field)
  if (carData.userId) {
    return carData.userId;
  }
  
  // 2. Check if ownerId exists (legacy field)
  if (carData.ownerId) {
    return carData.ownerId;
  }
  
  // 3. Try to find by sellerEmail
  if (carData.sellerEmail) {
    const userQuery = await db.collection('users')
      .where('email', '==', carData.sellerEmail)
      .limit(1)
      .get();
    
    if (!userQuery.empty) {
      return userQuery.docs[0].id;
    }
  }
  
  // 4. Try to find by sellerPhone
  if (carData.sellerPhone) {
    const phoneQuery = await db.collection('users')
      .where('phoneNumber', '==', carData.sellerPhone)
      .limit(1)
      .get();
    
    if (!phoneQuery.empty) {
      return phoneQuery.docs[0].id;
    }
  }
  
  // 5. Default to first admin/test user if no match found
  console.log('  ⚠️ Could not find seller, using default user');
  const defaultUser = await db.collection('users')
    .where('email', '==', 'globulinternet@gmail.com')
    .limit(1)
    .get();
  
  if (!defaultUser.empty) {
    return defaultUser.docs[0].id;
  }
  
  // 6. If still no match, use the first user in the system
  const anyUser = await db.collection('users').limit(1).get();
  if (!anyUser.empty) {
    return anyUser.docs[0].id;
  }
  
  return null;
}

/**
 * Fix a single car document
 */
async function fixCarSellerId(doc) {
  const data = doc.data();
  
  // Skip if already has sellerId
  if (data.sellerId) {
    console.log(`  ✅ Already has sellerId: ${data.sellerId}`);
    return false;
  }
  
  // Find the seller ID
  console.log(`  🔍 Finding sellerId...`);
  const sellerId = await findSellerId(data);
  
  if (!sellerId) {
    console.log(`  ❌ Could not find seller ID for this car!`);
    return false;
  }
  
  // Update the document
  await doc.ref.update({
    sellerId: sellerId,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  console.log(`  ✅ Added sellerId: ${sellerId}\n`);
  return true;
}

/**
 * Main function
 */
async function addSellerIds() {
  console.log('🔧 Adding sellerId to cars without it...\n');
  
  try {
    // Get all cars
    const carsSnapshot = await db.collection('cars').get();
    console.log(`📦 Found ${carsSnapshot.size} cars to check\n`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Process each car
    for (const doc of carsSnapshot.docs) {
      const data = doc.data();
      console.log(`🚗 Checking: ${data.make} ${data.model} (ID: ${doc.id})`);
      
      const wasUpdated = await fixCarSellerId(doc);
      if (wasUpdated) {
        updatedCount++;
      } else {
        skippedCount++;
      }
    }
    
    console.log('\n✅ Update complete!');
    console.log(`  - Updated: ${updatedCount} cars`);
    console.log(`  - Skipped: ${skippedCount} cars (already had sellerId)`);
    console.log(`  - Total: ${carsSnapshot.size} cars\n`);
    
    console.log('📝 Next step: Deploy Firestore indexes');
    console.log('   Run: firebase deploy --only firestore:indexes\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
  
  process.exit(0);
}

// Run the fix
addSellerIds();
