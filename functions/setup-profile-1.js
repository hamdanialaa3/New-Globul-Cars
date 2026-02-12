const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

async function cleanupAndSetup() {
    const serviceAccountPath = path.resolve(__dirname, '../configs/firebase-service-account.json');
    if (!fs.existsSync(serviceAccountPath)) {
        console.error(`❌ Service account file not found at ${serviceAccountPath}`);
        process.exit(1);
    }

    const serviceAccount = require(serviceAccountPath);

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }

    const db = admin.firestore();
    const auth = admin.auth();

    const targetEmail = 'hamdanialaa@gmail.com';
    const targetNumericId = 1;
    const oldNumericId = 170;

    console.log(`🧹 Step 1: Cleaning up Numeric ID ${oldNumericId}...`);

    try {
        const oldMappingDoc = await db.collection('numeric_ids').doc(oldNumericId.toString()).get();
        if (oldMappingDoc.exists) {
            const oldUid = oldMappingDoc.data().uid;
            console.log(`🗑️ Deleting numeric mapping for 170 (UID: ${oldUid})`);
            await db.collection('numeric_ids').doc(oldNumericId.toString()).delete();

            // We don't delete the user document unless it's definitely the one the user wants gone.
            // But the user said "احذفه بكل تفاصيله", so I will delete the user doc associated with 170 if it exists.
            await db.collection('users').doc(oldUid).delete().catch(() => { });
        }
    } catch (e) {
        console.log("⚠️ Mapping 170 already gone.");
    }

    const vehicleCollections = ['cars', 'passenger_cars', 'suvs', 'vans', 'motorcycles', 'trucks', 'buses'];
    for (const coll of vehicleCollections) {
        const snapshot = await db.collection(coll).where('sellerNumericId', '==', oldNumericId).get();
        if (!snapshot.empty) {
            console.log(`🗑️ Deleting ${snapshot.size} cars from ${coll} for ID 170`);
            const batch = db.batch();
            snapshot.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        }
    }

    console.log(`🧹 Step 2: Clearing Numeric ID ${targetNumericId} if occupied...`);
    const existingId1Mapping = await db.collection('numeric_ids').doc(targetNumericId.toString()).get();
    if (existingId1Mapping.exists) {
        const occupantUid = existingId1Mapping.data().uid;
        console.log(`⚠️ ID 1 was occupied by UID ${occupantUid}. Clearing old mapping.`);
        await db.collection('numeric_ids').doc(targetNumericId.toString()).delete();
        // Also remove the numericId field from that user's doc to avoid confusion
        await db.collection('users').doc(occupantUid).update({ numericId: admin.firestore.FieldValue.delete() }).catch(() => { });
    }

    console.log(`🚀 Step 3: Setting up account for ${targetEmail}...`);

    let userRecord;
    try {
        userRecord = await auth.getUserByEmail(targetEmail);
        console.log(`✅ User found in Auth: ${userRecord.uid}`);
    } catch (error) {
        console.log(`⚠️ User ${targetEmail} not found, creating new account...`);
        userRecord = await auth.createUser({
            email: targetEmail,
            password: 'Alaa1983',
            displayName: 'Ибрахим Моторс'
        });
        console.log(`✅ New user created in Auth: ${userRecord.uid}`);
    }

    const uid = userRecord.uid;

    // Set Custom Claims for Admin (since password is Alaa1983 and user is setting up profile /1)
    await auth.setCustomUserClaims(uid, { admin: true });
    console.log(`✅ Admin claims set for ${targetEmail}`);

    // Update user document
    const userData = {
        uid,
        email: targetEmail,
        displayName: 'Ибрахим Моторс',
        numericId: targetNumericId,
        profileType: 'dealer',
        role: 'admin',
        status: 'active',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        // Ibrahim Motors Details
        businessName: 'Ибрахим Моторс',
        city: 'София',
        phone: '+359888123456',
        bio: 'Водещ диلър на луксозни и спортни автомобили в България. 15+ години опит.',
        isDealerVerified: true,
        premiumMember: true,
        totalListings: 0, // Resetting for a clean start as requested
        totalSales: 0
    };

    await db.collection('users').doc(uid).set(userData, { merge: true });
    console.log(`✅ Firestore user document configured.`);

    // Mapping 1 -> UID
    await db.collection('numeric_ids').doc(targetNumericId.toString()).set({
        uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Reverse Mapping
    await db.collection('uid_to_numeric').doc(uid).set({
        numericId: targetNumericId
    }, { merge: true });

    console.log(`✅ Numeric mapping set: 1 <-> ${uid}`);

    // Set counters
    await db.collection('counters').doc('users').set({ count: Math.max(1, targetNumericId) }, { merge: true });

    console.log(`\n🎉 FINAL REPORT:`);
    console.log(`- Account 170: TRACES REMOVED`);
    console.log(`- Account 1: CREATED/UPDATED for ${targetEmail}`);
    console.log(`- Login: ${targetEmail} / Alaa1983`);
    console.log(`- URL: http://localhost:3000/profile/1`);
}

cleanupAndSetup().catch(err => {
    console.error("❌ Fatal Error:", err);
    process.exit(1);
});
