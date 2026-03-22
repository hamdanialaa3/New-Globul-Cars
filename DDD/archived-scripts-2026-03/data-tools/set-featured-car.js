/**
 * Set Featured Car Script (Admin SDK)
 * 
 * Purpose: Set isFeatured = true using Firebase Admin SDK to bypass security rules.
 */

const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Service Account Path - Found via search
const serviceAccountPath = '../firebase-service-account.json';

try {
    const serviceAccount = require(serviceAccountPath);

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
} catch (error) {
    console.error(`❌ Service Account not found at ${serviceAccountPath}`);
    console.error('Error details:', error.message);
    process.exit(1);
}

const db = getFirestore();

const VEHICLE_COLLECTIONS = [
    'cars',             // Legacy collection
    'passenger_cars',   // Personal cars
    'suvs',             // SUVs/Jeeps
    'vans',             // Vans/Cargo
    'motorcycles',      // Motorcycles
    'trucks',           // Trucks
    'buses'             // Buses
];

async function main() {
    console.log('🚀 Starting set-featured-car script (Admin Mode)...');

    try {
        let specificCarFound = false;

        // Iterate through all collections to find the NEWEST car overall
        for (const collectionName of VEHICLE_COLLECTIONS) {
            console.log(`Checking collection: ${collectionName}...`);

            const snapshot = await db.collection(collectionName)
                .orderBy('createdAt', 'desc')
                .limit(1)
                .get();

            if (!snapshot.empty) {
                const carDoc = snapshot.docs[0];
                console.log(`✅ Found recent car in ${collectionName}: ${carDoc.id}`);

                await db.collection(collectionName).doc(carDoc.id).update({
                    isFeatured: true,
                    updatedAt: new Date()
                });

                console.log(`🔥 Successfully set isFeatured=true for car ${carDoc.id}`);
                specificCarFound = true;
                break;
            } else {
                console.log(`   No cars found in ${collectionName}`);
            }
        }

        if (!specificCarFound) {
            console.warn('⚠️ No cars found in any collection to feature.');
        }

    } catch (error) {
        console.error('❌ Error setting featured car:', error);
        process.exit(1);
    }
}

main().then(() => {
    console.log('🎉 Done.');
    process.exit(0);
});
